// CODE-read 2026-09-23 — MERENI OPISOVANI OBRAZU (owner: „SOL presne kopiruje zneni obrazu!").
// Z promptu vytahne vetu obrazu (to, co produkce vlozi za „comes from here:"), z textu cteni spocita:
//   beh  = nejdelsi DOSLOVNY usek slov, ktery stoji v obrazu i v textu (9 = cela veta opsana)
//   v1   = kolik obsahovych slov obrazu (>3 znaky) stoji uz v PRVNI vete cteni
// Slepota (overeno na priklade): ohnute tvary v IS se nepocitaji jako shoda („kindin" ≠ „kindina") → v IS podhodnocuje.
//   node kopie.js            → zaklad z varky (single, oba modely)
'use strict';
const fs = require('fs'), path = require('path');

function obraz(user) {
  const m = user.match(/comes from here: (.+?)(?:\. Where:|\. Let it become)/) || user.match(/héðan kemur myndin í þessum lestri: (.+?)(?:\. Þetta á sér stað|\. Láttu hana)/);
  return m ? m[1] : null;
}
const slova = s => s.toLowerCase().replace(/[^\p{L}\s']/gu, ' ').split(/\s+/).filter(Boolean);
function beh(a, b) {
  const A = slova(a), B = slova(b); let best = 0, kde = '';
  for (let i = 0; i < A.length; i++) for (let j = 0; j < B.length; j++) {
    let k = 0; while (i + k < A.length && j + k < B.length && A[i + k] === B[j + k]) k++;
    if (k > best) { best = k; kde = A.slice(i, i + k).join(' '); }
  }
  return { beh: best, usek: kde };
}
function zmer(text, user) {
  const img = obraz(user); if (!img) return null;
  const prvni = text.split(/(?<=[.?!])\s+/)[0];
  const obs = [...new Set(slova(img).filter(w => w.length > 3))];
  const v1 = obs.filter(w => slova(prvni).includes(w)).length;
  return Object.assign({ img, v1: v1 + '/' + obs.length, v1p: obs.length ? v1 / obs.length : 0 }, beh(img, text));
}
module.exports = { zmer, obraz };

if (require.main === module) {
  const DIR = __dirname;
  const L = fs.readFileSync(path.join(DIR, 'varka', 'vysledky.jsonl'), 'utf8').trim().split('\n').map(JSON.parse).filter(x => !x.error && x.spread !== 'norns');
  const posl = {}; for (const z of L) posl[z.model + '|' + z.id] = z;   // posledni verze kazde bunky
  for (const k of Object.keys(posl).sort()) {
    const z = posl[k], P = JSON.parse(fs.readFileSync(path.join(DIR, 'varka', z.id + '.json'), 'utf8'));
    let t = z.text; if (!t) { try { t = JSON.parse(z.raw.slice(z.raw.indexOf('['), z.raw.lastIndexOf(']') + 1)).map(x => x.text).join(' '); } catch (e) { t = z.raw; } }
    const m = zmer(t, P.user); if (!m) { console.log(k, 'obraz nenalezen'); continue; }
    console.log(k.padEnd(34) + ' beh ' + String(m.beh).padStart(2) + ' · v1 ' + m.v1.padEnd(5) + ' · „' + m.usek + '"');
  }
}
