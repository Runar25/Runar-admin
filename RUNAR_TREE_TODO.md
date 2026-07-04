# RUNAR_TREE_TODO.md — Founding Ritual lab: co je HOTOVO vs CO DĚLÁME
# 2026-06-16 · jediný zdroj pravdy o stavu (ať nevzniká zmatek)
# Lab: v2/tree-lab-ritual/ritual.html  ·  build vidíš vlevo dole na stránce
# Engine = crown-composer (tree-lab-crown-composer) 1:1, poháněný reálnými čteními (log).
# Pravidlo: děláme JEDEN bod po druhém. KUKY zkontroluje → další.
# Pravidlo 2 (KUKY 2026-06-16): KAŽDÝ nový nález/bug sem hned zapsat (ať to máme pod kontrolou).
# Pravidlo 3 (KUKY 2026-06-16): Crown-composer ENGINE (growBranch/spojitá limba/fraktál/paint)
#   se NESMÍ rozbít. Měnit smí JEN "kam" větev vyjde, ne "jak" se kreslí. Změna sahající k enginu
#   = minimální + OTESTOVAT (engine drží?) PŘED prohlášením za hotové + snapshot. Když by změna
#   měla engine rozbít → STOP, vymyslet bezpečnou cestu. (Per-čtení větve engine rozbily → zahozeno.)

---

## 🌳 SMĚR DALŠÍ FÁZE (schváleno 2026-06-17) → RUNAR_TREE_BOUGHS.md
Strom = **hierarchie ramen** (per-runa): kmen → ≤5 elementových ramen → runy se odštěpují
v místě své Norns zóny (vedoucí runa vede, slabší se oddělí dřív = růst do šířky) → twigy.
Řeší hlukování + regresi do středu + dává roli vazbám. Engine-safe (rekurze už v growBranch je,
mění se jen kompozice, ne kreslení). **Detail + otevřené otázky + první prototyp = RUNAR_TREE_BOUGHS.md.**
Stavět až po doladění (KUKY ladí v chatu na cestách) + na KOPII. Body 7-12 níž se do toho vstřebají.

## 🐞 LOG NÁLEZŮ (bugy / postřehy, chronologicky)
- **[OPRAVENO] Norns zóny se kupily** (attachAt přiskakoval na nejbližší řídký bod pramene →
  všechny urð na stejném bodě). → interpolace na přesnou výšku. (build 1781592455)
- **[VYŘEŠENO pozn.] „větev = element-téma" → teď „1 čtení = 1 větev"** (bod 5 / volba B).
- **[OPRAVENO] Výběr runy „zamrzlý".** U single po výběru runy nešlo kliknout na jinou (kód
  vracel při plném počtu). → toggle (klik na vybranou = odznačit) + u single klik na jinou =
  nahradit; vybrané runy se zvýrazní zlatě. (build po 1781571037)
- **[OPRAVENO] Větve přeskakovaly mezi sebou** při přibývání čtení / růstu věku (proporční
  `assignBranchEls` + nejčastější runa tématu se měnila). → stabilní slot = N-té téma dle
  pořadí prvního výskytu; runa tématu = první viděná. (build 1781571037)
- **[OTEVŘENO] Strom stárnul moc rychle** → bod 1: zpomaleno, růst od dne 1 (`growthPerCast`
  default 10, posuvník 1–60). HOTOVO, čeká na potvrzení KUKYm.
- **[OTEVŘENO / pozn.] Model je „větev = element-téma" (max ~9 větví), ne 1 čtení = 1 větev.**
  KUKY chce „vidět co každá větev nese". Dořešit u bodu 5 / detailu (per-čtení čitelné větve).

---

