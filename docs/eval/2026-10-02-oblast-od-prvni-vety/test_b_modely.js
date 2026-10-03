// 2026-10-03 — týž test A / B / B2 jako test_b.js (2026-10-02, gpt-6.1-sol), na přání ownera pro Opus 5 a sol 6:
// „pokud jsi ten test udělal pro sol 6.1, tak znova, ale pro opus 5 a sol 6.“ Prompt se staví s READ_ENGINE daného modelu
// (věta za obrazem se pro sol a opus liší, runar-character.js `sees`). Produkce v4.85: Kenaz už má „burns over the workbench“.
//   node test_b_modely.js opus5|sol6
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const KOHO = process.argv[2];
if (!['opus5', 'sol6'].includes(KOHO)) throw new Error('opus5 | sol6');
const ENGINE = KOHO === 'sol6' ? 'sol' : 'opus';
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
const st = {}; S.localStorage = { getItem: (k) => st[k] || null, setItem: (k, v) => { st[k] = v; }, removeItem: (k) => { delete st[k]; } };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + ';\n', S);
vm.runInContext('lang="en";READ_ENGINE="' + ENGINE + '";var __s=1;Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};', S);
const RUNES = vm.runInContext('RUNES', S), rr = (n) => RUNES.find((r) => r.n === n);
function losuj(stav, test) {
  for (let s = 1; s < 20000; s++) {
    for (const k of Object.keys(st)) delete st[k];
    vm.runInContext('__s=' + (s * 7919 + 17) + ';', S);
    const p = stav(); const d = S._promptDraws(p, 'en') || {};
    if (test(d)) return p;
  }
  throw new Error('losy se nevylosovaly');
}
const LAND = /— let the image you were given land on ([^.]+)\./;
function variantaB(p) {
  const m = p.match(LAND); if (!m) throw new Error('řádek oblasti v promptu není');
  return p.replace(LAND, '— from the first sentence, set the scene in ' + m[1] + ': the place and the people come from there; from the picture you were given, take only what happens in it.');
}
async function volej(sys, p, max) {
  if (ENGINE === 'sol') {
    const OK = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-openai-key.txt'), 'utf8').trim();
    for (const eff of ['none', 'minimal']) {   // = claude-proxy callSol pro gpt-6-sol
      const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST',
        headers: { 'content-type': 'application/json', authorization: 'Bearer ' + OK },
        body: JSON.stringify({ model: 'gpt-6-sol', reasoning_effort: eff, max_completion_tokens: max || 1000,
          messages: [{ role: 'system', content: sys }, { role: 'user', content: p }] }) });
      if (res.status === 400 && eff === 'none') continue;
      const d = await res.json(); if (!res.ok) throw new Error('sol ' + res.status + ' ' + JSON.stringify(d).slice(0, 200));
      return { text: String(d.choices[0].message.content || ''), model: d.model, usage: d.usage };
    }
  }
  const AK = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': AK, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-5', max_tokens: max || 1000, system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: p }], thinking: { type: 'disabled' } }) });
  const d = await res.json(); if (!res.ok) throw new Error('opus ' + res.status + ' ' + JSON.stringify(d).slice(0, 200));
  return { text: (d.content || []).filter((c) => c.type === 'text').map((c) => c.text).join(''), model: d.model, usage: d.usage };
}
const u = (area, seeking) => ({ name: 'Kuky', area, seeking, question: '', intention: '' });
const BEHY = [
  ['Fehu', 'Love & Relationships', 'Clarity', (d) => (d.image || '').indexOf('The cow is sold in the autumn') === 0 && d.angle === 5 && d.area_face === 1 && d.ending === 'open0' && d.essence === 0 && d.name === 0],
  ['Kenaz', 'Family & Home', 'Clarity', (d) => (d.image || '').indexOf('A single lamp') === 0 && d.angle === 0 && d.area_face === 1 && d.ending === 'open0' && d.essence === 0 && d.name === 2],
  ['Ansuz', 'Healing & Wellbeing', 'Reflection', (d) => (d.image || '').indexOf('A church bell from across') === 0 && d.angle === 3 && d.area_face === 1 && d.ending === 'open2' && d.essence === 0 && d.name === 2],
];
const JADRO = {   // B2 — stejná jádra jako test_b.js 2026-10-02 (jen pro test)
  Fehu: ['The cow is sold in the autumn, and what she fetched carries the household through the winter.', 'Something of value changes hands, and what it brings carries others through a lean time.'],
  Kenaz: ['A single lamp burns over the workbench.', 'One small light shows only what is close at hand.'],
  Ansuz: ['A church bell from across the fjord carries over the still air and you turn toward it without deciding to.', 'A sound from far off reaches you, and you turn toward it before you decide to.'],
};
(async () => {
  const sys = S.buildSysPrompt(null, 'en'), out = [];
  for (const [runa, area, seek, test] of BEHY) {
    const pA = losuj(() => S.buildReadingPrompt(u(area, seek), rr(runa), 'en', []), test) + '\n' + S._thoughtLine('en', rr(runa));
    const [cely, jadro] = JADRO[runa];
    if (pA.split(cely).length !== 2) throw new Error('obraz v promptu není právě jednou: ' + runa);
    for (const [v, p] of [['A', pA], ['B', variantaB(pA)], ['B2', variantaB(pA.replace(cely, jadro))]]) {
      const r = await volej(sys, p);
      out.push({ runa, area, seek, varianta: v, model: r.model, usage: r.usage, prompt: p, text: r.text });
      console.log('\n== ' + runa + ' × ' + area + ' · ' + v + ' (' + r.model + ')\n' + r.text);
    }
  }
  fs.writeFileSync(path.join(__dirname, 'test_b_' + KOHO + '.json'), JSON.stringify(out, null, 1));
})().catch((e) => { console.error('CHYBA ' + e.message); process.exit(1); });
