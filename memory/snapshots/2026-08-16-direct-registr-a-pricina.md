# 2026-08-16 — kde jsme skončili (session CODE-tune)
# Rozdělaná práce k tomuto dni. NENÍ to popis aktuálního stavu — ten vlastní produkce,
# `git log` a doky dle rozcestníku. Co má vlastníka jinde, tu schválně NENÍ.

## Uprostřed čeho jsme byli

**Owner spustil audit celého repa** — drift a duplikáty. Prošel `CLAUDE.md`, pět nálezů,
jeden (`mood`) dořešený celý. **Chce pokračovat od PRVNÍ instrukce promptu**, ne lovit
jednotlivosti. Systémový prompt = 13 bloků, 3 906 znaků, začíná `You are Rúnar, the rune
keeper of Agndofa.` (výpis: `buildSysPrompt(null,'en')`). Reading prompt = 18 vrstev.

**Registr `direct`** hotový a zapojený, `ACTIVE_VOICE_PROFILE` zůstává `focused`.

## Jak owner chce, abych pracoval — a je to zapsané

`working-style.md` → „Pořadí, ve kterém se sahá na cizí věc" (5 kroků). Vzniklo z toho,
jak se řešil `mood`, a owner to označil za způsob, jakým to má vypadat vždy.
**Slepé čtení je nejhorší chyba dne**: „je v docu, není v kódu, smaž to" místo
„proč tam je · kdo to čte · selhal zápis, nebo následná oprava".

## Zbývající nálezy v CLAUDE.md (ověřené, neopravené)

1. `:331` popisuje obraznost jako `SEASON_POOLS` — primární je `RUNE_IMAGES` (81 řádků
   klíčovaných runou) od rozhodnutí 2026-08-08; pooly jsou jen záloha, dnes nepoužitá.
2. Čtyři produkční soubory nejsou v seznamu ani load orderu: `runar-reporter.js`,
   `runar-rune-popup.js`, `runar-readings-admin.js`, `runar-reports-admin.js`.
3. `:18` popisuje config šesti položkami, v souboru jich je 27 (chybí i `VOICE_PROFILES`).
4. `CLAUDE.md` porušuje vlastní §20: `:91` opisuje CSS hodnoty z `runar-reader.css:10-11`,
   `:11` project ref z `runar-config.js:7`.

## Dvě věci k rozhodnutí ownerem

- `working-style.md:41` velí aktualizovat CLAUDE.md po každé implementaci; `:57` velí držet
  ho pod 200 řádky a mazat, co nezpůsobí chybu. **Táhnou proti sobě.** CLAUDE.md má 436 —
  dvojnásobek cíle, což vysvětluje, proč v něm `mood` přežil devět týdnů.
- Sentenční rozpočet pro `direct`: v 5,9 věty (norns) se „jedna věc na větu" u tří run nedá.

## Past, na kterou jsem dnes třikrát šlápl

**Patch přes bash heredoc požírá escapování.** Jednou zapsal do regexu v `check-docs.py`
DOSLOVNÝ backspace (0x08) místo `\b` — hlídač pak nesedl nikdy a ve výpisu vypadal správně,
protože terminál backspace skryje. **Patche psát do souboru (`scripts/_patch_tune.py`),
ne přes heredoc**, a hotový hlídač vždy rozbít podstrčením vady.
