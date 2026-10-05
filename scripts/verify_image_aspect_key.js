// ㉤ ASPEKT OBRAZU ↔ KLÍČ RUNY — obojí končí v TÉŽE ŘÁDCE promptu, takže se nesmí rozejít.
//
// Proč to existuje (2026-09-11, CODE-tune):
//   `DRAWN RUNE: Perth — focus on: <aspekt> · World: … · Elements: …`
//   `DREGNA RÚNA: Perþ (…) — áhersla: <aspekt> · Heimur: … · Frumefni: …`
// Aspekt obrazu (RUNE_IMAGES index 5 EN / 4 IS) NENÍ jen selektor obrazu — od v4.0 jde
// doslova do promptu jako `focus`. Když aspekt říká jedno a `RUNES[].k` druhé, dostane model
// dvě různé verze téže stránky runy a vybere si. Přesně tak vznikl starý sannleikur/justice
// rozpor a stejným kanálem tekla Perthova prázdná věc („focus: hidden things" → „the thing
// whose meaning waits sealed").
//
// Že je to pravidlo a ne přání, ukazují DATA: v angličtině sedí **108 ze 108** aspektů na
// položku v `k` — pool se tak stavěl. V islandštině se 7 řádků rozešlo (synonymum místo
// téhož slova). Ty NEJSOU tichá výjimka: vypisují se a jejich počet je ZASTROPOVANÝ.
// Osmý = červená. Je to obsahové rozhodnutí (které slovo vyhraje), proto tu nesmí přibývat,
// dokud ho owner/Cowork neudělá → RUNAR_BACKLOG.md.
//
//   node scripts/verify_image_aspect_key.js
const fs = require('fs'), vm = require('vm');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const S = { console: { log() {}, warn() {}, error() {} }, Math, JSON, Date };
S.window = S; S.globalThis = S; S.document = { getElementById: () => null };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8'), S);

const IMGS = vm.runInContext('RUNE_IMAGES', S);
const RUNES = vm.runInContext('RUNES', S);

// Strop islandského dluhu. Zvednout ho smí JEN datované rozhodnutí, ne „ať to projde".
// 2026-09-12: splaceno na NULU. Nešlo o volbu mezi synonymy — těch 7 řádků mělo aspekt,
// který v `k_is` CHYBĚL (viz druhý invariant níž). Doplněním klíčů to spadlo na 0.
const IS_DLUH_STROP = 0;

const polozky = (s) => String(s || '').split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
let fail = 0;
const chybiEN = [], chybiIS = [], bezRuny = [], neparove = [], vicVyznamu = [], poradi = [];

for (const row of IMGS) {
  const r = RUNES.find((x) => x.n === row[0]);
  if (!r) { bezRuny.push(row[0]); continue; }
  const aEN = String(row[5] || '').trim(), aIS = String(row[4] || '').trim();
  if (!aEN || !aIS) { chybiEN.push(row[0] + ' — PRÁZDNÝ ASPEKT'); continue; }
  // 2026-10-05: obraz smí nést víc významů „a|b“ (krok A, _seasonalImagery). Každý musí být klíč runy a oba jazyky musí mít
  // STEJNĚ alternativ — los bere týž index pro IS i EN; při nerovnosti by islandské a anglické čtení dostalo jiný význam.
  const altEN = aEN.split('|').map((x) => x.trim()), altIS = aIS.split('|').map((x) => x.trim());
  if (altEN.length !== altIS.length) { neparove.push(r.n + ': EN ' + altEN.length + ' × IS ' + altIS.length + ' („' + aEN + '“ / „' + aIS + '“)'); continue; }
  altEN.forEach((a) => { if (!a || !polozky(r.k).includes(a.toLowerCase())) chybiEN.push(r.n + ': „' + a + '" není v k'); });
  altIS.forEach((a) => { if (!a || !polozky(r.k_is).includes(a.toLowerCase())) chybiIS.push(r.n + ': „' + a + '" není v k_is'); });
  if (altEN.length > 1) {
    vicVyznamu.push(row);
    // Párování i-tý IS = i-tý EN je obsahové rozhodnutí. Stroj ho ověří jen tam, kde `k` a `k_is` jdou ve stejném pořadí;
    // jinde (např. Fehu má seznamy přeházené) je to viditelný žlutý řádek, ne tiché zelené (§19.2).
    altEN.forEach((a, i) => {
      const ie = polozky(r.k).indexOf(a.toLowerCase()), ii = polozky(r.k_is).indexOf(altIS[i].toLowerCase());
      if (ie !== ii) poradi.push(r.n + ': „' + a + '“ je ' + (ie + 1) + '. v k, „' + altIS[i] + '“ je ' + (ii + 1) + '. v k_is');
    });
  }
}

