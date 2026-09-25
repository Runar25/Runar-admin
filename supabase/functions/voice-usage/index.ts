// Supabase Edge Function: voice-usage
// ADMIN-ONLY: živý stav předplatného ElevenLabs (znaky spotřebované v aktuálním období, limit, datum resetu, tarif)
// a zároveň ho uloží jako snímek (voice_quota_snapshots, source 'admin'). Handoff CODE-read 2026-09-24 bod 1 — k rozhodnutí,
// kdy přejít na vyšší tarif. Nic neúčtuje, nic nemění kromě zápisu snímku. Tabulky: sql/2026-09-25_voice_usage.sql.
// Deploy: supabase functions deploy voice-usage --project-ref pmitxjvkeovijreepror --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { fetchQuota, saveQuota } from "../_shared/voice_usage.ts";

// Kopie seznamu adminů (další: v2/runar-config.js a ostatní edge funkce). Shodu hlídá smoke ㉪ (scripts/verify_admin_emails.js).
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

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Not authenticated" }, 401);
  const { data: { user }, error: authErr } = await sb.auth.getUser(authHeader.replace("Bearer ", ""));
  if (authErr || !user) return json({ error: "Invalid session" }, 401);
  if (!user.email || !ADMIN_EMAILS.includes(user.email.toLowerCase())) return json({ error: "Forbidden" }, 403);

  const key = Deno.env.get("ELEVENLABS_API_KEY");
  if (!key) return json({ error: "no_key" }, 503);
  const raw = await fetchQuota(key);
  if (!raw) return json({ error: "elevenlabs", message: "subscription request failed" }, 502);
  await saveQuota(sb, raw, "admin");
  const reset = typeof raw.next_character_count_reset_unix === "number" ? raw.next_character_count_reset_unix : null;
  return json({
    tier: raw.tier ?? null, status: raw.status ?? null,
    character_count: raw.character_count ?? null, character_limit: raw.character_limit ?? null,
    next_reset_at: reset !== null ? new Date(reset * 1000).toISOString() : null,
  });
});
