// Lab 2026-11-24: tři cílené zkoušky na produkčním promptu v2 — v každé se mění JEDEN kus zadání (owner „6. ok“, „4. moderní významy bych
// chtěl vidět ve čtení a také stín“). Skládá produkční zadání (../../2026-11-09-v2-vyklad-z-v3/gemini-gpt-4vety/vypis_v2.js) a podle pole
// `pokus` vymění:
//   P17 (K4)  Confirmation: konec „dvě možnosti“ → konec „podmínka“ (owner 2026-11-24: „pro confirmation by to mělo být lepší“)
//   P10 (K3)  pocit, který člověk zvolil: zrcadlení (stránka runy, která ho potká) × kontrast (stránka, kterou pocit snadno přehlédne)
//   P20 (K2+K3) moderní význam (téma + rozšířené významy z tabulky GPT 2026-11-02) do hlavičky + stín jako zdroj pro větu 3
// Úloha: { id, pokus, runa, seed, area, seeking, intention, pocit?, rezim?, moderni?: {tema, siri, stin} }. Nic nevolá.
'use strict';
const { postav: v2 } = require('../../2026-11-09-v2-vyklad-z-v3/gemini-gpt-4vety/vypis_v2.js');
function jednou(t, re, novy, co) { const m = t.match(re); if (!m) throw new Error('v zadání chybí ' + co); return t.replace(re, novy); }
function postav(u) {
  const x = v2(u), R = u.runa;
  if (u.pokus === 'P17') {
    x.p = jednou(x.p, /End on one line that holds out two things this may be (.+?), each a state that may be so[^.]*\./,
      (m, L) => 'End on one line that names what this would rest on ' + L + ': the one condition under which it holds, said plainly — never a yes, never a no, never what to do.', 'konec „dvě možnosti“');
  } else if (u.pokus === 'P10') {
    const kam = u.rezim === 'zrcadleni' ? 'the side of ' + R + ' that meets this' : 'the side of ' + R + ' that this feeling can easily overlook';
    x.p = jednou(x.p, /^End on one /m, 'WHAT FEELS CLOSEST TO THE SEEKER RIGHT NOW (they chose it themselves): ' + u.pocit + '. Let the reading turn toward ' + kam
      + '. You may name the word they chose; say nothing more about what they feel.\nEnd on one ', 'konec');
  } else if (u.pokus === 'P20') {
    x.p = jednou(x.p, /^DRAWN RUNE: (\S+) — focus on: [^\n]*/m, 'DRAWN RUNE: ' + R + ' — focus on: ' + u.moderni.tema + '; also known as: ' + u.moderni.siri, 'hlavička runy');
    x.p = jednou(x.p, /^End on one /m, 'THE SHADOW OF ' + R.toUpperCase() + ' (your source, not words to repeat): ' + u.moderni.stin
      + '. Let the sentence before the last touch it without naming it a shadow.\nEnd on one ', 'konec');
  } else throw new Error('neznámý pokus ' + u.pokus);
  x.draws = Object.assign({}, x.draws, { pokus: u.pokus });
  return x;
}
module.exports = { postav };
if (require.main === module) for (const f of process.argv.slice(2)) for (const u of require(require('path').resolve(f))) { const x = postav(u); console.log('==== ' + u.id + '\n' + x.p + '\n'); }
