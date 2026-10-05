// PRECTI STROM Z DAT (CODE-tree 2026-10-05). KUKY: "vsechno, co na strome udelame, musi jit popsat a melo by to jit popsat
// z dat" + "precti mi, jak ten strom vypada, jestli ma nejak strana vic vetvi a proc, jak vypada jeho spicka a proc".
// Vezme KUKYho ulozeny strom (_tree_state.json: log, zivotni runa, jeho posuvniky; viewN = prehravani) a vypise: celek, strany
// (ramena, povysene, vetvicky, cteni na nich), kazde rameno zdola nahoru (vyska, strana kresby / kostra pri zrodu, oblasti a zony
// jeho cteni, uhel, tiha, delka, povysene), povysene vetve, spicku (vudci vetev + horni ramena) a zalozeni (prvni Norny).
// Popis z toho pise clovek — nastroj dava jen fakta, ze kterych se ten popis da obhajit.
//   node scripts/utils/tree_read.js [cesta-k-labu.html]
const fs = require('fs');
const { labRun } = require('./tree_diag.js');
const st = JSON.parse(fs.readFileSync('C:/Users/zkuku/Downloads/Runar-admin/_tree_state.json', 'utf8'));
const HTML = process.argv[2] && process.argv[2] !== '-' ? process.argv[2] : null;
const r = labRun(st.viewN != null ? st.log.slice(0, st.viewN) : st.log, HTML, st), G = 660;
const deg = a => Math.round((a + Math.PI / 2) * 57.3);
const sideTxt = s => s > 0 ? 'P' : (s < 0 ? 'L' : '-');
const drawn = m => (m.idx === 0) ? 0 : (Math.cos(m.ang) >= 0 ? 1 : -1);
const tw = m => (m.tw || []).length;
const M = r.picks.filter(m => !m.gradOf && m.exitX != null).sort((a, b) => a.frac - b.frac);
const Gr = r.picks.filter(m => m.gradOf);
const L = M.find(m => m.idx === 0);
let x0 = 1e9, x1 = -1e9, y0 = 1e9; r.fills.forEach(f => f.forEach(([x, y]) => { if (y < G - 2) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); } }));
const Ht = L ? (G - L.exitY) / 0.98 : NaN, cx = 280;
console.log('CELEK: cteni', st.log.length, '| ramen na kmeni', M.length, '(vc. vudci) | povysenych', Gr.length, '| vetvicek', M.reduce((a, m) => a + tw(m), 0) + Gr.reduce((a, m) => a + tw(m), 0),
  '| kmen', Math.round(Ht), 'px | strom vysoky', Math.round(G - y0), '| koruna', Math.round(x0 - cx), '..', Math.round(x1 - cx), 'od osy | vyska/sirka', ((G - y0) / (x1 - x0)).toFixed(2));
// strany
const S = { '-1': { n: 0, g: 0, tw: 0, rd: 0, names: [] }, '1': { n: 0, g: 0, tw: 0, rd: 0, names: [] } };
M.forEach(m => { const s = drawn(m); if (!s) return; S[s].n++; S[s].tw += tw(m); S[s].rd += m.ownN || 0; S[s].names.push(m.name); });
Gr.forEach(g => { const s = drawn(g); S[s].g++; S[s].tw += tw(g); S[s].rd += g.ownN || 0; });
['-1', '1'].forEach(s => console.log('STRANA', s === '-1' ? 'LEVA (nitro)' : 'PRAVA (svet)', '| ramen', S[s].n, '| povysenych', S[s].g, '| vetvicek', S[s].tw, '| cteni na nich', S[s].rd, '|', S[s].names.join(', ')));
// sirka koruny po stranach
console.log('KORUNA dosah: vlevo', Math.round(cx - x0), 'px, vpravo', Math.round(x1 - cx), 'px');
console.log('RAMENA zdola nahoru (vyska, strana kresby / kostra pri zrodu, oblasti jeho cteni nitro/svet/stred/bez, zona cteni dole/stred/nahore, cteni na nem, runa celkem, uhel od svislice, tiha, delka, vetvicek, povysene):');
M.forEach(m => { const c = (m.bal && m.bal.c) || {}, z = (m.zst && m.zst.c) || {};
  const flip = (m.lrS0 && m.lrS !== m.lrS0) ? ' PREKLOPENO' : '';
  console.log('  ' + (m.frac * 100).toFixed(0).padStart(3) + '%', (m.name + ' ' + (m.g || '')).padEnd(11), m.el.padEnd(6), 'strana', sideTxt(drawn(m)) + '/' + sideTxt(m.lrS0) + flip,
    '| obl n' + (c.nitro || 0) + ' s' + (c.svet || 0) + ' st' + (c.stred || 0) + ' -' + (c.bez || 0), '| zona d' + (z.dole || 0) + ' s' + (z.stred || 0) + ' n' + (z.nahore || 0), '(' + (m.zoneS || '') + ')',
    '| cteni', m.ownN, '| runa', m.runeTot, '| uhel', deg(m.ang) + '°', '| tiha', (m.bendZ || 0).toFixed(2), '| delka', (m.lenF || 0).toFixed(2), '| vetv.', tw(m),
    '| povys.', Gr.filter(g => g.gradOfK === m.idx).map(g => g.name).join('+') || '-'); });
console.log('POVYSENE:'); Gr.forEach(g => console.log('  ', (g.name + ' ' + (g.g || '')).padEnd(11), 'z', g.gradOf.padEnd(8), 'odstep na', ((g.splitU || 0) * 100).toFixed(0) + '% matky', '| strana', sideTxt(drawn(g)), '| uhel', deg(g.ang) + '°', '| cteni', g.ownN, '| vetv.', tw(g)));
// spicka
console.log('SPICKA: vudci', L ? (L.name + ' ' + L.el + ' zona ' + L.zoneS + ' | cteni ' + L.ownN + ' | runa celkem ' + L.runeTot + ' | vetvicek ' + tw(L) + ' | povysene ' + (Gr.filter(g => g.gradOfK === 0).map(g => g.name).join('+') || '-') + ' | delka ' + (L.lenF || 0).toFixed(2)) : '?');
const top = M.filter(m => m.idx !== 0).slice(-4).reverse();
console.log('  nejvyssi ramena:', top.map(m => m.name + ' ' + (m.frac * 100).toFixed(0) + '% ' + sideTxt(drawn(m)) + ' ' + deg(m.ang) + '° ' + m.zoneS).join(' | '));
// zalozeni (Norny)
const fi = st.log.findIndex(x => x.spread === 'norns' && (x.runes || []).length === 3);
console.log('ZALOZENI: prvni Norny #' + (fi + 1), (st.log[fi].runes || []).map(x => x.rune).join(', '), '| oblast', st.log[fi].area, '| zamer', st.log[fi].intention);
