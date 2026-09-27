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
if (cast === '2') {
  // CAST 2 — ZAKLADACI NORNY. Co z Noren v aplikaci vyroste a na cem to zavisi?
  const dob = { d: 14, m: 6, y: 1988 }, life = 'uruz';
  const G = n => (RUNES.filter(r => r.n === n)[0]).g;
  const elOf = g => { const r = RUNES.filter(x => x.g === g)[0]; return ((r.elements || ['Earth'])[0]).toLowerCase(); };
  const rd = (spread, names) => ({ spread, runes: names.map(n => ({ rune: G(n), el: elOf(G(n)) })), area: null, intention: null });
  function run(log) {
    const c = recCanvas(); const pick = P.render(c.canvas, { log, rune: life, dob });
    const below = c.fills.filter(f => f.some(([x, y]) => y > GROUND + 2));
    return { vetve: (pick.pick || []).map(p => p.meta.name + '/' + p.meta.el), fills: c.fills,
             sigKoruna: JSON.stringify(c.fills.filter(f => f.every(([x, y]) => y <= GROUND))).length,
             sigKoreny: JSON.stringify(below), korenu: below.length };
  }
  console.log('elementy run v aplikaci:', ['Kenaz','Isa','Laguz','Fehu','Sowilo','Thurisaz'].map(n => n + '=' + elOf(G(n))).join(' '));
  const a = run([rd('norns', ['Kenaz', 'Isa', 'Laguz'])]);
  console.log('A) Norny Kenaz·Isa·Laguz  -> hlavnich vetvi:', a.vetve.length, a.vetve.join(', '), '| tvaru pod zemi:', a.korenu);
  const b = run([rd('norns', ['Laguz', 'Kenaz', 'Isa'])]);
  console.log('B) tytez runy, jine POZICE (urd/verdandi/skuld) -> stejny obrazek?', a.sigKoruna === b.sigKoruna && a.sigKoreny === b.sigKoreny ? 'ANO (pozice se nepouziva)' : 'ne');
  const c = run([rd('single', ['Kenaz']), rd('single', ['Isa']), rd('single', ['Laguz'])]);
  console.log('C) Norny vs 3 samostatne single -> vetve', c.vetve.join(', '), '| koruna stejna?', a.sigKoruna === c.sigKoruna ? 'ANO' : 'NE (lisi se)', '| koreny stejne?', a.sigKoreny === c.sigKoreny ? 'ANO' : 'NE');
  const d = run([rd('norns', ['Fehu', 'Kenaz', 'Sowilo'])]);
  console.log('D) Norny se 3 runami JEDNOHO elementu -> hlavnich vetvi:', d.vetve.length, d.vetve.join(', '));
  const e = run([rd('norns', ['Thurisaz', 'Isa', 'Laguz'])]);
  console.log('E) jina runa (Kenaz -> Thurisaz), koreny se zmenily?', a.sigKoreny === e.sigKoreny ? 'NE (koreny nezavisi na runach pramene)' : 'ano');
  // Kolik cteni do 4. / 5. hlavni vetve (vse single, ruzne elementy)?
  const seq = ['Fehu','Uruz','Ansuz','Kenaz','Gebo','Wunjo','Hagalaz','Nauthiz','Isa','Jera','Eihwaz','Perth','Algiz','Sowilo','Tiwaz','Berkana','Ehwaz','Mannaz','Laguz','Ingwaz','Othila','Dagaz'];
  let log = [rd('norns', ['Kenaz', 'Isa', 'Laguz'])], last = 3, out = [];
  for (let i = 0; i < 80; i++) { log = log.concat([rd('single', [seq[i % seq.length]])]);
    const n = run(log).vetve.length; if (n !== last) { out.push((log.length) + '. cteni -> ' + n + ' vetvi'); last = n; } }
  console.log('F) pribyvani hlavnich vetvi (Norny + ruzne single):', out.join(' | ') || 'zadna zmena');
  const runes = new Set(); log.forEach(r => r.runes.forEach(x => runes.add(x.rune)));
  console.log('   po', log.length, 'ctenich: ruznych run tazeno', runes.size, ', vetvi', last);
}
if (cast === '2b') {
  // Utok na nalez D: je to jen pripad "3 runy jednoho elementu", nebo bezna vec?
  const dob = { d: 14, m: 6, y: 1988 }, life = 'uruz';
  const elOf = g => { const r = RUNES.filter(x => x.g === g)[0]; return ((r.elements || ['Earth'])[0]).toLowerCase(); };
  const R24 = RUNES.filter(r => r.n !== 'Blank');
  const vetve = log => (P.render(recCanvas().canvas, { log, rune: life, dob }).pick || []).map(p => p.meta.name);
  const nr = names => ({ spread: 'norns', runes: names.map(n => { const g = R24.filter(r => r.n === n)[0].g; return { rune: g, el: elOf(g) }; }), area: null, intention: null });
  console.log('Kenaz·Fehu·Laguz (2 ohne):', vetve([nr(['Kenaz', 'Fehu', 'Laguz'])]).join(', '));
  // Vsechny mozne Norny (3 ruzne runy ze 24, poradi na vysledek nema vliv pro tuhle otazku)
  let tot = 0, dup = 0, missing = 0;
  for (let a = 0; a < 24; a++) for (let b = a + 1; b < 24; b++) for (let c = b + 1; c < 24; c++) {
    const names = [R24[a].n, R24[b].n, R24[c].n]; const v = vetve([nr(names)]); tot++;
    if (new Set(v).size < v.length) dup++;
    if (names.some(n => !v.includes(n))) missing++;
  }
  console.log('vsech kombinaci Noren:', tot, '| s ZDVOJENOU vetvi:', dup, '(' + (dup / tot * 100).toFixed(0) + ' %)', '| kde nejaka tazena runa CHYBI:', missing, '(' + (missing / tot * 100).toFixed(0) + ' %)');
}
if (cast === '2c') {
  // Utok na opravu "zadne zdvojeni": dlouha nahodna historie (Norny + mix single/spready),
  // v kazdem kroku: je nekde zdvojena vetev? kolik vetvi? Deterministicky los (seed).
  const dob = { d: 14, m: 6, y: 1988 }, life = 'uruz';
  const R24 = RUNES.filter(r => r.n !== 'Blank');
  const elOf = g => { const r = RUNES.filter(x => x.g === g)[0]; return ((r.elements || ['Earth'])[0]).toLowerCase(); };
  let s = 12345; const rnd = () => (s = (s * 1103515245 + 12345) >>> 0) / 4294967296;
  const draw = (n, spread) => { const pool = R24.slice(), runes = [];
    for (let i = 0; i < n; i++) { const r = pool.splice(Math.floor(rnd() * pool.length), 1)[0]; runes.push({ rune: r.g, el: elOf(r.g) }); }
    return { spread, runes, area: null, intention: null }; };
  let log = [draw(3, 'norns')], dupSteps = 0, maxV = 0, sameRune = 0;
  for (let i = 0; i < 150; i++) {
    const x = rnd(); log = log.concat([x < 0.7 ? draw(1, 'single') : x < 0.85 ? draw(3, 'norns') : x < 0.95 ? draw(5, 'kriz') : draw(9, 'yggdrasil')]);
    const v = (P.render(recCanvas().canvas, { log, rune: life, dob }).pick || []).map(p => p.meta.name + '#' + p.meta.ord);
    if (new Set(v).size < v.length) dupSteps++; maxV = Math.max(maxV, v.length);
    const nm = v.map(x => x.split('#')[0]); if (new Set(nm).size < nm.length) sameRune++;
  }
  console.log('151 cteni nahodne: kroku se zdvojenou vetvi (stejna runa i poradi):', dupSteps, '| max vetvi:', maxV, '| kroku, kde TAZ RUNA nese 2 vetve (jine poradi v elementu):', sameRune);
}

