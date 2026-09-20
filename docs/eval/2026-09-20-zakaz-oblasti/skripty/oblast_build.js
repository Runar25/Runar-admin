// CODE-read 2026-09-20 — TEST: zakaz v radku oblasti x most, ktery ma do te oblasti dosednout.
// Owner: „napred testy, pak kdyz tak prepsat. nikdo nerekl, ze je vsechno napsane spravne."
// Most UZ V PRODUKCI JE (ENDING_OPEN/HEAVY nesou „what this may be in the seeker's life").
// Chybi mu jen DOSEDNUTI do oblasti — a presne to 6 z 8 radku `_domainContext` zakazuje.
// Ctyri ramena, tyz prompt, lisi se JEDNOU vecí:
//   B0 = produkce (most mluvi obecne „in the seeker's life"), zakaz beze zmeny  ← referencni chlad
//   K  = most dosedne do oblasti, zakaz BEZE ZMENY  (kdo z tech dvou vyhraje?)
//   V  = most dosedne do oblasti, zakaz s VYJIMKOU pro posledni vetu
//   P  = most dosedne do oblasti, zakaz PRYC (globalni NO COLD READING zustava)
// Tvar konce drzim konstantni (ENDING_OPEN[0] = veta), aby se nemichal los tvaru.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OUT = path.join(__dirname, 'oblast');
fs.mkdirSync(OUT, { recursive: true });

// 6 oblasti, kde zakaz jde PROTI mostu (Healing a Family maji zakaz jineho druhu)
const OBL = [
  { slug: 'laska',    area: 'Love & Relationships',    land: "between the seeker and someone",
    zakaz: "Do not tell them what is true between them and anyone." },
  { slug: 'cesta',    area: 'Purpose & Path',          land: "in where the seeker is going",
    zakaz: "Do not tell them where they are headed." },
  { slug: 'prace',    area: 'Career & Creativity',     land: "in what the seeker is making",
    zakaz: "Do not tell them what they have made or achieved." },
  { slug: 'skryte',   area: 'The Unseen',              land: "in what is present in the seeker's life but not shown",
    zakaz: "Do not tell them what they sense." },
  { slug: 'rust',     area: 'Inner Growth',            land: "in a slow change in the seeker",
    zakaz: "Do not tell them how they have changed." },
  { slug: 'rozcesti', area: 'Crossroads & Decisions',  land: "where the seeker's way divides",
    zakaz: "Do not tell them what they know or which way they will take." },
];

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
  return S;
}
const S = box();
const sys = vm.runInContext('buildSysPrompt(DEF_CHAR_EN, "en")', S);
const OPEN = vm.runInContext('ENDING_OPEN', S);
const KONEC = OPEN[0];                       // veta (tvar pro rejstrik Clarity)
const OBECNE = "in the seeker's life";

let n = 0;
for (const o of OBL) {
  const u = `{name:"Kuky",area:${JSON.stringify(o.area)},seeking:"Clarity"}`;
  const runy = 'RUNES.filter(function(r){return r.n==="Jera";})[0]';
  let base = vm.runInContext(`buildReadingPromptSingle(${u},${runy},"en",[])`, S);

  // 1) tvar konce na pevno (nahradim ten, ktery se zrovna vylosoval)
  const mam = OPEN.filter(e => base.indexOf(e) !== -1);
  if (mam.length !== 1) throw new Error(o.slug + ': konec v promptu neni prave jeden (' + mam.length + ')');
  base = base.replace(mam[0], KONEC);
  if (base.split(OBECNE).length !== 2) throw new Error(o.slug + ': "' + OBECNE + '" neni v promptu prave jednou');
  if (base.split(o.zakaz).length !== 2) throw new Error(o.slug + ': zakaz neni v promptu prave jednou');
  if (!/NO COLD READING/.test(base)) throw new Error(o.slug + ': NO COLD READING chybi');

  const mostDoOblasti = KONEC.replace(OBECNE, o.land);
  const vyjimka = o.zakaz.replace(/\.$/, ' — except in the closing line, and there only as a possibility they may weigh.');

  const ramena = {
    B0: base,
    K:  base.replace(KONEC, mostDoOblasti),
    V:  base.replace(KONEC, mostDoOblasti).replace(o.zakaz, vyjimka),
    P:  base.replace(KONEC, mostDoOblasti).replace(' ' + o.zakaz, '').replace(o.zakaz, ''),
  };
  for (const [id, user] of Object.entries(ramena)) {
    if (id !== 'B0' && user.indexOf(o.land) === -1) throw new Error(id + '/' + o.slug + ': dosednuti chybi');
    if (id === 'P' && user.indexOf(o.zakaz) !== -1) throw new Error('P/' + o.slug + ': zakaz tam porad je');
    if (id === 'V' && user.indexOf(vyjimka) === -1) throw new Error('V/' + o.slug + ': vyjimka chybi');
    fs.writeFileSync(path.join(OUT, id + '-' + o.slug + '.txt'),
      '=== SYSTEM PROMPT ===\n' + sys + '\n\n=== USER MESSAGE ===\n' + user + '\n');
    n++;
  }
  console.log(o.slug.padEnd(9) + '→ ' + o.land);
}
console.log('\nhotovo: ' + n + ' promptu ve ' + OUT);
