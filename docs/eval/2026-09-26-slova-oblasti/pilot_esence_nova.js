// CODE-read 2026-09-26: esenční rámec [1] — produkce (P) × nové znění (N, runa jmenovaná významem, který obraz obsahuje).
// Obrazy, ve kterých jedná něco jiného než runa (vichr, ruka, pletoucí, hlas, dávající). Opus 5 jako claude-proxy.
'use strict';
const fs = require('fs'), path = require('path'), stav = require('./stav.js');
const KEY = fs.readFileSync('C:/Users/zkuku/.claude/runar-api-key.txt', 'utf8').trim();
const NOVA = 'THE ESSENCE LINE: after the picture, one short line that names the rune once and says what it is in this scene — the meaning that already lives in the picture. Plain words a stranger to runes can grasp. No invented mechanism, no fate. Never tell the seeker what it means for them.';
const OBRAZY = [
  ['Hagalaz', 'In the night the gale tore the old fence down', 'Crossroads & Decisions', 'Reflection', 1],
  ['Kenaz', 'The shavings curl away from the blade', 'Career & Creativity', 'Reflection', 3],
  ['Jera', 'The sweater you knitted all winter is finally finished', 'Inner Growth', 'Clarity', 0],
  ['Nauthiz', 'You keep knitting though the yarn is almost out', 'Healing & Wellbeing', 'Insight into Challenge', 2],
  ['Ansuz', 'Someone calls your name across the crowd', 'Love & Relationships', 'Confirmation', 5],
  ['Gebo', 'One hand holds something out, and the other receives it', 'Love & Relationships', 'General Guidance', 6],
];
const OUT = path.join(__dirname, 'pilot_esence_nova.jsonl');
async function volej(sys, user) {
  const body = { model: 'claude-opus-5', max_tokens: 700, thinking: { type: 'disabled' }, system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }], messages: [{ role: 'user', content: user }] };
  const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'x-api-key': KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await r.json(); if (!r.ok) throw new Error(JSON.stringify(j));
  const t = j.content.filter(c => c.type === 'text').map(c => c.text).join('');
  let text = t; try { text = JSON.parse(t.slice(t.indexOf('['), t.lastIndexOf(']') + 1))[0].text; } catch (e) {}
  return { text, usage: j.usage };
}
(async () => {
  fs.writeFileSync(OUT, '');
  for (const [runa, img, area, seek, angle] of OBRAZY) for (const arm of ['P', 'N']) {
    const o = { rune: runa, area, seeking: seek, image: img, angle, face: 0 };
    if (arm === 'P') o.essence = 1; else o.essenceText = NOVA;
    const p = stav(o);
    if (arm === 'N' && !p.user.includes(NOVA)) throw new Error('nove zneni neni v promptu');
    if (arm === 'P' && !p.user.includes('is the one doing something in that scene')) throw new Error('ramec [1] neni v promptu');
    const r = await volej(p.sys, p.user);
    fs.appendFileSync(OUT, JSON.stringify({ runa, img, arm, text: r.text, usage: r.usage }) + '\n');
    console.log(runa.padEnd(8), arm, '|', r.text);
  }
})();
