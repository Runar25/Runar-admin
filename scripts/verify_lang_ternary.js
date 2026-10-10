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
// ⚠️ 2026-10-10 (CODE-read): ani tahle verze neviděla větev, která NEZAČÍNÁ uvozovkou — `lang === 'is' ? vn('cast', n, 'is') + ' fyrir
// venjulegar dregnar rúnir' : …` (runar-tree.js, živý řádek v záložce životní runy) a `TIERS.standard.label_is + ' - kemur bráðlega…'`
// (runar-auth.js). Počítá se proto islandská větev (od `?` po její `:`) a v ní literály na NEJVYŠŠÍ úrovni: obsahuje-li některý
// písmeno a není to jen 'is'/'en' (výběr jazyka), je to text natvrdo. Literál v argumentu volání (`vn('cast', …)`, `t('key')`)
// se nepočítá — to je klíč, ne text. Literál ZA větví taky ne (falešně hlásilo `(lang === 'is' ? a : b).replace('{F}', …)`).
// ⚠️ 2026-10-10 (CODE-read, nález CODE-tune): ani pak neviděla větev přes ZKRATKU — `var isIs = lang === 'is'; … isIs ? '…' : '…'`
// (i `is`, `je`) — ani jiné jméno jazykové proměnné (`L === 'is'`, `_lifeRuneLang === 'is'`). Tři živé UI texty tak prošly zeleně
// (boční panel, počet v deníku, „Þú ber lífsrún…“ — CODE-tune je přesunul, e9c1e96). Teď: jazyková proměnná = cokoli končící
// na lang/Lang, nebo lng/l/L; zkratky (`X = <jazyk> === 'is';` bez `?`) si kontrola v každém souboru najde SAMA a jejich `X ? …`
// počítá stejně. Text = literál s písmenem, který NENÍ identifikátor-like (`'block'`, `'label_is'`, `'none'` = hodnota/klíč, ne
// text — falešné nálezy prvního běhu) ani locale (`'is-IS'`).
const LANGVAR = String.raw`(?:[\w$]*[Ll]ang|lng|l|L)`;
const CMP = String.raw`\b` + LANGVAR + String.raw`\s*===?\s*['"]is['"]`;
function aliasy(txt) {
  const out = new Set();
  const re = new RegExp(String.raw`\b(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*=\s*\(?\s*` + CMP + String.raw`\s*\)?\s*[;,\n]`, 'g');
  for (const m of txt.matchAll(re)) out.add(m[1]);
  return [...out];
}
function hlavy(txt) {
  const alt = [CMP + String.raw`\s*\)?`].concat(aliasy(txt).map((a) => String.raw`(?<![\w$.])` + a.replace(/\$/g, '\\$') + String.raw`(?![\w$])`));
  return new RegExp('(?:' + alt.join('|') + String.raw`)\s*\?`, 'g');
}
// Stav 2026-10-09. Snižovat, nikdy nezvyšovat — nový text patří do UI_TEXT (runar-translations.js) a čte se přes t()/tp().
// 2026-10-09 runar-app.js 26 → 24: CODE-tune smazal mrtvý blok starého data ve formuláři čtení (dob-lbl, report 58a0c728).
// 2026-10-10: přepočet bez výběru jazyka; auth 7 → 0 a tree 3 → 0 přesunuty do UI_TEXT (CODE-read). character 2 a utils 1
// jsou text PROMPTU (patří do jazykových balíčků RP_*, doména CODE-tune), ne UI.
// 2026-10-10 CODE-tune: app 24 → 0, reading 7 → 0 (UI_TEXT), character 2 → 0, utils 1 → 0 (data po jazycích) — ráčna vyprázdněna.
// 2026-10-10 CODE-read: rozšířená detekce (viz HEAD) našla dvě → ráčna je drží, než je CODE-tune přesune (RUNAR_BACKLOG část 17).
// auth = openUpgradeModal (mrtvý, nikdo ho nevolá) · tree = řádek volných čtení v záložce životní runy (živý).
// 2026-10-10 CODE-tune: obě pryč — tree → UI_TEXT tree_rs_free_line, auth openUpgradeModal smazán (nikdo ho nevolal). Ráčna zase na nule.
// 2026-10-10 CODE-read: zkratky + další jména jazykové proměnné (viz výš) → nový stav. auth = návod k instalaci (Safari/Chrome, UI),
// config = „Allt sem … hefur“ ve výpisu tierů (UI), character + utils = text a značky PROMPTU (balíčky RP_*, doména CODE-tune).
const BASELINE = { 'runar-auth.js': 2, 'runar-character.js': 15, 'runar-config.js': 1, 'runar-utils.js': 7 };
// Literály na nejvyšší úrovni islandské větve; větev končí `:`, `;` nebo `,` mimo závorky, nebo zavřením vnější závorky.
function litVeVetvi(txt, from) {
  const out = [];
  let hl = 0;
  for (let i = from; i < txt.length && i < from + 600; i++) {
    const c = txt[i];
    if (c === "'" || c === '"' || c === '`') {
      let j = i + 1, v = '';
      while (j < txt.length && txt[j] !== c) { if (txt[j] === '\\') { v += txt[j + 1] || ''; j += 2; continue; } v += txt[j++]; }
      if (hl === 0) out.push(v);
      i = j;
      continue;
    }
    if (c === '(' || c === '[' || c === '{') hl++;
    else if (c === ')' || c === ']' || c === '}') { if (--hl < 0) break; }
    else if ((c === ':' || c === ';' || c === ',') && hl === 0) break;
  }
  return out;
}
const jeText = (v) => /[A-Za-zÀ-ž]/.test(v) && !/^[a-z][a-z0-9_-]*$/.test(v) && !/^[a-z]{2}-[A-Z]{2}$/.test(v);
function pocet(txt) {
  let n = 0, m;
  const HEAD = hlavy(txt);
  while ((m = HEAD.exec(txt))) {
    // V komentáři to není kód — character.js a utils.js tak popisují, co se odkud přesunulo (falešně 2026-10-10).
    if (txt.slice(txt.lastIndexOf('\n', m.index) + 1, m.index).includes('//')) continue;
    if (litVeVetvi(txt, m.index + m[0].length).some(jeText)) n++;
  }
  return n;
}

