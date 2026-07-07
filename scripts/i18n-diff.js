// i18n-diff — runtime detektor „uvízlé angličtiny" v IS módu.
// Chytá dvě třídy bugů: (1) natvrdo string bez wiringu, (2) string, co se
// nastaví jednou (login / tab switch / render) a NEpřekreslí při přepnutí jazyka.
//
// PRINCIP (set-based, spolehlivé i pro innerHTML-přerenderované prvky):
// posbírá MNOŽINU textů v EN a v IS napříč taby; text přítomný v OBOU = nepřeložil
// se = podezřelý. (NE reference na elementy — ty jdou stale při innerHTML rebuild.)
// Filtry pryč: rune názvy, gender slova, §6 anglické brand termíny, symboly/čísla,
// a texty s islandskými znaky (þðæö…) = už jsou IS.
//
// POUŽITÍ:
//   1) Otevři runar-reader.html (ideálně přihlášený, ať se projdou i tier stavy).
//   2) Vlož celý soubor do dev-console, Enter. Vrátí { count, items }.
//   3) Projdi items — kandidáti na stuck-EN.
// CAVEAT: transientní toasty (topbar-greeting apod.), co po chvíli vyblednou přes
//   opacity, mohou dát false-positive (skryté, ale v layoutu). Ověř vizuálně.
// Spouštěj před releasem a po každé změně UI. Levné (1 průchod DOM, žádné čtení kódu).

(function () {
  var ALLOW  = /^[\s\d:·.,!?…—–+×%()\/\[\]①-⑨✦◈◇⚗ᚠᚱ→←-]+$/;                 // pure symboly/čísla
  var KEEP   = /R[ÚU]NAR|GATHERING|YGGDRASIL|AGNDOFA|GOOGLE|Ratatoskr|Huginn|Muninn|[ÓO][ðd]in/i;
  var RUNES  = /^(Fehu|Uruz|Thurisaz|Ansuz|Raidho|Kenaz|Gebo|Wunjo|Hagalaz|Nauthiz|Isa|Jera|Eihwaz|Perth|Algiz|Sowilo|Tiwaz|Berkana|Ehwaz|Mannaz|Laguz|Ingwaz|Othila|Dagaz|Blank|Hann|H[úu]n|H[áa]n)$/;
  var ISCHAR = /[þðæöáíóúýéÞÐÆÖÁÍÓÚÝÉ]/;                                       // má IS znak => už IS

  function texts() {
    return [].filter.call(document.querySelectorAll('body *'), function (el) { return !el.children.length; })
      .map(function (el) { return (el.textContent || '').trim(); })
      .filter(function (t) { return t.length > 1 && !ALLOW.test(t); });
  }

  var enSet = {}, isSet = {};
  var tabs = (typeof showAppTab === 'function') ? ['reading', 'journal', 'collection', 'tree'] : [null];
  tabs.forEach(function (tab) {
    try { if (tab) showAppTab(tab); } catch (e) {}
    setLang('en'); texts().forEach(function (t) { enSet[t] = 1; });   // EN množina
    setLang('is'); texts().forEach(function (t) { isSet[t] = 1; });   // IS množina
  });
  setLang('en');

  var stuck = Object.keys(enSet).filter(function (t) {
    return isSet[t] && /[a-z]{2}/.test(t) && !ISCHAR.test(t) && !KEEP.test(t) && !RUNES.test(t);
  });
  console.table(stuck.map(function (t) { return { stuck_english: t }; }));
  console.log('STUCK-ENGLISH kandidátů: ' + stuck.length);
  return { count: stuck.length, items: stuck };
})();
