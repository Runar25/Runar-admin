# Snapshot 2026-09-26 — CODE-read: slova oblasti, esence, Ask, korektor, hlas, islandština

Historický záznam ke dni — **stav vlastní `git log` a docs**, ne tenhle soubor. Navazuje na
[snapshots/2026-09-25-modely-opus5-sol-naklady.md](2026-09-25-modely-opus5-sol-naklady.md).

## Co se udělalo (kde to bydlí)
- **Odkud „work“** — z žádného bloku promptu (5 ramen, 4–6/6; i bez oblasti 6/6); model jím říká lidskou dřinu v obraze.
  **Owner: odloženo**, udělá víc čtení. Cíl: činnost z obrazu zůstane v obraze (malování ≠ work). EVAL_LOG 2026-09-26 (1).
- **Mapa vět** (věta 3 nemá zadání, oblast padá do 3 i 4) — tamtéž.
- **Esence [1]** — runa jako aktér (výčet sloves 19/41) → znění N3 (runa jmenovaná významem v obraze): přebírání 6/6 → 0/6,
  „is that“ 5 → 2/6. EN nasazeno (CODE-tune v4.63/v4.64); **IS zůstává produkce** (N3-IS nic nezlepšilo). EVAL_LOG (3)–(5).
- **Blank** v EN promptu „the blank rune“ (owner: holé „Blank“ se dá zaměnit) — nasazeno v4.64.
- **Ask** dostává aspekt čtení (oheň 3/3 → 0/3) — nasazeno CODE-tune (DECISIONS 2026-09-26 (4)).
- **Korektor IS s korpusovou bránou** — škody 3 → 0, opravy projdou jen 1–3 z 10 → bezpečný, slabý; ostatní změny jen jako
  návrh. EVAL_LOG 2026-09-26 (2). Plánovaná úloha visela na povolení → pustěno ručně.
- **stats.js o hlas** (voice_usage + snímek předplatného EL). EN hlas **zůstává multilingual_v2** (owner: důvodem je hlas).
- **Islandský úhel [0] nechán** (přepisy převyprávěly sloveso 2/6, produkce 1/6) — owner „úhel necháme“, položka zavřena.
- **Korekce `þú vantar → þig vantar`** v DB + check-is (DECISIONS 2026-09-26 (7)).

## Čeká
1. **Sol krok 4:** owner udělá čtení přes sol (i islandská) → pak je zkontrolujeme (slepě + IS nástroji + cena).
2. **„work“** — owner se vrátí po dalších čteních.
3. Ceník: EN hlas počítán jako Flash → CODE-tune `[pricing]`.
4. Vedlejší nález: IS esenční rámec [0] („GERIR“) udělal z Hagalaz vichr 3/3 (jeden obraz) — jen zapsáno.

## Lekce
- Patch harnessu spadl na asertu a běh se pustil beze změny → 24 IS čtení bez korekcí. Po patchi ověř (grep), že se změna
  opravdu zapsala, než pustíš placený běh. Souvisí [[read-the-check-before-push]], [[pathspec-nesmi-byt-prazdny]].
- Harness musí načíst `runar-translations.js` (jinak chybí otázka runy); u IS předat IS štítky oblasti/hledání, jinak tvar
  konce losuje naslepo; korekce z DB přes `normalizeCorrections` (README `docs/eval/2026-09-26-slova-oblasti/`).
- Čísla do zápisu jen spočítaná (dvakrát jsem napsal odhad a musel opravit — [[sanity-check-measurements]]).

## Kde jsou data
`docs/eval/2026-09-26-slova-oblasti/` (skripty, pilotní čtení, slepé souzení; `stav.js` = produkční prompt přes vm).
Ownerova data jen lokálně: `C:/Users/zkuku/runar-eval/oblast/`, korektor `C:/Users/zkuku/runar-eval/korektor/`.
