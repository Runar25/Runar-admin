// ㉞ STAV SDÍLENÉHO STROMU
//
// PROC: v repu pracuji tri CODE session naraz a dva stavy sdileneho stromu uz zpusobily skodu:
//  1) `v2/sw.js` zustava ve STAGI ve stare verzi. Pre-commit hook bumpne soubor, ale commit
//     s pathspec ho do commitu nevezme — v indexu tak lezi starsi verze nez v HEAD. 2026-08-02
//     z presne tohohle stavu vznikl produkcni downgrade v249->v248 (klienti servirovali stare
//     cteni). Nastalo to znovu 20. i 21. 8. Pre-commit ma guard proti downgradu, ale ten resi
//     az nasledek; tahle kontrola hlasi PRICINU, dokud je levna.
//  2) `.git/index.lock` po jine session. 21. 8. blokoval praci 20 minut. Kontrola ho jen
//     OHLASI i se starim — NIKDY nemaze: cizi lock muze patrit bezicimu commitu.
const { execSync } = require('child_process');
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');

const git = (a) => execSync('git ' + a, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
const verze = (t) => { const m = String(t).match(/v(\d+)/); return m ? parseInt(m[1], 10) : null; };

let fail = 0;
const radky = [];

// 1. sw.js: index vs HEAD
try {
  const vHead = verze(git('show HEAD:v2/sw.js'));
  const vIndex = verze(git('show :v2/sw.js'));
  const vStrom = verze(fs.readFileSync(path.join(ROOT, 'v2', 'sw.js'), 'utf8'));
  if (vHead && vIndex && vIndex !== vHead) {
    fail++;
    radky.push('sw.js: v INDEXU je v' + vIndex + ', v HEAD v' + vHead + ' (strom v' + vStrom + ')');
    radky.push('       Presne z tohohle stavu vznikl 2026-08-02 produkcni downgrade v249->v248.');
    radky.push('       Sroubek: `git restore --staged v2/sw.js` (obsah souboru nemeni).');
  } else if (vHead) {
    radky.push('ℹ  sw.js: index i HEAD na v' + vHead + ' — mina nenastrazena');
  }
} catch (e) {
  radky.push('ℹ  sw.js: stav indexu nelze zjistit (' + String(e.message).slice(0, 60) + ')');
}

// 2. cizi lock — hlasi, nemaze
try {
  const lock = path.join(ROOT, '.git', 'index.lock');
  if (fs.existsSync(lock)) {
    const min = Math.round((Date.now() - fs.statSync(lock).mtimeMs) / 60000);
    radky.push('⚠  .git/index.lock existuje (' + min + ' min). Jina session nejspis commituje.');
    radky.push('       ZIVY -> cekat; SIROTEK (>10 min, bez procesu) -> python -X utf8 scripts/git_zamek.py <lane> (KUKY 2026-08-23).');
  }
} catch (e) { /* lock neni podstatny pro verdikt */ }

// 2026-08-23: audit janitora sirotcich zamku (scripts/git_zamek.py, KUKY: vynutit
// odemceni) — uklizeny sirotek ma byt videt tady, ne zapadnout v .git/.
try {
  const zl = fs.readFileSync('C:/Users/zkuku/Downloads/Runar-admin/.git/runar-zamky.log', 'utf8')
    .trim().split('\n').slice(-2);
  for (const r of zl) console.log('       i  zamek-audit: ' + r.slice(0, 150));
} catch (e) { /* zadny audit = zadny sirotek */ }

if (!fail) {
  console.log('  OK    sdileny strom: zadna z minu (sw.js v indexu, cizi lock) nehrozi');
  radky.forEach((r) => console.log('       ' + r));
  process.exit(0);
}
console.log('  ' + fail + ' problem(u) ve sdilenem strome:');
radky.forEach((r) => console.log('       ' + r));
process.exit(1);
