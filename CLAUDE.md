# RÚNAR — Claude Code Context

---

## ⚡ INVARIANTY — PŘEČÍST JAKO PRVNÍ, PŘED KAŽDOU ZMĚNOU

Toto jsou podmínky, které musí být vždy pravda. Pokud změna porušuje invariant, zastav se.

### Texty
- **Každý viditelný text → `runar-translations.js` → `t()` → `setText()` v `updateUIText()` nebo příslušné update funkci.**
  - HTML soubor smí mít textový fallback, ale JS ho musí přepsat při initu.
  - Nikdy nepřidávej nový viditelný text přímo do HTML jako finální hodnotu.
  - Inline ternár (`isIs ? '...' : '...'`) je přijatelný v update funkcích. Do HTML nepatří.
- **Přidáváš nový prvek s textem?** → okamžitě přidej klíč do `runar-translations.js` a `setText()` volání do `updateUIText()` nebo nejbližší update funkce.

### Záměrně anglické pojmy (NEPŘEKLÁDAT do IS)
Tyto pojmy jsou vlastní jména / brand koncepty — zůstávají anglicky ve všech jazycích:
- `STANDARD`, `PREMIUM` — názvy tierů
- `THE GATHERING` — název rituální funkce
- `THE JOURNEY BEYOND` — název sekce v side panelu
- `Ceremonial mode.` — název prémiové funkce
- `READING GIFT CARD` / `Reading gift cards` — název produktu
- `RÚNAR` — vlastní jméno (nikdy nepřekládat, jen zachovat diakritiku)

