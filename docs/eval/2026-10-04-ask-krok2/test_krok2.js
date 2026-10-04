// 2026-10-04 — krok 2 Asku (KUKY „3. ano“): druhý Ask dostane poslední předchozí výměnu. Pilot PŘED nasazením na ownerových
// skutečných dvojicích Asků z DB (3.–4. 10., pary.json): druhá otázka BEZ výměny (A = dnešní produkce v4.90) a S výměnou (H = v4.91).
// Report 2026-10-03 u Ehwaz: „druhý spíš jen opakuje. Poslední věta úplně.“ Měří se, kolik druhá odpověď bere z první:
// obsahová slova, doslovné trojice, podobnost poslední věty; a závěrečná formule „does not say which…“ (EVAL_LOG 2026-10-04 (1)).
// Engine jako owner četl: sol 6 na solových čteních, Opus 5 na Opusových (tvar volání = claude-proxy). 2 odpovědi na variantu.
// Fehu: owner měl starou nápovědu „give me a clearer image“ → tady dnešní „make this image clearer“ (měří se dnešní produkce).
//   node test_krok2.js
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OK = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-openai-key.txt'), 'utf8').trim();
const AK = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + ';\n', S);
vm.runInContext('lang="en";', S);
const RUNES = vm.runInContext('RUNES', S), rr = (n) => RUNES.find((r) => r.n === n);
const PARY = JSON.parse(fs.readFileSync(path.join(__dirname, 'pary.json'), 'utf8'));
for (const p of PARY) if (/give me a clearer image/.test(p.q2)) p.q2 = p.q2.replace('can you give me a clearer image?', 'can you make this image clearer?');

const STOP = new Set('the a an and or of to in on at it is that this what which as be may for with not your you their they its from by but can was are has have no one more than so if do does there here into out up all any been being i me my we our them his her him she he whether either neither nor just only also very'.split(' '));
const slova = (s) => (String(s).toLowerCase().match(/[a-z’']+/g) || []).map((w) => w.replace(/’/g, "'"));
const obsah = (s) => slova(s).filter((w) => !STOP.has(w) && w.length > 2);
const vety = (s) => String(s).split(/(?<=[.!?])\s+/).filter((x) => x.trim());
const RX = /\b(does not|doesn['’]t|cannot|can['’]t|will not)\s+(yet\s+)?(say|tell|confirm|settle|decide|show|promise)\b|gives no confirmation|leaves (that|this|the) (question |meaning )?open|leaves open|not something the rune settles/i;
function mer(a2, a1) {
  const o1 = new Set(obsah(a1)), o2 = obsah(a2);
  const w1 = slova(a1), w2 = slova(a2), t1 = new Set();
  for (let i = 0; i + 2 < w1.length; i++) t1.add(w1.slice(i, i + 3).join(' '));
  let tri = 0; for (let i = 0; i + 2 < w2.length; i++) if (t1.has(w2.slice(i, i + 3).join(' '))) tri++;
  const l1 = new Set(obsah(vety(a1).slice(-1)[0] || '')), l2 = new Set(obsah(vety(a2).slice(-1)[0] || ''));
  const prun = [...l2].filter((w) => l1.has(w)).length, sjed = new Set([...l1, ...l2]).size || 1;
  return { slov_z_a1: o2.length ? +(o2.filter((w) => o1.has(w)).length / o2.length).toFixed(2) : 0, trojic: tri,
           posledni_veta: +(prun / sjed).toFixed(2), formule: RX.test(a2), slov: w2.length };
}
async function sol(sys, p) {
  for (const eff of ['none', 'minimal']) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + OK },
      body: JSON.stringify({ model: 'gpt-6-sol', reasoning_effort: eff, max_completion_tokens: 320,
        messages: [{ role: 'system', content: sys }, { role: 'user', content: p }] }) });
    if (res.status === 400 && eff === 'none') continue;
    const d = await res.json(); if (!res.ok) throw new Error('sol ' + res.status);
    return String(d.choices[0].message.content || '').trim();
  }
}
async function opus(sys, p) {
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': AK, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-5', max_tokens: 320, thinking: { type: 'disabled' },
      system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }], messages: [{ role: 'user', content: p }] }) });
  const d = await res.json(); if (!res.ok) throw new Error('opus ' + res.status + ' ' + JSON.stringify(d).slice(0, 200));
  return (d.content || []).filter((x) => x.type === 'text').map((x) => x.text).join('').trim();
}
(async () => {
  const sys = S.buildSysPrompt(null, 'en'), out = [];
  for (const p of PARY) {
    const volej = /opus/.test(p.model) ? opus : sol;
    const cast = { area: p.area, intention: '', seeking: p.seeking, question: '' };
    const spread = { mode: 'single', runy: [p.runa] };
    const pA = S.buildAskPrompt(p.text, p.q2, p.runa, 'en', [], rr('Isa'), cast, spread, p.aspekt);
    const pH = S.buildAskPrompt(p.text, p.q2, p.runa, 'en', [], rr('Isa'), cast, spread, p.aspekt, [{ q: p.q1, a: p.a1 }]);
    if (pH.indexOf('EARLIER IN THIS CONVERSATION') === -1 || pA.indexOf('EARLIER IN THIS CONVERSATION') !== -1) throw new Error('blok výměny');
    for (const [v, pr] of [['A', pA], ['H', pH]]) for (let k = 0; k < 2; k++) {
      const a2 = await volej(sys, pr);
      const m = mer(a2, p.a1);
      out.push(Object.assign({ id: p.id, runa: p.runa, model: p.model, varianta: v, k, q2: p.q2, a2 }, m));
      console.log('\n[' + p.runa + ' · ' + p.model + ' · ' + v + k + '] ' + JSON.stringify(m) + '\n' + a2);
    }
  }
  fs.writeFileSync(path.join(__dirname, 'test_krok2.json'), JSON.stringify(out, null, 1));
  const sum = {};
  for (const r of out) { const key = r.model + ' ' + r.varianta; const s = sum[key] = sum[key] || { n: 0, slov_z_a1: 0, trojic: 0, posledni_veta: 0, formule: 0, slov: 0 };
    s.n++; s.slov_z_a1 += r.slov_z_a1; s.trojic += r.trojic; s.posledni_veta += r.posledni_veta; s.formule += r.formule ? 1 : 0; s.slov += r.slov; }
  console.log('\n=== souhrn (průměr na odpověď; formule = počet) ===');
  for (const [k, s] of Object.entries(sum)) console.log(k.padEnd(18), 'n=' + s.n, 'slov z 1. odpovědi', (s.slov_z_a1 / s.n).toFixed(2),
    '· trojic', (s.trojic / s.n).toFixed(1), '· poslední věta', (s.posledni_veta / s.n).toFixed(2), '· formule', s.formule + '/' + s.n, '· slov', (s.slov / s.n).toFixed(0));
})().catch((e) => { console.error('CHYBA ' + e.message); process.exit(1); });
