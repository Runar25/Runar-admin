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

**Kde tohle UŽ bydlí, a tohle je jen důsledek:** `CLAUDE.md` **§19.3** — *„kontrola běží na TÉ
PLOŠE, kde bug žije"* — je totéž pravidlo pro KONTROLY; tohle je jeho tvar pro PÁKY. A
[[sanity-check-measurements]] říká totéž z druhé strany (metrika ve stropu nemůže ukázat nic,
ať páka dělá cokoli). Neduplikuje se, jen se sem dopisuje ten třetí případ: páka, která
se vůbec nedotkla vazby. Souvisí: [[measure-dont-eyeball]].
⚠️ Vzniklo 2026-09-06 BEZ předchozí kontroly, co existuje — owner: *„když něco vytváříš,
napřed zkontroluj, jestli to tam už není, a pak kde to má TAKY být."* Napraveno dodatečně.
