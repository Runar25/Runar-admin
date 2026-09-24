// cena_cteni.js — PŘESNÁ cena hotových čtení z `readings.usage` (tokeny, které API vrátilo u každého čtení) × ceník.
// PROČ (CODE-read 2026-09-24, owner: „jak jsi zjistil přesnou cenu? nechci odhady, čtení už jsou hotová"): cena čtení
// závisí na tom, jestli volání trefilo cache — to se předem neví, ale po čtení je to v `usage` přesně. Tohle ji sečte.
// Počítá i doplňující otázky (Ask), pokud mají v `follow_up[].usage` uložené tokeny (ukládá se od 2026-09-24, CODE-tune).
//
// Ceník ověřen 2026-09-24 na https://platform.claude.com/docs/en/about-claude/pricing (za 1 M tokenů, USD):
//   Opus 5 / 4.8 / 4.7: vstup 5 · zápis cache 5 min 6,25 · 1 h 10 · čtení cache 0,50 · výstup 25; `inference_geo: "us"` = ×1,1.
//   Nový model → přidej řádek do CENIK (a datum ověření). Model, který v CENIK není, skript nahlásí, nepočítá potichu.
// SOUKROMÍ: výchozí = jen ownerova čtení (kukula@agndofa.is). Čte jen tokeny a datum, žádný text čtení.
//
//   node scripts/cena_cteni.js [email] [od YYYY-MM-DD]
'use strict';
const { execFileSync } = require('child_process');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const CENIK = {   // [vstup, zápis 5 min, zápis 1 h, čtení cache, výstup] USD / 1 M tokenů
  'claude-opus-5': [5, 6.25, 10, 0.5, 25],
  'claude-opus-4-8': [5, 6.25, 10, 0.5, 25],
  'claude-opus-4-7': [5, 6.25, 10, 0.5, 25],
};
const [EMAIL = 'kukula@agndofa.is', OD = '2000-01-01'] = process.argv.slice(2);
if (!/^[^\s'@]+@[^\s'@]+$/.test(EMAIL) || !/^\d{4}-\d{2}-\d{2}$/.test(OD)) { console.error('špatný email nebo datum'); process.exit(2); }

function cena(u) {
  const c = CENIK[u.model]; if (!c) return null;
  const cc = u.cache_creation || {};
  const w5 = cc.ephemeral_5m_input_tokens != null ? cc.ephemeral_5m_input_tokens : (u.cache_creation_input_tokens || 0);
  const w1 = cc.ephemeral_1h_input_tokens || 0;
  return (u.inference_geo === 'us' ? 1.1 : 1) * ((u.input_tokens || 0) * c[0] + w5 * c[1] + w1 * c[2] + (u.cache_read_input_tokens || 0) * c[3] + (u.output_tokens || 0) * c[4]) / 1e6;
}
// Samotest na známém vstupu (§19.1): 1692 vstup + 152 výstup na Opus 4.8 = 0,00846 + 0,0038 = 0,01226 USD.
if (Math.abs(cena({ model: 'claude-opus-4-8', input_tokens: 1692, output_tokens: 152 }) - 0.01226) > 1e-9) { console.error('CHYBA NÁSTROJE: výpočet ceny'); process.exit(1); }

const sql = "select drawn_at, lang, (spread_data is not null) as spread, coalesce(spread_data->>'spread', spread_data->>'type', '') as typ, usage, follow_up " +
  "from readings where user_id = (select id from auth.users where email = '" + EMAIL + "') and drawn_at >= '" + OD + "' order by drawn_at";
const out = execFileSync('supabase', ['--workdir', ROOT, 'db', 'query', '--linked', sql, '-o', 'json'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const rows = JSON.parse(out.slice(out.indexOf('{'))).rows;
const skupiny = {}, neznamy = new Set(); let bezUsage = 0, askN = 0, askUsd = 0, askBez = 0;
for (const r of rows) {
  for (const f of (r.follow_up || [])) { if (f && f.usage && f.usage.model) { const c = cena(f.usage); if (c == null) neznamy.add(f.usage.model); else { askN++; askUsd += c; } } else askBez++; }
  if (!r.usage || !r.usage.model) { bezUsage++; continue; }
  const c = cena(r.usage); if (c == null) { neznamy.add(r.usage.model); continue; }
  const k = r.usage.model + ' · ' + (r.spread ? (r.typ || 'spread') : 'single') + ' · ' + r.lang;
  const g = skupiny[k] = skupiny[k] || { n: 0, usd: 0, min: 1, max: 0, zapis: 0, zasah: 0 };
  g.n++; g.usd += c; g.min = Math.min(g.min, c); g.max = Math.max(g.max, c);
  if (r.usage.cache_creation_input_tokens) g.zapis++; if (r.usage.cache_read_input_tokens) g.zasah++;
}
console.log('Čtení ' + EMAIL + ' od ' + OD + ': ' + rows.length + ' (bez uloženého usage ' + bezUsage + ')');
let celkem = 0;
for (const [k, g] of Object.entries(skupiny).sort()) {
  celkem += g.usd;
  console.log('  ' + k.padEnd(34) + ' n ' + String(g.n).padStart(4) + ' · celkem $' + g.usd.toFixed(4) + ' · průměr $' + (g.usd / g.n).toFixed(5)
    + ' · min $' + g.min.toFixed(5) + ' · max $' + g.max.toFixed(5) + ' · cache zápis/zásah ' + g.zapis + '/' + g.zasah);
}
console.log('  ČTENÍ CELKEM $' + celkem.toFixed(4));
console.log('  Ask: s usage ' + askN + (askN ? ' · celkem $' + askUsd.toFixed(4) + ' · průměr $' + (askUsd / askN).toFixed(5) : '') + ' · bez usage ' + askBez);
if (neznamy.size) { console.log('⚠ Model bez ceny v CENIK (nezapočítáno): ' + [...neznamy].join(', ')); process.exitCode = 1; }
