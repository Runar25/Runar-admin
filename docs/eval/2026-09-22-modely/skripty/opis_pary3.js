// CODE-read 2026-09-24 — SLEPE dvojice Opus 5 × Opus 4.8 (owner: „jak si vede opus 5 oproti opus 4.8?"). Tentyz produkcni
// prompt (rameno prod), EN 14 promptu z varky opis2 (opakovani 1 obou modelu) + IS 3 prompty z opis_is. Poradi A/B hashem.
// Soudce dostane systemovy prompt sveho jazyka + zadani. Klic mimo slozku soudcu (../opis-klic3.json).
'use strict';
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, 'soud3'); fs.mkdirSync(OUT, { recursive: true });
const hash = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 13);
const klic = {}; const chunks = { en1: [], en2: [], is1: [] };
function nacti(slozka) {
  const P = {}; for (const f of fs.readdirSync(path.join(__dirname, slozka)).filter(f => /^\d\d-.+\.json$/.test(f))) { const j = JSON.parse(fs.readFileSync(path.join(__dirname, slozka, f), 'utf8')); P[j.id] = j; }
  const L = fs.readFileSync(path.join(__dirname, slozka, 'vysledky.jsonl'), 'utf8').trim().split('\n').map(JSON.parse).filter(x => x.text && x.rameno === 'prod' && x.rep === 1);
  return { P, L };
}
const brief = t => t.replace(/\n(Word corrections|Orðaleiðréttingar)[\s\S]*?(?=\n(Output format|Svarsnið|Skilaðu))/, '').replace(/\n(Output format|Svarsnið|Skilaðu)[\s\S]*$/, '');
for (const [slozka, lang] of [['opis2', 'en'], ['opis_is', 'is']]) {
  const { P, L } = nacti(slozka);
  fs.writeFileSync(path.join(OUT, 'system_' + lang + '.txt'), Object.values(P)[0].sys);
  const ids = Object.keys(P).sort();
  ids.forEach((id, i) => {
    const a = L.find(x => x.id === id && x.model === 'claude-opus-5'), b = L.find(x => x.id === id && x.model === 'claude-opus-4-8');
    if (!a || !b) throw new Error(slozka + ' ' + id + ': chybi cteni');
    const pid = (lang === 'en' ? 'M' : 'I') + String(i + 1).padStart(2, '0'), o5A = (i + (lang === 'is' ? 1 : 0)) % 2 === 0;   // stridani: hash dal 5/17 (nevyvazene)
    klic[pid] = { id, lang, A: o5A ? 'opus5' : 'opus48', B: o5A ? 'opus48' : 'opus5' };
    const obraz = P[id].obraz;
    const pr = { pid, brief: brief(P[id].ramena.prod), image: obraz, image_sense: P[id].smysl === 'zrak' ? 'sight' : { sluch: 'sound', cich: 'smell', hmat: 'touch', teplo: 'warmth' }[P[id].smysl], A: o5A ? a.text : b.text, B: o5A ? b.text : a.text };
    (lang === 'is' ? chunks.is1 : (i < 7 ? chunks.en1 : chunks.en2)).push(pr);
  });
}
for (const [c, pairs] of Object.entries(chunks)) {
  fs.writeFileSync(path.join(OUT, c + '.json'), JSON.stringify({ pairs }, null, 1));
  fs.writeFileSync(path.join(OUT, c + '-s.json'), JSON.stringify({ pairs: pairs.map(p => Object.assign({}, p, { A: p.B, B: p.A })) }, null, 1));
}
fs.writeFileSync(path.join(__dirname, '..', 'opis-klic3.json'), JSON.stringify(klic, null, 1));
console.log(Object.entries(chunks).map(([c, p]) => c + ':' + p.length).join(' ') + ' · opus5 jako A ' + Object.values(klic).filter(k => k.A === 'opus5').length + '/' + Object.keys(klic).length);
const b0 = chunks.is1[0].brief; console.log('IS brief konci: …' + b0.slice(-160));
