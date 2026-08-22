// §18 guard: the monthly cast cap lives in TWO places and they must never drift.
//   v2/runar-config.js            TIERS.standard/premium.monthly_readings   (client, source of truth)
//   supabase/functions/claude-proxy/index.ts   MONTHLY_LIMITS               (server, enforces it)
// The proxy is Deno and cannot import the client config, so a copy is unavoidable — this
// check is what keeps the copy honest (raise the tier in config, forget the proxy, and a
// subscriber silently keeps the old cap). Fails loudly on any mismatch.
//   node scripts/verify_monthly_limits.js
const fs = require('fs');
const R = 'C:/Users/zkuku/Downloads/Runar-admin/';

const cfg = fs.readFileSync(R + 'v2/runar-config.js', 'utf8');
const proxy = fs.readFileSync(R + 'supabase/functions/claude-proxy/index.ts', 'utf8');

// config: find the tier's own block, then its monthly_readings.
// Anchor on the key at line start — a bare indexOf('standard:') hits `life_rune_standard:`
// first and reads the wrong block (that false FAIL is exactly the §19 fixture trap).
function cfgLimit(tier) {
  const m0 = cfg.match(new RegExp('^\\s{2}' + tier + ':\\s*\\{', 'm'));
  if (!m0) return null;
  const m = cfg.slice(m0.index, m0.index + 900).match(/monthly_readings:\s*(\d+)/);
  return m ? Number(m[1]) : null;
}
// proxy: MONTHLY_LIMITS = { standard: 50, premium: 75 }
// Anchor on the declaration — a bare /MONTHLY_LIMITS/ matches the header comment that
// merely names it, and then reads nothing (same trap as cfgLimit above).
function proxyLimit(tier) {
  const m = proxy.match(/const MONTHLY_LIMITS[^=]*=\s*\{([^}]*)\}/);
  if (!m) return null;
  const t = m[1].match(new RegExp(tier + '\\s*:\\s*(\\d+)'));
  return t ? Number(t[1]) : null;
}

let fail = 0;
for (const tier of ['standard', 'premium']) {
  const c = cfgLimit(tier), p = proxyLimit(tier);
  if (c === null) { fail++; console.log('FAIL  ' + tier + ': monthly_readings not found in runar-config.js'); continue; }
  if (p === null) { fail++; console.log('FAIL  ' + tier + ': not found in proxy MONTHLY_LIMITS'); continue; }
  if (c !== p)    { fail++; console.log('FAIL  ' + tier + ': config=' + c + ' but proxy enforces ' + p); continue; }
  console.log('OK    ' + tier + ': ' + c + ' readings/month (config == proxy)');
}
// ── spread_cost sanitizace (2026-08-22, audit CRITICAL): radek musi v proxy BYT
// a musi PREZIT adversarialni vstupy — spousti se tu doslova (kopie z proxy source
// za behu, ne vlastni opis — vlastni kopie by se rozesla, §18/§19).
const sm = proxy.match(/const spreadCost = (Math\.min\(9, Math\.max\(1, Math\.round\(Number\(spread_cost\)\) \|\| 1\)\));/);
if (!sm) { fail++; console.log('FAIL  spread_cost sanitizace v proxy chybi (NaN projde do uctovani)'); }
else {
  for (const zly of [NaN, 'abc', -5, Infinity, 2.5, undefined, null, 1e9, '4']) {
    const spread_cost = zly;
    const vysledek = eval(sm[1]);
    if (!Number.isInteger(vysledek) || vysledek < 1 || vysledek > 9) {
      fail++; console.log('FAIL  sanitizace pustila ' + String(zly) + ' -> ' + vysledek); break;
    }
  }
  if (!fail) console.log('OK    spread_cost sanitizace drzi (9 adversarialnich vstupu -> cele cislo 1..9)');
}

console.log(fail === 0 ? '\nMonthly caps agree — config is enforced by the proxy.'
                       : '\n' + fail + ' MISMATCH — the cap the user pays for is not the cap enforced.');
process.exit(fail ? 1 : 0);
