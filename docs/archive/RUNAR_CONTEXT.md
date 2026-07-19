# RÚNAR — kompletní kontext projektu (pro Claude chat / Drive)

> ⚠️ **ODVOZENÝ SNÍMEK, NE ZDROJ PRAVDY.** Účel: aby čerstvý chat (mobil, cesty) byl v obraze bez nahrávání
> desítek souborů. Proto tu fakta jsou opsaná — a proto **zastarávají rychleji než kdekoli jinde**.
> **Při JAKÉMKOLI rozporu vyhrává produkce, pak kód/config, pak `RUNAR_DECISIONS.md`. Tenhle doc prohrává vždy.**
> Nikdy odsud nepřebírej číslo ani stav do jiného docu (§20). Poslední srovnání s realitou: **2026-07-18**.
> **Konvence:** narativ česky; app termíny / názvy run / spready anglicky (single rune, Norns, Cross/Kříž, Horseshoe,
> Yggdrasil, Area of Life, Seeking…). Detailní zdroje pravdy → sekce 10.
> **Pozn.:** Tohle je SHRNUTÍ. Pro úpravy kódu platí pravidla v CLAUDE.md (v repu).

---

## 0. Rychlá orientace (mobil)
- **Co:** AI průvodce runami pro Agndofa (Island). Poetický, konkrétní hlas. IS primární + EN.
- **Funnel:** Visitor (1 tah) → Rune Seeker (1 free s hlasem, pak pay-per-use) → Standard/Premium (předplatné).
- **Ceny (jednotky čtení):** zdroj pravdy = `SPREAD_COSTS` v `v2/runar-config.js`. Čísla se sem NEopisují —
  přesně tím vzniká drift (doc-owner pravidlo).
- **Narativ:** každý uživatel = **Rune Seeker** na Óðinově cestě. **Rúnar = průvodce** (Keeper; hlas se NEMĚNÍ).
- **Otevřené:** tree vizuální engine (LAB) · tree paměť · Óðin's Path (forma) · The Gathering (název).

---

