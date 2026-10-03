// ㉲ OBRAZ PODLE OBLASTI — zvolená oblast vyřadí obrazy, které patří jen do jiných oblastí (11. sloupec RUNE_IMAGES).
//
// PROC (2026-10-03, KUKY „obraz vybírat podle oblasti, jeď“): reporty 2026-10-01/02 — obraz a oblast se ve čtení bily
// (Fehu × Love dostal prodej krávy, Kenaz × Family dílnu). Pokyn v promptu to nespravil (EVAL_LOG 2026-10-02 (1), 2026-10-03 (1)),
// proto to řeší VÝBĚR v _seasonalImagery. Tady se protlačí produkční funkce (§19): _runeImageCandidates → _imgPodleOblasti →
// _seasonalImagery → buildReadingPrompt / buildNornsPrompt, a hlídá se VÝSLEDEK (který obraz padne), ne tvar kódu.
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = path.join(__dirname, '..', 'v2') + path.sep;
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
const st = {}; S.localStorage = { getItem: (k) => (k in st ? st[k] : null), setItem: (k, v) => { st[k] = String(v); }, removeItem: (k) => { delete st[k]; } };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
vm.runInContext('lang="en";', S);
const IM = vm.runInContext('RUNE_IMAGES', S), KODY = vm.runInContext('IMG_OBLAST_KODY', S), AREAS = vm.runInContext('AREAS', S);
const RUNES = vm.runInContext('RUNES', S), runa = (n) => RUNES.find((r) => r.n === n);
const BUCKETS = vm.runInContext('RUNE_IMG_SEASONS', S).any;   // všech 6 období
const vady = [];
const ocek = (jm, podm, detail) => { if (!podm) vady.push(jm + (detail ? ' — ' + detail : '')); };
const bezTecky = (t) => String(t).replace(/[.]$/, '');

// 1) kódy: jeden znak na oblast, ve stejném pořadí jako AREAS.en; značky jen z těch kódů
ocek('IMG_OBLAST_KODY = počet oblastí', KODY.length === AREAS.en.length && AREAS.is.length === AREAS.en.length, KODY + ' × ' + AREAS.en.length);
const oznacene = IM.filter((r) => r[10]);
oznacene.forEach((r) => ocek('značka ' + r[0] + ' „' + r[3].slice(0, 30) + '…“', /^[a-z]+$/.test(r[10]) && [...r[10]].every((k) => KODY.indexOf(k) !== -1), r[10]));
ocek('aspoň jeden označený obraz', oznacene.length > 0);

// 2) filtr nad všemi runami × oblastmi × obdobími; EN i IS štítek; bez oblasti beze změny
let vyrazeno = 0; const mezery = [];
for (const r of RUNES) for (const b of BUCKETS) {
  const cand = S._runeImageCandidates(r, b);
  ocek('bez oblasti beze změny ' + r.n + '/' + b, S._imgPodleOblasti(cand, '') === cand && S._imgPodleOblasti(cand, undefined) === cand);
  AREAS.en.forEach((a, i) => {
    const kod = KODY.charAt(i), f = S._imgPodleOblasti(cand, a), fIs = S._imgPodleOblasti(cand, AREAS.is[i]);
    const cizi = (row) => row[10] && row[10].indexOf(kod) === -1;
    const lzeBez = cand.some((row) => !cizi(row));
    ocek('IS štítek = EN ' + r.n + '/' + a + '/' + b, f.length === fIs.length && f.every((x, j) => x === fIs[j]));
    if (cand.length) ocek('nikdy prázdno ' + r.n + '/' + a + '/' + b, f.length > 0);
    if (lzeBez) ocek('cizí oblast vyřazena ' + r.n + '/' + a + '/' + b, !f.some(cizi), f.filter(cizi).map((x) => x[3].slice(0, 30)).join(' | '));
    vyrazeno += cand.length - f.length;
    if (cand.length >= 2 && f.length === 1) mezery.push(r.n + ' × ' + a + ' (' + b + '): jen „' + f[0][3].slice(0, 40) + '…“');
  });
}
ocek('filtr něco vyřazuje', vyrazeno > 0);

