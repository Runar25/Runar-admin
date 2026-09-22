// CODE-read 2026-09-22 — srovnani modelu (owner: „udelej jedno stejne cteni pro vsechny, merime tokeny,
// kolik nas to stoji, vse co potrebujeme pro cteni runara").
// JEDEN prompt na jazyk, postaveny PRODUKCNIMI buildery (aktualni HEAD), ulozeny na disk — vsechny modely
// pak dostanou IDENTICKE bajty (ne jen stejny seed). To je silnejsi zaruka nez minule (gen_direct seedoval
// kazdy beh zvlast).
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OUT = __dirname;

// Vstupy: Raidho (owner ho zna nejlip, ma jadro+misto), rozcesti + Confirmation → most „dve moznosti"
// dosedajici do oblasti — tedy ciste to, co jsme 2026-09-20 postavili.
const VSTUP = {
  en: { area: 'Crossroads & Decisions', seeking: 'Confirmation' },
  is: { area: 'Vegamót & Ákvarðanir',   seeking: 'Staðfesting' },
};

for (const lang of ['en', 'is']) {
  const S = { console: { log() {}, warn() {}, error() {} } };
  S.window = S; S.globalThis = S; S.lang = lang;
  S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
  const st = {};
  S.localStorage = { getItem: k => (k in st ? st[k] : null), setItem: (k, v) => { st[k] = String(v); }, removeItem: k => { delete st[k]; } };
  vm.createContext(S);
  vm.runInContext('var userGender="kk"; var corrections=[];', S);
  for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
    vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
  // seedovany proud, at je build opakovatelny
  vm.runInContext('var __s=20260922; Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};', S);
  const v = VSTUP[lang];
  const u = `{name:"Kuky",area:${JSON.stringify(v.area)},seeking:${JSON.stringify(v.seeking)}}`;
  const user = vm.runInContext(`buildReadingPromptSingle(${u},RUNES.filter(function(x){return x.n==="Raidho";})[0],${JSON.stringify(lang)},[])`, S);
  const sys = vm.runInContext(`buildSysPrompt(null, ${JSON.stringify(lang)})`, S);
  const draws = vm.runInContext(`_promptDraws(${JSON.stringify(user)}, ${JSON.stringify(lang)})`, S);
  const maxTok = vm.runInContext('RUNAR_MODES.quick_reading.max_tokens', S);
  // radky, ktere ukazu ownerovi (KUKY: vzdy ukazat i instrukce, ktere do cteni vstoupily)
  const vstupy = user.split('\n').filter(l => /^(DRAWN RUNE|DREGIN RÚNA|READING ANGLE|LESTRARHORN|IMAGE —|MYND —|The reading is for|Þessi lestur er fyrir|End on|Endaðu|THE ESSENCE|KJARN)/.test(l));
  fs.writeFileSync(path.join(OUT, 'prompt-' + lang + '.json'),
    JSON.stringify({ lang, sys, user, draws, max_tokens: maxTok, vstupy }, null, 1));
  console.log(lang.toUpperCase() + ': sys ' + sys.length + ' zn · user ' + user.length + ' zn · max_tokens ' + maxTok
    + ' · draws ' + JSON.stringify(draws));
  vstupy.forEach(l => console.log('   ' + l.slice(0, 150)));
}
