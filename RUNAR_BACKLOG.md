# RUNAR_BACKLOG.md
# Sledovaný seznam POZASTAVENÝCH věcí, ke kterým se máme vrátit.
# Pravidlo (owner 2026-07-04): co pozastavíme, sem zapíšeme + trigger návratu — ať nic nevisí bez povšimnutí.
# Hotové → odškrtnout (✅ / [x], zamítnuté ✖); položky starší 48 h přesune doslova do docs/archive/RUNAR_BACKLOG_hotovo.md
# `python -X utf8 scripts/utils/backlog_uklid.py --zapis <lane>` (owner 2026-10-12: „neni ten backlog moc velky?“). uz_vime.js archiv prohledává.

---

## Čtení a islandština — co zbývá (prompt prakticky hotový, owner 2026-10-12)
- [ ] **Kontrola promptu tvorby čtení před spuštěním — 2026-10-16 (CODE-read)** (owner: *„jakákoliv další velká kontrola je vítána…
  chceme vychytat všechny mouchy“*). Celé nálezy s řádky a hotovými ověřenými IS opravami: `docs/inbox/2026-10-16-kontrola-promptu.md`.
  - ✅ *(CODE-tune 2026-10-16: krize v Asku hotová — v5.10, výjimka v pravidle „mimo téma“, EN + IS.)*
  - ✅ *(CODE-tune 2026-10-16: A2 hotovo — islandský systém v5.12 (blok never bez kalků, pravidlo 2. osoby, množné číslo, ÁVARP,
    pravopis) a buildery v5.13 („Slepptu“, „rún“ místo „rúna“, Kříž „flæði“, „til Heljar“, štítky Podkovy a Yggdrasilu, „í textanum“,
    „SJÓNARHORN“, kveðjuorð v Asku). Vědomě vynecháno: „Verðu → Vertu“ („verðu“ je správný rozkaz od „verða“ = EN „become“), „dregnar“
    a „öðru hvoru“ (podklad sám: odložené / vědomý duál), štítek „hvað er inni í þér“ (část B). Zbývá: A2.19 (do HOW YOU SPEAK IS
    přibývají pravidla = změna chování, změřit) a A3. Žlutě, beze změny (§19.2): v IS Asku pokračování věty o rozloučení za pomlčkou
    (výčet bez slovesa — Greynir E005, P_NT_ÍTölu) a v neaktivním profilu „lyrical“ výčet za „eins og“ (P_NT_ÍTölu).)*
  - [ ] **CODE-tune — opravy (A):** krize v Asku: pravidlo „mimo téma neodpovídej“ přebije větu o 112 (vysoká) · 19 islandských chyb
    v živých promptech (mj. „Sleppu“ → „Slepptu“ v každém IS single, chybné pravidlo 2. osoby v IS systému, „rúna“ × „rún“, Kříž „einum
    flæði“, Yggdrasil „til Heljar“, kalky v bloku „never“) · Ask v IS povoluje přesah 90 slov (useká se) · „pro někoho“ oslovuje rodem
    majitele účtu · single „Let X answer“ zve k předpovědi · životní runa a jméno dostávají „popiš obraz“ bez obrazu · EN esence × „Mention
    by name once“ · technické (dvojité mezery, „PERSON: you“, korekce za pokynem JSON, ✦ nový řádek × „no breaks“) · proxy `SOL_EFFORTS`
    `minimal` neexistuje (ověřeno) · známé duplikáty „Respond in English.“.
  - [x] ✅ *(CODE-tune 2026-10-16, v5.14: všech 12 oprav, Greynir znovu bez nálezu; 15 podezření beze změny.)*
    **CODE-tune — islandské obrazy (A4, owner *„zkontrolovat všechny IS obrazy“*):** 189 obrazů + 12 míst prošlo; 12 skutečných chyb
    (mj. Uruz „hráur kraftur“ → „hrár“ i v `k_is` a ve zlatém snímku, Sowilo „brýst“, Kenaz „kveikt á eldspýtu“, Isa „ísi lögð“, Jera
    „daginn lengir“) a 15 podezření; opravy hotové a ověřené v podkladu, část A4.
  - **Owner 2026-10-16 k části B** (DECISIONS 2026-10-16 (3)):
    - [x] ✅ **Studené čtení — definice** schválená ownerem 2026-10-16 (*„10. ano“*) → `RUNAR_DESIGN.md`, sekce „Cold reading“.
    - ℹ **Data 2026-10-20 (CODE-read, produkce od 2026-09-24, bez odhlášených): jen 2 Horseshoe + 2 Áttaviti.** (e) ve v5.08 (11. 10.) 0/2 —
      „Inner state“ vyšlo obrazem (ryba z ruky do ruky), „subconscious“ otázkou ve scéně; IS Áttaviti 16. 10. čistý obraz; tvrzení o nitru jen
      ve starém Horseshoe v4.77 (29. 9.). (a) 1/4 — Áttaviti 11. 10. začíná vymyšlenou scénou ze života („At the meeting, an empty chair…
      You stand up for…“). Bez srovnání (věta (a) je ve všech promptech) nerozhodne; owner sleduje v čteních testerů, API pokus nenavržen.
    - [ ] **Potenciální vada (sledovat v testování) — štítky pozic žádají nitro:** Podkova pozice 6 „Inner state (what lives inside)“ /
      „Innri staða (hvað er inni í þér)“ (`runar-character.js:2458`, `:2443`), Kříž „what lies in the subconscious“ (`:2273`, `:2255`).
      Owner 2026-10-16: *„záleží na tom, jak to zní ve čtení… nemůžeme měnit všechno jen kvůli tomu, že to jako nevypadá dobře. musí to potvrdit
      čtení… zapiš to jako potenciální vadu. buď se objeví, nebo ne.“* Měnit jen, když čtení ukáže tvrzení o člověku podle definice v DESIGN.
    - [x] ✅ *(CODE-tune 2026-10-16, v5.11: `_intentionContext` jen v single, ve čtyřech spreadech pryč; nápověda „+“ u „This reading is
      for“ EN + IS „jen pro jednu runu, spready mají svůj čas“ — IS Greynir OK.)* **CODE-tune — spready bez časového rámce** (owner: *„celkově u spreadů vynechat… všechny časové tvary pro spready ignorovat, jelikož
      mají svůj tvar. a pro „this reading is for“ dopsat poznámku, že platí jen pro single čtení“*): `_intentionContext` (a jiné časové
      rámce) ve spreadech nevkládat; u `intention_lbl` / IS v UI poznámka „jen pro jednu runu“ (EN + IS, §2, §31).
    - [ ] **Otázka ve spreadu** (owner: *„to by měla a je potřeba to testovat“*): spread ji má jen v hlavičce bez pokynu. CODE-read napřed
      lab (pokyn + malý vzorek), pak CODE-tune.
    - [x] ✅ *(CODE-tune 2026-10-16: updateQuestionGate = isAdmin; ověřeno v prohlížeči — admin pole vidí v každém tarifu, Premium,
      Standard, Rune Seeker ani návštěvník ne; čitelnost ㊽ a základ produkce ㉼ OK.)* **CODE-tune — pole s otázkou jen pro admina** (owner 2026-10-16: *„pole s otázkou jen pro adminy. nikdo jiný. není to vyladěné.
      je to featura do budoucna“*; DECISIONS 2026-10-16 (5)). Dnes ho vidí Standard a Premium, tedy i testeři (`updateQuestionGate`,
      `runar-auth.js`: `canAsk = standard || premium`). Pozor na základ produkce (§32) a souhlas s otázkou (㊽).
    - [x] ✅ **Test „pravidlo v systému × v user promptu“, EN** — 2026-10-16: systém 5/5 = user 5/5, kontrola 0/5 (RUNAR_EVAL_LOG
      2026-10-16 (1)); CLAUDE.md opraven. IS a pravidlo proti protichůdnému pokynu zatím neměřeno.
    - [ ] **Pravidlo v systému × PROTICHŮDNÝ pokyn v user promptu — testuje OWNER v reálných čteních, ne lab přes API** (owner 2026-10-20:
      *„to zkoušet nebudeme … čtení teď prochází přes testery u reálných čtení, takže to budeme kontrolovat tak“*). Owner dostal otázky
      (budoucnost ano/ne do pole s otázkou a do Asku, EN i IS); znak vady = předpověď („it will“, ano/ne, časový slib, záruka). Výsledek
      → hlášení z appky / zpráva ownera; teprve s vadou v ruce oprava `qBranch` („Let <runa> answer“, runar-character.js) nebo Ask pravidla.
      Původní zadání: (owner 2026-10-16: *„zapsat. teď to funguje, tak neměním, ale
      otestujeme to“*). Co to je: test 2026-10-16 měřil pravidlo, kterému nic neodporovalo. V promptu ale jsou místa, kde systém říká jedno
      a user prompt pod ním něco, co táhne jinam — tam rozhodne, který z nich model poslechne (výklad červnového nálezu: vyhrál konkrétní
      pokyn na konci). Test: na jednom takovém místě dvě ramena (dnešní znění × user pokyn sladěný se systémem), malý vzorek, měřit, které
      pravidlo vyhrálo. Kandidáti (z aktuálního EN single promptu 2026-10-16):
      1. Systém „Rúnar never predicts fate / does not guarantee outcomes“ × user „Let Kenaz answer: <otázka>“ — u otázky typu „Will it
         work out?“ zve k předpovědi; vedle stojí „Neither confirm nor refute.“ (oprava v A3.3 u CODE-tune — test napřed, nebo na jiném místě).
      2. Systém „Never hand the seeker a conclusion“ × user konec „End on one line that holds out two things this may be in a slow change in the
         seeker“ a u oblasti „Do not tell them how they have changed — except in the closing line“ — povolená výjimka (změřeno, owner
         potvrdil „most may be“); test jen ověří, že výjimka nepřetéká do vět před koncem.
      3. Systém „LANGUAGE & STYLE — check every sentence before returning“ × user „return ONLY this JSON array, nothing before or after“ —
         kontrola nemá kde proběhnout (sol bez přemýšlení; V3 bod 3).
    - [ ] **Místa v promptu k pozornosti (žádný změřený přínos, nebo dvojznačné; owner: *„zjistit další místa, která by si zasloužila
      pozornost“*):** (a) „The image must connect to where this person is standing right now“ — nikdy netestováno, LAB 2026-10-05 doporučil
      vyndat (bod 8; podezřelá z přenosu do života ve větě 3) · (b) „Neither confirm nor refute.“ u hledání Confirmation proti otázce ano/ne —
      co model udělá, když člověk potvrzení výslovně chce · (c) „down to one detail the sentence does not name“ — „the sentence“ je
      dvojznačné (věta obrazu, nebo věta čtení?) · (d) „through image and symbol“ u otázky — „symbol“ zve k mystice, kterou systém zakazuje
      („Avoid abstract, mystical-sounding lines“) · (e) délka stojí v promptu dvakrát (uprostřed a na konci) — záměr (připomínka, Opus −8 slov),
      nechat · (f) štítky pozic „what lives inside“ / „subconscious“ — potenciální vada výš. Každé až s měřením, ne přepisem naslepo.
    - IS osy Kříže „verdandi/skuld/urd“ — zatím bez rozhodnutí.
    - [ ] **Pro V3 — rozpracováno níž** (owner: *„dobré zkusit pro V3, kterou máme už mírně rozpracovanou. zapsat to. celé to rozpracuj, ať je
      čeho se chytit, ale řešit to budeme později“*).
  - **V3 = přestavba promptu s méně zákazy** (owner 2026-10-16: *„měla to být verze s méně zákazy podle definice, jak se tvoří takový
    charakter. hledali jsme o tom hodně informací a asi je to zase ztracené“*). Dohledáno 2026-10-16 pod jinými názvy: **„LAB přestavby
    promptu“** — výtah změřeného + 7 závěrů + metodika: `memory/snapshots/2026-10-05-lab-co-uz-vime.md` (owner 2026-10-05 *„to budeme celé
    předělávat“*; připraveno, nezačato) · **„Prompt × návody výrobců“ 2026-10-04** (Anthropic Opus 5, OpenAI GPT-6): `docs/archive/RUNAR_BACKLOG_odlozene.md`
    (body 2, 4–8) a `docs/archive/RUNAR_BACKLOG_hotovo.md` (1, 3) · dnešní kontrola: `docs/inbox/2026-10-16-kontrola-promptu.md` (B6).
    Jinou rešerši „jak se tvoří charakter“ jsem v konverzacích ani docs nenašel (hledáno: méně zákazů, charakter, persona, přestavba,
    kladné pokyny, V3) — pokud existovala v Cowork, je ztracená.
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
    10. **Nová volba vedle AREA: „How I feel“** (owner 2026-10-26, hypotéza: *„jako máme AREA, tak by bylo how I feel — pod ním by byli třeba tired, lonely atd. … impuls pro Rúnara tomu přizpůsobit výklad“*; zapsat: *„12. ano“*). Co: člověk vybere, jak se teď cítí, a Rúnar podle toho upraví podání čtení · proč: materiál tazatele projekci poctivě kotví a co člověk sám zadal, smí Rúnar říct (DESIGN „zrcadlo“, „Cold reading“ definice bod 3) · jak: lab, až bude stát stavba v3; měřit, co volba ve čtení změní · rizika: přitakávání (Ask „Do not mirror the seeker“, tip „Does this confirm what I already feel?“ odstraněn DECISIONS 2026-10-06 (13)) · smutek a osamění blízko krize (pravidlo 112 v charakteru) · překryv se SEEKS (co člověk hledá) — rozhodnout, jestli vedle sebe, nebo místo.
