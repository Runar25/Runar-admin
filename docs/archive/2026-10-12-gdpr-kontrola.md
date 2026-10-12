# Kontrola GDPR — Rúnar (CODE-read, 2026-10-12)

> ⚠️ **NENÍ to právní posudek.** CODE-read není právník. Je to technická kontrola: co appka s osobními údaji SKUTEČNĚ dělá (kód, databáze,
> edge funkce, úložiště prohlížeče) proti tomu, co slibují zásady (`v2/runar-privacy.html`, EN), souhlas testerů a `RUNAR_PRIVACY.md`, a obojí
> proti textu GDPR (články níž). Slouží jako podklad pro právníka/DPO, ne jako jeho náhrada.
> Zadání: owner 2026-10-12 *„11. udělej ten posudek. 12. ano, projdi“* (bod 12 = smlouvy o zpracování u poskytovatelů → oddíl D).
> Stav ke dni sepsání; co platí dnes, vlastní kód, `git log` a `RUNAR_DECISIONS.md`. Doporučení k akci stojí v `RUNAR_BACKLOG.md`
> („Soukromí — kontrola GDPR 2026-10-12“); tady jen nálezy a důvody (§20).

## A. Shrnutí

| | nález | závažnost |
|---|---|---|
| 1 | Volná otázka (a otázky v Asku) může nést **zvláštní kategorii údajů** (zdraví, vztahy, víra) — jde k OpenAI/Anthropic a ukládá se, ale běžný uživatel k tomu nedává **výslovný souhlas** (čl. 9) | 🔴 |
| 2 | **Brevo** (posílá přihlašovací kód na e-mail) chybí v seznamu zpracovatelů | 🟠 |
| 3 | Zásady na **agndofa.is** („Your readings“) tvrdí „Your data is hosted within the EU“ a nejmenují přenos do USA (OpenAI, Anthropic, ElevenLabs) | 🟠 |
| 4 | Právní základ „**Consent** — for optional features such as voice and language preferences“ neodpovídá tomu, jak appka funguje (žádný souhlas se nesbírá ani neodvolává) | 🟠 |
| 5 | **Přepisy vývojových konverzací s Claudem** nesou osobní údaje uživatelů a jdou přes Claude Code k Anthropicu — tohle zpracování zásady neuvádějí | 🟠 |
| 6 | Chybí **minimální věk** uživatele | 🟠 |
| 7 | Výčet **úložiště prohlížeče** neúplný: místní deník čtení (`treeLog`: runy, oblast, záměr) a fronta neuložených čtení (text čtení i otázka) | 🟡 |
| 8 | **Hlášení z appky** (`bug_reports`) nejsou v tabulce „What is held“, doba uchování nerozhodnuta, smazání účtu je nesmaže | 🟡 |
| 9 | U **ElevenLabs** a záložní kopie na **Google Drive** zásady neříkají, na čem stojí přenos mimo EHP | 🟡 |
| 10 | Chybí **záznamy o činnostech zpracování** (čl. 30), **test oprávněného zájmu** (čl. 6 odst. 1 f), postup při **úniku dat** (čl. 33) a rozhodnutí, zda je potřeba **DPIA** (čl. 35) | 🟡 |
| 11 | **Přenositelnost** slíbena („machine-readable format“), nástroj na export není (ručně jde) | 🟡 |
| 12 | **ElevenLabs** u běžného účtu smí texty čtení použít k tréninku, dokud se to v účtu nevypne (z oddílu D) | 🟠 |

Co je v pořádku → oddíl C. Smlouvy u poskytovatelů → oddíl D.

## B. Nálezy

### 1 🔴 Zvláštní kategorie údajů ve volné otázce bez výslovného souhlasu (čl. 9)
- **Co se děje:** pole otázky („THE SITUATION“) a otázky v Asku jsou volný text. Lidé tam píšou i zdraví, vztahy, víru — `RUNAR_PRIVACY.md` ř. 8
  to sám označuje za „potenciálně zvláštní kategorii (čl. 9)“. Text jde k OpenAI (USA), při výpadku k Anthropicu, a ukládá se v deníku.
- **Proč to vadí:** zpracování zvláštní kategorie je zakázané, pokud nesplní jednu z výjimek čl. 9 odst. 2. Smlouva (čl. 6 odst. 1 b), na které
  zásady generování čtení stavějí, je jen základ podle čl. 6 — výjimku podle čl. 9 nenahrazuje. Pro tuhle službu přichází v úvahu jen
  **výslovný souhlas** (čl. 9 odst. 2 a). Dnes ho dávají jen testeři (souhlas `tcm_body`), běžný uživatel ne. Pravidla analýzy (oprávněný zájem
  jen nad pseudonymizovanými daty) řeší rozbor kvality, ne samotné generování a uložení.
