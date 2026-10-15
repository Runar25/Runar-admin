// send-line — zpráva „Send Rúnar a line“ / „Sendu Rúnari línu“ z menu appky (jen přihlášený uživatel).
// Proč (owner 2026-10-15 přes CODE-read: „dal bych to do menu… odpovědi z runar@therunekeeper.com“; plán CODE-tune → owner „8. ano 9. ano
// 10. ano“, DECISIONS 2026-10-15): běžný uživatel napíše Rúnarovi. Zpráva se uloží do bug_reports (typ „message“; mazání 6 měsíců po
// poslední odpovědi, sql/2026-10-15_zpravy_runarovi.sql) a zároveň přijde e-mailem do runar@therunekeeper.com s Reply-To na uživatele —
// owner v Gmailu klikne Odpovědět a odpověď odejde z runar@. E-mail je krátký (memory emaily-kratke) a anglický (§31, schránka adminů).
// Adresu bere server z přihlášení (auth.getUser), ne z těla požadavku — klient ji podvrhnout nemůže. Nejvýš 3 zprávy za hodinu na účet
// (check_rate_limit; okno ≤ 1 h — u delšího okna má ta funkce past, RUNAR_BACKLOG.md).
// Uložení a e-mail jsou dvě cesty: selže-li jedna, druhá zprávu drží (uživatel dostane „ok“). Chyba jen když neprojde ani jedna.
// Deploy: supabase functions deploy send-line --project-ref pmitxjvkeovijreepror --no-verify-jwt
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.117.3";

const PRIJEMCE = "runar@therunekeeper.com";
const ODESILATEL = { name: "Rúnar", email: "noreply@therunekeeper.com" };   // ověřený odesílatel v Brevu (jako přihlašovací kód)
const MAX_ZNAKU = 2000;
const ZA_HODINU = 3;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { ...cors, "Content-Type": "application/json" } });

function esc(s: string): string {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
// Zařízení krátce pro e-mail („Android 10 · Chrome 155“); celý user-agent jde jen do DB (jako u hlášení testerů).
export function zarizeniKratce(ua: string): string {
  const os = /Android [\d.]+/.exec(ua)?.[0] || (/iPhone|iPad/.test(ua) ? (/iPad/.test(ua) ? "iPad" : "iPhone") : "")
    || (/Windows/.test(ua) ? "Windows" : /Mac OS X/.test(ua) ? "Mac" : /Linux/.test(ua) ? "Linux" : "");
  const pr = /Edg\/(\d+)/.exec(ua)?.[1] ? "Edge " + /Edg\/(\d+)/.exec(ua)![1]
    : /Firefox\/(\d+)/.exec(ua)?.[1] ? "Firefox " + /Firefox\/(\d+)/.exec(ua)![1]
    : /Chrome\/(\d+)/.exec(ua)?.[1] ? "Chrome " + /Chrome\/(\d+)/.exec(ua)![1]
    : /Version\/(\d+).*Safari/.exec(ua)?.[1] ? "Safari " + /Version\/(\d+).*Safari/.exec(ua)![1] : "";
  return [os, pr].filter(Boolean).join(" · ") || "unknown device";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST") return json({ error: "method" }, 405);

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  const { data: { user } } = token ? await sb.auth.getUser(token) : { data: { user: null } };
  if (!user || !user.email) return json({ error: "not_authenticated" }, 401);

  // deno-lint-ignore no-explicit-any
  const body: any = await req.json().catch(() => ({}));
  const zprava = typeof body.message === "string" ? body.message.trim() : "";
  if (!zprava) return json({ error: "empty" }, 400);
  if (zprava.length > MAX_ZNAKU) return json({ error: "too_long" }, 400);
  const verze = typeof body.app_version === "string" ? body.app_version.slice(0, 40) : "";
  const jazyk = body.locale === "is" ? "is" : "en";
  const ua = (req.headers.get("user-agent") || "").slice(0, 400);

  const { data: smi, error: limErr } = await sb.rpc("check_rate_limit", { p_key: "line:" + user.id, p_window_seconds: 3600, p_max_requests: ZA_HODINU });
  if (limErr) console.error("send-line: rate limit check failed: " + limErr.message);   // limit nesmí zprávu zastavit, jen zpomalit
  if (smi === false) return json({ error: "rate_limited" }, 429);

  // 1) databáze — zdroj pro shrine a pro mazání po 6 měsících
  const { error: dbErr } = await sb.from("bug_reports").insert({
    client_uuid: crypto.randomUUID(), tester: user.email, type: "message", message: zprava, screen_context: "send-line",
    locale: jazyk, app_version: verze, user_agent: ua, reported_at: new Date().toISOString(), status: "new",
  });
  if (dbErr) console.error("send-line: db insert failed: " + (dbErr.code || "") + " " + dbErr.message);

  // 2) e-mail do runar@ s odpovědí rovnou uživateli
  let poslano = false;
  const key = Deno.env.get("BREVO_API_KEY");
  if (!key) console.error("send-line: BREVO_API_KEY missing");
  else {
    const meta = [verze || "version unknown", zarizeniKratce(ua), jazyk.toUpperCase()].join(" · ");
    const r = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": key, "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        sender: ODESILATEL, to: [{ email: PRIJEMCE, name: "Rúnar" }], replyTo: { email: user.email },
        subject: "Rúnar · A line from a reader",
        textContent: zprava + "\n\n— " + meta,
        htmlContent: '<div style="font:14px/1.5 Arial,Helvetica,sans-serif;color:#1f1f1f;white-space:pre-wrap">' + esc(zprava) + "</div>"
          + '<div style="font:12px/1.5 Arial,Helvetica,sans-serif;color:#777;margin-top:10px">' + esc(meta) + "</div>",
        tags: ["line"],
      }),
    });
    if (r.ok) poslano = true;
    else console.error("send-line: Brevo " + r.status + ": " + (await r.text()).slice(0, 200));
  }

  if (dbErr && !poslano) return json({ error: "failed" }, 502);
  return json({ ok: true, saved: !dbErr, mailed: poslano });
});
