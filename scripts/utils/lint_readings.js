// ═══════════════════════════════════════════════════════
// RÚNAR · lint_readings.js — kontrola ZÁKAZŮ na VÝSTUPU (ne ve zdroji)
//
// §19.3: kontrola musí běžet na té ploše, kde bug žije. `check-is.py` skenuje ZDROJOVÉ
// stringy — jenže „journey"/„embrace"/vykřičník vzniká až v tom, co napíše model.
// Tenhle linter čte hotová čtení (JSONL z `gen_batch.js` nebo `export_readings.js`)
// a hlásí, které zákazy z promptu se ve výstupu porušily.
//
// §20 — seznam zakázaných frází se sem NEOPISUJE. Vytahuje se z `DEF_CHAR_*.grammar`
// a `.never`, tedy z toho samého textu, který dostane model. Když se zákaz v promptu
// změní, linter se změní s ním; nemůžou se rozejít.
//
//   node scripts/utils/lint_readings.js <soubor.jsonl> [další.jsonl …]
//   node scripts/utils/lint_readings.js ~/runar-eval/tester-20260808.jsonl
//
// Exit 1 = něco se našlo (použitelné jako brána), 0 = čisto.
// ⚠️ FLAG, ne verdikt: „journey" je zakázané JAKO MYSLIKA pro osobní růst — doslovná
// cesta může být v pořádku. Linter ukáže místo, posoudit musí člověk.
// ═══════════════════════════════════════════════════════
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');

const REPO = path.resolve(__dirname, '..', '..');
const V2 = path.join(REPO, 'v2');

function die(m) { console.error('\n  ERROR: ' + m + '\n'); process.exit(1); }

// ── zákazy PŘÍMO z promptu (§20) ────────────────────────────────────────────
function loadBans() {
  const M = {}; Object.getOwnPropertyNames(Math).forEach(k => { M[k] = Math[k]; }); M.random = () => 0.5;
  const sb = {
    Math: M, JSON, Date, console, setTimeout: () => 0, clearTimeout: () => {},
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    window: {}, self: {}, document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] },
  };
  sb.globalThis = sb;
  vm.createContext(sb);
  vm.runInContext(['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js']
    .map(f => fs.readFileSync(path.join(V2, f), 'utf8')).join('\n;\n'), sb, { filename: 'lint.js' });

  const out = { en: [], is: [] };
  for (const L of ['en', 'is']) {
    const ch = vm.runInContext('DEF_CHAR_' + L.toUpperCase(), sb);
    const text = String(ch.grammar || '') + '\n' + String(ch.never || '');
    // Fráze v uvozovkách uvnitř zákazových vět — anglické i islandské uvozovky.
    const seen = new Set();
    const re = /(?:Banned:|does not say|does not use the word|notar ekki orðið|Bannað að segja)([^\n]*)/gi;
    let m;
    while ((m = re.exec(text)) !== null) {
      // „Bannað að segja X — segðu frekar Y" nese DVĚ fráze: zakázanou i doporučenou.
      // Bez tohohle uříznutí by doporučená varianta skončila mezi zákazy a linter by
      // hlásil správnou islandštinu jako porušení (chyceno na první ostré dávce).
      const half = m[1].split(/segðu frekar|say .{0,20}instead|use .{0,20}instead/i)[0];
      const quoted = half.match(/[""„]([^""„"]{2,40})["""]/g) || half.match(/"([^"]{2,40})"/g) || [];
      quoted.forEach(q => {
        const w = q.replace(/^[""„"]|[""""]$/g, '').trim().toLowerCase();
        if (w && !seen.has(w)) { seen.add(w); out[L].push(w); }
      });
    }
  }
  return out;
}

// ── vstup ───────────────────────────────────────────────────────────────────
const files = process.argv.slice(2).map(f => f.replace(/^~/, os.homedir()));
if (!files.length) die('Chybí soubor. Použití: node scripts/utils/lint_readings.js <soubor.jsonl>');

const BANS = loadBans();
if (!BANS.en.length && !BANS.is.length) die('Ze zákazů v promptu se nic nevytáhlo — změnil se jejich tvar? (§20 extrakce)');

console.log('');
console.log('  zákazy vytažené z promptu:  EN ' + BANS.en.length + '  ·  IS ' + BANS.is.length);
console.log('  EN: ' + BANS.en.join(' · '));
if (BANS.is.length) console.log('  IS: ' + BANS.is.join(' · '));

let totalHits = 0, totalRows = 0;

for (const f of files) {
  if (!fs.existsSync(f)) die('Soubor neexistuje: ' + f);
  const rows = fs.readFileSync(f, 'utf8').trim().split('\n')
    .map(l => { try { return JSON.parse(l); } catch (e) { return null; } })
    .filter(r => r && (r.reading_text || '').trim().length > 20);
  totalRows += rows.length;

  const hits = {};       // fráze -> [ukázky]
  let bangs = 0;
  for (const r of rows) {
    const t = String(r.reading_text || '');
    const low = t.toLowerCase();
    const bans = BANS[r.lang === 'is' ? 'is' : 'en'];
    for (const b of bans) {
      if (low.includes(b)) {
        (hits[b] = hits[b] || []).push((r.rune || '?') + '/' + (r.lang || '?') + ': …' +
          t.slice(Math.max(0, low.indexOf(b) - 40), low.indexOf(b) + b.length + 40).replace(/\s+/g, ' ') + '…');
      }
    }
    if (/!/.test(t)) bangs++;   // vykřičník je zakázaný v obou jazycích
  }

  console.log('');
  console.log('  ── ' + path.basename(f) + '  (' + rows.length + ' čtení) ──');
  const found = Object.keys(hits).sort((a, b) => hits[b].length - hits[a].length);
  if (!found.length && !bangs) {
    console.log('     čisto');
  } else {
    found.forEach(b => {
      totalHits += hits[b].length;
      console.log('     "' + b + '" — ' + hits[b].length + '× (' + Math.round(hits[b].length / rows.length * 100) + ' %)');
      hits[b].slice(0, 2).forEach(x => console.log('        ' + x.slice(0, 130)));
    });
    if (bangs) { totalHits += bangs; console.log('     vykřičník — ' + bangs + '× (' + Math.round(bangs / rows.length * 100) + ' %)'); }
  }
}

console.log('');
console.log('  celkem: ' + totalHits + ' nálezů v ' + totalRows + ' čteních');
console.log('  (flag, ne verdikt — „journey" jako doslovná cesta může být v pořádku; posuď místo)');
console.log('');
process.exit(totalHits ? 1 : 0);
