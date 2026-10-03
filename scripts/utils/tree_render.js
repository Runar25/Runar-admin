// STROM VEDLE STROMU (CODE-tree 2026-10-03). Vykresli KUKYho strom (jeho log z _tree_state.json, VYCHOZI posuvniky labu =
// to, co vidi v prohlizeci) z vic verzi labu vedle sebe do PNG: tvary z platna labu (r.fills), rasterizace scanline
// (even-odd), bez textur — jde o rozlozeni a tvar vetvi, ne o kuru.
// Proc: 2026-10-03 jsem opravoval prekryvy a rozestup podle cisel (226 -> 49 prekryvu, 30 px) a strom mezitim prestal byt
// stromem — rovna tyc s vodorovnymi klacky od zeme a vidlici na spici. KUKY: "a je to koste. predelal jsi vic veci, nez jsi
// mel, a uz to neni strom." Zadne meridlo se neptalo, jak to vypada. Pred hlasenim zmeny stromu: tahle kresba vedle
// posledni verze, kterou owner prijal, a podivat se (memory break-your-own-work-before-reporting, bod 7).
//   node scripts/utils/tree_render.js out.png "popis|cesta.html|{crownT json}" ...   (cesta '-' = aktualni lab)
//   LOGN=30 = strom po prvnich 30 ctenich. Starsi verzi labu postav z `git show <commit>:build_crown_composer.py` s DST jinam.
const fs = require('fs'), zlib = require('zlib');
const { labRun } = require('C:/Users/zkuku/Downloads/Runar-admin/scripts/utils/tree_diag.js');
const st = JSON.parse(fs.readFileSync('C:/Users/zkuku/Downloads/Runar-admin/_tree_state.json', 'utf8'));
const LOGN = process.env.LOGN ? +process.env.LOGN : st.log.length;
const out = process.argv[2], specs = process.argv.slice(3).map(s => { const [lbl, html, cf] = s.split('|'); return { lbl, html: html === '-' ? null : html, cf: cf ? JSON.parse(cf) : {} }; });
const W = 560, H = 900, SC = 0.6, PW = Math.round(W * SC), PH = Math.round(H * SC) + 0;
const IW = PW * specs.length, IH = PH;
const img = Buffer.alloc(IW * IH * 3, 0); for (let i = 0; i < IW * IH; i++) { img[i * 3] = 14; img[i * 3 + 1] = 16; img[i * 3 + 2] = 22; }
const parseCol = c => { c = String(c || '#ccc'); let m;
  if ((m = c.match(/^#([0-9a-f]{6})$/i))) return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16), 1];
  if ((m = c.match(/^#([0-9a-f]{3})$/i))) return [parseInt(m[1][0] + m[1][0], 16), parseInt(m[1][1] + m[1][1], 16), parseInt(m[1][2] + m[1][2], 16), 1];
  if ((m = c.match(/rgba?\(([^)]+)\)/))) { const p = m[1].split(',').map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; }
  return [200, 200, 200, 1]; };
specs.forEach((sp, si) => {
  const inj = { crownT: sp.cf, trunkT: {}, rootsT: {}, rune: st.rune, dob: st.dob };
  const r = labRun(st.log.slice(0, LOGN), sp.html, inj), ox = si * PW;
  r.fills.forEach(f => { if (f.length < 3) return; const [cr, cg, cb, ca0] = parseCol(f.col), ca = Math.max(0.35, Math.min(1, ca0));
    const P = f.map(([x, y]) => [x * SC, y * SC]); let y0 = 1e9, y1 = -1e9; P.forEach(p => { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
    for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(PH - 1, Math.ceil(y1)); y++) { const yc = y + 0.5, xs = [];
      for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j]; if ((a[1] > yc) !== (b[1] > yc)) xs.push(a[0] + (yc - a[1]) * (b[0] - a[0]) / (b[1] - a[1])); }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.max(0, Math.round(xs[k])); x <= Math.min(PW - 1, Math.round(xs[k + 1])); x++) {
        const o = (y * IW + ox + x) * 3; img[o] = img[o] * (1 - ca) + cr * ca; img[o + 1] = img[o + 1] * (1 - ca) + cg * ca; img[o + 2] = img[o + 2] * (1 - ca) + cb * ca; } } });
  for (let y = 0; y < PH; y++) { const o = (y * IW + ox) * 3; img[o] = 90; img[o + 1] = 90; img[o + 2] = 90; }   // oddelovac panelu
  const M = r.picks.filter(m => !m.gradOf && m.exitX != null).sort((a, b) => a.frac - b.frac);
  console.log(sp.lbl + ':', M.length, 'ramen,', r.picks.filter(m => m.gradOf).length, 'povysenych | vysky', M.map(m => (m.frac * 100).toFixed(0)).join(' '));
});
const raw = Buffer.alloc((IW * 3 + 1) * IH); for (let y = 0; y < IH; y++) { raw[y * (IW * 3 + 1)] = 0; img.copy(raw, y * (IW * 3 + 1) + 1, y * IW * 3, (y + 1) * IW * 3); }
const crc = (b) => { let c, t = []; for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } let x = 0xffffffff; for (const v of b) x = t[(x ^ v) & 255] ^ (x >>> 8); return (x ^ 0xffffffff) >>> 0; };
const chunk = (ty, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(ty), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
const ih = Buffer.alloc(13); ih.writeUInt32BE(IW, 0); ih.writeUInt32BE(IH, 4); ih[8] = 8; ih[9] = 2; ih[10] = 0; ih[11] = 0; ih[12] = 0;
fs.writeFileSync(out, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
console.log('->', out);
