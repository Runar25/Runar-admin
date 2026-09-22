# -*- coding: utf-8 -*-
# Builds the TREE Composer lab into v2/tree-lab-crown-composer/.
#
# SYSTEM (KUKY 2026-06-14, approved): ONE tunable tree (roots + trunk + crown) with
# THREE tuning panels, CONSUMING both shared engines read-only (never rewriting them):
#   - RunarTrunk.buildTrunk   -> strands (root->trunk continuous limbs) + roots.
#   - RunarBranch.buildBranch -> one limb per branch (ox/oy/baseAng/dev/twist hooks).
# Principles dialed in with KUKY:
#   * STAGGERED EMERGENCE: each strand leaves the trunk at its own height -> trunk
#     narrows upward (da Vinci taper), branches in tiers, no pinch. Founding 3 set
#     the reach: leader (front strand) UP, two at ~45 deg; later mains fill tiers.
#   * SMOOTH JOINS: every limb (main from trunk, sub from main, root odbocka) STARTS
#     along its parent's tangent and bends to its target (spec.dev) -> grows OUT, no
#     sharp edge. The trunk is just an overgrown branch -> same rule everywhere.
#   * GROWS IN HEIGHT with age -> emergence spreads over a taller trunk (no cluster).
#   * ROOT ODBOCKY: roots get the same fractal odbocky as the crown (~50% of crown),
#     pointing down/out, dark (no up tip-lift).
# Fractal depth capped (KUKY: 3 max). Per CLAUDE.md paragraph 1 (JS via Python).
import io, os, time

V2 = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'v2')
DST = os.path.join(V2, 'tree-lab-crown-composer')
os.makedirs(DST, exist_ok=True)

