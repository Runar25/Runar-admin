# Snapshot 2026-06-12 (část 2) — Sezónní obraznost, ladění čtení, budoucí Tree směr

## SW verze: v98
## Poslední commit: f1f360d
## (navazuje na 2026-06-12-audit-modelB-terminology-ux.md)

---

## 1. Délky čtení — finální (TTS / ElevenLabs cena)
- **Single: 3 věty, 38–45 slov, ~25–28s** (commit 5798b62 + c281f7d).
  - Var A: **vynecháno explicitní vplétání** životní runy + oblasti + hledání (zůstávají jen jako kontext v parts → jemně barví). „One clear insight is enough."
  - Závěrečná otázka krátká (pár slov).
  - Bylo 48s → teď ~25–33s. Příčina délky: prompt řídil jen počet vět, ne slova, + cpal moc nití do vět.
- **Multi-rune (bohaté, beze změny počtu):** Norns 8–9 · Cross 9–10 · Horseshoe 11–12 · Yggdrasil 14–15 · Life Rune 8–9.

## 2. Životní runa — pravidlo „občas, ne pořád"
- KUKY: zmínit ji občas je OK, vadí jen když POKAŽDÉ.
- Single: explicitní vplétání pryč, runa zůstává v kontextu → objeví se ~1/3 (ideál).
- Multi-rune: runa jen jako kontext (`Life rune: X`), NEnutí se → taky občasné. NEodstraňováno.

## 3. Jméno uživatele — ne vždy na začátku (commit f1f360d)
- Bylo: všechna čtení začínala „Anna,…".
- Fix: `Speak directly to {name}.` → `Address {name} once, woven naturally — never as the opening word.` (IS: `Ávarpaðu {name} einu sinni, fléttað náttúrlega — aldrei sem fyrsta orð.`). Single + 4 multi-rune, EN+IS (10 míst). Ověřeno: jméno se vplete uprostřed/později.

## 4. ⭐ SEZÓNNÍ OBRAZNOST (klíčová featura) — commit f677de1 + f1f360d
**Problém:** model ignoroval živý sezónní kontext a sypal sníh/zimu i v červnu.
**Architektonický vhled (DŮLEŽITÉ):** per-čtení injekce do **user promptu** (jako READING ANGLE) se MODELEM POSLECHNE. Kontext pohřbený v **system promptu** (V2) se IGNORUJE. → Rozdíl není obsah, ale UMÍSTĚNÍ + konkrétnost + závaznost.
**Řešení:** `_seasonalImagery(lang)` v character.js (vedle getContextLine) → vrátí podle měsíce sezónní paletu obrazů + závaznou instrukci. Injektováno per-čtení do `buildReadingPrompt` + 4 multi-rune builderů (EN+IS).
- 6 období dle měsíce (Pro-úno zima · Bře-dub světlo se vrací · Kvě-čer půlnoční slunce · Čvc-srp dlouhé světlo · Září sklizeň · Říj-lis tmavne). IS palety napsal Claude, KUKY schválil (prošlo check-is, NE přes runtime applyISCorrections — ten je na výstup, ne na prompt).
- Vazba: „your one nature image MUST come from this season, never off-season (no snow in summer). Isa = frozen ground beneath endless light, not snow."
- **OVĚŘENO empiricky:** Isa+Hagalaz Horseshoe v červnu → „frozen ground beneath the endless light of the white nights" / „midnight sun" místo sněhu. Přesně cíl.

## 5. V2 (buildSysPromptV2) = REDUNDANTNÍ
- Kontextová inteligence (moon/season/world-layers, ~2× větší system prompt) se v testech **neprojevila** — model ji ignoroval (system prompt). Sezónní injekce (#4) to dělá líp a levněji.
- **Závěr:** V2 do produkce NEDÁVAT. Nechán pro shrine lab + případně The Gathering (kde JE vzorec předmětem). KUKY: možná archivovat později, lab běží dál.
- Reader používá `buildSysPrompt` (lean). Shrine V2 lab `buildSysPromptV2`. Reading buildery sdílené.

## 6. Srovnávací nástroje (scripts/utils/) — reusable
- `compare_shrine_reader.js`, `compare_horseshoe.js`, `compare_spreads_neutral.js` — staví reader vs shrine prompty, volají **produkční claude-proxy** (Sonnet 4-5) přes **Supabase publishable key** (`sb_publishable_iS8zD-...`, safe), generují reálná čtení k A/B porovnání promptů. Klíč invokuje proxy (--no-verify-jwt), anonymně.

## 7. ⭐ BUDOUCÍ SMĚR — Tree of Life: Rúnar poznává uživatele
**Cíl (KUKY):** příští verze = Rúnar poznává uživatele KAŽDÝM čtením a vidí víc do jeho nitra.
**= existující plán `tree_state` / pattern detection** (viz snímek 2026-06-12 část 1 sekce o tom + runar-patterns.md + runar_design_v1.0.md + RUNAR_OVERVIEW.md 415–527):
- `tree_state` DB (per user): recurring_pattern, emotional_arc, personal_symbols, forbidden_next, dominant_element, trunk_themes…
- `tree-update` edge function (existuje, NEnasazena) → po čtení Haiku extrahuje vzorce → tree_state.
- `claude-proxy` Vrstva A/B/C (UŽ v kódu, deployed) → vkládá paměť do system promptu příštích čtení.
- **POZOR — NUTNÝ REDESIGN:** od návrhu se HODNĚ změnilo (model B, terminologie stones→reading, délky, sezónní injekce, V2 redundantní…). Plumbing v proxy existuje, ale tree_state DB tabulky NEEXISTUJÍ. Bude třeba vymyslet/předělat trochu jinak.
- **Pozn. k architektuře:** sezónní injekce ukázala, že per-čtení user-prompt injekce >> system prompt. Tree paměť (Vrstva A) je teď v SYSTEM promptu (proxy) → možná taky přesunout do per-čtení injekce, aby to model víc poslechl.

---

## Stav na konci dne
SW v98 · vše pushnuté · backend deployed · paměť+docs zrcadleno · patch skripty v scripts/archive/, srovnávací utils v scripts/utils/.

### Zbývá (netýká se dneška)
- 🔴 Launch: Resend SMTP, Shopify webhook, Standard checkout
- 🟢 Tree of Life vizuál — Cowork (Fable 5, jiný Code) · Tree paměť (tree_state) — REDESIGN, viz #7
- 🟢 Drobnost: „SINGLE RUNE" se na ~375px zalomí na 2 řádky
- 🟢 Možná archivovat V2 (buildSysPromptV2) — redundantní
