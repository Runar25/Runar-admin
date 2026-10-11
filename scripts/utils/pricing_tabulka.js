// pricing_tabulka.js — kolik nás stojí jedno čtení a jeden měsíc předplatitele. Podklad pro RUNAR_PRICING.md, bez volání API.
//
// Proč (KUKY 2026-10-11, „6. a) ano, přepočítej pricing na sol“): pricing stál na ručním měření z června, sloupci „Claude“
// (čte GPT-6 sol od 2026-10-09), anglickém hlasu za sazbu Flash (proxy mluví eleven_multilingual_v2) a nejhorším měsíci
// „50 čtení, každé s hlasem“ — tehdy platil měsíční strop hlasu; od 2026-10-11 má hlas zase každé čtení, jednou (DECISIONS 2026-10-11 (61)).
// Každý přepočet se dělal ručně a zastaral; tenhle skript ho dělá stejně pokaždé.
//
// ZMĚŘENO vs ODHAD — skript to u každého čísla říká:
//   · cena modelu = readingCostUsd nad usage, které vrátilo API (TÝŽ výpočet jako appka), medián čtení SOL_MODEL bez přemýšlení
//     (= dnešní produkce); délka textu = medián znaků čtení (Single short_text, rozklad deep_text — short_text je tam jen hlavička)
//   · typ bez čtení (*) = odhad: znaky = cílový počet vět z promptu (golden dump) × změřené znaky na větu; výstupní tokeny =
//     znaky ÷ změřené znaky na token; vstup = Single + přírůstek na runu změřený na Nornách. Hlas = znaky × sazba hlasu.
// Sazby ani ceník se tu NEOPISUJÍ (§20): model čtení `SOL_MODEL` (claude-proxy), ceník `MODEL_PRICES` + výpočet `readingCostUsd`
// (v2/), model hlasu `EL_MODEL_EN/IS` (supabase/functions/_shared/el_voice.ts), sazba hlasu `EL_PRECERPANI` (scripts/utils/stats.js), jednotky
// `SPREAD_COSTS`, měsíční jednotky a Asky `TIERS`, cena kreditu a kredity tarifů EL `EL_KREDIT_USD` / `EL_TARIF_KREDITY`
// (supabase/functions/_shared/voice_usage.ts), prompty buildery přes golden dump. Hlas má každé čtení, jednou (DECISIONS 2026-10-11 (61)).
// Jen agregáty — žádný text čtení ani user_id (repo je veřejné, RUNAR_PRIVACY.md). Čte VŠECHNA čtení včetně odhlášených z analýzy:
// je to výpočet nákladů, ne analýza kvality textu — tatáž výjimka jako stats.js a naklady.py (hlavička scripts/utils/cteni_analyza.sql);
// na řádku dotazu značka opt-out:ok, kterou chce smoke ㉾.
//
//   node scripts/utils/pricing_tabulka.js            # čtení za posledních 30 dní
//   node scripts/utils/pricing_tabulka.js --dny 90
'use strict';
const { execSync } = require('child_process'), fs = require('fs'), os = require('os'), path = require('path'), vm = require('vm');
const R = path.resolve(__dirname, '..', '..');
const argv = process.argv.slice(2);
const DNY = Number(argv[argv.indexOf('--dny') + 1]) || 30;
const cti = (rel) => fs.readFileSync(path.join(R, rel), 'utf8');
const vytahni = (rel, re, co) => { const m = cti(rel).match(re); if (!m) throw new Error('nenalezeno ' + co + ' v ' + rel + ' — změnil se tvar zdroje?'); return m[1]; };

