# Krok 36 — podklad o runě bez obrazů, širší los prostředí; návrh, jak zasadit AREA, SEEKING a INTENTION

Datum 2026-10-30 · CODE-read · Opus (čerstvý agent na každé čtení), bez API · 12 čtení (Fehu, Uruz, Gebo, Isa × 3).
Navazuje na `krok35-vyznam-do-obrazu.md` (oddíl 4a — ownerův verdikt).

## 1. Co se změnilo proti kroku 35

1. Podklad o runě = tentýž výtah z ownerových popisů, ale **bez obrazů** (pryč voda do nádoby, zamrzání vody, pratur).
2. Prostředí obrazu z losu, širší: práce s nářadím · cesta · počasí · moře nebo jezero · zahrada nebo pole · řemeslo v dílně · tělo ·
   ulice ve městě · zvířata · oheň nebo světlo.
3. Věta 2 = význam řečený jasně a prostě (místo dalšího rozvádění obrazu, owner) · věta 3 kde přestává platit · věta 4 otázka z obrazu.

## 2. Co je na vzorku vidět

1. **Obraz z podkladu už nepřebíjí los:** Isa led 1/3 (v kroku 35 3/3), Fehu voda 1/3 (3/3), Uruz řeka 0/3 (2/3). Obrazy: pila na háku,
   mince v měšci, tání, veslař, kořen rozštěpující kámen, žhavé železo na kovadlině, otevřená ruka, vrána s lesklým kamínkem,
   uhlíky pod popelem, klih v svěrce, zamrzlý brod.
2. **Nová vada — věta 2 předčítá podklad:** když má model říct význam „jasně“, řekne ho slovy podkladu.
   1. Uruz „the power/force to change, not the answer“ ve 3/3.
   2. Gebo „belongs to both“ ve 3/3, „one side must keep paying to stay“ ve 2/3.
   3. Fehu „what comes in can go out“ ve 2/3, „what you do with what you have/hold“ ve 2/3.
3. Gebo s losem „ulice ve městě“ znovu soused (sníh před dveřmi) — 1/3; tělo a zvířata souseda nedaly.
4. Délka 56–58 slov ve 12/12.

## 3. Co z toho plyne

1. Podklad bez obrazů + los prostředí = obraz se mění podle losu (bod 2.1).
2. „Jasně řečený význam“ potřebuje, aby podklad nebyl jeden pevný text, který se dá přečíst. Runa má víc významů (owner) → podklad jako
   **několik úhlů významu**, z nichž čtení dostane **jeden** (los nebo podle oblasti). Pak není co předčítat celé a každé čtení dá jiný pohled
   — to sedí i s ownerovým nápadem na Ask „další významy runy“ (BACKLOG, Nápady pro V3, bod 11).

## 4. Návrh: jak zasadit AREA, SEEKING a INTENTION do v3

Ve v2 (kód, `v2/runar-character.js`): AREA = kam obraz dosedne (`_domainContext` + podoby `AREA_FACES` v `v2/runar-utils.js`) a které
obrazy z `RUNE_IMAGES` se smí losovat (značky oblastí) · SEEKING = rejstřík celého čtení (`_registerContext`, jedna věta) ·
INTENTION = čas (`_intentionContext`, jen single). Podoby oblastí jsou společné pro všechny runy — proto u některých run nesedí
(„work“ vyndáno 2026-09-26, kromě run, jejichž význam úsilí je).

Návrh pro v3 — každý vstup má jednu práci a jednu větu, kam míří:

| vstup | práce ve v3 | kam míří | data |
|---|---|---|---|
| **AREA** | vybere **úhel významu runy**, který k oblasti patří, a svět obrazu | věta 1 (a tím 2) | u každé runy 5–7 úhlů významu z ownerova popisu, každý se značkami oblastí, kam sedí — jako značky u `RUNE_IMAGES`. Runa sama říká, co znamená v té oblasti, svými slovy (Isa v práci ≠ „work“) |
| **INTENTION** | čas obrazu | věta 1 | obraz ukazuje, co se děje teď / co se chystá / co už proběhlo — jedna vložka do pokynu věty 1 |
| **SEEKING** | která věta nese váhu | jedna věta podle volby | Clarity → věta 2 ostřejší, jedna věc · Insight into Challenge → věta 3 řečená naplno · Reflection → otázka hlouběji · Confirmation → nepotvrzovat ani nevyvracet · General → beze změny |
| bez oblasti | úhel z losu | věta 1 | týchž 5–7 úhlů |

Proč takhle:
1. Oblast nedostane vlastní větu ani štítek — mění, **co** runa říká, ne o čem se mluví nahlas (v2 změřila, že oblast jako místo
   ve scéně přidává cesty a domy, které v obrazu nebyly — komentář u `_domainContext`).
