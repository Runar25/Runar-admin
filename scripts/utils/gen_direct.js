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
const ZAKONC = arg('zakonceni', '');          // kandidat = zakonceni, ktera netvrdi o ctenari
const DOMENY = arg('domeny', '');             // kandidat = oblasti premirene pod caru podmetu
const BEZ_OBL = process.argv.includes('--bez-oblasti');   // vypni JEN oblast, zbytek nech nahodny

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
// Ctyri oblasti, ktere dnes zadaji tvrzeni o ctenari. Klic = presny retezec z AREAS,
// protoze `_domainContext` vybira podle nej; zbyle ctyri propadnou na puvodni funkci.
// Oblast jako ZDROJ OBRAZU, ne jako cil tvrzeni (KUKY 2026-08-21). Vsech osm — mereni
// ukazalo, ze anglicky model vyrabi tvrzeni i u oblasti, ktere zadne nezadaly.
const OBRAZ_DOMENY = {
  en: {
    "Love & Relationships": 'The reading is for Love & Relationships — take the image from where two come together: a shared table, two sets of tracks, a boat rowed by two. The seeker may stand in the image; do not tell them what is true between them and anyone.',
    "Purpose & Path": 'The reading is for Purpose & Path — take the image from ways and going: a track over a pass, a river finding its bed, a bearing held in fog. The seeker may stand in the image; do not tell them where they are headed.',
    "Career & Creativity": 'The reading is for Career & Creativity — take the image from making: tools, a workbench, wool becoming yarn, a wall raised stone by stone. The seeker may stand in the image; do not tell them what they have made or achieved.',
    "Healing & Wellbeing": 'The reading is for Healing & Wellbeing — take the image from mending and rest: bone knitting, ground thawing, warmth coming back into a room. The seeker may stand in the image; no diagnosis, no verdict on their condition.',
    "The Unseen": 'The reading is for The Unseen — take the image from what is there but not shown: fog on a fjord, a sound with no source, roots under turf. The seeker may stand in the image; do not tell them what they sense.',
    "Family & Home": 'The reading is for Family & Home — take the image from a lived-in place: a doorway, a hearth, a path worn between houses. The seeker may stand in the image; do not tell them what they carry from their people.',
    "Inner Growth": 'The reading is for Inner Growth — take the image from slow change in a thing: a birch thickening, a stone worn round, ice giving way. The seeker may stand in the image; do not tell them how they have changed.',
    "Crossroads & Decisions": 'The reading is for Crossroads & Decisions — take the image from where a way divides: two tracks, a fork in a river, a gate standing open beside a closed one. The seeker may stand in the image; do not tell them what they know or which way they will take.',
  },
  is: {
    "Ást & Sambönd": 'Þessi lestur er fyrir Ást & Sambönd — sæktu myndina þangað sem tveir mætast: sameiginlegt borð, tvenn spor í snjó, bátur sem tveir róa. Leitandinn má standa í myndinni; segðu honum ekki hvað er satt milli hans og annarra.',
    "Tilgangur & Leið": 'Þessi lestur er fyrir Tilgang & Leið — sæktu myndina í leiðir og ferð: götu yfir heiði, á sem finnur sér farveg, stefnu haldið í þoku. Leitandinn má standa í myndinni; segðu honum ekki hvert hann stefnir.',
    "Starf & Sköpun": 'Þessi lestur er fyrir Starf & Sköpun — sæktu myndina í smíð og handverk: verkfæri, vinnuborð, ull sem verður að bandi, vegg hlaðinn stein fyrir stein. Leitandinn má standa í myndinni; segðu honum ekki hvað hann hefur gert eða hverju hann hefur áorkað.',
    "Heilun & Líðan": 'Þessi lestur er fyrir Heilun & Líðan — sæktu myndina í gróanda og hvíld: bein sem grær, jörð sem þiðnar, hlýju sem kemur aftur í hús. Leitandinn má standa í myndinni; engin sjúkdómsgreining, enginn dómur um líðan hans.',
    "Hið dulda": 'Þessi lestur er fyrir Hið dulda — sæktu myndina í það sem er til staðar en sést ekki: þoku á firði, hljóð án upptaka, rætur undir sverði. Leitandinn má standa í myndinni; segðu honum ekki hvað hann skynjar.',
    "Fjölskylda & Heimili": 'Þessi lestur er fyrir Fjölskyldu & Heimili — sæktu myndina í byggðan stað: dyr, eldstæði, götu troðna milli húsa. Leitandinn má standa í myndinni; segðu honum ekki hvað hann ber með sér frá sínu fólki.',
    "Innri Vöxtur": 'Þessi lestur er fyrir Innri Vöxt — sæktu myndina í hæga breytingu á hlut: björk sem gildnar, stein sem slípast, ís sem lætur undan. Leitandinn má standa í myndinni; segðu honum ekki hvernig hann hefur breyst.',
    "Vegamót & Ákvarðanir": 'Þessi lestur er fyrir Vegamót & Ákvarðanir — sæktu myndina þangað sem leið skiptist: tvær götur, kvísl í á, hlið sem stendur opið við hliðina á lokuðu. Leitandinn má standa í myndinni; segðu honum ekki hvað hann veit eða hvora leiðina hann velur.',
  },
};
const KAND_DOMENY = {
  en: {
    'Love & Relationships': "The reading is for Love & Relationships — let the rune's meaning land where two people meet; describe the meeting, never the other person's mind or intent.",
    'The Unseen': "The reading is for The Unseen — let the rune's meaning stay with what has not yet taken shape, not with anything that could be listed or explained.",
    'Inner Growth': "The reading is for Inner Growth — let the rune's meaning land on what change looks like, not on how the seeker has changed.",
    'Crossroads & Decisions': "The reading is for Crossroads & Decisions — let the rune's meaning press on what the two ways look like from where the seeker stands, not on which one they will take.",
  },
  is: {
    'Ást & Sambönd': 'Þessi lestur er fyrir Ást & Sambönd — láttu merkingu rúnarinnar lenda þar sem tvær manneskjur mætast; lýstu fundinum sjálfum, aldrei hug eða ætlun hinnar.',
    'Hið dulda': 'Þessi lestur er fyrir Hið dulda — láttu merkingu rúnarinnar halda sig við það sem hefur ekki enn mótast, ekki við neitt sem mætti telja upp eða útskýra.',
    'Innri Vöxtur': 'Þessi lestur er fyrir Innri Vöxt — láttu merkingu rúnarinnar lenda á því hvernig breyting lítur út, ekki á því hvernig leitandinn hefur breyst.',
    'Vegamót & Ákvarðanir': 'Þessi lestur er fyrir Vegamót & Ákvarðanir — láttu merkingu rúnarinnar þrýsta á hvernig leiðirnar tvær líta út þaðan sem leitandinn stendur, ekki á hvora hann velur.',
  },
};
if (DOMENY === 'kandidat' || DOMENY === 'obraz') {
  vm.runInContext('var KAND_DOMENY = ' + JSON.stringify(DOMENY === 'obraz' ? OBRAZ_DOMENY : KAND_DOMENY) + ';', S);
  vm.runInContext([
    'var _domOrig = _domainContext;',
    '_domainContext = function (area, lang) {',
    '  var m = KAND_DOMENY[lang] || {};',
    '  return m[area] || _domOrig(area, lang);',
    '};',
  ].join(''), S);
}

