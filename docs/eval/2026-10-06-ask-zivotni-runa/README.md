# Ask k životní runě + cena čtení s automatickým Askem na oblast (sol, API) — 2026-10-06, CODE-tune

**Zadání (KUKY 2026-10-06):** *„u 4. jak víš, že to bude fungovat, pokud mu dáš celý seznam významů run? Pro tohle API použij…
Chce to zkusit víc variant a udělat taky Ask na životní runu…“* a *„jaká tak bude cena… chci to přesně… Ask nikdy není součást hlasu.“*
Model `gpt-6-sol`, parametry jako `callSol` v `claude-proxy` (`reasoning_effort: none`, `max_completion_tokens` 320 / 700,
`prompt_cache_options: explicit`). Prompty postavené produkční cestou (`buildSysPrompt`, `buildAskPrompt`, `buildReadingPrompt`
přes `vm`); měnil se jen blok životní runy a otázka. Vstupní čtení = tři ownerova čtení z 2026-10-06 (Raidho mohyly, Algiz sob,
Sowilo půlnoční slunce) — **jsou mimo repo** (nesou jméno), skripty `zivotni.js` a `cena.js` je čtou ze scratchpadu.
Spotřeba všech 126 volání: 169 805 vstupních a 8 619 výstupních tokenů = **$0,43**.

## 1. Ask k životní runě (Isa), n = 6 na buňku (3 čtení × 2)

> ⚠️ **Tabulka 1 a kola 2–3 mají ROZBITÝ VSTUP** (oprava 2026-10-06, DECISIONS 2026-10-06 (8)): test posílal do
> `buildAskPrompt` objekt runy místo jména → v promptu *„Runes drawn: [object Object]"*. Srovnání variant mezi sebou platí jen
> pro tenhle stav; závěr *„věta return to the runes způsobuje ozvěnu"* se se vstupem jako v produkci NEPOTVRDIL (kolo 4 a 5 níž).

Blok `LIFE RUNE` v promptu Asku:
- **V0** produkce: *„…you may answer from it in a sentence or two, then return to the runes that were drawn.“*
- **V1** bez *„then return to the runes that were drawn“*
- **V2** V1 + klíče Isy jako pozadí (*„as background only — never list them: ice, stillness, waiting, pause, clarity through cold“*)
- **V3** V1 + věta z ownerova popisu Isy (*„Isa is the stillness when something cannot move on yet: a pause, a waiting, the clarity
  that comes with the cold.“*)

Otázky: **Q1** *How does my life rune Isa affect this reading?* (dnešní tip) · **Q2** *…affect Raidho in this reading?* (návrh
ownera) · **Q3** *Where is my life rune Isa in this picture?* · kolo 2: **Q4** *How does my life rune Isa show itself in this
picture?* · **Q5** *What in this picture speaks to my life rune Isa?*

| | ozvěna „drawn“ (Q1+Q2) | ozvěna u Q3 | led doslova | seznam (3+ klíče) | vazba na obraz tažené runy |
|---|---|---|---|---|---|
| V0 | **6/12** | 5/6 | 1/18 | 0 | 15/18 |
| V1 | **0/12** | 5/6 | 1/18 | 0 | 16/18 |
| V2 | 1/12 | 6/6 | 3/18 | 0 | 16/18 |
| V3 | 0/12 | 3/6 | 0/18 | 0 | 16/18 |

Kolo 2 (jen V1 a V3): Q4 ozvěna 1/6 a 0/6, Q5 0/6 a 0/6; vazba na obraz 6/6 všude; led V1Q5 2/6, jinak 0.
**Závěr:** ozvěnu *„X is the rune drawn here“* dělá věta *„return to the runes that were drawn“* (V0 → V1: 6/12 → 0/12).
Seznam významů (V2, V3) nic měřitelného nepřidal a sol ho neodříkal; Isu bere jako význam (stillness/pause 6/6 ve všech
buňkách), led doslova jen výjimečně. Otázka *„Where is … in this picture?“* nutí model vysvětlovat, že Isa tažená nebyla;
*„show itself in this picture“* / *„What in this picture speaks to…“* životní runu do obrazu přenesou bez toho.
**Hranice:** jedna životní runa (Isa), tři tažené runy, jen EN, jen sol. Opus netestován.

## 2. Přesná cena: čtení + automatický Ask na oblast (sol), n = 5 na jazyk

