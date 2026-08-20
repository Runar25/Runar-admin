---
name: cowork-handoff-quality-bar
description: "Standard pro Cowork content/research/eval handoffy — 12 navyku: zaver napred, zive overeni misto pameti, znacka puvodu na kazdem tvrzeni, priznane mezery, kalibracni sada u sirokych ukolu."
metadata:
  node_type: memory
  type: feedback
---

<!-- Puvodni frontmatter od Coworku (2026-08-18). Prepsan na tvar, ktery ma vsech ~30
     ostatnich souboru v memory/ (`name` / `description` / `metadata`) — puvodni mel vlastni
     pole a jednu radku bez klice, kterou by YAML nepripojil, a hlavne nemel `description`,
     podle ktereho se rozhoduje relevance pri vybavovani. Obsah dokumentu se nezmenil.

     tema: standard pro psani Cowork->CODE/owner handoffu (obsah/research/eval, ne kod)
     priklady (odkud vzniklo, NE sablony ke kopirovani):
       2026-08-18-HANDOFF_rune-imagery-environment_COWORK_to_CODE-owner.md
       2026-08-18-HANDOFF2_rune-imagery-two-level-field_COWORK_to_CODE-owner.md
     ⚠️ ANI JEDEN z tech dvou souboru v repu NENI (overeno 2026-08-18). Ukazatel na neexistujici
     soubor posle ctenare hledat nahradu — proto tady v komentari, ne v zivem textu.
     pozn. Coworku: provenience/pochvala patri do snapshotu k 2026-08-18, ne sem
     (working-style.md: „Historie 'Hotovo' patri do snapshotu, ne do doku."). -->


# Standard pro Cowork handoffy

Ne "kopíruj tamten dokument" — konkrétní návyky, co jdou replikovat na libovolné téma.

## Forma: čtení něco stojí

Každá věta navíc je ownerův i CODE čas — hutnost je práce autora, ne čtenáře. Závěr napřed
(BLUF: zavedená technika z vojenského a zpravodajského psaní, dnes běžná i v inženýrství —
čtenář dostane odpověď hned, zdůvodnění čte, jen když chce víc). Neposílej syrový materiál
k ručnímu zhuštění — totéž pravidlo, které 2026-08-18 zakázalo posílat ownerovi příkazovou
řádku místo věty "co tenhle pokus zjistí" (`working-style.md`). Test na každou větu: mění
něco v tom, co čtenář udělá dál? Ne → pryč.

## Ověření

1. **Živě, ne z paměti — vlastní i cizí.** Než začne syntéza: živý HEAD + diff proti commitu
   handoffu. Když partner pošle souhrnnou tabulku, číst syrová data pod ní — u handoffu #2 to
   odhalilo dva nálezy neviditelné v souhrnu (jazyková divergence na úrovni fragmentu, ne
   domény; míchání dvou obrazů v jednom čtení u Blank). Vlastní i cizí tvrzení = hypotéza.

2. **Evidenční laťka platí na obě strany.** Vlastní pravidlo o vzorku (≥20–25 na tvrzení
   vzorce) platí i na cizí čísla — i když vypadají přesvědčivě, i s malým n to říct nahlas.
   Žádný dvojí metr.

## Poctivost k důkazu

3. **Značka původu na každém tvrzení.** 🔒 doložené/externí (konkrétní odkaz) · 📜 kánon appky
   · 🧩 vlastní návrh, čeká na verdikt. Nemíchat bez rozlišení.

4. **Zdroj jmenovaný konkrétně** — URL, soubor, řádek, název datového souboru. Nikdy
   "výzkum ukázal" nebo "je známo".

5. **Sporné se přizná, neuhladí.** Když jeden zdroj tváří spornou věc jako fakt a opatrnější
   zdroj ji označí za nejistou, citovat oba — nebrat si tu hezčí verzi.

6. **Mezery v nástrojích se přiznají.** Když nejde něco ověřit (síť, přístup), napsat přesně
   co ne — netvářit se, že to nebylo potřeba.

7. **Islandský OBSAH = Cowork. IS znění INSTRUKCÍ v promptu = CODE**
   (`is-done-together-not-for-sigrun.md`, KUKY 2026-08-14). Cowork píše islandsky obrazy,
   fragmenty, fasety, lore a scény — **nativně z významu (§2), ne překladem z EN**; přesně tak
   vznikly `RUNE_IMAGES` i islandské popisy světů v `rworld()` (viz `RUNAR_DECISIONS.md`:
   „obrazy jsou jen islandsky — Cowork EN verze nedodal" · „až Cowork dodá islandské popisy
   světů"). Co Coworku NEPATŘÍ, je formulace islandské **věty v promptu** (direktivy, pravidla)
   — tu si CODE napíše a ověří sám (`is-vazba`, GreynirCorrect, BÍN); poslat mu ji = kolo navíc.
   Ověření nástroji dělá CODE na všechno, co přijde.
   ⚠️ Do 2026-08-20 tu stálo holé „IS znění = CODE, ne Cowork" bez toho rozlišení. CODE-read podle
   toho napsal handoff, který Coworku **zakázal islandskou větev banky faset** — tedy jeho vlastní
   práci. Opravil owner: *„IS znění dřív Cowork dělal."*

## Rozsah a úsudek

8. **Široké/rizikové úkoly škáluj kalibrační sadou.** Ne mělce všechno, ne do hloubky jen
   jedno — malá sada do plné hloubky, zbytek jako označené semínko čekající na validaci.

9. **Kritika se opře o precedens v projektu.** Cizí důkaz se hledá, až když v projektu
   žádný není.

10. **Na vlastní úsudek dej úsudek, i zamítnuté varianty.** Ne přikývnutí na navrženou
    syntézu — řekni, co bylo zváženo a proč by to selhalo.

## Konec

11. **Měkký princip → mechanické pravidlo, kde to jde.** "Fragment, ne věta" se dá pod tlakem
    zapomenout; "žádné určité sloveso, žádná tečka na konci" jde zkontrolovat pohledem.

12. **Shrnutí + "změněno: nic."** Obsahový návrh nesmí ani vzdáleně vypadat, že sáhl na kód
    — poslední řádka to potvrdí černé na bílém.

---

Platí pro libovolný Cowork content/research/eval handoff, ne jen pro runovou obraznost.
