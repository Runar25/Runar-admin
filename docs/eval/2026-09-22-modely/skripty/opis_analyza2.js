// CODE-read 2026-09-23 — tvrda mereni TRI ramen varky opis2: prod · nova („look closer…") · detail („down to one detail
// the sentence does not name"). Pridano proti opis_analyza.js (to, co kritik 2026-09-23 vytkl, ze chybi):
//   ozvena zneni (look closer / notice first / one detail / does not name), vnimajici „you see/hear/notice/feel" v 1. vete,
//   runa jako podmet slovesa, zvuk v prvnich dvou vetach u zvukovych obrazu. Kazde pocitadlo se napred overi na znamem vstupu.
'use strict';
const fs = require('fs'), path = require('path');
const { zmer } = require('./kopie.js');
const { najdi } = require('./runa_jedna.js');
const DIR = path.join(__dirname, 'opis2');
const P = {}; for (const f of fs.readdirSync(DIR).filter(f => /^\d\d-.+\.json$/.test(f))) { const j = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')); P[j.id] = j; }
const L = fs.readFileSync(path.join(DIR, 'vysledky.jsonl'), 'utf8').trim().split('\n').map(JSON.parse).filter(x => x.text);

const ZVUK = /(?<![a-z])(hear|heard|hears|hearing|sound|sounds|listen\w*|ears?|murmur\w*|voice|rings?|rang|toll\w*|note|chime\w*|trickl\w*|gurgl\w*|hiss\w*|whistl\w*|bell)(?![a-z])/gi;
const VNIM = /(?<![a-z])you (can |could |may )?(see|hear|notice|feel|catch|watch|spot)(?![a-z])/i;
const OZV = { closer: /look(s|ing)? closer/i, noticeFirst: /notic\w*[^.?!]{0,40}(?<![a-z])first(?![a-z])|(?<![a-z])first(?![a-z])[^.?!]{0,25}notic/i,
  detail: /one detail|(?<![a-z])detail(?![a-z])/i, neniVete: /(does|do) not name|the sentence/i };
const IMP = /(^|[.?!]\s+)(Look|See|Notice|Listen|Watch|Feel|Bend|Lean|Step)(?![a-z])/;
// kontroly nastroju na znamem vstupu (§27) — rozbite pocitadlo jinak tise ukazuje 0
const ok = (c, m) => { if (!c) throw new Error('nastroj rozbity: ' + m); };
ok((('you can hear it moving').match(ZVUK) || []).length === 1 && (('the heart of the year').match(ZVUK) || []).length === 0, 'ZVUK');
ok(VNIM.test('You can hear the stream') && !VNIM.test('Your hand'), 'VNIM');
ok(OZV.closer.test('Look closer, and you see') && OZV.detail.test('down to one detail'), 'OZV');
ok(najdi('Jera lifts that cloth a little', 'Jera').length === 1, 'najdi');
const prvni = t => t.split(/(?<=[.?!])\s+/)[0], prvni2 = t => t.split(/(?<=[.?!])\s+/).slice(0, 2).join(' ');

const R = L.map(x => {
  const p = P[x.id], t = x.text, m = zmer(t, 'comes from here: ' + p.obraz + '. Let it become');
  return { id: x.id, model: x.model, rameno: x.rameno, rep: x.rep, smysl: p.smysl, uhel: p.uhel, text: t, beh: m.beh, usek: m.usek, v1p: m.v1p,
    slov: t.split(/\s+/).length, imp: IMP.test(t), closer: OZV.closer.test(t), noticeFirst: OZV.noticeFirst.test(t), detailOzv: OZV.detail.test(t) || OZV.neniVete.test(t),
    vnim1: VNIM.test(prvni(t)), runa: najdi(t, p.runa).length > 0, zvuk2: p.smysl === 'sluch' ? (prvni2(t).match(ZVUK) || []).length > 0 : null };
});
fs.writeFileSync(path.join(DIR, 'mereni3.json'), JSON.stringify(R, null, 1));
const avg = a => a.reduce((s, v) => s + v, 0) / a.length, c = (xs, f) => xs.filter(f).length;
console.log('model            rameno  n  usek  usek>=5  v1    slov  rozkaz  ozvena(closer/first/detail)  vnimajici1  runa  zvuk2(sluch)');
for (const m of ['gpt-6-sol', 'claude-opus-4-8']) for (const a of ['prod', 'nova', 'detail']) {
  const xs = R.filter(r => r.model === m && r.rameno === a), s = xs.filter(r => r.smysl === 'sluch');
  console.log(m.padEnd(16) + a.padEnd(7) + String(xs.length).padStart(3) + '  ' + avg(xs.map(r => r.beh)).toFixed(2) + '  ' + String(c(xs, r => r.beh >= 5)).padStart(4) + '     '
    + avg(xs.map(r => r.v1p)).toFixed(2) + '  ' + avg(xs.map(r => r.slov)).toFixed(1) + '  ' + String(c(xs, r => r.imp)).padStart(4) + '    '
    + c(xs, r => r.closer) + '/' + c(xs, r => r.noticeFirst) + '/' + c(xs, r => r.detailOzv) + '                        ' + c(xs, r => r.vnim1) + '          ' + c(xs, r => r.runa) + '    ' + c(s, r => r.zvuk2) + '/' + s.length);
}
console.log('\n=== parove detail − prod (stejny prompt × model × opakovani)');
for (const m of ['gpt-6-sol', 'claude-opus-4-8']) {
  const d = [], dv = [];
  for (const x of R.filter(r => r.model === m && r.rameno === 'detail')) { const y = R.find(r => r.model === m && r.id === x.id && r.rep === x.rep && r.rameno === 'prod'); if (!y) continue; d.push(x.beh - y.beh); dv.push(x.v1p - y.v1p); }
  console.log(m.padEnd(16) + ' paru ' + d.length + ' · usek kratsi/stejny/delsi ' + d.filter(v => v < 0).length + '/' + d.filter(v => v === 0).length + '/' + d.filter(v => v > 0).length
    + ' · v1 mene/stejne/vic ' + dv.filter(v => v < 0).length + '/' + dv.filter(v => v === 0).length + '/' + dv.filter(v => v > 0).length);
  for (const h of ['A', 'B']) { const ys = R.filter(r => r.model === m && r.rameno === 'detail' && ((+r.id.slice(0, 2) <= 7) === (h === 'A'))); const zs = R.filter(r => r.model === m && r.rameno === 'prod' && ((+r.id.slice(0, 2) <= 7) === (h === 'A')));
    console.log('   pulka ' + h + ': v1 prod ' + avg(zs.map(r => r.v1p)).toFixed(2) + ' → detail ' + avg(ys.map(r => r.v1p)).toFixed(2) + ' · usek ' + avg(zs.map(r => r.beh)).toFixed(2) + ' → ' + avg(ys.map(r => r.beh)).toFixed(2)); }
  for (const rep of [1, 2]) { const ys = R.filter(r => r.model === m && r.rameno === 'detail' && r.rep === rep), zs = R.filter(r => r.model === m && r.rameno === 'prod' && r.rep === rep);
    console.log('   opakovani ' + rep + ': v1 ' + avg(zs.map(r => r.v1p)).toFixed(2) + ' → ' + avg(ys.map(r => r.v1p)).toFixed(2) + ' · usek ' + avg(zs.map(r => r.beh)).toFixed(2) + ' → ' + avg(ys.map(r => r.beh)).toFixed(2)); }
}
console.log('\n=== ozvena zneni v rameni detail');
for (const r of R.filter(r => r.rameno === 'detail' && r.detailOzv)) console.log(r.model.slice(0, 9).padEnd(10) + r.id.padEnd(16) + 'r' + r.rep + ' ' + r.text.split(/(?<=[.?!])\s+/).filter(s => /detail|does not name|the sentence/i.test(s)).join(' | '));
console.log('\n=== rozkaz na zacatku vety v rameni detail');
for (const r of R.filter(r => r.rameno === 'detail' && r.imp)) console.log(r.model.slice(0, 9).padEnd(10) + r.id.padEnd(16) + 'r' + r.rep + ' ' + r.text.split(/(?<=[.?!])\s+/).filter(s => /^(Look|See|Notice|Listen|Watch|Feel|Bend|Lean|Step)(?![a-z])/.test(s)).join(' | '));
