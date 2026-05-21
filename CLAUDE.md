# RÚNAR — Claude Code Context

## Co je Rúnar
AI-powered mystický průvodce runami pro značku Agndofa (Island). Rúnar má vlastní poetický hlas, charakter a filozofii. Centrum předplatného produktu s fyzickým ekosystémem (runové sady, kakao ceremonial).

## Stack
- **Frontend:** Single HTML soubor + vanilla JS/CSS, GitHub Pages
- **Backend:** Supabase (`pmitxjvkeovijreepror`) — PostgreSQL + Edge Functions + Storage — **region: eu-west-1 (Irsko)** ✓ GDPR
- **AI:** Claude API přes Supabase Edge Function proxy (`claude-proxy`)
- **Voice:** ElevenLabs API přes Supabase Edge Function proxy (`elevenlabs-proxy`)
- **Repo:** `runar25.github.io/Runar-admin/v2/`
- **E-commerce:** Shopify — `agndofa.is` (islandský trh, plánovaná integrace)

## Soubory v `/v2/`
```
runar-shrine.html      ← admin app (Knowledge Shrine)
runar-reader.html      ← uživatelská app (hlavní soubor, ~3000 řádků)
runar-help.html        ← průvodce & FAQ (EN+IS, Rúnarův hlas)
runar-privacy.html     ← Privacy Policy (EN+IS, GDPR-compliant)
runar-config.js        ← SB_URL, SB_KEY, PROXY, EL_PROXY, EL_STATIC,
                          EL_VOICE_ID_EN, EL_VOICE_ID_IS, elVoiceId(), elModel(),
                          TIERS (s label_is), RUNAR_MODES, ADMIN_EMAILS, isAdmin()
runar-runes.js         ← 25 Elder Futhark + Blank, AREAS, SEEKS, calcLifeRune()
runar-character.js     ← DEF_CHAR_EN, DEF_CHAR_IS, buildSysPrompt()
runar-translations.js  ← UI_TEXT { en, is }
runar-svgs.js          ← RUNE_SVGS (SVG glyfů)
```

## Edge Functions (`/supabase/functions/`)
```
claude-proxy           ← forwards to Claude API
                          · ADMIN_EMAILS bypass: admins dostanou 'premium' bez DB check
                          · tier enforcement: rune_seeker 5/měsíc (DB check) + credits
                          · standard/premium: unlimited, no deduction
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
runar-audio (PUBLIC)   ← static/en/fehu_1.mp3 ... static/en/othalan_2.mp3
                          static/is/fehu_1.mp3 ... static/is/othalan_2.mp3
                          ✅ HOTOVO: všech 25 × EN + 25 × IS run nahráno
```

## Voice IDs (ElevenLabs)
- Oba jazyky: `2UI8v2ibbwQTijaYAte1` (stejný hlas)
- EN model: `eleven_multilingual_v2`
- IS model: `eleven_v3` (auto-detekuje islandštinu z textu)
- Model se určuje v Edge Function podle `lang` — NIKDY nevěř frontendu

## Tier systém
```
Visitor     (free_trial)  → 3 čtení celkem, anon, jen Fehu v kolekci
Rune Seeker (rune_seeker) → 5 čtení/měsíc ZDARMA (server-side enforcement) + kredity
                            journal: posledních 5 čtení
                            The Gathering: teaser (locked)
                            Specific Question: locked (teaser)
Standard                  → unlimited čtení + hlas
                            journal: unlimited + filtry
                            The Gathering: plný přístup
                            Specific Question: odemčena
Premium                   → vše jako Standard + ceremonial (coming soon)
```
Upgrade path: Visitor → Rune Seeker (zdarma, účet) → Standard → Premium

POZOR: Staré DB hodnoty 'free' a 'credits' normalizovány na 'rune_seeker' ve frontendu i backendu.
SQL migrace (již spuštěno): `UPDATE user_profiles SET tier = 'rune_seeker' WHERE tier IN ('free', 'credits');`

Voice flagy (v runar-config.js TIERS.rune_seeker):
```
voice_monthly: true   ← hlas pro 5 free/měsíc (aktuálně otevřeno)
voice_credits: true   ← hlas při použití kreditů
```

IS názvy tierů (v TIERS config, pole `label_is`):
```
free_trial:  Gestur
rune_seeker: Vegfarandi
standard:    Standard
premium:     Premium
```

## Admin přístup
Admins (`ADMIN_EMAILS = ['kukula@agndofa.is', 'info@agndofa.is']`) mají:

**Frontend (runar-reader.html):**
`fetchUserProfile()` nastaví `userTier = 'premium'` pokud `isAdmin(currentUser.email)`.
Odemkne všechny features bez ohledu na DB tier.

