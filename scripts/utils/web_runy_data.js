// web_runy_data.js — data pro stránky run na webu (scripts/web_runy.py, CODE-web 2026-11-02).
// Načte ŽIVÉ soubory appky v jednom kontextu vm (jako prohlížeč: config, runy, překlady, kresby run, utils) a vypíše JSON:
// na runu jméno a glosu (rnSplit), půlměsíc (lifeRuneSpan), popis tvaru a text z Kolekce (UI_TEXT.coll_shape / coll_rune)
// a kámen (runeSvg, frame:true — §5). Nic z toho tu nebydlí, jen se to přenese z appky do generátoru (§18, §20).
//   node scripts/utils/web_runy_data.js        → JSON na stdout
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const V2 = path.join(__dirname, '..', '..', 'v2');
const ctx = vm.createContext({ console, window: {}, navigator: {}, document: { addEventListener() {} } });
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-svgs.js', 'runar-utils.js']) {
  // chyby za běhu (chybějící DOM) se ignorují — deklarace vzniknou před během; co generátor potřebuje, se ověří níž
  try { vm.runInContext(fs.readFileSync(path.join(V2, f), 'utf8'), ctx, { filename: f }); } catch (e) { /* viz výš */ }
}
const g = (s) => vm.runInContext(s, ctx);
for (const fn of ['calcLifeRune', 'lifeRuneSpan', 'runeSvg', 'rnSplit']) {
  if (g('typeof ' + fn) !== 'function') { console.error('web_runy_data: v appce chybí funkce ' + fn); process.exit(1); }
}
const KLICE = ['atab_collection', 'coll_rune_lbl', 'tree_lr_origin', 'tree_visitor_dob', 'tree_reveal_btn', 'life_rune_lbl',
  'day_ph', 'month_ph', 'invalid_date', 'sp_privacy_link', 'hero_eyebrow'];
const out = { runy: [], ui: { is: {}, en: {} } };
for (const l of ['is', 'en']) for (const k of KLICE) {
  const v = g('UI_TEXT.' + l + '[' + JSON.stringify(k) + ']');
  if (typeof v !== 'string' || !v) { console.error('web_runy_data: UI_TEXT.' + l + '.' + k + ' chybí'); process.exit(1); }
  out.ui[l][k] = v;
}
const n = g('RUNES.length');
for (let i = 0; i < n; i++) {
  const r = 'RUNES[' + i + ']';
  const z = { n: g(r + '.n'), poradi: i, kamen: g('runeSvg(' + r + ', { frame: true, cls: "w-stone" })') };
  for (const l of ['is', 'en']) {
    g('lang = ' + JSON.stringify(l));   // rn() v rnSplit čte globální `lang` (v appce ho drží runar-app.js)
    const sp = g('rnSplit(' + r + ')');
    const text = (g('UI_TEXT.' + l + '.coll_rune') || {})[z.n] || [];
    const tvar = (g('UI_TEXT.' + l + '.coll_shape') || {})[z.n] || '';
    if (text.length !== 4 || !tvar) { console.error('web_runy_data: ' + z.n + ' (' + l + ') nemá 4 odstavce textu nebo popis tvaru'); process.exit(1); }
    z[l] = { jmeno: sp.name, glosa: sp.tr, pulmesic: g('lifeRuneSpan(' + r + ', ' + JSON.stringify(l) + ')'), tvar, text };
  }
  out.runy.push(z);
}
process.stdout.write(JSON.stringify(out));
