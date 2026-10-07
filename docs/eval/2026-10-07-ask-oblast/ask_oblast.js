// CODE-tune 2026-10-07 — otázka na oblast v Asku z úplně rozdílných pohledů (KUKY: „zkus to. Jen anglicky a zkus víc variant otázky,
// ale takové varianty, které tu otázku berou z úplně rozdílných pohledů.“). Dohodnuto 2026-10-06/07: Ask dostane tutéž podobu oblasti
// jako čtení a tip se ptá na oblast. Tohle je LAB — do produkce nic (owner: „teď to dělat nebudeme… budeme dělat čtení a zjišťovat“).
// Data napřed (2026-10-07): v produkci 31 Asků na oblast, všechny bez podoby oblasti v promptu a skoro všechny s dnešním tipem;
// pojistka (does not say / leaves open / not a verdict) v 19 z 31. Ask s podobou oblasti ani jiné pohledy otázky v datech nejsou.
// Prompt PRODUKČNÍ cestou (buildSysPrompt + buildAskPrompt přes vm, v5.04), vstup čtení bez řádku ✦ (jako produkce, _splitThought).
// Jediná změna promptu: do bloku o zadání čtení se k oblasti připíše její podoba z TOHO čtení (prompt_draws.area_face).
// Otázky drží štítek oblasti jako nadpis (DECISIONS 2026-09-11: štítek = „Rúnar ví, co jsem zvolil“).
//   node ask_oblast.js <cteni.json> <vystup.json> [opakovani=2]      (DRY=1 → jen vypíše prompty, nic nevolá)
'use strict';
const vm = require('vm'), fs = require('fs');
const D_ = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const S = { console: { log() {}, warn() {}, error() {} }, document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] },
  localStorage: { getItem: () => null, setItem() {} } };
S.window = S; S.globalThis = S; vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-character.js', 'runar-utils.js'])
  vm.runInContext(fs.readFileSync(D_ + f, 'utf8') + '\n;\n', S);
vm.runInContext('var lang = "en";', S);
const RU = vm.runInContext('RUNES', S), runa = (n) => RU.find((r) => r.n === n);
const AF = vm.runInContext('AREA_FACES', S), AREAS = vm.runInContext('AREAS', S);
const src = fs.readFileSync(process.argv[2], 'utf8');
const CTENI = (() => { const j = JSON.parse(src.slice(src.search(/[\[{]/))); return Array.isArray(j) ? j : j.rows; })();
const VYBER = ['8dce4954', '779b3d33', 'cb4f2614'];   // Raidho · Healing & Wellbeing · Perth · Career & Creativity · Algiz · Love & Relationships (sol, 6. 10.)
const cteni = VYBER.map((id) => CTENI.find((c) => c.id.indexOf(id) === 0));
const OPAK = Number(process.argv[4] || 2);
const textCteni = (c) => { const t = String(c.short_text || '').split(/\n?\s*✦/)[0].trim(); if (t.indexOf('✦') !== -1) throw new Error('✦ ve vstupu'); return t; };

// Pět pohledů + dnešní tip jako srovnání. {area} = štítek, {rune} = jméno runy, {face} = podoba oblasti z čtení.
const OTAZKY = {
  B0_dnes:      '{area} — can you make this image clearer?',
  P1_runa:      '{area} — how does {rune} affect it in this reading?',       // vzor ownerovy otázky na životní runu (vztah dvou pojmenovaných věcí)
  P2_vyklad:    '{area} — what does this reading mean for it, in plain words?',   // vzor „Explain {rune} without the image“
  P3_podoba:    '{area} — how does this image relate to {face}?',             // podoba oblasti, na které čtení přistálo
  P4_vsedni:    '{area} — where might I notice this in my days?',             // konkrétní život, „one or two concrete possibilities“
  P5_tezkost:   '{area} — where does this get hard for me?',                  // druhá strana (dnešní tip k hledání „Insight into Challenge“)
};
async function sol(system, prompt) {
  const KEY = fs.readFileSync('C:/Users/zkuku/.claude/runar-openai-key.txt', 'utf8').trim();
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
  for (const [vk, zt] of Object.entries(OTAZKY)) {
    for (const c of cteni) {
      const dr = runa(c.rune_name), pd = typeof c.prompt_draws === 'string' ? JSON.parse(c.prompt_draws) : (c.prompt_draws || {});
      const ai = AREAS.en.indexOf(c.area), face = AF[ai][pd.area_face].en[0];
      const q = zt.replace('{rune}', dr.n).replace('{area}', c.area).replace('{face}', face);
      let pr = S.buildAskPrompt(textCteni(c), q, S.rnPrompt(dr), 'en', [], life,
        { area: c.area, intention: c.intention, seeking: c.seeking, question: c.question }, { mode: 'single', runy: [S.rnPrompt(dr)] }, pd.kws || '', []);
      if (/\[object Object\]|undefined/.test(pr) || pr.indexOf('✦') !== -1) throw new Error('rozbitý vstup v promptu (nebo ✦)');
      const kotva = 'the part of life it is for (' + c.area + ')';
      if (pr.indexOf(kotva) === -1) throw new Error('blok oblasti nenalezen');
      pr = pr.replace(kotva, 'the part of life it is for (' + c.area + ' — the reading landed on ' + face + ')');
      for (let i = 0; i < OPAK; i++) ulohy.push({ v: vk, runa: dr.n, oblast: c.area, podoba: face, otazka: q, prompt: pr });
    }
  }
  if (process.env.DRY || process.argv.includes('--dry-run')) { console.log(ulohy.length + ' volání'); const u = ulohy.find((x) => x.v === 'P3_podoba'); console.log(u.otazka + '\n---\n' + u.prompt); return; }
  const vysl = []; let i = 0;
  async function pracovnik() { while (i < ulohy.length) { const u = ulohy[i++]; const r = await sol(sys, u.prompt);
    vysl.push({ v: u.v, runa: u.runa, oblast: u.oblast, podoba: u.podoba, otazka: u.otazka, text: r.text, finish: r.finish, usage: r.usage });
    process.stdout.write('.'); } }
  await Promise.all([pracovnik(), pracovnik(), pracovnik(), pracovnik()]);
  fs.writeFileSync(process.argv[3], JSON.stringify(vysl, null, 1));
  console.log('\nhotovo', vysl.length);
})().catch((e) => { console.error('CHYBA', e.message); process.exit(1); });
