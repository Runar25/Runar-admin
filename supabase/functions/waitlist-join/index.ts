// Supabase Edge Function: waitlist-join
// Registrace před spuštěním (landing therunekeeper.com, lane CODE-web, 2026-10-13; owner: „ano sbíráme“).
// E-mail jde rovnou do Brevo s dvojím potvrzením: Brevo pošle potvrzovací e-mail (šablona #1, tag optin) a do seznamu
// „Rúnar – waitlist“ (#3) kontakt zapíše až po kliknutí. U nás se nic neukládá — jediná kopie je v Brevu (zásady soukromí).
// Rate limit: 5 pokusů / 15 min na IP (táž RPC jako redeem-code). Honeypot `website` = bot, odpověď jako úspěch.
// Odpověď neprozradí, jestli e-mail už v seznamu je (duplicate → ok), ať se přes formulář nedá zjišťovat, kdo se registroval.
// Logy anglicky (§31), bez celé adresy — jen doména.
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
  const domain = email.split("@")[1];
  // 2026-10-13: první zkouška vrátila 400 „An active DOI template does not exist“ — šablona #1 musí být v Brevu Active.
  if (res.status === 400 && /duplicate/i.test(text)) return json({ ok: true });   // už registrovaný — neprozradit
  console.error(`waitlist-join: Brevo ${res.status} for @${domain}: ${text.slice(0, 300)}`);
  return json({ error: "server_error" }, 502);
});