// 3) produkční cesta: který obraz opravdu padne (single i spread), s oblastí a bez ní. Hledá se EN i IS sloupec —
//    jen EN by islandskou větev nechalo projít naprázdno (slepá kontrola, §27).
vm.runInContext('var __s=7;Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};', S);
const u = (area) => ({ name: 'Kuky', area: area, seeking: '', question: '', intention: '' });
const padne = (stav, n) => {
  const v = new Set();
  for (let i = 0; i < n; i++) {
    for (const k of Object.keys(st)) delete st[k];
    const p = stav();
    IM.forEach((r) => { if (p.indexOf(bezTecky(r[3])) !== -1 || p.indexOf(bezTecky(r[2])) !== -1) v.add(r[3]); });
  }
  return v;
};
const PRODEJ = ['The cow is sold in the autumn', 'The wool is traded in', 'The catch is sold at the harbour'];
const DILNA = ['The forge glows in the dark shed', 'A single lamp burns over the workbench', 'The shavings curl away from the blade'];
const ma = (set, list) => [...set].filter((t) => list.some((x) => t.indexOf(x) === 0));
const fehuLove = padne(() => S.buildReadingPrompt(u('Love & Relationships'), runa('Fehu'), 'en', []), 300);
const fehuBez = padne(() => S.buildReadingPrompt(u(''), runa('Fehu'), 'en', []), 300);
ocek('single Fehu × Love: prodej nepadne', ma(fehuLove, PRODEJ).length === 0 && fehuLove.size > 0, [...fehuLove].join(' | '));
ocek('single Fehu bez oblasti: prodej padá', ma(fehuBez, PRODEJ).length > 0, [...fehuBez].join(' | '));
const kenazRod = padne(() => S.buildReadingPrompt(u('Family & Home'), runa('Kenaz'), 'en', []), 300);
const kenazRodIs = padne(() => S.buildReadingPrompt(u(AREAS.is[AREAS.en.indexOf('Family & Home')]), runa('Kenaz'), 'is', []), 300);
const kenazBezIs = padne(() => S.buildReadingPrompt(u(''), runa('Kenaz'), 'is', []), 300);
ocek('single Kenaz × Family: dílna nepadne (EN)', ma(kenazRod, DILNA).length === 0 && kenazRod.size > 0, [...kenazRod].join(' | '));
ocek('single Kenaz × Fjölskylda (IS štítek): dílna nepadne', ma(kenazRodIs, DILNA).length === 0 && kenazRodIs.size > 0, [...kenazRodIs].join(' | '));
ocek('single Kenaz bez oblasti (IS): dílna padá — IS větev vidí', ma(kenazBezIs, DILNA).length > 0, [...kenazBezIs].join(' | '));
const norny = padne(() => S.buildNornsPrompt(u('Love & Relationships'), ['Fehu', 'Kenaz', 'Isa'].map(runa), 'en', []), 300);
ocek('Norny × Love: prodej ani dílna nepadnou', ma(norny, PRODEJ.concat(DILNA)).length === 0 && norny.size > 0, [...norny].join(' | '));

if (vady.length) { vady.slice(0, 12).forEach((v) => console.log('FAIL  ' + v)); console.log('CELKEM ' + vady.length + ' vad ve výběru podle oblasti'); process.exit(1); }
console.log('INFO  oblast s jediným obrazem (mezera v bance, ne vada): ' + mezery.length + (mezery.length ? ' — např. ' + mezery.slice(0, 3).join(' · ') : ''));
console.log('OK    obraz podle oblasti: ' + oznacene.length + ' označených obrazů, cizí oblast vyřazena ve všech runách × oblastech × obdobích (EN i IS štítek), bez oblasti beze změny; single i Norny produkční cestou');
