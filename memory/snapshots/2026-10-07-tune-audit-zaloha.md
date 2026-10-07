# Snapshot 2026-10-07 — CODE-tune: §30 „nic na paměti“, v5.04 (otázka runy), lab otázky na oblast

Historický záznam ke dni, ne stav. Rozhodnutí → `RUNAR_DECISIONS.md` 2026-10-07 (1)–(5) · měření → `RUNAR_EVAL_LOG.md` 2026-10-07 (1)–(2) ·
nálezy auditu se stavem → `RUNAR_BACKLOG.md` „Audit promptu 2026-10-07 — zapsané nálezy“ · pravidla → `CLAUDE.md` §29, §30.

## Uprostřed čeho jsme
- **Lab otázky na oblast v Asku** (owner: „zkus to, jen anglicky, víc variant z různých pohledů“): 36 volání hotových, texty ukázané
  ownerovi. **Čeká na ownera:** která formulace (nebo žádná). Produkce beze změny — owner: „teď to dělat nebudeme… budeme dělat čtení
  a zjišťovat“. Data a skripty: `docs/eval/2026-10-07-ask-oblast/`, odpovědi `~/runar-eval/ask-oblast-2026-10-07.json`.
- **v5.04 nasazeno:** konec ve tvaru otázky nedostává otázku runy z Kolekce. Sledovat v monitoru opis u konců-výroků (byl 1/38).
- **Audit:** nic neměnit (owner). Nové nálezy jen zapsat; otevírat, až se vada objeví znovu a owner upozorní.
- **Owner chce porozumět modelu** („jak modelu psát“), ne jen hledat chyby a odstraňovat je — zásady v `RUNAR_DESIGN.md`
  „Slova, která dáváme modelu“ (dnes bod 10: vzorová věta jen ověřená).

## Co hlídá stroj (nové dnes) — CLAUDE.md §30
Záloha čtení z pokusů · API jen s `RUNAR_API_ANO` + záměrem (guard upravil i CODE-read) · zpráva ownerovi: číslování, návrh jen po
`uz_vime.js` · načtená hlášení musí mít v tahu zápis (--hotovo / --backlog).

## Past dne
- První průchod auditu bral hlášení od 25. 9. včetně vyřízených a nálezy nedohledal → owner: *„hlásíš spoustu starých věcí“*.
- Doklad ownerovi z dat starých 14 dní (22. 9.) — *„tak starý, že to nezmíním“*. Jen čtení pod dnešním promptem.
- Smoke ⑮: jméno docu v závorce řádku `Affected doc(s)` = slib, že se doc změní.