**Backend (claude-proxy/index.ts):**
Před DB lookupem zkontroluje email z JWT.
Pokud admin → `userTier = 'premium'` server-side, bypass všech limitů.

**Shrine (runar-shrine.html):**
Přístup jen pro admin emails — link v side panelu viditelný jen pro `ADMIN_EMAILS`.

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
- Barva UI: `var(--gold)` = `#FFBF00` — používat vždy, žádná teal v primárních prvcích

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

## ROADMAP v0.9 (2026-05-21)

### VRSTVA 0 — ZÁKLAD ✅ HOTOVO

### VRSTVA 1 — HLAS ✅ HOTOVO
- [x] Statické audio pipeline (ElevenLabs → Storage → Reader)
- [x] Dynamické audio (real-time TTS pro placené tiery)
- [x] Admin generátor v shrine
- [x] Všech 25 × EN + 25 × IS run nahráno do Storage ✅

### VRSTVA 1.5 — UX & VIZUÁL ✅ HOTOVO
- [x] Topbar: AGNDOFA + jméno/tier + hamburger menu
- [x] Side panel: kompletně přepracován (journal link, Reading Card, danger zone)
- [x] Barva: #FFBF00 amber/gold globálně — konzistentně ve všem UI
- [x] Hero mobile: eyebrow + title overlaid na portrét
- [x] Hero subtitle: rotující fráze Rúnarova hlasu (12 EN + 12 IS)
- [x] Name prompt modal: "Before the Runes Speak"
- [x] Tier notices v Reading tabu s dynamickým počítadlem + reset datum
- [x] Monthly reset modal — jednou za měsíc po prvním přihlášení
- [x] Visitor gate v Collection: jen Fehu klikatelná
- [x] Shrine: sticky topbar stejný styl jako reader
- [x] IS tier názvy: Gestur / Vegfarandi
- [x] DOB placeholder překlady (Dagur / Mánuður / Ár)

### VRSTVA 2 — AUTH & UŽIVATELSKÝ ÚČET ✅ HOTOVO
- [x] Magic link + Google OAuth
- [x] user_profiles (RLS), readings (RLS)
- [x] Language persistence — localStorage priority + DB sync (multi-device)
- [x] Delete account — GDPR, okamžité smazání všech dat
- [x] Admin odkaz v hamburgeru (⚿ KNOWLEDGE SHRINE) — jen pro ADMIN_EMAILS
- [x] Admin premium access — frontend + backend bypass

### VRSTVA 2.5 — JOURNAL & KOLEKCE ✅ HOTOVO
- [x] Runes Collection tab — 25 run s audio, Visitor vidí jen Fehu
- [x] Journal — vlastní 3. tab (◌ JOURNAL)
  - jcard design: zkrácený excerpt → expand na klik
  - Plný text: short + deep, otázka (Standard+), life rune
  - ♪ RÚNAR'S VOICE — statické audio per záznam
  - Filter bar (rune / area / lang) pro Standard/Premium
  - Rune Seeker: posledních 5, teaser pokud >5 celkem
  - Standard/Premium: unlimited + filtry
  - Gate pro nepřihlášené (ᚱ + výzva k registraci)
- [x] Specific Question — gated na Standard/Premium, Rune Seeker vidí teaser
- [x] Journal tab visible jen pro přihlášené (hide/show při auth change)
- [x] Side panel: ✦ MY JOURNAL link → přepne na Journal tab

### VRSTVA 3 — MONETIZACE ✅ HOTOVO
- [x] gift_codes tabulka + use_credit + add_credits RPC
- [x] Edge Function: redeem-code (race-condition safe, rate limited)
- [x] Reader: credits banner + collapsible redeem UI
- [x] Shrine: admin generátor kódů (prefix, batch, CSV export)
- [x] Tier merge: free + credits → rune_seeker
- [x] Monthly limit vynucován server-side v claude-proxy
- [x] Rate limiting: claude-proxy (10/min) + redeem-code (5/15min)
- [x] Reading Card (dříve Gift Card) — název sjednocen EN+IS

#### Platební model
- Credits = fyzická Reading Card Rúnara
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

### VRSTVA 3.5 — GDPR & PRÁVNÍ ✅ HOTOVO
- [x] Privacy Policy EN+IS (runar-privacy.html)
- [x] Delete account UI + Edge Function
- [x] DPA se Supabase — Request odeslán
- [ ] Privacy Policy odkaz na agndofa.is

