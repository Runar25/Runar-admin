# RUNAR_BACKLOG_kontrola-architektury.md — záznam kol 1–3 kontroly architektury (CODE-read, 2026-10-09 → 2026-10-11)
# Přesunuto doslova z RUNAR_BACKLOG.md 2026-10-12 (sekce „Kontrola architektury po částech“; metoda a pokyny ownera zůstaly tam).
# Historie ke svému dni, ne pravda o dnešku: co platí, vlastní kód, git log a RUNAR_DECISIONS.md. uz_vime.js tenhle soubor prohledává.

### Část 1 — claude-proxy (`supabase/functions/claude-proxy/index.ts`, 958 ř., přečteno celé 2026-10-09)
**Platí (ověřeno v kódu):** anonym → 401 před voláním modelu · rate limit 10/60 s na uživatele · admin z JWT (e-mail, kopie hlídá
smoke ㉪) · strop délky promptu 8000 / Ask 12000 / system 8000 · `max_tokens` strop 2500 · `spread_cost` sanitizace 1..9 (smoke ⑨ ji
útočí) · odečet AŽ po textu z modelu · měsíční strop jen pro čtení, ne pravý Ask a rituály (zrcadlo `MONTHLY_LIMITS`, `ASKS_PER_READING`,
`NAME_LORE_LIMIT` hlídá smoke ⑨) · rituály (životní runa, založení, rozbor jména) zdarma a s kontrolou „už existuje“ · sol napřed pro
všechny, Claude jen při výpadku solu nebo `engine:'opus'` od admina · Claude fallback jen při přetížení, ne při timeoutu ·
`composeReading` = zrcadlo klienta (smoke ⑦) · založení stromu i rozbor jména CAS (souběh zapíše jednou).
**Opraveno rovnou (jen popis, chování beze změny):**
1. Hlavička: „Forwards to Claude API“ → sol + Claude záloha · „free_trial (anonymous) — frontend handles trial“ → anonym 401 ·
   vrstvy A/B/C popsané jako živé → vypnuté od 2026-07-04 (tohle CODE-read 2026-10-09 opsal do přehledu architektury) ·
   rate limit „or IP for anonymous“ pryč (anonym sem nedojde).
2. „free readings: SINGLE RUNE ONLY (spread_cost must be 1)“ — nevynucuje se → komentář říká pravdu a odkazuje sem (bod 1 níž).
3. `spread_cost` „= number of runes“ (2×) → jednotky ze `SPREAD_COSTS` (Yggdrasil 9 run = 5).
4. „deník atomicky s odečtem / charged ⇔ journaled“ — jsou to DVA zápisy → opraveno v proxy, v `CLAUDE.md` („Reading systém“)
   a ve 4 komentářích klienta (`runar-app.js`, `runar-reading.js`).
5. `resave` „nikdy nebylo strženo“ → nemusí platit (bod 2 níž).
6. Poznámka „přepnutí na gpt-6.1-sol = jen SOL_MODEL“ — dnes by 6.1 s `SOL_EFFORTS` none/minimal tiše padal na Claude → varování.
7. Varování „nasadit až po migraci `prompt_draws`“ — migrace běží (produkční čtení sloupec nesou) → pryč.
8. Mrtvá `getISOWeekKey()` (týdenní příděl skončil 2026-06-12) odstraněna.
Nasazená funkce se od repa liší jen těmito komentáři a mrtvou funkcí — samostatný deploy netřeba, půjde s příštím.

**PRO OWNERA:**
2. ⚪ **`credits_used` může lhát.** Odečet a zápis jsou dva zápisy; když zápis selže, klient čtení pošle přes `resave` a to
   uloží `credits_used = false`, i když kredit stržen byl. Shrine pak ukáže „free“. Jen štítek, peníze se nepletou. Stačí vědět.
3. ✅ *(CODE-tune 2026-10-10: po tahu karta „THE RUNE IS DRAWN“ s výzvou k registraci, proxy se nevolá; banner a nápověda čtení neslibují — `_showVisitorJoin`)* 🟠 **Návštěvník si vytáhne runu a dostane obecnou chybu.** ➜ **ROZHODNUTO 2026-10-09: výzva k registraci** (DECISIONS 2026-10-10 (1)), dělá CODE-tune. Živé čtení nepřihlášenému proxy odmítá od 2026-08-02 (401,
   DECISIONS 2026-08-02 „Fáze 1“ — návštěvník má jen statickou kolekci run). Appka mu ale záložku čtení ukáže, tah dovolí
   (`readRune` → `_generateReading` → `callProxy` bez přihlášení) a 401 přeloží na `err_generic`. Známé jako „client visitor gate →
   registruj se místo volání proxy“ (sekce C, „Proxy defense-in-depth“), dosud neudělané. `CLAUDE.md` („Gating“) psal „Visitor má
   Single 1×“ — opraveno na stav produkce (§20: vyhrává produkce). Rozhodnout: co má návštěvník po tahu vidět (výzva k registraci?).
   ✅ *(CODE-tune 2026-10-10, DECISIONS 2026-10-10 (16): znění schválil owner — „kolekce run a životní runa jsou zdarma, čtení po
   registraci“; IS bez rodu. Karta po tahu má od téhož dne styl horního pruhu, jasnou větu a tlačítko do Safn rúna.)*
   ~~**Zbytek (CODE-tune 2026-10-10, §22):**~~ boční panel návštěvníka (`TIER_LIMITS.free_trial.panel_props`, runar-config.js) pořád
   slibuje *„Your first reading is a gift. · No account, no payment.“* / *„Fyrsti lesturinn er gjöf. · Enginn reikningur, engin
   greiðsla.“* — od 2026-10-10 neplatí (bez účtu žádné čtení). Navíc IS *„þegar þú ert tilbúinn“* má mužský rod, appka přitom oslovuje
   podle zvoleného rodu. Nové znění je obsah → **čeká na ownera / Cowork**; CODE pak přepíše a ověří IS.

### Část 2 — ostatní edge funkce (přečteno celé 2026-10-09; nasazený seznam a verze `supabase functions list`)
**Platí:** všechny vyžadují přihlášení; admin-only funkce (`elevenlabs-static`, `voice-usage`, `list-readings`, `list-reports`) ověřují
e-mail z JWT · `list-readings` skrývá čtení lidí s `analytics_opt_out` · `notify-report` posílá do Slacku jen metadata (ne text ani
identitu) a tajemství `WEBHOOK_SECRET` je nastavené · `reset-tree` jen pro `is_tester` · strop hlasu 5/měsíc = zrcadlo configu (smoke ⑨),
počítá se až po úspěšném hlasu · `redeem-code` 5 pokusů / 15 min na IP, označení kódu CAS · `delete-account` maže kaskádou
`user_profiles`, `readings`, `tree_state` (ověřeno v `pg_constraint`), evidence kreditu a hlasu zůstává anonymní (`RUNAR_PRIVACY.md`).
**Opraveno rovnou:** `elevenlabs-proxy` hlavička „or IP for anonymous“ a „Auth (optional)“ → anonym 401 · `elevenlabs-static`
nepoužitá konstanta islandského hlasu označena · `tree-update` „volá ji appka po každém čtení“ → appka ji nevolá, ale je nasazená.

**PRO OWNERA:**
5. ⚪ **`tree-update` je nasazená, appka ji nevolá** ➜ ✅ **staženo z nasazení 2026-10-10** (DECISIONS 2026-10-10 (1)); kód v repu zůstává. — a zavolat ji může každý přihlášený bez rate limitu a bez stropu délky textu
   (platí Haiku, zapíše `tree_state`, `credits_used` bere od klienta = známé #6/#7 v sekci C). Data se dnes nikam nepoužijí (vrstvy
   A/B/C vypnuté). Volba: stáhnout, dokud ji CODE-tree neoživí (`supabase functions delete tree-update`), nebo nechat.
6. ⚪ `elevenlabs-proxy` vrací klientovi text chyby ElevenLabs (`claude-proxy` příčiny záměrně skrývá) a měsíční čítač hlasu není
   atomický (souběžné požadavky můžou započíst méně; rate limit 5/min to drží malé). Banalita, stačí vědět.

### Část 3 — databáze (živě přes `supabase db query --linked`, jen čtení, 2026-10-09)
**Platí:** RLS zapnuté na všech 15 tabulkách · `readings` klient jen čte své (zápis jen server) · `credit_ledger`, `rate_limits`,
`voice_*`, `gpt_reviews` bez politik = klient nic · peněžní funkce (`add_credits`, `use_credit`, `use_free_balance`, `bump_month_units`,
`append_follow_up`, `check_rate_limit`) anon ani přihlášený volat NESMÍ · živé granty sloupců `user_profiles` = seznam smoke ⑩
(14 sloupců + `id`) · cizí klíče: `user_profiles`, `readings`, `tree_state`, `gpt_reviews` kaskáda, `voice_usage` set null,
`gift_codes` bez akce (proto ho `delete-account` nuluje ručně → bod 4).
**Opraveno rovnou:** nic — databázi Code nemění.

**PRO OWNERA:**
7. ⚪ **Seznam adminů žije i v 5 RLS politikách** (`gift_codes`, `knowledge_base`, `runar_character`, `runar_corrections`,
   `runar_static_audio`); smoke ㉪ je vědomě nehlídá (SQL = historie, ne běžící kód). Při změně adminů je nutné přepsat i je.
8. ⚪ **`user_profiles` má dvě totožné politiky** ➜ ✅ **smazáno 2026-10-10** (SQL spustil owner; zůstala „Users manage own profile“). („Users manage own profile“ a „own profile“, obě ALL, `auth.uid() = id`). Neškodí,
   jen duplikát. Úklid (spustí owner): `drop policy "own profile" on public.user_profiles;`
9. ⚪ **`bug_reports`:** ➜ **owner „opravit“:** DB jen přihlášení ✅ 2026-10-10 (SQL spustil owner, ověřeno v `pg_policies`) + tlačítko jen přihlášeným ✅ 2026-10-10 (CODE-tune, `_paintReportBtn`) + `RUNAR_PRIVACY.md` doplněn (CODE-read); doba uchování dál otevřená. vložit hlášení smí i nepřihlášený (politika INSERT, role public, `CHECK true`) — kdo zná veřejný klíč, může
   posílat hlášení a pingat Slack. A hlášení nesou jméno testera (ručně zadané, 0 e-mailů z 241) a výřez čtení, bez vazby na účet →
   přežijí smazání účtu; `RUNAR_PRIVACY.md` o `bug_reports` nepíše nic. Rozhodnout: nechat / jen přihlášení / doba uchování.

### Část 4 — appka (pravidla `CLAUDE.md` pro klienta + hlavičky souborů, 2026-10-09)
**Platí:** §12 žádné `email.split('@')` · §5 `reader-content` se neskrývá, `--dim` jen u ikon, šipek, oddělovačů a placeholderů
(výjimku z 2026-09-24 nesl jen CSS komentář → doplněna do §5) · §14 `updateUIText()` nastavuje statické texty a dynamické nechá
vlastním funkcím · jednotný formát čtení bez `|||` · spready návštěvníkovi zamčené (toast „Sign in“).
**Opraveno rovnou:** hlavička `runar-reading.js` (4 závislosti, které soubor nevolá) · komentář `_readingErrMsg` („proxy vrací jen
rate_limited | no_credits“ — vrací víc, včetně `unauthorized` návštěvníka) · výčet tierů u `userTier` · mrtvá `checkStaticAudio()`
(nikdo ji nevolal od rozdělení monolitu) · **nová kontrola smoke ㉸**: větve `lang === 'is' ? '…'` nesmí přibývat (bod 10).

**PRO OWNERA:**
11. ⚪ Mrtvé drobnosti: `EL_VOICE_SETTINGS` v configu nikdo nečte (server má vlastní nastavení hlasu); shrine posílá do
    `elevenlabs-proxy` `voice_id`/`model_id`, které server záměrně ignoruje. Neškodí.

### Část 5 — prompt (tvrzení `CLAUDE.md` §2 a „Reading systém“, 2026-10-09)
**Platí:** tři vrstvy (system · prompt · korekce v promptu), post-processor `applyISCorrections` pryč (zbyl jen komentář o odchodu) · <!-- check-docs:ok 2026-10-09 cituje odstraněný post-processor jako odstraněný (ověření kontrolou architektury) -->
`buildSysPromptV2` v produkci nikdo nevolá (jen lab skripty) · `SEASON_POOLS` jen jako sáček. Hlídá je smoke ⑥ ⑧ ㉚ ㉜ a audit promptu
2026-10-07 (sekce výš). **Opraveno:** nic. **Pro ownera:** nic.

### Část 6 — strom
Patří CODE-tree (owner: „strom s CODE-tree, protože je jeho“) — Code-read jen to, co je vidět z appky: záložka Strom je jen pro
admina (`runar-auth.js`, 2026-09-11), `renderLivingTree()` pouští i testery — ti se k ní ale nedostanou, ta větev je dnes mrtvá.
Neškodí; až CODE-tree strom pustí testerům, stačí odkrýt záložku. **Pro ownera:** nic.

### Část 7 — docy proti kódu
**Opraveno rovnou (`CLAUDE.md`):** tabulka souborů bez `runar-names.js`, `runar-names-registry.js`, `runar-voice-admin.js`,
`runar-help.html`, `runar-privacy.html` → doplněno · pořadí načítání bez jmen → doplněno podle `runar-reader.html` · „27 konstant“
v configu (číslo v docu, §20) → pryč · §5 výjimka `--dim` · „Gating: Visitor má Single 1×“ → stav produkce · „deník atomicky
s odečtem“ → dva zápisy · §16 nový postup. `RUNAR_PRICING.md`: „⏳ odstranění Sonnetu z řetězu“ (hotové 2026-08-17) → ✅ + že
dnes čte sol. **Pro ownera:** nic navíc.

### Část 8 — stránky pro uživatele (`runar-help.html`, `runar-privacy.html`, 2026-10-09)
**Platí:** kredity nevyprší a patří k účtu · měsíční čtení se obnoví 1. den měsíce (server počítá kalendářní měsíc UTC) · deník
Rune Seekera = posledních 5 (`TIER_LIMITS.rune_seeker.journal_entries`).
**Opraveno:** nic — obojí čeká na rozhodnutí, která už leží.

**PRO OWNERA:**
12. 🟠 **Stránky slibují, co už neplatí — obojí patří k už otevřeným rozhodnutím, nic nového nerozhoduj zvlášť:**
    - ✅ *(CODE-tune 2026-10-10, 32e3d74)* `runar-help.html` „VISITOR“ už čtení neslibuje (EN 2×, IS 1×) — „draw one… joining is free“.
    - ✅ *(CODE-tune 2026-10-09, owner „8. doplň“)* `runar-privacy.html` jmenuje OpenAI a USA (text A + OpenAI, obě kopie EN) a FAQ
      `runar-help.html` „Is Rúnar an AI?“ říká GPT od OpenAI, Claude jen při výpadku (EN i IS). Zbývá jen zásady na agndofa.is
      (znění B v `RUNAR_PRIVACY.md` — doplnit OpenAI stejně jako A; publikuje owner).
    Obě stránky drží angličtinu dvakrát (statické HTML + slovník v JS) — při úpravě opravit obojí.

### Část 9 — shrine (admin appka, 2026-10-09)
**Platí:** volá jen nasazené funkce, všechny s přihlášením kromě jedné (níž) · po zrušeném rozboru GPT nezůstaly zbytky ·
zápisy do `gift_codes`, `runar_corrections`, `runar_character`, `runar_static_audio` kryje admin politika v DB.
**Opraveno rovnou:** náhled hlasu (teach) volal `elevenlabs-proxy` bez přihlášení → proxy ho od 2026-08-02 odmítal (401) a tlačítko
nefungovalo; teď posílá token jako sousední generování statického audia. 2026-10-10: dárkové kódy se losovaly přes
`Math.random()` (není kryptograficky bezpečné) → `crypto.getRandomValues` (32 znaků, rozložení ověřeno 32 000 losy). **Pro ownera:** nic.

