# Otázky z nabídky Asku — rozbor ownerových čtení a pokusy se slovy (sol, API) — 2026-10-06, CODE-tune

**Zadání (KUKY 2026-10-06):** *„projdi ostatní otázky v ASK, jestli jsou správně formulované. Najdi si je v mých čteních.
Je potřeba nad tím přemýšlet, hledat cesty, zkoušet různá slova… pokud použije přesně to sloveso nebo podnět skoro pořád,
tak to prostě je viditelný problém.“*
Model `gpt-6-sol`, parametry jako `callSol` v `claude-proxy` (`reasoning_effort: none`, `max_completion_tokens` 320,
`prompt_cache_options: explicit`). Prompty postavené produkční cestou (`buildSysPrompt`, `buildAskPrompt` přes `vm`, runa jako
jméno — `rnPrompt`), v5.00. Vstupní čtení = tři ownerova čtení z 2026-10-06 (Raidho mohyly, Algiz sob, Sowilo půlnoční slunce;
oblast vyplněná, životní runa Isa) — **jsou mimo repo** (nesou jméno), skripty je berou jako argument.
Spotřeba: 288 volání = **$0,88**.

> ⚠️ **VSTUP S ✦ (oprava 2026-10-06 večer, našel CODE-read):** pokusy A a B posílaly Asku čtení z DB i s posledním řádkem myšlenky ✦,
> který produkce Asku neposílá (`readerTexts.short` po `_splitThought`). **Pokus A je přeměřený se správným vstupem** (n = 30 na rameno)
> → `RUNAR_EVAL_LOG.md` 2026-10-06 (8): pojistka v produkci 26/30, sníží ji most, charakter, pravidla Asku i NO COLD READING — tabulka 2
> níž platí jen pro vstup s ✦. **Pokus B se nepřeměřil** (owner běh zastavil kvůli velikosti vzorku); jeho čísla platí jen pro vstup s ✦.

## 1. Rozbor ownerových Asků od 2026-09-25 (124 odpovědí)
Tabulka → `ask_audit_od_2026-09-25.md` (`node ask_audit.js <export.json> 2026-09-25`). Hlavní nálezy:
- **Pojistka** *„the rune / reading does not say…"*, *„leaves … open"*, *„not a promise / verdict"* ve 40 ze 124 odpovědí
  (u *„{area} — can you make this image clearer?"* 9/15). Dělají ji **oba modely** — z 53 výskytů je 15 od Opusu.
- **Ozvěna otázky:** *„the hard part"* 2/2, *„The image points to…"* 2/2, *„in this reading"* 3/4 — malé n, proto pokus B.

## 2. Pokus A — odkud je pojistka (obrácená páka, CLAUDE.md §25), n = 18 na variantu
Tipy *„{area} — can you make this image clearer?"* a *„Explain {rune} without the image."*, 3 čtení × 3.
Pojistka = *„does/do not say|tell|settle|show|decide"*, *„leaves … open"*, *„not a promise|verdict|prediction|sign"*.

| varianta | pojistka |
|---|---|
| P0 produkce | 13/18 |
| P1 bez věty *„If they ask what it could be for them, offer one or two concrete possibilities…"* | 14/18 |
| P2 bez věty *„Do not mirror the seeker…"* | 12/18 |
| P3 bez bloku NO COLD READING | 12/18 |
| P4 bez všech tří naráz | 16/18 |
| P5 charakter bez *„never predicts fate…"*, *„never makes fear-based predictions"*, *„does not guarantee outcomes"*, *„Never hand the seeker a conclusion"* | 13/18 |
| P6 **čtení bez posledního řádku** (most *„…may be X, or Y"*) | **7/18** |
| P7 první pravidlo Asku *„…what it narrowed to **or how it ended**"* | 15/18 |

**Závěr:** pojistku nedělá žádné pravidlo Asku ani charakteru — **pět domněnek vyvrácených** (P1–P5 se nepohnuly).
Jediná páka, která se pohnula, je **poslední řádek samotného čtení**: odpověď převezme jeho tvar dvou možností a uzavře ho
*„the rune does not say which"*. Směr drží ve všech třech čteních (ze 6: 4 → 2, 5 → 2, 4 → 3) i u obou otázek, ale
**p = 0,09** (Fisher, n = 18) — **naznačeno, ne prokázáno**. Pokyn *„neopakuj, jak čtení skončilo"* (P7) nepomohl: co leží ve
vstupu, pokyn neodklidí. Čtení z Asku vyndat nejde (otázka může mířit právě na most), takže **oprava zatím není** — patří do labu.
**Hranice:** EN, sol, tři čtení, jedna životní runa. Opus netestován (v datech pojistku dělá taky, méně).

## 3. Pokus B — slova otázky, n = 9 na znění (3 čtení × 3), prompt = produkce
*Ozvěna* = trojice (nebo dvojice plnovýznamových) slov z otázky v odpovědi. *Stálý začátek* = přečteno ručně z prvních vět
(měření ho nevidí, viz závěr 4).

| tip | znění | ozvěna | pojistka | stálý začátek odpovědi |
|---|---|---|---|---|
| `ask_h_image` | *What is the image pointing to?* (dnes) | 3/9 | 6/9 | *„The image points to…"* 3/9 |
| | *Where does this image lead?* | 0/9 | 5/9 | *„The image does not point to a destination / an outcome"* 4/9 |
| | *What is this image about?* | 0/9 | 7/9 | *„The image…"* 6/9 |
| `ask_h_seek_challenge` | *What does this say about the hard part?* (dnes) | **9/9** | 6/9 | *„the hard part"* v první větě 8/9 |
| | *Where does this get hard?* | 0/9 | 4/9 | žádný převažující (nejvíc *„The hard part may be…"* 3/9) |
| | *What is the difficulty here?* | 0/9 | 7/9 | *„The difficulty …"* 5/9 (*„The difficulty in [runa] is…"* 3/9) |
| `ask_h_rune` | *What does {rune} mean in this reading?* (dnes) | 5/9 | 7/9 | *„in this reading"* 5/9 |
| | *What does {rune} mean here?* | 0/9 | 5/9 | *„Here, [runa] is…"* 5/9 · *„[runa] means … here"* 4/9 |
| | *What is {rune} doing here?* | 0/9 | 2/9 | *„[runa] gives …"* 7/9 (z toho *„… its meaning"* 4/9) |
| `ask_h_now` | *Why is this showing up now?* (dnes) | 0/9 | **9/9** | *„[runa] / The reading does not say…"* 9/9 (*„…why this appears now / why this moment has come"* 6/9) |
| | *What in this belongs to now?* | 8/9 | 7/9 | *„What belongs to now is…"* 8/9 |
| | *Why does this matter now?* | 0/9 | 8/9 | *„[runa] does not say…"* |

