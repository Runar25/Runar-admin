// Náklady GPT korektury islandštiny (is-gpt-check.py).
// Proč (KUKY 2026-10-10): „chci aby jsi mapoval kolik přesně stojí oprava IS pomocí GPT.“ Do té doby se u korektury nezapisovalo nic —
// jen hlídač API věděl, KDY běžela (~/.claude/runar-api-pokusy.log), ne kolik stála.
// Jak: is-gpt-check.py SÁM (§30 — nic na paměti session) zapíše u každého volání tokeny, které vrátilo API, do
// ~/runar-eval/is-gpt-check-naklady.jsonl. Cenu počítá JEDEN výpočet appky — readingCostUsd (v2/runar-utils.js) nad MODEL_PRICES
// (v2/runar-config.js), tentýž jako u čtení v deníku a ve stats.js (§20). Přemýšlení modelu je v completion_tokens (platí se jako výstup).
//   node scripts/utils/is_gpt_naklady.js                      · souhrn: celkem, po dnech, průměr na volání a na text
//   node scripts/utils/is_gpt_naklady.js --cena '<usage JSON>' · cena jednoho volání v USD (volá is-gpt-check.py)
//   node scripts/utils/is_gpt_naklady.js --test               · samotest výpočtu a souhrnu na známém vstupu
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), vm = require('vm');
const ROOT = process.env.RUNAR_ROOT || 'C:/Users/zkuku/Downloads/Runar-admin';
const ZAZNAM = path.join(os.homedir(), 'runar-eval', 'is-gpt-check-naklady.jsonl');
const HLIDAC = path.join(os.homedir(), '.claude', 'runar-api-pokusy.log');
// Od kdy se náklady zapisují (první zapsaný běh). Běh z hlídače API dřív = cena neznámá. Pevné datum, ne „první záznam“: hlídač zapíše
// začátek příkazu, záznam nákladů až odpověď API (o minutu i víc později), takže porovnání s prvním záznamem počítalo i zapsaný běh.
const ZAZNAM_OD = '2026-10-10 23:53';

function cenik() {
  const SB = { console: { log() {}, warn() {}, error() {} }, localStorage: { getItem: () => null, setItem() {}, removeItem() {} } };
  SB.window = SB; SB.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
  vm.createContext(SB);
  for (const f of ['runar-config.js', 'runar-utils.js']) vm.runInContext(fs.readFileSync(path.join(ROOT, 'v2', f), 'utf8') + '\n;\n', SB);
  return vm.runInContext('readingCostUsd', SB);
}

// Souhrn ze záznamu. `pred` = běhy z hlídače API před prvním záznamem: tehdy se usage nezapisovalo, cenu nemají.
function souhrn(radky, hlidac, cena) {
  const den = {}, celkem = { volani: 0, texty: 0, usd: 0, bezCeny: 0, vstup: 0, vystup: 0, premysleni: 0 };
  for (const r of radky) {
    const u = r.usage || {};
    const usd = typeof r.usd === 'number' ? r.usd : cena(u);
    const d = (den[r.cas.slice(0, 10)] = den[r.cas.slice(0, 10)] || { volani: 0, texty: 0, usd: 0 });
    for (const x of [celkem, d]) { x.volani++; x.texty += r.texty || 0; if (usd != null) x.usd += usd; }
    if (usd == null) celkem.bezCeny++;
    celkem.vstup += u.prompt_tokens || 0; celkem.vystup += u.completion_tokens || 0;
    celkem.premysleni += ((u.completion_tokens_details || {}).reasoning_tokens) || 0;
  }
  const pred = hlidac.filter((l) => l.indexOf('is-gpt-check.py') !== -1 && l.slice(0, 16) < ZAZNAM_OD);
  return { den, celkem, pred };
}

// 1 běh · 2–4 běhy · 5+ běhů (souhrn je česky, §31)
const pl = (n, a, b, c) => n + ' ' + (n === 1 ? a : n >= 2 && n <= 4 ? b : c);