- **Možnosti (rozhodne owner, ideálně s právníkem):** (a) výslovný souhlas u pole otázky / při prvním čtení — jednou, s možností odvolat
  (pak se otázka nebere); (b) jasná výzva nepsat do otázky zdravotní a jiné citlivé údaje + zásady to popíšou — slabší, souhlas nenahradí,
  jen sníží riziko; (c) obojí. Nález se týká i jména třetí osoby v čtení „pro někoho“ — tam je to dnes vyřešené tím, že se u běžného
  uživatele neukládá (`RUNAR_PRIVACY.md` pravidlo 6), k modelu ale odchází.

### 2 🟠 Brevo chybí mezi zpracovateli
- **Co se děje:** od 2026-10-10 posílá Supabase přihlašovací kód přes Brevo SMTP (`RUNAR_DECISIONS.md` 2026-10-10 (6)) — Brevo dostává e-mail
  uživatele. V oddílu „Who else sees it“ ani v souhlasu testerů není.
- **Proč:** čl. 13 odst. 1 e — příjemci nebo kategorie příjemců. Brevo je firma z EU (Paříž), přenos mimo EHP tu nevzniká.
- **Návrh:** doplnit řádek do zásad (EN + IS) a do `RUNAR_PRIVACY.md`. Podobně zvážit **Google** jako poskytovatele přihlášení („Sign in with
  Google“) a **GitHub Pages** (hostuje appku, vidí IP adresu návštěvníka) — oddíl D.

### 3 🟠 Zásady na agndofa.is jsou v rozporu s appkou
- Text „Your readings“ (`RUNAR_PRIVACY.md` ř. 56–75, publikuje owner na agndofa.is) říká *„Your data is hosted within the EU“* a nezmiňuje
  OpenAI, Anthropic ani ElevenLabs v USA. Appková stránka je od 2026-10-09 opravená. Už zapsáno (BACKLOG „Publikovat privacy policy na
  agndofa.is“); tady jen potvrzeno, že rozpor trvá.

### 4 🟠 „Consent“ jako právní základ pro hlas a jazyk
- Zásady uvádějí *„Consent — for optional features such as voice and language preferences.“* Appka ale žádný souhlas s hlasem ani jazykem
  nesbírá, nezaznamenává a nedá odvolat (čl. 7 odst. 1 a 3). Hlas i jazyk jsou součást služby, kterou si uživatel vyžádal → **smlouva**.
- **Návrh:** větu přepsat (hlas a jazyk pod smlouvu); souhlas nechat jen tam, kde se opravdu sbírá — souhlas testerů a případně bod 1.

### 5 🟠 Přepisy vývojových konverzací (Claude Code) — zpracování, které zásady neuvádějí
- `RUNAR_PRIVACY.md` ř. 125–136: přepisy session (CODE i Cowork) a jejich noční kopie „mohou nést osobní údaje uživatelů — výpisy z DB, texty
  čtení a hlášení, jména“, doba „bez lhůty“, výmaz na žádost začerněním. **Navíc:** všechno, co session vypíše, odchází přes Claude Code
  k Anthropicu (USA) — tedy i údaje uživatelů, které se při práci objeví. Zásady uvádějí Anthropic jen jako záložní model pro čtení.
- **Proč:** čl. 13 (účel, příjemci, přenos, doba uložení); čl. 5 odst. 1 e (omezení uložení — „bez lhůty“ potřebuje zdůvodnění).
- **Návrh:** (a) doplnit do zásad účel „vývoj a údržba služby“ s Anthropicem jako zpracovatelem, nebo (b) dál a přísněji držet pravidlo, že
  session údaje uživatelů nevypisují (dnes ho stroj neumí hlídat, `RUNAR_PRIVACY.md` ř. 136) a stanovit lhůtu pro přepisy. Rozhodne owner.

