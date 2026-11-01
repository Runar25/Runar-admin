// Supabase Edge Function: delete-account
// Permanently deletes the authenticated user and all their data.
// What goes with the account: _shared/smaz_ucet.ts (shared with inactive-accounts).
// Deploy: supabase functions deploy delete-account --project-ref pmitxjvkeovijreepror --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.117.3";
import { smazUcet } from "../_shared/smaz_ucet.ts";

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
    // ── Verify user from JWT ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Not authenticated" }, 401);

    // Use service role key — needed for auth.admin.deleteUser()
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: { user }, error: authErr } = await sb.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (authErr || !user) return json({ error: "Invalid session" }, 401);

    // Postup smazání je od 2026-11-01 ve sdíleném _shared/smaz_ucet.ts — tutéž cestou maže i inactive-accounts (opuštěné účty).
    const vysledek = await smazUcet(sb, user.id, user.email ?? null);
    if (!vysledek.ok) return json({ error: vysledek.chyba }, 500);

    return json({ success: true });

  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
