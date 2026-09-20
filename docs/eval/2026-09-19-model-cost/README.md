# Cenová sonda — data a slepé obsahové posouzení

- `readings.json` — 16 čtení (2 scénáře × 4 modely × 2 jazyky), produkční prompty, token usage.
  Kódování opraveno 2026-09-20 (PS 5.1 Invoke-RestMethod dekódoval UTF-8 jako latin-1).
- `slepe-soudy.json` — slepé porovnávací soudy (kódy K1–K4, klíč uvnitř), gramatika s BÍN+korpusem,
  adversariální obhajoby nařčených frází. 2026-09-20.

## Slepé pořadí (1.–4. v každé skupině)

| model | S1 EN | S1 IS | S2 EN | S2 IS |
|---|---|---|---|---|
| claude-opus-4-8 (produkce) | 3 | 4 | 2 | 1 |
| claude-opus-5 | 2 | 3 | 1 | 2 |
| gpt-5.6-sol | 1 | 1 | 3 | 3 |
| gpt-5-2025-08-07 | 4 | 2 | 4 | 4 |

## Potvrzené tvrdé IS chyby (nástroj + adversariální obhajoba neuspěla)

- **gpt-5**: „á brún hjallarins" (tvar v BÍN neexistuje) · „vindurinn telur í lengri tíðum"
  (vymyšlená kolokace, korpus 0). V S2 navíc s přímým dokladem BÍN/korpus, bez obhajoby
  (limit 6 obhajob/skupinu): „ljósnið" (slovo neexistuje) · „endurteknum snertum"
  (substantivum snerta neexistuje, správně snertingum) · „láta sjá til sín" (idiom je
  „láta sjá sig"; korpus 4021 vs 0).
- **claude-opus-4-8 (produkce)**: „í þeirri klaka" (klaki kk → þeim).
- **claude-opus-5**: „sviður" (svíða → svíður; tvar v BÍN neexistuje).
- **gpt-5.6-sol**: „lét lítið rúm eftir" (kalk „left little room"; správně „skildi eftir
  lítið rými" / „gaf lítið svigrúm").

## Vyvrácená nařčení (poučení pro IS kontroly)

Obhajoby zabily 3 nálezy typu „u substantiva s určitým členem musí být slabé adjektivum":
u **stavových (stage-level) adjektiv** je silný tvar v korpusu normou („í blautu grasinu" 50×,
slabý 0×; „blautu malbikinu" 14× vs 0). Slepé vymáhání téhle poučky = falešné pozitivy.

## Hranice nálezu

n = 1 čtení na model a skupinu · 1 soudce na skupinu · styl je subjektivní — pořadí je
pozorování, ne měření. Tvrdá fakta: gramatika (BÍN + Risamálheild), délky, formát.
gpt-5 poslední ve 3 ze 4 skupin u 3 nezávislých soudců; jediný rozbil tvrdé limity
(S1 EN 65/45 slov; S2 IS 9 vět/205 slov proti 5–6 větám).
