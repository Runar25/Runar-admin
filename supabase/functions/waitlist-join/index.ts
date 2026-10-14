// Supabase Edge Function: waitlist-join
// Registrace před spuštěním (landing therunekeeper.com, lane CODE-web, 2026-10-13; owner: „ano sbíráme“).
// E-mail jde rovnou do Brevo s dvojím potvrzením: Brevo pošle potvrzovací e-mail (šablona #1, tag optin) a do seznamu
// „Rúnar – waitlist“ (#3) kontakt zapíše až po kliknutí. U nás se nic neukládá — jediná kopie je v Brevu (zásady soukromí).
// Rate limit: 5 pokusů / 15 min na IP (táž RPC jako redeem-code). Honeypot `website` = bot, odpověď jako úspěch.
// Odpověď neprozradí, jestli e-mail už v seznamu je (duplicate → ok), ať se přes formulář nedá zjišťovat, kdo se registroval.
// Logy anglicky (§31), bez adresy (2026-10-13: ani doména — kontrola zákazů (verify_zakazy_cesty.js, §12) hlídá split e-mailu a adresa do logu nepatří).
// Deploy: supabase functions deploy waitlist-join --project-ref pmitxjvkeovijreepror --no-verify-jwt

import { createClient } from "npm:@supabase/supabase-js@2.117.3";

const BREVO_LIST_ID = 3;       // Brevo → Contacts → Lists → „Rúnar – waitlist #3“ (owner 2026-10-13)
const BREVO_TEMPLATE_ID = 1;   // Brevo → Marketing → Templates → „#1“, tag optin (owner 2026-10-13)
const REDIRECT_URL = "https://therunekeeper.com/?registered=1";

// Odkud smí formulář volat: web, náhled na GitHub Pages a lokální náhled. Jiný původ dostane odpověď bez CORS hlavičky.
const ORIGINS = new Set([
  "https://therunekeeper.com",
  "https://www.therunekeeper.com",
  "https://runar25.github.io",
  "http://localhost:7795",
]);

function cors(origin: string | null): Record<string, string> {
  const h: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
  if (origin && ORIGINS.has(origin)) h["Access-Control-Allow-Origin"] = origin;
  return h;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { ...cors(origin), "Content-Type": "application/json" } });

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let body: { email?: unknown; website?: unknown };
  try { body = await req.json(); } catch { return json({ error: "bad_request" }, 400); }

  if (typeof body.website === "string" && body.website.trim() !== "") return json({ ok: true });   // honeypot

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) return json({ error: "invalid_email" }, 400);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: allowed, error: rlErr } = await sb.rpc("check_rate_limit", {
    p_key: `waitlist:ip:${ip}`, p_window_seconds: 900, p_max_requests: 5,
  });
  if (rlErr) console.error("waitlist-join: rate limit check failed:", rlErr.message);
  if (allowed === false) return json({ error: "rate_limited" }, 429);

  // 2026-10-14 (nález CODE-read, kontrola architektury kolo 4, K4/1): limit jen na IP nestačí — kdo má víc IP, posílá potvrzovací
  // e-maily na cizí adresy a vyčerpá denní kvótu Brevo (300/den), ze které jdou i přihlašovací kódy appky.
  // Okna jen hodinová: check_rate_limit namátkou maže řádky s window_start starším než 1 h, takže denní okno by se tiše vynulovalo.
  // (a) táž adresa nejvýš 2× za hodinu — klíč je otisk (SHA-256), adresa sama do rate_limits nejde; nad limit tichý úspěch (neprozradit).
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email))))
    .map((x) => x.toString(16).padStart(2, "0")).join("");
  const { data: okEmail } = await sb.rpc("check_rate_limit", {
    p_key: `waitlist:email:${hash}`, p_window_seconds: 3600, p_max_requests: 2,
  });
  if (okEmail === false) return json({ ok: true });
  // (b) celkem za hodinu: přes den víc, v noci míň (owner 2026-10-14: „přes den budou víc potřeba“; zatím testujeme, v produkci
  //     se to vyřeší jinak — tarif Brevo bez denního stropu). Island = UTC celý rok. Den 08–23 h: 12/h, noc 23–08 h: 3/h
  //     → nejvýš 15 × 12 + 9 × 3 = 207 e-mailů za den, z 300 tak zbude ≥ 93 na přihlašovací kódy.
  //     Nad limit poctivá chyba (formulář ukáže „zkus to za chvíli“), ne tichý úspěch — skutečný člověk by jinak čekal na e-mail marně.
  const hourUtc = new Date().getUTCHours();
  const capPerHour = hourUtc >= 8 && hourUtc < 23 ? 12 : 3;
  const { data: okAll } = await sb.rpc("check_rate_limit", {
    p_key: "waitlist:all", p_window_seconds: 3600, p_max_requests: capPerHour,
  });
  if (okAll === false) { console.error("waitlist-join: hourly cap reached"); return json({ error: "busy" }, 503); }

  const key = Deno.env.get("BREVO_API_KEY");
  if (!key) { console.error("waitlist-join: BREVO_API_KEY missing"); return json({ error: "server_error" }, 500); }

  const res = await fetch("https://api.brevo.com/v3/contacts/doubleOptinConfirmation", {
    method: "POST",
    headers: { "api-key": key, "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({
      email,
      includeListIds: [BREVO_LIST_ID],
      templateId: BREVO_TEMPLATE_ID,
      redirectionUrl: REDIRECT_URL,
    }),
  });

  if (res.ok) return json({ ok: true });

  const text = await res.text();
  // 2026-10-13: první zkouška vrátila 400 „An active DOI template does not exist“ — šablona #1 musí být v Brevu Active.
  if (res.status === 400 && /duplicate/i.test(text)) return json({ ok: true });   // už registrovaný — neprozradit
  console.error(`waitlist-join: Brevo ${res.status}: ${text.slice(0, 300)}`);
  return json({ error: "server_error" }, 502);
});
