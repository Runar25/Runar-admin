// CODE-read 2026-09-22 — glosa ma DVA vstupy do IS promptu: hlavicku runy („DREGNA RÚNA: Gebo (Félagsskapur)")
// a pokyn „Nefndu Gebo (Félagsskapur) einu sinni og fléttaðu nafnið…". Uprava `bezglosy` ucpala jen hlavicku,
// a sol pak glosu opsal jeste 2/5 — protoze ho k tomu primo vybizi ten pokyn. Tahle odstrani „(…)" za KAZDYM
// jmenem runy v IS promptu. Jen pro test; produkcni oprava patri ke zdroji (IS jmeno runy v promptu).
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const B = path.join(__dirname, 'varka');
const S = { console: { log() {}, warn() {}, error() {} } };
S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
const st = {};
S.localStorage = { getItem: k => (k in st ? st[k] : null), setItem: (k, v) => { st[k] = String(v); }, removeItem: k => { delete st[k]; } };
vm.createContext(S);
vm.runInContext('var userGender="kk"; var corrections=[];', S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
const jmena = vm.runInContext('RUNES.map(function(r){return r.n;})', S);
const re = new RegExp('\\b(' + jmena.join('|') + ') \\([^)]*\\)', 'g');
for (const r of ['gebo', 'laguz', 'algiz', 'jera', 'ansuz']) {
  const p = JSON.parse(fs.readFileSync(path.join(B, 'single-' + r + '-is.json'), 'utf8'));
  const n = (p.user.match(re) || []).length;
  p.user = p.user.replace(re, '$1');
  p.id = 'single-' + r + '-is-g2';
  p.upravy = p.upravy.concat(['bezglosy-vse']);
  fs.writeFileSync(path.join(B, p.id + '.json'), JSON.stringify(p, null, 1));
  const pokyn = p.user.split('\n').find(l => /^Nefndu/.test(l)) || '';
  console.log(p.id + ': odstraneno ' + n + '× · zbylo ' + (p.user.match(re) || []).length + ' · ' + pokyn.slice(0, 70));
}
