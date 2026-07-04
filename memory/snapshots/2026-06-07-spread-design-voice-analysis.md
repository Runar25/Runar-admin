# Snapshot 2026-06-07 — Spread design, Voice analýza, Audit

---

## 1. VOICE PROFILY — analýza a rozhodnutí

### Proč "focused" místo "lyrical"
Původní hlas měl tři překrývající se pole: `voice` (6 příkladů metafor), `variability` ("vary the metaphor SOURCE"), `imagery` (20+ příkladů). Tato kombinace vedla Claude k vrstvení obrazů — příliš mnoho metafor v jednom čtení.

**Focused profil — pravidlo:**
- JEDNA přesná smyslová metafora per čtení — nejfitující, ne nejkrásnější
- Obraz musí být smyslový: čtenář ho má cítit, ne interpretovat
- Každý obraz musí spojit přímo kde tato osoba stojí — atmosféra bez kontextu = dekorace
- Otázka na konci vždy překvapí — nikdy formulaická

**Porovnání verzí (Isa, testováno):**
- A = přímá, nová = "focused" profil
- B = více poetická, ale stále ukotvená = zvolená pro produkci
- C = původní lyrical = příliš vrstev

Uživatel vybral B ("více poetická — uplně super") → implementována jako `focused` profil.

### Voice profile architektura
```
ACTIVE_VOICE_PROFILE = 'focused'  // runar-config.js — jeden řádek revert
VOICE_PROFILES = { focused: {en, is}, lyrical: {en, is} }
_getVoiceProfile(key, lang)  // helper v runar-character.js
buildSysPrompt(c, lang, profileKey)  // HOW YOU SPEAK section
buildSysPromptV2(lifeRune, lang, profileKey)  // injekce do V2
```

IS profily: VŽDY psány nativně — nikdy překlad z EN. Podmínka §2.

---

## 2. SPREAD AUDIT — call path verifikace (2026-06-07)

### Single ✅
readRune → buildReadingPromptIS/EN → saveReading → loadJournal → generateVoice(out-short)

### Norns ✅ (s opravenýn bugem)
readRune (line 435, před Trojicí) → _generateNornsReading → buildNornsPromptIS/EN
→ saveSpreadReading('NORNS') → loadJournal → generateVoice(s3-out)
Label: s3-norns-lbl (bug fix — bylo s3-trojice-lbl)

### Kříž ✅
readRune (line 355) → _generateSpread5Reading → buildKrizPromptIS/EN
→ saveSpreadReading('KRIZ') → loadJournal → generateVoice(s5-out)

### Horseshoe ✅
readRune (line 379) → _generateHorseshoeReading → buildHorseshoePromptIS/EN
→ saveSpreadReading('HORSESHOE') → loadJournal → generateVoice(s7-out)

### Yggdrasil ✅ (tier opraven)
readRune (line 403) → [visitor gate only] → [seasonal Dec 14-28] → _generateYggdrasilReading
→ buildYggdrasilPromptIS/EN → saveSpreadReading('YGGDRASIL') → loadJournal → generateVoice(s9-out)

### Trojice — ODSTRANĚNA (bylo: line 459)
Důvod: duplicita s Norns. Trojice = Past/Present/Future (generická osa).
Norns = Urðr/Verðandi/Skuld (osud, ne čas). Trojice měla být Norns od začátku.

---

## 3. SPREAD POPISY — základ pro Rúnarův intro text

Tyto texty jsou výchozí materiál pro UI intro (text který Rúnar říká uživateli před každým čtením). Budou upraveny — zatím jako design základ.

### NORNS (zakládací rituál + 3-rune spread)
Tři Norny sedí pod kořeny Yggdrasilu. Urður tká co bylo — neodvolatelné, pevné jako kámen. Verðandi tká co se právě děje — živý okamžik, ještě nedokončený. Skuld nese co musí přijít — ne věštbu, ale dluh osudu. Tyto tři runy nejsou osa času. Jsou tři kořeny tvého stromu.

**Pozice:**
- Urður — co bylo utkáno. Co nespeš od začátku. Nelze vzít zpět.
- Verðandi — co se právě tká. Přítomný okamžik jako živá nit v pohybu.
- Skuld — co musí být. Pokud nit pokračuje tímto směrem — co přijde nevyhnutelně.

**Charakter:** Fate axis, ne časová osa. Každá runa mluví jiným hlasem a jinou vahou.

### KŘÍŽ (5 run) — KOMPAS
Kříž je kompas. Střed ukazuje kde jsi — čtyři směry ukazují co na tebe působí.
Kompas neukazuje kde máš být. Ukazuje kde jsi a co kolem tebe působí.

