// ═══════════════════════════════════════════════════════
// RÚNAR · archive_batches.js — z generovaných dávek udělá TRVALÝ, čitelný archiv
//
// KUKY 2026-08-16: „ukládáš ta generovaná data tak, abychom je mohli dále použít?"
// Odpověď v ten den byla NE, a byla to díra:
//   · `eval_out/` je gitignorované (.gitignore:16) — dávky nepřežijí čistý clone,
//   · generovaná čtení NEVYTVÁŘEJÍ řádky v `readings` (gen_batch posílá `journal: null`),
//   takže ~230 čtení z 2026-08-16 žilo jen jako lokální soubory na jednom disku.
// Owner 2026-08-15: „i teď nepoužitelná data můžou mít cenu zlata za pár měsíců."
//
// CO TO DĚLÁ. Z JSONL dávek udělá KOMPAKTNÍ výtah — jen pole, ze kterých se dá znovu měřit:
//   rune · angle_idx · draws · without · lang · reading_text · batch · model · prompt_sha
// Vyhazuje se `prompt` (~1700 znaků na řádek): je rekonstruovatelný z gitu podle `prompt_sha`
// a `draws`, takže archivovat ho znamená ukládat totéž potřetí (§20). Výtah je ~15 % velikosti.
//
// ⚠️ NEPUBLIKUJE. Píše do `eval_out/archive/`, které je pořád gitignorované. Jestli archiv
// patří do PUBLIC repa, nebo do vlastní tabulky v Supabase, je rozhodnutí ownera — dokud
// nepadne, data aspoň nezmizí a jsou na jednom místě s manifestem.
//
//   node scripts/utils/archive_batches.js eval_out/*.jsonl
//   node scripts/utils/archive_batches.js --list
// ═══════════════════════════════════════════════════════
const fs = require('fs'), path = require('path');

const R = path.resolve(__dirname, '../..');
const OUT = path.join(R, 'eval_out', 'archive');
const MANIFEST = path.join(OUT, 'manifest.json');
const ARGS = process.argv.slice(2);

function loadManifest() {
  try { return JSON.parse(fs.readFileSync(MANIFEST, 'utf8')); } catch (e) { return { batches: {} }; }
}

if (ARGS.indexOf('--list') !== -1) {
  const m = loadManifest();
  const keys = Object.keys(m.batches).sort();
  if (!keys.length) { console.log('\n  archiv je prázdný\n'); process.exit(0); }
  let tot = 0;
  console.log('\n═══ ARCHIV DÁVEK ═══');
  for (const k of keys) {
    const b = m.batches[k]; tot += b.ok;
    console.log('  ' + k.padEnd(26) + b.ok + '/' + b.rows + ' čtení · ' + b.lang +
      ' · úhly ' + b.angles.join(',') + (b.without ? ' · without=' + b.without : '') +
      ' · ' + (b.model || '?'));
  }
  console.log('  ────\n  celkem ' + tot + ' použitelných čtení ve ' + keys.length + ' dávkách\n');
  process.exit(0);
}

const files = ARGS.filter(a => /\.jsonl$/i.test(a) && !/archive[\\/]/.test(a));
if (!files.length) { console.error('pouziti: archive_batches.js <davka.jsonl> ... | --list'); process.exit(1); }

fs.mkdirSync(OUT, { recursive: true });
const man = loadManifest();
let added = 0, skipped = 0;

for (const f of files) {
  const name = path.basename(f, '.jsonl');
  let raw;
  try { raw = fs.readFileSync(f, 'utf8'); } catch (e) { console.log('  ⚠️ nelze číst: ' + f); continue; }
  const lines = raw.split('\n').filter(l => l.trim());
  const rows = [], angles = new Set();
  let broken = 0, noText = 0, model = null, lang = null, without = null;
  for (const l of lines) {
    let o; try { o = JSON.parse(l); } catch (e) { broken++; continue; }
    // ⚠️ Řádek BEZ čtení se nezahazuje potichu — selhání je taky údaj (401, 529, parse).
    // Tichý filtr by z "token vypršel v půlce" udělal "dávka byla menší".
    if (!o.reading_text) { noText++; }
    if (typeof o.angle_idx === 'number' && o.angle_idx >= 0) angles.add(o.angle_idx);
    model = model || o.model || null;
    lang = lang || o.lang || null;
    if (o.without && !without) without = Array.isArray(o.without) ? o.without.join(',') : String(o.without);
    rows.push({
      rune: o.rune, runes: o.runes || null, spread: o.spread || null, lang: o.lang || null,
      angle_idx: (typeof o.angle_idx === 'number') ? o.angle_idx : -1,
      draws: o.draws || null, without: o.without || null,
      area: o.area || null, seeking: o.seeking || null, intention: o.intention || null,
      reading_text: o.reading_text || null,
      http_status: o.http_status || null, error: o.error || null,
      prompt_sha: o.system_sha256 || null, model: o.model || null,
      batch: name,
    });
  }
  const dest = path.join(OUT, name + '.jsonl');
  if (fs.existsSync(dest) && man.batches[name]) { skipped++; continue; }
  fs.writeFileSync(dest, rows.map(r => JSON.stringify(r)).join('\n') + '\n', 'utf8');
  man.batches[name] = {
    rows: rows.length, ok: rows.length - noText, failed: noText, broken: broken,
    lang: lang, angles: [...angles].sort((a, b) => a - b), without: without, model: model,
    src: path.relative(R, f).replace(/\\/g, '/'),
  };
  added++;
  console.log('  ✔ ' + name.padEnd(26) + (rows.length - noText) + '/' + rows.length + ' čtení' +
    (noText ? '  (' + noText + ' selhalo — ponecháno, selhání je taky údaj)' : '') +
    (broken ? '  ⚠️ ' + broken + ' nerozparsovaných řádků' : ''));
}

fs.writeFileSync(MANIFEST, JSON.stringify(man, null, 2), 'utf8');
console.log('\n  archiv: ' + path.relative(R, OUT).replace(/\\/g, '/') +
  '   přidáno ' + added + (skipped ? ', přeskočeno ' + skipped + ' (už tam bylo)' : ''));
console.log('  ⚠️ Pořád gitignorované. Kam to patří trvale (PUBLIC repo vs. Supabase tabulka)');
console.log('     je rozhodnutí ownera — viz RUNAR_BACKLOG.md.\n');
