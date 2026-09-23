// CODE-read 2026-09-23 — DALSI ZNENI vety za obrazem na JEDNOM promptu (owner: „zkus to jiné znění na jednom čtení").
// Zamitnute „look closer…" melo prevideni, ale model ho opakoval doslova („Look closer, and you see…" 4× na Opusu).
// Nove zneni: zadne sloveso, ktere jde zopakovat posluchaci; misto toho ownerem potvrzena formule (memory
// co-dela-cteni-silnym bod 4: veta musi ukazat neco, co v obrazu NENI).
//   node opis_iter.js <id promptu z opis2> <zneni> [opakovani=3]
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const { zmer } = require('./kopie.js');
const { najdi } = require('./runa_jedna.js');
const K_ANT = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
const K_OAI = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-openai-key.txt'), 'utf8').trim();
const [ID, ZNENI, REP = '3'] = process.argv.slice(2);
const PROD = '. Let it become your own seeing in the text.';
const ZNENI_MAP = {
  detail: '. Let it become your own seeing in the text, down to one detail the sentence does not name.',
};
// Uhel [4] × ZVUKOVY obraz (owner 2026-09-23: „nemuze byt pouzito pro zvukove obrazy"): misto vyluky precedens uhlu [2]
// („If nothing moves, open with the stillness itself") = vestavena vyjimka ve vete uhlu. Meni se UHEL, veta obrazu zustava.
const NAHRADY = {
  uhel4zvuk: ['Open with the part of the image that is out of sight — under it, behind it, or not yet arrived.',
    'Open with the part of the image that is out of sight — under it, behind it, or not yet arrived. If the image lives in sound, open with what is heard but not seen.'],
};
const P = JSON.parse(fs.readFileSync(path.join(__dirname, 'opis2', ID + '.json'), 'utf8'));
if (P.ramena.prod.split(PROD).length !== 2) throw new Error('produkcni veta ne prave 1×');
let user;
if (NAHRADY[ZNENI]) { const [z, na] = NAHRADY[ZNENI]; if (P.ramena.prod.split(z).length !== 2) throw new Error(ZNENI + ': ne prave 1×'); user = P.ramena.prod.replace(z, na); ZNENI_MAP[ZNENI] = na; }
else user = P.ramena.prod.replace(PROD, ZNENI_MAP[ZNENI]);
const CENA = { 'claude-opus-4-8': { in: 5, w: 6.25, hit: 0.5, out: 25 }, 'gpt-6-sol': { in: 2, hit: 0.2, out: 10 } };
async function volej(model) {
  if (model.startsWith('claude')) {
    const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
      headers: { 'x-api-key': K_ANT, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model, max_tokens: P.max_tokens, system: [{ type: 'text', text: P.sys, cache_control: { type: 'ephemeral' } }], messages: [{ role: 'user', content: user }] }) });
    const j = await r.json(); if (!r.ok) throw new Error(JSON.stringify(j.error)); const u = j.usage, c = CENA[model];
    return { raw: j.content.filter(x => x.type === 'text').map(x => x.text).join(''), usd: (u.input_tokens * c.in + (u.cache_creation_input_tokens || 0) * c.w + (u.cache_read_input_tokens || 0) * c.hit + u.output_tokens * c.out) / 1e6 };
  }
  const r = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', headers: { authorization: 'Bearer ' + K_OAI, 'content-type': 'application/json' },
    body: JSON.stringify({ model, max_completion_tokens: P.max_tokens, reasoning_effort: 'none', messages: [{ role: 'system', content: P.sys }, { role: 'user', content: user }] }) });
  const j = await r.json(); if (!r.ok) throw new Error(JSON.stringify(j.error)); const u = j.usage, c = CENA[model], ca = (u.prompt_tokens_details && u.prompt_tokens_details.cached_tokens) || 0;
  return { raw: j.choices[0].message.content, usd: ((u.prompt_tokens - ca) * c.in + ca * c.hit + u.completion_tokens * c.out) / 1e6 };
}
const txt = raw => { try { return JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1)).map(x => x.text).join(' ').trim(); } catch (e) { return null; } };
const IMP = /(^|[.?!]\s+)(Look|See|Notice|Listen|Watch|Feel|Bend|Lean|Step)\b/;
function popis(t) {
  const m = zmer(t, 'comes from here: ' + P.obraz + '. Let it become');
  // Hranice slov jako (?<![a-z]) / (?![a-z]): Python patch z \b udelal znak backspace a pocitadlo tise ukazovalo 0 (zachyceno 2026-09-23).
  const zvuk = (t.match(/(?<![a-z])(hear|heard|hears|hearing|sound|sounds|listen\w*|ears?|murmur\w*|voice|rings?|note|trickl\w*|gurgl\w*)(?![a-z])/gi) || []).length;
  return 'zvuk ' + zvuk + ' · usek ' + m.beh + ' („' + m.usek + '") · v1 ' + m.v1 + ' · slov ' + t.split(/\s+/).length + ' · rozkaz ' + (IMP.test(t) ? 'ANO' : 'ne')
    + ' · runa jedna: ' + (najdi(t, P.runa).join(' | ') || '—');
}
(async () => {
  console.log('PROMPT ' + ID + ' · obraz: ' + P.obraz + '\nZNENI: ' + ZNENI_MAP[ZNENI] + '\n');
  const V = fs.readFileSync(path.join(__dirname, 'opis2', 'vysledky.jsonl'), 'utf8').trim().split('\n').map(JSON.parse).filter(x => x.id === ID && x.text);
  const out = []; let usd = 0;
  const ukoly = []; for (const model of ['claude-opus-4-8', 'gpt-6-sol']) for (let i = 1; i <= +REP; i++) ukoly.push(model);
  const res = await Promise.all(ukoly.map(async model => { const o = await volej(model); usd += o.usd; return { model, text: txt(o.raw) || o.raw }; }));
  for (const model of ['claude-opus-4-8', 'gpt-6-sol']) {
    console.log('=== ' + model);
    for (const x of V.filter(v => v.model === model)) console.log('[varka ' + x.rameno + ' r' + x.rep + '] ' + popis(x.text));
    for (const r of res.filter(r => r.model === model)) { console.log('\n[' + ZNENI + '] ' + popis(r.text) + '\n  ' + r.text); out.push(Object.assign({ id: ID, zneni: ZNENI }, r)); }
    console.log('');
  }
  fs.appendFileSync(path.join(__dirname, 'opis-iter.jsonl'), out.map(o => JSON.stringify(o)).join('\n') + '\n');
  console.log('$' + usd.toFixed(3));
})().catch(e => { console.error('CHYBA ' + e.message); process.exit(1); });
