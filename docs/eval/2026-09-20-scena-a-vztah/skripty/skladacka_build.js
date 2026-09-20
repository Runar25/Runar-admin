// CODE-read 2026-09-20 — SKLÁDAČKA (owner: „ořezat čtení na to, co je pro něj esenciální, a přidávat inputy po jednom
// a zjišťovat, co to s ním dělá"). Produkce v4.31, produkční model, Raidho (jádro cairns + místo průsmyk), 4 věty.
// Každý krok = prompt předchozího + JEDEN vstup navíc. Poslední krok navíc mění umístění jména (ownerova hypotéza:
// „pokud most mluví k uživateli, může být jméno na konci").
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OUT = path.join(__dirname, 'skladacka');
fs.mkdirSync(OUT, { recursive: true });
const MOST_TWO = 'End on one line that holds out two things this may be in the seeker\u2019s life, each a state that may be so, left for them to weigh.';
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
    var __row=null;for(var i=0;i<RUNE_IMAGES.length;i++)if(RUNE_IMAGES[i][0]==='Raidho'&&RUNE_IMAGES[i][3].indexOf('cairns, each in sight')===0){__row=RUNE_IMAGES[i];break;}
    RUNE_IMAGES.splice(0,RUNE_IMAGES.length,__row);
    IMG_PLACES.P.splice(0,IMG_PLACES.P.length,['í fjallaskarði','a mountain pass']);
    _randomAngle=function(){return READING_ANGLES[3];};
    _lengthBudget=function(){return LENGTH_BUDGETS[1];};
    _endingShape=function(){return ENDING_OPEN[2];};`, S);
  return S;
}
const S = box();
const sys = vm.runInContext('buildSysPrompt(DEF_CHAR_EN, "en")', S);
function plny(jmenoPlacement) {
  vm.runInContext('_namePlacement=function(n){return NAME_PLACEMENTS[' + jmenoPlacement + '].split("{name}").join(n);};', S);
  return vm.runInContext('buildReadingPromptSingle({name:"Kuky",area:"Inner Growth",seeking:"Reflection",intention:"Decision ahead",lifeRune:RUNES.filter(function(r){return r.n==="Gebo";})[0],lifeLensOn:true},RUNES.filter(function(r){return r.n==="Raidho";})[0],"en",[])', S).split('\n');
}
const L = plny(1);                       // jméno uprostřed
const Lkonec = plny(2);                  // jméno u závěru
const i = { person: 0, runa: 1, ucel: 2, uhel: 3, imgA: 4, imgB: 5, img: 6, sezona: 7, esence: 8, nocold: 9, delka: 10, oblast: 11, hledani: 12, noq: 13, konec: 14, cocka: 15, zaver: 16, json: 17 };
const runaBezMeta = L[i.runa].replace(/ · World: .*$/, '');
const zaverBezJmena = L[i.zaver].replace(/ Address Kuky[^.]*\. /, ' ');
if (zaverBezJmena === L[i.zaver]) throw new Error('jméno v závěru nenalezeno');
const KROKY = [
  ['00-holy',      [runaBezMeta, L[i.imgA], L[i.imgB], L[i.img], L[i.esence], L[i.delka], zaverBezJmena, L[i.json]], 'holý prompt: runa+aspekt · obraz · esence · délka · formát'],
  ['01-jmenuj',    null, '+ „Mention Raidho by name once. One clear insight is enough"'],
  ['02-uhel',      null, '+ úhel čtení'],
  ['03-jmeno',     null, '+ PERSON a oslovení uprostřed'],
  ['04-ucel',      null, '+ READING PURPOSE (záměr)'],
  ['05-oblast',    null, '+ oblast (Inner Growth)'],
  ['06-hledani',   null, '+ hledání (Reflection)'],
  ['07-nocold',    null, '+ NO COLD READING'],
  ['08-sezona',    null, '+ řádek o období'],
  ['09-cocka',     null, '+ čočka životní runy (Gebo)'],
  ['10-most',      null, '+ konec = most „dvě možnosti"'],
  ['11-jmeno-konec', null, '= předchozí, ale jméno u závěru místo uprostřed'],
];
let radky = KROKY[0][1].slice();
const pridej = {
  '01-jmenuj': () => radky.splice(radky.indexOf(L[i.delka]) + 1, 0, L[i.noq]),
  '02-uhel': () => radky.splice(radky.indexOf(L[i.imgA]), 0, L[i.uhel]),
  '03-jmeno': () => { radky.unshift(L[i.person]); radky[radky.indexOf(zaverBezJmena)] = L[i.zaver]; },
  '04-ucel': () => radky.splice(radky.indexOf(L[i.uhel]), 0, L[i.ucel]),
  '05-oblast': () => radky.splice(radky.indexOf(L[i.noq]), 0, L[i.oblast]),
  '06-hledani': () => radky.splice(radky.indexOf(L[i.noq]), 0, L[i.hledani]),
  '07-nocold': () => radky.splice(radky.indexOf(L[i.delka]), 0, L[i.nocold]),
  '08-sezona': () => radky.splice(radky.indexOf(L[i.esence]), 0, L[i.sezona]),
  '09-cocka': () => radky.splice(radky.indexOf(L[i.json]), 0, L[i.cocka]),
  '10-most': () => radky.splice(radky.indexOf(L[i.cocka]), 0, MOST_TWO),
  '11-jmeno-konec': () => { radky[radky.indexOf(L[i.zaver])] = Lkonec[i.zaver]; },
};
for (const [id, zaklad, popis] of KROKY) {
  if (!zaklad) pridej[id]();
  fs.writeFileSync(path.join(OUT, id + '.txt'), '=== SYSTEM PROMPT ===\n' + sys + '\n\n=== USER MESSAGE ===\n' + radky.join('\n') + '\n');
  console.log(id.padEnd(16) + popis + '   [' + radky.length + ' řádků]');
}
