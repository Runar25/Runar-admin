# RUNAR_BACKLOG.md
# Sledovaný seznam POZASTAVENÝCH věcí, ke kterým se máme vrátit.
# Pravidlo (owner 2026-07-04): co pozastavíme, sem zapíšeme + trigger návratu — ať nic nevisí bez povšimnutí.
# Hotové → odškrtnout (✅ / [x], zamítnuté ✖); položky starší 48 h přesune doslova do docs/archive/RUNAR_BACKLOG_hotovo.md
# `python -X utf8 scripts/utils/backlog_uklid.py --zapis <lane>` (owner 2026-10-12: „neni ten backlog moc velky?“). uz_vime.js archiv prohledává.

---

## Čtení a islandština — co zbývá (prompt prakticky hotový, owner 2026-10-12)
- [ ] **Kontrola promptu tvorby čtení před spuštěním — 2026-10-16 (CODE-read)** (owner: *„jakákoliv další velká kontrola je vítána…
  chceme vychytat všechny mouchy“*). Celé nálezy s řádky a hotovými ověřenými IS opravami: `docs/inbox/2026-10-16-kontrola-promptu.md`.
  - [ ] **CODE-tune — opravy (A):** krize v Asku: pravidlo „mimo téma neodpovídej“ přebije větu o 112 (vysoká) · 19 islandských chyb
    v živých promptech (mj. „Sleppu“ → „Slepptu“ v každém IS single, chybné pravidlo 2. osoby v IS systému, „rúna“ × „rún“, Kříž „einum
    flæði“, Yggdrasil „til Heljar“, kalky v bloku „never“) · Ask v IS povoluje přesah 90 slov (useká se) · „pro někoho“ oslovuje rodem
    majitele účtu · single „Let X answer“ zve k předpovědi · životní runa a jméno dostávají „popiš obraz“ bez obrazu · EN esence × „Mention
    by name once“ · technické (dvojité mezery, „PERSON: you“, korekce za pokynem JSON, ✦ nový řádek × „no breaks“) · proxy `SOL_EFFORTS`
    `minimal` neexistuje (ověřeno) · známé duplikáty „Respond in English.“.
  - **Owner 2026-10-16 k části B** (DECISIONS 2026-10-16 (3)):
    - [ ] **Studené čtení — napřed definice** (owner: *„„what strength is already in you“ na tom není nic špatného. je potřeba si lépe určit
      definice, kdy je to tvrzení o člověku a co je neškodné povzbuzení či konstatování faktu“*). CODE-read navrhne definice ownerovi;
      štítky pozic a otázky run se posoudí až podle nich.
    - [ ] **CODE-tune — spready bez časového rámce** (owner: *„celkově u spreadů vynechat… všechny časové tvary pro spready ignorovat, jelikož
      mají svůj tvar. a pro „this reading is for“ dopsat poznámku, že platí jen pro single čtení“*): `_intentionContext` (a jiné časové
      rámce) ve spreadech nevkládat; u `intention_lbl` / IS v UI poznámka „jen pro jednu runu“ (EN + IS, §2, §31).
    - [ ] **Otázka ve spreadu** (owner: *„to by měla a je potřeba to testovat“*): pole vidí Standard a Premium (i testeři) ve všech výkladech
      (`updateQuestionGate`, runar-auth.js), spread ji má jen v hlavičce bez pokynu. CODE-read napřed lab (pokyn + malý vzorek), pak CODE-tune.
    - [ ] **CODE-read — test „pravidlo v systému × v user promptu“, jen EN** (owner: *„ano a udělat test. jen EN jako první“*). CLAUDE.md
      přepsán na „neměřeno na solu“ týž den.
    - IS osy Kříže „verdandi/skuld/urd“ — zatím bez rozhodnutí.
    - [ ] **Pro V3 — rozpracováno níž** (owner: *„dobré zkusit pro V3, kterou máme už mírně rozpracovanou. zapsat to. celé to rozpracuj, ať je
      čeho se chytit, ale řešit to budeme později“*).
  - **Nápady pro V3 z návodů výrobců (2026-10-16, CODE-read; řeší se později, v labu, ne v produkci).** Každý: co · proč (zdroj) · jak
    změřit · riziko. Podklad s citacemi a URL: `docs/inbox/2026-10-16-kontrola-promptu.md` (B6).
    1. **Role `developer` místo `system` pro sol** (`claude-proxy/index.ts:188`) · OpenAI API reference: pro novější modely „use developer
       messages“, Model Spec vyhrazuje „System“ pravidlům OpenAI · malý vzorek, totéž čtení s rolí system × developer, porovnat dodržení
       pravidel ze systému (zakázaná slova, délka) · riziko: jiné chování modelu u celého promptu → jen lab.
    2. **Vynucený formát výstupu (Structured Outputs)** místo „return ONLY this JSON array“ · OpenAI doporučuje Structured Outputs, gpt-6-sol
       je podporuje; kořen schématu musí být objekt → obal `{segments:[…]}`, úprava `_parseSegments` a zrcadla `composeReading` v proxy ·
       napřed změřit, kolik čtení se dnes nerozparsuje (DB / logy) · riziko: změna formátu na dvou místech (§18, smoke ⑦).
    3. **„Check every sentence before returning“ bez přemýšlení** (`runar-character.js:55`, IS `:87`, `:94`) · sol běží s `reasoning_effort:
       none`, kontrola nemá kde proběhnout; OpenAI: u minimálního přemýšlení je důležité výslovné plánování · lab: systém bez kontrolního
       seznamu × s ním, chyby IS nástroji z §2 · riziko: IS seznam možná pomáhá jako připomínka pravidel — měřit, ne hádat.
    4. **Méně velkých písmen v IS systému** (SKYLDA, HVERJA, ALDREI… proti jednomu v EN) · Anthropic: novější modely „may overtrigger“,
       radí zmírnit · lab: IS bez zdůraznění × se zdůrazněním · riziko: OpenAI se k tomu nevyjadřuje, efekt na solu neznámý.
    5. **Konkrétní volby místo obecných štítků povahy** (PERSONALITY/IDENTITY „calm, compassionate“) · OpenAI: obecné štítky jsou dvojznačné,
       popsat konkrétní volby ve psaní (HOW YOU SPEAK to už dělá) · obsah = owner + Cowork · riziko: hlas Rúnara je kánon (📜).
    6. **Příprava na gpt-6.1-sol** · stránka gpt-6-sol odkazuje na 6.1 jako novější; 6.1 nemá `none`, jen `low` a výš; 2026-10-05 6.1 `low`
       čtení zhoršil (DECISIONS 2026-10-05 (3)) · v labu připravit variantu promptu pro `low` dřív, než gpt-6-sol skončí · riziko: přemýšlející
       model chce méně předepsaný postup (návody 2026-10-04 bod 6).
    7. **Data odděleně od pokynů** (obraz, podoba oblasti, otázka ve vlastních značkách místo uvnitř vět) · OpenAI/Anthropic: oddělit vstupy
       od instrukcí; návody 2026-10-04 bod 5 · lab, měřit opisování obrazu · riziko: známé „pokyn ‚použij tenhle text‘ = opisování“.
    8. **Poměr zákazů a kladných pokynů** (systém ~62 % vět se zákazem) · Anthropic radí říkat, co dělat; OpenAI varuje jen před opakováním ·
       přepis po blocích s měřením · riziko: zákazy drží kánon (NO COLD READING) — přepsat znění, ne obsah.
    9. **Výsledek testu „systém × user“** (výš) rozhodne, kam v V3 patří stálá pravidla a kam per-čtení pokyny.
Owner 2026-10-12: *„prompt už je prakticky hotovo. takže pozor na to, co tam leží.“* Výzkum a nápady k promptu, obrazům, Asku a Vegvísiru
(dřív „Reading quality“, nálady, HANDOFF57, audity obrazů, Vegvísir, testy „obrazy se potkávají“ a prompt z „Nálezů z workflow“) leží doslova
v `docs/archive/RUNAR_BACKLOG_odlozene.md` jako ⏸ — nejsou to úkoly. Vrací se, až se vada objeví v nových čteních a owner na ni upozorní
(CLAUDE.md §30); `uz_vime.js` je najde.

- [x] ✅ *(CODE-tune 2026-10-14, owner „zdarma ano“: běží při každém „načti reporty“ — krok 2c v `scripts/nacti_cteni.js` →
  `scripts/utils/is_greynir_cteni.js`; nálezy ověřuje session korpusem, potvrzené jdou do korekcí.)* ⭐ **SMYČKA ZE SKUTEČNÝCH ČTENÍ —
  IS chyby do korekcí** (DECISIONS 2026-09-23 (6) bod 3). **Owner ji 2026-10-14 otevřel znovu**
  (hlášení 6282e405: *„Potřebuju najít řešení jak IS čtení analyzovat. Jestli je IS dobrá.“*). Do té doby ⏸ *odloženo (owner 2026-10-13:
  „nech to, vyřešíme později“): čtení textů z produkce i `najdi_cteni.js` zablokovala ochrana Claude Code („Production Reads“)* — 2026-10-14
  v session CODE-tune obojí prošlo. Vzorek islandských čtení z DB (jen přes `scripts/utils/cteni_analyza.sql`, bez odhlášených) →
  `is-greynir` + korpus (`is-vazba`; `is-grammar-qa` zaniklo 2026-10-10) + korektor `is-gpt-check` → potvrzené chyby (s dokladem
  a obhajobou) do korekcí. ⚠️ **Soukromí:** CODE-read smí číst jen ownerova čtení; čtení testerů/uživatelů =
  rozhodnutí podle `RUNAR_PRIVACY.md` (zpracování pro kvalitu, anonymizace), ne mimochodem.
  **První běh 2026-10-14 (CODE-tune, na ownerovo hlášení):** Greynir lokálně na 14 IS čteních od 1. 10. (109 vět, odhlášených 0) →
  24 vět s nálezem: 1 jistá chyba (`bertum`, zapsána do korekcí, DECISIONS 2026-10-14 (3)), 4 chyby velkého písmena po dvojtečce
  (Asky Opus 5; filtr je do večera mylně zahazoval — Ritreglur § 29.4, DECISIONS 2026-10-14 (15)), zbytek plané poplachy (jména run,
  „maður vill“, styl „er að“) a 7× E001 (nerozebráno, neověřeno). Kalky Greynir nevidí: dva obraty
  s korpusem 0× nehlásil (že jsou chybné, neověřeno). (a) Krok s Greynirem **postaven** (owner *„zdarma ano“*). (b) Test
  `is-gpt-check.py` na týchž 109 větách (3 volání, ≈ $0,11) se **nepouští** — owner 2026-10-14 *„0.11$ je drahé“* a hlavně: čtení píše
  GPT, kontrola GPT „moc nepomáhá“ (DECISIONS 2026-10-14 (11)). (c) Druhá vrstva místo GPT, opravný model Miðeind (ByT5, lokálně,
  zdarma): **změřen a do rutiny nejde** — ve 109 větách nenašel nic, co Greynir nevidí, a dvě jeho opravy by změnily smysl
  (DECISIONS 2026-10-14 (15)); zůstává nainstalovaný v `~/runar-eval/byt5-venv`. Málstaður teď ne (drahé).
- [ ] **IS prompty: malé písmeno po dvojtečce před celou větou** (CODE-tune 2026-10-14, nález při kontrole ByT5). Ritreglur
  § 29.4 chce velké, když za dvojtečkou stojí celá samostatná věta — např. `v2/runar-character.js` landing Norn: *„síðasta setningin
  tilheyrir Skuld: hún nefnir tvennt…“*. Projít IS řetězce promptu (výčty a fragmenty zůstávají malé), opravit a bumpnout verzi
  promptu. Nízká priorita: jsou to pokyny modelu, uživatel je nevidí; čtení GPT-6 sol tuhle chybu ve 109 větách nemá (0 ze 3).
