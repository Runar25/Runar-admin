---
name: proveniencia-relay-neni-rozhodnuti
description: "Tvrzení předané jinou session (relay) není rozhodnutí ownera — dohledat zdroj (lekce 2026-07-17)"
metadata:
  type: feedback
---

*Přesunuto doslova z `working-style.md` 2026-11-19 (délka docu, smoke ㉝).*

## Proveniencia tvrzení: relay ≠ rozhodnutí ownera (2026-07-17, lekce)

Když zapisuju cokoli do **kódu, §16 záznamu nebo commit message**, musí být poznat, **odkud tvrzení je**:

| Zápis | Znamená |
|---|---|
| „KUKY rozhodl / řekl" | owner mi to řekl **přímo v chatu** |
| „Cowork tvrdí / navrhuje" | přišlo **relayem** — dokud to owner nepotvrdí |
| „ověřeno na `<ploše>`" | ověřil jsem sám (pracovní strom / HEAD / probe) |

**Nevím → zeptám se ownera.** (KUKY 2026-07-17: „ano stačí se mě zeptat.")

**Proč:** Coworkův patch měl v komentáři `// Owner: jméno v každém čtení otravuje`. Zapsal jsem to jako
**přímý citát KUKYho** — do kódu, do §16 i do commit message. Náhodou to pravda byla (owner potvrdil), ale
vědět jsem to nemohl. Commit message už nepřepíšu → **vymyšlená provenience zatvrdne v projektové pravdě**
a nikdo ji později nerozliší od ověřeného faktu.

Totéž platí pro tvrzení o KÓDU (CLAUDE.md „kdo co VIDÍ") — **ověř na svém stromě, teprve pak zapiš/jednej.**
Téhož dne Cowork hlásil „claude-proxy useknutý na 528 řádků" (jeho mount); můj strom měl kompletních 675 a
esbuild čistý. Bez ověření bych „opravoval" funkční kód.

**A než začnu dělat, co Cowork navrhuje: ověř, jestli to není hotové.** Cowork vidí jen HEAD → necommitnutá
práce pro něj neexistuje. 2026-07-17 navrhoval konsolidaci tree doků, která byla hotová od 2026-07-04, jen
necommitnutá. Odtud smoke ⑫ (kanonický doc musí být v gitu).
