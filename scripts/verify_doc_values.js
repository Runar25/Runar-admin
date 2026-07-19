// Hodnoty z configu se v dokumentaci NEOPISUJÍ (§20).
//
// Rozdíl proti ⑭ (check-docs.py): ⑭ zná JMENOVITĚ seznam mrtvých pojmů, takže po
// každém přejmenování se musí ručně doplnit. Tahle kontrola čte **aktuální config**
// a odvozuje z něj, co je platné — takže chytí i přejmenování, které ještě nikoho
// nenapadlo. „Rune Keeper" by nezachytila proto, že je na seznamu, ale proto, že
// v `TIERS` není.
//
// PROČ zrovna jména tierů: od 2026-07-05 se měnila dvakrát a pokaždé zůstala stará
// verze rozeseta po docích. 2026-07-18 se ukázalo, že přejmenování premium
// (Keeper → Wanderer) proběhlo jen v kódu a tři doky pořád zakazovaly přejmenovávat.
//
// ČÍSLA (50/75, ceny) hlásí jen ŽLUTĚ. Plošný zákaz čísel by v RUNAR_PRICING.md
// dělal šum — ten doc má jednu tabulku povolenou, protože je to business dokument.
//
//   node scripts/verify_doc_values.js
const { execSync } = require('child_process');
const fs = require('fs');

const R = 'C:/Users/zkuku/Downloads/Runar-admin';
const cfg = fs.readFileSync(R + '/v2/runar-config.js', 'utf8');

// platná jména tierů = to, co je PRÁVĚ TEĎ v configu
const labels = new Set();
for (const m of cfg.matchAll(/label(?:_is)?:\s*'([^']+)'/g)) labels.add(m[1]);
if (!labels.size) { console.log('FAIL  nenašel jsem v configu žádný `label:` — změnil se tvar TIERS?'); process.exit(1); }

// „Rune X" fráze, které NEJSOU tier, ale legitimní pojmy (produkt / jednotka)
const NOT_A_TIER = new Set([
  'Rune Card', 'Rune Cards', 'Rune Reading', 'Rune Readings',
  'Rune Reading Card', 'Rune Reading Cards', 'Rune Seekers',
]);

const tracked = execSync('git ls-files', { cwd: R, encoding: 'utf8', maxBuffer: 1 << 26 })
  .trim().split('\n').filter(Boolean);
const docs = tracked.filter(p =>
  p.endsWith('.md') &&
  !p.startsWith('docs/archive/') &&
  !p.startsWith('memory/snapshots/') &&
  p !== 'RUNAR_DECISIONS.md');          // append-only log smí citovat i retirovaná jména

const bad = [], numeric = [];
const NUMBERS = /\b(?:50|75)\s*(?:cast|čtení|reading|reading-unit|jednot)/i;

for (const doc of docs) {
  const lines = fs.readFileSync(R + '/' + doc, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (line.includes('doc-values:ok')) return;
    const at = doc + ':' + (i + 1);

    for (const m of line.matchAll(/\bRune (?:Reading )?[A-Z][a-z]+s?\b/g)) {
      const phrase = m[0];
      if (labels.has(phrase) || NOT_A_TIER.has(phrase)) continue;
      // Česká deklinace platného jména („Rune Seekera", „Rune Walkerovi") — text je
      // česky, jména se skloňují. Prefix platného labelu bereme jako platný.
      if ([...labels, ...NOT_A_TIER].some(v => phrase.startsWith(v))) continue;
      bad.push({ at, phrase });
    }
    if (NUMBERS.test(line)) numeric.push(at);
  });
}

if (numeric.length) {
  console.log('ℹ  ' + numeric.length + ' míst opisuje kapacitu 50/75 (vlastník = TIERS.*.monthly_readings):');
  console.log('     ' + [...new Set(numeric.map(a => a.split(':')[0]))].join(' · '));
}

if (bad.length) {
  console.log('\nFAIL  jméno tieru, které v configu není:');
  for (const b of bad) console.log('  · ' + b.at + '  „' + b.phrase + '"');
  console.log('\n  Platná jména (z TIERS): ' + [...labels].join(' · '));
  console.log('  Buď jméno oprav, nebo — je-li to záměrná zmínka retirovaného jména —');
  console.log('  přidej na řádek značku  doc-values:ok');
  process.exit(1);
}

console.log('OK    doc hodnoty: žádné jméno tieru mimo config (' + docs.length + ' docs, ' + labels.size + ' platných jmen)');
process.exit(0);
