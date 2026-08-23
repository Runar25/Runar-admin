// ㊱ REGISTER OBRAZŮ — každý řádek RUNE_IMAGES nese platný register D|E|P na indexu 6
// (2026-08-23, handoff Cowork: „kdo sáhne na pool, přeindexuje register" se vynucuje
// strojem, ne pamětí). Kritéria D/E/P vlastní Cowork → RUNAR_DESIGN.md (sekce image-pool).
// Prázdné/neznámé = červená. Aktuální štítky jsou PROVIZORNÍ (CODE-tune dle kritérií,
// 2026-08-23) — Cowork celý pool přeštítkuje svým souborem a provizor přepíše.
const fs = require('fs'), vm = require('vm');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const S = { console: { log() {}, warn() {}, error() {} } };
S.window = S; S.globalThis = S; S.document = { getElementById: () => null };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8'), S);

const IMGS = vm.runInContext('RUNE_IMAGES', S);
let fail = 0;
const poc = { D: 0, E: 0, P: 0 };
for (const row of IMGS) {
  const reg = row[6];
  if (reg !== 'D' && reg !== 'E' && reg !== 'P') {
    fail++;
    console.log('FAIL  ' + row[0] + ' „' + String(row[3]).slice(0, 50) + '…": register "' + reg + '" neni D|E|P');
    continue;
  }
  poc[reg]++;
}
if (!IMGS.length) { fail++; console.log('FAIL  banka prazdna'); }
console.log(fail === 0
  ? 'OK    register obrazu: ' + IMGS.length + ' radku, vsechny D|E|P  (D ' + poc.D + ' · E ' + poc.E + ' · P ' + poc.P + ')'
  : 'CELKEM ' + fail + ' radku bez platneho registru');
process.exit(fail === 0 ? 0 : 1);
