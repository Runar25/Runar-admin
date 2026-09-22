// CODE-read 2026-09-22 — posle IDENTICKY prompt (prompt-en/is.json) vsem modelum, 3× po sobe.
// Meri: tokeny (vcetne cache a reasoning), cenu z oficialnich ceniku, latenci, finish reason, text.
// Klice z ~/.claude/, nikdy se nevypisuji.
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const DIR = __dirname;
const K_ANT = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
const K_OAI = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-openai-key.txt'), 'utf8').trim();

// Ceny USD / 1M tokenu — stazeno 2026-09-22 z oficialnich ceniku:
//   platform.claude.com/docs/en/about-claude/pricing · developers.openai.com/api/docs/pricing
const CENA = {
  'claude-opus-4-8': { in: 5,    w: 6.25, hit: 0.50, out: 25 },
  'claude-opus-5':   { in: 5,    w: 6.25, hit: 0.50, out: 25 },
  'claude-opus-5-5': { in: 4,    w: 5,    hit: 0.20, out: 20 },
  'gpt-5.6-sol':     { in: 4,    hit: 0.40, out: 20 },
  'gpt-6-astra':     { in: 10,   hit: 1.00, out: 50 },
  'gpt-6-sol':       { in: 2,    hit: 0.20, out: 10 },
  'gpt-6-luna':      { in: 0.10, hit: 0.01, out: 0.50 },
};
const FILTR = process.argv.slice(2);
const MODELY = FILTR.length ? FILTR : Object.keys(CENA);
const N = 3;

async function claude(model, p) {
  // Tvar jako claude-proxy: system jako cachovany blok. Opus 4.8 = presne produkce (bez thinking).
  // Opus 5 / 5.5: thinking vypnuty (sonda 2026-09-19: jinak spali max_tokens na thinking a vrati prazdno).
  // 2026-09-22: Opus 5.5 thinking VYPNOUT NEJDE (API: „thinking.type.disabled is not supported… use adaptive +
  // output_config.effort"); nejnizsi povolene je effort 'low'. Prvni beh s fallbackem „bez parametru" nechal
  // model premyslet naplno → 700/700 tokenu a prazdny text. Proto konfigurace per model, zadny tichy fallback.
  const pokusy = model === 'claude-opus-4-8' ? [null]
    : model === 'claude-opus-5-5' ? [{ th: { type: 'adaptive' }, oc: { effort: 'low' } }]
    : [{ th: { type: 'disabled' } }];
  for (const k of pokusy) {
    const th = k && k.th;
    const body = { model, max_tokens: p.max_tokens,
      system: [{ type: 'text', text: p.sys, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: p.user }] };
    if (th) body.thinking = th;
    if (k && k.oc) body.output_config = k.oc;
    const t0 = Date.now();
    const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
      headers: { 'x-api-key': K_ANT, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify(body) });
    const ms = Date.now() - t0;
    const j = await r.json().catch(() => ({}));

    if (!r.ok) return { error: (j.error && j.error.message) || ('HTTP ' + r.status), ms };
    const u = j.usage || {};
    const c = CENA[model];
    const usd = ((u.input_tokens || 0) * c.in + (u.cache_creation_input_tokens || 0) * c.w
      + (u.cache_read_input_tokens || 0) * c.hit + (u.output_tokens || 0) * c.out) / 1e6;
    return { text: (j.content || []).filter(x => x.type === 'text').map(x => x.text).join('').trim(),
      ms, usd, konfig: th ? ('thinking:' + th.type + (k.oc ? ' effort:' + k.oc.effort : '')) : 'bez thinking param',
      thinking_blok: (j.content || []).some(x => x.type === 'thinking'), stop: j.stop_reason, model_vraceny: j.model,
      tok: { in: u.input_tokens, cache_zapis: u.cache_creation_input_tokens || 0, cache_cteni: u.cache_read_input_tokens || 0, out: u.output_tokens } };
  }
}

