// CODE-read 2026-10-06 — úkol E na SOLU (owner: „ano, pusť test na solu přes API"). Proč sol: v DB vzorec „<Runa> names <aspekt>"
// dělá jen gpt-6-sol (14/33), Opus 0/147 → subagent (Claude) by měřil model bez vady (EVAL_LOG 2026-10-06 (1)).
// Prompt = produkční cesta jako runar-reading.js: buildSysPrompt + buildReadingPrompt (READ_ENGINE='sol' → věta za obrazem pro sol)
// + myšlenka ✦ + připomínka délky. Volání jako claude-proxy callSol: gpt-6-sol, reasoning_effort 'none', max_completion_tokens 700,
// prompt_cache_options explicit. Harness převzat z docs/eval/2026-10-05-bez-duplicit/test_bez_duplicit.js (CODE-tune).
// Jedna páka na rameno, stejný obraz + los na runu:
//   A0/A1 = produkce, esenční rámec [0] / [1]
//   B0    = rámec [0] ve znění PŘED v4.81 (2026-09-30: pryč „say what the rune means in its own terms" → podezřelý zlom v DB)
//   C1    = rámec [1] bez slova „names" („names the rune once" → „brings the rune in once")
//   D0/D1 = aspekt jako fráze ze scény místo holého slova (handoff: „the force no one steers")
//   E0/E1 = OBRÁCENÁ PÁKA: holé slovo aspektu zdůrazněné — vzorec musí zesílit, jinak hypotéza „holé slovo zve vzorec" padá
//   node test_sol.js
'use strict';
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OK = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-openai-key.txt'), 'utf8').trim();
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
const st = {}; S.localStorage = { getItem: (k) => st[k] || null, setItem: (k, v) => { st[k] = v; }, removeItem: (k) => { delete st[k]; } };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + ';\n', S);
vm.runInContext('var __s=1;Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};', S);
const RUNES = vm.runInContext('RUNES', S), rr = (n) => RUNES.find((r) => r.n === n);
const AREAS = vm.runInContext('AREAS', S), SEEKS = vm.runInContext('SEEKS', S);
const FR = vm.runInContext('ESSENCE_FRAMES', S);
const F0_STARY = 'THE ESSENCE LINE: after the picture, one short line that says which side of the rune this picture shows — its sense in plain words a stranger to runes can grasp. The familiar word may live inside the scene ("exchange between the sea and the shore"). Never a fixed formula. No invented mechanism, no fate. Never tell the seeker what it means for them.';
const C1_A = 'one short line that names the rune once and gives', C1_B = 'one short line that brings the rune in once and gives';
if (FR[1].split(C1_A).length !== 2) throw new Error('ramec [1] se zmenil');
const F1_BEZNAMES = FR[1].replace(C1_A, C1_B);
// runa · obraz (podřetězec EN věty v RUNE_IMAGES) · aspekt · fráze ze scény · oblast · hledání
const CTENI = [
  ['Hagalaz', 'The power goes out in the storm', 'disruption', 'the force no one steers', 'Family & Home', 'Confirmation'],
  ['Fehu', 'The sheep are down from the mountain', 'wealth', 'what grows and can be passed on', 'Love & Relationships', 'General Guidance'],
  ['Wunjo', 'You sit down with them and no one asks why you came', 'belonging', 'being let in without having to explain', 'Inner Growth', 'Insight into Challenge'],
  ['Uruz', 'You lift the end no one else could get under', 'strength', 'the force no one else could find', 'Career & Creativity', 'Clarity'],
];
const RAMENA_VSE = { A0: [0, 'slovo'], A1: [1, 'slovo'], B0: ['stary0', 'slovo'], C1: ['bez1', 'slovo'], D0: [0, 'fraze'], D1: [1, 'fraze'], E0: [0, 'duraz'], E1: [1, 'duraz'], F0: [0, 'nic'], F1: [1, 'nic'] };
// 2026-10-06 kolo 2 (OBRÁCENÁ PÁKA k aspektu): F0/F1 = aspekt z hlavičky úplně pryč. `--kolo2` pustí jen F.
const KOLO2 = process.argv.includes('--kolo2');
const RAMENA = KOLO2 ? { F0: RAMENA_VSE.F0, F1: RAMENA_VSE.F1 } : Object.fromEntries(Object.entries(RAMENA_VSE).filter(([k]) => k[0] !== 'F'));
const _cand = S._runeImageCandidates;
function prompt(c, rameno, k) {
  const [runa, img, asp, fraze, area, seek] = c, [ram, aspTvar] = RAMENA_VSE[rameno];
  for (const key of Object.keys(st)) delete st[key];
  S._runeImageCandidates = function (d, b) { const x = _cand(d, b).filter((r) => r[3].indexOf(img) !== -1); if (!x.length) throw new Error('obraz ' + img); return x; };
  const text = ram === 'stary0' ? F0_STARY : ram === 'bez1' ? F1_BEZNAMES : FR[ram];
  S._essenceFrame = function () { return text; };
  vm.runInContext('lang="en";READ_ENGINE="sol";__s=' + (k * 7919 + runa.length * 131 + 17) + ';', S);
  const u = { name: 'Kuky', area, seeking: seek, question: '', intention: '', lifeRune: rr('Isa') };
  let p = S.buildReadingPrompt(u, rr(runa), 'en', []);
  const th = S._thoughtLine('en', rr(runa)); if (th) p += '\n' + th;
  const dR = S._lengthReminder('en'); if (dR) p += '\n' + dR;
  // aspekt v hlavičce: „DRAWN RUNE: X — focus on: <cokoli>" → řízená hodnota (sáček by ji jinak losoval mezi významy obrazu)
  const re = /(DRAWN RUNE: [^\n]*? — focus on: )([^·\n]+?)( · Elements:|\n)/;
  if (!re.test(p)) throw new Error('hlavicka focus nenalezena');
  const nove = aspTvar === 'slovo' ? asp : aspTvar === 'fraze' ? fraze : asp + '. This one word is the heart of what the rune means here';
  p = aspTvar === 'nic' ? p.replace(re, (m, a, b, z) => a.replace(' — focus on: ', '') + z) : p.replace(re, (m, a, b, z) => a + nove + z);
  if (aspTvar === 'nic' && /focus on/.test(p)) throw new Error('focus zustal');
  if (!p.includes(text)) throw new Error('esencni ramec neni v promptu');
  if (!p.includes(img)) throw new Error('obraz neni v promptu');
  return p;
}
async function sol(sys, p) {
  const t0 = Date.now();
  const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + OK },
    body: JSON.stringify({ model: 'gpt-6-sol', reasoning_effort: 'none', max_completion_tokens: 700, prompt_cache_options: { mode: 'explicit' },
      messages: [{ role: 'system', content: sys }, { role: 'user', content: p }] }) });
  const d = await res.json(); if (!res.ok) throw new Error('sol ' + res.status + ' ' + JSON.stringify(d).slice(0, 200));
  return { text: String(d.choices[0].message.content || '').trim(), usage: d.usage, ms: Date.now() - t0 };
}
function telo(t) { let b = t; try { b = JSON.parse(t.slice(t.indexOf('['), t.lastIndexOf(']') + 1)).map((x) => x.text).join(' '); } catch (e) {} return b.split('✦')[0]; }
if (require.main === module) (async () => {
  const sys = S.buildSysPrompt(null, 'en');
  if (process.argv[2] === '--ukaz') { console.log(prompt(CTENI[0], 'A0', 0)); return; }
  const OUT = path.join(__dirname, KOLO2 ? 'test_sol_kolo2.jsonl' : 'test_sol.jsonl'); fs.writeFileSync(OUT, '');
  for (const c of CTENI) for (const rameno of Object.keys(RAMENA)) for (let k = 0; k < 2; k++) {
    const p = prompt(c, rameno, k);
    const x = await sol(sys, p);
    const rec = { runa: c[0], aspekt: c[2], fraze: c[3], rameno, k, text: x.text, telo: telo(x.text), usage: x.usage, ms: x.ms };
    fs.appendFileSync(OUT, JSON.stringify(rec) + '\n');
    console.log(c[0].padEnd(8), rameno, k, '|', rec.telo.replace(/\s+/g, ' ').slice(0, 150));
  }
})();
module.exports = { prompt, CTENI, RAMENA };
