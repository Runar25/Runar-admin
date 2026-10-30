// runar-svicka.js — JEDINÝ přehrávač appky jako svíčka: hlas čtení, Kolekce, deník (vodorovná, s časem) a rituál s návodem
// (svislá v okraji papíru, od 2026-10-30 — owner nad náhledem docs/inbox/2026-10-30-papir.html: „papír super, svíčka super“).
//
// Proč (owner 2026-10-29, hlášení 9c7d57f1 + 63278a3a; náhledy docs/inbox/2026-10-29-prehravac-svicka.*): přehrávač má být svíčka
// ve stylu run — nota přehraje, jiskra na knotu zapálí, hoří zleva doprava s časem, za plamenem zůstává vosk stékající ze spodní
// hrany jako nesouměrné rampouchy, pauza = znovu nota: plamen zhasne a vzletí kouřek, dohoří → 3 s vosk → složí se zpátky. „Když posunu na nějaké
// místo svíčky, tak by se tam měl vrátit i přehrávač“ → svíčka je zároveň posuvník: ťuknutí / tažení přesune zvuk i svíčku
// (dozadu svíčka doroste a vosk za tím místem zmizí, dopředu odhoří a vosk začne stékat).
// Rozložení (owner téhož dne: „zbytečně velké mezery mezi play, časovou osou… pruh stopy je tím asymetricky menší“): nota · čas ·
// svíčka · délka se stejnými viditelnými mezerami; svíčka kreslí v jednotkách své skutečné šířky (viewBox podle velikosti), takže
// vyplní celé místo — pruh .cap-seek nechával 36 px vlevo a 21 px vpravo (změřeno na 375 px).
// Zvuk řídí <audio>: svíčka čte jeho události (play/pause/ended/emptied), takže sedí i při autoplay (deník) a cizím pause().
// Hraje vždy jen jeden přehrávač: spuštění jednoho ztiší ostatní (bez poryvu).
//
// API (runar-app.js ho volá přes _makeCapPlayer / _capWire / _capPlay / _capReset / _capStop):
//   svickaHtml(prefix, src, {autoplay, svisla}) → markup (<audio id="<prefix>-a"> + .svp); svislá = jen zvuk a nota, kresbu
//                                                 <svg class="svp-svisla" id="<prefix>-sv"> má papír (runar-reader.html)
//   svickaNapoj(prefix)                        → oživí přehrávač s tím prefixem (po vložení markupu do stránky)
//   svickaPrepni(prefix) · svickaReset(prefix) · svickaStop(prefix)
//   svickaTvor(prefix) · svickaHotovo(prefix)   čekání na hlas: svíčka se tvoří, po příchodu zvuku se dotvoří (níž u tvor())
//   svickaZtis(prefix)                         tiché zastavení (smotaný papír, owner 2026-10-30 „7. ano“)

var _SVG_NS = 'http://www.w3.org/2000/svg';
var _SVICKY = {};   // prefix → instance; hraje nejvýš jedna
var _SVICKA_NOTA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V5.5l10-2V16"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/></svg>';

