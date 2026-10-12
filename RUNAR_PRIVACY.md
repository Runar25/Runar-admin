# RUNAR_PRIVACY.md — Data & GDPR handling
# 2026-07-13. Island = EEA → GDPR platí plně. Jedeme STRIKTNĚ podle EU pravidel, žádné dělení.
# ⚠️ Toto je pracovní podklad, ne právní posudek. Před spuštěním potvrdit s DPO/právníkem.
#    IS texty authored + ověřené (is-grammar-qa / BÍN); před publikací právní kontrola (Island/EEA).

## Co je osobní údaj v Rúnarovi
- **`readings` řádek** = osobní údaj: `user_id` → identita (user_profiles: jméno, DOB; auth: email).
- **`question` (volný text)** = potenciálně **zvláštní kategorie (čl. 9)** — lidé píšou zdraví, vztahy, víru.
- `area` / `seeking` / `life_rune` (z DOB) = osobní situace.
- **Co jde k modelu** (od 2026-10-09 **OpenAI**, USA — všechna čtení, Ask, životní runa i jméno; **Anthropic**, USA, jen při výpadku
  OpenAI a u adminova přepínače Opus; `RUNAR_DECISIONS.md` 2026-10-09 (13)): jméno, když ho člověk zadá · volby (oblast, hledání, záměr) ·
  volná otázka · u životní runy DEN a MĚSÍC narození a jméno islandského měsíce — **rok ne** (do promptu od 2026-09-30, minimalizace
  čl. 5 odst. 1 c, `RUNAR_DECISIONS.md` 2026-09-30 (11); **od 2026-10-09 se rok vůbec nezadává** — islandský měsíc se počítá bez něj,
  uložený rok starých účtů slouží jen jako semínko tvaru stromu, `RUNAR_DECISIONS.md` 2026-10-09 „Rok narození se nezadává“; ty staré účty jsou admin účty a rok u nich ZŮSTÁVÁ — KUKY 2026-10-10, `RUNAR_DECISIONS.md` 2026-10-10 (35), data admin účtů nejsou nález)
  · u Asku jeho otázky a text čtení. Hlas: text čtení k ElevenLabs (USA), jen při prvním přečtení — pak se pouští uložený
  (DECISIONS 2026-10-11 (61)).

## Právní základy — KTERÝ na CO (klíč k „bez popupu")
| Účel | Základ | UI dopad |
|---|---|---|
| Vygenerovat + uložit čtení do journalu (služba, kterou si user vyžádal) | **Smlouva / plnění služby** (čl. 6.1.b) | ŽÁDNÉ — jen popsat v policy |
| **Zlepšování kvality** (analýza výstupů, gramatika, eval) | **Oprávněný zájem** (čl. 6.1.f) — non-special, pseudonymizované | **žádný popup** — transparentnost + **opt-out** v nastavení |
| Analýza vázaná na identitu / special-category `question` | **Výslovný souhlas** (čl. 9.2.a) | **jen TESTEŘI** (souhlas při vydání účtu) |

→ **Běžný user nedostane otravný popup.** Zlepšování kvality = oprávněný zájem + privacy policy + možnost
opt-outu (ne opt-in brána). Výslovný souhlas jen u testerů — a ti CHTĚJÍ pomoct, takže tam friction nevadí.
Zásady v appce (`v2/runar-privacy.html`, oddíl 3, EN i IS) rozbor kvality i cestu k odhlášení uvádějí od 2026-10-10 — do té doby
v „oprávněném zájmu“ chyběl, ačkoli rozbor běžel (`RUNAR_DECISIONS.md` 2026-10-10 (45)).

