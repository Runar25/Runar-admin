// CODE-read 2026-09-22 — ITERACE NA JEDNOM CTENI (owner: „napred to udelej na jednom, a zkousej, dokud to nebude
// dobre. Az pak se da udelat vetsi varka. Zkousi se vzdy na malem mnozstvi! Nechci, abys mi bezhlave spalil tokeny.")
// Vezme ulozeny produkcni prompt (prompt-<lang>.json), aplikuje JMENOVANE upravy JEN PRO TEST (produkce se nemeni),
// posle JEDNOU a vypise text + tvrde kontroly. Kazda uprava musi v promptu zasahnout prave jednou, jinak spadne.
//   node iter.js <model> <lang> [uprava,uprava…]
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const DIR = __dirname;
const [MODEL, LANG, UPR = ''] = process.argv.slice(2);
const K_ANT = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
const K_OAI = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-openai-key.txt'), 'utf8').trim();
const CENA = { 'claude-opus-5': { in: 5, w: 6.25, hit: 0.5, out: 25 }, 'gpt-6-sol': { in: 2, hit: 0.2, out: 10 } };

// UPRAVY — kazda = [co najit (regex), cim nahradit, proc]
const UPRAVY = {
  // Glosa v IS hlavicce se propisuje do textu (sol 3/3, Opus 5.5 3/3); EN hlavicka ji nema a v EN ji nenapsal nikdo.
  bezglosy: [/^(DREGNA RÚNA: [^\s(]+) \([^)]*\)/m, '$1', 'IS hlavicka runy bez glosy v zavorce (jako EN)'],
  // Hypoteza 2026-09-22: „astand" (stav) v mostu tahne sol k abstraktnim pojmum (vani, kostur, kyrrstada, bid).
  // Nahrada vyrazem, ktery uz v promptech je a je overeny (Norns landing A): „sagt med ordum myndarinnar".
  // „gaeti verid" zustava → tvar moznosti se nemeni; nic se nepridava, jen se vymeni to, co pojem vyvolava.
  // ZAHOZENO 2026-09-22 po 1 cteni Opus 5: bez „astand sem gaeti att vid" spadl konec cely do obrazu, ztratil
  // „gaeti" i cloveka („önnur greinin fylgir vatninu, hin leggur upp í hlíðina", 46 slov). „Stav" drzel most u cloveka.
  vecne: [/hvort um sig ástand sem gæti átt við/, 'hvort um sig sagt með orðum myndarinnar', 'ZAHOZENO — most: „stav" → „slovy obrazu"'],
  // Krok 3: „stav" NECHAT a pridat „rečeno slovy obrazu" — tvar overeneho Norns landingu A (astand + med ordum
  // myndarinnar), ktery dal vecne konce O CLOVEKU („a house kept ready for company…").
  vecne2: [/hvort um sig ástand sem gæti átt við, honum til umhugsunar\./, 'hvort um sig ástand sem gæti átt við, sagt með orðum myndarinnar, honum til umhugsunar.', 'most: stav zustava + „sagt með orðum myndarinnar"'],
};

const P = JSON.parse(fs.readFileSync(path.join(DIR, 'prompt-' + LANG + '.json'), 'utf8'));
let user = P.user;
for (const u of UPR.split(',').filter(Boolean)) {
  const [re, za, proc] = UPRAVY[u] || [];
  if (!re) throw new Error('neznama uprava: ' + u);
  const n = (user.match(new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')) || []).length;
  if (n !== 1) throw new Error(u + ': zasah ' + n + '×, ne prave jednou');
  const pred = user.split('\n').find(l => re.test(l));
  user = user.replace(re, za);
  const po = user.split('\n').find(l => l.startsWith(pred.slice(0, 12)));
  console.log('UPRAVA ' + u + ' — ' + proc + '\n  pred: ' + pred.slice(0, 120) + '\n  po:   ' + (po || '').slice(0, 120));
}

(async () => {
  const t0 = Date.now(); let text, usd;
  if (MODEL.startsWith('claude')) {
    const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
      headers: { 'x-api-key': K_ANT, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: P.max_tokens, thinking: { type: 'disabled' },
        system: [{ type: 'text', text: P.sys, cache_control: { type: 'ephemeral' } }], messages: [{ role: 'user', content: user }] }) });
    const j = await r.json(); if (!r.ok) throw new Error(JSON.stringify(j.error));
    text = j.content.filter(x => x.type === 'text').map(x => x.text).join('').trim();
    const u = j.usage, c = CENA[MODEL];
    usd = (u.input_tokens * c.in + (u.cache_creation_input_tokens || 0) * c.w + (u.cache_read_input_tokens || 0) * c.hit + u.output_tokens * c.out) / 1e6;
  } else {
    const r = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST',
      headers: { authorization: 'Bearer ' + K_OAI, 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_completion_tokens: P.max_tokens, reasoning_effort: 'none',
        messages: [{ role: 'system', content: P.sys }, { role: 'user', content: user }] }) });
    const j = await r.json(); if (!r.ok) throw new Error(JSON.stringify(j.error));
    text = j.choices[0].message.content.trim();
    const u = j.usage, c = CENA[MODEL], ca = (u.prompt_tokens_details && u.prompt_tokens_details.cached_tokens) || 0;
    usd = ((u.prompt_tokens - ca) * c.in + ca * c.hit + u.completion_tokens * c.out) / 1e6;
  }
  let t = text; try { t = JSON.parse(text.slice(text.indexOf('['), text.lastIndexOf(']') + 1)).map(x => x.text).join(' '); } catch (e) {}
  const vety = t.split(/(?<=[.?!])\s+(?=[A-ZÁÐÉÍÓÚÝÞÆÖ])/);
  const zapis = { kdy: new Date().toISOString(), model: MODEL, lang: LANG, upravy: UPR, text: t, usd };
  fs.appendFileSync(path.join(DIR, 'iterace.jsonl'), JSON.stringify(zapis) + '\n');
  console.log('\n' + MODEL + ' ' + LANG.toUpperCase() + ' [' + (UPR || 'produkce') + ']  $' + usd.toFixed(5) + ' · ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s\n');
  console.log(t);
  console.log('\n  slov ' + t.split(/\s+/).length + ' · vet ' + vety.length + ' · glosa v textu: ' + (/\w+\s*\([^)]+\)/.test(t) ? 'ANO' : 'ne')
    + '\n  posledni veta: ' + vety[vety.length - 1]);
})().catch(e => { console.error('CHYBA: ' + e.message); process.exit(1); });
