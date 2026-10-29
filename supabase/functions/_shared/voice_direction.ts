// supabase/functions/_shared/voice_direction.ts
// (jméno anglicky: cestu importu čte smoke ㉹ jako řetězec a „hlas“ je v CZ_SLOVA)
// Recept hlasu výkladu: jak Rúnar čte čtení nahlas — úvodní značka klidného hlasu, pauza mezi větami a 2–4 intonační značky, které do
// textu vloží model výkladu (sol). JEDINÉ místo receptu; elevenlabs-proxy ho volá před ElevenLabs.
//
// Proč (owner 2026-10-29: „v4 Turbo je dobré i pro IS. Použijeme“ · „R3 zní dobře pro výklad“): pokus RUNAR_EVAL_LOG 2026-10-28 (1)
// + R5 2026-10-29 (`docs/eval/2026-10-28-hlas-cteni/gen.js`). Model značky vloží a slovo nezmění (4/4); v4 Turbo je nečte nahlas
// (čistá řeč R5 17,9 / 18,5 s = R4 bez značek 17,8 / 18,6 s, EN / IS). Čte se jen to, co uživatel vidí — pojistka overZnacky: text
// bez značek musí sedět slovo od slova na čtení, jinak jde hlas BEZ značek (úvod + pauzy = R4, owner ho slyšel a schválil Turbo).
// Selže-li model (chyba, čas), totéž — hlas nikdy nečeká na režii déle než REZIE_CAS_MS a nikdy kvůli ní nepadne.
// Bez Deno API: scripts/verify_hlas_rezie.js modul importuje v Node a pouští na známých vstupech (§19).

export const HLAS_UVOD = "[calm, warm and thoughtful voice] ";
export const HLAS_ZNACKY = ["[softly]", "[thoughtfully]", "[warmly]", "[gravely]", "[gently]", "[short pause]", "[long pause]"];
export const HLAS_ZNACEK_MAX = 6;
// Model režie = model výkladu (owner: „dokázal by to model pro výklad udělat?“). Stejná hodnota jako SOL_MODEL v claude-proxy
// (2026-10-29); je to samostatná volba úlohy, ne kopie — rozdíl hlásí verify_hlas_rezie.js žlutě.
export const HLAS_REZIE_MODEL = "gpt-6-sol";
export const REZIE_CAS_MS = 8000;
// O kolik je text pro hlas delší než čtení (úvod + „ … “ + značky) — změřeno na R5 2026-10-29: EN 423/349, IS 411/333 znaků.
// Čte scripts/utils/pricing_tabulka.js (cena hlasu = znaky čtení × tohle × sazba).
export const HLAS_NAVYSENI_ZNAKU: Record<string, number> = { en: 1.21, is: 1.23 };

export function pauzy(t: string): string {
  return String(t ?? "").replace(/([.!?])\s+/g, "$1 … ");
}

export function bezZnacek(t: string): string {
  return String(t ?? "").replace(/\[[^\]]*\]/g, " ").replace(/…/g, " ").replace(/\s+/g, " ").replace(/\s+([.,!?;:])/g, "$1").trim();
}

// Značkovaný text smí jen přidat povolené značky — slova, interpunkce a pořadí zůstanou.
export function overZnacky(puvodni: string, znackovany: string): boolean {
  const zn = String(znackovany ?? "").match(/\[[^\]]*\]/g) || [];
  if (zn.length > HLAS_ZNACEK_MAX) return false;
  if (zn.some((z) => !HLAS_ZNACKY.includes(z))) return false;
  return bezZnacek(znackovany) === bezZnacek(puvodni);
}

export function rezieZadani(lang: string): string {
  return "You prepare a rune reading for spoken narration by a calm old rune keeper (ElevenLabs v4, which reads audio tags in square brackets). "
    + "Insert between 2 and 4 audio tags where the voice should change: only from this list: " + HLAS_ZNACKY.join(" ") + ". "
    + "Put a tag before the words it colours, or a pause tag between sentences. The reading is in " + (lang === "is" ? "Icelandic" : "English")
    + "; the tags stay in English. Do NOT change, add, remove or reorder any word or punctuation of the reading. Return only the tagged reading.";
}

// rezie: tagged = značky prošly · untagged = model odpověděl, pojistka je zahodila · failed = model nedostupný (stavy anglicky: log, smoke ㉹)
export type HlasText = { text: string; rezie: "tagged" | "untagged" | "failed"; znacky: string[]; usage: Record<string, unknown> | null };

// Text, který jde do ElevenLabs. `text` = čtení tak, jak ho čte uživatel (textKHlasu + normalizuj v proxy).
export async function hlasovyText(text: string, lang: string, openaiKey: string | undefined, f: typeof fetch = fetch): Promise<HlasText> {
  const zaklad = HLAS_UVOD + pauzy(text);
  if (!openaiKey) return { text: zaklad, rezie: "failed", znacky: [], usage: null };
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), REZIE_CAS_MS);
  try {
    for (const eff of ["none", "minimal"]) {
      const res = await f("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: "Bearer " + openaiKey },
        body: JSON.stringify({ model: HLAS_REZIE_MODEL, reasoning_effort: eff, max_completion_tokens: 1500,
          messages: [{ role: "system", content: rezieZadani(lang) }, { role: "user", content: text }] }),
        signal: ctl.signal,
      });
      if (res.status === 400 && eff === "none") continue;
      if (!res.ok) return { text: zaklad, rezie: "failed", znacky: [], usage: null };
      const d = await res.json().catch(() => null);
      const t = String(d?.choices?.[0]?.message?.content ?? "").trim();
      const usage = d?.usage ?? null;
      if (!t || !overZnacky(text, t)) return { text: zaklad, rezie: "untagged", znacky: [], usage };
      return { text: HLAS_UVOD + pauzy(t), rezie: "tagged", znacky: t.match(/\[[^\]]*\]/g) || [], usage };
    }
    return { text: zaklad, rezie: "failed", znacky: [], usage: null };
  } catch (_e) {
    return { text: zaklad, rezie: "failed", znacky: [], usage: null };
  } finally {
    clearTimeout(timer);
  }
}
