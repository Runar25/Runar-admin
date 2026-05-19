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
claude-proxy           ← forwards to Claude API, enforces credits tier (402 při 0)
elevenlabs-proxy       ← real-time TTS, vrací base64 → Blob URL
elevenlabs-static      ← admin: generuje + ukládá MP3 do Storage
redeem-code            ← (ZÍTRA) ověří gift code → přidá credits → tier = 'credits'
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
                                   drawn_at
gift_codes             ← (ZÍTRA vytvořit) kódy na fyzických kartičkách
                          sloupce: code (unique), credits, used_by, used_at, created_at
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
Visitor    (free_trial) → 3 čtení celkem, anon, jen Fehu v kolekci
The Curious (free)      → 5 čtení/měsíc, všech 25 run, no voice
Rune Seeker (credits)   → 1 credit = 1 čtení, dynamický hlas, never expire
Standard               → unlimited, dynamický hlas (coming soon)
Premium                → unlimited + ceremonial (coming soon)
```
Upgrade path: Visitor → The Curious (zdarma) → Rune Seeker (fyzická karta) → Standard → Premium

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

## Bezpečnost & GDPR
Island je člen EEA → platí plné GDPR.

**Co je hotovo:**
- [x] Supabase region: eu-west-1 (Irsko) — data fyzicky v EU
- [x] RLS na user_profiles a readings — uživatel vidí jen svá data
- [x] ON DELETE CASCADE — smazání účtu smaže vše (právo na výmaz)
- [x] Citlivé API klíče pouze v Edge Functions, nikdy ve frontendu

**Co zbývá (před ostrým spuštěním):**
- [ ] DPA (Data Processing Agreement) se Supabase — podepsat v Supabase Dashboard → Settings → Legal
- [ ] Privacy Policy — EN + IS, odkaz v footeru readeru i na webu agndofa.is
- [ ] Delete account funkce v readeru — tlačítko v profilu, volá `auth.admin.deleteUser()` přes Edge Function

---

## ROADMAP v0.7 (2026-05-19)

### VRSTVA 0 — ZÁKLAD ✅ HOTOVO

### VRSTVA 1 — HLAS ✅ PŘEVÁŽNĚ HOTOVO
- [x] Statické audio pipeline (ElevenLabs → Storage → Reader)
- [x] Dynamické audio (real-time TTS pro placené tiery)
- [x] Admin generátor v shrine
- [ ] Nahrát všech 25 × EN + 25 × IS run (zatím jen část)

### VRSTVA 1.5 — UX & VIZUÁL ✅ HOTOVO (2026-05-19)
- [x] Topbar: AGNDOFA + jméno/tier + hamburger menu
- [x] Side panel: tier v hlavičce, jazyk dole, account sekce
- [x] Barva: #FFBF00 globálně (bylo #D6A85C)
- [x] Hero mobile: eyebrow + title overlaid na portrét (position:absolute bottom:15%)
- [x] Hero desktop: runes řádek odstraněn
- [x] Hero subtitle: rotující fráze Rúnarova hlasu (12 EN, IS čeká na native review)
- [x] Name prompt modal: "Before the Runes Speak" — Rúnarův hlas
- [x] Tier notices v Reading tabu: Visitor (3 čtení) + The Curious (5/měsíc) s dynamickým počítadlem
- [x] Visitor gate v Collection: jen Fehu klikatelná, ostatní dimmed
- [x] Upgrade path: The Curious → Rune Seeker → Standard (coming soon)

### VRSTVA 2 — AUTH & UŽIVATELSKÝ ÚČET ✅ HOTOVO
- [x] Magic link + Google OAuth
- [x] user_profiles (RLS), readings (RLS)
- [x] Deník, Runes Collection
- [x] Language persistence (localStorage + user_profiles.lang)
- [ ] Delete account (GDPR)

### VRSTVA 3 — MONETIZACE ← ZÍTŘEJŠÍ PRIORITA

#### Co stavíme ZÍTRA (Rune Seeker komplet):

**1. SQL — gift_codes tabulka (5 min)**
```sql
CREATE TABLE gift_codes (
  code        text PRIMARY KEY,
  credits     integer NOT NULL DEFAULT 5,
  used_by     uuid REFERENCES auth.users(id),
  used_at     timestamptz,
  created_at  timestamptz DEFAULT now()
);
```

**2. Edge Function: redeem-code (30 min)**
```
POST { code } → ověří kód existuje + není použitý
→ UPDATE user_profiles SET credits_balance += N, tier = 'credits'
→ UPDATE gift_codes SET used_by, used_at
→ vrátí { credits_remaining }
```

**3. Reader: napojit redeem UI (15 min)**
- Tlačítko REDEEM volá `redeem-code` Edge Function
- Po úspěchu updatuje UI (balance, tier label)
- Error handling: kód neexistuje / již použit

**4. Shrine: admin generátor kódů (30 min)**
- Input: počet kódů × počet kreditů
- Generuje náhodné kódy (FEHU-XXXX-XXXX formát)
- Vkládá do gift_codes tabulky
- Export do CSV pro tisk na kartičky

#### Platební model
- Credits = fyzická karta Rúnara (gift card)
- Karta má kód → zákazník zadá v appce → dostane credits
- Credits nevyprší, fungují across devices
- 1 credit = 1 čtení s Rúnarovým hlasem

| Tier | Výklady | Dynamický hlas | Kolekce |
|------|---------|----------------|---------|
| Visitor | 3 celkem | ❌ | jen Fehu |
| The Curious | 5/měsíc | ❌ | všech 25 |
| Rune Seeker | kredity | ✅ | všech 25 |
| Standard | unlimited | ✅ | všech 25 |
| Premium | unlimited | ✅ | + ceremonial |

### VRSTVA 4+ — BUDOUCNOST
- Ceremonial mode (Premium)
- Kontextová inteligence (čas, lunární kalendář, sezóna)
- Paměť & personalizace (multi-rune, follow-up)
- Fyzický ekosystém (QR deeplink, NFC)
- Shopify webhook pro online nákup

### TECHNICKÝ DLUH
- [ ] IS texty — review rodilým mluvčím (rotující fráze, notices, gates)
- [ ] Delete account UI + Edge Function (GDPR)
- [ ] Rate limiting v Edge Functions
- [ ] Real streaming přes SSE (místo fake setTimeout)
- [ ] Nahrát zbývající statické audio (25 EN + 25 IS run)
