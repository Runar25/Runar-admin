// Generuje davku PRIMO pres Claude API — obchazi proxy, protoze admin JWT do proxy
// vyprsel a owner dal misto nej API klic. Prompty stavi TYMIZ buildery jako produkce,
// takze se meri totez; lisi se jen doprava.
//
// Proc vubec: uhel cteni (`angleIntro`) ma JEN `RP_SINGLE`. Jestli spready bez nej vic
// splyvaji, nesla ta otazka rozhodnout — archiv ma 923 single, ale 23 norns a 0 islandskych,
// a sum uvnitr single (0,0002 vs 0,0029) byl vetsi nez rozdil mezi rameny.
//
// Klic se bere z env ANTHROPIC_API_KEY a NIKDY se nikam nevypisuje ani neuklada.
//   node scripts/utils/gen_direct.js --spread norns --lang is --n 50
const fs = require('fs'), path = require('path'), vm = require('vm');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const SPREAD = arg('spread', 'norns');
const LANG   = arg('lang', 'is');
const N      = parseInt(arg('n', '50'), 10);
const DRY    = process.argv.includes('--dry-run');
const TAG    = arg('tag', 'davka');
const RUNA   = arg('rune', '');               // pevna tazena runa
const MATRIX = arg('matrix', '');             // area | life | zadny (jinak nahodny kontext)
const BEZ_OBL = process.argv.includes('--bez-oblasti');   // vypni JEN oblast, zbytek nech nahodny

// Klic: env ma prednost, jinak soubor MIMO repo. Repo je verejne, takze v nem klic nesmi
// lezet ani gitignorovany — jedno `git add -f` a je venku. Zaroven se o nej nema porad
// zadat owner (KUKY 2026-08-20), proto stabilni cesta v ~/.claude/.
const KEY_SOUBOR = require('path').join(require('os').homedir(), '.claude', 'runar-api-key.txt');
const KEY = process.env.ANTHROPIC_API_KEY
  || (fs.existsSync(KEY_SOUBOR) ? fs.readFileSync(KEY_SOUBOR, 'utf8').trim() : '');
if (!KEY && !DRY) {
  console.error('  chybi klic: ani ANTHROPIC_API_KEY v env, ani ' + KEY_SOUBOR);
  process.exit(1);
}

// Ramena kandidatu (`--arm`, `--zakonceni`, `--domeny`, `--delka`) ODSTRANENA 2026-08-21:
// vsechny ty texty se migraci presunuly do produkce, takze tady uz byly druhou kopii.
// Generator ted jede VZDY po produkcni ceste; menit se da jen to, co produkce nevlastni
// (ktera runa, jaka oblast, vypnuty uhel).
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const S = { console: { log() {}, warn() {}, error() {} } };
S.window = S; S.globalThis = S; S.lang = LANG;
S.document = { getElementById: () => null, querySelector: () => null };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8'), S);

const RUNES  = vm.runInContext('RUNES', S);
// AREAS/SEEKS/INTENTIONS jsou mapy PODLE JAZYKA ({en:[...], is:[...], norns:[...]}),
// takze `Object.keys` by dalo jazyky, ne volby. Overeno na pilotu: do promptu slo area="norns".
const zJazyka = (jm) => (vm.runInContext('typeof ' + jm + ' !== "undefined" ? ' + jm + ' : {}', S) || {})[LANG] || [];
const AREAS  = zJazyka('AREAS');
const SEEKS  = zJazyka('SEEKS');
const INTENT = zJazyka('INTENTIONS');
const MODES  = vm.runInContext('RUNAR_MODES', S) || {};
const CFG    = vm.runInContext('SPREAD_CONFIG', S) || {};
const pocet  = (CFG[SPREAD] && CFG[SPREAD].rune_count) || 3;
const tokeny = (CFG[SPREAD] && CFG[SPREAD].tokens) || (MODES.quick_reading && MODES.quick_reading.max_tokens) || 900;

