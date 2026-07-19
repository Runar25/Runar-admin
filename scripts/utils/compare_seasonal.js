// compare_seasonal.js — ověření sezónní obraznosti + shuffle-bag (no-repeat).
// A) 10 různých run → reálná čtení z proxy (eyeball: už ne 10/10 stejný obraz).
// B) zachycený INJEKTOVANÝ obraz u každého čtení + distribuce (důkaz, že sáček rozdává bez opakování).
// C) Isa ×8 (jen injekce, bez proxy) → studená runa = vždy studený obraz dané sezóny, rotuje.
// localStorage je v Node shimnut do paměti, takže se testuje skutečný sáček.
// Usage: node scripts/utils/compare_seasonal.js
const fs = require('fs'), vm = require('vm');

// In-memory localStorage shim (per device) → vm uvidí skutečný sáček
const _store = {};
const localStorage = {
  getItem: (k) => (k in _store ? _store[k] : null),
  setItem: (k, v) => { _store[k] = String(v); },
  removeItem: (k) => { delete _store[k]; }
};

const ctx = { lang: 'en', console, Math, Date, JSON, localStorage }; vm.createContext(ctx);
for (const f of ['v2/runar-config.js','v2/runar-runes.js','v2/runar-translations.js','v2/runar-utils.js','v2/runar-character.js'])
  vm.runInContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f });

const PICKS = [0, 2, 4, 7, 10, 13, 16, 19, 22, 24]; // napříč futharkem (vč. Thurisaz=2, Isa=10 = studené)

const built = vm.runInContext(`(function(){
  var u = { name:'Kuky', lifeRune: RUNES[18], area:'work', seeking:'clarity', mood:'', intention:'', question:'' };
  function seasonalOf(p){ var L=p.split('\\n'); for(var i=0;i<L.length;i++){ if(L[i].indexOf('SEASONAL IMAGE')===0) return L[i]; } return '(none)'; }
  function build(i){ var d=RUNES[i]; var p=buildReadingPrompt(u, d, 'en', []); return { name: rn(d), cold: _isColdRune(d), prompt:p, seasonal: seasonalOf(p) }; }
  var varied = ${JSON.stringify(PICKS)}.map(build);
  // Isa ×8 (cold rune) — jen injekce
  var isaIdx = -1; for (var i=0;i<RUNES.length;i++) if (RUNES[i].n==='Isa') isaIdx=i;
  var isaRuns = []; for (var k=0;k<8;k++) isaRuns.push(build(isaIdx).seasonal);
  return { varied: varied, isaRuns: isaRuns, month: new Date().getMonth()+1 };
})()`, ctx);

const KEY = 'sb_publishable_iS8zD-m5BC9N3BYJa3XnHQ_UTkIlNy2';
const PROXY = 'https://pmitxjvkeovijreepror.supabase.co/functions/v1/claude-proxy';
const SYS = vm.runInContext('buildSysPrompt(DEF_CHAR_EN, "en")', ctx);

async function gen(prompt) {
  try {
    const r = await fetch(PROXY, { method:'POST',
      headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+KEY, 'apikey':KEY },
      body: JSON.stringify({ system: SYS, prompt, max_tokens: 400 }) });
    const d = await r.json();
    return d.text || ('[ERROR ' + r.status + ': ' + JSON.stringify(d.error || d) + ']');
  } catch (e) { return '[FETCH ERROR: ' + e.message + ']'; }
}

const img = (s) => { const m = s.match(/season — (.+?)\. Never/); return m ? m[1] : s; };

(async () => {
  console.log('═══ SEZÓNA + SHUFFLE-BAG — měsíc ' + built.month + ' ═══\n');

  console.log('────── A) 10 různých run → reálná čtení ──────\n');
  for (const it of built.varied) {
    const text = await gen(it.prompt);
    console.log('━━━ ' + it.name + (it.cold ? ' [cold]' : '') + ' ━━━');
    console.log(text + '\n');
  }

  console.log('────── B) INJEKTOVANÝ obraz u každého z 10 (bag = bez opakování) ──────');
  const tally = {};
  for (const it of built.varied) { const i = img(it.seasonal); tally[i] = (tally[i]||0)+1; console.log('  ' + it.name.padEnd(10) + (it.cold?'cold ':'     ') + '→ ' + i); }
  const dups = Object.entries(tally).filter(([,n]) => n > 1);
  console.log('  ⇒ unikátních obrazů: ' + Object.keys(tally).length + ' z 10  ·  opakování: ' + (dups.length ? dups.map(([k,n])=>n+'× '+k).join(', ') : 'žádné ✅'));

  console.log('\n────── C) Isa ×8 (studená runa) → vždy studený obraz sezóny, rotuje ──────');
  const itally = {};
  built.isaRuns.forEach((s,i) => { const x = img(s); itally[x] = (itally[x]||0)+1; console.log('  Isa #' + (i+1) + ' → ' + x); });
  console.log('  ⇒ unikátních: ' + Object.keys(itally).length + ' z 8  ·  žádný sníh-mimo-sezónu: ' +
    (built.isaRuns.every(s => !/snow/i.test(img(s))) ? 'OK ✅' : 'NALEZEN SNÍH ❌'));

  console.log('\n═══ HOTOVO ═══');
})();
