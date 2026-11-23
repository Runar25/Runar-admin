// Serverový klíč Supabase — JEDINÉ místo, odkud ho edge funkce berou (2026-11-01, krok 9 plánu infrastruktury v RUNAR_BACKLOG.md;
// owner „20. ano“, „6. nasaď“). Supabase ruší staré klíče anon / service_role do konce 2026 (supabase.com/docs/guides/api/api-keys).
// Nový tajný klíč dává runtime v SUPABASE_SECRET_KEYS jako JSON podle jména (docs „migrating-to-new-api-keys“); owner ho založil
// jménem „default“. 2026-11-23 (krok 5, owner „vyměň klíče“): staré klíče vypnuté, záloha SUPABASE_SERVICE_ROLE_KEY pryč. Chybí-li nový
// klíč, `klicZdroj` = „none“ a chyba v logu (inactive-accounts ho vrací ve zkušebním běhu) — žádné tiché zelené.
// deno-lint-ignore-file no-explicit-any
import { podepis, over } from "./voice_ticket.ts";

function zNovych(): string {
  try {
    const j: any = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "");
    return j && typeof j.default === "string" ? j.default : "";
  } catch { return ""; }
}
const NOVY = zNovych();
export const klicZdroj: "secret" | "none" = NOVY ? "secret" : "none";
if (klicZdroj !== "secret") console.error("supabase key: SUPABASE_SECRET_KEYS.default missing — no server key");
export const SERVER_KLIC: string = NOVY;

// Podpis čtení pro hlas (HMAC, _shared/voice_ticket.ts) — podepisuje i ověřuje se klíčem serveru. Do 2026-11-23 se ověřovalo i starým
// (přechod z kroku 1); podpisy starým klíčem se nevydávají od 2026-11-01, otevřená neuložená čtení z té doby už nežijí.
export function podepisServer(user: string, text: string): Promise<string | null> {
  return podepis(SERVER_KLIC, user, text);
}
export async function overServer(listek: unknown, user: string, text: string): Promise<string | null> {
  if (!NOVY) return null;
  return await over(NOVY, listek, user, text);
}
