// Golden-output harness for the prompt-unification refactor.
// Loads the reading builders in a Node vm sandbox with randomness pinned
// (Math.random = 0.5, in-memory localStorage) so builder output is deterministic.
// Dumps all 10 builder outputs (single + 4 spreads x IS/EN) to a JSON file.
// Run BEFORE the refactor (baseline) and AFTER (compare) — outputs must match.
//   node golden_dump.js <outfile>
const fs = require('fs');
const vm = require('vm');
const DIR = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OUT = process.argv[2] || 'golden_baseline.json';

// Only the files the builders need (avoid t()/UI_TEXT redeclaration noise).
const files = ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'];

const M = {};
Object.getOwnPropertyNames(Math).forEach((k) => { M[k] = Math[k]; });
M.random = () => 0.5;

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

let code = 'var lang="en"; var userGender="hk"; var corrections=[]; var currentUser=null; var userName="";\n';
for (const f of files) code += '\n/* ===== ' + f + ' ===== */\n' + fs.readFileSync(DIR + f, 'utf8') + '\n;\n';

code += `
var _OUT = {};
function _R(n){ return RUNES.find(function(r){ return r.n===n; }); }
var u = { name:'Anna', area:'work and direction', seeking:'clarity', question:'What should I focus on?', d:15, m:6, y:1990 };
u.intention = (typeof INTENTIONS!=='undefined' && INTENTIONS.en) ? INTENTIONS.en[0] : '';
u.lifeRune = _R('Fehu');
// u2 = no question (noqBranch), no life rune, no intention — covers the other conditional paths
var u2 = { name:'Bjorn', area:'health', seeking:'strength', question:'' };
u2.intention = ''; u2.lifeRune = null;
var drawn = _R('Raidho');
var pool = ['Fehu','Uruz','Thurisaz','Ansuz','Raidho','Kenaz','Gebo','Wunjo','Hagalaz'].map(_R);
function grab(key, fn){ try { _OUT[key] = fn(); } catch(e){ _OUT[key] = 'ERROR: ' + (e && e.message) + '\\n' + (e && e.stack); } }
var samplecorr = [{ from:'Arctic', to:'Norðurljós', lang:'both', context:'test' }];
['is','en'].forEach(function(L){
  lang = L;
  grab('single_'+L,      function(){ return buildReadingPrompt(u, drawn, L, []); });
  grab('single_noq_'+L,  function(){ return buildReadingPrompt(u2, drawn, L, []); });
  grab('single_corr_'+L, function(){ return buildReadingPrompt(u, drawn, L, samplecorr); });
  grab('norns_'+L,       function(){ return buildNornsPrompt(u, pool.slice(0,3), L, []); });
  grab('kriz_'+L,        function(){ return buildKrizPrompt(u, pool.slice(0,5), L, []); });
  grab('horseshoe_'+L,   function(){ return buildHorseshoePrompt(u, pool.slice(0,7), L, []); });
  grab('yggdrasil_'+L,   function(){ return buildYggdrasilPrompt(u, pool, L, []); });
});
`;

vm.createContext(sandbox);
vm.runInContext(code, sandbox, { filename: 'golden.js' });
fs.writeFileSync('C:/Users/zkuku/Downloads/Runar-admin/' + OUT, JSON.stringify(sandbox._OUT, null, 2), 'utf8');

const keys = Object.keys(sandbox._OUT || {});
const errs = keys.filter((k) => String(sandbox._OUT[k]).startsWith('ERROR:'));
console.log('dumped ' + keys.length + ' builders -> ' + OUT + (errs.length ? ('  | ERRORS: ' + errs.join(', ')) : '  | all OK'));
if (errs.length) console.log(sandbox._OUT[errs[0]]);
