---
téma: standard pro psaní Cowork→CODE/owner handoffů (obsah/research/eval, ne kód)
destination: memory/
příklady (odkud vzniklo, NE šablony ke kopírování): 2026-08-18-HANDOFF_rune-imagery-environment_COWORK_to_CODE-owner.md,
2026-08-18-HANDOFF2_rune-imagery-two-level-field_COWORK_to_CODE-owner.md
pozn.: provenience/pochvala k tomuhle patří do snapshotu k 2026-08-18, ne sem —
working-style.md: "Historie 'Hotovo' patří do snapshotů, ne do doků."
---

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

7. **IS znění = CODE, ne Cowork** (`is-done-together-not-for-sigrun.md`, KUKY 2026-08-14).
   Cowork dává obsah (co se má říct), ne islandskou formulaci — CODE ověří vlastní znění
   v jednom kole s nástroji po ruce; poslat návrh Coworku jen přidá kolo navíc.

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
