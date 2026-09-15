// Owner 2026-09-15 — dva testy, oba BEZ zivotni runy jako cocky (owner: "budeme cteni delat bez zivotni runy jako cocka"):
// T1 (delka obrazu na Raidhu, ktere se ownerovi libi): presne losy produkcniho cteni e2e82087 (uhel 6, 4 vety,
//    konec open2, jmeno Thor uprostred, aspekt the road, svet Midgard). L = produkcni dlouhy obraz mohyl,
//    S = kratky "cairns across the heath". 3 behy na rameno (tentyz prompt, model se lisi sam).
//    Hypoteza ownera: s kratkym obrazem se vic projevi aspekt, uhel a svet.
// T2 (ctyri vety hlasu): 5 run s produkcnim obrazem z banky, vlastni seed na runu; P = dnesni ctyri vzory v
//    VOICE_PROFILES.focused.en, N = navrh CODE-read 2026-09-15. User message shodna, lisi se jen system prompt.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OUT = path.join(__dirname, 'prompty-t15');
fs.mkdirSync(OUT, { recursive: true });
const src = fs.readFileSync(D + 'runar-character.js', 'utf8');

const STARE4 = [
  '"The glacial river runs grey over black sand, heavy with everything the ice let go this spring. What in you is finally ready to move?" — an image that ends on a question.',
  '"The old birch bends under wet snow but does not break. Come spring it straightens again, as it always has." — an image that returns, no question.',
  '"Steam rises from the hot spring into the grey morning air, and the moss at its rim stays green all winter." — two still images, no call.',
  '"You are standing where the track splits, and both ways go down to the same shore." — second person, a plain statement.',
];
const NOVE4 = [
  '"Meltwater finds the old ditch behind the farm and runs it full by noon. Where does it go when the ditch runs out?" — an image that ends on a question.',
  '"The geese leave the home-field in October, and in April they come down on the same field again." — an image that returns, no question.',
  '"Under the midnight sun the harbour lies flat, and a gull sleeps on the last post of the pier." — two still images, no call.',
  '"You are sitting by the bus window as the town falls behind, and the snow has stopped." — second person, a plain statement.',
];

function sandbox(seed) {
  const S = { console: { log() {}, warn() {}, error() {} } };
  S.window = S; S.globalThis = S; S.lang = 'en';
  S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
  S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
  vm.createContext(S);
  vm.runInContext('var userGender="kk"; var corrections=[];', S);
  for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
    vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
  vm.runInContext('var __seed = ' + seed + '; Math.random = function () { __seed = (__seed * 1103515245 + 12345) % 2147483648; return __seed / 2147483648; };', S);
  return S;
}
function radek(runa, zacatek) {
  const re = new RegExp("\\['" + runa + "','\\w+','([^']*)','(" + zacatek + "[^']*)','([^']*)','([^']*)','([DEP])'");
  const m = src.match(re); if (!m) throw new Error('radek nenalezen: ' + runa);
  return [runa, 'any', m[1], m[2], m[3], m[4], m[5]];
}
const soubor = (sys, user) => '=== SYSTEM PROMPT ===\n' + sys + '\n\n=== USER MESSAGE ===\n' + user + '\n';
const diff = (a, b) => { const x = a.split('\n'), y = b.split('\n'); return x.filter((l, i) => l !== y[i]); };

// ── T1
function raidho(obrazEN) {
  const S = sandbox(1);
  const r = radek('Raidho', 'The cairns stand');
  S.__row = r.slice(); S.__row[3] = obrazEN; if (obrazEN !== r[3]) S.__row[2] = obrazEN;
  vm.runInContext(`
    RUNE_IMAGES.splice(0, RUNE_IMAGES.length, __row);
    _randomAngle = function () { return READING_ANGLES[6]; };
    _lengthBudget = function () { return LENGTH_BUDGETS[1]; };
    _endingShape = function () { return ENDING_OPEN[2]; };
    _namePlacement = function (name) { return NAME_PLACEMENTS[1].split('{name}').join(name); };`, S);
  return { sys: vm.runInContext('buildSysPrompt(DEF_CHAR_EN, "en")', S),
           user: vm.runInContext('buildReadingPromptSingle({ name: "Thor" }, RUNES.filter(function(r){return r.n==="Raidho";})[0], "en", [])', S) };
}
const L = raidho(radek('Raidho', 'The cairns stand')[3]);
const Sh = raidho('cairns across the heath');
if (L.sys !== Sh.sys) throw new Error('T1 system se lisi');
if (/CLOSING LENS/.test(L.user)) throw new Error('T1 cocka tam je');
console.log('T1 lisi se radku: ' + diff(L.user, Sh.user).length + '\n  L: ' + diff(L.user, Sh.user)[0] + '\n  S: ' + diff(Sh.user, L.user)[0]);
fs.writeFileSync(path.join(OUT, 'T1-L.txt'), soubor(L.sys, L.user));
fs.writeFileSync(path.join(OUT, 'T1-S.txt'), soubor(Sh.sys, Sh.user));
console.log('\n==== T1 USER MESSAGE L (cely) ====\n' + L.user + '\n');

// ── T2
const RUNY = [
  ['Fehu', 'The bread comes hot', 20260921], ['Ansuz', 'Someone calls your name', 20260922], ['Kenaz', 'The forge glows', 20260923],
  ['Jera', 'The hay dries a shade', 20260924], ['Tiwaz', 'You give back the change', 20260925],
];
const LEAK = /\b(grey|gray|glacial|black sand|birch|wet snow|steam|hot spring|moss|track|splits?|shore|meltwater|ditch|farm|geese|goose|home-field|harbour|harbor|gull|pier|bus|town|snow)\b/gi;
for (const [runa, zac, seed] of RUNY) {
  const r = radek(runa, zac);
  const par = {};
  for (const arm of ['P', 'N']) {
    const S = sandbox(seed);
    S.__row = r;
    vm.runInContext('RUNE_IMAGES.splice(0, RUNE_IMAGES.length, __row);', S);
    if (arm === 'N') {
      let v = vm.runInContext('VOICE_PROFILES.focused.en', S);
      STARE4.forEach((s, i) => { if (v.indexOf(s) === -1) throw new Error('vzor ' + i + ' nenalezen'); v = v.replace(s, NOVE4[i]); });
      S.__v = v; vm.runInContext('VOICE_PROFILES.focused.en = __v;', S);
    }
    par[arm] = { sys: vm.runInContext('buildSysPrompt(DEF_CHAR_EN, "en")', S),
                 user: vm.runInContext('buildReadingPromptSingle({ name: "Thor" }, RUNES.filter(function(x){return x.n===' + JSON.stringify(runa) + ';})[0], "en", [])', S) };
    fs.writeFileSync(path.join(OUT, 'T2-' + runa + '-' + arm + '.txt'), soubor(par[arm].sys, par[arm].user));
  }
  if (par.P.user !== par.N.user) throw new Error(runa + ': user message se lisi');
  const leakObraz = (r[3].match(LEAK) || []).join(',');
  console.log('T2 ' + runa.padEnd(6) + ' user shodny ✓ · system lisi radku: ' + diff(par.P.sys, par.N.sys).length + ' · obraz: ' + r[3] + (leakObraz ? ' ⚠️ sledovane slovo v obrazu: ' + leakObraz : ''));
  console.log('   ' + par.P.user.split('\n').filter(l => /^(DRAWN RUNE|READING ANGLE|One flowing|End |One paragraph)/.test(l)).map(l => l.slice(0, 120)).join('\n   '));
}
