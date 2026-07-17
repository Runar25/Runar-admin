// Supabase Edge Function: claude-proxy
// Forwards to Claude API. Enforces tier logic:
//   free_trial (anonymous) — frontend handles trial count (localStorage)
//   rune_seeker — BALANCE SYSTEM (model B, 2026-06-12):
//     free_balance in user_profiles: 1 at onboarding, NO replenish (no weekly drip)
//     free readings: SINGLE RUNE ONLY (spread_cost must be 1)
//     paid credits: any spread, cost = spread_cost param
//     -> only error this path returns is no_credits (402); no weekly/monthly error
//   standard / premium — monthly cast cap (MONTHLY_LIMITS); a follow-up (ask) does not count
// Rate limit: 10 requests / 60s per user (or IP for anonymous)
// Tree context: injected into system prompt for tree-active readings (Vrstva A)
// Session state: derived from tree + time, shapes reading tone (Vrstva B)
// Voice scale: 0-20 user preference injected as tonal instruction (Vrstva C)
//
// CREDIT SAFETY (2026-07-04): the balance/credit is deducted ONLY AFTER a
//   verified-successful reading. Eligibility is checked up front (402 if the
//   seeker cannot afford it) but the actual deduction runs after Claude returns
//   real text — so a transient failure never costs a credit.
// RESILIENCE (2026-07-04): the Claude fetch has an AbortController timeout and
//   retries transient upstream errors (429/5xx/529) with backoff, then returns a
//   clean 503 with a friendly message instead of leaking a platform 503 or
//   masking overload as a 400.
// MODEL FALLBACK (2026-07-10): on a SUSTAINED overload of a model (all retries
//   exhausted), fall through the chain Opus 4.8 -> Opus 4.7 -> Sonnet 5 before giving
//   up, so even a broad Anthropic overload returns a reading instead of a 503. Sonnet
//   is the last-resort safety net (more capacity, slightly lesser IS quality). A
//   genuine 4xx (bad request) never falls through.
// Deploy: supabase functions deploy claude-proxy --project-ref pmitxjvkeovijreepror --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...cors, "Content-Type": "application/json" } });

// Vrstvy A/B/C (tree memory / session state / voice scale) OFF (2026-07-04).
// The reading-quality audit found they stack ~8 conflicting tone directives onto
// paid readings (e.g. "come as fire" from a calendar rotation vs the winter
// seasonal image; voice-scale "pure metaphor" vs the base "one image, direct"),
// degrading Icelandic coherence. Re-enable once each layer is driven by real UI
// and validated by the IS eval. Flip to true to restore the previous behaviour.
const ENABLE_DYNAMIC_CONTEXT = false;

function sb() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

// ── ISO week key (e.g. "2026-W22") ───────────────────────────────────────────
function getISOWeekKey(date: Date): string {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

// ── Vrstva A: tree context ────────────────────────────────────────────────────
function buildTreeContext(tree: Record<string, unknown>): string {
  const patterns  = (tree.recurring_pattern as string[] ?? []).filter(Boolean);
  const arc       = (tree.emotional_arc as string) || "opening";
  const symbols   = tree.personal_symbols as Record<string, number> ?? {};
  const forbidden = (tree.forbidden_next as string[] ?? []).filter(Boolean);

  const topSymbols = Object.entries(symbols)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([sym]) => sym);

  const arcDesc: Record<string, string> = {
    opening:     "beginning to become aware",
    deepening:   "turning inward",
    integration: "weaving things together",
    threshold:   "standing at a turning point",
  };

  let ctx = "\n\n--- SEEKER'S LIVING PATTERN ---\n";
  if (patterns.length)   ctx += "What returns: " + patterns.join(", ") + "\n";
  if (arc)               ctx += "Where they stand: " + (arcDesc[arc] ?? arc) + "\n";
  if (topSymbols.length) ctx += "Images that speak to them: " + topSymbols.join(", ") + "\n";
  if (forbidden.length)  ctx += "Avoid repeating this time: " + forbidden.join(", ") + "\n";
  ctx += "---";
  return ctx;
}

