// ops-watch — hlídání provozu Rúnara a ranní souhrn e-mailem do runar@therunekeeper.com.
// Proč (owner 2026-10-14 „ano, pg_cron + Brevo … ano udělej“, DECISIONS 2026-10-14 (12), (13)): místo Slacku, který hlásil jen „přišlo
// hlášení“. Volá ho pg_cron (sql/2026-10-14_ops_watch.sql): každých 15 min {"mode":"check"} — e-mail jen při ZMĚNĚ stavu; ráno
// {"mode":"digest"} — souhrn za 24 h. Běží v cloudu, ne na ownerově počítači: musí poznat i zálohu, která vůbec neproběhla.
// Přístup jen s tajnou hodnotou v hlavičce x-ops-secret (OPS_CRON_SECRET; plánovač ji bere z vaultu, v SQL nestojí). Funkce se nasazuje
// s --no-verify-jwt, jinak by ji pg_cron nezavolal; bez hlavičky 401.
// Čísla a texty skládá _shared/ops_souhrn.ts (čisté funkce, smoke ㊈); tady jen data z DB, stav ElevenLabs a odeslání přes Brevo.
// Do e-mailu jdou jen počty a typy — žádné texty čtení, otázky ani jména (RUNAR_PRIVACY.md).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.117.3";
import { fetchQuota, brzdaHlasu, EL_KREDIT_USD } from "../_shared/voice_usage.ts";
import { kredityHlasu } from "../_shared/el_voice.ts";
import { readingCostUsd } from "../_shared/ceny_modelu.ts";
import { stavy, upozorneni, souhrn, vadyMazani, vadyBehu, KLICE, MAZANI, BEHY } from "../_shared/ops_souhrn.ts";
import type { Stav, Hlidka, Den, Email, Zaloha, Kredity, MazaniPosledni, MazaniDen, BehPosledni } from "../_shared/ops_souhrn.ts";

const PRIJEMCE = "runar@therunekeeper.com";
// Tentýž odesílatel jako e-mail s přihlašovacím kódem (posílá ho Brevo, adresa je u Brevo ověřená).
const ODESILATEL = { name: "Rúnar Ops", email: "noreply@therunekeeper.com" };

function sb() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
}
function json(b: unknown, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } });
}
function stejne(a: string, b: string): boolean {
  if (!a || a.length !== b.length) return false;
  let x = 0;
  for (let i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return x === 0;
}

async function posli(e: Email): Promise<boolean> {
  const key = Deno.env.get("BREVO_API_KEY");
  if (!key) { console.error("ops-watch: BREVO_API_KEY missing"); return false; }
  const r = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": key, "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ sender: ODESILATEL, to: [{ email: PRIJEMCE, name: "Rúnar" }], subject: e.subject,
      htmlContent: e.html, textContent: e.text, tags: ["ops"] }),
  });
  if (!r.ok) { console.error("ops-watch: Brevo " + r.status + ": " + (await r.text()).slice(0, 200)); return false; }
  return true;
}

