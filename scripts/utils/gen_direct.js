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

const KEY = process.env.ANTHROPIC_API_KEY;
if (!KEY && !DRY) { console.error('  chybi ANTHROPIC_API_KEY v env'); process.exit(1); }

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

const nahodne = (a) => a[Math.floor(Math.random() * a.length)];
function vzorek() {
  const kopie = RUNES.slice();
  const tazene = [];
  for (let i = 0; i < pocet; i++) tazene.push(kopie.splice(Math.floor(Math.random() * kopie.length), 1)[0]);
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
  const runy = vzorek();
  const u = { name: LANG === 'is' ? 'Anna' : 'Anna', area: nahodne(AREAS), seeking: nahodne(SEEKS),
              intention: nahodne(INTENT), question: '', lifeRune: null };
  let prompt = STAVITEL[SPREAD](u, runy, LANG);
  if (BEZ_UHLU) prompt = odeberUhel(prompt);
  const radek = { source: 'gen_direct', synthetic: true, runes: runy.map((r) => r.n), spread: SPREAD,
                  lang: LANG, area: u.area, seeking: u.seeking, intention: u.intention,
                  model: 'claude-opus-4-8', batch: 'norns-uhel-2026-08-18',
                  without: BEZ_UHLU ? 'angle' : null,
                  generated_at: new Date().toISOString() };
  if (DRY) { radek.reading_text = '(dry-run)'; radek.prompt_znaku = prompt.length; return radek; }
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
    'gen-' + SPREAD + '-' + LANG + (BEZ_UHLU ? '-bezuhlu' : '') + (DRY ? '-dryrun' : '') + '-uhel-2026-08-18.jsonl');
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
