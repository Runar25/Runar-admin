// Složí náhled starého svitku a kouře kadidla do JEDNOHO souboru: písma appky, text návodu z UI_TEXT (EN), nahrávka návodu z v2/audio
// a kresba kadidla z appky (runar-reading.js, #card1-ikona) — owner náhledy otevírá ve svém prohlížeči, bez serveru.
//   node docs/inbox/2026-10-30-svitek-stary.build.js
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const D = __dirname, V2 = path.join(D, '..', '..', 'v2');
let html = fs.readFileSync(path.join(D, '2026-10-30-svitek-stary.src.html'), 'utf8');
const vloz = (kotva, co, n) => { if (html.split(kotva).length !== (n || 1) + 1) throw new Error('kotva není ' + (n || 1) + '×: ' + kotva); html = html.split(kotva).join(co); };
const fonty = fs.readFileSync(path.join(V2, 'fonts', 'fonts.css'), 'utf8')
  .replace(/url\(([^)]+\.woff2)\)/g, (m, f) => 'url(data:font/woff2;base64,' + fs.readFileSync(path.join(V2, 'fonts', f)).toString('base64') + ')');
vloz('<link rel="stylesheet" href="../../v2/fonts/fonts.css">', '<style>\n' + fonty + '\n</style>');
const S = {}; S.window = S; vm.createContext(S);
vm.runInContext(fs.readFileSync(path.join(V2, 'runar-translations.js'), 'utf8') + ';this.U=UI_TEXT', S);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
vloz('<!--NAVOD_EN-->', S.U.en.guide_lines.map((r) => '<p>' + esc(r) + '</p>').join(''));
vloz('<!--AUDIO_EN-->', 'data:audio/mpeg;base64,' + fs.readFileSync(path.join(V2, 'audio', 'navod_en.mp3')).toString('base64'));
// kadidlo: tyčinka a podstavec z appky beze změny; dnešní dva obláčky = „klidná“ ikona, při zapálení je vystřídá jeden proud
const rd = fs.readFileSync(path.join(V2, 'runar-reading.js'), 'utf8');
const k = rd.match(/<path d="M12 21v-6"\/><path d="M10 21h4"\/>'\s*\+\s*'(<path d="M12 13[^']*)<\/svg>/);
if (!k) throw new Error('kresba kadidla v runar-reading.js nenalezena');
const obl = k[1].replace(/<path /g, '<path class="klidny" ');
vloz('<!--KADIDLO-->', '<path d="M12 21v-6"/><path d="M10 21h4"/>' + obl + '<circle class="zhava" cx="12" cy="14.7" r="1.1"/>'
  + '<path class="proud" d="M12 14.2c-1.6-2.5 1.6-4.4 0-6.9c-1.6-2.5 1.2-3.9 0-6.1"/>', 2);
const out = path.join(D, '2026-10-30-svitek-stary.html');
fs.writeFileSync(out, html);
console.log('zapsáno', out, Math.round(html.length / 1024) + ' kB', '· odkazů ven:', (html.match(/(href|src)="(?!data:|#)[^"]+"/g) || []).length);
