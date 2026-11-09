# V3 k ledu — co je hotové, co zbývá a kde začít, až se k ní vrátíme (CODE-read, 2026-11-09)

Owner 2026-11-09: *„V3 dáváme teď k ledu. Zapiš, co je potřeba, ať se to neztratí, až se k tomu vrátíme. Co teď chci: implementovat do v2 to, co jsme
se snažili dostat do V3.“* Rozhodnutí → `RUNAR_DECISIONS.md` 2026-11-09 (1). Co z V3 jde do v2 → [../2026-11-09-v2-vyklad-z-v3/README.md](../2026-11-09-v2-vyklad-z-v3/README.md).
**Tenhle soubor vlastní jen jednu věc:** vstupní bod pro návrat k V3 — stav, otevřené věci a pořadí prvních kroků. Pokyny, měření a znění
vlastní soubory níž; tady se neopisují.

## 1. Kde co leží
| co | soubor |
|---|---|
| platné pokyny ownera pro V3, se stavem ✅ ⚠️ ❌ (A–G, body 1–57) | [zadani-v3.md](zadani-v3.md) |
| co je u kterého kusu promptu v2 změřené, na kterém modelu | [mapa-promptu.md](mapa-promptu.md) |
| návrh promptu V3 kus po kusu, výsledky testů v GPT a na solu (oddíly A–O) | [prompt-v3-navrh.md](prompt-v3-navrh.md) |
| definice Rúnara (6c schválena do testů, 6e proč Agndofa a povaha ven) | [definice-runara.md](definice-runara.md) |
| moderní významy 25 run od GPT (základ · další · stín), neověřené (F32) | [moderni-vyznamy-25-zdroj.md](moderni-vyznamy-25-zdroj.md) |
| kroky labu 1–47 (Opus 5.5 přes agenty) a jejich čtení | `krok*.md` v této složce |
| zdroje od ownera doslova (rozhovory s GPT, čtení z GPT, čtení ze solu) | `zdroj-*.md`, `krok44-zdroj-gpt.md` |

## 2. Co víme (jen výsledky; čísla v odkazech)
1. Definice Rúnara sama scénu nepřinese; definice obrazu ano (GPT chat 10/10 různých scén) — `prompt-v3-navrh.md` K, M.
2. Plný prompt V3 s očíslovanými částmi dělá šablonu (4 věty 9/10, „When…“ 8/10, „What…“ 9/10) — tamtéž I.
3. Sol (`none`) na témže promptu jako GPT chat sedne bez losu na jednu scénu (9/10), opisuje vstup a bere „means“ — tamtéž N.
   GPT chat podle ownera běží na solu s medium effort, takže rozdíl může být z přemýšlení; neměřeno.
4. Druhá strana významu přijde sama uvnitř scény, když je dána jako vstup, bez nálepky (10/10 v GPT) — tamtéž M.
5. Charakter v hustém zadání na Opusu nic měřitelného nedělá; tón ani sol neměřeny — `krok47-charakter-ubiranim.md`.

## 3. Co zůstalo otevřené
1. Medium effort × `none` na solu na stejném promptu (vysvětlí bod 2.3).
2. Řada oddělených testů `prompt-v3-navrh.md` L: hotové 1 (definice obrazu) a 2 (pořadí); zbývá dodaný obraz × obraz od modelu, otázka na konci,
   připomínka délky, zákazy. Napřed na solu, ne v GPT chatu (bod 2.3).
3. Pestrost na solu: los polohy, slovesa a prostředí scény (jako ve v2).
4. Data: úhly moderních významů se stíny a značkami oblastí na 25 run; mapa aspekt obrazu → moderní význam; ověřit tabulku GPT (F32).
5. Ownerův verdikt k všedním obrazům z testu 1 (recept, kolo, fronta) — nevyřčen.
6. Nezačaté pokyny: fáze runy (F34), významy, které do sebe zapadají (F38), čtení z pocitu (F39), nic, co runě sedí, nevyřazovat (F40),
   závěr nikdy z jedné runy (F44 — všechny testy od 11-05 jen Raidho).
7. Islandština V3: nic.

## 4. Kde začít, až se vrátíme
1. Přečíst tenhle soubor, `zadani-v3.md` a `prompt-v3-navrh.md` oddíly F–O.
2. Zjistit, co z V3 mezitím přešlo do v2 a jak to dopadlo (`docs/eval/2026-11-09-v2-vyklad-z-v3/`) — to se do V3 nepřebírá znovu, jen výsledek.
3. Bod 3.1, pak řada 3.2 na solu, pak data 3.4.