function _svickaEsc(s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }
function _svickaCas(s) { s = Math.max(0, Math.floor(isFinite(s) ? s : 0)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
function _svickaKlid() { return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); }
// Vosk má být pokaždé stejný (posun tam a zpět nesmí přeskládat rampouchy) → pseudonáhoda se semínkem z prefixu.
function _svickaRnd(seed) { var h = 2166136261; for (var i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return function () { h += 0x6D2B79F5; var x = h; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
function _svickaEl(tag, at, rodic) { var e = document.createElementNS(_SVG_NS, tag); for (var k in at) e.setAttribute(k, at[k]); if (rodic) rodic.appendChild(e); return e; }
function _svickaHvezda(r1, r2, n) { var d = ''; for (var i = 0; i < n * 2; i++) { var r = i % 2 ? r2 : r1, a = Math.PI * i / n - Math.PI / 2; d += (i ? 'L' : 'M') + (r * Math.cos(a)).toFixed(2) + ',' + (r * Math.sin(a)).toFixed(2); } return d + 'Z'; }
// Obraz na zamčené obrazovce (owner 2026-10-30 „6. ok“; „u výkladu více run mohou být všechny runy“): tažené runy naší kresbou
// (runeSvg, kámen, §5) místo ikony appky — jedna runa přes celý obraz, výklad všechny v řadách (3 run v řadě, Kříž 3+2, Yggdrasil 3×3).
// Kresba se jednou za sestavu run vykreslí do PNG 512 px na pozadí appky; než je hotová, ikona. Rituál a návod runu nemají → ikona.
// Na skutečném zamčeném iPhonu / Androidu neověřeno — kontrola vidí jen, co appka prohlížeči předala.
var _SVICKA_OBRAZY = {};
function _svickaObrazRuny(runy, hotovo) {
  runy = (Array.isArray(runy) ? runy : [runy]).filter(function (r) { return r && (r.svg || r.n); });
  if (!runy.length || typeof runeSvg !== 'function') return null;
  var k = runy.map(function (r) { return r.svg || r.n; }).join('|');
  if (_SVICKA_OBRAZY[k]) return _SVICKA_OBRAZY[k];
  if (_SVICKA_OBRAZY[k] === false) return null;   // kresba se právě skládá
  var svgy = runy.map(function (r) { return runeSvg(r, { frame: true }); });
  if (svgy.some(function (s) { return s.indexOf('<svg') !== 0; })) return null;   // runa bez kresby (záložní glyf) → ikona
  _SVICKA_OBRAZY[k] = false;
  var n = runy.length, sl = n <= 3 ? n : Math.ceil(Math.sqrt(n)), ra = Math.ceil(n / sl);
  var bunka = Math.min(400, 460 / Math.max(sl, ra)), obrazy = [], nacteno = 0;
  function sloz() {
    try {
      var c = document.createElement('canvas'); c.width = c.height = 512;
      var x = c.getContext('2d');
      x.fillStyle = getComputedStyle(document.body).backgroundColor || 'black'; x.fillRect(0, 0, 512, 512);
      var y0 = (512 - ra * bunka) / 2;
      for (var i = 0; i < n; i++) {
        var radek = Math.floor(i / sl), vRadku = Math.min(sl, n - radek * sl), x0 = (512 - vRadku * bunka) / 2;
        x.drawImage(obrazy[i], x0 + (i % sl) * bunka, y0 + radek * bunka, bunka, bunka);
      }
      _SVICKA_OBRAZY[k] = c.toDataURL('image/png'); hotovo();
    } catch (e) { delete _SVICKA_OBRAZY[k]; }
  }
  svgy.forEach(function (svg, i) {
    var img = new Image();
    img.onload = function () { if (++nacteno === n) sloz(); };
    img.onerror = function () { delete _SVICKA_OBRAZY[k]; };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.replace('<svg ', '<svg width="400" height="400" ' + (svg.indexOf('xmlns=') < 0 ? 'xmlns="http://www.w3.org/2000/svg" ' : '')));
    obrazy[i] = img;
  });
  return null;
}
function _svickaAnim(ms, krok, hotovo) {
  // Skrytá stránka (zamčený telefon, jiná záložka prohlížeče) nekreslí — rAF nepřijde a jiskra by čekala věčně, takže by hlas
  // z ovládání na zamčené obrazovce nikdy nezačal. Tam proběhne hned.
  if (document.hidden) { krok(1); if (hotovo) hotovo(); return function () {}; }
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
    + '<' + (o.svisla ? 'span' : 'div') + ' class="svp" id="' + prefix + '-svp">'
    + '<button type="button" class="svp-nota" id="' + prefix + '-pb" aria-pressed="false" aria-label="' + _svickaEsc(t('player_listen')) + '">' + _SVICKA_NOTA + '</button>'
    + (o.svisla ? '</span>' : '<span class="svp-cas" id="' + prefix + '-ct">0:00</span>'
    + '<svg class="svp-svicka" id="' + prefix + '-sv" role="slider" tabindex="0" aria-label="' + _svickaEsc(t('player_seek'))
    + '" aria-valuemin="0" aria-valuemax="0" aria-valuenow="0" aria-valuetext="0:00"></svg>'
    + '<span class="svp-cas" id="' + prefix + '-dr">0:00</span></div>');
}

function svickaNapoj(prefix) {
  var a = document.getElementById(prefix + '-a'), svg = document.getElementById(prefix + '-sv'), nota = document.getElementById(prefix + '-pb');
  if (!a || !svg || !nota) return null;
  if (_SVICKY[prefix]) _SVICKY[prefix].zrus();
  var ct = document.getElementById(prefix + '-ct'), dr = document.getElementById(prefix + '-dr');
  // Svislá svíčka (rituál a návod v papíru, owner 2026-10-30 nad náhledem docs/inbox/2026-10-30-papir.html): po ťuknutí na notu se
  // pod ní od knotu dolů vytáhne, jiskra ji zapálí, hoří shora dolů až na dno (je vidět konec), po stranách i zepředu stéká vosk, který
  // cestou dolů roste a zůstává, kde vznikl; u paty se tvoří kaluž a přeteče přes hranu podložky. Po dohoření chvíli oharek, pak zmizí.
  // Nahrazuje malou vodorovnou svíčku, která se objevovala až po notě (owner 2026-10-29 „v rituálu se má svíčka objevit až po kliknutí
  // na notu. A po dohrání zmizet“ — to svislá dělá taky: bez noty není vidět nic).
  var svisla = svg.classList.contains('svp-svisla');

  // Souřadnice: výška 34 jednotek, šířka podle skutečného poměru stran → 1 jednotka = stejně px na šířku i výšku, svíčka vyplní celé místo.
  // x0: místo pro knot a plamen v 0 %. Vítr (symbol sfouknutí) vlevo od svíčky a poryv k plameni pryč (owner 2026-10-29, po náhledu 3:
  // „odstraníme foukanec, všechno bude řídit nota… plamen zhasne, jak je to teď. To je čisté“) — jedno ovládání a žádné místo navíc vlevo.
  var H = 34, W = 240, vy = 9, yt = H / 2 - vy / 2, yb = yt + vy, x0 = 6, x1, L;
  // svislá: šířka 34 jednotek, výška podle skutečného poměru stran (svíčka vyplní okraj papíru, ať je text dlouhý nebo krátký)
  var SX0 = 7, SX1 = 27, STOP = 20, SDNO = 204, SH = 230, OHAREK = 2;
  // Přepočet i při ťuknutí / posunu / načtení délky, ne jen z ResizeObserveru (ten na skryté stránce neběží, změřeno 2026-10-29).
  function rozmer() {
    var r = svg.getBoundingClientRect();
    if (svisla) {
      if (r.width > 0 && r.height > 0) SH = 34 * r.height / r.width;
      SDNO = Math.max(STOP + 40, SH - 26);   // pod dnem místo pro podložku, kaluž a přetékající vosk
      svg.setAttribute('viewBox', '0 0 34 ' + SH.toFixed(2)); return;
    }
    if (r.width > 0 && r.height > 0) W = H * r.width / r.height;
    x1 = W - 1.5; L = Math.max(1, x1 - x0);
    svg.setAttribute('viewBox', '0 0 ' + W.toFixed(2) + ' ' + H);
  }
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  var g = _svickaEl('g', {}, svg);
  var podlozka = svisla ? _svickaEl('path', {}, g) : null, kaluz = svisla ? _svickaEl('path', { 'class': 'svp-vosk' }, g) : null;
  var hrana = _svickaEl('path', { 'class': 'svp-vosk' }, g);       // linie spodní hrany tam, kde svíčka odhořela
  var ramp = _svickaEl('g', { 'class': 'svp-vosk' }, g);
  var telo = _svickaEl('path', svisla ? { 'class': 'svp-telo' } : {}, g);
  var voskySv = svisla ? _svickaEl('g', {}, g) : null, pretok = svisla ? _svickaEl('g', {}, g) : null;
  var lesk = _svickaEl('path', { 'class': 'svp-lesk' }, g);
  var krater = _svickaEl('path', {}, g);                              // důlek u knotu
  var knot = _svickaEl('path', {}, g);
  var plamen = _svickaEl('g', { opacity: 0 }, g);
  _svickaEl('path', { 'class': 'svp-plamen', d: 'M0,0 C-4,-4 -4,-10 0,-17 C4,-10 4,-4 0,0 Z' }, plamen);
  _svickaEl('path', { 'class': 'svp-jadro', d: 'M0,-1 C-1.6,-3 -1.6,-6 0,-9 C1.6,-6 1.6,-3 0,-1 Z' }, plamen);
  var jiskra = _svickaEl('path', { 'class': 'svp-jiskra', opacity: 0, d: _svickaHvezda(9, 2.2, 8) }, g);
  var kour = _svickaEl('path', { 'class': 'svp-kour', d: 'M0,0 C-3,-5 3,-9 0,-14 C-3,-19 2,-22 0,-26' }, g);

  // Vosk podle délky stopy (owner 2026-10-29 po náhledu 3: „na delší časové stopy by mělo být více tekoucího vosku. U rituálu trošku
  // vosku ubrat“): rampouchů ≈ sekundy zvuku × √(délka svíčky / 200), nejméně 6, nejvýš jeden na 5 jednotek (hustší splynou v pruh).
  // Spočteno: rituál 17 s 11 (dřív 18), čtení 24 s 24 (dřív 17), od ~40 s strop 39. Každý ve svém úseku posunutý náhodně se semínkem
  // z prefixu — nesouměrné (jeden delší, druhý kratší) a při posunu tam a zpět pořád stejné. Do té doby pevný krok = stejně na každé svíčce.
  var kapky = [], voskKlic = '';
  function vosk() {
    if (svisla) return;
    var dl = delka(), n = Math.max(6, Math.min(Math.floor(L / 5), Math.round((dl || 15) * Math.sqrt(L / 200)))), klic = n + '|' + Math.round(dl);
    if (klic === voskKlic) return;
    voskKlic = klic; kapky = [];
    var rnd = _svickaRnd(prefix), usek = 0.96 / n;
    for (var i = 0; i < n; i++) kapky.push({ q: 0.03 + usek * (i + 0.15 + rnd() * 0.7), w: 1.2 + rnd() * 2, max: 1.5 + Math.pow(rnd(), 1.4) * (vy + 3),
      dur: 700 + rnd() * 700, t0: null, zpet: null });
  }

  // svislá: kapky po stranách a zepředu — kdy (podíl dohoření) začnou, jak dlouhé (podíl výšky svíčky), pevné podle prefixu
  var kapkySv = [], predni = [];
  if (svisla) { var rs = _svickaRnd(prefix);
    for (var i = 0; i < 9; i++) kapkySv.push({ strana: i % 2, kdy: 0.04 + i * 0.1 + rs() * 0.05, max: (18 + rs() * 46) / 184, w: 2 + rs() * 2.2, dur: 1500 + rs() * 1500, t0: null, y0: 0 });
    predni = [{ x: 12.5, kdy: 0.08, max: 48 / 184, dur: 3200, t0: null, y0: 0 }, { x: 21, kdy: 0.4, max: 42 / 184, dur: 3000, t0: null, y0: 0 },
      { x: 15.5, kdy: 0.7, max: 26 / 184, dur: 2400, t0: null, y0: 0 }]; }

  var S = { p: 0, stav: 'klid', tise: false, tah: false, bezi: false, js: null, jr: 0, ky: 0, zrusAnim: null, casovac: null, nazev: '', runa: null, tv0: 0,
    delka: svisla ? 0 : 1 };   // delka = jak daleko se svislá svíčka vytáhla (0 = není vidět)

  // Zamčená obrazovka / notifikace (owner 2026-10-29 „zamčený ok“: dřív tam nebyl název ani pauza). Název dává volající (svickaNazev —
  // jméno runy, výkladu, nadpis rituálu; text i funkce, ať se vezme v chvíli přehrání). Ovládání patří přehrávači, který hrál naposled.
  function zamcena() {
    if (!('mediaSession' in navigator)) return;
    var ms = navigator.mediaSession, n = typeof S.nazev === 'function' ? S.nazev() : S.nazev;
    var runa = typeof S.runa === 'function' ? S.runa() : S.runa;
    var obr = runa ? _svickaObrazRuny(runa, function () { if (!a.paused) zamcena(); }) : null;   // kresba hotová → obraz vyměnit, hraje-li dál
    try {
      if (window.MediaMetadata) ms.metadata = new MediaMetadata({ title: n || 'Rúnar', artist: n ? 'Rúnar' : '',
        artwork: [{ src: obr || 'icons/web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png' }] });
      ms.setActionHandler('play', function () { if (a.paused) hraj(); });
      ms.setActionHandler('pause', function () { if (!a.paused) a.pause(); });
      ms.setActionHandler('seekto', function (d) { if (delka()) posun(d.seekTime / delka()); });
      ms.setActionHandler('seekbackward', function (d) { if (delka()) posun((a.currentTime - (d.seekOffset || 10)) / delka()); });
      ms.setActionHandler('seekforward', function (d) { if (delka()) posun((a.currentTime + (d.seekOffset || 10)) / delka()); });
    } catch (x) {}
  }
  function zamcenaPoloha() {
    try { if ('mediaSession' in navigator && navigator.mediaSession.setPositionState && delka())
      navigator.mediaSession.setPositionState({ duration: delka(), position: Math.min(a.currentTime, delka()), playbackRate: a.playbackRate || 1 }); } catch (x) {}
  }
  function zamcenaStav(hraje) { try { if ('mediaSession' in navigator) navigator.mediaSession.playbackState = hraje ? 'playing' : 'paused'; } catch (x) {} }

  function delka() { return isFinite(a.duration) && a.duration > 0 ? a.duration : 0; }
  function aria() {
    var dl = delka(), c = S.stav === 'dohorela' ? dl * S.p : a.currentTime;
    if (ct) ct.textContent = _svickaCas(c);
    svg.setAttribute('aria-valuenow', Math.round(c)); svg.setAttribute('aria-valuemax', Math.round(dl));
    svg.setAttribute('aria-valuetext', _svickaCas(c) + ' / ' + _svickaCas(dl));
  }
  // kapka vosku: stružka od (x, y0) dolů délky d, cestou roste (w, kr podle v), směr ven (smer) — svislá svíčka
  function kapkaSv(x, y, d, w, kr, smer, rodic) {
    _svickaEl('path', { 'class': 'svp-vosk', d: 'M' + x + ',' + y + ' C' + (x + smer * w) + ',' + (y + 2) + ' ' + (x + smer * w * .7) + ',' + (y + d * .6) + ' ' + (x + smer * w * .55) + ',' + (y + d - kr)
      + ' A' + kr + ',' + (kr * 1.15) + ' 0 1 ' + (smer > 0 ? 1 : 0) + ' ' + (x + smer * .2) + ',' + (y + d - kr * .4) + ' C' + (x - smer * .3) + ',' + (y + d * .7) + ' ' + x + ',' + (y + d * .4) + ' ' + x + ',' + (y + 3) }, rodic);
  }
  function kresliSvisle() {
    while (voskySv.firstChild) voskySv.removeChild(voskySv.firstChild);
    while (pretok.firstChild) pretok.removeChild(pretok.firstChild);
    if (S.delka <= 0) { [telo, lesk, krater, knot, podlozka, kaluz].forEach(function (e) { e.setAttribute('d', ''); }); aria(); return false; }
    var vys = SDNO - STOP, dno = STOP + vys * S.delka, y = STOP + (SDNO - OHAREK - STOP) * S.p, nyni = performance.now(), roste = false;
    telo.setAttribute('d', 'M' + SX0 + ',' + y + ' L' + SX0 + ',' + dno + ' L' + SX1 + ',' + dno + ' L' + SX1 + ',' + y + ' Z');
    lesk.setAttribute('d', dno - y > 14 ? 'M' + (SX0 + 3.5) + ',' + (y + 6) + ' L' + (SX0 + 3.5) + ',' + (dno - 6) : '');
    krater.setAttribute('d', 'M' + SX0 + ',' + y + ' C' + (SX0 + 5) + ',' + (y + 3.5) + ' ' + (SX1 - 5) + ',' + (y + 3.5) + ' ' + SX1 + ',' + y);
    knot.setAttribute('d', 'M17,' + (y + 2) + ' L17.6,' + (y - 3.5));
    var tr = 'translate(17.6,' + (y - 3.5) + ')';
    plamen.setAttribute('transform', tr);
    jiskra.setAttribute('transform', tr + (S.js ? ' scale(' + S.js + ') rotate(' + S.jr + ')' : ''));
    kour.setAttribute('transform', tr + ' translate(0,' + (S.ky - 2) + ')');
    var ziva = S.stav !== 'roste';
    kapkySv.forEach(function (k) {   // po stranách: zůstávají, kde vznikly; dohoří-li vršek pod ně, zmizí
      if (!ziva || S.p < k.kdy) { k.t0 = null; return; }
      if (k.t0 === null) { k.t0 = nyni; k.y0 = y; }
      var v = Math.min(1, (nyni - k.t0) / k.dur); if (v < 1) roste = true;
      var d = Math.min(k.max * vys * v, dno - k.y0 - 4) - (y - k.y0); if (d < 1) return;
      kapkaSv(k.strana ? SX1 : SX0, y, d, k.w * (.6 + .7 * v), .9 + 1.1 * v, k.strana ? 1 : -1, voskySv);
    });
    predni.forEach(function (k) {     // zepředu: stružka od kráteru dolů, kapka na konci roste
      if (!ziva || S.p < k.kdy) { k.t0 = null; return; }
      if (k.t0 === null) { k.t0 = nyni; k.y0 = y; }
      var v = Math.min(1, (nyni - k.t0) / k.dur); if (v < 1) roste = true;
      var d = Math.min(k.max * vys * v, dno - k.y0 - 8) - (y - k.y0); if (d < 1.5) return;
      _svickaEl('path', { 'class': 'svp-vosk', d: 'M' + (k.x - 1.2) + ',' + (y + 2) + ' C' + (k.x - 1) + ',' + (y + d * .5) + ' ' + (k.x - 1.4) + ',' + (y + d * .8) + ' ' + (k.x - 1.3) + ',' + (y + d)
        + ' A' + (1.1 + .9 * v) + ',' + (1.3 + v) + ' 0 1 0 ' + (k.x + 1.3) + ',' + (y + d) + ' C' + (k.x + 1.2) + ',' + (y + d * .7) + ' ' + (k.x + .9) + ',' + (y + d * .4) + ' ' + (k.x + 1.1) + ',' + (y + 2) }, voskySv);
    });
    if (S.delka >= 1) {   // podložka a kaluž: do 70 % dohoření doroste k okraji, pak přetéká přes hranu (kapky ne na samých koncích)
      var py = SDNO + 1.5, okraj = 5.5, r = Math.min(1, S.p / 0.7), sir = (SX1 - SX0) / 2 + 1 + r * (okraj - .5), sx = (SX0 + SX1) / 2;
      podlozka.setAttribute('d', 'M' + (SX0 - okraj) + ',' + py + ' L' + (SX1 + okraj) + ',' + py);
      kaluz.setAttribute('d', r < .02 ? '' : 'M' + (sx - sir) + ',' + py + ' C' + (sx - sir + 1) + ',' + (py - 1.6 - r) + ' ' + (sx + sir - 1) + ',' + (py - 1.6 - r) + ' ' + (sx + sir) + ',' + py + ' Z');
      [[SX1 + okraj - 1.6, 0.6, 12], [SX0 - okraj + 2.2, 0.7, 9], [SX1 + okraj - 5, 0.8, 7], [SX0 - okraj + 6, 0.88, 5]].forEach(function (pr) {
        var q = (S.p - pr[1]) / 0.22; if (q <= 0) return; q = Math.min(1, q);
        var d = pr[2] * q, x = pr[0], kr = 1 + .9 * q;
        _svickaEl('path', { 'class': 'svp-vosk', d: 'M' + (x - 1.3) + ',' + py + ' C' + (x - 1.1) + ',' + (py + d * .6) + ' ' + (x - 1.2) + ',' + (py + d) + ' ' + (x - .8) + ',' + (py + d)
          + ' A' + kr + ',' + (kr * 1.2) + ' 0 1 0 ' + (x + 1) + ',' + (py + d) + ' C' + (x + .9) + ',' + (py + d * .5) + ' ' + (x + .7) + ',' + (py + 1) + ' ' + (x + 1.1) + ',' + py }, pretok);
      });
    } else { podlozka.setAttribute('d', ''); kaluz.setAttribute('d', ''); }
    aria();
    return roste;
  }
  function kresli() {
    if (svisla) return kresliSvisle();
    var xs = x0 + L * S.p, k = yt + vy / 2, nyni = performance.now(), roste = false, tvori = S.stav === 'tvori' || S.stav === 'dotvari';
    telo.setAttribute('d', x1 - xs < 0.5 ? '' : 'M' + xs + ',' + yt + ' L' + x1 + ',' + yt + ' L' + x1 + ',' + yb + ' L' + xs + ',' + yb);
    lesk.setAttribute('d', x1 - xs < 6 ? '' : 'M' + (xs + 3) + ',' + (yt + 2.2) + ' L' + (x1 - 3) + ',' + (yt + 2.2));
    krater.setAttribute('d', x1 - xs < 0.5 ? '' : 'M' + xs + ',' + yt + ' C' + (xs + 2.5) + ',' + (yt + 2) + ' ' + (xs + 2.5) + ',' + (yb - 2) + ' ' + xs + ',' + yb);
    knot.setAttribute('d', 'M' + (xs + 1) + ',' + k + ' L' + (xs - 3.5) + ',' + (k - 1.6));
    var tr = 'translate(' + (xs - 4) + ',' + (k - 2) + ')';
    plamen.setAttribute('transform', tr);
    jiskra.setAttribute('transform', tr + (S.js ? ' scale(' + S.js + ') rotate(' + S.jr + ')' : ''));
    kour.setAttribute('transform', tr + ' translate(0,' + (S.ky - 2) + ')');
    hrana.setAttribute('d', tvori || xs - x0 < 0.5 ? '' : 'M' + x0 + ',' + yb + ' L' + xs + ',' + yb);   // tvořící se svíčka nemá odhořelou část
    while (ramp.firstChild) ramp.removeChild(ramp.firstChild);
    kapky.forEach(function (r) {
      var x = x0 + L * r.q;
      if (tvori || x > xs - 2) { r.t0 = null; return; }   // ještě neodhořelo (nebo posun zpět svíčku doplnil, nebo se tvoří) → vosk tu není
      if (r.t0 === null) r.t0 = nyni + 300;               // vosk začne stékat chvilku po odhoření
      var v = r.zpet !== null ? r.zpet : Math.max(0, Math.min(1, (nyni - r.t0) / r.dur));
      if (r.zpet === null && v < 1) roste = true;
      var d = r.max * v; if (d < 0.3) return;
      _svickaEl('path', { d: 'M' + (x - r.w) + ',' + yb + ' C' + (x - r.w * 0.6) + ',' + (yb + d * 0.6) + ' ' + (x - 0.2) + ',' + (yb + d) + ' ' + x + ',' + (yb + d)
        + ' C' + (x + 0.3) + ',' + (yb + d) + ' ' + (x + r.w * 0.5) + ',' + (yb + d * 0.5) + ' ' + (x + r.w * 0.8) + ',' + yb }, ramp);
    });
    aria();
    return roste;
  }
  function smycka() {
    if (!S.bezi) return;
    if (S.stav === 'hori' && !S.tah && delka()) S.p = Math.min(1, a.currentTime / delka());
    if (S.stav === 'tvori') S.p = tvorP(performance.now() - S.tv0);
    var roste = kresli();
    if (S.stav === 'hori' || S.stav === 'zapaluje' || S.stav === 'zhasina' || S.stav === 'tvori' || S.stav === 'roste' || roste) requestAnimationFrame(smycka); else S.bezi = false;
  }
  function spust() { if (!S.bezi) { S.bezi = true; requestAnimationFrame(smycka); } }
  function zastavAnim() { if (S.zrusAnim) { S.zrusAnim(); S.zrusAnim = null; } clearTimeout(S.casovac); }
  function zhasniNotu() { nota.classList.remove('hraje'); nota.setAttribute('aria-pressed', 'false'); }
  function celaZnovu() {   // svíčka celá, bez vosku a plamene (nová stopa, konec dohoření, vyprázdnění); svislá zmizí úplně
    zastavAnim(); S.p = 0; S.js = null; S.ky = 0; S.stav = 'klid';
    if (svisla) { S.delka = 0; svg.style.opacity = ''; kapkySv.concat(predni).forEach(function (k) { k.t0 = null; }); }
    kapky.forEach(function (r) { r.t0 = null; r.zpet = null; });
    plamen.setAttribute('opacity', 0); jiskra.setAttribute('opacity', 0); kour.style.opacity = 0;
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
  function sfoukni() {   // plamen zhasne a vzletí kouřek
    plamen.setAttribute('opacity', 0); S.stav = 'klid'; spust();
    S.zrusAnim = _svickaAnim(1100, function (q) { kour.style.opacity = (q < 0.2 ? q / 0.2 : (1 - q) / 0.8) * 0.7; S.ky = -q * 6; kresli(); },
      function () { S.zrusAnim = null; kour.style.opacity = 0; S.ky = 0; kresli(); });
  }
  function dohor() {   // dohořelo: 3 s jen vosk, pak se za ~1,8 s z vosku složí celá (zprava doleva zpátky ke knotu)
    zastavAnim(); S.stav = 'dohorela'; S.p = 1; plamen.setAttribute('opacity', 0); zhasniNotu(); kresli();
    if (svisla) {   // svislá: 2,5 s oharek a kaluž (je vidět konec), pak se rozplyne
      S.casovac = setTimeout(function () {
        S.zrusAnim = _svickaAnim(700, function (q) { svg.style.opacity = 1 - q; }, function () { S.zrusAnim = null; celaZnovu(); a.currentTime = 0; kresli(); });
      }, _svickaKlid() ? 0 : 2500);
      return;
    }
    S.casovac = setTimeout(function () {
      S.zrusAnim = _svickaAnim(1800, function (q) { S.p = 1 - q; kapky.forEach(function (r) { r.zpet = 1 - q; }); kresli(); },
        function () { S.zrusAnim = null; celaZnovu(); a.currentTime = 0; });
    }, _svickaKlid() ? 0 : 3000);
  }
  // Čekání na hlas (owner 2026-10-29: „při všech čekáních na model by mělo jít vidět, že se něco děje… svíčka by se mohla zvětšovat jako
  // nahrávání“; 2026-10-30 „10. ok“): svíčka roste od konce ke knotu — napřed rychle, pak čím dál pomaleji a sama se nikdy nedotvoří,
  // protože appka neví, kolik zbývá (server pošle hlas až celý). Za 6 s je ~58 %, za 12 s ~80 %, strop 92 %. Dorazí-li zvuk, dotvoří se
  // za 0,6 s a jiskra na knotu dvakrát blikne — výzva „ťukni na notu“. Při tvoření žádný vosk ani okraj odhořelé části.
  function tvorP(ms) { return 1 - 0.92 * (1 - Math.exp(-ms / 6000)); }
  function tvor() {
    if (svisla) { celaZnovu(); return; }   // svislá (rituál, návod) má nahrávku u appky — nečeká se
    celaZnovu(); S.stav = 'tvori'; S.tv0 = performance.now(); S.p = 1; kresli(); spust();
  }
  function hotovo() {   // zvuk dorazil: dotvořit z místa, kde svíčka je; nebyla-li ve tvoření, prostě celá (jako reset)
    if (S.stav !== 'tvori') { celaZnovu(); return; }
    zastavAnim(); S.stav = 'dotvari'; var p0 = S.p;
    S.zrusAnim = _svickaAnim(600, function (q) { S.p = p0 * Math.pow(1 - q, 2); kresli(); }, function () {
      S.p = 0; S.stav = 'klid'; kresli();
      S.zrusAnim = _svickaAnim(1400, function (q) {
        var b = Math.sin(Math.PI * ((q * 2) % 1)); S.js = (0.3 + b * 0.9).toFixed(3); S.jr = (q * 90).toFixed(1); jiskra.setAttribute('opacity', b); kresli();
      }, function () { S.zrusAnim = null; S.js = null; jiskra.setAttribute('opacity', 0); kresli(); });
    });
  }
  function ztisOstatni() {
    for (var k in _SVICKY) { var o = _SVICKY[k]; if (o !== api && !o.a.paused) { o.ztis(); } }
  }
  function hraj() {
    if (!a.getAttribute('src') || S.stav === 'zapaluje' || S.stav === 'roste') return;
    rozmer();
    if (S.stav === 'dohorela') { celaZnovu(); a.currentTime = 0; }
    if (S.stav === 'dotvari') { zastavAnim(); S.p = 0; S.js = null; jiskra.setAttribute('opacity', 0); }   // ťuknutí ještě při dotváření
    ztisOstatni();
    zastavAnim(); kour.style.opacity = 0;
    nota.classList.add('hraje'); nota.setAttribute('aria-pressed', 'true');
    var zapalit = function () {
      zapal(function () {
        S.stav = 'hori'; spust();
        // prohlížeč přehrání odmítl (bez gesta, chyba zvuku) → zpátky do klidu; svislá svíčka, která ještě nehořela, zase zmizí
        var pr = a.play(); if (pr && pr.catch) pr.catch(function () { plamen.setAttribute('opacity', 0); S.stav = 'klid'; zhasniNotu(); if (svisla && !a.currentTime) S.delka = 0; kresli(); });
      });
    };
    if (svisla && S.delka < 1) {   // svislá: napřed se od knotu dolů vytáhne (0,9 s), pak ji jiskra zapálí
      S.stav = 'roste'; S.p = 0; svg.style.opacity = ''; spust();
      S.zrusAnim = _svickaAnim(900, function (q) { S.delka = 1 - Math.pow(1 - q, 3); }, function () { S.zrusAnim = null; S.delka = 1; zapalit(); });
      return;
    }
    zapalit();
  }
  function posun(nq) {   // posun na místo svíčky: zvuk i svíčka tam (dozadu svíčka doroste, dopředu odhoří)
    var dl = delka(); if (!dl) return;
    nq = Math.max(0, Math.min(1, nq));
    if (svisla && S.delka < 1) return;   // ještě nevytažená svíčka se posouvat nedá
    if (S.stav === 'dohorela') { zastavAnim(); svg.style.opacity = ''; kapky.forEach(function (r) { r.zpet = null; r.t0 = null; }); S.stav = 'klid'; }
    if (svisla) kapkySv.concat(predni).forEach(function (k) { if (k.kdy > nq) k.t0 = null; });
    S.p = nq; a.currentTime = Math.min(nq * dl, Math.max(0, dl - 0.05));
    kresli(); spust();
  }
  function qZBodu(e) { var r = svg.getBoundingClientRect();
    if (svisla) return ((e.clientY - r.top) * SH / r.height - STOP) / (SDNO - OHAREK - STOP);
    return ((e.clientX - r.left) * W / r.width - x0) / L; }

  function naPlay() {
    ztisOstatni(); rozmer(); zamcena(); zamcenaStav(true); zamcenaPoloha();
    if (svisla && S.delka < 1) { S.delka = 1; svg.style.opacity = ''; }   // spuštění zvenku (zamčená obrazovka): svíčka hned celá
    if (S.stav !== 'zapaluje') { S.stav = 'hori'; plamen.setAttribute('opacity', 1); }   // spuštění zvenku (autoplay deníku)
    nota.classList.add('hraje'); nota.setAttribute('aria-pressed', 'true'); spust();
  }
  function naPause() {
    zamcenaStav(false);
    if (a.ended || S.stav === 'dohorela') return;
    zhasniNotu(); zastavAnim();
    if (S.tise || _svickaKlid()) { S.tise = false; plamen.setAttribute('opacity', 0); S.stav = 'klid'; kresli(); return; }
    sfoukni();
  }
  function naCas() { if (!S.tah && S.stav !== 'dohorela' && S.stav !== 'hori' && delka()) { S.p = Math.min(1, a.currentTime / delka()); kresli(); } }
  function naDelku() { if (dr) dr.textContent = _svickaCas(delka()); rozmer(); vosk(); kresli(); }
  function naPrazdno() { if (dr) dr.textContent = '0:00'; if (S.stav !== 'tvori' && S.stav !== 'dotvari') celaZnovu(); }   // nový zvuk při dotváření
  function naKonec() { dohor(); }
  function naNotu() { if (!a.paused) a.pause(); else hraj(); }
  function naDolu(e) {
    if (!delka() || (svisla && S.delka < 1)) return; rozmer();
    S.tah = true; try { svg.setPointerCapture(e.pointerId); } catch (x) {} posun(qZBodu(e)); e.preventDefault(); }
  function naTah(e) { if (S.tah) posun(qZBodu(e)); }
  function naNahoru() { S.tah = false; }
  function naKlavesu(e) {
    var dl = delka(); if (!dl) return;
    var krok = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5, PageUp: dl / 10, PageDown: -dl / 10 }[e.key];
    if (krok !== undefined) posun((a.currentTime + krok) / dl); else if (e.key === 'Home') posun(0); else if (e.key === 'End') posun(1); else return;
    e.preventDefault();
  }
  var udalosti = [[a, 'play', naPlay], [a, 'pause', naPause], [a, 'timeupdate', naCas], [a, 'seeked', naCas], [a, 'seeked', zamcenaPoloha], [a, 'loadedmetadata', naDelku],
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
    nazev: function (n, runa) { S.nazev = n || ''; S.runa = runa || null; },
    reset: celaZnovu,
    tvor: tvor,
    hotovo: hotovo,
    ztis: function () { S.tise = true; a.pause(); },
    zrus: function () { zastavAnim(); S.bezi = false; udalosti.forEach(function (u) { u[0].removeEventListener(u[1], u[2]); });
      if (ro) ro.disconnect(); else window.removeEventListener('resize', prekresli); if (_SVICKY[prefix] === api) delete _SVICKY[prefix]; },
    _stav: function () { return { p: S.p, stav: S.stav, delka: S.delka, W: W, x0: x0, x1: x1, rampouchu: kapky.length,
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
function svickaNazev(prefix, nazev, runa) { var s = _SVICKY[prefix]; if (s) s.nazev(nazev, runa); }   // název (a runa) na zamčené obrazovce — text/objekt nebo funkce
// Přepnutí záložky zastaví hlas (owner 2026-10-29 „má se zastavit“): svíčka mizí z očí, hlas by mluvil dál bez ovládání. Bez poryvu.
function svickaZtisVse() { for (var k in _SVICKY) { var s = _SVICKY[k]; if (s && s.a && !s.a.paused) s.ztis(); } }
function svickaReset(prefix) { var s = _SVICKY[prefix]; if (s) s.reset(); }
function svickaZtis(prefix) { var s = _SVICKY[prefix]; if (s && s.a && !s.a.paused) s.ztis(); }   // tiché zastavení (smotaný papír)
function svickaTvor(prefix) { var s = _SVICKY[prefix]; if (s) s.tvor(); }       // čekání na hlas: svíčka se tvoří
function svickaHotovo(prefix) { var s = _SVICKY[prefix]; if (s) s.hotovo(); }   // hlas dorazil (src nastavený): dotvoří se a jiskra blikne
function svickaStop(prefix) {   // zastavit a vyprázdnit (nové čtení, jiný jazyk); removeAttribute + load(), ne src='' (viz svickaHtml)
  var a = document.getElementById(prefix + '-a'), s = _SVICKY[prefix];
  if (s && a && !a.paused) s.ztis();
  if (a) { a.removeAttribute('src'); a.load(); }
  if (s) s.reset();
}
