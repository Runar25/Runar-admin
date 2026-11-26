# Gemini — návrh architektury a pravidel pro denní runu V4 (vložil owner 2026-11-26, doslova)

Soubor od ownera ze složky Downloads, beze změny obsahu. Tvrzení jiného modelu, ne
rozhodnutí ownera; rozbor → [runa-dne.md](runa-dne.md) oddíl 6. Značky `check-docs:ok` / `doc-values:ok` na koncích řádků přidal lab
(jména z citace, která se v kódu jmenují jinak).

---

# Architektura a pravidla tvorby: Denní runa (Rune of the Day)

Tento dokument shrnuje finální podobu, obsahovou strukturu a výrobní postup pro **Denní runu** v systému Rúnar V4. Cílem je nabídnout uživateli jednu silnou, vizuálně ukotvenou myšlenku na den, která ho nenápadně zastaví a nechá v něm rezonovat, aniž by ho poučovala nebo suplovala učebnici run.

---

## 1. Základní princip a oddělení funkcí

Systém přísně odděluje **každodenní zážitek** od **hlubšího studia**:

1. **Denní karta (Rune of the Day):**
   * Obsahuje pouze název runy, její symbol a **jednu samostatnou větu**.
   * Věta musí obstát sama o sobě i pro člověka, který o runách nic neví (není to hádanka na uhodnutí runy ani její slovníková definice).
   * Neobsahuje žádná vysvětlení ani rozbor významů přímo v denním sdělení.
2. **Studijní profil (Rune Collection):** <!-- doc-values:ok 2026-11-26: citace Gemini: Kolekce run, ne tier -->
   * Dobrovolná hlubší vrstva, kterou si uživatel otevře, pokud chce runu skutečně poznat.
   * Zde je rozebrána fyzická podstata runy, její přirozené významové oblasti (sféry) a jejich vnitřní napětí (třecí body).

---

## 2. Skladba a zdroj dat (Matice: Sféra × Režim obrazu)

Aby se denní věty při opakovaném vytažení runy neomrzely a nesklouzly k obecným motivačním citátům, skládají se podle pevné matice:

### A. Zdroj významů: Ověřené sféry z V4 labu
* Denní runa nevytváří vlastní seznam významů, ale přebírá **významové sféry přímo z V4 labu** (jeden společný zdroj pravdy).
* Každá runa má své vlastní, přirozené sféry odpovídající její podstatě (např. u *Kenaz* jsou to *Insight & Clarity, Craft & Shaping, Drive & Friction, Fever & Exposure*).
* Každá sféra prochází kontrolou překryvu, aby se významově nepletla s jinou runou.

### B. Režimy obrazu (Vizuální vrstvy)
Každá sféra se překládá do konkrétního hmotného obrazu ve dvou hlavních režimech (režim *Current* – současný civilní svět – je zatím odložen, aby nenarušil atmosféru):

1. **LAND (Islandská krajina a přírodní síly) – *Priorita 1***
   * Hlavní vizuální podpis Rúnara. Pracuje se syrovou, nadčasovou realitou severské přírody (čedič, lávová krusta, magma, ledovec, říční proud, fumaroly, mlha, příliv).
   * Obraz musí vycházet z **ověřitelných přírodních a fyzikálních faktů**.
2. **CRAFT (Tradiční řemeslo a materiál) – *Priorita 2***
   * Lidská ruka v kontaktu s hmotou (kovářská výheň, dřevo, železo, vlna, nůž, loď, kámen).
   * Civilnější rovina bez moderních dílenských klišé (žádné elektrické vrtačky ani strojní ložiska).

---

## 3. Tvrdá pravidla pro psaní denní věty (Rúnarův hlas)

Každá věta pro *Rune of the Day* musí před zařazením projít těmito pěti pravidly:

