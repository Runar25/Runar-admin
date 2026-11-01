// Serverový klíč Supabase — JEDINÉ místo, odkud ho edge funkce berou (2026-11-01, krok 9 plánu infrastruktury v RUNAR_BACKLOG.md;
// owner „20. ano“, „6. nasaď“). Supabase ruší staré klíče anon / service_role do konce 2026 (supabase.com/docs/guides/api/api-keys).
// Nový tajný klíč dává runtime v SUPABASE_SECRET_KEYS jako JSON podle jména (docs „migrating-to-new-api-keys“); owner ho založil
// jménem „default“. Do vypnutí starých klíčů je záloha SUPABASE_SERVICE_ROLE_KEY — s chybou v logu a zdrojem v `klicZdroj`, aby
// záloha nebyla tichá (inactive-accounts ho vrací ve zkušebním běhu). Krok 5 plánu zálohu odstraní.
// deno-lint-ignore-file no-explicit-any
import { podepis, over } from "./voice_ticket.ts";

function zNovych(): string {
  try {
    const j: any = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "");
    return j && typeof j.default === "string" ? j.default : "";
  } catch { return ""; }
}
const NOVY = zNovych();
const STARY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
export const klicZdroj: "secret" | "legacy" | "none" = NOVY ? "secret" : STARY ? "legacy" : "none";
if (klicZdroj !== "secret") console.error("supabase key: SUPABASE_SECRET_KEYS.default missing — using " + klicZdroj);
export const SERVER_KLIC: string = NOVY || STARY;

// Podpis čtení pro hlas (HMAC, _shared/voice_ticket.ts) — podepisuje se klíčem serveru. Při přechodu na nový klíč se ověřuje novým
// i starým: podpisy vydané před nasazením (otevřené neuložené čtení) by jinak propadly — hlas 403 voice_unbound, Ask zase placený.
export function podepisServer(user: string, text: string): Promise<string | null> {
  return podepis(SERVER_KLIC, user, text);
}
export async function overServer(listek: unknown, user: string, text: string): Promise<string | null> {
  for (const k of [NOVY, STARY]) {
    if (!k) continue;
    const n = await over(k, listek, user, text);
    if (n) return n;
  }
  return null;
}
