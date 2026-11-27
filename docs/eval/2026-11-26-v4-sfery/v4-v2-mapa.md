# Co z V4 už máme ve v2, jen se tomu říká jinak (2026-11-27)

**Vlastní jen:** mapu pojmů V4 na jejich obdobu ve v2 — co je totéž, v čem se to liší a co z v2 jde vzít (data, mechanismus, poučení).
Owner 2026-11-27: *„sféry jsou ve skutečnosti jinak řečené významy run. Co dalšího dokážeme identifikovat, že máme stejně jako ve v2, i když
tomu ve V4 říkáme jinak?“* Nejde o stavění V4 z v2 (owner: *„tím neděláš V4, ale v2“*), jen o to, co už víme a máme.
Odkazy do v2: části čtení K1–K6 a vstupy V1–V12 v `docs/kostra/KOSTRA.md`; jak model pracuje se vstupy:
[../2026-11-27-jak-model-pracuje/pro-gpt-gemini.md](../2026-11-27-jak-model-pracuje/pro-gpt-gemini.md).

## 1. Totéž pod jiným jménem
| # | V4 | ve v2 | v čem se to liší | co jde vzít |
|---|---|---|---|---|
| 1 | **sféra** | **stránka runy**: slovo významu u obrazu v bance („focus on: fire“, V6), klíčová slova runy (`runar-runes.js`) | ve v2 ji vybírá los **skrytě**, člověk ji nevidí; ve V4 ji **vidí a volí** | 2–5 stránek na runu už je ([inventura-aspekty-sfery.md](inventura-aspekty-sfery.md)); chybí stínové stránky |
| 2 | **napětí, třecí bod** | druhá strana runy (P16, K3.3), obrazy s napětím (P01, K1.5), úhly pohledu z dat runy (P09: dvě strany, bod zlomu, přehlížená stránka), fáze runy (P15) | ve v2 jde do věty 3 nebo do obrazu; ve V4 je základ sféry | data P09 pro 5 run, výsledky P16 (bez nálepky 6/6) |
| 3 | **obraz pod sférou** | **banka obrazů** `RUNE_IMAGES` (190 obrazů, obraz + slovo významu) | ve v2 ~12 slov a model ho rozvine; ve V4 delší a napsaný tak, jak má zaznít. Owner: obrazy V4 jsou úplně nové | postup psaní obrazu (`docs/postup-obraz.md`), brána islandštiny |
| 4 | **režim Land / Craft** (+ jiné prostředí u některých run) | sezónní obrazy islandského roku (`SEASON_POOLS`); druh obrazu na los v labu v3 (krok 38, u Isy i jiná prostředí) | ve v2 se střídá roční období, ve V4 prostředí | zkušenost, co u které runy drží |
| 5 | **Rúnar vybere nečtený obraz** (počítadlo) | **los ze sáčku**: tentýž obraz se hned nevrátí, dva obrazy stejného motivu ne po sobě | — | mechanismus |
| 6 | **střídání losem** | los úhlu, rámce věty, tvaru konce, podoby oblasti | — | mechanismus |
| 7 | **„Let the rune choose“** | los slova významu (stránku runy volí los) | ve V4 je to jedna z voleb člověka | — |
| 8 | **volné čtení bez sféry** | **dnešní single čtení bez vstupů** | ve v2 je to výchozí stav | celé čtení v2 jako srovnání |
| 9 | **každá věta má vstup, který ji mírně pozmění** (owner 2.20) | **přesně stavba v2**: obraz + úhel → věta 1 · slovo významu + rámec → 2 · oblast + čas → 3 · tvar konce + otázka runy → 4 | ve V4 jiné vstupy (sféra, emoce) | měření, co model s kterým vstupem udělá (VSTUPY.md) |
| 10 | **čtyři věty V4** (scéna · mechanika · třecí bod · dozvuk) | K1 obraz · K2 význam · K3 dopad · K4 otevření | věta 3: ve v2 míří na oblast člověka, ve V4 na napětí runy | pravidla K1–K4 a známé vady |
| 11 | **emoce jako skrytý pokyn pro hlas** (owner 2.21) | **co hledá → tvar konce** (`SEEK_SHAPE`): člověk zvolí „Clarity“, model dostane jen tvar; oblast filtruje obrazy; pocit jen v labu (P10) | emoce ve v2 v produkci nikdy nebyla | mechanismus volba → skrytý text; P10: pocit jako slovo pojmenován 4/4 |
| 12 | **otázky k sebepoznání, dveře do Asku** | **otázka runy v Kolekci** (jedna na runu, zdroj konce K4) a **tipy Asku** (*„What does {rune} mean in this reading?“*, *„Explain {rune} without the image“*, tipy podle tvaru konce K6.1) | ve V4 otázka ke sféře, ne k runě | znění, která fungují (RUNAR_DESIGN „Slova“ bod 5) |
| 13 | **čipy Asku** (v práci · s druhým · uvnitř · životní runa) | **oblasti** (8, např. Career & Creativity, Love & Relationships, Inner Growth) | ve V4 až v Asku, ve v2 před čtením | měření oblasti ve v2 (projeví se hlavně ozvěnou slova) |
| 14 | **Odraz / fokus** (Gemini: co člověk dělá, 2 věty) | vlastní otázka (V11, jen admin), oblast | — | — |
| 15 | **runa dne** | **runa dne v2** (knihovna vět, neopakuje se) | jiný obsah (obraz i význam, třetí osoba) | knihovna a počítadlo |
| 16 | **Kolekce run se sférami** | **Kolekce run** (tvar runy, text runy, otázka runy) | ve V4 přibude vrstva sfér | text runy je zdroj pro K4 a ✦ |
| 17 | **životní runa v Asku** | životní runa jako tiché pozadí čtení a Asku | — | měření (seznam klíčů navíc nic nepřidal) |
| 18 | **jádro hlasu, těžké runy, islandština** | J1–J7, `HEAVY_RUNES`, Greynir | — | celé |
| 19 | **test záměny (4M1)** | M3 slepí soudci runy (kalibrováno 2026-11-23) | — | soudci |
| 20 | **Norny** | spready v2 (tři runy, pozice) | ve V4 pozice vybere sféru | — |

## 2. Co ve v2 nemá obdobu (opravdu nové ve V4)
1. **Člověk význam runy vidí a volí** (sféra). Ve v2 je význam skrytý v losu.
2. **Text obrazu je předem napsaný a ověřený**; model ho jen upravuje. Ve v2 píše model celé čtení.
3. **Emoce** jako vstup v produkci.
4. **Paměť objevování** — které stránky runy člověk už viděl. Ve v2 se ukládá deník čtení, ale přehled stránek runy ne (jestli se ukládá
   slovo významu z losu, neověřeno).
5. **Sféry ve spreadu** vybrané pozicí (Norny).

## 3. Co z toho plyne (návrh labu 🔶)
1. Většina **mechaniky V4 už ve v2 běží a je změřená**: los ze sáčku, vstup na každou větu, skrytý text za volbou člověka, soudci. Nová je
   hlavně **viditelnost a volba významu** a **předem napsaný text**. Testovat tedy hlavně to nové.
2. Sféry nezačínají od nuly: stránky runy z banky v2 a ownerovy popisy run jsou výchozí materiál; nové jsou hlavně stínové stránky.
3. Poučení o chování modelu z v2 (doslovnost, formule, vyslovené slovo z pokynu) platí i pro V4, dokud se neukáže opak.
