// Supabase Edge Function: list-readings
// Admin-only reader for public.readings. readings is own-rows by RLS (a user reads
// only their own), so the anon key cannot read across users — this function uses the
// service-role key internally and gates on the caller's JWT email being an admin.
// Powers the shrine "Readings" panel: quality review of ALL readings (incl. testers)
// without screenshots. Read-only (no writes) — keeps readings RLS untouched.
// Deploy: supabase functions deploy list-readings --project-ref pmitxjvkeovijreepror --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_EMAILS = ["kukula@agndofa.is", "info@agndofa.is"];

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

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // ── Admin gate: verify caller JWT + email allowlist ──
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Not authenticated" }, 401);
  const { data: { user }, error: authErr } = await sb.auth.getUser(authHeader.replace("Bearer ", ""));
  if (authErr || !user) return json({ error: "Invalid session" }, 401);
  if (!user.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) return json({ error: "Forbidden" }, 403);

  let body: any = {};
  try { body = await req.json(); } catch { /* default to list */ }

  try {
    const lang  = body.lang;
    const rune  = body.rune;
    const limit = Math.min(Math.max(Number(body.limit) || 100, 1), 500);

    let q = sb.from("readings")
      .select("id,user_id,rune_name,rune_glyph,lang,short_text,deep_text,area,seeking,question,life_rune,credits_used,drawn_at")
      .order("drawn_at", { ascending: false })
      .limit(limit);
    if (lang && lang !== "all") q = q.eq("lang", lang);
    if (rune) q = q.eq("rune_name", rune);
    const { data, error } = await q;
    if (error) return json({ error: error.message }, 500);

    const rows = data || [];
    // Enrich with the reader's name + tier (user_profiles) so the admin can tell testers
    // apart. user_profiles has no email column, so name/tier is the best label available.
    const ids = [...new Set(rows.map((r: any) => r.user_id).filter(Boolean))];
    const who: Record<string, { name: string | null; tier: string | null }> = {};
    if (ids.length) {
      const { data: profs } = await sb.from("user_profiles").select("id,name,tier").in("id", ids);
      for (const p of (profs || [])) who[p.id] = { name: p.name ?? null, tier: p.tier ?? null };
    }
    const enriched = rows.map((r: any) => ({
      ...r,
      user_name: who[r.user_id]?.name ?? null,
      user_tier: who[r.user_id]?.tier ?? null,
    }));
    return json({ readings: enriched });

  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
