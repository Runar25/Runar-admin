// Složí čtvrtý náhled (papír místo svitku, svíčka s kaluží) a svislého kouře kadidla do JEDNOHO souboru: písma appky, text návodu z UI_TEXT (EN),
// nahrávka návodu z v2/audio a kresba kadidla z appky (runar-reading.js, #card1-ikona). Owner ho otevírá ve svém prohlížeči.
//   node docs/inbox/2026-10-30-papir.build.js
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const D = __dirname, V2 = path.join(D, '..', '..', 'v2');
let html = fs.readFileSync(path.join(D, '2026-10-30-papir.src.html'), 'utf8');
const vloz = (kotva, co, n) => { if (html.split(kotva).length !== (n || 1) + 1) throw new Error('kotva není ' + (n || 1) + '×: ' + kotva); html = html.split(kotva).join(co); };
const fonty = fs.readFileSync(path.join(V2, 'fonts', 'fonts.css'), 'utf8')
  .replace(/url\(([^)]+\.woff2)\)/g, (m, f) => 'url(data:font/woff2;base64,' + fs.readFileSync(path.join(V2, 'fonts', f)).toString('base64') + ')');
vloz('<link rel="stylesheet" href="../../v2/fonts/fonts.css">', '<style>\n' + fonty + '\n</style>');
const S = {}; S.window = S; vm.createContext(S);
vm.runInContext(fs.readFileSync(path.join(V2, 'runar-translations.js'), 'utf8') + ';this.U=UI_TEXT', S);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
vloz('<!--NAVOD_EN-->', S.U.en.guide_lines.map((r) => '<p>' + esc(r) + '</p>').join(''));
vloz('<!--AUDIO_EN-->', 'data:audio/mpeg;base64,' + fs.readFileSync(path.join(V2, 'audio', 'navod_en.mp3')).toString('base64'));
// kadidlo: tyčinka a podstavec z appky beze změny; dnešní obláčky = klidná ikona; při zapálení měkký rozptýlený kouř (4 pramínky, rozostřené)
const rd = fs.readFileSync(path.join(V2, 'runar-reading.js'), 'utf8');
const k = rd.match(/<path d="M12 21v-6"\/><path d="M10 21h4"\/>'\s*\+\s*'(<path d="M12 13[^']*)<\/svg>/);
if (!k) throw new Error('kresba kadidla v runar-reading.js nenalezena');
const obl = k[1].replace(/<path /g, '<path class="klidny" ');
// kouř (pramínky, žár, klidné obláčky) — jeden kus, posouvá se na konec, kde dané kadidlo hoří (původně konec tyčinky v 12,14)
const KOUR = obl + '<circle class="zhava" cx="12" cy="14.7" r="1.1"/>'
  + '<path pathLength="100" class="dym d1" d="M12 14C11.7 10.5 12 7 12.6 4C13.2 1 14.4 -2 16 -5.5"/><path pathLength="100" class="dym d2" d="M12 14C11.6 10 12.4 6.5 13.6 4C15.2 1 19.5 -2 28 -4.5"/>'
  + '<path pathLength="100" class="dym d3" d="M12 14C12.4 10 14 7 16.4 5C19.5 2.6 25 1.8 35 1"/>';
const kadidlo = (telo, x, y) => telo + '<g transform="translate(' + (x - 12) + ' ' + (y - 14) + ')">' + KOUR + '</g>';
vloz('<!--KADIDLO-->', kadidlo('<path d="M12 21v-6"/><path d="M10 21h4"/>', 12, 14), 2);
// návrhy tvaru: [jméno, popis, kresba, konec x, konec y]
const VARIANTY = [
  ['K0 · Dnes — tyčinka s podstavcem', 'Pro srovnání.', '<path d="M12 21v-6"/><path d="M10 21h4"/>', 12, 14],
  ['K1 · Tyčinka šikmo v misce', 'Tyčinka zapíchnutá šikmo v nízké misce s popelem. Nejznámější podoba kadidla, čitelná i malá.',
    '<path d="M5.5 17h13"/><path d="M6.5 17c.6 2.4 2.7 3.6 5.5 3.6s4.9-1.2 5.5-3.6"/><path d="M10.4 17l5.2-7.6"/>', 15.6, 9.4],
  ['K2 · Kužel na tácku', 'Kadidlový kužel na plochém tácku; hoří špička. Klidný tvar, kouř jde přesně ze středu.',
    '<path d="M6 19.5h12"/><path d="M7.5 19.5c.4.9 1.4 1.3 4.5 1.3s4.1-.4 4.5-1.3"/><path d="M9.6 19.5L12 11.6l2.4 7.9"/>', 12, 11.6],
  ['K3 · Tyčinka v kameni', 'Tyčinka zapíchnutá v kameni, jaký mají naše runy. Spojuje rituál s kameny v tahu.',
    '<path d="M7.6 20.4c-.6-2.6.4-4.6 2.4-5.2h4c2 .6 3 2.6 2.4 5.2z"/><path d="M12 15.2V8.4"/>', 12, 8.4],
  ['K4 · Miska s pryskyřicí', 'Mělká kamenná miska, v ní žhnoucí kousky pryskyřice. Nejstarší podoba vykuřování; kouř stoupá z misky.',
    '<path d="M5 15.5h14l-1.8 4.3H6.8z"/><path d="M9 15.5c0-1.3.9-2.2 2-2.2"/><path d="M12.6 15.5c0-1.6 1-2.6 2.3-2.6"/>', 12.8, 13],
];
vloz('<!--KAD_VARIANTY-->', VARIANTY.map(([jm, popis, telo, x, y]) => '<div class="kv"><div class="jm">' + jm + '</div>'
  + '<div class="card-lbl"><svg class="ik kad" viewBox="0 0 24 24" aria-hidden="true">' + kadidlo(telo, x, y) + '</svg>BEFORE WE BEGIN +</div>'
  + '<svg class="ik kad velka" viewBox="0 0 24 24" aria-hidden="true">' + kadidlo(telo, x, y) + '</svg><p>' + popis + '</p></div>').join(''));
const out = path.join(D, '2026-10-30-papir.html');
fs.writeFileSync(out, html);
console.log('zapsáno', out, Math.round(html.length / 1024) + ' kB', '· odkazů ven:', (html.match(/(href|src)="(?!data:|#)[^"]+"/g) || []).length);