Owner 2026-10-12: *„prompt už je prakticky hotovo. takže pozor na to, co tam leží.“* Výzkum a nápady k promptu, obrazům, Asku a Vegvísiru
(dřív „Reading quality“, nálady, HANDOFF57, audity obrazů, Vegvísir, testy „obrazy se potkávají“ a prompt z „Nálezů z workflow“) leží doslova
v `docs/archive/RUNAR_BACKLOG_odlozene.md` jako ⏸ — nejsou to úkoly. Vrací se, až se vada objeví v nových čteních a owner na ni upozorní
(CLAUDE.md §30); `uz_vime.js` je najde.

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
- [ ] **`SEASON_POOLS` — 133 obrazů v kódu, do čtení se nedostanou** (`v2/runar-character.js`; ověřeno protlačením 2026-09-08,
  CLAUDE.md „Obraznost“): mrtvá data, udržovaná dvojjazyčně. S hotovým promptem spíš odstranit (CODE-tune). Zbytek původní položky
  (Sowilo zimní obraz, losy ve spreadech) je v archivu odložených.

### ✅ Mrtvý řetěz V2 charakteru — smazán 2026-10-12 (CODE-tune; nalezeno 2026-08-15)
`DEF_CHAR_V2_EN` (druhá úplná kopie popisu Rúnara, rozešlá s produkcí od `8e14f74`) a s ním `buildSysPromptV2`, `getContextLine`,
`buildLifeRuneContext`, `_getLunarPhase`, `_getIcelandicSeason`, `_getTimeOfDay`. Produkce ani shrine je nevolaly; poslední volající,
tři srovnávací skripty `compare_*` (nefunkční, 401), šly pryč s nimi. Prompty beze změny (golden); kontrola ㉦ přišla o krok, který
hlídal jen V2 cestu.

## Profil / personalizace

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
- [ ] **Teach ve shrine platí statický hlas dvakrát** (nalezeno 2026-10-11 CODE-tune při mapování cest hlasu, DECISIONS 2026-10-11 (61)):
  náhled jde přes elevenlabs-proxy, „SAVE VOICE TO MEMORY“ ho přes elevenlabs-static vygeneruje znovu → 2× kredity ElevenLabs za každé
  audio Kolekce. Uložení může vzít audio z náhledu (funkce je jen pro admina; upload místo nového volání EL).

## Multijazyčnost

## i18n / prevence uvízlé angličtiny