## ⭐ Tier jména — FINÁLNÍ (2026-07-07, ověřeno nativně Sigrún)
Poutníci Óðinovy cesty (METAFORA, nikdy „jsi Óðin" — je nedostižný, jdeme po jeho cestě).
EN: **Rune Seeker → Rune Walker → Rune Wanderer**. IS (živá slova): **Leitandi → Vegfarandi → Ferðalangur**.
Keeper uvolněn Rúnarovi (premium už NENÍ Keeper). NE Root/Deep (superseded). DB beze změny, label z TIERS (§8).

## ⭐ Óðinova cesta (centrální narativ → RUNAR_DESIGN.md)
Uživatel = Rune Seeker jdoucí Óðinovou cestou; strom = mapa cesty. Bytosti = mechaniky: **Huginn**
(notifikace vrať se), **Muninn** (journal / Life Rune / vzorec), **Ratatoskr** (Full Gathering).
Dva režimy: **Poutník** (volný, havrani mlčí) vs **Cesta** (opt-in, Rúnar navádí na rituály ve správný čas).
**Žádný vrchol — cesta nekončí.** Čtení pro druhé (`_readingMode='someone'`) = schopnost (Premium), ne titul.
Detail → `memory/snapshots/2026-07-05-odinova-cesta-poutnik-cesta.md`.

## 1. Co je Rúnar
AI-powered mystický průvodce runami pro značku **Agndofa** (Island). Poetický hlas, nordická filozofie, vlastní charakter.
- **Stack:** HTML + CSS + vanilla JS (GitHub Pages) · Supabase `pmitxjvkeovijreepror` (eu-west-1, GDPR) — PostgreSQL +
  Edge Functions + Storage · **AI:** Claude API přes edge `claude-proxy` · **Voice:** ElevenLabs přes `elevenlabs-proxy`.
- **Jazyky:** IS (primární — pro Islanďany, musí být perfektní) + EN (vedlejší). Samostatné výklady, ne překlady.
- **Produkce:** runar25.github.io/Runar-admin/v2/ · **E-commerce:** Shopify (agndofa.is).

## 2. Produktová severka (rámec, který určuje vše)
- **Max přístupnost veřejnosti + hloubka pro commitnuté.** Dvě patra: **přístupné základní čtení** + **volitelná
  premium hloubková vrstva.** Přístupnost = snížit bariéru *porozumění*, ne hloubku.
- **Monetizace = produkt, za který lidé chtějí platit** (ne freebie-treadmill). Cílit na rezonující publikum
  (mytologie, strom, alternativní cesty), ne na max surový dosah.
- Tón už byl stažen z přílišné poezie — sweet spot = **konkrétní + emočně jasné** (ne moc poetické, ne moc abstraktní).

## 3. Co je LIVE (produkce, hotové)
- **Čtení:** single + **Norns**(3) + **Kříž**(5) + **Horseshoe**(7) + **Yggdrasil**(9) + **Life Rune**. Sdílené IS/EN
  buildery, IS 3-vrstvý systém (system prompt IS + user prompt IS + korekce **v promptu**;
  slepý post-processor `applyISCorrections` je vypnutý od 2026-07-10).
- **Délky:** zdroj pravdy = buildery v `runar-character.js` (RP_* packy). Sem se neopisují.
  Délka = znaky = ElevenLabs náklad → při změně přepočítat pricing.
- **⭐ Sezónní obraznost (HOTOVO — pozor, starší dokumenty to mají jako TODO):** každé čtení dostane per-čtení 1 obraz
  aktuální islandské sezóny z poolu (6 sezón × bright/cold), localStorage shuffle-bag (každý obraz jednou než se
  opakuje). Studené runy (Isa/Hagalaz/Nauthiz/Þurisaz) losují studený obraz **v sezóně** → Isa v červnu = „severák /
  ledovcová řeka", ne sníh. KLÍČ: per-čtení injekce do USER promptu model POSLECHNE, system prompt ignoruje.
- **In-app reporter (HOTOVO):** plovoucí ⚑ tlačítko v readeru → tester pošle hlášení k textu/chybě (typ + popis,
  zachytí označený text + kontext) → Supabase `bug_reports` (offline fronta, dedupe přes UNIQUE client_uuid). Triáž
  textů řeší později Cowork (routing přes i18n_key / screen_context).
- **Dál live:** journal (5 pro RS), auth (magic link + Google), redeem gift kódy, GDPR (delete account, privacy),
  rate limiting, statické + dynamické audio.

## 4. Tier · funnel · pricing (AKTUÁLNÍ stav)
- **Visitor** (free_trial): 1 čtení, anon, jen single/Fehu. **Gating zůstává** (jediný tier s omezením spreadů).
- **Rune Seeker** (rune_seeker): **1 free čtení při registraci, S HLASEM, žádný měsíční reset** (= „Model B"; jediný
  zdroj = DB `free_balance`). Pak **pay-per-use** přes **Rune Reading Card** (jednorázová, no expiry, no subscription).
  Journal posledních 5.
- **Standard / Premium:** předplatné, počítá se v **jednotkách čtení**. Měsíční cap **běží a je vynucovaný**
  v claude-proxy od 2026-07-16 (hlídá smoke ⑨). Kapacity = `TIERS.*.monthly_readings`, sem se neopisují.
- **Kreditní váhy = jednotky čtení**, odvozené z nákladů (jednotná marže ~98 %). **Hodnoty = `SPREAD_COSTS`
  v `v2/runar-config.js`, sem se NEOPISUJÍ** (§20). Kredity jdou per TYP čtení, ne per počet run —
  dřívější model 1/3/5/7/9 NEPLATÍ. Předplatné počítá tytéž jednotky.
- **Fundace stromu:** Life Rune (3) + founding Norns (2) = **5 kreditů**. Čistě volný uživatel (2 free: Visitor 1 +
  RS 1) si strom sám nezaloží → **musí existovat digitální cesta do fundace** (founding credit pack / founding-gift
  při 1. předplatném / promo karty), ne jen fyzický bundle (globální uživatel fyzickou sadu nemá).
- **Voice policy:** hlas = flagship; **1 free čtení s hlasem** (hák — nový člověk slyší flagship aspoň jednou);
  placená/kreditová ekonomika = s hlasem; online promo „nadstandard" giveaways = **mohou být text-only** (hlas =
  hlavní variabilní náklad).