// ── DRUHÝ INVARIANT: `k` a `k_is` musí mít STEJNĚ položek ───────────────────
// Proč: `rk()` vrací podle jazyka `k` nebo `k_is`, a když není aspekt obrazu, losují se z toho
// klíče do promptu. Kratší islandský seznam = islandská čtení mají o jednu stránku runy míň,
// a nikdo si toho nevšimne — není to chyba, jen chybějící slovo.
// Nalezeno 2026-09-12 při pátrání po „7 islandských synonymech": ta synonyma neexistovala,
// existovala jedna systematická díra u 17 z 25 run.
// Strop = dluh, který ještě čeká na islandské slovo (handoff Cowork). Nesmí RŮST.
// ⚠️ Strop počítá CHYBĚJÍCÍ POLOŽKY, ne runy. Mutace 2026-09-12: přidání šestého anglického
// klíče k Laguzu (které v seznamu dluhu už bylo) prošlo zeleně, protože počet RUN se nezměnil.
// Součet rozdílů takovou ránu zachytí.
// 2026-09-12: splaceno na NULU (Coworkova islandska slova + korpusove overeni). Kdo sem
// strop zvedne, musi k tomu mit datovany duvod.
const PARITA_STROP = 0;
const parita = [];
let chybiPolozek = 0;
for (const r of RUNES) {
  const a = polozky(r.k).length, b = polozky(r.k_is).length;
  if (a !== b) { chybiPolozek += Math.abs(a - b); parita.push(r.n + ": EN " + a + " × IS " + b); }
}
if (chybiPolozek > PARITA_STROP) {
  fail++;
  console.log('FAIL  chybějících položek v islandských seznamech klíčů: ' + chybiPolozek
              + ' (strop ' + PARITA_STROP + ' — PŘIBYLA nová)');
  parita.forEach((x) => console.log('        ' + x));
} else if (chybiPolozek) {
  console.log('  ⚠  ' + chybiPolozek + ' položek chybí v islandských seznamech klíčů (' + parita.length + ' run)'
              + ' (známý dluh, strop ' + PARITA_STROP + ' — čeká na islandské slovo):');
  parita.forEach((x) => console.log('        ' + x));
  if (chybiPolozek < PARITA_STROP) {
    console.log('  ℹ  dluh KLESL — sniž `PARITA_STROP` na ' + chybiPolozek + '.');
  }
}

if (bezRuny.length) {
  fail++;
  console.log('FAIL  obraz ukazuje na runu, která neexistuje: ' + bezRuny.join(', '));
}
if (chybiEN.length) {
  fail++;
  console.log('FAIL  ' + chybiEN.length + ' EN aspekt(ů) mimo klíč runy — model dostane dvě verze téže runy:');
  chybiEN.forEach((x) => console.log('        ' + x));
}
if (chybiIS.length > IS_DLUH_STROP) {
  fail++;
  console.log('FAIL  IS aspektů mimo k_is: ' + chybiIS.length + ' (strop ' + IS_DLUH_STROP + ' — PŘIBYL nový)');
  chybiIS.forEach((x) => console.log('        ' + x));
} else if (chybiIS.length) {
  console.log('  ⚠  ' + chybiIS.length + ' IS aspektů je synonymum, ne táž položka v k_is'
              + ' (známý dluh, strop ' + IS_DLUH_STROP + ' — čeká na obsahové rozhodnutí):');
  chybiIS.forEach((x) => console.log('        ' + x));
  if (chybiIS.length < IS_DLUH_STROP) {
    console.log('  ℹ  dluh KLESL — sniž `IS_DLUH_STROP` na ' + chybiIS.length + ', ať se nemůže tiše vrátit.');
  }
}

if (neparove.length) {
  fail++;
  console.log('FAIL  obraz s víc významy má v IS a EN jiný počet alternativ — jazyky by dostaly jiný význam:');
  neparove.forEach((x) => console.log('        ' + x));
}
if (poradi.length) {
  console.log('  ⚠  párování víc významů nejde ověřit pořadím klíčů — zkontroluj okem, že jde o tentýž význam:');
  poradi.forEach((x) => console.log('        ' + x));
}

