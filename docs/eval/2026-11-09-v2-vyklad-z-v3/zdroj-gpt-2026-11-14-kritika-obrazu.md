# Zdroj: GPT o 15 čteních a o obrazech Raidho, Isa, Gebo (owner sdílel 2026-11-14)

Intake, ne kánon. Owner: *„analýza od GPT, se kterou souhlasím.“* Sdílená konverzace (ChatGPT, „Kritika obrazu Raidho“); owner v ní
GPT ukázal 15 čtení z `README.md` oddíl 8 (varianty A, B1, B2, C, D). Odpovědi GPT zkráceně, klíčové věty doslova.

## 1. Ownerova slova v té konverzaci (doslova)
*„Právě ty obrazy mi přijdou jako největší brzda. třeba ISA: jediné, co se nehýbe, je vítr, ale hlavní věc je sníh a ten začne měnit
vše kolem. jak to může být stillness? gebo. mně se ten obraz líbí, ale nevím, jestli je dělaný na gebo. jak říkáš, Gebo potřebuje
vztah mezi dvěma stranami.“*

## 2. Co říká GPT
1. **Raidho, obraz** („long walk across the snowy heath … stop counting the steps“): silný, ale jen částečný — nese rytmus a plynutí,
   chybí směr; „stop counting the steps“ táhne k meditaci. Návrh: „…you find your rhythm and know which way to go.“
2. **Raidho, čtení:** nejlepší D (napětí mezi pravidelným pohybem a směrem: „You can keep a steady pace without knowing whether it
   still serves your aim“); B2 nejlepší z prvních tří; C nejslabší obraz; A význam vysvětluje příliš přímo; B1 tkanička náhodná.
   Výhrada k D: „a direction worth noticing“ lehce poučuje.
3. **Isa, čtení:** nejlepší D („You can look at what remains unchanged without deciding yet what it means“); A „the path disappears“
   podsouvá ztracený směr; B1 táhne k zakrývání; B2 „a pause makes room“ zní jako rada. Výhrada k D: „nothing needs to be made to
   move“ je příliš uklidňující — Isa může být i zablokování.
4. **Gebo, čtení:** nejlepší základ C („You can watch the water arrive and leave without calling either movement a debt“); D příliš
   analytické a „an unpaid debt“ mění význam; B2 mušle je dekorace.
5. **Jedna stavba pro všechny runy nesedí:** Raidho potřebuje napětí mezi pohybem a směrem, Isa nehybnost bez předčasného hodnocení,
   Gebo vztah dvou stran. „Pokud všechny runy dostanou stejnou interpretační strukturu, Rúnar začne znít jako jeden univerzální
   psychologický poradce, který pouze mění názvy run.“
6. **Isa, obraz — jde proti významu:** sníh se pohybuje, krajina se mění, viditelné mizí; je to obraz zakrývání a proměny, ne
   nehybnosti. Návrh: „The frozen pond holds the same reflection from morning until dusk.“
7. **Gebo, obraz — chybí druhá strana:** moře přichází a odchází, břeh je pasivní; Gebo je vztah dvou stran, které se výměny účastní
   dobrovolně. Návrhy: dvě ruce nad stolem; „Two neighbours meet at the fence, each passing over what the other needs.“
8. **Závěr:** „Nejdříve musí být správně zvolený obraz. Teprve potom má smysl testovat, jak dobře ho model dokáže interpretovat.“
   Tři kontroly obrazu: (1) symbolická správnost — odehrává se v obraze to, co runa představuje? (2) vnitřní dynamika — jsou v něm
   síly a napětí runy? (3) otevřenost — unese víc osobních výkladů a neztratí runu? Isa selhává v 1, Gebo ve 2. A obraz nemá být
   ilustrace slovníkového významu, ale „živá situace, ve které se význam runy skutečně odehrává“. Samostatná fáze: hledání správných
   obrazů před laděním promptu.

## 3. Jak to sedí s tím, co máme (CODE-read, ověřeno v kódu a docích)
1. **Pravidlo už v kánonu je a obraz Isy ho porušuje:** `RUNAR_DESIGN.md` „Délka a tvar obrazu“ bod 1 — „Obraz patří runě toho, kdo
   v něm koná.“ V obraze Isy koná sníh (padá, zakrývá). U řádku v bance není záznam o bráně; kdy a jak prošel, neověřeno.
2. **Brána identity tuhle vadu nevidí.** Ptá se „ke které runě věta patří“; sníh a ticho soudce k Ise dovedou, i když se v obraze nic
   nezastaví. Kontrola „kdo koná a co se děje“ v nástrojích nebyla → `audit-deje/README.md` (týž den; i ta obraz Isy pustila).
3. **Návrhy GPT z velké části už v bance jsou:** Isa má „The pond has iced over and waits without asking for anything“, Gebo má
   „One hand holds something out, and the other receives it“ (brána 3/3) a dva obrazy se sousedy. Chyba tedy není, že správné obrazy
   chybí, ale že vedle nich zůstaly slabé a los je vybírá stejně často.
4. **Raidho a směr:** obraz nese stránku „natural rhythm“, ne celou runu; směr nesou jiné obrazy Raidha (mohyly, stopy v jedné linii).
   Model si ale směr do čtení přidává sám (D; P3 v oddíle 8.3). Jestli má každý obraz nést runu celou, nebo jednu stránku, je
   rozhodnutí ownera — GPT soudí obraz proti celé runě.
5. **„Jedna stavba pro všechny runy“:** v2 má jednu stavbu čtení; co je pro runu vlastní, nese jen obraz, stránka a otázka runy.
   Bod 5 GPT je proto další důvod, proč je obraz hlavní páka.