// Stejne runy, stejny kontext I STEJNE PAKY ve vsech ramenech — jinak se neporovnavaji
// dve pravidla, ale dve ruzna zadani. Uhel, obraz i vyber klicu losuji PRODUKCNI buildery
// pres Math.random uvnitr sandboxu, takze seedovat vnejsi vyber nestaci: preseditelny musi
// byt tentyz proud, ktery cte builder. Proto se Math.random v sandboxu nahrazuje a cely
// vyber (i ten vnejsi) z nej cerpa — jeden proud, jedno reseed misto.
const SEED0 = 20260820;
vm.runInContext('var __seed = ' + SEED0 + '; Math.random = function () { __seed = (__seed * 1103515245 + 12345) % 2147483648; return __seed / 2147483648; };', S);
const rnd = () => vm.runInContext('Math.random()', S);
// Reseed PODLE INDEXU cteni: cteni c. 3 dostane v kazdem rameni tytez paky.
const preseed = (i) => vm.runInContext('__seed = ' + (SEED0 + i * 7919) + ';', S);
const nahodne = (a) => a[Math.floor(rnd() * a.length)];
const RUNA_OBJ = RUNA ? RUNES.filter((r) => r.n.toLowerCase() === RUNA.toLowerCase())[0] : null;
if (RUNA && !RUNA_OBJ) { console.error('  neznama runa: ' + RUNA); process.exit(1); }
function vzorek() {
  if (RUNA_OBJ) { const a = [RUNA_OBJ]; for (let i = 1; i < pocet; i++) a.push(RUNES[i]); return a; }
  const kopie = RUNES.slice();
  const tazene = [];
  for (let i = 0; i < pocet; i++) tazene.push(kopie.splice(Math.floor(rnd() * kopie.length), 1)[0]);
  return tazene;
}
const STAVITEL = {
  // single bere JEDNU runu, ne pole — buildReadingPromptSingle uvnitr vola rk(drawn)/rn(drawn)
  single: (u, r, l) => S.buildReadingPrompt(u, r[0], l, null),
  norns: (u, r, l) => S.buildNornsPrompt(u, r, l, null),
  kriz: (u, r, l) => S.buildKrizPrompt(u, r, l, null),
  horseshoe: (u, r, l) => S.buildHorseshoePrompt(u, r, l, null),
  yggdrasil: (u, r, l) => S.buildYggdrasilPrompt(u, r, l, null),
};
if (!STAVITEL[SPREAD]) { console.error('  neznamy spread: ' + SPREAD); process.exit(1); }

const sys = S.buildSysPrompt(null, LANG);

// Radkove vypnuti uhlu — tyz postup jako `gen_batch.js` (marker = prvnich 30 znaku
// `RP_SINGLE[lang].angleIntro`, zahodi se radka, ktera jim ZACINA). Nevymyslet druhy
// zpusob: dve cesty ke stejne pace by se rozesly (§18).
const BEZ_UHLU = process.argv.includes('--without') &&
  String(process.argv[process.argv.indexOf('--without') + 1] || '').split(',').includes('angle');
function odeberUhel(p) {
  const pack = vm.runInContext('typeof RP_SINGLE !== "undefined" ? RP_SINGLE : null', S);
  const marker = pack && (pack[LANG] || pack.en) && (pack[LANG] || pack.en).angleIntro;
  if (!marker) { console.error('  POZOR: angleIntro v packu nenalezen, uhel se NEODEBRAL'); return p; }
  const hlava = String(marker).slice(0, 30);
  const zbylo = p.split(String.fromCharCode(10)).filter((l) => l.indexOf(hlava) !== 0);
  if (zbylo.length === p.split(String.fromCharCode(10)).length) console.error('  POZOR: radka s uhlem v promptu nenalezena');
  return zbylo.join(String.fromCharCode(10));
}