- **Yggdrasil:** ⭐ **KDYKOLIV, KDOKOLIV přihlášený. Žádná brána na datum.** Zimní slunovrat = větší **síla
  ve stromě**, ne podmínka přístupu (rituální čtení — bude jich víc). RS platí kredity, Std/Prem z limitu.
  **Přebíjí opačné rozhodnutí z 2026-06-16** („nezamykat→neměnit", návrh bez gate zamítnut) — KUKY to 2026-07-18
  otočil a musel to opravovat popáté. Autorita = `RUNAR_DECISIONS.md` 2026-07-18 + kód (žádný gate).
- **Měsíční free runa (tree-keepalive rituál):** PARKOVÁNO na později — zatím **neimplementováno**, jen zaznamenaný
  nápad (single rune registrovaným, rámováno jako rituál obratu měsíce; smysl = drží strom naživu → feeder na Premium).

## 5. Náklady · daně · break-even (Agndofa ehf., Island)
- **Fixní ~$202/měs:** Claude dev/Max $100 (dočasný, klesne po dotažení appky), Shopify Basic $39, Supabase Pro $25,
  ElevenLabs Creator $22, Apple $8.25, Hetzner $6, doména $1.50, Google $0.70, Resend $0.
- **Variabilní ~$1.81/uživatel/měs:** Claude API + ElevenLabs hlas $0.85 + Shopify platby ~2.9 %.
- **Daně IS:** VSK 24 % (osvobození pod ~2 mil. ISK/rok obratu ≈ 47 už.); zaměstnavatelské odvody ~20 %
  (tryggingagjald 6.35 + lífeyrissjóður 11.5 + sjúkrasjóður/orlofssjóður/starfsmennta); osobní daň+odvody ~33 %;
  firemní daň 20 % / dividenda 22 % (optimalizuje účetní).
- **Break-even ~8 uživatelů; 500.000 ISK čistého/měs ≈ ~353 platících.** Odvody ~zdvojnásobí počet vs hrubý model.
  Odhady — **ověřit s účetním.** (Plný rozpad + kalkulačka: `RUNAR_PRICING.md`.)

## 6. Reading line — strategie (eval → generování → features)
**Eval metoda:** procházíme reálné výstupy → korpus vzorků (zatím 6 čtení) → **reverzní dedukce** (z textu odhadnout
vstupy Area/Seeking/For = test, jestli kontext funguje; opakovaně potvrzeno; u Yggdrasil annual neplatí — context-light).

**Klíčové nálezy (napříč vzorky):**
1. **Tón jede dle runy** (tvrdá runa → výzva, vřelá → potvrzení) = silná stránka, ne vada.
2. **Největší páka kvality = Seeking mód**, ne počet run. Confirmation/Reflection/General → genericnost;
   Insight into Challenge/Clarity → konkrétnost. Nejhorší: měkký Seeking + vřelé runy.
3. Kontext se reálně používá (jde vyčíst z výstupu).
4. **Mannaz + abstraktní/„já" runy = nejslabší** (vyšeptají ve vícerunových). 5. Motiv **„belonging you already have"
   = tik** (omezit). 6. Hagalaz silný, **Gebo vzor** (stejné jádro, různé fasety). 7. **Sezónní kotva = protilátka na
   genericnost** (konkrétní lokalizovaný obraz nejde nasadit na kohokoli). 8. **Délka ≠ hloubka.** 9. Transparentnost
   pozic klesá s počtem run. 10. Konkrétní obraz řeší genericnost *i* přístupnost zároveň.

**Úkoly generátoru (pořadí implementace):**
1. **⭐ Segmentovaný výstup `{ rune, text }`** — **✅ HOTOVO Fáze A** (buildery → JSON, `_parseSegments` složí text).
   ⚠️ Tvar je `{rune,text}` — **ne** `position` ani `deeper_meaning` (ověřeno v `json:` polích builderů 2026-07-17;
   `deeper_meaning` zahozen 2026-07-04, v `runar-reading.js` zbyl jen mrtvý defenzivní read).
   Fáze B (tap UI / spread-map) = Premium #1, neimplementováno. (UI propojení runa↔text,
   per-runa kvalita, eval, per-runa sezóna). **POZOR (háček, který strategie neřeší):** čtení se **čte nahlas (TTS)**
   a dnes je **jeden plynoucí blok** (vědomé rozhodnutí). Segmenty musí být **metadata** — text/hlas zůstane plynulý,
   tap teprve odhalí per-runa vrstvu. NE udělat z čtení formulář (Rúnar = zrcadlo, ne dashboard).
