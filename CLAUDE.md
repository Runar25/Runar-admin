# RÚNAR — Claude Code Context

## Co je Rúnar
AI-powered mystický průvodce runami pro značku Agndofa (Island). Rúnar má vlastní poetický hlas, charakter a filozofii. Budoucí centrum předplatného produktu s fyzickým ekosystémem (runové sady, kakao ceremonial).

## Stack
- **Frontend:** Single HTML soubor + vanilla JS/CSS, GitHub Pages
- **Backend:** Supabase (`pmitxjvkeovijreepror`) — PostgreSQL + Edge Functions + Storage — **region: eu-west-1 (Irsko)** ✓ GDPR
- **AI:** Claude API přes Supabase Edge Function proxy (`claude-proxy`)
- **Voice:** ElevenLabs API přes Supabase Edge Function proxy (`elevenlabs-proxy`)
- **Repo:** `runar25.github.io/Runar-admin/v2/`
- **E-commerce:** Shopify — `agndofa.is` (islandský trh, plánovaná integrace)

## Soubory v `/v2/`
```
runar-shrine.html      ← hlavní app (admin)
runar-reader.html      ← uživatelská app
runar-help.html        ← průvodce & FAQ (EN+IS, Rúnarův hlas)
runar-privacy.html     ← Privacy Policy (EN+IS, GDPR-compliant)
runar-config.js        ← SB_URL, SB_KEY, PROXY, EL_PROXY, EL_STATIC,
                          EL_VOICE_ID_EN, EL_VOICE_ID_IS, elVoiceId(),
                          TIERS, RUNAR_MODES, ADMIN_EMAILS, isAdmin()
runar-runes.js         ← 25 Elder Futhark + Blank, AREAS, SEEKS, calcLifeRune()
runar-character.js     ← DEF_CHAR_EN, DEF_CHAR_IS, buildSysPrompt()
runar-translations.js  ← UI_TEXT { en, is }
runar-svgs.js          ← RUNE_SVGS (SVG glyfů)
```

## Edge Functions (`/supabase/functions/`)
```
claude-proxy           ← forwards to Claude API
                          · tier enforcement: rune_seeker 5/měsíc (DB check) + credits
                          · rate limit: 10 req/60s per user nebo IP
                          · 402 = no_credits nebo monthly_limit
                          · 429 = rate_limited
elevenlabs-proxy       ← real-time TTS, vrací base64 → Blob URL
elevenlabs-static      ← admin: generuje + ukládá MP3 do Storage
redeem-code            ← ověří gift code → přidá credits → tier = 'rune_seeker'
                          · race-condition safe (.is("used_by", null))
                          · rate limit: 5 pokusů/15 min per IP
delete-account         ← GDPR: smaže auth.users → CASCADE user_profiles + readings
                          · před smazáním nulluje gift_codes.used_by (FK bez CASCADE)
shopify-webhook        ← (plánováno) tier upgrade po nákupu v Agndofa shopu
```
Všechny deploynuty s `--no-verify-jwt`.
Deploy z root repo: `supabase functions deploy <name> --project-ref pmitxjvkeovijreepror --no-verify-jwt`

## Supabase tabulky
```
knowledge_base         ← Rúnarovy výklady run
runar_character        ← verze charakteru s active flag (editace přes kod)
runar_corrections      ← stylistické opravy slov
runar_static_audio     ← statické audio, UNIQUE (rune_name, lang, version)
                          sloupce: id, rune_name, rune_glyph, lang, version(int),
                                   text, audio_url, ready, created_at, updated_at
user_profiles          ← profily přihlášených uživatelů (RLS ✓)
                          sloupce: id (= auth.users.id), name, lang, tier,
                                   credits_balance, created_at
                          POZOR: email a updated_at sloupce NEEXISTUJÍ v DB!
                          upsert posílá pouze: { id } s ignoreDuplicates:true
readings               ← každé čtení uživatele (RLS ✓)
                          sloupce: id, user_id, rune_name, rune_glyph, lang,
                                   short_text, deep_text, area, seeking, question,
                                   life_rune (text), credits_used (bool), drawn_at
gift_codes             ← kódy na fyzických kartičkách
                          sloupce: code (PK), credits, rune_name, batch_id,
                                   used_by (FK → auth.users, BEZ CASCADE!),
                                   used_at, created_at
                          POZOR: used_by nemá ON DELETE CASCADE
                          → delete-account to řeší ručně (SET NULL před deleteUser)
rate_limits            ← rate limiting pro Edge Functions
                          sloupce: key (text), window_start (timestamptz), count (int)
                          PRIMARY KEY (key, window_start)
                          Cleanup: 5% pravděpodobnost při každém volání (starší než 1h)
```