// ── LAB: protlaci SKUTECNOU stranku labu (v2/tree-lab-crown-composer/crown-composer.html,
//    vygenerovanou z build_crown_composer.py) s danym logem. DOM je obecny stub; zapisy do
//    prvku se pamatuji (btable = prehled vetvi, grow = cisla rustu), kresba jako u aplikace.
function labRun(log, htmlPath) {
  const html = fs.readFileSync(htmlPath || (DIR + 'tree-lab-crown-composer/crown-composer.html'), 'utf8');
  const inline = html.slice(html.indexOf('<script>', html.indexOf('runar-branch.js')) + 8, html.lastIndexOf('</script>'));
  const els = {}, c = recCanvas(), store = { crownLog: JSON.stringify(log) };
  const mk = id => els[id] || (els[id] = new Proxy({ id, style: {}, dataset: {}, classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } },
      innerHTML: '', textContent: '', value: '', children: [], checked: false }, {
      get(t, p) { if (p in t) return t[p];
        if (p === 'getBoundingClientRect') return () => ({ left: 0, top: 0, width: 560, height: 900 });
        if (p === 'querySelectorAll') return () => []; if (p === 'querySelector') return () => null;
        if (p === 'getContext') return (k) => k === '2d' ? c.canvas.getContext() : null;
        return () => {}; }, set(t, p, v) { t[p] = v; return true; } }));
  const lsb = { Math, JSON, console, Date, parseInt, parseFloat, isNaN, Uint8ClampedArray, devicePixelRatio: 1 };
  lsb.window = lsb; lsb.globalThis = lsb; lsb.self = lsb;
  lsb.document = { getElementById: mk, createElement: () => { const e = mk('__el' + Object.keys(els).length); return e; },
                   querySelector: () => null, querySelectorAll: () => [], addEventListener(){}, body: mk('body') };
  lsb.localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = v; }, removeItem: k => { delete store[k]; } };
  lsb.addEventListener = () => {}; lsb.getComputedStyle = () => ({ position: 'relative' });
  lsb.requestAnimationFrame = () => 0; lsb.setTimeout = () => 0; lsb.alert = () => {}; lsb.confirm = () => false; lsb.navigator = {};
  vm.createContext(lsb);
  let code = 'var lang="en";\n';
  for (const f of ['runar-runes.js', 'tree-lab-trunk-composer/runar-trunk.js', 'tree-lab-branch-composer/runar-branch.js'])
    code += fs.readFileSync(DIR + f, 'utf8') + '\n;\n';
  vm.runInContext(code + inline.replace('window._draw=draw;', 'window._draw=draw; window._P=_pick;'), lsb, { filename: 'lab' });
  const strip = s => String(s).replace(/<[^>]+>/g, ' ').replace(/&middot;/g, '·').replace(/&rarr;/g, '→').replace(/\s+/g, ' ').trim();
  return { grow: strip(els.grow ? els.grow.innerHTML : ''), btable: strip(els.btable ? els.btable.innerHTML : ''),
           age: strip(els.ageread ? els.ageread.textContent : ''), fills: c.fills,
           picks: (lsb._P || []).filter(p => typeof p.k === 'number').map(p => p.meta) };
}
if (cast === 'lab2') {
  // CAST 2 v LABU: zakladaci Norny (lab log = klice run, ne znaky)
  const K = n => B.RUNES.filter(r => r.name === n)[0];
  const rd = (spread, names) => ({ spread, runes: names.map(n => ({ rune: K(n).k, el: K(n).el })), area: null, intention: null });
  for (const [lbl, log] of [['0 cteni (seminko)', []], ['Norny Kenaz·Fehu·Laguz', [rd('norns', ['Kenaz', 'Fehu', 'Laguz'])]],
                            ['Norny Kenaz·Isa·Laguz', [rd('norns', ['Kenaz', 'Isa', 'Laguz'])]]]) {
    const r = labRun(log);
    console.log('LAB', lbl.padEnd(24), '|', r.age, '|', r.grow.slice(0, 90));
    console.log('     vetve:', r.btable.slice(0, 260));
  }
}

