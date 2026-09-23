// CODE-read 2026-09-23 — souhrn iteraci opisovani obrazu (sol EN) z beh/*.txt → opis-vysledky.json + tabulka.
'use strict';
const fs = require('fs'), path = require('path');
const { zmer } = require('./kopie.js');
const B = path.join(__dirname, '..', 'beh');
const U = 'comes from here: The sheepdog lies where it can see the whole flock. Let it become';
const RAMENA = [['zaklad', /^zakl\d$/], ['vlastni', /^vl\d$/], ['fragmenty', /^fr\d$/], ['zblizka (eye)', /^zb\d$/], ['zblizka2', /^z2-\d$/], ['zblizka3 (notice)', /^z3-\d$/],
  ['zblizka3 Ansuz', /^z3-ansuz\d$/], ['zblizka2 Ansuz', /^z2-ansuz\d$/], ['uhel4 zaklad', /^u4-zakl$/], ['uhel4 + eye', /^u4-zb$/], ['uhel4 + zblizka2', /^z2-u4$/], ['uhel4 + notice', /^z3-u4$/],
  ['ostatni zaklad', /^g-\w+-zakl$/], ['ostatni + eye', /^g-\w+-zb$/], ['Opus 5 zaklad', /^op-zakl$/], ['Opus 5 + eye', /^op-zb$/]];
const out = [];
for (const f of fs.readdirSync(B).filter(f => f.endsWith('.txt')).sort()) {
  const id = f.slice(0, -4), s = fs.readFileSync(path.join(B, f), 'utf8');
  const L = s.split('\n'), i = L.findIndex(l => /\$0\.\d+ · /.test(l)); if (i < 0) continue;
  const text = L[i + 2], img = (s.match(/OBRAZ: „(.+)"/) || [])[1];
  const m = zmer(text, 'comes from here: ' + img + '. Let it become');
  const m0 = id.startsWith('fr') ? zmer(text, U) : m;           // fragmenty: meri se proti PUVODNI vete
  const r = RAMENA.find(([, re]) => re.test(id));
  out.push({ id, rameno: r ? r[0] : '?', model: /^op-/.test(id) ? 'claude-opus-5' : 'gpt-6-sol', obraz: img, text, beh: m0.beh, usek: m0.usek, v1: m0.v1, oko: /\beyes?\b/i.test(text) });
}
fs.writeFileSync(path.join(__dirname, 'opis-vysledky.json'), JSON.stringify(out, null, 1));
for (const [nm] of RAMENA) { const x = out.filter(o => o.rameno === nm); if (!x.length) continue;
  console.log(nm.padEnd(20), 'n=' + x.length, '· beh ' + x.map(o => o.beh).join('/'), '· v1 ' + x.map(o => o.v1).join(' '), '· eye ' + x.filter(o => o.oko).length); }
