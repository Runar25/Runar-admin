// Vyhodnocení kola k4 „které významy obraz unese“ (viz vyznamy_build.js — pravidlo předem: 4/4 = oba soudci EN i oba IS).
//   node vyznamy_vyhodnot.js   (čte vyz_klic.json + vyz_odpovedi.json {soudce: {číslo: "a, c"}}) → vyz_vysledek.json
const fs = require('fs'), path = require('path'), vm = require('vm');
const H = __dirname, D = path.join(H, '..', '..', '..', 'v2') + path.sep;
const S = { console: { log() {}, warn() {}, error() {} }, document: { getElementById: () => null }, localStorage: { getItem: () => null, setItem() {} } };
S.window = S; vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
const RUNES = vm.runInContext('RUNES', S), IMG = vm.runInContext('RUNE_IMAGES', S);
const klic = JSON.parse(fs.readFileSync(path.join(H, 'vyz_klic.json'), 'utf8'));
const odp = JSON.parse(fs.readFileSync(path.join(H, 'vyz_odpovedi.json'), 'utf8'));
const sp = (s) => String(s || '').split(',').map((x) => x.trim()).filter(Boolean);
// EN klíč → IS protějšek. Pořadí `k` a `k_is` sedí u všech run kromě Fehu a Dagazu (zjištěno 2026-10-05) — tam ručně podle smyslu.
const RUCNE = {
  Fehu: { 'wealth': 'auður', 'cattle': 'búfé', 'material prosperity': 'efnisleg velsæld' },
  Dagaz: { 'turning point': 'tímamót', 'dawn': 'dögun', 'breakthrough': 'bylting', 'light': 'ljós', 'transformation': 'umbreyting' },
};
const protejsek = (runa, en) => {
  if (RUCNE[runa]) return RUCNE[runa][en];
  const r = RUNES.find((x) => x.n === runa); return sp(r.k_is)[sp(r.k).indexOf(en)];
};
const znacky = {};   // id → lang → význam → počet soudců
klic.soudci.forEach((zaznam, s) => {
  const o = odp[String(s + 1)] || {};
  for (const z of zaznam) {
    const a = String(o[String(z.n)] || '').toLowerCase();
    const pis = a === '-' ? [] : (a.match(/[a-h]/g) || []);
    const t = ((znacky[z.id] = znacky[z.id] || { en: {}, is: {} })[z.lang]);
    for (const p of pis) { const v = z.pismena[p]; if (v) t[v] = (t[v] || 0) + 1; }
  }
});
const vysledek = [];
for (const ob of klic.obrazy) {
  const r = RUNES.find((x) => x.n === ob.runa);
  const row = IMG.find((x) => x[0] === ob.runa && x[3] === ob.en);
  const ted = row ? String(row[5]).split('|') : [];
  const z = znacky[ob.id] || { en: {}, is: {} };
  const radky = sp(r.k).map((en) => {
    const is = protejsek(ob.runa, en);
    return { en, is, nEN: z.en[en] || 0, nIS: z.is[is] || 0 };
  }).filter((x) => x.nEN || x.nIS || ted.indexOf(x.en) !== -1);
  radky.sort((a, b) => (b.nEN + b.nIS) - (a.nEN + a.nIS));
  const prijato = radky.filter((x) => x.nEN === 2 && x.nIS === 2).map((x) => x.en);
  vysledek.push({ id: ob.id, sk: ob.sk, runa: ob.runa, en: ob.en, ted, radky, prijato });
  console.log('[' + ob.sk + '] ' + ob.runa + ' · ' + ob.en.slice(0, 64) + (ted.length ? '  (teď: ' + ted.join(' | ') + ')' : ''));
  console.log('     ' + radky.map((x) => x.en + ' ' + x.nEN + '+' + x.nIS + (ted.indexOf(x.en) !== -1 ? '*' : '')).join(' · ') + '   → 4/4: ' + (prijato.join(', ') || '—'));
}
fs.writeFileSync(path.join(H, 'vyz_vysledek.json'), JSON.stringify(vysledek, null, 1));
