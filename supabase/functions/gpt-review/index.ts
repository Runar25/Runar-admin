// Supabase Edge Function: gpt-review
// ADMIN-ONLY: pošle hotové Rúnarovo čtení (+ Ask) modelu OpenAI gpt-6-sol a vrátí jeho rozbor.
// Proč (KUKY 2026-09-23): „chtěl bych tlačítko GPT 6 SOL… teď to musím udělat manuálně tím, že mu ten text
// nakopíruju a on ho analyzuje… na základě toho dokážu určit, jak to zní a jestli jsme někde neustřelili."
//
// Záměrně SAMOSTATNÁ funkce, ne režim v claude-proxy: proxy nese peníze (kredity, měsíční limit, deník)
// a tahle funkce se jich nesmí dotknout — žádný zápis do DB, žádný odečet. Je to jen tenká brána:
// admin JWT + pevný model + strop velikosti. Rozborový prompt skládá klient (runar-reading.js gptReview),
// protože jen on zná přesné zadání, se kterým čtení vzniklo.
// Soukromí: tlačítko je jen v adminově vlastní session (jeho čtení). Cizí čtení (shrine, testeři) sem NEJDOU,
// dokud privacy stránka nejmenuje OpenAI jako zpracovatele (RUNAR_PRIVACY.md).
// Secret: OPENAI_API_KEY (nastavuje owner). Deploy:
//   supabase functions deploy gpt-review --project-ref pmitxjvkeovijreepror --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Kopie seznamu adminů (další kopie: v2/runar-config.js a ostatní edge funkce). Shodu hlídá smoke
// (scripts/verify_admin_emails.js) — bez toho by se kopie tiše rozešly.
const ADMIN_EMAILS = ["kukula@agndofa.is", "info@agndofa.is"];
// 2026-09-24 (KUKY: „0,2 centu je hodně moc… musí být levnější nebo použít levnější model“): sol -> luna.
// Změřeno na ownerově čtení Isy (1647 vstup): sol s přemýšlením ~0,8 c, sol bez ~0,6 c, luna ~0,03 c (ceník run.js).
// Luna našla tatáž tvrzení o člověku i pokyn, ale 1 vymyšlená výtka a 1 přehlédnutý obraz — sol zůstává v záloze.
const MODEL = "gpt-6-luna";
const MAX_SYSTEM = 20000;
const MAX_USER = 30000;

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
  try { body = await req.json(); } catch { return json({ error: "Bad JSON" }, 400); }
  const system = String(body.system ?? "");
  const userMsg = String(body.user ?? "");
  if (!system || !userMsg) return json({ error: "Missing system or user" }, 400);
  if (system.length > MAX_SYSTEM || userMsg.length > MAX_USER) return json({ error: "too_long" }, 400);

  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) return json({ error: "no_key", message: "OPENAI_API_KEY is not set on the server." }, 503);

  // reasoning_effort 'none' (2026-09-24, cena): přemýšlení stálo u solu víc než polovinu výstupu a rozbor bez něj vyšel stejně.
  // Model, který 'none' nebere, vrátí 400 → zkusí se 'minimal' (tvar jako scripts/utils/gen_direct.js).
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 120000);
  try {
    let res: Response | null = null;
    for (const eff of ["none", "minimal"]) {
      res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: "Bearer " + key },
        body: JSON.stringify({
          model: MODEL, reasoning_effort: eff, max_completion_tokens: 2500,
          messages: [{ role: "system", content: system }, { role: "user", content: userMsg }],
        }),
        signal: ctl.signal,
      });
      if (res.status !== 400) break;
    }
    if (!res) return json({ error: "openai", message: "no response" }, 502);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return json({ error: "openai", message: (data?.error?.message) || ("HTTP " + res.status) }, 502);
    const text = (data?.choices?.[0]?.message?.content || "").trim();
    return json({ text, model: data?.model ?? MODEL, usage: data?.usage ?? null,
                  cut: data?.choices?.[0]?.finish_reason === "length" });
  } catch (e) {
    return json({ error: "openai", message: (e as Error)?.name === "AbortError" ? "timeout" : String(e) }, 502);
  } finally {
    clearTimeout(timer);
  }
});
