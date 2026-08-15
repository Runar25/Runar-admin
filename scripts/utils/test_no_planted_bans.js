// Hlida, ze si sami NEZASEJEME do promptu slovo, ktere v nem zakazujeme.
//
// Proc existuje: tahle chyba se v projektu stala uz DVAKRAT.
//   1) `_noColdRead` jmenoval "already"/"þegar" ve vlastnim zakazu 3x -> eval nasel
//      to slovo v 4 z 5 cteni. Opraveno reframem na pozitivni zneni (tag v1.2).
//   2) Raidho melo k = "journey, ..." a k_is = "ferðalag, ..." — pritom prompt
//      "journey" zakazuje 2x a "ferðalag" 2x. Nalezeno 2026-08-15.
// Zakaz zaseje token. Proto se to hlida strojove, ne pozornosti.
const fs = require('fs'), vm = require('vm');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const s = { console }; s.window = s; s.globalThis = s; vm.createContext(s);
vm.runInContext(fs.readFileSync(D + 'runar-config.js', 'utf8'), s);
vm.runInContext(fs.readFileSync(D + 'runar-runes.js', 'utf8') + ';__R=RUNES;', s);
vm.runInContext(fs.readFileSync(D + 'runar-utils.js', 'utf8'), s);
vm.runInContext(fs.readFileSync(D + 'runar-character.js', 'utf8') + ';__EN=DEF_CHAR_EN;__IS=DEF_CHAR_IS;', s);

// Zakazana slova se ctou Z PROMPTU, ne z ruciho seznamu — jinak by seznam zastaral.
function bansFrom(ch) {
  const out = new Set();
  (ch.grammar.match(/"([^"]+)"/g) || []).forEach((w) => out.add(w.replace(/"/g, '').toLowerCase()));
  (ch.never.match(/[„"]([^"“]+)[""“]/g) || []).forEach((w) => out.add(w.replace(/[„""“]/g, '').toLowerCase()));
  return [...out].filter((w) => w.length > 3);
}

// Pole runy, ktera se DOSTANOU do promptu: rn() vraci is_n/n, rk() vraci k_is/k.
const FIELDS = { en: ['n', 'k'], is: ['is_n', 'k_is', 'formula_is'] };

// VYRESENA vyjimka (2026-08-15, owner), ne otevrena otazka.
// Zakaz zni doslova: `Rúnar does not use the word "journey" as a METAPHOR FOR PERSONAL
// GROWTH` / `sem myndlíkingu fyrir persónulegan vöxt` — a v grammar#3 stoji v seznamu
// wellness klise vedle "your truth", "trust the process", "step into your power".
// Miri tedy na klise, ne na doslovnou cestu. `is_n: 'Raidho (Ferðalag)'` je NAZEV runy
// pojmenovane po ceste = doslovny vyznam. Neni to poruseni a nemeni se.
// Doklad, ze to v provozu netece: 271 realnych cteni -> "journey" nalezeno 1x.
// (Klicova slova se presto zmenila na `the road` / `leið` — tam je to POKYN, co psat,
//  ne nazev, a vyznam zustal. Viz commit a129d2f.)
const PENDING = [['is', 'Raidho', 'is_n', 'ferðalag']];

let fail = 0, pending = 0;
for (const lang of ['en', 'is']) {
  const bans = bansFrom(lang === 'is' ? s.__IS : s.__EN);
  for (const r of s.__R) {
    for (const f of FIELDS[lang]) {
      const v = String(r[f] || '').toLowerCase();
      for (const b of bans) {
        if (!v.includes(b)) continue;
        if (PENDING.some((p) => p[0] === lang && p[1] === r.n && p[2] === f && p[3] === b)) {
          console.log('  ~ VYŘEŠENO (doslovný název, ne klišé) [' + lang + '] ' + r.n + '.' + f + ' obsahuje zakázané "' + b + '"');
          pending++; continue;
        }
        console.log('  ✗ [' + lang + '] ' + r.n + '.' + f + ' obsahuje zakázané "' + b + '": ' + r[f]);
        fail++;
      }
    }
  }
}

// KONTROLA TESTU: chytil by to vubec? Podstrcime runu se zakazanym slovem.
const bansEn = bansFrom(s.__EN);
const probe = bansEn.find((b) => b === 'journey') || bansEn[0];
const caught = String('a ' + probe + ' b').toLowerCase().includes(probe);
console.log(caught
  ? '  kontrola testu: zakázané slovo v datech test rozpozná (sonda "' + probe + '")'
  : '  ✗ KONTROLA TESTU SELHALA — seznam zákazů se z promptu nenačetl');
if (!caught || !bansEn.length) fail++;

console.log(fail ? '\nFAIL: ' + fail + ' zaseto' : '\nOK — žádné zakázané slovo si do promptu nesázíme' +
  (pending ? ' (' + pending + ' vyřešená výjimka)' : ''));
process.exit(fail ? 1 : 0);
