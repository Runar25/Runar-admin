// Owner 2026-09-18: "chci si být jistý, že všechno od kdo je Rúnar až po poslední instrukci je správně, bez konfliktů,
// na správném místě — když něco ladíme, víme co, a nic jiného nám to neovlivní."
// Krok 1: očíslovat KAŽDOU větu toho, co model dostává (systém · user message Single EN obě varianty · všechny pooly · Ask),
// aby šlo každou přiřadit k části čtení, kterou řídí, a spočítat, kolik pokynů sahá na tutéž část.
'use strict';
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, 'konflikty-vstup.md'), 'utf8');
const oddily = src.split(/\n(?=## )/);
const vety = [];
let n = 0;
const rozdel = (t) => t.replace(/\s+/g, ' ').trim()
  .split(/(?<=[.!?])\s+(?=[A-Z"„(\[])|(?<=:)\s+(?=[A-Z])/).map(x => x.trim()).filter(x => x.length > 2);
for (const o of oddily) {
  const hlav = (o.match(/^## (.*)/) || [, 'úvod'])[1];
  if (/^# CO DOSTÁVÁ/.test(o)) continue;
  let blok = hlav, radky = o.split('\n').slice(1);
  for (const l of radky) {
    if (!l.trim()) continue;
    if (/^[A-Z][A-Z &']{3,}$/.test(l.trim()) || /^(ÚHEL|DÉLKA|KONEC|MÍSTO JMÉNA)/.test(l)) { blok = hlav.slice(0, 3) + ' · ' + l.trim().replace(/:$/, ''); continue; }
    const prefix = (l.match(/^([A-Z][A-Z ]+(?:[A-Z]|\([^)]*\)))(?: —|:)/) || [])[1];
    const b = prefix ? hlav.slice(0, 3) + ' · ' + prefix : blok;
    rozdel(l).forEach(v => { n++; vety.push({ id: 'V' + String(n).padStart(3, '0'), oddil: b, text: v }); });
  }
}
// 2B opakuje 2A — ponechat jen řádky, které ve 2A nejsou (otázka, oblast, hledání, záměr)
const v2a = new Set(vety.filter(v => v.oddil.startsWith('2A')).map(v => v.text.replace(/Raidho|Thor|natural rhythm|the road/g, 'X')));
const fin = vety.filter(v => !(v.oddil.startsWith('2B') && v2a.has(v.text.replace(/Raidho|Thor|natural rhythm|the road/g, 'X'))));
fin.forEach((v, i) => v.id = 'V' + String(i + 1).padStart(3, '0'));
fs.writeFileSync(path.join(__dirname, 'vety-promptu.json'), JSON.stringify(fin, null, 1));
fs.writeFileSync(path.join(__dirname, 'vety-promptu.md'), fin.map(v => v.id + ' [' + v.oddil + '] ' + v.text).join('\n') + '\n');
const po = {}; fin.forEach(v => { const k = v.oddil.split(' · ')[0]; po[k] = (po[k] || 0) + 1; });
console.log('vet celkem ' + fin.length + ' · ' + JSON.stringify(po));
console.log(fin.slice(0, 8).map(v => v.id + ' [' + v.oddil + '] ' + v.text.slice(0, 90)).join('\n'));
