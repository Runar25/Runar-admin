// ═══════════════════════════════════════════════════════
// RÚNAR · verify_prelaunch_open.js — otevřené věci PŘED SPUŠTĚNÍM nesmí zapadnout
//
// KUKY 2026-08-16 o leaku promptu: „je to problém nezapsání do backlogu, jelikož jsme na ten
// leak už přišli, ale asi při záplavě oprav jsme se k tomu nedostali a tím pádem to zůstalo
// zapomenuto."
//
// ⚠️ NA TOHLE ŽÁDNÁ KONTROLA NEEXISTOVALA a existovat nemohla: `verify_decisions_followthrough.js`
// hlídá rozhodnutí, která BYLA zapsaná (jestli se dodělal `Affected doc(s)`). Nález, který se
// nezapsal nikam, nemá proti čemu kontrolovat. Jediná obrana je §22 (hned oprav nebo zapiš) —
// a to je disciplína, ne kontrola.
//
// CO S TÍM JDE UDĚLAT: jakmile nález ZAPSANÝ je, může ho kontrola držet na očích, dokud se
// nevyřeší. Tenhle skript vypíše z `RUNAR_BACKLOG.md` každou položku nadepsanou „PŘED SPUŠTĚNÍM"
// při KAŽDÉM smoke běhu. Nezakazuje spuštění, nekazí zelenou — jen se to nedá přehlédnout.
//
// PROČ NEHLÁSÍ CHYBU: dokud je appka ve vývoji, jsou tyhle věci legitimně otevřené. Kdyby
// smoke kvůli nim padal, první, co kdokoli udělá, je vypnout ho — a jsme hůř než na začátku.
// Viditelnost ano, blokování ne.
//
//   node scripts/verify_prelaunch_open.js
// ═══════════════════════════════════════════════════════
const fs = require('fs'), path = require('path');

const R = path.resolve(__dirname, '..');
const BL = path.join(R, 'RUNAR_BACKLOG.md');

let text;
try { text = fs.readFileSync(BL, 'utf8'); } catch (e) {
  console.log('RUNAR_BACKLOG.md nelze číst — kontrola neproběhla (to NENÍ „čisto")');
  process.exit(0);
}

const items = [];
const lines = text.split('\n');
for (let i = 0; i < lines.length; i++) {
  const m = /^#{2,4}\s*(PŘED SPUŠTĚNÍM\s*[::]?\s*)(.+?)\s*$/.exec(lines[i]);
  if (!m) continue;
  // datum z nadpisu, at je videt, jak dlouho to lezi
  const d = /\((\d{4}-\d{2}-\d{2})\)/.exec(m[2]);
  items.push({ title: m[2].replace(/\s*\(\d{4}-\d{2}-\d{2}\)\s*$/, ''), date: d ? d[1] : null, line: i + 1 });
}

if (!items.length) {
  console.log('pre-launch: žádná otevřená položka „PŘED SPUŠTĚNÍM" v backlogu');
  process.exit(0);
}

console.log('pre-launch: ' + items.length + ' otevřen' + (items.length === 1 ? 'á položka' : 'ých položek') +
  ' — musí padnout rozhodnutí, než appka půjde ven');
for (const it of items) {
  const age = it.date ? Math.max(0, Math.round((Date.now() - Date.parse(it.date)) / 86400000)) : null;
  console.log('  · ' + it.title + '   (RUNAR_BACKLOG.md:' + it.line +
    (age === null ? '' : ' · leží ' + age + ' dní') + ')');
}
process.exit(0);
