// Supabase Edge Function: voice-usage
// ADMIN-ONLY: živý stav předplatného ElevenLabs (znaky spotřebované v aktuálním období, limit, datum resetu, tarif)
// a zároveň ho uloží jako snímek (voice_quota_snapshots, source 'admin'). Handoff CODE-read 2026-09-24 bod 1 — k rozhodnutí,
// kdy přejít na vyšší tarif. Nic neúčtuje, nic nemění kromě zápisu snímku. Tabulky: sql/2026-09-25_voice_usage.sql.
// 2026-09-25 (KUKY „ano ukaž živý stav"): vrací i spotřebu z naší evidence (voice_usage) za AKTUÁLNÍ období EL podle
// skupiny (admin / tester / uživatel) a modelu + posledních 10 snímků — pro záložku VOICE ve shrine (runar-voice-admin.js).
// Skupiny se počítají tady, při dotazu (jako stats.js) — uložené by zastaraly (§20).
// Deploy: supabase functions deploy voice-usage --project-ref pmitxjvkeovijreepror --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.117.3";
import { fetchQuota, saveQuota, EL_DOBITI_KREDITY, EL_TARIF_KREDITY } from "../_shared/voice_usage.ts";
import { kredityHlasu } from "../_shared/el_voice.ts";

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
  const nextReset = reset !== null ? new Date(reset * 1000) : null;

  // Začátek aktuálního období EL = reset o měsíc zpět (EL nuluje čítač měsíčně). Bez data resetu posledních 30 dní.
  const since = nextReset ? new Date(nextReset) : new Date(Date.now() - 30 * 24 * 3600 * 1000);
  if (nextReset) since.setUTCMonth(since.getUTCMonth() - 1);

  // Kredity (2026-10-11, DECISIONS (43), (48)): počítadlo EL je v KREDITECH. Rozpad limitu na tarif / převod / dobití a hladina brzdy
  // (brzdaHlasu v _shared/voice_usage.ts: limit − dobití). Owner: „potřebuju to hlídat!“
  const cc = typeof raw.character_count === "number" ? raw.character_count : null;
  const cl = typeof raw.character_limit === "number" ? raw.character_limit : null;
  const tarif = typeof raw.tier === "string" ? (EL_TARIF_KREDITY[raw.tier.toLowerCase()] ?? null) : null;
  const hladina = cl !== null ? cl - EL_DOBITI_KREDITY : null;
  const credits = {
    used: cc, limit: cl, plan: tarif, topup: EL_DOBITI_KREDITY,
    rollover: cl !== null && tarif !== null ? Math.max(0, cl - tarif - EL_DOBITI_KREDITY) : null,
    brake_at: hladina, left: hladina !== null && cc !== null ? hladina - cc : null,
  };

  // Naše evidence za období, rozdělená podle skupiny a modelu, ve znacích i kreditech. Chyba evidence nesmí shodit živý stav z EL.
  // Skupiny (2026-10-11, owner: „počítáš jen pro těch 5 testerů, jelikož ty další 4 účty jsou naše! moje a Sigrún“): tester = příznak
  // tester A e-mail na seznamu testerů (allowed_emails, role tester); tým = příznak tester mimo ten seznam (účty ownera a Sigrún na test
  // slabšího Rune Seekera); admin = ADMIN_EMAILS. Do té doby se účty týmu počítaly mezi testery.
  let byGroup: Record<string, { chars: number; credits: number; n: number }> = {};
  let byModel: Record<string, { chars: number; credits: number; n: number }> = {};
  let logged = { chars: 0, credits: 0, n: 0 };
  try {
    const { data: rows } = await sb.from("voice_usage").select("user_id, chars, model").gte("created_at", since.toISOString());
    const ids = [...new Set((rows ?? []).map((r: any) => r.user_id).filter(Boolean))];
    const testers = new Set<string>();
    if (ids.length) {
      const { data: prof } = await sb.from("user_profiles").select("id, is_tester").in("id", ids);
      (prof ?? []).forEach((p: any) => { if (p.is_tester) testers.add(p.id); });
    }
    const { data: al } = await sb.from("allowed_emails").select("email, role");
    const naSeznamu = new Set((al ?? []).filter((a: any) => a.role === "tester").map((a: any) => String(a.email || "").toLowerCase()));
    const admins = new Set<string>(), email = new Map<string, string>();
    const { data: lu } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
    (lu?.users ?? []).forEach((u: any) => {
      const e = String(u.email || "").toLowerCase();
      email.set(u.id, e);
      if (e && ADMIN_EMAILS.includes(e)) admins.add(u.id);
    });
    for (const r of (rows ?? []) as any[]) {
      const g = !r.user_id ? "unknown" : admins.has(r.user_id) ? "admin"
        : testers.has(r.user_id) ? (naSeznamu.has(email.get(r.user_id) || "") ? "tester" : "team") : "user";
      const k = kredityHlasu(r.model, r.chars);
      const G = (byGroup[g] ??= { chars: 0, credits: 0, n: 0 }); G.chars += r.chars; G.credits += k; G.n++;
      const M = (byModel[r.model] ??= { chars: 0, credits: 0, n: 0 }); M.chars += r.chars; M.credits += k; M.n++;
      logged.chars += r.chars; logged.credits += k; logged.n++;
    }
  } catch (e) {
    console.error("voice-usage aggregate:", (e as Error).message);
  }
  const { data: snaps } = await sb.from("voice_quota_snapshots")
    .select("taken_at, source, character_count, character_limit").order("taken_at", { ascending: false }).limit(14);

  return json({
    tier: raw.tier ?? null, status: raw.status ?? null,
    character_count: raw.character_count ?? null, character_limit: raw.character_limit ?? null,
    credits,
    next_reset_at: nextReset ? nextReset.toISOString() : null,
    period_since: since.toISOString(),
    logged, by_group: byGroup, by_model: byModel,
    snapshots: snaps ?? [],
  });
});
