---
name: ukladej-cteni-a-hlasy
description: Každé vygenerované čtení i hlas se ukládá (mimo repo) s tím, z čeho vzniklo — ať máme s čím porovnávat
metadata:
  type: feedback
---

Všechno, co při pokusech vygenerujeme — čtení i nahrávky hlasu — se ukládá natrvalo, i s textem, modelem a nastavením.

**Why:** owner 2026-10-29: *„vždy ukládat, jak čtení, která generujeme, tak hlasy, ať máme s čím porovnávat“* — poslech pokusu se při
dalším běhu přepsal jen novými variantami a text R3 (značky od modelu) nebyl nikde kromě HTML. Čtení to samé chtěl už 2026-10-07.

**How to apply:**
- Hlas: skript, který volá ElevenLabs, ukládá přes `scripts/utils/hlas_archiv.js` `uloz({pokus, jmeno, popis, jazyk, model, nastaveni, text, mp3})`
  → `~/runar-eval/hlasy/` + katalog + stránka k poslechu se vším (doc-links:ok 2026-10-29 mimo repo). Nikdy nepřepíše starší nahrávku.
- Čtení: `scripts/utils/zaloha_cteni.js` (Stop-hook) kopíruje výstupy pokusů do `~/runar-eval/zaloha/`.
- Pojistka: tentýž Stop-hook zachytí i `.mp3` uložené mimo archiv (`hlasy/zachyceno/`) — bez textu, proto `uloz()` je pravidlo, ne pojistka.
- Ownerovi pouštěj poslech z archivu (stránka archivu přes server `hlasy` v uživatelském launch.json), ne ze složky jednoho pokusu.
Souvisí: [[cteni-generuj-tady-ne-pres-api]], [[always-show-reading-samples]].
