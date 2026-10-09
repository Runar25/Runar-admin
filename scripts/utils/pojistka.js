// Pojistka v odpovědi (Ask i čtení): JEDEN detektor pro laby a rozbory — ať ji každý pokus nepočítá po svém.
//
// Proč (2026-10-09, RUNAR_EVAL_LOG.md 2026-10-09 (1)): lab 2026-10-06 počítal pojistku regexem RE_DNS
// (docs/eval/2026-10-06-ask-otazky/rozbor_slova.js), který neviděl „leave(s) room for…“. Po v5.03 se pojistka přesunula
// právě do toho tvaru (produkce 9/82 → 8/17, p = 0,001) a lab hlásil pokles 26 → 14 ze 30 místo skutečných 28 → 20.
// Měřák, který nevidí náhradní tvar, ukáže „opraveno“ i tam, kde se vada jen převlékla (CLAUDE.md §27).
// Shody přečtené ručně (produkce sol, 17 Asků po v5.03): „makes room for the other's pace“ je obsah, ne pojistka —
// proto jen LEAVE(S) room for, ne make / give / keep room.
// Hranice: anglicky. Islandský detektor pojistky neexistuje (stejně jako studeného čtení, RUNAR_BACKLOG.md).
//   const { POJISTKA, TVARY } = require('./pojistka');   POJISTKA.test(text) · TVARY = tvary zvlášť pro rozpad v tabulce
'use strict';
const TVARY = {
  'X does not say / show / settle…': /\b(does|do|did) ?n[o'’]?t (say|tell|settle|show|decide|point|prove|promise|reveal|guarantee)\b/i,
  'leaves / keeps … open · both possibilities': /\bleaves? [^.?!]{0,30}\bopen\b|\bkeeps? [^.?!]{0,30}\bopen\b|\bboth possibilities\b/i,
  'leave(s) room for': /\bleaves? (room|space) for\b/i,
  'not a promise / verdict / sign': /\bnot an? (promise|verdict|prediction|sign|warning)\b/i,
};
const POJISTKA = new RegExp(Object.values(TVARY).map((r) => r.source).join('|'), 'i');
module.exports = { POJISTKA, TVARY };