// ── Vrstva B: session state ───────────────────────────────────────────────────
interface SessionState {
  energy:   "high" | "low" | "still";
  distance: "close" | "wide";
  element:  "fire" | "water" | "air" | "earth" | "silence";
  movement: "forward" | "inward" | "weaving" | "turning";
}

function deriveSessionState(tree: Record<string, unknown> | null, now: Date): SessionState {
  const arc          = (tree?.emotional_arc as string) || "opening";
  const sessionCount = (tree?.session_count as number) || 0;

  let energy: SessionState["energy"];
  if (arc === "threshold")      energy = "high";
  else if (arc === "deepening") energy = "still";
  else {
    const hour = now.getUTCHours();
    energy = (hour >= 17 || hour < 6) ? "low" : "high";
  }

  const distance: SessionState["distance"] = sessionCount < 6 ? "close" : "wide";

  const elements: SessionState["element"][] = ["fire", "water", "air", "earth", "silence"];
  const element = elements[(sessionCount + now.getUTCDay()) % elements.length];

  const movementMap: Record<string, SessionState["movement"]> = {
    opening: "forward", deepening: "inward", integration: "weaving", threshold: "turning",
  };
  const movement = movementMap[arc] ?? "forward";

  return { energy, distance, element, movement };
}

function buildSessionContext(s: SessionState): string {
  const elementDesc: Record<string, string> = {
    fire:    "Come as fire — direct, warming, consuming what needs to burn.",
    water:   "Come as water — yielding, deep, finding what lies beneath.",
    air:     "Come as air — sweeping, clarifying, seeing from above.",
    earth:   "Come as earth — grounded, patient, rooted in what endures.",
    silence: "Come as silence — spacious, waiting, letting the unspoken surface.",
  };
  const energyDesc: Record<string, string> = {
    high:  "Speak with full presence.",
    low:   "Speak quietly, as if by firelight.",
    still: "Hold space. Let the words land gently.",
  };
  const distanceDesc: Record<string, string> = {
    close: "Stay close to this moment, this person.",
    wide:  "Hold the wider arc of their journey.",
  };
  const movementDesc: Record<string, string> = {
    forward: "The current moves forward.",
    inward:  "The current moves inward.",
    weaving: "The threads are being woven together.",
    turning: "Something is turning — meet it without hurry.",
  };
  return (
    "\n\n--- THIS READING'S VOICE ---\n" +
    (elementDesc[s.element]   ?? "") + " " +
    (energyDesc[s.energy]     ?? "") + " " +
    (distanceDesc[s.distance] ?? "") + " " +
    (movementDesc[s.movement] ?? "") +
    "\n---"
  );
}

// ── Vrstva C: voice scale (0-20) ─────────────────────────────────────────────
const VOICE_INSTRUCTIONS: Record<number, string> = {
  0:  "Speak with absolute plainness. No image, no symbol. Only what is real and direct.",
  1:  "Speak almost entirely in plain language. One concrete image may appear if unavoidable.",
  2:  "Very direct. Ground everything. Let no metaphor linger.",
  3:  "Mostly direct. Image may appear once, briefly.",
  4:  "Predominantly direct. A single metaphor only if it earns its place.",
  5:  "Direct with rare image. Keep both feet on the ground.",
  6:  "Grounded. One image may open the door, nothing more.",
  7:  "Lean direct. Let image appear only to clarify, not to decorate.",
  8:  "Slight lean toward direct. Balance tips toward plain speech.",
  9:  "Nearly balanced, direct has a slight edge.",
  10: "Equal measure — direct and image in balance.",
  11: "Nearly balanced, image has a slight edge.",
  12: "Slight lean toward image. Let metaphor carry some weight.",
  13: "Lean toward image. Direct is the anchor, metaphor the sail.",
  14: "More image than plain speech. Ground once, then let it fly.",
  15: "Image-forward. Reality appears as shadow beneath the symbol.",
  16: "Mostly symbolic. Direct speech surfaces only to orient.",
  17: "Strongly symbolic. Plain meaning is implied, not stated.",
  18: "Almost entirely in image. Directness is a distant shore.",
  19: "Near-pure symbol. One plain word at most, if needed.",
  20: "Speak entirely in symbol and image. Nothing literal. Pure metaphor.",
};

