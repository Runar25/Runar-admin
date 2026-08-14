// ═══════════════════════════════════════════════════════
// RÚNAR · lint_prompts.js — kontrola PROMPTU, ne výstupu
//
// Proč existuje: vada z 2026-08-13 (věta vkládající obraz ho prohlašovala za „nature
// image", ačkoli 17 z 81 obrazů jsou lidské scény) se našla NÁHODOU — testerka narazila
// na jednu ze tří procent kombinací a napsala „I don't understand this". Pětina všech
// čtení nesla nesourodou větu měsíc a nikdo si jí nevšiml.
//
// Golden staví 32 fixtures. Kombinací je 25 run × 7 úhlů × 6 sezón × 2 jazyky = 2100
// a postavit je nestojí nic — model se nevolá. Testuje se tedy ~1,5 % plochy.
// Tenhle nástroj postaví VŠECHNY a pustí přes ně pravidla.
//
//   node scripts/utils/lint_prompts.js            # rozpis + pravidla
//   node scripts/utils/lint_prompts.js --budget   # jen rozpis slotů podle délky
//   node scripts/utils/lint_prompts.js --dup      # jen duplicitní instrukce
//
// Nevolá síť, nestojí nic. Nálezy vypisuje; NEvrací exit 1 — duplicita v promptu je
// věc k rozhodnutí, ne rozbitý build (na tvrdé brány je smoke).
// ═══════════════════════════════════════════════════════
'use strict';

const fs = require('fs');
const vm = require('vm');
const path = require('path');

const DIR = path.join(__dirname, '..', '..', 'v2');
const argv = process.argv.slice(2);
const only = argv.includes('--budget') ? 'budget' : argv.includes('--dup') ? 'dup' : argv.includes('--lang') ? 'lang' : argv.includes('--map') ? 'map' : null;

// ── sandbox: tytéž produkční buildery, žádná kopie ────────────────────────
function sandbox() {
  const bag = {};
  const M = {};
  Object.getOwnPropertyNames(Math).forEach((k) => { M[k] = Math[k]; });
  M.random = () => 0.5;                       // los se řídí přepisem níž, ne náhodou
  const ctx = {
    Math: M, JSON, Date, console,
    setTimeout: () => 0, clearTimeout: () => {},
    localStorage: {
      getItem: (k) => (k in bag ? bag[k] : null),
      setItem: (k, v) => { bag[k] = String(v); },
      removeItem: (k) => { delete bag[k]; },
    },
    document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] },
  };
  ctx.window = ctx; ctx.self = ctx; ctx.globalThis = ctx;
  vm.createContext(ctx);
  vm.runInContext('var lang="en"; var userGender="hk"; var corrections=[]; var currentUser=null;', ctx);
  for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
    vm.runInContext(fs.readFileSync(path.join(DIR, f), 'utf8'), ctx, { filename: f });
  return ctx;
}
const ctx = sandbox();
const G = (e) => vm.runInContext(e, ctx);

const RUNES = G('RUNES');
const BUCKETS = Object.keys(G('SEASON_POOLS'));
const LANGS = ['en', 'is'];

// ── celá plocha: runa × úhel × sezóna × jazyk ────────────────────────────
function buildAll() {
  const out = [];
  for (const lg of LANGS) {
    const angles = G(lg === 'is' ? 'READING_ANGLES_IS' : 'READING_ANGLES');
    for (let ai = 0; ai < angles.length; ai++) {
      // Úhel i sezóna se přepisují v sandboxu — jinak by je řídila náhoda a dnešní
      // datum, takže by se každý běh díval na jinou podmnožinu plochy.
      vm.runInContext('_randomAngle = function (l) { return (l === "is" ? READING_ANGLES_IS : READING_ANGLES)[' + ai + ']; };', ctx);
      for (const b of BUCKETS) {
        vm.runInContext('_seasonBucket = function () { return ' + JSON.stringify(b) + '; };', ctx);
        for (const r of RUNES) {
          vm.runInContext('lang = ' + JSON.stringify(lg) + ';', ctx);
          const u = { name: 'Anna', area: null, seeking: null, intention: '', question: '', d: 15, m: 6, y: 1990, lifeRune: null };
          let p;
          try { p = G('buildReadingPrompt')(u, r, lg, []); } catch (e) { p = 'ERROR: ' + e.message; }
          out.push({ lang: lg, angle: ai, bucket: b, rune: r.n, prompt: p });
        }
      }
    }
  }
  return out;
}

const all = buildAll();
const err = all.filter((x) => x.prompt.startsWith('ERROR:'));
console.log('\n  postaveno ' + all.length + ' promptu  (' + RUNES.length + ' run x ' +
  G('READING_ANGLES').length + ' uhlu x ' + BUCKETS.length + ' sezon x ' + LANGS.length + ' jazyky)' +
  (err.length ? '   !! ' + err.length + ' skoncilo chybou' : ''));
