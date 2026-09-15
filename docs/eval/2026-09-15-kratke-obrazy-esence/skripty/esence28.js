// Owner 2026-09-14: "its sense in plain words a stranger to runes can grasp — dokáže Rúnar tuhle větu předat do čtení?"
// Měřím na výstupu: 28 esenčních vět ze všech testovacích čtení 2026-09-12/14 (krátké obrazy, 10 run, Isa+Raidho, A/B).
// (1) tvar „<Runa> is …" · (2) obsahuje větu z RUNES[].k té runy (celé slovo, množné číslo povoleno) — prosté slovo významu.
'use strict';
const fs = require('fs'), vm = require('vm');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const S = { console: { log() {} }, window: {}, document: { getElementById: () => null } };
S.globalThis = S; S.lang = 'en';
vm.createContext(S);
vm.runInContext(fs.readFileSync(D + 'runar-runes.js', 'utf8'), S);
const RUNES = vm.runInContext('RUNES', S);
const E = [
  ['K1', 'Algiz', 'Algiz is that stone taking the wind so something small can stay green.'],
  ['K2', 'Algiz', 'Algiz is that watch kept from higher air, a wing spread over the field.'],
  ['K3', 'Jera', 'Jera is that slow rising no hand can hurry, the warmth doing its share.'],
  ['P01', 'Jera', 'Jera is the grass going gold and the goose going south, each at its own pace.'],
  ['P02', 'Blank', 'Blank is that still water, leaving room for what has not crossed yet.'],
  ['P03', 'Mannaz', 'Mannaz is knowing your own wing while the whole flock moves.'],
  ['P04', 'Dagaz', 'Dagaz is the instant the wings stop pushing and the air takes the weight.'],
  ['P05', 'Isa', 'Isa is that water, holding still while the whole sky moves over it.'],
  ['P06', 'Ingwaz', 'Ingwaz is that long quiet on the water, gathering until it becomes flight.'],
  ['P07', 'Fehu', 'Fehu is what moves like that, carried far and set down in someone else\'s field.'],
  ['P08', 'Sowilo', 'Sowilo is that light settling on anything that rises to meet it.'],
  ['P09', 'Eihwaz', 'Eihwaz is the root holding fast in the dark while the sky moves on.'],
  ['P10', 'Raidho', 'Raidho is that steady beat kept between wing and wind.'],
  ['I1', 'Isa', 'Isa is the road held still, nothing moving on it and nothing lost beneath it.'],
  ['I2', 'Isa', 'Isa is the grip that keeps a thing exactly where it lies.'],
  ['I3', 'Isa', 'Isa is that stillness closing over the top, keeping everything underneath just as it was.'],
  ['I4', 'Isa', 'Isa is this holding still, the pause that keeps everything where it lies.'],
  ['I5', 'Isa', 'Isa is that hour held whole, nothing taken from it and nothing added.'],
  ['N1', 'Raidho', 'Raidho is the road remembered, even while nothing travels it.'],
  ['N2', 'Raidho', 'Raidho is that track, going on where the water has stopped.'],
  ['N3', 'Raidho', 'Raidho is that warmth taking its own road, from the cup into moving air.'],
  ['N4', 'Raidho', 'Raidho is the steady stroke that turns still water into a way across.'],
  ['N5', 'Raidho', 'Raidho is the wind that keeps moving through, while the hands stay put.'],
  ['A', 'Isa', 'Isa is that hold, keeping what lies above and below the water in place.'],
  ['B', 'Isa', 'Isa is water held so still that the dark stones below come into view.'],
  ['MA', 'Mannaz', 'Mannaz is the mind holding on to others longer than to its own errands.'],
  ['MB', 'Mannaz', 'Mannaz is that keeping between minds, what people carry for each other after the cause is gone.'],
  ['ASK', 'Isa', 'Isa keeps each thing in its place until the light can reach the bottom.'],
];
let tvar = 0, klic = 0;
for (const [id, runa, veta] of E) {
  const k = RUNES.find(r => r.n === runa).k.split(',').map(x => x.trim().toLowerCase());
  const lc = veta.toLowerCase();
  const hit = k.filter(w => new RegExp('\\b' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + 's?\\b').test(lc));
  const jeTvar = new RegExp('^' + runa + ' is\\b').test(veta);
  if (jeTvar) tvar++; if (hit.length) klic++;
  console.log(id.padEnd(4) + (jeTvar ? ' „X is"' : ' jiný  ') + ' · klíč: ' + (hit.join(', ') || '—'));
}
console.log('\ncelkem ' + E.length + ' · tvar „<Runa> is …" ' + tvar + ' · obsahuje slovo z RUNES[].k: ' + klic);
