// prompt_stin.mjs — jádro stínu skládání promptu (2026-10-21, krok 1 plánu infrastruktury „prompt na server“, F2; owner „ok začni“).
// Z toho, s čím appka skládala prompt (`stin`: builder, argumenty s runami jménem, spotřebovaná náhoda, sáček obrazů, místní čas, jazyk,
// oslovení, engine, výběr obrazu), složí prompt z balíčku prompt_skladani.mjs a porovná s textem, který appka poslala:
//   system = shoda celého textu; prompt = text z appky ZAČÍNÁ výstupem builderu (appka za něj lepí myšlenku ✦ a připomínku délky).
// Vrací jen čísla a jména (builder, shoda, místo prvního rozdílu, délky, náhoda) — žádný text čtení ani otázky. Používá claude-proxy
// (zapíše do ops_events „prompt_stin“) a test scripts/verify_prompt_stin.js — jeden kód pro obojí.
import { vytvorSkladani } from "./prompt_skladani.mjs";

function runyZpet(x, runy, d) {
  d = d || 0;
  if (d > 8 || x === null || x === undefined) return x;
  if (Array.isArray(x)) return x.map((y) => runyZpet(y, runy, d + 1));
  if (typeof x === "object") {
    if (typeof x.__runa === "string") return runy.find((r) => r.n === x.__runa) || null;
    const v = {};
    for (const k of Object.keys(x)) v[k] = runyZpet(x[k], runy, d + 1);
    return v;
  }
  return x;
}

export function porovnejStin(stin, system, prompt) {
  const detail = {};
  try {
    if (!stin || typeof stin !== "object") return { chyba: "bez_stinu" };
    if (JSON.stringify(stin).length > 120000) return { chyba: "stin_moc_velky" };
    let los = [], i = 0, dosel = false, cas = null;
    const uloz = {};
    const D = globalThis.Date;
    class StinDate extends D {
      constructor(...a) { if (a.length) super(...a); else if (cas) super(D.UTC(cas[0], cas[1], cas[2], cas[3] || 0, cas[4] || 0)); else super(); }
    }
    const S = vytvorSkladani({
      random: () => { if (i < los.length) return los[i++]; dosel = true; return 0.5; },
      uloziste: { getItem: (k) => (k in uloz ? uloz[k] : null), setItem: (k, v) => { uloz[k] = String(v); }, removeItem: (k) => { delete uloz[k]; } },
      Date: StinDate,
    });
    for (const [druh, z, klient] of [["sys", stin.sys, system], ["prompt", stin.prompt, prompt]]) {
      if (!z || typeof z !== "object") continue;
      los = Array.isArray(z.los) ? z.los.filter((n) => typeof n === "number") : []; i = 0; dosel = false;
      for (const k of Object.keys(uloz)) delete uloz[k];
      if (z.uloziste && typeof z.uloziste === "object") for (const [k, v] of Object.entries(z.uloziste)) uloz[k] = String(v);
      cas = Array.isArray(z.cas) ? z.cas.map(Number) : null;
      const st = z.stav || {};
      S.nastav("lang", st.lang === "is" ? "is" : "en"); S.nastav("userGender", st.userGender || "hk");
      S.nastav("engine", st.engine || "sol"); S.nastav("pin", st.pin || null); S.nastav("posledni", st.posledni || {});
      const jm = String(z.builder || "");
      const fn = /^build[A-Za-z]+Prompt$/.test(jm) ? S[jm] : null;
      if (typeof fn !== "function") { detail[druh] = { builder: jm.slice(0, 40), chyba: "neznamy_builder" }; continue; }
      const args = Array.isArray(z.args) ? runyZpet(z.args, S.RUNES) : [];
      const vystup = String(fn(...args));
      const k = String(klient ?? "");
      const shoda = druh === "sys" ? vystup === k : k.startsWith(vystup);
      let rozdil = -1;
      if (!shoda) { let j = 0; while (j < vystup.length && vystup[j] === k[j]) j++; rozdil = j; }
      detail[druh] = { builder: jm, shoda, rozdil, delka_klient: k.length, delka_server: vystup.length,
                       los: los.length, los_zbyl: los.length - i, los_dosel: dosel };
      detail.lang = st.lang;
    }
  } catch (e) { detail.chyba = String((e && e.message) || e).slice(0, 200); }
  return detail;
}
