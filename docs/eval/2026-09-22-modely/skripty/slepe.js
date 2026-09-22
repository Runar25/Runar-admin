// CODE-read 2026-09-22 — slepe podklady pro soudce. Kazdy jazyk ma VLASTNI zamichani kodu (A–G),
// aby soudce EN a IS nemohli pozici prenest. Klic zvlast, soudci ho nevidi.
// Opus 5.5 jde do souzeni v behu @2000 — na produkcnich 700 v IS text nevratil vubec (tvrdy nalez, zvlast).
'use strict';
const fs = require('fs'), path = require('path');
const DIR = __dirname;
const M = JSON.parse(fs.readFileSync(path.join(DIR, 'metriky.json'), 'utf8'));
const MODELY = ['claude-opus-4-8', 'claude-opus-5', 'claude-opus-5-5@2000', 'gpt-5.6-sol', 'gpt-6-astra', 'gpt-6-sol', 'gpt-6-luna'];
const PORADI = { en: [3, 6, 0, 5, 1, 4, 2], is: [5, 2, 6, 0, 4, 1, 3] };   // pevne, ruzne pro jazyky
const PISMENA = 'ABCDEFG';
const klic = {};
for (const lang of ['en', 'is']) {
  const P = JSON.parse(fs.readFileSync(path.join(DIR, 'prompt-' + lang + '.json'), 'utf8'));
  const uvod = [
    'ZADÁNÍ, KTERÉ DOSTALY VŠECHNY MODELY (totéž, bit po bitu):',
    '- runa Raidho (důraz: natural rhythm) · obraz: ovčí stezka, která se vine sama od sebe · místo: dolů podél řeky mezi svahy',
    '- oblast: Crossroads & Decisions (rozcestí) · hledání: Confirmation → poslední věta má nabídnout DVĚ možnosti, čím to může být tam, kde se cesta člověka dělí',
    '- 4 krátké věty, 50–58 slov, čte se nahlas · jméno Kuky přijde pozdě, u konce · jedna esenční věta: co runa DĚLÁ skrze obraz',
    '- zákaz: neříkat člověku, co ví nebo kterou cestou půjde (kromě poslední věty jako možnost) · žádné cold reading, rada, předpověď',
    '', 'Doslovné řádky zadání:', ...P.vstupy.map(l => '  ' + l), '', '========', '',
  ].join('\n');
  const bloky = [];
  klic[lang] = {};
  PORADI[lang].forEach((mi, k) => {
    const kod = PISMENA[k], m = MODELY[mi];
    klic[lang][kod] = m;
    const r = M.find(x => x.m === m && x.lang === lang);
    bloky.push('### ' + kod + '\n' + r.texty.map((t, i) => kod + (i + 1) + ') ' + t).join('\n\n'));
  });
  fs.writeFileSync(path.join(DIR, 'slepe-' + lang + '.txt'), uvod + bloky.join('\n\n'));
}
fs.writeFileSync(path.join(DIR, 'klic.json'), JSON.stringify(klic, null, 1));
console.log('ok — slepe-en.txt, slepe-is.txt, klic.json');
