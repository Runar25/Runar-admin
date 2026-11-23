// Supabase Edge Function: delete-account
// Closes the authenticated user's account: records a deletion request and signs the account out everywhere. The nightly
// inactive-accounts job deletes it after ZADOST_DNI days (_shared/necinne_ucty.ts) through _shared/smaz_ucet.ts; signing in before
// then cancels it. Soft delete since 2026-11-23 (DECISIONS 2026-10-11 (53)); until then this function deleted at once.
// Deploy: supabase functions deploy delete-account --project-ref pmitxjvkeovijreepror --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.117.3";
import { SERVER_KLIC } from "../_shared/klic.ts";   // serverový klíč Supabase z jednoho místa (2026-11-01, krok 9 plánu)
import { ZADOST_DNI } from "../_shared/necinne_ucty.ts";   // lhůta měkkého smazání (2026-11-23)

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
      SERVER_KLIC,
    );

    const { data: { user }, error: authErr } = await sb.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (authErr || !user) return json({ error: "Invalid session" }, 401);

    // Měkké smazání (2026-11-23): žádost (čas = teď; opakovaná žádost lhůtu začne znovu) a odhlášení všude — další relace pak znamená
    // nové přihlášení, a to smazání zruší. Smaže až noční inactive-accounts přes _shared/smaz_ucet.ts (jediná cesta smazání).
    const ted = new Date();
    const { error: rqErr } = await sb.from("deletion_requests").upsert({ user_id: user.id, requested_at: ted.toISOString() });
    if (rqErr) return json({ error: "Failed to record the request: " + rqErr.message }, 500);
    const { error: soErr } = await sb.auth.admin.signOut(authHeader.replace("Bearer ", ""), "global");
    if (soErr) console.error("delete-account: sign-out failed: " + soErr.message);   // žádost platí; appka se odhlásí sama

    return json({ success: true, delete_at: new Date(ted.getTime() + ZADOST_DNI * 86400000).toISOString() });

  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
