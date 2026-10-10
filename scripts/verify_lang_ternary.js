// Smoke ㉸ — text natvrdo v podobě `lang === 'is' ? '…' : '…'` nesmí přibývat (CLAUDE.md §10: NULA hardcoded strings v logice).
//
// Proč (2026-10-09, kontrola architektury, CODE-read; DECISIONS 2026-10-09 (15)): §10 říká „t('key') ze UI_TEXT“, ale v2/*.js
// měl 44 takových větví (záložky, brány návštěvníka, souhlas, přihlašovací okno…) — kontrola ② je nevidí, protože hledá
// typické anglické fráze, ne větvení podle jazyka. Seznam „known offenders“ ve working-style.md je z 2026-06-12 a tyhle
// neobsahuje. Přepsat je všechny = islandský text přes UI_TEXT a ověření (§2), na to tahle kontrola nečeká.
// Co dělá: RÁČNA. Počet na soubor nesmí stoupnout nad BASELINE. Klesne-li (někdo je přesunul do UI_TEXT), kontrola projde
// a připomene snížit BASELINE, ať se uvolněné místo znovu nezaplní.
//   node scripts/verify_lang_ternary.js          · node scripts/verify_lang_ternary.js --test (kontrola sama sebe)
'use strict';
const fs = require('fs'), path = require('path');
const DIR = path.join(__dirname, '..', 'v2');
// ⚠️ 2026-10-10: první verze počítala i `lang === 'is' ? 'is' : 'en'` — to není text, jen výběr jazykového bloku dat, a §10
// ho nezakazuje. Hlásilo to 57 místo 44 (13 falešných, nalezeno při přepisu prvních větví). Negativní výhled je vyřazuje.
const RE = /\b(lang|lng|l|_lang)\s*===\s*['"]is['"]\s*\?\s*(['"`])(?!is\2\s*:\s*['"`]en['"`])/g;
// Stav 2026-10-09. Snižovat, nikdy nezvyšovat — nový text patří do UI_TEXT (runar-translations.js) a čte se přes t()/tp().
// 2026-10-09 runar-app.js 26 → 24: CODE-tune smazal mrtvý blok starého data ve formuláři čtení (dob-lbl, report 58a0c728).
// 2026-10-10: přepočet bez výběru jazyka; auth 7 → 0 a tree 3 → 0 přesunuty do UI_TEXT (CODE-read). character 2 a utils 1
// jsou text PROMPTU (patří do jazykových balíčků RP_*, doména CODE-tune), ne UI.
// 2026-10-10 CODE-tune: app 24 → 0, reading 7 → 0 (UI_TEXT), character 2 → 0, utils 1 → 0 (data po jazycích) — ráčna vyprázdněna.
const BASELINE = {};
const pocet = (txt) => (txt.match(RE) || []).length;

if (process.argv.includes('--test')) {
  // Životní cyklus (memory guard-test-the-lifecycle): čistý text 0 · přidaná větev +1 · t() se nepočítá · jiné porovnání ne.
  const ok = pocet("setText('a', t('x'));") === 0
    && pocet("setText('a', lang === 'is' ? 'Já' : 'Me');") === 1
    && pocet('x = lng==="is"?`a`:`b`;') === 1
    && pocet("if (lang === 'is') doIt();") === 0
    && pocet("v = lang === 'en' ? 'a' : 'b';") === 0
    && pocet("var b = UI_TEXT[lang === 'is' ? 'is' : 'en'];") === 0   // výběr jazyka není text (2026-10-10)
    && pocet("x = lang === 'is' ? 'isl' : 'eng';") === 1;
  console.log(ok ? 'OK    samotest: větev se pozná, t() a jiné porovnání ne' : 'FAIL  samotest regexu');
  process.exit(ok ? 0 : 1);
}

let fail = false, nizsi = [];
const souhrn = [];
for (const f of fs.readdirSync(DIR).filter((x) => x.endsWith('.js')).sort()) {
  const n = pocet(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const max = BASELINE[f] || 0;
  if (n > max) { fail = true; console.log('FAIL  ' + f + ': ' + n + ' větví `lang === \'is\' ? \'…\'` (smí nejvýš ' + max + ') — nový text dej do UI_TEXT a čti přes t()'); }
  else if (n < max) nizsi.push(f + ' ' + n + ' < ' + max);
  if (n) souhrn.push(f.replace('runar-', '').replace('.js', '') + ' ' + n);
}
if (nizsi.length) console.log('ℹ  ubylo (sniž BASELINE ve scripts/verify_lang_ternary.js): ' + nizsi.join(' · '));
console.log(fail ? 'FAIL  text natvrdo podle jazyka přibyl (§10)'
  : 'OK    text natvrdo podle jazyka nepřibyl (§10, ráčna): ' + (souhrn.length ? souhrn.join(' · ') : 'žádný v žádném souboru'));
process.exit(fail ? 1 : 0);