## Supabase RPC funkce
```
use_credit(p_user_id)           ← atomicky odečte 1 kredit, vrátí nový zůstatek (-1 = žádné)
add_credits(p_user_id, p_amount)← atomicky přidá N kreditů, vrátí nový zůstatek
check_rate_limit(p_key, p_window_seconds, p_max_requests)
                                ← atomický upsert do rate_limits, vrátí true = povoleno
```

## Supabase Storage
```
runar-audio (PUBLIC)   ← static/en/fehu_1.mp3, static/en/fehu_2.mp3, ...
                          static/is/fehu_1.mp3, static/is/fehu_2.mp3, ...
```

## Voice IDs (ElevenLabs)
- Oba jazyky: `2UI8v2ibbwQTijaYAte1` (stejný hlas)
- EN model: `eleven_multilingual_v2`
- IS model: `eleven_v3` (auto-detekuje islandštinu z textu)
- Model se určuje v Edge Function podle `lang` — NIKDY nevěř frontendu

## Tier systém
```
Visitor     (free_trial)  → 3 čtení celkem, anon, jen Fehu v kolekci, no voice
Rune Seeker (rune_seeker) → 5 čtení/měsíc ZDARMA (server-side enforcement) + kredity navíc
                            deník posledních 5 čtení, všech 25 run
                            kredity = fyzická karta, 1 kredit = 1 čtení + Rúnarův hlas
Standard                  → unlimited, dynamický hlas (coming soon)
Premium                   → unlimited + ceremonial (coming soon)
```
Upgrade path: Visitor → Rune Seeker (zdarma, účet) → Standard → Premium

POZOR: Staré DB hodnoty 'free' a 'credits' jsou normalizovány na 'rune_seeker' ve frontendu i backendu.
SQL migrace (již spuštěno): `UPDATE user_profiles SET tier = 'rune_seeker' WHERE tier IN ('free', 'credits');`

Voice flagy (v runar-config.js TIERS.rune_seeker):
  voice_monthly: false  ← hlas pro 5 free/měsíc (flip na true až bude rozhodnuto)
  voice_credits: true   ← hlas při použití kreditů

## Klíčová rozhodnutí
- Poetický hlas Rúnara — žádný tech žargon v UI, nikdy
- Dva jazyky — EN a IS jsou samostatné výklady, ne překlady
- IS překlady v UI zatím jen placeholdery — čekají na review rodilého mluvčího
- Rotující hero fráze (12 EN + 12 IS) — náhodně při každém načtení, HERO_PHRASES v readeru
- Statické audio = pre-generované MP3 v Storage (free tier, nulové náklady)
- Dynamické audio = real-time ElevenLabs (placený tier, ephemeral blob)
- Verzování audio: každý save = nová verze (fehu_1.mp3, fehu_2.mp3...), MAX(version)
- Reader tab: po tažení runy auto-přehraje náhodnou verzi static audio
- upsertProfile() → pouze { id } s ignoreDuplicates:true (ostatní sloupce mají DB defaults)
- Supabase RLS: každý uživatel vidí jen svá vlastní data (auth.uid() = user_id)
- Credits se kupují jako fyzická karta v Agndofa shopu — žádný Stripe
- Monthly limit 5/měsíc je vynucován SERVER-SIDE (claude-proxy čte readings tabulku)
  → localStorage je jen cache, nelze obejít manipulací JS
- Admin přístup: jen odkaz v hamburgeru (⚿ KNOWLEDGE SHRINE), viditelný jen pro ADMIN_EMAILS
  → žádné auto-redirecty, admin může normálně používat reader

## Bezpečnost & GDPR
Island je člen EEA → platí plné GDPR.

**Co je hotovo:**
- [x] Supabase region: eu-west-1 (Irsko) — data fyzicky v EU
- [x] RLS na user_profiles a readings — uživatel vidí jen svá data
- [x] ON DELETE CASCADE — smazání účtu smaže vše (právo na výmaz)
- [x] Citlivé API klíče pouze v Edge Functions, nikdy ve frontendu
- [x] Delete account — tlačítko v hamburgeru, Edge Function, okamžité smazání
- [x] Privacy Policy — EN+IS stránka (runar-privacy.html), odkaz v hamburgeru
- [x] DPA se Supabase — Request odeslán (čeká na potvrzení e-mailem)
- [x] Rate limiting — claude-proxy + redeem-code chráněny proti spamu/brute-force

