// ═══════════════════════════════════════════════════════
// RÚNAR · verify_open_reports.js — nahlášená fráze, která JE POŘÁD VE ZDROJI
//
// KUKY 2026-08-16: „report se zpracuje, jen když na to upozorním. jde to udělat jinak?"
//
// ⭐ ANO, A JDE TO PŘESNĚ. `bug_reports.flagged_text` je text, který tester OZNAČIL.
// Když se tentýž řetězec pořád nachází ve zdroji promptu, není to „nezpracovaný report" —
// je to **živá vada, na kterou nás někdo upozornil a ona tam dál je**. To se dá hlídat
// strojově a nepotřebuje to, aby si toho někdo všiml.
//
// DOLOŽENO, PROČ TO VZNIKLO: 2026-08-02 nahlásil rodilý mluvčí „Hrafn sem ríður vindinum.
// Þetta er léleg íslenska, við segjum þetta ekki svona á íslensku." Fráze zůstala v
// `runar-character.js` (`hs_ravenmoor`) **čtrnáct dní** a celou tu dobu se vkládala do
// islandských čtení. Nikdo ji nepřehlédl ze zlé vůle — jen z reportu nevedla žádná cesta
// zpátky do kódu. Tenhle skript je ta cesta.
//
// ⚠️ NEHLÁSÍ CHYBU. Otevřený report je legitimní stav (ještě se nerozhodlo). Kdyby kvůli
// tomu padal smoke, první, co kdokoli udělá, je vypnout ho. Viditelnost ano, blokování ne.
// Zato **shoda se zdrojem** je vykřičená — tam už nejde o „čeká na rozhodnutí".
//
// ⚠️ SOUKROMÍ: `bug_reports` nese texty uživatelů. Skript jen VYPISUJE do terminálu,
// nikam nezapisuje, a ukazuje krátký úryvek — repo je PUBLIC (RUNAR_PRIVACY.md).
//
//   node scripts/verify_open_reports.js
// ═══════════════════════════════════════════════════════
const fs = require('fs'), os = require('os'), path = require('path');
const { execSync } = require('child_process');

const R = path.resolve(__dirname, '..');
const V2 = path.join(R, 'v2');

// Fráze kratší než tohle jsou běžná slova a trefily by se kdekoli; delší bývá celé čtení,
// tedy modelový VÝSTUP, který ve zdroji být nemá ani nemůže.
const MIN = 10, MAX = 140;

let rows;
try {
  const tmp = path.join(os.tmpdir(), 'runar_reports_' + process.pid + '.sql');
  fs.writeFileSync(tmp,
    "select id, type, locale, coalesce(flagged_text,'') as flagged, " +
    "coalesce(left(message,120),'') as msg, created_at::date as den " +
    "from public.bug_reports where status is distinct from 'resolved' " +
    "and coalesce(flagged_text,'') <> '' order by created_at;", 'utf8');
  const out = execSync('supabase db query --linked -f "' + tmp + '"',
    { cwd: R, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
  rows = JSON.parse(out.slice(out.indexOf('{'))).rows || [];
  try { fs.unlinkSync(tmp); } catch (_) {}
} catch (e) {
  // ⚠️ Nedostupna DB NENI "cisto". Rekne se to nahlas a skonci se nulou (nesmi shodit smoke).
  console.log('otevřené reporty: NELZE OVĚŘIT — DB nedostupná (`supabase db query --linked`).');
  console.log('  To NENÍ „čisto"; kontrola neproběhla.');
  process.exit(0);
}

const src = fs.readdirSync(V2).filter(f => /\.(js|html)$/.test(f))
  .map(f => ({ f, txt: fs.readFileSync(path.join(V2, f), 'utf8') }));
const norm = (s) => s.replace(/\s+/g, ' ').trim().toLowerCase();

const live = [];
for (const r of rows) {
  const t = norm(r.flagged);
  if (t.length < MIN || t.length > MAX) continue;
  for (const { f, txt } of src) {
    const idx = norm(txt).indexOf(t);
    if (idx === -1) continue;
    const line = txt.slice(0, txt.length ? idx : 0).split('\n').length;   // přibližný řádek
    live.push({ r, file: f, line });
    break;
  }
}

const byType = {};
for (const r of rows) byType[r.type] = (byType[r.type] || 0) + 1;
const age = (d) => Math.max(0, Math.round((Date.now() - Date.parse(d)) / 86400000));

console.log('otevřené reporty s označeným textem: ' + rows.length +
  '  (' + Object.keys(byType).map(k => k + ' ' + byType[k]).join(' · ') + ')');

if (!live.length) {
  console.log('  žádná nahlášená fráze se ve zdroji `v2/` nenachází — reporty jsou o výstupu, ne o zdroji');
  process.exit(0);
}
console.log('\n  ⚠️ NAHLÁŠENO, A POŘÁD TO JE VE ZDROJI — tohle už nečeká na rozhodnutí:');
for (const { r, file, line } of live) {
  console.log('   · v2/' + file + ':~' + line + '   [' + r.locale + ' ' + r.type + ', leží ' + age(r.den) + ' dní]');
  console.log('     označeno: „' + norm(r.flagged).slice(0, 90) + '"');
  if (r.msg) console.log('     tester:   ' + norm(r.msg).slice(0, 100));
}
console.log('\n  Každá z nich patří buď do `check-is.py` BAD_PATTERNS (§9), do `runar_corrections`,');
console.log('  nebo se opraví ve zdroji — a report se zavře. Jinak se to vrátí.');
process.exit(0);