if (err.length) { console.log('    ' + err[0].prompt.slice(0, 160)); process.exit(1); }

const words = (t) => t.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter(Boolean);
const wc = (t) => t.split(/\s+/).filter(Boolean).length;

// ── ROZPIS: co kolik stojí ────────────────────────────────────────────────
// Slot = jedna řádka promptu (buildery je spojují novým řádkem). Nepotřebuje seznam
// helperů, takže se nemá jak rozejít s kódem — na rozdíl od ručně vedené tabulky.
function budget() {
  console.log('\n  -- rozpis promptu: co kolik slov stoji --');
  for (const lg of LANGS) {
    const sys = G('buildSysPrompt')(null, lg);
    const one = all.find((x) => x.lang === lg && x.angle === 0);
    const sysW = wc(sys), readW = wc(one.prompt);
    console.log('\n   ' + lg.toUpperCase() + '  systemovy ' + sysW + '  ·  ctecí ' + readW +
      '  ·  celkem ' + (sysW + readW) + ' slov   (systemovy = ' +
      Math.round(sysW / (sysW + readW) * 100) + ' % vseho)');
    one.prompt.split('\n').filter((l) => l.trim())
      .map((l) => ({ w: wc(l), t: l })).sort((a, b) => b.w - a.w).slice(0, 8)
      .forEach((x) => console.log('     ' + String(x.w).padStart(3) + ' slov  ' +
        Math.round(x.w / readW * 100).toString().padStart(2) + ' %  ' + x.t.slice(0, 72)));
  }
}

// ── PRAVIDLO: táž instrukce ve dvou slotech ──────────────────────────────
// §20 uvnitř promptu. `check-docs.py` hlídá dokumentaci; prompt nehlídal nikdo, a přesně
// tenhle druh duplikátu (věta o obrazu vs. DEF_CHAR pravidlo 4) stál za vadou z 08-13.
function dup() {
  console.log('\n  -- pravidlo: taz instrukce ve dvou slotech --');
  const MIN = 5;
  const STOP = /^(a|the|and|of|to|in|it|is|that|not|one|you|your|og|að|í|er|sem|hann|hún|það|þú|ekki|á|um)$/i;

  // Nejdelší společná posloupnost slov mezi DVOJICÍ bloků. N-gramy tu nestačily:
  // překryvná okna z jedné shody hlásila týž nález třikrát a nešla slepit (nejsou
  // navzájem podřetězce). Takhle vyjde na dvojici jeden nález, a je to ten nejdelší.
  function longestRun(A, B) {
    let best = [];
    const dp = Array(B.length + 1).fill(0);
    for (let i = 1; i <= A.length; i++) {
      let prev = 0;
      for (let j = 1; j <= B.length; j++) {
        const tmp = dp[j];
        dp[j] = A[i - 1] === B[j - 1] ? prev + 1 : 0;
        if (dp[j] > best.length) best = A.slice(i - dp[j], i);
        prev = tmp;
      }
    }
    return best;
  }

  let found = 0;
  for (const lg of LANGS) {
    const sys = G('buildSysPrompt')(null, lg);
    const one = all.find((x) => x.lang === lg && x.angle === 0);
    const blocks = sys.split('\n').filter((l) => l.trim()).map((t) => ({ src: 'systemovy', t, w: words(t) }))
      .concat(one.prompt.split('\n').filter((l) => l.trim()).map((t) => ({ src: 'ctecí   ', t, w: words(t) })));
    for (let i = 0; i < blocks.length; i++)
      for (let j = i + 1; j < blocks.length; j++) {
        const run = longestRun(blocks[i].w, blocks[j].w);
        if (run.length < MIN) continue;
        if (run.filter((x) => !STOP.test(x)).length < 3) continue;   // samá spojovací slova
        found++;
        console.log('   ' + lg.toUpperCase() + '  ' + run.length + ' slov: "' + run.join(' ') + '"');
        console.log('        ' + blocks[i].src + ': ' + blocks[i].t.slice(0, 62));
        console.log('        ' + blocks[j].src + ': ' + blocks[j].t.slice(0, 62));
      }
  }
  if (!found) console.log('   nic - zadna instrukce se neopakuje ve dvou slotech');
}


