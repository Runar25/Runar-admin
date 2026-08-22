---
name: a-guard-that-refuses-is-a-detector
description: "Kontrola „přepiš jen když je výskyt právě JEDEN\" není jen pojistka — je to detektor duplikátů, který hlídá zadarmo při každé změně"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 12b7cce8-c1bb-4d60-afe0-c53fe2a58d0b
  modified: 2026-08-15T16:44:01.200Z
---

Patch skripty v tomhle projektu odmítají zapsat, když hledaný řetězec nemá **právě jeden**
výskyt (`if count != 1: FAIL, nic nezapsáno`). Bralo se to jako pojistka proti přepsání
špatného místa. **Je to ale hlavně detektor.**

**Doloženo 2026-08-15.** Měnil jsem jednu větu v `DEF_CHAR_EN.personality`. Guard odmítl:
`count=2`. Ta věta byla v souboru dvakrát — podruhé v `DEF_CHAR_V2_EN` (co to je a proč je to
problém → RUNAR_BACKLOG.md, položka DEF_CHAR_V2_EN; už rozešlá s produkcí),
a komentář nad ní tvrdil *„Used ONLY in the Shrine V2 lab tab"* — jenže ta záložka byla
odstraněná měsíc předtím. Bez guardu bych přepsal jeden výskyt, druhý nechal a **rozdíl by se
prohloubil**. Nenašel to úsudek, našlo to odmítnutí zapsat.

**Proč je to silnější než hledat duplikáty schválně:** guard běží **při každé změně**, na tom
místě, kterého se zrovna dotýkáš, a stojí nula. Cílené hledání duplikátů je jednorázová akce,
kterou někdo musí chtít spustit. Guard najde přesně ty duplikáty, na kterých **záleží dnes** —
protože jsou v cestě práci, kterou zrovna děláš.

**Jak z toho vytěžit víc:**
1. `count != 1` **nikdy neobcházej** rozšířením kotvy, dokud nezjistíš, **proč** jsou dva.
   Rozšířit kotvu je správné až poté, co víš, co je ten druhý výskyt zač.
2. Když je druhý výskyt mrtvý kód, **oprav u něj komentář** (§26) — nestačí ho obejít.
   Zavádějící komentář u mrtvého kódu je horší než ten mrtvý kód.
3. Nález zapiš (§22) a **udělej z něj stálou kontrolu**, jestli to jde
   (`scripts/utils/test_*.js`), ať to nezáleží na tom, jestli se toho místa zas někdo dotkne.

Souvisí: [[break-your-own-work-before-reporting]] · [[fix-or-log-duplicates-and-errors]] ·
[[one-patch-script-path]] · [[guard-test-the-lifecycle]].
