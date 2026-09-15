// Mereni vysledku t15 (workflow wf_746e1458-be3). Vstup = output soubor tasku (JSON s polem {id, text}).
'use strict';
const fs = require('fs');
const raw = fs.readFileSync(process.argv[2], 'utf8');
let o; try { o = JSON.parse(raw); } catch (e) { o = JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1)); }
let arr = Array.isArray(o) ? o : (o.result || o);
if (typeof arr === 'string') arr = JSON.parse(arr);
const txt = t => { try { return JSON.parse(t)[0].text; } catch (e) { const m = String(t).match(/"text":\s*"([\s\S]*)"\s*\}\s*\]\s*$/); return m ? m[1] : String(t); } };
const R = {}; arr.forEach(x => { R[x.id] = txt(x.text); });
fs.writeFileSync(__dirname + '/t15-texty.json', JSON.stringify(R, null, 1));
const vety = t => t.split(/(?<=[.?!])\s+/).filter(Boolean);
const slova = t => t.toLowerCase().match(/[a-z']+/g) || [];
const STOP = new Set('the a an and of in to it is its that this each one from with on at as by for your you'.split(' '));
const obsah = t => [...new Set(slova(t).filter(w => w.length > 2 && !STOP.has(w)))];
const LONG = 'The cairns stand each within sight of the next across the whole heath, each seen from the one before';
const SHORT = 'cairns across the heath';
console.log('════ T1 — Raidho, dlouhy (L) vs kratky (S) obraz ════');
for (const arm of ['L', 'S']) for (const run of [1, 2, 3]) {
  const id = 'T1-' + arm + run, t = R[id]; if (!t) { console.log(id + ' CHYBI'); continue; }
  const v = vety(t), img = obsah(arm === 'L' ? LONG : SHORT), s = new Set(slova(t));
  const prevzato = img.filter(w => s.has(w) || s.has(w.replace(/s$/, '')));
  const jmenoVeta = v.findIndex(x => /\bThor\b/.test(x)) + 1;
  console.log(id + ' · ' + slova(t).length + ' slov / ' + v.length + ' vet'
    + ' · slova obrazu ' + prevzato.length + '/' + img.length + ' (' + prevzato.join(',') + ')'
    + ' · aspekt road: ' + (/\broads?\b/i.test(t) ? 'ano' : 'ne')
    + ' · uhel (zacina "You"): ' + (/^(You|Standing|Here)\b/.test(t) ? 'ano' : 'ne')
    + ' · svet (now/moment/present/active/living): ' + ((t.match(/\b(now|moment|present|active|living)\b/gi) || []).join(',') || '—')
    + ' · Thor ve vete ' + (jmenoVeta || '—') + ' · konec otazkou: ' + (/\?\s*$/.test(t) ? 'ano' : 'ne'));
  console.log('   ' + t);
}
console.log('\n════ T2 — ctyri vety hlasu: P (dnesni) vs N (navrh) ════');
const LEAK_P = /\b(grey|gray|glacial|black sand|birch|wet snow|steam|hot spring|moss|track|splits?|shore)\b/gi;
const LEAK_N = /\b(meltwater|ditch|farm|geese|goose|home-field|harbour|harbor|gull|pier|bus|town|snow|midnight sun)\b/gi;
const NITRO = /\b(in you|inside you|within you|you already|already in you|part of you|ready to|you are ready)\b/gi;
let suma = { P: { lp: 0, ln: 0, ni: 0 }, N: { lp: 0, ln: 0, ni: 0 } };
for (const r of ['Fehu', 'Ansuz', 'Kenaz', 'Jera', 'Tiwaz']) for (const arm of ['P', 'N']) {
  const id = 'T2-' + r + '-' + arm, t = R[id]; if (!t) { console.log(id + ' CHYBI'); continue; }
  const lp = t.match(LEAK_P) || [], ln = t.match(LEAK_N) || [], ni = t.match(NITRO) || [];
  suma[arm].lp += lp.length ? 1 : 0; suma[arm].ln += ln.length ? 1 : 0; suma[arm].ni += ni.length ? 1 : 0;
  console.log(id + ' · slova ze starych vzoru: ' + (lp.join(',') || '—') + ' · slova z novych vzoru: ' + (ln.join(',') || '—') + ' · nitro: ' + (ni.join(',') || '—'));
  console.log('   ' + t);
}
console.log('\nsouhrn T2 (cteni s aspon jednim slovem): P → stare ' + suma.P.lp + '/5, nove ' + suma.P.ln + '/5, nitro ' + suma.P.ni + '/5 · N → stare ' + suma.N.lp + '/5, nove ' + suma.N.ln + '/5, nitro ' + suma.N.ni + '/5');
