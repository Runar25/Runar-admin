// Sloučení dvou nezávislých kodérů → mapa: pro každou část čtení všechny věty, které na ni sahají.
// Shoda: část se počítá, když ji dali OBA kodéři; neshody se vypíší zvlášť k rozhodnutí.
'use strict';
const fs = require('fs'), path = require('path');
const V = JSON.parse(fs.readFileSync(path.join(__dirname, 'vety-promptu.json'), 'utf8'));
const raw = fs.readFileSync(process.argv[2], 'utf8');
let o = JSON.parse(raw); if (o.result) o = typeof o.result === 'string' ? JSON.parse(o.result) : o.result;
const K = {}; o.forEach(k => { K[k.koder] = {}; k.prirazeni.forEach(p => { K[k.koder][p.id] = p; }); });
const kde = (odd) => odd.startsWith('1.') ? 'SYSTÉM' : odd.startsWith('2') ? 'ČTENÍ' : odd.startsWith('3') ? 'LOS' : 'ASK';
let shodaCast = 0, celkem = 0, druhShoda = 0;
const mapa = {}, neshody = [];
for (const v of V) {
  const a = K[1][v.id], b = K[2][v.id];
  if (!a || !b) { neshody.push({ v, pozn: 'chybí u kodéra ' + (!a ? 1 : 2) }); continue; }
  celkem++;
  const spol = a.casti.filter(c => b.casti.includes(c));
  if (spol.length) shodaCast++;
  if (a.druh === b.druh) druhShoda++;
  const druh = a.druh === b.druh ? a.druh : a.druh + '/' + b.druh;
  if (!spol.length || a.druh !== b.druh) neshody.push({ v, pozn: 'K1 ' + a.casti.join('+') + ' ' + a.druh + ' · K2 ' + b.casti.join('+') + ' ' + b.druh });
  spol.forEach(c => { (mapa[c] = mapa[c] || []).push({ id: v.id, kde: kde(v.oddil), oddil: v.oddil, druh, text: v.text }); });
}
const out = [];
out.push('pokryto ' + celkem + '/' + V.length + ' · shoda aspoň v jedné části ' + shodaCast + '/' + celkem + ' · shoda v druhu ' + druhShoda + '/' + celkem + '\n');
const PORADI = ['IDENTITA', 'HLAS', 'OTEVRENI', 'OBRAZ', 'ESENCE', 'JMENO_RUNY', 'OSLOVENI', 'KONEC', 'DELKA_FORMAT_JAZYK', 'KONTEXT_CLOVEKA', 'ZIVOTNI_RUNA', 'ZAKAZ_NITRO', 'ZAKAZ_RADA_ZAVER', 'ZAKAZ_OSUD', 'ZAKAZ_SLOVA_KLISE', 'SEZONA_POCASI', 'OPAKOVANI_PESTROST', 'ASK'];
for (const c of PORADI) {
  const arr = mapa[c] || [];
  const po = {}; arr.forEach(x => { const k = x.kde + ':' + x.druh; po[k] = (po[k] || 0) + 1; });
  out.push('══ ' + c + ' · ' + arr.length + ' vět · ' + Object.entries(po).map(([k, n]) => k + ' ' + n).join(' · '));
  arr.forEach(x => out.push('   ' + x.id + ' [' + x.kde + ' · ' + x.druh + ' · ' + x.oddil.replace(/^\d\w?\.\s*/, '').slice(0, 40) + '] ' + x.text.slice(0, 150)));
}
out.push('\n══ NESHODY KODÉRŮ (' + neshody.length + ')');
neshody.forEach(n => out.push('   ' + n.v.id + ' ' + n.pozn + ' | ' + n.v.text.slice(0, 110)));
fs.writeFileSync(path.join(__dirname, 'mapa-pokynu.txt'), out.join('\n'));
fs.writeFileSync(path.join(__dirname, 'mapa-pokynu.json'), JSON.stringify({ mapa, neshody: neshody.map(n => ({ id: n.v.id, pozn: n.pozn, text: n.v.text })) }, null, 1));
console.log(out.slice(0, 1).join('\n'));
