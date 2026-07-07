// i18n-diff — runtime detektor „uvízlé angličtiny" v IS módu.
// Chytá dvě třídy bugů: (1) natvrdo string bez wiringu, (2) string, co se
// nastaví jednou (login / tab switch / render) a NEpřekreslí při přepnutí jazyka.
//
// PRINCIP: text, který je BYTE-IDENTICKÝ v EN i IS = podezřelý (nepřeložil se).
// Filtry: pryč rune názvy, §6 anglické brand termíny, symboly/čísla, a texty
// obsahující islandské znaky (þðæö…) = už jsou IS.
//
// POUŽITÍ:
//   1) Otevři runar-reader.html (ideálně přihlášený, ať se projdou i tier stavy).
//   2) Vlož celý tenhle soubor do dev-console a stiskni Enter.
//   3) Projdi `items` — každý je kandidát na stuck-EN. Rune názvy/gender = false pos.
// Spouštěj před releasem a po každé změně UI. Levné (1 průchod DOM, žádné čtení kódu).

(function () {
  var ALLOW = /^[\s\d:·.,!?…—–+×%()\/\[\]①-⑨✦◈◇⚗ᚠᚱ→←-]+$/;                 // pure symboly/čísla
  var KEEP  = /R[ÚU]NAR|GATHERING|YGGDRASIL|AGNDOFA|GOOGLE|Ratatoskr|Huginn|Muninn|[ÓO][ðd]in/i;
  var RUNES = /^(Fehu|Uruz|Thurisaz|Ansuz|Raidho|Kenaz|Gebo|Wunjo|Hagalaz|Nauthiz|Isa|Jera|Eihwaz|Perth|Algiz|Sowilo|Tiwaz|Berkana|Ehwaz|Mannaz|Laguz|Ingwaz|Othila|Dagaz|Blank|Hann|H[úu]n|H[áa]n)$/;
  var ISCHAR = /[þðæöáíóúýéÞÐÆÖÁÍÓÚÝÉ]/;                                       // má IS znak => už IS

  function leaves() {
    return [].filter.call(document.querySelectorAll('body *'), function (el) {
      if (el.children.length) return false;
      var t = (el.textContent || '').trim();
      return t.length > 1 && !ALLOW.test(t);
    });
  }

  var seen = {}, out = [];
  var tabs = (typeof showAppTab === 'function') ? ['reading', 'journal', 'collection', 'tree'] : [null];
  tabs.forEach(function (tab) {
    try { if (tab) showAppTab(tab); } catch (e) {}
    setLang('en');                                            // EN baseline PRVNÍ (jinak vše false-pos)
    var els = leaves(), en = els.map(function (el) { return (el.textContent || '').trim(); });
    setLang('is');
    els.forEach(function (el, i) {
      var v = (el.textContent || '').trim();
      if (v === en[i] && /[a-z]{2}/.test(en[i]) && !ISCHAR.test(en[i]) && !KEEP.test(en[i]) && !RUNES.test(en[i])) {
        if (!seen[en[i]]) { seen[en[i]] = 1; out.push({ tab: tab, id: el.id || el.tagName, en: en[i].slice(0, 60) }); }
      }
    });
  });
  setLang('en');
  console.table(out);
  console.log('STUCK-ENGLISH kandidátů: ' + out.length + ' (rune názvy/gender už vyfiltrované)');
  return out;
})();
