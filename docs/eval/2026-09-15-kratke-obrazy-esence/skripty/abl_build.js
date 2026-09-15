// Owner 2026-09-14: esencni radek — "udelej verze bez jednoho (DOES), bez druheho (vzor) a posledni bez obou".
// PILOT n=1 na variantu (pravidlo: napred par, pak se souhlasem vic). Zaklad = cteni B (Isa, "windless fjord",
// stillness, seed 20260914) — to uz mame: "Isa is water held so still that the dark stones below come into view."
// Meni se JEN pravidlo THE ESSENCE LINE (VOICE_PROFILES[aktivni].rules.describe.en); vse ostatni shodne (diff).
// + Ask nad ctenim B s otazkou rozsirenou o "And what does it mean for me?" (produkcni pravidla beze zmeny).
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OUT = path.join(__dirname, 'prompty-abl');
fs.mkdirSync(OUT, { recursive: true });
function sandbox(seed) {
  const S = { console: { log() {}, warn() {}, error() {} } };
  S.window = S; S.globalThis = S; S.lang = 'en';
  S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
  S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
  vm.createContext(S);
  vm.runInContext('var userGender="hk"; var corrections=[];', S);
  for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
    vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
  vm.runInContext('var __seed = ' + seed + '; Math.random = function () { __seed = (__seed * 1103515245 + 12345) % 2147483648; return __seed / 2147483648; };', S);
  return S;
}
const zapis = (id, sys, user) => fs.writeFileSync(path.join(OUT, id + '.txt'), '=== SYSTEM PROMPT ===\n' + sys + '\n\n=== USER MESSAGE ===\n' + user + '\n');
function nahrad(txt, a, b) { if (txt.indexOf(a) === -1) throw new Error('nenalezeno: ' + a); return txt.replace(a, b); }
const bezDOES = t => nahrad(nahrad(t,
  'says what the rune DOES through this image — its sense in plain words',
  'says the rune\'s sense through this image, in plain words'),
  'The familiar word may live inside the doing (', 'The familiar word may live inside that line (');
const bezVzoru = t => nahrad(nahrad(t,
  ' — "Fehu is that warmth passed from hand to hand", not "Fehu is wealth".', '.'),
  ' ("exchange between the sea and the shore")', '');
const VARIANTY = { E0: t => t, E1: bezDOES, E2: bezVzoru, E3: t => bezVzoru(bezDOES(t)) };
const texty = {};
for (const [id, fn] of Object.entries(VARIANTY)) {
  const S = sandbox(20260914);
  vm.runInContext('RUNE_IMAGES.splice(0, RUNE_IMAGES.length, ["Isa","any","windless fjord","windless fjord","kyrrstaða","stillness","E"]);', S);
  const key = vm.runInContext('ACTIVE_VOICE_PROFILE', S);
  const puvodni = vm.runInContext('VOICE_PROFILES[ACTIVE_VOICE_PROFILE].rules.describe.en', S);
  S.__novy = fn(puvodni);
  vm.runInContext('VOICE_PROFILES[ACTIVE_VOICE_PROFILE].rules.describe.en = __novy;', S);
  const sys = vm.runInContext('buildSysPrompt(DEF_CHAR_EN, "en")', S);
  const user = vm.runInContext('buildReadingPromptSingle({ name: "Kuky", lifeRune: RUNES.filter(function(r){return r.n==="Gebo";})[0] }, RUNES.filter(function(r){return r.n==="Isa";})[0], "en", [])', S);
  texty[id] = { sys, user, pravidlo: S.__novy, key };
  if (id !== 'E0') zapis(id, sys, user);
}
// kontrola: E0 musi byt bajt po bajtu B z minula
const B = fs.readFileSync(path.join(__dirname, 'prompty-ab', 'B.txt'), 'utf8');
if (B !== '=== SYSTEM PROMPT ===\n' + texty.E0.sys + '\n\n=== USER MESSAGE ===\n' + texty.E0.user + '\n') throw new Error('E0 != B — zaklad se rozesel');
console.log('E0 == prompt B z minula ✓ (profil: ' + texty.E0.key + ')');
for (const id of ['E1', 'E2', 'E3']) {
  const a = texty.E0.user.split('\n'), b = texty[id].user.split('\n');
  const r = a.map((l, i) => l === b[i] ? null : i).filter(x => x !== null);
  console.log(id + ': lisi se radku ' + r.length + (texty.E0.sys === texty[id].sys ? ' · system shodny' : ' · SYSTEM JINY'));
  console.log('   ' + texty[id].pravidlo);
}
// Ask s rozsirenou otazkou
const cteniB = 'A yellow birch leaf rests on the windless fjord, Kuky, and no ring spreads from where it landed. Isa is water held so still that the dark stones below come into view. What passes between leaf and water when neither one moves?';
const SA = sandbox(1);
SA.__cteni = cteniB; SA.__q = 'What passes between leaf and water when neither one moves? And what does it mean for me?';
const askUser = vm.runInContext('buildAskPrompt(__cteni, __q, "Isa", "en", [], RUNES.filter(function(r){return r.n==="Gebo";})[0], {}, { mode: "single", runy: ["Isa"] })', SA);
zapis('ASK2', vm.runInContext('buildSysPrompt(DEF_CHAR_EN, "en")', SA), askUser);
const stary = fs.readFileSync(path.join(__dirname, 'prompty-ab2', 'ASK.txt'), 'utf8');
console.log('ASK2: oproti minulemu Asku se lisi radku ' + (() => { const a = stary.split('\n'), b = fs.readFileSync(path.join(OUT, 'ASK2.txt'), 'utf8').split('\n'); return a.filter((l, i) => l !== b[i]).length; })());
