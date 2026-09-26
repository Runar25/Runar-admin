// Krok 1, rozhodující případ (ownerův report 2026-09-25 21:12): Kenaz s aspektem TVOŘIVOST — Ask bez aspektu vs. s ním (IS v3, EN).
// Seed zvolený tak, aby obraz nesl aspekt sköpunargleði / creativity (seed 9 = první takový v IS). 2 otázky × 2 ramena × 2 jazyky.
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const KEY = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
async function volej(sys, user, max) {
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-5', max_tokens: max, system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: user }], thinking: { type: 'disabled' } }) });
  const d = await res.json(); if (!res.ok) throw new Error(res.status + ' ' + (d.error && d.error.message));
  return (d.content || []).filter(c => c.type === 'text').map(c => c.text).join('');
}
(async () => {
  const out = [];
  for (const L of ['is', 'en']) {
    const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
    S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
    S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} }; vm.createContext(S);
    for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
      vm.runInContext(fs.readFileSync(D + f, 'utf8') + ';\n', S);
    vm.runInContext('lang="' + L + '";var __s=1;Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};', S);
    const rune = vm.runInContext('RUNES', S).find(r => r.n === 'Kenaz'), UI = vm.runInContext('UI_TEXT', S);
    let p, asp;
    for (let s = 1; s < 400; s++) { vm.runInContext('__s=' + s, S);
      p = S.buildReadingPrompt({ name: 'Kuky', area: '', seeking: '', question: '', intention: '' }, rune, L, []);
      asp = (S._promptDraws(p, L) || {}).kws; if (/sköpunargleði|creativity/.test(asp || '')) break; }
    const sys = S.buildSysPrompt(null, L);
    let t = await volej(sys, p, 700);
    try { t = JSON.parse(t.slice(t.indexOf('['), t.lastIndexOf(']') + 1))[0].text; } catch (e) {}
    const jm = S.rnPrompt(rune);
    console.log('\n==== ' + L + ' · aspekt: ' + asp + '\n' + t);
    for (const q of [L === 'is' ? 'Hvað meinarðu?' : 'What do you mean?', UI[L].ask_h_explain.replace('{rune}', jm)])
      for (const arm of ['bez', 's']) {
        const a = await volej(sys, S.buildAskPrompt(t, q, jm, L, [], null, {}, { mode: 'single', runy: [jm] }, arm === 's' ? asp : ''), 320);
        out.push({ L, asp, reading: t, q, arm, text: a });
        console.log('\n  [' + arm + '] ' + q + '\n  ' + a.replace(/\n+/g, ' '));
      }
  }
  fs.writeFileSync(path.join(__dirname, 'ask_aspekt_kenaz_tvorivost.json'), JSON.stringify(out, null, 1));
})();
