// CODE-tune 2026-10-06 — slova otázek v Asku na solu (KUKY: „projdi ostatní otázky v ASK, jestli jsou správně formulované…
// je potřeba nad tím přemýšlet, hledat cesty, zkoušet různá slova“).
// Prompt se staví PRODUKČNÍ cestou (buildSysPrompt + buildAskPrompt přes vm, runa jako JMÉNO — rnPrompt, jako v produkci;
// 2026-10-06 test s objektem runy dal „[object Object]“ a zfalšoval závěr). Volání = parametry claude-proxy callSol.
//   POKUS A „pojistka“ (odkud „the rune does not say…“): P0 produkce · P1 bez věty o možnostech · P2 bez věty o zrcadlení ·
//     P3 bez NO COLD READING — obrácená páka (CLAUDE.md §25): pokud věta pojistku dělá, bez ní musí pojistky ubýt.
//   POKUS A2: P4 všechny tři věty naráz (nedělají to spolu?) · P5 systémový prompt bez „never predicts… / does not guarantee
//     outcomes / Never hand the seeker a conclusion“ (dělá to charakter?).
//   POKUS B „slova otázky“: čtyři tipy, dnešní znění + dvě jiná; R1 = dnešní znění + jedna věta do pravidel.
//   node ask_slova.js <cteni.json> <vystup.json> [A|A2|B] [opakovani]
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
const VYBER = ['bf8d8db8', 'cb4f2614', '5297799e'];   // Raidho mohyly · Algiz sob · Sowilo půlnoční slunce (ownerova čtení 2026-10-06, sol)
const cteni = VYBER.map((id) => CTENI.find((c) => c.id.indexOf(id) === 0));
const POKUS = process.argv[4] || 'A', OPAK = Number(process.argv[5] || 3);

const VETA_MOZNOSTI = 'If they ask what it could be for them, offer one or two concrete possibilities drawn from the image and the rune, each spoken as something that may be so.\n';
const VETA_ZRCADLO = 'Do not mirror the seeker: if the question asserts or implies something, neither confirm it nor take it up — say what the runes of this reading actually hold, even where that is not what the question expects.\n';
const NCR = vm.runInContext('_noColdRead("en")', S);
const R1_VETA = 'Begin with the answer itself, not with the words of the question.';
const VARIANTY = {
  A: { P0: [], P1: [[VETA_MOZNOSTI, '']], P2: [[VETA_ZRCADLO, '']], P3: [['\n\n' + NCR, '']] },
  A4: { P7: [['Do not retell how it opened, where it looked first and what it narrowed to; speak', 'Do not retell how it opened, where it looked first, what it narrowed to or how it ended; speak']] },
  A2: { P4: [[VETA_MOZNOSTI, ''], [VETA_ZRCADLO, ''], ['\n\n' + NCR, '']], P5: [] },
  B: { P0: [], R1: [['Output ONLY your answer as flowing prose.', R1_VETA + '\nOutput ONLY your answer as flowing prose.']] },
};
const SYS_ZMENY = {
  P5: [['Rúnar never predicts fate or claims absolute truths.\n', ''], ['Rúnar never makes fear-based predictions.\n', ''],
    ['Rúnar does not guarantee outcomes.\n', ''], ['YOUR STANCE\nNever hand the seeker a conclusion.\n\n', '']],
};
const OTAZKY = {
  A: { area: ['{area} — can you make this image clearer?'], expl: ['Explain {rune} without the image.'] },
  B: {
    image: ['What is the image pointing to?', 'Where does this image lead?', 'What is this image about?'],
    hard: ['What does this say about the hard part?', 'Where does this get hard?', 'What is the difficulty here?'],
    rune: ['What does {rune} mean in this reading?', 'What does {rune} mean here?', 'What is {rune} doing here?'],
    now: ['Why is this showing up now?', 'What in this belongs to now?', 'Why does this matter now?'],
  },
};
OTAZKY.A2 = OTAZKY.A; OTAZKY.A4 = OTAZKY.A;
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
  const life = runa('Isa'), sys0 = S.buildSysPrompt(null, 'en'), ulohy = [];
  for (const [vk, zmeny] of Object.entries(VARIANTY[POKUS])) {
    if (process.env.VARIANTA && vk !== process.env.VARIANTA) continue;   // jen jedna varianta (např. P0 na upravených čteních)
    let sys = sys0;
    for (const [z, na] of SYS_ZMENY[vk] || []) { if (sys.indexOf(z) === -1) throw new Error('v systémovém promptu nenalezeno: ' + z.slice(0, 60)); sys = sys.split(z).join(na); }
    for (const [hk, zneni] of Object.entries(OTAZKY[POKUS]))
      zneni.forEach((zt, zi) => {
        if (POKUS === 'B' && vk === 'R1' && zi > 0) return;   // R1 jen s dnešním zněním
        for (const c of cteni) {
          const dr = runa(c.rune_name), pd = typeof c.prompt_draws === 'string' ? JSON.parse(c.prompt_draws) : (c.prompt_draws || {});
          const q = zt.replace('{rune}', dr.n).replace('{area}', c.area || '');
          let pr = S.buildAskPrompt(c.short_text, q, S.rnPrompt(dr), 'en', [], life,
            { area: c.area, intention: c.intention, seeking: c.seeking, question: c.question }, { mode: 'single', runy: [S.rnPrompt(dr)] }, pd.kws || '', []);
          if (/\[object Object\]|undefined/.test(pr)) throw new Error('rozbitý vstup v promptu');
          for (const [z, na] of zmeny) { if (pr.indexOf(z) === -1) throw new Error('nenalezeno: ' + z.slice(0, 60)); pr = pr.split(z).join(na); }
          for (let i = 0; i < OPAK; i++) ulohy.push({ v: vk, h: hk, z: zi, runa: dr.n, otazka: q, sablona: zt, prompt: pr, sys });
        }
      });
  }
  if (process.env.DRY) { console.log(ulohy.length, 'volání'); const u = ulohy[ulohy.length - 1]; console.log(u.sys.split('\n').slice(14, 26).join('\n')); return; }
  const vysl = []; let i = 0;
  async function pracovnik() { while (i < ulohy.length) { const u = ulohy[i++]; const r = await sol(u.sys, u.prompt);
    vysl.push({ v: u.v, h: u.h, z: u.z, runa: u.runa, otazka: u.otazka, sablona: u.sablona, text: r.text, finish: r.finish, usage: r.usage });
    process.stdout.write('.'); } }
  await Promise.all([pracovnik(), pracovnik(), pracovnik(), pracovnik()]);
  fs.writeFileSync(process.argv[3], JSON.stringify(vysl, null, 1));
  console.log('\nhotovo', vysl.length);
})().catch((e) => { console.error('CHYBA', e.message); process.exit(1); });
