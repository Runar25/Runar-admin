// stats.js — provozní přehled čtení. Čte JEN to, co už v DB je.
//
// Proč vzniklo (KUKY 2026-08-15): „i teď nepoužitelná data můžou mít cenu zlata za pár
// měsíců." Sledování objemu nepotřebuje žádnou novou infrastrukturu — každé čtení už je
// řádek v `readings` s časem. Tenhle skript jen klade otázky, které se budou hodit,
// až přijdou testeři: kdy lidé čtou, kdy je špička, roste to.
//
// NEUKLÁDÁ nic a NEEXPORTUJE osobní údaje — jen agregáty. `user_id` se nikdy netiskne
// (repo je veřejné, RUNAR_PRIVACY.md); počítá se jen kolik různých jich bylo.
//
//   node scripts/utils/stats.js            # posledních 30 dní
//   node scripts/utils/stats.js --dny 90
//   node scripts/utils/stats.js --json     # strojově, pro pozdější graf
const { execSync } = require('child_process');
const fs = require('fs'), os = require('os'), path = require('path');

const argv = process.argv.slice(2);
const DNY = Number(argv[argv.indexOf('--dny') + 1]) || 30;
const JSON_OUT = argv.includes('--json');

function q(sql) {
  const tmp = path.join(os.tmpdir(), 'runar_stats_' + Date.now() + '.sql');
  fs.writeFileSync(tmp, sql, 'utf8');
  try {
    // --workdir: bez nej supabase hleda projekt v aktualni slozce a skript bezel jen z korene repa (2026-09-24).
    const out = execSync('supabase --workdir "' + path.join(__dirname, '..', '..') + '" db query --linked -f "' + tmp + '"',
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 24 });
    const m = out.match(/\[[\s\S]*\]/);
    return m ? JSON.parse(m[0]) : [];
  } catch (e) {
    console.error('  ✗ dotaz selhal: ' + String(e.message || e).slice(0, 200));
    console.error('    (potřebuje `supabase db query --linked` — zkontroluj přihlášení)');
    process.exit(1);
  } finally { try { fs.unlinkSync(tmp); } catch (e) { /* uklizeno jinde */ } }
}

const OD = "now() - interval '" + DNY + " days'";

const celkem = q('select count(*) n, count(distinct user_id) lidi,' +
  ' min(drawn_at)::date od, max(drawn_at)::date do from public.readings;')[0];

const denne = q('select drawn_at::date den, count(*) n, count(distinct user_id) lidi' +
  ' from public.readings where drawn_at >= ' + OD + ' group by 1 order by 1;');

const hodiny = q("select extract(hour from drawn_at at time zone 'Atlantic/Reykjavik')::int h," +
  ' count(*) n from public.readings where drawn_at >= ' + OD + ' group by 1 order by 1;');

const dny = q("select trim(to_char(drawn_at at time zone 'Atlantic/Reykjavik','Day')) d," +
  " extract(isodow from drawn_at at time zone 'Atlantic/Reykjavik')::int i, count(*) n" +
  ' from public.readings where drawn_at >= ' + OD + ' group by 1,2 order by 2;');

const jazyk = q('select coalesce(lang,'+"'?'"+') lang, count(*) n from public.readings' +
  ' where drawn_at >= ' + OD + ' group by 1 order by 2 desc;');

const kvalita = q('select count(*) n, count(prompt_draws) s_draws,' +
  ' count(*) filter (where spread_data is not null) spready' +
  ' from public.readings where drawn_at >= ' + OD + ';')[0];

