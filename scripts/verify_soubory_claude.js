// Smoke ㊉ — každý soubor appky v2/runar-*.js|html|css stojí v CLAUDE.md „Soubory a jejich zodpovědnost“ a nic tam nestojí navíc.
//
// Proč (2026-10-15, kolo 4 kontroly architektury, CODE-read): tabulka souborů je mapa, ze které každá session zjišťuje, kde co bydlí,
// ale nic ji nehlídalo. Chyběly v ní dva moduly shrine od dvou různých session: runar-testers-admin.js (CODE-tune 2026-10-11) a
// runar-payback-admin.js (CODE-read 2026-10-13) — kdo hledal „odkud bere shrine TESTERS“, v mapě nic nenašel. Podle §30 to dělá stroj.
// Co dělá: sekce od „## Soubory a jejich zodpovědnost“ po „## ABSOLUTNÍ PRAVIDLA“ (tabulka + load order) musí jmenovat každý
// v2/runar-*.js|.html|.css; holé jméno runar-* v té sekci (ne cesta s „/“) musí v v2/ existovat (smazaný soubor nesmí v mapě zůstat).
//   node scripts/verify_soubory_claude.js          · node scripts/verify_soubory_claude.js --test
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');

function sekce(md) {
  const a = md.indexOf('## Soubory a jejich zodpovědnost'), b = md.indexOf('## ABSOLUTNÍ PRAVIDLA');
  return a >= 0 && b > a ? md.slice(a, b) : '';
}
function porovnej(sek, soubory) {
  const chybi = soubory.filter((f) => !new RegExp('(^|[^A-Za-z0-9_.-])' + f.replace(/\./g, '\\.') + '(?![A-Za-z0-9_-])').test(sek));
  const jmena = new Set();
  for (const m of sek.matchAll(/(^|[^A-Za-z0-9_\/.-])(runar-[a-z0-9-]+\.(?:js|html|css))/g)) jmena.add(m[2]);
  const navic = [...jmena].filter((f) => !soubory.includes(f));
  return { chybi, navic };
}

if (process.argv.includes('--test')) {
  // Životní cyklus: soubor v mapě · nový soubor mimo mapu · soubor smazaný, v mapě zůstal · cesta do labu (tree-lab-x/runar-y.js)
  // se za holé jméno nepočítá · jméno, které je předponou jiného (runar-tree.js × runar-tree-prod.js), se nezamění.
  const sek = '## Soubory a jejich zodpovědnost\nrunar-app.js — x\nrunar-tree-prod.js — y\nrunar-gone.js — z\n→ tree-lab-a/runar-trunk.js\n## ABSOLUTNÍ PRAVIDLA';
  const r = porovnej(sekce(sek), ['runar-app.js', 'runar-tree-prod.js', 'runar-tree.js', 'runar-new.css']);
  const ok = JSON.stringify(r.chybi) === JSON.stringify(['runar-tree.js', 'runar-new.css']) && JSON.stringify(r.navic) === JSON.stringify(['runar-gone.js']);
  console.log(ok ? 'OK    samotest: nový soubor mimo mapu i smazaný v mapě chytí; cesta do labu a předpona jiného jména neplete'
    : 'FAIL  samotest ' + JSON.stringify(r));
  process.exit(ok ? 0 : 1);
}

const sek = sekce(fs.readFileSync(path.join(ROOT, 'CLAUDE.md'), 'utf8'));
if (!sek) { console.log('FAIL  CLAUDE.md: sekce „## Soubory a jejich zodpovědnost“ … „## ABSOLUTNÍ PRAVIDLA“ nenalezena'); process.exit(1); }
const soubory = fs.readdirSync(path.join(ROOT, 'v2')).filter((f) => /^runar-[a-z0-9-]+\.(js|html|css)$/.test(f)).sort();
const { chybi, navic } = porovnej(sek, soubory);
for (const f of chybi) console.log('FAIL  v2/' + f + ' chybí v CLAUDE.md „Soubory a jejich zodpovědnost“ — dopiš řádek (co soubor vlastní)');
for (const f of navic) console.log('FAIL  CLAUDE.md „Soubory…“ jmenuje ' + f + ', ale v v2/ není — smaž řádek nebo oprav jméno');
const bad = chybi.length + navic.length;
console.log(bad ? 'FAIL  mapa souborů v CLAUDE.md nesedí s v2/ (' + bad + ')'
  : 'OK    mapa souborů v CLAUDE.md sedí s v2/ (' + soubory.length + ' souborů runar-*)');
process.exit(bad ? 1 : 0);
