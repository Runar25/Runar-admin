// CODE-read 2026-09-22 — slepe dvojice Opus 5 × gpt-6-sol na TYCHZ promptech (IS single = verze -g2 bez glos).
// A/B podle pevneho vzoru (ne podle modelu), klic zvlast. Soubor pro soudce i pro ownera.
'use strict';
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, 'varka');
const Z = fs.readFileSync(path.join(DIR, 'vysledky.jsonl'), 'utf8').trim().split('\n').map(l => JSON.parse(l)).filter(z => !z.error);
const posl = {};                                   // posledni vysledek pro (model, id)
for (const z of Z) posl[z.model + '|' + z.id] = z;
const PARY = {
  en: ['single-gebo-en', 'single-laguz-en', 'single-algiz-en', 'single-jera-en', 'single-ansuz-en', 'norns1-en', 'norns2-en'],
  is: ['single-gebo-is-g2', 'single-laguz-is-g2', 'single-algiz-is-g2', 'single-jera-is-g2', 'single-ansuz-is-g2', 'norns1-is', 'norns2-is'],
};
const PREHOZ = [0, 1, 1, 0, 1, 0, 0];               // 1 = sol je A; pevne, at je beh opakovatelny
const klic = {};
for (const lang of ['en', 'is']) {
  const bloky = [];
  PARY[lang].forEach((id, i) => {
    const p = JSON.parse(fs.readFileSync(path.join(DIR, id + '.json'), 'utf8'));
    const o = posl['claude-opus-5|' + id], s = posl['gpt-6-sol|' + id];
    if (!o || !s) throw new Error('chybi dvojice ' + id);
    const [A, B] = PREHOZ[i] ? [s, o] : [o, s];
    const kod = 'P' + (i + 1);
    klic[lang + '-' + kod] = { id, A: A.model, B: B.model };
    const ctx = p.spread === 'norns'
      ? 'Norns (Urður / Verðandi / Skuld): ' + p.runy.join(' · ') + ' · oblast ' + p.area + ' · záměr ' + p.intention
      : 'Single: ' + p.runy[0] + ' · oblast ' + p.area + ' · hledání ' + p.seeking + ' (→ poslední věta = dvě možnosti)';
    bloky.push('### ' + kod + ' — ' + ctx + '\n\nA (' + A.text.split(/\s+/).length + ' slov): ' + A.text + '\n\nB (' + B.text.split(/\s+/).length + ' slov): ' + B.text);
  });
  fs.writeFileSync(path.join(DIR, 'pary-' + lang + '.txt'),
    'Každá dvojice = TÝŽ prompt, dva různí autoři. Single: rozpočet 4 věty / 50–58 slov. Norns: tři beaty, poslední věta patří Skuld a nabízí dvě možnosti.\n\n' + bloky.join('\n\n'));
}
fs.writeFileSync(path.join(DIR, 'pary-klic.json'), JSON.stringify(klic, null, 1));
console.log('ok — pary-en.txt, pary-is.txt, pary-klic.json');
