// Drobné zákazy a cesty z CLAUDE.md, které do 2026-10-13 nedržela žádná kontrola (mapa nosičů, scripts/verify_nosice.js, je ukázala
// jako „nedrží“). Každá část je jeden grep nad kódem appky — levné, a pravidlo přestane viset na paměti session (§30).
//   (A) §5  ᚱ vždy bez ozdob — žádný ozdobný znak (◌ ✦ ✧ · • ◈ …) těsně před ani za ᚱ v textu appky
//   (B) §5  reader-content se NIKDY neskrývá — z JS jen display 'block' / '', žádná třída ani CSS display:none
//   (C) §12 jméno uživatele nikdy z e-mailu — žádné split('@') ani odříznutí za zavináčem ve v2/ a v edge funkcích
//   (D) §13 nový výklad musí projít VŠEMI cestami — každý režim z _SPREAD_COST_KEY (kromě single) se objeví v readRune, drawAnother,
//           resetReader, _setSpreadMode i generateVoice (runar-reading.js). Dnes je to pravda pro všechny čtyři výklady.
// Postaveno CODE-read 2026-10-13 na ownerovo „co s tím? … pokračuj v kontrole“ nad výpisem mapy nosičů.
//   node scripts/verify_zakazy_cesty.js     · --test = kontrola sama sebe
'use strict';
const fs = require('fs'), path = require('path');
const R = process.env.RUNAR_ROOT || 'C:/Users/zkuku/Downloads/Runar-admin';

const OZDOBY = '◌○●◦✦✧·•◈◇◆★☆❖⁂※';
const reOzdoba = new RegExp('[' + OZDOBY + ']\\s?ᚱ|ᚱ\\s?[' + OZDOBY + ']');

function castA(soubory) {
  const v = [];
  for (const [rel, txt] of soubory) txt.split(/\r?\n/).forEach((l, i) => { if (reOzdoba.test(l)) v.push('(A) §5 ' + rel + ':' + (i + 1) + ' ozdoba u ᚱ: ' + l.trim().slice(0, 90)); });
  return v;
}

