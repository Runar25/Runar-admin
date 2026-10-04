// 2026-10-04 — koncovka Asku „the rune does not say which…“ podle ENGINU. test_formule.js ukázal, že ji nedělá žádné pravidlo
// promptu (A 8/14, bez všech jistících pravidel naráz X 8/14). Owner zároveň chce přemýšlení `low` (sol rozhodnuto, Opus 5 zkouška)
// a sol 6 × 6.1 má od `low` stejnou cenu → změřit koncovku na týchž 7 otázkách: sol 6 low · sol 6.1 low · Opus 5 dnes · Opus 5 low.
// Produkční prompt prvního Asku (v4.91), strop Asku 320 + rezerva 1500 jen když model vrátí prázdno. 2 odpovědi na otázku.
//   node test_formule_modely.js
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
const PRIPADY = JSON.parse(fs.readFileSync(path.join(__dirname, 'pripady.json'), 'utf8'));
const RX = /\b(does not|doesn['’]t|cannot|can['’]t|will not|won['’]t)\s+(yet\s+)?(say|tell|confirm|settle|decide|show|promise|sort|mark|choose)\b|gives no confirmation|leaves (that|this|the|it) (question |meaning |choice )?open|leaves open|leaves room for both|not something the rune settles|is yours to (know|decide|find)/i;
async function sol(model, sys, p, max) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + OK },
    body: JSON.stringify({ model, reasoning_effort: 'low', max_completion_tokens: max,
      messages: [{ role: 'system', content: sys }, { role: 'user', content: p }] }) });
  const d = await res.json(); if (!res.ok) throw new Error(model + ' ' + res.status);
  return { text: String(d.choices[0].message.content || '').trim(), stop: d.choices[0].finish_reason };
}
async function opus(low, sys, p, max) {
  const body = { model: 'claude-opus-5', max_tokens: max, system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: p }] };
  if (low) { body.thinking = { type: 'adaptive' }; body.output_config = { effort: 'low' }; } else body.thinking = { type: 'disabled' };
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': AK, 'anthropic-version': '2023-06-01' }, body: JSON.stringify(body) });
  const d = await res.json(); if (!res.ok) throw new Error('opus ' + res.status);
  return { text: (d.content || []).filter((x) => x.type === 'text').map((x) => x.text).join('').trim(), stop: d.stop_reason };
}
const ENG = [['sol6-low', 'sol', (s, p, m) => sol('gpt-6-sol', s, p, m)], ['sol61-low', 'sol', (s, p, m) => sol('gpt-6.1-sol', s, p, m)],
             ['opus5-off', 'opus', (s, p, m) => opus(false, s, p, m)], ['opus5-low', 'opus', (s, p, m) => opus(true, s, p, m)]];
(async () => {
  const sys = S.buildSysPrompt(null, 'en'), out = [];
  for (const [v, eng, fn] of ENG) {
    vm.runInContext('READ_ENGINE=' + JSON.stringify(eng) + ';', S);
    for (const c of PRIPADY) for (let k = 0; k < 2; k++) {
      const p = S.buildAskPrompt(c.text, c.q, c.runa, 'en', [], rr('Isa'), { area: c.area, intention: '', seeking: c.seeking || '', question: '' },
        { mode: 'single', runy: [c.runa] }, c.aspekt);
      let r = await fn(sys, p, 320), prazdne = false;
      if (!r.text) { prazdne = true; r = await fn(sys, p, 1820); }
      const hit = r.text.match(RX);
      out.push({ engine: v, id: c.id, runa: c.runa, q: c.q, k, formule: !!hit, kde: hit ? hit[0] : '', stop: r.stop, prazdne_na_320: prazdne, odpoved: r.text });
      console.log('[' + v + ' · ' + c.runa + ' ' + c.id + ' ' + k + '] ' + (hit ? 'FORMULE „' + hit[0] + '“' : '-') + ' · ' + r.stop + (prazdne ? ' · ⚠ prázdné na 320' : ''));
    }
  }
  fs.writeFileSync(path.join(__dirname, 'test_formule_modely.json'), JSON.stringify(out, null, 1));
  console.log('\n=== koncovka podle enginu ===');
  for (const [v] of ENG) { const a = out.filter((x) => x.engine === v);
    console.log(v.padEnd(10), a.filter((x) => x.formule).length + '/' + a.length, '· useknuto', a.filter((x) => /max_tokens|length/.test(x.stop)).length,
      '· prázdné na 320', a.filter((x) => x.prazdne_na_320).length); }
})().catch((e) => { console.error('CHYBA ' + e.message); process.exit(1); });
