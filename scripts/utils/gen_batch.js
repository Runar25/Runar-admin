// ═══════════════════════════════════════════════════════
// RÚNAR · gen_batch.js — batch reading generator for OBJECTIVE eval
//
// Generates N readings through the REAL production prompt builders and the LIVE
// claude-proxy, and writes them as JSONL for is-grammar-qa.py / analysis.
//
// SCOPE (holds RUNAR_DECISIONS.md 2026-07-14 "NE syntetický eval"): defects,
// hard Icelandic grammar, countable prompt behaviour. NOT a verdict on voice
// quality — that needs real readings grouped by readings.prompt_version.
//
// Auth: proxy requires a JWT since FAZE 1 security (fd78a91) -> anon/publishable = 401.
// The ADMIN token is read from env RUNAR_EVAL_TOKEN, or — if that is empty — from the file
// ~/.runar-eval-token (outside the repo, so it can never be committed and nobody has to paste
// it into a chat). Refresh it in the shrine console; check it with --check-token.
// (admin -> generates free, no cap,
// and journal is skipped because we send no journal -> no readings row). Still spends the
// project's real Anthropic budget. Throttled to the proxy's 10 req / 60 s limit.
//
//   node scripts/utils/gen_batch.js --spread single --rune Perth --lang is --n 3
//   node scripts/utils/gen_batch.js --list
//   node scripts/utils/gen_batch.js --spread norns --lang en --n 2 --dry-run
// ═══════════════════════════════════════════════════════
'use strict';

const fs     = require('fs');
const path   = require('path');
const vm     = require('vm');
const crypto = require('crypto');
const os     = require('os');

const REPO = path.resolve(__dirname, '..', '..');
const V2   = path.join(REPO, 'v2');

// Same file set as scripts/verify_contract_wiring.js. runar-translations.js is
// deliberately excluded: it redeclares t()/UI_TEXT, and character.js never calls t().
const FILES = ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'];

const DEFAULT_DELAY_MS = 12000;  // ~5 req/min = HALF the shared 10/60s IP bucket,
                                 // so a parallel session / the app keeps the other half.
                                 // --solo drops it to SOLO_DELAY_MS when nobody else is on.
const SOLO_DELAY_MS    = 6500;   // ~9 req/min — only safe when the proxy IP is yours alone
const REQUEST_TIMEOUT  = 180000; // proxy worst case is ~170 s per model before it answers
const MAX_RETRIES      = 2;      // 503 also masks permanent 4xx (index.ts:621) -> never loop
const MAX_JOBS_NO_YES  = 60;     // guard against an accidental five-figure run

// Spread -> rune count, config key, builder. NOTE the Kriz asymmetry: the builder is
// buildKrizPrompt but SPREAD_CONFIG / SPREAD_COSTS key it as "cross".
const SPREADS = {
  single:    { count: 1, key: 'single',    builder: 'buildReadingPrompt'    },
  norns:     { count: 3, key: 'norns',     builder: 'buildNornsPrompt'      },
  kriz:      { count: 5, key: 'cross',     builder: 'buildKrizPrompt'       },
  horseshoe: { count: 7, key: 'horseshoe', builder: 'buildHorseshoePrompt'  },
  yggdrasil: { count: 9, key: 'yggdrasil', builder: 'buildYggdrasilPrompt'  },
};

// ─── CLI ───────────────────────────────────────────────
const FLAGS = ['dry-run', 'list', 'help', 'yes', 'allow-blank', 'all-runes', 'solo', 'check-token', 'append'];

function die(msg) { console.error('\n  ERROR: ' + msg + '\n'); process.exit(1); }

// ── ADMIN TOKEN ─────────────────────────────────────────────────────────────
// One resolution path for every caller: env first (CI / one-off), else the file in the
// user's home dir. The token itself is NEVER printed — only where it came from and when
// it expires, so a stale token fails with a clear message instead of a bare 401.
const TOKEN_FILE = path.join(os.homedir(), '.runar-eval-token');

