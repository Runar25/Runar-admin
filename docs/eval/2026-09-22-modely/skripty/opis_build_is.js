// CODE-read 2026-09-24 — ISLANDSKY test vety za obrazem (owner: „ano, pusť IS test… jen pár čtení"). Tytéž obrazy, úhly,
// oblasti a rejstříky jako EN prompty 01, 02 a 14 z várky opis2 (tam nejvíc převyprávěl sol nebo Opus), postavené
// PRODUKČNÍMI buildery v IS (glosa v hlavičce i blok korekcí zůstávají — jako produkce). Dvě ramena lišící se jen větou:
//   prod   „… Láttu hana verða að þinni eigin sýn í textanum."
//   detail „… Láttu hana verða að þinni eigin sýn í textanum, niður í smáatriði sem ekki kemur fram í setningunni."
// IS znění ověřené korpusem po trojicích (EVAL_LOG 2026-09-23 (9)); „í eitt smáatriði" (0×) vyřazeno.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OUT = path.join(__dirname, 'opis_is'); fs.mkdirSync(OUT, { recursive: true });
const PROD = '. Láttu hana verða að þinni eigin sýn í textanum.';
const DET = '. Láttu hana verða að þinni eigin sýn í textanum, niður í smáatriði sem ekki kemur fram í setningunni.';
const PLAN = [[0, 63, 'zrak', 'Family & Home', 'General Guidance', '01-algiz-u0'], [0, 13, 'sluch', 'Purpose & Path', 'Clarity', '02-ansuz-u0'],
  [6, 42, 'hmat', 'Career & Creativity', 'Reflection', '14-nauthiz-u6']];
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S; S.lang = 'is';
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
const st = {}; S.localStorage = { getItem: k => (k in st ? st[k] : null), setItem: (k, v) => { st[k] = String(v); }, removeItem: k => { delete st[k]; } };
vm.createContext(S); vm.runInContext('var userGender="kk"; var corrections=[];', S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js']) vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
vm.runInContext(['var __s=20260924; Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};',
  'var __force=null, __angle=null, __origBag=_seasonBagPick, __origAngle=_randomAngle;',
  '_seasonBagPick=function(b,k,ids,ex){ if(__force!==null && ids.indexOf(__force)>=0) return __force; return __origBag(b,k,ids,ex); };',
  '_randomAngle=function(lang){ return __angle!==null ? (lang==="is"?READING_ANGLES_IS:READING_ANGLES)[__angle] : __origAngle(lang); };'].join('\n'), S);
const KOR = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'korekce-norm.json'), 'utf8'));
const sys = vm.runInContext('buildSysPrompt(null, "is")', S);
const rows = vm.runInContext('RUNE_IMAGES', S), AREAS = vm.runInContext('AREAS', S), SEEKS = vm.runInContext('SEEKS', S);
const anglesIS = vm.runInContext('READING_ANGLES_IS', S), maxTok = vm.runInContext('RUNAR_MODES.quick_reading.max_tokens', S);
const pocet = (t, s) => t.split(s).length - 1;
for (const [uhel, ix, smysl, areaEN, seekEN, id] of PLAN) {
  // Obraz se hleda podle EN TEXTU z varky, ne podle indexu: banka se od varky posunula (CODE-tune v4.49, zachytila pojistka).
  const en = JSON.parse(fs.readFileSync(path.join(__dirname, 'opis2', id + '.json'), 'utf8'));
  const r = rows.find(x => x[3].replace(/\.$/, '') === en.obraz);
  if (!r) throw new Error(id + ': obraz uz v produkcni bance NENI: ' + en.obraz);
  vm.runInContext('__force=' + JSON.stringify(r[0] + '|' + r[2].slice(0, 24)) + '; __angle=' + uhel + ';', S);
  const u = { name: 'Kuky', area: AREAS.is[AREAS.en.indexOf(areaEN)], seeking: SEEKS.is[SEEKS.en.indexOf(seekEN)] };
  const user = vm.runInContext('buildReadingPromptSingle(' + JSON.stringify(u) + ', RUNES.filter(function(x){return x.n===' + JSON.stringify(r[0]) + ';})[0], "is", ' + JSON.stringify(KOR) + ')', S);
  const obrazIS = r[2].replace(/\.$/, '');
  if (pocet(user, obrazIS) !== 1) throw new Error(id + ': IS obraz ' + pocet(user, obrazIS) + '×');
  if (pocet(user, anglesIS[uhel]) !== 1) throw new Error(id + ': IS uhel ' + pocet(user, anglesIS[uhel]) + '×');
  if (pocet(user, PROD) !== 1) throw new Error(id + ': IS produkcni veta ' + pocet(user, PROD) + '×');
  if (!user.includes('Orðaleiðréttingar')) throw new Error(id + ': chybi IS blok korekci');
  fs.writeFileSync(path.join(OUT, id + '.json'), JSON.stringify({ id, runa: r[0], uhel, obraz: obrazIS, obraz_en: en.obraz, smysl, area: u.area, seeking: u.seeking,
    sys, max_tokens: maxTok, ramena: { prod: user, detail: user.replace(PROD, DET) } }, null, 1));
  console.log(id + ' · ' + obrazIS + ' · ' + u.area + ' / ' + u.seeking);
}
