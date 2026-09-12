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
const chybiEN = [], chybiIS = [], bezRuny = [];

for (const row of IMGS) {
  const r = RUNES.find((x) => x.n === row[0]);
  if (!r) { bezRuny.push(row[0]); continue; }
  const aEN = String(row[5] || '').trim(), aIS = String(row[4] || '').trim();
  if (!aEN || !aIS) { chybiEN.push(row[0] + ' — PRÁZDNÝ ASPEKT'); continue; }
  if (!polozky(r.k).includes(aEN.toLowerCase())) chybiEN.push(r.n + ': „' + aEN + '" není v k');
  if (!polozky(r.k_is).includes(aIS.toLowerCase())) chybiIS.push(r.n + ': „' + aIS + '" není v k_is');
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

if (fail) { console.log('\nFAIL — aspekt obrazu se rozešel s klíčem runy.'); process.exit(1); }
console.log('OK    aspekt↔klíč: EN ' + (IMGS.length - chybiEN.length) + '/' + IMGS.length
            + ' sedí, IS aspektů mimo klíč ' + chybiIS.length + '/' + IS_DLUH_STROP
            + ', chybějících IS klíčů ' + chybiPolozek + '/' + PARITA_STROP);
