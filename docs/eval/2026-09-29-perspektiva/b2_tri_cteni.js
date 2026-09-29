// 2026-09-29 — KUKY „udělej 3 čtení, ukaž mi je“ (po stažení B: „She waits…“ bez předchůdce — uživatel obraz nevidí).
// Varianta B2 = B + „čtenář obraz neviděl: postavu poprvé pojmenuj“. 3 obrazy se zvířetem, EN, Opus 5, produkční single builder;
// řádek B2 se vkládá hned za řádek IMAGE (jako v testu B). Žádný soudce — čte owner.
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const KEY = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
const B2 = 'The main figure of this picture is not the seeker, and the seeker has not seen the picture: name the figure plainly the first time it appears. Tell the picture from that figure\'s side, without "you", and let only the last line turn to the seeker.';
const OBRAZY = [['Algiz', 'The sheepdog lies where it can see the whole flock'],
                ['Berkana', 'The eider leads her ducklings down to the water'],
                ['Uruz', 'The bull tears itself up out of the bog and keeps going']];
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
const st = {}; S.localStorage = { getItem: (k) => st[k] || null, setItem: (k, v) => { st[k] = v; }, removeItem: (k) => { delete st[k]; } };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + ';\n', S);
vm.runInContext('lang="en";var __s=1;Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};', S);
const R = vm.runInContext('RUNES', S);
(async () => {
  const sys = S.buildSysPrompt(null, 'en'), out = [];
  for (const [runa, cil] of OBRAZY) {
    let p = null;
    for (let s = 1; s < 5000 && !p; s++) {
      for (const k of Object.keys(st)) delete st[k];
      vm.runInContext('__s=' + (s * 7919 + 31) + ';', S);
      const q = S.buildReadingPrompt({ name: 'Kuky', area: '', seeking: '', question: '', intention: '' }, R.find((r) => r.n === runa), 'en', []);
      if (((S._promptDraws(q, 'en') || {}).image || '').indexOf(cil) === 0) p = q;
    }
    const radky = p.split('\n'), i = radky.findIndex((l) => l.indexOf('IMAGE —') === 0);
    radky.splice(i + 1, 0, B2);
    const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-opus-5', max_tokens: 700, system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: radky.join('\n') }], thinking: { type: 'disabled' } }) });
    const d = await res.json(); if (!res.ok) throw new Error(res.status);
    let t = (d.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('');
    try { t = JSON.parse(t.slice(t.indexOf('['), t.lastIndexOf(']') + 1))[0].text; } catch (e) {}
    const dr = S._promptDraws(p, 'en') || {};
    out.push({ runa, obraz: dr.image, aspekt: dr.kws, text: t, prompt: radky.join('\n') });
    console.log('\n== ' + runa + ' · obraz: ' + dr.image + ' · aspekt: ' + dr.kws + '\n' + t);
  }
  fs.writeFileSync(path.join(__dirname, 'b2_tri_cteni.json'), JSON.stringify(out, null, 1));
})();
