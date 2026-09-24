// verify_decisions_numbers.js — číslo za datem v RUNAR_DECISIONS.md je JEDNOZNAČNÝ KLÍČ (hlavička docu).
// PROČ (CODE-read 2026-09-23): pravidlo „vezmi nejvyšší volné číslo toho dne" stálo v hlavičce od 2026-09-20,
// a přesto vznikly během jednoho dne TŘI kolize — dvě (6)/(7), dvě (12), dvě (15). Odkazy typu
// „DECISIONS 2026-09-23 (15)" přestaly být jednoznačné (CLAUDE.md §5 a backlog ukazovaly na různé záznamy).
// Pravidlo hlídané člověkem padá → kontrola ve smoke (CLAUDE.md, sekce „N paralelních session").
// Kontrola: žádné dvě hlavičky `## YYYY-MM-DD (N)` se stejným datem a číslem. Nečíslované hlavičky neřeší.
'use strict';
const fs = require('fs'), path = require('path');

function duplicity(text) {
  const seen = new Map(), dup = [];
  text.split(/\r?\n/).forEach((line, i) => {
    const m = line.match(/^## (\d{4}-\d{2}-\d{2}) \((\d+)\)/);
    if (!m) return;
    const k = m[1] + ' (' + m[2] + ')';
    if (seen.has(k)) dup.push(k + ' — řádky ' + seen.get(k) + ' a ' + (i + 1));
    else seen.set(k, i + 1);
  });
  return dup;
}

// Samotest na známých vstupech (§19.1 / §27): kontrola, která nic nenajde, protože je rozbitá, nesmí projít zeleně.
const T = [
  ['## 2026-09-23 (1) — a\n## 2026-09-23 (2) — b\n', 0, 'čistý text'],
  ['## 2026-09-23 (1) — a\r\n## 2026-09-23 (1) — b\r\n', 1, 'duplicita s CRLF'],
  ['## 2026-09-23 (6) — a\n## 2026-09-24 (6) — b\n## 2026-09-23 — bez čísla\n## 2026-09-23 — bez čísla\n', 0, 'stejné číslo jiný den + nečíslované'],
];
for (const [txt, cekam, co] of T) {
  const n = duplicity(txt).length;
  if (n !== cekam) { console.log('CHYBA NÁSTROJE: samotest „' + co + '" našel ' + n + ', čekal ' + cekam); process.exit(1); }
}

const soubor = path.join(__dirname, '..', 'RUNAR_DECISIONS.md');
const text = fs.readFileSync(soubor, 'utf8');
const pocet = (text.match(/^## \d{4}-\d{2}-\d{2} \(\d+\)/gm) || []).length;
if (pocet === 0) { console.log('CHYBA NÁSTROJE: v RUNAR_DECISIONS.md nenalezena ani jedna číslovaná hlavička'); process.exit(1); }
const dup = duplicity(text);
if (dup.length) {
  dup.forEach(d => console.log('  ' + d));
  console.log('DUPLICITNÍ ČÍSLO v RUNAR_DECISIONS.md: ' + dup.length + '× — pozdější záznam vezme nejvyšší volné číslo toho dne a opraví odkazy na sebe');
  process.exit(1);
}
console.log('čísla v RUNAR_DECISIONS.md jednoznačná (' + pocet + ' číslovaných záznamů)');
