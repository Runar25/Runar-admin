// CODE-tune 2026-10-06 — rozbor výsledků ask_slova.js. node rozbor_slova.js <vysledky.json> [--vety]
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
    if (n === 2 && obsah < 2) continue;   // dvojice jen dvě plnovýznamová slova („hard part“), jinak je to šum
    out.add(g.map(kmen).join(' '));
  }
  return [...out];
}
const RE_DNS = /\b(does|do|did) not (say|tell|settle|show|decide)\b|\bleaves? [^.?!]{0,30}\bopen\b|\bnot a (promise|verdict|prediction|sign|warning)\b/i;
const RE_ALT = /\bonly you (can|know)\b|\bcannot (say|know|tell)\b|\bcan't (say|know|tell)\b|\byours to (decide|say|know|find)\b|\bno one can (say|know)\b/i;
const vety = (t) => String(t).split(/(?<=[.?!])\s+/);
const sk = {};
for (const r of V) {
  const jmena = new Set(slova(r.runa + ' ' + (r.otazka.split(' — ')[1] ? r.otazka.split(' — ')[0] : '')));
  const g = ngramy(r.otazka, jmena);
  const a = ' ' + slova(r.text).map(kmen).join(' ') + ' ';
  const prvni = ' ' + slova(vety(r.text)[0]).map(kmen).join(' ') + ' ';
  const hit = g.find((x) => a.indexOf(' ' + x + ' ') !== -1);
  const hitP = g.find((x) => prvni.indexOf(' ' + x + ' ') !== -1);
  const k = r.v + ' | ' + r.h + ' | ' + r.sablona;
  const s = sk[k] = sk[k] || { n: 0, ozv: 0, ozvP: 0, dns: 0, alt: 0, slov: 0, zac: {}, kusy: {}, dnsVety: [] };
  s.n++; if (hit) { s.ozv++; s.kusy[hit] = (s.kusy[hit] || 0) + 1; } if (hitP) s.ozvP++;
  if (RE_DNS.test(r.text)) { s.dns++; s.dnsVety.push(vety(r.text).filter((x) => RE_DNS.test(x)).join(' ')); }
  if (RE_ALT.test(r.text)) s.alt++;
  s.slov += slova(r.text).length;
  const z = slova(r.text).slice(0, 2).join(' '); s.zac[z] = (s.zac[z] || 0) + 1;
}
console.log('| varianta | tip | znění otázky | n | ozvěna otázky | z toho v 1. větě | „does not say / leaves open / not a promise“ | „only you / cannot say“ | slov | nejčastější začátek |');
console.log('|---|---|---|---|---|---|---|---|---|---|');
for (const [k, s] of Object.entries(sk)) {
  const [v, h, z] = k.split(' | ');
  const zac = Object.entries(s.zac).sort((a, b) => b[1] - a[1])[0];
  const kus = Object.entries(s.kusy).sort((a, b) => b[1] - a[1]).map(([t, c]) => '„' + t + '“ ' + c).join(', ');
  console.log('| ' + v + ' | ' + h + ' | ' + z + ' | ' + s.n + ' | ' + s.ozv + '/' + s.n + (kus ? ' (' + kus + ')' : '') + ' | ' + s.ozvP + '/' + s.n + ' | ' + s.dns + '/' + s.n + ' | ' + s.alt + '/' + s.n + ' | ' + Math.round(s.slov / s.n) + ' | „' + zac[0] + '“ ' + zac[1] + ' |');
}
// Souhrn po variantách (pokus A)
const pv = {};
for (const [k, s] of Object.entries(sk)) { const v = k.split(' | ')[0]; const p = pv[v] = pv[v] || { n: 0, dns: 0, alt: 0, slov: 0 }; p.n += s.n; p.dns += s.dns; p.alt += s.alt; p.slov += s.slov; }
console.log('\n| varianta | n | pojistka „does not say…“ | „only you / cannot say“ | slov |\n|---|---|---|---|---|');
for (const [v, p] of Object.entries(pv)) console.log('| ' + v + ' | ' + p.n + ' | ' + p.dns + '/' + p.n + ' | ' + p.alt + '/' + p.n + ' | ' + Math.round(p.slov / p.n) + ' |');
const cena = V.reduce((a, r) => a + (r.usage ? r.usage.prompt_tokens * 2e-6 + r.usage.completion_tokens * 1e-5 : 0), 0);
console.log('\nvolání ' + V.length + ', cena $' + cena.toFixed(3) + ', useknuto ' + V.filter((r) => r.finish !== 'stop').length);
if (VETY) for (const [k, s] of Object.entries(sk)) { console.log('\n## ' + k); s.dnsVety.forEach((x) => console.log('- ' + x)); }
