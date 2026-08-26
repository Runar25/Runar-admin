---
name: oprava-promptu-odebira-vadu
description: Vadu v promptu odeber; každý PŘIDANÝ požadavek se v textu projeví jako formule
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 12b7cce8-c1bb-4d60-afe0-c53fe2a58d0b
  modified: 2026-08-26T20:37:50.683Z
---

**Oprava promptu má vadu ODEBRAT, ne přidat pravidlo.** Změřeno na čtyřech verzích carry bloku
(2026-08-25, TESTy 43–47): vítězná verze byla ta, která jen zakázala vadu („nikdy týž předmět
přenesený sem") — čistá na všech třech osách. Obě moje „vylepšení", která přidala POŽADAVEK
(„vyžádej si setkání", „nesmíš ohlašovat nesení"), držela nit stejně dobře, ale text spadl na
**mechanický**: přidaný požadavek se pokaždé projevil jako **formule ve stejném syntaktickém
slotu** („the X you carried" 3×).

**Jak to poznat:** když soudce řekne „inventura", „opakovaná konstrukce", „odškrtnutá položka",
hledej v promptu, co jsi tam přidal — ne co chybí. Model plní požadavek nejlevnějším možným
tvarem, a ten tvar je slyšet.

**Táž třída jako [[prompt-directive-makes-model-copy]]** (pojmenovaný příklad → model ho opíše).
Doklad ve velkém: na osmi ramenech se i vítězná verze stala formulí ve všech sedmi přechodech —
**co obstojí na čtyřech ramenech, nemusí obstát na osmi**, a to je vlastní nález (TESTy 49–50).
