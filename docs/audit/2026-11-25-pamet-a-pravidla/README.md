# Audit: proč session zapomíná, co je zapsané (2026-11-25, CODE-read)

Owner 2026-11-25: „mas v tom velky bordel takze nez zacneme neco delat dal tak poradny hluboky audit … ma to byt udelano tak aby jsi
vzdy vedel kde jsi a co mas delat“ · „14. ano 15. ano, napred mi to ukaz“ (rušení a slučování jen po ukázání).

**Data (jen čtení, nic se neměnilo):**
- `selhani-do-2026-10-20.json` (72) a `selhani-od-2026-10-21.json` (44): každá ownerova stížnost „už jsme to dělali / máš to zapsané“
  z přepisů — co se zapomnělo, kde to tehdy bydlelo (ověřeno přes `git log -S`, jinak „neověřeno“), třída selhání, co se pak přidalo,
  jestli se to opakovalo. Hledáno regexy ve zprávách ownera; stížnost jinými slovy mohla uniknout.
- `nositele.json` (186): každý nositel pravidel (CLAUDE.md §, working-style, 91 pamětí, oblasti mapy, hooky) — co vlastní, kdy se
  dostane do kontextu, překryvy, doklad, že něco zachytil, návrh (ponechat / sloučit / zrušit / přesunout k místu akce).
  Návrhy jsou podklad pro ownera, nic se neruší bez jeho ukázání.

**Třídy selhání (116 případů):** zapsáno, ale v chvíli akce neukázáno 52 · nezapsáno 24 · ukázáno a přejito 14 · ukázáno, ale utopeno 10 ·
nejasné 16.

**Změřeno na hranici kontextu:** výstup SessionStart 16–23 tis. znaků; Claude Code vkládá nejvýš 10 000 znaků na pole, přes to jen
náhled 2 000 a soubor, který nikdo nečte (code.claude.com/docs/en/hooks.md, „JSON output“). Chyba `rozdelane()` v
`hooks/claude/runar-context.py`: `max(x[:10])` přes jména snapshotů vybere nedatované `runar-tree-*.md` → ~7,5 kB červnové práce stromu
jako „rozdělaná práce“ pro každou session. Log `~/.claude/runar-api-pokusy.log`: P10 a P20 (7 volání) chybí, testy hlídače P999
jsou mezi skutečnými pokusy.
