// DIAGNOZA STROMU PO CASTECH (CODE-tree, 2026-09-26). KUKY: "zkontrolovat, jestli pri vsech
// tech zmenach strom roste, jak je zapsane... po castech!!!" Protlaci PRODUKCNI render
// (runar-tree-prod.js + oba enginy) a meri, co se skutecne nakreslilo — ne tvar kodu (§19).
// Casti: 1 = seminko ze zivotni runy (1b = kmen vs vek primo z enginu, 1c = Sowilo).
// Dalsi casti (Norny, single, spready, element, oblast, zamer, rust, koreny) se pridavaji sem.
// Postup a vysledky vlastni RUNAR_BACKLOG.md (Tree sekce) + RUNAR_TREE.md, ne tenhle soubor.
// Pouziti: node tree_diag.js <cast>
const fs = require('fs'), vm = require('vm');
const DIR = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const sb = { Math, JSON, console, devicePixelRatio: 1 };
sb.window = sb; sb.globalThis = sb; sb.self = sb;
vm.createContext(sb);
let code = 'var lang="en";\n';
for (const f of ['runar-runes.js', 'tree-lab-trunk-composer/runar-trunk.js',
                 'tree-lab-branch-composer/runar-branch.js', 'runar-tree-prod.js'])
  code += '\n' + fs.readFileSync(DIR + f, 'utf8') + '\n;\n';
vm.runInContext(code, sb, { filename: 'tree-diag' });
const B = sb.RunarBranch, P = sb.RunarTreeProd, RUNES = vm.runInContext('RUNES', sb);
const calcLifeRune = vm.runInContext('calcLifeRune', sb);
const GROUND = 660;

// Platno, ktere si pamatuje kazdy vyplneny tvar.
function recCanvas() {
  const fills = []; let path = [];
  const ctx = new Proxy({}, { get(t, p) {
    if (p === 'beginPath') return () => { path = []; };
    if (p === 'moveTo' || p === 'lineTo') return (x, y) => { path.push([x, y]); };
    if (p === 'fill') return () => { if (path.length) fills.push(path); path = []; };
    if (typeof p === 'string' && /^[a-z]/.test(p) && !['fillStyle','strokeStyle','lineWidth','globalAlpha'].includes(p))
      return () => {};
    return t[p];
  }, set(t, p, v) { t[p] = v; return true; } });
  return { canvas: { width: 0, height: 0, getContext: () => ctx }, fills };
}
function measure(opts) {
  const c = recCanvas(); P.render(c.canvas, opts);
  let top = 1e9, bot = -1e9, n = 0;
  const band = (y0, y1) => { let a = 1e9, b = -1e9;
    c.fills.forEach(f => f.forEach(([x, y]) => { if (y >= y0 && y <= y1) { a = Math.min(a, x); b = Math.max(b, x); } }));
    return b > a ? +(b - a).toFixed(1) : 0; };
  c.fills.forEach(f => f.forEach(([x, y]) => { n++; top = Math.min(top, y); bot = Math.max(bot, y); }));
  return { vyska: +(GROUND - top).toFixed(1), hloubkaKorenu: +(bot - GROUND).toFixed(1),
           sirkaKmeneUZeme: band(GROUND - 40, GROUND - 20), sirkaKorenu: band(GROUND + 10, GROUND + 200),
           tvaru: c.fills.length, bodu: n, sig: JSON.stringify(c.fills).length };
}
const keyOf = g => { const r = B.RUNES.filter(x => x.g === g)[0]; return r ? r.k : null; };