function buildVoiceContext(scale: number, settled: boolean): string {
  const clamped = Math.max(0, Math.min(20, Math.round(scale)));
  const instruction = VOICE_INSTRUCTIONS[clamped] ?? VOICE_INSTRUCTIONS[10];
  if (settled) {
    return "\n\n--- VOICE ---\n" + instruction + " (This seeker's voice is known to you.)\n---";
  }
  return "\n\n--- VOICE ---\n" + instruction + "\n---";
}

// ── Claude call with timeout + retry on transient upstream errors ────────────
// Returns { ok:true, data } on a 2xx, or { ok:false, status, error } otherwise.
// Retries 408/409/429/5xx/529 with exponential backoff + jitter; each attempt is
// bounded by an AbortController so a hung upstream cannot push the invocation
// past the platform execution limit (which is what surfaced as a raw 503).
async function callClaudeWithRetry(
  payload: unknown,
  apiKey: string,
): Promise<{ ok: true; data: any } | { ok: false; status: number; error: string }> {
  const RETRYABLE = new Set([408, 409, 429, 500, 502, 503, 504, 529]);
  const MAX_ATTEMPTS = 3;
  const PER_ATTEMPT_MS = 55000; // the 9-rune Yggdrasil reading legitimately takes ~40s; 30s cut it off
  let lastStatus = 503;
  let lastError = "no response";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PER_ATTEMPT_MS);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        return { ok: true, data: await res.json() };
      }

      // Read the body defensively — it may be JSON (Anthropic error) or an HTML
      // gateway page. Never assume .json() succeeds on a non-2xx.
      const raw = await res.text().catch(() => "");
      lastStatus = res.status;
      lastError = `status ${res.status}: ${raw.slice(0, 300)}`;

      if (!RETRYABLE.has(res.status) || attempt === MAX_ATTEMPTS) {
        return { ok: false, status: res.status, error: lastError };
      }
    } catch (e) {
      clearTimeout(timer);
      const aborted = (e as Error).name === "AbortError";
      lastStatus = aborted ? 504 : 503;
      lastError = aborted ? "upstream timeout" : ((e as Error).message || "network error");
      // A timeout = the generation is slow, not a transient blip — retrying just burns the
      // invocation budget. Return immediately (a network error still retries).
      if (aborted || attempt === MAX_ATTEMPTS) {
        return { ok: false, status: lastStatus, error: lastError };
      }
    }

    // Backoff before the next attempt (400ms, 800ms, ... + jitter).
    const backoff = 400 * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 250);
    await new Promise((r) => setTimeout(r, backoff));
  }

  return { ok: false, status: lastStatus, error: lastError };
}

// ── Deduction plan — decided up front, applied only after a successful reading ─
// Monthly cast cap for the paid tiers. MIRROR of TIERS.standard/premium.monthly_readings
// in v2/runar-config.js — the proxy is Deno and cannot import the client config, so the two
// copies are kept honest by smoke ⑨ (scripts/verify_monthly_limits.js), which fails if they
// drift. Counting unit = reading-units (SPREAD_COSTS), not runes: Yggdrasil costs 5, not 9.
const MONTHLY_LIMITS: Record<string, number> = { standard: 50, premium: 75 };

// Calendar month key, e.g. "2026-07". Stored next to the counter so the month rolls over
// on first use instead of needing a scheduled reset.
function monthKey(d = new Date()): string { return d.toISOString().slice(0, 7); }

