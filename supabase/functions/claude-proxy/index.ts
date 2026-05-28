// Supabase Edge Function: claude-proxy
// Forwards to Claude API. Enforces tier logic:
//   rune_seeker — weekly drip: 3 free in first 7 days, then 1/week; monthly cap 5 (credits_used=false)
//                paid credits deducted server-side; ceremonial mode (The Gathering) bypasses all limits
//   standard / premium — unlimited, no deduction
// Rate limit: 10 requests / 60s per user (or IP for anonymous)
// Tree context: injected into system prompt for tree-active readings (Vrstva A)
// Session state: derived from tree + time, shapes reading tone (Vrstva B)
// Voice scale: 0-20 user preference injected as tonal instruction (Vrstva C)
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

function sb() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
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

// ─────────────────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST")    return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const { system, prompt, max_tokens = 600, use_credit = false, mode = "" } = body;
    if (!prompt) return json({ error: "Missing prompt" }, 400);

    // ── Auth & tier check ──
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    let userTier = "anonymous";
    let creditsBalance = 0;

    const ADMIN_EMAILS = ["kukula@agndofa.is", "info@agndofa.is"];

    if (authHeader) {
      const { data: { user } } = await sb().auth.getUser(authHeader.replace("Bearer ", ""));
      if (user) {
        userId = user.id;
        if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
          userTier = "premium";
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

    // ── Tier enforcement ──
    if (userTier === "rune_seeker") {
      if (use_credit) {
        if (creditsBalance <= 0) {
          return json({ error: "no_credits", message: "No credits remaining. Redeem a gift card or upgrade." }, 402);
        }
        const { data: remaining } = await sb().rpc("use_credit", { p_user_id: userId });
        if (remaining === -1) {
          return json({ error: "no_credits", message: "No credits remaining." }, 402);
        }
        creditsBalance = remaining;
      } else if (mode === "ceremonial") {
        // The Gathering — bypass all limits
      } else {
        if (userId) {
          const now = new Date();
          const dow       = (now.getUTCDay() + 6) % 7;
          const weekStart = new Date(now);
          weekStart.setUTCDate(now.getUTCDate() - dow);
          weekStart.setUTCHours(0, 0, 0, 0);

          const { count: weekCount } = await sb()
            .from("readings")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("credits_used", false)
            .gte("drawn_at", weekStart.toISOString());

          const { data: profileAge } = await sb()
            .from("user_profiles")
            .select("created_at")
            .eq("id", userId)
            .maybeSingle();
          const createdAt      = new Date(profileAge?.created_at ?? now);
          const accountAgeDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
          const weeklyLimit    = accountAgeDays < 7 ? 3 : 1;

          if ((weekCount ?? 0) >= weeklyLimit) {
            return json({
              error: "weekly_limit",
              message: "The stones rest until Monday. Use a reading gift card to continue.",
            }, 402);
          }

          const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
          const { count: monthCount } = await sb()
            .from("readings")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("credits_used", false)
            .gte("drawn_at", monthStart);

          if ((monthCount ?? 0) >= 5) {
            return json({
              error: "monthly_limit",
              message: "Monthly free readings exhausted. Use a reading gift card or upgrade.",
            }, 402);
          }
        }
      }
    }

    // ── Vrstva A + B + C: tree context, session state, voice scale ────────────
    const treeMode =
      userTier === "standard" ||
      userTier === "premium"  ||
      (userTier === "rune_seeker" && use_credit === true);

    let systemWithContext = system || "";
    let sessionState: SessionState | null = null;

    if (treeMode && userId && mode !== "extraction") {
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
        systemWithContext = systemWithContext + buildTreeContext(treeState);
      }

      // Vrstva B: session state
      sessionState = deriveSessionState(treeState, new Date());
      systemWithContext = systemWithContext + buildSessionContext(sessionState);

      // Vrstva C: voice scale
      const voiceScale   = (treeState?.voice_scale   as number  ?? 10);
      const voiceSettled = (treeState?.voice_settled  as boolean ?? false);
      if (voiceScale !== 10 || voiceSettled) {
        systemWithContext = systemWithContext + buildVoiceContext(voiceScale, voiceSettled);
      }
    }

    // ── Call Claude ──
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) return json({ error: "API key not configured" }, 500);

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:    "claude-sonnet-4-5",
        max_tokens,
        system:   systemWithContext,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await claudeRes.json();
    if (data.error) return json({ error: data.error.message }, 400);

    const text = data.content?.[0]?.text ?? "";

    return json({
      text,
      ...(sessionState ? { session_state: sessionState } : {}),
      ...(use_credit && userTier === "rune_seeker" ? { credits_remaining: creditsBalance } : {}),
    });

  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
