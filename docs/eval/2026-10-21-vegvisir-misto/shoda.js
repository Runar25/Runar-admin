// CODE-read 2026-10-21 — Vegvísir kolo 2: runa, která tématem místa SEDÍ (owner: „ano, otestuj i Gebo × lano“).
// Otázka: má Gebo (dar, výměna, vazba) v místě „lano mezi dvěma břehy“ ještě co dělat, nebo jen zopakuje místo (2026-08-25: shoda místa
// a runy 0/4 pro runu)? Kontrola: táž runa v místě, které jejím tématem není (kovárna v jeskyni). Varianta A (bez otázky balíčku), n = 5 + 5.
// Pořadí promptů zamíchané, ať generátor nevidí bloky.
//   node shoda.js     zapíše vstup_shoda.txt a shoda_klic.json
'use strict';
const fs = require('fs'), path = require('path');
const { MISTA, prompt } = require('./misto.js');
const LANO = MISTA[2][1], KOVARNA = MISTA[1][1];
const pol = [];
for (let i = 0; i < 5; i++) { pol.push({ misto: 'lano', p: prompt('Gebo', LANO) }); pol.push({ misto: 'kovarna', p: prompt('Gebo', KOVARNA) }); }
let s = 2110; const rnd = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
for (let i = pol.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pol[i], pol[j]] = [pol[j], pol[i]]; }
const sys = fs.readFileSync(path.join(__dirname, 'vstup_A.txt'), 'utf8').split('=== PROMPT 1 ===')[0];
let out = sys;
pol.forEach((x, i) => { out += '=== PROMPT ' + (i + 1) + ' ===\n' + x.p + '\n\n'; });
fs.writeFileSync(path.join(__dirname, 'vstup_shoda.txt'), out);
fs.writeFileSync(path.join(__dirname, 'shoda_klic.json'), JSON.stringify(pol.map((x, i) => ({ c: i + 1, misto: x.misto })), null, 1));
console.log(pol.length, 'promptů');
