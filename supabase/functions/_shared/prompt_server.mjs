// prompt_server.mjs — server skládá prompt sám (2026-11-02, krok 1 plánu infrastruktury „prompt na server“, F3a; owner „ok, pokračuj s F3a“).
//
// Proč: do F3a model dostával text promptu z prohlížeče. Přihlášený člověk s upraveným prohlížečem tak mohl proxy poslat libovolný prompt
// a cenu čtení si určit sám (spread_cost, audit 2026-08-03 #4). Od F2 (2026-10-21) appka ke každému čtení posílá `stin` — s čím prompt
// skládala (builder, argumenty s runami jménem, náhodu, sáček obrazů, místní čas, jazyk). Z toho server teď složí prompt SÁM balíčkem
// prompt_skladani.mjs (týž kód jako appka, §18) a text od prohlížeče nepoužije. Shoda obou byla 48/48 (ops_events „prompt_stin“, 10/21–11/01).
//
// Co server od prohlížeče NEBERE: systémovou postavu (appka má vždy null — activeChar), korekce slov (načte je claude-proxy z DB a předá
// v `korekce`), engine a adminův výběr obrazu (ne-adminovi se ignorují), myšlenku ✦ (tarif z JWT), cenu a strop odpovědi (z configu podle
// builderu). Co zatím bere (F3b): náhodu, sáček obrazů, poslední obraz a místní čas — nic z toho nevpustí do promptu cizí text ani nezmění cenu.
// Ask: text čtení a předchozí výměna jsou argumenty od prohlížeče (ověření proti uloženému čtení = další krok, BACKLOG F3).
// Kódy chyb jsou anglicky — jdou do logů a ops_events (CLAUDE.md §31).
//
// Použití: claude-proxy (skutečné čtení) a scripts/verify_prompt_stin.js (appka v prohlížeči × server, bajt po bajtu). Jeden kód pro obojí.
import { vytvorSkladani } from "./prompt_skladani.mjs";

// Který builder smí který `mode` (proxy). Jiný builder = chyba, ne tiché čtení za cizí cenu.
const POVOLENE = {
  "": ["buildReadingPrompt", "buildKrizPrompt", "buildNornsPrompt", "buildHorseshoePrompt", "buildYggdrasilPrompt"],
  founding: ["buildNornsPrompt"],
  ask: ["buildAskPrompt"],
  life_rune: ["buildLifeRunePrompt"],
  name_lore: ["buildNameLorePrompt"],
};
// Čtení run: druh pro _promptKonec (myšlenka ✦, připomínka délky) a klíč ceny v SPREAD_COSTS / SPREAD_CONFIG.
const CTENI = {
  buildReadingPrompt: ["SINGLE", "single"], buildKrizPrompt: ["KRIZ", "cross"], buildNornsPrompt: ["NORNS", "norns"],
  buildHorseshoePrompt: ["HORSESHOE", "horseshoe"], buildYggdrasilPrompt: ["YGGDRASIL", "yggdrasil"],
};
// Kde builder bere korekce slov (index argumentu). Appka posílá všude globální `corrections`; server je nahradí svými.
const KOREKCE_ARG = { buildReadingPrompt: 3, buildKrizPrompt: 3, buildNornsPrompt: 3, buildHorseshoePrompt: 3, buildYggdrasilPrompt: 3,
  buildAskPrompt: 4, buildLifeRunePrompt: 6, buildNameLorePrompt: 3 };

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

// Prostředí balíčku, ve kterém jde zápis z appky přehrát: náhoda, úložiště a čas se nastaví pro každý zápis zvlášť.
export function prehravac() {
  const st = { los: [], i: 0, dosel: false, cas: null, uloz: {} };
  const D = globalThis.Date;
  class StinDate extends D {
    constructor(...a) { if (a.length) super(...a); else if (st.cas) super(D.UTC(st.cas[0], st.cas[1], st.cas[2], st.cas[3] || 0, st.cas[4] || 0)); else super(); }
  }
  const S = vytvorSkladani({
    random: () => { if (st.i < st.los.length) return st.los[st.i++]; st.dosel = true; return 0.5; },
    uloziste: { getItem: (k) => (k in st.uloz ? st.uloz[k] : null), setItem: (k, v) => { st.uloz[k] = String(v); }, removeItem: (k) => { delete st.uloz[k]; } },
    Date: StinDate,
  });
  // Přehraje jeden zápis (sys nebo prompt). `uprav(jm, args)` smí argumenty přepsat dřív, než builder poběží. Vrací text + spotřebu náhody.
  function prehraj(z, { admin = true, uprav = null } = {}) {
    st.los = Array.isArray(z.los) ? z.los.filter((n) => typeof n === "number") : []; st.i = 0; st.dosel = false;
    for (const k of Object.keys(st.uloz)) delete st.uloz[k];
    if (z.uloziste && typeof z.uloziste === "object") for (const [k, v] of Object.entries(z.uloziste)) st.uloz[k] = String(v);
    st.cas = Array.isArray(z.cas) ? z.cas.map(Number) : null;
    const s = z.stav || {};
    S.nastav("lang", s.lang === "is" ? "is" : "en"); S.nastav("userGender", s.userGender || "hk");
    // engine a výběr obrazu jsou adminovy nástroje — ne-adminovi platí výchozí stav (= appka bez nich)
    S.nastav("engine", admin ? (s.engine || "sol") : "sol"); S.nastav("pin", admin ? (s.pin || null) : null);
    S.nastav("posledni", s.posledni || {});
    const jm = String(z.builder || "");
    const fn = /^build[A-Za-z]+Prompt$/.test(jm) ? S[jm] : null;
    if (typeof fn !== "function") return { builder: jm.slice(0, 40), chyba: "unknown_builder" };
    let args = Array.isArray(z.args) ? runyZpet(z.args, S.RUNES) : [];
    if (uprav) args = uprav(jm, args);
    const text = String(fn(...args));
    return { builder: jm, text, args, lang: s.lang === "is" ? "is" : "en", los: st.los.length, los_zbyl: st.los.length - st.i, los_dosel: st.dosel };
  }
  return { S, prehraj };
}

