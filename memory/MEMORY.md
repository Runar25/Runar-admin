# Claude Memory Index
# Zkukula (Kuky) — Agndofa / Rúnar project
# Last updated: 2026-07-04

## Session Start Protocol
Na začátku každé session PŘEČÍST V TOMTO POŘADÍ:
1. Tento soubor (MEMORY.md)
2. [working-style.md](working-style.md) — workflow pravidla včetně Explore→Plan→Implement
3. Nejnovější snapshot — viz Index snapshots níže (poslední v seznamu = nejnovější)
4. Repo dokumenty: CLAUDE.md + RUNAR_DESIGN.md + RUNAR_PRICING.md + RUNAR_DECISIONS.md (append-only log rozhodnutí, §16)
5. Cílový zdrojový soubor dle aktuálního úkolu

Po přečtení potvrdit: "Mám kontext z [datum snapshotu] — jsem připraven."

⚠️ NIKDY nezačít implementovat bez toho, aby uživatel schválil plán.

Klíčové soubory pro Read (lokální):
- `C:\Users\zkuku\Downloads\Runar-admin\CLAUDE.md` — technická pravidla (včetně §10)
- `C:\Users\zkuku\Downloads\Runar-admin\RUNAR_DESIGN.md` — design + mytologie
- `C:\Users\zkuku\Downloads\Runar-admin\RUNAR_PRICING.md` — business model
- `C:\Users\zkuku\Downloads\Runar-admin\v2\runar-config.js` — TIERS, TIER_LIMITS, VOCAB, SPREAD_CONFIG
- `C:\Users\zkuku\Downloads\Runar-admin\v2\runar-translations.js` — UI_TEXT, t(), tp(), vn(), vl()
- `C:\Users\zkuku\Downloads\Runar-admin\v2\runar-character.js` — prompty, IS/EN buildery

## Aktuální stav projektu (2026-06-09)

### SW verze: v133
### Poslední commit: 241c58a

### Klíčová rozhodnutí (platná)
- RS: 1 free cast při registraci, žádný weekly drip, ŽÁDNÝ měsíční reset (model B, implementováno 2026-06-12). Jediný signál = DB `free_balance` (default 1). 1 free MÁ hlas. Pak vše za rune readings (kredity).
- RS kreditní škála (2026-06-14): **kredity = PER TYP ČTENÍ** (NE počet run): Single 1 · Norns 2 · Kříž 3 · Horseshoe 4 · Yggdrasil 5 · Life Rune 3 · Founding(=Norns) 2. Odvozeno z nákladových poměrů → jednotná marže ~98 %/kredit. Zdroj: SPREAD_COSTS (+ SPREAD_CONFIG zrcadlo). Předtím 1 rune=1 credit (1/3/5/7/9). Gating blokuje jen Visitor.
- Předplatné sjednoceno na STEJNÉ jednotky čtení (Yggdrasil=5 z limitu, ne 9). Worst-case beze změny (single=358 zn=strop). Enforcement limitu v proxy = stále TODO.
- Rune Walker (Standard): 50 castů/měsíc | Rune Keeper (Premium): 75 castů/měsíc
- Yggdrasil: Dec 14–28 pro VŠECHNY přihlášené (RS za kredity, Standard/Premium z limitu)
- Visitor = jediný tier bez spreadů (jen Single 1×)
- **Tier identita (2026-07-05, nahrazuje Walker/Keeper — Cowork+KUKY)**: VŠICHNI registrovaní = **Rune Seeker** (identita navždy, žádný rank/vrchol). standard/premium = NE hodnosti, jen víc čtení/bohatší features (access/value). **Rune Walker / Rune Keeper labely = RETIRED**, nová jména standard/premium TBD (Cowork `TIER-NAMING-brief.md`) → **NEPŘEJMENOVÁVAT** dokud nedodají. **Keeper = jen Rúnar** (průvodce), žádný tier. Óðin's Path = budoucí režim/obřad (NE vrchol). Zdroj labelů = TIERS §8, ALE reálně **scattered ~10 míst** (config panel_props/life_rune, help.html tabulka+próza, auth stub) → rename ≠ 1 místo. DB hodnoty (free_trial/rune_seeker/standard/premium) beze změny. Detail: RUNAR_DECISIONS.md 2026-07-05.
- **Vocabulary**: credit→rune reading (dříve rune stone), reading→cast, karta→Rune Reading Card
- Life Rune pro RS: 3 rune stones (proxy správně deductuje 3 — credit_cost fix hotov)
- **Trojice ODSTRANĚNA** — nahrazena Norns jako zakládací rituál
- **Norns = zakládací rituál**: jediná session, 3 kořeny najednou (Urðr/Verðandi/Skuld)
- **Zakládací rituál cena**: = Norns = **2 kredity** (od 2026-06-14, bylo 3); Standard/Premium 2 z měsíčního limitu — NIKDY hardcoded "zdarma"
- Gathering: area='gathering' marker, 3 rune stones flat, všechny tiery
- Stará Gathering logika (runar-gathering.js) = NAHRADIT (čeká na tree_state DB)
- Fyzická cesta: Visitor 1 + Rune Card 1 + RS 1 = 3 zdarma celkem
- Správná jména run: Perth (ne Perthro), Berkana (ne Berkano), Othila (ne Othala)
- **Voice profiles**: ACTIVE_VOICE_PROFILE='focused' (produkce). Revert: změnit na 'lyrical'
- **Spread journal**: saveSpreadReading() — area='spread', všechny multi-rune spready ukládají jako Gathering

