// Složí náhled 3 přehrávače svíčka do JEDNOHO souboru se SKUTEČNÝM kódem appky uvnitř: písma, v2/runar-reader.css,
// v2/runar-translations.js, v2/runar-svicka.js a zvuk rituálu (data URI).
// Proč jeden soubor: owner náhledy otevírá ve svém prohlížeči; stránka s odkazy ven se mu ukázala bez stylů (2026-10-28) / bez zvuku (2026-10-29).
// Proč kód appky a ne kopie: náhled má ukázat přesně to, co poběží v appce (§18 — žádná druhá „skoro stejná“ svíčka).
//   node docs/inbox/2026-10-29-prehravac-svicka-3.build.js
'use strict';
const fs = require('fs'), path = require('path');
const D = __dirname, V2 = path.join(D, '..', '..', 'v2');
const cti = (f) => fs.readFileSync(path.join(V2, f), 'utf8');
let html = fs.readFileSync(path.join(D, '2026-10-29-prehravac-svicka-3.src.html'), 'utf8');
const fonty = cti('fonts/fonts.css').replace(/url\(([^)]+\.woff2)\)/g, (m, f) => 'url(data:font/woff2;base64,' + fs.readFileSync(path.join(V2, 'fonts', f)).toString('base64') + ')');
const zvuk = 'data:audio/mpeg;base64,' + fs.readFileSync(path.join(V2, 'audio', 'ritual_en.mp3')).toString('base64');
const skript = (s) => '<script>\n' + s.replace(/<\/script/gi, '<\\/script') + '\n</script>';
const vlozit = {
  '<!--FONTY-->': '<style>\n' + fonty + '\n</style>',
  '<!--CSS-APPKY-->': '<style>\n' + cti('runar-reader.css') + '\n.nahled{position:relative;z-index:1;}\n</style>',
  '<!--AUDIO-->': '<audio id="zdroj-zvuku" preload="none" src="' + zvuk + '"></audio>',
  '<!--JS-PREKLADY-->': skript(cti('runar-translations.js')),
  '<!--JS-SVICKA-->': skript(cti('runar-svicka.js')),
};
for (const [k, v] of Object.entries(vlozit)) {
  if (html.split(k).length !== 2) throw new Error('značka ' + k + ' ve zdroji není právě jednou');
  html = html.split(k).join(v);
}
const out = path.join(D, '2026-10-29-prehravac-svicka-3.html');
fs.writeFileSync(out, html);
console.log('zapsáno', out, Math.round(html.length / 1024) + ' kB', '· odkazů ven (href/src na soubor):', (html.match(/(href|src)="(?!data:|#)[^"]+"/g) || []).length);