### VRSTVA 3.6 — THE GATHERING ✅ MVP HOTOVO
- [x] 5-runový kombinovaný výklad v Journal tabu (Standard/Premium)
- [x] Uživatel označí 5 run z journalu → 1200-token hluboký výklad
- [x] ★ SELECT tlačítka na jcard, counter Selected: X of 5
- [x] LET RÚNAR WEAVE → streaming výstup
- [x] ᚢ RÚNAR'S VOICE — ElevenLabs audio pro celý text
- [x] Rune Seeker: teaser "The Gathering unlocks with Standard."
- [x] Méně než 5 čtení: "X more readings needed"
- [x] Plná EN/IS podpora

### VRSTVA 4 — STANDARD & PREMIUM FEATURES (NÁVRH)

> ⚠️ Rozdělení mezi Standard a Premium ještě není finální — nutno rozhodnout.

#### Délka výkladů (max_tokens)
- Visitor / Rune Seeker: **700 tokenů** (~500 slov)
- The Gathering: **1200 tokenů** (již implementováno)
- Standard: **1000–1200 tokenů** (návrh) — bohatší výklad
- Premium: **1500+ tokenů** (návrh) — plná hloubka + ceremonial

#### Přehled navržených features

**⚡ Prožitek & rychlost**
- [ ] **Real SSE streaming** — první slova za ~0.5s místo čekání 3–5s
- [ ] **Delší výklady** — Standard 1000–1200 tokenů, Premium 1500+

**📖 Journal**
- [ ] **Export čtení** — stáhnout journal jako PDF nebo CSV
- [ ] **Filtry podle data** — přidat date range do filter baru

**🔮 The Gathering — rituální evoluce**
- [ ] **Rituální tah flow** — speciální UX: kakao, meditace, 5 vědomých tahů
      Run z rituálního tahu se automaticky vkládají do Gathering košíku
- [ ] **Měsíční Gathering** — automaticky z run celého měsíce
      Napojení na měsíční reset (symbolický přechod)
      Potřeba: tabulka `ritual_readings` nebo rozšíření `readings` o `ritual_type`
- [ ] **Integrace s Agndofa cacao produktem** — QR/NFC spustí rituální flow

**🧠 Hloubka & kontext**
- [ ] **Třírunový spread** — minulost / přítomnost / budoucnost
- [ ] **Follow-up otázka** — jedna doplňující otázka po čtení
- [ ] **Lunární / sezónní kontext** — Rúnar ví jaký je měsíční cyklus a roční období

**🎭 Personalizace**
- [ ] **Rúnarův tón** — výběr stylu výkladu (mystický / přímý / meditativní)
- [ ] **Paměť kontextu** — Rúnar si pamatuje předchozí čtení (multi-turn history)

#### Návrh rozdělení (k diskuzi)
| Feature | Standard | Premium |
|---------|----------|---------|
| SSE streaming | ✅ | ✅ |
| Delší výklady (1200 tokenů) | ✅ | ✅ |
| Hlas pro všechna čtení | ✅ | ✅ |
| Unlimited journal + filtry | ✅ | ✅ |
| Export čtení | ✅ | ✅ |
| The Gathering (5 run) | ✅ | ✅ |
| Follow-up otázka | ✅ | ✅ |
| Třírunový spread | ✅ | ✅ |
| Měsíční Gathering | ❌ | ✅ |
| Lunární / sezónní kontext | ❌ | ✅ |
| Rúnarův tón | ❌ | ✅ |
| Paměť kontextu | ❌ | ✅ |
| Ceremonial mode (kakao ritual) | ❌ | ✅ |
| Fyzický ekosystém (QR/NFC) | ❌ | ✅ |

### VRSTVA 5+ — VZDÁLENÁ BUDOUCNOST
- Shopify webhook — automatický tier upgrade po online nákupu
- Online Reading Card (zatím jen fyzická)
- Fyzický ekosystém (QR deeplink, NFC na produktech Agndofa)

---

## THE GATHERING — architektura & kontext

### Technické detaily (aktuální implementace)
- `mode: 'ceremonial'` v API requestu (mapuje na RUNAR_MODES.ceremonial, max_tokens 1200)
- `use_credit: false` — Gathering neodčítá kredity, je součástí Standard tieru
- `_journalCache` = selection pool — uživatel vybírá z existujících čtení v journalu
- `_whispersMode`: `'idle' | 'selecting' | 'loading' | 'output'`
- `_selectedEntries[]`: max 5 záznamů z journalu
- `_whispersText`: vygenerovaný text (pro voice generation)
- Počet run (5) je konfigurovatelný — konstanta v `enterWhispersSelection()`
- CSS třída `.whispers-selecting` na `#journal-content` zobrazí ★ SELECT tlačítka

### Zamýšlený rituální kontext (budoucí implementace)
The Gathering není jen klikání na runy. Je to rituál:
1. **Kakao ceremony** — uživatel si připraví cacao (Agndofa produkt)
2. **Meditace** — ticho, záměr, napojení
3. **Vědomý tah run** — 5 run taženo záměrně, jedna po druhé, s pauzou
4. **Teprve pak** — The Gathering s těmito 5 runami

