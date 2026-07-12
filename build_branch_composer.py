# -*- coding: utf-8 -*-
# Builds the Branch Composer lab into v2/tree-lab-branch-composer/.
# Purpose (KUKY, 2026-06-12): author the SHAPE VOCABULARY of one branch in
# isolation. Pick a rune -> see its intrinsic placement (aett axis, world
# height, element sub-branch) + apply optional area/intention/mood and watch
# a single branch shape respond. Tune the language live. Grid view = all 25
# runes (24 + Odinn) at a glance. Shape = properties + per-rune table (tuned).
# Per CLAUDE.md paragraph 1: JS via Python, never the Edit tool.
import io, os, time

V2 = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'v2')
DST = os.path.join(V2, 'tree-lab-branch-composer')
os.makedirs(DST, exist_ok=True)

MODEL = r"""/* ============================================================
   RUNAR - Branch shape engine (Composer)
   One branch from one reading. Shape = element archetype + per-rune
   signature (tuned), scaled by role, steered by area/intention/mood.
   This is the vocabulary the tree will later import.
   ============================================================ */
(function (global) {
'use strict';

/* palettes - reused as-is, colour is NOT being tuned now */
var TREE_BASE = { dark:'#23211b', mid:'#54514a', base:'#878478', bright:'#c2bfb2' };
var LEAF_BASE = { dark:'#142008', mid:'#2c451c', base:'#3c5c26', bright:'#5c7f3c' };
var ELEMENTS = {
  fire:  { dark:'#4A1A08', mid:'#A03510', base:'#C84B1A', bright:'#FF6B35' },
  water: { dark:'#081A4A', mid:'#1255A0', base:'#1A6BC8', bright:'#35AAFF' },
  air:   { dark:'#1A4A08', mid:'#50901A', base:'#6BA81A', bright:'#AAFF35' },
  earth: { dark:'#2A1A08', mid:'#6A5010', base:'#8B6B1A', bright:'#D4AA35' },
  shadow:{ dark:'#15151c', mid:'#2a2a38', base:'#3c3c50', bright:'#56566e' }
};
var ELEMENT_TINT = 0.26;

/* ---- the 24 + Odinn. aett / world / element are REAL data from
   runar-runes.js. curve/sub/taper = shape signature, seed for the
   Composer to tune. ---- */
var RUNES = [
  { k:'fehu',     name:'Fehu',     g:'ᚠ', aett:'freya',    world:'midgard', el:'fire',   curve:0.35, sub:2, taper:1.00 },
  { k:'uruz',     name:'Uruz',     g:'ᚢ', aett:'freya',    world:'midgard', el:'earth',  curve:0.18, sub:1, taper:0.70 },
  { k:'thurisaz', name:'Thurisaz', g:'ᚦ', aett:'freya',    world:'hel',     el:'fire',   curve:0.12, sub:1, taper:1.10 },
  { k:'ansuz',    name:'Ansuz',    g:'ᚨ', aett:'freya',    world:'asgard',  el:'air',    curve:0.30, sub:2, taper:1.00 },
  { k:'raidho',   name:'Raidho',   g:'ᚱ', aett:'freya',    world:'midgard', el:'air',    curve:0.42, sub:1, taper:1.00 },
  { k:'kenaz',    name:'Kenaz',    g:'ᚲ', aett:'freya',    world:'midgard', el:'fire',   curve:0.20, sub:1, taper:1.10 },
  { k:'gebo',     name:'Gebo',     g:'ᚷ', aett:'freya',    world:'midgard', el:'water',  curve:0.30, sub:2, taper:1.00 },
  { k:'wunjo',    name:'Wunjo',    g:'ᚹ', aett:'freya',    world:'midgard', el:'air',    curve:0.45, sub:1, taper:1.15 },
  { k:'hagalaz',  name:'Hagalaz',  g:'ᚺ', aett:'heimdall', world:'hel',     el:'shadow', curve:0.15, sub:2, taper:1.05 },
  { k:'nauthiz',  name:'Nauthiz',  g:'ᚾ', aett:'heimdall', world:'hel',     el:'earth',  curve:0.10, sub:1, taper:1.00 },
  { k:'isa',      name:'Isa',      g:'ᛁ', aett:'heimdall', world:'hel',     el:'shadow', curve:0.04, sub:0, taper:1.25 },
  { k:'jera',     name:'Jera',     g:'ᛃ', aett:'heimdall', world:'midgard', el:'earth',  curve:0.50, sub:1, taper:0.95 },
  { k:'eihwaz',   name:'Eihwaz',   g:'ᛇ', aett:'heimdall', world:'hel',     el:'earth',  curve:0.20, sub:1, taper:1.00 },
  { k:'perthro',  name:'Perthro',  g:'ᛈ', aett:'heimdall', world:'hel',     el:'water',  curve:0.50, sub:2, taper:1.00 },
  { k:'algiz',    name:'Algiz',    g:'ᛉ', aett:'heimdall', world:'asgard',  el:'air',    curve:0.22, sub:2, taper:1.00 },
  { k:'sowilo',   name:'Sowilo',   g:'ᛋ', aett:'heimdall', world:'asgard',  el:'fire',   curve:0.55, sub:1, taper:1.00 },
  { k:'tiwaz',    name:'Tiwaz',    g:'ᛏ', aett:'tyr',      world:'asgard',  el:'fire',   curve:0.08, sub:1, taper:1.10 },
  { k:'berkano',  name:'Berkano',  g:'ᛒ', aett:'tyr',      world:'midgard', el:'water',  curve:0.65, sub:1, taper:0.90 },
  { k:'ehwaz',    name:'Ehwaz',    g:'ᛖ', aett:'tyr',      world:'midgard', el:'air',    curve:0.30, sub:2, taper:0.95 },
  { k:'mannaz',   name:'Mannaz',   g:'ᛗ', aett:'tyr',      world:'asgard',  el:'air',    curve:0.30, sub:2, taper:1.00 },
  { k:'laguz',    name:'Laguz',    g:'ᛚ', aett:'tyr',      world:'hel',     el:'water',  curve:0.58, sub:0, taper:1.10 },
  { k:'ingwaz',   name:'Ingwaz',   g:'ᛜ', aett:'tyr',      world:'asgard',  el:'water',  curve:0.60, sub:1, taper:0.95 },
  { k:'othala',   name:'Othala',   g:'ᛟ', aett:'tyr',      world:'asgard',  el:'earth',  curve:0.40, sub:2, taper:0.95 },
  { k:'dagaz',    name:'Dagaz',    g:'ᛞ', aett:'tyr',      world:'asgard',  el:'fire',   curve:0.45, sub:1, taper:1.00 },
  { k:'odinn',    name:'Odinn',    g:'◇', aett:'none',     world:'midgard', el:'shadow', curve:0.40, sub:0, taper:1.10, blank:true }
];
var RUNE_BY_K = {};
for (var ri = 0; ri < RUNES.length; ri++) RUNE_BY_K[RUNES[ri].k] = RUNES[ri];

/* per-rune CHARACTER (how a branch ends + how sub-branches are placed) so runes
   "speak" by shape. tipc: taper|fork|up|blunt · rhy: alt|opp|base|tip|even.
   Defaults reflect each rune's nature; tunable per-rune in the Branch Composer. */
var RUNE_CHAR = {
  fehu:{tipc:'fork',rhy:'alt'},      uruz:{tipc:'blunt',rhy:'base'},   thurisaz:{tipc:'up',rhy:'base'},
  ansuz:{tipc:'fork',rhy:'even'},    raidho:{tipc:'taper',rhy:'even'}, kenaz:{tipc:'up',rhy:'tip'},
  gebo:{tipc:'fork',rhy:'opp'},      wunjo:{tipc:'up',rhy:'tip'},      hagalaz:{tipc:'taper',rhy:'opp'},
  nauthiz:{tipc:'taper',rhy:'base'}, isa:{tipc:'taper',rhy:'base'},    jera:{tipc:'fork',rhy:'even'},
  eihwaz:{tipc:'up',rhy:'opp'},      perthro:{tipc:'fork',rhy:'opp'},  algiz:{tipc:'fork',rhy:'tip'},
  sowilo:{tipc:'up',rhy:'even'},     tiwaz:{tipc:'up',rhy:'base'},     berkano:{tipc:'fork',rhy:'alt'},
  ehwaz:{tipc:'fork',rhy:'opp'},     mannaz:{tipc:'fork',rhy:'opp'},   laguz:{tipc:'taper',rhy:'alt'},
  ingwaz:{tipc:'blunt',rhy:'tip'},   othala:{tipc:'fork',rhy:'base'},  dagaz:{tipc:'up',rhy:'opp'},
  odinn:{tipc:'taper',rhy:'alt'}
};

/* element archetype - the base gesture each element gives a branch */
var ELEMENT_ARCH = {
  fire:  { curveMul:0.7, taperMul:1.15, widthMul:0.95, elev:+0.15 },  /* sharp, straight, up */
  water: { curveMul:1.4, taperMul:0.90, widthMul:1.00, elev:-0.05 },  /* flowing, rounded */
  air:   { curveMul:1.1, taperMul:1.20, widthMul:0.80, elev:+0.10 },  /* light, thin, spreading */
  earth: { curveMul:0.8, taperMul:0.70, widthMul:1.25, elev:-0.15 },  /* sturdy, thick, low */
  shadow:{ curveMul:1.0, taperMul:1.05, widthMul:1.00, elev:-0.25 }   /* gnarled, downward */
};

var WORLD_ELEV = { asgard: 0.8, midgard: 0.0, hel: -0.8 };
var AETT_LABEL = { freya:'Freya (warm/up)', heimdall:'Heimdall (shadow/root)', tyr:'Tyr (flow)', none:'-- (Odinn, the unknown)' };

/* steering: shown so KUKY sees the effect of each optional field */
var AREA_LAT = {
  love_relationships:-0.75, family:-0.45, healing:-0.55, inner_growth:-0.65,
  spirituality:-0.20, crossroads:0.10, purpose:0.50, career:0.72
};
/* area -> PHYSICAL: sub-branch density (busy life areas branch more) */
var AREA_SUB = {
  love_relationships:-0.15, family:0.30, healing:-0.10, inner_growth:0.10,
  spirituality:0.20, crossroads:0.40, purpose:0.15, career:0.50
};
var INTENT_ELEV = { understanding_past:-0.6, right_now:0, decision_ahead:0.6 };
/* mood removed (KUKY: redundant, no feedback) -> only area + intention steer */

var ROLE = {
  main: { len:2.4, width:2.6, subLen:0.5 },
  sub:  { len:1.5, width:1.6, subLen:0.45 },
  twig: { len:1.0, width:1.0, subLen:0.4 }
};

/* ---- helpers ---- */
function clamp(v,a,b){ return v<a?a:(v>b?b:v); }
function lerp(a,b,t){ return a+(b-a)*t; }
function smooth(t){ t=clamp(t,0,1); return t*t*(3-2*t); }
function hashStr(s){ var h=2166136261>>>0; for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);} return h>>>0; }
function mulberry32(a){ return function(){ a|=0;a=(a+0x6D2B79F5)|0; var t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
function hexRgb(h){ return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]; }
function mixRgb(c1,c2,t){ return [lerp(c1[0],c2[0],t),lerp(c1[1],c2[1],t),lerp(c1[2],c2[2],t)]; }
function shadeRgb(c,f){ return [c[0]*f,c[1]*f,c[2]*f]; }
function paletteRgb(pal,t){ var s=[hexRgb(pal.dark),hexRgb(pal.mid),hexRgb(pal.base),hexRgb(pal.bright)]; t=clamp(t,0,1)*3; var i=Math.min(2,Math.floor(t)); return mixRgb(s[i],s[i+1],t-i); }
function barkRgb(t,el){ var b=paletteRgb(TREE_BASE,t); var p=ELEMENTS[el]; if(!p)return b; return mixRgb(b,paletteRgb(p,t),ELEMENT_TINT*Math.pow(clamp(t,0,1),1.3)); }
function leafRgb(el,t){ var b=paletteRgb(LEAF_BASE,t); var p=ELEMENTS[el]; if(!p||el==='shadow')return b; return mixRgb(b,hexRgb(p.base),0.18); }

function branchAngle(u, startAng, targetAng, arc, wob1, wob2, wobAmp, tipLift) {
  var bend = smooth(Math.min(1, u / 0.45));
  var ba = lerp(startAng, targetAng, bend) + arc * smooth(u) * 1.3
         + Math.sin(u * wob2 * Math.PI + wob1) * 0.10 * wobAmp * bend;
  var lift = tipLift * smooth((u - 0.55) / 0.45);
  return ba * (1 - lift) + (-Math.PI / 2) * lift;
}

function integrate(x0, y0, L, N, angFn, ct0, ct1, w0, w1, taper) {
  var pts=[], bx=x0, by=y0;
  for (var i=0;i<N;i++){
    var u=i/(N-1);
    if(i>0){ var ba=angFn(u); var ds=L/(N-1); bx+=Math.cos(ba)*ds; by+=Math.sin(ba)*ds; }
    pts.push({ x:bx, y:by, t:u, ct:lerp(ct0,ct1,u), w:lerp(w0,w1,Math.pow(u,1/(taper||1))) });
  }
  return pts;
}

/* per-rune SHAPE overrides (authored in the Branch Composer, shared by the tree).
   key -> { curve, sub, taper, wob, tip, lenMul }. Missing fields fall back to the
   rune's signature in RUNES. Both labs read this (seeded from localStorage). */
var RUNE_TUNE = {};
function setRuneTune(k, obj){ if(obj==null) delete RUNE_TUNE[k]; else RUNE_TUNE[k]=obj; }
function getRuneTune(k){ return RUNE_TUNE[k]||null; }
function exportTune(){ return JSON.stringify(RUNE_TUNE); }

/* build ONE branch from a spec. Returns paths + leaves + info. */
function buildBranch(spec, T) {
  var R = RUNE_BY_K[spec.rune] || RUNES[0];
  var arch = ELEMENT_ARCH[R.el] || ELEMENT_ARCH.earth;
  var role = ROLE[spec.role] || ROLE.twig;
  var rnd = mulberry32((hashStr(R.k) ^ (spec.seed||0)) >>> 0);
  /* effective per-rune shape (override or signature) */
  var tu = RUNE_TUNE[R.k] || {};
  var eCurve = (tu.curve!=null)?tu.curve:R.curve;
  var eSub   = (tu.sub!=null)?tu.sub:R.sub;
  var eTaper = (tu.taper!=null)?tu.taper:R.taper;
  var eWob   = (tu.wob!=null)?tu.wob:1;
  var eTip   = (tu.tip!=null)?tu.tip:1;
  var eLen   = (tu.lenMul!=null)?tu.lenMul:1;
  var rc = RUNE_CHAR[R.k] || {};
  var eTipc = (tu.tipc!=null)?tu.tipc:(rc.tipc||'taper');   /* tip ending: taper|fork|up|blunt */
  var eRhy  = (tu.rhy!=null)?tu.rhy:(rc.rhy||'alt');         /* sub rhythm: alt|opp|base|tip|even */

  /* intrinsic elevation: world + element. steering nudges it. */
  var elev = (WORLD_ELEV[R.world]||0) + arch.elev;
  var lat = 0, wobBoost = 0;
  var ss = (T.steer != null) ? T.steer : 1;
  if (spec.area && AREA_LAT[spec.area] != null) lat += AREA_LAT[spec.area] * ss;
  if (spec.intention && INTENT_ELEV[spec.intention] != null) elev += INTENT_ELEV[spec.intention] * ss;
  elev = clamp(elev, -1, 1);

  /* steering -> PHYSICAL traits (not just tilt): intention=length+reach+gnarl, area=density */
  var sLen=1, sSub=1, sGnarl=0, sTip=1;
  if (spec.intention==='decision_ahead') { sLen += 0.30*ss; sTip += 0.4*ss; }
  else if (spec.intention==='understanding_past') { sLen -= 0.22*ss; sTip -= 0.3*ss; sGnarl += 0.4*ss; }
  if (spec.area && AREA_SUB[spec.area]!=null) sSub *= (1 + AREA_SUB[spec.area]*ss);
  sLen = clamp(sLen,0.5,1.6); sSub = clamp(sSub,0.3,2.0); sTip = clamp(sTip,0.4,1.8);
  var elevN = (elev + 1) / 2;                 /* 0 low .. 1 high */

  /* base origin + direction. side from lateral (or seeded).
     spec.baseAng / spec.ox / spec.oy let a composer place + aim the branch
     (default null -> identical to standalone behaviour). */
  var base = (spec.baseAng != null) ? spec.baseAng : -Math.PI / 2;   /* launch direction */
  /* spec.dev = explicit signed bend from base: the limb STARTS along base
     (parent tangent) and bends to base+dev -> smooth emergence, no sharp join.
     default null = elev/side-driven theta0 (identical to before). */
  var side = (spec.dev != null) ? (spec.dev >= 0 ? 1 : -1)
           : ((lat !== 0) ? (lat > 0 ? 1 : -1) : (rnd() < 0.5 ? -1 : 1));
  var openBase = lerp(1.15, 0.30, elevN);     /* low elev = reaches out, high = up */
  var theta0 = (spec.dev != null) ? (base + spec.dev)
             : (base + side * (openBase * (0.55 + Math.abs(lat) * 0.6)));
  var arc = side * arch.curveMul * eCurve * T.curve * 1.6;
  var wob1 = rnd() * 6.283, wob2 = 1.3 + rnd() * 1.8;
  var wobAmp = (T.wobble * (0.7 + wobBoost) + sGnarl) * eWob;
  var tipLift = T.tipLift * eTip * sTip;
  if (eTipc==='up') tipLift *= 1.8;                          /* upturned tip */

  var L = T.length * role.len * eLen * sLen * (1 + (rnd() - 0.5) * 2 * T.jitter);
  var w0 = T.width * role.width * arch.widthMul;
  var w1 = (eTipc==='blunt') ? Math.max(0.6, w0*0.40) : Math.max(0.5, w0*0.14);  /* blunt = thick stop */
  var taper = eTaper * arch.taperMul;

  var ox = (spec.ox != null) ? spec.ox : T.cx, oy = (spec.oy != null) ? spec.oy : T.baseY;
  /* optional twist (spiral grain) -> default 0 = identical to before */
  var twist = (spec.twist != null) ? spec.twist : 0;
  var twPh = rnd() * 6.283;
  var pts = integrate(ox, oy, L, 30,
    function(u){ var a = branchAngle(u, base, theta0, arc, wob1, wob2, wobAmp, tipLift);
                 return a + twist * Math.sin(u * 2.0 * Math.PI + twPh) * smooth(u); },
    0.45, 1.0, w0, w1, taper);

  var paths = [{ pts: pts }];

  /* sub-branches: count from rune signature, scaled by subScale, placed
     along the LENGTH (not piled at the tip) */
  var subN = Math.round(eSub * T.subScale * sSub);
  for (var s = 0; s < subN; s++) {
    var fr = (subN<=1) ? 0.55 : (s/(subN-1));   /* 0..1 along the branch */
    var fu, fSide=(s%2===0)?side:-side;
    if (eRhy==='base')      fu = 0.28 + 0.30*fr;                 /* clustered low */
    else if (eRhy==='tip')  fu = 0.55 + 0.40*fr;                 /* clustered high */
    else if (eRhy==='even') fu = 0.28 + 0.62*fr;                 /* evenly spread */
    else if (eRhy==='opp') { var pr=Math.floor(s/2), np=Math.max(1,Math.ceil(subN/2)-1); fu = 0.40 + 0.44*(pr/np); }  /* opposite pairs */
    else                    fu = (subN===1)?0.55:(0.42 + 0.34*fr);  /* alt (default) */
    var fi = Math.max(1, Math.min(pts.length - 2, Math.round(fu * (pts.length - 1))));
    var fp = pts[fi], fq = pts[fi - 1];
    var fAng = Math.atan2(fp.y - fq.y, fp.x - fq.x);
    var fw1 = rnd() * 6.283, fw2 = 1.4 + rnd() * 1.6;
    var tAng = fAng + fSide * (0.45 + 0.3 * rnd());
    paths.push({ pts: integrate(fp.x, fp.y, L * role.subLen, 16,
      function(u){ return branchAngle(u, fAng, tAng, fSide * arch.curveMul * eCurve * T.curve, fw1, fw2, wobAmp, tipLift*0.8); },
      fp.ct, 1.0, fp.w * 0.72, Math.max(0.4, fp.w * 0.12), taper) });
  }

  /* tip = FORK: split the very end into a Y (visible rune signature) */
  if (eTipc === 'fork' && pts.length > 3) {
    var tp = pts[pts.length - 1], tq = pts[pts.length - 3];
    var fang = Math.atan2(tp.y - tq.y, tp.x - tq.x), fsk = rnd();
    [-1, 1].forEach(function (sd) {
      paths.push({ pts: integrate(tp.x, tp.y, L * role.subLen * 0.55, 11,
        function(u){ return branchAngle(u, fang, fang + sd*(0.42+0.22*fsk), sd*arch.curveMul*eCurve*T.curve*0.6, rnd()*6.283, 1.5, wobAmp, tipLift*0.8); },
        tp.ct, 1.0, Math.max(0.5, tp.w*0.95), Math.max(0.3, tp.w*0.22), taper) });
    });
  }

  /* leaves on all path ends */
  var leaves = [];
  if (T.leaf > 0) {
    for (var pi = 0; pi < paths.length; pi++) {
      var pp = paths[pi].pts;
      var cnt = Math.round((3 + Math.floor(rnd() * 4)) * T.leaf);
      for (var c = 0; c < cnt; c++) {
        var lt = 0.45 + 0.55 * rnd();
        var idx = Math.min(pp.length - 1, Math.round(lt * (pp.length - 1)));
        var q = pp[idx];
        leaves.push({ x:q.x+(rnd()-0.5)*8, y:q.y+(rnd()-0.5)*8, size:3+rnd()*3, rot:rnd()*6.283, el:R.el });
      }
    }
  }

  return {
    paths: paths, leaves: leaves,
    info: { rune:R, aett:R.aett, aettLabel:AETT_LABEL[R.aett], world:R.world, el:R.el,
            elev:elev, axis:(elev<-0.33?'urd (root)':(elev>0.33?'skuld (crown)':'verdandi (mid)')) }
  };
}

global.RunarBranch = {
  RUNES: RUNES, ELEMENTS: ELEMENTS, TREE_BASE: TREE_BASE,
  buildBranch: buildBranch,
  setRuneTune: setRuneTune, getRuneTune: getRuneTune, exportTune: exportTune, RUNE_TUNE: RUNE_TUNE, RUNE_CHAR: RUNE_CHAR,
  barkRgb: barkRgb, leafRgb: leafRgb, mixRgb: mixRgb, shadeRgb: shadeRgb, hexRgb: hexRgb,
  clamp: clamp, lerp: lerp
};
})(typeof window !== 'undefined' ? window : globalThis);
"""