### 6 🟠 Minimální věk
- Zásady ani appka neuvádějí věkovou hranici. Služba zpracovává citlivý obsah (bod 1) a u dětí platí pro služby informační společnosti
  čl. 8 (souhlas rodiče pod věkovou hranicí státu). **Návrh:** stanovit minimální věk (např. 16 nebo 18 let) v zásadách a při registraci.
  Island stanovil hranici **13 let** — pod ní je potřeba souhlas rodiče (státní portál island.is, „Permission to process personal data from a
  parent or child“: https://island.is/en/processing-of-personal-data-of-children/permission-to-process-personal-data-from-a-parent-or-child).
  Číslo článku zákona 90/2018 jsem v primárním textu nedohledal — NEOVĚŘENO. Pozor: výslovný souhlas podle bodu 1 u nezletilých je zvlášť
  citlivý; i proto spíš hranice 18 let (rozhodne owner s právníkem).

### 7 🟡 Úložiště prohlížeče — výčet není úplný
- Zásady (oddíl „Cookies & local memory“) jmenují jazyk, jméno, počet čtení a přihlášení. V úložišti je navíc: `runar_gender` (oslovení),
  příznak okna „Where to start“ (už zapsané, BACKLOG), **`treeLog`** (místní deník čtení pro strom: runy, oblast, záměr) a **`pendingReadings` /
  `pendingAsks`** (fronta čtení, která server nepotvrdil — text čtení, otázka, odpověď Asku). Nic z toho neodchází jinam než na vlastní účet.
- **Návrh:** výčet nahradit popisem druhu („nastavení appky a dočasná kopie vašich čtení, dokud je server nepotvrdí“), nebo doplnit.

### 8 🟡 Hlášení z appky
- `bug_reports` nese zprávu, výřez textu (může být začátek čtení se jménem), `user_agent` a jméno, které si tester napsal. V tabulce „What is
  held“ není; doba uchování nerozhodnuta (`RUNAR_PRIVACY.md` ř. 106); bez vazby na účet, takže je smazání účtu nesmaže — zásady přitom slibují
  „all associated data“. **Návrh:** řádek do tabulky + doba uchování (např. 12 měsíců) + věta, že hlášení se mažou na žádost.

### 9 🟡 Přenos mimo EHP u ElevenLabs a Google Drive
- Zásady u OpenAI a Anthropicu uvádějí standardní smluvní doložky; u ElevenLabs (USA) a u záložní kopie na Google Drive („may keep it outside
  the EEA“) mechanismus chybí (čl. 13 odst. 1 f). Co poskytovatelé nabízejí → oddíl D.

### 10 🟡 Dokumentace, kterou GDPR předpokládá
- **Záznamy o činnostech zpracování (čl. 30):** výjimka pro firmy pod 250 zaměstnanců neplatí, když zpracování není příležitostné nebo zahrnuje
  zvláštní kategorie — tady obojí. `RUNAR_PRIVACY.md` obsahuje většinu podkladů, chybí jedna tabulka (účel · kategorie údajů · příjemci ·
  přenos · lhůta · bezpečnost).
- **Test oprávněného zájmu:** zásady se o něj opírají (rozbor kvality, prevence zneužití). Pravidla analýzy v `RUNAR_PRIVACY.md` jsou jeho
  jádro; chybí sepsaný test proporcionality (zájem · nezbytnost · vyvážení).
- **Únik dat (čl. 33–34):** není postup (kdo, do 72 hodin Persónuvernd, kdy informovat uživatele).
- **DPIA (čl. 35):** povinná u zpracování „ve velkém rozsahu“ zvláštních kategorií a u nových technologií s vysokým rizikem. Při uzavřeném
  testu rozsah velký není; **před veřejným spuštěním rozhodnout** (s právníkem), zda DPIA dělat — kombinace citlivých textů a AI modelů v USA
  je přesně případ, na který se ptá.

### 11 🟡 Přenositelnost
- Zásady slibují „Receive your readings in a machine-readable format“. Export v appce není (BACKLOG „Export dat subjektu“); na žádost jde
  ručně (SQL → JSON). Slib je splnitelný, jen pomalu — v pořádku do doby, než přijde víc žádostí.

## C. Co je v pořádku (ověřeno)
- Správce, kontakt, právo stížnosti u Persónuvernd, výčet práv — v zásadách jsou.
- Data v Supabase eu-west-1; DPA Supabase platí přijetím podmínek (`RUNAR_PRIVACY.md` ř. 152–157).
- Minimalizace: rok narození se nezadává a do promptu nejde; Slack dostává jen typ hlášení a metadata (`notify-report`, ne text ani jméno).
- Odhlášení z rozboru kvality funguje a skripty ho respektují (smoke ㉾); čtení „pro někoho“ se u běžného uživatele neukládá.
- Smazání účtu maže profil, čtení, hlas i soubory; `credit_ledger` a `voice_usage` zůstávají jako anonymní účetní řádky (rozbor
  `RUNAR_PRIVACY.md` ř. 81–94 — ⚠️ znovu přezkoumat, až přijde Shopify).
- Zálohy šifrované (AES-256, klíč jen u nás), 30 dní, a zásady to uvádějí.

## D. Smlouvy o zpracování (DPA) a přenosy u poskytovatelů
Rešerše 2026-10-12 jen z oficiálních stránek poskytovatelů (agent, klíčové body ověřil CODE-read sám — označeno ✔). Co nešlo ověřit, je NEOVĚŘENO.

**Island a Data Privacy Framework (DPF):** rozhodnutí EU 2023/1795 o odpovídající ochraně (EU–USA DPF) je začleněné do Dohody o EHP
(rozhodnutí Smíšeného výboru EHP č. 169/2024, účinnost 6. 7. 2024; https://www.efta.int/eea-lex/32023d1795). Na americké zpracovatele
s certifikací DPF se tedy z Islandu dá spolehnout jako z EU; kde certifikace není, nesou přenos standardní smluvní doložky (SCC) v DPA.

| poskytovatel | DPA — jak platí | přenos mimo EHP | trénink / uchování | co zbývá nám |
|---|---|---|---|---|
| **OpenAI** (čtení) | Podle ověření 2026-10-09 v textu DPA platí používáním služby (`RUNAR_DECISIONS.md` 2026-10-09 (13)); stránka enterprise-privacy zmiňuje i „DPA form“ — aktuální znění DPA agent nepřečetl (403) | pro EHP OpenAI Ireland Ltd.; dál SCC · DPF NEOVĚŘENO | API se netrénuje; logy proti zneužití až 30 dní; nulová retence jen po schválení (https://developers.openai.com/api/docs/guides/your-data) | pro jistotu vyplnit DPA formulář (nic nestojí); zvážit žádost o nulovou retenci kvůli bodu 1 |
| **Anthropic** (záloha čtení) | automaticky přes Commercial Terms (https://www.anthropic.com/legal/data-processing-addendum), pro EHP Anthropic Ireland Ltd. | SCC „deemed executed“ · DPF NEOVĚŘENO | trénink zakázán; uchování do 30 dní, povinných 30 dní jen u modelů Fable/Mythos — ✔ náš řetěz (`claude-opus-5`, `claude-opus-4-8`) mezi ně nepatří | nic |
| **ElevenLabs** (hlas) | automaticky součástí podmínek (https://elevenlabs.io/dpa) | DPF + SCC | ⚠️ ✔ **u účtů mimo Enterprise smí data použít k tréninku**, dokud se nevypne přepínač „Improve the models for everyone“ (profil → Terms and privacy → Data use; https://elevenlabs.io/docs/help-center/legal/is-my-data-used-to-improve-eleven-labs-ai-models) · obsah smí smazat až po 180 dnech nečinnosti | **owner vypne přepínač** (platí jen pro data odeslaná potom); zásady doplnit o uchování |
| **Supabase** (DB, přihlášení) | součástí ToS (už v `RUNAR_PRIVACY.md`) | SCC + posouzení přenosu (TIA), DPF nezmiňují | — | nic |
| **Brevo** (e-mail s kódem) | automaticky, příloha 3 obchodních podmínek (https://www.brevo.com/legal/termsofuse/) | hosting v EU; subzpracovatelé v USA přes SCC/DPF | — | jen doplnit do zásad (bod 2) |
| **Google Drive** (šifrovaná záloha) | jen u **Google Workspace**: dodatek CDPA přijme super admin v Admin console (Account → Account settings → Legal and compliance; https://support.google.com/a/answer/2888485); osobní Google účet DPA nemá | Google LLC v DPF + SCC v CDPA | — | ověřit, že `runar@therunekeeper.com` je Workspace (NEVÍM) a CDPA přijmout; zásady doplnit o mechanismus přenosu (bod 9) |
| **Sign in with Google** | Google tu spíš vystupuje jako samostatný správce — NEOVĚŘENO | — | — | zmínit v zásadách |
| **GitHub Pages** (hosting appky) | DPA jen pro GitHub Customer Agreement; pro Free/Pages NEOVĚŘENO | DPF + SCC | loguje IP návštěvníků kvůli bezpečnosti (https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages) | zmínit v zásadách |
| **Slack** (oznámení o hlášení) | DPA na všech plánech, ale jen přes podpisový formulář (https://slack.com/terms-of-service/data-processing) | DPF (Salesforce) + SCC | — | ✔ do Slacku jde jen id hlášení, jazyk, verze appky, obrazovka a klíč textu (`notify-report`) — bez jména, textu i vazby na účet → zapsat, že osobní údaje tam nejdou; DPA pak netřeba |
| **Shopify** (plán) | automaticky součástí ToS (https://www.shopify.com/legal/dpa), pro EMEA Shopify International Ltd. | Kanada (rozhodnutí o odpovídající ochraně) + SCC | — | při zavedení znovu přezkoumat `credit_ledger` (oddíl C) |

### 12 🟠 ElevenLabs smí texty čtení použít k tréninku (doplněno z oddílu D)
- Self-serve účet (Creator) má trénink na datech zapnutý, dokud ho majitel nevypne. Text čtení může nést jméno a obsah otázky (bod 1).
  Zásady o ElevenLabs a tréninku mlčí. **Návrh:** owner hned vypne přepínač; do zásad doplnit, že ElevenLabs data k tréninku nepoužívá
  a jak dlouho je drží.
