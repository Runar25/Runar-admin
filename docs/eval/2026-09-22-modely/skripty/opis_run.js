// CODE-read 2026-09-23 — spusti varku opis2/*.json: kazdy prompt × rameno (prod|nova) × model × opakovani.
// Opus 4.8 = PRODUKCE (claude-proxy MODELS[0]): bez thinking, system s cache_control — jako proxy. gpt-6-sol: reasoning none.
// Pokracuje, kde skoncil (klic uz v vysledky.jsonl se preskoci). Soubezne max 6 volani.
//   node opis_run.js [opakovani=2] [filtr-id]
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const DIR = path.join(__dirname, 'opis2');
const K_ANT = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
const K_OAI = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-openai-key.txt'), 'utf8').trim();
const [REP = '2', FILTR = '', RAMENA = 'prod,nova'] = process.argv.slice(2);   // 2026-09-23: + rameno 'detail' (znění „one detail")
const MODELY = ['gpt-6-sol', 'claude-opus-4-8'];
const CENA = { 'claude-opus-4-8': { in: 5, w: 6.25, hit: 0.5, out: 25 }, 'gpt-6-sol': { in: 2, hit: 0.2, out: 10 } };
const OUTF = path.join(DIR, 'vysledky.jsonl');
const hotovo = new Set(fs.existsSync(OUTF) ? fs.readFileSync(OUTF, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l)).filter(x => !x.error).map(x => x.klic) : []);

async function volej(model, sys, user, maxTok) {
  if (model.startsWith('claude')) {
    const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
      headers: { 'x-api-key': K_ANT, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model, max_tokens: maxTok, system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: user }] }) });
    const j = await r.json(); if (!r.ok) throw new Error(JSON.stringify(j.error));
    const u = j.usage, c = CENA[model];
    return { raw: j.content.filter(x => x.type === 'text').map(x => x.text).join('').trim(), stop: j.stop_reason,
      usd: (u.input_tokens * c.in + (u.cache_creation_input_tokens || 0) * c.w + (u.cache_read_input_tokens || 0) * c.hit + u.output_tokens * c.out) / 1e6 };
  }
  const r = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST',
    headers: { authorization: 'Bearer ' + K_OAI, 'content-type': 'application/json' },
    body: JSON.stringify({ model, max_completion_tokens: maxTok, reasoning_effort: 'none',
      messages: [{ role: 'system', content: sys }, { role: 'user', content: user }] }) });
  const j = await r.json(); if (!r.ok) throw new Error(JSON.stringify(j.error));
  const u = j.usage, c = CENA[model], ca = (u.prompt_tokens_details && u.prompt_tokens_details.cached_tokens) || 0;
  return { raw: j.choices[0].message.content.trim(), stop: j.choices[0].finish_reason, usd: ((u.prompt_tokens - ca) * c.in + ca * c.hit + u.completion_tokens * c.out) / 1e6 };
}
function text(raw) {
  try { return JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1)).map(x => x.text).join(' ').trim(); } catch (e) { return null; }
}

const ukoly = [];
for (const f of fs.readdirSync(DIR).filter(f => /^\d\d-.+\.json$/.test(f) && f.includes(FILTR)).sort()) {
  const P = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  for (let rep = 1; rep <= +REP; rep++) for (const model of MODELY) for (const rameno of RAMENA.split(',')) {
    const klic = [P.id, model, rameno, rep].join('|');
    if (!hotovo.has(klic)) ukoly.push({ P, model, rameno, rep, klic });
  }
}
console.log('ukolu ' + ukoly.length + ' (hotovo drive ' + hotovo.size + ')');
let i = 0, usd = 0, chyb = 0;
async function worker() {
  while (i < ukoly.length) {
    const u = ukoly[i++];
    let zapis;
    try {
      const o = await volej(u.model, u.P.sys, u.P.ramena[u.rameno], u.P.max_tokens);
      const t = text(o.raw); usd += o.usd;
      zapis = { klic: u.klic, id: u.P.id, model: u.model, rameno: u.rameno, rep: u.rep, text: t, raw: t ? undefined : o.raw, stop: o.stop, usd: o.usd };
      if (!t) chyb++;
    } catch (e) { zapis = { klic: u.klic, id: u.P.id, model: u.model, rameno: u.rameno, rep: u.rep, error: e.message.slice(0, 300) }; chyb++; }
    fs.appendFileSync(path.join(DIR, 'vysledky.jsonl'), JSON.stringify(zapis) + '\n');
  }
}
(async () => {
  await Promise.all(Array.from({ length: 6 }, worker));
  console.log('hotovo · $' + usd.toFixed(3) + ' · chyb/neparsovano ' + chyb);
})();