### Architektura §10 — NULA hardcoded strings
Každý user-visible string přes helper. Přidání jazyka = jen UI_TEXT + VOCAB blok.
```javascript
t('key')             // statický z UI_TEXT
tp('key', {vars})    // šablona: 'You have {n} {casts}'
vn('cast', 3, lang)  // plural z VOCAB: '3 casts' / '3 spár'
vl('card', lang)     // label: 'Rune Card' / 'Rúnakort'
```
VOCAB: unit(rune reading/spá), cast(cast/spá), card(Rune Reading Card/Rúnakort)

### Implementováno ✅
- Single rune čtení — produkce
- **Norns** — zakládací rituál + 3-rune spread (buildNornsPromptIS/EN)
- Cross / Kříž — prompt + reader (buildKrizPromptIS/EN), Standard+
- Horseshoe (7 runes) — buildHorseshoePromptIS/EN, Standard+
- Yggdrasil (9 worlds) — buildYggdrasilPromptIS/EN, všichni přihlášení Dec 14–28
- Life Rune výpočet + generování + zobrazení
- RS Tree tab — Life Rune za 3 rune stones + OR upgrade + free cast line
- IS 3-vrstvý systém (všechna generování)
- Shrine admin, Journal, Tree tab, Auth, Redeem
- Random rune draw, IS quality tooling
- PATTERN_WINDOW, HEAVY_RUNES, TRANSFORMATION_PAIRS, AETTY v config
- MOODS, INTENTIONS, AREAS.norns, SEEKS.norns v runar-runes.js
- Spread UI: btn-speak 3 stavy, cross layout
- Tree PoC v2 — organické SVG větve, teardrop listy
- Tier UI jména: Rune Walker / Rune Keeper (runar-config.js)
- Vocabulary architektura: VOCAB + vn/vl/tp helpery
- Všechny hardcoded strings přesunuty do UI_TEXT via t()/tp()
- journalLimit() z TIER_LIMITS.rune_seeker.journal_entries
- smoke.py — 5-kontrol smoke test (syntax + §10 + IS + překlady + SW)
- check-translations.py — EN vs IS klíče (175/175)
- git pre-commit hook — auto-bump sw.js při JS/CSS commit
- displayName() — fallback 'you'/'þú', NIKDY email.split('@')[0] (§12)
- Reading tab: MY READING / FOR SOMEONE — _readingMode global
- Unified reading style — žádné ||| sekce, 1 blok 5-7 vět
- Mood + Intention pills — reader.html + app.js + reading.js
- Norns axis helpers — `_moodContext()` + `_intentionContext()` v runar-character.js
- **Voice profiles** (2026-06-07) — ACTIVE_VOICE_PROFILE + VOICE_PROFILES v config, _getVoiceProfile helper, shrine dropdown, focused=produkce, lyrical=revert
- **Pill toggle** (2026-06-07) — druhý klik odznačí, buildPillGroup() v app.js
- **Spread journal** (2026-06-07) — saveSpreadReading(), area='spread', journal karta isSpread, filter Spreads option
- **Trojice ODSTRANĚNA** (2026-06-07) — bylo: 3-rune Past/Present/Future. Nahrazena Norns jako zakládací rituál
- **s3-norns-lbl** (2026-06-07) — bug fix: Norns label přejmenován z s3-trojice-lbl
- **Yggdrasil gate** (2026-06-07) — Premium only → všichni přihlášení (RS za kredity)
- **BEFORE WE BEGIN UI** (2026-06-07) — heading: MY READING+known = "BEFORE WE BEGIN, {NAME}"; FOR SOMEONE = "BEFORE WE BEGIN"; reader_note sjednocena; THEIR NAME→NAME; SIGNED_IN toast odstraněn; updateUIText() neřídí heading/note (pouze _updateReadingForm)
- **Gathering z journalu** (2026-06-07) — whispers-section odstraněna z HTML, karty a filter z journal.js, updateWhispersUI() z renderJournal; runar-gathering.js nedotčen (nová role v tree)
- **credit_cost fix** (2026-06-07) — callProxy posílá spread_cost; Single=1, Norns=3, Kříž=5, Horseshoe=7, Yggdrasil=9, Life Rune=3; backend to měl od začátku
- **V2 lab aktualizace** (2026-06-08) — Mood selector + Reading intention + Voice Scale → ✅ promoted to V1; Norns axis přidán jako 🧪; shrine reader Trojice→Norns zatím NE
- **Name field optional** (2026-06-08) — runar-reading.js + shrine startReading(): prázdné jméno → fallback 'you'/'þú' (§12); shrine měla vlastní startReading() override
- **Protokol — co zapisovat kam** (2026-06-08) — přidán do working-style.md; typ změny → soubory tabulka
- **§14 updateUIText()** (2026-06-08) — přidán do CLAUDE.md: updateUIText() = POUZE statické překlady, dynamický obsah do _updateReadingForm()/_updateDobLabel()
- **Prompt caching** (2026-06-09) — claude-proxy/index.ts: system string → array s cache_control ephemeral na base system promptu (~960 tokenů EN); Vrstvy A/B/C (dynamicContext) nekešovány; deployed
- **File saving rules** (2026-06-09) — přidány do working-style.md: scripts/ struktura, naming conventions, patch→archive po použití
- **Yggdrasil gate fix** (2026-06-09) — blokace mimo Dec 14–28 odstraněna, informativní toast, čtení projde (SW v74)
- **Dead code cleanup** (2026-06-09) — spread_3, whispers-title, wcap wire blok, wcapToggle/Mute/Seek/_wcapFmt smazány (SW v75)
- **CLAUDE.md trim** (2026-06-09) — 217→189 řádků, §11/§12 condensed, §13 collapsed
- **Native app strategie** (2026-06-09) — Island 70% iOS, App Store discovery = primární driver, push přes email, Capacitor cesta (RUNAR_PRICING.md)
- **Audit fixes** (2026-06-12) — voice_btn_done i18n, Berkano→Berkana, card name z VOCAB (vlp helper), tier jména z TIERS, redeem-link lokalizace, gift_card_btn kanonický, §15 pravidlo, free_spreads smazán, IS akcenty (Yggdrasil+AETTY)
- **RS free model B** (2026-06-12) — userFreeBalance global z DB free_balance; měsíční localStorage systém + pondělní drip ODSTRANĚNY; backend chyba weekly_limit→no_credits; deployed. TODO cleanup: mrtvé helpery (getFreeMonthCount, nextReset*, reset modal, reset_body/readings_renewed)
- **Délky čtení + weaving** (2026-06-12; ⚠️ konkrétní čísla SUPERSEDED — zdroj pravdy = buildery v character.js, docs čísla neopakují) — format default generický. Multi-rune: všechny runy prostoupí text kvalitou, runy se NEjmenují (BUG #2 fix — Horseshoe/Yggdrasil zmiňovaly jen 1). 8 builderů EN+IS.
- **stones → rune reading** (2026-06-12) — VOCAB.unit 'rune stone'→'rune reading'/'spá' (propíše vn('unit')); hardcoded literály + IS rs_credits_desc + panely. Poetické "stones" (Rúnarův hlas) zůstávají.
- **BUG #1 accepted** (2026-06-12) — delete account + re-register → 1 free znovu (free_balance default 1). PŘIJATO bez fixu: prevence vyžaduje persistent tracking přežívající smazání (email-hash, obejitelné novým emailem); hodnota zneužití = 1 čtení.
- **RS Life Rune cost** = 3 rune readings (SPREAD_COSTS.life_rune.credits)
- **No-duplicate runy** (2026-06-12) — multi-rune spread: vybraná runa = grid button disabled (_syncGridUsed z _updateSpreadXSlots), data-rune na tlačítkách, drawRandomRune losuje jen z !disabled. CSS .rb:disabled. BUG: random picker vybíral i už vybrané.
- **Model-B copy** (2026-06-12) — rs_banner_counter/desc, rs_credits_desc, rs_exhausted_one/many (EN+IS) přepsány — už neříkají "monthly/this month" (model B = 1 free při registraci).
- **Dead code model B** (2026-06-12) — smazán měsíční/reset cluster (getFreeMonthCount, freeMonthKey, incFreeMonthCount, nextReset*, resetNotif*, showResetModal, closeResetModal) + reset-notif-modal HTML + readings_renewed/reset_body klíče.
- **DRY spread helper** (2026-06-12) — 4 generate fce → _generateSpreadReading(o) + 4 wrappery (~315→~95 ř.); chování beze změny.
- **Mobilní layout** (2026-06-12) — rune grid auto-fill minmax(64px) = 4 runy/řádek na ~375px (z 3), SVG clamp(38,11vw,72). Spread tlačítka = **3+2 grid** (display:grid 6 sloupců; horní 3 span 2, spodní 2 span 3 = symetrické, spodní dvě stejně široké jako horní tři); ŽÁDNÝ scroll, vše vidět. (Iterace: nejdřív scroll <480, pak scroll všude, finál 3+2 grid dle KUKY.) Ověřeno 544px+375px.
- **atab-tree i18n** (2026-06-12) — záložka TREE OF LIFE se nepřekládala (stuck EN), přidáno do updateUIText. IS='TRÉ LÍFSINS'. Pozn.: IS→EN přepínání jinak čisté (proskenováno, 0 stuck) — uživatelův iOS bug byl stará SW cache.
- **Single délka** (2026-06-12) — Var A: 3 věty, 38-45 slov, ~25s; vynecháno vplétání životní runy/oblasti/hledání (zůstávají kontext), krátká otázka. TTS 48s→~25s.
- **Jméno ne na začátku** (2026-06-12) — "Speak directly to {name}." → "Address {name} once, never as the opening word." (single+multi EN+IS). Bylo: vše začínalo "Anna,".
- **⭐ Sezónní obraznost** (2026-06-12, f677de1+f1f360d) — `_seasonalImagery(lang)` injektuje sezónní paletu per-čtení (jako angle) do single+4 multi-rune. VHLED: per-čtení user prompt model POSLECHNE, system prompt IGNORUJE. Isa v létě = "frozen ground beneath endless light" ne sníh. 6 období dle měsíce, IS schválil KUKY.
- **V2 redundantní** (2026-06-12) — buildSysPromptV2 (kontext. inteligence) se v testech neprojevila → do produkce NEDÁVAT. Lean reader + sezónní injekce = líp/levněji. V2 nechán pro lab/Gathering. Srovnávací utils v scripts/utils/ (volají proxy přes publishable key).
- **BUDOUCÍ: Tree paměť** (2026-06-12) — příští verze = Rúnar poznává uživatele každým čtením (tree_state/pattern detection). NUTNÝ REDESIGN (hodně se změnilo). Tip: Vrstvu A (tree paměť) možná přesunout z system promptu do per-čtení injekce (sezóna ukázala že to model víc poslechne). Viz snapshot 2026-06-12-seasonal.
- **⭐ Sezónní cyklus + shuffle-bag** (2026-06-14, f55ace1) — DIAGNÓZA: úzká paleta + „binding/MUST" → midnight sun v 10/10 čtení (často úvodní věta). FIX: `_seasonalImagery(lang, drawn)` + `SEASON_POOLS` = 6 sezón × bright/cold pool ({id,en,is}); localStorage shuffle-bag (každý obraz 1× než reset, no-repeat, per zařízení); cold-steering (Isa/Hagalaz/Nauthiz/Þurisaz → cold set → studená ale v sezóně, ne sníh); „binding"→„if one arises" (volitelný). Ověřeno compare_seasonal.js: midnight sun 1/10, Isa ×8 vždy studené/bez sněhu. Test má localStorage shim. Single předává drawn, multi-rune = bright.
- **IS gramatika — rod/shoda** (2026-06-14) — KUKY ověřil 3 opravy (frost=hk→„hart frost"/„fyrsta harða frostið"; súld=kvk→„grá súld"; frostbiti=kk zůstává „harður"). LEKCE: chyby byly špatný ROD podstatného, ne skloňování. Pravidlo: urči rod (kk/kvk/hk) PRVNÍ, pak přídavné; určitý člen -ið spouští veik. Slovník rodu přírodních slov → working-style.md (§ Islandská gramatika). Trvalá paměť: is-grammar-adjective-gender.md.
- **In-app reporter + bug_reports** (2026-06-14, e90419b+9d2b07a, SW v104) — tester hlášení (spec runar_reporter_spec_CODE.md). DB `sql/2026-06-14_bug_reports.sql` (KUKY spustí v Supabase; anon jen INSERT). `runar-reporter.js` = samostatný modul (plovoucí ⚑ tlačítko + sheet panel, offline fronta localStorage, dedupe upsert dle client_uuid, flush init/online/po odeslání), texty přes t() (EN+IS, 22 klíčů). Načten v reader.html po app.js. **Pro COWORK triáž — sloupce navíc nad spec:** `flagged_source` (selection/screen = přesnost), `i18n_key` (překladový klíč když [data-i18n], v1 většinou null → fáze 2 doplní), `screen_context` (tab + #kontejner) → auto-routing. Reporter = MAIN doména. **Fáze 2** (678c0b2): data-i18n na 6 prvcích pre-reading formuláře (name/area/seek/intention/q/begin) → i18n_key auto-routing. **Fix 403** (e51445d, SW v105): `.upsert()` (on_conflict) padá na RLS 42501, plain `.insert()` projde — reporter používá insert + dedupe přes UNIQUE client_uuid (23505 = už odesláno → z fronty). RLS policy `to public with check(true)` + grant. Ověřeno e2e (Sent, fronta=0) + dedupe (201→23505). ⚠️ KUKY smazat 3 test řádky v bug_reports (message obsahuje „smaz"/„diag"/„self-test"). **GOTCHA k zapamatování:** Supabase anon `.upsert()` ≠ `.insert()` na RLS — pro insert-only tabulky používej plain insert + UNIQUE constraint na dedupe, ne upsert.
- **⭐ Segmentace Fáze A — HOTOVO (single + všechny spready)** (2026-06-17, SW v109; spec RUNAR_SEGMENTATION_SPEC.md) — všechny buildery (single/Norns/Kříž/Horseshoe/Yggdrasil, EN+IS) → JSON `[{rune,text,deeper_meaning}]`; reading.js `_parseSegments` složí text (display+hlas BEZE ZMĚNY, čte viditelný innerText), `deeper` drží JEN v paměti (`_lastDeeper`, neukládá/nezobrazuje = neviditelné, revertable). single 008d520 · Norns e8be1f3 (per-Norn beat=past/present/future oblouk) · Kříž/Horseshoe/Yggdrasil aa6aacb. **Robustní parser** (aa6aacb): extrahuje `[…]` od prvního `[` po poslední `]` (přežije ```json fences+okolní text) + připojí prózu ZA polem (externalizovaná otázka) → NIKDY neukáže raw JSON. Ověřeno live: flow DRŽÍ napříč (ne seznam), tis (few-shot) u Eihwaz. Pozn. Fáze B: Kříž občas +1 segment (otázka jako objekt) → zarovnat na runy dle rune name. DALŠÍ: **Fáze B — tap UI / spread-map = Premium #1** (persistovat deeper, tap→zvýraznit segment+deeper+pozice).
- **Sezónní/register gold few-shoty** (2026-06-16, f37cdd7, SW v106) — do `VOICE_PROFILES.focused` (EN+IS, system prompt = CACHED = ~0 navíc/čtení). 3 části: register gold (věta o tisu = mytologie + 1 konkrétní obraz + lidský bod), esence-zůstává-sezóna-se-mění (studená runa v létě = severák, ne sníh), negativní (abstraktní věty, mimosezónní počasí, přeplácané obrazy). Handoff princip „příklady > pravidla". OVĚŘENO: produkční buildSysPrompt embeduje _getVoiceProfile (ACTIVE_VOICE_PROFILE='focused') → jde do produkce. 10 live čtení: konkrétní landings, Isa = slydda od moře (v sezóně), Mannaz ukotvená. IS draft (tis = „Ýviðurinn") — KUKY potvrdí. Reading-line další: segmentovaný výstup, prompt fixy (Mannaz/měkký Seeking/přístupnost/belonging).
- **Provozní náklady + daně + break-even** (2026-06-16, d60d082) — do RUNAR_PRICING.md sekce „Operating costs, taxes & break-even (Agndofa ehf.)". Fixní ~$202/měs (Claude dev $100, Shopify $39, Supabase $25, ElevenLabs $22, Apple/Hetzner/doména/Google), variabilní ~$1.81/už (API+hlas $0.85 + Shopify platby ~2.9%). Daně IS: VSK 24% (osvobození pod 2M obratu ≈47 už), zaměstnavatelské odvody ~20% (tryggingagjald 6.35 + lífeyrissjóður mótframlag 11.5 + sjúkrasjóður/orlofssjóður/starfsmennta), osobní daň+odvody ~33%, firemní daň 20% / dividenda 22%. Break-even ~8 už; **500k ISK čistého/měs ≈ 353 platících** (odvody ~zdvojnásobí počet vs hrubý model). Claude $100 = dočasný dev náklad → po launchi break-even ~5. Odhady, ověřit s účetním; zdroje (ASÍ, PwC, Skatturinn) v doc. Postaveno jako interaktivní kalkulačka (widget).
- **Mood field odstraněn** (2026-06-14, 38f9713, SW v103) — „HOW ARE YOU FEELING?" pryč z produkčního readeru (rozhodnuto 2026-06-12 = dekorativní). reader.html pill group + app.js mood-lbl/buildPillGroup/mood větve + reading.js user objekt/reset + mood_lbl EN/IS. character.js `_moodContext` DORMANTNÍ (no-op, Norns-osa). intention ZŮSTÁVÁ. Překlady 175→174.
- **CLAUDE.md trim + koordinace 2 session** (2026-06-14, 95424de) — CLAUDE.md 356→234 ř. Tree-lab historie (144 ř.) přesunuta 1:1 do **RUNAR_TREE_LAB.md** (doménový doc TREE session); CLAUDE.md = 5ř ukazatel. Přidán **koordinační protokol**: domény (MAIN=reading/pricing/config, TREE=vizuální engine), hranice editace, git/commit konvence ([tree] vs [reading]/[pricing]), řešení konfliktů. Pravidlo: historie do doménových doc/snapshotů, ne CLAUDE.md.
- **⭐ Pricing audit + reprice 1/2/3/4/5** (2026-06-14, cd496f3+abefbda, SW v102) — ZMĚNA DÉLEK → přepočet nákladů. Změřeno (measure_reading_costs.js): single 358 zn (bylo doc 430), Norns/Kríž zkráceny (8-9→5-6 / 9-10→6-7 setn = ~770/~1030 zn). Náklad/čtení IS: single $0.038, Norns $0.081, Kríž $0.108, Horseshoe $0.143, Yggdrasil $0.174, Life Rune $0.006 (text, bez hlasu). Kreditní škála 1/2/3/4/5 odvozena z nákladových poměrů (jednotná marže ~98 %). SPREAD_COSTS + SPREAD_CONFIG updated. Marže Standard/Premium ~93 % IS / 96 % EN (vyvážené, beze změny cen). EL prahy +~20 % (Creator ~56 už.). Akvizice $0.038/$0.020. RUNAR_PRICING.md kompletně přepočítán + RS Model B + founding 5→2 + předplatné=jednotky. Worst-case = single (358 zn/jednotka = strop). Měřící skript v scripts/utils/.
- **Sezónní pooly +32 + regression guards** (2026-06-14, ed0509d, SW v100) — každý pool +2–4 obrazy (delší cyklus sáčku; červen bright 7→10 = 10/10 unikátních). Nové IS gender-ověřené (lekce aplikována). check-is.py +4 regression patterny: „harður frost " (mezera chrání „harður frostbiti"=kk), „harður næturfrost", „grátt súld", „fyrsti harði frostið".
- **⭐ Doc-sync protokol: RUNAR_DECISIONS.md + §16** (2026-07-03/04) — nový append-only log `RUNAR_DECISIONS.md` (repo, NE v Cowork sync setu): rozhodnutí neumírají v chatu, Code je vidí. 8 zpětně doplněných architektonických rozhodnutí + workflow záznamy. **§16 (CLAUDE.md) — two-output rule**: task měnící chování/rozhodnutí (NE refactor/CSS) = Output A (práce) + Output B = 1 záznam do RUNAR_DECISIONS.md + oprava dotčené sekce docu ve stejném turnu. **Reconciliation** (owner-triggered): fráze `Reconciliation: <doc|modul>` → Code vypíše divergence list (doc vs kód) a STOP, owner rozhoduje. Code zodpověděl 5 otázek (RUNAR_DOC_SYNC_CODE.md → docs/archive/): log = single file + volitelný `Scope:` tag · reality-note = free text · `runar-eval.yaml` NESTAVĚN · shorthand-check NEPŘIDÁN (chybí blocklist; lore Yggdrasil/Norns/Gammur NENÍ shorthand). `smoke.py` = NEblokující §16 reminder (`git diff --cached`, neovlivňuje exit code). **Cowork sync = POUZE** MEMORY.md, working-style.md, runar-project.md, tree-of-life.md, runar-patterns.md, snapshots/ — CLAUDE.md se do Cowork NEKOPÍRUJE. Reverzibilita: easy (disciplína, ne kód).

### Připraveno k implementaci (chybí logika/DB)
- detectPatterns(readings) — čeká na Tree implementaci
- tree_state + tree_readings DB tabulky — neexistují
- Gathering nová logika — data připravena, runar-gathering.js NAHRADIT
- Vizuální vrstva stromu (shimmer, glow, kořeny)
- Zakládací rituál UI — Norns jako první session stromu (logika připravena, UI chybí)
- **Norns axis — produkce**: `_moodContext`/`_intentionContext` jsou v runar-character.js (shared); produkční reading.js je nepoužívá — zapojit do buildReadingPromptEN/IS

### 🔴 Kritické (blokuje prodej)
1. Resend SMTP — magic link emaily z agndofa.is
2. Shopify webhook — automatický upgrade po nákupu
3. DPA Supabase — čeká na e-mail

### 🟡 Důležité
4. Rune Walker tier — způsob nákupu ("COMING SOON") + reálný checkout
5. Privacy Policy odkaz na agndofa.is

### 🟡 Technické
7. ~~claude-proxy: credit_cost~~ — HOTOVO (2026-06-07)
8. runar-help.html inline JS — zbývající hardcoded strings (help content sekce)

### 🟢 Střední priorita
- SSE streaming
- Monthly limit 50/75 v claude-proxy
- Weekly drip odstranit z claude-proxy
- Shrine audit

## Index souborů

- [working-style.md](working-style.md) — workflow pravidla, Python skripty, IS primární jazyk, verifikace
- [runar-project.md](runar-project.md) — stack, soubory, tier tabulka, DB schéma, edge functions
- [tree-of-life.md](tree-of-life.md) — Tree design (branch objekt, Gathering, AETTY, vizuál, Yggdrasil)
- [runar-patterns.md](runar-patterns.md) — Pattern detection design
- **RUNAR_DECISIONS.md** (repo root `Downloads\Runar-admin\`) — append-only log architektonických rozhodnutí (§16 two-output rule)
- **RUNAR_SIGIL_STUDIO.md** (repo root) — standalone bind-rune (bandrún) maker. v0 MVP HOTOVO+OVĚŘENO 2026-07-06 (`build_sigil_lab.py` → `v2/sigil-lab/`). Spine-collapse engine, 6 pastí+fixů, 3 třídy run, engrave-first. NENÍ v produkci.

## Tree session paměť (Code)
Frontmatter-paměť TREE session (Claude Code). Od 2026-07-04 sdílená s Cowork — obě platform složky jsou junction na `repo/memory/` (§17, jediný zdroj).

- [Rúnar Tree of Life engine — lab stav a rozhodnutí](runar-tree-engine-lab.md) — liana Canvas 2D engine, stříbrná kůra + element tint, mock data, čeká na schválení
- [Rúnar kmen — přírůstkové změny, ne přepisy](runar-trunk-incremental-rule.md) — schválenou verzi composeru měnit přírůstkově + snapshotovat před změnou
- [Rúnar strom — živý pohyb + model založení](runar-tree-living-movement.md) — Norns=kořeny, life rune=kmen, čtení=větev; větve se hýbou (ne skáčou), mladé pružné/staré tuhnou; Founding Ritual lab
- [IS gramatika — rod přídavného](is-grammar-adjective-gender.md) — nejdřív urči rod podstatného (frost=hk, súld=kvk), pak skloňuj; detail v working-style.md

## Index snapshots (nejnovější = poslední)

- _Starší snapshoty (2026-05-30 → 2026-06-09): viz složka `snapshots/` — tree/refactor/vocab/spread/audit historie._
- [snapshots/2026-06-12-audit-modelB-terminology-ux.md](snapshots/2026-06-12-audit-modelB-terminology-ux.md)
- [snapshots/2026-06-12-seasonal-imagery-reading-tuning.md](snapshots/2026-06-12-seasonal-imagery-reading-tuning.md)
- [snapshots/2026-06-14-seasonal-cycle-bag-is-grammar.md](snapshots/2026-06-14-seasonal-cycle-bag-is-grammar.md)
- [snapshots/2026-06-14-pricing-audit-reprice.md](snapshots/2026-06-14-pricing-audit-reprice.md)
- [snapshots/2026-06-16-reporter-operating-costs-coordination.md](snapshots/2026-06-16-reporter-operating-costs-coordination.md)
- [snapshots/2026-07-05-s18-drift-cleanup.md](snapshots/2026-07-05-s18-drift-cleanup.md) ← NEJNOVĚJŠÍ (limits messaging unified, dead model-A branches out, 8 §18 fixes, SW v133)