### Část 10 — úložiště, přihlašování, git hooky, pomocné skripty (2026-10-10)
**Platí:** hook `hook_before_user_created` pustí registraci jen e-mailům z `allowed_emails` (uzavřený test) · trigger
`profile_tester_from_allowlist` dá testerovi premium a `is_tester` · `guard_life_rune_immutable` brání přepsat životní runu
z klienta · `ledger_user_profiles` zapisuje do `credit_ledger` i smazání účtu, přechod měsíce a změnu tarifu · git hooky v
`.git/hooks` jen volají `hooks/*.py` z repa (vždy aktuální) · z pomocných skriptů zapisuje do DB jen `scripts/nacti_cteni.js`
(id ověřené regexem, text escapovaný).
**Opraveno rovnou:** nic.

**PRO OWNERA:**
13. 🔴 **Do úložiště smí nahrát soubor kdokoli.** ➜ ✅ **opraveno 2026-10-10** (SQL spustil owner; v `storage` teď žádná politika — ověřeno `pg_policies`). Politika `service_role_upload 1rtepqd_0` na `storage.objects` (INSERT, role public,
    `WITH CHECK true`, bez omezení bucketu) → s veřejným klíčem z appky jde nahrát cokoli do veřejných `runar-audio` a `runar-images`
    (bez stropu velikosti i typu). Zneužití zatím žádné (55 + 1 souborů, poslední nahrání v květnu). Politika je zbytečná:
    jediné nahrávání (`elevenlabs-static`) jde přes service role, která RLS obchází. SQL pro ownera:
    `drop policy "service_role_upload 1rtepqd_0" on storage.objects;`
14. ⚪ **Smazání verze audia ve shrine nesmaže soubor** ➜ ✅ 2026-10-10 owner „smaž sirotky ručně“: `static/en/jera.mp3` a `static/is/ingwaz.mp3` (květen, bez záznamu ani odkazu v kódu) smazány přes `supabase storage rm`; sirotků 0 z 53. Pravidlo pro mazání nepřidáno — další smazaná verze zase nechá soubor. (`deleteVersion` → `storage.remove`): na `storage.objects` není pravidlo DELETE,
    chyba skončí v konzoli a soubor zůstane. Dnes 2 soubory v `runar-audio` bez záznamu v `runar_static_audio`. Volba: pravidlo
    „admin smí mazat v `runar-audio`“, nebo sirotky smazat ručně.
15. ⚪ **Stará kopie repa v `.claude/worktrees/modest-murdock-d57976`** ➜ ✅ odstraněna 2026-10-10 (owner „spusť úklid“, `git worktree remove`; větev zůstává, je sloučená). (větev z 2026-08-17, plně sloučená do `main`, bez vlastních
    commitů, jen dočasný `supabase/.temp`). Neškodí, ale grep přes repo z ní vrací zastaralý kód (2026-10-09 tak vyskočil
    `buildSysPromptV2` ve „volajících“). Nástroj appky na úklid ji nebere za svou. Úklid (spustí owner nebo Code se souhlasem):
    `git -C C:/Users/zkuku/Downloads/Runar-admin worktree remove --force .claude/worktrees/modest-murdock-d57976`.
### Část 11 — vkládání textu do stránky (XSS, 2026-10-10)
**Platí:** čtení, spready, myšlenka ✦ a Ask jdou do stránky přes `textContent`; deník a prohlížeče ve shrine (čtení, hlášení)
escapují každé pole (`escapeHtml` / `esc`). **Opraveno rovnou:** záložka životní runy dávala do `innerHTML` bez escapování text
životní runy, text založení a rozbor jména (od modelu; `life_rune_text` smí klient zapsat i sám) → `escapeHtml`. Dopad byl jen na
vlastní účet; v uložených textech 0 HTML značek, vzhled beze změny. **Pro ownera:** nic.

### Část 12 — tajné klíče a veřejné repo (2026-10-10)
**Platí:** v repu jsou jen dva JWT a oba mají roli `anon` (`v2/runar-config.js`, `show_corrections.py` — veřejný klíč, tak má být).
Celá historie gitu (všechny větve) bez klíče Anthropic (`sk-ant-api`), OpenAI (`sk-proj-`), Slack webhooku i serverového JWT
(`service_role` hledáno v base64 na třech posunech). Tajemství edge funkcí jsou jen v Supabase secrets. **Pro ownera:** nic.

### Část 13 — zálohy databáze (2026-10-10)
**PRO OWNERA:**
16. 🔴 **Produkční databáze nemá žádnou zálohu** (`supabase backups list`: prázdný seznam, obnova k okamžiku vypnutá). Kdyby se
    databáze poškodila nebo omylem smazala, deníky, kredity a profily jsou pryč. Podrobnosti a volby → sekce C „Zálohy / DR“.

### Část 14 — cizí kód načítaný appkou, přihlašovací e-maily (2026-10-10)
**Platí:** jediný cizí skript je supabase-js z jsDelivr (+ fonty Google); SW ho nepředukládá. DNS therunekeeper.com pro e-mail
s kódem: DKIM Brevo (`brevo1`/`brevo2`) a DMARC `p=quarantine` nastavené; SPF obsahuje jen Google — Brevo na sdílených IP SPF
nevyžaduje, DMARC projde přes DKIM. (Že kód zatím nikomu neodešel, řeší CODE-tune — BACKLOG 054a907.)
**Opraveno rovnou:** supabase-js se načítal jako `@2` bez otisku → každé nové vydání 2.x se všem nahrálo samo a bez kontroly; teď
pevná verze 2.117.3 + SRI v `runar-reader.html` i `runar-shrine.html` (bajtově tentýž soubor, co se servíroval). Povýšení:
`node scripts/utils/supabase_js_pin.js` vypíše novou adresu a otisk — opravy z nových vydání už nepřijdou samy. **Pro ownera:** nic.

### Část 15 — nasazené funkce proti repu, strop útraty u poskytovatelů (2026-10-10)
**Platí:** všech 10 nasazených edge funkcí staženo a porovnáno s repem — shodné; jen `elevenlabs-proxy` a `elevenlabs-static`
se liší komentáři z kontroly 2026-10-09 (kód stejný, nasazovat netřeba). Náklady modelů za 30 dní ~2,9 $ (čtení 1,91 $ + Ask 0,98 $;
`node scripts/utils/stats.js`), hlas drží plán ElevenLabs (strop znaků). Strop OpenAI → 429 → `claude-proxy` přepne na Claude.

**PRO OWNERA:**
17. ⚪ **Měsíční strop útraty u OpenAI a Anthropicu není nikde zapsaný.** Rúnar stojí na modelech pár dolarů měsíčně; strop (třeba
    desítky dolarů) zastaví účet, kdyby chyba v kódu nebo uniklý klíč začaly generovat ve smyčce. Anthropic: Organization settings →
    Billing → Spend limits; OpenAI: hard limit projektu / organizace (od července 2026). Nastavuje owner v konzolích.
    **Stav 2026-10-10 (snímky ownera):** OpenAI strop 100 $ + upozornění 80 % a 100 % ✅. Anthropic strop 1 000 $ (výchozí) — návrh snížit
    (~50 $) a přidat upozornění; u Anthropicu hláška „Add a card“ — auto-reload jede přes Link bez karty, při selhání by došel kredit zálohy.
    ✅ **Hotovo 2026-10-10 (owner):** Anthropic strop 20 $, karta přidaná. (Do stropu se počítají i testy přes Claude API.)
18. ⚪ **Supabase Free projekt se po týdnu bez aktivity uspí** — appka pak nejede, dokud ho někdo ručně neprobudí (Dashboard → Resume;
    data zůstanou, e-mail týden předem). Dnes nehrozí (denní provoz; nejspíš i denní záloha — jestli se dotazy přes CLI počítají
    jako aktivita, dokumentace neříká). Zmizí s přechodem na Pro před produkcí (DECISIONS 2026-10-10 (9)).

### Část 16 — webhook hlášení, tabulky po zrušených funkcích, README (2026-10-10)
**Platí:** trigger `notify-report` na `bug_reports` posílá hlavičku s tajemstvím a funkce odpovídá 200 (`net._http_response`,
6 posledních odpovědí, víc pg_net nedrží). `runar_character` používá appka i shrine; `rate_limits` a `allowed_emails` čtou DB funkce.
**Opraveno rovnou:** `README.md` popisoval nástroj z verze 1 (shrine jako appka, 2 funkce místo 10, korekce „na každý výstup“ —
post-processor je pryč od 2026-08-09, návody na jazyk a tarif neodpovídaly kódu, odkaz na už smazanou stránku verze 1) → krátký rozcestník,
který nic neopisuje a odkazuje na vlastníky (§20).

**PRO OWNERA:**
19. ✅ *(KUKY 2026-10-11: „nech jako historii“ — obě zůstávají, nic se nemaže. Obsah prošel CODE-read: knowledge_base = 3 výklady ve starém
    hlasu (nepoužitelné jako text; jediná stopa: Fehu ↔ Gullveig podle Susan Gitlin-Emmer, v kánonu není — owner 2026-10-11 „to asi řešit nebudeme“, nenavrhovat znovu); gpt_reviews = 6 rozborů luny ke
    starým verzím promptu v4.58–v4.94, dnes jen historie.)* **Dvě tabulky bez kódu:** `knowledge_base` (3 výklady run z května, záložka Teach už do ní nepíše) a `gpt_reviews` (6 rozborů
    GPT z adminových čtení; funkce zrušena 2026-10-09, zápis v `RUNAR_PRIVACY.md`). Nic na nich nevisí; smazat nebo nechat jako historii
    rozhodne owner (data maže owner). Obě jsou v denní záloze.

### Část 17 — zastaralá místa z dřívějška (2026-10-10; owner: *„jak jsi našel README, možná najdeš víc míst… pozor na to“*)
Hledáno strojem, ne náhodou: (a) jména souborů v komentářích kódu, která neexistují; (b) dokumenty mimo hlavní sadu podle stáří;
(c) stopy po změněných věcech (přihlášení odkazem, staré modely, týdenní příděl); (d) odkazy v `memory/`.
**Opraveno rovnou:** hlavička `runar-reporter.js` odkazovala na spec, který v repu nikdy nebyl · `RUNAR_SEGMENTATION_SPEC.md` (plán
z léta, „SW v109“, formát bez ✦) a jednorázová předávka `DOCSYNC_HANDOFF_2026-07-04.md` → `docs/archive/` s hlavičkou ·
mapa promptu (stav v4.15, zmiňuje Opus 4.8/Sonnet) dostala viditelné „snímek k 2026-09-06, pravda je kód“ — 2026-10-11 zrušena
a archivována (`docs/archive/runar-prompt-map.html`, owner „zrušit a archivovat“).
✅ **Hotovo CODE-tune 2026-10-10 (c81b4da, nasazeno):** zbytky „magic link“ po přechodu na kód — shrine teď jen Google (oba admini ho mají), nápověda EN+IS kódem, výchozí text okna z UI_TEXT, `weekly_drip` pryč. Původně: **shrine přihlášení e-mailem nefungovalo** (posílá kód, pole na kód nemá;
Google funguje), nápověda slibuje odkaz (EN 2×, IS 1×), výchozí text okna v `runar-reader.html`; mrtvé pole `weekly_drip` v `TIER_LIMITS`.
**Bez nálezu:** odkazy v `memory/` (zástupná jména, gitignorované sloty, historie stromu); `docs/findings/` jsou datované záznamy běhů.
~~Nepřezkoumáno: `docs/TREE_BRIEF_CODE_2026-07-04.md` a `RUNAR_TREE_RENDER.md` (strom = CODE-tree).~~ ✅ **Přezkoumala CODE-tree 2026-10-11:**
brief dostal hlavičku historické předávky (odkazy na přesunuté dokumenty a zaniklý lab), `RUNAR_TREE_RENDER.md` tvrdil „nic z toho není
v kódu“ — kůra má v labu dva odložené pokusy, opraveno.
**Mechanismus (§30), aby to nehlídala pozornost:** nová smoke ㉺ `scripts/verify_code_doc_refs.js` — komentář v kódu nesmí odkazovat
na `*.md`, který v repu není (⑯ hlídá jen dokumenty). Záměrné zmínky nesou `doc-links:ok <datum> <důvod>`. Cestou opraveno `CLAUDE.md` §16:
„RUNAR_DOC_SYNC.md je v docs/archive/“ — není, archiv má jen `RUNAR_DOC_SYNC_CODE.md`.
**Pokračování 2026-10-10:** `CLAUDE.md` „Stack: … Claude API“ → model čtení přes `claude-proxy` (`SOL_MODEL`, záloha `MODELS`); rozcestník
`MEMORY.md` totéž · `RUNAR_DESIGN.md` sekce tarifů odporovala kódu ve 4 bodech (Kříž/Podkova „ani za kredity“, Norny „za kredity“,
rozbor jména „pouze Premium“, tabulka stromu podle tarifů) → opraveno s odkazem na vlastníky a s vyznačením, co tam stálo.
~~Pro CODE-tune (⚪)~~: ~~`buildLifeRuneBase(…, isPremium)` parametr nepoužívá — mrtvý (nebo chybějící) rozdíl Premium~~ *(hotovo 2026-10-11,
DECISIONS 2026-10-11 (22): parametr i nečinný režim `life_rune_premium` pryč, golden beze změny)*; ~~`RUNAR_PRICING.md`
tabulky nákladů nesou štítek „Claude API“, čte ale GPT-6 sol (levnější) — přepočet a štítky patří k pricingu.~~ *(hotovo 2026-10-11:
přepočteno na sol z dat produkce, `scripts/utils/pricing_tabulka.js`)*
Pro CODE-tune (⚪, s příštím nasazením `claude-proxy`): komentář clampu `max_tokens` (ř. ~540) jmenuje zrušený režim `life_rune_premium`
„2000“ jako největší legitimní čtení — dnes je největší `life_rune_standard` 1200 (`RUNAR_MODES`). Strop 2500 zůstává správně; jen
komentář. Samostatně nasazovat nestojí za to — commit funkce bez nasazení by rozdělil repo a produkci.
✅ *(CODE-tune 2026-10-11, s nasazením hlasu ke čtení: hotovo — komentář jmenuje, kde největší požadavek bydlí: dnes výklad
Yggdrasil (`SPREAD_CONFIG`, 1800), ne `life_rune_standard` 1200, jak stojí výš)*
`RUNAR_DESIGN.md`: „Standard+“ u Kříže a Horseshoe pryč; tabulka faktorů čtení vedla životní runu jako čočku (odešla 2026-09-25)
a „spready TODO / `RP_SINGLE.priority`“ (spready doménu i rejstřík mají, pole v kódu není) · `memory/README.md` přepsán na rozcestník
(„dvě session“ s prohozenými rolemi, `runar-project.md` jako sklad) · BACKLOG: položka „PRICING model na Opus“ → cíl je sol; hotový
Ask „jen premium“ → poznámka `ASKS_PER_READING`.
✅ gitignorovaná složka `_cowork_snap/` (snímek 22 souborů ke commitu 92255b9, 2026-07-21; nic ji nepřegenerovává)
— diffem ověřeno, že se všech 22 shoduje s gitem, nic jedinečného. Je 2,5 měsíce stará (obsahuje i smazaný starý modul Gatheringu)
a kdo ji čte, čte starý stav. ✅ **Smazáno 2026-10-10** (owner: *„9. smaž“*); obnovitelné z `git show 92255b9:<cesta>`.
**`runar-help.html` — co Část 8 nechytila (2026-10-10):** tabulka souborů a pořadí načítání v `CLAUDE.md` = skutečné `v2/` (ověřeno).
- ✅ *(CODE-tune 2026-10-10, 67316bf; zpětně ověřeno CODE-read — RUNES = 25 i s Blank, „plus the Blank“ ho počítalo dvakrát)* **Pro CODE-tune (copy):** (a) „How a reading works“ slibuje čtení **ve dvou vrstvách** (krátká + hlubší) a „nit mezi taženou a
  životní runou“ — čtení je jeden plynoucí blok (CLAUDE.md „Unified format“) a životní runa ze čtení odešla 2026-09-25 (jen Ask);
  EN statické HTML ř. ~125 + slovník ř. ~289, IS ř. ~343. (b) „Rúnar's voice“: „v Kolekci zazní předtočený **tón**, vždy stejný,
  nota, ne čtení“ — Kolekce ukáže **text** a přehrávač, Rúnar ho **mluví**, verze se losuje (`runar-app.js` `pick = rows[random]`).
