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

// ⚠️ ŽÁDNÝ vlastní prolog s `var currentUser` a spol.: `runar-app.js` i `runar-tree.js`
// si tytéž názvy deklarují samy (`let` / `var`), a druhá deklarace téhož jména je
// SyntaxError — celý sandbox by spadl. Načítá se tedy jen to, co produkce načítá,
// ve stejném pořadí.
let code = '';
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js',
                 'runar-character.js', 'runar-utils.js', 'runar-svgs.js', 'runar-tree.js',
                 'runar-app.js']) {
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

// ── JMÉNO: musí dojít do čtení životní runy, a rozbor jména tam být NESMÍ ───
// 2026-09-11, dvě vady v řadě, obě našel owner na hotovém čtení:
//  1. `readerUser.name` plní jen `startReading()`. Kdo přišel rovnou na záložku životní runy,
//     měl ho prázdné → do promptu šel fallback „you" a čtení ho oslovovalo „ty" místo jménem.
//     §12 přitom říká, že jediný zdroj jména je `displayName()`.
//  2. Prémiový odstavec žádal „meaning in Old Norse or Norse mythology" pro KAŽDÉ jméno.
//     Spolu s (1) dostal model instrukci „napiš o jménu YOU" — sáhl po jediném severském
//     jménu v kontextu, po RÚNAROVI z hlavičky, a vyrobil odstavec o jméně, které uživatel
//     nemá. V DB žádný Rúnar není. U nesevrského jména (Kuky, Zdeněk) by si musel vymyslet
//     severský význam tak jako tak — prompt vynucoval to, co §23 zakazuje.
// Rozbor jména se má vrátit jako SAMOSTATNÁ volba, ne jako součást čtení (rozhodnutí ownera).
{
  const stavJm = (jmeno, L) => {
    vm.runInContext('userName=' + JSON.stringify(jmeno || '')
      + '; currentUser={id:"u1"}; readerUser={}; lang=' + JSON.stringify(L) + ';', S);
    return vm.runInContext('_lifeRuneName()', S);
  };
  rekni(stavJm('Kuky', 'en') === 'Kuky', 'jméno z profilu se pro životní runu použije');
  rekni(stavJm('', 'en') === 'you', 'bez jména padá na „you" (a ne na prázdno)');
  rekni(stavJm('', 'is') === 'þú', 'bez jména padá islandsky na „þú"');

  const R25 = vm.runInContext('RUNES', S);
  const gebo = R25.find((r) => r.n === 'Gebo');
  for (const L of ['en', 'is']) {
    for (const prem of [true, false]) {
      const p = vm.runInContext('buildLifeRunePrompt', S)('Zdenek', gebo, 24, 12, 1979, L, prem, null);
      rekni(p.indexOf('Zdenek') !== -1,
            L + (prem ? '  prémiové' : '  základní') + ' čtení životní runy nese JMÉNO');
      // Nesmí se vrátit v žádném jazyce ani tieru — jinak by vada ožila jen v jedné větvi.
      rekni(!/about the name|meaning in Old Norse|um nafnið|á norrænu/i.test(p),
            L + (prem ? '  prémiové' : '  základní') + ' čtení NEŽÁDÁ severský rozbor jména');
    }
  }
}

// ── ROZBOR JMÉNA: samostatná volba, a smí poctivě skončit „nemá severské kořeny" ──
// KUKY 2026-09-11: „rozbor jména můžeme udělat zvlášť… pokud zadám jméno, může se mi to
// nabídnout jako další možnost." + „‚tohle jméno v severské tradici kořeny nemá‘ tohle tam
// má být taky. jméno není severské, nejde udělat rozbor."
// ⚠️ Ta druhá věta je jádro: dokud instrukce žádala severský význam KAŽDÉHO jména, model
// neměl na výběr a musel si ho vymyslet (§23). Test proto hlídá, že ta úniková cesta v promptu
// JE — v obou jazycích. Bez ní se vada vrátí i v samostatné podobě.
{
  const stavNL = (jmeno, prihlasen, text, L) => {
    Object.keys(prvky).forEach((k) => { prvky[k].style = {}; prvky[k].textContent = ''; prvky[k].innerHTML = ''; });
    vm.runInContext('userName=' + JSON.stringify(jmeno || '')
      + '; currentUser=' + (prihlasen ? '{id:"u1",email:"a@b.cz"}' : 'null')
      + '; _nameLoreText=' + (text ? JSON.stringify(text) : 'null')
      + '; readerUser={}; lang=' + JSON.stringify(L) + ';', S);
    vm.runInContext('_renderNameLore()', S);
    const g = (id) => (prvky[id] || mk(id));
    return { box: g('tree-name-lore').style.display, cta: g('name-lore-cta').style.display,
             txt: g('name-lore-text').style.display, obsah: String(g('name-lore-text').innerHTML) };
  };
  for (const L of ['en', 'is']) {
    rekni(stavNL('Kuky', false, null, L).box === 'none', L + '  nepřihlášený → rozbor jména se nenabízí');
    rekni(stavNL('', true, null, L).box === 'none', L + '  přihlášený BEZ jména → nenabízí se (není co rozebírat)');
    const a = stavNL('Kuky', true, null, L);
    rekni(a.box === 'block' && a.cta === '' && a.txt === 'none',
          L + '  přihlášený se jménem → nabídne se tlačítko');
    const b = stavNL('Kuky', true, 'Zdenek nemá v severské tradici kořeny.', L);
    rekni(b.box === 'block' && b.cta === 'none' && b.txt === 'block' && b.obsah.indexOf('kořeny') !== -1,
          L + '  hotový rozbor → ukáže se text a tlačítko zmizí');

    // Prompt: úniková cesta MUSÍ být. Tohle je ta věta, kvůli které se to celé přepisovalo.
    const p = vm.runInContext('buildNameLorePrompt', S)('Zdenek', L, null);
    rekni(p.indexOf('Zdenek') !== -1, L + '  prompt rozboru nese jméno');
    rekni(L === 'en' ? /say so plainly and stop there/.test(p) : /seg\u00f0u \u00fea\u00f0 hreint \u00fat/.test(p),
          L + '  prompt DOVOLUJE odpovědět, že jméno severské kořeny nemá');
    rekni(L === 'en' ? /never build a meaning the name does not have/.test(p)
                     : /b\u00fa\u00f0u aldrei til/.test(p),
          L + '  prompt ZAKAZUJE vymyslet význam, který jméno nemá');
  }
}

// ── STRUKTURA: každý stav životní runy musí LEŽET v panelu životní runy ─────
// ⚠️ Tohle je díra, kterou měl test do 2026-09-11 a kvůli které jsem se spolehl na to,
// že je přesun sekce úplný. Testoval LOGIKU nad vymyšleným DOM, kde panely vůbec
// neexistují — kdyby některý stav zůstal v panelu STROMU, uživatel by na záložce
// životní runy viděl PRÁZDNO a kontrola by byla zelená. Owner to našel dřív než ona.
//
// Čte se skutečné HTML, ne DOM: jde o to, kam prvek patří ve zdroji.
const HTML = fs.readFileSync(DIR + 'runar-reader.html', 'utf8').split('\n');
function rozsah(idPanelu, konecZnacka) {
  const od = HTML.findIndex(l => l.indexOf('id="' + idPanelu + '"') !== -1);
  const doo = HTML.findIndex((l, i) => i > od && l.indexOf(konecZnacka) !== -1);
  return (od === -1 || doo === -1) ? null : [od, doo];
}
const rLife = rozsah('apane-liferune', '/apane-liferune');
const rTree = rozsah('apane-tree', '/apane-tree');
rekni(!!rLife, 'panel `apane-liferune` v HTML existuje');
rekni(!!rTree, 'panel `apane-tree` v HTML existuje');

if (rLife && rTree) {
  // Stavy, kterými `updateTreeTab()` přepíná životní runu. Kdyby některý skončil jinde,
  // záložka zůstane prázdná právě v tom stavu — a jen v něm, takže si toho nikdo nevšimne.
  const STAVY = ['tree-no-dob', 'tree-rs-teaser', 'tree-reveal-cta', 'tree-loading',
                 'tree-reading-exists', 'tree-reading-text', 'tree-rune-name-exists',
                 'tree-dob-btn', 'tree-reveal-btn', 'tree-rs-reveal-btn',
                 // rozbor jména (2026-09-11) — při psaní jsem ho omylem vložil ZA uzavírací
                 // značku panelu, tedy mimo něj. Proto je tady.
                 'tree-name-lore', 'name-lore-btn', 'name-lore-text'];
  for (const id of STAVY) {
    const r = HTML.findIndex(l => l.indexOf('id="' + id + '"') !== -1);
    const vLife = r > rLife[0] && r < rLife[1];
    const vTree = r > rTree[0] && r < rTree[1];
    rekni(r !== -1 && vLife && !vTree,
          '`' + id + '` leží v panelu životní runy'
          + (r === -1 ? ' — V HTML VŮBEC NENÍ' : (vTree ? ' — ZŮSTAL V PANELU STROMU' : '')));
  }
  // A obráceně: co patří stromu, nesmí se do životní runy zatoulat.
  for (const id of ['tree-living', 'tree-name-section', 'tree-founding-cta', 'tree-tester-bar']) {
    const r = HTML.findIndex(l => l.indexOf('id="' + id + '"') !== -1);
    rekni(r !== -1 && r > rTree[0] && r < rTree[1], '`' + id + '` zůstal v panelu stromu');
  }
}

if (fail) { console.log('\nFAIL — ' + fail + ' tvrzení o záložce životní runy neplatí.'); process.exit(1); }
console.log('\nOK — životní runa funguje i bez účtu (návštěvník dostane runu, čtení zůstává za přihlášením).');
