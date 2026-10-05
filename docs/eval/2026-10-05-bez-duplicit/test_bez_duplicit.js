// 2026-10-05 — bod 3 auditu promptu (KUKY „bod 3 jeď“): pravidla v promptu single jen jednou. Pilot PŘED nasazením.
//   A = v4.92 (závěr „One paragraph. No breaks. No labels. … Stay within the word count — short sentences, no filler. Respond
//       in English.“ / IS „Einn texti. … Haltu þig innan orðafjöldans — …“) · B = v4.93 (jen umístění jména + IS „Sleppu öllu
//       uppfyllingarefni.“). Obě varianty TÝMŽ builderem a týmž seedem — A jen dočasně vrátí starý `closing` a `langInstr`.
//   Ke stavu produkce se přidá ✦ a připomínka délky (pořadí runar-reading.js).
// Hlídá se, že škrt nic nerozbil: slova, runa jmenovaná (počet), zalomení v textu, ✦ uvnitř JSONu. Opus 5 + sol 6.1 `low`, EN + IS.
//   node test_bez_duplicit.js
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
const RUNES = vm.runInContext('RUNES', S), rr = (n) => RUNES.find((r) => r.n === n), P = vm.runInContext('RP_SINGLE', S);
const AREAS = vm.runInContext('AREAS', S), SEEKS = vm.runInContext('SEEKS', S);   // const → není na globálu sandboxu
const NOVE = { en: [P.en.closing, P.en.langInstr], is: [P.is.closing, P.is.langInstr] };
const STARE = {
  en: [function (name) { return 'One paragraph. No breaks. No labels. ' + S._namePlacement(name, 'en') + ' Stay within the word count — short sentences, no filler. '; }, 'Respond in English.'],
  is: [function (name) { return 'Einn texti. Engar hlutaskiptingar. Engar fyrirsagnir. ' + S._namePlacement(name, 'is') + ' Haltu þig innan orðafjöldans — stuttar setningar, ekkert uppfyllingarefni.'; }, ''],
};
const CTENI = [['Hagalaz', 'Family & Home', 'Confirmation', 3], ['Fehu', 'Love & Relationships', 'General Guidance', 5],
               ['Wunjo', 'Inner Growth', 'Insight into Challenge', 7]];
function prompt(runa, area, seek, seed, engine, L, v) {
  for (const k of Object.keys(st)) delete st[k];
  const [cl, li] = (v === 'A' ? STARE : NOVE)[L]; P[L].closing = cl; P[L].langInstr = li;
  vm.runInContext('lang=' + JSON.stringify(L) + ';READ_ENGINE=' + JSON.stringify(engine) + ';__s=' + (seed * 7919 + 17) + ';', S);
  const areaL = L === 'is' ? AREAS.is[AREAS.en.indexOf(area)] : area;
  const seekL = L === 'is' ? SEEKS.is[SEEKS.en.indexOf(seek)] : seek;
  const u = { name: 'Kuky', area: areaL, seeking: seekL, question: '', intention: '', lifeRune: rr('Isa') };
  let p = S.buildReadingPrompt(u, rr(runa), L, []);
  const th = S._thoughtLine(L, rr(runa)); if (th) p += '\n' + th;
  const dR = S._lengthReminder(L); if (dR) p += '\n' + dR;
  P[L].closing = NOVE[L][0]; P[L].langInstr = NOVE[L][1];
  return p;
}
async function sol(sys, p) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + OK },
    body: JSON.stringify({ model: 'gpt-6.1-sol', reasoning_effort: 'low', max_completion_tokens: 1700, prompt_cache_options: { mode: 'explicit' },
      messages: [{ role: 'system', content: sys }, { role: 'user', content: p }] }) });
  const d = await res.json(); if (!res.ok) throw new Error('sol ' + res.status + ' ' + JSON.stringify(d).slice(0, 160));
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
function rozbor(t, runa) {
  const iJ = t.lastIndexOf('}]'), iS = t.indexOf('✦');
  const kde = iS === -1 ? 'chybí' : (iJ !== -1 && iS > iJ ? 'za JSONem' : 'uvnitř JSONu');
  let body = t; try { body = JSON.parse(t.slice(t.indexOf('['), iJ + 2)).map((x) => x.text).join(' '); } catch (e) {}
  const telo = body.split('✦')[0];
  return { kde, slov: W(telo), runa_krat: (telo.match(new RegExp(runa, 'gi')) || []).length, zalomeni: (telo.trim().match(/\n/g) || []).length };
}
(async () => {
  const out = [];
  for (const [eng, fn] of [['opus', opus], ['sol', sol]]) for (const L of ['en', 'is']) {
    const sys = S.buildSysPrompt(null, L);
    for (const [runa, area, seek, seed] of CTENI) for (const v of ['A', 'B']) for (let k = 0; k < 2; k++) {
      const text = await fn(sys, prompt(runa, area, seek, seed, eng, L, v));
      const m = rozbor(text, runa);
      out.push(Object.assign({ engine: eng, lang: L, runa, varianta: v, k, text }, m));
      console.log('[' + eng + ' ' + L + ' · ' + runa + ' · ' + v + k + '] ' + m.slov + ' sl. · runa ' + m.runa_krat + '× · zalomení ' + m.zalomeni + ' · ✦ ' + m.kde);
    }
  }
  fs.writeFileSync(path.join(__dirname, 'test_bez_duplicit.json'), JSON.stringify(out, null, 1));
  console.log('\n=== souhrn ===');
  for (const eng of ['opus', 'sol']) for (const L of ['en', 'is']) for (const v of ['A', 'B']) {
    const a = out.filter((x) => x.engine === eng && x.lang === L && x.varianta === v), s = a.map((x) => x.slov);
    console.log(eng.padEnd(5), L, v, 'slov', (s.reduce((p, q) => p + q, 0) / s.length).toFixed(1), '(' + Math.min(...s) + '–' + Math.max(...s) + ')',
      '· runa právě 1×:', a.filter((x) => x.runa_krat === 1).length + '/' + a.length, '· bez zalomení:', a.filter((x) => !x.zalomeni).length + '/' + a.length,
      '· ✦ uvnitř:', a.filter((x) => x.kde === 'uvnitř JSONu').length + '/' + a.length);
  }
})().catch((e) => { console.error('CHYBA ' + e.message); process.exit(1); });
