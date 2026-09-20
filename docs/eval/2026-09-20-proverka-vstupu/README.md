# Prověrka vstupů promptu + handoffu (2026-09-20)

Owner: *„ještě jednou prověř, že CODE-read nezapomněl na nějaké vstupy, jelikož už jeden zapomněl
a to byl úhel."* Čtyři agenti proti kódu, každý s vlastním zadáním; `proverka.json` = plný výstup.

## Hlavní číslo

Produkční single prompt má **38 rozlišitelných proměnných vstupů**. Mapa CODE-read („kam který
vstup dosedne") jmenuje **7**, z toho **5** jsou skutečné vstupy (místo · úhel · jméno runy ·
jméno člověka · aspekt). Zbylé dva vstupy nejsou: **„most"** v době měření nebyl v žádném
builderu (byl to návrh), a **„you stand"** je EFEKT, ne vstup — vyráběl ho ENDING_OPEN[1],
přepsaný 2026-09-20 (6/6 → 0/6).

## Co v mapě chybí a rozhoduje o výsledku (výběr z 20)

- **obraz sám** — nejsilnější vstup vůbec, los ze 108 řádků
- **los délky** (3 věty/38–45 slov vs 4 věty/50–58) — mění, kolik místa zbude na konec
- **tvar konce** (vlastní los) + **těžkost runy** (6 run z 25 přepíná celý pool)
- **čočka životní runy** — 3 nezávislé přepínače na tutéž poslední větu
- **oblast**, **co hledám**, **záměr**, **otázka** — čtyři uživatelské volby, každá s vlastním blokem
- **neviditelné**: sezónní kbelík, sáček proti opakování a guard motivu v localStorage — mění
  rozdělení losu podle zařízení a historie čtení téhož člověka

## Adversariální protipříklad (samostatný agent, 849 řádek promptu)

Seznam byl **neúplný** i po první inventuře — přibylo mj.: tier a stav kreditů (rozhoduje, které
pilulky smí člověk vůbec zvolit), `_lifeWasDrawn` (třetí přepínač čočky), hlasový profil (mění
i zprávu, ne jen systém), a prázdné jméno („you"/„þú") — to **vypíná celý los umístění jména**.

## Mrtvé páky (odpověď na „co dalšího proměnlivé")

`READING_ASPECTS` · `IMAGERY_SOURCES` · `READING_REGISTERS` · `RUNE_PLACEMENTS` — čtyři pooly
s losovacími funkcemi, které **nikdo nevolá**. Ověřeno `git log -S` přes produkční soubory:
**nikdy v produkci nebyly**. Vznikly 2026-06-06 jako „shrine only", jejich jediným volajícím byla
záložka V2 LAB, smazaná 2026-07-10 (c6eb89c) jako duplikátní drift plocha. Nezemřely tedy na
vadu obsahu — zemřely s hostitelem.

| páka | dnešní ekvivalent | verdikt |
|---|---|---|
| RUNE_PLACEMENTS (kde padne jméno runy) | mechanismus ano (`_namePlacement`), předmět ne | **nejobhajitelnější návrat** — precedens funguje |
| READING_REGISTERS (citová teplota) | **žádný** | největší díra, ale hrozí 3. hlasový mechanismus |
| READING_ASPECTS | `_imgAspekt` plní tentýž slot `focus on:` | kolize §20 — jen jako náhrada, ne vedle |
| IMAGERY_SOURCES | `RUNE_IMAGES` (kurátorovaná banka) | návrat = recidiva, banka je silnější |

## Co z prověrky vzešlo za opravy

Dvě tvrzení z téhož dne neobstála a jsou opravená v `RUNAR_DECISIONS.md` 2026-09-20 (5):
filtr sezóny je hrubý (72/108 `any`), a most „dvě možnosti" je návrat volby, který §26 chce
pojmenovat. Dvě díry šly do `RUNAR_BACKLOG.md` (cizí měsíc v obraze · los délky mimo prompt_draws).