**Co zbývá:**
- [ ] DPA podpis — dokončit až přijde e-mail od Supabase
- [ ] Privacy Policy odkaz na agndofa.is webu
- [ ] Email-based tracking — zabránit delete+recreate workaround

---

## ROADMAP v0.8 (2026-05-20)

### VRSTVA 0 — ZÁKLAD ✅ HOTOVO

### VRSTVA 1 — HLAS ✅ PŘEVÁŽNĚ HOTOVO
- [x] Statické audio pipeline (ElevenLabs → Storage → Reader)
- [x] Dynamické audio (real-time TTS pro placené tiery)
- [x] Admin generátor v shrine
- [ ] Nahrát všech 25 × EN + 25 × IS run (zatím jen část)

### VRSTVA 1.5 — UX & VIZUÁL ✅ HOTOVO
- [x] Topbar: AGNDOFA + jméno/tier + hamburger menu
- [x] Side panel: tier v hlavičce, jazyk dole, account sekce
- [x] Barva: #FFBF00 globálně
- [x] Hero mobile: eyebrow + title overlaid na portrét
- [x] Hero subtitle: rotující fráze Rúnarova hlasu (12 EN, IS čeká na native review)
- [x] Name prompt modal: "Before the Runes Speak"
- [x] Tier notices v Reading tabu s dynamickým počítadlem + reset datum
- [x] Monthly reset modal — jednou za měsíc po prvním přihlášení
- [x] Visitor gate v Collection: jen Fehu klikatelná
- [x] Shrine: sticky topbar stejný styl jako reader

### VRSTVA 2 — AUTH & UŽIVATELSKÝ ÚČET ✅ HOTOVO
- [x] Magic link + Google OAuth
- [x] user_profiles (RLS), readings (RLS)
- [x] Deník — posledních 5 čtení (rune_seeker), rozbalitelné, life_rune, credits_used
- [x] Journal teaser pro Standard (X readings kept — move to Standard)
- [x] Runes Collection
- [x] Language persistence (localStorage + user_profiles.lang)
- [x] Delete account — GDPR, okamžité smazání všech dat
- [x] Admin odkaz v hamburgeru (⚿ KNOWLEDGE SHRINE) — jen pro ADMIN_EMAILS

### VRSTVA 3 — MONETIZACE ✅ HOTOVO
- [x] gift_codes tabulka + use_credit + add_credits RPC
- [x] Edge Function: redeem-code (race-condition safe, rate limited)
- [x] Reader: credits banner + collapsible redeem UI
- [x] Shrine: admin generátor kódů (prefix, batch, CSV export)
- [x] Tier merge: free + credits → rune_seeker (5 free/měsíc + extra credits)
- [x] Monthly limit vynucován server-side v claude-proxy
- [x] Rate limiting: claude-proxy (10/min) + redeem-code (5/15min)

#### Platební model
- Credits = fyzická karta Rúnara (gift card)
- Karta má kód → zákazník zadá v appce → dostane credits
- Credits nevyprší, fungují across devices
- 1 credit = 1 čtení s Rúnarovým hlasem

#### Ceník kreditních karet (EUR + ISK)
Kurz: €1 ≈ 148 ISK · náklady ~€0.18/čtení (Claude + ElevenLabs)

| Karta | Kredity | EUR | ISK | Náklady | Marže |
|-------|---------|-----|-----|---------|-------|
| Starter | 5 | €10 | 1.490 ISK | ~€0.90 | 91% |
| Seeker | 10 | €18 | 2.690 ISK | ~€1.80 | 90% |
| Wanderer | 20 | €34 | 5.050 ISK | ~€3.60 | 89% |
| Elder | 50 | €80 | 11.900 ISK | ~€9.00 | 89% |

Po islandském VSK (24%): marže ~75–80%

| Tier | Výklady | Dynamický hlas | Kolekce |
|------|---------|----------------|---------|
| Visitor | 3 celkem | ❌ | jen Fehu |
| Rune Seeker | 5/měsíc + kredity | ✅ (jen credits) | všech 25 |
| Standard | unlimited | ✅ | všech 25 |
| Premium | unlimited | ✅ | + ceremonial |

### VRSTVA 3.5 — GDPR & PRÁVNÍ ✅ HOTOVO
- [x] Privacy Policy EN+IS (runar-privacy.html)
- [x] Delete account UI + Edge Function
- [x] DPA se Supabase — Request odeslán
- [ ] Privacy Policy odkaz na agndofa.is

### VRSTVA 4 — STANDARD & PREMIUM FEATURES (NÁVRH)

