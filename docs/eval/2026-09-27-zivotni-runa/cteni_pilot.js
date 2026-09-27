// Čtení životní runy po přestavbě RP_LIFE (2026-09-27, KUKY „vysvětlit v každém významu, jako Ask explain without image“).
// Produkční builder přes vm, Opus 5 jako claude-proxy (thinking off, max_tokens = RUNAR_MODES.life_rune_premium). Klíč ze souboru.
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const KEY = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
const CASE = [['Kuky', 12, 12, 1981, 'en'], ['Anna', 4, 7, 1985, 'en'], ['Sigrún', 9, 10, 1980, 'is']];
(async () => {
  const out = [];
  for (const [name, d, m, y, L] of CASE) {
    const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
    S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
    S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} }; vm.createContext(S);
    for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
      vm.runInContext(fs.readFileSync(D + f, 'utf8') + ';\n', S);
    vm.runInContext('lang="' + L + '"', S);
    const rune = S.calcLifeRune(d, m, y), mode = vm.runInContext('RUNAR_MODES.life_rune_premium', S);
    const p = S.buildLifeRunePrompt(name, rune, d, m, y, L, true, []), sys = S.buildSysPrompt(null, L);
    const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-opus-5', max_tokens: mode.max_tokens, system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: p }], thinking: { type: 'disabled' } }) });
    const j = await res.json(); if (!res.ok) throw new Error(res.status + ' ' + (j.error && j.error.message));
    const t = (j.content || []).filter(c => c.type === 'text').map(c => c.text).join('');
    out.push({ name, d, m, y, L, rune: rune.n, text: t, usage: j.usage });
    console.log('\n==== ' + name + ' ' + d + '. ' + m + '. ' + y + ' · ' + rune.n + ' · ' + L + ' · ' + t.split(/\s+/).length + ' slov\n' + t);
  }
  fs.writeFileSync(path.join(__dirname, 'cteni_pilot.json'), JSON.stringify(out, null, 1));
})();
