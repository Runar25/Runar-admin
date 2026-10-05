---
name: testovani-jedne-runy-je-zamer
description: Owner testuje jednu runu opakovaně ZÁMĚRNĚ (týž obraz, táž oblast a hledání → co model udělá jinak); jeho pozorování nevysvětluj jeho metodou, dohledej konkrétní případ
metadata:
  type: feedback
---

Owner (KUKY) testuje opakovaně tutéž runu (2026-10: Hagalaz desítkykrát) **schválně**: chce vidět týž obraz víckrát a jestli
ho model při stejné oblasti a hledání řekne stejně, nebo jinak. *„Tomu se říká testování."*

**Chyba 2026-10-05:** jeho „pořád stejné obrazy" jsem odbyl větou, že jde „hlavně o efekt testování jedné runy". Myslel tím
**konkrétní obraz** (trajekt u Hagalazu, který mu přišel špatný) — to jsem přešel.

**Why:** jeho pozorování z testování je signál o produktu, ne vedlejší efekt jeho metody. Vysvětlit mu, proč vidí, co vidí,
jeho vlastním postupem = poučovat ho o tom, co dělá úmyslně, a minout to, co hlásí.

**How to apply:**
- Když napíše „pořád stejné X" / „X se opakuje", hledej **konkrétní případ** (reporty, databáze čtení, `prompt_draws`) a ukaž
  ho s textem čtení ([[always-show-reading-samples]]); nenajdeš-li ho, zeptej se, který myslí.
- Nekomentuj jeho testovací metodu, pokud se na ni neptá. Opakování obrazů smí být nález jen o bance (kolik obrazů runa má),
  nikdy výtka k tomu, jak testuje.
- Jeho test (týž obraz × táž oblast × hledání) podporuj nástroji: databáze čtení v shrine (runa → obraz → všechna čtení).