## Pravidla analýzy (aby oprávněný zájem obstál)
1. Analyzuj **VÝSTUP** (text čtení) + inputy pro kvalitu/gramatiku — **ne identitu**.
2. **Pseudonymizuj**: analytická/eval vrstva nepotřebuje `user_id`.
3. **Special-category `question` neváž na identitu** v analýze (nebo jen s tester souhlasem).
4. **Respektuj opt-out**: user s `analytics_opt_out=true` → jeho čtení se NEzahrnou do vieweru/evalu. Skripty ve `scripts/` čtou čtení k analýze jen přes `scripts/utils/cteni_analyza.sql` (bez odhlášených), hlídá smoke ㉾ (2026-10-10; do té doby filtr měl jen `list-readings` a export, 11 skriptů ne — odhlášených bylo 0).
5. **Data v EU** (Supabase eu-west-1) — nikdy nesypat osobní čtení mimo EU (Slack/US = jen anonymizované).
   **Výjimka (KUKY 2026-10-10, DECISIONS 2026-10-10 (32)):** šifrovaná denní záloha DB na Google Drive (7z AES-256, heslo jen u nás) —
   Drive umístění v EHP nezaručuje, proto stojí v zásadách mezi zpracovateli (`v2/runar-privacy.html`, EN i IS). S přechodem na Hetzner
   zálohy jen v EHP a kopie na Drive se vypne. Zálohy se drží **30 dní** (KUKY 2026-10-10 „7. ano, 30 dní“; maže `scripts/utils/zaloha_db.js`), smazaný soubor může ještě
   až 30 dní ležet v koši Google Drive — obojí stojí v zásadách.
6. **'someone' čtení (třetí osoba) = JEN u testerů.** Čtení „FOR SOMEONE" nese jméno třetí osoby v textu a ta nic neodsouhlasila → u testera testovací data krytá souhlasem; u běžného usera se NEUKLÁDÁ vůbec. Journal usera je nikdy nezobrazí (`reading_mode='someone'`).

---

## Tester consent (in-app, při vydání/prvním loginu tester účtu)

⛔ **Znění se sem NEOPISUJE.** Vlastníkem je `UI_TEXT.en.tcm_body` a `UI_TEXT.is.tcm_body`
v `v2/runar-translations.js` (§20). Do 2026-09-11 tu stála kopie — a **rozešla se s pravdou**:
tvrdila „Your data stays in the EU" / „Gögnin þín eru geymd innan EES", jenže text čtení jde
k **Anthropicu** a hlas k **ElevenLabs**, obojí do USA. Souhlas sebraný na to znění tedy
nepokrýval, co se doopravdy děje.

**Opraveno 2026-09-11:** znění nově pojmenuje oba zpracovatele i zemi. A protože tři účty
souhlasily na tom starém, byl jim `tester_consent_at` **vynulován** — modal se jim ukáže znovu
a souhlasí na pravdivém textu. Detail → `RUNAR_DECISIONS.md` 2026-09-11 (8).

## Privacy policy — „Your readings" sekce (na agndofa.is)

**EN:**
> **Your readings.** When you draw a reading we store it in your account so you can see your history; it
> is generated from the details you provide. We may also review and analyse readings — the generated text
> and the inputs — to improve the quality of Rúnar's guidance, on the basis of our legitimate interest in
> improving the service. Where a reading contains sensitive details you chose to enter, we analyse it only
> in a form not linked to your identity, unless you are a tester who has given explicit consent. Your data
> is hosted within the EU (our processor, Supabase). You can opt out of quality analysis at any time in
> your account settings, and you can ask us to delete your readings or account. We never sell your data.

**IS (ověřené is-grammar-qa / BÍN; právní kontrola):**
> **Lestrarnir þínir.** Þegar þú dregur lestur geymum við hann á aðganginum þínum svo þú sjáir söguna þína;
> hann er saminn út frá upplýsingunum sem þú gefur. Við kunnum einnig að fara yfir og greina lestra —
> textann og innslegnu upplýsingarnar — til að bæta gæði leiðsagnar Rúnars, á grundvelli lögmætra hagsmuna
> okkar af því að bæta þjónustuna. Ef lestur inniheldur viðkvæmar upplýsingar sem þú kaust að slá inn,
> greinum við hann aðeins á formi sem er ekki tengt persónu þinni, nema þú sért prófari sem hefur veitt
> afdráttarlaust samþykki. Gögnin þín eru hýst innan EES (vinnsluaðili okkar, Supabase). Þú getur afþakkað
> gæðagreiningu hvenær sem er í stillingum aðgangsins, og þú getur beðið um að lestrum þínum eða aðgangi
> verði eytt. Við seljum gögnin þín aldrei.

