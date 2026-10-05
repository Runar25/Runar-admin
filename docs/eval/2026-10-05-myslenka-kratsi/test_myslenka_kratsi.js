// 2026-10-05 — kratší myšlenka ✦ u Opusu (KUKY „pak zkrať myšlenku u Opusu“). Výchozí stav (EVAL_LOG 2026-10-05 (1)): Opus EN
// 12–20 slov, 2/6 dvě věty; sol 8–14, vždy jedna věta. Anthropic k Opusu 5: délku říct výslovně, číslem.
//   A = v4.93 („one more short line set apart: …“) · B = „one more line set apart — a single sentence of at most 12 words: …“,
//   IS navíc věta „Línan er ein setning, í mesta lagi 12 orð.“ (is-grammar-qa čisté, korpus „í mesta lagi“ 13 419).
// B se skládá v paměti náhradou v textu _thoughtLine (assert), produkční soubory se nemění. Ke stavu produkce připomínka délky.
// Opus 5 + sol 6.1 `low`, EN + IS, tři čtení × 2. Měří se slova a věty ✦, slova čtení, ✦ uvnitř JSONu.
//   node test_myslenka_kratsi.js
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OK = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-openai-key.txt'), 'utf8').trim();
const AK = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
const st = {}; S.localStorage = { getItem: (k) => st[k] || null, setItem: (k, v) => { st[k] = v; }, removeItem: (k) => { delete st[k]; } };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + ';\n', S);
vm.runInContext('var __s=1;Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};', S);
const RUNES = vm.runInContext('RUNES', S), rr = (n) => RUNES.find((r) => r.n === n);
const AREAS = vm.runInContext('AREAS', S), SEEKS = vm.runInContext('SEEKS', S), MARK = vm.runInContext('THOUGHT_MARK', S);
const B_EN = [', one more short line set apart: ', ', one more line set apart — a single sentence of at most 12 words: '];
const B_IS = [MARK.is + '. Hún stendur', MARK.is + '. Línan er ein setning, í mesta lagi 12 orð. Hún stendur'];
const CTENI = [['Hagalaz', 'Family & Home', 'Confirmation', 3], ['Fehu', 'Love & Relationships', 'General Guidance', 5],
               ['Wunjo', 'Inner Growth', 'Insight into Challenge', 7]];
function prompt(runa, area, seek, seed, engine, L, v) {
  for (const k of Object.keys(st)) delete st[k];
  vm.runInContext('lang=' + JSON.stringify(L) + ';READ_ENGINE=' + JSON.stringify(engine) + ';__s=' + (seed * 7919 + 17) + ';', S);
  const areaL = L === 'is' ? AREAS.is[AREAS.en.indexOf(area)] : area, seekL = L === 'is' ? SEEKS.is[SEEKS.en.indexOf(seek)] : seek;
  let p = S.buildReadingPrompt({ name: 'Kuky', area: areaL, seeking: seekL, question: '', intention: '', lifeRune: rr('Isa') }, rr(runa), L, []);
  let th = S._thoughtLine(L, rr(runa));
  if (v === 'B') { const [a, b] = L === 'is' ? B_IS : B_EN; if (th.split(a).length !== 2) throw new Error('kotva B ' + L); th = th.replace(a, b); }
  p += '\n' + th;
  const dR = S._lengthReminder(L); if (dR) p += '\n' + dR;
  return p;
}
async function sol(sys, p) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + OK },
    body: JSON.stringify({ model: 'gpt-6.1-sol', reasoning_effort: 'low', max_completion_tokens: 1700, prompt_cache_options: { mode: 'explicit' },
      messages: [{ role: 'system', content: sys }, { role: 'user', content: p }] }) });
  const d = await res.json(); if (!res.ok) throw new Error('sol ' + res.status);
  return String(d.choices[0].message.content || '').trim();
}
async function opus(sys, p) {
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': AK, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-5', max_tokens: 700, thinking: { type: 'disabled' },
      system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }], messages: [{ role: 'user', content: p }] }) });
  const d = await res.json(); if (!res.ok) throw new Error('opus ' + res.status);
  return (d.content || []).filter((x) => x.type === 'text').map((x) => x.text).join('').trim();
}
const W = (s) => (String(s).match(/[A-Za-zÀ-ÿðþæöáéíóúýÐÞÆÖÁÉÍÓÚÝ’'-]+/g) || []).length;
function rozbor(t) {
  const iJ = t.lastIndexOf('}]'), iS = t.indexOf('✦');
  let body = t; try { body = JSON.parse(t.slice(t.indexOf('['), iJ + 2)).map((x) => x.text).join(' '); } catch (e) {}
  const i2 = body.indexOf('✦'), mysl = i2 === -1 ? '' : body.slice(i2 + 1).trim();
  return { uvnitr: iS !== -1 && !(iJ !== -1 && iS > iJ), slov_cteni: W(body.split('✦')[0]), mysl,
           slov_mysl: W(mysl), vet_mysl: (mysl.match(/[.?!](\s|$)/g) || []).length };
}
(async () => {
  const out = [];
  for (const [eng, fn] of [['opus', opus], ['sol', sol]]) for (const L of ['en', 'is']) {
    const sys = S.buildSysPrompt(null, L);
    for (const [runa, area, seek, seed] of CTENI) for (const v of ['A', 'B']) for (let k = 0; k < 2; k++) {
      const text = await fn(sys, prompt(runa, area, seek, seed, eng, L, v));
      const m = rozbor(text);
      out.push(Object.assign({ engine: eng, lang: L, runa, varianta: v, k, text }, m));
      console.log('[' + eng + ' ' + L + ' · ' + runa + ' · ' + v + k + '] ✦ ' + m.slov_mysl + ' sl./' + m.vet_mysl + ' v. · čtení ' + m.slov_cteni + ' | ' + m.mysl);
    }
  }
  fs.writeFileSync(path.join(__dirname, 'test_myslenka_kratsi.json'), JSON.stringify(out, null, 1));
  console.log('\n=== souhrn ===');
  for (const eng of ['opus', 'sol']) for (const L of ['en', 'is']) for (const v of ['A', 'B']) {
    const a = out.filter((x) => x.engine === eng && x.lang === L && x.varianta === v), m = (f) => (a.reduce((p, x) => p + x[f], 0) / a.length).toFixed(1);
    console.log(eng.padEnd(5), L, v, '✦ slov', m('slov_mysl'), '(' + Math.min(...a.map((x) => x.slov_mysl)) + '–' + Math.max(...a.map((x) => x.slov_mysl)) + ')',
      '· jedna věta', a.filter((x) => x.vet_mysl === 1).length + '/' + a.length, '· čtení slov', m('slov_cteni'), '· ✦ uvnitř', a.filter((x) => x.uvnitr).length + '/' + a.length);
  }
})().catch((e) => { console.error('CHYBA ' + e.message); process.exit(1); });
