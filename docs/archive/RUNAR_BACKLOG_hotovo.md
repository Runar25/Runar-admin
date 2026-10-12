# RUNAR_BACKLOG_hotovo.md — archiv hotových a zamítnutých položek z RUNAR_BACKLOG.md
# Historie, ne pravda o dnešku: co platí, vlastní kód, git log a RUNAR_DECISIONS.md. Přesouvá sem scripts/utils/backlog_uklid.py
# (doslova, pod nadpisem původní sekce); uz_vime.js tenhle soubor prohledává.

## Přesunuto 2026-10-12 (123 položek)

### Reading quality (audit 2026-07-04)
- [x] **~~ČOČKA ŽIVOTNÍ RUNY — owner zvažuje pozastavení~~ → VYŘEŠENO 2026-09-10 volbou ano/ne** (`user_profiles.life_rune_in_readings`, default zapnuto; přepínač v bočním panelu). ⚠️ **Čeká na SQL od ownera** — `sql/2026-09-10_life_rune_in_readings.sql` + `sql/2026-07-16_user_profiles_column_grants.sql`. Rozhodnutí → `RUNAR_DECISIONS.md` 2026-09-10. Alternativa „životní runa jako doplňující otázka v Ask" **HOTOVA 2026-09-10** — `buildAskPrompt` ji dostává (`_askLifeContext`) a nápověda ji nabízí s dosazenými jmény. Zůstává jen důsledek, který nezmizel: **Ask je premium-only**, takže tahle cesta k životní rune je prémiová. Původní zadání: (KUKY 2026-09-10: *„čočka zabírá místo pro čtení… nejsem si jistý, jestli se hodí dávat ji automaticky"*). **Změřeno: bere si závěrečnou větu v 10/12 čtení** (bez ní 0/12); čtyři různé tažené runy, všech dvanáct závěrů o životní runě. Stojí +5 % délky (EL). Je to **třetí uchazeč o poslední větu** vedle losu tvarů konce. → `RUNAR_EVAL_LOG.md` 2026-09-10.
  **Tři cesty, co owner zvažuje, a co která stojí:**
  1. **Pozastavit** (nejlevnější, vratné) — `_lensContext` vypnout · ⚠️ §13: odstranit i větev v `_priorityContext`, která na čočku odkazuje („let the life-rune lens recede"), jinak prompt mluví o něčem, co tam není · ⚠️ smoke ⑧ `verify_contract_wiring` má `lens` mezi **POVINNÝMI** pro single i všechny spready — musí se upravit spolu s tím · životní runa zůstává vidět ve stromě a v badge, takže se uživateli neztratí.
  2. **Volba jako AREA/seeking/intention** — ⚠️ **není to táž věc:** area/seeking/intention jsou vstupy o OTÁZCE, životní runa je vlastnost ČLOVĚKA (počítá se z data narození). Patří spíš do nastavení („používat mou životní runu ve čteních") než mezi pilulky u čtení. §13 full-path: `startReading` · `resetReader` · 4 spready · shrine parts.
  3. **Do Ask** — ✅ **zvoleno a hotovo 2026-09-10** (rozhodnutí → `RUNAR_DECISIONS.md`). Plumbing `buildAskPrompt(..., life)` existuje; zůstává jen to, že Ask je premium-only.
  **Doporučení CODE:** nejdřív **1** (vratné, měřitelné), o 2/3 rozhodnout až podle toho, jestli čtení bez čočky owner uzná za lepší.
- [x] **~~Tři runy se v produkci nečtou jako ony samy~~ — Uruz a Tiwaz OPRAVENY 2026-09-09** (regrese 0/2 → **4/4** oběma, → `RUNAR_EVAL_LOG.md` 2026-09-09 (7)). Zbývá pět run se selháním 1/2: **Wunjo · Hagalaz · Jera · Mannaz · Blank** — nepřeměřeno po opravě, patří do paletového auditu.
- [x] **ZÁKAZ V ŘÁDKU OBLASTI × MOST — VÝJIMKA NASAZENA 2026-09-20 (v4.37-vyjimka, DECISIONS (9));
  zbývá UŽ JEN doměřit chlad na větším vzorku** (výsledek →
  `RUNAR_EVAL_LOG.md` 2026-09-20 (10); data `docs/eval/2026-09-20-zakaz-oblasti/`).
  **Vyhrála VÝJIMKA**, ne odebrání: `_domainContext` si nechá svůj zákaz a dostane hranici pro poslední větu
  (6 oblastí z 8, které kolidují; Heilun a Fjölskylda zakazují něco jiného než kam most míří). **Znění vlastní kód** —
  `_domainContext` v `runar-character.js`, doc ho po nasazení neopisuje (§20).
  Dosednutí poslední věty do oblasti **2/6 → 6/6**, chlad beze změny proti rameni bez výjimky, délka beze změny.
  ⚠️ **Odebrání zákazu (co jsem doporučoval) je VYVRÁCENÉ** — chlad 2/6 → 4/6 a dosednutí se nezlepšilo. Nezkoušet znovu.
  **Zbývá, než to půjde do produkčního kandidáta:** doměřit chlad na větším vzorku (víc run, EN + IS, všech pět
  rejstříků), protože n bylo 6 na rameno a rozdíly v chladu byly v šumu. IS znění výjimky psát nativně (§2).
  **Metodická vada k opravě:** tři soudci se stejným zadáním vrátili týž výstup — příště různě formulované rubriky
  nebo jiný model, jinak „shoda 3/3" nic neznamená.
- [x] ~~REJSTŘÍK VEN Z TĚLA SINGLE~~ — **UZAVŘENO 2026-09-20: zůstává.** Owner nad slepými dvojicemi:
  *„s řádkem to vypadá dobře a zní lépe než bez řádku."* Měření (EVAL_LOG 2026-09-20 (11)) ukázalo výměnu,
  ne ztrátu funkce (z hotového čtení 8/8 obojí), rozhodl sluch. Rozhodnutí → `RUNAR_DECISIONS.md` 2026-09-20 (12).
- [x] ~~KOREKCE DO SHRINE~~ — zapsáno do DB 2026-09-23 (7); seznam teď vlastní `runar_corrections` (§20).
- [x] **Opus 5 místo Opus 4.8 — NASAZENO 2026-09-24** (DECISIONS 2026-09-24 (10) a (11), CODE-tune `19d2a4c`). Hlídat délku EN Norns, Ask a skutečnou cenu (`node scripts/utils/stats.js`). (EVAL_LOG 2026-09-24 (1)) — EN: slepí soudci 9 : 5, méně opisu, 0 rozkazů,
  kratší; cena za čtení stejná až nižší (s teplou cache EN $0,0080 × $0,0119). ⚠️ **V proxy NUTNÉ `thinking: {type:'disabled'}`**
  — bez něj Opus 5 přemýšlí, na `max_tokens` 700 nevrátí text. Vady: pouští slova zadání (*„The friction is plain"*), v IS
  převypráví obraz víc. Rozhoduje owner; před přechodem várka IS (IS primární) a Ask/Norns.
  **2026-09-24 (2): single + Norns EN i IS** — Opus 5 : Opus 4.8 = 3 : 2 EN, **5 : 0 IS**; dohromady 20 : 8. Pozor: Opus 5 píše
  delší anglické Norns (dražší hlas). Owner: *„chci přejít na Opus 5… nepotřebuju to teď uspěchat."* Ask netestován.
- [x] **HOTOVO 2026-09-24 (v4.54, DECISIONS 2026-09-24 (18)) — jméno do promptu přes `rnPrompt()`, rozhraní s glosou dál.** **GLOSA V ISLANDSKÉ HLAVIČCE RUNY se propisuje do čtení** (nález CODE-read 2026-09-22, srovnání modelů).
  IS prompt má `DREGNA RÚNA: Raidho (Ferðalag) — …`, EN jen `DRAWN RUNE: Raidho — …`. Výsledek na 42 čteních:
  glosa *„Raidho (Ferðalag)"* v textu **jen v IS** — Opus 5.5 3/3, gpt-6-sol 3/3, gpt-5.6-sol 2/3; v EN ji nenapsal
  **žádný** model. Opus 4.8 a 5 ji zatím neopisují, takže dnešní produkce to nevidí — ale **při jakékoli změně modelu
  to vyleze okamžitě**. ⚠️ **Vstupy jsou DVA** (doměřeno 2026-09-22 (2)): hlavička runy A pokyn *„Nefndu Gebo
  (Félagsskapur) einu sinni og fléttaðu nafnið…"* — ten modelu glosu přímo předepisuje. Oprava jen hlavičky: sol 2/5;
  obou: 0/5; Norns má glosu v řádcích run (`Gebo (Félagsskapur) —`). **Zdroj ověřen 2026-09-23: `RUNES[].is_n` v `runar-runes.js` nese glosu přímo (`"Þurs (Hlið)"`,
  `"Othila (Aðskilnaður)"`).** ⚠️ **Oprava 2026-09-24:** u zdroje ne — `is_n` s glosou čte i rozhraní (`rn()`, strom, Yggdrasil,
  `data-rune`); islandský uživatel by přišel o glosu v popiscích. **Oprava = pomocná funkce jen pro prompty** (jméno bez závorky),
  rozhraní beze změny. Otestováno (EVAL_LOG 2026-09-24 (4)): sol glosa 3/5 → 0/5, Opus 5 0 → 0 → **handoff CODE-tune předán**.
  Doklad starší: `RUNAR_EVAL_LOG.md` 2026-09-22 (1) a (2).
- [x] ~~KANDIDÁT: NORNS: SEZNAMY KLÍČOVÝCH SLOV u run pryč~~ — **ZAMÍTNUTO měřením 2026-09-23 (3).**
  gpt-6-sol bez seznamů ztrácí identitu run (6/12 → 3/12, drží v obou půlkách); varianta s jedním slovem je
  nejhorší (identita stojí na opsané nálepce, závěr s nálepkou 4/6). Čtyři slova (produkce) = nejlepší identita
  podle vztahu. Opus 5 seznamy nepotřebuje. **Nezkoušet znovu bez nového důvodu** (§26).
  Opisování do závěru u solu se 4 slovy bylo 4/10 — kdyby se řešilo, tak jinou pákou (landing), ne seznamy.
- [x] ~~**IS CHYBA: spready oslovují člověka jako „toho, kdo VEDE"**~~ — SWEEP HOTOV 2026-09-21
  (18 náhrad, v4.39-leitandi, DECISIONS 2026-09-21 (1)). Původní zadání níž: (nález CODE-read
  2026-09-20 při psaní islandského závěru Norns; owner: *„IS umíš udělat i ty"* — dotaženo do verdiktu, ne dotazu).
  **Verdikt: `Leiðandi` a `Leiðin` jsou ve čtyřech spreadových packech špatně.** Doklad, ne dojem:
  🔒 `leita` = hledat (rekce **eignarfall**; `leita að`, `leita til`) → příčestí **`leitandi` = hledající**.
  🔒 `leiða` = vést (rekce **þolfall**; `leiða til` = vést k) → příčestí **`leiðandi` = vedoucí**; slovníková
  kolokace **`leiðandi spurning` = návodná otázka**, doslova to, co Rúnar dělat nemá.
  🔒 `leit` (kvk) = hledání (*„leitin að ferðamanninum"*) × `leið` (kvk) = cesta (*„á leiðinni þangað"*).
  Anglické packy mají ve všech čtyřech spreadech `seeker:'Seeker'` a `seeking:'Seeking'` — IS tedy říká
  **„vedoucí" a „cesta"** tam, kde EN říká „hledající" a „hledání". Protlačeno produkční cestou: v promptu
  Norns stojí `Leiðandi: Kuky` a *„Leiðandinn dregur þrjár rúnir"* — model dostává informaci, že ten člověk vede.
  Single a konce přitom používají `leitandi` (22 výskytů) správně, takže si soubor protiřečí sám se sebou.
  **Sweep (18 náhrad v `v2/runar-character.js`, jen IS packy spreadů):** 4× `seeker:'Leiðandi'` → `'Leitandi'` ·
  4× `seeking:'Leiðin'` → `'Leitin'` · 4× `intro:'Leiðandinn dregur …'` → `'Leitandinn dregur …'` ·
  5× `leiðandinn` → `leitandinn` (4× *„leiðandinn sér þær þegar"*, 1× *„þess sem leiðandinn bar fram"*) ·
  **1× `leiðandans` → `leitandans` v `RP_NORNS.is.landing`** — ⚠️ tenhle výskyt je NOVÝ a je **moje chyba**:
  do prvního handoffu na Norns A jsem to slovo dal vědomě, „aby pack zůstal vnitřně konzistentní", ačkoli jsem
  ho v témže dechu hlásil jako podezřelé. CODE-tune nasadila první verzi (v4.38) dřív, než dorazila oprava.
  **Poučení do handoffů: nejistý tvar se dotáhne PŘED odesláním, ne vedle něj** (§19.2, §23).
  ⚠️ Udělat JEDNÍM tahem přes všechny čtyři spready (Áttaviti · Norns · Skeifan · Yggdrasil) — po jednom by
  vznikl smíšený stav. Po sweepu: `check-is.py`, golden-verify a protlačit prompt, že tam `leiðand` nezůstal.
  ⚠️ Pozor na AREAS: `Tilgangur & Leið` je NÁZEV OBLASTI a `Leið` = cesta je tam SPRÁVNĚ — sweep se ho nesmí dotknout.
- [x] ~~**MOST: AREA = kam dosedne · SEEKING = tvar**~~ — NASAZENO 2026-09-20 ve v4.36-most-cil
  (DECISIONS 2026-09-20 (8)). Podle vlastního zadání položky: „po nasazení to vlastní kód a odsud
  zmizí" — znění žije v `ENDING_OPEN` / `ENDING_HEAVY` / `BRIDGE_AREAS` / `SEEK_SHAPE`
  (`v2/runar-utils.js`). **Ověření (slepý soudce na oblast a rejstřík, cold reading a rada) zůstává
  na CODE-read**, než to půjde do produkčního kandidáta.
- [x] **~~Motiv-guard běží skoro naslepo — 79 z 85 obrazů nemá motiv~~ ⚠️ TO BYL MŮJ ŠPATNÝ ZÁPIS** (oprava 2026-09-10). Motiv **nepojmenovává obraz, ale OPAKUJÍCÍ SE PŘEDMĚT** (`midnight-sun`, `lamb`, `reflection`) — je to štítek pro dvojici, ne popisek řádku. Prázdný motiv proto **není dluh**: u obrazu, jehož předmět se u té runy nevrací, nemá guard co střídat. Chybí-li motiv, řádek se píše **sedmisloupcový** (osmisloupcový s prázdným motivem kontrola ㉟ odmítá, a správně). ⚠️ Tuhle chybu jsem zopakoval i v zadání pro Cowork („motiv povinný + distinktní") — proto přišla dávka 1 s 36 unikátními motivy, které musely pryč.
- [x] **§22 — rozpor v čísle „nároky na vnitřní stav" — VYŘEŠENO 2026-09-08.** `runar-reader.html` říkalo 23 %, rejstřík pák 18 %. Dohledáno v archivu evalu: obě čísla jsou z 16. 8., ale **23 % je mezivýsledek, který týž den zneplatnila oprava detektoru** („dřívější hodnoty z dneška neplatí", 15 → 23 → **18**; mimo jiné `finnur` = „najde" se počítalo jako nárok na nitro). Platí **18 %**. Komentář v HTML číslo už neopisuje — nese důvod a odkazuje na vlastníka (§20).
- [x] **Mytologické obrazy (Óðinn/Nornir)** — ZAVŘENO 2026-08-22 (KUKY: „mytologické obrazy NE!"). Nevrací se; případný budoucí návrat jen přes §26 (očištěný, se slepým testem).
- [x] **EN-polish pass** — HOTOVO + ZMĚŘENO (SW v119): zesílen `DEF_CHAR_EN.grammar` (banned-cliché list + hard one-image + read-over). Eval: clean-rate 13 %→13 % (nehnulo), ALE délka líp (over-length 6→2, ⌀42 slov). **Poučení: auto-grader je moc přísný na subjektivní styl** (sám hedguje „borderline/mild") → 13 % ≠ špatná čtení; skutečný soudce EN stylu = owner naživo, ne auto-eval. Blok nechán (neškodí, pomohl délce). Jediný reálný zbytek = multi-image (sezónní obraz přilepený navrch runového) = strukturální, ne cliché-list.

### Profil / personalizace
- [x] **Gender field** — HOTOVO (kód, SW v118): selektor Hann/Hún/Hán (kk/kvk/hk=hán default) v side panelu, jen IS; ÁVARP do všech 5 IS builderů; rule#5 skloňuje dle rodu. **Čeká jen DB sloupec:** `alter table user_profiles add column if not exists address_gender text default 'hk';` (owner v SQL editoru). Do té doby jede přes localStorage.

### i18n / prevence uvízlé angličtiny
- [x] **i18n-diff nástroj** — HOTOVO (`scripts/i18n-diff.js`): runtime EN↔IS set-diff detektor uvízlé angličtiny. **Pouštět po větších UI/translation změnách** — jak vyvolat viz `working-style.md` (§ i18n kontrola).

### Struktura / refaktor
- [x] **Prompt unification** — HOTOVO (SW v124): 10 IS/EN builderů → 5 generických (`buildReadingPromptSingle`/`buildNornsPromptFate`/`buildKrizPromptCross`/`buildHorseshoePromptSeven`/`buildYggdrasilPromptNine`) + 5 `RP_*` packů. Golden-verified: IS byte-identický, EN jen kosmetická normalizace runesBlock. **Přidání jazyka = přeložit packy.** Golden harness v `scripts/golden/`. (Detail → DECISIONS 2026-07-04.)

### Tree — pozastavené signály + vrstva významu (konsolidace 2026-07-30)
- [x] **Strom (lab): strany nevyvážené / rameno do první volné mezery / čtení mimo své místo** — vyřešeno 2026-10-05 (DECISIONS (12)): místo = element × pásmo × strana, strana z dat, zrod podle zóny.
- [x] **Strom (lab): seeking na koncích větviček** — v labu od 2026-10-09 po obrázku (DECISIONS 2026-10-09 (12)); patch
  `docs/archive/tree/2026-10-09_nanecisto_seeking.patch` je historie.
- [x] **Strom (lab): větvičky jen na jedné straně větve + povýšená svisle** — v labu od 2026-10-09 (KUKY „9. zapnout“, DECISIONS 2026-10-09 (16)). (CODE-tree, 2026-10-09, KUKY: *„proč se tady u Nauthiz objevily
  větvičky jen a pouze na levé straně“*). Strana větvičky se bere z oblasti (`sideOf` → `AREA_LAT`: nitro doleva, svět doprava na plátně);
  od 2026-10-09 (11) nese levá větev skoro jen nitro, takže všechny její větvičky míří doleva (Nauthiz z Othily: 15 čtení, 11 nitro, 3 bez
  oblasti, 1 Love; všech 5 přímých větviček vlevo). Oblast tak rozhoduje dvakrát. Navíc ta Nauthiz roste −1° (pojistka strany z 2026-10-07
  ji zastavila u svislice, odbočka od Othily by šla doprava) → hřeben. Návrh pro ownera: větvičky střídavě kolem větve; povýšená místo
  zastavení u svislice odbočí na druhou stranu matky. Nanečisto před zapnutím.
  **Nanečisto hotové 2026-10-09** (KUKY: *„12. ano udělej to nanečisto … přesně takhle to je“*; *„tady Dagaz taky … projdi to“*), patch
  `docs/archive/tree/2026-10-09_nanecisto_vetvicky.patch`: jeho strom dnes 4 větve s přímými větvičkami jen na jedné straně (Algiz 5:0,
  Nauthiz* 0:5, Dagaz* 5:0, Perth* 0:5; * = povýšená) a 1 svislá povýšená (Nauthiz) → nanečisto 0 a 0.
- [x] **Strom (lab): vyvážený strom, strop 25, posílení větviček** (hlášení 2e6aa64d, 2026-10-07 → 10-09): strop 25 a oprava strany
  (DECISIONS 2026-10-09 (3)); oblast jen strana + čtení bez strany na lehčí stranu (DECISIONS 2026-10-09 (10), (11)); posílení větviček
  stejnou runou **zamítnuto** (KUKY 2026-10-09: *„nechame jak je. strom je sice méně přehledný, ale bez malých větviček to zase nevypadá
  jako strom“*) — nanečisto bylo 317 → 105 větviček.
- [x] **Ověřit na produkčních datech: `aol`/`intention` v `readings`** — ZMĚŘENO 2026-08-22 (Code na DB dosáhne přes `supabase db query --linked`, „musí owner" už neplatí): 324 čtení · 63 aol (19 %) · 35 intention (11 %). Pro tree lane: větve ze starých čtení budou řídké. Obojí je v UI **volitelné** (pilulky „AREA OF LIFE" a „THIS READING IS FOR" jsou označené OPTIONAL), takže když je testeři přeskakují, obě dokumentované páky §3 (výška z intention, strana z area) budou v produkci **slabé z nedostatku dat**, ne z chyby v kódu.
- [x] **OPRAVENO 2026-09-26 (KUKY: „ano opravit"):** znak Sowila v obou enginech stromu = aplikační U+16CA, v builderech. Ověřeno protlačením: všech 23 dosažitelných životních run má tvar, semínko Sowila se liší od Berkanina, aplikační znak Sowila najde klíč `sowilo`. Původně: 🐞 **SOWILO MÁ VE STROMĚ JINÝ ZNAK NEŽ V APLIKACI (nalezeno 2026-09-26, diagnóza po částech, část 1).** Aplikace (`v2/runar-runes.js`) má Sowilo `ᛊ` U+16CA, engine stromu (`runar-branch.js`) `ᛋ` U+16CB. `renderLivingTree` hledá kmen podle znaku a při neúspěchu **tiše spadne na `'berkano'`** (`runar-tree.js`, `_treeRkey = bk ? bk.k : 'berkano'`) → **každý se životní runou Sowilo má v aplikaci kmen Berkany.** Změřeno protlačením všech dnů narození 1930–2012: ze 23 dosažitelných životních run nemá tvar jen Sowilo. Tatáž neshoda nejspíš bere tvar i Sowilu v **čteních** — ověří se v části 3 (single). Oprava patří do builderu (`build_branch_composer.py`), ne do generovaného `.js`.
- [x] **OPRAVENO 2026-09-26 (KUKY: „navázat na semínko")** — pravidlo bydlí v `RUNAR_TREE.md` §2. Ověřeno protlačením: kmen u země semínko 16,2 → po Nornách 16,4 px (dřív 13,4). Původně: 🐞 **SEMÍNKO JE „STARŠÍ" NEŽ STROM PO PRVNÍM ČTENÍ (2026-09-26, část 1).** `runar-tree-prod.js`: bez čtení `realAge = 25`, s čtením `realAge = počet × 3` → po prvním čtení je věk **3**, kmen se ztenčí a tloušťku semínka dožene až kolem **9. čtení**. Změřeno přímo na enginu kmene (mění se jen věk): šířka pramene u země věk 25 → **2,89**, věk 3 → **2,09** (Uruz; Laguz i Dagaz stejný poměr, ~−28 %). Výšku to nekazí — ta po prvním čtení vyskočí díky větvím (108 → 353 px). Oprava je jedna hodnota; čeká na ownera.
- [x] **VYŘEŠENO V LABU 2026-09-28 — nový model postaven a změřen** (`RUNAR_TREE.md` §5; aplikace zatím ne). Původně: 🐞 **LAB PO NORNÁCH JEDE STARÝ MODEL — změřeno na KUKYho novém stromě (2026-09-27, 55 čtení, `_tree_state.json`, `tree_diag.js own`/`own2`).** (1) **SHLUK:** zapnutá *verze B* (`gradStrand`, posuvník v ODLOŽENO) pouští graduantův pramen z kmene **na témž místě** jako rodiče a vede ho vedle něj → 13 pramenů jen na 5 výškách (Tiwaz+Sowilo+Fehu svisle nahoru, Ingwaz+Gebo+Laguz, Raidho+Algiz+Wunjo, Othila+Eihwaz+Nauthiz). KUKY: *„tohle nesmí existovat, každý pramen má začínat v jiné výšce."* (2) **STÍN NEVIDITELNÝ:** Isa, Hagalaz, Prázdná taženy 7× od #21 — nejsou nikde (bez vlastní větve nemají kde viset). (3) **ZEMĚ ČEKALA 17 ČTENÍ:** tažena od #2, pramen až #19 — prameny přibývají podle věku (`3 + floor(věk/80)`), ne podle nového elementu. (4) **DRUHÝ PRAMEN ELEMENTU:** vzduch dostal Mannaz (#45, pravidlo `EXTRA` po 5 taženích), zatímco stín nemá žádný. (5) Inspekce pramene verze B ukazuje `undefined`/`NaN`; opakovaná odbočka (Algiz 2×) se hlásí jako „vlastní pramen". (6) Drobné větvičky bez runy = posuvník `childN` („odbočky (twigy) — NENESOU runu"). **KUKYho model (2026-09-27) to řeší:** runa elementu, který už pramen má → větev NA jeho větvi; element bez pramene → hned nový pramen z kořene; žádná větev bez runy. Čeká na potvrzení pravidel.
- [x] **Životní runa = runové půlměsíce — NASAZENO 2026-09-27 (DECISIONS 2026-09-27 (5)); text o původu + nové čtení (vysvětlení runy) nasazeno (DECISIONS (7)).**
  Návrh textu v chatu; umístění pod odhalenou runou v záložce životní runy. Sowilo 12. vs 13. 2. — nasazeno 13. 2. (3 ověřené zdroje). (CODE-tune)
- [x] ✅ **VYŘEŠENO 2026-09-27 (DECISIONS 2026-09-27 (2)): nový vzorec, vyjde všech 24 run.** ~~🐞 **FEHU NIKDY NEVYJDE JAKO ŽIVOTNÍ RUNA (2026-09-26, pro CODE-tune + rozhodnutí ownera).**~~ `calcLifeRune` sčítá číslice `d+m+y` a redukuje jen nad 24; Fehu potřebuje výsledek 1, což u skutečných dat narození nenastane. Změřeno na všech dnech 1930–2012: **23 z 24** run, chybí Fehu (Blank záměrně). Je to vlastnost zvolené numerologie, nebo chyba vzorce? **Nedomýšlím (§23)** — metoda výpočtu je 🔒/📜 a životní runa je lane MAIN. ⚠️ `RUNAR_BACKLOG.md` ve Vegvísir sekci tvrdí „kterákoli z 24" — neplatí.
- [x] **OPRAVENO 2026-09-26 — jména v obou enginech stromu = aplikace (Perth · Berkana · Othila).** Vnitřní klíče `k:` (`perthro`/`berkano`/`othala`) zůstaly — jsou to identifikátory, na kterých visí uložené ladění run v labu a lab log; uživatel je nikde nevidí. Původně: 🐞 **JMÉNA RUN se rozešla mezi labem a produkcí (nalezeno 2026-08-09).** ⭐ **KUKY 2026-09-26: sjednotit podle aplikace.** `v2/tree-lab-branch-composer/runar-branch.js` má **Berkano · Perthro · Othala**, produkční `v2/runar-runes.js` má **Berkana · Perth · Othila**. Zatím to nikoho nebolí (lab jména nikde neukazuje uživateli), ale **při portu stromu do produkce** se to potká — a doky psané podle labu padají na `check-docs.py`. Rozhodnout jeden tvar (⭐ produkce vyhrává) a srovnat lab. Vlastník jmen = `v2/runar-runes.js`. <!-- check-docs:ok 2026-08-09 cituji spatna jmena jako VADU, ktera se ma opravit -->
- [x] 🐞 **VADA OPRAVENA (F0b, 2026-08-07, lab): prameny bez runy = bez kořene, useknuté u země.** Příčina = **regrese z Kroku 3**: vypnul jsem vlastní kořeny trunk-enginu, hlavní větve dostaly composer-kořen jako náhradu, ale větev `reinforce` (pramen bez tažené runy) nedostala nic — kreslí se `L.pts.slice(rE, mi+1)`, tj. od země nahoru. Doloženo: `prameny 25 → větví 9` = 16 sirotků. **Fix (F0b): `strandN = mainsN`** (kolik run, tolik pramenů; každý má větev i kořen) + **kompenzovat objem kmene tloušťkou** (girth s počtem čtení), ne počtem pramenů — dle §5. **Hotovo:** `strandMax` se nastavuje z `mainsN` **před** `buildTrunk`. Ověřeno na skutečném `buildTrunk` (node): mainsN 1/2/3/9/25 → strandN přesně tolikéž, **0 sirotků** (bez stropu by engine v 87 měsících chtěl 36 pramenů). ⚠️ **Tloušťka záměrně NEkompenzována** (KUKY: „zkusíme 9 pramenů, tloušťku necháme") → posoudit vizuálně; kdyby byl kmen moc hubený, dohnat girth (§5). Port do produkce po schválení.
- [x] 🐞 **VADA OPRAVENA (F1, 2026-08-07, lab): twig „přeskakoval" při přibývání čtení.** Změřeno na skutečném kódu: stará logika posunula odbočku o **0,200** délky větve, jakmile přibyly další runy; nová o **0,000**. Detail pravidla → `RUNAR_TREE.md` §5. Původní diagnóza: Příčina: pozice odbočky se počítá z indexu a počtu — `fu = 0.4 + 0.45*(c/(n-1))` → jakmile se změní `n`, přepočítají se pozice VŠECH twigů. **Fix (součást F1): pozice odbočky se odvodí z její RUNY (stabilní slot), ne z pořadí** → nová runa přisedne, staré zůstanou.
- [x] 🐞 **VADA OPRAVENA (F4, 2026-08-07, lab): panel KOŘENY byl z větší části mrtvý.** Pravidlo kořene → `RUNAR_TREE.md` §5. Zapojeno: `curve`/`wobble`/`tipLift`/`taper`/`width`/`subScale` + nové `fan` a `subLenMul` (v enginu aditivně, default 1 → branch composer beze změny, ověřeno). ⚠️ **F4 nejdřív kořeny ZHORŠILO** (KUKY: „vypadají divně") — měnil jsem 5 věcí naráz (curve 1→0,4 · výběžky ×1→×1,8 · tipLift 0,22→0 · subScale 1→0,7 · směr) a navíc mělo `fan` **obrácené znaménko** → kořeny se křížily pod kmenem. **Napraveno:** defaulty vráceny na pre-F4 hodnoty a `fan=0` = původní chování (ověřeno bod po bodu, 412 bodů, odchylka 0,0 px); znaménko opraveno a ověřeno na **skutečné poloze špičky**, ne na znaménku `dev` (ten test dal falešně zelenou — §19: ověřuj výsledek, ne mezikrok). Nález ⚠️ **oprava mého dřívějšího tvrzení:** `tipLift:0.22` špičku kořene **nestáčel vzhůru** — jen ji narovnal blíž svislici; vzhůru se obrací až nad ~0,57 (změřeno). Z `rootsT` se reálně používá **jen** `length`, `junctionThick` a barvy (`ctNear/ctFar`); `curve`, `wobble`, `tipLift`, `taper`, `subScale` byly v `rTT` **natvrdo**. A **`rootFan` („rozevření kořenů") po Kroku 3 nedělal nic** — tvaruje jen tu část limbu, co se už nekreslí (`trunkPart` začíná až za `rE`). **Dnes směr kořene určuje:** strana = náhoda ze seedu pramene (kořen nedostává `area` ani `dev`), rozevření = `world`+`element` runy (`openBase` lerp 1.15→0.30: Asgard/oheň = skoro rovně dolů, Hel/zem/stín = doširoka), zakřivení = `curve` runy × element. **→ Zapojit doopravdy v F4** (kořen ≠ větev), jinak nejde kořeny ladit.
- [x] 🐞 **VADA OPRAVENA (2026-08-07, lab): jedno čtení přeskupilo větev.** Graduanti = **první dva, kdo překročil práh**. Ověřeno přehráním **celého reálného logu** (241 čtení po jednom): degradace **45 → 0**, samovolná přerodičování **0**, zbylo jen **9 legitimních graduací**. Pravidlo → `RUNAR_TREE.md` §5. Původní nález: (KUKY 2026-08-07 pozoroval 317→318; **reprodukováno měřením, stejná čísla 2→4**). Práh graduace sticky **je** (`runeGrad` se jednou nastaví a nezmizí), ale `gsel` bere **top 2 podle aktuálního počtu** — a nad prahem bývá 5 run na 2 sloty. Jedno čtení tedy přehodí, kdo graduuje, a jeho odbočky se **přerodičují**: `sowilo(G)[tiwaz,dagaz] kenaz(G)[fehu]` → `sowilo tiwaz dagaz(G) kenaz(G)[fehu]` (2 → 4 odbočky na hlavní větvi). **Fix (návrh):** graduanti = **první dva, kdo práh překročil** (pořadí překročení zaznamenat při průchodu logem), ne nejtaženější → monotónní, žádné přeskupování. Sedí i na kánon §5, kde se pořadí run už řídí **prvním tažením**, ne četností.
- [x] **F1 + F2 HOTOVO (lab, 2026-08-07) — život runy.** F1 = odbočka je tažená runa, stabilní slot (konec přeskakování — ověřeno: stará logika posunula odbočku o 0,200 délky větve při přírůstku run, nová o 0,000) a růst z opakování své runy. Pravidlo bydlí v `RUNAR_TREE.md` §5. **Zbývá F2** = graduace. Původní zadání: Jedno kontinuum místo dvou systémů: odbočka vznikne při 1. tažení své runy → s každým dalším tažením TÉ runy roste (délka + tloušťka) → **po překročení ~⅓ tažení hlavní runy větve se povýší na dominantní sub-větev** a začne nést **vlastní odbočky** (to je smysl: rozvětvuje dominantu a dělá místo). Strop 2 graduace/pramen; graduovaná sedí na **1/5–3/5 délky rodiče** (nikdy u kmene, nikdy na špičce). Počet odboček = **tažené runy elementu** (ne vigor) → oheň/vzduch max 5, zem/voda 4, stín 2. Po vyčerpání run + graduací roste už jen tloušťka/délka. Čísla ladí CODE + golden-verify. ⭐ **Kořen se NEZRCADLÍ mechanicky** (KUKY 2026-08-07, upřesněno): graduace je událost NAD zemí — spustí ji **runa, která překročí práh počtu čtení**; povýšená sub-větev **nedostává vlastní podkořen** (sdílí kořen rodiče). Kořen má vlastní pravidlo (sahá: **méně, DELŠÍCH** výběžků, tytéž runy pramene) — už dnes je to jiný kód než koruna (`rTT subScale:1` vs `growBranch subScale:0`), takže se nic neduplikuje. Zrcadlí se jen **princip**: kořen se prohlubuje, jak se jeho runa opakuje.
- [x] 🐞 **VADA OPRAVENA (F5, 2026-08-07, lab): délka větve teď jde s počtem tažení její runy.** Ověřeno na **reálném logu KUKYho stromu** (318 čtení, 9 větví): korelace **0,23 → 0,92**, převrácené dvojice **12/36 → 3/36**, a runa s **≥1,5× tažení už nikdy není kratší**. Pravidlo → `RUNAR_TREE.md` §5. Původní nález: Měřeno na skutečných vzorcích ze zdroje, 9 hlavních větví: korelace délka↔tažení runy **−0,29**, **21 z 36 dvojic převrácených** (víc čtení = kratší větev). Doklad: Hagalaz 15× → ×0,77 (nejkratší) vs Algiz 9× → ×1,27 (nejdelší). **Příčina:** `sizeF=(0.35+0.65*ageLen(strandAge))*(0.6+0.5*domV)` — počítá jen **věk pramene** × **dominanci ELEMENTU**; počet tažení TÉ runy ve vzorci **není vůbec**. `lenF` navíc přidá **náhodu ±28 %** (`variace` 0,7), která rozdíly z dat přebije (Ansuz a Algiz mají stejnou velikost 1,10, ale délku 1,08 vs 1,27). **Fix (k probrání):** (a) zavést do velikosti/délky člen z **počtu tažení runy**, (b) ztlumit náhodu na délce (přesunout variaci spíš do tvaru), (c) rozhodnout váhu věk vs. praxe.
- [x] **Lab: zredukovat posuvníky na ty s viditelným efektem** — **HOTOVO 2026-10-03** (KUKY: „spousta posuvníků nefunguje, jelikož jsi je nechal být · není to vůbec sladěné“): audit `tree_diag.js sliders` (DEFAULTS=1, výchozí posuvníky) + pixely v prohlížeči pro kůru → z panelu pryč twU0/twU1, gradU0/gradU1, twigSpread, gradGap, kidsMax, childN, twigPer, diversity, strandEvery, gradStrandW, ryhy, kuraVek (0–0,06 % změny); povýšení do TVARU; 41 posuvníků, každý ve svém režimu viditelně mění strom (zrod/dorust jen u čerstvých čtení, WebGL kůra jen v režimu WebGL). Původně: (KUKY 2026-08-02). **Koruna hotová 2026-08-18** jinou cestou, než tu stojí: nic se nemazalo (KUKY: odložit, ne smazat), panel se rozdělil podle druhu páky na TVAR / VZHLED / ODLOŽENO (detail `RUNAR_TREE.md`). **Kmen a kořeny zatím ne.** Původní zadání: Crown-composer má ~40 posuvníků, část BEZ efektu na strom (jistě mrtvé: widthMul, elev, wExp/mExp, RUNE_TUNE; ověřit zbytek). Nechat jen ty, co dělají viditelnou změnu. + TREE AGE presety (3 prameny/1 rok/…) jsou demo-only (irelevantní v log režimu) → skrýt/oddělit. Matoucí pro ladění.
- [x] **„Proč" v LAB inspekci HOTOVO** (2026-08-07). Klik na část stromu řekne: **PROČ TADY** (výška = kostra + intention · směr = kostra + life-rune + area, rozepsané po složkách) · **PROČ TAK VELKÁ** (věk pramene + dominance elementu → velikost/délka) · **ODBOČKY** (runa, kolikrát tažená, délkový násobek, kdo graduoval a co nese) · **KOŘEN** (čím je dán směr — world+element+seed, nebo řízené rozevření s `dev`). Klikatelné jsou i odbočky a kořenové výběžky. Původní zadání:

### Premium features / Fáze B (tap UI, Ask Rúnar)
- [x] **Fáze B1 — segment highlight** (owner vize 2026-07-10) — HOTOVO + OVĚŘENO (SW v165): ťuk na runu → její text-segment **zezlátne**, ostatní text **beze změny** (owner: žádné ztlumení, subtilní; „někdo si skoro nevšimne, to je cajk"). `_parseSegments` vrací `segs`; `_renderSegments` = per-runa spany (`.rseg data-seg`) po `stream()`; tap toggle v `runar-rune-popup.js`; CSS `.rseg.on{color:var(--gold)}`. Hlas beze změny (innerText netknutý), žádný náklad ani změna promptu. Jen spready (2+ run); single plain. Mapování dle POZICE (index) = robustní (řeší Kříž +1).

### B — rozpory / duplikáty k rozhodnutí
- [x] **HOTOVO 2026-08-18: sekce je teď ukazatel na `RUNAR_TREE.md`, pitfall pro `[tune]` zůstal.** Odškrtnuto až 2026-09-23 — oprava proběhla, zápis sem se zapomněl. Původně: **Sekce „Tree of Life — stav" v `CLAUDE.md` nese STAV, který §20.4 zakazuje (2026-08-18, pro CODE-tree).** Čtyři řádky s ✅/❌ („Vizuální engine JE v produkci, 2026-07-10, admin-only beta", „`tree_state`/`tree_readings` DB ❌") — přitom `RUNAR_TREE.md:222` už vlastní *„tabulky zatím NEEXISTUJÍ — je to cíl, ne stav"* a blocker `detectPatterns()` je v tomhle backlogu na :186. CLAUDE.md sám přitom předepisuje „Tree sekce = krátký ukazatel, detail v RUNAR_TREE.md". **CODE-tune to nepřepisuje** (lane), předává se tree lane. ⚠️ Řádka o krmení stromu **regexem přes text čtení** je naopak pitfall pro CODE-tune a musí zůstat — /doctor logika říká pitfalls nechat.
- [x] **UZAVŘENO 2026-08-18 — neduplikuje.** Doslovný překryv hook ↔ CLAUDE.md je 0,3 % proti šumové podlaze 0,2 %; jediný skutečný překryv (3,1 %) je s `working-style.md`, který se při startu nenačítá. Vypadl z toho ale horší nález: repo `CLAUDE.md` je v PODadresáři cwd, takže se při startu nenačítal a po compactu nevkládal — řešeno jednořádkovým importem v `C:\Users\zkuku\CLAUDE.md`. Detail → `RUNAR_DECISIONS.md` 2026-08-18. Původní otázka: nese hook něco, co CLAUDE.md vloží samo? <!-- doc-links:ok 2026-08-18 hook zije MIMO repo a prave to je obsah teto polozky; odkaz musi zustat cteny --> Oficiální docs: *„Project-root CLAUDE.md survives compaction — after /compact, Claude re-reads it from disk and re-injects it."* Náš `~/.claude/runar-context.py` vlévá ~11 kB včetně pravidel. Jestli se to překrývá, je to jedna informace dvěma kanály (§20) a zbytečné tokeny v každé session. ZMĚŘIT (porovnat obsah hooku s CLAUDE.md), pak teprve řezat — netvrdím, že se překrývají.
- [x] **Čočka životní runy nedochází na velké spready** — NÁLEZ BYL ARTEFAKT FIXTURE (ověřeno 2026-08-23 po rozhodnutí ownera „dáme ji tam"): `_lensContext` je ve všech 4 spread builderech a funguje; fixture ㉚ měla lifeRune=R[3] MEZI taženými (slice 0-9) → čočka správně ustoupila → špión hlásil „nedochází" (§19.3 — kontrola na vlastním fixture). Fixture opravena (R[10]), výjimky zúženy. Owner testuje čočku na reálných čteních. Původně: (2026-08-18, nalezla smoke ㉚). `_lensContext` přispívá u `single` a `norns`, ale u `kriz`, `horseshoe` ani `yggdrasil` ne — tam se tedy životní runa jako čočka neuplatní. Nikde není napsané, že to tak má být. Rozhodnout: záměr (velký spread má dost vlastní struktury), nebo mezera jako u ÁVARP? Do rozhodnutí vedeno jako výjimka v `scripts/verify_prompt_levers.js`.
- [x] **UZAVŘENO 2026-08-18 — nepřidává se.** Obrácená páka na 300 čteních (6 ramen, týž den, týž model): vypnutí úhlu u single stejnost NEZVÝŠILO, v islandštině dokonce klesla, a všechny rozdíly jsou menší než rozptyl uvnitř téhož ramene. Čísla → `RUNAR_EVAL_LOG.md` 2026-08-18. Původní stav: **úhel čtení má JEN `single`, ostatních šest cest ne (2026-08-17).** Blok `TWO THINGS THAT NEVER CHANGE` slibuje „každé čtení přichází z jiného úhlu", ale `angleIntro` je jen v `RP_SINGLE`; `RP_LIFE`/`RP_ASK`/`RP_KRIZ`/`RP_NORNS`/`RP_HORSESHOE`/`RP_YGGDRASIL` ho nemají (ověřeno i na složeném promptu). Veškerá práce s úhly v `RUNAR_DECISIONS.md` je o single a nikde není napsáno, že u spreadů být nemá. Rozhodnout: je to záměr (spready mají strukturu z pozic), nebo výpadek?
  - **Zkusil jsem to změřit 2026-08-17 a NEJDE to** — a to je výsledek, ne výmluva. Průměrná párová shoda na trigramech: norns 0,0025 vs single 0,0009 (2,79×), **jenže půlka proti půlce uvnitř single dá 0,0002 vs 0,0029 = 14× rozptyl**. Rozdíl mezi rameny je menší než šum uvnitř jednoho ramene. Příčina je v datech: 923 single, ale jen **23 norns a 0 islandských**. **Co to odemkne:** vygenerovat norns dávku ≥50 v obou řečech, pak metrika začne rozlišovat.
- [x] **UZAVŘENO 2026-08-17 (owner): NEDOPLŇOVAT.** Islandský blok MYNDIN nemá zákaz „přirovnání navršené na metaforu" (2026-08-17, hlas — owner/Cowork).** Anglická verze ho má, islandská ne, a žádný záznam o tom neexistuje. CODE ho nedoplnil schválně: v EN má ten jev **1 výskyt z 800** čtení. Zato islandská čtení jedou na `eins og` mnohem víc než anglická na `like/as if` — **33,1 % vs 6,0 % čtení · 4,90 vs 0,91 na 1000 slov** (přežilo půlku proti půlce). ⚠️ Není to čistý důkaz: `eins og` je běžný idiom i mimo přirovnání. Otázka pro hlas: **je ta míra přirovnání v islandštině v pořádku, nebo Rúnara ředí?** Podle odpovědi buď doplnit pravidlo (a ověřit vazbu přes `is-vazba.py`), nebo zapsat, že IS ho mít nemá.
- [x] **UZAVŘENO 2026-08-17 — zámek zbytečný: `runar_character` sloupec `grammar` NEMÁ a tabulka je prázdná (0 řádků, ověřeno `supabase db query --linked`); žádný kód do ní nezapisuje. Jediná cesta byla shrine `{...DEF_CHAR}` a ta je zalepená. Hlídá to smoke ㉙ (`test_spine.js`).** Původní otázka: smí uložená postava přepsat islandský gramatický blok? Vlastní postava z `runar_character` přebíjí jazykový výchozí pole po poli — včetně `grammar`. Uložená anglická postava tak z islandského promptu udělá anglický (změřeno na shrine: 3780 vs 4855 znaků, blok gramatiky pryč, místo něj „Respond only in English"). Argument pro zámek: gramatika není rys povahy, ale 🔒 externě ukotvená islandština (§2). Souvisí: **owner ať zkontroluje, jestli v `runar_character` je aktivní řádek a co v něm je** — ze stroje CODE to nezjistí.
  - **Otestováno 2026-08-17 osmi tvary řádku, obě řeči.** Nebezpečný je **jen řádek, který má v `grammar` skutečný text** (pak IS prompt spadne z 4855 na 3780 znaků, gramatika pryč, místo ní „Respond only in English"). Bezpečné jsou: prázdný řádek, jen `personality` (4712), cizí sloupce `id`/`active`/`created_at` (4696) i `grammar` = prázdný řetězec (4855) — merge přeskakuje prázdné hodnoty (`runar-character.js:1105`). ⚠️ **Je to symetrické:** islandský řádek rozbije stejně tak ANGLICKÝ prompt. Uložená postava je jazykově slepá. → **Zámek by tedy stačil na JEDNO pole `grammar`**, ne na celou postavu.
- [x] **`RP_SINGLE.*.noqBranch` si odporuje se zbytkem promptu** — VYŘEŠENO při systémovém průchodu 2026-08-22 (dnes: „Mention X by name once, woven naturally", žádné „Let…" otevření runou; ověřeno v kódu). Původně: (nalezeno 2026-08-20 při měření „pojmenuj runu"): řádka začíná *„Let the quality of X arrive through image, **not explanation**"* / *„Láttu táknræn gæði X koma fram í myndum, **ekki útskýringu**"*, zatímco týž prompt o kus dál žádá `Mention X by name once`. Model tedy dostává dva pokyny proti sobě a rozhoduje se sám — a **rozhoduje se jinak podle jazyka**: s novým pravidlem „pojmenuj + uvaž obraz" anglický model starou větu přebil (6/8), islandský ji poslechl (4/20). Po smazání té jediné věty IS 8/20, EN beze změny — takže ta věta brzdí jen islandštinu, tedy primární jazyk (§2). ⚠️ Platí i BEZ nového pravidla: „zmiň runu jménem, ale nevysvětluj" je rozpor sám o sobě. Měření + čtení vedle sebe → artifact „Most mezi runou a obrazem" (2026-08-20). Rozhodnout: přepsat řádku tak, aby prompt říkal jednu věc.
- [x] **Zastaralý komentář u Yggdrasil builderů** — opraveno ve v4.13 patchi (2026-08-23):
  komentář teď nese kánon (kdykoliv/kdokoliv přihlášený; vrstvy V5 nečasově).
- [x] **„Prázdné řádky v deníku" — UZAVŘENO: NENÍ BUG, byla to chyba měření** (2026-08-23).
  Řádky Berkana 18:10 a Jera 18:18 nesou KOMPLETNÍ čtení (340/301 znaků, uzavřená, usage zapsán) —
  CODE-tune četl `deep_text`, který je u singlu VŽDY prázdný (single bydlí v `short_text`).
  Stop v UI na server nedosáhne: proxy volání dokončí, odečte až PO úspěšném textu a čtení uloží
  CELÉ (invariant charged ⇔ journaled) — uživatel o zaplacené čtení nepřijde, najde ho v deníku.
  Kredit při stopu: rune_seeker ANO odečte (správně — neodečíst = start+stop dává Claude zdarma,
  serverový náklad běží tak jako tak); owner-admin metering přeskakuje (`!isAdmin` v proxy;
  ledger 23.8. prázdný, ověřeno). Volitelný nice-to-have: po stopu toast „čtení najdeš v deníku".
- [x] **Blank: jen 2 obrazy a jeden je abstraktní → model si maluje sám (voda)** — HOTOVO 2026-08-22: owner schválil, abstraktní řádek → nýfallinn snjór, přidán handfæri (Blank 3 obrazy); zároveň kajka za druhé „první kroky" jehně. Původně: (nález
  Cowork handoff 27 + ověření CODE-tune 2026-08-22): řádek „Everything is still before what
  is to come" je jediný řádek banky BEZ scény; model do prázdna 2× nezávisle domyslel tichou
  vodní hladinu (shrine ř. 317+323). Voda v runes.js Blank NENÍ — není to vlastnost runy.
  Motiv-guard s tím nesouvisí (sáček per runa; u 2řádkové banky se točí rychle). NÁVRHY
  ověřené (slepý test EN 3/3, IS ≥2/3, aspekty 3/3): nahradit abstraktní řádek „Nýfallinn
  snjór…/New snow lies over the track…" (óskrifaður möguleiki) + přidat třetí „Handfærið…/
  The line runs down into dark water…" (hið óþekkta — dává vodnímu tahu modelu řádný domov).
  Čeká na verdikt ownera; pak zapsat do DECISIONS s výměnou jehněte (viz chat 22. 8. večer).
- [x] **Yggdrasil V5 — NASAZENO v4.12-mynd 2026-08-23** (9 významů Cowork #45, IS ověřeno, slepě EN 8/9 · IS 7/9, Norny z hlaviček ustoupily). Zbývá: oko ownera na celém čtení + živý provoz. — PŘERÁMOVÁNO 2026-08-23 (handoff #37: otázka „appka vs. doc" byla špatně položená — owner chce nejlepší možné významy, ne reconciliaci dvou starých). Čeká: owner potvrdí Coworku zadání → návrh → schválení → CODE-tune nasadí s golden+měřením. Původní rozchod (5/9 světů): (Cowork handoff #35 + ověření 2026-08-23): doc měl Hel=kořeny/předci/minulost, kód má Hel=completion/fulfilling itself · Vanaheimr příroda/intuice × harmony/balance · Álfheimr vědomé/jasné × creativity/kindling · Níðavellir řemeslo × deep source (řemeslo kód dává Svartálfaheimru) · Niflheimr potlačené × origin/unresolved. Opis z docu odstraněn (§20, poznámka doplněna) — původní znění v git historii RUNAR_DESIGN.md. Owner určí kánon; pak případná oprava RP_YGGDRASIL packů (EN+IS) jedním měřeným krokem.
- [x] **„blind side" v `_registerContext` (Confirmation, EN+IS) — personifikující idiom** — HOTOVO 2026-08-22: otestováno A/B/C dle předpisu (n=8/rameno/jazyk, zamčený zbytek), vyhrál B „out of frame" (unaware 6/16 → 0/16), nasazeno ve v4.5-mynd, data docs/eval/2026-08-22-registr-ab/. Původně: (handoff Cowork 2026-08-22): bezpečný podmět, ale idiom skoro vždy o povědomí osoby — táž rodina jako opravené „beneath the surface" v úhlu. Tři návrhy přepisu v handoffu (A prostorový · B kotvený v obraze · C minimální), IS znění NEOVĚŘENÁ. ⚠️ Blok „co hledám" je od 2026-08-22 K LEDU (rozhodnutí ownera — ladí se čtení samo); řešit AŽ při jeho návratu, testem přes atribuci (zamčený zbytek, n≥8, oba jazyky), ne rovnou nasazením. Metodická přidaná hodnota hned: test „personifikující idiom" — použil-li by se výraz o člověku, znamenal by skoro vždy „něco, co o sobě neví"? — přidat vedle čáry podmětu při psaní příštích řádek promptu.
- [x] **Čtvrtý živý rozpor v promptu: DEF_CHAR „Does NOT explain — reveals" vs describe — VYŘEŠENO v4.0-mynd 2026-08-22 (sjednoceno: „does NOT lecture or explain around the image — he reveals: one image, and one essence line"). Původně:** vs describe „NAME THE RUNE… say in ordinary words"** (nalezeno 2026-08-22 při prověrce pravidla jména). Stejná rodina jako noqBranch/zakončení/oblast. Řešení patří do v4.0: „reveal" = esenční řádek dle `RUNAR_DESIGN.md` „tři beaty" (L1) — jedna formulace, ne dvě proti sobě. ⚠️ Vlastní poučení: pravidlo formy jsem 2× vymýšlel bez čtení DESIGN, ač memory `read-design-before-voice-work` přesně tohle zakazuje — esenční řádek tam byl NAPSANÝ (NEPOSTAVENO).
- [x] **OPRAVENO 2026-09-27 (KUKY: „hook ano")** v `~/.claude/tree-guard.sh`, tři vady: (1) compact už nepřepisuje marker session (Stop dřív zapomněl vše před compactem); (2) neplatný JSON z `runar-context.py` spadne na statický text; (3) Stop zastaví jen tu session, která na věc sáhla sama — ověří se ve volání nástrojů v jejím transcriptu (necitelný transcript → původní chování). Otestováno 7 případy (vč. „builder změnila jiná session" → nezastaví) a na skutečném transcriptu 138 MB (~3,4 s, běží jen když by hook jinak zastavil). Záloha `tree-guard.sh.bak-2026-09-27`. Původně: **Stop hook „TREE ENGINE" viní špatnou session** (2026-08-20, narazila CODE-tune): `tree-guard.sh` rozhoduje podle STAVU pracovního stromu, ne podle toho, co změnila TA session. Dnes zastavil CODE-tune kvůli neverzovaným `build_branch_composer.py` + `v2/tree-lab-branch-composer/runar-branch.js`, které patří CODE-tree — ověřeno, že žádný dnešní commit CODE-tune na tree nesáhl. Ve sdíleném stromě to nastane pokaždé, když má CODE-tree rozdělanou práci, takže z hlídače je nag, který kryje vlka (týž mechanismus jako 35 holých escape značek → §28). Fix je v témže souboru o pár řádků výš: memory-guard větev už porovnává `-nt "$MARK"` proti markeru session, tree větev ne. Soubor žije mimo git → viz položka o hoocích níž.  <!-- doc-links:ok 2026-09-27 hook je uživatelský soubor ~/.claude mimo repo, do gitu nepatří (doplnil CODE-tune kvůli smoke ⑯) -->

### C — profi / SRE mezery (OWNER: vysvětlit podrobně před realizací)
- [x] **Proxy: zablokovat neautentizovaný request** — HOTOVO + NASAZENO 2026-08-02 (Fáze 1): `if(!userId) return 401` na claude-proxy (v51) i elevenlabs-proxy (v28) + rate-limit klíčovaný jen na `userId` (padá XFF spoof). Ověřeno naživo: anonymní POST → `{"error":"unauthorized"}` 401. **Zbývá: zúžit CORS** z `*` na origin appky (defense-in-depth).
- [x] ⚠️ **CRITICAL — metering přes `Math.max(1, x)` s NaN** — OPRAVENO 2026-08-22 (sanitizace celé číslo 1..9 na jednom místě; kontrola ⑨ ji adversariálně spouští, falzifikováno proti staré proxy). Původně: (odhaleno audit 2026-08-03, PRE-EXISTUJÍCÍ, ne z #4): nečíselná cena od klienta (`spread_cost:"constructor"` / `spread_cost:{}`) → `Math.max(1, x)` = **NaN**. NaN poráží VŠECHNY kontroly: `creditsBalance < NaN` = false → přeskočí zůstatek; odečítací smyčka `for(i=0;i<NaN;i++)` = 0 odečteno → **neomezená čtení zdarma** pro přihlášeného rune_seekera z 0 zůstatku (jediný limit = 10/min rate). Stejně padá i monthly cap (`used+NaN>limit` = false). Expozice teď ~0 (žádní veřejní users, jen test-účet), ale **fix nutný před launchem**: cenu validovat jako kladné celé číslo (`Number.isInteger(cost) && cost>=1`), jinak 400. Jednořádkový, ale nasadit až po rozhodnutí o #4 (souvisí). Report: `tasks/wqxu3uuar.output`.

### 🔴 Blockery prodeje — OWNER (odloženo, trigger = **6. 9. 2026**, scheduled task `runar-launch-blockers-reminder`)
- [x] **Supabase DPA** — ~~podepsat~~ **nic se nepodepisuje**, je součástí Terms of Service (owner ověřil v dashboardu 2026-09-12). Detail → `RUNAR_PRIVACY.md`.

### 🟠 CODE — odblokované, v pořadí
- [x] **Reading contract → 4 spready** — HOTOVO 2026-07-14 (commit 39bf41d, prompt v0.7, smoke ⑧ hlídá). Bylo: ← `_lensContext`/`_domainContext`/`_registerContext` se volají JEN v single (character.js:831-833). Spready dostanou holé labely („Seeking: Clarity") bez direktiv → SEEKING stance rule + Confirmation reframe (v0.6) na ně NEJDOU. Dodělává copy-doc #5.
- [x] **Monthly cap 50/75 v claude-proxy** — HOTOVO 2026-07-16 (1c584c3, SW v196). `MONTHLY_LIMITS` + `month_units`/`month_key` na user_profiles; reset porovnáním `month_key` (bez cronu). Ask Rúnar = NEpočítá se (není cast, `mode:'ask'`). Fail-open při chybě čtení počítadla. Smoke ⑨ hlídá config==proxy. SQL: `sql/2026-07-16_monthly_cap.sql`.
- [x] **Vratit `err_monthly_limit`** — HOTOVO (overeno 2026-07-19, skeptik potvrdil cely retez): claude-proxy vraci `error:"monthly_limit"` -> `runar-reading.js` mapuje na `t('err_monthly_limit')` -> obe jazykove verze v translations existuji. Capnuty user dostane spravnou hlasku, ne generickou.
- [x] **Zivotni runa je NEMENNA** — HOTOVO 2026-07-19: SQL `sql/2026-07-19_life_rune_immutable.sql` PUSTENO ownerem (trigger `trg_life_rune_immutable` zamyka life_rune_* i dob_* pro roli authenticated). Admin reset tlacitko odstraneno cele (§13 full-path). Reset se dela SQL prikazem z konce te migrace. **Tim je odblokovane zlevneni Life Rune na 0.**
- [x] **Image pool klíčovaný runou** — HOTOVO 2026-08-10, postaveno pod jménem `RUNE_IMAGES` (`v2/runar-character.js`): 81 položek × `[runa, sezóna, IS, EN]`, 2–5 na runu, všech 25 run, obě řeči na jednom řádku. Původní zadání říkalo „single první, spready až potom" — udělány rovnou všechny. Pokrytí ověřeno: 150/150 kombinací runa × sezóna má kandidáta.
- [x] **„already/þegar" — zadání přepsáno a POKRYTO 23. 8.:** slovo není vada (IS „þegar" = spojka „když"; EN „already" ve scéně je v pořádku — „fruit is already forming"). Vada je VZOREC „already known/deciding (somewhere beneath you)" = skryté vědění/predestinace — a ten už jmenují podtypy soudce chladu (profsteinn) a hlídá ho testování + no-recur. Samostatná páka se nestaví. Původně: Původní znění mířilo na *odstranění* toho slova. KUKY 2026-08-10: *„nejde nám o to zbavit se například `already` úplně. To byla chyba a nedorozumění. Chceme mít čtení vyvážená. Nejdeme hardcore zákaz na 0."* Prompt pravidlo (`_noColdRead`) míří na POHYB, ne na slovo, a to je správně — zůstává. Co zbývá: sledovat výskyt jako **ukazatel vyváženosti** (`measure_readings.js --balance`), ne jako počet prohřešků, a nestanovovat cílovou hodnotu.
- [x] **No-recur regresní sada** — POSTAVENA 2026-08-23: `scripts/verify_no_recur.py` (BAD_PATTERNS z check-is + fixed „selection" reporty → uložená čtení v DB [30denní okno = červená, starší = info] + commitnuté dávky [žlutá s místem]). Kalibrováno: květnové výskyty nehlásí jako návrat. Pouštět na požádání + před vydáním (síť, není ve smoke). Původně: — opravená model-output fráze se VRACÍ („Sittu með": F-001 ✗ · F-005 ✓ · F-006 ✗). Musí běžet nad OUTPUTEM (is-grammar-qa plocha), NE `check-is` (= source linter). Korpus už existuje (server-side save).
- [x] **Zvětšit SEASON_POOLS** — BEZPŘEDMĚTNÉ (ověřeno 2026-08-12). Položka tvrdila „tenké sady: darkening/bright 5, autumn/cold 6" — **naměřeno 12 a 10**, nejmenší sada má 8. A hlavně: od v1.6 vybírá obrazy `RUNE_IMAGES` klíčované runou pro **oba** jazyky, takže na `SEASON_POOLS` se propadne jen runa bez kandidáta — **0 ze 150 kombinací**. Zvětšovat je nemá co řešit.
- [x] **Eval harness v gitu** — HOTOVO. Položka tvrdila, že `scripts/utils/` není verzovaný (zjištěno 2026-07-19); dnes je tam **11 trackovaných souborů** včetně `gen_batch.js`, `measure_readings.js`, `lint_readings.js`, `export_readings.js`, `compare_readings.js`.

### 🟡 OWNER rozhodnutí
- [x] **Yggdrasil timing — ROZHODNUTO A DOTAZENO** (KUKY 2026-07-18: celorocne, kdykoliv, kdokoliv prihlaseny). Kodovy zbytek, ktery si rozhodnuti vyzadalo, byl 2026-07-19 dodelan: `SPREAD_CONFIG.yggdrasil.seasonal` („Dec 14-28 only") smazan z configu.  <!-- check-docs:ok 2026-07-19 cituje zrusenou datumovou branu jako ZRUSENOU; prave o jejim smazani ta polozka je --> Byla to mrtva data — nikdo je necetl, ale kdo config cetl, precetl si tam zrusene pravidlo. Presne proto to owner opravoval PETKRAT.
- [x] **runar-patterns.md** — VYŘEŠENO 2026-07-30: retired do `docs/archive/tree/`, prahy pro `detectPatterns()` přeneseny do sekce „Tree — pozastavené signály" výše.
- [x] **Mytologické obrazy** — ZAVŘENO 2026-08-22 (KUKY: NE). Duplikát položky výše — obě zavřeny týmž rozhodnutím.
- [x] **Sigil Studio v0** — UZAVŘENO 2026-08-22 (KUKY: „sigil tady nemá co dělat, celkově nemá být v Rúnar"). V `v2/` žádný sigil kód není (ověřeno grep), nic k mazání.

### 🔵 COWORK
- [x] **Tier jména — ROZHODNUTO** (KUKY 2026-07-18): Rune Seeker · Rune Walker · Rune Wanderer,
      IS Leitandi · Vegfarandi · Ferðalangur. Zdroj pravdy = `TIERS` v configu; „Rune Keeper" retired  <!-- doc-values:ok 2026-07-19 legacy: vzniklo před pravidlem, důvod nedoplněn -->
      (Keeper zůstává Rúnarovi). Zbývá jen dotáhnout label na ~10 místech v kódu (§13 full-path).

### 🟢 Dlouhý ocas (kód, nízká priorita)
- [x] **VYŘEŠENO 2026-09-26 (kotva SEEKS = význam věty, test ve smoke ㉬; DECISIONS 2026-09-26 (12))** ~~`scripts/utils/test_lever_maps.js` padá na SEEKS (9 ✘) a nikdo to nevidí~~ — není zapojený ve smoke. Kontroluje, že věta rejstříku obsahuje jméno své hodnoty, ale nálepka registru („The seeker asks for clarity —“) se 2026-09-08 odebrala záměrně (komentář u `_registerContext`). Ověřeno 2026-09-23 na HEAD i po přepisu oblastí: tentýž výsledek, AREAS část prochází. Rozhodnout: SEEKS část přepsat na kontrolu pořadí jinak (např. otisk věty), nebo ji odebrat — a pak test zapojit do smoke, ať hlídá aspoň AREAS. (CODE-tune)
- [x] **Opus 5 s přemýšlením `low` — NE** (KUKY 2026-10-04: *„nevypadá to lépe, takže ne"*, DECISIONS 2026-10-04 (4)). Pilot EVAL_LOG 2026-10-04 (3):
  63 slov × dnes 71, ~6 s × 4 s, $0,0148 × $0,0105; **1/6 čtení useknuté** na stropu 700 → pro produkci tvar
  `thinking: {type: "adaptive"}` + `output_config: {effort: "low"}` a `max_tokens` s rezervou na přemýšlení (claude-proxy).
  Anthropic (Prompting Claude Opus 5): *„thinking enabled at low effort performs better than thinking disabled at similar cost"*.
- [x] **Úklid po vypnutí čočky životní runy — HOTOVO** (2026-09-26 mrtvé větve z builderů, DECISIONS 2026-09-26 (12); 2026-09-27 DB sloupec
  `life_rune_in_readings` zahozen + grant odebrán, DECISIONS 2026-09-27 (1)). `_lensContext` zůstává jako laboratorní funkce (§26).
- [x] **HOTOVO 2026-09-30 (DECISIONS 2026-09-30 (6)):** Rune Seeker → Standard (platilo od 25. 9.), Standard po otázce → Premium. Původně:
  **Text zamčeného Asku pro Rune Seekera** — dnes *„Rúnar has one answer left — Premium hears it.“* (sedí na starý model „jedna odpověď
  zbývá“). Owner: *„něco přirozeného… nemělo by se to úplně vymykat“* ostatním teaserům (*„Deeper questions open with {tier}.“*). Návrh v chatu 2026-09-25.
- [x] **Norny: obraz se zvířetem — VYŘEŠENO 2026-09-30** (DECISIONS 2026-09-30 (2)): Skuld mluví o niti, ne o „tobě“; za obraz
  zvířete jde B2 (pojmenuj + z jeho strany, k tazateli až poslední věta); jméno ne uprostřed. EN test ownera + IS kontrola.
- [x] ~~**Islandský úhel se opisuje do čtení jako první věta**~~ — **ZAVŘENO 2026-09-26, owner: „úhel necháme“** (přepisy horší, viz níž). (nalezeno 2026-09-24 v pilotu podob oblastí; CODE-tune).
  `READING_ANGLES_IS` (`runar-utils.js`) má *„Líttu fyrst snöggt yfir alla myndina, láttu svo allt hverfa nema eitt."* — rozkaz
  čtenáři, který model může použít jako první větu. Stalo se u Opus 5 (*„Líttu snöggt yfir alla myndina, láttu svo allt hverfa nema
  laukinn í moldinni."*) i u Opus 4.8 (EVAL_LOG 2026-09-24). EN znění *„Open with one quick glance…"* je pokyn PISATELI a opsat
  nejde. Návrh: IS jako pokyn pisateli (např. *„Byrjaðu á…"*), ověřit nástroji a změřit opis na produkčním modelu před/po.
  → **Změřeno 2026-09-26 (CODE-read, EVAL_LOG 2026-09-26 (5)): přepis NEPOMÁHÁ, nechat produkci.** Dvě znění jako pokyn pisateli
  (*„Byrjaðu á því að renna augunum…"*, *„Fyrsta setningin nefnir myndina alla…"*) převyprávěla své sloveso 2/6 (Rúnar v 1. osobě /
  rozkaz *„Staðnæmstu…"*), produkce 1/6; doslovný opis z 2026-09-24 se v 7 čteních neopakoval. Owner souhlasí → zavřeno.
- [x] **VYŘEŠENO 2026-09-26 (smoke ㉬)** ~~`scripts/utils/test_lever_maps.js` je červený od 2026-09-08 a nikdo to nevidí~~ (nalezl CODE-tune 2026-09-25; není ve smoke).
  Část SEEKS čeká, že věta `_registerContext` JMENUJE svůj rejstřík („Clarity"…) — jména ale byla 2026-09-08 ze zadání záměrně
  odebrána (memory `prompt-nepojmenuj-co-hned-zakazes`), takže 9 z 10 kontrol padá (ověřeno i na kódu před v4.56). Část AREAS
  prochází. Oprava: pro SEEKS jinou kotvu (tvar mostu hlídá už smoke ㉨ (1)) nebo SEEKS část odebrat, a test zapojit do smoke.
- [x] **~~Tenké runy v bance obrazů~~ → HOTOVO 2026-09-24 (v4.50, DECISIONS 2026-09-24 (3)): žádná runa pod 3 obrazy v žádném období.** (změřeno 2026-09-23 po v4.49): od 1. 10. (říjen–únor) mají **Uruz, Berkana, Ehwaz, Ingwaz** jen 2 dosažitelné obrazy; **Dagaz a Blank** mají 2 od března do září. Se dvěma obrazy se čtení střídá A-B-A-B → přesně report „stejné čtení jako minule“ (Tiwaz/Thurisaz v září). Dopsat 2 obrazy na runu z ownerových popisů, brána s popisy. (CODE-tune)
- [x] **VYŘEŠENO 2026-09-27 (DECISIONS 2026-09-27 (10))** ~~**Obraz se může zopakovat napříč zařízeními**~~ (dnes sáček i „poslední obraz“ žijí v localStorage = per zařízení). **Doklad:** KUKY report 2026-09-23 18:42 *„podruhé za sebou rebarbora“* — Berkana 22. 9. 14:24 a 23. 9. 18:39 (UTC), obě s rebarborou. Oprava „nikdy tentýž obraz hned po sobě“ šla ven 18:36 UTC, druhé čtení přišlo o 3 minuty později — skoro jistě ještě na starém kódu (nasazení + cache); a i po opravě platí jen na jednom zařízení. V září má Berkana 5 kandidátů, takže z jiného zařízení je to 1 : 5. **Levné řešení bez serveru:** před losem načíst poslední čtení téže runy z journalu (`readings.prompt_draws` nese obraz) a vyřadit ho stejnou cestou jako `seasonlast_` (`_seasonBagPick(…, exclude)`). Jen pro přihlášené; návštěvník zůstává u localStorage. (CODE-tune 2026-09-23)
- [x] **Kříž má jiný formát position-bloku než ostatní 3 spready** — SJEDNOCENO v4.7-mynd 2026-08-23 (LABEL:
- [x] **VYŘEŠENO 2026-09-27 (DECISIONS 2026-09-27 (12), v4.70) — 22 vět přepsáno, 4 skutečné chyby opraveny; zbývají jen štítky/seznamy/JSON, otázka runy v uvozovkách a ÁVARP (záměrně).** ~~**IS: dlouhé víceklauzové věty promptu nejdou rozparsovat (E001, §19.2)**~~ — týká se tie-breakeru `_priorityContext` (character.js) **i řádků `VOICE_PROFILES.focused.is`** (config.js) — GreynirCorrect neuparsuje větu, která začíná „Ef þetta rennur ekki saman í eina náttúrlega mynd: Haltu … fremst…". **Změřeno 2026-08-08:** E001 má i PŮVODNÍ shipnutá věta i varianta bez dvojtečky (`skaltu halda`); samotná druhá půlka parsuje čistě → vinu nese úvodní podmínková klauzule, ne úprava z commitu C (žádná regrese). Přepsat, dokud nástroj nerozumí = změna promptu → vlastní tag + golden. (`rúnunum`→`rútunum` je false-pos.) **D6 2026-08-08:** týž závěr u profilu — E001 na dotčených řádcích bylo 2/2 před změnou i po ní. Společný jmenovatel: dlouhá věta s dvojtečkou a několika středníky. Řešení = rozsekat na kratší věty (změna promptu → vlastní tag + golden).
- [x] **Ask Rúnar jako teaser pro rune_seeker + standard** — **HOTOVO 2026-08-09.** Owner 08-06 *„měl by vidět, ale neměl mít přístup"* + 08-09 *„ASK RÚNAR má být teaser pro ty, co ho nemůžou použít"* — obojí platí a nejsou v rozporu: **vidět ano, použít ne.** Přihlášený bez oprávnění vidí blok celý, inertní, + jedna řádka (`ask_teaser`) jmenující tier z configu. Visitor teaser nedostane (jeho další krok je registrace, ne Premium). Přístup hlídá server (viz RUNAR_DECISIONS 2026-08-09).
- [x] **UZAVŘENO 2026-08-20 — vyřešeno už 2026-08-16, jen to nikdo nezaškrtl.** Úhel [5] dnes zní *„Open at the edge of the image, where one thing turns into another"* — slovo „stirring" ani vazba „this rune" v `v2/runar-utils.js` nejsou (ověřeno ve zdroji). Definitivní přepis všech sedmi úhlů „doména → vstup do obrazu" = `e208a3a` + `3d55f94`; citace v tomhle řádku byla z mezikroku 2026-08-13. Nález Cowork, ověřil CODE-tune. Původně: **Úhel [5] „what is stirring" má tutéž vadu, kterou Cowork právě odstranil z [0] a [1]** — znění *„Lead with what is stirring — name the movement this rune makes visible"* / *„Byrjaðu á því sem hrærist — nefndu hreyfinguna sem þessi rúna gerir sýnilega"* se ptá **na runu**, ne na život leitanda. V dávce 2026-08-09 vyrobil 2/2 definic (EN) a 2/2 papouškování obrazu (IS) — n=2, takže **hypotéza, ne nález**; strukturní argument ale platí bez ohledu na n. LANE: obsah = Cowork, CODE jen zadrátuje a změří. Změřit jde teď vynuceným úhlem: `node scripts/utils/gen_batch.js --angle 5` (n≥25 staré znění proti novému).
- [x] ✅ **ARCHIVOVÁNO 2026-09-28** (KUKY „yggdrasil co je ve shrine archivovat“, DECISIONS 2026-09-28 (4) → `docs/archive/runar-yggdrasil.html`). ~~**`v2/runar-yggdrasil.html` si staví prompty sám a rozhodnutí se k němu nedostávají**~~ <!-- doc-links:ok 2026-09-28 soubor záměrně přesunut do archivu --> — nevolá `buildReadingPrompt`, skládá tři prompty inline v template literálech, a proto **pořád vkládá rúnaþulu**, kterou jsme 2026-08-09 vypnuli v readeru (definice runy → model ji opisuje doslova). Nemá ani `_describeRule`, ani `_noColdRead`. Je to admin stránka ze shrine (není v `sw.js`, naposledy měněná 2026-07-18), takže netrpí uživatel — ale je to druhá, paralelní implementace promptu (§18) a každé další rozhodnutí o hlasu ji mine stejně. Rozhodnout: napojit na buildery, nebo poslat do `docs/archive/`.
- [x] **🐞 `rworld()` má jen ANGLICKÉ popisky — UŽ NEPLATÍ** (ověřeno produkční cestou 23. 8.: DREGNA RÚNA řádek je islandský; zbývala jen sesterská vada elementů — opravena v4.6, relements s IS mapou). Původně: — islandský prompt nese angličtinu** (nalezeno `lint_prompts.js` 2026-08-13). `v2/runar-utils.js` mapuje Midgard → „the living moment, what is active now" a stejně tak Hel/Asgard/Vanaheim/Jotunheim, bez jazykové větve. V IS promptu se ta anglická fráze objeví **dvakrát** — v řádce `DREGNA RÚNA` a v otevírací větvi. Porušuje §2 (IS je primární, ne překlad). Potřebuje pět islandských popisků → **obsah = Cowork**, zadrátování + golden = CODE.
- [x] **Popis světa je v promptu dvakrát — UŽ NEPLATÍ** (ověřeno 23. 8.: 1 výskyt v produkčním promptu; oprava přišla 13. 8. — noqBranch svět nevypisuje). Původně: (tentýž nález, druhá vada): `rworld()` se vkládá do `DRAWN RUNE:` i do otevírací větve `Open with X — let its quality (…)`. Sedm slov navíc v každém čtení, v obou jazycích. Rozhodnout, která z těch dvou zůstane.
- [x] **IS: pokyn o rodu je v promptu dvakrát — UŽ NEPLATÍ** (ověřeno 23. 8.: grammar pravidlo 5 dnes zní „Kynið er tilgreint í ÁVARP; fylgdu því" — odkaz, ne duplikát). Původně: — `DEF_CHAR_IS.grammar` pravidlo 5 („Samræmdu ÖLL lýsingarorð og fornöfn um þú") a `_addressContext` (ÁVARP) říkají totéž. Systémový prompt to navíc říká obecně, čtecí konkrétně — pravděpodobně stačí ten druhý.
- [x] **`hooks/pre-commit.py` nechává v indexu STAROU verzi `sw.js`** — VYŘEŠENO 2026-08-22: `hooks/post-commit.py` index sám srovná + smoke ㉞ minu hlídá. Původně: — po `git commit -F msg -- <cesty>` (pathspec, bez `v2/sw.js`) skončí HEAD i pracovní strom na nové verzi, ale **index na předchozí** (pozorováno 2026-08-09: HEAD/working v286, index v285; a před tím tam ležel v284 z jiné session). Je to přesně ten stav, ze kterého 2026-08-02 vznikl produkční downgrade v249→v248 — downgrade guard v hooku ho chytí, ale vzniká pokaždé znovu. Zatím se uklízí ručně: `git restore --staged v2/sw.js` (obsah souboru nemění).
- [x] **Mapa promptu: zrušit citace čísel řádků** — HOTOVO 2026-08-09. Při překreslení na v1.5 změřeno, že mimo bylo **14 z 14** citací, některé o 100+ řádků (`buildSysPrompt` mapa:775 / kód:631). Všechny nahrazeny jmény symbolů (`character.js · buildSysPrompt`) — ta se neposouvají a dají se grepnout.

### Slova tipů Asku — pokus B 2026-10-06 — tipy vyřešeny (DECISIONS 2026-10-06 (12), (13)), zbývá IS (CODE-tune)
- ✅ **`ask_h_now`** *„Why is this showing up now?"* — **odstraněn** (owner *„odstranit"*); odpověď začínala odmítnutím 9/9.
- ✅ **`ask_h_seek_challenge`** → *„Where does this get hard?"* / IS *„Hvar verður þetta erfitt?"* (owner *„opravit"*, *„ok"*).
- ✅ *„Does this confirm what I already feel?"* — **odstraněn** (owner *„pryč"*, DECISIONS 2026-10-06 (13)); u Confirmation žádný tip z hledání.

### Audit promptu 2026-10-07 — zapsané nálezy. NEOTVÍRAT znovu, dokud se vada neobjeví v nových čteních a owner na ni neupozorní (CODE-tune)
1. ✅ **Už opravené dřív** — *grey hour* (v4.57, 2026-09-25) · *roots* (svět z hlavičky pryč, v4.58) · Blank *„the stone that bears no mark“*
   (v4.59) · Berkana *„that crossing“* (2026-09-28) · *home-field* u Raidha (2026-10-06). V prvním průchodu auditu stály jako nové — omyl.
2. ✖ **Není vada** (owner 2026-09-25): *„You see the room more clearly…“* je popis scény, ne tvrzení o člověku. „Tvrzení o člověku ~7/79“
   z prvního průchodu stálo na stejném omylu — zrušeno.

### Prompt × návody výrobců (Anthropic Opus 5, OpenAI GPT-6) — nálezy 2026-10-04, ČEKÁ NA OWNERA, co s nimi (CODE-tune)
1. ✅ **Rozpor JSON × ✦ — HOTOVO 2026-10-04 (v4.92, DECISIONS 2026-10-04 (6)):** ✦ výslovně dovnitř JSONu; Opus 2/6 → 6/6 uvnitř.
3. ✅ **Pravidla dvakrát i třikrát — single HOTOVO 2026-10-05 (v4.93, DECISIONS 2026-10-05 (1)):** závěr bez kopií délky, odstavce
   a jazyka. „Jméno runy 2×" byl omyl auditu (rámec [0] runu nejmenuje) — zůstává. Systémový prompt (kánon) nedotčen; jeho
   „Never hand a conclusion" × „never tells the seeker what to do" nejsou čisté kopie (závěr × krok). **Zbývá:** spready mají
   vlastní kopie (Norny: „not three separate readings" 2×, „Respond in English." vedle systému) — měnit až s měřením.

### Část 1 — claude-proxy (`supabase/functions/claude-proxy/index.ts`, 958 ř., přečteno celé 2026-10-09)
1. ✅ *(opraveno a nasazeno 2026-10-09, CODE-tune — server i klient, owner „opravit obě chyby“; DECISIONS 2026-10-09 „Volné čtení jen na single…“)* 🟠 **Čtení zdarma dá i spread.** Nový Rune Seeker (`free_balance` 1) si vybere Yggdrasil → klient pošle `use_credit:false`
   (`shouldUseCredit()` hledí jen na `free_balance`) → proxy jde do free větve, která `spread_cost` nečte → Yggdrasil za jedno volné
   čtení. Poctivá cesta z UI, ne podvrh. Design říká „Single zdarma, spready za kredity“ (`RUNAR_DESIGN.md` Spreads per tier).
   Navržená oprava (NEprovedena — mění peníze a chce nasazení): v proxy `if (use_credit || spreadCost > 1)` → placená větev; kdo
   má kredity, zaplatí kredity a volné čtení mu zůstane na single; kdo nemá, dostane 402 `no_credits`. Pokus 2026-08-03 (#4) skončil
   regresí „402 i s kredity“ — tahle podoba ji nemá, protože s kredity jde do placené větve. Podvrh klientem (#4, „Proxy Fáze 2“ v sekci
   C výš) tím vyřešený NENÍ — ten je architektonický a dál otevřený. Dopad dnes: jedno čtení na účet.
   **Fix má i klientskou půlku** (CODE-tune 2026-10-09, ověřil v klientovi): `shouldUseCredit()` (`runar-app.js`) cenu spreadu
   nezná a čte ji i `canUseVoice()`. Se samotnou serverovou podmínkou by Rune Seeker s `free_balance` 1 a 0 kredity dostal na spread
   402, i když klient spread nabízí jako zdarma. Rozhodnout tedy celek: server + `shouldUseCredit()` podle `SPREAD_COSTS` (+ dopad na
   hlas) + texty, které spread Rune Seekerovi nabízejí. Kód nikdo nemění, dokud owner nerozhodne.

### Část 2 — ostatní edge funkce (přečteno celé 2026-10-09; nasazený seznam a verze `supabase functions list`)
4. ✅ *(nasazeno 2026-10-09, CODE-tune — owner „opravit obě chyby“; shrine od téhož dne počítá jako použitý i kód s `used_at`)* 🔴 **Dárkový kód se po smazání účtu dá uplatnit znovu.** `delete-account` nuluje `gift_codes.used_by`, `redeem-code` hlídalo jen
   `used_by` → kód je zase „nepoužitý“. V produkci teď **2 takové kódy** (`used_by` null, `used_at` vyplněné; dotaz 2026-10-09).
   **Opraveno v repu** (`redeem-code` hlídá i `used_at`, v kontrole i v CAS) — **čeká na nasazení**:
   `supabase functions deploy redeem-code --project-ref pmitxjvkeovijreepror --no-verify-jwt`. Po nasazení jsou ty 2 kódy zavřené samy.

### Část 4 — appka (pravidla `CLAUDE.md` pro klienta + hlavičky souborů, 2026-10-09)
10. ✅ *(HOTOVO 2026-10-10: app, reading → UI_TEXT; character, utils → data po jazycích, bajty promptu beze změny; ráčna ㉸ = 0 všude — CODE-tune)* ⚪ **Texty natvrdo podle jazyka — skutečně 44, ne 57** (první ráčna počítala i `lang === 'is' ? 'is' : 'en'`, což je jen
    výběr jazykového bloku dat, ne text — opraveno 2026-10-10). ➜ owner „opravit všechno“, rozdělení s CODE-tune:
    ✅ CODE-read 2026-10-10: `runar-auth.js` 7 (hlášky dárkového kódu) + `runar-tree.js` 3 (životní runa, oslovení) → `UI_TEXT`,
    znění beze změny (ověřeno: nový `t()`/`tp()` dává týž text EN i IS). CODE-tune: `runar-app.js` 24 + `runar-reading.js` 7.
    Zbývá: `runar-character.js` 2 + `runar-utils.js` 1 jsou text PROMPTU → patří do balíčků `RP_*` (CODE-tune), ne do `UI_TEXT`.
    Ráčna ㉸ drží stav po souborech.

### 2026-08-16 — otevřené po zavedení registru `direct`
- ~~Dvě IS vady do `runar_corrections`~~ → **hotovo, ale jen jedna byla vada.**
  `óupp dregið` → `ekki dregið upp` vloženo. `ertu búið að` byl **můj omyl** (je to
  správný hvorugkyn pro oslovení `hán`, viz `_addressContext`) — řádek smazán.
  Detail → `RUNAR_EVAL_LOG.md` 2026-08-16.

### ⭐ VARIANTY STAVBY — přepsáno 2026-09-12 (KUKY: „to je to stejné!" — měl pravdu)
- ✅ **Změřeno 2026-09-12 (n=4):** žádné slovo společné všem ramenům (proti „crossing" 4/4) · varianty
  se neopsaly · vazba dorazila 4/4 i u statických run · zavírá 1/4 · ~~tvrzení o čtenáři 2/4 — když se chůze
  napíše jako „your"~~ ⚠️ **Opraveno 2026-09-27 (owner): 2. osoba NENÍ tvrzení** — *„you je prostě you a není to
  kontext"*; měřidlo CODE-read bylo špatně, „další krok: chůzi ukázat na obrazu" tím padá (memory
  `rozkaz-a-studene-cteni-hranice` bod 3).
  → `RUNAR_EVAL_LOG.md` 2026-09-12.
- [x] **RÁMEC VEGVÍSIRU — potvrzeno ownerem 2026-09-12** (odpovědi na očíslovaný seznam; do té doby žil jen v chatu):
  1. Vegvísir = **střed + 8 ramen**; není spread, vlastní režim, nic se nedědí. ✅
  2. **Střed = životní runa**, netáhne se, kterákoli z **24** (Blank ne — ověřeno `calcLifeRune`: modulo 24). ⚠️ *CODE-tree 2026-09-26: vyšlo jen 23 — Fehu nikdy.* **2026-09-27 opraveno: vyjde všech 24** (DECISIONS 2026-09-27 (2)). ✅
  3. **Rameno = tažená runa**, jakákoli; pozice nemá vlastní význam (`RUNAR_DESIGN.md:750`, `:817`). ✅
  4. Může životní runa padnout i jako rameno? → **v1 ROZHODNUTO 2026-08-25: NE, životní runa není v sáčku** (DECISIONS
     2026-08-25 — self-reference, hranice domov ≠ cesta); „návrat domova skrze tutéž runu" = uchovaná alternativa.
     Owner 2026-09-27: *„budeme muset otestovat"* → test alternativy, v1 platí. (⚠️ Do 2026-09-27 tu stálo jen „TESTOVAT
     — nerozhodnuto" a rozhodnutí z 2026-08-25 se tím tiše ztrácelo — §20.) Signály dosud: V2 nejmlhavější, NE-V3 zavírá, V3 prošla.
  5. Čas: rameno ne dřív než po 9 nocích; dva Asky ne dřív než po 3 a po 6 dnech. ✅
  6. **Čtení ramene ≈ 90 slov** („tam, kde je velká ASK"); „vyčerpávající" a víc odstavců ZRUŠENO. ✅
  7. Bez obrazů z banky — jediný vstup je ukotvení. ✅
  8. Guardrail „výklad se nezavírá" — owner si nepamatoval, co dělá; vysvětleno: Rúnar nesmí skončit tím, co to pro člověka znamená nebo co má dělat.
  9. **(2026-09-27)** Owner navrhuje v EN, **CODE-read dělá i IS** (⚠️ zápis „jen anglicky" byl chybný, opraveno DECISIONS 2026-09-27 (4)) ·
     scéna ramene = **CESTA, kterou člověk zvolí** (*„jedu na lodi po moři"*), ne vztah; napřed ze **statického světa**, vlastní slova
     později · mezi rameny se **nic nepřenáší** (přenos = varianta k testu) · krajiny/momenty/graf/nit **odloženy** → DECISIONS 2026-09-27 (3).
     *„What passes between me and this place?"* (vyšla nejlépe, EVAL_LOG 2026-09-27 (1)) = otázka, kterou si člověk může položit ZPĚTNĚ, ne tvar ramene.
  10. **(2026-09-27)** Rameno **BEZ středu** — životní runa do promptu ramene nejde; vazbu životní × tažená runa nese **Ask** → DECISIONS
     2026-09-27 (6). IS verze ramene: EVAL_LOG 2026-09-27 (3) (zbývá vlastní znění „bez studeného čtení" místo produkčního „Lýstu myndinni").
- [x] ✅ *(owner smazal 2026-09-27, DECISIONS 2026-09-27 (11))* **SMAZAT dva jednorázové řádky korekcí — náhrady jsou otázky o nitru a prosakují (owner rozhoduje, maže owner)** (CODE-read
  2026-09-27, EVAL_LOG 2026-09-27 (4)). Řádek „Þegar talað er um Fehu" se objevil doslova jako věta islandského čtení (*„Hvað innra með
  þér vill nú fá að stíga fram í ljósið?"*); bez bloku korekcí ne. Blok jde do KAŽDÉHO IS promptu, takže oba řádky učí studené čtení všude.
  Druhý řádek (*„…land sem þornar"* → *„Hvar í lífi þínu hefur orkan runnið í þurran jarðveg?"*) je týž druh. SQL:
  `delete from runar_corrections where id in ('77c67110-551f-4311-94e9-e5ba915f5c37', '143202e0-0898-44e3-b50e-093d9ab8510a');`
- [x] **NÁLEZ → CODE-tune: aspekt jde PŘÍMO DO PROMPTU jako `focus:`, a u Perth to kazí čtení** (našel KUKY 2026-09-11 z produkčního čtení; ověřeno v kódu).
  `runar-character.js:1405` → `pickedKws = _imgAspekt || náhodné klíče` → `drawnCtx = 'DRAWN RUNE: ' + runa + ' — focus: ' + pickedKws`. Aspekt tedy **není jen selektor**, je to text promptu — a od **v4.0 pro obě řeči**.
  ⇒ U Perth s dopisem dostane model doslova `DRAWN RUNE: Perth — focus: **hidden things**`. Odtud *„Perth, **the thing** whose meaning waits sealed"* v produkčním čtení.
  **Rozsah: 2 obrazy ze 108** — obojí Perth / `hidden things`. Není to systémová vada, je to **jedno slovo u jedné runy**. ⚠️ Druhý z těch obrazů má prázdno dvakrát: *„**Something** lies on the bottom of the lagoon"* + `focus: hidden things`.
  **Oprava = přeformulovat aspekt na DĚJ, ne na věc** (týž požadavek, jaký má esenční věta: *„Fehu is that warmth passed from hand to hand", ne „Fehu is wealth"*). Znění = owner/Cowork, ne CODE. KUKY 2026-09-11: *„zní to hrozně ve čtení, tahle metafora mi přijde divná, budeme hledat jiný obraz."*
  ✅ **Znění dorazilo a je zadrátované** (Cowork-tune → owner HOTOVO, 2026-09-11): aspekt je teď DĚJ v obou řečech a obraz s lagunou koná. Co přesně a proč → `RUNAR_DECISIONS.md` 2026-09-11. Aby se to nemohlo rozejít podruhé, hlídá vazbu aspekt↔klíč smoke ㉤.
- [x] **ROZSOUZENO (owner 2026-09-12): `RUNES[].k` se NEMĚNÍ. Cowork si to plete se slovníkem 119.**
  KUKY: *„nevím. pokud to tak nevidíš, tedy nemůžeš najít, tak to není hotové."* ⇒ platí zapsané
  rozhodnutí z 2026-09-10 („Nenasazuje se do kódu — `RUNES[].k` zůstává nedotčené"). Kdyby se ty
  změny někdy dělat měly, musí k nim vzniknout **nový datovaný záznam**, ne odkaz na tenhle spor.
  Původní znění sporu zůstává níž, aby bylo dohledatelné, proč se to neudělalo.
- [x] **ROZHODNUTO 2026-09-12: čtení ramene ≈ 90 slov. „Vyčerpávající" ZRUŠENO jako zadání.**
  KUKY 2026-09-12: *„asi se pohybujeme tam, kde je velká ASK, protože to sedí — což je 90 slov. Ta
  omáčka kolem, co tam máš napsanou, asi není potřeba."*
  ⚠️ **Proč se ruší to slovo:** „vyčerpávající" jsem převzal z konverzace a nosil ho v docích
  jako spec, přestože neumím říct, co znamená — nedá se podle něj nic změřit ani vyrobit.
  KUKY: *„vyčerpávající je fráze. Jsi schopný popsat, co znamená? Asi ne — takže se máš spíš
  zeptat na tvrdá data, čísla."* Padá s tím i „víc odstavců" a můj návrh „vyčerpávající = rameno
  jako celek": při 90 slovech se ta otázka nepokládá.
  ✅ Ověřeno 2026-09-12, že 90 slov formát ukotvení nerozbije: čtyři ramena (Jera · Perth · Isa ·
  Gebo-kolize) na 86–94 slovech, opsaná fráze 0, vysypané klíče 0/3.
- ✅ **`tree_state` EXISTUJE a je zapojená** (11 sloupců; čte `claude-proxy`, zapisuje edge funkce
  `tree-update`). Neexistuje jen **`tree_readings`**. Coworkův handoff tvrdil, že chybí obě, protože
  to tvrdil `RUNAR_TREE.md:223` — **doc opraven 2026-08-22**. ⚠️ Schéma `tree_state` ale NEodpovídá
  tomu, co plán v `RUNAR_TREE.md` předpokládá (žádné `roots`/`element_scores`/`trunk_themes`).
- ✅ **Áttaviti = COMPASS = spread `kriz`** (5 run; `runar-reading.js` „Áttavitann", tlačítko COMPASS).
  ~~Kolize jména i vizuálu s Vegvísirem~~ **UZAVŘENO — KUKY 2026-08-23: „vegvísir není kolize s compasem."**
- ~~Data stínových run neexistují~~ **ZASTARALÉ (2026-08-23):** stínové runy patřily k PŮVODNÍMU
  8ramennému návrhu Cowork (2026-08-15/22); ratifikovaný design 2026-08-23 (RUNAR_DESIGN) je NEMÁ
  a KUKY 2026-08-23: „to je ovšem něco jiného, než co jsme dělali naposledy." Neřešit, dokud by je
  někdo vědomě nevrátil (§26).
- ~~Kolize pojmu „stín"~~ **ZASTARALÉ (2026-08-23):** vázalo se na stínové runy starého návrhu (viz výš).
- ✅ **`_lensContext` NENÍ potřeba rozšiřovat** (odpověď na jedinou technickou otázku návrhu):
  pod zvoleným Modelem A stačí předat **buď** životní runu, **nebo** stín — je to prostý skládač
  řetězce `(life, drawn, lang)`, ne dvouruní logika.

### Testy „recept: obrazy se potkávají" — K OTESTOVÁNÍ (Cowork 2026-08-23, ověřil CODE-read)
- [x] **TEST 1 — HOTOVO** (2026-08-23, de-blind → `docs/eval/2026-08-23-recept/tally.md`):
  řetěz slepě identifikován 19/20; vztah obrazem ~15/20; jménem 0/20; simile 0/20. Buňkový
  nález: v1 nulu způsobila ÚNIKOVÁ KLAUZULE, ne objem (celý text + povinné MEETS vláká);
  malá fráze (v2) zůstává pro těžký směr — disparátní trojice nevlákaly ani povinně.
- [x] **TEST 2 — HOTOVO A ROZHODNUTO** (2026-08-23): kolaps receptu do výčtu 0/20; současný
  builder ~14/20 spolkne 1–2 runy. **KUKY: „nechame jeden obraz"** — recept se nepřijímá,
  spolknutí run = přijatá cena. → RUNAR_DECISIONS.md 2026-08-23.
- [x] **T-emergence + sham-return — PROVEDENO a nástroj NALEZEN** (TEST 36+38): sham-return
  3/3 pro pravý návrat; otevřená emergence otázka padla (3/3 mix), ale NUCENÁ VOLBA s kotvou
  „vrací se konkrétní věc a mění funkci?" přežila cizí kontroly 2/2 (TEST 38) = funkční
  emergence-nástroj pro další měření. Stav-cesty (GPT) jako náhrada mechaniky NEPOTVRZEN —
  architektura drží (místo + fráze + semínko).
- [x] **T-střed: BRÁNA PRŮCHOZÍ CELÁ** (2026-08-25): negativní půlka materiálem (TEST 37),
  nit materiálově kotvená (2/2), pozitivní půlka owner („hezká čtení… můžeš dál").
  → RUNAR_DECISIONS.md 2026-08-25 (architektura ramene v1, 6+1 prvků).
- [x] ✅ **VYŘEŠENO 2026-10-09 (CODE-tune):** citát žije jen v `UI_TEXT.hero_quote` (EN i IS); kopie ve Stromu pryč
  2026-10-06, v `runar-app.js` už je klíč, poslední natvrdo zapsaná v `runar-reader.html` vyndána. Původní znění položky:
- ~~**DUPLIKÁT (§20 + §10): věta „The runes do not predict your fate" je v kódu 4×**~~ —
  `v2/runar-translations.js:236` (`tree_closing_quote`, správný vlastník) · `v2/runar-app.js:747`
  (natvrdo jako fallback) · `v2/runar-reader.html:159` a `:587` (natvrdo 2×). Změna znění by se
  musela dělat na čtyřech místech a tři z nich grep na klíč nenajde. Oprava: HTML i app brát
  z `t('tree_closing_quote')`. Nalezeno 2026-09-06 při zakládání zásoby citací.

### Musí být hotové PŘED prvním cizím přihlášením
- [x] **~~Podepsat Supabase DPA~~** — duplikát položky výš; vyřešeno 2026-09-12 (není co podepisovat), detail → `RUNAR_PRIVACY.md`.
      Podmínka až před prvním CIZÍM přihlášením, ne teď: dnešní čtyři účty jsou vlastní,
      žádný tester zatím neexistuje. V dashboardu na úrovni ORGANIZACE (ne projektu),
      v sekci s právními dokumenty.
- [x] ~~**`WEBHOOK_SECRET`**~~ — NASTAVIL CODE 2026-09-11. Hlavicka i secret, v tomhle poradi
      (obracene by reporter na chvili odmital vlastni webhook). Zbyva jen smazat tu sondovou
      zpravu ve Slacku — na to Code nema nastroj.
- [x] ✅ **Označit testery — dělá databáze (2026-10-09).** Tester na seznamu `allowed_emails` (role `tester`) dostane při vzniku profilu
      `tier = 'premium'` a `is_tester` (trigger, `sql/2026-10-09_uzavreny_test.sql`; ověřeno testem s návratem transakce). Kdo se
      přihlásil dřív, než byl na seznamu → dorovnávací `update` v hlavičce téhož SQL.
- [x] ✅ **Čtyři stávající účty zůstávají, jak jsou** (KUKY 2026-10-09: dva admini a dva účty *„na testování slabších účtů Rune Seeker“*).
- [x] ✅ **Testeři = premium** (KUKY 2026-10-09: *„budou mít možnosti jako premium, jen omezené hlasy, čtení necháme na 75, když tak
      dobijeme kreditem“*). Rune Seeker má Ask jen jako ukázku, takže by hlásit Ask nemohli. Hlas má strop `VOICE_MONTHLY_LIMIT` pro všechny.
- [x] ✅ **Hlášení pro testery — HOTOVO 2026-10-09** (DECISIONS 2026-10-09 (5)): tester Grammar · Wrong word · Visual · Error · Other,
      admin navíc Replace text, Repeated phrase, ✦ Keep; tester posílá jen čtení (+ ✦) a Ask. Návaznost: *Známkování čtení testery*
      (2026-08-16, otevřené — na co se ptát).

### Zjištěno při auditu — nespěchá, ale ať se neztratí
- [x] ~~V Slacku leží sondová zpráva z reporteru (11. 9.)~~ — owner ji smazal 2026-09-12.

### 2026-09-23 — Tři otevřené body z auditu obrazů (KUKY: „tyhle 3 body si zapamatuj")
3. ✅ **Uzavřeno** → DECISIONS 2026-09-23 (10). ~~**Úvodní pokyn „začni celým obrazem najednou"** (jeden ze 7 losovaných začátků čtení) — dává první
   větu ~25 slov proti 17–21 u ostatních a vede model dokreslovat okolí, které v obrazu není.
   Návrh: přepsat a změřit na ~12 čteních před/po. Owner zatím nerozhodl (nevěděl, o co jde).~~

## Přesunuto 2026-10-12 — ověřeno proti kódu (5 položek)

### 🟢 Dlouhý ocas (kód, nízká priorita)
- [x] ✅ *(CODE-read 2026-10-12, ověřeno proti kódu: duplikát položky `detectPatterns()` o řádek výš — zbývající „nová podoba“ čeká právě na ni (§20).)* **Nahradit `runar-gathering.js`** <!-- doc-links:ok 2026-09-28 soubor záměrně smazán, odkaz je historie --> — ✅ *mrtvý kód smazán 2026-09-28* (modul, `<script>`, sw.js, výběr karet v deníku, CSS, klíče
  překladů; DECISIONS 2026-09-28 (1)); stará logika je v gitu (`git log -- v2/runar-gathering.js`). Zbývá **nová podoba** (čeká na `detectPatterns()` výš).
- [x] ✅ *(CODE-read 2026-10-12, ověřeno proti kódu: `_moodContext` v kódu není (grep v2/), intention se zapojuje (`_intentionContext`).)* `_moodContext`/`_intentionContext` — zapojit intention, nebo smazat mood (mood z UI ODSTRANĚN, helper dřímá).  <!-- check-docs:ok 2026-07-19 legacy: vzniklo před pravidlem, důvod nedoplněn -->
- [x] ✅ *(CODE-read 2026-10-12, ověřeno proti kódu: hotovo 2026-09-28 — komentáře v `runar-reading.js:24` a `runar-character.js`.)* Zahodit stale `_lastDeeper` + `deeper_meaning` extrakci (nikde se nečte; deeper_meaning zrušen 2026-07-04). Guard: `composeReading` musí zůstat zrcadlo `_parseSegments` (smoke ⑦).
- [x] ✅ *(CODE-read 2026-10-12, ověřeno proti kódu: přesunuty do `scripts/archive/root-patches-2026-07-19/` (7e90991; v gitu předtím nikdy nebyly).)* **Dva jednorázové patch skripty leží v kořeni repa** — `fix-norns-reading.py` a `unify-reading-style.py` patří do `scripts/archive/root-patches-*` (tam už jich je ~20). Dnes matou grep: obsahují volání funkcí, které v kódu neexistují.
- [x] ✅ *(CODE-read 2026-10-12, ověřeno proti kódu: opraveno 7e90991 — SPREAD_RE + pojistka `area === 'spread'` → `spread_other`.)* **`export_readings.js`: `THE GATHERING` a `SPREAD_3` padají do kolonky „single"** — nejsou v `SPREAD_RE`, takže statistiky délky za single jsou nadhodnocené (změřeno 2026-08-08: 9 čtení >200 slov je tímhle).
