const fs=require('fs');
const R=new Function(fs.readFileSync('runar-runes.js','utf8')+';return RUNES;')();
const S=new Function(fs.readFileSync('runar-svgs.js','utf8')+';return RUNE_SVGS;')();
const T=JSON.parse(fs.readFileSync('texts.json','utf8'));
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const strip=t=>t.replace(/ \([^)]*\)/,''); // remove the (glyph) in the text
const svg=(n,mode)=>{let s=S[n];let p=s.paths;
  if(mode==='print'){p=p.replace(/fill="#1e2535"/g,'fill="#ffffff"').replace(/#D6A85C/g,'#15171c').replace(/opacity="0.9"/g,'opacity="1"');}
  return `<svg class="rs" viewBox="${s.vb}" xmlns="http://www.w3.org/2000/svg">${p}</svg>`};
const foot=`<div class="foot"><span>The Rune Keeper</span><b>Rúnar</b></div>`;
const AETT={freya:"Freya's Aett",heimdall:"Heimdall's Aett",tyr:"Tyr's Aett"};
const metaOf=r=>[r.world,r.elements.join(' · '),AETT[r.aett]].filter(Boolean).join(' · ');
const runeCard=r=>`<div class="card"><div class="stone">${svg(r.svg,MODE)}</div><h2>${r.n}</h2><div class="rule"></div><p class="kw">${cap(r.k)}</p><p class="txt">${strip(T[r.n])}</p><div class="meta">${metaOf(r)}</div>${foot}</div>`;
const cover=()=>`<div class="card cover"><div class="photo"></div>${foot}</div>`;
const intro=()=>`<div class="card note"><h2>Before you read</h2><div class="rule"></div><p class="txt">Rúnar carries the light and points to where you might look. The seeing is yours.</p><p class="txt"><i>“The runes do not predict your fate. They remind you of the path you already walk.”</i></p>${foot}</div>`;
const note=()=>`<div class="card note"><h2>A note</h2><div class="rule"></div><p class="txt">These are modern interpretive summaries. Runes carry many layers of meaning across sources and traditions.</p><p class="txt">Rúnar offers a reading to reflect on, not professional advice.</p>${foot}</div>`;
const cards=[cover(),intro()];
let MODE;
function build(mode,layout,W,H,sheet){
  const K=W/65, HIN=(H/K).toFixed(3);
  MODE=mode;
  const all=[cover(),intro(),...R.map(runeCard),note()].map(c=>`<div class="outer">${c}</div>`);
  const dark=mode==='dark';
  const bg=dark?'#0a0c12':'#ffffff', fg=dark?'#F2F5F7':'#15171c', acc=dark?'#FFBF00':'#15171c', mut=dark?'#8ba5c0':'#4a4f58', bd=dark?'#2E4A70':'#15171c';
  const css=fs.readFileSync('fonts/fonts.css','utf8')+`
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Cormorant Garamond',serif;color:${fg};-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#fff}
.outer{width:${W}mm;height:${H}mm;background:${bg};overflow:hidden;position:relative}
.card{zoom:${K};width:65mm;height:${HIN}mm;background:${bg};position:relative;display:flex;flex-direction:column;align-items:center;text-align:center;padding:5.5mm 6mm 0;overflow:hidden}
.card:before{z-index:2;content:"";position:absolute;inset:2.2mm;border:.25mm solid ${bd};pointer-events:none}
.stone{width:19mm;height:25mm;margin-top:0;display:flex;justify-content:center}
.rs{width:100%;height:100%;${dark?'filter:drop-shadow(0 0 3px rgba(214,168,92,.3))':''}}
h2{font-family:'Cinzel',serif;font-weight:500;font-size:12.5pt;letter-spacing:.14em;color:${acc};margin-top:2mm;text-transform:uppercase}
.rule{width:10mm;height:.2mm;background:${acc};opacity:.55;margin:2mm 0}
.kw{font-style:italic;font-size:7.6pt;line-height:1.2;color:${mut};max-width:50mm;margin-bottom:1.8mm}
.txt{font-size:8.1pt;line-height:1.33;max-width:52mm;margin-bottom:1.6mm}
.meta{position:absolute;bottom:17.5mm;left:0;right:0;font-family:'Cinzel',serif;font-size:4.2pt;letter-spacing:.14em;color:${mut};text-transform:uppercase}
.foot{position:absolute;bottom:5mm;left:0;right:0;display:flex;flex-direction:column;align-items:center;gap:.6mm}
.foot span{font-family:'Cinzel',serif;font-size:4.6pt;letter-spacing:.3em;color:${dark?'#d6a85c':mut};text-transform:uppercase}
.foot b{font-family:'Cinzel',serif;font-weight:500;font-size:9.5pt;letter-spacing:.2em;color:${acc};text-transform:uppercase}
.cover{padding:0}.photo{position:absolute;top:${Math.max(0,(HIN-100)*.55).toFixed(1)}mm;left:0;width:65mm;height:72mm;background:url(cover_photo.jpg) center top/100% auto;${dark?'-webkit-mask-image:linear-gradient(transparent,#000 ${HIN>101?10:0}%,#000 82%,transparent);mask-image:linear-gradient(transparent,#000 ${HIN>101?10:0}%,#000 82%,transparent)':'filter:grayscale(1) contrast(1.05)'}}



.cover .foot{bottom:5mm}
.note h2{margin-top:10mm}
.note .txt{font-size:9pt;margin-top:2.5mm}
`;
  let body,page;
  if(layout==='card'){
    page=`@page{size:${W}mm ${H}mm;margin:0}.outer{page-break-after:always}`;
    body=all.join('');
  }else{
    const [PW,PH,cols,rows]=sheet; page=`@page{size:${PW}mm ${PH}mm;margin:0}`;
    const per=cols*rows, x0=(PW-cols*W)/2, y0=(PH-rows*H)/2; let h='';
    for(let i=0;i<all.length;i+=per){
      const grp=all.slice(i,i+per); let cell='';
      grp.forEach((c,k)=>{cell+=`<div style="position:absolute;left:${x0+(k%cols)*W}mm;top:${y0+Math.floor(k/cols)*H}mm">${c}</div>`});
      let ticks=''; const L=Math.min(3.4,y0-1.6,x0-1.6);
      for(let c=0;c<=cols;c++){const x=x0+c*W;ticks+=`<i style="left:${x}mm;top:${y0-1.6-L}mm;width:0;height:${L}mm"></i><i style="left:${x}mm;top:${y0+rows*H+1.6}mm;width:0;height:${L}mm"></i>`}
      for(let r=0;r<=rows;r++){const y=y0+r*H;ticks+=`<i style="top:${y}mm;left:${x0-1.6-L}mm;height:0;width:${L}mm"></i><i style="top:${y}mm;left:${x0+cols*W+1.6}mm;height:0;width:${L}mm"></i>`}
      h+=`<section class="sh">${cell}${ticks}</section>`;
    }
    page+=`.sh{width:${PW}mm;height:${PH}mm;position:relative;page-break-after:always;overflow:hidden}.sh i{position:absolute;border-left:.2mm solid #666;border-top:.2mm solid #666}`;
    body=h;
  }
  fs.writeFileSync(`out_${W}x${H}_${mode}_${layout}.html`,`<!doctype html><html><head><meta charset="utf-8"><style>${css}${page}</style></head><body>${body}</body></html>`);
}
const SIZES=[[65,100,[297,210,4,2]],[70,120,[210,297,2,2]]];
for(const [W,H,sh] of SIZES)for(const m of ['dark','print'])for(const l of ['card','sheet'])build(m,l,W,H,sh);
