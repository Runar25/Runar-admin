// CODE-read 2026-09-27 — Vegvísir V3, TEST SCÉNY RAMENE (owner: „pusť test scény ramene"; „píše člověk a vytvoříme svět,
// ze kterého bude moct vybírat… budeme to testovat jednodušeji na statických vstupech… jde o to, jak to Rúnarovi říct").
// Testuje se JEN formulace, jakou scénu a otázku dostane Rúnar (Q1–Q4). Pevné: střed = Gebo jako chůze (varianty kola 2,
// RUNAR_BACKLOG „ŽIVOTNÍ RUNA GEBO"), 4 ramena Isa · Jera · Perth · Raidho (Gebo = životní runa, v sáčku není — DECISIONS
// 2026-08-25), 4 statické scény, nic se nepřenáší, jen EN (owner 2026-09-27). Systémový prompt = produkční buildSysPrompt EN;
// user prompt ramene je TESTOVACÍ konstrukce (Vegvísir v kódu není). Opus 5 jako claude-proxy.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const V = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const KEY = fs.readFileSync('C:/Users/zkuku/.claude/runar-api-key.txt', 'utf8').trim();
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S; S.lang = 'en';
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
vm.createContext(S); vm.runInContext('var userGender="kk"; var corrections=[];', S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-character.js', 'runar-utils.js']) vm.runInContext(fs.readFileSync(V + f, 'utf8') + '\n;\n', S);
const SYS = vm.runInContext('buildSysPrompt(null, "en")', S);
const NOCOLD = vm.runInContext('_noColdRead("en")', S);
const K = n => vm.runInContext('RUNES.filter(function(r){return r.n===' + JSON.stringify(n) + ';})[0].k', S);

const RAMENA = [   // runa · varianta chůze Gebo (kolo 2) · CESTA, jak ji člověk vybere ze statického světa (owner: „jedu na lodi po moři")
  ['Isa', 'goes at a pace neither side sets alone', "I'm crossing a river on stepping stones."],
  ['Jera', 'whatever he leans on has to lean back the same amount', "I'm climbing a steep path up a mountain."],
  ['Perth', 'what goes out from him and what comes back are the same weight', "I'm sailing a boat on the sea."],
  ['Raidho', 'meets it halfway, and halfway is where he stops', "I'm walking through a forest at dusk."],
];
// C = se středem (životní runa Gebo jako chůze) · B = bez středu. Cesta vlastními slovy, žádná otázka na vztah (owner 2026-09-27).
const FORM = { C: true, B: false };
function prompt(r, q) {
  return [
    FORM[q] ? 'VEGVÍSIR — one arm of the seeker’s way. Their own rune, the centre that is not drawn, is Gebo. It goes like this: ' + r[1] + '.' : 'VEGVÍSIR — one arm of the seeker’s way.',
    'DRAWN FOR THIS ARM: ' + r[0] + ' — ' + K(r[0]) + '.',
    'The seeker writes the way they are going: "' + r[2] + '"',
    'Answer as Rúnar in about 90 words, one flowing paragraph of prose. Their way is the only picture — stay inside it. Never end on what it means for them or on what they should do; leave it open.',
    NOCOLD,
  ].join('\n');
}
async function volej(user) {
  const body = { model: 'claude-opus-5', max_tokens: 400, thinking: { type: 'disabled' }, system: [{ type: 'text', text: SYS, cache_control: { type: 'ephemeral' } }], messages: [{ role: 'user', content: user }] };
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'x-api-key': KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await res.json(); if (!res.ok) throw new Error(JSON.stringify(j));
  return { text: j.content.filter(c => c.type === 'text').map(c => c.text).join('').trim(), usage: j.usage };
}
if (require.main === module) (async () => {
  if (process.argv[2] === '--ukaz') { console.log('=== SYS ===\n' + SYS + '\n=== USER (Perth, C) ===\n' + prompt(RAMENA[2], 'C')); return; }
  const OUT = path.join(__dirname, 'cesta.jsonl'); fs.writeFileSync(OUT, '');
  for (const q of Object.keys(FORM)) for (const r of RAMENA) {
    const x = await volej(prompt(r, q));
    fs.appendFileSync(OUT, JSON.stringify({ q, runa: r[0], scena: r[2], stred: r[1], text: x.text, usage: x.usage }) + '\n');
    console.log(q, r[0].padEnd(7), '|', x.text.replace(/\n+/g, ' '));
  }
})();
module.exports = { prompt, RAMENA, FORM };
