// Složí návrh účtu a menu do JEDNOHO souboru bez odkazů ven: styly appky (runar-reader.css) a písma (woff2 jako data URI) vložené dovnitř.
// Proč: první verze odkazovala na ../../v2/*.css a v ownerově prohlížeči souborů se ukázala bez stylů (2026-10-28, „šílený“).
//   node docs/inbox/2026-10-28-ucet-a-menu-navrh.build.js
'use strict';
const fs = require('fs'), path = require('path');
const D = __dirname, V2 = path.join(D, '..', '..', 'v2');
let html = fs.readFileSync(path.join(D, '2026-10-28-ucet-a-menu-navrh.src.html'), 'utf8');
const fonts = fs.readFileSync(path.join(V2, 'fonts', 'fonts.css'), 'utf8')
  .replace(/url\(([^)]+\.woff2)\)/g, (m, f) => 'url(data:font/woff2;base64,' + fs.readFileSync(path.join(V2, 'fonts', f)).toString('base64') + ')');
const css = fs.readFileSync(path.join(V2, 'runar-reader.css'), 'utf8');
const a1 = '<link rel="stylesheet" href="../../v2/fonts/fonts.css">', a2 = '<link rel="stylesheet" href="../../v2/runar-reader.css">';
if (!html.includes(a1) || !html.includes(a2)) throw new Error('odkazy na styly ve zdroji nenalezeny');
html = html.replace(a1, '<style>\n' + fonts + '\n</style>').replace(a2, '<style>\n' + css + '\n</style>');
const out = path.join(D, '2026-10-28-ucet-a-menu-navrh.html');
fs.writeFileSync(out, html);
console.log('zapsáno', out, Math.round(html.length / 1024) + ' kB', '· odkazů ven (href/src na soubor):', (html.match(/(href|src)="(?!data:|#)[^"]+"/g) || []).length);
