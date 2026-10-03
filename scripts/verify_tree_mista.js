// ㉳ KAZDA VETEV Z JINEHO MISTA + NIC NEKLIKATELNEHO (lab stromu, CODE-tree 2026-10-03).
//
// Guard proti 2026-10-03. KUKY: "proc dve vetve vyrustaji presne z jednoho mista? … nechci, aby vyrustaly dve nebo vice
// vetvi ze stejneho mista — tohle resim od samoho zacatku!" a o hodinu driv: "vidim to, ale kliknout na to nejde? …
// na strome nema byt nic, co sam uzivatel nevytvoril". Obe pravidla hlidal mesice jen owner okem. Zmereno pred opravou
// (vychozi posuvniky labu): vystupy ramen z kmene 6–10 px od sebe, 19 dvojic pod 10 px; 25 pramenu v kmeni a 44 + 11
// neklikatelnych tahu. Kontrola na VYSLEDKU (nakreslene body), ne na tvaru kodu.
//
// Protlaci lab (build_crown_composer.py -> crown-composer.html, vychozi posuvniky) dvema pevnymi logy a v nekolika
// okamzicich rustu overi:
//   (a) vystupy ramen z kmene jsou od sebe aspon MIN_EXIT px,
//   (b) vetve na tomtez rodici (vetvicky i povysene) zacinaji aspon MIN_SIB px od sebe,
//   (c) kazdy nakresleny tah patri klikatelne casti stromu,
//   (d) v kmeni je nejvys 15 pramenu (14 mist element × zona, vzacne 15. pri trech zakladacich runach stinu).
//
//   node scripts/verify_tree_mista.js            (TREE_LAB_HTML=<cesta> = jina kopie labu, napr. pro mutacni test)
const path = require('path'), cp = require('child_process'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const MIN_EXIT = 10, MIN_SIB = 4, MAX_STRANDS = 15;
let html = process.env.TREE_LAB_HTML || null;
if (!html) {   // lab neni v gitu (generuje ho builder) -> postavit cerstvy
  const r = cp.spawnSync('python', ['-X', 'utf8', path.join(ROOT, 'build_crown_composer.py')], { encoding: 'utf8' });
  if (r.status !== 0) { console.log('❌ build_crown_composer.py spadl: ' + (r.stderr || r.stdout).slice(-300)); process.exit(1); }
}
const { labRun } = require('./utils/tree_diag.js');
const B = labRun.branch;
const RB = B.RUNES.filter(r => r.k !== 'odinn'), AI = ['healing', 'family', 'inner'], AM = ['love', 'crossroads'], AO = ['purpose', 'career', 'spirituality'];
const gen = (seed, sc, N) => { let s = seed; const rnd = () => (s = (s * 1103515245 + 12345) >>> 0) / 4294967296;
  const pick3 = (p, a, b, c) => { const x = rnd(); return x < p[0] ? a() : (x < p[0] + p[1] ? b() : c()); };
  const one = arr => () => arr[Math.floor(rnd() * arr.length)];
  const intn = () => pick3(sc, () => 'past', () => 'present', () => 'decision');
  const area = () => pick3(sc, one(AI), one(AM), one(AO));
  const seek = () => pick3(sc, one(['insight', 'reflection']), one(['clarity', 'confirmation']), () => 'general');
  const pick = n => { const pool = RB.slice(), rs = []; for (let i = 0; i < n; i++) { const r = pool.splice(Math.floor(rnd() * pool.length), 1)[0]; rs.push({ rune: r.k, el: r.el }); } return rs; };
  const log = [{ spread: 'norns', runes: pick(3), area: area(), intention: intn(), seeking: seek() }];
  for (let i = 1; i < N; i++) { const x = rnd(); log.push({ spread: x < 0.8 ? 'single' : 'compass', runes: pick(x < 0.8 ? 1 : 5), area: area(), intention: intn(), seeking: seek() }); }
  return log; };
const LOGS = [['vsude', gen(3933, [1 / 3, 1 / 3, 1 / 3], 300)], ['minulost', gen(3000, [0.6, 0.2, 0.2], 300)]];
const NS = [20, 60, 150, 300];
const fails = []; let worstE = 1e9, worstS = 1e9, maxStr = 0, runs = 0;
LOGS.forEach(([nm, log]) => NS.forEach(n => {
  const r = labRun(log.slice(0, n), html, null); runs++;
  const mains = r.picks.filter(m => !m.gradOf && m.exitX != null);
  if (mains.length < 3) fails.push(nm + ' po ' + n + ': chybi souradnice vystupu ramen (exitX) — inspekce se zmenila?');
  for (let a = 0; a < mains.length; a++) for (let b = a + 1; b < mains.length; b++) {
    const d = Math.hypot(mains[a].exitX - mains[b].exitX, mains[a].exitY - mains[b].exitY); worstE = Math.min(worstE, d);
    if (d < MIN_EXIT) fails.push(nm + ' po ' + n + ': ramena ' + mains[a].name + ' a ' + mains[b].name + ' vychazeji ' + d.toFixed(1) + ' px od sebe (min ' + MIN_EXIT + ')'); }
  const byP = {};
  r.allPicks.forEach(p => { const m = p.meta || {}; let pk = null, pt = null;
    if (m.parentKey != null && p.pts && p.pts.length) { pk = String(m.parentKey); pt = p.pts[0]; }
    else if (typeof p.k === 'number' && m.gradOf && m.splitX != null) { pk = String(m.gradOfK); pt = { x: m.splitX, y: m.splitY }; }
    if (pk != null) (byP[pk] = byP[pk] || []).push({ x: pt.x, y: pt.y, nm: m.name }); });
  Object.keys(byP).forEach(k => { const L = byP[k]; for (let a = 0; a < L.length; a++) for (let b = a + 1; b < L.length; b++) {
    const d = Math.hypot(L[a].x - L[b].x, L[a].y - L[b].y); worstS = Math.min(worstS, d);
    if (d < MIN_SIB) fails.push(nm + ' po ' + n + ': na rodici ' + k + ' vetve ' + L[a].nm + ' a ' + L[b].nm + ' zacinaji ' + d.toFixed(1) + ' px od sebe (min ' + MIN_SIB + ')'); } });
  const drawn = r.sb._DA ? r.sb._DA() : null, picked = new Set(r.allPicks.map(p => p.pts));
  if (!drawn) fails.push('lab neda seznam nakreslenych tahu (_DA) — kontrola klikatelnosti nebezi');
  else { const bad = drawn.filter(L => !picked.has(L.pts)); if (bad.length) fails.push(nm + ' po ' + n + ': ' + bad.length + ' nakreslenych tahu nejde kliknout (' + [...new Set(bad.map(L => L.src || '?'))].join(', ') + ')'); }
  const sm = /prameny (\d+)/.exec(r.grow), sn = sm ? +sm[1] : null; if (sn != null) maxStr = Math.max(maxStr, sn);
  if (sn == null) fails.push(nm + ' po ' + n + ': pocet pramenu v kmeni nejde precist');
  else if (sn > MAX_STRANDS) fails.push(nm + ' po ' + n + ': ' + sn + ' pramenu v kmeni (max ' + MAX_STRANDS + ' — povysene vetve nemaji vlastni pramen)');
}));
if (fails.length) { fails.slice(0, 12).forEach(f => console.log('   ' + f)); console.log('strom: ' + fails.length + ' poruseni (vetve ze stejneho mista / neklikatelne / prameny navic)'); process.exit(1); }
console.log('strom (lab): ' + runs + ' stromu — vystupy ramen aspon ' + worstE.toFixed(0) + ' px od sebe, vetve na rodici aspon ' + worstS.toFixed(1) + ' px, vse klikatelne, nejvys ' + maxStr + ' pramenu v kmeni');