**Pozice:**
- Střed — jádro situace. Co je skutečně přítomné.
- Nad — co vědomě vidíš. Co aspiruješ. Co tě volá nahoru.
- Pod — co je skryté. Kořen. Co pracuje pod povrchem.
- Za tebou — odkud přicházíš. Co tě formovalo.
- Před tebou — kam situace směřuje, pokud zůstane nit stejná.

**Charakter:** Středová runa je těžiště — ostatní čtyři ji obklopují a vysvětlují. Týdenní rituál. Standard+.

### HORSESHOE (7 run)
Podkova drží štěstí — ale jen pokud je otevřená správným směrem.
Sedm pozic, jeden oblouk. Od toho co bylo, přes to co je skryté, až k tomu co čeká.

**Pozice:**
1. Minulost — co přišlo před tímto momentem
2. Přítomnost — kde stojíš teď
3. Skryté vlivy — co působí, aniž to vidíš
4. Překážky — co brání průchodu
5. Okolí a druzí — vnější síly a lidé okolo tebe
6. Co dělat — doporučená akce nebo postoj
7. Pravděpodobný směr — kam tato nit míří

**Charakter:** Sezónní čtení. Komplexní situace, ne denní dotaz. Standard+.

### YGGDRASIL (9 světů)
Ódin se obětoval na Yggdrasilu — visel devět dní a nocí, dokud mu runy nebyly zjeveny.
Devět světů stromu je devět vrstev tvé vlastní existence.
Toto čtení se nedělá každý den. Jednou ročně, v čase zimního slunovratu.

**Pozice (devět světů):**
- Ásgarðr — nejvyšší aspirace. Co tě přesahuje.
- Álfheimr — světlé a vědomé. Co vidíš jasně.
- Vanaheimr — příroda, intuice, plodnost.
- Jötunheimr — chaos a protisíly. Co tě prověřuje.
- Miðgarðr — přítomná realita. Kde skutečně jsi.
- Niðavellir — řemeslo a budování. Co tvoříš.
- Niflheimr — stín a skryté. Co potlačuješ.
- Múspellsheim — oheň a transformace. Co spaluje a čistí.
- Hel — kořeny a předci. Co nespeš z hloubky.

**Charakter:** Nejsilnější čtení. Devět světů jako mapa celého roku.
Dostupné pro všechny přihlášené — RS za 9 kreditů. Jen Dec 14–28.

---

## 4. PROČ TROJICE NEEXISTOVALA OD ZAČÁTKU

**Chyba v designu:** Session 1 zakládacího rituálu byla přiřazena Trojici protože Trojice existovala jako první 3-runový spread. Norns byl tehdy teprve navrhovaný.

**Ale:** Tři kořeny Yggdrasilu = Urðr, Verðandi, Skuld = doslova Norns. V mytologii Norny nepletu kořeny postupně — tkají najednou jako jeden čin. Norns spread toto přesně mapuje.

**Trojice** (Past/Present/Future) = generická časová osa, bez mytologického propojení s kořeny.
**Norns** (Urðr/Verðandi/Skuld) = osudová osa, tři kořeny v jednom aktu.

**Výsledek:** Sessions 2 a 3 (single runy) byly zbytečné — Norns odpovídá na všechny tři otázky přirozeně. Jednodušší, mytologicky přesnější, rituálně silnější.

---

## 5. SPREAD JOURNAL — technická architektura

Každý multi-rune spread se ukládá do readings tabulky stejným vzorem jako The Gathering:

```javascript
saveSpreadReading(spreadName, runesArr, text)
// area: 'spread'           ← speciální marker (jako 'gathering')
// rune_name: 'NORNS' atd. ← identifikátor spreadu
// rune_glyph: '✦'
// short_text: 'ᚠ FEHU · ᚢ URUZ · ᚦ THURISAZ'  ← všechny runy
// deep_text: celý text čtení
```

Journal rendering: `isSpread = e.area === 'spread'` → vlastní karta (✦ glyph, spread name, rune display).
Filter: `✦ Spreads` option v area dropdownu; spreads vyloučeny z rune filter dropdownu.
smoke.py IGNORE_VALS: přidány NORNS, KRIZ, HORSESHOE, YGGDRASIL, TROJICE.

---

## 6. PILL TOGGLE

`buildPillGroup()` v runar-app.js:
```javascript
const isOn = p.classList.contains('on');
// pokud byl vybraný → odznačí + vymaže readerUser.[area|seeking|mood|intention]
// pokud nebyl → normálně vybere
```
Platí pro všechny 4 skupiny: area, seek, mood, intention.