### IS texty — Word Corrections
- **PŘED každou IS textovou změnou spustit:** `python show_corrections.py` (v `C:\Users\zkuku\Downloads\Runar-admin\`)
- Skript načte živá data z Supabase `runar_corrections`. Anon key stačí (tabulka je čitelná).
- Korekce = schválené verze od rodilého mluvčího — mají přednost před mým generováním.
- Snapshot viz sekce **Word Corrections** níže — aktualizovat po každé nové korekci.

### JS změny
- **Edit tool NESMÍ měnit JS kód** — přepisuje `'` (U+0027) na curly quotes → SyntaxError.
- **Všechny JS změny = Python skripty** v `C:\Users\zkuku\Downloads\Runar-admin\`.
- CSS a HTML (bez inline JS) lze měnit Edit toolem.

### Mockupy a návrhy — WORKFLOW KTERÝ FUNGUJE
- **NIKDY nevytvářet HTML mockupy** — žerou tokeny, nevypadají jako originál.
- Návrhy ukazovat **pouze textově** — prostý popis nebo ASCII/tabulka. Příklad:
  ```
  AREA OF LIFE · Become a Rune Seeker to unlock
  [ Love & Relationships ]  [ Purpose & Path ]   ← ztlumené
  ```
- **Postup pro každou novou feature:**
  1. Uživatel popíše záměr
  2. Claude ukáže textově jak to bude vypadat — stručně, výstižně
  3. Uživatel případně upřesní (může přijít ve více zprávách)
  4. Claude shrne finální pravidlo / tabulku před implementací
  5. Uživatel schválí → teprve pak implementace + commit
- **Clarifying questions před kódem** — pokud chybí info (např. "platí pro kredity taky?"), zeptat se nejdřív.

### Barvy a vizuál
- **Měň POUZE prvky explicitně specifikované v zadání.** Nikdy nepřidávej "vylepšení" barvy, fontu nebo stylu k prvkům, které nebyly zmíněny.
- `var(--dim)` = #3a4a60 — NIKDY pro čitelný text.
- `var(--gold)` = #FFBF00 — primární barva UI.

### Testování
- **Vždy testuj jako `rune_seeker`**, ne jen jako admin. Admin má premium přístup automaticky.
- Změna textu? Otestuj při přepnutí jazyka EN→IS i IS→EN.

### Git
- Jeden commit = jedna věc. Ne "udělal jsem X, Y a Z".
- Každý commit musí jít push okamžitě po dokončení funkční změny.

### Architektura
- `PANEL_TIERS` v `_renderYourPath()` = jediný zdroj pravdy pro tier data v side panelu.
- `reader-content` (form) se NIKDY neskrývá — vždy viditelný bez ohledu na tier.
- `updateUIText()` se volá při každé změně jazyka — sem patří všechny textové aktualizace.

---

## Co je Rúnar
AI-powered mystický průvodce runami pro značku Agndofa (Island). Rúnar má vlastní poetický hlas, charakter a filozofii. Centrum předplatného produktu s fyzickým ekosystémem (runové sady, kakao ceremonial).

## Stack
- **Frontend:** HTML (563 ř.) + CSS (`runar-reader.css`) + JS (`runar-app.js`) + vanilla JS modules, GitHub Pages
- **Backend:** Supabase (`pmitxjvkeovijreepror`) — PostgreSQL + Edge Functions + Storage — **region: eu-west-1 (Irsko)** ✓ GDPR
- **AI:** Claude API přes Supabase Edge Function proxy (`claude-proxy`)
- **Voice:** ElevenLabs API přes Supabase Edge Function proxy (`elevenlabs-proxy`)
- **Repo:** `runar25.github.io/Runar-admin/v2/`
- **E-commerce:** Shopify — `agndofa.is` (islandský trh, plánovaná integrace)

## Soubory v `/v2/`
```
runar-shrine.html      ← admin app (Knowledge Shrine)
runar-reader.html      ← uživatelská app — čistá HTML struktura (563 řádků)
runar-reader.css       ← veškeré styly readeru (603 řádků) ← EDIT TOOLEM OK
runar-app.js           ← veškerá JS logika readeru (2555 řádků) ← PYTHON SKRIPTY
runar-help.html        ← průvodce & FAQ (EN+IS, Rúnarův hlas)
runar-privacy.html     ← Privacy Policy (EN+IS, GDPR-compliant)
runar-config.js        ← SB_URL, SB_KEY, PROXY, EL_PROXY, EL_STATIC,
                          EL_VOICE_ID_EN, EL_VOICE_ID_IS, elVoiceId(), elModel(),
                          TIERS (s label_is), RUNAR_MODES, ADMIN_EMAILS, isAdmin()
                          TIER_LIMITS — single source of truth pro limity (2026-05-29)
                          SPREAD_COSTS — cost per spread type in free balance + credits
runar-runes.js         ← 25 Elder Futhark + Blank, AREAS, SEEKS, calcLifeRune()
runar-character.js     ← DEF_CHAR_EN, DEF_CHAR_IS, buildSysPrompt()
runar-translations.js  ← UI_TEXT { en, is }  ← EDIT TOOLEM OK
runar-svgs.js          ← RUNE_SVGS (SVG glyfů)
sw.js                  ← Service Worker v9, HTML network-first, JS/CSS cache-first
```

## Edge Functions (`/supabase/functions/`)
```
claude-proxy           ← forwards to Claude API
                          · ADMIN_EMAILS bypass: admins dostanou 'premium' bez DB check
                          · tier enforcement:
                            - rune_seeker: weekly drip — 3 free v prvních 7 dnech účtu,
                              poté 1/týden; monthly cap 5 (credits_used=false)
                            - use_credit=true: odečte 1 kredit server-side
                            - mode='ceremonial' (The Gathering): bypass všech limitů
                          · standard/premium: unlimited, no deduction
                          · rate limit: 10 req/60s per user nebo IP
                          · 402 = no_credits | weekly_limit | monthly_limit
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
                                   credits_balance, created_at,
                                   free_balance (int, default 1) ← PŘIDÁNO 2026-05-29
                                   drip_week (text, ISO week "2026-W22") ← PŘIDÁNO 2026-05-29
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
Visitor     (free_trial)  → 1 čtení celkem (bylo 3 — změna 2026-05-29), anon, jen Fehu v kolekci
                            DOB pole: locked/teaser
                            Area of Life + Seeking: locked/teaser

Rune Seeker (rune_seeker) → BALANCE SYSTÉM (2026-05-29):
                              free_balance v DB (user_profiles.free_balance)
                              onboarding: 3 free při registraci
                              weekly drip: +1 každé pondělí POUZE pokud free_balance = 0
                              free readings: POUZE single rune (1 balance = 1 čtení)
                              free readings bez kreditů: Area + Seeking locked
                            + kredity (Reading Gift Card) = plný přístup + Area + Seeking
                            journal: posledních 5 čtení
                            The Gathering: 1× ZDARMA (pak jen Standard+)
                              - min. 3 čtení v journalu
                              - po 1. použití: "The Gathering opens with Standard."
                            Specific Question: locked (teaser)

Standard                  → unlimited čtení + hlas
                            journal: unlimited + filtry
                            The Gathering: plný přístup (zdarma, bez kreditů)
                            Specific Question: odemčena

Premium                   → vše jako Standard + ceremonial (coming soon)
```

SPREAD_COSTS (v runar-config.js):
```
single:    free=1,    credits=1   ← free balance pokrývá POUZE toto
trojice:   free=null, credits=3
cross:     free=null, credits=5
gathering: free=null, credits=-1  (= počet vybraných run)
horseshoe: free=null, credits=7
norns:     free=null, credits=9
yggdrasil: free=null, credits=9
life_rune: free=null, credits=10  (deep reading — implementace later)
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
- Python skripty pro JS změny — Edit tool mění `'` na curly quotes → SyntaxError
- CSS změny: Edit tool na `runar-reader.css` je bezpečný (žádné JS)
- `speak_btn` v translations = "HEAR RÚNAR SPEAK" (reading trigger button, ne voice button)

## CSS systém — klíčové třídy
**Soubor: `runar-reader.css`** — editovat přímo Edit toolem (bezpečné).
```
.btn-upgrade    ← SDÍLENÁ třída pro VŠECHNA upgrade CTA tlačítka
                  transparent bg, gold border, gold fill on hover
                  Použití: <button class="vcn-btn btn-upgrade">
                  Konkrétní tlačítko přidá jen font-size + padding

.cap            ← custom amber audio player (hlavní reading + whispers)
                  capToggle(), capSeek(), capMute(), _capReset()
                  audio element: id="runar-audio" (BEZ controls atributu)

_makeCapPlayer(prefix, src, doPlay)  ← generický sekundární player
                  Vrací HTML string s audio + .cap UI pro prefix
                  _capWire(prefix, doPlay) drátuje eventy
                  Použití: collection modal ('coll'), journal ('j'+i)

.auth-dropdown-wrap / .auth-dropdown  ← topbar username dropdown
                  toggleDropdown() — open/close
                  updateDropdown() — naplní tier, email, balance
                  Zavírá se klikem mimo (DOMContentLoaded listener)
```

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
- [x] Privacy consent checkbox v auth modalu — uživatel musí odsouhlasit před registrací
- [x] First-visit privacy banner — zobrazí se jednou, uloženo v localStorage

**Co zbývá:**
- [ ] DPA podpis — dokončit až přijde e-mail od Supabase
- [ ] Privacy Policy odkaz na agndofa.is webu
- [ ] Email-based tracking — zabránit delete+recreate workaround

---

## ══════════════════════════════════════════════
## ⚡ PRIORITNÍ NEDODĚLKY — ŘEŠIT JAKO PRVNÍ
## ══════════════════════════════════════════════

### 🔴 KRITICKÉ (blokuje prodej / provoz)

**1. Resend SMTP — magic link emaily**
Aktuálně Supabase posílá magic linky z vlastní domény (`@supabase.io`). Uživatelé to vidí jako spam nebo nedůvěryhodné.
- Resend Dashboard → Add Domain → `agndofa.is` → DNS záznamy (MX, SPF, DKIM)
- Supabase → Project Settings → Auth → SMTP: `smtp.resend.com:465`, user=`resend`, sender=`noreply@agndofa.is`
- ⚠️ MUSÍ BÝT HOTOVO PŘED SHOPIFY WEBHOOKEM (transakční emaily po nákupu)

**2. Shopify webhook — automatický upgrade po nákupu**
Bez toho zákazník musí ručně zadat kód z karty. Online prodej není možný.
- Edge Function `shopify-webhook` je připravena (kostra)
- Potřeba: HMAC ověření Shopify podpisu + `add_credits()` RPC + email potvrzení přes Resend
- ⚠️ ZÁVISÍ NA: Resend SMTP (bod 1) musí být funkční první

**3. DPA se Supabase**
Zpracování osobních dat bez podepsané DPA je GDPR riziko.
- Čekat na e-mail od Supabase s odkazem na podpis
- Po podpisu označit jako hotovo

### 🟡 DŮLEŽITÉ (viditelné uživateli, blokuje růst)

**4. IS texty — review rodilým mluvčím**
Všechny islandské texty v UI jsou strojové placeholdery. Žádný rodilý mluvčí je neviděl.
Týká se: hero fráze, tier notices, gates, The Gathering popisy, help stránka, privacy policy, auth modal.
- Exportovat všechny IS strings → dát k review → zapracovat zpětnou vazbu

**5. Privacy Policy odkaz na agndofa.is**
Zákazníci na hlavním webu nemají přístup k Privacy Policy před registrací.
- Přidat odkaz na `runar-privacy.html` do footeru nebo auth sekce agndofa.is

**6. Standard tier — způsob nákupu**
Aktuálně neexistuje způsob jak si koupit Standard. Tlačítko "UPGRADE → STANDARD" je "COMING SOON".
- Rozhodnout: Shopify produkt? Stripe? Ruční upgrade v Supabase?
- Navrhnout flow a implementovat

### 🟢 STŘEDNÍ PRIORITA (vylepšení, ne blokátor)

- [ ] **SSE streaming** — první slova za ~0.5s místo čekání 3–5s (velký UX dopad)
- [ ] **Delší výklady pro Standard** — 1000–1200 tokenů (nyní 700 pro všechny)
- [ ] **Export journalu** — PDF nebo CSV stažení
- [ ] **Filtry podle data** v journalu
- [ ] **The Gathering — rituální flow** — kakao, meditace, vědomý tah 5 run
- [ ] **Měsíční Gathering** — automatický výklad z run celého měsíce

### ⚪ NÍZKÁ PRIORITA / BUDOUCNOST

- [ ] **Language gating pro Visitor** — IS jen pro registrované (odloženo, čeká na IS review)
- [x] **Třírunový spread (3 READINGS / Trojice)** ✅ — viz VRSTVA D
- [ ] **Follow-up otázka** po čtení
- [ ] **Lunární / sezónní kontext** — Rúnar ví o měsíčním cyklu
- [ ] **Paměť kontextu** — multi-turn history v claude-proxy
- [ ] **Fyzický ekosystém** — QR/NFC na produktech Agndofa
- [ ] **Email-based tracking** — zabránit delete+recreate workaround

---

## ROADMAP v0.9 (aktualizováno 2026-05-24)

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
- [x] Topbar username dropdown — tier, email, readings balance + reset datum
- [x] YOUR PATH — collapsible sekce v side panelu, dynamický render per tier
- [x] HIGHER PATH — zobrazí tiery nad aktuálním, UPGRADE button uvnitř YOUR PATH
- [x] Sdílená `.btn-upgrade` třída — sjednocené upgrade CTA napříč celou appkou
- [x] Custom CAP player všude — collection modal + journal entries (žádný nativní browser player)
- [x] Loading animace v Reading tabu: pulsující ᚱ overlay během AI generování
- [x] Loading animace: pulsující layer labels místo blinkajících cursor barů
- [x] Loading text: "THE STONES SPEAK IN SILENCE…"
- [x] Reading button: "HEAR RÚNAR SPEAK" (speak_btn v translations)
- [x] Voice button přejmenován: "HEAR RÚNAR SPEAK" (voice_btn, jiný element)
- [x] THE JOURNEY BEYOND — přejmenováno z HIGHER PATH, toggle +/−
- [x] STANDARD + PREMIUM: "— coming soon" note, PREMIUM má plný feature list
- [x] Architekturální split: runar-reader.html → HTML + runar-reader.css + runar-app.js

### VRSTVA 2 — AUTH & UŽIVATELSKÝ ÚČET ✅ HOTOVO
- [x] Magic link + Google OAuth
- [x] user_profiles (RLS), readings (RLS)
- [x] Language persistence — localStorage priority + DB sync (multi-device)
- [x] Delete account — GDPR, okamžité smazání všech dat
- [x] Admin odkaz v hamburgeru (⚿ KNOWLEDGE SHRINE) — jen pro ADMIN_EMAILS
- [x] Admin premium access — frontend + backend bypass
- [x] Privacy consent checkbox v auth modalu
- [x] First-visit privacy banner (localStorage `privacy_seen`)

### VRSTVA 2.5 — JOURNAL & KOLEKCE ✅ HOTOVO
- [x] Runes Collection tab — 25 run s audio, Visitor vidí jen Fehu
- [x] Journal — vlastní 3. tab (◌ JOURNAL)
  - jcard design: zkrácený excerpt → expand na klik
  - Plný text: short + deep, otázka (Standard+), life rune
  - ♪ RÚNAR'S VOICE — statické audio per záznam (custom CAP player)
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
- 1 credit = 1 čtení pro Rune Seeker (The Gathering = 3 kredity)

#### Ceník kreditních karet (EUR + ISK)
Kurz: €1 ≈ 148 ISK · náklady ~€0.18/čtení (Claude + ElevenLabs)

| Karta | Kredity | EUR | ISK | Náklady | Marže |
|-------|---------|-----|-----|---------|-------|
| Starter | 5 | €10 | 1.490 ISK | ~€0.90 | 91% |
| Seeker | 10 | €18 | 2.690 ISK | ~€1.80 | 90% |
| Wanderer | 20 | €34 | 5.050 ISK | ~€3.60 | 89% |
| Elder | 50 | €80 | 11.900 ISK | ~€9.00 | 89% |

Po islandském VSK (24%): marže ~75–80%

### VRSTVA 3.5 — GDPR & PRÁVNÍ ✅ HOTOVO (čeká DPA)
- [x] Privacy Policy EN+IS (runar-privacy.html)
- [x] Delete account UI + Edge Function
- [x] Privacy consent v auth modalu + first-visit banner
- [x] DPA se Supabase — Request odeslán
- [ ] **DPA podpis** — čeká na e-mail od Supabase ⚠️
- [ ] **Privacy Policy odkaz na agndofa.is** ⚠️

### VRSTVA 3.6 — THE GATHERING ✅ MVP HOTOVO
- [x] 5-runový kombinovaný výklad v Journal tabu
- [x] Uživatel označí 3–7 run z journalu → 1200-token hluboký výklad
- [x] ★ SELECT tlačítka na jcard, counter Selected: X of 5
- [x] LET RÚNAR WEAVE → streaming výstup
- [x] HEAR RÚNAR SPEAK — ElevenLabs audio pro celý text (custom CAP player)
- [x] Rune Seeker: přístup za 3 kredity (GATHERING_CREDITS = 3)
- [x] Standard/Premium: plný přístup zdarma (bez odečítání kreditů)
- [x] Méně než 3 čtení: "X more readings needed"
- [x] Plná EN/IS podpora
- [x] Výsledek uložen do journalu jako dedicated Gathering jcard
- [x] 402 error správně ošetřen (nedostatek kreditů → jasná hláška)

### VRSTVA D — 3 READINGS (Trojice) ✅ V2 LAB HOTOVO

- [x] Mode selector: SINGLE RUNE / 3 READINGS v reader-rune-card
- [x] Slot tracker: ① ② ③ s rune glyfy při výběru
- [x] Unified output: 1 blok `#s3-out`, label `#s3-trojice-lbl` (glyfy tří run)
- [x] Trojice prompt: contextBlock + runesBlock + variantBlock, 900 tokenů
- [x] Rúnar vybírá variantu automaticky (5 možností, žádný user input)
- [x] Organic output: pozice v hlase, žádné labely
- [x] Voice: čte celý unified text
- [x] Save: `spread_data` = rune positions, `short_text` = unified text
- [x] Design rozhodnutí zdokumentována v runar_system_design.md

> ⚠️ Zatím jen V2 lab (shrine). Do produkce (runar-app.js) přejde v dalším sprintu.
> ✅ SQL: `spread_data` jsonb column přidána do readings tabulky (spuštěno 2026-05-28)

### VRSTVA 4 — STANDARD & PREMIUM FEATURES (NÁVRH)

> ⚠️ Rozdělení mezi Standard a Premium ještě není finální — nutno rozhodnout.
> ⚠️ Standard tier nemá způsob nákupu — viz prioritní nedodělky bod 6.

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
- [ ] **Měsíční Gathering** — automaticky z run celého měsíce
- [ ] **Integrace s Agndofa cacao produktem** — QR/NFC spustí rituální flow

**🧠 Hloubka & kontext**
- [x] **Třírunový spread (Trojice)** — implementováno v V2 lab (VRSTVA D)
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
| The Gathering (3–7 run) | ✅ | ✅ |
| Follow-up otázka | ✅ | ✅ |
| Třírunový spread | ✅ | ✅ |
| Měsíční Gathering | ❌ | ✅ |
| Lunární / sezónní kontext | ❌ | ✅ |
| Rúnarův tón | ❌ | ✅ |
| Paměť kontextu | ❌ | ✅ |
| Ceremonial mode (kakao ritual) | ❌ | ✅ |
| Fyzický ekosystém (QR/NFC) | ❌ | ✅ |

### VRSTVA 5+ — SHOPIFY & E-COMMERCE INTEGRACE

#### Postup při implementaci webhooků (udělat vše najednou):
1. **Resend SMTP** — nastavit před webhooky (magic link + transakční emaily)
   - Resend Dashboard → Domains → Add Domain → `agndofa.is`
   - Zkopírovat DNS záznamy (MX, SPF, DKIM) → vložit u DNS providera agndofa.is
   - Počkat na verifikaci → pak Supabase → Project Settings → Authentication → SMTP:
     - Host: `smtp.resend.com`, Port: `465`, Username: `resend`
     - Password: Resend API klíč, Sender: `noreply@agndofa.is` / `Rúnar`
2. **Shopify webhook** (`orders/paid`) → Edge Function `shopify-webhook`
   - Zákazník koupí Reading Gift Card na agndofa.is
   - Shopify pošle webhook → Edge Function ověří HMAC podpis
   - Lookup zákazníka v Supabase podle emailu
   - Volá `add_credits()` RPC → přidá kredity na účet
   - Pošle potvrzovací email přes Resend (backup kód vždy emailem)
3. **Reading Gift Card page** na agndofa.is (zatím odkaz na homepage)
- Online Reading Card (zatím jen fyzická)
- Fyzický ekosystém (QR deeplink, NFC na produktech Agndofa)

---

## THE GATHERING — architektura & kontext

### Technické detaily (aktuální implementace)
- `mode: 'ceremonial'` v API requestu (mapuje na RUNAR_MODES.ceremonial, max_tokens 1200)
- Rune Seeker: `use_credit: true`, odečte 3 kredity (GATHERING_CREDITS = 3)
- Standard/Premium: `use_credit: false` — součástí tieru
- `_journalCache` = selection pool — uživatel vybírá z existujících čtení v journalu
- `_whispersMode`: `'idle' | 'selecting' | 'loading' | 'output'`
- `_selectedEntries[]`: 3–7 záznamů z journalu (GATHERING_MIN=3, GATHERING_MAX=7)
- `_whispersText`: vygenerovaný text (pro voice generation)
- CSS třída `.whispers-selecting` na `#journal-content` zobrazí ★ SELECT tlačítka
- Výsledek uložen do `readings` tabulky jako normální záznam (rune_name='GATHERING')

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
- Rune Seeker: posledních 5 čtení, The Gathering za 3 kredity
- Standard/Premium: unlimited, filtry, The Gathering zdarma

**jcard design:**
- Collapsed: glyf, rune name · lang, datum + oblast, 2-řádkový excerpt
- Expanded (klik): short text + · · · + deep text + otázka + life rune + audio btn (custom CAP)
- `#jcard-${i}`, `#jbody-${i}`, `#jarr-${i}`, `#jselect-btn-${i}`

**Key state:**
- `_journalCache[]` — in-memory kopie, filtry pracují bez nového DB dotazu
- `_whispersMode`, `_selectedEntries[]`, `_whispersText` — The Gathering state

**DB select:**
```js
.select('id, rune_name, rune_glyph, lang, short_text, deep_text, area, seeking, question, life_rune, credits_used, drawn_at')
```

---

---

## TREE OF LIFE ECOSYSTEM — architektura (2026-05-30)

### Koncept — co to je

Samostatný ekosystém (`runar-tree.html`) — **reader zůstane beze změny**.
Tree of Life je longitudinální, rituální, vizuální zážitek. Reader je jednoduchý a čistý — dvě různé věci.

**Propojení reader ↔ tree:**
- Side panel odkaz → `runar-tree.html`
- Life runa z tree → system prompt readeru (jednosměrné, přes Supabase)
- Sdílená DB (readings tabulka), jinak oddělené HTML soubory

---

### Life runa — 5. element

```
4 živly (Fire / Water / Air / Earth)  ← dynamické, rostou z čtení
Life runa                              ← 5. element = uživatel sám (fixní, z DOB)
```

**Life runa je celý obraz hned od začátku.** Není to semeno které teprve poroste.
Ukazuje dominantní element, přirozený směr stromu, dar, stín — charakter člověka.
Čtení run pak ukazují jak člověk tím územím prochází.

**Rúnarova transformace:** Jakmile zná life runu, stává se průvodcem konkrétního člověka.
Každé čtení, každý Area of Life, každá otázka tuto znalost prohlubuje.
Rúnar se stává jejich echo, jejich zrcadlo — vyvíjí se s každým dalším čtením.

Life runa je **fixní** — z data narození, nelze změnit. Výpočet: `calcLifeRune()` v `runar-runes.js`.
Life rune výklad se **generuje Claudem** individuálně — není to statický obsah.

**Jméno uživatele** (etymologie + mytologická postava — Sigrún styl) = tresničková vrstva,
odloženo, přidáme pod life rune výklad pro islandský trh.

---

### Tier přístup — life runa

```
Visitor          nic — neví že life runa existuje

Rune Seeker      teaser: symbol + jméno runy
                 "Tvá životní runa je Gebo ᚷ"
                 Rúnar zůstává generický (bez personalizace)

Standard         plný life rune výklad (generovaný Claudem)
                 Rúnar začne znát tohoto člověka
                 Každé čtení ho dále formuje
                 Tree of Life ekosystém

Premium          vše jako Standard + hlubší vrstvy (TBD)
```

**Monetizační argument:** Standard neprodává "neomezená čtení" — prodává vztah.
*"Rúnar tě začne znát. Čím déle zůstaneš, tím hlubší ten vztah je."*
Teaser pro RS (vidí název, ne výklad) vytváří přirozený pull k upgradu.

---

### Zakládací rituál — vznik stromu

Vědomý akt — uživatel se vědomě rozhodne. Klikne → iniciuje vznik stromu.

```
Session 1:  Trojice (3 runy)  →  první kořen  =  KDO JSI V JÁDRU
Session 2:  1 runa             →  druhý kořen  =  KTERÝM SMĚREM SE TVŮj STROM SKLÁNÍ
Session 3:  1 runa             →  třetí kořen  =  CO POHÁNÍ TVŮJ RŮST
```

- Timing: volný — záleží na uživateli, žádné minimum mezi sessions
- Session 1 = Trojice (existuje ve V2 labu) ✓
- Rúnar nedostane jiný typ otázky — dostane jiný **prompt framing** (jiná dimenze)
- Po Session 3: strom poprvé viditelně stojí

**Gating:**
```
Rune Seeker:      platí per runa — Session 1 = 3 kredity, S2 = 1, S3 = 1 → celkem 5 kreditů
Standard/Premium: zdarma, ale rituál stále vědomě iniciují
```

---

### Fáze výstavby

```
Fáze 0:  Life runa do system promptu readeru (V2 lab → produkce)
         Standard/Premium + DOB → calcLifeRune() → context block v system promptu
         Rúnar okamžitě personalizován. Žádná nová stránka, žádná nová tabulka.

Fáze 1:  runar-tree.html — life rune reveal
         Uživatel vidí svou life runu + textový výklad (generovaný Claudem, bez ElevenLabs)
         Tlačítko "Plant your tree" (zakládací rituál)

Fáze 2:  Zakládací rituál — 3 sessions, tři kořeny
         tree_state tabulka + founding_status stavový automat
         Po session 3: první textový popis stromu (Rúnarův prose)

Fáze 3:  Každé čtení = větev
         branch_data deterministicky (bez druhého Claude volání)
         element_scores v tree_state se aktualizují

Fáze 4:  Vizuální strom — SVG nebo generativní
         Až po 10+ uživatelích s reálnými daty. Text prose = 80% dopadu za 5% práce.
```

---

### DB schéma — plánováno (minimální, přidávat až potřeba)

```sql
TABLE: tree_state
  user_id          uuid (FK → user_profiles)
  life_rune        int (1–24)            ← index do RUNES[]
  founding_status  text                  ← 'none'|'session_1'|'session_2'|'complete'
  roots            jsonb                 ← 3 kořeny po rituálu
  element_scores   jsonb                 ← {fire: 0, water: 0, air: 0, earth: 0}
  trunk_themes     jsonb                 ← akumulace z opakujících se vzorců
  last_updated     timestamptz

TABLE: tree_readings
  id               uuid
  user_id          uuid (FK)
  reading_id       uuid (FK → readings)  ← readings tabulka beze změny
  branch_data      jsonb                 ← direction, element, length, aett
  founding_session int nullable          ← 1/2/3 pokud součást rituálu
  created_at       timestamptz
```

**Readings tabulka zůstane beze změny** — tree_readings ji jen referencuje.

---

### Branch data — deterministický výpočet (bez Claude)

```
Vstupy:
  Rune element (fixní)          → Fire/Water/Air/Earth barva větve
  Rune Ætt (1./2./3.)           → výška větve (nízká/střední/vysoká)
  Area of Life                  → směr (levá = vnitřní, pravá = vnější)
  Seeking                       → hloubkový multiplikátor (×1.0 až ×1.5)
  Feeling                       → emocionální baseline
  Time axis                     → temporal framing
  Počet vyplněných polí         → celková váha větve (0→×1.0, 1-2→×1.5, 3+→×2.0)

Hodnoty jsou orientační — testovat a upravovat na reálných datech.
```

---

## ⚠️ KRITICKÁ UPOZORNĚNÍ — NEOPAKOVAT TYTO CHYBY

### 1. Neskrývat `reader-content` (reader-form) — NIKDY
`updateAuthUI()` v minulosti nastavoval `content.style.display = 'none'` když se vyčerpaly
trial nebo měsíční sloty. Toto bylo CHYBNÉ chování, které nebylo nikdy požadováno.

**Správné chování:**
- `reader-content` je VŽDY viditelný — bez výjimky
- Tier bannery (`trial-banner`, `free-user-banner`) jsou informační a zobrazí "0 zbývá + CTA"
- `auth-gate` a `upgrade-gate` jsou NEPOUŽÍVÁNY — nikdy je nenastavuj na `display:block`
- `startReading()` blokuje jen rune_seeker u kterého jsou vyčerpány VŠECHNY sloty (monthly + credits)
- Standard / Premium / Admin: nikdy blokovat

### 2. Limit check musí zohledňovat tier a use_credit
Starý kód blokoval VŠECHNY přihlášené uživatele (i premium/admin) když `getFreeMonthCount() >= 5`.
Správná podmínka (frontend pre-check):
```js
if (currentUser && userTier === 'rune_seeker'
    && getFreeMonthCount(currentUser.id) >= FREE_REGISTERED_LIMIT
    && userCredits <= 0) { ... return; }
```
Standard/Premium jsou vždy propuštěni bez kontroly počítadla.

**Weekly drip (server-side):** claude-proxy vrací `weekly_limit` (402) pokud RS vyčerpal
týdenní kvótu (3 v prvních 7 dnech / 1 poté). Frontend zpracovává v callProxy i generateWhispersReading.
Chybová hláška: "The stones rest until Monday. Use a reading gift card to continue."

### 3. Audio player — NIKDY nativní `<audio controls>`
Nativní browser controls nelze plně stylovat v Chrome/Safari.
**Všechny audio playery v appce používají custom CAP systém:**
- Hlavní reading: `capToggle()`, `capSeek()`, `capMute()` — fixed IDs (`runar-audio`, `cap-*`)
- The Gathering: `wcapToggle()`, `wcapSeek()` — fixed IDs (`whispers-audio`, `wcap-*`)
- Sekundární (collection + journal): `_makeCapPlayer(prefix, src)` + `_capWire(prefix, doPlay)`
  - collection: prefix `'coll'`
  - journal záznam i: prefix `'j'+i`

### 4. Service Worker — musí mít network-first pro HTML
Pokud SW slouží HTML z cache (cache-first), uživatelé nevidí aktualizace.
SW cache name: `runar-v4` (aktuální) — při přidání nových souborů nebo změně strategie bumpi verzi.
HTML pages: network-first vždy. JS/CSS/icons: cache-first OK.
Nové JS/CSS soubory přidat do `JS_SHELL` v `sw.js`.

### 5. Edit tool a curly quotes — JS změny přes Python
Edit tool v Claude Code mění straight apostrofy `'` (U+0027) na curly `'`/`'` (U+2018/U+2019).
V JS to způsobí SyntaxError.
- **`runar-app.js`** — PYTHON SKRIPTY (obsahuje JS)
- **`runar-reader.css`** — Edit tool OK (čisté CSS, žádné apostrofy v hodnotách)
- **`runar-translations.js`** — Edit tool OK (hodnoty v dvojitých uvozovkách)
- **`runar-reader.html`** — Edit tool OK (čistá HTML struktura bez inline JS)
Python skripty ukládat v `C:\Users\zkuku\Downloads\Runar-admin\`.

---

## Word Corrections — snapshot (runar_corrections DB)
Živá data: `python show_corrections.py` — tento seznam aktualizovat při každé nové korekci.

| Scope | Původní | → Oprava | Kontext |
|-------|---------|----------|---------|
| IS | "Arctic ljósið" | "Norðurljósin" | |
| IS | "þrönga gljúfur" | "þröngt gljúfur" | |
| IS | "hljómar um það" | "Talar um það" | Þegar talað er um Gebo |
| IS | "líkaminn þreytur" | "líkaminn þreyttur" | |
| IS | "Hvað hefur þú verið að halda innan þín sem þarf að renna út í heiminn?" | "Hvað innra með þér vill nú fá að stíga fram í ljósið?" | Þegar talað er um Fehu |
| IS | "biðlar" | "biður" | |
| IS | "hvar hefur orkan þín farið í land sem þornar?" | "Hvar í lífi þínu hefur orkan runnið í þurran jarðveg?" | |
| IS | "en veistu í raun að það er ekki" | "en þú veist í raun að það er ekki" | |
| IS | Mótaðu rödd hans. Fæða visku hans. | Mótaðu rödd hans. Fóðraðu hann af visku. | UI sub text (translations.js) |
| IS | Velkomin | Gaman að sjá þig | uvítání ve všech místech |

---

## Hotovo ✅ (session 2026-05-30 — část 2: refaktoring + Tree of Life features)

- [x] **Visitor Journal gate** — tab viditelný pro všechny, gate s Rúnarovým textem
- [x] **`.rs-link` šablona** — gold "Rune Seeker" text, aplikována na všechna místa
- [x] **ᚱ pravidlo** — vždy zlatá, nikdy ◌ ᚱ ◌
- [x] **IS text quality automation** — `applyISCorrections(text, lang, corrections)` post-processor na všech 3 Claude voláních
- [x] **SyntaxError fix** — `buildLifeRunePromptIS/EN` přepsány s `\n` místo literal newlines
- [x] **Tree of Life DOB inputs** — pole Day/Month/Year v Tree tabu (kopie z readeru), `setTreeDOB()`, ukládá do DB
- [x] **Tree name** — `saveTreeName()`, ukládá `tree_name` do user_profiles
- [x] **Tree intro text** — Yggdrasil příběh v Rúnarově hlasu (Yggdrasil + "The ground is here. The stillness is ready.")
- [x] **SQL migrace** — `dob_day, dob_month, dob_year, tree_name` do user_profiles (spustit manuálně)
- [x] **Architektonický audit** — AUDIT_REPORT.md vytvořen, 6 fází
- [x] **ARCHITECTURE.md** — živá dokumentace vyplněna (vrstvy, pravidla, anti-patterny, tech dluh)
- [x] **Refaktoring #2** — `buildSysPrompt(c, lang)`, `getCorrPrompt(lang, corrections)`, `applyISCorrections(text, lang, corrections)` — žádné globály
- [x] **Refaktoring #3** — fire-and-forget DB zápisy opraveny (lang, DOB, tree_name + catch)
- [x] **Refaktoring #4** — magic timeout hodnoty → pojmenované konstanty (DELAY_*, DURATION_*)
- [x] **Memory systém** — snapshots/, MEMORY.md, working-style.md, pre/post-compact protokol

## Hotovo ✅ (session 2026-05-30 — Tree of Life design)

- [x] **Tree of Life ecosystem** — kompletní architektura navržena a zdokumentována
  - Samostatná stránka `runar-tree.html` — reader zůstane beze změny
  - Life runa = 5. element, fixní, celý obraz člověka hned od začátku (ne semeno)
  - Life rune výklad = generovaný Claudem individuálně, text only, bez ElevenLabs
  - Rúnarova transformace: jakmile zná life runu → stává se průvodcem konkrétního člověka
  - Tier model: Visitor nic | RS teaser (symbol+jméno) | Standard plný výklad + Tree
  - Monetizační argument: Standard = vztah, ne jen "unlimited čtení"
- [x] **Zakládací rituál** — 3 sessions, volný timing
  - Session 1 (Trojice) → KDO JSI V JÁDRU
  - Session 2 (1 runa) → KTERÝM SMĚREM SE SKLÁNÍŠ
  - Session 3 (1 runa) → CO POHÁNÍ TVŮJ RŮST
  - RS platí per runa (celkem 5 kreditů), Standard/Premium zdarma
- [x] **Branch data = deterministický výpočet** — žádné druhé Claude volání
- [x] **DB schéma** — minimální: tree_state + tree_readings (readings beze změny)
- [x] **Fáze výstavby 0–4** zdokumentovány v CLAUDE.md
- [x] **V2 lab strategie** — Fáze 0 (system prompt) jde přímo do produkce,
  Tree features se vyvíjejí přímo v `runar-tree.html` (ne v shrine labu)
- [x] **Referenční dokumenty** uloženy:
  - `runar_prereading_context_EN.md` — pre-reading context systém
  - `runar_tree_story.md` — příběh stromu (Rúnarův hlas)
  - `GEBO_runar_life_rune_EN.md` — referenční styl life rune výkladu
  - `runar_sigrún_ansuz_EN.md` — personalizovaný výklad (jméno + datum)

## Hotovo ✅ (session 2026-05-29 — Balance systém + UX copy)

- [x] **Balance systém** — single source of truth pro tier limity
  - `TIER_LIMITS` + `SPREAD_COSTS` přidány do `runar-config.js`
  - Visitor: 1 čtení (bylo 3), DOB field locked/teaser pro Visitora
  - Rune Seeker: free_balance DB sloupec, onboarding=3, weekly drip +1 v pondělí if balance=0
  - Free readings: POUZE single rune; spreads (3+) vždy kredity
  - Area of Life + Seeking: locked bez kreditů (free reading = basic)
  - `FREE_TRIAL_LIMIT` + `FREE_REGISTERED_LIMIT` čtou z `TIER_LIMITS`
  - Všechny texty přepsány: "five readings/month" → "3 to begin, then one each week"
  - SQL migrace: `free_balance` + `drip_week` do `user_profiles` ✅ spuštěno
  - claude-proxy: balance logika + Monday drip nasazeno
  - `TIER_LIMITS.md` — editovatelná tabulka pro správu limitů
- [x] **UX copy — unlock → unveil**
  - Area of Life + Seeking: "unlock" → "unveil" (Visitor)
  - RS bez kreditů: "unlocks all" → "unveils all"
  - The Gathering gate: "unlocks with Standard" → "opens with Standard"
  - Tier props: "unlocks all features" → "unveils all features"
  - Specific question teaser: "unlock" → "Deeper questions open with Standard"
- [x] **Visitor DOB field** — locked/disabled + teaser hint "Become a Rune Seeker to unveil your life rune"

## Hotovo ✅ (session 2026-05-28 — Vrstva D)
- [x] **3 READINGS (Trojice) — V2 lab** — implementován jako unified výklad
  - HTML: `spread3-output` přepsán na 1 blok (`#s3-out`, `#s3-trojice-lbl` s glyfy run)
  - `_generateSpread3Reading()`: nový Trojice prompt — Rúnar vybírá variantu automaticky
  - `_saveSpread3Reading()`: unified text, `spread_data` = rune positions (bez split textu)
  - `generateVoice()`: čte z `#s3-out` místo 3 elementů
  - `runar-config.js`: `spread_3` mode přidán (max_tokens: 900, active: true)
  - `runar-translations.js`: spread3 klíče přidány (EN + IS)
- [x] **Trojice design rozhodnutí** — zdokumentováno v runar_system_design.md:
  - Výstup: 1 celistvý organický text, 900 tokenů, žádné position labels
  - Výběr varianty: Rúnar automaticky (na základě Area + Seeking + Feeling + This reading is for)
  - Voice Scale platí stejně jako pro single reading
  - Strom = přirozená etapa od Rune Seeker (ne side produkt)
  - Každé čtení → strom automaticky; skip option = Standard/Premium (pro čtení pro jiného)
  - Rituální mapa potvrzena (1 runa → uzel · 3 runy → větev · 5 kříž → silná větev · B → kmen · C → kořeny)

## Hotovo ✅ (session 2026-05-26)
- [x] **Weekly drip systém** — nový mechanismus pro Rune Seeker (místo 5/měsíc):
  - První 7 dní účtu: 3 čtení/týden (engagement bonus)
  - Po 7 dnech: 1 čtení/týden
  - Monthly cap: 5 (credits_used=false)
  - credits_used=true (Reading Gift Card): bypass všech limitů
- [x] **claude-proxy** — `mode` param přidán, `ceremonial` bypass, weekly drip enforcement
  - Týdenní kvóta počítána od pondělí (UTC), filtr `credits_used=false`
  - `user_profiles.created_at` pro detekci prvních 7 dní
  - Error `weekly_limit` (402): "The stones rest until Monday. Use a reading gift card to continue."
- [x] **The Gathering** — Rune Seeker: 1× zdarma, pak "The Gathering unlocks with Standard."
  - `isGatheringEverUsed` = `_journalCache.some(e => e.rune_name === 'THE GATHERING')`
  - Backend ceremonial bypass: weekly/monthly limity se na Gathering nevztahují
- [x] **runar-app.js** — `weekly_limit` zpracován v callProxy error handling
  - Nová větev `isGatheringEverUsed` v `updateWhispersUI()` pro RS po 1. Gathering
- [x] CLAUDE.md aktualizován (tier systém, The Gathering pravidla, Edge Function dokumentace)

## Hotovo ✅ (session 2026-05-25 — část 2)
- [x] IS audit: 13 oprav — gramatika, překlepy, nekonzistentní imperativy (native speaker verze)
- [x] IS uvítání: `Velkomin` → `Gaman að sjá þig` / `Gaman að sjá þig aftur` (všechna místa)
- [x] Sign-in toast: přidána IS verze `✦ GAMAN AÐ SJÁ ÞIG · RÚNAR BÍÐUR`
- [x] EN uvítání: `Welcome` → `Good to see you` / `Good to see you again`
- [x] `show_corrections.py` — live query Supabase runar_corrections (anon key)
- [x] CLAUDE.md: Word Corrections snapshot + pravidlo spouštět před IS změnami
- [x] CLAUDE.md: workflow pro mockupy a features (textové návrhy, ne HTML)
- [x] Visitor: Area of Life + What are you seeking — ztlumené, neklikatelné
- [x] Visitor: hint `· Become a Rune Seeker to unlock` (bez odkazu, jen text)
- [x] Visitor: skryto `(OPTIONAL)` u Area of Life a What are you seeking
- [x] DOB label: hint `· to reveal your life rune` pro všechny uživatele
- [x] Rune Seeker (0 kreditů): Area of Life — první 3 odemčeny, zbytek locked
- [x] Rune Seeker (0 kreditů): What are you seeking — jen General Guidance odemčen
- [x] Rune Seeker (kredity > 0): vše odemčeno automaticky
- [x] Hint pro RS bez kreditů: `· Reading Gift Card unlocks all` (EN) / `· Reading Gift Card opnar allt` (IS)
- [x] The Gathering: zrušena platba kredity — zdarma pro všechny přihlášené
- [x] The Gathering: podmínky zachovány — min. 3 čtení + 1× týdně (localStorage)
- [x] Rune Seeker side panel: `5 Readings / month.` + `Reading Gift Card unlocks all features.`
- [x] CLAUDE.md: pill lock pravidlo zdokumentováno

### Pill lock pravidla (runar-app.js)
```
Visitor       (!currentUser):              area-pills + seek-pills → .pills-locked (celý container)
                                           hint: · Become a Rune Seeker to unlock
RS 0 kreditů  (rune_seeker && credits≤0): první 3 area + první 1 seek → .pill-locked (individuální)
                                           hint: · Reading Gift Card unlocks all
RS s kredity  (rune_seeker && credits>0): vše odemčeno
Standard/Premium/Admin:                   vše odemčeno
```
Implementace: `buildPills()` → `buildPillGroup(id, items, type, unlockedCount)`
`unlockedCount=3` pro area, `unlockedCount=1` pro seek u RS bez kreditů.

### The Gathering pravidla
```
Podmínky přístupu:
  Standard/Premium: min. GATHERING_MIN=3 čtení + max. 1×/týden (localStorage)
  Rune Seeker:      min. GATHERING_MIN=3 čtení + právě 1× zdarma celkem
                    Po 1. použití: "The Gathering unlocks with Standard."
                    Detekce: _journalCache.some(e => e.rune_name === 'THE GATHERING')

Cena: ZDARMA (use_credit: false, mode: 'ceremonial')
  → Backend ceremonial bypass: žádné weekly/monthly limity se neaplikují
  → Frontend RS limit: isGatheringEverUsed check v updateWhispersUI()

GATHERING_CREDITS konstanta: ODSTRANĚNA
```

---

## Hotovo ✅ (session 2026-05-25)
- [x] Loading animace: blinkající cursor bary odstraněny
- [x] Loading animace: `layer1-lbl` / `layer2-lbl` pulsují (pulse-fade 1.4s) během AI generování
- [x] Loading text: "RÚNAR READS THE THREADS…" → "THE STONES SPEAK IN SILENCE…" (EN) / "STEINARNIR TALA Í ÞAGNINNI…" (IS)
- [x] stream() funkce: cursor odstraněn, text se appenduje čistě bez blikající lišty
- [x] Reading button: "LET RÚNAR SPEAK" → "HEAR RÚNAR SPEAK" — přes `speak_btn` v `runar-translations.js`
- [x] Text audit: 4 mezery opraveny — `sp-delete-account`, `redeem-btn`, `auth-modal-sub`, `auth-consent-txt` nyní přes `updateUIText()`
- [x] Dead code odstraněn: duplicitní přepis `name-card-title` v `showNamePrompt()`
- [x] CLAUDE.md: sekce INVARIANTY přidána jako první věc v souboru
- [x] **Architekturální split** — `runar-reader.html` (3710 ř.) rozdělen:
  - `runar-reader.css` — 603 řádků CSS (Edit tool OK)
  - `runar-app.js` — 2555 řádků JS (Python skripty)
  - `runar-reader.html` — 563 řádků čistá HTML struktura
- [x] SW bumpen: `runar-v3` → `runar-v4`, nové soubory přidány do JS_SHELL
- [x] Commit disciplína: každá změna = separátní commit (5 commitů dnes)

## Hotovo ✅ (session 2026-05-24 — část 2)
- [x] The Gathering: Rune Seeker má přístup za 3 kredity (GATHERING_CREDITS = 3)
- [x] The Gathering: 402 error správně ošetřen + cost text viditelný pro Rune Seeker
- [x] GDPR: privacy consent checkbox v auth modalu
- [x] GDPR: first-visit privacy banner (localStorage `privacy_seen`)
- [x] Side panel YOUR PATH: collapsible toggle, přesunuto pod username
- [x] Side panel YOUR PATH: dynamický render per tier (_renderYourPath)
- [x] HIGHER PATH sekce: zobrazí tiery nad aktuálním + UPGRADE button uvnitř
- [x] Topbar dropdown: klik na username → tier, email, readings + reset datum
- [x] updateDropdown() + toggleDropdown() — zavírá se klikem mimo
- [x] sp-email + sp-balance přesunuto z side panelu do topbar dropdownu
- [x] Loading animace: pulsující ᚱ overlay v reading tabu během AI generování
- [x] Voice button: "HEAR RÚNAR SPEAK" (dříve "RÚNAR'S VOICE")
- [x] Sdílená .btn-upgrade třída — jednotný hover efekt pro všechna upgrade CTA
- [x] BECOME A RUNE SEEKER → na obou místech (šipka + gold fill hover)
- [x] Custom CAP player v collection modalu (nahrazuje nativní audio controls)
- [x] Custom CAP player v journal záznamu (nahrazuje nativní audio controls)
- [x] _makeCapPlayer + _capWire — generický prefix-based systém

## Hotovo ✅ (session 2026-05-24 — část 1)
- [x] Fix: reader-content nikdy neskrývat — form vždy viditelný
- [x] Fix: monthly limit check nyní zohledňuje tier (Standard/Premium nepodléhají)
- [x] Fix: startReading() otevírá auth modal když visitor vyčerpal trial
- [x] Fix: auto-reload po sign-out (1.2s delay po "YOU HAVE LEFT THE CIRCLE" toastu)
- [x] Fix: getSession() wrappnut v try/catch — crash DOMContentLoaded nehrozí
- [x] Fix: sendMagicLink() rate-limit error navrhuje Google přihlášení jako fallback
- [x] Fix: SW bumpen na v3 + controllerchange auto-reload pro stale cache
- [x] Fix: ?reset_trial=1 URL param pro reset visitor trial counteru (admin testování)
- [x] Feat: custom amber audio player — play/pause, seek bar (16px thumb), mute, čas

## Hotovo ✅ (session 2026-05-21)
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
