# RÚNAR — Audit Report
Datum: 2026-05-30
Prošlo souborů: 8 (runar-app.js, runar-character.js, runar-config.js, runar-runes.js, runar-translations.js, runar-svgs.js, sw.js, runar-reader.html)

---

## Skóre zdraví projektu

- Čistota vrstev:     4/10 — runar-app.js dělá vše najednou (UI, business logika, DB, prompt building)
- Závislosti:         5/10 — skryté globální závislosti v runar-character.js, žádné skutečné cykly
- Komplexita:         4/10 — 6 funkcí přes 80 řádků, updateAuthUI() má 152 řádků
- Ošetření chyb:      6/10 — API volání majority ošetřena, ale několik fire-and-forget bez catch

---

## FÁZE 1 — Mapa projektu

```
Runar-admin/
├── v2/
│   ├── runar-reader.html     — HTML shell, načítá skripty, definuje DOM strukturu (563 ř.)
│   ├── runar-reader.css      — veškeré styly readeru
│   ├── runar-app.js          — MONOLITH: veškerá JS logika (2847 ř., 136 funkcí)
│   ├── runar-config.js       — konstanty + 3 runtime funkce (214 ř.)
│   ├── runar-runes.js        — data run + calcLifeRune() (257 ř.)
│   ├── runar-translations.js — UI_TEXT objekt, žádná logika (240 ř.)
│   ├── runar-character.js    — AI prompty, system prompt builder (481 ř.)
│   ├── runar-svgs.js         — SVG data, žádná logika (28 ř.)
│   └── sw.js                 — Service Worker, cache strategie (71 ř.)
├── supabase/functions/
│   ├── claude-proxy/         — Edge Function: Claude API proxy + tier enforcement
│   ├── elevenlabs-proxy/     — Edge Function: ElevenLabs real-time TTS
│   ├── elevenlabs-static/    — Edge Function: generuje + ukládá statické MP3
│   ├── redeem-code/          — Edge Function: gift code → credits
│   └── delete-account/       — Edge Function: GDPR smazání účtu
└── CLAUDE.md                 — projektová dokumentace pro Claude Code
```

---

## FÁZE 2 — Vrstvy a porušení hranic

### Definované vrstvy

