// Provenienční tagy [kánon] / [Agndofa] jsou INTERNÍ poznámky (žijí v RUNAR_DESIGN.md).
// NESMÍ prosáknout do user-facing plochy — UI stringy (translations), prompty
// (character.js → text čtení), HTML. Kdyby ano, uživatel by je viděl v appce nebo
// přímo ve čtení od Rúnara.
//
// KUKY 2026-07-30: „hlavně aby se Agndofa nikde nezobrazovala. je to jen interní poznámka."
//
// Hlídá pattern [kánon / [Agndofa (v HRANATÉ ZÁVORCE) přes v2/*.js + v2/*.html.
// Pozn.: slovo „Agndofa" samo (jméno světa) je legitimně user-facing — proto se
// hlídá jen TAG v závorce, ne holé slovo.
//
//   node scripts/verify_internal_tags.js
const fs = require('fs');
const path = require('path');

const V2 = 'C:/Users/zkuku/Downloads/Runar-admin/v2';
const TAG = /\[(kánon|Agndofa)/;   // bracket + provenance word (kryje i [kánon-ish, [Agndofa:)

const files = fs.readdirSync(V2).filter(f => f.endsWith('.js') || f.endsWith('.html'));
const hits = [];
for (const f of files) {
  const lines = fs.readFileSync(path.join(V2, f), 'utf8').split('\n');
  lines.forEach((ln, i) => {
    if (TAG.test(ln)) hits.push(f + ':' + (i + 1) + '  ' + ln.trim().slice(0, 80));
  });
}

if (hits.length) {
  console.log('CHYBA: interní provenienční tag [kánon]/[Agndofa] v user-facing ploše:');
  hits.forEach(h => console.log('  ' + h));
  console.log('Tagy patří JEN do RUNAR_DESIGN.md. Z user-facing (UI/prompt/HTML) odstranit.');
  process.exit(1);
}
console.log('OK    ' + files.length + ' user-facing souborů (v2/*.js,*.html), žádný interní tag neprosákl.');
process.exit(0);
