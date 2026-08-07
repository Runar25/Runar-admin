# RUNAR_EVAL_LOG — deník pákových změn hlasu (prompt · pooly · pravidla)

**Jedno místo pro KAŽDOU změnu, která mění, jak Rúnar mluví.** Prompt, obraznost (pooly),
gramatická pravidla, voice profil, konce, openery. Cíl: po dalších čteních jde **změřit,
jestli změna zabrala** — ne hádat. Žádný drift: co se sáhlo do hlasu, stojí TADY, ne
roztroušené po git logu a cizích sandboxech. (KUKY 2026-08-02.)

## Kontrolní mapa hlasu — co lze měnit, co ne, nad čím uvažovat (§20: jen ukazatele)
**🗺 Vizuální mapa (snapshot):** https://claude.ai/code/artifact/e32dbd2b-5277-414a-a187-8277efe99f69 — celý oblouk vrstev (system prompt · reading stack · korekce → opus-4-8 → JSON), „kde ladit nuanci" a „co je mrtvé". Pravda = kód (character.js/config/proxy); po změnách přepublikovat na stejné URL. Detail → memory `prompt-map-artifact`.
⚠️ **Nález k ověření v DB:** reader načítá charakter z `runar_character` (active=true, app.js:1380) i když je editor mrtvý → starý řádek by přebil file `DEF_CHAR`. Ověřit `select id,active from public.runar_character where active=true;`.

⭐ **Rozhodující fakt:** model POSLECHNE **user** prompt, **system** prompt z velké části IGNORUJE.
→ Reálné páky jsou v USER promptu. Úpravy system promptu (identita, zákazy, voice profil) mají
SLABÝ účinek — proto „přepiš voice profil" většinou nehne jehlou; sáhni na user-prompt pooly.

**🔄 PÁKY (tady se hlas reálně mění — každou změnu loguj níž):**
- Obraznost: `SEASON_POOLS` / `_seasonalImagery` (utils/character.js)
- Úhel otevření: `READING_ANGLES` / `_randomAngle` (utils, jen single)
- Tvar konce (dle valence): `ENDING_*` / `_endingShape` (utils)
- Jméno (umístění/vynechání): `_namePlacement` (utils)
- Reading contract (čočka/doména/registr): `_lensContext`/`_domainContext`/`_registerContext`/`_priorityContext` (character.js)
- Norns čas: `_intentionContext` (character.js)
- Gates (nevysvětluj / no cold-read): `_describeRule`/`_noColdRead` (character.js, vždy on)
- Délka/počet vět: `RP_* length` (character.js) — ⚠️ = náklad na hlas (RUNAR_PRICING.md)
- Slovní/vazbové korekce: `runar_corrections` → `getCorrPrompt` (character.js)
- Voice profil `focused`: `VOICE_PROFILES` (config) — ⚠️ system prompt → SLABÁ páka
- Model: proxy `MODELS` (dnes opus-4-8; měnit = eval + cena)