- [ ] **data-i18n atributy (architektura)** — nejrobustnější prevence uvízlé angličtiny v IS: element si nese `data-i18n="key"`, generický loop v `updateUIText` aplikuje `t()` → wiring se **nedá zapomenout**. Dnes se dynamické stringy musí ručně napojit v `updateUIText`/render funkcích → snadné vynechat (série stuck-EN fixů 2026-07-06: reading form, greeting, teasery, mode buttons, „or", journal filtry…). Refaktor střední velikosti: data-i18n na statické UI + generický apply, postupně nahradit `setText` volání.

## Struktura / refaktor


## Tree — pozastavené signály + vrstva významu (konsolidace 2026-07-30)
> Přeneseno sem z archivovaných tree doků (`docs/archive/tree/`: RUNAR_TREE_TODO · RUNAR_TREE_SPECIALS · runar-patterns · runar-tree-forces · placement · tree-of-life · BUILD), ať živé nápady nezmizí. Kanonický model + signály = `RUNAR_TREE.md`. Nic z níže uvedeného není v kódu; **nic se nestaví bez probrání s KUKYm.**

- [ ] **Strom v aplikaci po portu (CODE-tree, ladí se s ownerem na jeho čteních):** kreslení na pozadí po čtení + uložený obrázek (sem sloučena i položka „překreslení je drahé“ z 2026-08-10, triáž 2026-10-12, CODE-tree)
  (DECISIONS 2026-10-11 (35)) · zlaté obtažení větvičky čtení na posuvníku · posuvník při pozdním založení (zakládací Norny jdou první,
  datum u kroku 2 skočí zpět) — DECISIONS 2026-10-11 (55).
- [ ] **Strom: souběhy větví (překryvy)** — **stav** (triáž 2026-10-12, CODE-tree): po ramenech a portu na jeho stromě z produkce (471 čtení) 3 souběhy (`tree_overlap.js`): Wunjo × Gebo 29 px a Wunjo × Eihwaz 29 px (obojí vpravo nahoře), Uruz × Perth 62 px (vlevo nahoře); modelové stromy po ramenech nepřeměřeny. Sloučeno s položkou o shluku nahoře vpravo. Historie: **Strom (lab): souběhy větví na modelových stromech** (CODE-tree, 2026-10-03, DECISIONS (15), (16)). Na 24 modelových stromech (`ovtypes`) 158 souběhů (ráno 250, s „koštětem“ 49 — tvar ramen, který KUKY odmítl). „Povýšená podél matky“ vyřešená (146 → 18, DECISIONS (16); nepomohlo: dřívější odštěpení, úhel od špičky matky, menší zdvih špičky povýšené). Dvě ramena na stejné straně 74 → 21 (DECISIONS 2026-10-05 (4)); všech souběhů 62. **Zbývá:** dvě ramena na stejné straně (21), povýšená + povýšená (16), povýšená + jiné rameno (15). Každý kandidát změřit oběma směry páky + `scripts/utils/tree_render.js` (KUKYho strom i modelový), tvar ramen z kmene NEMĚNIT. Na KUKYho stromě dnes žádný (dvě mělká křížení, obě větve vidět).
- [ ] **Strom: popis větve Rúnarovým hlasem — směr schválen, zatím koncept** (CODE-tree, 2026-10-09; DECISIONS 2026-10-09 (14)). KUKY:
  *„tohle je směr. Rúnarovým hlasem to bude znít jinak, ale zkus to“* · *„není až tak důležité, kolikrát člověk dostal nějakou runu … může to
  spíš určovat pořadí, v jakém bude výklad těch run jako jednoho spojení … jako takový spread. jde o ten význam run“* · zvířata stromu
  *„spíš nad plán, budeme je zkoušet“*. Pravidla: kotví na tom, na co se člověk ptal (oblast, záměr); počty se neříkají, četnost určuje
  pořadí run ve výkladu; zvíře jen podle kánonu (`RUNAR_DESIGN.md` „Bytosti“); do aplikace přes CODE-tune/Cowork v EN i IS.
  KUKY 2026-10-09: *„bude to chtít nějakou práci, aby to znělo dobře … zapíšeme to jako směr. teď používáme pro výklad GPT sol 6, takže to
  bude znít jinak než Opus“* — koncept psal Claude; skutečný popis by psal model výkladu (dnes GPT-6 sol), ladit se musí na něm.
  KUKY 2026-10-10: *„větší počet spíš dává větší váhu ve čtení. jelikož je dominantní, je to čistě hypotéza! je potřeba to zkusit na čteních.
  dokud nejsou čtení pořádně otestovaná, nic není takhle to bude.“* → četnost = váha (dominance) runy ve výkladu, ne jen pořadí; hypotéza k ověření.
- [ ] **Strom (lab): `AREA_LAT` odporuje „oblast = strana“** (CODE-tree, nalezeno 2026-10-09). **Stav** (triáž 2026-10-12, CODE-tree): lab má vlastní `AREA_LAT` srovnanou s kánonem (Love −0,2, Crossroads 0, Spirituality +0,5; čte ji `sideOf` a `latOf`), engine `runar-branch.js` drží starou (Love −0,75, Spirituality −0,20, Crossroads +0,10) a řídí jí natočení větviček při kreslení (`spec.area`). Pořád dvě kopie téže informace (§20) — srovnat engine s labem s golden-verify kresby. Původní text: Tabulka v `runar-branch.js` (sdílená
  s aplikací) bere Love −0,75 (nitro), Spirituality −0,20 (skoro střed), Crossroads +0,10 — kánon (`RUNAR_TREE.md` §3) má Love a Crossroads
  bez strany a Spirituality ve světě. Čte ji strana větvičky (`sideOf`), natočení ramene za čteními (`latOf` / `areaSide`) i lateral
  větvičky v enginu. Druhá kopie téže informace (§20) → srovnat s `SIDE_A` ve `stableAssign`, s golden-verify kresby.
- [ ] **Strom (lab): záloha výšky bez záměru — jen kdyby svět runy neseděl** (CODE-tree, 2026-10-09; nízká priorita, nestavět bez ownera).
  Dnes: čtení bez záměru dostane výšku podle světa runy (Hel dole, Midgard střed, Asgard nahoře). Druhá možnost, kterou owner chce mít
  po ruce (KUKY: *„už máme vytvořenou zálohu pro případ, že mi to nebude sedět“*) = zóna, kde je strom zatím nejslabší (roste od zóny
  k zóně). Nepostavená, jen popsaná; DECISIONS 2026-10-09 (10).
- [ ] **Lab: mrtvé úhly povýšených z vějíře** (CODE-tree, 2026-10-03; ověřeno 2026-10-12: `_GANG` se pořád jen zapisuje). V časové smyčce `build_crown_composer.py` se pro povýšené počítá strana a cílový úhel (`gIx`, `gN`, `gSv`, `gSl`, `gZ`, `gSd`, `gS0`, `liveG`, `tgA['g'+j]`, `gAngQ` → `_GANG`) a nic to nečte — úhel povýšené bere `growGrad` od směru matky (`_GTURN`). Smazat s golden-verify (stejná kresba na KUKYho a modelových stromech).
- [ ] **Lab RŮST: „expanze šířka / mohutnost“ ukazuje mrtvé hodnoty** (CODE-tree, nalezeno 2026-10-03 při mapování; ověřeno 2026-10-12: `effCanopy` a `girth` dál nikdo nečte). `wExp` a `mExp` se spočítají (`effCanopy`, `girth`) a nikde se nepoužijí (`RUNAR_TREE_MAP.md` §2). Buď zapojit (co mají velké spready vody/země a stínu na stromě znamenat, rozhodne owner), nebo z RŮST vyřadit.
- [ ] **Fotorealistická kůra = WebGL, vlastní projekt (rozbor 2026-08-10).** KUKY chce obojí — kresbu i fotografii. Kresbu řeší „kůra ze stavby" (`hrebeny` + `tonPramene`, viz RUNAR_TREE.md). **Fotografii 2D plátno neumí**: textura potřebuje plochu a canvas kreslí siluetu, takže se dlaždice drží obrazovky a čte se jako nálepka (ověřeno a vráceno 2026-08-10). Cesta je **UV mapování na pás trojúhelníků ve WebGL** — strom jako geometrie s materiálem kůry, stínování i textura per pixel. Není to posuvník, je to přepis rendereru; zatím jen v labu, produkce běží na telefonech.
- [ ] **`readings.spread_data` je MRTVÝ SLOUPEC** (`sql/spread_data.sql` ho zavedl pro více-runové spready; ověřeno 2026-10-12: ve `v2/` ani v edge funkcích ho nikdo nečte ani nepíše — jediný záznam, duplikát CODE-read je v archivu odložených). **Nikdo do něj nezapisuje a nikdo ho nečte.** Strom si tažené runy místo toho skládá z textu: `readingsToTreeLog()` (`v2/runar-tree.js`) prochází `rune_glyph + short_text` a sbírá známé glyfy. **Funguje to** — u single čtení je `rune_glyph` první a bere se jen `runes[0]`, u spreadu je `short_text` = vygenerovaný seznam `"ᚠ FEHU · ᚢ URUZ · …"`, ne próza. ⚠️ Úzké riziko: kdyby u single čtení chybělo `rune_glyph`, vzal by se první glyf z **modelem psané prózy** jako tažená runa. **Levný pojistný krok:** u single číst výhradně `rune_glyph` a `short_text` vůbec neprocházet. **Volitelně** pak `spread_data` buď naplnit strukturovaným seznamem run při zápisu (a strom odvázat od textu úplně), nebo sloupec zrušit.
- [ ] **Váha větve = počet vyplněných polí** (area/intention/seeking). Víc kontextu = záměrnější čtení = mohutnější/výraznější větev; prázdné rychlé single = drobná větvička. Signál §4 „počet vyplněných polí → VÁHA", v kódu zatím není. (KUKY k tomu byl vlažný — jeden ze signálů síly, klidně vyřaditelný.)
- [ ] **Strom = jádro Rúnara / čtení v čase / potenciál samostatné appky** (KUKY 2026-08-02, vize). Přidaná hodnota = strom v čase (databáze osobnosti). ⚠️ Platí až s retencí + dost čteními (strom musí ohromit brzo); standalone = hypotéza, teď neřídí stavbu. Detail → RUNAR_DECISIONS 2026-08-02.
- [ ] **Čtení TVARU stromu = speciální výklady** (KUKY 2026-07-30, směr). `detectPatterns()` nad journalem čte výsledné rozložení, ne jen opakování run: **strana** (víc vpravo/vlevo → ven/dovnitř) · **výška** (vysoká koruna × hluboké kořeny → budoucnost × minulost) · **šířka** (pestrost × soustředění) · **náklon + holá místa** (nerovnováha, „od kmene" — RUNAR_TREE.md §1). Data už v journalu; chybí jen logika čtení. Vrstva Gathering (RUNAR_TREE.md §7), NE engine kreslení.
- [ ] **Prahy + okna pro `detectPatterns()`** (spec, dřív `runar-patterns.md`). Okno `PATTERN_WINDOW` {high 7, mid 14, low 30 dní}. **Korunní (Orel):** 3+ táž runa · 4+ týž element · stejná area 5+ · návrat runy po 6+ měs (HIGH) · protiklady (flood_fire / roots_in_wind) v týdnu (HIGH) · 3+ táž ætt · transformační pár. **Kořenové (Níðhöggr):** těžká runa 3+ v urð · 2+ těžké v jednom čtení · opakovaná urð area · stagnace 30/60/90 dní. **Ratatoskr** = korunní i kořenový vzorec naráz. Precedence: transformační pár > těžká kombinace. Jména `HEAVY_RUNES` / `TRANSFORMATION_PAIRS` = v `runar-config.js` (logika chybí). Vše „k otestování po 50 uživatelích", nefinální.
- [ ] **Katalog speciálních motivů** (dřív `RUNAR_TREE_SPECIALS.md`). ⭐ KUKY 2026-10-11: nestavět po jednom — strom drží data (Větev/Kořen jako celek), motivy se z nich poskládají (`RUNAR_TREE.md` §7, DECISIONS 2026-10-11 (18)). Vzácné, decentní, VEDLE základní struktury; kreslí je `growBranch` jako běžnou větev (engine-safe, odstranitelné). Recept: spouštěč (předpoklady se SEJDOU) → jemný motiv → umístění → volitelně Rúnarova věta. Nápady (k diskusi): Srdce (2+ Love) · Hnízdo (3+ Family) · Urðina studna (Healing v kořeni) · Práh (Crossroads + průlomový pár) · Řeřavý hrot / Kapka rosy / Jinovatka (dominance elementu) · Srůst (4× táž runa) · Můstek (spojenecký pár) · Trn (protiklady vedle sebe) · Návrat (runa chyběla 6+ měs) · Life Rune = nejsilnější větev z kmene. Blank duch-větev = ZRUŠENA (2026-07-21).
- [ ] **Síly mezi runami — jako VÝZNAM v journalu, ne pohyb větví** (dřív `runar-tree-forces.md`). Živé magnety mezi větvemi = teď mimo hru (rozhodnutí 2026-07-30, regrese; vratné novým datovaným záznamem). Vztahy (přitažlivost stejného elementu, napětí protikladů, transformační páry, World rezonance) zůstávají jako vrstva významu v journalu → Rúnar je může pojmenovat (§7). Pokud by se někdy „zapekly do tvaru", pak deterministicky (seed = hash(runa+index+stav)), NIKDY živě. ⚠️ **Kauzalita (KUKY 2026-08-03):** DATA (journal — runy, co-výskyt, páry) určují OBOJÍ — vizuální síly NA stromě i vzorce Gatheringu. **Gathering čte DATA, ne geometrii** (obrázek = ztrátový render; hledat vzorce v tvaru = číst lossy kopii). Náklon/směr (area→strana) = polohový signál, už na větvích ≠ síly (vztahy run). Síly = LATER (potřebují detectPatterns + DB; nestavět dřív).
- [ ] **(na později — nejdřív PROBRAT jestli má smysl) Zakládací vizuál: semínko v tmavé půdě → semenáček → strom.** Intro / founding stav stromu. Potřebuje asset. Dvě cesty: **(a)** CSS/SVG animace v intro-stavu = `[tune]` lane · **(b)** reálný tree engine ve founding stavu = `[tree]` lane. Rozhodnout nejdřív JESTLI to děláme, teprve pak JAK + kdo staví. (KUKY 2026-07-30: „na později, probrat.")

## Premium features / Fáze B (tap UI, Ask Rúnar)

> Pozn.: Coworkův handoff `RUNAR_SEGMENTACE_FaseB_CODE.md` (07-07) předpokládá `deeper_meaning` v JSON — ale MAIN ho zahodil 07-04 (viz „deeper_meaning re-add" výše). B1 highlight ho NEpotřebuje; B2 ano. **[spec NENÍ v repu — Coworkův výstup, nedodán přes CODE (§17)]**  <!-- doc-links:ok 2026-07-19 legacy: vzniklo před pravidlem, důvod nedoplněn -->


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

### C — profi / SRE mezery (OWNER: vysvětlit podrobně před realizací)
- [ ] **Runtime testy peníze-kritických edge funkcí** (deno test: deduct až po úspěchu · hranice měsíčního stropu · idempotence · anonymous nedostane placené). Dnes 0 runtime testů, jen 24 statických.
- [ ] **Zálohy / DR** pro Supabase DB (peníze + PII): ověřit PITR, runbook kadence + restore, jednou nasucho vyzkoušet.
  ✅ **Archiv ověřen 2026-10-15** (CODE-read, owner *„6. over ji“*): `runar-db-2026-10-15.7z` jde rozšifrovat, všech 17 tabulek public +
  auth.users čitelných; počty proti živému count(*) sedí (rozdíly jen kladné, 1–3 řádky přibylé po 06:57). Schéma nese sloupce, politiky,
  funkce, triggery, cizí klíče, granty, indexy, rozšíření, buckety. Archivy chybí za 12.–14. 10. (padala kontrola v zálohovacím skriptu,
  opraveno 9804afe). **Neověřeno: obnova** — neexistuje skript, který by z JSON + schématu databázi postavil, a není kam obnovit
  (Postgres ani Docker na počítači). auth.users nese jen id, e-mail, časy, app metadata — jestli jde účet obnovit se stejným id, neověřeno.
  ✅ **Zkouška obnovy 2026-10-16** (owner *„11. ano“*, *„6. ano“* ke smazání kopie): výpis produkce přes `pg_dump` (scoop postgresql17,
  session pooler, `~/.claude/runar-db-url.txt`) obnoven do druhého Free projektu **Runar Testing** (organizace Runar Test, eu-west-1,
  `~/.claude/runar-test-db-url.txt`). Sedí: všech 18 tabulek na řádek, účty se STEJNÝMI ID a jejich profily, kredity a deník, politiky,
  triggery, funkce, rozšíření. Našla: obnovená DB dávala **90 grantů navíc** (anon/authenticated INSERT/UPDATE/DELETE na credit_ledger,
  allowed_emails…, 6 na user_profiles) — nový projekt přidá výchozí granty, výpis je neodebere → po obnově `opravOpravneni` (pak tabulky,
  sloupce i funkce = produkce). Dál: Windows pg_dump chce `--quote-all-identifiers`; vynechat `storage.buckets_vectors`/`vector_indexes`;
  při obnově bez cron/net/supabase_functions (kopie by volala produkci) a bez `storage.objects` (soubory záloha nenese). Vše v
  `scripts/utils/pgdump_runar.js`. Kopie po zkoušce smazána (tabulky, účty SQL; buckety owner v dashboardu), ověřeno prázdné.
  - [x] ✅ *(2026-10-18, CODE-read)* `pg_dump` v noční záloze (`zaloha_db.js`; selhání → `backup_fail`) a `scripts/utils/obnova_db.js`
    (produkci odmítne, cíl prázdný, jedna transakce, oprava oprávnění, 9 kontrol proti produkci; útok s grantem navíc chycen;
    `--vycistit`). Zkouška z archivu 2026-10-18: vše SEDÍ (liší se jen řádky přibylé po záloze), kopie smazána.
  - [ ] **Zkouška obnovy jednou měsíčně a po změně schématu** — `node scripts/utils/obnova_db.js`, prohlédnout, `--vycistit`. Kdo a kdy
    (naplánovaná úloha, nebo ruční krok) zatím nerozhodnuto.
  ⚠️ **Stav 2026-10-10 (CODE-read, `supabase backups list`): žádná záloha neexistuje** — `backups: []`, `pitr_enabled: false`.
  Deníky, kredity, profily i hlášení nemají kopii; `scripts/utils/zaloha_cteni.js` zálohuje jen čtení z pokusů, ne produkci.
  Volba (owner): placený tarif Supabase s denními zálohami (cena podle ceníku Supabase), nebo vlastní pravidelný `supabase db dump`
  do soukromého úložiště mimo repo (nese osobní údaje → šifrovat). → i `RUNAR_BACKLOG.md` „Kontrola architektury“, bod 16.
  ✅ **Ruční záloha 2026-10-10** (owner „ano, udělej“): všech 15 tabulek public + `auth.users` (id, e-mail, časy) jako JSON, schéma
  (sloupce, politiky, funkce, triggery, cizí klíče, granty) a 53 souborů statického audia — u ownera mimo repo (`runar-eval/zaloha-db/`).
  `supabase db dump` nejde (chce Docker) → export přes `supabase db query`. Je to JEDNA kopie, ne záloha průběžná; bod zůstává otevřený.
  ✅ **Od 2026-10-10 automaticky** (DECISIONS 2026-10-10 (9)): denně 3:30 šifrovaná záloha → lokálně + Google Drive runar@therunekeeper.com
  (`scripts/utils/zaloha_db.js`, úloha Windows „Runar - zaloha databaze“). Zbývá: Supabase Pro před produkcí, obnova do DB nanečisto.
- [ ] **`deno.lock` + Dependabot pro edge funkce** — přesné verze importů už hlídá smoke (`verify_edge_imports.js`, 2026-10-11);
  chybí zámek závislostí a automatické upozornění na nové verze.
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
- [ ] **Právní/DPO review** (Island/EEA) IS textů + legal-basis modelu. `RUNAR_PRIVACY.md` je pracovní podklad, ne posudek.
      ➕ **2026-10-12:** owner „udělej ten posudek“ → technická kontrola GDPR hotová (`docs/archive/2026-10-12-gdpr-kontrola.md`, není to právní posudek);
      úkoly z ní v sekci „Soukromí — kontrola GDPR 2026-10-12“. Právník zůstává volitelný — podklad pro něj je ta kontrola.
      ⚠️ **Na seznam k posouzeni patri i `credit_ledger`:** radky prezivaji smazani uctu. Muj zaver „je to v poradku, protoze klic je znicen" je TECHNICKY ROZBOR (delete-account nuluje `gift_codes.used_by` a kaskadou maze `user_profiles` i `readings`, takze UUID uz nejde spojit s osobou), NE pravni posudek.
- [ ] **Shopify webhook + checkout** — owner: webhook v Shopify admin + secret + mapa produkt→tier. ➕ *Owner 2026-10-12: „dodělame. potřebuju to pak mít všechno souhrnně“* → až přijde na řadu, připravit ownerovi JEDEN souhrnný postup (všechny kroky v jeho účtech v pořadí), ne po kouskách. CODE: edge fce (HMAC verify → `user_profiles.tier`) + odpojit „coming soon" stuby (`runar-auth.js:317-323`, `runar-app.js:1207-1208`, `runar-help.html:180`). Platby na webu (EEA/DMA).
      ⚠️ **SPOUSTEC pro GDPR prezkum:** objednavka nese e-mail I `user_id`, cimz OBNOVI mapovani UUID -> osoba. Zaver „radky v `credit_ledger` smi prezit smazani uctu" (RUNAR_PRIVACY.md, 2026-07-19) stoji prave na tom, ze po smazani uctu zadne mapovani nezbyde. Az bude Shopify, musi se ten zaver prezkoumat ZNOVU.

### 🟠 CODE — odblokované, v pořadí
- [~] **Evidence pohybu kreditu (ledger)** — POLOŽKA BYLA ZASTARALÁ: ledger EXISTUJE od 2026-07-19 (trigger na user_profiles, append-only; odhaleno 22. 8., když ownerův běh mého duplikátního SQL narazil na existující tabulku — 29 řádků od 4. 8.). Zbývá FÁZE 2 = atribuce: `sql/2026-08-22_ledger_faze2_attribution.sql` (čeká na spuštění ownerem) + proxy posílá p_reason/p_ref (hotovo, deploy AŽ PO SQL). Pak ověřit: čtení za kredit → řádek s reason=reading a ref=id čtení. Původně: dnes NEEXISTUJE, takze na otazku "strhl se mi kredit?" nejde odpovedet ani u vlastniho uctu; `credits_balance` ukazuje jen aktualni stav, ne historii. Narazil na to owner 2026-07-19 pri prvnim zdarma cteni zivotni runy. Resi ZAROVEN starsi ownerovo zadani (2026-07-16): "musi byt za pouziti kodu, ten kod by se mel nekde zapsat. neni kod neni kredit. nikdy to nebude vic nez prodavame." **Podminka: zapis do evidence musi byt ATOMICKY se zmenou zustatku** — evidence, ktera muze chybet, lze, a lziva evidence je horsi nez zadna, protoze se podle ni rozhoduje.
- [ ] **Obohatit řádek: pořadí tažených run + char_count** — ALTER už NEPOTŘEBUJE (2026-08-10). Řádek `readings` má sloupec `prompt_draws jsonb`, do kterého se dá přidat cokoli bez migrace; dnes v něm jede úhel, obraz, klíčová slova, tvar konce a umístění jména. Pořadí run je navíc jediné, co ještě chybí — model může sloty přeskládat, takže se musí ukládat strukturovaně.
- [ ] **Readings viewer: flag/annotate** — prohlížeč čtení ve shrine je hotový (`runar-readings-admin.js`, edge fn `list-readings`);
  chybí jen označit / okomentovat čtení — potřebuje review tabulku (owner ALTER). *(Úklid 2026-10-24: „prázdný stub“ už neplatilo.)*

### 🟡 OWNER rozhodnutí
- [x] ✅ **Retence čtení** — rozhodnuto: po dobu účtu (DECISIONS 2026-10-19 (3); RUNAR_PRIVACY „Retence“), opuštěné účty po 3 letech s
  upozorněním (položka níž). *(Uzavřeno úklidem 2026-10-24; do té doby tu stálo „nerozhodnuto“.)*
- [ ] **Living tree: sundat admin gate** (`renderLivingTree()` v `runar-tree.js`) — až uznáš betu za hotovou.

### 🔵 COWORK
- [ ] Tree DB fáze 2 — přeškálovat: `intention` + `aol` už logujeme server-side (481d313, 094f287).

### 🟢 Dlouhý ocas (kód, nízká priorita)
- [ ] **§18 debt:** lab i prod drží kompozici stromu 2× (`build_tree_production.py`) → vytáhnout `runar-tree-core.js`. Prod navíc načítá enginy z `tree-lab-*` cest. *(soubor zatím neexistuje — je to cíl toho refaktoru)*  <!-- doc-links:ok 2026-07-19 legacy: vzniklo před pravidlem, důvod nedoplněn -->
- [ ] **Před spuštěním: viditelnost + sklad dobrých vět** (KUKY 2026-09-29 bod 6: *„některá čtení jsou fakt dobrá, popřípadě vyjde dobrý
  závěr, a to chci ukládat tak, abychom měli materiál na vizuální tvorbu“*; report 10:13: *„Jak se maximálně zviditelnit ve vyhledávačích a
  taky při AI vyhledávání… Tohle je práce před spuštěním.“*). (a) SEO + AI vyhledávání (popisky run, tvar run v kolekci, statické texty jako
  obsah). (b) ✅ Ukládání vybraných čtení/vět pro vizuály — HOTOVO 2026-09-30: „✦ Keep this“ v reportéru (text + id čtení),
  DECISIONS 2026-09-30 (4); výpis = SQL v hlavičce `sql/2026-09-30_bug_reports_keep_a_limity.sql`.
- [ ] **Mazání opuštěných účtů po 3 letech s upozorněním** (owner 2026-10-19, DECISIONS 2026-10-19 (3)) — CODE-tune: úloha
  najde účty 3 roky bez přihlášení (`auth.users.last_sign_in_at`), pošle upozornění e-mailem (EN + IS, krátké — memory `emaily-kratke`),
  po lhůtě smaže cestou `delete-account`; zápis v registru `MAZANI` + `ops_events` purge (§30). Zásady v appce (EN + IS).
  **Upřesněno 2026-10-19 (6):** upozornění 30 dní předem + druhé týden předem; účet s nevyčerpanými kredity nebo běžícím
  předplatným se NEMAŽE, dokud kredity nevyčerpá / předplatné neskončí.
- [ ] Eval pipeline: pseudonymizace (opt-out exkluze HOTOVÁ).
- [~] **Segmentace Faze B — zbytek** — B1 (tap -> segment zezlatne) HOTOVO a v produkci. B2 (deeper_meaning) ZRUSENO ownerem 2026-07-10. NEHOTOVO a nikde jinde nedrzene: „tap odhali VYZNAM POZICE" (popup dnes ukazuje jen jmeno runy + keywords, zadny nazev pozice ze SPREAD_CONFIG) a „geometrie per spread". Zadne datovane rozhodnuti to nerusi -> nemazat bez rozhodnuti ownera.
- [ ] **Statické čtení Dagaz (Kolekce, s hlasem) odporuje ownerovu popisu run** — EN *„This is not gradual change — this is the breakthrough"*, IS *„umbreytir öllu í einu andartaki"*, kdežto `RUNAR_POPISY_RUN.md` říká, že se nic nestalo jedním velkým pohybem. Nový text runy pod ním (2026-09-24) drží popis, takže si teď na jedné obrazovce odporují. Přegenerovat statické čtení Dagaz (tabulka `runar_static_audio`, EL hlas) — rozhoduje owner. Nalezl kritik textů do Kolekce 2026-09-24. (CODE-tune)
  - **Owner 2026-09-24:** „nový Dagaz zní dobře, ale statická čtení zatím měnit nebudeme — necháme to na později.“ Schválené znění (ověřené is-grammar-qa + korpusem):
    EN: *Dagaz lives at the border between night and day. It rarely comes as a blaze. More often the same thing simply turns, and you see it from its other side. Then the world no longer looks quite as it did. Perhaps there is no new door to look for. Perhaps you already stand on its threshold.*
    IS: *Dagaz býr á mörkunum milli nætur og dags. Hún kemur sjaldnast eins og leiftur. Oftar snýst sami hluturinn einfaldlega við, og þú sérð hann frá hinni hliðinni. Heimurinn lítur þá ekki lengur alveg eins út og áður. Kannski þarf ekki að leita að nýjum dyrum. Kannski stendur þú nú þegar á þröskuldinum.*
- [ ] sigil cut-out export · smoke shorthand-check (chybí blocklist). *(2026-10-12: A/B/C a Fáze 4 z téhož řádku jsou v archivu odložených — prompt hotový.)*
Runa — klíče; inline větev _spreadBlock odstraněna, golden = jen 4 kříž buildery). Původně: (`label: Runa\nklíčová slova` vs `label\nRuna — klíčová slova`). Vzniklo při unifikaci builderu (`70cc33c`), nikde není zdůvodněno. Dedup na `_spreadBlock` (character.js) rozdíl DRŽÍ přes parametr `inlineLabel`, aby refaktor nezměnil prompt (§18.3). Sjednotit = změna promptu → vlastní tag + eval, ne tichý tune.
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
   **Postup (CODE-tune 2026-10-21, owner „ok začni“):** ✅ F1 balíček `supabase/functions/_shared/prompt_skladani.mjs` = týž kód jako appka
   (generuje `scripts/build_prompt_skladani.js`, pre-commit ho přegeneruje z indexu, smoke ㊌ 40/40 golden). ✅ F2 stínový režim: appka
   posílá `stin` (s čím skládala), `claude-proxy` prompt složí souběžně a zapíše shodu do `ops_events` „prompt_stin“ (bez textu); smoke ㊍.
   - [ ] **F2 vyhodnotit:** po pár dnech provozu `select detail from ops_events where kind='prompt_stin'` — každá neshoda = co záznamník
     nebo balíček neumí (builder, místo rozdílu). Pak záznam z mé sondy 2026-10-21 17:21 (chyba „reading 'k'“) ignorovat.
   - [ ] **F3 přepnout:** server skládá sám — appka posílá jen vstupy (+ tah run); myšlenka ✦ (`_thoughtFor`, runar-reading.js) a připomínka
     délky do jedné skládací funkce v balíčku; sáček obrazů, poslední motiv a obraz z localStorage do DB (tabulka na uživatele); náhoda na
     serveru; `prompt_draws` zapisuje server z losu. Zavře „libovolný prompt“ (níž).
     **Připsáno 2026-10-22 (owner „6. ano, připiš to tune“, kolo (b) průchodu CODE-read — kde server věří prohlížeči):** (a) cenu čtení
     (`spread_cost`) server spočítá z typu čtení, které sám skládá (`SPREAD_COSTS`), ne z čísla od prohlížeče — dnes zaplatí upravený
     prohlížeč Yggdrasil jako jednu runu (známé od 2026-10-09 (18)); (b) `rune_name`, `rune_glyph` a popis spreadu (`rune_display`) do deníku
     zapíše server z vlastního losu, ne z `journal` od prohlížeče (dnes jen vlastní deník a strom, ale po F3 to jde zadarmo).
   - [ ] **F4 schovat:** buildery a RUNE_IMAGES z veřejných souborů appky pryč; shrine (laboratoř promptu) přes cestu jen pro admina;
     pak soukromé repo (krok 3) a nové klíče Supabase (krok 9).
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
   zapsat SPF přímo `v=spf1 include:_spf.google.com ~all`, jinak po odchodu z GoDaddy DNS přestane platit. ✅ Hlášení DMARC *(2026-10-21, owner v GoDaddy;
   ověřeno v DNS)* chodí na `runar@therunekeeper.com` (dřív `dmarc_rua@onsecureserver.net`, služba GoDaddy) — při přesunu přenést tak, jak je.
   Postup: export zóny z GoDaddy, nízké TTL den předem, zóna na Cloudflare, porovnat import s exportem i s tímhle výpisem, poštovní
   záznamy „DNS only“, přepnout nameservery, ověřit poštu (e-mail do i z runar@, přihlašovací kód z Brevo), pak zapnout DNSSEC v Cloudflare.
   ✅ *(2026-10-21, owner „dkim hotovo“; CODE-tune ověřil DNS: `google._domainkey` TXT `v=DKIM1; k=rsa`, klíč 2048 bit)* Google Workspace
   DKIM — pošta z runar@ je podepsaná doménou. Při přesunu DNS na Cloudflare tenhle záznam přenést (DNS only).
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

**Ponaučení z přetažení Supabase Free (2026-10-22, „Cached Egress“ 11,4 / 5 GB, grace do 20. 11.; owner „3. ano, zapiš“)** — platí pro přechod
na Cloudflare a placenou Supabase:
- [ ] **Statické soubory nikdy ze Supabase Storage.** Portrét (2,1 MB) i zvuky run (53 × ~0,3 MB) šly ze Storage s `Cache-Control: public,
  max-age=3600` (měřeno GET 2026-10-22; HEAD vrací `private, no-cache`) — prohlížeč s čistým profilem je stáhl pokaždé. Na Cloudflare Pages
  se `_headers` a dlouhým cachováním; Supabase jen data uživatelů (hlasy čtení, DB).
  Portrét: web z vlastní kopie, appka z repa (9335d57). Zvuky run: zatím ve Storage s ročním cachováním (DECISIONS 2026-10-22 (7));
  **přesun pryč ze Storage zbývá — s přechodem na Cloudflare** (krok exportu nových zvuků ze shrine do repa).
- [ ] **Každý měřený zdroj má hlídače** (registr kvót, návrh níž) — o přetažení jsme se dozvěděli až z banneru Supabase.
- [ ] **Placená Supabase = černá díra se projeví fakturou, ne výpadkem** → při přechodu nastavit strop útraty a upozornění na rozpočet (owner v konzoli).
- [ ] **Cloudflare Pages Free: 500 sestavení za měsíc, 1 naráz** (developers.cloudflare.com/pages/platform/limits, čteno 2026-10-22). Máme ~900 commitů
  za 2 týdny — sestavení z gitu na každý push limit přetáhne. Nasazovat jinak (Direct Upload / jen z vybrané větve / dávkově); jestli se Direct
  Upload do limitu počítá, stránka neříká — ověřit.
- [ ] **Registr kvót — POSTAVENO 2026-10-22 kromě Brevo** (`KVOTY` v `_shared/ops_souhrn.ts`: databáze a soubory Supabase z `public.ops_kvoty()`,
  `sql/2026-10-22_kvoty.sql` — pouští owner; pondělní připomínka egressu; odpočet starých klíčů Supabase `KLICE_SUPABASE`, po kroku 9 `vymeneno: true`).
  **Zbývá:** Brevo `GET /v3/account` — pole ověřit naživo, pak řádek do `KVOTY`. Původní zadání:
  **Registr kvót v ranním souhrnu — SCHVÁLENO** (owner 2026-10-22 „1. ano, schvaluji, připomínkou v souhrnu“ — Supabase připomínkou; DECISIONS 2026-10-22 (6); staví CODE-tune): v `supabase/functions/_shared/ops_souhrn.ts`
  registr `KVOTY` vedle `MAZANI` a `BEHY` — služba, limit, odkud číslo, prahy 50 % (WATCH v souhrnu) a 80 % (upozornění e-mailem při změně).
  Zdroje čísel (stav ověření 2026-10-22): ElevenLabs — API předplatného, už se čte (brzda hlasu) · Brevo — `GET /v3/account` vrací plán a
  kredity (developers.brevo.com/reference/get-account; přesná pole a denní strop Free ověřit naživo) · Supabase — veřejné API s využitím
  organizace jsem nenašel (Management API má limity požadavků, endpoint na egress ne); náhrada: měsíční připomínka v souhrnu „zkontroluj
  Usage“, nebo upozornění, které umí sama Supabase (ověřit) · API modelů — Anthropic a OpenAI umí náklady jen s admin klíčem (tajná hodnota
  navíc v Supabase); útratu drží stropy v konzolích z 2026-10-10 (OpenAI 100 $, Anthropic 20 $ — archiv kontroly architektury, část 15).
  Rozhodnout: které služby hlídat strojem, které stropem v konzoli.

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
- [ ] **Zbývá — pro ownera, část pro právníka:** ~~upozornění „Rúnar je AI“ v rozhraní~~ ✅ 2026-10-19 pod BEGIN THE READING (owner
  „13.“, DECISIONS 2026-10-19 (1); zda to EU AI Act čl. 50 stačí, je otázka pro právníka) · věk 13+
  proti pravidlům Anthropicu pro nezletilé? · oznamovací povinnost při zneužívání dítěte (islandský zákon o ochraně dětí)? ·
  placení za čtení s otázkou na sebevraždu — owner: *„Nebo je to protizákonné?“* (rešerše 2026-10-15 to neřešila)?
- [ ] **Krize v poli s otázkou (single i spready) 112 nedostane** (CODE-read 2026-10-16, ownerův test Raidho EN): `qBranch` „Let <runa>
  answer: <q>“ (`runar-character.js`) vezme otázku jako zadání výkladu a systémová věta o 112 prohraje; výjimka v5.10 kryje jen Ask.
  Dnes jen admin (pole s otázkou, 2bf5e27). Nutné, než se pole otevře; „Let X answer“ owner drží do testu → měnit až s ním
  (podklad `docs/inbox/2026-10-16-kontrola-promptu.md` část E).
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

#### Útok zvenku na živou appku, fáze 1 — bez přihlášení (2026-10-18, CODE-read; owner *„5. ano“*)
Jen veřejný (anon) klíč z appky, čtení a pokusy na neexistující ID; ověřeno v DB, že se nic nezměnilo. **Zranitelnost nenalezena:**
tabulky s osobními daty RLS nebo granty zavřené (prázdné / 401), zápis do `user_profiles` 401, `add_credits`/`use_credit` 401, edge funkce
bez přihlášení 401 dřív, než stojí peníze (`claude-proxy` ř. 461), uložené XSS v hlášeních ošetřené `esc()`, v klientu jen anon klíč.
`runar_corrections` jsou veřejné záměrně (slovní dvojice). Netestováno: přihlášený uživatel (cizí účty, kredity tokem appky), entropie
dárkových kódů. (Druhý pokus o spuštění téhle zkoušky zastavila ochrana Claude Code; běh, který proběhl, je tenhle.)

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
- [ ] **CODE-tune — souhlas u volné otázky a minimální věk** (DECISIONS 2026-10-12 (7), celé zadání tam): „+“ za THE SITUATION s upozorněním; jednorázové políčko souhlasu (+ věk 13+) při prvním psaní do otázky nebo Asku, uložené k účtu (sloupec a grant = SQL ownera, smoke ⑩), odvolání v menu Privacy; zásady EN + IS: věk 13 a souhlas rodiče, popis souhlasu. IS ověřit (§2).
      ✅ *(CODE-tune 2026-10-12, krok 1: „+“ za THE SITUATION s upozorněním EN + IS; v zásadách věk 13 a souhlas rodiče; ㊽ (G) hlídá,
      že „+“ nezmizí.)* ✅ *(krok 2 v kódu, CODE-tune 2026-10-12: políčko souhlasu (+ věk 13+) při prvním psaní do otázky nebo Asku, bez něj
      čtení s otázkou nezačne a Ask neodejde; odvolání v menu Privacy smaže i otázku rozdělaného čtení; testeři výjimka; popis v zásadách;
      hlídá ㊽ (H).)* ✅ *(SQL puštěno ownerem 2026-10-12, sloupec i grant ověřeny v DB — DECISIONS 2026-10-12 (10).)* **Zbývá:** ~~owner pustí SQL~~ ověřit
      naživo přihlášeným adminem (zaškrtnout, odvolat) — ověřeno jen proti podvržené databázi. (Do 2026-10-13 tu stálo „do té doby
      uložení souhlasu selže“ — platilo jen do ownerova SQL 2026-10-12.)
- [ ] **Před veřejným spuštěním (owner 2026-10-12 „později“):** vývojové konverzace s Claudem — do zásad, nebo lhůta (5) · doba uchování hlášení a čtení po smazání účtu (8, s „Retence čtení“) · DPIA ano/ne (10).
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

## Musí být hotové PŘED prvním cizím přihlášením


## Procházka appky jako návštěvník (CODE-read 2026-10-11, produkce v654, EN + IS, desktop i 375 px)
Prošlo bez vady: úvod, tah runy (výzva k registraci, žádné volání serveru), přepnutí jazyka po tahu (bez okna o kreditu), životní runa
(výpočet bez serveru), Safn rúna (25 run, 5 odemčených, detail s kamenem a audiem), deník návštěvníka, nápověda, zásady, okno „Where to
start“ (runa = naše SVG), šířka telefonu (bez vodorovného posunu, mřížka 4 sloupce), konzole bez chyb; islandské věty is-greynir OK.

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

## Ověřit naživo, než rozešleš odkaz


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
5. ↩ *(2026-10-10 večer VRÁCENO, DECISIONS 2026-10-10 (30): návštěvník má zase formulář — 2a3f03b „rovnou k tahu“ owner chtěl
   vrátit celé, CODE-tune opravil jen Norny a fotku.)* **Formulář návštěvníka:** návštěvník čtení nedostane, formulář se ho přesto ptá
   na jméno a „jak tě má Rúnar oslovovat“ (oblast/hledání/záměr má zamčené). Dál otevřené jen spolu s bodem 8 (čtení pro návštěvníka).
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
- [ ] **Stránka „The journey with Rúnar“ + nákup na webu (owner 2026-10-19, DECISIONS 2026-10-19 (7)):** všechny účty s cenami
  (měsíčně / ročně) a Rúnakort na therunekeeper.com; nákup (Rapyd / Shopify) jen tady, appka sem z prohlížeče odkazuje, z Google Play ne.
  Po zaplacení zpět do appky se stejným účtem (e-mail). Ceny ze stejného zdroje jako okno v appce (config), ne opsané.
  Stav 2026-10-21: stránka běží SKRYTÁ na https://therunekeeper.com/ferdin/ (noindex, landing na ni neodkazuje) — owner ji chce
  vyladit naostro před spuštěním. **Při spuštění:** odkaz z landingu, `noindex` pryč, tlačítka napojit na nákup a adresu dát do
  `JOURNEY_URL` (config, CODE-tune).
- [ ] **Domovská stránka webu po spuštění** (owner 2026-10-21 „ano, postav ji“): běží SKRYTÁ na https://therunekeeper.com/heim/ —
  hero appky s portrétem, „Gakktu inn →“ do appky, jak čtení funguje (guide_*), cesta (→ /ferdin/), Rúnakort (→ /ferdin/#kort), patička.
  **Při spuštění:** /heim/ se stane úvodní stránkou místo „Væntanlegt“ (registrace pak není potřeba), `noindex` pryč.
  Dál (CODE-web 2026-10-27, DECISIONS 2026-10-27 (10)): na /heim/ doplnit `og:url` = https://therunekeeper.com/ (ostatní značky
  náhledu už tam jsou); `RUNAR_HOME_URL` v configu z /heim/ na kořen (CODE-tune); `robots.txt` + `sitemap.xml` (kořen, /ferdin/)
  a sitemapu odeslat v Google Search Console (doména je ověřená TXT záznamem `google-site-verification`).
- [ ] **Facebook Rúnara** (owner 2026-10-27: *„musíme založit facebook“*) — zakládá owner (stránka, ne osobní profil; stejné jméno
  @runartherunekeeper; propojit s Instagramem v Meta Business Suite). Pak adresu do configu vedle `RUNAR_INSTAGRAM_URL` (CODE-tune)
  a odkaz do patičky webu (CODE-web, `webInstagram()` ve web.js zobecnit na víc sítí) i do menu appky; v režimu Play skrytý jako Instagram.
- [ ] **Google Play bez provize — co hlídat dál** (rešerše CODE-web 2026-10-21, Play Console Help 10281818 + Payments policy 9858738):
  consumption-only appka smí o nákupu jinde jen INFORMOVAT textem; nesmí mít odkaz ani tlačítko na stránku, odkud se dá (i nepřímo)
  zaplatit. Opraveno CODE-tune 2026-10-21 v režimu `?src=play`: odkaz na obchod u pole kódu, značka AGNDOFA, odkazy a ceník v nápovědě.
  Zbývá hlídat: (1) appka v Play nesmí odkazovat na therunekeeper.com (po spuštění tam bude nákup); (2) popis appky v Google Play
  nesmí vést k nákupu (i výpis v obchodě je podle pravidel kanál); ~~(3) stroj místo paměti~~ ✅ *(CODE-read 2026-10-21, owner „2. ano,
  postav to“: smoke ㊐ `scripts/verify_play_bez_nakupu.js` — skutečný prohlížeč v režimu `?src=play`, JOURNEY_URL podvržené, appka + okno
  cesty + IS + nápověda + zásady; viditelný odkaz na agndofa.is / therunekeeper.com / Shopify / Rapyd = FAIL.)* Pozn.: větev Play v nápovědě
  převádí na text jen agndofa.is a therunekeeper.com — odkaz na Shopify by prošel do nápovědy, ㊐ ho ale zastaví.
- [ ] **Předplatné: měsíční / roční a datum obnovy v profilu a v menu** (owner 2026-10-21 nad rozbalovacím menu účtu: *„jména účtů — by mohlo
  jít vidět, jestli je měsíční nebo roční subscription u Walker a Wanderer“* → *„4. ano, zapiš to“*). Dnes to nejde: `user_profiles` má jen
  `tier`, žádnou délku předplatného ani datum obnovy (ověřeno 2026-10-21, CODE-read); platby neběží. Až poběží: server při platbě zapíše
  do profilu délku (měsíc / rok) a datum obnovy (zapisuje jen service_role, jako `tier` — `sql/2026-07-16_user_profiles_column_grants.sql`);
  menu účtu u Walkera a Wanderera ukáže např. „RUNE WANDERER · YEARLY“ a „renews 21 Oct 2027“ (texty z UI_TEXT, IS + EN; datum přes
  `datumUI`). Datum obnovy je pro člověka podstatnější než samotné „yearly“ — kdy se strhnou peníze a do kdy má čtení. Lane: platby CODE-web,
  menu CODE-tune.
  **Okno cesty** (owner přes CODE-web 2026-10-21: *„mělo by se nějak odlišit, jestli má uživatel měsíční nebo roční předplatné. asi říct you
  are here na tom místě, kde je, a ne obojí … měl bych teda vidět yearly“*): okno se otevře na kartě období, které člověk platí, a „you are
  here“ stojí jen tam (na druhé kartě ne). Totéž pole z profilu jako menu. Web „you are here“ nemá, dokud nepozná přihlášeného.
- [ ] **Pro OWNERA — Rapyd** *(owner 2026-10-12: totéž co Shopify — dodělá se, pak JEDEN souhrnný postup)*: smí účet Agndofy prodávat přes Rapyd Hosted Checkout / odkaz k platbě na therunekeeper.com, a jaký tarif
  má Shopify Agndofy (u cizí brány Shopify bere příplatek, Basic 2 %)? Rozhodne, jestli Rúnakort půjde přes Shopify, nebo rovnou Rapyd.
  Fyzické runy jdou přes Shopify vždy. Kupovat jde pět balíčků (`CARD_PACKS`).
- [ ] **Obchody před spuštěním** (rešerše CODE-web 2026-10-13; poplatky a provize v `RUNAR_PRICING.md` „PWA vs Native App“; owner
  rozhodl 2026-10-19 (4): Android v Google Play bez nákupu v appce, iPhone zatím PWA). Android: táž PWA zabalená přes Trusted Web Activity (Bubblewrap) + ověřovací soubor Digital Asset Links (assetlinks)
  na doméně appky. Startovní adresa balíčku pro Play musí nést `?src=play` — podle ní appka skryje ceny a nákup (CODE-tune
  2026-10-19, okno „Your journey with Rúnar“; bez ní by appka z Play odkazovala na nákup a porušila consumption-only). Účty pod Agndofa ehf. potřebují D-U-N-S (Apple i Google). iOS: když appka nabídne přihlášení Googlem, Apple podle
  pravidla 4.8 chce i rovnocenné přihlášení (prakticky Sign in with Apple) — přesné znění 4.8 neověřeno. Jméno: v obou obchodech už je
  „Runar: AI Chat & Runes“ (runar.app, AI věštění z run) a na Google Play „Runar“ (com.tnco.runar) — název v obchodě musí být jiný,
  ochrannou známku owner řešit nechce (2026-10-13). Odznaky obchodů na webu až s živou appkou, jen oficiální soubory.
- [ ] **Rúnakort digitálně** (DECISIONS 2026-10-19 (4), CODE-web). ✅ 2026-10-19: stránka karty https://therunekeeper.com/kort/
  (černá / bílá, QR, tisk do PDF) · sloupce sledování v `gift_codes` (owner pustil SQL) · appka předvyplní kód z QR `#kort=` a shrine
  u dávky ukládá form / design / lang / channel / complimentary a dává odkaz na kartu (obojí CODE-tune). **Zbývá:** doručení po
  zaplacení až po rozhodnutí Shopify / Rapyd; tisk celé dávky v jednom PDF pro tiskárnu, až budou fyzické karty (dnes karta po jedné).
  **Vzhled Vetur (zimní slunovrat, owner 2026-10-20)** je v `web/site/runakort.css|js`, postava je zatím výřez z archu
  `Runar_WinterSolsticeOutfit` (365 × 470 px) — na obrazovku stačí, na tisk ne. Owner: postavy se vygenerují zvlášť. Pro tisk je potřeba
  jedna postava (gesto otevřené dlaně jako u bílé karty), aspoň ~1500 px na výšku, průhledné nebo čistě bílé pozadí; pak vyměnit
  `web/site/img/runar-zima.jpg`. Další vzhledy podle oblečení (letní slavnost, půlnoční slunce, polární záře, cestovatel) stejně.

## Z Coworku 2026-10-18 (HANDOFF66 v `docs/inbox/2026-10-18-HANDOFF66_ucty-vypadaji-stejne-visitor-plus-a-formular_COWORK_to_CODE-read-tune.md`, 67 a 68 v `docs/inbox/rune-cards/`; ověřeno CODE-tune proti repu, DECISIONS 2026-10-18 (4))
### Účty vypadají a ovládají se stejně — HANDOFF66 (owner: rozdíl jen tam, kde ho chce funkce)
- [ ] **CODE-read: matice stav × plocha** (Visitor · Rune Seeker · Standard · Premium/tester · admin × menu, formulář, spready, Ask, hlas,
  Kolekce, Životní runa, okna, toasty, ⚑ a „?“) — z kódu; Standard v DB nemá nikdo (2026-10-18: 4× rune_seeker, 1× premium).
- [ ] **Uvítání a navedení: Visitor při návštěvě, nový Rune Seeker po první registraci** (owner 2026-10-19 bod 11, místo přepisu první věty
  Visitorova výpisu: *„všechno má omezené, já bych si dokázal představit nějaké uvítací okno, welcome visitor … heslovitě, že může
  prozkoumat, co mu appka nabízí, a po registraci si může nechat udělat od Rúnara čtení … totéž pro Rune Seekera … chce to uživatele
  navést na správné používání appky. Je potřeba vymyslet jak! Zjisti, jak to dělat nejlépe.“*). Stavět z toho, co už je (Where to start,
  How a reading works, „?“, nápovědy „+“, karta po tahu, výzva v Kolekci a Journalu); návrh předložit ownerovi. Opakování podle IP ne
  bez rozboru — IP je osobní údaj a statická appka ji nevidí. Věta „The Runes Collection and your life rune are free.“ (schválená
  2026-10-10) se řeší v rámci toho; Coworkův IS návrh („getur fundið hvaða“ 7× proti „fundið út hvaða“ 219×) nepřebírat.
  ➕ **Owner 2026-10-19: celé na CODE-read** — průchod appkou jako uživatel Visitor → Rune Seeker → upgrade → Premium (co se kdy objeví,
  dává-li to smysl), návrh **okna Upgrade** (všechny účty od Visitora po Premium, ceny měsíčně / ročně se slevou, upgrade i downgrade,
  vzor ElevenLabs Subscription), **předělané menu**, **helper „?“** jako okno nad místem, na které upozorňuje, a **zvýraznění How a reading
  works** (záblesk nebo pomalé zvětšení) — s rešerší, jak to udělat nevtíravě. Owner: *„nikde nemáme klikací okno Upgrade … zapomněl jsem
  vytvořit, jak na něj upgradovat.“* Ceny jsou zatím jen v `RUNAR_PRICING.md`, platby (Shopify / Rapyd) nepostavené. Stavět CODE-tune
  po ownerově ano.
  ➕ **Mapa dnešního stavu hotová (CODE-read 2026-10-19):** `docs/inbox/2026-10-19-pruchod-appkou.md` (krok × co se objeví × kdy ×
  smysl). Návrhy čekají na ownerovo potvrzení stylu.
- [ ] **`RUNAR_PRICING.md` opisuje ceny ve výpočtech marží** (ř. ~232–263 „Standard value vs credits“, tabulka marží, a ~368 mix) — při změně
  ceny v configu se nepřepočítají samy. Přepsat na odkaz + výpočet, nebo nechat jen kalkulačku ve shrine (ta čte config). CODE-tune / owner.
- [ ] **Vady z průchodu appkou (CODE-read 2026-10-19 → CODE-tune)** — detail a místa v kódu: `docs/inbox/2026-10-19-pruchod-appkou.md`
  „Vady“. ✅ *(CODE-tune 2026-10-19, owner „6. ano oprav je“, 29dd249 + 67ca401)* vady 1, 4, 5, 6: okno se jménem se nevrací · nový
  účet bez „again“ · toast Yggdrasilu jednou · Rune Seeker bez čtení má po DRAW ANOTHER / START OVER formulář s větou o Rúnakortu.
  **Zbývá** (jen z kódu, ověřit v prohlížeči): 2 souhlas testera se vrací stejně · 3 okno se jménem a „Where to start“ naráz ·
  7 závod `upsertProfile` × `fetchUserProfile` u nového účtu („0 spár eftir“) · 8 drobnosti a mrtvé prvky.
- [ ] **„free to join“ → „{onboarding} when you join“** ve `vcn_text` a `journal_gate_txt` — zdroj je `TIER_LIMITS.rune_seeker.onboarding_label_*`
  (jako `visitor_join_note`), ne `free_trial` (Cowork ukázal na `free_trial`, tam je `onboarding` jen historický).
- [ ] Ownerova diskuse D–H (uvítání Visitora v menu, statický „Rúnar's welcome“, vysvětlení v Journalu, blok jako „How a reading works“,
  jeden text o tom, co je zdarma) — owner: „ještě to doplníme“; nestavět.
### Délka živých doců (smoke ㉝, obnoveno potřetí 2026-10-20, CODE-tune)
- [ ] Odklady délky v `scripts/verify_doc_length.js` pro `RUNAR_BACKLOG.md` (~1 350 ř.), `RUNAR_DESIGN.md` (~1 460), `RUNAR_EVAL_LOG.md`
  (~6 400), `RUNAR_PRICING.md` (~580) a `memory/working-style.md` (~375) vypršely 2026-10-20 a zastavily push všem; obnoveny potřetí
  (2026-09-20, 09-21, 10-20). Zkrátit: BACKLOG — odsunout hotové (`[x]`) do `docs/archive/RUNAR_BACKLOG_hotovo.md` (CODE-tune / CODE-read);
  EVAL_LOG — starší baseline do archivu (CODE-read); DESIGN a PRICING — rozdělení je obsahové rozhodnutí ownera; working-style — část do
  samostatných memory souborů. Další obnova bez zkrácení ne.

- [x] ✅ *(CODE-tune 2026-10-27, DECISIONS 2026-10-27 (2))* **Tlačítka po čtení a přepínač MY READING / FOR SOMEONE (owner 2026-10-20, DECISIONS 2026-10-20 (1)) → CODE-tune.**
  DRAW ANOTHER RUNE pryč, zůstává jedno velké START OVER ve stylu HEAR RÚNAR SPEAK (`.btn-voice`, přes celou šířku); ASK beze změny. Aktivní
  MY READING / FOR SOMEONE vyplněné jako BEGIN THE READING (`.btn-full`), aby bylo vidět, kde člověk je. Velikost tlačítka podle důležitosti
  (owner: *„všechno nemá být stejné“*). Pozor §32 / smoke ㉼: stav „další tah“ (drawAnother) se testuje — upravit kontrolu, ne ji obejít.
### Hlášení z appky 2026-10-19 / 20 (načtena 2026-10-20, CODE-tune; hotové: df67acda, 62283c8c — a56aa46)
- [ ] **Jednotný vzhled — co ㊋ zatím nehlídá (zbytek po kroku 3, DECISIONS 2026-10-20 (3)):** (a) ~20 velikostí kurzívy textu karet
  (0.71–1.05em, řádkování 1.6–1.9) → dvě: text 0.92em / 1.8 a poznámka .fine; (b) 25 průhledností zlaté → 4 stupně (.08 tón · .2 rámeček ·
  .4 linka · .7 text); (c) nadpisy sekcí (.card-lbl 0.7, .layer*-lbl, .tree-*-label, .dd-tier 0.58) → 0.65em / 2px / zlatá kromě vrstev
  čtení; (d) `.visitor-lock-hint` vs `.opt`, `.pills-locked` vs `.pill-locked`; (e) `.atab-ikona` pevná velikost. Podklad: CODE-read
  `docs/inbox/2026-10-20-jednotny-vzhled.md` §1–2. Pozor na ownerovo „velikost závisí od důležitosti“ — jen stejná úroveň. Po každém kusu
  zúžit základ `scripts/komponenty_zaklad.json` (`--zaklad`) a doplnit soupis. CODE-tune.
- [ ] **„What are you seeking — This sets the tone“ (hlášení 3b79eac3):** owner: *„je složité si představit, co tím tónem myslíme“* — nová
  věta nápovědy `seek_hint` EN + IS, návrh ownerovi (co volba ve čtení skutečně dělá: tvar konce čtení, `SEEK_SHAPE` v runar-utils.js).
- [ ] **Písmo čtení je malé (testeři IS, hlášení 4910de7c, db5e2b38 — čtení Norny 452a97c5):** *„Letrið er of lítið, það er erfitt að
  lesa þetta.“* Změřit dnešní velikost textu čtení na telefonu a navrhnout větší (pozor na délku čtení na obrazovce). Rozhodne owner.
- [ ] **Islandské věty, kterým tester nerozumí (f35d5943 21:05, aa0a852e 00:02 — bez označeného textu):** aa0a852e přišlo ve stejnou minutu
  jako db5e2b38 k Nornám 452a97c5 — nejspíš věta „Í lífi þínu gæti þetta verið kunnugleg nánd sem breytist í hlé, eða hlé sem gefur henni
  nýtt rými.“ (neověřeno). CODE-read: projít čtení 452a97c5 islandsky (§2), u f35d5943 kontext chybí.

### Rúnakort jako karta (DECISIONS 2026-10-19 (4), CODE-web → CODE-tune)
### Karty run s dvergy (Dverg Tarot) — samostatný produkt mimo Rúnara (owner 2026-10-21, DECISIONS 2026-10-21 (2))
- Vlastní složka a vlastní seznam otevřených věcí: `dverg-tarot/README.md`. Tady se nevede (§20).
### Karty run ke stažení — HANDOFF67, 68 (soubory od 2026-10-20 v `docs/inbox/rune-cards/`)
- [ ] Owner: název · zadní strana (AGNDOFA) · 24 textů (rady proti `RUNAR_POPISY_RUN.md`) · kde vyhodit dvojí citát · originál fotky.
- [ ] Až karty půjdou opakovaně (IS, tiskárna): generátor do repa nad `v2/runar-runes.js`, `v2/runar-svgs.js`, `v2/fonts/fonts.css`
  (dnes kopie + vlastní `fonts.css`), Cinzel 500 → 400/700, přebarvení kamene jednou funkcí vedle `runeSvg`, spadávka 3 mm;
  hotové podklady pak řádkem do `v2/assets/README.md` (tabulka designových podkladů).

### Revize nápovědy, zásad a textů v appce (owner 2026-10-21 „můžou tam být staré věci“; CODE-tune)
Opraveno hned: cec2cf1 (nápověda), 368fe85 (odkaz na Agndofa.is), 701a713 (zásady soukromí), 95375a7 (texty v appce). Zbývá:
- [ ] **Zásady slibují upozornění v appce před změnou** (oddíl „If things change“) — mechanismus neexistuje, zásady se v říjnu měnily
  ~8×. Postavit, nebo větu změnit (čeká na ownera).
- [ ] **Export účtu** (`scripts/utils/export_uctu.js`) nevyveze zprávy „Send Rúnar a line“ ani uložené mp3 hlasu, zásady slibují
  „everything linked to your account“.
- [ ] **IP v `rate_limits`** nemá pevnou horní mez (úklid jen při ~5 % volání, řádky starší 1 h; 2026-10-21 nejstarší 18 h) — denní
  úklid cronem by dal zásadám přesnou lhůtu.
- [ ] **Ask u čtení „for someone“** (neuložené, ne-tester) nemá `reading_id` → proxy ho počítá jako čtení a strhne měsíční jednotku
  (runar-reading.js ~1144, proxy ~532–657); TIER_FEATURES slibuje „one question on every reading“. Neověřeno během, jen čtením kódu.
- [ ] **Rune Seeker a Ask:** `helper_ask` / `helper_ask2` ho zvou ptát se, pole je pro něj vypnuté (asks_per_reading 0).
- [ ] **`qconsent_lbl`** (souhlas s odesláním otázky, čl. 9) jmenuje jen OpenAI; při výpadku jde otázka Anthropicu. Pole je dnes jen
  pro admina (DECISIONS 2026-10-16 (5)), před otevřením ostatním opravit.
- [ ] **`lock_become_rs`** „Become a Rune Seeker to unveil“ — registrace odemkne jen část oblastí a hledání, zbytek karta.
- [ ] **Mrtvé texty:** `q_teaser` (pole jen admin), `tier_soon` (kreslí se do vždy skrytého `#sp-path-body`), `layer2_lbl` (jen staré
  záznamy deníku), anglické `title` u slotů spreadů v runar-reader.html (vymaže je `_updateSpreadSlots`).
- [ ] **Zastaralé komentáře / natvrdo:** runar-config.js ~276 („Only these emails can access … Yggdrasil“), ~101 (testeři „jsou
  rune_seeker“, SQL jim dává premium); runar-reading.js ~1100 („tier != premium -> 403“); runar-journal.js ~274 natvrdo `count > 5`
  místo `TIERS.rune_seeker.journal` (§10); runar-auth.js ~400 po uplatnění kódu nastaví `userTier = 'rune_seeker'` i předplatiteli
  (dopad neověřen).

### Před spuštěním plateb: nižší účet a vracení peněz (DECISIONS 2026-10-21 (9))
- [ ] **CODE-web — nákup:** zaškrtávací souhlas „chci začít hned a beru na vědomí ztrátu práva na odstoupení, až bude služba poskytnutá
  celá“ (zákon 16/2016, 15. a 18. gr.) u Rúnakortu i předplatného; potvrzení na trvalém nosiči (e-mail).
- [ ] **CODE-web — obchodní podmínky (skilmálar) EN + IS:** poučení o 14 dnech, vzorový formulář pro odstoupení (5. gr. g), pravidla
  vracení z DECISIONS 2026-10-21 (9), nižší účet od konce období. Bez poučení se lhůta prodlouží o 12 měsíců (17. gr.).
- [ ] **CODE-tune — postup vracení:** skript pro admina: zrušit nepoužitý kód / snížit účet / odepsat zbylé kredity, zápis do
  `credit_ledger`; peníze vrací platební brána do 14 dní stejným prostředkem (21. gr.).
- [ ] **CODE-tune — nižší účet:** zpráva brány na konci období → server sníží `tier`; tlačítko „STEP BACK TO …“ vede do portálu brány.

### Hlášení z appky 2026-10-23 / 27 — čeká na ownera (načtena 2026-10-27, CODE-tune; hotové v DECISIONS 2026-10-27 (2))
- [x] ✅ *(CODE-tune 2026-10-27, DECISIONS 2026-10-27 (3))* **Věta v okně cesty „From 1.490 kr for 5 rune readings. Have a code? Enter it here.“ (41004321):** owner: *„odstranit, pokud za tím
  není myšlenka“*. Myšlenka je: ťuknutí zavře okno a otevře pole pro kód Rúnakortu (`journey_card_note`, `runar-app.js` u záložky karty);
  cena = nejlevnější balíček. Rozhodnout: nechat, nechat jen „Have a code? Enter it here.“, nebo pryč.
- [x] ✖ *(owner 2026-10-27: „1. uzavřený“ — Skladač se nestaví, DECISIONS 2026-10-27 (1))* **Skladač promptu v appce (f9b5b7f2, 2026-10-23):** owner chtěl skládat prompt sám a vidět, co se mění. Plán „z čeho se skládá čtení“
  uzavřen 2026-10-27 (DECISIONS 2026-10-27 (1)) i s krokem 8 Skladač — hlášení je starší než uzavření. Potvrdit, jestli Skladač patří do
  uzavření, nebo zůstává.
- [x] ✅ *(CODE-tune 2026-10-27, DECISIONS 2026-10-27 (5))* **Menu (burger) přestavět (c9976b4e):** *„pořadí je takové divné, ať to má víc design menu“*. Napřed soupis dnešních položek a
  návrh pořadí a vzhledu ownerovi (komponenty z `scripts/verify_komponenty.js`), pak stavět.
- [x] ✅ *(CODE-tune 2026-10-27, DECISIONS 2026-10-27 (4); zbývá Rúnarův hlas k rituálu)* **Rituál pod BEFORE WE BEGIN (5439bcc1, 36f14a03):** rozbalovač „+“ (komponenta `.xp-plus`) s krátkým textem, co udělat před tahem;
  owner navrhl EN znění (svíčka, vůně, ticho, nádech, myšlenka na otázku, pak tah). Napřed kritický pohled (§21) a znění v EN i IS
  hlasem Rúnara, schválení ownerem, pak stavět.
- [ ] **Norny a3692c86 — „voice“ skřípe, význam nesedí (d65a6bb4, bf44ef3d):** Ansuz (Verðandi) dostal ze seznamu `k` význam „voice“
  („a voice is taking shape among the fallen branches“) uvnitř obrazu bouře, který nese celý výklad; owner: stačilo *„message“*, konec
  nesedí, *„jak udělat, aby lépe volil významy run pro určité čtení?“*. Hypotéza (neověřeno): jeden obraz pro tři runy nutí druhou a třetí
  runu mluvit uvnitř cizí scény. Zásah do promptu výkladů → lab CODE-read, ne tichý tune.
