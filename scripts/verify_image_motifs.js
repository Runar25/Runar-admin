// ㉟ MOTIVY OBRAZŮ — hlídá motiv-guard v `_seasonalImagery` (2026-08-22).
// Owner chtěl ZACHOVAT víc obrazů téhož motivu (jehňata, půlnoční slunce, odraz) místo
// jejich mazání kvůli překryvu — řešení je ve VÝBĚRU: řádek smí nést 7. sloupec = jméno
// motivu a dva stejně pojmenované motivy nesmí přijít hned po sobě (pro tutéž sadu run).
// §19: kontrola protlačí známý stav PRODUKČNÍ cestou a ověří výsledek, ne tvar kódu.
const fs = require('fs'), vm = require('vm');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';

// sandbox s falešným localStorage — guard i sáček ho používají
const uloz = {};
const S = {
  console: { log() {}, warn() {}, error() {} },
  localStorage: {
    getItem: (k) => (k in uloz ? uloz[k] : null),
    setItem: (k, v) => { uloz[k] = String(v); },
  },
  document: { getElementById: () => null, querySelector: () => null },
};
S.window = S; S.globalThis = S; S.lang = 'en';
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8'), S);

const IMGS = vm.runInContext('RUNE_IMAGES', S);
const RUNES = vm.runInContext('RUNES', S);
let fail = 0;

// 1) struktura: 7 sloupcu · 8 (motiv neprazdny) · 9 (jadro: motiv smi byt '', index 8 = 'jadro')
for (const row of IMGS) {
  // 2026-08-23: register (povinny) na indexu 6, motiv (volitelny) na 7 — viz ㊱.
  // 2026-09-19: radek s JADREM ma 9 sloupcu — [8]==='jadro', motiv na [7] smi byt ''.
  const ok9 = row.length === 9 && row[8] === 'jadro' && typeof row[7] === 'string';
  if (!ok9 && (row.length < 7 || row.length > 8 || (row.length === 8 && !(typeof row[7] === 'string' && row[7])))) {
    fail++; console.log('FAIL  vadny radek (' + row[0] + '): ' + row.length + ' sloupcu / prazdny motiv');
  }
}

// 2) pojmenovaný motiv musí být na >=2 řádcích — na jednom je mrtvá váha (guard nemá co střídat)
const poc = {};
for (const row of IMGS) if (row[7]) poc[row[7]] = (poc[row[7]] || 0) + 1;
for (const m of Object.keys(poc)) {
  if (poc[m] < 2) { fail++; console.log('FAIL  motiv "' + m + '" jen na 1 radku — nema co stridat'); }
}

// 3) produkční cestou: nasimuluj "minule padl motiv X" a ověř, že týž motiv nepřijde
//    znovu, dokud má runa v aktuálním bucketu jiného kandidáta.
const bucket = vm.runInContext('_seasonBucket(new Date().getMonth() + 1)', S);
const motivRuny = [...new Set(IMGS.filter(r => r[7]).map(r => r[0]))];
let overeno = 0;
for (const jm of motivRuny) {
  const drawn = RUNES.find(r => r.n === jm);
  const cand = vm.runInContext('_runeImageCandidates', S)([drawn], bucket);
  const motivy = [...new Set(cand.filter(r => r[7]).map(r => r[7]))];
  for (const m of motivy) {
    if (!cand.some(r => (r[7] || '') !== m)) continue;   // bez alternativy guard pouští dál (správně)
    for (let i = 0; i < 6; i++) {
      for (const k of Object.keys(uloz)) delete uloz[k];
      uloz['seasonmotif_rune_' + jm] = m;
      vm.runInContext('_seasonalImagery("en", RUNES.find(r => r.n === ' + JSON.stringify(jm) + '))', S);
      const vybranyMotiv = uloz['seasonmotif_rune_' + jm];
      if (vybranyMotiv === m) {
        fail++; console.log('FAIL  ' + jm + ': motiv "' + m + '" prisel dvakrat po sobe (bucket ' + bucket + ')');
        break;
      }
      overeno++;
    }
  }
}

// 4) (2026-09-23, report #6 „dostal jsem uplne stejne cteni jako minule") NIKDY tentyz obraz hned
//    po sobe a RAVNOMERNOST. Dve vady, ktere tu drive nic nehlidalo: (a) na prechodu kol sacku
//    mohl posledni obraz stareho kola vyjit hned prvni v novem (u runy se 2 obrazy ~25 % ctení);
//    (b) motiv-guard zuzoval ulozeny sacek, takze obrazy se stejnym motivem padaly o polovinu mene.
//    Protlaceni realnou cestou pro KAZDOU runu s >= 2 kandidaty v aktualnim bucketu.
let tahu = 0;
for (const drawn of RUNES) {
  const cand = vm.runInContext('_runeImageCandidates', S)([drawn], bucket);
  if (cand.length < 2) continue;
  for (const k of Object.keys(uloz)) delete uloz[k];
  const pocet = {}; let pred = null;
  const N = cand.length * 60;
  for (let i = 0; i < N; i++) {
    vm.runInContext('_seasonalImagery("en", RUNES.find(r => r.n === ' + JSON.stringify(drawn.n) + '))', S);
    const id = uloz['seasonlast_rune_' + drawn.n];
    if (id === pred) { fail++; console.log('FAIL  ' + drawn.n + ': tentyz obraz dvakrat po sobe (' + id + ')'); break; }
    pred = id; pocet[id] = (pocet[id] || 0) + 1; tahu++;
  }
  const v = Object.values(pocet);
  if (v.length !== cand.length) { fail++; console.log('FAIL  ' + drawn.n + ': padlo ' + v.length + ' z ' + cand.length + ' obrazu'); }
  else if (Math.max(...v) / Math.min(...v) > 1.5) { fail++; console.log('FAIL  ' + drawn.n + ': nerovnomerne ' + Math.min(...v) + '/' + Math.max(...v)); }
}

if (!motivRuny.length) { fail++; console.log('FAIL  zadne motivove radky — guard nema co hlidat (cekan aspon 1)'); }
console.log(fail === 0
  ? 'OK    motivy obrazu: ' + Object.keys(poc).length + ' motivu / ' + motivRuny.length + ' run, ' + overeno + ' tahu bez dvojiteho motivu, ' + tahu + ' tahu bez stejneho obrazu po sobe (bucket ' + bucket + ')'
  : 'CELKEM ' + fail + ' problem(u)');
process.exit(fail === 0 ? 0 : 1);
