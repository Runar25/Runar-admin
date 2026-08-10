// ═══════════════════════════════════════════════════════
// RÚNAR · export_readings.js — REÁLNÁ čtení z DB do JSONL pro Cowork eval
//
// Jedna dávka = jeden JSONL, 1 řádek = 1 čtení. Vedle něj .meta.json (system prompt
// + sha + verze 1×, ne u každého řádku — u stovek čtení by to soubor nafouklo).
//
// ⚠️ OSOBNÍ ÚDAJE. `readings` řádek je osobní údaj (RUNAR_PRIVACY.md). Proto:
//   1. user_id se NIKDY neexportuje — jen stabilní pseudonym (md5 prefix).
//   2. `analytics_opt_out = true` se NEexportuje (§4 privacy).
//   3. Export NESMÍ skončit v repu — repo Runar25/Runar-admin je VEŘEJNÉ, commit by
//      znamenal zveřejnit cizí čtení. Skript zápis do repa odmítne. Default cíl je
//      ~/runar-eval/, odkud si to Cowork vytáhne přes device_bash.
//   4. Volné texty, které nikdo nežádal (`question`), se neexportují — minimalizace.
//
// Pole: viz Cowork handoff 2026-08-08 (user · is_tester · is_admin · rune · runes[] ·
// spread · life_rune · prompt_version · lang · area · seeking · intention · mode ·
// reading_text · ask_q · ask_a · ts · draws).
// `draws` = co si prompt vylosoval (úhel/obraz/konec/jméno). Od 2026-08-09; starší
// čtení ho mají null, protože se do té doby nepersistoval vůbec.
//
//   node scripts/utils/export_readings.js
//   node scripts/utils/export_readings.js --testers-only --since 2026-08-01
//   node scripts/utils/export_readings.js --out C:\cesta\davka.jsonl
// ═══════════════════════════════════════════════════════
'use strict';

const fs   = require('fs');
const os   = require('os');
const path = require('path');
const vm   = require('vm');
const crypto = require('crypto');
const { execSync } = require('child_process');

const REPO = path.resolve(__dirname, '..', '..');
const V2   = path.join(REPO, 'v2');

function die(msg) { console.error('\n  ERROR: ' + msg + '\n'); process.exit(1); }

// ── args ────────────────────────────────────────────────────────────────────
const FLAGS = ['testers-only', 'dry-run', 'help'];
const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.slice(0, 2) !== '--') die('Nečekaný argument: ' + a);
  const k = a.slice(2);
  if (FLAGS.indexOf(k) !== -1) { args[k] = true; continue; }
  const v = process.argv[++i];
  if (v === undefined) die('Chybí hodnota pro --' + k);
  args[k] = v;
}
if (args.help) {
  console.log([
    '', '  export_readings.js — reálná čtení z DB do JSONL pro eval', '',
    '  --out <cesta>     kam zapsat (default ~/runar-eval/readings.jsonl, vzdy se prepisuje)',
    '  --since <YYYY-MM-DD>  jen čtení od tohoto data',
    '  --testers-only    jen účty s is_tester = true',
    '  --dry-run         jen spočítej, nic nezapisuj', '',
  ].join('\n'));
  process.exit(0);
}

// ── kam se smí zapsat ───────────────────────────────────────────────────────
const DEFAULT_DIR = path.join(os.homedir(), 'runar-eval');
const outPath = path.resolve(args.out || path.join(DEFAULT_DIR, 'readings.jsonl'));

// Tohle je bezpečnostní pojistka, ne styl: repo je veřejné, takže osobní čtení do něj
// nesmí ani omylem (ani do gitignorovaného podadresáře — jeden `git add -f` a je to venku).
if (outPath.toLowerCase().startsWith(REPO.toLowerCase() + path.sep))
  die('Cíl leží v repu (' + REPO + ').\n'
    + '  Repo je VEŘEJNÉ a `readings` je osobní údaj — export se do něj nesmí dostat.\n'
    + '  Nech default (' + DEFAULT_DIR + ') nebo zvol cestu mimo repo.');

// ── SQL ─────────────────────────────────────────────────────────────────────
// Pseudonym: md5(user_id) zkrácené. Stabilní napříč dávkami (segmentace per user drží),
// ale samo o sobě neidentifikuje — zpětně jen s vlastnictvím seznamu user_id.
const ADMIN_EMAILS = (function () {
  const src = fs.readFileSync(path.join(V2, 'runar-config.js'), 'utf8');
  const m = src.match(/const ADMIN_EMAILS\s*=\s*\[([^\]]*)\]/);
  if (!m) die('ADMIN_EMAILS nenalezen v runar-config.js');
  return m[1].split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
})();