## Retence + práva
- **Retence:** rozhodnout dobu (návrh: čtení drž po dobu účtu; při zrušení účtu smazat, nebo anonymizovat pro eval).
- **Práva subjektu:** přístup (Readings viewer to částečně pokrývá pro adminy; user si vidí své v journalu) +
  smazání (delete account → smazat/anonymizovat jeho readings). Export na vyžádání.
- **Evidence pohybů kreditu (`credit_ledger`) přežívá smazání účtu — a je to v pořádku, protože
  po smazání se to UUID nemá s čím spojit.** `delete-account` nuluje `gift_codes.used_by` a pak
  smaže `auth.users`, což kaskádou bere `user_profiles` i `readings`. Nezůstane **žádná** tabulka,
  která by UUID přeložila na e-mail nebo jméno — klíč je zničen, takže řádek je fakticky
  anonymní účetní záznam (recitál 26). Hashovat UUID by ochranu nepřidalo (mapování už neexistuje),
  jen by zabilo možnost dohledat historii u ŽIVÉHO účtu — což je právě to, kvůli čemu evidence vznikla.
  ⚠️ **Platí jen dokud žádná jiná tabulka mapování nedrží.** Až přibude Shopify / objednávky,
  tenhle závěr se musí přezkoumat — objednávka s e-mailem a `user_id` mapování obnoví.
  ⚠️ Tohle je technický rozbor, ne posudek — patří na seznam pro právní/DPO review (viz backlog).
- **Evidence hlasu (`voice_usage`, od 2026-09-25)** — u každého generování jen počet znaků, model, jazyk, čas a `user_id`;
  **žádný text**. Účel: náklady na hlas po skupinách a volba tarifu ElevenLabs (oprávněný zájem, účetnictví služby).
  `user_id` má `on delete set null` → po smazání účtu zbude anonymní účetní řádek, stejná úvaha jako u `credit_ledger` výš.
  Klient tabulku nečte ani nepíše (RLS bez politik). Snímky předplatného (`voice_quota_snapshots`) osobní údaj nenesou.
  Migrace: `sql/2026-09-25_voice_usage.sql`.
- **Uložený hlas čtení (úložiště `reading-voice`, od 2026-10-11, DECISIONS 2026-10-11 (61))** — když Rúnar uložené čtení přečte
  nahlas, audio (mp3) se uloží k čtení, ať se dá v deníku pustit znovu bez dalšího volání ElevenLabs. Soukromé úložiště, přehrání jen
  přes podepsaný odkaz z `elevenlabs-proxy` (hodina). Čtení pro někoho jiného, které se neukládá, se neukládá ani jako hlas. Záznam
  „zaznělo“ (`voice_tickets`: id čtení nebo podpisu, `user_id`, čas, cesta k souboru) — žádný text. Retence: po dobu účtu (i u čtení,
  která Rune Seeker v deníku už nevidí); `delete-account` maže soubory, `voice_tickets` padají kaskádou. Zásady (EN/IS) to uvádějí
  v tabulce dat. Migrace: `sql/2026-10-11_hlas_ke_cteni.sql`.
- **Hlášení testerů (`bug_reports`, zapsáno 2026-10-09 kontrolou architektury — do té doby tu nestálo nic):** typ, zpráva, označený
  výřez textu (u čtení začátek čtení, může nést jméno), kontext obrazovky, jazyk, verze appky, `user_agent` a pole `tester` =
  jméno, které si tester sám napsal (2026-10-09: 0 e-mailů z 241). **Žádná vazba na účet** (`user_id` tabulka nemá) → smazání účtu
  hlášení nesmaže. Číst je smí jen admin přes `list-reports` (RLS bez SELECT politiky); do Slacku jde jen typ a metadata
  (`notify-report`, ne text ani jméno). Vložit hlášení smí od 2026-10-10 jen přihlášený (do té doby i nepřihlášený;
  politika `bug_reports_insert` → `authenticated`, `RUNAR_BACKLOG.md` „Kontrola architektury“, bod 9). **Doba uchování nerozhodnuta.**
- **Rozbory čtení od GPT (`gpt_reviews`, 2026-09-25 – 2026-10-09)** — tlačítko v adminově vlastní session (text jeho čtení šel
  k OpenAI) je od 2026-10-09 **zrušené** i s edge funkcí `gpt-review`; nové rozbory nevznikají. Uložené řádky zůstaly: text rozboru,
  model, id čtení a admin; cizí čtení v nich nejsou. Smazáním účtu admina zmizí (`on delete cascade`). Klient tabulku nečte ani nepíše.
  Migrace: `sql/2026-09-25_gpt_reviews.sql`.