function jwtExpiry(tok) {
  try {
    const body = tok.split('.')[1];
    if (!body) return null;
    const json = JSON.parse(Buffer.from(body.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
    return typeof json.exp === 'number' ? new Date(json.exp * 1000) : null;
  } catch (e) { return null; }
}

// Returns a human-readable reason the token cannot be used, or null when it looks usable.
// Shape first: a pasted placeholder ("PASTE_TOKEN") must fail HERE with a clear sentence,
// not later as a bare 401 from the proxy.
function tokenProblem(tok) {
  const parts = tok.split('.');
  if (parts.length !== 3 || !parts[1])
    return 'not a token — a JWT has three dot-separated parts; something else got saved here';
  // A real Supabase access token always carries an expiry. Anything that survives the shape
  // check but has no decodable payload with `exp` is not a token — it is whatever else
  // happened to be on the clipboard (a command line, placeholder text, a stray path).
  const exp = jwtExpiry(tok);
  if (!exp)
    return 'not a token — no readable expiry inside it; check that the value really came from '
         + 'the shrine console and nothing overwrote the clipboard in between';
  if (exp.getTime() < Date.now()) return 'expired ' + exp.toISOString();
  return null;
}

// Env first, then the file — but a token that CANNOT be used never shadows one that can.
// (A stale env var silently beating a freshly saved file cost a debugging round once.)
function resolveEvalToken() {
  const candidates = [];
  const fromEnv = (process.env.RUNAR_EVAL_TOKEN || '').trim();
  if (fromEnv) candidates.push({ token: fromEnv, source: 'env RUNAR_EVAL_TOKEN' });
  try {
    const fromFile = fs.readFileSync(TOKEN_FILE, 'utf8').trim();
    if (fromFile) candidates.push({ token: fromFile, source: TOKEN_FILE });
  } catch (e) { /* no file = fine, handled by the caller */ }
  candidates.forEach(function (c) { c.problem = tokenProblem(c.token); });
  const usable = candidates.filter(function (c) { return !c.problem; })[0];
  if (usable) return { token: usable.token, source: usable.source, candidates: candidates };
  return { token: '', source: '', candidates: candidates };
}

// One-line-per-candidate report, e.g. "  env RUNAR_EVAL_TOKEN — expired 2026-08-08T13:20:29.000Z"
function tokenReport(candidates) {
  if (!candidates || !candidates.length) return '  (nothing found — no env var, no file)';
  return candidates.map(function (c) {
    return '  ' + c.source + ' — ' + (c.problem || 'usable');
  }).join('\n');
}

const TOKEN_HELP =
  'Set it one of two ways:\n'
  + '    a) put it in ' + TOKEN_FILE + '  (read automatically, never committed)\n'
  + '    b) or export RUNAR_EVAL_TOKEN=<admin session JWT> for a single run\n'
  + '  Get the value in the shrine browser console:\n'
  + '    (await sb.auth.getSession()).data.session.access_token';

function parseArgs(argv) {
  const out = { fu: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.slice(0, 2) !== '--') die('Unexpected argument: ' + a + ' (options need a leading --)');
    const key = a.slice(2);
    if (FLAGS.indexOf(key) !== -1) { out[key] = true; continue; }
    const val = argv[++i];
    if (val === undefined) die('Missing value for --' + key);
    if (key === 'fu') out.fu.push(val); else out[key] = val;
  }
  return out;
}

const USAGE = [
  '',
  'gen_batch.js — batch reading generator (objective eval)',
  '',
  '  --spread    single|norns|kriz|horseshoe|yggdrasil   (default single)',
  '  --lang      en|is                                   (default is)',
  '  --rune      Perth          forced rune (single; first position of a spread)',
  '  --runes     A,B,C          explicit spread runes; else a random distinct sample',
  '  --life-rune Gebo|self|none life rune context; self = life==drawn per reading (default none)',
  '  --area      "The Unseen"   free-form, goes in verbatim',
  '  --seeking   "Clarity"      MUST be an exact SEEKS label or it silently vanishes',
  '  --intention "Right now"    exact INTENTIONS label (else it degrades to a bare label)',
  '  --question  "..."          the seeker question (empty = the no-question branch)',
  '  --name      Anna           "you"/"þú" disables the name-placement line entirely',
  '  --gender    hk|kk|kvk      IS address gender        (default hk)',
  '  --all-runes sweep every rune in RUNES order (all 25, Blank included).',
  '              --n = passes. One process = one seasonal shuffle bag, which is',
  '              how a real device behaves; a fresh process resets it to random.',
  '  --n         3              readings per invocation, or passes with --all-runes',
  '  --fu        "question"     follow-up probe, repeatable',
  '  --out       path.jsonl     (default eval_out/batch-<stamp>.jsonl)',
  '  --ts        ISO            gen_ts stamp             (default now)',
  '  --delay     6500           ms between requests',
  '  --dry-run   build prompts, write JSONL, make NO network calls (free)',
  '  --check-token  say where the admin token comes from and whether it is still valid, then exit',
  '  --append    add to an existing output file instead of starting it fresh (default: fresh)',
  '  --allow-blank  let the random sampler draw the Blank rune',
  '  --solo      nobody else is on the proxy IP — go faster (' + SOLO_DELAY_MS + ' ms spacing)',
  '  --yes       required above ' + MAX_JOBS_NO_YES + ' requests',
  '  --list      print rune names + enum labels and exit',
  '',
].join('\n');

// ─── sandbox ───────────────────────────────────────────
// The v2 files are plain <script> globals — no module.exports — so the only way to
// reach them from Node is to run them in a vm context. Top-level const/function land
// in the context's LEXICAL scope, not on the global object: read them with
// vm.runInContext('NAME'), never ctx.NAME.
function makeSandbox() {
  const bag = Object.create(null);
  const ctx = vm.createContext({
    Math: Math, JSON: JSON, Date: Date, console: console,
    // _seasonBagPick keeps a no-repeat shuffle bag here. Without it the seasonal
    // image degrades to plain random, which is NOT what a real device does.
    localStorage: {
      getItem:    function (k) { return (k in bag) ? bag[k] : null; },
      setItem:    function (k, v) { bag[k] = String(v); },
      removeItem: function (k) { delete bag[k]; },
    },
  });
  ctx.window = ctx; ctx.self = ctx; ctx.globalThis = ctx;

  // Ambient globals the browser sets and the builders read WITHOUT taking them as
  // arguments. Both are silent-corruption traps:
  //   lang       — rn()/rk() read this global, NOT the lang argument (runar-utils.js:321,324).
  //                Mismatch = Icelandic scaffolding around English rune data, no error.
  //   userGender — _addressContext reads this, IS only (runar-character.js:586); default hk.
  let code = 'var lang = "en"; var userGender = "hk"; var corrections = [];\n';
  for (const f of FILES) code += fs.readFileSync(path.join(V2, f), 'utf8') + '\n;\n';
  vm.runInContext(code, ctx, { filename: 'gen_batch-sandbox.js' });
  return ctx;
}

// ─── real _parseSegments, lifted from runar-reading.js ──
// §18: no parallel copy. The stored text of a real reading is the COMPOSED text
// (segments joined by one space + any prose tail), never the raw JSON array.
// Same brace-match trick as scripts/verify_compose_mirror.js.
function loadParseSegments() {
  const src   = fs.readFileSync(path.join(V2, 'runar-character.js'), 'utf8');
  const start = src.indexOf('function _parseSegments(raw) {');
  if (start === -1) die('_parseSegments not found in runar-reading.js — cannot compose text the way production does.');
  let i = src.indexOf('{', start), depth = 0, end = -1;
  for (; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  if (end === -1) die('_parseSegments braces did not balance — runar-reading.js changed shape.');
  return new Function(src.slice(start, end) + '\nreturn _parseSegments;')();
}

// ─── follow-up token cap, read LIVE from runar-reading.js ──
// §20: the cap lives in production (var askCap = N), gen_batch READS it — never a copy.
// Was hardcoded 120; production moved it to 140 (92255b9) and the copy silently drifted.
function loadAskCap() {
  const src = fs.readFileSync(path.join(V2, 'runar-reading.js'), 'utf8');
  const m = src.match(/var\s+askCap\s*=\s*(\d+)\s*;/);
  if (!m) die('askCap not found in runar-reading.js — follow-up cap moved; gen_batch would use a stale value.');
  return parseInt(m[1], 10);
}

// ─── main ──────────────────────────────────────────────
async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { console.log(USAGE); return; }

  if (args['check-token']) {
    const r = resolveEvalToken();
    console.log('\n  Places checked (in this order):');
    console.log(tokenReport(r.candidates));
    if (!r.token) {
      console.error('\n  No usable token.\n  ' + TOKEN_HELP + '\n');
      process.exit(1);
    }
    const exp = jwtExpiry(r.token);
    const minsLeft = Math.round((exp.getTime() - Date.now()) / 60000);
    console.log('\n  Using : ' + r.source);
    console.log('  length: ' + r.token.length + ' chars  (the value itself is never printed)');
    console.log('  valid until: ' + exp.toISOString() + '  (' + minsLeft + ' min left)');
    console.log('');
    process.exit(0);
  }

  const ctx  = makeSandbox();
  const G    = function (expr) { return vm.runInContext(expr, ctx); };
  const call = function (fn, a) { return G(fn).apply(null, a); };
  const setLang = function (l) { vm.runInContext('lang = ' + JSON.stringify(l) + ';', ctx); };

  const RUNES      = G('RUNES');
  const AREAS      = G('AREAS');
  const SEEKS      = G('SEEKS');
  const INTENTIONS = G('INTENTIONS');

  if (args.list) {
    console.log('\nRUNES (exact --rune values, case-sensitive):\n  ' +
      RUNES.map(function (r) { return r.n; }).join(' · '));
    console.log('\nAREAS.en:  ' + AREAS.en.join(' | '));
    console.log('AREAS.is:  ' + AREAS.is.join(' | '));
    console.log('\nSEEKS.en:  ' + SEEKS.en.join(' | '));
    console.log('SEEKS.is:  ' + SEEKS.is.join(' | '));
    console.log('\nINTENTIONS.en: ' + INTENTIONS.en.join(' | '));
    console.log('INTENTIONS.is: ' + INTENTIONS.is.join(' | ') + '\n');
    return;
  }

  // ── resolve + validate options ──
  const lang = args.lang || 'is';
  if (lang !== 'en' && lang !== 'is') die('--lang must be en or is');

  const spreadName = args.spread || 'single';
  const spec = SPREADS[spreadName];
  if (!spec) die('--spread must be one of: ' + Object.keys(SPREADS).join(', '));

  const gender = args.gender || 'hk';
  if (['hk', 'kk', 'kvk'].indexOf(gender) === -1) die('--gender must be hk, kk or kvk');
  vm.runInContext('userGender = ' + JSON.stringify(gender) + ';', ctx);

  const n     = Math.max(1, parseInt(args.n || '1', 10));
  const delay = Math.max(0, parseInt(
    args.delay || String(args['solo'] ? SOLO_DELAY_MS : DEFAULT_DELAY_MS), 10));

  function runeByName(name) {
    const r = RUNES.find(function (x) { return x.n === name; });
    if (!r) die('Unknown rune "' + name + '". Names are the exact EN forms — run --list.');
    return r;
  }

  const forcedRune  = args.rune  ? runeByName(args.rune) : null;
  const forcedRunes = args.runes ? args.runes.split(',').map(function (s) { return runeByName(s.trim()); }) : null;
  if (forcedRunes && forcedRunes.length !== spec.count)
    die('--runes has ' + forcedRunes.length + ' runes but ' + spreadName + ' needs exactly ' + spec.count +
        '. Too few throws inside the builder; too many is silently truncated.');
  if (spreadName === 'single' && !forcedRune && !forcedRunes && !args['all-runes'])
    die('--rune is required for a single reading (controlled coverage is the point; there is no random draw here).');
  if (args['all-runes'] && spreadName !== 'single')
    die('--all-runes is single-only — it draws exactly one rune per reading.');

  const lifeMirror = args['life-rune'] === 'self' || args['life-rune'] === 'mirror';
  const lifeRune = (args['life-rune'] && args['life-rune'] !== 'none' && !lifeMirror) ? runeByName(args['life-rune']) : null;

  // Only `seeking` silently vanishes when off-list (_registerContext returns '' —
  // runar-character.js:557-561). `area` is interpolated verbatim; `intention`
  // degrades to a bare label. So: hard-fail on seeking, warn on the other two.
  const seeking = args.seeking || '';
  if (seeking && SEEKS.en.indexOf(seeking) === -1 && SEEKS.is.indexOf(seeking) === -1)
    die('--seeking "' + seeking + '" is in neither SEEKS.en nor SEEKS.is, so the whole register\n' +
        '  directive would silently vanish from the prompt. Run --list for the exact labels.');

  const area = args.area || '';
  if (area && AREAS.en.indexOf(area) === -1 && AREAS.is.indexOf(area) === -1)
    console.warn('  warn: --area "' + area + '" is not an AREAS label; it goes into the prompt verbatim.');

  const intention = args.intention || '';
  if (intention && INTENTIONS.en.indexOf(intention) === -1 && INTENTIONS.is.indexOf(intention) === -1)
    console.warn('  warn: --intention "' + intention + '" is not an INTENTIONS label; the Norns-axis gloss will be skipped.');

  // Blank name takes the production "you"/"þú" fallback, which disables the
  // name-placement line entirely (runar-utils.js:235) — a real default, but it hides
  // the name-omit behaviour, so pass --name when that is what you are measuring.
  const name = args.name || (lang === 'is' ? 'þú' : 'you');

  const genTs   = args.ts || new Date().toISOString();
  const outPath = args.out
    ? path.resolve(args.out)
    : path.join(REPO, 'eval_out', 'batch-' + genTs.replace(/[:.]/g, '-') + '.jsonl');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  // is-grammar-qa.py eats ONE READING PER LINE, not JSONL — so emit plain-text
  // sidecars alongside it. Newlines inside a reading collapse to spaces, or the
  // checker would score one reading as several.
  const txtPath    = outPath.replace(/\.jsonl$/, '') + '.readings.txt';
  const askTxtPath = outPath.replace(/\.jsonl$/, '') + '.ask.txt';
  const oneLine = function (s) { return String(s).replace(/\s+/g, ' ').trim(); };

  // --all-runes: one full sweep of RUNES per pass, in array order, Blank included.
  // Deliberately inside ONE process: _seasonBagPick keeps its no-repeat bag in the
  // localStorage shim, so a single process deals each seasonal image once before
  // repeating — the way a real device does. Per-rune processes would reset the bag
  // every reading and quietly skew word frequencies.
  const jobs = [];
  if (args['all-runes']) {
    for (let p = 0; p < n; p++) for (const r of RUNES) jobs.push({ runes: [r], pass: p + 1 });
  } else {
    for (let i = 0; i < n; i++) jobs.push({ runes: pickRunes(), pass: 1 });
  }

  const totalRequests = jobs.length * (1 + args.fu.length);
  if (totalRequests > MAX_JOBS_NO_YES && !args.yes)
    die(totalRequests + ' requests planned (> ' + MAX_JOBS_NO_YES + '). Re-run with --yes if that is intended.');

  // ── constants straight from the config (single source of truth) ──
  const PROXY  = G('PROXY');
  const SB_KEY = G('SB_KEY');
  // Admin session JWT — get it in the shrine browser console:
  //   (await sb.auth.getSession()).data.session.access_token
  const resolved   = resolveEvalToken();
  const EVAL_TOKEN = resolved.token;
  if (!args['dry-run'] && !EVAL_TOKEN)
    die('No usable admin token (the proxy requires one since fd78a91).\n\n'
      + tokenReport(resolved.candidates) + '\n\n  ' + TOKEN_HELP);
  const PROMPT_VERSION = G('RUNAR_PROMPT_VERSION');
  const maxTokens = (spreadName === 'single')
    ? G('RUNAR_MODES').quick_reading.max_tokens
    : G('SPREAD_CONFIG')[spec.key].tokens;
  const spreadCost = G('SPREAD_COSTS')[spec.key].credits;
  const ASK_TOKENS = loadAskCap(); // live from runar-reading.js askCap (§20, no stale copy)

  const parseSegments = loadParseSegments();

  // System prompt: production passes buildSysPrompt(activeChar, lang) with activeChar
  // loaded from the runar_character table. We pass null (= DEF_CHAR_EN/IS). If a row is
  // ever set active in the DB, production diverges from this batch — noted in the meta file.
  setLang(lang);
  const sysPrompt = call('buildSysPrompt', [null, lang]);
  const sysSha = crypto.createHash('sha256').update(sysPrompt).digest('hex').slice(0, 12);

  let seasonBucket = null;
  try { seasonBucket = call('_seasonBucket', [new Date().getMonth() + 1]); } catch (e) { /* optional */ }

  console.log('\n  gen_batch — ' + spreadName + ' · ' + lang + ' · ' +
    (args['all-runes'] ? 'all ' + RUNES.length + ' runes × ' + n + ' pass(es)' : 'n=' + n) +
    (args.fu.length ? ' · +' + args.fu.length + ' follow-up' : '') +
    ' · ' + totalRequests + ' request(s)' + (args['dry-run'] ? '  [DRY RUN, no network]' : ''));
  console.log('  prompt_version=' + PROMPT_VERSION + ' · max_tokens=' + maxTokens +
    ' · season=' + seasonBucket + ' · sys=' + sysSha);
  console.log('  -> ' + outPath + '\n');

  // The proxy rate-limits per IP (10 req / 60 s, one shared bucket). Say OUT LOUD how
  // much of it this run takes and for how long, BEFORE spending it — a silent long run
  // starves every other anonymous caller on this IP (the app, a tester, the other session).
  const runMarker = path.join(path.dirname(outPath), '.gen_batch-running');
  if (!args['dry-run']) {
    const reqPerMin = Math.round(60000 / delay);
    const bucketPct = Math.min(100, Math.round(reqPerMin / 10 * 100));
    const estMin    = Math.max(1, Math.ceil(totalRequests * delay / 60000));
    console.log('  ! SHARED rate-limit: ~' + reqPerMin + ' of 10 req/min (~' + bucketPct +
      '% of the IP bucket) for ~' + estMin + ' min.');
    console.log('    Other anonymous traffic on this IP hits 429 ("the runes are quiet") meanwhile.' +
      (args['solo'] ? '' : ' --solo goes faster if nobody else is on.'));
    console.log('');
    try {
      fs.writeFileSync(runMarker, JSON.stringify({ pid: process.pid, started: genTs,
        requests: totalRequests, est_minutes: estMin, req_per_min: reqPerMin, out: outPath }, null, 2), 'utf8');
      // Clear the marker however we exit — clean finish, thrown error, or Ctrl-C.
      process.on('exit', function () { try { fs.unlinkSync(runMarker); } catch (e) {} });
    } catch (e) { /* marker is best-effort */ }
  }

  // Rows stream out with appendFileSync (a crash keeps what already came back). That means
  // the file must be TRUNCATED here, or a re-run silently mixes into the previous batch while
  // .meta.json — written fresh every run — claims only the last one. A measured batch that
  // quietly contains two runs is worse than no batch. --append opts back in deliberately.
  if (!args['append']) {
    for (const f of [outPath, txtPath, askTxtPath]) {
      try { if (fs.existsSync(f)) fs.writeFileSync(f, '', 'utf8'); } catch (e) { /* best-effort */ }
    }
  }

  fs.writeFileSync(outPath + '.meta.json', JSON.stringify({
    source: 'synthetic', gen_ts: genTs, argv: process.argv.slice(2),
    append_mode: !!args['append'],
    prompt_version: PROMPT_VERSION, lang: lang, spread: spreadName,
    max_tokens: maxTokens, spread_cost: spreadCost, season_bucket: seasonBucket,
    system_sha256: sysSha, system_prompt: sysPrompt, active_char: null,
    note: 'activeChar is null here; production loads runar_character where active=true. ' +
          'If such a row exists, the production system prompt differs from this batch.',
  }, null, 2), 'utf8');

  // ── request plumbing ──
  let lastRequestAt = 0;
  async function throttle() {
    const wait = lastRequestAt + delay - Date.now();
    if (wait > 0) await new Promise(function (r) { setTimeout(r, wait); });
    lastRequestAt = Date.now();
  }

  async function post(prompt, tokens, cost, mode) {
    // Mirrors the production wire body (runar-app.js:1097). We send the publishable
    // key the way the existing scripts/utils harnesses do; it is not a JWT, so
    // auth.getUser() finds no user and we stay anonymous either way.
    const ctrl  = new AbortController();
    const timer = setTimeout(function () { ctrl.abort(); }, REQUEST_TIMEOUT);
    try {
      const res = await fetch(PROXY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + EVAL_TOKEN },
        body: JSON.stringify({
          system: sysPrompt, prompt: prompt, max_tokens: tokens,
          use_credit: false, spread_cost: cost, journal: null, mode: mode,
        }),
        signal: ctrl.signal,
      });
      const raw = await res.text();
      let data = null;
      try { data = JSON.parse(raw); } catch (e) { /* platform failures return an HTML gateway page */ }
      return { status: res.status, data: data, raw: raw };
    } catch (e) {
      return { status: 0, data: null, raw: '', netError: String((e && e.message) || e) };
    } finally { clearTimeout(timer); }
  }

  // 503 covers genuine overload AND permanent 4xx (index.ts:621 has no status
  // passthrough), so retries are capped — a malformed request must not loop forever.
  async function generate(prompt, tokens, cost, mode) {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      await throttle();
      const t0 = Date.now();
      const r  = await post(prompt, tokens, cost, mode);
      const ms = Date.now() - t0;
      if (r.status === 200 && r.data && typeof r.data.text === 'string')
        return { text: r.data.text, status: 200, ms: ms, error: null };
      const err = r.netError ||
                  (r.data && (r.data.error + (r.data.message ? ': ' + r.data.message : ''))) ||
                  ('http ' + r.status + ' ' + r.raw.slice(0, 120));
      const retriable = r.status === 429 || r.status === 503 || r.status === 0;
      console.warn('    ! ' + err + (retriable && attempt < MAX_RETRIES ? '  (retry ' + (attempt + 1) + '/' + MAX_RETRIES + ')' : ''));
      if (!retriable || attempt === MAX_RETRIES) return { text: null, status: r.status, ms: ms, error: err };
      await new Promise(function (res) { setTimeout(res, 2000 * (attempt + 1)); });
    }
  }

  function pickRunes() {
    if (forcedRunes) return forcedRunes.slice();
    const pool = RUNES.filter(function (r) { return args['allow-blank'] ? true : r.n !== 'Blank'; });
    const picked = [];
    if (forcedRune) picked.push(forcedRune);
    while (picked.length < spec.count) {
      const cand = pool[Math.floor(Math.random() * pool.length)];
      // Production forbids duplicates inside a spread (_syncGridUsed); the builders do not.
      if (picked.indexOf(cand) === -1) picked.push(cand);
    }
    return picked;
  }

  function detectAngle(prompt) {
    // Single only — _randomAngle has exactly one call site (runar-character.js:862).
    if (spreadName !== 'single') return { angle: null, angle_idx: -1 };
    const pool = G(lang === 'is' ? 'READING_ANGLES_IS' : 'READING_ANGLES');
    const hits = pool.filter(function (a) { return prompt.indexOf(a) !== -1; });
    return hits.length === 1
      ? { angle: hits[0], angle_idx: pool.indexOf(hits[0]) }
      : { angle: null, angle_idx: -1 };
  }

  // ── the run ──
  let ok = 0, failed = 0;
  for (let i = 0; i < jobs.length; i++) {
    setLang(lang); // rn()/rk() read the global — reset it before EVERY build
    const runes = jobs[i].runes;
    const jobLife = lifeMirror ? runes[0] : lifeRune;  // --life-rune self: life == drawn (self-reference probe)
    const u = {
      name: name, d: null, m: null, y: null, lifeRune: jobLife,
      area: area, seeking: seeking, intention: intention, question: args.question || '',
    };

    const prompt = (spreadName === 'single')
      ? call(spec.builder, [u, runes[0], lang, []])
      : call(spec.builder, [u, runes, lang, []]);

    const angle = detectAngle(prompt);
    const row = {
      source: 'synthetic',
      seq: i + 1,
      pass: jobs[i].pass,
      gen_ts: genTs,
      prompt_version: PROMPT_VERSION,
      // The proxy never reports which model answered — the fallback chain
      // (opus-4-8 -> opus-4-7 -> sonnet-5) is invisible to the caller
      // (index.ts:662-670 returns text only). Requested != confirmed.
      model_requested: 'claude-opus-4-8',
      model_actual: null,
      lang: lang,
      spread: spreadName,
      rune: runes[0].n,
      runes: runes.map(function (r) { return r.n; }),
      life_rune: jobLife ? jobLife.n : null,
      area: area || null, seeking: seeking || null, intention: intention || null,
      question: args.question || null,
      name: name, user_gender: gender, season_bucket: seasonBucket,
      angle: angle.angle, angle_idx: angle.angle_idx,
      max_tokens: maxTokens, spread_cost: spreadCost,
      // Builders are non-deterministic (random angle, name placement, ending shape,
      // keyword shuffle, seasonal bag) — the exact prompt cannot be reconstructed later.
      prompt: prompt,
      system_sha256: sysSha,
      http_status: null, error: null, duration_ms: null,
      parse_ok: null, reading_text: null, raw_text: null,
      char_count: null, word_count: null,
      ask: [],
    };

    if (args['dry-run']) {
      row.error = 'dry-run';
      fs.appendFileSync(outPath, JSON.stringify(row) + '\n', 'utf8');
      console.log('  [' + (i + 1) + '/' + jobs.length + '] dry-run · ' + row.runes.join(',') + ' · prompt ' + prompt.length + ' ch');
      continue;
    }

    const res = await generate(prompt, maxTokens, spreadCost, '');
    row.http_status = res.status; row.duration_ms = res.ms; row.error = res.error;

    if (res.text !== null) {
      const parsed = parseSegments(res.text);
      // parseSegments falls back to the raw string when the JSON envelope is missing
      // or malformed — that would poison a char-count metric silently, so flag it.
      row.parse_ok     = parsed.segs.length > 0;
      row.reading_text = parsed.reading;
      row.raw_text     = res.text;
      row.char_count   = parsed.reading.length;
      row.word_count   = parsed.reading.split(/\s+/).filter(Boolean).length;
      fs.appendFileSync(txtPath, oneLine(parsed.reading) + '\n', 'utf8');

      for (const q of args.fu) {
        setLang(lang);
        // Production quotes back the COMPOSED reading and the rune names the model
        // itself echoed in its JSON (runar-reading.js:528-532). `runes` here is a
        // comma-joined STRING — passing rune objects yields [object Object].
        const runeStr = parsed.segs.length
          ? parsed.segs.map(function (s) { return s.rune; }).join(', ')
          : runes.map(function (r) { return call('rn', [r]); }).join(', ');
        const askPrompt = call('buildAskPrompt', [parsed.reading, q, runeStr, lang, []]);
        const a = await generate(askPrompt, ASK_TOKENS, G('SPREAD_COSTS').single.credits, 'ask');
        row.ask.push({
          question: q, answer: a.text, prompt: askPrompt,
          http_status: a.status, error: a.error, duration_ms: a.ms,
          char_count: a.text ? a.text.length : null,
        });
        if (a.text) fs.appendFileSync(askTxtPath, oneLine(a.text) + '\n', 'utf8');
      }
      ok++;
      console.log('  [' + (i + 1) + '/' + jobs.length + '] ok · ' + row.runes.join(',') +
        ' · ' + row.char_count + ' ch' + (row.parse_ok ? '' : '  [PARSE FAILED — raw stored]') +
        (row.ask.length ? ' · +' + row.ask.length + ' fu' : ''));
    } else {
      failed++;
      console.log('  [' + (i + 1) + '/' + jobs.length + '] FAILED · ' + res.error);
    }

    fs.appendFileSync(outPath, JSON.stringify(row) + '\n', 'utf8');
  }

  console.log('\n  done — ' + ok + ' ok, ' + failed + ' failed');
  console.log('  jsonl : ' + outPath);
  if (fs.existsSync(txtPath))    console.log('  text  : ' + txtPath + '   (python -X utf8 is-grammar-qa.py <this>)');
  if (fs.existsSync(askTxtPath)) console.log('  ask   : ' + askTxtPath);
  console.log('');
}

main().catch(function (e) { console.error(e); process.exit(1); });
