// Složí náhled přehrávače svíčka do JEDNOHO souboru: písma appky (woff2 jako data URI) a zvuk rituálu (mp3 jako data URI) uvnitř.
// Proč: owner náhledy otevírá ve svém prohlížeči a stránka s odkazy ven se mu ukázala bez stylů (2026-10-28) / bez zvuku (2026-10-29).
//   node docs/inbox/2026-10-29-prehravac-svicka.build.js
'use strict';
const fs = require('fs'), path = require('path');
const D = __dirname, V2 = path.join(D, '..', '..', 'v2');
let html = fs.readFileSync(path.join(D, '2026-10-29-prehravac-svicka.src.html'), 'utf8');
const fonts = fs.readFileSync(path.join(V2, 'fonts', 'fonts.css'), 'utf8')
  .replace(/url\(([^)]+\.woff2)\)/g, (m, f) => 'url(data:font/woff2;base64,' + fs.readFileSync(path.join(V2, 'fonts', f)).toString('base64') + ')');
const a1 = '<link rel="stylesheet" href="../../v2/fonts/fonts.css">', a2 = 'src="../../v2/audio/ritual_en.mp3"';
if (!html.includes(a1) || !html.includes(a2)) throw new Error('odkazy na písma / zvuk ve zdroji nenalezeny');
html = html.replace(a1, '<style>\n' + fonts + '\n</style>')
  .replace(a2, 'src="data:audio/mpeg;base64,' + fs.readFileSync(path.join(V2, 'audio', 'ritual_en.mp3')).toString('base64') + '"');
const out = path.join(D, '2026-10-29-prehravac-svicka.html');
fs.writeFileSync(out, html);
console.log('zapsáno', out, Math.round(html.length / 1024) + ' kB', '· odkazů ven (href/src na soubor):', (html.match(/(href|src)="(?!data:|#)[^"]+"/g) || []).length);
