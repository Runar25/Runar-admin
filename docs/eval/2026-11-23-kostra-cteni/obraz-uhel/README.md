# Obraz × úhel: které úhly obraz unese (P21)

Owner 2026-11-24: „některé obrazy potřebují možná i jiný pohled úhlu … na základě toho, co SOL přidává, odhadnout, co ten úhel bude
v obrazu hledat, popřípadě vytvářet nový předmět“.

**Data:** `znacky-obraz-uhel.json` — všech 190 EN obrazů z `RUNE_IMAGES` × 6 úhlů v losu (bez [3]). U každého úhlu přesná citace
z obrazu, která dodá, co úhel chce (celek, nejmenší detail, pohyb, skryté, okraj, místo pro člověka); prázdná = obraz to nemá a model
si to nejspíš vymyslí (`likely_invention`). Značkovali 3 agenti naslepo (bez výsledků čtení), každá citace ověřena jako přesný podřetězec.

**Měření (44 produkčních EN čtení sol, výsledek „přidal předmět/děj kvůli úhlu“ z dřívějšího rozboru):**
- kombinace bez citace (past): model přidal v 7 z 25 (28 %)
- kombinace s citací (kryto): 1 z 19 (5 %)
- hranice: n malé, jedno čtení na kombinaci; 9 čtení nešlo spárovat (většinou vyřazený úhel [3]); hraniční značky (okraj jako
  „tání“, „čeká“ jako ticho) agenti počítali jako kryté — čísla krytí jsou horní mez.
- dřívější slepý soudce bez citačního pravidla: 6/14 pastí, žádný planý poplach; s pravidlem bez citací 11/14, ale 17 planých — proto
  citace jako značka, ne verdikt soudce.

**Banka:** kryto 449 z 1140 kombinací (39 %). Kolik úhlů obraz unese: 0 → 11 obrazů, 1 → 37, 2 → 53, 3 → 58, 4 → 23, 5 → 8.
Po úhlech (z 190): celek 69 · nejmenší detail 56 · pohyb 127 · skryté 54 · okraj 59 · člověk v obraze 84.

**Návrh (čeká na ownera):** úhel losovat jen z úhlů, které obraz unese (data u obrazu, jedna cesta kódu). Obrazy, které neunesou žádný,
potřebují buď doplnit obraz, nebo výchozí úhel. Ověření před nasazením: stejné obrazy, úhel kryto × past, sol (klíč pro laby vypršel).
