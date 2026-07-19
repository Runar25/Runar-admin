// Cena spreadu má JEDNOHO vlastníka: SPREAD_COSTS v runar-config.js.
//
// PROČ tahle kontrola vznikla (2026-07-19): cena je dnes na TŘECH místech.
//   1) SPREAD_COSTS            <- vlastník
//   2) SPREAD_CONFIG.credits   <- MRTVE pole, nikdo ho necetl (smazano 2026-07-19)
//   3) tabulka v RUNAR_PRICING.md
// Nic nehlídalo, že se shodují. Přecenění znamená změnit tři místa a na to,
// že jsi jedno zapomněl, přijdeš až tím, že se uživateli strhne jiná částka,
// než jakou viděl. Přesně takhle vznikl „founding ritual free" — doc sliboval
// jedno, kód dělal druhé, a mezi nimi nebyl nikdo.
//
// ⑰ (verify_doc_values.js) tuhle třídu neuměla: znala natvrdo jen čísla 50/75
// a hlásila je ŽLUTĚ. Ceny odvozuje tahle kontrola z configu, takže chytí
// i cenu, která ještě neexistuje.
//
//   node scripts/verify_spread_prices.js
const { execSync } = require('child_process');
const fs = require('fs');

const R = 'C:/Users/zkuku/Downloads/Runar-admin';
const cfg = fs.readFileSync(R + '/v2/runar-config.js', 'utf8');

// ── vlastník: SPREAD_COSTS ────────────────────────────────────────────
function block(name) {
  const m = cfg.match(new RegExp('const\\s+' + name + '\\s*=\\s*\\{'));
  if (!m) return null;
  let i = m.index + m[0].length, depth = 1;
  for (; i < cfg.length && depth; i++) {
    if (cfg[i] === '{') depth++;
    else if (cfg[i] === '}') depth--;
  }
  return cfg.slice(m.index, i);
}

const costsSrc = block('SPREAD_COSTS');
const configSrc = block('SPREAD_CONFIG');
if (!costsSrc) { console.log('FAIL  SPREAD_COSTS není v configu — změnil se tvar?'); process.exit(1); }

const OWNER = {};
for (const m of costsSrc.matchAll(/(\w+)\s*:\s*\{[^}]*credits\s*:\s*(\d+)/g)) OWNER[m[1]] = +m[2];
if (!Object.keys(OWNER).length) { console.log('FAIL  SPREAD_COSTS nemá žádné `credits:`'); process.exit(1); }

let fail = 0;

// ── A) kód: kopie ceny NESMÍ existovat ───────────────────────────────
// Puvodne tu bylo mekci „kopie musi souhlasit". Jenze SPREAD_CONFIG.credits
// nikdo necetl — precenit v ni znamenalo nezmenit nic a nedozvedet se to.
// Hlidat duplikat je druha nejlepsi vec; prvni je nemit ho.
if (configSrc && /^\s*credits\s*:/m.test(configSrc)) {
  fail++;
  console.log('FAIL  runar-config.js  SPREAD_CONFIG obsahuje `credits:` — vlastnik ceny je SPREAD_COSTS');
  console.log('      -> smaz to pole; nikdo ho necte a precenovani v nem tise nic neudela.');
}

// ── B) doc vs kód ─────────────────────────────────────────────────────
// Jméno spreadu, jak se píše v docích (en / is / cz). Delší varianty první,
// aby „life rune" nevyhrálo nad „rune".
const ALIAS = [
  ['life_rune', ['life rune', 'lífsrún', 'lifsrun', 'životní runa', 'zivotni runa']],
  ['yggdrasil', ['yggdrasil']],
  ['horseshoe', ['horseshoe', 'hestaskeifa', 'podkova']],
  ['gathering', ['gathering']],
  ['norns',     ['norns', 'nornir']],
  ['cross',     ['cross', 'kríž', 'kříž', 'kriz', 'krossinn']],
  ['single',    ['single', 'ein rún', 'jedna runa']],
];
function spreadOf(text) {
  const t = text.toLowerCase();
  for (const [key, names] of ALIAS) if (names.some(n => t.includes(n))) return key;
  return null;
}

