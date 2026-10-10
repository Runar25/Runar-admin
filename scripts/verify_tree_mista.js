// ㉳ KAZDA VETEV Z JINEHO MISTA + NIC NEKLIKATELNEHO (lab stromu, CODE-tree 2026-10-03).
//
// Guard proti 2026-10-03. KUKY: "proc dve vetve vyrustaji presne z jednoho mista? … nechci, aby vyrustaly dve nebo vice
// vetvi ze stejneho mista — tohle resim od samoho zacatku!" a o hodinu driv: "vidim to, ale kliknout na to nejde? …
// na strome nema byt nic, co sam uzivatel nevytvoril". Obe pravidla hlidal mesice jen owner okem. Zmereno pred opravou
// (vychozi posuvniky labu): vystupy ramen z kmene 6–10 px od sebe, 19 dvojic pod 10 px; 25 pramenu v kmeni a 44 + 11
// neklikatelnych tahu. Kontrola na VYSLEDKU (nakreslene body), ne na tvaru kodu.
//
// Protlaci lab (build_crown_composer.py -> crown-composer.html, vychozi posuvniky) tremi pevnymi logy a v nekolika
// okamzicich rustu overi:
//   (a) vystupy ramen z kmene jsou od sebe aspon MIN_EXIT px, kdyz miri na STEJNOU stranu, a aspon MIN_EXIT_LR px mezi
//       levym a pravym ramenem (a od vudci vetve) — KUKY 2026-10-03 "30px min.", pak obrazek 4: 30 px vsude nechalo na
//       mladem kmeni jen 8 ramen a strom vypadal jako koste; leve a prave se stridaji v polovine,
//   (b) vetve na tomtez rodici (vetvicky i povysene) zacinaji aspon MIN_SIB px od sebe,
//   (c) kazdy nakresleny tah patri klikatelne casti stromu,
//   (d) v kmeni je nejvys 15 pramenu (14 mist element × zona, vzacne 15. pri trech zakladacich runach stinu).
//   (e) INSPEKCE odpovida logu (2026-10-03, KUKY: "proc se informace nemeni?" — inspekce popisovala model z kroku 1):
//       vetvicka vznikla ze cteni, ktere jeji runu opravdu obsahuje; "tahl celkem Nx" = skutecny pocet v logu.
//   (g) KAZDE CTENI NA SVEM MISTE (KUKY 2026-10-05: "kazde cteni, kazde!!! mam ji presne tam, kam patri"): kazde tazeni visi na
//       vetvi sveho elementu a sveho pasma zony, a ma-li cteni stranu (oblast nitro/svet), i na sve strane; vetev se stranou je
//       NAKRESLENA na te strane (uhel). Data z labu (window._PLACE), strana kresby z picku. Drive ~80 cteni na opacne strane.
//   (i) OBLAST NEHYBE VYSKOU (2026-10-09, KUKY: "vyrovnany clovek ma vyrovnany strom"): dve cteni, ktera se lisi JEN oblasti
//       (nitro × svet, tyz zamer), padnou do tehoz pasma. Do 2026-10-09 vstupovala oblast do vysky (vaha 0,3) a cteni z nitra se
//       do koruny nedostalo nikdy (KUKYho strom: vlevo v korune 0 z 98 tazeni).
//   (j) STROM BEZ OBLASTI JE VYVAZENY (2026-10-09): cteni bez strany jdou na lehci stranu, takze clovek, ktery oblast nevyplnuje,
//       ma na obou nakreslenych stranach podobne tazeni (pomer aspon MIN_LR). Drive stranu zakladal svet runy a cteni se lepila na
//       prvni vetev zony -> modelove 71 : 192.
//   (n) DRZET MISTO (2026-10-10, KUKY: "tim, ze se drzi misto pro ten element, dokud se neobjevi"): kazde misto zivel × zona, ktere
//       cteni pouzila, ma vlastni pramen (rameno z kmene), dokud strom neni na stropu 25 a pramenu je mene nez 14. Drive kapacita
//       kratkeho kmene pustila jen nekolik pramenu a zbytek visel jako povysena z ramene v jine zone (KUKYho Nauthiz v korune).
//   (m) VETVICKY KOLEM VETVE (2026-10-09, KUKY: "vetvicky by se stridaly kolem vetve na obe strany, protoze stranu vetve uz urcila
//       oblast"): zadna hlavni vetev s aspon 3 primymi vetvickami nema vsechny na jedne strane (strana = kam vetvicka miri od smeru
//       rodice v miste uchyceni). Drive strana podle oblasti -> na leve vetvi skoro jen nitro -> KUKYho strom 4 jednostranne vetve.
//   (k) SEEKING NEHYBE VYSKOU (2026-10-09, KUKY: seeking "by se mohl projevit na kazde rune, u ktere bude"): dve cteni bez zameru,
//       lisi se jen seekingem (Insight × Clarity), padnou do tehoz pasma. Drive Insight/Reflection stahovaly vysku dolu (vaha 0,2).
//   (l) KONEC VETVICKY PODLE SEEKINGU: engine (Clarity konec vys, Reflection niz nez bez seekingu) i cela cesta labem (tentyz log
//       jednou se samymi Clarity, jednou Reflection -> konce vetvicek v prumeru vys). Hlida, ze lab seekTip vetvickam opravdu preda.
//   (h) hlavnich vetvi nejvys MAX_BR = 25 (KUKY 2026-10-07: "vice jak 25 run neni dobre … vracime to k 25"). Kdyz je strom na
//       stropu, nove misto vlastni vetev nedostane a cteni visi na nejblizsi vetvi SVEHO elementu — (g) to pak pocita zvlast,
//       a takovych tazeni smi byt nejvys CAP_OFF (5 %): s prevzetim vetve zalozene stredem je to na modelovych stromech do 3 %,
//       bez nej (kdo driv prisel, ten mel vetev) 10,5 % na KUKYho strome — prah hlida, aby se to nevratilo.
//       Log "svet" (oblasti hlavne svet) pridan 2026-10-07: povysena vetev z vudci (svisle) vetve sla na druhou stranu nez jeji
//       misto (KUKYho strom: Fehu a Dagaz, 19 cteni o svete vlevo); ze dvou puvodnich logu to nechytil zadny, tenhle po 20 ctenich.
//   (f) zadne rameno nevychazi pod podlahou FLOOR (vychozi exitFloor 0,22) — KUKY 2026-10-03 "spodni vetev skoro u zeme"
//       (rameno na 17 % kmene: rozestup se nevesel a podlaha ustoupila; ted misto toho povyroste kmen).
//
//   node scripts/verify_tree_mista.js            (TREE_LAB_HTML=<cesta> = jina kopie labu, napr. pro mutacni test)
const path = require('path'), cp = require('child_process'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const MAX_BR = 25, CAP_OFF = 0.05, MIN_LR = 0.75;   // MIN_LR: (j) mensi : vetsi strana u stromu bez oblasti   // (h): 25 run = nejvys 25 hlavnich vetvi; pri stropu nejvys 5 % tazeni na vetvi vedle sveho mista
const MIN_EXIT = 29, MIN_EXIT_LR = 14, MIN_SIB = 4, MAX_STRANDS = 15, FLOOR = 0.215;   // FLOOR: vychozi exitFloor 0,22 minus zaokrouhleni; MIN_EXIT: KUKY 2026-10-03 "30px min." (drive 10 — mene nez sirka kmene); MIN_EXIT_LR: levo-pravo = polovina (obrazek 4)
const sideOf = m => (m.idx === 0) ? 0 : (Math.cos(m.ang) >= 0 ? 1 : -1);   // strana = kam rameno skutecne miri (nakresleny uhel), vudci 0
let html = process.env.TREE_LAB_HTML || null;
if (!html) {   // lab neni v gitu (generuje ho builder) -> postavit cerstvy
  const r = cp.spawnSync('python', ['-X', 'utf8', path.join(ROOT, 'build_crown_composer.py')], { encoding: 'utf8' });
  if (r.status !== 0) { console.log('❌ build_crown_composer.py spadl: ' + (r.stderr || r.stdout).slice(-300)); process.exit(1); }
}
const { labRun } = require('./utils/tree_diag.js');
const B = labRun.branch;
const RB = B.RUNES.filter(r => r.k !== 'odinn'), AI = ['healing', 'family', 'inner'], AM = ['love', 'crossroads'], AO = ['purpose', 'career', 'spirituality'];
const gen = (seed, sc, N, sa) => { let s = seed; const rnd = () => (s = (s * 1103515245 + 12345) >>> 0) / 4294967296;
  const pick3 = (p, a, b, c) => { const x = rnd(); return x < p[0] ? a() : (x < p[0] + p[1] ? b() : c()); };
  const one = arr => () => arr[Math.floor(rnd() * arr.length)];
  const intn = () => pick3(sc, () => 'past', () => 'present', () => 'decision');
  const area = () => pick3(sa || sc, one(AI), one(AM), one(AO));   // sa = rozlozeni oblasti (nitro/stred/svet), jinak jako sc
  const seek = () => pick3(sc, one(['insight', 'reflection']), one(['clarity', 'confirmation']), () => 'general');
  const pick = n => { const pool = RB.slice(), rs = []; for (let i = 0; i < n; i++) { const r = pool.splice(Math.floor(rnd() * pool.length), 1)[0]; rs.push({ rune: r.k, el: r.el }); } return rs; };
  const log = [{ spread: 'norns', runes: pick(3), area: area(), intention: intn(), seeking: seek() }];
  for (let i = 1; i < N; i++) { const x = rnd(); log.push({ spread: x < 0.8 ? 'single' : 'compass', runes: pick(x < 0.8 ? 1 : 5), area: area(), intention: intn(), seeking: seek() }); }
  return log; };
const LOGS = [['vsude', gen(3933, [1 / 3, 1 / 3, 1 / 3], 300)], ['minulost', gen(3000, [0.6, 0.2, 0.2], 300)],
  ['svet', gen(4111, [1 / 3, 1 / 3, 1 / 3], 300, [0.15, 0.15, 0.7])]];   // svet: viz (h) — povysena z vudci vetve na druhe strane
const NS = [20, 60, 150, 300];
const fails = []; let worstE = 1e9, worstLR = 1e9, worstS = 1e9, maxStr = 0, runs = 0, maxBr = 0, worstCap = 0;
LOGS.forEach(([nm, log]) => NS.forEach(n => {
  const r = labRun(log.slice(0, n), html, null); runs++;
  const mains = r.picks.filter(m => !m.gradOf && m.exitX != null);
  if (mains.length < 3) fails.push(nm + ' po ' + n + ': chybi souradnice vystupu ramen (exitX) — inspekce se zmenila?');
  mains.forEach(m => { if (m.idx !== 0 && m.frac < FLOOR) fails.push(nm + ' po ' + n + ': rameno ' + m.name + ' vychazi na ' + (m.frac * 100).toFixed(0) + ' % kmene (podlaha ' + Math.round(FLOOR * 100) + ' %)'); });
  for (let a = 0; a < mains.length; a++) for (let b = a + 1; b < mains.length; b++) {
    const d = Math.hypot(mains[a].exitX - mains[b].exitX, mains[a].exitY - mains[b].exitY), sa = sideOf(mains[a]), same = sa !== 0 && sa === sideOf(mains[b]);
    if (same) worstE = Math.min(worstE, d); else worstLR = Math.min(worstLR, d);
    const need = same ? MIN_EXIT : MIN_EXIT_LR;
    if (d < need) fails.push(nm + ' po ' + n + ': ramena ' + mains[a].name + ' a ' + mains[b].name + (same ? ' (stejna strana)' : ' (levo-pravo)') + ' vychazeji ' + d.toFixed(1) + ' px od sebe (min ' + need + ')'); }
  const byP = {};
  r.allPicks.forEach(p => { const m = p.meta || {}; let pk = null, pt = null;
    if (m.parentKey != null && p.pts && p.pts.length) { pk = String(m.parentKey); pt = p.pts[0]; }
    else if (typeof p.k === 'number' && m.gradOf && m.splitX != null) { pk = String(m.gradOfK); pt = { x: m.splitX, y: m.splitY }; }
    if (pk != null) (byP[pk] = byP[pk] || []).push({ x: pt.x, y: pt.y, nm: m.name }); });
  Object.keys(byP).forEach(k => { const L = byP[k]; for (let a = 0; a < L.length; a++) for (let b = a + 1; b < L.length; b++) {
    const d = Math.hypot(L[a].x - L[b].x, L[a].y - L[b].y); worstS = Math.min(worstS, d);
    if (d < MIN_SIB) fails.push(nm + ' po ' + n + ': na rodici ' + k + ' vetve ' + L[a].nm + ' a ' + L[b].nm + ' zacinaji ' + d.toFixed(1) + ' px od sebe (min ' + MIN_SIB + ')'); } });
  /* (g) misto kazdeho cteni */
  const sub = log.slice(0, n);
  const PL = r.sb._PLACE;
  if (!PL) fails.push('lab nevystavuje misto cteni (_PLACE) — kontrola mist nebezi');
  else { let off = 0, ex = '', offS = 0, capOff = 0, draws = 0;
    const nBr = PL.sec.length + PL.grads.length; maxBr = Math.max(maxBr, nBr);
    if (nBr > MAX_BR) fails.push(nm + ' po ' + n + ': ' + nBr + ' hlavnich vetvi (strop ' + MAX_BR + ')');
    { const elb = new Set(); PL.rd.forEach(row => (row || []).forEach(k => { if (k) elb.add(k.split('|').slice(0, 2).join('|')); }));   // (n)
      const strands = PL.sec.filter(b => !b.noStrand).length;
      if (nBr < MAX_BR && strands < Math.min(14, elb.size)) fails.push(nm + ' po ' + n + ': mist zivel × zona ' + elb.size + ', vlastnich pramenu jen ' + strands + ' (drzet misto)'); }
    const SIDE = { healing: -1, family: -1, inner: -1, purpose: 1, career: 1, spirituality: 1 };   // osa B (RUNAR_TREE.md §3), nezavisle na labu; logy zacinaji Nornami -> poradi cteni = poradi v labu
    PL.rd.forEach((row, i) => (row || []).forEach((key, j) => { if (key == null) return; const [el, b, sd] = key.split('|'), o = (PL.own[i] || [])[j];
      const br = (o == null) ? null : (o >= 100 ? PL.grads[o - 100] : PL.sec[o]);
      const capped = nBr >= MAX_BR && br && br.el === el; draws++;   // (h) na stropu: na nejblizsi vetvi sveho elementu
      if (!br || br.el !== el || String(br.band) !== b || (+sd !== 0 && br.side !== +sd)) { if (capped) capOff++; else { off++; if (!ex) ex = ' (cteni #' + (i + 1) + ' ' + key + ' visi na ' + (br ? br.el + '|' + br.band + '|' + br.side : 'nicem') + ')'; } }
      const exp = SIDE[(sub[i] || {}).area] || 0; if (exp && br && br.side !== exp && !capped) offS++; }));
    worstCap = Math.max(worstCap, capOff / Math.max(1, draws));
    if (capOff > CAP_OFF * draws) fails.push(nm + ' po ' + n + ': na stropu ' + MAX_BR + ' vetvi visi ' + capOff + ' z ' + draws + ' tazeni mimo sve misto (nejvys ' + Math.round(CAP_OFF * 100) + ' %)');
    if (off) fails.push(nm + ' po ' + n + ': ' + off + ' tazeni mimo sve misto' + ex);
    if (offS) fails.push(nm + ' po ' + n + ': ' + offS + ' tazeni se stranou z oblasti visi na vetvi druhe strany');
    r.allPicks.forEach(p => { if (typeof p.k !== 'number' || !p.meta) return; const br = (p.k >= 100) ? PL.grads[p.k - 100] : PL.sec[p.k];
      if (!br || !br.side || p.meta.idx === 0) return; const ds = Math.cos(p.meta.ang) >= 0 ? 1 : -1;
      if (ds !== br.side) fails.push(nm + ' po ' + n + ': vetev ' + p.meta.name + ' patri na stranu ' + (br.side > 0 ? 'svet (vpravo)' : 'nitro (vlevo)') + ', nakreslena na druhe'); }); }
  const drawn = r.sb._DA ? r.sb._DA() : null, picked = new Set(r.allPicks.map(p => p.pts));
  if (!drawn) fails.push('lab neda seznam nakreslenych tahu (_DA) — kontrola klikatelnosti nebezi');
  else { const bad = drawn.filter(L => !picked.has(L.pts)); if (bad.length) fails.push(nm + ' po ' + n + ': ' + bad.length + ' nakreslenych tahu nejde kliknout (' + [...new Set(bad.map(L => L.src || '?'))].join(', ') + ')'); }
  /* (m) vetvicky kolem vetve: prime vetvicky kazde hlavni vetve, strana od smeru rodice (vektorovy soucin) */
  { const par = {}; r.allPicks.forEach(p => { if (typeof p.k === 'number' && p.meta && !p.meta.twig && !p.meta.root && p.pts && p.pts.length > 2 && !par[p.k]) par[p.k] = { pts: p.pts, name: p.meta.name }; });
    const cnt = {}, seenT = new Set();
    r.allPicks.forEach(p => { const m = p.meta; if (!m || !m.twig || m.plevel !== 0 || !p.pts || p.pts.length < 2) return; const pa = par[m.parentKey]; if (!pa) return;
      const id = m.parentKey + '|' + m.slot + '|' + m.name + '|' + m.born; if (seenT.has(id)) return; seenT.add(id);   /* slot: dve vetvicky z tehoz cteni (rozklad) maji tentyz born */
      const s0 = p.pts[0], s1 = p.pts[Math.min(4, p.pts.length - 1)]; let bi = 0, bd = 1e18;
      pa.pts.forEach((q, i) => { const d = (q.x - s0.x) ** 2 + (q.y - s0.y) ** 2; if (d < bd) { bd = d; bi = i; } });
      const a = pa.pts[Math.max(0, bi - 1)], b = pa.pts[Math.min(pa.pts.length - 1, bi + 1)], cr = (b.x - a.x) * (s1.y - s0.y) - (b.y - a.y) * (s1.x - s0.x);
      const o = cnt[m.parentKey] = cnt[m.parentKey] || { name: pa.name, A: 0, B: 0 }; if (cr >= 0) o.A++; else o.B++; });
    Object.values(cnt).forEach(o => { if (o.A + o.B >= 3 && (o.A === 0 || o.B === 0)) fails.push(nm + ' po ' + n + ': vetev ' + o.name + ' ma vsech ' + (o.A + o.B) + ' primych vetvicek na jedne strane'); }); }
  /* (e) inspekce proti logu */
  const tot = {}, nameOf = {}; B.RUNES.forEach(x => { nameOf[x.k] = x.name; });
  sub.forEach(rd => (rd.runes || []).forEach(x => { tot[nameOf[x.rune]] = (tot[nameOf[x.rune]] || 0) + 1; }));
  r.allPicks.forEach(p => { const m = p.meta || {}; if (m.root) return;
    if (m.runeTot != null && m.runeTot !== tot[m.name]) fails.push(nm + ' po ' + n + ': inspekce ' + m.name + ' "tahl celkem ' + m.runeTot + 'x", v logu ' + (tot[m.name] || 0) + 'x');
    if (m.twig) { if (m.born == null || !sub[m.born]) fails.push(nm + ' po ' + n + ': vetvicka ' + m.name + ' nevi, ze ktereho cteni vznikla');
      else if (!(sub[m.born].runes || []).some(x => nameOf[x.rune] === m.name)) fails.push(nm + ' po ' + n + ': vetvicka ' + m.name + ' tvrdi cteni #' + (m.born + 1) + ', ale v nem jeji runa neni');
      if (m.runeTot == null) fails.push(nm + ' po ' + n + ': vetvicka ' + m.name + ' bez poctu tazeni'); }
    else if (typeof p.k === 'number' && m.runeTot == null) fails.push(nm + ' po ' + n + ': rameno ' + m.name + ' bez poctu tazeni');
    if (!m.twig && typeof p.k === 'number' && m.ownN != null && (!m.rdl || m.rdl.length !== m.ownN)) fails.push(nm + ' po ' + n + ': vetev ' + m.name + ' — "vetev jako celek" ma ' + (m.rdl ? m.rdl.length : 'zadna') + ' cteni, na vetvi jich visi ' + m.ownN); });   // 2026-10-09: blok VETEV JAKO CELEK v inspekci
  const sm = /prameny (\d+)/.exec(r.grow), sn = sm ? +sm[1] : null; if (sn != null) maxStr = Math.max(maxStr, sn);
  if (sn == null) fails.push(nm + ' po ' + n + ': pocet pramenu v kmeni nejde precist');
  else if (sn > MAX_STRANDS) fails.push(nm + ' po ' + n + ': ' + sn + ' pramenu v kmeni (max ' + MAX_STRANDS + ' — povysene vetve nemaji vlastni pramen)');
}));
/* (i) oblast nehybe vyskou: Norny + dve cteni Fehu se zamerem "rozhodnuti", jedno z nitra, druhe ze sveta */
let iMsg = '', jMsg = '';
{ const twin = LOGS[0][1].slice(0, 1).concat([{ spread: 'single', runes: [{ rune: 'fehu', el: 'fire' }], area: 'inner', intention: 'decision', seeking: null },
                                              { spread: 'single', runes: [{ rune: 'fehu', el: 'fire' }], area: 'purpose', intention: 'decision', seeking: null }]);
  const P1 = labRun(twin, html, null).sb._PLACE, bA = ((P1.rd[1] || [])[0] || '').split('|')[1], bB = ((P1.rd[2] || [])[0] || '').split('|')[1];
  if (bA == null || bB == null) fails.push('(i) nejde precist pasmo dvou cteni');
  else if (bA !== bB) fails.push('(i) oblast hybe vyskou: nitro -> pasmo ' + bA + ', svet -> pasmo ' + bB + ' (tyz zamer)');
  else iMsg = 'oblast nehybe vyskou'; }
/* (j) strom bez oblasti: 150 cteni z logu "vsude" s oblasti vymazanou; tazeni podle nakreslene strany vetve (vudci se nepocita) */
{ const noArea = LOGS[0][1].slice(0, 150).map(rd => Object.assign({}, rd, { area: null }));
  const r2 = labRun(noArea, html, null), P2 = r2.sb._PLACE, vote = {};
  r2.allPicks.forEach(p => { if (typeof p.k !== 'number' || !p.meta || p.meta.twig || p.meta.root || p.meta.idx === 0) return; const v = vote[p.k] = vote[p.k] || [0, 0]; v[Math.cos(p.meta.ang) >= 0 ? 1 : 0]++; });
  let nL = 0, nR = 0; P2.own.forEach(row => (row || []).forEach(o => { const v = (o == null) ? null : vote[o]; if (!v) return; if (v[1] >= v[0]) nR++; else nL++; }));
  const ratio = Math.min(nL, nR) / Math.max(1, nL, nR);
  if (ratio < MIN_LR) fails.push('(j) strom bez oblasti nevyvazeny: vlevo ' + nL + ', vpravo ' + nR + ' tazeni (pomer ' + ratio.toFixed(2) + ', min ' + MIN_LR + ')');
  else jMsg = 'bez oblasti vlevo ' + nL + ' : vpravo ' + nR; }
/* (k) seeking nehybe vyskou: Norny + dve cteni Fehu bez zameru, Insight × Clarity */
let kMsg = '', lMsg = '';
{ const twin = LOGS[0][1].slice(0, 1).concat([{ spread: 'single', runes: [{ rune: 'fehu', el: 'fire' }], area: null, intention: null, seeking: 'insight' },
                                              { spread: 'single', runes: [{ rune: 'fehu', el: 'fire' }], area: null, intention: null, seeking: 'clarity' }]);
  const P3 = labRun(twin, html, null).sb._PLACE, kA = ((P3.rd[1] || [])[0] || '').split('|')[1], kB = ((P3.rd[2] || [])[0] || '').split('|')[1];
  if (kA == null || kB == null) fails.push('(k) nejde precist pasmo dvou cteni');
  else if (kA !== kB) fails.push('(k) seeking hybe vyskou: Insight -> pasmo ' + kA + ', Clarity -> pasmo ' + kB);
  else kMsg = 'seeking nehybe vyskou'; }
/* (l) konec vetvicky podle seekingu: engine + cela cesta labem */
{ const T0 = { length: 40, width: 3, curve: 0.8, taper: 1, wobble: 0.45, tipLift: 0.35, jitter: 0, steer: 1, subScale: 0, leaf: 0, cx: 0, baseY: 0 };   /* tatáž pole jako TT v labu (growBranch) */
  const tipUp = sk => { const p = B.buildBranch({ rune: 'raidho', role: 'twig', seed: 7, baseAng: -0.6, dev: 0.5, ox: 0, oy: 0, seekTip: sk }, T0).paths[0].pts,
    a = p[p.length - 2], b = p[p.length - 1]; return -(b.y - a.y) / Math.max(1e-9, Math.hypot(b.x - a.x, b.y - a.y)); };
  const u0 = tipUp(undefined), uC = tipUp('clarity'), uR = tipUp('reflection');
  if (!(uC > u0 + 0.05 && uR < u0 - 0.05)) fails.push('(l) engine: konec vetvicky nereaguje na seeking (bez ' + u0.toFixed(2) + ', Clarity ' + uC.toFixed(2) + ', Reflection ' + uR.toFixed(2) + ')');
  const L40 = LOGS[0][1].slice(0, 40), mk = sk => L40.map(rd => Object.assign({}, rd, { seeking: sk }));
  const upLab = lg => { let sum = 0, cnt = 0; labRun(lg, html, null).allPicks.forEach(p => { if (!p.meta || !p.meta.twig || !p.pts || p.pts.length < 2) return;
    const a = p.pts[p.pts.length - 2], b = p.pts[p.pts.length - 1], L = Math.hypot(b.x - a.x, b.y - a.y); if (L > 0) { sum += -(b.y - a.y) / L; cnt++; } }); return cnt ? sum / cnt : 0; };
  const lc = upLab(mk('clarity')), lr = upLab(mk('reflection'));
  if (!(lc > lr + 0.05)) fails.push('(l) lab: konce vetvicek s Clarity nejsou vys nez s Reflection (' + lc.toFixed(2) + ' vs ' + lr.toFixed(2) + ') — preda lab seekTip?');
  else lMsg = 'konce vetvicek: Clarity ' + lc.toFixed(2) + ' > Reflection ' + lr.toFixed(2); }
if (fails.length) { fails.slice(0, 12).forEach(f => console.log('   ' + f)); console.log('strom: ' + fails.length + ' poruseni (vetve ze stejneho mista / pod podlahou / cteni mimo sve misto / vetvi nad strop / neklikatelne / prameny navic / inspekce neodpovida logu)'); process.exit(1); }
console.log('strom (lab): ' + runs + ' stromu — vystupy ramen na stejne strane aspon ' + worstE.toFixed(0) + ' px, levo-pravo aspon ' + worstLR.toFixed(0) + ' px, zadne pod podlahou, kazde cteni na svem miste (na stropu nejvys ' + (worstCap * 100).toFixed(1) + ' % o misto vedle), nejvys ' + maxBr + ' hlavnich vetvi, vetve na rodici aspon ' + worstS.toFixed(1) + ' px, vse klikatelne, inspekce = log, nejvys ' + maxStr + ' pramenu v kmeni, ' + iMsg + ', ' + jMsg + ', ' + kMsg + ', ' + lMsg);
