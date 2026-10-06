// CODE-read 2026-10-06 — pojistka „the rune does not say…“: dělá ji RÁMEC „runa = zdroj, který sděluje / nese obsah“?
// Owner: „neptal jsem se na sloveso say… ptal jsem se na ‚the rune does not say‘… hledáme něco, kde se říká, aby popsal runu…
// je to něco, co ta runa dělá, říká, ukazuje… tohle je EN gramatika.“
// Gramatika (Wiktionary „say“, sense 4: „To indicate in a written form“ — „The sign says it's 50 kilometres to Paris“, „What time does it
// say on the clock?“): „X does not say“ zachází s X jako s nápisem / ukazatelem, který podává informaci. Hypotéza: prompt Asku dělá z runy
// takový zdroj — hlavička „<runa> carries the sense of … Its other senses are …“ a pravidla „what the runes of this reading (actually) hold“,
// „from the runes of this reading“ — a když se člověk ptá na víc, než „nápis“ uvádí (a verdikt je zakázaný), odpověď zní „the rune does not say“.
// Vstup jako v produkci: čtení BEZ řádku ✦ (askRunar → readerTexts.short, _splitThought), runa přes rnPrompt, aspekt prompt_draws.kws,
// EN korekce prázdné (všech 28 řádků je IS). Volání = callSol (gpt-6-sol, none, 320, explicit cache). n = 30 na rameno (3 čtení × 2 tipy × 5).
//   P0 = produkce
//   X  = runa NIKDE jako nositel obsahu: hlavička bez „carries the sense / senses“, pravidla bez „what the runes … hold“ a „from the runes“
//   Y  = OBRÁCENĚ (§25): runa výslovně jako zdroj, který sděluje — „Raidho says: the road …“, „say what the runes of this reading say“
//   node ask_zdroj.js <cteni.json> <vystup.json> [opakovani]
'use strict';
const vm = require('vm'), fs = require('fs');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const KEY = fs.readFileSync('C:/Users/zkuku/.claude/runar-openai-key.txt', 'utf8').trim();
const S = { console: { log() {}, warn() {}, error() {} }, document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] },
  localStorage: { getItem: () => null, setItem() {} } };
