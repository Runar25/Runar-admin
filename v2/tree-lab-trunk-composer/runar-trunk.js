/* ============================================================
   RUNAR - Trunk shape engine v3 (Composer) - UNIFIED LIMB ENGINE
   Strand = one continuous limb root->trunk->top. Trunk = wide
   overlapping strands (one body via overlap + depth). Roots = the
   same strands fanning out below + sub-roots. One engine for all.
   ============================================================ */
(function (global) {
'use strict';

var TREE_BASE = { dark:'#23211b', mid:'#54514a', base:'#878478', bright:'#c2bfb2' };
var ELEMENTS = {
  fire:{ dark:'#4A1A08', mid:'#A03510', base:'#C84B1A', bright:'#FF6B35' },
  water:{ dark:'#081A4A', mid:'#1255A0', base:'#1A6BC8', bright:'#35AAFF' },
  air:{ dark:'#1A4A08', mid:'#50901A', base:'#6BA81A', bright:'#AAFF35' },
  earth:{ dark:'#2A1A08', mid:'#6A5010', base:'#8B6B1A', bright:'#D4AA35' },
  shadow:{ dark:'#15151c', mid:'#2a2a38', base:'#3c3c50', bright:'#56566e' }
};
var ELEMENT_TINT = 0.18;

var RUNES = [
  { k:'fehu', name:'Fehu', g:'ᚠ', el:'fire',  curve:0.35, taper:1.00 },
  { k:'uruz', name:'Uruz', g:'ᚢ', el:'earth', curve:0.18, taper:0.70 },
  { k:'thurisaz', name:'Thurisaz', g:'ᚦ', el:'fire', curve:0.12, taper:1.10 },
  { k:'ansuz', name:'Ansuz', g:'ᚨ', el:'air', curve:0.30, taper:1.00 },
  { k:'raidho', name:'Raidho', g:'ᚱ', el:'air', curve:0.42, taper:1.00 },
  { k:'kenaz', name:'Kenaz', g:'ᚲ', el:'fire', curve:0.20, taper:1.05 },
  { k:'gebo', name:'Gebo', g:'ᚷ', el:'water', curve:0.30, taper:1.00 },
  { k:'wunjo', name:'Wunjo', g:'ᚹ', el:'air', curve:0.45, taper:1.10 },
  { k:'hagalaz', name:'Hagalaz', g:'ᚺ', el:'shadow', curve:0.18, taper:1.05 },
  { k:'nauthiz', name:'Nauthiz', g:'ᚾ', el:'earth', curve:0.12, taper:1.00 },
  { k:'isa', name:'Isa', g:'ᛁ', el:'shadow', curve:0.04, taper:1.25 },
  { k:'jera', name:'Jera', g:'ᛃ', el:'earth', curve:0.50, taper:0.95 },
  { k:'eihwaz', name:'Eihwaz', g:'ᛇ', el:'earth', curve:0.20, taper:1.00 },
  { k:'perthro', name:'Perthro', g:'ᛈ', el:'water', curve:0.50, taper:1.00 },
  { k:'algiz', name:'Algiz', g:'ᛉ', el:'air', curve:0.22, taper:1.00 },
  { k:'sowilo', name:'Sowilo', g:'ᛋ', el:'fire', curve:0.55, taper:1.00 },
  { k:'tiwaz', name:'Tiwaz', g:'ᛏ', el:'fire', curve:0.08, taper:1.10 },
  { k:'berkano', name:'Berkano', g:'ᛒ', el:'water', curve:0.65, taper:0.90 },
  { k:'ehwaz', name:'Ehwaz', g:'ᛖ', el:'air', curve:0.30, taper:0.95 },
  { k:'mannaz', name:'Mannaz', g:'ᛗ', el:'air', curve:0.30, taper:1.00 },
  { k:'laguz', name:'Laguz', g:'ᛚ', el:'water', curve:0.58, taper:1.05 },
  { k:'ingwaz', name:'Ingwaz', g:'ᛜ', el:'water', curve:0.60, taper:0.95 },
  { k:'othala', name:'Othala', g:'ᛟ', el:'earth', curve:0.40, taper:0.92 },
  { k:'dagaz', name:'Dagaz', g:'ᛞ', el:'fire', curve:0.45, taper:1.00 },
  { k:'odinn', name:'Odinn', g:'◇', el:'shadow', curve:0.40, taper:1.05, blank:true }
];
var RUNE_BY_K = {}; for (var ri=0; ri<RUNES.length; ri++) RUNE_BY_K[RUNES[ri].k]=RUNES[ri];

var ELEMENT_ARCH = {
  fire:{ lean:+0.50, curveMul:0.8, widthMul:0.92 },
  air:{ lean:+0.28, curveMul:1.0, widthMul:0.82 },
  water:{ lean:-0.28, curveMul:1.4, widthMul:1.00 },
  earth:{ lean:-0.50, curveMul:0.7, widthMul:1.25 },
  shadow:{ lean:-0.40, curveMul:1.0, widthMul:1.05 }
};

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

/* integrate a tapered limb (root tail or sub-root) */
function limb(x0,y0,ang0,ang1,L,N,curve,w1arg,w2arg,wobAmp,ct0,ct1,w0,w1,taper,d0,d1){
  var pts=[], bx=x0, by=y0;
  for(var i=0;i<N;i++){
    var u=i/(N-1);
    if(i>0){
      var bend=smooth(Math.min(1,u/0.4));
      var ba=lerp(ang0,ang1,bend)+curve*smooth(u)*1.2+Math.sin(u*w2arg*Math.PI+w1arg)*0.10*wobAmp*bend;
      var ds=L/(N-1); bx+=Math.cos(ba)*ds; by+=Math.sin(ba)*ds;
    }
    pts.push({x:bx,y:by,t:u,ct:lerp(ct0,ct1,u),depth:lerp(d0,d1,smooth(u*2)),w:lerp(w0,w1,Math.pow(u,1/(taper||1)))});
  }
  return pts;
}

var LANE = [0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6, 7, -7];

function buildTrunk(spec, T) {
  var R = RUNE_BY_K[spec.rune] || RUNES[0];
  var arch = ELEMENT_ARCH[R.el] || ELEMENT_ARCH.earth;
  var dob = spec.dob || { d:1, m:1, y:1990 };
  var dobSeed = hashStr(''+dob.d+'-'+dob.m+'-'+dob.y);

  var w=T.w, cx=T.cx, groundY=T.groundY, topY=T.topY;
  var perRuneLean = arch.lean + (((hashStr(R.k)%100)/100)-0.5)*0.2;
  var dr = mulberry32((dobSeed ^ hashStr(R.k))>>>0);
  var leanAmt = clamp(perRuneLean * T.lean * (0.6 + 0.8*dr()), -0.45, 0.45);  /* lean never exceeds 0.45 for any life rune */
  var wobAmt = R.curve * arch.curveMul * T.wobble;
  var wobFreq = T.wobFreq * (0.85 + 0.3*dr());
  var wobPhase = dr()*6.283 + dobSeed*0.0007;
  /* per-element age: every strand has a birth day and grows from day 1
     in all dimensions (logarithmic, never fully stops). New strands
     start small among older big ones -> visual variety. */
  var every = Math.max(20, T.strandEvery||150);
  var mature = Math.max(30, T.matureDays||365);
  var minSize = (T.minSize!=null)?T.minSize:0.32;
  var treeAge = (T.treeAge!=null)?T.treeAge:365;
  /* thickness grows CONTINUOUSLY (log, never stops -> old always thicker);
     length saturates near maturity (a root/limb has a natural reach). */
  var thickK = (1 - minSize) / Math.log(3);
  function ageThick(ad){ if(ad<=0) return 0; return minSize + thickK*Math.log(1 + ad/(mature*0.5)); }
  function ageLen(ad){ if(ad<=0) return 0; var f=clamp(ad/mature,0,1); return 0.5 + 0.5*(1-Math.pow(1-f,1.7)); }
  var strandN = Math.min((T.strandMax||28), 3 + Math.max(0, Math.floor(treeAge/every)));  /* cap = perf/visual safety pri testovani */
  var baseW = T.thickness * arch.widthMul;          /* per-strand width at full age */
  var laneStep = baseW * T.bundleSpread;            /* < baseW => overlap => one body */
  var maxLane = 1; for (var li=0; li<strandN; li++) maxLane=Math.max(maxLane,Math.abs(LANE[li%LANE.length]));

  function center(h){ return cx + leanAmt*Math.sin(Math.PI*h)*w*0.16
                          + wobAmt*Math.sin(h*wobFreq*6.283+wobPhase)*Math.sin(Math.PI*h)*w*0.05; }

  /* base flare opens only after ~8 months (else it makes gaps in a young
     trunk with few thin strands) */
  var flareGate = clamp((treeAge - 240) / 180, 0, 1);
  var limbs = [];
  for (var s=0; s<strandN; s++) {
    var rnd = mulberry32((dobSeed ^ hashStr(R.k) ^ (s*0x9e37)) >>> 0);
    var lane = LANE[s % LANE.length] + (s>=LANE.length ? (rnd()-0.5) : 0);
    var laneX = lane * laneStep;
    var depthT = clamp(Math.abs(lane)/5, 0, 1);
    var strandDepth = lerp(0.65, -0.45, depthT);
    var twPhase = lane * 1.3 + (s%2)*0.7;             /* per-strand twist phase */

    /* this strand's individual age. Thickness grows forever, length saturates. */
    var bornDay = (s<3) ? 0 : (s-2)*every;
    var age = treeAge - bornDay;
    if (age <= 0) continue;
    var afc = clamp(age/mature, 0, 1);
    var sBaseW = baseW * ageThick(age);
    var sRootLen = T.rootLen * ageLen(age);

    /* TRUNK part: lane home + weave + TWIST that grows with this strand's
       age (young ~0.05, old -> T.twist max) -> spiral grain develops in time. */
    var twistAmt = lerp(0.05, T.twist, afc);
    /* old-tree RIB: 1-2 founding strands, after ~1.5 years, slowly push
       OUT + FORWARD in the lower trunk (root follows). */
    var proSel = (s<3) && ((((hashStr(R.k+'p'+s) ^ dobSeed) >>> 0) % 100) < 55);
    var proGate = proSel ? clamp((age - 540)/365, 0, 1) * T.protrude : 0;
    var proSide = (laneX >= 0) ? 1 : -1;
    var NT=40, trunkPts=[];
    var weavePh = rnd()*6.283;
    for (var j=0;j<NT;j++){
      var h=j/(NT-1);
      var weave = Math.sin(weavePh + h*1.6*6.283) * sBaseW*0.06;
      var tw = twistAmt * h * 6.283;
      var swirlX = twistAmt * laneStep * 1.1 * Math.sin(twPhase + tw);
      var swirlD = twistAmt * 0.6 * Math.cos(twPhase + tw);
      var fl = 1 + T.baseFlare * flareGate * Math.pow(1 - smooth(Math.min(1, h/0.5)), 1.6);  /* buttress from mid, opens ~8mo */
      var proF = proGate * (1 - smooth(Math.min(1, h/0.5)));   /* rib only in lower trunk */
      trunkPts.push({
        x: center(h) + laneX*fl + weave + swirlX + proSide*proF*baseW*2.0,  /* rib bulges to the side */
        y: lerp(groundY, topY, h),
        ct: lerp(0.46, 0.66, h),
        depth: clamp(strandDepth + Math.sin(weavePh+h*3)*0.05 + swirlD + proF*0.5, -0.95, 0.95),
        w: sBaseW * lerp(1.0, 0.46, smooth(h)) * (1 + proF*0.4)              /* old rib thicker */
      });
    }
    var baseX = trunkPts[0].x, baseDepth = trunkPts[0].depth;

    /* ROOT part: emerges naturally from the trunk base (same limb). Clean
       monotonic fan by lane (no crossing); staggered in DEPTH so there is
       room for all; younger roots stay flatter/shallower (near surface). */
    var rootDir = lane * 0.30 * T.rootFan + (rnd()-0.5)*0.06;
    var ang0 = Math.PI/2 + rootDir*0.35;
    var ang1 = Math.PI/2 + rootDir*lerp(0.55,1.0,afc) + (rnd()-0.5)*0.05;
    var rcurve = rootDir*0.28;                         /* gentler -> less crossing */
    var rL = sRootLen*(0.85+0.3*rnd());
    var rDepthEnd = clamp(strandDepth*0.4 + ((s%3)-1)*0.5, -0.9, 0.9); /* front/back stagger */
    var rootPts = limb(baseX, groundY, ang0, ang1, rL, 26, rcurve,
                       rnd()*6.283, 1.1+rnd()*1.0, T.wobble*0.5,
                       0.44, 0.20, sBaseW, 0.8, R.taper, baseDepth, rDepthEnd);

    /* ONE continuous limb: tip -> base -> top */
    var full=[];
    for (var ri2=rootPts.length-1; ri2>=1; ri2--) full.push(rootPts[ri2]);
    for (var ti=0; ti<trunkPts.length; ti++) full.push(trunkPts[ti]);
    limbs.push({ pts: full, depth: baseDepth });

    /* sub-root: continues OUTWARD same side (no cross-back), older roots only */
    if (afc > 0.4) {
      var fi = Math.round(0.55*(rootPts.length-1));
      var fp=rootPts[fi], fq=rootPts[fi-1];
      var fAng=Math.atan2(fp.y-fq.y, fp.x-fq.x);
      var sSide=(lane>=0?1:-1);
      var sub = limb(fp.x, fp.y, fAng, fAng+sSide*(0.32+0.18*rnd()), rL*0.45, 13,
                     sSide*0.12, rnd()*6.283, 1.1+rnd()*1.0, T.wobble*0.5, fp.ct, 0.2,
                     fp.w*0.7, 0.55, R.taper, fp.depth, fp.depth);
      limbs.push({ pts: sub, depth: fp.depth - 0.05 });
    }
  }

  var leanLabel = leanAmt>0.05?'doprava (outer)':(leanAmt<-0.05?'doleva (inner)':'primy (balance)');
  return { limbs: limbs, info:{ rune:R, el:R.el, lean:leanAmt, leanLabel:leanLabel,
           dobSeed:dobSeed, strandN:strandN, treeAge:Math.round(treeAge) } };
}

global.RunarTrunk = {
  RUNES:RUNES, ELEMENTS:ELEMENTS, TREE_BASE:TREE_BASE,
  buildTrunk:buildTrunk,
  barkRgb:barkRgb, mixRgb:mixRgb, shadeRgb:shadeRgb, hexRgb:hexRgb,
  clamp:clamp, lerp:lerp
};
})(typeof window !== 'undefined' ? window : globalThis);