- **Obnova smazaného účtu (DECISIONS 2026-10-11 (53)):** jen na žádost uživatele z téhož e-mailu a jen do 30 dní
  (pak archiv zálohy zaniká). Záloha (`scripts/utils/zaloha_db.js`) drží každou tabulku `public` a z `auth.users` jen id, e-mail a časy —
  přihlašovací údaje ne, a nejsou potřeba (přihlášení e-mailovým kódem). Postup:
  1. najít nejnovější archiv PŘED smazáním a v něm staré ID podle e-mailu (`auth.users`);
  2. v uzavřeném testu vrátit e-mail do `allowed_emails` se stejnou rolí jako v záloze (`delete-account` ho maže);
  3. uživatel se znovu přihlásí → nové ID;
  4. z archivu přenést řádky starého ID pod nové: `user_profiles` (i tier a kredity — píše jen server, tedy SQL ownera), `readings`,
     `tree_state`; `gift_codes.used_by` u kódů, které uplatnil (smazání je vynulovalo); `credit_ledger` přežil se starým ID → přepsat
     na nové. `voice_usage` zůstává anonymní (`on delete set null`, mapování už není). Zámek životní runy hlídá jen roli klienta,
     SQL ownera ho neblokuje;
  5. začerněné přepisy konverzací (výmaz výš) se neobnovují.
  Nástroj na kroky 1 a 4 zatím není — napsat a vyzkoušet na kopii při první žádosti; zápis do produkční DB pouští owner.
  Před spuštěním to nahradí „měkké smazání“ → `RUNAR_BACKLOG.md`.

- **Přepisy konverzací s Claudem (vývoj, od 2026-10-11 se nemažou — DECISIONS 2026-10-11 (30)):** pracovní přepisy session (CODE i Cowork)
  a jejich noční šifrovaná kopie (`~/runar-eval/zaloha-konverzaci`, 7z AES, jen na počítači ownera, ne na Drive) mohou nést osobní údaje
  uživatelů — výpisy z DB, texty čtení a hlášení, jména. Účel: aby se rozhodnutí a pokyny neztrácely (oprávněný zájem). Doba: bez lhůty,
  ALE při žádosti o výmaz se údaje začerní (slib „Everything goes — from our encrypted backups within 30 days“ platí i pro ně).
  **Postup při žádosti o výmaz** (spolu se smazáním účtu, do 30 dní):
  1. `node scripts/utils/vymaz_z_konverzaci.js "<e-mail>" "<jméno>" "<přezdívka>"` — jen spočítá výskyty (nic osobního nevypíše);
  2. totéž s `--ostre` — nahradí `[VYMAZÁNO]` v přepisech, zálohách při compactu i šifrovaných archivech;
  3. přepis běžící session (změna v poslední hodině) nástroj vynechá a vypíše — pustit znovu, až session skončí.
  **Aby se údaje do přepisů vůbec nedostávaly:** session nevypisují e-maily uživatelů; jména, čtení a hlášení testerů jen když je úkol
  potřebuje (vzorky čtení ownerovi dál ano, ale BEZ jména a otázky uživatele — `najdi_cteni.js` maskuje sám, DECISIONS 2026-10-11 (34)), nikdy hromadně;
  data adminů smí. Strojem to
  spolehlivě hlídat nejde (výstup je v přepisu dřív, než by ho cokoli posoudilo) — proto krok výmazu výš.

