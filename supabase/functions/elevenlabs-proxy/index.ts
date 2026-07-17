// Supabase Edge Function: elevenlabs-proxy
// Real-time TTS — returns base64 audio blob.
// Rate limit: 5 req/min per user (or IP for anonymous)
// Deploy: supabase functions deploy elevenlabs-proxy --project-ref pmitxjvkeovijreepror --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EL_API_KEY     = Deno.env.get("ELEVENLABS_API_KEY");
const EL_VOICE_ID    = "2UI8v2ibbwQTijaYAte1"; // same voice for both langs
const EL_MODEL_EN    = "eleven_multilingual_v2";
const EL_MODEL_IS    = "eleven_v3";             // auto-detects Icelandic from text

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
    if (!EL_API_KEY) return json({ error: "ELEVENLABS_API_KEY not set" }, 500);

    // ── Auth (optional — rate limit key differs) ──
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    if (authHeader) {
      const { data: { user } } = await sb().auth.getUser(authHeader.replace("Bearer ", ""));
      if (user) userId = user.id;
    }

    // ── Rate limit: 5 req/60s per user or IP ──
    const ip    = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rlKey = userId ? `elevenlabs:user:${userId}` : `elevenlabs:ip:${ip}`;
    const { data: allowed } = await sb().rpc("check_rate_limit", {
      p_key:            rlKey,
      p_window_seconds: 60,
      p_max_requests:   5,
    });
    if (!allowed) {
      return json({ error: "rate_limited", message: "Too many requests. Please wait a moment." }, 429);
    }

    // ── Parse body ──
    const { text, lang } = await req.json();
    if (!text) return json({ error: "text is required" }, 400);
    // Text is billed per character — clamp it. Longest legit narration (Yggdrasil) ~1661.
    if (typeof text !== "string" || text.length > 3000) return json({ error: "text too long" }, 400);

    // lang determines model — NEVER trust frontend for voice/model selection
    const resolvedModel = lang === "is" ? EL_MODEL_IS : EL_MODEL_EN;

    // ── Call ElevenLabs ──
    const elRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${EL_VOICE_ID}/stream`,
      {
        method: "POST",
        headers: {
          "xi-api-key":   EL_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: resolvedModel,
          voice_settings: {
            stability:        0.75,
            similarity_boost: 0.85,
            style:            0.35,
            use_speaker_boost: true,
          },
        }),
      },
    );

    if (!elRes.ok) {
      const err = await elRes.text();
      return json({ error: `ElevenLabs ${elRes.status}: ${err}` }, 502);
    }

    // Convert to base64
    const buf   = await elRes.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let bin = "";
    for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
    const b64 = btoa(bin);

    return json({ audio_url: `data:audio/mpeg;base64,${b64}` });

  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
