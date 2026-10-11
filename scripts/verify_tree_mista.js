// ⭐ 2026-10-10 RAMENO = STRANA × ZONA (KUKY "8. ano, prepis ㉳ a zapni to v labu"; DECISIONS 2026-10-10 (34) a zapnuti): rameno = strana
//   (oblast; bez oblasti koluje na lehci stranu) × zona (Urd / Verdandi / Skuld), vrchol = zakladaci Skuld + Skuld bez strany; vedlejsi vetev na
//   rameni = dalsi zivel v tom miste (kapacita Urd 3, Verdandi 3, Skuld 2, vrchol 2 — 2 × (4+4+3) + 3 = 25); dalsi zivel roste jako vetvicky
//   primo na rameni. Proto se zmenilo: (d) nejvys 7 pramenu (6 ramen + vrchol), (g) misto = strana × zona (+ zivel na vedlejsi), (h) strop
//   25 hlida stavba sama, (n) "drzet misto zivel × zona" pryc (mista zivel × zona uz nejsou ramena); nove (o) stalost, (p) kapacita, (q) koreny.
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
//   (d) v kmeni je nejvys 7 pramenu (6 ramen strana × zona + vrchol; do 2026-10-10 nejvys 15 = 14 mist element × zona + vzacny 15.).
//   (e) INSPEKCE odpovida logu (2026-10-03, KUKY: "proc se informace nemeni?" — inspekce popisovala model z kroku 1):
//       vetvicka vznikla ze cteni, ktere jeji runu opravdu obsahuje; "tahl celkem Nx" = skutecny pocet v logu.
//   (g) KAZDE CTENI NA SVEM MISTE (KUKY 2026-10-05: "kazde cteni, kazde!!! mam ji presne tam, kam patri"; 2026-10-10 "proc by na neco
//       nemelo zbyt misto?"): kazde tazeni visi na vetvi sve strany a sve zony (rameno nebo jeho vedlejsi), na vedlejsi jen sveho zivlu;
//       na rameni jineho zivlu jen kdyz ma rameno plnou kapacitu vedlejsich. Ma-li cteni stranu (oblast), visi na sve strane a vetev je
//       NAKRESLENA na te strane (uhel). Data z labu (window._PLACE), strana kresby z picku. Drive (2026-10-05) misto = zivel × zona × strana.
//   (i) OBLAST NEHYBE VYSKOU (2026-10-09, KUKY: "vyrovnany clovek ma vyrovnany strom"): dve cteni, ktera se lisi JEN oblasti
//       (nitro × svet, tyz zamer), padnou do tehoz pasma. Do 2026-10-09 vstupovala oblast do vysky (vaha 0,3) a cteni z nitra se
//       do koruny nedostalo nikdy (KUKYho strom: vlevo v korune 0 z 98 tazeni).
//   (j) STROM BEZ OBLASTI JE VYVAZENY (2026-10-09): cteni bez strany jdou na lehci stranu, takze clovek, ktery oblast nevyplnuje,
//       ma na obou nakreslenych stranach podobne tazeni (pomer aspon MIN_LR). Drive stranu zakladal svet runy a cteni se lepila na
//       prvni vetev zony -> modelove 71 : 192.
//   (n) ~~DRZET MISTO zivel × zona~~ ZRUSENO 2026-10-10 s rameny strana × zona — kazde rameno ma pramen vzdy (jeho misto je pevne).
//   (o) STALOST (2026-10-10, KUKY "strom je zivy, ale vetve neskacou"): rameno tehoz mista (strana × zona) vychazi z kmene v kazdem okamziku
//       rustu ve stejne vysce (do 2026-10-10 vysku vedla casova smycka podle zon cteni a ramena se posouvala).
//   (p) KAPACITA: na rameni Urd a Verdandi nejvys 3 vedlejsi, na Skuld 2, na vrcholu 2; vedlejsi nese jiny zivel nez rameno a zadny dvakrat.
//   (q) KAZDA VETEV MA KOREN (DECISIONS 2026-10-10 (26)): kazda vedlejsi vetev ma svuj koren (klikatelny), ramena ho maji ve svem tahu.
//   (r) SEEKING TVARUJE CELOU VETEV (2026-10-10, KUKY "aby se cela vetev tvarovala"): tentyz log jednou se samym Clarity, jednou s Reflection ->
//       ramena a vedlejsi s Clarity v druhe pulce delky mireji vys. Hlida, ze lab seeking vetvim preda a pater opravdu ohne.
//   (s) SEEKING TVARUJE KOREN (2026-10-11, KUKY "8. seeking i pro koreny" a "9. ano, zapni v labu"; DECISIONS 2026-10-11 (2)): tentyz log
//       se samym Clarity a se samym Reflection -> druha pulka korenu s Clarity mire vic dolu. Hlida, ze lab seeking korenum preda.
//   (t) NAVRAT RUNY PROHLOUBI KOREN (2026-10-11, kanon RUNAR_TREE.md §2): 60 cteni + 30 cteni se zakladaci runou Urd proti 30 tymz ctenim
//       s jinou runou tehoz zivlu — stavba stromu je v obou stejna (misto urci zivel, oblast a zamer), lisi se jen pocet navratu. Koren
//       zakladaci runy ma v inspekci presne o 30 navratu vic a jeho vybezky jsou delsi.
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
const MAX_BR = 25, MIN_LR = 0.75, CAPB = { '-1': 3, '0': 3, '1': 2 }, CAP_TOP = 2;   // MIN_LR: (j) mensi : vetsi strana u stromu bez oblasti   // (h): 25 run = nejvys 25 hlavnich vetvi; pri stropu nejvys 5 % tazeni na vetvi vedle sveho mista
const MIN_EXIT = 29, MIN_EXIT_LR = 14, MIN_SIB = 4, MAX_STRANDS = 7, FLOOR = 0.215;   // FLOOR: vychozi exitFloor 0,22 minus zaokrouhleni; MIN_EXIT: KUKY 2026-10-03 "30px min." (drive 10 — mene nez sirka kmene); MIN_EXIT_LR: levo-pravo = polovina (obrazek 4)
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
const fails = []; let worstE = 1e9, worstLR = 1e9, worstS = 1e9, maxStr = 0, runs = 0, maxBr = 0, worstForeign = 0; const STAL = {};
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
  else { let off = 0, ex = '', offS = 0, foreign = 0, draws = 0;
    const nBr = PL.sec.length + PL.grads.length; maxBr = Math.max(maxBr, nBr);
    if (nBr > MAX_BR) fails.push(nm + ' po ' + n + ': ' + nBr + ' hlavnich vetvi (strop ' + MAX_BR + ')');
    /* (p) kapacita ramene: vedlejsi na matce, jiny zivel nez rameno, zadny dvakrat */
    const subs = {}; PL.grads.forEach(g => { (subs[g.p] = subs[g.p] || []).push(g); });
    Object.keys(subs).forEach(q => { const m = PL.sec[q], L = subs[q], cap = (!m || m.side === 0) ? CAP_TOP : CAPB[String(m.band)];
      if (L.length > cap) fails.push(nm + ' po ' + n + ': rameno ' + (m ? m.el + '|' + m.band + '|' + m.side : q) + ' ma ' + L.length + ' vedlejsich (kapacita ' + cap + ')');
      const els = new Set(); L.forEach(g => { if (m && g.el === m.el) fails.push(nm + ' po ' + n + ': vedlejsi ' + g.el + ' na rameni tehoz zivlu'); if (els.has(g.el)) fails.push(nm + ' po ' + n + ': na rameni dve vedlejsi ' + g.el); els.add(g.el); }); });
    const SIDE = { healing: -1, family: -1, inner: -1, purpose: 1, career: 1, spirituality: 1 };   // osa B (RUNAR_TREE.md §3), nezavisle na labu; logy zacinaji Nornami -> poradi cteni = poradi v labu
    PL.rd.forEach((row, i) => (row || []).forEach((key, j) => { if (key == null) return; const [el, b, sd] = key.split('|'), o = (PL.own[i] || [])[j]; draws++;
      const isG = o != null && o >= 100, br = (o == null) ? null : (isG ? PL.grads[o - 100] : PL.sec[o]);
      const full = !isG && br && (subs[o] || []).length >= ((br.side === 0) ? CAP_TOP : CAPB[String(br.band)]);
      const okSlot = br && String(br.band) === b && br.side === +sd, okEl = br && (br.el === el || (!isG && full));
      if (okSlot && !isG && br.el !== el) foreign++;
      if (!okSlot || !okEl) { off++; if (!ex) ex = ' (cteni #' + (i + 1) + ' ' + key + ' visi na ' + (br ? br.el + '|' + br.band + '|' + br.side + (isG ? ' vedlejsi' : ' rameno') : 'nicem') + ')'; }
      const exp = SIDE[(sub[i] || {}).area] || 0; if (exp && br && br.side !== 0 && br.side !== exp) offS++; }));   /* vrchol (strana 0) = stred: zakladaci Skuld tam jde vzdy, ma-li cteni oblast nebo ne */
    worstForeign = Math.max(worstForeign, foreign / Math.max(1, draws));
    if (off) fails.push(nm + ' po ' + n + ': ' + off + ' tazeni mimo sve misto' + ex);
    if (offS) fails.push(nm + ' po ' + n + ': ' + offS + ' tazeni se stranou z oblasti visi na vetvi druhe strany');
    /* (o) stalost: vyska vystupu ramene kazdeho mista v case */
    mains.forEach(m => { const sl = PL.sec[m.idx]; if (!sl) return; const key = nm + '|' + sl.side + '|' + sl.band; (STAL[key] = STAL[key] || []).push({ n, f: m.frac, name: m.name }); });
    /* (q) koren kazde vedlejsi vetve */
    const nSR = r.allPicks.filter(p => p.meta && p.meta.sideRoot).length;
    if (nSR !== PL.grads.length) fails.push(nm + ' po ' + n + ': korenu vedlejsich ' + nSR + ', vedlejsich vetvi ' + PL.grads.length);
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
      const s0 = p.pts[0], s1 = p.pts[p.pts.length - 1]; let bi = 0, bd = 1e18;   /* strana = kam vetvicka miri od baze ke spicce (cela). Do 2026-10-10 z prvnich 5 bodu:
         mlade vetvicky na zahnutem konci ramene se tam stocily pres vetev, i kdyz jako celek rostly stridave (minulost po 20: Mannaz, v bode 1 B A B A B, v bode 4 vse A, v bode 8 A B A B A) */
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
  else if (sn > MAX_STRANDS) fails.push(nm + ' po ' + n + ': ' + sn + ' pramenu v kmeni (max ' + MAX_STRANDS + ' — 6 ramen + vrchol, vedlejsi vlastni pramen nemaji)');
}));
/* (o) stalost: rameno tehoz mista ve vsech okamzicich rustu ve stejne vysce */
let oMsg = '';
{ let worst = 0; Object.keys(STAL).forEach(k => { const L = STAL[k], f0 = L[0].f; L.forEach(x => { worst = Math.max(worst, Math.abs(x.f - f0));
    if (Math.abs(x.f - f0) > 0.002) fails.push('(o) rameno ' + k + ' (' + x.name + ') se posunulo z ' + (f0 * 100).toFixed(1) + ' % na ' + (x.f * 100).toFixed(1) + ' % kmene (po ' + x.n + ' ctenich)'); }); });
  oMsg = 'ramena v case nejvys ' + (worst * 100).toFixed(2) + ' % kmene od sve vysky'; }
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
/* (r) seeking tvaruje celou vetev: smer druhe pulky vetvi (ramena + vedlejsi), Clarity vys nez Reflection */
let rMsg = '';
{ const L60 = LOGS[0][1].slice(0, 120), mk = sk => L60.map(rd => Object.assign({}, rd, { seeking: sk }));
  const upHalf = lg => { let sum = 0, cnt = 0; labRun(lg, html, null).allPicks.forEach(p => { if (typeof p.k !== 'number' || !p.meta || p.meta.twig || p.meta.root || p.meta.idx === 0) return;
    const P = (p.meta.tp != null) ? p.pts.slice(p.meta.tp) : p.pts; if (P.length < 6) return; const a = P[Math.floor(P.length / 2)], b = P[P.length - 1], L = Math.hypot(b.x - a.x, b.y - a.y);
    if (L > 0) { sum += -(b.y - a.y) / L; cnt++; } }); return cnt ? sum / cnt : 0; };
  const rc = upHalf(mk('clarity')), rr = upHalf(mk('reflection'));
  if (!(rc > rr + 0.05)) fails.push('(r) vetve se Clarity nemiri vys nez s Reflection (' + rc.toFixed(2) + ' vs ' + rr.toFixed(2) + ') — preda lab seeking ramenum?');
  else rMsg = 'vetve: Clarity ' + rc.toFixed(2) + ' > Reflection ' + rr.toFixed(2); }
