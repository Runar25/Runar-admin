// ㉴ ŠTÍTEK MODELU V UI = MODEL V PROXY (2026-10-05).
//
// PROČ: KUKY, report 2026-10-05 07:40 (v538): „Pokud jsi změnil model na sol6.1, proč jsi to taky neupravil, že se čtení dělá
// sol6.1? Tady v readeru. Což znamená, že nevíš, kde co je, a proto to neopravíš.“ Proxy běžela na gpt-6.1-sol (v75), přepínač
// admina dál hlásil „GPT-6 sol“. Jméno modelu žije na serveru (konstanta v edge funkci), štítek v překladech — dvě místa, která
// spolu nikdo nehlídal. Pravidlo, které musí hlídat člověk, spadne na ownera → kontrola (CLAUDE.md, mechanika lanes).
//
// CO SE TU TVRDÍ: štítek adminova přepínače (UI_TEXT.*.opus_toggle, EN i IS) nese jméno PRVNÍHO modelu řetězu MODELS
// z claude-proxy — na ten přepínač čtení pošle. Jméno pro člověka: claude-opus-5 → „Opus 5“, claude-opus-4-8 → „Opus 4.8“.
// A starý klíč sol_toggle už v překladech nežije (přepínač solu zanikl — nesmí přežít jako mrtvý text).
// 2026-10-09 obráceno (KUKY „produkce se mění na SOL 6, Opus 5 bude přepínač pro adminy“, DECISIONS 2026-10-09 (13)):
//   sol čtou všichni a v UI se nejmenuje; do 2026-10-08 se tu hlídal štítek solu (sol_toggle × SOL_MODEL).
// 2026-10-09: druhá půlka (tlačítko rozboru × MODEL z gpt-review) pryč — rozbor zrušen (KUKY „Lunu už nepoužívám… zrušit úplně“).
// NETVRDÍ se, že nasazená proxy = repo (to se ověřuje stažením při deployi).
//
//   node scripts/verify_model_labels.js
const fs = require('fs'), vm = require('vm');
const ROOT = 'C:/Users/zkuku/Downloads/Runar-admin/';
let fail = 0;
const rekni = (ok, popis) => { if (ok) console.log('  ✓ ' + popis); else { fail++; console.log('  ✗ ' + popis); } };

const proxy = fs.readFileSync(ROOT + 'supabase/functions/claude-proxy/index.ts', 'utf8');
const retez = (proxy.match(/const MODELS = \[([^\]]*)\]/) || [])[1] || '';
const opus = (retez.match(/"([^"]+)"/) || [])[1];
rekni(!!opus, 'claude-proxy: MODELS nalezen, první model ' + opus);

const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
S.localStorage = { getItem: () => null, setItem() {} };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-translations.js']) vm.runInContext(fs.readFileSync(ROOT + 'v2/' + f, 'utf8') + '\n;\n', S);
const UI = vm.runInContext('UI_TEXT', S);
const jmeno = (id) => String(id || '').replace(/^claude-([a-z]+)-(\d+)(?:-(\d+))?$/,
  (m, rod, a, b) => rod.charAt(0).toUpperCase() + rod.slice(1) + ' ' + a + (b ? '.' + b : ''));

for (const L of ['en', 'is']) {
  const st = (UI[L] || {}).opus_toggle || '';
  rekni(opus && st.indexOf(jmeno(opus)) !== -1, L + ' opus_toggle „' + st + '“ nese „' + jmeno(opus) + '“');
  rekni(!('sol_toggle' in (UI[L] || {})), L + ' starý klíč sol_toggle v překladech není');
}

if (fail) { console.log('\nFAIL — štítek modelu v UI neodpovídá modelu v edge funkci (' + fail + '×). Změníš-li model, změň i štítek v runar-translations.js.'); process.exit(1); }
console.log('\nOK    štítek modelu: přepínač admina = ' + jmeno(opus) + ' — EN i IS sedí s claude-proxy');
