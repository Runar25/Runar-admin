// CODE-read 2026-09-20 — owner: „udělej mi 4 čtení, ať můžu porovnat stejnou runu při různém počtu vět: 3, 4, 5,
// nebo 4 věty a více čárek. Přidej taky AREA Inner Growth, kde by se mohla jako čočka projevit i Gebo jako life rune."
// Produkce v4.31; stejné vše kromě délky: Raidho (jádro cairns + místo), úhel [3], jméno uprostřed, oblast Inner Growth,
// ČOČKA Gebo ZAPNUTÁ, konec = most ve tvaru „dvě možnosti" (owner: „tohle je výborné").
// Souběžně: oprava mostu pro TĚŽKÉ runy — drží „may be", ubírá jen útěchu (Isa, 3 čtení).
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OUT = path.join(__dirname, 'delky');
fs.mkdirSync(OUT, { recursive: true });
const MOST_TWO = 'End on one line that holds out two things this may be in the seeker\u2019s life, each a state that may be so, left for them to weigh.';
const MOST_HEAVY = 'End on one line that holds out two things this may be in the seeker\u2019s life, each a state that may be so — said plainly, without comfort or softening.';
const DELKY = {
  '3vety': 'One flowing reading — 3 short sentences, 38 to 45 words total. It will be read aloud, so keep every sentence lean — about 20 to 25 seconds spoken. No sections, no labels, no line breaks between thoughts.',
  '4vety': 'One flowing reading — 4 short sentences, 50 to 58 words total. It will be read aloud, so keep every sentence lean — about 28 to 33 seconds spoken. No sections, no labels, no line breaks between thoughts.',
  '5vet':  'One flowing reading — 5 short sentences, 62 to 70 words total. It will be read aloud, so keep every sentence lean — about 34 to 40 seconds spoken. No sections, no labels, no line breaks between thoughts.',
  '4vety-carky': 'One flowing reading — 4 sentences, 50 to 58 words total; a sentence may carry a second clause after a comma where the thought needs it. It will be read aloud, so keep it lean — about 28 to 33 seconds spoken. No sections, no labels, no line breaks between thoughts.',
};
function box() {
  const S = { console: { log() {}, warn() {}, error() {} } };
  S.window = S; S.globalThis = S; S.lang = 'en';
  S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
  const st = {};
  S.localStorage = { getItem: k => (k in st ? st[k] : null), setItem: (k, v) => { st[k] = String(v); }, removeItem: k => { delete st[k]; } };
  vm.createContext(S);
  vm.runInContext('var userGender="kk"; var corrections=[];', S);
  for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
    vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
  return S;
}
function jedna(t, a, b, co) { if (t.split(a).length !== 2) throw new Error(co + ': výskyt není právě jeden'); return t.replace(a, b); }
// ── Raidho, čočka Gebo zapnutá, oblast Inner Growth
{
  const S = box();
  vm.runInContext(`
    var __row = null;
    for (var i = 0; i < RUNE_IMAGES.length; i++) if (RUNE_IMAGES[i][0] === 'Raidho' && RUNE_IMAGES[i][3].indexOf('cairns, each in sight') === 0) { __row = RUNE_IMAGES[i]; break; }
    RUNE_IMAGES.splice(0, RUNE_IMAGES.length, __row);
    IMG_PLACES.P.splice(0, IMG_PLACES.P.length, ['í fjallaskarði', 'a mountain pass']);
    _randomAngle = function () { return READING_ANGLES[3]; };
    _lengthBudget = function () { return LENGTH_BUDGETS[0]; };
    _endingShape = function () { return ENDING_OPEN[2]; };
    _namePlacement = function (name) { return NAME_PLACEMENTS[1].split('{name}').join(name); };`, S);
  const sys = vm.runInContext('buildSysPrompt(DEF_CHAR_EN, "en")', S);
  const user = vm.runInContext('buildReadingPromptSingle({ name: "Kuky", area: "Inner Growth", lifeRune: RUNES.filter(function(r){return r.n==="Gebo";})[0], lifeLensOn: true }, RUNES.filter(function(r){return r.n==="Raidho";})[0], "en", [])', S);
  if (!/CLOSING LENS/.test(user)) throw new Error('cocka v promptu chybi');
  if (!/Inner Growth|inner growth|growth/i.test(user)) throw new Error('oblast v promptu chybi');
  const zaklad = jedna(user, vm.runInContext('ENDING_OPEN[2]', S), MOST_TWO, 'most');
  for (const [id, veta] of Object.entries(DELKY)) {
    const u2 = jedna(zaklad, DELKY['3vety'], veta, 'delka ' + id);
    fs.writeFileSync(path.join(OUT, 'raidho-' + id + '.txt'), '=== SYSTEM PROMPT ===\n' + sys + '\n\n=== USER MESSAGE ===\n' + u2 + '\n');
  }
  console.log('Raidho: oblast + čočka v promptu ✓');
  console.log('  oblast: ' + (user.split('\n').find(l => /growth|area/i.test(l)) || '').slice(0, 150));
  console.log('  čočka:  ' + (user.split('\n').find(l => /CLOSING LENS/.test(l)) || '').slice(0, 150));
}
// ── Isa (těžká runa): most, který drží „may be" a ubírá jen útěchu
{
  const S = box();
  vm.runInContext(`
    var __row = null;
    for (var i = 0; i < RUNE_IMAGES.length; i++) if (RUNE_IMAGES[i][0] === 'Isa' && RUNE_IMAGES[i][3].indexOf('The cup of coffee') === 0) { __row = RUNE_IMAGES[i]; break; }
    RUNE_IMAGES.splice(0, RUNE_IMAGES.length, __row);
    _randomAngle = function () { return READING_ANGLES[2]; };
    _lengthBudget = function () { return LENGTH_BUDGETS[1]; };
    _endingShape = function () { return ENDING_HEAVY[0]; };
    _namePlacement = function (name) { return NAME_PLACEMENTS[1].split('{name}').join(name); };`, S);
  const sys = vm.runInContext('buildSysPrompt(DEF_CHAR_EN, "en")', S);
  const user = vm.runInContext('buildReadingPromptSingle({ name: "Kuky", area: "Inner Growth", lifeRune: RUNES.filter(function(r){return r.n==="Gebo";})[0], lifeLensOn: true }, RUNES.filter(function(r){return r.n==="Isa";})[0], "en", [])', S);
  const u2 = jedna(user, vm.runInContext('ENDING_HEAVY[0]', S), MOST_HEAVY, 'most heavy');
  fs.writeFileSync(path.join(OUT, 'isa-heavy-most.txt'), '=== SYSTEM PROMPT ===\n' + sys + '\n\n=== USER MESSAGE ===\n' + u2 + '\n');
  console.log('Isa (těžká): konec nahrazen mostem „dvě možnosti, bez útěchy" ✓');
}
console.log('\nmost TWO: ' + MOST_TWO + '\nmost HEAVY: ' + MOST_HEAVY);
