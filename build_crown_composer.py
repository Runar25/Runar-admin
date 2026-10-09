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
  <div class="sub" style="color:var(--gold)">verze labu: BUILD_HUMAN &middot; nevidis-li tenhle cas, mas starou verzi (Ctrl+F5)</div>
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
        <div style="font-size:.58em;color:var(--dim);letter-spacing:.1em;margin:6px 0 3px">SEEKING &rarr; vyska (jemne)</div>
        <div class="btnrow" id="pick-seek">
          <button class="jb" data-seek="general">obecne</button>
          <button class="jb" data-seek="clarity">jasnost</button>
          <button class="jb" data-seek="confirmation">potvrzeni</button>
          <button class="jb" data-seek="insight">vyzva</button>
          <button class="jb" data-seek="reflection">uvaha</button>
          <button class="jb" data-seek="__rnd">nahodne</button>
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
        <div class="lbl sec" id="park-head" style="margin-top:10px;cursor:pointer"><span id="park-arrow">&#9656;</span> ODLOZENO &middot; kura (kresli jen rezim kuze / WebGL)</div>
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
  var _ownMain={};   /* runy, ktere uz maji vlastni pramen (plni draw) — ty nevisi jako odbocky */
  var _RUZ={};       /* V4: zona run 0..1 pro odstepeni graduanta (F2: 1/5–3/5 rodice) — plni draw */
  /* STRANA z oblasti cteni (2026-09-29): nitro doleva (-1), svet doprava (+1), stred/bez oblasti 0.
     Zdroj: RUNAR_TREE.md §3 (koruna+ven = Purpose/Career/Spirituality · kořeny+nitro = Healing/
     Family/Inner Growth · stred = Love/Crossroads). */
  function sideOf(area){ var v=(area!=null && AREA_LAT[area]!=null) ? AREA_LAT[area] : 0; return v>0.25?1:(v<-0.25?-1:0); }
  /* LEVA/PRAVA = NITRO/SVET (2026-09-29, KUKY: "leva a prava strana prvni"). Hodnota jednoho cteni
     na ose nitro(-) / svet(+): oblast (AREA_LAT); bez oblasti svet runy — placement §2: Hel mirne
     vlevo (skryte sily patri dovnitr), Asgard mirne vpravo (vyssi rad miri ven), Midgard stred. */
  var WORLD_LAT={ hel:-0.35, asgard:0.35, midgard:0 };
  function latOf(area, rk){ if(area!=null && AREA_LAT[area]!=null) return AREA_LAT[area];
    var w=RBK[rk]?RBK[rk].world:null; return (w && WORLD_LAT[w]!=null) ? WORLD_LAT[w] : 0; }
  /* VYSKA = CAS (osa A, 2026-10-02, KUKY: "kazdy vstup uzivatele si najde svoje misto ve strome… tva cteni jsou
     hodne o rodine, mas vetve blizko korene; koukas hodne do budoucnosti, tvuj strom je vysoky"). Zona JEDNOHO
     cteni (jedne runy v nem) na ose urd -1 (minulost, koreny) … skuld +1 (budoucnost, koruna). Zaklad = mapa
     vysky RUNAR_TREE.md §3: zamer 0,5 · oblast 0,3 · seeking 0,2 (prazdne pole se nepocita, vahy se rozdeli);
     pozice v rozkladu zonu URCUJE (placement: "pozice definuje zonu") -> 0,6 pozice + 0,4 kontext; bez
     kontextu svet runy (mirne ±0,6). Element jen jemne v zone (placement §3) — pricita se u ramene. */
  var INT_Z={ past:-1, present:0, decision:1 };
  var AREA_Z={ healing:-1, family:-1, inner:-1, love:0, crossroads:0, purpose:1, career:1, spirituality:1 };
  var SEEK_Z={ general:null, clarity:0, confirmation:0, insight:-1, reflection:-1 };
  var POS_Z={ norns:[-1,0,1], compass:[0,1,-1,-1,1], cross:[0,1,-1,-1,1], kriz:[0,1,-1,-1,1],
              horseshoe:[-1,0,1,0,1,-1,1], yggdrasil:[1,1,1,0,0,-1,-1,-1,-1] };
  var WORLD_Z={ asgard:0.6, midgard:0, hel:-0.6 };
  var ELEM_Z={ fire:0.15, air:0.10, water:-0.05, earth:-0.15, shadow:-0.25 };
  function readZone(rd, pos, rk){ if(!rd) return 0; var s2=0, w2=0;
    if(rd.intention!=null && INT_Z[rd.intention]!=null){ s2+=0.5*INT_Z[rd.intention]; w2+=0.5; }
    if(rd.area!=null && AREA_Z[rd.area]!=null){ s2+=0.3*AREA_Z[rd.area]; w2+=0.3; }
    if(rd.seeking!=null && SEEK_Z[rd.seeking]!=null){ s2+=0.2*SEEK_Z[rd.seeking]; w2+=0.2; }
    var ctx=w2 ? s2/w2 : null, pt=POS_Z[rd.spread], pz=(pt && pos!=null && pt[pos]!=null) ? pt[pos] : null;
    if(pz!=null) return (ctx!=null) ? 0.6*pz+0.4*ctx : pz;
    if(ctx!=null) return ctx;
    var wl=RBK[rk] ? RBK[rk].world : null; return (wl && WORLD_Z[wl]!=null) ? WORLD_Z[wl] : 0; }
  function zoneWord(z){ return z<-0.33 ? 'dole' : (z>0.33 ? 'nahore' : 'stred'); }
  /* ZONY × ELEMENTY (2026-10-03, KUKY: "14 ramen ok · tim nam zustava 11 ramen, ktera by mela byt zarazena jako graduanti,
     tam kde je to potreba · rozprostreni elementu neni systematicke · shadow muze byt na jakekoliv strane · 9 pramenu
     v korune je tak akorat, muze byt vic, ale byla potreba vyresit organizaci — zony to mohou resit"). Pramen = MISTO
     "element × pasmo zony": ohen/voda/vzduch/zeme maji tri pasma (urd dole · verdandi · skuld nahore), stin dve (na
     hranach mezi nimi, KUKY: "mozna muze byt na hrane mezi zonama") -> nejvys 14 ramen + az 11 povysenych run = 25 run.
     Strana se z elementu NEURCUJE (kostra FR + cteni). Drive pramen = element (5–7 ramen), druha pulka pramenu
     (graduanti) odbocovala az v korune -> KUKY videl "jen 5 hlavnich vetvi" a skrz strom bylo videt. */
  var BAND_NAME={ '-1':'urd (minulost)', '0':'verdandi (ted)', '1':'skuld (budoucnost)' };
  function bandOf(el, z){ if(el==='shadow') return (z<0) ? -1 : 1; return (z< -1/3) ? -1 : ((z>1/3) ? 1 : 0); }
  function bandC(el, b){ return (el==='shadow') ? b/3 : b*2/3; }                  /* stred pasma na ose zony */
  function bandLoHi(el, b){ if(el==='shadow') return (b<0) ? [-1,0] : (b>0 ? [0,1] : [-1/3,1/3]);
    return (b<0) ? [-1,-1/3] : (b>0 ? [1/3,1] : [-1/3,1/3]); }
  function bandWord(el, b){ if(el==='shadow') return (b<0) ? 'hrana urd/verdandi' : (b>0 ? 'hrana verdandi/skuld' : 'verdandi');
    return BAND_NAME[String(b)]; }
  /* TIHA CTENI (2026-10-03, KUKY: "kazdy strom roste jako proutek nahoru s vetvickami na stranach, ktere mohutni, pridavaji
     dalsi vetvicky, meni se na vetve a formuji se pod svoji tihou · ta runova cteni jsou ta tiha · neco je smeru nahoru,
     neco jineho do strany, dalsi dolu · i u zalozeni Noren"). Rameno se rodi v NEUTRALNI poloze (`bendN`, ~37° od
     svislice) a ohyba ho to, co do nej cteni prinesla: SMER = zona jeho cteni (budoucnost nahoru · ted do strany ·
     minulost dolu — svisla osa stromu je cas), SILA = kolik jich je (w = n / (n + bendK): jedno cteni skoro nic,
     bendK cteni napul). Nahrazuje uhel podle elementu (V4: zeme 65–80° … ohen 20–35°) — KUKY: "uhel dava element?
     proto vidim v obrazku hodne vodorovnych vetvi". */
  var BEND_UP=0.40, BEND_SIDE=1.20, BEND_DOWN=1.70;   /* uhel od svislice: budoucnost · ted · minulost */
  function bendTarget(z){ z=clamp(z,-1,1); return (z>=0) ? lerp(BEND_SIDE, BEND_UP, z) : lerp(BEND_SIDE, BEND_DOWN, -z); }
  function bendMag(mag0, zSum, n){ if(!n) return mag0; var K=Math.max(1, crownT.bendK||8), S=(crownT.bendStr!=null)?crownT.bendStr:1;
    return clamp(mag0 + (bendTarget(zSum/n)-mag0)*(n/(n+K))*S, 0.10, 1.75); }
  /* ROVNOVAHA RAMENE = vsechna cteni, ktera na nem visi (jeho runa + runy, co na nem rostou), pres
     jejich uzly v repTree. b = soucet / (pocet + lrK): tlumeni, aby prvni cteni rameno nesmetlo. */
  function limbBal(runes, rt){ var s=0, n=0, c={ nitro:0, svet:0, stred:0, bez:0 };
    var walk=function(nd, rk){ var v=latOf(nd.area, rk); s+=v; n++;
      var al=(nd.area!=null)?AREA_LAT[nd.area]:null;
      c[(al==null)?'bez':(al<-0.25?'nitro':(al>0.25?'svet':'stred'))]++;
      (nd.kids||[]).forEach(function(x){ walk(x, rk); }); };
    runes.forEach(function(rk){ if(rt && rt[rk]) walk(rt[rk], rk); });
    var K0=(crownT.lrK!=null)?crownT.lrK:5;   /* 3 -> 5: prvni cteni otacela ramenem o 5–7° */
    return { b:s/(n+K0), n:n, c:c }; }
  /* MEKKA ZED natoceni (2026-09-29): rameno zustava na strane, kam ho dala kostra (ref), aspon
     SW_IN (~10°) od svislice — natoceni ke stredu ho k ni jen priblizi, nikdy neprekroci (bez toho
     20 skoro svislych ramen na 24 modelovych stromech = "chuchvalec nahoru", KUKY 2026-09-28) —
     a nespadne niz nez SW_OUT (~100° od svislice). Vudci vetev (ref svisle) jen ten dolni strop. */
  var SW_IN=0.18, SW_OUT=1.75, SW_S=0.25;
  function softSide(a, ref){ var r0=ref+Math.PI/2, sd=(Math.abs(r0)<1e-6)?0:(r0>0?1:-1), x=a+Math.PI/2;
    if(!sd){ sd=(x>=0)?1:-1; x=Math.abs(x); } else { x=sd*x; if(x<2*SW_IN) x=SW_IN+SW_IN*Math.exp((x-2*SW_IN)/SW_IN); }
    if(x>SW_OUT-SW_S) x=SW_OUT-SW_S*Math.exp(-(x-(SW_OUT-SW_S))/SW_S);
    return -Math.PI/2 + sd*x; }
  /* STRANA RAMENE Z JEHO CTENI (LR5, 2026-09-29). Projde cteni stromu od zacatku; kazde, ktere
     padlo na rameno (runy v `set`), posune rovnovahu b = soucet / (pocet + lrK). Strana: vychozi
     = kostra (side0, stridave); JASNA prevaha na druhou stranu (|b| >= LR_ON) rameno preklopi,
     kdyz prevaha zmizi (< LR_OFF), vrati se. Cil = svislice + zivotni runa + strana x rozevreni
     kostry + areaSide x b. Rameno k cili jde nejvys o LR_STEP za cteni stromu (viz nize) -> zadny
     skok, prechod pres svislici trva nekolik cteni. Vudci vetev (side0 = 0) se jen nataci. */
  /* LR_STEP 0,105 rad za SVE cteni -> 0,044 za cteni STROMU (2026-09-30): graduant s par ctenimi se
     preklapel desitky cteni stromu a stal pritom svisle (7 na 24 modelovych stromech). Cil meni jen
     vlastni cteni ramene; rameno k nemu dojde plynule v case (2,5° za cteni). */
  var LR_ON=0.30, LR_OFF=0.12, LR_STEP=0.044;   /* ON 0,25/0,30/0,35 -> sklon 1,49/1,33/1,20 na 24 modelovych lidech (lreval); 0,30 = strom rekne jasne, nepreháni */
  /* birthAt (2026-09-30): cteni, kdy rameno VZNIKLO. Do te doby se jen sbira rovnovaha a strana
     (povyseny graduant uz ma za sebou nekolik cteni jako vetvicka); rameno se narodi ROVNOU na strane,
     kam ho ctenim patri. Bez toho se graduanty s malo ctenimi dlouho pretacely pres svislici
     (8 skoro svislych na 24 modelovych stromech, vsechny graduanty v prechodu). */
  /* ZONY (2026-10-03): clenstvi se urcuje PO CTENI (memb(i, j, runa)), ne mnozinou run — runa muze mit cteni ve trech
     zonach, a ty patri trem ramenum. Rozevreni se kazdym ctenim ohyba tihou (bendMag). */
  function limbPath(memb, lean0, mag0, side0, lg, birthAt){ var K0=(crownT.lrK!=null)?crownT.lrK:5, T=crownT.areaSide||0, B0=birthAt||0;
    var sd=side0, a=null, sv=0, svA=0, n=0, sw=0, zS=0, c={ nitro:0, svet:0, stred:0, bez:0 }, ON=(crownT.lrOn!=null)?crownT.lrOn:LR_ON;
    for(var i=0; i<lg.length; i++){ var rs=lg[i].runes||[], hit=false, ar=lg[i].area;
      for(var j=0; j<rs.length; j++){ if(!memb(i, j, rs[j].rune)) continue; hit=true; sv+=latOf(ar, rs[j].rune); n++; zS+=readZone(lg[i], j, rs[j].rune);
        if(ar!=null && AREA_LAT[ar]!=null) svA+=AREA_LAT[ar];   /* o strane rozhoduje jen OBLAST; svet runy (bez oblasti) jen mirne natoci (placement §2 "mirne") */
        var al=(ar!=null)?AREA_LAT[ar]:null; c[(al==null)?'bez':(al<-0.25?'nitro':(al>0.25?'svet':'stred'))]++; }
      var b=sv/(n+K0), bA=svA/(n+K0);
      if(hit && side0){ if(sd===side0){ if(bA*side0<=-ON){ sd=-side0; sw++; } } else if(bA*sd<LR_OFF){ sd=side0; sw++; } }
      if(i<B0) continue;                                    /* rameno jeste neni */
      var tgt=-Math.PI/2 + lean0 + (side0 ? sd*bendMag(mag0, zS, n) : 0) + T*b;   /* tiha: rozevreni podle zony a poctu cteni */
      if(a==null){ a=tgt; continue; }                       /* zrod: rovnou na svem cili */
      a+=clamp(tgt-a, -LR_STEP, LR_STEP); }                 /* pak k cili s KAZDYM ctenim stromu, nejvys o LR_STEP */
    return { ang:a, s:sd, b:n?sv/(n+K0):0, n:n, c:c, sw:sw, mag:bendMag(mag0, zS, n), z:n?zS/n:0 }; }
  /* TUHE OTOCENI (2026-09-29): natoceni za ctenimi otoci HOTOVE rameno i s jeho vetvemi kolem
     vystupu. Drive se pridavalo do `dev` enginu vetve — ten podle ZNAMENKA dev voli stranu ohybu,
     takze vudci vetev kolem svislice cely tvar zrcadlila (Algiz na ni skakal 18° <-> 62°). */
  function rotateFrom(arr, from, cx, cy, a){ if(!a) return; var c=Math.cos(a), sn=Math.sin(a), seen=new Set();
    for(var i=from; i<arr.length; i++){ var P=arr[i].pts; if(!P) continue;
      for(var j=0; j<P.length; j++){ var q=P[j]; if(seen.has(q)) continue; seen.add(q);
        var dx=q.x-cx, dy=q.y-cy; q.x=cx+dx*c-dy*sn; q.y=cy+dx*sn+dy*c; } } }
  /* RYTMUS runy z branch composeru (RUNE_CHAR.rhy / RUNE_TUNE.rhy) = kde na vetvi sedi jeji odbocky.
     Pasma = tatáz, jaka kresli branch composer (runar-branch.js). Poradi zrodu -> zlaty rez v pasmu,
     takze se misto nikdy neposune, kdyz pribude dalsi vetev. */
  function rhythmBand(rk){ var tu=(B.getRuneTune&&B.getRuneTune(rk))||{}, rc=(B.RUNE_CHAR&&B.RUNE_CHAR[rk])||{};
    var rhy=tu.rhy||rc.rhy||'alt', lo=0.42, hi=0.76;
    if(rhy==='base'){ lo=0.28; hi=0.58; } else if(rhy==='tip'){ lo=0.55; hi=0.95; } else if(rhy==='even'){ lo=0.28; hi=0.90; } else if(rhy==='opp'){ lo=0.40; hi=0.84; }
    return [lo, hi]; }
  function rhythmU(rk, ix){ var b=rhythmBand(rk); return b[0]+(b[1]-b[0])*(((ix+1)*0.6180339887)%1); }
  /* V4 (2026-10-02): cteni sedi v pasmu rytmu sve runy (identita z branch composeru), MISTO v pasmu dava jeho
     zona — minulost/rodina u zakladu vetve, budoucnost ke spicce; zlaty rez jen rozestup, at se neprekryvaji. */
  function zoneU(rk, ix, z){ var b=rhythmBand(rk), f=clamp((z+1)/2 + 0.14*((((ix+1)*0.6180339887)%1)-0.5), 0, 1); return b[0]+(b[1]-b[0])*f; }
  /* uzly opakovani -> seznam deti pro growBranch. Velikost: zrod `zrod`, dospela za `dorust` cteni
     stromu, pak s vlastnimi vetvemi dal pomalu (zakon praxe F5). Tvar: steering branch composeru. */
  /* MISTO VETVICKY NA RODICI (2026-10-03): rytmus RODICE (kam on dava sve odbocky) + poradi zrodu zlatym rezem — dve
     sourozenecke vetvicky tak nikdy nesedi na stejnem miste (prvnich 5 bodu zlateho rezu je od sebe aspon 0,146 pasma).
     Prime deti RAMENE maji misto predpocitane (`uo`, rozdelovac mist v drawu), aby se vyhnuly i povysenym vetvim.
     Drive 0,7 × zlaty rez + 0,3 × zona: dve vetvicky se mohly potkat na tomtez bode (KUKY: "nechci, aby vyrustaly dve
     nebo vice vetvi ze stejneho mista"). */
  function repKids(node, NR, lh, uo){ var zr=clamp(crownT.zrod||0.3,0.05,1), dr=Math.max(1,crownT.dorust||4);
    var pfv=function(x){ return 0.62+0.27*Math.log(1+(x-1)/2)/Math.log(3); };
    /* hlubsi urovne: tentyz rozdelovac mist (sourozenci v poradi zrodu, aspon DMIN_T od starsich) — uzky rytmus runy
       ('base' 0,28–0,58) jinak natlacil 4 vetvicky na 3–6 px od sebe (KUKYho strom, 359 cteni, tree_diag misto) */
    var placedK=[], uK=node.kids.map(function(c, ix){ var u=(uo && uo[ix]!=null) ? uo[ix] : freeSpot(rhythmU(node.k, ix), 0.08, 0.97, placedK, false); placedK.push({ u:u, g:false }); return u; });
    return node.kids.map(function(c, ix){ var age=NR-c.born, ramp=Math.min(1, zr+(1-zr)*Math.max(0,age-1)/dr);
      return { k:c.k, rep:true, slot:ix, slots:Math.max(1,Math.round(crownT.twigMax||5)), u:uK[ix], g:ramp*pfv(c.n)/pfv(1),
               n:c.n, side:sideOf(c.area), steer:{ area:c.area, intention:c.intention }, sid:1000+c.born*13+ix, id:c.born+'_'+ix, born:c.born,
               z:c.z, seeking:c.seeking,
               kids:repKids(c, NR, lh) }; }); }
  /* ROZDELOVAC MIST NA RAMENI (2026-10-03, KUKY: "nechci, aby vyrustaly dve nebo vice vetvi ze stejneho mista").
     Prime vetvicky ramene i povysene vetve z nej dostavaji misto v PORADI, jak prisly; kazda nova se drzi aspon
     DMIN_T (vetvicka × vetvicka) / DMIN_G (kdyz jde o povysenou) od vsech starsich na tomtez rameni. Misto se urci
     jednou pri zrodu a uz se nehne (zavisi jen na starsich). */
  var DMIN_T=0.08, DMIN_G=0.10, DEVMIN_G=0.20;   /* podil delky rodice: vetvicka × vetvicka · cokoli s povysenou */
  function freeSpot(want, lo, hi, placed, isG){ var best=null, bestD=-1;
    for(var k=0; k<=200; k++){ var off=(k===0)?0:((k%2?1:-1)*Math.ceil(k/2)*0.005), u=want+off; if(u<lo || u>hi) continue;
      var md=1e9, ok=true; for(var p=0; p<placed.length; p++){ var d=Math.abs(u-placed[p].u), need=(isG || placed[p].g) ? DMIN_G : DMIN_T;
        if(d<need) ok=false; md=Math.min(md, d-need); }
      if(ok) return u; if(md>bestD){ bestD=md; best=u; } }
    return (best!=null) ? best : clamp(want, lo, hi); }
  /* steering branch composeru ma vlastni klice (runar-branch.js AREA_LAT/INTENT_ELEV) */
  var STEER_AREA={ love:'love_relationships', family:'family', healing:'healing', inner:'inner_growth', spirituality:'spirituality', crossroads:'crossroads', purpose:'purpose', career:'career' };
  var STEER_INT={ past:'understanding_past', present:'right_now', decision:'decision_ahead' };
  var _runeHost={};  /* runa -> index pramene, na jehoz vetvi roste (stableAssign) */
  var _KU={};        /* ZONY: misto primych vetvicek ramene q (podle poradi ix) — rozdelovac mist v drawu */
  /* VYSKA KMENE — JEDNA rovnice pro draw, kapacitu (stableAssign) i casovou smycku vysek (2026-10-03): vek × treeHeightMax ×
     velke spready ohne/vzduchu × celkova zona cteni. Drive tri kopie a casova smycka brala vysku z posledniho cteni pro celou
     historii -> ramena si mezi ctenimi menila poradi (Laguz 15 % -> 51 % -> 16 %, KUKYho strom #58–60). */
  function trunkTopY(age, bigH, zSum, zN){ var hf=age/(age+420), hX=Math.min(1.2, bigH/18), Zt=zN ? zSum/(zN+8) : 0;
    return clamp(trunkT.groundY - lerp(180, trunkT.treeHeightMax, hf)*(1+0.2*hX)*(1+0.22*Zt), 110, trunkT.groundY-110); }
  var SEED_AGE0=25;   /* = SEED_AGE v drawu (vek seminka); stableAssign z nej pocita vysku kmene pri kazdem cteni */
  var _hwTop=null;   /* PROPORCE: vrchol kmene pro druhy pruchod drawu (kmen doroste k sirce koruny), jinak null */
  var _ANG=[], _GANG=[], _GTURN=[];   /* uhel ramen v case (casova smycka vysek v drawu); _GTURN = smer odbocky povysene */
  var _runeTot={}, _vlogRef=[];   /* INSPEKCE (2026-10-03): kolikrat runa padla na celem strome + log, ze ktereho se prave kreslilo */
  /* PREHLED VETVI: hodnoty vedle sebe (prehlednejsi nez cist ze stromu). Cte TATAZ meta,
     co pohani inspekci -> zadny druhy zdroj pravdy, nemuze se rozejit. */
  function renderBTable(){
    var el=document.getElementById('btable'); if(!el) return;
    var rows=_pick.filter(function(p){ return p.meta && p.meta.idx!=null; })
                  .sort(function(a,b){ return a.meta.idx-b.meta.idx; });
    if(!rows.length){ el.innerHTML='<span style="color:var(--dim)">zadne hlavni vetve</span>'; return; }
    var h='<table style="width:100%;border-collapse:collapse;font-size:0.92em">'+
      '<tr style="color:var(--dim);text-align:left">'+
      '<th></th><th>#</th><th>runa</th><th>elem</th><th style="text-align:right">cteni</th>'+
      '<th style="text-align:right">delka</th><th style="text-align:right">tloust.</th>'+
      '<th style="text-align:right">vetv.</th><th style="text-align:right">povys.</th></tr>';
    var tot={n:0,od:0,gr:0};
    rows.forEach(function(p){ var m=p.meta, tw=m.tw||[], gr=m.gradOf?0:(m.nGrad||0);   /* povysene z tohoto ramene (drive t.grad = vzdy 0) */
      var cn=(m.ownN!=null)?m.ownN:(m.runeN||0); tot.n+=cn; tot.od+=tw.length; tot.gr+=gr;
      var sel=(String(_selK)===String(p.k));
      var vis=!_hidden[p.k];
      h+='<tr data-pick="'+p.k+'" style="cursor:pointer'+(sel?';color:var(--gold)':'')+(vis?'':';opacity:.4')+'">'+
         '<td data-vis="'+p.k+'" title="zapnout/vypnout vetev" style="cursor:pointer;color:'+(vis?'var(--gold)':'var(--dim)')+'">'+(vis?'\u25cf':'\u25cb')+'</td>'+
         '<td>'+(m.idx+1)+'</td><td><b>'+m.name+'</b></td>'+
         '<td style="color:var(--dim)">'+m.el+(m.zoneS?(' · '+m.zoneS):'')+'</td>'+
         '<td style="text-align:right">'+cn+'</td>'+
         '<td style="text-align:right">x'+(m.lenF!=null?m.lenF.toFixed(2):'?')+'</td>'+
         '<td style="text-align:right">'+(m.sizeF!=null?m.sizeF.toFixed(2):'?')+'</td>'+
         '<td style="text-align:right">'+tw.length+'</td>'+
         '<td style="text-align:right">'+(gr||'')+'</td></tr>'; });
    h+='<tr style="color:var(--dim)"><td colspan="4">celkem</td>'+
       '<td style="text-align:right">'+tot.n+'</td><td></td><td></td>'+
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
    var od=function(r){ if(r==null||isNaN(r)) return '?'; var d=Math.round((r+Math.PI/2)*180/Math.PI);   /* smer od svislice */
      return d===0 ? 'svisle' : (Math.abs(d)+String.fromCharCode(176)+(d<0?' vlevo':' vpravo')); };
    var N=function(v,d){ return (v==null||isNaN(v))?'?':(+v).toFixed(d); };      /* nikdy nespadnout na chybejicim poli */
    var A=function(pk,txt){ return pk?('<a href="#" data-pick="'+pk+'" style="color:#e8dfc0;text-decoration:underline dotted;cursor:pointer">'+txt+'</a>'):txt; };
    var P=function(v){ return (v==null||isNaN(v))?'?':((+v)*100).toFixed(0)+'%'; };
    var typ = m.root ? 'KORENOVY VYBEZEK' : (m.twig ? (m.grad?'GRADUOVANA SUB-VETEV':'ODBOCKA') : ('HLAVNI VETEV'+(m.idx!=null?(' #'+(m.idx+1)):'')));
    var H='<b style="font-size:1.3em;color:var(--gold)">'+m.g+'</b> <b>'+m.name+'</b> '+D(typ)+'<br>'+
          'element <b>'+m.el+'</b> &middot; aett <b>'+m.aett+'</b> &middot; world <b>'+m.world+'</b><br>';
    /* INSPEKCE PODLE DNESNIHO MODELU (2026-10-03, KUKY: "proc se informace nemeni?"). Drive: "tuhle runu jsi tahl Nx" bral u vetvicky
       pocet cteni NA vetvicce (u listu vzdy 1x) a u ramene vzdy "poradi v elementu: 1." (ord je od zon vzdy 0). */
    if(!m.twig && !m.root){
      if(m.runeTot!=null) H+='tuhle runu jsi tahl celkem <b>'+m.runeTot+'x</b>'+D(' (cely strom)')+'<br>';
      if(m.ownN!=null) H+='na tomhle '+(m.gradOf?'povysene vetvi':'rameni')+' roste <b>'+m.ownN+'</b> '+D('cteni'+(m.gradOf?' teto runy z rameni matky':''))+'<br>';
      if(m.gradOf) H+=D('povysena pri cteni #'+((m.gradAt!=null)?(m.gradAt+1):'?')+' z ramene '+m.gradOf)+'<br>';
      else H+=D(m.bornRd==null ? 'rameno vzniklo pri zalozeni (Norny)' : ('rameno vzniklo pri cteni #'+(m.bornRd+1)+' — prvni cteni tohoto elementu v teto zone'))+(m.nGrad?D(' · povysenych z nej: '+m.nGrad):'')+'<br>';
    }

    if(!m.twig && !m.root){                    /* HLAVNI VETEV: proc tady + proc tak velka */
      H+='<br><b style="color:var(--gold)">PROC TADY</b><br>'+
         (m.zone ? ('misto <b>'+m.el+' × '+m.zone+'</b> '+D(m.gradOf ? '= povysena runa, roste z ramene sveho elementu' : '= sem jdou cteni tohoto elementu v teto zone')+'<br>') : '')+
         (m.zst ? ('vyska na kmeni <b>'+P(m.frac)+'</b> '+D('= cteni na rameni: ')+'<b>'+m.zst.c.dole+'</b>'+D(' o minulosti/rodine/nitru · ')+'<b>'+m.zst.c.stred+'</b>'+D(' o tom, co je ted · ')+'<b>'+m.zst.c.nahore+'</b>'+D(' o budoucnosti/poslani/praci')+(Math.abs(m.gapPart||0)>0.005?D(' ('+(m.gapPart>=0?'+':'')+P(m.gapPart)+' rozestup od sousednich ramen)'):'')+'<br>')
                : ('vyska na kmeni <b>'+P(m.frac)+'</b> '+D(m.idx===0 ? '= vudci vetev, vrchol kmene' : '= kostra')+'<br>'))+
         'smer <b>'+od(m.ang)+'</b> '+D((m.gradOf?('(odbocka od '+m.gradOf+') '):'')+((m.lrS0 && m.lrS!==m.lrS0)
               ? ('= kostra '+od(m.eAng)+', ale cteni na rameni jasne prevazila na stranu '+(m.lrS<0?'NITRA -> preklopeno doleva':'SVETA -> preklopeno doprava'))
               : ('= kostra '+od(m.eAng)+(m.lrS0?' (strany se stridaji v poradi zrodu)':' (vudci vetev)')+' '+(m.leanPart>=0?'+':'')+deg(m.leanPart)+' zivotni runa '+(m.areaPart>=0?'+':'')+deg(m.areaPart)+' natoceni za ctenimi')))+'<br>'+
         (m.bal?('&nbsp;&nbsp;'+D('cteni na tomhle rameni: ')+'<b>'+m.bal.c.nitro+'</b>'+D(' o nitru · ')+'<b>'+m.bal.c.svet+'</b>'+D(' o svete · '+m.bal.c.stred+' stred · '+m.bal.c.bez+' bez oblasti')+'<br>'):'')+
         (m.bendMag!=null && m.lrS0 ? ('&nbsp;&nbsp;'+D('tiha: zrodilo se '+deg(m.bendN0)+' od svislice; '+(m.bal?m.bal.n:0)+' cteni ho tahnou '+(m.bendZ>0.33?'NAHORU (budoucnost)':(m.bendZ<-0.33?'DOLU (minulost)':'DO STRANY (ted)'))+' -> '+deg(m.bendMag))+'<br>') : '')+
         '<br><b style="color:var(--gold)">PROC TAK VELKA</b><br>'+
         'pramen roste <b>'+Math.round(m.strandAge)+' dni</b> '+D('(narodil se v den '+Math.round(m.born)+')')+'<br>'+
         'sila ramene '+D('(cteni na nem / nejsilnejsi rameno)')+' <b>'+P(m.domV)+'</b> &rarr; velikost <b>'+N(m.sizeF,2)+'</b> &middot; delka <b>x'+N(m.lenF,2)+'</b> '+D('(z poctu cteni na rameni)')+'<br>';
      if(m.tw && m.tw.length){
        H+='<br><b style="color:var(--gold)">ODBOCKY ('+m.tw.length+')</b><br>';
        m.tw.forEach(function(t){ H+='&nbsp;'+(t.grad?'<b style="color:var(--gold)">*</b> ':'&middot; ')+'<b>'+A(t.pick,t.name)+'</b> '+
          D((t.born!=null?'cteni #'+(t.born+1)+' · ':'')+'nese '+t.n+' · delka x'+N(t.g,2))+   /* drive "Nx" = pocet cteni NA vetvicce, ctlo se jako tazeni runy */
          (t.pramen?'<b style="color:var(--gold)"> + VLASTNI PRAMEN AZ DO KORENE</b>':'')+
          ((t.kids&&t.kids.length)?(D(' &rarr; nese ')+t.kids.map(function(x){ return A(x.pick,x.name); }).join(', ')):'')+'<br>'; });
      } else H+='<br>'+D('zatim na nem nic neroste — dalsi cteni tohoto elementu v teto zone sem pridaji vetvicky')+'<br>';
      H+='<br><b style="color:var(--gold)">KOREN</b><br>'+D(m.gradOf ? ('sdili pramen i koren matky ('+m.gradOf+') — matka je az k mistu odstepeni tlustsi') : m.rootDev==null
          ? 'smer z world+element runy + strana ze seedu pramene (rozevreni = 0)'
          : 'rizene rozevreni podle polohy pramene (dev '+N(m.rootDev,2)+')')+'<br>';
    } else if(m.twig){                          /* ODBOCKA / GRADUANT */
      var ZW=function(z){ return (z==null)?'?':(z<-1/3?'urd (minulost)':(z>1/3?'skuld (budoucnost)':'verdandi (ted)')); };
      var SW=function(sd){ return sd>0?'svet (vpravo od rodice)':(sd<0?'nitro (vlevo od rodice)':'stred'); };
      if(m.born!=null) H+='<br>vznikla ze cteni <b>#'+(m.born+1)+'</b> '+D('('+(m.rspread||'single')+')')+'<br>'+
        D('oblast: '+(m.rarea||'-')+' · zamer: '+(m.rint||'-')+' · seeking: '+(m.rseek||'-'))+'<br>'+
        D('zona cteni: ')+'<b>'+ZW(m.rz)+'</b>'+D(' · strana: '+SW(m.rside))+'<br>';
      if(m.runeTot!=null) H+='tuhle runu jsi tahl celkem <b>'+m.runeTot+'x</b>'+D(' (cely strom)')+'<br>';
      if(m.pname) H+='roste na: <b>'+m.pname+'</b> '+D(m.plevel===0?'(rameno)':'(vetvicka)')+(m.fu!=null?D(' · sedi na '+P(m.fu)+' jeho delky'):'')+'<br>';
      if(m.subN!=null) H+='nese <b>'+m.subN+'</b> '+D(m.subN===1?'cteni (jen to svoje)':'cteni (svoje + '+(m.subN-1)+' dalsich na ni)')+(m.gGrow!=null?D(' · delka x'+N(m.gGrow,2)+' — roste s cteními na ni a za par cteni doroste'):'')+'<br>';
      if(m.kids&&m.kids.length) H+=D('nese vlastni odbocky: ')+m.kids.map(function(x){ return A(x.pick,x.name); }).join(', ')+'<br>';
    } else {                                    /* KORENOVY VYBEZEK */
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
  var trunkT={ lean:0.3, wobble:0.2, wobFreq:1.0,   /* 2026-10-03 KUKY: "zakriveni kmene decentni, vlneni kmene tak 0.2" (drive 1 a 1; lean 0,3 = jeho ulozena hodnota) */
               thickness:9, bundleSpread:0.08, contour:0.6, twist:1.4,
          baseFlare:0.55, protrude:0.5, rootFan:-1, rootLen:150, treeAge:365, strandEvery:80,
          matureDays:365, minSize:0.2, treeHeightMax:370, w:460, cx:W/2, groundY:660, topY:300 };
  /* crown = branch-engine "jazyk tvaru" + composition (emergence/fractal) */
  var crownT={ length:105, width:6, curve:0.8, taper:1.0, wobble:0.45, tipLift:0.35, jitter:0.12, steer:1,
          exitFloor:0.22,   /* kam nejniz smi vetev vyrust z kmene (podil vysky). 0,50 -> 0,22 (2026-10-03): se zonami ma koruna
                               tri patra; pri 0,50 se 13 ramen tlacilo do horni pulky kmene a vystupy padaly 6–10 px od sebe */
          ctNear:0.45, ctFar:1.0, foundAng:0.78, exitTop:0.96, exitStep:0.07, twist:0.15,
          childN:2, maxDepth:3, levelRatio:0.62, childWidth:0.7,
          twU0:0.15, twU1:0.93, gradU0:0.20, gradU1:0.85, kidsMax:0,   /* F8: kolik run smi graduant pobrat (0 = vsechny zustanou na hlavni vetvi) */
          twigPer:3, twigMax:5, twigSpread:0.035,   /* twigMax 10 -> 5: KUKY 2026-09-28 "max treba 5 vetvi" */
          zrod:0.3, dorust:4,   /* 2026-09-29: nova vetev se rodi mala a doroste za `dorust` cteni */
          gradLen:1,   /* o kolik je graduant delsi nez bezna odbocka (1.35 = drivejsi stav) */
          gradStrand:1, gradStrandW:0.65, gradGap:2.2,   /* VERZE B: graduant = vlastni pramen (0 = verze A, dnesni stav) */   /* F9: kolik tazeni = dalsi odbocka · strop na vetev · rozestup opakovani */   /* F7: kam po delce vetve sedaji odbocky / graduanti */
          canopy:0.5, diversity:0.4, readingEvery:3, vigorMature:25, maxMains:14, gradFrac:0.33, gradEvery:12,   /* maxMains = pramenu v kmeni; hlavnich vetvi celkem nejvys 25 (MAX_BR ve stableAssign, KUKY 2026-10-07 — 2026-10-05 bylo "povysenych kolik je treba"); gradFrac/gradEvery uz nic nedelaji (povyseni podle mista) */
          bendN:0.65, bendK:8, bendStr:1, exitMinPx:30, limbBendU:0.45, limbTip:1, hwRatio:0.75,   /* hwRatio (2026-10-05, KUKY "strom musi zaroven rust do vysky s tim, jak roste do sirky"): kmen aspon hwRatio × rozpeti ramen; 0,75 = KUKYho strom kolem 20. cteni */   /* tvar ramen = ranni (2026-10-03 KUKY "a je to koste": 0,15 / 0,5 proti prekryvum delalo tuhe vodorovne klacky) */   /* exitMinPx (2026-10-03, KUKY "30px min." + obrazek 4): rozestup vystupu ramen na STEJNE strane; leve a prave se stridaji v polovine */
            /* TIHA (2026-10-03): neutralni rozevreni ramene · kolik cteni ho ohne napul · sila; maxMains 10 -> 25 = 14 mist element×zona + 11 povyseni (KUKY) */
          variace:0.7, textura:0.85,
          glZrno:34, glHloubka:0.85,   /* WebGL rezim: meritko textury podel vetve · hloubka prasklin */
          hrebeny:0.8, tonPramene:0.22,   /* KURA ZE STAVBY: sila hrebenu · rozdil tonu mezi prameny */
          objem:0.6, ryhy:0.7, stylKury:0, kuraVek:0,   /* KURA: presah stinu · sila ryh · rytina|malba · nese vek */ intZone:0.4, areaSide:0.35, aettStr:0.6 };   /* intZone 0,12 -> 0,4 (2026-10-02): KUKY ho mel na max; od V4 = sila casu na vysku */
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
    /* gradFrac (prah povyseni) z panelu pryc: na KUKYho strome 0.33 i 0.6 dalo totez — brzdou je misto */
    ['maxMains',3,14,1,'max ramen s vlastnim pramenem (mist element x pasmo je 14)'],['exitFloor',0.05,0.85,0.01,'kam nejniz smi vetev (proti palme)'],
    ['intZone',0,0.6,0.02,'cas cteni (zamer/oblast/seeking) -> vyska ramene'],['areaSide',0,0.8,0.05,'nitro/svet -> natoceni ramene'],
    ['aettStr',0,1,0.05,'aett -> charakter'],
    ['twigMax',2,12,1,'max vetvi na jedne vetvi (pak o patro niz)'],
    ['bendStr',0,1.5,0.05,'tiha cteni -> ohyb ramene (nahoru/do strany/dolu)'],['bendK',1,40,1,'kolik cteni ohne rameno napul'],
    ['bendN',0.2,1.2,0.05,'neutralni poloha noveho ramene (od svislice)'],
    ['exitMinPx',10,60,1,'rozestup ramen na stejne strane (px); levo-pravo polovina'],
    ['hwRatio',0.3,1.5,0.05,'vyska kmene : rozpeti ramen (kmen doroste, kdyz ramena zesiri)'] ], crownT);
  /* VZHLED — jak to vypada. Doladi se jednou a zapece; nema smysl u toho sedet. */
  makeTune('tune-crown-look', [
    ['length',30,160,1,'delka hlavni'],['curve',0,1.5,0.05,'gesto (ohyb)'],['variace',0,1,0.05,'variace vetvi'],
    ['gradLen',1,5,0.05,'delka povysene vetve'],
    ['limbBendU',0.05,0.45,0.01,'napojeni ramene: po jake casti delky dojede na svuj uhel'],['limbTip',0,1.5,0.05,'zdvih spicky ramen (vetvicky beze zmeny)'],
    ['objem',0,1.5,0.05,'OBJEM: presah stinu pres obrys'],['tonPramene',0,0.6,0.02,'rozdil tonu mezi prameny'],
    ['zrod',0.05,1,0.05,'velikost NOVE vetvicky (jen cerstva cteni)'],['dorust',1,12,1,'za kolik cteni nova vetvicka doroste'] ], crownT);
  /* ODLOZENO — nic se nemaze (KUKY): bud uz je to rozhodnute, nebo to v tomhle rezimu
     nefunguje. `pestrost cteni` je mrtva vzdy, kdyz je log (pouziva ji jen demo strom);
     tri WebGL paky ziji jen v rezimu "WebGL kura". Kura cela sem — "neni to ono". */
  makeTune('tune-crown-park', [
    /* 2026-10-03 (KUKY: "spousta posuvniku nefunguje"): pryc twU0/twU1, gradU0/gradU1, twigSpread, gradGap, kidsMax,
       childN, twigPer, diversity — jejich mechaniku nahradily kroky 1–5 (audit tree_diag sliders: 0 % zmeny). Zustava kura. */
    /* ryhy + kuraVek pryc (2026-10-03): v prohlizeci zmena 0,06 % / 0 % pixelu v rezimu kuze i WebGL */
    ['hrebeny',0,1.5,0.05,'HREBENY kury'],['textura',0,1,0.05,'textura kury'],
    ['stylKury',0,1,1,'styl kury: 0 rytina / 1 malba'],
    ['glZrno',8,120,2,'WebGL: meritko kury podel vetve'],['glHloubka',0,1,0.05,'WebGL: hloubka prasklin'] ], crownT);
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
    ['treeHeightMax',300,560,10,'vyska kmene'] ], trunkT);   /* strandEvery pryc (2026-10-03): prameny zaklada cteni, ne vek */
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
    /* i strom (2026-10-03, KUKY: "nefunguje reset strom"): cteni pryc -> seminko. Drive RESET vracel jen posuvniky, datum
       a ladeni run a strom zustal se vsemi ctenimi. Jen cteni maze VYMAZAT / znovu, jen posuvniky reset panelu. */
    state.log=[]; state._viewN=null; state.demo=false; saveLog(); renderHist();
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
  document.getElementById('reset-all').addEventListener('click', function(){ if(window.confirm('RESET vseho: smaze i cteni (strom zacne od seminka) a vrati posuvniky, datum narozeni i ladeni run. Pokracovat?')) resetAll(); });
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
  var SEEKS_L=['general','clarity','confirmation','insight','reflection'];   /* V4: seeking v labu (aplikace ho stromu zatim neposila) */
  var pickA={on:false,rnd:false,val:null}, pickI={on:false,rnd:false,val:null}, pickS={on:false,rnd:false,val:null};
  function rndRune(el){ var pool=(el&&runesByEl[el])?runesByEl[el]:B.RUNES; var r=pool[Math.floor(Math.random()*pool.length)]||pool[0]; return {rune:r.k, el:r.el}; }
  function readingMeta(){ return { area: pickA.on?(pickA.rnd?AREAS[Math.floor(Math.random()*AREAS.length)]:pickA.val):null,
             intention: pickI.on?(pickI.rnd?INTENTS[Math.floor(Math.random()*INTENTS.length)]:pickI.val):null,
             seeking: pickS.on?(pickS.rnd?SEEKS_L[Math.floor(Math.random()*SEEKS_L.length)]:pickS.val):null }; }
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
    state.log.push({ spread:spread, runes:runes, area:m.area, intention:m.intention, seeking:m.seeking }); }
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
        intention: INTENTS[Math.floor(Math.random()*INTENTS.length)],
        seeking: SEEKS_L[Math.floor(Math.random()*SEEKS_L.length)] });
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
    document.querySelectorAll('#pick-seek .jb').forEach(function(x){ var sk=x.dataset.seek; x.classList.toggle('on', sk==='__rnd'?(pickS.on&&pickS.rnd):(pickS.on&&!pickS.rnd&&pickS.val===sk)); });
    var pr=document.getElementById('pickread'); if(pr) pr.textContent='k ctenim: area='+(pickA.on?(pickA.rnd?'nahodne':pickA.val):'—')+' · intention='+(pickI.on?(pickI.rnd?'nahodne':pickI.val):'—')+' · seeking='+(pickS.on?(pickS.rnd?'nahodne':pickS.val):'—');
  }
  document.getElementById('pick-area').addEventListener('click', function(e){ var a=e.target.dataset.area; if(!a) return;
    if(a==='__rnd'){ pickA=pickA.rnd?{on:false,rnd:false,val:null}:{on:true,rnd:true,val:null}; }
    else if(pickA.on&&!pickA.rnd&&pickA.val===a){ pickA={on:false,rnd:false,val:null}; } else { pickA={on:true,rnd:false,val:a}; } syncPick(); });
  document.getElementById('pick-int').addEventListener('click', function(e){ var it=e.target.dataset.int; if(!it) return;
    if(it==='__rnd'){ pickI=pickI.rnd?{on:false,rnd:false,val:null}:{on:true,rnd:true,val:null}; }
    else if(pickI.on&&!pickI.rnd&&pickI.val===it){ pickI={on:false,rnd:false,val:null}; } else { pickI={on:true,rnd:false,val:it}; } syncPick(); });
  document.getElementById('pick-seek').addEventListener('click', function(e){ var sk=e.target.dataset.seek; if(!sk) return;
    if(sk==='__rnd'){ pickS=pickS.rnd?{on:false,rnd:false,val:null}:{on:true,rnd:true,val:null}; }
    else if(pickS.on&&!pickS.rnd&&pickS.val===sk){ pickS={on:false,rnd:false,val:null}; } else { pickS={on:true,rnd:false,val:sk}; } syncPick(); });
  syncPick();

  /* KROK 1.5: POZOROVATELNOST — trace kazdeho cteni (co udelalo) + prehravani po cteni N.
     traceAt(n) jen ZMERI stav pri prvnich n ctenich (znovu pusti routing/assign na prefixu);
     engine ani kresleni se NEMENI -> slouzi k odhaleni preskakovani vetvi. */
  function traceAt(n){
    var lg=state.log.slice(0,n);
    if(!lg.length) return {n:0,targetN:0,assign:[],els:[],total:1};
    var rt=routingFromLog(lg);
    var targetN=Math.max(1, Math.round(crownT.maxMains));   /* = draw(): pocet pramenu neridi vek (2026-09-28) */
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
    if(be.runeK && RBK[be.runeK]) return RBK[be.runeK];
    var pool=runesByEl[be.el]||B.RUNES;
    var seen=(be.runeSeen&&be.runeSeen.length)?be.runeSeen:null;
    return seen ? (RBK[seen[Math.min(be.ord||0, seen.length-1)]]||pool[0]) : pool[k%pool.length];
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
      /* i vidlice na spicce (runy s rozdvojenym koncem) je soucast teze vetvicky -> klikatelna (2026-10-03, KUKY: "vidim to,
         ale kliknout na to nejde?"). Drive pick jen pro hlavni tah: na 359 ctenich 44 neklikatelnych kousku u korenu. */
      pick.push({ k:'rm'+kTag+'_'+i+(gp?('_'+gp):''), pts:pp, meta:{ el:g2.info.el, aett:be.aett, world:be.world,
        name:nm, count:'-', root:true, mirror:true, strand:kTag, mirrorU:u,
        runeN:(be.runeCnt&&be.runeCnt[runeK])||null } }); }
  }

  function growBranch(out, cfg, ox, oy, baseAng, dev, role, rune, seed, lenScale, w0Want, depthZ, level, sizeFactor, childRunes, selfInfo){
    var TT={ length:cfg.length*lenScale, width:cfg.width, curve:cfg.curve, taper:cfg.taper, wobble:cfg.wobble,
             tipLift:cfg.tipLift*((level===0 && cfg.limbTip!=null) ? cfg.limbTip : 1), jitter:cfg.jitter, steer:cfg.steer, subScale:0, leaf:0, cx:ox, baseY:oy };   /* limbTip: zdvih spicky RAMEN (level 0) zvlast od vetvicek */
    var st0=(selfInfo&&selfInfo.steer)||null;   /* steering branch composeru: zamer -> delka/zdvih/sukovitost */
    var g=B.buildBranch({ rune:rune, role:role, seed:seed, baseAng:baseAng, dev:dev, ox:ox, oy:oy, twist:cfg.twist,
                          bendU:(level===0 && cfg.limbBendU!=null) ? cfg.limbBendU : undefined,   /* napojeni ramene: po jake casti delky dojede na svuj uhel (engine bez nej 0,45) */
                          side:(level===0 && cfg._side!=null) ? cfg._side : undefined,   /* strana ohybu ramene (LR4) */
                          area:st0?STEER_AREA[st0.area]:undefined, intention:st0?STEER_INT[st0.intention]:undefined }, TT);
    var pts=g.paths[0].pts;
    var f=w0Want/(pts[0].w||1);
    for(var i=0;i<pts.length;i++){ pts[i].w*=f; pts[i].depth=depthZ; pts[i].ct=lerp(cfg.ctNear,cfg.ctFar,pts[i].t); }
    var me={ pts:pts, el:g.info.el, depth:depthZ };
    out.push(me);
    /* #2 diagnostika: twigy (level>=1) jsou klikatelne v inspekci -> pozna se, ze nesou jinou runu */
    if(level>=1){ var rr=RBK[rune]; var si=selfInfo||null;
      var pkey = si ? ('t'+(cfg._k!=null?cfg._k:'x')+'_'+rune+(si.id!=null?('_'+si.id):'')) : ('t'+_pick.length);   /* stabilni klic -> proklik z panelu funguje i po prekresleni */
      if(rr) _pick.push({ k:pkey, pts:pts, meta:{ el:rr.el, aett:rr.aett, world:rr.world, name:rr.name, g:rr.g, count:'-',
        twig:true, grad:!!(si&&si.grad), slot:si?si.slot:null, slots:si?si.slots:null, fu:si?si.fu:null,
        gGrow:si?si.g:null, runeN:si?si.n:null, parentKey:si?si.parentKey:null,
        born:si?si.born:null, rz:si?si.z:null, rseek:si?si.seeking:null, rarea:(si&&si.steer)?si.steer.area:null, rint:(si&&si.steer)?si.steer.intention:null,
        rside:si?si.side:null, pname:si?si.pname:null, plevel:si?si.plevel:null, subN:si?si.n:null, runeTot:_runeTot[rune]||null,
        rspread:(si&&si.born!=null&&_vlogRef[si.born])?_vlogRef[si.born].spread:null,
        kids:(si&&si.kids)?si.kids.map(function(x){ return { name:(RBK[x.k]?RBK[x.k].name:x.k), pick:('t'+(cfg._k!=null?cfg._k:'x')+'_'+x.k+(x.id!=null?('_'+x.id):'')) }; }):[] } }); }
    /* vetve z opakovani smi jit hloub nez maxDepth — rekurze jede jen po seznamu run (pravidlo 6) */
    if(level>=cfg.maxDepth && !(childRunes && childRunes.length && typeof childRunes[0]==='object')) return me;
    /* F1: na urovni 0 urcuje odbocky SEZNAM TAZENYCH RUN (childRunes = objekty
       {k,slot,slots,g}); pozice se pocita ze SLOTU runy, ne z poradi -> pribytek nove
       runy uz NEPOSOUVA stavajici odbocky (konec preskakovani). Hlubsi urovne = puvodni
       dekorativni rekurze (male twigy) - NETKNUTE. */
    var childList=(childRunes && childRunes.length && typeof childRunes[0]==='object')?childRunes:null;   /* F2: i hloubeji - graduant nese vlastni odbocky */
    /* 6 (2026-09-28, KUKY: "kazda vetev, ktera vznikne, nese runu"): vetve rostou JEN ze seznamu
       run. Drive bez seznamu vznikla ozdobna rekurze (`childN`) — zakladaci Norny tak mely vetvicky
       hned od prvniho cteni a kazda odbocka dalsi dve patra bez runy. */
    var n=childList?childList.length:0;
    for(var c=0;c<n;c++){
      var ci=childList?childList[c]:null;
      var fu=ci ? (ci.u!=null ? ci.u                                                       /* F7: pevne misto runy (zlaty rez) */
                              : (ci.grad ? ((ci.slots<=1)?0.40:(0.20+0.40*(ci.slot/(ci.slots-1))))
                                         : ((ci.slots<=1)?0.6:(0.40+0.45*(ci.slot/(ci.slots-1))))))
                : ((n===1)?0.6:(0.4+0.45*(c/(n-1))));
      /* presne misto u (2026-10-03): interpolace mezi body rodice (30 bodu). Drive nejblizsi bod: dve vetvicky blizko sebe
         se slily do tehoz bodu (KUKY: "nechci, aby vyrustaly dve nebo vice vetvi ze stejneho mista"). */
      var fiU=clamp(fu, 1/(pts.length-1), (pts.length-2)/(pts.length-1))*(pts.length-1), i0U=Math.min(pts.length-2, Math.floor(fiU)), tU=fiU-i0U;
      var pa0=pts[i0U], pb0=pts[i0U+1], q=pa0;
      var p={ x:lerp(pa0.x,pb0.x,tU), y:lerp(pa0.y,pb0.y,tU), w:lerp(pa0.w,pb0.w,tU) };
      var pang=Math.atan2(pb0.y-pa0.y, pb0.x-pa0.x);            /* parent tangent at the join */
      /* V4c (2026-10-02): zapis uhlu NAVAZUJE na rodice (do ±180° od jeho vlastniho zakladu), od kmene ven. atan2
         vraci vetev mirici vodorovne doleva jednou jako +178°, jindy −175°; engine zdviha spicku linearnim
         prolnutim k −90°, takze z +178° sel dlouhou cestou pres pravou stranu -> vetvicka skakala o 35° (Dagaz
         84 -> 85). Pevne srovnani kolem "nahoru" jen presunulo hranu ke svisle dolu (Othila na zemnim rameni
         23–32°). Navazny zapis hranu nema: preklopil by jen vetev mirici zpet proti rodici. Engine beze zmeny. */
      while(pang-baseAng>Math.PI) pang-=2*Math.PI; while(pang-baseAng<=-Math.PI) pang+=2*Math.PI;
      var cs=(ci&&ci.sid!=null)?ci.sid:c;   /* vetev z opakovani: seed z poradi zrodu -> tvar se nemeni */
      /* F1: strana ze slotu -> stabilni. ZACATEK stridani podle runy vetve (2026-09-30): drive slot 0 vzdy
         "po smeru hodin" = u vetvi mirici nahoru VPRAVO -> vetvicky bez oblasti a ze stredu mely pravou
         stranu navrch a vyvazeni lide meli strom 43–47 % vlevo (tree_diag scen, i s nahodnym datem narozeni). */
      var cSide=((((ci?ci.slot:c) + (hashStr(String(rune))&1))%2)===0)?1:-1;
      var jig=(((seed*7+cs*101)>>>0)%100)/100;
      if(ci && ci.side){ var aOff=0.40+0.30*jig;   /* oblast: nitro doleva / svet doprava (smer na platne) */
        /* V4 (2026-10-02): strana z DAT cteni, ne z geometrie. Drive volba podle smeru rodice (cos) — u vetvi miricich
           nahoru dava totez (po smeru hodin = doprava), ale u skoro vodorovne vetve (zeme 65–80°) se s kazdym
           pootocenim preklapela (12 skoku az 88° na KUKYho strome). */
        cSide=(ci.side>0) ? 1 : -1; }
      var childRole=(ci&&ci.rep)?'twig':((level===0)?'sub':'twig');   /* vetev z opakovani = vyhon */
      /* #2: primarni twigy (level 0) nesou OSTATNI runy elementu -> rozmanita vetev;
         hloubeji uz dite dedi runu sveho twigu. */
      var cRune=ci?ci.k:((level===0 && childRunes && childRunes[c]!=null)?childRunes[c]:rune);
      var cGrow=ci?ci.g:1;   /* F1: odbocka roste s opakovanim SVE runy */
      var cLen=(ci&&ci.grad)?cGrow*(cfg.gradLen||1):cGrow;   /* graduant delsi a silnejsi, ale NE hustsi */
      growBranch(out, cfg, p.x, p.y, pang, cSide*(0.40+0.30*jig), childRole, cRune, (seed*131+cs*7)>>>0,
                 lenScale*cfg.levelRatio*cLen, p.w*cfg.childWidth*(0.75+0.25*Math.min(1,cLen)), depthZ+cSide*0.05, level+1, sizeFactor*cfg.levelRatio*cGrow,
                 (ci&&ci.kids&&ci.kids.length)?ci.kids:null, ci?{slot:ci.slot,slots:ci.slots,g:ci.g,grad:!!ci.grad,kids:ci.kids,n:ci.n,fu:fu,id:ci.id,steer:ci.steer||null,rep:!!ci.rep,
                                                              parentKey:((level>=1 && typeof pkey!=='undefined') ? pkey : cfg._k),
                                                              born:ci.born, z:ci.z, seeking:ci.seeking, side:ci.side, pname:(RBK[rune]?RBK[rune].name:rune), plevel:level}:null);
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
    var runeGradAt=[{},{},{},{},{}];   /* KROK 2: index cteni, kdy runa prekrocila prah -> kdy se narodi jeji pramen */
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
          /* prah = podil tazeni hlavni runy (`gradFrac`, drive natvrdo 1/3) = TEMPO povysovani (KUKY 2026-09-29) */
          if(rk!==mk0 && !runeGrad[e][rk] && runeCnt[e][rk]>=Math.max(3, mc0*(crownT.gradFrac||0.33))){ runeGrad[e][rk]=++gradSeq[e]; runeGradAt[e][rk]=i; } }
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
                 runeSeen:runeSeen[e3].slice(), runeCnt:runeCnt[e3], runeGrad:runeGrad[e3], runeGradAt:runeGradAt[e3],
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
    /* ZONY × ELEMENTY (2026-10-03, KUKY: "postav zony jako dalsi krok · povyseni je potreba, mame 25 run · tech 20 cteni
       [pred zalozenim] se chova tak, jak by se chovala, kdyby prichazela po jednom hned po zalozeni Noren — musi si najit
       spravne misto, vytvorit nove prameny, pokud potrebuji"). Pramen = MISTO "element × pasmo zony" (bandOf):
       - kazda runa cteni jde na rameno SVEHO elementu v SVE zone; prvni, ktera tam patri, rameno ZALOZI (nese jeji tvar);
       - runa zalozi nejvys JEDNO rameno (25 run = nejvys 25 ramen, KUKY); ma-li uz rameno, jde cteni na rameno sveho
         elementu v nejblizsi zone (tyz element, sousedni patro), dokud tu zonu nezalozi jina runa — nic se nepresouva;
       - POVYSENI (krok 2) zustava, jen v ramci ramene: runa, ktera na nem prekroci prah (min 3 tazeni, `gradFrac` ×
         zakladajici runa), dostane vlastni pramen a vetev z TOHO ramene ("porad vyrustaji ze sveho elementu"); tempo
         `gradEvery`, nejvys 2 na rameno, poradi = kdo prah prekrocil drive. Od povyseni jdou jeji dalsi cteni z te zony
         na jeji vetev; starsi zustavaji na rameni (zadne prestavovani). Nahrazuje graduatesFor + vyber v draw();
       - vse v JEDNOM pruchodu v case -> strom po N ctenich = strom z prvnich N cteni; cteni pred zalozenim prochazi
         za Nornami po jednom (draw je za Norny radi).
       Drive (2026-09-28): pramen = element, nejvys 1 na element (5–7 ramen), druhe tazeni runy = vetev na jeji vetvi. */
    var slots=[], secIx={}, own={}, MAXK=Math.max(1, Math.round(crownT.twigMax||5));
    var mkR=function(rk, i, rd, pos){ return { k:rk, kids:[], n:1, born:i, area:(rd&&rd.area)||null, intention:(rd&&rd.intention)||null,
                                                seeking:(rd&&rd.seeking)||null, z:readZone(rd, pos, rk) }; };
    var attachR=function(root, node){ var path=[root], t=root;
      while(t.kids.length>=MAXK){ var bc=null; for(var q=0;q<t.kids.length;q++){ if(!bc || t.kids[q].n<bc.n) bc=t.kids[q]; } t=bc; path.push(t); }
      t.kids.push(node); path.forEach(function(a){ a.n++; }); };
    var secTree=[], secCnt=[], secZ=[], secN=[], ownN=[], secAe=[], drawSec=[], drawOwn=[], grads=[], gradTree=[], gradOf={};
    var cross={}, queue=[], perSec={}, gEvery=Math.max(1, Math.round(crownT.gradEvery||12)), GON=!!crownT.gradStrand, near=0;
    /* STRANA CTENI = OBLAST (osa B, RUNAR_TREE.md §3): nitro vlevo, svet vpravo; Love, Crossroads a bez oblasti = stred (0). */
    var SIDE_A={ healing:-1, family:-1, inner:-1, purpose:1, career:1, spirituality:1 }, sideOfRd=function(rd){ return (rd && SIDE_A[rd.area]) || 0; };
    var placeRd=[];   /* misto kazdeho cteni (element|pasmo|strana) — pro kontrolu smoke ㉳ */
    var MAX_BR=B.RUNES.length;   /* nejvys 25 hlavnich vetvi = 25 run (KUKY 2026-10-07, viz STROP nize) */
    var sideIx={}, gplace={}, nStr=function(){ var n=0; for(var q=0;q<slots.length;q++){ if(slots[q].mother==null) n++; } return n; };
    /* misto = element × pasmo × strana. mother==null = rameno s VLASTNIM pramenem (nejvys jedno na element×pasmo), jinak rameno
       pro druhou stranu / stred tehoz pasma: vyjde z kmene na sve strane, pramen sdili s matkou ("jedno, dokud se neoddeli"). */
    var newSec=function(el, b, rk, i, rd, pos, fx, side, mother){ var q=slots.length;
      slots.push({ el:el, band:b, runeK:rk, bornIdx:fx?null:i, area:(rd&&rd.area)||null, intention:(rd&&rd.intention)||null,
                   norn:fx?fx.axis:undefined, nornName:fx?fx.nm:undefined, side:side||0, mother:(mother==null) ? null : mother });
      if(mother==null) secIx[el+'|'+b]=q; else sideIx[el+'|'+b+'|'+(side||0)]=q; own[rk]=1; secTree[q]=mkR(rk, i, rd, pos); secCnt[q]={}; secZ[q]=0; secN[q]=0; ownN[q]=0; secAe[q]={}; return q; };
    var tally=function(q, rk, z){ secCnt[q][rk]=(secCnt[q][rk]||0)+1; secZ[q]+=z; secN[q]++; var ae=KEY_AETT[rk]||'freya'; secAe[q][ae]=(secAe[q][ae]||0)+1; };
    var nearSec=function(el, b){ var best=-1, bd=9; for(var q=0;q<slots.length;q++){ if(slots[q].el!==el) continue; var d=Math.abs(slots[q].band-b); if(d<bd){ bd=d; best=q; } } return best; };
    var fnd=(log.length && log[0].spread==='norns' && (log[0].runes||[]).length===3);
    /* ZAKLADACI NORNY: kazda ze tri run = vlastni rameno (i dve tehoz elementu — jsou v ruznych zonach); pasmo dava
       POZICE: skuld nahore (vudci vetev = vrchol kmene, KUKY: "kmen, co jde az do spicky, je taky element"), verdandi,
       urd dole. Stin ma jen dve pasma: dve zakladaci runy stinu se rozdeli, treti (vzacne) dostane pasmo verdandi. */
    if(fnd){ drawSec[0]=[]; drawOwn[0]=[];
      [{pos:2,b:1,axis:1,nm:'skuld'},{pos:1,b:0,axis:0,nm:'verdandi'},{pos:0,b:-1,axis:-1,nm:'urd'}].forEach(function(n){
        var r=log[0].runes[n.pos]; if(!r) return;
        var b=(r.el==='shadow') ? (n.b<0 ? -1 : 1) : n.b;
        if(r.el==='shadow' && secIx[r.el+'|'+b]!=null) b=(secIx[r.el+'|'+(-b)]==null) ? -b : 0;
        var q=newSec(r.el, b, r.rune, 0, log[0], n.pos, n, sideOfRd(log[0]), null);
        tally(q, r.rune, readZone(log[0], n.pos, r.rune)); ownN[q]++; drawSec[0][n.pos]=q; drawOwn[0][n.pos]=q;
        (placeRd[0]=placeRd[0]||[])[n.pos]=r.el+'|'+b+'|'+sideOfRd(log[0]); });
    }
    /* KAPACITA KMENE (2026-10-03, KUKY "30px min."): vyska kmene v cteni i (tataz rovnice jako v drawu: vek + velke spready +
       zona cteni) -> kolik ramen se na nej vejde. Leve a prave rameno se stridaji, takze na jedno rameno pripada POLOVINA
       exitMinPx (na stejne strane plati cely, viz SAMEF v casove smycce), a pocita se od PODLAHY (exitFloor), ne od 10 % kmene.
       Drive cely exitMinPx od 0,10: na KUKYho kmen (64 cteni, ~260 px) se veslo 8 ramen a podlaha sjela k zemi -> "koste"
       (spodni vetev u zeme, ramena jako pricky zebriku, zbylych 5 run povysenych, dve z nich vidlici na vudci vetvi). */
    var capBigH=0, capZs=0, capZn=0, MINPX=Math.max(5, crownT.exitMinPx||30)/2, capFl=clamp((crownT.exitFloor!=null)?crownT.exitFloor:0.22, 0.12, 0.6), capTop=crownT.exitTop-Math.max(0.02, crownT.exitStep), elHas={};
    var capAdd=function(rd){ var rr=rd.runes||[], mul=(rd.spread && rd.spread!=='single');
      for(var jc=0; jc<rr.length; jc++){ capZs+=readZone(rd, jc, rr[jc].rune); capZn++; if(mul && (rr[jc].el==='fire' || rr[jc].el==='air')) capBigH++; } };
    var capSecAt=function(i){ var top=trunkTopY(SEED_AGE0 + (i+1)*crownT.readingEvery, capBigH, capZs, capZn), Hp=trunkT.groundY-top;
      var cT=Math.min(capTop, clamp(crownT.exitTop+0.02, 0.30, 0.98)-MINPX/Hp);   /* strop: i od vudci vetve aspon MINPX */
      return 2 + Math.floor(Math.max(0, cT-capFl)*Hp/MINPX); };   /* vudci + (1 + kolik mezer po MINPX nad podlahou) */
    if(fnd) capAdd(log[0]);
    /* MISTO KAZDEHO CTENI (2026-10-05, KUKY: "strom je zrcadlem cteni cloveka … area, seeking, intention maji svoje mista na strome a
       tam se maji objevit · runa nema svoje pevne misto, to ma element skrze zony · povysena muze byt jakakoliv runa toho spravneho
       elementu, ktera je potreba umistit · kazde cteni, kazde!!! mam ji presne tam, kam patri"). Misto = element × pasmo zony ×
       strana (oblast). Cteni jde VZDY na sve misto; prvni, ktere tam patri, ho zalozi (jakakoli runa — da vetvi tvar):
       - prvni misto elementu×pasma = rameno s vlastnim pramenem (nejvys maxN pramenu, jen kdyz se vejde na kmen);
       - kazde dalsi misto (druha strana nebo stred tehoz pasma; pasmo, pro ktere uz neni pramen) = POVYSENA VETEV z ramene tehoz
         elementu, ktere je na strane mista (nejblizsi pasmo), jinak z ramene element×pasma (prekrizi kmen), jinak z nejblizsiho;
         30 vystupu z kmene (14 pramenu + 16 ramen bez pramene) se na kmen neveslo — ramena u zeme a vejir jako koste;
       - stred (Love, Crossroads, bez oblasti) stranu nezaklada: pripoji se k vetvi elementu v tom pasmu; neni-li zadna, zalozi
         ji uprostred (strme u kmene). Rozhodl KUKY 2026-10-05.
       Drive (2026-10-03): runa zalozila nejvys jedno rameno a dalsi jeji cteni sla na SOUSEDNI zonu (KUKYho strom: 5 cteni mimo
       sve misto); strana ramene ze stridani; povyseni podle toho, jak casto se runa tahala (prah, tempo, nejvys 2 na rameno). */
    /* matka povysene = rameno tehoz elementu na STRANE mista (nebo ve stredu), nejblizsi pasmo; stred bere jakekoli. -1 = zadne. */
    /* strana kresby ramene ze stredu = svet runy (Hel vlevo, Asgard vpravo, Midgard podle runy) — tataz jako v kostre FR */
    var drawSideOf=function(q){ var sq=slots[q].side; if(sq) return sq; var w=RBK[slots[q].runeK] ? RBK[slots[q].runeK].world : null;
      return (w==='hel') ? -1 : ((w==='asgard') ? 1 : ((hashStr(String(slots[q].runeK))&1) ? 1 : -1)); };
    var motherOnSide=function(el, b, sd){ var best=-1, bd=99;
      for(var q=0;q<slots.length;q++){ if(slots[q].el!==el) continue;
        if(sd!==0 && drawSideOf(q)!==sd) continue; var d=Math.abs(slots[q].band-b); if(d<bd){ bd=d; best=q; } }
      return best; };
    var nearStr=function(el, b){ var best=-1, bd=9; for(var q=0;q<slots.length;q++){ if(slots[q].el!==el || slots[q].mother!=null) continue; var d=Math.abs(slots[q].band-b); if(d<bd){ bd=d; best=q; } } return best; };
    /* stred bez ramene element×pasma: k vetvi tehoz pasma (rameno bez pramene nebo povysena), ktera nese nejvic cteni */
    var pickMid=function(pk){ var best=null, bn=-1;
      [-1,1].forEach(function(s2){ var q2=sideIx[pk+'|'+s2]; if(q2!=null && ownN[q2]>bn){ bn=ownN[q2]; best={ q:q2 }; } });
      [-1,1,0].forEach(function(s2){ var g2=gplace[pk+'|'+s2]; if(g2!=null && gradTree[g2].n>bn){ bn=gradTree[g2].n; best={ g:g2 }; } }); return best; };
    for(var i=(fnd?1:0); i<log.length; i++){ var rs=log[i].runes||[]; drawSec[i]=[]; drawOwn[i]=[]; capAdd(log[i]); var capI=capSecAt(i), sI=sideOfRd(log[i]);
      for(var j=0;j<rs.length;j++){ var el=rs[j].el, rk=rs[j].rune, z=readZone(log[i], j, rk), b=bandOf(el, z), pk=el+'|'+b, qs=secIx[pk], sd=sI, tq=null, tg=null, fresh=false;
        (placeRd[i]=placeRd[i]||[])[j]=pk+'|'+sd;
        if(qs!=null && (sd===0 || (slots[qs].side||slots[qs].adopt)===sd)) tq=qs;                                   /* rameno elementu×pasma (stred se pridava) */
        else if(sd!==0 && sideIx[pk+'|'+sd]!=null) tq=sideIx[pk+'|'+sd];                         /* vlastni vystup tohoto mista */
        else if(gplace[pk+'|'+sd]!=null) tg=gplace[pk+'|'+sd];                                   /* povysena vetev tohoto mista */
        else if(sd===0 && qs==null){ var pm=pickMid(pk); if(pm){ if(pm.q!=null) tq=pm.q; else tg=pm.g; } }   /* stred: k vetvi tehoz pasma */
        /* PREVZETI (2026-10-07): cteni se stranou prijde na element×pasmo, kde visi jen vetev ZALOZENA STREDEM (Love, Crossroads, bez
           oblasti, zakladaci Norny) a ta je nakreslena na jeho strane -> vetev prevezme (cteni toho mista na ni patri), nezaklada vedle
           ni dalsi. Prevzeti je jen ZNACKA MISTA (`adopt`): strana z dat zustava 0, takze kostra FR i kresba vetve se nemeni. Prvni verze
           (tyz den) menila stranu z dat -> vetev prepla ze "stredu" (strme u kmene) na bocni: na KUKYho strome se vetve stocily az o
           66° (Eihwaz povysena z Othily, cteni #36) a uchyceni vetvicek sklouzlo az o 127 px (drive nejvys 47 px).
           KUKYho strom: 8 vetvi zalozenych stredem a vedle nich dalsi z cteni se stranou = 32 vetvi; aby kazde cteni viselo na svem
           miste, staci 24. Vudci (svisly vrchol kmene) se neprevezme — je to stred. */
        if(tq==null && tg==null && sd!==0){
          for(var q6=0; q6<slots.length && tq==null; q6++){ if(slots[q6].el!==el || slots[q6].band!==b || slots[q6].side || slots[q6].adopt || slots[q6].nornName==='skuld' || drawSideOf(q6)!==sd) continue;
            slots[q6].adopt=sd; tq=q6; }
          for(var g6=0; g6<grads.length && tq==null && tg==null; g6++){ var G6=grads[g6]; if(G6.band!==b || G6.side || G6.adopt || ((RBK[G6.rune]||{}).el)!==el || drawSideOf(G6.p)!==sd) continue;
            G6.adopt=sd; gplace[pk+'|'+sd]=g6; tg=g6; }
        }
        /* STROP 25 HLAVNICH VETVI (2026-10-07, KUKY: "vice jak 25 run neni dobre. mam jich ted 34 a je to spatne, vracime to k 25";
           puvodne 2026-10-03 "14 ramen + az 11 povysenych = 25 run", 2026-10-05 "povysenych kolik je treba" -> jeho lab 32–34 vetvi).
           Je-li vetvi 25, nove misto vlastni vetev nedostane: cteni jde k nejblizsi vetvi sveho elementu — napred na sve strane
           (nejblizsi pasmo), jinak na druhe; pri shode ta, ktera nese vic cteni. Zmereno s PREVZETIM: KUKYho strom 25 vetvi a 0 cteni
           mimo misto; modelove stromy do 60 cteni nic, 150–300 cteni 0–18 tazeni z ~500 (do 3 %) o pasmo vedle. Bez prevzeti by
           strop na jeho strome odsunul 36 z 342 tazeni (6 ze 7 mist bez vetve vpravo — kdo driv prisel, ten mel vetev). */
        if(tq==null && tg==null && slots.length+grads.length>=MAX_BR){ var capB=null, capD=1e9;
          for(var q8=0; q8<slots.length; q8++){ if(slots[q8].el!==el) continue;
            var d8=((sd!==0 && drawSideOf(q8)!==sd) ? 10 : 0) + 3*Math.abs(slots[q8].band-b) - Math.min(2.9, ownN[q8]/100); if(d8<capD){ capD=d8; capB={ q:q8 }; } }
          for(var g8=0; g8<grads.length; g8++){ var G8=grads[g8]; if(((RBK[G8.rune]||{}).el)!==el) continue;
            var d9=((sd!==0 && (G8.side||G8.adopt||drawSideOf(G8.p))!==sd) ? 10 : 0) + 3*Math.abs(G8.band-b) - Math.min(2.9, gradTree[g8].n/100); if(d9<capD){ capD=d9; capB={ g:g8 }; } }
          if(capB){ if(capB.q!=null) tq=capB.q; else tg=capB.g; }
        }
        if(tq==null && tg==null){ fresh=true; var nq=nearSec(el, b);
          var missEl=0; ['fire','water','air','earth','shadow'].forEach(function(e9){ if(nearSec(e9, 0)<0) missEl++; });
          if(qs==null && ((nStr()<maxN && nStr()+missEl<capI) || nq<0)) tq=newSec(el, b, rk, i, log[i], j, null, sd, null);   /* rameno s pramenem */
          else if(sd!==0 && motherOnSide(el, b, sd)<0) tq=newSec(el, b, rk, i, log[i], j, null, sd, (qs!=null) ? qs : nearStr(el, b));   /* element na te strane nema rameno: vlastni vystup z kmene, pramen sdili */
          else { var mo=motherOnSide(el, b, sd); if(mo<0) mo=(qs!=null) ? qs : nearSec(el, b); tg=grads.length; gplace[pk+'|'+sd]=tg;                                    /* povysena vetev mista */
            grads.push({ p:mo, rune:rk, at:i, crossAt:i, name:(RBK[rk]?RBK[rk].name:rk), side:sd, band:b, kind:(qs!=null) ? 'side' : 'band' });
            gradTree.push(mkR(rk, i, log[i], j)); } }
        if(tq!=null){ tally(tq, rk, z); drawSec[i][j]=tq; if(!fresh) attachR(secTree[tq], mkR(rk, i, log[i], j)); drawOwn[i][j]=tq; ownN[tq]++; }
        else { drawSec[i][j]=-1; if(!fresh) attachR(gradTree[tg], mkR(rk, i, log[i], j)); drawOwn[i][j]=-1-tg; }   /* cteni povysene patri JI (drive i matce: tahalo ji na druhou stranu) */
      }
    }
    var nSec=slots.length, mxS=1; for(var q9=0;q9<nSec;q9++) mxS=Math.max(mxS, ownN[q9]);
    var _out=slots.map(function(sl, q){ var nm=sl.el;
      var base=elByName[nm]||{el:nm, count:1, world:ELEM_WORLD[nm], aett:ELEM_AETT[nm], rune:(runesByEl[nm]||B.RUNES)[0], runeSeen:[]};
      var out={}; for(var p in base) out[p]=base[p]; out.ord=0;
      out.runeK=sl.runeK; out.norn=sl.norn; out.nornName=sl.nornName; out.band=sl.band;
      out.bornIdx=(sl.bornIdx==null)?null:sl.bornIdx;   /* ctení, kdy pramen vznikl (zakladaci = null = od semínka) */
      out.birthArea=sl.area||null; out.birthInt=sl.intention||null;
      out.side=sl.side||0; out.adopt=sl.adopt||0; out.noStrand=(sl.mother!=null); out.mother=sl.mother;   /* misto: strana z dat; rameno bez vlastniho pramene */
      out.count=secN[q]; out.ownN=ownN[q]; out.runeCnt=secCnt[q];
      /* aett (charakter rustu) = aett ZAKLADAJICI runy, pevne. Prevazujici aett cteni na rameni se pri remize prepinal
         a s nim krivost i zdvih spicky: spicka Perthova ramene skakala o 41 px tam a zpet (KUKYho strom #211, #247). */
      out.aett=KEY_AETT[sl.runeK]||out.aett;
      return out; });
    _out.placeRd=placeRd;
    _out.secTree=secTree; _out.grads=grads; _out.gradTree=gradTree; _out.drawSec=drawSec; _out.mx=mxS; _out.near=near;
    /* povysena vetev = klic 100 + poradi povyseni (stale cislo). Drive nSec+g: kazde nove rameno ho posunulo. */
    _out.drawOwn=drawOwn.map(function(row){ return (row||[]).map(function(v){ return (v==null) ? null : (v>=0 ? v : 100+(-1-v)); }); });
    _out.runeHost={};
    return _out;
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
    /* UHEL uz tady NENI (2026-09-30): stranu a rozevreni ramene dava kostra FR v poradi zrodu (draw).
       Drive k0 svisle · k1/k2 ±foundAng · od k3 stridave jen 0,30–0,50 rad -> nevyvazena kostra. */
    if(k===0) return { frac:crownT.exitTop };
    if(k===1) return { frac:crownT.exitTop-0.08 };
    if(k===2) return { frac:crownT.exitTop-0.11 };
    var t=k-3;
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
    return { frac:frac };
  }
  /* PRESNY VYSTUP (2026-10-03): bod pramene ve vysce `frac`, interpolovany mezi dvema body (pramen ma 40 bodu na kmen).
     Drive nejblizsi bod: dve ramena 0,01 od sebe vysla z tehoz bodu a vyska skakala po 1/39 kmene. */
  function exitPoint(pts, frac, from){ var ty=lerp(trunkT.groundY, trunkT.topY, frac), n=pts.length, i0=Math.max(0, from||0);
    for(var i=i0; i<n-1; i++){ var a=pts[i], b=pts[i+1]; if(a.y>=ty && b.y<ty){ var t=(a.y-ty)/Math.max(1e-6, a.y-b.y);
        return { i:i, tang:Math.atan2(b.y-a.y, b.x-a.x), p:{ x:lerp(a.x,b.x,t), y:ty, w:lerp(a.w,b.w,t), ct:lerp(a.ct,b.ct,t), depth:lerp(a.depth,b.depth,t), t:(a.t!=null&&b.t!=null)?lerp(a.t,b.t,t):a.t } }; } }
    var j=exitIndex(pts, frac), pa=pts[Math.max(0,j-1)], pb=pts[j];
    return { i:j, tang:Math.atan2(pb.y-pa.y, pb.x-pa.x), p:{ x:pb.x, y:pb.y, w:pb.w, ct:pb.ct, depth:pb.depth, t:pb.t } }; }
  function exitIndex(pts, frac){
    var targetY=lerp(trunkT.groundY, trunkT.topY, frac), best=pts.length-1, bd=1e9;
    for(var i=0;i<pts.length;i++){ if(pts[i].y<=trunkT.groundY+1){ var dd=Math.abs(pts[i].y-targetY); if(dd<bd){bd=dd;best=i;} } }
    return best;
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    _pick.length=0;
    var vlog=(state._viewN!=null) ? state.log.slice(0,state._viewN) : state.log;   /* KROK 1.5: prehravani po cteni N */
    /* ZALOZENI JE NUTNA PODMINKA (2026-10-02, KUKY: "strom neroste bez zalozeni! NIKDY. napred zivotni runa,
       pak norns"). Bez Noren seminko. S nimi strom obsahuje VSECHNA cteni, i ta pred zalozenim (2026-10-03:
       "nekdo si zalozi strom az po 20 ctenich… od zalozeni ma strom v sobe 20 cteni"); prvni Norny (3 runy)
       jdou na zacatek — davaji obrys — ostatni v case. 2026-10-02 se omylem bralo jen od Noren dal. */
    (function(){ var fi=-1; for(var q=0;q<vlog.length;q++){ var rq=vlog[q]; if(rq && rq.spread==='norns' && (rq.runes||[]).length===3){ fi=q; break; } }
      vlog = (fi<0) ? [] : [vlog[fi]].concat(vlog.slice(0,fi), vlog.slice(fi+1)); })();
    var useLog=vlog && vlog.length>0;                                 /* KROK 1: realna cteni ridi strom */
    _vlogRef=vlog; _runeTot={}; vlog.forEach(function(r){ (r.runes||[]).forEach(function(x){ _runeTot[x.rune]=(_runeTot[x.rune]||0)+1; }); });
    /* SEMINKO (2026-09-27, KUKY: pestovat novy strom v labu od zacatku). Drive tu byla "prazdna
       puda" bez kmene; aplikace ale bez cteni kresli holy kmen zivotni runy s koreny (RUNAR_TREE.md
       §2), takze lab ted dela totez: tri zakladaci prameny cekaji na Norny, vetve zadne. */
    var seed=(!useLog && !state.demo);
    var SEED_AGE=25;   /* = aplikace (build_tree_production.py); cteni se k nemu pricitaji */
    var realAge=(useLog||seed) ? SEED_AGE + vlog.length*crownT.readingEvery : state.treeAge;
    var dobSeed=hashStr(''+state.d+'-'+state.m+'-'+state.y);
    var lifeLean=((hashStr('lean'+state.rune)%1000)/1000-0.5)*0.30;   /* life-rune signature lean */
    var nR=(useLog||seed) ? vlog.length : Math.floor(realAge/crownT.readingEvery);
    var rt=(useLog||seed) ? routingFromLog(vlog) : routing(dobSeed, nR, crownT.diversity);   /* log -> element mix, jinak simulace */
    var els=rt.els;
    var hExp=Math.min(1.2, rt.big.h/18), wExp=Math.min(1.0, rt.big.wd/18), mExp=Math.min(1.0, rt.big.ms/18);
    var effCanopy=clamp(crownT.canopy+0.4*wExp, 0, 1.4), girth=1+0.35*mExp;
    /* #2 grow in height with age (+ fire/air/asgard big-spread expansion) */
    var hf=realAge/(realAge+420);
    /* V4 (2026-10-02): vyska stromu = kam se cteni divaji. Celkova zona vsech cteni (tlumena: soucet/(pocet+8))
       -> budoucnost az o 22 % vyssi strom, minulost az o 22 % nizsi (KUKY: "koukas hodne do budoucnosti, tvuj strom je vysoky"). */
    var _zt=0, _zn=0; for(var zi=0; zi<vlog.length; zi++){ var zr=vlog[zi].runes||[]; for(var zj=0; zj<zr.length; zj++){ _zt+=readZone(vlog[zi], zj, zr[zj].rune); _zn++; } }
    var Ztree=_zn ? _zt/(_zn+8) : 0; state._Ztree=Ztree;
    trunkT.topY=trunkTopY(realAge, rt.big.h, _zt, _zn);   /* = hf, hExp, Ztree vyse (jedna rovnice) */
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
    /* 2026-09-28: pramen vznika s elementem, ne s vekem (pravidlo 3) -> strop je jen maxMains.
       `linearN` (3 + vek/80) zustava jen jako cislo; pocet pramenu uz neridi. */
    var targetN=seed ? 0 : Math.max(1, Math.round(crownT.maxMains));     /* strop = maxMains */
    var branchEls=stableAssign(vlog, els, targetN);
    /* KONTROLA MISTA (smoke ㉳, 2026-10-05): misto kazdeho cteni a misto vetve, na ktere visi */
    window._PLACE={ rd:branchEls.placeRd||[], own:branchEls.drawOwn||[], sec:branchEls.map(function(b){ return { el:b.el, band:b.band, side:b.side||b.adopt||0, noStrand:!!b.noStrand }; }),
      grads:(branchEls.grads||[]).map(function(g){ return { el:(RBK[g.rune]||{}).el, band:g.band, side:g.side||g.adopt||0 }; }) };
    var mainsN=seed ? 0 : Math.max(1, branchEls.length);   /* ZONY: ramena = zalozena mista element × zona (strop maxMains hlida stableAssign) */
    trunkT.strandMax=seed ? 3 : mainsN;   /* F0b: pramen = runa, 1:1 · seminko: 3 zakladaci prameny bez runy */
    /* VERZE B: kazdy graduant si objedna VLASTNI pramen. Musi se to vedet PRED buildTrunk,
       protoze pocet pramenu, jejich drahy ve svazku i jejich narozeni jsou vstupem enginu.
       - laneOrder: graduant dostane drahu tesne vedle rodice (jinak by sel opacnou stranou
         svazku a musel by pri vystupu preletet kmen)
       - bornOrder: graduant se odstepil od rodice, takze sdili jeho narozeni. Bez toho by mu
         vzorec (s-2)*every dal zaporny vek a engine by ho preskocil uplne. */
    /* RUNA JEN JEDNOU (2026-09-27, KUKY: "nechci falesne vetve"). Runa s vlastnim pramenem uz
       nevisi jako odbocka na jine vetvi. Drive se dve vetve tehoz elementu nesly navzajem
       (zakladaci Kenaz·Fehu: Fehu vetev + Fehu odbocka na Kenazi). */
    _runeHost=branchEls.runeHost||{};
    _ownMain={}; for(var om=0; om<mainsN; om++){ var omr=mainRuneOf(branchEls[om]||{}, om); if(omr) _ownMain[omr.k]=1; }
    var gradStrands=[], LANE0=[0,1,-1,2,-2,3,-3,4,-4,5,-5,6,-6,7,-7];
    /* V4: zona run pro misto odstepeni graduanta — predbezne (bez plynuleho kroku) uz tady, protoze povyseni se
       pocita drive nez smycka vysek; presna (plynula) hodnota prepise _RUZ pozdeji. */
    _RUZ={}; (function(){ var a={}, n2={}; for(var i9=0;i9<vlog.length;i9++){ var r9=vlog[i9].runes||[]; for(var j9=0;j9<r9.length;j9++){ var k9=r9[j9].rune; a[k9]=(a[k9]||0)+readZone(vlog[i9], j9, k9); n2[k9]=(n2[k9]||0)+1; } }
      for(var k10 in a) _RUZ[k10]=clamp((a[k10]/(n2[k10]+2)+1)/2, 0, 1); })();
    delete trunkT.laneOrder; delete trunkT.bornOrder; delete trunkT.strandMin; delete trunkT.exitFrac;
    /* PRAVIDLO 3 i v KMENI (2026-09-28). Engine kmene si pocet pramenu pocital sam podle veku
       (3 + vek/80) a pramen s>=3 "rodil" az v den (s-2)*80, takze i po zmene stableAssign cekala
       zeme na pramen do #19 a stin do #46 (zmereno na KUKYho strome). Ted: pramenu je tolik, kolik
       je elementu (strandMin), a kazdy se narodi v den, kdy prisel jeho element (bornOrder). */
    /* PRAMENY JEN PRO MISTA S VLASTNIM PRAMENEM (2026-10-05): rameno pro druhou stranu / stred pramen nema (sdili ho, KUKY "14 pramenu").
       _STRS = poradi pramenu v enginu kmene -> index ramene; _bornSlot = den zrodu podle indexu ramene. */
    var _STRS=[], _NOSTR=[], _bornSlot=[];
    for(var bo0=0; bo0<mainsN; bo0++){ var be0=branchEls[bo0]||{}, bIx0=be0.bornIdx; _bornSlot[bo0]=(bIx0==null) ? 0 : SEED_AGE + bIx0*crownT.readingEvery;
      if(be0.noStrand) _NOSTR.push(bo0); else _STRS.push(bo0); }
    if(!seed && mainsN>0){ trunkT.strandMin=_STRS.length; trunkT.strandMax=_STRS.length; trunkT.bornOrder=_STRS.map(function(k0){ return _bornSlot[k0]; }); }
    /* KROK 2 (2026-09-29, KUKY: "napred musis dat tech 10 pramenu a ne 5 · runa dostane vlastni pramen
       tim, ze bude povysena jako graduant"). Verze B vracena OCISTENA (§26): drive (2026-09-28) byla
       vypnuta, protoze pramen graduanta vedl jako viditelna druha cara vedle rodice (= shluk) a sam
       graduant zustal jen vetsim twigem. Ted pramen jde kmenem vedle rodice a v jeho vystupu splyne
       s ramenem (rameno je az k odstepeni tlustsi); graduant roste jako samostatna hlavni vetev.
       Kolik pramenu celkem: `maxMains` (10). Narozeni pramene graduanta = cteni, kdy prekrocil prah. */
    if(!seed){   /* povysene vetve = mista cteni (2026-10-05) — vzdy; posuvnik gradStrand pryc (vypnuti by nechalo cteni bez vetve) */
      /* KDO a KDY se povysi, rozhodl stableAssign. Povysena vetev NEMA vlastni pramen v kmeni (2026-10-03, KUKY: "14 pramenu,
         11 povysenych maji mit stejny pramen s temi 14") — kmen ma jen mista element × zona; vetev vyroste z matky (niz). */
      var perP={};
      (branchEls.grads||[]).forEach(function(G, gi){ perP[G.p]=(perP[G.p]||0)+1;
        gradStrands.push({ p:G.p, rune:G.rune, u:0.4, slot:perP[G.p]-1, name:G.name, at:G.at, gi:gi, side:G.side, adopt:G.adopt, band:G.band, kind:G.kind }); });
      gradStrands.forEach(function(G){ _ownMain[G.rune]=1; });
    }
    /* VYSKY VYSTUPU predem (2026-10-01): engine kmene je potrebuje, aby kmen zuzoval podle pramenu, ktere
       v dane vysce jeste jsou (T.exitFrac). Stejny vypocet jako drive v cyklu ramen (emergence + Norny /
       zamer zakladajiciho cteni + pravidlo 5), jen o krok driv; graduant opousti kmen s rodicem. */
    var FRAC=[], FRAC0=[], ZST={}, RUZ={}; _ANG=[];
    /* V4 (2026-10-02): VYSTUP RAMENE = ZONA JEHO CTENI (drive hlavne poradi vzniku: 1. nahore, 2. 0,88, 3. 0,85…
       -> KUKYho strom 85 % hmoty nad vrcholem kmene, dolni pulka nic nerikala). Rameno (element) sbira zony vsech
       svych cteni (i povysenych run, dal na nem visi); cil = stred kmene ± zona (tlumena (pocet+3)) + element
       jemne; ramena se drzi aspon exitStep od sebe a pod vudci vetvi; k cili jdou nejvys 0,012 vysky kmene za
       cteni (zadny skok). Vudci vetev = vrchol kmene. Posuvnik intZone = sila casu na vysku (0,4 = plna). Tataz
       smycka vede i polohu RUNY podel ramene (RUZ 0..1: minulost u zakladu, budoucnost ke spicce, BOUGHS). */
    /* (2026-10-03) kostra FR se pocita PRED vyskami ramen: rozestup vystupu zavisi na strane ramene (vysky niz). FR na vyskach
       nezavisi (poradi zrodu + hmota cteni), takze presun nic jineho nemeni. */
    /* KOSTRA CO NEJVIC ROZLOZENA (2026-09-30, KUKY: "prvnich 10 pramenu je dobre co nejvice rozlozit,
       aby byl na zacatku strom vyvazeny, pro to, aby se pak mohlo rozhodovat"). Vsechna ramena — i
       povysene graduanty (KUKY: "i povysene rameno muze jit treba z leva do prava") — dostanou stranu
       v PORADI ZRODU: vudci nahoru, pak vpravo, vlevo, vpravo… (strany se v kazdou chvili lisi nejvys
       o jedno rameno). Rozevreni se na kazde strane stridá zlatym rezem v pasmu, prvni = foundAng.
       Drive: zakladaci Norny ±45°, dalsi elementy jen 17–29°, graduanty vzdy na strane rodice
       (KUKYho strom: 3 vpravo, 2 vlevo). Kam se strom pak prikloni, rozhodnou cteni (limbPath).
       Poradi zrodu se jen prodluzuje (prameny i povyseni jdou v case) -> nic se neprehazi. */
    var FR=[];
    (function(){ var list=[], sp0=0.7+0.6*crownT.canopy;
      for(var q=0; q<mainsN; q++){ var bq=(branchEls[q]||{}).bornIdx; list.push({ k:q, at:(bq==null)?0:bq, g:0 }); }
      gradStrands.forEach(function(G, j){ list.push({ k:100+j, at:(G.at!=null)?G.at:0, g:1 }); });   /* povysena vetev: klic 100 + j (stale) */
      list.sort(function(a,b){ return (a.at-b.at) || (a.g-b.g) || (a.k-b.k); });
      var cnt={}, i=0, gold=function(n){ return ((n+1)*0.6180339887)%1; };
      /* PRI SHODE POCTU rozhodne HMOTA (2026-09-30): nove rameno jde na stranu, jejiz ramena mela do jeho
         zrodu MENE cteni. Ciste stridani (vpravo prvni) dalo pri 9 bocnich ramenech prave strane vzdy
         o jedno vic -> vyvazeni lide 44–47 % vlevo; obracene (vlevo prvni) 49–53 % (tree_diag scen). */
      /* ZONY: cteni patri ramenu sve sekce, od povyseni povysene vetvi (drawOwn ze stableAssign) */
      var mass={}, ptr=0, _DO=branchEls.drawOwn||[];
      var advance=function(t){ for(; ptr<=t && ptr<vlog.length; ptr++){ (vlog[ptr].runes||[]).forEach(function(r, j){ var ow=(_DO[ptr]||[])[j]; if(ow!=null) mass[ow]=(mass[ow]||0)+1; }); } };
      list.forEach(function(it){
        if(i===0 && it.k===0){ FR[it.k]={ side:0, mag:0, n:0 }; i++; return; }
        /* STRANA Z DAT (2026-10-05, KUKY: "jake stridani? strom je zrcadlem cteni cloveka"): strana = strana mista (oblast cteni,
           ktera ho zalozila a ktera na nem rostou — druha strana ma vlastni rameno). Stred (Love, Crossroads, bez oblasti) = strme
           u kmene; kresba ale stranu potrebuje -> svet runy (Hel vlevo, Asgard vpravo), Midgard podle runy (pevne, bez vyznamu).
           Drive stridani: vyvazovalo pocet a pocitalo i povysene, ktere na pridelene strane nerostly (KUKYho strom 9 : 4).
           Demo bez logu strany z dat nema -> stridani jako drive. */
        var sDat=it.g ? ((gradStrands[it.k-100]||{}).side) : ((branchEls[it.k]||{}).side), sd, ctr=false;
        if(sDat===undefined){ sd=((cnt[1]||0)<=(cnt[-1]||0)) ? 1 : -1; }
        else if(sDat){ sd=sDat; }
        else { ctr=true; var rkF=it.g ? (gradStrands[it.k-100]||{}).rune : (branchEls[it.k]||{}).runeK, wF=RBK[rkF] ? RBK[rkF].world : null;
               sd=(wF==='hel') ? -1 : ((wF==='asgard') ? 1 : ((hashStr(String(rkF))&1) ? 1 : -1)); }
        var n=(cnt[sd]=(cnt[sd]||0)+1)-1; i++;
        /* TIHA (2026-10-03): rameno se rodi v NEUTRALNI poloze (`bendN`, ±15 % zlatym rezem, at nejsou vsechna stejna);
           ohne ho tiha jeho cteni (limbPath -> bendMag). Stred: strmeji (0,4 ×). */
        var elK=it.g ? ((RBK[(gradStrands[it.k-100]||{}).rune]||{}).el) : ((branchEls[it.k]||{}).el);
        var mgK=((crownT.bendN!=null)?crownT.bendN:0.65)*(0.85+0.30*gold(n))*(ctr ? 0.4 : 1);
        FR[it.k]={ side:sd, n:n, mag:clamp(mgK*sp0, 0.15, 1.45), el:elK, center:ctr }; }); })();
    if(!seed && mainsN>0){
      var HL=clamp((crownT.exitFloor!=null)?crownT.exitFloor:0.22, 0.12, 0.6), HH=crownT.exitTop-0.06, G0b=Math.max(0.02, crownT.exitStep), KZ=3;
      var zsp=clamp((crownT.intZone!=null ? crownT.intZone : 0.4)/0.4, 0, 1.5);
      var DS=branchEls.drawSec||[];
      var zs=[], zn=[], hh=[], bornQ=[], zc=[], rz={}, rn={}, ru={};
      for(var q4=0; q4<mainsN; q4++){ zs[q4]=0; zn[q4]=0; hh[q4]=null; zc[q4]={ dole:0, stred:0, nahore:0 }; var bi4=(branchEls[q4]||{}).bornIdx; bornQ[q4]=(bi4==null)?0:bi4; }
      /* ZONY (2026-10-03): cil = STRED PASMA ramene (urd · verdandi · skuld; stin na hranach) a uvnitr pasma prumer zon jeho
         cteni (tlumeny KZ). Element vysku nemeni (KUKY: "rozprostreni elementu neni systematicke"). */
      var HLe=HL;
      var tgtOf=function(q){ var be4=branchEls[q]||{}, bd4=be4.band||0, c4=bandC(be4.el, bd4), lh4=bandLoHi(be4.el, bd4);
        var av4=zn[q] ? clamp(zs[q]/zn[q], lh4[0], lh4[1]) : c4, Z=c4+(av4-c4)*zn[q]/(zn[q]+KZ);
        return clamp(0.5*(HLe+HH)+0.5*(HH-HLe)*clamp(Z*zsp,-1,1), HLe, HH); };
      /* KAZDE RAMENO Z JINEHO MISTA — ZARUCENE (2026-10-03, KUKY: "proc dve vetve vyrustaji presne z jednoho mista? …
         nechci, aby vyrustaly dve nebo vice vetvi ze stejneho mista — tohle resim od samoho zacatku"). Drive se rozestup
         hlidal jen u CILU a skutecna vyska k nemu klouzala, takze nove rameno (narozene rovnou na cili) a starsi (teprve
         odjizdejici) stala chvili ve stejne vysce; s vychozi podlahou 0,50 vychazely dvojice 6–10 px od sebe. Ted:
         - nove rameno se narodi do nejblizsi VOLNE mezery mezi SKUTECNYMI vyskami (starsi se nehnou);
         - poradi ramen podle vysky se nikdy nemeni (zadne predbihani = nikdy nejsou ve stejne vysce); cile se rozestupuji
           v tomhle poradi a rameno k cili jede nejvys o STEP za cteni — rozestup >= G0 se tim nikdy nezmensi;
         - G0 = exitStep, kdyz je misto; jinak min. GMIN a KMEN POVYROSTE (2026-10-03, KUKY "kdyz bude strom rust do nebe, tak
           nema limit"): drive ustoupila podlaha a ramena sjizdela k zemi (modelove stromy az pod zem, KUKYho strom 16 %). */
      /* GMIN = POLOVINA exitMinPx = rozestup leveho a praveho ramene; na stejne strane SAMEF 2 = cely exitMinPx (KUKY 2026-10-03:
         "30px min.", pak obrazek 4). Cely exitMinPx i mezi levym a pravym nechal na mladem kmeni jen 8 ramen -> "koste". */
      var Hpx=Math.max(80, trunkT.groundY-trunkT.topY), GMIN=clamp(Math.max(5, crownT.exitMinPx||30)/2/Hpx, 0.01, 0.3), STEP=0.006, ordL=[];
      var capT=Math.min(crownT.exitTop-G0b, clamp(crownT.exitTop+0.02, 0.30, 0.98)-GMIN);   /* i od vystupu vudci vetve aspon exitMinPx (mlady strom: 19 px) */
      var MINPX3=Math.max(5, crownT.exitMinPx||30)/2, hBig3=0, hZs3=0, hZn3=0;
      /* KMEN POVYROSTE, KDYZ RAMENA POTREBUJI MISTO: needH = vyska kmene, na kterou se mezi podlahu (HL) a strop vejde soucet
         rozestupu (sF × polovina exitMinPx; stejna strana se pocita 2×). Hneed3 jen roste (strom se nezmensuje), strop = obrazovka. */
      var Hneed3=0, HfinQ=0, HMAX3=1000, capA3=crownT.exitTop-G0b,   /* strop jako proporce (2026-10-05); draw strom prizpusobi platnu */ top03=clamp(crownT.exitTop+0.02, 0.30, 0.98);
      var needH=function(sF){ return Math.min(HMAX3, Math.max(sF*MINPX3/Math.max(0.05, capA3-HL), (sF+1)*MINPX3/Math.max(0.05, top03-HL))); };   /* vyska kmene v kazdem cteni (trunkTopY) — GMIN a strop se pocitaji pro TO cteni */
      /* STRANA RAMENE V CASE (2026-10-03, KUKY: "Eihwaz, Hagalaz, Ansuz prakticky vyrustaji z jednoho mista"): tri ramena
         vpravo 15 px nad sebou vypadala jako jeden svazek, protoze rozestup hlidal jen vysku. Ramena na STEJNE strane tesne
         nad sebou potrebuji SAMEF× vetsi odstup; na protejsich stranach staci zakladni. Strana = kostra FR + preklopeni, kdyz
         cteni o oblasti jasne prevazi (tataz pravidla jako limbPath, aby rozestup a kresba mluvily o teze strane).
         SAMEF 2 (2026-10-03, obrazek 4): stejna strana = cely exitMinPx (30 px), leve a prave = polovina. */
      var SAMEF=2.0, sdQ=[], s0Q=[], svQ=[], nQ=[], K0s=(crownT.lrK!=null)?crownT.lrK:5, ONs=(crownT.lrOn!=null)?crownT.lrOn:LR_ON;
      /* UHEL RAMENE V CASE: cil = tataz pravidla jako limbPath (kostra FR + tiha + natoceni za ctenimi), k cili krokem LR_STEP
         za cteni. VEJIR ZRUSEN (2026-10-03, KUKY "a je to koste … uz to neni strom"): nutil na kazde strane nizsi rameno aspon
         0,25 rad vodorovneji nez rameno nad nim (proti prekryvu Othila+Thurisaz 154 px) -> vodorovne klacky od zeme nahoru.
         Prekryvy ted resi rozestup 30 px na stejne strane; zbytek hlasi tree_overlap.js. */
      var slQ=[], zQ=[], angQ=[], ANG=[];
      /* POVYSENE VETVE VE VEJIRI (2026-10-03): kazda ma vlastni stranu (kostra FR klic 100+j, preklopeni jako limbPath z jejich
         cteni na rameni matky), cil (tiha + natoceni) a slot ve vejiri hned nad matkou; zive od povyseni. Drive stala mimo vejir
         a odklon "strmeji o GDIV" ji posilal soubezne s vudci vetvi nebo se sousedem (detektor: prekryv 10–33 px). */
      var gIx={}, gN=[], gSv=[], gSl=[], gZ=[], gSd=[], gS0=[], gAngQ=[], gTurnQ=[];   /* gTurnQ: smer odbocky povysene, urceny v cteni povyseni */
      gradStrands.forEach(function(G, j){ gIx[G.p+'|'+G.rune]=j; gN[j]=0; gSv[j]=0; gSl[j]=0; gZ[j]=0; gS0[j]=(FR[100+j]||{ side:0 }).side||0; gSd[j]=gS0[j]; gAngQ[j]=null; });
      _GANG=[];
      for(var q4c=0; q4c<mainsN; q4c++){ slQ[q4c]=0; zQ[q4c]=0; angQ[q4c]=null; }
      for(var q4b=0; q4b<mainsN; q4b++){ s0Q[q4b]=(FR[q4b]||{ side:0 }).side||0; sdQ[q4b]=s0Q[q4b]; svQ[q4b]=0; nQ[q4b]=0; }
      /* strana pro rozestup = kam rameno OPRAVDU miri (uhel z minuleho cteni); do 0,2 rad od svislice = v preklapeni -> obe strany.
         Drive sdQ: pri preklopeni se uhel stoci az za nekolik cteni, a dve ramena na stejne strane stala 15 px od sebe (7 stromu). */
      var sideNow=function(q){ var a=angQ[q]; if(a==null) return sdQ[q]; var dv=a+Math.PI/2; return (Math.abs(dv)<0.2) ? 2 : (dv>0 ? 1 : -1); };
      var needF=function(qa, qb){ var sa=sideNow(qa), sb=sideNow(qb); if(!sa || !sb) return 1; return (sa===2 || sb===2 || sa===sb) ? SAMEF : 1; };
      for(var i3=0; i3<vlog.length; i3++){ var rs3=vlog[i3].runes||[];
        for(var j3=0; j3<rs3.length; j3++){ var rk3=rs3[j3].rune, z3=readZone(vlog[i3], j3, rk3), q5=(DS[i3]||[])[j3];
          hZs3+=z3; hZn3++; if(vlog[i3].spread && vlog[i3].spread!=='single' && (rs3[j3].el==='fire' || rs3[j3].el==='air')) hBig3++;
          rz[rk3]=(rz[rk3]||0)+z3; rn[rk3]=(rn[rk3]||0)+1;
          if(q5!=null && q5>=0 && q5<mainsN){ zs[q5]+=z3; zn[q5]++; zc[q5][zoneWord(z3)]++;
            nQ[q5]++; var ar5=vlog[i3].area; if(ar5!=null && AREA_LAT[ar5]!=null) svQ[q5]+=AREA_LAT[ar5];
            slQ[q5]+=latOf(ar5, rk3); zQ[q5]+=z3;   /* jako limbPath: natoceni za ctenimi (b) a tiha (zona) */
            var gj5=gIx[q5+'|'+rk3]; if(gj5!=null){ gN[gj5]++; if(ar5!=null && AREA_LAT[ar5]!=null) gSv[gj5]+=AREA_LAT[ar5]; gSl[gj5]+=latOf(ar5, rk3); gZ[gj5]+=z3;
              var g05=gS0[gj5]; if(g05){ var gb5=gSv[gj5]/(gN[gj5]+K0s); if(gSd[gj5]===g05){ if(gb5*g05<=-ONs) gSd[gj5]=-g05; } else if(gb5*gSd[gj5]<LR_OFF) gSd[gj5]=g05; } }
            var s05=s0Q[q5]; if(s05){ var bA5=svQ[q5]/(nQ[q5]+K0s);   /* preklopeni stranou (limbPath) */
              if(sdQ[q5]===s05){ if(bA5*s05<=-ONs) sdQ[q5]=-s05; } else if(bA5*sdQ[q5]<LR_OFF) sdQ[q5]=s05; } } }
        var Hp3=Math.max(80, trunkT.groundY-trunkTopY(SEED_AGE0 + (i3+1)*crownT.readingEvery, hBig3, hZs3, hZn3), Hneed3);   /* vek, nebo vic, kdyz ramena potrebovala misto */
        GMIN=clamp(MINPX3/Hp3, 0.01, 0.3); capT=Math.min(capA3, top03-GMIN); HfinQ=Hp3;
        var newb=[]; for(var q6=1; q6<mainsN; q6++){ if(bornQ[q6]<=i3 && hh[q6]==null) newb.push(q6); }
        var nLive=ordL.length+newb.length;
        if(!nLive) continue;
        /* zakladni rozestup G0 tak, aby se vesel soucet potreb (stejna strana SAMEF ×); pri vkladani novych zatim odhad */
        var sumF=newb.length; for(var a5=1; a5<ordL.length; a5++) sumF+=needF(ordL[a5-1], ordL[a5]);
        HLe=Math.max(0.10, Math.min(HL, capT-Math.max(0, sumF)*GMIN));
        var G0=Math.max(GMIN, Math.min(Math.max(G0b, GMIN), (capT-HLe)/Math.max(1, sumF)));   /* nikdy pod exitMinPx */
        newb.forEach(function(q){ var t=tgtOf(q), best=null, bestD=1e9, wide=null, wideW=-1;
          for(var g=0; g<=ordL.length; g++){ var lo=(g===0)?HLe:hh[ordL[g-1]], hi=(g===ordL.length)?capT:hh[ordL[g]];
            var loC=(g===0)?lo:lo+G0*needF(ordL[g-1], q), hiC=(g===ordL.length)?hi:hi-G0*needF(q, ordL[g]);   /* od podlahy a stropu netreba odstup */
            if(hi-lo>wideW){ wideW=hi-lo; wide={ g:g, pos:(g===0) ? Math.max(lo, hi-G0) : ((g===ordL.length) ? Math.min(hi, lo+G0) : (lo+hi)/2) }; }
            /* ZROD PODLE ZONY (2026-10-05, KUKY: "kdyz nekde vyroste neco noveho, jelikoz to tam podle cteni patri … ostatni se muzou
               trochu posunout"): mezera, kde lezi CIL ramene (zona jeho cteni), i kdyz v ni neni misto — sousede se rozestoupi
               (rychle kroky nize). Drive prvni VOLNA mezera: Raidho (24 cteni o minulosti) se narodilo nahore, protoze dole
               misto nebylo, a poradi se uz nezmeni; totez Uruz (minulost, 64 %) a Eihwaz (budoucnost, 47 %). */
            var dA=Math.abs(clamp(t, lo, hi)-t), posA=(hiC>=loC) ? clamp(t, loC, hiC) : ((hi>lo) ? clamp(t, lo+0.25*(hi-lo), hi-0.25*(hi-lo)) : lo);
            if(dA<bestD-1e-9 || (Math.abs(dA-bestD)<1e-9 && hiC>=loC)){ bestD=dA; best={ g:g, pos:posA }; } }
          var pk=best||wide; hh[q]=pk.pos; ordL.splice(pk.g, 0, q); });
        sumF=0; for(var a5b=1; a5b<ordL.length; a5b++) sumF+=needF(ordL[a5b-1], ordL[a5b]);
        Hneed3=Math.max(Hneed3, needH(sumF)); if(Hneed3>Hp3){ Hp3=Hneed3; GMIN=clamp(MINPX3/Hp3, 0.01, 0.3); capT=Math.min(capA3, top03-GMIN); HfinQ=Hp3; }
        HLe=Math.max(0.10, Math.min(HL, capT-Math.max(0, sumF)*GMIN));   /* podlaha ustoupi jen kdyz kmen narazi na vysku obrazovky */ G0=Math.max(GMIN, Math.min(Math.max(G0b, GMIN), (capT-HLe)/Math.max(1, sumF)));
        var Tg=ordL.map(function(q){ return clamp(tgtOf(q), HLe, capT); });
        for(var a6=1; a6<Tg.length; a6++) Tg[a6]=Math.max(Tg[a6], Tg[a6-1]+G0*needF(ordL[a6-1], ordL[a6]));
        for(var a7=Tg.length-1; a7>=0; a7--) Tg[a7]=Math.min(Tg[a7], (a7===Tg.length-1) ? capT : Tg[a7+1]-G0*needF(ordL[a7], ordL[a7+1]));
        /* dokud je nekde mezera pod G0 (nove rameno se muselo vklinit), jedou VSECHNA ramena rychleji (0,02 za cteni);
           stejny krok pro vsechny = zadna mezera se cestou nezmensi. Pomaly krok 0,006 vracel rozestup az za ~6 cteni a mlady
           strom, kde se ramena rodi rychle za sebou, mel vystupy 8 px od sebe (smoke ㉳, 2026-10-03). */
        /* v cteni, kdy se rameno narodilo, dva takove kroky: spread (Kompas, Kriz…) jich muze zalozit vic naraz a kazde
           pulilo nejsirsi mezeru (KUKYho strom #35: tri nova ramena, vystupy 8,6 px od sebe) */
        /* pri zrodu ramene se sousede rozestoupi HNED (az 12 kroku), at exitMinPx plati v kazdem okamziku: postupne rozestupovani
           nechalo mlady strom 2 cteni s vystupy 17 px od sebe (smoke ㉳, 'minulost' po 20 ctenich). Sousede se pohnou nejvys o pul rozestupu. */
        /* az 12 rychlych kroku pokazde, kdyz je nekde tesno (ne jen pri zrodu): rameno, ktere se preklapi pres svislici, chce
           od obou sousedu cely exitMinPx — bez toho by par cteni stalo jen 15 px od ramene na stejne strane. */
        for(var rp8=0; rp8<12; rp8++){
          var tight=false; for(var a8=1; a8<ordL.length; a8++){ if(hh[ordL[a8]]-hh[ordL[a8-1]]<G0*needF(ordL[a8-1], ordL[a8])-1e-6){ tight=true; break; } }
          if(rp8>0 && !tight) break;
          var stp=tight ? 0.02 : STEP;
          ordL.forEach(function(q, a){ hh[q]+=clamp(Tg[a]-hh[q], -stp, stp); }); }
        /* uhly: cil kazdeho ramene, vejir po stranach (shora dolu podle skutecne vysky), krok k cili */
        var tgA={}; ordL.forEach(function(q){ var fr6=FR[q]||{ side:0, mag:0 };
          var t6=-Math.PI/2 + lifeLean*0.6 + (s0Q[q] ? sdQ[q]*bendMag(fr6.mag, zQ[q], nQ[q]) : 0) + (crownT.areaSide||0)*(slQ[q]/(nQ[q]+K0s));
          tgA[q]=softSide(t6, -Math.PI/2); });
        gradStrands.forEach(function(G, j){ if(gTurnQ[j]==null && G.at<=i3 && hh[G.p]!=null && angQ[G.p]!=null){   /* smer odbocky: jednou, pri povyseni */
          var mB=angQ[G.p]+Math.PI/2, mS=(Math.abs(mB)<0.05) ? ((FR[100+j]||{}).side||1) : (mB>0 ? 1 : -1), rk=0;
          ordL.forEach(function(q){ if(q!==G.p && sdQ[q]===mS && hh[q]>hh[G.p]) rk++; });
          gTurnQ[j]=((Math.abs(mB)<0.75) ? mS : -mS)*((G.slot===1) ? -1 : 1)*((rk%2===1) ? -1 : 1); } });
        var liveG=[]; gradStrands.forEach(function(G, j){ if(G.at<=i3 && hh[G.p]!=null){ liveG.push(j);
          var frg=FR[100+j]||{ side:0, mag:0 }, tg=-Math.PI/2 + lifeLean*0.6 + (gS0[j] ? gSd[j]*bendMag(frg.mag, gZ[j], gN[j]) : 0) + (crownT.areaSide||0)*(gSl[j]/(gN[j]+K0s));
          tgA['g'+j]=softSide(tg, -Math.PI/2); } });
        /* PORADI UHLU NA STRANE (2026-10-05, KUKY "oprav i ty dve ramena na stejne strane"): spodni rameno strmejsi nez rameno nad
           nim na teze strane do nej vzdy vroste (modelove stromy: Tiwaz/Othila 67°/38°, Raidho/Hagalaz 80°/38°). Nejmensi zmena,
           ktera obraceni odstrani: porusena dvojice (a retez) se srovna na prumer, spodni aspon o FANM vodorovneji (PAV). Zadne
           svorky — zruseny vejir (DECISIONS 2026-10-03 (15)) nutil 0,25 rad na kazde rameno a svorky az do vodorovna (koste). */
        [1,-1].forEach(function(sd6){ var E6=ordL.filter(function(q){ return sdQ[q]===sd6; }).sort(function(a,b){ return hh[b]-hh[a]; });
          if(E6.length<2) return; var FANM=0.10, bl=[];
          E6.forEach(function(q, a){ var v=(tgA[q]+Math.PI/2)*sd6 - a*FANM; bl.push({ v:v, n:1 });
            while(bl.length>1 && bl[bl.length-2].v>bl[bl.length-1].v){ var b2=bl.pop(), b1=bl.pop(); bl.push({ v:(b1.v*b1.n+b2.v*b2.n)/(b1.n+b2.n), n:b1.n+b2.n }); } });
          var a2=0; bl.forEach(function(b){ for(var t=0; t<b.n; t++, a2++){ var q=E6[a2]; tgA[q]=-Math.PI/2 + sd6*(b.v + a2*FANM); } }); });
        ordL.forEach(function(q){ angQ[q]=(angQ[q]==null) ? tgA[q] : angQ[q]+clamp(tgA[q]-angQ[q], -LR_STEP, LR_STEP); });
        liveG.forEach(function(j){ var tg=tgA['g'+j]; gAngQ[j]=(gAngQ[j]==null) ? tg : gAngQ[j]+clamp(tg-gAngQ[j], -LR_STEP, LR_STEP); });
        for(var rk4 in rz){ var tu4=clamp((rz[rk4]/(rn[rk4]+2)+1)/2, 0, 1); ru[rk4]=(ru[rk4]==null) ? tu4 : ru[rk4]+clamp(tu4-ru[rk4], -0.01, 0.01); }
      }
      if(HfinQ>0) trunkT.topY=Math.min(trunkT.topY, trunkT.groundY-HfinQ);   /* kmen povyrostl, kdyz ramena potrebovala misto (needH) */
      if(_hwTop!=null) trunkT.topY=Math.min(trunkT.topY, _hwTop);   /* PROPORCE: druhy pruchod — kmen doroste k sirce koruny */
      FRAC[0]=clamp(crownT.exitTop+0.02, 0.30, 0.98); FRAC0[0]=FRAC[0];   /* vudci vetev (zakladaci skuld) = vrchol kmene */
      for(var q7=1; q7<mainsN; q7++){ FRAC0[q7]=tgtOf(q7); FRAC[q7]=(hh[q7]!=null) ? hh[q7] : FRAC0[q7]; ANG[q7]=angQ[q7]; }
      _ANG=ANG; gradStrands.forEach(function(G, j){ _GANG[j]=gAngQ[j]; _GTURN[j]=gTurnQ[j]; });
      for(var q8=0; q8<mainsN; q8++) ZST[q8]={ z:zs[q8]/(zn[q8]+KZ), n:zn[q8], c:zc[q8] };
      RUZ=ru; _RUZ=ru;
      /* ODSTEPENI GRADUANTA podel matky (F2: 1/5–3/5) = zona jeho cteni uvnitr pasma matky DO CHVILE POVYSENI. */
      gradStrands.forEach(function(G){ var be5=branchEls[G.p]||{}, lh5=bandLoHi(be5.el, be5.band||0), s5=0, n5=0;
        var _DO5=branchEls.drawOwn||[];   /* MISTO (2026-10-05): cteni povysene = ta, ktera na ni patri (drawOwn), jakakoli runa elementu */
        for(var i5=Math.max(0, G.at||0); i5<=Math.min(G.at||0, vlog.length-1); i5++){ var r5=vlog[i5].runes||[];   /* jen zakladajici cteni: misto odstepeni stale */
          for(var j5=0; j5<r5.length; j5++){ if(((_DO5[i5]||[])[j5])===100+G.gi){ s5+=readZone(vlog[i5], j5, r5[j5].rune); n5++; } } }
        G.u=0.20+0.40*(n5 ? clamp((s5/n5-lh5[0])/Math.max(1e-6, lh5[1]-lh5[0]), 0, 1) : 0.5); });
      /* ROZDELOVAC MIST NA RAMENI: prime vetvicky (v poradi zrodu) a povysene (v chvili povyseni) — kazda nova aspon DMIN
         od starsich. Prime deti ramene pak sedi na _KU[q][ix], povysena na G.u. */
      _KU={};
      for(var qq=0; qq<mainsN; qq++){ var sT=(branchEls.secTree||[])[qq]; if(!sT) continue; var fk=sT.k, ev=[];
        sT.kids.forEach(function(c, ix){ ev.push({ t:c.born, o:0, ix:ix, want:rhythmU(fk, ix) }); });
        gradStrands.forEach(function(G){ if(G.p===qq) ev.push({ t:G.at, o:1, G:G, want:G.u }); });
        ev.sort(function(a,b){ return (a.t-b.t) || (a.o-b.o) || ((a.ix||0)-(b.ix||0)); });
        var placed=[], ku=[];
        ev.forEach(function(e){ var isG=!!e.G, u=freeSpot(e.want, isG?0.30:0.08, isG?0.62:0.97, placed, isG);   /* povysena aspon 0,30 delky matky od kmene (u kmene narazela do ramene nad sebou) */
          placed.push({ u:u, g:isG }); if(isG) e.G.u=u; else ku[e.ix]=u; });
        _KU[qq]=ku; }
      trunkT.exitFrac=_STRS.map(function(k0){ return FRAC[k0]; }); }   /* engine kmene: jen prameny (kompaktne) */
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
    var _usedFrac=[];  /* vysky vystupu STARSICH pramenu (pravidlo 5) */
    /* RAMENA BEZ PRAMENE (2026-10-05): vyjdou z kmene na SVE strane ve sve vysce — z pramene, ktery je v te vysce v kmeni a lezi
       nejbliz okraji na te strane (uvnitr kmene "jedno, dokud se neoddeli"). Koren ani zrcadleni do korenu nemaji (jako povysene). */
    var _VS=gt.limbs.filter(function(L2){ var l2=L2.pts[L2.pts.length-1]; return l2.y<=trunkT.groundY && l2.y<=trunkT.topY+2; });
    var _edgeFor=function(k2){ var f2=FRAC[k2], s2=(FR[k2]||{}).side||1, best2=null, bx2=0;
      _VS.forEach(function(L2, sk2){ if(sk2>=_STRS.length) return; var ef2=(trunkT.exitFrac||[])[sk2]; if(ef2==null || ef2<f2+0.004) return;
        var rE2=0; for(var r2=L2.pts.length-1;r2>=0;r2--){ if(L2.pts[r2].y>=trunkT.groundY-1){ rE2=r2; break; } }
        var p2=exitPoint(L2.pts, f2, rE2); if(!p2) return; var xx2=p2.p.x*s2; if(best2==null || xx2>bx2){ bx2=xx2; best2={ L:L2, rE:rE2 }; } });
      return best2; };
    var _LIMBS=gt.limbs.map(function(L2){ return { L:L2, ns:false }; });
    _NOSTR.forEach(function(k2){ if(FRAC[k2]==null) return; var e2=_edgeFor(k2); if(e2) _LIMBS.push({ L:e2.L, ns:true, k:k2, rE:e2.rE }); });
    _LIMBS.forEach(function(E){ var L=E.L, NS=!!E.ns;
      var last=L.pts[L.pts.length-1];
      var rE=0; for(var ri0=L.pts.length-1;ri0>=0;ri0--){ if(L.pts[ri0].y>=trunkT.groundY-1){ rE=ri0; break; } }   /* KROK 3: baze = prvni bod od VRCHU na urovni zeme (prechod kmen<->koren). Backward-scan chyta i up-koren -> trunk-engine vlastni koren (0..rE) se VZDY vyloudi a nahradi composer korenem. */
      if(NS || last.y<=trunkT.topY+2){
        var sk=NS ? -1 : strandK++, k=NS ? E.k : ((sk<_STRS.length) ? _STRS[sk] : mainsN+sk); if(!NS) strands.push({L:L,k:k});
        /* reflect trunk-base thickness into the root: stay fat just below the
           junction (mighty root flare), taper to normal toward the tip */
        if(rE>2 && !NS){ for(var rj=0;rj<rE;rj++){ var ru=(rE-rj)/rE; L.pts[rj].w*=1+(rootsT.junctionThick-1)*Math.pow(1-ru,2); } }
        if(NS || sk<_STRS.length){   /* F0: hlavni vetev jen kde pramen ma tazenou runu; prebytek -> reinforce (posiluje) */
          /* EMERGE: strand -> main branch. Pozice = kostra (vudci nahoru + 2x45 + patra)
             + life-rune podpis. Charakter = element (dle mixu cteni) -> runa/barva/tip/rytmus.
             Velikost = vek pramene (zakladaci velke, nove male) x dominance elementu. */
          var be=branchEls[k]||branchEls[branchEls.length-1]||{el:'earth',world:'midgard',aett:'heimdall',count:5};
          var bpool=runesByEl[be.el]||B.RUNES;
          var seenK=(be.runeSeen&&be.runeSeen.length)?be.runeSeen:null;
          var brune=(be.runeK && RBK[be.runeK]) ? RBK[be.runeK]
                  : seenK ? (RBK[seenK[Math.min(be.ord||0, seenK.length-1)]]||bpool[0]) : bpool[k%bpool.length];   /* #2: main = ord-ta TAŽENÁ runa (sticky); demo bez logu -> kanon */
          var e=emergence(k);
          /* PRESKAKOVANI (zmereno 2026-09-28 na KUKYho strome): strana a vyska se pocitaly z PRUMERU
             area/intention vsech cteni elementu -> kazde cteni otocilo celou hotovou vetev (az 111 px).
             Ted rozhoduje cteni, ktere pramen ZALOZILO. */
          /* LEVA/PRAVA (2026-09-29, KUKY: "leva a prava strana prvni"). Stranu stromu urcuji RAMENA
             a kazde nese smes cteni (KUKYho strom: Ingwaz 27 nitro / 26 svet). Drive rameno stalo, kam
             ho dala kostra (Norny, stridani), a oblast ho jen postrcila podle JEDNOHO zakladajiciho
             cteni -> strom s vyrovnanymi ctenimi (130 nitro : 125 svet) mel hmotu 40 : 60.
             Ted se rameno natoci za VSEMI svymi ctenimi (limbPath: preklopeni + natoceni, pomalu).
             Kostra (FR, od 2026-09-30 v poradi zrodu) dava vychozi stranu a rozestup.
             ⚠️ ZKOUSENO A ZAMITNUTO: strana noveho pramene podle cteni, ktere ho zalozilo. Na 24
             modelovych lidech chyba 9,1 b. proti 6,7 bez ni, u vyvazenych az 19 b. — o strane by
             rozhodovala nahodna oblast JEDNOHO cteni (tree_diag.js lreval, 2026-09-29).
             ⭐ VRACENO OCISTENE 2026-10-05 (§26, KUKY "kazde cteni presne tam, kam patri"): vada byla, ze rameno neslo SMES
             cteni obou stran a o strane te smesi rozhodlo jedno cteni. Ted je strana soucasti MISTA (element × pasmo ×
             strana): cteni druhe strany na tohle rameno vubec nejdou (maji svou vetev), takze strana ramene = strana VSECH
             jeho cteni (stred se pridava). stableAssign + kostra FR; DECISIONS 2026-10-05 (12). */
          /* runy na rameni = jeho runa + vse, co na nem roste (i povyseny graduant — dal na rameni visi,
             jeho cteni rameno nese; bez toho se rodic pri povyseni otocil o 8°, LR3) */
          var _DS=branchEls.drawSec||[], memb=function(i, j){ return (_DS[i]||[])[j]===k; };   /* ZONY: vsechna cteni sekce (i povysene runy — rameno je dal nese) */
          var fr=FR[k]||{ side:0, mag:0 };
          var eAng=-Math.PI/2 + fr.side*fr.mag, side0=fr.side, mag0=fr.mag;   /* kostra = FR (poradi zrodu), ne emergence(k) */
          var ang0=eAng + lifeLean*0.6;                                             /* kostra + zivotni runa = tvar vetve */
          var LP=limbPath(memb, lifeLean*0.6, mag0, side0, vlog, be.bornIdx||0);
          var angLP=softSide((LP.ang!=null) ? LP.ang : ang0, -Math.PI/2);           /* jen dolni strop (~100°) */
          var ang=(k>0 && _ANG[k]!=null) ? _ANG[k] : angLP;   /* VEJIR: uhel ze spolecneho vypoctu vsech ramen (vysky v drawu) */
          var tiltR=ang-ang0;                                                       /* tuhe otoceni hotoveho ramene */
          var LB={ b:LP.b, n:LP.n, c:LP.c };
          var iAx=(be.birthInt!=null && INT_AXIS[be.birthInt]!=null) ? INT_AXIS[be.birthInt] : 0;
          var nAx=(be.norn!=null) ? be.norn : iAx;   /* zakladaci Norny: osa pozice, jinak zamer zakladajiciho cteni */
          var frac=(FRAC[k]!=null) ? FRAC0[k] : clamp(e.frac + nAx*crownT.intZone, 0.30, 0.98);   /* KROK 2: intention -> vyska (jemny posun) */
          /* PRAVIDLO 5 (2026-09-28, KUKY: "kazdy pramen ma zacinat v jine vysce"). Utok na model
             nasel prameny 2 % od sebe: urd (pozice ho posune dolu na 0,73) padl vedle pramene k=4
             (0,71). Novy pramen se vyhne vyskam STARSICH o aspon `exitStep` — zkousi dolu, nahoru,
             pak o dva kroky… Starsi pramen se nikdy nehne (prameny se zpracuji v poradi vzniku). */
          var gapH=Math.max(0.02, crownT.exitStep), frac0=frac;
          if(FRAC[k]!=null) frac=FRAC[k];   /* spocitano predem (vcetne pravidla 5) — tataz hodnota dostal engine kmene */
          var clashAt=function(f){ for(var uq=0; uq<_usedFrac.length; uq++){ if(Math.abs(f-_usedFrac[uq])<gapH-1e-9) return true; } return false; };
          if(FRAC[k]==null && clashAt(frac)){ for(var st=1; st<=12; st++){ var dn=clamp(frac0-st*gapH,0.30,0.98), up=clamp(frac0+st*gapH,0.30,0.98);
              if(!clashAt(dn)){ frac=dn; break; } if(!clashAt(up)){ frac=up; break; } } }
          _usedFrac.push(frac);
          var born=(_bornSlot[k]!=null) ? _bornSlot[k] : ((k<3)?0:(k-2)*every), strandAge=realAge-born;   /* = narozeni pramene v enginu kmene */
          var domV=clamp(((be.ownN!=null)?be.ownN:be.count)/(branchEls.mx||rt.mx), 0.25, 1);   /* ZONY: nejsilnejsi rameno = 1 (drive element) */
          var sizeF=(0.35+0.65*ageLen(strandAge))*(0.6+0.5*domV);   /* born-visible: mlada vetev vyrasi na ~35% a doroste */
          var vigor=sizeF;
          /* F5: PRAXE = kolikrat je tato runa tazena. Log rust - bez stropu, ale zpomalujici
             (1x=0.55 · 3x=0.78 · 7x=1.00 · 15x=1.22 · 31x=1.45), takze ani 200x nevyjede z platna.
             emg = kratky nabeh (do ~90 dni), aby nova vetev nevyskocila rovnou v plne delce. */
          var runeN=(be.runeCnt&&be.runeCnt[brune.k])||1;
          /* ZONY (2026-10-03): delka ramene = kolik cteni na nem roste (bez povysenych run — ty maji svou vetev); KUKY:
             "vetvicky na stranach, ktere mohutni a pridavaji dalsi vetvicky, meni se na vetve". Drive praxe jeho runy (F5). */
          var secOwnN=(be.ownN!=null) ? Math.max(1, be.ownN) : runeN;
          var pf=0.62+0.27*Math.log(1+(secOwnN-1)/2)/Math.log(3);   /* 1x=0.62 · 10x=1.04 · 26x=1.26 · 60x=1.46 · 200x=1.76 (vejde se na platno) */
          var emg=clamp(strandAge/90, 0.35, 1);
          /* PHYSICAL variation (skalovane sliderem variace) + dominance hustota */
          _curAge01=clamp(strandAge/Math.max(1,trunkT.matureDays), 0, 1);
          var mr=mulberry32((dobSeed ^ (k*0x9e37) ^ 0x5bd1)>>>0); var vA=crownT.variace;
          var mcfg={}; for(var kk in crownT) mcfg[kk]=crownT[kk]; mcfg._k=k;   /* index pramene -> stabilni klice twigu */
          /* STRANA OHYBU z odchylky od SVISLICE (casove stala), ne od tecny kmene: ta se s rustem kmene
             posouva a u odchylky kolem 0,05 rad engine tvar zrcadlil (Eihwaz #58, LR4 2026-09-29). */
          var dRef=eAng + lifeLean*0.6 + Math.PI/2; mcfg._side=(Math.abs(dRef)<0.05) ? 0 : (dRef>0 ? 1 : -1);
          mcfg.curve=crownT.curve*(1+vA*((0.45+1.1*mr())-1));
          mcfg.wobble=crownT.wobble*(1+vA*((0.6+0.9*mr())-1));
          mcfg.childN=Math.min(6, Math.max(0, Math.round((crownT.childN/2)*(0.8+2.6*Math.min(1,vigor))*(1+vA*((0.5+1.0*mr())-1))*(0.7+0.5*domV))));
          mcfg.levelRatio=crownT.levelRatio*(1+vA*((0.9+0.16*mr())-1));
          /* AETT: charakter rustu dle dominantniho aett vetve (freya fluid/vzhuru · heimdall tezky/ukotveny · tyr smerovany/primy). Meni jen tvar, ne napojeni. */
          var ac=AETT_CHAR[be.aett]; if(ac){ var as=crownT.aettStr;
            mcfg.curve*=(1+(ac.curve-1)*as); mcfg.tipLift=crownT.tipLift*(1+(ac.tipLift-1)*as); mcfg.wobble*=(1+(ac.wobble-1)*as); }
          var lenF=pf*emg*(1+vA*0.045*(2*mr()-1));   /* F5: praxe x nabeh; nahoda jen +-3 % (drive +-28 % a prebijela data) */
          var EP=exitPoint(L.pts, frac, rE), ei=EP.i;   /* presna vyska mezi body pramene (drive nejblizsi z 40 bodu = skok 1/39 kmene) */
          /* --- KOREN (composer, per-runa, dolu): SPINE se VPLETE do tahu kmene (jako vetev, jen dolu),
             twigy zvlast. Trunk-engine vlastni koren (0..rE) se NEkresli = vypnuty (KROK 3). --- */
          var _R=NS ? { rspine:[], rdepth:L.depth, rdevUsed:null } : buildRootFor(L, rE, brune.k, brune.name, be, k, pf, emg, 1);   /* bez pramene = bez korene */
          var rspine=_R.rspine, rdepth=_R.rdepth, rdevUsed=_R.rdevUsed;
          /* JEDEN souvisly tah: koren-spine(spicka->baze) + kmen(nad bazi->vystup) + vetev = bezesve napojeni jako u vetve */
          var trunkPart=NS ? [EP.p] : rspine.slice().reverse().concat(L.pts.slice(rE+1, ei+1), [EP.p]);
          var ex=EP.p;
          var tang=EP.tang;
          /* F1: odbocky = OSTATNI TAZENE runy elementu. slots = pocet run elementu-1 (KONSTANTA,
             nezavisi na tom kolik jich uz padlo) -> pozice odbocky je dana jeji runou a nehne se.
             g = rust z poctu tazeni te runy (1x = kratka, 5x+ = plna). */
          /* ZONY (2026-10-03, KUKY: "usadi se na vetvi sve runy — to je presne to, co nechci; ma se usadit na stejnem elementu,
             tim mame vetsi moznosti"). Kazde cteni = vetvicka tvaru sve runy PRIMO na rameni sveho elementu ve sve zone; plne
             rameno (`twigMax`) -> o patro niz do vetvicky s nejmensim podstromem (fraktal). Drive: prvni tazeni runy = odbocka
             na miste runy, kazde dalsi tazeni = vetev NA vetvi te runy (krok 1). */
          var twRunes=[], twSlots=Math.max(1,(bpool.length-1)), _sT=(branchEls.secTree||[])[k];
          if(_sT) twRunes=repKids(_sT, vlog.length, bandLoHi(be.el, be.band||0), _KU[k]);   /* mista z rozdelovace (zadne dve na jednom miste) */
          else { for(var tc=1;tc<=Math.max(0,Math.round(mcfg.childN))+1;tc++){ var dk=bpool[(k+tc)%bpool.length].k;   /* demo bez logu */
                   twRunes.push({ k:dk, slot:tc-1, slots:twSlots, g:1, u:runeU(bpool, dk, crownT.twU0, crownT.twU1) }); } }
          /* F10: zrcadlit prvnich `mirrorN` korunnich odbocek do korene (tytez runy, dolu) */
          for(var mi=0; !NS && mi<twRunes.length && mi<Math.round(rootsT.mirrorN); mi++){
            var mt=twRunes[mi];
            mirrorTwig(roots, _pick, rspine, (mt.u!=null?mt.u:0.5), mt.k, rootsT,
                       (dobSeed^(k*0x9b1)^(mi*0x2f5))>>>0,
                       rootsT.length*rootsT.mirrorLen*pf*emg, rdepth-0.05, k, mi, be);
          }
          /* NAPOJENI PODLE MISTA (2026-10-05, KUKY "oprav i ty dve ramena na stejne strane"): rameno vyrusta podel kmene a od nej
             se odklani pres `limbBendU` sve delky. Strme rameno pod jinym ramenem na teze strane tak vyjelo po kmeni az k jeho
             vystupu a ramena se tam prekryla (modelove stromy: vetsina z 47 soubehu ramen na stejne strane; vypadalo to jako dve
             vetve z jednoho mista). Odklon se zrychli jen tolik, aby rameno bylo od kmene aspon o sirku (wSep) dal, nez doroste
             k vystupu souseda nad sebou (gUp): bocni posun po vystoupani s ~ odklon × s^3 / (bendU×L)^2. Odklon nejvys o 30 %
             rychlejsi nez `limbBendU` — plne rychly srazil soubehy 47 -> 17, ale ramena odchazela od kmene v ostrem uhlu jako klacky. */
          var sdK=((ang+Math.PI/2)>=0) ? 1 : -1, Hn=trunkT.groundY-trunkT.topY, gUp=1e9;
          for(var jn=0; jn<mainsN; jn++){ if(jn===k || FRAC[jn]==null || FRAC[jn]<=frac || (jn>0 && _ANG[jn]==null)) continue;
            if(jn===0 || (((_ANG[jn]+Math.PI/2)>=0) ? 1 : -1)===sdK) gUp=Math.min(gUp, (FRAC[jn]-frac)*Hn); }
          if(k>0 && gUp<1e9){ var dlt=Math.max(0.03, Math.abs(ang-tang)), Lpx=mcfg.length*2.4*lenF, wSep=1.5*ex.w+4;
            var bU0=(mcfg.limbBendU!=null) ? mcfg.limbBendU : 0.45;
            mcfg.limbBendU=Math.max(0.7*bU0, Math.min(bU0, 0.8*Math.sqrt(dlt*gUp*gUp*gUp/wSep)/Math.max(1, Lpx))); }   /* nejvys o 30 % rychleji: plny rychly odklon delal z ramen tuhe klacky (koste) */
          var _cStart=crown.length;   /* vse, co growBranch prida, patri TETO vetvi -> otagovat k */
          var mainLimb=growBranch(crown, mcfg, ex.x, ex.y, tang, ang-tang, 'main', brune.k,   /* V4b: roste rovnou do sveho smeru (drive kostra + tuhe otoceni -> smycky) */
                     (dobSeed ^ (k*0x9e37))>>>0, lenF, ex.w, ex.depth, 0, sizeF, twRunes);
          /* V4b: tuhe otoceni (rotateFrom) zruseno — viz hlavicka patche; strana ohybu je pevna (mcfg._side). */
          /* verze B: patef vetve se za chvili prepise (dole se k ni prilepi kmen), takze
             kopie TED. Graduant se po ni povede zevnitr az k mistu, kde se odlepi. */
          if(mainLimb) mainInfo[k]={ spine:mainLimb.pts.slice(), ei:ei, be:be, pf:pf, emg:emg, el:be.el,
                                    limb:mainLimb, tp:trunkPart.length, frac:frac, mcfg:mcfg, name:brune.name };   /* KROK 2 */
          for(var ct=_cStart; ct<crown.length; ct++){ crown[ct].k=k; crown[ct].age01=_curAge01; }
          if(mainLimb){ mainLimb.pts = trunkPart.concat(mainLimb.pts); mainLimb.src='vetev'; mainLimb.k=k;
            mainLimb.age01 = clamp(strandAge/Math.max(1,trunkT.matureDays), 0, 1);   /* pro `kuraVek` */
            _pick.push({ k:k, pts:mainLimb.pts, meta:{ el:be.el, aett:be.aett, world:be.world, name:brune.name, g:brune.g, count:be.count,
              idx:k, ord:be.ord, runeN:(be.runeCnt&&be.runeCnt[brune.k])||null,
              frac:frac, eFrac:e.frac, intPart:nAx*crownT.intZone, gapPart:frac-frac0, norn:be.nornName||null,
              ang:ang, eAng:eAng, leanPart:lifeLean*0.6, areaPart:tiltR, bal:LB, lrS:LP.s, lrS0:side0, lrSw:LP.sw, zst:(k>0 ? ZST[k] : null),
              zone:(be.band!=null ? bandWord(be.el, be.band) : null), zoneS:(be.band!=null ? (be.el==='shadow' ? 'hrana' : ['urd','verd','skuld'][be.band+1]) : null),
              exitX:ex.x, exitY:ex.y, tp:trunkPart.length, fanPart:ang-angLP,   /* tp = kolik bodu v pts je koren+kmen (detektor prekryvu bere jen vetev) */
              secN:be.count, ownN:be.ownN, bendMag:LP.mag, bendZ:LP.z, bendN0:mag0,
              runeTot:_runeTot[brune.k]||null, bornRd:be.bornIdx, nGrad:gradStrands.filter(function(G){ return G.p===k; }).length,
              born:born, strandAge:strandAge, domV:domV, sizeF:sizeF, lenF:lenF, rootDev:rdevUsed,
              tw:twRunes.map(function(t){ return { name:(RBK[t.k]?RBK[t.k].name:t.k), n:t.n||0, g:t.g, grad:!!t.grad, rep:t.rep||0, pick:('t'+k+'_'+t.k+(t.id!=null?('_'+t.id):(t.rep?('_'+t.rep):''))),
                born:(t.born!=null?t.born:null),
                kids:(t.kids||[]).map(function(x){ return { name:(RBK[x.k]?RBK[x.k].name:x.k), pick:('t'+k+'_'+x.k+(x.id!=null?('_'+x.id):'')) }; }) }; }) } }); }
        } else {
          /* REINFORCE: extra strand stays as trunk MASS (no new branch). Taper its
             top to ~0 so it MELTS into the bundle (no floating blunt stub). */
          var mh=0.40+0.26*(((k*2654435761)>>>0)%100)/100;
          var mi=exitIndex(L.pts, mh);
          /* seminko: vcetne korene z enginu kmene (prameny jeste nemaji runu, ktera by koren nesla) */
          var mp=L.pts.slice(seed ? 0 : rE, mi+1), mn=mp.length, fade=Math.max(2,Math.round(mn*0.32));
          for(var mq=0;mq<fade;mq++){ var mid=mn-1-mq, ff=mq/fade; mp[mid]={x:mp[mid].x,y:mp[mid].y,ct:mp[mid].ct,depth:mp[mid].depth,w:mp[mid].w*ff*ff}; }
          all.push({ pts:mp, depth:L.depth, el:el, src:'reinforce', k:k });
        }
      }
      /* KROK 3: nedodelany pramen (nedosahne koruny) se NEkresli — zadne plovouci ulomky nad zemi */
    });

    /* POVYSENA VETEV = SOUCAST PRAMENE MATKY (2026-10-03, KUKY: "11 povysenych maji mit stejny pramen s temi 14 · maji byt jedno
       do te doby, nez se oddeli · na strome nema byt nic, co uzivatel sam nevytvoril"). Graduant nema vlastni pramen ani koren:
       matka je od korene az k mistu odstepeni TLUSTSI ("je jen vetsi, protoze obsahuje 2 stejne elementy" — prurez = soucet,
       sirka × odmocnina z 1 + podil, ktery roste s graduantem, takze povyseni neudela skok) a graduant z ni vyrusta v miste
       odstepeni (F2: 1/5–3/5 matky) jako hlavni vetev s vlastnimi vetvickami.
       Drive (krok 2, verze B 2026-09-29) vedl vlastni pramen kmenem vedle matky a ven jejim vystupem: byla to samostatna trubka,
       na kterou neslo kliknout, a s 11 povysenymi mel kmen 25 trubek a rozpadl se (KUKYho strom 2026-10-03). */
    var growGrad=function(GS, j, par, sidx, gAge){ var k=100+j;   /* klic 100 + poradi povyseni: stale, mainsN+j se posouvalo */
      var gBorn=SEED_AGE + GS.at*crownT.readingEvery;
      var gN=((branchEls.gradTree||[])[GS.gi]||{}).n||1;   /* MISTO (2026-10-05): cteni na jejim miste (drive kolikrat jeji runa padla na matce) */
      var gPf=0.62+0.27*Math.log(1+(gN-1)/2)/Math.log(3), gEmg=clamp(gAge/90, 0.35, 1);
      var sp=par.spine[sidx], sq=par.spine[Math.max(0,sidx-1)], sAng=Math.atan2(sp.y-sq.y, sp.x-sq.x);
      /* KOSTRA (2026-09-30): strana a rozevreni z FR jako u ramene — graduant smi na druhou stranu nez rodic (KUKY: "i povysene
         rameno muze jit treba z leva do prava"); o preklopeni rozhoduji jeho cteni (limbPath) jako u ramene. */
      var gfr=FR[k]||{ side:0, mag:0 }, pSide=(FR[GS.p]||{ side:0 }).side;
      var gSide=pSide ? ((gfr.side===pSide) ? pSide : -pSide) : (gfr.side||1);
      var gFrame=-Math.PI/2 + gfr.side*gfr.mag, _gDS=branchEls.drawSec||[];
      var _gDO=branchEls.drawOwn||[], gMemb=function(i, jj, rk){ return ((_gDO[i]||[])[jj])===100+GS.gi; };   /* MISTO (2026-10-05): cteni, ktera na ni patri (jakakoli runa elementu) */
      var gLP=limbPath(gMemb, lifeLean*0.6, gfr.mag, gfr.side, vlog, (GS.at!=null)?GS.at:0);
      var gAng=softSide((gLP.ang!=null) ? gLP.ang : gFrame+lifeLean*0.6, -Math.PI/2);
      /* ODKLON OD MATKY (2026-10-03): povysena vetev na stejne strane jako matka bezela podel ni (Algiz+Wunjo, detektor prekryvu
         31–47 px). Ted je aspon GDIV strmejsi nez matka (roste z ni nahoru); kdyz uz to nejde, aspon GDIV vodorovneji. */
      /* smer odklonu = do VETSI mezery mezi rameny nad a pod matkou na teze strane (polovina mezery, nejvys GDIV). Drive vzdy
         strmeji -> Wunjo z Ansuzu u kmene sla rovnou do Hagalazu nad ni (detektor prekryvu, KUKYho strom 2026-10-03). */
      /* ODBOCKA OD MATKY (2026-10-03, KUKY: "protinat a prekryvat je snad rozdil"): povysena vetev odboci od SMERU MATKY v miste,
         kde z ni vyrusta (sAng), o GREL — jako skutecna bocni vetev; u strme matky ven (od svislice), u vodorovne nahoru; zustava
         na strane matky. Drive absolutni uhel (kostra FR / vejir): matka je v miste odstepeni stocena jinak nez u kmene, takze
         povysena bezela soubezne s ni (detektor tree_overlap.js: 61 ze 121 prekryvu na 24 modelovych stromech = povysena+matka). */
      var GREL=0.6, sAngN=sAng; while(sAngN+Math.PI/2>Math.PI) sAngN-=2*Math.PI; while(sAngN+Math.PI/2<=-Math.PI) sAngN+=2*Math.PI;
      var mDev=sAngN+Math.PI/2, mSd=(Math.abs(mDev)<0.05) ? (gfr.side||1) : (mDev>0 ? 1 : -1);
      /* smer odbocky se urci JEDNOU pro matku (z jejiho uhlu u kmene): strma -> prvni povysena ven, vodorovna -> nahoru; druha
         povysena z teze matky presne opacne. Drive se pravidlo pocitalo pro kazdou zvlast z mistniho smeru matky a obe vysly
         nahoru (Berkana: Perth + Laguz soubezne 172 px). */
      var mBase=(_ANG[GS.p]!=null) ? _ANG[GS.p]+Math.PI/2 : mDev, mSdB=(Math.abs(mBase)<0.05) ? (gfr.side||1) : (mBase>0 ? 1 : -1);
      /* sousedni matky na teze strane strídaji smer odbocky (podle poradi vysky na strane): povysene z dvou sousednich ramen
         odbocovaly stejne a bezely vedle sebe (Kenaz z Dagazu + Mannaz z Ansuzu, 48 px). */
      var sideRank=0; for(var qr=1; qr<_ANG.length; qr++){ if(qr===GS.p || _ANG[qr]==null || FRAC[qr]==null) continue;
        var sdr=((_ANG[qr]+Math.PI/2)>=0)?1:-1; if(sdr===mSdB && FRAC[qr]>FRAC[GS.p]) sideRank++; }
      var gTurn=(_GTURN[j]!=null) ? _GTURN[j] : ((Math.abs(mBase)<0.75) ? mSdB : -mSdB)*((GS.slot===1) ? -1 : 1)*((sideRank%2===1) ? -1 : 1);   /* urceno pri povyseni (casova smycka) */
      gAng=sAngN + gTurn*GREL;   /* strma matka -> ven, vodorovna -> nahoru */
      /* MISTO NA DRUHE STRANE (2026-10-05): povysena patri na stranu sveho mista (GS.side z dat). Kdyby ji odbocka od matky poslala
         jinam, roste rovnou ke sve strane (kostra FR ma jeji stranu z dat + tiha jejich cteni). */
      /* i kdyz je matka VUDCI (svisla, pSide 0) — 2026-10-07, KUKYho strom: Fehu (ohen nahore) a Dagaz (ohen uprostred) rostly z vudci
         a stridani odbocky (slot/sideRank) je poslalo DOLEVA, ackoli jejich misto je vpravo: 19 cteni o svete nakreslenych vlevo
         (podil na "leva strana pretizena"). Drive podminka `pSide &&` vudci vynechala. Smoke ㉳ to nechytil: na jeho logach
         nastalo jen u stromu "svet" (Hagalaz po 20 ctenich) — ten log tam ted je. */
      var GSd=GS.side||GS.adopt||0;   /* strana mista: z dat, nebo prevzeta (adopt) */
      if(GSd && pSide!==GSd) gAng=softSide((gLP.ang!=null) ? gLP.ang : gFrame+lifeLean*0.6, -Math.PI/2);   /* matka na druhe strane nebo svisla: vzdy ke sve strane (stale) */
      gAng=softSide(gAng, -Math.PI/2);   /* dolni strop jako u ramene (~100°): s matkou s tihou dolu visela az na −155° (Ehwaz z Raidha) */
      /* STRANA MISTA I PRI ODBOCCE OD MATKY NA SVE STRANE (2026-10-07): u strme matky poslala odbocka "nahoru" (gTurn) vetev za
         svislici na druhou stranu nez jeji misto (modelovy strom "svet" po 20 ctenich: Hagalaz −93° z matky −58°; smoke ㉳).
         Spojite: ne opacna odbocka (pri malem pootoceni matky by skocila o ~60°), ale zastaveni tesne na sve strane svislice. */
      if(GSd && (((gAng+Math.PI/2)>=0) ? 1 : -1)!==GSd) gAng=-Math.PI/2+GSd*0.02;
      gSide=((gAng+Math.PI/2)>=0) ? 1 : -1;
      /* Vyrusta ve smeru rodice a oblouckem se stoci do smeru sveho cile (V4b: nejvys ~110°, prebytek = natoceni zacatku). */
      var gDev=gAng-sAng; while(gDev>Math.PI) gDev-=2*Math.PI; while(gDev<-Math.PI) gDev+=2*Math.PI;
      while(sAng+Math.PI/2>Math.PI) sAng-=2*Math.PI; while(sAng+Math.PI/2<=-Math.PI) sAng+=2*Math.PI;   /* V4c: zapis kolem rodice (miri vzhuru), ne ±180° z atan2 */
      var gBase=sAng, GMAX=1.9;
      if(Math.abs(gDev)>GMAX){ var gEx=(Math.abs(gDev)-GMAX)*(gDev>0?1:-1); gBase=sAng+gEx; gDev-=gEx; }
      var gLB={ b:gLP.b, n:gLP.n, c:gLP.c };
      var gcfg={}; for(var gk in par.mcfg) gcfg[gk]=par.mcfg[gk]; gcfg._k=k; gcfg._side=gSide;   /* strana ohybu = strana odbocky (casove stala) */
      /* RYCHLA ODBOCKA (2026-10-03): povysena se ke svemu uhlu stoci pres 15 % sve delky, ne pres 45 % jako rameno z kmene —
         jinak prvni kus bezel ve smeru matky souběžne s ni (modelove stromy: soubehu povysena + matka 146 -> 18; obracene,
         stoceni pres 70 % delky: 162). Ramena z kmene si drzi ranni napojeni (posuvnik limbBendU; KUKY obrazek 4). */
      gcfg.limbBendU=Math.min(0.15, (crownT.limbBendU!=null) ? crownT.limbBendU : 0.45);
      var gLen=gPf*gEmg*(crownT.gradLen||1);
      var gRt=(branchEls.gradTree||[])[GS.gi], gKids=gRt ? repKids(gRt, vlog.length, bandLoHi(par.el, par.be.band||0)) : [];   /* cteni od povyseni */
      var _gStart=crown.length;
      var gLimb=growBranch(crown, gcfg, sp.x, sp.y, gBase, gDev, 'main', GS.rune, (dobSeed ^ (k*0x9e37))>>>0,
                           gLen, sp.w*0.85, sp.depth+0.01, 0, gPf*gEmg, gKids);
      for(var gc=_gStart; gc<crown.length; gc++){ crown[gc].k=k; crown[gc].age01=clamp(gAge/Math.max(1,trunkT.matureDays),0,1); }
      if(gLimb){ gLimb.src='vetev'; gLimb.k=k;
        _pick.push({ k:k, pts:gLimb.pts, meta:{ el:par.el, aett:par.be.aett, world:(RBK[GS.rune]?RBK[GS.rune].world:par.be.world),
          name:GS.name, g:(RBK[GS.rune]?RBK[GS.rune].g:null), count:par.be.count, idx:mainsN+j, runeN:gN,
          frac:par.frac, eFrac:par.frac, intPart:0, gapPart:0, norn:null, splitU:GS.u, gradOf:par.name,
          ang:gAng, eAng:gFrame, leanPart:lifeLean*0.6, areaPart:gAng-gFrame-lifeLean*0.6, bal:gLB, lrS:gLP.s, lrS0:gfr.side, lrSw:gLP.sw,
          zone:(par.be.band!=null ? bandWord(par.el, par.be.band) : null), zoneS:'povys.', gradAt:GS.at, bendMag:gLP.mag, bendZ:gLP.z, bendN0:gfr.mag, ownN:gN,
          splitX:sp.x, splitY:sp.y, gradOfK:GS.p, runeTot:_runeTot[GS.rune]||null,
          born:gBorn, strandAge:gAge, domV:1, sizeF:gPf*gEmg, lenF:gLen, rootDev:null,
          tw:gKids.map(function(t){ return { name:(RBK[t.k]?RBK[t.k].name:t.k), n:t.n||0, g:t.g, grad:false, rep:1, born:(t.born!=null?t.born:null),
            pick:('t'+k+'_'+t.k+(t.id!=null?('_'+t.id):'')), kids:[] }; }) } }); }
    };
    if(crownT.gradStrand && !seed && gradStrands.length){
      var gwS=clamp((crownT.gradStrandW!=null)?crownT.gradStrandW:0.65, 0.15, 1), byM={};
      gradStrands.forEach(function(GS, j){ if(mainInfo[GS.p]) (byM[GS.p]=byM[GS.p]||[]).push({ GS:GS, j:j }); });
      Object.keys(byM).forEach(function(pk){ var par=mainInfo[pk], lp=par.limb.pts, tp0=par.tp, nL=lp.length-tp0, lst=byM[pk];
        lst.forEach(function(it){ it.sidx=Math.max(1, Math.min(nL-2, Math.round(it.GS.u*(nL-1))));
          it.gAge=Math.max(1, realAge-(SEED_AGE + it.GS.at*crownT.readingEvery)); it.r=clamp(it.gAge/90, 0, 1); });
        var R0=0; lst.forEach(function(it){ R0+=it.r; });
        var f0=Math.sqrt(1+gwS*R0);
        for(var ti=0; ti<tp0; ti++){ var q0=lp[ti]; lp[ti]={ x:q0.x, y:q0.y, t:q0.t, ct:q0.ct, depth:q0.depth, w:q0.w*f0 }; }   /* koren + kmen matky */
        for(var tb=0; tb<nL; tb++){ var Rt=0; lst.forEach(function(it){ Rt+=it.r*clamp((it.sidx-tb)/3, 0, 1); });
          if(Rt>0){ var q1=lp[tp0+tb]; lp[tp0+tb]={ x:q1.x, y:q1.y, t:q1.t, ct:q1.ct, depth:q1.depth, w:q1.w*Math.sqrt(1+gwS*Rt) }; } }   /* rameno do odstepeni */
        lst.forEach(function(it){ growGrad(it.GS, it.j, par, it.sidx, it.gAge); });
      });
    }

    /* #3 KORENY se stavi uz v crown loopu vyse: composer koren (buildBranch, per-runa)
       spliced do souvisleho tahu koren->kmen->vetev + runove korinky pushnute do roots[].
       = STEJNY mechanismus jako vetev, jen dolu. */

    /* PROPORCE (2026-10-05, KUKY: "strom musi zaroven rust do vysky s tim, jak roste do sirky. nevim, jak to je ted, ja to spis
       nevidim"). Zmereno: modelovy strom od 20 do 300 cteni koruna 3× sirsi, kmen jen o 60 % vyssi -> vyska/sirka 1,5 -> 0,9.
       Sirka roste s delkou ramen (cteni na nich), vyska kmene s vekem a brzy se zpomali. Ted: kmen je aspon hwRatio × ROZPETI
       RAMEN (ramena + povysene, bez vetvicek) — kdyz ne, doroste a strom se postavi znovu (rozpeti na vysce kmene skoro
       nezavisi). Rozpeti ramen, ne sirka cele koruny: vetvicky, ktere vycuhuji, meni sirku skokem a kmen pak mezi ctenimi
       skakal az o 20 px a obcas se zkratil (prvni verze téhož dne). Nejvys jeden prepocet; stromek s vyssim kmenem se nemeni. */
    if(_hwTop==null && _pick.length){ var cx0=1e9, cx1=-1e9;
      _pick.forEach(function(p){ if(typeof p.k!=='number' || !p.pts) return; var tp0=(p.meta && p.meta.tp) || 0;
        for(var pi=tp0; pi<p.pts.length; pi++){ var q=p.pts[pi]; if(q.y>=trunkT.groundY-2) continue; if(q.x<cx0) cx0=q.x; if(q.x>cx1) cx1=q.x; } });
      var cWw=cx1-cx0, hT0=trunkT.groundY-trunkT.topY, wantT=((crownT.hwRatio!=null) ? crownT.hwRatio : 0.75)*cWw;
      if(cWw>0 && hT0<wantT-1){ _hwTop=trunkT.groundY-Math.min(1000, wantT);
        try { draw(); } finally { _hwTop=null; } return; } }
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
    var _nG=(typeof gradStrands!=='undefined')?gradStrands.length:0;   /* KROK 2: povyseni graduanti jsou taky hlavni vetve */
    document.getElementById('ageread').textContent='vek '+realAge+' dni (~'+months+' mes) · '+nR+' cteni · '+(mainsN+_nG)+' hlavnich vetvi';
    document.getElementById('logread').textContent = useLog ? (vlog.length+' cteni'+(state._viewN!=null?(' / '+state.log.length+' (prehravani)'):' v logu (strom z realnych cteni)')) : (seed ? (((state._viewN!=null) ? state._viewN : state.log.length)
              ? ('seminko · ' + ((state._viewN!=null) ? state._viewN : state.log.length) + ' cteni ceka na zalozeni — strom roste az po Nornach (3 runy), pak v nem budou vsechna')
              : 'seminko · 0 cteni — prvni cteni (Norny) zalozi prameny')
            : 'log prazdny -> TREE AGE slider (demo rezim)');   /* drive "0 cteni" i s plnym logem bez Noren (KUKY 2026-10-03: "zacina na 185 ctenich?") */
    document.getElementById('grow').innerHTML=
      'vek <b>'+realAge+'</b> dni (~'+months+' mes) &middot; cteni <b>'+nR+'</b><br>'+
      'prameny <b>'+(gt.info.strandN||mainsN)+'</b> &rarr; hlavnich vetvi <b>'+(mainsN+_nG)+'</b> (mist element×zona '+mainsN+', povysenych '+_nG+', strop '+Math.round(crownT.maxMains)+') &middot; koreny '+roots.length+'<br>'+
      ((branchEls&&branchEls.near)?('<span style="color:var(--dim)">'+branchEls.near+' cteni na sousedni zone sveho elementu (runa uz mela rameno)</span><br>'):'')+
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
HTML = HTML.replace('BUILD_HUMAN', time.strftime('%d. %m. %H:%M'))   # 2026-09-29: owner poznal starou verzi az z posuvniku

p = os.path.join(DST, 'crown-composer.html')
with io.open(p, 'w', encoding='utf-8', newline='\n') as f:
    f.write(HTML)
print('written', p, len(HTML), 'chars')