2. **Prompt fixy** (hned, levné, character.js): kompenzovat měkký Seeking (víc specifik runy + jméno + Area), posílit
   Mannaze/abstraktní runy, přístupnost jako explicitní kritérium, omezit „belonging".
3. **Sezónní few-shoty** (gold příklady: „Isa v červnu = severák", „věta o tisu") NAVRCH existujícího pool systému
   (sekce 3) — teprve segmentace umožní aplikovat per-runa.

**Feature: interaktivní rune-strip / spread-map** (mobile-first tap): ťuk na runu → zvýrazní její text-segment + hlubší
význam runy + význam pozice; geometrie per spread (single/osa/kříž/oblouk/kruh-9). Barva jako spojnice. Závisí na
segmentaci. = Premium #1.

**Premium odlišovače (princip: víc Z čtení + víc PROPOJENÍ, nikdy ne MÉNĚ čtení):**
- #1 **Hloubková vrstva** nad každým čtením (segment runa-po-rune + kombinace + pozice + přitažlivost/odpor na stromě).
- #2 **„Rúnar čte celý tvůj strom"** (periodické meta-čtení nasbíraných čtení přes orel/kořeny).
- #3 **Kontinuita/paměť** (Rúnar pamatuje minulá čtení) — gating NEJISTÝ, otevřené.
- **Follow-up dialog** („zeptej se Rúnara na čtení") — připraveno jako premium (náklad roste s tahy → sedí).

## 7. Strom života (Tree of Life)
- **Produkce:** Life Rune (výpočet z DOB, generování, uložení, Tree tab UI, IS systém).
- **✅ Vizuální engine JE V PRODUKCI** (od 2026-07-10, admin-only beta): `runar-tree-prod.js`, crown-composer,
  roste z reálných čtení. ⚠️ Signály z DB do stromu dojedou jen zčásti — detail `RUNAR_TREE.md` + DECISIONS 2026-07-18.
  Chybí `tree_state` DB (paměť stromu), na které visí The Gathering.
- **Vztahový model (vize):** hloubka není KDE runa je, ale v **silách MEZI runami** → strom doroste do tvaru tvých
  čtení („živé zrcadlo"). 3 tvorové jako detektory vztahů: **orel/Gammur** (koruna = sbíhavé vazby), **Níðhöggr**
  (kořeny = napětí), **Ratatoskr** (posel). Jedna nejsilnější vazba na čtení (vzácnost = hloubka).
- **Budoucnost:** `tree_state` / pattern detection („Rúnar poznává uživatele každým čtením") — NUTNÝ REDESIGN.

## 8. Dvě paralelní session (důležité pro koordinaci)
- **MAIN** (Opus): reading systém, prompty, config/pricing, translations, reader/reporter, auth, app.
- **TREE**: vizuální strom engine (doménový doc `RUNAR_TREE.md`; `RUNAR_TREE_LAB.md` je archivovaný).
- Komunikace přes **git + soubory** (žádný přímý kanál). Commit prefix `[reading]`/`[pricing]`/`[fix]` vs `[tree]`.
  Sdílená data run (runar-runes.js: aett/world/element) = TREE jen čte, edituje aditivně + flag do MEMORY.

## 9. Zbývá / launch blockery
**Vlastník = `RUNAR_BACKLOG.md`.** Sem se seznam neopisuje — 2026-07-18 se ukázalo, že tenhle doc
a `MEMORY.md` měly navzájem prohozené priority a ani jeden nevěděl o odkladu zapsaném v BACKLOGu.
(Pozn.: „monthly limit enforcement" už blocker NENÍ — běží od 2026-07-16.)

## 10. Soubory (zdroje pravdy)
**Repo `C:\Users\zkuku\Downloads\Runar-admin\` (KANONICKÉ):**
- `CLAUDE.md` — technická pravidla, tier, DB, stav (NE Desktop kopie!)
- `RUNAR_PRICING.md` — pricing, kreditní škála, náklady, daně, break-even
- `RUNAR_DESIGN.md` — design, mytologie, spready, rituální kadence
- `RUNAR_TREE.md` — Tree of Life: duše, zóny, signály, Gathering (KANONICKÝ vstupní bod)
- `RUNAR_CONTEXT.md` — **tento master dokument**

**Reading/reporter strategie `C:\Users\zkuku\Desktop\Agdofa APP\Claude - Runar\`:**
- `runar_cteni_session_handoff.md` — reading eval/features/funnel (živý, KUKY udržuje)
- `runar_reporter_spec_CODE.md` + `runar_copy_triage_COWORK.md` — reporter + triáž specy

**Paměť = `repo\memory\`** — obě platformní složky jsou na ni junction (§17). Žádné zrcadlo, žádné kopírování;
zrcadlo v `Claude\Projects\` bylo 2026-07-18 vyřazeno jako zdroj driftu.
- `MEMORY.md` = **jen index + rozcestník** (od 2026-07-18 neobsahuje fakta ani stav) · `working-style.md` (workflow)
  · `snapshots/` (historie ke svému datu — nikdy zdroj aktuálního stavu)

**⚠️ ZASTARALÉ — NENAHRÁVAT (zmátnou chat):**
- `Desktop\Agdofa APP\CLAUDE.md` (starý ROADMAP v0.8, SW v23, váhy 1/3/5/7/9)
- `Desktop\Agdofa APP\Claude - Runar\CLAUDE.md` (označená „ARCHIVNÍ KOPIE")

## 11. Jak se pracuje (stručně, pro implementaci)
IS primární (3 vrstvy, nikdy „překlad EN"). JS změny **přes Python skripty** (Edit tool kazí apostrofy). CSS/HTML/
translations.js → Edit OK. Workflow: **Explore → Plan → schválení → Implement** (jeden krok). SW bump na JS/CSS změnu
(git hook). Žádné hardcoded user-visible stringy (vše přes t()/VOCAB/TIERS). Před commitem: `smoke.py`.

---
**Doc-sync:** změna chování = práce + záznam do `RUNAR_DECISIONS.md` + oprava dotčené sekce docu, vše
v jednom turnu (§16). Paměť se NEKOPÍRUJE — `memory/` je v repu a obě platformy na ni míří junctionem (§17).
Kanonický doc žije JEN v repu; zrcadlo je nanejvýš dočasný draft.

*Odvozený snímek, srovnáno 2026-07-18. **Při rozporu tenhle dokument PROHRÁVÁ** — platí produkce,
pak kód/config, pak `RUNAR_DECISIONS.md`. SW verzi a prompt verzi tu schválně nenajdeš: zastarají
do druhého dne a patří do `v2/sw.js` a `runar-config.js`.*
