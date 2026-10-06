// CODE-tune 2026-10-06 — rozbor výsledků ask_slova.js. node rozbor_slova.js <vysledky.json> [--vety]
//   pojistka celkem = „does not say / tell / settle / show / decide“ · „leaves … open“ · „not a promise / verdict …“
//   z toho podmět RUNA / podmět čtení-obraz = regexy CODE-read (docs/eval/2026-10-06-ask-pojistka/rozbor_podmet.js), aby čísla šla srovnat
//   začátek = první tři slova odpovědi, jméno runy = [runa] (jako monitor ozvěn)
//   D (kolo „drawn“): ozvěna „drawn / cast“ a věta „X is yours, but … the rune“
'use strict';
const fs = require('fs');
const V = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const VETY = process.argv.includes('--vety');
const STOP = new Set('the a an of in on to this that is are be what does do my me i you your it its how why with for about and or not no as at by from into than then there their they them here where'.split(' '));
const kmen = (w) => (w.length > 4 ? w.replace(/(ing|ed|es|s)$/, '') : w);
const slova = (s) => String(s || '').toLowerCase().replace(/[’']/g, "'").replace(/[^a-z' ]+/g, ' ').split(/\s+/).filter(Boolean);
const naYou = (w) => (w === 'i' ? 'you' : w === 'my' ? 'your' : w === 'me' ? 'you' : w);
function ngramy(q, jmena) {
  const w = slova(q).map(naYou), out = new Set();
  for (const n of [3, 2]) for (let i = 0; i + n <= w.length; i++) {
    const g = w.slice(i, i + n);
    if (g.some((x) => jmena.has(x))) continue;
    const obsah = g.filter((x) => !STOP.has(x)).length;
    if (n === 3 && obsah < 1) continue;
    if (n === 2 && obsah < 2) continue;
    out.add(g.map(kmen).join(' '));
  }
  return [...out];
}
const RE_DNS = /\b(does|do|did) not (say|tell|settle|show|decide)\b|\bleaves? [^.?!]{0,30}\bopen\b|\bnot a (promise|verdict|prediction|sign|warning)\b/i;
const SL = "(?:does|do|did)\\s?n[o'’]?t\\s+(?:say|tell|show|settle|decide|name|promise)\\b";
const reRuna = (r) => new RegExp('\\b(?:the runes?|' + r + ')\\s+' + SL, 'i');
const reJine = new RegExp('\\b(?:the reading|the image|the picture|they|it)\\s+' + SL, 'i');
const RE_DRAWN = /\b(drawn|was cast|were cast)\b/i;
const RE_YOURS = /\b(is yours|is your life rune|your own rune)\b[^.]{0,80}\b(but|while)\b[^.]{0,60}\bthe rune\b/i;
const vety = (t) => String(t).split(/(?<=[.?!])\s+/);
function zacatek(a, runa) {
  const w = String(a).trim().replace(/^[A-Z][a-z]+,\s+/, '').split(/\s+/).slice(0, 3).map((x) => x.replace(/[’']s$/, '').replace(/[^A-Za-z']/g, ''));
  return w.map((x) => (x.toLowerCase() === runa.toLowerCase() ? '[runa]' : x.toLowerCase())).join(' ');
}
const sk = {};
for (const r of V) {
  const jmena = new Set(slova(r.runa + ' isa ' + (r.otazka.split(' — ')[1] ? r.otazka.split(' — ')[0] : '')));
  const g = ngramy(r.otazka, jmena);
  const a = ' ' + slova(r.text).map(kmen).join(' ') + ' ';
  const prvni = ' ' + slova(vety(r.text)[0]).map(kmen).join(' ') + ' ';
  const hit = g.find((x) => a.indexOf(' ' + x + ' ') !== -1);
  const k = r.v + ' | ' + r.h + ' | ' + r.sablona;
  const s = sk[k] = sk[k] || { n: 0, ozv: 0, ozvP: 0, dns: 0, runa: 0, jine: 0, drawn: 0, yours: 0, slov: 0, zac: {}, dnsVety: [] };
  s.n++; if (hit) s.ozv++; if (g.find((x) => prvni.indexOf(' ' + x + ' ') !== -1)) s.ozvP++;
  if (RE_DNS.test(r.text)) { s.dns++; s.dnsVety.push(vety(r.text).filter((x) => RE_DNS.test(x)).join(' ')); }
  if (reRuna(r.runa).test(r.text)) s.runa++;
  if (reJine.test(r.text)) s.jine++;
  if (RE_DRAWN.test(r.text)) s.drawn++;
  if (RE_YOURS.test(r.text)) s.yours++;
  s.slov += slova(r.text).length;
  const z = zacatek(r.text, r.runa); s.zac[z] = (s.zac[z] || 0) + 1;
}
const D = V.some((r) => r.v === 'STARE' || r.v === 'NOVE');
console.log(D ? '| varianta | otázka | n | „drawn / cast“ | „X is yours, but … the rune“ | pojistka | slov |\n|---|---|---|---|---|---|---|'
  : '| varianta | tip | znění otázky | n | ozvěna otázky | v 1. větě | pojistka celkem | podmět runa | podmět čtení/obraz | slov | nejčastější začátek |\n|---|---|---|---|---|---|---|---|---|---|---|');
for (const [k, s] of Object.entries(sk)) {
  const [v, h, z] = k.split(' | ');
  const zac = Object.entries(s.zac).sort((a, b) => b[1] - a[1])[0];
  if (D) console.log('| ' + v + ' | ' + h + ' | ' + s.n + ' | ' + s.drawn + '/' + s.n + ' | ' + s.yours + '/' + s.n + ' | ' + s.dns + '/' + s.n + ' | ' + Math.round(s.slov / s.n) + ' |');
  else console.log('| ' + v + ' | ' + h + ' | ' + z + ' | ' + s.n + ' | ' + s.ozv + '/' + s.n + ' | ' + s.ozvP + '/' + s.n + ' | ' + s.dns + '/' + s.n + ' | ' + s.runa + '/' + s.n + ' | ' + s.jine + '/' + s.n
    + ' | ' + Math.round(s.slov / s.n) + ' | „' + zac[0] + '“ ' + zac[1] + ' |');
}
const pv = {};
for (const [k, s] of Object.entries(sk)) { const v = k.split(' | ')[0]; const p = pv[v] = pv[v] || { n: 0, dns: 0, runa: 0, jine: 0, drawn: 0, yours: 0, slov: 0 };
  for (const x of ['n', 'dns', 'runa', 'jine', 'drawn', 'yours', 'slov']) p[x] += s[x]; }
console.log('\n| varianta | n | pojistka celkem | podmět runa | podmět čtení/obraz | „drawn“ | slov |\n|---|---|---|---|---|---|---|');
for (const [v, p] of Object.entries(pv)) console.log('| ' + v + ' | ' + p.n + ' | ' + p.dns + '/' + p.n + ' | ' + p.runa + '/' + p.n + ' | ' + p.jine + '/' + p.n + ' | ' + p.drawn + '/' + p.n + ' | ' + Math.round(p.slov / p.n) + ' |');
function fisher(a, b, c, d) {
  const lf = (n) => { let s = 0; for (let i = 2; i <= n; i++) s += Math.log(i); return s; };
  const p = (a, b, c, d) => Math.exp(lf(a + b) + lf(c + d) + lf(a + c) + lf(b + d) - lf(a) - lf(b) - lf(c) - lf(d) - lf(a + b + c + d));
  const r1 = a + b, c1 = a + c, n = a + b + c + d, p0 = p(a, b, c, d); let s = 0;
  for (let x = Math.max(0, c1 - (n - r1)); x <= Math.min(r1, c1); x++) { const q = p(x, r1 - x, c1 - x, n - r1 - c1 + x); if (q <= p0 + 1e-12) s += q; }
  return Math.min(1, s);
}
if (pv.P0) for (const [v, p] of Object.entries(pv)) if (v !== 'P0' && v !== 'R1')
  console.log('Fisher P0 × ' + v + ': pojistka p = ' + fisher(pv.P0.dns, pv.P0.n - pv.P0.dns, p.dns, p.n - p.dns).toFixed(3) + ' · podmět runa p = ' + fisher(pv.P0.runa, pv.P0.n - pv.P0.runa, p.runa, p.n - p.runa).toFixed(3));
if (pv.STARE && pv.NOVE) console.log('Fisher STARE × NOVE: „drawn“ p = ' + fisher(pv.STARE.drawn, pv.STARE.n - pv.STARE.drawn, pv.NOVE.drawn, pv.NOVE.n - pv.NOVE.drawn).toFixed(3));
// půlka proti půlce (§27): pojistka v sudých × lichých záznamech každé varianty
for (const [v] of Object.entries(pv)) { const xs = V.filter((r) => r.v === v); console.log('půlky ' + v + ': ' + [0, 1].map((k) => xs.filter((x, i) => i % 2 === k && RE_DNS.test(x.text)).length + '/' + xs.filter((x, i) => i % 2 === k).length).join(' · ')); }
const cena = V.reduce((a, r) => a + (r.usage ? r.usage.prompt_tokens * 2e-6 + r.usage.completion_tokens * 1e-5 : 0), 0);
console.log('\nvolání ' + V.length + ', cena $' + cena.toFixed(3) + ', useknuto ' + V.filter((r) => r.finish !== 'stop').length);
if (VETY) for (const [k, s] of Object.entries(sk)) { console.log('\n## ' + k); s.dnsVety.forEach((x) => console.log('- ' + x)); }
