// ─── Značka Rúnara ᚱ jako KRESBA ─────────────────────
// Owner 2026-11-01 (DECISIONS 2026-11-01 (10)): „3. předělat na kresbu“. Do té doby ji appka psala písmem: Cormorant runy nemá, takže
// ᚱ kreslilo písmo systému — na Windows Segoe UI Historic (to R owner chtěl: „tohle R bych chtěl“), jinde jiný tvar nebo prázdný
// čtvereček (týž důvod jako přechod run na SVG 2026-07-13). Geometrie je táž stavba vlastními tahy: kmen + lomená čára, nahoře i dole
// rovně, špičky svisle seříznuté; proporce změřené na Segoe UI Historic, obrysem se od písma liší ve 3,6 % plochy (CODE-web 2026-11-01).
// JEDINÉ místo kresby (§18): appka, nápověda a soukromí ji berou odsud, generátor ikony (scripts/ikona_appky.py) a web ji mají číst odsud.
// Samostatný soubor, ne runar-utils.js: nápověda a soukromí runar-utils.js nenačítají a web ani generátor ikony ho nepotřebují.
// Velikost: inkoust ᚱ písmem = 0,71 em nad účařím (změřeno 2026-11-02 v nápovědě: 34 px při 48 px) → kresba 0,72 em vysoká (viewBox
// má půl jednotky okraje) a sedí na účaří, takže řádek i místo kolem zůstanou jako s písmem. Barva = barva textu (currentColor).
// Ořez má v každé kresbě vlastní id: se stejným id bere prohlížeč první ve stránce, a ten může ležet ve skrytém okně.
// Jednotky: výška 100.
var ZNACKA_R = {
  vb: '-0.5 -0.5 59.6 101',
  orez: 'M0 0 H58.6 V100 H20.3 V30 H11.7 V100 H0 Z',
  tahy: [['M5.85 -2 V102', 11.7], ['M4.12 2.14 L50.1 25.7 L25.3 49.3 L53.8 104', 11]]
};
var _znackaN = 0;
function znackaSvg(opts) {
  opts = opts || {};
  var id = 'znacka-orez-' + (++_znackaN);
  var tahy = ZNACKA_R.tahy.map(function (t) { return '<path d="' + t[0] + '" stroke-width="' + t[1] + '"/>'; }).join('');
  return '<svg class="znacka' + (opts.cls ? ' ' + opts.cls : '') + '" viewBox="' + ZNACKA_R.vb + '" aria-hidden="true" focusable="false"'
    + ' style="height:0.72em;width:0.425em;vertical-align:baseline" xmlns="http://www.w3.org/2000/svg">'
    + '<defs><clipPath id="' + id + '"><path d="' + ZNACKA_R.orez + '"/></clipPath></defs>'
    + '<g clip-path="url(#' + id + ')" fill="none" stroke="' + (opts.barva || 'currentColor') + '" stroke-linejoin="miter" stroke-miterlimit="8">'
    + tahy + '</g></svg>';
}
// Prvky s atributem data-znacka dostanou kresbu při startu stránky (reader, nápověda, soukromí); kód, který značku skládá sám
// (čekání v Asku), volá znackaSvg().
function vyplnZnacky(koren) {
  var els = (koren || document).querySelectorAll('[data-znacka]');
  for (var i = 0; i < els.length; i++) els[i].innerHTML = znackaSvg();
}
if (typeof document !== 'undefined' && document.querySelectorAll) {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { vyplnZnacky(); });
  else vyplnZnacky();
}
