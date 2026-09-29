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
// ── POSTAVA (2026-09-29, test 3): obraz se zvířetem v hlavní roli (index 9 „postava“) dostane v SINGLE čtení za obraz pokyn B
// (RP_SINGLE.cizi); jiný obraz ho nedostane a spready taky ne (v Nornách B zhoršil vztah k životu). Protlačeno produkčním builderem —
// kontrola vidí VÝSLEDEK v promptu (§19), ne jen značku v datech.
{
  const P = { console: { log() {}, warn() {}, error() {} } }; P.window = P; P.globalThis = P;
  P.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
  const st = {}; P.localStorage = { getItem: (k) => st[k] || null, setItem: (k, v) => { st[k] = v; }, removeItem: (k) => { delete st[k]; } };
  vm.createContext(P);
  for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
    vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', P);
  vm.runInContext('var __s=1;Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};', P);
  const IM = vm.runInContext('RUNE_IMAGES', P), RU = vm.runInContext('RUNES', P), RP = vm.runInContext('RP_SINGLE', P);
  const post = IM.filter((r) => r[9] === 'postava');
  if (!post.length) { fail++; console.log('FAIL  zadny obraz se znackou „postava“'); }
  const sYou = post.filter((r) => /\byou(r)?\b/i.test(r[3]));
  if (sYou.length) { fail++; console.log('FAIL  „postava“ u obrazu, kde je „you“ (ctenar JE v obraze): ' + sYou.map((r) => r[0]).join(', ')); }
  const u = { name: 'Kuky', area: '', seeking: '', question: '', intention: '' };
  const najdi = (stav, test) => { for (let s = 1; s < 5000; s++) { for (const k of Object.keys(st)) delete st[k];
    P.__s = s * 7919; vm.runInContext('__s=' + (s * 7919) + ';', P); const p = stav(); if (test(p)) return p; } return null; };
  for (const L of ['en', 'is']) {
    vm.runInContext('lang="' + L + '"', P);
    const cizi = RP[L].cizi, obr = (r) => (L === 'is' ? r[2] : r[3]).replace(/\.$/, '');
    const pes = post.find((r) => r[0] === 'Algiz');
    const sPes = najdi(() => P.buildReadingPrompt(u, RU.find((r) => r.n === 'Algiz'), L, []), (p) => p.indexOf(obr(pes)) !== -1);
    const bez = IM.find((r) => r[0] === 'Algiz' && r[9] !== 'postava');
    const sBez = najdi(() => P.buildReadingPrompt(u, RU.find((r) => r.n === 'Algiz'), L, []), (p) => p.indexOf(obr(bez)) !== -1);
    const nor = najdi(() => P.buildNornsPrompt(u, ['Algiz', 'Ingwaz', 'Uruz'].map((n) => RU.find((r) => r.n === n)), L, []), (p) => p.indexOf(obr(pes)) !== -1);
    const radky = (sPes || '').split('\n'), i = radky.findIndex((l) => l.indexOf(obr(pes)) !== -1);
    const d = sPes ? (P._promptDraws(sPes, L) || {}) : {};
    const ok = sPes && radky[i + 1] === cizi && d.postava === 1 && sBez && sBez.indexOf(cizi) === -1 && nor && nor.indexOf(cizi) === -1;
    if (!ok) { fail++; console.log('FAIL  ' + L + ' postava: single se psem ' + (sPes ? (radky[i + 1] === cizi ? 'ma pokyn' : 'BEZ pokynu') : 'nevylosovan')
      + ' · draws.postava ' + d.postava + ' · jiny obraz ' + (sBez ? (sBez.indexOf(cizi) === -1 ? 'bez' : 'S POKYNEM') : 'nevylosovan')
      + ' · Norny ' + (nor ? (nor.indexOf(cizi) === -1 ? 'bez' : 'S POKYNEM') : 'nevylosovany')); }
    else console.log('OK    ' + L + ' postava: single se psem ma pokyn B hned za obrazem (draws.postava=1), jiny obraz a Norny bez nej');
  }
  if (!fail) console.log('OK    postava: ' + post.length + ' obrazu se zviretem v hlavni roli, zadny s „you“');
}
console.log(fail === 0
  ? 'OK    register obrazu: ' + IMGS.length + ' radku, vsechny D|E|P  (D ' + poc.D + ' · E ' + poc.E + ' · P ' + poc.P + ')'
  : 'CELKEM ' + fail + ' radku bez platneho registru');
process.exit(fail === 0 ? 0 : 1);
