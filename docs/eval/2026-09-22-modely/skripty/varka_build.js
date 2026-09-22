// CODE-read 2026-09-22 — VARKA po iteraci (owner: „5 run a 2× norns" pro Opus 5 a gpt-6-sol; „az pak se da
// udelat vetsi varka"). Prompty produkcnimi buildery + JEN overene testovaci upravy (produkce se nemeni):
//   IS single: bezglosy + vecne2 (overeno iteraci na 1 cteni: sol vecny konec o cloveku, Opus gaeti 1/3 = jako produkce)
//   IS norns:  bezglosy-norns (glosa v jinem formatu „Gebo (Félagsskapur) —", 3× — PILOT 1 cteni pred varkou)
//   EN:        produkce beze zmeny (sol EN byl silny, abstrakce byla vada islandstiny)
// Runy NE-tezke: zmena mostu je overena jen na lehkem tvaru; tezke runy maji jine zneni konce.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OUT = path.join(__dirname, 'varka');
fs.mkdirSync(OUT, { recursive: true });

// 5 run × ruzna oblast; rejstrik VZDY Confirmation (= tvar „dve moznosti", ten, ktery jsme ladili)
const SINGLE = [
  { runa: 'Gebo',   en: 'Love & Relationships',  is: 'Ást & Sambönd' },
  { runa: 'Laguz',  en: 'The Unseen',            is: 'Hið dulda' },
  { runa: 'Algiz',  en: 'Family & Home',         is: 'Fjölskylda & Heimili' },
  { runa: 'Jera',   en: 'Career & Creativity',   is: 'Starf & Sköpun' },
  { runa: 'Ansuz',  en: 'Purpose & Path',        is: 'Tilgangur & Leið' },
];
const SEEK = { en: 'Confirmation', is: 'Staðfesting' };
const NORNS = [
  // 1 = tataz sestava, kterou owner videl pri navrhu zaveru A
  { id: 'norns1', runy: ['Gebo', 'Ingwaz', 'Othila'], en: 'The Unseen', is: 'Hið dulda', zamer: 2 },
  { id: 'norns2', runy: ['Fehu', 'Hagalaz', 'Berkana'], en: 'Love & Relationships', is: 'Ást & Sambönd', zamer: 1 },
];

const UPRAVY = {
  bezglosy: [/^(DREGNA RÚNA: [^\s(]+) \([^)]*\)/m, '$1', 1],
  vecne2: [/hvort um sig ástand sem gæti átt við, honum til umhugsunar\./, 'hvort um sig ástand sem gæti átt við, sagt með orðum myndarinnar, honum til umhugsunar.', 1],
  // Norns: kazda runa ma radek „<Runa> (<glosa>) — klicova slova"; prave 3× (jedna na beat)
  'bezglosy-norns': [/^([A-Z][a-z]+) \([^)]*\) — /gm, '$1 — ', 3],
};
function uprav(p, jmena) {
  for (const j of jmena) {
    const [re, za, cekam] = UPRAVY[j];
    const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
    const n = (p.match(g) || []).length;
    if (n !== cekam) throw new Error(j + ': zasah ' + n + '×, cekal jsem ' + cekam);
    p = p.replace(g, za);
  }
  return p;
}

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
  vm.runInContext('var __s=20260922; Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};', S);
  const sys = vm.runInContext(`buildSysPrompt(null, ${JSON.stringify(lang)})`, S);
  const R = n => `RUNES.filter(function(x){return x.n===${JSON.stringify(n)};})[0]`;

  for (const s of SINGLE) {
    const u = `{name:"Kuky",area:${JSON.stringify(s[lang])},seeking:${JSON.stringify(SEEK[lang])}}`;
    let user = vm.runInContext(`buildReadingPromptSingle(${u},${R(s.runa)},${JSON.stringify(lang)},[])`, S);
    const upr = lang === 'is' ? ['bezglosy', 'vecne2'] : [];
    user = uprav(user, upr);
    const id = 'single-' + s.runa.toLowerCase() + '-' + lang;
    fs.writeFileSync(path.join(OUT, id + '.json'), JSON.stringify({ id, lang, spread: 'single', runy: [s.runa], area: s[lang],
      seeking: SEEK[lang], upravy: upr, sys, user, max_tokens: vm.runInContext('RUNAR_MODES.quick_reading.max_tokens', S) }, null, 1));
    console.log(id.padEnd(22) + (upr.join('+') || 'produkce'));
  }
  for (const n of NORNS) {
    const zamer = vm.runInContext(`INTENTIONS.${lang}[${n.zamer}]`, S);
    const u = `{name:"Kuky",area:${JSON.stringify(n[lang])},intention:${JSON.stringify(zamer)}}`;
    let user = vm.runInContext(`buildNornsPrompt(${u},[${n.runy.map(R).join(',')}],${JSON.stringify(lang)},null)`, S);
    const upr = lang === 'is' ? ['bezglosy-norns'] : [];
    user = uprav(user, upr);
    const id = n.id + '-' + lang;
    fs.writeFileSync(path.join(OUT, id + '.json'), JSON.stringify({ id, lang, spread: 'norns', runy: n.runy, area: n[lang],
      intention: zamer, upravy: upr, sys, user, max_tokens: vm.runInContext('SPREAD_CONFIG.norns.tokens', S) }, null, 1));
    console.log(id.padEnd(22) + (upr.join('+') || 'produkce') + '  · ' + n.runy.join('/') + ' · ' + zamer);
  }
}