R1 = dnešní znění + pravidlo *„Begin with the answer itself, not with the words of the question."*: ozvěna image 3/9 · hard
9/9 · rune 5/9 · now 0/9 — **beze změny**.

**Závěr:**
1. **Každé znění tipu má na solu svůj stálý začátek.** Jiná slova formuli přesunou, neodstraní. Nejlíp vyšlo
   *„Where does this get hard?"* — žádný převažující začátek a nejméně pojistek z jeho trojice.
2. **Otázka, která žádá, co pravidla zakazují, začne odmítnutím.** *„Why is this showing up now?"* se ptá po příčině
   (znamení, osud — NO COLD READING ho zakazuje) → 9/9 odpovědí začne *„[runa] does not say…"* (*„…why this appears now"*); *„Why does this matter now?"* pojistka 8/9.
3. **Pravidlo v promptu ozvěnu nezměnilo** (R1) — mění ji jen slova otázky.
4. **Trojice slov z otázky nevidí přeskupenou ani jednoslovnou ozvěnu ani zápor otázky** (*„The difficulty in [runa] is…"*,
   *„[runa] means … here"*, *„The image does not point to…"*). Proto monitor ozvěn od 2026-10-06 počítá i **stejný začátek
   odpovědí na týž tip** (`scripts/monitor_ozveny.js`).

**Hranice:** EN, sol, tři čtení. IS tipy netestovány. Kvalita odpovědí (odpovídá na otázku?) čtena jen namátkou.

## Soubory
- `ask_audit.js` — rozbor otázek z nabídky v exportu čtení → `ask_audit_od_*.md`
- `ask_slova.js` — pokusy A (A, A2, A4) a B: `node ask_slova.js <cteni.json> <vystup.json> A|A2|A4|B [opakování]`;
  P6 = táž čtení bez posledního řádku před ✦ (`VARIANTA=P0`)
- `rozbor_slova.js` — tabulky z výsledků (`--vety` vypíše věty s pojistkou)