## Záznamy o činnostech zpracování (čl. 30) — 2026-10-12
Úkol z kontroly GDPR (`docs/archive/2026-10-12-gdpr-kontrola.md`, nález 10; výjimka pro firmy pod 250 zaměstnanců neplatí — zpracování
není příležitostné a může zahrnovat zvláštní kategorie). Správce: Agndofa ehf., info@agndofa.is. Co přesně se drží a jak dlouho, vlastní
tabulka „What is held“ v `v2/runar-privacy.html` (EN i IS) — tady se neopisuje; tady jen účel → základ → příjemci → přenos.
| účel | údaje (druh) | základ | příjemci (zpracovatelé) | přenos mimo EHP |
|---|---|---|---|---|
| účet a přihlášení | e-mail, jméno a fotka z Google (`auth.users`), kód | smlouva | Supabase · Brevo · Google (přihlášení, spíš samostatný správce) | — / DPF |
| čtení, deník, Ask | jméno (volitelné), volby, volná otázka (⚠️ může být čl. 9), den + měsíc narození, text čtení | smlouva · čl. 9 nevyřešen (kontrola, nález 1) | OpenAI · Anthropic (záloha) · Supabase | SCC (OpenAI, Anthropic) |
| hlas | text čtení, uložené audio | smlouva | ElevenLabs · Supabase | DPF + SCC |
| kredity a limity | zůstatky, měsíční jednotky, `credit_ledger`, `voice_usage` | smlouva · oprávněný zájem (účetnictví, prevence zneužití) | Supabase | — |
| rozbor kvality | texty čtení a vstupy, pseudonymizovaně, bez odhlášených | oprávněný zájem (opt-out) | interně; vývojová session → Anthropic (kontrola, nález 5) | SCC |
| testeři | souhlas, čtení „pro někoho“, hlášení | výslovný souhlas (čl. 9 odst. 2 a) | Supabase · Slack (jen metadata hlášení, bez osobních údajů) | — |
| zálohy | celá DB šifrovaně (AES-256) | oprávněný zájem (obnova) | Google Drive | DPF + SCC (jen ve Workspace s CDPA — ověřuje owner) |
| vývoj | přepisy konverzací (mohou nést údaje uživatelů) | oprávněný zájem | Anthropic (Claude Code) | SCC — v zásadách zatím chybí (nález 5) |
| hosting appky | IP adresa v logu | oprávněný zájem (provoz, bezpečnost) | GitHub Pages | DPF + SCC |
**Technická a organizační opatření:** RLS a granty sloupců (`sql/2026-07-16_user_profiles_column_grants.sql`, smoke ⑩) · peníze a oprávnění píše
jen server (service_role) · zálohy šifrované, klíč jen u nás · hlas přes podepsané lístky a odkazy s platností hodiny · fronta neuložených
čtení vázaná na účet (DECISIONS 2026-10-12 (4), smoke ㊿) · e-maily uživatelů se ve vývoji nevypisují (výš, „Přepisy konverzací“).

## Test oprávněného zájmu (čl. 6 odst. 1 f) — 2026-10-12
| účel | zájem | nezbytnost | vyvážení |
|---|---|---|---|
| rozbor kvality čtení | aby čtení byla dobrá a islandština správná — jádro služby | bez čtení skutečných výstupů se kvalita změřit nedá (syntetická čtení nereprodukují produkční vady, `RUNAR_EVAL_LOG.md` 2026-09-19) | jen výstup a vstupy, ne identita; citlivá otázka vázaná na osobu jen u testerů se souhlasem; opt-out kdykoli a skripty ho respektují (pravidla analýzy výš, smoke ㉾) |
| prevence zneužití | aby volné čtení a kredity nešly obejít | měsíční čítače a evidence kreditů jsou nejmenší možná data | po smazání účtu anonymní účetní řádek (výš, „Retence + práva“) |
| zálohy | obnova po chybě nebo výpadku | bez kopie se data nedají vrátit | šifrováno, 30 dní, klíč jen u nás |
| vývoj (přepisy) | aby se rozhodnutí a pokyny neztrácely | ⚠️ údaje uživatelů v přepisech nezbytné NEJSOU — vznikají vedlejším účinkem práce | slabé místo: lhůta „bez lhůty“ a přenos k Anthropicu — rozhodne owner (kontrola, nález 5) |

## Únik dat (čl. 33–34) — postup, 2026-10-12
1. Kdo si všimne (session, tester, owner): **hned ownerovi**, s tím, co, odkdy a koho se to týká; nic nemazat (důkazy).
2. Zastavit únik (vypnout funkci, zneplatnit klíč, opravit) a zapsat čas, kdy jsme se o úniku dozvěděli.
3. Posoudit riziko pro lidi (druh údajů — citlivá otázka a text čtení je vyšší riziko; počet lidí; jestli šlo o šifrovaná data).
4. Je-li riziko: **do 72 hodin** od zjištění oznámit Persónuvernd (personuvernd.is); je-li riziko vysoké, informovat i dotčené uživatele.
5. Každý únik — i neoznámený — zapsat do evidence níž (čl. 33 odst. 5): co, kdy, dopad, opatření, proč (ne)oznámeno.

