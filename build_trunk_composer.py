# -*- coding: utf-8 -*-
# Trunk Composer v3 (KUKY 2026-06-12): UNIFIED LIMB ENGINE.
# Each strand = ONE continuous limb: root tip (deep, fanned) -> base ->
# up through the trunk (tight, wide, OVERLAPPING -> one body) -> top stub.
# Same tapered-limb engine as branches/roots. The trunk reads as one mass
# via overlap + painterly depth; junction root<->trunk is automatic
# (same limb passing through). Base flares because strands fan into roots.
# Character = life rune + DOB fingerprint. Per CLAUDE.md paragraph 1.
import io, os

V2 = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'v2')
DST = os.path.join(V2, 'tree-lab-trunk-composer')
os.makedirs(DST, exist_ok=True)

MODEL = r"""/* ============================================================
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
"""

HTML = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>RUNAR - Trunk Composer</title>
<style>
  :root { --bg:#0a0a0f; --card:#11111a; --border:#2a2a3a; --gold:#FFBF00; --dim:#7a7570; --text:#d4cfc8; }
  * { box-sizing:border-box; margin:0; padding:0; }
  body { background:var(--bg); color:var(--text); font-family:Georgia, serif; min-height:100vh; }
  .wrap { max-width:1040px; margin:0 auto; padding:20px 14px 60px; }
  h1 { font-size:1.0em; letter-spacing:.25em; color:var(--gold); text-align:center; padding:14px 0 4px; }
  .sub { text-align:center; font-size:.7em; letter-spacing:.15em; color:var(--dim); margin-bottom:16px; }
  .cols { display:flex; gap:16px; flex-wrap:wrap; justify-content:center; }
  #stage { width:440px; height:620px; background:radial-gradient(ellipse at 50% 55%, #11131c 0%, #0a0a0f 75%);
           border:1px solid var(--border); border-radius:6px; overflow:hidden; flex:0 0 auto; position:sticky; top:12px; }
  .panel { width:330px; flex:0 0 auto; }
  .card { background:var(--card); border:1px solid var(--border); border-radius:4px; padding:14px; margin-bottom:12px; }
  .lbl { font-size:.62em; letter-spacing:.2em; color:var(--dim); margin-bottom:8px; }
  input[type=range], input[type=number] { width:100%; accent-color:var(--gold); }
  input[type=number] { background:#0d0d16; border:1px solid var(--border); color:var(--text); font-family:inherit; font-size:.8em; padding:6px; border-radius:3px; }
  .runebtns { display:grid; grid-template-columns:repeat(5,1fr); gap:4px; }
  .rb { background:#16161f; border:1px solid var(--border); color:var(--text); font-size:1.1em; padding:6px 0; cursor:pointer; border-radius:3px; text-align:center; }
  .rb.on { border-color:var(--gold); color:var(--gold); background:#1e1c10; }
  .dob { display:grid; grid-template-columns:1fr 1fr 1.4fr; gap:8px; }
  .info { font-size:.74em; line-height:1.7; } .info b { color:var(--gold); font-weight:normal; }
  .tune { display:grid; grid-template-columns:104px 1fr 40px; gap:4px 8px; align-items:center; }
  .tune label { font-size:.66em; color:var(--dim); } .tune output { font-size:.66em; color:var(--text); text-align:right; }
  .btnrow { display:flex; gap:6px; margin-top:8px; }
  .jb { background:none; border:1px solid var(--border); color:var(--dim); font-family:inherit; font-size:.68em; padding:5px 10px; cursor:pointer; border-radius:3px; }
  .jb:hover, .jb.on { border-color:var(--gold); color:var(--gold); }
</style>
</head>
<body>
<div style="display:flex;gap:14px;padding:6px 12px;background:#0d0d16;border-bottom:1px solid #2a2a3a;font-size:.72em;letter-spacing:.08em;flex-wrap:wrap;font-family:Georgia,serif">
<a href="../tree-lab-index.html" style="color:#7a7570;text-decoration:none">&#9670; labs</a>
<a href="../tree-lab-branch-composer/branch-composer.html" style="color:#7a7570;text-decoration:none">vetev</a>
<a href="../tree-lab-trunk-composer/trunk-composer.html" style="color:#FFBF00;text-decoration:none">kmen</a>
<a href="../tree-lab-crown-composer/crown-composer.html" style="color:#7a7570;text-decoration:none">koruna</a>
</div>
<div class="wrap">
  <h1>TRUNK COMPOSER</h1>
  <div class="sub">jeden limb engine &middot; pramen = koren-kmen-vetev &middot; internal</div>
  <div class="cols">
    <div id="stage"></div>
    <div class="panel">
      <div class="card">
        <div class="lbl">LIFE RUNE (charakter)</div>
        <div class="runebtns" id="runebtns"></div>
      </div>
      <div class="card">
        <div class="lbl">DATE OF BIRTH (otisk)</div>
        <div class="dob">
          <input type="number" id="dob-d" min="1" max="31" value="14">
          <input type="number" id="dob-m" min="1" max="12" value="6">
          <input type="number" id="dob-y" min="1900" max="2030" value="1988">
        </div>
        <div class="btnrow"><button class="jb" id="randdob">nahodne datum</button></div>
      </div>
      <div class="card">
        <div class="lbl">TREE AGE (kazdy element stari po svem)</div>
        <input type="range" id="treeage" min="0" max="900" step="5" value="365">
        <div class="info" id="ageread" style="text-align:center;color:var(--gold);margin-top:4px"></div>
        <div class="btnrow">
          <button class="jb" data-a="14">2 tydny</button>
          <button class="jb" data-a="180">6 mes</button>
          <button class="jb" data-a="365">1 rok</button>
          <button class="jb" data-a="730">2 roky</button>
        </div>
      </div>
      <div class="card"><div class="lbl">INTRINSIC</div><div class="info" id="info"></div></div>
      <div class="card"><div class="lbl">TUNING</div><div class="tune" id="tune"></div></div>
    </div>
  </div>
</div>

<script src="runar-trunk.js"></script>
<script>
(function () {
  var Tk = window.RunarTrunk;
  var stage=document.getElementById('stage');
  var cv=document.createElement('canvas'); cv.style.width='100%'; cv.style.height='100%'; cv.style.display='block'; stage.appendChild(cv);
  var W=440,H=620,dpr=window.devicePixelRatio||1; cv.width=W*dpr; cv.height=H*dpr;
  var ctx=cv.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0);

  var state={ rune:'berkano', d:14, m:6, y:1988 };
  var T={ lean:1, wobble:1, wobFreq:1.0, thickness:8, bundleSpread:0.22, contour:0.6, twist:0.4,
          baseFlare:0.55, protrude:0.5, rootFan:1.1, rootLen:150, treeAge:365, strandEvery:150,
          matureDays:365, minSize:0.2, w:W, cx:W/2, groundY:430, topY:140 };

  var rb=document.getElementById('runebtns');
  Tk.RUNES.forEach(function(r){
    var b=document.createElement('button'); b.className='rb'+(r.k===state.rune?' on':''); b.textContent=r.g; b.title=r.name; b.dataset.k=r.k;
    b.addEventListener('click',function(){ state.rune=r.k; document.querySelectorAll('.rb').forEach(function(x){x.classList.toggle('on',x.dataset.k===r.k);}); draw(); });
    rb.appendChild(b);
  });
  function bindNum(id,key){ document.getElementById(id).addEventListener('input',function(e){ state[key]=parseInt(e.target.value||'1',10); draw(); }); }
  bindNum('dob-d','d'); bindNum('dob-m','m'); bindNum('dob-y','y');
  document.getElementById('randdob').addEventListener('click',function(){
    state.d=1+Math.floor(Math.random()*28); state.m=1+Math.floor(Math.random()*12); state.y=1950+Math.floor(Math.random()*60);
    document.getElementById('dob-d').value=state.d; document.getElementById('dob-m').value=state.m; document.getElementById('dob-y').value=state.y; draw();
  });
  var ageSlider=document.getElementById('treeage');
  ageSlider.addEventListener('input',function(){ T.treeAge=parseFloat(ageSlider.value); draw(); });
  document.querySelectorAll('.jb[data-a]').forEach(function(b){ b.addEventListener('click',function(){
    T.treeAge=parseFloat(b.dataset.a); ageSlider.value=T.treeAge; draw(); }); });

  var TUNE=[ ['lean',0,2,0.05,'naklon'],['wobble',0,2,0.05,'vlneni'],['wobFreq',0.3,2.5,0.05,'vlneni freq'],
    ['thickness',3,16,0.5,'sila pramene'],['bundleSpread',0.08,0.8,0.02,'prekryv (niz=vic splyva)'],
    ['contour',0,1,0.05,'ryhy (kontura)'],['twist',0,0.6,0.02,'twist max (auto dle veku)'],
    ['baseFlare',0,2,0.05,'rozsireni baze (buttress)'],['protrude',0,1,0.05,'stare zebro (vystup po 1.5r)'],
    ['rootFan',-2,2,0.05,'rozevreni korenu (i zapor)'],['rootLen',60,260,5,'delka korenu'],
    ['strandEvery',40,365,5,'novy pramen co (dny)'],['matureDays',90,730,10,'cas do dospelosti'],['minSize',0.15,0.6,0.02,'velikost pri vzniku'] ];
  var tuneEl=document.getElementById('tune');
  TUNE.forEach(function(d){
    var lab=document.createElement('label'); lab.textContent=d[4];
    var inp=document.createElement('input'); inp.type='range'; inp.min=d[1]; inp.max=d[2]; inp.step=d[3]; inp.value=T[d[0]];
    var out=document.createElement('output'); out.textContent=T[d[0]];
    inp.addEventListener('input',function(){ T[d[0]]=parseFloat(inp.value); out.textContent=inp.value; draw(); });
    tuneEl.appendChild(lab); tuneEl.appendChild(inp); tuneEl.appendChild(out);
  });

  function paintLimb(pts, el){
    var LX=-0.5, LY=-0.866;
    for(var j=0;j<pts.length-1;j++){
      var a=pts[j], b=pts[j+1]; var cm=(a.ct+b.ct)/2;
      var rgb=Tk.barkRgb(cm,el); var dsh=0.55+0.45*((a.depth+b.depth)/2*0.5+0.5); rgb=Tk.shadeRgb(rgb,dsh);
      var dx=b.x-a.x, dy=b.y-a.y, len=Math.sqrt(dx*dx+dy*dy)||1; var nx=-dy/len, ny=dx/len; var wAvg=(a.w+b.w)/2;
      function quad(sw,extra,offx,offy,col,al){ var wa=a.w*sw+extra, wb=b.w*sw+extra;
        ctx.beginPath(); ctx.moveTo(a.x+offx-nx*wa/2,a.y+offy-ny*wa/2); ctx.lineTo(b.x+offx-nx*wb/2,b.y+offy-ny*wb/2);
        ctx.lineTo(b.x+offx+nx*wb/2,b.y+offy+ny*wb/2); ctx.lineTo(a.x+offx+nx*wa/2,a.y+offy+ny*wa/2); ctx.closePath();
        ctx.fillStyle='rgba('+(col[0]|0)+','+(col[1]|0)+','+(col[2]|0)+','+al+')'; ctx.fill(); }
      if(wAvg>1 && T.contour>0) quad(1,1.4,0,0,Tk.shadeRgb(rgb,0.38),0.85*T.contour);  /* groove */
      quad(1,0,0,0,rgb,1);
      if(wAvg>1.8){ var sgn=(nx*LX+ny*LY)>0?1:-1; quad(0.26,0,nx*sgn*wAvg*0.24,ny*sgn*wAvg*0.24,Tk.mixRgb(rgb,[205,200,188],0.55),0.55); }
    }
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    ctx.strokeStyle='rgba(140,130,110,0.10)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(W*0.06,T.groundY); ctx.lineTo(W*0.94,T.groundY); ctx.stroke();
    var g=Tk.buildTrunk({rune:state.rune,dob:{d:state.d,m:state.m,y:state.y}}, T);
    var el=g.info.el;
    /* depth sort: back limbs first -> overlap reads as one rounded body */
    var ls=g.limbs.slice().sort(function(a,b){return a.depth-b.depth;});
    ls.forEach(function(L){ paintLimb(L.pts, el); });
    var i=g.info;
    var months=Math.round(i.treeAge/30.4);
    document.getElementById('ageread').textContent='vek '+i.treeAge+' dni (~'+months+' mes) · '+i.strandN+' pramenu';
    document.getElementById('info').innerHTML =
      'rune: <b>'+i.rune.name+'</b> '+i.rune.g+' &middot; element <b>'+i.el+'</b><br>'+
      'naklon: <b>'+i.leanLabel+'</b><br>'+
      'datum '+state.d+'.'+state.m+'.'+state.y+' &rarr; otisk #'+(i.dobSeed%10000);
  }
  window._draw=draw; draw();
})();
</script>
</body>
</html>
"""

for name, content in [('runar-trunk.js', MODEL), ('trunk-composer.html', HTML)]:
    p = os.path.join(DST, name)
    with io.open(p, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)
    print('written', p, len(content), 'chars')
