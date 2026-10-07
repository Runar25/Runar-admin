# Audit promptu, který vyrábí čtení (CODE-tune, od 2026-10-07)

Owner 2026-10-07: *„pusť se do auditu promptu. Asi si napřed najdi, co to znamená audit, proč se dělá a jak se má dělat, kde se
začíná, co je výsledkem. Podotýkám, že náš model vytváří čtení."* Tenhle soubor vlastní **metodu a vstupní data** auditu.
Nálezy, které čekají na práci, vlastní `RUNAR_BACKLOG.md`; čísla měření `RUNAR_EVAL_LOG.md`; rozhodnutí `RUNAR_DECISIONS.md` (§20).

## Co je audit a proč
- **Audit** = přezkoumání předmětu proti předem daným **kritériím**, opřené o **důkazy**; výsledkem je **zpráva s nálezy a doporučeními**,
  ne rovnou změna. Nález má pět částí: *co je* (stav) · *co má být* (kritérium) · *důkaz* (čísla a ukázky) · *příčina* · *dopad* —
  a k tomu doporučení, jak to opravit a ověřit. (Obecná stavba auditní zprávy, např. ISACA *IS Audit Basics: The Components of the
  IT Audit Report*.)
- **Proč u nás:** prompt rostl po větách — každá oprava přidala pravidlo; registr pravidel promptu (`scripts/prompt_rules_registry.json`) jich drží stovky.
  Některá si odporují, některá nic nedělají, některá vyrábějí vady, které pak opravujeme dalším pravidlem (pojistka „does not say",
  opis otázky runy). A modely, které čtení píšou (Opus 5, GPT-6 sol), čtou pokyny jinak než ty, pro které pravidla vznikla.

## Kde se začíná: u čtení, ne u textu promptu
Náš model vyrábí čtení, takže měřítkem promptu je to, co z něj vyjde. Postup převzatý z hodnocení generativních aplikací:
- **Napřed kritéria úspěchu, pak ladění** (Anthropic, *Define success criteria and build evaluations*: úkol a kritéria dřív než prompt).
- **Error analysis** (Hamel Husain, *Why is error analysis so important in LLM evals*): přečíst skutečné výstupy, ke každému zapsat
  první vadu („open coding"), vady seskupit do typů a spočítat („axial coding"), pokračovat, dokud nové výstupy nepřinášejí nový typ.
  Teprve z typů vad vznikají měření a opravy — ne z obecných metrik.
Text promptu se čte až potom: u každého typu vady se hledá, který pokyn nebo vstup ho vyrábí.

## Kritéria (co je dobré čtení) — odkud
1. Ownerem potvrzené vlastnosti silného čtení → `memory/co-dela-cteni-silnym.md`.
2. Kánon hlasu a hranic (nic netvrdit o nitru, žádná rada do života, islandská gramatika) → `RUNAR_DESIGN.md`, `CLAUDE.md` §2.
3. Změřené zásady formulací → `RUNAR_DESIGN.md` „Slova, která dáváme modelu".
4. Návody výrobců (Anthropic Opus 5, OpenAI GPT-6) → už porovnáno 2026-10-04, `RUNAR_BACKLOG.md` „Prompt × návody výrobců".

## Postup
1. **Data** — čtení a Asky od nasazení solu (2026-09-25) + ownerova hlášení za totéž období. Export mimo repo
   (`~/runar-eval/audit-2026-10-07/`, osobní data). Kdokoli to zopakuje: `node scripts/utils/najdi_cteni.js --od 2026-09-25`.
2. **Ownerova hlášení = první vrstva kódování** — owner je čte jako uživatel a hlásí vadu i chválu; seskupit do typů.
3. **Vlastní open coding všech čtení a Asků** → typy vad s počty (kde to jde, počet strojem: `scripts/monitor_ozveny.js`, `lint_readings.js`).
4. **Příčina každého typu** — losy v `prompt_draws` (obraz, úhel, konec, podoba oblasti, esence), monitor ozvěn (ODKUD), registr pravidel.
5. **Inventura pravidel** jen tam, kam vedou typy vad: proč pravidlo vzniklo (DECISIONS), čím je doložené, co by se bez něj rozbilo.
6. **Zpráva**: typy vad seřazené podle dopadu na čtení, u každého příčina, návrh opravy a nejmenší test, který rozhodne. Opravy pak
   po jedné; velké přestavby v labu (DECISIONS 2026-10-05 (3)).

## Co už hotové je a neopakuje se
Audit systémového promptu blok po bloku (2026-08-17/18, uzavřen) · porovnání s návody výrobců (2026-10-04: 8 nálezů, body 1–3 nasazené,
4/5/6/8 odložené do labu CODE-read, výtah `memory/snapshots/2026-10-05-lab-co-uz-vime.md`) · monitor ozvěn (vstup → výstup, od 2026-10-06).

## Hranice dat
87 z 92 čtení je ownerových a owner testuje jednu runu opakovaně (Hagalaz 25×) — počty platí pro tenhle vzorek, ne pro všechny uživatele.
EN převažuje (IS 4 čtení), sol 60 a Opus 32 (single i spready).
