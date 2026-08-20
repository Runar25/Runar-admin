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

const ARM    = arg('arm', 'dnes');            // dnes | most3 | most4
const TAG    = arg('tag', 'describe-most-2026-08-20');
const RUNA   = arg('rune', '');               // pevna tazena runa
const MATRIX = arg('matrix', '');             // area | life | (prazdne = nahodny kontext)
const DELKA  = arg('delka', '');              // pevna3 | pevna4 | rozsah | los

// ── KANDIDAT: pravidlo „pojmenuj runu a uvaz k ni obraz" ────────────────────
// PROC: obraz je pro neznaleho necitelny, kdyz ho text jen postavi vedle jmena runy.
// Zmereno na produkci: 119 z 240 anglickych cteni runu jmenem ZMINI a nikde nerekne,
// co je zac. Kvetnova staticka cteni to umela — 14 z 28 EN otevira „the rune of …"
// a obraz na to navazuje. Tohle je navrat OCISTENY (§26): ne cely registr `direct`
// (ten rozpojuje obraz od toho, k cemu je), jen jeho pravidlo `describe`, prepsane tak,
// aby obraz zustal a byl k rune primo uvazan.
//
// ⚠️ TEXT BYDLI JEN TADY (§20). Az ho owner schvali, PRESUNE se do
// VOICE_PROFILES.focused.rules.describe v runar-config.js a tenhle blok zmizi.
const KANDIDAT_DESCRIBE = {
  en: 'NAME THE RUNE, THEN TIE THE IMAGE TO IT: say in ordinary words what this rune stands for — build it from the aspects you were given, never a fixed formula. Let the image then be what that looks like where it fell. Someone who has never heard of this rune must be able to follow it: no invented mechanism, no fate. Never tell the seeker what it means for them.',
  is: 'NEFNDU RÚNINA OG BINDU MYNDINA VIÐ HANA: segðu með hversdagslegum orðum fyrir hvað rúnin stendur — byggðu það á þeim atriðum sem þér voru gefin, aldrei á fastri formúlu. Láttu myndina svo sýna hvernig það lítur út þar sem hún féll. Sá sem hefur aldrei heyrt rúnina nefnda á að geta fylgt textanum: engin uppdiktuð skýring, engin örlög. Segðu leitandanum aldrei hvað þetta þýðir fyrir hann.',
};
// Ctvrta veta = misto pro to pojmenovani. Rozpocet NENI technicky strop, ale cas nahlas
// (~20-25 s), proto se meni cely — „limit a smis ho prekrocit" model cte jako povoleni
// k rozpinani a nedodrzi ani jedno.
// Tri-vetny rozpocet = presne to, co ma produkce dnes; drzi se tu proto, aby `los` mel
// z ceho losovat, aniz by se produkcni retezec cetl zpetne (a rozesel se s nim).
const DELKA3 = {
  en: 'One flowing reading — 3 short sentences, 38 to 45 words total. It will be read aloud, so keep every sentence lean — about 20 to 25 seconds spoken. No sections, no labels, no line breaks between thoughts.',
  is: 'Gefðu einn samfelldan lestur — 3 stuttar setningar, 38 til 45 orð alls. Hann verður lesinn upphátt, svo hafðu hverja setningu létta — um 20 til 25 sekúndur. Engar fyrirsagnir, engar hlutaskiptingar.',
};
// Ownerovo zneni jako JEDNA veta — model si vybere sam.
const DELKA_ROZSAH = {
  en: 'One flowing reading — 3 or 4 short sentences, 35 to 60 words total. It will be read aloud, so keep every sentence lean. No sections, no labels, no line breaks between thoughts.',
  is: 'Gefðu einn samfelldan lestur — 3 eða 4 stuttar setningar, 35 til 60 orð alls. Hann verður lesinn upphátt, svo hafðu hverja setningu létta. Engar fyrirsagnir, engar hlutaskiptingar.',
};
const KANDIDAT_DELKA = {
  en: 'One flowing reading — 4 short sentences, 50 to 58 words total. It will be read aloud, so keep every sentence lean — about 28 to 33 seconds spoken. No sections, no labels, no line breaks between thoughts.',
  is: 'Gefðu einn samfelldan lestur — 4 stuttar setningar, 50 til 58 orð alls. Hann verður lesinn upphátt, svo hafðu hverja setningu létta — um 28 til 33 sekúndur. Engar fyrirsagnir, engar hlutaskiptingar.',
};