const where = ["coalesce(p.analytics_opt_out, false) = false"];
if (args['testers-only']) where.push('coalesce(p.is_tester, false) = true');
if (args.since) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(args.since)) die('--since chce tvar YYYY-MM-DD');
  where.push("r.drawn_at >= '" + args.since + "'");
}

const SQL = `
select json_build_object(
  'user',           left(md5(r.user_id::text), 8),
  'is_tester',      coalesce(p.is_tester, false),
  'is_admin',       (lower(u.email) = any (array[${ADMIN_EMAILS.map(e => "'" + e.toLowerCase().replace(/'/g, "''") + "'").join(',')}])),
  'rune_name',      r.rune_name,
  'rune_glyph',     r.rune_glyph,
  'short_text',     r.short_text,
  'deep_text',      r.deep_text,
  'lang',           r.lang,
  'life_rune',      r.life_rune,
  'prompt_version', r.prompt_version,
  'area',           r.area,
  'aol',            r.aol,
  'seeking',        r.seeking,
  'intention',      r.intention,
  'mode',           r.reading_mode,
  'draws',          r.prompt_draws,
  'follow_up',      r.follow_up,
  'ts',             r.drawn_at
)::text as j
from public.readings r
left join public.user_profiles p on p.id = r.user_id
left join auth.users u           on u.id = r.user_id
where ${where.join(' and ')}
order by r.drawn_at asc
`;

function runSql(sql) {
  const tmp = path.join(os.tmpdir(), 'runar_export_' + process.pid + '.sql');
  fs.writeFileSync(tmp, sql, 'utf8');
  try {
    // Jeden retezec (ne args + shell:true — to hazi DeprecationWarning). SQL jde SOUBOREM,
    // takze pres prikazovou radku neteče nic z DB ani od uzivatele.
    const out = execSync('supabase db query --linked -f "' + tmp + '"',
      { encoding: 'utf8', maxBuffer: 1 << 28 });
    const i = out.indexOf('{');
    if (i === -1) die('CLI nevrátilo JSON:\n' + out.slice(0, 400));
    const parsed = JSON.parse(out.slice(i));
    if (!parsed.rows) die('CLI odpověď bez `rows`');
    return parsed.rows;
  } catch (e) {
    die('supabase db query selhalo: ' + String(e.message || e).slice(0, 400));
  } finally {
    try { fs.unlinkSync(tmp); } catch (e) { /* nevadí */ }
  }
}

// ── kanonická data run + system prompt (pro .meta) ──────────────────────────
function loadSandbox() {
  const M = {}; Object.getOwnPropertyNames(Math).forEach(k => { M[k] = Math[k]; }); M.random = () => 0.5;
  const bag = {};
  const sb = {
    Math: M, JSON, Date, console, setTimeout: () => 0, clearTimeout: () => {},
    localStorage: { getItem: k => (k in bag ? bag[k] : null), setItem: (k, v) => { bag[k] = String(v); }, removeItem: k => { delete bag[k]; } },
    window: {}, self: {},
    document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] },
  };
  sb.globalThis = sb;
  const code = ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js']
    .map(f => fs.readFileSync(path.join(V2, f), 'utf8')).join('\n;\n');
  vm.createContext(sb);
  vm.runInContext(code, sb, { filename: 'export.js' });
  return sb;
}

// ── transformace ────────────────────────────────────────────────────────────
const SPREAD_RE = /NORNS|KRIZ|CROSS|COMPASS|HORSESHOE|YGGDRASIL/;

