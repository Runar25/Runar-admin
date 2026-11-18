// rune-day-push — ranní upozornění na runu dne (2026-11-18; owner 2026-11-17 „11. ok udělej pro android, apple backlog“).
// Volá ji pg_cron v 09:00 UTC (sql/2026-11-18_push_odbery.sql) s x-ops-secret (OPS_CRON_SECRET, jako ops-watch); nasazuje se
// s --no-verify-jwt. Pošle upozornění BEZ obsahu každému odběru, jehož člověk dnes (islandský den = UTC, jako claude-proxy) runu
// ještě netáhl; text drží telefon (_shared/web_push.ts proč). Mrtvé odběry (404/410) smaže a každý běh zapíše do ops_events „purge“
// job push_subs (registr MAZANI) — i nulu, takže ops-watch pozná i běh, který se vůbec nekonal.
//   {}                 ostrý běh (cron)          · {"mode":"dry"}  zkouška: nic neposílá, jen počty (cron tajemství)
//   {"mode":"me"}      admin z appky (JWT): pošle hned na JEHO odběry, bez ohledu na dnešní tah — zkouška na vlastním telefonu;
//                      nic nemaže a nezapisuje do provozu (mazání hlásí jen pravidelný běh).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.117.3";
import { SERVER_KLIC } from "../_shared/klic.ts";
import { jeAdmin } from "../_shared/admini.ts";
import { komuPoslat, vapidHlavicka, vapidKlic, vysledekPush } from "../_shared/web_push.ts";
import type { Odber } from "../_shared/web_push.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
function json(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
}
function stejne(a: string, b: string): boolean {
  if (!a || a.length !== b.length) return false;
  let x = 0;
  for (let i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return x === 0;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let body: { mode?: string } = {};
  try { body = await req.json(); } catch { /* prázdné tělo = ostrý běh */ }
  const db = createClient(Deno.env.get("SUPABASE_URL")!, SERVER_KLIC, { auth: { persistSession: false } });

  // Kdo volá: cron (tajemství) smí ostrý běh a zkoušku; admin s JWT jen „me“.
  let adminId = "";
  if (body.mode === "me") {
    const tok = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { data: { user } } = await db.auth.getUser(tok);
    if (!user || !jeAdmin(user.email)) return json({ error: "unauthorized" }, 401);
    adminId = user.id;
  } else if (!stejne(req.headers.get("x-ops-secret") ?? "", Deno.env.get("OPS_CRON_SECRET") ?? "")) {
    return json({ error: "unauthorized" }, 401);
  }
  const zkouska = body.mode === "dry";
  const pub = Deno.env.get("VAPID_PUBLIC_KEY") ?? "", priv = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
  const subject = Deno.env.get("VAPID_SUBJECT") ?? "";
  const v = { odberu: 0, poslano: 0, uzTahli: 0, smazano: 0, chyb: 0, items: [] as string[], chyby: [] as string[] };
  try {
    if (!pub || !priv || !subject) throw new Error("VAPID secrets missing");
    const den = new Date().toISOString().slice(0, 10);   // islandský den = UTC (claude-proxy denDnes)
    let q = db.from("push_subscriptions").select("endpoint, user_id");
    if (adminId) q = q.eq("user_id", adminId);
    const { data: odbery, error: oErr } = await q;
    if (oErr) throw new Error("push_subscriptions: " + oErr.message);
    v.odberu = (odbery ?? []).length;
    const tahli = new Set<string>();
    if (!adminId && v.odberu) {
      const ids = [...new Set((odbery ?? []).map((o: Odber) => o.user_id))];
      const { data: dr, error: dErr } = await db.from("rune_day").select("user_id").eq("den", den).in("user_id", ids);
      if (dErr) throw new Error("rune_day: " + dErr.message);
      for (const r of dr ?? []) tahli.add(r.user_id);
    }
    const { poslat, uzTahli, spatnaSluzba } = komuPoslat((odbery ?? []) as Odber[], tahli);
    v.uzTahli = uzTahli;
    // Řádek s cizí službou se sem dostat neměl (CHECK v tabulce) — neposílá se a smaže se jako mrtvý.
    const mrtve: Odber[] = [...spatnaSluzba];
    if (!zkouska) {
      const klic = await vapidKlic(pub, priv);
      const tedS = Math.floor(Date.now() / 1000);
      for (const o of poslat) {
        try {
          const r = await fetch(o.endpoint, { method: "POST", headers: {
            "Authorization": await vapidHlavicka(o.endpoint, klic, pub, subject, tedS),
            "TTL": "43200", "Urgency": "normal", "Content-Length": "0" } });
          const vy = vysledekPush(r.status);
          await r.body?.cancel();
          if (vy === "ok") {
            v.poslano++;
            if (!adminId) await db.from("push_subscriptions").update({ last_sent: new Date().toISOString() }).eq("endpoint", o.endpoint);
          } else if (vy === "gone") mrtve.push(o);
          else { v.chyb++; v.chyby.push(new URL(o.endpoint).hostname + " " + r.status); }
        } catch (e) {
          v.chyb++; v.chyby.push(String((e as Error).message).slice(0, 80));
        }
      }
    }
    if (!zkouska && !adminId) {
      for (const o of mrtve) {
        const { error } = await db.from("push_subscriptions").delete().eq("endpoint", o.endpoint);
        if (error) { v.chyb++; v.chyby.push("delete: " + error.message.slice(0, 60)); continue; }
        v.smazano++; v.items.push(o.user_id.slice(0, 8));
      }
    } else v.items = mrtve.map((o) => o.user_id.slice(0, 8));
  } catch (e) {
    v.chyb++;
    v.chyby.push(String((e as Error).message).slice(0, 120));
  }
  if (v.chyb) console.error("rune-day-push: " + v.chyby.join("; ").slice(0, 300));
  if (!zkouska && !adminId) {
    const { error } = await db.from("ops_events").insert({ kind: "purge", detail: { job: "push_subs", ok: v.chyb === 0,
      deleted: v.smazano, items: v.items, subs: v.odberu, sent: v.poslano, drawn: v.uzTahli,
      ...(v.chyb ? { error: v.chyby.join("; ").slice(0, 200) } : {}) } });
    if (error) console.error("rune-day-push: ops_events insert failed: " + error.message);
  }
  return json({ ok: v.chyb === 0, dry: zkouska, me: !!adminId, subs: v.odberu, sent: v.poslano, drawn: v.uzTahli, deleted: v.smazano,
    dead: v.items.length, errors: v.chyby });
});
