// souhrn_lab.js — lab souhrnu týdne z run dne (CODE-tune 2026-11-19). Vzorek přes sol, vstup jako by šel v produkci.
//
// Proč (owner 2026-11-19): „bude to jedna runa po druhé. ne to, že ta, co se objeví víckrát, bude tvořit základ. to bude patřit jen stromu.
// … od pondělí do neděle. rekapitulace přijde v neděli hned po tom, co člověk udělá rune of the day“; „čtení jsou víc mířená na člověka
// samotného … každé čtení musí být originální“. Owner schválil 4 volání („4. ano“).
// Systém = buildSysPrompt (jako runa dne v claude-proxy), na konec user promptu NO COLD READING z produkce (_noColdRead), model a
// reasoning jako runa dne. Výstup + celý prompt → vysledky.json vedle (pravidlo „každé čtení uložit s tím, z čeho vzniklo“).
//   node docs/eval/2026-11-19-souhrn-tydne/souhrn_lab.js [--dry-run]
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), os = require('os');
const ROOT = path.join(__dirname, '..', '..', '..');
const DRY = process.argv.includes('--dry-run');

const ls = new Map();
const S = { console: { log() {}, warn() {}, error() {} },
  localStorage: { getItem: (k) => (ls.has(k) ? ls.get(k) : null), setItem: (k, v) => ls.set(k, String(v)), removeItem: (k) => ls.delete(k) } };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-character.js', 'runar-utils.js'])
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'v2', f), 'utf8') + '\n;\n', S);
const RUNES = vm.runInContext('RUNES', S);
const MAXTOK = vm.runInContext('RUNAR_MODES', S).rune_day.max_tokens;

const DNY = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
// Týdny z ručních ukázek; neděle je vždy tažená (souhrn přichází po nedělním tahu), null = den bez tahu.
const TYDNY = {
  A: ['Isa', 'Raidho', null, 'Isa', 'Laguz', 'Sowilo', 'Berkana'],
  B: ['Fehu', 'Hagalaz', null, 'Nauthiz', null, 'Gebo', 'Wunjo'],
  C: ['Ansuz', 'Kenaz', 'Ehwaz', 'Mannaz', 'Thurisaz', 'Jera', 'Dagaz'],
  D: ['Algiz', 'Blank', 'Perth', 'Tiwaz', null, 'Othila', 'Algiz'],
};

function prompt(tyden) {
  const radky = tyden.map((n, i) => {
    if (!n) return null;
    const r = RUNES.find((x) => x.n === n);
    return '- ' + DNY[i] + ': ' + r.n + ' (' + r.k + ')';
  }).filter(Boolean);
  return [
    'This is not a reading. It is Sunday, and the seeker has just drawn the last rune of their week.',
    'These are the runes of the day they drew this week, Monday to Sunday. Speak to them about what their week brought.',
    '',
    'Their week:',
    ...radky,
    '',
    'Go through the week in its order, one rune after the next, so they can see how the week moved.',
    'Let each rune pass into the next; not one separate sentence for each day.',
    '',
    'How to speak:',
    '- If a rune came back later in the week, you may say that it returned. Never give numbers: not how many days, not how often.',
    '- Do not predict the coming week. This looks back on the week that has passed; it is not a forecast.',
    '- Say it in words, not in images or scenes. No exclamation marks.',
    '- Four to six sentences, one paragraph, no headings.',
    '',
    S._noColdRead('en', true),
  ].join('\n');
}

async function sol(system, user, key) {   // jako scripts/runa_dne_knihovna.js (SOL_EFFORTS z claude-proxy)
  for (let pokus = 0; pokus < 4; pokus++) {
    for (const eff of ['none', 'minimal']) {
      const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST',
        headers: { 'content-type': 'application/json', authorization: 'Bearer ' + key },
        body: JSON.stringify({ model: 'gpt-6-sol', reasoning_effort: eff, max_completion_tokens: MAXTOK,
          messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }) });
      if (res.status === 400 && eff === 'none') continue;
      if (res.ok) { const d = await res.json(); return { text: String(d.choices[0].message.content || '').trim(), usage: d.usage, effort: eff }; }
      if (res.status === 429 || res.status >= 500) { await new Promise((r) => setTimeout(r, 2500 * (pokus + 1))); break; }
      throw new Error('sol ' + res.status + ' ' + (await res.text()).slice(0, 200));
    }
  }
  throw new Error('sol: 4 pokusy selhaly');
}

(async () => {
  const system = S.buildSysPrompt(null, 'en');
  if (DRY) { console.log('volání:', Object.keys(TYDNY).length); console.log(prompt(TYDNY.A)); return; }
  const key = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-openai-key.txt'), 'utf8').trim();
  const out = { kdy: new Date().toISOString(), model: 'gpt-6-sol', verze: vm.runInContext('RUNAR_PROMPT_VERSION', S), system, radky: [] };
  for (const [id, tyden] of Object.entries(TYDNY)) {
    const p = prompt(tyden), r = await sol(system, p, key);
    out.radky.push({ tyden: id, runy: tyden, prompt: p, text: r.text, usage: r.usage, effort: r.effort });
    console.log('\n== ' + id + ' ==\n' + r.text);
  }
  fs.writeFileSync(path.join(__dirname, 'vysledky.json'), JSON.stringify(out, null, 1), 'utf8');
})().catch((e) => { console.error('CHYBA', e.message); process.exit(1); });
