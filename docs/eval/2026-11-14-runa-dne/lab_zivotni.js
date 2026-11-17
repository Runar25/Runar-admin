// Lab: OSOBNÍ runa dne — runa dne potká životní runu (owner 2026-11-17: „to ve spojení s životní runou zkus udělat. raidho s životní
// runou gebo.“). Myšlenka: bezplatná runa dne jde z knihovny (stejná pro všechny), osobní verze se životní runou je placená vrstva.
// Prompt = PRODUKČNÍ buildDayRunePrompt (losy pák jako v produkci, pevná náhoda pro opakovatelnost) + JEDEN blok životní runy navíc,
// vložený před pravidla. Nic jiného se nemění, ať je vidět, co dělá ten blok.
// Rozhodne: zda životní runa v runě dne dává osobní text, který stojí za placenou vrstvu (texty čte owner).
//   node docs/eval/2026-11-14-runa-dne/lab_zivotni.js [--dry-run]
const fs = require('fs'), path = require('path'), vm = require('vm'), os = require('os');
const DRY = process.argv.includes('--dry-run');
const ROOT = path.join(__dirname, '..', '..', '..');
const S = { console: { log() {}, warn() {}, error() {} }, localStorage: { getItem: () => null, setItem() {} } };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-character.js', 'runar-utils.js'])
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'v2', f), 'utf8'), S);
const RUNES = vm.runInContext('RUNES', S);
const runa = (n) => RUNES.find((r) => r.n === n);

// Blok životní runy (návrh, laboratorní znění). IS psáno islandsky; korpus: „ber frá fæðingu“ / „mætir“ ověřit před produkcí.
const ZIVOTNI = {
  en: (L) => 'LIFE RUNE: ' + L.n + ' (' + L.k + ') — the rune this person carries from birth. In the second part, let today\'s rune meet '
    + 'it: what this day\'s rune may stir in someone who carries ' + L.n + '. Still only as something that may be so.',
  is: (L) => 'LÍFSRÚN: ' + L.n + ' (' + L.k_is + ') — rúnin sem þessi manneskja ber frá fæðingu. Í öðrum hluta mætir rún dagsins henni: '
    + 'hvað rún dagsins gæti vakið hjá þeim sem ber ' + L.n + '. Aðeins sem eitthvað sem gæti verið.',
};
const VZORKY = [ { lang: 'en', seed: 1 }, { lang: 'en', seed: 7 }, { lang: 'is', seed: 3 } ];

function seeded(seed) { let x = seed * 9301 + 49297; return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; }; }
function prompt(v) {
  vm.runInContext('Math.random = (' + seeded.toString() + ')(' + v.seed + ');', S);
  vm.runInContext('userGender = "kk"; lang = "' + v.lang + '";', S);
  const p = S.buildDayRunePrompt(runa('Raidho'), v.lang, []);
  const blok = ZIVOTNI[v.lang](runa('Gebo'));
  const kotva = v.lang === 'is' ? '\n\nÁVARP:' : '\n\n' + S._noColdRead('en', true).slice(0, 20);
  const i = p.indexOf(kotva);
  return { prompt: i > 0 ? p.slice(0, i) + '\n\n' + blok + p.slice(i) : p + '\n\n' + blok, losy: S._dayLosy() };
}

(async () => {
  const OUT = path.join(__dirname, 'vzorky_zivotni.jsonl');
  if (DRY) { const x = prompt(VZORKY[0]); console.log(x.prompt); console.log(JSON.stringify(x.losy)); return; }
  const KEY = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-openai-key.txt'), 'utf8').trim();
  for (const v of VZORKY) {
    const { prompt: p, losy } = prompt(v);
    const sys = S.buildSysPrompt(null, v.lang);
    let res;
    for (const eff of ['none', 'minimal']) {   // jako claude-proxy (SOL_EFFORTS)
      res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + KEY },
        body: JSON.stringify({ model: 'gpt-6-sol', reasoning_effort: eff, max_completion_tokens: 500,
          messages: [{ role: 'system', content: sys }, { role: 'user', content: p }] }),
      });
      if (res.status !== 400) break;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { console.error('HTTP ' + res.status, data.error && data.error.message); continue; }
    const text = ((data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '').trim();
    fs.appendFileSync(OUT, JSON.stringify({ kolo: 'zivotni1', vzorek: v, losy, prompt: p, text, usage: data.usage, generated_at: new Date().toISOString() }) + '\n', 'utf8');
    console.log('--- ' + JSON.stringify(v) + ' ' + JSON.stringify(losy) + '\n' + text + '\n');
  }
})();
