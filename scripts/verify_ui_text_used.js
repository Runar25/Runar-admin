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
// 2026-10-14 (kolo 4 kontroly architektury, CODE-read): landing web/site bere texty ŽIVĚ z UI_TEXT appky (data-k, T.klíč). Dokud ㉽ četla
// jen v2/, klíč, který appka přestane číst, by označila za mrtvý — po smazání by landing tiše ukázal prázdné místo (render dává T[k] || '').
// Proto i web/site: čtené tam = živé, a co landing čte, musí v UI_TEXT existovat (přejmenování klíče v appce jinak landing rozbije potichu).
const WEB = path.join(__dirname, '..', 'web', 'site');
function ctene_webem(src) {
  const out = new Set();
  for (const m of src.matchAll(/data-k="([A-Za-z0-9_]+)"/g)) out.add(m[1]);
  for (const m of src.matchAll(/\bT\.([A-Za-z_][A-Za-z0-9_]*)/g)) out.add(m[1]);
  return [...out];
}

// Stav 2026-10-10 (CODE-read). Smazat je = doména CODE-tune (runar-translations.js, EN i IS najednou); pak je odsud vyškrtni.
// 2026-10-10 CODE-tune: všech 35 smazáno z runar-translations.js (EN i IS) — ráčna na nule.
const BASELINE = new Set([]);

function prefixy(src) {
  const out = new Set();
  for (const m of src.matchAll(/['"`]([a-z][a-z0-9_]*_)['"`]\s*\+/g)) out.add(m[1]);
  return [...out];
}
// 2026-10-12: i dynamická PŘÍPONA (`t(k + '_hint')`). Bez ní ㉽ 2026-10-10 označila area_hint, seek_hint a intention_hint za mrtvé,
// smazaly se a „+“ u formuláře ukazoval holý klíč. Klíč s takovou příponou se bere jako živý (raději nechat mrtvý než smazat živý).
function pripony(src) {
  const out = new Set();
  for (const m of src.matchAll(/\+\s*['"`](_[a-z][a-z0-9_]*)['"`]/g)) out.add(m[1]);
  return [...out];
}
function mrtve(keys, src) {
  const pre = prefixy(src), post = pripony(src);
  return keys.filter((k) => !new RegExp('\\b' + k + '\\b').test(src) && !pre.some((p) => k.startsWith(p)) && !post.some((p) => k.endsWith(p)));
}

if (process.argv.includes('--test')) {
  // Životní cyklus: čtený klíč živý · nečtený mrtvý · čtený přes vlastnost živý · dynamický prefix živý · podřetězec jiného slova NE.
  const src = "t('a_live'); x = UI_TEXT[lang].b_prop; y = t('rune_' + n); z = 'c_deadx'; w = t(k + '_hint');";
  const d = mrtve(['a_live', 'b_prop', 'rune_fehu', 'c_dead', 'd_gone', 'area_hint'], src);
  const w = ctene_webem('<div data-k="hero_quote"></div> m.textContent = T.redeem_err_rate; x = UI.y; <i data-k="hero_eyebrowX">');
  const ok = d.length === 2 && d.includes('c_dead') && d.includes('d_gone') && w.length === 3 && w.includes('hero_quote') && w.includes('redeem_err_rate') && w.includes('hero_eyebrowX');
  console.log(ok ? 'OK    samotest: čtený, vlastností čtený i dynamický klíč (předpona i přípona) živý; nečtený a podřetězec mrtvý; landing: data-k i T.klíč' : 'FAIL  samotest ' + JSON.stringify(d));
  process.exit(ok ? 0 : 1);
}

const ctx = { console, window: {} };
vm.createContext(ctx);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js']) vm.runInContext(fs.readFileSync(path.join(V2, f), 'utf8'), ctx);
const keys = Object.keys(vm.runInContext('UI_TEXT.en', ctx));
const webSrc = fs.existsSync(WEB) ? fs.readdirSync(WEB).filter((f) => /\.html$/.test(f)).map((f) => fs.readFileSync(path.join(WEB, f), 'utf8')).join('\n') : '';
const src = fs.readdirSync(V2).filter((f) => /\.(js|html)$/.test(f) && f !== 'runar-translations.js')
  .map((f) => fs.readFileSync(path.join(V2, f), 'utf8')).join('\n') + '\n' + webSrc;
const chybi = ctene_webem(webSrc).filter((k) => !keys.includes(k));
for (const k of chybi) console.log('FAIL  web/site čte UI_TEXT.' + k + ', ale v appce není — landing ukáže prázdné místo (přejmenovaný/smazaný klíč?)');
const dead = mrtve(keys, src);
const nove = dead.filter((k) => !BASELINE.has(k));
const pryc = [...BASELINE].filter((k) => !dead.includes(k));
for (const k of nove) console.log('FAIL  UI_TEXT.' + k + ' nic nečte — smaž ho (EN i IS), nebo ho použij');
if (pryc.length) console.log('ℹ  už není mrtvý nebo zmizel (vyškrtni z BASELINE ve scripts/verify_ui_text_used.js): ' + pryc.join(' · '));
console.log(nove.length ? 'FAIL  přibyl klíč UI_TEXT, který nic nečte' : chybi.length ? 'FAIL  landing web/site čte klíč, který v UI_TEXT není'
  : 'OK    žádný nový mrtvý klíč UI_TEXT (' + keys.length + ' klíčů; ' + dead.length + ' mrtvých v ráčně čeká na smazání)');
process.exit(nove.length || chybi.length ? 1 : 0);
