// Konce čtení — PILOT nových tvarů (KUKY 2026-09-26 „začneme konci čtení“; BACKLOG „Konce čtení: víc tvarů (typy 6/7/9)“).
// Produkční model přes API (VÝJIMKA 2 v memory cteni-generuj-tady-ne-pres-api: test, jak se model zachová na změnu promptu).
// 6 případů × 4 ramena, TÝŽ seed ve všech ramenech → týž obraz, úhel, podoba oblasti; liší se jen řádka konce
// (rameno C navíc nese otázku tazatele, protože návrat k otázce bez otázky nejde).
//   0 = dnešní produkce (tvar volí SEEKING, SEEK_SHAPE) · A = OBRAZ (typ 6) · B = NAPĚTÍ (typ 7) · C = NÁVRAT K OTÁZCE (typ 9)
// Nové tvary se vloží do ENDING_OPEN/HEAVY v kontextu vm (všechny tři pozice), takže prochází produkční cestou
// _endingShape → {L} = most podoby oblasti, a otázka runy (_runeQuestion) se připojí jako dnes.
// Klíč se čte ze souboru a nevypisuje.
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const KEY = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} }; vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + ';\n', S);
vm.runInContext('lang="en";var __s=1;Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};', S);
const R = vm.runInContext('RUNES', S), A = vm.runInContext('AREAS', S), SK = vm.runInContext('SEEKS', S);
const OPEN = vm.runInContext('ENDING_OPEN', S), HEAVY = vm.runInContext('ENDING_HEAVY', S);
const OPEN0 = OPEN.slice(), HEAVY0 = HEAVY.slice();

// runa · oblast · rejstřík (indexy AREAS/SEEKS) · otázka tazatele pro rameno C. Případy = pilot 2026-09-24 (srovnatelnost).
const CASE = [
  ['Algiz', 1, 0, 'Should I take the job abroad or stay where I am?'],
  ['Isa', 5, 4, 'Why has it gone so cold between me and my brother?'],
  ['Thurisaz', 5, 2, 'Should I tell my mother what I really think?'],
  ['Uruz', 2, 3, 'Do I have it in me to finish the book I started?'],
  ['Gebo', 0, 1, 'Is this relationship still good for me?'],
  ['Laguz', 6, 0, 'Why do I keep stopping just before I change?'],
];
// Nové tvary. „may be“ zůstává v KAŽDÉM (bez něj umřel tvar možností 2/2, DECISIONS 2026-09-20 (4)); těžké znění
// ubírá jen útěchu, jako dnešní ENDING_HEAVY.
const TVAR = {
  A: { o: "End on one plain image of how this may stand {L} \u2014 one concrete thing there they can look at; shown, not explained, and never what to do about it.",
       h: "End on one plain image of how this may stand {L} \u2014 one concrete thing there they can look at; shown plainly, without comfort or softening, and never what to do about it." },
  B: { o: "End on one line that holds, at the same time, two things this may be {L} \u2014 both may be so together, pulling against each other, left unresolved; never what to do about it.",
       h: "End on one line that holds, at the same time, two things this may be {L} \u2014 both may be so together, pulling against each other, left unresolved; said plainly, without comfort or softening." },
  C: { o: "End by turning back to their question: one line that shows, from the image, what else the question may be about {L} \u2014 offered as something that may be so, never as something you know about them.",
       h: "End by turning back to their question: one line that shows, from the image, what else the question may be about {L} \u2014 offered as something that may be so, said plainly; no comfort, nothing softened." },
};
// Kolo 2 (téhož dne, po slepém soudci): C sklouzl 4/6 do formule „Perhaps the question is less about X, and more about Y“
// (pokyn mluvil O otázce — „what else the question may be about“ — a model tak mluvil o otázce); A skončil 2/6 pokynem
// („Stand at the kitchen table and listen…“) a 4/6 kotvil jen napůl, tj. vracela se vada v4.32 („nevím, čemu to patří“).
TVAR.A2 = { o: "End on one plain image of how this may stand now {L}: one concrete thing there, in their own life, that may be so — shown, not explained, and not something for them to do.",
            h: "End on one plain image of how this may stand now {L}: one concrete thing there, in their own life, that may be so — shown plainly, without comfort or softening, and not something for them to do." };
TVAR.C2 = { o: "End on one line that sets their question down inside the image {L} and lets it be seen from there — something that may be so, never something you know about them.",
            h: "End on one line that sets their question down inside the image {L} and lets it be seen from there — something that may be so, said plainly; no comfort, nothing softened." };
function postav(c, arm) {
  const [runa, ai, si, q] = c;
  for (let i = 0; i < 3; i++) { OPEN[i] = arm === '0' ? OPEN0[i] : TVAR[arm].o; HEAVY[i] = arm === '0' ? HEAVY0[i] : TVAR[arm].h; }
  vm.runInContext('__s=' + (runa.length * 7919 + ai * 31 + si) + ';', S);
  const rune = R.find(r => r.n === runa);
  return S.buildReadingPrompt({ name: 'Kuky', area: A.en[ai], seeking: SK.en[si], question: arm[0] === 'C' ? q : '', intention: '' }, rune, 'en', []);
}
async function volej(sys, user) {
  const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-opus-5', max_tokens: 700, system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: user }], thinking: { type: 'disabled' } }) });
  const d = await res.json();
  if (!res.ok) throw new Error(res.status + ' ' + (d.error && d.error.message));
  return { text: (d.content || []).filter(c => c.type === 'text').map(c => c.text).join(''), usage: d.usage };
}
(async () => {
  const sys = S.buildSysPrompt(null, 'en');
  if (process.argv[2] === 'ukaz') { for (const arm of ['0', 'A', 'B', 'C']) console.log(arm, '|', postav(CASE[3], arm).split('\n').filter(l => /^End /.test(l))[0]); return; }
  const out = [];
  const ARMS = (process.argv[2] || '0,A,B,C').split(','), OUT = process.argv[3] || 'konce_pilot.json';
  for (const c of CASE) for (const arm of ARMS) {
    const p = postav(c, arm);
    const konec = p.split('\n').filter(l => /^End /.test(l))[0] || '';
    const r = await volej(sys, p);
    let reading = r.text;
    try { const j = JSON.parse(r.text.slice(r.text.indexOf('['), r.text.lastIndexOf(']') + 1)); reading = j[0].text; } catch (e) {}
    out.push({ runa: c[0], arm, area: A.en[c[1]], seek: SK.en[c[2]], question: arm[0] === 'C' ? c[3] : '', konec, reading, usage: r.usage });
    console.log(c[0], arm, '|', reading);
  }
  fs.writeFileSync(__dirname + '/' + OUT, JSON.stringify(out, null, 1));
})();