// Klic: env ma prednost, jinak soubor MIMO repo. Repo je verejne, takze v nem klic
// nesmi lezet ani gitignorovany — jedno `git add -f` a je venku. Zaroven se o nej
// nema porad zadat owner (KUKY 2026-08-20), proto stabilni cesta v ~/.claude/.
const KEY_SOUBOR = require('path').join(require('os').homedir(), '.claude', 'runar-api-key.txt');
const KEY = process.env.ANTHROPIC_API_KEY
  || (fs.existsSync(KEY_SOUBOR) ? fs.readFileSync(KEY_SOUBOR, 'utf8').trim() : '');
if (!KEY && !DRY) {
  console.error('  chybi klic: ani ANTHROPIC_API_KEY v env, ani ' + KEY_SOUBOR);
  process.exit(1);
}

const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const S = { console: { log() {}, warn() {}, error() {} } };
S.window = S; S.globalThis = S; S.lang = LANG;
S.document = { getElementById: () => null, querySelector: () => null };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8'), S);

// Rameno se vklada AZ SEM, do sandboxu — produkcni soubory zustavaji nedotcene, takze
// tenhle skript nikdy nemuze omylem zmenit, co dostavaji zivi uzivatele.
// `const VOICE_PROFILES` neni vlastnost globalu (lexikalni scope kontextu), proto mutace
// pres runInContext, ne pres S.VOICE_PROFILES.
if (ARM === 'most3' || ARM === 'most4')
  vm.runInContext('VOICE_PROFILES.focused.rules = ' + JSON.stringify({ describe: KANDIDAT_DESCRIBE }) + ';', S);
if (ARM === 'most4')
  vm.runInContext('RP_SINGLE.en.length = ' + JSON.stringify(KANDIDAT_DELKA.en)
    + '; RP_SINGLE.is.length = ' + JSON.stringify(KANDIDAT_DELKA.is) + ';', S);

// most3b — tyz kandidat, ale bez SRAZKY v samotnem zadani cteni. `noqBranch` dnes
// zacina vetou „through image, not explanation" / „í myndum, ekki útskýringu", coz je
// presny opak toho, co pravidlo zada. Ta veta se tu MAZE (zbytek radky zustava), aby
// prompt rikal jednu vec. Izoluje se tim prave ona: most3 vs most3b se lisi jen ji.
if (ARM === 'most3b') {
  vm.runInContext('VOICE_PROFILES.focused.rules = ' + JSON.stringify({ describe: KANDIDAT_DESCRIBE }) + ';', S);
  vm.runInContext([
    'RP_SINGLE.en.noqBranch = function (rune, g, world) {',
    '  return "Mention " + rune + " by name once, woven naturally. One clear insight is enough — do not pack everything in.";',
    '};',
    'RP_SINGLE.is.noqBranch = function (rune, g, world) {',
    '  return "Nefndu " + rune + " einu sinni og fléttaðu nafnið náttúrlega inn í textann. Ein skýr innsýn nægir — ekki troða öllu inn.";',
    '};',
  ].join(''), S);
}

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

