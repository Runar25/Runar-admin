// postup kontroly islandštiny (nástroje a jejich pořadí) stojí JEN v CLAUDE.md §2 („Kontrola IS“); jinde jen odkaz.
//
// Proč (KUKY 2026-10-11): „proč je těch míst několik? má být jedno. pro všechno, to má být jednodušší na opravu po nějaké změně.“
// Do té doby stál výčet nástrojů na sedmi místech (CLAUDE.md, working-style, další paměti, hlavičky nástrojů, nápovědy skriptů). Po zániku
// Yfirlestur (2026-10-10) se opravila jen část a zbytek dál posílal na mrtvý nástroj.
// Co hlídá: řádka, která jmenuje DVA a víc nástrojů kontroly IS (výčet nebo pořadí = kopie postupu), smí stát jen v CLAUDE.md. Vlastní jméno
// souboru se nepočítá (hlavička nástroje smí říct, kdo ji volá). Historie se nehlídá — DECISIONS, EVAL_LOG, BACKLOG, docs/, memory/snapshots,
// „Claude outputs“, scripts/archive popisují, co platilo, ne jak se to dělá.
// dverg-tarot/podklady-* (2026-10-24): podklady Dvergu přesunuté z „Claude outputs“ — týž druh textu (návrh z doby vzniku), jen jinde; Rúnarova
// pravidla v Dverg Tarotu neplatí (dverg-tarot/README.md) a obsah podkladů Rúnarovy session neupravují.
//   node scripts/verify_is_kontrola_jedno_misto.js       · --test = kontrola sama sebe (kopie musí padnout, odkaz projít)
'use strict';
const fs = require('fs'), path = require('path');
const R = process.env.RUNAR_ROOT || 'C:/Users/zkuku/Downloads/Runar-admin';
const NASTROJE = ['check-is', 'is-greynir', 'is-gpt-check', 'is-vazba', 'is-corr-qa', 'is-grammar-qa', 'is_gpt_naklady', 'GreynirCorrect'];
const VYNECHAT = /^(CLAUDE\.md|RUNAR_DECISIONS\.md|RUNAR_EVAL_LOG\.md|RUNAR_BACKLOG\.md|is-audit-report\.txt)$|^(docs|memory\/snapshots|Claude outputs|dverg-tarot\/podklady-[^/]+|scripts\/archive|node_modules|\.git|v2\/tree-snapshots)(\/|$)|(^|\/)_patch[^/]*\.py$/;
const SAM = 'scripts/verify_is_kontrola_jedno_misto.js';

const vzory = NASTROJE.map((n) => ({ n, re: new RegExp('(^|[^\\w-])' + n.replace(/[-_]/g, '\\$&') + '(?![\\w-])') }));
function jmena(radka, vlastni) {
  return vzory.filter((v) => v.n !== vlastni && v.re.test(radka)).map((v) => v.n);
}
function vlastniJmeno(rel) {
  const b = path.basename(rel).replace(/\.(js|py)$/, '');
  return NASTROJE.indexOf(b) !== -1 ? b : null;
}
function projdi(rel, txt) {
  const vady = [];
  txt.split(/\r?\n/).forEach((radka, i) => {
    const j = jmena(radka, vlastniJmeno(rel));
    if (j.length >= 2) vady.push(rel + ':' + (i + 1) + '  [' + j.join(', ') + ']  ' + radka.trim().slice(0, 110));
  });
  return vady;
}
function soubory(dir, rel) {
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const r = rel ? rel + '/' + e.name : e.name;
    if (VYNECHAT.test(r)) continue;
    if (e.isDirectory()) out = out.concat(soubory(path.join(dir, e.name), r));
    else if (/\.(md|py|js|html)$/.test(e.name) && r !== SAM) out.push(r);
  }
  return out;
}

if (process.argv[2] === '--test') {
  const kopie = projdi('memory/x.md', 'Ověř is-greynir → is-gpt-check → is-vazba --freq.');
  const odkaz = projdi('memory/x.md', 'Ověř kontrolami IS v pořadí podle CLAUDE.md §2.');
  const hlavicka = projdi('is-greynir.py', '# is-greynir.py — první vrstva; další vrstva je is-gpt-check.py');
  const ok = kopie.length === 1 && odkaz.length === 0 && hlavicka.length === 0 && VYNECHAT.test('RUNAR_DECISIONS.md') && !VYNECHAT.test('RUNAR_DESIGN.md');
  console.log((ok ? 'OK    ' : 'FAIL  ') + 'samotest: výčet nástrojů mimo CLAUDE.md padá, odkaz projde, hlavička nástroje smí jmenovat jeden další');
  process.exit(ok ? 0 : 1);
}
let vady = [];
for (const rel of soubory(R, '')) {
  try { vady = vady.concat(projdi(rel, fs.readFileSync(path.join(R, rel), 'utf8'))); } catch (e) { /* nečitelný soubor přeskoč */ }
}
for (const v of vady) console.log('FAIL  ' + v);
console.log(vady.length
  ? vady.length + '× výčet nástrojů kontroly IS mimo CLAUDE.md §2 — nahraď odkazem „CLAUDE.md §2“, ať se po změně opravuje jedno místo'
  : 'OK    postup kontroly IS stojí jen v CLAUDE.md §2 (jinde odkazy)');
process.exit(vady.length ? 1 : 0);