// ── Náklady a cache (CODE-read 2026-09-24) ──────────────────────────────────────────────
// PŘESNÁ cena z `readings.usage` (tokeny, které API vrátilo u každého čtení; proxy je ukládá od 2026-08-15)
// × ceník ověřený 2026-09-24 na platform.claude.com/docs/en/about-claude/pricing. Owner: „nechci odhady."
// Proč tady a ne ve zvláštním skriptu: sledování provozu (špička, růst) a cena patří k sobě — rozhodnutí
// 2026-08-15 „sběr dat před vizualizací". Do 2026-09-24 tu stálo „tokeny ani cache NEUKLÁDÁME" — zastaralé.
// Nový model → řádek do CENIK; model, který tu není, se nahlásí (nepočítá se potichu).
const CENIK = {   // USD / 1 M tokenů: [vstup, zápis cache 5 min, zápis 1 h, čtení cache, výstup]
  'claude-opus-5': [5, 6.25, 10, 0.5, 25],
  'claude-opus-4-8': [5, 6.25, 10, 0.5, 25],
  'claude-opus-4-7': [5, 6.25, 10, 0.5, 25],
};
// OpenAI (gpt-6-sol pro admin test cteni, owner 2026-09-24 „beru tvoje spojeni kroku"): jiny tvar usage —
// prompt_tokens (vcetne cachovanych), prompt_tokens_details.cached_tokens, completion_tokens.
// Cenik overen 2026-09-24 na developers.openai.com/api/docs/pricing (standard): vstup · vstup z cache · vystup za 1 M.
const CENIK_OPENAI = { 'gpt-6-sol': [2, 0.2, 10], 'gpt-6-luna': [0.1, 0.01, 0.5] };
function cenaUsage(u) {
  if (u.prompt_tokens != null) {
    const o = CENIK_OPENAI[u.model]; if (!o) return null;
    const ca = (u.prompt_tokens_details && u.prompt_tokens_details.cached_tokens) || 0;
    return ((u.prompt_tokens - ca) * o[0] + ca * o[1] + (u.completion_tokens || 0) * o[2]) / 1e6;
  }
  const c = CENIK[u.model]; if (!c) return null;
  const cc = u.cache_creation || {};
  const w5 = cc.ephemeral_5m_input_tokens != null ? cc.ephemeral_5m_input_tokens : (u.cache_creation_input_tokens || 0);
  return (u.inference_geo === 'us' ? 1.1 : 1) * ((u.input_tokens || 0) * c[0] + w5 * c[1] + (cc.ephemeral_1h_input_tokens || 0) * c[2]
    + (u.cache_read_input_tokens || 0) * c[3] + (u.output_tokens || 0) * c[4]) / 1e6;
}
// Samotest výpočtu na známém vstupu (§19.1): 1692 vstup + 152 výstup (Opus 4.8) = 0,01226 USD.
if (Math.abs(cenaUsage({ model: 'claude-opus-4-8', input_tokens: 1692, output_tokens: 152 }) - 0.01226) > 1e-9) { console.error('  ✗ výpočet ceny rozbitý'); process.exit(1); }
// ... a OpenAI: 1000 vstup (200 z cache) + 100 vystup na gpt-6-sol = (800·2 + 200·0,2 + 100·10) / 1 M = 0,00264 USD.
if (Math.abs(cenaUsage({ model: 'gpt-6-sol', prompt_tokens: 1000, prompt_tokens_details: { cached_tokens: 200 }, completion_tokens: 100 }) - 0.00264) > 1e-9) { console.error('  ✗ výpočet ceny OpenAI rozbitý'); process.exit(1); }
// Skupina: admin (ADMIN_EMAILS z v2/runar-config.js — jediny zdroj, §20) > tester (user_profiles.is_tester) > uzivatel.
// Owner 2026-09-24: „kolik nas stoji cteni — admin zvlast, testeri zvlast, uzivatele zvlast". Tiskne se jen soucet za skupinu.
const ADMINI = (fs.readFileSync(path.join(__dirname, '..', '..', 'v2', 'runar-config.js'), 'utf8').match(/const ADMIN_EMAILS\s*=\s*\[([^\]]*)\]/) || [, ''])[1]
  .split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(e => /^[^\s'@]+@[^\s'@]+$/.test(e));
if (!ADMINI.length) { console.error('  ✗ ADMIN_EMAILS v runar-config.js nenalezen — skupiny by byly spatne'); process.exit(1); }
const usageRows = q("select coalesce(r.lang,'?') lang, r.usage, r.follow_up, case when u.email in (" + ADMINI.map(e => "'" + e + "'").join(',')
  + ") then 'admin' when coalesce(p.is_tester, false) then 'tester' else 'uzivatel' end skupina"
  + ' from public.readings r left join auth.users u on u.id = r.user_id left join public.user_profiles p on p.id = r.user_id'
  + ' where r.drawn_at >= ' + OD + ' and r.usage is not null;');
