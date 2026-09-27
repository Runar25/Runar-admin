// Konec čtení životní runy: otázka (v4.68) vs. jedna klidná věta bez otázky (KUKY 2026-09-27: „nevím, jestli má končit otázkou.
// je to podobný výklad jako v horoskopu znamení“). Týž prompt, liší se jen poslední instrukce části 2. Opus 5, 2 runy × 2 jazyky.
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const KEY = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
const KONEC = {
  en: 'End on one plain sentence that holds the whole rune together — no question, and nothing about the person\'s life now.',
  is: 'Endaðu á einni einfaldri setningu sem heldur rúninni saman í heild — engin spurning og ekkert um líf manneskjunnar núna.',
};
const CASE = [['Kuky', 12, 12, 1981, 'en'], ['Anna', 4, 7, 1985, 'en'], ['Sigrún', 9, 10, 1980, 'is'], ['Jón', 5, 8, 1990, 'is']];
(async () => {
  const out = [];
  for (const [name, d, m, y, L] of CASE) {
    const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
    S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
    S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} }; vm.createContext(S);
    for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
      vm.runInContext(fs.readFileSync(D + f, 'utf8') + ';\n', S);
    vm.runInContext('lang="' + L + '"', S);
    const rune = S.calcLifeRune(d, m, y);
    let p = S.buildLifeRunePrompt(name, rune, d, m, y, L, true, []);
    const a = L === 'is' ? 'Endaðu á einni hljóðlátri, opinni spurningu.' : 'End with one quiet, open question.';
    const i = p.indexOf(a), j = p.indexOf('\n', i);
    if (i < 0) throw new Error('kotva konce nenalezena ' + L);
    p = p.slice(0, i) + KONEC[L] + p.slice(j);
    const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-opus-5', max_tokens: 2000, system: [{ type: 'text', text: S.buildSysPrompt(null, L), cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: p }], thinking: { type: 'disabled' } }) });
    const jj = await res.json(); if (!res.ok) throw new Error(res.status);
    const t = (jj.content || []).filter(c => c.type === 'text').map(c => c.text).join('').trim();
    out.push({ name, rune: rune.n, L, text: t });
    const vety = t.split(/(?<=[.?!])\s+/);
    console.log('\n== ' + rune.n + ' · ' + L + ' · otazka v textu: ' + (/\?/.test(t) ? 'ANO' : 'ne') + '\n…' + vety.slice(-3).join(' '));
  }
  fs.writeFileSync(path.join(__dirname, 'konec_pilot.json'), JSON.stringify(out, null, 1));
})();
