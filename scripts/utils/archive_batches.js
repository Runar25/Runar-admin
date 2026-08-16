// ═══════════════════════════════════════════════════════
// RÚNAR · archive_batches.js — trvalý archiv čtení, GENEROVANÁ vs ŽIVÁ
//
// KUKY 2026-08-16: „ukládáš ta generovaná data tak, abychom je mohli dále použít?"
// a hned nato: „musí být označené jako tvou generované, musí být vidět rozdíl od živých
// čtení… můžeme je i porovnávat proti sobě."
//
// PROČ. Do 2026-08-16 se generovaná čtení nikam neukládala: `eval_out/` je gitignorované
// (.gitignore:16) a `gen_batch.js` posílá `journal: null`, takže NEVZNIKÁ řádek v `readings`.
// ~230 čtení z toho dne žilo jen jako lokální soubory na jednom disku.
//
// ⭐ PŮVOD SE NESMÍ DÁT SPLÉST — hlídá to TROJITĚ, protože jedna značka se dřív nebo později
// ztratí při kopírování nebo slévání souborů:
//   1. pole `source` v KAŽDÉM řádku ('generated' | 'production')
//   2. prefix v názvu souboru (`gen-` | `prod-`)
//   3. záznam v `manifest.json`
// Generovaná čtení mají navíc `synthetic: true` a `batch` — poznají se i po vytržení z kontextu.
//
// PROČ TO NENÍ ÚZKOSTLIVOST: generované čtení má vždycky jméno „Anna", pevný scénář a žádného
// skutečného člověka za sebou. Kdyby proteklo do statistik provozu nebo do hodnocení hlasu jako
// „živé", každé číslo z toho spočítané by bylo neplatné a nikdo by nepoznal proč.
//
// ⚠️ SOUKROMÍ. `prod-` soubory nesou čtení skutečných lidí. NIKDY se nesmí dostat do repa —
// je PUBLIC. `user_id` ani `question` se sem netahají vůbec. Archiv je gitignorovaný;
// kam data patří natrvalo, rozhoduje owner (→ RUNAR_BACKLOG.md).
//
//   node scripts/utils/archive_batches.js eval_out/*.jsonl      generované dávky
//   node scripts/utils/archive_batches.js --production          živá čtení z DB
//   node scripts/utils/archive_batches.js --list                co v archivu je
//   node scripts/utils/archive_batches.js --force <soubor>      přepsat už zarchivované
// ═══════════════════════════════════════════════════════
const fs = require('fs'), path = require('path'), os = require('os');
const { execSync } = require('child_process');

const R = path.resolve(__dirname, '../..');
const OUT = path.join(R, 'eval_out', 'archive');
const MANIFEST = path.join(OUT, 'manifest.json');
const ARGS = process.argv.slice(2);
const has = (f) => ARGS.indexOf(f) !== -1;
const FORCE = has('--force');

function loadManifest() {
  try { return JSON.parse(fs.readFileSync(MANIFEST, 'utf8')); } catch (e) { return { batches: {} }; }
}
function saveManifest(m) {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(MANIFEST, JSON.stringify(m, null, 2), 'utf8');
}

// ─── --list ──────────────────────────────────────────────
if (has('--list')) {
  const m = loadManifest();
  const keys = Object.keys(m.batches).sort();
  if (!keys.length) { console.log('\n  archiv je prázdný\n'); process.exit(0); }
  console.log('\n═══ ARCHIV ČTENÍ ═══');
  for (const kind of ['generated', 'production']) {
    const ks = keys.filter(k => m.batches[k].source === kind);
    if (!ks.length) continue;
    console.log('\n  ' + (kind === 'generated' ? 'GENEROVANÁ (syntetická, jméno „Anna")' : 'ŽIVÁ (skuteční lidé — do repa NIKDY)'));
    let tot = 0;
    for (const k of ks) {
      const b = m.batches[k]; tot += b.ok;
      console.log('    ' + k.padEnd(24) + String(b.ok).padStart(4) + '/' + b.rows + ' čtení · ' + (b.lang || '?') +
        (b.angles && b.angles.length ? ' · úhly ' + b.angles.join(',') : '') +
        (b.without ? ' · without=' + b.without : '') + (b.failed ? ' · ' + b.failed + ' selhalo' : ''));
    }
    console.log('    ──── celkem ' + tot + ' použitelných');
  }
  console.log('\n  Porovnávat je lze polem `source` — je v každém řádku.\n');
  process.exit(0);
}

