// Složí náhled velkého svitku, svislé svíčky a kadidla do JEDNOHO souboru: písma appky, text návodu z UI_TEXT (EN) a nahrávka návodu
// z v2/audio jako data URI — owner náhledy otevírá ve svém prohlížeči, bez serveru.
//   node docs/inbox/2026-10-30-svitek-svice-kadidlo.build.js
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const D = __dirname, V2 = path.join(D, '..', '..', 'v2');
let html = fs.readFileSync(path.join(D, '2026-10-30-svitek-svice-kadidlo.src.html'), 'utf8');
const vloz = (kotva, co) => { if (html.split(kotva).length !== 2) throw new Error('kotva není právě jednou: ' + kotva); html = html.split(kotva).join(co); };
const fonty = fs.readFileSync(path.join(V2, 'fonts', 'fonts.css'), 'utf8')
  .replace(/url\(([^)]+\.woff2)\)/g, (m, f) => 'url(data:font/woff2;base64,' + fs.readFileSync(path.join(V2, 'fonts', f)).toString('base64') + ')');
vloz('<link rel="stylesheet" href="../../v2/fonts/fonts.css">', '<style>\n' + fonty + '\n</style>');
const S = {}; S.window = S; vm.createContext(S);
vm.runInContext(fs.readFileSync(path.join(V2, 'runar-translations.js'), 'utf8') + ';this.U=UI_TEXT', S);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
vloz('<!--NAVOD_EN-->', S.U.en.guide_lines.map((r) => '<p>' + esc(r) + '</p>').join(''));
vloz('<!--AUDIO_EN-->', 'data:audio/mpeg;base64,' + fs.readFileSync(path.join(V2, 'audio', 'navod_en.mp3')).toString('base64'));
const out = path.join(D, '2026-10-30-svitek-svice-kadidlo.html');
fs.writeFileSync(out, html);
console.log('zapsáno', out, Math.round(html.length / 1024) + ' kB', '· odkazů ven:', (html.match(/(href|src)="(?!data:|#)[^"]+"/g) || []).length);
