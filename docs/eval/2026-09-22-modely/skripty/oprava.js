// CODE-read 2026-09-23 — TEST OPRAVNEHO PRUCHODU islandstiny po vygenerovani (owner: „udelej ten test… ja se ptam,
// jake je nejlepsi reseni"). Hotove IS cteni dostane korektor (gpt-6-sol — v testech 0 IS chyb na 10 textu, nejlevnejsi)
// se zadanim opravit JEN jasne gramaticke chyby. Meri se: opravi 7 znamych chyb? pokazi neco v 12 cistych textech?
// kolik to stoji a jak dlouho to trva.
//   node oprava.js <vse|chybne|ciste|index> [uroven]
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const DIR = __dirname;
const K_OAI = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-openai-key.txt'), 'utf8').trim();
const [CO = 'vse', UROVEN = 'none'] = process.argv.slice(2);

const ZADANI = `You are a careful native-level Icelandic proofreader. The user message is a short Icelandic text (a rune reading, read aloud).
Correct ONLY clear grammatical errors: wrong case, gender or number agreement; wrong verb or preposition government;
word forms that do not exist; collocations or idioms that Icelandic does not use.
Do NOT change style, rhythm, word choice, imagery, punctuation or meaning. Do not improve or rephrase. Keep the name Kuky.
If there is no clear error, return the text exactly unchanged with an empty change list.
Return ONLY JSON: {"text": "<the full corrected text>", "changes": [{"from": "<exact original words>", "to": "<replacement>", "why": "<short reason>"}]}`;

const chybne = JSON.parse(fs.readFileSync(path.join(DIR, 'oprava-chybne.json'), 'utf8'));
const Zv = fs.readFileSync(path.join(DIR, 'varka', 'vysledky.jsonl'), 'utf8').trim().split('\n').map(l => JSON.parse(l)).filter(z => !z.error);
const posl = {}; for (const z of Zv) posl[z.model + '|' + z.id] = z;
const CISTE = ['gpt-6-sol|single-gebo-is-g2', 'gpt-6-sol|single-laguz-is-g2', 'gpt-6-sol|single-algiz-is-g2', 'gpt-6-sol|single-jera-is-g2',
  'gpt-6-sol|single-ansuz-is-g2', 'claude-opus-5|single-gebo-is-g2', 'claude-opus-5|single-laguz-is-g2', 'claude-opus-5|single-jera-is-g2',
  'claude-opus-5|single-ansuz-is-g2', 'gpt-6-sol|norns1-is', 'gpt-6-sol|norns2-is', 'claude-opus-5|norns1-is'];
const vse = chybne.map(o => ({ src: o.src, chyba: o.chyba, text: o.text }))
  .concat(CISTE.map(k => ({ src: k, chyba: null, text: posl[k].text })));
const vyber = CO === 'vse' ? vse : CO === 'chybne' ? vse.filter(x => x.chyba) : CO === 'ciste' ? vse.filter(x => !x.chyba) : [vse[+CO]];

async function oprav(t) {
  const t0 = Date.now();
  const body = { model: 'gpt-6-sol', max_completion_tokens: 900, response_format: { type: 'json_object' },
    messages: [{ role: 'system', content: ZADANI }, { role: 'user', content: t }] };
  if (UROVEN !== 'default') body.reasoning_effort = UROVEN;
  const r = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST',
    headers: { authorization: 'Bearer ' + K_OAI, 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json(); if (!r.ok) return { error: JSON.stringify(j.error) };
  const u = j.usage, ca = (u.prompt_tokens_details && u.prompt_tokens_details.cached_tokens) || 0;
  const usd = ((u.prompt_tokens - ca) * 2 + ca * 0.2 + u.completion_tokens * 10) / 1e6;
  let o; try { o = JSON.parse(j.choices[0].message.content); } catch (e) { return { error: 'neni JSON: ' + j.choices[0].message.content.slice(0, 120) }; }
  return { opraveno: o.text, zmeny: o.changes || [], usd, ms: Date.now() - t0 };
}
(async () => {
  const hotovo = await Promise.all(vyber.map(async x => Object.assign({}, x, await oprav(x.text), { uroven: UROVEN })));
  fs.appendFileSync(path.join(DIR, 'oprava-vysledky.jsonl'), hotovo.map(h => JSON.stringify(h)).join('\n') + '\n');
  for (const h of hotovo) {
    if (h.error) { console.log('CHYBA ' + h.src + ': ' + h.error); continue; }
    const beze = h.opraveno.trim() === h.text.trim();
    console.log('\n[' + h.src + '] ' + (h.chyba ? 'ZNAMA CHYBA: ' + h.chyba : 'cisty') + ' · ' + (beze ? 'BEZ ZMENY' : 'ZMENENO') + ' · $' + h.usd.toFixed(5) + ' · ' + (h.ms / 1000).toFixed(1) + ' s');
    for (const z of h.zmeny) console.log('   „' + z.from + '" → „' + z.to + '"  (' + z.why + ')');
    if (!beze && !h.zmeny.length) console.log('   ⚠️ text se zmenil, ale zmeny nejsou vypsane');
  }
})();
