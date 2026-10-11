// verify_tree_prod_sync.js — smoke ㊶: strom v aplikaci (v2/runar-tree-prod.js) = výstup generátoru z AKTUÁLNÍHO labu.
//
// Proč (2026-10-11, CODE-tree, port stromu do aplikace): od portu je strom v aplikaci kód labu — build_tree_production.py bere skript
// labu (build_crown_composer.py) doslova. Změna labu se ale do aplikace dostane, jen když se generátor pustí a jeho výstup commitne;
// jinak produkce tiše zůstane na staré verzi a owner na svých čteních vidí jiný strom, než jaký se ladí v labu (KUKY 2026-10-11:
// „úprav ještě bude určitě pár, ale to už můžeme ladit s produkcí dohromady“). Stroj místo paměti (CLAUDE.md §30).
// Co tvrdí: výstup generátoru (do dočasné složky, RUNAR_PROD_DST) je bajt po bajtu tentýž jako v2/runar-tree-prod.js (konce řádků
// srovnané — git je při checkoutu může převést). Netvrdí nic o tom, jak strom vypadá (to ㉳ verify_tree_mista na labu).
// Útok: scripts/protipriklady.py → PRIPADY (změna labu bez nového výstupu musí kontrolu shodit).
//   node scripts/verify_tree_prod_sync.js
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'prod-sync-')), out = path.join(tmp, 'runar-tree-prod.js');
try {
  const r = cp.spawnSync('python', ['-X', 'utf8', path.join(ROOT, 'build_tree_production.py')],
    { encoding: 'utf8', env: Object.assign({}, process.env, { RUNAR_PROD_DST: out }) });
  if (r.status !== 0 || !fs.existsSync(out)) {
    console.log('FAIL  generator stromu pro aplikaci selhal: ' + String(r.stderr || r.stdout || '').trim().slice(-400));
    process.exit(1);
  }
  const lf = (s) => s.replace(/\r\n/g, '\n');
  const gen = lf(fs.readFileSync(out, 'utf8')), cur = lf(fs.readFileSync(path.join(ROOT, 'v2', 'runar-tree-prod.js'), 'utf8'));
  if (gen !== cur) {
    let i = 0; while (i < gen.length && gen[i] === cur[i]) i++;
    const radek = cur.slice(0, i).split('\n').length;
    console.log('FAIL  strom v aplikaci se rozešel s labem (v2/runar-tree-prod.js ř. ' + radek + ' ≠ výstup generátoru) — lab se změnil, '
      + 'aplikace ne: python -X utf8 build_tree_production.py a commitni v2/runar-tree-prod.js');
    process.exit(1);
  }
  console.log('OK    strom v aplikaci = lab (v2/runar-tree-prod.js je výstup build_tree_production.py z aktuálního labu)');
} finally {
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
}
