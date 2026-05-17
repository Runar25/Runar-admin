# RÚNAR — Claude Code Context

## Co je Rúnar
AI-powered mystický průvodce runami pro značku Agndofa (Island). Rúnar má vlastní poetický hlas, charakter a filozofii. Budoucí centrum předplatného produktu s fyzickým ekosystémem (runové sady, kakao ceremonial).

## Stack
- **Frontend:** Single HTML soubor + vanilla JS/CSS, GitHub Pages
- **Backend:** Supabase (`pmitxjvkeovijreepror`) — PostgreSQL + Edge Functions + Storage
- **AI:** Claude API přes Supabase Edge Function proxy (`claude-proxy`)
- **Voice:** ElevenLabs API přes Supabase Edge Function proxy (`elevenlabs-proxy`)
- **Repo:** `runar25.github.io/Runar-admin/v2/`

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
readings               ← (připravena, zatím nepoužita — pro vrstvu 2)
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

---

## ROADMAP v0.5 (2026-05-17)

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

### VRSTVA 2 — AUTH & UŽIVATELSKÝ ÚČET ← DALŠÍ PRIORITA
- [x] Supabase Auth — magic link ✅
- [x] Google OAuth ✅
- [ ] **User profil tabulka** — `user_profiles` (id, email, name, dob_d, dob_m, dob_y, lang, life_rune, tier, created_at)
- [ ] **Tier sloupec** — `free | credits | standard | premium` (default: `free`)
- [ ] **readings tabulka** — ukládat každé čtení (user_id, rune_name, lang, short_text, deep_text, drawn_at)
- [ ] **Přesun counteru do DB** — místo localStorage (přesné, multi-device, backend-enforceable)
- [ ] **Anonymní migrace** — po registraci přenést trial výklady do readings tabulky
- [ ] **Základní deník** — zobrazit posledních 5 výkladů pro free uživatele

### VRSTVA 3 — MONETIZACE
Tiers definovány v `runar-config.js` → `TIERS`, frontend gate hotov, backend nevynucuje.

| Tier | Výklady | Dynamický hlas | Deník |
|------|---------|----------------|-------|
| FREE TRIAL (anon) | 3 celkem | ❌ | ❌ |
| FREE (účet) | 5/měsíc | ❌ | 5 posledních |
| CREDITS | balíčky (nevyprší) | ✅ | unlimited |
| STANDARD | neomezené | ✅ | unlimited |
| PREMIUM | neomezené | ✅ | ✅ + audio uložení |

- [ ] Stripe integrace (one-time + recurring)
- [ ] `user_entitlements` tabulka — vynucování na backendu (Edge Function)
- [ ] Feature gates v UI (viditelné, s upgrade CTA — tlačítka připravena)

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
- [ ] QR kód na runové sadě → unlock v aplikaci
- [ ] NFC tag → spustí ceremonial mode
- [ ] Fyzický produkt vázaný na user účet

### TECHNICKÝ DLUH
- [ ] Real streaming přes SSE (místo fake setTimeout)
- [ ] Progress tab: grid 25 run s EN/IS stavem (kolik verzí, chybí)
- [ ] Rate limiting v Edge Functions
- [ ] Cost monitoring per user
- [ ] Audio player redesign (aktuální #2E4A70 gradient funguje, ale není ideální)
- [ ] Frontend → Vite/React až řádků > 2000 (reader aktuálně ~1100)

---

## PLÁN NA DALŠÍ DEN (2026-05-18)

### Priorita 1 — Vrstva 2: User profil v Supabase (základ dat)

Cíl: přihlášený uživatel má svůj profil v DB, čtení se ukládají, counter přechází z localStorage do DB.

**Supabase SQL — spustit v SQL Editoru:**
```sql
-- User profily
CREATE TABLE user_profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text,
  name        text,
  dob_d       int, dob_m int, dob_y int,
  lang        text DEFAULT 'en',
  life_rune   text,
  tier        text DEFAULT 'free',
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own profile" ON user_profiles FOR ALL USING (auth.uid() = id);

-- Výklady (readings)
CREATE TABLE readings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  rune_name   text NOT NULL,
  rune_glyph  text,
  lang        text NOT NULL,
  short_text  text,
  deep_text   text,
  area        text,
  seeking     text,
  question    text,
  drawn_at    timestamptz DEFAULT now()
);
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own readings" ON readings FOR ALL USING (auth.uid() = user_id);
```

**Frontend (runar-reader.html):**
- [ ] Po přihlášení: `upsert` do `user_profiles` (jméno/lang si zapamatovat)
- [ ] Po každém čtení: `insert` do `readings`
- [ ] Monthly counter přečíst z DB místo localStorage: `count(*) WHERE user_id=X AND drawn_at >= start_of_month`
- [ ] Deník: sekce "MOJE VÝKLADY" — posledních 5 karet (runa, datum, krátký text)

### Priorita 2 — Progress tab v adminu (shrine)

Cíl: rychlý přehled co chybí nahrát (bez nutnosti pamatovat si).

**runar-shrine.html Progress tab:**
- [ ] Grid 25 run (24 Elder Futhark + Blank) × 2 jazyky
- [ ] Pro každou: počet EN verzí + počet IS verzí z `runar_static_audio`
- [ ] Barva: zelená (≥1), žlutá (pouze 1 verze — křehké), červená (0)
- [ ] Klik na runu → přepne na Teach tab + předvyplní runu

### Priorita 3 — Vyčistit audio player (estetika)

Uživatel označil current blue player za "hruzu". Rychlý redesign:
- [ ] Přidat textové ovládání místo native `<audio>` (play/pause tlačítko, progress bar, čas) — plná kontrola nad stylem
- [ ] Nebo: native `<audio>` s `appearance: none` + custom CSS overlay
- [ ] Zachovat Rúnarovu modrou paletu, ale elegantnější provedení

### Pořadí práce:
1. **SQL migrace** v Supabase → otestovat RLS
2. **user_profiles upsert** po přihlášení → zkontrolovat v Table Editor
3. **readings insert** po každém čtení → ověřit záznamy
4. **Monthly counter z DB** → nahradit localStorage logiku
5. **Deník sekce** v readeru → jednoduché karty
6. **Progress tab** v shrine
7. **(Volitelné)** Audio player redesign
