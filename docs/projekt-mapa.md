# Projekt — mapa stavu (podrobnosti k CLAUDE.md)
# Čte se NA POŽÁDÁNÍ. CLAUDE.md drží jen pravidla a pasti; tady jsou podrobnosti popisných sekcí (Tier, DB, Reading, Tree, …),
# přenesené doslova z CLAUDE.md při optimalizaci 2026-10-21 (DECISIONS 2026-10-21). Stav sám vlastní kód a `git log` (§20.4) —
# co tu zastará, oprav podle kódu nebo smaž.

## Co je Rúnar
AI-powered průvodce runami pro Agndofa (Island). Poetický hlas, nordická filozofie.
Lokální: C:\Users\zkuku\Downloads\Runar-admin\v2\
Stack: HTML + CSS + vanilla JS · Supabase (projekt v `runar-config.js` SB_URL) · modely čtení přes edge funkci `claude-proxy`
(který model čte, vlastní `SOL_MODEL` + záložní `MODELS` tam — do 2026-10-10 tu stálo „Claude API“, od 2026-10-09 čte GPT-6 sol) · ElevenLabs · IS primární + EN

## Soubory a jejich zodpovědnost
                        (úplný výčet má soubor sám; doc ho neopisuje, §20 — do 2026-10-09 tu stál i jejich počet)

## Tier systém
**Zdroj pravdy = `v2/runar-config.js`** (`TIERS` = jména EN/IS + flagy · `TIER_LIMITS` = pravidla
· `TIERS.*.monthly_readings` = kapacity). **Tady se to NEOPISUJE** — §20. Jména se od 2026-07-05
měnila dvakrát a každá opsaná tabulka to přežila jako zastaralá.
DB hodnoty (neměnné): `free_trial` · `rune_seeker` · `standard` · `premium`.
Identita: **všichni registrovaní jsou Rune Seeker**; standard/premium nejsou hodnosti, jen víc čtení.
ADMIN → `isAdmin()` v `runar-utils.js`, seznam `ADMIN_EMAILS` v `runar-config.js`. **VŽDY testovat i jako visitor/rune_seeker.**
**Účty (KUKY 2026-10-11, musel to opakovat):** testeři = **lidé ze seznamu** `allowed_emails` (role `tester` → premium + `is_tester` při registraci; kolik jich je,
řekne DB: `select count(*) from public.allowed_emails where role = 'tester'` — číslo se sem nepíše, owner přidává další).
Další **4 účty jsou týmu — ownera a Sigrún:** 2 admin (`ADMIN_EMAILS`) a 2 na test slabšího Rune Seekera (`is_tester`,
mimo `allowed_emails`). Kapacitu a brzdy testerů (čtení, hlas) počítej **jen pro ně**; účty týmu mají strop testera taky a do nejhoršího cyklu se počítají. U každého ownerova pokynu dohledej, **o kom**
mluví (testeři / produkce / tým) — pokyn pro testery se 2026-09-11 i 2026-10-11 omylem vztáhl na všechny (DECISIONS 2026-10-11 (49)).

## DB — user_profiles
**Schéma vlastní databáze + `sql/` migrace. Tady se NEOPISUJE** (§20) — ručně vedený seznam
se rozešel o 4 sloupce dřív, než si toho kdokoli všiml (2026-07-19: chyběly `address_gender`,
`is_tester`, `analytics_opt_out`, `tester_consent_at` — a do všech tří klient zapisuje).
Aktuální sloupce: `supabase db query --linked "select column_name from information_schema.columns
where table_name='user_profiles'"`.
Co databáze sama neřekne, a proto bydlí tady:
- ⚠️ **`email` a `updated_at` v `user_profiles` NEEXISTUJÍ** — časté chybné hledání; e-mail je v `auth.users`.
- **Zapisovatelnou plochu** (které sloupce smí klient měnit) vlastní `sql/2026-07-16_user_profiles_column_grants.sql`
  a hlídá ji smoke ⑩. Peníze a oprávnění (`tier`, `credits_balance`, `free_balance`, `month_*`) píše

