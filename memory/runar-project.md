# Rúnar Project — Technický kontext
# Last updated: 2026-06-08

## Co je Rúnar
AI-powered průvodce runami pro Agndofa (Island). Poetický hlas, nordická filozofie.
Repo: runar25.github.io/Runar-admin/v2/ | Lokální: C:\Users\zkuku\Downloads\Runar-admin\v2\

## Stack
- Frontend: HTML + CSS + vanilla JS, GitHub Pages (žádné ES modules, žádný build)
- Backend: Supabase (pmitxjvkeovijreepror), eu-west-1 (GDPR)
- AI: Claude API přes Edge Function (claude-proxy)
- Voice: ElevenLabs přes Edge Function (eleven_v3=IS, eleven_multilingual_v2=EN)
- Voice ID: 2UI8v2ibbwQTijaYAte1 (oba jazyky, stejný hlas)

## Soubory a zodpovědnost
```
runar-config.js    — TIERS, TIER_LIMITS, VOCAB, SPREAD_CONFIG, SPREAD_COSTS, RUNAR_MODES,
                     PATTERN_WINDOW, HEAVY_RUNES, TRANSFORMATION_PAIRS
                     elVoiceId(), elModel()
runar-runes.js     — RUNES[25], AETTY, AREAS, SEEKS, MOODS, INTENTIONS, calcLifeRune()
runar-translations.js — UI_TEXT {en, is} + t(), tp(), vn(), vl()  ← Edit tool OK
runar-character.js — DEF_CHAR_EN/IS, buildSysPrompt(),
                     buildReadingPromptIS/EN(), buildLifeRunePromptIS/EN(),
                     buildNornsPromptIS/EN(), buildKrizPromptIS/EN(),
                     getCorrPrompt(), applyISCorrections()
runar-utils.js     — t(), tp(), vn(), vl(), READING_ANGLES/IS,
                     rk/rn/rworld/relements, setText/setSt/showToast, stream
runar-journal.js   — loadJournal(), renderJournal(), filterJournal()
runar-tree.js      — updateTreeTab(), generateLifeRuneReading(), loadLifeRuneFromDB()
runar-gathering.js — The Gathering (NAHRADIT — stará manuální logika)
runar-auth.js      — updateAuthUI(), isAdmin(), PWA, sign-in, redeem
                     (všechny banner strings přes t()/tp())
runar-reading.js   — startReading(), _generateReading(), generateVoice(),
                     _generateSpread3Reading(), _generateNornsReading(), _generateSpread5Reading()
runar-app.js       — state, DB init, fetchUserProfile(), showAppTab()
runar-reader.html  — produkční app  ← Edit tool OK
runar-reader.css   — styly          ← Edit tool OK
runar-shrine.html  — admin app      ← Edit tool OK pro HTML, Python pro inline JS
sw.js              — Service Worker v74 (auto-bump: git hook hooks/pre-commit.py)
```

## Pravidlo §1 — JS = Python skripty
Edit tool kazí apostrofy → SyntaxError. JS soubory VŽDY přes Python skript.
Ukládat v: C:\Users\zkuku\Downloads\Runar-admin\

## Pravidlo §10 — NULA hardcoded strings
Každý user-visible string přes helper z UI_TEXT / VOCAB:
- `t('key')` — statický překlad
- `tp('key', {vars})` — šablona s proměnnými
- `vn('cast', n, lang)` — plural: '3 casts' / '3 spár'
- `vl('card', lang)` — label: 'Rune Card' / 'Rúnakort'
Přidání jazyka = jen nový blok v UI_TEXT + VOCAB. Žádné jiné soubory.

## Tier systém (2026-06-06)
| DB hodnota | UI jméno | Přístup |
|-----------|---------|---------|
| free_trial | Visitor | jen Single (1×) |
| rune_seeker | Rune Seeker | vše za rune stones |
| standard | **Rune Walker** | vše z 50 castů/měs |
| premium | **Rune Keeper** | vše z 75 castů/měs |
Yggdrasil: Dec 14–28 pro všechny tiery
DB hodnoty se NEMĚNÍ. Rune Walker/Keeper jsou jen UI labely.

## Vocabulary (VOCAB v runar-config.js)
| Klíč | EN | EN plural | IS | IS plural |
|------|----|-----------|----|-----------|
| unit | rune stone | rune stones | rúnasteinn | rúnasteinar |
| cast | cast | casts | spá | spár |
| card | Rune Card | Rune Cards | Rúnakort | Rúnakort |

## Spread systém
| Spread | Runy | Rune Stones | Stav |
|--------|------|-------------|------|
| Single | 1 | 1 | ✅ produkce |
| Norns | 3 | 3 | ✅ produkce (zakládací rituál) |
| Kříž | 5 | 5 | ✅ produkce (Standard+) |
| Horseshoe | 7 | 7 | ✅ produkce (Standard+) |
| Yggdrasil | 9 | 9 | ✅ produkce (všichni přihlášení, Dec 14–28) |
| Gathering | — | 3 flat | ❌ redesign — tree pattern detection, čeká na tree_state DB |
| Trojice | — | — | ❌ ODSTRANĚNA (nahrazena Norns 2026-06-07) |

Shrine reader: stále zobrazuje starý Trojice layout (3 READINGS / past·present·future) — neopraveno.

## Budoucí rozšíření readeru
- "Neuložit do stromu" toggle — čtení bez tree branch
- "Čtení pro někoho jiného" — jiné jméno/DOB, nezapíše do stromu
  Závisí na: tree_state DB, branch systému

## Klíčové datové struktury (v kódu)
```javascript
VOCAB            // unit/cast/card — vocabulary single source of truth
TIER_LIMITS      // tier rules — Rule §8
TIERS            // tier labels + voice flags
SPREAD_COSTS     // cost per spread
RUNAR_MODES      // max_tokens per mode
PATTERN_WINDOW   = { high:7, mid:14, low:30 }
HEAVY_RUNES      = { names:[6 run], thresholds:{2,3,4} }
TRANSFORMATION_PAIRS = { cycle, breakthrough, shadow_light }
AETTY = { freya:{8}, heimdall:{8}, tyr:{8} }
RUNES[i].aett    // každá runa má Ættu
AREAS.norns      // 8 oblastí → urd/verdandi/skuld
SEEKS.norns      // 5 záměrů → osa
MOODS, INTENTIONS // v runar-runes.js
```

## Správná jména run (kód vs. alternativy)
Perth (≠ Perthro) · Berkana (≠ Berkano) · Othila (≠ Othala)

## DB — user_profiles sloupce
id, name, lang, tier, credits_balance, created_at,
free_balance, drip_week, dob_day, dob_month, dob_year,
tree_name, life_rune_number, life_rune_text, life_rune_lang
POZOR: email a updated_at NEEXISTUJÍ.

## Edge Functions
claude-proxy, elevenlabs-proxy, elevenlabs-static, redeem-code, delete-account
TREE_UPDATE (definována v config, NENÍ nasazena — čeká na tree_state DB)
