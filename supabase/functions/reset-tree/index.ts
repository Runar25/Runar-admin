// Supabase Edge Function: reset-tree
// Resetuje strom života volajícího účtu (životní runa + datum narození + jméno
// stromu + příznaky založení), aby šel celý rituál otestovat znovu.
//
// GATE: JEN pro tester účty (`user_profiles.is_tester = true`). Reset je testovací
// schopnost — nezavádí se admin e-mail seznam (ten žije v isAdmin() a duplikovat
// ho sem by bylo §20). Kdo chce resetovat, je tester; admin, který testuje, si
// is_tester nastaví.
//
// Běží jako service_role, takže projde přes trigger trg_life_rune_immutable
// (ten blokuje jen 'authenticated'/'anon' = prohlížeč).
//
// Deploy: supabase functions deploy reset-tree --project-ref pmitxjvkeovijreepror --no-verify-jwt

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

    // ── GATE: jen tester účet ──
    const { data: prof, error: profErr } = await sb
      .from("user_profiles").select("is_tester").eq("id", user.id).maybeSingle();
    if (profErr) return json({ error: "profile read failed" }, 500);
    if (!prof?.is_tester) return json({ error: "reset is for tester accounts only" }, 403);

    // ── Reset: životní runa, DOB, jméno stromu, příznaky založení ──
    // Čtení v `readings` se NEMAŽOU — reset ruší založení, ne historii.
    const { error: updErr } = await sb.from("user_profiles").update({
      life_rune_number:    null,
      life_rune_text:      null,
      life_rune_lang:      null,
      dob_day:             null,
      dob_month:           null,
      dob_year:            null,
      tree_name:           null,
      tree_founded_at:     null,
      founding_reading_id: null,
    }).eq("id", user.id);
    if (updErr) return json({ error: "reset failed: " + updErr.message }, 500);

    return json({ success: true });

  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
