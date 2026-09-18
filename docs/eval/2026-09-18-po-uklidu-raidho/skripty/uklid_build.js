// CODE-read 2026-09-18 — test po KROKU 1 uklidu promptu (CODE-tune 2ff18eb, v4.26-uklid).
// Owner: "cteni bez zivotni runy jako cocka"; handoff: "3 cteni + Ask rozlouceni + Ask 'what does it mean for me',
// vyhodnotit proti dnesku". Dnesek = v4.25 (0fdd246), tytez losy jako ownerovo produkcni cteni e2e82087
// (uhel 6, konec open2, obraz mohyly, aspekt the road, jmeno Thor uprostred, delka LENGTH_BUDGETS[1] odvozena).
// Ask stoji nad OWNEROVYM produkcnim textem (ne nad novym ctenim), aby se menil jen Ask prompt.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const NOVE = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const STARE = path.join(__dirname, 'v425') + '/';
const OUT = path.join(__dirname, 'po-uklidu');
fs.mkdirSync(OUT, { recursive: true });

function sandbox(D) {
  const S = { console: { log() {}, warn() {}, error() {} } };
  S.window = S; S.globalThis = S; S.lang = 'en';
  S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
  S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
  vm.createContext(S);
  vm.runInContext('var userGender="kk"; var corrections=[];', S);
  for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
    vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
  const src = fs.readFileSync(D + 'runar-character.js', 'utf8');
  const m = src.match(/\['Raidho','any','(Vörðurnar[^']*)','(The cairns stand[^']*)','([^']*)','([^']*)','([DEP])'\]/);
  if (!m) throw new Error('radek cairns nenalezen v ' + D);
  S.__row = ['Raidho', 'any', m[1], m[2], m[3], m[4], m[5]];
  vm.runInContext(`
    RUNE_IMAGES.splice(0, RUNE_IMAGES.length, __row);
    _randomAngle = function () { return READING_ANGLES[6]; };
    _lengthBudget = function () { return LENGTH_BUDGETS[1]; };
    _endingShape = function () { return ENDING_OPEN[2]; };
    _namePlacement = function (name) { return NAME_PLACEMENTS[1].split('{name}').join(name); };`, S);
  return S;
}
const soubor = (sys, user) => '=== SYSTEM PROMPT ===\n' + sys + '\n\n=== USER MESSAGE ===\n' + user + '\n';
const rozdil = (a, b) => ({ pryc: a.split('\n').filter(l => b.split('\n').indexOf(l) === -1),
                            nove: b.split('\n').filter(l => a.split('\n').indexOf(l) === -1) });

const CTENI = 'You stand at the first cairn, and across the heath the next one waits within your sight. Raidho is the road walked one marker at a time, Thor, each stone reached before the far one shows itself. You cannot see the last from here, only the one that follows. That is enough to keep walking.';
const OTAZKY = { rozlouceni: 'Thank you, Rúnar.', proMe: 'What does it mean for me?' };

const vysl = {};
for (const [verze, D] of [['v425', STARE], ['v426', NOVE]]) {
  const S = sandbox(D);
  const sys = vm.runInContext('buildSysPrompt(DEF_CHAR_EN, "en")', S);
  const user = vm.runInContext('buildReadingPromptSingle({ name: "Thor" }, RUNES.filter(function(r){return r.n==="Raidho";})[0], "en", [])', S);
  if (/CLOSING LENS/.test(user)) throw new Error('cocka tam je');
  S.__u = user;
  const draws = vm.runInContext('_promptDraws(__u, "en")', S);
  vysl[verze] = { sys, user, draws };
  fs.writeFileSync(path.join(OUT, 'CTENI-' + verze + '.txt'), soubor(sys, user));
  for (const [k, q] of Object.entries(OTAZKY)) {
    S.__c = CTENI; S.__q = q;
    const ask = vm.runInContext('buildAskPrompt(__c, __q, "Raidho", "en", [], RUNES.filter(function(r){return r.n==="Gebo";})[0], {}, { mode: "single", runy: ["Raidho"] })', S);
    vysl[verze]['ask_' + k] = ask;
    fs.writeFileSync(path.join(OUT, 'ASK-' + k + '-' + verze + '.txt'), soubor(sys, ask));
  }
}
// kontrola: v4.25 cteni = archivovany T1-L (tentyz prompt, na kterem vznikly texty "dnes")
const t1l = fs.readFileSync('C:/Users/zkuku/Downloads/Runar-admin/docs/eval/2026-09-15-kratke-obrazy-esence/prompty-t15/T1-L.txt', 'utf8');
console.log('v4.25 cteni == archivovany T1-L: ' + (t1l === soubor(vysl.v425.sys, vysl.v425.user) ? 'ANO ✓' : 'NE ✗'));
console.log('losy v4.26: ' + JSON.stringify(vysl.v426.draws));
for (const [co, a, b] of [['SYSTEM', vysl.v425.sys, vysl.v426.sys], ['CTENI user', vysl.v425.user, vysl.v426.user],
                          ['ASK rozlouceni', vysl.v425.ask_rozlouceni, vysl.v426.ask_rozlouceni], ['ASK pro me', vysl.v425.ask_proMe, vysl.v426.ask_proMe]]) {
  const r = rozdil(a, b);
  console.log('\n──── ' + co + ': pryc ' + r.pryc.length + ' radku, nove ' + r.nove.length);
  r.pryc.forEach(l => console.log('  - ' + l));
  r.nove.forEach(l => console.log('  + ' + l));
}
console.log('\n==== CTENI v4.26 USER (cely) ====\n' + vysl.v426.user);
