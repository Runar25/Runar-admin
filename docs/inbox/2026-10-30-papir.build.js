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
vloz('<!--KADIDLO-->', '<path d="M12 21v-6"/><path d="M10 21h4"/>' + obl + '<circle class="zhava" cx="12" cy="14.7" r="1.1"/>'
  + '<path pathLength="100" class="dym d1" d="M12 14C11.7 10.5 12 7 12.6 4C13.2 1 14.4 -2 16 -5.5"/><path pathLength="100" class="dym d2" d="M12 14C11.6 10 12.4 6.5 13.6 4C15.2 1 19.5 -2 28 -4.5"/>'
  + '<path pathLength="100" class="dym d3" d="M12 14C12.4 10 14 7 16.4 5C19.5 2.6 25 1.8 35 1"/>', 2);
const out = path.join(D, '2026-10-30-papir.html');
fs.writeFileSync(out, html);
console.log('zapsáno', out, Math.round(html.length / 1024) + ' kB', '· odkazů ven:', (html.match(/(href|src)="(?!data:|#)[^"]+"/g) || []).length);
