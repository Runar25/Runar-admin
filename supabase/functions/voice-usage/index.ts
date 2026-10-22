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
import { fetchQuota, saveQuota, EL_DOBITI_KREDITY, EL_TARIF_KREDITY, EL_KREDIT_USD } from "../_shared/voice_usage.ts";
import { kredityHlasu, EL_VOICE_ID } from "../_shared/el_voice.ts";
import { ADMIN_EMAILS } from "../_shared/admini.ts";   // seznam adminů na jednom místě (2026-10-22, DECISIONS 2026-10-22 (5))

// Kopie seznamu adminů (další: v2/runar-config.js a ostatní edge funkce). Shodu hlídá smoke ㉪ (scripts/verify_admin_emails.js).

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
  let body: any = {};
  try { body = await req.json(); } catch { /* prázdné tělo = jen stav EL (záložka VOICE) */ }

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
  // ── Účty pro záložku TESTERS (2026-10-11, owner: „každý účet bude pod svým emailem, ať vím o koho jde a kolik udělal čtení. a pod tím
  // součet… začneme už dneškem“). Jen s {accounts:true}. Testeři = allowed_emails role tester (i nezaregistrovaní); tým = příznak tester
  // mimo seznam (účty ownera a Sigrún na test slabšího Rune Seekera) a admini (ADMIN_EMAILS). Čtení od `since` podle typu, Asky, hlasy
  // a kredity; z čtení a Asků jde ven jen `usage` (cenu modelu spočítá shrine týmž readingCostUsd jako deník — ceník je v klientském
  // configu, §20), texty NE. Den = UTC (Island).
  let accounts: any = null;
  if (body?.accounts === true) {
    try {
      const sinceDay = typeof body.since === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.since) ? body.since : "2026-10-11";
      const today = new Date().toISOString().slice(0, 10);
      const { data: lu2 } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const users = (lu2?.users ?? []).map((u: any) => ({ id: u.id as string, email: String(u.email || "").toLowerCase() }));
      const { data: al2 } = await sb.from("allowed_emails").select("email, role");
      const testerEmails = (al2 ?? []).filter((a: any) => a.role === "tester").map((a: any) => String(a.email || "").toLowerCase());
      const { data: tp } = await sb.from("user_profiles").select("id").eq("is_tester", true);
      const flag = new Set((tp ?? []).map((p: any) => p.id));
      const idPodleEmailu = new Map(users.map((u) => [u.email, u.id]));
      const ucty: any[] = testerEmails.map((e: string) => ({ email: e, group: "tester", id: idPodleEmailu.get(e) ?? null }));
      for (const u of users) {
        if (ADMIN_EMAILS.includes(u.email)) ucty.push({ email: u.email, group: "admin", id: u.id });
        else if (flag.has(u.id) && !testerEmails.includes(u.email)) ucty.push({ email: u.email, group: "team", id: u.id });
      }
      const podleId = new Map<string, any>();
      const list = ucty.map((a) => {
        const o = { email: a.email, group: a.group, registered: !!a.id,
          today: { readings: 0, voices: 0 },
          total: { readings: 0, types: {} as Record<string, number>, asks: 0, voices: 0, credits: 0, usage: [] as any[] } };
        if (a.id) podleId.set(a.id, o);
        return o;
      });
      const ids = [...podleId.keys()];
      const TYP: Record<string, string> = { NORNS: "Norns", KRIZ: "Cross", HORSESHOE: "Horseshoe", YGGDRASIL: "Yggdrasil" };
      if (ids.length) {
        const { data: rd } = await sb.from("readings").select("user_id, drawn_at, rune_name, usage, follow_up")
          .gte("drawn_at", sinceDay + "T00:00:00Z").in("user_id", ids).limit(20000);
        for (const r of (rd ?? []) as any[]) {
          const a = podleId.get(r.user_id); if (!a) continue;
          const typ = TYP[r.rune_name] || "Single";
          a.total.readings++; a.total.types[typ] = (a.total.types[typ] || 0) + 1;
          if (String(r.drawn_at).slice(0, 10) === today) a.today.readings++;
          if (r.usage && r.usage.model) a.total.usage.push(r.usage);
          for (const f of (Array.isArray(r.follow_up) ? r.follow_up : [])) {
            a.total.asks++;
            if (f && f.usage && f.usage.model) a.total.usage.push(f.usage);
          }
        }
        const { data: vu } = await sb.from("voice_usage").select("user_id, created_at, chars, model")
          .gte("created_at", sinceDay + "T00:00:00Z").in("user_id", ids).eq("source", "dynamic").limit(20000);
        for (const v of (vu ?? []) as any[]) {
          const a = podleId.get(v.user_id); if (!a) continue;
          a.total.voices++; a.total.credits += kredityHlasu(v.model, v.chars);
          if (String(v.created_at).slice(0, 10) === today) a.today.voices++;
        }
      }
      accounts = { since: sinceDay, today, credit_usd: EL_KREDIT_USD, list };
    } catch (e) {
      console.error("voice-usage accounts:", (e as Error).message);
    }
  }

  // ── Historie ElevenLabs (2026-10-13, owner „ano udělej a nasaď“): kolik položek v historii našeho účtu je, kolik z nich našeho hlasu
  // a kdy přibyla nejnovější. Owner ve webovém rozhraní ElevenLabs hlasy nenašel a jestli tam rozhraní hlasy z API ukazuje, dokumentace
  // neříká — rozhodne jen výpis naším klíčem. Zároveň ukáže, jestli mazání po vygenerování (elevenlabs-proxy, DECISIONS 2026-10-13 (6))
  // zabírá: po přečtení čtení nahlas nesmí počet našeho hlasu vzrůst. Jen čtení, nic nemaže. Chyba nesmí shodit zbytek záložky.
  let history: any = null;
  try {
    const hr = await fetch("https://api.elevenlabs.io/v1/history?page_size=1000", { headers: { "xi-api-key": key } });
    if (hr.ok) {
      const hd: any = await hr.json();
      const items: any[] = Array.isArray(hd?.history) ? hd.history : [];
      const dates = items.map((h) => h?.date_unix).filter((x) => typeof x === "number");
      history = {
        count: items.length, more: !!hd?.has_more,
        ours: items.filter((h) => h?.voice_id === EL_VOICE_ID).length,
        newest: dates.length ? new Date(Math.max(...dates) * 1000).toISOString() : null,
        oldest: dates.length ? new Date(Math.min(...dates) * 1000).toISOString() : null,
      };
    } else history = { error: hr.status };
  } catch (e) {
    console.error("voice-usage history:", (e as Error).message);
    history = { error: "request_failed" };
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
    accounts,
    history,
  });
});
