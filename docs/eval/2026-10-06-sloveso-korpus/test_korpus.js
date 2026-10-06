// CODE-tune 2026-10-06 — definiční věta na solu se SLOVESEM DOLOŽENÝM V KORPUSU (KUKY: „fehu exposes wealth? … je to správná
// kombinace slov pro pojmenování runy? … něco si myslet nebo vymyslet je hodně slabý! Pokud to nevíš, tak si to zjisti!“).
// v4.99 dala solu „in a verb of your own“ → marks, exposes, interrupts, counts, gathers — v korpusu 49 anglických textů o runách
// 0× (README této složky). Sol bere sloveso z rámce (rámec „names the rune once“ → „Hagalaz names…“), takže rámec dostane jedno
// ze sedmi doložených sloves losem: represents · embodies · means · symbolizes · signifies · stands for · is the rune of.
// Harness = docs/eval/2026-10-06-sloveso-sol/test_sloveso.js (produkční cesta s READ_ENGINE='sol'); mění se JEN esenční rámec.
//   node test_korpus.js → test_korpus.jsonl
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
const SOL = vm.runInContext('ESSENCE_FRAMES_SOL', S);
const SLOVESA = ['represents', 'embodies', 'means', 'symbolizes', 'signifies', 'stands for', 'is the rune of'];
// K0/K1 = dnešní sol rámce [0]/[1], jen místo „brings the rune in once and, in a verb of your own,“ začátek věty se jménem a slovesem.
const S0_A = "one short line that brings the rune in once and, in a verb of your own, says which side of it this picture holds";
const S0_B = 'one short line that begins "{R} {V}" and says which side of the rune this picture holds';
const S1_A = 'one short line that brings the rune in once and, in a verb of your own, gives the meaning the picture already holds, in plain words a stranger to runes can grasp — let the sentence find its own shape rather than a definition.';
const S1_B = 'one short line that begins "{R} {V}" and gives the meaning the picture already holds, in plain words a stranger to runes can grasp.';
if (SOL[0].split(S0_A).length !== 2 || SOL[1].split(S1_A).length !== 2) throw new Error('sol rámce se změnily');
const RAMY = { K0: SOL[0].replace(S0_A, S0_B).replace(' Never a fixed formula.', ''), K1: SOL[1].replace(S1_A, S1_B) };
if (RAMY.K0 === SOL[0] || /fixed formula/.test(RAMY.K0)) throw new Error('K0 se nepřepsal');
// runa · obraz (podřetězec EN věty v RUNE_IMAGES) · aspekt · oblast · hledání — tatáž čtyři jako v testu slovesa
const CTENI = [
  ['Hagalaz', 'The power goes out in the storm', 'disruption', 'Family & Home', 'Confirmation'],
  ['Fehu', 'The sheep are down from the mountain', 'wealth', 'Love & Relationships', 'General Guidance'],
  ['Wunjo', 'You sit down with them and no one asks why you came', 'belonging', 'Inner Growth', 'Insight into Challenge'],
  ['Uruz', 'You lift the end no one else could get under', 'strength', 'Career & Creativity', 'Clarity'],
];
const _cand = S._runeImageCandidates;
function prompt(c, ram, v, k) {
  const [runa, img, asp, area, seek] = c;
  for (const key of Object.keys(st)) delete st[key];
  S._runeImageCandidates = function (d, b) { const x = _cand(d, b).filter((r) => r[3].indexOf(img) !== -1); if (!x.length) throw new Error('obraz ' + img); return x; };
  const text = RAMY[ram].replace('{R}', runa).replace('{V}', v);
  S._essenceFrame = function () { return text; };
  vm.runInContext('lang="en";READ_ENGINE="sol";__s=' + (k * 7919 + runa.length * 131 + 17) + ';', S);
  const u = { name: 'Kuky', area, seeking: seek, question: '', intention: '', lifeRune: rr('Isa') };
  let p = S.buildReadingPrompt(u, rr(runa), 'en', []);
  const th = S._thoughtLine('en', rr(runa)); if (th) p += '\n' + th;
  const dR = S._lengthReminder('en'); if (dR) p += '\n' + dR;
  const re = /(DRAWN RUNE: [^\n]*? — focus on: )([^·\n]+?)( · Elements:|\n)/;
  if (!re.test(p)) throw new Error('hlavička focus nenalezena');
  p = p.replace(re, (m, a, b, z) => a + asp + z);
  if (!p.includes(text)) throw new Error('esenční rámec není v promptu');
  if (/\[object Object\]|undefined/.test(p)) throw new Error('rozbitý vstup v promptu');
  return p;
}
async function sol(sys, p) {
  for (let i = 0; i < 4; i++) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + OK },
      body: JSON.stringify({ model: 'gpt-6-sol', reasoning_effort: 'none', max_completion_tokens: 700, prompt_cache_options: { mode: 'explicit' },
        messages: [{ role: 'system', content: sys }, { role: 'user', content: p }] }) });
    const d = await res.json(); if (res.ok) return { text: String(d.choices[0].message.content || '').trim(), usage: d.usage };
    if (res.status === 429 || res.status >= 500) { await new Promise((r) => setTimeout(r, 2500 * (i + 1))); continue; }
    throw new Error('sol ' + res.status + ' ' + JSON.stringify(d).slice(0, 200));
  }
  throw new Error('sol: 4 pokusy');
}
function telo(t) { let b = t; try { b = JSON.parse(t.slice(t.indexOf('['), t.lastIndexOf(']') + 1)).map((x) => x.text).join(' '); } catch (e) {} return b.split('✦')[0]; }
if (require.main === module) (async () => {
  const sys = S.buildSysPrompt(null, 'en');
  if (process.argv[2] === '--ukaz') { console.log(prompt(CTENI[0], 'K0', SLOVESA[0], 0)); return; }
  const OUT = path.join(__dirname, 'test_korpus.jsonl'); fs.writeFileSync(OUT, '');
  const ulohy = [];
  for (const c of CTENI) for (const ram of Object.keys(RAMY)) SLOVESA.forEach((v, k) => ulohy.push({ c, ram, v, k, p: prompt(c, ram, v, k) }));
  let i = 0;
  async function prac() { while (i < ulohy.length) { const u = ulohy[i++]; const x = await sol(sys, u.p);
    fs.appendFileSync(OUT, JSON.stringify({ runa: u.c[0], aspekt: u.c[2], rameno: u.ram, sloveso: u.v, k: u.k, text: x.text, telo: telo(x.text), usage: x.usage }) + '\n');
    process.stdout.write('.'); } }
  await Promise.all([prac(), prac(), prac(), prac()]);
  console.log('\nhotovo', ulohy.length);
})();