- ✅ *(CODE-tune 2026-10-10, b2f50b7: „up to {VOICE_MONTHLY_LIMIT} … each month“, IS přepsán s korpusem; td-card bez hlasu)* **(c) — hlas slibuje víc, než server pustí:** `TIER_FEATURES` klíč `voice` (`runar-config.js`) píše „Rúnar's voice
  reads every reading aloud“ / „…les hverja … upphátt“ a nápověda „When you use a reading card, Rúnar speaks your reading aloud“
  (s4 odst. 2, `td-card`). Server ale pustí hlas **nejvýš `VOICE_MONTHLY_LIMIT` za měsíc** (`elevenlabs-proxy`, KUKY
  2026-09-11 „spíš ochutnávka“) a na kartu vázaný není. Číslo do textu přes `VOICE_MONTHLY_LIMIT` (§8), ne natvrdo.
  ⚠️ **OPRAVA 2026-10-10 (KUKY):** „plošně všem“ bylo zavádějící — strop serveru není nárok. Rune Seeker má **jedno volné čtení = jeden
  hlas, jednou**, další jen s kreditem; tahle věta vyrobila chybný řádek u Rune Seekera v appce. DECISIONS 2026-10-10 (42).
  ✅ Chybný řádek opraven 2026-10-10 (CODE-tune, DECISIONS (45)) — věta se skládá podle tieru a hlídá ji `verify_tier_features.js` (6).
- ✅ *(rozhodnuto 2026-10-10, DECISIONS 2026-10-10 (22): Starter 5 · Seeker 10 · Walker 20 · Wanderer 30 · Elder 50, ceny 3. 6.; `RUNAR_PRICING.md` opraven)* **ceny balíčků kreditů:** nápověda (tabulka v HTML, od 2026-05-20) a `RUNAR_PRICING.md` (od 2026-06-03) se liší:
  nápověda 4 balíčky (Seeker 10 = 2.690 kr, Wanderer 20 = 5.050 kr, Elder **50** = 11.900 kr + ceny v €), PRICING 5 balíčků
  (Seeker 2.490 · Wanderer 4.490 · Elder **30** = 6.490 · Master 50 = 9.990, bez €). Shoda jen Starter 5 = 1.490. Novější je PRICING,
  ale fyzické karty můžou mít natištěno — **která tabulka platí?** Pak ji drží jedno místo (§20) a nápověda ji čte.
- ✅ *(CODE-tune 2026-10-10, b2f50b7: `CARD_PACKS` v configu, nápověda z nich skládá tabulku, € pryč; zpětně ověřeno CODE-read — hodnoty = DECISIONS (22); `RUNAR_PRICING.md` převeden na odkaz)* **(d):** tabulka balíčků v `v2/runar-help.html` (statické HTML + `pt-*` v EN i IS) podle DECISIONS 2026-10-10 (22) —
  5 řádků, ISK z `RUNAR_PRICING.md`, € sloupec pryč (€ ceny owner neurčil). Ideálně balíčky jako data v configu a nápověda je čte (§20),
  ať je druhá kopie pryč úplně.

### Část 18 — Service Worker a PWA; ráčna textu podle jazyka (2026-10-10)
**Platí:** všechny soubory v předem ukládaném seznamu `v2/sw.js` existují a seznam hlídá ㉧ proti `runar-reader.html` · HTML ze sítě,
JS z cache — po převzetí nové verze se appka jednou sama obnoví (`controllerchange` v `runar-auth.js`), takže smíchání starého JS
s novým HTML trvá jen do toho reloadu · manifest (rozsah, start, ikony) sedí s cestami.
**Opraveno (CODE-read):** ráčna ㉸ viděla jen větev `lang === 'is' ? '…'`, která ZAČÍNÁ uvozovkou. Teď čte celou islandskou větev
(literály na nejvyšší úrovni, ne klíče v argumentech, ne komentáře) → našla dvě, BASELINE je drží.
- ✅ *(CODE-tune 2026-10-10, 0d0386c: `tree_rs_free_line` v UI_TEXT, `openUpgradeModal` smazán, BASELINE {}; ověřeno CODE-read — ㉸ „žádný v žádném souboru“)* **(e):** `runar-tree.js` ~476 — řádek volných čtení v záložce životní runy má EN i IS větu natvrdo
  (`vn(...) + ' fyrir venjulegar dregnar rúnir'` / `' available for regular draws'`) → UI_TEXT + `tp()` s `{casts}`; IS ověřit (§2).
  `runar-auth.js` ~334 `openUpgradeModal` — nikdo ho nevolá (grep), text natvrdo; smazat. Po obou snížit BASELINE v `verify_lang_ternary.js`.

### Část 19 — soubory v `v2/`, na které nic neodkazuje (2026-10-10)
**Platí:** všechny `.js`/`.html`/`.css` ve `v2/` něco načítá · `v2/email/*.png` (CODE-tune 2026-10-10) odkazují koncepty e-mailů
testerům v Gmailu přes adresu — v repu odkaz NEMÁ být, nemazat.
- ✅ *(KUKY 2026-10-10: „nemazat, je to designový podklad, dej tomu vysvětlení a odkaz“ → `v2/assets/README.md` popisuje každý obrázek, odkaz z `RUNAR_DESIGN.md` „Jak vypadá“; `v2/runar-portrait.png` = bajtově shodná kopie, ponechána)* `v2/assets/` (7 obrázků z 2026-05-17: moodboard, paleta, Rúnar ceremonial/expressions/fullbody/portrait/travel)
  a `v2/runar-portrait.png` (2026-05-16, „hero“) — **nic v repu na ně neodkazuje**, ~19 MB, nasazené veřejně na GitHub Pages.
  Appka bere Rúnarův portrét ze Supabase úložiště (`runar-images/Runar_portrait.png`). Smazat z repa (historie v gitu zůstane),
  nebo nechat jako designový podklad?

### Část 20 — překlady UI_TEXT (2026-10-10)
**Platí:** EN a IS mají stejných 370 klíčů (`check-translations.py`).
**Opraveno (CODE-read):** nová kontrola **smoke ㉽** (`scripts/verify_ui_text_used.js`) — klíč, který nic nečte, nesmí přibýt
(ráčna podle jmen, samotest + útok obrácenou pákou: vyřazený klíč z BASELINE kontrolu shodí). Našla **35 mrtvých klíčů** v obou
jazycích: editor charakteru a test hlasu (`char_*`, `test_*`, `save_char_btn`, `version_lbl`, `preview_btn`, `st_char_*`, `st_restored`,
`st_no_versions`, `st_no_table`, `st_name_req`, `st_listening`, `runar_responds`), starý formulář (`dob_lbl`, `area_hint`, `seek_hint`,
`intention_hint`, `commit_btn`, `continue_btn`, `setup_someone_lbl`, `reading_ready_note`), staré Norny (`spread3_*`, `ritual_3readings`),
`tab_reader`, `error_prefix`, `visitor_label`, `tree_signin_note`, `rs_banner_counter`.
- ✅ *(CODE-tune 2026-10-10, f424aee: 35 klíčů pryč EN i IS, BASELINE ㉽ prázdný; ověřeno CODE-read — ㉽ „335 klíčů, 0 mrtvých“)* **(f):** smazat těch 35 z `runar-translations.js` (EN i IS) a vyškrtnout je z `BASELINE` ve `verify_ui_text_used.js`.

### Část 21 — mrtvý kód: top-level konstanty a funkce ve `v2/*.js`, na které nic neodkazuje (2026-10-10)
Metoda: každé `const/let/var/function` na nejvyšší úrovni, jehož jméno se mimo definici a komentáře neobjeví v žádném `v2/*.js|html`
(16 kandidátů), pak `git grep -w` přes celé repo + komentář u definice.
**Mrtvé záměrně (komentář to říká, nechat):** `buildSysPromptV2`, `_lensContext` (laboratoř, §26) · `_randomAspect/_randomImagery/
_randomRegister/_randomPlacement` + jejich pooly (ve `runar-utils.js`, „NEVER called… do NOT wire without a decision“) · `TREE_UPDATE`
(adresa nenasazené `tree-update`, kód pro CODE-tree) · `PATTERN_WINDOW`, `TRANSFORMATION_PAIRS` (čekají na `detectPatterns`).
**Opraveno (CODE-read):** komentář u mrtvých poolů v `runar-utils.js` posílal do `SEASON_POOLS` jako „produkční obraznosti“ — ty se do
čtení nedostanou (CLAUDE.md „Obraznost“); teď `RUNE_IMAGES`. Jen komentář.
- ✅ *(CODE-tune 2026-10-10: (1)–(5) pryč; po cestě i zbytek zkušebního počítadla — `getTrialCount`/`incTrialCount` se jen zapisovaly,
  `?reset_trial=1` — druhá kopie `t()` v `runar-app.js` (přebíjela stejnou z utils) a zastaralé hlavičky závislostí v reading/auth.
  (6) `AETTY` ponecháno jako rezervované pro `detectPatterns` (komentář u definice, jako `PATTERN_WINDOW`); CLAUDE.md ho omylem vedl
  pod configem, opraveno. Smoke ㉼ teď chytá i chybu JS za běhu — bez toho by prošlo vrácené volání smazané funkce při startu appky.)*
  ✅ *(hotovo 2026-10-11: `_shared/el_voice.ts`, nasazeno proxy v37 + static v16, DECISIONS 2026-10-11 (28))* ~~**Zbývá ze (4):**~~ nastavení hlasu (`voice_settings`) stojí dvakrát na serveru — `elevenlabs-proxy` a `elevenlabs-static`. Oprava =
  přesun do `supabase/functions/_shared/` (vzor `voice_usage.ts`) a nasazení obou funkcí; do té doby se změna hlasu musí udělat na obou.
- ~~**Pro CODE-tune (g):**~~ (1) `runar-app.js` `FREE_TRIAL_LIMIT`, `DELAY_TRIAL_END` — zkušební čtení návštěvníka zrušené (od 2026-08-02,
  `TIER_LIMITS.free_trial.onboarding` sám říká „historické“); hlavičky `runar-auth.js:6` a `runar-reading.js:7–8` je dál vypisují.
  (2) `_updatePrivacyBannerText`, `dismissPrivacyBanner` (nikdo nevolá) a `_initPrivacyBanner` (volá se, ale je prázdný) — mrtvý řetěz
  starého banneru. (3) `DEF_CHAR` = alias na `DEF_CHAR_EN`, nikdo ho nečte (shrine ho jen zmiňuje v komentáři). (4) `EL_VOICE_SETTINGS`
  v configu nikdo nečte — nastavení hlasu mají obě edge funkce vlastní (třetí kopie, §20). (5) `runar-app.js` ~45–47 osiřelý komentář
  „Reading angles…“ bez kódu pod ním. (6) `AETTY` (`runar-runes.js`) — komentář „Used for: pattern detection, visual pulse, Gathering
  triggers“, nic z toho nepostaveno a nic ho nečte → buď „rezervováno pro detectPatterns“, nebo pryč; CLAUDE.md ho vede mezi daty, která
  „čtou obě session“.

### Část 22 — edge funkce: tajné proměnné a kopie hodnot z configu (2026-10-10)
**Platí:** všech 7 proměnných, které funkce berou přes `Deno.env.get`, je v Supabase nastavených (`supabase secrets list`, jen jména).
Každou kopii configu v edge funkcích hlídá kontrola: `MONTHLY_LIMITS`, `ASKS_PER_READING`, `VOICE_MONTHLY_LIMIT`, `NAME_LORE_LIMIT` (⑨
`verify_monthly_limits.js`), seznam adminů (㉪), skládání uloženého textu (`verify_compose_mirror.js`).
**Známé, nic nového:** `spread_cost` (kolik jednotek se strhne) dál posílá klient, server ho jen ořízne na 1–9 → upravený klient může
zaplatit méně = „Proxy Fáze 2“ #4 (výš v BACKLOGu; pokus 2026-08-03 vrácen). Skutečná oprava = skládat prompt/typ čtení na serveru —
táž položka jako „Kam s databází, promptem a hostingem“.

### Část 23 — styly bez prvku (`runar-reader.css`, 2026-10-10)
Metoda: každá `.třída`/`#id` z CSS, jejíž jméno se nevyskytuje v žádném `v2/*.js|html` (ani jako skládaný prefix `'x-' +` / `x-${}`).
- ✅ *(CODE-tune 2026-10-10: všech 34 tříd pryč — 45 pravidel. Ověřeno nezávislým skenem (34 = 33 + `.btn-outline`, který skenu
  zakryl prefix `mode-btn-${}`) a porovnáním obrazovek: tatáž stránka se starými a novými styly, 12 stavů × počítač i mobil, návštěvník
  i přihlášený — 24/24 snímků pixelově shodných; kontrola „nic neměním“ shodná, podstrčená změna živého stylu o 1 px chycena přesně
  v otevřeném bočním panelu. Pozn.: `.sp-item.signout` (čára nad „Odhlásit“) se nikdy nepoužil — tlačítko má jen `.sp-item`.)*
  ~~**Pro CODE-tune (h):**~~ ~34 mrtvých selektorů — celý starý blok deníku `.journal-*` (33 řádků od ~768: section/header/count/toggle/
  body/entry/rune-glyph/meta/date/excerpt/area-tag/expand-btn/deep*/life-rune), starý boční panel `.sp-row`, `.sp-account-label`,
  `.sp-tier-sub`, `.sp-path-gift-note`, `.sp-higher-path-lbl`, `.signout`, `.dd-item`, `.btn-outline`, strom `.tree-or-sep`,
  `.tree-upgrade-block`, `.tree-upgrade-note`, `.tree-lifelens` (čočka odešla 2026-09-25), `.badge-meta-lbl`, `.badge-name`, `.rs-link`.
  Napřed v náhledu ověřit, že se nic nerozbije (§32 základ), pak smazat.

### Část 24 — pomocné skripty a paměť: odkazy na to, co už neexistuje (2026-10-10)
**Platí:** žádný skript ve `scripts/` nevolá funkci ani konstantu, která z `v2/` zmizela (jediný nález `SEASON_LABELS` ve
`verify_contract_wiring.js` je záměrný — hlídá, že se smazaná věc nevrátí). Cesty v `memory/*.md` existují; chybějící jména jsou
záměrně negitované (sloty `_patch*.py`, místní data stromu) nebo šablona názvu.

### Část 25 — schéma databáze v repu × v databázi; co nese záloha (2026-10-10, jen čtení)
**Platí:** RLS zapnuté na všech 15 tabulkách · každá funkce `SECURITY DEFINER`, která hýbe penězi nebo daty (`add_credits`, `use_credit`,
`use_free_balance`, `append_follow_up`, `check_rate_limit`…), smí spustit JEN `service_role`; dvě spustitelné pro `anon/authenticated`
(`guard_life_rune_immutable`, `ledger_user_profiles`) jsou triggerové — přímo zavolat nejdou · všech 7 `.rpc()` volání míří na
existující funkci.
**Zjištěno:** repo databázi **neumí postavit znovu**. Bez `CREATE TABLE` v `sql/` jsou hlavní tabulky (`user_profiles`, `readings`,
`gift_codes`, `runar_corrections`, `runar_static_audio`, `runar_character`, `rate_limits`, `knowledge_base` — vznikly v dashboardu)
a bez `CREATE FUNCTION` `add_credits`, `check_rate_limit`, `update_updated_at`. Pravdu o schématu nese jen databáze — a záloha.
**Opraveno (CODE-read):** `scripts/utils/zaloha_db.js` nesl sloupce/politiky/funkce/triggery/omezení, ale **ne** oprávnění k funkcím,
zapnuté RLS, granty tabulek, indexy ani rozšíření. Obnova by `add_credits` (připíše kredity komukoli) vytvořila s výchozím EXECUTE pro
PUBLIC a nikdo by to nepoznal. Doplněno; ověřeno ostrým během + rozbalením archivu (`schema.json`: oprávnění 21, RLS 15, granty 41, <!-- doc-links:ok 2026-10-10 schema.json je soubor uvnitř šifrovaného archivu zálohy, ne v repu -->
indexy 53, rozšíření 6; `add_credits` → jen `service_role`).
- ⚪ **Při přesunu databáze (Hetzner, „Kam s databází…“ výš):** napřed `pg_dump --schema-only` z produkce do `sql/` jako výchozí schéma
  (tam už Docker netřeba) — teprve pak bude repo schopné databázi postavit. Do té doby obnova = data z JSON + struktura podle `schema.json`. <!-- doc-links:ok 2026-10-10 schema.json je soubor uvnitř šifrovaného archivu zálohy, ne v repu -->

