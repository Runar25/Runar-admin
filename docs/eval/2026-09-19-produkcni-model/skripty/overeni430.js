// CODE-read 2026-09-19 — ověření nasazení v4.30-jadra na POSTAVENÉM promptu (EN i IS): jádro + místo v řádku obrazu,
// prompt_draws (place zvlášť, image bez místa), los místa se střídá. Produkční cesta, jen seedovaný Math.random.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OUT = path.join(__dirname, 'v430');
fs.mkdirSync(OUT, { recursive: true });
function box(seed, lang) {
  const S = { console: { log() {}, warn() {}, error() {} } };
  S.window = S; S.globalThis = S; S.lang = lang;
  S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
  const store = {};
  S.localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
  vm.createContext(S);
  vm.runInContext('var userGender="kk"; var corrections=[];', S);
  for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
    vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
  vm.runInContext('var __s = ' + seed + ' % 2147483648; Math.random = function () { __s = (__s * 1103515245 + 12345) % 2147483648; return __s / 2147483648; };', S);
  return S;
}
const mista = {};
for (let i = 1; i <= 8; i++) {
  for (const lang of ['en', 'is']) {
    const S = box(20260919000 + i * 7, lang);
    const user = vm.runInContext('buildReadingPromptSingle({ name: "Kuky", lifeRune: RUNES[6], lifeLensOn: false }, RUNES.filter(function(r){return r.n==="Raidho";})[0], ' + JSON.stringify(lang) + ', [])', S);
    S.__u = user;
    const d = vm.runInContext('_promptDraws(__u, ' + JSON.stringify(lang) + ')', S);
    const imgLine = (user.match(/^(IMAGE|MYND)[^\n]*/m) || [''])[0];
    if (lang === 'en') {
      mista[d.place || '(žádné)'] = (mista[d.place || '(žádné)'] || 0) + 1;
      fs.writeFileSync(path.join(OUT, 'raidho-' + i + '.txt'), '=== SYSTEM PROMPT ===\n' + vm.runInContext('buildSysPrompt(DEF_CHAR_EN, "en")', S) + '\n\n=== USER MESSAGE ===\n' + user + '\n');
      console.log(i + ' EN draws: image="' + d.image + '" · place="' + d.place + '" · konec ' + d.ending + ' · úhel ' + d.angle);
      console.log('   ' + imgLine.slice(0, 190));
    } else {
      console.log('  IS: ' + imgLine.slice(0, 190) + '\n      draws place="' + d.place + '"');
    }
    if (d.image && d.place && d.image.indexOf(d.place) !== -1) throw new Error('image v draws obsahuje misto — melo byt zkraceno');
  }
}
console.log('\nrozložení míst (8 losů EN): ' + JSON.stringify(mista));
