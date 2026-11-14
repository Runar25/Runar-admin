// Lab 2026-11-14 (2): tři způsoby, jak solu bez přemýšlení říct POSTUP místo zákazů. Nic nevolá.
// Systém = produkce beze změny. Zadání se staví znovu z dat, která vytáhne z produkčního zadání (obraz, stránka runy,
// začátek věty o významu, otázka runy) — takže obraz i los jsou tytéž jako ve variantě A z první zkoušky (seed 1154).
// Proč tři: owner 2026-11-14 „napiš 3 varianty, jak to modelu napsat … nevíme, která je správná“. Podklad k tomu, co model bez
// přemýšlení umí: zdroj-bez-premysleni-2026-11-14.md (píše na jeden průchod; plánovat umí jen to, co napíše do výstupu).
//   P1 = recept po větách (scéna → o co v ní jde → význam → dvě možnosti), kladně, s nadpisy
//   P2 = význam napřed, obraz jednou větou jako jeho ukázka, pak co je z toho místa vidět
//   P3 = viditelný plán: model napřed napíše do výstupu „moment“ a „sense“, teprve pak čtení (kód by plán zahodil)
'use strict';
const zaklad = require('./sloz1114.js');
function data(p, id) {
  const m = (re, co) => { const x = p.match(re); if (!x) throw new Error(id + ': v produkčním zadání chybí ' + co); return x; };
  const r = m(/DRAWN RUNE: (\S+) — focus on: ([^\n]+)/, 'runa a stránka');
  return {
    R: r[1], strana: r[2].trim(),
    X: m(/IMAGE — the picture in this reading comes from here: (.+?) Let it become your own seeing/, 'obraz')[1],
    zacatek: m(/one short line that begins ("[^"]+")/, 'začátek věty o významu')[1],
    otazka: m(/Let it grow out of the rune's question \("(.+?)"\)/, 'otázka runy')[1],
  };
}
const HLAVA = (d) => '# TASK\nWrite one rune reading, as Rúnar speaking to the seeker. It will be read aloud.\n\n' +
  '# THE RUNE\nRune: ' + d.R + '\nThe side of ' + d.R + ' this reading shows: ' + d.strana + '\nThe question ' + d.R + ' asks: "' + d.otazka + '"\n\n' +
  '# THE PICTURE\n' + d.X + '\nThis sentence is your source. The seeker never sees it; they know only the words of the reading.\n\n';
const O_CEM = '# WHAT THE READING SPEAKS ABOUT\nThe scene and the rune. What this is in the seeker\'s own life stays open: the last sentence offers two possibilities and leaves the choice with them.\n\n';
const VYSTUP = (d, json) => '# OUTPUT\nFour short sentences, 50 to 58 words in all, one paragraph. Name ' + d.R + ' once.\nReturn only this JSON array: ' + json;
const JSON1 = '[{"rune": "(the rune name)", "text": "(the reading, one paragraph)"}]';
const POSLEDNI = (d) => 'Hold out two things this may be in the seeker\'s life, each a state that may be so, said plainly. Let them grow out of the question ' + d.R + ' asks, in your own words.';
const VARIANTY = {
  P1: (d) => HLAVA(d) +
    '# HOW TO WRITE IT\nFour sentences, in this order:\n' +
    '1. Put the seeker at the spot where the picture happens, in your own words, with one detail the source sentence does not name.\n' +
    '2. Say the one thing the picture turns on: what is happening there, or what has stopped.\n' +
    '3. Begin ' + d.zacatek + ' and say this side of the rune in plain words a stranger to runes would grasp.\n' +
    '4. ' + POSLEDNI(d) + '\n\n' + O_CEM + VYSTUP(d, JSON1),
  P2: (d) => HLAVA(d) +
    '# HOW TO WRITE IT\nFour sentences, in this order:\n' +
    '1. Begin ' + d.zacatek + ' and say this side of the rune in plain words a stranger to runes would grasp.\n' +
    '2. Show it once: the seeker inside the picture, in one sentence of your own words, with one detail the source sentence does not name.\n' +
    '3. Say what a person can see or do from inside that moment. Keep it about the moment and the rune.\n' +
    '4. ' + POSLEDNI(d) + '\n\n' + O_CEM + VYSTUP(d, JSON1),
  P3: (d) => HLAVA(d) +
    '# HOW TO WRITE IT\nWork in three steps and write each step into the output.\n' +
    'Step 1, "moment": name the single moment in the picture where this side of ' + d.R + ' shows most clearly. At most 12 words.\n' +
    'Step 2, "sense": say this side of ' + d.R + ' in at most 8 plain words a stranger to runes would grasp.\n' +
    'Step 3, "text": write the reading through that moment. The seeker stands inside it. The moment appears once, in your own words, with one detail the source sentence does not name. One sentence begins ' + d.zacatek + ' and carries the sense from step 2. The last sentence: ' + POSLEDNI(d) + '\n\n' +
    O_CEM + VYSTUP(d, '[{"rune": "(the rune name)", "moment": "(step 1)", "sense": "(step 2)", "text": "(step 3: the reading, one paragraph)"}]'),
};
function postav(u) {
  const x = zaklad.postav(Object.assign({}, u, { zmeny: [] }));
  const v = (u.zmeny || [])[0];
  if (v) { if (!VARIANTY[v]) throw new Error(u.id + ': neznámá varianta ' + v); x.p = VARIANTY[v](data(x.p, u.id)); }
  return x;
}
module.exports = { postav };
if (require.main === module) {
  const fs = require('fs');
  for (const u of JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))) {
    const x = postav(u);
    console.log('==== ' + u.id + ' | zadání ' + x.p.split(/\s+/).filter(Boolean).length + ' slov | obraz: ' + (x.draws.image || '?'));
    if (process.argv.includes('--cely')) console.log(x.p + '\n');
  }
}