> ⚠️ Rozdělení mezi Standard a Premium ještě není finální — nutno rozhodnout.

#### Délka výkladů (max_tokens)
Současný stav v `RUNAR_MODES.quick_reading`:
- Visitor / Rune Seeker: **700 tokenů** (~500 slov)
- Standard: **1000–1200 tokenů** (návrh) — bohatší, hlubší výklad
- Premium: **1500+ tokenů** (návrh) — plná hloubka + ceremonial

#### Přehled navržených features

**⚡ Prožitek & rychlost**
- [ ] **Real SSE streaming** — první slova za ~0.5s místo čekání 3–5s; Rúnar "mluví" v reálném čase
      Implementace: claude-proxy vrací ReadableStream, frontend čte SSE events
- [ ] **Hlas pro všechna čtení** — flip `voice_monthly: true` pro Standard (teď jen credits)
- [ ] **Delší výklady** — Standard 1000–1200 tokenů, Premium 1500+

**📖 Journal**
- [ ] **Neomezený deník** — unlimited čtení, bez limitu 5 (kód připraven, jen unlock)
- [ ] **Filtry v deníku** — podle runy, oblasti, jazyka, data (HTML připraven, `display:none`)
- [ ] **Export čtení** — stáhnout journal jako PDF nebo CSV

**🔮 Rituální výklady (nový koncept)**
- [ ] **Týdenní rituální výklad** — uživatel nakreslí run(y) během týdne → v pátek/sobotu
      Rúnar udělá hlubší výklad ze všech run týdne dohromady jako jeden rituál
      Runa se uloží jako "týdenní runa" a přispívá do kolektivního výkladu
- [ ] **Měsíční rituální výklad** — stejný princip ale za celý měsíc
      Na konci měsíce Rúnar vytvoří hluboký výklad z run celého měsíce
      Propojení s měsíčním resetem free čtení (symbolický přechod)
      Potřeba: nová tabulka `ritual_readings` nebo rozšíření `readings` o `ritual_type`

**🧠 Hloubka & kontext**
- [ ] **Třírunový spread** — minulost / přítomnost / budoucnost (jeden draw, tři runy)
- [ ] **Follow-up otázka** — jedna doplňující otázka po čtení v rámci kontextu sezení
- [ ] **Lunární / sezónní kontext** — Rúnar ví jaký je měsíční cyklus a roční období,
      zapracuje to do výkladu (islandský lunární kalendář, slunovrat, rovnodennost)

**🎭 Personalizace**
- [ ] **Rúnarův tón** — výběr stylu výkladu (mystický / přímý / meditativní)
- [ ] **Paměť kontextu** — Rúnar si pamatuje předchozí čtení a odkazuje na ně
      (multi-turn history v claude-proxy)

#### Návrh rozdělení (k diskuzi)
| Feature | Standard | Premium |
|---------|----------|---------|
| SSE streaming | ✅ | ✅ |
| Delší výklady (1000 tokenů) | ✅ | ✅ |
| Hlas pro všechna čtení | ✅ | ✅ |
| Neomezený journal + filtry | ✅ | ✅ |
| Export čtení | ✅ | ✅ |
| Follow-up otázka | ✅ | ✅ |
| Týdenní rituální výklad | ✅ | ✅ |
| Třírunový spread | ✅ | ✅ |
| Měsíční rituální výklad | ❌ | ✅ |
| Lunární / sezónní kontext | ❌ | ✅ |
| Rúnarův tón | ❌ | ✅ |
| Paměť kontextu | ❌ | ✅ |
| Ceremonial mode (kakao) | ❌ | ✅ |
| Fyzický ekosystém (QR/NFC) | ❌ | ✅ |

#### Rituální výklady — architektura (návrh)
```
ritual_readings tabulka:
  id, user_id, ritual_type (weekly/monthly),
  period_start, period_end,
  rune_names[] (pole run z daného období),
  reading_text, lang,
  created_at

Flow:
1. Uživatel táhne runy normálně (ukládají se do readings)
2. Na konci týdne/měsíce: tlačítko "RÚNAR'S WEEKLY COUNSEL"
3. Systém vytáhne runy z daného období → pošle jako kontext Rúnarovi
4. Rúnar vygeneruje rituální výklad ze všech run najednou
5. Uložení do ritual_readings
```

### VRSTVA 5+ — VZDÁLENÁ BUDOUCNOST
- Shopify webhook — automatický tier upgrade po online nákupu
- Online gift card (zatím jen fyzická)
- Fyzický ekosystém (QR deeplink, NFC na produktech Agndofa)

---