// ── vstupy z jejich jediných míst ────────────────────────────────────────────
const SB = { console, Math, JSON, Date };
vm.createContext(SB);
for (const f of ['runar-config.js', 'runar-utils.js']) vm.runInContext(cti('v2/' + f), SB, { filename: f });
const V = (x) => vm.runInContext(x, SB);
const cena = V('readingCostUsd'), TIERS = V('TIERS'), SPREAD_COSTS = V('SPREAD_COSTS');
const SOL = vytahni('supabase/functions/claude-proxy/index.ts', /const SOL_MODEL = "([^"]+)"/, 'SOL_MODEL');
const EL_MODEL = {
  en: vytahni('supabase/functions/_shared/el_voice.ts', /export const EL_MODEL_EN\s*=\s*"([^"]+)"/, 'EL_MODEL_EN'),
  is: vytahni('supabase/functions/_shared/el_voice.ts', /export const EL_MODEL_IS\s*=\s*"([^"]+)"/, 'EL_MODEL_IS'),
};
const EL_KREDIT = Number(vytahni('supabase/functions/_shared/voice_usage.ts', /export const EL_KREDIT_USD = ([\d.]+);/, 'EL_KREDIT_USD'));
const EL_TARIFY = Object.fromEntries([...vytahni('supabase/functions/_shared/voice_usage.ts', /export const EL_TARIF_KREDITY[^=]*=\s*\{([^}]*)\}/, 'EL_TARIF_KREDITY')
  .matchAll(/(\w+):\s*(\d+)/g)].map((m) => [m[1], Number(m[2])]));
const EL_SAZBA_1K = JSON.parse(vytahni('scripts/utils/stats.js', /const EL_PRECERPANI = (\{[^}]*\})/, 'EL_PRECERPANI').replace(/'/g, '"'));
const sazbaHlasu = (l) => { const s = EL_SAZBA_1K[EL_MODEL[l]]; if (s == null) throw new Error('model hlasu ' + EL_MODEL[l] + ' nemá sazbu v EL_PRECERPANI'); return s / 1000; };
// samotest výpočtu (§19.1) — týž příklad drží stats.js
if (Math.abs(cena({ model: 'gpt-6-sol', prompt_tokens: 1000, prompt_tokens_details: { cached_tokens: 200 }, completion_tokens: 100 }) - 0.00264) > 1e-9) throw new Error('readingCostUsd rozbitý');

// prompty z dnešních builderů (golden dump do dočasného souboru — commitnutý otisk může být starší)
const tmpG = path.join(os.tmpdir(), 'runar_pricing_golden_' + process.pid + '.json');
execSync('node "' + path.join(R, 'scripts/golden/golden_dump.js') + '" "' + tmpG + '"', { stdio: 'ignore' });
const G = JSON.parse(fs.readFileSync(tmpG, 'utf8')); fs.unlinkSync(tmpG);

function q(sql) {
  const tmp = path.join(os.tmpdir(), 'runar_pricing_' + process.pid + '.sql');
  fs.writeFileSync(tmp, sql, 'utf8');
  try {
    const out = execSync('supabase --workdir "' + R + '" db query --linked -f "' + tmp + '"', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 27 });
    return JSON.parse(out.slice(out.indexOf('{'))).rows || [];
  } finally { fs.unlinkSync(tmp); }
}
const median = (a) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const usd = (x, d) => x == null ? '–' : '$' + x.toFixed(d == null ? 4 : d);

// ── typy čtení: klíč SPREAD_COSTS, golden klíč promptu, počet run ────────────
const TYPY = [
  { k: 'single', jm: 'Single', g: 'single', run: 1, db: null },
  { k: 'norns', jm: 'Norns', g: 'norns', run: 3, db: 'NORNS' },
  { k: 'cross', jm: 'Kříž', g: 'kriz', run: 5, db: 'KRIZ' },
  { k: 'horseshoe', jm: 'Horseshoe', g: 'horseshoe', run: 7, db: 'HORSESHOE' },
  { k: 'yggdrasil', jm: 'Yggdrasil', g: 'yggdrasil', run: 9, db: 'YGGDRASIL' },
];
// cílový počet vět, jak ho dnes předepisuje prompt (EN i IS mají tatáž čísla; bere se EN)
const vetyCil = (t) => { const p = G[t.g + '_en'] || ''; const m = [...p.matchAll(/(\d+)(?:\s*(?:-|–|to)\s*(\d+))?\s+(?:short\s+)?sentences/g)].pop();
  if (!m) throw new Error('v promptu ' + t.g + '_en nenalezen cílový počet vět'); return m[2] ? (Number(m[1]) + Number(m[2])) / 2 : Number(m[1]); };

