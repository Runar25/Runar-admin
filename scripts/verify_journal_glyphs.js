// ㉭ DENÍK: runy spreadu jako KAMENY, ne font glyfy (§5) — 2026-09-27, KUKY „jeď bod 4, deník spready glyfy“.
//
// PROČ: karta spreadu ukazovala uložený řádek „ᛃ JERA · ᛖ EHWAZ · ○ BLANK“ (readings.short_text = rune_display) jako TEXT —
// runy fontem (nekonzistentní napříč zařízeními) a Blank jako „○“; §5 obojí zakazuje. Single karta už kámen měla, spread ne,
// a nic to nehlídalo. Kontrola tvrdí VÝSLEDEK (§19): uložený řádek z DB → produkční renderJournal → HTML karty.
//  (1) každá runa v řádku dostane kámen z runeSvg (počet <svg> = počet run),
//  (2) v řádku run nezůstal žádný runový znak písma (U+16A0–16FF) ani „○“,
//  (3) co se nepozná (starý formát, Gathering), zůstane čitelným textem — nic nezmizí.
//
//   node scripts/verify_journal_glyphs.js
'use strict';
const fs = require('fs'), vm = require('vm');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const prvky = {};
const mk = (id) => (prvky[id] = prvky[id] || { id, style: {}, innerHTML: '', textContent: '', classList: { add() {}, remove() {}, toggle() {} } });
const S = {
  console: { log() {}, warn() {}, error() {} },
  document: { getElementById: (id) => mk(id), querySelector: () => null, querySelectorAll: () => [] },
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
};
S.window = S; S.globalThis = S;
vm.createContext(S);
let code = 'var currentUser={id:"u1",email:"a@b.cz"}; var userTier="premium"; var sb=null; var lang="en"; var isTester=false;\n';
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-svgs.js', 'runar-journal.js'])
  code += fs.readFileSync(D + f, 'utf8') + '\n;\n';
vm.runInContext(code, S);

let fail = 0;
const rekni = (ok, popis) => { if (ok) console.log('OK    ' + popis); else { fail++; console.log('FAIL  ' + popis); } };
const now = new Date().toISOString();
vm.runInContext('renderJournal', S)([
  { id: 'a', rune_name: 'KRIZ', rune_glyph: '✦', lang: 'en', area: 'spread', short_text: 'ᚷ GEBO · ᛗ MANNAZ · ᛈ PERTH · ○ BLANK · ᚹ WUNJO', deep_text: 'x', drawn_at: now },
  { id: 'b', rune_name: 'NORNS', rune_glyph: '✦', lang: 'is', area: 'spread', short_text: 'ᛁ ÍSS · ᚲ KENAZ · ᚦ ÞURS', deep_text: 'x', drawn_at: now },
  { id: 'c', rune_name: 'THE GATHERING', rune_glyph: '✦', lang: 'en', area: 'spread', short_text: 'three runes gathered', deep_text: 'x', drawn_at: now },
]);
const html = mk('journal-list').innerHTML;
const radky = html.split('class="jcard-gathering-runes">').slice(1).map((s) => s.slice(0, s.indexOf('</div>', s.lastIndexOf('</span>') > -1 ? s.lastIndexOf('</span>') : 0)));
rekni(radky.length === 3, 'deník vykreslil 3 karty spreadu (' + radky.length + ')');
const svg = (s) => (s.match(/<svg/g) || []).length;
const fontGlyf = (s) => /[\u16A0-\u16FF○]/.test(s.replace(/<svg[\s\S]*?<\/svg>/g, ''));
rekni(svg(radky[0] || '') === 5 && !fontGlyf(radky[0] || ''), 'EN kříž: 5 run = 5 kamenů, žádný font glyf ani „○“ (Blank je kámen)');
rekni(svg(radky[1] || '') === 3 && !fontGlyf(radky[1] || '') && (radky[1] || '').indexOf('ÞURS') !== -1, 'IS Norny: 3 kameny, islandská jména zůstala');
rekni(svg(radky[2] || '') === 0 && (radky[2] || '').indexOf('three runes gathered') !== -1, 'nepoznaný formát zůstane textem (nic nezmizí)');

console.log(fail ? '\n' + fail + ' selhalo' : '\nOK  runy spreadu v deníku jsou kameny, ne font glyfy');
process.exit(fail ? 1 : 0);
