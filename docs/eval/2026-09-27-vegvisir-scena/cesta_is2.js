// CODE-read 2026-09-27 — Vegvísir: rameno jako CESTA, BEZ středu (owner: „ano, bez středu. pusť IS test").
// IS: 4 cesty × 2 texty (variabilita), prompt psaný islandsky od základu, ověřený korpusem + is-grammar-qa (EVAL_LOG 2026-09-27 (3)).
// EN: tytéž 4 cesty jednou, hlavička bez slova „arm" (prosakovalo 3/8, EVAL_LOG 2026-09-27 (2)).
// Systémový prompt produkční (buildSysPrompt), IS navíc produkční blok korekcí z DB (getCorrPrompt) a oslovení (kk).
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const V = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const KEY = fs.readFileSync('C:/Users/zkuku/.claude/runar-api-key.txt', 'utf8').trim();
const KOREKCE = JSON.parse(fs.readFileSync(path.join(__dirname, 'korekce.json'), 'utf8'));   // živé runar_corrections (DB 2026-09-27)
function ctx(lang) {
  const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S; S.lang = lang;
  S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
  S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
  vm.createContext(S); vm.runInContext('var userGender="kk"; var corrections=[];', S);
  for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-character.js', 'runar-utils.js']) vm.runInContext(fs.readFileSync(V + f, 'utf8') + '\n;\n', S);
  return S;
}
const C = { en: ctx('en'), is: ctx('is') };
const K = (lang, n) => vm.runInContext('(function(r){return ' + (lang === 'is' ? 'r.k_is' : 'r.k') + ';})(RUNES.filter(function(r){return r.n===' + JSON.stringify(n) + ';})[0])', C[lang]);
const CESTY = [
  ['Isa', "I'm crossing a river on stepping stones.", 'Ég fer yfir ána á steinum.'],
  ['Jera', "I'm climbing a steep path up a mountain.", 'Ég geng brattan stíg upp á fjall.'],
  ['Perth', "I'm sailing a boat on the sea.", 'Ég sigli bát úti á sjó.'],
  ['Raidho', "I'm walking through a forest at dusk.", 'Ég geng í gegnum skóg í rökkrinu.'],
];
function prompt(lang, c) {
  const S = C[lang];
  if (lang === 'is') return [
    'VEGVÍSIR — leitandinn er á leið sinni.',
    'RÚNIN: ' + c[0] + ' — ' + K('is', c[0]) + '.',
    'Leitandinn skrifar leiðina sem hann fer: „' + c[2] + '“',
    'Skrifaðu einn samfelldan texta, um níutíu orð. Haltu þig við leiðina sem hann skrifaði. Síðasta setningin segir frá leiðinni sjálfri, ekki frá því hvað hún þýðir eða hvað hann ætti að gera.',
    vm.runInContext('_noColdRead("is")', S),
    vm.runInContext('getCorrPrompt("is", normalizeCorrections(' + JSON.stringify(KOREKCE) + '))', S),
    vm.runInContext('_addressContext("is")', S),
  ].filter(Boolean).join('\n');
  return [
    'VEGVÍSIR — the seeker is on their way.',
    'DRAWN RUNE: ' + c[0] + ' — ' + K('en', c[0]) + '.',
    'The seeker writes the way they are going: "' + c[1] + '"',
    'Answer as Rúnar in about 90 words, one flowing paragraph of prose. Their way is the only picture — stay inside it. Never end on what it means for them or on what they should do; leave it open.',
    vm.runInContext('_noColdRead("en")', S),
  ].join('\n');
}
async function volej(lang, user) {
  const sys = vm.runInContext('buildSysPrompt(null, ' + JSON.stringify(lang) + ')', C[lang]);
  const body = { model: 'claude-opus-5', max_tokens: 500, thinking: { type: 'disabled' }, system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }], messages: [{ role: 'user', content: user }] };
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'x-api-key': KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await res.json(); if (!res.ok) throw new Error(JSON.stringify(j));
  return { text: j.content.filter(x => x.type === 'text').map(x => x.text).join('').trim(), usage: j.usage };
}
(async () => {
  if (process.argv[2] === '--ukaz') { console.log(prompt('is', CESTY[2]) + '\n=====\n' + prompt('en', CESTY[2])); return; }
  const p = prompt('is', CESTY[0]);
  if (!/þig vantar/.test(p) || !/KARLKYNI/.test(p)) throw new Error('IS prompt bez korekci nebo osloveni');
  const OUT = path.join(__dirname, 'cesta_is2.jsonl'); fs.writeFileSync(OUT, '');
  const beh = [];
  for (const c of CESTY) { beh.push(['is', c, 1], ['is', c, 2]); }
  // EN beze zmeny (kolo 1)
  for (const [lang, c, k] of beh) {
    const x = await volej(lang, prompt(lang, c));
    fs.appendFileSync(OUT, JSON.stringify({ lang, runa: c[0], cesta: lang === 'is' ? c[2] : c[1], k, text: x.text, usage: x.usage }) + '\n');
    console.log(lang, c[0].padEnd(7), k, '|', x.text.replace(/\n+/g, ' '));
  }
})();
