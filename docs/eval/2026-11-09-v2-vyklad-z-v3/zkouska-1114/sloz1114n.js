// Lab 2026-11-14 (3): čtení BEZ OBRAZU — oprava zkoušky P1–P3, která obraz nechala ve všech třech variantách.
// Owner: popis obrazu se mu nelíbí („ta první část, popis obrazu, se mi nelíbí“), líbí se věty „You can look at what remains
// unchanged without deciding yet what it means. It may be a standstill you cannot shift, or a pause in which you see more clearly.“;
// téhož dne u Rune of the Day (BACKLOG): „bez obrazu“, tři části — popis runy · co se na základě runy může v člověku odehrávat ·
// na co se může zaměřit. Po P1–P3: „proč je všude obraz, když jsem říkal, že tam žádný být nemá? dostal jsi jasné zadání bez obrazu.“
// Systém = produkce beze změny. V zadání NENÍ žádný obraz ani stránka z banky obrazů; zdroj významu = popis runy z appky
// (UI_TEXT.en.coll_rune: 1. a 3. odstavec; 2. odstavec mluví o obraze, proto ven; 4. = otázka runy). Nic nevolá.
//   N1 = tři části podle ownerovy stavby + konec dvěma možnostmi   N2 = bez pořadí vět   N3 = viditelný plán (smysl + dvě tváře)
'use strict';
const fs = require('fs'), vm = require('vm');
const zaklad = require('./sloz1114.js');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
function popis(runa) {
  const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
  S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
  S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
  vm.createContext(S);
  for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js']) vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
  const p = vm.runInContext('UI_TEXT.en.coll_rune', S)[runa];
  if (!Array.isArray(p) || p.length !== 4) throw new Error(runa + ': popis runy nemá čtyři odstavce');
  if (!/image/.test(p[1])) throw new Error(runa + ': 2. odstavec nemluví o obraze — zkontroluj, co se vynechává');
  if (/image|picture/.test(p[0] + p[2])) throw new Error(runa + ': v 1. nebo 3. odstavci je slovo obraz');
  return { co: p[0] + ' ' + p[2], otazka: p[3].replace(/^Perhaps it asks:\s*/, '') };
}
const HLAVA = (R, d) => '# TASK\nWrite one rune reading, as Rúnar speaking to the seeker. It will be read aloud.\nThe reading speaks about the rune and about what may be going on in a person\'s life. It contains no scene: no place, weather, object or animal.\n\n' +
  '# THE RUNE\nRune: ' + R + '\nWhat ' + R + ' is (your source; say it in your own words): ' + d.co + '\nThe question ' + R + ' asks: ' + d.otazka + '\n\n';
const POSLEDNI = (R) => 'Hold out two things this may be in the seeker\'s life, each a state that may be so, said plainly. Let them grow out of the question ' + R + ' asks, in your own words.';
const O_CEM = '# WHAT STAYS OPEN\nYou do not know this person. What the rune is in their own life is theirs to say: speak of what may be so, and let the last sentence leave the choice with them.\n\n';
const VYSTUP = (R, json) => '# OUTPUT\nFour short sentences, 50 to 58 words in all, one paragraph. Name ' + R + ' once.\nReturn only this JSON array: ' + json;
const JSON1 = '[{"rune": "(the rune name)", "text": "(the reading, one paragraph)"}]';
const VARIANTY = {
  N1: (R, d) => HLAVA(R, d) + '# HOW TO WRITE IT\nFour sentences, in this order:\n' +
    '1. Begin "' + R + ' stands for" and say what the rune is, in plain words a stranger to runes would grasp.\n' +
    '2. Say what may be going on in a person when this rune is drawn: what may be present, or missing.\n' +
    '3. Say what the seeker can look at or notice now. Begin "You can".\n' +
    '4. ' + POSLEDNI(R) + '\n\n' + O_CEM + VYSTUP(R, JSON1),
  N2: (R, d) => HLAVA(R, d) + '# HOW TO WRITE IT\nName the rune and say plainly what it is, then stay with what that can be like in a person\'s life. The last sentence: ' + POSLEDNI(R) + '\n\n' + O_CEM + VYSTUP(R, JSON1),
  N3: (R, d) => HLAVA(R, d) + '# HOW TO WRITE IT\nWork in three steps and write each step into the output.\n' +
    'Step 1, "sense": say what ' + R + ' is in at most 8 plain words.\n' +
    'Step 2, "faces": name the two faces ' + R + ' can have in a life, in at most 12 words.\n' +
    'Step 3, "text": write the reading from those two steps. One sentence begins "' + R + ' stands for". The last sentence: ' + POSLEDNI(R) + '\n\n' +
    O_CEM + VYSTUP(R, '[{"rune": "(the rune name)", "sense": "(step 1)", "faces": "(step 2)", "text": "(step 3: the reading, one paragraph)"}]'),
};
function postav(u) {
  const x = zaklad.postav(Object.assign({}, u, { zmeny: [] }));
  const v = (u.zmeny || [])[0]; if (!VARIANTY[v]) throw new Error(u.id + ': neznámá varianta ' + v);
  x.p = VARIANTY[v](u.runa, popis(u.runa)); x.draws = { image: null };
  if (/snow|heath|sea |shore|image|picture/i.test(x.p.replace('no scene: no place, weather, object or animal', ''))) throw new Error(u.id + ': v zadání zůstalo slovo obrazu');
  return x;
}
module.exports = { postav };
if (require.main === module) {
  for (const u of JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))) {
    const x = postav(u);
    console.log('==== ' + u.id + ' | zadání ' + x.p.split(/\s+/).filter(Boolean).length + ' slov');
    if (process.argv.includes('--cely')) console.log(x.p + '\n');
  }
}