function nactiZaznam() {
  if (!fs.existsSync(ZAZNAM)) return [];
  return fs.readFileSync(ZAZNAM, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
}
function nactiHlidac() { return fs.existsSync(HLIDAC) ? fs.readFileSync(HLIDAC, 'utf8').split('\n').filter((l) => l.trim()) : []; }

const a = process.argv.slice(2);
if (a[0] === '--cena') {
  const c = cenik()(JSON.parse(a[1]));
  process.stdout.write(c == null ? 'null' : String(c));
} else if (a[0] === '--test') {
  const cena = cenik();
  // 1000 vstup (200 z cache) + 3000 výstup na gpt-6-sol = (800·2 + 200·0,2 + 3000·10) / 1 M = 0,03164 USD
  const u = { model: 'gpt-6-sol', prompt_tokens: 1000, prompt_tokens_details: { cached_tokens: 200 }, completion_tokens: 3000,
    completion_tokens_details: { reasoning_tokens: 2500 } };
  const c = cena(u);
  if (Math.abs(c - 0.03164) > 1e-9) { console.log('FAIL  cena: ' + c + ' ≠ 0,03164'); process.exit(1); }
  if (cena({ model: 'gpt-neznamy', prompt_tokens: 10, completion_tokens: 10 }) !== null) { console.log('FAIL  neznámý model musí mít cenu null'); process.exit(1); }
  const s = souhrn([{ cas: '2026-10-11 10:00:00', texty: 14, usage: u, usd: c }, { cas: '2026-10-11 11:00:00', texty: 2, usage: u }],
    ['2026-10-10 22:59 | 1 volání | is-gpt-check.py | …', '2026-10-11 09:00 | 1 volání | jiny.js | …', '2026-10-11 10:00 | 1 volání | is-gpt-check.py | …'], cena);
  const ok = s.celkem.volani === 2 && s.celkem.texty === 16 && Math.abs(s.celkem.usd - 2 * c) < 1e-12 && s.pred.length === 1 && s.celkem.premysleni === 5000;
  console.log((ok ? 'OK    ' : 'FAIL  ') + 'samotest: cena 0,03164 · souhrn 2 volání / 16 textů · 1 běh před záznamem · přemýšlení 5000');
  process.exit(ok ? 0 : 1);
} else {
  const s = souhrn(nactiZaznam(), nactiHlidac(), cenik()), c = s.celkem;
  const $ = (x) => '$' + x.toFixed(4);
  console.log('GPT korektura islandštiny (is-gpt-check.py) — náklady podle tokenů, které vrátilo API');
  if (!c.volani) console.log('  zatím žádné zapsané volání (záznam: ' + ZAZNAM + ')');
  else {
    console.log('  celkem: ' + c.volani + ' volání · ' + pl(c.texty, 'text', 'texty', 'textů') + ' · ' + $(c.usd)
      + ' (průměr ' + $(c.usd / c.volani) + ' na volání, ' + $(c.texty ? c.usd / c.texty : 0) + ' na text)');
    console.log('  tokeny: vstup ' + c.vstup + ' · výstup ' + c.vystup + ' (z toho přemýšlení ' + c.premysleni + ')');
    for (const d of Object.keys(s.den).sort()) console.log('  ' + d + ': ' + s.den[d].volani + ' volání · ' + pl(s.den[d].texty, 'text', 'texty', 'textů') + ' · ' + $(s.den[d].usd));
    if (c.bezCeny) console.log('  ⚠ ' + c.bezCeny + ' volání bez ceny — model chybí v MODEL_PRICES (v2/runar-config.js); doplň řádek, souhrn je přepočítá');
  }
  if (s.pred.length) console.log('  ⚠ ' + pl(s.pred.length, 'běh', 'běhy', 'běhů') + ' před zapnutím záznamu (' + s.pred[0].slice(0, 16) + ' – ' + s.pred[s.pred.length - 1].slice(0, 16)
    + ', podle ' + HLIDAC + ') — cena neznámá, usage se tehdy nezapisovalo');
}
