const fs=require('fs');const W=/\bwork(s|ed|ing)?\b/i;
const vety=s=>s.replace(/([.?!])\s+(?=[A-Z"“])/g,'$1\n').split('\n').map(x=>x.trim()).filter(Boolean);
let usd=0;
for (const f of ['pilot_stitek','pilot_esence1','pilot_bezoblasti','pilot_cinnost']) {
  const L=fs.readFileSync(__dirname+'/'+f+'.jsonl','utf8').trim().split('\n').map(JSON.parse);
  const arms=[...new Set(L.map(x=>x.arm))];
  for (const a of arms) { const xs=L.filter(x=>x.arm===a); const pos={}; let n=0, runaVeta=0;
    for (const x of xs) { const v=vety(x.text); if (W.test(x.text)) n++; v.forEach((s,i)=>{ if (W.test(s)) { pos[i+1]=(pos[i+1]||0)+1; if (s.includes(x.runa)) runaVeta++; } }); }
    console.log(a, f.padEnd(17), 'work ve čtení', n+'/'+xs.length, '· věty s work podle pozice', JSON.stringify(pos), '· z toho věta se jménem runy', runaVeta, '· po runách', ['Kenaz','Nauthiz','Jera'].map(r=>r[0]+xs.filter(x=>x.runa===r&&W.test(x.text)).length).join(' ')); }
  for (const x of L) { const u=x.usage; usd+=(u.input_tokens*5+(u.cache_creation_input_tokens||0)*6.25+(u.cache_read_input_tokens||0)*0.5+u.output_tokens*25)/1e6; }
}
console.log('cena celkem $'+usd.toFixed(4));