// ── data z produkce ───────────────────────────────────────────────────────────
const rows = q(`select area, rune_name, lang, usage, follow_up,
    case when area = 'spread' then char_length(coalesce(deep_text,'')) else char_length(coalesce(short_text,'')) end as zn
  from readings where usage->>'model' = '${SOL}' and drawn_at >= now() - interval '${DNY} days'`);  // opt-out:ok 2026-10-11 náklady (cena a délka čtení po typech), ne analýza kvality textu
const bezPremysleni = (u) => !(((u && u.completion_tokens_details) || {}).reasoning_tokens > 0);
const D = {};   // D[typ][lang] = { usd:[], zn:[], vstup:[], vystup:[] }
const ASK = { en: [], is: [] };
let vynech = 0;
for (const r of rows) {
  const u = typeof r.usage === 'string' ? JSON.parse(r.usage) : r.usage;
  if (!bezPremysleni(u)) { vynech++; continue; }
  const t = r.area === 'spread' ? (TYPY.find((x) => x.db === String(r.rune_name).toUpperCase()) || {}).k : 'single';
  const c = cena(u); if (!t || c == null || !ASK[r.lang]) continue;
  const g = ((D[t] = D[t] || {})[r.lang] = D[t][r.lang] || { usd: [], zn: [], vstup: [], vystup: [] });
  g.usd.push(c); g.zn.push(r.zn); g.vstup.push(u.prompt_tokens || 0); g.vystup.push(u.completion_tokens || 0);
  for (const f of (r.follow_up || [])) { const fu = f && f.usage; if (fu && fu.model === SOL && bezPremysleni(fu) && cena(fu) != null) ASK[r.lang].push(cena(fu)); }
}
const life = q(`select life_rune_lang as lang, char_length(life_rune_text) as zn from user_profiles where life_rune_text is not null`);

// ── kalibrace odhadů z toho, co je změřené (per jazyk) ────────────────────────
const K = {};
for (const l of ['en', 'is']) {
  let zn = 0, vety = 0, tok = 0, znT = 0;
  for (const t of TYPY) { const g = D[t.k] && D[t.k][l]; if (!g) continue;
    zn += g.zn.reduce((a, b) => a + b, 0); vety += vetyCil(t) * g.zn.length; znT += g.zn.reduce((a, b) => a + b, 0); tok += g.vystup.reduce((a, b) => a + b, 0); }
  const s = D.single && D.single[l], n = D.norns && D.norns[l];
  K[l] = { znNaVetu: vety ? zn / vety : null, znNaToken: tok ? znT / tok : null,
    vstupSingle: s ? median(s.vstup) : null,
    naRunu: s && n ? (median(n.vstup) - median(s.vstup)) / 2 : 0,
    // znaky promptu na token: změřený vstup Single ÷ délka dnešního promptu Single (systémový + čtecí)
    promptZnNaToken: s ? ((G['system_' + l] || '').length + (G['single_' + l] || '').length) / median(s.vstup) : null };
}

// ── tabulka 1: jedno čtení ───────────────────────────────────────────────────
const RADKY = [];
for (const t of TYPY) for (const l of ['en', 'is']) {
  const g = D[t.k] && D[t.k][l], k = K[l], o = { t, l, n: g ? g.usd.length : 0 };
  if (g) { o.model = median(g.usd); o.zn = median(g.zn); o.odhad = false; }
  else if (k.znNaVetu && k.znNaToken && k.vstupSingle) {
    o.zn = Math.round(vetyCil(t) * k.znNaVetu);
    o.model = cena({ model: SOL, prompt_tokens: Math.round(k.vstupSingle + (t.run - 1) * k.naRunu), completion_tokens: Math.round(o.zn / k.znNaToken) });
    o.odhad = true;
  }
  o.hlas = o.zn != null ? o.zn * sazbaHlasu(l) : null;
  o.ask = median(ASK[l]);
  RADKY.push(o);
}
const lifeOdhad = {};
for (const l of ['en', 'is']) { const k = K[l], zn = median(life.filter((x) => x.lang === l).map((x) => x.zn));
  if (!k.promptZnNaToken || !k.znNaToken || zn == null) continue;
  lifeOdhad[l] = { n: life.filter((x) => x.lang === l).length, zn,
    usd: cena({ model: SOL, prompt_tokens: Math.round(((G['system_' + l] || '').length + (G['liferune_' + l] || '').length) / k.promptZnNaToken), completion_tokens: Math.round(zn / k.znNaToken) }) }; }

