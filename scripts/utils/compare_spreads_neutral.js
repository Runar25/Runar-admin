// compare_spreads_neutral.js — Norns/Cross/Horseshoe, NEUTRÁLNÍ runy (ne zimní),
// 1 reader + 1 shrine každý. Test: vypluje sezóna (léto/Sólmánuður) ve V2 když ji runy nedusí?
// Usage: node scripts/utils/compare_spreads_neutral.js
const fs = require('fs'), vm = require('vm');
const ctx = { lang: 'en', console, Math, Date, JSON }; vm.createContext(ctx);
for (const f of ['v2/runar-config.js','v2/runar-runes.js','v2/runar-translations.js','v2/runar-utils.js','v2/runar-character.js'])
  vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });

const built = vm.runInContext(`(function(){
  var u = { name:'Anna', lifeRune: RUNES[0], area:'work', seeking:'clarity', mood:'', intention:'', question:'' };
  // neutrální (ne-zimní) runy: Gebo Wunjo Raidho Berkana Sowilo Mannaz Dagaz
  var G=RUNES[6],W=RUNES[7],R=RUNES[4],B=RUNES[17],S=RUNES[15],M=RUNES[19],D=RUNES[23];
  return {
    readerSys: buildSysPrompt(DEF_CHAR_EN, 'en'),
    shrineSys: buildSysPromptV2(u.lifeRune, 'en', 'focused'),
    norns:     buildNornsPrompt(u, [G,W,M], 'en', []),
    cross:     buildKrizPrompt(u, [G,S,R,B,M], 'en', []),
    horseshoe: buildHorseshoePrompt(u, [G,W,R,B,S,M,D], 'en', [])
  };
})()`, ctx);

const KEY = 'sb_publishable_iS8zD-m5BC9N3BYJa3XnHQ_UTkIlNy2';
const PROXY = 'https://pmitxjvkeovijreepror.supabase.co/functions/v1/claude-proxy';
async function gen(system, prompt, tok) {
  try {
    const r = await fetch(PROXY, { method:'POST',
      headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+KEY, 'apikey':KEY },
      body: JSON.stringify({ system, prompt, max_tokens: tok }) });
    const d = await r.json();
    return d.text || ('[ERROR ' + r.status + ': ' + JSON.stringify(d.error || d) + ']');
  } catch (e) { return '[FETCH ERROR: ' + e.message + ']'; }
}

(async () => {
  const spreads = [['NORNS', built.norns, 900], ['CROSS', built.cross, 1100], ['HORSESHOE', built.horseshoe, 1300]];
  console.log('═══ NEUTRÁLNÍ runy · Anna · life rune Fehu · area work · (teď léto = Sólmánuður) ═══\n');
  for (const [name, prompt, tok] of spreads) {
    console.log('\n############### ' + name + ' ###############');
    console.log('───── READER ─────'); console.log(await gen(built.readerSys, prompt, tok)); console.log();
    console.log('───── SHRINE V2 ─────'); console.log(await gen(built.shrineSys, prompt, tok)); console.log();
  }
  console.log('═══ HOTOVO ═══');
})();
