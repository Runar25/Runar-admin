// CODE-tune 2026-10-06 — sloveso definiční věty na solu (KUKY „udělej malou změnu slovesa pro sol a otestuj“). Harness převzat od
// CODE-read (../2026-10-06-definicni-veta/test_sol.js, produkční cesta s READ_ENGINE='sol'); mění se JEN znění esenčního rámce.
// Proč sloveso: sol ho bere ze slov rámce ([1] „names the rune“ → names; starý [0] „this picture shows“ → shows; DB names 14/33).
// Hranice: záměr v4.81 (čtenář obraz nevidí → význam runy jejími slovy, ne děj scény) musí zůstat ve všech variantách.
//   A0/A1 = produkce · G0 = [0] „means“→„shows“ · G1 = [1] „names the rune once and gives the meaning the picture already holds“ →
//   „brings the rune in once and says what it holds in this picture“ · H0/H1 = totéž bez slovesa a s „in a verb of your own“.
//   node test_sloveso.js → test_sloveso.jsonl
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
const G0_A = 'say what the rune means in its own terms', G0_B = 'say what the rune shows in its own terms';
const G1_A = 'one short line that names the rune once and gives the meaning the picture already holds', G1_B = 'one short line that brings the rune in once and says what it holds in this picture';
const H0_B = 'say, in a verb of your own, what the rune is about in its own terms';
const H1_B = 'one short line that brings the rune in once and, in a verb of your own, gives the meaning the picture already holds';
if (FR[0].split(G0_A).length !== 2 || FR[1].split(G1_A).length !== 2) throw new Error('ramce se zmenily');
const I0_A = 'one short line that says which side of the rune this picture shows', I0_B = 'one short line that brings the rune in once and, in a verb of your own, says which side of it this picture holds';
if (FR[0].split(I0_A).length !== 2) throw new Error('ramec [0] se zmenil');
const J0_A = 'say what the rune means in its own terms, not what happens in the scene', J0_B = "keep the line on the rune's own sense, not on what happens in the scene";
if (FR[0].split(J0_A).length !== 2) throw new Error('ramec [0] veta v4.81 se zmenila');
const RAMY = { J0: FR[0].replace(I0_A, I0_B).replace(J0_A, J0_B), I0: FR[0].replace(I0_A, I0_B), G0: FR[0].replace(G0_A, G0_B), G1: FR[1].replace(G1_A, G1_B), H0: FR[0].replace(G0_A, H0_B), H1: FR[1].replace(G1_A, H1_B) };
if (FR[1].split(C1_A).length !== 2) throw new Error('ramec [1] se zmenil');
const F1_BEZNAMES = FR[1].replace(C1_A, C1_B);
// runa · obraz (podřetězec EN věty v RUNE_IMAGES) · aspekt · fráze ze scény · oblast · hledání
const CTENI = [
  ['Hagalaz', 'The power goes out in the storm', 'disruption', 'the force no one steers', 'Family & Home', 'Confirmation'],
  ['Fehu', 'The sheep are down from the mountain', 'wealth', 'what grows and can be passed on', 'Love & Relationships', 'General Guidance'],
  ['Wunjo', 'You sit down with them and no one asks why you came', 'belonging', 'being let in without having to explain', 'Inner Growth', 'Insight into Challenge'],
  ['Uruz', 'You lift the end no one else could get under', 'strength', 'the force no one else could find', 'Career & Creativity', 'Clarity'],
];
const RAMENA_VSE = { J0: ['J0', 'slovo'], I0: ['I0', 'slovo'], G0: ['G0', 'slovo'], G1: ['G1', 'slovo'], H0: ['H0', 'slovo'], H1: ['H1', 'slovo'], A0: [0, 'slovo'], A1: [1, 'slovo'], B0: ['stary0', 'slovo'], C1: ['bez1', 'slovo'], D0: [0, 'fraze'], D1: [1, 'fraze'], E0: [0, 'duraz'], E1: [1, 'duraz'], F0: [0, 'nic'], F1: [1, 'nic'] };
// 2026-10-06 kolo 2 (OBRÁCENÁ PÁKA k aspektu): F0/F1 = aspekt z hlavičky úplně pryč. `--kolo2` pustí jen F.
const KOLO2 = process.argv.includes('--kolo2');
const RAMENA = process.argv.includes('--j0') ? { J0: RAMENA_VSE.J0 } : process.argv.includes('--i0') ? { I0: RAMENA_VSE.I0 } : { A0: RAMENA_VSE.A0, A1: RAMENA_VSE.A1, G0: RAMENA_VSE.G0, G1: RAMENA_VSE.G1, H0: RAMENA_VSE.H0, H1: RAMENA_VSE.H1 };
const _cand = S._runeImageCandidates;
function prompt(c, rameno, k) {
  const [runa, img, asp, fraze, area, seek] = c, [ram, aspTvar] = RAMENA_VSE[rameno];
  for (const key of Object.keys(st)) delete st[key];
  S._runeImageCandidates = function (d, b) { const x = _cand(d, b).filter((r) => r[3].indexOf(img) !== -1); if (!x.length) throw new Error('obraz ' + img); return x; };
  const text = RAMY[ram] || (ram === 'stary0' ? F0_STARY : ram === 'bez1' ? F1_BEZNAMES : FR[ram]);
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
  const OUT = path.join(__dirname, process.argv.includes('--j0') ? 'test_sloveso_j0.jsonl' : process.argv.includes('--i0') ? 'test_sloveso_i0.jsonl' : 'test_sloveso.jsonl'); fs.writeFileSync(OUT, '');
  for (const c of CTENI) for (const rameno of Object.keys(RAMENA)) for (let k = 0; k < 3; k++) {
    const p = prompt(c, rameno, k);
    const x = await sol(sys, p);
    const rec = { runa: c[0], aspekt: c[2], fraze: c[3], rameno, k, text: x.text, telo: telo(x.text), usage: x.usage, ms: x.ms };
    fs.appendFileSync(OUT, JSON.stringify(rec) + '\n');
    console.log(c[0].padEnd(8), rameno, k, '|', rec.telo.replace(/\s+/g, ' ').slice(0, 150));
  }
})();
module.exports = { prompt, CTENI, RAMENA };
