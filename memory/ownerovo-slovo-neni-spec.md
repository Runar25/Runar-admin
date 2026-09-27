---
name: ownerovo-slovo-neni-spec
description: "Kukyho konverzační přídavné jméno není zadání — než ho zapíšeš do docu, převeď na číslo, nebo se zeptej"
metadata:
  node_type: memory
  type: feedback
---

**KUKY 2026-09-12: „vyčerpávající je fráze. Jsi schopný ji popsat, co znamená? Asi ne — takže se máš
spíš zeptat na tvrdá data, čísla! Já napíšu vyčerpávající, ale to vychází z konverzace. To
neznamená, že to máš použít, pokud ti to vůbec neříká, co to znamená."**

Owner v řeči používá běžná slova — *vyčerpávající · delší · silnější · pestřejší*. **To je směr,
ne specifikace.** Když takové slovo přepíšu do docu jako zadání, vznikne požadavek, podle kterého
se nedá nic vyrobit ani změřit — a příští session ho čte jako rozhodnuté.

**Doloženo:** „vyčerpávající" jsem od něj převzal a nosil ho v `RUNAR_BACKLOG.md` napříč několika
zápisy o Vegvísiru, včetně vlastního návrhu „vyčerpávající = rameno jako celek". Neuměl jsem
říct, co to slovo znamená — a stavěl jsem na něm. Jakmile jsem se zeptal na číslo, dostal jsem
**90 slov** a celá ta konstrukce (víc odstavců, rameno-jako-celek) byla zbytečná.

**Jak to aplikovat:** než ownerovo hodnotící slovo zapíšeš, zkus ho **převést na číslo nebo na
pozorovatelný jev** (kolik slov · kolik odstavců · co v textu být MÁ a co NESMÍ). Když to nejde,
**zeptej se na to číslo** — jednou, konkrétně. Do docu patří to číslo; jeho slovo nanejvýš
jako citace, proč to číslo vzniklo. Souvisí: [[measure-dont-eyeball]] · [[dont-invent-fact-critical]].

**Druhý případ (2026-09-27, Vegvísir):** owner k testům řekl *„a budou jen anglicky"* a já to zapsal do DECISIONS jako
rozhodnutí o jazyce produktu. Myslel jazyk, ve kterém TEĎ pracuje: *„vegvísir nebude jen anglicky, já ho teď jako všechno
dělám anglicky. Ty ho budeš dělat i IS."* Věta o pracovním postupu ≠ produktové rozhodnutí — u čehokoli, co by ubralo IS
(primární jazyk, §2), se zeptej, než to zapíšeš jako rozhodnutí.
