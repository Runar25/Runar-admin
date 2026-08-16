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
// ⚠️ ISLANDSKA VETEV. Do 2026-08-16 tenhle hlidac umel jen `\byou\b`, jenze
// RUNE_IMAGES ma islandstinu v r[2] a anglictinu v r[3] — vsech 81 islandskych obrazu
// tedy neprosle NIKDY zadnou kontrolou. Hlidac koukal na pulku toho, co hlidal.
// `\b` na islandstinu NELZE: JS ji ma na [A-Za-z0-9_], takze mezi mezerou a "þ" hranice
// slova NENI a /\bþekkir\b/ nesedne nikdy. Proto lookaround nad islandskou abecedou —
// a to i u ZAPORU, protoze /\bekki\b/ se trefi dovnitr slova "þekki" a skutecny nalez
// by umlcelo. (Tataz chyba byla tyz den na trech mistech v measure_readings.js.)
const IS_L = 'a-záðéíóúýþæöA-ZÁÐÉÍÓÚÝÞÆÖ';
const isb = (w) => '(?<![' + IS_L + '])(?:' + w + ')(?![' + IS_L + '])';
// ⚠️ `finnur` jen ve spojeni — samo o sobe znamena i NAJIT ("Þú finnur skjól" = obraz
// Wunjo, ne narok na nitro). Viz tataz oprava v measure_readings.js.
const IS_COLD = new RegExp(isb('þú') + '(?:\\s+[' + IS_L + ']+){0,3}\\s+' +
                           '(?:' + isb('veist|manst|skynjar|þekkir|kannast') +
                           '|' + isb('finnur') + '\\s+(?:að|hvernig|til|fyrir)' + ')', 'i');
const IS_SOLO = new RegExp(isb('veist|manst|veistu|manstu'), 'i');
const IS_NEG  = new RegExp(isb('ekki|aldrei|hvorki|ekkert|hvergi'), 'i');
// ⚠️ ZAPOR SE HLEDA VE VETE, NE V CELEM TEXTU. Prvni verze testovala IS_NEG pres cely
// predany retezec — u jedne vety to vypada stejne, ale u profilu (pet vyskytu "ekki")
// to CELOU kontrolu vyplo a hlasilo "ciste". Nalezeno vlastnim utokem 2026-08-16.
function _vetaKolem(txt, i) {
  const a = Math.max(txt.lastIndexOf('.', i), txt.lastIndexOf('\n', i));
  let b = txt.indexOf('.', i); if (b === -1) b = txt.length;
  return txt.slice(a + 1, b + 1);
}
function isColdReadIS(txt) {
  for (const re of [IS_COLD, IS_SOLO]) {
    const m = re.exec(txt);
    if (m && !IS_NEG.test(_vetaKolem(txt, m.index))) return true;
  }
  return false;
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
    // r[2] = IS, r[3] = EN — kazdy svym detektorem. Slit je do jednoho retezce
    // a pustit na nej anglicky vzor bylo prave to, cim islandstina propadla.
    if (!isColdRead(String(r[3] || '')) && !isColdReadIS(String(r[2] || ''))) continue;
    if (COLD_PENDING.indexOf(r[0]) !== -1) {
      console.log('  ~ ČEKÁ NA PŘEFORMULOVÁNÍ [' + r[0] + '] obraz tvrdí, co čtenář zná: ' + String(r[3] || r[2]).slice(0, 66));
      cold++; continue;
    }
    console.log('  ✗ NOVÝ studený obraz [' + r[0] + ']: ' + String(r[3] || r[2]).slice(0, 70));
    fail++;
  }
  if (!cold && !fail) console.log('  studené čtení ve vkládaných obrazech: žádné');
}

