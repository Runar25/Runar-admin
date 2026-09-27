// CODE-read 2026-09-27 — owner: „jak bude vypadat rameno, když uživatel řekne ‚I have been given silk scarf'? pro náhodnou runu."
// Prompt ramene = kolo 2 (bez středu; EN hlavička bez „arm", IS kolo 2). Runa losem ze sáčku: 25 run bez životní runy Gebo.
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const V = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const KEY = fs.readFileSync('C:/Users/zkuku/.claude/runar-api-key.txt', 'utf8').trim();
const KOREKCE = JSON.parse(fs.readFileSync(path.join(__dirname, 'korekce.json'), 'utf8'));
function ctx(lang) {
  const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S; S.lang = lang;
  S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
  S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
  vm.createContext(S); vm.runInContext('var userGender="kk"; var corrections=[];', S);
  for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-character.js', 'runar-utils.js']) vm.runInContext(fs.readFileSync(V + f, 'utf8') + '\n;\n', S);
  return S;
}
const C = { en: ctx('en'), is: ctx('is') };
const RUNY = vm.runInContext('RUNES.map(function(r){return r.n;})', C.en).filter(n => n !== 'Gebo');
const runa = RUNY[Math.floor(Math.random() * RUNY.length)];
const K = (lang) => vm.runInContext('(function(r){return ' + (lang === 'is' ? 'r.k_is' : 'r.k') + ';})(RUNES.filter(function(r){return r.n===' + JSON.stringify(runa) + ';})[0])', C[lang]);
const CESTA = { en: 'I have been given a silk scarf.', is: 'Mér hefur verið gefinn silkiklútur.' };
function prompt(lang) {
  const S = C[lang];
  if (lang === 'is') return [
    'VEGVÍSIR — leitandinn er á leið sinni.',
    'RÚNIN: ' + runa + ' — ' + K('is') + '.',
    'Leitandinn skrifar leiðina sem hann fer: „' + CESTA.is + '“',
    'Skrifaðu einn samfelldan texta, um níutíu orð. Haltu þig við leiðina sem hann skrifaði. Síðasta setningin segir frá leiðinni sjálfri, ekki frá því hvað hún þýðir eða hvað hann ætti að gera.',
    vm.runInContext('_noColdRead("is")', S),
    vm.runInContext('getCorrPrompt("is", normalizeCorrections(' + JSON.stringify(KOREKCE) + '))', S),
    vm.runInContext('_addressContext("is")', S),
  ].filter(Boolean).join('\n');
  return [
    'VEGVÍSIR — the seeker is on their way.',
    'DRAWN RUNE: ' + runa + ' — ' + K('en') + '.',
    'The seeker writes the way they are going: "' + CESTA.en + '"',
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
  console.log('RUNA:', runa);
  const out = [];
  for (const lang of ['en', 'is']) {
    const p = prompt(lang); const x = await volej(lang, p);
    out.push({ lang, runa, cesta: CESTA[lang], prompt: p, text: x.text, usage: x.usage });
    console.log('\n=== ' + lang + ' PROMPT (user) ===\n' + p.split('\n').slice(0, 4).join('\n') + '\n=== ' + lang + ' TEXT ===\n' + x.text);
  }
  fs.writeFileSync(path.join(__dirname, 'satek.json'), JSON.stringify(out, null, 1));
})();