if (cast === 'lab2b') {
  // Utok na labovou zmenu: (1) vysky podle pozic Noren, (2) seminko ma koreny,
  // (3) stare stromy (prvni cteni NENI Norny) — co presne se zmenilo proti puvodnimu labu.
  const BEFORE = process.argv[3];
  const K = n => B.RUNES.filter(r => r.name === n)[0];
  const rd = (spread, names) => ({ spread, runes: names.map(n => ({ rune: K(n).k, el: K(n).el })), area: null, intention: null });
  const a = labRun([rd('norns', ['Kenaz', 'Fehu', 'Laguz'])]);
  console.log('(1) Norny urd=Kenaz verdandi=Fehu skuld=Laguz:');
  a.picks.forEach(m => console.log('    ', (m.name + '').padEnd(7), 'pozice', (m.norn + '').padEnd(8), 'vyska na kmeni', Math.round(m.frac * 100) + ' %', '| odbocek', (m.tw || []).length));
  const s0 = labRun([]); const below = s0.fills.filter(f => f.some(([x, y]) => y > GROUND + 2)).length;
  console.log('(2) seminko: tvaru pod zemi', below, '| nad zemi', s0.fills.length - below);
  let sd = 777; const rnd = () => (sd = (sd * 1103515245 + 12345) >>> 0) / 4294967296;
  const RB = B.RUNES.filter(r => r.k !== 'odinn');
  const draw = (n, sp) => { const pool = RB.slice(), rs = [];
    for (let i = 0; i < n; i++) { const r = pool.splice(Math.floor(rnd() * pool.length), 1)[0]; rs.push({ rune: r.k, el: r.el }); }
    return { spread: sp, runes: rs, area: null, intention: null }; };
  let log = []; for (let i = 0; i < 120; i++) log.push(rnd() < 0.75 ? draw(1, 'single') : draw(3, 'norns'));
  log[0] = draw(1, 'single');   // prvni cteni NENI Norny -> zakladaci pravidlo se neuplatni
  const o = labRun(log, BEFORE), n = labRun(log);
  const desc = m => m.name + ':' + (m.tw || []).map(t => t.name).join(',');
  const mainsO = new Set(o.picks.map(m => m.name));
  let same = 0, diffs = [];
  o.picks.forEach((m, i) => { const q = n.picks[i]; if (q && desc(m) === desc(q)) same++; else diffs.push([m, q]); });
  console.log('(3) stary strom 120 cteni: vetvi pred/po', o.picks.length, '/', n.picks.length, '| beze zmeny', same);
  diffs.forEach(([m, q]) => { const lost = (m.tw || []).map(t => t.name).filter(x => !(q.tw || []).map(t => t.name).includes(x));
    console.log('     ', m.name, '— zmizele odbocky:', lost.join(',') || '-', '| byly to hlavni runy jinych vetvi?', lost.every(x => mainsO.has(x)) ? 'ANO (zamer)' : 'NE — CHYBA'); });
}
