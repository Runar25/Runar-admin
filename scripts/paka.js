// paka.js — vypíše AKTUÁLNÍ stav jedné páky promptu: co je v kódu TEĎ, jaká je verze
// promptu, a CELÝ řádek z Rejstříku pák.
//
// DŮVOD (2026-09-12, KUKY: „dávat mi staré informace, ty který vidí i do kódu, masakr"):
// třikrát za jeden den jsem ownerovi ohlásil stav, který už neplatil. Pokaždé týž tvar —
// měl jsem starou kopii textu (`RP_ASK` „40 slov", verze „v4.14") nebo jsem si z řádku
// Rejstříku vzal jen první, nejstarší klauzuli („60 % je sdílená preambule", „ablace ±1"),
// zatímco tentýž řádek o pár slov dál říkal „odebrána 8.9." a „to NEPLATÍ".
// Pravidlo na to existovalo (memory: než z produkčního souboru citujes, přečti ho znovu)
// a stejně spadlo, protože ho musel hlídat člověk. Tohle ho hlídat nemusí.
//
//   node scripts/paka.js register
//   node scripts/paka.js _askLifeContext
'use strict';
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..');
const arg = process.argv[2];
if (!arg) { console.error('pouziti: node scripts/paka.js <jmeno paky | jmeno funkce>'); process.exit(2); }

const cfg = fs.readFileSync(path.join(R, 'v2/runar-config.js'), 'utf8');
const verze = (cfg.match(/RUNAR_PROMPT_VERSION\s*=\s*'([^']+)'/) || [, '?'])[1];
console.log('PROMPT VERZE (v2/runar-config.js): ' + verze + '\n');

// ① zdroj: funkce stejného jména, nebo _<paka>Context
const src = fs.readFileSync(path.join(R, 'v2/runar-character.js'), 'utf8');
for (const jm of [arg, '_' + arg + 'Context']) {
  const i = src.indexOf('function ' + jm + '(');
  if (i === -1) continue;
  let d = 0, j = src.indexOf('{', i), k = j;
  do { if (src[k] === '{') d++; else if (src[k] === '}') d--; k++; } while (d > 0 && k < src.length);
  console.log('═══ KÓD DNES — ' + jm + '() ═══\n' + src.slice(i, k) + '\n');
  break;
}

// ② CELÝ řádek Rejstříku pák — i to, co je za prvním „·"
const log = fs.readFileSync(path.join(R, 'RUNAR_EVAL_LOG.md'), 'utf8').split('\n');
const znac = '**' + arg + '**';
const rad = log.filter(l => l.trim().startsWith('|') && l.indexOf(znac) !== -1);
if (rad.length) {
  console.log('═══ REJSTŘÍK PÁK — CELÝ ŘÁDEK ═══');
  console.log('⚠️ chronologický: nejstarší tvrzení VLEVO, platné VPRAVO. Čti do konce.\n');
  for (const l of rad) l.split('·').forEach((c, n) => console.log('  [' + (n + 1) + '] ' + c.trim()));
} else {
  console.log('═══ REJSTŘÍK PÁK: řádek pro „' + arg + '" NENALEZEN ═══');
  console.log('   (páka bez řádku = o jejím účinku nevíme nic — netvrdit)');
}