const docs = execSync('git ls-files "*.md"', { cwd: R, encoding: 'utf8', maxBuffer: 1 << 26 })
  .trim().split('\n').map(s => s.trim()).filter(Boolean)
  .filter(p => !p.startsWith('docs/archive/') && !p.includes('/snapshots/')
            && p !== 'RUNAR_DECISIONS.md');   // append-only log smí citovat i staré ceny

const CREDIT_WORD = /kredit|credit|inneign/i;
const cells = line => line.split('|').slice(1, -1).map(c => c.trim());
const num = cell => { const m = cell.replace(/\*/g, '').match(/^(\d+)$/); return m ? +m[1] : null; };

let checked = 0;

for (const doc of docs) {
  const lines = fs.readFileSync(R + '/' + doc, 'utf8').split('\n');
  let creditCol = -1;   // index sloupce s kredity v právě otevřené tabulce

  lines.forEach((line, i) => {
    const at = doc + ':' + (i + 1);
    const isRow = line.trim().startsWith('|') && line.trim().endsWith('|');

    if (!isRow) { creditCol = -1; return; }              // tabulka skončila
    const c = cells(line);
    if (c.every(x => /^:?-+:?$/.test(x))) return;        // oddělovač

    // hlavička: zapamatuj si, ve kterém sloupci jsou kredity
    if (creditCol === -1) {
      creditCol = c.findIndex(x => CREDIT_WORD.test(x));
      return;                                            // hlavička sama se nekontroluje
    }
    if (line.includes('doc-values:ok')) return;

    const key = spreadOf(c[0] || '');
    if (!key || !(key in OWNER)) return;
    const val = num(c[creditCol] || '');
    if (val === null) return;                            // není to čisté číslo — nehádáme
    checked++;
    if (val === OWNER[key]) return;
    fail++;
    console.log('FAIL  ' + at + '  ' + key + ' = ' + val + ' kreditů, config říká ' + OWNER[key]);
    console.log('      ' + line.trim().slice(0, 110));
  });

  // PRÓZA SE NEKONTROLUJE — a je to vědomé rozhodnutí, ne opomenutí.
  //
  // První verze (2026-07-19) prózu uměla a na ostrém repu dala 5 nálezů, z nichž
  // 5 bylo falešných: „50 single/month = 50 credits" (50 je množství, ne cena)
  // a „Life Rune (3 kredity) + Norns (2 kredity) = 5 kreditů" (všechna tři čísla
  // správně, jen spárovaná se špatným spreadem). V próze nejde odlišit cenu od
  // množství ani od součtu bez hádání, a kontrola, která pálí na správný obsah,
  // se naučí ignorovat — nebo se umlčí značkou, což je totéž.
  //
  // U tabulky ta nejednoznačnost není: hlavička „Credits" je autorovo vlastní
  // prohlášení, co ten sloupec znamená. Proto se kontroluje jen tabulka.
}

if (fail === 0) {
  console.log('OK    ceny spreadů: ' + checked + ' tabulkových zmínek sedí na SPREAD_COSTS ('
            + Object.keys(OWNER).length + ' spreadu), SPREAD_CONFIG cenu neduplikuje.');
  console.log('      (próza se nekontroluje — viz komentář v souboru; cenu v běžné větě nikdo nehlídá)');
} else {
  console.log('\n' + fail + ' zmínek ceny se rozešlo s configem.');
  console.log('Vlastník ceny je SPREAD_COSTS v v2/runar-config.js — oprav zmínku, ne config.');
  console.log('Je-li to záměrná zmínka staré ceny, přidej na řádek značku  doc-values:ok');
}
process.exit(fail ? 1 : 0);
