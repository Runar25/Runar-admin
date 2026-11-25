---
name: soudce-vidi-jen-co-uzivatel
description: "Slepý soudce smí dostat jen to, co vidí uživatel (text čtení + UI), nikdy obsah promptu (obraz, aspekt); a výstupy před nasazením přečti SÁM očima uživatele"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 12b7cce8-c1bb-4d60-afe0-c53fe2a58d0b
  modified: 2026-09-29T18:22:06.881Z
---

Slepý soudce hodnotící čtení dostává **jen to, co uživatel skutečně vidí** — text čtení a to, co ukazuje aplikace (jméno runy, oblast).
**Nikdy** obsah promptu: text obrazu, aspekt, pokyny. A než cokoli nasadím, **přečtu vygenerované texty sám jako uživatel**, který prompt nezná.

**Why:** 2026-09-29 jsem nasadil perspektivu B (obraz ze strany zvířete, bez „you“). Čtení pak začínalo *„She waits at the grass edge…“* —
kajka v textu nepadla, protože obraz je jen v promptu. Soudce měl u každého čtení řádek `PICTURE: …`, zájmeno si doplnil a dal „jasné 7/8“.
Texty jsem měl před sebou a nepřečetl je jako uživatel. Owner to našel prvním přečtením: *„máš tam she, ale uživatel nezná obraz… to, že
jsi to neodhalil, znamená, že jen slepě následuješ, a ani jsi to nezkontroloval!“* B stažen týž den (RUNAR_DECISIONS.md 2026-09-29 (2)).

**How to apply:**
- Při stavbě zadání pro soudce projdi každé pole: vidí tohle uživatel v aplikaci? Pokud ne, ven. Potřebuje-li kritérium obraz
  (např. „bere runa cizí děj z obrazu?“), rozděl otázky: ta, co obraz potřebuje, zvlášť; srozumitelnost vždy BEZ obrazu.
- Před nasazením si přečti aspoň pár výstupů z každého ramene celé, bez promptu v hlavě: dává každé „she/he/it/they“ smysl jen z textu?
- Souvisí: CLAUDE.md §25 B (útok na nástroj), [[break-your-own-work-before-reporting]], CLAUDE.md §24.

**Sloučeno 2026-11-25 z gpt-rozbor-neni-zavazny a you-neni-prohresek — nález soudce je podnět, ne vada.**
- **Rozbor od modelu (GPT luna/sol, rubrika, slepý grader) není závazný** (KUKY 2026-09-25: *„gpt analýza není pro nás závazná bez
  odsouhlasení! cokoliv řekne, se musí prověřit… obrazy nečte moc dobře.“*). Napřed protlač a ověř (CLAUDE.md §24), ukaž ownerovi s doklady,
  měň až po jeho ano. Ownerův komentář v reportu je vstup, rozbor vedle něj kontext; rubriku měň podle ownerových verdiktů. (Tlačítko
  rozboru a edge fn `gpt-review` zrušeny 2026-10-09; princip platí pro každého soudce.)
- **„you“ ve čtení není prohřešek.** Je to postava scény, oslovení, obraz. Soudce, který hlásí „you“ bez kontextu, měří slovo, ne vadu
  (táž past jako honba za „already“). KUKY 2026-09-30: *„soudce kouká jen na you a nekouká na kontext!! … buď s tím něco udělej, nebo mi to
  nepiš!!!“* Takový nález ownerovi nepředávej — přečti celý text jako uživatel (je to výrok o jeho skutečném životě podaný jako fakt?), nebo
  nástroj oprav či vyřaď. Hranice tvrzení o člověku → RUNAR_DESIGN „Cold reading“ (Definice).