// Prompt pro model ze zápisu appky. opts: mode (proxy), tier, admin, korekce (řádky runar_corrections z DB, normalizují se tady).
// Vrací { system, prompt, builder, cena, maxTokens, denik: {kind, rune_name, rune_glyph, rune_display?} | null,
// zivotni: {cislo, lang} | null (jen životní runa), los } nebo { chyba }.
export function slozPromptServer(stin, { mode = "", tier = "", admin = false, korekce = null } = {}) {
  if (!stin || typeof stin !== "object" || !stin.sys || !stin.prompt) return { chyba: "no_record" };
  if (JSON.stringify(stin).length > 120000) return { chyba: "record_too_large" };
  const povolene = POVOLENE[mode];
  if (!povolene) return { chyba: "mode_without_builder" };
  if (String(stin.sys.builder) !== "buildSysPrompt") return { chyba: "system_not_buildSysPrompt" };
  if (!povolene.includes(String(stin.prompt.builder))) return { chyba: "builder_not_allowed_for_mode" };
  try {
    const { S, prehraj } = prehravac();
    // jako appka (loadCorrections, runar-app.js): vypnuté CORRECTIONS_IN_PROMPT = žádné korekce
    const kor = korekce ? (S.CORRECTIONS_IN_PROMPT ? S.normalizeCorrections(korekce) : []) : null;
    const sys = prehraj(stin.sys, { admin, uprav: (_jm, a) => [null, a[1] === "is" ? "is" : "en"] });   // postava = null jako v appce
    if (sys.chyba) return { chyba: "system_" + sys.chyba };
    const pr = prehraj(stin.prompt, { admin, uprav: (jm, a) => { if (kor && jm in KOREKCE_ARG) a[KOREKCE_ARG[jm]] = kor; return a; } });
    if (pr.chyba) return { chyba: pr.chyba };
    let prompt = pr.text, cena = 1, maxTokens = 0, denik = null, zivotni = null;
    const druh = CTENI[pr.builder];
    if (druh) {
      const runy = (pr.builder === "buildReadingPrompt" ? [pr.args[1]] : (Array.isArray(pr.args[1]) ? pr.args[1] : [])).filter(Boolean);
      if (!runy.length) return { chyba: "no_runes" };
      prompt += S._promptKonec(druh[0], runy, pr.lang, S._myslenkaPro(tier, admin));   // hned po builderu: připomínka délky čte jeho rozpočet
      cena = S.SPREAD_COSTS[druh[1]].credits;
      maxTokens = druh[1] === "single" ? S.RUNAR_MODES.quick_reading.max_tokens : S.SPREAD_CONFIG[druh[1]].tokens;
      denik = druh[0] === "SINGLE"
        ? { kind: "single", rune_name: runy[0].n, rune_glyph: runy[0].g }
        : { kind: "spread", rune_name: druh[0], rune_glyph: "✦",
            rune_display: runy.map((r) => ((r.g || "") + " " + (S.rn(r, pr.lang) || "").toUpperCase()).trim()).join(" · ") };
    } else if (pr.builder === "buildAskPrompt") maxTokens = S.RUNAR_MODES.ask.max_tokens;
    else if (pr.builder === "buildLifeRunePrompt") {
      maxTokens = S.RUNAR_MODES.life_rune_standard.max_tokens;
      // claude-proxy ji po úspěšném čtení zapíše do profilu sám (brána „jen jednou“) — číslo jako appka (runar-tree.js: index v RUNES + 1)
      const r = pr.args[1], i = r ? S.RUNES.findIndex((x) => x.n === r.n) : -1;
      if (i < 0) return { chyba: "life_rune_unknown" };
      zivotni = { cislo: i + 1, lang: pr.lang };
    }
    else if (pr.builder === "buildNameLorePrompt") maxTokens = S.RUNAR_MODES.name_lore.max_tokens;
    return { system: sys.text, prompt, builder: pr.builder, cena, maxTokens, denik, zivotni,
             los: { sys: [sys.los, sys.los_zbyl, sys.los_dosel], prompt: [pr.los, pr.los_zbyl, pr.los_dosel] } };
  } catch (e) { return { chyba: String((e && e.message) || e).slice(0, 200) }; }
}

// Srovnání s textem, který appka poslala (ops_events „prompt_stin“): jen čísla a jména, žádný text čtení ani otázky.
export function porovnej(server, system, prompt) {
  const det = (s, k) => { s = String(s ?? ""); k = String(k ?? ""); if (s === k) return { shoda: true, rozdil: -1, delka_klient: k.length, delka_server: s.length };
    let j = 0; while (j < s.length && s[j] === k[j]) j++; return { shoda: false, rozdil: j, delka_klient: k.length, delka_server: s.length }; };
  if (!server || server.chyba) return { chyba: server ? server.chyba : "no_server" };
  return { builder: server.builder, sys: det(server.system, system), prompt: det(server.prompt, prompt), los: server.los };
}