- [ ] **Blok korekcí roste do KAŽDÉHO IS promptu** — změřeno 2026-09-23 (`count_tokens`, Opus 4.8): IS 27 řádků
  ⭐ **2026-10-15 pokus „bez korekcí“ (sol, RUNAR_EVAL_LOG 2026-10-15 (1)):** blok ≈ 900 tokenů (~43 % vstupu); bez něj 0 chybných
  tvarů ze seznamu (n = 8); 28 z 29 korekcí je z doby Opusu. Návrh čeká na ownera: zúžit na korekce, které sol dělá.
  = **1287 tokenů** (≈ $0,0064 na IS čtení), z toho **419 (33 %) jsou vysvětlení v závorkách**; EN 2 řádky = 69.
  Blok stojí na konci user promptu, za obsahem čtení → **cache tam principiálně nejde**. Přesun do system promptu
  by cache umožnil, ale (a) při dnešním provozu by 5min cache skoro vždy minula a zápis stojí 1,25× → dráž;
  (b) projektový nález „system prompt model ignoruje, per-čtení injekci poslechne" → napřed změřit, jestli korekce
  ze systému drží. **Cache má zatím smysl jen v testech.** Co udělat, od nejlevnějšího:
  1. ✅ **Owner smazal řádek `test → test replacement`** přes Supabase (shrine to neumí) — DECISIONS 2026-09-23 (17). (`both`, od 2026-05-11): jde do KAŽDÉHO čtení
     v obou jazycích a nic neopravuje; v repu na něm nic nezávisí (grep 2026-09-23). CODE mazat nesmí.
  2. ✅ `fyrsta ljós vorunnar` přepnuto na `is` (DECISIONS 2026-09-23 (16)).
  3. Dva jednorázové přepisy celých otázek (Fehu *„Hvað hefur þú verið að halda innan þín…"*, *„hvar hefur orkan
     þín farið í land sem þornar?"*) opravují styl jedné vygenerované věty, která se doslova nevrátí → kandidáti
     na smazání (owner, zatím nerozhodl). ✅ *„Auða rúnan… tóm blað"* rozděleno na `rúnan → rúnin` + `tóm blað → tómt blað`.
     Body 1 + 3 = −186 tokenů (−14 %).
  4. **Pravidlo pro nové řádky** (píše je CODE-read): chyba jen v jádru (1–4 slova); vysvětlení jen tehdy, když nese
     přenosné pravidlo (rekce, kolokace). *„X er ekki til"* k řádku *„ekki X heldur Y"* nic nepřidává — tak jsou
     napsané i moje dnešní řádky `í bótnum`, `loftins`, `flýja honum`, `eigin sönnu` → ✅ zkráceno. Stav po změnách:
     IS 1202 tokenů, EN 31 (jen řádek `test`).
  5. Až smyčka poroste: řádky téže třídy sloučit do jedné věty v IS gramatickém bloku (CODE-tune); korekce vázané
     na runu (Gebo, Fehu) posílat jen s tou runou.
- ✅ *(CODE-tune 2026-10-12, owner „udělej“, DECISIONS 2026-10-12 (5): u každé korekce z databáze „✕ DELETE“ s potvrzením)*
  ~~**Shrine: korekce nejdou smazat**~~ (nález 2026-09-23) — záložka WORD CORRECTIONS umí jen přidat a vypsat
  (`runar-shrine.html` `saveCorrection`/`loadCorrections`), mazání nemá. Owner tak smaže řádek jen přes Supabase. Doplnit
  mazání (jen admin, s potvrzením) — CODE-tune.
- ✅ *(CODE-tune 2026-10-12: prompt Asku skládá produkční `_askBuild` v druhém sandboxu (reader jako `verify_ask_hints.js`) — stav
  po čtení se nastaví tam, kam ho píše appka, předchozí výměny se nesou jako `_askLog`; dry-run nově ukáže prompt Asku zadarmo.
  Sandbox čtení beze změny. Ověřeno dry-runem single IS a Norny EN: aspekt i pozice v promptu; stav × `_askBuild` testem.)*
  ~~**`scripts/utils/gen_batch.js` staví prompt Asku jinak než produkce**~~ — volá `buildAskPrompt` se 7 argumenty (~ř. 804),
  produkce s 10 (`v2/runar-reading.js` ~ř. 894: navíc `_askSpread()`, `_askAspect()`, předchozí výměna). Dávky Asku přes gen_batch
  tedy měří jiný prompt, než dostane člověk. Znovu otevřeno 2026-10-12: v 89bc39c jsem to omylem uzavřel jako „gen_batch.js už v repu
  není“ — výpis grepu mi uřízl `head -3`. (CODE-read; nástroj evalu, nízká priorita — prompt hotový.)
- [x] ✅ *(CODE-read 2026-10-12: rozhodnuto — vědomě prompt Rune Seekera, zapsáno v hlavičce `scripts/utils/gen_batch.js`; testovací čtení se dnes píšou v konverzaci a prompt je hotový, před použitím pro Standard/Premium napřed doplnit ✦.)* **`gen_batch.js` staví čtení bez řádku ✦ (myšlenka na konec)** — produkce ho přidá Standard a Premium (`_thoughtFor`
  v `v2/runar-reading.js`, `TIERS.*.reading_thought`), mimo builder; dávky tedy měří prompt Rune Seekera, ne testera (testeři jsou
  premium). Zjištěno 2026-10-12 CODE-tune u opravy Asku. Rozhodne ten, kdo eval pouští (CODE-read): volba tarifu v gen_batch
  (sandbox Asku už `_thoughtFor` umí), nebo vědomě jen Rune Seeker a napsat to do hlavičky.
- [ ] **`SEASON_POOLS` — 133 obrazů v kódu, do čtení se nedostanou** (`v2/runar-character.js`; ověřeno protlačením 2026-09-08,
  CLAUDE.md „Obraznost“): mrtvá data, udržovaná dvojjazyčně. S hotovým promptem spíš odstranit (CODE-tune). Zbytek původní položky
  (Sowilo zimní obraz, losy ve spreadech) je v archivu odložených.
- ✅ *(CODE-tune 2026-10-12: (a)–(d) — strop Asku stojí v configu `RUNAR_MODES.ask`, čte ho `runar-reading.js` i `gen_batch.js`;
  komentáře u `TREE_UPDATE` a u přepínače hlasu říkají pravdu; výchozí věta z HTML pryč, appka tam dává text z UI_TEXT — ověřeno
  v prohlížeči EN i IS · (e) V2 řetěz smazán, podsekce níž)* ~~**Drobné rozpory kód ↔ komentář (zbytek inventury 2026-09-08, ověřeno
  2026-10-12 CODE-read)**~~ ~~(a) `TREE_UPDATE` v `v2/runar-config.js:14` nikdo nečte · (b) komentář
  `v2/runar-config.js` ~ř. 574 slibuje přepínač hlasu ve shrine (`shrine_voice_profile`), který neexistuje · (c) strop Asku natvrdo
  v `v2/runar-reading.js` (~ř. 1137), mimo config (§10) · (d) výchozí „Only your name is required…“ v `v2/runar-reader.html:297`
  (přepíše ho `_updateReadingForm`, uživatel ho nevidí)~~

### ✅ Mrtvý řetěz V2 charakteru — smazán 2026-10-12 (CODE-tune; nalezeno 2026-08-15)
`DEF_CHAR_V2_EN` (druhá úplná kopie popisu Rúnara, rozešlá s produkcí od `8e14f74`) a s ním `buildSysPromptV2`, `getContextLine`,
`buildLifeRuneContext`, `_getLunarPhase`, `_getIcelandicSeason`, `_getTimeOfDay`. Produkce ani shrine je nevolaly; poslední volající,
tři srovnávací skripty `compare_*` (nefunkční, 401), šly pryč s nimi. Prompty beze změny (golden); kontrola ㉦ přišla o krok, který
hlídal jen V2 cestu.
- ✅ *(CODE-tune 2026-10-12: oba smazány — nikdo je nepoužíval, ceny počítá `pricing_tabulka.js`, v rejstříku `tools.js` místo nich)*
  ~~**`compare_seasonal.js` a `measure_reading_costs.js` (`scripts/utils/`) volají proxy veřejným klíčem**~~ → 401 od 2026-08-02, <!-- doc-links:ok 2026-10-12 oba skripty záměrně smazány (CODE-tune), odkaz je historie -->
  nefungují (zjištěno 2026-10-11 CODE-tune). Opravit na admin token (vzor `gen_batch.js`), nebo smazat — ceny dnes počítá
  `scripts/utils/pricing_tabulka.js`; `measure_reading_costs` stojí i v rejstříku `scripts/utils/tools.js`. CODE-tune.

## Profil / personalizace

- [x] *(hotovo 2026-10-11: owner „nevím, odkud je to číslo… spočítej to“ → příjem 3 518 ISK ≈ $28.49 ze vzorce v pricingu, projekce
  přepočtena i s DPH a poplatky)* **RUNAR_PRICING.md — příjem na uživatele stojí dvakrát jinak** (nalezeno 2026-10-11 při přepočtu na sol, CODE-tune): projekce zisku
  počítá ~$24 na uživatele (10 uživatelů ~$240), „Operating costs“ ~$28.5 (3.518 ISK; mix 70/30 tarifů, 60 % ročně). Rozdíl je ve vstupu, ne
  v nákladech. Rozhodne owner, který mix platí; druhé místo pak převést na odkaz (§20).
- [ ] **Náklady — zmapovat pořádně** (owner 2026-10-11: *„tohle by si zasloužilo větší rozbor a trochu lépe zmapovat. takže teď na hrubo
  a později to uděláme pořádně“*). Hrubá tabulka stojí v `RUNAR_PRICING.md` („Fixed monthly costs“). Dohledat z faktur a účtů: co kryje
  „GPT 8 $“ (předplatné, nebo API) · skutečná měsíční útrata Anthropic API a OpenAI API · plán ElevenLabs při spuštění · používá se ještě
  Hetzner · doména therunekeeper.com a schránka runar@ (Workspace?) · úložiště Google Drive pro zálohy · kolik ze Shopify nese Rúnar ·
  kdy Apple a Google Play. Pak přepočítat break-even (`RUNAR_PRICING.md`) a hlídat, ať čísla bydlí na jednom místě.
  ✅ *2026-10-12 (CODE-read): náklady přeměřeny s ownerem (RUNAR_PRICING „Fixed monthly costs“: fixní po spuštění ~$186, break-even ~7) a kalkulačka postavena znovu → shrine, záložka „📈 PAYBACK“ (od 2026-10-13 stránka ve shrine, čte RUNAR_PRICING; ne odkaz na claude.ai). Zbývá jen: přečerpání u vyšších plánů ElevenLabs ověřit před spuštěním.*
  **Výstup jako kalkulačka s posuvníky** (owner 2026-10-11: *„měli jsme udělanou krásnou tabulku s posuvníky, kde bylo vidět, kdy bych měl
  přejít na jiný subscription kvůli nákladům… i s tím, kolik potřebuju uživatelů pro návratnost“*). Původní (pricing ji uvádí jako
  „interactive calculator, 2026-06-15“) se nenašla v repu, v artifactech ani v přepisech konverzací (červnové už nejsou) — nejspíš artifact
  v chatu na claude.ai; má-li ho owner, navázat na něj, jinak postavit znovu nad čísly z `scripts/utils/pricing_tabulka.js`.
- [x] *(hotovo 2026-10-11: owner „2. ok“ → varianta a, commit 7077816, DECISIONS 2026-10-11 (27); FAQ slib vrácen)* **Upozornění na obnovu měsíčních čtení** (owner 2026-10-11: *„apka by mohla dát vědět jednou po otevření, že se čtení obnovila“*) —
  plán předložen ownerovi 2026-10-11 (CODE-tune), čeká na ano. Do té doby slib z nápovědy pryč (DECISIONS 2026-10-11 (20)); až vznikne,
  věta se do FAQ vrátí.
- [x] *(hotovo 2026-10-11: pricing přepočten na GPT-6 sol z dat produkce — `node scripts/utils/pricing_tabulka.js`)* **RUNAR_PRICING.md — model ref na Opus** — model čtení přepnut sonnet-4-5 → opus-4-8; cenový model může zmiňovat starý (delta zanedbatelný, hlas dominuje). Aktualizovat referenci.
  ⚠️ 2026-10-10 (CODE-read, kontrola architektury): od 2026-10-09 čte GPT-6 sol (`SOL_MODEL`), Opus je jen záloha — položka platí dál, ale cíl je sol, ne Opus. Totéž → část 17 níž (štítky „Claude API“ v tabulkách).
- [x] *(hotovo 2026-10-11: owner „měl bych to vidět stejně jako rune seeker nahoře u svého jména. platí i pro ostatní účty“ → menu pod
  jménem, commit 70b375c, DECISIONS 2026-10-11 (38); komentář „unlimited“ opraven)* **Předplatitel nevidí, kolik čtení mu zbývá** (CODE-tune 2026-10-11, při předělání admina na premium — `RUNAR_DECISIONS.md`
  2026-10-11 (32)). Rune Seeker má počítadlo nad formulářem i v menu pod jménem (`rs_credits_counter`); standard a premium nemají nic —
  banner je pro ně schovaný (`updateBanners` v `v2/runar-auth.js`, komentář tam ještě píše „unlimited“, ačkoli mají měsíční strop
  `TIERS.*.monthly_readings`) a menu ukazuje zůstatek jen Rune Seekerovi (`balEl` v `v2/runar-app.js`). O stropu se předplatitel dozví
  až hláškou `err_monthly_limit`; klient `month_units`/`month_key` ani nenačítá (`fetchUserProfile`). **Čeká na ownera:** chce počítadlo
  i pro předplatitele? Komentář „unlimited“ opravit v témže zásahu (když řekne ne, samostatně).
- ✅ *(CODE-tune 2026-10-11, DECISIONS 2026-10-11 (61): rozhodnuto — měsíční strop pro produkci žádný, hlas ke každému čtení jednou, hlídá ho
  server; testeři dál 15 + brzda kreditů)* **Hlas: při testování Starter a brzda 15 hlasů na testera beze změny; strop hlasu pro produkci zatím nikdo nerozhodl.** Owner 2026-10-11 k testování:
  *„testujeme. nebudeme platit nic navíc… teď jdeme vyloženě Starter a nepřekročit limit zdarma!“* · k brzdě testerů *„nic se nemění“* ·
  *„testeři mají premium a řeším to, aby mi nepřekročili ElevenLabs… proto děláme tyhle brzdy“* · k v4 *„není to ono. potřebuje to víc práce.
  přejdeme, až si budeme jistí“*. ⚠️ Owner 2026-10-11: *„to je pro testery!!! to jsem řekl pro testery!“* — jeho
  *„u premium by každé čtení mělo mít možnost být s hlasem!“* (2026-10-11) i *„musí být limit na hlas max 5 na měsíc! je to spíš ochutnávka
  pro ně“* (2026-09-11, v téže zprávě *„pojedou jako premium… ať nám to taky můžou otestovat“*) byla o TESTERECH. CODE-tune obojí vztáhl
  na všechny: 2026-09-11 (dd6bfa9) `VOICE_MONTHLY_LIMIT` 5 pro každý účet, 2026-10-11 tahle položka jako „v produkci premium ke každému
  čtení“. Strop hlasu pro netestery v produkci (dnes 5 v `elevenlabs-proxy`, slib „až 5 hlasem měsíčně“ v tarifech appky a v nápovědě,
  „hlas ×5“ v `RUNAR_PRICING.md`) proto ownerovo rozhodnutí NEMÁ → rozhodnout před spuštěním s cenovými hladinami; brzdy a ceny zkontroluje CODE-read (položka níž).
  Původní otázka: · *„potřebuju napřed zjistit, jestli mi 5 testerů nespálí účet na ElevenLabs… asi jim budu muset
  dát limit jen na 15 čtení na měsíc od resetu elevenlabs tokenů“*. Dnes: `VOICE_MONTHLY_LIMIT` (5) pro všechny kromě testerů
  (`VOICE_MONTHLY_LIMIT_TESTER`, 15), počítá se kalendářní měsíc; bezpečná hladina kvóty EL (`VOICE_SAFE_SHARE`) zastaví hlas všem, takže
  účet nepřečerpá, ale ztichne. Tier features slibují předplatiteli „až N čtení hlasem“ a `RUNAR_PRICING.md` s tím stropem počítá.
  Návrh CODE-tune (padl — owner mluvil o testerech): premium hlas ke každému čtení (tarif EL roste s uživateli), testeři 75 jednotek čtení + 15 hlasů na cyklus EL
  (kalendářní měsíc pustí přes hranici dvojnásobek). Napřed ověřit dnešní limit EL — poslední snímek je z doby před resetem 2026-10-10
  (`voice_quota_snapshots`, tarif „starter“). Ownerův scénář (3 single + 1 Norny týdně, 1 Kříž + 1 Podkova měsíčně) = ~29 jednotek
  (~19 čtení), hlas ~9 tis. znaků ≈ 3,8 tis. kreditů, model + hlas ~$0.8–0.9 měsíčně (`scripts/utils/pricing_tabulka.js`, sazba $0.08).
  **Fakta o účtu (2026-10-11, ověřeno proti přehledu ElevenLabs, DECISIONS 2026-10-11):** ElevenAPI Starter $6/měsíc = 30 000 kreditů;
  kredit = $0.0002, v2/v3 = 0,4 kreditu na znak → 75 000 znaků ≈ 177 IS / 200 EN single měsíčně. Počítadlo a limit v `voice_quota_snapshots`
  jsou kredity (103 807 = strop převodu 90 000 + dobití $2.76); nejdřív se čerpá tarif, dobití až po něm. 5 testerů × 15 hlasů ≈ 15 tis.
  kreditů měsíčně běžně (nejhůř ~50 tis. zarovnaně, ~100 tis. přes hranici měsíce — položka CODE-read níž; do 2026-10-11 tu stálo „vejde
  se i bez převodu (70 % z 30 tis. = 21 tis.)“, hladina je ale 70 % z celého `character_limit` ≈ 72,7 tis.); hlas ke každému čtení testera (nejhůř 75 single IS ≈ 12,7 tis.
  kreditů na testera) potřebuje Creator API ($22 = 110 tis. kreditů). ⚠️ Do 2026-10-11 tu stálo, že tabulka ElevenLabs v `RUNAR_PRICING.md`
  počítá znaky špatně (Creator 121 tis.) — to bylo MOJE chybné tvrzení z ceníku aplikace ElevenLabs (jiný produkt). Metoda tabulky (cena
  tarifu ÷ sazba) je správně, jen sazba klesla z $0.10 na $0.08 (Creator 275 000 znaků v3/v2) — přepočítat spolu s rozhodnutím o hlasu.
  **S příštím nasazením hlasu:** `elevenlabs-proxy` a `elevenlabs-static` přičítají ke kreditům znaky (`kUsed + text.length`) → převést
  znaky na kredity podle modelu (nový hlas teď počítají 2,5× — opatrně, ale nepřesně).
- [x] **HOTOVO 2026-10-11 (CODE-read), nálezy v položce níž · Pro CODE-read — ElevenLabs: zkontrolovat opravu cen a brzdy celé jednou a pořádně** (owner 2026-10-11: *„zadej nález oprav cen
  code read, ať to ještě zkontroluje celé jednou a pořádně!“*). Kontext: `RUNAR_DECISIONS.md` 2026-10-11 (43) a položka o hlasu výš.
  Teď se testuje a nesmí se platit nic navíc — Starter a nepřekročit, co je v něm zdarma; testeři zůstávají premium s brzdou 15 hlasů.
  (a) **Jednotky a sazby:** počítadlo i limit v `voice_quota_snapshots` jsou kredity; v2 i v3 0,4 kreditu na znak ($0.08 / 1000 zn.),
  kredit $0.0002, 2026-09-25 ještě 0,5. Ověřit proti `voice_usage` a ceníku API v ownerově účtu (CODE-tune ověřil 3 dny).
  (b) **Tarif:** ElevenAPI Starter $6 = 30 000 kreditů měsíčně, reset 10. dne; převod nejvýš 2 měsíce, zůstatek nejvýš 90 000; dobití $2.76
  (13 800 kreditů) se čerpá až po kreditech tarifu; automatické dobíjení vypnuté. Co z toho je „zdarma“ a co už placené.
  (c) **Brzdy:** `VOICE_SAFE_SHARE` 0,7 se bere z `character_limit`, ve kterém je i dobití — může při malém převodu sáhnout do placeného?
  `elevenlabs-proxy` a `elevenlabs-static` přičítají ke kreditům znaky (`kUsed + text.length`). Strop testera 15 hlasů na kalendářní
  měsíc proti cyklu EL (reset 10.); příznak tester má 7 účtů včetně 2 admin; hlas Yggdrasilu ~590 kreditů. Spočítat nejhorší měsíc proti
  30 000 kreditů bez převodu i s dnešním převodem.
  (d) **Ceny:** `RUNAR_PRICING.md` (cena čtení, marže, „ElevenLabs Plan — When to Upgrade“ = cenové hladiny, podle kterých se v produkci
  přejde na vyšší tarif) se sazbou $0.08 a v kreditech; nástroje `scripts/utils/pricing_tabulka.js` a `scripts/utils/stats.js`
  (sazba opravena 03bf490).
  (e) **Výstup:** nálezy jako „Pro CODE-tune“ (kód a nasazení dělá CODE-tune), co chce ownera zvlášť. Nic negenerovat přes ElevenLabs —
  stojí kredity; stav účtu ze snímků nebo od ownera.
- ✅ *(CODE-tune 2026-10-12: oddíl o úložišti v obou jazycích přepsán podle toho, co appka opravdu drží; napřed z úložiště pryč, co
  nečetlo nic — `treeLog`, staré počítadlo zkušebního čtení, místní korekce — a fronta neuložených čtení svázaná s účtem; DECISIONS
  2026-10-12 (4))* ~~**Zásady soukromí: výčet toho, co drží úložiště prohlížeče, není úplný**~~ (nalezeno 2026-10-11 CODE-tune u okna „Where to start“,
  DECISIONS 2026-10-11 (65)): `v2/runar-privacy.html` bod 6 (EN i IS) jmenuje jazyk, jméno, počet čtení a přihlášení — chybí oslovení
  (`runar_gender`) a příznak „okno Where to start už viděl“ (`runar_wts_seen`); osobní údaj ani jedno nenese. Doplnit větou EN + IS
  (IS ověřit, CLAUDE.md §2), nebo výčet nahradit popisem druhu („nastavení appky“).
- [ ] **Teach ve shrine platí statický hlas dvakrát** (nalezeno 2026-10-11 CODE-tune při mapování cest hlasu, DECISIONS 2026-10-11 (61)):
  náhled jde přes elevenlabs-proxy, „SAVE VOICE TO MEMORY“ ho přes elevenlabs-static vygeneruje znovu → 2× kredity ElevenLabs za každé
  audio Kolekce. Uložení může vzít audio z náhledu (funkce je jen pro admina; upload místo nového volání EL).
- ✅ *(CODE-tune 2026-10-11, DECISIONS 2026-10-11 (64): tlačítko Kolekce z deníku pryč, hlas čtení „ᚢ HEAR THE READING“ /
  „ᚢ HLUSTA Á LESTURINN“)* **Deník: dvě tlačítka hlasu u single — popisky rozhodne owner** (2026-10-11, DECISIONS (61)): nové „ᚢ HEAR RÚNAR SPEAK“ (hlas
  čtení, jako ve čtení) a staré „♪ RÚNAR'S VOICE“ (`jcard_audio_btn` — Rúnarova slova o RUNĚ z Kolekce, ne čtení). Druhé jméno mate:
  přejmenovat (a ověřit IS), nebo ho z deníku vynechat (Kolekce ho má)? Čeká na ownera.

## Multijazyčnost

## i18n / prevence uvízlé angličtiny

- [x] ✅ *(CODE-tune 2026-10-11: jeden pomocník `datumUI` v `runar-utils.js` pro deník i strom, smoke ㊻, DECISIONS 2026-10-11 (67).)* ~~**Deník: islandské datum v Chromu bez islandských dat**~~ (CODE-tune; nalezl CODE-tree 2026-10-11 při ovládání stromu). `runar-journal.js`
  (~ř. 153) formátuje `toLocaleDateString('is-IS', …)`; Chrome na Windows (měřeno bez okna) islandská data nemá
  (`Intl.DateTimeFormat.supportedLocalesOf(['is-IS'])` → `[]`) a vrátí anglické „May 21, 2026“. Strom má záložní číselné datum
  (`_treeDatum` v `runar-tree.js`: „21.5.2026“) — kandidát na jeden pomocník v `runar-utils.js` pro deník i strom (§18). Na Androidu
  a iPhonu neověřeno.
- [ ] **data-i18n atributy (architektura)** — nejrobustnější prevence uvízlé angličtiny v IS: element si nese `data-i18n="key"`, generický loop v `updateUIText` aplikuje `t()` → wiring se **nedá zapomenout**. Dnes se dynamické stringy musí ručně napojit v `updateUIText`/render funkcích → snadné vynechat (série stuck-EN fixů 2026-07-06: reading form, greeting, teasery, mode buttons, „or", journal filtry…). Refaktor střední velikosti: data-i18n na statické UI + generický apply, postupně nahradit `setText` volání.

## Struktura / refaktor

- [x] **HOTOVO 2026-10-11 (CODE-read, DECISIONS (60)): pět souborů appky v `_SDILENE` · Soubory appky, do kterých píše víc session → `_SDILENE`? (CODE-tree 2026-10-11, pro CODE-read — vlastní pojistku)** Doklad z jednoho
  dne: commit CODE-tune 4eb6905 vzal moje necommitnuté kusy v `v2/runar-reading.js` a `v2/runar-translations.js` (cena „zdarma“ při založení);
  pathspec commit bere celý soubor. Píšou do nich CODE-tune i CODE-tree (`runar-tree.js` drží i životní runu CODE-tune; `runar-reader.html`,
  `.css`). Než se přidají do `_SDILENE` v `hooks/pre-commit.py`: ověřit, že `commit_vlastni.py commit` s JS/CSS ve `v2/` správně přidá
  verzi `sw.js` (pre-commit ji dnes přidává do indexu — s dočasným indexem `commit_vlastni` neověřeno). `smoke.py` přidán 2026-10-11.
  ✅ **Ověřeno 2026-10-11 (CODE-read, dočasný klon s hooky):** `cv.zapis` do `v2/runar-app.js` + `commit_vlastni.py commit` → commit nese
  `v2/runar-app.js` i `v2/sw.js` (v645 → v646), index po commitu čistý. Technicky to jde; zařazení appky mění CLAUDE.md §1
  (Edit na CSS/HTML/translations.js) → rozhoduje owner.

## Tree — pozastavené signály + vrstva významu (konsolidace 2026-07-30)
> Přeneseno sem z archivovaných tree doků (`docs/archive/tree/`: RUNAR_TREE_TODO · RUNAR_TREE_SPECIALS · runar-patterns · runar-tree-forces · placement · tree-of-life · BUILD), ať živé nápady nezmizí. Kanonický model + signály = `RUNAR_TREE.md`. Nic z níže uvedeného není v kódu; **nic se nestaví bez probrání s KUKYm.**

- [ ] **Strom v aplikaci po portu (CODE-tree, ladí se s ownerem na jeho čteních):** kreslení na pozadí po čtení + uložený obrázek (sem sloučena i položka „překreslení je drahé“ z 2026-08-10, triáž 2026-10-12, CODE-tree)
  (DECISIONS 2026-10-11 (35)) · zlaté obtažení větvičky čtení na posuvníku · posuvník při pozdním založení (zakládací Norny jdou první,
  datum u kroku 2 skočí zpět) — DECISIONS 2026-10-11 (55).
- [x] **Strom: rovná větev visí rovně dolů + kořeny úzké** — ✅ obojí v produkci 2026-10-11 (větev DECISIONS (69), kořeny (72)). Historie: (CODE-tree 2026-10-11; KUKY ke snímku z produkce:
  *„žádná větev by neměla jít jako rovný klacek rovně dolů … nevím, proč se kořeny nerozjedou více do stran? … nanečisto tady a po schválení
  produkce“*). Měřeno na jeho stromě (produkce, 471 čtení, zakládací Norny první):
  (1) **Vada přetečení úhlu** v `bendSpine`/`bendRootPaths` (`build_crown_composer.py`): rozdíl úhlů bez přepočtu přes ±180° → u větve mířící
  vlevo kolem vodorovné stočí Confirmation úsek až o 60° (povýšená Hagalaz z Eihwazu, klíč 107: 23° od svislice místo 83°). (2) **Pravidlo
  ownera:** rovnou větev (tětiva/délka ≥ 0,9) strmější než 45° od svislice dolů natočit kolem paty ven na 45° (kořeny tudy nejdou).
  Rovných větví do 30° od svislice: 35 → 14 (oprava úhlu) → 0 (pravidlo). Patch obojího: `docs/archive/tree/2026-10-11_nanecisto_uhel_dolu.patch`
  (po schválení `git apply`, `build_tree_production.py`, smoke).
  (3) **Kořeny:** rozdíl lab × produkce dělá hlavně LOG — se stejným nastavením lab (388 čtení, staré Norny) koruna 879 a kořeny 0,88 koruny,
  produkce koruna 1332 a kořeny 0,44. Ke svislici je stáčí rozhodnutí 2026-10-11 (3) (návraty stočí strměji) a (13) (Norny strmější): bez
  prvního 0,59, bez obou 0,65 — obojí by ta rozhodnutí měnilo; širší výchozí vějíř skoro nic (0,47). Uložený stav labu z 2026-10-09 se od
  výchozího liší jen délkou kořenů (95 × 65); dnešní stav z labu (tlačítko ULOŽIT) zatím nepřišel.
  ✅ **(1) + (2) v produkci 2026-10-11** (KUKY „8. ano, pusť opravu větve do produkce“) → DECISIONS 2026-10-11 (69). Zbývá **(3) kořeny:**
  owner ladí „rozevření kořenů“ v labu na svých čteních (DECISIONS 2026-10-11 (66)); hodnotu pak dát do produkce jako výchozí.
  ✅ **(3) kořeny v produkci 2026-10-11:** rozevření 0,8 jako výchozí (KUKY „rozevření kořenů 0.8, dej to do produkce“) → DECISIONS (72).
- [x] **PORT NOVÉHO STROMU DO APLIKACE** — ✅ hotovo 2026-10-11 (KUKY „8. nasadíme“) → DECISIONS 2026-10-11 (55). Historie položky: Lab má založení jako nutnou podmínku, zóny × elementy, povýšení a tíhu čtení (`RUNAR_TREE.md` §2 + §5 kroky 1–5); aplikace kreslí starý živý strom ze všech čtení (KUKY 2026-10-03: „novou si rád prohlédnu, až bude skoro hotová“). ⭐ **Plán a podmínky portu → DECISIONS 2026-10-11 (24), telefon (25) a jeho oprava (29), kreslení na pozadí (35)**; založení podle kánonu (`RUNAR_TREE.md` §2), sem se neopisuje. **Pro CODE-tune (odpověď na jejich otázku z 2026-10-02 „roste živý strom bez založení?“):** ne, nikdy (KUKY, `RUNAR_TREE.md` §2); jejich výzva `tree-founding-cta` při `tree_founded_at = NULL` je správně a nic se na ní nemění; seeking ukládají správně. Posuvník historie („jak mi strom rostl“) musí v aplikaci zůstat i po portu. Ovládání (plná šířka, přiblížení, šipky, kreslení po puštění) je v aplikaci od 2026-10-11 → DECISIONS (39); zlaté obtažení větvičky čtení na posuvníku přijde s portem.
- [ ] **Strom: souběhy větví (překryvy)** — **stav** (triáž 2026-10-12, CODE-tree): po ramenech a portu na jeho stromě z produkce (471 čtení) 3 souběhy (`tree_overlap.js`): Wunjo × Gebo 29 px a Wunjo × Eihwaz 29 px (obojí vpravo nahoře), Uruz × Perth 62 px (vlevo nahoře); modelové stromy po ramenech nepřeměřeny. Sloučeno s položkou o shluku nahoře vpravo. Historie: **Strom (lab): souběhy větví na modelových stromech** (CODE-tree, 2026-10-03, DECISIONS (15), (16)). Na 24 modelových stromech (`ovtypes`) 158 souběhů (ráno 250, s „koštětem“ 49 — tvar ramen, který KUKY odmítl). „Povýšená podél matky“ vyřešená (146 → 18, DECISIONS (16); nepomohlo: dřívější odštěpení, úhel od špičky matky, menší zdvih špičky povýšené). Dvě ramena na stejné straně 74 → 21 (DECISIONS 2026-10-05 (4)); všech souběhů 62. **Zbývá:** dvě ramena na stejné straně (21), povýšená + povýšená (16), povýšená + jiné rameno (15). Každý kandidát změřit oběma směry páky + `scripts/utils/tree_render.js` (KUKYho strom i modelový), tvar ramen z kmene NEMĚNIT. Na KUKYho stromě dnes žádný (dvě mělká křížení, obě větve vidět).
- [x] **→ sloučeno do „Strom: souběhy větví“ (triáž 2026-10-12, CODE-tree):** vpravo nahoře dnes 2 souběhy místo 13. Historie: ⭐ **Strom (lab): shluk větví budoucnosti a světa nahoře vpravo** (CODE-tree, 2026-10-05, po DECISIONS (12)). Každé čtení je teď na svém místě a strom má tvar diagonály z kánonu (nitro + minulost vlevo dole, svět + budoucnost vpravo nahoře) — a právě nahoře vpravo se sbíhají strmá ramena budoucnosti a jejich povýšené větve: souběhy na KUKYho stromě 13 (dřív 2), na 24 modelových ~93 (dřív 62). Kandidáti: rozestup povýšených podél matky a jejich odbočka od sousedních větví (ne jen od matky), úhly povýšených na straně jako u ramen (pořadí), délka povýšených. Měřit `ovtypes`/`tree_overlap.js` + `tree_render.js`; tvar ramen z kmene neměnit.
- [ ] **Strom: popis větve Rúnarovým hlasem — směr schválen, zatím koncept** (CODE-tree, 2026-10-09; DECISIONS 2026-10-09 (14)). KUKY:
  *„tohle je směr. Rúnarovým hlasem to bude znít jinak, ale zkus to“* · *„není až tak důležité, kolikrát člověk dostal nějakou runu … může to
  spíš určovat pořadí, v jakém bude výklad těch run jako jednoho spojení … jako takový spread. jde o ten význam run“* · zvířata stromu
  *„spíš nad plán, budeme je zkoušet“*. Pravidla: kotví na tom, na co se člověk ptal (oblast, záměr); počty se neříkají, četnost určuje
  pořadí run ve výkladu; zvíře jen podle kánonu (`RUNAR_DESIGN.md` „Bytosti“); do aplikace přes CODE-tune/Cowork v EN i IS.
  KUKY 2026-10-09: *„bude to chtít nějakou práci, aby to znělo dobře … zapíšeme to jako směr. teď používáme pro výklad GPT sol 6, takže to
  bude znít jinak než Opus“* — koncept psal Claude; skutečný popis by psal model výkladu (dnes GPT-6 sol), ladit se musí na něm.
  KUKY 2026-10-10: *„větší počet spíš dává větší váhu ve čtení. jelikož je dominantní, je to čistě hypotéza! je potřeba to zkusit na čteních.
  dokud nejsou čtení pořádně otestovaná, nic není takhle to bude.“* → četnost = váha (dominance) runy ve výkladu, ne jen pořadí; hypotéza k ověření.
- [x] **✅ přebila stavba ramen** (triáž 2026-10-12, CODE-tree): vedlejší větev je od 2026-10-10 další živel v TÉMŽE místě (strana × zóna) jako rameno, matka v jiné zóně nevzniká (DECISIONS 2026-10-10 (34), (38); `RUNAR_TREE.md` §3); „držet místo“ i nanečisto „jasan“ jsou historie. Historie: **Strom (lab): povýšená ze střední zóny visí v koruně kvůli matce** (CODE-tree, nalezeno 2026-10-09). Nauthiz z Othily má místo
  verdandi (12 z 15 čtení „teď“), ale vyrůstá z Othily (skuld, 85 % kmene) — jediného zemního ramene vlevo (matka = rameno téhož živlu
  na straně místa, nejbližší pásmo). Owner ji pak čte jako budoucnost (*„když je tak vysoko na stromě … je to koukání do budoucnosti?“*).
  Inspekce už ukazuje zónu místa (opraveno 2026-10-09), kresba ne. KUKY 2026-10-09: *„5. opravit … takže dole nemá žádný element, z kterého
  může vyrůstat?“* — vlevo je jediné zemní rameno Othila nahoře; zemní rameno „teď“ nevzniklo, protože v době prvního takového čtení (#25)
  neměl krátký kmen místo na nový pramen. **Nanečisto změřeno:** (a) vlastní výstup z kmene, když je matka o DVĚ zóny vedle → Nauthiz se
  nehne (Othila je o jednu zónu, jen vysoko na kmeni); (b) vlastní výstup, když je matka v JINÉ zóně (patch
  `docs/archive/tree/2026-10-09_nanecisto_vyska.patch`) → Nauthiz vlevo 63 %, vpravo 52 % kmene, ale z kmene vychází 24 větví místo 14
  (povýšená zbude 1), strom užší a vyšší, větve jako příčky; smoke ㉳ projde. Odštěp níž na matce nepomůže (matka vychází z kmene vysoko).
  Čeká na ownera: (b), nebo nechat a v popisu říkat, že visí z matky.
  KUKY 2026-10-09: *„musíme najít řešení. může se ten problém nějak odstranit na začátku při vzniku stromu? třeba tím, že se drží místo pro
  ten element, dokud se neobjeví?“* → (c) **držet místo** (patch `docs/archive/tree/2026-10-09_nanecisto_rezerva.patch`): první čtení živlu
  × zóny založí vlastní pramen i na krátkém kmeni (bez kapacity `capSecAt`; kmen se rozestoupí / povyroste). Jeho strom: Nauthiz vlevo
  60 % (teď), výstupů z kmene 17 (dnes 14, (b) 24); větví mimo svou zónu 9/22 (dnes 12, (b) 3); modelové stromy 6–9/21–22 (dnes 7–11,
  (b) 2–3); mladý strom (20 čtení) skoro beze změny; smoke ㉳ projde. Zbytek mimo zónu = povýšené pro druhou stranu zóny (matka na té
  straně v jiné zóně, např. Nauthiz vpravo z Uruzu 25 %) a Fehu z prvních čtení.
  ✅ **(c) držet místo zapnuto v labu 2026-10-10** (KUKY „7. ano zapni to v labu“, DECISIONS 2026-10-10 (4)). Zbývá druhá strana zóny
  (povýšená z matky v jiné zóně) — KUKY se ptá, jestli je zóna to nejlepší řešení (2026-10-10, bod 4) → návrh modelu podle definice Yggdrasilu.
  **Návrh „jasan“ nanečisto 2026-10-10** (Yggdrasil je v kánonu jasan, jasan má vstřícné větvení; KUKY: *„nemusí být úplně přesně proti
  sobě, ale přirozeně cca v té oblasti … trochu mimo linii, tak to udělá strom zajímavý“*), patch `docs/archive/tree/2026-10-10_nanecisto_jasan.patch`:
  druhá strana živlu × zóny = vlastní výstup z kmene mířící na skutečnou výšku pramene své zóny → pár ~16 px od sebe (9 z 10 párů na jeho
  stromě; v1 mířila jen na cíl pramene a páry vyšly 46–201 px od sebe). Jeho strom: mimo svou zónu 2/22 (dnes 9), výstupů z kmene 24
  (dnes 17), povýšená 1; smoke ㉳ projde. Strom užší a vyšší, větve kratší a vodorovnější v párech (mladý strom jako mladý jasan / jehličnan).
  Zbývá Tiwaz 89 % (pořadí z prvních čtení). Čeká na ownerovo porovnání s dneškem.
- [x] **✅ ve stavbě ramen (triáž 2026-10-12, CODE-tree):** délky ramen podle patra ×1,33 dole → ×1,0 nahoře (`XLL`, DECISIONS 2026-10-10 (38)), v aplikaci od portu. Historie: ⭐ **Strom (lab): spodní větve o 1/3 delší, směrem nahoru rovnoměrně méně; zrcadlově kořeny — nanečisto** (CODE-tree, 2026-10-10). KUKY:
  *„jen třeba o 1/3 prodluž spodní větve, ale to zvětšení musí jít postupně nahoru. rovnoměrně … zrcadlově to platí i pro kořeny“*. Patch
  `docs/archive/tree/2026-10-10_nanecisto_spodni.patch`: délka × (1 + 1/3 × (1 − t)), t = výška výstupu na kmeni (nejnižší +1/3, nejvyšší +0;
  povýšená podle výšky odbočky); kořen × (1 + 1/3 × s), s = jak moc míří do strany pod povrchem. Změřeno na jeho stromě: Kenaz 22 % ×1,33 …
  Dagaz 98 % ×1,00; kmen trochu povyroste (drží poměr k rozpětí, `hwRatio`); smoke ㉳ projde. Čeká na ownerův pohled.
  KUKY 2026-10-10: *„nejsem si jistý, že tak jak to máme teď udělané je správně“* — místo odpovědi pokus „patra 4 / 3 / 2“ (níž).
- [x] **✅ zapnuto jako ramena 2026-10-10 (DECISIONS (38)), v aplikaci od portu 2026-10-11 (55) (triáž 2026-10-12, CODE-tree).** Historie: ⭐ **Strom (lab): pokus „2 × (4+4+3) + 3 vrchol“, kořen pro každou větev — nanečisto** (CODE-tree, 2026-10-10). KUKY nejdřív *„spodní větev
  bude mít až 4 vedlejší větve, nad ní až 3, nad ní až 2 … jde mi teď o vizuální“* (pokus v párech, `…_patra.patch`), pak *„2x(4+4+3)+3 vrchol“*;
  kořeny *„normálně je rozprostři, žádná mezera kolem prostřední … šířka bude stejná jako koruna“*, *„nemáš měnit, jak se dělají kořeny … jen směr“*
  (kopie koruny ✖, `…_ramena.patch` jen historie) a *„kořenů je málo.. každý pramen na větve a to by cca mělo být vidět v kořenech“*. Patch
  `docs/archive/tree/2026-10-10_nanecisto_ramena_koreny.patch`: 6 ramen střídavě vlevo a vpravo (26–76 % kmene), na straně rameno + 3, + 3, + 2,
  vrchol + 2; délky ×1,33 → ×1,0; kořeny původní stavby, 25 (každá větev svůj): hlavní natočené (vůdčí dolů, na straně 52° / 34° / 17°), vedlejší
  z kořene matky zrcadlově k odbočce (verze (26); prodloužení a ohnutí z (28) owner nechce). Šířka kořenů 79 % koruny. DECISIONS 2026-10-10
  (17), (21), (23), (26), (27), (28), (30). Další krok: jak ramena a vedlejší větve skládat technicky (návrh ownerovi 2026-10-10).
- [x] ✖ **Strom: obrys stromu života (dóm) — ZAMÍTNUTO** (KUKY 2026-10-10: *„chybí tomu úplně všechno. je to zrůda! … takže ne. není to dobré
  a žádná oprava tvého návrhu to nezlepší“*). Nevracet konce větví na kruh ani vějíř podle výšky. Původně (CODE-tree, 2026-10-10). KUKY s pěti obrázky stromu života: *„spodní větve
  jako nejstarší, největší a nejdelší. koruna více zarovnaná do půloblouku, u kořenů to samé. to naše vypadá jako strom, ale my neděláme
  obyčejný strom. má být taky vizuálně hezký.“* Předlohy: koruna = horní půlkruh, kořeny = dolní, zem = průměr (kruhové 2, 3, 5); nízké
  větve nejdelší a do strany, horní kratší vzhůru; kmen krátký, větví se brzy. **Nanečisto krok 1+2** (patch
  `docs/archive/tree/2026-10-10_nanecisto_dom.patch`): (1) konec každé hlavní větve dotažen na kruh se středem u paty kmene (R = 1,35 ×
  výška kmene; počet čtení jen ±15 % — délka přestává být hlavně „praxe“, F5 2026-08-07); (2) úhel hlavní větve podle pořadí výšky na kmeni
  (nejnižší ~80°, nejvyšší ~20° od svislice). Výsledek: koruna široký oblouk (~2× širší než vysoká), ale větve dlouhé a řídké, vršek slabý,
  boční větve visí, kořeny drobné; smoke ㉳ (m) 1 porušení. Krok 1 sám (bez úhlů) dal plochý deštník. Další kroky k rozhodnutí: kořeny do
  dolního půloblouku, hustší a kratší koruna, konce větví vzhůru, kratší kmen; střet s „délka = praxe“ a „výška roste se šířkou“ (hwRatio).
- [x] ✅ **Strom (lab): „rameno = strana × zóna, vedlejší = další živly“ — ZAPNUTO v labu 2026-10-10 (DECISIONS (38)), smoke ㉳ přepsán.** Původně:
  ⭐ **návrh — umístění nanečisto** (CODE-tree, 2026-10-10). KUKY *„jak to vyřešíme
  technicky?“* → *„13. ano“*. Patch `docs/archive/tree/2026-10-10_nanecisto_rameno_strana_zona.patch` (funkce `slotAssign` místo `stableAssign`): 6 ramen
  (strana × zóna) + vrchol, vedlejší = další živly (kapacita 3 / 3 / 2, vrchol 2), další živel jako větvičky na rameni, bez strany na lehčí stranu.
  Na jeho stromě 25 větví, 19 % tažení jako větvičky na rameni jiného živlu, výšky stálé od 30 čtení. **Další kroky:** ownerův pohled → přepsat
  smoke ㉳ na nová pravidla → zapnout v labu → port do aplikace. DECISIONS 2026-10-10 (34).
- [x] ✅ **Strom (lab): živý tvar ramen — ZAPNUTO v labu 2026-10-10 (DECISIONS (44)): délka podle čtení místa, seeking tvaruje celou větev.** Zbývá
  od ownera: kořeny dodělat. Původně: ⭐ **živý tvar ramen — strom se má měnit, ne stát od začátku stejně** (KUKY 2026-10-10: *„strom by neměl zůstávat úplně statický.
  měli jsme tam ty věci, kdy seeking nebo co to bylo tvarovalo větve určitým způsobem, by to mělo platit i pro hlavní větve, jinak bude strom
  vypadat stejně od začátku, ale je to živý organismus, který se mění a tvaruje“*). S rameny strana × zóna dává výšku, úhel a délku ramene jeho
  místo — posuvníky tíha, natočení za oblastí, čas → výška a max ramen teď ramena neovlivní (`RUNAR_TREE_MAP.md` §5, §13). Návrh ownerovi
  2026-10-10 (CODE-tree). KUKY: *„aby se celá větev tvarovala“*, křížení nevadí, vadí souběh → **nanečisto a) + b)** (patch
  `docs/archive/tree/2026-10-10_nanecisto_zivy_tvar.patch`): délka podle čtení místa, seeking tvaruje celou větev; souběhů jako dnes (3).
  Čeká na ownerův pohled. DECISIONS 2026-10-10 (38), (41).
- [x] **ZAVŘENO 2026-10-11 — owner nechává (KUKY 2026-10-10: *„11. asi mi to nevadí“*, DECISIONS 2026-10-11 (2)).** Po zapnutí ramen
  strana × zóna jsou to dnes větvičky Perthina kořene (pramen 2), v kořenech nanečisto jedna (36 px). Původně: **Strom (lab): Berkanin kořen
  má větvičky nad zemí** (CODE-tree, nalezeno 2026-10-10 při pokusu s kořeny). Na KUKYho stromě dnes jedna
  větvička kořene Berkany vyleze 42 px nad zem (v pokusu se 25 kořeny tři, až 72 px) — ostatní runy ne. Příčina asi tvar runy v branch composeru
  (větvičky Berkany míří vzhůru i u kořene). Ověřit v `runar-branch.js` (`RUNE_CHAR` / `RUNE_TUNE` berkano) a rozhodnout s ownerem — kořen se
  nepředělává (DECISIONS 2026-10-10 (23)). V pokusu (26) zůstává (ohnutí z (28) owner nechce, DECISIONS 2026-10-10 (30)); v labu taky.
- [ ] **Strom (lab): `AREA_LAT` odporuje „oblast = strana“** (CODE-tree, nalezeno 2026-10-09). **Stav** (triáž 2026-10-12, CODE-tree): lab má vlastní `AREA_LAT` srovnanou s kánonem (Love −0,2, Crossroads 0, Spirituality +0,5; čte ji `sideOf` a `latOf`), engine `runar-branch.js` drží starou (Love −0,75, Spirituality −0,20, Crossroads +0,10) a řídí jí natočení větviček při kreslení (`spec.area`). Pořád dvě kopie téže informace (§20) — srovnat engine s labem s golden-verify kresby. Původní text: Tabulka v `runar-branch.js` (sdílená
  s aplikací) bere Love −0,75 (nitro), Spirituality −0,20 (skoro střed), Crossroads +0,10 — kánon (`RUNAR_TREE.md` §3) má Love a Crossroads
  bez strany a Spirituality ve světě. Čte ji strana větvičky (`sideOf`), natočení ramene za čteními (`latOf` / `areaSide`) i lateral
  větvičky v enginu. Druhá kopie téže informace (§20) → srovnat s `SIDE_A` ve `stableAssign`, s golden-verify kresby.
- [x] **✅ přebila stavba ramen** (triáž 2026-10-12, CODE-tree): výšku ramene dává od 2026-10-10 jeho zóna (Urð / Verðandi / Skuld na každé straně), ne pořadí zrodu (DECISIONS 2026-10-10 (34), (38)). Historie: **Strom (lab): vpravo Fehu (přítomnost) na 89 % kmene nad Algizem (budoucnost) na 65 %** (CODE-tree, nalezeno 2026-10-09 čtením
  KUKYho stromu, 388 čtení). Obě ramena vznikla už v prvních 20 čteních (13 ramen naráz po založení) a výšky se pak nehnou (po 20, 40,
  80, 160, 388 čteních pořád 89 a 65) — pořadí ramen podle výšky se nemění, takže rameno zrozené vysoko tam zůstane, i když jeho čtení
  patří doprostřed. Kandidát: zrod do mezery zóny (2026-10-05) platí i pro ramena z prvních čtení; měřit `tree_read.js` + `tree_diag.js jump2`.
- [ ] **Strom (lab): záloha výšky bez záměru — jen kdyby svět runy neseděl** (CODE-tree, 2026-10-09; nízká priorita, nestavět bez ownera).
  Dnes: čtení bez záměru dostane výšku podle světa runy (Hel dole, Midgard střed, Asgard nahoře). Druhá možnost, kterou owner chce mít
  po ruce (KUKY: *„už máme vytvořenou zálohu pro případ, že mi to nebude sedět“*) = zóna, kde je strom zatím nejslabší (roste od zóny
  k zóně). Nepostavená, jen popsaná; DECISIONS 2026-10-09 (10).
- [x] **✅ přebila stavba ramen** (triáž 2026-10-12, CODE-tree): místo ramene je pevné podle strany × zóny, nic se nepřesouvá (`RUNAR_TREE.md` §3). Historie: **Strom (lab): sklouznutí úchytů při zrodu ramene podle zóny až 47 px** (2026-10-05): sousedé se rozestoupí v jednom čtení (rychlé kroky). Kdyby to bylo vidět jako skok, rozložit rozestoupení do pár čtení s ramenem, které se rodí malé.
- [ ] **Lab: mrtvé úhly povýšených z vějíře** (CODE-tree, 2026-10-03; ověřeno 2026-10-12: `_GANG` se pořád jen zapisuje). V časové smyčce `build_crown_composer.py` se pro povýšené počítá strana a cílový úhel (`gIx`, `gN`, `gSv`, `gSl`, `gZ`, `gSd`, `gS0`, `liveG`, `tgA['g'+j]`, `gAngQ` → `_GANG`) a nic to nečte — úhel povýšené bere `growGrad` od směru matky (`_GTURN`). Smazat s golden-verify (stejná kresba na KUKYho a modelových stromech).
- [ ] **Lab RŮST: „expanze šířka / mohutnost“ ukazuje mrtvé hodnoty** (CODE-tree, nalezeno 2026-10-03 při mapování; ověřeno 2026-10-12: `effCanopy` a `girth` dál nikdo nečte). `wExp` a `mExp` se spočítají (`effCanopy`, `girth`) a nikde se nepoužijí (`RUNAR_TREE_MAP.md` §2). Buď zapojit (co mají velké spready vody/země a stínu na stromě znamenat, rozhodne owner), nebo z RŮST vyřadit.
- [ ] **Fotorealistická kůra = WebGL, vlastní projekt (rozbor 2026-08-10).** KUKY chce obojí — kresbu i fotografii. Kresbu řeší „kůra ze stavby" (`hrebeny` + `tonPramene`, viz RUNAR_TREE.md). **Fotografii 2D plátno neumí**: textura potřebuje plochu a canvas kreslí siluetu, takže se dlaždice drží obrazovky a čte se jako nálepka (ověřeno a vráceno 2026-08-10). Cesta je **UV mapování na pás trojúhelníků ve WebGL** — strom jako geometrie s materiálem kůry, stínování i textura per pixel. Není to posuvník, je to přepis rendereru; zatím jen v labu, produkce běží na telefonech.
- [x] **→ sloučeno do „Strom v aplikaci po portu“ (triáž 2026-10-12, CODE-tree):** přeměřeno 2026-10-11 (DECISIONS (25), oprava (29)), lék = kreslení na pozadí + uložený obrázek (35). Historie: ⚠️ **PŘEKRESLENÍ STROMU JE DRAHÉ A ROSTE S POČTEM ČTENÍ** (změřeno 2026-08-10, lab, desktop): 10 čtení = 5 ms · 25 = 16 ms · 50 = 34 ms · 99 = **125 ms**. Desetinásobek čtení = dvaadvacetinásobek času. Na telefonu počítej ~4×, tedy **půl sekundy při 99 čteních** — a uživatel jich za rok nasbírá násobně víc. Strom se překresluje při každém posunu časové osy. **Před portem do produkce to chce strop nebo cache** (např. vykreslit statickou část do offscreen canvasu a překreslovat jen to, co se mění).
- [ ] **`readings.spread_data` je MRTVÝ SLOUPEC** (`sql/spread_data.sql` ho zavedl pro více-runové spready; ověřeno 2026-10-12: ve `v2/` ani v edge funkcích ho nikdo nečte ani nepíše — jediný záznam, duplikát CODE-read je v archivu odložených). **Nikdo do něj nezapisuje a nikdo ho nečte.** Strom si tažené runy místo toho skládá z textu: `readingsToTreeLog()` (`v2/runar-tree.js`) prochází `rune_glyph + short_text` a sbírá známé glyfy. **Funguje to** — u single čtení je `rune_glyph` první a bere se jen `runes[0]`, u spreadu je `short_text` = vygenerovaný seznam `"ᚠ FEHU · ᚢ URUZ · …"`, ne próza. ⚠️ Úzké riziko: kdyby u single čtení chybělo `rune_glyph`, vzal by se první glyf z **modelem psané prózy** jako tažená runa. **Levný pojistný krok:** u single číst výhradně `rune_glyph` a `short_text` vůbec neprocházet. **Volitelně** pak `spread_data` buď naplnit strukturovaným seznamem run při zápisu (a strom odvázat od textu úplně), nebo sloupec zrušit.
- [x] **✅ data už jsou (triáž 2026-10-12, CODE-tree):** lab načte čtení ownera z produkce s oblastí, záměrem i seekingem (`scripts/utils/lab_moje_cteni.js`, DECISIONS 2026-10-11 (66)) a modelové logy smoke ㉳ je mají; výšku a stranu ramen ovšem od 2026-10-10 dává stavba (strana × zóna). Historie: 🐞 **AREA a INTENTION se v labu nikdy neprojevily — log je nemá (nalezeno 2026-08-10).** Změřeno: všech **2 290 čtení** v `crownLog` má `area:null` i `intention:null`, takže `intAxis`/`areaLat` vycházejí 0 a posuvníky `intention → výška` a `area → strana` **nehnou ničím** ani na maximu (ověřeno experimentem: 0 i 0,4 dají tytéž výšky 96/88/85/78/71/64/57/50/50 %). Není to vada enginu — vada dat: čtení vznikla tlačítkem bez area+intention. **Dokud se log nevygeneruje s nimi, jsou dvě dokumentované páky signálového řetězce fakticky neotestované.**
- [x] **✅ s portem (triáž 2026-10-12, CODE-tree):** aplikace má od 2026-10-11 kód labu, tvrdá podlaha 0,50 v kódu už není (zbyla v komentáři), výšky ramen dává stavba ramen (posuvník `exitFloor` mrtvý → ODLOŽENO, DECISIONS 2026-10-11 (66)). Historie: **Podlaha výšky výstupu 0,50 sráží větve na jednu úroveň** (viz `RUNAR_TREE.md` §5). Při 9 větvích už dvě sedí na 50 %; při `maxMains` 25 by jich tam bylo osmnáct. **V LABU VYŘEŠENO 2026-08-18** (posuvník `exitFloor`, slepených větví 5 → 0; čísla v `RUNAR_TREE.md`). **Produkce ne:** `build_tree_production.py` i `runar-tree-prod.js` mají dál tvrdé `Math.max(0.50, …)` (ověřeno 2026-09-23). Port až poté, co owner v labu dohraje hodnoty — dřív by se přenášel mezistav.
- [x] **2026-09-27 ČÁSTEČNĚ → ✅ s portem 2026-10-11 (DECISIONS 2026-10-11 (55)):** aplikace už **nekreslí falešnou kopii** (KUKY: „zakázat zdvojení") — ověřeno: zdvojení **0 z 2 024** Noren a 0 za 151 náhodných čtení; tažená runa, na kterou nezbude větev, ale v aplikaci **pořád chybí** (50 %). V **labu** hotové celé: zakládací Norny = 3 vlastní prameny s pozicemi, runa jen jednou (`RUNAR_TREE.md` §2, §5). Zbývá port do aplikace s novým modelem. Původně: 🐞 **NORNY: POLOVINA ZAKLÁDACÍCH STROMŮ KRESLÍ RUNU DVAKRÁT A JINOU VŮBEC (2026-09-27, diagnóza část 2, aplikace).** Protlačeno všech **2 024** možných Noren: **1 002 (50 %)** dá zdvojenou větev a zároveň chybí některá tažená runa — např. Kenaz·Fehu·Laguz → větve *Kenaz, Laguz, Laguz*, Fehu nikde. Příčina (`runar-tree-prod.js`): větve se přidělují **elementům**, ne runám (`stableAssign`: nová větev elementu až po každých 5 taženích), a chybějící slot se doplní **kopií posledního** (`branchEls[k] || branchEls[branchEls.length-1]`). K tomu: **kořen nenese runu svého pramene** (tvaruje ho jen životní runa — výměna runy v Nornách kořeny nezmění) · **pozice Noren** (urð/verðandi/skuld) = jen pořadí slotu (1. runa prostřední větev nahoře), význam minulost/budoucnost se nepoužívá · Norny se od 3 samostatných single liší jen „expanzí" jako každý spread. Nástroj: `scripts/utils/tree_diag.js 2` / `2b`. Řešení čeká na ownerův model „runa = vlastní pramen" (lab-first).
- [x] **✅ přebila stavba ramen** (triáž 2026-10-12, CODE-tree): délka ramene je od 2026-10-10 praxe místa (roste se čteními, DECISIONS 2026-10-10 (44)), `ageLen` zbyl jen u náběhu mladé větve. Kdyby kmen znovu působil přehnaně tlustý: `ageThick` v `runar-trunk.js` roste logaritmicky dál. Historie: 🐞 **Strom mohutní, ale neprodlužuje se — POTVRZENO MĚŘENÍM** (KUKY 2026-08-07: „je to přehnané"). `ageLen` **tvrdě saturuje na 1,00 už v 365 dnech**, kdežto `ageThick` roste logaritmicky **donekonečna**: 2 roky ×1,37 · 6 let ×2,07 · 7,3 roku **×2,20** — a délka po celou dobu **×1,00**. Fix: buď zpomalit/zastropovat tloušťku, nebo dát délce pomalý pokračující růst (nebo obojí). Souvisí s kapacitou pro odbočky (delší větev = víc slotů). Původní pozorování: Delší větev = víc slotů pro odbočky (kapacitní ventil k F1), takže na tom závisí i růst. Podezření: `ageLen` saturuje u zralosti, zatímco tloušťka roste dál (log, nikdy nekončí) → starý strom tloustne, ale neprotahuje se. Změřit a rozhodnout, jestli délka má růst dál (pomaleji), nebo je saturace záměr.
- [ ] **Váha větve = počet vyplněných polí** (area/intention/seeking). Víc kontextu = záměrnější čtení = mohutnější/výraznější větev; prázdné rychlé single = drobná větvička. Signál §4 „počet vyplněných polí → VÁHA", v kódu zatím není. (KUKY k tomu byl vlažný — jeden ze signálů síly, klidně vyřaditelný.)
- [x] **✅ všechny body v labu i v aplikaci (triáž 2026-10-12, CODE-tree):** (a) Norny = 3 hlavní kořeny (DECISIONS 2026-10-11 (13)), (b) prohloubení návratem a minulostí / nitrem ((3), (4), (7)); port 2026-10-11 (55); směr kořenů rozevřením 0,8 ((72)). Historie: **Kořeny = minulost/základ, zrcadlo koruny (KUKY 2026-07-30, směr; v labu NEvyzkoušeno).** Koruna = kam jdeš, kořeny = odkud jdeš; zrcadlí se **velikostí/mohutností** (Yggdrasil), ne aby dole vypadalo stejně jako nahoře. Co je má tvarovat (dle kánonu §2 = **obojí**): **(a) 3 zakládací Norny = 3 hlavní kořeny** (urð/verðandi/skuld → tvar + barva; udělat z lore pravdu) · **(b) prohloubení návratem** — runa z kořene se vrátí ve čtení → kořen zesílí/prohloubí; minulostní/nitro čtení (urð · léčení/rodina/nitro) živí hloubku (zrcadlo „budoucnost → vyšší koruna"). Krmí čtení tvaru (RUNAR_TREE.md §7: hluboké kořeny = drží tě minulost). **Stav:** kořeny se jen KRESLÍ (ozdoba: rostou s věkem, barva z Life Rune) — význam v kódu NENÍ. ⭐ **Bod (b) ZAPNUTO v labu 2026-10-11**
  (KUKY *„12. postavit!“*, *„9. ano, zapni v labu“*; DECISIONS 2026-10-11 (2), (3)): návrat runy kořen prodlouží a stočí hlouběji, seeking
  tvaruje kořen, kořeny se proplétají víc. „Minulostní/nitro čtení živí hloubku“ **ZAPNUTO v labu 2026-10-11** (KUKY *„10. ano, zapni v labu“*, DECISIONS 2026-10-11 (4),
  (7)): nad polovinu návratů z takových čtení se kořen prohloubí víc. Zbývá:
  (a) Norny → 3 kořeny — **ZAPNUTO v labu 2026-10-11, síla n4** (DECISIONS 2026-10-11 (13)); nanečisto 2026-10-11 (KUKY *„ok, jdeme na Norny → 3 kořeny“*, DECISIONS 2026-10-11 (12),
  patch `docs/archive/tree/2026-10-11_nanecisto_norny_hlavni_koreny.patch`): kořeny zakládacích Noren delší a strmější = tři hlavní kořeny. Výjimečné události (i „všechny tři
  kořenové runy v jednom čtení“) se teď nestaví — poskládají se z dat (`RUNAR_TREE.md` §7, Kořen jako celek; KUKY 2026-10-11). Zbývá port do aplikace. **Postup: napřed lab (trunk/crown-composer) → port do `build_tree_production.py` + regen `runar-tree-prod.js` + snapshot + smoke ⑬.** (TODO bod 11 · RUNAR_TREE.md §2.) ⭐ **KUKY 2026-08-03: mirror VIZUÁL PŘIJAT** — „každá větev má svůj kořen, velikost ~ větev/věk; jednoduché a rozumné". Tím se „minulostní slice" mění z NÁHRADY na pozdější **modulaci HLOUBKY** (větev z minulostních/urð čtení → hlubší kořen), ne přepis vizuálu.
  - **INVESTIGACE 2026-08-03 (proč root composer není vidět ve stromu):** viditelné kořeny = **spodní část kmenových pramenů** (`runar-trunk.js`), tvar z **LIFE RUNE** → uniformní, element+runa práce je nezmění. Element+runa kořeny (growBranch) se přidávají NAVRCH toho vějíře → tenké/překryté → nevidět. **FIX: odříznout life-rune root-parts pramenů (crown i non-crown strand), viditelné kořeny = element+runa growBranch (1/korunní větev = „každá větev má svůj kořen", ale variované).** Riziko: pata kmene — zajistit pokrytí základu. Reverzibilní.
  - **Podklady (root-analýza 2026-08-02):** funkce kořenů popsaná v RUNAR_TREE.md §2/§7/§8 · `docs/archive/tree/` (placement, forces, patterns, BUILD, TODO, tree-of-life) · RUNAR_DESIGN.md (Norns/founding). Kód-realita = `build_tree_production.py` + `runar-trunk.js`. Použitelné pro „minulostní slice": osa intention›area›seeking›world(Hel→urð) váhy 0.5/0.3/0.2 · u Norns/Yggdrasil nese osu POZICE runy · prohloubení = PRODLOUŽENÍ existujícího kořene · 1. Norns tvoří kořeny, další Norns = větev · persistence: tree_state.roots spočítat JEDNOU.
- [x] **✅ přebila stavba ramen (triáž 2026-10-12, CODE-tree, změřeno na jeho stromě):** hlavních větví po 1 / 5 / 10 / 20 / 30 / 50 / 80 / 120 / 200 čteních = 3 / 6 / 8 / 11 / 14 / 17 / 20 / 22 / 25 — struktura přibývá hned na začátku, strop 25 od ~200 čtení. Níž je měření starého enginu aplikace. Historie: **PŘEMĚŘENO 2026-09-27 (aplikace, po navázání na semínko):** Norny + různá single → 4. hlavní větev až u **19.** čtení, 5. u **46.**, 6. u **72.**; po 81 čteních je taženo **22 různých run, ale větví jen 6**. Počet větví řídí věk (`3 + floor(věk/80)`), ne počet tažených run. ↓ Původní položka: **Růstová křivka: napřed STRUKTURA (nové větve), pak velikost/posílení** (KUKY 2026-08-02, směr — RETENCE). Dnešní engine je pozpátku: 3 hlavní větve drží do ~27 čtení → první čtení spíš POSILUJÍ (uživatel nevidí, že strom roste → odejde). Fix: brzy ať čtení snadno tvoří **nové větve** → za ~50 čtení (~2 měsíce) hezký plný strom; **pak** přepnout na zvětšování + posílení + vzácná nová hlavní. Strop drží (ne chuchvalec 50 tenkých), jen se dosáhne dřív. **První měsíc = kritický** (pattern Forest/Finch/Duolingo: front-load viditelného pokroku). Páky: `maxMains`/`strandEvery`/`EXTRA`/`linearN`. Nejdřív prodiskutovat konkrétní křivku, pak ladit v labu. **ZMĚŘENO 2026-08-03 (reálný log 203 čtení):** nové hlavní větve vznikají jen na #1/27/54/80/107/134/160 (strandEvery=80), pak **strop 9 = konec** → vše jen zesílí. A každá nová se **rodí v strandAge≈0 → velikost ~0** → nezjeví se jako sprout, jen se pomalu plíží. **Fix = (a) rodit větve VIDITELNĚ** (floor velikosti mladé větve, ne 0) **+ (b) front-load** (strandEvery↓, příp. cap↑). Zralý strom (mnoho čtení) „jen zesiluje" správně; viditelné přibývání se pozná hlavně u NOVÉHO uživatele → testovat i s krátkým logem.
- [x] **✅ přebily pozdější modely (triáž 2026-10-12, CODE-tree):** větvičky nesou tažené runy (2026-09-28, krok 6), vedlejší větev = další živel v místě ramene (DECISIONS 2026-10-10 (38)), strop 25. Historie: **Větev elementu = dominantní runa + twigy = OSTATNÍ runy elementu** (KUKY 2026-08-02, směr). Dnes: různé runy elementu = SAMOSTATNÉ hlavní větve (n-tá větev = n-tá runa) + twigy BEZ významu (runí `sub` mrtvé, `subScale:0`). Chceme: **1 hlavní větev = dominantní runa + postranní twigy = 2./3./4. nejčastější runa toho elementu** (rozmanitost, twigy dostanou význam). Nutné: oživit mrtvou sub-větev logiku, přiřadit twigům runy, strop na počet twigů. Bonus: nová runa = nový viditelný twig = pomáhá retenci. „Vazba twigů na hlavní runu" = až síly-mezi-runami (later). ↔ **Gathering:** twig-vztahy = vizuální tvář stejných dat, co Gathering čte slovy (§7 „jedna detekce, dvě tváře"); síly zapečené DETERMINISTICKY do tvaru, NE živě (zámek 2026-07-30 to povoluje); plné vztahy až s pattern vrstvou (nestavět předčasně). Tímhle se strom vizuálně propojí s Gathering.
  - **Cílový strop = fázově 9 → 18 → 25 (KUKY 2026-08-03).** 9 = dominanty elementů · 18 = 2. runy elementů dozrají (twig → dominantní větev, „pokračování ve větvi") · 25 = každá **TAŽENÁ** runa dostane vlastní větev, seskupenou pod svým elementem (element = kostra/rodina, runy ji populují). ⚠️ **Jen tažené runy** — 25 je strop pro toho, kdo potáhl všech 25; jinak by měl každý identický 25-větvý strom (ztráta „strom = ty"). Nutná **hierarchie** (dominantní velké, dozrálé menší) + born-visible + tempo, ať to není chuchvalec. Fakt: kmen ~28 šlahounů (`strandMax`), dnes jen 9 → větev; cap srovnat na 25.
  - **2. dominant roste VEN z 1. dominantní větve** (KUKY 2026-08-03, oprava dřívějšího „vedle z kmene"): jeden **twig na hlavní větvi doroste na plnou dominantní sub-větev** (graduace twig→dominant). Doable — twig už na hlavní roste, jen mu zvednout velikost/prominenci, až je z něj druhá dominanta.
  - **Kroucení hlavních větví přes per-runa data** (KUKY 2026-08-03): dnes „čistý oblouk". Pipeline branch→crown FUNGUJE (crown načítá `runeTune`, `buildBranch` aplikuje per-runa curve/wob/tip). ALE **per-runa wobble+tip = plochý default 1** (liší se jen curve) → uniformní. Fix: **(a) rychlá** = odvodit default wob/tip z curve runy (organická variace hned ze stávajících dat); **(b) poctivá** = naautorovat každé runě vlastní wobble/tip (Berkana/Laguz vlnité, Isa/Tiwaz rovné). Pak dolaď per-runa v branch composeru. `gesto` na koruně = globální (ne to, co chce).
- [x] **✅ přebito (triáž 2026-10-12, CODE-tree):** seeking od 2026-10-09 do výšky nevstupuje — tvaruje konec větvičky a celou větev (DECISIONS 2026-10-09 (12), 2026-10-10 (44)); v aplikaci od portu. Historie: **Seeking jako třetí hlas výškové osy** (§3A). ⭐ **KUKY 2026-09-26 (směr):** seeking se vždy vztahuje k TÉ runě nebo spreadu, takže má ovlivňovat **jen tu runu / to čtení**, ne celý strom. **V LABU od 2026-10-02/03:** seeking je třetí hlas zóny čtení (záměr 0,5 · oblast 0,3 · seeking 0,2, `readZone`) a zóna rozhoduje, na které rameno (element × zóna) TO čtení jde — tedy jen to čtení, jak KUKY chtěl (`RUNAR_TREE.md` §5 KROK 4 + 5). Aplikace seeking ukládá a převod stromu (`readingsToTreeLog`) ho od 2026-10-03 předává; starý engine aplikace ho nepoužívá — přijde s portem. *(Do 2026-10-03 tu stálo „dnes výšku řídí jen intention“ — od kroku 4 neplatí.)*
- [x] **✅ hotovo (triáž 2026-10-12, CODE-tree):** inspekce „PROČ“ v labu od 2026-08-07 (`RUNAR_TREE.md` §8), od portu i v aplikaci pro admina; produkční vrstvu metadat dál nestavět bez `tree_state` DB. Historie: ~~„Proč" (síly) v LAB inspekci~~ (KUKY 2026-08-02) — klik na kmen/kořen/větev ukáže, proč má ten tvar (runa/element/ætt/počet + náklon/strana/výška). Levné, pro ladění. ⚠️ Produkční metadata vrstvu + výklad z nich NESTAVĚT dřív, než bude `tree_state` DB a než se výklad ověří na reálných stromech (pevná kostra = tautologie · riziko falešné hloubky). Detail + kritika → RUNAR_DECISIONS 2026-08-02.
- [ ] **Strom = jádro Rúnara / čtení v čase / potenciál samostatné appky** (KUKY 2026-08-02, vize). Přidaná hodnota = strom v čase (databáze osobnosti). ⚠️ Platí až s retencí + dost čteními (strom musí ohromit brzo); standalone = hypotéza, teď neřídí stavbu. Detail → RUNAR_DECISIONS 2026-08-02.
- [ ] **Čtení TVARU stromu = speciální výklady** (KUKY 2026-07-30, směr). `detectPatterns()` nad journalem čte výsledné rozložení, ne jen opakování run: **strana** (víc vpravo/vlevo → ven/dovnitř) · **výška** (vysoká koruna × hluboké kořeny → budoucnost × minulost) · **šířka** (pestrost × soustředění) · **náklon + holá místa** (nerovnováha, „od kmene" — RUNAR_TREE.md §1). Data už v journalu; chybí jen logika čtení. Vrstva Gathering (RUNAR_TREE.md §7), NE engine kreslení.
- [ ] **Prahy + okna pro `detectPatterns()`** (spec, dřív `runar-patterns.md`). Okno `PATTERN_WINDOW` {high 7, mid 14, low 30 dní}. **Korunní (Orel):** 3+ táž runa · 4+ týž element · stejná area 5+ · návrat runy po 6+ měs (HIGH) · protiklady (flood_fire / roots_in_wind) v týdnu (HIGH) · 3+ táž ætt · transformační pár. **Kořenové (Níðhöggr):** těžká runa 3+ v urð · 2+ těžké v jednom čtení · opakovaná urð area · stagnace 30/60/90 dní. **Ratatoskr** = korunní i kořenový vzorec naráz. Precedence: transformační pár > těžká kombinace. Jména `HEAVY_RUNES` / `TRANSFORMATION_PAIRS` = v `runar-config.js` (logika chybí). Vše „k otestování po 50 uživatelích", nefinální.
- [ ] **Katalog speciálních motivů** (dřív `RUNAR_TREE_SPECIALS.md`). ⭐ KUKY 2026-10-11: nestavět po jednom — strom drží data (Větev/Kořen jako celek), motivy se z nich poskládají (`RUNAR_TREE.md` §7, DECISIONS 2026-10-11 (18)). Vzácné, decentní, VEDLE základní struktury; kreslí je `growBranch` jako běžnou větev (engine-safe, odstranitelné). Recept: spouštěč (předpoklady se SEJDOU) → jemný motiv → umístění → volitelně Rúnarova věta. Nápady (k diskusi): Srdce (2+ Love) · Hnízdo (3+ Family) · Urðina studna (Healing v kořeni) · Práh (Crossroads + průlomový pár) · Řeřavý hrot / Kapka rosy / Jinovatka (dominance elementu) · Srůst (4× táž runa) · Můstek (spojenecký pár) · Trn (protiklady vedle sebe) · Návrat (runa chyběla 6+ měs) · Life Rune = nejsilnější větev z kmene. Blank duch-větev = ZRUŠENA (2026-07-21).
- [ ] **Síly mezi runami — jako VÝZNAM v journalu, ne pohyb větví** (dřív `runar-tree-forces.md`). Živé magnety mezi větvemi = teď mimo hru (rozhodnutí 2026-07-30, regrese; vratné novým datovaným záznamem). Vztahy (přitažlivost stejného elementu, napětí protikladů, transformační páry, World rezonance) zůstávají jako vrstva významu v journalu → Rúnar je může pojmenovat (§7). Pokud by se někdy „zapekly do tvaru", pak deterministicky (seed = hash(runa+index+stav)), NIKDY živě. ⚠️ **Kauzalita (KUKY 2026-08-03):** DATA (journal — runy, co-výskyt, páry) určují OBOJÍ — vizuální síly NA stromě i vzorce Gatheringu. **Gathering čte DATA, ne geometrii** (obrázek = ztrátový render; hledat vzorce v tvaru = číst lossy kopii). Náklon/směr (area→strana) = polohový signál, už na větvích ≠ síly (vztahy run). Síly = LATER (potřebují detectPatterns + DB; nestavět dřív).
- [ ] **(na později — nejdřív PROBRAT jestli má smysl) Zakládací vizuál: semínko v tmavé půdě → semenáček → strom.** Intro / founding stav stromu. Potřebuje asset. Dvě cesty: **(a)** CSS/SVG animace v intro-stavu = `[tune]` lane · **(b)** reálný tree engine ve founding stavu = `[tree]` lane. Rozhodnout nejdřív JESTLI to děláme, teprve pak JAK + kdo staví. (KUKY 2026-07-30: „na později, probrat.")

## Premium features / Fáze B (tap UI, Ask Rúnar)

> Pozn.: Coworkův handoff `RUNAR_SEGMENTACE_FaseB_CODE.md` (07-07) předpokládá `deeper_meaning` v JSON — ale MAIN ho zahodil 07-04 (viz „deeper_meaning re-add" výše). B1 highlight ho NEpotřebuje; B2 ano. **[spec NENÍ v repu — Coworkův výstup, nedodán přes CODE (§17)]**  <!-- doc-links:ok 2026-07-19 legacy: vzniklo před pravidlem, důvod nedoplněn -->

- [x] **Ask Rúnar — follow-up otázka** (Premium) — HOTOVO 2026-08-09. Generování + persistence + jedna otázka na čtení. Přístup má **jen premium a hlídá to server** (`claude-proxy`: `mode==="ask" && userTier!=="premium"` → 403), ne jen klient. ⚠️ Stav k 2026-08-09 — od 2026-09-25 Standard 1 Ask, Premium 2 (`ASKS_PER_READING` v `claude-proxy`); poznámka 2026-10-10. Ostatní přihlášení vidí **neaktivní teaser** (`ask_teaser`, EN+IS). Detail → RUNAR_DECISIONS 2026-08-09.

## AUDIT PRAVIDEL / DOCÍ — 2026-08-02 (Workflow: 5 úhlů → ověřeno proti repu)
# A (rozpory/stale) OPRAVENO v témže commitu. B + C sem zapsáno (§22), ať nespadne.
# C = provozní/SRE vrstva — OWNER chce před realizací každý bod podrobně vysvětlit.

### B — rozpory / duplikáty k rozhodnutí
- [ ] **Dvě otázky na Cowork k `memory/cowork-handoff-quality-bar.md` (2026-08-18, obsah = jejich lane).** (a) **Bod 12** („shrnutí + změněno: nic") říká totéž co `CLAUDE.md:435` *„Handoff má sekci `ZMĚNĚNO:`, i prázdnou"* — jedna informace na dvou místech (§20); má zůstat v obou, nebo odkázat? (b) **Bod 2** předepisuje ≥20–25 vzorků na tvrzení o vzorci a přiznat malé `n` nahlas; ten standard sám stojí na **dvou** handoffech. Doplnit tu větu o sobě? CODE do obsahu nesahá.
- [ ] **Tree-mechanika DESIGN.md ↔ TREE.md si odporuje** (DESIGN má „vážené hlasování" + pauza-bonus jako živé, TREE = zrušeno). Cowork lane: z DESIGN smazat mechaniku, odkázat na TREE §3–§5.
  - Konkrétní řádky (root-analýza 2026-08-02): **DESIGN:348** „Yggdrasil jednou ročně/slunovrat" = mrtvé (je **kdykoliv** — 5× opravováno) · **:276** „Norns→větev→kmen" vs „Norns=3 kořeny" jinde · **:9** header ukazuje na archivované tree-of-life/patterns · **:470** „směr větve dolů→kořeny" superseded Norns osou (§4) · **:484/508** vážené hlasování (kód má jen intention, BACKLOG výše).
- [ ] **Config hodnoty opsané do docí** (jména tierů: DESIGN, BACKLOG · 50/75: DESIGN, PRICING ~8× · Yggdrasil timing 4+ míst) — §20. Nahradit odkazem na config / DECISIONS.
- [ ] **Další §20 duplikáty:** IS pravidla verbatim v DESIGN · element/Shadow v TREE+DESIGN · kreditní hodnoty 2× v PRICING. Nechat u vlastníka + odkaz.
  - **Změřeno 2026-08-17** (`node scripts/verify_new_duplicates.js` — od té doby smoke ㉘). Pět tvrzení stojí v kánonu dvakrát; kontrola je vypisuje jako ℹ a neblokuje, aby se nezametla, ale samy nezmizí:
    `při sporu vyhrává PRODUKCE` CLAUDE.md+working-style · `skuld = záměr` TREE+working-style · `první dva, kdo práh překročil` BACKLOG+TREE · `druhá úplná kopie popisu Rúnara` BACKLOG+memory · `IS (ověřené…)` 2× uvnitř PRIVACY.
    U každého platí totéž: nechat u vlastníka dle rozcestníku, na druhém místě odkaz.
- [x] ✅ *(CODE-read 2026-10-13: mapa v `scripts/verify_nosice.js` (MAPA), smoke ㊁ padá na nové § bez nosiče, řádek pro zrušené § a nosič, který neexistuje nebo ho smoke nepouští; útoky v protipříkladech. Stav při zavedení: 32 §, 8 drží stroj celé, 15 jen zčásti (co nedrží, říká `castecne`), 2 nevynutitelné (§6, §21), 7 sloučených; výpis `node scripts/verify_nosice.js --vypis`.)* ~~**Mapa nosičů: ke každému pravidlu §1+ dopsat, která kontrola ho drží**~~ *(2026-10-11: dřív „§1–§28“ — §29–§32 by vypadly)* (2026-08-21). Doloženo dvakrát týž den: pravidlo o bumpu  i pravidlo o délce doců existovala jako próza a obě byla porušena — první pěti migracemi, druhé devíti docy přes limit. Pravidlo bez nosiče je přání. Nosič je jeden ze tří: kontrola ve smoke · odmítnutí v okamžiku činu · výjimka s datem, která vyprší. Co nedrží nic, označit jako **nevynutitelné + proč**, ať na to nikdo nespoléhá. ⚠️ Mapa patří do SKRIPTU, ne do  — ten se needituje kvůli tomuhle (KUKY 2026-08-21).
- [x] ✅ *(CODE-read 2026-10-14, owner „2. ano, udělej to“: všech pět hooků je v repu `hooks/claude/`, v `~/.claude` jen odkazy; DECISIONS 2026-10-14 (2).)* ~~**Celý mechanismus načtení po compactu žije MIMO git**~~ (2026-08-17): <!-- doc-links:ok 2026-08-17 tyhle tri soubory NEEXISTUJI v repu a je to PRESNE obsah teto polozky; odkaz musi zustat cteny, aby slo dohledat, o cem se rozhoduje --> `~/.claude/runar-context.py` (co se vlije do kontextu), `tree-guard.sh` (SessionStart + Stop blok), `compact-backup.py` (záloha přepisu). ~~Jediná pojistka jsou ruční `.bak*` kopie vedle nich. Zálohy se ztratí s diskem~~ ✅ *(od 2026-10-11 je noční šifrovaná kopie všech `~/.claude/*.py|*.sh|settings*.json` při změně — DECISIONS 2026-10-11 (21); hooků je dnes pět, přibyly runar-api-guard.py a runar-zprava-check.py; srovnáno CODE-read 2026-10-14)* a žádná session nepozná, že se soubor změnil pod rukama. Rozhodnout: verzovat v repu (je PUBLIC — obsahují jen cesty a naše pravidla, žádné klíče; ověřit před přesunem) + odkaz odsud, nebo vědomě nechat mimo a přijmout riziko.
- [x] **RUNAR_SEGMENTATION_SPEC.md** popisuje zrušenou featuru (deeper_meaning), není v indexu → ✅ archivováno 2026-10-10 (`docs/archive/`, s hlavičkou).
- [x] ✅ *(CODE-read 2026-10-14: bod 4 v `memory/MEMORY.md` — celý se nečte, hledá se `uz_vime.js` podle tématu; ten „živý index“ nahrazuje, takže druhý seznam rozhodnutí nevzniká — §20.)* ~~**Session Start Protocol** nařizuje číst celý RUNAR_DECISIONS.md (~2086 ř.) — nereálné.~~

### C — profi / SRE mezery (OWNER: vysvětlit podrobně před realizací)
- [ ] **Runtime testy peníze-kritických edge funkcí** (deno test: deduct až po úspěchu · hranice měsíčního stropu · idempotence · anonymous nedostane placené). Dnes 0 runtime testů, jen 24 statických.
- [ ] **CI brána** (GitHub Actions: smoke.py + deno test na push/PR do main). Dnes jediná brána = lokální hook (jde obejít --no-verify).
- [ ] **Zálohy / DR** pro Supabase DB (peníze + PII): ověřit PITR, runbook kadence + restore, jednou nasucho vyzkoušet.
  ✅ **Archiv ověřen 2026-10-15** (CODE-read, owner *„6. over ji“*): `runar-db-2026-10-15.7z` jde rozšifrovat, všech 17 tabulek public +
  auth.users čitelných; počty proti živému count(*) sedí (rozdíly jen kladné, 1–3 řádky přibylé po 06:57). Schéma nese sloupce, politiky,
  funkce, triggery, cizí klíče, granty, indexy, rozšíření, buckety. Archivy chybí za 12.–14. 10. (padala kontrola v zálohovacím skriptu,
  opraveno 9804afe). **Neověřeno: obnova** — neexistuje skript, který by z JSON + schématu databázi postavil, a není kam obnovit
  (Postgres ani Docker na počítači). auth.users nese jen id, e-mail, časy, app metadata — jestli jde účet obnovit se stejným id, neověřeno.
  ⚠️ **Stav 2026-10-10 (CODE-read, `supabase backups list`): žádná záloha neexistuje** — `backups: []`, `pitr_enabled: false`.
  Deníky, kredity, profily i hlášení nemají kopii; `scripts/utils/zaloha_cteni.js` zálohuje jen čtení z pokusů, ne produkci.
  Volba (owner): placený tarif Supabase s denními zálohami (cena podle ceníku Supabase), nebo vlastní pravidelný `supabase db dump`
  do soukromého úložiště mimo repo (nese osobní údaje → šifrovat). → i `RUNAR_BACKLOG.md` „Kontrola architektury“, bod 16.
  ✅ **Ruční záloha 2026-10-10** (owner „ano, udělej“): všech 15 tabulek public + `auth.users` (id, e-mail, časy) jako JSON, schéma
  (sloupce, politiky, funkce, triggery, cizí klíče, granty) a 53 souborů statického audia — u ownera mimo repo (`runar-eval/zaloha-db/`).
  `supabase db dump` nejde (chce Docker) → export přes `supabase db query`. Je to JEDNA kopie, ne záloha průběžná; bod zůstává otevřený.
  ✅ **Od 2026-10-10 automaticky** (DECISIONS 2026-10-10 (9)): denně 3:30 šifrovaná záloha → lokálně + Google Drive runar@therunekeeper.com
  (`scripts/utils/zaloha_db.js`, úloha Windows „Runar - zaloha databaze“). Zbývá: Supabase Pro před produkcí, obnova do DB nanečisto.
- [x] ✅ *(běží od 2026-10-14 — DECISIONS 2026-10-14 (14), (16); upozornění na pád zálohy ověřeno naostro 2026-10-15)* ~~**CODE-tune — hlídání provozu a denní souhrn e-mailem (před spuštěním; owner 2026-10-14, DECISIONS 2026-10-14 (12))**~~.
  ▶ *(CODE-tune 2026-10-14, owner „ano, pg_cron + Brevo … ano udělej“: postaveno — edge funkce `ops-watch`, DECISIONS 2026-10-14 (13);
  běží — SQL pustil owner, zkušební souhrn došel se štítkem Ops (filtr ve schránce funguje), „Needs you“ jen u nepřečtených hlášení
  (DECISIONS 2026-10-14 (16)). První ostrý souhrn (2026-10-15) hned chytil zálohu DB, která od 10-12 každou noc padala — opraveno,
  DECISIONS 2026-10-15 (1). Zbývá: prahy přepočítat po 14 dnech provozu; platby, až budou.)*
  Owner: *„udělat CODE-tune. dobře to v e-mailu uspořádá. kam to přijde a bude to přehledné. udělat nejlepší cestu.“* Místo Slacku (zrušen týž den —
  hlásil jen „přišlo hlášení“) dvě věci, obě do schránky `runar@therunekeeper.com`:
  1. **Okamžité upozornění, když se něco kazí:** model čtení padá víc než obvykle (chyby `claude-proxy` / pády na zálohu), hlas narazí na brzdu
     kreditů ElevenLabs, noční záloha DB selže, po spuštění selže platba. Jen skutečné problémy — žádný šum, ať se upozornění nepřestane číst.
  2. **Denní souhrn (jednou ráno):** čtení a hlasy za den, co stály, nová hlášení (počet + typ, bez textu), stav kreditů a brzdy, výsledek zálohy.
  Přehledně: předmět řekne stav jedním slovem (vše v pořádku / pozor / problém), nahoře co vyžaduje ownera, pod tím čísla. EN (§31 — admini).
  Zvážit, odkud (edge funkce + plánovač Supabase, nebo noční úloha vedle zálohy DB) a čím posílat (Brevo už máme). Napřed návrh ownerovi.
  Do 2026-10-14 tu stálo: „Monitoring / alerting (error rate + fail-open události → Slack/Sentry). Dnes jen pull logy.“
- [ ] **Staging / preview** prostředí pro migrace + edge fn (dnes vše proti prod DB).
- [ ] **Deploy / rollback runbook** pro edge funkce (živý stav je mimo git, neviditelný).
- [ ] **Review brána** na citlivé cesty (supabase/functions, sql, auth) — jinak jdou peníze/bezpečnost/migrace zlive bez druhého páru očí.
- [ ] **`deno.lock` + Dependabot pro edge funkce** — přesné verze importů už hlídá smoke (`verify_edge_imports.js`, 2026-10-11);
  chybí zámek závislostí a automatické upozornění na nové verze.
- [ ] **SECURITY.md / inventář tajemství** (kde bydlí, rotace, incident při leaku).
- [ ] **Proxy Fáze 2 — zbývající díry z auditu 2026-08-02** (visitor už zavřen; tyhle jsou pro PŘIHLÁŠENÉ): **#2b** hlas na zaplacené čtení — ✅ *(CODE-tune 2026-10-11, DECISIONS 2026-10-11 (61): očištěný návrat — hlas k `reading_id` / podpisu neuloženého čtení, všechny cesty zmapované a proklikané v prohlížeči, smoke ㊸ ㊹)* ⚠️ POKUS 2026-08-03 **VRÁCEN** (voice gate rozbil hlas u tree/life-rune čtení — ta nenastavují `_lastReadingId`; proxy zpět na Fázi 1, klient zpět na `{text,lang}`). `readings`→SELECT-only ZŮSTALO (samostatný reálný fix). Znovu JEN po zmapování VŠECH voice cest (reader · tree/life-rune · someone) + reálném E2E testu na živém toku · **#3** `mode=life_rune` gate čte sloupec, který server nikdy nezapíše → replay = free Opus; zrcadlit founding CAS · **#4** ⚠️ POKUS 2026-08-03 (server oceňuje podle slugu) **VRÁCEN** — cena/metering NEJDE postavit na klientem deklarovaných metadatech (`spread_cost`/slug), dokud prompt staví KLIENT a server ho nekontroluje (server nezná pravý spread). Spoof se jen přesunul číslo→slug + přidal regresi (nový RS s `free_balance` → 402 na spread). Skutečný fix = server staví prompt ze strukturovaných vstupů (runy+typ) nebo metering na server-vlastněném signálu → architektonické, owner (§21). Report: `tasks/wqxu3uuar.output` · **#6/#7** `tree-update` věří `credits_used` + `short_text/deep_text` od klienta (neměřené Haiku) → odvodit ze saved readings row.
- [ ] **#2b navazující flagy** (2026-08-03): ✅ *(první flag — čtení pro někoho jiného bez hlasu — vyřešen 2026-10-11 podpisem z claude-proxy, DECISIONS 2026-10-11 (61))* „someone" čtení se neukládá → nemá `reading_id` → hlas zablokován (rozhodnout: přijmout, nebo claude-proxy vytvoří voice-gate řádek) · premium „question gate" (THE SITUATION) je jen KLIENTSKY — server otázku od nižšího tieru neodmítne (ne money-díra, jen produktová brána) · až bude tester tier: voice gate musí navíc kontrolovat `is_tester`+redeem (dnes hlas na každé zaplacené čtení = OK pro současné tiery).
- [ ] **Proxy defense-in-depth** (audit 2026-08-02, ne urgentní): bound fail-open větve (monthly cap `:530`, ritual precheck `:508`) · legitAsk concurrency race (1 extra free ask) · ~~ověřit tělo `check_rate_limit` RPC (audit nečetl)~~ ✅ ověřeno 2026-10-09 (kontrola architektury, živá definice): pevné okno,
atomický upsert, úklid starších než hodina; stejně tak `use_credit` (atomické odečtení jen při zůstatku > 0, jinak −1),
`use_free_balance` (CAS), `bump_month_units` (atomické) — sedí s komentáři v `claude-proxy` · client visitor gate → „registruj se" CTA místo volání proxy.

---

## AUDIT RESTŮ — 2026-07-14 (Workflow: 5 zdrojů → ověřeno proti repu + git logu)
# Zdroje: MEMORY TODO · RUNAR_DECISIONS reality-notes · privacy/backlog/tree docs · TODO v kódu · Cowork eval handoffy.
# Handoffy vytěžené sem → přesunuty do Cowork `archive/`. Zůstává: RUNE_IMAGE_POOLS_draft (vstup pro pool),
# RUNAR_SEGMENTACE_FaseB_CODE, RUNAR_IS_GRAMMAR_CHECK_CODE.

### 🔴 Blockery prodeje — OWNER (odloženo, trigger = **6. 9. 2026**, scheduled task `runar-launch-blockers-reminder`)
- [x] ✖ *(owner 2026-10-12: „na agndofa.is Rúnar sídlit nebude, bude na therunekeeper.com“ — zásady Rúnara jsou stránka appky `v2/runar-privacy.html` (od 2026-10-12 s OpenAI, Brevo, Google, GitHub); veřejný web na ni odkáže, CODE-web, DECISIONS 2026-10-12 (6).)* ~~**Publikovat privacy policy na agndofa.is**~~ — OWNER krok mimo repo. (Wiring v appce je HOTOVY: `v2/runar-privacy.html` je vysazena produkcni stranka EN+IS a odkaz z appky vede. Overeno 2026-07-19.) Bez publikace neplati legitimate-interest model.
  ➕ *(2026-10-12, z položky GPT-6 sol)* zásady na agndofa.is doplnit o OpenAI (čte od 2026-10-09) stejně jako appkovou
  `v2/runar-privacy.html`; znění v `RUNAR_PRIVACY.md`, publikuje owner.
- [ ] **Právní/DPO review** (Island/EEA) IS textů + legal-basis modelu. `RUNAR_PRIVACY.md` je pracovní podklad, ne posudek.
      ➕ **2026-10-12:** owner „udělej ten posudek“ → technická kontrola GDPR hotová (`docs/archive/2026-10-12-gdpr-kontrola.md`, není to právní posudek);
      úkoly z ní v sekci „Soukromí — kontrola GDPR 2026-10-12“. Právník zůstává volitelný — podklad pro něj je ta kontrola.
      ⚠️ **Na seznam k posouzeni patri i `credit_ledger`:** radky prezivaji smazani uctu. Muj zaver „je to v poradku, protoze klic je znicen" je TECHNICKY ROZBOR (delete-account nuluje `gift_codes.used_by` a kaskadou maze `user_profiles` i `readings`, takze UUID uz nejde spojit s osobou), NE pravni posudek.
- [ ] **Shopify webhook + checkout** — owner: webhook v Shopify admin + secret + mapa produkt→tier. ➕ *Owner 2026-10-12: „dodělame. potřebuju to pak mít všechno souhrnně“* → až přijde na řadu, připravit ownerovi JEDEN souhrnný postup (všechny kroky v jeho účtech v pořadí), ne po kouskách. CODE: edge fce (HMAC verify → `user_profiles.tier`) + odpojit „coming soon" stuby (`runar-auth.js:317-323`, `runar-app.js:1207-1208`, `runar-help.html:180`). Platby na webu (EEA/DMA).
      ⚠️ **SPOUSTEC pro GDPR prezkum:** objednavka nese e-mail I `user_id`, cimz OBNOVI mapovani UUID -> osoba. Zaver „radky v `credit_ledger` smi prezit smazani uctu" (RUNAR_PRIVACY.md, 2026-07-19) stoji prave na tom, ze po smazani uctu zadne mapovani nezbyde. Az bude Shopify, musi se ten zaver prezkoumat ZNOVU.

### 🟠 CODE — odblokované, v pořadí
- [~] **Evidence pohybu kreditu (ledger)** — POLOŽKA BYLA ZASTARALÁ: ledger EXISTUJE od 2026-07-19 (trigger na user_profiles, append-only; odhaleno 22. 8., když ownerův běh mého duplikátního SQL narazil na existující tabulku — 29 řádků od 4. 8.). Zbývá FÁZE 2 = atribuce: `sql/2026-08-22_ledger_faze2_attribution.sql` (čeká na spuštění ownerem) + proxy posílá p_reason/p_ref (hotovo, deploy AŽ PO SQL). Pak ověřit: čtení za kredit → řádek s reason=reading a ref=id čtení. Původně: dnes NEEXISTUJE, takze na otazku "strhl se mi kredit?" nejde odpovedet ani u vlastniho uctu; `credits_balance` ukazuje jen aktualni stav, ne historii. Narazil na to owner 2026-07-19 pri prvnim zdarma cteni zivotni runy. Resi ZAROVEN starsi ownerovo zadani (2026-07-16): "musi byt za pouziti kodu, ten kod by se mel nekde zapsat. neni kod neni kredit. nikdy to nebude vic nez prodavame." **Podminka: zapis do evidence musi byt ATOMICKY se zmenou zustatku** — evidence, ktera muze chybet, lze, a lziva evidence je horsi nez zadna, protoze se podle ni rozhoduje.
- [ ] **Obohatit řádek: pořadí tažených run + char_count** — ALTER už NEPOTŘEBUJE (2026-08-10). Řádek `readings` má sloupec `prompt_draws jsonb`, do kterého se dá přidat cokoli bez migrace; dnes v něm jede úhel, obraz, klíčová slova, tvar konce a umístění jména. Pořadí run je navíc jediné, co ještě chybí — model může sloty přeskládat, takže se musí ukládat strukturovaně.
- [ ] **Readings viewer: flag/annotate** — dnes view-only (`initReadingsTab` = prázdný stub). Potřebuje review tabulku (owner ALTER).
- [x] *(CODE-tune 2026-10-10, DECISIONS 2026-10-10 (39): Málstaður veřejné API nemá — jen editor (zdarma 400 znaků) a předplatné;
  ⚠️ NEPLATÍ (ověřeno 2026-10-14, DECISIONS 2026-10-14 (10)): API má tarif „Frjáls áskrift“, 2 990 kr na uživatele a měsíc + oprava
  1 kr za 100 znaků;
  náhrada `is-gpt-check.py` (GPT, KUKY „GPT dělá dobrou IS“), obhájený samotestem; `is-grammar-qa.py` hned odkáže na náhradu.)*
  **⚠️ `is-grammar-qa.py` je mrtvý: API Yfirlestur přestěhované** (2026-10-10, CODE-tune, §22). `https://yfirlestur.is/correct.api`
  vrací **301 → `https://malstadur.mideind.is/malfridur`** (webová aplikace Málstaður od Miðeind, Cloudflare), takže skript místo JSON
  dostane HTML a hlásí 46 z 46 „NEZKONTROLOVÁNO“ (to dělá správně — §19.2, žádné tiché zelené). `is-vazba.py` (nútímamálsorðabók
  + Risamálheild) funguje dál. Zjistit: má Málstaður API, za jakých podmínek (klíč, cena, zpracování dat), a podle toho skript
  přepsat, nebo kontrolu gramatiky nahradit. Owner se na totéž 2026-10-10 ptal Cowork-read („zjisti, proč není API IS dostupné“) —
  napřed srovnat s jejím zjištěním, ať se to nedělá dvakrát.

### 🟡 OWNER rozhodnutí
- [ ] **Retence čtení** — nerozhodnuto. Návrh: po dobu účtu; při zrušení smazat/anonymizovat pro eval. Blokuje konkrétní číslo v policy.
- [ ] **Living tree: sundat admin gate** (`renderLivingTree()` v `runar-tree.js`) — až uznáš betu za hotovou.

### 🔵 COWORK
- [ ] Tree DB fáze 2 — přeškálovat: `intention` + `aol` už logujeme server-side (481d313, 094f287).

### 🟢 Dlouhý ocas (kód, nízká priorita)
- [ ] **§18 debt:** lab i prod drží kompozici stromu 2× (`build_tree_production.py`) → vytáhnout `runar-tree-core.js`. Prod navíc načítá enginy z `tree-lab-*` cest. *(soubor zatím neexistuje — je to cíl toho refaktoru)*  <!-- doc-links:ok 2026-07-19 legacy: vzniklo před pravidlem, důvod nedoplněn -->
- [x] ~~Strom se **neaktualizuje po čtení** (`renderLivingTree` jen při otevření tabu).~~ **Není vada — KUKY 2026-09-26**; pravidlo vlastní `RUNAR_TREE.md` §8 („Strom se nemusí překreslit hned po čtení“), přesunuto tam 2026-10-11.
- [x] ✅ *(owner 2026-10-14 „smaž to“, DECISIONS 2026-10-14 (6): stará `tree_state` + `tree-update` + Vrstvy A/B/C v proxy smazány; DB = SQL ownera `sql/2026-10-14_drop_tree_state.sql`.)* ~~`tree_state`/`tree_readings` — `sql/tree_state.sql` je STARÉ schéma (Vrstva A) pro tree-update; produkční strom čte z `readings` → rozhodnout: rozšířit / nahradit / zahodit.~~
  ⚠️ Než z `tree_state` začne cokoli číst server: politika UPDATE pro vlastníka nemá omezené sloupce — zúžit jako `user_profiles` (granty
  sloupců, smoke ⑩); nález CODE-read 2026-10-11 (položka „Pro CODE-tree“ (a)).
- [ ] **Před spuštěním: viditelnost + sklad dobrých vět** (KUKY 2026-09-29 bod 6: *„některá čtení jsou fakt dobrá, popřípadě vyjde dobrý
  závěr, a to chci ukládat tak, abychom měli materiál na vizuální tvorbu“*; report 10:13: *„Jak se maximálně zviditelnit ve vyhledávačích a
  taky při AI vyhledávání… Tohle je práce před spuštěním.“*). (a) SEO + AI vyhledávání (popisky run, tvar run v kolekci, statické texty jako
  obsah). (b) ✅ Ukládání vybraných čtení/vět pro vizuály — HOTOVO 2026-09-30: „✦ Keep this“ v reportéru (text + id čtení),
  DECISIONS 2026-09-30 (4); výpis = SQL v hlavičce `sql/2026-09-30_bug_reports_keep_a_limity.sql`.
- [ ] Export dat subjektu (mazání už kaskáduje přes delete-account).
- [ ] Eval pipeline: pseudonymizace (opt-out exkluze HOTOVÁ).
- [~] **Segmentace Faze B — zbytek** — B1 (tap -> segment zezlatne) HOTOVO a v produkci. B2 (deeper_meaning) ZRUSENO ownerem 2026-07-10. NEHOTOVO a nikde jinde nedrzene: „tap odhali VYZNAM POZICE" (popup dnes ukazuje jen jmeno runy + keywords, zadny nazev pozice ze SPREAD_CONFIG) a „geometrie per spread". Zadne datovane rozhodnuti to nerusi -> nemazat bez rozhodnuti ownera.
- [x] ~~Journal SPREAD historie renderuje font glyfy~~ **✅ deník opraven 2026-09-27 (kameny z runeSvg, smoke ㉭); ✅ shrine 2026-10-11 (CODE-tune, owner „jeď ty tři chyby“): záložka a karta dárkových kódů, popisky učení a hlasu, mřížka run, vybraná runa i prohlížeč čtení kreslí naši runu (`runeSvg` / `setRuneText`); smoke ㉻ hlídá i shrine, jeho skripty, runu z DB a zrcadlo `.lbl-rune`.** ~~Zbývá: shrine obchází `runeSvg`~~ (§5; Yggdrasil stránka archivována 2026-09-28).
- [ ] **Statické čtení Dagaz (Kolekce, s hlasem) odporuje ownerovu popisu run** — EN *„This is not gradual change — this is the breakthrough"*, IS *„umbreytir öllu í einu andartaki"*, kdežto `RUNAR_POPISY_RUN.md` říká, že se nic nestalo jedním velkým pohybem. Nový text runy pod ním (2026-09-24) drží popis, takže si teď na jedné obrazovce odporují. Přegenerovat statické čtení Dagaz (tabulka `runar_static_audio`, EL hlas) — rozhoduje owner. Nalezl kritik textů do Kolekce 2026-09-24. (CODE-tune)
  - **Owner 2026-09-24:** „nový Dagaz zní dobře, ale statická čtení zatím měnit nebudeme — necháme to na později.“ Schválené znění (ověřené is-grammar-qa + korpusem):
    EN: *Dagaz lives at the border between night and day. It rarely comes as a blaze. More often the same thing simply turns, and you see it from its other side. Then the world no longer looks quite as it did. Perhaps there is no new door to look for. Perhaps you already stand on its threshold.*
    IS: *Dagaz býr á mörkunum milli nætur og dags. Hún kemur sjaldnast eins og leiftur. Oftar snýst sami hluturinn einfaldlega við, og þú sérð hann frá hinni hliðinni. Heimurinn lítur þá ekki lengur alveg eins út og áður. Kannski þarf ekki að leita að nýjum dyrum. Kannski stendur þú nú þegar á þröskuldinum.*
- [ ] sigil cut-out export · smoke shorthand-check (chybí blocklist). *(2026-10-12: A/B/C a Fáze 4 z téhož řádku jsou v archivu odložených — prompt hotový.)*
Runa — klíče; inline větev _spreadBlock odstraněna, golden = jen 4 kříž buildery). Původně: (`label: Runa\nklíčová slova` vs `label\nRuna — klíčová slova`). Vzniklo při unifikaci builderu (`70cc33c`), nikde není zdůvodněno. Dedup na `_spreadBlock` (character.js) rozdíl DRŽÍ přes parametr `inlineLabel`, aby refaktor nezměnil prompt (§18.3). Sjednotit = změna promptu → vlastní tag + eval, ne tichý tune.
- [x] ✅ **HOTOVO 2026-10-11 (CODE-tree): `scripts/utils/commit_vlastni.py`** — zápis přes `zapis()`, commit jen vlastních kusů z dočasného
  indexu (trojcestný `git merge-file` proti HEAD); cizí necommitnuté zůstanou ve stromě, nic se nevrací ani nepřepisuje; postup v memory
  `parallel-code-sessions-collision`. Metoda navržená níž (`git checkout HEAD -- <soubor>` + `git apply -3`) sahá do cizího pracovního stavu
  — nepoužita. Původně: **Do `memory/parallel-code-sessions-collision.md` doplnit BEZPEČNOU metodu na sdílený append-only soubor** — 2026-08-09 jsem si vyrobil pomocný skript, který `RUNAR_DECISIONS.md` krájel podle **délky HEAD** (`content[len(head):]`), aby oddělil cizí necommitnutou práci. To platí jen dokud se HEAD nezmění; jiná session mezitím commitla a řez padl doprostřed věty — sigil session přišla o hlavičku a první odrážky svého záznamu (obnoveno z výpisu, 0 ztrát). Správně: `git diff <soubor> > cizi.patch` → `git checkout HEAD -- <soubor>` → připojit své → commit → `git apply -3 cizi.patch`. Zapsat, až soubor nebude rozeditovaný jinou session (dnes je — proto sem, ne rovnou tam).
- ✅ *(CODE-tune 2026-10-12: loader pryč, důvod v komentáři na jeho místě; shrine si postavu čte dál sám)* ~~**Smazat mrtvý loader charakteru**~~ `runar-app.js:1380` — reader načítá `runar_character` (active=true), i když je editor (shrine Rúnar lab) dávno mrtvý. Ověřeno 2026-08-07: v tabulce **0 aktivních řádků**, takže file `DEF_CHAR` jede a nic to teď nekazí — ale řádek, který by se tam objevil, by potichu přebil celý charakter.
- [~] **IS tvary, které dozrají samy (KUKY 2026-08-09: „netlačit na sílu") — `hlénu`→`hléinu`** — nalezeno v IS dávce 2026-08-09 (`Hvað í þér heldur enn fast í hlénu?`). Slovník uvádí vlastní kolokaci `í hléinu` (hlé = hk), takže `hlénu` je skutečná chyba, ne false-pos. Nevkládat teď: obojí se potvrdí (nebo vyvrátí) samo, až na tvar narazíme v dalším čtení. Sbírat, ne honit.
- [~] **IS: `kvíslir` → pravděpodobně `kvíslar`** (tentýž režim — potvrdit, až se objeví znovu) (`jökuláin greinist í kvíslir yfir sandinn`, reálné čtení). `kvísl` je kvk (ověřeno), ale **množné číslo žádný náš nástroj nepotvrdí** — slovník má jen hesla, GreynirCorrect u IS dělá falešné poplachy. Nevymýšlet; potvrdit u Coworku/rodilého mluvčího, pak teprve korekce.

### IS/EN parita zákazů: `DEF_CHAR_IS.never` má o řádek míň (2026-08-14)
`DEF_CHAR_EN.never` zakazuje `embrace` a `empower`, islandská verze ten řádek nemá (7 vs 8).
Není to překlad: `valdefla` **není heslo** v Íslensk nútímamálsorðabók a `faðma` znamená
doslovné obejmutí, ne wellness klišé. **Které islandské klišé Rúnar neříká, je obsahové
rozhodnutí** (Cowork / owner), ne věc CODE — proto nedoplněno, viz `RUNAR_DECISIONS.md`
2026-08-14 (invarianty). Dokud to nikdo nerozhodne, islandský Rúnar má o jeden zákaz míň.

**Doplněno 2026-08-17 — není to o jeden řádek, je to o devět.** Výše popsaná mezera je v bloku
`never`. Druhá, větší, je v bloku **LANGUAGE & STYLE / ÍSLENSK MÁLFRÆÐI**: anglická verze tam
vyjmenovává **devět konkrétních frází** („your truth", „the universe", „trust the process" …),
islandská **žádnou** — má jen obecné „klisju velferðarfræði". Změřeno tím, co zákazy z promptu
vytahuje: `node scripts/utils/lint_readings.js <davka>` hlásí **EN 11 · IS 2**.
Rozhodnout to jde dvěma cestami a obě potřebují někoho jiného než CODE:
(a) islandský seznam od rodilého mluvčího — **vymýšlet ho nesmím** (§23), nebo
(b) obrácená páka (§25): pustit EN dávku BEZ toho seznamu. Nepřibudou-li klišé, je zbytečný
i v angličtině a mezera zaniká sama. To je levnější a nikoho to nečeká.

## Nálezy z workflow — k triáži

### Haiku 5.5 (vyšel 2026-10-07) — kde by šel použít; srovnání s lunou čeká na ownerovo ano (hlášení b4365ead) (CODE-tune)
Owner: *„Zjisti všechno o Haiku 5.5… Nabízí se nám nějaké možnosti, jak tyhle levné modely používat? Jak by se dal porovnat s Luna 6?“*
Ceník Anthropicu (platform.claude.com/docs/en/about-claude/pricing, ověřeno 2026-10-09): cenou stejný jako gpt-6-luna, desetina Haiku 4.5;
prompt nad 100 000 tokenů je dražší (u nás nikdy). Haiku 4.5 byla v repu jen v edge fn `tree-update` (smazána 2026-10-14).
Kandidáti: rozbor čtení (dnes luna, `gpt-review`) · třídění hlášení testerů · ~~`tree-update`~~ (smazán 2026-10-14). Čtení a Ask ne:
model je proti hlasu malá část ceny a islandština malého modelu neověřená. **Další krok jen s ownerovým ano (§30):** Haiku 5.5 × luna
na rozboru týchž čtení (lunin rozbor je uložený v `gpt_reviews`), malý vzorek, texty vedle sebe pro ownera.
**2026-10-09 ZMĚŘENO** (owner *„13. ano porovnej“*, EVAL_LOG 2026-10-09 (2)): na 5 čteních Haiku 5.5 s přemýšlením 1 platný nález
a 0 neplatných, luna 0 platných a 7 neplatných, Haiku bez přemýšlení horší než luna. Haiku ~5× dráž než luna (pořád < 0,1 c za rozbor)
a 2 z 10 rozborů s ruským slovem v češtině. `tree-update` přepnut na Haiku 5.5 bez přemýšlení (owner *„předělat haiku 4.5 na 5.5“*).
✅ **Rozhodnuto 2026-10-09 (KUKY):** rozbor čtení *„zrušit úplně“* (luna se nepoužívá, Haiku místo ní nebude) — tlačítko i edge fn
`gpt-review` pryč, DECISIONS 2026-10-09 (8). Třídění hlášení modelem *„ok, neřešit“*. ~~Zůstává: `tree-update` na Haiku 5.5.~~ (funkce smazána 2026-10-14)

### ✅ `rk()` / `rn()` čtou GLOBÁLNÍ `lang`, ne parametr (2026-08-15)
✅ *(CODE-tune 2026-10-12: rk/rn/rnPrompt/rnPromptAcc/rworld berou jazyk 2. parametrem, buildery ho předávají — i spready přes
`_spreadBlock`/`_kwBrief`, kde past opravdu sklapla: s opačným globálem mělo 16 ze 40 otisků golden smíchané jazyky. Teď 0 ze 40,
otisky s globálem = parametrem beze změny. Hlídá smoke ㊀ `verify_jazyk_parametr.js`, útoky v protipříkladech.)*
`v2/runar-utils.js:411` a `:414`: `function rk(r){ return lang === 'is' ? r.k_is : r.k; }`.
Buildery přitom `lang` berou jako **parametr** (`buildReadingPrompt(u, drawn, lang, corrections)`).
V produkci to vychází, protože `runar-reading.js:99` předává tutéž globální proměnnou — ale je to
tichá past: kdokoli zavolá builder s jiným jazykem, než je globál, dostane **smíchané jazyky**
(anglická klíčová slova run v islandském čtení) a nic to nenahlásí. Narazil na to `find_seeds.js`
(spadlo `ReferenceError: lang is not defined`, protože v sandboxu globál nebyl).
**Co udělat:** dát `rk`/`rn` druhý parametr `lang` s fallbackem na globál a projít volající (§13).
**Pozor:** je to sdílené `runar-utils.js` — čte i shrine (§3).

### Plán infrastruktury před spuštěním — ověřeno 2026-10-15 (CODE-read; nahradil „Kam s databází, promptem a hostingem“ z 2026-10-10)
Owner 2026-10-15: *„napřed je potřeba udělat pořádný plán krok po kroku. Všechno mít přesně prověřené, že to je takhle nejlepší
řešení! pořádně to zapsat, jelikož to nechci pořád řešit od začátku“* · *„budu rád, pokud budeme mít desítky uživatelů, takže spíš
levné, ale kvalitní řešení, které se může rozšířit, když porosteme.“* **Rozhodnuto 2026-10-15** (owner *„9. beru“*, DECISIONS 2026-10-15 (2)): doporučená cesta níž. Dnes se neprodává
(owner: *„zatím nejedeme komerčně a ani nic neprodáváme, ale před spuštěním chci mít připravený přesný plán postupu“*). Kritéria (owner
2026-10-12): HTTPS, bezpečnostní hlavičky (CSP, frame-ancestors), ochrana proti převzetí domény, ven jen web + appka, nasazení z gitu
s návratem, pošta (MX Google, DKIM Brevo) beze změny, cena. Adresy: web therunekeeper.com, appka app.therunekeeper.com (owner 2026-10-12).
Do 2026-10-15 tu stály podklady z 2026-10-10 a Cloudflare Pages jen „z obecné znalosti“ (konverzace 2026-10-12) — níž je to ověřené.

**Fakta, která rozhodují** (oficiální stránky čtené 2026-10-15, URL dole):
1. **GitHub Pages zakazuje komerční SaaS** („not … allowed to be used as a free web hosting service to run your online business …
   or providing commercial software as a service“, GitHub Terms for Additional Products, oddíl Pages — ověřeno přímo). Až appka začne
   prodávat (kredity), tam být nesmí → **přesun před spuštěním je nutný**; dnes se neprodává (owner 2026-10-15). Pages navíc neumí vlastní hlavičky (CSP) a ze soukromého repa
   jen s placeným plánem.
2. **Vercel Hobby** komerční použití zakazuje (Pro 20 $/měs.); **Netlify Free** má tvrdý strop 300 kreditů/měs. bez dobití.
3. **Cloudflare Pages Free:** soukromé repo ano · `_headers` (CSP, frame-ancestors, HSTS; max 100 pravidel; na Pages Functions neplatí)
   · dva projekty z jednoho repa (Root directory `v2/` a `web/site`, watch paths; max 5 na repo) · 500 buildů/měs. · statické
   požadavky „free and unlimited“ · zákaz komerčního použití nenalezen.
4. **Apex therunekeeper.com na Cloudflare Pages = DNS zóna u Cloudflare** (přepnout nameservery z GoDaddy; registrace může zůstat).
   `app.` přes CNAME přesun nepotřebuje. Přesun: Cloudflare import „may miss some records“ → export všeho předem; DNSSEC vypnout
   u registrátora PŘED přepnutím; poštovní záznamy „DNS only“; až 24 h.
5. **Supabase Free** se po 7 dnech nečinnosti uspí a nemá zálohy → před spuštěním **Pro** (25 $/měs. vč. výkonu Micro): denní
   fyzické zálohy 7 dní, „Restore to a New Project“, 8 GB DB, 2 mil. volání edge funkcí. PITR (obnova k okamžiku) ~+105 $/měs.,
   na začátku netřeba. Vlastní doména pro přihlášení +10 $/měs. — kosmetika, jde přidat kdykoli.
6. **Edge funkce Supabase:** 2 s CPU, 256 MB, balík 20 MB → skládání promptu (~120 KB dat) se vejde (odvozeno z limitů, neměřeno).
7. **Hetzner** (owner 2026-10-10: *„Hetzner — vlastní server pro prompt a databázi. Hledali jsme nejlepší a nejlevnější řešení“*):
   ceník docs.hetzner.com 2026-10-10 CX23 5,49 €, CX33 8,49 € měsíčně; 2026-10-15 na hetzner.com obojí „currently unavailable“.
   Znamená postavit znovu backend (přihlášení Google + kód + hook uzavřeného testu, RLS, 10 edge funkcí, úložiště) nebo vlastní Supabase
   v Dockeru, a provoz (OS, TLS, zálohy, DDoS) na nás; úspora proti Supabase Pro ~15 € měsíčně — pro desítky uživatelů nepoměr (úsudek).
8. ⚠️ **Supabase ruší staré klíče `anon` a `service_role` do konce roku 2026** (docs „API keys“, ověřeno přímo) → přechod na
   `sb_publishable_` / `sb_secret_` (appka, edge funkce, skripty; edge funkce pak autorizují klíč v kódu, ne `verify_jwt`).

9. **Víc postav (charakterů):** jakmile se prompt skládá na serveru, postava může být data v DB (tabulka `runar_character` existuje,
   je prázdná) — nová postava bez nového kódu appky. Na hostingu nezávisí.

**Doporučená cesta (návrh CODE-read):** Cloudflare Pages Free (web i appka, soukromé repo, hlavičky) + **Supabase Pro** + stavba
promptu v `claude-proxy` (už ověřuje přihlášení a odečítá kredity; prompt neopustí server; Workers Free mají jen 10 ms CPU).
**~25 $/měs.** při desítkách i ~1 000 uživatelů (bez modelů a hlasu). Roste: Supabase přidá výkon, Cloudflare nemá strop požadavků.

**Kroky v pořadí** (každý se ověří, než jde další):
1. **Prompt na server** (CODE-tune): stavba promptu do `claude-proxy`, klient posílá jen vstupy; stav z prohlížeče (sáček obrazů,
   poslední obraz) do DB; shrine vlastní cesta jen pro admina; ověřit golden testem bajt po bajtu. Podklad = „Mapa: z čeho appka
   skládá prompt“ níž.
2. **Supabase Free → Pro**, ověřit, že denní zálohy běží.
3. **Repo soukromé.** Historie, klony a forky zůstanou — dnešní prompt brát jako vyzrazený (úsudek).
4. **Cloudflare:** dva Pages projekty z jednoho repa, `_headers`, zkouška na `*.pages.dev`.
5. **DNS** — stav z veřejného DNS 2026-10-15 (CODE-read, nslookup přes 1.1.1.1): nameservery GoDaddy (ns09/ns10.domaincontrol.com) ·
   MX 5× Google (aspmx.l.google.com, alt1–alt4) · TXT `brevo-code:…`, `google-site-verification=…` a SPF
   `v=spf1 include:dc-aa8e722993._spfm.therunekeeper.com ~all` · DKIM Brevo = CNAME `brevo1._domainkey` → `b1.therunekeeper-com.dkim.brevo.com`
   a `brevo2._domainkey` → `b2.therunekeeper-com.dkim.brevo.com` · DMARC `p=quarantine; adkim=r; aspf=r`, hlášení na
   `dmarc_rua@onsecureserver.net` (služba GoDaddy) · apex A 185.199.108.153, www AAAA (obojí GitHub Pages) · `app.` neexistuje ·
   DNSSEC vypnutý (žádný DNSKEY) → krok „vypnout DNSSEC před přepnutím“ odpadá.
   ⚠️ **SPF stojí na záznamu, který spravuje GoDaddy** (`dc-aa8e722993._spfm` = `v=spf1 include:_spf.google.com ~all`) → v Cloudflare
   zapsat SPF přímo `v=spf1 include:_spf.google.com ~all`, jinak po odchodu z GoDaddy DNS přestane platit. Hlášení DMARC na adresu
   GoDaddy přesměrovat jinam, nebo `rua` odebrat.
   Postup: export zóny z GoDaddy, nízké TTL den předem, zóna na Cloudflare, porovnat import s exportem i s tímhle výpisem, poštovní
   záznamy „DNS only“, přepnout nameservery, ověřit poštu (e-mail do i z runar@, přihlašovací kód z Brevo), pak zapnout DNSSEC v Cloudflare.
   Nález mimo plán: **Google Workspace nemá DKIM** (`google._domainkey` neexistuje) — pošta z runar@ není podepsaná doménou. Zapnout
   v administraci Google Workspace (Gmail, ověření e-mailu), nezávisle na přesunu.
6. **Domény a přihlášení:** vlastní domény v Pages; Supabase Auth Site URL + Redirect URLs; Google OAuth origin a redirect; CORS funkcí.
7. **Ověřit** hlavičky, přihlášení Googlem i kódem, smoke.
8. **Stará adresa:** přesměrovat nebo vypnout, smazat DNS záznamy mířící na GitHub (převzetí domény). Nová adresa = nový origin →
   uživatelé se přihlásí znovu, PWA nainstalovat znovu.
9. **Klíče Supabase** na nové (fakt 8) — do konce 2026, nejlépe spolu s krokem 1.

**Zálohy, zkouška obnovy, zkušební prostředí, pojistky** (doplňuje „Zálohy / DR“ výš):
- Dnešní noční JSON export je úplný (ověřeno 2026-10-15), ale pro obnovu se hodí špatně (chybí DDL a pořadí cizích klíčů). Doplnit
  **`pg_dump` přes session pooler** (port 5432, IPv4; heslo z proměnné) → roles, schema, data do téhož šifrovaného archivu. Klient:
  produkce běží PostgreSQL 17.6, scoop main má 18.4 (export starší verze umí; pro obnovu do 17 je bezpečnější klient 17 — dostupnost
  přes bucket `versions` neověřena). `supabase db dump` chce Docker; `--dry-run` vydá přesné příkazy pg_dump.
- **Zkouška obnovy:** druhý Free projekt (0 $; Free dává 2 aktivní, uspání po týdnu nevadí), oficiální sekvence roles → schema →
  data přes `psql --single-transaction`; ověřit počty, součet kreditů, UUID účtů proti profilům, RLS, granty, triggery, přihlášení
  kódem. Kopie nese skutečné osobní údaje → po zkoušce smazat, žádné živé klíče (cron, webhooky). Opakovat měsíčně a po změně schématu.
  Že účty zůstanou se stejným ID, docs netvrdí — ověří až zkouška.
- **Kontrola na GitHubu:** Actions pro soukromé repo 2 000 min/měs. zdarma (kolik spotřebuje smoke, neměřeno). Vynutit prošlé
  kontroly (ochrana větve) jde u soukromého repa až s GitHub Pro (cena ~4 $ jen ze sekundárních zdrojů) a znamená práci přes pull
  requesty — pro 4 session velká změna. Mezikrok: Actions při každém pushi jen hlásí (chytí i `--no-verify`).
- **Návrat edge funkce:** Supabase staré verze nedrží (oficiálně nepopsáno, komunita potvrzuje) → před nasazením
  `supabase functions download` + git tag; návrat = nasadit z tagu. Změna tajné hodnoty platí hned, bez nasazení.
- **Soupis tajných hodnot:** jméno, kde žije, kdo vydal, postup rotace, datum poslední rotace — bez hodnot.

- **Owner 2026-10-15:** (1) Cloudflare Pages + přesun DNS — *„beru“* · (2) Supabase Pro — *„chci to mít kompletně připravené, všechno do
  detailu, zjisti a znovu ověř, že jsou informace správné“*: přepíná se v kroku 2, plán je předem hotový; klíčová fakta ověřena podruhé
  přímo na oficiálních stránkách 2026-10-15 (Cloudflare domény a limity, soukromé repo; Supabase ceník; GitHub Actions minuty; podmínky
  GitHub Pages) · (3) kontrola na GitHubu — *„pokud nepotřebujeme za něj platit, tak nebudeme“*: jen hlášení (Actions při pushi,
  2 000 min zdarma), bez GitHub Pro · (4) druhý Free projekt pro zkoušku obnovy — *„ano“*, zakládá owner.
- [ ] **CODE-read:** po založení druhého projektu: klient Postgresu, záloha `pg_dump` do nočního skriptu, skript obnovy, první zkouška.
- [ ] **CODE-read:** Actions „jen hlášení“ (které kontroly poběží bez tajných hodnot, kolik minut spotřebují) — připravit, spustit s přechodem na soukromé repo.
- [ ] **CODE-tune:** krok 1 (prompt na server) a krok 9 (klíče Supabase).

**Zdroje (čteno 2026-10-15):** Cloudflare: developers.cloudflare.com/pages/platform/limits · /pages/configuration/custom-domains ·
/pages/configuration/headers · /pages/get-started/git-integration · /pages/configuration/monorepos · /dns/zone-setups/full-setup/setup ·
/workers/platform/limits · /workers/platform/pricing. GitHub: docs.github.com/en/site-policy/github-terms/github-terms-for-additional-products-and-features ·
/en/get-started/learning-about-github/githubs-plans · /en/pages/getting-started-with-github-pages/github-pages-limits ·
/en/billing/concepts/product-billing/github-actions · github.com/pricing. Vercel: vercel.com/docs/limits/fair-use-guidelines, vercel.com/pricing.
Netlify: netlify.com/pricing. Supabase: supabase.com/pricing · /docs/guides/platform/backups · /docs/guides/platform/clone-project ·
/docs/guides/platform/migrating-within-supabase/backup-restore · /docs/reference/cli/supabase-db-dump · /docs/guides/functions/limits ·
/docs/guides/platform/custom-domains · /docs/guides/api/api-keys · /docs/reference/cli/supabase-functions-download. Hetzner:
hetzner.com/cloud/cost-optimized. PostgreSQL: postgresql.org/docs/current/app-pgdump.html.

### PŘED SPUŠTĚNÍM: prompt je veřejný a repem to nespravíš (2026-08-16)
KUKY: *„public repo. jako že se k nim může kdokoliv z venku dostat? i k promptu? nemělo by to
být ošetřené, až půjde appka ven?"*

**Ověřeno, ne odhadnuto.** `curl` bez jakéhokoli přihlášení stáhne
`raw.githubusercontent.com/Runar25/Runar-admin/main/v2/runar-character.js` → **HTTP 200,
115 535 znaků**. Uvnitř je celý hlas: `YOUR STANCE`, `NO COLD READING`, `RUNE_IMAGES`,
voice profil. Úhly jsou v `v2/runar-utils.js`, taky veřejné.

⭐ **Zprivátnění repa by NEZMĚNILO NIC.** Prompt se staví **v prohlížeči** a posílá se do proxy
jako hotový text (`claude-proxy/index.ts:420` ho bere z body, `:668` ho posílá Claudovi). Kdokoli
otevře appku a zmáčkne F12, má ho — bez ohledu na to, jestli je repo public.

⭐ **ROZHODNUTO (KUKY 2026-09-12): přesune se to na server PŘED spuštěním pro veřejnost, NE kvůli
testerům.** *„až budeme Rúnara spouštět, tak to přesuneme na server.“* Položka proto zůstává otevřená
a smoke ㉕ ji dál ukazuje — je to vědomě odložená podmínka veřejného spuštění, ne zapomenutá věc.

**Jediná skutečná oprava:** přesunout stavbu promptu do edge funkce a posílat z klienta jen
parametry (runa, area, seeking, intention, otázka, jazyk, spread). Je to zásah přes celou cestu
(§13) a rozhodnutí ownera: **je Rúnarův hlas to, co chceme chránit?** U tohohle produktu je copy
podstatná část hodnoty, takže odpověď nejspíš ano — ale stojí to přestavbu.

**Co naopak v pořádku JE** (ověřeno, ať se neopravuje, co není rozbité):
- Klíče k Anthropicu a ElevenLabs v klientovi **nejsou** — jsou v edge funkci.
- `SB_KEY` v `runar-config.js:8` je **anon** klíč (`"role":"anon"` v payloadu). Ten je veřejný
  záměrně; co ochrání data, je RLS, ne jeho utajení.
- **Admin se vynucuje na serveru** z ověřeného JWT (`claude-proxy/index.ts:447`), klientský
  `isAdmin()` je jen UI. Podvržení e-mailu v klientovi nikam nevede.
- `max_tokens` od klienta je serverově **zastropovaný na 2500** (`:432`).

#### Mapa: z čeho appka skládá prompt — podklad pro přesun na server (CODE-read 2026-10-10)
Platí pro Supabase edge funkci (zvolená cesta, owner 2026-10-15) — viz „Plán infrastruktury před spuštěním“ výš.
1. **Vstupy od člověka** (z klienta dál jako parametry): jméno, oblast, co hledá, záměr, otázka, tažené runy + pozice ve spreadu,
   jazyk, režim mine/someone, IS oslovení (`userGender` kk/kvk/hk), životní runa; u Asku navíc text čtení, otázka, předchozí výměna.
2. **Data a kód appky** (přestěhují se na server; dnes veřejné soubory): `runar-character.js` (hlas, `RP_*`, `RUNE_IMAGES`, buildery),
   `runar-runes.js`, `runar-config.js` (`SPREAD_CONFIG`, `TIERS`…), z `runar-utils.js` úhly, umístění jména, konce, `LENGTH_BUDGETS`, `_promptDraws`.
3. **Z databáze:** korekce (`runar_corrections`), poslední obraz téže runy (`readings.prompt_draws`, `_loadServerLastImage`),
   tarif pro myšlenku ✦ (server ho zná z JWT).
4. ⚠️ **Stav v prohlížeči — musí do DB, jinak se změní chování:** sáček obrazů `seasonbag_<bucket>_<druh>`, poslední motiv a obraz
   `seasonmotif_` / `seasonlast_<runa>` (localStorage, na zařízení), adminův výběr obrazu `runar_img_pin`. Na serveru stav na uživatele.
5. **Náhoda a čas:** `Math.random` (úhel, délka, konec, jméno, obraz ze sáčku); `new Date().getMonth()` = sezóna obrazů — server běží
   v UTC (Island = UTC; jinde se sezóna na přelomu měsíce posune o hodiny).
6. **Engine:** `READ_ENGINE` (sol/opus) mění variantu promptu, volí ji klient — model ale server; při výpadku solu dnes dostane Claude
   prompt psaný pro sol. Na serveru obojí na jednom místě.
7. **Zpětné čtení losu:** `_promptDraws` dnes luští hotový prompt; na serveru jde zapsat přímo z losu.
8. **Shrine** (laboratoř promptu) buildery používá taky (§3) — po přesunu potřebuje vlastní cestu jen pro admina, jinak zůstane kód veřejný.
9. **Ověření:** golden — server pro stejné vstupy a stejný los musí dát bajtově stejný prompt jako dnes klient (`scripts/golden`).
10. **Zavře navíc:** „libovolný prompt“ (níž), cenu spreadu z klienta (#4 v sekci C). Přestavba = CODE-tune.

### Přihlášený uživatel může proxy poslat LIBOVOLNÝ prompt (2026-08-16)
Plyne z předchozího: proxy bere `prompt` jako text od klienta a jen ho zastropuje na 2500 tokenů.
Přihlášený člověk si tedy může za cenu jednoho kreditu nechat vygenerovat cokoli — je to
**metrované, ale neřízené obsahem**. Riziko není účet (kredity to omezují), ale to, že náš klíč
generuje text, který s Rúnarem nemá nic společného.
**Zmizí to samo**, když se prompt přesune na server (výš). Do té doby aspoň vědět, že to tak je.

### Známkování čtení testery — a co s tím pak jde dělat (2026-08-16)
KUKY: *„jestli bychom pro testery neměli udělat i kolonku, kde by hodnotili to čtení. známkování…
stanovili bychom, jaké výstupy by nám od nich nejvíc pomohly slyšet."* A dál: *„tohle všechno máme
připravené. až budeme mít hodně testerů, tak jim budeme vypínat a zapínat oblasti s tím, že budeme
chtít vidět, jestli se to projeví na jejich známkování."*

⭐ **To druhé je důležitější než to první.** Známka sama o sobě je jen číslo; teprve **A/B
s vypnutou a zapnutou oblastí** z ní dělá měření. A aparát na tu stranu už stojí: `--arms`
srovná ramena, `find_seeds.js` najde, co z promptu prosakuje. Chybí **jen ta známka** — tedy
výstupní veličina, kterou dnes neumíme změřit vůbec.

**Proč to není jen „přidat hvězdičky":** aby šla známka spárovat s ramenem, musí se u čtení
uložit, **co bylo zapnuté** — dnes se ukládá `area`/`seeking`/`intention` a `prompt_draws`, ale
ne příznak experimentu. Bez něj se známky sesypou do jedné hromady a A/B se z nich nedá vytáhnout.

**Otevřené a je to rozhodnutí ownera + Coworku (obsah/UX, ne kód):** na co přesně se ptát.
Jedna otázka unese jeden druh odpovědi a víc otázek lidi nevyplní.

### Krize v otázce (sebevražedné myšlenky, lékařská nouze, násilí) — rešerše 2026-10-15 (CODE-read), owner rozhodl 2026-10-16, zbývá níž
Nález 2026-08-16: otázka s příznaky infarktu dostala běžné čtení o sběru borůvek a stála kredit. Owner 2026-10-15: *„těžko se mi věří,
že by si šel někdo pro radu v AI postavě ohledně infarktu. sebevražedné myšlenky asi ano… zkusím mu položit takové otázky a uvidíme“*
· *„to, že to bude nebo nebude stát kredit, bych asi neřešil. tohle je potřeba taky pořádně zjistit, jak se v takové situaci jedná.“*
**Co říkají zdroje:**
- **Model sám to spolehlivě neudělá.** OpenAI Model Spec má pravidlo proti sebepoškozování na nejvyšší úrovni, a test přesto dopadl
  čtením — otázka jde jako pole v zadání „napiš čtení“ (příčina neověřena). Anthropic uvádí vhodnou reakci ve vícekolových
  rozhovorech jen v 78–86 %. Proto se jinde kontroluje vstup dřív, než ho dostane model.
- **Praxe** (ChatGPT, Character.AI, Inflection Pi, Myra): rozpoznat → vystoupit z role → krátce a vlídně uznat, co člověk prožívá,
  říct, že Rúnar je AI a tady nestačí, dát konkrétní linku; u lékařské nouze jen „volej 112“; nevyptávat, neradit, nediagnostikovat;
  nechat dveře otevřené. Myra krizovou odpověď neúčtuje; jinde praxe nenalezena.
- **Technicky (návrh):** kontrola v `claude-proxy` před voláním modelu i před odečtem kreditu — OpenAI Moderation API (zdarma;
  sebepoškozování, násilí; lékařskou nouzi nepozná, islandština neověřena), případně malý klasifikátor. Kontrolovat volnou otázku,
  každé kolo Asku, jméno, režim „pro někoho“. Riziko opačné: smrt a proměna jsou běžné obrazy run → ověřit pevnou sadou IS + EN
  (co zachytit musí / nesmí, §19).
- **Island (ověřeno na stránkách provozovatelů):** 112 (nonstop, i chat na 112.is, angličtina) · Hjálparsíminn Rauða krossins 1717
  a netspjall (vždy otevřeno, zdarma, anonymní, všechny věky; ze zahraničí +354 580 1710) · Píeta samtökin 1799 (nonstop, od 18 let).
  EN mimo Island: findahelpline.com + místní tísňové číslo.
- **Povinnosti:** EU AI Act čl. 50 od 2. 8. 2026 — uživatel musí vědět, že mluví s AI; appka to dnes říká jen v souhlasu u volné
  otázky a v zásadách, obecné upozornění v rozhraní nemá · Anthropic AUP (záloha): oznámení AI v rozhraní + pravidla pro produkty
  pro nezletilé (náš věk 13+) · obchody (Apple, Google Play) jen u nativní appky · GDPR: příznak „sebevražedné myšlenky“ je zdravotní
  údaj (čl. 9) → neukládat, nanejvýš počet.
- [x] **Owner rozhodl 2026-10-16** (svým testem, hlášení 59c64907 → DECISIONS 2026-10-16 (1)): krizová odpověď místo čtení ne, Rúnar
  zůstává v roli a dělá výklad, čtení se platí („nejsme poradna“); model jmenuje 112 místo čísel z jiných zemí (v5.09). Kontrola
  v `claude-proxy` (návrh výš) tím nemá zadání.
- [ ] **Zbývá — pro ownera, část pro právníka:** upozornění „Rúnar je AI“ v rozhraní (EU AI Act čl. 50 od 2. 8. 2026)? · věk 13+
  proti pravidlům Anthropicu pro nezletilé? · oznamovací povinnost při zneužívání dítěte (islandský zákon o ochraně dětí)? ·
  placení za čtení s otázkou na sebevraždu — owner: *„Nebo je to protizákonné?“* (rešerše 2026-10-15 to neřešila)?
**Zdroje (2026-10-15):** model-spec.openai.com · openai.com/index/strengthening-chatgpt-responses-in-sensitive-conversations ·
developers.openai.com/api/docs/guides/moderation · anthropic.com/news/protecting-well-being-of-users · anthropic.com/legal/aup ·
support.claude.com/en/articles/9307344 · artificialintelligenceact.eu/article/50 · raudikrossinn.is (Hjálparsíminn 1717) · pieta.is ·
112.is/en · findahelpline.com/countries/is · inflection.ai/crisis-prevention-and-safety · developer.apple.com/app-store/review/guidelines ·
support.google.com/googleplay/android-developer/answer/14094294.

## Kontrola architektury po částech (od 2026-10-09, CODE-read; postup DECISIONS 2026-10-09 (15))
Každá část: co o ní tvrdí komentáře, `CLAUDE.md`, DECISIONS a smoke → proti kódu. Rozpor Code rovnou opraví; co potřebuje
ownera, stojí tady pod **PRO OWNERA**. Pořadí: claude-proxy → ostatní edge funkce → DB → appka → prompt → strom → docy.

⭐ **Kolo 2 a další (KUKY 2026-10-10):** *„až projedeme celou kontrolu, tak ji pojedeme znova, dokud všechno nevychytáme.“* — po poslední
části projít znovu od části 1 (stejné otázky, čerstvé grepy, nic nepřebírat z kola 1 bez ověření); konec, až kolo nenajde nic nového.
Doklad, proč: 2026-10-10 se v kole 1 vrátila chyba „5 hlasů měsíčně pro Rune Seekera“, kterou owner opravoval opakovaně (DECISIONS (42)).
**Rozšíření metody (KUKY 2026-10-10: „svoji kontrolu musíš ještě rozšiřovat“):** kolo 1 ověřovalo hlavně DOKUMENTY × kód. Kolo 2 přidává
**SLIBY APPKY × TOK KÓDU** — každý text pro uživatele s počtem, nárokem, „zdarma/jednou/měsíčně/navždy“ (UI_TEXT EN i IS, `TIER_FEATURES`,
nápověda, soukromí) projít tokem: co tier opravdu má (`free_balance`, `monthly_readings`, kredity) → co appka nabídne → strop serveru.
Nárok = nejmenší z nich (memory `strop-serveru-neni-narok`). První průchod = část 39.

**Kola 1–3 uzavřena (2026-10-09 → 2026-10-11).** Celý záznam — části 1–44, kolo 2 / 1–24, kolo 3 / 1–5 a co z nich hlídá stroj
(„⭐ Kolo 2 / 3 uzavřeno“) — přesunut doslova do `docs/archive/RUNAR_BACKLOG_kontrola-architektury.md` (2026-10-12, owner: „neni ten
backlog moc velky?“; uz_vime.js ho prohledává). Kolo 4 owner odložil (2026-10-11: *„kolo 4. bych mozna nechal jeste stranou… potrebuju
doladit apku“*). **Kolo 4 spuštěno 2026-10-14** (owner *„4. ano“*) — níž.

#### Kolo 4 (od 2026-10-14, CODE-read) — napřed části změněné od uzavření kola 3 (b05f6d6, 186 commitů), pak zátěž a souběh
**⭐ Uzavřeno 2026-10-15.** Prošlé: edge funkce, appka, landing, skripty, docs, zátěž, souběh. Co z nálezů hlídá stroj: ㉽ vidí landing,
㊵ ráčna „každá kontrola má útok nebo důvod v BEZ_UTOKU“, ㊉ mapa souborů v CLAUDE.md, ㉞ + post-commit i runar-verze.js, ㉼ 60 s podle
hodin. Otevřené zůstává jen past v `check_rate_limit` (níž, nikoho dnes netrefí). Nová kola jen na ownerův pokyn.
Souběh už zčásti hotový týž den: push s commitem vzniklým během smoke (DECISIONS 2026-10-14 (1)), osiřelé kopie pre-push, kontroly při commitu × sdílený strom.
- **K4/1 edge funkce — `waitlist-join` (CODE-web, nová, veřejný vstup):** omezení na IP bere první hodnotu `x-forwarded-for` (jako `redeem-code`);
  ✅ **ověřeno pokusem, nedá se podvrhnout** — 6 požadavků s vlastní hlavičkou → 429, s jinou hodnotou i bez hlavičky dál 429 (Supabase
  hlavičku na své hraně přepisuje; platí i pro `redeem-code`). Vedlejší účinek pokusu: 5 požadavků s `@example.invalid` prošlo do Brevo.
  - [x] ✅ *(CODE-web 2026-10-14, 7dbbfc5, nasazeno: táž adresa nejvýš 2× za hodinu (tichý úspěch), celkem 8 za hodinu = max 192/den z 300 Brevo (nad limit 503 a poctivá chyba ve formuláři); ověřeno naostro.)* ~~**Pro CODE-web — zneužití denní kvóty Brevo:**~~ omezení je jen na IP (5 / 15 min), ne na cílovou adresu ani celkem za den. Kdo má víc IP
    adres, pošle potvrzovací e-maily na cizí adresy (obtěžování) a vyčerpá denní kvótu Brevo (RUNAR_PRICING, řádek Brevo), kterou sdílejí
    přihlašovací kódy appky → ten den by se nikdo nepřihlásil e-mailem. Návrh: limit na adresu (otisk e-mailu, např. 2 / den) a denní strop
    registrací pod kvótou Brevo, ať zbude na kódy. Tichý úspěch při překročení (jako duplicita), ať se nedá zjišťovat.
- [ ] **Past v DB funkci `check_rate_limit`** (nalezla CODE-web 2026-10-14): při ~5 % volání maže řádky s `window_start` starším než 1 h, takže
  okno delší než hodina (denní limit) se uprostřed vynuluje. Dnes všechna okna ≤ 1 h, netrefí to nic. Zapsat do hlavičky funkce v migraci,
  nebo úklid vázat na délku okna (SQL ownera). Kdo chce denní limit, musí o tom vědět.
- **K4/1 další edge funkce:** `elevenlabs-proxy` (mazání položky z historie EL: podle request_id, text jen záloha, na pozadí přes waitUntil, cizí
  pokus ownera nesmaže) — v pořádku · `voice-usage` (počty historie pro shrine, jen admin) — v pořádku · `claude-proxy` — jen smazání A/B/C.
- **K4/2 appka:** prošlé v procházce 2026-10-11–13 (souhlas, deník, profil, Rúnakort, okna). Nález: reader přestal číst `runar_character` (9ff06eb),
  ale shrine ji četla dál → TEACH by s aktivním řádkem měl jinou postavu než appka. ✅ Opraveno 2026-10-14 (shrine: postava jen z kódu).
- **K4/2b mrtvé tabulky v DB** (nový typ: tabulka, kterou nečte ani nezapisuje žádný kód ani funkce v DB): `knowledge_base` (3 ř. z května)
  → SQL `sql/2026-10-14_drop_knowledge_base.sql` ✅ spustil owner 2026-10-14, ověřeno v DB. Nečtené, ale zůstávají: `gpt_reviews` (DECISIONS 2026-10-09 (8) — data
  se nemažou), `runar_character` (prázdná; výš „Víc postav“ s ní počítá). `rate_limits`, `reading_locks`, `credit_ledger` používají funkce v DB.
- **K4/3 landing `web/site` (CODE-web):** zásady soukromí registraci na webu pokrývají (Brevo, otisk e-mailu). Nález: landing bere texty živě
  z UI_TEXT appky, ale ㉽ četla jen v2/ — klíč, který appka přestane číst, by nabídla ke smazání a přejmenování by web ukázal prázdně.
  ✅ Opraveno 2026-10-14 v ㉽ (`scripts/verify_ui_text_used.js`: čte i web/site, chybějící klíč = FAIL) + útok v protipříkladech.
- **K4/4 skripty (29 nových od kola 3):** každá nová kontrola ve smoke má útok. Nález: pravidlo „nová kontrola = útok“ nic nevynucovalo (výjimky
  jen v komentáři) a kopie repa pro útoky brala jen .js kontroly. ✅ 2026-10-15: ráčna v ㊵ (`BEZ_UTOKU` s důvody) + .py do kopie.
- **K4/5 zátěž a souběh:** ㉼ jednou zablokovala push — appka při souběhu nenaběhla do „30 s“ (120 kol smyčky), samostatně prošla.
  ✅ 2026-10-14: 60 s podle hodin. Dřív v témže dni: pre-push hlídá posun větve, úklid osiřelých kopií (DECISIONS 2026-10-14 (1)).
- **K4/6 docs:** v CLAUDE.md „Soubory a jejich zodpovědnost“ chyběly moduly shrine TESTERS a PAYBACK (dvě session), nic to nehlídalo.
  ✅ 2026-10-15: doplněno + smoke ㊉ (`scripts/verify_soubory_claude.js`, každý v2/runar-* v mapě, nic navíc) s útokem.
- **K4/7 souběh — dvě session nad týmž souborem:** nesdílené soubory měnilo za 14 dní víc session (runar-app.js 3 lane, runar-config.js,
  shrine, check-is.py…), ale od zavedení commit_vlastni (2026-10-11) žádná zaznamenaná kolize mimo `_SDILENE` a strom byl při měření čistý
  → **není to díra, nový mechanismus nestavím** (smazání cizích řádků chytí pre-commit 24 h, rozbitou cizí práci pre-push v čisté kopii).
  Nález jinde: soubor, který pre-commit přidá (`git add`) při pathspec commitu, hlavní index nedostane (ověřeno pokusem) → `runar-verze.js`
  ležel v indexu na v686 proti HEAD v688; post-commit a ㉞ znaly jen sw.js. ✅ 2026-10-15 oba hlídají i runar-verze.js (hook to hned uklidil).
- [ ] **Pro ownera / Cowork (obsah, nespěchá; část 28):** hlavička `RUNAR_POPISY_RUN.md` píše „Společný tvar… pozorování, ne pravidlo —
  pravidlo vznikne, až jich bude 25+“. Popisů je 25, spouštěč nastal, pravidlo nikdo nesepsal. Jen připomínka; CODE do obsahu nesahá.

## Soukromí — kontrola GDPR 2026-10-12 (CODE-read; nálezy a důvody jen v `docs/archive/2026-10-12-gdpr-kontrola.md`)
Čísla v závorce = nález v kontrole. Nic z toho tu neopakuje důvody — ty bydlí v kontrole (§20).
- [x] ✅ *(owner 2026-10-12: „hotovo“ — trénink v ElevenLabs vypnutý; platí pro data odeslaná od té chvíle.)* **Owner — hned:** v účtu ElevenLabs vypnout „Improve the models for everyone“ (profil → Terms and privacy → Data use) (12).
- [x] ✅ *(owner 2026-10-13: „google workspace hotovo“ — CDPA přijat.)* **Owner:** v Admin console přijmout dodatek CDPA (zálohy na Drive, D). ✔ *2026-10-12 ověřeno DNS: `therunekeeper.com` má poštu u Google (MX `aspmx.l.google.com`) → je to Google Workspace.* Postup (Google, „Privacy, compliance and records“): přihlásit se jako super admin → Menu → Account → Account settings → Legal and compliance → „Security and Privacy Additional Terms“ → Cloud Data Processing Addendum → Review and Accept → I Accept. Je-li už přijatý, přijetí nic nemění.
      Je-li to osobní Google účet, zálohu přesunout jinam — bez dodatku chybí smlouva o zpracování.
- [x] ✖ *(owner 2026-10-12: „už mě tím neotravuj… nic se nepodepisuje“ — DPA OpenAI platí používáním služby, ověřeno 2026-10-09 (DECISIONS 2026-10-09 (13)); NEPŘEDKLÁDAT znovu.)* ~~**Owner (volitelné):** OpenAI — vyplnit DPA formulář pro jistotu a zvážit žádost o nulovou retenci (D, 1).~~
- [x] ✅ *(owner 2026-10-12, DECISIONS 2026-10-12 (7): (a) obojí — upozornění pod „+“ a jednorázový souhlas při psaní; (c) minimální věk 13 + věta o souhlasu rodiče; (b) a (d) „později“ → položka „Před spuštěním“ níž.)* **Owner — rozhodnutí:** (a) výslovný souhlas u pole otázky / výzva nepsat citlivé údaje (1) · (b) vývojové konverzace s Claudem:
      do zásad, nebo lhůta a přísnější nevypisování (5) · (c) minimální věk — Island 13, doporučeno 16–18 (6) · (d) DPIA před veřejným
      spuštěním (10).
- [ ] **CODE-tune — souhlas u volné otázky a minimální věk** (DECISIONS 2026-10-12 (7), celé zadání tam): „+“ za THE SITUATION s upozorněním; jednorázové políčko souhlasu (+ věk 13+) při prvním psaní do otázky nebo Asku, uložené k účtu (sloupec a grant = SQL ownera, smoke ⑩), odvolání v menu Privacy; zásady EN + IS: věk 13 a souhlas rodiče, popis souhlasu. IS ověřit (§2).
      ✅ *(CODE-tune 2026-10-12, krok 1: „+“ za THE SITUATION s upozorněním EN + IS; v zásadách věk 13 a souhlas rodiče; ㊽ (G) hlídá,
      že „+“ nezmizí.)* ✅ *(krok 2 v kódu, CODE-tune 2026-10-12: políčko souhlasu (+ věk 13+) při prvním psaní do otázky nebo Asku, bez něj
      čtení s otázkou nezačne a Ask neodejde; odvolání v menu Privacy smaže i otázku rozdělaného čtení; testeři výjimka; popis v zásadách;
      hlídá ㊽ (H).)* ✅ *(SQL puštěno ownerem 2026-10-12, sloupec i grant ověřeny v DB — DECISIONS 2026-10-12 (10).)* **Zbývá:** ~~owner pustí SQL~~ ověřit
      naživo přihlášeným adminem (zaškrtnout, odvolat) — ověřeno jen proti podvržené databázi. (Do 2026-10-13 tu stálo „do té doby
      uložení souhlasu selže“ — platilo jen do ownerova SQL 2026-10-12.)
- [ ] **Před veřejným spuštěním (owner 2026-10-12 „později“):** vývojové konverzace s Claudem — do zásad, nebo lhůta (5) · doba uchování hlášení a čtení po smazání účtu (8, s „Retence čtení“) · DPIA ano/ne (10).
- [x] ✅ *(CODE-tune 2026-10-12: ElevenLabs netrénuje od 12. 10. 2026 a drží text i zvuk v našem účtu (12, položka „historie ElevenLabs“
      níž); věk 13 a souhlas rodiče (6). Hlášení a doba jejich uchování (8) vede „Před veřejným spuštěním“ výš.)*
      **CODE-tune — zásady EN + IS (IS ověřit §2), zbývá jen to, co čeká na ownera:** ElevenLabs „netrénuje“ a doba uchování — až owner
      vypne trénink v účtu (12) · hlášení do tabulky „What is held“ + doba uchování (8, s položkou „Retence čtení“ v „OWNER rozhodnutí“) ·
      minimální věk po rozhodnutí (6). Zásady na agndofa.is (3) vede položka „Publikovat privacy policy na agndofa.is“.
      ✅ *(CODE-tune 2026-10-12: Brevo, přihlášení přes Google (+ řádek v tabulce: jméno a fotka z Google účtu), GitHub Pages; mechanismus
      přenosu u Google Drive, ElevenLabs a GitHub (rámec EU–USA platí v EHP od 6. 7. 2024, EEA-Lex 32023D1795); „Consent“ jen u testerů,
      hlas a jazyk pod smlouvou; úložiště prohlížeče podle skutečnosti — `treeLog` se do zásad nepíše, appka ho přestala sbírat. Po cestě
      opravy islandštiny, které stránka nesla: „hlíðum“ → „erum bundin af“, „á spám þínum“ (předpovědi — Rúnar není věštec) → „á lestrum
      þínum“, „lestrar“ → „lestra“, „á þessum slóð“ → „á þessari slóð“, „Mótmæla“ → „Mótmæltu“. Ověřeno is-greynir, korpus, is-gpt-check.)*
- [ ] *(CODE-tune 2026-10-13, owner „ano udělej“: `elevenlabs-proxy` položku po vygenerování maže, nasazeno; zásady upravené.
      DECISIONS 2026-10-13 (6).)* **Neověřeno, že v historii něco je a že mazání zabírá:** owner v ElevenLabs → Text to Speech → historie
      žádné hlasy nenašel (2026-10-13); jestli webové rozhraní ukazuje hlasy z API, dokumentace ElevenLabs neříká. Rozhodne jen výpis
      `GET /v1/history` naším klíčem — ten je jen v Supabase secrets (lokálně ne). ✅ *(2026-10-13, owner „ano udělej a nasaď“: shrine VOICE
      ukazuje počet položek historie, z toho Rúnarova hlasu, nejnovější a nejstarší — `voice-usage` nasazena. Owner předtím historii v
      rozhraní ElevenLabs smazal.)* Zbývá ověřit: po přečtení čtení nahlas nesmí počet Rúnarova hlasu ve shrine VOICE vzrůst.
      ⛔ **Ověřeno 2026-10-14 — mazání NEZABRALO** (owner poslal snímek: ElevenLabs → Text to Speech → History, položka hlasem Rúnar
      ze 14. 10. — *„nesmazalo se automaticky“*). Jediný hlas od nasazení: `voice_usage` 2026-10-14 08:25:56 UTC (is, eleven_v3, 310 znaků),
      vygenerovala ho `elevenlabs-proxy` v41 nasazená 2026-10-13 21:18 UTC i s mazáním — kód tedy běžel a položku nesmazal. Tím je
      zodpovězeno i to, co dokumentace neříká: webové rozhraní hlasy z API ukazuje. **Který krok selhal, neověřeno** — řekne jen log
      funkce (`EL history list <kód>` = klíč historii nečte · `… item not found` = položku nenašla · `EL history delete <kód>` = klíč
      nesmí mazat · `… cleanup failed` = výjimka · žádný řádek = úklid neběžel); CLI logy neumí a vestavěný prohlížeč k Supabase přihlášený
      není → log přečte owner. Kandidát opravy podle výsledku: hledat položku podle `request_id` (hlavička `request-id`, kterou ElevenLabs
      vrací pro navazování požadavků; položka historie pole `request_id` nese) místo podle textu, který proxy normalizuje, a čekat déle
      než 3 × 1,5 s; při 401/403 je oprava v oprávněních klíče (historie: zápis), ne v kódu. Do opravy věta v zásadách „mažeme“ neplatí.
      **Log (owner, snímek 2026-10-14):** 08:26:01 `EL history item not found — left in history` → výpis prošel (klíč historii číst smí),
      položka se za 3 pokusy nenašla; jestli ještě nebyla zapsaná, nebo nesouhlasil text, log nerozliší. **Oprava nasazená 2026-10-14
      21:10 UTC (v42, DECISIONS 2026-10-14 (4)):** hledá se podle `request_id` z hlavičky odpovědi, text je záloha (normalizovaný na obou stranách), čeká
      se ~50 s na pozadí, log nově řekne, čím se našlo, nebo co bylo vidět (počty, ne text). Žádná záloha „nejnovější položka našeho
      hlasu“ — smazala by i ownerův pokus na webu ElevenLabs. Hlídá smoke ㊅ (`scripts/verify_el_historie.js`); že ElevenLabs hlavičku
      u streamu posílá a položku zapíše do ~50 s, ukáže až log u prvního hlasu po nasazení.
      **CODE-tune — historie ElevenLabs drží text čtení i zvuk; smazání účtu v Rúnaru tam nedosáhne** (nalezeno 2026-10-12 při psaní
      zásad). Ověřeno v dokumentaci API: `enable_logging` je ve výchozím stavu zapnuté a vypnout ho smí jen Enterprise; `elevenlabs-proxy`
      ani `elevenlabs-static` ho nenastavují; položka historie nese `text` a zvuk jde stáhnout. Návrh: po uložení zvuku položku smazat
      (`DELETE /v1/history/{id}`; jak získat id u streamu, neověřeno) — úprava edge funkcí, nasazení ownerem; pak upravit větu v zásadách
      („keeps it and the audio in our account“ / „geymir hann og upplesturinn á reikningnum okkar“). Do té doby zásady říkají pravdu.
- [x] ✅ *(CODE-read 2026-10-12: hotovo — `RUNAR_PRIVACY.md` sekce „Záznamy o činnostech zpracování“, „Test oprávněného zájmu“, „Únik dat“ s evidencí incidentů; Slack zapsán v tabulce.)* **CODE-read:** do `RUNAR_PRIVACY.md` záznamy o činnostech zpracování (čl. 30), test oprávněného zájmu a postup při úniku dat (10);
      zapsat, že do Slacku osobní údaje nejdou (D).

## Musí být hotové PŘED prvním cizím přihlášením

- [x] **HOTOVO (ověřeno 2026-10-11: runar25.github.io/Runar-admin/v2/runar-privacy.html → HTTP 200) · Zásady soukromí živé na webu** — vlastní položku má tenhle doc už výš (sekce o GDPR);
      sem patří jen tím, že blokuje spuštění. Záměrně se tu NEOPISUJE (§20).
- [x] **NAHRAZENO 2026-10-11 brzdou kreditů (DECISIONS 2026-10-11 (48), nasazeno (52)) · Limit v účtu ElevenLabs — NENÍ blocker pro testery, je to pojistka proti skriptu.**
      Owner 2026-09-12: *„limit 5 je jen kvůli testerům… kdokoliv si udělá Google účet, tak dostane co?"*
      **Ověřeno v DB a kódu, co nový účet dostane:** řádek s `tier = 'free'` (DB default) — klient
      (`runar-config.js` `TIERS.free = TIERS.rune_seeker`) i proxy (`claude-proxy` „free → rune_seeker")
      ho čtou jako **Rune Seeker** · `free_balance = 1` (**jedno volné čtení**) · `credits_balance = 0` ·
      žádný trigger na `auth.users`, nic víc se nepřidává.
      **Hlas:** tlačítko „Hear Rúnar speak" se po čtení zapne **každému** a `elevenlabs-proxy` tier nekontroluje —
      je to **záměr** (`TIER_LIMITS.rune_seeker.voice_monthly: true`, „hlas pro free čtení"). **Přes UI** tedy
      nový účet slyší své jedno čtení (≈ jeden hlas na jazyk). **Pět hlasů měsíčně libovolného textu jde jen
      ručním požadavkem** (F12) — stejná třída jako „prompt se staví v prohlížeči", řeší se týmž přesunem na server.
      ⇒ Limit v účtu ElevenLabs chrání jen proti tomu, kdo by si naskriptoval hodně účtů. **Co zkontrolovat, až
      bude čas:** jestli má plán zapnuté placení nad kvótu. Když plán skončí na kvótě, není co dělat.
      ⚠️ Vedlejší nález: DB default `tier = 'free'` není mezi dokumentovanými hodnotami a drží ho při životě
      kompatibilní převod na DVOU místech. Všechny 4 skutečné účty mají `rune_seeker`. Nerozbité, jen křehké —
      default by měl být `rune_seeker`.
- [x] ✅ *(CODE-tune 2026-10-16, owner „12. udělej plánovanou úlohu… chci vždy potvrzení“: týdenní úloha `runar-zpravy-gmail`, potvrzení
  v hlídání provozu; zbývá ownerovo SQL `sql/2026-10-16_mazani_hlasi.sql` a „Run now“. DECISIONS 2026-10-16 (2).)*
  ~~**Zprávy „Send Rúnar a line“ ve schránce runar@ smazat 6 měsíců po poslední odpovědi**~~ (CODE-tune 2026-10-15, owner „10. ano“). DB maže
  pg_cron sám (`sql/2026-10-15_zpravy_runarovi.sql`); kopie v Gmailu (štítek Messages) ne — Workspace bez Vaultu pravidlo pro mazání nemá.
  Možnosti: měsíční plánovaná úloha Claude (Gmail konektor: `label:Messages older_than:6m` → koš; stálé nastavení → s ownerovým ano),
  nebo ručně ownerem. Do rozhodnutí zásady slibují 6 měsíců i pro schránku — splnit nejpozději 2027-04-15 (první zprávy).
- [x] ✅ *(CODE-tune 2026-10-15, owner „8. ano 9. ano“: běžný uživatel píše Rúnarovi z menu — „Send Rúnar a line“, edge funkce `send-line`;
  vlajku s typy hlášení vidí jen tester a tým. DECISIONS 2026-10-15 (4).)* ~~**Hlášení pro běžné uživatele bude úplně jiné — probrat před spuštěním**~~ (KUKY 2026-10-09: *„čistě z uživatelského pohledu to, co
      může trápit běžného uživatele. Teď nevím, co se do takového reportu obyčejně dává. To probereme před spuštěním.“*). Dnes vidí každý
      ne-admin typy pro testery.
- [x] ✅ *(CODE-tune 2026-10-11: běžící verze z `v2/runar-verze.js`, který píše hook; „v657 (now v659)“, když se liší; smoke ㊼, DECISIONS 2026-10-11 (68).)* ~~**Hlášení nese verzi nasazenou, ne tu, která v telefonu běží**~~ (2026-10-09, CODE-tune, §22). `runar-reporter.js` bere `app_version`
      z čerstvě staženého `sw.js`, ale stránka jede na JS ze staré cache, dokud se nenačte znovu (SW: JS cache-first). Doklad: hlášení 24c6c548
      (8. 10.) neslo `v564` a popisovalo chybu opravenou ve v564; owner 9. 10. po novém načtení: v pořádku. S testery by to mátlo diagnózu.
      Oprava: verzi zapsat přímo do kódu (pre-commit hook ji při bumpu `sw.js` přepíše i v reporteru) a do hlášení dávat obě.

## Procházka appky jako návštěvník (CODE-read 2026-10-11, produkce v654, EN + IS, desktop i 375 px)
Prošlo bez vady: úvod, tah runy (výzva k registraci, žádné volání serveru), přepnutí jazyka po tahu (bez okna o kreditu), životní runa
(výpočet bez serveru), Safn rúna (25 run, 5 odemčených, detail s kamenem a audiem), deník návštěvníka, nápověda, zásady, okno „Where to
start“ (runa = naše SVG), šířka telefonu (bez vodorovného posunu, mřížka 4 sloupce), konzole bez chyb; islandské věty is-greynir OK.
- [x] ✅ *(CODE-tune 2026-10-11: okno z UI_TEXT v jazyce čtenáře — IS „VILTU AÐ RÚNAR TALI AFTUR Á ENSKU?“ —, cena z `SPREAD_COSTS` jednotkou
  `VOCAB` („1 SPÁ“ / „1 RUNE READING“); táž vada „Voice error: …“ při výpadku hlasu opravena; ráčna ㊾ na anglický text natvrdo v JS readeru,
  okno v ㊽ (C). DECISIONS 2026-10-11 (70).)* ~~**Pro CODE-tune — okno „SPEAK AGAIN IN …?“ natvrdo anglicky**~~ (`v2/runar-app.js` ~ř. 393–400, `openLangSwitchModal`; v HTML
  „1 CREDIT“). Přihlášený, který po čtení přepne jazyk, dostane nadpis, text i obě tlačítka anglicky, i když appku používá islandsky,
  a text slibuje „uses one credit“ — předplatitel a tester platí jednotkami čtení. Kontroly to propustily: ㉹ hledá češtinu, ㉸ jen
  větvení `lang === 'is' ?`, anglický text v šabloně `…` nevidí nic → zvážit kontrolu „anglická věta v JS mimo UI_TEXT“.
- [x] ✅ *(CODE-tune 2026-10-11: buňky mají id, jména z `TIERS`, karta z `VOCAB` jako v menu appky („+ RUNE READING CARD“ / „+ RÚNAKORT“ —
  „+ READING CARD“ bylo špatně i anglicky), štítek „soon“ / „brátt“; totéž i VISITOR / GESTUR. Zaseklou angličtinu na readeru, nápovědě a
  zásadách hlídá smoke ㊽.)* ~~**Pro CODE-tune — nápověda v islandštině: zaseklá angličtina**~~ (`v2/runar-help.html` ř. 151 „RUNE SEEKER“, 155 „+ READING CARD“,
  159 a 163 „soon“): statické buňky bez `id`, JS je nepřekládá (Vegfarandi/Ferðalangur se přes `id` překládají). Jména tierů z `TIERS`
  (§10), karta z `VOCAB`.
- [x] ✅ *(CODE-tune 2026-10-11: `.q-teaser-txt` bez průhlednosti → 7,7 : 1 jako `.credit-note`; táž vada v zásadách „Last updated“ (2,14 : 1)
  opravena; hlídá smoke ㊽ `verify_citelnost.js`.)* ~~**Pro CODE-tune — upozornění „not professional advice“ nečitelné**~~ (`#reader-disclaimer`, `--muted` s průhledností 0,45 na pozadí
  #0a0c12, písmo 9,6 px): kontrast 2,41 : 1 (pro text se chce aspoň 4,5). Výsledná barva ~#44515f ≈ `--dim`, které §5 na text zakazuje.
- [x] ✅ *(CODE-tune 2026-10-12: průhlednost zvednuta, přeměřeno — žádný text pod 4,5 : 1; ㊽ (A) od teď padá pod 4,5 : 1, velké písmo
  pod 3 : 1, takže přepínač `--slabe` zanikl. DECISIONS 2026-10-12 (9).)* **Pro CODE-tune — zvednout na 4,5 : 1** *(owner 2026-10-12: „ano“; seznam `node scripts/verify_citelnost.js --slabe`: „(OPTIONAL)“ ve formuláři čtení, nadpisy sekcí a hlavičky tabulek v nápovědě a zásadách, podtitul „GUIDE & FAQ“ / „PRIVACY POLICY“, štítek „soon“ — styl zůstává, jen zesvětlit; zvážit, zda práh ㊽ nezvednout z 3 na 4,5)* ~~**Pro ownera — 19 textů s kontrastem 3–4,5 : 1**~~ (pod doporučením WCAG pro malé písmo, nad `--dim`, takže §5 neporušují): hlavně popisky
  sekcí a hlavičky tabulek nápovědy (průhlednost 0,5, ~3,6 : 1), „GUIDE & FAQ“, štítek „soon“ a pár popisků v readeru a zásadách. Smoke ㊽ je
  jen vypisuje. Rozhodnutí o vzhledu: zvednout na 4,5 : 1, nebo nechat. Seznam: `node scripts/verify_citelnost.js --slabe`. (CODE-tune 2026-10-11)
- [x] ✖ *(owner 2026-10-12: „nechavame“ — statická čtení zůstávají, jak jsou; DECISIONS 2026-10-12 (1).)* ~~**Pro Cowork / ownera — statická čtení v Kolekci tvrdí, co se děje v nitru čtenáře**~~ (Fehu IS: „Það sem þú hefur nært í kyrrðinni
  er farið að taka rætur… krafturinn sem fer á hreyfingu þegar þú treystir því sem býr innra með þér“) — kánon to Rúnarovi zakazuje
  (memory `rozkaz-a-studene-cteni-hranice`). Dosud zapsaný jen Dagaz (položka „Statické čtení Dagaz“); projít všech 25.
- [x] ✅ *(CODE-tune 2026-10-12: „Sign in, and all twenty-five runes await you.“ / „Skráðu þig inn og þá bíða þín allar tuttugu og fimm
  rúnirnar.“ — navazuje na výzvu nahoře („Five runes await you“); zamčená buňka už nemá pointer-events:none. IS greynir, korpus,
  is-gpt-check.)* **Pro CODE-tune** *(owner 2026-10-12: „ano“ — krátká hláška EN + IS po klepnutí na zamčenou runu, např. „přihlas se a odemkni všech 25 run“; IS vymyslet a ověřit §2)* ~~**Návrh pro design (ne chyba)**~~ — klik návštěvníka na zamčenou runu v Kolekci nedělá nic (`if (!locked) cell.onclick`); výzva
  nahoře vysvětluje pět odemčených run, ale krátká nápověda po kliknutí by předešla dojmu „nefunguje“.

**Přihlášená část** (CODE-read 2026-10-11, appka z pracovního stromu na localhostu, podvržený tester s premium jen v prohlížeči, deník
z vymyšlených řádků, volání databáze zablokovaná): postranní panel, formulář čtení a deník v EN i IS, šířka telefonu (bez vodorovného posunu),
konzole bez chyb. Islandské věty panelu is-greynir: „lestrunum“ korpus dokládá (20×), E001 jen proto, že popisek nemá podmět.
2026-10-12 bez vady i obrazovka hotového čtení (`callProxy` podvržená v prohlížeči, zbytek produkční cestou; čtení „someone“, aby se nic
neukládalo): Single i Norny v EN a IS, myšlenka ✦ zvlášť, kameny run, ťuknutí na glyf, Ask podle tarifu (premium 2 otázky, standard 1 +
nabídka vyššího tarifu, Rune Seeker jen navržené otázky), formuláře všech pěti výkladů, Mé jméno, okno smazání (jen otevřeno), Rúnakort.
Tamtéž 2026-10-12 (druhá polovina, síť na cizí hosty blokovaná, `callProxy` podvržená): čtení životní runy a rozbor jména, výklady Kříž,
Podkova a Yggdrasil (cena, tlačítko, kameny v hlavičce, text), nápověda — v EN i IS bez chyby v konzoli a bez cizího jazyka. Souhlas
s otázkou (krok 2) ověřen týmž způsobem: bez souhlasu čtení nezačne, neuložený souhlas nechá políčko prázdné, se souhlasem otázka projde.
Procházka je tím úplná.
- [x] ✅ *(CODE-tune 2026-10-12, 5c8d281: „You carry the life rune {rune}“.)* ~~**Pro CODE-tune — EN `tree_carry_life_rune` bez členu**~~ (`v2/runar-translations.js` ~ř. 275): „You carry life rune {rune}“ →
  „You carry the life rune {rune}“. Předáno 2026-10-12. IS „Þú ber lífsrún {rune}“ beze změny — E001 Greyniru dělá cizí jméno runy
  (padá i „Þú ber rún Berkana.“), ne vazba.
- [x] ✅ *(CODE-tune 2026-10-11: `prekresliDenik` v `runar-journal.js`, volá ho `setLang` — Deník v novém jazyce se stejným filtrem a otevřenými
  kartami, obnoví i pruh pro Rune Seekera; hlídá smoke ㊽ (D) včetně islandštiny v EN. Upřesnění příčiny: v produkci Deník překresloval
  `_updateGateTexts` v `updateUIText` z `_journalCache` — ukázková čtení přes `renderJournal` ho neplní, proto nález v testu; skutečné vady byly
  ztracený filtr, zaklapnuté karty a stav v `updateUIText` proti §14. To překreslení je pryč.)* ~~**Pro CODE-tune — přepnutí jazyka na záložce
  Deník nechá deník v původní řeči.**~~ Po IS → EN zůstane nadpis „✦ SPÁR ÞÍNAR“, počet
  „2 lestrar“, u rozbalené karty „~ DÝPRI HUGLEIÐING“ a „HLUSTA Á LESTURINN“ a datum v islandském tvaru (filtry se přeloží). Příčina:
  `setLang` (`v2/runar-app.js` ~ř. 334–346) po přepnutí znovu kreslí Kolekci a Životní runu, Deník ne; jeho texty kreslí jen `renderJournal`
  (do updateUIText nepatří, §14). Stačí znovu vykreslit uložené `_jEntries` (s aktivním filtrem), když je otevřená záložka Deník.
  Smoke ㊽ zaseklou angličtinu hledá, opačný směr (islandština v EN po přepnutí na Deníku) neprochází.
- [x] ✅ *(CODE-tune 2026-10-11: `vl(key, lang, pad)` umí islandský pád jako `tierLabel`; po vyčerpání čtení „með <b>Rúnakorti</b>“ a výčet
  ve vlastní větě, popisek „ᚠ SLÁÐU INN KÓÐANN Á RÚNAKORTINU“ (`VOCAB.card.is_dat_def`); greynir, korpus a is-gpt-check bez nálezu; hlídá smoke
  ㊽ (E). Cestou `rs_credits_desc` dostává `vlp('unit', lang)` místo napevno anglického `VOCAB.unit.en_pl`.)* ~~**Pro CODE-tune — islandský
  pád u Rúnakortu (dvě šablony).**~~ `{card}` dostává vždy 1. pád z `vl('card')` („Rúnakort“):
  1. `rs_exhausted_one/_many` (`v2/runar-translations.js` ~ř. 922; Rune Seeker po vyčerpání čtení zdarma): „Opnaðu dyrnar með
     <b>Rúnakort</b>“. Nástrojové „með“ chce 3. pád — korpus „greiða með korti“ 77×, „greiða með kort“ 0×; „dyrnar með lykli“ 5×,
     „með lykil“ 0×. Tvar je hotový ve `VOCAB.card.is_dat` („Rúnakorti“), `v2/runar-auth.js` ~ř. 194 ho jen nepoužívá. Greynir navíc
     chápe výčet za pomlčkou jako závislý na „með“ („engin“ → „engri“) — ověřená podoba: „Opnaðu dyrnar með <b>{card}</b>. Eitt kort,
     enginn gildistími og engin áskrift.“ (is-greynir OK).
  2. `redeem_card_code` (~ř. 960): „ᚠ SLÁÐU INN {card} KÓÐA“ je slovo od slova anglické „ENTER {card} CODE“ — dvě podstatná jména vedle
     sebe bez složeniny a bez 2. pádu (§2: IS jako překlad EN). Ověřené podoby (is-greynir OK): „Sláðu inn kóðann á Rúnakortinu“
     (potřebuje 3. pád určitý, ve VOCAB zatím není), nebo bez nového tvaru „{card}: sláðu inn kóðann“. Korpus na tyhle obraty mlčí
     (0× i u „gjafakort“) a Greynir propustí i kalk „Sláðu inn gjafakort kóða“ — rozhodla tu gramatika, ne nástroj.
  Ostatní IS šablony s `{card}` sedí („Notaðu Rúnakort“, „Kaupa fleiri Rúnakort“, „Rúnakort opnar allt“). Vzor pádů jako dat už existuje
  (`TIERS.*.label_is_dat`, `tierLabel`, DECISIONS 2026-09-30 (6)).
- [x] ✅ *(CODE-tune 2026-10-12, owner „udělej i tu položku s načtením profilu“: `fetchUserProfile` čte `error`, jednou zkusí znovu, pak
  Životní runa a strom ukážou hlášku a „REYNDU AFTUR / TRY AGAIN“ místo formuláře; bez načteného profilu žádný pruh nad formulářem (ani
  probliknutí „vyčerpáno“ při přihlášení) a žádná výzva ke jménu; po návratu sítě se profil načte sám. Hlídá smoke ㊽ (F). DECISIONS
  2026-10-12 (2).)* ~~**Pro CODE-tune (nízká priorita) — selhané načtení profilu vypadá jako „appka zapomněla moji runu“.**~~ `fetchUserProfile`
  (`v2/runar-app.js` ~ř. 63–159) při chybě sítě nastaví `profileLoaded = true` a překreslí Lífsrúnin bez dat → záložka se zeptá
  „When were you born?“ i člověka, který datum i hotové čtení uložené má; žádná hláška, žádný druhý pokus. Ověřeno produkční funkcí
  se zablokovanou sítí. Platba nehrozí: druhé vygenerování životní runy server odmítne (409, `claude-proxy` ~ř. 688), uživatel
  ale dostane „The runes are quiet“. Tutéž podobu „zapomenuté runy“ řeší komentář u ř. 107 (Sigrún, iPhone, 3×) pro pomalý profil —
  pro neúspěšný ne. Návrh: při chybě jeden opakovaný pokus a jinak hláška místo formuláře.
- [x] ✅ *(CODE-tune 2026-10-12: pravidlo v `runar-reader.css` podle třídy panelu samého (`body:has(#side-panel.open)`), takže ho
  neobejde žádná cesta zavření; ověřeno v prohlížeči i pro přihlášeného.)* **Pro CODE-tune** *(owner 2026-10-12: „ano“ — dokud je postranní panel otevřený, vlajku hlášení a „?“ skrýt)* ~~**Návrh pro design (ne chyba)**~~ — na telefonu leží vlajka hlášení (`#br-btn`, z-index 99998) a „?“ (`#hb-btn`) i nad otevřeným
  postranním panelem (z-index 151); vlajka stojí v řádku „× DELETE ACCOUNT“. Text dnes nezakryje, ale panel působí neuzavřeně.

## Ověřit naživo, než rozešleš odkaz

- [x] ✅ *(CODE-tune 2026-10-14: nasazeno v88 s hlídáním provozu, `nasazene_vs_repo.py` = HEAD; DECISIONS 2026-10-14 (14).)*
  **`claude-proxy`: s příštím nasazením odejde i smazání Vrstev A/B/C** (owner 2026-10-14 „přibal to k dalšímu nasazení“,
  DECISIONS 2026-10-14 (8)). Kód byl vypnutý, nasazení samo nic nemění; po něm `python -X utf8 scripts/utils/nasazene_vs_repo.py`
  musí u `claude-proxy` hlásit „= HEAD“ — pak odškrtnout.

- [x] ✅ *(owner 2026-10-13: „teď jsem to zkusil znova a už se logo chrome neobjevilo“ — jednorázové, příčina neověřená; hlášení
      uzavřeno.)* **Owner → CODE-tune: při otevření appky logo Chrome** (hlášení 457a5a6f, 2026-10-13: *„dřív to nedělal“*). Server je v pořádku,
      ověřeno 2026-10-13 v produkci: service worker aktivní a řídí stránku, manifest i všechny čtyři ikony 200, manifest od května beze
      změny. Owner 2026-10-13: Android, appka z plochy, logo jen chvíli při spuštění, nikdy dřív. Na Androidu 12+ ukáže systém při
      spuštění ikonu aplikace, která se spouští — u zástupce na ploše je to Chrome, u nainstalované appky Rúnar (neověřeno na jeho
      telefonu). Další krok (owner): Nastavení → Aplikace — je tam „Rúnar“? Není → zástupce: smazat z plochy, v Chrome ⋮ → „Instalovat
      aplikaci“. Je, a logo pořád → hlásit CODE-tune, hledat dál.
- [x] ✅ *(CODE-read 2026-10-14: čtyři poslední hlášení v DB (13.–14. 10.) jsou jako zprávy v Slacku #runar-reports, každé do sekundy od zápisu — webhook notify-report běží.)* ~~jedno hlášení z reporteru → **přišlo do Slacku?**~~
- [ ] po pushi zkontrolovat verzi: `curl -s https://runar25.github.io/Runar-admin/v2/sw.js | head -1`

## Co testerům napsat dopředu (ať to nehlásí jako chybu)

- [ ] **Tree of Life nemají** — ikona je skrytá, protože strom není hotový. Životní runu mají
      ve vlastní záložce.
- [ ] **Hlas: tester 15 za měsíc** (`VOICE_MONTHLY_LIMIT_TESTER`, KUKY 2026-10-11; ostatní hlas ke každému čtení, DECISIONS 2026-10-11 (61)). Kolik zbývá, ukazuje
      od 2026-10-11 menu pod jménem (DECISIONS 2026-10-11 (56)). Když dojdou kredity ElevenLabs (brzda, DECISIONS (48)), hlas odpočívá
      pro všechny — appka to řekne, není to chyba. (Do 2026-10-11 tu stála hladina `VOICE_SAFE_SHARE`, kterou brzda nahradila.)
- [ ] **Režim „pro někoho jiného" testovat smí** — je to záměr, ne chyba.
- [ ] Až budou mít premium, musí si appku **znovu načíst** — tier i `is_tester` se čtou jen při
      startu. Že to sedlo, pozná se podle **„(tester)" / „(prófari)"** za jménem tieru v panelu.

## Zjištěno při auditu — nespěchá, ale ať se neztratí

- [x] ✅ *(CODE-tune s CODE-read 2026-10-14: pre-commit pouští rychlé textové kontroly a zastaví jen vadu na staged souboru —
  DECISIONS 2026-10-14 (9), smoke ㊆.)* **Commit bez kontrol, které čtou měněný soubor — podruhé za dva dny (CODE-tune, §30 chce mechanismus).** 2026-10-12 zásady
      (㊽ a ㊱ shodily pre-push) a 2026-10-13 8c12069: změna `elevenlabs-proxy` shodila ㊸, protože jsem pustil jen vybrané kontroly.
      Větev je sdílená, takže commit dostane na origin i cizí push a červená pak blokuje všechny. Návrh: `commit_vlastni.py commit` sám pustí
      kontroly ze `scripts/`, které čtou měněné soubory (cesta souboru v jejich zdroji), a při červené necommitne. Nástroj je sdílený (CODE-tree)
      a zdrží commity všem — napřed domluvit s CODE-tree / ownerem.
      ✅ **Příčina nalezena a zavřena (CODE-read 2026-10-14, DECISIONS 2026-10-14 (1)):** 8c12069 svezl push CODE-read — přes HTTPS git
      přeloží větev na commit až PO pre-push, takže commit vzniklý během minut smoke odešel neotestovaný (reflog + pokus přes git http-backend).
      `hooks/pre-push.py` teď po smoke ověří, že se větev nepohnula, jinak push zastaví. Do téhož dne tu stálo, že pokus domněnku vyvrátil
      a cesta je nevysvětlená — první pokus běžel lokálním přenosem, kde se to nestane. Kontroly už při commitu (návrh výš) zůstávají otevřené
      jako jiná věc: chytily by vlastní chybu dřív, ale tenhle průchod nezpůsobily.
      ⛔ **Potřetí 2026-10-14 (CODE-tune):** 49db492 (nový `scripts/utils/is_greynir_cteni.js`) shodil ㊱ — dvě jména nástrojů IS na řádku;
      pustil jsem jen vybrané kontroly, které čtou `scripts/`, ㊱ mezi nimi nebyla. Push zablokoval mně i CODE-read (nahlásil, oprava
      e40fb75). Koordinace mechanismu mezi session nejde přes ownera (owner 2026-10-14: *„na tom se domluv s ním. co já ti mám říct?“*) —
      návrh poslán CODE-read.
- [x] ✅ *(ověřeno v DB 2026-10-15, CODE-read: zbývá jediná politika „Users manage own profile“)* ~~`user_profiles` má **dvě identické RLS policy** („Users manage own profile" a „own profile").~~
      Neškodí (permissive se sčítají), ale je to duplikát — jednu smazat.

---

## Meaning-tap: klik na význam runy zvýrazní, kde ve čtení žije (single + spready)

KUKY 2026-09-13 (při přestavbě životní runy): u single jde ťuknout na glyf → popup se jménem
a klíčovými slovy (`runar-rune-popup.js`, váže se na `.rlbl-glyph`). Chybí druhý krok: **klik na
jednotlivé klíčové slovo → ve čtení se zvýrazní místo, kde ten význam stojí; klik mimo zvýraznění
zruší.** Životní runa to dostane jako součást přestavby v3 (její prompt nově vyžaduje kánonová
slova doslova v textu → zvýraznění = prosté nalezení slova; žádné skryté značky — neprošly by ㉔).
Pro single a spready to chce VLASTNÍ rozhodnutí: texty čtení jsou obrazové a klíčová slova v nich
doslova stát nemusí — buď je prompt začne vyžadovat (mění charakter čtení → měřit), nebo se mapuje
jinak (u spreadů existuje JSON věta↔runa). Owner: „tohle by pak mohlo fungovat i pro single a
spready, ale to jen zapíšeme do backlogu. nechci dělat všechno naráz."

### Po odebrání řádku sezóny: model smí jmenovat cizí měsíc (2026-09-20, CODE-tune)
Řádek sezóny (v4.29–v4.32) nesl i brzdu „the image never carries weather that belongs to another
season". Po jeho odebrání (DECISIONS 2026-09-20 (3)) v promptu **nic nebrání modelu jmenovat
konkrétní měsíc nebo svátek** („when August comes", „around Midsummer") v jakoukoli část roku.
Banka obrazů to nepokryje: **72 ze 108** řádků je `any` a projde všemi šesti buckety.
Není to regrese proti stavu před 2026-09-19, ale je to otevřená díra. Řešení až po měření —
jestli se to na produkci vůbec děje (dřív než přidávat další pokyn, §25).

### Los délky není v prompt_draws — nezapsaný confounder každého měření (2026-09-20, CODE-tune)
`_lengthBudget` losuje mezi **3 věty / 38–45 slov** a **4 věty / 50–58 slov** (v2/runar-utils.js),
ale do `prompt_draws` se nezapisuje. Každé měření na produkci tedy míchá dva vzorky, kde jeden má
o větu a ~13 slov víc místa na konec — a post-hoc se to nedá odfiltrovat. CODE-read sám naměřil, že
délka rozhoduje, jestli most nahradí klidnou větu, nebo zbude věta navíc (RUNAR_EVAL_LOG 2026-09-20).
Oprava je jednořádková: substring proti `LENGTH_BUDGETS`, týž vzor jako `ending` v `_promptDraws`.

### RUNAR_DESIGN bod 4 (délka) — dořešit znění po v4.35 (2026-09-20, CODE-tune → CODE-read)
Bod 4 „Stavby Single čtení" říká „Délka: 4 věty; strop slov se nemění" a odkazuje na los délky.
Od v4.35 se **délka nelosuje** — `LENGTH_BUDGETS` má jednu položku (4 věty, 50–58 slov).
`prompt_draws.len` zůstává a je konstantní 0. Doc vlastní CODE-read; produkce je zdroj pravdy (§20).

## 2026-10-10 — Kontrola návštěvníka: co zbylo (CODE-tune, DECISIONS 2026-10-10 (16))
1. ✅ *(CODE-tune 2026-10-10, DECISIONS 2026-10-10 (18): owner „nahradit našimi glyfy“ → setRuneText, okna přes data-rune-glyph,
   soukromí ᚱ; hlídá smoke ㉻)* ~~**Runové glyfy písmem v popiscích:**~~ „ᚠ DRAW YOUR RUNE“ (`draw_lbl`), „ᚲ LET THE RUNES DECIDE“ (`random_btn`), „ᚢ HEAR RÚNAR
   SPEAK“ (hlas), „ᚠ ENTER RUNE READING CARD CODE“ (redeem). Cormorant runy nemá → prohlížeč půjčí cizí písmo; tentýž „divný“ tvar
   owner 2026-10-10 vytkl v Safn rúna (§5: glyf jen z RUNE_SVGS, výjimka jen ᚱ). Rozhodnout: naše SVG malé, nebo glyf z popisku pryč.
2. ✅ *(CODE-tune 2026-10-10: chyba se pozná i když ji klient vrátí místo vyhození — do té doby vypadala jako prázdný deník, „zatím
   žádná čtení“; už načtená čtení zůstanou, jinak hláška `journal_load_err`. V prohlížeči ověřeno s podvrženou databází: chyba
   vrácená, vyhozená, po úspěchu, úspěch, návštěvník — EN i IS.)* ~~**Deník: chyba načtení ukáže přihlášenému bránu návštěvníka.**~~
   `loadJournal` v `catch` volá `hideJournal()` → „You walk here as a Visitor…“ i Rune Seekerovi, kterému jen spadlo spojení.
3. ✅ *(CODE-tune 2026-10-10: UI_TEXT `sp_journal_link`, `sp_delete_account`; po cestě i počet v deníku `journal_count_*`
   a věta `tree_carry_life_rune` — znění beze změny, vykreslení před a po v EN i IS shodné. Všechny tři utekly smoke ㉸: ta hledá
   jen `lang === 'is' ?`, ne zkratku `isIs ?`/`is ?` → předáno CODE-read (jeho kontrola). Zbývá takových míst: text promptu
   v `runar-character.js` (měsíc narození na hraně, ~ř. 1492–1498) a značky promptu, podle kterých admin rozkládá složení čtení
   (`runar-utils.js` ~ř. 321–407 — opisují text builderu, při jeho změně se rozpad tiše rozbije).)* ~~**§10 v bočním panelu:**~~
   `updateSidePanel` má natvrdo `is ? '✦ LESTRAR MÍNIR' : '✦ MY JOURNAL'` a `'× EYÐA REIKNINGI' : '× DELETE ACCOUNT'` (`runar-app.js`).
   ✅ *(CODE-tune 2026-10-10, DECISIONS 2026-10-10 (29): `vn()` s islandskou shodou po 21, 31…, `VOCAB.reading`, štítek „síðustu {n}“;
   korpusem ověřeno, v prohlížeči 1/2/5/11/21 × tiery × jazyky.)* ~~**Počet v deníku pro 1 čtení:**~~ „1 lestrar“ / „1 readings“ a štítek
   posledních čtení jako kalk (`journal_count_*`) — islandsky i anglicky špatně; `vn()` uměl jednotné číslo jen pro 1.
4. ✅ *(CODE-tune 2026-10-10: text tlačítka určuje `_speakBtnKey()` podle stavu výkladu, volá ji `_updateReadingForm` pro všechny
   výklady. V prohlížeči ověřeno ve všech čtyřech výkladech: po přepnutí jazyka „DRAW YOUR RUNES“/„ADD RUNE“ místo „HEAR RÚNAR SPEAK“;
   bez přepínání, u plného výkladu i u návštěvníka beze změny.)* ~~**§14 u tlačítka tahu:**~~ `updateUIText` při každém přepnutí jazyka
   nastaví `btn-speak` na `speak_btn` („HEAR RÚNAR SPEAK“) — ve spreadu, kde ještě chybí runy, má stát `speak_btn_draw` („DRAW YOUR RUNES“).
5. ↩ *(2026-10-10 večer VRÁCENO, DECISIONS 2026-10-10 (30): návštěvník má zase formulář — 2a3f03b „rovnou k tahu“ owner chtěl
   vrátit celé, CODE-tune opravil jen Norny a fotku.)* **Formulář návštěvníka:** návštěvník čtení nedostane, formulář se ho přesto ptá
   na jméno a „jak tě má Rúnar oslovovat“ (oblast/hledání/záměr má zamčené). Dál otevřené jen spolu s bodem 8 (čtení pro návštěvníka).
6. ✅ *(CODE-tune 2026-10-11: `setRuneText` na všech místech a shrine ve smoke ㉻ — položka „Journal SPREAD historie“.)* ~~**Shrine: runy písmem.**~~ `teach_select_lbl` „ᚠ SELECT RUNE“, `teach_next_btn` „ᚠ TEACH ANOTHER RUNE“ a tlačítko hlasu v učení
   (`voice_btn*`, v `runar-shrine.html` přes `textContent`) mají runu dál písmem. Admin, nespěchá; oprava = `setRuneText` na těch
   místech a shrine přidat do smoke ㉻ (dnes ho záměrně vynechává).
7. ✅ *(CODE-tune 2026-10-10: UI_TEXT `signed_out_toast`, IS „ÞÚ HEFUR STIGIÐ ÚT ÚR HRINGNUM“ — korpus „stigið út úr“ 427,
   „út úr hringnum“ 116; bez rodu.)* ~~**Toast při odhlášení natvrdo anglicky:**~~ `showToast('YOU HAVE LEFT THE CIRCLE')` i v islandské appce.
   ✅ *(CODE-tune 2026-10-10: zkontrolováno novým `is-gpt-check.py` — 18 textů, 4 nálezy posouzené: 3 opravené v zásadách („Gögnin sem
   við geymum eru innan…“ místo dvojznačného „helst“, „gert ópersónugreinanlegt“, „Svo enginn fari yfir hámark á mánuði“ místo kalku
   „mánaðarlegar heimildir“), 1 ponechaný záměrně („það sem það ber“ = hlas appky, „Hvað ber nafnið mitt?“); opravy znovu čisté.)*
   ~~**Dlužná kontrola Yfirlestur:**~~ 2026-10-10 byla služba nedostupná (is-grammar-qa „NEZKONTROLOVÁNO“) pro nové islandské věty —
   `signed_out_toast`, `journal_load_err` („Ekki tókst að sækja spárnar þínar — athugaðu nettenginguna og reyndu aftur.“) a v zásadách
   soukromí věty o záloze na Google Drive (Supabase „…að undanskildu öryggisafritinu sem lýst er hér að neðan“ a celý odstavec Google,
   lhůta „Hverju afriti er eytt eftir 30 daga…“, výmaz „…úr dulkóðuðu öryggisafritunum okkar innan 30 daga“) a celá tabulka „Hvað er
   geymt“ (úvod + 6 nových řádků + opravené Fjöldi lestra / Inneign / gert nafnlaust).
   Ověřeny jen korpusem (obraty s doklady v komentáři patche) a vzorem nasazených vět. Pustit kontroly IS podle CLAUDE.md §2 (do 2026-10-10 tu stálo is-grammar-qa — API zaniklo, DECISIONS 2026-10-10 (39))
   znovu; flag = přepsat.
8. ❓ **Čtení pro návštěvníka (čeká na ownera):** owner 2026-10-10 *„text je pro nás v pohodě, ať dostane čuchnout bez registrace…
   ASK bude zobrazen taky jen jako teaser“*. Vrací rozhodnutí 2026-08-02 „Fáze 1“ (proxy pro nepřihlášené zavřená: anonym posílal
   modelu libovolný prompt bez omezení — „nechci to mít děravé“), tedy jen očištěně (§26). Varianty:
   **A — živé čtení přes proxy:** nový omezený mód pro nepřihlášené; server musí prompt sestavit sám nebo ho přísně ověřit (builder je
   dnes jen v klientovi), limit na IP + denní strop, bez deníku a hlasu. I se stropem zůstane otvor: kdo prompt podvrhne, spálí strop.
   **B — hotová čtení (doporučuje CODE-tune):** pro každou runu a jazyk 2 čtení předem (týž builder, oslovení þú/you, bez voleb),
   uložená jako data; návštěvník dostane jedno k tažené runě. Žádné volání modelu, žádný otvor, kvalitu vybereme. Potřeba: ownerovo ano
   na generování (~100 volání, §30). Pak karta po tahu = text čtení + teaser hlasu + teaser Asku (stejné provedení jako teaser Asku
   u Rune Seekera: funkce vidět celá, zamčená, pod ní řádek „opens with {tier}“) + výzva k registraci.

## Web therunekeeper.com (CODE-web, od 2026-10-12)
- [ ] **Registrace před spuštěním** (owner 2026-10-12: *„ano sbíráme“*). Landing „coming soon“ sbírá e-maily; každý dostane jeden
  e-mail, až Rúnar půjde ven. Napřed plán ownerovi (kam se ukládá, dvojí potvrzení, text do zásad soukromí, smazání po spuštění).
  API klíč Brevo: secret `BREVO_API_KEY` v Supabase (owner 2026-10-12, ověřeno). Hosting landing page teď (owner: „zatím A“):
  samostatné malé veřejné repo jen s webem na GitHub Pages, zdroj zůstává ve `web/`. Denní limit Brevo (RUNAR_PRICING, řádek Brevo)
  sdílí registrace s přihlašovacími kódy; rozeslání všem při spuštění se do něj nevejde — owner: *„musím vyřešit větší počet e-mailů“*.
  Útok pro smoke ㉹ na `web/` (čeština v HTML) přidat do `scripts/protipriklady.py`, až bude ve `web/` první soubor v gitu — `create`
  netrackuje a kontrola čte jen git; ručně ověřeno 2026-10-12 přes `git add -N` (FAIL na „Tady je náhled stránky“).
- [ ] **Pro OWNERA — Rapyd** *(owner 2026-10-12: totéž co Shopify — dodělá se, pak JEDEN souhrnný postup)*: smí účet Agndofy prodávat přes Rapyd Hosted Checkout / odkaz k platbě na therunekeeper.com, a jaký tarif
  má Shopify Agndofy (u cizí brány Shopify bere příplatek, Basic 2 %)? Rozhodne, jestli Rúnakort půjde přes Shopify, nebo rovnou Rapyd.
  Fyzické runy jdou přes Shopify vždy. Kupovat jde pět balíčků (`CARD_PACKS`).
- [ ] **Obchody před spuštěním** (rešerše CODE-web 2026-10-13; poplatky a provize v `RUNAR_PRICING.md` „PWA vs Native App“, platby v iOS
  → DECISIONS 2026-10-13 (3), rozhoduje owner). Android: táž PWA zabalená přes Trusted Web Activity (Bubblewrap) + ověřovací soubor Digital Asset Links (assetlinks)
  na doméně appky. Účty pod Agndofa ehf. potřebují D-U-N-S (Apple i Google). iOS: když appka nabídne přihlášení Googlem, Apple podle
  pravidla 4.8 chce i rovnocenné přihlášení (prakticky Sign in with Apple) — přesné znění 4.8 neověřeno. Jméno: v obou obchodech už je
  „Runar: AI Chat & Runes“ (runar.app, AI věštění z run) a na Google Play „Runar“ (com.tnco.runar) — název v obchodě musí být jiný,
  ochrannou známku owner řešit nechce (2026-10-13). Odznaky obchodů na webu až s živou appkou, jen oficiální soubory.
- [x] ✅ *(CODE-web 2026-10-14: patička © · e-mail · odkaz na zásady, kde stojí adresa a kennitala (CODE-tune d0bc678); zásady
  doplněné o registraci; web žádné cookies nemá. Zbývá jen VSK do zásad, až ho owner bude vědět.)* **Landing — právní minimum** (2026-10-13): patička s údaji firmy podle zákona 30/2002 (jméno, adresa, e-mail, kennitala, VSK —
  údaje dodá owner; přesný článek zákona nestažen, althingi.is 403), věta o účelu u formuláře + odkaz na zásady, zásady doplnit
  o registraci na webu. Cookie lišta jen když přibude analytika (zákon 70/2022; landing žádné cookies nemá).
