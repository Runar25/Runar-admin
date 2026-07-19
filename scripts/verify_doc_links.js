// Odkaz do prázdna = doc, který posílá čtenáře na neexistující soubor.
//
// 2026-07-18 jich audit našel několik naráz: `RUNAR_DOC_SYNC.md` (nikdy neexistoval
// pod tím jménem), `RUNAR_TREE_LAB.md` vedený jako živý doménový doc (byl v archivu),
// cesty `scripts/utils/smoke.py` (nástroje jsou v kořeni). Každý z nich poslal
// nějakou session hledat něco, co tam není — a ta si pak našla náhradu jinde,
// nejčastěji v zastaralé kopii. Rozšíření ⑪ (memory index) na celou dokumentaci.
//
// KONTROLUJE DVĚ VĚCI:
//   1. markdown odkazy [text](cesta) — musí sedět relativně k tomu docu
//   2. cesty v backtickách `neco.md` / `scripts/neco.js` — soubor toho jména
//      musí v repu existovat (kdekoli; archiv se počítá — odkaz do archivu
//      je legitimní, pokud je označený)
//
//   node scripts/verify_doc_links.js
const { execSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const R = 'C:/Users/zkuku/Downloads/Runar-admin';

const tracked = execSync('git ls-files', { cwd: R, encoding: 'utf8', maxBuffer: 1 << 26 })
  .trim().split('\n').map(s => s.trim()).filter(Boolean);
const byBase = new Set(tracked.map(p => p.split('/').pop()));
const byPath = new Set(tracked);

// Existence NA DISKU, ne jen v gitu. Spousta legitimních odkazů míří na soubory,
// které v gitu schválně nejsou: `scripts/_patch.py` (scratch cesta, přepisuje se),
// `.claude/settings.json` (gitignored), untracked .py skripty v kořeni (konvence
// ownera, 2026-07-17: „ty untracked .py skripty v rootu nechávám"). Odkaz na ně
// není mrtvý — soubor tam je. Kontrola má hlídat prázdno, ne stav indexu.
const onDisk = (rel) => { try { return fs.existsSync(path.join(R, rel)); } catch (e) { return false; } };

// Živá dokumentace. RUNAR_DECISIONS.md a snapshots/ smí odkazovat na věci, které
// mezitím zanikly — jsou to záznamy k datu, ne návod, kam jít teď.
const docs = tracked.filter(p =>
  p.endsWith('.md') &&
  !p.startsWith('docs/archive/') &&
  !p.startsWith('memory/snapshots/') &&
  p !== 'RUNAR_DECISIONS.md');

// Vzory, které vypadají jako cesta, ale nejsou: glob masky, šablony, cizí balíčky.
const IGNORE = /[*{}<>$]|^https?:|^\.\.?$|node_modules|@|\bYYYY\b/;
const FILEISH = /^[\w][\w./-]*\.(?:md|js|ts|py|sql|html|css|json)$/;

const dead = [];

for (const doc of docs) {
  const abs   = path.join(R, doc);
  const dir   = path.dirname(doc);
  const lines = fs.readFileSync(abs, 'utf8').split('\n');

  lines.forEach((line, i) => {
    if (line.includes('doc-links:ok')) return;
    const at = doc + ':' + (i + 1);

    // 1) [text](cesta)
    for (const m of line.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      let target = m[1].split('#')[0].trim();
      if (!target || IGNORE.test(target)) continue;
      if (!FILEISH.test(target.split('/').pop() || '')) continue;
      const rel = path.posix.normalize(path.posix.join(dir.replace(/\\/g, '/'), target));
      if (!byPath.has(rel) && !byPath.has(target) && !byBase.has(target.split('/').pop())
          && !onDisk(rel) && !onDisk(target)) {
        dead.push({ at, ref: target, kind: 'markdown odkaz' });
      }
    }

    // 2) `cesta.md` v backtickách
    for (const m of line.matchAll(/`([^`]+)`/g)) {
      const ref = m[1].trim();
      if (IGNORE.test(ref) || ref.includes(' ')) continue;
      const base = ref.split('/').pop();
      if (!FILEISH.test(base)) continue;
      if (byPath.has(ref) || byBase.has(base)) continue;
      if (onDisk(ref)) continue;
      dead.push({ at, ref, kind: 'odkaz v textu' });
    }
  });
}

if (dead.length) {
  console.log('FAIL  ' + dead.length + ' odkaz(ů) míří na soubor, který neexistuje:');
  for (const d of dead) console.log('  · ' + d.at + '  ' + d.kind + ' → ' + d.ref);
  console.log('\n  Oprav cestu, nebo odkaz zruš. Odkaz do prázdna pošle čtenáře hledat');
  console.log('  náhradu — a ta se najde v zastaralé kopii. Záměrný případ: doc-links:ok');
  process.exit(1);
}

console.log('OK    doc odkazy: ' + docs.length + ' živých docs, žádný odkaz do prázdna');
process.exit(0);
