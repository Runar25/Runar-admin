// ㊱ REGISTER OBRAZŮ — každý řádek RUNE_IMAGES nese platný register D|E|P na indexu 6
// (2026-08-23, handoff Cowork: „kdo sáhne na pool, přeindexuje register" se vynucuje
// strojem, ne pamětí). Kritéria D/E/P vlastní Cowork → RUNAR_DESIGN.md (sekce image-pool).
// Prázdné/neznámé = červená. Aktuální štítky jsou PROVIZORNÍ (CODE-tune dle kritérií,
// 2026-08-23) — Cowork celý pool přeštítkuje svým souborem a provizor přepíše.
const fs = require('fs'), vm = require('vm');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const S = { console: { log() {}, warn() {}, error() {} } };
S.window = S; S.globalThis = S; S.document = { getElementById: () => null };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8'), S);

const IMGS = vm.runInContext('RUNE_IMAGES', S);
let fail = 0;
const poc = { D: 0, E: 0, P: 0 };
for (const row of IMGS) {
  const reg = row[6];
  if (reg !== 'D' && reg !== 'E' && reg !== 'P') {
    fail++;
    console.log('FAIL  ' + row[0] + ' „' + String(row[3]).slice(0, 50) + '…": register "' + reg + '" neni D|E|P');
    continue;
  }
  poc[reg]++;
}
if (!IMGS.length) { fail++; console.log('FAIL  banka prazdna'); }

// ── JADRA (2026-09-19): kazdy radek s jadrem musi mit mista sveho registru — jinak by
// slozeni tise vypadlo. A slozena radka se musi dat ROZLOZIT zpet (_promptDraws: image
// bez mista + place zvlast), jinak mereni obrazu zacne pocitat mista.
{
  const PLACES = vm.runInContext('IMG_PLACES', S);
  const jadra = IMGS.filter(r => r[8] === 'jadro');
  if (!jadra.length) { fail++; console.log('FAIL  zadny radek s jadrem (cekaji se 3 Raidho)'); }
  for (const r of jadra) {
    if (!PLACES[r[6]] || !PLACES[r[6]].length) { fail++; console.log('FAIL  jadro ' + r[0] + ' bez mist registru ' + r[6]); }
  }
  for (const reg of Object.keys(PLACES)) {
    for (const pr of PLACES[reg]) if (!(pr && pr[0] && pr[1])) { fail++; console.log('FAIL  misto registru ' + reg + ' bez IS/EN tvaru'); }
  }
  // Round-trip pres produkcni cteni: veta s mistem -> image + place; bez mista postaru.
  const draws = vm.runInContext('_promptDraws', S);
  const nl = String.fromCharCode(10);
  const dEn = draws('X' + nl + 'IMAGE — the picture in this reading comes from here: a road vanishing round the next bend. Where: a mountain pass. Let it become your own seeing in the text.' + nl + 'Y', 'en');
  const dIs = draws('X' + nl + 'MYND — héðan kemur myndin í þessum lestri: Vegurinn hverfur fyrir næstu beygju. Þetta á sér stað í fjallaskarði. Láttu hana verða að þinni eigin sýn í textanum.' + nl + 'Y', 'is');
  if (!dEn || dEn.place !== 'a mountain pass' || dEn.image !== 'a road vanishing round the next bend') {
    fail++; console.log('FAIL  EN rozklad jadra: ' + JSON.stringify(dEn && { image: dEn.image, place: dEn.place }));
  }
  if (!dIs || dIs.place !== 'í fjallaskarði' || dIs.image !== 'Vegurinn hverfur fyrir næstu beygju') {
    fail++; console.log('FAIL  IS rozklad jadra: ' + JSON.stringify(dIs && { image: dIs.image, place: dIs.place }));
  }
  const dBez = draws('X' + nl + 'IMAGE — the picture in this reading comes from here: The sea gives and takes on the shore. Let it become your own seeing in the text.' + nl + 'Y', 'en');
  if (!dBez || dBez.place !== undefined || dBez.image !== 'The sea gives and takes on the shore') {
    fail++; console.log('FAIL  rozklad bez mista se rozbil: ' + JSON.stringify(dBez && { image: dBez.image, place: dBez.place }));
  }
  if (!fail) console.log('OK    jadra: ' + jadra.length + ' radku, mista registru uplna, rozklad image+place drzi');
}
console.log(fail === 0
  ? 'OK    register obrazu: ' + IMGS.length + ' radku, vsechny D|E|P  (D ' + poc.D + ' · E ' + poc.E + ' · P ' + poc.P + ')'
  : 'CELKEM ' + fail + ' radku bez platneho registru');
process.exit(fail === 0 ? 0 : 1);
