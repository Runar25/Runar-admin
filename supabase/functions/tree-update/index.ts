// Supabase Edge Function: tree-update
// Post-reading background extraction — updates tree_state for the user.
// Called fire-and-forget from frontend after a reading is saved.
// Never blocks the user — errors are swallowed silently.
//
// Tree activation rules:
//   rune_seeker:      only if credits_used = true (paid reading)
//   standard/premium: always
//   visitor/anon:     never
//
// Deploy: supabase functions deploy tree-update --project-ref pmitxjvkeovijreepror --no-verify-jwt

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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST")    return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const { rune_name, short_text, deep_text, area, lang, credits_used } = body;

    if (!short_text || !rune_name) return json({ ok: false, error: "Missing fields" }, 400);

    // ── Auth ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ ok: false, error: "Unauthorized" }, 401);

    const { data: { user } } = await sb().auth.getUser(authHeader.replace("Bearer ", ""));
    if (!user) return json({ ok: false, error: "Unauthorized" }, 401);

    const userId = user.id;

    // ── Tier check ──
    const ADMIN_EMAILS = ["kukula@agndofa.is", "info@agndofa.is"];
    let userTier = "rune_seeker";
    if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      userTier = "premium";
    } else {
      const { data: profile } = await sb()
        .from("user_profiles")
        .select("tier")
        .eq("id", userId)
        .maybeSingle();
      userTier = profile?.tier ?? "rune_seeker";
      if (userTier === "free" || userTier === "credits") userTier = "rune_seeker";
    }

    // Tree activation: RS only if paid credit used, Standard+ always
    const treeActive =
      userTier === "standard" ||
      userTier === "premium" ||
      (userTier === "rune_seeker" && credits_used === true);

    if (!treeActive) return json({ ok: false, reason: "tree_inactive" });

    // ── Load current tree state ──
    const { data: current } = await sb()
      .from("tree_state")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    // ── Build extraction prompt ──
    const currentPatterns = (current?.recurring_pattern ?? []) as string[];
    const currentArc      = (current?.emotional_arc    ?? "opening") as string;

    const extractPrompt =
      "Analyze this rune reading and extract psychological/spiritual patterns.\n" +
      "Return ONLY valid JSON, no text before or after.\n\n" +
      "Reading:\n" + short_text + (deep_text ? "\n\n" + deep_text : "") + "\n\n" +
      "Rune: " + rune_name + (area ? ", area: " + area : "") + "\n" +
      "Language: " + (lang || "en") + "\n\n" +
      "Existing patterns: " + (currentPatterns.length ? currentPatterns.join(", ") : "none") + "\n" +
      "Current arc: " + currentArc + "\n\n" +
      "Return JSON:\n" +
      "{\n" +
      '  "new_pattern": "one phrase (3-6 words) for a recurring theme visible here, or null",\n' +
      '  "emotional_arc": "opening|deepening|integration|threshold",\n' +
      '  "new_symbols": ["1-2 concrete images or symbols that appeared in the text"],\n' +
      '  "forbidden_next": ["1-3 short phrases: what was over-said this reading, avoid repeating"]\n' +
      "}\n\n" +
      "Rules:\n" +
      "- new_pattern: null unless you see something genuinely distinct from existing patterns\n" +
      "- opening = beginning awareness, deepening = going inward, integration = bringing together, threshold = major shift\n" +
      "- forbidden_next: specific images/phrases from THIS reading that would feel repetitive next time";

    // ── Call Claude Haiku (cheap, fast, background) ──
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) return json({ ok: false, error: "API key missing" }, 500);

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-haiku-4-5",
        max_tokens: 200,
        messages:   [{ role: "user", content: extractPrompt }],
      }),
    });

    const claudeData = await claudeRes.json();
    const rawText    = claudeData?.content?.[0]?.text ?? "";

    // ── Parse extraction ──
    let extracted: {
      new_pattern:    string | null;
      emotional_arc:  string;
      new_symbols:    string[];
      forbidden_next: string[];
    };

    try {
      extracted = JSON.parse(rawText);
    } catch {
      // If JSON parse fails, save a minimal update (session_count + last_session_at)
      await sb().from("tree_state").upsert({
        user_id:         userId,
        session_count:   (current?.session_count ?? 0) + 1,
        last_session_at: new Date().toISOString(),
        updated_at:      new Date().toISOString(),
      });
      return json({ ok: true, note: "minimal_update" });
    }

    // ── Merge patterns (max 5, rolling) ──
    const mergedPatterns = [...currentPatterns];
    if (extracted.new_pattern && typeof extracted.new_pattern === "string") {
      mergedPatterns.push(extracted.new_pattern);
      if (mergedPatterns.length > 5) mergedPatterns.shift(); // drop oldest
    }

    // ── Merge symbols (increment counts) ──
    const mergedSymbols: Record<string, number> = { ...(current?.personal_symbols ?? {}) };
    for (const sym of (extracted.new_symbols ?? [])) {
      if (typeof sym === "string" && sym.length > 0) {
        mergedSymbols[sym] = (mergedSymbols[sym] ?? 0) + 1;
      }
    }

    // ── Validate arc ──
    const validArcs = ["opening", "deepening", "integration", "threshold"];
    const arc = validArcs.includes(extracted.emotional_arc)
      ? extracted.emotional_arc
      : (current?.emotional_arc ?? "opening");

    // ── Forbidden: replace entirely (max 3) ──
    const forbidden = (extracted.forbidden_next ?? [])
      .filter((f: unknown) => typeof f === "string")
      .slice(0, 3);

    // ── Upsert tree_state ──
    await sb().from("tree_state").upsert({
      user_id:           userId,
      recurring_pattern: mergedPatterns,
      emotional_arc:     arc,
      personal_symbols:  mergedSymbols,
      forbidden_next:    forbidden,
      voice_scale:       current?.voice_scale ?? 10,
      session_count:     (current?.session_count ?? 0) + 1,
      last_session_at:   new Date().toISOString(),
      updated_at:        new Date().toISOString(),
    });

    return json({ ok: true });

  } catch (e) {
    // Fire-and-forget: never surface errors to user — just log and return ok
    console.error("tree-update error:", (e as Error).message);
    return json({ ok: false, error: (e as Error).message }, 500);
  }
});