S.window = S; S.globalThis = S; vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-character.js', 'runar-utils.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
vm.runInContext('var lang = "en";', S);
const RU = vm.runInContext('RUNES', S), runa = (n) => RU.find((r) => r.n === n);
const src = fs.readFileSync(process.argv[2], 'utf8');
const CTENI = (() => { const j = JSON.parse(src.slice(src.search(/[\[{]/))); return Array.isArray(j) ? j : j.rows; })();
const VYBER = ['bf8d8db8', 'cb4f2614', '5297799e'];
const cteni = VYBER.map((id) => CTENI.find((c) => c.id.indexOf(id) === 0));
const OPAK = Number(process.argv[4] || 5);
const PRAV_X = [
  ['— say what the runes of this reading actually hold,', '— stay with this reading,'],
  ['Say what the runes of this reading hold, in the terms of their own question.', 'Explain this reading in the terms of their own question.'],
  ['answer plainly in its terms, from the runes of this reading.', 'answer plainly in its terms.'],
];
const PRAV_Y = [
  ['— say what the runes of this reading actually hold,', '— say what the runes of this reading actually say,'],
  ['Say what the runes of this reading hold, in the terms of their own question.', 'Say what the runes of this reading say, in the terms of their own question.'],
  ['answer plainly in its terms, from the runes of this reading.', 'answer plainly in its terms, from what the runes of this reading say.'],
];
// hlavička aspektu: „In this reading <R> carries the sense of <a>. Its other senses are <x, y>.“
const HL = /In this reading (\w+) carries the sense of ([^.]+)\.(?: Its other senses are ([^.]+)\.)?/;
const HL_X = (m, r, a, rest) => 'Here: ' + a + (rest ? '; also ' + rest : '') + '.';
const HL_Y = (m, r, a, rest) => r + ' says: ' + a + (rest ? '. ' + r + ' also says: ' + rest : '') + '.';
const OTAZKY = { area: '{area} — can you make this image clearer?', expl: 'Explain {rune} without the image.' };
async function sol(system, prompt) {
  for (let pokus = 0; pokus < 4; pokus++) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + KEY },
      body: JSON.stringify({ model: 'gpt-6-sol', reasoning_effort: 'none', max_completion_tokens: 320, prompt_cache_options: { mode: 'explicit' },
        messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }] }) });
    if (res.ok) { const d = await res.json(); return { text: String(d.choices[0].message.content || '').trim(), usage: d.usage, finish: d.choices[0].finish_reason }; }
    const t = await res.text(); if (res.status === 429 || res.status >= 500) { await new Promise((r) => setTimeout(r, 2500 * (pokus + 1))); continue; }
    throw new Error('sol ' + res.status + ' ' + t.slice(0, 200));
  }
  throw new Error('sol: 4 pokusy selhaly');
}
function postav(c, q, v) {
  const dr = runa(c.rune_name), pd = typeof c.prompt_draws === 'string' ? JSON.parse(c.prompt_draws) : (c.prompt_draws || {});
  const cteniText = c.short_text.split(/\n\s*✦/)[0].trim();
  if (cteniText.includes('✦')) throw new Error('✦ ve vstupu');
  let pr = S.buildAskPrompt(cteniText, q, S.rnPrompt(dr), 'en', [], runa('Isa'),
    { area: c.area, intention: c.intention, seeking: c.seeking, question: c.question }, { mode: 'single', runy: [S.rnPrompt(dr)] }, pd.kws || '', []);
  if (/\[object Object\]|undefined/.test(pr)) throw new Error('rozbitý vstup');
  if (v === 'P0') return pr;
  if (!HL.test(pr)) throw new Error('hlavička aspektu nenalezena');
  pr = pr.replace(HL, v === 'X' ? HL_X : HL_Y);
  for (const [z, na] of (v === 'X' ? PRAV_X : PRAV_Y)) { if (pr.split(z).length !== 2) throw new Error('ne právě jednou: ' + z.slice(0, 50)); pr = pr.split(z).join(na); }
  if (v === 'X' && /carries the sense|other senses|runes of this reading (actually )?hold|from the runes/.test(pr)) throw new Error('X: rámec zůstal');
  return pr;
}
(async () => {
  const sys = S.buildSysPrompt(null, 'en'), ulohy = [];
  for (const v of ['P0', 'X', 'Y']) for (const [hk, zt] of Object.entries(OTAZKY)) for (const c of cteni) {
    const q = zt.replace('{rune}', c.rune_name).replace('{area}', c.area || '');
    const pr = postav(c, q, v);
    for (let i = 0; i < OPAK; i++) ulohy.push({ v, h: hk, z: 0, runa: c.rune_name, otazka: q, sablona: zt, prompt: pr, sys });
  }
  if (process.env.DRY) { for (const v of ['X', 'Y']) { const u = ulohy.find((x) => x.v === v && x.runa === 'Raidho'); console.log('=== ' + v + ' ===\n' + u.prompt.split('\n').slice(2, 3).join('\n') + '\n' + u.prompt.split('\n').filter((l) => /stay with|Explain this reading|answer plainly|runes of this reading say|from what the runes/.test(l)).map((l) => l.slice(0, 200)).join('\n')); } console.log(ulohy.length, 'volání'); return; }
  const vysl = []; let i = 0;
  async function pracovnik() { while (i < ulohy.length) { const u = ulohy[i++]; const r = await sol(u.sys, u.prompt);
    vysl.push({ v: u.v, h: u.h, z: u.z, runa: u.runa, otazka: u.otazka, sablona: u.sablona, text: r.text, finish: r.finish, usage: r.usage });
    process.stdout.write('.'); } }
  await Promise.all([pracovnik(), pracovnik(), pracovnik(), pracovnik()]);
  fs.writeFileSync(process.argv[3], JSON.stringify(vysl, null, 1));
  console.log('\nhotovo', vysl.length);
})().catch((e) => { console.error('CHYBA', e.message); process.exit(1); });
