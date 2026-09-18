const fs=require('fs'),path=require('path');
const E='C:/Users/zkuku/Downloads/Runar-admin/docs/eval/2026-09-15-kratke-obrazy-esence/';
const U=JSON.parse(fs.readFileSync(path.join(__dirname,'texty.json'),'utf8'));
const T1=JSON.parse(fs.readFileSync(E+'prompty-t15/texty.json','utf8'));
const T16=JSON.parse(fs.readFileSync(E+'prompty-t16/texty.json','utf8'));
const skup={'dnes T1-L (v4.25, pisatel znal datum)':['T1-L1','T1-L2','T1-L3'].map(k=>T1[k]),
 'T16 (v4.25 bez vzoru Fehu, datum ne)':Object.values(T16),
 'po uklidu (v4.26, datum ne)':['U1','U2','U3'].map(k=>U[k])};
const vety=t=>t.match(/[^.?!]+[.?!]/g).map(s=>s.trim());
const m={
 'slov':t=>t.split(/\s+/).length,
 'vet':t=>vety(t).length,
 'zacina "You stand"':t=>/^You stand/.test(t),
 'esence "Raidho is"':t=>/Raidho is\b/.test(t),
 'road v esenci':t=>/\broad\b/i.test(vety(t).find(s=>/Raidho/.test(s))||''),
 'pass/hand v esenci':t=>/pass|hand/i.test(vety(t).find(s=>/Raidho/.test(s))||''),
 'posledni veta "behind you"':t=>/behind you/i.test(vety(t).slice(-1)[0]),
 '"behind you" kdekoli':t=>/behind you/i.test(t),
 'grey':t=>/\bgr[ae]y\b/i.test(t), 'wind':t=>/\bwind\b/i.test(t), 'heather':t=>/heather/i.test(t),
 'already':t=>/\balready\b/i.test(t), 'sezona (autumn/brown…)':t=>/autumn|brown|september|winter|summer|spring/i.test(t),
};
for(const [k,f] of Object.entries(m)){
  const r=Object.values(skup).map(a=>{const v=a.map(f);return typeof v[0]==='boolean'?v.filter(Boolean).length+'/3':v.join(',')});
  console.log(k.padEnd(30)+r.map(x=>x.padEnd(12)).join(''));
}
console.log('sloupce: '+Object.keys(skup).join(' | '));
for(const k of Object.keys(U).filter(k=>/ASK/.test(k))) console.log(k+': '+U[k].split(/\s+/).length+' slov');