// ─── --production: živá čtení z DB ───────────────────────
if (has('--production')) {
  const sql = "select id, rune_name, lang, area, seeking, intention, drawn_at, prompt_version, " +
    "prompt_draws, spread_data is not null as is_spread, " +
    "coalesce(short_text,'') as short_text, coalesce(deep_text,'') as deep_text " +
    "from public.readings where coalesce(short_text,'') <> '' order by drawn_at;";
  const tmp = path.join(os.tmpdir(), 'runar_arch_' + process.pid + '.sql');
  fs.writeFileSync(tmp, sql, 'utf8');
  let rows;
  try {
    const out = execSync('supabase db query --linked -f "' + tmp + '"', { cwd: R, encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 });
    rows = JSON.parse(out.slice(out.indexOf('{'))).rows || [];
  } catch (e) {
    console.error('CHYBA: DB dotaz selhal — ' + String(e.message || e).split('\n')[0]);
    process.exit(1);
  } finally { try { fs.unlinkSync(tmp); } catch (_) {} }

  // ⚠️ `user_id` ani `question` se NETAHAJI. Archiv je sice gitignorovany, ale jedina
  // kopie navic je jedina kopie navic — a repo je PUBLIC.
  const mapped = rows.map(r => ({
    source: 'production', synthetic: false,
    rune: r.rune_name, lang: r.lang, spread: r.is_spread ? 'spread' : 'single',
    angle_idx: -1, draws: r.prompt_draws || null, without: null,
    area: r.area || null, seeking: r.seeking || null, intention: r.intention || null,
    reading_text: (r.short_text + ' ' + r.deep_text).trim(),
    drawn_at: r.drawn_at, prompt_version: r.prompt_version || null,
    batch: 'production',
  }));
  const stamp = (mapped.length ? String(mapped[mapped.length - 1].drawn_at).slice(0, 10) : 'empty');
  const name = 'prod-' + stamp;
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, name + '.jsonl'), mapped.map(r => JSON.stringify(r)).join('\n') + '\n', 'utf8');
  const m = loadManifest();
  m.batches[name] = { source: 'production', rows: mapped.length, ok: mapped.length, failed: 0,
    lang: [...new Set(mapped.map(r => r.lang))].join('+'), angles: [], without: null };
  saveManifest(m);
  console.log('\n  ✔ ' + name + '  ' + mapped.length + ' živých čtení');
  console.log('  ⚠️ ŽIVÁ DATA: skuteční lidé. Do repa NIKDY — je PUBLIC. `user_id` a `question` se netahaly.\n');
  process.exit(0);
}

// ─── generované dávky ────────────────────────────────────
const files = ARGS.filter(a => /\.jsonl$/i.test(a) && !/archive[\\/]/.test(a));
if (!files.length) { console.error('pouziti: archive_batches.js <davka.jsonl> ... | --production | --list'); process.exit(1); }

fs.mkdirSync(OUT, { recursive: true });
const man = loadManifest();
let added = 0, skipped = 0;

for (const f of files) {
  const base = path.basename(f, '.jsonl');
  const name = 'gen-' + base;                       // prefix = druha znacka puvodu
  if (man.batches[name] && !FORCE) { skipped++; continue; }
  let raw;
  try { raw = fs.readFileSync(f, 'utf8'); } catch (e) { console.log('  ⚠️ nelze číst: ' + f); continue; }

  let mtime = null;
  try { mtime = fs.statSync(f).mtime.toISOString(); } catch (e) {}

  const rows = [], angles = new Set();
  let broken = 0, noText = 0, model = null, lang = null, without = null;
  for (const l of raw.split('\n').filter(x => x.trim())) {
    let o; try { o = JSON.parse(l); } catch (e) { broken++; continue; }
    // ⚠️ Radek BEZ cteni se nezahazuje potichu — selhani je taky udaj (401, 529, parse).
    // Tichy filtr by z "token vyprsel v pulce" udelal "davka byla mensi".
    if (!o.reading_text) noText++;
    if (typeof o.angle_idx === 'number' && o.angle_idx >= 0) angles.add(o.angle_idx);
    model = model || o.model || null;
    lang = lang || o.lang || null;
    if (o.without && !without) without = Array.isArray(o.without) ? o.without.join(',') : String(o.without);
    rows.push({
      source: 'generated', synthetic: true,     // prvni a nejdulezitejsi znacka: je v RADKU
      rune: o.rune, runes: o.runes || null, spread: o.spread || null, lang: o.lang || null,
      angle_idx: (typeof o.angle_idx === 'number') ? o.angle_idx : -1,
      draws: o.draws || null, without: o.without || null,
      area: o.area || null, seeking: o.seeking || null, intention: o.intention || null,
      reading_text: o.reading_text || null,
      http_status: o.http_status || null, error: o.error || null,
      prompt_sha: o.system_sha256 || null, model: o.model || null,
      batch: name, generated_at: mtime,
    });
  }
  fs.writeFileSync(path.join(OUT, name + '.jsonl'), rows.map(r => JSON.stringify(r)).join('\n') + '\n', 'utf8');
  man.batches[name] = {
    source: 'generated', rows: rows.length, ok: rows.length - noText, failed: noText, broken: broken,
    lang: lang, angles: [...angles].sort((a, b) => a - b), without: without, model: model,
    generated_at: mtime, src: path.relative(R, f).replace(/\\/g, '/'),
  };
  added++;
  console.log('  ✔ ' + name.padEnd(24) + (rows.length - noText) + '/' + rows.length + ' čtení' +
    (noText ? '  (' + noText + ' selhalo — ponecháno, selhání je taky údaj)' : '') +
    (broken ? '  ⚠️ ' + broken + ' nerozparsovaných řádků' : ''));
}

saveManifest(man);
console.log('\n  archiv: ' + path.relative(R, OUT).replace(/\\/g, '/') +
  '   přidáno ' + added + (skipped ? ', přeskočeno ' + skipped + ' (už tam bylo — `--force` přepíše)' : ''));
console.log('  Původ je značený trojmo: pole `source` v řádku · prefix `gen-`/`prod-` · manifest.');
console.log('  ⚠️ Archiv je gitignorovaný. Kam patří natrvalo → RUNAR_BACKLOG.md (rozhodnutí ownera).\n');
