// CODE-read 2026-10-06 — pojistka „the rune / reading does not say…“ v Asku: nese ji sloveso SAY v pravidlech Asku?
// Handoff CODE-tune proti 5c28c3a (owner: „musí se identifikovat ta věta samotná… něco jak ‚say what the rune‘… odpověď modelu
// vypadá, že je odpověď na něco, co je přesně v instrukci“). Harness převzat z docs/eval/2026-10-06-ask-otazky/ask_slova.js
// (CODE-tune) — stejná produkční cesta (buildSysPrompt + buildAskPrompt přes vm, runa jako jméno), stejné volání jako callSol
// (gpt-6-sol, reasoning none, 320, explicit cache), stejná tři ownerova čtení a dva tipy, 3 opakování → n = 18 na rameno.
// V Ask promptu jsou PRÁVĚ DVĚ věty, kde runy „říkají“ (runar-character.js ~2030 a ~2033):
//   (1) „Do not mirror the seeker: … — say what the runes of this reading actually hold, …“
//   (2) „… answer in plain words. Say what the runes of this reading hold, in the terms of their own question.“
// Ramena (jedna páka):
//   P0 = produkce (výchozí, týž den)
//   V  = obě věty jiným slovesem, pravidlo zůstává: „answer from what the runes … hold“
//   R  = OBRÁCENÁ PÁKA (§25): obě věty ještě víc „say“ — „say plainly what the runes of this reading say“ → pojistky musí přibýt
//   node ask_say.js <cteni.json> <vystup.json> [opakovani]
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
const VYBER = ['bf8d8db8', 'cb4f2614', '5297799e'];   // Raidho mohyly · Algiz sob · Sowilo půlnoční slunce (ownerova čtení, mimo repo)
const cteni = VYBER.map((id) => CTENI.find((c) => c.id.indexOf(id) === 0));
const OPAK = Number(process.argv[4] || 3);
const V1 = '— say what the runes of this reading actually hold,', V2 = 'Say what the runes of this reading hold, in the terms of their own question.';
const VARIANTY = {
  P0: [],
  V: [[V1, '— answer from what the runes of this reading actually hold,'], [V2, 'Answer from what the runes of this reading hold, in the terms of their own question.']],
  R: [[V1, '— say plainly what the runes of this reading say,'], [V2, 'Say plainly what the runes of this reading say, in the terms of their own question.']],
};
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
(async () => {
  const life = runa('Isa'), sys = S.buildSysPrompt(null, 'en'), ulohy = [];
  for (const [vk, zmeny] of Object.entries(VARIANTY)) for (const [hk, zt] of Object.entries(OTAZKY)) for (const c of cteni) {
    const dr = runa(c.rune_name), pd = typeof c.prompt_draws === 'string' ? JSON.parse(c.prompt_draws) : (c.prompt_draws || {});
    const q = zt.replace('{rune}', dr.n).replace('{area}', c.area || '');
    let pr = S.buildAskPrompt(c.short_text, q, S.rnPrompt(dr), 'en', [], life,
      { area: c.area, intention: c.intention, seeking: c.seeking, question: c.question }, { mode: 'single', runy: [S.rnPrompt(dr)] }, pd.kws || '', []);
    if (/\[object Object\]|undefined/.test(pr)) throw new Error('rozbitý vstup v promptu');
    for (const [z, na] of zmeny) { if (pr.split(z).length !== 2) throw new Error('nenalezeno právě jednou: ' + z.slice(0, 60)); pr = pr.split(z).join(na); }
    if (vk === 'V' && /say what the runes/i.test(pr)) throw new Error('V: „say what the runes" zůstalo');
    for (let i = 0; i < OPAK; i++) ulohy.push({ v: vk, h: hk, z: 0, runa: dr.n, otazka: q, sablona: zt, prompt: pr, sys });
  }
  if (process.env.DRY) { console.log(ulohy.length, 'volání'); return; }
  const vysl = []; let i = 0;
  async function pracovnik() { while (i < ulohy.length) { const u = ulohy[i++]; const r = await sol(u.sys, u.prompt);
    vysl.push({ v: u.v, h: u.h, z: u.z, runa: u.runa, otazka: u.otazka, sablona: u.sablona, text: r.text, finish: r.finish, usage: r.usage });
    process.stdout.write('.'); } }
  await Promise.all([pracovnik(), pracovnik(), pracovnik(), pracovnik()]);
  fs.writeFileSync(process.argv[3], JSON.stringify(vysl, null, 1));
  console.log('\nhotovo', vysl.length);
})().catch((e) => { console.error('CHYBA', e.message); process.exit(1); });
