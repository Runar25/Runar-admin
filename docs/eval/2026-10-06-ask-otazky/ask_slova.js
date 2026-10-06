// CODE-tune 2026-10-06 — slova otázek a pojistka v Asku na solu (KUKY: „projdi ostatní otázky v ASK, jestli jsou správně
// formulované… zkoušet různá slova“).
// ⚠️ OPRAVA VSTUPU 2026-10-06 večer (CODE-read, předávka proti 70d728f): do té doby harness posílal do Asku `short_text` z DB, který
// končí řádkem myšlenky ✦ — produkce ho Asku NEposílá (askRunar bere readerTexts.short = text po _splitThought, runar-reading.js).
// Všechna kola do té doby měla jiný vstup než produkce. Teď se ✦ odřízne a pojistka hlídá, že ve vstupu nezůstal.
// Prompt se staví PRODUKČNÍ cestou (buildSysPrompt + buildAskPrompt přes vm, runa jako JMÉNO přes rnPrompt). Volání = callSol.
//   A (pojistka, tipy area + expl, n = 3 čtení × 2 tipy × opakování): P0 produkce · P1 bez věty o možnostech · P2 bez věty o zrcadlení ·
//     P3 bez NO COLD READING · P4 všechny tři · P5 charakter bez „never predicts / does not guarantee / Never hand… a conclusion“ ·
//     P6 čtení bez poslední věty (most) · P7 „…or how it ended“ · HLAVA hlavička aspektu bez runy jako „nositele“ · PRAVIDLA tři pravidla
//     bez „what the runes … hold / from the runes“ (znění HLAVA a PRAVIDLA = testovací znění CODE-read, docs/eval/2026-10-06-ask-pojistka)
//   B (slova tipů, n = 3 × opakování): dnešní znění + dvě jiná; R1 = dnešní znění + věta do pravidel
//   D („drawn“, otázky na životní runu): STARE = 5 míst se slovem „drawn“ (do v4.99) · NOVE = produkce (v5.00)
//   node ask_slova.js <cteni.json> <vystup.json> A|B|D [opakovani]   (VARIANTA=P6 → jen jedno rameno)
'use strict';
const vm = require('vm'), fs = require('fs');
const D_ = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const KEY = fs.readFileSync('C:/Users/zkuku/.claude/runar-openai-key.txt', 'utf8').trim();
const S = { console: { log() {}, warn() {}, error() {} }, document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] },
  localStorage: { getItem: () => null, setItem() {} } };
S.window = S; S.globalThis = S; vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-character.js', 'runar-utils.js'])
  vm.runInContext(fs.readFileSync(D_ + f, 'utf8') + '\n;\n', S);
