# Přisouzení vlastností jednotlivým pákám promptu — 2026-08-21

**Co tenhle adresář vlastní:** 320 syntetických čtení vygenerovaných produkčním promptem,
kde se vždy vnutila **jedna páka** a zbytek zadání zůstal zamčený — plus verdikt dvou soudců
ke každému čtení. Slouží k tomu, aby šlo říct, **která řádka promptu nese kterou vlastnost**,
místo hádání nad textem promptu.

**Proč vznikl:** 2026-08-20 se ukázalo, že hlavní vada Rúnarova promptu nejsou chybějící
pravidla, ale pravidla, která si odporují (tři nálezy za odpoledne). Textový průchod po
dvojicích pravidel **neprošel kalibrací** — hledač minul jeden ze dvou rozporů doložených
měřením a ověřovatel buď nepotvrdil nic, nebo hlásil i nevinné dvojice. Obě skutečné srážky
toho dne našel až soudce nad **hotovým čtením**. Tenhle běh to zobecňuje.

## Soubory

- `readings.jsonl` — jedno čtení na řádek: jazyk · pool · index · celý text vnucené páky ·
  runa · oblast · text čtení · slov · vět · `chlad` (studené čtení) · `smysl` (řekne, co runa je)
- `summary.json` — agregace po pákách

## Jak vzniklo

`scripts/utils/attribute_prompt.js` (generování + soudci) · `scripts/utils/attribute_summary.js`
(souhrn). Model `claude-opus-4-8`, n=8 na páku, 20 pák × 2 jazyky. Zamčeno: pevné hledání
i záměr, bez životní runy, runy rotují po sadě (lehké runy pro `zakonceni_open`, těžké pro
`zakonceni_heavy` — jinak by se druhý pool vůbec nelosoval).

## Meze, které se nesmí přehlédnout

- **n = 8 na páku.** Rozdíl 1–2 případy je šum; čte se odchylka od průměru poolu, ne pořadí.
- **Soudce je model.** Definice studeného čtení je v hlavičce skriptu a byla kalibrovaná
  na dvou známých množinách (květnová statická čtení 12/12, starší produkční 5/12).
  Opakovaný běh na týchž textech kolísá o ±1 z 16.
- **Mezijazyčné srovnání není čisté.** Anglická čtení jsou v průměru o 6 slov delší (46 vs 40),
  takže mají víc místa na tvrzení. Rozdíl EN 103/160 vs IS 56/160 tedy neříká „angličtina
  cold-readuje víc", jen že v týchž pákách vychází víc nálezů.
- Čtení jsou **syntetická**, ne od uživatelů, a vznikla nad **produkční** konfigurací promptu
  ke dni 2026-08-21 (bez kandidátských změn, které v ten den ležely v generátoru).
