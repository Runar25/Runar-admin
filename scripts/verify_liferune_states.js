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
const retez = new Proxy(function () {}, {
  get: (_c, p) => (p === 'then' || p === 'error' ? undefined : retez), apply: () => retez });
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
                 'runar-names.js', 'runar-character.js', 'runar-utils.js', 'runar-svgs.js', 'runar-tree.js',
                 'runar-app.js']) {
  code += '\n/* ' + f + ' */\n' + fs.readFileSync(DIR + f, 'utf8') + '\n;\n';
}
// Živý strom a jméno stromu sem netáhneme — testuje se stav ZÁLOŽKY, ne kresba.
code += '\nfunction renderLivingTree(){}; function _renderTreeNameState(){}; function isAdmin(){return false;}\n';
// Model se v kontrole nevola; misto nej pocitadlo. Deklarace az ZA produkcnim kodem,
// takze prebije puvodni `async function callProxy` (vsechno je jeden skript).
code += '\nvar _volaniModelu = 0;\n'
      + 'async function callProxy(){ _volaniModelu++; return { text: \"TEXT OD MODELU\" }; }\n';
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

    // Prompt: úniková cesta MUSÍ být i u jména, které náš seznam za severské POVAŽUJE —
    // seznam je silnější obrana, ne neomylná. Kdyby byl u konkrétního jména vedle,
    // Rúnar pořád smí říct, že kořeny nevidí.
    const p = vm.runInContext('buildNameLorePrompt', S)(
      'Sigrún', vm.runInContext('_nameLookup(\"Sigrún\")', S), L, null);
    rekni(p.indexOf('Sigrún') !== -1, L + '  prompt rozboru nese jméno');
    rekni(L === 'en' ? /say so plainly and stop there/.test(p) : /seg\u00f0u \u00fea\u00f0 hreint \u00fat/.test(p),
          L + '  prompt DOVOLUJE odpovědět, že jméno severské kořeny nemá');
    rekni(L === 'en' ? /never build a meaning the name does not have/.test(p)
                     : /b\u00fa\u00f0u aldrei til/.test(p),
          L + '  prompt ZAKAZUJE vymyslet význam, který jméno nemá');
  }
}

