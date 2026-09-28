// 2026-09-28 — věta o životní runě v Asku (report KUKY 11:15: GPT ve druhém Asku napsal „but it does not change the rune that was
// drawn“ — „zbytečná informace“). Zdroj: _askLifeContext „…answer from it in a sentence or two, then return to the runes that were
// drawn“ — sol z „return to the drawn runes“ dělá upozornění. Týž vzor jako 2026-09-25 (odebraná věta „lesturinn fjallar ekki um hana“).
// Ramena: STARÉ (produkce) × NOVÉ („say in a sentence or two how it sits beside the runes that were drawn“), TÝŽ prompt jinak.
// Data: ownerovo vlastní čtení Uruz 2026-09-28 11:07 a jeho otázka (sol smí jen adminova čtení — RUNAR_PRIVACY.md).
//   node ask_life_pilot.js [pocet]
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const KEY = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-openai-key.txt'), 'utf8').trim();
const N = +(process.argv[2] || 5);
const STARE_EN = 'If their question reaches for it, you may answer from it in a sentence or two, then return to the runes that were drawn.';
const NOVE_EN = process.argv[3] === 'c'
  ? 'If their question reaches for it, say in a sentence or two how it sits beside this reading.'   // varianta C: bez slova „drawn“
  : 'If their question reaches for it, say in a sentence or two how it sits beside the runes that were drawn.';
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} }; vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + ';\n', S);
vm.runInContext('lang="en"', S);
const R = vm.runInContext('RUNES', S);
const CTENI = 'The bull’s back stays level as the bog gives way beneath its hooves, and dark water runs from its hide. Uruz holds the plain force of a body finding firm ground. You can see how much of that force goes into lifting one hoof free. Your next step may be a test of strength you already have, or the first firm ground it finds.';
const Q = 'How does my life rune Isa affect this reading?';
async function sol(system, prompt) {
  for (const eff of ['none', 'minimal']) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + KEY },
      body: JSON.stringify({ model: 'gpt-6-sol', reasoning_effort: eff, max_completion_tokens: 320,
        messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }] }) });
    if (res.status === 400 && eff === 'none') continue;
    const d = await res.json(); if (!res.ok) throw new Error(res.status + ' ' + JSON.stringify(d).slice(0, 200));
    return String(d.choices[0].message.content || '').trim();
  }
}
(async () => {
  const sys = S.buildSysPrompt(null, 'en'), isa = R.find((r) => r.n === 'Isa');
  const p = S.buildAskPrompt(CTENI, Q, 'Uruz', 'en', [], isa, {}, { mode: 'single', runy: ['Uruz'] }, 'raw power');
  if (p.indexOf(STARE_EN) === -1) throw new Error('stará věta v promptu není — pilot by neměřil produkci');
  const out = { stare: [], nove: [] };
  for (let i = 0; i < N; i++) {
    out.stare.push(await sol(sys, p));
    out.nove.push(await sol(sys, p.replace(STARE_EN, NOVE_EN)));
  }
  // 2026-09-28: první regex neviděl „Isa was not drawn here“ (nová věta 5/5) — měřítko rozšířeno o každé „(not) drawn“.
  const ozvena = /does not change|doesn['’]t change|not change the rune|not drawn|wasn['’]t drawn|rune (that was|you) drew|the drawn rune|return to|remains? the rune|still the rune/i;
  for (const arm of ['stare', 'nove']) {
    console.log('\n### ' + arm + ' — ozvěna ' + out[arm].filter((t) => ozvena.test(t)).length + '/' + N);
    out[arm].forEach((t, i) => console.log((i + 1) + '. ' + t.replace(/\n+/g, ' ')));
  }
  fs.writeFileSync(path.join(__dirname, 'ask_life_pilot' + (process.argv[3] === 'c' ? '_c' : '') + '.json'), JSON.stringify(out, null, 1));
})();
