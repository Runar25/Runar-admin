// Supabase Edge Function: client-error
// Chyby appky u uživatelů (owner 2026-10-22 „8. 1, 2 a 3, předej tune 9. ano — najdi nejlepší řešení!“, DECISIONS 2026-10-22 (11); zadání
// CODE-read). Proč vlastní funkce, ne Sentry: další zpracovatel osobních údajů v USA, a my potřebujeme jen pár polí. Do té doby jsme o chybě
// JS v prohlížeči člověka nevěděli, dokud nenapsal hlášení.
// Appka (v2/runar-client-errors.js) posílá navigator.sendBeacon s text/plain (bez CORS preflight). Co se ukládá, bydlí v ZDE (zbytek se zahodí):
// text chyby ≤ 200 znaků bez e-mailů, adres a dlouhých čísel (čistí appka i server), náš soubor a řádek, verze, obrazovka, jazyk,
// přihlášený ano/ne. Žádné id, e-mail ani text čtení. Uloží se do ops_events (kind „client_error“) — ranní souhrn počet a nejčastější 3,
// ops-watch upozorní při ≥ 10 za hodinu; mazání po 90 dnech dělá úloha ops_events (sql/2026-10-22_mazani_provoz.sql, MAZANI).
// Veřejná (chyba přijde i od návštěvníka) → limity: 10 / h na IP, celkem 60 / h, tělo nejvýš 2 kB. Nad limit tichá 204 (appka nic nečeká).
// Logy anglicky (§31), bez obsahu chyby. Deploy: supabase functions deploy client-error --project-ref pmitxjvkeovijreepror --no-verify-jwt
import { createClient } from "npm:@supabase/supabase-js@2.117.3";

const ORIGINS = new Set([
  "https://runar25.github.io",
  "https://therunekeeper.com",
  "https://www.therunekeeper.com",
  "http://localhost:7790",
  "http://localhost:7791",
]);
const MAX_BODY = 2048;

// Totéž čištění jako v appce (runar-client-errors.js) — druhá pojistka, kdyby appka byla stará nebo podvržená.
export function cisti(t: unknown, max: number): string {
  return String(t ?? "")
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, "<email>")
    .replace(/https?:\/\/\S+/g, "<url>")
    .replace(/\d{6,}/g, "<n>")
    .replace(/\s+/g, " ").trim().slice(0, max);
}
// Pole, která se uloží — nic jiného z těla neprojde.
export function zaznam(b: Record<string, unknown>): Record<string, unknown> | null {
  const msg = cisti(b.msg, 200);
  if (!msg) return null;
  const src = typeof b.src === "string" && /^[\w-]+(\/[\w-]+)?\.js$/.test(b.src) ? b.src : "";
  const line = Number.isInteger(b.line) && (b.line as number) > 0 && (b.line as number) < 1e6 ? b.line : null;
  const ver = typeof b.ver === "string" && /^v\d{1,6}$/.test(b.ver) ? b.ver : "";
  const tab = typeof b.tab === "string" && /^[a-z]{2,20}$/.test(b.tab) ? b.tab : "";
  const lang = b.lang === "is" || b.lang === "en" ? b.lang : "";
  return { msg, src, line, ver, tab, lang, prihlasen: b.prihlasen === true };
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const h: Record<string, string> = { "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Vary": "Origin" };
  if (origin && ORIGINS.has(origin)) h["Access-Control-Allow-Origin"] = origin;
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: h });
  if (req.method !== "POST") return new Response(null, { status: 405, headers: h });
  // cizí stránka (sendBeacon Origin posílá; bez Origin = stará appka nebo test — projde, drží ho limity)
  if (origin && !ORIGINS.has(origin)) return new Response(null, { status: 403, headers: h });
  const text = await req.text();
  if (text.length > MAX_BODY) return new Response(null, { status: 413, headers: h });
  let b: Record<string, unknown>;
  try { b = JSON.parse(text); } catch { return new Response(null, { status: 400, headers: h }); }
  const z = zaznam(b && typeof b === "object" ? b : {});
  if (!z) return new Response(null, { status: 400, headers: h });
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { data: okIp } = await sb.rpc("check_rate_limit", { p_key: `clienterr:ip:${ip}`, p_window_seconds: 3600, p_max_requests: 10 });
  if (okIp === false) return new Response(null, { status: 204, headers: h });
  const { data: okAll } = await sb.rpc("check_rate_limit", { p_key: "clienterr:all", p_window_seconds: 3600, p_max_requests: 60 });
  if (okAll === false) { console.error("client-error: hourly cap reached"); return new Response(null, { status: 204, headers: h }); }
  const { error } = await sb.from("ops_events").insert({ kind: "client_error", detail: z });
  if (error) console.error("client-error: ops_events insert failed: " + error.message);
  return new Response(null, { status: 204, headers: h });
});
