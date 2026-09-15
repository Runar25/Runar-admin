// vzory.js — vypíše VŠECHNY vzory (citované ukázky), které dnes dostává model, přímo z hotových promptů.
//
// Proč (KUKY 2026-09-15): „podíváme se na to, jak jsou napsané vzory. Kolik jich máme? Dej mi jejich znění!"
// Vzor = text v uvozovkách uvnitř instrukce („Fehu is that warmth passed from hand to hand", not „Fehu is wealth")
// nebo za „e.g." / „til dæmis". Model vzor často přebírá doslova nebo jeho tvar (měřeno: memory
// `prompt-directive-makes-model-copy`, `oprava-promptu-odebira-vadu`) — proto je potřeba je vidět pohromadě.
//
// ⚠️ Nečte zdrojový kód (tam jsou i komentáře a mrtvé větve), ale PROMPTY postavené produkčními buildery:
// systém · Single · Ask · Norns · Kříž · Horseshoe · Yggdrasil · životní runa · rozbor jména, EN i IS,
// přes 80 losů (úhel, délka, konec, jméno, obraz) a varianty kontextu (otázka, oblast, hledání, záměr,
// životní runa). Čtení a otázka uživatele se podstrčí jako «CTENI»/«OTAZKA», aby se nepočítaly jako vzor.
// Není tu The Gathering (runar-gathering.js se nahrazuje) ani laboratorní buildSysPromptV2.
//
//   node scripts/vzory.js            → souhrn + znění
//   node scripts/vzory.js --json     → strojově
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = path.join(__dirname, '..', 'v2') + path.sep;
const JSON_OUT = process.argv.includes('--json');

function sandbox(lang) {
  const S = { console: { log() {}, warn() {}, error() {} } };
  S.window = S; S.globalThis = S; S.lang = lang;
  S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
  S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
  vm.createContext(S);
  vm.runInContext('var userGender="kk"; var corrections=[];', S);
  for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
    vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
  return S;
}

const nalezy = new Map();   // vzor -> Set("builder/lang")
function sber(text, kde) {
  const t = String(text || '');
  const radky = t.split('\n').filter(l => !/return ONLY this JSON|Skilaðu EINGÖNGU|^\s*\[\{"rune"/.test(l));
  const telo = radky.join('\n');
  const re = /"([^"\n]{3,300})"|“([^”\n]{3,300})”|„([^“"\n]{3,300})[“"]/g;
  let m;
  while ((m = re.exec(telo))) {
    const v = (m[1] || m[2] || m[3]).trim();
    if (/«CTENI»|«OTAZKA»|^Kuky$/.test(v)) continue;
    if (!/\s/.test(v) && v.length < 25) continue;       // jednotlivé slovo v uvozovkách = pojem, ne vzor
    if (!nalezy.has(v)) nalezy.set(v, new Set());
    nalezy.get(v).add(kde);
  }
  const re2 = /(e\.g\.|for example|such as|til dæmis|t\.d\.)[^.\n]{3,200}/gi;
  while ((m = re2.exec(telo))) {
    const v = m[0].trim();
    if (!nalezy.has(v)) nalezy.set(v, new Set());
    nalezy.get(v).add(kde);
  }
}

for (const lang of ['en', 'is']) {
  const S = sandbox(lang);
  const run = (kod, kde) => { try { sber(vm.runInContext(kod, S), kde + '/' + lang); } catch (e) { /* builder s jinymi argumenty preskocen */ } };
  vm.runInContext('var __seed = 1; Math.random = function () { __seed = (__seed * 1103515245 + 12345) % 2147483648; return __seed / 2147483648; };', S);
  const def = lang === 'is' ? 'DEF_CHAR_IS' : 'DEF_CHAR_EN';
  run('buildSysPrompt(' + def + ', "' + lang + '")', 'system');
  const ctx = [
    '{ name: "Kuky" }',
    '{ name: "Kuky", lifeRune: RUNES[6] }',
    '{ name: "Kuky", lifeRune: RUNES[6], question: "«OTAZKA»" }',
    '{ name: "Kuky", lifeRune: RUNES[6], area: AREAS.' + lang + '[2], seeking: SEEKS.' + lang + '[1], intention: INTENTIONS.' + lang + '[0] }',
  ];
  for (let seed = 1; seed <= 80; seed++) {
    vm.runInContext('__seed = ' + (seed * 7919) + ';', S);
    const c = ctx[seed % ctx.length];
    const r = (seed * 5) % 25;
    run('buildReadingPromptSingle(' + c + ', RUNES[' + r + '], "' + lang + '", [])', 'single');
    run('buildNornsPromptFate(' + c + ', [RUNES[' + r + '], RUNES[' + ((r + 3) % 25) + '], RUNES[' + ((r + 7) % 25) + ']], "' + lang + '", [])', 'norns');
    run('buildKrizPromptCross(' + c + ', RUNES.slice(' + (r % 20) + ', ' + (r % 20 + 5) + '), "' + lang + '", [])', 'kriz');
    run('buildHorseshoePromptSeven(' + c + ', RUNES.slice(' + (r % 18) + ', ' + (r % 18 + 7) + '), "' + lang + '", [])', 'horseshoe');
    run('buildYggdrasilPromptNine(' + c + ', RUNES.slice(' + (r % 16) + ', ' + (r % 16 + 9) + '), "' + lang + '", [])', 'yggdrasil');
    run('buildAskPrompt("«CTENI»", "«OTAZKA»", "Isa", "' + lang + '", [], ' + (seed % 2 ? 'RUNES[6]' : 'null') + ', ' + (seed % 3 ? '{}' : '{ area: AREAS.' + lang + '[1], question: "«OTAZKA»" }') + ', ' + (seed % 4 ? '{ mode: "single", runy: ["Isa"] }' : '{ mode: "kriz", runy: ["Isa","Fehu","Uruz","Kenaz","Gebo"] }') + ')', 'ask');
    run('buildLifeRunePrompt("Kuky", RUNES[' + r + '], 12, ' + ((seed % 12) + 1) + ', 1980, "' + lang + '", ' + (seed % 2 ? 'true' : 'false') + ', [])', 'zivotni-runa');
    run('buildNameLorePrompt("Kuky", null, "' + lang + '", [])', 'rozbor-jmena');
  }
}

const seznam = [...nalezy.entries()].map(([v, kde]) => ({ vzor: v, kde: [...kde].sort() }))
  .sort((a, b) => a.kde[0].localeCompare(b.kde[0]) || a.vzor.localeCompare(b.vzor));
if (JSON_OUT) { console.log(JSON.stringify(seznam, null, 1)); process.exit(0); }
const en = seznam.filter(x => x.kde.some(k => k.endsWith('/en')));
const is = seznam.filter(x => x.kde.some(k => k.endsWith('/is')));
console.log('vzorů celkem: ' + seznam.length + '  (v EN promptech ' + en.length + ', v IS promptech ' + is.length + ')\n');
for (const [nazev, sada] of [['EN', en], ['IS', is]]) {
  console.log('════ ' + nazev + ' ════');
  sada.forEach((x, i) => console.log(String(i + 1).padStart(2) + '. [' + [...new Set(x.kde.map(k => k.split('/')[0]))].join(', ') + ']  ' + x.vzor));
  console.log('');
}