// ── SEZNAM JMEN ROZHODUJE, ne model ─────────────────────────────────────────
// KUKY 2026-09-11. Dokud o „má to severské kořeny?" rozhodoval model, neměl u nesevrského
// jména na výběr a původ si vymyslel (§23). Seznam mu to rozhodnutí bere: jméno v něm je,
// nebo není. U `norse:false` i u nenalezeného se model NEVOLÁ VŮBEC.
// Znění: „Rúnar sees no Norse root" — mluví o jeho VIDĚNÍ, ne o faktu. U jména, které prostě
// nemáme, by „kořeny nemá" byla lež; „nevidím je" je pravda.
{
  const L = vm.runInContext('NORSE_NAMES', S);
  rekni(Array.isArray(L) && L.length > 50, 'seznam jmen je načtený (' + (L ? L.length : 0) + ' jmen)');
  const najdi = (j) => vm.runInContext('_nameLookup(' + JSON.stringify(j) + ')', S);

  rekni(najdi('Sigrún') && najdi('Sigrún').norse === true, 'kanonické severské jméno se najde');
  rekni(najdi('sigrún') && najdi('sigrún').norse === true, '…bez ohledu na velikost písmen');
  const p = najdi('Gunna');
  rekni(!!p && p.name === 'Guðrún', 'přezdívka „Gunna" vede na Guðrún');
  rekni(najdi('Magnús') && najdi('Magnús').norse === false,
        '„Magnús" je NEseverský — časté na Islandu ≠ severské kořeny');
  rekni(najdi('Kuky') === null, 'neznámé jméno se nenajde (a nic se nedomýšlí)');

  // ⚠️ Diakritika se NEODSTRANUJE: „Thora" není „Þóra". Slučovat je by bylo to samé domýšlení,
  // kvůli kterému seznam vznikl.
  rekni(najdi('Thora') === null, 'jméno bez háčků se NESLUČUJE s diakritickou podobou');

  // Žádná kolize přezdívky nesmí přecházet přes hranici severské/neseverské — tam by
  // lookup vracel jednou ano a jednou ne podle pořadí v poli.
  const mapa = {};
  L.forEach((z) => (z.nick || []).forEach((n) => { (mapa[n.toLowerCase()] = mapa[n.toLowerCase()] || []).push(z); }));
  const sporne = Object.keys(mapa).filter((n) => new Set(mapa[n].map((z) => z.norse)).size > 1);
  rekni(!sporne.length, 'žádná přezdívka nevede zároveň na severské i neseverské jméno'
        + (sporne.length ? ' — SPORNÉ: ' + sporne.join(', ') : ''));

  // Prompt se staví jen pro severské — a dostane PODKLAD, ne domysl.
  const bp = vm.runInContext('buildNameLorePrompt', S)('Sigrún', najdi('Sigrún'), 'is', null);
  rekni(/HEIMILD .R SKR.NNI/.test(bp), 'prompt pro severské jméno nese doklad ze seznamu');
  rekni(bp.indexOf('sigur + rún') !== -1, '…včetně významu z našich dat');
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

// ── DRÁT, NE BUILDER: u nesevrského jména se model NESMÍ zavolat ─────────────
// §19.3 — kontrola musí běžet na TÉ ploše, kde bug žije. Že prompt UMÍ říct „kořeny nevidím",
// neříká nic o tom, jestli se k té větvi vůbec dojde; přesně tímhle rozdílem mi minule prošla
// mutace. Tady jede produkční `generateNameLore()` a počítá se VOLÁNÍ MODELU.
// Proč na tom záleží i v penězích: `name_lore` je u proxy zdarma a jištěné jen tím, že se
// volá jednou. Volání, které nemělo vzniknout, je zaplacené vymýšlení.
async function drat() {
  const zkus = async (jmeno) => {
    vm.runInContext('_volaniModelu = 0; _nameLoreText = null; lang = "en";'
      + ' currentUser = { id: "u1", email: "a@b.cz" };'
      + ' userName = ' + JSON.stringify(jmeno) + '; readerUser = {};', S);
    await vm.runInContext('generateNameLore()', S);
    return { volani: vm.runInContext('_volaniModelu', S),
             text: String(vm.runInContext('_nameLoreText', S) || '') };
  };
  const T = vm.runInContext('UI_TEXT', S).en;

  const cizi = await zkus('Magnús');
  rekni(cizi.volani === 0, '„Magnús" (v seznamu, NEseverské) → model se nevolá vůbec');
  rekni(cizi.text === T.name_no_norse_from.replace('{origin}', 'Latin'),
        '…a jde hotová věta i s původem ze seznamu');

  const nezname = await zkus('Kuky');
  rekni(nezname.volani === 0, '„Kuky" (není v seznamu) → model se nevolá vůbec');
  rekni(nezname.text === T.name_no_norse, '…a jde věta bez původu (netvrdíme, co nevíme)');

  const severske = await zkus('Sigrún');
  rekni(severske.volani === 1, '„Sigrún" (severské) → model text NAPÍŠE');
  rekni(severske.text === 'TEXT OD MODELU', '…a jeho text se uloží');
}

drat().then(() => {
  if (fail) { console.log('\nFAIL — ' + fail + ' tvrzení o záložce životní runy neplatí.'); process.exit(1); }
  console.log('\nOK — životní runa funguje i bez účtu (návštěvník dostane runu, čtení zůstává za přihlášením).');
}).catch((e) => { console.log('FAIL  drát rozboru jména spadl: ' + e.message); process.exit(1); });
