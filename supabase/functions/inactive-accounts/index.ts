// inactive-accounts — opuštěné účty: upozornění e-mailem 30 a 7 dní předem, po 3 letech bez přihlášení smazání (owner 2026-10-19,
// DECISIONS 2026-10-19 (3), (6); stavba 2026-11-01 „připravit. udělat.“, DECISIONS 2026-11-01 (3)). Pravidla a texty: _shared/necinne_ucty.ts;
// smazání tutéž cestou jako na žádost: _shared/smaz_ucet.ts.
// Volá ji pg_cron jednou denně (sql/2026-11-01_necinne_ucty.sql) s tajnou hodnotou x-ops-secret (OPS_CRON_SECRET, jako ops-watch);
// nasazuje se s --no-verify-jwt. Každý běh zapíše do ops_events „purge“ job inactive_accounts (i nulu) — registr MAZANI, hlídá ops-watch.
// {"mode":"dry","now":"<ISO>"} = zkouška: nic neposílá, nic nemaže, jen vrátí, co by udělala (počty a zkrácená id, žádné adresy).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.117.3";
import { rozhodni, denSmazani, email, chranen } from "../_shared/necinne_ucty.ts";
import type { Ucet, Zaznam } from "../_shared/necinne_ucty.ts";
import { jeAdmin } from "../_shared/admini.ts";
import { smazUcet } from "../_shared/smaz_ucet.ts";

const ODESILATEL = { name: "Rúnar", email: "noreply@therunekeeper.com" };

function json(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } });
}
function stejne(a: string, b: string): boolean {
  if (!a || a.length !== b.length) return false;
  let x = 0;
  for (let i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return x === 0;
}

async function posli(komu: string, e: { subject: string; html: string; text: string }): Promise<boolean> {
  const key = Deno.env.get("BREVO_API_KEY");
  if (!key) { console.error("inactive-accounts: BREVO_API_KEY missing"); return false; }
  const r = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": key, "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ sender: ODESILATEL, to: [{ email: komu }], subject: e.subject, htmlContent: e.html, textContent: e.text,
      tags: ["inactive"] }),
  });
  if (!r.ok) { console.error("inactive-accounts: Brevo " + r.status + ": " + (await r.text()).slice(0, 200)); return false; }
  return true;
}

serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!stejne(req.headers.get("x-ops-secret") ?? "", Deno.env.get("OPS_CRON_SECRET") ?? "")) return json({ error: "unauthorized" }, 401);
  let body: { mode?: string; now?: string } = {};
  try { body = await req.json(); } catch { /* prázdné tělo = ostrý běh */ }
  const zkouska = body.mode === "dry";
  const ted = zkouska && body.now ? new Date(body.now) : new Date();
  if (isNaN(ted.getTime())) return json({ error: "bad now" }, 400);

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const vysledek = { ucty: 0, prvni: 0, druhe: 0, smazano: 0, chraneno: 0, obnoveno: 0, chyb: 0, items: [] as string[], chyby: [] as string[] };
  try {
    // Všechny účty (stránkovaně) + profily + záznamy upozornění.
    const uzivatele: { id: string; email?: string; last_sign_in_at?: string | null; created_at: string; user_metadata?: { lang?: string } }[] = [];
    for (let strana = 1; strana < 1000; strana++) {
      const { data, error } = await db.auth.admin.listUsers({ page: strana, perPage: 1000 });
      if (error) throw new Error("listUsers: " + error.message);
      uzivatele.push(...data.users);
      if (data.users.length < 1000) break;
    }
    const { data: profily, error: pErr } = await db.from("user_profiles").select("id, tier, credits_balance, is_tester");
    if (pErr) throw new Error("profiles: " + pErr.message);
    const profil = new Map((profily || []).map((p: { id: string }) => [p.id, p]));
    const { data: zaznamy, error: zErr } = await db.from("inactive_notices").select("user_id, last_activity, first_at, second_at");
    if (zErr) throw new Error("notices: " + zErr.message);
    const zaznam = new Map((zaznamy || []).map((z: { user_id: string }) => [z.user_id, z]));

    for (const u of uzivatele) {
      vysledek.ucty++;
      // deno-lint-ignore no-explicit-any
      const p: any = profil.get(u.id) || {};
      const ucet: Ucet = { id: u.id, email: u.email ?? null, posledni: u.last_sign_in_at || u.created_at, admin: jeAdmin(u.email),
        kredity: Number(p.credits_balance) || 0, tier: p.tier ?? null, tester: !!p.is_tester };
      // deno-lint-ignore no-explicit-any
      const zr: any = zaznam.get(u.id);
      const z: Zaznam = zr ? { posledni: zr.last_activity, prvni: zr.first_at, druhe: zr.second_at } : null;
      const akce = rozhodni(ucet, z, ted);
      const id8 = u.id.slice(0, 8);
      if (akce === "none") continue;
      if (akce === "protected") { vysledek.chraneno++; continue; }
      if (akce === "reset") {
        vysledek.obnoveno++;
        if (!zkouska) await db.from("inactive_notices").delete().eq("user_id", u.id);
        continue;
      }
      if (akce === "first" || akce === "second") {
        const druhe = akce === "second";
        const kdy = denSmazani(ucet, druhe ? new Date(z!.prvni!) : ted, druhe ? ted : null);
        if (!zkouska) {
          const ok = await posli(ucet.email!, email(u.user_metadata?.lang, kdy, druhe));
          if (!ok) { vysledek.chyb++; vysledek.chyby.push(id8 + " mail"); continue; }   // bez odeslání žádný záznam → lhůta neběží
          const radek = druhe
            ? { user_id: u.id, last_activity: ucet.posledni, first_at: z!.prvni, second_at: ted.toISOString() }
            : { user_id: u.id, last_activity: ucet.posledni, first_at: ted.toISOString(), second_at: null };
          const { error } = await db.from("inactive_notices").upsert(radek);
          if (error) { vysledek.chyb++; vysledek.chyby.push(id8 + " notice"); continue; }
        }
        if (druhe) vysledek.druhe++; else vysledek.prvni++;
        continue;
      }
      // smazat — ještě jednou pojistka ochrany (kredity / předplatné se mohly změnit)
      if (chranen(ucet)) { vysledek.chraneno++; continue; }
      if (!zkouska) {
        const r = await smazUcet(db, u.id, ucet.email);
        if (!r.ok) { vysledek.chyb++; vysledek.chyby.push(id8 + " " + r.chyba.slice(0, 60)); continue; }
      }
      vysledek.smazano++;
      vysledek.items.push(id8);
    }
  } catch (e) {
    vysledek.chyb++;
    vysledek.chyby.push(String((e as Error).message).slice(0, 120));
  }

  if (!zkouska) {
    await db.from("ops_events").insert({ kind: "purge", detail: { job: "inactive_accounts", ok: vysledek.chyb === 0,
      deleted: vysledek.smazano, items: vysledek.items, warned: vysledek.prvni, warned_last: vysledek.druhe,
      ...(vysledek.chyb ? { error: vysledek.chyby.join("; ").slice(0, 200) } : {}) } });
  }
  return json({ ok: vysledek.chyb === 0, dry: zkouska, now: ted.toISOString(), ...vysledek });
});
