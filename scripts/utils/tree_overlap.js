// PREKRYV VETVI (CODE-tree 2026-10-03). KUKY: "Othila a Thurisaz se prakticky prekryvaji! … podle ceho to poznas?" a pak:
// "to, ze se vetve protinaji, me nezajima… protinat a prekryvat je snad rozdil? kdyz neco nejde za necim videt, tak o tom nevis."
// Meri po cele delce dvojice vetvi (ramena + povysene): kde jsou bliz nez soucet polovin tloustek (+ reserve px), dotykaji se.
// Kazdy souvisly usek dotyku se zaradi podle uhlu mezi vetvemi v tom miste:
//   PREKRYV  = vetve bezi souběžne (uhel < parallel°) -> jedna schovava druhou (TO je chyba),
//   PROTNUTI = vetve se zkrizi pod ostrym uhlem -> v poradku (KUKY).
// Zaklad u kmene (prvnich skip × delky) a okoli mista odstepeni povysene vetve (splitR px) se nepocita.
//   const { overlaps } = require('./tree_overlap.js'); overlaps(r.allPicks)  -> jen PREKRYVY; { all:true } i protnuti
function branchPts(p) { const m = p.meta || {}; if (m.tp != null) return p.pts.slice(m.tp);
  if (m.exitX != null) { const i = p.pts.findIndex(q => Math.abs(q.x - m.exitX) < 0.01 && Math.abs(q.y - m.exitY) < 0.01); if (i >= 0) return p.pts.slice(i); }   // starsi build bez tp
  return p.pts; }
function segDist(px, py, ax, ay, bx, by) { const vx = bx - ax, vy = by - ay, L2 = vx * vx + vy * vy;
  let t = L2 ? ((px - ax) * vx + (py - ay) * vy) / L2 : 0; t = Math.max(0, Math.min(1, t));
  const qx = ax + t * vx, qy = ay + t * vy; return { d: Math.hypot(px - qx, py - qy), t }; }
function overlaps(allPicks, opts) {
  const o = Object.assign({ skip: 0.15, reserve: 1, minLen: 10, splitR: 25, parallel: 25, all: false }, opts || {});
  const L = allPicks.filter(p => typeof p.k === 'number' && p.pts && p.pts.length > 3).map(p => {
    const P = branchPts(p); let acc = 0; const cum = [0]; for (let i = 1; i < P.length; i++) { acc += Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y); cum.push(acc); }
    const m = p.meta || {}; return { k: p.k, name: m.name, P, cum, len: acc, grad: !!m.gradOf, mother: m.gradOfK, split: (m.splitX != null) ? { x: m.splitX, y: m.splitY } : null }; });
  const res = [];
  for (let a = 0; a < L.length; a++) for (let b = a + 1; b < L.length; b++) { const A = L[a], B = L[b];
    if (A.len < 5 || B.len < 5) continue;
    const sp = (A.grad && A.mother === B.k) ? A.split : ((B.grad && B.mother === A.k) ? B.split : null);
    let run = null; const runs = [];
    const close = () => { if (run) { runs.push(run); run = null; } };
    for (let i = 1; i < A.P.length; i++) {
      if (A.cum[i] < o.skip * A.len) { close(); continue; }
      const p = A.P[i]; if (sp && Math.hypot(p.x - sp.x, p.y - sp.y) < o.splitR) { close(); continue; }
      let best = { d: 1e9, w: 0, j: -1 };
      for (let j = 1; j < B.P.length; j++) { if (B.cum[j] < o.skip * B.len) continue; const q0 = B.P[j - 1], q1 = B.P[j], sd = segDist(p.x, p.y, q0.x, q0.y, q1.x, q1.y);
        if (sd.d < best.d) best = { d: sd.d, w: q0.w + (q1.w - q0.w) * sd.t, j }; }
      const gap = best.d - ((p.w || 0) + (best.w || 0)) / 2;
      if (gap < o.reserve && best.j > 0) {
        const pa = A.P[i - 1], qa = B.P[best.j - 1], qb = B.P[best.j];
        let ang = Math.abs(Math.atan2(p.y - pa.y, p.x - pa.x) - Math.atan2(qb.y - qa.y, qb.x - qa.x)) * 180 / Math.PI;
        ang = ang % 180; if (ang > 90) ang = 180 - ang;   // smer vetve nema znamenko: 0° = souběžne, 90° = kolmo
        if (!run) run = { len: 0, angS: 0, n: 0, hits: [], gap: 1e9 };
        run.len += A.cum[i] - A.cum[i - 1]; run.angS += ang; run.n++; run.gap = Math.min(run.gap, gap);
        run.hits.push([Math.round(p.x * 10) / 10, Math.round(p.y * 10) / 10]);
      } else close(); }
    close();
    runs.forEach(rn => { const ang = rn.angS / rn.n, kind = (ang < o.parallel) ? 'prekryv' : 'protnuti';
      if (rn.len < o.minLen && kind === 'prekryv') return;
      if (kind === 'protnuti' && !o.all) return;
      res.push({ a: A.name, b: B.name, ka: A.k, kb: B.k, kind, len: Math.round(rn.len), ang: Math.round(ang), gap: Math.round(rn.gap * 10) / 10, hits: rn.hits }); });
  }
  return res;
}
module.exports = { overlaps };
