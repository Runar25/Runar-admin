// Seznam adminů pro edge funkce — JEDINÉ místo (2026-10-22, DECISIONS 2026-10-22 (5)); do té doby šest vlastních kopií v claude-proxy,
// elevenlabs-proxy, elevenlabs-static, list-readings, list-reports a voice-usage. Klient má svůj v v2/runar-config.js, databáze
// funkci public.je_admin() (sql/2026-10-22_admin_jedno_misto.sql) — shodu všech tří hlídá kontrola ㉚ (scripts/verify_admin_emails.js).
// Malými písmy; porovnává se s e-mailem převedeným na malá písmena.
export const ADMIN_EMAILS: string[] = ["kukula@agndofa.is", "info@agndofa.is"];
export function jeAdmin(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(String(email).toLowerCase());
}
