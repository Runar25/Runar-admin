// CODE-read 2026-09-22 — posle pripravene prompty z varka/*.json JEDNOU danemu modelu. Stejne volani jako run.js
// (Opus 5: thinking disabled · gpt-6-sol: reasoning none). Vysledky pripisuje do varka/vysledky.jsonl.
//   node varka_run.js <model> <id|all> [id…]
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const DIR = path.join(__dirname, 'ident2');   // vetsi beh identity 2026-09-23
const [MODEL, ...IDS] = process.argv.slice(2);
const K_ANT = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
const K_OAI = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-openai-key.txt'), 'utf8').trim();
const CENA = { 'claude-opus-5': { in: 5, w: 6.25, hit: 0.5, out: 25 }, 'gpt-6-sol': { in: 2, hit: 0.2, out: 10 } };
const ids = IDS[0] === 'all' ? fs.readdirSync(DIR).filter(f => /^(single|norns).*\.json$/.test(f)).map(f => f.replace('.json', '')) : IDS;

async function jedno(p) {
  const t0 = Date.now(); let raw, usd, tok;
  if (MODEL.startsWith('claude')) {
    const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
      headers: { 'x-api-key': K_ANT, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: p.max_tokens, thinking: { type: 'disabled' },
        system: [{ type: 'text', text: p.sys, cache_control: { type: 'ephemeral' } }], messages: [{ role: 'user', content: p.user }] }) });
    const j = await r.json(); if (!r.ok) return { error: JSON.stringify(j.error) };
    raw = j.content.filter(x => x.type === 'text').map(x => x.text).join('').trim();
    const u = j.usage, c = CENA[MODEL];
    usd = (u.input_tokens * c.in + (u.cache_creation_input_tokens || 0) * c.w + (u.cache_read_input_tokens || 0) * c.hit + u.output_tokens * c.out) / 1e6;
    tok = { in: u.input_tokens + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0), out: u.output_tokens, stop: j.stop_reason };
  } else {
    const r = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST',
      headers: { authorization: 'Bearer ' + K_OAI, 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_completion_tokens: p.max_tokens, reasoning_effort: 'none',
        messages: [{ role: 'system', content: p.sys }, { role: 'user', content: p.user }] }) });
    const j = await r.json(); if (!r.ok) return { error: JSON.stringify(j.error) };
    raw = j.choices[0].message.content.trim();
    const u = j.usage, c = CENA[MODEL], ca = (u.prompt_tokens_details && u.prompt_tokens_details.cached_tokens) || 0;
    usd = ((u.prompt_tokens - ca) * c.in + ca * c.hit + u.completion_tokens * c.out) / 1e6;
    tok = { in: u.prompt_tokens, out: u.completion_tokens, stop: j.choices[0].finish_reason };
  }
  let beaty = null, text = raw;
  try { beaty = JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1)); text = beaty.map(x => x.text).join(' '); } catch (e) {}
  return { raw, text, beaty: beaty && beaty.map(x => x.rune), usd, tok, ms: Date.now() - t0 };
}

(async () => {
  const hotovo = await Promise.all(ids.map(async id => {
    const p = JSON.parse(fs.readFileSync(path.join(DIR, id + '.json'), 'utf8'));
    const r = await jedno(p);
    const z = Object.assign({ kdy: new Date().toISOString(), model: MODEL, id, lang: p.lang, spread: p.spread, runy: p.runy, upravy: p.upravy }, r);
    fs.appendFileSync(path.join(DIR, 'vysledky.jsonl'), JSON.stringify(z) + '\n');
    return z;
  }));
  for (const z of hotovo) {
    if (z.error) { console.log('CHYBA ' + z.id + ': ' + z.error); continue; }
    const slov = z.text.split(/\s+/).length;
    console.log('\n[' + MODEL + ' · ' + z.id + '] ' + slov + ' slov · $' + z.usd.toFixed(5) + ' · ' + (z.ms / 1000).toFixed(1) + ' s · stop ' + z.tok.stop
      + (z.beaty ? ' · beaty ' + z.beaty.join('/') : '') + ' · glosa: ' + (/\b[A-Z][a-z]+\s*\([^)]+\)/.test(z.text) ? 'ANO' : 'ne'));
    console.log(z.text);
  }
})();
