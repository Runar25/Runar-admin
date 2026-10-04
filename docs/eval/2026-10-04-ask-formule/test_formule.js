// 2026-10-04 — odkud je koncovka Asku „the rune does not say which…“ (KUKY „4. podívej se na to“; EVAL_LOG 2026-10-04 (1): 14/19
// Asků, krok 2 ji neodstranil). Obrácená páka (§25): z produkčního promptu prvního Asku se vždy ODEBERE jedna věc a měří se,
// jestli koncovka zmizí. Sedm ownerových skutečných prvních otázek (DB 3.–4. 10., pripady.json). Model gpt-6-sol na `none`
// (dnešní produkce admina; koncovka tam nejčastější 10/12), 2 odpovědi na variantu.
//   A  produkce v4.91 · M bez „Do not mirror the seeker…“ · P bez „If they ask what it could be for them… may be so“
//   N  bez bloku NO COLD READING · C bez hledání (seeking) v bloku zadání · R čtení bez poslední věty (most „may be X, or Y“) — diagnóza
//   node test_formule.js
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OK = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-openai-key.txt'), 'utf8').trim();
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + ';\n', S);
vm.runInContext('lang="en";READ_ENGINE="sol";', S);
const RUNES = vm.runInContext('RUNES', S), rr = (n) => RUNES.find((r) => r.n === n);
const PRIPADY = JSON.parse(fs.readFileSync(path.join(__dirname, 'pripady.json'), 'utf8'));
// Širší než regex z EVAL_LOG 2026-10-04 (1) — ten minul „does not sort / mark“, „leaves room for both“ (útok na nástroj, (2)).
const RX = /\b(does not|doesn['’]t|cannot|can['’]t|will not|won['’]t)\s+(yet\s+)?(say|tell|confirm|settle|decide|show|promise|sort|mark|choose)\b|gives no confirmation|leaves (that|this|the|it) (question |meaning |choice )?open|leaves open|leaves room for both|not something the rune settles|is yours to (know|decide|find)/i;
function bez(p, zacatek, konec) {
  const i = p.indexOf(zacatek); if (i === -1 || p.indexOf(zacatek, i + 1) !== -1) throw new Error('kotva ' + zacatek.slice(0, 30));
  const j = p.indexOf(konec, i); if (j === -1) throw new Error('konec ' + konec);
  return p.slice(0, i) + p.slice(j + konec.length);
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
(async () => {
  const sys = S.buildSysPrompt(null, 'en'), out = [];
  for (const c of PRIPADY) {
    const cast = { area: c.area, intention: '', seeking: c.seeking || '', question: '' };
    const sp = { mode: 'single', runy: [c.runa] };
    const ask = (text, ca) => S.buildAskPrompt(text, c.q, c.runa, 'en', [], rr('Isa'), ca, sp, c.aspekt);
    const A = ask(c.text, cast);
    const vety = c.text.split(/(?<=[.!?])\s+/);
    const V = {
      A,
      M: bez(A, 'Do not mirror the seeker:', '\n'),
      P: bez(A, 'If they ask what it could be for them,', '\n'),
      N: bez(A, 'NO COLD READING:', 'no destiny at work.'),
      C: ask(c.text, Object.assign({}, cast, { seeking: '' })),
      R: ask(vety.slice(0, -1).join(' '), cast),
    };
    if (!c.seeking) delete V.C;   // bez hledání není co ubrat
    // 2. kolo (po A–R = nic): S systém bez kánonové věty „never predicts fate or claims absolute truths“ · X všechna jistící
    // pravidla naráz (M+P+N+S) — diagnóza, jestli koncovku dělá SOUČET, ne jedno pravidlo. Nic z toho nejde do produkce.
    if (process.argv[2] === 'kolo2') { for (const k of Object.keys(V)) delete V[k];
      V.S = A; V.X = bez(bez(bez(A, 'Do not mirror the seeker:', String.fromCharCode(10)), 'If they ask what it could be for them,',
        String.fromCharCode(10)), 'NO COLD READING:', 'no destiny at work.'); }
    for (const [v, p] of Object.entries(V)) for (let k = 0; k < 2; k++) {
      const sysV = (v === 'S' || v === 'X') ? bez(sys, 'Rúnar never predicts fate or claims absolute truths.', '') : sys;
      const a = await sol(sysV, p);
      const hit = a.match(RX);
      out.push({ id: c.id, runa: c.runa, q: c.q, varianta: v, k, formule: !!hit, kde: hit ? hit[0] : '', odpoved: a });
      console.log('[' + c.runa + ' ' + c.id + ' · ' + v + k + '] ' + (hit ? 'FORMULE „' + hit[0] + '“' : '-') + ' | ' + a.replace(/\s+/g, ' ').slice(-140));
    }
  }
  fs.writeFileSync(path.join(__dirname, process.argv[2] === 'kolo2' ? 'test_formule_kolo2.json' : 'test_formule.json'), JSON.stringify(out, null, 1));
  console.log('\n=== koncovka podle varianty ===');
  for (const v of ['A', 'M', 'P', 'N', 'C', 'R', 'S', 'X']) {
    const a = out.filter((x) => x.varianta === v);
    if (a.length) console.log(v, a.filter((x) => x.formule).length + '/' + a.length);
  }
})().catch((e) => { console.error('CHYBA ' + e.message); process.exit(1); });
