// Lab: Rune of the Day (Rúnar dagsins) — návrh promptu, jeden vzorek produkčním modelem (sol).
// Owner 2026-11-14 (DECISIONS 2026-11-14 (6), BACKLOG „Rune of the Day“): tři části (popis runy · co může runa v člověku
// vyvolat · na co se dnes zaměřit), bez obrazu, bez rady, bez předpovědi, bez stropu slov. „Napřed jedno a budeme upravovat.“
// Vzorek ownera (Berkana) do promptu NEJDE — model by ho opsal (memory prompt-directive-makes-model-copy).
// Brány bere z produkce (adresa, zákaz studeného čtení bez obrazu, korekce), system prompt taky — měří se, co by běželo.
//   node docs/eval/2026-11-14-runa-dne/lab.js --rune Berkana --lang en [--dry-run]
const fs = require('fs'), path = require('path'), vm = require('vm'), os = require('os');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const RUNA = arg('rune', 'Berkana'), LANG = arg('lang', 'en') === 'is' ? 'is' : 'en', DRY = process.argv.includes('--dry-run');
const ROOT = path.join(__dirname, '..', '..', '..');
const S = { console: { log() {}, warn() {}, error() {} } };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'v2', f), 'utf8'), S);
const r = vm.runInContext('RUNES', S).filter((x) => x.n.toLowerCase() === RUNA.toLowerCase())[0];
if (!r) { console.error('neznámá runa ' + RUNA); process.exit(1); }

// Návrh packu. IS: vazby ověřené is-vazba.py --freq (čísla v README), Greynir čisté.
const RP_DAY = {
  en: {
    intro: 'This is a short word on one rune for today — not a reading. There is no question and no area of life.',
    RUNE: 'RUNE', CORE: 'MEANINGS', rname: (x) => x.n, rcore: (x) => x.k,
    sections: 'Write one flowing text in three parts, with no headings or labels:',
    p1: 'First, what the rune is, in plain words.',
    p2: 'Then what this rune can bring up in people: what may be missing, or what may be there or not. Speak of it as something that can happen to anyone, not as a fact about the one who reads.',
    p3: 'Last, what is worth giving attention to today, as the rune points: something to notice, to think over or to tend. It is neither advice about their life nor a forecast of the day.',
    rules: 'Rúnar\'s voice — calm and clear. Say it in words, not in images or scenes. No exclamation marks.',
    lang: '',
  },
  is: {
    intro: 'Þetta er stutt orð um eina rún fyrir daginn í dag — ekki lestur. Engin spurning fylgir og ekkert svið lífsins.',
    RUNE: 'RÚN', CORE: 'MERKINGAR', rname: (x) => x.is_n, rcore: (x) => x.k_is,
    sections: 'Skrifaðu einn samfelldan texta í þremur hlutum, án fyrirsagna:',
    p1: 'Fyrst hvað rúnin er, á skýru máli.',
    p2: 'Síðan hvað þessi rún getur vakið hjá fólki: hvað kann að vanta, eða hvað kann að vera til staðar eða ekki. Talaðu um það sem eitthvað sem getur hent hvern sem er, en ekki sem það sem sé satt um þann sem les.',
    p3: 'Loks hverju er gott að gefa gaum í dag, eins og rúnin bendir á: eitthvað til að taka eftir, hugsa um eða hlúa að. Það er hvorki ráð um líf hans né spá um daginn.',
    rules: 'Rödd Rúnars — róleg og skýr. Segðu þetta með orðum, en ekki með myndum eða atvikum. Notaðu engin upphrópunarmerki.',
    lang: 'Svaraðu einungis á íslensku.',
  },
};
const P = RP_DAY[LANG];
const prompt = [
  [P.intro, '', P.RUNE + ': ' + P.rname(r), P.CORE + ': ' + P.rcore(r), '', P.sections, P.p1, P.p2, P.p3, '', P.rules, P.lang].filter((x, i, a) => x !== '' || a[i - 1] !== '').join('\n').trim(),
  S._addressContext(LANG),
  S._noColdRead(LANG, true),
  S.getCorrPrompt(LANG, null),
].filter(Boolean).join('\n\n');
const sys = S.buildSysPrompt(null, LANG);

(async () => {
  const OUT = path.join(__dirname, 'vzorky.jsonl');
  const radek = { rune: r.n, lang: LANG, prompt, generated_at: new Date().toISOString() };
  if (DRY) { console.log(prompt); return; }
  const KEY = process.env.OPENAI_API_KEY || fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-openai-key.txt'), 'utf8').trim();
  // Stejně jako claude-proxy: model SOL, reasoning_effort 'none' (na 400 'minimal').
  let res, data;
  for (const eff of ['none', 'minimal']) {
    res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + KEY },
      body: JSON.stringify({ model: 'gpt-6-sol', reasoning_effort: eff, max_completion_tokens: 600,
        messages: [{ role: 'system', content: sys }, { role: 'user', content: prompt }] }),
    });
    if (res.status !== 400) { radek.reasoning_effort = eff; break; }
  }
  data = await res.json().catch(() => ({}));
  if (!res.ok) { console.error('HTTP ' + res.status, data.error && data.error.message); process.exit(1); }
  radek.text = ((data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '').trim();
  radek.usage = data.usage;
  fs.appendFileSync(OUT, JSON.stringify(radek) + '\n', 'utf8');
  console.log(radek.text);
  console.log('\n(slov: ' + radek.text.split(/\s+/).filter(Boolean).length + ', zapsáno ' + OUT + ')');
})();
