// runar-helper.js -- napoveda "?" na obrazovce cteni.
// Report #2 (KUKY 2026-09-21): veci, ktere nejdou na prvni pohled videt -- glyf-tap (runar-rune-popup.js), Ask a navod.
// 2026-10-19 (owner, DECISIONS 2026-10-19 (7)): zluta bublina pryc — „vůbec se mi nelíbí … chtěl bych vidět rozzáření jako svíčka …
// nemělo by posouvat text“. Klepnuti na „?“ ted ROZSVITI misto, na ktere napoveda ukazuje (svicka C3: tri nadechy za 4,5 s, pak doutna,
// dokud na misto clovek neklepne). Jeden zpusob pro vsechna mista helperu — owner: „přece to neděláme pro jednu věc“.
// Vety napovedy zustavaji jako popisek pri najeti mysi a pro ctecku (title / aria-description), texty jen pres t() z UI_TEXT (§10).
// Svicka je tez pro okno „Where to start“ (closeWhereToStart v runar-app.js) — proto window.rozsvit, jedno misto (§18).
(function () {
  var btn = null;

  // Cile: [selektor, klic hlavni vety, klic druhe vety nebo ""]. Poradi = shora dolu.
  var CILE = [
    // 2026-09-25 (KUKY: „nápověda by měla ukázat na HOW A READING WORKS“) — navod nad formularem.
    ["#read-guide-lbl", "helper_guide", ""],
    [".rlbl-glyph", "helper_glyph", ""],
    ["#ask-lbl", "helper_ask", "helper_ask2"]
  ];

  function viditelny(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    if (!r.width || !r.height) return false;                  // display:none / prazdny prvek
    return r.bottom > 0 && r.top < (window.innerHeight || 0); // aspon castecne na obrazovce
  }
  function existuje(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    return !!(r.width && r.height);
  }

  // Svicka: tri nadechy, pak doutna. Halo je vlastni prvek (ne ::after — u „How a reading works“ ho nese „+“), absolutne za textem,
  // takze nic neposune. Zhasne klepnutim na misto. Znovu zapalena svicka zacina od zacatku (reflow mezi odebranim a pridanim tridy).
  // Halo kopíruje OBSAH prvku (text nebo kresbu), ne jeho krabici: „How a reading works“ je tlačítko přes celou šířku, runa je malý kámen.
  // Měří se rozsah obsahu (Range) bez halo, ellipsa o kus větší, vystředěná na obsah (2026-10-20, owner — dřív pevných 300 × 60 px).
  function obsah(el) {
    var r = null;
    try { var g = document.createRange(); g.selectNodeContents(el); r = g.getBoundingClientRect(); } catch (e) {}
    return (r && r.width && r.height) ? r : el.getBoundingClientRect();
  }
  function rozsvit(el) {
    if (!el) return;
    el.classList.remove("svice");
    void el.offsetWidth;
    var stare = el.querySelector(":scope > .svice-halo");
    if (stare) stare.remove();
    var o = obsah(el), b = el.getBoundingClientRect();
    var h = document.createElement("span");
    h.className = "svice-halo";
    h.setAttribute("aria-hidden", "true");
    h.style.width = Math.round(Math.min(o.width * 1.45 + 8, (window.innerWidth || 400) * 0.9)) + "px";
    h.style.height = Math.round(o.height * 1.6 + 10) + "px";
    h.style.left = Math.round(o.left - b.left + o.width / 2) + "px";
    h.style.top = Math.round(o.top - b.top + o.height / 2) + "px";
    el.appendChild(h);
    el.classList.add("svice");
    if (!el._sviceZhasni) {
      el._sviceZhasni = function () { zhasni(el); };
      el.addEventListener("click", el._sviceZhasni);
    }
  }
  function zhasni(el) {
    if (!el) return;
    el.classList.remove("svice");
    var h = el.querySelector(":scope > .svice-halo");
    if (h) h.remove();
    if (el._sviceZhasni) { el.removeEventListener("click", el._sviceZhasni); el._sviceZhasni = null; }
  }
  window.rozsvit = rozsvit;
  window.zhasni = zhasni;

  // Vety napovedy na cil jako popisek (najeti mysi, ctecka) — bez bubliny.
  function popis(el, c) {
    var txt = t(c[1]) + (c[2] ? " " + t(c[2]) : "");
    el.title = txt;
    el.setAttribute("aria-description", txt);
  }

  function svitit(ev) {
    if (ev) ev.stopPropagation();
    var na = [];
    CILE.forEach(function (c) {
      document.querySelectorAll(c[0]).forEach(function (el) { if (viditelny(el)) na.push([el, c]); });
    });
    // Nic na obrazovce (typicky nahore u fotky) -> dojet k prvnimu mistu, ktere na strance je, a rozsvitit ho.
    if (!na.length) {
      for (var i = 0; i < CILE.length && !na.length; i++) {
        var el = document.querySelector(CILE[i][0]);
        if (existuje(el)) na.push([el, CILE[i]]);
      }
      if (na.length) {
        var klid = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
        na[0][0].scrollIntoView({ block: "center", behavior: klid ? "auto" : "smooth" });
      }
    }
    na.forEach(function (p) { popis(p[0], p[1]); rozsvit(p[0]); });
    zhasni(btn);
  }

  function init() {
    // 2026-10-21 (owner): „helper není průhledný při a po tom, co se rozzáří … jakmile na něj kliknu, tak už je průhledný“ — pravidlo
    // #hb-btn.svice{opacity:1} pryč, svítí jen prstenec (sviceRing). „Problikne jako čtverec“: backdrop-filter u kulatého prvku
    // Chromium při změně průhlednosti vykreslí krátce v obdélníku → pryč (pozadí .82 je skoro plné, rozmazání nebylo vidět);
    // a bez šedého obdélníku po ťuknutí na dotykovém displeji (tap highlight).
    var s = document.createElement("style");
    s.textContent =
      "#hb-btn{position:fixed;left:14px;bottom:14px;width:44px;height:44px;border-radius:50%;" +
      "background:rgba(14,22,34,.82);color:var(--gold,#FFBF00);border:1px solid var(--gold,#FFBF00);" +
      "font-family:Cinzel,serif;font-size:19px;line-height:44px;text-align:center;cursor:pointer;" +
      "z-index:99998;opacity:.55;-webkit-tap-highlight-color:transparent;transition:opacity .2s}" +
      "@media (hover:hover){#hb-btn:hover{opacity:1}}#hb-btn:focus-visible{opacity:1}";
    document.head.appendChild(s);
    btn = document.createElement("button");
    btn.id = "hb-btn"; btn.type = "button"; btn.textContent = "?";
    btn.title = t("helper_btn");
    btn.setAttribute("aria-label", t("helper_btn"));
    btn.addEventListener("click", svitit);
    document.body.appendChild(btn);
    // Testovaci prusvit: ciste funkce bez UI (vzor _runePopKw v rune-popup).
    window._helperTest = { cile: CILE, svitit: svitit, viditelny: viditelny, rozsvit: rozsvit, zhasni: zhasni };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
