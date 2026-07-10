// golden_contracts.js — SEED-AND-ASSERT contract for the corrections boundary.
// The rule: assert the OUTCOME on the real path, never the code shape. This seeds a RAW
// DB-shaped correction row (exactly what runar_corrections returns) through the REAL
// production functions — normalizeCorrections() (utils) -> getCorrPrompt() +
// applyISCorrections() (character) — and asserts the replacement SURVIVES end-to-end and
// no literal "undefined" is ever injected. Catches the class that ran dead for weeks:
// loadCorrections stored original_phrase/replacement_phrase but consumers read
// from_word/to_word -> every correction skipped + 'Never say "undefined"' in every IS prompt.
//   node golden_contracts.js   (exit 0 = pass, 1 = fail). Called by smoke.py.
const fs = require('fs');
const vm = require('vm');
const DIR = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const files = ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'];

const M = {}; Object.getOwnPropertyNames(Math).forEach((k) => { M[k] = Math[k]; }); M.random = () => 0.5;
const bag = {};
const sandbox = {
  Math: M, JSON: JSON, Date: Date, console: console,
  setTimeout: () => 0, clearTimeout: () => {},
  localStorage: {
    getItem: (k) => (k in bag ? bag[k] : null),
    setItem: (k, v) => { bag[k] = String(v); },
    removeItem: (k) => { delete bag[k]; },
  },
  window: {}, self: {},
  document: {
    getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
    createElement: () => ({ style: {}, classList: { add() {}, remove() {}, toggle() {} }, appendChild() {} }),
  },
};
sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;

let code = 'var lang="is"; var userGender="hk"; var corrections=[]; var currentUser=null; var userName="";\n';
for (const f of files) code += '\n/* ' + f + ' */\n' + fs.readFileSync(DIR + f, 'utf8') + '\n;\n';

code += `
var _FAIL = [];
function ok(cond, msg){ if(!cond) _FAIL.push(msg); }

// Seed the RAW row exactly as Supabase returns it (DB column names, NOT the code-side shape).
var raw  = [{ original_phrase:'Arctic ljósið', replacement_phrase:'Norðurljósin', lang_scope:'both' }];
var norm = normalizeCorrections(raw);

// 1) DB -> code mapping must produce non-empty from_word / to_word (the exact defect that broke).
ok(norm.length === 1, 'normalizeCorrections DROPPED the row — DB->code field mapping broken');
ok(norm[0] && norm[0].from_word === 'Arctic ljósið', 'from_word not mapped from original_phrase (got: ' + (norm[0] && norm[0].from_word) + ')');
ok(norm[0] && norm[0].to_word === 'Norðurljósin', 'to_word not mapped from replacement_phrase (got: ' + (norm[0] && norm[0].to_word) + ')');

// 2) Prompt block must NAME the replacement and NEVER inject the literal "undefined".
var block = getCorrPrompt('is', norm);
ok(block.indexOf('Norðurljósin') !== -1, 'getCorrPrompt did not include the replacement');
ok(block.toLowerCase().indexOf('undefined') === -1, 'getCorrPrompt injected literal "undefined" (poisoned prompt)');

// 3) Post-processor is OFF (CORRECTIONS_POSTPROCESS=false): it must be a NO-OP, not a
//    context-blind substring replace. Assert it leaves the text untouched.
var sample = 'Yfir hrauninu var Arctic ljósið kalt.';
var out = applyISCorrections(sample, 'is', norm);
ok(out === sample, 'applyISCorrections should be a no-op while CORRECTIONS_POSTPROCESS is off');
`;

vm.createContext(sandbox);
try {
  vm.runInContext(code, sandbox, { filename: 'contracts.js' });
} catch (e) {
  console.log('CORRECTIONS CONTRACT CRASHED: ' + (e && e.message));
  process.exit(1);
}

const fails = sandbox._FAIL || [];
if (fails.length) {
  console.log('CORRECTIONS CONTRACT FAILED (' + fails.length + '):');
  fails.forEach((f) => console.log('  - ' + f));
  process.exit(1);
}
console.log('corrections contract OK — DB row -> normalize -> prompt/apply, replacement survives, no "undefined"');
process.exit(0);
