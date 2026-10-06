// CODE-tune 2026-10-06 — Ask k životní runě na solu (KUKY „pro tohle API použij… chce to zkusit víc variant“).
// Prompt se staví PRODUKČNÍ cestou (buildSysPrompt + buildAskPrompt přes vm), mění se jen blok životní runy (_askLifeContext)
// a otázka. Volání = parametry claude-proxy callSol (gpt-6-sol, reasoning_effort none, max_completion_tokens 320, explicit cache).
//   node zivotni.js [opakovani]   → zivotni_vysledky.json
const vm = require('vm'), fs = require('fs'), path = require('path');
const H = __dirname, D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const KEY = fs.readFileSync('C:/Users/zkuku/.claude/runar-openai-key.txt', 'utf8').trim();
const S = { console: { log() {}, warn() {}, error() {} }, document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] },
  localStorage: { getItem: () => null, setItem() {} } };
S.window = S; S.globalThis = S; vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-character.js', 'runar-utils.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
vm.runInContext('var lang = "en";', S);
const RU = vm.runInContext('RUNES', S), runa = (n) => RU.find((r) => r.n === n);
const ld = (f) => { const s = fs.readFileSync(f, 'utf8'); const j = JSON.parse(s.slice(s.search(/[\[{]/))); return Array.isArray(j) ? j : j.rows; };
const CTENI = ld(path.join(H, '..', 'nova_cteni.json'));
const VYBER = ['bf8d8db8', 'cb4f2614', '5297799e'];   // Raidho mohyly · Algiz sob · Sowilo půlnoční slunce (ownerova čtení 2026-10-06)
const cteni = VYBER.map((id) => CTENI.find((c) => c.id.indexOf(id) === 0));

const V = {
  V0: null,   // produkce beze změny
  V1: "LIFE RUNE — the seeker carries {L} as their own. Do not bring it up on your own. If their question reaches for it, answer from it in a sentence or two.",
  V2: "LIFE RUNE — the seeker carries {L} as their own. Do not bring it up on your own. If their question reaches for it, answer from it in a sentence or two. Its sides, as background only — never list them: {K}.",
  V3: "LIFE RUNE — the seeker carries {L} as their own. Do not bring it up on your own. If their question reaches for it, answer from it in a sentence or two. {P}",
};
// V3: věta, kterou je v pořádku vidět v odpovědi doslova (pravidlo Coworku pro sol), z ownerova popisu Isy (RUNAR_POPISY_RUN.md).
const PROZA = { Isa: 'Isa is the stillness when something cannot move on yet: a pause, a waiting, the clarity that comes with the cold.' };
const Q = process.env.KOLO2 ? {
  Q4: 'How does my life rune {L} show itself in this picture?',
  Q5: 'What in this picture speaks to my life rune {L}?',
} : {
  Q1: 'How does my life rune {L} affect this reading?',
  Q2: 'How does my life rune {L} affect {R} in this reading?',
  Q3: 'Where is my life rune {L} in this picture?',
};
async function sol(system, prompt) {
  for (let pokus = 0; pokus < 3; pokus++) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + KEY },
      body: JSON.stringify({ model: 'gpt-6-sol', reasoning_effort: 'none', max_completion_tokens: 320, prompt_cache_options: { mode: 'explicit' },
        messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }] }) });
    if (res.ok) { const d = await res.json(); return { text: String(d.choices[0].message.content || '').trim(), usage: d.usage, finish: d.choices[0].finish_reason }; }
    const t = await res.text(); if (res.status === 429 || res.status >= 500) { await new Promise((r) => setTimeout(r, 2000 * (pokus + 1))); continue; }
    throw new Error('sol ' + res.status + ' ' + t.slice(0, 200));
  }
  throw new Error('sol: 3 pokusy selhaly');
}
(async () => {
  const opak = Number(process.argv[2] || 2), life = runa('Isa'), sys = S.buildSysPrompt(null, 'en'), vysl = [];
  const puvodni = vm.runInContext('_askLifeContext', S);
  for (const [vk, vt] of Object.entries(V).filter(([k]) => !process.env.KOLO2 || k === 'V1' || k === 'V3')) {
    S.__vt = vt; S.__K = (life.k || ''); S.__P = PROZA.Isa;
    vm.runInContext(vt === null ? '_askLifeContext = __puvodni;' : '_askLifeContext = function (l, g) { return l ? __vt.replace("{L}", rnPrompt(l)).replace("{K}", __K).replace("{P}", __P) : ""; };',
      Object.assign(S, { __puvodni: puvodni }));
    for (const c of cteni) {
      const dr = runa(c.rune_name), pd = c.prompt_draws || {};
      for (const [qk, qt] of Object.entries(Q)) {
        const q = qt.replace('{L}', 'Isa').replace('{R}', dr.n);
        const prompt = S.buildAskPrompt(c.short_text, q, [dr], 'en', [], life,
          { area: c.area, intention: c.intention, seeking: c.seeking, question: c.question }, { mode: 'single', runy: [S.rnPrompt(dr)] }, pd.kws || '', []);
        for (let i = 0; i < opak; i++) {
          if (process.env.DRY) { if (i === 0 && dr.n === 'Raidho') { console.log('---', vk, qk); console.log(prompt.split(String.fromCharCode(10)).filter((l) => /LIFE RUNE|QUESTION|Isa/.test(l)).join(' || ')); } continue; }
          const r = await sol(sys, prompt);
          vysl.push({ v: vk, q: qk, runa: dr.n, otazka: q, text: r.text, finish: r.finish, usage: r.usage });
          process.stdout.write(vk + qk + dr.n[0] + ' ');
        }
      }
    }
  }
  fs.writeFileSync(path.join(H, process.env.KOLO2 ? 'zivotni_kolo2.json' : 'zivotni_vysledky.json'), JSON.stringify(vysl, null, 1));
  console.log('\nhotovo', vysl.length);
})().catch((e) => { console.error('CHYBA', e.message); process.exit(1); });
