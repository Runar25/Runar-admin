// Složí náhled pírka a symbolů do JEDNOHO souboru: písma appky jako data URI, kresbu pírka z runar-utils.js a jeho CSS z runar-reader.css
// (náhled = appka, žádná kopie). Owner náhledy otevírá ve svém prohlížeči.
//   node docs/inbox/2026-10-30-pirko-a-symboly.build.js
'use strict';
const fs = require('fs'), path = require('path');
const D = __dirname, V2 = path.join(D, '..', '..', 'v2');
let html = fs.readFileSync(path.join(D, '2026-10-30-pirko-a-symboly.src.html'), 'utf8');
const vloz = (kotva, co) => { if (html.split(kotva).length !== 2) throw new Error('kotva není právě jednou: ' + kotva); html = html.split(kotva).join(co); };
const fonty = fs.readFileSync(path.join(V2, 'fonts', 'fonts.css'), 'utf8')
  .replace(/url\(([^)]+\.woff2)\)/g, (m, f) => 'url(data:font/woff2;base64,' + fs.readFileSync(path.join(V2, 'fonts', f)).toString('base64') + ')');
vloz('<link rel="stylesheet" href="../../v2/fonts/fonts.css">', '<style>\n' + fonty + '\n</style>');
const css = fs.readFileSync(path.join(V2, 'runar-reader.css'), 'utf8');
const pravidla = css.match(/^\.myslenka-pero\{[\s\S]*?\}\s*$|^@keyframes peroPada\{[\s\S]*?\}\}\s*$|^@media \(prefers-reduced-motion:reduce\)\{\.myslenka-pero\{animation:none;\}\}\s*$/gm);
if (!pravidla || pravidla.length < 4) throw new Error('CSS pírka v runar-reader.css nenalezeno celé (' + (pravidla || []).length + ')');
vloz('/*PIRKO_CSS*/', pravidla.join('\n'));
const utils = fs.readFileSync(path.join(V2, 'runar-utils.js'), 'utf8');
const fn = utils.match(/function myslenkaSvg\(\) \{[\s\S]*?\n\}/);
if (!fn) throw new Error('myslenkaSvg v runar-utils.js nenalezena');
vloz('<!--PIRKO_SVG-->', new Function(fn[0] + '; return myslenkaSvg();')());
const out = path.join(D, '2026-10-30-pirko-a-symboly.html');
fs.writeFileSync(out, html);
console.log('zapsáno', out, Math.round(html.length / 1024) + ' kB', '· pravidel CSS pírka:', pravidla.length, '· odkazů ven:', (html.match(/(href|src)="(?!data:|#)[^"]+"/g) || []).length);
