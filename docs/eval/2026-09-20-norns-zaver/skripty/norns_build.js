// CODE-read 2026-09-20 — ZÁVĚR NORNS (owner: „začít s Norns závěrem"; nesmí to být kopie mostu ze single).
// Stejné zadání jako Norns čtení, které owner viděl od CODE-tune: Urður=Gebo · Verðandi=Ingwaz · Skuld=Othila,
// obraz dveře + káva pro dva, oblast The Unseen, záměr pochopit minulost, čočka Ehwaz, bez jména.
// Ramena se liší JEDINÝM řádkem — S.landing:
//   K = dnešek (zůstaň ve slovech obrazu, žádné „this means")
//   A = poslední věta patří SKULD a drží DVĚ možnosti pro člověka
//   B = dnešek + jedna možnost na konci (konec se dotkne začátku, pak řekne, co to MŮŽE být)
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OUT = path.join(__dirname, 'norns');
fs.mkdirSync(OUT, { recursive: true });
const A = 'THE LANDING — the last sentence belongs to Skuld: it holds out two things this movement may be in the seeker\u2019s life — from what was woven, through what is clearing, to where it now heads — each a state that may be so, left for them to weigh. Drawn from the image, never a prediction, no moral, no comfort added.';
const B = 'THE LANDING — the last sentence answers one thing: what has become visible through the movement — from what was woven, through what is clearing, to where it now heads. Let the ending touch the beginning, then hold out what that may be in the seeker\u2019s life — a state that may be so, never a prediction, no moral, no comfort added.';
function box() {
  const S = { console: { log() {}, warn() {}, error() {} } };
  S.window = S; S.globalThis = S; S.lang = 'en';
  S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
  const st = {};
  S.localStorage = { getItem: k => (k in st ? st[k] : null), setItem: (k, v) => { st[k] = String(v); }, removeItem: k => { delete st[k]; } };
  vm.createContext(S);
  vm.runInContext('var userGender="kk"; var corrections=[];', S);
  for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
    vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
  vm.runInContext(`
    var __row=null;for(var i=0;i<RUNE_IMAGES.length;i++)if(RUNE_IMAGES[i][0]==='Gebo'&&RUNE_IMAGES[i][3].indexOf('The door stands open')===0){__row=RUNE_IMAGES[i];break;}
    if(!__row) throw new Error('obraz dveri nenalezen');
    RUNE_IMAGES.splice(0,RUNE_IMAGES.length,__row);
    _namePlacement=function(n){return NAME_PLACEMENTS[3].split('{name}').join(n);};`, S);
  return S;
}
const S = box();
const sys = vm.runInContext('buildSysPrompt(DEF_CHAR_EN, "en")', S);
const u = '{name:"Kuky",area:"The Unseen",intention:"Understanding the past",lifeRune:RUNES.filter(function(r){return r.n==="Ehwaz";})[0],lifeLensOn:true}';
const runy = 'RUNES.filter(function(r){return r.n==="Gebo";}).concat(RUNES.filter(function(r){return r.n==="Ingwaz";}),RUNES.filter(function(r){return r.n==="Othila";}))';
const puvodni = vm.runInContext('buildNornsPromptFate(' + u + ',' + runy + ',"en",[])', S);
const K = vm.runInContext('RP_NORNS.en.landing', S);
if (puvodni.split(K).length !== 2) throw new Error('landing v promptu neni prave jednou');
if (!/CLOSING LENS/.test(puvodni)) throw new Error('cocka chybi');
for (const [id, landing] of [['K-dnesek', K], ['A-dve-moznosti', A], ['B-jedna-moznost', B]]) {
  const user = puvodni.replace(K, landing);
  fs.writeFileSync(path.join(OUT, id + '.txt'), '=== SYSTEM PROMPT ===\n' + sys + '\n\n=== USER MESSAGE ===\n' + user + '\n');
  console.log(id.padEnd(16) + landing.slice(0, 110) + '…');
}
console.log('\nvět celkem podle promptu: ' + (puvodni.match(/[0-9]+-[0-9]+ sentences total[^.]*/) || [''])[0]);