function toRow(raw, glyphSet) {
  const name = String(raw.rune_name || '');
  const m = name.toUpperCase().match(SPREAD_RE);
  const spread = m ? m[0].toLowerCase() : 'single';

  // Stejná cesta, jakou se krmí strom: glyfy z rune_glyph + short_text (§20 — jeden zvyk).
  const src = String(raw.rune_glyph || '') + ' ' + String(raw.short_text || '');
  const runes = [];
  for (const ch of src) if (glyphSet.has(ch) && runes.indexOf(ch) === -1) runes.push(ch);

  const fu = Array.isArray(raw.follow_up) ? raw.follow_up : [];
  const first = fu[0] || null;

  return {
    user: raw.user,
    is_tester: !!raw.is_tester,
    is_admin: !!raw.is_admin,
    rune: name,
    runes: runes,
    spread: spread,
    life_rune: raw.life_rune ?? null,
    prompt_version: raw.prompt_version ?? null,
    lang: raw.lang ?? null,
    area: raw.area ?? raw.aol ?? null,
    seeking: raw.seeking ?? null,
    intention: raw.intention ?? null,
    mode: raw.mode ?? null,
    // Losy promptu (úhel/obraz/konec/jméno). U čtení z doby před 2026-08-09 chybí —
    // zůstane null, NIKDY se nedosazuje 0 (mlčky vytištěná nula by lhala).
    draws: raw.draws ?? null,
    reading_text: raw.deep_text || raw.short_text || '',
    ask_q: first ? (first.q ?? null) : null,
    ask_a: first ? (first.a ?? null) : null,
    ask_n: fu.length,
    ts: raw.ts ?? null,
  };
}

// ── běh ─────────────────────────────────────────────────────────────────────
const rows = runSql(SQL).map(r => JSON.parse(r.j));
const sb = loadSandbox();
// POZOR: `const RUNES` v vm kontextu NENI na sandbox objektu (const/let = lexikalni
// scope, ne globalni objekt). Musi se cist zevnitr kontextu, jinak tise vyjde prazdno.
const glyphSet = new Set(vm.runInContext('RUNES.map(function(r){ return r.g; })', sb).filter(Boolean));
if (!glyphSet.size) die('Nenacetly se glyfy run — export by tise vysel bez runes[].');
const out = rows.map(r => toRow(r, glyphSet));

const seen = {
  users: new Set(out.map(r => r.user)),
  testers: new Set(out.filter(r => r.is_tester).map(r => r.user)),
  langs: [...new Set(out.map(r => r.lang).filter(Boolean))],
  versions: [...new Set(out.map(r => r.prompt_version).filter(Boolean))],
  spreads: [...new Set(out.map(r => r.spread))],
  noGlyph: out.filter(r => !r.runes.length).length,
};

console.log('');
console.log('  čtení    : ' + out.length);
console.log('  uživatelů: ' + seen.users.size + '  (z toho testerů: ' + seen.testers.size + ')');
console.log('  jazyky   : ' + (seen.langs.join(', ') || '—'));
console.log('  verze    : ' + (seen.versions.join(', ') || '— (starší čtení bez tagu)'));
console.log('  spready  : ' + seen.spreads.join(', '));
if (seen.noGlyph) console.log('  ⚠ bez rozpoznané runy: ' + seen.noGlyph + ' (glyf se do textu nedostal)');

if (args['dry-run']) { console.log('\n  [DRY RUN] nic nezapsáno\n'); process.exit(0); }

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, out.map(r => JSON.stringify(r)).join('\n') + '\n', 'utf8');

const sys = {};
for (const L of seen.langs.length ? seen.langs : ['is', 'en']) {
  vm.runInContext('lang = ' + JSON.stringify(L) + ';', sb);
  const s = vm.runInContext('buildSysPrompt(null, ' + JSON.stringify(L) + ')', sb);
  sys[L] = { sha256: crypto.createHash('sha256').update(s).digest('hex'), text: s };
}
const metaPath = outPath.replace(/\.jsonl$/, '') + '.meta.json';
fs.writeFileSync(metaPath, JSON.stringify({
  source: 'public.readings (live DB)',
  generated_at: new Date().toISOString(),
  argv: process.argv.slice(2),
  counts: { readings: out.length, users: seen.users.size, testers: seen.testers.size },
  prompt_versions_seen: seen.versions,
  config_prompt_version: vm.runInContext('RUNAR_PROMPT_VERSION', sb),
  privacy: {
    user_key: 'md5(user_id) zkráceno na 8 znaků — pseudonym, stabilní napříč dávkami',
    excluded: 'analytics_opt_out = true',
    omitted_fields: ['question (volný text, nikdo si ho nevyžádal — minimalizace)'],
    note: 'Osobní údaj. NEPATŘÍ do repa (Runar25/Runar-admin je veřejné) ani mimo EU.',
  },
  angle_idx: 'nepersistuje se u reálných čtení — v tabulce `readings` takový sloupec není',
  system_prompt: sys,
}, null, 2), 'utf8');

console.log('');
console.log('  jsonl : ' + outPath);
console.log('  meta  : ' + metaPath);
console.log('');
console.log('  ⚠ Osobní údaje — soubor nepatří do repa ani mimo EU (RUNAR_PRIVACY.md).');
console.log('');