// ── PRAVIDLO: anglictina v ISLANDSKEM promptu ────────────────────────────
// §2: IS je primarni, ne obal nad anglictinou. Prvni beh (2026-08-13) nasel, ze
// `rworld()` ma jen anglicke popisky — "the living moment, what is active now" —
// a ta fraze jde do KAZDEHO islandskeho promptu, navic dvakrat. Tohle je proto
// pravidlo, ne jednorazovy nalez: kdyz nekdo pristi anglicky retezec zapomene
// prelozit, spadne to tady.
function langLeak() {
  console.log('\n  -- pravidlo: anglictina v islandskem promptu --');
  // Slova, ktera v islandstine neexistuji. Zamerne kratky seznam: radsi malo
  // jistych nez hodne spornych (kazdy falesny poplach ubira na duvere).
  const EN = new Set(['the','what','of','to','with','from','this','that','for',
                      'your','you','are','its','is','be','was','were','which',
                      'when','where','how','not','but','have','has']);
  const seen = new Map();
  for (const x of all.filter((y) => y.lang === 'is'))
    for (const line of x.prompt.split('\n')) {
      const hits = [...new Set(words(line).filter((w) => EN.has(w)))];
      if (hits.length < 2) continue;
      // JSON kontrakt nese anglicke klice zamerne - to neni preklep, to je format.
      if (/^(Skila\u00f0u|Output format)/.test(line.trim())) continue;
      const key = line.trim().slice(0, 90);
      if (!seen.has(key)) seen.set(key, { hits, runy: new Set() });
      seen.get(key).runy.add(x.rune);
    }
  if (!seen.size) { console.log('   nic - islandsky prompt je cely islandsky'); return; }
  for (const [line, v] of seen)
    console.log('   ' + v.runy.size + '/' + RUNES.length + ' run  [' + v.hits.join(' ') +
                ']  ' + line.slice(0, 62));
}


// ── --map: vygenerovat rozpis do mapy promptu ────────────────────────────
// Mapa je z vetsi casti psana rukou (vyklad, mrtve veci, proc). Ale rozpis slotu
// se z kodu ODVODIT DA — a prave ta cast se rozchazela: za dva dny ctyri rucni
// prekresleni a jednou uplny rozchod (14/14 citaci radku mimo).
// Tenhle prepis sahne JEN mezi znacky, zbytek souboru necha byt.
function mapSection(file) {
  const ver = G('typeof RUNAR_PROMPT_VERSION !== "undefined" ? RUNAR_PROMPT_VERSION : "?"');
  const rows = [];
  for (const lg of LANGS) {
    const sys = G('buildSysPrompt')(null, lg);
    const one = all.find((x) => x.lang === lg && x.angle === 0);
    rows.push({ lg, sys: wc(sys), read: wc(one.prompt),
      lines: one.prompt.split('\n').filter((l) => l.trim())
        .map((l) => ({ w: wc(l), t: l })).sort((a, b) => b.w - a.w) });
  }
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  let h = '';
  h += '<p class="sub">Generovano z kodu prikazem <code>node scripts/utils/lint_prompts.js --map</code>';
  h += ' — rucne se to needituje. Stav: <b>' + esc(ver) + '</b>, ' + all.length + ' postavenych kombinaci';
  h += ' (' + RUNES.length + ' run x ' + G('READING_ANGLES').length + ' uhlu x ' + BUCKETS.length;
  h += ' sezon x ' + LANGS.length + ' jazyky).</p>';
  for (const r of rows) {
    h += '<p class="prose"><b>' + r.lg.toUpperCase() + '</b> — systemovy <b>' + r.sys + '</b> slov';
    h += ' &middot; ctecí <b>' + r.read + '</b> &middot; celkem ' + (r.sys + r.read);
    h += '. Systemovy je <b>' + Math.round(r.sys / (r.sys + r.read) * 100) + ' %</b> vseho.</p>';
    h += '<div class="scroll"><table><thead><tr><th>slot ve ctecim promptu</th>';
    h += '<th class="num">slov</th><th class="num">%</th></tr></thead><tbody>';
    for (const x of r.lines.slice(0, 10))
      h += '<tr><td>' + esc(x.t.slice(0, 96)) + '</td><td class="num">' + x.w +
           '</td><td class="num">' + Math.round(x.w / r.read * 100) + '</td></tr>';
    h += '</tbody></table></div>';
  }
  const A = '<!-- AUTO-ROZPIS:start -->', B = '<!-- AUTO-ROZPIS:end -->';
  let src;
  try { src = fs.readFileSync(file, 'utf8'); }
  catch (e) { console.log('\n  soubor mapy nenalezen: ' + file + '\n'); return; }
  const i = src.indexOf(A), j = src.indexOf(B);
  if (i === -1 || j === -1 || j < i) {
    console.log('\n  V mape chybi znacky ' + A + ' ... ' + B + ' — nevim, kam psat.');
    console.log('  Fragment k rucnimu vlozeni:\n');
    console.log(h);
    return;
  }
  fs.writeFileSync(file, src.slice(0, i + A.length) + '\n' + h + '\n' + src.slice(j), 'utf8');
  console.log('\n  rozpis zapsan do ' + file);
}

if (!only || only === 'budget') budget();
if (!only || only === 'dup') dup();
if (!only || only === 'lang') langLeak();
if (only === 'map') mapSection(argv[argv.indexOf('--map') + 1] || '');

console.log('\n  (kontrola PROMPTU. Vystup meri measure_readings.js, dokumentaci check-docs.py.)\n');