## Reading systém — stav
**Unified format**: 1 plynoucí blok, žádné `|||`. `layer1-lbl` = glyf + jméno runy.
`_readingMode` = `'mine'` (ukládá — journal píše SERVER-SIDE claude-proxy hned po odečtu kreditu — dva zápisy, ne jedna transakce (do 2026-10-09 tu stálo „atomicky“); klient jen loadJournal) | `'someone'` (neukládá).
`u.area/seeking/intention/question` → `parts[]` → Claude. Norns axis: `_intentionContext(intention,lang)` v runar-character.js.
**Délky čtení**: zdroj pravdy = buildery v `runar-character.js` (RP_* packy + `closing()` věty). Docs čísla NEopakují — když měníš délku, uprav builder + přepočítej pricing (RUNAR_PRICING.md). Délka = znaky = EL náklad. Jméno ne vždy na začátek; životní runa jen kontext.
**Obraznost**: `_seasonalImagery(lang, drawn)` vloží do čtení JEDEN obraz. Primární zdroj je
`RUNE_IMAGES` — obrazy **klíčované runou**, obojí jazyk na témž řádku (od 2026-08-10 i pro EN).
⚠️ **`SEASON_POOLS` se do čtení NEDOSTANE — ověřeno protlačením 2026-09-08.** Do té doby tu
stálo „stojí na něm celá funkce: `if (!pool) return ''`". Obojí je mrtvé: **0 ze 150** dvojic (25 run × 6 sezón — ⚠️ do 2026-09-09 tu stálo 144, protože jsem runu **Blank** tiše vyřadil; má 3 obrazy a do výpočtu patří)
runa × bucket je bez runového kandidáta (`runePhrase` je tedy vždy neprázdné a `phrase =
runePhrase || …` po poolu nesáhne), a `_seasonBucket` vrací pool pro všech 12 měsíců, takže
ani ten guard nezabere. Padá s tím i los klíčových slov (`pickedKws`), který visí na téže
podmínce. Sezónní **sáček** se přesto čerpá při každém čtení — to je jediný živý účinek poolů.
Sáček proti opakování má klíč per SADA run; u spreadu se losuje ze všech tažených, ne z první pozice.
KLÍČ (2026-06-12, jeden test na Claudovi): konkrétní pokyn v user promptu vyhrál nad obecným pravidlem v systému. **Na solu neměřeno**
a výrobci učí opak (OpenAI Model Spec: system/developer zpráva má vyšší autoritu než user; Anthropic: stálá pravidla do systému,
krátká připomínka na konec) — rozhodovat mohla poloha a konkrétnost, ne role. **Změřeno na solu 2026-10-16** (RUNAR_EVAL_LOG 2026-10-16 (1)):
jednoduché pravidlo v systému dodrženo 5/5 = v user promptu 5/5, bez pravidla 0/5 — sol systém NEignoruje (EN, n = 5, pravidlo bez konfliktu;
pravidlo proti protichůdnému pokynu v user promptu neměřeno). Do 2026-10-16 tu stálo „user prompt model POSLECHNE, system prompt IGNORUJE“. Reader i shrine = `buildSysPrompt`.

### Spread systém
Kredity = **per typ čtení**, NE počet run. Počty run i ceny = `SPREAD_COSTS` / `SPREAD_CONFIG`
(config = zdroj pravdy, **tady se neopisují**). Předplatné počítá tytéž jednotky. Founding = Norns.
Které spready existují, vlastní `SPREAD_COSTS` / `SPREAD_CONFIG` — **tady se to neopisuje**.
Jediná výjimka je The Gathering: starý modul `runar-gathering.js` odstraněn 2026-09-28 (v aplikaci <!-- doc-links:ok 2026-09-28 soubor záměrně smazán, odkaz je historie -->
neměl vstup, `RUNAR_DECISIONS.md` 2026-09-28 (1)); nová podoba čeká na `detectPatterns` → `RUNAR_BACKLOG.md`.
<!-- 2026-08-18: tady stál výčet pěti spreadů + „= ✅ produkce", tedy STAV, který §20.4 zakazuje
     a který navíc říkal totéž co tehdejší řádka o modulu Gatheringu o 326 řádek výš. Duplikát uvnitř
     jednoho souboru; pět spreadů je v configu, takže se dá odkázat místo opisovat. -->