### Alternativní názvy (uloženy pro budoucí použití)
| Název | Motiv |
|-------|-------|
| **THE GATHERING** | ← **aktuálně používáno** (pracovní název) |
| RÚNAR'S WHISPERS | původní název, odložen |
| THE COUNCIL OF RUNES | Runy zasedly jako rada moudrých |
| RÚNAR'S COUNSEL | Rada na základě celé cesty (Council/Counsel hříčka) |
| THE WEAVING | Tkaní osudu z více run — nornský motiv |
| RUNE CIRCLE | Kruh run, rituální |
| THE CHRONICLE | Celkový výklad cesty |
| GODS' WHISPERS | Mystické, tajemné |

---

## JOURNAL — architektura

**Tab:** 3. záložka ◌ JOURNAL — viditelná jen pro přihlášené uživatele.

**Struktura pane:**
1. `#whispers-section` — THE GATHERING (nahoře)
2. `#journal-pane-header` — ✦ YOUR READINGS + count
3. `#journal-filter-bar` — Standard/Premium only (rune / area / lang)
4. `#journal-list` — entry cards
5. `#journal-standard-teaser` — pro Rune Seeker pokud >5 čtení celkem

**Tier přístup:**
- Visitor: tab skrytý, gate zobrazena
- Rune Seeker: posledních 5 čtení, The Gathering locked
- Standard/Premium: unlimited, filtry, The Gathering odemčen

**jcard design:**
- Collapsed: glyf, rune name · lang, datum + oblast, 2-řádkový excerpt
- Expanded (klik): short text + · · · + deep text + otázka + life rune + audio btn
- `#jcard-${i}`, `#jbody-${i}`, `#jarr-${i}`, `#jselect-btn-${i}`

**Key state:**
- `_journalCache[]` — in-memory kopie, filtry pracují bez nového DB dotazu
- `_whispersMode`, `_selectedEntries[]`, `_whispersText` — The Gathering state

**DB select:**
```js
.select('id, rune_name, rune_glyph, lang, short_text, deep_text, area, seeking, question, life_rune, credits_used, drawn_at')
```

---

## TECHNICKÝ DLUH & CO ZBÝVÁ

### Okamžité priority
- [ ] **IS texty** — review rodilým mluvčím (hero fráze, notices, gates, help, privacy, The Gathering)
- [ ] **Privacy Policy odkaz** na agndofa.is webu
- [ ] **DPA podpis** — dokončit až přijde e-mail od Supabase

### Střední priorita
- [ ] **The Gathering — rituální flow** — speciální UX pro vědomý tah 5 run (kakao, meditace)
- [ ] **Měsíční Gathering** — automatický výklad z run celého měsíce
- [ ] **Export journalu** — PDF nebo CSV stažení
- [ ] **Filtry podle data** v journalu
- [ ] **SSE streaming** — real-time výstup místo čekání na celý response
- [ ] **Delší výklady pro Standard** — 1000–1200 tokenů (nyní 700 pro všechny)
- [ ] **Reading Card online** — Shopify integrace (zatím jen fyzická)

### Nízká priorita / budoucnost
- [ ] **Language gating pro Visitor** — TIERS.free_trial.languages=['en'] není vynucováno v UI
      Odloženo — IS texty stejně čekají na native review
- [ ] **Side panel: balance pro Standard/Premium** — zobrazit zbývající kredity z dřívějška
- [ ] **Email-based tracking** — zabránit delete+recreate workaround
- [ ] **Třírunový spread** — minulost / přítomnost / budoucnost
- [ ] **Follow-up otázka** po čtení
- [ ] **Lunární / sezónní kontext**
- [ ] **Paměť kontextu** — multi-turn history v claude-proxy
- [ ] **Fyzický ekosystém** — QR/NFC na produktech Agndofa

### Hotovo ✅ (tento session, 2026-05-21)
- [x] Statické audio: všech 25 × EN + 25 × IS run nahráno
- [x] Specific Question — gated na Standard/Premium
- [x] Journal tab — vlastní 3. záložka, jcard design, audio per entry
- [x] The Gathering — 5-runový kombinovaný výklad, 1200 tokenů
- [x] Admin premium access — frontend (fetchUserProfile) + backend (claude-proxy)
- [x] Barvy sjednoceny — amber #FFBF00 v celém journal UI
- [x] IS tier názvy: Gestur / Vegfarandi
- [x] Side panel redesign — journal link, Reading Card, danger zone
- [x] DOB placeholder překlady
- [x] Language persistence fix (localStorage priority nad DB při přihlášení)