**Evidence incidentů:**
- **2026-10-12 — fronta neuložených čtení na sdíleném zařízení** (DECISIONS 2026-10-12 (4)): neuložené čtení jednoho účtu se mohlo odeslat
  pod účtem, který se přihlásil po něm. Opraveno týž den (CODE-tune, smoke ㊿). Zda se to stalo, **nevíme** — nikdo to nehlásil a v datech
  se to rozlišit nedá; uzavřený test (testeři + tým). Neoznamováno: výskyt nezjištěn. Rozhodnutí potvrdí owner.

## Implementační checklist
**DB (owner v SQL editoru — viz `sql/2026-07-13_privacy_columns.sql`):**
- `user_profiles.is_tester boolean default false` — značka testera (souhlas + „zlatá data" filtr).
- `user_profiles.analytics_opt_out boolean default false` — user vypnul použití čtení pro zlepšování.
- (volitelně) `user_profiles.tester_consent_at timestamptz` — kdy tester odsouhlasil.

**Code (MAIN) — HOTOVO (2026-07-13, commity 6b79b1b + 996e315):**
- ✅ Opt-out toggle v side panelu (PRIVACY sekce) → `analytics_opt_out` (checked = opted in, default).
- ✅ `list-readings` **vylučuje opt-out usery** (GDPR); budoucí eval taktéž (pseudonymizace).
- ✅ Tester consent modal (první login is_tester bez `tester_consent_at`; freely-given = dismissible).
- ✅ Readings viewer: `is_tester` badge + „⚑ Testers" filtr.
- Texty přes UI_TEXT (§10); IS hotová a ověřená (CLAUDE.md §2 — fronta „→ Sigrún“ zrušena 2026-07-18; opraveno 2026-10-12). Zbývá: flag/annotate + obohacení řádku (prompt_version…).

**Owner (mimo kód):**
- ✅ **Supabase DPA — nic se nepodepisuje** (ověřil owner v dashboardu 2026-09-12). Supabase ho má
  **zabudovaný v Terms of Service** a platí pro každou organizaci automaticky, i na free plánu:
  *„No separate signed DPA is needed.“* (Organization settings → Legal Documents). Evropské přenosové
  doložky (SCCs) jsou jeho součástí a přijetím podmínek platí jako podepsané (DPA čl. 12.2).
  Projekt běží v **eu-west-1 (Irsko)** — ověřeno CLI; podle DPA čl. 6.1 se tam data ukládají
  a primárně zpracovávají.
  **Co z DPA plyne pro NÁS (čl. 4)** a kde to máme: informovat uživatele → privacy stránka ·
  souhlas, kde je potřeba → tester consent (text opraven 2026-09-11) · práva uživatele → smazání
  účtu. Nic nového k dělání nevzniká.
  ⚠️ Do 2026-09-12 tu stálo „podepsat“, a CODE ownerovi radil „stáhnout PDF k firemním dokumentům“
  — obojí zbytečné. Ukol, ktery nikdo neoveril, prezil dva mesice ve trech dokumentech.
- **Publikovat privacy policy** na agndofa.is (sekce výše) + odkaz z appky.
- **Právní review** IS textů + celého přístupu (Island/EEA). ➕ 2026-10-12: technická kontrola GDPR (CODE-read, není to právní
  posudek) → `docs/archive/2026-10-12-gdpr-kontrola.md` (nálezy, smlouvy u poskytovatelů); úkoly v `RUNAR_BACKLOG.md` „Soukromí — kontrola GDPR 2026-10-12“.

## Poznámka k friction (odpověď na „bude to lidi odrazovat")
Otázka „smíme použít tvé čtení k analýze?" jako **opt-in brána = NE.** Běžný user nic navíc nevidí —
jede se na oprávněný zájem + transparentní policy + tichý opt-out v nastavení. Výslovný souhlas jen testeři.
Tím je sběr dat od testerů (co teď rozjíždíš) **legálně podchycený bez dopadu na konverzi běžných userů.**