1. **Délka a forma:** Vždy **jedna jediná věta**.
2. **Třetí osoba, bez „you / your“:** Věta nikdy nemíří přímo na uživatele. Mluví o světě, přírodě, materiálu a lidské zkušenosti.
3. **Žádné rady, rozkazy ani předpovědi:** Neříkat člověku, co má dělat, čeho si má všímat („Today notice…“) ani co se mu stane. Věta funguje jako neosobní pozorování nebo přírodní zákonitost.
4. **Nezaměnitelný otisk konkrétní runy:** Věta musí nést konkrétní hmotný obraz dané runy. Pokud větu vytrhneme z kontextu, nesmí se dát zaměnit s jinou runou (např. gejzír patří spíše k *Perthro* kvůli čekání na náhodný výtrysk, zatímco *Kenaz* pracuje s kontinuálním žárem a prorážením horniny). <!-- check-docs:ok 2026-11-26: citace Gemini, v kódu Perth -->
5. **Kontrast místo dovysvětlování:** Vyhýbat se konstrukcím typu *„…protože…“* (*„…because…“*), kde druhá půlka věty jen doslovně vysvětluje první. Lepší je postavit vedle sebe dva obrazy nebo napětí a nechat mezeru pro vlastní zamyšlení čtenáře.
6. **Syntaktická pestrost:** Střídat větnou stavbu a rytmus, aby nevznikal mechanický tik (např. opakování šablony *„X does not Y; it simply Z“*).

---

## 4. Ověřený pilotní vzorek: KENAZ (Režim LAND)

Ukázka sestavení jedné runy přes všechny její V4 sféry v režimu islandské přírody:

* **Insight & Clarity** *(odhalení skrytého pod povrchem)*
  > "A fresh crack in the black lava crust reveals the bright orange glow that has been moving underneath all along."
  * *Fyzikální základ:* Čerstvě ztuhlá čedičová krusta praská pohybem tekuté lávy pod ní.

* **Craft & Shaping** *(střet živlů dávající kameni nový tvar)*
  > "Where glacial meltwater meets advancing lava, clouds of steam rise as molten rock cools into sharp, glassy stone."
  * *Fyzikální základ:* Rychlé ochlazení lávy vodou nebo ledem vytváří ostrou sklovitou strukturu (hyaloklastit / sopečné sklo).

* **Drive & Friction** *(vnitřní žár a tlak tavící cestu skrze odpor)*
  > "Magma forcing its way upward through solid basalt melts the rock along its edges until a new fissure opens at the surface."
  * *Fyzikální základ:* Vznik trhlinové erupce – magma pod tlakem proráží čedičové podloží a otevírá puklinu.

* **Fever & Exposure** *(spalující žár v chladném prostoru, nechráněnost)*
  > "Steam rising from a sulfur vent warms the freezing air around it, yet scalds any bare skin that comes too close."
  * *Fyzikální základ:* Geotermální fumaroly na Islandu mají u ústí teplotu přes 100 °C.

---

## 5. Výrobní postup pro další runy

1. **Převzetí sfér:** Vzít ověřené sféry dané runy z V4 labu (prošlé zkouškou překryvu).
2. **Návrh obrazů (Land -> Craft):** Ke každé sféře najít konkrétní, fyzikálně přesný přírodní jev (Land) a následně řemeslný obraz (Craft).
3. **Kontrola záměny:** Ověřit, zda zvolený obraz nepatří svou mechanikou k jiné runě (např. led/zastavení = *Isa*, náhlý úder z nebe = *Hagalaz*, skryté načasování = *Perthro*). <!-- check-docs:ok 2026-11-26: citace Gemini, v kódu Perth -->
4. **Tvorba islandské verze (IS):** Nepřekládat doslovně z angličtiny (vyhnout se kalkům). Napsat věty přímo v přirozené islandštině s využitím přesné terminologie (např. *hraun, sprunga, hver, jökulhlaup*) a ověřit je v korpusu / Greyniru.