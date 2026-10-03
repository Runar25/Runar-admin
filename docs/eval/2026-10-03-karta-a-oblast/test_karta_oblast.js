// 2026-10-03 — owner: „ano pusť 3 čtení s kartou a jeď among your people“.
//   A  = produkce v4.87 (obraz už vybraný podle oblasti).
//   C  = KARTA (ownerův nápad: „vytváříme textovou verzi Tarotu, kde na kartě je obrázek“): člověk obraz VIDÍ nad čtením,
//        čtení ho nepřevypráví, jen vyloží. Řádek IMAGE → THE CARD; řádek READING ANGLE pryč (říká, jak obraz převyprávět).
//   D1 = podoba oblasti jen v řádku přistání; konec (most) má obecný cíl „in the seeker's life“ (jak to stojí bez oblasti).
//   D2 = podoba oblasti jen v konci; řádek přistání bez podoby („land in this part of their life“).
//   ⚠️ D1 obrací ownerovo 2026-09-20 „most ať dosedne do AREA“ — proto se měří obě strany, rozhodne owner.
// Model gpt-6-sol (ownerův engine), tvar požadavku = claude-proxy callSol; losy pevné (první seed), varianty z TÉHOŽ promptu A.
//   node test_karta_oblast.js
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OK = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-openai-key.txt'), 'utf8').trim();
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
const st = {}; S.localStorage = { getItem: (k) => st[k] || null, setItem: (k, v) => { st[k] = v; }, removeItem: (k) => { delete st[k]; } };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + ';\n', S);
vm.runInContext('lang="en";READ_ENGINE="sol";var __s=1;Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};', S);
const RUNES = vm.runInContext('RUNES', S), FACES = vm.runInContext('AREA_FACES', S), AREAS = vm.runInContext('AREAS', S);
const rr = (n) => RUNES.find((r) => r.n === n);
const u = (area, seeking) => ({ name: 'Kuky', area, seeking, question: '', intention: '' });
function prompt(runa, area, seek, seed) {
  for (const k of Object.keys(st)) delete st[k];
  vm.runInContext('__s=' + (seed * 7919 + 17) + ';', S);
  const p = S.buildReadingPrompt(u(area, seek), rr(runa), 'en', []) + '\n' + S._thoughtLine('en', rr(runa));
  return { p, d: S._promptDraws(p, 'en') || {} };
}
function varianty(p, d, area) {
  const i = AREAS.en.indexOf(area), f = FACES[i][d.area_face].en;
  const radky = p.split('\n');
  const img = radky.find((l) => l.indexOf('IMAGE — the picture in this reading comes from here: ') === 0);
  if (!img) throw new Error('řádek IMAGE není');
  const obraz = img.slice('IMAGE — the picture in this reading comes from here: '.length).split('. Let it become')[0];
  const C = radky.filter((l) => l.indexOf('READING ANGLE') !== 0).map((l) => l === img
    ? 'THE CARD — above this reading the seeker sees this picture, the way a tarot card shows its scene: ' + obraz + '. Do not retell or describe the picture; they already see it. Read it for them.'
    : l).join('\n');
  const konec = 'what this may be ' + f[1], konec2 = 'things this may be ' + f[1];
  if (p.indexOf(f[1]) === -1) throw new Error('podoba v konci není: ' + f[1]);
  const D1 = p.split(f[1]).join("in the seeker's life");
  const pristani = 'land on ' + f[0] + '.';
  if (p.split(pristani).length !== 2) throw new Error('přistání není právě jednou');
  const D2 = p.replace(pristani, 'land in this part of their life.');
  return { obraz, C, D1, D2, f };
}
async function volej(sys, p) {
  for (const eff of ['none', 'minimal']) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + OK },
      body: JSON.stringify({ model: 'gpt-6-sol', reasoning_effort: eff, max_completion_tokens: 1000,
        messages: [{ role: 'system', content: sys }, { role: 'user', content: p }] }) });
    if (res.status === 400 && eff === 'none') continue;
    const d = await res.json(); if (!res.ok) throw new Error('sol ' + res.status + ' ' + JSON.stringify(d).slice(0, 200));
    return { text: String(d.choices[0].message.content || ''), usage: d.usage };
  }
}
const BEHY = [['Fehu', 'Love & Relationships', 'Clarity', 1], ['Kenaz', 'Family & Home', 'Clarity', 1], ['Ansuz', 'Healing & Wellbeing', 'Reflection', 1]];
(async () => {
  const sys = S.buildSysPrompt(null, 'en'), out = [];
  for (const [runa, area, seek, seed] of BEHY) {
    const { p, d } = prompt(runa, area, seek, seed);
    const v = varianty(p, d, area);
    console.log('\n######## ' + runa + ' × ' + area + ' · obraz: ' + v.obraz + ' · podoba: ' + JSON.stringify(v.f));
    for (const [jm, pr] of [['A', p], ['C', v.C], ['D1', v.D1], ['D2', v.D2]]) {
      const r = await volej(sys, pr);
      out.push({ runa, area, seek, varianta: jm, obraz: v.obraz, podoba: v.f, draws: d, usage: r.usage, prompt: pr, text: r.text });
      console.log('\n== ' + jm + '\n' + r.text);
    }
  }
  fs.writeFileSync(path.join(__dirname, 'test_karta_oblast.json'), JSON.stringify(out, null, 1));
})().catch((e) => { console.error('CHYBA ' + e.message); process.exit(1); });