// §19 — ramenu se neveri, dokud se neprojevi na TE PLOSE, kde ma ucinkovat. Bez tehle
// kontroly by `--arm most3` mohl tise generovat presne to, co dnesek, a nikdo by nepoznal
// rozdil od „to pravidlo nic nedela".
(function overRameno() {
  const u = { name: 'Anna', area: nahodne(AREAS), seeking: nahodne(SEEKS), intention: nahodne(INTENT), question: '', lifeRune: null };
  const zk = STAVITEL[SPREAD](u, vzorek(), LANG);
  const znacka = KANDIDAT_DESCRIBE[LANG].slice(0, 40);
  const jeTam = zk.indexOf(znacka) !== -1;
  if (ARM === 'dnes' && jeTam) { console.error('  RAMENO dnes, ale kandidat V PROMPTU JE'); process.exit(1); }
  if (ARM !== 'dnes' && !jeTam) { console.error('  RAMENO ' + ARM + ': kandidat se do promptu NEVLOZIL'); process.exit(1); }
  // §19 — u most3b se musi PROKAZAT i to druhe: srazkova veta z promptu zmizela.
  const SRAZKA = { en: 'through image, not explanation', is: 'í myndum, ekki útskýringu' }[LANG];
  const maSrazku = zk.indexOf(SRAZKA) !== -1;
  if (ARM === 'most3b' && maSrazku) { console.error('  RAMENO most3b: srazkova veta v promptu PORAD JE'); process.exit(1); }
  if (ARM !== 'most3b' && !maSrazku) { console.error('  POZOR: srazkova veta v promptu chybi i mimo most3b — zmenil ji nekdo?'); process.exit(1); }
  if (ARM === 'most4' && zk.indexOf(KANDIDAT_DELKA[LANG].slice(0, 40)) === -1) {
    console.error('  RAMENO most4: nova delka se do promptu NEVLOZILA'); process.exit(1); }
  // proud se reseeduje na zacatku KAZDEHO cteni (preseed), takze tahle kontrola nic nerozhodi
})();

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

let radekDelka = null;
async function jedno(i) {
  preseed(i);   // od tohohle bodu je cteni c. i bit po bitu stejne ve vsech ramenech
  const runy = vzorek();
  // MATRIX = drz vsechno ostatni pevne a menit jen jednu vec, jinak se rozdil mezi
  // oblastmi neda odlisit od rozdilu mezi nahodnym zamerem a nahodnym hledanim.
  const u = MATRIX
    ? { name: 'Anna', area: MATRIX === 'area' ? AREAS[i % AREAS.length] : '',
        seeking: SEEKS[1] || SEEKS[0], intention: INTENT[0], question: '',
        lifeRune: MATRIX === 'life' ? RUNES[18] : null }
    : { name: 'Anna', area: nahodne(AREAS), seeking: nahodne(SEEKS),
        intention: nahodne(INTENT), question: '', lifeRune: null };
  // Delka se vybira PRED stavbou promptu — builder si `S.length` cte az v ni.
  if (DELKA) {
    const zvoleno = DELKA === 'pevna3' ? DELKA3
      : DELKA === 'pevna4' ? KANDIDAT_DELKA
      : DELKA === 'rozsah' ? DELKA_ROZSAH
      : (rnd() < 0.5 ? DELKA3 : KANDIDAT_DELKA);
    vm.runInContext('RP_SINGLE.' + LANG + '.length = ' + JSON.stringify(zvoleno[LANG]) + ';', S);
    radekDelka = zvoleno === DELKA3 ? '3' : zvoleno === KANDIDAT_DELKA ? '4' : 'rozsah';
  }
  let prompt = STAVITEL[SPREAD](u, runy, LANG);
  if (BEZ_UHLU) prompt = odeberUhel(prompt);
  const radek = { source: 'gen_direct', synthetic: true, delka: radekDelka, matrix: MATRIX || null, runes: runy.map((r) => r.n), spread: SPREAD,
                  lang: LANG, area: u.area, seeking: u.seeking, intention: u.intention,
                  model: 'claude-opus-4-8', batch: TAG + '-' + ARM, arm: ARM,
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
    'gen-' + SPREAD + '-' + LANG + '-' + ARM + (MATRIX ? '-' + MATRIX : '')
    + (DELKA ? '-' + DELKA : '') + (BEZ_UHLU ? '-bezuhlu' : '') + (DRY ? '-dryrun' : '') + '-' + TAG + '.jsonl');
  console.log('  ' + SPREAD + ' · ' + LANG + ' · rameno ' + ARM + ' · n=' + N + ' · ' + pocet + ' run · max_tokens ' + tokeny
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
