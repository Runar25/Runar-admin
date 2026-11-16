// CODE-tune 2026-11-16 — Ask „Where does this get hard?“: mluví přes obraz, i když člověk chce těžkost rovně?
// Podnět: hlášení 037966b4 (Algiz 04242…): na tip „Where does this get hard?“ odpověď přes obraz („from the sound alone“), owner musel
// napsat „Tell me the hard part without the image!“. Owner 2026-11-16 na otázku, zda to zkusit: „5. zkus“.
// Hypotéza (obrácená páka, CLAUDE.md §25 A): první pravidlo Asku končí „…; speak from what the picture holds“ — to táhne KAŽDOU odpověď
// do obrazu. P0 = produkce · P1 = bez té půlvěty (vada se odebírá, nic se nepřidává — memory oprava-promptu-odebira-vadu).
// Rozhodne: zda P1 sníží slova obrazu v odpovědi na tip „hard“ a nezhorší ji (texty čte owner). Půlvěta vznikla 2026-10-03 kvůli
// tipu „clearer image“ (úhel 2/4 → 0/4) — ten se tu NEměří; kdyby P1 vyhrála, napřed ověřit i ten tip.
// Prompt PRODUKČNÍ cestou (buildSysPrompt + buildAskPrompt přes vm, vstup bez řádku ✦ jako v produkci). Volání = callSol (sol, effort none).
// Čtení = čtyři ownerova (nesou jméno) — mimo repo, cesta argumentem; výstup taky mimo repo.
//   node ask_tezkost.js <cteni.json> <vystup.json> [opakovani=3]      DRY=1 → jen počet volání a ukázka promptu
'use strict';
const vm = require('vm'), fs = require('fs'), path = require('path'), os = require('os');
const V2 = path.join(__dirname, '..', '..', '..', 'v2');
const S = { console: { log() {}, warn() {}, error() {} }, document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] },
  localStorage: { getItem: () => null, setItem() {} } };
S.window = S; S.globalThis = S; vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-character.js', 'runar-utils.js'])
  vm.runInContext(fs.readFileSync(path.join(V2, f), 'utf8') + '\n;\n', S);
vm.runInContext('var lang = "en";', S);
const RU = vm.runInContext('RUNES', S), runa = (n) => RU.find((r) => r.n === n);
const src = fs.readFileSync(process.argv[2], 'utf8');
const CTENI = (() => { const j = JSON.parse(src.slice(src.search(/[\[{]/))); return Array.isArray(j) ? j : j.rows; })();
const OPAK = Number(process.argv[4] || 3);
const OTAZKA = vm.runInContext("UI_TEXT.en.ask_h_seek_challenge", S);   // „Where does this get hard?“ — tip z appky, jedno místo
const textCteni = (c) => { const t = String(c.short_text || '').split(/\n?\s*✦/)[0].trim(); if (t.indexOf('✦') !== -1) throw new Error('✦ ve vstupu'); return t; };
const PULVETA = ['what it narrowed to; speak from what the picture holds. ', 'what it narrowed to. '];
const VARIANTY = { P0: [], P1: [PULVETA] };

async function sol(system, prompt, key) {
  for (let pokus = 0; pokus < 4; pokus++) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + key },
      body: JSON.stringify({ model: 'gpt-6-sol', reasoning_effort: 'none', max_completion_tokens: 320, prompt_cache_options: { mode: 'explicit' },
        messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }] }) });
    if (res.ok) { const d = await res.json(); return { text: String(d.choices[0].message.content || '').trim(), usage: d.usage }; }
    const t = await res.text(); if (res.status === 429 || res.status >= 500) { await new Promise((r) => setTimeout(r, 2500 * (pokus + 1))); continue; }
    throw new Error('sol ' + res.status + ' ' + t.slice(0, 200));
  }
  throw new Error('sol: 4 pokusy selhaly');
}
(async () => {
  const life = runa('Isa'), sys = S.buildSysPrompt(null, 'en'), ulohy = [];
  for (const [vk, zmeny] of Object.entries(VARIANTY))
    for (const c of CTENI) {
      const dr = runa(c.rune_name), pd = typeof c.prompt_draws === 'string' ? JSON.parse(c.prompt_draws) : (c.prompt_draws || {});
      let pr = S.buildAskPrompt(textCteni(c), OTAZKA, S.rnPrompt(dr), 'en', [], life,
        { area: c.area, intention: c.intention, seeking: c.seeking, question: c.question }, { mode: 'single', runy: [S.rnPrompt(dr)] }, pd.kws || '', []);
      if (/\[object Object\]|undefined/.test(pr) || pr.indexOf('✦') !== -1) throw new Error('rozbitý vstup v promptu (nebo ✦)');
      for (const [z, na] of zmeny) { const pred = pr; pr = pr.split(z).join(na); if (pred === pr) throw new Error('nenalezeno: ' + z.slice(0, 60)); }
      for (let i = 0; i < OPAK; i++) ulohy.push({ v: vk, id: c.id.slice(0, 8), runa: dr.n, obraz: pd.image || '', prompt: pr });
    }
  if (process.env.DRY) { console.log(ulohy.length, 'volání · otázka:', OTAZKA); console.log(ulohy[ulohy.length - 1].prompt.slice(0, 1400)); return; }
  const key = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-openai-key.txt'), 'utf8').trim();
  const vysl = []; let i = 0;
  async function pracovnik() { while (i < ulohy.length) { const u = ulohy[i++]; const r = await sol(sys, u.prompt, key);
    vysl.push({ v: u.v, id: u.id, runa: u.runa, obraz: u.obraz, otazka: OTAZKA, text: r.text, usage: r.usage }); process.stdout.write('.'); } }
  await Promise.all([pracovnik(), pracovnik(), pracovnik()]);
  fs.writeFileSync(process.argv[3], JSON.stringify(vysl, null, 1));
  console.log('\nhotovo', vysl.length);
})().catch((e) => { console.error('CHYBA', e.message); process.exit(1); });