type DeductPlan =
  | { kind: "paid"; cost: number }
  | { kind: "free"; freeBalance: number }
  | { kind: "monthly"; used: number; cost: number; mKey: string }
  | { kind: "none" };

// Apply the deduction AFTER Claude returned real text. Returns the remaining
// credit balance for a paid reading (undefined otherwise).
async function applyDeduction(plan: DeductPlan, userId: string | null): Promise<number | undefined> {
  if (plan.kind === "paid" && userId) {
    let remaining = 0;
    for (let i = 0; i < plan.cost; i++) {
      const { data } = await sb().rpc("use_credit", { p_user_id: userId });
      if (data === -1) break; // ran out mid-deduct (rare race) — reading already delivered
      remaining = data as number;
    }
    return remaining;
  }
  if (plan.kind === "monthly" && userId) {
    // Roll the counter forward. Same posture as the credit deduction: applied only after a
    // verified-successful reading, so a failed generation never eats a subscriber's cast.
    // Atomic (sql/2026-07-16_monthly_cap_atomic.sql) — writing back plan.used + cost would
    // lose a count whenever two readings are in flight, and that window is the whole
    // Claude call. use_credit and the free_balance CAS guard the same race.
    const { error } = await sb().rpc("bump_month_units", {
      p_user_id: userId, p_cost: plan.cost, p_key: plan.mKey,
    });
    if (error) console.error("monthly counter bump failed:", error.message);
    return undefined;
  }
  if (plan.kind === "free" && userId) {
    // optimistic: if a concurrent request already spent the free balance, this is a no-op
    await sb()
      .from("user_profiles")
      .update({ free_balance: plan.freeBalance - 1 })
      .eq("id", userId)
      .eq("free_balance", plan.freeBalance);
  }
  return undefined;
}

// ─────────────────────────────────────────────────────────────────────────────

