// CODE-read 2026-09-22 — ITERACE NORNS ZAVERU u gpt-6-sol, vzdy JEDNO cteni (owner: „zkus ten norns zaver
// u solu, zase na jednom cteni"). Zaklad = varka/norns1-is.json (glosa uz pryc). Upravy JEN pro test.
//   node norns_iter.js <model> <prompt-id> [uprava,uprava…]
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const DIR = path.join(__dirname, 'varka');
const [MODEL, ID, UPR = ''] = process.argv.slice(2);
const K_ANT = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
const K_OAI = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-openai-key.txt'), 'utf8').trim();
const CENA = { 'claude-opus-5': { in: 5, w: 6.25, hit: 0.5, out: 25 }, 'gpt-6-sol': { in: 2, hit: 0.2, out: 10 } };

const UPRAVY = {
  // Krok 1: „Sagt með orðum myndarinnar" stoji v landingu jako SAMOSTATNA veta za teckou (vypada jako obecne
  // pravidlo). V single zabrala tataz fraze az PRIMO u „ástand" (krok 3, 2026-09-22 (2)). Jen presun, nic navic.
  presun: [/hvort um sig ástand sem gæti átt við, honum til umhugsunar\. Sagt með orðum myndarinnar, aldrei spádómur/,
           'hvort um sig ástand sem gæti átt við, sagt með orðum myndarinnar, honum til umhugsunar. Aldrei spádómur'],
  // Krok 2 (obracena paka): presun sam nic neprokazal (klicova slova 1/2 pred i po). Sol bere slova, ktera lezi
  // hned vedle — Norns dava ke kazde rune radek se CTYRMI klicovymi slovy, single jen jedno („focus on"). Test:
  // seznamy pryc. Hlidat obe strany — jestli opisovani prestane A jestli cteni bez nich neztrati runy.
  bezklicu: [/^([A-Z][a-z]+) — .+$/gm, '$1', 3],
};

const P = JSON.parse(fs.readFileSync(path.join(DIR, ID + '.json'), 'utf8'));
let user = P.user;
for (const u of UPR.split(',').filter(Boolean)) {
  const [re, za, cekam = 1] = UPRAVY[u] || [];
  if (!re) throw new Error('neznama uprava: ' + u);
  const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
  const n = (user.match(g) || []).length;
  if (n !== cekam) throw new Error(u + ': zasah ' + n + '×, cekal jsem ' + cekam);
  user = user.replace(g, za);
  console.log('UPRAVA ' + u + ' → ' + user.split('\n').find(l => /^NIÐURLAG|^THE LANDING/.test(l)).slice(0, 400));
}
// klicova slova z radku run (Norns: „<Runa> — a, b, c")
const kw = [...new Set(P.user.split('\n').map(l => l.match(/^[A-Z][a-z]+ — (.+)$/)).filter(Boolean)
  .flatMap(m => m[1].toLowerCase().split(/[^a-záðéíóúýþæö]+/)).filter(w => w.length > 3))];   // 2026-09-23: bylo > 4 → detektor nevidel „gift" ani „gjöf" (§27)

(async () => {
  const t0 = Date.now(); let raw, usd;
  if (MODEL.startsWith('claude')) {
    const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
      headers: { 'x-api-key': K_ANT, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: P.max_tokens, thinking: { type: 'disabled' },
        system: [{ type: 'text', text: P.sys, cache_control: { type: 'ephemeral' } }], messages: [{ role: 'user', content: user }] }) });
    const j = await r.json(); if (!r.ok) throw new Error(JSON.stringify(j.error));
    raw = j.content.filter(x => x.type === 'text').map(x => x.text).join('').trim();
    const u = j.usage, c = CENA[MODEL];
    usd = (u.input_tokens * c.in + (u.cache_creation_input_tokens || 0) * c.w + (u.cache_read_input_tokens || 0) * c.hit + u.output_tokens * c.out) / 1e6;
  } else {
    const r = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST',
      headers: { authorization: 'Bearer ' + K_OAI, 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_completion_tokens: P.max_tokens, reasoning_effort: 'none',
        messages: [{ role: 'system', content: P.sys }, { role: 'user', content: user }] }) });
    const j = await r.json(); if (!r.ok) throw new Error(JSON.stringify(j.error));
    raw = j.choices[0].message.content.trim();
    const u = j.usage, c = CENA[MODEL], ca = (u.prompt_tokens_details && u.prompt_tokens_details.cached_tokens) || 0;
    usd = ((u.prompt_tokens - ca) * c.in + ca * c.hit + u.completion_tokens * c.out) / 1e6;
  }
  let t = raw; try { t = JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1)).map(x => x.text).join(' '); } catch (e) {}
  const v = t.split(/(?<=[.?!])\s+(?=[A-ZÁÐÉÍÓÚÝÞÆÖ])/), posl = v[v.length - 1];
  fs.appendFileSync(path.join(DIR, 'norns-iterace.jsonl'), JSON.stringify({ kdy: new Date().toISOString(), model: MODEL, id: ID, upravy: UPR, text: t, usd }) + '\n');
  console.log('\n' + MODEL + ' · ' + ID + ' [' + (UPR || 'produkce') + ']  $' + usd.toFixed(5) + ' · ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s · ' + t.split(/\s+/).length + ' slov\n');
  console.log(t);
  console.log('\n  ZAVER: ' + posl);
  console.log('  klicova slova v zaveru: ' + (kw.filter(w => posl.toLowerCase().includes(w)).join(', ') || '—')
    + ' · v celem textu: ' + (kw.filter(w => t.toLowerCase().includes(w)).join(', ') || '—'));
})().catch(e => { console.error('CHYBA: ' + e.message); process.exit(1); });
