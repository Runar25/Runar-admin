// §27 utok 1: pulka proti pulce — drzi rozdil A vs B v OBOU runach zvlast?
const fs=require('fs'),path=require('path');
const DIR=path.join('C:/Users/zkuku/AppData/Local/Temp/claude/C--Users-zkuku/19d97179-39e7-4098-bebb-c437e7df8e6e/scratchpad','rejstrik');
const klic=JSON.parse(fs.readFileSync(path.join(DIR,'klic.json'),'utf8'));
const S1=JSON.parse(fs.readFileSync(path.join(DIR,'s1.json'),'utf8'));
const S2=JSON.parse(fs.readFileSync(path.join(DIR,'s2.json'),'utf8'));
const LBL={clarity:'Clarity',confirm:'Confirmation',challenge:'Insight into Challenge',reflect:'Reflection'};
const C={1:'Clarity',2:'Confirmation',3:'Insight into Challenge',4:'Reflection'};
const m1=new Map(S1.map(x=>[x.id,x.seeking])), m2=new Map(S2.map(x=>[x.id,C[x.instruction]]));
const acc={};
for(const k of klic){const key=k.rameno+'/'+k.runa;acc[key]=acc[key]||{n:0,ok:0};
  acc[key].n+=2; if(m1.get(k.id)===LBL[k.rejstrik])acc[key].ok++; if(m2.get(k.id)===LBL[k.rejstrik])acc[key].ok++;}
for(const [k,v] of Object.entries(acc).sort()) console.log(k.padEnd(10)+v.ok+'/'+v.n+'   (sance '+(v.n/4)+'/'+v.n+')');
