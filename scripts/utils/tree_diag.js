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
    if (p === 'fill') return () => { if (path.length) { path.col = t.fillStyle; fills.push(path); } path = []; };
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
function labRun(log, htmlPath, inj) {
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
  lsb.__INJ = inj || null;   /* posuvniky/zivotni runa ownera (bez toho se tise meri vychozi hodnoty — chyba do 2026-09-28) */
  lsb.requestAnimationFrame = () => 0; lsb.setTimeout = () => 0; lsb.alert = () => {}; lsb.confirm = () => false; lsb.navigator = {};
  vm.createContext(lsb);
  let code = 'var lang="en";\n';
  for (const f of ['runar-runes.js', 'tree-lab-trunk-composer/runar-trunk.js', 'tree-lab-branch-composer/runar-branch.js'])
    code += fs.readFileSync(DIR + f, 'utf8') + '\n;\n';
  if (inj && inj.__hookSrc) code += ';' + inj.__hookSrc + ';';   /* ladici hacek (jen diagnoza) */
  vm.runInContext(code + inline.replace('window._draw=draw;', 'window._draw=draw; window._P=_pick; if(window.__INJ){ Object.assign(crownT,__INJ.crownT||{}); Object.assign(trunkT,__INJ.trunkT||{}); Object.assign(rootsT,__INJ.rootsT||{}); if(__INJ.rune) state.rune=__INJ.rune; if(__INJ.dob){ state.d=__INJ.dob.d; state.m=__INJ.dob.m; state.y=__INJ.dob.y; } }'), lsb, { filename: 'lab' });
  const strip = s => String(s).replace(/<[^>]+>/g, ' ').replace(/&middot;/g, '·').replace(/&rarr;/g, '→').replace(/\s+/g, ' ').trim();
  if (lsb.__BB) console.log('BB', lsb.__BB.join(' || '));
  return { grow: strip(els.grow ? els.grow.innerHTML : ''), btable: strip(els.btable ? els.btable.innerHTML : ''),
           age: strip(els.ageread ? els.ageread.textContent : ''), fills: c.fills,
           picks: (lsb._P || []).filter(p => typeof p.k === 'number').map(p => p.meta), allPicks: (lsb._P || []) };
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

if (cast === 'own') {
  // Owneruv ulozeny strom (_tree_state.json, tlacitko ULOZIT -> Code): tentyz log I posuvniky.
  const st = JSON.parse(fs.readFileSync('C:/Users/zkuku/Downloads/Runar-admin/_tree_state.json', 'utf8'));
  const r = labRun(st.log, null, st);
  console.log(r.grow.slice(0, 160));
  console.log('HLAVNI VETVE (vystup z kmene):');
  r.picks.forEach(m => console.log('  ', (m.name + '').padEnd(8), (m.el + '').padEnd(6), 'vyska', m.frac != null ? Math.round(m.frac * 100) + ' %' : '?', '| pozice', m.norn || '-', '| odbocek', (m.tw || []).length, '| z toho vlastni pramen:', (m.tw || []).filter(t => t.pramen).map(t => t.name).join(',') || '-'));
  const other = r.allPicks.filter(p => typeof p.k !== 'number');
  const kinds = {}; other.forEach(p => { const t = String(p.k).replace(/[0-9_].*$/, '') || String(p.k); kinds[t] = (kinds[t] || 0) + 1; });
  console.log('ostatni klikatelne kusy podle druhu:', JSON.stringify(kinds));
  const gs = other.filter(p => p.meta && (p.meta.grad || /^g/.test(String(p.k))));
  gs.slice(0, 6).forEach(p => console.log('   graduant', p.k, JSON.stringify(p.meta).slice(0, 200)));
}
if (cast === 'own2') {
  const st = JSON.parse(fs.readFileSync('C:/Users/zkuku/Downloads/Runar-admin/_tree_state.json', 'utf8'));
  const r = labRun(st.log, null, st);
  const shown = new Set(); r.picks.forEach(m => { shown.add(m.name); (m.tw || []).forEach(t => shown.add(t.name)); });
  const drawn = {}; st.log.forEach((rd, i) => rd.runes.forEach(x => { const n = B.RUNES.filter(q => q.k === x.rune)[0].name;
    (drawn[x.el] = drawn[x.el] || {}); drawn[x.el][n] = drawn[x.el][n] || { n: 0, first: i + 1 }; drawn[x.el][n].n++; }));
  Object.keys(drawn).forEach(el => console.log(el.padEnd(6), Object.entries(drawn[el]).map(([n, v]) => n + ' ' + v.n + 'x (od #' + v.first + ')' + (shown.has(n) ? '' : ' ✗NEVIDITELNA')).join(' · ')));
  // kdy dostal ktery element vetev: prehraj log po jednom a sleduj pribyvajici hlavni vetve
  let prev = []; const ev = [];
  for (let n = 1; n <= st.log.length; n++) { const v = labRun(st.log.slice(0, n), null, st).picks.map(m => m.name + '/' + m.el);
    v.filter(x => !prev.includes(x)).forEach(x => ev.push('#' + n + ' ' + x)); prev = v; }
  console.log('nove hlavni vetve (cteni -> vetev):', ev.join(' | '));
}
if (cast === 'model') {
  // KONTROLA NOVEHO MODELU (2026-09-28) na ownerove ulozenem strome, s jeho posuvniky.
  // Kazde pravidlo = jedno overeni na VYSLEDKU (co se nakreslilo), ne na kodu.
  const HTML = process.argv[3] || null;
  const st = JSON.parse(fs.readFileSync('C:/Users/zkuku/Downloads/Runar-admin/_tree_state.json', 'utf8'));
  const log = st.log, r = labRun(log, HTML, st);
  const nm = k => B.RUNES.filter(q => q.k === k)[0].name;
  console.log(r.grow.slice(0, 110));
  const mains = r.picks, where = {};
  mains.forEach(m => { where[m.name] = (where[m.name] || []).concat(['PRAMEN ' + m.el]);
    (m.tw || []).forEach(t => { where[t.name] = (where[t.name] || []).concat(['vetev na ' + m.name]); }); });
  mains.forEach(m => console.log('  PRAMEN', (m.name + '').padEnd(8), (m.el + '').padEnd(6), 'vyska', Math.round(m.frac * 100) + '%', (m.norn ? '(' + m.norn + ')' : '').padEnd(11),
    '| vetve na nem:', (m.tw || []).map(t => t.name + ' ' + t.n + 'x' + (t.grad ? '*' : '')).join(', ') || '-'));
  const drawn = [...new Set(log.flatMap(rd => rd.runes.map(x => nm(x.rune))))];
  const perEl = {}; mains.forEach(m => perEl[m.el] = (perEl[m.el] || 0) + 1);
  const hs = mains.map(m => m.frac).sort((a, b) => a - b); let gap = 1; for (let i = 1; i < hs.length; i++) gap = Math.min(gap, hs[i] - hs[i - 1]);
  const els = [...new Set(log.flatMap(rd => rd.runes.map(x => x.el)))];
  console.log('P2/P3 kazda tazena runa videt:', drawn.filter(n => !where[n]).length ? 'NE — chybi ' + drawn.filter(n => !where[n]).join(',') : 'ANO (' + drawn.length + ' run)');
  console.log('b) kazda runa PRAVE JEDNOU:', drawn.filter(n => (where[n] || []).length > 1).length ? 'NE — ' + drawn.filter(n => (where[n] || []).length > 1).map(n => n + ' ' + where[n].join('+')).join(' | ') : 'ANO');
  console.log('P3 kazdy tazeny element ma pramen:', els.filter(e => !perEl[e]).length ? 'NE — ' + els.filter(e => !perEl[e]).join(',') : 'ANO (' + els.join(',') + ')');
  console.log('P4 pramenu na element:', JSON.stringify(perEl));
  console.log('P5 nejmensi rozestup vysek pramenu:', Math.round(gap * 1000) / 10 + ' % vysky kmene');
  const tw = r.allPicks.filter(p => String(p.k).startsWith('t')).length, runeTw = mains.reduce((a, m) => a + (m.tw || []).length, 0);
  console.log('P6 klikatelnych vetvi na vetvich:', tw, '| run na vetvich:', runeTw, '| nakreslenych tvaru celkem:', r.fills.length);
  let prev = [], ev = [];
  for (let n = 1; n <= log.length; n++) { const v = labRun(log.slice(0, n), HTML, st).picks.map(m => m.name + '/' + m.el);
    v.filter(x => !prev.includes(x)).forEach(x => ev.push('#' + n + ' ' + x)); prev = v; }
  console.log('P3 kdy vznikl pramen:', ev.join(' | '));
}
if (cast === 'model2') {
  // Utok na novy model: (1) prehrani po jednom cteni — nic uz vyrostleho se nesmi presunout
  // (runa nezmeni pramen, pramen nezmeni runu, nezmizi); (2) Norny se 2 runami jednoho elementu
  // (pravidlo a: vyvazene, kazda runa jednou); (3) 6 nahodnych stromu — pravidla 2-6 plati vzdy.
  const K = n => B.RUNES.filter(r => r.name === n)[0];
  const RB = B.RUNES.filter(r => r.k !== 'odinn');
  const mk = (sp, rs) => ({ spread: sp, runes: rs.map(r => ({ rune: r.k, el: r.el })), area: null, intention: null });
  const check = (log, lbl, replay) => {
    const bad = []; let prevHost = {};
    const steps = replay ? log.map((_, i) => i + 1) : [log.length];
    let last = null;
    for (const n of steps) {
      const r = labRun(log.slice(0, n)); last = r;
      const host = {}; r.picks.forEach((m, i) => { host[m.name] = 'P:' + i; (m.tw || []).forEach(t => { if (host[t.name]) bad.push('#' + n + ' ' + t.name + ' 2x'); host[t.name] = 'V:' + m.name; }); });
      Object.keys(prevHost).forEach(x => { if (host[x] !== prevHost[x]) bad.push('#' + n + ' ' + x + ' ' + prevHost[x] + ' -> ' + (host[x] || 'ZMIZELA')); });
      prevHost = host;
    }
    const drawn = new Set(log.flatMap(rd => rd.runes.map(x => B.RUNES.filter(q => q.k === x.rune)[0].name)));
    const miss = [...drawn].filter(x => !prevHost[x]);
    const hs = last.picks.map(m => m.frac).sort((a, b) => a - b); let gap = 1; for (let i = 1; i < hs.length; i++) gap = Math.min(gap, hs[i] - hs[i - 1]);
    const perEl = {}; last.picks.forEach(m => perEl[m.el] = (perEl[m.el] || 0) + 1);
    console.log(lbl.padEnd(34), '| pramenu', last.picks.length, JSON.stringify(perEl), '| chybi', miss.length, '| presunu/2x', bad.length, bad.slice(0, 3).join('; '), '| min rozestup', Math.round(gap * 1000) / 10 + '%');
    return last;
  };
  // (2) zakladaci Norny se 2 ohnivymi + dalsi ohen
  const f = [mk('norns', [K('Kenaz'), K('Fehu'), K('Laguz')]), mk('single', [K('Tiwaz')]), mk('single', [K('Sowilo')]), mk('single', [K('Dagaz')]), mk('single', [K('Thurisaz')]), mk('single', [K('Tiwaz')])];
  const r2 = check(f, 'Norny 2x ohen + 4 dalsi ohnive', true);
  r2.picks.forEach(m => console.log('     ', m.name, '->', (m.tw || []).map(t => t.name + ' ' + t.n + 'x').join(', ') || '-'));
  // (3) nahodne stromy
  let sd = 4242; const rnd = () => (sd = (sd * 1103515245 + 12345) >>> 0) / 4294967296;
  const draw = (n, sp) => { const pool = RB.slice(), rs = []; for (let i = 0; i < n; i++) rs.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]); return mk(sp, rs); };
  for (let t = 0; t < 6; t++) {
    const N = [15, 40, 80, 120, 40, 60][t]; const log = [draw(3, 'norns')];
    for (let i = 1; i < N; i++) { const x = rnd(); log.push(x < 0.7 ? draw(1, 'single') : x < 0.85 ? draw(3, 'norns') : x < 0.95 ? draw(5, 'compass') : draw(9, 'yggdrasil')); }
    check(log, 'nahodny strom ' + (t + 1) + ' (' + N + ' cteni' + (t < 2 ? ', po jednom' : '') + ')', t < 2);
  }
}
if (cast === 'jump') {
  // PRESKAKOVANI: prehraj ownerov strom po jednom cteni a zmer, o kolik se pohne to, co UZ
  // existovalo (spicka hlavni vetve a odbocek; klic = runa). Pohyb kvuli rustu je v poradku
  // jen maly a plynuly; skok = velky pohyb jednim ctenim. fit = auto-zmenseni obrazu.
  const st = JSON.parse(fs.readFileSync('C:/Users/zkuku/Downloads/Runar-admin/_tree_state.json', 'utf8'));
  const inj = Object.assign({}, st, { crownT: Object.assign({}, st.crownT, JSON.parse(process.argv[3] || '{}')) });
  const snap = n => { const r = labRun(st.log.slice(0, n), process.env.JH || null, inj); const o = {};
    r.allPicks.forEach(p => { if (!p.pts || !p.pts.length || String(p.k).startsWith('r')) return;
      const key = (typeof p.k === 'number' ? 'M:' : 'T:') + (p.meta && p.meta.name) + (typeof p.k === 'number' ? '' : '@' + String(p.k).split('_')[0]);
      const t = p.pts[p.pts.length - 1]; o[key] = t; });
    const fm = r.grow.match(/zmensen na (\d+) %/); return { o, fit: fm ? +fm[1] : 100 }; };
  let prev = snap(1), rows = [];
  for (let n = 2; n <= st.log.length; n++) {
    const cur = snap(n); let mx = 0, who = '', sum = 0, cnt = 0;
    Object.keys(prev.o).forEach(k => { if (!cur.o[k]) return; const d = Math.hypot(cur.o[k].x - prev.o[k].x, cur.o[k].y - prev.o[k].y);
      sum += d; cnt++; if (d > mx) { mx = d; who = k; } });
    const rd = st.log[n - 1];
    rows.push({ n, mx, who, avg: cnt ? sum / cnt : 0, fit: cur.fit, dfit: cur.fit - prev.fit, sp: rd.spread, ai: (rd.area || '-') + '/' + (rd.intention || '-') });
    prev = cur;
  }
  const big = rows.filter(r => r.mx > 12).sort((a, b) => b.mx - a.mx);
  console.log('kroku', rows.length, '| se skokem > 12 px:', big.length, '| prumerny posun existujicich spicek na cteni:', (rows.reduce((a, r) => a + r.avg, 0) / rows.length).toFixed(1), 'px');
  big.slice(0, 12).forEach(r => console.log('  #' + r.n, (r.sp + '').padEnd(9), r.ai.padEnd(22), 'max', r.mx.toFixed(0).padStart(3), 'px', r.who.padEnd(22), '| prumer', r.avg.toFixed(1), '| fit', r.fit + '%', r.dfit ? '(' + (r.dfit > 0 ? '+' : '') + r.dfit + ')' : ''));
  const fits = rows.filter(r => r.dfit !== 0).length; console.log('kroku, kdy se zmenilo auto-zmenseni celeho obrazu:', fits);
}
if (cast === 'injtest') {
  const st = JSON.parse(fs.readFileSync('C:/Users/zkuku/Downloads/Runar-admin/_tree_state.json', 'utf8'));
  for (const iz of [0, 0.12, 0.4]) { const inj = Object.assign({}, st, { crownT: Object.assign({}, st.crownT, { intZone: iz }) });
    const r = labRun(st.log, null, inj); console.log('intZone', iz, '->', r.picks.map(m => m.name + ' ' + Math.round(m.frac * 100) + '% int' + (m.intPart != null ? m.intPart.toFixed(3) : '?')).join(' | ')); }
}
if (cast === 'grow') {
  // RUSTOVY STROM (2026-09-28) na ownerove strome: kazde tazeni = vetev, max `twigMax` deti,
  // nova vetev mala, materska se jen prodluzuje (nikdy nezkrati).
  const HTML = process.argv[3] || null;
  const st = JSON.parse(fs.readFileSync('C:/Users/zkuku/Downloads/Runar-admin/_tree_state.json', 'utf8'));
  const inj = Object.assign({}, st, { crownT: Object.assign({}, st.crownT, { twigMax: 5, zrod: 0.3, dorust: 4 }) });
  const arc = pts => { let a = 0; for (let i = 1; i < pts.length; i++) a += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); return a; };
  const r = labRun(st.log, HTML, inj);
  const draws = st.log.reduce((a, rd) => a + rd.runes.length, 0);
  const mains = r.allPicks.filter(p => typeof p.k === 'number'), tws = r.allPicks.filter(p => String(p.k).startsWith('t'));
  let maxKids = 0; mains.forEach(m => maxKids = Math.max(maxKids, (m.meta.tw || []).length)); tws.forEach(t => maxKids = Math.max(maxKids, (t.meta.kids || []).length));
  console.log('tazeni', draws, '| vetvi celkem (prameny + vetve na vetvich)', mains.length + tws.length, '| nejvic deti na jedne vetvi', maxKids);
  // zrod a rust: prehrat po jednom, sledovat delku kazde vetve (klic = pick k)
  const len = {}, born = {}; let shrink = 0, shrinkMax = 0, newSizes = [];
  for (let n = 1; n <= st.log.length; n++) {
    const q = labRun(st.log.slice(0, n), HTML, inj);
    q.allPicks.forEach(p => { if (typeof p.k !== 'number' && !String(p.k).startsWith('t')) return;
      const key = String(p.k), L = arc(typeof p.k === 'number' ? p.pts.slice(-Math.max(2, Math.floor(p.pts.length / 2))) : p.pts);
      if (len[key] == null) { born[key] = n; if (n > 1) newSizes.push(L); }
      else if (L < len[key] - 1.5) { shrink++; shrinkMax = Math.max(shrinkMax, len[key] - L); }
      len[key] = L; });
  }
  newSizes.sort((a, b) => a - b); const med = newSizes[Math.floor(newSizes.length / 2)];
  const mature = Object.keys(len).filter(k => k.startsWith('t')).map(k => len[k]).sort((a, b) => a - b);
  console.log('nova vetev pri zrodu: median', med.toFixed(0), 'px | dospela vetev (median na konci)', mature[Math.floor(mature.length / 2)].toFixed(0), 'px | nejdelsi', mature[mature.length - 1].toFixed(0), 'px');
  console.log('zkraceni existujici vetve mezi dvema ctenimi:', shrink, 'x (nejvic o', shrinkMax.toFixed(1), 'px)');
}
if (cast === 'jump2') {
  // PRESKAKOVANI presneji: skok = OTOCENI existujici vetve nebo SKLOUZNUTI jejiho uchyceni.
  // Prodlouzeni (spicka jde dal ve svem smeru) je rust, ne skok. Vetev = odbocka (klic t...).
  const HTML = process.argv[3] || null;
  const st = JSON.parse(fs.readFileSync('C:/Users/zkuku/Downloads/Runar-admin/_tree_state.json', 'utf8'));
  const inj = Object.assign({}, st, { crownT: Object.assign({}, st.crownT, { twigMax: 5, zrod: 0.3, dorust: 4 }) });
  const snap = n => { const o = {}; labRun(st.log.slice(0, n), HTML, inj).allPicks.forEach(p => {
      if (!String(p.k).startsWith('t') || !p.pts || p.pts.length < 2) return;
      const a = p.pts[0], b = p.pts[p.pts.length - 1]; o[String(p.k)] = { x: a.x, y: a.y, ang: Math.atan2(b.y - a.y, b.x - a.x) }; }); return o; };
  let prev = snap(1), rot = 0, slide = 0, worstR = 0, worstS = 0;
  for (let n = 2; n <= st.log.length; n++) { const cur = snap(n); let r = 0, s = 0;
    let who = '', whoR = '';
    Object.keys(prev).forEach(k => { if (!cur[k]) return; let d = Math.abs(cur[k].ang - prev[k].ang); if (d > Math.PI) d = 2 * Math.PI - d;
      if (d * 180 / Math.PI > r) whoR = k; r = Math.max(r, d * 180 / Math.PI); const sl = Math.hypot(cur[k].x - prev[k].x, cur[k].y - prev[k].y); if (sl > s) { s = sl; who = k; } });
    if (r > 8) { rot++; if (process.env.RDET) { const rd = st.log[n - 1]; console.log('   ROT #' + n, rd.spread.padEnd(10), rd.runes.map(x => x.rune).join(','), '|', r.toFixed(0) + '°', whoR); } } if (s > 8) { slide++; if (process.env.JDET) { const rd = st.log[n - 1]; console.log('   #' + n, rd.spread.padEnd(10), 'runy', rd.runes.map(x => x.rune).join(','), '| sklouz', s.toFixed(0), 'px', who, '| otoc', r.toFixed(0) + '°'); } }
    worstR = Math.max(worstR, r); worstS = Math.max(worstS, s); prev = cur; }
  console.log('cteni', st.log.length, '| kroku s OTOCENIM vetve > 8°:', rot, '(nejvic', worstR.toFixed(0) + '°)', '| kroku se SKLOUZNUTIM uchyceni > 8 px:', slide, '(nejvic', worstS.toFixed(0), 'px)');
}
if (cast === 'sliders') {
  // AUDIT POSUVNIKU (2026-09-28, KUKY: "projdi posuvniky a odstran ty, co nic nedelaji"). Kazdy
  // posuvnik min -> max na ownerove strome; zmena = tvar (bunky mrizky 4 px) + barva (fillStyle).
  const st = JSON.parse(fs.readFileSync('C:/Users/zkuku/Downloads/Runar-admin/_tree_state.json', 'utf8'));
  const html = fs.readFileSync(DIR + 'tree-lab-crown-composer/crown-composer.html', 'utf8');
  const panels = []; const re = /makeTune\('([a-z-]+)',\s*\[([\s\S]*?)\]\s*,\s*(crownT|trunkT|rootsT)\)/g; let m;
  while ((m = re.exec(html))) { const arr = eval('[' + m[2] + ']'); arr.forEach(a => panels.push({ panel: m[1], obj: m[3], key: a[0], min: a[1], max: a[2], lbl: a[4] })); }
  const base = { crownT: Object.assign({}, st.crownT), trunkT: Object.assign({}, st.trunkT), rootsT: Object.assign({}, st.rootsT), rune: st.rune, dob: st.dob };
  delete base.crownT.twigMax;   // jeho ulozena 14 = stary vyznam; nech vychozi 5
  const sig = inj => { const r = labRun(st.log, null, inj); const cells = new Set(), cols = {};
    r.fills.forEach(f => { f.forEach(([x, y]) => cells.add((x >> 2) + ',' + (y >> 2))); cols[f.col] = (cols[f.col] || 0) + 1; }); return { cells, cols, n: r.fills.length }; };
  const out = [];
  for (const s0 of panels) {
    const a = JSON.parse(JSON.stringify(base)), b = JSON.parse(JSON.stringify(base));
    a[s0.obj][s0.key] = s0.min; b[s0.obj][s0.key] = s0.max;
    const A = sig(a), Bs = sig(b); let inter = 0; A.cells.forEach(c => { if (Bs.cells.has(c)) inter++; });
    const shape = 1 - inter / Math.max(1, A.cells.size + Bs.cells.size - inter);
    const keys = new Set([...Object.keys(A.cols), ...Object.keys(Bs.cols)]); let cd = 0, tot = 0;
    keys.forEach(k => { cd += Math.abs((A.cols[k] || 0) - (Bs.cols[k] || 0)); tot += (A.cols[k] || 0) + (Bs.cols[k] || 0); });
    out.push({ ...s0, shape, color: tot ? cd / tot : 0 });
  }
  out.forEach(o => console.log(o.panel.padEnd(16), o.key.padEnd(14), ('tvar ' + (o.shape * 100).toFixed(1) + '%').padEnd(11), ('barva ' + (o.color * 100).toFixed(1) + '%').padEnd(12), o.lbl));
}
if (cast === 'stage1') {
  // KROK 1 (2026-09-29): vetve z opakovani jako twigy. Na ownerove strome: pocet vetvi vs tazeni,
  // velikost a zakriveni (proti verzi a8fe597, ktera se mu libila), strana podle oblasti.
  const HTML = process.argv[3] || null;
  const st = JSON.parse(fs.readFileSync('C:/Users/zkuku/Downloads/Runar-admin/_tree_state.json', 'utf8'));
  const inj = Object.assign({}, st, { crownT: Object.assign({}, st.crownT, { twigMax: 5 }) });
  const arc = pts => { let a = 0; for (let i = 1; i < pts.length; i++) a += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); return a; };
  const r = labRun(st.log, HTML, inj);
  const draws = st.log.reduce((a, rd) => a + rd.runes.length, 0);
  const mains = r.allPicks.filter(p => typeof p.k === 'number'), tw = r.allPicks.filter(p => String(p.k).startsWith('t') && p.pts);
  const L = tw.map(p => arc(p.pts)).sort((a, b) => a - b), q = f => L.length ? L[Math.floor(f * (L.length - 1))].toFixed(0) : '-';
  const str = tw.map(p => { const a = p.pts[0], b = p.pts[p.pts.length - 1]; return Math.hypot(b.x - a.x, b.y - a.y) / Math.max(1e-6, arc(p.pts)); }).sort((a, b) => a - b);
  console.log('tazeni', draws, '| hlavnich', mains.length, '| vetvi na vetvich', tw.length, '| delka px: 10%', q(0.1), 'median', q(0.5), '90%', q(0.9), '| primost median', str.length ? str[Math.floor(str.length / 2)].toFixed(2) : '-', '| tvaru', r.fills.length);
  // strana: vetve z opakovani nesou oblast; smer spicky vs pata (na platne) — nitro ma jit doleva
  if (!HTML) {
    const cx = 280; let inL = 0, inR = 0, outL = 0, outR = 0;
    const byKey = {}; tw.forEach(p => byKey[String(p.k)] = p);
    // oblast neni v pick meta -> spocitej z logu: klic t<k>_<runa>_<born>_<ix>; born = index cteni
    tw.forEach(p => { const m = String(p.k).match(/^t\d+_([a-z]+)_(\d+)_(\d+)$/); if (!m) return;
      const rd = st.log[+m[2]]; if (!rd || !rd.area) return; const a = p.pts[0], b = p.pts[p.pts.length - 1], dx = b.x - a.x;
      const inner = ['healing', 'family', 'inner'].includes(rd.area), outer = ['purpose', 'career', 'spirituality'].includes(rd.area);
      if (inner) { dx < 0 ? inL++ : inR++; } if (outer) { dx < 0 ? outL++ : outR++; } });
    console.log('vetve z NITRA: doleva', inL, 'doprava', inR, '| vetve ze SVETA: doleva', outL, 'doprava', outR);
  }
}
if (cast === 'stage2') {
  // KROK 2 (2026-09-29): graduant = vlastni pramen + samostatna hlavni vetev. Na ownerove strome.
  const HTML = process.argv[3] || null;
  const st = JSON.parse(fs.readFileSync('C:/Users/zkuku/Downloads/Runar-admin/_tree_state.json', 'utf8'));
  const inj = Object.assign({}, st, { crownT: Object.assign({}, st.crownT, { twigMax: 5, maxMains: 10, gradStrand: 1 }) });
  const arc = pts => { let a = 0; for (let i = 1; i < pts.length; i++) a += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); return a; };
  const r = labRun(st.log, HTML, inj);
  const draws = st.log.reduce((a, rd) => a + rd.runes.length, 0);
  const mains = r.allPicks.filter(p => typeof p.k === 'number'), tw = r.allPicks.filter(p => String(p.k).startsWith('t') && p.pts);
  console.log(r.grow.slice(0, 70), '| tazeni', draws, '| hlavnich', mains.length, '| vetvi na vetvich', tw.length, '| celkem', mains.length + tw.length);
  mains.forEach(p => { const m = p.meta; const L = arc(p.pts.slice(-30));
    console.log('  ', (m.gradOf ? 'GRADUANT z ' + m.gradOf : 'pramen').padEnd(18), (m.name + '').padEnd(8), (m.el + '').padEnd(6), 'tazena', String(m.runeN).padStart(3) + 'x', '| delka vetve', L.toFixed(0).padStart(4), 'px | vetvi na ni', (m.tw || []).length); });
  const names = {}; mains.forEach(p => { names[p.meta.name] = (names[p.meta.name] || 0) + 1; });
  tw.forEach(p => { const m = String(p.k).match(/^t(\d+)_([a-z]+)$/); if (m) { const nm = B.RUNES.filter(q => q.k === m[2])[0].name; if (names[nm]) console.log('   ⚠ runa', nm, 'je hlavni vetev I twig na strand', m[1]); } });
}
if (cast === 'sides') {
  // LEVA/PRAVA (2026-09-29, KUKY: "aby videl: aha, proc je leva s vice vetvemi nez prava").
  // Hmota vetvi (delka) vlevo/vpravo od kmene vs. podil cteni o NITRU / SVETU. Ownerov strom +
  // 4 modelovi lide (Norny + 150 cteni): prevazne nitro · prevazne svet · vyvazeny · bez oblasti.
  const HTML = process.argv[3] || null;
  const st = JSON.parse(fs.readFileSync('C:/Users/zkuku/Downloads/Runar-admin/_tree_state.json', 'utf8'));
  const RB = B.RUNES.filter(r => r.k !== 'odinn');
  const INNER = ['healing', 'family', 'inner'], OUTER = ['purpose', 'career', 'spirituality'], MID = ['love', 'crossroads'];
  const arc = pts => { let a = 0; for (let i = 1; i < pts.length; i++) a += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); return a; };
  const synth = (seed, pIn, pOut, pMid) => { let s = seed; const rnd = () => (s = (s * 1103515245 + 12345) >>> 0) / 4294967296;
    const area = () => { const x = rnd(); if (x < pIn) return INNER[Math.floor(rnd() * 3)]; if (x < pIn + pOut) return OUTER[Math.floor(rnd() * 3)]; if (x < pIn + pOut + pMid) return MID[Math.floor(rnd() * 2)]; return null; };
    const pick = n => { const pool = RB.slice(), rs = []; for (let i = 0; i < n; i++) { const r = pool.splice(Math.floor(rnd() * pool.length), 1)[0]; rs.push({ rune: r.k, el: r.el }); } return rs; };
    const log = [{ spread: 'norns', runes: pick(3), area: area(), intention: null }];
    for (let i = 0; i < 150; i++) { const x = rnd(); log.push({ spread: x < 0.8 ? 'single' : 'compass', runes: pick(x < 0.8 ? 1 : 5), area: area(), intention: null }); }
    return log; };
  const measure = (lbl, log) => {
    const inj = Object.assign({}, st, { crownT: Object.assign({}, st.crownT, { twigMax: 5, maxMains: 10, gradStrand: 1 }) });
    const r = labRun(log, HTML, inj); const cx = 280; let mL = 0, mR = 0;
    r.allPicks.forEach(p => { if (!p.pts || p.pts.length < 2 || String(p.k).startsWith('r')) return; if (!(typeof p.k === 'number' || String(p.k).startsWith('t'))) return;
      const pts = typeof p.k === 'number' ? p.pts.slice(-30) : p.pts; const L = arc(pts); let sx = 0; pts.forEach(q => sx += q.x); sx /= pts.length;
      if (sx < cx) mL += L; else mR += L; });
    let nIn = 0, nOut = 0, nMid = 0, nNo = 0; log.forEach(rd => { const a = rd.area; const k = rd.runes.length;
      if (INNER.includes(a)) nIn += k; else if (OUTER.includes(a)) nOut += k; else if (MID.includes(a)) nMid += k; else nNo += k; });
    const tot = mL + mR;
    console.log(lbl.padEnd(22), '| tazeni nitro:svet:stred:bez', nIn + ':' + nOut + ':' + nMid + ':' + nNo, '| HMOTA vlevo', (100 * mL / tot).toFixed(0) + ' %', 'vpravo', (100 * mR / tot).toFixed(0) + ' %');
  };
  measure('KUKYho strom', st.log);
  measure('prevazne NITRO', synth(11, 0.7, 0.15, 0.15));
  measure('prevazne SVET', synth(11, 0.15, 0.7, 0.15));
  measure('vyvazeny', synth(11, 0.35, 0.35, 0.3));
  measure('bez oblasti', synth(11, 0, 0, 0));
}
if (cast === 'limbs') {
  // KTERA RAMENA ROZHODUJI O STRANE (2026-09-29): pro kazde rameno (hlavni vetev) jeho uhel od svislice,
  // cim byl urcen, a jeho vetve z cteni rozdelene podle oblasti (nitro/svet/stred/bez) + kam padla hmota.
  const HTML = process.argv[3] || null;
  const st = JSON.parse(fs.readFileSync('C:/Users/zkuku/Downloads/Runar-admin/_tree_state.json', 'utf8'));
  if (process.env.SYN) { const [sd, a, b, c] = process.env.SYN.split(',').map(Number); let s = sd; const rnd = () => (s = (s * 1103515245 + 12345) >>> 0) / 4294967296;
    const I = ['healing', 'family', 'inner'], O = ['purpose', 'career', 'spirituality'], M = ['love', 'crossroads'], RB = B.RUNES.filter(r => r.k !== 'odinn');
    const area = () => { const x = rnd(); if (x < a) return I[Math.floor(rnd() * 3)]; if (x < a + b) return O[Math.floor(rnd() * 3)]; if (x < a + b + c) return M[Math.floor(rnd() * 2)]; return null; };
    const pick = n => { const pool = RB.slice(), rs = []; for (let i = 0; i < n; i++) { const r = pool.splice(Math.floor(rnd() * pool.length), 1)[0]; rs.push({ rune: r.k, el: r.el }); } return rs; };
    const lg = [{ spread: 'norns', runes: pick(3), area: area(), intention: null }];
    for (let i = 0; i < 150; i++) { const x = rnd(); lg.push({ spread: x < 0.8 ? 'single' : 'compass', runes: pick(x < 0.8 ? 1 : 5), area: area(), intention: null }); }
    st.log = lg; }
  const log = st.log, INNER = ['healing', 'family', 'inner'], OUTER = ['purpose', 'career', 'spirituality'], MID = ['love', 'crossroads'];
  const cls = a => INNER.includes(a) ? 'N' : OUTER.includes(a) ? 'S' : MID.includes(a) ? 'M' : '-';
  const first = {}; log.forEach((rd, i) => rd.runes.forEach(r => { if (first[r.rune] == null) first[r.rune] = i; }));
  const inj = Object.assign({}, st, { crownT: Object.assign({}, st.crownT, { twigMax: 5, maxMains: 10, gradStrand: 1 }) });
  const r = labRun(log, HTML, inj), cx = 280;
  const arc = pts => { let a = 0; for (let i = 1; i < pts.length; i++) a += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); return a; };
  const per = {};
  r.allPicks.forEach(p => { const K = String(p.k); if (!K.startsWith('t') || !p.pts) return; const m = K.match(/^t(\d+)_([a-z_]+?)(?:_(\d+)_(\d+))?$/); if (!m) return;
    const k = +m[1], born = m[3] != null ? +m[3] : first[m[2]], a = cls((log[born] || {}).area);
    const o = per[k] || (per[k] = { N: 0, S: 0, M: 0, '-': 0, L: 0, R: 0 }); o[a]++;
    const L = arc(p.pts); let sx = 0; p.pts.forEach(q => sx += q.x); sx /= p.pts.length; if (sx < cx) o.L += L; else o.R += L; });
  r.allPicks.filter(p => typeof p.k === 'number').forEach(p => { const o = per[p.k] || (per[p.k] = { N: 0, S: 0, M: 0, '-': 0, L: 0, R: 0 });
    const pts = p.pts.slice(-30), L = arc(pts); let sx = 0; pts.forEach(q => sx += q.x); sx /= pts.length; if (sx < cx) o.L += L; else o.R += L; });
  let gL = 0, gR = 0; Object.keys(per).forEach(k => { gL += per[k].L; gR += per[k].R; });
  console.log('CELKEM hmota L:P', (100 * gL / (gL + gR)).toFixed(0) + ':' + (100 * gR / (gL + gR)).toFixed(0));
  r.allPicks.filter(p => typeof p.k === 'number').forEach(p => { const m = p.meta, o = per[p.k] || {};
    const deg = ((m.ang + Math.PI / 2) * 180 / Math.PI).toFixed(0), tot = (o.L || 0) + (o.R || 0);
    console.log(String(p.k).padStart(2), (m.name || '').padEnd(9), (m.el || '').padEnd(7), 'uhel', String(deg).padStart(4) + '°',
      m.norn ? ('Norny:' + m.norn).padEnd(16) : m.gradOf ? ('povys z ' + m.gradOf).padEnd(16) : 'zalozeno cteni'.padEnd(16),
      '| cteni N/S/M/-', [o.N, o.S, o.M, o['-']].join('/').padEnd(14), '| hmota', String(Math.round(tot)).padStart(5), 'px (' + (100 * tot / (gL + gR)).toFixed(0).padStart(2) + ' %) L:P', tot ? ((100 * o.L / tot).toFixed(0) + ':' + (100 * o.R / tot).toFixed(0)) : '-');
  });
}
if (cast === 'lreval') {
  // LEVA/PRAVA — ukazuje strom pomer nitro/svet? 24 modelovych lidi (podil nitra 10–90 %, 150 cteni),
  // idealni hmota vlevo = (nitro + pul stredu a bez oblasti) / vse. Vypise chybu proti idealu
  // a kolik ramen (krome vudciho) stoji skoro svisle (< 8° — riziko "chuchvalce nahoru").
  // Konfigurace: LRCFG='{"lrBirth":0,"areaSide":0.8}' (prepise crownT). HTML = argv[3].
  const HTML = process.argv[3] || null;
  const st = JSON.parse(fs.readFileSync('C:/Users/zkuku/Downloads/Runar-admin/_tree_state.json', 'utf8'));
  const over = process.env.LRCFG ? JSON.parse(process.env.LRCFG) : {};
  const RB = B.RUNES.filter(r => r.k !== 'odinn');
  const INNER = ['healing', 'family', 'inner'], OUTER = ['purpose', 'career', 'spirituality'], MID = ['love', 'crossroads'];
  const arc = pts => { let a = 0; for (let i = 1; i < pts.length; i++) a += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); return a; };
  const synth = (seed, pIn, pOut, pMid) => { let s = seed; const rnd = () => (s = (s * 1103515245 + 12345) >>> 0) / 4294967296;
    const area = () => { const x = rnd(); if (x < pIn) return INNER[Math.floor(rnd() * 3)]; if (x < pIn + pOut) return OUTER[Math.floor(rnd() * 3)]; if (x < pIn + pOut + pMid) return MID[Math.floor(rnd() * 2)]; return null; };
    const pick = n => { const pool = RB.slice(), rs = []; for (let i = 0; i < n; i++) { const r = pool.splice(Math.floor(rnd() * pool.length), 1)[0]; rs.push({ rune: r.k, el: r.el }); } return rs; };
    const log = [{ spread: 'norns', runes: pick(3), area: area(), intention: null }];
    for (let i = 0; i < 150; i++) { const x = rnd(); log.push({ spread: x < 0.8 ? 'single' : 'compass', runes: pick(x < 0.8 ? 1 : 5), area: area(), intention: null }); }
    return log; };
  const one = log => {
    const inj = Object.assign({}, st, { crownT: Object.assign({}, st.crownT, { twigMax: 5, maxMains: 10, gradStrand: 1 }, over) });
    const r = labRun(log, HTML, inj); const cx = 280; let mL = 0, mR = 0, vert = 0;
    r.allPicks.forEach(p => { if (!p.pts || p.pts.length < 2 || String(p.k).startsWith('r')) return; if (!(typeof p.k === 'number' || String(p.k).startsWith('t'))) return;
      const pts = typeof p.k === 'number' ? p.pts.slice(-30) : p.pts; const L = arc(pts); let sx = 0; pts.forEach(q => sx += q.x); sx /= pts.length;
      if (sx < cx) mL += L; else mR += L;
      if (typeof p.k === 'number' && p.k > 0 && Math.abs((p.meta.ang + Math.PI / 2) * 180 / Math.PI) < 8) { vert++;
        if (process.env.VDET) { const m = p.meta; console.log('   svisle:', m.name, 'k' + p.k, m.gradOf ? 'graduant z ' + m.gradOf : 'rameno', '| kostra', ((m.eAng + Math.PI / 2) * 180 / Math.PI).toFixed(0) + '°', '| ted', ((m.ang + Math.PI / 2) * 180 / Math.PI).toFixed(0) + '°', '| strana', m.lrS0, '->', m.lrS, '| b', m.bal ? m.bal.b.toFixed(2) : '-', '| cteni', m.bal ? m.bal.n : '-'); } } });
    let nIn = 0, nOut = 0, nOth = 0; log.forEach(rd => { const k = rd.runes.length; if (INNER.includes(rd.area)) nIn += k; else if (OUTER.includes(rd.area)) nOut += k; else nOth += k; });
    return { L: mL / (mL + mR), ideal: (nIn + nOth / 2) / (nIn + nOut + nOth), vert };
  };
  const rows = [];
  for (let u = 0; u < 24; u++) { const pIn = 0.1 + 0.8 * ((u * 0.618034) % 1), pMid = 0.2, pOut = 0.8 - pIn; const q = one(synth(101 + u * 7, pIn * 0.9, pOut * 0.9, pMid)); rows.push(q); }
  const K = one(st.log);
  const err = rows.map(q => q.L - q.ideal), rms = Math.sqrt(err.reduce((a, e) => a + e * e, 0) / err.length), mx = Math.max(...err.map(Math.abs));
  const mean = a => a.reduce((x, y) => x + y, 0) / a.length, mi = mean(rows.map(q => q.ideal)), mL = mean(rows.map(q => q.L));
  const cov = mean(rows.map(q => (q.ideal - mi) * (q.L - mL))), vI = mean(rows.map(q => (q.ideal - mi) ** 2)), vL = mean(rows.map(q => (q.L - mL) ** 2));
  const bal = rows.filter(q => Math.abs(q.ideal - 0.5) < 0.1);
  console.log((process.env.LRCFG || '{}').padEnd(40), '| chyba RMS', (100 * rms).toFixed(1) + ' b.', 'max', (100 * mx).toFixed(0), '| sklon', (cov / vI).toFixed(2), 'r', (cov / Math.sqrt(vI * vL)).toFixed(2),
    '| vyvazeni (n=' + bal.length + ') chyba max', (100 * Math.max(...bal.map(q => Math.abs(q.L - q.ideal)))).toFixed(0),
    '| svisla ramena', rows.reduce((a, q) => a + q.vert, 0), '| KUKY', (100 * K.L).toFixed(0) + ' % (ideal ' + (100 * K.ideal).toFixed(0) + ')', 'svisla', K.vert);
}
if (cast === 'limbjump') {
  // Kde se RAMENO otoci o vic nez 5° mezi dvema ctenimi (a proc: rovnovaha b pred/po, pocet cteni).
  const HTML = process.argv[3] || null;
  const st = JSON.parse(fs.readFileSync('C:/Users/zkuku/Downloads/Runar-admin/_tree_state.json', 'utf8'));
  const over = process.env.LRCFG ? JSON.parse(process.env.LRCFG) : {};
  const inj = Object.assign({}, st, { crownT: Object.assign({}, st.crownT, { twigMax: 5, zrod: 0.3, dorust: 4 }, over) });
  const snap = n => { const o = {}; labRun(st.log.slice(0, n), HTML, inj).allPicks.forEach(p => { if (typeof p.k !== 'number') return;
    o[p.meta.name] = { a: (p.meta.ang + Math.PI / 2) * 180 / Math.PI, b: p.meta.bal ? p.meta.bal.b : null, n: p.meta.bal ? p.meta.bal.n : null, grad: p.meta.gradOf || '' }; }); return o; };
  let prev = snap(1), cnt = 0;
  for (let n = 2; n <= st.log.length; n++) { const cur = snap(n);
    Object.keys(cur).forEach(k => { if (!prev[k]) return; const d = cur[k].a - prev[k].a; if (Math.abs(d) > 5) { cnt++;
      console.log('#' + n, k.padEnd(9), cur[k].grad ? ('(povys z ' + cur[k].grad + ')') : '', prev[k].a.toFixed(0) + '° -> ' + cur[k].a.toFixed(0) + '°', '| b', prev[k].b == null ? '-' : prev[k].b.toFixed(2), '->', cur[k].b == null ? '-' : cur[k].b.toFixed(2), '| cteni', prev[k].n, '->', cur[k].n); } });
    prev = cur; }
  console.log('otoceni ramene > 5°:', cnt);
}
if (cast === 'at') {
  // Jeden beh labu na prvnich N ctenich KUKYho stromu (N z env NS="56,57"); ladici vypisy __BB z HTML kopie.
  const HTML = process.argv[3] || null;
  const st = JSON.parse(fs.readFileSync('C:/Users/zkuku/Downloads/Runar-admin/_tree_state.json', 'utf8'));
  const inj = Object.assign({}, st, { crownT: Object.assign({}, st.crownT, { twigMax: 5, zrod: 0.3, dorust: 4 }) });
  (process.env.NS || '56,57').split(',').map(Number).forEach(n => { console.log('--- N=' + n); labRun(st.log.slice(0, n), HTML, inj); });
}
if (cast === 'scen') {
  // JAK SE MUZE STROM VYVIJET (2026-09-30, KUKY: "chtelo by to znat pravdepodobnost, jak se muze strom
  // vyvijet podle moznosti, co muzou nastat"). 6 typu lidi x 20 nahodnych lidi, strom po 10/50/150/300
  // cteni: kolik hmoty lezi vlevo (nitro) a kolik ramen se preklopilo. Zapise scratch JSON (argv[4]).
  const HTML = process.argv[3] && process.argv[3] !== '-' ? process.argv[3] : null, OUT = process.argv[4] || null;
  const st = JSON.parse(fs.readFileSync('C:/Users/zkuku/Downloads/Runar-admin/_tree_state.json', 'utf8'));
  const SC = [
    { id: 'vyvazeny', nm: 'vyvážený (35 % nitro · 35 % svět · 30 % střed)', a: [0.35, 0.35, 0.30] },
    { id: 'mirne_nitro', nm: 'mírně nitro (50 · 30 · 20)', a: [0.50, 0.30, 0.20] },
    { id: 'nitro', nm: 'převážně nitro (70 · 15 · 15)', a: [0.70, 0.15, 0.15] },
    { id: 'svet', nm: 'převážně svět (15 · 70 · 15)', a: [0.15, 0.70, 0.15] },
    { id: 'zmena', nm: 'změna: první polovina nitro, druhá svět', a: [0.70, 0.15, 0.15], b: [0.15, 0.70, 0.15] },
    { id: 'bez', nm: 'bez oblasti (nikdy nevyplní)', a: [0, 0, 0] } ];
  const NS = [10, 50, 150, 300], NSEED = +(process.env.NSEED || 20);
  const RB = B.RUNES.filter(r => r.k !== 'odinn'), I = ['healing', 'family', 'inner'], O = ['purpose', 'career', 'spirituality'], M = ['love', 'crossroads'];
  const gen = (seed, sc, N) => { let s = seed; const rnd = () => (s = (s * 1103515245 + 12345) >>> 0) / 4294967296;
    const mix = i => (sc.b && i >= N / 2) ? sc.b : sc.a;
    const area = i => { const [pI, pO, pM] = mix(i), x = rnd(); if (x < pI) return I[Math.floor(rnd() * 3)]; if (x < pI + pO) return O[Math.floor(rnd() * 3)]; if (x < pI + pO + pM) return M[Math.floor(rnd() * 2)]; return null; };
    const pick = n => { const pool = RB.slice(), rs = []; for (let i = 0; i < n; i++) { const r = pool.splice(Math.floor(rnd() * pool.length), 1)[0]; rs.push({ rune: r.k, el: r.el }); } return rs; };
    const log = [{ spread: 'norns', runes: pick(3), area: area(0), intention: null }];
    for (let i = 1; i < N; i++) { const x = rnd(); log.push({ spread: x < 0.8 ? 'single' : 'compass', runes: pick(x < 0.8 ? 1 : 5), area: area(i), intention: null }); }
    return log; };
  const arc = pts => { let a = 0; for (let i = 1; i < pts.length; i++) a += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); return a; };
  const inj = Object.assign({}, st, { crownT: Object.assign({}, st.crownT, { twigMax: 5, maxMains: 10, gradStrand: 1 }, process.env.LRCFG ? JSON.parse(process.env.LRCFG) : {}) });
  if (process.env.RUNE) inj.rune = process.env.RUNE;
  const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
  let curInj = inj;
  const measure = log => { const r = labRun(log, HTML, curInj); let mL = 0, mR = 0, flipped = 0, sw = 0, limbs = 0;
    r.allPicks.forEach(p => { if (!p.pts || p.pts.length < 2 || String(p.k).startsWith('r')) return; if (!(typeof p.k === 'number' || String(p.k).startsWith('t'))) return;
      const pts = typeof p.k === 'number' ? p.pts.slice(-30) : p.pts, L = arc(pts); let sx = 0; pts.forEach(q => sx += q.x); sx /= pts.length; if (sx < 280) mL += L; else mR += L;
      if (typeof p.k === 'number') { limbs++; if (p.meta.lrS0 && p.meta.lrS !== p.meta.lrS0) flipped++; sw += p.meta.lrSw || 0; } });
    return { L: mL / Math.max(1, mL + mR), flipped, sw, limbs }; };
  const q = (a, f) => { const b = a.slice().sort((x, y) => x - y); return b[Math.min(b.length - 1, Math.max(0, Math.round(f * (b.length - 1))))]; };
  const res = [];
  SC.forEach((sc, si) => { if (ONLY && !ONLY.includes(sc.id)) return; const rows = [];
    for (let k = 0; k < NSEED; k++) { const seed = 1000 + k * 17 + si * 101, log = gen(seed, sc, 300), row = { seed };
      /* DOBRAND: kazdy modelovy clovek jine datum narozeni (tvar vetvi se seje z data -> jinak vsichni sdileji KUKYho) */
      curInj = process.env.DOBRAND ? Object.assign({}, inj, { dob: { d: 1 + (seed * 7) % 28, m: 1 + (seed * 5) % 12, y: 1950 + (seed * 3) % 55 } }) : inj;
      NS.forEach(N => { row[N] = measure(log.slice(0, N)); }); rows.push(row); }
    const out = { id: sc.id, nm: sc.nm, def: sc, by: {} };
    NS.forEach(N => { const Ls = rows.map(r => r[N].L); out.by[N] = { med: q(Ls, 0.5), p10: q(Ls, 0.1), p90: q(Ls, 0.9),
      left: Ls.filter(x => x >= 0.65).length / Ls.length, right: Ls.filter(x => x <= 0.35).length / Ls.length,
      flipped: rows.reduce((a, r) => a + r[N].flipped, 0) / rows.length, sw: rows.reduce((a, r) => a + r[N].sw, 0) / rows.length, limbs: rows.reduce((a, r) => a + r[N].limbs, 0) / rows.length }; });
    const at300 = rows.map(r => ({ seed: r.seed, L: r[300].L })).sort((a, b) => a.L - b.L), med = out.by[300].med;
    out.typical = at300.slice().sort((a, b) => Math.abs(a.L - med) - Math.abs(b.L - med))[0];
    out.spread = [0.05, 0.35, 0.65, 0.95].map(f => at300[Math.round(f * (at300.length - 1))]);
    out.cells = { typical: NS.map(N => ({ N, L: rows.find(r => r.seed === out.typical.seed)[N].L })) };
    res.push(out);
    const pc = x => (100 * x).toFixed(0).padStart(3);
    console.log('\n' + sc.nm);
    NS.forEach(N => { const b = out.by[N]; console.log('  po', String(N).padStart(3), 'cteni | hmota vlevo median', pc(b.med), '%  (8 z 10 lidi mezi', pc(b.p10).trim() + '–' + pc(b.p90).trim(), '%) | jasne vlevo', pc(b.left), '% | jasne vpravo', pc(b.right), '% | ramen', b.limbs.toFixed(1), '| preklopenych', b.flipped.toFixed(1), '| preklopeni celkem', b.sw.toFixed(1)); });
  });
  if (OUT) fs.writeFileSync(OUT, JSON.stringify(res, null, 1));
}
if (cast === 'biasdig') {
  // ODKUD JE VYCHYLKA VPRAVO u lidi bez oblasti (2026-09-30): hmota rozdelena podle strany KOSTRY ramene
  // (vlevo / vudci / vpravo) a podle toho, kde skutecne lezi (x < 280 / x >= 280). 20 lidi, 300 cteni.
  const HTML = process.argv[3] && process.argv[3] !== '-' ? process.argv[3] : null;
  const st = JSON.parse(fs.readFileSync('C:/Users/zkuku/Downloads/Runar-admin/_tree_state.json', 'utf8'));
  const inj = Object.assign({}, st, { crownT: Object.assign({}, st.crownT, { twigMax: 5, maxMains: 10, gradStrand: 1 }) });
  const RB = B.RUNES.filter(r => r.k !== 'odinn');
  const arc = pts => { let a = 0; for (let i = 1; i < pts.length; i++) a += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); return a; };
  const tot = {};
  const add = (k, v) => { tot[k] = (tot[k] || 0) + v; };
  for (let u = 0; u < 20; u++) { let s = 1000 + u * 17 + 5 * 101; const rnd = () => (s = (s * 1103515245 + 12345) >>> 0) / 4294967296;
    const pick = n => { const pool = RB.slice(), rs = []; for (let i = 0; i < n; i++) { const r = pool.splice(Math.floor(rnd() * pool.length), 1)[0]; rs.push({ rune: r.k, el: r.el }); } return rs; };
    rnd(); const log = [{ spread: 'norns', runes: pick(3), area: null, intention: null }];
    for (let i = 1; i < 300; i++) { rnd(); const x = rnd(); log.push({ spread: x < 0.8 ? 'single' : 'compass', runes: pick(x < 0.8 ? 1 : 5), area: null, intention: null }); }
    const r = labRun(log, HTML, inj), side = {};
    r.allPicks.forEach(p => { if (typeof p.k === 'number') side[p.k] = p.meta.lrS0 === 0 || p.k === 0 ? 'V' : (p.meta.lrS0 < 0 ? 'L' : 'P'); });
    r.allPicks.forEach(p => { if (!p.pts || p.pts.length < 2) return; const K = String(p.k); let k;
      if (typeof p.k === 'number') k = p.k; else if (K.startsWith('t')) k = +K.slice(1).split('_')[0]; else return;
      const pts = typeof p.k === 'number' ? p.pts.slice(-30) : p.pts, L = arc(pts); let sx = 0; pts.forEach(q => sx += q.x); sx /= pts.length;
      add((side[k] || '?') + (typeof p.k === 'number' ? '-rameno' : '-vetvicky') + (sx < 280 ? ' lezi VLEVO' : ' lezi VPRAVO'), L); }); }
  const all = Object.values(tot).reduce((a, b) => a + b, 0);
  Object.keys(tot).sort().forEach(k => console.log(k.padEnd(32), (100 * tot[k] / all).toFixed(1).padStart(5), '%'));
}
if (cast === 'leader') {
  // Vudci vetev u lidi bez oblasti: smer, cast "zivotni runa", natoceni, kde lezi spicka vuci zakladu.
  const HTML = process.argv[3] && process.argv[3] !== '-' ? process.argv[3] : null;
  const st = JSON.parse(fs.readFileSync('C:/Users/zkuku/Downloads/Runar-admin/_tree_state.json', 'utf8'));
  const inj = Object.assign({}, st, { crownT: Object.assign({}, st.crownT, { twigMax: 5, maxMains: 10, gradStrand: 1 }) });
  if (process.env.RUNE) inj.rune = process.env.RUNE;
  const RB = B.RUNES.filter(r => r.k !== 'odinn');
  for (let u = 0; u < 8; u++) { let s = 1000 + u * 17 + 5 * 101; const rnd = () => (s = (s * 1103515245 + 12345) >>> 0) / 4294967296;
    const pick = n => { const pool = RB.slice(), rs = []; for (let i = 0; i < n; i++) { const r = pool.splice(Math.floor(rnd() * pool.length), 1)[0]; rs.push({ rune: r.k, el: r.el }); } return rs; };
    rnd(); const log = [{ spread: 'norns', runes: pick(3), area: null, intention: null }];
    for (let i = 1; i < 300; i++) { rnd(); const x = rnd(); log.push({ spread: x < 0.8 ? 'single' : 'compass', runes: pick(x < 0.8 ? 1 : 5), area: null, intention: null }); }
    const r = labRun(log, HTML, inj), p = r.allPicks.find(q => q.k === 0), m = p.meta, pts = p.pts.slice(-30);
    const d = v => (v * 180 / Math.PI).toFixed(1);
    console.log(m.name.padEnd(8), 'smer', d(m.ang + Math.PI / 2), '| zivotni runa', d(m.leanPart), '| natoceni', d(m.areaPart), '| koruna: zaklad x', pts[0].x.toFixed(0), 'spicka x', pts[pts.length - 1].x.toFixed(0), '| max vychyleni', (Math.max(...pts.map(q => q.x)) - 280).toFixed(0), (Math.min(...pts.map(q => q.x)) - 280).toFixed(0)); }
}
