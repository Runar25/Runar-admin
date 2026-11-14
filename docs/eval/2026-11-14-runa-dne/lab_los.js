// Lab: Rune of the Day — pestrost losem (owner 2026-11-14: „pokud si člověk vytáhne druhý den znova Berkana, tak musí znít jinak…
// máš za úkol přijít na to, jak vytvářet rozdílná čtení… ve v2 je kam se koukat“). Páky jako ve v2: význam (aspekt), vstup do popisu
// (jako úhel čtení), první sloveso (ESSENCE_VERBS_SOL, korpus), čočka 2. části, zaměření 3. části. Owner téhož dne: 2. část smí
// k „ty“, jen jako možnost; 3. část pokaždé jinými slovy (bez pevné fráze). Losy tu jsou PEVNĚ dané (4 vzorky = 4 různé kombinace),
// ať se dá porovnat, co dělá která páka. Platnost pák pro všech 25 run (owner: „musí fungovat na všechny významy run, nebo výjimka“)
// se ověří zvlášť — tady jen Berkana EN.
//   node docs/eval/2026-11-14-runa-dne/lab_los.js [--dry-run]
const fs = require('fs'), path = require('path'), vm = require('vm'), os = require('os');
const DRY = process.argv.includes('--dry-run');
const ROOT = path.join(__dirname, '..', '..', '..');
const S = { console: { log() {}, warn() {}, error() {} } };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-character.js', 'runar-utils.js'])
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'v2', f), 'utf8'), S);
const RUNES = vm.runInContext('RUNES', S);
const VERBS = vm.runInContext('ESSENCE_VERBS_SOL', S);

const VSTUP = {
  name: 'Let the description come in through the rune\'s name and what it stood for in the old world.',
  shape: 'Let the description come in through the rune\'s shape — what its strokes are and what that shape suggests.',
  does: 'Let the description come in through what the rune does — the force or movement in it.',
  other: 'Let the description come in through the rune\'s other side — what it becomes when it goes too far, or when it is missing.',
};
const COCKA = {
  missing: 'Then what may be missing in you that this rune speaks to.',
  unseen: 'Then what may be there in you that goes unnoticed, which this rune brings into view.',
  toomuch: 'Then where there may be too much of what this rune carries, or where it has gone too far in you.',
};
const ZAMER = {
  notice: 'something to notice',
  think: 'something to think over',
  tend: 'something to tend or take care of',
};
// 4 vzorky Berkany, každá páka v jiné poloze (význam z klíčů runy).
const LOSY = [
  { rune: 'Berkana', vyznam: 'growth', vstup: 'shape', sloveso: 1, cocka: 'missing', zamer: 'notice' },
  { rune: 'Berkana', vyznam: 'nurturing', vstup: 'other', sloveso: 5, cocka: 'unseen', zamer: 'tend' },
  { rune: 'Berkana', vyznam: 'birth', vstup: 'name', sloveso: 2, cocka: 'toomuch', zamer: 'think' },
  { rune: 'Berkana', vyznam: 'new beginnings', vstup: 'does', sloveso: 0, cocka: 'unseen', zamer: 'notice' },
];

function prompt(l) {
  const r = RUNES.filter((x) => x.n === l.rune)[0];
  const V = VERBS[l.sloveso];
  return [
    ['This is a short word on one rune for today — not a reading. There is no question and no area of life.', '',
     'RUNE: ' + r.n, 'MEANINGS: ' + r.k, 'CENTRE TODAY: ' + l.vyznam, '',
     'Write one flowing text in three parts, with no headings or labels:',
     'First, what the rune is, in plain words, centred on the meaning above. The first sentence begins "' + r.n + ' ' + V + '". ' + VSTUP[l.vstup],
     COCKA[l.cocka] + ' Say it as something that may be so, never as fact.',
     'Last, what is worth giving attention to today, as the rune points: ' + ZAMER[l.zamer] + '. Say it in words of your own. It is neither advice about their life nor a forecast of the day.',
     '', 'Rúnar\'s voice — calm and clear. Say it in words, not in images or scenes. No exclamation marks.'].join('\n'),
    S._addressContext('en'), S._noColdRead('en', true), S.getCorrPrompt('en', null),
  ].filter(Boolean).join('\n\n');
}

(async () => {
  const sys = S.buildSysPrompt(null, 'en');
  const OUT = path.join(__dirname, 'vzorky.jsonl');
  if (DRY) { console.log(prompt(LOSY[0])); return; }
  const KEY = process.env.OPENAI_API_KEY || fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-openai-key.txt'), 'utf8').trim();
  for (const l of LOSY) {
    const p = prompt(l);
    let res;
    for (const eff of ['none', 'minimal']) {   // jako claude-proxy (SOL_EFFORTS)
      res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + KEY },
        body: JSON.stringify({ model: 'gpt-6-sol', reasoning_effort: eff, max_completion_tokens: 600,
          messages: [{ role: 'system', content: sys }, { role: 'user', content: p }] }),
      });
      if (res.status !== 400) break;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { console.error('HTTP ' + res.status, data.error && data.error.message); continue; }
    const text = ((data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '').trim();
    fs.appendFileSync(OUT, JSON.stringify({ kolo: 'los1', los: l, prompt: p, text, usage: data.usage, generated_at: new Date().toISOString() }) + '\n', 'utf8');
    console.log('--- ' + JSON.stringify(l) + '\n' + text + '\n');
  }
})();