// deno-lint-ignore no-explicit-any
async function pocet(dotaz: any): Promise<number> {
  const { count, error } = await dotaz;
  if (error) throw new Error(error.message);
  return count ?? 0;
}
// deno-lint-ignore no-explicit-any
function udalosti(db: any, kind: string, od: string) {
  return pocet(db.from("ops_events").select("id", { count: "exact", head: true }).eq("kind", kind).gte("created_at", od));
}
// deno-lint-ignore no-explicit-any
async function zaloha(db: any): Promise<Zaloha> {
  const ok = await db.from("ops_events").select("created_at, detail").eq("kind", "backup_ok").order("created_at", { ascending: false }).limit(1);
  const ch = await db.from("ops_events").select("created_at").eq("kind", "backup_fail").order("created_at", { ascending: false }).limit(1);
  if (ok.error) throw new Error(ok.error.message);
  const o = ok.data?.[0];
  return { posledniOk: o?.created_at ?? null, bajtu: o?.detail?.bytes ?? null, posledniChyba: ch.data?.[0]?.created_at ?? null };
}
// Poslední záznam „purge“ každé mazací úlohy (2026-10-16, owner: „chci vždy potvrzení … musíme mít kontroly“). Úloha bez záznamu → kdy null.
// deno-lint-ignore no-explicit-any
async function mazaniPosledni(db: any): Promise<Record<string, MazaniPosledni>> {
  const o: Record<string, MazaniPosledni> = {};
  await Promise.all(Object.keys(MAZANI).map(async (job) => {
    const { data, error } = await db.from("ops_events").select("created_at, detail").eq("kind", "purge").eq("detail->>job", job)
      .order("created_at", { ascending: false }).limit(1);
    if (error) throw new Error(error.message);
    const r = data?.[0];
    o[job] = { kdy: r?.created_at ?? null, ok: r ? r.detail?.ok !== false : null, chyba: r?.detail?.error ? String(r.detail.error).slice(0, 80) : null };
  }));
  return o;
}
// Poslední záznam každé úlohy z BEHY (2026-10-18, owner: „cokoliv, co je třeba neviditelné, ale je dobré vidět, že to proběhlo“).
// info = „prošlo/celkem“, když úloha hlásí počet kontrol (zkouška obnovy: kontrol + vadne[]) — jen čísla, žádná data.
// deno-lint-ignore no-explicit-any
async function behyPosledni(db: any): Promise<Record<string, BehPosledni>> {
  const o: Record<string, BehPosledni> = {};
  await Promise.all(Object.keys(BEHY).map(async (kind) => {
    const { data, error } = await db.from("ops_events").select("created_at, detail").eq("kind", kind).order("created_at", { ascending: false }).limit(1);
    if (error) throw new Error(error.message);
    const r = data?.[0], d = r?.detail ?? {};
    const n = typeof d.kontrol === "number" ? d.kontrol : null;
    o[kind] = { kdy: r?.created_at ?? null, ok: r ? d.ok !== false : null, chyba: d.chyba ? String(d.chyba).split("\n")[0].slice(0, 80) : null,
      info: n != null ? (n - (Array.isArray(d.vadne) ? d.vadne.length : 0)) + "/" + n : null };
  }));
  return o;
}
// Nezávislá kontrola výsledku mazání zpráv čtenářů: kolik jich v DB zůstalo déle než 6 měsíců (+ 2 dny rezerva) po poslední odpovědi,
// bez odpovědi po přijetí — stejné pravidlo jako public.purge_reader_messages() (sql/2026-10-16_mazani_hlasi.sql). Má být vždy 0.
// deno-lint-ignore no-explicit-any
function zpravyPoLhute(db: any, ted: Date): Promise<number> {
  const h = new Date(ted.getTime());
  h.setUTCMonth(h.getUTCMonth() - 6);
  h.setUTCDate(h.getUTCDate() - 2);
  const iso = h.toISOString();
  return pocet(db.from("bug_reports").select("id", { count: "exact", head: true }).eq("type", "message")
    .or('resolved_at.lt."' + iso + '",and(resolved_at.is.null,created_at.lt."' + iso + '")'));
}

// deno-lint-ignore no-explicit-any
async function nactiStavy(db: any): Promise<Record<string, Stav>> {
  const { data, error } = await db.from("ops_alert_state").select("key, state");
  if (error) throw new Error(error.message);
  const o: Record<string, Stav> = {};
  for (const r of data ?? []) o[r.key] = r.state;
  return o;
}

// deno-lint-ignore no-explicit-any
async function hlidka(db: any, ted: Date): Promise<Hlidka> {
  const od = new Date(ted.getTime() - 3.6e6).toISOString();
  const [chyb, zaloh, cteni, brzd, z, mz, poLhute, bh] = await Promise.all([
    udalosti(db, "model_error", od),
    udalosti(db, "model_fallback", od),
    pocet(db.from("readings").select("id", { count: "exact", head: true }).gte("drawn_at", od)),
    pocet(db.from("voice_quota_snapshots").select("id", { count: "exact", head: true }).eq("source", "brake").gte("taken_at", od)),
    zaloha(db),
    mazaniPosledni(db),
    zpravyPoLhute(db, ted),
    behyPosledni(db),
  ]);
  return { ted: ted.toISOString(), chybModelu60: chyb, zalohModelu60: zaloh, cteni60: cteni, brzd60: brzd, zaloha: z, mazani: mz, zpravyPoLhute: poLhute,
    behy: bh };
}

