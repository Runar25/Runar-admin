# 2026-08-18 — kde jsme skončili (session CODE-tune)
# Rozdělaná práce k tomuto dni. NENÍ to popis aktuálního stavu — ten vlastní produkce,
# `git log` a doky dle rozcestníku. Co má vlastníka jinde, tu schválně NENÍ.

## Uprostřed čeho jsme byli

**Audit systémového promptu blok po bloku — DOKONČEN.** Všech 13 bloků a po něm i všech
pět položek, které z auditu zbyly. **Otevřené z něj nezůstalo nic.**

## Čím se pracuje (nové, ať to příští session nehledá)

- **`scripts/utils/gen_direct.js`** — vygeneruje dávku **přímo přes Claude API**, když je
  admin JWT do proxy po expiraci. Klíč z `ANTHROPIC_API_KEY`, nikam se neukládá.
  Umí `single` i spready, `--without angle`, `--dry-run`.
  ⚠️ Prompty staví TÝMIŽ buildery jako produkce — kdo to změní, měří něco jiného.
- **`scripts/utils/measure_sameness.js`** — párová stejnost dávky. Vždy si vypíše vlastní
  **šumovou podlahu** (půlka proti půlce), protože přesně na ní 17. 8. jedno měření padlo.
- **Token do proxy je prošlý** (`~/.runar-eval-token`, vypršel 17. 8. 22:32). `gen_batch.js`
  bez něj neběží; `gen_direct.js` ano.

## Co viselo a je pryč

Kotva · `runar_character` · zámek gramatiky · islandská přirovnání · úhel u spreadů —
všech pět uzavřeno. Proč a čím → `RUNAR_DECISIONS.md` 17. a 18. 8.

⭐ **Tři z nich zavřelo to, že jsem se konečně zeptal databáze**, ne ownera:
`supabase db query --linked` funguje a je v `CLAUDE.md`. Než příště napíšu „ze svého stroje
to nezjistím", zkusit to.

## Zůstává na ownerovi (nepatří to sem jako úkol, ale nikdo jiný to neudělá)

- **Islandská statická čtení run v `runar_static_audio`** vzniklá mezi 2026-05-31 a 2026-08-17
  dostala anglickou postavu a větu „Respond only in English" — shrine si nastavoval
  `{...DEF_CHAR}`. Opraveno, ale hotová data v tabulce zůstala. Detail → `RUNAR_DECISIONS.md` 17. 8.
- **Cowork handoff „Variantové balíčky"** — owner ho probíral s Coworkem, výsledek neznám.

## Past, na kterou jsem dnes šlápl potřetí

**Patch přes bash heredoc požírá escapování** — z `\n` v JS řetězci se stal skutečný konec
řádky a generátor přestal jít parsovat. Mám na to vlastní pravidlo („patche psát do souboru")
a porušil jsem ho tím, že jsem ten soubor psal *heredocem*. Pomohlo až `String.fromCharCode(10)`,
kde není co interpretovat.
