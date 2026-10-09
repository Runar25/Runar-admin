---
name: gpt-rozbor-neni-zavazny
description: Rozbor čtení od GPT (luna/sol) byl jen podnět, ne nález — tlačítko zrušeno 2026-10-09; princip platí pro každého GPT soudce
metadata:
  type: feedback
---

⚠️ **2026-10-09: tlačítko rozboru i edge fn `gpt-review` ZRUŠENY** (KUKY *„Lunu už nepoužívám… zrušit úplně“*, DECISIONS 2026-10-09 (8)).
Uložené rozbory v `gpt_reviews` zůstaly. Princip níž platí dál pro každý model, který čtení posuzuje (soudce v labu, rubriky).

**KUKY 2026-09-25:** *„gpt analýza není pro nás závazná bez odsouhlasení! cokoliv řekne, se musí prověřit před tím, než se začne něco měnit. obrazy nečte moc dobře."*

Rozbor z tlačítka „GPT-6 luna" (edge fn `gpt-review`, rubrika `GPT_REVIEW_RULES` v `runar-reading.js`) je **podnět k ověření**, ne nález.
Nic v promptu, obrazech ani rubrice se nemění jen proto, že to luna napsala — napřed ověřit (produkční cesta, čtení, měření)
a pak ownerův souhlas.

**Why:** ve 2026-09-25 reportech owner označil lunin bod A za nesmysl u Fehu („You can keep every drop contained…") a Dagaz
(„the hills come back…"), u Uruzu „správné, ale pořád v obraze" — luna bere větu UVNITŘ obrazu („you" jako postava scény)
jako tvrzení o skutečném člověku. Obrazy čte doslova.

**How to apply:**
- Ownerův komentář v reportu je vstup; lunin text vedle něj je jen kontext.
- Když luna něco najde, napřed to protlač a ověř (§24) a ukaž ownerovi s doklady; teprve po jeho „ano" měnit.
- Týká se i úprav rubriky samotné: měnit ji podle ownerových verdiktů, ne podle toho, co luna tvrdí o sobě.
Souvisí: [[measure-dont-eyeball]] · [[verify-agent-claims-about-code]] · [[ownerovo-slovo-neni-spec]]
