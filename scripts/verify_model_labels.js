// ㉴ ŠTÍTEK MODELU V UI = MODEL V PROXY (2026-10-05).
//
// PROČ: KUKY, report 2026-10-05 07:40 (v538): „Pokud jsi změnil model na sol6.1, proč jsi to taky neupravil, že se čtení dělá
// sol6.1? Tady v readeru. Což znamená, že nevíš, kde co je, a proto to neopravíš.“ Proxy běžela na gpt-6.1-sol (v75), přepínač
// admina dál hlásil „GPT-6 sol“. Jméno modelu žije na serveru (konstanta v edge funkci), štítek v překladech — dvě místa, která
// spolu nikdo nehlídal. Pravidlo, které musí hlídat člověk, spadne na ownera → kontrola (CLAUDE.md, mechanika lanes).
//
// CO SE TU TVRDÍ: štítek přepínače čtení přes sol (UI_TEXT.*.sol_toggle, EN i IS) nese jméno modelu SOL_MODEL z claude-proxy.
// Jméno pro člověka = id bez „gpt-“: gpt-6-sol → „GPT-6 sol“, gpt-6.1-sol → „GPT-6.1 sol“.
// 2026-10-09: druhá půlka (tlačítko rozboru × MODEL z gpt-review) pryč — rozbor zrušen (KUKY „Lunu už nepoužívám… zrušit úplně“).
// NETVRDÍ se, že nasazená proxy = repo (to se ověřuje stažením při deployi).
//
//   node scripts/verify_model_labels.js
const fs = require('fs'), vm = require('vm');
const ROOT = 'C:/Users/zkuku/Downloads/Runar-admin/';
let fail = 0;
const rekni = (ok, popis) => { if (ok) console.log('  ✓ ' + popis); else { fail++; console.log('  ✗ ' + popis); } };

const proxy = fs.readFileSync(ROOT + 'supabase/functions/claude-proxy/index.ts', 'utf8');
const sol = (proxy.match(/^const SOL_MODEL = "([^"]+)"/m) || [])[1];
rekni(!!sol, 'claude-proxy: SOL_MODEL nalezen (' + sol + ')');

const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
S.localStorage = { getItem: () => null, setItem() {} };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-translations.js']) vm.runInContext(fs.readFileSync(ROOT + 'v2/' + f, 'utf8') + '\n;\n', S);
const UI = vm.runInContext('UI_TEXT', S);
const jmeno = (id) => String(id || '').replace(/^gpt-(\d+(?:\.\d+)?)-([a-z]+)$/, 'GPT-$1 $2');

for (const L of ['en', 'is']) {
  const st = (UI[L] || {}).sol_toggle || '';
  rekni(sol && st.indexOf(jmeno(sol)) !== -1, L + ' sol_toggle „' + st + '“ nese „' + jmeno(sol) + '“');
}

if (fail) { console.log('\nFAIL — štítek modelu v UI neodpovídá modelu v edge funkci (' + fail + '×). Změníš-li model, změň i štítek v runar-translations.js.'); process.exit(1); }
console.log('\nOK    štítek modelu: přepínač sol = ' + jmeno(sol) + ' — EN i IS sedí s claude-proxy');