### Část 26 — mechanismy §30: hooky a čísla kontrol (2026-10-10)
**Platí:** všechny hooky, které CLAUDE.md a paměť jmenují, existují a jsou zapojené (`~/.claude/settings.json`): API guard (PreToolUse <!-- doc-links:ok 2026-10-10 uživatelský soubor v ~/.claude, mimo repo -->
Bash|PowerShell — zablokoval naostro i můj vlastní testovací příkaz s `gen_direct.js`; neškodný příkaz pustí; pokusy jdou do logu),
Stop přes `tree-guard.sh` → záloha čtení z pokusů (běží, exit 0) + kontrola zprávy ownerovi + hlášení bez zápisu (§29, čte
`~/.claude/runar-hlaseni-k-zapisu.json`), SessionStart → kontext po compactu, PreCompact → záloha. <!-- doc-links:ok 2026-10-10 uživatelský soubor v ~/.claude, mimo repo -->
Každé číslo kontroly, na které se docs odvolávají („hlídá smoke ⑩/㉛/㉧…“), ve smoke existuje — kromě jednoho.
**Opraveno (CODE-read):** `RUNAR_DESIGN.md` psal „smoke ㊱“ (kroužkové 36), smoke ale od ㉟ pokračuje znaky ㉠, ㉡… (`chr(0x3260)`…)
a register obrazu tiskne jako ㉠ → ve výpisu nedohledatelné. Opraveno na ㉠ + jméno skriptu. (Zápisy v DECISIONS nechány, append-only.)

### Část 27 — inline JavaScript ve stránkách (`runar-shrine.html`, nápověda, soukromí; 2026-10-10)
**Platí:** žádná funkce ani konstanta v inline `<script>` stránek není mrtvá (shrine 110 definic, nápověda 15, soukromí 7). Nula je
podezřele čisté číslo → ověřeno protipříkladem: podstrčené dvě nevolané definice sken našel, volanou vynechal.

### Část 28 — popisy run (`RUNAR_POPISY_RUN.md`, 2026-10-10)
**Platí:** data run neopisuje (odkazuje na `runar-runes.js`), texty jsou ownerovy doslovné; má všech 25 run v pořadí `RUNES` včetně Blank.
- ⚪ **Pro ownera / Cowork (obsah, nespěchá):** hlavička píše „Společný tvar… pozorování, ne pravidlo — pravidlo vznikne, až jich bude
  25+“. Popisů je teď 25 — spouštěč nastal, pravidlo nikdo nesepsal. Jen připomínka; CODE do obsahu nesahá.

### Část 29 — ㉸ slepé místo: jazyková větev přes zkratku (2026-10-10; nález CODE-tune)
`isIs ? '…' : '…'` (zkratka `var isIs = lang === 'is'`) a jiná jména jazykové proměnné (`L`, `_lifeRuneLang`) ㉸ neviděla — tři živé
UI texty prošly zeleně (CODE-tune je přesunul, e9c1e96). **Opraveno (CODE-read, 15a5103):** zkratky si kontrola najde sama; hodnota CSS,
jméno klíče ani locale se nepočítají (samotest).
- ✅ *(CODE-tune 2026-10-10: UI část — auth 2 → 0 (UI_TEXT `install_body_ios`/`install_body_other`), config 1 → 0 (`TIER_FEATURES_ALL`
  v configu, ne v UI_TEXT: výpis tierů skládá i nápověda, která překlady nenačítá). Znění beze změny: okno instalace EN/IS × iOS/jiný
  a `tierFeatures` 6 tierů × 2 jazyky před a po shodné. BASELINE snížena.)* **(i) UI část.**
- ⚪ **Pro CODE-tune (i), zbytek:** `runar-character.js` 15 + `runar-utils.js` 7 (text a značky promptu → jazykové balíčky; změna
  builderu = golden-verify, §18.3). Po přesunu snížit BASELINE.
- ~~**Pro CODE-tune (i):**~~ ráčna drží 25 větví — `runar-auth.js` 2 (návod k instalaci Safari/Chrome, UI) · `runar-config.js` 1 („Allt sem …
  hefur“ ve výpisu tierů, UI) · `runar-character.js` 15 + `runar-utils.js` 7 (text a značky promptu → jazykové balíčky). Po přesunu snížit BASELINE.

### Část 30 — kořen `docs/`: co tam leží jako živé (2026-10-10)
**Platí:** `docs/monitor/ozveny.md` živý · mapa promptu od 2026-10-11 v `docs/archive/` (zrušena, owner) · `docs/TREE_BRIEF_CODE_2026-07-04.md`
vede `RUNAR_TREE.md` výslovně jako historickou poznámku (strom = CODE-tree, nesahám).
**Opraveno (CODE-read, doména Vegvísir):** šest pracovních dokumentů `docs/vegvisir-*.md` leželo jako živé a ani jeden neříkal, že je
Vegvísir je na pár dní odložený (owner 2026-10-10: „pořád se na něm pracuje… odložený na pár dní“). Každý dostal pod nadpis řádku s odkazem
na vlastníka stavu (sekce „Vegvísir“ výš) a na DECISIONS 2026-09-27 (3) (4) (6); u krajin a momentů i dřívější odložení (3).
Do archivu nejdou — jsou podklad pro návrat (§26).

### Část 31 — sliby zásad soukromí × kód: odhlášení z analýzy (2026-10-10)
**Platí:** přepínač v appce zapisuje `user_profiles.analytics_opt_out`; `list-readings` (prohlížeč čtení ve shrine) i
`export_readings.js` odhlášené vynechávají. Dnes odhlášených **0 ze 4** — škoda nevznikla.
**Opraveno (CODE-read):** 11 skriptů četlo `readings` napřímo bez filtru — i ty, které dělají právě analýzu kvality (`nacti_cteni`,
`monitor_ozveny`, `najdi_cteni`, `oblasti_slova`, `find_seeds`, `archive_batches`, `oblouk`, `verify_no_recur`, návod v `delky_cteni`).
Filtr má teď JEDNO místo `scripts/utils/cteni_analyza.sql` (+ `cteni_analyza.js`), skripty ho čtou místo tabulky. Náklady a provozní
souhrny (`naklady.py`, `stats.js`) čtou všechna čtení se značkou `opt-out:ok <datum> <důvod>`. Hlídá **smoke ㉾** (`verify_opt_out.js`).
Ověřeno: poddotaz dá 564 = 564 (nikdo odhlášený) a při předstíraném odhlášení všech 0; `verify_no_recur.py`, `oblasti_slova.js`,
`stats.js` naostro běží; `nacti_cteni.js` jen syntaxe (označuje hlášení — nespouštět naprázdno).

### Část 32 — slib „smazání účtu smaže všechno“ × co se opravdu smaže (2026-10-10, jen čtení)
`delete-account` odpojí `gift_codes.used_by` a smaže uživatele v `auth`; zbytek nesou cizí klíče. **Platí:** `readings`, `user_profiles`,
`tree_state`, `gpt_reviews` → `ON DELETE CASCADE` · `voice_usage` → `SET NULL` (anonymní účetní řádek) · `credit_ledger` bez vazby
(UUID už nemá s čím spojit) a `bug_reports` bez vazby na účet — obojí zdůvodněné v `RUNAR_PRIVACY.md`.
- ✅ *(CODE-tune 2026-10-10: před `deleteUser` se ze seznamu smaže přesná shoda e-mailu bez ohledu na velikost písmen, NE `ilike`
  (zástupné znaky %, _ a * PostgREST); selže-li to, účet se nesmaže. Typy ověřené `tsc --strict`. **Nasazeno** na ownerovo „ano, nasaď“
  — verze 8, DECISIONS 2026-10-10 (43).)* ~~**Pro CODE-tune (j):**~~
  `allowed_emails` (seznam pozvaných testerů, e-mail) smazání účtu **přežije** — stránka soukromí ale slibuje
  „Email address — until account deleted“ a „ERASURE: Everything goes“. `delete-account` má smazat i řádek s e-mailem mazaného
  (`delete from allowed_emails where lower(email) = lower(<e-mail z auth>)`, PŘED `deleteUser`) + nasadit. Dnes 5 e-mailů, žádný nemá
  účet → slib zatím porušený nebyl; poprvé by byl u testera, který si účet založí a smaže. Není to nové rozhodnutí, jen kód podle slibu.

### Část 33 — slib „data zůstávají v EHP“ × kam data opravdu tečou (2026-10-10)
**Platí:** Supabase projekt je v `eu-west-1` (Irsko) — sedí se stránkou soukromí i nápovědou. Čtení do USA (OpenAI, záloha Anthropic) a hlas
(ElevenLabs) stránka uvádí.
- ✅ *(KUKY 2026-10-10 „hostuj u nás“ → hotovo CODE-read, DECISIONS 2026-10-10 (32); ověřeno v prohlížeči: 0 požadavků na Google)* **(a) — písma Google:** reader, nápověda, soukromí i shrine načítají Cinzel a Cormorant Garamond z `fonts.googleapis.com`
  → prohlížeč KAŽDÉHO návštěvníka pošle Googlu svou IP; stránka soukromí Google nejmenuje. Německý soud (LG München I, 2022-01-20)
  tohle uznal za porušení GDPR. Písma jsou pod licencí OFL → dají se hostovat u nás (`v2/fonts/` + `@font-face`, + do precache `sw.js`).
  Doporučení CODE-read: hostovat u sebe (CODE-tune), stáhnout soubory písem = s ownerovým ano.
- ✅ *(KUKY 2026-10-10 „7. ano, 30 dní“ → CODE-tune: `zaloha_db.js` maže archivy DB starší než 30 dní lokálně i na Drive, samotest
  `--test-lhuta`; zásady EN + IS „Each copy is deleted after 30 days…“ a u výmazu „from our encrypted backups within 30 days“; DECISIONS
  2026-10-10 (36).)* ~~**Pro ownera — jak dlouho držet zálohy:**~~ `zaloha_db.js` staré archivy nemazal → data smazaného účtu v zálohách
  natrvalo, zásady přitom slibují „Everything goes“. **Hranice:** maže se s denní zálohou — když je počítač vypnutý, smaže se při příštím
  běhu; smazané z Drive může ještě až 30 dní ležet v koši Google (stojí v zásadách).
- ✅ *(KUKY 2026-10-10 „teď a, s Hetznerem b“, DECISIONS (32); text do zásad EN + IS → CODE-tune, hotovo 2026-10-10)* **(b) — záloha DB na Google Drive** (zavedená 2026-10-10, DECISIONS (9), CODE-read): stránka slibuje „What we store stays
  in the EEA“ a Google mezi zpracovateli není; Google Drive umístění v EHP nezaručuje. Archiv je šifrovaný (AES-256, heslo jen u nás) —
  jestli to z pohledu GDPR přenos osobních údajů je, CODE nerozhodne (§23). Možnosti: (1) doplnit do zásad „šifrované zálohy na Google
  Drive“ · (2) zálohy jen v EHP — při přesunu na Hetzner Storage Box (Německo) a Drive kopii vypnout. Doporučení: teď (1), s Hetznerem (2).
  Mezera vznikla rozhodnutím (9) — zásady se tehdy neřešily.

### Část 34 — co stránky načítají samy od cizích serverů (2026-10-10)
**Platí:** odkazy na openai.com, elevenlabs.io, anthropic.com, supabase.com, agndofa.is jsou jen klikací (zásady) — nic se z nich samo
nenačítá · obrázek Rúnara jde z našeho Supabase úložiště (Irsko) · písma od 2026-10-10 u nás (DECISIONS (32)).
- ✅ *(KUKY 2026-10-10 „hostuj u nás“ → hotovo CODE-read, DECISIONS 2026-10-10 (33); 0 požadavků na jsDelivr)* knihovna `supabase-js` se v readeru i shrine načítala z `cdn.jsdelivr.net` → stejně jako dřív písma od Googlu dostane
  jsDelivr IP každého návštěvníka a zásady ho nejmenují. Navíc: když jsDelivr nejede, appka se nespustí, a SW knihovnu nepředukládá.
  Doporučení CODE-read: hostovat u nás jako písma — TENTÝŽ soubor 2.117.3, ověřený stávajícím otiskem SRI (`v2/vendor/supabase.min.js`), <!-- doc-links:ok 2026-10-10 navrhovaná cesta, soubor zatím není -->
  + do precache `sw.js`; `scripts/utils/supabase_js_pin.js` upravit, ať při povýšení stáhne soubor k nám.

### Část 35 — tabulka „jaké údaje ukládáme“ na stránce soukromí × sloupce v databázi (2026-10-10, jen čtení)
Veřejná tabulka (`v2/runar-privacy.html`, EN i IS) má 8 řádků: e-mail, jméno, den a měsíc narození, čtení, jazyk, počet čtení, kredity,
dárkový kód. `user_profiles` drží navíc (stav 2026-10-10, 4 profily):
- **oslovení** `address_gender` + `address_pref` (Hann/Hún/Hán — jak Rúnar oslovuje; vyplněné u 4 ze 4) · **severské jméno** `norse_name`
  (2) + **rozbor jména** `name_lore_text/for/count` · **čtení životní runy** `life_rune_text` · **strom** `tree_name`, `tree_founded_at`,
  `founding_reading_id` · **hlas** `voice_month_key/count` · **volby** `analytics_opt_out`, `is_tester`, `tester_consent_at` ·
  **rok narození** `dob_year` — od 2026-10-09 se nezadává (DECISIONS (20)), ale **3 ze 4** starých účtů ho mají uložený (interně
  `RUNAR_PRIVACY.md`: „semínko tvaru stromu“; veřejně nikde).
- ✅ *(KUKY 2026-10-10 „4. ano“, DECISIONS (35); text EN + IS → CODE-tune, hotovo 2026-10-10: tabulka 14 řádků EN i IS, u čtení i otázky
  Asku; po cestě opravená islandština tabulky — úvod (rod „ákveðin hlutir“), „Fjöldi lestra“, „Inneign“, „gert nafnlaust“. Yfirlestur
  nedostupný → dlužná kontrola v „Kontrola návštěvníka“ bod 7.)* **(a):** doplnit do veřejné tabulky řádky pro oslovení, severské jméno a rozbor jména, uložené texty (životní runa,
  rozbor), počet hlasových čtení a volby soukromí/testera (EN + IS → CODE-tune). Doporučení: ano — tabulka má říkat, co držíme.
- ✅ *(KUKY 2026-10-10 „nechat, jsou to admin účty“, DECISIONS (35); data admin účtů nejsou nález — memory `admin-ucty-nejsou-nalez`)* **(b):** rok narození 3 starých účtů — **smazat** (rok se nezadává, slib „den a měsíc“), napřed CODE-tree potvrdí, že strom
  semínko bez roku zvládne; nebo ho nechat a uvést. Doporučení: smazat (zápis do DB = owner, SQL připravím).

### Část 36 — souhlas testera a čtení „pro někoho“ (sliby `RUNAR_PRIVACY.md` body 1–6, 2026-10-10)
**Platí:** text souhlasu testera (`tcm_body`, EN + IS) jmenuje OpenAI, Anthropic i ElevenLabs; souhlasy se po změně znění 2026-10-09
vynulovaly a dávaly znovu (stav účtů = admin, nehodnotí se — memory `admin-ucty-nejsou-nalez`) · čtení „pro někoho“ (třetí osoba)
běžného uživatele se NEUKLÁDÁ: klient pošle `journal` jen u `mine` nebo u testera (`runar-reading.js` ~332, ~1344), deník tahá jen
`mine`/null (`runar-journal.js`) — bod 6 sedí. Nic k opravě.

