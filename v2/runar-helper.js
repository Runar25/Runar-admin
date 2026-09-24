// runar-helper.js -- napoveda "?" na obrazovce cteni.
// Report #2 (KUKY 2026-09-21): veci, ktere nejdou na prvni pohled videt -- glyf-tap
// (runar-rune-popup.js) a Ask hinty. Vzor = runar-reporter.js (sobestacna IIFE, jen reader).
// Report #17 (KUKY 2026-09-22, po testu): bublina NEMA byt jedno okno u tlacitka, ale ma
// ukazovat PRIMO na prvek, o kterem mluvi -- jinak uzivatel nevi, ceho se tyka.
// Texty VYHRADNE pres t() z UI_TEXT (§10); obsah se stavi pri kazdem otevreni, takze
// prepnuti jazyka nepotrebuje hook v updateUIText (§14).
(function () {
  var btn = null, vrstva = null, otevreno = false, pary = [];

  // Cile: [selektor, klic hlavni vety, klic druhe vety nebo ""]. Poradi = shora dolu.
  var CILE = [
    [".rlbl-glyph", "helper_glyph", ""],
    ["#ask-lbl", "helper_ask", "helper_ask2"]
  ];

  function injectStyle() {
    var s = document.createElement("style");
    s.textContent =
      "#hb-btn{position:fixed;left:14px;bottom:14px;width:44px;height:44px;border-radius:50%;" +
      "background:rgba(14,22,34,.82);color:var(--gold,#FFBF00);border:1px solid var(--gold,#FFBF00);" +
      "font-family:Cinzel,serif;font-size:19px;line-height:44px;text-align:center;cursor:pointer;" +
      "z-index:99998;opacity:.55;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);transition:opacity .2s}" +
      "@media (hover:hover){#hb-btn:hover{opacity:1}}#hb-btn:focus-visible{opacity:1}" +
      "#hb-layer{position:fixed;inset:0;z-index:99999;display:none;pointer-events:none}" +
      "#hb-layer.on{display:block}" +
      ".hb-tip{position:fixed;max-width:290px;background:#0f1827;border:1px solid var(--gold,#FFBF00);" +
      "border-radius:12px;padding:11px 13px;color:#e8ecf3;font-size:13px;line-height:1.5;" +
      "box-shadow:0 8px 30px rgba(0,0,0,.45);pointer-events:auto}" +
      ".hb-tip b{display:block;color:var(--gold,#FFBF00);font-weight:600;margin-bottom:3px}" +
      ".hb-tip .hb-sub{color:#9fb0c8;font-size:12px}" +
      ".hb-tip::after{content:'';position:absolute;left:var(--hb-arrow,24px);border:7px solid transparent}" +
      ".hb-tip.hb-above::after{top:100%;border-top-color:var(--gold,#FFBF00)}" +
      ".hb-tip.hb-below::after{bottom:100%;border-bottom-color:var(--gold,#FFBF00)}" +
      ".hb-mirror{font-style:italic;color:#cdd7e6}";
    document.head.appendChild(s);
  }

  function viditelny(el) {
    if (!el) return false;
    var r = el.getBoundingClientRect();
    if (!r.width || !r.height) return false;                  // display:none / prazdny prvek
    return r.bottom > 0 && r.top < (window.innerHeight || 0); // aspon castecne na obrazovce
  }

  function bublina(hlavni, druha, mirror) {
    var d = document.createElement("div");
    d.className = "hb-tip";
    var b = document.createElement("b");
    b.textContent = hlavni;
    d.appendChild(b);
    if (druha) {
      var p = document.createElement("div");
      p.className = mirror ? "hb-mirror" : "hb-sub";
      p.textContent = druha;
      d.appendChild(p);
    }
    d.addEventListener("click", function (ev) { ev.stopPropagation(); });
    return d;
  }

  // Polozi bublinu NAD cil; kdyz se nahoru nevejde, prevrati ji pod nej.
  function umisti(tip, cil) {
    var r = cil.getBoundingClientRect();
    var t2 = tip.getBoundingClientRect();
    var mezera = 10;
    var left = Math.min(Math.max(8, r.left + r.width / 2 - t2.width / 2),
                        (window.innerWidth || 0) - t2.width - 8);
    var nad = r.top - t2.height - mezera;
    var pod = nad < 8;
    tip.style.left = left + "px";
    tip.style.top = (pod ? (r.bottom + mezera) : nad) + "px";
    tip.classList.toggle("hb-above", !pod);
    tip.classList.toggle("hb-below", pod);
    // sipka miri na STRED cile, i kdyz bublinu odstrcil okraj okna
    var sip = Math.min(Math.max(12, r.left + r.width / 2 - left - 7), Math.max(12, t2.width - 26));
    tip.style.setProperty("--hb-arrow", sip + "px");
  }

  function postav() {
    vrstva.innerHTML = "";
    pary = [];
    CILE.forEach(function (c) {
      var cil = document.querySelector(c[0]);
      if (!viditelny(cil)) return;
      var tip = bublina(t(c[1]), c[2] ? t(c[2]) : "", false);
      vrstva.appendChild(tip);
      pary.push({ tip: tip, cil: cil });
    });
    // Zadny cil na obrazovce (typicky pred ctenim) -> bublina u tlacitka s heslem zrcadla,
    // at "?" neotevre prazdno.
    if (!pary.length) {
      var t3 = bublina(t("helper_title"), t("motto_mirror"), true);
      vrstva.appendChild(t3);
      pary.push({ tip: t3, cil: btn });
    }
    prepocti();
  }

  function prepocti() { pary.forEach(function (p) { umisti(p.tip, p.cil); }); }

  function zavri() {
    otevreno = false;
    vrstva.classList.remove("on");
    vrstva.innerHTML = "";
    pary = [];
    btn.setAttribute("aria-expanded", "false");
  }

  function prepni(ev) {
    if (ev) ev.stopPropagation();
    if (otevreno) { zavri(); return; }
    otevreno = true;
    btn.title = t("helper_btn");
    btn.setAttribute("aria-label", t("helper_btn"));
    btn.setAttribute("aria-expanded", "true");
    vrstva.classList.add("on");
    postav();
  }

  function init() {
    injectStyle();
    btn = document.createElement("button");
    btn.id = "hb-btn"; btn.type = "button"; btn.textContent = "?";
    btn.title = t("helper_btn");
    btn.setAttribute("aria-label", t("helper_btn"));
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", prepni);
    document.body.appendChild(btn);
    vrstva = document.createElement("div");
    vrstva.id = "hb-layer";
    document.body.appendChild(vrstva);
    // Klik kamkoli jinam zavira (KUKY #17). Klik v bubline se nepocita -- stopPropagation vyse.
    document.addEventListener("click", function () { if (otevreno) zavri(); });
    // Bubliny visi na souradnicich cile -> pri scrollu i zmene okna se prepocitavaji.
    window.addEventListener("scroll", function () { if (otevreno) prepocti(); }, true);
    window.addEventListener("resize", function () { if (otevreno) prepocti(); });
    // Testovaci prusvit: ciste funkce bez otevirani UI (vzor _runePopKw v rune-popup).
    window._helperTest = { cile: CILE, postav: postav, zavri: zavri, viditelny: viditelny };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