## RÚNAR'S WHISPERS — kontext & budoucí vývoj

### Co je hotovo (MVP, 2026-05-21)
- 5-runový kombinovaný výklad v Journal tabu (Standard/Premium)
- Uživatel ručně označí 5 run z journalu → Rúnar vytvoří 1200-token výklad
- Rune Seeker vidí teaser "Unlocks with Standard"
- Hlas přes ElevenLabs (stejný flow jako regular reading)
- Výsledek se streamuje slovo po slovu

### Zamýšlený rituální kontext (budoucí implementace)
Rúnar's Whispers není jen klikání na runy. Je to rituál:
1. Kakao ceremony — uživatel si připraví cacao (Agndofa produkt)
2. Meditace — ticho, záměr, napojení
3. Tah run — 5 run taženo vědomě, jedna po druhé, s pauzou
4. Teprve pak: Rúnar's Whispers s těmito 5 runami

**Budoucí implementace:**
- Speciální "rituální tah" flow — jiný UX od běžného čtení
- Runy z tohoto flow se automaticky vkládají do Whispers "košíku"
- Možná integrace s Agndofa cacao produktem (QR/NFC)
- Měsíční Whispers — automaticky z run celého měsíce

### Alternativní názvy (uloženy pro budoucí použití)
Všechny jsou silné — mohou se hodit pro různé varianty rituálu nebo tier features.

| Název | Motiv |
|-------|-------|
| **RÚNAR'S WHISPERS** | ← **aktuálně používáno** |
| THE COUNCIL OF RUNES | Runy zasedly jako rada moudrých |
| RÚNAR'S COUNSEL | Rada/poradenství na základě celé cesty (Council/Counsel hříčka) |
| THE WEAVING | Tkaní osudu z více run — nornský motiv, velmi islandský |
| RUNE CIRCLE | Kruh run, rituální |
| THE CHRONICLE | Celkový výklad cesty |
| GODS' WHISPERS | Mystické, tajemné |
| THE GATHERING | Shromáždění run |

### Technické poznámky
- `mode: 'ceremonial'` v API requestu (mapuje na RUNAR_MODES.ceremonial, max_tokens 1200)
- `use_credit: false` — Whispers neodčítá kredity, je součástí Standard tieru
- `_journalCache` slouží jako selection pool — uživatel vybírá z již existujících čtení
- `_whispersMode`: 'idle' | 'selecting' | 'loading' | 'output'
- `_selectedEntries[]`: max 5 záznamů z journalu
- `_whispersText`: vygenerovaný text (pro voice generation)
- Počet run (5) je konfigurovatelný — konstanta v `enterWhispersSelection()`

### Měsíční Whispers (plánováno)
- Automaticky na konci měsíce: Rúnar sestaví výklad ze všech run daného měsíce
- Napojení na měsíční reset free čtení (symbolický přechod)
- Potřeba: tabulka `ritual_readings` nebo rozšíření `readings` o `ritual_type`

---

### DENÍK (JOURNAL) — architektura

**Rune Seeker:** posledních 5 čtení, rozbalitelné (short + deep text)
**Standard:** vše bez limitu + filter bar (runa, oblast, jazyk)

Teaser pro Rune Seeker: pokud má >5 čtení celkem, zobrazí "X readings kept — move to Standard to see all"

Každé čtení ukládá:
- `life_rune` — životní runa v době čtení (z data narození)
- `credits_used` — true = kreditní čtení (s hlasem), false = free monthly

Filter bar (`#journal-filter-bar`) je v HTML, ale `display:none` pro rune_seeker.
`_journalCache` = in-memory kopie pro filtrování bez nového DB dotazu.

### TECHNICKÝ DLUH
- [ ] IS texty — review rodilým mluvčím (rotující fráze, notices, gates, help, privacy)
- [ ] Email-based tracking — zabránit delete+recreate workaround
- [ ] Nahrát zbývající statické audio (25 EN + 25 IS run)
- [ ] Language gating pro Visitor — TIERS.free_trial.languages=['en'] není vynucováno v UI
      IS tlačítko je viditelné a funkční pro všechny (Visitor může přepnout na IS)
      Odloženo — IS texty stejně čekají na native review
- [ ] Side panel: balance zobrazit i pro Standard/Premium (pokud mají zbývající kredity z dřívějška)
- [x] Rate limiting — claude-proxy + redeem-code + elevenlabs-proxy ✓
- [x] Voice tier control — canUseVoice() + TIERS config flags ✓
- [x] Bug: userTier='credits' dead code → normalizováno na 'rune_seeker' ✓
