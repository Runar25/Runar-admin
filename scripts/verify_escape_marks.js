// Escape značka musí nést DŮVOD a DATUM. Holá značka = červená.
//
// Kontroly ⑭/⑯/⑰ respektují značky `check-docs:ok`, `doc-links:ok`, `doc-values:ok`.
// Bez téhle kontroly je značka **posvěcená tichá zelená** — přesně to, co §19.2 zakazuje,
// jen s razítkem. A není to teoretické: 2026-07-19 jich bylo 35, všechny holé, a seděly
// v docích, které čte každá session (working-style 10×, BACKLOG 7×).
//
// Holá značka nejde přečíst: nikdo nepozná, jestli doc o mrtvém pojmu legitimně MLUVÍ jako
// o mrtvém (to je smysl výjimky), nebo jestli si někdo umlčel červenou, aby měl klid.
// Důvod tenhle rozdíl udělá viditelným; datum umožní se po čase zeptat, jestli ještě platí.
//
// Formát:  <!-- check-docs:ok 2026-07-19 proč to tady legitimně je -->
//
//   node scripts/verify_escape_marks.js
const { execSync } = require('child_process');
const fs = require('fs');
const R = 'C:/Users/zkuku/Downloads/Runar-admin';

const TAGS = ['check-docs', 'doc-links', 'doc-values'];
// Jen SKUTEČNÁ značka = uvnitř HTML komentáře. Doc, který o značkách MLUVÍ (v backtickách,
// jako RUNAR_DECISIONS.md), se hlásit nesmí — jinak kontrola trestá právě ty věty, které
// problém pojmenovávají, a autoři se naučí je nepsat. Táž past, jako řeší „unless" seznam.
const RE = new RegExp('<!--\\s*(' + TAGS.join('|') + '):ok([^>]*?)--+>', 'g');
const DATE = /\b\d{4}-\d{2}-\d{2}\b/;

const docs = execSync('git ls-files "*.md"', { cwd: R, encoding: 'utf8' })
  .split('\n').map(s => s.trim()).filter(Boolean)
  // archiv a snapshoty jsou historie — ty se nehlídají (stejná zásada jako u ⑮)
  .filter(p => !p.startsWith('docs/archive/') && !p.includes('/snapshots/'));

let fail = 0, total = 0;

for (const rel of docs) {
  const lines = fs.readFileSync(R + '/' + rel, 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const m of line.matchAll(RE)) {
      total++;
      const rest = (m[2] || '').replace(/--?>?\s*$/, '').trim();
      const hasDate = DATE.test(rest);
      // po odečtení data musí zbýt aspoň pár slov skutečného zdůvodnění
      const reason = rest.replace(DATE, '').trim();
      const hasReason = reason.split(/\s+/).filter(Boolean).length >= 2;
      if (hasDate && hasReason) continue;
      fail++;
      const missing = !hasDate && !hasReason ? 'datum i důvod' : (!hasDate ? 'datum' : 'důvod');
      console.log('FAIL  ' + rel + ':' + (i + 1) + '  značka ' + m[1] + ':ok bez ' + missing);
      console.log('      ' + line.trim().slice(0, 100));
    }
  });
}

if (fail === 0) {
  console.log('OK    ' + total + ' escape značek, každá s důvodem i datem.');
} else {
  console.log('\n' + fail + ' z ' + total + ' značek umlčuje kontrolu bez zdůvodnění.');
  console.log('Formát: <!-- check-docs:ok 2026-07-19 proč to tady legitimně je -->');
}
process.exit(fail ? 1 : 0);
