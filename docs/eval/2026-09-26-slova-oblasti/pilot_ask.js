// CODE-read 2026-09-26: Ask u Kenaz (report 2026-09-25 21:12). F = produkce (celý seznam klíčů runy), G = navíc aspekt, ze kterého čtení vzniklo.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), stav = require('./stav.js');
const KEY = fs.readFileSync('C:/Users/zkuku/.claude/runar-api-key.txt', 'utf8').trim();
// Text ownerova cteni a jeho otazka jen lokalne (ownerova data do repa nejdou).
const VSTUP = JSON.parse(fs.readFileSync('C:/Users/zkuku/runar-eval/oblast/ask_vstup.json', 'utf8'));
const CTENI = VSTUP.cteni, Q = VSTUP.otazka;
const OUT = 'C:/Users/zkuku/runar-eval/oblast/pilot_ask.jsonl';   // odpovedi na ownerovu otazku — lokalne
async function volej(sys, user) {
  const body = { model: 'claude-opus-5', max_tokens: 320, thinking: { type: 'disabled' }, system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }], messages: [{ role: 'user', content: user }] };
  const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'x-api-key': KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json(); if (!r.ok) throw new Error(JSON.stringify(j));
  return { text: j.content.filter(c => c.type === 'text').map(c => c.text).join('').trim(), usage: j.usage };
}
(async () => {
  const s = stav({ rune: 'Kenaz', area: null, seeking: 'Clarity' });
  const user = vm.runInContext('buildAskPrompt(' + JSON.stringify(CTENI) + ',' + JSON.stringify(Q) + ',"Kenaz","en",[],RUNES.filter(function(r){return r.n==="Gebo";})[0],{area:"Career & Creativity",seeking:"Reflection"},{mode:"single",runy:["Kenaz"]})', s.S);
  const a = 'Runes drawn: Kenaz — torch, inner light, creativity, knowledge, fire.';
  if (user.split(a).length !== 2) throw new Error('radek run: ' + user.slice(0, 600));
  fs.writeFileSync(OUT, ''); fs.writeFileSync('C:/Users/zkuku/runar-eval/oblast/ask_prompt_F.txt', s.sys + '\n=====\n' + user);
  for (const arm of ['F', 'G']) for (const k of [1, 2, 3]) {
    const u = arm === 'F' ? user : user.replace(a, 'Runes drawn: Kenaz — in this reading: creativity (its other senses: torch, inner light, knowledge, fire).');
    const r = await volej(s.sys, u);
    fs.appendFileSync(OUT, JSON.stringify({ arm, k, text: r.text, usage: r.usage }) + '\n');
    console.log(arm, k, '|', r.text.replace(/\n+/g, ' '));
  }
})();
