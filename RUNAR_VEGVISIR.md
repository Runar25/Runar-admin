# RUNAR_VEGVISIR.md — Vegvísir: záměr, účel a čas (odložený, NENÍ spread)
# Vlastní: co Vegvísir je a k čemu, jeho ramena a čas. Nic jiného — hlas a stavba čtení → RUNAR_DESIGN.md, spready → RUNAR_SPREADY.md.
# Changelog: 2026-11-19 přesunuto doslova z RUNAR_DESIGN.md (délka docu, smoke ㉝; owner „udělej, co je potřeba“), CODE-tune.

## Vegvísir — záměr (8 ramen, seriálový; odložený, NENÍ spread) — ÚČEL A ČAS (owner ratifikoval 2026-08-23)

⚠️ **Není postavený.** Tohle je ratifikovaný ZÁMĚR, ne stav produkce — v `SPREAD_CONFIG` nic není.

**Co Vegvísir JE.** 📜 Nedává odpověď, věštbu ani verdikt. **Předkládá OBRAZ** = místo, kam se
podívat; význam si uživatel najde **sám v sobě**. Naše jediná práce je ten obraz: dost konkrétní,
aby bylo do čeho promítat, dost otevřený, aby nediktoval.
🔒 **Kotva — Hávamál 138 (Rúnatal):** Ódin získal runy *„gefinn Óðni, sjálfr sjálfum mér"* — sám
sobě, dovnitř; vystoupily z jeho vlastní hloubky, když se do ní díval. Význam je v uživateli, my
ukazujeme jen kam.
📜 Vegvísir = **nesený wayfinder**: ochrana před ztrátou CESTY, ne dodání cíle. Ukazuje, **kudy jsi
šel**, ne kam jít. Amulet, který si sám kuješ, JE ta kresba osmi ramen — „amulet" a „kresba" je týž
předmět, ne dvě věci.

