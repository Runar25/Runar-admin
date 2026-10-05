// Kolo k4 (2026-10-05, CODE-tune) — „které významy obraz unese“: kroky B a C směru „jeden obraz, víc významů“ (KUKY 2026-10-05)
// + významy nových obrazů (kandidati_k4.json). Soudce dostane obraz a seznam významů runy (EN obraz → klíče `k`, IS obraz → `k_is`),
// jméno runy NEvidí, smí označit víc významů. Dva soudci, každý jiné pořadí obrazů i písmen.
//
// PRAVIDLO PŘEDEM (zapsáno před čtením odpovědí): význam obraz unese, když ho označí OBA soudci v angličtině A OBA jeho islandský
// protějšek v islandštině (4/4). Dosavadní význam obrazu zůstává (má starší doklad), jen když dostane 0/4, ukáže se ownerovi.
// Nový obraz bere za hlavní význam ten s nejvíc značkami; další přibude jen při 4/4.
//   node vyznamy_build.js   → vyz_soudce1.txt, vyz_soudce2.txt, vyz_klic.json
const vm = require('vm'), fs = require('fs'), path = require('path');
const H = __dirname, D = path.join(H, '..', '..', '..', 'v2') + path.sep;
const S = { console: { log() {}, warn() {}, error() {} }, document: { getElementById: () => null }, localStorage: { getItem: () => null, setItem() {} } };
S.window = S; vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
const IMG = vm.runInContext('RUNE_IMAGES', S), RUNES = vm.runInContext('RUNES', S);
const sp = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);

// Obrazy z banky (runa, začátek EN znění) — skupiny jen pro záznam, soudce je nevidí.
const Z_BANKY = [
  ['H', 'Hagalaz', 'The squall strikes'], ['H', 'Hagalaz', 'The hail hammers'], ['H', 'Hagalaz', 'In the night the gale'],
  ['H', 'Hagalaz', 'The power goes out'], ['H', 'Hagalaz', 'After the storm'], ['H', 'Hagalaz', 'Hail rakes'],
  ['H', 'Hagalaz', 'The river swells'],
  ['C', 'Ansuz', 'The raven settles'], ['C', 'Nauthiz', 'You keep knitting'], ['C', 'Laguz', 'The glacial river'],
  ['C', 'Laguz', 'Water finds its own way'], ['C', 'Ingwaz', 'The seed lies'], ['C', 'Othila', 'The old farmstead'],
  ['C', 'Dagaz', 'You wake, and dawn'], ['C', 'Isa', 'The clock on the wall'], ['C', 'Thurisaz', 'The thorn-bush'],
  ['C0', 'Ansuz', 'The letter comes'], ['C0', 'Ehwaz', 'When one horse tires'], ['C0', 'Ehwaz', 'On the narrow path'],
  ['C0', 'Blank', 'The line runs down'], ['C0', 'Raidho', 'a road vanishing'], ['C0', 'Thurisaz', 'The thorn hedge'],
];
const obrazy = [];
for (const [sk, runa, zac] of Z_BANKY) {
  const rows = IMG.filter((r) => r[0] === runa && r[3].indexOf(zac) === 0);
  if (rows.length !== 1) throw new Error(runa + ' „' + zac + '“: ' + rows.length + ' řádků');
  obrazy.push({ id: runa + ':' + zac, sk, runa, en: rows[0][3], is: rows[0][2] });
}
for (const k of JSON.parse(fs.readFileSync(path.join(H, 'kandidati_k4.json'), 'utf8')))
  obrazy.push({ id: k.id, sk: 'N', runa: k.runa, en: k.en, is: k.is });

const UVOD = [
  'Do not read any files and do not use any tools. Your final message is your answer.',
  'Below are short images, some in English and some in Icelandic. Each comes with a list of meanings marked by letters — the facets',
  'of the rune the image is meant to carry (for an Icelandic image the meanings are in Icelandic).',
  'For EACH image, mark EVERY meaning the image genuinely carries: a meaning a thoughtful reader would recognise in the scene itself,',
  'without forcing it. Usually one or two, sometimes three. If none fits, answer "-". Judge each image on its own.',
  'Answer one line per image: "<number>: <letters separated by commas>" (for example "12: b, d") and nothing else.', '',
];
const PISMENA = 'abcdefgh';
const klic = { pravidlo: 'význam = 2/2 EN a 2/2 IS (4/4)', obrazy: obrazy.map((o) => ({ id: o.id, sk: o.sk, runa: o.runa, en: o.en, is: o.is })), soudci: [] };
for (let s = 0; s < 2; s++) {
  let seed = 5000 + 77 * s;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const mich = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const polozky = mich(obrazy.flatMap((o) => [{ o, lang: 'en' }, { o, lang: 'is' }]));
  const radky = UVOD.slice(), zaznam = [];
  polozky.forEach((p, i) => {
    const r = RUNES.find((x) => x.n === p.o.runa);
    const vyz = mich(sp(p.lang === 'en' ? r.k : r.k_is));
    radky.push((i + 1) + '. ' + (p.lang === 'en' ? p.o.en : p.o.is));
    radky.push('   ' + vyz.map((v, j) => PISMENA[j] + ') ' + v).join('   '));
    zaznam.push({ n: i + 1, id: p.o.id, lang: p.lang, pismena: Object.fromEntries(vyz.map((v, j) => [PISMENA[j], v])) });
  });
  fs.writeFileSync(path.join(H, 'vyz_soudce' + (s + 1) + '.txt'), radky.join('\n'));
  klic.soudci.push(zaznam);
}
// pojistka: jméno runy nesmí k soudci dojít (EN ani IS tvar v textu obrazu se nevyskytuje — kontrola na jména run)
for (let s = 1; s <= 2; s++) {
  const t = fs.readFileSync(path.join(H, 'vyz_soudce' + s + '.txt'), 'utf8');
  for (const r of RUNES) if (new RegExp('\\b' + r.n + '\\b').test(t)) throw new Error('jméno runy u soudce: ' + r.n);
}
fs.writeFileSync(path.join(H, 'vyz_klic.json'), JSON.stringify(klic, null, 1));
console.log('ok', obrazy.length, 'obrazů ×2 jazyky =', obrazy.length * 2, 'položek na soudce');
