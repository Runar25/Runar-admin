# Dverg Tarot (pracovní název) — karty run s dvergy

**Samostatný produkt Agndofy. S appkou Rúnar nesouvisí** (owner 2026-10-21, DECISIONS 2026-10-21 (1)):
*„jde o produkt, který toho moc společného s appkou a Rúnarem nemá. nemá být použit pro tvorbu Rúnara. klidně to pořádně odděl,
tak aby se to nepletlo … aby na tom mohl pracovat někdo jiný než vy 4 CODE, co se zabýváte Rúnarem.“*

## Co to je
Sada **25 karet run** ve stylu tarotu. Na každé kartě je **dverg v situaci, která vystihuje význam runy** — přesně jako obrazy
na tarotových kartách. Karty fungují i jako runy: kdo chce, vytáhne si kartu a udělá si čtení sám, nebo si runu nechá přečíst
od Rúnara v appce (to je jediný dotyk s Rúnarem — výběr runy v appce, nic víc).
Možná přibudou další postavy (Freya atd.) — owner je chce napřed vidět a rozhodne, jestli patří sem, nebo jinam.

## Hranice vůči Rúnarovi (platí oběma směry)
- **Nic odsud nejde do Rúnara:** prompty, `RUNE_IMAGES`, texty čtení, katalog dvergů v `RUNAR_DESIGN.md`, appka. Rúnarovy CODE
  session (tune · read · tree · web) tady nepracují.
- **Rúnarova pravidla o dvergech tady neplatí:** v Rúnarovi je dverg „materiál pod runou“, nikdy se nejmenuje a světelné runy
  (Sowilo, Dagaz) ani Blank dverga nemají. **Tady má dverga každá z 25 run** a je to pojmenovaná postava na kartě.
- **Jediné, co se z Rúnara bere, je vzhled** — dvergové mají vypadat jako jeho rodina, proto obrázky vycházejí z toho, jak je
  popsaný a nakreslený Rúnar (čte se jen jako předloha, nemění se):
  `v2/assets/runar-fullbody.png` (character sheet), `v2/assets/sacred-palette.png` (paleta), `v2/assets/README.md`,
  `RUNAR_DESIGN.md` „Jak vypadá“.
- Zadní strana karet: vazebná runa AGNDOFA — `docs/inbox/rune-cards/agndofa-bindrune_*.jpg` (sdílí ji s kartami run ke stažení).

## Postup (ownerův)
**runa → její význam → dverg, který k ní sedí → popis postavy → prompt obrázku.** Popis má stejné části jako Rúnarova postava:
identity · personality · purpose · proč sedí runě · vzhled · co nikdy · prompt. Obrázek kreslí jiný nástroj podle promptu
a dvou předloh výš; rodinné znaky (spletené vousy, roucho, runa na čele a přívěsek s vlastní runou) se nesmí rozjet.

## Soubory
| soubor | co je |
|---|---|
| `postavy/DWARVES_25_characterizations_v0_EN.md` | 25 postav v0 (Cowork 2026-10-18), EN; § A rozpory, § D rizika, § E co chce od ownera |
| `postavy/ISA_scene_study_v0_EN.md` + `isa_panels_EN.png` | studie scény Isa |
| `puvodni-cs/` | česká první verze návrhu (`NAVRH_trpaslici-karty_v0_diskuse.md`), charakteristik a studie Isy |

## Otevřené (rozhoduje owner)
1. **Projít 25 řádků „proč sedí runě“** a říct, kde dverg význam nevystihuje (Cowork § E — jádro práce).
2. **Jména.** 13 je z kánonu (Mótsognir, Alvíss, Dvalin, Eitri, Alfrigg, Dáinn, Norðri, Suðri, Móberg, Lyngri, Durinn, Þjóðreyrir,
   Gandálfr), 12 vymyslel Cowork z obecných slov (Straumr, Þyrnir, Varði, Yndi, Hagl, Nauðr, Ársæll, Dulinn, Örvar, Jór, Speki, Lögr).
   Rizika (CODE-read 2026-10-20): Straumr / Nauðr / Lögr ve staroseverském tvaru s -r; Örvar, Ársæll, Varði, Þyrnir jsou jména
   skutečných lidí; **Gandálfr = Gandalf, Durinn a Dáinn = Tolkien** (Tolkien vzal jména trpaslíků z Dvergatalu).
   Návrh CODE-read místo vymyšlených: **doložená jména z Dvergatalu podle významu** (Wikipedia „List of dwarfs in Norse
   mythology“, sekundární): Fehu Draupnir („ten, co kape“) · Thurisaz Hepti („ten, co brání“) · Raidho Farli („ten, co putuje“) ·
   Wunjo Uni („spokojený“) · Hagalaz Frosti („mrazivý“) · Nauthiz Ónn („těžká práce“) · Jera Bildr („oráč“) · Perth Fundinn
   („nalezený“) · Tiwaz Hugstari („smělý“) · Ehwaz Vegdrasill („oř cesty“) · Mannaz Vitr („moudrý“) · Laguz Andvari (žije pod
   vodopádem). Blank: dverg je nutný (všech 25) — Gandálfr, nebo doložený Svíurr („mizející“). Islandské tvary jmen neověřeny.
3. **Další postavy** (Freya …) — ukázat, pak rozhodnout kde.
4. Název produktu, formát karty (k dispozici formáty 65 × 100 a 70 × 120 mm z karet run ke stažení).

## Kdo na tom pracuje
Vlastní session otevřená nad touhle složkou — ne Rúnarovy CODE session. Commit prefix `[dverg]`. `CLAUDE.md` repa pro Rúnara
tady platí jen v mechanice repa (commit pod svým jménem, push hned, sdílené docy přes `commit_vlastni.py`), ne v obsahu.
