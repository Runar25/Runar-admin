# Ověření mostu (v4.37) — 29 čtení produkčním modelem, 2026-09-20

Zadání a prahy stanoveny PŘEDEM (owner: „spusť to ověření"). Generováno `claude-opus-4-8`
produkčními buildery; souzeno slepě (soudci viděli holé texty pod kódy, klíč zvlášť).

| test | co měří | práh | výsledek | |
|---|---|---|---|---|
| **A** | pozná se oblast z hotového čtení? (8 oblastí, jinak vše stejné) | ≥5/8 · náhoda 1/8 | **6/8** | ✅ |
| **B** | drží čtení tvar, který rejstřík předepsal? | ≥13/15 | **15/15** | ✅ |
| **C** | studené čtení a rada | 0 | **chlad 11/29 · rada 2/29** | ❌ |
| **D** | „vhled do těžkosti" bez útěchy | 0 | **1/6** | ❌ |

## Co to znamená — vada NENÍ v mostu

Soudce testu C napsal, že vada „sedí skoro celá v závěrečné větě". **Ověřeno položkou po položce:
opak.** Z jedenácti jeho nálezů leží **v mostu 2** (D3, D5), **v těle čtení 9**.

Most sám drží tvar možnosti v **25/29 (86 %)**:

| rejstřík | poslední věta drží „možnost" |
|---|---|
| Clarity | 10/11 |
| Confirmation | 2/3 |
| General Guidance | 3/3 |
| Insight into Challenge | 7/9 |
| Reflection | 3/3 |

Čtyři selhání: `B10` (Clarity), `B21` (Confirmation — navíc imperativ „Weigh it"), `D3` a `D5`
(oba Insight into Challenge, tedy těžké znění). **Hypotéza k ověření:** těžké znění
(„said plainly, without comfort or softening") model místy čte jako pokyn vypustit i „may be".
7/9 ale drží, takže to není systematické.

## ⚠️ Dvě vady MĚŘIDLA, obě chycené útokem na nástroj (§27)

1. **Test B napoprvé dal 12/15.** Detektor tvaru neuměl „whether X or Y" ani „either X or Y" a
   naopak počítal „whether or not" jako dvě možnosti. Po opravě a kontrole na pěti ručně
   označených případech: **15/15**. Bez té kontroly by se hlásilo, že rejstřík tvar prosadí jen
   částečně.
2. **Měření hedge napoprvé ukázalo „Reflection 0/3".** Regex byl case-sensitive a míjel „Might"
   a „Could" na začátku věty. Po opravě: **3/3**.

## Co chybí

**Kontrolní rameno.** Nevím, jestli těch 9 tvrzení v těle čtení bylo i **před** mostem — dávka
měří jen v4.37. Bez srovnání s v4.35 nelze říct, jestli most chlad v těle zhoršil, zlepšil, nebo
se ho netýká. To je nejlevnější další měření: táž dávka, starší verze promptu.

`cteni.json` = všech 29 čtení i s tahy · `klic-A.json` = které čtení patřilo které oblasti ·
`generator.js` = čím to vzniklo.