### Část 37 — pre-push smoke běží nad SDÍLENÝM pracovním stromem → cizí rozdělaná práce blokuje push všem (2026-10-10)
**Doloženo dnes 3×:** moje rozdělaná ㉸ zablokovala push CODE-tune (b2f50b7) · jejich necommitnutý `setRuneText` (㉣) můj · rozdělaná práce
CODE-tree (㉳, 61 porušení) push CODE-tune (11c3bc3). Pokaždé smoke hlásil chybu v kódu, který se vůbec nepushoval; session pak čekala nebo
psala ostatním. `hooks/pre-push.py` pouští `smoke.py` přímo nad pracovním stromem.
- ✅ *(KUKY 2026-10-10 „3. ano, udělej to“ → hotovo CODE-read, DECISIONS 2026-10-10 (40); + smoke ㉿, `.gitattributes`)* **návrh:** hook před pushem udělá DOČASNOU čistou kopii pushovaného commitu (`git worktree add --detach
  <tmp> <commit>`), smoke pustí v ní a kopii smaže. Sdílený strom zůstává jeden — tohle NENÍ zamítnutý „worktree pro každou session“
  (DECISIONS 2026-07-19), jen pár sekund uvnitř hooku. **Háčky:** ⑪/⑫ hledají soubory zapomenuté MIMO git — v čisté kopii nejsou z principu,
  ty dál nad skutečným stromem · cena = checkout (repo s `docs/eval` ~1 000 souborů, odhad pár sekund) · ㉼ (prohlížeč) ověřit, že běží
  i z dočasné cesty. **Bez toho** zůstává dnešní stav: kdo má rozdělané, zablokuje ostatní, a jediný obchvat je `--no-verify`.

