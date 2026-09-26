// CODE-read 2026-09-26: esence bez spony „<runa> is that…“ — dvě znění (N2, N3) na týchž 6 obrazech jako pilot_esence_nova.js;
// + Blank se jménem „the blank rune“ v promptu (owner: holé „Blank“ se dá zaměnit). Opus 5 jako claude-proxy.
'use strict';
const fs = require('fs'), path = require('path'), stav = require('./stav.js');
const KEY = fs.readFileSync('C:/Users/zkuku/.claude/runar-api-key.txt', 'utf8').trim();
const ZNENI = {
  N4: 'THE ESSENCE LINE: after the picture, one short line about the scene that names the rune once inside it — not as the subject of the sentence — and lets that line carry the meaning the picture already holds, in plain words a stranger to runes can grasp. No invented mechanism, no fate. Never tell the seeker what it means for them.',
};
const OBRAZY = [
  ['Hagalaz', 'In the night the gale tore the old fence down', 'Crossroads & Decisions', 'Reflection', 1],
  ['Kenaz', 'The shavings curl away from the blade', 'Career & Creativity', 'Reflection', 3],
  ['Jera', 'The sweater you knitted all winter is finally finished', 'Inner Growth', 'Clarity', 0],
  ['Nauthiz', 'You keep knitting though the yarn is almost out', 'Healing & Wellbeing', 'Insight into Challenge', 2],
  ['Ansuz', 'Someone calls your name across the crowd', 'Love & Relationships', 'Confirmation', 5],
  ['Gebo', 'One hand holds something out, and the other receives it', 'Love & Relationships', 'General Guidance', 6],
];
const BLANK = [['You leaf through the guestbook in the mountain hut', 'Purpose & Path', 'Clarity', 1],
  ['You look for the valley\'s name on the map', 'Crossroads & Decisions', 'Reflection', 0],
  ['The thick fog hides the fjord', 'The Unseen', 'General Guidance', 5]];
const OUT = path.join(__dirname, 'pilot_esence_4.jsonl');
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
  for (const arm of ['N4']) for (const [runa, img, area, seek, angle] of OBRAZY) {
    const p = stav({ rune: runa, area, seeking: seek, image: img, angle, face: 0, essenceText: ZNENI[arm] });
    if (!p.user.includes(ZNENI[arm])) throw new Error('zneni neni v promptu');
    const r = await volej(p.sys, p.user);
    fs.appendFileSync(OUT, JSON.stringify({ runa, img, arm, text: r.text, usage: r.usage }) + '\n');
    console.log(arm, runa.padEnd(8), '|', r.text);
  }
})();
