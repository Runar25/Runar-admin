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
runar-config.js        ← SB_URL, SB_KEY, PROXY, EL_PROXY, EL_STATIC,
                          EL_VOICE_ID_EN, EL_VOICE_ID_IS, elVoiceId()
runar-runes.js         ← 25 Elder Futhark + Blank, AREAS, SEEKS, calcLifeRune()
runar-character.js     ← DEF_CHAR_EN, DEF_CHAR_IS, buildSysPrompt()
runar-translations.js  ← UI_TEXT { en, is }
runar-svgs.js          ← RUNE_SVGS (SVG glyfů)
```

## Edge Functions (`/supabase/functions/`)
```
claude-proxy           ← forwards to Claude API
elevenlabs-proxy       ← real-time TTS, vrací base64 → Blob URL
elevenlabs-static      ← admin: generuje + ukládá MP3 do Storage
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
                          sloupce: id (= auth.users.id), email, name, dob_d/m/y,
                                   lang, life_rune, tier, shopify_customer_id,
                                   created_at, updated_at
readings               ← každé čtení uživatele (RLS ✓)
                          sloupce: id, user_id, rune_name, rune_glyph, lang,
                                   short_text, deep_text, area, seeking, question,
                                   drawn_at
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

## Klíčová rozhodnutí
- Poetický hlas Rúnara — žádný tech žargon v UI, nikdy
- Dva jazyky — EN a IS jsou samostatné výklady, ne překlady
- EN app → EN hlas, IS app → IS hlas (žádný překlad)
- Statické audio = pre-generované MP3 v Storage (free tier, nulové náklady)
- Dynamické audio = real-time ElevenLabs (placený tier, ephemeral blob)
- Verzování: každý save = nová verze (fehu_1, fehu_2...), MAX(version) pro určení další
- Reader tab: po tažení runy auto-přehraje náhodnou verzi static audio
- Admin schvalování zrušeno — admin generuje a ukládá přímo
- base64 → Blob URL pro audio player (funguje ve všech prohlížečích)
- Character tab odstraněn z UI — charakter se edituje v runar-character.js
- Supabase RLS: každý uživatel vidí jen svá vlastní data (auth.uid() = user_id)
- Shopify integrace: zákazník Agndofa shopu = uživatel Rúnara (propojení přes email + shopify_customer_id)

## Bezpečnost & GDPR
Island je člen EEA → platí plné GDPR. Zpracování osobních dat:

| Data | Právní základ |
|------|---------------|
| Email | Smlouva (ToS při registraci) |
| Jméno, DOB | Souhlas — volitelné pole, uživatel zadává sám |
| Runové výklady | Smlouva — součást poskytované služby |

**Co je hotovo:**
- [x] Supabase region: eu-west-1 (Irsko) — data fyzicky v EU
- [x] RLS na user_profiles a readings — uživatel vidí jen svá data
- [x] ON DELETE CASCADE — smazání účtu smaže vše (právo na výmaz)
- [x] Citlivé API klíče pouze v Edge Functions, nikdy ve frontendu

**Co zbývá (před ostrým spuštěním):**
- [ ] DPA (Data Processing Agreement) se Supabase — podepsat v Supabase Dashboard → Settings → Legal
- [ ] Privacy Policy — EN + IS, odkaz v footeru readeru i na webu agndofa.is
- [ ] Delete account funkce v readeru — tlačítko v profilu, volá `auth.admin.deleteUser()` přes Edge Function
- [ ] Shopify: zákazníci Agndofa shopu jako uživatelé Rúnara (viz Shopify integrace níže)

## Shopify integrace (plán — Vrstva 3)
Cíl: jeden zákazník, jeden záznam. Platba proběhne v Agndofa Shopify shopu, tier se automaticky přidělí v Rúnarovi.

**Flow:**
```
Zákazník koupí "Standard" na agndofa.is (Shopify)
→ Shopify webhook orders/paid → Edge Function shopify-webhook
→ Funkce ověří HMAC signature (bezpečnost)
→ Najde user_profiles WHERE email = zákazníkův email
→ Nastaví tier = 'standard', uloží shopify_customer_id
→ Uživatel otevře Rúnar → má Standard tier
```