// ── TŘETÍ INVARIANT (2026-10-05): obraz s víc významy → do promptu jde JEDEN, v IS i EN týž, a na zařízení se střídají ──
// Protlačeno produkční cestou (§19): buildReadingPrompt → _seasonalImagery → řádek `focus on:` / `áhersla:` → _promptDraws.kws
// (z toho čte databáze čtení i Ask). Obraz se vynutí tak, že banka v sandboxu obsahuje jen jeho řádek (sezóna „any“).
let vyzOk = 0;
if (vicVyznamu.length && !neparove.length) {
  const st = {};
  S.localStorage = { getItem: (k) => (k in st ? st[k] : null), setItem: (k, v) => { st[k] = String(v); }, removeItem: (k) => { delete st[k]; } };
  const M = Object.create(Math); S.Math = M;
  const lab = vm.runInContext('({ en: RP_SINGLE.en.focus, is: RP_SINGLE.is.focus })', S);
  const u = { name: 'Kuky', area: '', seeking: '', question: '', intention: '' };
  const vady = [];
  for (const row of vicVyznamu) {
    const r = RUNES.find((x) => x.n === row[0]);
    const altEN = row[5].split('|').map((x) => x.trim()), altIS = row[4].split('|').map((x) => x.trim());
    const jm = r.n + ' „' + row[3].slice(0, 28) + '…“';
    S.__radek = row.slice(); S.__radek[1] = 'any';
    vm.runInContext('RUNE_IMAGES = [__radek];', S);
    for (const lang of ['en', 'is']) {
      for (const k of Object.keys(st)) delete st[k];
      vm.runInContext('lang = ' + JSON.stringify(lang) + ';', S);   // rk() čte globální jazyk aplikace
      let seed = 11; M.random = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
      const alt = lang === 'en' ? altEN : altIS, padlo = [];
      for (let i = 0; i < 2 * alt.length; i++) {
        const p = S.buildReadingPrompt(u, r, lang, []);
        const m = p.match(new RegExp(lab[lang] + ': ([^·\n]+)')), f = m ? m[1].trim() : '';
        const kws = (S._promptDraws(p, lang) || {}).kws || '';
        if (alt.indexOf(f) === -1) vady.push(jm + ' ' + lang + ': v promptu „' + lab[lang] + ': ' + f + '“ — není to jeden z významů');
        if (kws !== f) vady.push(jm + ' ' + lang + ': prompt_draws.kws „' + kws + '“ ≠ „' + f + '“ (databáze čtení a Ask by viděly jiný význam)');
        padlo.push(f);
      }
      // sáček: v každém kole padne každý význam jednou
      for (let i = 0; i < padlo.length; i += alt.length) {
        const kolo = padlo.slice(i, i + alt.length);
        if (new Set(kolo).size !== alt.length) vady.push(jm + ' ' + lang + ': v kole sáčku se význam opakoval (' + kolo.join(' / ') + ')');
      }
    }
    // jeden tah = týž index v obou jazycích (islandské i anglické čtení téhož obrazu nese tentýž význam)
    for (let i = 0; i < 6; i++) {
      S._seasonalImagery('en', r, '');
      const [vIS, vEN] = vm.runInContext('[_imgAspektIS, _imgAspektEN]', S);
      if (altIS.indexOf(vIS) === -1 || altIS.indexOf(vIS) !== altEN.indexOf(vEN)) vady.push(jm + ': IS „' + vIS + '“ a EN „' + vEN + '“ nejsou tentýž význam');
    }
    if (!vady.length) vyzOk++;
  }
  vm.runInContext('RUNE_IMAGES = __puvodni;', Object.assign(S, { __puvodni: IMGS }));
  if (vady.length) {
    fail++;
    console.log('FAIL  obraz s víc významy — produkční cesta:');
    vady.slice(0, 10).forEach((x) => console.log('        ' + x));
  }
}

if (fail) { console.log('\nFAIL — aspekt obrazu se rozešel s klíčem runy.'); process.exit(1); }
console.log('OK    aspekt↔klíč: EN ' + (IMGS.length - chybiEN.length) + '/' + IMGS.length
            + ' sedí, IS aspektů mimo klíč ' + chybiIS.length + '/' + IS_DLUH_STROP
            + ', chybějících IS klíčů ' + chybiPolozek + '/' + PARITA_STROP
            + '; obrazů s víc významy ' + vicVyznamu.length + ' (do promptu jde jeden, IS = EN, střídají se: ' + vyzOk + '/' + vicVyznamu.length + ')');
