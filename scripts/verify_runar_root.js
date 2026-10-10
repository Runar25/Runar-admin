// Smoke ㉿ — skript kontroly nesmí mít pevnou cestu k repu bez RUNAR_ROOT (jinak v pre-push kopii tiše kontroluje sdílený strom).
//
// Proč (2026-10-10, CODE-read, owner „3. ano, udělej to“, BACKLOG část 37): pre-push pouští smoke v DOČASNÉ ČISTÉ KOPII pushovaného
// commitu a kořen předává v RUNAR_ROOT. 46 skriptů mělo cestu `C:/Users/zkuku/Downloads/Runar-admin` natvrdo — v kopii by dál četly
// sdílený strom (s cizí rozdělanou prací) a celá oprava by byla jen na oko. Převedeny na `process.env.RUNAR_ROOT || '<cesta>'`
// (Python: `os.environ.get('RUNAR_ROOT', r'<cesta>')`). Tahle kontrola hlídá, ať nový skript pevnou cestu nevrátí.
// Co dělá: v scripts/**/*.js|py, smoke.py, check-*.py (mimo archive/ a sloty _patch*) najde řádek s pevnou cestou k repu, na kterém
// není RUNAR_ROOT. Cesty do `.git/` (zámky, log zámků) jsou výjimka — patří ke SDÍLENÉMU stromu, ne ke kopii; stejně tak záměrný
// odkaz na sdílený strom se značkou `sdileny-strom:ok <datum> <důvod>` na řádku.
//   node scripts/verify_runar_root.js          · node scripts/verify_runar_root.js --test
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const R = path.resolve(__dirname, '..');
const PEVNA = /C:[\\/]{1,2}Users[\\/]{1,2}zkuku[\\/]{1,2}Downloads[\\/]{1,2}Runar-admin(?![\\/]{1,2}\.git)/;
const ZNACKA = /sdileny-strom:ok\s+\d{4}-\d{2}-\d{2}\s+\S{3,}/;

function nalezy(text) {
  const out = [];
  text.split('\n').forEach((l, i) => {
    if (/^\s*(\/\/|#|\*)/.test(l)) return;                 // komentář
    if (PEVNA.test(l) && !/RUNAR_ROOT/.test(l) && !ZNACKA.test(l)) out.push(i + 1);
  });
  return out;
}

if (process.argv.includes('--test')) {
  const ok = nalezy("const R = 'C:/Users/zkuku/Downloads/Runar-admin';").length === 1
    && nalezy("ROOT = r'C:\\Users\\zkuku\\Downloads\\Runar-admin'").length === 1
    && nalezy("const R = (process.env.RUNAR_ROOT || 'C:/Users/zkuku/Downloads/Runar-admin') + '';").length === 0
    && nalezy("const z = fs.readFileSync('C:/Users/zkuku/Downloads/Runar-admin/.git/runar-zamky.log');").length === 0
    && nalezy("const S = 'C:/Users/zkuku/Downloads/Runar-admin';  // sdileny-strom:ok 2026-10-10 odkazy na negitované soubory").length === 0
    && nalezy("// viz C:/Users/zkuku/Downloads/Runar-admin/x").length === 0;
  console.log(ok ? 'OK    samotest: pevná cesta se pozná; RUNAR_ROOT, .git, značka a komentář ne' : 'FAIL  samotest');
  process.exit(ok ? 0 : 1);
}

const tracked = cp.execSync('git ls-files', { cwd: R, encoding: 'utf8' }).split('\n').filter(Boolean);
let fail = 0;
for (const f of tracked.filter((x) => (/^scripts\/.*\.(js|py)$/.test(x) || /^(smoke|check-[\w-]+)\.py$/.test(x))
  && !/(^|\/)archive\//.test(x) && !/_patch/.test(x) && !/verify_runar_root\.js$/.test(x))) {
  for (const n of nalezy(fs.readFileSync(path.join(R, f), 'utf8'))) {
    fail++;
    console.log('FAIL  ' + f + ':' + n + ' pevná cesta k repu bez RUNAR_ROOT — v pre-push kopii by kontroloval sdílený strom');
  }
}
console.log(fail ? 'FAIL  ' + fail + ' pevných cest k repu (použij process.env.RUNAR_ROOT || …, nebo značku sdileny-strom:ok <datum> <důvod>)'
  : 'OK    skripty kontrol berou kořen repa z RUNAR_ROOT (pre-push kopie kontroluje sebe, ne sdílený strom)');
process.exit(fail ? 1 : 0);