const cast = process.argv[2] || '1';
if (cast === '1') {
  // A) Kazda zivotni runa, kterou muze calcLifeRune vratit, musi mit tvar v rendereru
  //    (jinak runar-tree.js tise spadne na 'berkano').
  const seen = {};
  for (let y = 1940; y <= 2010; y++) for (let m = 1; m <= 12; m++) for (let d = 1; d <= 28; d++) {
    const r = calcLifeRune(d, m, y); if (r) seen[r.n] = r.g;
  }
  const names = Object.keys(seen);
  const miss = names.filter(n => !keyOf(seen[n]));
  console.log('A) zivotnich run, ktere calcLifeRune vraci:', names.length, '| bez tvaru v rendereru:', miss.length ? miss : 'zadna');
  // B) Semeno: 0 cteni. Pro nekolik zivotnich run — co se lisi a je to stabilni?
  const dob = { d: 14, m: 6, y: 1988 };
  console.log('B) SEMENO (0 cteni), stejne datum, ruzne zivotni runy:');
  for (const n of ['Fehu', 'Uruz', 'Isa', 'Laguz', 'Dagaz']) {
    const g = (RUNES.filter(r => r.n === n)[0] || {}).g, k = keyOf(g);
    const a = measure({ log: [], rune: k, dob }), b = measure({ log: [], rune: k, dob });
    console.log('  ', n.padEnd(6), JSON.stringify(a), a.sig === b.sig ? 'STABILNI' : 'NESTABILNI');
  }
  // C) Semeno -> prvni cteni (Norny) -> dalsi single. Roste strom, nebo se zmensi?
  const kFehu = keyOf((RUNES.filter(r => r.n === 'Fehu')[0]).g);
  const G = n => (RUNES.filter(r => r.n === n)[0]).g;
  const norns = { spread: 'norns', runes: [G('Kenaz'), G('Isa'), G('Laguz')].map(g => ({ rune: g, el: 'x' })), area: null, intention: null };
  // element bere routing z el — vyplnime spravne pres RUNES
  const elOf = g => ((RUNES.filter(r => r.g === g)[0].elements || ['Earth'])[0]).toLowerCase();
  norns.runes.forEach(r => r.el = elOf(r.rune));
  const single = n => ({ spread: 'single', runes: [{ rune: G(n), el: elOf(G(n)) }], area: null, intention: null });
  const seq = ['Fehu', 'Uruz', 'Ansuz', 'Kenaz', 'Gebo', 'Wunjo', 'Jera', 'Sowilo', 'Tiwaz', 'Berkana', 'Laguz', 'Dagaz'];
  console.log('C) SEMENO -> NORNY -> single (zivotni runa Fehu):');
  let log = [];
  const row = (lbl) => { const m = measure({ log, rune: kFehu, dob });
    console.log('  ', lbl.padEnd(22), 'vyska', m.vyska, '| kmen u zeme', m.sirkaKmeneUZeme, '| koreny do hloubky', m.hloubkaKorenu, '| tvaru', m.tvaru); };
  row('0 cteni (semeno)');
  log = [norns]; row('1: Norny');
  for (let i = 0; i < 25; i++) { log = log.concat([single(seq[i % seq.length])]);
    if ([1, 2, 4, 7, 8, 12, 24].includes(i + 1)) row((i + 2) + ': +single'); }
}
if (cast === '1b') {
  // Nulova transformace: kmen primo z enginu, lisi se JEN vek. Semeno pouziva vek 25,
  // prvni cteni vek 1*3 = 3. Tloustne kmen s vekem, nebo je to jen sum mereni?
  const Tk = sb.RunarTrunk, dob = { d: 14, m: 6, y: 1988 };
  for (const k of ['uruz', 'laguz', 'dagaz']) {
    const out = [];
    for (const age of [3, 6, 12, 25, 36, 75]) {
      const T = { lean:1, wobble:1, wobFreq:1.0, thickness:8, bundleSpread:0.22, contour:0.6, twist:0.4,
        baseFlare:0.55, protrude:0.5, rootFan:-1, rootLen:150, treeAge:age, strandEvery:80,
        matureDays:365, minSize:0.2, treeHeightMax:370, w:460, cx:280, groundY:660, topY:560 };
      const gt = Tk.buildTrunk({ rune: k, dob }, T);
      let w = 0; gt.limbs.forEach(L => L.pts.forEach(p => { if (p.y > 610 && p.y < 650) w = Math.max(w, p.w); }));
      out.push('vek ' + age + ' -> ' + w.toFixed(2));
    }
    console.log(k.padEnd(6), out.join(' | '));
  }
}
if (cast === '1c') {
  // Po oprave: Sowilo jako zivotni runa ma vlastni kmen, ne Berkanin? A ctene Sowilo najde tvar?
  const dob = { d: 14, m: 6, y: 1988 };
  const gS = (RUNES.filter(r => r.n === 'Sowilo')[0]).g, gB = (RUNES.filter(r => r.n === 'Berkana')[0]).g;
  console.log('klic pro Sowilo z aplikacniho znaku:', keyOf(gS), '| Berkana:', keyOf(gB));
  const s = measure({ log: [], rune: keyOf(gS) || 'berkano', dob }), b = measure({ log: [], rune: 'berkano', dob });
  console.log('seminko Sowilo vs Berkana: kmen', s.sirkaKmeneUZeme, 'vs', b.sirkaKmeneUZeme, '|', s.sig === b.sig ? 'STEJNY OBRAZEK (spatne)' : 'ruzne (dobre)');
}
