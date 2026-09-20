// OVERENI MOSTU (v4.37+) — generuje cteni PRODUKCNIM modelem pres API, aby se meril produkt,
// ne autor. Prompty stavi produkcni buildery; lisi se jen to, co ma dany test zkoumat.
//   A: 8 oblasti, jinak VSE stejne (runa, obraz, rejstrik, seed) -> poznat oblast z textu
//   B: 5 rejstriku x 3 -> drzi cteni tvar, ktery rejstrik predepsal?
//   D: 6x „Insight into Challenge" na LEHKYCH runach -> opravdu bez utechy?
//   C se pocita nad vsemi (chlad a rada).
// Klic ze souboru, nikdy se nevypisuje.
const vm = require('vm'), fs = require('fs'), os = require('os'), path = require('path');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const OUT = process.argv[2];
const KEY = (process.env.ANTHROPIC_API_KEY ||
  fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-api-key.txt'), 'utf8')).trim();

const S = { console: { log() {}, warn() {}, error() {} } };
S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);

const RUNES = vm.runInContext('RUNES', S);
const AREAS = vm.runInContext('AREAS', S);
const SEEKS = vm.runInContext('SEEKS', S);
const INTENT = vm.runInContext('INTENTIONS', S);
const MODES = vm.runInContext('RUNAR_MODES', S);
const maxTok = (MODES && MODES.quick_reading && MODES.quick_reading.max_tokens) || 700;

const zadani = [];
// ── A: jedina promenna je OBLAST ──────────────────────────────────────────
for (let i = 0; i < 8; i++)
  zadani.push({ test: 'A', id: 'A' + i, lang: 'en', runa: 'Laguz', oblast: i, rejstrik: 1, zamer: 0, seed: 900001, zivotni: null });
// ── B: 5 rejstriku x 3 (ruzne runy i oblasti, at to neni jeden pripad) ────
const bRuny = ['Berkana', 'Gebo', 'Raidho'], bObl = [6, 0, 7];
for (let r = 0; r < 5; r++) for (let k = 0; k < 3; k++)
  zadani.push({ test: 'B', id: 'B' + r + k, lang: 'en', runa: bRuny[k], oblast: bObl[k], rejstrik: r, zamer: k % 3, seed: 910000 + r * 10 + k, zivotni: null });
// ── D: vhled do tezkosti na LEHKYCH runach (u tezkych by to delala runa) ──
const dRuny = ['Berkana', 'Gebo', 'Laguz', 'Raidho', 'Fehu', 'Wunjo'];
dRuny.forEach((rn, i) =>
  zadani.push({ test: 'D', id: 'D' + i, lang: 'en', runa: rn, oblast: i % 8, rejstrik: 3, zamer: 0, seed: 920000 + i, zivotni: null }));

const sys = (() => { vm.runInContext('lang = "en";', S); return S.buildSysPrompt(null, 'en'); })();

function postav(z) {
  vm.runInContext('var __s = ' + z.seed + '; Math.random = function () { __s = (__s * 1103515245 + 12345) % 2147483648; return __s / 2147483648; };', S);
  vm.runInContext('lang = ' + JSON.stringify(z.lang) + ';', S);
  const runa = RUNES.filter((r) => r.n === z.runa)[0];
  const u = {
    name: 'Anna', area: AREAS[z.lang][z.oblast], seeking: SEEKS[z.lang][z.rejstrik],
    intention: INTENT[z.lang][z.zamer], question: '',
    lifeRune: z.zivotni ? RUNES.filter((r) => r.n === z.zivotni)[0] : null,
  };
  const prompt = S.buildReadingPrompt(u, runa, z.lang, null);
  return { prompt, u, draws: vm.runInContext('_promptDraws', S)(prompt, z.lang) };
}

async function jedno(z) {
  const { prompt, u, draws } = postav(z);
  const radek = {
    test: z.test, id: z.id, runa: z.runa, oblast: u.area, rejstrik: u.seeking,
    konec: prompt.split('\n').filter((r) => r.indexOf('End on one') === 0)[0] || '',
    draws,
  };
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-opus-4-8', max_tokens: maxTok,
        system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await res.json();
    if (!res.ok) { radek.error = (data.error && data.error.message) || ('HTTP ' + res.status); return radek; }
    const syrovy = (data.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('').trim();
    const roz = (typeof S._parseSegments === 'function') ? S._parseSegments(syrovy) : null;
    radek.text = (roz && roz.reading) ? roz.reading : syrovy;
    radek.usage = data.usage;
  } catch (e) { radek.error = String(e && e.message).slice(0, 160); }
  return radek;
}

(async () => {
  const hotovo = [];
  for (let i = 0; i < zadani.length; i += 4) {
    const v = await Promise.all(zadani.slice(i, i + 4).map(jedno));
    hotovo.push(...v);
    process.stdout.write('\r  ' + hotovo.length + '/' + zadani.length + '  ');
  }
  fs.writeFileSync(OUT, JSON.stringify(hotovo, null, 1), 'utf8');
  const chyb = hotovo.filter((x) => x.error);
  console.log('\n  hotovo ' + (hotovo.length - chyb.length) + '/' + hotovo.length + ' -> ' + OUT);
  chyb.slice(0, 3).forEach((x) => console.log('  CHYBA ' + x.id + ': ' + x.error));
})();
