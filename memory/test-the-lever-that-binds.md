---
name: test-the-lever-that-binds
description: "Než změříš páku, ověř, že je to ta, která výsledek skutečně svazuje — jinak test proběhne naprázdno"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 12b7cce8-c1bb-4d60-afe0-c53fe2a58d0b
  modified: 2026-09-06T15:52:36.299Z
---

**Než pustíš test páky, ověř, že hýbeš tím, co výsledek OPRAVDU omezuje.** Doloženo vlastní
chybou 2026-09-06 (TEST ASK2): testoval jsem, jestli delší Ask odpověď pomůže — zvedl jsem
`max_tokens` ze 140 na 300, **ale v promptu zůstalo „no more than about 40 words"**. Model
poslechl prompt, ne strop. Celá cela proběhla naprázdno a musel jsem ji opakovat.

**Jak to udělat správně:** vytiskni si sestavený prompt a **najdi v něm tu vazbu, kterou chceš
hýbat** (grep na číslo, na slovo „words", „sentences", „short"). Když tam je, měň JI. Strop
tokenů je pojistka proti useknutí, ne délková páka.

**Táž třída chyby jinde:** kontrola běžící na proxy ploše (CLAUDE.md §19.3), nebo měření
prompt-cesty, kterou produkce nepoužívá. Vždycky se ptej: **co ten výsledek reálně drží?**
Souvisí: [[measure-dont-eyeball]] · [[sanity-check-measurements]].
