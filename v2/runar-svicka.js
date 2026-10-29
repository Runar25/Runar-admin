// runar-svicka.js — JEDINÝ přehrávač appky jako svíčka: hlas čtení, Kolekce, deník (s časem) i rituál (malá, bez času).
//
// Proč (owner 2026-10-29, hlášení 9c7d57f1 + 63278a3a; náhledy docs/inbox/2026-10-29-prehravac-svicka.*): přehrávač má být svíčka
// ve stylu run — nota přehraje, jiskra na knotu zapálí, hoří zleva doprava s časem, za plamenem zůstává vosk stékající ze spodní
// hrany jako nesouměrné rampouchy, pauza = poryv větru sfoukne plamen, dohoří → 3 s vosk → složí se zpátky. „Když posunu na nějaké
// místo svíčky, tak by se tam měl vrátit i přehrávač“ → svíčka je zároveň posuvník: ťuknutí / tažení přesune zvuk i svíčku
// (dozadu svíčka doroste a vosk za tím místem zmizí, dopředu odhoří a vosk začne stékat).
// Rozložení (owner téhož dne: „zbytečně velké mezery mezi play, časovou osou… pruh stopy je tím asymetricky menší“): nota · čas ·
// svíčka · délka se stejnými viditelnými mezerami; svíčka kreslí v jednotkách své skutečné šířky (viewBox podle velikosti), takže
// vyplní celé místo — pruh .cap-seek nechával 36 px vlevo a 21 px vpravo (změřeno na 375 px).
// Zvuk řídí <audio>: svíčka čte jeho události (play/pause/ended/emptied), takže sedí i při autoplay (deník) a cizím pause().
// Hraje vždy jen jeden přehrávač: spuštění jednoho ztiší ostatní (bez poryvu).
//
// API (runar-app.js ho volá přes _makeCapPlayer / _capWire / _capPlay / _capReset / _capStop):
//   svickaHtml(prefix, src, {autoplay, mala})  → markup (<audio id="<prefix>-a"> + .svp)
//   svickaNapoj(prefix)                        → oživí přehrávač s tím prefixem (po vložení markupu do stránky)
//   svickaPrepni(prefix) · svickaReset(prefix) · svickaStop(prefix)

var _SVG_NS = 'http://www.w3.org/2000/svg';
var _SVICKY = {};   // prefix → instance; hraje nejvýš jedna
var VITR_KLID = 0.4;   // vítr (symbol sfouknutí), když nehraje: vidět, ale tlumeně
var _SVICKA_NOTA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V5.5l10-2V16"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/></svg>';