**Čas — „počkej DEVĚT NOCÍ".** 📜 Další rameno nejde vytáhnout dřív. Je to **podlaha, ne rozvrh**:
kdy pak, je na uživateli, celkový čas otevřený (žádných „8 týdnů").
🔒 Devět nocí visel Ódin na Yggdrasilu, než získal runy (Hávamál 138).
⚠️ **Rozliš přesně:** doložených je **těch devět nocí**; že se po nich „získá rameno", je **naše
konstrukce** (📜), ne mýtus. Nepsat to jako prastarý zvyk.
📜 Jednotka jsou **NOCI**, ne dny (severské počítání). A **není to 7** — proto to nevychází pořád
na stejný den a nevznikne mechanické „každé pondělí". Devítka navíc nese ten význam; jakékoli ne-7
by driftovalo stejně.

**Svět.** 🔒/📜 Ódin visel na **Yggdrasilu** — devět nocí, strom i runy jsou z téhož mýtu, takže
Vegvísir patří do světa Stromu, který už stavíme. ⚠️ Zatím **tematická** kotva, **ne** tvrdá vazba
na `tree_state` — propojení se rozhodne zvlášť a nestaví se předem.

**Potvrzené posuny** (owner, 2026-08-23):
- Příběh = **sled tahů a vztahy MEZI runami**; hloubka je mezi nimi, ne uvnitř jedné. **Pozice
  nemají vlastní sémantiku** — rameno pojmenuje runa, která na něj padne.
- **Guardrail:** výklad se nesmí **uzavřít**. Smí obraz, otázka, spojení, připomenutí, kontrast;
  nesmí „a proto to pro tebe znamená X". Smysl je lokální v každém kroku, ne „až na konci".
  *(Není to nové pravidlo — je to `Kdo je Rúnar` aplikované na seriál.)*
- ⚠️ **Životní runa NENÍ startovní kotva** (přerozhodnuto 2026-08-23). Nanejvýš nit nebo callback,
  **nikdy verdikt ani souhrn „tohle jsi"**. ⚠️ Ruší dřívější „sever = životní runa, tím to začíná"
  (KUKY 2026-08-22) — kdo staví na severu jako na životní runě, staví na zrušeném.
- **Dverg pod runou** = test-gated, viz „Dverg pod runou" výš. **Osa skryté ↔ odhalené = PARKOVÁNA**
  jako strukturální tvrzení; měření, které k ní proběhlo, platí a je v `RUNAR_EVAL_LOG.md` 2026-08-23.

**Tvrdé rámce (KUKY 2026-08-24):** Vegvísir **NENÍ spread** — nikdy v `SPREAD_CONFIG`, vlastní
režim. Struktura: životní runa = pomyslný STŘED (netahne se) · 8 tažených run (ramen) · další
runa nejdřív po 9 nocích od předchozí (podlaha — viz „Čas" výš), celková délka otevřená. Čočka:
preference „VIDITELNÁ, neustupuje" (viditelná ≠ jmenovaná — místo, nikdy význam) je od
2026-08-24 večer PARKOVÁNA jako druhá otázka; první je FUNKCE středu — hijack-gate
(→ RUNAR_DECISIONS.md 2026-08-24 reorder). Spojka „střed-jako-místo" = v testu, ne
rozhodnuto → RUNAR_DECISIONS.md 2026-08-24.

**Významová vrstva (KUKY 2026-08-24, §23 hranice funkce vs. artefakt):** Rúnar nese FUNKCI
znaku — vedení · vytrvalost · návrat · neztratit cestu · orientace v neznámu (roste z Huldova
zápisu a z toho, co znak lidem DNES znamená) — **nikdy tvrzení o artefaktu** („ověřený vikinský
navigační přístroj" apod.). Moderní významy mapují na postavenou mechaniku: směr v těžkém
období = wayfinder · věrnost sobě = střed jako místo (nikdy „tohle jsi") · šťastný návrat =
rámový návrat 8→1 · odolnost v nejistotě = 9 nocí · vnitřní kompas = Hávamál („sám sobě,
dovnitř"). Copy z toho vzniká hlasem Rúnara přes Cowork.

**Jádro — proč to není 8× Single** (upřesněno 2026-08-23):
> **Vegvísir je JEDNO čtení, které se neodhalí najednou. Vzniká tím, že nové obrazy vstupují do
> vztahu s těmi, kterými člověk už prošel.** Nejde o osm run, jde o to, co udělá druhá s první
> a osmá s celou cestou.
📜 **Každá nová runa nepřidává další význam — přidává další pohled na to, co už bylo viděno.**

**Jak se nakládá s historií:**
- ⭐ **Historie NENÍ seznam minulých run. Je to materiál, ze kterého vzniká nový obraz.**
  **Rúnar není kronikář.** Začne-li rameno „Před devíti nocemi jsi dostal Gebo, poté Isa…", vznikl
  **log, ne cesta**. Ozvěna nesmí být callback se jmény run: ne *„předchozí runa byla Isa, která
  znamená zastavení"*, ale *„to, co předtím mlčelo, teď vydává zvuk"*.
  🔒 Tvar, který tohle drží, je **změřený**: druhá vrstva funguje, když ji nese TÝŽ obraz, a selhává,
  když přijde pojmenovaná nebo jako přirovnání (→ `RUNAR_EVAL_LOG.md` 2026-08-23).
- ⚠️ **2026-09-27 (KUKY, DECISIONS 2026-09-27 (3)): výchozí stav je NIC SE NEPŘENÁŠÍ** — příběh tvoří člověk Askem; odstavec
  níž zůstává jako varianta k testu, ne jako rozhodnutí.
- ⭐ **Historie se nese POVINNĚ, ale MALÁ: jedna extrahovaná materiálová fráze z předchozího
  ramene** (extrahuje model). Tvarové zákazy: nikdy jméno runy, nikdy přirovnání; smí být
  proměněná, popřená, nebo přítomná jako nepřítomnost — vztah je svobodný, přítomnost ne.
  ⚠️ **Nahrazuje „Historie je dostupná, ne povinná" (ratifikováno KUKY 2026-08-23):** nepovinná
  historie se změřila jako NEPOUŽITÁ (v1 0/6; de-blind tally potvrdil, že vrah byla úniková
  klauzule, ne objem — `docs/eval/2026-08-23-recept/tally.md`). Vzor `_lensContext` „leave it
  out" u historie NEPLATÍ — u čočky funguje, tady ne (změřeno). **Protiváha-flag ZAVŘEN:**
  protiváha = povinnost; malá fráze navíc drží těžký směr (disparátní runy) a brání kronice
  (celý text: obraz-výčet 3/20).
  **Dva kanály:** kotálivá fráze (N↔N-1, vyhasíná — správně) + trvalé semínko ramene 1,
  vynořené JEN při ohlédnutí. Mechanismus potvrzen slepě 6/6 (TEST 31, `RUNAR_EVAL_LOG.md`
  2026-08-23). Šev (změřeno TEST 32+33,
  `RUNAR_EVAL_LOG.md` 2026-08-23): instrukce sama ho NEřeší (trade-off čitelnost×organika);
  zavírá ho **domov ve scéně** — volba obrazu posledního ramene dle semínka (S2 sweep 3/3).
  Zbývá SELEKTOR (fallback bez domova + afinita přes měřené aspekty = odparkovaný T3) —
  rozhodnutí owner.
- **Designová kontrola (NE instrukce do promptu):** každé rameno dělá jeden z pohybů
  slovníku vztahů (→ „Vztahy mezi taženými runami", `RUNAR_SPREADY.md`; trojici naváže·změní·otevře
  slovník rozšířil 2026-08-24). Osm navázání = nudná kontinuita; osm převracení = chaos. Slouží
  k posouzení oblouku. ⚠️ Do promptu to nepatří: jeden vzor v promptu = model ho opíše.

**První a osmé rameno:**
- **První je prostě první obraz. Tečka.** Nepředznamenává osm dalších, nevysvětluje cestu, neříká
  „tohle je začátek". Má být dost silné, aby si ho člověk zapamatoval — proto se k němu dá o sedm
  ramen později vrátit.
- **Osmé neuzavírá, je to místo, odkud se člověk ohlédne.** `1 → 8` není *začátek → konec*, ale
  **první obraz → obraz, ze kterého ho teď vidíš jinak**. (Závěr by byl zakázaný verdikt.)

⚠️ **Ramena NEMAJÍ obsah podle pozice.** Že se s rostoucí řadou mění, co je vidět (první nemá
kontext · uprostřed je největší pokušení uzavřít · ke konci je zajímavější, co nepřišlo), je
**designová pozornost pro nás — kde je guardrail nejvíc v ohrožení. NE význam ramene.** Zapsat to
jako význam by z Vegvísiru udělalo klasický narativní spread, což je přesně to, čemu se vyhýbáme.

⚠️ **Test autonomie:** kdyby se životní runa zítra z Rúnara odstranila, **Vegvísir nesmí ztratit nic
podstatného**. Ztratí-li, visí pořád na starém konceptu.

⚠️ **Jediná část, kterou NEJDE ověřit ničím, co umíme:** ta časová mezera. Devět nocí života mezi
rameny se nedá nasimulovat — všechno ostatní (obraz, ozvěna, pohyb, pořadí) ověřit umíme, tohle ne.
Rituální práh je inspirace; produktový princip je „mezi obrazy musí být skutečný čas" — a ten zůstává
**hypotézou**, dokud to neuvidí živí lidé.

---

