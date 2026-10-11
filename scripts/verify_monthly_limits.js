// §18 guard: the monthly cast cap lives in TWO places and they must never drift.
//   v2/runar-config.js            TIERS.standard/premium.monthly_readings   (client, source of truth)
//   supabase/functions/claude-proxy/index.ts   MONTHLY_LIMITS               (server, enforces it)
// The proxy is Deno and cannot import the client config, so a copy is unavoidable — this
// check is what keeps the copy honest (raise the tier in config, forget the proxy, and a
// subscriber silently keeps the old cap). Fails loudly on any mismatch.
//   node scripts/verify_monthly_limits.js
const fs = require('fs');
const R = (process.env.RUNAR_ROOT || 'C:/Users/zkuku/Downloads/Runar-admin') + '/';

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

// ── strop HLASU (2026-09-11): tataz trida kopie, tentyz duvod ────────────────
// VOICE_MONTHLY_LIMIT zije v config (zdroj pravdy) a v elevenlabs-proxy (vynucuje).
// Deno klientsky config naimportovat neumi, takze kopie je nevyhnutelna — a tohle je to,
// co ji drzi poctivou. Snizis strop v configu, zapomenes na proxy, a tester dal ozvucuje.
const elProxy = fs.readFileSync(R + 'supabase/functions/elevenlabs-proxy/index.ts', 'utf8');
const cfgHlas = (cfg.match(/^const VOICE_MONTHLY_LIMIT\s*=\s*(\d+)/m) || [])[1];
const elHlas  = (elProxy.match(/^const VOICE_MONTHLY_LIMIT\s*=\s*(\d+)/m) || [])[1];
if (!cfgHlas)      { fail++; console.log('FAIL  VOICE_MONTHLY_LIMIT chybi v runar-config.js'); }
else if (!elHlas)  { fail++; console.log('FAIL  VOICE_MONTHLY_LIMIT chybi v elevenlabs-proxy'); }
else if (cfgHlas !== elHlas) {
  fail++; console.log('FAIL  hlas: config=' + cfgHlas + ' ale proxy vynucuje ' + elHlas);
} else {
  console.log('OK    hlas: ' + cfgHlas + ' prehrani/mesic (config == proxy)');
}
// A jeste to, co uz kopie neuhlida: strop musi byt v proxy opravdu POUZITY, ne jen deklarovany.
// Mrtva konstanta by prosla shodou cisel a neomezila nic.
// 2026-10-11: strop se vybira podle testera (VOICE_MONTHLY_LIMIT_TESTER, owner pres CODE-read) a porovnava se `limit`.
if (elHlas && !(/const limit = vprof\?\.is_tester \? VOICE_MONTHLY_LIMIT_TESTER : VOICE_MONTHLY_LIMIT;/.test(elProxy) && /vUsed\s*>=\s*limit\b/.test(elProxy))) {
  fail++; console.log('FAIL  hlas: VOICE_MONTHLY_LIMIT(_TESTER) je v proxy deklarovany, ale nic se s nim neporovnava');
} else if (elHlas) {
  console.log('OK    hlas: strop (tester / ostatni) se v proxy opravdu porovnava (neni to mrtva konstanta)');
}
// Testeri 15 a bezpecna hladina kvoty (2026-10-11): tataz trida kopie — config (zdroj) × elevenlabs-proxy (× elevenlabs-static u hladiny).
{
  const elStatic = fs.readFileSync(R + 'supabase/functions/elevenlabs-static/index.ts', 'utf8');
  const cT = (cfg.match(/^const VOICE_MONTHLY_LIMIT_TESTER\s*=\s*(\d+)/m) || [])[1];
  const pT = (elProxy.match(/^const VOICE_MONTHLY_LIMIT_TESTER\s*=\s*(\d+)/m) || [])[1];
  if (!cT || !pT || cT !== pT) { fail++; console.log('FAIL  hlas testera: config ' + cT + ' × proxy ' + pT); }
  else console.log('OK    hlas testera: ' + cT + ' za mesic (config == proxy)');
  const sh = (s) => (s.match(/^const VOICE_SAFE_SHARE\s*=\s*([\d.]+)/m) || [])[1];
  const cS = sh(cfg), pS = sh(elProxy), sS = sh(elStatic);
  if (!cS || cS !== pS || cS !== sS) { fail++; console.log('FAIL  bezpecna hladina: config ' + cS + ' × proxy ' + pS + ' × static ' + sS); }
  // Hleda se samo POROVNANI — `kLim * VOICE_SAFE_SHARE` stoji i ve vypisu do logu, takze vypnuta podminka by prosla (utok 2026-10-11).
  else if (!/kUsed \+ text\.length > kLim \* VOICE_SAFE_SHARE/.test(elProxy) || !/kUsed \+ text\.length > kLim \* VOICE_SAFE_SHARE/.test(elStatic)) {
    fail++; console.log('FAIL  bezpecna hladina: VOICE_SAFE_SHARE je deklarovana, ale proxy/static s ni neporovnava');
  } else console.log('OK    bezpecna hladina kvoty: ' + cS + ' (config == proxy == static, obe porovnavaji)');
}