### Část 38 — přihlašování a registrace (veřejné `/auth/v1/settings`, 2026-10-10, jen čtení)
**Platí:** zapnuté jen Google a e-mail (kód), telefon/SMS ne · e-mail se potvrzuje (`mailer_autoconfirm: false`) · registrace otevřená
(`disable_signup: false`) — záměr, návštěvník dostává výzvu „joining is free“.
- ⚪ **Před veřejným spuštěním (nic teď, jen ať se na to nezapomene):** otevřená registrace + per-účet dárek (jedno volné čtení
  s jedním hlasem, jednou — DECISIONS 2026-10-10 (42); do 2026-10-10 tu chybně stálo „5 hlasů/měsíc“) = zakládání účtů zdarma dává
  čtení i hlas. Hlas na libovolný text je známý (#2b „Proxy Fáze 2“), levnější placení přes `spread_cost`
  taky (#4). Navíc zvážit **CAPTCHA při registraci** (Supabase umí Cloudflare Turnstile / hCaptcha přímo v Auth — přepínač + klíč, v appce
  jeden token u přihlášení). Útratu dnes drží stropy u poskytovatelů (část 15) a rate limity.

### Část 39 — sliby appky uživateli × tok kódu (nový typ kontroly, 2026-10-10)
Prošlo: `TIER_FEATURES` všech tierů + 28 textů UI_TEXT s počtem/nárokem (EN i IS se shodují).
**Platí:** Rune Seeker jedno volné čtení (`free_balance = 1`, bez obnovení), další z karty, kredity bez expirace, deník posledních 5 ·
Standard 50/měsíc, celý deník, 1 Ask · Premium 75/měsíc, 2 Asky (`ASKS_PER_READING` = config, smoke ⑨) · návštěvník 5 run v kolekci
(Fehu, Isa, Tiwaz, Sowilo, Ansuz) a u všech pěti namluvené audio EN i IS („listen to the ancient stones“ sedí) · zakládací Norny „zdarma,
jen text“ (rituál v proxy, appka hlas nenabízí) · Ask teaser („open with {tier}“) i rozbor jména bez slibovaného počtu sedí.
**Nesedí:** (1) ✅ *(CODE-tune 2026-10-10, DECISIONS (45): výpis tierů skládá větu o hlasu z nastavení — Rune Seeker „k volnému čtení,
s kartou nejvýš N měsíčně“; nápověda totéž; komentář a flag návštěvníka; hlídá `verify_tier_features.js` (6), na starém configu padá 13×)*
hlas Rune Seekera „až 5 měsíčně“ → DECISIONS (42), u CODE-tune. (2) ✅ *(CODE-tune 2026-10-10, DECISIONS (45): okno přihlášení „ukládáme
tvá čtení a to, co Rúnarovi řekneš, aby si je pamatoval a čtení byla lepší“; deník a nápověda jen vlastní čtení. ⚠️ Premisa neplatila:
zásady v appce rozbor kvality NEuváděly — byl jen v plánu `RUNAR_PRIVACY.md`; doplněno do oddílu 3 EN + IS i s cestou k odhlášení.
Statické kopie obou textů v `runar-reader.html` pryč — JS je přepíše dřív, než jsou vidět, a rozcházely se.)* **pro CODE-tune (l):**
`auth_consent_txt` (EN + IS, okno přihlášení) „We store only what is needed to remember your readings“ — zásady uvádějí i analýzu kvality
(s možností odhlášení) a tabulka údajů má 14 řádků; věta to zužuje. Srovnat se zásadami (žádné nové rozhodnutí). Drobnost:
`journal_teaser` „Every reading you have ever taken is kept“ — čtení „pro někoho“ se u běžného uživatele neukládá.
✅ *(CODE-tune 2026-10-10, DECISIONS (46): (a) nápověda sjednocena na „inneign“ — „kreditarnir“ korpus 0×, „inneign“ 9567×; (b)–(d)
hotové; GPT na všech 30 textech našel navíc „HVAÐ FÆR ÞÚ“, „Báðar eru velkomnar“, kalky v úvodu a kontaktu; v appce „frjáls spá“.
Zbývající E001 jen u kroků se šipkami a jednoslovné odpovědi „Aldrei.“ — nejsou to věty.)*
**~~Pro CODE-tune~~ — zbytek islandské nápovědy (nález 2026-10-10 při (l), is-greynir na všech 30 IS textech `runar-help.html`):** oddíly
s4–s6 opravené (DECISIONS (45)); zbývá (a) **slovo pro kredity nejednotné** — nápověda „kreditar“ (BÍN ho nezná, U001), zásady a appka
„inneign“ → sjednotit na jedno (ověřit korpusem, „inneign“ je domácí slovo); (b) s3 „Innleysið í appinu“ = množné/vykání, appka jinde tyká
(„Innleystu“); (c) s1 věta „spyr Rúnar nokkurra hluta: nafns þíns, þess sviðs lífsins…“ nerozebraná (E001) → přepsat, ať jí nástroj
rozumí (§19.2); (d) s7 + FAQ projít is-gpt-check (Greynir v nich chybu nenašel, jen zkratku EES). Postup: is-greynir → is-gpt-check → korpus.

### Část 40 — slib „chyba nestojí kredit“ × souběh požadavků (`claude-proxy`, 2026-10-10, čtení kódu)
**Platí:** odečet běží až po skutečném textu (`applyDeduction`, ř. ~892) — chyba upstreamu, 2xx s chybou i prázdný text vrátí 503/400 bez
odečtu; sol: prázdná odpověď → `null` → Claude cesta se stejnými kontrolami. Slib z hlavičky drží ve všech cestách (volné / kredit / měsíční).
- ✅ *(CODE-tune 2026-10-11, DECISIONS 2026-10-11 (5): zámek „jedno účtované čtení naráz“ nasazen (claude-proxy v80, SQL spustil owner), živě ověřeno — souběžný požadavek 429, kredit jen jednou)* **Pro CODE-tune (m) — díra v penězích, před veřejným spuštěním:** oprávnění se ověřuje NA ZAČÁTKU (`free_balance > 0`, kredity ≥ cena,
  `used < strop`), odečet až PO vygenerování; CAS v `use_free_balance` / `use_credit` / `bump_month_units` brání jen dvojímu odečtu, ne
  dvojímu čtení. Kdo pošle souběžně víc požadavků (rate limit pustí 10/min), dostane až ~10 čtení za jedno volné čtení nebo jeden kredit
  a předplatitel přetáhne měsíční strop. **Závěr z kódu, naostro neověřeno** (stálo by peníze a zápisy do produkce). Oprava: REZERVOVAT na
  začátku (atomicky odečíst / zvýšit čítač) a při chybě VRÁTIT — slib „chyba nestojí kredit“ zůstane. Money-critical → E2E test všech
  cest (čtení, spready, Ask, životní runa, rozbor jména) PŘED nasazením (poučení z #2b 2026-08-03); nasazení pouští owner.
  ⚠️ **CODE-tune 2026-10-11 — diagnóza sedí, oprava ne (čeká na ownera):** rezervace na začátku má vlastní díru. Čtení smí trvat déle,
  než edge funkce žije (sol 50 s + Claude 3 × 55 s na model, dva modely), a funkce zabitá PO rezervaci by kredit vzala bez čtení —
  slib „chyba nestojí kredit“ by bez uklízeče rezervací padl. **Návrh:** zámek „jedno čtení naráz na účet“ (CAS na řádku s expirací
  10 min, jen service_role), odečet dál až po úspěchu. Souběžný požadavek → 429 „čtení už běží“. Zabitá funkce nestojí nic a zámek
  vyprší sám. Potřeba: SQL (owner), proxy, nasazení s jeho ano, živé E2E na NEadmin účtu s kreditem (admin se neúčtuje). (n) z části 41
  (`cache_control`, ~$0.0004 na volání Claude) přibalit k tomuhle nasazení, samostatně nenasazovat.
  **Upřesnění (CODE-read souhlasí, 2026-10-11):** zámek jen pro čtení, která se účtují (volné / kredit / měsíční) — rituály
  (`isRitual`) a Ask k vlastnímu čtení mají vlastní ochranu a blokovat je nesmí. **Pořadí:** zámek → TEPRVE PAK číst zůstatek →
  model → odečet → uvolnit; jinak by požadavek, který zůstatek přečetl před cizím odečtem a zámek vzal až po něm, prošel znovu.
  Dnes se `credits_balance` čte už při ověření přihlášení (ř. ~560), před zámkem — po zámku ho přečíst znovu. E2E ověří i Ask hned po čtení.

### Část 41 — plýtvání voláními, která stojí peníze; levnější modely mimo čtení (2026-10-10)
KUKY: *„budeme ještě chtít hlídat případné plýtvání voláním, což nás stojí peníze“* + *„případně pokud na něco můžeme použít levnější
modely, ale ne na čtení“*.
**Nový nástroj (CODE-read):** `scripts/utils/plytvani.js` — jen čtení DB, žádné API: zálohy sol→Claude (dvojí platba), dvojí generování do
20 s, tokeny přemýšlení, cache (čtení i zápis), hlas bez uloženého čtení. **Hlídá se sám:** `nacti_cteni.js` (owner „načti čtení a reporty“)
nově ukáže blok „PLÝTVÁNÍ VOLÁNÍMI (7 dní)“ — souhrn + varování.
**Kód:** přepnutí jazyka u čtení se ptá oknem (vědomá platba) · tlačítka tahu, hlasu a Asku se během volání vypínají (dvojklik ne) · hlas
čtení se v relaci namluví jednou na jazyk, deník přehrává předtočené statické audio (zdarma) · sol prázdná/chybná odpověď → Claude bez
dvojího odečtu. **Z dat (30 dní):** 0 záloh, 0 dvojích generování; dat po přechodu na sol málo (admin účty) — hranice nálezu.
- ✅ *(CODE-tune 2026-10-11, DECISIONS 2026-10-11 (5): cache_control pryč, nasazeno spolu se zámkem)* **Pro CODE-tune (n) — plýtvání na cestě Claude:** `claude-proxy` dává `cache_control: ephemeral` na systémový prompt při KAŽDÉM volání
  (~800 tok. zápisu, zápis se platí dráž než běžný vstup), z cache se ale skoro nečte — za 30 dní opus-4-8 16 835 tok. zapsáno / 1 % vstupu
  z cache, opus-5 23 605 / 13 %. Čtení jsou řídká (cache drží 5 min) → přirážka bez návratu. Claude je dnes záloha + přepínač admina →
  malé částky, ale při výpadku solu by platil každé čtení. Návrh: `cache_control` pryč (nebo jen u Asku, kde jde druhé volání hned po čtení).
- **Levnější modely mimo čtení:** rozhodnuto už 2026-10-09 (oddíl „Haiku 5.5“ výš: rozbor čtení zrušen, třídění hlášení modelem
  „neřešit“, `tree-update` = Haiku 5.5; Ask ne — model proti hlasu malá část ceny). Nově projito: rozbor jména (`name_lore`, gpt-6-sol) —
  Rúnarův hlas a islandština jako u Asku, levný už teď → nevyplatí se. Vývojové nástroje: `profsteinn.js` soudí 3× claude-opus-4-8
  (nejdražší položka mimo produkci, ale běží jen při stížnosti; výměna soudce = přeměřit nástroj, §27) · `is-gpt-check.py` gpt-6-sol
  (kvalita IS je kritická, levnější model měl 2026-10-09 cizí slova). **Největší páka na peníze je hlas (ElevenLabs), ne model — a hlas
  je přednes čtení.**

### Část 42 — nápověda (`runar-help.html`) × co appka opravdu dělá (pokračování části 39, 2026-10-10)
- ✅ **Pro CODE-tune (o) — 5 vět v nápovědě slibuje něco jiného, než appka dělá (EN statické + slovník, IS):**
  *(CODE-tune 2026-10-11, DECISIONS 2026-10-11 (20): body 1–4 srovnány s appkou a se zásadami; z bodu 5 ubrán jen nepravdivý slib —
  upozornění na nový měsíc appka nemá, postavit ho je dál ownerova volba)*
  1. „tap **+ Gift Card**“ / „ýttu á **+ Gjafakort**“ — položka v menu se jmenuje `'+ ' + vl('card')` = „+ Rune Reading Card“ / „+ Rúnakort“
     (`runar-app.js` ~654); vede správně na zadání kódu (`toggleRedeem`), jen jiné jméno. Text z `vl('card')`, ne natvrdo (§15).
  2. „Filterable by rune, area, and **time**“ / „sía eftir rún, svæði og **tíma**“ — filtry deníku jsou runa, oblast, **jazyk**
     (`runar-reader.html` `jf-rune`, `jf-area`, `jf-lang`).
  3. „Everything is erased **immediately**“ — účet ano, ale šifrované zálohy drží data až 30 dní (DECISIONS 2026-10-10 (36); zásady to už říkají).
  4. „Your data is stored in **Europe** (Ireland)“ — databáze ano, šifrované zálohy jdou na Google Drive (DECISIONS (32); zásady to říkají).
  5. FAQ „The app will **let you know when they renew**“ / „Appið lætur þig vita…“ — žádné upozornění na nový měsíc v kódu není; appka jen při
     vyčerpání řekne „They return with the new month“ (`err_monthly_limit`). Buď větu ubrat, nebo upozornění postavit (to je rozhodnutí → owner).

### Část 43 — limity a kvóty placených služeb (2026-10-11, jen čtení)
**Platí (měřeno 2026-10-11):** Supabase Free daleko od limitů — databáze 15 MB (limit 500 MB), úložiště 23 MB (1 GB; statické audio 53 souborů
21 MB + Rúnarův portrét) · ElevenLabs plán `starter`, poslední týdenní snímek 2026-10-05: 13 919 / 103 807 kreditů (do 2026-10-11 tu stálo „znaků“, DECISIONS (43)).
- ⚪ **Před veřejným spuštěním — kapacita hlasu:** plán `starter` = 30 000 kreditů = 75 000 znaků ≈ **177 IS / 200 EN Single měsíčně** (DECISIONS 2026-10-11 (43); do 2026-10-11 tu stálo
  „výklad ≈ 600 znaků → ~170 hlasů“, což spolu nesedí — 75 000 / 600 = 125)
  (každý nový účet 1 hlas k volnému čtení + čtení z karet + předplatné nejvýš `VOICE_MONTHLY_LIMIT`). Při desítkách aktivních lidí s hlasem
  plán nestačí — rozhodnout předem: vyšší plán, nebo co se stane po vyčerpání (navazuje na „Limit v účtu ElevenLabs“ výš — zjištěno 2026-10-11: placení nad kvótu účet nemá, `can_extend_character_limit=false`; původně: zjistit, jestli má
  plán zapnuté placení nad kvótu). Hlídá `voice-usage` ve shrine (snímek kvóty) + `plytvani.js`.
  ✅ **Rozhodnuto 2026-10-11 (KUKY):** *„máme 5 testerů, tak jim dejme 15 hlasů Rúnara… ale budeme hlídat, ať nepřekročíme bezpečnou
  hladinu, třeba 120 hlasů.“* Výklad CODE-read (ownerovi napsán): každý tester 15/měsíc, celkový strop 120/měsíc vynucený serverem
  (≈ 72 000 znaků ≈ 70 % kvóty; počítat i static a admina; měsíc podle cyklu ElevenLabs). Implementace + DECISIONS → CODE-tune.
  ✅ *(CODE-tune 2026-10-11, DECISIONS 2026-10-11 — hlas testerů: `VOICE_MONTHLY_LIMIT_TESTER` 15 podle `is_tester` (testeři jsou v DB
  rune_seeker, ne premium); hladina hlídaná ve ZNACÍCH podle počítadla ElevenLabs (`VOICE_SAFE_SHARE` 0,7) v elevenlabs-proxy i -static —
  počet 120 by kvótu neochránil (hlas Yggdrasilu ~1 660 zn.). Hlídá smoke ⑨; nasazení obou funkcí s ownerovým ano.)*

### Část 44 — časový rozpočet čtení × limit edge funkce (`claude-proxy`, 2026-10-11, čtení kódu)
**Platí:** sol 50 s (AbortController) → Claude `claude-opus-5`, pokus 55 s; po VYPRŠENÍ se neopakuje ani nepřechází na další model
(kód to výslovně vylučuje — pomalé generování by vypršelo znovu), opakuje se jen po rychlé chybě (429/5xx) s krátkým backoffem
a teprve přetížení pošle čtení na `claude-opus-4-8`. Nejhorší běžná cesta ≈ 105 s; limit edge funkce na Free je podle dokumentace
Supabase 150 s (z paměti, neověřeno). Výjimka: několik POMALÝCH 5xx za sebou (např. 529 po 50 s) by se opakovalo a limit přetáhlo —
vzácné. Pozn. k (m): argument CODE-tune pro zámek místo rezervace (zabitá funkce = propadlá rezervace) platí jen pro tuhle výjimku
a pro výpadek platformy, ne pro běžnou cestu — zámek je i tak bezpečnější volba.

### Kolo 1 uzavřeno (části 1–44, 2026-10-09 → 2026-10-11) · KOLO 2 (od 2026-10-11)
Poslední kontrola kola 1: identifikátory kódu jmenované v `RUNAR_DESIGN.md`, `CLAUDE.md`, `RUNAR_PRICING.md`, `working-style.md` v kódu existují
(4 „chybějící“ = záměrná historie / jiný strom / nastavení Claude Code). Kolo 2 = tytéž oblasti od začátku, čerstvé grepy, nic z kola 1
nepřebírat bez ověření, + typy, které kolo 1 nemělo: **sliby appky × tok kódu**, **peníze a plýtvání**, **nasazeno = repo**.

#### Kolo 2 / 1 — `claude-proxy` (2026-10-11)
**Platí:** hlavička sedí s kódem (anonym 401, volné jen single, sol pro všechny + Claude záloha bez přechodu po vypršení, vrstvy A/B/C OFF,
CONCURRENCY zámek z části 40 — CODE-tune 4b7fc9e) · SQL zámku v databázi (`acquire/release_reading_lock`, `reading_locks`, jen `service_role`)
· **nasazeno = repo** (`claude-proxy` v80 i `delete-account` v8 staženy a porovnány bajtově) · zámek se uvolní ve `finally` přes token,
rituály a Ask nezamyká · `cache_control` pryč (n).
- ~~drobnost: `reading_in_progress` → `err_generic`~~ **OPRAVA (CODE-tune 2026-10-11):** `callProxy` (`runar-app.js` ~1310) mapuje každé 429 na
  `rate_limited` → `err_rate_limited` („Too many requests. Please wait a moment.“ / „Of margar beiðnir. Bíddu aðeins.“) — sedí, nechává se.
  Moje chyba: `callProxy` jsem neprošel, tvrdil jsem z `_readingErrMsg`.

#### Kolo 2 / 2 — ostatní edge funkce (2026-10-11)
**Nasazeno = repo** (všech 10 nasazených staženo a porovnáno): shodné `claude-proxy`, `redeem-code`, `delete-account`, `notify-report`,
`list-reports`, `list-readings`, `reset-tree`, `voice-usage`, `_shared/voice_usage.ts`. `elevenlabs-proxy` a `elevenlabs-static` se liší jen
(a) komentáři z kontroly 2026-10-09 (nenasazovalo se, nevadí) a (b) necommitnutou rozdělanou prací CODE-tune (limit testerů 15, bezpečná
hladina 70 %, část 43) — jejich fronta. `tree-update` v nasazení není (staženo 2026-10-10), kód v repu pro CODE-tree.
**Platí:** každá funkce ověřuje uživatele (JWT) nebo tajný klíč webhooku; admin funkce kontrolují admina z JWT, `reset-tree` testera;
rate limit mají ty, které stojí peníze (`claude-proxy`, `elevenlabs-proxy`, `redeem-code`).
**Opraveno (CODE-read):** `supabase/.temp/` (místní stav CLI) do `.gitignore` — byl neverzovaný a neignorovaný, šel omylem commitnout.
- ⚪ poznámka: `notify-report` je „fail open“ — bez `WEBHOOK_SECRET` pustí kohokoli (dnes nastaven, smoke ho nehlídá).

#### Kolo 2 / 3 — databáze naostro + celistvost peněz (nový typ, 2026-10-11, jen čtení)
**Platí:** žádný záporný zůstatek, měsíční čítač nepřetáhl strop · **evidence peněz sedí:** poslední `balance_after` v `credit_ledger` =
`credits_balance` u 4 ze 4 účtů; řetěz `předchozí + delta = nový` bez zlomu (35 přechodů) · trigger `trg_ledger_user_profiles` zapnutý a sleduje
kredity, volná čtení i měsíční jednotky (záznamy `free`/`month_unit` chybí, protože od 2026-07-19 nikdo volné ani měsíční nečerpal — admin účty
se neúčtují) · politiky RLS: vlastní data jen vlastníkovi, profil omezují granty sloupců (smoke ⑩), deník jen pro čtení.
- ⚪ **Pro CODE-tune / ownera (nespěchá) — seznam adminů i v politikách DB:** `gift_codes`, `knowledge_base`, `runar_character`,
  `runar_corrections`, `runar_static_audio` mají e-maily adminů natvrdo v RLS. Dnes = `ADMIN_EMAILS` (ověřeno), ale smoke ㉪ politiky výslovně
  vynechává („SQL migrace = historie“) — živé politiky jsou přitom běžící kód. Změna `ADMIN_EMAILS` → admin tiše přijde o dárkové kódy,
  korekce, audio. Trvalé řešení: DB funkce `is_admin()` (jedna tabulka adminů) a politiky ji volají — jeden zdroj v DB (§20).

#### Kolo 2 / 4 — klient (`v2/`), pravidla CLAUDE.md + XSS v novém kódu (2026-10-11)
**Platí:** §5 `--dim` jen placeholdery a ikona zavření (dovoleno) · §8 žádné číslo tieru natvrdo v textech · XSS: všechna `innerHTML` přidaná od
kola 1 (`cc0ca7f`) plní statický text, config, `t()/tp()` nebo `esc()`/`escapeHtml`.
- ✅ *(CODE-tune 2026-10-11: hlavička shrine ukazuje celý e-mail přihlášeného admina)* **Pro CODE-tune (drobnost):** §12 „NIKDY `email.split('@')[0]`“ — `runar-shrine.html` ~561 tak plní hlavičku admina (který admin je přihlášený).
  Účel plní, pravidlo porušuje; celý e-mail, nebo `displayName()`.
- ⚪ **Pro CODE-tree (předáno 2026-10-11):** (a) `tree_state` má politiku UPDATE pro vlastníka bez omezení sloupců — dnes neškodí (vrstvy A/B/C
  vypnuté), až z něj začne číst server, zúžit jako `user_profiles` (granty sloupců, smoke ⑩); ~~(b) smoke ㉳ (`verify_tree_mista.js`) při běhu
  přegeneruje `v2/tree-lab-crown-composer/crown-composer.html` — kontrola zapisuje do stromu;~~ ✅ *(CODE-tree 2026-10-11: builder bere cíl
  z `RUNAR_LAB_DST`, ㉳ staví lab do dočasné složky a po sobě ji smaže)*; (a) a (c) jsou podmínky budoucí práce — (a) visí i u položky
  `tree_state`/`tree_readings`, (c) stojí v hlavičce `supabase/functions/tree-update/index.ts`; (c) `tree-update` před novým nasazením: rate limit,
  strop textu, `credits_used` na serveru (části 2, 15).
  (d) *(CODE-read 2026-10-11, kolo 2 / 19)* **soukromí před nasazením `tree-update`:** `tree_state` drží o člověku ODVOZENÉ údaje
  (`recurring_pattern`, `emotional_arc`, `personal_symbols`) a `claude-proxy` z nich skládá část promptu (~ř. 72–107, 814; vypnuté přepínačem `ENABLE_DYNAMIC_CONTEXT = false` od 2026-07-04 — zásady
  musí pokrýt i tohle použití, než se zapne; doplnil CODE-tree). Veřejná
  stránka soukromí ani `RUNAR_PRIVACY.md` o nich nemluví. Dnes je v tabulce jediný řádek (admin, 2026-06-06) a nic nezapisuje, takže slib
  porušený není; s nasazením by byl. Před ním: řádek do tabulky údajů (EN + IS, CODE-tune) + účel a právní základ v `RUNAR_PRIVACY.md`.
  Odkaz na (d) stojí i v hlavičce `supabase/functions/tree-update/index.ts` u nasazení (CODE-tree 2026-10-11).
  ✅ (b) zpětně ověřeno CODE-read 2026-10-11: ㉳ proběhla, `v2/tree-lab-crown-composer/crown-composer.html` ve stromě nezměněn, v temp nic nepřibylo.

#### Kolo 2 / 5 — prompt: tvrzení CLAUDE.md §2 a „Reading systém“ (2026-10-11)
**Platí:** tři vrstvy na VŠECH cestách generování — `getCorrPrompt` mají buildery single, Kříž, Norny (i zakládací), Horseshoe, Yggdrasil,
životní runa, rozbor jména a Ask, a všichni volající předávají `corrections` (`runar-reading.js` ~322, ~885, spready přes
`_generateSpreadReading` ~1342; `runar-tree.js` ~799, ~854; shrine ~889) · hranici DB → prompt cvičí `golden_contracts.js` (smoke ⑥) ·
**obraznost přeměřena znovu:** 25 run × 6 období = 150 dvojic, žádná bez kandidáta z `RUNE_IMAGES`, období pro všech 12 měsíců → `SEASON_POOLS`
se do čtení dál nedostane; filtr podle oblasti (`_imgPodleOblasti`, od 2026-10-03) nikdy nevrátí prázdno (`ok.length ? ok : cand`), takže to nemění.

#### Kolo 2 / 7 — CLAUDE.md o sobě samém (2026-10-11)
„§1–§28“ v CLAUDE.md (výjimka z délky), BACKLOGu a domácím `C:\Users\zkuku\CLAUDE.md` <!-- doc-links:ok 2026-10-11 domácí ukazatel mimo repo -->
→ „§1+“: pravidel je dnes 32 a pevné číslo ujíždí s každým novým (commit 2db36c7).

#### Kolo 2 / 8 — stránky pro uživatele: nápověda a soukromí drží angličtinu dvakrát (2026-10-11)
Obě stránky mají EN text ve statickém HTML (záloha, než naběhne JS) i ve slovníku `CONTENT.en` v JS. Hlídalo to jen pravidlo v komentáři
„měnit obojí“, tedy pravidlo na paměti (§30). Změřeno porovnáním po normalizaci: **soukromí 22/22 shodných · nápověda 26 prvků, 1 rozešlý** —
`s3-online-title`: HTML „ONLINE PURCHASE — coming soon“ × JS „ONLINE PURCHASE“ (obojí z 1c6b9d8, 2026-05-20, rozešlé od začátku; JS
po načtení přepíše, dovětek tak vidí jen ten, komu JS nenaběhne). Pravdivé je obojí — online nákup dál není, tělo bloku říká „soon“ v obou kopiích.
**Mechanismus:** `scripts/verify_page_copies.js` (samotest `--test`) najde každý rozešlý prvek. **Předáno CODE-tune** (copy = jeho lane):
sjednotit `s3-online-title` a v témže commitu zapojit kontrolu do smoke — dřív ne, jinak by padala všem. ✅ *(CODE-tune 2026-10-11: nadpis bez „— coming soon“ — JS verze, kterou lidé vidí; kontrola zapojená jako smoke ㊲)*

#### Kolo 2 / 9 — shrine: co zapisuje z klienta a jestli to brání server (2026-10-11, DB jen čtením)
**Platí:** shrine píše z prohlížeče do `gift_codes` (insert), `runar_corrections` (insert), `runar_static_audio` (delete) a čte
`runar_character`. Živé RLS u všech čtyř pouští zápis jen e-mailům adminů = `ADMIN_EMAILS` (shoda ověřena; kopie v 6 edge funkcích hlídá
`verify_admin_emails.js`, živé politiky ne — zapsáno v kole 2 / 3, čeká na `is_admin()`). Uplatnění kódu (`redeem-code`): ověří JWT,
rate limit 5 / 15 min na IP, „použitý“ = `used_by` NEBO `used_at`, označení atomicky přes `.is(null)`, kredity přes RPC `add_credits`.
- ✅ *(CODE-tune 2026-10-11, 2e5f217, nasazeno v11: při chybě `add_credits` se označení vrátí — DECISIONS 2026-10-11)* **Pro CODE-tune (peníze, vzácné):** `redeem-code` ~79 kód nejdřív označí jako použitý a teprve pak volá `add_credits`. Selže-li RPC,
  vrátí 500 — kód je spotřebovaný a kredity nepřibyly; uživatel nemá jak to napravit sám (opakování → „already used“). Návrh: při chybě
  `add_credits` vrátit `used_by`/`used_at` na null (kompenzace), nebo obojí v jedné SQL funkci.
- **Drobnost, žádný únik:** politika `admins_select_static_audio` se jmenuje „admins“, ale má `qual = true` pro každého přihlášeného.
  Tabulka nese jen veřejné texty a zvuky run (53 řádků, všechny `ready`), takže nic neuniká — jen jméno lže. Až se bude sahat na RLS
  (`is_admin()`), přejmenovat nebo zúžit.
- ✅ *(CODE-tune 2026-10-11, 584c9f2: `npm:@supabase/supabase-js@2.117.3`, smoke ㊳; nasazeno 9 funkcí — DECISIONS 2026-10-11)* **Pro CODE-tune (dodavatelský řetězec, nový nález):** všech 10 edge funkcí importuje `https://esm.sh/@supabase/supabase-js@2` — plovoucí
  major z cizího CDN. Každé nasazení si vezme, co je zrovna nejnovější 2.x, takže dvě funkce nasazené v jiný den běží na jiné knihovně
  a výpadek nebo podvržení esm.sh dopadne na nasazení. Táž třída rizika, kvůli které klient od 2026-10-10 hostuje knihovnu u nás
  s pevnou verzí (DECISIONS 2026-10-10 (33)). Návrh: připnout přesnou verzi (stejnou jako `v2/vendor/`), ideálně `npm:` specifikátorem,
  a hlídat ve smoke, že žádný import edge funkce není plovoucí. Projeví se až dalším nasazením (owner).

#### Kolo 2 / 10 — duplicity v pravidlech: CLAUDE.md, MEMORY.md, working-style.md a paměť (2026-10-11)
KUKY 2026-10-11: *„žádné místo by nemělo mít duplikáty, pokud to není potřeba … jestli jsou pravidla správně seřazena, jestli se
neduplikují, jestli jich není moc, jestli se nedají spojit nebo jestli pořád mají své místo.“* Metoda: nástroj na doslovné kopie
(slovní čtveřice napříč 79 soubory) + čtení `working-style.md` celého + dva čtecí agenti nad 75 soubory paměti; každý nález ověřen.
**Opraveno** (a774bad, 0eae678): kopie uvnitř CLAUDE.md (§2/§9/§19.2/§20/§16, lanes × §7/§30) · `working-style.md` opisoval
§1/§2/§4/§5/§7/§8/§16/§20 a měl druhý rozcestník · 20 paměťových souborů (kopie → odkaz, zastaralá fakta) · smazán
`fix-or-log-duplicates-and-errors` (celý kopie §22).
**Předáno CODE-tree:** zákon „1 pramen = 1 runa, max 25“ v SessionStart hooku a v `tree-roots-rebuild` proti `RUNAR_TREE.md`
(pramen = element od 2026-09-28) + tři zastaralé stromové paměti. **Předáno CODE-tune:** mapa promptu stojí na v4.15 a opus-4-8;
konvence tlačítka spreadu → komentář do `readRune()`.
**Nechávám (překryv je detail, ne kopie):** `attack-the-metric` (rozvádí §27 čísly, která v CLAUDE.md nejsou), `one-patch-script-path`
(proč u §1), `nacti-cteni-a-reporty` a `napred-dohledej-co-uz-je` (provozní postup k §29/§30). **Nejisté, neslučoval jsem:**
`rozkaz-a-studene-cteni-hranice` × `you-neni-prohresek`, `work-efficiently-ask-if-simpler` × `cheapest-deciding-measurement-first`.
**Čeká na ownera:** pořadí a slučování pravidel (přečíslovat nejde — odkazů na § jsou stovky ve 179 souborech kódu), dlouhé doklady
v CLAUDE.md × paměť, rozpor „NIKDY nezačít bez schváleného plánu“ (MEMORY.md, working-style) × §16 „Code sám opraví“ a
`find-a-gap-close-it-now`; znění stromového zákona v hooku. Drobnost: §1 tvrdí, že každý patch slot má vlastní řádek v allowlistu —
v `~/.claude/settings.json` je jen `scripts/_patch.py` (neověřeno, jestli to vadí). <!-- doc-links:ok 2026-10-11 uživatelský soubor mimo repo -->

#### Kolo 2 / 11 — tajné klíče a veřejné repo, znovu (2026-10-11)
**Platí:** ve verzovaných souborech pořád jen dva JWT, oba role `anon` (`v2/runar-config.js`, `show_corrections.py`); historie od 2026-10-10
(všechny větve) bez tvaru klíče Anthropic, OpenAI, Supabase přístupového tokenu, webhooku ani `service_role` v base64. Nové dnešní
soubory (hook pravidel při dotyku, kontroly) žádné tajemství nenesou; stav hooku leží mimo repo.

#### Kolo 2 / 12 — zálohy: běží, a jdou otevřít (2026-10-11, jen čtení)
**Platí:** úloha „Runar - zaloha databaze“ dnes 3:30 výsledek 0; archiv lokálně i na Drive; mazání po 30 dnech v kódu.
**Nově změřeno — zkouška obnovy nanečisto** (dosud „nevyzkoušena“, DECISIONS 2026-10-10 (9)): nejnovější archiv se rozšifroval (19
souborů), záloha má všech 16 tabulek `public` + `auth.users` + schéma; počty řádků se s živou DB shodují přesně, když se počítají jen řádky
starší než čas zálohy (čtení 565, ledger 48, hlasy 3, profily 4, účty 4); rozdíly jsou jen dnešní přírůstky a průběžně se přepisující
`rate_limits`. Rozbalená data hned smazána. **Hranice:** do databáze se neobnovovalo (chce druhou DB) — ověřeno, že záloha je úplná
a čitelná, ne že import proběhne. Běh jen při zapnutém počítači je známý a zapsaný (tamtéž), mění se s Hetznerem / Supabase Pro.

#### Kolo 2 / 13 — nasazené funkce = repo (2026-10-11, jen čtení)
**Platí:** od nasazení (584c9f2) se `supabase/functions` nezměnilo; verze na serveru sedí se záznamem DECISIONS 2026-10-11 (14).
Hlasové funkce s 15 hlasy pro testery (b37beca) byly nasazené už předtím s ownerovým „8. ano, nasaď“ (DECISIONS 2026-10-11 (8)); dnešní
nasazení s pevnou knihovnou je vzalo znovu — nic nešlo do produkce bez souhlasu.

#### Kolo 2 / 14 — mrtvé soubory, jména a styly, přeměřeno (části 19, 21, 23; 2026-10-11)
**Platí:** styly bez prvku 0 (CODE-tune je 2026-10-10 vyčistil; čtyři „nálezy“ skenu byly barvy `#b38a00`, ne id) · mrtvá top-level jména
jsou dál jen ta záměrná z kola 1 (`buildSysPromptV2`, `_lensContext`, `_random*`, `TREE_UPDATE`, `PATTERN_WINDOW`, `TRANSFORMATION_PAIRS`,
`AETTY`) + `VOICE_MONTHLY_LIMIT_TESTER` v configu — záměrná kopie hodnoty serveru, shodu hlídá `verify_monthly_limits.js`.
- **Opraveno:** CLAUDE.md „Sdílená sémantická vrstva“ tvrdila, že `AETTY` čtou obě session — nečte ho nic (rezervované pro Gathering).
- ✅ **Pro CODE-tune (nový nález):** v2/icons/favicon.svg (3,1 MB) se od 2026-09-11 nenačítá (komentář v `runar-reader.html`), ale dál
  se veřejně nasazuje. ~~Je to nejspíš vektorová předloha ikony~~ → podle ownerova pravidla pro designové podklady (2026-10-10) přesunout
  do `v2/assets/` s řádkem v jeho README, ne smazat. `v2/runar-portrait.png` zůstává (ownerovo „nemazat“, README to uvádí).
  *(CODE-tune 2026-10-11: přesunut jako `v2/assets/runar-app-icon.svg`; vektor to není, co to je → `v2/assets/README.md`. Veřejně
  se nasazuje dál jako všechny podklady (část 19), nic ho ale nenačítá.)*

#### Kolo 2 / 15 — mechanismy §30 a čísla kontrol, po dnešních změnách hooků (2026-10-11)
**Platí:** každý mechanismus, který §30 jmenuje, je zapojený — PreToolUse: API guard, pravidla při dotyku · Stop (`tree-guard.sh stop`):
záloha čtení, kontrola zprávy ownerovi i nezapsaných hlášení (§29, zastaví jen session, která hlášení načetla) · SessionStart: kontext
· PreCompact: záloha přepisu · noční úloha: záloha DB + konverzací. Všech 18 odkazů na čísla smoke v CLAUDE.md a paměti míří na existující
kontrolu (71 čísel ve `smoke.py`); měřeno šíře než jen „smoke ⑩“, podstrčené ㊿ chyceno.

#### Kolo 2 / 16 — edge funkce: proměnné a kopie hodnot z configu, znovu (2026-10-11)
**Platí:** všech 7 proměnných, které funkce čtou, je na serveru nastavených. Kopie `VOICE_MONTHLY_LIMIT(_TESTER)`, `VOICE_SAFE_SHARE`,
`NAME_LORE_LIMIT`, `ADMIN_EMAILS` hlídají kontroly. `spread_cost` od klienta (Proxy Fáze 2 #4) dál otevřené — známé, nic nového.
- ✅ **Pro CODE-tune (nízká priorita, §20) — hlas a model ElevenLabs na víc místech bez kontroly:** *(hotovo 2026-10-11, owner „3. ano“:
  první varianta — `supabase/functions/_shared/el_voice.ts`, kopie v configu a pole ve shrine pryč, nepoužité ID pryč; nasazeno proxy v37
  + static v16, DECISIONS 2026-10-11 (28))* ID hlasu `2UI8…` stojí v `v2/runar-config.js`
  (`EL_VOICE_ID_EN/IS`), `elevenlabs-proxy` (`EL_VOICE_ID`) a `elevenlabs-static` (`EL_VOICE_ID_EN`), ve static navíc mrtvé `EL_VOICE_ID_IS`
  s JINOU hodnotou `4E6W…`; modely `EL_MODEL_EN/IS` v configu, proxy i static. Rozhodují jen edge funkce — kopie v configu (`elVoiceId()`,
  `elModel()`) čte jen shrine a posílá je proxy, která je ignoruje (kolo 1 část 4: „neškodí“). Škodí až změna hlasu: kdo ji udělá v configu,
  nezmění nic; kdo v proxy, zapomene static. Návrh: jedno místo na serveru (`supabase/functions/_shared/`, jako `voice_usage.ts`), kopie
  v configu a pole ve shrine pryč, mrtvé `EL_VOICE_ID_IS` pryč — nebo aspoň kontrola shody (jako `verify_monthly_limits.js`).

#### Kolo 2 / 17 — Service Worker, překlady, schéma DB naostro (části 18, 20, 25; 2026-10-11, DB jen čtením)
**Platí:** precache úplný proti readeru (32 položek, `verify_sw_shell.js`), ikony v manifestu existují i po přesunu `favicon.svg` ·
EN a IS mají stejných 345 klíčů, mrtvý klíč 0 (㉽) · RLS zapnuté na všech tabulkách včetně nové `reading_locks` · `SECURITY DEFINER`
spustitelné pro uživatele jen dvě triggerové (`guard_life_rune_immutable`, `ledger_user_profiles`), nové `acquire/release_reading_lock`
jen server · všech 8 volání `.rpc()` míří na existující funkci. Nic nového; „repo databázi neumí postavit znovu“ dál platí (část 25,
pokrývá to záloha se schématem — kolo 2 / 12).

#### Kolo 2 / 18 — smazání účtu, cizí servery, plýtvání, kvóty (části 32, 34, 41, 43; 2026-10-11, DB jen čtením)
**Platí:** nová `reading_locks` se maže s účtem kaskádou (`ON DELETE CASCADE`); zbytek jako v kole 1 (`credit_ledger` bez vazby a
`bug_reports` zdůvodněné v `RUNAR_PRIVACY.md`) · stránky ve `v2/` nenačítají nic z cizích serverů, cizí adresy jsou jen odkazy na zásady
poskytovatelů; klient ElevenLabs nevolá · plýtvání za poslední den žádné (7 volání sol, 6 hlasů) · kvóta ElevenLabs (snímek 2026-10-05,
starter): 13 919 / 103 807 znaků = 13 %, bezpečná hladina 70 % ≈ 72 600; 15 hlasů × 5 testerů ≈ 28 000 znaků se vejde.
- **Zlepšeno:** `plytvani.js` píše u varování „naposledy <datum>“ — 30denní okno hlásilo přemýšlení 6.1 a zápis do cache, které opravy
  zastavily 2026-10-05; přehled nerozlišil historii od trvajícího.

#### Kolo 2 / 19 — tabulka údajů v zásadách × databáze, znovu (část 35; 2026-10-11, jen čtení)
**Platí:** sloupce `user_profiles`, `readings`, `voice_usage` pokrývá 14řádková tabulka zásad (doplněná 2026-10-10); nová `reading_locks`
nese jen `user_id`, token a čas zámku (provozní, s účtem se maže). **Nový nález (budoucí):** `tree_state` s odvozenými údaji o člověku —
v zásadách chybí; dnes jen admin a nic nezapisuje → přidáno jako podmínka (d) k nasazení `tree-update` (položka „Pro CODE-tree“ výš).

#### Kolo 2 / 20 — slib „data v EHP“ a výmaz × dnešní záloha konverzací (část 33; 2026-10-11)
**Platí:** stránka soukromí uvádí šifrované zálohy DB na Google Drive mimo EHP (EN i IS) a věta o EHP má výjimku pro ně (DECISIONS 2026-10-10 (32)).
- ✅ *(KUKY 2026-10-11 „ok a) a c)“ — DECISIONS 2026-10-11 (30): postup výmazu a pravidlo v `RUNAR_PRIVACY.md`, nástroj `vymaz_z_konverzaci.js`.)*
  ~~**ČEKÁ NA OWNERA**~~ — rozpor, který jsem dnes vyrobil (CODE-read): od DECISIONS 2026-10-11 (21) se přepisy konverzací nemažou
  (`cleanupPeriodDays` 36500) a noční záloha je drží napořád. Přepisy ale nesou i osobní údaje uživatelů — výpisy z DB (e-maily testerů),
  texty jejich čtení, jména (např. 2026-10-11 jsem v konverzaci vypsal rozbory GPT se jmény testerek). Zásady slibují „ERASURE: Everything goes
  — from our encrypted backups within 30 days“. Dnes jen 5 testerů a appka není veřejná, ale před spuštěním to musí sedět. Možnosti:
  (a) přepisy nechat, ale při žádosti o výmaz je projít `najdi_v_konverzacich.js` (e-mail, jméno) a údaje začernit — postup do `RUNAR_PRIVACY.md`;
  (b) přepisy a jejich zálohy mazat po N měsících (pak „nic se neztratí“ platí jen N měsíců); (c) session nevypisují osobní údaje uživatelů
  (e-maily, jména mimo adminy, texty čtení) — pravidlo, které by šlo zčásti hlídat strojem. Doporučení CODE-read: (a) + (c).

- ⚪ **Pro CODE-tune (před spuštěním) — měkké smazání účtu; ROZHODNUTO ownerem 2026-10-11 („1. souhlas“, DECISIONS (53)),
  ruční postup obnovy už stojí v `RUNAR_PRIVACY.md` · původně: obnova účtu po smazání:** dnes `delete-account` maže okamžitě, data drží jen šifrované zálohy
  30 dní; obnova = ruční ze zálohy, jen na žádost uživatele (nové ID účtu → přemapovat). Návrh CODE-read: teď ruční postup do
  `RUNAR_PRIVACY.md`; před spuštěním „měkké smazání“ (30 dní skryté, přihlášení smazání zruší, pak skutečný výmaz) — sloupec, noční úloha,
  hláška v appce, text zásad EN + IS (CODE-tune, nasazení owner). Owner 2026-10-11: „30 dní na smazání je dobré, třeba bude chtít účet obnovit?“

#### Kolo 2 / 21 — nápověda × appka a časový rozpočet čtení (části 42, 44; 2026-10-11)
**Platí:** položka (o) je hotová — body 1–4 v textu srovnané (u 1 zbyl jen komentář v kódu, 4 nese výjimku pro zálohy); bod 5 CODE-tune
nevyřešil ubráním, ale postavil upozornění na obnovu měsíčních čtení (7077816), takže věta EN „the app lets you know the next time you open
it“ i IS „appið lætur þig vita næst þegar þú opnar það“ teď platí. Časové konstanty `claude-proxy` beze změny (sol 50 s, pokus 55 s).
**Ověřeno (v kole 1 „z paměti, neověřeno“):** dokumentace Supabase „Edge Functions limits“ 2026-10-11 — wall clock **Free 150 s, placené
400 s**; **request idle timeout 150 s pro všechny tarify** (kdo do té doby nepošle odpověď, dostane 504). Nejhorší cesta čtení ≈ 105 s se
vejde. Pro budoucnost: placený tarif delší čtení bez průběžně posílané odpovědi nespasí — limit nečinnosti zůstává 150 s.

#### Kolo 2 / 22 — přihlašování, sliby appky, souhlas testera (části 38, 39, 36; 2026-10-11, DB jen čtením)
**Platí:** `/auth/v1/settings` beze změny (Google + e-mailový kód, potvrzení e-mailu, registrace otevřená záměrně; CAPTCHA dál „před
spuštěním“) · sliby tierů: `verify_tier_features.js`, `verify_monthly_limits.js`, `verify_reading_cost.js` OK; nápověda bere balíčky
z `CARD_PACKS` (žádná velikost natvrdo) · testerů 5, souhlas 4 — pátý (ne admin, účet 2026-05-20) nemá ani jedno čtení, souhlas si appka
vyžádá při přihlášení; odhlášených z analýzy 0. Nic k opravě.

#### Kolo 2 / 23 — zastaralá místa v živých docích (část 17; 2026-10-11)
Zkušební průchod pěti kandidátů na mrtvé pojmy <!-- doc-links:ok 2026-10-11 výčet mrtvých pojmů, soubor záměrně smazán --> (`runar-gathering.js`, `icons/favicon.svg`, `is-grammar-qa`, `gpt-review`, opus-4-8 jako
produkční) našel 56 výskytů — většina historie (měření ke svému dni, hotové položky, eval README) a ta smí zůstat. Zastaralé byly jen
**pokyny k použití mrtvého nástroje**: `RUNAR_EVAL_LOG.md` ř. 33, 225, 333 a `RUNAR_BACKLOG.md` (otevřená položka „is-grammar-qa nad
uloženými výstupy“, „první týden sledovat is-grammar-qa“, „Pustit is-grammar-qa.py“) + `gpt-review` popsaný jako živý → opraveno na
odkaz „kontroly IS podle CLAUDE.md §2“ s poznámkou do kdy co platilo. **Stroj:** `check-docs.py` nově zastaví příkaz
`python … is-grammar-qa.py` v živém docu (měření a poznámky „do 2026-10-10“ pustí; ověřeno na 4 vzorcích).

#### Kolo 2 / 24 — zbytek: inline JS, popisy run, ráčna ㉸, docs/, opt-out, pre-push, souběh (části 27–31, 37, 40; 2026-10-11)
**Platí:** inline skripty bez mrtvé definice (shrine 125 — v kole 1 110, nápověda 16, soukromí 7; protipříklad sken našel) · popisy run:
připomínka „pravidlo při 25+“ dál čeká na ownera/Cowork (obsah, nespěchá, nenavrhovat znovu) · ㉸ ráčna OK (character 15, utils 7) ·
`docs/`: mapa promptu v archivu, bez odkazu na starou cestu; Vegvísir označený odložený · ㉾ opt-out OK · pre-push v čisté kopii se dnes
prokázal sám (zastavil push s neopravenými docs, ač opravy ležely ve sdíleném stromě) · zámek čtení: bere se před čtením zůstatku (~ř. 729),
uvolní se ve `finally` na každé cestě, selhání uvolnění = vyprší sám.

#### ⭐ Kolo 2 uzavřeno (2026-10-11) — co našlo a co z toho hlídá stroj
Části 1–44 znovu (kromě 6 = strom, CODE-tree) + nové typy: duplicity v pravidlech, sliby × tok kódu, peníze a plýtvání, nasazeno = repo,
zkouška obnovy zálohy. **Nálezy:** redeem-code propadl kód při chybě kreditů · plovoucí supabase-js v 10 edge funkcích · nápověda HTML × JS ·
favicon 3 MB · hlas ElevenLabs na 4 místech · tree_state v zásadách · přepisy konverzací × slib výmazu · 30denní plýtvání bez data ·
pokyny k mrtvému is-grammar-qa · duplicity CLAUDE.md/working-style/paměť (32 → 25 pravidel) · sebrání cizích kusů commitem.
**Nové stroje z kola 2:** pravidla při dotyku (+ kontrola proti kánonu po zprávě ownera, + pasti v příkazech) · pre-commit „sdílené docy jen
přes commit_vlastni“ · záloha a hledání konverzací + výmaz · maskování jmen ve vzorcích · neověřené tvrzení ve zprávě · check-docs na
mrtvý příkaz · smoke ㊲ ㊳ ㊴. **Kolo 3** (KUKY 2026-10-10: „pojedeme znova, dokud všechno nevychytáme“): napřed části, které se od kola 2
měnily (git log), a nové typy: soulad mezi mechanismy (hook × hook, kontrola × kontrola), co stroje propouštějí (protipříklady naostro).

#### Kolo 3 / 1 — soulad mechanismů: pre-commit × nástroj Edit (nový typ kontroly; 2026-10-11)
**Nalezeno (rozpor, který jsem vyrobil týž den, CODE-read):** pre-commit pouští sdílené docy jen přes `commit_vlastni` a ten commitne jen
zápisy ze `zapis()` (ověřeno v `commit()`); změna nástrojem Edit by uvízla — necommitnutelná bez výjimky `RUNAR_SDILENE_OK`.
**Opraveno:** hook pravidel zastaví Edit/MultiEdit a Write přes existující sdílený doc hned s návodem; `commit_vlastni.py uprav <lane>
<soubor> <stary.txt> <novy.txt>` dělá totéž co Edit přes `zapis()` (texty v souborech, ne v argumentech). Testy: hook 33 stavů (testy
uz_vime a kánonu teď zapisují skutečnou cestou cv.zapis), `uprav` 3 stavy v dočasném repu (nahradí · commitne · dvojznačný odmítne),
původní samotest `commit_vlastni` beze změny. Nový soubor nástrojem Write dál smí (pak `pridej`).

#### Kolo 3 / 2 — soulad mechanismů: API guard × `uprav`, noční záloha DB × konverzace (2026-10-11)
**Bez nálezu:** API guard nechá projít `commit_vlastni.py uprav` i s textovým souborem, který mluví o klíčích a API (naostro, exit 0) —
k zablokování úpravy docu nedojde (Edit zastavený + guard by blokoval i náhradu).
**Opraveno:** záloha konverzací běžela jen po ÚSPĚŠNÉ záloze DB (`.then()`), takže výpadek Supabase CLI by zastavil i ji, ačkoli spolu
nesouvisí. Teď běží vždy; výsledek dál rozliší, co selhalo (DB → 1, jen konverzace → 2). Ověřeno simulovaným selháním DB v kopii
s logem mimo skutečný (`RUNAR_ZALOHA_TEST_DB_SELZE`): CHYBA DB + konverzace proběhla, exit 1; samotest lhůty 30 dní beze změny.

#### Kolo 3 / 3 — soulad mechanismů: pokyny k commitu × pre-commit (2026-10-11)
**Nalezeno a opraveno:** Stop-hook `tree-guard.sh` radil pro nový soubor v `memory/` pathspec commit, který pre-commit u `memory/` nepustí
(session by uvízla mezi dvěma hooky) → radí `commit_vlastni.py pridej` + `commit` (záloha `tree-guard.sh.pred-k3-2026-10-11`). CLAUDE.md
v sekci session (příkaz s podpisem i „Commit ÚZCE“) uváděl pathspec commit pro všechno → doplněno, že sdílené docy jen přes `commit_vlastni`.

#### Kolo 3 / 5 — části změněné od uzavření kola 2 (1627cbb; 35 commitů CODE-tune a CODE-tree; 2026-10-11, DB a nasazení jen čtením)
**Bez nálezu:** záložka TESTERS ve shrine (data jen pro admina — `voice-usage` 401/403; e-maily přes `escapeHtml`, shrine načte
`runar-utils.js` dřív než záložku) · brzda hlasu v kódu odpovídá DECISIONS (48) a (52), obě funkce volají `brzdaHlasu` · nasazení = repo (v UTC: `elevenlabs-proxy`/`-static` v38/v17 po 08b1e26,
`voice-usage` v5 po 74ad59c; pozdější změna `_shared` jen konstanta pro `voice-usage`) · strom v appce jen admin (`renderLivingTree`) ·
`tree_state` appka neukládá (`TREE_UPDATE` nikdo nevolá) → podmínka (d) z kola 2 platí.
**Hlas ke každému čtení (CODE-tune, 67b507d + opravy, DECISIONS (61)) — projito po commitu, bez nálezu:** lístek pro neuložené čtení
ověřuje `crypto.subtle.verify` (konstantní čas) a váže uživatele + nonce + text; „jednou“ drží zámek ve `voice_tickets` (unikátní klíč) PŘED
voláním ElevenLabs (souběžná ťuknutí nezaplatí dvakrát); text uloženého čtení bere server z DB (jen vlastní `user_id`); bucket
`reading-voice` soukromý, `voice_tickets` RLS bez politik; `delete-account` maže audio po dávkách 100 (nejvýš 200 kol) — moje
podezření „jen prvních 100“ vyvráceno; zásady o uloženém audiu EN i IS.
**Opraveno cestou:** pre-push „soubory mimo git“ zastavil push všem kvůli minuty staré migraci CODE-tune → čerstvé (< 2 h) jen varování.
**Dávka 3, bez nálezu:** zakládací Norny zdarma drží server (jen s životní runou, jednou: `tree_founded_at` před voláním, zápis podmíněně
`is null`; souběh nejvýš jedno textové volání ~$0.005, hlas se u zakládání nenabízí) · menu s počtem hlasů jen pro testera se stropem
`VOICE_MONTHLY_LIMIT_TESTER` (strop 5 pro ostatní zmizel i z configu, DECISIONS (61)) · shrine anglicky hlídá ㉹ · zakládání na klientu
hlídají ㊶ ㊷ CODE-tree s útoky.

#### ⭐ Kolo 3 uzavřeno (2026-10-11) — co našlo a co z toho hlídá stroj
**Soulad mechanismů:** Edit × pre-commit (`uprav`) · noční záloha DB × konverzace · pokyny k commitu × pre-commit · commit „jen svého
bloku“ smazal čerstvé cizí útoky (c3dfd49, vráceno) a pathspec přibalil cizí rozdělanou práci (1c37d3e, 4eb6905) · pre-push nad sdíleným
stromem zastavil push všem kvůli rozdělané migraci · hook ukazoval nesouvisející pravidla podle cest v datech skriptu.
**Kontroly pod útokem:** útok má každá kontrola, která ho mít může (`scripts/protipriklady.py`, smoke ㊵); vadu jiným tvarem propustilo 6
(zápis do DB přes alias / objekt v proměnné / dvojité uvozovky, otázka přes U+2028, SQL přes víc řádků a v uvozovkách, životní runa za
tierem) — všechny opraveny.
**Nové stroje z kola 3:** smoke ㊵ · pre-commit: mazání čerstvé cizí práce (51) a sdílené soubory včetně pěti souborů appky (58, 60) ·
hook: nový text porovná s kánonem a `uz_vime` až po zprávě ownera (46), skript za `$S/`, neviditelné znaky, přímý zápis do sdíleného
souboru, cíle zápisu podle doslovných cest · soubory mimo git: čerstvé = varování.
**Kolo 4:** napřed části změněné od uzavření kola 3 (git log), pak nové typy — co navrhne owner, jinak zátěž a souběh (víc session
naráz pushuje, zamítnutí „cannot lock ref“ dnes 3×, zatím vždy bez ztráty).

#### Kolo 3 / 4 — protipříklady naostro: kontroly pod útokem (2026-10-11)
**Metoda:** čistá kopie repa (`git worktree`), do souboru podstrčená skutečná chyba, kontrola s `RUNAR_ROOT` na kopii musí spadnout.
**Výsledek:** 19 útoků / 15 kontrol, 16 chyceno hned. Slepé: `verify_db_write_checked` (alias `_db = sb`) a `verify_write_surface`
(`from("user_profiles")`, `update(p)`) → opraveno, obcházky zůstávají jako útoky. Smoke ㊵ je pouští samo při změně (DECISIONS (44)).
- [x] **HOTOVO 2026-10-11 — útok má každá kontrola ve smoke, která ho mít může; kterým chybí a proč, stojí u případů v `scripts/protipriklady.py` (kolo 3 / 4j). Původně: Doplnit opakované útoky pro zbývajících 46 kontrol** (61 − 15; opravou (45): pět z nich prošlo jednorázovou mutací při vzniku —
  ✅ 2026-10-11 převedeno čtyři z pěti (c3dfd49: `verify_ask_teaser`, `verify_ending_angle`, `verify_image_aspect_key`,
  `verify_image_pin`; dva první pokusy byly vadné útoky, ne slepé kontroly — pin se uplatňuje dvakrát, rozpočet délky má jednu variantu);
  `verify_tree_mista` (lab, prohlížeč) předán CODE-tree. CODE-tune přidal útoky na brzdu kreditů ve smoke ⑨ — celkem 28 útoků / 19 kontrol).
  ✅ 2026-10-11 dávka „nepřítomnost“: `verify_question_injection` (obcházka přes U+2028/U+2029 prošla → kontrola doplněna),
  `verify_journal_glyphs`, `verify_tier_features`, `verify_new_duplicates`, `verify_fresh_dates`, `verify_shared_tree` (nový režim
  `stage` — index), `verify_commit_identity` (nový režim `commit` — historie). `verify_prelaunch_open` útok nemá: záměrně jen vypisuje.
  ✅ 2026-10-11 dávka „peníze, soukromí, jazyk“: `founding_flag`, `owned_before_tier` (propustil podmínku `&& isStdPlus` → kontrola
  posílena), `reading_cost`, `opt_out` (propustil SQL přes víc řádků a `"readings"` → hledá v celém souboru), `jazyk_ui`,
  `edge_imports`, `rune_glyphs`, `lang_ternary`. Kolik útoků a které kontroly ještě útok nemají, ukáže
  `python -X utf8 scripts/protipriklady.py --vse` proti seznamu ve `smoke.py` (číslo se tu nevede — zastará, §20.4).
  Původně: pak ty, které hledají NEPŘÍTOMNOST (propustí-li, nikdo si
  nevšimne): `verify_question_injection`, `verify_journal_glyphs`, `verify_shared_tree`, `verify_commit_identity`, `verify_prelaunch_open`,
  `verify_fresh_dates`, `verify_new_duplicates`, `verify_tier_features`. Postup: případ do `PRIPADY` v `scripts/protipriklady.py`,
  `python -X utf8 scripts/protipriklady.py <kontrola>`.

- [ ] **Útok může viset a zablokovat pre-push všem** (CODE-tune 2026-10-11): `verify_zalozeni_stromu.js` pod útokem `frameH: null`
  (`scripts/protipriklady.py`, útoky na ㊷) běžel 15 min bez výstupu, pre-push CODE-tune stál, node zabit ručně. `beh()` volá
  `subprocess.run` bez `timeout=` a zabití node na Windows nechá žít Chrome pod ním. Oprava: (1) CODE-tree — celkový limit v kontrole
  (FAIL „visí“); (2) CODE-read — limit na útok v `beh()`, při vypršení zabít strom procesů (`taskkill /T /F`) a hlásit FAIL „visí“, ne
  „chyceno“ (zabitý node = exit ≠ 0, útok typu chyti by se uložil do cache jako úspěch). Oběma session posláno 2026-10-11.
  ✅ **(1) hotovo 2026-10-11 (CODE-tree, c05fcb3):** ㊷ má hlídač 150 s → FAIL „visí“ s krokem, Chrome bez okna se zabije i při chybě,
  dialogy (alert / confirm) se samy potvrdí a ohlásí jako FAIL (zablokovaly by stránku navždy); ověřeno útokem — podstrčený alert
  (útok v `PRIPADY`) i nekonečné čekání. Zaseknutí z pre-pushe CODE-tune se u CODE-tree nezopakovalo. Zbývá (2) pro CODE-read.
  ✅ **(2) hotovo 2026-10-11 (CODE-read, 39e91ca)** — limit 240 s na běh kontroly v protipříkladech.
  ✅ **(3) CODE-tune 2026-10-11:** visela i kontrola mimo útoky — ㊺ `verify_wts.js` přímo ve smoke pre-pushe 48 minut (Chrome bez okna spadl
  při souběhu, kontrola čekala na odpověď navždy; s pojistkou to teď skončí po 13 s jako FAIL „spojení se zavřelo“). Šest kontrol CODE-tune
  v prohlížeči (㉼ ㊹ ㊺ ㊻ ㊼ ㊽) má jednu sdílenou pojistku `scripts/utils/prohlizec_pojistky.js`: limit, spadlý Chrome, dialog (samotest
  `--test`, útok s dialogem v `PRIPADY`). Pád Chrome při souběhu dál shodí pre-push (push stačí pustit znovu), už ho ale nezablokuje.

**Smoke zrychlen (2026-10-10, CODE-read):** `verify_decisions_followthrough.js` pouštěl `git blame` pro každý z ~340 řádků
„Affected doc(s)“ a `show`/`log` pro každý doc zvlášť — smoke trval přes půl hodiny (hlášení CODE-tune) a pomalá kontrola svádí
k `--no-verify`. Teď jeden blame a jeden průchod historií: změřeno 575 s → 5 s, výstup shodný.
