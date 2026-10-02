// 2026-10-02 — test B, který owner zadal („všechny v tomhle pořadí“, bod 2) k reportům z 1.–2. 10.:
// obraz a oblast se ve čtení „bijí“ — model napíše obraz a pak zvlášť větu s oblastí, často slovy z promptu
// („In what you give and receive…“, „Among your people…“). Příčina v promptu: „let the image you were given land on {F}“.
//   A = produkční prompt v4.84 (buildReadingPrompt + řádek myšlenky ✦, jako runar-reading.js).
//   B = týž prompt, JEDINÁ změna v řádku oblasti: scéna stojí v oblasti od první věty — místo a lidé z oblasti,
//       z obrazu jen to, co se v něm děje. Bez oblasti se nic nemění (owner: „někdo žádnou oblast nedodá“).
// Vstupy a losy = ownerova tři nejslabší čtení (DB readings 39b698c5 Fehu, 9e90f070 Kenaz, 0ea4b970 Ansuz).
// Model gpt-6.1-sol v OBOU větvích (owner: „vyšel sol 6.1, zkusíme ho“), tvar požadavku jako claude-proxy callSol.
//   node test_b.js ping   … jedno volání: přijme 6.1 reasoning_effort 'none'?
//   node test_b.js ab     … 3 runy × A/B, zápis do test_b.json
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OK = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-openai-key.txt'), 'utf8').trim();
const MODEL = 'gpt-6.1-sol';
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
const st = {}; S.localStorage = { getItem: (k) => st[k] || null, setItem: (k, v) => { st[k] = v; }, removeItem: (k) => { delete st[k]; } };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + ';\n', S);
vm.runInContext('lang="en";READ_ENGINE="sol";var __s=1;Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};', S);
const RUNES = vm.runInContext('RUNES', S), rr = (n) => RUNES.find((r) => r.n === n);
function losuj(stav, test) {
  for (let s = 1; s < 20000; s++) {
    for (const k of Object.keys(st)) delete st[k];
    vm.runInContext('__s=' + (s * 7919 + 17) + ';', S);
    const p = stav(); const d = S._promptDraws(p, 'en') || {};
    if (test(d)) return p;
  }
  throw new Error('losy se nevylosovaly');
}
const LAND = /— let the image you were given land on ([^.]+)\./;
function variantaB(p) {
  const m = p.match(LAND); if (!m) throw new Error('řádek oblasti v promptu není');
  return p.replace(LAND, '— from the first sentence, set the scene in ' + m[1] + ': the place and the people come from there; from the picture you were given, take only what happens in it.');
}
async function volej(sys, p, max) {
  // 6.1 nepřijme 'none' ani 'minimal' (400 unsupported_value, ověřeno 2026-10-02) → nejnižší, co přijme, je 'low'.
  for (const eff of ['none', 'minimal', 'low']) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + OK },
      body: JSON.stringify({ model: MODEL, reasoning_effort: eff, max_completion_tokens: max || 1000,
        messages: [{ role: 'system', content: sys }, { role: 'user', content: p }] }) });
    if (res.status === 400 && eff !== 'low') { console.log('  (' + eff + ' → 400, zkouším další)'); continue; }
    const d = await res.json(); if (!res.ok) throw new Error(MODEL + ' ' + res.status + ' ' + JSON.stringify(d).slice(0, 300));
    return { text: String(d.choices[0].message.content || ''), eff, usage: d.usage, model: d.model };
  }
}
const u = (area, seeking) => ({ name: 'Kuky', area, seeking, question: '', intention: '' });
const BEHY = [
  ['Fehu', 'Love & Relationships', 'Clarity', (d) => (d.image || '').indexOf('The cow is sold in the autumn') === 0 && d.angle === 5 && d.area_face === 1 && d.ending === 'open0' && d.essence === 0 && d.name === 0],
  ['Kenaz', 'Family & Home', 'Clarity', (d) => (d.image || '').indexOf('A single lamp') === 0 && d.angle === 0 && d.area_face === 1 && d.ending === 'open0' && d.essence === 0 && d.name === 2],
  ['Ansuz', 'Healing & Wellbeing', 'Reflection', (d) => (d.image || '').indexOf('A church bell from across') === 0 && d.angle === 3 && d.area_face === 1 && d.ending === 'open2' && d.essence === 0 && d.name === 2],
];
(async () => {
  const kdo = process.argv[2], sys = S.buildSysPrompt(null, 'en');
  if (kdo === 'ping') {
    const r = await volej(sys, 'Write one short sentence about a fjord in the morning.', 200);
    console.log('model ' + r.model + ' · effort ' + r.eff + ' · ' + JSON.stringify(r.usage) + '\n' + r.text); return;
  }
  // B2 (po B: samotná instrukce nestačí — model si nechal celou scénu obrazu): obraz zkrácený na JÁDRO = jen děj, který
  // nese runu, bez místa a věcí; místo a lidi dodá oblast od první věty (řádek oblasti jako v B). Jádra napsal CODE-tune
  // z aspektu obrazu a textu runy v Kolekci; jen pro tenhle test, v bance nejsou.
  if (kdo === 'b2') {
    const JADRO = {
      Fehu: ['The cow is sold in the autumn, and what she fetched carries the household through the winter.', 'Something of value changes hands, and what it brings carries others through a lean time.'],
      Kenaz: ['A single lamp over the bench.', 'One small light shows only what is close at hand.'],
      Ansuz: ['A church bell from across the fjord carries over the still air and you turn toward it without deciding to.', 'A sound from far off reaches you, and you turn toward it before you decide to.'],
    };
    const out2 = [];
    for (const [runa, area, seek, test] of BEHY) {
      const pA = losuj(() => S.buildReadingPrompt(u(area, seek), rr(runa), 'en', []), test) + '\n' + S._thoughtLine('en', rr(runa));
      const [cely, jadro] = JADRO[runa];
      if (pA.split(cely).length !== 2) throw new Error('obraz v promptu není právě jednou: ' + runa);
      const p = variantaB(pA.replace(cely, jadro));
      const r = await volej(sys, p);
      out2.push({ runa, area, seek, varianta: 'B2', jadro, model: r.model, effort: r.eff, usage: r.usage, prompt: p, text: r.text });
      console.log('\n== ' + runa + ' × ' + area + ' · B2 (' + r.model + ')\n' + r.text);
    }
    fs.writeFileSync(path.join(__dirname, 'test_b2.json'), JSON.stringify(out2, null, 1));
    return;
  }
  const out = [];
  for (const [runa, area, seek, test] of BEHY) {
    const pA = losuj(() => S.buildReadingPrompt(u(area, seek), rr(runa), 'en', []), test) + '\n' + S._thoughtLine('en', rr(runa));
    const pB = variantaB(pA);
    for (const [v, p] of [['A', pA], ['B', pB]]) {
      const r = await volej(sys, p);
      out.push({ runa, area, seek, varianta: v, model: r.model, effort: r.eff, usage: r.usage, prompt: p, text: r.text });
      console.log('\n== ' + runa + ' × ' + area + ' · ' + v + ' (' + r.model + ')\n' + r.text);
    }
  }
  fs.writeFileSync(path.join(__dirname, 'test_b.json'), JSON.stringify(out, null, 1));
})().catch((e) => { console.error('CHYBA ' + e.message); process.exit(1); });
