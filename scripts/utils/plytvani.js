// plytvani.js — kde se zbytečně platí za volání (model, hlas). Čte JEN databázi, žádné volání API, nic nezapisuje.
//
// Proč (KUKY 2026-10-10: „budeme ještě chtít hlídat případné plýtvání voláním, což nás stojí peníze“; kontrola architektury část 41):
// náklady sčítá stats.js / naklady.py, ale nikde se neukazovalo, KOLIK z toho bylo zbytečné. Tohle hledá vzorce plýtvání:
//   1. záloha: sol selhal (`usage.tries` obsahuje `sol:fail`) → zaplatil se i Claude; když sol vypršel pozdě, mohl se účtovat i on
//   2. dvojí generování: tentýž uživatel, runa a jazyk do 20 s (dvojklik, opakovaný pokus, souběh — BACKLOG část 40)
//   3. tokeny přemýšlení — platí se jako výstup, čtenář je nevidí
//   4. cache promptu — čtení z cache je levné; ZÁPIS do cache (Claude) se platí dráž než běžný vstup a vyplatí se, jen když se z cache
//      pak čte (zhruba aspoň 0,3 × zapsaného) — jinak je to čistá přirážka
//   5. hlas: počet a znaky; hlas bez uloženého čtení v předchozích 15 min (čtení „pro někoho“ se neukládá — nebo volání mimo appku, #2b)
// Čísla jsou počty a podíly; ceny počítá stats.js (jedno místo cen, §20).
//   node scripts/utils/plytvani.js                    # posledních 30 dní
//   node scripts/utils/plytvani.js --dny 7
//   node scripts/utils/plytvani.js --dny 7 --kratce   # jen souhrn + varování (volá ho nacti_cteni.js)
'use strict';
const cp = require('child_process'), path = require('path'), fs = require('fs'), os = require('os');
const ROOT = path.resolve(__dirname, '..', '..');
const i = process.argv.indexOf('--dny');
const DNY = Math.max(1, Math.min(365, parseInt(i > 0 ? process.argv[i + 1] : '30', 10) || 30));
const OD = "now() - interval '" + DNY + " days'";
const KRATCE = process.argv.includes('--kratce');
const log = (x) => { if (!KRATCE) console.log(x); };

// SQL souborem (-f), ne argumentem — shell by rozbil mezery a uvozovky; stejně jako stats.js.
function q(sql) {
  const tmp = path.join(os.tmpdir(), 'runar_plytvani_' + process.pid + '.sql');
  fs.writeFileSync(tmp, sql, 'utf8');
  try {
    const out = cp.execSync('supabase --workdir "' + ROOT + '" db query --linked --output-format json -f "' + tmp + '"',
      { encoding: 'utf8', env: Object.assign({}, process.env, { AI_AGENT: '1' }), stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 26 });
    const j = JSON.parse(out.slice(out.indexOf('{')));
    return j.rows || j;
  } finally { try { fs.unlinkSync(tmp); } catch (e) {} }
}
const pct = (a, b) => (b ? Math.round((100 * a) / b) + ' %' : '–');

// Náklady a provoz, ne analýza kvality textu → všechna čtení (RUNAR_PRIVACY bod 4 se netýká).
// Pole spotřeby se u poskytovatelů jmenují jinak: OpenAI prompt/completion_tokens + cached_tokens + reasoning_tokens,
// Anthropic input/output_tokens + cache_read/cache_creation_input_tokens + thinking_tokens — sčítá se obojí.
const m = q("select usage->>'model' model, count(*) n, " +   // opt-out:ok 2026-10-10 náklady/plýtvání, ne analýza kvality textu
  "count(*) filter (where usage->'tries' ? 'sol:fail') zaloha, " +
  "coalesce(sum(coalesce((usage->>'prompt_tokens')::int, (usage->>'input_tokens')::int)),0) vstup, " +
  "coalesce(sum(coalesce((usage->>'completion_tokens')::int, (usage->>'output_tokens')::int)),0) vystup, " +
  "coalesce(sum(coalesce((usage->'completion_tokens_details'->>'reasoning_tokens')::int, (usage->'output_tokens_details'->>'thinking_tokens')::int)),0) premysleni, " +
  "coalesce(sum(coalesce((usage->'prompt_tokens_details'->>'cached_tokens')::int, (usage->>'cache_read_input_tokens')::int)),0) cache, " +
  "coalesce(sum((usage->>'cache_creation_input_tokens')::int),0) cache_zapis, " +
  "round(avg((usage->>'ms')::int) filter (where usage->'tries' ? 'sol:fail')) ms_zaloha " +
  "from public.readings where usage is not null and drawn_at >= " + OD + " group by 1 order by 2 desc;");   // opt-out:ok 2026-10-10 náklady/plýtvání
