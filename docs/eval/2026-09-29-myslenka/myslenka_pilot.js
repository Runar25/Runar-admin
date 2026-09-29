// 2026-09-29 — KUKY „7. teď“ (+ 8/9: motivační věty; report 20:06 u Kříže: „závěrečná věta toho moc neřekne… hodilo by se mít na
// závěr u spreadu nějakou myšlenku navíc, něco, co by Rúnar mohl čtenáři nabídnout… jako to moto, nebo kam by se měl podívat,
// neříkat, co má dělat, ale něco nabídnout. Takové shrnutí, které má myšlenku.“). Vzor ownera z kolekce: Uruz „What in you is ready
// to break through stone?“, „Listen closely to what speaks when you are still.“ — do promptu je NEDÁVÁM (vzor se opisuje,
// memory prompt-directive-makes-model-copy); pokyn jen popisuje tvar.
// 3 čtení produkční cestou + jeden řádek pokynu na konec: Kříž (ownerovy losy 19:55, Opus), Norny (losy 19:45, GPT), single Uruz (Opus).
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const AK = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
const OK = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-openai-key.txt'), 'utf8').trim();
const MYSLENKA = 'AFTER THE READING — after everything else, on a new line beginning with ✦, one more short line set apart: a thought Rúnar offers the seeker to carry away — where they might look, or a question grown from the runes and the picture. It gathers the reading into one thought. Never what to do, never a claim about what they feel or know, and never a repeat of the last sentence.';
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
const st = {}; S.localStorage = { getItem: (k) => st[k] || null, setItem: (k, v) => { st[k] = v; }, removeItem: (k) => { delete st[k]; } };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + ';\n', S);
vm.runInContext('lang="en";var __s=1;Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};', S);
const R = vm.runInContext('RUNES', S), rr = (n) => R.find((r) => r.n === n);
function postav(engine, stav, test) {
  vm.runInContext('READ_ENGINE="' + engine + '"', S);
  for (let s = 1; s < 8000; s++) {
    for (const k of Object.keys(st)) delete st[k];
    vm.runInContext('__s=' + (s * 7919 + 17) + ';', S);
    const p = stav(); const d = S._promptDraws(p, 'en') || {};
    if (test(d)) return p + '\n' + MYSLENKA;
  }
  throw new Error('losy se nevylosovaly');
}
async function volej(engine, sys, p) {
  if (engine === 'sol') {
    for (const eff of ['none', 'minimal']) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST',
        headers: { 'content-type': 'application/json', authorization: 'Bearer ' + OK },
        body: JSON.stringify({ model: 'gpt-6-sol', reasoning_effort: eff, max_completion_tokens: 1000,
          messages: [{ role: 'system', content: sys }, { role: 'user', content: p }] }) });
      if (res.status === 400 && eff === 'none') continue;
      const d = await res.json(); if (!res.ok) throw new Error('sol ' + res.status);
      return String(d.choices[0].message.content || '');
    }
  }
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': AK, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-5', max_tokens: 1000, system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: p }], thinking: { type: 'disabled' } }) });
  const d = await res.json(); if (!res.ok) throw new Error('opus ' + res.status);
  return (d.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('');
}
function rozloz(t) {   // čtení (pole JSON nebo text) + řádek ✦ zvlášť
  const i = t.indexOf('✦'); const mys = i === -1 ? '' : t.slice(i).trim(); let telo = i === -1 ? t : t.slice(0, i);
  try { telo = JSON.parse(telo.slice(telo.indexOf('['), telo.lastIndexOf(']') + 1)).map((x) => x.text).join(' '); } catch (e) {}
  return { cteni: telo.trim(), myslenka: mys };
}
(async () => {
  const sys = S.buildSysPrompt(null, 'en'), out = [];
  const beh = [
    ['Kříž (Opus)', 'opus', () => S.buildKrizPrompt({ name: 'Kuky', area: 'The Unseen', seeking: 'Reflection', question: '', intention: '' },
       ['Blank', 'Tiwaz', 'Perth', 'Ingwaz', 'Sowilo'].map(rr), 'en', []), (d) => (d.image || '').indexOf('In the low sun a whole trail') === 0 && d.area_face === 2 && d.name === 1],
    ['Norny (GPT)', 'sol', () => S.buildNornsPrompt({ name: 'Kuky', area: 'Purpose & Path', seeking: 'Confirmation', question: '', intention: '' },
       ['Nauthiz', 'Tiwaz', 'Perth'].map(rr), 'en', []), (d) => (d.image || '').indexOf('The rope has swollen') === 0 && d.area_face === 0 && d.name === 2],
    ['Single Uruz (Opus)', 'opus', () => S.buildReadingPrompt({ name: 'Kuky', area: 'Purpose & Path', seeking: 'Confirmation', question: '', intention: '' },
       rr('Uruz'), 'en', []), (d) => (d.image || '').indexOf('The bull tears itself') === 0],
  ];
  for (const [jm, eng, stav, test] of beh) {
    const p = postav(eng, stav, test);
    const r = rozloz(await volej(eng, sys, p));
    out.push({ jm, ...r });
    console.log('\n== ' + jm + '\n' + r.cteni + '\n' + (r.myslenka || '(ŘÁDEK ✦ CHYBÍ)'));
  }
  fs.writeFileSync(path.join(__dirname, 'myslenka_pilot.json'), JSON.stringify(out, null, 1));
})();
