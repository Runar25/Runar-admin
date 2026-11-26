// V4 krok 1 (2026-11-26): počet aspektů (6. sloupec RUNE_IMAGES) na runu — podklad pro sféry. Bez API.
const fs=require('fs');const src=fs.readFileSync(process.argv[2],'utf8');
const i=src.indexOf('var RUNE_IMAGES = [');let d=0,j=i+'var RUNE_IMAGES = '.length;
for(;j<src.length;j++){const c=src[j];if(c==='[')d++;else if(c===']'){d--;if(!d)break;}}
const arr=eval(src.slice(i+'var RUNE_IMAGES = '.length,j+1));
const m={};for(const r of arr){(m[r[0]]=m[r[0]]||{n:0,a:{}});m[r[0]].n++;for(const a of String(r[5]).split('|')){const k=a.trim();m[r[0]].a[k]=(m[r[0]].a[k]||0)+1;}}
console.log('obrazu celkem',arr.length);
for(const [k,v] of Object.entries(m).sort())console.log(k.padEnd(9),String(v.n).padStart(2),Object.entries(v.a).sort((a,b)=>b[1]-a[1]).map(([a,n])=>a+' '+n).join(' · '));
