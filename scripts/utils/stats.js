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
    const out = execSync('supabase db query --linked -f "' + tmp + '"',
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
  console.log(JSON.stringify({ dny: DNY, celkem, denne, hodiny, tydne: dny, jazyk, kvalita }, null, 1));
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
console.log('  ⚠ tokeny ani cache NEUKLÁDÁME — proxy `usage` z odpovědi zahazuje.');
console.log('    Bez toho nejde říct, co čtení stálo ani jestli se trefuje do cache.\n');