## ✅ HOTOVO (funguje v aktuálním buildu)
- Crown-composer engine jako základ: kmen (prameny), koruna, růst s věkem, kůra/paint.
- **Kořeny: VYKRESLENÍ + růst s věkem + barva (HOTOVO vizuálně.)** ← root rendering hotový.
- Driver = reálná čtení: log v localStorage, persistované, RESET/COPY STATE/+10 test.
- Založení = baby strom (3 prameny → 3 výhonky obarvené 3 Nornami) + kořeny.
- Life rune (z DOB) = kmen.
- Výběr run z mřížky jako v readeru + spready + formulář (area/intention/seeking).
- Barvy elementů + posuvník tlumení (0 = kůra, 1 = plný element).
- Inspekce: klik na větev → runa / element / aett / world / count (zatím základní).
- Build razítko + no-cache (řeší cache prohlížeče).

## ❌ NENÍ HOTOVO — fronta (potvrzeno KUKYm, děláme po jednom)

**1. Zpomalit stárnutí.** Teď ~30 dní/čtení = moc rychle. KUKY: růst od **1 dne**, pozvolna.
   (posuvník „rust/cteni" na 10 je lepší, ale chce začínat od 1.)

**5. ✅ HOTOVO (engine-safe, čeká na potvrzení) — Norns osa = svislá zóna.** B (1 čtení = 1 větev)
   ROZBILO engine → zahozeno (snapshot ritual-stable-v2). Místo toho: zóna = **posun výšky výstupu**
   větve (blend se skeletonem, posuvník `zoneBias`: 0=engine/skeleton, 0.5 default, 1=plná zóna).
   Engine (limby/fraktál) netknutý. Větve = element-témata (≤9) umístěná po Norns ose (urð dole /
   verðandi střed / skuld nahoru). Snapshot ritual-stable-v3.
   POZN.: per-čtení detail „co každá větev nese" tím NEřešíme (vrátilo by per-čtení). Vyřešit jinak
   později (inspekce vypíše čtení tématu / journal), NE rozbitím enginu.

**6. ✅ HOTOVO (engine-safe, čeká na potvrzení) — Area = strana.** Levá = dovnitř/osobní
   (Love/Healing/Family/Inner/Spirit), pravá = ven/svět (Purpose/Career/Crossroads). Posuvník
   `sideBias` (0=engine, 0.4 default, 1=plná area strana), blend úhlu výstupu, engine netknutý.
   Snapshot ritual-stable-v4 (build 1781650419).

**7. Spread = komplexita** (rozepsáno níž — KUKY chce vidět návrh, ať to neudělám špatně).

**8. Počet vyplněných polí = váha větve** (rozepsáno níž — KUKYmu to zatím nedávalo smysl).

**9. Čas od posledního čtení = bonus (pauza → silnější). ŽÁDNÁ penalizace** (KUKY: bez penalizace).

**10. Posílení opakováním.** Stejná runa/téma → zesílí existující větev (2× blíž · 3× cluster ·
   4× srůst), ne nová tenká. Soustředěný člověk = pár mohutných větví.

**11. Kořeny se prohlubují, když se runa z kořene vrátí.** ← „oprava kořenů", NENÍ hotová.
   Kořen = zrcadlo větve; návrat runy z kořene ho prohloubí/zesílí.

**12. Blank / Óðinn = průsvitná duch-větev** (~15 %, bez listů).

**2-4. Živý pohyb = VZTAHOVÝ MODEL** (předefinováno dle handoff dok. sekce 8). Hloubka = síly
   MEZI runami, ne jen kde runa je. **Síly se ZAPEČOU do tvaru (růstový sklon), NEhýbou se živě
   jako magnety** (→ engine-safe, stabilní). **Jedna nejsilnější vazba na čtení**, ne všechny
   (vzácnost = hloubka). **První krok: souznění stejného elementu = přitažlivost** (dvě větve se
   nakloní k sobě); odpor (opozice → zkroucení) až druhý krok. Single runa se přidává do existující
   koruny (zhustí/nakloní), netvoří novou křivku. Rozestup sousedů = součást. Mladé pružné / staré tuhnou.

**Průřezově: VIDĚT RŮST V DETAILU.** KUKY: „potřebuju vědět jaké to jsou větve, jak vypadají a
   co nesou." Tyhle spojitosti jsou klíčové — odvozuje se od nich spousta věcí (rituály, The
   Gathering…). → každá větev musí být čitelná: které čtení, jaké runy, element, zóna.

