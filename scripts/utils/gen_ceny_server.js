// Serverové zrcadlo ceníku modelů: supabase/functions/_shared/ceny_modelu.ts = MODEL_PRICES (v2/runar-config.js) a readingCostUsd
// (v2/runar-utils.js), DOSLOVA vyňaté ze zdroje.
// Proč (CODE-tune 2026-10-14, owner „ano, pg_cron + Brevo … ano udělej“, DECISIONS 2026-10-14 (13)): ranní souhrn provozu (edge funkce
// ops-watch) má říct, co čtení stála. Edge funkce v2/ načíst neumí a ruční kopie ceníku by se rozešla (§20) — proto generátor, ne kopie.
// Změna ceníku = v2/runar-config.js, pak tenhle skript; smoke ㊇ (--check) zastaví push, když zrcadlo neodpovídá zdroji.
//   node scripts/utils/gen_ceny_server.js           · přegeneruje _shared/ceny_modelu.ts
//   node scripts/utils/gen_ceny_server.js --check   · jen porovná (smoke ㊇)
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = process.env.RUNAR_ROOT || path.resolve(__dirname, '..', '..');
const CIL = path.join(ROOT, 'supabase', 'functions', '_shared', 'ceny_modelu.ts');

function blok(soubor, zacatek, konec) {
  const src = fs.readFileSync(path.join(ROOT, soubor), 'utf8').replace(/\r\n/g, '\n');
  const a = src.indexOf(zacatek);
  if (a < 0) throw new Error(soubor + ': nenalezeno „' + zacatek + '“ — přejmenované? uprav generátor');
  const b = src.indexOf(konec, a);
  if (b < 0) throw new Error(soubor + ': konec bloku „' + JSON.stringify(konec) + '“ nenalezen');
  return src.slice(a, b + konec.length).replace(/\n$/, '');
}

function vyrob() {
  const ceny = blok('v2/runar-config.js', 'const MODEL_PRICES = {', '\n};');
  const fn = blok('v2/runar-utils.js', 'function readingCostUsd(u) {', '\n}\n');
  return '// @ts-nocheck — GENEROVÁNO scripts/utils/gen_ceny_server.js, NEEDITOVAT: MODEL_PRICES z v2/runar-config.js a readingCostUsd\n'
    + '// z v2/runar-utils.js, doslova. Změna ceníku = v2/runar-config.js, pak `node scripts/utils/gen_ceny_server.js`. Hlídá smoke ㊇.\n\n'
    + ceny + '\n\n' + fn + '\n\nexport { MODEL_PRICES, readingCostUsd };\n';
}

const novy = vyrob();
if (process.argv.includes('--check')) {
  const stary = fs.existsSync(CIL) ? fs.readFileSync(CIL, 'utf8').replace(/\r\n/g, '\n') : '';
  if (stary !== novy) {
    console.log('FAIL  supabase/functions/_shared/ceny_modelu.ts: neodpovídá v2/runar-config.js (MODEL_PRICES) a v2/runar-utils.js (readingCostUsd) — '
      + 'pusť node scripts/utils/gen_ceny_server.js a nasaď ops-watch');
    process.exit(1);
  }
  console.log('OK    ceník modelů na serveru (_shared/ceny_modelu.ts) = MODEL_PRICES a readingCostUsd z v2/');
} else {
  fs.writeFileSync(CIL, novy);
  console.log('OK    zapsáno ' + path.relative(ROOT, CIL));
}
