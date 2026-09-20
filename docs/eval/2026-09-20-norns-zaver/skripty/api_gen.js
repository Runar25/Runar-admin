// CODE-read 2026-09-19 — generátor na PRODUKČNÍM modelu (owner schválil API pro testy podezřelých 2026-09-19:
// testovací pisatel Claude Opus 5 produkční vady nereprodukoval, `RUNAR_EVAL_LOG.md` 2026-09-19 (3)).
// Volá stejně jako claude-proxy: model claude-opus-4-8, bez teploty (výchozí), system = jeden textový blok s cache,
// user = prompt; max_tokens čtení 700 (RUNAR_MODES.quick_reading), Ask 320 (askCap). Klíč z ~/.claude/runar-api-key.txt.
// Použití: node api_gen.js <výstup.json> <max_tokens> <n> <prompt.txt> [<prompt.txt> ...]
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const [out, maxTok, nStr, ...files] = process.argv.slice(2);
const KEY = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
const MODEL = 'claude-opus-4-8';
function rozdel(t) {
  const i = t.indexOf('=== USER MESSAGE ===');
  return { system: t.slice('=== SYSTEM PROMPT ==='.length, i).trim(), user: t.slice(i + '=== USER MESSAGE ==='.length).trim() };
}
async function volej(system, user) {
  for (let pokus = 1; pokus <= 4; pokus++) {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: +maxTok,
        system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: user }] }),
    });
    const j = await r.json();
    if (r.ok) return { text: (j.content || []).filter(c => c.type === 'text').map(c => c.text).join(''), model: j.model, usage: j.usage };
    if (r.status === 429 || r.status >= 500) { await new Promise(res => setTimeout(res, 3000 * pokus)); continue; }
    throw new Error('API ' + r.status + ': ' + JSON.stringify(j).slice(0, 200));
  }
  throw new Error('API: vycerpany pokusy');
}
// Spread vraci JEDEN objekt na runu — text je slozeni vsech beatu, ne jen prvniho (chyba 2026-09-20).
const textOf = raw => { try { const a = JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1));
  return a.map(x => x.text).filter(Boolean).join(' ').trim(); } catch (e) { return raw.trim(); } };
(async () => {
  const res = {};
  const jobs = [];
  for (const f of files) {
    const { system, user } = rozdel(fs.readFileSync(f, 'utf8'));
    const id = path.basename(f, '.txt');
    for (let i = 1; i <= +nStr; i++) jobs.push((async () => {
      const r = await volej(system, user);
      res[id + '-' + i] = { text: textOf(r.text), model: r.model, out_tokens: r.usage && r.usage.output_tokens };
    })());
  }
  await Promise.all(jobs);
  const sorted = Object.fromEntries(Object.keys(res).sort().map(k => [k, res[k]]));
  fs.writeFileSync(out, JSON.stringify(sorted, null, 1));
  for (const [k, v] of Object.entries(sorted)) console.log(k + ' [' + v.model + ']: ' + v.text);
})().catch(e => { console.error(e.message); process.exit(1); });
