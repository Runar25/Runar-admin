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
      // 2026-10-05: + prompt_draws (obraz, význam, úhel, podoba oblasti) a usage (model) — databáze čtení v shrine.
      .select("id,user_id,rune_name,rune_glyph,lang,short_text,deep_text,area,aol,seeking,intention,question,life_rune,follow_up,prompt_version,address,reading_mode,credits_used,drawn_at,prompt_draws,usage")
      .order("drawn_at", { ascending: false })
      .limit(limit);
    if (lang && lang !== "all") q = q.eq("lang", lang);
    if (rune) q = q.eq("rune_name", rune);
    const { data, error } = await q;
    if (error) return json({ error: error.message }, 500);

    const rows = data || [];
    // Enrich with the reader's name/tier + tester/opt-out flags (user_profiles has no email).
    const ids = [...new Set(rows.map((r: any) => r.user_id).filter(Boolean))];
    const who: Record<string, { name: string | null; tier: string | null; is_tester: boolean; opt_out: boolean }> = {};
    if (ids.length) {
      const { data: profs } = await sb.from("user_profiles")
        .select("id,name,tier,is_tester,analytics_opt_out").in("id", ids);
      for (const p of (profs || [])) who[p.id] = {
        name: p.name ?? null, tier: p.tier ?? null,
        is_tester: !!p.is_tester, opt_out: !!p.analytics_opt_out,
      };
    }
    const testersOnly = body.testers_only === true;
    const enriched = rows
      // GDPR: never surface readings of users who opted out of quality analysis.
      .filter((r: any) => !(who[r.user_id]?.opt_out))
      .filter((r: any) => !testersOnly || who[r.user_id]?.is_tester)
      .map((r: any) => ({
        ...r,
        user_name: who[r.user_id]?.name ?? null,
        user_tier: who[r.user_id]?.tier ?? null,
        is_tester: who[r.user_id]?.is_tester ?? false,
      }));
    // Note: opt-out/testers filters run after the row limit, so a filtered view can show
    // fewer than `limit` rows — acceptable for an admin tool (opt-out is rare).
    // 2026-10-05 (KUKY „databáze čtení … kde bylo co dobře použito“): ke čtení jeho reporty a ✦ Keep. runar-reporter.js píše do
    // bug_reports.screen_context „… reading <uuid>“ — mapuje se podle toho. Reporty jsou doplněk: když dotaz selže, čtení se
    // vrátí bez nich (prohlížeč nesmí spadnout kvůli poznámkám).
    const byId: Record<string, unknown[]> = {};
    if (enriched.length) {
      try {
        const od = enriched[enriched.length - 1].drawn_at;
        const { data: reps } = await sb.from("bug_reports")
          .select("created_at,type,message,flagged_text,screen_context")
          .ilike("screen_context", "%reading %")
          .gte("created_at", od)
          .order("created_at", { ascending: true })
          .limit(3000);
        for (const rp of (reps || [])) {
          const m = String(rp.screen_context || "").match(/reading ([0-9a-f-]{36})/);
          if (!m) continue;
          (byId[m[1]] = byId[m[1]] || []).push({ at: rp.created_at, type: rp.type, message: rp.message ?? "",
            flagged: String(rp.flagged_text ?? "").slice(0, 600) });
        }
      } catch (_) { /* bez reportů */ }
    }
    return json({ readings: enriched.map((r: any) => ({ ...r, reports: byId[r.id] || [] })) });

  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
