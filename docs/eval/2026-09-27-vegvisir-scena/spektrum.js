// CODE-read 2026-09-27 — Vegvísir: HRANICE „cesty" (owner: „jedna věc je cesta a druhá, že na té cestě může člověk něco najít… zastaví
// se, kouká kolem sebe, nebo napíše, že se na něj někdo hezky usmál. Hledám, jak bude Rúnar reagovat a co musíme udělat.")
// 6 vstupů od pohybu po setkání × verze promptu v2 (dnes: „the way they are going" + produkční „Describe the image") × v3 (neutrálně
// „what is happening on their way" + vlastní věta „Describe what happens on their way") × EN/IS. Runa na vstup losem (bez životní Gebo),
// v rámci vstupu stejná pro všechna ramena. Bez středu (DECISIONS 2026-09-27 (6)). Opus 5 jako claude-proxy.
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
const K = (lang, n) => vm.runInContext('(function(r){return ' + (lang === 'is' ? 'r.k_is' : 'r.k') + ';})(RUNES.filter(function(r){return r.n===' + JSON.stringify(n) + ';})[0])', C[lang]);
const VSTUPY = [   // [druh, EN, IS]
  ['pohyb', "I'm sailing a boat on the sea.", 'Ég sigli bát úti á sjó.'],
  ['zastavení', 'I stop on the path and look around.', 'Ég staldra við á stígnum og lít í kringum mig.'],
  ['nález', 'I find an old key on the path.', 'Ég finn gamlan lykil á stígnum.'],
  ['setkání', 'Someone on the road smiled at me kindly.', 'Einhver á veginum brosti hlýlega til mín.'],
  ['dar', 'I have been given a silk scarf.', 'Mér hefur verið gefinn silkiklútur.'],
  ['pohled do dálky', 'I see a bird flying in the distance.', 'Ég sé fugl fljúga í fjarska.'],
];
function noCold(lang, v) {
  const t = vm.runInContext('_noColdRead(' + JSON.stringify(lang) + ')', C[lang]);
  if (v === 'v2') return t;
  const [a, b] = lang === 'is' ? ['Lýstu myndinni;', 'Lýstu því sem gerist á leið hans;'] : ['Describe the image;', 'Describe what happens on their way;'];
  if (t.split(a).length !== 2) throw new Error('noCold kotva ' + lang);
  return t.replace(a, b);
}
function prompt(lang, v, runa, text) {
  if (lang === 'is') return [
    'VEGVÍSIR — leitandinn er á leið sinni.',
    'RÚNIN: ' + runa + ' — ' + K('is', runa) + '.',
    v === 'v2' ? 'Leitandinn skrifar leiðina sem hann fer: „' + text + '“' : 'Leitandinn skrifar hvað gerist á leið hans: „' + text + '“',
    v === 'v2' ? 'Skrifaðu einn samfelldan texta, um níutíu orð. Haltu þig við leiðina sem hann skrifaði. Síðasta setningin segir frá leiðinni sjálfri, ekki frá því hvað hún þýðir eða hvað hann ætti að gera.'
               : 'Skrifaðu einn samfelldan texta, um níutíu orð. Haltu þig við það sem hann skrifaði. Síðasta setningin segir frá því sem gerist. Hún segir ekki hvað það þýðir eða hvað hann ætti að gera.',
    noCold('is', v),
    vm.runInContext('getCorrPrompt("is", normalizeCorrections(' + JSON.stringify(KOREKCE) + '))', C.is),
    vm.runInContext('_addressContext("is")', C.is),
  ].filter(Boolean).join('\n');
  return [
    'VEGVÍSIR — the seeker is on their way.',
    'DRAWN RUNE: ' + runa + ' — ' + K('en', runa) + '.',
    v === 'v2' ? 'The seeker writes the way they are going: "' + text + '"' : 'The seeker writes what is happening on their way: "' + text + '"',
    'Answer as Rúnar in about 90 words, one flowing paragraph of prose. Their way is the only picture — stay inside it. Never end on what it means for them or on what they should do; leave it open.',
    noCold('en', v),
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
  const losy = VSTUPY.map(() => RUNY[Math.floor(Math.random() * RUNY.length)]);
  if (process.argv[2] === '--ukaz') { console.log(prompt('is', 'v3', 'Wunjo', VSTUPY[3][2]) + '\n=====\n' + prompt('en', 'v3', 'Wunjo', VSTUPY[3][1])); return; }
  const OUT = path.join(__dirname, 'spektrum.jsonl'); fs.writeFileSync(OUT, '');
  for (let i = 0; i < VSTUPY.length; i++) for (const lang of ['en', 'is']) for (const v of ['v2', 'v3']) {
    const [druh, en, is] = VSTUPY[i]; const text = lang === 'is' ? is : en;
    const x = await volej(lang, prompt(lang, v, losy[i], text));
    fs.appendFileSync(OUT, JSON.stringify({ druh, lang, v, runa: losy[i], vstup: text, text: x.text, usage: x.usage }) + '\n');
    console.log(druh.padEnd(15), lang, v, losy[i].padEnd(8), '|', x.text.replace(/\n+/g, ' '));
  }
})();