console.log('Model čtení ' + SOL + ' (bez přemýšlení), čtení za ' + DNY + ' dní: ' + rows.length + (vynech ? ' (' + vynech + ' s přemýšlením vynecháno)' : '') +
  ' · hlas EN ' + EL_MODEL.en + ' / IS ' + EL_MODEL.is + ' · hlas ke každému čtení, jednou (strop jen testeři, VOICE_MONTHLY_LIMIT_TESTER)');
console.log('\n| Čtení | Jazyk | n | Znaky (hlas) | Model | Hlas | Celkem s hlasem | Bez hlasu | Jednotky |');
console.log('|---|---|---|---|---|---|---|---|---|');
for (const o of RADKY) { const hv = o.odhad ? '*' : '';
  console.log('| ' + o.t.jm + ' | ' + o.l.toUpperCase() + ' | ' + o.n + ' | ' + (o.zn == null ? '–' : Math.round(o.zn) + hv) + ' | ' + usd(o.model) + hv + ' | ' + usd(o.hlas) + hv +
    ' | **' + usd(o.model + o.hlas, 3) + '**' + hv + ' | ' + usd(o.model, 4) + hv + ' | ' + SPREAD_COSTS[o.t.k].credits + ' |'); }
for (const l of ['en', 'is']) console.log('| Ask (otázka ke čtení) | ' + l.toUpperCase() + ' | ' + ASK[l].length + ' | – | ' + usd(median(ASK[l])) + ' | – | – | ' + usd(median(ASK[l])) + ' | 0 |');
for (const l of ['en', 'is']) if (lifeOdhad[l]) console.log('| Životní runa | ' + l.toUpperCase() + ' | ' + lifeOdhad[l].n + ' textů | – | ' + usd(lifeOdhad[l].usd) + '* | – | – | ' + usd(lifeOdhad[l].usd) + '* | 0 |');
console.log('\n* odhad (sol tenhle typ v datech nemá): znaky = cílový počet vět × ' + ['en', 'is'].map((l) => l.toUpperCase() + ' ' + (K[l].znNaVetu || 0).toFixed(0)).join(' / ') +
  ' zn na větu; výstup = znaky ÷ ' + ['en', 'is'].map((l) => (K[l].znNaToken || 0).toFixed(2)).join(' / ') + ' zn na token; vstup = Single + ' +
  ['en', 'is'].map((l) => Math.round(K[l].naRunu)).join(' / ') + ' tokenů na runu. Životní runa: vstup z délky dnešního promptu, výstup z uložených textů.');
for (const l of ['en', 'is']) { const s = RADKY.find((o) => o.t.k === 'single' && o.l === l); if (s && s.n < 10) console.log('⚠ Single ' + l.toUpperCase() + ' má jen n = ' + s.n + ' — medián je hrubý.'); }