// ─── 3) VOICE_PROFILES ─────────────────────────────────────────────────────
// Proc pribylo (2026-08-16): produkcni profil `focused` mel ve svem CTVRTEM vzoru
// vetu "You know this shore — your feet find the way…" / "Þú þekkir þessa fjöru…".
// To je presne to, co `_noColdRead` o par radku dal zakazuje — a model vzor napodobi
// spolehliveji nez zakaz, protoze vzor je konkretni a zakaz abstraktni.
// Hlidac se do te chvile dival jen na RUNES a RUNE_IMAGES, tedy na vsechno KROME
// mista, kde hlas doopravdy bydli.
// ⚠️ `const` v modulu se NENAPOJI na objekt kontextu — `s.VOICE_PROFILES` je undefined
// i kdyz je promenna v sandboxu ziva. Musi se cist pres runInContext (tataz past, kvuli
// ktere driv tise mizel SEEKS a stavely se prazdne prompty).
let VP = null;
try { VP = vm.runInContext('VOICE_PROFILES', s); } catch (e) { VP = null; }
if (!VP) { console.log('  ✗ VOICE_PROFILES nenalezeny — kontrola profilu NEBEZELA'); fail++; }
else {
  let vpBad = 0;
  for (const key of Object.keys(VP)) {
    for (const lang of ['en', 'is']) {
      const txt = String(VP[key][lang] || '');
      if (!txt) continue;
      if (lang === 'is' ? isColdReadIS(txt) : isColdRead(txt)) {
        console.log('  ✗ STUDENÉ ČTENÍ ve vzorech profilu [' + key + ' ' + lang + ']');
        fail++; vpBad++;
      }
      for (const b of bansFrom(lang === 'is' ? s.__IS : s.__EN)) {
        if (!txt.toLowerCase().includes(b)) continue;
        console.log('  ✗ ZAKÁZANÉ "' + b + '" ve vzorech profilu [' + key + ' ' + lang + ']');
        fail++; vpBad++;
      }
    }
  }
  if (!vpBad) console.log('  hlasové profily (' + Object.keys(VP).length + '): čisté v obou jazycích');
}

// KONTROLA TESTU: chytil by to vubec? Podstrcime runu se zakazanym slovem.
const bansEn = bansFrom(s.__EN);
const probe = bansEn.find((b) => b === 'journey') || bansEn[0];
const caught = String('a ' + probe + ' b').toLowerCase().includes(probe);
console.log(caught
  ? '  kontrola testu: zakázané slovo v datech test rozpozná (sonda "' + probe + '")'
  : '  ✗ KONTROLA TESTU SELHALA — seznam zákazů se z promptu nenačetl');
if (!caught || !bansEn.length) fail++;

// Sondy na SAMOTNE DETEKTORY. Bez nich muze byt cela vetev mrtva a test hlasi OK —
// presne to se stalo islandske vetvi v measure_readings.js (2026-08-16).
const SONDY = [
  [isColdRead,   'You know this shore already.',                 true,  'EN nárok'],
  [isColdRead,   'You do not know what waits beyond.',           false, 'EN zápor'],
  [isColdRead,   'The river runs grey over black sand.',         false, 'EN běžný text'],
  [isColdReadIS, 'Þú þekkir þessa fjöru vel.',                   true,  'IS nárok (þ — past s \\b)'],
  [isColdReadIS, 'Þú veist hvað bíður.',                         true,  'IS nárok'],
  [isColdReadIS, 'Þú finnur skjól og vindurinn hættir.',          false, 'IS: finnur = NAJDE'],
  [isColdReadIS, 'Þú finnur að eitthvað er breytt.',              true,  'IS: finnur að = cítí'],
  [isColdReadIS, 'Þú veist ekki hvað bíður.',                    false, 'IS zápor'],
  [isColdReadIS, 'Jökuláin rennur grá yfir svartan sand.',       false, 'IS běžný text'],
];
let sondaBad = 0;
for (const [fn, txt, want, label] of SONDY) {
  if (fn(txt) !== want) { console.log('  ✗ SONDA SELHALA (' + label + '): ' + txt); sondaBad++; }
}
if (sondaBad) fail += sondaBad;
else console.log('  kontrola detektorů: EN i IS poznají nárok, zápor i běžný text');

console.log(fail ? '\nFAIL: ' + fail + ' zaseto' : '\nOK — žádné zakázané slovo si do promptu nesázíme' +
  (pending ? ' (' + pending + ' vyřešená výjimka)' : ''));
process.exit(fail ? 1 : 0);