## 📄 Z HANDOFF DOKUMENTU (runar_cteni_session_handoff) — co je pro STROM
(zbytek dok = reader/backend/business = MAIN; strom-lab tím NEscopovat)
- **Vztahový model (sekce 8)** = jádro „živého zrcadla" → zapracováno do bodů 2-4 výš.
- **Tři tvorové** (orel koruna / Níðhöggr kořeny / Ratatoskr posel) = detektory vazeb, ukážou
  JEDEN nález jako Rúnarovu větu = „Rúnar čte celý strom" (Premium #2) = vrstva významu = bod 14.
- **Segmentovaný výstup `{rune, position, text, deeper_meaning}` (sekce 6.1)** = ZÁVISLOST pro
  „co každá větev nese" (per-runa detail). Backend/MAIN. Strom napojíme, až to bude. → flag MAIN.
- **Založení = Life Rune (3 kr) + Norns (2 kr)** = 5 kr. (Máme: life rune=kmen, Norns=kořeny.)
- **Kadence růstu = pomalá** (měsíční free runa = keepalive, ~12 uzlů/rok). 20/den = jen test. (bod 1 sedí.)
- **Yggdrasil = roční, zimní slunovrat = větší VÁHA uzlu** (ne gate) → zapracovat do bodu 7 (spread).
- **Pozice (Norns zóna) NEvyhazovat** — kostra rozložení; vztahy = hloubka navrch. Obojí spolu.

## ⏳ POZDĚJI (KUKY: později)
- **13. Animace „přehraj růst stromu"** (krok po čtení) — deterministický log to umožní.
- **14. Vrstva významu:** The Gathering, pulzy dominance, bloom fáze, listy (svítící element),
  sezóna, záměry (seed → uzavření).

---

## ROZPIS bodů, co chtěl KUKY upřesnit

### 7. Spread = komplexita (návrh)
Velikost spreadu = strukturální složitost otisku ve stromu (počet run ≈ počet prvků větve):
- **single (1)** = uzel / malá větvička (1 výhonek).
- **Norns (3)** = ZAKLÁDACÍ (3 prameny → 3 kořeny+výhonky). Pozdější Norns = větev + 2 výhonky.
- **kříž (5)** = větev + 4 výhonky (5 run = 5 prvků).
- **horseshoe (7)** = větvenější (hlavní + 6 výhonků, 2 úrovně).
- **Yggdrasil (9)** = největší, kořenový uzel. V produkci = roční rituál, ne založení.
→ čím větší spread, tím složitější/mohutnější limba toho čtení.

### 8. Počet vyplněných polí = váha (proč to navrhuju)
Pole formuláře = area / intention / seeking. Kolik jich uživatel vyplní = jak **vědomé/záměrné**
to čtení je. Víc kontextu → záměrnější otisk → **mohutnější/výraznější větev**. Prázdné rychlé
single = drobná větvička; čtení s area+intention+seeking = silnější, „těžší" větev.
(Když ti to nedává smysl, klidně vyřadíme — je to jen jeden ze signálů „síly" čtení.)

---

## POZNÁMKA k architektuře (proč některé body souvisí)
Body 5-12 jsou **per-čtení** vlastnosti (zóna, strana, komplexita, váha, posílení). Crown-composer
base teď seskupuje větve podle ELEMENTU (témat), ne 1 větev = 1 čtení. Aby šlo „vidět co která
větev nese" + zóny/strany/posílení, půjdeme směrem **1 čtení = 1 čitelná větev**, ale postavená
crown-composer enginem (growBranch / spojitá limba / paint / kořeny). To NENÍ přepis enginu —
jen ho voláme per-čtení. Tohle proberem, až dojdeme na bod 5.
