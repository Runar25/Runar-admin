// Rúnakort — kresba karty (CODE-web 2026-10-20). JEDINÉ místo, kde web skládá kartu: stránka karty /kort/ i stránka cesty.
// Vzhled bydlí v runakort.css. Potřebuje z appky: runar-config.js (CARD_PACKS, cardPackName), runar-runes.js (RUNES),
// runar-translations.js + runar-utils.js (VOCAB, vn, runeSvg), runar-svgs.js. Nové věty jen tady v RK_TXT.

// Vzhledy karty = data; nový vzhled = nový klíč + jeho pravidla rk-<klíč> v runakort.css (owner 2026-10-19: další přibudou).
// art = líc s postavou (rozložení rk-l2 v runakort.css). w = zimní slunovrat (owner 2026-10-20), IS „Vetur“ = zima.
var RK_DESIGNS = { o: { is: 'Svart', en: 'Black' }, f: { is: 'Hvítt', en: 'White', art: true }, w: { is: 'Vetur', en: 'Winter', art: true } };
var RK_TXT = {
  steps: { is: ['Skannaðu QR kóðann', 'Skráðu þig inn', 'Sláðu inn kóðann'], en: ['Scan the QR code', 'Sign in', 'Enter the code'] },
  // věta o kartě (stránka cesty, domovská stránka); IS ověřena 2026-10-19: Greynir OK, „rennur aldrei út“ 37×, „kaupa handa“ 2957×
  note:  { en: 'No subscription, and the card never expires. Buy it for yourself, or give it to someone.',
           is: 'Engin áskrift og kortið rennur aldrei út. Kauptu það handa þér eða gefðu það öðrum.' }
};

// Kámen na líci = runa z předpony kódu (shrine dává předponu podle runy); bez kódu nebo obecný RUNAR → ᚱ Raidho. Naše kresba, frame:true (§5).
function rkRune(code) {
  var pre = String(code || '').split('-')[0];
  return RUNES.filter(function (r) { return r.n.toUpperCase() === pre; })[0] || RUNES.filter(function (r) { return r.svg === 'Raidho'; })[0];
}
// Řádek balíčku na líci: „Leitandi · 10 spár“ (jméno jen když počet odpovídá balíčku v CARD_PACKS)
function rkPackLine(credits, lang) {
  if (!credits) return '';
  var pk = CARD_PACKS.filter(function (p) { return p.credits === credits; })[0];
  return (pk ? cardPackName(pk, lang) + ' · ' : '') + vn('cast', credits, lang);
}
// Líc karty. o = { design: 'o'|'f', lang, credits, code }
function rkFront(o) {
  var d = RK_DESIGNS[o.design] ? o.design : 'o';
  var stone = '<div class="rk-stone">' + runeSvg(rkRune(o.code), { frame: true }) + '</div>';
  var txt = '<div class="rk-t"><div class="rk-n">RÚNAR</div><div class="rk-s">' + VOCAB.card[o.lang].toUpperCase() + '</div><div class="rk-q">'
    + rkPackLine(o.credits, o.lang) + '</div></div>';
  return RK_DESIGNS[d].art
    ? '<div class="rk-card rk-' + d + ' rk-l2 rk-front"><div class="rk-art"></div>' + txt + stone + '<div class="rk-brand">AGNDOFA</div></div>'
    : '<div class="rk-card rk-o rk-front">' + stone + txt + '<div class="rk-brand">AGNDOFA</div></div>';
}
// Rub karty. o = { design, lang, code, qr } — qr = hotové SVG (stránka karty ho kreslí z kódu)
function rkBack(o) {
  var d = RK_DESIGNS[o.design] ? o.design : 'o';
  var steps = RK_TXT.steps[o.lang].map(function (s, i) { return '<li><span>' + (i + 1) + '</span>' + s + '</li>'; }).join('');
  return '<div class="rk-card rk-' + d + ' rk-back"><ol>' + steps + '</ol><div class="rk-qr">' + (o.qr || '') + '</div>'
    + '<div class="rk-foot"><span class="rk-code">' + (o.code || '') + '</span><span class="rk-url">THERUNEKEEPER.COM</span></div></div>';
}
