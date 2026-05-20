// Supabase Edge Function: claude-proxy
// Forwards to Claude API. Enforces tier logic:
//   rune_seeker — 5 free/month (frontend tracks), paid credits deducted server-side
//   standard / premium — unlimited, no deduction
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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST")    return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json();
    const { system, prompt, max_tokens = 600, use_credit = false } = body;
    if (!prompt) return json({ error: "Missing prompt" }, 400);

    // ── Auth & tier check ──
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    let userTier = "anonymous";
    let creditsBalance = 0;

    if (authHeader) {
      const sb = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      const { data: { user } } = await sb.auth.getUser(authHeader.replace("Bearer ", ""));
      if (user) {
        userId = user.id;
        const { data: profile } = await sb
          .from("user_profiles")
          .select("tier, credits_balance")
          .eq("id", user.id)
          .maybeSingle();
        userTier       = profile?.tier           ?? "rune_seeker";
        creditsBalance = profile?.credits_balance ?? 0;
      }
    }

    // Normalize legacy tier values
    if (userTier === "free" || userTier === "credits") userTier = "rune_seeker";

    // ── Tier enforcement ──
    if (userTier === "rune_seeker") {
      if (use_credit) {
        // Using a paid credit — deduct server-side
        if (creditsBalance <= 0) {
          return json({ error: "no_credits", message: "No credits remaining. Redeem a gift card or upgrade." }, 402);
        }
        const sb = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        );
        const { data: remaining } = await sb.rpc("use_credit", { p_user_id: userId });
        if (remaining === -1) {
          return json({ error: "no_credits", message: "No credits remaining." }, 402);
        }
        creditsBalance = remaining;
      }
      // else: using free monthly slot — frontend enforces the 5/month limit
    }

    // standard / premium — unlimited, no deduction needed

    // ── Call Claude ──
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) return json({ error: "API key not configured" }, 500);

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:      "claude-sonnet-4-5",
        max_tokens,
        system:     system || "",
        messages:   [{ role: "user", content: prompt }],
      }),
    });

    const data = await claudeRes.json();
    if (data.error) return json({ error: data.error.message }, 400);

    const text = data.content?.[0]?.text ?? "";

    // Return updated credits balance when a credit was used
    return json({
      text,
      ...(use_credit && userTier === "rune_seeker" ? { credits_remaining: creditsBalance } : {}),
    });

  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