// deno-lint-ignore no-explicit-any
async function den(db: any, ted: Date, h: Hlidka): Promise<Den> {
  const od = new Date(ted.getTime() - 864e5).toISOString();
  const [rd, vu, br, chyb, zaloh, brzd, z, otevrene, raw, neprectena, pu] = await Promise.all([
    db.from("readings").select("area, usage, follow_up").gte("drawn_at", od),
    db.from("voice_usage").select("model, chars").gte("created_at", od),
    db.from("bug_reports").select("type").gte("created_at", od),
    udalosti(db, "model_error", od),
    udalosti(db, "model_fallback", od),
    pocet(db.from("voice_quota_snapshots").select("id", { count: "exact", head: true }).eq("source", "brake").gte("taken_at", od)),
    zaloha(db),
    nactiStavy(db),
    fetchQuota(Deno.env.get("ELEVENLABS_API_KEY") ?? ""),
    // nepřečtená = stav new kdykoli (ne jen za 24 h) — do „Needs you“ (2026-10-14: souhrn hlásil i uzavřené hlášení)
    // 2026-10-15: bez zpráv čtenářů („Send Rúnar a line“, typ message) — na ty owner odpovídá v Gmailu, CODE je nenačítá
    pocet(db.from("bug_reports").select("id", { count: "exact", head: true }).eq("status", "new").neq("type", "keep").neq("type", "message")),
    db.from("ops_events").select("created_at, detail").eq("kind", "purge").gte("created_at", od),
  ]);
  for (const q of [rd, vu, br, pu]) if (q.error) throw new Error(q.error.message);
  // Mazání za 24 h podle úlohy (2026-10-16): počet běhů, smazáno, položky (id zpráv / názvy archivů), selhání; poslední běh vůbec z h.
  const mazani: Record<string, MazaniDen> = {};
  for (const job of Object.keys(MAZANI)) mazani[job] = { behu: 0, smazano: 0, polozky: [], chyb: 0, posledni: h.mazani[job]?.kdy ?? null };
  for (const e of pu.data ?? []) {
    const m = mazani[e.detail?.job];
    if (!m) continue;
    m.behu++;
    m.smazano += Number(e.detail?.deleted) || 0;
    if (Array.isArray(e.detail?.items)) m.polozky.push(...e.detail.items.map((x: unknown) => String(x).slice(0, 40)));
    if (e.detail?.ok === false) m.chyb++;
  }
  const modely: Record<string, number> = {};
  let cena = 0, bezCeny = 0, asky = 0, spready = 0;
  // deno-lint-ignore no-explicit-any
  const zapocti = (u: any) => {
    if (!u || !u.model) return;
    modely[u.model] = (modely[u.model] || 0) + 1;
    const c = readingCostUsd(u);
    if (c == null) bezCeny++; else cena += c;
  };
  for (const r of rd.data ?? []) {
    if (r.area === "spread") spready++;
    zapocti(r.usage);
    const fu = Array.isArray(r.follow_up) ? r.follow_up : [];
    asky += fu.length;
    for (const f of fu) zapocti(f?.usage);
  }
  let znaky = 0, kredity = 0;
  for (const v of vu.data ?? []) { znaky += v.chars || 0; kredity += kredityHlasu(v.model, v.chars || 0); }
  const hlaseni: Record<string, number> = {};
  let ulozeno = 0;
  for (const b of br.data ?? []) {
    if (b.type === "keep") ulozeno++;
    else hlaseni[b.type || "other"] = (hlaseni[b.type || "other"] || 0) + 1;
  }
  let kr: Kredity | null = null;
  if (raw) {
    const b = brzdaHlasu(raw, 0);
    // deno-lint-ignore no-explicit-any
    const rr = raw as any;
    const reset = typeof rr.next_character_count_reset_unix === "number" ? new Date(rr.next_character_count_reset_unix * 1000).toISOString() : null;
    kr = { spotreba: b.spotreba ?? 0, hladina: b.hladina, limit: typeof rr.character_limit === "number" ? rr.character_limit : null, reset };
  }
  return {
    od, do: ted.toISOString(), cteni: (rd.data ?? []).length, spready, asky, modely, cenaModelu: cena, bezCeny,
    hlasy: (vu.data ?? []).length, znakyHlasu: znaky, cenaHlasu: kredity * EL_KREDIT_USD, hlaseni, neprectena, ulozeno,
    chybModelu: chyb, zalohModelu: zaloh, brzd, kredity: kr, zaloha: z, otevrene,
    mazani, vadyMazani: vadyMazani(h, stavy(h).backup), behy: h.behy, vadyBehu: vadyBehu(h),
  };
}

serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method" }, 405);
  if (!stejne(req.headers.get("x-ops-secret") ?? "", Deno.env.get("OPS_CRON_SECRET") ?? "")) return json({ error: "unauthorized" }, 401);
  const body = await req.json().catch(() => ({}));
  const mode = body?.mode === "digest" ? "digest" : "check";
  const db = sb();
  const ted = new Date();
  try {
    if (mode === "digest") {
      const e = souhrn(await den(db, ted, await hlidka(db, ted)));
      const poslano = await posli(e);
      await db.from("ops_events").insert({ kind: poslano ? "digest_sent" : "digest_failed", detail: { stav: e.stav } });
      return json({ ok: poslano, mode, stav: e.stav });
    }
    const h = await hlidka(db, ted);
    const predtim = await nactiStavy(db);
    const nyni = stavy(h);
    const mail = upozorneni(predtim, nyni, h);
    const poslano = mail ? await posli(mail) : false;
    // Stav se uloží jen když e-mail odešel (nebo nebylo co poslat) — při výpadku Brevo by se změna jinak ztratila a upozornění nepřišlo.
    if (!mail || poslano) {
      const zmenene = KLICE.filter((k) => predtim[k] !== nyni[k]).map((k) => ({ key: k, state: nyni[k], changed_at: ted.toISOString() }));
      if (zmenene.length) {
        const { error } = await db.from("ops_alert_state").upsert(zmenene, { onConflict: "key" });
        if (error) throw new Error(error.message);
      }
    }
    if (mail && poslano) await db.from("ops_events").insert({ kind: "alert_sent", detail: { subject: mail.subject } });
    return json({ ok: true, mode, stavy: nyni, poslano });
  } catch (e) {
    console.error("ops-watch failed:", (e as Error).message);
    return json({ error: (e as Error).message }, 500);
  }
});
