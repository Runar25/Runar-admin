// Složí náhled symbolu myšlenky do JEDNOHO souboru (písma appky jako data URI) — owner náhledy otevírá ve svém prohlížeči.
//   node docs/inbox/2026-10-29-symbol-myslenky.build.js
'use strict';
const fs = require('fs'), path = require('path');
const D = __dirname, V2 = path.join(D, '..', '..', 'v2');
let html = fs.readFileSync(path.join(D, '2026-10-29-symbol-myslenky.src.html'), 'utf8');
const fonty = fs.readFileSync(path.join(V2, 'fonts', 'fonts.css'), 'utf8')
  .replace(/url\(([^)]+\.woff2)\)/g, (m, f) => 'url(data:font/woff2;base64,' + fs.readFileSync(path.join(V2, 'fonts', f)).toString('base64') + ')');
const a = '<link rel="stylesheet" href="../../v2/fonts/fonts.css">';
if (html.split(a).length !== 2) throw new Error('odkaz na písma ve zdroji není právě jednou');
html = html.split(a).join('<style>\n' + fonty + '\n</style>');
const out = path.join(D, '2026-10-29-symbol-myslenky.html');
fs.writeFileSync(out, html);
console.log('zapsáno', out, Math.round(html.length / 1024) + ' kB', '· odkazů ven:', (html.match(/(href|src)="(?!data:|#)[^"]+"/g) || []).length);