// Compose the stored reading text from the model's segmented output.
// MIRROR of runar-reading.js `_parseSegments(...).reading` — keep the two in sync.
// The model returns a JSON array [{rune, text}] (+ optional prose tail); the readable
// reading is the joined segment texts. Non-JSON output is stored as-is (robust fallback).
function composeReading(raw: string): string {
  if (!raw) return "";
  const s = String(raw);
  const a = s.indexOf("["), b = s.lastIndexOf("]");
  if (a !== -1 && b > a) {
    try {
      const j = JSON.parse(s.slice(a, b + 1));
      if (Array.isArray(j) && j.length && j[0] && typeof j[0].text === "string") {
        let reading = j.map((x: any) => (x.text || "").trim()).join(" ").trim();
        const tail = s.slice(b + 1).replace(/```/g, "").trim();
        if (tail) reading = (reading + " " + tail).trim();
        return reading;
      }
    } catch (_e) { /* not segmented JSON — fall through */ }
  }
  return String(raw);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST")    return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const {
      system,
      prompt,
      max_tokens  = 600,
      use_credit  = false,
      mode        = "",
      spread_cost = 1,     // number of credits/balance to deduct (= number of runes)
      journal     = null,  // reading meta to persist server-side (null = do not save)
    } = body;
    if (!prompt) return json({ error: "Missing prompt" }, 400);

    // Clamp max_tokens (client-supplied, passed straight to Claude). Largest legit reading is
    // life_rune_premium at 2000; 2500 is headroom. Stops a crafted request ordering an
    // oversized, expensive generation.
    const cappedMaxTokens = Math.min(Math.max(1, Number(max_tokens) || 600), 2500);

    // ── Auth & tier check ──
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    let userTier = "anonymous";
    let isAdmin = false;
    let creditsBalance = 0;

    const ADMIN_EMAILS = ["kukula@agndofa.is", "info@agndofa.is"];

    if (authHeader) {
      const { data: { user } } = await sb().auth.getUser(authHeader.replace("Bearer ", ""));
      if (user) {
        userId = user.id;
        if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
          userTier = "premium";
          isAdmin  = true;   // premium is how the owner gets full access — not a subscription to meter
        } else {
          const { data: profile } = await sb()
            .from("user_profiles")
            .select("tier, credits_balance")
            .eq("id", user.id)
            .maybeSingle();
          userTier       = profile?.tier           ?? "rune_seeker";
          creditsBalance = profile?.credits_balance ?? 0;
        }
      }
    }

    if (userTier === "free" || userTier === "credits") userTier = "rune_seeker";

    // ── Rate limiting ──
    const ip    = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rlKey = userId ? `claude:user:${userId}` : `claude:ip:${ip}`;
    const { data: allowed } = await sb().rpc("check_rate_limit", {
      p_key: rlKey, p_window_seconds: 60, p_max_requests: 10,
    });
    if (!allowed) {
      return json({ error: "rate_limited", message: "Too many requests. Please wait a moment." }, 429);
    }

    // ── Eligibility (rune_seeker only) — decide the plan, DO NOT deduct yet ──
    // Deduction is applied after a verified-successful reading (credit safety).
    let deductPlan: DeductPlan = { kind: "none" };

    // ── Paid tiers: monthly cast cap (the subscription they bought) ──
    // A follow-up question is NOT a cast: it hangs off a reading that was already counted
    // (one per reading — _askUsed), and it costs a subscriber nothing today. Counting it
    // would quietly halve the subscription they bought.
    // A follow-up (ask) is cap-exempt ONLY when it is a genuine follow-up: kind 'ask' on a
    // reading that exists, is this user's, and has not been asked yet. Otherwise mode:'ask'
    // on an ordinary reading would skip the cap forever. The lookup mirrors the follow_up
    // append below, so if it passes here the append will too. Any doubt -> it counts.
    let legitAsk = false;
    if (mode === "ask" && journal?.kind === "ask" && journal?.reading_id && userId) {
      const { data: parent } = await sb().from("readings")
        .select("follow_up").eq("id", journal.reading_id).eq("user_id", userId).maybeSingle();
      legitAsk = !!parent && (parent.follow_up == null ||
        (Array.isArray(parent.follow_up) && parent.follow_up.length === 0));
    }
    const countsAsCast = !legitAsk;
    if ((userTier === "standard" || userTier === "premium") && userId && countsAsCast && !isAdmin) {
      const limit = MONTHLY_LIMITS[userTier];
      const mKey = monthKey();
      const { data: prof, error: mErr } = await sb()
        .from("user_profiles").select("month_units, month_key").eq("id", userId).maybeSingle();
      if (mErr) {
        // Columns missing / read failed: fail OPEN. Blocking a paying subscriber over an
        // infrastructure hiccup is worse than letting one reading through; it is logged.
        console.error("monthly cap read failed (allowing reading):", mErr.message);
      } else {
        const used = prof?.month_key === mKey ? (prof?.month_units ?? 0) : 0;
        const cost = Math.max(1, spread_cost);
        if (used + cost > limit) {
          return json({
            error:   "monthly_limit",
            message: "This month's readings are all drawn. They return with the new month.",
          }, 402);
        }
        deductPlan = { kind: "monthly", used, cost, mKey };
      }
    }

    if (userTier === "rune_seeker") {
      if (use_credit) {
        // ── Paid credit reading — spread_cost = runes = credits ──
        const cost = Math.max(1, spread_cost);
        if (creditsBalance < cost) {
          return json({ error: "no_credits", message: "Not enough credits. Redeem a reading gift card or upgrade." }, 402);
        }
        deductPlan = { kind: "paid", cost };

      // (Removed here: an empty `else if (mode === "ceremonial")` that handed a free reading
      // — no deduction, no check — to ANY request carrying the client string mode:'ceremonial'.
      // The Gathering reading that used it is unreachable from the UI, so it served only
      // crafted abuse. When the Gathering returns with the Tree it pays its credits via the
      // paid path above, not a bypass.)
      } else {
        // ── Free balance reading (single rune only) — 1 at registration, no replenish (model B) ──
        if (userId) {
          const { data: profile } = await sb()
            .from("user_profiles")
            .select("free_balance")
            .eq("id", userId)
            .maybeSingle();

          const freeBalance = profile?.free_balance ?? 0;
          if (freeBalance <= 0) {
            return json({
              error:   "no_credits",
              message: "Your free reading has been drawn. Redeem a reading gift card to continue.",
            }, 402);
          }
          deductPlan = { kind: "free", freeBalance };
        }
      }
    }

    // ── Vrstva A + B + C: tree context, session state, voice scale ────────────
    const treeMode =
      userTier === "standard" ||
      userTier === "premium"  ||
      (userTier === "rune_seeker" && use_credit === true);

    let dynamicContext = "";
    let sessionState: SessionState | null = null;

    if (ENABLE_DYNAMIC_CONTEXT && treeMode && userId && mode !== "extraction") {
      const { data } = await sb()
        .from("tree_state")
        .select("recurring_pattern, emotional_arc, personal_symbols, forbidden_next, session_count, voice_scale, voice_settled")
        .eq("user_id", userId)
        .maybeSingle();

      const treeState = data ?? null;

      // Vrstva A: tree memory
      if (treeState &&
          ((treeState.recurring_pattern as string[] ?? []).length > 0 ||
           (treeState.forbidden_next    as string[] ?? []).length > 0)) {
        dynamicContext += buildTreeContext(treeState);
      }

      // Vrstva B: session state
      sessionState = deriveSessionState(treeState, new Date());
      dynamicContext += buildSessionContext(sessionState);

      // Vrstva C: voice scale
      const voiceScale   = (treeState?.voice_scale   as number  ?? 10);
      const voiceSettled = (treeState?.voice_settled  as boolean ?? false);
      if (voiceScale !== 10 || voiceSettled) {
        dynamicContext += buildVoiceContext(voiceScale, voiceSettled);
      }
    }

    // ── Build system array: base (cacheable) + dynamic context ────────────────
    const baseSystem = system || "";
    const systemParts: Array<{ type: "text"; text: string; cache_control?: { type: "ephemeral" } }> = [];
    if (baseSystem)      systemParts.push({ type: "text", text: baseSystem, cache_control: { type: "ephemeral" } });
    if (dynamicContext)  systemParts.push({ type: "text", text: dynamicContext });

    // ── Call Claude (timeout + retry) ──
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) return json({ error: "API key not configured" }, 500);

    // Primary Opus 4.8; on a sustained overload-class failure (all internal retries
    // exhausted) fall back to Opus 4.7 — near-identical quality, separate capacity — so a
    // peak-load overload returns a reading instead of a 503. A 4xx (genuine bad request)
    // does NOT fall through to the next model.
    const MODELS = ["claude-opus-4-8", "claude-opus-4-7", "claude-sonnet-5"];
    let result: { ok: true; data: any } | { ok: false; status: number; error: string } =
      { ok: false, status: 503, error: "no attempt" };
    for (const model of MODELS) {
      result = await callClaudeWithRetry({
        model,
        max_tokens: cappedMaxTokens,
        system:   systemParts.length > 0 ? systemParts : undefined,
        messages: [{ role: "user", content: prompt }],
      }, anthropicKey);
      if (result.ok) break;
      // Fall back only on a genuine overload (429/5xx), NOT on a timeout (504) — a slow
      // generation would just time out again on the next model and blow the time budget.
      const overloadClass = result.status === 429 || (result.status >= 500 && result.status !== 504);
      if (!overloadClass) break;   // 4xx or timeout = a fallback model won't help
      console.warn(`model ${model} overloaded (${result.status}) — trying fallback`);
    }

    // Upstream failure — NOTHING was deducted, so no credit is lost. The USER only ever
    // sees the graceful "runes are quiet" message — NEVER the real cause (billing / auth /
    // config / overload). The real status is logged server-side only (edge logs), for the
    // keeper to diagnose. Do NOT surface the cause to the client — that is intentional.
    if (!result.ok) {
      console.error("claude call failed:", result.status, result.error);
      return json({
        error:   "overloaded",
        message: "The runes are quiet right now — please try again in a moment.",
      }, 503);
    }

    const data = result.data;
    // A 2xx body that still carries an error object = a genuine bad request; do
    // not retry, do not deduct.
    if (data?.error) return json({ error: data.error.message ?? "Claude error" }, 400);

    const text = data?.content?.[0]?.text ?? "";
    if (!text) {
      return json({
        error:   "empty",
        message: "No reading came through — please try again.",
      }, 503);
    }

    // ── Reading succeeded — NOW deduct the credit/balance ──
    const creditsRemaining = await applyDeduction(deductPlan, userId);

    // ── Persist to the journal SERVER-SIDE, atomic with the deduction ──
    // A charged reading is ALWAYS journaled — even if the app is backgrounded/killed
    // before it could receive the response (charged <=> journaled). The client passes the
    // reading meta; the model text is composed + stored here. Non-fatal: a save failure
    // must never break a reading that already succeeded (logged for the keeper).
    // The client sends a `journal` either for a reading (insert) or an Ask Rúnar follow-up
    // (update) — so the stored record carries EVERYTHING, incl. the Ask Q&A + intention.
    let readingId: string | null = null;
    if (journal && userId) {
      try {
        if (journal.kind === "ask") {
          // Ask Rúnar follow-up — append the Q&A to the parent reading's follow_up array.
          const rid = journal.reading_id;
          if (rid) {
            const { data: cur } = await sb().from("readings")
              .select("follow_up").eq("id", rid).eq("user_id", userId).maybeSingle();
            const arr = Array.isArray(cur?.follow_up) ? cur.follow_up : [];
            arr.push({ q: journal.question ?? "", a: composeReading(text) });
            const { error: fuErr } = await sb().from("readings")
              .update({ follow_up: arr }).eq("id", rid).eq("user_id", userId);
            if (fuErr) console.error("follow_up update failed:", fuErr.message);
          }
        } else {
          const isSpread = journal.kind === "spread";
          const { data: ins, error: journalErr } = await sb().from("readings").insert({
            user_id:      userId,
            rune_name:    journal.rune_name  ?? null,
            rune_glyph:   journal.rune_glyph ?? null,
            lang:         journal.lang       ?? "en",
            short_text:   isSpread ? (journal.rune_display ?? "") : composeReading(text),
            deep_text:    isSpread ? composeReading(text) : "",
            area:         journal.area       ?? null,
            aol:          journal.aol        ?? null,
            seeking:      journal.seeking    ?? null,
            intention:    journal.intention  ?? null,
            question:     journal.question   ?? null,
            life_rune:    journal.life_rune  ?? null,
            prompt_version: journal.prompt_version ?? null,
            address:      journal.address ?? null,
            reading_mode: journal.reading_mode ?? null,
            // Credit truth is server-side (a forgeable client flag is ignored).
            credits_used: deductPlan.kind === "paid",
          }).select("id").maybeSingle();
          // supabase-js resolves DB/constraint errors as { error } — it does NOT throw — check it
          // so a charged-but-not-journaled event is visible (a crafted journal that forces a
          // failure must not skip the charge — that would be a free-reading exploit).
          if (journalErr) console.error("journal insert failed:", journalErr.message);
          else if (ins?.id) readingId = ins.id;
        }
      } catch (e) {
        console.error("journal op threw:", (e as Error).message);
      }
    }

    return json({
      text,
      ...(readingId ? { reading_id: readingId } : {}),
      ...(sessionState ? { session_state: sessionState } : {}),
      ...(deductPlan.kind === "paid"
        ? { credits_remaining: creditsRemaining ?? Math.max(0, creditsBalance - deductPlan.cost) }
        : {}),
    });

  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