function _svickaEsc(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
function _svickaCas(s) { s = Math.max(0, Math.floor(isFinite(s) ? s : 0)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
function _svickaKlid() { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
// Vosk má být pokaždé stejný (posun tam a zpět nesmí přeskládat rampouchy) → pseudonáhoda se semínkem z prefixu.
function _svickaRnd(seed) { var h = 2166136261; for (var i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return function () { h += 0x6D2B79F5; var x = h; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
function _svickaEl(tag, at, rodic) { var e = document.createElementNS(_SVG_NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (rodic) rodic.appendChild(e); return e; }
function _svickaHvezda(r1, r2, n) { var d = ''; for (var i = 0; i < n * 2; i++) { var r = i % 2 ? r2 : r1, a = Math.PI * i / n - Math.PI / 2; d += (i ? 'L' : 'M') + (r * Math.cos(a)).toFixed(2) + ',' + (r * Math.sin(a)).toFixed(2); } return d + 'Z'; }
function _svickaAnim(ms, krok, hotovo) {
  if (_svickaKlid()) ms = 1;
  var t0 = null, zrus = false;
  function f(ts) { if (zrus) return; if (t0 === null) t0 = ts; var q = Math.min(1, (ts - t0) / ms); krok(q); if (q < 1) requestAnimationFrame(f); else if (hotovo) hotovo(); }
  requestAnimationFrame(f);
  return function () { zrus = true; };
}

function svickaHtml(prefix, src, o) {
  o = o || {};
  // bez src žádný atribut: src="" by prohlížeč načítal stránku jako zvuk
  return '<audio id="' + prefix + '-a"' + (src ? ' src="' + _svickaEsc(src) + '"' : '') + ' preload="metadata"' + (o.autoplay ? ' autoplay' : '') + '></audio>'
    + '<div class="svp' + (o.mala ? ' svp-mala' : '') + '" id="' + prefix + '-svp">'
    + '<button type="button" class="svp-nota" id="' + prefix + '-pb" aria-pressed="false" aria-label="' + _svickaEsc(t('player_listen')) + '">' + _SVICKA_NOTA + '</button>'
    + (o.mala ? '' : '<span class="svp-cas" id="' + prefix + '-ct">0:00</span>')
    + '<svg class="svp-svicka" id="' + prefix + '-sv" role="slider" tabindex="0" aria-label="' + _svickaEsc(t('player_seek'))
    + '" aria-valuemin="0" aria-valuemax="0" aria-valuenow="0" aria-valuetext="0:00"></svg>'
    + (o.mala ? '' : '<span class="svp-cas" id="' + prefix + '-dr">0:00</span>')
    + '</div>';
}

function svickaNapoj(prefix) {
  var a = document.getElementById(prefix + '-a'), svg = document.getElementById(prefix + '-sv'), nota = document.getElementById(prefix + '-pb');
  if (!a || !svg || !nota) return null;
  if (_SVICKY[prefix]) _SVICKY[prefix].zrus();
  var ct = document.getElementById(prefix + '-ct'), dr = document.getElementById(prefix + '-dr');

  // Souřadnice: výška 34 jednotek, šířka podle skutečného poměru stran → 1 jednotka = stejně px na šířku i výšku, svíčka vyplní celé místo.
  // vitrW: čáry větru vlevo (symbol sfouknutí); x0: začátek svíčky = za větrem místo pro knot a plamen v 0 %
  var H = 34, W = 240, vy = 9, yt = H / 2 - vy / 2, yb = yt + vy, vitrW = 18, x0 = vitrW + 8, x1, L;
  // Přepočet i při ťuknutí / posunu / načtení délky, ne jen z ResizeObserveru (ten na skryté stránce neběží, změřeno 2026-10-29).
  function rozmer() {
    var r = svg.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) W = H * r.width / r.height;
    x1 = W - 1.5; L = Math.max(1, x1 - x0);
    svg.setAttribute('viewBox', '0 0 ' + W.toFixed(2) + ' ' + H);
  }
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  var g = _svickaEl('g', {}, svg);
  var hrana = _svickaEl('path', { 'class': 'svp-vosk' }, g);       // linie spodní hrany tam, kde svíčka odhořela
  var ramp = _svickaEl('g', { 'class': 'svp-vosk' }, g);
  var telo = _svickaEl('path', {}, g);
  var lesk = _svickaEl('path', { 'class': 'svp-lesk' }, g);
  var krater = _svickaEl('path', {}, g);                              // důlek u knotu
  var knot = _svickaEl('path', {}, g);
  var plamen = _svickaEl('g', { opacity: 0 }, g);
  _svickaEl('path', { 'class': 'svp-plamen', d: 'M0,0 C-4,-4 -4,-10 0,-17 C4,-10 4,-4 0,0 Z' }, plamen);
  _svickaEl('path', { 'class': 'svp-jadro', d: 'M0,-1 C-1.6,-3 -1.6,-6 0,-9 C1.6,-6 1.6,-3 0,-1 Z' }, plamen);
  var jiskra = _svickaEl('path', { 'class': 'svp-jiskra', opacity: 0, d: _svickaHvezda(9, 2.2, 8) }, g);
  var kour = _svickaEl('path', { 'class': 'svp-kour', d: 'M0,0 C-3,-5 3,-9 0,-14 C-3,-19 2,-22 0,-26' }, g);
  var fouk = _svickaEl('g', { 'class': 'svp-fouk' }, g), f1 = _svickaEl('path', {}, fouk), f2 = _svickaEl('path', {}, fouk);
  // Vítr = zatočené čáry, fouká doprava (náhled 2, owner „1. čáry“). Opacity jako ATRIBUT: kontrola mezer (smoke ㊎) bere za neviditelné
  // jen [opacity="0"] — kdyby vítr v klidu zmizel, nesouměrnost pozná.
  var vitr = _svickaEl('g', { 'class': 'svp-vitr', opacity: VITR_KLID, transform: 'translate(1,' + (H / 2 - 6) + ')' }, g);
  _svickaEl('path', { d: 'M0,3 L11,3 C14,3 15,0 13,-1 C11,-2 9,0 10.5,1' }, vitr);
  _svickaEl('path', { d: 'M0,6.5 L15,6.5' }, vitr);
  _svickaEl('path', { d: 'M0,10 L9,10 C12,10 13,13 11,14 C9,15 7.5,13 9,12' }, vitr);
  function vitrHraje(ano) { vitr.setAttribute('opacity', ano ? 1 : VITR_KLID); }

  // Vosk podle délky stopy (owner 2026-10-29 po náhledu 3: „na delší časové stopy by mělo být více tekoucího vosku. U rituálu trošku
  // vosku ubrat“): rampouchů ≈ sekundy zvuku × √(délka svíčky / 200), nejméně 6, nejvýš jeden na 5 jednotek (hustší splynou v pruh).
  // Spočteno: rituál 17 s 11 (dřív 18), čtení 24 s 24 (dřív 17), od ~40 s strop 39. Každý ve svém úseku posunutý náhodně se semínkem
  // z prefixu — nesouměrné (jeden delší, druhý kratší) a při posunu tam a zpět pořád stejné. Do té doby pevný krok = stejně na každé svíčce.
  var kapky = [], voskKlic = '';
  function vosk() {
    var dl = delka(), n = Math.max(6, Math.min(Math.floor(L / 5), Math.round((dl || 15) * Math.sqrt(L / 200)))), klic = n + '|' + Math.round(dl);
    if (klic === voskKlic) return;
    voskKlic = klic; kapky = [];
    var rnd = _svickaRnd(prefix), usek = 0.96 / n;
    for (var i = 0; i < n; i++) kapky.push({ q: 0.03 + usek * (i + 0.15 + rnd() * 0.7), w: 1.2 + rnd() * 2, max: 1.5 + Math.pow(rnd(), 1.4) * (vy + 3),
      dur: 700 + rnd() * 700, t0: null, zpet: null });
  }

  var S = { p: 0, stav: 'klid', tise: false, tah: false, bezi: false, js: null, jr: 0, ky: 0, zrusAnim: null, casovac: null };

  function delka() { return isFinite(a.duration) && a.duration > 0 ? a.duration : 0; }
  function kresli() {
    var xs = x0 + L * S.p, k = yt + vy / 2, nyni = performance.now(), roste = false;
    telo.setAttribute('d', x1 - xs < 0.5 ? '' : 'M' + xs + ',' + yt + ' L' + x1 + ',' + yt + ' L' + x1 + ',' + yb + ' L' + xs + ',' + yb);
    lesk.setAttribute('d', x1 - xs < 6 ? '' : 'M' + (xs + 3) + ',' + (yt + 2.2) + ' L' + (x1 - 3) + ',' + (yt + 2.2));
    krater.setAttribute('d', x1 - xs < 0.5 ? '' : 'M' + xs + ',' + yt + ' C' + (xs + 2.5) + ',' + (yt + 2) + ' ' + (xs + 2.5) + ',' + (yb - 2) + ' ' + xs + ',' + yb);
    knot.setAttribute('d', 'M' + (xs + 1) + ',' + k + ' L' + (xs - 3.5) + ',' + (k - 1.6));
    var tr = 'translate(' + (xs - 4) + ',' + (k - 2) + ')';
    plamen.setAttribute('transform', tr);
    jiskra.setAttribute('transform', tr + (S.js ? ' scale(' + S.js + ') rotate(' + S.jr + ')' : ''));
    kour.setAttribute('transform', tr + ' translate(0,' + (S.ky - 2) + ')');
    hrana.setAttribute('d', xs - x0 < 0.5 ? '' : 'M' + x0 + ',' + yb + ' L' + xs + ',' + yb);
    while (ramp.firstChild) ramp.removeChild(ramp.firstChild);
    kapky.forEach(function (r) {
      var x = x0 + L * r.q;
      if (x > xs - 2) { r.t0 = null; return; }            // ještě neodhořelo (nebo posun zpět svíčku doplnil) → vosk tu není
      if (r.t0 === null) r.t0 = nyni + 300;               // vosk začne stékat chvilku po odhoření
      var v = r.zpet !== null ? r.zpet : Math.max(0, Math.min(1, (nyni - r.t0) / r.dur));
      if (r.zpet === null && v < 1) roste = true;
      var d = r.max * v; if (d < 0.3) return;
      _svickaEl('path', { d: 'M' + (x - r.w) + ',' + yb + ' C' + (x - r.w * 0.6) + ',' + (yb + d * 0.6) + ' ' + (x - 0.2) + ',' + (yb + d) + ' ' + x + ',' + (yb + d)
        + ' C' + (x + 0.3) + ',' + (yb + d) + ' ' + (x + r.w * 0.5) + ',' + (yb + d * 0.5) + ' ' + (x + r.w * 0.8) + ',' + yb }, ramp);
    });
    var dl = delka(), c = S.stav === 'dohorela' ? dl * S.p : a.currentTime;
    if (ct) ct.textContent = _svickaCas(c);
    svg.setAttribute('aria-valuenow', Math.round(c)); svg.setAttribute('aria-valuemax', Math.round(dl));
    svg.setAttribute('aria-valuetext', _svickaCas(c) + ' / ' + _svickaCas(dl));
    return roste;
  }
  function smycka() {
    if (!S.bezi) return;
    if (S.stav === 'hori' && !S.tah && delka()) S.p = Math.min(1, a.currentTime / delka());
    var roste = kresli();
    if (S.stav === 'hori' || S.stav === 'zapaluje' || S.stav === 'zhasina' || roste) requestAnimationFrame(smycka); else S.bezi = false;
  }
  function spust() { if (!S.bezi) { S.bezi = true; requestAnimationFrame(smycka); } }
  function zastavAnim() { if (S.zrusAnim) { S.zrusAnim(); S.zrusAnim = null; } clearTimeout(S.casovac); }
  function zhasniNotu() { nota.classList.remove('hraje'); nota.setAttribute('aria-pressed', 'false'); vitrHraje(false); }
  function celaZnovu() {   // svíčka celá, bez vosku a plamene (nová stopa, konec dohoření, vyprázdnění)
    zastavAnim(); S.p = 0; S.js = null; S.ky = 0; S.stav = 'klid';
    kapky.forEach(function (r) { r.t0 = null; r.zpet = null; });
    plamen.setAttribute('opacity', 0); jiskra.setAttribute('opacity', 0); kour.style.opacity = 0; f1.style.opacity = f2.style.opacity = 0;
    zhasniNotu(); kresli();
  }
  function zapal(potom) {
    S.stav = 'zapaluje'; spust();
    S.zrusAnim = _svickaAnim(520, function (q) {   // jiskra přímo na knotu: zvětší se, zableskne, rozzáří plamen
      S.js = (q < 0.6 ? q / 0.6 * 1.6 : 1.6 - (q - 0.6) / 0.4 * 1.3).toFixed(3); S.jr = (q * 140).toFixed(1);
      jiskra.setAttribute('opacity', q < 0.85 ? 1 : (1 - q) / 0.15);
      plamen.setAttribute('opacity', Math.max(0, (q - 0.45) / 0.55));
    }, function () { S.zrusAnim = null; S.js = null; jiskra.setAttribute('opacity', 0); plamen.setAttribute('opacity', 1); potom(); });
  }
  function sfoukni() {   // poryv (dvě čáry) přiletí zleva k plameni, plamen zhasne, vzletí kouřek
    S.stav = 'zhasina'; spust();
    var cil = x0 + L * S.p - 6, y = H / 2 - 4, start = Math.min(vitrW + 2, cil);   // od větru k plameni
    S.zrusAnim = _svickaAnim(380, function (q) {
      var x = start + (cil - start) * q;
      f1.setAttribute('d', 'M' + (x - 9) + ',' + y + ' L' + x + ',' + y); f2.setAttribute('d', 'M' + (x - 11) + ',' + (y + 3.5) + ' L' + (x - 2) + ',' + (y + 3.5));
      f1.style.opacity = f2.style.opacity = (q < 0.85 ? 0.8 : (1 - q) / 0.15 * 0.8);
    }, function () {
      f1.style.opacity = f2.style.opacity = 0; plamen.setAttribute('opacity', 0); S.stav = 'klid';
      S.zrusAnim = _svickaAnim(1100, function (q) { kour.style.opacity = (q < 0.2 ? q / 0.2 : (1 - q) / 0.8) * 0.7; S.ky = -q * 6; kresli(); },
        function () { S.zrusAnim = null; kour.style.opacity = 0; S.ky = 0; kresli(); });
    });
  }
  function dohor() {   // dohořelo: 3 s jen vosk, pak se za ~1,8 s z vosku složí celá (zprava doleva zpátky ke knotu)
    zastavAnim(); S.stav = 'dohorela'; S.p = 1; plamen.setAttribute('opacity', 0); zhasniNotu(); kresli();
    S.casovac = setTimeout(function () {
      S.zrusAnim = _svickaAnim(1800, function (q) { S.p = 1 - q; kapky.forEach(function (r) { r.zpet = 1 - q; }); kresli(); },
        function () { S.zrusAnim = null; celaZnovu(); a.currentTime = 0; });
    }, _svickaKlid() ? 0 : 3000);
  }
  function ztisOstatni() {
    for (var k in _SVICKY) { var o = _SVICKY[k]; if (o !== api && !o.a.paused) { o.ztis(); } }
  }
  function hraj() {
    if (!a.getAttribute('src') || S.stav === 'zapaluje') return;
    rozmer();
    if (S.stav === 'dohorela') { celaZnovu(); a.currentTime = 0; }
    ztisOstatni();
    zastavAnim(); kour.style.opacity = 0; f1.style.opacity = f2.style.opacity = 0;
    nota.classList.add('hraje'); nota.setAttribute('aria-pressed', 'true'); vitrHraje(true);
    zapal(function () {
      S.stav = 'hori'; spust();
      var pr = a.play(); if (pr && pr.catch) pr.catch(function () { plamen.setAttribute('opacity', 0); S.stav = 'klid'; zhasniNotu(); kresli(); });
    });
  }
  function posun(nq) {   // posun na místo svíčky: zvuk i svíčka tam (dozadu svíčka doroste, dopředu odhoří)
    var dl = delka(); if (!dl) return;
    nq = Math.max(0, Math.min(1, nq));
    if (S.stav === 'dohorela') { zastavAnim(); kapky.forEach(function (r) { r.zpet = null; r.t0 = null; }); S.stav = 'klid'; }
    S.p = nq; a.currentTime = Math.min(nq * dl, Math.max(0, dl - 0.05));
    kresli(); spust();
  }
  function qZBodu(e) { var r = svg.getBoundingClientRect(); return ((e.clientX - r.left) * W / r.width - x0) / L; }

  function naPlay() {
    ztisOstatni(); rozmer();
    if (S.stav !== 'zapaluje') { S.stav = 'hori'; plamen.setAttribute('opacity', 1); }   // spuštění zvenku (autoplay deníku)
    nota.classList.add('hraje'); nota.setAttribute('aria-pressed', 'true'); vitrHraje(true); spust();
  }
  function naPause() {
    if (a.ended || S.stav === 'dohorela') return;
    zhasniNotu(); zastavAnim();
    if (S.tise || _svickaKlid()) { S.tise = false; plamen.setAttribute('opacity', 0); S.stav = 'klid'; kresli(); return; }
    sfoukni();
  }
  function naCas() { if (!S.tah && S.stav !== 'dohorela' && S.stav !== 'hori' && delka()) { S.p = Math.min(1, a.currentTime / delka()); kresli(); } }
  function naDelku() { if (dr) dr.textContent = _svickaCas(delka()); rozmer(); vosk(); kresli(); }
  function naPrazdno() { if (dr) dr.textContent = '0:00'; celaZnovu(); }
  function naKonec() { dohor(); }
  function naNotu() { if (!a.paused) a.pause(); else hraj(); }
  function naDolu(e) {
    if (!delka()) return; rozmer();
    if (qZBodu(e) * L < -5) { if (!a.paused) a.pause(); e.preventDefault(); return; }   // vítr vlevo od knotu
    S.tah = true; try { svg.setPointerCapture(e.pointerId); } catch (x) {} posun(qZBodu(e)); e.preventDefault(); }
  function naTah(e) { if (S.tah) posun(qZBodu(e)); }
  function naNahoru() { S.tah = false; }
  function naKlavesu(e) {
    var dl = delka(); if (!dl) return;
    var krok = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5, PageUp: dl / 10, PageDown: -dl / 10 }[e.key];
    if (krok !== undefined) posun((a.currentTime + krok) / dl); else if (e.key === 'Home') posun(0); else if (e.key === 'End') posun(1); else return;
    e.preventDefault();
  }
  var udalosti = [[a, 'play', naPlay], [a, 'pause', naPause], [a, 'timeupdate', naCas], [a, 'seeked', naCas], [a, 'loadedmetadata', naDelku],
    [a, 'durationchange', naDelku], [a, 'emptied', naPrazdno], [a, 'ended', naKonec], [nota, 'click', naNotu], [svg, 'pointerdown', naDolu],
    [svg, 'pointermove', naTah], [svg, 'pointerup', naNahoru], [svg, 'pointercancel', naNahoru], [svg, 'keydown', naKlavesu]];
  udalosti.forEach(function (u) { u[0].addEventListener(u[1], u[2]); });
  // Pevná šířka obou časů = nejširší číslice (owner 2026-10-29: „čas stopy stále posouvá teď už i sfouknutí a svíčku… nastav na 0:00
  // ty nejtlustší a ať se to už konečně nepohybuje“). Cinzel má číslice různě široké a tabular-nums u něj nepomůže, takže „0:07“ → „0:12“
  // měnilo šířku času a posouvalo vítr i svíčku. Měří se „d:dd“ pro každou číslici (nejširší číslice na všech místech), v em, ať sedí
  // i při zvětšení písma; skrytý přehrávač (šířka 0) se změří, až se ukáže (prekresli z ResizeObserveru) nebo až dorazí písmo.
  function sirkaCasu() {
    if (!ct || !dr) return;
    var puv = ct.textContent, fs = parseFloat(getComputedStyle(ct).fontSize) || 0, max = 0;
    ct.style.width = '';
    for (var c = 0; c < 10; c++) { ct.textContent = c + ':' + c + c; max = Math.max(max, ct.getBoundingClientRect().width); }
    ct.textContent = puv;
    if (max > 0 && fs > 0) ct.style.width = dr.style.width = (max / fs + 0.02).toFixed(3) + 'em';
  }
  function prekresli() { sirkaCasu(); rozmer(); vosk(); kresli(); }
  var ro = window.ResizeObserver ? new ResizeObserver(prekresli) : null;
  if (ro) ro.observe(svg); else window.addEventListener('resize', prekresli);

  var api = {
    a: a,
    prepni: naNotu,
    reset: celaZnovu,
    ztis: function () { S.tise = true; a.pause(); },
    zrus: function () { zastavAnim(); S.bezi = false; udalosti.forEach(function (u) { u[0].removeEventListener(u[1], u[2]); });
      if (ro) ro.disconnect(); else window.removeEventListener('resize', prekresli); if (_SVICKY[prefix] === api) delete _SVICKY[prefix]; },
    _stav: function () { return { p: S.p, stav: S.stav, W: W, x0: x0, x1: x1, rampouchu: kapky.length, vitr: +vitr.getAttribute('opacity'),
      vosk: kapky.filter(function (r) { return r.t0 !== null; }).length }; }   // jen pro kontroly
  };
  _SVICKY[prefix] = api;
  prekresli(); naDelku();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (_SVICKY[prefix] === api) prekresli(); });
  return api;
}
function svickaPopisky() {   // aria popisky v jazyce appky (volá updateUIText — statický překlad, §14)
  for (var k in _SVICKY) {
    var n = document.getElementById(k + '-pb'), v = document.getElementById(k + '-sv');
    if (n) n.setAttribute('aria-label', t('player_listen'));
    if (v) v.setAttribute('aria-label', t('player_seek'));
  }
}
function svickaPrepni(prefix) { var s = _SVICKY[prefix]; if (s) s.prepni(); }
function svickaReset(prefix) { var s = _SVICKY[prefix]; if (s) s.reset(); }
function svickaStop(prefix) {   // zastavit a vyprázdnit (nové čtení, jiný jazyk); removeAttribute + load(), ne src='' (viz svickaHtml)
  var a = document.getElementById(prefix + '-a'), s = _SVICKY[prefix];
  if (s && a && !a.paused) s.ztis();
  if (a) { a.removeAttribute('src'); a.load(); }
  if (s) s.reset();
}
