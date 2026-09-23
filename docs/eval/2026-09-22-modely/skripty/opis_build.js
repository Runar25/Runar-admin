// CODE-read 2026-09-23 — VARKA k vete za obrazem (owner: „pusť várku"). Navazuje na EVAL_LOG 2026-09-23 (6):
// na jednom promptu (Algiz) veta „look closer, at what someone there would notice first" zastavila opisovani u solu.
// Tady: 7 uhlu × 2 obrazy (u kazdeho uhlu jeden zrakovy a jeden NEzrakovy — zvuk, vune, hmat, teplo), 5 tezkych run.
// Prompt se stavi PRODUKCNIMI buildery (v2/*.js ve VM, pevne semeno, aktualni korekce z DB) a pak se z nej udelaji dve
// ramena, ktera se lisi JEN tou jednou vetou (tvrda kontrola: zasah prave 1×). Obraz a uhel se vynuti prepsanim
// _seasonBagPick / _randomAngle ve VM — produkcni kod se nemeni.
//   node opis_build.js   → opis2/<id>.json (oba ramena v jednom souboru)
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OUT = path.join(__dirname, 'opis2');
fs.mkdirSync(OUT, { recursive: true });

const PROD = '. Let it become your own seeing in the text.';
const NOVA = '. Let it become your own seeing: look closer, at what someone there would notice first.';

// [uhel, index v RUNE_IMAGES, smysl, oblast, rejstrik]
const PLAN = [
  [0, 63, 'zrak', 'Family & Home', 'General Guidance'],
  [0, 13, 'sluch', 'Purpose & Path', 'Clarity'],
  [1, 48, 'zrak', 'Career & Creativity', 'Confirmation'],
  [1, 61, 'cich', 'The Unseen', 'Insight into Challenge'],
  [2, 24, 'zrak', 'Love & Relationships', 'Reflection'],
  [2, 90, 'hmat', 'Healing & Wellbeing', 'General Guidance'],
  [3, 75, 'zrak', 'Crossroads & Decisions', 'Clarity'],
  [3, 11, 'sluch', 'Inner Growth', 'Confirmation'],
  [4, 81, 'zrak', 'Crossroads & Decisions', 'Insight into Challenge'],
  [4, 113, 'sluch', 'Inner Growth', 'Reflection'],
  [5, 85, 'zrak', 'Healing & Wellbeing', 'Confirmation'],
  [5, 32, 'teplo', 'Family & Home', 'Clarity'],
  [6, 6, 'zrak', 'Purpose & Path', 'Insight into Challenge'],
  [6, 42, 'hmat', 'Career & Creativity', 'Reflection'],
];

const S = { console: { log() {}, warn() {}, error() {} } };
S.window = S; S.globalThis = S; S.lang = 'en';   // produkce cte globalni `lang` (rk() v runar-character.js)
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
const st = {};
S.localStorage = { getItem: k => (k in st ? st[k] : null), setItem: (k, v) => { st[k] = String(v); }, removeItem: k => { delete st[k]; } };
vm.createContext(S);
vm.runInContext('var userGender="kk"; var corrections=[];', S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
vm.runInContext([
  'var __s=20260923; Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};',
  'var __force=null, __angle=null, __origBag=_seasonBagPick, __origAngle=_randomAngle;',
  '_seasonBagPick=function(b,k,ids,ex){ if(__force!==null && ids.indexOf(__force)>=0) return __force; return __origBag(b,k,ids,ex); };',
  '_randomAngle=function(lang){ return __angle!==null ? READING_ANGLES[__angle] : __origAngle(lang); };',
].join('\n'), S);

const KOR = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'korekce-norm.json'), 'utf8'));
const sys = vm.runInContext('buildSysPrompt(null, "en")', S);
const rows = vm.runInContext('RUNE_IMAGES', S);
const angles = vm.runInContext('READING_ANGLES', S);
const maxTok = vm.runInContext('RUNAR_MODES.quick_reading.max_tokens', S);
const heavy = vm.runInContext('HEAVY_RUNES.names', S);
const pocet = (t, s) => t.split(s).length - 1;

PLAN.forEach(([uhel, ix, smysl, area, seek], i) => {
  const r = rows[ix];
  const force = r[0] + '|' + r[2].slice(0, 24);
  vm.runInContext('__force=' + JSON.stringify(force) + '; __angle=' + uhel + ';', S);
  const u = { name: 'Kuky', area, seeking: seek };
  const user = vm.runInContext('buildReadingPromptSingle(' + JSON.stringify(u) + ', RUNES.filter(function(x){return x.n===' + JSON.stringify(r[0]) + ';})[0], "en", ' + JSON.stringify(KOR) + ')', S);
  const obrazEN = r[3].replace(/\.$/, '');
  if (pocet(user, obrazEN) !== 1) throw new Error(i + ': obraz v promptu ' + pocet(user, obrazEN) + '× (' + obrazEN + ')');
  if (pocet(user, angles[uhel]) !== 1) throw new Error(i + ': uhel v promptu ' + pocet(user, angles[uhel]) + '×');
  if (pocet(user, PROD) !== 1) throw new Error(i + ': produkcni veta ' + pocet(user, PROD) + '×');
  if (!user.includes('Word corrections')) throw new Error(i + ': chybi blok korekci');
  const id = String(i + 1).padStart(2, '0') + '-' + r[0].toLowerCase() + '-u' + uhel;
  fs.writeFileSync(path.join(OUT, id + '.json'), JSON.stringify({ id, runa: r[0], tezka: heavy.includes(r[0]), uhel, uhel_text: angles[uhel],
    obraz: obrazEN, smysl, area, seeking: seek, sys, max_tokens: maxTok,
    ramena: { prod: user, nova: user.replace(PROD, NOVA) } }, null, 1));
  console.log(id.padEnd(22) + smysl.padEnd(6) + (heavy.includes(r[0]) ? 'TEZKA ' : '      ') + obrazEN.slice(0, 70));
});
console.log('\nmax_tokens ' + maxTok + ' · sys ' + sys.length + ' znaku');