const naklady = { skupiny: {}, podleSkupin: {}, ask: { n: 0, usd: 0, bez: 0 }, neznamy: [] };
for (const r of usageRows) {
  for (const f of (r.follow_up || [])) {
    if (f && f.usage && f.usage.model) { const c = cenaUsage(f.usage); if (c == null) naklady.neznamy.push(f.usage.model); else { naklady.ask.n++; naklady.ask.usd += c; } }
    else naklady.ask.bez++;
  }
  const u = r.usage; if (!u || !u.model) continue;
  const c = cenaUsage(u); if (c == null) { naklady.neznamy.push(u.model); continue; }
  const k = u.model + ' · ' + r.lang, g = naklady.skupiny[k] = naklady.skupiny[k] || { n: 0, usd: 0, zapis: 0, zasah: 0 };
  g.n++; g.usd += c; if (u.cache_creation_input_tokens) g.zapis++; if (u.cache_read_input_tokens) g.zasah++;
  const sg = naklady.podleSkupin[r.skupina] = naklady.podleSkupin[r.skupina] || { n: 0, usd: 0, ask: 0, askUsd: 0 };
  sg.n++; sg.usd += c;
  for (const f of (r.follow_up || [])) if (f && f.usage && f.usage.model && cenaUsage(f.usage) != null) { sg.ask++; sg.askUsd += cenaUsage(f.usage); }
}
// Kolik čtení přišlo do 5 min (a do 1 h) po PŘEDCHOZÍM čtení v témže jazyce — systémový prompt je pro všechny
// uživatele téhož jazyka stejný, takže cachi drží teplou kdokoli. To je strop zásahů cache při dnešním provozu.
const casy = q("select coalesce(lang,'?') lang, extract(epoch from drawn_at) t from public.readings where drawn_at >= " + OD + ' order by drawn_at;');
naklady.odstupy = {};
{ const posl = {};
  for (const r of casy) { const o = naklady.odstupy[r.lang] = naklady.odstupy[r.lang] || { n: 0, do5: 0, do60: 0 };
    const t = Number(r.t); if (posl[r.lang] != null) { o.n++; if (t - posl[r.lang] <= 300) o.do5++; if (t - posl[r.lang] <= 3600) o.do60++; } posl[r.lang] = t; } }
// Bod zvratu (přesně z ceníku): 5min cache se vyplatí, když zásahů > (1,25 − 1) / (1,25 − 0,1) = 21,7 %;
// 1h cache (zápis 2×), když zásahů > (2 − 1) / (2 − 0,1) = 52,6 %.
naklady.zlom5 = 0.25 / 1.15; naklady.zlom60 = 1 / 1.9;

