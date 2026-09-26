# Konce čtení: nové tvary obraz · napětí · návrat k otázce — pilot 2026-09-26

Zadání: KUKY 2026-09-26 „začneme konci čtení“ (BACKLOG „Konce čtení: víc tvarů (typy 6/7/9)“; typy z tarotové typologie,
kterou owner vložil 2026-09-25 — 1–4 verdikt/rada/varování/predikce jsou proti kánonu). Rozhodnutí zatím žádné — tohle jsou data.

- **Model:** `claude-opus-5`, `thinking: disabled`, systém s `cache_control` (tvar claude-proxy). EN.
- **Prompt:** produkční `buildReadingPrompt` přes `vm`, seedovaný `Math.random` — všechna ramena mají týž obraz, úhel
  i podobu oblasti. Nový tvar se vloží do `ENDING_OPEN/HEAVY` (všechny tři pozice), takže jde produkční cestou
  `_endingShape` → `{L}` a otázka runy (`_runeQuestion`) se připojí jako dnes. Rameno C/C2 nese navíc otázku tazatele.
- **Případy:** Algiz · Isa · Thurisaz · Uruz · Gebo · Laguz (oblast, rejstřík a otázka v `CASE` ve skriptu).
- **Znění tvarů:** `TVAR` ve skriptu (A, B, C = kolo 1; A2, C2 = kolo 2).

| soubor | co |
|---|---|
| `konce_pilot.js` | generátor; `node konce_pilot.js [ramena] [výstup]`, `ukaz` vypíše řádky konce |
| `konce_pilot.json` | kolo 1: 0 = dnešní produkce · A obraz · B napětí · C návrat k otázce (6 × 4) |
| `konce_pilot_k2.json` | kolo 2: A2 obraz, C2 návrat — přepsaná znění (6 × 2) |
| `slepi_soudce.txt` · `soudce_zadani.txt` · `soudce_klic.json` | co viděl slepý soudce (subagent), zadání a klíč pořadí |

## Kolo 1 — slepý soudce (24 čtení, tvar hádal bez znalosti ramen)

| rameno | trefa tvaru | ukotveno (ano / napůl) | rada | tvrzení o nitru | poznámka |
|---|---|---|---|---|---|
| 0 dnes | — (S, TEN, Q, ALT, ALT, Q) | 3 / 3 | 0 | 1 (Laguz, předpoklad v otázce) | těžká věta Uruz vyšla jako napětí |
| A obraz | 5/6 IMG | 2 / 4 | **2** | 0 | „Stand at the kitchen table and listen…“, „Look at the near edge…“; Laguz = předpověď |
| B napětí | 6/6 TEN | 4 / 2 | 0 | 0 | 3/6 stejná stavba „may be A, and B“ s opakovaným podstatným jménem |
| C návrat | 6/6 RET | 6 / 0 | 0 | 0 | **4/6 formule „Perhaps the question is less about X, and more about Y“** (3× doslova) |

## Kolo 2 — přepsané A2 a C2 (hodnotil CODE-tune, ne slepý soudce)

- **C2** („sets their question down inside the image … lets it be seen from there“): formule 0/6. Nové vady: 1× pokyn
  (Isa „Put the silence … down on that ice and listen“), 1× pojistka „only your own hands can measure that“ (Gebo) —
  táž třída jako „only you can say“ z Asku (2026-09-19).
- **A2** („in their own life … not something for them to do“): pokyn 0/6, ale obraz jen ~2/6 (zbytek věta), 1× předpověď
  (Thurisaz „the silence that follows will be heard“).
- Vedlejší nález: Isa A2 obsahuje čínský znak („some话 sits under“) — závada modelu. V produkci 0 ze 480 čtení, ve všech
  evalech 1× → zapsáno k hlídání, ne k opravě.

**Hranice:** n = 6 na tvar, jeden los na případ, jen EN, bez životní runy; kolo 2 bez slepého soudce. Otázky tazatele
napsal CODE-tune (ne skutečné). Soudce měřil tvar, ukotvení, radu a tvrzení — ne „je konec lepší“; to je ownerův úsudek.

## Po nasazení napětí (v4.61) — IS, 6 čtení (`napeti_is.js` / `.json`)

Produkční cesta v4.61, pool vynucený na [3]. Tvar napětí 6/6 (Algiz spíš „na rozhraní dvou“). is-grammar-qa na samotných koncích:
5/6 parsovatelné; Laguz si vytvořil slovo („kyrrðin sem þolir **bærunni** og **bæran**…“ — z obrazu „spegilmyndin bærist“) → E001 + S004.
Celá čtení: E001 3/6 (srovnání: pilot 2026-09-24 IS 2/6 — při n = 6 bez rozdílu). Rozhodnutí → `RUNAR_DECISIONS.md` 2026-09-26 (1).
