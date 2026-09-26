// Ctou ownerova cteni z DB — lokalni export (NIKDY do repa): C:/Users/zkuku/runar-eval/oblast/moje.json
const fs=require('fs');const t=fs.readFileSync('C:/Users/zkuku/runar-eval/oblast/moje.json','utf8');
const rows=JSON.parse(t.slice(t.indexOf('{'))).rows.filter(r=>r.short_text&&r.lang==='en'&&!r.q);
const vety=s=>s.replace(/([.?!])\s+(?=[A-Z"“])/g,'$1\n').split('\n').map(x=>x.trim()).filter(Boolean);
const c={}, inc=(k)=>c[k]=(c[k]||0)+1;
let n4=0; const YOU=/\b(you|your|yours)\b/i;
for (const r of rows) { const v=vety(r.short_text); inc('vet='+v.length); if (v.length!==4) continue; n4++;
  v.forEach((s,i)=>{ if (s.includes(r.rune_name)) inc('runa v '+(i+1)); if (/\bKuky\b/.test(s)) inc('jméno v '+(i+1)); if (YOU.test(s)) inc('you v '+(i+1)); });
  if (r.area) { inc('s oblastí'); }
}
console.log('bez vlastní otázky, EN, n='+rows.length+'; čtyřvětých '+n4); console.log(Object.keys(c).sort().map(k=>k+': '+c[k]).join('\n'));
