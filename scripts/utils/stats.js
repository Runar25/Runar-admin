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
