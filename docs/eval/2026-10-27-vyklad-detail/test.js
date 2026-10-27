// Výklad Norny: vstoupí význam runy do sdílené scény detailem, když to prompt řekne? (owner 2026-10-27, test „13. ano“)
//
// Proč: čtení a3692c86 (Norny Hagalaz · Ansuz · Sowilo, Career & Creativity, Decision ahead) — Ansuz dal „a voice is taking shape among
// the fallen branches“, abstraktní slovo položené do obrazu bouře. Owner: *„voice tam klidně být může, ale měl by být spojený s tím, že je
// slyšet praskání větví … najdi řešení“*. Data: Ansuz = „voice“ v 8/11 výkladů i 5/11 čtení jedné runy — volbu významu nebereme, jde o to,
// JAK do scény vstoupí.
// Varianty (jinak bit po bitu tentýž prompt, produkční buildNornsPrompt z HEAD):
//   A = dnešní prompt
//   B = A + jedna věta hned za řádek obrazu (DETAIL níž)
// Vstup: runy, oblast, záměr a obraz z losu čtení a3692c86; jméno prázdné; řádek myšlenky ✦ vynechán (funkce bydlí v runar-reading.js,
// míří na řádek ✦, ne na text výkladu). Model a parametry jako claude-proxy: gpt-6-sol, reasoning_effort none → minimal na HTTP 400,
// max_completion_tokens 900 (_spreadTokens('norns', 900)). Pořadí volání A, B, A, B…
// Výstup: vystup.json (texty + varianta) — soudí se slepě (soudce nevidí variantu).
//   RUNAR_API_ANO=10 RUNAR_API_ZAMER="…" node docs/eval/2026-10-27-vyklad-detail/test.js [--n 5] [--dry]
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const P = require('../../../scripts/utils/prompt_doby.js');
const N = Number((process.argv[process.argv.indexOf('--n') + 1]) || 5) || 5;
const DRY = process.argv.includes('--dry');
const OBRAZ = 'After the storm, only the tree with deep roots is still standing.';
const DETAIL = 'Each rune enters this same scene through something the scene itself can do — a sound, a light, a movement, a mark. Its meaning is read from that detail; never lay the meaning on the scene as an abstract word.';

const c = P.git(['rev-parse', 'HEAD']).trim();
const S = P.kontext(c), G = (x) => P.G(S, x);
const R = G('RUNES'), runy = ['Hagalaz', 'Ansuz', 'Sowilo'].map((n) => R.find((r) => r.n === n));
const u = { name: '', area: 'Career & Creativity', seeking: '', intention: 'Decision ahead', question: '' };
let A = G('buildNornsPrompt')(u, runy, 'en', []);
const m = A.match(/comes from here: (.*?) Let it become/);
if (!m) throw new Error('řádek obrazu v promptu nenalezen — builder se změnil');
A = A.replace(m[0], 'comes from here: ' + OBRAZ + ' Let it become');
const radekObrazu = A.split('\n').find((l) => l.indexOf('comes from here: ' + OBRAZ) !== -1);
const B = A.replace(radekObrazu, radekObrazu + '\n' + DETAIL);
if (B === A || B.split(DETAIL).length !== 2) throw new Error('varianta B se nesložila');
const sys = G('buildSysPrompt')(null, 'en');
const DIR = __dirname;
fs.writeFileSync(path.join(DIR, 'prompt_A.txt'), A); fs.writeFileSync(path.join(DIR, 'prompt_B.txt'), B);
if (DRY) { console.log('dry: prompty zapsány (A ' + A.length + ' znaků, B ' + B.length + ')'); process.exit(0); }

const KEY = (process.env.OPENAI_API_KEY || fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-openai-key.txt'), 'utf8')).trim();
async function sol(prompt) {
  for (const eff of ['none', 'minimal']) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + KEY },
      body: JSON.stringify({ model: 'gpt-6-sol', reasoning_effort: eff, max_completion_tokens: 900, prompt_cache_options: { mode: 'explicit' },
        messages: [{ role: 'system', content: sys }, { role: 'user', content: prompt }] }) });
    if (res.status === 400 && eff === 'none') continue;
    const j = await res.json();
    if (!res.ok) throw new Error('sol ' + res.status + ': ' + JSON.stringify(j).slice(0, 200));
    return { text: j.choices[0].message.content, usage: j.usage, eff };
  }
}
const spoj = (t) => { try { const a = JSON.parse(t.slice(t.indexOf('['), t.lastIndexOf(']') + 1)); return a.map((x) => x.text).join(' '); } catch (e) { return t; } };
(async () => {
  const out = [];
  for (let i = 0; i < N; i++) for (const v of ['A', 'B']) {
    const r = await sol(v === 'A' ? A : B);
    out.push({ v, i, text: spoj(r.text), raw: r.text, eff: r.eff, prompt_tokens: r.usage && r.usage.prompt_tokens });
    console.log(v + i + ' ok');
  }
  fs.writeFileSync(path.join(DIR, 'vystup.json'), JSON.stringify({ commit: c.slice(0, 7), obraz: OBRAZ, detail: DETAIL, out }, null, 1));
  console.log('zapsáno', path.join(DIR, 'vystup.json'));
})();
