// measure_reading_costs.js — změří SKUTEČNÉ délky čtení (current prompts) pro cenový audit.
// Pro každý typ vygeneruje N reálných čtení z produkční proxy a spočítá:
//   - znaky (= ElevenLabs náklad, billed per char)
//   - slova, odhad output tokenů (~chars/4)
// Slouží k přepočtu RUNAR_PRICING.md (base „Single = 430 EL chars" je z doby před zkrácením).
// Usage: node scripts/utils/measure_reading_costs.js
const fs = require('fs'), vm = require('vm');
const _store = {};
const localStorage = { getItem:(k)=>(k in _store?_store[k]:null), setItem:(k,v)=>{_store[k]=String(v);}, removeItem:(k)=>{delete _store[k];} };
const ctx = { lang:'en', console, Math, Date, JSON, localStorage }; vm.createContext(ctx);
for (const f of ['v2/runar-config.js','v2/runar-runes.js','v2/runar-translations.js','v2/runar-utils.js','v2/runar-character.js'])
  vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });

const KEY = 'sb_publishable_iS8zD-m5BC9N3BYJa3XnHQ_UTkIlNy2';
const PROXY = 'https://pmitxjvkeovijreepror.supabase.co/functions/v1/claude-proxy';

// Sestaví prompty pro N vzorků každého typu (různé runy)
const jobs = vm.runInContext(`(function(){
  var u = { name:'Kuky', lifeRune: RUNES[18], area:'work', seeking:'clarity', mood:'', intention:'', question:'' };
  function pick(n, off){ var a=[]; for(var i=0;i<n;i++) a.push(RUNES[(off+i*3)%24]); return a; }
  var out = [];
  // Single (4 vzorky)
  [0,5,11,17].forEach(function(i){ out.push({ type:'Single', sys:buildSysPrompt(DEF_CHAR_EN,'en'), prompt:buildReadingPrompt(u, RUNES[i], 'en', []) }); });
  // Norns (3) ×3
  [0,4,8].forEach(function(o){ out.push({ type:'Norns', sys:buildSysPrompt(DEF_CHAR_EN,'en'), prompt:buildNornsPrompt(u, pick(3,o), 'en', []) }); });
  // Kríž (5) ×3
  [1,6,11].forEach(function(o){ out.push({ type:'Kriz', sys:buildSysPrompt(DEF_CHAR_EN,'en'), prompt:buildKrizPrompt(u, pick(5,o), 'en', []) }); });
  // Horseshoe (7) ×3
  [2,7,12].forEach(function(o){ out.push({ type:'Horseshoe', sys:buildSysPrompt(DEF_CHAR_EN,'en'), prompt:buildHorseshoePrompt(u, pick(7,o), 'en', []) }); });
  // Yggdrasil (9) ×3
  [0,3,6].forEach(function(o){ out.push({ type:'Yggdrasil', sys:buildSysPrompt(DEF_CHAR_EN,'en'), prompt:buildYggdrasilPrompt(u, pick(9,o), 'en', []) }); });
  // Life Rune standard + premium
  out.push({ type:'LifeRune-std', sys:buildSysPrompt(DEF_CHAR_EN,'en'), prompt:buildLifeRunePrompt('Kuky', RUNES[18], 14,6,1985, 'en', false) });
  out.push({ type:'LifeRune-prem', sys:buildSysPrompt(DEF_CHAR_EN,'en'), prompt:buildLifeRunePrompt('Kuky', RUNES[18], 14,6,1985, 'en', true) });
  return out;
})()`, ctx);

async function gen(system, prompt) {
  const r = await fetch(PROXY, { method:'POST',
    headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+KEY, 'apikey':KEY },
    body: JSON.stringify({ system, prompt, max_tokens: 1400 }) });
  const d = await r.json();
  return d.text || ('[ERROR '+r.status+': '+JSON.stringify(d.error||d)+']');
}

(async () => {
  const agg = {};
  for (const j of jobs) {
    const text = await gen(j.sys, j.prompt);
    const chars = text.length;
    const words = (text.trim().match(/\S+/g) || []).length;
    (agg[j.type] = agg[j.type] || []).push({ chars, words });
    console.log(j.type.padEnd(14), 'chars=' + String(chars).padStart(4), 'words=' + String(words).padStart(3));
  }
  console.log('\n═══ PRŮMĚRY (current prompts) ═══');
  console.log('TYP'.padEnd(14), 'avg chars', ' avg words', ' ~out tok(/4)');
  for (const [t, arr] of Object.entries(agg)) {
    const ac = Math.round(arr.reduce((s,x)=>s+x.chars,0)/arr.length);
    const aw = Math.round(arr.reduce((s,x)=>s+x.words,0)/arr.length);
    console.log(t.padEnd(14), String(ac).padStart(8), String(aw).padStart(9), String(Math.round(ac/4)).padStart(11));
  }
  console.log('\n(EL náklad = avg chars. IS Multilingual $0.10/1k · EN Flash $0.05/1k)');
})();
