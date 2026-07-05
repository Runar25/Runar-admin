# §18 anti-drift cleanup pass — 2026-07-05 (SW v125 → v133)

Trigger: owner asked to audit the whole codebase for §18 (anti-drift) holes after
the reading-quality/unification work. Ran a multi-agent audit (70 flagged → 18
adversarially-confirmed, 0 high / 4 med / 14 low; ~27 verify agents rate-limited
so the confirmed set was a floor). Then fixed the real ones. 8 commits, all
smoke-passed + pushed to main. Owner's core pain = "všechno všude a nikde" (drift).

## Root cause the owner flagged (limits): backend truth vs frontend cruft
`claude-proxy` returns ONLY `rate_limited` | `no_credits`. The frontend still had
model-A branches for `weekly_limit` ("stones rest until Monday") and
`monthly_limit` — **dead code** (weekly drip + monthly reset were removed in model
B). "stones" is also wrong vocab (→ "rune readings" per VOCAB.unit).

## What got unified (commit → what)
1. `[fix]` **limit/error messaging → one source.** New `err_rate_limited` /
   `err_no_credits` / `err_generic` keys (EN+IS) + `_readingErrMsg(type)` helper in
   reading.js. Single + spread + startReading gate + voice all use it. Dropped dead
   weekly/monthly branches + stale "þessum mánuði/this month" gate copy. shrine.html
   dead weekly branch removed. proxy header comment de-staled.
2. `[fix]` `syncMonthlyCount` → **`syncFreeBalance`** (only refreshes free_balance; the
   "Monthly" name was model-A). 12 sites, pure rename.
3. `[fix]` removed **10 dead `buildXxxPromptIS/EN` wrappers** (unification leftovers;
   the lang dispatchers are the live API). Golden byte-identical.
4. `[fix]` **localized hardcoded auth-modal + side-panel strings** (§10): title/google/
   email/magic-link/success + "THE JOURNEY BEYOND" (`sp_higher_path`). Were English in IS.
5. `[fix]` **Life Rune cost label from config** (§15): `vn('unit', LIFE_RUNE_COST, lang)`
   instead of hardcoded `t('tree_rs_cost')`='3 rune readings'. Dropped the dead key.
6. `[fix]` **spread slot/output renderers consolidated** (§18): `_updateSpread3/5/7/9Slots`
   → one `_updateSpreadSlots(cfg)` + `_SPREAD_SLOT_CFG` table + 4 thin delegators (call
   sites untouched). `_hideSpread3/5/7/9Output` → one `_hideAllSpreadOutputs`. Verified
   LIVE in the reader (norns + horseshoe DOM + click-to-remove identical).
7. `[fix]` **birth-month lore → one `BIRTH_MONTHS` pack** `{name, is, en}` + `getBirthMonth
   (m, lang)`. Was 2 parallel maps. Verified 26/26 byte-identical (life-rune path,
   golden doesn't dump it) + golden hash unchanged for single/spread builders.
8. `[fix]` **legacy tier alias → `normalizeTier()`** in utils. `{free,credits}→rune_seeker`
   was inlined in 3 app.js spots. auth.js:393 left (direct post-redeem assign, not the rule).

## Deliberately NOT done (low value / higher risk — owner to greenlight)
- **shrine callProxy() + stream() shadows** (shrine.html vs app.js/utils). Admin-only
  preview tool; divergence is largely intentional (no credit flow); consolidating
  touches production shared transport for admin-tool cleanliness. Audit: "not high priority".
- **reading.js loading/pulsing DOM setup dup** (_generateReading vs _generateSpreadReading).
  Trivial cosmetic; the meaningful part (error copy) already unified in #1.

## Forward note
If monthly-cap enforcement is ever added to claude-proxy, re-add an `err_monthly_limit`
key + a branch in `_readingErrMsg` (§13 full-path) — the branch was removed as dead, not
because monthly caps are cancelled.

## Verification method that worked
- character.js output changes: `scripts/golden/golden_dump.js` hash compare (single/spread
  builders) + live preview eval for paths golden doesn't dump (life-rune, spread slots).
- Committed `scripts/golden/golden_baseline.json` is STALE (predates this era) — don't trust
  it directly; compare PRE/POST within the same session instead.
- Local preview HTTP-caches sub-resources (no SW there) → cache-bust fetch (`?x=rand`) to
  read true on-disk JS. Production busts via SW version bump.