async function gpt(model, p) {
  // 2026-09-22: gpt-6-astra nebere 'none' ani 'minimal' (API: jen low/medium/high/xhigh). Prvni beh spadl na
  // „bez parametru" = vychozi reasoning → 460–630 reasoning tokenu, 15–20 s, IS 2× useknute. Nejnizsi = low.
  const urovne = model === 'gpt-6-astra' ? ['low'] : ['none', 'minimal', null];
  for (const eff of urovne) {
    const body = { model, max_completion_tokens: p.max_tokens,
      messages: [{ role: 'system', content: p.sys }, { role: 'user', content: p.user }] };
    if (eff) body.reasoning_effort = eff;
    const t0 = Date.now();
    const r = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST',
      headers: { authorization: 'Bearer ' + K_OAI, 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const ms = Date.now() - t0;
    const j = await r.json().catch(() => ({}));
    if (r.status === 400 && eff !== null) continue;
    if (!r.ok) return { error: (j.error && j.error.message) || ('HTTP ' + r.status), ms };
    const u = j.usage || {};
    const cached = (u.prompt_tokens_details && u.prompt_tokens_details.cached_tokens) || 0;
    const reas = (u.completion_tokens_details && u.completion_tokens_details.reasoning_tokens) || 0;
    const c = CENA[model];
    // completion_tokens u OpenAI OBSAHUJE reasoning tokeny → plati se jako vystup
    const usd = (((u.prompt_tokens || 0) - cached) * c.in + cached * c.hit + (u.completion_tokens || 0) * c.out) / 1e6;
    const ch = j.choices && j.choices[0];
    return { text: ((ch && ch.message && ch.message.content) || '').trim(), ms, usd,
      konfig: eff ? 'reasoning_effort:' + eff : 'bez reasoning param', stop: ch && ch.finish_reason, model_vraceny: j.model,
      tok: { in: u.prompt_tokens, cache_cteni: cached, out: u.completion_tokens, reasoning: reas } };
  }
}

(async () => {
  const P = { en: JSON.parse(fs.readFileSync(path.join(DIR, 'prompt-en.json'), 'utf8')),
              is: JSON.parse(fs.readFileSync(path.join(DIR, 'prompt-is.json'), 'utf8')) };
  const SOUB = path.join(DIR, 'vysledky.json');
  const vysl = fs.existsSync(SOUB) ? JSON.parse(fs.readFileSync(SOUB, 'utf8')) : {};
  const retezce = [];
  for (const m of MODELY) for (const lang of ['en', 'is']) retezce.push((async () => {
    // `model@2000` = tyz model s jinym max_tokens (2026-09-22: Opus 5.5 na produkcnich 700 v IS 3/3 bez textu,
    // premysleni sezere cely limit; beh s vyssim limitem ukazuje, co by ho stalo v produkci dotahnout).
    const [id, strop] = m.split('@');
    const pp = strop ? Object.assign({}, P[lang], { max_tokens: +strop }) : P[lang];
    const klic = m + '|' + lang; vysl[klic] = [];
    for (let i = 0; i < N; i++) {               // po sobe: 1. volani = studena cache, 2.–3. = tepla
      const r = await (id.startsWith('claude') ? claude(id, pp) : gpt(id, pp));
      vysl[klic].push(r);
      process.stdout.write((r.error ? 'X' : '.'));
    }
  })());
  await Promise.all(retezce);
  fs.writeFileSync(SOUB, JSON.stringify(vysl, null, 1));
  console.log('\nhotovo → vysledky.json');
  for (const [k, arr] of Object.entries(vysl).filter(([k]) => MODELY.some(m => k.startsWith(m + '|')))) {
    const chyby = arr.filter(x => x.error);
    if (chyby.length) console.log('  CHYBA ' + k + ': ' + chyby[0].error);
  }
})();
