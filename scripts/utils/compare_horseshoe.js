// compare_horseshoe.js — 3 reader + 3 shrine HORSESHOE čtení (7 run, identické zadání)
// Test: obohatí kontextová inteligence (V2) DLOUHÉ multi-rune čtení? (single test ukázal že krátké ne)
// Rozdíl = JEN system prompt. Prompt postaven JEDNOU a sdílen. Produkční proxy (Sonnet 4-5).
// Usage: node scripts/utils/compare_horseshoe.js
const fs = require('fs'), vm = require('vm');
const ctx = { lang: 'en', console, Math, Date, JSON }; vm.createContext(ctx);
for (const f of ['v2/runar-config.js','v2/runar-runes.js','v2/runar-translations.js','v2/runar-utils.js','v2/runar-character.js'])
  vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });

const built = vm.runInContext(`(function(){
  var u = { name:'Anna', lifeRune: RUNES[0], area:'work', seeking:'clarity', mood:'', intention:'', question:'' };
  // Horseshoe 7: Past Isa, Present Raidho, Hidden Hagalaz, Challenges Nauthiz, Outside Sowilo, Inner Mannaz, Outcome Dagaz
  var runes = [RUNES[10],RUNES[4],RUNES[8],RUNES[9],RUNES[15],RUNES[19],RUNES[23]];
  return {
    readerSys: buildSysPrompt(DEF_CHAR_EN, 'en'),
    shrineSys: buildSysPromptV2(u.lifeRune, 'en', 'focused'),
    prompt:    buildHorseshoePrompt(u, runes, 'en', []),
    runes:     runes.map(function(r){ return rn(r); }).join(' · ')
  };
})()`, ctx);

const KEY = 'sb_publishable_iS8zD-m5BC9N3BYJa3XnHQ_UTkIlNy2';
const PROXY = 'https://pmitxjvkeovijreepror.supabase.co/functions/v1/claude-proxy';
const TOK = 1300;

async function gen(system, prompt) {
  try {
    const r = await fetch(PROXY, { method:'POST',
      headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+KEY, 'apikey':KEY },
      body: JSON.stringify({ system, prompt, max_tokens: TOK }) });
    const d = await r.json();
    return d.text || ('[ERROR ' + r.status + ': ' + JSON.stringify(d.error || d) + ']');
  } catch (e) { return '[FETCH ERROR: ' + e.message + ']'; }
}

(async () => {
  console.log('═══ HORSESHOE · runy: ' + built.runes + ' · Anna · life rune Fehu · area work ═══');
  console.log('(system: reader=' + built.readerSys.length + ' zn · shrine V2=' + built.shrineSys.length + ' zn)\n');
  for (let i = 1; i <= 3; i++) { console.log('────────── READER #' + i + ' ──────────'); console.log(await gen(built.readerSys, built.prompt)); console.log(); }
  for (let i = 1; i <= 3; i++) { console.log('────────── SHRINE V2 #' + i + ' ──────────'); console.log(await gen(built.shrineSys, built.prompt)); console.log(); }
  console.log('═══ HOTOVO ═══');
})();
