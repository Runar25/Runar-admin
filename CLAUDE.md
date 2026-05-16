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

## ROADMAP v0.4 (2026-05-16)

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

#### 1C — Admin nástroj ✅ HOTOVO
- [x] Integrován v Teach Rúnar tabu
- [x] Generate → edit → preview hlas → save flow
- [x] Editovatelný text před uložením hlasu
- [x] Preview hlasu PŘED uložením

### VRSTVA 2 — AUTH & UŽIVATELSKÝ ÚČET
- [ ] Supabase Auth (magic link + Google OAuth)
- [ ] User profil tabulka (jméno, DOB, jazyk, life_rune, tier)
- [ ] Anonymní session → account migrace (free trial výklady)
- [ ] readings tabulka naplnit (základ EXISTS v DB)
- [ ] Základní UI deník výkladů

### VRSTVA 3 — MONETIZACE
Tiers definovány v `runar-config.js` → `TIERS`, backend zatím nevynucuje.

| Tier | Výklady | Dynamický hlas | Deník |
|------|---------|----------------|-------|
| FREE TRIAL (anon) | 3 celkem | ❌ | ❌ |
| FREE (účet) | 5/měsíc | ❌ | 5 posledních |
| CREDITS | balíčky (nevyprší) | ✅ | unlimited |
| STANDARD | neomezené | ✅ | unlimited |
| PREMIUM | neomezené | ✅ | ✅ + audio uložení |

- [ ] Stripe integrace (one-time + recurring)
- [ ] user_entitlements tabulka — vynucování na backendu
- [ ] Feature gates v UI (viditelné, s upgrade CTA)

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
- [ ] Progress indicator: které runy mají statické audio
- [ ] Rate limiting v Edge Functions
- [ ] Cost monitoring per user
- [ ] Frontend → Vite/React až řádků > 2000 (aktuálně ~800)
