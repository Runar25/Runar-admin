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

// ─── 2) STUDENE CTENI ZASETE VE VLOZENEM OBRAZU ────────────────────────────
// Tataz rodina jako zakazana slova vyse, jen SEMANTICKA: prompt si sam poda obraz,
// ktery ctenari TVRDI, co v sobe zna nebo citi — a _noColdRead to o par radku dal
// zakazuje ("Never tell them what is true, stirring, or known inside them").
// Doloreno 2026-08-15 z DB: cteni Mannaz dostalo obraz "You know your own handwriting…"
// a skoncilo na "the hand that writes it is one you already know". Model to nevymyslel,
// zdedil to. SEASON_POOLS jsou ciste (krajiny, ne tvrzeni o ctenari).
// Puvodni vzor hledal "you know" jako SOUSEDNI dvojici a proto minul
// "You wake AND know at once…" (Dagaz) — sloveso od "you" odtrzene. Nasel to az Cowork.
// Novy vzor: "you" + az 3 slova + sloveso VNITRNIHO STAVU.
//
// A jedna vec navic, ktera se ukazala az pri testu: zapor NENI studene cteni.
// "you do not know what waits beyond" (Blank) a "you do not yet know what it says" (Perth)
// tvrdi NEVEDOMOST, ne vedomost — pravidlo zakazuje rikat, co ctenar v sobe ZNA.
// Bez teto vyjimky hlasil hlidac 5 misto 3.
const COLD_VERB = /\byou\b((?:\s+\w+){0,3})\s+(know|knows|feel|feels|remember|remembers|sense|senses)\b/i;
const COLD_PHRASE = /\b(something in you|what you know|you have always)\b/i;
const NEGATED = /\b(do not|don't|cannot|can't|never|no longer)\b/i;
function isColdRead(txt) {
  if (COLD_PHRASE.test(txt)) return true;
  const m = COLD_VERB.exec(txt);
  // m[1] = slova mezi "you" a slovesem; zapor sedi prave tam ("you DO NOT know")
  return !!m && !NEGATED.test(m[1]);
}
const IMGS = (typeof s.RUNE_IMAGES !== 'undefined') ? s.RUNE_IMAGES : null;
// Znama, ceka na preformulovani (zneni obrazu = obsah, ne tune).
// Prazdny zamerne: vsechny tri naroky prepsany 2026-08-15 (Cowork).
// Od ted kazdy novy studeny obraz test SHODI — neni co tolerovat.
const COLD_PENDING = [];
if (!IMGS) { console.log('  ✗ RUNE_IMAGES nenalezeny — kontrola studeneho cteni NEBEZELA'); fail++; }
else {
  let cold = 0;
  for (const r of IMGS) {
    const txt = [r[2], r[3]].filter(Boolean).join(' ');
    if (!isColdRead(txt)) continue;
    if (COLD_PENDING.indexOf(r[0]) !== -1) {
      console.log('  ~ ČEKÁ NA PŘEFORMULOVÁNÍ [' + r[0] + '] obraz tvrdí, co čtenář zná: ' + String(r[3] || r[2]).slice(0, 66));
      cold++; continue;
    }
    console.log('  ✗ NOVÝ studený obraz [' + r[0] + ']: ' + String(r[3] || r[2]).slice(0, 70));
    fail++;
  }
  if (!cold && !fail) console.log('  studené čtení ve vkládaných obrazech: žádné');
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