if (process.argv.includes('--test')) {
  // Životní cyklus (memory guard-test-the-lifecycle): čistý text 0 · přidaná větev +1 · t() se nepočítá · jiné porovnání ne.
  const ok = pocet("setText('a', t('x'));") === 0
    && pocet("setText('a', lang === 'is' ? 'Já' : 'Me');") === 1
    && pocet('x = lng==="is"?`Halló`:`Hello`;') === 1
    && pocet("if (lang === 'is') doIt();") === 0
    && pocet("v = lang === 'en' ? 'a' : 'b';") === 0
    && pocet("var b = UI_TEXT[lang === 'is' ? 'is' : 'en'];") === 0   // výběr jazyka není text (2026-10-10)
    && pocet("x = lang === 'is' ? 'Íslenska' : 'English';") === 1
    && pocet("el.textContent = lang === 'is' ? vn('cast', n, 'is') + ' fyrir rúnir' : vn('cast', n, 'en') + ' left';") === 1   // 2026-10-10
    && pocet("x = lang === 'is' ? a : b;") === 0
    && pocet("v = (lang === 'is' ? mapIs[i] : mapEn[i]).replace('{F}', f);") === 0   // literál za větví (2026-10-10)
    && pocet("x = lang === 'is' ? vn('cast', n, 'is') : vn('cast', n, 'en');") === 0   // klíč v argumentu není text (2026-10-10)
    && pocet("x = lang === 'is' ? t('a') + ' — ' + t('b') : t('c');") === 0   // jen interpunkce bez písmen
    && pocet("// přesunuto z `lang === 'is' ? …` do dat") === 0   // zmínka v komentáři (2026-10-10)
    // 2026-10-10 zkratky a jiná jména jazykové proměnné:
    && pocet("var isIs = lang === 'is';\nel.innerHTML = isIs ? 'Í Safari: ýttu' : 'In Safari: tap';") === 1
    && pocet("var is = (lang === 'is');\nreturn is ? 'óþekktur mánuður' : 'unknown month';") === 1
    && pocet("var jm = L === 'is' ? 'Allt sem ' + x : 'Everything ' + x;") === 1
    && pocet("var show = (lang === 'is');\nrow.style.display = show ? 'block' : 'none';") === 0   // hodnota CSS není text
    && pocet("var isIs = lang === 'is';\nvar k = isIs ? 'label_is' : 'label';") === 0          // jméno klíče není text
    && pocet("var isIs = lang === 'is';\nd.toLocaleDateString(isIs ? 'is-IS' : 'en-GB');") === 0   // locale není text
    && pocet("var isIs = lang === 'is';\nvar x = isIsland ? 'Halló' : 'Hello';") === 0;          // jiné slovo, jen začíná stejně
  console.log(ok ? 'OK    samotest: větev se pozná (i přes zkratku), t(), klíče, CSS, locale a jiné porovnání ne' : 'FAIL  samotest regexu');
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
