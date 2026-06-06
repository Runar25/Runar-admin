# RUNAR_BACKTESTING.md
# Jak testovat že nová změna nerozbila co fungovalo dřív
# Spusť před každým větším commitem a po každé opravě bugu.

---

## Proč backtesting

Ruanr nemá testovací framework (Jest, Mocha atd.).
Testování probíhá přes prohlížeč a kontrolu DB.

Bez systematického testování platí: opraví se A, rozbije se B.
Projekt roste → více závislostí → více rizika.

Tento soubor říká Claude Code přesně co zkontrolovat po každé změně.

---

## SMOKE TEST — spusť po každé změně

Smoke test = minimální sada kontrol která ověří že nic zásadního není rozbité.
Trvá ~5 sekund. Spouštět po každém commitu.

### Jak spustit
```bash
python -X utf8 smoke.py
```

### Co smoke.py kontroluje (5 kontrol)
1. **JS syntax** — `node --check` na všech 10 JS souborech
2. **Hardcoded strings (§10)** — regex hledá user-visible strings mimo t()/tp()/vn()/vl()
3. **IS texty** — `check-is.py` (known-bad IS fráze)
4. **Překlady** — `check-translations.py` (EN vs IS klíče musí být stejné)
5. **SW verze** — komentář a cache name musí souhlasit

### Výstup
```
✅ SMOKE TEST PROŠEL  —  5/5 kontrol OK
nebo:
❌ SMOKE TEST SELHAL  —  1 problém(ů), 4 OK
   ❌ 3 potenciálních §10 porušení
      runar-auth.js:92  "SIGN IN"
```

---

## REGRESSION CHECKLIST — spusť po větší změně

Větší změna = nová feature, refaktoring, změna DB schématu.
Trvá ~15 minut. Jdi systematicky přes každý bod.

### Instrukce pro Claude Code
> "Projdi Regression Checklist podle RUNAR_BACKTESTING.md.
> Pro každý bod řekni: ✅ OK / ❌ PROBLÉM / ⚠️ ZKONTROLOVAT RUČNĚ."

---

### A) Tier systém — každý tier vidí co má

| Co testovat | Visitor | Rune Seeker | Rune Walker | Rune Keeper |
|-------------|---------|-------------|-------------|-------------|
| Tree tab viditelný | ❌ skrytý | teaser | ✅ plný | ✅ plný |
| Single rune dostupný | 1× | free+rune stones | ✅ | ✅ |
| Kříž dostupný | ❌ | rune stones | ✅ | ✅ |
| Yggdrasil dostupný | ❌ | rune stones | ✅ | ✅ |
| Journal viditelný | ❌ | 5 záznamů | ✅ unlimited | ✅ unlimited |
| Life Rune výklad | ❌ | teaser | ✅ 1200 tokenů | ✅ 2000 tokenů |

Claude Code zkontroluje: `updateTabVisibility()`, `updateBanners()`, `updateTreeTab()`

---

### B) Strings a překlady

- [ ] Žádné hardcoded strings přidány v této změně
- [ ] Každý nový string má EN i IS překlad
- [ ] Nové strings používají t() / tp() / vn() / vl()
- [ ] `python -X utf8 check-is.py` prošel bez chyb

---

### C) IS 3-vrstvý systém — každé AI generování

| Generování | buildSysPrompt(lang)? | prompt přímo v IS? | applyISCorrections()? |
|------------|----------------------|-------------------|----------------------|
| Regular reading | ✅/❌ | ✅/❌ | ✅/❌ |
| Life Rune | ✅/❌ | ✅/❌ | ✅/❌ |
| The Gathering | ✅/❌ | ✅/❌ | ✅/❌ |

---

### D) DB konzistence

- [ ] Žádné přímé DB volání mimo definovaných funkcí
- [ ] Každé DB volání má .catch() nebo try/catch
- [ ] ⚠️ POZOR: email a updated_at NEEXISTUJÍ v user_profiles

---

### E) Sdílené moduly — shrine sync

- [ ] Žádná logika duplikována do shrine inline JS
- [ ] Změna v runar-character.js nebo runar-utils.js funguje i v shrine
- [ ] Load order v HTML odpovídá závislostem

---

### F) SW verze

- [ ] sw.js auto-bumped přes git hook (ověř `[hook] SW: auto-bumped` ve výstupu commitu)
- [ ] Pokud hook selhal: ruční bump komentář + CACHE v sw.js

---

### G) Kritické funkce — nejsou rozbité

| Funkce | Soubor | Co zkontrolovat |
|--------|--------|-----------------|
| calcLifeRune() | runar-runes.js | Výpočet life runy z DOB |
| fetchUserProfile() | runar-app.js | Načítání profilu + life rune z DB |
| updateTreeTab() | runar-tree.js | Správný stav Tree tabu |
| buildSysPrompt() | runar-character.js | Dostane lang parametr |
| applyISCorrections() | runar-character.js | Opravy IS textu |
| isAdmin() | runar-auth.js | Admin bypass funguje |
| t() / tp() / vn() / vl() | runar-utils.js | Vrátí správný jazyk |

---

## PŘED KAŽDÝM VĚTŠÍM COMMITEM — checklist

```
PŘED COMMITEM:
[ ] python -X utf8 smoke.py prošel (5/5)
[ ] Testoval jsem jako visitor (ne jako admin)
[ ] Testoval jsem jako rune_seeker (ne jako admin)
[ ] Jeden commit = jedna věc

PO COMMITU:
[ ] Push ihned
[ ] [hook] SW: auto-bumped se zobrazil (pokud JS/CSS změna)
[ ] CLAUDE.md aktualizován pokud změna architektury
```

---

## CO DĚLAT KDYŽ TEST SELŽE

### Syntax error
Stopni. Přečti chybovou hlášku celou. Najdi soubor a řádek. Oprav jen tento problém.

### Hardcoded string nalezen
Najdi string. Přidej klíč do UI_TEXT (EN + IS). Nahraď t() nebo tp(). Spusť smoke znovu.

### IS překlad chybí
Najdi EN klíč bez IS verze. Přidej IS překlad — neodhaduj, zeptej se rodilého mluvčího.

### Tier vidí co nemá
Najdi podmínku v updateTabVisibility(). Porovnej s tier tabulkou v CLAUDE.md. Oprav.