// ── strop ROZBORU JMENA (2026-09-12): tataz trida kopie ──────────────────────
// NAME_LORE_LIMIT zije v config (klient podle nej schova tlacitko) a v claude-proxy (vynucuje).
// V proxy je deklarovany uvnitr handleru, proto regex bez `^`. Komentar, ktery konstantu jen
// jmenuje, nematchne — hleda se `const NAME_LORE_LIMIT =`.
const cfgJm = (cfg.match(/^const NAME_LORE_LIMIT\s*=\s*(\d+)/m) || [])[1];
const pxJm  = (proxy.match(/const NAME_LORE_LIMIT\s*=\s*(\d+)/) || [])[1];
if (!cfgJm)      { fail++; console.log('FAIL  NAME_LORE_LIMIT chybi v runar-config.js'); }
else if (!pxJm)  { fail++; console.log('FAIL  NAME_LORE_LIMIT chybi v claude-proxy'); }
else if (cfgJm !== pxJm) {
  fail++; console.log('FAIL  rozbor jmena: config=' + cfgJm + ' ale proxy vynucuje ' + pxJm);
} else if (!/cnt\s*>=\s*NAME_LORE_LIMIT/.test(proxy)) {
  fail++; console.log('FAIL  rozbor jmena: NAME_LORE_LIMIT je v proxy deklarovany, ale nic se s nim neporovnava');
} else {
  console.log('OK    rozbor jmena: ' + cfgJm + ' rozbory od modelu (config == proxy, strop se porovnava)');
}

// Asky na čtení (2026-09-25): TIERS.<tier>.asks_per_reading (config, klient) == ASKS_PER_READING (claude-proxy, vynucuje)
// a proxy s nimi opravdu porovnává — jinak by mrtvá konstanta prošla zeleně.
{
  const pxA = proxy.match(/const ASKS_PER_READING[^=]*=\s*\{([^}]*)\}/);
  for (const tier of ['free_trial', 'rune_seeker', 'standard', 'premium']) {
    const m0 = cfg.match(new RegExp('^\\s{2}' + tier + ':\\s*\\{', 'm'));
    const c = m0 ? (cfg.slice(m0.index, m0.index + 1600).match(/asks_per_reading:\s*(\d+)/) || [])[1] : null;
    const p = pxA ? (pxA[1].match(new RegExp(tier + '\\s*:\\s*(\\d+)')) || [])[1] : null;
    if (c == null || p == null || c !== p) { fail++; console.log('FAIL  asky ' + tier + ': config ' + c + ' × proxy ' + p); }
  }
  if (!/used\s*>=\s*askLimit/.test(proxy) || !/ASKS_PER_READING\[userTier\]/.test(proxy)) {
    fail++; console.log('FAIL  asky: ASKS_PER_READING v proxy nic nevynucuje');
  } else if (fail === 0) console.log('OK    asky na čtení: config == proxy a strop se porovnává');
}

console.log(fail === 0 ? '\nMonthly caps agree — config is enforced by the proxy.'
                       : '\n' + fail + ' MISMATCH — the cap the user pays for is not the cap enforced.');
process.exit(fail ? 1 : 0);
