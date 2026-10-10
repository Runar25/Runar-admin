// Smoke ㉾ — skript, který čte produkční `readings` k analýze, nesmí obejít odhlášení z analýzy (RUNAR_PRIVACY.md bod 4).
//
// Proč (2026-10-10, kontrola architektury část 31, CODE-read): zásady slibují „user s analytics_opt_out → jeho čtení se NEzahrnou
// do vieweru/evalu“. list-readings filtr měl, ale 11 skriptů ve scripts/ četlo `readings` napřímo a odhlášení nerespektovalo
// (nacti_cteni, monitor ozvěn, najdi_cteni, délky, slova oblastí…). Škoda nevznikla jen proto, že nikdo odhlášený nebyl (0 ze 4).
// Co dělá: v každém skriptu scripts/**/*.js|py (mimo složky archive/) najde řádek s `from readings` / `from public.readings`.
// Takový řádek je chyba — čtení pro analýzu jdou přes scripts/utils/cteni_analyza.sql (cteni_analyza.js). Výjimka (náklady,
// účetnictví, kde patří všechna čtení) = na řádku značka `opt-out:ok <datum> <důvod>`; značku bez data a důvodu tahle kontrola
// odmítne sama (⑲ hlídá jen HTML značky v docích).
//   node scripts/verify_opt_out.js          · node scripts/verify_opt_out.js --test
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const R = path.resolve(__dirname, '..');
const RE = /\bfrom\s+(public\.)?readings\b/i;
const ZNACKA = /opt-out:ok\s+\d{4}-\d{2}-\d{2}\s+\S{3,}/;

function nalezy(text) {
  const out = [];
  text.split('\n').forEach((l, i) => { if (RE.test(l) && !ZNACKA.test(l)) out.push(i + 1); });
  return out;
}

if (process.argv.includes('--test')) {
  // Životní cyklus: přímé čtení chyba · přes poddotaz ne · značka s datem a důvodem ne · holá značka ano · jiná tabulka ne.
  const ok = nalezy("q('select * from readings where x');").length === 1
    && nalezy('sql = "select id from public.readings order by 1"').length === 1
    && nalezy("q('select * from ' + CTENI + ' where x');").length === 0
    && nalezy("q('select sum(c) from readings'); // opt-out:ok 2026-10-10 náklady").length === 0
    && nalezy("q('select sum(c) from readings'); // opt-out:ok").length === 1
    && nalezy("q('select * from bug_reports');").length === 0
    && nalezy("q('select * from readings_archive');").length === 0;
  console.log(ok ? 'OK    samotest: přímé čtení readings se pozná; poddotaz, značka s důvodem a jiná tabulka ne; holá značka neplatí' : 'FAIL  samotest');
  process.exit(ok ? 0 : 1);
}

const tracked = cp.execSync('git ls-files', { cwd: R, encoding: 'utf8' }).split('\n').filter(Boolean);
let fail = 0;
for (const f of tracked.filter((x) => /^scripts\/.*\.(js|py)$/.test(x) && !/(^|\/)archive\//.test(x) && !/verify_opt_out\.js$/.test(x))) {
  for (const n of nalezy(fs.readFileSync(path.join(R, f), 'utf8'))) {
    fail++;
    console.log('FAIL  ' + f + ':' + n + ' čte readings napřímo — použij scripts/utils/cteni_analyza.sql (bez odhlášených), nebo značku opt-out:ok <datum> <důvod>');
  }
}
console.log(fail ? 'FAIL  ' + fail + ' čtení readings obchází odhlášení z analýzy (RUNAR_PRIVACY.md bod 4)'
  : 'OK    skripty čtou readings jen bez odhlášených z analýzy (nebo s odůvodněnou výjimkou)');
process.exit(fail ? 1 : 0);