**Proč tohle funguje pro GDPR:**
- Shopify řeší platební data a PCI DSS — ty se o to nestaráš
- Souhlas s GDPR při nákupu v Shopify pokryje i Rúnara (musí být explicitně v ToS/Privacy Policy)
- Data v Rúnarovi (výklady, profil) zůstávají v EU (Supabase Irsko)
- Shopify Customer ID je jen referenční odkaz, ne duplikace citlivých dat

---

## ROADMAP v0.6 (2026-05-17)

### VRSTVA 0 — ZÁKLAD ✅ HOTOVO
- [x] Single HTML aplikace (runar-shrine.html + 5 JS modulů)
- [x] Supabase (knowledge_base, runar_character, runar_corrections, runar_static_audio, readings)
- [x] Claude proxy Edge Function
- [x] 25 run Elder Futhark + Blank (SVG glyfy)
- [x] EN + IS přepínač
- [x] Life rune kalkulace (datum narození)
- [x] Dvouvrstvý výklad (RÚNAR SPEAKS + DEEPER REFLECTION)
- [x] Word corrections systém (Supabase + localStorage fallback)
- [x] Character tab → nahrazen Progress tabem (grid 25 run × EN/IS stav)
- [x] Blank runa → zobrazuje tvar kamene (stejný jako ostatní runy, jen bez rytiny)

### VRSTVA 1 — HLAS ← AKTUÁLNÍ PRIORITA

#### 1A — Statické audio (25 run × 2 jazyky)
- [x] Supabase Storage bucket "runar-audio" (PUBLIC)
- [x] runar_static_audio tabulka (UNIQUE rune_name+lang+version)
- [x] elevenlabs-static Edge Function (generuj → Storage, verzované)
- [x] Teach Rúnar tab = admin generátor statického audia
- [x] IS: eleven_v3 hardcoded v Edge Function (spolehlivá islandština)
- [x] Verzování: každý save = nová verze (fehu_1.mp3, fehu_2.mp3...)
- [x] MAX(version) query — bezpečné přiřazení verze, nikdy nepřepíše
- [x] Teach tab: zobrazuje počet EN/IS verzí pro vybranou runu
- [x] Reader tab: auto-přehraje náhodnou verzi static audio po tažení runy
- [x] UX: "TEACH ANOTHER RUNE" místo auto-resetu
- [ ] Nahrát všech 25 × EN + 25 × IS run (zatím jen část)
- [ ] Progress tab: grid všech 25 run s EN/IS stavem (kolik verzí, chybí)

