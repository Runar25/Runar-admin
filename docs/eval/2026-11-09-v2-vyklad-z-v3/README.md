# Lab: výklad run z V3 do v2 (CODE-read, od 2026-11-09)

Owner 2026-11-09: *„implementovat do v2 to, co jsme se snažili dostat do V3. Což bylo shadow rune, co jsme měli dál, co nemá v2, ale mělo mít V3,
výslovně co se týče výkladu run.“* Rozhodnutí → `RUNAR_DECISIONS.md` 2026-11-09 (1). V3 je k ledu → [../2026-10-23-v3-charakter/v3-k-ledu.md](../2026-10-23-v3-charakter/v3-k-ledu.md).
**Tenhle soubor vlastní jen jednu věc:** co z výkladu run ve V3 ve v2 chybí, v jakém pořadí se to zkouší a výsledky zkoušek. Pokyny vlastní
`../2026-10-23-v3-charakter/zadani-v3.md` (čísla bodů A–G odkazují tam), kód v2 vlastní `v2/`. Postup: lab měří tady na produkční cestě
(sol, buildery v2), do produkce to po jednom převádí CODE-tune (lanes v CLAUDE.md).

## 1. Co ve výkladu run V3 měla a v2 nemá
| # | věc | pokyn (zadani-v3) | ve v2 dnes | co je potřeba |
|---|---|---|---|---|
| 1 | **druhá strana významu**: stín u světlé runy, světlo u těžké, bez nálepky | A4, F45, G55; krok 40 verdikt („pravidlo sedí“) | nic. Těžké runy (`HEAVY_RUNES`) jen konec „without comfort“. Mrtvý pool `READING_ASPECTS` v `v2/runar-utils.js` má položku „shadow — the cost beneath the gift“, nikdy nezapojenou (komentář: nevracet bez rozhodnutí) | řádek vstupu v `RP_SINGLE` (+ data na runu); světlo pro těžké runy data nemá |
| 2 | **moderní významy** jako zdroj | B9–B11 | „focus on: <aspekt>“ ze sloupce obrazu (`RUNE_IMAGES`), jinak 3 klíče z `RUNES[].k` | mapa aspekt → moderní význam a stín na 25 run; tabulka GPT je neověřená (F32) |
| 3 | **otázka na konci z významu, v každém čtení** (zrcadlení) | A3, F36, owner 10-28 | los konce 5 tvarů (`ENDING_OPEN`/`HEAVY`), otázka jen 1 z 5; most „may be X“ nese v Asku pojistku | změna konce = velká změna v2 → napřed test, rozhodne owner |
| 4 | **oblast vybere úhel významu**, ne vlastní větu | G52, krok 36 | věta oblasti „land on {podoba}“ + výběr obrazu podle oblasti | data úhlů se značkami oblastí (na bod 2) |
| 5 | **suchý humor občas** (ne Healing, ne těžká runa, ne na účet čtenáře) | F45, krok 38 verdikt | nic | jedna losovaná věta |
| 6 | **fáze runy** (nástup, vrchol, přechod, odpor) | F34, G51 (rozhodne test) | nic | test, znění nové |
| — | už ve v2: význam řečený jasně pro cizince (A2), jeden pohled na čtení losem (F43) | | `ESSENCE_FRAMES_SOL` + los slovesa; aspekt losem | nic |

## 2. Pořadí zkoušek (jedna změna na test, ownerova metoda 2026-11-05)
Základ = produkční prompt v2 single EN na solu (`scripts/utils/gen_batch.js`, produkční buildery), pevné losy, 10 čtení na rameno, víc run
(F44: závěr nikdy z jedné runy). Měří se: zda se věc ve čtení objeví, nálepka, délka, pojistka (`scripts/utils/pojistka.js`), tvrzení o čtenáři,
opis vstupu; texty čte owner. API jen s ownerovým ano (§30).
1. Druhá strana (bod 1) — nejmenší zásah, jen vstup; v GPT testu 1 přišla sama uvnitř scény 10/10.
2. Humor (bod 5).
3. Otázka na konci (bod 3).
4. Moderní význam (bod 2) — až s daty.
5. Oblast → úhel (bod 4) — na datech z 4.
6. Fáze (bod 6).
Islandština každého kusu až po EN, nástroji z CLAUDE.md §2.

## 3. Výsledky
(zatím nic)
