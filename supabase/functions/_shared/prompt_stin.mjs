// prompt_stin.mjs — jádro stínu skládání promptu (2026-10-21, krok 1 plánu infrastruktury „prompt na server“, F2; owner „ok začni“).
// Z toho, s čím appka skládala prompt (`stin`: builder, argumenty s runami jménem, spotřebovaná náhoda, sáček obrazů, místní čas, jazyk,
// oslovení, engine, výběr obrazu), složí prompt z balíčku prompt_skladani.mjs a porovná s textem, který appka poslala:
//   system = shoda celého textu; prompt = text z appky ZAČÍNÁ výstupem builderu (appka za něj lepí myšlenku ✦ a připomínku délky).
// Vrací jen čísla a jména (builder, shoda, místo prvního rozdílu, délky, náhoda) — žádný text čtení ani otázky. Používá claude-proxy
// (zapíše do ops_events „prompt_stin“) a test scripts/verify_prompt_stin.js — jeden kód pro obojí.
import { prehravac } from "./prompt_server.mjs";
// 2026-11-02 (F3a): přehrávání zápisu (náhoda, úložiště, čas, stav) bydlí v prompt_server.mjs — týž kód, kterým server od F3a skládá
// skutečné čtení. Tady se přehrává přesně to, s čím appka skládala (i engine a výběr obrazu), aby šlo porovnat builder s textem appky.

export function porovnejStin(stin, system, prompt) {
  const detail = {};
  try {
    if (!stin || typeof stin !== "object") return { chyba: "bez_stinu" };
    if (JSON.stringify(stin).length > 120000) return { chyba: "stin_moc_velky" };
    const { prehraj } = prehravac();
    for (const [druh, z, klient] of [["sys", stin.sys, system], ["prompt", stin.prompt, prompt]]) {
      if (!z || typeof z !== "object") continue;
      const v = prehraj(z, { admin: true });
      if (v.chyba) { detail[druh] = { builder: v.builder, chyba: "neznamy_builder" }; continue; }
      const k = String(klient ?? "");
      const shoda = druh === "sys" ? v.text === k : k.startsWith(v.text);
      let rozdil = -1;
      if (!shoda) { let j = 0; while (j < v.text.length && v.text[j] === k[j]) j++; rozdil = j; }
      detail[druh] = { builder: v.builder, shoda, rozdil, delka_klient: k.length, delka_server: v.text.length,
                       los: v.los, los_zbyl: v.los_zbyl, los_dosel: v.los_dosel };
      detail.lang = v.lang;
    }
  } catch (e) { detail.chyba = String((e && e.message) || e).slice(0, 200); }
  return detail;
}