/* (s) seeking tvaruje koren: smer druhe pulky korenovych tahu (bez zrcadlovych korinku), Clarity vic dolu nez Reflection */
let sMsg = '';
{ const L120 = LOGS[0][1].slice(0, 120), mk = sk => L120.map(rd => Object.assign({}, rd, { seeking: sk }));
  const downHalf = lg => { let sum = 0, cnt = 0; labRun(lg, html, null).allPicks.forEach(p => { if (!p.meta || !p.meta.root || p.meta.mirror || !p.pts || p.pts.length < 6) return;
    const a = p.pts[Math.floor(p.pts.length / 2)], b = p.pts[p.pts.length - 1], L = Math.hypot(b.x - a.x, b.y - a.y); if (L > 0) { sum += (b.y - a.y) / L; cnt++; } }); return cnt ? sum / cnt : 0; };
  const sc = downHalf(mk('clarity')), sr = downHalf(mk('reflection'));
  if (!(sc > sr + 0.1)) fails.push('(s) koreny se Clarity nemiri hloubeji nez s Reflection (' + sc.toFixed(2) + ' vs ' + sr.toFixed(2) + ') — preda lab seeking korenum?');
  else sMsg = 'koreny: Clarity ' + sc.toFixed(2) + ' hloubeji nez Reflection ' + sr.toFixed(2); }
