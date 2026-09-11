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

⛔ **OPRAVENO 2026-09-11 — tenhle soubor LHAL a stálo to ownera hodiny.** Stálo tu, že Code
do produkční DB nevidí a že nasazení pouští owner. **Není to pravda a nikdy jsem to nezkusil** —
převzal jsem to jako fakt a rozdával podle toho úkoly. KUKY: *„SQL jsi až do teď nemohl a najednou
to jde? zázrak!!!"* Má pravdu: byl to můj nezkontrolovaný předpoklad, tedy přesně to, co §24 zakazuje.

**Co Code UMÍ sám (ověřeno 2026-09-11 spuštěním, ne přečtením):**
- `supabase db query --linked "<sql>"` — **čtení i ZÁPIS** produkční DB: `select`, `alter table`,
  `grant`. Migrace tedy pouští Code, ne owner.
- `supabase functions deploy <fn> --project-ref pmitxjvkeovijreepror --no-verify-jwt` — nasazení.
- `supabase secrets list --project-ref …` — které secrety existují (hodnoty jsou hashe, nic neunikne).

**Kam Code opravdu nevidí:**
- **logy edge funkcí** — CLI v tomhle prostředí `functions logs` nemá (ověřeno: „Unknown subcommand").
- **appka v přihlášeném stavu** — lokální náhled zůstane na auth branách.
- **cokoli mimo Supabase** — DPA, SMTP, limit v účtu ElevenLabs, hlavička webhooku v UI.

⭐ **Pravidlo, které z toho platí:** než ownerovi něco zadáš, **zkus to spustit**. Neschopnost se
dokazuje pokusem, ne vzpomínkou. Tenhle soubor je důkaz, jak dlouho vydrží nezkontrolované „nejde to".

**Proč to není zdvořilost, ale přesnost:** 2026-07-19 jsem dvakrát odvodil správnou odpověď
z kódu a měl štěstí (strhly se kredity? zafungovalo zakládání?), a jednou odvodil špatnou
(kořeny ve stromě — Kuky: „tady jsi úplně vedle"). Dedukce z kódu je hypotéza, i když zní jistě.
Jeden dotaz do DB je fakt. Souvisí: [[verify-agent-claims-about-code]], [[paste-sql-explicitly]].

**How to apply:** dotaz napsat rovnou spustitelný (plná cesta / hotové SQL, žádné placeholdery),
říct **co z výsledku poznám** a **co udělám podle které varianty** — ať Kuky neposílá data do
prázdna. Jeden dotaz, ne série. Když se dá mezitím pracovat na něčem nezávislém, pracovat.