HTML = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>RUNAR - Branch Composer</title>
<style>
  :root { --bg:#0a0a0f; --card:#11111a; --border:#2a2a3a; --gold:#FFBF00; --dim:#7a7570; --text:#d4cfc8; }
  * { box-sizing:border-box; margin:0; padding:0; }
  body { background:var(--bg); color:var(--text); font-family:Georgia, serif; min-height:100vh; }
  .wrap { max-width:1040px; margin:0 auto; padding:20px 14px 60px; }
  h1 { font-size:1.0em; letter-spacing:.25em; color:var(--gold); text-align:center; padding:14px 0 4px; }
  .sub { text-align:center; font-size:.7em; letter-spacing:.15em; color:var(--dim); margin-bottom:16px; }
  .cols { display:flex; gap:16px; flex-wrap:wrap; justify-content:center; }
  #stage { width:460px; height:560px; background:radial-gradient(ellipse at 50% 70%, #11131c 0%, #0a0a0f 75%);
           border:1px solid var(--border); border-radius:6px; overflow:hidden; flex:0 0 auto; position:sticky; top:12px; }
  .panel { width:330px; flex:0 0 auto; }
  .card { background:var(--card); border:1px solid var(--border); border-radius:4px; padding:14px; margin-bottom:12px; }
  .lbl { font-size:.62em; letter-spacing:.2em; color:var(--dim); margin-bottom:8px; }
  select, input[type=range] { width:100%; accent-color:var(--gold); }
  select { background:#0d0d16; border:1px solid var(--border); color:var(--text); font-family:inherit; font-size:.8em; padding:6px; border-radius:3px; }
  .row2 { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .runebtns { display:grid; grid-template-columns:repeat(5,1fr); gap:4px; }
  .rb { background:#16161f; border:1px solid var(--border); color:var(--text); font-size:1.1em; padding:6px 0; cursor:pointer; border-radius:3px; text-align:center; }
  .rb:hover { border-color:var(--gold-dim,#7a6530); }
  .rb.on { border-color:var(--gold); color:var(--gold); background:#1e1c10; }
  .seg { display:flex; gap:5px; }
  .seg button { flex:1; background:none; border:1px solid var(--border); color:var(--dim); font-family:inherit; font-size:.68em; padding:6px; cursor:pointer; border-radius:3px; letter-spacing:.06em; }
  .seg button.on { border-color:var(--gold); color:var(--gold); }
  .info { font-size:.74em; line-height:1.7; }
  .info b { color:var(--gold); font-weight:normal; }
  .tune { display:grid; grid-template-columns:96px 1fr 40px; gap:4px 8px; align-items:center; }
  .tune label { font-size:.66em; color:var(--dim); }
  .tune output { font-size:.66em; color:var(--text); text-align:right; font-variant-numeric:tabular-nums; }
</style>
</head>
<body>
<div style="display:flex;gap:14px;padding:6px 12px;background:#0d0d16;border-bottom:1px solid #2a2a3a;font-size:.72em;letter-spacing:.08em;flex-wrap:wrap;font-family:Georgia,serif">
<a href="../tree-lab-index.html" style="color:#7a7570;text-decoration:none">&#9670; labs</a>
<a href="../tree-lab-branch-composer/branch-composer.html" style="color:#FFBF00;text-decoration:none">vetev</a>
<a href="../tree-lab-trunk-composer/trunk-composer.html" style="color:#7a7570;text-decoration:none">kmen</a>
<a href="../tree-lab-crown-composer/crown-composer.html" style="color:#7a7570;text-decoration:none">koruna</a>
</div>
<div class="wrap">
  <h1>BRANCH COMPOSER</h1>
  <div class="sub">jedna vetev &middot; tvar = vlastnosti + ladeni &middot; internal</div>
  <div class="cols">
    <div id="stage"></div>
    <div class="panel">

      <div class="card">
        <div class="lbl">VIEW</div>
        <div class="seg" id="view-seg">
          <button data-v="single" class="on">single (ladit)</button>
          <button data-v="grid">grid (vsech 25)</button>
        </div>
      </div>

      <div class="card" id="rune-card">
        <div class="lbl">RUNE</div>
        <div class="runebtns" id="runebtns"></div>
      </div>

      <div class="card" id="role-card">
        <div class="lbl">ROLE</div>
        <div class="seg" id="role-seg">
          <button data-r="main" class="on">hlavni</button>
          <button data-r="sub">sub</button>
          <button data-r="twig">vyhon</button>
        </div>
      </div>

      <div class="card" id="steer-card">
        <div class="lbl">STEERING (volitelne)</div>
        <div class="row2">
          <select id="area"></select>
          <select id="intention"></select>
        </div>
        <div class="row2" style="margin-top:8px">
          <select id="seedsel"></select>
        </div>
      </div>

      <div class="card" id="info-card">
        <div class="lbl">INTRINSIC (z runy)</div>
        <div class="info" id="info"></div>
      </div>

      <div class="card" id="shape-card">
        <div class="lbl">TVAR TETO RUNY (uklada se k rune)</div>
        <div class="tune" id="shape"></div>
        <div class="seg" style="margin-top:8px">
          <button id="cyc-tipc">spicka: taper</button>
          <button id="cyc-rhy">rytmus: alt</button>
        </div>
        <div class="seg" style="margin-top:8px">
          <button id="shape-reset">reset runy</button>
          <button id="shape-resetall">RESET VSE</button>
          <button id="shape-export">EXPORT vsech</button>
        </div>
      </div>

      <div class="card" id="global-card">
        <div class="lbl">GLOBAL (nahled)</div>
        <div class="tune" id="tune"></div>
      </div>

    </div>
  </div>
</div>

<script src="runar-branch.js?v=BUILD_TOKEN"></script>
<script>
(function () {
  var B = window.RunarBranch;
  var stage = document.getElementById('stage');
  var cv = document.createElement('canvas');
  cv.style.width='100%'; cv.style.height='100%'; cv.style.display='block';
  stage.appendChild(cv);
  var W=460, H=560, dpr=window.devicePixelRatio||1;
  cv.width=W*dpr; cv.height=H*dpr;
  var ctx=cv.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0);

  var state = { view:'single', rune:'berkano', role:'main', area:'', intention:'', seed:1 };
  var T = { length:95, width:6.0, curve:1, wobble:0.5, subScale:1, tipLift:0.22,
            jitter:0.12, leaf:0, steer:1, cx:230, baseY:535 };
  /* per-rune shape store (shared with the tree via localStorage 'runeTune') */
  var RBYK={}; B.RUNES.forEach(function(r){RBYK[r.k]=r;});
  function effTune(k){ var r=RBYK[k]||{}, t=B.RUNE_TUNE[k]||{}, c=(B.RUNE_CHAR&&B.RUNE_CHAR[k])||{};
    return { curve:(t.curve!=null?t.curve:r.curve), taper:(t.taper!=null?t.taper:r.taper),
             sub:(t.sub!=null?t.sub:r.sub), wob:(t.wob!=null?t.wob:1), tip:(t.tip!=null?t.tip:1),
             lenMul:(t.lenMul!=null?t.lenMul:1),
             tipc:(t.tipc!=null?t.tipc:(c.tipc||'taper')), rhy:(t.rhy!=null?t.rhy:(c.rhy||'alt')) }; }
  function saveTune(){ try{ localStorage.setItem('runeTune', B.exportTune()); }catch(e){} }
  function loadTuneLS(){ try{ var o=JSON.parse(localStorage.getItem('runeTune')||'{}'); for(var k in o) B.setRuneTune(k,o[k]); }catch(e){} }
  loadTuneLS();

  /* rune buttons */
  var rb = document.getElementById('runebtns');
  B.RUNES.forEach(function (r) {
    var b=document.createElement('button'); b.className='rb'; b.textContent=r.g; b.title=r.name;
    b.dataset.k=r.k;
    if(r.k===state.rune) b.classList.add('on');
    b.addEventListener('click', function(){
      state.rune=r.k;
      document.querySelectorAll('.rb').forEach(function(x){x.classList.toggle('on',x.dataset.k===r.k);});
      loadShape(); draw();
    });
    rb.appendChild(b);
  });

  function fill(sel, items, blankLabel) {
    var s=document.getElementById(sel);
    var o=document.createElement('option'); o.value=''; o.textContent=blankLabel; s.appendChild(o);
    items.forEach(function(it){ var x=document.createElement('option'); x.value=it[0]; x.textContent=it[1]; s.appendChild(x); });
    s.addEventListener('change', function(){ state[sel==='seedsel'?'seed':sel]= (sel==='seedsel'? parseInt(s.value||'1',10): s.value); draw(); });
  }
  fill('area', [['love_relationships','Love'],['family','Family'],['healing','Healing'],['inner_growth','Inner Growth'],['spirituality','Spirituality'],['crossroads','Crossroads'],['purpose','Purpose'],['career','Career']], 'area: --');
  fill('intention', [['understanding_past','Understanding past'],['right_now','Right now'],['decision_ahead','Decision ahead']], 'intention: --');
  var ss=document.getElementById('seedsel');
  ['1','2','3','4','5'].forEach(function(v){ var o=document.createElement('option'); o.value=v; o.textContent='seed '+v; ss.appendChild(o); });
  ss.addEventListener('change', function(){ state.seed=parseInt(ss.value,10); draw(); });

  document.getElementById('role-seg').addEventListener('click', function(e){
    if(e.target.dataset.r){ state.role=e.target.dataset.r;
      document.querySelectorAll('#role-seg button').forEach(function(x){x.classList.toggle('on',x.dataset.r===state.role);});
      draw(); }
  });
  document.getElementById('view-seg').addEventListener('click', function(e){
    if(e.target.dataset.v){ state.view=e.target.dataset.v;
      document.querySelectorAll('#view-seg button').forEach(function(x){x.classList.toggle('on',x.dataset.v===state.view);});
      ['rune-card','role-card','steer-card','info-card','shape-card','global-card'].forEach(function(id){
        document.getElementById(id).style.display = (state.view==='grid' && id!=='role-card') ? 'none':'block';
      });
      draw(); }
  });

  var TUNE_DEF = [
    ['length',  10, 90,  1,    'delka (nahled)'],
    ['width',   1,  12,  0.2,  'sila (nahled)'],
    ['jitter',  0,  0.4, 0.01, 'delka jitter'],
    ['steer',   0,  2,   0.05, 'sila smerovani'],
    ['leaf',    0,  1.5, 0.1,  'listy']
  ];
  var tuneEl=document.getElementById('tune');
  TUNE_DEF.forEach(function(d){
    var lab=document.createElement('label'); lab.textContent=d[4];
    var inp=document.createElement('input'); inp.type='range'; inp.min=d[1]; inp.max=d[2]; inp.step=d[3]; inp.value=T[d[0]];
    var out=document.createElement('output'); out.textContent=T[d[0]];
    inp.addEventListener('input', function(){ T[d[0]]=parseFloat(inp.value); out.textContent=inp.value; draw(); });
    tuneEl.appendChild(lab); tuneEl.appendChild(inp); tuneEl.appendChild(out);
  });

  /* PER-RUNE SHAPE sliders -> edit RUNE_TUNE[selected rune], saved to localStorage */
  var SHAPE_DEF = [
    ['curve', 0,1.5,0.05,'gesto (ohyb)'],
    ['taper', 0.5,1.6,0.05,'taper'],
    ['sub',   0,3,1,'odbocky (pocet)'],
    ['wob',   0,2,0.05,'wobble x'],
    ['tip',   0,2,0.05,'tip lift x'],
    ['lenMul',0.5,1.8,0.05,'delka x']
  ];
  var shapeEl=document.getElementById('shape'), shapeInp={}, shapeOut={};
  SHAPE_DEF.forEach(function(d){
    var lab=document.createElement('label'); lab.textContent=d[4];
    var inp=document.createElement('input'); inp.type='range'; inp.min=d[1]; inp.max=d[2]; inp.step=d[3];
    var out=document.createElement('output');
    inp.addEventListener('input', function(){ out.textContent=inp.value; saveShapeFromSliders(); draw(); });
    shapeInp[d[0]]=inp; shapeOut[d[0]]=out;
    shapeEl.appendChild(lab); shapeEl.appendChild(inp); shapeEl.appendChild(out);
  });
  function loadShape(){ var t=effTune(state.rune);
    SHAPE_DEF.forEach(function(d){ shapeInp[d[0]].value=t[d[0]]; shapeOut[d[0]].textContent=t[d[0]]; });
    document.getElementById('cyc-tipc').textContent='spicka: '+t.tipc;
    document.getElementById('cyc-rhy').textContent='rytmus: '+t.rhy; }
  function saveShapeFromSliders(){ var o=B.getRuneTune(state.rune)||{};
    SHAPE_DEF.forEach(function(d){ o[d[0]]=parseFloat(shapeInp[d[0]].value); });
    B.setRuneTune(state.rune, o); saveTune(); }
  var TIPC=['taper','fork','up','blunt'], RHY=['alt','opp','base','tip','even'];
  function cycField(f, arr){ var o=B.getRuneTune(state.rune)||{}; var cur=effTune(state.rune)[f];
    o[f]=arr[(arr.indexOf(cur)+1)%arr.length]; B.setRuneTune(state.rune,o); saveTune(); loadShape(); draw(); }
  document.getElementById('cyc-tipc').addEventListener('click', function(){ cycField('tipc',TIPC); });
  document.getElementById('cyc-rhy').addEventListener('click', function(){ cycField('rhy',RHY); });
  document.getElementById('shape-reset').addEventListener('click', function(){ B.setRuneTune(state.rune,null); saveTune(); loadShape(); draw(); });
  document.getElementById('shape-resetall').addEventListener('click', function(){
    if(!window.confirm('Reset VSECH 25 run na vychozi tvar?')) return;
    Object.keys(B.RUNE_TUNE).forEach(function(k){ B.setRuneTune(k,null); });
    try{ localStorage.removeItem('runeTune'); }catch(e){}
    loadShape(); draw();
  });
  document.getElementById('shape-export').addEventListener('click', function(){ window.prompt('Zkopiruj a posli mi (RUNE_TUNE):', B.exportTune()); });
  loadShape();

  function paintBranch(geom, ox, oy, scale, depthDim) {
    var segs=[];
    for(var pi=0;pi<geom.paths.length;pi++){
      var pts=geom.paths[pi].pts;
      for(var j=0;j<pts.length-1;j++){
        var a=pts[j], b=pts[j+1];
        var cm=(a.ct+b.ct)/2;
        var rgb=B.barkRgb(cm, geom.info.el);
        if(depthDim) rgb=B.shadeRgb(rgb, depthDim);
        segs.push({a:a,b:b,rgb:rgb});
      }
    }
    var LX=-0.5, LY=-0.866;
    function quad(a,b,scaleW,extra,offx,offy,rgb,alpha,nx,ny){
      var wa=a.w*scaleW+extra, wb=b.w*scaleW+extra;
      ctx.beginPath();
      ctx.moveTo(ox+a.x*scale+offx-nx*wa/2, oy+a.y*scale+offy-ny*wa/2);
      ctx.lineTo(ox+b.x*scale+offx-nx*wb/2, oy+b.y*scale+offy-ny*wb/2);
      ctx.lineTo(ox+b.x*scale+offx+nx*wb/2, oy+b.y*scale+offy+ny*wb/2);
      ctx.lineTo(ox+a.x*scale+offx+nx*wa/2, oy+a.y*scale+offy+ny*wa/2);
      ctx.closePath();
      ctx.fillStyle='rgba('+(rgb[0]|0)+','+(rgb[1]|0)+','+(rgb[2]|0)+','+alpha+')';
      ctx.fill();
    }
    for(var k=0;k<segs.length;k++){
      var s=segs[k];
      var dx=s.b.x-s.a.x, dy=s.b.y-s.a.y; var len=Math.sqrt(dx*dx+dy*dy)||1;
      var nx=-dy/len, ny=dx/len; var wAvg=(s.a.w+s.b.w)/2;
      if(wAvg>0.9) quad(s.a,s.b,scale,1.4,0,0,B.shadeRgb(s.rgb,0.38),0.85,nx,ny);
      quad(s.a,s.b,scale,0,0,0,s.rgb,1,nx,ny);
      if(wAvg>1.4){ var sgn=(nx*LX+ny*LY)>0?1:-1; var hx=nx*sgn*wAvg*scale*0.24, hy=ny*sgn*wAvg*scale*0.24;
        quad(s.a,s.b,scale*0.26,0,hx,hy,B.mixRgb(s.rgb,[205,200,188],0.55),0.55,nx,ny); }
    }
    for(var li=0; li<geom.leaves.length; li++){
      var lf=geom.leaves[li]; var rgb=B.leafRgb(lf.el,0.55);
      ctx.save(); ctx.translate(ox+lf.x*scale, oy+lf.y*scale); ctx.rotate(lf.rot);
      ctx.beginPath(); ctx.ellipse(0,0,lf.size,lf.size*0.45,0,0,6.283);
      ctx.fillStyle='rgba('+(rgb[0]|0)+','+(rgb[1]|0)+','+(rgb[2]|0)+',0.85)'; ctx.fill(); ctx.restore();
    }
  }

  function drawSingle(){
    ctx.clearRect(0,0,W,H);
    /* stub for context */
    ctx.strokeStyle='rgba(135,132,120,0.5)'; ctx.lineWidth=8; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(T.cx,548); ctx.lineTo(T.cx,T.baseY); ctx.stroke();
    var g=B.buildBranch({rune:state.rune, role:state.role, area:state.area, intention:state.intention, seed:state.seed}, T);
    paintBranch(g, 0, 0, 1, null);
    var i=g.info;
    document.getElementById('info').innerHTML =
      'rune: <b>'+i.rune.name+'</b> '+i.rune.g+'<br>'+
      'aett: <b>'+i.aettLabel+'</b><br>'+
      'world: <b>'+i.world+'</b> &rarr; element: <b>'+i.el+'</b><br>'+
      'osa (vyska): <b>'+i.axis+'</b>';
  }

  function drawGrid(){
    ctx.clearRect(0,0,W,H);
    var cols=5, n=B.RUNES.length;
    var cw=W/cols, chh=H/Math.ceil(n/cols);
    for(var idx=0; idx<n; idx++){
      var r=B.RUNES[idx];
      var col=idx%cols, row=Math.floor(idx/cols);
      var ox=col*cw, oy=row*chh;
      var TT={}; for(var key in T) TT[key]=T[key];
      TT.length=Math.min(T.length, chh*0.42); TT.width=T.width*0.7; TT.cx=0; TT.baseY=0; TT.leaf=0;
      var g=B.buildBranch({rune:r.k, role:'twig', area:'', intention:'', seed:state.seed}, TT);
      paintBranch(g, ox+cw/2, oy+chh*0.78, 1, null);
      ctx.fillStyle='rgba(160,156,144,0.8)'; ctx.font='9px Georgia'; ctx.textAlign='center';
      ctx.fillText(r.g+' '+r.name, ox+cw/2, oy+chh-6);
    }
  }

  function draw(){ if(state.view==='single') drawSingle(); else drawGrid(); }
  window._draw=draw;
  draw();
})();
</script>
</body>
</html>
"""

HTML = HTML.replace('BUILD_TOKEN', str(int(time.time())))

for name, content in [('runar-branch.js', MODEL), ('branch-composer.html', HTML)]:
    p = os.path.join(DST, name)
    with io.open(p, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)
    print('written', p, len(content), 'chars')