async function jedno(i) {
  preseed(i);   // od tohohle bodu je cteni c. i bit po bitu stejne ve vsech ramenech
  const runy = vzorek();
  // Oblast se losuje VZDY, i kdyz ji `--bez-oblasti` zahodi — jinak by se posunulo poradi
  // tahu v proudu a rameno by dostalo jine hledani i zamer nez to, proti kteremu se meri.
  const _losOblast = MATRIX ? null : nahodne(AREAS);
  const _oblast = BEZ_OBL ? '' : _losOblast;
  // MATRIX = drz vsechno ostatni pevne a menit jen jednu vec, jinak se rozdil mezi
  // oblastmi neda odlisit od rozdilu mezi nahodnym zamerem a nahodnym hledanim.
  const u = MATRIX
    ? { name: 'Anna', area: MATRIX === 'area' ? AREAS[i % AREAS.length] : '',
        seeking: SEEKS[1] || SEEKS[0], intention: INTENT[0], question: '',
        lifeRune: MATRIX === 'life' ? RUNES[18] : null }
    : { name: 'Anna', area: _oblast, seeking: nahodne(SEEKS),
        intention: nahodne(INTENT), question: '', lifeRune: null };
  let prompt = STAVITEL[SPREAD](u, runy, LANG);
  if (BEZ_UHLU) prompt = odeberUhel(prompt);
  const radek = { source: 'gen_direct', synthetic: true, matrix: MATRIX || null, runes: runy.map((r) => r.n), spread: SPREAD,
                  lang: LANG, area: u.area, seeking: u.seeking, intention: u.intention,
                  model: 'claude-opus-4-8', batch: TAG,
                  without: BEZ_UHLU ? 'angle' : null,
                  generated_at: new Date().toISOString() };
  // Cely prompt jen v dry-runu: je to jediny zpusob, jak DOKAZAT, ze se ramena lisi
  // pouze pravidlem (diff), ne nahodou v pakach. Soubor je v gitignored eval_out/.
  if (DRY) { radek.reading_text = '(dry-run)'; radek.prompt_znaku = prompt.length; radek.prompt = prompt; return radek; }
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-opus-4-8', max_tokens: tokeny,
      // stejny tvar jako proxy: system jako pole, zaklad cachovany
      system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  radek.http_status = res.status;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { radek.error = (data.error && data.error.message) || ('HTTP ' + res.status); return radek; }
  const syrovy = (data.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('').trim();
  // Spready vraci JSON pole [{rune,text}]. Produkce ho prozene `_parseSegments()` a uklada
  // PROZU — archiv vypada tak. Stejny parser tedy i tady, jinak by se meril JSON.
  const rozlozeno = (typeof S._parseSegments === 'function') ? S._parseSegments(syrovy) : null;
  radek.reading_text = (rozlozeno && rozlozeno.reading) ? rozlozeno.reading : syrovy;
  radek.raw_json = (rozlozeno && rozlozeno.reading && rozlozeno.reading !== syrovy) ? true : false;
  radek.usage = data.usage;
  return radek;
}

(async () => {
  const OUT = path.join('C:/Users/zkuku/Downloads/Runar-admin/eval_out/archive',
    'gen-' + SPREAD + '-' + LANG + (MATRIX ? '-' + MATRIX : '') + (BEZ_OBL ? '-bezoblasti' : '')
    + (BEZ_UHLU ? '-bezuhlu' : '') + (DRY ? '-dryrun' : '') + '-' + TAG + '.jsonl');
  console.log('  ' + SPREAD + ' · ' + LANG + ' · n=' + N + ' · ' + pocet + ' run · max_tokens ' + tokeny
    + (DRY ? '  (DRY-RUN, nic se nevola)' : ''));
  const hotovo = [];
  const SOUB = 4;   // mirna soubeznost, at to nenarazi na rate limit
  for (let i = 0; i < N; i += SOUB) {
    const davka = [];
    for (let j = i; j < Math.min(i + SOUB, N); j++) davka.push(jedno(j));
    const v = await Promise.all(davka);
    hotovo.push(...v);
    const chyb = hotovo.filter((x) => x.error).length;
    process.stdout.write('\r  hotovo ' + hotovo.length + '/' + N + (chyb ? '  chyb: ' + chyb : '') + '   ');
  }
  fs.writeFileSync(OUT, hotovo.map((x) => JSON.stringify(x)).join('\n') + '\n', 'utf8');
  const ok = hotovo.filter((x) => x.reading_text && !x.error);
  const vst = hotovo.reduce((s, x) => s + ((x.usage && x.usage.input_tokens) || 0), 0);
  const vyst = hotovo.reduce((s, x) => s + ((x.usage && x.usage.output_tokens) || 0), 0);
  const cache = hotovo.reduce((s, x) => s + ((x.usage && x.usage.cache_read_input_tokens) || 0), 0);
  console.log('\n  zapsano: ' + OUT);
  console.log('  uspesnych ' + ok.length + '/' + N
    + '  ·  tokeny vstup ' + vst + ' (z cache ' + cache + ') · vystup ' + vyst);
  const chyby = hotovo.filter((x) => x.error).slice(0, 3);
  for (const c of chyby) console.log('  CHYBA: ' + c.error);
})();