// ── tabulka 2: měsíc předplatitele ──────────────────────────────────────────
// Hlas ke každému čtení, jednou (DECISIONS 2026-10-11 (61)): nejhorší měsíc = všechny jednotky na typ s nejvyšší cenou NA JEDNOTKU
// (model + hlas + všechny Asky; dnes Single) — přesná horní mez, žádný strop hlasu. Vzor = ownerův příklad 2026-10-11: „3 single,
// 1 norns za týden, 1 cross a jeden horseshoe za měsíc“ (týden = 30/7 v měsíci). Do 2026-10-11 tu stál „běžný měsíc“ s hlasem ×5.
const radek = (k, l) => RADKY.find((o) => o.t.k === k && o.l === l);
const VZOR = { single: 3 * 30 / 7, norns: 30 / 7, cross: 1, horseshoe: 1 };
const MES = {};   // tier → jazyk → kredity EL nejhoršího měsíce a vzoru (kapacita tarifů níž)
console.log('\n| Tarif | Jazyk | Nejhorší měsíc | z toho hlas | kredity EL | Vzor (3 Single + 1 Norns týdně, 1 Kříž + 1 Horseshoe) | kredity EL vzoru |');
console.log('|---|---|---|---|---|---|---|');
for (const tier of ['standard', 'premium']) {
  const T = TIERS[tier], jednotek = T.monthly_readings, asky = T.asks_per_reading || 0;
  MES[tier] = {};
  for (const l of ['en', 'is']) {
    const ask = median(ASK[l]) || 0;
    const naJedn = (t) => { const o = radek(t.k, l); return o && o.model != null ? (o.model + o.hlas + asky * ask) / SPREAD_COSTS[t.k].credits : 0; };
    const nej = TYPY.reduce((a, t) => (naJedn(t) > naJedn(a) ? t : a), TYPY[0]), o = radek(nej.k, l), kolik = jednotek / SPREAD_COSTS[nej.k].credits;
    let vzor = 0, vzorHlas = 0;
    for (const [k, n] of Object.entries(VZOR)) { const r = radek(k, l); vzor += n * (r.model + r.hlas + asky * ask); vzorHlas += n * r.hlas; }
    MES[tier][l] = { nej: kolik * o.hlas / EL_KREDIT, vzor: vzorHlas / EL_KREDIT };
    console.log('| ' + (T.label || tier) + ' (' + jednotek + ' jedn., Ask ×' + asky + ') | ' + l.toUpperCase() + ' | **' + usd(kolik * naJedn(nej), 2) + '** (' + Math.round(kolik) + '× ' + nej.jm + ') | ' +
      usd(kolik * o.hlas, 2) + ' | ' + Math.round(MES[tier][l].nej) + ' | ' + usd(vzor, 2) + ' | ' + Math.round(MES[tier][l].vzor) + ' |');
  }
}
console.log('\nNejhorší měsíc = všechny jednotky na typ s nejvyšší cenou na jednotku (model + hlas + všechny Asky) — přesná horní mez. Hlas má každé');
console.log('čtení jednou (elevenlabs-proxy); přehrání uloženého hlasu ElevenLabs nic nestojí. Kredit EL = $' + EL_KREDIT + ' (voice_usage.ts).');

// ── kapacita tarifů ElevenLabs: kolik předplatitelů Premium (IS = dražší jazyk) unese měsíční kredit tarifu ──────────────────────────
console.log('\n| Tarif EL | Kreditů / měsíc | Cena | Premium IS nejhorší měsíc | Premium IS vzor |');
console.log('|---|---|---|---|---|');
for (const [jm, kr] of Object.entries(EL_TARIFY)) console.log('| ' + jm + ' | ' + kr + ' | ' + usd(kr * EL_KREDIT, 0) + ' | ' +
  Math.floor(kr / MES.premium.is.nej) + ' | ' + Math.floor(kr / MES.premium.is.vzor) + ' |');

// ── Rune Seeker: kredit a volné čtení ───────────────────────────────────────
console.log('\nRune Seeker — náklad na 1 kredit (čtení z karty s hlasem): ' + ['en', 'is'].map((l) => l.toUpperCase() + ' ' +
  TYPY.map((t) => { const o = radek(t.k, l); return t.jm + ' ' + usd((o.model + o.hlas) / SPREAD_COSTS[t.k].credits, 3) + (o.odhad ? '*' : ''); }).join(' · ')).join('  |  '));
console.log('Volné čtení při registraci (1 Single s hlasem) = náklad na získání uživatele: ' + ['en', 'is'].map((l) => l.toUpperCase() + ' ' + usd(radek('single', l).model + radek('single', l).hlas, 3)).join(' · '));
