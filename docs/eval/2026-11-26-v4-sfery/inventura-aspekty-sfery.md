# Inventura: aspekty obrazů v2 × sféry z návrhu Gemini (V4, krok 1, 2026-11-26)

**Otázka:** mají runy ve v2 už něco, z čeho sféry V4 vyrostou, nebo se sféry píšou od nuly?
**Postup:** bez API. Skript spočítal 6. sloupec (EN stránka runy) `RUNE_IMAGES` v `v2/runar-character.js` (HEAD 2aef0e3); obraz s „a|b“ se počítá
do obou aspektů. Skript: `skripty/aspekty.js` (spuštění `node docs/eval/2026-11-26-v4-sfery/skripty/aspekty.js v2/runar-character.js`).
**Hranice:** počítá jen banku obrazů single čtení, ne významy z `runar-runes.js` ani moderní významy V3 (neověřené, F32). Aspekt je slovo,
kterým obraz soudci přečetli, ne definice sféry.

## 1. Aspekty v bance obrazů (190 obrazů, 25 run)

| runa | obrazů | aspekty (počet obrazů) |
|---|---|---|
| Algiz | 6 | protection 4 · shelter 2 |
| Ansuz | 10 | messages 3 · wisdom 3 · voice 2 · divine guidance 1 · breath 1 |
| Berkana | 9 | new beginnings 4 · nurturing 2 · growth 2 · birth 1 |
| Blank | 8 | unwritten potential 4 · the unknown 4 · the void 1 |
| Dagaz | 7 | dawn 3 · turning point 2 · breakthrough 1 · light 1 |
| Ehwaz | 7 | trust 4 · partnership 4 · movement 1 |
| Eihwaz | 6 | resilience 3 · world-tree 1 · death and rebirth 1 · endurance 1 |
| Fehu | 8 | wealth 4 · material prosperity 4 · cattle 1 |
| Gebo | 7 | giving and receiving 4 · balance 1 · gift 1 · companionship 1 |
| Hagalaz | 8 | nature force 5 · disruption 4 · transformation 2 · hail 2 · clearing 2 |
| Ingwaz | 6 | potential 3 · inner development 2 · new life 1 |
| Isa | 7 | waiting 3 · stillness 1 · ice 1 · pause 1 · clarity through cold 1 |
| Jera | 13 | harvest 3 · cycle 3 · reward 3 · patience 2 · right timing 2 |
| Kenaz | 8 | fire 2 · inner light 2 · knowledge 2 · creativity 1 · torch 1 |
| Laguz | 6 | intuition 3 · the unconscious 2 · flow 2 |
| Mannaz | 7 | self-awareness 2 · the self 2 · humanity 2 · mind 1 |
| Nauthiz | 8 | necessity 3 · growth through challenge 2 · need 2 · constraint 1 |
| Othila | 6 | home 2 · heritage 2 · inheritance 2 · letting go 1 |
| Perth | 7 | the hidden coming to light 3 · the unseen 2 · chance 2 |
| Raidho | 6 | the road 3 · natural rhythm 2 · movement 1 |
| Sowilo | 9 | sun 4 · clarity 3 · victory 1 · life force 1 |
| Thurisaz | 8 | caution 3 · thorn 3 · threshold 2 · gateway 1 · protection 1 |
| Tiwaz | 7 | justice 2 · sacrifice 2 · truth 1 · the warrior spirit 1 · courage 1 |
| Uruz | 7 | strength 3 · raw power 3 · primal force 1 |
| Wunjo | 9 | belonging 4 · joy 3 · happiness 3 · harmony 1 |

## 2. Tři runy z návrhu Gemini proti aspektům

| runa | sféra (Gemini) | aspekt v2, který ji nese | obrazů |
|---|---|---|---|
| Kenaz | Insight & Clarity | knowledge · inner light · torch | 5 |
| | Craft & Shaping | creativity · fire | 3 |
| | Drive & Friction | — | 0 |
| | Fever & Exposure | — | 0 |
| Isa | Stillness & Pause | waiting · stillness · pause | 5 |
| | Clarity & Focus | clarity through cold | 1 |
| | Fragility & Thin Ice | — | 0 |
| | Isolation & Preservation | — | 0 |
| Wunjo | Resonance & Alignment | harmony | 1 |
| | Shared Hearth & Belonging | belonging | 4 |
| | Release & Ease | (joy · happiness — jen volně) | ? |
| | Fragile Peace | — | 0 |

## 3. Co z toho plyne (bez měření kvality, jen počet)
1. **Světlá strana run už sféry má:** u všech tří run nesou dvě sféry z Gemini existující aspekty a ověřené obrazy (IS prošla bránou).
2. **Chybí stínové sféry:** Gemini u každé runy přidává 1–2 sféry ze stínu (Fever, Thin Ice, Isolation, Fragile Peace). V bance pro ně
   není ani jeden obraz. Je to totéž, co ve v2 chybí jako „druhá strana významu“ (DECISIONS 2026-11-09 (1), pokusy P16 a P20).
3. **Počet aspektů kolísá 2–5 na runu** (Algiz 2, Ansuz 5). Pevné „4 sféry na runu“ by u části run znamenalo aspekty slučovat a u jiných
   psát nové. Gemini sám píše „4 až 5“ a u Blank žádnou sféru.
4. **Kotva Gemini je 4 věty, obraz v bance 1 věta.** ~~Obraz z banky může být zdrojem scény.~~ Owner 2026-11-26: *„obrazy budou úplně
   nové“* — banka zdrojem obrazů V4 není; z inventury platí jen bod 1–3 (které sféry má runa a co chybí).
5. Fakta v návrhu Gemini, která kánon nemá (§23, neověřeno): Kenaz jako horečka/vřed (sféra Fever & Exposure); Blank jako „Wyrd / Odin“.
   Do RUNAR_MYTOLOGIE.md ani RUNAR_DESIGN.md nejsou zapsaná. Před použitím ověřit zdroj.