const dvoj = q("select count(*) n from public.readings a join public.readings b on a.user_id = b.user_id and a.rune_name = b.rune_name " +   // opt-out:ok 2026-10-10 náklady/plýtvání
  "and a.lang = b.lang and a.id <> b.id and b.drawn_at > a.drawn_at and b.drawn_at - a.drawn_at < interval '20 seconds' " +
  "where a.drawn_at >= " + OD + ";")[0];
const hlas = q("select count(*) n, coalesce(sum(chars),0) znaku, count(distinct user_id) lidi, " +
  "count(*) filter (where not exists (select 1 from public.readings r where r.user_id = v.user_id " +   // opt-out:ok 2026-10-10 náklady/plýtvání
  "and r.drawn_at between v.created_at - interval '15 minutes' and v.created_at)) bez_cteni " +
  "from public.voice_usage v where v.source = 'dynamic' and v.created_at >= " + OD + ";")[0];

log('\n  ══ RÚNAR — plýtvání voláními, posledních ' + DNY + ' dní (jen čtení DB) ══\n');
let celkem = 0;
for (const r of m) {
  celkem += +r.n;
  log('  model ' + (r.model || '?') + ': ' + r.n + ' volání · záloha (sol selhal → platil i Claude) ' + r.zaloha +
    (+r.zaloha ? ' (průměrně ' + r.ms_zaloha + ' ms)' : '') + ' · přemýšlení ' + pct(+r.premysleni, +r.vystup) + ' výstupu · čtení z cache ' +
    pct(+r.cache, +r.vstup) + ' vstupu' + (+r.cache_zapis ? ' · zápis do cache ' + r.cache_zapis + ' tok., zpět přečteno ' + r.cache + ' tok.' : ''));
}
if (!m.length) log('  žádná čtení s údaji o spotřebě');
log('  dvojí generování (tentýž člověk, runa a jazyk do 20 s): ' + dvoj.n);
log('  hlas: ' + hlas.n + ' × (' + hlas.znaku + ' znaků, ' + hlas.lidi + ' lidí) · bez uloženého čtení v předchozích 15 min: ' + hlas.bez_cteni +
  (+hlas.bez_cteni ? ' (může být čtení „pro někoho“ — neukládá se; jinak volání mimo appku, #2b)' : ''));

const varovani = [];
const jm = (f) => m.filter(f).map((r) => r.model).join(', ');
if (jm((r) => +r.zaloha > 0)) varovani.push('zálohy na Claude (' + jm((r) => +r.zaloha > 0) + ') — u každé mohl platit i sol; při opakování zkontroluj limit 50 s a stav OpenAI');
if (+dvoj.n > 0) varovani.push('dvojí generování ' + dvoj.n + '× — souběh/dvojklik (BACKLOG část 40)');
if (jm((r) => +r.premysleni > 0.3 * +r.vystup)) varovani.push('přemýšlení nad 30 % výstupu (' + jm((r) => +r.premysleni > 0.3 * +r.vystup) + ') — platí se, čtenář ho nevidí');
if (jm((r) => +r.cache_zapis > 0 && +r.cache < 0.3 * +r.cache_zapis)) varovani.push('zápis do cache se nevrací (' + jm((r) => +r.cache_zapis > 0 && +r.cache < 0.3 * +r.cache_zapis) + ') — přirážka za zápis bez čtení z cache');
if (+hlas.bez_cteni > 0) varovani.push('hlas bez uloženého čtení ' + hlas.bez_cteni + '× — ověř: čtení „pro někoho“, nebo volání mimo appku (#2b)');
if (KRATCE) console.log('  ' + celkem + ' volání modelu · ' + hlas.n + ' × hlas · dvojí generování ' + dvoj.n);
console.log((KRATCE ? '' : '\n') + (varovani.length ? '  ⚠ ' + varovani.join('\n  ⚠ ') : '  ✓ žádný vzorec plýtvání za období'));
log('  (ceny: node scripts/utils/stats.js · podrobně: node scripts/utils/plytvani.js --dny N)\n');