vm.runInContext('var lang = "en";', S);
const RU = vm.runInContext('RUNES', S), runa = (n) => RU.find((r) => r.n === n);
const src = fs.readFileSync(process.argv[2], 'utf8');
const CTENI = (() => { const j = JSON.parse(src.slice(src.search(/[\[{]/))); return Array.isArray(j) ? j : j.rows; })();
const VYBER = ['bf8d8db8', 'cb4f2614', '5297799e'];   // Raidho mohyly · Algiz sob · Sowilo půlnoční slunce (ownerova čtení 2026-10-06, sol)
const cteni = VYBER.map((id) => CTENI.find((c) => c.id.indexOf(id) === 0));
const POKUS = process.argv[4] || 'A', OPAK = Number(process.argv[5] || (POKUS === 'A' ? 5 : POKUS === 'D' ? 2 : 3));
// Text čtení tak, jak ho produkce posílá Asku: bez řádku ✦ (_splitThought).
const textCteni = (c) => { const t = String(c.short_text || '').split(/\n?\s*✦/)[0].trim(); if (t.indexOf('✦') !== -1) throw new Error('✦ ve vstupu'); return t; };
const bezMostu = (t) => { const v = t.split(/(?<=[.!?])\s+/); v.pop(); return v.join(' '); };

const VETA_MOZNOSTI = 'If they ask what it could be for them, offer one or two concrete possibilities drawn from the image and the rune, each spoken as something that may be so.\n';
const VETA_ZRCADLO = 'Do not mirror the seeker: if the question asserts or implies something, neither confirm it nor take it up — say what the runes of this reading actually hold, even where that is not what the question expects.\n';
const NCR = vm.runInContext('_noColdRead("en")', S);
const HL = /In this reading (\w+) carries the sense of ([^.]+)\.(?: Its other senses are ([^.]+)\.)?/;
const HL_X = (m, r, a, rest) => 'Here: ' + a + (rest ? '; also ' + rest : '') + '.';
const PRAV_X = [
  ['— say what the runes of this reading actually hold,', '— stay with this reading,'],
  ['Say what the runes of this reading hold, in the terms of their own question.', 'Explain this reading in the terms of their own question.'],
  ['answer plainly in its terms, from the runes of this reading.', 'answer plainly in its terms.'],
];
const VARIANTY = {
  A: { P0: [], P1: [[VETA_MOZNOSTI, '']], P2: [[VETA_ZRCADLO, '']], P3: [['\n\n' + NCR, '']], P4: [[VETA_MOZNOSTI, ''], [VETA_ZRCADLO, ''], ['\n\n' + NCR, '']],
    P5: [], P6: [], P7: [['Do not retell how it opened, where it looked first and what it narrowed to; speak', 'Do not retell how it opened, where it looked first, what it narrowed to or how it ended; speak']],
    HLAVA: [], PRAVIDLA: PRAV_X },
  B: { P0: [], R1: [['Output ONLY your answer as flowing prose.', 'Begin with the answer itself, not with the words of the question.\nOutput ONLY your answer as flowing prose.']] },
  // D: STARÉ znění Asku (do v4.99) se složí ZPĚT z produkce — pět míst, kde stálo „drawn“ (DECISIONS 2026-10-06 (8)).
  D: { STARE: [[/\nThe runes? of this reading: /, '\nRunes drawn: '], ['say what the runes of this reading actually hold', 'say what the runes drawn actually hold'],
      ['turn the seeker back to the runes and this reading.', 'turn the seeker back to the runes and what was drawn.'],
      ['Say what the runes of this reading hold, in the terms', 'Say what the drawn runes hold, in the terms'],
      ['answer plainly in its terms, from the runes of this reading.', 'answer plainly in its terms, from the runes that were drawn.']], NOVE: [] },
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
  D: { Q1: ['How does my life rune {life} affect this reading?'], Q2: ['How does my life rune {life} affect {rune} in this reading?'], Q6: ['How does my life rune {life} show itself in this reading?'] },
};
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
    if (process.env.VARIANTA && vk !== process.env.VARIANTA) continue;
    let sys = sys0;
    for (const [z, na] of SYS_ZMENY[vk] || []) { if (sys.indexOf(z) === -1) throw new Error('v systémovém promptu nenalezeno: ' + z.slice(0, 60)); sys = sys.split(z).join(na); }
    for (const [hk, zneni] of Object.entries(OTAZKY[POKUS]))
      zneni.forEach((zt, zi) => {
        if (POKUS === 'B' && vk === 'R1' && zi > 0) return;   // R1 jen s dnešním zněním
        for (const c of cteni) {
          const dr = runa(c.rune_name), pd = typeof c.prompt_draws === 'string' ? JSON.parse(c.prompt_draws) : (c.prompt_draws || {});
          const q = zt.replace('{rune}', dr.n).replace('{area}', c.area || '').replace('{life}', 'Isa');
          const ct = vk === 'P6' ? bezMostu(textCteni(c)) : textCteni(c);
          let pr = S.buildAskPrompt(ct, q, S.rnPrompt(dr), 'en', [], life,
            { area: c.area, intention: c.intention, seeking: c.seeking, question: c.question }, { mode: 'single', runy: [S.rnPrompt(dr)] }, pd.kws || '', []);
          if (/\[object Object\]|undefined/.test(pr) || pr.indexOf('✦') !== -1) throw new Error('rozbitý vstup v promptu (nebo ✦)');
          if (vk === 'HLAVA') { if (!HL.test(pr)) throw new Error('hlavička aspektu nenalezena'); pr = pr.replace(HL, HL_X); }
          for (const [z, na] of zmeny) {
            const pred = pr; pr = typeof z === 'string' ? pr.split(z).join(na) : pr.replace(z, na);
            if (pred === pr) throw new Error('nenalezeno: ' + String(z).slice(0, 60));
          }
          if (vk === 'STARE' && (pr.match(/\bdrawn\b/g) || []).length < 6) throw new Error('STARE: „drawn“ se nevrátilo všude');
          for (let i = 0; i < OPAK; i++) ulohy.push({ v: vk, h: hk, z: zi, runa: dr.n, otazka: q, sablona: zt, prompt: pr, sys });
        }
      });
  }
  if (process.env.DRY) { console.log(ulohy.length, 'volání'); const u = ulohy[ulohy.length - 1]; console.log(u.prompt.slice(0, 900)); return; }
  const vysl = []; let i = 0;
  async function pracovnik() { while (i < ulohy.length) { const u = ulohy[i++]; const r = await sol(u.sys, u.prompt);
    vysl.push({ v: u.v, h: u.h, z: u.z, runa: u.runa, otazka: u.otazka, sablona: u.sablona, text: r.text, finish: r.finish, usage: r.usage });
    process.stdout.write('.'); } }
  await Promise.all([pracovnik(), pracovnik(), pracovnik(), pracovnik()]);
  fs.writeFileSync(process.argv[3], JSON.stringify(vysl, null, 1));
  console.log('\nhotovo', vysl.length);
})().catch((e) => { console.error('CHYBA', e.message); process.exit(1); });
