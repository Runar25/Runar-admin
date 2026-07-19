// compare_shrine_reader.js — 3 reader + 3 shrine čtení pro JEDNU runu (identické zadání)
// Volá produkční claude-proxy (Sonnet 4-5) přes Supabase publishable key.
// Rozdíl = JEN system prompt: reader=buildSysPrompt, shrine=buildSysPromptV2 (kontext. inteligence).
// Prompt (vč. random angle) postaven JEDNOU a sdílen všemi 6 → čistý rozdíl system promptu.
// Usage: node scripts/utils/compare_shrine_reader.js
const fs = require('fs'), vm = require('vm');
const ctx = { lang: 'en', console, Math, Date, JSON }; vm.createContext(ctx);
for (const f of ['v2/runar-config.js','v2/runar-runes.js','v2/runar-translations.js','v2/runar-utils.js','v2/runar-character.js'])
  vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });

const built = vm.runInContext(`(function(){
  var u = { name:'Anna', lifeRune: RUNES[0], area:'work', seeking:'clarity', mood:'', intention:'', question:'' };
  var drawn = RUNES[10]; // Isa
  return {
    readerSys: buildSysPrompt(DEF_CHAR_EN, 'en'),
    shrineSys: buildSysPromptV2(u.lifeRune, 'en', 'focused'),
    prompt:    buildReadingPrompt(u, drawn, 'en', []),
    drawn:     rn(drawn), life: rn(u.lifeRune)
  };
})()`, ctx);

const KEY = 'sb_publishable_iS8zD-m5BC9N3BYJa3XnHQ_UTkIlNy2';
const PROXY = 'https://pmitxjvkeovijreepror.supabase.co/functions/v1/claude-proxy';

async function gen(system, prompt) {
  try {
    const r = await fetch(PROXY, { method:'POST',
      headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+KEY, 'apikey':KEY },
      body: JSON.stringify({ system, prompt, max_tokens: 700 }) });
    const d = await r.json();
    return d.text || ('[ERROR ' + r.status + ': ' + JSON.stringify(d.error || d) + ']');
  } catch (e) { return '[FETCH ERROR: ' + e.message + ']'; }
}

(async () => {
  console.log('═══ DRAWN: ' + built.drawn + ' · user Anna · life rune ' + built.life + ' · area work · seeking clarity ═══\n');
  console.log('(system promptů: reader=' + built.readerSys.length + ' zn · shrine V2=' + built.shrineSys.length + ' zn)\n');
  for (let i = 1; i <= 3; i++) { console.log('────────── READER #' + i + ' ──────────'); console.log(await gen(built.readerSys, built.prompt)); console.log(); }
  for (let i = 1; i <= 3; i++) { console.log('────────── SHRINE V2 #' + i + ' ──────────'); console.log(await gen(built.shrineSys, built.prompt)); console.log(); }
  console.log('═══ HOTOVO ═══');
})();