// Zakonceni, ktera drzi carou podmetu (KUKY 2026-08-20). Meni se DVE ze tri; treti
// („quiet line that rests") nic netvrdi a zustava, aby slo pripadnou regresi pripsat
// tomu, co se opravdu zmenilo.
if (ZAKONC === 'kandidat') {
  vm.runInContext([
    'ENDING_OPEN[0] = "End with one open question the seeker could honestly answer \'neither\' to — it must not assume what is true in them.";',
    'ENDING_OPEN[1] = "End on a plain, steady line — name where the seeker stands in the image, not what is true inside them; not a question.";',
    'ENDING_OPEN_IS[0] = "Endaðu á einni opinni spurningu sem leitandinn gæti með sanni svarað neitandi — hún má ekki gefa sér hvað er satt innra með honum.";',
    'ENDING_OPEN_IS[1] = "Endaðu á staðfastri línu — nefndu hvar leitandinn stendur í myndinni, ekki hvað er satt innra með honum; ekki spurningu.";',
  ].join(''), S);
}

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
  if ((DOMENY === 'kandidat' || DOMENY === 'obraz') && MATRIX === 'area') {
    const zk2 = STAVITEL[SPREAD]({ name: 'Anna', area: AREAS[7], seeking: SEEKS[1], intention: INTENT[0], question: '', lifeRune: null }, vzorek(), LANG);
    if (zk2.indexOf('already knows but has not said aloud') !== -1 || zk2.indexOf('veit þegar en hefur ekki sagt') !== -1) {
      console.error('  DOMENY: kandidat se nevlozil, v promptu je porad stare zneni'); process.exit(1); }
  }
  if (ZAKONC === 'kandidat') {
    const stara = vm.runInContext('ENDING_OPEN[0] + "|" + ENDING_OPEN[1] + "|" + ENDING_OPEN_IS[0] + "|" + ENDING_OPEN_IS[1]', S);
    if (stara.indexOf('turns the seeker inward') !== -1 || stara.indexOf('snýr leitandanum inn') !== -1) {
      console.error('  ZAKONCENI: kandidat se nevlozil, v poolu je porad stare zneni'); process.exit(1); }
  }
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
    'gen-' + SPREAD + '-' + LANG + '-' + ARM + (ZAKONC ? '-zak' + ZAKONC : '') + (DOMENY ? '-dom' + DOMENY : '') + (BEZ_OBL ? '-bezoblasti' : '') + (MATRIX ? '-' + MATRIX : '')
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