const HTML_OUT = argv.includes('--html');
if (HTML_OUT) {
  // Vizualni verze: JEDEN sobestacny soubor, zadne CDN, zadny build. Otevre se v prohlizeci
  // a da se poslat. Grafy jsou inline SVG — schvalne, at to funguje i offline a at se to
  // da pozdeji vzit 1:1 do shrine zalozky, az bude provoz odpovidat tomu si ji postavit.
  const esc = (t) => String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;');
  const maxD = Math.max(1, ...denne.map(r=>Number(r.n)));
  const maxH = Math.max(1, ...hodiny.map(r=>Number(r.n)));
  const maxW = Math.max(1, ...dny.map(r=>Number(r.n)));
  const sloupce = (data, klic, popis, max, sirka) => {
    const W = 760, H = 190, pad = 28, bw = (W - pad*2) / Math.max(1, data.length);
    let sv = '<svg viewBox="0 0 '+W+' '+H+'" role="img">';
    sv += '<line x1="'+pad+'" y1="'+(H-24)+'" x2="'+(W-pad)+'" y2="'+(H-24)+'" class="ax"/>';
    data.forEach((r,i)=>{
      const n = Number(r[klic]||0), h = Math.round(n/max*(H-58));
      const x = pad + i*bw, y = H-24-h;
      sv += '<rect x="'+(x+bw*0.15)+'" y="'+y+'" width="'+(bw*0.7)+'" height="'+h+'" class="bar"><title>'+esc(popis(r))+': '+n+'</title></rect>';
      if (n === max) sv += '<text x="'+(x+bw/2)+'" y="'+(y-5)+'" class="lbl top">'+n+'</text>';
      if (data.length <= 26 || i % Math.ceil(data.length/14) === 0)
        sv += '<text x="'+(x+bw/2)+'" y="'+(H-8)+'" class="lbl">'+esc(popis(r))+'</text>';
    });
    return sv + '</svg>';
  };
  const vObdobi2 = denne.reduce((a,r)=>a+Number(r.n),0);
  let h = '<!doctype html><meta charset="utf-8"><title>Rúnar — provoz</title>';
  h += '<style>:root{--bg:#0d1219;--fg:#e8e2d4;--dim:#7c8798;--gold:#FFBF00;--card:#141b24}'
    + '*{box-sizing:border-box}body{margin:0;padding:28px;background:var(--bg);color:var(--fg);'
    + 'font:15px/1.55 Georgia,serif}h1{font-size:20px;letter-spacing:.14em;text-transform:uppercase;'
    + 'color:var(--gold);font-weight:400;margin:0 0 4px}h2{font-size:12px;letter-spacing:.16em;'
    + 'text-transform:uppercase;color:var(--dim);font-weight:400;margin:26px 0 8px}'
    + '.sub{color:var(--dim);margin:0 0 22px;font-size:13px}.wrap{max-width:820px;margin:0 auto}'
    + '.cards{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:8px}'
    + '.c{background:var(--card);border:1px solid #1e2836;border-radius:8px;padding:12px 16px;flex:1 1 150px}'
    + '.c b{display:block;font-size:26px;color:var(--gold);font-weight:400;font-variant-numeric:tabular-nums}'
    + '.c span{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim)}'
    + 'svg{width:100%;height:auto;background:var(--card);border:1px solid #1e2836;border-radius:8px}'
    + '.bar{fill:var(--gold);opacity:.82}.bar:hover{opacity:1}.ax{stroke:#26303e}'
    + '.lbl{fill:var(--dim);font:10px sans-serif;text-anchor:middle}.top{fill:var(--gold)}'
    + '.note{color:var(--dim);font-size:13px;border-left:2px solid #26303e;padding-left:12px;margin-top:8px}'
    + '@media(prefers-color-scheme:light){:root{--bg:#faf8f3;--fg:#1a1a1a;--dim:#6b7280;--card:#fff}.ax{stroke:#d8d3c8}}'
    + '</style><div class=wrap>';
  h += '<h1>Rúnar — provoz</h1><p class=sub>Posledních '+DNY+' dní · vygenerováno '
    + new Date().toISOString().slice(0,16).replace('T',' ')+' · <code>node scripts/utils/stats.js --html</code></p>';
  const spicka = hodiny.slice().sort((a,b)=>b.n-a.n)[0];
  h += '<div class=cards>'
    + '<div class=c><b>'+vObdobi2+'</b><span>čtení za období</span></div>'
    + '<div class=c><b>'+(vObdobi2/DNY).toFixed(1)+'</b><span>průměr na den</span></div>'
    + '<div class=c><b>'+celkem.lidi+'</b><span>lidí celkem</span></div>'
    + '<div class=c><b>'+(spicka?String(spicka.h).padStart(2,'0')+':00':'—')+'</b><span>špička (IS čas)</span></div>'
    + '</div>';
  h += '<h2>Po dnech</h2>'+sloupce(denne,'n',r=>String(r.den).slice(5),maxD);
  h += '<h2>Kdy se čte — hodina, islandský čas</h2>'
    + sloupce(Array.from({length:24},(_,i)=>({h:i,n:(hodiny.find(x=>Number(x.h)===i)||{n:0}).n})),'n',r=>String(r.h).padStart(2,'0'),maxH);
  h += '<h2>Podle dne v týdnu</h2>'+sloupce(dny,'n',r=>String(r.d).slice(0,3),maxW);
  h += '<h2>Co o těch čteních víme</h2><p class=note>'
    + 'S <code>prompt_draws</code> (které páky padly): <b>'+kvalita.s_draws+'</b> z '+kvalita.n+'.<br>'
    + 'Jazyky: '+jazyk.map(r=>esc(r.lang)+' '+r.n).join(' · ')+'.<br>'
    + 'Tohle je snímek ke dni, ne živý panel — přegeneruj příkazem výš.</p>';
  h += '</div>';
  const out = 'runar-provoz.html';
  fs.writeFileSync(out, h, 'utf8');
  console.log('  ✓ ' + out + '  (' + Math.round(h.length/1024) + ' kB, otevři v prohlížeči)');
  process.exit(0);
}

if (JSON_OUT) {
  console.log(JSON.stringify({ dny: DNY, celkem, denne, hodiny, tydne: dny, jazyk, kvalita, naklady }, null, 1));
  process.exit(0);
}

const bar = (n, max, sirka) => '█'.repeat(Math.max(n > 0 ? 1 : 0, Math.round(n / (max || 1) * sirka)));

console.log('\n  ══ RÚNAR — provoz, posledních ' + DNY + ' dní ══\n');
console.log('  celkem v DB: ' + celkem.n + ' čtení · ' + celkem.lidi + ' lidí · ' + celkem.od + ' → ' + celkem.do);

const vObdobi = denne.reduce((a, r) => a + Number(r.n), 0);
console.log('  za období : ' + vObdobi + ' čtení · průměr ' + (vObdobi / DNY).toFixed(1) + '/den');

