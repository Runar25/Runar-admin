# Snapshot 2026-10-07 — CODE-tune: §30 „nic na paměti“, audit zapsaný se stavem, otázka runy z dat

Historický záznam ke dni, ne stav. Rozhodnutí → `RUNAR_DECISIONS.md` 2026-10-07 (1)–(3) · nálezy auditu se stavem → `RUNAR_BACKLOG.md`
„Audit promptu 2026-10-07 — zapsané nálezy“ · měření → `RUNAR_EVAL_LOG.md` 2026-10-07 (1) i s opravou · pravidlo → `CLAUDE.md` §30.

## Uprostřed čeho jsme
- **Čeká na ownera:** u konce-otázky otázku runy nedávat? (data stačí: 28 konců-otázek solu bez ní z 22. 9. runu nesou) — BACKLOG
  „Sol opisuje otázku runy…“. Bez jeho ano nic neměnit.
- **Oblast v Asku** — owner 2026-10-06 „ok zkus to“ (Ask dostane tutéž podobu oblasti jako čtení, tip se ptá na ni). NEZAČATO.
  Ve čtení se nic nemění (podoba tam zůstává, DECISIONS 2026-10-03 (4)). Pokus jen nejmenší a s počtem/cenou ve zprávě.
- **Audit:** nic neměnit (owner „určitě teď už nic neměň“). Nové nálezy jen zapsat; otevírat, až se vada objeví znovu a owner upozorní.

## Co dnes vzniklo a hlídá samo
- Stop-hook: záloha čtení z pokusů (`zaloha_cteni.js`) + kontrola zprávy (číslování; návrh jen po `uz_vime.js` v témže tahu).
- PreToolUse hook: API jen s `RUNAR_API_ANO=<počet>` (napřed `najdi_cteni.js`, pak ownerovo ano).

## Past dne
- První průchod auditu bral všechna hlášení od 25. 9. včetně vyřízených a nálezy nedohledal → owner: *„hlásíš spoustu starých věcí“*.
- Push zablokoval smoke ⑮: jméno docu v závorce řádku `Affected doc(s)` = slib, že se doc změní.
- doc-links: soubor v `~/.claude` potřebuje značku `doc-links:ok` s důvodem na TÉŽE řádce jako odkaz; skript v repu plnou cestou.