/* (t) navrat runy prohloubi koren: Y = jina runa tehoz zivlu jako X (zakladaci Urd) -> tataz mista; koren X porovnany na TEMZ prameni */
let tMsg = '';
{ const base = LOGS[0][1].slice(0, 60), X = base[0].runes[0], Y = RB.find(r => r.el === X.el && r.k !== X.rune), nmX = (B.RUNES.find(z => z.k === X.rune) || {}).name;
  const add = rr => base.concat(Array.from({ length: 30 }, () => ({ spread: 'single', runes: [rr], area: 'career', intention: 'decision', seeking: null })));
  const meas = (lg, kFix) => { let k = kFix, nav = null, len = 0; labRun(lg, html, null).allPicks.forEach(p => { const m = p.meta || {}; if (!m.root || m.mirror || m.name !== nmX || m.navraty == null) return;
      if (k == null) k = m.strand; if (m.strand !== k) return; nav = m.navraty; for (let i = 1; i < p.pts.length; i++) len += Math.hypot(p.pts[i].x - p.pts[i - 1].x, p.pts[i].y - p.pts[i - 1].y); });
    return { k, nav, len }; };
  const A = meas(add({ rune: Y.k, el: Y.el }), null), Bx = meas(add(X), A.k);
  if (A.nav == null || Bx.nav == null) fails.push('(t) koren zakladaci runy ' + nmX + ' nema v inspekci pocet navratu');
  else if (Bx.nav - A.nav !== 30) fails.push('(t) navraty korene ' + nmX + ': ' + A.nav + ' -> ' + Bx.nav + ' (ocekavano +30)');
  else if (!(Bx.len > A.len * 1.10)) fails.push('(t) koren ' + nmX + ' se s 30 navraty neprodlouzil (' + A.len.toFixed(0) + ' -> ' + Bx.len.toFixed(0) + ' px)');
  else tMsg = 'navrat prohloubi koren (' + nmX + ' +30 navratu: ×' + (Bx.len / A.len).toFixed(2) + ')'; }
if (fails.length) { fails.slice(0, 12).forEach(f => console.log('   ' + f)); console.log('strom: ' + fails.length + ' poruseni (vetve ze stejneho mista / pod podlahou / cteni mimo sve misto / vetvi nad strop / neklikatelne / prameny navic / inspekce neodpovida logu)'); process.exit(1); }
console.log('strom (lab): ' + runs + ' stromu — vystupy ramen na stejne strane aspon ' + worstE.toFixed(0) + ' px, levo-pravo aspon ' + worstLR.toFixed(0) + ' px, zadne pod podlahou, kazde cteni na svem miste strana × zona (jako vetvicka na plnem rameni jineho zivlu nejvys ' + (worstForeign * 100).toFixed(0) + ' %), nejvys ' + maxBr + ' vetvi, kapacita ramen drzi, kazda vedlejsi ma koren, ' + oMsg + ', vetve na rodici aspon ' + worstS.toFixed(1) + ' px, vse klikatelne, inspekce = log, nejvys ' + maxStr + ' pramenu v kmeni, ' + iMsg + ', ' + jMsg + ', ' + kMsg + ', ' + lMsg + ', ' + rMsg + ', ' + sMsg + ', ' + tMsg);
