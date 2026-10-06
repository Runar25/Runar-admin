// CODE-tune 2026-10-06 — přesná cena čtení na solu + automatický Ask na oblast (KUKY „chci to přesně… ASK nikdy není součást hlasu“).
// Čtení: buildSysPrompt + buildReadingPrompt + myšlenka ✦ (Standard/Premium) + připomínka délky — jako runar-reading.js, strop 700.
// Ask na oblast: buildAskPrompt s otázkou ask_h_image_area („<oblast> — can you make this image clearer?“), strop 320; varianta
// KRÁTCE = táž otázka + věta o délce. Volání = parametry claude-proxy callSol. Hlas = jen text čtení (✦ ani Ask se nenamlouvají).
//   node cena.js [pocet na jazyk]   → cena_vysledky.json
const vm = require('vm'), fs = require('fs'), path = require('path');
const H = __dirname, D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const KEY = fs.readFileSync('C:/Users/zkuku/.claude/runar-openai-key.txt', 'utf8').trim();
const S = { console: { log() {}, warn() {}, error() {} }, setTimeout: () => 0, clearTimeout() {}, navigator: {}, location: { search: '', href: '' }, addEventListener() {},
  document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, createElement: () => ({ style: {} }) },
  localStorage: { getItem: () => null, setItem() {} } };
S.window = S; S.globalThis = S; vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-character.js', 'runar-utils.js', 'runar-reading.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
vm.runInContext('var lang = "en"; var currentUser = { email: "test@example.com" }; var userTier = "premium"; var readerUser = {};', S);
const RU = vm.runInContext('RUNES', S), AREAS = vm.runInContext('AREAS', S), SEEKS = vm.runInContext('SEEKS', S);
const runa = (n) => RU.find((r) => r.n === n);
const MAX = vm.runInContext('RUNAR_MODES.quick_reading.max_tokens', S);
const KRATCE = { en: 'Answer in one or two short sentences.', is: 'Svaraðu í einni eða tveimur stuttum setningum.' };
const SADA = [['Hagalaz', 5], ['Raidho', 6], ['Algiz', 0], ['Sowilo', 1], ['Berkana', 3]];   // runa × index oblasti v AREAS
async function sol(system, prompt, max) {
  for (let pokus = 0; pokus < 3; pokus++) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + KEY },
      body: JSON.stringify({ model: 'gpt-6-sol', reasoning_effort: 'none', max_completion_tokens: max, prompt_cache_options: { mode: 'explicit' },
        messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }] }) });
    if (res.ok) { const d = await res.json(); return { text: String(d.choices[0].message.content || '').trim(), usage: d.usage, finish: d.choices[0].finish_reason }; }
    const t = await res.text(); if (res.status === 429 || res.status >= 500) { await new Promise((r) => setTimeout(r, 2000 * (pokus + 1))); continue; }
    throw new Error('sol ' + res.status + ' ' + t.slice(0, 200));
  }
  throw new Error('sol: 3 pokusy selhaly');
}
const textCteni = (raw) => {   // JSON pole [{rune, text}] → text; bez řádku ✦ (ten se nenamlouvá)
  let t = raw; try { const j = JSON.parse(raw.slice(raw.indexOf('['), raw.lastIndexOf(']') + 1)); t = j.map((x) => x.text).join(' '); } catch (e) {}
  return t.split(String.fromCharCode(10)).filter((l) => l.trim().indexOf('\u2726') !== 0).join(' ').trim();
};
(async () => {
  const n = Number(process.argv[2] || 5), out = [];
  for (const L of ['en', 'is']) {
    vm.runInContext('lang = ' + JSON.stringify(L) + ';', S);
    const sys = S.buildSysPrompt(null, L);
    for (let i = 0; i < n; i++) {
      const [rn, ai] = SADA[i % SADA.length], dr = runa(rn), area = AREAS[L][ai];
      const u = { name: 'Kuky', area, seeking: SEEKS[L][0], question: '', intention: '', lifeRune: runa('Isa') };
      let prompt = S.buildReadingPrompt(u, dr, L, []);
      const th = S._thoughtFor('SINGLE', [dr], L); if (th) prompt += String.fromCharCode(10) + th;
      const dl = S._lengthReminder(L); if (dl) prompt += String.fromCharCode(10) + dl;
      const c = await sol(sys, prompt, MAX);
      const txt = textCteni(c.text);
      const kws = (S._promptDraws(prompt, L) || {}).kws || '';
      const q = S.tp('ask_h_image_area', { area });
      const cast = { area, intention: '', seeking: u.seeking, question: '' }, sp = { mode: 'single', runy: [S.rnPrompt(dr)] };
      const pA = S.buildAskPrompt(txt, q, [dr], L, [], runa('Isa'), cast, sp, kws, []);
      const a1 = await sol(sys, pA, 320);
      const a2 = await sol(sys, pA + String.fromCharCode(10) + KRATCE[L], 320);
      out.push({ lang: L, runa: rn, area, cteni: { text: txt, znaku: txt.length, usage: c.usage, finish: c.finish },
        ask: { otazka: q, text: a1.text, usage: a1.usage }, askKratce: { text: a2.text, usage: a2.usage } });
      process.stdout.write(L + i + ' ');
    }
  }
  fs.writeFileSync(path.join(H, 'cena_vysledky.json'), JSON.stringify(out, null, 1));
  console.log('\nhotovo', out.length);
})().catch((e) => { console.error('CHYBA', e.message); process.exit(1); });