| Vrstva | Soubory | Zodpovědnost |
|--------|---------|--------------|
| Konfigurace | runar-config.js | Konstanty, URL, API klíče, tier definice |
| Data | runar-runes.js, runar-translations.js, runar-svgs.js | Statická data bez logiky |
| AI/Prompt | runar-character.js | Sestavení system promptu a user promptu pro Claude |
| Aplikační logika | runar-app.js | State management, UI updates, DB volání, event handling |
| Síťová vrstva | supabase/functions/* | API proxy, autentizace, tier enforcement |
| Prezentace | runar-reader.html, runar-reader.css | DOM struktura, vizuál |

### Porušení hranic

```
⚠️  PORUŠENÍ HRANIC
Soubor: runar-character.js, řádek 493
Problém: buildSysPrompt() čte globální `lang` z runar-app.js místo aby lang dostala jako parametr
Závažnost: Střední — funkce závisí na stavu jiného modulu, nelze testovat izolovaně

⚠️  PORUŠENÍ HRANIC
Soubor: runar-character.js, řádek 278
Problém: getContextLine() čte globální `lang` a sestavuje runtime kontext — mísí data vrstvu s aplikační logikou
Závažnost: Střední

⚠️  PORUŠENÍ HRANIC
Soubor: runar-app.js, řádky 2195–2210
Problém: getCorrPrompt() a applyISCorrections() jsou prompt-building funkce uložené v aplikační vrstvě
Závažnost: Nízká — funguje, ale patří do runar-character.js

⚠️  PORUŠENÍ HRANIC
Soubor: runar-config.js, řádky 159, 27, 28
Problém: isAdmin(), elVoiceId(), elModel() jsou runtime business funkce v config souboru
Závažnost: Nízká — malé funkce, ale config by měl být pure data

⚠️  PORUŠENÍ HRANIC
Soubor: runar-app.js, řádek 823
Problém: max_tokens: 1200 hardcoded přímo v generateWhispersReading() místo z RUNAR_MODES
Závažnost: Nízká — RUNAR_MODES existuje ale není použit konzistentně
```

---

## FÁZE 3 — Závislosti

```
🔗 ZÁVISLOST
Typ: Skrytá
Soubory: runar-character.js → runar-app.js (globál `lang`)
Dopad: Pokud se `lang` inicializuje jinak nebo přejmenuje, buildSysPrompt() vrátí špatný jazyk bez chyby

🔗 ZÁVISLOST
Typ: Skrytá
Soubory: runar-character.js → runar-app.js (globál `corrections`)
Dopad: corrections[] musí být naplněno před prvním voláním getCorrPrompt() — timing závislost

🔗 ZÁVISLOST
Typ: Příliš mnoho
Soubory: runar-app.js
Dopad: Závisí na VŠECH ostatních modulech + Supabase SDK + DOM + localStorage + fetch API
        Jakákoliv změna v libovolném souboru může rozbít runar-app.js

🔗 ZÁVISLOST
Typ: Skrytá
Soubory: runar-app.js — funkce _generateReading() čte globály: lang, readerUser, readerRune, activeChar, userTier, currentUser, corrections
Dopad: Funkce nelze volat izolovaně ani testovat — potřebuje 7 globálních proměnných ve správném stavu
```

---

## FÁZE 4 — Komplexita

```
🔴 KOMPLEXITA
Soubor: runar-app.js, řádek 959–1110
Typ: Dlouhá funkce
Název funkce: updateAuthUI()
Délka: 152 řádků
Doporučení: Rozdělit na updateTabVisibility(), updateBanners(), updateDropdown()

🔴 KOMPLEXITA
Soubor: runar-app.js, řádek 1828–1940
Typ: Dlouhá funkce
Název funkce: updateUIText()
Délka: 113 řádků
Doporučení: Rozdělit podle sekce UI — každá sekce má vlastní update funkci

🔴 KOMPLEXITA
Soubor: runar-app.js, řádek 2282–2420
Typ: Dlouhá funkce
Název funkce: _generateReading()
Délka: 105 řádků
Doporučení: Oddělit buildReadingPrompt() jako čistou funkci bez side-effectů

🔴 KOMPLEXITA
Soubor: runar-app.js, řádek 567–668
Typ: Dlouhá funkce
Název funkce: updateWhispersUI()
Délka: 101 řádků
Doporučení: Každý state ('idle','selecting','loading','output') → vlastní render funkce

🔴 KOMPLEXITA
Soubor: runar-app.js, řádek 300–397
Typ: Dlouhá funkce
Název funkce: renderJournal()
Délka: 96 řádků
Doporučení: Oddělit renderJournalEntry(entry, i) jako samostatnou funkci

🔴 KOMPLEXITA
Soubor: runar-app.js, řádky napříč celým souborem
Typ: Duplicita
Popis: Pattern `isIs ? 'IS text' : 'EN text'` se opakuje 80+ krát inline
Doporučení: Vše přesunout do runar-translations.js → volat přes t() konzistentně

🔴 KOMPLEXITA
Soubor: runar-app.js, řádky 216, 1282, 1414, 1439, 1449, 2370
Typ: Magic values (timeouty)
Popis: setTimeout(fn, 1200), setTimeout(fn, 200), setTimeout(fn, 4700) bez pojmenování
Doporučení: const TOAST_DELAY = 200, TOAST_DURATION = 4500, NAME_PROMPT_DELAY = 1200
```

---

## FÁZE 5 — Globální stav a skryté chování

```
👻 SKRYTÉ CHOVÁNÍ
Soubor: runar-app.js, řádky 15–27
Typ: Globální stav
Popis: 12 globálních proměnných (lang, currentUser, userTier, userCredits, readerUser, readerRune, corrections, ...)
       Mění je 30+ funkcí napříč celým souborem — není jasné kdo co kdy mění

👻 SKRYTÉ CHOVÁNÍ
Soubor: runar-app.js, řádek 150
Typ: Skrytý side-effect
Popis: confirmDeleteAccount() volá localStorage.clear() — smaže VEŠKERÝ localStorage včetně věcí které nepatří Rúnarovi
Závažnost: Střední — pokud uživatel má jiné PWA data ve stejné doméně, ztratí je

👻 SKRYTÉ CHOVÁNÍ
Soubor: runar-app.js, řádek 201
Typ: Fire-and-forget
Popis: sb.from('user_profiles').update({ lang }).then(() => {}) — bez catch, selhání je tiché

👻 SKRYTÉ CHOVÁNÍ
Soubor: runar-app.js, řádek 1681
Typ: Fire-and-forget
Popis: setTreeDOB() ukládá DOB do DB bez catch — při síťové chybě uživatel neví že DOB nebyla uložena

👻 SKRYTÉ CHOVÁNÍ
Soubor: runar-character.js, řádek 236–285
Typ: Skrytý vstup
Popis: _getLunarPhase(), _getIcelandicSeason(), _getTimeOfDay() čtou systémový čas (new Date()) přímo
       Výsledek závisí na momentu volání — nelze testovat deterministicky

👻 SKRYTÉ CHOVÁNÍ
Soubor: runar-app.js, řádek 823
Typ: Magic value
Popis: max_tokens: 1200 hardcoded v generateWhispersReading() — RUNAR_MODES.ceremonial existuje ale není použit

👻 SKRYTÉ CHOVÁNÍ
Soubor: sw.js, řádek 5
Typ: Magic value
Popis: const CACHE = 'runar-v12' — verze se mění ručně, žádná automatizace
```

---

## FÁZE 6 — Ošetření chyb

```
❌ CHYBĚJÍCÍ OŠETŘENÍ CHYB
Soubor: runar-app.js, řádek 201
Operace: sb.from('user_profiles').update({ lang }).then(() => {})
Riziko: Tichý fail — lang se neuloží do DB, uživatel o tom neví

❌ CHYBĚJÍCÍ OŠETŘENÍ CHYB
Soubor: runar-app.js, řádek 1681
Operace: sb.from('user_profiles').update({ dob_day, dob_month, dob_year }).then(() => {})
Riziko: DOB se neuloží, Tree tab bude příště opět prázdný — uživatel nezná důvod

❌ CHYBĚJÍCÍ OŠETŘENÍ CHYB
Soubor: runar-app.js, řádek 1323
Operace: sb.from('user_profiles').update({ lang: l }).then(() => {})
Riziko: Tichý fail při přepnutí jazyka

❌ CHYBĚJÍCÍ OŠETŘENÍ CHYB
Soubor: runar-app.js, řádek 782
Operace: sb.from('readings').insert({...}) v saveGathering() — bez try/catch
Riziko: Gathering výsledek se nezapíše do DB, zmizí po refreshi

❌ CHYBĚJÍCÍ OŠETŘENÍ CHYB
Soubor: runar-app.js, řádek 1478
Operace: sb.from('user_profiles').update({ name }) v saveUserName()
Riziko: Jméno se neuloží, ale UI zobrazuje úspěch
```

---

## Top 5 problémů (seřazeno podle závažnosti)

1. **runar-app.js je 2847-řádkový monolith** — obsahuje UI logiku, business pravidla, DB vrstvu, prompt building, audio management, state management. Jakákoliv změna kdekoliv může rozbít cokoliv jiného. → Priorita: rozdělit na menší moduly.

2. **Skryté globální závislosti v runar-character.js** — `lang` a `corrections` jsou čteny jako globály z runar-app.js. Funkce nelze volat izolovaně. → Předávat jako parametry: `buildSysPrompt(c, lang)`, `getCorrPrompt(lang, corrections)`.

3. **updateAuthUI() má 152 řádků** — jedna funkce řídí viditelnost tabů, bannery, tier badges, DOB pole, dropdown, pill locks. Každá změna v UI prochází touto funkcí. → Rozdělit na specializované update funkce.

4. **Fire-and-forget DB zápisy bez error handling** — DOB, lang, tree_name se ukládají bez catch. Při síťové chybě uživatel neví o problému. → Přidat alespoň console.warn() nebo toast.

5. **80+ inline ternárů `isIs ? '...' : '...'`** — texty rozházené po celém runar-app.js místo v runar-translations.js. Při přidání třetího jazyka nutno hledat po celém souboru. → Přesunout vše do t().

---

## Doporučené pořadí refaktoringu

1. **Parametrizovat buildSysPrompt(c, lang) a getCorrPrompt(lang, corrections)** — malá změna, velký dopad na čistotu závislostí. Runar-character.js přestane záviset na globálech.

2. **Opravit fire-and-forget DB zápisy** — přidat catch s console.warn(). 5 míst, každé 1 řádek navíc.

3. **Pojmenovat magic timeout hodnoty** — const TOAST_DELAY, NAME_PROMPT_DELAY atd. Čitelnost okamžitá.

4. **Extrahovat buildReadingPrompt()** z _generateReading() jako čistou funkci — přijme parametry, vrátí string. Testovatelná bez side-effectů.

5. **Rozdělit updateAuthUI()** — dlouhodobý refaktoring, dělat postupně při každé změně UI.

---

## Co funguje dobře (neměnit)

- **Supabase Edge Functions** — čistá síťová vrstva, správně izoluje API klíče, tier enforcement server-side
- **Service Worker strategie** — HTML network-first, JS cache-first je správné rozhodnutí
- **TIER_LIMITS a SPREAD_COSTS** — single source of truth pro business pravidla
- **calcLifeRune()** — čistá funkce, žádné side-efekty, správně v runar-runes.js
- **applyISCorrections() + getCorrPrompt()** — dobrý nápad, špatné místo (ale funguje)
- **RLS na DB** — každý uživatel vidí jen svá data, správně nastaveno
- **Načítací pořadí skriptů** — runar-config.js první, runar-app.js poslední — implicitně správné
