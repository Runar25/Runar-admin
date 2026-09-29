// ㉮ CENA ČTENÍ — 2026-09-29, KUKY: „potřebuju přesně vědět, kolik nás stojí… měřit automaticky, ať přesně vidíme každé čtení“.
//
// PROČ: cena se počítala jen ve scripts/utils/stats.js; od 2026-09-29 je ceník v v2/runar-config.js (MODEL_PRICES) a výpočet
// v v2/runar-utils.js (readingCostUsd) — sdílí ho deník, report i stats.js. Kontrola tvrdí VÝSLEDEK (§19):
//  (1) výpočet na známých vstupech (Anthropic bez cache, OpenAI s cache, OpenAI se zápisem do cache — čísla ze stats.js 2026-09-24/25),
//  (2) neznámý model → null (nepočítá se potichu),
//  (3) produkční renderJournal: admin vidí u čtení i u Asku model + cenu + čas; běžný uživatel nic z toho.
//   node scripts/verify_reading_cost.js
'use strict';
const fs = require('fs'), vm = require('vm');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const prvky = {};
const mk = (id) => (prvky[id] = prvky[id] || { id, style: {}, innerHTML: '', textContent: '', classList: { add() {}, remove() {}, toggle() {} } });
const S = { console: { log() {}, warn() {}, error() {} },
  document: { getElementById: (id) => mk(id), querySelector: () => null, querySelectorAll: () => [] },
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} } };
S.window = S; S.globalThis = S;
vm.createContext(S);
let code = 'var currentUser={id:"u1",email:"x@y.z"}; var userTier="premium"; var sb=null; var lang="en"; var isTester=false;\n';
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-svgs.js', 'runar-journal.js'])
  code += fs.readFileSync(D + f, 'utf8') + '\n;\n';
vm.runInContext(code, S);
const cena = vm.runInContext('readingCostUsd', S);
let fail = 0;
const rekni = (ok, popis) => { if (ok) console.log('OK    ' + popis); else { fail++; console.log('FAIL  ' + popis); } };
const blizko = (a, b) => a != null && Math.abs(a - b) < 1e-9;
rekni(blizko(cena({ model: 'claude-opus-4-8', input_tokens: 1692, output_tokens: 152 }), 0.01226), 'Anthropic: 1692 vstup + 152 výstup = $0.01226');
rekni(blizko(cena({ model: 'gpt-6-sol', prompt_tokens: 1000, prompt_tokens_details: { cached_tokens: 200 }, completion_tokens: 100 }), 0.00264), 'OpenAI s cache = $0.00264');
rekni(blizko(cena({ model: 'gpt-6-sol', prompt_tokens: 1000, prompt_tokens_details: { cached_tokens: 200, cache_write_tokens: 700 }, completion_tokens: 100 }), 0.00299), 'OpenAI se zápisem do cache = $0.00299');
rekni(cena({ model: 'neznamy-model', input_tokens: 10, output_tokens: 10 }) === null, 'neznámý model → null');

const cteni = [{ id: 'a', rune_name: 'Fehu', rune_glyph: 'ᚠ', lang: 'en', area: 'Love & Relationships', short_text: 'x', deep_text: 'y', drawn_at: new Date().toISOString(),
  usage: { model: 'claude-opus-5', input_tokens: 1692, output_tokens: 152, ms: 4200 },
  follow_up: [{ id: 'f1', q: 'What is this reading telling me?', a: 'An answer.', usage: { model: 'gpt-6-sol', prompt_tokens: 1000, prompt_tokens_details: { cached_tokens: 200 }, completion_tokens: 100, ms: 2100 } }] }];
const vykresli = (email) => { vm.runInContext('currentUser={id:"u1",email:' + JSON.stringify(email) + '}', S); prvky['journal-list'] = null; vm.runInContext('renderJournal', S)(cteni); return mk('journal-list').innerHTML; };
const admin = vm.runInContext('ADMIN_EMAILS', S)[0];
const hA = vykresli(admin), hU = vykresli('nekdo@example.com');
rekni(hA.indexOf('Model: Opus 5 · $0.0123 · 4.2 s') !== -1, 'admin: u čtení model + cena + čas („Model: Opus 5 · $0.0123 · 4.2 s“)');
rekni(hA.indexOf('Model: GPT-6 sol · $0.0026 · 2.1 s') !== -1, 'admin: u Asku model + cena + čas („Model: GPT-6 sol · $0.0026 · 2.1 s“)');
rekni(hU.indexOf('$0.0') === -1 && hU.indexOf('Model:') === -1, 'běžný uživatel cenu ani model nevidí');

console.log(fail ? '\n' + fail + ' selhalo' : '\nOK  cena čtení: jeden výpočet (config + utils), admin ji vidí u každého čtení i Asku');
process.exit(fail ? 1 : 0);
