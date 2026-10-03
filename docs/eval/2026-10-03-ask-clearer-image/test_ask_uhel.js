// 2026-10-03 — „Ask opakuje úhel“ (KUKY: „Ask opakuje úhel, oprav to“; report 2026-10-01 09:59 u Uruz: „Uruz gives you an image of
// strength at close range — model vyloženě opakuje angle, což by neměl“). Hypotéza: sdílené pravidlo proti studenému čtení říká
// Asku „Describe the image“ — čtení už obraz popsalo, takže Ask ho popíše ZNOVU i s úhlem čtení („the whole…, then only…“).
//   A = produkční Ask prompt · V = týž prompt bez „Describe the image;“ (jen v Asku; čtení ho potřebuje).
// Dvě ownerova čtení s úhlem [0] „celek → detail“ (Uruz × Purpose & Path, Kenaz × Family & Home), dvě nápovědy, 2 odpovědi na buňku.
// Model gpt-6-sol, strop 320 jako appka.
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OK = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-openai-key.txt'), 'utf8').trim();
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + ';\n', S);
vm.runInContext('lang="en";READ_ENGINE="sol";', S);
const RUNES = vm.runInContext('RUNES', S), rr = (n) => RUNES.find((r) => r.n === n);
const CTENI = [
  { runa: 'Uruz', area: 'Purpose & Path', seeking: 'Confirmation', aspekt: 'strength',
    text: 'You see the whole stone in the earth, then only the edge your fingers can reach. You lift it, and damp soil clings beneath the place no one else could get under. Uruz names that strength: what you can move without knowing the whole way forward. Kuky, this may be a firmer footing or an open path.' },
  { runa: 'Kenaz', area: 'Family & Home', seeking: 'Clarity', aspekt: 'inner light',
    text: 'You see the whole bench beneath a single lamp, then only the empty place beside you stays in view. Kenaz gives light to what is near, not to everything at once. At home, that empty place can mean more than one thing, and its meaning is not yours alone to settle. Among your people, someone’s absence may now be harder to overlook.' },
];
const DESCRIBE = 'Describe the image; their inner life is not yours to narrate.';
async function volej(sys, p) {
  for (const eff of ['none', 'minimal']) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + OK },
      body: JSON.stringify({ model: 'gpt-6-sol', reasoning_effort: eff, max_completion_tokens: 320,
        messages: [{ role: 'system', content: sys }, { role: 'user', content: p }] }) });
    if (res.status === 400 && eff === 'none') continue;
    const d = await res.json(); if (!res.ok) throw new Error('sol ' + res.status);
    return String(d.choices[0].message.content || '').trim();
  }
}
(async () => {
  const sys = S.buildSysPrompt(null, 'en'), out = [];
  for (const c of CTENI) for (const q of [c.area + ' — can you make this image clearer?', 'What is this reading telling me?']) {
    const pA = S.buildAskPrompt(c.text, q, c.runa, 'en', [], rr('Isa'), { area: c.area, intention: '', seeking: c.seeking, question: '' }, null, c.aspekt);
    if (pA.indexOf(DESCRIBE) === -1) throw new Error('věta Describe v Ask promptu není');
    const pV = pA.replace(DESCRIBE, 'Their inner life is not yours to narrate.');
    // W (2026-10-03, po V = vyvráceno): Ask jen dostane, že čtení člověk právě četl — neopakovat ho (obraz ani to, jak začalo).
    const W = 'They have just read this reading. Do not repeat it back to them, neither its picture in the same words nor the way it opened. Give them what it did not say.';
    const pW = pA.replace('Speak as Rúnar', W + ' Speak as Rúnar');
    if (pW === pA) throw new Error('kotva pro W v Ask promptu není');
    // W2 (po W: úhel zmizel, ale i obraz): obraz smí, jen ne to, JAK ho čtení otevřelo (kam se podívalo napřed, na co se zúžilo).
    const W2 = 'They have just read this reading. Do not retell how it opened, where it looked first and what it narrowed to; speak from what the picture holds.';
    const pW2 = pA.replace('Speak as Rúnar', W2 + ' Speak as Rúnar');
    const VAR = process.argv[2] === 'W' ? [['W', pW]] : process.argv[2] === 'W2' ? [['W2', pW2]] : [['A', pA], ['V', pV]];
    for (const [v, p] of VAR) for (let k = 0; k < 2; k++) {
      const a = await volej(sys, p);
      out.push({ runa: c.runa, otazka: q, varianta: v, k, odpoved: a });
      console.log('\n[' + c.runa + ' · ' + q.slice(0, 40) + ' · ' + v + k + '] ' + a);
    }
  }
  fs.writeFileSync(path.join(__dirname, process.argv[2] ? 'test_ask_uhel_' + process.argv[2] + '.json' : 'test_ask_uhel.json'), JSON.stringify(out, null, 1));
})().catch((e) => { console.error('CHYBA ' + e.message); process.exit(1); });
