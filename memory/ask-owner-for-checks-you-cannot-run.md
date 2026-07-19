---
name: ask-owner-for-checks-you-cannot-run
description: "Když ověření pomůže a Code se k němu sám nedostane (produkční DB, přihlášená appka), vyžádat si ho po Kukym — ne dedukovat"
metadata:
  node_type: memory
  type: feedback
---

Když je něco potřeba ověřit a Code se k tomu sám nedostane, **požádat Kukyho, aby to spustil** —
místo aby se závěr odvodil z kódu. Kuky 2026-07-19: *„tam kde ti tahle kontrola pomůže a sám ji
nemůžeš dostat, tak ji po mě žádej. Aspoň to máme potvrzené."*

**Kam Code nevidí:** produkční DB (jen čtení přes SQL, které pouští owner) · appka v přihlášeném
stavu (lokální náhled zůstane na auth branách, karty mají nulovou šířku) · logy edge funkcí
(CLI verze v tomhle prostředí nemá `functions logs`) · cokoli, co závisí na reálném účtu.

**Proč to není zdvořilost, ale přesnost:** 2026-07-19 jsem dvakrát odvodil správnou odpověď
z kódu a měl štěstí (strhly se kredity? zafungovalo zakládání?), a jednou odvodil špatnou
(kořeny ve stromě — Kuky: „tady jsi úplně vedle"). Dedukce z kódu je hypotéza, i když zní jistě.
Jeden dotaz do DB je fakt. Souvisí: [[verify-agent-claims-about-code]], [[paste-sql-explicitly]].

**How to apply:** dotaz napsat rovnou spustitelný (plná cesta / hotové SQL, žádné placeholdery),
říct **co z výsledku poznám** a **co udělám podle které varianty** — ať Kuky neposílá data do
prázdna. Jeden dotaz, ne série. Když se dá mezitím pracovat na něčem nezávislém, pracovat.
