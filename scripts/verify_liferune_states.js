// §19 seed-and-assert: záložka ŽIVOTNÍ RUNA musí dávat smysl i nepřihlášenému.
//
// 2026-09-11. KUKY: „ta life rune ma byt pro vsechny v novem okne!" Životní runa je čistý
// výpočet z data narození (`calcLifeRune`) — žádný server, žádný účet — takže návštěvník
// smí zjistit, KTEROU nese; za přihlášením zůstává jen ČTENÍ.
//
// ⚠️ Co tu žilo nepovšimnuté a proč ta kontrola vznikla: návštěvníkovi se zobrazil formulář
// na datum narození s tlačítkem „REVEAL MY LIFE RUNE →", ale větev `!currentUser`
// v `updateTreeTab()` končila dřív, než se stihlo cokoli odhalit — po odeslání se vrátila
// tatáž brána. Slepá ulička na první obrazovce, kterou cizí člověk uvidí.
//
// Druhá křehká věc: nabídka „za 3 kredity" se návštěvníkovi SKRÝVÁ nastavením stylu na prvku.
// Styl na prvku zůstává, takže přihlášenému se musí VRÁTIT — jinak by po přihlášení zmizela
// natrvalo. Kontrola proto testuje obojí v jednom běhu.
//
//   node scripts/verify_liferune_states.js
const fs = require('fs');
const vm = require('vm');
const DIR = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';

// Minimální DOM: prvky se vyrábějí na požádání, takže se tu nemusí udržovat jejich seznam
// (ten by se rozešel s HTML při první úpravě).
const prvky = {};
const mk = (id) => ({
  id, style: {}, textContent: '', innerHTML: '', value: '',
  classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
  setAttribute() {}, getAttribute: () => null,
});
const doc = {
  getElementById: (id) => (prvky[id] || (prvky[id] = mk(id))),
  querySelector: () => null, querySelectorAll: () => [],
  addEventListener() {}, createElement: () => mk('x'), body: mk('body'),
};
const retez = new Proxy(function () {}, { get: () => retez, apply: () => retez });
const S = {
  console: { log() {}, warn() {}, error() {} }, Math, JSON, Date, document: doc,
  setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  navigator: {}, location: { href: '' }, supabase: { createClient: () => retez },
  addEventListener() {}, scrollTo() {}, fetch: () => Promise.resolve({ ok: false }),
};
S.window = S; S.self = S; S.globalThis = S;

let code = 'var currentUser=null; var userTier="rune_seeker"; var sb=null; var activeChar=null;\n'
         + 'var corrections=[]; var isTester=false; var profileLoaded=true; var userCredits=0;\n'
         + 'var userFreeBalance=0; var _lifeRuneText=null; var _foundingText=null;\n'
         + 'var userTreeFounded=false; var readerUser={}; var _treeLog=[]; var userName=null;\n'
         + 'var _lifeRuneNum=null;\n';
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js',
                 'runar-character.js', 'runar-utils.js', 'runar-svgs.js', 'runar-tree.js']) {
  code += '\n/* ' + f + ' */\n' + fs.readFileSync(DIR + f, 'utf8') + '\n;\n';
}
// Živý strom a jméno stromu sem netáhneme — testuje se stav ZÁLOŽKY, ne kresba.
code += '\nfunction renderLivingTree(){}; function _renderTreeNameState(){}; function isAdmin(){return false;}\n';
vm.createContext(S);
try { vm.runInContext(code, S); }
catch (e) { console.log('FAIL  nepodařilo se načíst strom: ' + e.message); process.exit(1); }

let fail = 0;
const rekni = (ok, popis) => { if (ok) console.log('  ✓ ' + popis); else { fail++; console.log('  ✗ ' + popis); } };

function stav(prihlasen, maDob, tier, L) {
  Object.keys(prvky).forEach((k) => { prvky[k].style = {}; prvky[k].textContent = ''; prvky[k].innerHTML = ''; });
  vm.runInContext('currentUser=' + (prihlasen ? '{id:"u1",email:"a@b.cz"}' : 'null')
    + '; userTier=' + JSON.stringify(tier || 'rune_seeker')
    + '; readerUser=' + JSON.stringify(maDob ? { d: 14, m: 6, y: 1979 } : {})
    + '; lang=' + JSON.stringify(L) + ';', S);
  vm.runInContext('updateTreeTab()', S);
  const g = (id) => (prvky[id] || mk(id));
  return {
    noDob: g('tree-no-dob').style.display, noDobText: String(g('tree-no-dob-text').textContent),
    teaser: g('tree-rs-teaser').style.display, runa: String(g('tree-rune-name-teaser').textContent),
    glyf: String(g('tree-rune-glyph-teaser').innerHTML), cta: g('tree-rs-cta-block').style.display,
    vyzva: String(g('tree-teaser-text').textContent),
  };
}

for (const L of ['en', 'is']) {
  const T = vm.runInContext('UI_TEXT', S)[L];

  // 1) návštěvník BEZ data narození — pozvánka zadat datum, ne „přihlas se"
  const a = stav(false, false, null, L);
  rekni(a.noDob === 'block', L + '  návštěvník bez data → vidí formulář na datum');
  rekni(a.noDobText === T.tree_visitor_dob, L + '  …a je v něm POZVÁNKA, ne výzva k přihlášení');
  rekni(a.teaser !== 'block', L + '  …a žádnou runu mu to neukazuje (nemá z čeho)');

  // 2) návštěvník S datem — dostane svou runu. Tohle je ten dřívější slepý konec.
  const b = stav(false, true, null, L);
  rekni(b.teaser === 'block', L + '  návštěvník s datem → DOSTANE svou runu (dřív slepá ulička)');
  rekni(b.runa.length > 2, L + '  …se jménem runy („' + b.runa + '")');
  rekni(b.glyf.indexOf('<svg') !== -1, L + '  …i s glyfem');
  rekni(b.vyzva === T.tree_visitor_read, L + '  …a výzvou přihlásit se kvůli ČTENÍ');
  rekni(b.cta === 'none', L + '  …bez nabídky za kredity (nemá účet ani zůstatek)');
  rekni(b.noDob === 'none', L + '  …a formulář na datum už nesvítí');

  // 3) přihlášený — nabídka za kredity se musí VRÁTIT (styl zůstává na prvku)
  const c = stav(true, true, 'rune_seeker', L);
  rekni(c.teaser === 'block', L + '  přihlášený Rune Seeker → teaser');
  rekni(c.cta === '', L + '  …a nabídka za kredity je zpátky viditelná');
  rekni(c.vyzva === T.tree_rs_teaser, L + '  …s vlastním textem, ne s tím pro návštěvníka');
}

if (fail) { console.log('\nFAIL — ' + fail + ' tvrzení o záložce životní runy neplatí.'); process.exit(1); }
console.log('\nOK — životní runa funguje i bez účtu (návštěvník dostane runu, čtení zůstává za přihlášením).');
