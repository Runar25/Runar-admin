// ㉯ TEXTY KOLEKCE — popis tvaru vedle glyfu + text runy, protlačené PRODUKČNÍ funkcí openCollDetail (§19).
//
// PROC (2026-09-30, KUKY bod 5: „dáme popis do rune collection přesně vedle toho velkého glyfu“): popis tvaru i čtyři
// odstavce textu runy jsou DATA v UI_TEXT (coll_shape, coll_rune) a do DOM je nese openCollDetail. Kontrola, která by
// jen hledala klíče v translations.js, by neviděla, že se text do detailu nedostane (přejmenovaný klíč runy, vyndaný
// řádek v openCollDetail, jiný jazyk po přepnutí). Tady se každá z 25 run otevře reálnou funkcí v obou jazycích a čte
// se VÝSLEDEK v DOM — #cd-shape = coll_shape[runa] (neprázdný), #cd-rune-text = 4 odstavce coll_rune[runa].
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = path.join(__dirname, '..', 'v2') + path.sep;
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
const EL = {};
const el = (id) => EL[id] || (EL[id] = { id, textContent: '', innerHTML: '', style: {}, children: [],
  appendChild(c) { this.children.push(c); }, scrollIntoView() {}, classList: { add() {}, remove() {} } });
S.document = { getElementById: el, querySelectorAll: () => [], querySelector: () => null,
  createElement: () => ({ textContent: '', style: {} }) };
S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-svgs.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
// openCollDetail + _paintCollRuneText vyříznuté z runar-app.js beze změny (celý soubor táhne Supabase a stav appky).
const app = fs.readFileSync(D + 'runar-app.js', 'utf8');
const vyrizni = (jm) => { const i = app.indexOf('\nfunction ' + jm + '('); if (i === -1) throw new Error(jm + ' v runar-app.js není');
  const j = app.indexOf('\nfunction ', i + 1); return app.slice(i, j === -1 ? undefined : j); };
vm.runInContext('var activeCollRune = null; function loadCollAudio() {}\n' + vyrizni('openCollDetail') + '\n' + vyrizni('_paintCollRuneText'), S);
const RUNES = vm.runInContext('RUNES', S), UI = vm.runInContext('UI_TEXT', S);
const vady = [];
for (const L of ['en', 'is']) {
  vm.runInContext('lang = "' + L + '"', S);
  const tv = UI[L].coll_shape || {};
  for (const r of RUNES) {
    for (const k of Object.keys(EL)) delete EL[k];
    S.openCollDetail(r, el('cell'), true);
    const tvar = el('cd-shape').textContent, odst = el('cd-rune-text').children.length;
    if (!tvar || tvar !== tv[r.n]) vady.push(L + ' ' + r.n + ': tvar v detailu „' + String(tvar).slice(0, 30) + '“ ≠ coll_shape');
    if (odst !== 4) vady.push(L + ' ' + r.n + ': text runy má ' + odst + ' odstavců, čeká se 4');
  }
  const navic = Object.keys(tv).filter((k) => !RUNES.some((r) => r.n === k));
  if (navic.length) vady.push(L + ' coll_shape má klíč bez runy: ' + navic.join(', '));
}
// Jazyk po přepnutí: tatáž runa otevřená v EN a pak v IS musí mít jiný text (jinak se maluje jen jeden jazyk).
if (UI.en.coll_shape && UI.is.coll_shape && UI.en.coll_shape.Fehu === UI.is.coll_shape.Fehu) vady.push('EN a IS popis Fehu jsou stejné');
if (vady.length) { vady.slice(0, 10).forEach((v) => console.log('FAIL  ' + v)); console.log('CELKEM ' + vady.length + ' vad v textech Kolekce'); process.exit(1); }
console.log('OK    texty Kolekce: ' + RUNES.length + ' run × EN/IS — popis tvaru vedle glyfu i 4 odstavce textu runy dorazí do detailu (openCollDetail)');
