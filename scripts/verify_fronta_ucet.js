// verify_fronta_ucet.js — smoke ㊿: fronta neuložených čtení a Asků patří účtu, který ji vytvořil (CODE-tune 2026-10-12).
//
// Proč: když server čtení nebo Ask nepotvrdí, appka si ho drží v úložišti prohlížeče (pendingReadings / pendingAsks) a pošle ho znovu
// (_flushPending → claude-proxy mode 'resave'). Do 2026-10-12 odešlo všechno, co ve frontě leželo, pod PRÁVĚ přihlášeným účtem — a resave
// ukládá podle JWT. Na sdíleném zařízení by se neuložené čtení jednoho člověka (jméno, otázka, text) zapsalo do deníku toho, kdo se
// přihlásí po něm. Nalezeno při inventuře úložiště pro zásady soukromí.
// Co dělá: protlačí skutečné _pendAdd a _flushPending (runar-utils.js) s podvrženým callProxy a localStorage: položka účtu A nese jeho
// id; pod účtem B se neodešle a zůstane ve frontě; pod A odejde a po potvrzení zmizí; položka bez id účtu (z doby před opravou) jde
// jako dřív. Neumí: server (resave sám vlastníka položky nekontroluje — ví jen JWT). Útok: scripts/protipriklady.py → PRIPADY.
//   node scripts/verify_fronta_ucet.js
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const V2 = path.resolve(process.env.RUNAR_ROOT || path.join(__dirname, '..'), 'v2');
const store = {};
const S = { console: { log() {}, warn() {}, error() {} }, Math, JSON, Date, Promise,
  localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } },
  document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {} },
  setTimeout: () => 0, clearTimeout: () => {} };
S.window = S; S.self = S; S.globalThis = S;
vm.createContext(S);
let code = 'var currentUser = null; var lang = "en"; var __posl = [];\n'
         + 'var callProxy = async function (s, p, t, u, c, meta, mode) {\n'
         + '  __posl.push({ mode: mode, polozka: meta && (meta.ask_entry_id || meta.id), ucet: currentUser && currentUser.id });\n'
         + '  return { saved: true };\n};\n';
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js'])
  code += fs.readFileSync(path.join(V2, f), 'utf8') + '\n;\n';
try { vm.runInContext(code, S, { filename: 'fronta-ucet.js' }); }
catch (e) { console.log('FAIL  nepodařilo se načíst runar-utils.js: ' + e.message); process.exit(1); }
const run = (c) => vm.runInContext(c, S);
const fronta = (k) => JSON.parse(store[k] || '[]');
let fail = 0;
const ok = (c, m) => { console.log((c ? '  ok    ' : '  FAIL  ') + m); if (!c) fail++; };

(async () => {
  run('currentUser = { id: "A" };');
  run('_pendAdd("pendingReadings", { id: "rA", journal: { id: "rA", kind: "single" }, model_text: "x" });');
  run('_pendAdd("pendingAsks", { id: "qA", reading_id: "rA", question: "q", answer: "a" });');
  ok(fronta('pendingReadings')[0] && fronta('pendingReadings')[0].uid === 'A' && fronta('pendingAsks')[0] && fronta('pendingAsks')[0].uid === 'A',
     'položka ve frontě nese účet, který ji vytvořil');

  run('currentUser = { id: "B" }; __posl.length = 0;');
  await run('_flushPending()');
  const podB = run('__posl.slice()');
  ok(podB.length === 0, 'pod jiným účtem se cizí čtení ani Ask neodešle — odesláno: ' + JSON.stringify(podB));
  ok(fronta('pendingReadings').length === 1 && fronta('pendingAsks').length === 1, 'cizí položky zůstanou ve frontě pro svůj účet');

  run('currentUser = { id: "A" }; __posl.length = 0;');
  await run('_flushPending()');
  const podA = run('__posl.slice()');
  ok(podA.length === 2 && podA.every((x) => x.ucet === 'A' && x.mode === 'resave'), 'pod svým účtem odejdou obě — odesláno: ' + JSON.stringify(podA));
  ok(fronta('pendingReadings').length === 0 && fronta('pendingAsks').length === 0, 'po potvrzení serveru fronta zmizí');

  store.pendingReadings = JSON.stringify([{ id: 'rStara', journal: { id: 'rStara' }, model_text: 'x' }]);
  run('currentUser = { id: "B" }; __posl.length = 0;');
  await run('_flushPending()');
  ok(run('__posl.length') === 1, 'položka bez účtu (z doby před opravou) jde jako dřív');

  if (fail) { console.log('FAIL  fronta neuložených čtení: ' + fail + ' kroků neprošlo'); process.exit(1); }
  console.log('OK    fronta neuložených čtení patří účtu, který ji vytvořil — čtení i Ask; cizí zůstane ve frontě, stará jde jako dřív');
})();
