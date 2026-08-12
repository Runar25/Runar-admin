// ═══════════════════════════════════════════════════════
// RÚNAR · compare_readings.js — dvě dávky vedle sebe, čtení po čtení
//
// Proč existuje: na otázku „je tahle část promptu k něčemu?" neodpovídají procenta,
// ale čtení. Nejsilnější tvar je totéž čtení dvakrát — stejná runa, stejné zadání,
// jednou s pákou a jednou bez — a přečíst je za sebou.
//
//   node scripts/utils/gen_batch.js --lang is --all-runes --n 1 --out plny.jsonl
//   node scripts/utils/gen_batch.js --lang is --all-runes --n 1 --without image --out bez.jsonl
//   node scripts/utils/compare_readings.js plny.jsonl bez.jsonl
//
// Páruje podle runy. Runu, která je jen v jedné dávce, vypíše zvlášť — nikdy ji tiše
// nezahodí, protože nepárová runa je informace (jedna z dávek ji nevygenerovala).
// ═══════════════════════════════════════════════════════
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const files = process.argv.slice(2).map(f => f.replace(/^~/, os.homedir()));
if (files.length !== 2) {
  console.error('\n  Použití: node scripts/utils/compare_readings.js A.jsonl B.jsonl\n');
  process.exit(1);
}

function load(f) {
  if (!fs.existsSync(f)) { console.error('\n  Soubor neexistuje: ' + f + '\n'); process.exit(1); }
  return fs.readFileSync(f, 'utf8').trim().split('\n')
    .map(l => { try { return JSON.parse(l); } catch (e) { return null; } })
    .filter(r => r && (r.reading_text || '').trim());
}

// Popisek ramene: co v něm bylo vypnuté. Bez toho se po týdnu nepozná, který sloupec je který.
function arm(rows, file) {
  const w = rows.map(r => (r.without || []).join(',')).filter(Boolean);
  const uniq = [...new Set(w)];
  if (!uniq.length) return 'plný prompt';
  if (uniq.length > 1) return 'MÍCHANÉ (' + uniq.length + ' různých kombinací!)';
  return 'bez: ' + uniq[0];
}

function wrap(t, w, pad) {
  const out = [];
  let line = '';
  for (const word of String(t).split(/\s+/)) {
    if ((line + ' ' + word).trim().length > w) { out.push(line.trim()); line = word; }
    else line += ' ' + word;
  }
  if (line.trim()) out.push(line.trim());
  return out.map(l => pad + l).join('\n');
}

const A = load(files[0]);
const B = load(files[1]);
const aName = arm(A, files[0]);
const bName = arm(B, files[1]);

console.log('\n  A = ' + path.basename(files[0]) + '   ' + aName + '   (n=' + A.length + ')');
console.log('  B = ' + path.basename(files[1]) + '   ' + bName + '   (n=' + B.length + ')');
if (aName === bName)
  console.log('  ⚠ obě dávky mají TÉŽE rameno — porovnáváš stejné zadání se sebou samým.');

const langs = [...new Set([...A, ...B].map(r => r.lang).filter(Boolean))];
if (langs.length > 1) console.log('  ⚠ míchané jazyky (' + langs.join(',') + ') — čti odděleně.');

const byRune = new Map();
for (const r of A) (byRune.get(r.rune) || byRune.set(r.rune, {}).get(r.rune)).a = r;
for (const r of B) (byRune.get(r.rune) || byRune.set(r.rune, {}).get(r.rune)).b = r;

let pary = 0, sam = [];
for (const [rune, p] of byRune) {
  if (!p.a || !p.b) { sam.push(rune + (p.a ? ' (jen A)' : ' (jen B)')); continue; }
  pary++;
  const wa = p.a.reading_text.split(/\s+/).length;
  const wb = p.b.reading_text.split(/\s+/).length;
  console.log('\n  ── ' + rune + ' ' + '─'.repeat(Math.max(2, 66 - rune.length)));
  console.log('  A · ' + wa + ' slov');
  console.log(wrap(p.a.reading_text, 72, '      '));
  console.log('  B · ' + wb + ' slov');
  console.log(wrap(p.b.reading_text, 72, '      '));
}

console.log('\n  spárováno ' + pary + ' run' + (sam.length ? '   ·   bez páru: ' + sam.join(', ') : ''));
console.log('  (čísla a rozložení pák měří `measure_readings.js --balance`)\n');
