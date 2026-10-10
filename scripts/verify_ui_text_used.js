// Smoke ㉽ — klíč v UI_TEXT, který nic nečte, nesmí přibývat (mrtvý text v obou jazycích = zastaralé místo, CLAUDE.md §20, §22).
//
// Proč (2026-10-10, kontrola architektury, CODE-read; owner: „jak jsi našel README, možná najdeš víc míst… pozor na to“):
// check-translations.py hlídá jen to, že EN a IS mají STEJNÉ klíče — ne to, jestli je někdo čte. Při kontrole našlo 35 klíčů,
// které po zrušených funkcích (editor charakteru, starý formulář, Norny „3 readings“, starý banner) zůstaly v obou jazycích a nikdo
// je nečetl. Mrtvý text se čte jako pravda: kdo hledá „jak appka říká X“, najde ho v UI_TEXT a převezme.
// Co dělá: klíč UI_TEXT.en je ŽIVÝ, když se jeho jméno objeví jako celé slovo kdekoli ve v2/*.js|html mimo runar-translations.js
// (t('k'), tp('k'), UI_TEXT[lang].k, data-atribut…), nebo když začíná prefixem, který kód skládá dynamicky (`'rune_' + x`).
// RÁČNA podle JMEN: klíč mimo BASELINE, který nic nečte → FAIL. Klíč z BASELINE, který zmizel nebo ožil → připomene ho z BASELINE smazat.
//   node scripts/verify_ui_text_used.js          · node scripts/verify_ui_text_used.js --test
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const V2 = path.join(__dirname, '..', 'v2');

// Stav 2026-10-10 (CODE-read). Smazat je = doména CODE-tune (runar-translations.js, EN i IS najednou); pak je odsud vyškrtni.
const BASELINE = new Set([
  'tab_reader', 'commit_btn', 'setup_someone_lbl', 'reading_ready_note', 'dob_lbl', 'area_hint', 'seek_hint', 'intention_hint',
  'ritual_3readings', 'spread3_pos_past', 'spread3_pos_present', 'spread3_pos_future', 'spread3_draw_note',
  'char_lbl', 'char_note', 'test_lbl', 'test_note', 'test_ph', 'test_btn', 'runar_responds', 'version_lbl', 'preview_btn',
  'save_char_btn', 'st_listening', 'st_char_saved', 'st_char_memory', 'st_restored', 'st_name_req', 'st_no_versions', 'st_no_table',
  'continue_btn', 'error_prefix', 'visitor_label', 'tree_signin_note', 'rs_banner_counter',
]);

function prefixy(src) {
  const out = new Set();
  for (const m of src.matchAll(/['"`]([a-z][a-z0-9_]*_)['"`]\s*\+/g)) out.add(m[1]);
  return [...out];
}
function mrtve(keys, src) {
  const pre = prefixy(src);
  return keys.filter((k) => !new RegExp('\\b' + k + '\\b').test(src) && !pre.some((p) => k.startsWith(p)));
}

if (process.argv.includes('--test')) {
  // Životní cyklus: čtený klíč živý · nečtený mrtvý · čtený přes vlastnost živý · dynamický prefix živý · podřetězec jiného slova NE.
  const src = "t('a_live'); x = UI_TEXT[lang].b_prop; y = t('rune_' + n); z = 'c_deadx';";
  const d = mrtve(['a_live', 'b_prop', 'rune_fehu', 'c_dead', 'd_gone'], src);
  const ok = d.length === 2 && d.includes('c_dead') && d.includes('d_gone');
  console.log(ok ? 'OK    samotest: čtený, vlastností čtený i dynamický klíč živý; nečtený a podřetězec mrtvý' : 'FAIL  samotest ' + JSON.stringify(d));
  process.exit(ok ? 0 : 1);
}

const ctx = { console, window: {} };
vm.createContext(ctx);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js']) vm.runInContext(fs.readFileSync(path.join(V2, f), 'utf8'), ctx);
const keys = Object.keys(vm.runInContext('UI_TEXT.en', ctx));
const src = fs.readdirSync(V2).filter((f) => /\.(js|html)$/.test(f) && f !== 'runar-translations.js')
  .map((f) => fs.readFileSync(path.join(V2, f), 'utf8')).join('\n');
const dead = mrtve(keys, src);
const nove = dead.filter((k) => !BASELINE.has(k));
const pryc = [...BASELINE].filter((k) => !dead.includes(k));
for (const k of nove) console.log('FAIL  UI_TEXT.' + k + ' nic nečte — smaž ho (EN i IS), nebo ho použij');
if (pryc.length) console.log('ℹ  už není mrtvý nebo zmizel (vyškrtni z BASELINE ve scripts/verify_ui_text_used.js): ' + pryc.join(' · '));
console.log(nove.length ? 'FAIL  přibyl klíč UI_TEXT, který nic nečte'
  : 'OK    žádný nový mrtvý klíč UI_TEXT (' + keys.length + ' klíčů; ' + dead.length + ' mrtvých v ráčně čeká na smazání)');
process.exit(nove.length ? 1 : 0);