if (denne.length) {
  const max = Math.max(...denne.map((r) => Number(r.n)));
  console.log('\n  ── po dnech ' + '─'.repeat(30));
  denne.slice(-14).forEach((r) => console.log('  ' + r.den + '  ' + String(r.n).padStart(3) + ' ' + bar(Number(r.n), max, 34)));
  if (denne.length > 14) console.log('  (zobrazeno posledních 14 z ' + denne.length + ' dní s provozem)');
}

if (hodiny.length) {
  const max = Math.max(...hodiny.map((r) => Number(r.n)));
  const top = hodiny.slice().sort((a, b) => b.n - a.n)[0];
  console.log('\n  ── kdy se čte (hodina, islandský čas) ' + '─'.repeat(10));
  for (let h = 0; h < 24; h++) {
    const r = hodiny.find((x) => Number(x.h) === h);
    const n = r ? Number(r.n) : 0;
    console.log('  ' + String(h).padStart(2, '0') + ':00 ' + String(n).padStart(3) + ' ' + bar(n, max, 30));
  }
  console.log('  špička: ' + String(top.h).padStart(2, '0') + ':00 (' + top.n + ' čtení)');
}

if (dny.length) {
  const max = Math.max(...dny.map((r) => Number(r.n)));
  console.log('\n  ── podle dne v týdnu ' + '─'.repeat(24));
  dny.forEach((r) => console.log('  ' + String(r.d).padEnd(10) + String(r.n).padStart(3) + ' ' + bar(Number(r.n), max, 30)));
}

console.log('\n  ── jazyk ' + '─'.repeat(36));
jazyk.forEach((r) => console.log('  ' + String(r.lang).padEnd(4) + String(r.n).padStart(4) +
  '  ' + Math.round(r.n / (vObdobi || 1) * 100) + ' %'));

console.log('\n  ── co o těch čteních víme ' + '─'.repeat(19));
console.log('  s prompt_draws (které páky padly): ' + kvalita.s_draws + ' z ' + kvalita.n);
console.log('  spready                          : ' + kvalita.spready);
console.log('\n  ── náklady (přesně z readings.usage × ceník) ' + '─'.repeat(2));
let nkCelkem = 0;
for (const [k, g] of Object.entries(naklady.skupiny).sort()) {
  nkCelkem += g.usd;
  console.log('  ' + k.padEnd(22) + String(g.n).padStart(4) + ' čtení · $' + g.usd.toFixed(4) + ' · průměr $' + (g.usd / g.n).toFixed(5)
    + ' · cache zápis/zásah ' + g.zapis + '/' + g.zasah);
}
console.log('  čtení celkem $' + nkCelkem.toFixed(4) + ' · Ask s usage ' + naklady.ask.n + (naklady.ask.n ? ' · $' + naklady.ask.usd.toFixed(4) : '') + ' (bez usage ' + naklady.ask.bez + ')');
if (naklady.neznamy.length) console.log('  ⚠ model bez ceny v CENIK (nezapočítáno): ' + [...new Set(naklady.neznamy)].join(', '));
console.log('  podle skupin (admin · tester · uzivatel):');
for (const s of ['admin', 'tester', 'uzivatel']) { const g = naklady.podleSkupin[s] || { n: 0, usd: 0, ask: 0, askUsd: 0 };
  console.log('    ' + s.padEnd(9) + String(g.n).padStart(4) + ' čtení · $' + g.usd.toFixed(4) + (g.n ? ' · průměr $' + (g.usd / g.n).toFixed(5) : '')
    + (g.ask ? ' · Ask ' + g.ask + ' · $' + g.askUsd.toFixed(4) : '')); }
console.log('  (hlas ElevenLabs zatím nejde rozdělit — proxy neukládá znaky; backlog)');
console.log('\n  ── cache: jak často přijde čtení včas ' + '─'.repeat(8));
for (const [l, o] of Object.entries(naklady.odstupy)) if (o.n)
  console.log('  ' + l.padEnd(4) + ' do 5 min po předchozím: ' + Math.round(o.do5 / o.n * 100) + ' %  · do 1 h: ' + Math.round(o.do60 / o.n * 100) + ' %  (' + o.n + ' odstupů)');
console.log('  vyplatí se: 5min cache nad ' + (naklady.zlom5 * 100).toFixed(1) + ' % · 1h cache nad ' + (naklady.zlom60 * 100).toFixed(1) + ' % (bod zvratu z ceníku)\n');
