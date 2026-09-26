// CODE-read 2026-09-26: odkud „work“ v Career & Creativity. Rameno A = produkce (podoba [2] bez slova work),
// rameno B = týž prompt bez „Career & “ v řádku oblasti. Opus 5 jako claude-proxy (thinking disabled, system cache).
'use strict';
const fs = require('fs'), path = require('path'), stav = require('./stav.js');
const KEY = fs.readFileSync('C:/Users/zkuku/.claude/runar-api-key.txt', 'utf8').trim();
const OBRAZY = [['Kenaz', 'The shavings curl away from the blade', 3], ['Nauthiz', 'You keep knitting though the yarn is almost out', 2], ['Jera', 'The sweater you knitted all winter is finally finished', 0]];
const OUT = path.join(__dirname, 'pilot_esence1.jsonl');
async function volej(sys, user) {
  const body = { model: 'claude-opus-5', max_tokens: 700, thinking: { type: 'disabled' },
    system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }], messages: [{ role: 'user', content: user }] };
  const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'x-api-key': KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json(); if (!r.ok) throw new Error(JSON.stringify(j));
  const t = j.content.filter(c => c.type === 'text').map(c => c.text).join('');
  let text = t; try { text = JSON.parse(t.slice(t.indexOf('['), t.lastIndexOf(']') + 1))[0].text; } catch (e) {}
  return { text, usage: j.usage };
}
(async () => {
  fs.writeFileSync(OUT, '');
  for (const [runa, img, angle] of OBRAZY) for (const arm of ['C']) for (const k of [1, 2]) {
    const p = stav({ rune: runa, area: 'Career & Creativity', seeking: 'Clarity', image: img, angle, face: 2, essence: 1 });
    let user = p.user;
    if (arm === 'B') { const a = 'The reading is for Career & Creativity — '; if (user.split(a).length !== 2) throw new Error('radek oblasti'); user = user.replace(a, 'The reading is for Creativity — '); }
    const r = await volej(p.sys, user);
    const rec = { runa, arm, k, text: r.text, usage: r.usage };
    fs.appendFileSync(OUT, JSON.stringify(rec) + '\n');
    console.log(runa, arm, k, '|', r.text);
  }
})();
