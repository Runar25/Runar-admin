// runar-client-errors.js — chyby appky u uživatelů → edge funkce client-error (2026-10-22, owner „8. 1, 2 a 3 … 9. ano — najdi nejlepší řešení!“,
// DECISIONS 2026-10-22 (11)). Do té doby jsme o chybě JS v prohlížeči člověka nevěděli, dokud nenapsal hlášení. Vlastní funkce, ne Sentry
// (další zpracovatel v USA). Načítá se HNED po runar-config.js, aby zachytil i chybu při startu ostatních skriptů.
// Posílá jen: text chyby (≤ 200 znaků, bez e-mailů, adres a dlouhých čísel), NÁŠ soubor a řádek, verzi (RUNAR_VERZE), obrazovku
// (activeAppTab), jazyk a přihlášený ano/ne. Žádné id, e-mail ani text čtení. Šum pryč: zdroj mimo náš původ (rozšíření prohlížeče),
// „Script error.“ bez detailu, ResizeObserver loop. Táž chyba jednou, za relaci nejvýš 5. sendBeacon s text/plain = bez CORS preflight
// a odejde i při zavírání stránky. Zásady soukromí: řádek „Error messages from the app“ (runar-privacy.html).
(function () {
  var URL_CHYB = (typeof SB_URL === 'string' ? SB_URL : '') + '/functions/v1/client-error';
  var MAX_ZA_RELACI = 5, poslane = {}, pocet = 0;
  try { pocet = +(sessionStorage.getItem('runar_chyb') || 0); } catch (e) {}
  function cisti(t, max) {
    return String(t == null ? '' : t)
      .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, '<email>').replace(/https?:\/\/\S+/g, '<url>').replace(/\d{6,}/g, '<n>')
      .replace(/\s+/g, ' ').trim().slice(0, max);
  }
  // náš soubor z adresy (jen stejný původ a .js) — „runar-app.js“ nebo „tree-lab-branch-composer/runar-branch.js“; cizí = null
  function nasSoubor(adresa) {
    try {
      var u = new URL(adresa, location.href);
      if (u.origin !== location.origin) return null;
      var m = u.pathname.match(/\/v2\/((?:[\w-]+\/)?[\w-]+\.js)$/);
      return m ? m[1] : null;
    } catch (e) { return null; }
  }
  function posli(msg, soubor, radek) {
    if (!msg || pocet >= MAX_ZA_RELACI || !URL_CHYB || !navigator.sendBeacon) return;
    if (/^Script error\.?$/i.test(msg) || /ResizeObserver loop/i.test(msg)) return;
    var klic = msg + '|' + soubor + '|' + radek;
    if (poslane[klic]) return;
    poslane[klic] = 1; pocet++;
    try { sessionStorage.setItem('runar_chyb', String(pocet)); } catch (e) {}
    var telo = {
      msg: cisti(msg, 200), src: soubor || '', line: radek || null,
      ver: (typeof RUNAR_VERZE === 'string') ? RUNAR_VERZE : '',
      tab: (typeof activeAppTab === 'string') ? activeAppTab : '',
      lang: (typeof lang === 'string') ? lang : '',
      prihlasen: !!(typeof currentUser !== 'undefined' && currentUser),
    };
    try { navigator.sendBeacon(URL_CHYB, new Blob([JSON.stringify(telo)], { type: 'text/plain' })); } catch (e) {}
  }
  window.addEventListener('error', function (e) {
    if (!e || !e.message) return;
    var s = e.filename ? nasSoubor(e.filename) : null;
    if (e.filename && !s) return;   // skript z cizího původu (rozšíření, CDN) — není náš
    posli(e.message, s, e.lineno);
  });
  window.addEventListener('unhandledrejection', function (e) {
    var r = e && e.reason, msg = r && r.message ? r.message : String(r == null ? '' : r);
    var stack = (r && r.stack) || '', m = stack.match(/\/v2\/((?:[\w-]+\/)?[\w-]+\.js):(\d+)/);
    posli(msg, m ? m[1] : '', m ? +m[2] : null);
  });
})();
