# Dávka sol vs opus-5 (2026-09-20, owner: „udělej větší dávku sol vs opus-5")

`pary.json` — 12 párů (single/norns × EN/IS × 3), **tentýž prompt oběma modelům**
(produkční buildery v4.31-podminka, seedovaný proud, shoda tahů ověřena 12/12).
gpt-5.6-sol: reasoning_effort none · claude-opus-5: thinking disabled.
Každý pár nese `vstupy` (řádky promptu: runa, účel, úhel, obraz, sezóna) a `draws`.
Hodnocení kalibrováno záznamem RUNAR_DECISIONS 2026-09-20 (2); soudy → `soudy.md`.

## Výsledek slepých párových soudů (4 soudci, A/B losované, autor skrytý)

**opus-5 : sol = 10 : 2.** Obě solové výhry „těsně" a jen proto, že opus-5 v té dvojici
překročil kánonovou čáru (cold reading „neither of you has named the debt" · rozbitá vazba
„heldurðu að leggja" v pivotní větě Skuld + „var aldrei gestur" orákulum).

## Systematické vzory (shodně 4 soudci + vlastní kontrola CODE-tune dvou párů)

- **opus-5 bydlí v obraze**: jedna scéna celým čtením, něco jasného vystoupí; platí za to
  délkou (EN single ø +31 % přes 38–45; norns ~140–156 slov) a tam, kde jsou ve scéně lidé,
  sklouzne k tvrzením o nitru/vztahu; 1× predikce („will be a sound, not a shape").
- **sol ředí do pojmů a opisuje prompt**: glosy run („Þroski"/„Óðinn"/„Félagsskapur"),
  lešení beatů („What was woven", „The thread now leads"), metadata („hidden roots",
  „companionship") — a **recykluje formuli „hæg breyting" 3/3 IS single** (opus-5 0×).
  Délku drží (EN ø 90 % limitu), IS ale podstřeluje (40–57).
- Tvrdé IS nálezy (korpus/BÍN): opus-5 „heldurðu að leggja" (0 dokladů, chybí „áfram") ·
  sol „tekið á sig röð" (0 vs „á sig mynd" 2122). Oba modely řádově čistší než gpt-5.
- v4.31 sezóna-podmínka drží: „grain" v obrazech bez pole 0/24, sezóna jen ve světle/vzduchu.

## Hranice

n=3 na konfiguraci · 1 soudce na konfiguraci · bez opus-4-8 ramene (srovnání s produkcí
= další krok, tytéž prompty ~$0.25). Délky a IS vazby jsou tvrdá data, pořadí je pozorování.
