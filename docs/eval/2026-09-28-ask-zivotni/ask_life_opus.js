// 2026-09-28 — rozhodující měření: dělá „…does not change the rune drawn“ i Opus 5 (produkce pro všechny), nebo jen sol (admin)?
// Týž prompt jako ask_life_pilot.js (produkční buildAskPrompt, ownerovo čtení Uruz, otázka na Isu). Ramena: produkce + varianta D a E.
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const AK = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
const OK = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-openai-key.txt'), 'utf8').trim();
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} }; vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + ';\n', S);
vm.runInContext('lang="en"', S);
const R = vm.runInContext('RUNES', S);
const CTENI = 'The bull’s back stays level as the bog gives way beneath its hooves, and dark water runs from its hide. Uruz holds the plain force of a body finding firm ground. You can see how much of that force goes into lifting one hoof free. Your next step may be a test of strength you already have, or the first firm ground it finds.';
const Q = 'How does my life rune Isa affect this reading?';
const STARE = 'If their question reaches for it, you may answer from it in a sentence or two, then return to the runes that were drawn.';
const VAR = {
  D: 'If their question reaches for it, say in a sentence or two what it brings to this reading.',
  E: '',   // obrácená páka (§25): věta pryč úplně — zmizí upozornění, nebo je příčina jinde?
  F: 'If their question reaches for it, say in a sentence or two what it brings to this reading. They know which rune fell; answer only what they asked.',
};
async function opus(system, prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': AK, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-5', max_tokens: 320, system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: prompt }], thinking: { type: 'disabled' } }) });
  const d = await res.json(); if (!res.ok) throw new Error(res.status);
  return (d.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('').trim();
}
async function sol(system, prompt) {
  for (const eff of ['none', 'minimal']) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + OK },
      body: JSON.stringify({ model: 'gpt-6-sol', reasoning_effort: eff, max_completion_tokens: 320,
        messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }] }) });
    if (res.status === 400 && eff === 'none') continue;
    const d = await res.json(); if (!res.ok) throw new Error(res.status);
    return String(d.choices[0].message.content || '').trim();
  }
}
// 2026-09-28: úzké měřítko dvakrát minulo tvar upozornění („Uruz alone“, „only rune drawn“) — rozšířeno (§27).
const ozvena = /does not change|doesn['’]t change|not change (the|what)|without changing|rather than chang|not (been )?drawn|wasn['’]t drawn|only rune drawn|rune drawn (here )?is|drawn here is|was drawn here|what was drawn|you drew is|alone|only uruz|rune (that was|you) drew|the drawn rune|return to|remains? the rune|still the rune/i;
(async () => {
  const sys = S.buildSysPrompt(null, 'en'), isa = R.find((r) => r.n === 'Isa');
  const p = S.buildAskPrompt(CTENI, Q, 'Uruz', 'en', [], isa, {}, { mode: 'single', runy: ['Uruz'] }, 'raw power');
  if (p.indexOf(STARE) === -1) throw new Error('stará věta v promptu není');
  const beh = process.argv[2] === 'f'
    ? [['opus', 'F', p.replace(STARE, VAR.F)], ['sol', 'F', p.replace(STARE, VAR.F)]]
    : [['opus', 'produkce', p], ['sol', 'D', p.replace(STARE, VAR.D)], ['sol', 'E', p.replace(' ' + STARE, '').replace(STARE, '')]];
  const out = {};
  for (const [m, jm, pr] of beh) {
    out[m + '_' + jm] = [];
    for (let i = 0; i < 5; i++) out[m + '_' + jm].push(await (m === 'opus' ? opus : sol)(sys, pr));
    const t = out[m + '_' + jm];
    console.log('\n### ' + m + ' ' + jm + ' — upozornění ' + t.filter((x) => ozvena.test(x)).length + '/5');
    t.forEach((x, i) => console.log((i + 1) + '. ' + x.replace(/\n+/g, ' ').slice(0, 260)));
  }
  fs.writeFileSync(path.join(__dirname, 'ask_life_opus' + (process.argv[2] === 'f' ? '_f' : '') + '.json'), JSON.stringify(out, null, 1));
})();
