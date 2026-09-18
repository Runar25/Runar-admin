// Pocty pro Raidho: U1–U3 (v4.26, KROK 1) proti K2/R/C (v4.27). Cte texty.json ze sve slozky.
const fs=require('fs'),path=require('path');
const E='C:/Users/zkuku/Downloads/Runar-admin/docs/eval/2026-09-18-po-uklidu-raidho/texty.json';
const U=JSON.parse(fs.readFileSync(E,'utf8'));
const N=JSON.parse(fs.readFileSync(path.join(__dirname,'texty.json'),'utf8'));
const sk={'U (KROK 1)':['U1','U2','U3'].map(k=>U[k])};
for(const a of ['K2','R','C'])sk[a]=[1,2,3].map(i=>N[a+'-'+i]);
const vety=t=>t.match(/[^.?!]+[.?!]/g).map(s=>s.trim());
for(const[k,a] of Object.entries(sk)){console.log(k);for(const t of a){const v=vety(t),w=v.map(s=>s.split(/\s+/).length),c=v.map(s=>(s.match(/,/g)||[]).length);
 const es=v.find(s=>/Raidho/.test(s))||'';
 console.log('   '+w.join('-').padEnd(14)+'sum '+String(w.reduce((x,y)=>x+y,0)).padEnd(4)+'min '+String(Math.min(...w)).padEnd(3)+'carky '+c.join('-').padEnd(9)+(/^You stand/.test(t)?'YouStand ':'         ')+(/Raidho is\b/.test(es)?'"Raidho is" ':'            ')+(/\broad\b/i.test(es)?'road':''));}}
