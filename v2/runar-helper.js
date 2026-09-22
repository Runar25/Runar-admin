// runar-helper.js -- napoveda ? na obrazovce cteni (bublina "GOTT AD VITA").
// Report #2 (KUKY 2026-09-21): veci, ktere nejdou na prvni pohled videt -- glyf-tap
// (runar-rune-popup.js) a Ask hinty. Vzor = runar-reporter.js (sobestacna IIFE, jen reader).
// Texty VYHRADNE pres t() z UI_TEXT (§10); obsah se stavi pri kazdem otevreni, takze
// prepnuti jazyka nepotrebuje hook v updateUIText (§14).
(function () {
  var btn = null, pop = null;

  function injectStyle() {
    var s = document.createElement('style');
    s.textContent =
      '#hb-btn{position:fixed;left:14px;bottom:14px;width:44px;height:44px;border-radius:50%;' +
      'background:rgba(14,22,34,.82);color:var(--gold,#FFBF00);border:1px solid var(--gold,#FFBF00);' +
      'font-family:"Cinzel",serif;font-size:19px;line-height:44px;text-align:center;cursor:pointer;' +
      'z-index:99998;opacity:.55;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);transition:opacity .2s}' +
      '#hb-btn:hover,#hb-btn:focus{opacity:1}' +
      '#hb-pop{position:fixed;left:14px;bottom:68px;max-width:340px;background:#0f1827;' +
      'border:1px solid var(--gold,#FFBF00);border-radius:14px;padding:16px 18px;color:#e8ecf3;' +
      'z-index:99999;display:none;box-shadow:0 8px 30px rgba(0,0,0,.45)}' +
      '#hb-pop.on{display:block}' +
      '#hb-pop h3{margin:0 0 8px;color:var(--gold,#FFBF00);font-size:13px;letter-spacing:.14em;font-family:"Cinzel",serif}' +
      '.hb-mirror{font-style:italic;color:#cdd7e6;font-size:13px;line-height:1.55;margin:0 0 12px}' +
      '.hb-row{display:flex;gap:9px;align-items:flex-start;font-size:13px;line-height:1.5;color:#e8ecf3;margin-top:9px}' +
      '.hb-glyph{color:var(--gold,#FFBF00);flex:0 0 auto;font-size:15px;line-height:1.35}';
    document.head.appendChild(s);
  }

  // Obsah se stavi az pri otevreni -- t() tak vzdy cte aktualni jazyk.
  function paint() {
    pop.innerHTML = '';
    var h = document.createElement('h3');
    h.textContent = t('helper_title');
    pop.appendChild(h);
    var m = document.createElement('p');
    m.className = 'hb-mirror'; m.textContent = t('motto_mirror');
    pop.appendChild(m);
    var radky = [['ᚱ', t('helper_glyph')]];
    // Ask radek jen kdyz je Ask na obrazovce (visitor/rune_seeker ho nema -- §13 vsechny cesty).
    var ask = document.getElementById('ask-runar');
    if (ask && ask.style.display !== 'none') radky.push(['ᚠ', t('helper_ask')]);
    radky.forEach(function (r) {
      var d = document.createElement('div');
      d.className = 'hb-row';
      var g = document.createElement('span');
      g.className = 'hb-glyph'; g.textContent = r[0];
      var x = document.createElement('span');
      x.textContent = r[1];
      d.appendChild(g); d.appendChild(x);
      pop.appendChild(d);
    });
  }

  function toggle(ev) {
    if (ev) ev.stopPropagation();
    var otevrit = !pop.classList.contains('on');
    if (otevrit) { paint(); btn.title = t('helper_btn'); btn.setAttribute('aria-label', t('helper_btn')); }
    pop.classList.toggle('on', otevrit);
    btn.setAttribute('aria-expanded', otevrit ? 'true' : 'false');
  }

  function init() {
    injectStyle();
    btn = document.createElement('button');
    btn.id = 'hb-btn'; btn.type = 'button'; btn.textContent = '?';
    btn.title = t('helper_btn'); btn.setAttribute('aria-label', t('helper_btn'));
    btn.setAttribute('aria-expanded', 'false');
    btn.addEventListener('click', toggle);
    document.body.appendChild(btn);
    pop = document.createElement('div');
    pop.id = 'hb-pop';
    pop.addEventListener('click', function (ev) { ev.stopPropagation(); });
    document.body.appendChild(pop);
    document.addEventListener('click', function () { if (pop.classList.contains('on')) toggle(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
