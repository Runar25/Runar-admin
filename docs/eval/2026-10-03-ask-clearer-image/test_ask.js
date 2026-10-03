// 2026-10-03 — Ask „clearer image“ (KUKY bod 13: „ať u clearer image zůstane u stejného obrazu“; report 2026-10-01 10:36 u Thurisaz:
// „Dal mi jiný obraz… Jak to, že nezůstal u stejného obrazu?“). Nápověda ask_h_image_area zní „{area} — can you give me a clearer
// image?“ — „give me a … image“ si model čte jako NOVÝ obraz. Varianta: „{area} — can you make this image clearer?“ (TENTÝŽ obraz).
// Tři ownerova čtení z DB (Thurisaz × Career, Kenaz × Family, Fehu × Love) — jejich skutečné odpovědi se starou nápovědou jsou
// v nova_cteni (DB follow_up). Prompt = produkční buildAskPrompt (text čtení bez ✦, aspekt z draws, životní runa Isa, volby čtení).
// Model gpt-6-sol (ownerův engine), strop 320 tokenů jako appka.
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
  { runa: 'Thurisaz', area: 'Career & Creativity', seeking: 'Insight into Challenge', aspekt: 'gateway',
    text: 'At the gate, you see the ram lower its head, its hoof scraping the ground as you wait. Thurisaz holds the sharp pause before a force meets resistance. The urge to answer pressure with pressure is real, and silence can expose what force conceals. Kuky, what you make for others may leave room for a reply instead of a blow.' },
  { runa: 'Kenaz', area: 'Family & Home', seeking: 'Clarity', aspekt: 'inner light',
    text: 'You see the whole bench beneath a single lamp, then only the empty place beside you stays in view. Kenaz gives light to what is near, not to everything at once. At home, that empty place can mean more than one thing, and its meaning is not yours alone to settle. Among your people, someone’s absence may now be harder to overlook.' },
  { runa: 'Fehu', area: 'Love & Relationships', seeking: 'Clarity', aspekt: 'cattle',
    text: 'At the autumn sale, a cow becomes coins, and you can hear them count against the wooden table. Fehu shows how value changes hands without ceasing to matter. Kuky, the winter household lives on what the exchange makes possible. In what you give and receive, there may be enough warmth to share, or a cost that falls unevenly.' },
];
const NOVA = (area) => area + ' — can you make this image clearer?';
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
  for (const c of CTENI) {
    const q = NOVA(c.area);
    const p = S.buildAskPrompt(c.text, q, c.runa, 'en', [], rr('Isa'), { area: c.area, intention: '', seeking: c.seeking, question: '' }, null, c.aspekt);
    const a = await volej(sys, p);
    out.push({ runa: c.runa, area: c.area, otazka: q, odpoved: a, prompt: p });
    console.log('\n#### ' + c.runa + ' × ' + c.area + '\n[' + q + ']\n' + a);
  }
  fs.writeFileSync(path.join(__dirname, 'test_ask.json'), JSON.stringify(out, null, 1));
})().catch((e) => { console.error('CHYBA ' + e.message); process.exit(1); });
