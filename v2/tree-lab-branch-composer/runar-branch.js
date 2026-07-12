/* ============================================================
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
