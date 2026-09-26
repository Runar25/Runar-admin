// Krok 1, IS kolo 2: TÝŽ text čtení jako ask_aspekt_is.json, jen rameno „s“ s přepsaným IS zněním aspektu (bez doslovného opisu?).
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const KEY = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} }; vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + ';\n', S);
vm.runInContext('lang="is"', S);
const R = vm.runInContext('RUNES', S);
const src = JSON.parse(fs.readFileSync(path.join(__dirname, 'ask_aspekt_is.json'), 'utf8'));
(async () => {
  const sys = S.buildSysPrompt(null, 'is'), out = [];
  for (const r of src) {
    const jm = S.rnPrompt(R.find(x => x.n === r.runa));
    for (const q of [...new Set(r.ask.map(a => a.q))]) {
      const ap = S.buildAskPrompt(r.reading, q, jm, 'is', [], null, {}, { mode: 'single', runy: [jm] }, r.aspekt);
      const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-opus-5', max_tokens: 320, system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }],
          messages: [{ role: 'user', content: ap }], thinking: { type: 'disabled' } }) });
      const d = await res.json(); if (!res.ok) throw new Error(res.status);
      const t = (d.content || []).filter(c => c.type === 'text').map(c => c.text).join('');
      out.push({ runa: r.runa, aspekt: r.aspekt, q, text: t });
      console.log('\n== ' + r.runa + ' · ' + q + '\n' + t.replace(/\n+/g, ' '));
    }
  }
  fs.writeFileSync(path.join(__dirname, 'ask_aspekt_is2.json'), JSON.stringify(out, null, 1));
})();
