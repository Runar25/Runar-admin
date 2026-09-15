// Owner 2026-09-15: esencni radek — vzor od GPT ("Fehu is wealth that becomes real when it is exchanged, shared,
// or put to use," not "Fehu is wealth.") proti produkci, test na 3 runach. Owner: "neříkám použij přesně takhle,
// je to jiný pohled" — testuje se ale PRESNE to zneni, jinak nevime, co jsme meřili.
// Pro kazdou runu: produkcni radek obrazu z banky (cteny z kodu), stejny seed v obou ramenech; lisi se JEN
// pravidlo THE ESSENCE LINE (VOICE_PROFILES.focused.rules.describe.en). Isa = seed a obraz jako cteni A
// z 2026-09-14 -> produkcni rameno uz existuje (overi se bajtova shoda promptu).
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OUT = path.join(__dirname, 'prompty-gpt');
fs.mkdirSync(OUT, { recursive: true });
const STARE = 'Never its textbook symbol or a dictionary phrase as the label — "Fehu is that warmth passed from hand to hand", not "Fehu is wealth". The familiar word may live inside the doing ("exchange between the sea and the shore").';
const NOVE = 'Never use its textbook symbol or a dictionary phrase as the label. Give its familiar meaning a living, plain-language form: "Fehu is wealth that becomes real when it is exchanged, shared, or put to use," not "Fehu is wealth." The familiar word may remain inside the doing, as in "the exchange between the sea and the shore."';
const src = fs.readFileSync(D + 'runar-character.js', 'utf8');
function radek(runa, zacatekEN) {
  const re = new RegExp("\\['" + runa + "','(\\w+)','([^']*)','(" + zacatekEN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "[^']*)','([^']*)','([^']*)','([DEP])'");
  const m = src.match(re); if (!m) throw new Error('radek nenalezen: ' + runa);
  return [runa, 'any', m[2], m[3], m[4], m[5], m[6]];
}
const PRIPADY = [
  { id: 'Isa', seed: 20260914, row: radek('Isa', 'The calm lies over the fjord') },
  { id: 'Raidho', seed: 20260916, row: radek('Raidho', 'The sheep-track winds') },
  { id: 'Mannaz', seed: 20260917, row: radek('Mannaz', 'The reflection in the still lagoon') },
];
function postav(p, nahradit) {
  const S = { console: { log() {}, warn() {}, error() {} } };
  S.window = S; S.globalThis = S; S.lang = 'en';
  S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
  S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
  vm.createContext(S);
  vm.runInContext('var userGender="hk"; var corrections=[];', S);
  for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
    vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
  vm.runInContext('var __seed = ' + p.seed + '; Math.random = function () { __seed = (__seed * 1103515245 + 12345) % 2147483648; return __seed / 2147483648; };', S);
  S.__row = p.row;
  vm.runInContext('RUNE_IMAGES.splice(0, RUNE_IMAGES.length, __row);', S);
  if (nahradit) {
    const r = vm.runInContext('VOICE_PROFILES[ACTIVE_VOICE_PROFILE].rules.describe.en', S);
    if (r.indexOf(STARE) === -1) throw new Error('produkcni zneni vzoru se zmenilo');
    S.__novy = r.replace(STARE, NOVE);
    vm.runInContext('VOICE_PROFILES[ACTIVE_VOICE_PROFILE].rules.describe.en = __novy;', S);
  }
  return {
    sys: vm.runInContext('buildSysPrompt(DEF_CHAR_EN, "en")', S),
    user: vm.runInContext('buildReadingPromptSingle({ name: "Kuky", lifeRune: RUNES.filter(function(r){return r.n==="Gebo";})[0] }, RUNES.filter(function(r){return r.n===' + JSON.stringify(p.id) + ';})[0], "en", [])', S),
  };
}
const soubor = x => '=== SYSTEM PROMPT ===\n' + x.sys + '\n\n=== USER MESSAGE ===\n' + x.user + '\n';
for (const p of PRIPADY) {
  const P = postav(p, false), G = postav(p, true);
  const a = P.user.split('\n'), b = G.user.split('\n');
  const diff = a.filter((l, i) => l !== b[i]).length;
  fs.writeFileSync(path.join(OUT, p.id + '-P.txt'), soubor(P));
  fs.writeFileSync(path.join(OUT, p.id + '-G.txt'), soubor(G));
  let pozn = '';
  if (p.id === 'Isa') pozn = (fs.readFileSync(path.join(__dirname, 'prompty-ab', 'A.txt'), 'utf8') === soubor(P)) ? ' · produkcni rameno == cteni A z 2026-09-14 ✓' : ' · ⚠️ NESHODA s A';
  console.log('──── ' + p.id + ' · obraz: ' + p.row[3] + ' · aspekt: ' + p.row[5] + ' · lisi se radku: ' + diff + pozn);
  console.log(P.user.split('\n').filter(l => /^(DRAWN RUNE|READING ANGLE|One flowing|End |One paragraph)/.test(l)).map(l => '   ' + l.slice(0, 150)).join('\n'));
}