function castB(js, css) {
  const v = [];
  for (const [rel, txt] of js) {
    const jmena = [];
    const reVar = /(?:const|let|var)\s+(\w+)\s*=\s*document\.getElementById\(\s*['"]reader-content['"]\s*\)/g; let m;
    while ((m = reVar.exec(txt))) jmena.push(m[1]);
    const cile = jmena.map((n) => '\\b' + n).concat(["document\\.getElementById\\(\\s*['\"]reader-content['\"]\\s*\\)"]);
    for (const c of cile) {
      const reDisp = new RegExp(c + "\\.style\\.display\\s*=\\s*(['\"])([^'\"]*)\\1", 'g');
      while ((m = reDisp.exec(txt))) if (m[2] !== 'block' && m[2] !== '') v.push('(B) §5 ' + rel + ': reader-content dostává display \'' + m[2] + '\'');
      if (new RegExp(c + '\\.(classList\\.(add|toggle)|hidden\\s*=|setAttribute\\(\\s*[\'"]hidden)').test(txt)) v.push('(B) §5 ' + rel + ': reader-content se skrývá třídou nebo atributem');
    }
  }
  for (const [rel, txt] of css) if (/#reader-content\s*\{[^}]*(display\s*:\s*none|visibility\s*:\s*hidden)/.test(txt)) v.push('(B) §5 ' + rel + ': CSS skrývá #reader-content');
  return v;
}

function castC(soubory) {
  const v = [];
  const re = /split\(\s*['"]@['"]\s*\)|\.replace\(\s*\/@\.\*\/|slice\(\s*0\s*,\s*[\w.]*indexOf\(\s*['"]@['"]\s*\)\s*\)/;
  for (const [rel, txt] of soubory) txt.split(/\r?\n/).forEach((l, i) => { if (re.test(l) && !/^\s*\/\//.test(l)) v.push('(C) §12 ' + rel + ':' + (i + 1) + ' jméno z e-mailu: ' + l.trim().slice(0, 90)); });
  return v;
}

function telo(s, jmeno) {
  const i = s.search(new RegExp('(async )?function ' + jmeno + '\\s*\\('));
  if (i < 0) return null;
  let d = 0; const j = s.indexOf('{', i);
  for (let k = j; k < s.length; k++) { if (s[k] === '{') d++; else if (s[k] === '}') { d--; if (!d) return s.slice(i, k + 1); } }
  return null;
}
const CESTY = ['readRune', 'drawAnother', 'resetReader', '_setSpreadMode', 'generateVoice'];
function castD(reading) {
  const v = [];
  const m = reading.match(/_SPREAD_COST_KEY\s*=\s*\{([^}]*)\}/);
  if (!m) return ['(D) §13 v runar-reading.js chybí _SPREAD_COST_KEY — kontrola neví, které výklady existují (uprav ji)'];
  const rezimy = (m[1].match(/(\w+)\s*:/g) || []).map((x) => x.replace(/\s*:$/, '')).filter((x) => x !== 'single');
  if (rezimy.length < 1) return ['(D) §13 _SPREAD_COST_KEY bez výkladů — kontrola by nic neověřila'];
  for (const f of CESTY) {
    const b = telo(reading, f);
    if (!b) { v.push('(D) §13 funkce ' + f + ' v runar-reading.js chybí (přejmenovaná? uprav CESTY v kontrole)'); continue; }
    for (const r of rezimy) if (!new RegExp("['\"]" + r + "['\"]").test(b)) v.push('(D) §13 výklad \'' + r + '\' chybí v ' + f + '()');
  }
  return v;
}

function cti(rel) { return fs.readFileSync(path.join(R, rel), 'utf8'); }
function soubory(dir, re) {
  const abs = path.join(R, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs).filter((f) => re.test(f)).map((f) => [dir + '/' + f, cti(dir + '/' + f)]);
}

if (process.argv.includes('--test')) {
  const R0 = "var _SPREAD_COST_KEY = { single: 'single', norns: 'norns', kriz: 'cross' };\n";
  const vse = CESTY.map((f) => 'function ' + f + '() { if (m === \'norns\') {} if (m === \'kriz\') {} }').join('\n');
  const bez = vse.replace("function generateVoice() { if (m === 'norns') {} if (m === 'kriz') {} }", "function generateVoice() { if (m === 'norns') {} }");
  const pripady = [
    ['A čistý projde', castA([['x.html', '<span class="brand">ᚱ</span> ᚠᚢᚦᚨᚱᚲ']]), 0],
    ['A ozdoba padne', castA([['x.html', '<span>◌ ᚱ ◌</span>']]), 1],
    ['B block projde', castB([['a.js', "const content = document.getElementById('reader-content'); content.style.display = 'block';"]], []), 0],
    ['B none padne', castB([['a.js', "const c = document.getElementById('reader-content'); c.style.display = 'none';"]], []), 1],
    ['B třída padne', castB([['a.js', "document.getElementById('reader-content').classList.add('hidden');"]], []), 1],
    ['B CSS padne', castB([], [['a.css', '#reader-content { color: red; display: none; }']]), 1],
    ['C čistý projde', castC([['a.js', 'var n = displayName(currentUser);']]), 0],
    ['C split padne', castC([['a.js', "var n = currentUser.email.split('@')[0];"]]), 1],
    ['C komentář projde', castC([['a.js', "// NIKDY email.split('@')[0]"]]), 0],
    ['D všude projde', castD(R0 + vse), 0],
    ['D chybí v generateVoice padne', castD(R0 + bez), 1],
    ['D chybí funkce padne', castD(R0 + vse.replace('function resetReader', 'function resetX')), 1],
  ];
  let spatne = 0;
  for (const [jm, vady, cekam] of pripady) if ((vady.length > 0) !== !!cekam) { spatne++; console.log('FAIL  samotest: ' + jm + ' — ' + JSON.stringify(vady)); }
  if (spatne) process.exit(1);
  console.log('OK    samotest zákazů a cest: ' + pripady.length + ' stavů');
  process.exit(0);
}

const js = soubory('v2', /\.js$/).filter(([rel]) => !/runar-(names-registry|tree-prod)\.js$/.test(rel));
const html = soubory('v2', /\.html$/);
const css = soubory('v2', /\.css$/);
const edge = fs.readdirSync(path.join(R, 'supabase/functions')).flatMap((d) => soubory('supabase/functions/' + d, /\.ts$/));
const vady = [].concat(castA(js.concat(html)), castB(js, css.concat(html)), castC(js.concat(edge)), castD(cti('v2/runar-reading.js')));
vady.forEach((v) => console.log('FAIL  ' + v));
if (vady.length) { console.log('FAIL  zákazy a cesty: ' + vady.length + ' vad (scripts/verify_zakazy_cesty.js)'); process.exit(1); }
console.log('OK    zákazy a cesty: ᚱ bez ozdob, reader-content se neskrývá, jméno ne z e-mailu, každý výklad ve všech ' + CESTY.length + ' funkcích');
