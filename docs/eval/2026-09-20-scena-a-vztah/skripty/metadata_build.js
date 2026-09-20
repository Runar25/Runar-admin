// CODE-read 2026-09-20 — podezřelý: řádek „World: … · Elements: …" v hlavičce DRAWN RUNE.
// Ruční nálezy CODE-tune: sol psal „beneath the surface" (Elements: Water) a „hidden roots of the shore" (World: the roots),
// ačkoli v obraze žádná hladina ani kořeny nejsou. Otázka: co ten řádek do čtení přidává, když ho odebereme?
// Tytéž tři EN single prompty z dávky sol vs opus-5 (tytéž losy, čočka zapnutá jako tam), produkce v4.31.
// A = beze změny · B = z hlavičky pryč „· World: … · Elements: …" (1 řádek).
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OUT = path.join(__dirname, 'metadata');
fs.mkdirSync(OUT, { recursive: true });
const PARY = require('C:/Users/zkuku/Downloads/Runar-admin/docs/eval/2026-09-20-sol-vs-opus5/pary.json')
  .filter(x => x.spread === 'single' && x.lang === 'en');
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
for (const par of PARY) {
  const runa = par.runes[0], d = par.draws;
  const S = box();
  S.__img = d.image; S.__kws = d.kws;
  vm.runInContext(`
    var __row = null;
    for (var i = 0; i < RUNE_IMAGES.length; i++) if (RUNE_IMAGES[i][3].indexOf(__img.slice(0, 30)) === 0) { __row = RUNE_IMAGES[i]; break; }
    if (!__row) throw new Error('obraz nenalezen: ' + __img);
    RUNE_IMAGES.splice(0, RUNE_IMAGES.length, __row);
    _randomAngle = function () { return READING_ANGLES[` + d.angle + `]; };
    _lengthBudget = function () { return LENGTH_BUDGETS[0]; };
    _endingShape = function () { return ENDING_OPEN[` + d.ending.replace('open', '') + `]; };
    _namePlacement = function (name) { return NAME_PLACEMENTS[` + d.name + `].split('{name}').join(name); };`, S);
  S.__u = { name: 'Anna', area: par.area, seeking: par.seeking, intention: par.intention, lifeLensOn: true };
  const life = par.life;
  vm.runInContext('__u.lifeRune = RUNES.filter(function(r){return r.n===' + JSON.stringify(life) + ';})[0];', S);
  const sys = vm.runInContext('buildSysPrompt(DEF_CHAR_EN, "en")', S);
  const user = vm.runInContext('buildReadingPromptSingle(__u, RUNES.filter(function(r){return r.n===' + JSON.stringify(runa) + ';})[0], "en", [])', S);
  const hl = user.split('\n').find(l => l.startsWith('DRAWN RUNE'));
  const bez = hl.replace(/ · World: [^·]*· Elements: [^\n]*/, '');
  if (bez === hl) throw new Error('metadata v hlavicce nenalezena: ' + hl);
  const A = '=== SYSTEM PROMPT ===\n' + sys + '\n\n=== USER MESSAGE ===\n' + user + '\n';
  const B = A.replace(hl, bez);
  fs.writeFileSync(path.join(OUT, par.id + '-A.txt'), A);
  fs.writeFileSync(path.join(OUT, par.id + '-B.txt'), B);
  console.log(par.id + '\n   A: ' + hl + '\n   B: ' + bez);
}
