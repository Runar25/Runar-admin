// supabase/functions/_shared/voice_ticket.ts
// Hlas jednou ke každému čtení — podpis čtení, které se neukládá (DECISIONS 2026-10-11 (61); owner: „jo varianta 7 … ok udělej“).
//
// Proč: elevenlabs-proxy do 2026-10-11 přečetl JAKÝKOLI text do 3 000 znaků, 5× za minutu. „Jedno čtení = jeden hlas“ hlídalo jen
// vypnuté tlačítko v prohlížeči; kdo poslal požadavek sám, spálil 6 000 kreditů ElevenLabs za minutu. Držel to jen měsíční strop 5,
// a ten byl ownerův pokyn pro testery, omylem pro všechny (DECISIONS 2026-10-11 (49)). Teď hlas patří ke čtení:
//   · uložené čtení (deník) — elevenlabs-proxy si text vezme z databáze podle reading_id (tenhle modul jen textKHlasu),
//   · čtení, které se neukládá (pro někoho jiného, nebo když zápis selhal) — claude-proxy k němu přidá podpis a elevenlabs-proxy
//     přečte jen PŘESNĚ ten text, jen tomu uživateli a jen jednou (použitý podpis zapíše do voice_tickets).
// Bez Deno API: kontrola scripts/verify_hlas_ke_cteni.js modul importuje v Node a pouští na známých vstupech (§19).

const enc = new TextEncoder();

// Co Rúnar čte nahlas: čtení BEZ řádku ✦ (myšlenka je bez hlasu — KUKY 2026-09-30). ZRCADLÍ `reading` z _splitThought
// (v2/runar-character.js), kterým appka text zobrazuje i čte; shodu hlídá scripts/verify_hlas_ke_cteni.js.
export function textKHlasu(cele: string): string {
  const s = String(cele ?? "");
  const i = s.indexOf("✦");
  return (i === -1 ? s : s.slice(0, i)).trim();
}

// Mezery a konce řádků se mezi serverem a prohlížečem můžou lišit, slova ne — podpis i hlas jdou přes normalizovaný text.
export function normalizuj(s: string): string {
  return String(s ?? "").replace(/\s+/g, " ").trim();
}

// Vlastní podklíč odvozený z tajemství serveru (SUPABASE_SERVICE_ROLE_KEY má každá edge funkce) — žádné nové tajemství
// k nastavení; tajemství samo se k podpisu nepoužije a z podpisu se zjistit nedá.
async function klic(tajemstvi: string): Promise<CryptoKey> {
  const zaklad = await crypto.subtle.importKey("raw", enc.encode(tajemstvi), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const pod = await crypto.subtle.sign("HMAC", zaklad, enc.encode("runar-voice-ticket-v1"));
  return crypto.subtle.importKey("raw", pod, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

function zprava(user: string, nonce: string, text: string): Uint8Array {
  return enc.encode(["v1", user, nonce, normalizuj(text)].join("\n"));
}

function b64url(b: ArrayBuffer): string {
  let bin = "";
  for (const x of new Uint8Array(b)) bin += String.fromCharCode(x);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function zB64url(s: string): Uint8Array | null {
  try {
    const t = s.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(t + "===".slice((t.length + 3) % 4));
    return Uint8Array.from(bin, (c) => c.charCodeAt(0));
  } catch {
    return null;
  }
}

const NONCE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// Podpis čtení pro hlas: "<nonce>.<podpis>". Nonce = jednorázové číslo; elevenlabs-proxy ho po prvním hlasu zapíše jako použité.
// Prázdné tajemství = žádný podpis (radši čtení bez hlasu než podpis, který by uměl padělat kdokoli).
export async function podepis(tajemstvi: string, user: string, text: string): Promise<string | null> {
  if (!tajemstvi || !user || !normalizuj(text)) return null;
  const nonce = crypto.randomUUID();
  const sig = await crypto.subtle.sign("HMAC", await klic(tajemstvi), zprava(user, nonce, text));
  return nonce + "." + b64url(sig);
}

// Patří podpis tomuhle uživateli a PŘESNĚ tomuhle textu? Vrátí nonce, jinak null.
export async function over(tajemstvi: string, listek: unknown, user: string, text: string): Promise<string | null> {
  if (!tajemstvi || typeof listek !== "string" || !user) return null;
  const t = listek.indexOf(".");
  if (t < 1) return null;
  const nonce = listek.slice(0, t), sig = zB64url(listek.slice(t + 1));
  if (!NONCE.test(nonce) || !sig) return null;
  const ok = await crypto.subtle.verify("HMAC", await klic(tajemstvi), sig, zprava(user, nonce, text));
  return ok ? nonce : null;
}
