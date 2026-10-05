// ㉵ DATABÁZE ČTENÍ V SHRINE (2026-10-05, KUKY: „vyberu runu, třeba Hagalaz, a určitý obraz, a tím uvidím všechna různá čtení
// toho obrazu pro tu runu“). Seed-and-assert produkčního modulu v2/runar-readings-admin.js nad SMYŠLENÝMI čteními (repo je veřejné,
// skutečná čtení sem nepatří): stejný obraz v EN i IS padne do JEDNOHO řádku přehledu (párování přes RUNE_IMAGES), obraz mimo banku
// má vlastní řádek, klik na řádek vybere jen jeho čtení, poznámky a ✦ Keep se ukážou u čtení, filtry a hledání sedí. Obraz s
// apostrofem nesmí rozbít klik (onclick nese pořadové číslo, ne text).
//   node scripts/verify_readings_db.js
const vm = require('vm'), fs = require('fs');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const el = {};
const mk = (id) => (el[id] = el[id] || { id, innerHTML: '', textContent: '', value: '', options: [], style: {},
  classList: { toggle() {}, add() {}, remove() {} }, scrollIntoView() {} });
const S = { console: { log() {}, warn() {}, error() {} }, document: { getElementById: mk, querySelector: () => null, querySelectorAll: () => [] },
  localStorage: { getItem: () => null, setItem() {} }, spreadLabel: (n) => n };
S.window = S; S.globalThis = S; vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-character.js', 'runar-utils.js', 'runar-readings-admin.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
let fail = 0;
const rekni = (ok, popis) => { if (ok) console.log('OK    ' + popis); else { fail++; console.log('FAIL  ' + popis); } };

const IMG = vm.runInContext('RUNE_IMAGES', S);
const row = IMG.find((r) => r[0] === 'Hagalaz');
if (!row) { console.log('FAIL  v bance není obraz Hagalaz'); process.exit(1); }
const EN = row[3].replace(/\.\s*$/, ''), IS = row[2].replace(/\.\s*$/, '');
const MIMO = "A gull's shadow crosses the yard";   // mimo banku, s apostrofem
const cteni = (id, lang, img, kws, model, reps, txt) => ({ id, rune_name: 'Hagalaz', lang, area: 'Inner Growth', drawn_at: '2026-10-0' + id + 'T10:00:00Z',
  short_text: txt || 'Text ' + id, prompt_draws: img ? { image: img, kws, angle: 1, area_face: 0 } : {}, usage: { model }, follow_up: [], reports: reps || [] });
const DATA = [
  cteni('1', 'en', EN, 'disruption', 'gpt-6-sol', [{ at: '2026-10-01T11:00:00Z', type: 'other', message: 'Výborné čtení', flagged: '' }]),
  cteni('2', 'is', IS, 'disruption', 'claude-opus-5', [{ at: '2026-10-02T11:00:00Z', type: 'keep', message: '', flagged: 'Uložená věta.' }]),
  cteni('3', 'en', MIMO, 'hail', 'claude-opus-5'),
  cteni('4', 'en', '', '', 'claude-opus-5', [], 'Staré čtení bez obrazu'),
];
const T = S.__rdTest;
T.setRune('Hagalaz'); T.setRows(DATA); T.renderAll();
const sum = el['rd-summary'].innerHTML;
const radky = [...sum.matchAll(/onclick="pickRdImageIdx\((\d+)\)"[^>]*><td>([^<]*)<\/td><td>([^<]*)<\/td><td>(\d+)<\/td>/g)];
const rEN = radky.find((m) => m[2].indexOf(EN.slice(0, 20)) !== -1);
rekni(!!rEN && rEN[4] === '2', 'EN i IS téhož obrazu = jeden řádek přehledu, 2 čtení (' + (rEN ? rEN[4] : '—') + ')');
rekni(radky.some((m) => m[2].indexOf('gull') !== -1 && m[4] === '1'), 'obraz mimo banku má vlastní řádek');
rekni(radky.some((m) => m[2].indexOf('nezaznamenán') !== -1 && m[4] === '1'), 'čtení bez zaznamenaného obrazu má řádek „obraz nezaznamenán"');
rekni(!/pickRdImage\('/.test(sum), 'onclick nenese text obrazu (apostrof ho nerozbije)');
S.pickRdImageIdx(Number(rEN[1]));
rekni(el['rd-count'].textContent === '2 z 4', 'klik na obraz → jen jeho čtení (' + el['rd-count'].textContent + ')');
const list = el['readings-list'].innerHTML;
rekni(list.indexOf('Výborné čtení') !== -1 && list.indexOf('Uložená věta.') !== -1, 'poznámka i ✦ Keep se ukážou u čtení');
rekni(list.indexOf('význam: disruption') !== -1 && list.indexOf('claude-opus-5') !== -1, 'u čtení je význam i model');
S.pickRdImageIdx(Number(rEN[1]));   // zrušit výběr
S.setRdFilter('q', 'výborné');
rekni(el['rd-count'].textContent === '1 z 4', 'hledání prochází i poznámky (' + el['rd-count'].textContent + ')');
S.setRdFilter('q', '');
S.toggleRdFilter('keep');
rekni(el['rd-count'].textContent === '1 z 4', 'filtr ✦ Uloženo (' + el['rd-count'].textContent + ')');
S.toggleRdFilter('keep');
S.setRdFilter('model', 'claude-opus-5');
rekni(el['rd-count'].textContent === '3 z 4', 'filtr modelu (' + el['rd-count'].textContent + ')');

if (fail) { console.log('\n' + fail + ' selhalo'); process.exit(1); }
console.log('\nOK    databáze čtení: obraz EN+IS v jednom řádku, výběr obrazu, poznámky a ✦ Keep, filtry a hledání sedí');
