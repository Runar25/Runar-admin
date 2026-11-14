// Lab 2026-11-14: vyhodnotí tři soudce auditu děje. Napřed obhájí nástroj (návnady musí propadnout), pak teprve výsledek.
// Propadl = aspoň 2 ze 3 soudců dali C · sporný = aspoň 2 ze 3 dali B nebo C (a nepropadl) · drží = jinak.
'use strict';
const fs = require('fs'), path = require('path');
const H = __dirname, J = (f) => JSON.parse(fs.readFileSync(path.join(H, f), 'utf8'));
const vstup = J('audit_vstup.json'), klic = J('audit_klic.json');
const soudci = [1, 2, 3].map((n) => { const f = 'soudce_' + n + '.json'; if (!fs.existsSync(path.join(H, f))) return null;
  const m = {}; for (const r of J(f)) m[r.id] = r; return m; }).filter(Boolean);
console.log('soudců:', soudci.length);
for (const [i, s] of soudci.entries()) { const chybi = vstup.filter((v) => !s[v.id] || !/^[ABC]$/.test(s[v.id].verdict)).length; if (chybi) console.log('  ⚠️ soudce', i + 1, 'nemá platný verdikt u', chybi, 'řádků'); }
const radky = vstup.map((v) => { const k = klic.find((x) => x.id === v.id); const h = soudci.map((s) => (s[v.id] || {}).verdict || '?');
  const c = h.filter((x) => x === 'C').length, bc = h.filter((x) => x === 'B' || x === 'C').length;
  return Object.assign({}, v, k, { hlasy: h.join(''), stav: c >= 2 ? 'propadl' : bc >= 2 ? 'sporný' : 'drží', proc: soudci.map((s) => (s[v.id] || {}).why || '').filter(Boolean) }); });
const nav = radky.filter((r) => r.navnada), prave = radky.filter((r) => !r.navnada);
console.log('\nNÁSTROJ — návnady (obraz u cizí runy), musí propadnout:');
for (const r of nav) console.log('  ' + r.hlasy + ' ' + r.stav.padEnd(8) + r.rune + ' / ' + r.side + ' ← ' + r.image.slice(0, 60) + ' (pravá runa ' + r.pravaRuna + ')');
console.log('  propadlo ' + nav.filter((r) => r.stav === 'propadl').length + ' z ' + nav.length + ', sporných ' + nav.filter((r) => r.stav === 'sporný').length + ', drží ' + nav.filter((r) => r.stav === 'drží').length);
// shoda soudců na pravých řádcích
const shoda = prave.filter((r) => new Set(r.hlasy).size === 1).length;
console.log('\nSHODA soudců (všichni stejně) na pravých obrazech: ' + shoda + ' z ' + prave.length);
const poc = { 'drží': 0, 'sporný': 0, 'propadl': 0 }; for (const r of prave) poc[r.stav]++;
console.log('PRAVÉ OBRAZY: drží ' + poc['drží'] + ' · sporný ' + poc['sporný'] + ' · propadl ' + poc['propadl'] + ' (z ' + prave.length + ')');
for (const st of ['propadl', 'sporný']) { console.log('\n== ' + st.toUpperCase());
  for (const r of prave.filter((x) => x.stav === st).sort((a, b) => a.rune.localeCompare(b.rune))) {
    console.log('- [' + r.hlasy + '] ' + r.rune + ' / ' + r.side + ': ' + r.image); for (const p of r.proc) console.log('      · ' + p); } }
const pr = {}; for (const r of prave) { pr[r.rune] = pr[r.rune] || { n: 0, zle: 0 }; pr[r.rune].n++; if (r.stav !== 'drží') pr[r.rune].zle++; }
console.log('\nPO RUNÁCH (sporný + propadl / všech): ' + Object.keys(pr).map((k) => k + ' ' + pr[k].zle + '/' + pr[k].n).join(' · '));
fs.writeFileSync(path.join(H, 'audit_vysledek.json'), JSON.stringify(radky, null, 1));
