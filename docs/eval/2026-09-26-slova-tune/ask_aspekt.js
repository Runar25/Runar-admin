// Krok 1 (2026-09-26): Ask s VÝZNAMEM RUNY ze čtení vs. bez něj. Opus 5 jako claude-proxy.
// 5 run: napřed čtení (produkční single builder, seed), pak Ask na 2 otázky × 2 ramena — TÝŽ text čtení v obou ramenech,
// liší se jen argument `aspect` produkčního buildAskPrompt. Otázky: vlastní „What do you mean?“ + nápověda ask_h_explain.
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const KEY = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
const L = process.argv[2] || 'en';
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} }; vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + ';\n', S);
vm.runInContext('lang="' + L + '";var __s=1;Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};', S);
const R = vm.runInContext('RUNES', S), UI = vm.runInContext('UI_TEXT', S);
async function volej(sys, user, max) {
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-5', max_tokens: max, system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: user }], thinking: { type: 'disabled' } }) });
  const d = await res.json(); if (!res.ok) throw new Error(res.status + ' ' + (d.error && d.error.message));
  return (d.content || []).filter(c => c.type === 'text').map(c => c.text).join('');
}
(async () => {
  const sys = S.buildSysPrompt(null, L), out = [];
  for (const runa of (process.argv[3] || 'Kenaz,Fehu,Laguz,Ansuz,Perth').split(',')) {
    const rune = R.find(r => r.n === runa);
    vm.runInContext('__s=' + (runa.length * 104729) + ';', S);
    const p = S.buildReadingPrompt({ name: 'Kuky', area: '', seeking: '', question: '', intention: '' }, rune, L, []);
    const asp = (S._promptDraws(p, L) || {}).kws || '';
    let t = await volej(sys, p, 700);
    try { t = JSON.parse(t.slice(t.indexOf('['), t.lastIndexOf(']') + 1))[0].text; } catch (e) {}
    const jm = S.rnPrompt(rune);
    const otazky = [L === 'is' ? 'Hvað meinarðu?' : 'What do you mean?', UI[L].ask_h_explain.replace('{rune}', jm)];
    const r = { runa, aspekt: asp, prvni: (L === 'is' ? rune.k_is : rune.k).split(',')[0].trim(), reading: t, ask: [] };
    for (const q of otazky) for (const arm of ['bez', 's']) {
      const ap = S.buildAskPrompt(t, q, jm, L, [], null, {}, { mode: 'single', runy: [jm] }, arm === 's' ? asp : '');
      r.ask.push({ q, arm, text: await volej(sys, ap, 320) });
    }
    out.push(r);
    console.log('\n== ' + runa + ' · aspekt čtení: ' + asp + ' · první klíč seznamu: ' + r.prvni + '\n' + t);
    for (const a of r.ask) console.log('\n  [' + a.arm + '] ' + a.q + '\n  ' + a.text.replace(/\n+/g, ' '));
  }
  fs.writeFileSync(path.join(__dirname, 'ask_aspekt_' + L + '.json'), JSON.stringify(out, null, 1));
})();
