// CODE-read 2026-09-26: postav produkční prompt (sys + user) single, vynuť obraz / úhel / podobu / esenci, vypiš.
'use strict';
const fs = require('fs'), vm = require('vm');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
function ctx(lang) {
  const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S; S.lang = lang;
  S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
  const st = {}; S.localStorage = { getItem: k => (k in st ? st[k] : null), setItem: (k, v) => { st[k] = String(v); }, removeItem: k => { delete st[k]; } };
  vm.createContext(S); vm.runInContext('var userGender="kk"; var corrections=[];', S);
  for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-character.js', 'runar-utils.js']) vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
  return S;
}
module.exports = function stav(o) {
  const S = ctx(o.lang || 'en');
  const L = JSON.stringify(o.lang || 'en');
  if (o.image) vm.runInContext('var __img=' + JSON.stringify(o.image) + '; var __cand=_runeImageCandidates; _runeImageCandidates = function(d, b){ var c=__cand(d, b).filter(function(r){ return r[3].indexOf(__img)!==-1 || r[2].indexOf(__img)!==-1; }); if (!c.length) throw new Error("obraz nenalezen: "+__img); return c; };', S);
  if (o.angle !== undefined) vm.runInContext('_randomAngle = function(l){ return (l==="is"?READING_ANGLES_IS:READING_ANGLES)[' + o.angle + ']; };', S);
  if (o.face !== undefined) vm.runInContext('_drawAreaFace = function(){ return ' + o.face + '; };', S);
  if (o.essence !== undefined) vm.runInContext('var __E=' + o.essence + '; _essenceFrame = function(l, r){ if (r && r.n==="Blank") return l==="is"?ESSENCE_BLANK_IS:ESSENCE_BLANK; return (l==="is"?ESSENCE_FRAMES_IS:ESSENCE_FRAMES)[__E]; };', S);
  const sys = vm.runInContext('buildSysPrompt(null, ' + L + ')', S);
  const u = { name: 'Kuky', area: o.area, seeking: o.seeking };
  const user = vm.runInContext('buildReadingPromptSingle(' + JSON.stringify(u) + ', RUNES.filter(function(r){return r.n===' + JSON.stringify(o.rune) + ';})[0], ' + L + ', [])', S);
  return { sys, user, S };
};
if (require.main === module) {
  const r = module.exports({ rune: 'Kenaz', area: 'Career & Creativity', seeking: 'Reflection', image: 'The shavings curl away from the blade', angle: 3, face: 0, essence: 1 });
  console.log('=== SYS ===\n' + r.sys + '\n=== USER ===\n' + r.user);
}