Ceník sol $2 / 1M vstup, $10 / 1M výstup (cache 0 — explicitní režim nic nezapisuje). Hlas = jen text čtení (✦ ani Ask se
nenamlouvají), ElevenLabs EN $0,05 / 1k znaků, IS $0,10 / 1k (`RUNAR_PRICING.md`).

| | vstup / výstup | cena textu | hlas | čtení celkem |
|---|---|---|---|---|
| EN čtení | 1258 / 101 | $0,0035 | 329 zn. = $0,0164 | **$0,0200** |
| EN Ask na oblast | 1195 / 73 (61 slov) | $0,0031 | — | +$0,0031 → **$0,0231** |
| EN Ask krátce | 1203 / 44 (35 slov) | $0,0029 | — | +$0,0029 → $0,0228 |
| IS čtení | 2368 / 146 | $0,0062 | 353 zn. = $0,0353 | **$0,0415** |
| IS Ask na oblast | 2313 / 105 (64 slov) | $0,0057 | — | +$0,0057 → **$0,0472** |
| IS Ask krátce | 2329 / 64 (37 slov) | $0,0053 | — | +$0,0053 → $0,0468 |

Ask platí hlavně VSTUP (systémový prompt + text čtení), proto krátká odpověď šetří jen ~$0,0003. Islandština má zhruba
dvojnásobek tokenů. Pro srovnání Opus 5 (ownerova čtení 2026-10-05): čtení ~$0,0087, Ask ~$0,0056 (EN, s cache).

## 3. Kolo 3 — „show itself in this picture“ × „show itself in this reading“ (dnešní produkční blok LIFE RUNE), n = 9

| otázka | fráze z otázky v odpovědi | ozvěna „drawn“ | vazba na obraz tažené runy |
|---|---|---|---|
| *How does my life rune Isa show itself in this picture?* | 2/9 („in this picture“) | 1/9 | 9/9 |
| *How does my life rune Isa show itself in this reading?* (návrh ownera) | 1/9 („in this reading“) | 2/9 | 7/9 |

Owner: *„zase tak doslova používá in this picture… co takhle (in this reading)“* → nasazeno „…in this reading?“.

## 4. Odpověď na oblast VE STEJNÉM volání jako čtení (sol), n = 5 na jazyk

Čtení + pokyn *„also, separately… answer this question … in one or two short sentences … separate field "area"“*; odpověď je
samostatné pole JSONu (nenamlouvá se), vyplněno 5/5 v obou jazycích.

| | jen čtení (tab. 2) | čtení + odpověď na oblast v JEDNOM volání | totéž jako samostatný Ask |
|---|---|---|---|
| EN | $0,0035 | $0,0040 (vstup 1317, výstup 139) → **+$0,0005** | +$0,0031 |
| IS | $0,0062 | $0,0068 (vstup 2437, výstup 191) → **+$0,0006** | +$0,0057 |

Samostatný Ask (ať ho zadá uživatel, nebo se pošle sám) platí znovu celý vstup — systémový prompt a text čtení. Ve stejném volání
se platí jen výstup odpovědi. **Netvrdí se:** že je odpověď stejně dobrá — ve stejném volání spíš popisuje obraz znovu (*„You can
picture a house where the lights go out…“*), samostatný Ask má vlastní pravidla. Čtení vyšla o pár znaků delší (EN 357 proti 329,
IS 365 proti 353) — při n = 5 a jiných obrazech to není prokázané.

## 5. Kolo 4 a 5 — vstup jako v produkci („Runes drawn: Raidho…“), n = 6 na buňku

| varianta | ozvěna „drawn“ | „X is yours, but Y is the rune…“ | „ice“ | vazba na obraz |
|---|---|---|---|---|
| kolo 4: blok životní runy před v4.98 („…then return to the runes that were drawn“) | 15/18 | — | 2/18 | 16/18 |
| kolo 4: blok od v4.98 (bez té věty) | 14/18 | — | 3/18 | 17/18 |
| kolo 5: P0 = produkce v4.99 | 11/18 | 8/18 | 2/18 | 18/18 |
| kolo 5: P1 = Ask bez slova „drawn“ (5 míst) | **3/18** | **2/18** | 4/18 | 15/18 |

Otázky Q1 *…affect this reading?*, Q2 *…affect Raidho in this reading?*, Q6 *…show itself in this reading?*. Po P1 zbývá hlavně Q6
(*„only Raidho was cast here“* 2/6) — model si najde synonymum. Nasazeno P1 (v5.00).