HTML = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>RUNAR - Tree Composer</title>
<style>
  :root { --bg:#0a0a0f; --card:#11111a; --border:#2a2a3a; --gold:#FFBF00; --dim:#7a7570; --text:#d4cfc8; }
  * { box-sizing:border-box; margin:0; padding:0; }
  body { background:var(--bg); color:var(--text); font-family:Georgia, serif; min-height:100vh; }
  .wrap { max-width:1060px; margin:0 auto; padding:20px 14px 60px; }
  h1 { font-size:1.0em; letter-spacing:.25em; color:var(--gold); text-align:center; padding:14px 0 4px; }
  .sub { text-align:center; font-size:.7em; letter-spacing:.15em; color:var(--dim); margin-bottom:16px; }
  .cols { display:flex; gap:16px; flex-wrap:wrap; justify-content:center; }
  #stage { width:560px; height:900px; background:radial-gradient(ellipse at 50% 48%, #11131c 0%, #0a0a0f 75%);
           border:1px solid var(--border); border-radius:6px; overflow:hidden; flex:0 0 auto; position:sticky; top:12px; }
  .panel { width:330px; flex:0 0 auto; }
  .card { background:var(--card); border:1px solid var(--border); border-radius:4px; padding:14px; margin-bottom:12px; }
  .lbl { font-size:.62em; letter-spacing:.2em; color:var(--gold); margin-bottom:8px; }
  .lbl.sec { color:var(--dim); }
  input[type=range], input[type=number] { width:100%; accent-color:var(--gold); }
  input[type=number] { background:#0d0d16; border:1px solid var(--border); color:var(--text); font-family:inherit; font-size:.8em; padding:6px; border-radius:3px; }
  .runebtns { display:grid; grid-template-columns:repeat(5,1fr); gap:4px; }
  .rb { background:#16161f; border:1px solid var(--border); color:var(--text); font-size:1.05em; padding:5px 0; cursor:pointer; border-radius:3px; text-align:center; }
  .rb.on { border-color:var(--gold); color:var(--gold); background:#1e1c10; }
  .dob { display:grid; grid-template-columns:1fr 1fr 1.4fr; gap:8px; }
  .time-read { font-size:.9em; color:var(--gold); text-align:center; margin:6px 0 2px; }
  .btnrow { display:flex; gap:6px; flex-wrap:wrap; margin-top:8px; }
  .jb { background:none; border:1px solid var(--border); color:var(--dim); font-family:inherit; font-size:.66em; padding:5px 9px; cursor:pointer; border-radius:3px; }
  .jb:hover, .jb.on { border-color:var(--gold); color:var(--gold); }
  .info { font-size:.72em; line-height:1.6; } .info b { color:var(--gold); font-weight:normal; }
  .tune { display:grid; grid-template-columns:120px 1fr 38px; gap:4px 8px; align-items:center; }
  .tune label { font-size:.64em; color:var(--dim); } .tune output { font-size:.64em; color:var(--text); text-align:right; font-variant-numeric:tabular-nums; }
</style>
</head>
<body>
<div style="display:flex;gap:14px;padding:6px 12px;background:#0d0d16;border-bottom:1px solid #2a2a3a;font-size:.72em;letter-spacing:.08em;flex-wrap:wrap;font-family:Georgia,serif">
<a href="../tree-lab-index.html" style="color:#7a7570;text-decoration:none">&#9670; labs</a>
<a href="../tree-lab-branch-composer/branch-composer.html" style="color:#7a7570;text-decoration:none">vetev</a>
<a href="../tree-lab-trunk-composer/trunk-composer.html" style="color:#7a7570;text-decoration:none">kmen</a>
<a href="../tree-lab-crown-composer/crown-composer.html" style="color:#FFBF00;text-decoration:none">koruna</a>
</div>
<div class="wrap">
  <h1>TREE COMPOSER</h1>
  <div class="sub">koreny + kmen + koruna = jeden strom &middot; 3 panely &middot; vetev = pokracovani pramene</div>
  <div class="cols">
    <div id="stage"></div>
    <div class="panel">
      <div class="card">
        <div class="lbl">LIFE RUNE + NAROZENI</div>
        <div class="runebtns" id="runebtns"></div>
        <div class="dob" style="margin-top:8px">
          <input type="number" id="dob-d" min="1" max="31" value="14">
          <input type="number" id="dob-m" min="1" max="12" value="6">
          <input type="number" id="dob-y" min="1900" max="2030" value="1988">
        </div>
      </div>
      <div class="card">
        <div class="lbl">REZIM</div>
        <div class="btnrow" id="skin-seg">
          <button class="jb on" data-s="skin">kuze (bark)</button>
          <button class="jb" data-s="bone">kostra (ladit)</button>
          <button class="jb" data-s="gl">WebGL kura</button>
        </div>
      </div>
      <div class="card">
        <div class="lbl">TREE AGE</div>
        <input type="range" id="treeage" min="0" max="2200" step="5" value="365">
        <div class="time-read" id="ageread"></div>
        <div class="btnrow">
          <button class="jb" data-a="140">3 prameny</button>
          <button class="jb" data-a="365">1 rok</button>
          <button class="jb" data-a="730">2 roky</button>
          <button class="jb" data-a="1000">3 roky</button>
          <button class="jb" data-a="1825">5 let</button>
          <button class="jb" data-a="2200">max</button>
        </div>
      </div>
      <div class="card">
        <div class="lbl">CTENI (log) &middot; strom roste z realnych cteni</div>
        <div class="btnrow" id="cast-el">
          <button class="jb" data-el="fire">+ohen</button>
          <button class="jb" data-el="water">+voda</button>
          <button class="jb" data-el="air">+vzduch</button>
          <button class="jb" data-el="earth">+zeme</button>
          <button class="jb" data-el="shadow">+stin</button>
        </div>
        <div class="btnrow">
          <button class="jb" id="cast-norns">+Norns (3)</button>
          <button class="jb" id="cast-compass">+Compass (5)</button>
          <button class="jb" id="cast-horseshoe">+Horseshoe (7)</button>
          <button class="jb" id="cast-ygg">+Yggdrasil (9)</button>
        </div>
        <div class="btnrow">
          <button class="jb" id="cast-rand10">+10 nahodne</button>
          <button class="jb" id="cast-rand10m">+10 nahodne (s area+intention)</button>
          <button class="jb" id="cast-reset">VYMAZAT / znovu</button>
        </div>
        <div class="time-read" id="logread" style="color:var(--dim)"></div>
      </div>
      <div class="card">
        <div class="lbl" id="ai-head" style="cursor:pointer">AREA + INTENTION <span id="ai-arrow">&#9656;</span> <span style="color:var(--dim);font-size:.8em">(klik = rozbalit)</span></div>
        <div id="ai-body" style="display:none">
        <div style="font-size:.58em;color:var(--dim);letter-spacing:.1em;margin:2px 0 3px">AREA of life &rarr; strana</div>
        <div class="btnrow" id="pick-area">
          <button class="jb" data-area="healing">healing</button>
          <button class="jb" data-area="family">family</button>
          <button class="jb" data-area="inner">inner</button>
          <button class="jb" data-area="love">love</button>
          <button class="jb" data-area="crossroads">cross</button>
          <button class="jb" data-area="purpose">purpose</button>
          <button class="jb" data-area="career">career</button>
          <button class="jb" data-area="spirituality">spirit</button>
          <button class="jb" data-area="__rnd">nahodne</button>
        </div>
        <div style="font-size:.58em;color:var(--dim);letter-spacing:.1em;margin:6px 0 3px">INTENTION &rarr; vyska (Norns)</div>
        <div class="btnrow" id="pick-int">
          <button class="jb" data-int="present">ted</button>
          <button class="jb" data-int="decision">rozhodnuti</button>
          <button class="jb" data-int="past">minulost</button>
          <button class="jb" data-int="__rnd">nahodne</button>
        </div>
        <div class="time-read" id="pickread" style="color:var(--dim)"></div>
        </div>
      </div>
      <div class="card">
        <div class="lbl">HISTORIE CTENI &middot; co ktere udelalo</div>
        <input type="range" id="stepN" min="0" max="0" step="1" value="0">
        <div class="time-read" id="stepread" style="color:var(--dim)">prehravani: vypnuto</div>
        <div id="hist" style="max-height:220px;overflow-y:auto;font-size:.66em;line-height:1.7;margin-top:6px"></div>
      </div>
      <div class="card">
        <div class="lbl">NASTROJE (testovani)</div>
        <div class="btnrow">
          <button class="jb" id="rand-dob">nahodne DOB</button>
          <button class="jb" id="copy-state">COPY STATE</button>
          <button class="jb" id="save-code">ULOZIT -&gt; Code</button>
          <button class="jb" id="reset-all">RESET</button>
          <button class="jb" id="dbg-src">DEBUG zdroj</button>
        </div>
      </div>
      <div class="card"><div class="lbl">INSPEKCE (klikni na vetev)</div><div class="info" id="inspect">&mdash; klikni na vetev ve stromu &mdash;</div></div>
      <div class="card"><div class="lbl">INFO</div><div class="info" id="info"></div></div>
      <div class="card">
        <div class="lbl">RUST (logika)</div>
        <div class="info" id="grow"></div>
        <div class="btnrow"><button class="jb" id="timeline-btn">casova osa (6m/1r/2r/3r)</button></div>
        <div id="timeline" style="display:flex;gap:4px;margin-top:8px;flex-wrap:nowrap"></div>
      </div>
      <div class="card">
        <div class="lbl">PREHLED VETVI (klik = oznac)</div>
        <div class="info" id="btable"></div>
      </div>
      <div class="card"><div class="lbl sec">TVAR &middot; co strom rika</div><div class="tune" id="tune-crown"></div>
        <div class="lbl sec" style="margin-top:10px">VZHLED &middot; jak vypada</div><div class="tune" id="tune-crown-look"></div>
        <div class="lbl sec" id="park-head" style="margin-top:10px;cursor:pointer"><span id="park-arrow">&#9656;</span> ODLOZENO &middot; dorozhodnute / jiny rezim</div>
        <div class="tune" id="tune-crown-park" style="display:none"></div>
        <div class="btnrow"><button class="jb" data-reset="crown">reset koruny</button></div></div>
      <div class="card"><div class="lbl sec">TUNING &middot; KMEN</div><div class="tune" id="tune-trunk"></div>
        <div class="btnrow"><button class="jb" data-reset="trunk">reset kmene</button></div></div>
      <div class="card"><div class="lbl sec">TUNING &middot; KORENY</div><div class="tune" id="tune-roots"></div>
        <div class="btnrow"><button class="jb" data-reset="roots">reset korenu</button></div>
        <div class="btnrow"><button class="jb" id="copy-tune">LADENI -&gt; schranka (pro produkci)</button></div></div>
    </div>
  </div>
</div>

<script src="../runar-runes.js?v=BUILD_TOKEN"></script>
<script src="../tree-lab-trunk-composer/runar-trunk.js?v=BUILD_TOKEN"></script>
<script src="../tree-lab-branch-composer/runar-branch.js?v=BUILD_TOKEN"></script>
<script>
(function () {
  var Tk = window.RunarTrunk, B = window.RunarBranch;
  var stage=document.getElementById('stage');
  var cv=document.createElement('canvas'); cv.style.width='100%'; cv.style.height='100%'; cv.style.display='block'; stage.appendChild(cv);
  var W=560,H=900,dpr=window.devicePixelRatio||1; cv.width=W*dpr; cv.height=H*dpr;
  /* WebGL plátno lezi PRES 2D. pointer-events:none -> kliky propadnou na 2D canvas pod nim,
     takze vyber vetve funguje i v GL rezimu (kresli se tam jen cara zeme a zlate zvyrazneni). */
  var _glcv=null, _gl=null, _glProg=null, _glTex=null, _glBuf=null;
  function glCanvas(){
    if(_glcv) return _glcv;
    _glcv=document.createElement('canvas');
    _glcv.width=W*dpr; _glcv.height=H*dpr;
    _glcv.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%;display:none;pointer-events:none';
    if(getComputedStyle(stage).position==='static') stage.style.position='relative';
    stage.appendChild(_glcv);
    return _glcv;
  }
  var ctx=cv.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0);
  var lerp=B.lerp, clamp=B.clamp;
  /* per-rune shape tuning authored in the Branch Composer (shared localStorage) */
  function loadRuneTune(){ try{ var o=JSON.parse(localStorage.getItem('runeTune')||'{}');
    if(B.RUNE_TUNE){ Object.keys(B.RUNE_TUNE).forEach(function(k){delete B.RUNE_TUNE[k];}); }
    for(var k in o) B.setRuneTune(k,o[k]); }catch(e){} }
  loadRuneTune();
  window.addEventListener('storage', function(e){ if(e.key==='runeTune'){ loadRuneTune(); if(window._draw) window._draw(); } });

  /* rune MEANING (keywords) from runar-runes.js (shared, read-only) for inspection */
  var KW={}; try{ (typeof RUNES!=='undefined'?RUNES:[]).forEach(function(r){ KW[r.g]={k:r.k, k_is:r.k_is, n:r.n}; }); }catch(e){}
  /* ZOOM/POSUN uzivatele. Lezi NAD auto-fitem: obraz = _uz*(auto-fit obraz) + (_ux,_uy).
     _uz=1 & _u=0 => presne stav bez zoomu, takze vypnuty zoom nic nemeni. */
  var _uz=1, _ux=0, _uy=0;
  /* Stari prave stavaneho pramene 0..1. MUSI byt tady, ne uvnitr draw() -- cte to i
     `mirrorTwig`, ktera je definovana mimo draw() (jinak ReferenceError). */
  var _curAge01=null;
  /* SOLO je STAV, ne jednorazova akce: kdyz je zapnute, nasleduje vyber.
     `_selK` muze byt cislo (hlavni vetev) nebo retezec odbocky/pramene (t3_gebo, g3_gebo,
     rm3_0) -> vetev, ktera se ma nechat, je cislo v tom klici. */
  var _solo=false;
  function branchOf(key){ return String(key).replace(/^[a-z]+(\d+).*/, '$1'); }
  /* Kde je cara zeme NA PLATNE. Auto-fit se skaluje kolem groundY (mapuje ji samu na sebe),
     ale zoom/posun uzivatele s ni hne -- a cara se kresli MIMO tu transformaci. */
  function groundScreenY(){ return _uy + _uz*trunkT.groundY; }
  function applySolo(){
    if(!_solo || _selK==null) return;
    var keep=branchOf(_selK); _hidden={};
    for(var i=0;i<_pick.length;i++){ var p=_pick[i];
      if(p.meta && p.meta.idx!=null && String(p.k)!==keep) _hidden[p.k]=1; }
  }
  var _pick=[], _selK=null, _dbgAll=[], _hidden={}, _fit=1;   /* _fit<1 = strom se zmensil, aby se vesel */   /* _hidden[k]=1 -> pramen se nekresli (prehled: zap/vyp) */
  var RBK={}; B.RUNES.forEach(function(r){ RBK[r.k]=r; });   /* rune key -> record (pro inspekci twigu) */
  /* PREHLED VETVI: hodnoty vedle sebe (prehlednejsi nez cist ze stromu). Cte TATAZ meta,
     co pohani inspekci -> zadny druhy zdroj pravdy, nemuze se rozejit. */
  function renderBTable(){
    var el=document.getElementById('btable'); if(!el) return;
    var rows=_pick.filter(function(p){ return p.meta && p.meta.idx!=null; })
                  .sort(function(a,b){ return a.meta.idx-b.meta.idx; });
    if(!rows.length){ el.innerHTML='<span style="color:var(--dim)">zadne hlavni vetve</span>'; return; }
    var h='<table style="width:100%;border-collapse:collapse;font-size:0.92em">'+
      '<tr style="color:var(--dim);text-align:left">'+
      '<th></th><th>#</th><th>runa</th><th>elem</th><th style="text-align:right">tazena</th>'+
      '<th style="text-align:right">delka</th><th style="text-align:right">tloust.</th>'+
      '<th style="text-align:right">odb.</th><th style="text-align:right">grad</th></tr>';
    var tot={n:0,od:0,gr:0};
    rows.forEach(function(p){ var m=p.meta, tw=m.tw||[], gr=tw.filter(function(t){return t.grad;}).length;
      tot.n+=(m.runeN||0); tot.od+=tw.length; tot.gr+=gr;
      var sel=(String(_selK)===String(p.k));
      var vis=!_hidden[p.k];
      h+='<tr data-pick="'+p.k+'" style="cursor:pointer'+(sel?';color:var(--gold)':'')+(vis?'':';opacity:.4')+'">'+
         '<td data-vis="'+p.k+'" title="zapnout/vypnout vetev" style="cursor:pointer;color:'+(vis?'var(--gold)':'var(--dim)')+'">'+(vis?'\u25cf':'\u25cb')+'</td>'+
         '<td>'+(m.idx+1)+'</td><td><b>'+m.name+'</b></td>'+
         '<td style="color:var(--dim)">'+m.el+'</td>'+
         '<td style="text-align:right">'+(m.runeN!=null?m.runeN+'x':'-')+'</td>'+
         '<td style="text-align:right">x'+(m.lenF!=null?m.lenF.toFixed(2):'?')+'</td>'+
         '<td style="text-align:right">'+(m.sizeF!=null?m.sizeF.toFixed(2):'?')+'</td>'+
         '<td style="text-align:right">'+tw.length+'</td>'+
         '<td style="text-align:right">'+(gr||'')+'</td></tr>'; });
    h+='<tr style="color:var(--dim)"><td colspan="4">celkem</td>'+
       '<td style="text-align:right">'+tot.n+'x</td><td></td><td></td>'+
       '<td style="text-align:right">'+tot.od+'</td><td style="text-align:right">'+tot.gr+'</td></tr>';
    h+='</table><div class="btnrow" style="margin-top:6px">'+
       '<button class="jb" id="vis-all">vse zobrazit</button>'+
       '<button class="jb" id="vis-solo"'+(_solo?' style="color:var(--gold);border-color:var(--gold)"':'')+'>solo '+(_solo?'ZAP (drzi se vyberu)':'(jen vybranou)')+'</button></div>';
    el.innerHTML=h;
    var ba=document.getElementById('vis-all'); if(ba) ba.addEventListener('click', function(){ _solo=false; _hidden={}; draw(); });
    var bs=document.getElementById('vis-solo'); if(bs) bs.addEventListener('click', function(){
      _solo=!_solo; if(_solo) applySolo(); else _hidden={}; draw(); });
  }

  function D2(t){ return '<span style="color:var(--dim)">'+t+'</span>'; }
  function showInspect(m){
    var kw=KW[m.g], mean=kw?(kw.k):'';
    var D=function(t){ return '<span style="color:var(--dim)">'+t+'</span>'; };
    var deg=function(r){ return (r==null||isNaN(r))?'?':(r*180/Math.PI).toFixed(0)+String.fromCharCode(176); };
    var N=function(v,d){ return (v==null||isNaN(v))?'?':(+v).toFixed(d); };      /* nikdy nespadnout na chybejicim poli */
    var A=function(pk,txt){ return pk?('<a href="#" data-pick="'+pk+'" style="color:#e8dfc0;text-decoration:underline dotted;cursor:pointer">'+txt+'</a>'):txt; };
    var P=function(v){ return (v==null||isNaN(v))?'?':((+v)*100).toFixed(0)+'%'; };
    var typ = m.root ? 'KORENOVY VYBEZEK' : (m.twig ? (m.grad?'GRADUOVANA SUB-VETEV':'ODBOCKA') : ('HLAVNI VETEV'+(m.idx!=null?(' #'+(m.idx+1)):'')));
    var H='<b style="font-size:1.3em;color:var(--gold)">'+m.g+'</b> <b>'+m.name+'</b> '+D(typ)+'<br>'+
          'element <b>'+m.el+'</b> &middot; aett <b>'+m.aett+'</b> &middot; world <b>'+m.world+'</b><br>';
    if(m.runeN!=null) H+='tuhle runu jsi tahl <b>'+m.runeN+'x</b>'+(m.count!=null&&m.count!=='-'?(' '+D('(cely element '+m.count+'x)')):'')+'<br>';
    if(m.ord!=null) H+=D('poradi v elementu: '+(m.ord+1)+'. (dle PRVNIHO tazeni)')+'<br>';

    if(!m.twig && !m.root){                    /* HLAVNI VETEV: proc tady + proc tak velka */
      H+='<br><b style="color:var(--gold)">PROC TADY</b><br>'+
         'vyska na kmeni <b>'+P(m.frac)+'</b> '+D('= kostra '+P(m.eFrac)+' '+(m.intPart>=0?'+':'')+P(m.intPart)+' z intention')+'<br>'+
         'smer <b>'+deg(m.ang)+'</b> '+D('= kostra '+deg(m.eAng)+' '+(m.leanPart>=0?'+':'')+deg(m.leanPart)+' life-rune '+(m.areaPart>=0?'+':'')+deg(m.areaPart)+' area')+'<br>'+
         '<br><b style="color:var(--gold)">PROC TAK VELKA</b><br>'+
         'pramen roste <b>'+Math.round(m.strandAge)+' dni</b> '+D('(narodil se v den '+Math.round(m.born)+')')+'<br>'+
         'dominance elementu <b>'+P(m.domV)+'</b> &rarr; velikost <b>'+N(m.sizeF,2)+'</b> &middot; delka <b>x'+N(m.lenF,2)+'</b><br>';
      if(m.tw && m.tw.length){
        H+='<br><b style="color:var(--gold)">ODBOCKY ('+m.tw.length+')</b><br>';
        m.tw.forEach(function(t){ H+='&nbsp;'+(t.grad?'<b style="color:var(--gold)">*</b> ':'&middot; ')+'<b>'+A(t.pick,t.name)+'</b> '+t.n+'x '+
          D('delka x'+N(t.g,2)+(t.grad?' GRADUOVALA':'')+(t.rep?' · opakovani '+(t.rep+1)+'.':''))+
          (t.pramen?'<b style="color:var(--gold)"> + VLASTNI PRAMEN AZ DO KORENE</b>':'')+
          ((t.kids&&t.kids.length)?(D(' &rarr; nese ')+t.kids.map(function(x){ return A(x.pick,x.name); }).join(', ')):'')+'<br>'; });
      } else H+='<br>'+D('zadne odbocky - zatim jsi z tohohle elementu tahl jen tuhle runu')+'<br>';
      H+='<br><b style="color:var(--gold)">KOREN</b><br>'+D(m.rootDev==null
          ? 'smer z world+element runy + strana ze seedu pramene (rozevreni = 0)'
          : 'rizene rozevreni podle polohy pramene (dev '+N(m.rootDev,2)+')')+'<br>';
    } else if(m.twig){                          /* ODBOCKA / GRADUANT */
      if(m.slot!=null) H+='<br>'+D('slot '+(m.slot+1)+' z '+m.slots+' -> sedi na '+P(m.fu)+' delky rodice'+(m.grad?' (graduant 20-60%)':''))+'<br>';
      if(m.gGrow!=null) H+=D('delka x'+N(m.gGrow,2)+' (roste s opakovanim teto runy)')+'<br>';
      if(m.kids&&m.kids.length) H+=D('nese vlastni odbocky: ')+m.kids.map(function(x){ return A(x.pick,x.name); }).join(', ')+'<br>';
    } else {                                    /* KORENOVY VYBEZEK */
      if(m.gradStrand) H+='<br>'+D('PRAMEN GRADUANTA (verze B) &middot; tato runa ma vlastni caru od korene, vede se uvnitr rodicovske vetve a odlepuje se na '+N(m.mirrorU,2)+' jeji delky')+'<br>';
      if(m.mirror) H+='<br>'+D('ZRCADLO KORUNY &middot; tataz runa jako odbocka nahore, ve stejne vzdalenosti od kmene (u '+N(m.mirrorU,2)+')')+'<br>';
      H+='<br>'+D('pramen #'+((m.strand||0)+1)+' &middot; '+(m.rootDev==null
          ? 'smer z world+element runy + strana ze seedu'
          : 'rizene rozevreni (dev '+N(m.rootDev,2)+')'))+'<br>';
    }
    if(mean) H+='<br>'+D('vyznam: '+mean);
    document.getElementById('inspect').innerHTML=H;
  }

  var state={ rune:'berkano', d:14, m:6, y:1988, treeAge:365, skin:true, gl:false, mode:'skin', log:[], demo:false, dbg:false };
  try{ state.log=JSON.parse(localStorage.getItem('crownLog')||'[]')||[]; }catch(e){ state.log=[]; }
  state.log=state.log.map(function(r){ return (r&&r.runes)?r:{spread:(r&&r.spread)||'single', runes:[{rune:(r&&r.rune)||'fehu', el:(r&&r.el)||'earth'}], area:(r&&r.area)||null, intention:(r&&r.intention)||null}; });   /* migrace stareho flat logu -> objekt cteni */
  function saveLog(){ try{ localStorage.setItem('crownLog', JSON.stringify(state.log)); }catch(e){} }
  /* trunk engine params (KMEN + KORENY feed this). topY is recomputed each draw
     from age (tree grows in height). groundY fixed. */
  var trunkT={ lean:1, wobble:1, wobFreq:1.0, thickness:9, bundleSpread:0.08, contour:0.6, twist:1.4,
          baseFlare:0.55, protrude:0.5, rootFan:-1, rootLen:150, treeAge:365, strandEvery:80,
          matureDays:365, minSize:0.2, treeHeightMax:370, w:460, cx:W/2, groundY:660, topY:300 };
  /* crown = branch-engine "jazyk tvaru" + composition (emergence/fractal) */
  var crownT={ length:105, width:6, curve:0.8, taper:1.0, wobble:0.45, tipLift:0.35, jitter:0.12, steer:1,
          exitFloor:0.50,   /* kam nejniz smi vetev vyrust z kmene (podil vysky) — nizsi = mene palma */
          ctNear:0.45, ctFar:1.0, foundAng:0.78, exitTop:0.96, exitStep:0.07, twist:0.15,
          childN:2, maxDepth:3, levelRatio:0.62, childWidth:0.7,
          twU0:0.15, twU1:0.93, gradU0:0.20, gradU1:0.85, kidsMax:0,   /* F8: kolik run smi graduant pobrat (0 = vsechny zustanou na hlavni vetvi) */
          twigPer:3, twigMax:10, twigSpread:0.035,
          gradLen:1,   /* o kolik je graduant delsi nez bezna odbocka (1.35 = drivejsi stav) */
          gradStrand:1, gradStrandW:0.65, gradGap:2.2,   /* VERZE B: graduant = vlastni pramen (0 = verze A, dnesni stav) */   /* F9: kolik tazeni = dalsi odbocka · strop na vetev · rozestup opakovani */   /* F7: kam po delce vetve sedaji odbocky / graduanti */
          canopy:0.5, diversity:0.4, readingEvery:3, vigorMature:25, maxMains:9, variace:0.7, textura:0.85,
          glZrno:34, glHloubka:0.85,   /* WebGL rezim: meritko textury podel vetve · hloubka prasklin */
          hrebeny:0.8, tonPramene:0.22,   /* KURA ZE STAVBY: sila hrebenu · rozdil tonu mezi prameny */
          objem:0.6, ryhy:0.7, stylKury:0, kuraVek:0,   /* KURA: presah stinu · sila ryh · rytina|malba · nese vek */ intZone:0.12, areaSide:0.35, aettStr:0.6 };
  /* roots = same engine, pointing DOWN: no up tip-lift, dark colour */
  /* F4: koren ma VLASTNI pravidlo - SAHA (min vybezku, ale DELSICH), nezahyba se jemne jako koruna.
     Tyhle paky jsou od F4 ZAPOJENE (drive byly natvrdo v rTT a rootFan nedelal nic). */
  var rootsT={ length:95, width:6, curve:1, taper:1.0, wobble:0.5, tipLift:0.22, jitter:0.12, steer:1,
          mirrorN:4, mirrorLen:0.30,   /* F10: kolik korunnich odbocek zrcadlit do korene + jejich delka */
          ctNear:0.30, ctFar:0.18, twist:0.1, subScale:1, subLenMul:1, fan:0,
          attachN:3, childN:1, maxDepth:1, levelRatio:0.6, childWidth:0.6,
          junctionThick:1, crownRatio:1 };   /* KUKY 2026-08-07: default 1 (bez zesileni napojeni) */
  /* defaults for RESET + registry of all sliders for re-sync */
  var DEF_C=JSON.parse(JSON.stringify(crownT)), DEF_T=JSON.parse(JSON.stringify(trunkT)), DEF_R=JSON.parse(JSON.stringify(rootsT));
  var DEF_S={rune:state.rune,d:state.d,m:state.m,y:state.y,treeAge:state.treeAge,skin:state.skin};
  var TUNES=[];

  function ageLen(ad){ if(ad<=0)return 0; var f=clamp(ad/trunkT.matureDays,0,1); return 0.5+0.5*(1-Math.pow(1-f,1.7)); }

  var rb=document.getElementById('runebtns');
  B.RUNES.forEach(function(r){
    var b=document.createElement('button'); b.className='rb'+(r.k===state.rune?' on':''); b.textContent=r.g; b.title=r.name; b.dataset.k=r.k;
    b.addEventListener('click',function(){ state.rune=r.k; document.querySelectorAll('.rb').forEach(function(x){x.classList.toggle('on',x.dataset.k===r.k);}); draw(); });
    rb.appendChild(b);
  });
  function bindNum(id,key){ document.getElementById(id).addEventListener('input',function(e){ state[key]=parseInt(e.target.value||'1',10); draw(); }); }
  bindNum('dob-d','d'); bindNum('dob-m','m'); bindNum('dob-y','y');
  var ageSlider=document.getElementById('treeage');
  ageSlider.addEventListener('input',function(){ state.treeAge=parseFloat(ageSlider.value); state.demo=true; draw(); });
  document.querySelectorAll('.jb[data-a]').forEach(function(b){ b.addEventListener('click',function(){ state.treeAge=parseFloat(b.dataset.a); ageSlider.value=state.treeAge; state.demo=true; draw(); }); });
  document.getElementById('skin-seg').addEventListener('click',function(e){ if(!e.target.dataset.s) return;
    var _m=e.target.dataset.s; if(!_m) return;
    state.mode=_m; state.skin=(_m!=='bone'); state.gl=(_m==='gl');
    document.querySelectorAll('#skin-seg .jb').forEach(function(x){x.classList.toggle('on',x.dataset.s===_m);});
    glCanvas().style.display = state.gl?'block':'none';
    draw(); });

  function makeTune(containerId, defs, target){
    var el=document.getElementById(containerId);
    defs.forEach(function(d){
      var lab=document.createElement('label'); lab.textContent=d[4];
      var inp=document.createElement('input'); inp.type='range'; inp.min=d[1]; inp.max=d[2]; inp.step=d[3]; inp.value=target[d[0]];
      var out=document.createElement('output'); out.textContent=target[d[0]];
      inp.addEventListener('input',function(){ target[d[0]]=parseFloat(inp.value); out.textContent=inp.value; draw(); });
      el.appendChild(lab); el.appendChild(inp); el.appendChild(out);
      TUNES.push({inp:inp, out:out, t:target, k:d[0]});
    });
  }
  /* PANEL zredukovan na JADRO (signal + hlavni vzhled). Ostatni mikro-ladeni vypnuto z panelu
     (hodnoty zustavaji na defaultu v crownT/trunkT/rootsT; vratit = pridat radek zpet). */
  /* TVAR — paky, ktere rozhoduji, CO strom o cloveku rika. Tady ma ladeni smysl:
     je to rozhodovani o modelu, ne o vzhledu. */
  makeTune('tune-crown', [
    ['maxMains',3,25,1,'max hlavnich vetvi'],['exitFloor',0.05,0.85,0.01,'kam nejniz smi vetev (proti palme)'],
    ['intZone',0,0.4,0.02,'intention -> vyska'],['areaSide',0,0.8,0.05,'area -> strana'],
    ['aettStr',0,1,0.05,'aett -> charakter'],
    ['twigPer',1,8,1,'kolik tazeni = dalsi odbocka'],['twigMax',2,24,1,'strop odbocek na vetev'],
    ['kidsMax',0,4,1,'runy schovane pod graduantem'] ], crownT);
  /* VZHLED — jak to vypada. Doladi se jednou a zapece; nema smysl u toho sedet. */
  makeTune('tune-crown-look', [
    ['length',30,160,1,'delka hlavni'],['curve',0,1.5,0.05,'gesto (ohyb)'],['variace',0,1,0.05,'variace vetvi'],
    ['childN',0,6,1,'odbocky (twigy) — NENESOU runu, jen zahustuji'],
    ['gradLen',1,5,0.05,'delka graduanta'],['gradStrandW',0.2,1,0.05,'sila pramene graduanta (1 = jako rodic)'],
    ['objem',0,1.5,0.05,'OBJEM: presah stinu pres obrys'],['tonPramene',0,0.6,0.02,'rozdil tonu mezi prameny'] ], crownT);
  /* ODLOZENO — nic se nemaze (KUKY): bud uz je to rozhodnute, nebo to v tomhle rezimu
     nefunguje. `pestrost cteni` je mrtva vzdy, kdyz je log (pouziva ji jen demo strom);
     tri WebGL paky ziji jen v rezimu "WebGL kura". Kura cela sem — "neni to ono". */
  makeTune('tune-crown-park', [
    ['twU0',0,1,0.01,'odbocky od (podil delky)'],['twU1',0,1,0.01,'odbocky do'],
    ['gradU0',0,1,0.01,'graduanti od'],['gradU1',0,1,0.01,'graduanti do'],
    ['twigSpread',0,0.1,0.005,'rozestup opakovani'],['gradGap',0,6,0.2,'odstup graduanta uvnitr vetve'],
    ['gradStrand',0,1,1,'VERZE B: graduant = vlastni pramen'],
    ['hrebeny',0,1.5,0.05,'HREBENY kury'],['textura',0,1,0.05,'textura kury'],['ryhy',0,1.5,0.05,'sila ryh v kure'],
    ['stylKury',0,1,1,'styl kury: 0 rytina / 1 malba'],['kuraVek',0,1,1,'kura nese vek pramene'],
    ['glZrno',8,120,2,'WebGL: meritko kury podel vetve'],['glHloubka',0,1,0.05,'WebGL: hloubka prasklin'],
    ['diversity',0,1,0.05,'pestrost cteni (mrtva, kdyz je log)'] ], crownT);
  (function(){ var h=document.getElementById('park-head'), b=document.getElementById('tune-crown-park');
    if(h&&b) h.addEventListener('click', function(){ var open=(b.style.display!=='none');
      b.style.display=open?'none':'block';
      document.getElementById('park-arrow').innerHTML=open?'&#9656;':'&#9662;'; }); })();
  /* PROPLETANI: swirlX = twist * laneStep * 1.1 * sin(faze + twist*h*2PI) -> aby se prameny
     krizily, musi byt amplituda vetsi nez rozestup lane (laneStep = thickness * bundleSpread).
     Pri 25 pramenech to delalo nahuštění samo; pri 9 se to musi nastavit. */
  makeTune('tune-trunk', [ ['thickness',3,16,0.5,'sila pramene'],['lean',0,2,0.05,'naklon'],
    ['twist',0,2.5,0.05,'propletani pramenu'],['bundleSpread',0.08,0.9,0.02,'rozestup pramenu'],
    ['wobble',0,2,0.05,'vlnitost kmene'],['wobFreq',0.3,3,0.1,'frekvence vlneni'],
    ['strandEvery',20,365,5,'novy pramen (dny)'],['treeHeightMax',300,560,10,'vyska kmene'] ], trunkT);
  /* KORENY (F4): paky ZAPOJENE. Drive: curve/wobble/tipLift natvrdo v rTT + `rootFan` nedelal nic
     (tvaroval jen tu cast limbu, co se od Kroku 3 nekresli). */
  makeTune('tune-roots', [ ['fan',-1.6,1.6,0.05,'rozevreni korenu (- = dovnitr/krizi)'],['length',40,200,5,'delka korenu'],
    ['curve',0,1.5,0.05,'zahnuti korenu'],['wobble',0,1.5,0.05,'vlnitost korenu'],
    ['subScale',0,2,0.1,'pocet vybezku'],['subLenMul',0.5,3,0.1,'delka vybezku'],
    ['tipLift',0,1,0.05,'zdvih spicky (0 = dolu)'],['junctionThick',1,2.5,0.1,'tloustka napojeni na kmen'],
    ['mirrorN',0,20,1,'zrcadlit odbocky z koruny'],['mirrorLen',0.1,0.8,0.05,'delka zrcadlenych'] ], rootsT);

  /* TESTING TOOLS: full reset, copy-state (for remote bug reports), random DOB */
  function resetAll(){
    for(var k in DEF_C) crownT[k]=DEF_C[k];
    for(var k2 in DEF_T) trunkT[k2]=DEF_T[k2];
    for(var k3 in DEF_R) rootsT[k3]=DEF_R[k3];
    state.rune=DEF_S.rune; state.d=DEF_S.d; state.m=DEF_S.m; state.y=DEF_S.y; state.treeAge=DEF_S.treeAge; state.skin=DEF_S.skin;
    if(B.RUNE_TUNE) Object.keys(B.RUNE_TUNE).forEach(function(kk){delete B.RUNE_TUNE[kk];});
    try{ localStorage.removeItem('runeTune'); }catch(e){}
    TUNES.forEach(function(t){ t.inp.value=t.t[t.k]; t.out.textContent=t.t[t.k]; });
    ageSlider.value=state.treeAge;
    document.getElementById('dob-d').value=state.d; document.getElementById('dob-m').value=state.m; document.getElementById('dob-y').value=state.y;
    document.querySelectorAll('.rb').forEach(function(x){x.classList.toggle('on',x.dataset.k===state.rune);});
    document.querySelectorAll('#skin-seg .jb').forEach(function(x){x.classList.toggle('on',(x.dataset.s==='skin')===state.skin);});
    draw();
  }
  /* reset JEN jednoho panelu (globalni RESET maze i ladeni run a DOB) */
  document.querySelectorAll('[data-reset]').forEach(function(b){
    b.addEventListener('click', function(){
      var which=b.dataset.reset;
      var tgt=(which==='crown')?crownT:(which==='trunk'?trunkT:rootsT);
      var def=(which==='crown')?DEF_C:(which==='trunk'?DEF_T:DEF_R);
      TUNES.forEach(function(t){ if(t.t!==tgt) return; tgt[t.k]=def[t.k];
        t.inp.value=def[t.k]; t.out.textContent=def[t.k]; });
      draw();
    });
  });
  /* Do produkce patri JEN hodnoty posuvniku - ne behova pole (treeAge/topY/strandMax se
     prepisuji pri kazdem kresleni). TUNES vi presne, ktere klice jsou ladici. */
  document.getElementById('copy-tune').addEventListener('click', function(){
    var out={crownT:{},trunkT:{},rootsT:{}};
    TUNES.forEach(function(t){ var n=(t.t===crownT)?'crownT':((t.t===trunkT)?'trunkT':'rootsT');
      out[n][t.k]=t.t[t.k]; });
    var s=JSON.stringify(out,null,1);
    var b=this, o=b.textContent;
    if(navigator.clipboard&&navigator.clipboard.writeText)
      navigator.clipboard.writeText(s).then(function(){ b.textContent='zkopirovano'; setTimeout(function(){b.textContent=o;},1600); },
                                            function(){ window.prompt('Zkopiruj ladeni:',s); });
    else window.prompt('Zkopiruj ladeni:',s);
  });
  function copyState(){
    var st={ dob:{d:state.d,m:state.m,y:state.y}, rune:state.rune, treeAge:state.treeAge, skin:state.skin,
             log:state.log,
             crownT:crownT, trunkT:trunkT, rootsT:rootsT, runeTune:JSON.parse(B.exportTune()||'{}') };
    var s=JSON.stringify(st);
    if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(s).then(function(){alert('Stav zkopirovan - vloz ho ke screenshotu.');},function(){window.prompt('Zkopiruj stav:',s);}); }
    else window.prompt('Zkopiruj stav:',s);
  }
  function randDob(){ state.d=1+Math.floor(Math.random()*28); state.m=1+Math.floor(Math.random()*12); state.y=1950+Math.floor(Math.random()*60);
    document.getElementById('dob-d').value=state.d; document.getElementById('dob-m').value=state.m; document.getElementById('dob-y').value=state.y; draw(); }
  document.getElementById('reset-all').addEventListener('click', function(){ if(window.confirm('RESET vseho na vychozi (vc. ladeni run)?')) resetAll(); });
  document.getElementById('dbg-src').addEventListener('click', function(){ state.dbg=!state.dbg; this.style.color=state.dbg?'#34c759':''; draw(); });
  document.getElementById('copy-state').addEventListener('click', copyState);
  document.getElementById('rand-dob').addEventListener('click', randDob);
  /* KROK 1.5b: ULOZIT stav do sdileneho repo souboru (_tree_state.json na 7798) -> Code cte primo */
  document.getElementById('save-code').addEventListener('click', function(){
    var b=document.getElementById('save-code'), o=b.textContent;
    var st={ dob:{d:state.d,m:state.m,y:state.y}, rune:state.rune, log:state.log, viewN:state._viewN,
             crownT:crownT, trunkT:trunkT, rootsT:rootsT };
    fetch('http://localhost:7798/',{method:'POST',body:JSON.stringify(st)})
      .then(function(r){return r.text();})
      .then(function(){ b.textContent='ulozeno pro Code'; setTimeout(function(){b.textContent=o;},1600); })
      .catch(function(){ b.textContent='helper 7798 nebezi'; setTimeout(function(){b.textContent=o;},2200); });
  });

  /* KROK 1+signaly: cteni = objekt {spread, runes:[{rune,el}], area, intention}. Element ridi strom uz ted;
     spread (viceruna) = vic run/vetvi + expanze; area+intention se ukladaji a ukazuji v trace,
     jejich EFEKT na strom (strana/vyska) = KROK 2 (jeste nezapojeno). */
  var AREAS=['healing','family','inner','love','crossroads','purpose','career','spirituality'];
  var INTENTS=['present','decision','past'];
  var pickA={on:false,rnd:false,val:null}, pickI={on:false,rnd:false,val:null};
  function rndRune(el){ var pool=(el&&runesByEl[el])?runesByEl[el]:B.RUNES; var r=pool[Math.floor(Math.random()*pool.length)]||pool[0]; return {rune:r.k, el:r.el}; }
  function readingMeta(){ return { area: pickA.on?(pickA.rnd?AREAS[Math.floor(Math.random()*AREAS.length)]:pickA.val):null,
             intention: pickI.on?(pickI.rnd?INTENTS[Math.floor(Math.random()*INTENTS.length)]:pickI.val):null }; }
  /* ZAKLADNI PRAVIDLO SPREADU: co je jednou tazene, jde pryc -- jedna runa se v jednom
     cteni NIKDY neobjevi dvakrat. Drive se tahalo s vracenim a Norns umel dat 2x Hagalaz;
     tim se nafukoval `runeCnt` a runa pak vypadala vycvicenejsi, nez vubec mohla byt.
     (Produkce to dela spravne uz ted -- `_syncGridUsed` tazeny kamen v gridu zablokuje.) */
  function castReading(spread, n, el){
    var pool=((el&&runesByEl[el])?runesByEl[el]:B.RUNES).slice();
    var runes=[], take=Math.min(n, pool.length);
    for(var i=0;i<take;i++){ var r=pool.splice(Math.floor(Math.random()*pool.length),1)[0];
      runes.push({rune:r.k, el:r.el}); }
    var m=readingMeta();
    state.log.push({ spread:spread, runes:runes, area:m.area, intention:m.intention }); }
  function afterCast(){ state._viewN=null; state.demo=false; saveLog(); renderHist(); draw(); }
  document.getElementById('cast-el').addEventListener('click', function(e){ if(!e.target.dataset.el) return; castReading('single',1,e.target.dataset.el); afterCast(); });
  document.getElementById('cast-norns').addEventListener('click', function(){ castReading('norns',3); afterCast(); });
  document.getElementById('cast-compass').addEventListener('click', function(){ castReading('compass',5); afterCast(); });
  document.getElementById('cast-horseshoe').addEventListener('click', function(){ castReading('horseshoe',7); afterCast(); });
  document.getElementById('cast-ygg').addEventListener('click', function(){ castReading('yggdrasil',9); afterCast(); });
  document.getElementById('cast-rand10').addEventListener('click', function(){ for(var i=0;i<10;i++) castReading('single',1); afterCast(); });
  /* +10 s KAZDYM cteni nahodna area i intention (nezavisle na prepinacich vyse) -> testovani
     signalu area->strana a intention->vyska bez rucniho klikani */
  document.getElementById('cast-rand10m').addEventListener('click', function(){
    for(var i=0;i<10;i++){
      state.log.push({ spread:'single', runes:[rndRune()],
        area: AREAS[Math.floor(Math.random()*AREAS.length)],
        intention: INTENTS[Math.floor(Math.random()*INTENTS.length)] });
    }
    afterCast();
  });
  document.getElementById('cast-reset').addEventListener('click', function(){ state.log=[]; state._viewN=null; afterCast(); });
  /* AREA+INTENTION panel je vychozi SLOZENY (prekazel); nadpis ho rozbali */
  document.getElementById('ai-head').addEventListener('click', function(){
    var b=document.getElementById('ai-body'), open=(b.style.display!=='none');
    b.style.display=open?'none':'block';
    document.getElementById('ai-arrow').innerHTML=open?'&#9656;':'&#9662;';
  });
  /* area + intention toggle (klik pridat, klik znovu odebrat; "nahodne" = random per cteni) */
  function syncPick(){
    document.querySelectorAll('#pick-area .jb').forEach(function(x){ var a=x.dataset.area; x.classList.toggle('on', a==='__rnd'?(pickA.on&&pickA.rnd):(pickA.on&&!pickA.rnd&&pickA.val===a)); });
    document.querySelectorAll('#pick-int .jb').forEach(function(x){ var it=x.dataset.int; x.classList.toggle('on', it==='__rnd'?(pickI.on&&pickI.rnd):(pickI.on&&!pickI.rnd&&pickI.val===it)); });
    var pr=document.getElementById('pickread'); if(pr) pr.textContent='k ctenim: area='+(pickA.on?(pickA.rnd?'nahodne':pickA.val):'—')+' · intention='+(pickI.on?(pickI.rnd?'nahodne':pickI.val):'—');
  }
  document.getElementById('pick-area').addEventListener('click', function(e){ var a=e.target.dataset.area; if(!a) return;
    if(a==='__rnd'){ pickA=pickA.rnd?{on:false,rnd:false,val:null}:{on:true,rnd:true,val:null}; }
    else if(pickA.on&&!pickA.rnd&&pickA.val===a){ pickA={on:false,rnd:false,val:null}; } else { pickA={on:true,rnd:false,val:a}; } syncPick(); });
  document.getElementById('pick-int').addEventListener('click', function(e){ var it=e.target.dataset.int; if(!it) return;
    if(it==='__rnd'){ pickI=pickI.rnd?{on:false,rnd:false,val:null}:{on:true,rnd:true,val:null}; }
    else if(pickI.on&&!pickI.rnd&&pickI.val===it){ pickI={on:false,rnd:false,val:null}; } else { pickI={on:true,rnd:false,val:it}; } syncPick(); });
  syncPick();

  /* KROK 1.5: POZOROVATELNOST — trace kazdeho cteni (co udelalo) + prehravani po cteni N.
     traceAt(n) jen ZMERI stav pri prvnich n ctenich (znovu pusti routing/assign na prefixu);
     engine ani kresleni se NEMENI -> slouzi k odhaleni preskakovani vetvi. */
  function traceAt(n){
    var lg=state.log.slice(0,n);
    if(!lg.length) return {n:0,targetN:0,assign:[],els:[],total:1};
    var rt=routingFromLog(lg);
    var realAge=lg.length*crownT.readingEvery, every=Math.max(20,trunkT.strandEvery);
    var linearN=Math.min((trunkT.strandMax||28), 3+Math.floor(realAge/every));
    var targetN=Math.max(1, Math.min(linearN, Math.round(crownT.maxMains)));
    var be=stableAssign(lg, rt.els, targetN);
    return {n:n, targetN:targetN, assign:be.map(function(e){return e.el;}), els:rt.els, total:rt.total};
  }
  var GLC={fire:'#d85a30',water:'#378add',air:'#639922',earth:'#ba7517',shadow:'#9a92a8'};
  function glyphOf(k){ var g='?'; try{ B.RUNES.forEach(function(r){ if(r.k===k) g=r.g; }); }catch(e){} return g; }
  function renderHist(){
    var host=document.getElementById('hist'); if(!host) return;
    var sl=document.getElementById('stepN'); if(sl){ sl.max=state.log.length; if(state._viewN==null) sl.value=state.log.length; }
    var rows=[], prev={targetN:0,assign:[]};
    for(var n=1;n<=state.log.length;n++){
      var cur=traceAt(n), rd=state.log[n-1], runes=rd.runes||[];
      var glyphs=runes.map(function(x){ return '<span style="color:'+(GLC[x.el]||'#ccc')+'">'+glyphOf(x.rune)+'</span>'; }).join('');
      var spr=(rd.spread&&rd.spread!=='single')?('<span style="color:var(--dim)">['+rd.spread+' '+runes.length+'] </span>'):'';
      var meta=(rd.area?(' <span style="color:#c8a24a">'+rd.area+'</span>'):'')+(rd.intention?(' <span style="color:#8fa8d8">'+rd.intention+'</span>'):'');
      var eff=(cur.targetN>prev.targetN)?'+vetev':'zesilil', jump=false;
      for(var k=0;k<Math.min(prev.assign.length,cur.assign.length);k++){ if(prev.assign[k]!==cur.assign[k]){ jump=true; break; } }
      rows.push('<div data-n="'+n+'" style="cursor:pointer;padding:1px 2px;border-bottom:1px solid #1a1a24">#'+n+' '+spr+glyphs+meta+
        ' &rarr; '+eff+(jump?' <b style="color:#e24b4a">&#9888;</b>':'')+'</div>');
      prev=cur;
    }
    host.innerHTML=rows.length?rows.reverse().join(''):'<span style="color:var(--dim)">zadna cteni</span>';
  }
  (function(){ var sl=document.getElementById('stepN'); if(!sl) return;
    sl.addEventListener('input', function(){ var v=parseInt(sl.value,10);
      state._viewN=(v>=state.log.length)?null:v;
      document.getElementById('stepread').textContent=state._viewN==null?('prehravani: vypnuto (vsech '+state.log.length+')'):('prehravani: cteni '+v+' / '+state.log.length);
      draw(); }); })();
  document.getElementById('hist').addEventListener('click', function(e){ var d=e.target.closest?e.target.closest('[data-n]'):null; if(!d) return;
    var sl=document.getElementById('stepN'); if(sl){ sl.value=d.dataset.n; sl.dispatchEvent(new Event('input',{bubbles:true})); } });

  /* ---------- DLAZDICE KURY pro WebGL ----------
     Vetsinou BILA s tenkymi tmavymi prasklinami, aby v shaderu fungovala jako NASOBIC:
     hrebeny nechá být a ztmavi jen ryhy. (Prvni pokus v 2D mel obracenou polaritu a
     zploštil kmen -- proto tady vylozene.) Periodicka mrizka = bezesva, 256 px = mocnina
     dvou, jinak by WebGL nedovolil opakovani textury. */
  function barkTileCanvas(px, seed){
    var c2=document.createElement('canvas'); c2.width=px; c2.height=px;
    var g2=c2.getContext('2d'), img=g2.createImageData(px,px), d=img.data;
    function h2(x,y,s){ var n=(x*374761393+y*668265263+s*1274126177)>>>0;
      n=(n^(n>>>13))*1274126177>>>0; return ((n^(n>>>16))>>>0)/4294967295; }
    function sm(t){ return t*t*(3-2*t); }
    function vn(u,v,per,s){ var x=u*per,y=v*per,xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;
      var x0=((xi%per)+per)%per,x1=(x0+1)%per,y0=((yi%per)+per)%per,y1=(y0+1)%per;
      var A=h2(x0,y0,s),B=h2(x1,y0,s),C=h2(x0,y1,s),D2=h2(x1,y1,s),sx=sm(xf),sy=sm(yf);
      var t1=A+(B-A)*sx, t2=C+(D2-C)*sx; return t1+(t2-t1)*sy; }
    function fbm(u,v,per,s,oct){ var t=0,amp=0.5,p=per,sum=0;
      for(var o=0;o<oct;o++){ t+=vn(u,v,p,s+o*31)*amp; sum+=amp; amp*=0.5; p*=2; } return t/sum; }
    for(var y=0;y<px;y++) for(var x=0;x<px;x++){
      var u=x/px, v=y/px;
      var wx=u+(fbm(u,v*0.3,4,seed+7,3)-0.5)*0.30;
      var wy=v+(fbm(u,v*0.3,3,seed+19,3)-0.5)*0.10;
      /* Protazeni MUSI byt v ose U (podel vetve). Prvni verze delila `wy`, cimz vlakna
         vysla napric vetvi = pricne pruhy, tedy tataz vada jako u 2D dlazdice. */
      var n1=fbm(wx*0.18,wy,8,seed+1,4);
      var crack=Math.pow(1-Math.abs(2*n1-1), 3.0);
      var grain=fbm(u,v,32,seed+3,2);
      var val=1-0.82*crack-0.16*(1-grain);
      var g=Math.max(0,Math.min(255,Math.round(255*val)));
      var i=(y*px+x)*4; d[i]=g; d[i+1]=g; d[i+2]=g; d[i+3]=255;
    }
    g2.putImageData(img,0,0); return c2;
  }

  /* ---------- GL: strom jako PAS TROJUHELNIKU s UV ----------
     Kazdy segment = 2 trojuhelniky. `u` = ujeta delka podel vetve / meritko, `v` = 0..1
     napric. Diky tomu textura kopiruje POVRCH vetve -- to je jediny rozdil proti 2D,
     ale je to ten rozdil, kvuli kteremu tam kura vypadala jako nalepka. */
  var VS = "attribute vec2 aPos; attribute vec2 aUV; attribute vec3 aTint; attribute float aAcross;"+
    "uniform vec2 uRes; varying vec2 vUV; varying vec3 vTint; varying float vAcross;"+
    "void main(){ vUV=aUV; vTint=aTint; vAcross=aAcross;"+
    " gl_Position=vec4((aPos.x/uRes.x)*2.0-1.0, 1.0-(aPos.y/uRes.y)*2.0, 0.0, 1.0); }";
  var FS = "precision mediump float; uniform sampler2D uTex; uniform float uDepth;"+
    "varying vec2 vUV; varying vec3 vTint; varying float vAcross;"+
    "void main(){ float bark=texture2D(uTex,vUV).r;"+
    " float across=abs(vAcross);"+
    " float cyl=1.0-0.62*pow(across,1.5);"+          /* valcove stinovani */
    " float lit=1.0+0.35*(1.0-smoothstep(0.0,0.55,abs(vAcross+0.32)));"+  /* svetlo shora zleva */
    " float b=mix(1.0,bark,uDepth);"+
    " vec3 c=vTint*b*cyl*lit;"+
    " gl_FragColor=vec4(c,1.0); }";
  function glSetup(){
    if(_gl) return _gl;
    var cvs=glCanvas();
    _gl=cvs.getContext("webgl",{antialias:true,alpha:true,premultipliedAlpha:false});
    if(!_gl) return null;
    function sh(t,src){ var o=_gl.createShader(t); _gl.shaderSource(o,src); _gl.compileShader(o);
      if(!_gl.getShaderParameter(o,_gl.COMPILE_STATUS)) console.error(_gl.getShaderInfoLog(o)); return o; }
    _glProg=_gl.createProgram();
    _gl.attachShader(_glProg, sh(_gl.VERTEX_SHADER,VS));
    _gl.attachShader(_glProg, sh(_gl.FRAGMENT_SHADER,FS));
    _gl.linkProgram(_glProg); _gl.useProgram(_glProg);
    _glTex=_gl.createTexture();
    _gl.bindTexture(_gl.TEXTURE_2D,_glTex);
    _gl.texImage2D(_gl.TEXTURE_2D,0,_gl.RGBA,_gl.RGBA,_gl.UNSIGNED_BYTE, barkTileCanvas(256,1337));
    _gl.texParameteri(_gl.TEXTURE_2D,_gl.TEXTURE_WRAP_S,_gl.REPEAT);
    _gl.texParameteri(_gl.TEXTURE_2D,_gl.TEXTURE_WRAP_T,_gl.REPEAT);
    _gl.texParameteri(_gl.TEXTURE_2D,_gl.TEXTURE_MIN_FILTER,_gl.LINEAR_MIPMAP_LINEAR);
    _gl.texParameteri(_gl.TEXTURE_2D,_gl.TEXTURE_MAG_FILTER,_gl.LINEAR);
    _gl.generateMipmap(_gl.TEXTURE_2D);
    _glBuf=_gl.createBuffer();
    return _gl;
  }
  function glRender(list, elDef, xf){
    var gl=glSetup(); if(!gl) return false;
    gl.viewport(0,0,_glcv.width,_glcv.height);
    gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    var V=[], uSc=Math.max(4,crownT.glZrno);
    for(var li=0; li<list.length; li++){
      var L=list[li], pts=L.pts; if(!pts||pts.length<2) continue;
      var tint=Tk.barkRgb(0.55, L.el||elDef);
      var tr=tint[0]/255, tg=tint[1]/255, tb=tint[2]/255, arc=0;
      for(var j=0;j<pts.length-1;j++){
        var A=pts[j], B=pts[j+1];
        var dx=B.x-A.x, dy=B.y-A.y, len=Math.sqrt(dx*dx+dy*dy)||1, nx=-dy/len, ny=dx/len;
        /* MINIMALNI SIRKA: sub-pixelove trojuhelniky se nerasterizuji a tenke vetvicky
           z GL rezimu uplne zmizely (obrys byl o 84 px uzsi nez ve 2D). */
        var wa=Math.max(A.w/2, 0.45/ (dpr||1)), wb=Math.max(B.w/2, 0.45/(dpr||1));
        var ax=xf(A.x-nx*wa), ay=xf(A.y-ny*wa,1), bx=xf(A.x+nx*wa), by=xf(A.y+ny*wa,1);
        var cx2=xf(B.x-nx*wb), cy2=xf(B.y-ny*wb,1), dx2=xf(B.x+nx*wb), dy2=xf(B.y+ny*wb,1);
        /* UV IZOTROPNE: `v` se pocita taky v pixelech / meritko, ne natvrdo 0..1.
           Kdyz slo 0..1, byla pres sirku vzdy presne jedna dlazdice, takze posuvnik
           meritka nemel napric vetvi zadny ucinek (zmereno: rozptyl 18.5 -> 19.0). */
        var u0=arc/uSc, u1=(arc+len)/uSc; arc+=len;
        var va0=0.5-wa/uSc, va1=0.5+wa/uSc, vb0=0.5-wb/uSc, vb1=0.5+wb/uSc;
        V.push(ax,ay,u0,va0,tr,tg,tb,-1,  bx,by,u0,va1,tr,tg,tb,1,  cx2,cy2,u1,vb0,tr,tg,tb,-1);
        V.push(bx,by,u0,va1,tr,tg,tb,1,  dx2,dy2,u1,vb1,tr,tg,tb,1, cx2,cy2,u1,vb0,tr,tg,tb,-1);
      }
    }
    if(!V.length) return true;
    gl.bindBuffer(gl.ARRAY_BUFFER,_glBuf);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(V),gl.DYNAMIC_DRAW);
    var st=8*4;
    var aP=gl.getAttribLocation(_glProg,"aPos"), aU=gl.getAttribLocation(_glProg,"aUV"), aT=gl.getAttribLocation(_glProg,"aTint"), aA=gl.getAttribLocation(_glProg,"aAcross");
    gl.enableVertexAttribArray(aP); gl.vertexAttribPointer(aP,2,gl.FLOAT,false,st,0);
    gl.enableVertexAttribArray(aU); gl.vertexAttribPointer(aU,2,gl.FLOAT,false,st,8);
    gl.enableVertexAttribArray(aT); gl.vertexAttribPointer(aT,3,gl.FLOAT,false,st,16);
    gl.enableVertexAttribArray(aA); gl.vertexAttribPointer(aA,1,gl.FLOAT,false,st,28);
    gl.uniform2f(gl.getUniformLocation(_glProg,"uRes"), _glcv.width, _glcv.height);
    gl.uniform1f(gl.getUniformLocation(_glProg,"uDepth"), clamp(crownT.glHloubka,0,1));
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,_glTex);
    gl.uniform1i(gl.getUniformLocation(_glProg,"uTex"),0);
    gl.drawArrays(gl.TRIANGLES,0,V.length/8);
    return true;
  }

  /* OBJEM (1. pruchod). Mekky tmavy stin SIRSI nez pramen. Kresli se pod vsechna tela,
     takze se stiny sousednich pramenu prekryji a MEZERY MEZI NIMI ZTMAVNOU -> svazek
     prestane byt sada car a zacne byt jedno telo. Tri vrstvy misto gradientu: gradient
     na segment by znamenal tisice createLinearGradient volani (drahe na telefonu). */
  function paintAura(pts, el, amt){
    if(amt<=0) return;
    /* VYKON: tenke vetvicke objem nepotrebuji a je jich vetsina. Brana na maximalni sirku
       usetri drtivou vetsinu prace a na vzhledu (kmen + silne vetve) se neprojevi.
       Bez ni stoji aura +50 az +90 % casu prekresleni -- na telefonu neunosne. */
    var mw=0; for(var q=0;q<pts.length;q++) if(pts[q].w>mw) mw=pts[q].w;
    if(mw < 1.6) return;
    /* Tri vrstvy: siroka slaba -> uzka silna. Pri amt=1 sahá stin ~1.5x sirky za obrys
       a nasctena alfa je ~0.39, coz uz je videt jako HMOTA, ne jako obrysova cara. */
    var LY=[[3.0,0.09],[2.0,0.13],[1.3,0.17]];   /* nasobek sirky, alfa */
    for(var v=0; v<LY.length; v++){
      var mul=1+(LY[v][0]-1)*amt, al=LY[v][1]*Math.min(1.4,amt);
      for(var j=0;j<pts.length-1;j++){
        var a=pts[j], b=pts[j+1], wA=a.w*mul, wB=b.w*mul;
        if(wA<0.6 && wB<0.6) continue;
        var dx=b.x-a.x, dy=b.y-a.y, len=Math.sqrt(dx*dx+dy*dy)||1, nx=-dy/len, ny=dx/len;
        var rgb=Tk.shadeRgb(Tk.barkRgb((a.ct+b.ct)/2, el), 0.34);
        ctx.beginPath();
        ctx.moveTo(a.x-nx*wA/2, a.y-ny*wA/2); ctx.lineTo(b.x-nx*wB/2, b.y-ny*wB/2);
        ctx.lineTo(b.x+nx*wB/2, b.y+ny*wB/2); ctx.lineTo(a.x+nx*wA/2, a.y+ny*wA/2);
        ctx.closePath();
        ctx.fillStyle='rgba('+(rgb[0]|0)+','+(rgb[1]|0)+','+(rgb[2]|0)+','+al.toFixed(3)+')';
        ctx.fill();
      }
    }
  }

  /* PAS podel CELEHO pramene. `uc` = kde lezi stred pasu (podil sirky, 0 = osa),
     `uh` = polosirka pasu. Sirka se bere z LOKALNI tloustky, takze se pas zuzuje s pramenem.
     Jeden path pres vsechny body -> na spojich segmentu NEVZNIKA prican sev. */
  function ribbon(pts, uc, uh, col, al){
    if(pts.length<3 || al<=0.004) return;
    function nAt(q){ var p=pts[q], r=pts[q>0?q-1:1];
      var dx=(q>0?p.x-r.x:r.x-p.x), dy=(q>0?p.y-r.y:r.y-p.y), l=Math.sqrt(dx*dx+dy*dy)||1;
      return {x:-dy/l, y:dx/l}; }
    ctx.beginPath();
    for(var q=0;q<pts.length;q++){ var p=pts[q], n=nAt(q), o=(uc-uh)*p.w;
      var X=p.x+n.x*o, Y=p.y+n.y*o; q?ctx.lineTo(X,Y):ctx.moveTo(X,Y); }
    for(var q2=pts.length-1;q2>=0;q2--){ var p2=pts[q2], n2=nAt(q2), o2=(uc+uh)*p2.w;
      ctx.lineTo(p2.x+n2.x*o2, p2.y+n2.y*o2); }
    ctx.closePath();
    ctx.fillStyle='rgba('+(col[0]|0)+','+(col[1]|0)+','+(col[2]|0)+','+al.toFixed(3)+')';
    ctx.fill();
  }

  function paintLimb(pts, el, skin, tex, limb){
    var LX=-0.5, LY=-0.866;
    /* STYL kury: 0 = rytina (ostre tenke ryhy, tvrdy okraj) · 1 = malba (mekci, sirsi, tonalni) */
    var _S = crownT.stylKury>=0.5
      ? { grooveA:0.30, grooveW:1.15, grooveDark:0.52, rim:1.35, crackA:0.30, crackW:1.2 }
      : { grooveA:0.62, grooveW:0.55, grooveDark:0.38, rim:0.85, crackA:0.62, crackW:0.7 };
    /* RYHY predpocitane na CELY pramen: pevna bocni poloha + pomale vlneni + fazovy posun.
       `kuraVek` (prepinac): kdyz je zapnuty, pocet ryh i sance na prasklinu rostou se
       STARIM pramene (stary kmen rozpraskany, mlady vyhon hladky), ne jen s tloustkou. */
    /* TON PRAMENE: kazdy pramen o kousek jinak tmavy. Bez toho splynou v jedno telo
       a zadne hrebeny nevzniknou, protoze pri rozestupu 0.5 px neni co odlisit. */
    var _hs=((Math.round(pts[0].x*13) ^ Math.round(pts[0].y*7) ^ ((limb&&limb.k!=null?limb.k:0)*2654435761)) >>> 0);
    var _ton=1 + (((_hs>>>9)%100)/100-0.5)*2*clamp(crownT.tonPramene,0,0.6);
    var _mw=0; for(var _i=0;_i<pts.length;_i++) if(pts[_i].w>_mw) _mw=pts[_i].w;
    var _age = (limb && limb.age01!=null) ? limb.age01 : null;
    /* Rozsah 0.20-1.30: mlady vyhon skoro hladky, stary kmen rozpraskanejsi nez vychozi stav.
       Vek jde krome POCTU ryh (zaokrouhluje se, takze sam o sobe je skoupy na zmenu)
       i do SYTOSTI ryh a sance na prasklinu -- spojite veliciny, videt hned. */
    var _dens = (crownT.kuraVek>=0.5 && _age!=null) ? (0.20+1.10*_age) : 1;
    var _ageA = (crownT.kuraVek>=0.5 && _age!=null) ? (0.30+0.90*_age) : 1;
    var _nG = Math.max(0, Math.min(6, Math.round(_mw/2.6*_dens)));
    var _sd = ((Math.round(pts[0].x*7) ^ Math.round(pts[0].y*13) ^ (pts.length*2654435761)) >>> 0);
    var _G = [];
    for(var _g=0; _g<_nG; _g++){
      var _h=((_sd*(_g+1)*2654435761)>>>0);
      _G.push({ u:(_g+0.5)/_nG-0.5 + (((_h>>>8)%100)/100-0.5)*0.06,
                amp:0.03+((_h>>>16)%100)/100*0.05,
                f:2.4+((_h>>>4)%100)/100*2.2,
                ph:((_h>>>12)%628)/100 });
    }
    for(var j=0;j<pts.length-1;j++){
      var a=pts[j], b=pts[j+1]; var cm=(a.ct+b.ct)/2;
      var da=(a.depth!=null?a.depth:0), db=(b.depth!=null?b.depth:0);
      var rgb=Tk.barkRgb(cm,el); var dsh=0.55+0.45*((da+db)/2*0.5+0.5); rgb=Tk.shadeRgb(rgb,dsh*_ton);
      var dx=b.x-a.x, dy=b.y-a.y, len=Math.sqrt(dx*dx+dy*dy)||1; var nx=-dy/len, ny=dx/len; var wAvg=(a.w+b.w)/2;
      function quad(sw,extra,offx,offy,col,al){ var wa=a.w*sw+extra, wb=b.w*sw+extra;
        ctx.beginPath(); ctx.moveTo(a.x+offx-nx*wa/2,a.y+offy-ny*wa/2); ctx.lineTo(b.x+offx-nx*wb/2,b.y+offy-ny*wb/2);
        ctx.lineTo(b.x+offx+nx*wb/2,b.y+offy+ny*wb/2); ctx.lineTo(a.x+offx+nx*wa/2,a.y+offy+ny*wa/2); ctx.closePath();
        ctx.fillStyle='rgba('+(col[0]|0)+','+(col[1]|0)+','+(col[2]|0)+','+al+')'; ctx.fill(); }
      if(wAvg>1) quad(1,1.4,0,0,Tk.shadeRgb(rgb,0.38), skin?0.5:0.85);
      quad(1,0,0,0,rgb,1);
      if(skin && tex>0 && wAvg>1.3){
        /* KUZE: oble stinovani (tmave okraje = valec) + podelne ryhy kury */
        var rim=Tk.shadeRgb(rgb,0.55);
        quad(0.34,0, nx*wAvg*0.32, ny*wAvg*0.32, rim, 0.5*tex*_S.rim);
        quad(0.34,0,-nx*wAvg*0.32,-ny*wAvg*0.32, rim, 0.5*tex*_S.rim);
        /* RYHY: pozice kazde ryhy je dana pro CELY pramen (predpocitano nahore), takze
           bezi spojite od paty ke spicce. Drive se pocitala z lokalni sirky a pri zmene
           poctu ryh se vsechny naraz posunuly (4 zlomy na pramen, skoky az 1.44 px). */
        if(_G.length && crownT.ryhy>0){
          var fade=clamp((wAvg-1.2)/1.6, 0, 1)*crownT.ryhy*tex;
          if(fade>0.02){ var dk=Tk.shadeRgb(rgb,_S.grooveDark);
            ctx.strokeStyle='rgba('+(dk[0]|0)+','+(dk[1]|0)+','+(dk[2]|0)+','+(_S.grooveA*fade*_ageA).toFixed(3)+')';
            ctx.lineWidth=_S.grooveW;
            for(var f=0;f<_G.length;f++){ var G=_G[f];
              var uA=G.u+G.amp*Math.sin(a.t*G.f+G.ph), uB=G.u+G.amp*Math.sin(b.t*G.f+G.ph);
              ctx.beginPath(); ctx.moveTo(a.x+nx*uA*a.w, a.y+ny*uA*a.w);
              ctx.lineTo(b.x+nx*uB*b.w, b.y+ny*uB*b.w); ctx.stroke(); } } }
      }
      if(wAvg>1.8){ var sgn=(nx*LX+ny*LY)>0?1:-1; quad(0.26,0,nx*sgn*wAvg*0.24,ny*sgn*wAvg*0.24,Tk.mixRgb(rgb,[205,200,188],0.55), skin?(0.5+0.3*tex):0.55); }
    }
    /* HREBENY -- AZ PO TELE. Kdyz se kreslily pred nim, telo je pri kazdem segmentu
       premalovalo a z posuvniku nebylo skoro nic videt (5 188 px proti 29 275 u tonu).
       Tmava rycha po stinene strane pramene + svetly hreben na jeho vrcholu, oboje
       JEDNIM pasem pres cely pramen -> zadne pricne svy. */
    if(skin && crownT.hrebeny>0 && _mw>1.2){
      var _hA=clamp(crownT.hrebeny,0,1.5), _bb=Tk.barkRgb(0.5, el);
      ribbon(pts, -0.34, 0.13, Tk.shadeRgb(_bb,0.26), 0.42*_hA);
      ribbon(pts,  0.10, 0.17, Tk.mixRgb(_bb,[228,220,198],0.5), 0.30*_hA);
    }
  }

  /* grow one limb (subScale 0), recurse children OUT of it. cfg = crownT or rootsT.
     starts ALONG baseAng + bend dev = smooth; width->w0Want seamless; ct from cfg. */
  /* F7: PEVNE MISTO RUNY na vetvi. Zlaty rez = libovolna podmnozina run je rovnomerne
     rozprostrena (jakykoli prefix i vyber). Zavisi JEN na rune -> pozice se nikdy nehne. */
  var GOLD=0.6180339887;
  /* Hlavni runa pramene + jeho graduanti. JEDEN zdroj pravdy: vola to predpocet
     (kolik pramenu si objednat u buildTrunk) i vykresleni uvnitr smycky. */
  function mainRuneOf(be, k){
    var pool=runesByEl[be.el]||B.RUNES;
    var seen=(be.runeSeen&&be.runeSeen.length)?be.runeSeen:null;
    return seen ? (RBK[seen[Math.min(be.ord||0, seen.length-1)]]||pool[0]) : pool[k%pool.length];
  }
  function graduatesFor(be, k){
    var seen=(be.runeSeen&&be.runeSeen.length)?be.runeSeen:null;
    if(!seen) return [];
    var brk=mainRuneOf(be,k).k, gset=(be.runeGrad||{}), pool=runesByEl[be.el]||B.RUNES;
    var others=[]; for(var i=0;i<seen.length;i++){ if(seen[i]!==brk) others.push(seen[i]); }
    return others.filter(function(x){ return gset[x]; })
                 .sort(function(a,b){ return (gset[a]-gset[b]) || (others.indexOf(a)-others.indexOf(b)); })
                 .slice(0,2)
                 .map(function(x,i){ return { rune:x, u:runeU(pool, x, crownT.gradU0, crownT.gradU1),
                                              slot:i, name:(RBK[x]?RBK[x].name:x) }; });
  }

  function runeU(pool, key, u0, u1){
    var gi=0; for(var i=0;i<pool.length;i++){ if(pool[i] && pool[i].k===key){ gi=i; break; } }
    return u0+(u1-u0)*((gi*GOLD)%1);
  }

  /* F10: zrcadli korunni odbocku do korene. rspine jde BAZE -> SPICKA, korunni `u` se meri
     take od baze vetve, takze zrcadlo = TYZ index (stejna vzdalenost od kmene, jen dolu).
     Zrcadlo, ne fotokopie: dolu je odbocka kratsi, sirsi rozevreni, bez tipLiftu nahoru. */
  function mirrorTwig(out, pick, spine, u, runeK, cfg, seed, lenPx, depthZ, kTag, i, be){
    if(!spine || spine.length<4) return;
    var idx=Math.max(1, Math.min(spine.length-2, Math.round(u*(spine.length-1))));
    var p=spine[idx], q=spine[idx-1];
    var ang=Math.atan2(p.y-q.y, p.x-q.x);
    var jg=(((seed*17+i*83)>>>0)%100)/100, sd=(i%2===0)?1:-1;
    var T2={ length:lenPx*(0.7+0.5*jg), width:Math.max(0.9,(p.w||1)*0.6), curve:cfg.curve, taper:cfg.taper,
             wobble:cfg.wobble, tipLift:cfg.tipLift, jitter:cfg.jitter, steer:1, subScale:0, leaf:0,
             cx:p.x, baseY:p.y };
    var g2=B.buildBranch({ rune:runeK, role:'sub', seed:(seed*613+i*37)>>>0, baseAng:ang,
             dev:sd*(0.40+0.40*jg), ox:p.x, oy:p.y }, T2);
    var nm=runeK; for(var ri=0; ri<B.RUNES.length; ri++){ if(B.RUNES[ri].k===runeK){ nm=B.RUNES[ri].name||runeK; break; } }
    for(var gp=0; gp<g2.paths.length; gp++){ var pp=g2.paths[gp].pts;
      for(var j=0;j<pp.length;j++){ pp[j].depth=depthZ; pp[j].ct=lerp(cfg.ctNear,cfg.ctFar,pp[j].t); }
      out.push({ pts:pp, el:g2.info.el, depth:depthZ, src:'koren', rune:runeK, k:kTag, age01:_curAge01 });
      if(gp===0) pick.push({ k:'rm'+kTag+'_'+i, pts:pp, meta:{ el:g2.info.el, aett:be.aett, world:be.world,
        name:nm, count:'-', root:true, mirror:true, strand:kTag, mirrorU:u,
        runeN:(be.runeCnt&&be.runeCnt[runeK])||null } }); }
  }

  function growBranch(out, cfg, ox, oy, baseAng, dev, role, rune, seed, lenScale, w0Want, depthZ, level, sizeFactor, childRunes, selfInfo){
    var TT={ length:cfg.length*lenScale, width:cfg.width, curve:cfg.curve, taper:cfg.taper, wobble:cfg.wobble,
             tipLift:cfg.tipLift, jitter:cfg.jitter, steer:cfg.steer, subScale:0, leaf:0, cx:ox, baseY:oy };
    var g=B.buildBranch({ rune:rune, role:role, seed:seed, baseAng:baseAng, dev:dev, ox:ox, oy:oy, twist:cfg.twist }, TT);
    var pts=g.paths[0].pts;
    var f=w0Want/(pts[0].w||1);
    for(var i=0;i<pts.length;i++){ pts[i].w*=f; pts[i].depth=depthZ; pts[i].ct=lerp(cfg.ctNear,cfg.ctFar,pts[i].t); }
    var me={ pts:pts, el:g.info.el, depth:depthZ };
    out.push(me);
    /* #2 diagnostika: twigy (level>=1) jsou klikatelne v inspekci -> pozna se, ze nesou jinou runu */
    if(level>=1){ var rr=RBK[rune]; var si=selfInfo||null;
      var pkey = si ? ('t'+(cfg._k!=null?cfg._k:'x')+'_'+rune) : ('t'+_pick.length);   /* stabilni klic -> proklik z panelu funguje i po prekresleni */
      if(rr) _pick.push({ k:pkey, pts:pts, meta:{ el:rr.el, aett:rr.aett, world:rr.world, name:rr.name, g:rr.g, count:'-',
        twig:true, grad:!!(si&&si.grad), slot:si?si.slot:null, slots:si?si.slots:null, fu:si?si.fu:null,
        gGrow:si?si.g:null, runeN:si?si.n:null,
        kids:(si&&si.kids)?si.kids.map(function(x){ return { name:(RBK[x.k]?RBK[x.k].name:x.k), pick:('t'+(cfg._k!=null?cfg._k:'x')+'_'+x.k) }; }):[] } }); }
    if(level>=cfg.maxDepth) return me;
    /* F1: na urovni 0 urcuje odbocky SEZNAM TAZENYCH RUN (childRunes = objekty
       {k,slot,slots,g}); pozice se pocita ze SLOTU runy, ne z poradi -> pribytek nove
       runy uz NEPOSOUVA stavajici odbocky (konec preskakovani). Hlubsi urovne = puvodni
       dekorativni rekurze (male twigy) - NETKNUTE. */
    var childList=(childRunes && childRunes.length && typeof childRunes[0]==='object')?childRunes:null;   /* F2: i hloubeji - graduant nese vlastni odbocky */
    var n=childList?childList.length:Math.max(0, Math.round(cfg.childN*sizeFactor));
    for(var c=0;c<n;c++){
      var ci=childList?childList[c]:null;
      var fu=ci ? (ci.u!=null ? ci.u                                                       /* F7: pevne misto runy (zlaty rez) */
                              : (ci.grad ? ((ci.slots<=1)?0.40:(0.20+0.40*(ci.slot/(ci.slots-1))))
                                         : ((ci.slots<=1)?0.6:(0.40+0.45*(ci.slot/(ci.slots-1))))))
                : ((n===1)?0.6:(0.4+0.45*(c/(n-1))));
      var idx=Math.max(1, Math.min(pts.length-2, Math.round(fu*(pts.length-1))));
      var p=pts[idx], q=pts[idx-1];
      var pang=Math.atan2(p.y-q.y, p.x-q.x);            /* parent tangent at the join */
      var cSide=((ci?ci.slot:c)%2===0)?1:-1;   /* F1: strana taky ze slotu -> stabilni */
      var jig=(((seed*7+c*101)>>>0)%100)/100;
      var childRole=(level===0)?'sub':'twig';
      /* #2: primarni twigy (level 0) nesou OSTATNI runy elementu -> rozmanita vetev;
         hloubeji uz dite dedi runu sveho twigu. */
      var cRune=ci?ci.k:((level===0 && childRunes && childRunes[c]!=null)?childRunes[c]:rune);
      var cGrow=ci?ci.g:1;   /* F1: odbocka roste s opakovanim SVE runy */
      var cLen=(ci&&ci.grad)?cGrow*(cfg.gradLen||1):cGrow;   /* graduant delsi a silnejsi, ale NE hustsi */
      growBranch(out, cfg, p.x, p.y, pang, cSide*(0.40+0.30*jig), childRole, cRune, (seed*131+c*7)>>>0,
                 lenScale*cfg.levelRatio*cLen, p.w*cfg.childWidth*(0.75+0.25*cLen), depthZ+cSide*0.05, level+1, sizeFactor*cfg.levelRatio*cGrow,
                 (ci&&ci.kids&&ci.kids.length)?ci.kids:null, ci?{slot:ci.slot,slots:ci.slots,g:ci.g,grad:!!ci.grad,kids:ci.kids,n:ci.n,fu:fu}:null);
    }
    return me;
  }

  /* ---- ROUTING (lab demo): simulate the reading stream. Each branch has a
     CHARACTER (aett axis / world height / element) from its founding rune. Single
     readings route into the matching theme (reinforce -> bigger); multi-rune (big
     spreads) drive EXPANSION (height/width/mohutnost) by essence. STABLE: themes
     ordered by first appearance (compute-once); later readings only grow them. ---- */
  function hashStr(s){ var h=2166136261>>>0; for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);} return h>>>0; }
  function mulberry32(a){ return function(){ a|=0;a=(a+0x6D2B79F5)|0; var t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
  var ELEMS=['fire','water','air','earth','shadow'];
  var ELEM_ANG={ fire:0.0, air:0.45, water:0.82, earth:-0.5, shadow:-0.9 };   /* spread the 5 across the canopy */
  var ELEM_WORLD={ fire:'asgard', air:'asgard', water:'midgard', earth:'midgard', shadow:'hel' };
  var ELEM_AETT={ fire:'freya', air:'tyr', water:'tyr', earth:'heimdall', shadow:'heimdall' };
  /* KROK 2: intention -> Norns vyska (-1 urd/dole .. +1 skuld/nahore); area -> strana (-1 dovnitr/vlevo .. +1 ven/vpravo) */
  var INT_AXIS={ past:-1, present:0, decision:1 };
  var AREA_LAT={ healing:-0.7, family:-0.6, inner:-0.7, love:-0.2, crossroads:0, purpose:0.6, career:0.7, spirituality:0.5 };
  var WORLD_FRAC={ asgard:0.95, midgard:0.80, hel:0.62 };  /* emergence height */
  var runesByEl={}; B.RUNES.forEach(function(r){ (runesByEl[r.el]=runesByEl[r.el]||[]).push(r); });
  /* AETT: runa -> aett (Freya/Heimdall/Tyr) pres glyf z globalniho RUNES; aett -> charakter rustu vetve */
  var G_AETT={}; try{ RUNES.forEach(function(r){ G_AETT[r.g]=r.aett; }); }catch(e){}
  var KEY_AETT={}; B.RUNES.forEach(function(r){ KEY_AETT[r.k]=r.aett||G_AETT[r.g]||'freya'; });
  var AETT_CHAR={ freya:{curve:1.35,tipLift:1.4,wobble:1.15},     /* fluid, vzhuru */
                  heimdall:{curve:0.9,tipLift:0.5,wobble:0.85},   /* tezky, ukotveny (min. tip lift) */
                  tyr:{curve:0.6,tipLift:1.0,wobble:0.55} };       /* smerovany, primy */

  function routing(seed, nR, diversity){
    var w=[], sum=0, p=lerp(6.0,0.2,diversity);   /* low diversity -> few elements dominate */
    for(var e=0;e<5;e++){ w[e]=Math.pow(0.2+mulberry32((seed^(e*0x9e37+1))>>>0)(), p); sum+=w[e]; }
    for(var e2=0;e2<5;e2++) w[e2]/=sum;
    var rng=mulberry32((seed^0x1234)>>>0);
    var cnt=[0,0,0,0,0], first=[-1,-1,-1,-1,-1], big={h:0,wd:0,ms:0};
    for(var i=0;i<nR;i++){
      var rr=rng(), acc=0, e=4; for(var j=0;j<5;j++){ acc+=w[j]; if(rr<=acc){e=j;break;} }
      if(first[e]<0) first[e]=i;
      var sr=rng(); var big1=sr>0.70; var add=big1?(sr>0.99?6:(sr>0.97?4:(sr>0.93?2:1))):1;
      cnt[e]+=add;
      if(big1){ var eN=ELEMS[e];
        if(eN==='fire'||eN==='air') big.h+=add;
        if(eN==='water'||eN==='earth') big.wd+=add;
        if(eN==='shadow') big.ms+=add; }
    }
    /* element = theme; heavy theme splits into up to 3 mains (mighty -> siblings) */
    /* one entry per element that was read (no min filter); branches are allocated
       across these proportionally to count -> element MIX = reading distribution */
    var els=[];
    for(var e3=0;e3<5;e3++){ if(cnt[e3]>0){ var elN=ELEMS[e3], pool=runesByEl[elN]||B.RUNES;
      els.push({ el:elN, count:cnt[e3], first:first[e3], world:ELEM_WORLD[elN], aett:ELEM_AETT[elN], rune:pool[0] }); } }
    els.sort(function(a,b){return a.first-b.first;});
    var total=0, mx=1; els.forEach(function(x){ total+=x.count; mx=Math.max(mx,x.count); });
    return { els:els, total:Math.max(1,total), mx:mx, big:big };
  }
  /* KROK 1: element mix z REALNEHO logu cteni (nahradi simulaci routing(), kdyz log neni prazdny).
     Stejna navratova struktura {els,total,mx,big} -> engine downstream (emergence/assign/grow) NETKNUTY. */
  function routingFromLog(log){
    var cnt=[0,0,0,0,0], first=[-1,-1,-1,-1,-1], big={h:0,wd:0,ms:0};
    var intS=[0,0,0,0,0], intN=[0,0,0,0,0], areaS=[0,0,0,0,0], areaN=[0,0,0,0,0], aettCnt=[{},{},{},{},{}];
    var runeSeen=[[],[],[],[],[]];   /* #2: TAŽENÉ runy per element v poradi prvniho vyskytu (sticky) */
    var runeCnt=[{},{},{},{},{}];    /* F1: kolikrat byla KAZDA runa tazena (rust odbocky) */
    var runeGrad=[{},{},{},{},{}];   /* F2: runa, ktera NEKDY dosahla prahu graduace = STICKY (nikdy nedegraduje) */
    var gradSeq=[0,0,0,0,0];         /* F2-fix: PORADI prekroceni prahu -> graduuji PRVNI DVA, ne dva nejtazenejsi */
    for(var i=0;i<log.length;i++){
      var rd=log[i], runes=rd.runes||[], multi=(rd.spread&&rd.spread!=='single');
      var ia=(rd.intention!=null)?INT_AXIS[rd.intention]:undefined, al=(rd.area!=null)?AREA_LAT[rd.area]:undefined;
      for(var j=0;j<runes.length;j++){
        var e=ELEMS.indexOf(runes[j].el); if(e<0) e=3;
        if(first[e]<0) first[e]=i;
        cnt[e]+=1;
        var rk=runes[j].rune; if(rk!=null && runeSeen[e].indexOf(rk)<0) runeSeen[e].push(rk);
        if(rk!=null) runeCnt[e][rk]=(runeCnt[e][rk]||0)+1;   /* F1 */
        if(rk!=null){ var mk0=runeSeen[e][0], mc0=runeCnt[e][mk0]||1;   /* F2: prah = ~1/3 tazeni hlavni runy, min 3 */
          if(rk!==mk0 && !runeGrad[e][rk] && runeCnt[e][rk]>=Math.max(3, mc0/3)) runeGrad[e][rk]=++gradSeq[e]; }
        var ae=KEY_AETT[runes[j].rune]||'freya'; aettCnt[e][ae]=(aettCnt[e][ae]||0)+1;
        if(ia!==undefined){ intS[e]+=ia; intN[e]++; }
        if(al!==undefined){ areaS[e]+=al; areaN[e]++; }
        if(multi){ var eN=ELEMS[e];
          if(eN==='fire'||eN==='air') big.h+=1;
          else if(eN==='water'||eN==='earth') big.wd+=1;
          else if(eN==='shadow') big.ms+=1; }
      }
    }
    function domAett(m){ var best='freya', bc=-1; for(var a in m){ if(m[a]>bc){bc=m[a];best=a;} } return best; }
    var els=[];
    for(var e3=0;e3<5;e3++){ if(cnt[e3]>0){ var elN=ELEMS[e3], pool=runesByEl[elN]||B.RUNES;
      els.push({ el:elN, count:cnt[e3], first:first[e3], world:ELEM_WORLD[elN], aett:domAett(aettCnt[e3]), rune:pool[0],
                 runeSeen:runeSeen[e3].slice(), runeCnt:runeCnt[e3], runeGrad:runeGrad[e3],
                 intAxis: intN[e3]?intS[e3]/intN[e3]:0, areaLat: areaN[e3]?areaS[e3]/areaN[e3]:0 }); } }
    els.sort(function(a,b){return a.first-b.first;});
    var total=0, mx=1; els.forEach(function(x){ total+=x.count; mx=Math.max(mx,x.count); });
    return { els:els, total:Math.max(1,total), mx:mx, big:big };
  }
  /* KROK 3 (oprava skakani): STABILNI prirustkove umisteni. Prochazi log v poradi;
     kazdemu elementu 1 zakladni vetev pri prvnim vyskytu + extra pri dominanci (po EXTRA ctenich),
     strop CAP na element. Sloty se JEN PRIDAVAJI (append-only) -> stejny prefix = stejne sloty
     -> zadne preskupeni. Vraci element-objekty jako assignBranchEls (engine downstream NETKNUTY). */
  function stableAssign(log, els, maxN){
    var elByName={}; els.forEach(function(e){ elByName[e.el]=e; });
    var slots=[], nb={}, cnt={}, EXTRA=5, ELEM_CAP={fire:2,water:2,air:2,earth:2,shadow:1};   /* F0: strop hlavnich vetvi per element (stin 1), ne uniform */
    for(var i=0;i<log.length;i++){ var rs=log[i].runes||[];
      for(var j=0;j<rs.length;j++){ var el=rs[j].el; cnt[el]=(cnt[el]||0)+1;
        var want=Math.min((ELEM_CAP[el]||2), 1+Math.floor((cnt[el]-1)/EXTRA)), have=nb[el]||0;
        while(have<want && slots.length<maxN){ slots.push(el); have++; nb[el]=have; }
      }
    }
    var seen={};
    return slots.map(function(nm){ var o=(seen[nm]=(seen[nm]===undefined?0:seen[nm]+1));
      var base=elByName[nm]||{el:nm, count:cnt[nm]||1, world:ELEM_WORLD[nm], aett:ELEM_AETT[nm], rune:(runesByEl[nm]||B.RUNES)[0], runeSeen:[]};
      var out={}; for(var p in base) out[p]=base[p]; out.ord=o; return out; });
  }
  /* allocate n branches across elements proportional to count (largest remainder),
     interleaved for spread; each read element gets >=1 if room */
  function assignBranchEls(els, total, n){
    if(!els.length) return [];
    var alloc=els.map(function(e){return Math.floor(n*e.count/total);});
    var used=alloc.reduce(function(s,x){return s+x;},0);
    var rem=els.map(function(e,i){return {i:i, f:n*e.count/total-alloc[i]};}).sort(function(a,b){return b.f-a.f;});
    for(var r=0; used<n && rem.length; r++){ alloc[rem[r%rem.length].i]++; used++; }
    if(n>=els.length){ for(var i=0;i<els.length;i++){ if(alloc[i]===0){ var mi=0; for(var j=0;j<els.length;j++) if(alloc[j]>alloc[mi])mi=j; if(alloc[mi]>1){alloc[mi]--; alloc[i]=1;} } } }
    var pool=els.map(function(e,i){return {e:e,left:alloc[i]};}), arr=[];
    while(arr.length<n){ var placed=false; for(var p=0;p<pool.length;p++){ if(pool[p].left>0){ arr.push(pool[p].e); pool[p].left--; placed=true; if(arr.length>=n)break; } } if(!placed)break; }
    while(arr.length<n) arr.push(els[0]);
    return arr;
  }

  function emergence(k){
    var sp=0.7+0.6*crownT.canopy;   /* canopy: spread the founding/tier angles (width) */
    if(k===0) return { frac:crownT.exitTop,       ang:-Math.PI/2 };
    if(k===1) return { frac:crownT.exitTop-0.08,  ang:-Math.PI/2 + crownT.foundAng*sp };
    if(k===2) return { frac:crownT.exitTop-0.11,  ang:-Math.PI/2 - crownT.foundAng*sp };
    var t=k-3, side=(t%2===0)?1:-1;
    /* Drive: Math.max(0.50, start - t*krok) — tvrda podlaha. Dve nasledky, oba zmerene:
       pod 50 % kmene nerostlo NIC (holy kmen = palma) a od 8. vetve se vsechny slepily
       na 50 %. Ted se rada k podlaze jen BLIZI (exponencialne), takze zadne dve vetve
       nesplynou a `exitFloor` rozhoduje, jak nizko strom vetvi. */
    var _f0=clamp(crownT.exitFloor, 0.05, 0.90), _st=(crownT.exitTop-0.18);
    /* Krok mezi vetvemi je PEVNY podil (`_dec`), ne podil ze zbyvajiciho rozsahu.
       Prvni pokus delil `exitStep` rozsahem — snizeni podlahy rozsah zvetsilo, tim zpomalilo
       sestup a paka si sama sezrala ucinek (0.50 -> 0.12 posunulo nejnizsi vetev jen 54 % -> 40 %). */
    var _dec=clamp(1 - crownT.exitStep/0.28, 0.35, 0.96);
    var frac=_f0 + Math.max(0, _st-_f0)*Math.pow(_dec, t);
    var ang=-Math.PI/2 + side*(0.30 + 0.20*((t*0.37)%1))*sp;
    return { frac:frac, ang:ang };
  }
  function exitIndex(pts, frac){
    var targetY=lerp(trunkT.groundY, trunkT.topY, frac), best=pts.length-1, bd=1e9;
    for(var i=0;i<pts.length;i++){ if(pts[i].y<=trunkT.groundY+1){ var dd=Math.abs(pts[i].y-targetY); if(dd<bd){bd=dd;best=i;} } }
    return best;
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    _pick.length=0;
    var vlog=(state._viewN!=null) ? state.log.slice(0,state._viewN) : state.log;   /* KROK 1.5: prehravani po cteni N */
    var useLog=vlog && vlog.length>0;                                 /* KROK 1: realna cteni ridi strom */
    if(!useLog && !state.demo){    /* PRAZDNY STROM: zadna cteni + neni demo -> ciste zacit znovu */
      ctx.strokeStyle='rgba(140,130,110,0.10)'; ctx.lineWidth=1;
      var _g0=groundScreenY();
      ctx.beginPath(); ctx.moveTo(W*0.06,_g0); ctx.lineTo(W*0.94,_g0); ctx.stroke();
      ctx.textAlign='center'; ctx.fillStyle='rgba(170,160,140,0.55)'; ctx.font='16px Georgia';
      ctx.fillText('prazdna puda', W/2, _g0+42);
      ctx.fillStyle='rgba(200,160,60,0.7)'; ctx.font='13px Georgia';
      ctx.fillText('klikni CTENI — strom poroste z cteni', W/2, _g0+64); ctx.textAlign='left';
      var ar=document.getElementById('ageread'); if(ar) ar.textContent='prazdno · 0 cteni';
      var lr=document.getElementById('logread'); if(lr) lr.textContent='log prazdny — klikni CTENI (nebo TREE AGE = demo)';
      var gg=document.getElementById('grow'); if(gg) gg.innerHTML='zadna cteni — zacni klikat CTENI (VYMAZAT = znovu)';
      renderHist(); return;
    }
    var realAge=useLog ? vlog.length*crownT.readingEvery : state.treeAge;
    var dobSeed=hashStr(''+state.d+'-'+state.m+'-'+state.y);
    var lifeLean=((hashStr('lean'+state.rune)%1000)/1000-0.5)*0.30;   /* life-rune signature lean */
    var nR=useLog ? vlog.length : Math.floor(realAge/crownT.readingEvery);
    var rt=useLog ? routingFromLog(vlog) : routing(dobSeed, nR, crownT.diversity);   /* log -> element mix, jinak simulace */
    var els=rt.els;
    var hExp=Math.min(1.2, rt.big.h/18), wExp=Math.min(1.0, rt.big.wd/18), mExp=Math.min(1.0, rt.big.ms/18);
    var effCanopy=clamp(crownT.canopy+0.4*wExp, 0, 1.4), girth=1+0.35*mExp;
    /* #2 grow in height with age (+ fire/air/asgard big-spread expansion) */
    var hf=realAge/(realAge+420);
    trunkT.topY=clamp(trunkT.groundY - lerp(180, trunkT.treeHeightMax, hf)*(1+0.2*hExp), 110, trunkT.groundY-130);
    trunkT.treeAge=realAge;

    ctx.strokeStyle='rgba(140,130,110,0.10)'; ctx.lineWidth=1;
    var _gy=groundScreenY();
    ctx.beginPath(); ctx.moveTo(W*0.06,_gy); ctx.lineTo(W*0.94,_gy); ctx.stroke();

    /* F0b (2026-08-07): KOLIK RUN, TOLIK PRAMENU. mainsN se pocita PRED buildTrunk a rovnou
       nastavi strandMax -> zadny pramen bez runy. Drive: 25 pramenu vs 9 vetvi = 16 sirotku
       bez korene useknutych u zeme (regrese z Kroku 3, kdy hlavni vetve dostaly composer-koren
       jako nahradu za vypnuty trunk-koren, ale reinforce prameny nedostaly nic).
       Objem kmene se NEkompenzuje tloustkou (KUKY: nechat a podivat se, jak to vypada). */
    var every=Math.max(20,trunkT.strandEvery);
    var linearN=3+Math.floor(realAge/every);                                     /* rust poctu v case */
    var targetN=Math.max(1, Math.min(linearN, Math.round(crownT.maxMains)));     /* strop = maxMains */
    var branchEls=stableAssign(vlog, els, targetN);
    var mainsN=Math.max(1, Math.min(targetN, branchEls.length));                 /* skutecne tazene runy */
    trunkT.strandMax=mainsN;                                                     /* F0b: pramen = runa, 1:1 */
    /* VERZE B: kazdy graduant si objedna VLASTNI pramen. Musi se to vedet PRED buildTrunk,
       protoze pocet pramenu, jejich drahy ve svazku i jejich narozeni jsou vstupem enginu.
       - laneOrder: graduant dostane drahu tesne vedle rodice (jinak by sel opacnou stranou
         svazku a musel by pri vystupu preletet kmen)
       - bornOrder: graduant se odstepil od rodice, takze sdili jeho narozeni. Bez toho by mu
         vzorec (s-2)*every dal zaporny vek a engine by ho preskocil uplne. */
    var gradStrands=[], LANE0=[0,1,-1,2,-2,3,-3,4,-4,5,-5,6,-6,7,-7];
    delete trunkT.laneOrder; delete trunkT.bornOrder; delete trunkT.strandMin;
    if(crownT.gradStrand){
      var lanes=[], borns=[];
      for(var pk=0; pk<mainsN; pk++){ lanes[pk]=LANE0[pk%LANE0.length]; borns[pk]=(pk<3)?0:(pk-2)*every; }
      /* ZAKON "1 pramen = 1 runa" plati i tady. Element ma az 2 hlavni vetve a obe berou
         odbocky ze stejneho souboru run, takze tataz runa graduuje na obou (gebo u berkano
         i u perthro) a nekdy uz sama nese hlavni vetev (sowilo). Vlastni pramen dostane
         jen runa, ktera jeste zadny nema; jinde zustava obycejnou odbockou. */
      var taken={}; for(var mk=0; mk<mainsN; mk++){ var mr0=mainRuneOf(branchEls[mk]||{}, mk); if(mr0) taken[mr0.k]=1; }
      for(var pk2=0; pk2<mainsN; pk2++){
        var gl=graduatesFor(branchEls[pk2]||{}, pk2);
        for(var gj=0; gj<gl.length; gj++){
          if(taken[gl[gj].rune]) continue;   /* uz ma vlastni pramen -> tady zustane odbockou */
          taken[gl[gj].rune]=1;
          var si=mainsN+gradStrands.length;
          lanes[si]=lanes[pk2] + (gj%2?-1:1)*0.33;   /* tretinova draha vedle rodice; +-0.5 se srazelo se sousedy */
          borns[si]=borns[pk2];
          gradStrands.push({ p:pk2, rune:gl[gj].rune, u:gl[gj].u, slot:gl[gj].slot, name:gl[gj].name });
        }
      }
      if(gradStrands.length){ trunkT.strandMax=mainsN+gradStrands.length;
        trunkT.strandMin=trunkT.strandMax; trunkT.laneOrder=lanes; trunkT.bornOrder=borns; }
    }
    var gt=Tk.buildTrunk({rune:state.rune,dob:{d:state.d,m:state.m,y:state.y}}, trunkT);
    var el=gt.info.el;

    var all=[], crown=[], roots=[]; var strandK=0, strands=[];
    /* KOREN pramene jako funkce -- pouziva ji hlavni vetev i graduant (verze B).
       sMul zmensi koren graduanta proti rodici. */
    function buildRootFor(L, rE, runeK, runeName, be, k, pf, emg, sMul){
      var rbase=L.pts[rE];
      var rTT={ length:rootsT.length*pf*emg*sMul, width:rootsT.width*sMul,   /* F5: koren sleduje TUTEZ praxi jako vetev */ curve:rootsT.curve, taper:rootsT.taper,
                wobble:rootsT.wobble, tipLift:rootsT.tipLift, jitter:rootsT.jitter, steer:1,
                subScale:rootsT.subScale, subLenMul:rootsT.subLenMul, leaf:0, cx:rbase.x, baseY:rbase.y };
      var rSpec={ rune:runeK, role:'main', seed:(dobSeed ^ (k*0x51ed))>>>0,
                  baseAng:Math.PI/2, ox:rbase.x, oy:rbase.y };
      /* fan=0 => PUVODNI chovani korene = smer z world+element runy (openBase 1.15->0.30) + strana
         ze seedu. To vypadalo dobre, takze je to VYCHOZI. fan!=0 => rizene rozevreni podle polohy
         pramene ve svazku (plus = ven bez krizeni, minus = dovnitr/krizi). */
      var rdevUsed=null;
      if(rootsT.fan!==0){ var rdx=rbase.x-trunkT.cx, rspan=Math.max(1, trunkT.w*0.22);
        /* POZOR na znamenko: baseAng=PI/2 miri DOLU, takze KLADNY dev otaci doLEVA.
           Aby se koren rozevrel VEN, musi mit pramen vpravo (rdx>0) dev ZAPORNY -> minus.
           (Bez toho se koreny krizily pod kmenem; puvodni test kontroloval jen znamenko dev,
           ne skutecnou polohu spicky - §19: ověřuj VYSLEDEK, ne mezikrok.) */
        var rdev=-clamp(rdx/rspan,-1,1)*rootsT.fan + (((k*0x2545)>>>0)%100/100-0.5)*0.10;
        if(Math.abs(rdev)<0.04) rdev=(k%2?0.04:-0.04);
        rSpec.dev=rdev; rdevUsed=rdev; }
      var rG=B.buildBranch(rSpec, rTT);   /* KROK 2: koren = vlastni runa pramene (runeK), rovne dolu */
      var rspine=rG.paths[0].pts, rf=rbase.w/((rspine[0].w)||1), rdepth=rbase.depth+0.0007*k;
      for(var ri=0;ri<rspine.length;ri++){ var rtt=rspine[ri].t;
        rspine[ri].w*=rf*(1+(rootsT.junctionThick-1)*Math.pow(1-rtt,2)); rspine[ri].depth=rbase.depth; rspine[ri].ct=lerp(rootsT.ctNear,rootsT.ctFar,rtt); }
      /* twigy korene = ostatni paths, zvlast (napojene na spine, gap 0) */
      for(var rp2=1;rp2<rG.paths.length;rp2++){ var tp=rG.paths[rp2].pts;
        for(var tj=0;tj<tp.length;tj++){ tp[tj].w*=rf; tp[tj].depth=rdepth-0.05; tp[tj].ct=lerp(rootsT.ctNear,rootsT.ctFar,tp[tj].t); }
        roots.push({ pts:tp, el:rG.info.el, depth:rdepth-0.05, src:'koren', rune:runeK, k:k, pi:rp2, age01:_curAge01 });
        _pick.push({ k:'r'+k+'_'+rp2, pts:tp, meta:{ el:rG.info.el, aett:be.aett, world:be.world, name:runeName,
          g:(RBK[runeK]?RBK[runeK].g:null), count:'-', root:true, strand:k, rootDev:rdevUsed,
          runeN:(be.runeCnt&&be.runeCnt[runeK])||null } }); }
      return { rspine:rspine, rdepth:rdepth, rdevUsed:rdevUsed, rf:rf };
    }
    var mainInfo={};   /* verze B: co graduant potrebuje od rodice (patef vetve, vystup z kmene) */
    gt.limbs.forEach(function(L){
      var last=L.pts[L.pts.length-1];
      var rE=0; for(var ri0=L.pts.length-1;ri0>=0;ri0--){ if(L.pts[ri0].y>=trunkT.groundY-1){ rE=ri0; break; } }   /* KROK 3: baze = prvni bod od VRCHU na urovni zeme (prechod kmen<->koren). Backward-scan chyta i up-koren -> trunk-engine vlastni koren (0..rE) se VZDY vyloudi a nahradi composer korenem. */
      if(last.y<=trunkT.topY+2){
        var k=strandK++; strands.push({L:L,k:k});
        /* reflect trunk-base thickness into the root: stay fat just below the
           junction (mighty root flare), taper to normal toward the tip */
        if(rE>2){ for(var rj=0;rj<rE;rj++){ var ru=(rE-rj)/rE; L.pts[rj].w*=1+(rootsT.junctionThick-1)*Math.pow(1-ru,2); } }
        if(k<mainsN){   /* F0: hlavni vetev jen kde pramen ma tazenou runu; prebytek -> reinforce (posiluje) */
          /* EMERGE: strand -> main branch. Pozice = kostra (vudci nahoru + 2x45 + patra)
             + life-rune podpis. Charakter = element (dle mixu cteni) -> runa/barva/tip/rytmus.
             Velikost = vek pramene (zakladaci velke, nove male) x dominance elementu. */
          var be=branchEls[k]||branchEls[branchEls.length-1]||{el:'earth',world:'midgard',aett:'heimdall',count:5};
          var bpool=runesByEl[be.el]||B.RUNES;
          var seenK=(be.runeSeen&&be.runeSeen.length)?be.runeSeen:null;
          var brune=seenK ? (RBK[seenK[Math.min(be.ord||0, seenK.length-1)]]||bpool[0]) : bpool[k%bpool.length];   /* #2: main = ord-ta TAŽENÁ runa (sticky); demo bez logu -> kanon */
          var e=emergence(k);
          var ang=e.ang + lifeLean*0.6 + (be.areaLat||0)*crownT.areaSide;       /* KROK 2: area -> strana */
          var frac=clamp(e.frac + (be.intAxis||0)*crownT.intZone, 0.30, 0.98);   /* KROK 2: intention -> vyska (jemny posun) */
          var born=(k<3)?0:(k-2)*every, strandAge=realAge-born;
          var domV=clamp(be.count/rt.mx, 0.25, 1);            /* dominantni element = 1 */
          var sizeF=(0.35+0.65*ageLen(strandAge))*(0.6+0.5*domV);   /* born-visible: mlada vetev vyrasi na ~35% a doroste */
          var vigor=sizeF;
          /* F5: PRAXE = kolikrat je tato runa tazena. Log rust - bez stropu, ale zpomalujici
             (1x=0.55 · 3x=0.78 · 7x=1.00 · 15x=1.22 · 31x=1.45), takze ani 200x nevyjede z platna.
             emg = kratky nabeh (do ~90 dni), aby nova vetev nevyskocila rovnou v plne delce. */
          var runeN=(be.runeCnt&&be.runeCnt[brune.k])||1;
          var pf=0.62+0.27*Math.log(1+(runeN-1)/2)/Math.log(3);   /* 1x=0.62 · 10x=1.04 · 26x=1.26 · 60x=1.46 · 200x=1.76 (vejde se na platno) */
          var emg=clamp(strandAge/90, 0.35, 1);
          /* PHYSICAL variation (skalovane sliderem variace) + dominance hustota */
          _curAge01=clamp(strandAge/Math.max(1,trunkT.matureDays), 0, 1);
          var mr=mulberry32((dobSeed ^ (k*0x9e37) ^ 0x5bd1)>>>0); var vA=crownT.variace;
          var mcfg={}; for(var kk in crownT) mcfg[kk]=crownT[kk]; mcfg._k=k;   /* index pramene -> stabilni klice twigu */
          mcfg.curve=crownT.curve*(1+vA*((0.45+1.1*mr())-1));
          mcfg.wobble=crownT.wobble*(1+vA*((0.6+0.9*mr())-1));
          mcfg.childN=Math.min(6, Math.max(0, Math.round((crownT.childN/2)*(0.8+2.6*Math.min(1,vigor))*(1+vA*((0.5+1.0*mr())-1))*(0.7+0.5*domV))));
          mcfg.levelRatio=crownT.levelRatio*(1+vA*((0.9+0.16*mr())-1));
          /* AETT: charakter rustu dle dominantniho aett vetve (freya fluid/vzhuru · heimdall tezky/ukotveny · tyr smerovany/primy). Meni jen tvar, ne napojeni. */
          var ac=AETT_CHAR[be.aett]; if(ac){ var as=crownT.aettStr;
            mcfg.curve*=(1+(ac.curve-1)*as); mcfg.tipLift=crownT.tipLift*(1+(ac.tipLift-1)*as); mcfg.wobble*=(1+(ac.wobble-1)*as); }
          var lenF=pf*emg*(1+vA*0.045*(2*mr()-1));   /* F5: praxe x nabeh; nahoda jen +-3 % (drive +-28 % a prebijela data) */
          var ei=exitIndex(L.pts, frac);
          /* --- KOREN (composer, per-runa, dolu): SPINE se VPLETE do tahu kmene (jako vetev, jen dolu),
             twigy zvlast. Trunk-engine vlastni koren (0..rE) se NEkresli = vypnuty (KROK 3). --- */
          var _R=buildRootFor(L, rE, brune.k, brune.name, be, k, pf, emg, 1);
          var rspine=_R.rspine, rdepth=_R.rdepth, rdevUsed=_R.rdevUsed;
          /* JEDEN souvisly tah: koren-spine(spicka->baze) + kmen(nad bazi->vystup) + vetev = bezesve napojeni jako u vetve */
          var trunkPart=rspine.slice().reverse().concat(L.pts.slice(rE+1, ei+1));
          var ex=L.pts[ei], exq=L.pts[Math.max(0,ei-1)];
          var tang=Math.atan2(ex.y-exq.y, ex.x-exq.x);
          /* F1: odbocky = OSTATNI TAZENE runy elementu. slots = pocet run elementu-1 (KONSTANTA,
             nezavisi na tom kolik jich uz padlo) -> pozice odbocky je dana jeji runou a nehne se.
             g = rust z poctu tazeni te runy (1x = kratka, 5x+ = plna). */
          var twRunes=[], twSlots=Math.max(1,(bpool.length-1));
          var tu=function(key,isG){ return runeU(bpool, key, isG?crownT.gradU0:crownT.twU0,
                                                             isG?crownT.gradU1:crownT.twU1); };
          if(seenK){ var rcnt=(be.runeCnt||{}), gset=(be.runeGrad||{}), tslot=0;
            var others=[]; for(var ti=0;ti<seenK.length;ti++){ if(seenK[ti]!==brune.k) others.push(seenK[ti]); }
            /* F2: max 2 graduace na pramen - nejtazenejsi z tech, co prekrocily prah (sticky) */
            /* F2-fix: STICKY VYBER - kdo prekrocil prah driv, ten graduuje a uz o to neprijde.
               Drive "dva nejtazenejsi" -> jedno cteni prehodilo poradi, graduant se vymenil
               a jeho odbocky se prerodicovaly (viditelne preskupeni vetve). */
            var gsel=others.filter(function(x){ return gset[x]; })
                           .sort(function(a,b){ return (gset[a]-gset[b]) || (others.indexOf(a)-others.indexOf(b)); })
                           .slice(0,2);
            var isG={}; gsel.forEach(function(x){ isG[x]=1; });
            /* runy tazene PO graduantovi visi na nem (rodic-dite: vyrostly z te praxe) */
            var host=null;
            for(var tj=0;tj<others.length;tj++){ var rk2=others[tj];
              var tn=rcnt[rk2]||1, tg=0.55+0.45*Math.min(1,(tn-1)/4);
              /* F9: ODBOCKA ZA KAZDY VYSKYT. Prvni tazeni = odbocka na miste sve runy (zlaty rez),
                 kazde dalsi `twigPer` tazeni prida vyhon VEDLE ni (stridave nad/pod) - shluk je
                 zadouci, cte se jako "sem chodis casto". Strop `twigMax` drzi citelnost. */
              var reps=1+Math.floor((tn-1)/Math.max(1,crownT.twigPer));
              var baseU=tu(rk2, !!isG[rk2]);
              for(var rp=0; rp<reps; rp++){
                if(twRunes.length>=crownT.twigMax) break;
                var uu=clamp(baseU + rp*crownT.twigSpread*((rp%2)?-1:1), crownT.twU0, crownT.twU1);
                var gg=Math.max(0.45, tg*(1-0.10*rp));          /* opakovani jsou drobnejsi */
                if(rp===0 && isG[rk2]){ var ge={ k:rk2, slot:tslot, slots:twSlots, g:1.35, grad:true, kids:[], n:tn, u:uu };
                  twRunes.push(ge); tslot++; host=ge; }
                else if(rp===0 && host && host.kids.length < crownT.kidsMax){
                  host.kids.push({ k:rk2, slot:host.kids.length, slots:twSlots, g:tg, n:tn, u:uu }); }
                else { twRunes.push({ k:rk2, slot:tslot, slots:twSlots, g:gg, n:tn, u:uu, rep:rp }); tslot++; }
              } } }
          else { for(var tc=1;tc<=Math.max(0,Math.round(mcfg.childN))+1;tc++){ var dk=bpool[(k+tc)%bpool.length].k;
                   twRunes.push({ k:dk, slot:tc-1, slots:twSlots, g:1, u:tu(dk,false) }); } }
          /* F10: zrcadlit prvnich `mirrorN` korunnich odbocek do korene (tytez runy, dolu) */
          for(var mi=0; mi<twRunes.length && mi<Math.round(rootsT.mirrorN); mi++){
            var mt=twRunes[mi];
            mirrorTwig(roots, _pick, rspine, (mt.u!=null?mt.u:0.5), mt.k, rootsT,
                       (dobSeed^(k*0x9b1)^(mi*0x2f5))>>>0,
                       rootsT.length*rootsT.mirrorLen*pf*emg, rdepth-0.05, k, mi, be);
          }
          var _cStart=crown.length;   /* vse, co growBranch prida, patri TETO vetvi -> otagovat k */
          var mainLimb=growBranch(crown, mcfg, ex.x, ex.y, tang, ang-tang, 'main', brune.k,
                     (dobSeed ^ (k*0x9e37))>>>0, lenF, ex.w, ex.depth, 0, sizeF, twRunes);
          /* verze B: patef vetve se za chvili prepise (dole se k ni prilepi kmen), takze
             kopie TED. Graduant se po ni povede zevnitr az k mistu, kde se odlepi. */
          if(mainLimb) mainInfo[k]={ spine:mainLimb.pts.slice(), ei:ei, be:be, pf:pf, emg:emg, el:be.el };
          for(var ct=_cStart; ct<crown.length; ct++){ crown[ct].k=k; crown[ct].age01=_curAge01; }
          if(mainLimb){ mainLimb.pts = trunkPart.concat(mainLimb.pts); mainLimb.src='vetev'; mainLimb.k=k;
            mainLimb.age01 = clamp(strandAge/Math.max(1,trunkT.matureDays), 0, 1);   /* pro `kuraVek` */
            _pick.push({ k:k, pts:mainLimb.pts, meta:{ el:be.el, aett:be.aett, world:be.world, name:brune.name, g:brune.g, count:be.count,
              idx:k, ord:be.ord, runeN:(be.runeCnt&&be.runeCnt[brune.k])||null,
              frac:frac, eFrac:e.frac, intPart:(be.intAxis||0)*crownT.intZone,
              ang:ang, eAng:e.ang, leanPart:lifeLean*0.6, areaPart:(be.areaLat||0)*crownT.areaSide,
              born:born, strandAge:strandAge, domV:domV, sizeF:sizeF, lenF:lenF, rootDev:rdevUsed,
              tw:twRunes.map(function(t){ return { name:(RBK[t.k]?RBK[t.k].name:t.k), n:t.n||0, g:t.g, grad:!!t.grad, rep:t.rep||0, pick:('t'+k+'_'+t.k+(t.rep?('_'+t.rep):'')),
                pramen:!!(crownT.gradStrand && gradStrands.some(function(G){ return G.p===k && G.rune===t.k; })),
                kids:(t.kids||[]).map(function(x){ return { name:(RBK[x.k]?RBK[x.k].name:x.k), pick:('t'+k+'_'+x.k) }; }) }; }) } }); }
        } else if(crownT.gradStrand && gradStrands[k-mainsN] && mainInfo[gradStrands[k-mainsN].p]){
          /* VERZE B -- GRADUANT JAKO PRAMEN. Jedna souvisla cara:
             koren -> kmen (vedle rodice, vynori se v JEHO vystupu) -> uvnitr rodicovske vetve
             -> odlepi se na sve pozici u (1/5-3/5, pravidlo F2). Vetev graduanta uz kresli
             growBranch rodice, takze tady koncime presne v jejim pocatecnim bode = bezesve. */
          var GS=gradStrands[k-mainsN], par=mainInfo[GS.p], sM=clamp(crownT.gradStrandW,0.15,1);
          var GR=buildRootFor(L, rE, GS.rune, GS.name, par.be, k, par.pf, par.emg, sM);
          var gTrunk=GR.rspine.slice().reverse().concat(L.pts.slice(rE+1, par.ei+1));
          for(var gw=0; gw<gTrunk.length; gw++) gTrunk[gw]={ x:gTrunk[gw].x, y:gTrunk[gw].y,
            ct:gTrunk[gw].ct, depth:gTrunk[gw].depth-0.02, w:gTrunk[gw].w*sM };
          /* spojka uvnitr rodicovske vetve: odsazena o gradGap px na stranu, kam graduant
             odejde, a odsazeni se ztraci k nule presne v miste odlepeni -> navaze bezesve. */
          var ps=par.spine, pidx=Math.max(1, Math.min(ps.length-1, Math.round(GS.u*(ps.length-1))));
          var gside=(GS.slot%2===0)?1:-1, conn=[];
          /* graduant vystupuje z kmene o svou drahu vedle rodice -> spojka musi zacit PRESNE
             tam (jinak skok). Odchylka se linearne ztraci a mezi prameny se udela oblouk
             (sin = nula na obou koncich), takze se viditelne pletou a v miste odlepeni splynou. */
          var gEnd=gTrunk[gTrunk.length-1], d0x=gEnd.x-ps[0].x, d0y=gEnd.y-ps[0].y;
          for(var ci3=0; ci3<=pidx; ci3++){
            var sp=ps[ci3], sq=ps[Math.max(0,ci3-1)], t3=(pidx?ci3/pidx:1);
            var ta=Math.atan2(sp.y-sq.y, sp.x-sq.x);
            var bulge=Math.sin(Math.PI*t3)*crownT.gradGap*gside;
            conn.push({ x:sp.x + (1-t3)*d0x + Math.cos(ta+Math.PI/2)*bulge,
                        y:sp.y + (1-t3)*d0y + Math.sin(ta+Math.PI/2)*bulge,
                        ct:sp.ct, depth:sp.depth-0.02, w:sp.w*lerp(0.60,0.28,t3)*sM });
          }
          var gPts=gTrunk.concat(conn);
          all.push({ pts:gPts, depth:L.depth, el:par.el, src:'vetev', k:GS.p, age01:_curAge01 });
          _pick.push({ k:'g'+GS.p+'_'+GS.rune, pts:gPts, meta:{ el:par.el, aett:par.be.aett, world:par.be.world,
            name:GS.name, count:'-', gradStrand:true, strand:GS.p, mirrorU:GS.u,
            runeN:(par.be.runeCnt&&par.be.runeCnt[GS.rune])||null } });
        } else {
          /* REINFORCE: extra strand stays as trunk MASS (no new branch). Taper its
             top to ~0 so it MELTS into the bundle (no floating blunt stub). */
          var mh=0.40+0.26*(((k*2654435761)>>>0)%100)/100;
          var mi=exitIndex(L.pts, mh);
          var mp=L.pts.slice(rE, mi+1), mn=mp.length, fade=Math.max(2,Math.round(mn*0.32));
          for(var mq=0;mq<fade;mq++){ var mid=mn-1-mq, ff=mq/fade; mp[mid]={x:mp[mid].x,y:mp[mid].y,ct:mp[mid].ct,depth:mp[mid].depth,w:mp[mid].w*ff*ff}; }
          all.push({ pts:mp, depth:L.depth, el:el, src:'reinforce', k:k });
        }
      }
      /* KROK 3: nedodelany pramen (nedosahne koruny) se NEkresli — zadne plovouci ulomky nad zemi */
    });

    /* #3 KORENY se stavi uz v crown loopu vyse: composer koren (buildBranch, per-runa)
       spliced do souvisleho tahu koren->kmen->vetev + runove korinky pushnute do roots[].
       = STEJNY mechanismus jako vetev, jen dolu. */

    crown.forEach(function(L){ all.push(L); });
    roots.forEach(function(L){ all.push(L); });
    all.sort(function(a,b){ return a.depth-b.depth; });
    all=all.filter(function(L){ return !(L.k!=null && _hidden[L.k]); });   /* vypnute vetve se nekresli */

    /* AUTO-FIT: skutecny obalovy obdelnik vs platno. Zmensujeme KOLEM PATY KMENE (cx,groundY),
       takze cara zeme zustava na miste. Nikdy nezvetsujeme (max 1). */
    var _pad=8, bx0=1e9, bx1=-1e9, by0=1e9, by1=-1e9;
    all.forEach(function(L){ for(var bi=0;bi<L.pts.length;bi++){ var q=L.pts[bi];
      if(q.x<bx0)bx0=q.x; if(q.x>bx1)bx1=q.x; if(q.y<by0)by0=q.y; if(q.y>by1)by1=q.y; } });
    var _ax=trunkT.cx, _ay=trunkT.groundY;
    _fit=1;
    if(bx1>_ax) _fit=Math.min(_fit, (W-_pad-_ax)/(bx1-_ax));
    if(bx0<_ax) _fit=Math.min(_fit, (_ax-_pad)/(_ax-bx0));
    if(by0<_ay) _fit=Math.min(_fit, (_ay-_pad)/(_ay-by0));
    if(by1>_ay) _fit=Math.min(_fit, (H-_pad-_ay)/(by1-_ay));
    _fit=clamp(_fit, 0.25, 1);
    ctx.save();
    ctx.translate(_ux,_uy); ctx.scale(_uz,_uz);           /* zoom/posun uzivatele (kolecko mysi) */
    ctx.translate(_ax,_ay); ctx.scale(_fit,_fit); ctx.translate(-_ax,-_ay);

    /* 1. pruchod = objem (stiny presahujici obrys), 2. pruchod = tela. Kdyby se to delalo
       limb po limbu, stin pozdejsiho pramene by ztmavil telo drivejsiho. */
    if(state.gl){
      /* GL kresli telo stromu; 2D platno si nechava caru zeme a zlate zvyrazneni.
         Body jsou v souradnicich MODELU -> tady se na ne pusti tataz transformace
         (auto-fit kolem paty kmene + zoom uzivatele) a rovnou v device pixelech. */
      var _ax2=trunkT.cx, _ay2=trunkT.groundY, _f=_fit, _z=_uz;
      var xf=function(v, isY){ var t = isY ? (_ay2+(v-_ay2)*_f)*_z+_uy : (_ax2+(v-_ax2)*_f)*_z+_ux;
        return t*dpr; };
      glRender(all, el, xf);
    } else {
      if(state.skin) all.forEach(function(L){ paintAura(L.pts, L.el||el, crownT.objem); });
      all.forEach(function(L){ paintLimb(L.pts, L.el||el, state.skin, crownT.textura, L); });
    }
    _dbgAll=all;
    /* DEBUG zdroj: obarvi kazdy kus podle KODU co ho vyrobil; CERVENE = podezrele
       (koren nad zem / kmen+vetev pod zem). Klik -> zdroj + strand#. Umis oznacit spatne koreny. */
    if(state.dbg){ var gY=trunkT.groundY;
      all.forEach(function(L){
        for(var ds=0;ds<L.pts.length-1;ds++){ var da=L.pts[ds], db2=L.pts[ds+1], dmy=(da.y+db2.y)/2;
          var col=(L.src==='minor')?'#ff9500':(dmy>gY-2?'#34c759':'#8e8e93');   /* pod zem = koren (zelene), nad zem = kmen/vetev (sede), minor = oranzove */
          ctx.save(); ctx.strokeStyle=col; ctx.lineWidth=1.5; ctx.globalAlpha=0.95; ctx.lineCap='round';
          ctx.beginPath(); ctx.moveTo(da.x,da.y); ctx.lineTo(db2.x,db2.y); ctx.stroke(); ctx.restore(); } });
      ctx.save(); ctx.font='13px Georgia'; ctx.textAlign='left';
      [['#34c759','koren (pod zem)'],['#8e8e93','kmen+vetev (nad zem)'],['#ff9500','minor pramen (nedodelany)']].forEach(function(it,li){ ctx.fillStyle=it[0]; ctx.fillRect(12,12+li*20,14,14); ctx.fillStyle='#e8e8e8'; ctx.fillText(it[1],32,12+li*20+12); });
      ctx.fillStyle='#e8e8e8'; ctx.fillText('klikni na kus -> zdroj + strand#', 12, 12+3*20+14); ctx.restore();
    }
    /* highlight the inspected branch */
    if(_selK!=null && !_hidden[branchOf(_selK)]){ var sp=null; for(var pi=0;pi<_pick.length;pi++){ if(_pick[pi].k===_selK) sp=_pick[pi]; }
      if(sp){ ctx.save(); ctx.strokeStyle='rgba(255,191,0,0.75)'; ctx.lineWidth=2;
        ctx.beginPath(); for(var qi=0;qi<sp.pts.length;qi++){ var q=sp.pts[qi]; qi?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y); } ctx.stroke(); ctx.restore(); } }
    ctx.restore();   /* konec AUTO-FIT transformace */

    var months=Math.round(realAge/30.4);
    var mix=els.slice().sort(function(a,b){return b.count-a.count;}).map(function(e){return e.el+' '+Math.round(100*e.count/rt.total)+'%';}).join(' · ');
    document.getElementById('ageread').textContent='vek '+realAge+' dni (~'+months+' mes) · '+nR+' cteni · '+mainsN+' vetvi';
    document.getElementById('logread').textContent = useLog ? (vlog.length+' cteni'+(state._viewN!=null?(' / '+state.log.length+' (prehravani)'):' v logu (strom z realnych cteni)')) : 'log prazdny -> TREE AGE slider (demo rezim)';
    document.getElementById('grow').innerHTML=
      'vek <b>'+realAge+'</b> dni (~'+months+' mes) &middot; cteni <b>'+nR+'</b><br>'+
      'prameny <b>'+(gt.info.strandN||mainsN)+'</b> &rarr; vetvi <b>'+mainsN+'</b> (cap '+Math.round(crownT.maxMains)+') &middot; koreny '+roots.length+'<br>'+
      'mix elementu: <span style="color:var(--dim)">'+(mix||'-')+'</span><br>'+
      'expanze: vyska '+Math.round(hExp*100)+'% &middot; sirka '+Math.round(wExp*100)+'% &middot; mohutnost '+Math.round(mExp*100)+'%'+
      (_fit<0.999?('<br><span style="color:var(--gold)">fit: strom zmensen na '+Math.round(_fit*100)+' %, aby se vesel na platno</span>'):'')+
      (_uz>1.0001?('<br><span style="color:var(--gold)">zoom '+Math.round(_uz*100)+' % &middot; tazenim posunes, dvojklik = zpet</span>'):'');
    renderBTable();
    /* DETAIL MUSI ODPOVIDAT TOMU, CO JE PRAVE NAKRESLENE. Dosud se psal jen pri kliku, takze
       po kazde zmene dat (prehravani, posuvnik, +cteni) zustal viset na starem stavu -- clovek
       mel oznacenou jednu vetev a cetl cisla jine, nebo uz neexistujici. */
    if(_selK!=null){
      var _sp2=null; for(var _qi=0;_qi<_pick.length;_qi++){ if(String(_pick[_qi].k)===String(_selK)) _sp2=_pick[_qi]; }
      if(_sp2) showInspect(_sp2.meta);
      else { _selK=null; document.getElementById('inspect').innerHTML=
        '&mdash; '+D2('vybrana cast uz na strome neni (zmenila se data) &mdash; klikni znovu')+' &mdash;'; }
    }
    document.getElementById('info').innerHTML=
      'life rune <b>'+gt.info.rune.name+'</b> '+gt.info.rune.g+' &middot; element <b>'+el+'</b> &middot; otisk #'+(gt.info.dobSeed%10000)+'<br>'+
      'naklon <b>'+gt.info.leanLabel+'</b>';
  }
  cv.addEventListener('click', function(e){
    if(_drag.moved) return;              /* bylo to tazeni (posun), ne vyber */
    var rect=cv.getBoundingClientRect();
    var mx=(e.clientX-rect.left)*(W/rect.width), my=(e.clientY-rect.top)*(H/rect.height);
    /* zpetny prepocet: nejdriv zoom uzivatele, pak AUTO-FIT (body v _pick jsou v souradnicich MODELU) */
    mx=(mx-_ux)/_uz; my=(my-_uy)/_uz;
    mx=trunkT.cx+(mx-trunkT.cx)/_fit; my=trunkT.groundY+(my-trunkT.groundY)/_fit;
    if(state.dbg){ var gb=null,gbd=20; for(var gi=0;gi<_dbgAll.length;gi++){ var GL=_dbgAll[gi]; for(var gj=0;gj<GL.pts.length;gj++){ var gdx=GL.pts[gj].x-mx, gdy=GL.pts[gj].y-my, gd=Math.sqrt(gdx*gdx+gdy*gdy); if(gd<gbd){gbd=gd;gb=GL;} } }
      if(gb){ var gY2=trunkT.groundY, ab=false, be2=false; for(var gk=0;gk<gb.pts.length;gk++){ if(gb.pts[gk].y<gY2-3)ab=true; if(gb.pts[gk].y>gY2+3)be2=true; }
        document.getElementById('inspect').innerHTML='<b style="color:var(--gold)">ZDROJ: '+(gb.src||'?')+'</b>'+(gb.rune?(' &middot; runa '+gb.rune):'')+'<br>nad zem: <b>'+(ab?'ANO':'ne')+'</b> &middot; pod zem: <b>'+(be2?'ANO':'ne')+'</b>'+(gb.k!=null?('<br>strand #'+gb.k+(gb.pi!=null?(' &middot; path '+gb.pi):'')):''); }
      else document.getElementById('inspect').innerHTML='&mdash; nic tu &mdash;';
      return; }
    var best=null, bd=22;
    for(var pi=0;pi<_pick.length;pi++){ var p=_pick[pi];
      if(_hidden[String(p.k).replace(/^t(\d+)_.*/,'$1')]) continue;   /* schovanou vetev nelze trefit klikem */
      for(var i=0;i<p.pts.length;i++){ var dx=p.pts[i].x-mx, dy=p.pts[i].y-my; var d=Math.sqrt(dx*dx+dy*dy); if(d<bd){bd=d;best=p;} } }
    if(best){ _selK=best.k; showInspect(best.meta); }
    else { _selK=null; document.getElementById('inspect').innerHTML='&mdash; klikni na vetev ve stromu &mdash;'; }
    draw();
  });
  /* ---- ZOOM KOLECKEM + POSUN TAZENIM + DVOJKLIK = RESET ----
     Zoom se deje KOLEM KURZORU: bod pod mysi zustava na miste, takze se soucasne
     priblizuje i "cestuje" - proto nepotrebuje zvlast posuvniky. Spodni mez je 1
     (auto-fit uz strom vejde cely), takze oddalit pod celek nejde. */
  var _drag={on:false, moved:false, x:0, y:0};
  function cvXY(e){ var r=cv.getBoundingClientRect();
    return { x:(e.clientX-r.left)*(W/r.width), y:(e.clientY-r.top)*(H/r.height) }; }
  function zoomAt(px, py, k){
    var f0x=(px-_ux)/_uz, f0y=(py-_uy)/_uz;      /* bod v souradnicich auto-fitu (ten se nemeni) */
    var nz=clamp(_uz*k, 1, 12);
    _ux=px-f0x*nz; _uy=py-f0y*nz; _uz=nz;
    if(_uz<=1.0001){ _uz=1; _ux=0; _uy=0; }      /* na 1 presne zpet, at nezustane posunuty */
    clampPan(); draw();
  }
  function clampPan(){                            /* nepustit strom uplne mimo platno */
    var m=Math.min(W,H)*0.35;
    _ux=clamp(_ux, -(W*_uz-m), m); _uy=clamp(_uy, -(H*_uz-m), m);
  }
  function zoomReset(){ _uz=1; _ux=0; _uy=0; draw(); }
  cv.addEventListener('wheel', function(e){
    e.preventDefault();
    var p=cvXY(e);
    var d=e.deltaY*(e.deltaMode===1?16:(e.deltaMode===2?H:1));   /* radky/stranky -> pixely */
    zoomAt(p.x, p.y, Math.pow(0.9988, d));
  }, {passive:false});
  cv.addEventListener('mousedown', function(e){ if(e.button!==0) return;
    var p=cvXY(e); _drag={on:true, moved:false, x:p.x, y:p.y}; });
  window.addEventListener('mousemove', function(e){ if(!_drag.on) return;
    var p=cvXY(e), dx=p.x-_drag.x, dy=p.y-_drag.y;
    if(!_drag.moved && Math.abs(dx)+Math.abs(dy)<4) return;      /* male chveni = porad klik */
    _drag.moved=true; _drag.x=p.x; _drag.y=p.y;
    _ux+=dx; _uy+=dy; clampPan(); draw(); });
  window.addEventListener('mouseup', function(){ if(!_drag.on) return;
    _drag.on=false; setTimeout(function(){ _drag.moved=false; }, 0); });   /* az PO click udalosti */
  cv.addEventListener('dblclick', function(e){ e.preventDefault(); zoomReset(); });
  cv.style.cursor='pointer';
  /* klik na runu v seznamu ODBOCKY (i v "nese ...") -> oznaci tu vetev ve strome */
  /* Vyber casti stromu podle data-pick. POZOR: klic hlavni vetve je CISLO, klic odbocky RETEZEC,
     a getAttribute vraci vzdy retezec -> porovnavat pres String(), jinak `===` tise selze
     (presne tim nefungoval klik v tabulce). _selK se pak ulozi v PUVODNIM typu, at sedi
     i strict porovnani ve vykreslovani. */
  function selectPick(want){
    var find=function(){ for(var i=0;i<_pick.length;i++){ if(String(_pick[i].k)===want) return _pick[i]; } return null; };
    var sp=find(); if(!sp) return false;
    _selK=sp.k; applySolo(); draw();
    sp=find(); if(sp) showInspect(sp.meta);
    return true;
  }
  function onPickClick(e){
    var t=e.target, el=null;
    while(t && t!==this){ if(t.getAttribute && t.getAttribute('data-pick')){ el=t; break; } t=t.parentNode; }
    if(!el) return;
    e.preventDefault();
    selectPick(el.getAttribute('data-pick'));
  }
  document.getElementById('btable').addEventListener('click', function(e){
    var t=e.target, v=null;
    while(t && t!==this){ if(t.getAttribute && t.getAttribute('data-vis')!=null){ v=t; break; } t=t.parentNode; }
    if(!v) return;                       /* neni to prepinac -> necha probublat na vyber radku */
    e.stopPropagation();                 /* capture faze -> onPickClick se uz nespusti */
    var kk=v.getAttribute('data-vis');
    _solo=false;                         /* rucni skladani sestavy prebiji solo */
    if(_hidden[kk]) delete _hidden[kk]; else _hidden[kk]=1;
    /* prepnuti viditelnosti je taky "divam se ted na tuhle vetev" -> vypsat JEJI detail.
       Drive se prekreslil strom, ale inspekce zustala viset na drive vybrane vetvi. */
    if(!selectPick(kk)) draw();
  }, true);
  document.getElementById('btable').addEventListener('click', onPickClick);
  document.getElementById('inspect').addEventListener('click', onPickClick);

  /* casova osa: vykresli strom ve 4 vecich do nahledu (on-demand) */
  document.getElementById('timeline-btn').addEventListener('click', function(){
    var strip=document.getElementById('timeline'); strip.innerHTML='';
    var ages=[180,365,730,1000], cur=state.treeAge, selPrev=_selK; _selK=null;
    ages.forEach(function(ag){ state.treeAge=ag; draw();
      var img=new Image(); img.src=cv.toDataURL('image/jpeg',0.5);
      img.style.width='24%'; img.style.borderRadius='3px'; img.title=ag+' dni'; strip.appendChild(img); });
    state.treeAge=cur; _selK=selPrev; ageSlider.value=cur; draw();
  });

  window._draw=draw; renderHist(); draw();
})();
</script>
</body>
</html>
"""

HTML = HTML.replace('BUILD_TOKEN', str(int(time.time())))

p = os.path.join(DST, 'crown-composer.html')
with io.open(p, 'w', encoding='utf-8', newline='\n') as f:
    f.write(HTML)
print('written', p, len(HTML), 'chars')
