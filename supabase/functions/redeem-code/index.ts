// Supabase Edge Function: redeem-code
// Verifies a gift code, adds credits to user account, marks code as used.
// Deploy: supabase functions deploy redeem-code --project-ref pmitxjvkeovijreepror --no-verify-jwt

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
    const { code } = await req.json();
    if (!code?.trim()) return json({ error: "Missing code" }, 400);

    // ── Verify user from JWT ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Not authenticated" }, 401);

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: { user }, error: authErr } = await sb.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (authErr || !user) return json({ error: "Invalid session" }, 401);

    // ── Find code (code is the PK) ──
    const normalized = code.trim().toUpperCase();
    const { data: gift, error: fetchErr } = await sb
      .from("gift_codes")
      .select("code, credits, rune_name, used_by")
      .eq("code", normalized)
      .maybeSingle();

    if (fetchErr || !gift) return json({ error: "Code not found" }, 404);
    if (gift.used_by)       return json({ error: "Code already used" }, 409);

    // ── Atomic: mark as used (race-condition guard via .is null filter) ──
    const { data: markedRows, error: markErr } = await sb
      .from("gift_codes")
      .update({ used_by: user.id, used_at: new Date().toISOString() })
      .eq("code", normalized)
      .is("used_by", null)
      .select();   // returns updated rows — empty array = someone else won the race

    if (markErr) return json({ error: "Failed to redeem: " + markErr.message }, 500);
    if (!markedRows || markedRows.length === 0) return json({ error: "Code already redeemed" }, 409);

    // ── Add credits atomically via RPC ──
    const { data: newBalance, error: creditErr } = await sb.rpc("add_credits", {
      p_user_id: user.id,
      p_amount:  gift.credits,
    });
    if (creditErr) return json({ error: "Failed to add credits: " + creditErr.message }, 500);

    // ── Upgrade tier to 'credits' if still on free/trial ──
    await sb.from("user_profiles")
      .update({ tier: "credits" })
      .eq("id", user.id)
      .in("tier", ["free", "free_trial"]);

    return json({
      success:       true,
      credits_added: gift.credits,
      new_balance:   newBalance,
      rune_name:     gift.rune_name ?? null,
    });

  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