#### 1B — Dynamické audio (osobní výklady) ✅ HOTOVO
- [x] elevenlabs-proxy Edge Function (real-time TTS)
- [x] base64 → Blob URL (audio player funguje ve všech prohlížečích)
- [x] EN/IS hlas + model podle aktivního jazyka
- [x] "GENERATE RÚNAR'S VOICE" v Reader tabu
- [x] Loading stav + error handling
- [x] Audio player — Rúnarova barva (#2E4A70 gradient, ne černá)

#### 1C — Admin nástroj ✅ HOTOVO
- [x] Integrován v Teach Rúnar tabu
- [x] Generate → edit → preview hlas → save flow
- [x] Editovatelný text před uložením hlasu
- [x] Preview hlasu PŘED uložením
- [x] Google OAuth pro admin přihlášení (shrine)

### VRSTVA 1.5 — UX & VIZUÁL ✅ HOTOVO (2026-05-16/17)
Tato vrstva vznikla organicky — solidní základ před spuštěním Vrstvy 2.

- [x] **Redesign runar-reader.html** — hero sekce, topbar, Sacred Color Palette
  - Hero: dvousloupcový layout (portrét vlevo, text vpravo)
  - Topbar: sticky, blur, brand + lang toggle + auth badge
  - Hero collapse: plynulá animace při začátku čtení (max-height transition)
- [x] **Portrét Rúnara** — runar-portrait.png v `v2/assets/`
  - object-fit:contain + object-position:center bottom (celá postava včetně ruky)
  - mask-image radial gradient — vignette, bílé pozadí zmizí přirozeně
- [x] **Vizuální assety** — uloženy v `v2/assets/` (portrait, fullbody, travel, ceremonial, expressions, sacred-palette, moodboard)
- [x] **IS jazyková kompletnost** — všechny UI řetězce přeloženy
  - SIGN IN/OUT → SKRÁ INN/ÚT
  - Trial banner, auth gate, hero quote, eyebrow, trial-end prompt
- [x] **Trial gate UX** — čtení proběhne celé, join výzva se objeví 8s po dokončení streamu
- [x] **Google OAuth** — shrine + reader, redirectTo na GitHub Pages
  - Supabase URL Configuration: Site URL = `https://runar25.github.io`
  - Google Cloud Console: OAuth client, External + In production
  - Resend.com SMTP pro magic link (bypass 2/hod limit)
- [x] **Free tier reading counter** (2026-05-17)
  - Banner pro přihlášené uživatele: "X of 5 readings remaining this month"
  - localStorage klíčovaný userId + YYYY-MM (automatický reset každý měsíc)
  - Barevná signalizace: teal → gold (1 zbývá) → červená (vyčerpáno)
  - Upgrade gate po vyčerpání (tlačítko disabled, "Coming Soon")
  - IS překlady pro banner i gate
  - Soft gate: nespustí se uprostřed čtení, respektuje outputVisible check

### VRSTVA 2 — AUTH & UŽIVATELSKÝ ÚČET ✅ HOTOVO
- [x] Supabase Auth — magic link
- [x] Google OAuth (shrine + reader, redirectTo GitHub Pages)
- [x] `user_profiles` tabulka — RLS, upsert při přihlášení, shopify_customer_id připraveno
- [x] `readings` tabulka — RLS, insert po každém čtení, index na user_id + drawn_at
- [x] Monthly counter synchronizován z DB (syncMonthlyCount → localStorage seed)
- [x] Deník — posledních 5 výkladů, skládací panel, IS překlady
- [x] Runes Collection tab — grid 25 run, audio dostupnost, inline detail + přehrávač
- [ ] **Delete account** — tlačítko v UI, Edge Function která zavolá auth.admin.deleteUser() (GDPR)
- [ ] **Anonymní migrace** — po registraci přenést trial výklady do readings (nice-to-have)

### VRSTVA 3 — MONETIZACE ← DALŠÍ PRIORITA
Tiers definovány v `runar-config.js` → `TIERS`. Frontend gate hotov, backend zatím nevynucuje.
**Platba výhradně přes Shopify** (agndofa.is) — žádný Stripe. Webhook → Supabase Edge Function → credit/tier update.

#### Platební model — Credits přes fyzickou kartu
Klíčové rozhodnutí (2026-05-18): **credits se kupují jako fyzický produkt v Agndofa shopu.**
- Fyzická karta Rúnara = gift card + reklamní karta + součást Agndofa brandu (kakao, runové sady)
- Karta má unikátní kód (vytištěný nebo QR)
- Zákazník koupí kartu v obchodě nebo ji dostane jako dárek / součást produktu
- Zadá kód v Rúnar appce → dostane credits na účet
- Credits nevyprší, fungují across devices

**Flow fyzická karta → credits:**
```
Admin vygeneruje batch kódů v Supabase (gift_codes tabulka)
→ Kódy se vytisknou na fyzické kartičky Rúnara
→ Zákazník koupí kartu (v Agndofa shopu nebo fyzicky s kakaem)
→ Zákazník zadá kód v Rúnar app → Edge Function ověří kód
→ Kód označen jako použitý, user dostane N credits
→ Credits se odečítají za každé čtení (nebo jiný premium úkon)
```

**Shopify webhook (pro digitální nákup přímo v shopu):**
```
Zákazník koupí credits online na agndofa.is
→ Shopify webhook orders/paid → shopify-webhook Edge Function
→ Ověření HMAC podpisu → update user_profiles.credits_balance
```

| Tier | Výklady | Dynamický hlas | Deník | Runes Collection |
|------|---------|----------------|-------|-----------------|
| FREE TRIAL (anon) | 3 celkem | ❌ | ❌ | ✅ (jen poslech) |
| FREE (účet) | 5/měsíc | ❌ | 5 posledních | ✅ |
| CREDITS | 1 credit = 1 čtení | ✅ | unlimited | ✅ |
| STANDARD | neomezené | ✅ | unlimited | ✅ |
| PREMIUM | neomezené | ✅ | unlimited | ✅ + ceremonial |

**Co postavit:**
- [ ] **`gift_codes` tabulka** — `code` (unique), `credits`, `used_by`, `used_at`, `created_at`
- [ ] **`credits_balance` sloupec** v user_profiles (nebo samostatná tabulka transakcí)
- [ ] **`redeem-code` Edge Function** — ověří kód, přidá credits, označí jako použitý
- [ ] **Redemption UI** v readeru — pole pro zadání kódu, potvrzení
- [ ] **Admin: batch generátor kódů** v shrine (kolik kódů × kolik creditů)
- [ ] **Shopify webhook** Edge Function (`shopify-webhook`) — pro online nákup
- [ ] **Backend enforcement** v claude-proxy — ověřit credits/tier před každým čtením
- [ ] **Feature gates v UI** — upgrade CTA pro zamčené funkce
- [ ] **Privacy Policy** EN + IS — odkaz v readeru + agndofa.is
- [ ] **DPA se Supabase** — Settings → Legal v Supabase Dashboard

#### Fyzická karta — design brief (zatím jen myšlenky)
- Formát: vizitka nebo menší (snadno do peněženky / přibalení k kakau)
- Přední strana: Rúnar vizuál, Agndofa brand, runa
- Zadní strana: kód (nebo QR → deeplink do app s předvyplněným kódem)
- Použití: dárkové balení kakaa, runové sady, standalone gift card v shopu
- Idea: různé runy na různých kartách (Fehu = bohatství, Berkana = nový začátek...)

### VRSTVA 4 — CEREMONIAL MODE (Premium)
- [ ] Oddělený system prompt
- [ ] Guided ritual flow (5 kroků)
- [ ] Ambience audio loop
- [ ] Premium-only gate

### VRSTVA 5 — KONTEXTOVÁ INTELIGENCE
- [ ] Časový kontext v promptu (ráno/večer, roční období, Island TZ)
- [ ] Lunární kalendář (fáze měsíce)
- [ ] Sezónní události (slunovraty, Þorrablót)

### VRSTVA 6 — PAMĚŤ & PERSONALIZACE
- [ ] Injektování posledních N výkladů do promptu
- [ ] Multi-rune layouts (3 runy, Norský kříž)
- [ ] Konverzační follow-up

### VRSTVA 7 — FYZICKÝ EKOSYSTÉM
Fyzické produkty Agndofa jako vstupní bod do Rúnara.

- [ ] **Rúnar gift card** — fyzická kartička s kódem (viz Vrstva 3 design brief)
- [ ] **QR deeplink** na kartě → otevře reader s předvyplněným redemption kódem
- [ ] **Runové sady** — každá sada obsahuje Rúnar kartu s credits
- [ ] **Kakao ceremonial kit** — Rúnar karta přibalená k kakau (cross-sell)
- [ ] NFC tag → spustí ceremonial mode (budoucnost)
- [ ] Fyzický produkt vázaný na user účet (prémiový obsah při nákupu)

### TECHNICKÝ DLUH
- [ ] Real streaming přes SSE (místo fake setTimeout)
- [ ] Rate limiting v Edge Functions (ochrana před abuse)
- [ ] Cost monitoring per user (kolik Claude/EL tokenů kdo spotřeboval)
- [ ] Audio player redesign (aktuální #2E4A70 gradient "hruza" — custom controls)
- [ ] Frontend → Vite/React až řádků > 2000 (reader aktuálně ~1300)
- [ ] Delete account UI + Edge Function (GDPR právo na výmaz)