**Gating:** blokuje se jen **Visitor** (nepřihlášený) — živé čtení ani hlas nemá, proxy ho odmítne (401, DECISIONS 2026-08-02);
má jen statickou kolekci run a životní runu (výpočet). Do 2026-10-09 tu stálo „Visitor má Single 1×“ — neplatí od 2026-08-02;
po tahu runy mu appka ukáže výzvu k registraci a proxy nevolá (od 2026-10-10, DECISIONS 2026-10-10 (1)). Každý přihlášený dosáhne
na všechno; Rune Seeker platí kredity, předplatitelé to berou z měsíčních jednotek.
⭐ **Yggdrasil = KDYKOLIV, KDOKOLIV přihlášený. Žádná brána na datum.** Zimní slunovrat = větší
**síla ve stromě**, ne podmínka přístupu (rituální čtení; bude jich víc). KUKY 2026-07-18, po páté
opravě téhož — detail `RUNAR_DECISIONS.md`. Kdo sem napíše „Dec 14–28" jako podmínku, dělá to znovu.  <!-- check-docs:ok 2026-07-19 legacy: vzniklo před pravidlem, důvod nedoplněn -->

## Tree of Life — stav
Stav vlastní `RUNAR_TREE.md` (duše · zóny · stavba · co je a co není postavené) a `git log`.
**Tady se neopisuje** — §20.4. Do 2026-08-18 tu stály čtyři řádky stavu, které týž fakt držely
potřetí (vedle `RUNAR_TREE.md:222` a `RUNAR_BACKLOG.md`) a mezitím zastaraly: psalo se
„admin-only beta / gating na `isAdmin()`", zatímco `renderLivingTree()` pouští i testery
(`isAdmin(...) || isTester`). Nalezl CODE-tune; opravila si to CODE-tree ve své sekci. (To je historie — kdo strom vidí dnes, vlastní
`renderLivingTree` v `runar-tree.js`; od 2026-10-11 zase jen admin, KUKY.)
⚠️ **Past pro lane `[tune]`:** strom se krmí regexem přes text čtení (glyfy 0x16A0–0x16FF
z `rune_glyph + short_text`). Změníš formát skládaného textu → CODE-tree tiše přijde o větve.
Hlídá smoke ⑬ (`verify_tree_signals.js`), ale tahle věta je důvod, proč o tom vůbec víš.
Kanonický vstupní bod = `RUNAR_TREE.md`. `RUNAR_TREE_LAB.md` = historie (docs/archive/tree/).

## Word Corrections
Živá data: `python show_corrections.py` · nová korekce do DB přes shrine (ověří `is-corr-qa.py`, §2); známá chyba ve zdroji → `BAD_PATTERNS` (§2 bod 1).

## Kde hledat co
**Vlastník = `memory/MEMORY.md`, sekce „Rozcestník".** Sem se nekopíruje.
Do 2026-08-17 tu stál druhý rozcestník — a rozešel se: MEMORY.md mezitím dostal sloupec
„druh pravdy" (🔒 externě ukotveno · 📜 kánon · 🔄 rozhodnuto · 🏛 architektonické), který tady
nikdy nebyl. Dvě mapy téhož = přesně to, co §20 zakazuje.
**Doc-owner pravidla (2026-07-05):**
- **Čísla = jen v configu / builderech** (SPREAD_COSTS, TIERS, character.js). Docs je NEopakují — odkazují na zdroj (délky→character.js, ceny/kredity→config).
- **1 téma = 1 vlastník doc.** Žádné nové samostatné docs — když téma patří jinam, jinde jen odkaz.
- **Délka doku ~200 řádků** (250 OK, když to fakt pomáhá). Nad = rozdělit nebo přesunout detail.
  ⚠️ **`CLAUDE.md` je z toho limitu VYŇATÝ** (KUKY 2026-08-17, po měření): samotná pravidla
  §1+ **přesahují 200 řádků** (do 2026-10-11 tu stálo „§1–§28“ — pravidla mezitím přibyla, pevné číslo by zase ujelo) a jsou důvod, proč ten soubor existuje — pod 200 se nedostane, aniž
  by přišel o to, co vlastní. Platí pro něj jen ten přísnější test o řádek výš: *způsobí jeho
  chybění chybu?* Pokud ne → smazat.
  ⚠️ **Přesný počet řádků tu schválně NESTOJÍ.** Do 2026-08-18 tu bylo „248 řádků" a za jediný
  den to ujelo na 245 — číslo, které se mění s každou úpravou pravidel, je záruka dalšího driftu.
  Ověřeno v oficiálních docs: „target under 200 lines per CLAUDE.md file" je **cíl**, ne strop,
  a CLAUDE.md se načítá **celý bez ohledu na délku** (tvrdý limit 200 ř./25 KB má jen `MEMORY.md`). Vlastníkem tohohle pravidla je tenhle doc; `working-style.md`
  na něj odkazuje a neopisuje ho.
