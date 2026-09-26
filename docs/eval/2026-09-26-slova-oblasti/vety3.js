// Ctou ownerova cteni z DB — lokalni export (NIKDY do repa): C:/Users/zkuku/runar-eval/oblast/moje.json
const fs=require('fs');const t=fs.readFileSync('C:/Users/zkuku/runar-eval/oblast/moje.json','utf8');
const rows=JSON.parse(t.slice(t.indexOf('{'))).rows.filter(r=>r.short_text&&r.lang==='en');
const vety=s=>s.replace(/([.?!])\s+(?=[A-Z"“])/g,'$1\n').split('\n').map(x=>x.trim()).filter(Boolean);
const W=/\bwork(s|ed|ing)?\b/i;
console.log('--- work mimo Career ---');
rows.filter(r=>r.area!=='Career & Creativity'&&W.test(r.short_text)).forEach(r=>console.log(r.area,'|',vety(r.short_text).filter(x=>W.test(x)).join(' / ')));
console.log('--- Career: všechny věty ---');
rows.filter(r=>r.area==='Career & Creativity').forEach(r=>{console.log('\n'+r.rune_name+' ['+r.prompt_draws.image+']');vety(r.short_text).forEach((x,i)=>console.log(' '+(i+1)+'. '+x));});
