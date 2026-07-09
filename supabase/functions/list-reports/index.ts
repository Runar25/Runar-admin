// Supabase Edge Function: list-reports
// Admin-only reader/updater for public.bug_reports. That table is insert-only by
// RLS (no SELECT policy), so the anon key cannot read it — this function uses the
// service-role key internally and gates on the caller's JWT email being an admin.
// Powers the shrine "Reports" panel. Keeps bug_reports insert-only (no RLS change).
// Deploy: supabase functions deploy list-reports --project-ref pmitxjvkeovijreepror --no-verify-jwt

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
  const action = body.action || "list";

  try {
    if (action === "set_status") {
      const id = body.id;
      const status = body.status;
      if (!id || !["new", "triaged", "fixed"].includes(status)) return json({ error: "Bad params" }, 400);
      const { error } = await sb.from("bug_reports").update({ status }).eq("id", id);
      if (error) return json({ error: error.message }, 500);
      return json({ success: true });
    }

    // action === "list"
    let q = sb.from("bug_reports")
      .select("id,tester,type,message,suggested_replacement,flagged_text,flagged_source,i18n_key,screen_context,locale,app_version,reported_at,synced_at,status")
      .order("synced_at", { ascending: false })
      .limit(300);
    if (body.status && body.status !== "all") q = q.eq("status", body.status);
    const { data, error } = await q;
    if (error) return json({ error: error.message }, 500);
    return json({ reports: data || [] });

  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
