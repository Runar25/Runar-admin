// Smoke ㉺ — komentář v kódu nesmí posílat čtenáře do dokumentu, který neexistuje.
//
// Proč (2026-10-10, kontrola architektury, CODE-read; owner: „jak jsi našel README, možná najdeš víc míst… tohle bude náš nesvár
// z dřívějška, pozor na to“): smoke ⑯ (verify_doc_links.js) hlídá odkazy jen v dokumentech. V kódu hlavička runar-reporter.js
// odkazovala na „spec runar_reporter_spec_CODE.md“, který v repu nikdy nebyl — a nic to nechytilo. Komentář s odkazem na doc je
// slib „podrobnosti jsou tam“; když tam nic není, čtenář hledá náhradu a najde zastaralou kopii.
// Co dělá: v2/*.js|html|css, supabase/functions/**/*.ts, scripts/*.js|py, scripts/utils/*.js, hooks/*.py, smoke.py, check-*.py —
// každé jméno *.md v komentáři musí existovat v gitu (stačí shoda jména souboru). Záměrná zmínka smazaného/zástupného docu =
// na řádku značka `doc-links:ok <datum> <důvod>` (táž jako u ⑯; ⑲ hlídá, že nese důvod i datum).
//   node scripts/verify_code_doc_refs.js         · node scripts/verify_code_doc_refs.js --test
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const R = path.resolve(__dirname, '..');
const RE_MD = /[\w./-]*[\w-]+\.md\b/g;
const KOD = /^(v2\/[^/]+\.(js|html|css)|supabase\/functions\/.+\.ts|scripts\/[^/]+\.(js|py)|scripts\/utils\/[^/]+\.js|hooks\/[^/]+\.py|smoke\.py|check-[a-z-]+\.py)$/;

function komentar(radek) {
  const i = [radek.indexOf('//'), radek.indexOf('#'), radek.indexOf('<!--'), radek.indexOf('/*'), radek.indexOf(' * ')]
    .filter((x) => x >= 0);
  return i.length ? radek.slice(Math.min(...i)) : '';
}
function nalezy(text, existuje) {
  const out = [];
  text.split('\n').forEach((l, i) => {
    if (/doc-links:ok/.test(l)) return;
    const c = komentar(l);
    for (const m of c.match(RE_MD) || []) if (!existuje(path.basename(m))) out.push({ radek: i + 1, jmeno: m });
  });
  return out;
}

if (process.argv.includes('--test')) {
  const ex = (b) => b === 'CLAUDE.md';
  const ok = nalezy('// viz CLAUDE.md §20', ex).length === 0
    && nalezy('// Spec: neexistuje_spec.md', ex).length === 1
    && nalezy('// smazaný stary.md  doc-links:ok 2026-10-10 záměrně historie', ex).length === 0
    && nalezy("const x = 'neni_komentar.md';", ex).length === 0
    && nalezy('# python komentář chybi.md', ex).length === 1;
  console.log(ok ? 'OK    samotest: chybějící doc v komentáři se pozná, existující a značený ne' : 'FAIL  samotest');
  process.exit(ok ? 0 : 1);
}

const tracked = cp.execSync('git ls-files', { cwd: R, encoding: 'utf8' }).split('\n').filter(Boolean);
const jmena = new Set(tracked.map((f) => path.basename(f)));
let fail = 0;
for (const f of tracked.filter((f) => KOD.test(f))) {
  for (const n of nalezy(fs.readFileSync(path.join(R, f), 'utf8'), (b) => jmena.has(b))) {
    fail++;
    console.log('FAIL  ' + f + ':' + n.radek + ' odkazuje na ' + n.jmeno + ', který v repu není');
  }
}
console.log(fail ? 'FAIL  ' + fail + ' odkaz(ů) z kódu na neexistující dokument (oprav, nebo značka doc-links:ok <datum> <důvod>)'
  : 'OK    komentáře v kódu neodkazují na neexistující dokument');
process.exit(fail ? 1 : 0);