**⛔ NEMĚNIT tuningem (kánon / fakt / architektura):**
- Kdo Rúnar je · osobnost · filozofie · zákazy (`never`) = 📜 kánon → RUNAR_DESIGN.md (mění rozhodnutí o kontinuitě)
- IS gramatika = 🔒 (musí být správně, ne stylová volba) — enforcement přes korekce + is-grammar-qa
- Data run + význam pozic spreadů = 🔒/📜 (runar-runes.js / RUNAR_DESIGN.md)
- Struktura pipeline + JSON kontrakt = 🏛 architektura (CLAUDE.md „Reading systém — stav")

**❓ NAD ČÍM UVAŽOVAT:** tabulka „nadcházející" níž (v1.2/v1.3) · zda voice profil vůbec držet
v system promptu (model ho ignoruje) · dead/lab zapojit-nebo-zabít (`buildSysPromptV2`, `VARIABILITY POOLS`).

> Jak se čtení skládá (pořadí toku pipeline) → CLAUDE.md „Reading systém — stav". Proč každé změny → RUNAR_DECISIONS.md.

## Co sem NEpatří (§20 — neopisovat)
Samotný obsah bydlí v kódu; deník na něj jen odkazuje:
- prompty + gramatika + korekce → `v2/runar-character.js`
- obrazové pooly (SEASON_POOLS) + voice profil (`focused`) → `v2/runar-character.js` (pooly) · `v2/runar-config.js` (VOICE_PROFILES)
- konce/openery/úhly → `v2/runar-utils.js` (ENDING_*, READING_ANGLES)
- kohorta na měření → `readings.prompt_version` (tag dnes **v1.2**, config; ⚠️ glyf-fix se nasadil ještě pod v1.0 — tag se tehdy nebumpnul, takže jeho efekt NENÍ v eval oddělený od v1.0; „verze" ve spodních tabulkách = plánovací nálepky, ne vždy skutečný tag)

## Jak zapisovat
Jeden řádek = jedna páka. **Jedna páka na verzi** — když se sáhne na pět věcí naráz,
nepozná se, která zabrala (proto se bumpuje `RUNAR_PROMPT_VERSION`, ať nová čtení nesou tag).
- **Očekávaný efekt** napiš PŘED dávkou (predikce, ne alibi po měření).
- **Naměřený efekt** doplň po čteních (owner reálná + `gen_batch` syntetická přes probe set).
- **Verdikt**: kept / tuned / reverted.
- **Defekt (bug) ≠ páka.** Tvrdá chyba (glyf v textu, špatný tvar slova) se opravuje na nulu,
  neměří se „kolik zbylo" — jen se zapíše, že je opravená. Páka (styl, obraznost, konce) se měří.

---

## Páky — retrospektiva (co už se s hlasem dělalo; detail = `git log` [reading]/[tune])

| verze | co se změnilo | proč | naměřeno | verdikt |
|---|---|---|---|---|
| v0.4 | honest intro copy + strop délky follow-upu | eval dávka v0.4 | — (Cowork sandbox) | kept |
| v0.5 | pravidlo „Describe, don't explain" | čtení vysvětlovalo místo ukazovat | — | kept |
| v0.6 | SEEKING stance + Confirmation reframe | postoj podle „co hledáš" | — | kept |
| v0.7 | reading contract dojel do všech 4 spreadů | pokrytí | — | kept |
| v0.8 | SEASON_POOLS rebalanc voda→pevnina | moc vodních obrazů | — | kept |
| v0.9 | Clarity register: zaostři, nedoručuj odpověď | čtení dávalo hotové odpovědi | NEZMĚŘENO (nula ostrých v0.9) | kept |
| v1.0 | No-cold-read gate + follow-up gates | „already/þegar" ve 4/5 · follow-up klouzal do cold-read | NEZMĚŘENO (traffic) | kept |
| — | SEASON_POOLS 110→133 (highsummer +12, +23) | malá zásoba → monotónnost | — | kept |
| — | follow-up strop 120→140 | IS se sekala uprostřed věty | — | kept |
| — | slepý post-procesor korekcí VYPNUT (`CORRECTIONS_POSTPROCESS=false`) | neuměl pád → korekce jdou do promptu (in-context) | — | kept |
| **v1.1** (tag) | ENDING_OPEN pool 2/3→1/3 otázek (utils, IS+EN) **+** voice focused „na konci VŽDY otázka" → podmíněné (config). Řeší i kritiku-T3 (voice „otázka VŽDY" × `_endingShape` „bez otázky" rozpor). Těžiště v poolu (silná páka), profil jen přestal tlačit. | eval 2026-08-02: 34/50 (68 %) konec „Hvað?" — moc otázkových konců | konec „otázka" klesne k ~1/3 | — (příští dávka owner + `gen_batch`) | čeká na měření |
| **v1.2** (tag) | `_noColdRead` reframe (kritika-T2): gate VEDE pozitivně (leitandinn kannast við sig í myndinni) a už NEjmenuje „already/þegar" — jmenoval je 3× → sám si to slovo sázel do user-promptu. Oba zákazy (inner-claim + fate-in-world) drží; zahozeno koncové „Lýstu…" (byl to duplikát `_describeRule`). IS ověřeno is-grammar-qa (0 flagů) + is-vazba (kannast við sig · láta+þf). | eval v0.9/v1.0: „already/þegar" ve 4/5 čtení — model kopíroval slovo z gate | výskyt „already/þegar" v próze klesne | — (příští dávka) | čeká na měření |

## Páky — nadcházející (z eval 50 IS + 50 EN, 2026-08-02; ověřeno proti kódu)

| verze | co změním | proč (nález) | očekávaný efekt | naměřeno | verdikt |
|---|---|---|---|---|---|
| v1.1 | **DEFEKT: glyf (ᚠ) ven z textu čtení** — vyříznut z 16 míst / 7 produkčních builderů (single·4 spready·life-rune IS+EN), oba jazyky. `:495` lab a `:940` mrtvý param nechány (glyf se do textu nedostane). | model kopíroval glyf z promptu do prózy — 3/50 EN | glyf v próze = 0 | **prompt: 0 glyfů ve všech 7 builderech ×2 jazyky (sandbox probe)** · čtení: sledovat příští dávkou (model může glyf znát z tréninku i bez vzoru v promptu) | opraveno (zdroj vzoru pryč) |
| v1.1 | **DEFEKT: tvrdé IS tvary** (höndin, skilur…) → korekce/pravidlo | model-slip ve skloňování | konkrétní tvary zmizí | — | čeká |
| ~~v1.2(c)~~ | „na konci VŽDY otázka" → podmíněné + ENDING pool rebalance | konec „Hvað?" 68 % | ~1/3 | — | ✅ **HOTOVO = tag v1.1** (nahoře v retrospektivě) |
| v1.2(a/b) | focused voice profil: obrazy = víc domén (ne jen příroda) · vzorové příklady různé tvary | eval: 100 % obrazů příroda · 2 stejné příklady | domény pestré · příklady různé tvary | — | ⛔ **BLOKOVÁNO**: chybí Coworkův obsah (4 věty/domény, handoff „dostaneš zvlášť" nedorazil) · ⚠️ voice profil = SLABÁ páka (ř. 26) → i po dodání nízký výnos; obraznost reálně žije v `SEASON_POOLS` (v1.3, user-prompt) |
| v1.3 | **imagery cesta 3 (hybrid)**: SEASON_POOLS dostane per-runa značku „hodí se k této runě" | tentýž obraz zdobí nesouvisející runy (season-keyed, ne rune-keyed) | obraz sedí k významu runy · sezónnost zachována | — | čeká |

> Pořadí: defekty (v1.1) hned. Pak jedna páka za verzi (v1.2 focused, v1.3 imagery) — ať je
> každý posun měřitelný. Cesta 3 (v1.3) je i obsah: Coworkových 50+17 ověřených obrazů = semínko.

## Překombinovanost promptu — kritika 2026-08-06 (plán oprav, k EVALU)
⚠️ **Runar FUNGUJE — opravit, ne rozbít.** Pravidlo stejné jako výš: **1 páka/verze, bump `PROMPT_VERSION`, eval PŘED/PO, ship jen bez regrese** (§18.4/§24). Dokázáno = co se DUPLIKUJE; efekt škrtu na kvalitu = **hypotéza**, ne jistota. Detail kritiky: task `wd54cabfp` (ephemeral) · vizuální mapa: memory `prompt-map-artifact`.

**VERDIKT:** ~50-60 příkazů na ~40 slov (~15-20:1); stejné pravidlo 3-4× → ředí + staví „zeď zákazů".

**DUPLIKÁTY (říct 1×):** „jeden obraz" 4× (grammar#4 + voice profil 3×) · „no sections/labels" 3× (format+length+closing) · „describe don't explain" 2× (voice + `_describeRule`) · zakázaná slova 2× (never + grammar#3) · 2. osoba 3× · studená-runa-v-létě 2× (voice verze **MRTVÁ** — system sezóna se ignoruje).

**ROZPORY:** angle#8 „life rune first" × noqBranch „Open with drawn" × lens „runu NEjmenuj" · voice „otázka VŽDY překvapí" × `_endingShape` „bez otázky" · PURPOSE „posbírej kontext" (už je vložený → svádí k doptávání).

**NEVER→DO:** uděláno JEN v user/voice vrstvě (Confirmation reframe v0.6, voice ~90 % pozitivní, angles pozitivní); **system `never` blok zůstal negativní.** ⭐ `_noColdRead` SÁM jmenuje „already/þegar" **3×** = přesně slovo, co eval našel unikat **4/5** → negace zasadila token, v user promptu, každé čtení = **FIX #1 (má eval data). ✅ HOTOVO = tag v1.2** (reframe: pozitivní lead, slovo se už nejmenuje; oba zákazy drží; NEmergnuto s `_describeRule`).

**DÍRY (§19):** `journey/embrace/empower` BEZ output kontroly (`check-is` čte ZDROJ, ne výstup) → přidat deterministický output linter · produkce nemá pravidlo „nikdy nepřekládej jména run" (jen mrtvá V2).

**POŘADÍ (nejbezpečnější signál první, 1 páka/verze):** ✅ **T2** `_noColdRead` reframe = tag v1.2 · ✅ **ending wording** (T3 část) = tag v1.1. **Zbývá:** T1 dedup (neutrální/lepší) → output linter → T3 zbytek (angle#8 „life rune first" gate) → T4 škrty (vzhled Rúnara · purpose „gather context").

**NESAHAT:** NEmergovat `_describeRule` + `_noColdRead` (každá platí za JINOU eval-chybu) · JSON kontrakt · IS 7-bod gramatika · length (audio budget) · variabilita (angle/name/ending pooly). `DEF_CHAR.never` + data run = 📜 kánon / 🔒 fakt → reframe = **datované DECISIONS, ne tichý tune.**
