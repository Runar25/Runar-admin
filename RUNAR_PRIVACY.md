# RUNAR_PRIVACY.md — Data & GDPR handling
# 2026-07-13. Island = EEA → GDPR platí plně. Jedeme STRIKTNĚ podle EU pravidel, žádné dělení.
# ⚠️ Toto je pracovní podklad, ne právní posudek. Před spuštěním potvrdit s DPO/právníkem.
#    IS texty authored + ověřené (is-grammar-qa / BÍN); před publikací právní kontrola (Island/EEA).

## Co je osobní údaj v Rúnarovi
- **`readings` řádek** = osobní údaj: `user_id` → identita (user_profiles: jméno, DOB; auth: email).
- **`question` (volný text)** = potenciálně **zvláštní kategorie (čl. 9)** — lidé píšou zdraví, vztahy, víru.
- `area` / `seeking` / `life_rune` (z DOB) = osobní situace.

## Právní základy — KTERÝ na CO (klíč k „bez popupu")
| Účel | Základ | UI dopad |
|---|---|---|
| Vygenerovat + uložit čtení do journalu (služba, kterou si user vyžádal) | **Smlouva / plnění služby** (čl. 6.1.b) | ŽÁDNÉ — jen popsat v policy |
| **Zlepšování kvality** (analýza výstupů, gramatika, eval) | **Oprávněný zájem** (čl. 6.1.f) — non-special, pseudonymizované | **žádný popup** — transparentnost + **opt-out** v nastavení |
| Analýza vázaná na identitu / special-category `question` | **Výslovný souhlas** (čl. 9.2.a) | **jen TESTEŘI** (souhlas při vydání účtu) |

→ **Běžný user nedostane otravný popup.** Zlepšování kvality = oprávněný zájem + privacy policy + možnost
opt-outu (ne opt-in brána). Výslovný souhlas jen u testerů — a ti CHTĚJÍ pomoct, takže tam friction nevadí.

## Pravidla analýzy (aby oprávněný zájem obstál)
1. Analyzuj **VÝSTUP** (text čtení) + inputy pro kvalitu/gramatiku — **ne identitu**.
2. **Pseudonymizuj**: analytická/eval vrstva nepotřebuje `user_id`.
3. **Special-category `question` neváž na identitu** v analýze (nebo jen s tester souhlasem).
4. **Respektuj opt-out**: user s `analytics_opt_out=true` → jeho čtení se NEzahrnou do vieweru/evalu.
5. **Data v EU** (Supabase eu-west-1) — nikdy nesypat osobní čtení mimo EU (Slack/US = jen anonymizované).
6. **'someone' čtení (třetí osoba) = JEN u testerů.** Čtení „FOR SOMEONE" nese jméno třetí osoby v textu a ta nic neodsouhlasila → u testera testovací data krytá souhlasem; u běžného usera se NEUKLÁDÁ vůbec. Journal usera je nikdy nezobrazí (`reading_mode='someone'`).

---

## Tester consent (in-app, při vydání/prvním loginu tester účtu)

**EN:**
> **You're a Rúnar tester — thank you.** To help us make the readings better, we store the readings
> you draw and review their text and the details you enter to improve Rúnar's quality. Your data stays
> in the EU, we never sell it, and you can ask us to delete it at any time. You can stop testing whenever
> you like. **[ I agree ]**

**IS (ověřené is-grammar-qa / BÍN; právní kontrola):**
> **Þú ert prófari fyrir Rúnar — takk fyrir.** Til að hjálpa okkur að bæta lestrana geymum við lestrana
> sem þú dregur og förum yfir texta þeirra og upplýsingarnar sem þú slærð inn, til að bæta gæði Rúnars.
> Gögnin þín eru geymd innan EES, við seljum þau aldrei, og þú getur beðið um að þeim verði eytt hvenær
> sem er. Þú getur hætt að prófa hvenær sem þér hentar. **[ Ég samþykki ]**

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
- Texty přes UI_TEXT (§10); **IS = draft → Sigrún**. Zbývá: flag/annotate + obohacení řádku (prompt_version…).

**Owner (mimo kód):**
- **Supabase DPA** (už v TODO) — podepsat.
- **Publikovat privacy policy** na agndofa.is (sekce výše) + odkaz z appky.
- **Právní review** IS textů + celého přístupu (Island/EEA).

## Poznámka k friction (odpověď na „bude to lidi odrazovat")
Otázka „smíme použít tvé čtení k analýze?" jako **opt-in brána = NE.** Běžný user nic navíc nevidí —
jede se na oprávněný zájem + transparentní policy + tichý opt-out v nastavení. Výslovný souhlas jen testeři.
Tím je sběr dat od testerů (co teď rozjíždíš) **legálně podchycený bez dopadu na konverzi běžných userů.**