2. Jeden úhel na čtení = žádný pevný text k předčítání (bod 2.2) a každé čtení jiný pohled.
3. Úhly pro run × oblast jsou data (§18), jedna cesta kódu; „vlídnější slova“ pro runu, které nesedí „work“, jsou prostě jiný úhel
   se značkou Career.

Co to stojí: úhly pro 25 run v EN i IS (obsah — z `RUNAR_POPISY_RUN.md`, IS napsat islandsky, ne překladem) a značky oblastí.
Pro test stačí 4 runy z tohoto labu.

## 5. Návrh testu (krok 37)

1. Napsat úhly významu pro Fehu, Uruz, Gebo, Isa (5–7 na runu, ze tvého popisu, se značkami oblastí).
2. 4 runy × 3 oblasti — schválně i kombinace, které ve v2 drhly (Isa a Gebo s Career & Creativity, Uruz s Love), SEEKING a INTENTION
   z losu = 12 čtení.
3. Měřit: pozná slepý soudce oblast ze čtení · ozvěna podkladu ve větě 2 · obraz podle losu prostředí · tvoje čtení textů.

## 6. Čtení

1. **Fehu · práce s nářadím · napětí** Fehu is value torn between holding and spending, like a saw that cuts while used and rusts on the hook. What you have counts by what you do with it, and where room opens, it grows. No gain is promised: what comes in can go out, and what stands goes dull. Which tool of yours hangs idle?
2. **Fehu · cesta · co dělá** Fehu is value that lives by moving, like coins in a traveller's purse becoming bread, a bed, a fresh horse. What counts is what you do with what you hold; where something opens, it grows if given room. What comes in can go out, and what stands still goes stale. What in your purse is waiting to move?
3. **Fehu · počasí · chvíle** Fehu shows up when something starts to move, like a thaw when meltwater begins running under the snow. What you have counts only while it flows: work, money and attention grow where they get room. Held still it goes stale; left unwatched it drains away, and nothing promises gain. What in you is still waiting under the snow?
4. **Uruz · moře nebo jezero · co dělá** Uruz is strength that rises when the way gets hard, like a rower finding one more stroke as the current turns. It brings no answer, only the force to change when the old no longer fits. It is raw, and sooner or later it shows you where your strength ends. What current are you rowing against?
5. **Uruz · zahrada nebo pole · chvíle** Uruz comes when the old no longer fits, like a root in the field splitting the stone that holds it. It is raw strength you find only when you need it, and it brings the power to change, not the answer. Untamed, it can break more than it meant to. What is your root pressing against?
6. **Uruz · řemeslo v dílně · co není** Uruz is not the polished strength of a finished blade but the raw iron glowing on the anvil, before it has a shape. When the old no longer fits, it gives you the power to change, not the answer. It is rough, and it shows your limits as plainly as your strength. Who is holding the hammer?
7. **Gebo · tělo · chvíle** Gebo is the moment your open hand lets go and another hand closes around what you gave. A real gift costs you something, your time, your trust, and makes a space that belongs to both. When one side must keep paying to stay, it is no longer a gift. What are you still holding in your hand?
8. **Gebo · ulice ve městě · co není** Gebo is a gift, not a sale: the neighbor who clears snow from your step, and now a nod passes between your doors. A gift counts because something of yours is let go, and what it makes belongs to both. A forced gift is no gift; a bond you keep paying for is debt. Who owes the nod?
9. **Gebo · zvířata · napětí** Gebo is the pull between letting go and being bound, like a crow that drops a bright stone before another crow and stays. A real gift costs something of yours, and what it makes belongs to both. When one side must keep paying to stay, it is no gift. What would you drop, and who would stay?
10. **Isa · oheň nebo světlo · co není** Isa is not a fire gone out but coals banked for the night, keeping their heat under grey ash. Something has stopped because its time has not come, and pushing will not bring it sooner. The cost is the urge to poke the coals, which only scatters the heat. What is still glowing under your ash?
11. **Isa · práce s nářadím · napětí** Isa is the urge to move against a stillness that will not give, like glue setting in a clamped joint. What has stopped is not finished; it is working where you cannot see. It stops holding when waiting turns into never picking the work up again. What in front of you is setting, and what is only stuck?
12. **Isa · cesta · co dělá** Isa holds what was moving until its time comes, like a river frozen at the ford where the road must wait. Nothing has ended; only the surface has stopped, and underneath the water still runs. It costs you when you hammer at the ice to cross early. What keeps moving beneath the ice you are standing on?

Pokyn (Isa, práce s nářadím, napětí; ostatní se liší runou a losy):

```
- 1: the meaning of ISA, said as the tension between the two forces in it, and in the same sentence one image from work with tools
     that carries that meaning.
- 2: the meaning said clearly and plainly, one step further than sentence 1.
- 3: where it stops holding, or what it costs.
- 4: one open question that grows out of the image and that different readers could take in different ways.
```
