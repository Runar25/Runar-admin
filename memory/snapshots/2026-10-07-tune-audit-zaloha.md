# Snapshot 2026-10-07 — CODE-tune: §30 „nic na paměti“, v5.04 (otázka runy), lab otázky na oblast, glyf životní runy

Historický záznam ke dni, ne stav. Rozhodnutí → `RUNAR_DECISIONS.md` 2026-10-07 (1)–(5) · měření → `RUNAR_EVAL_LOG.md` 2026-10-07 (1)–(2) ·
zásady slov → `RUNAR_DESIGN.md` „Slova, která dáváme modelu“ (body 2, 5, 10 + postup zkoušení slov) · pravidla → `CLAUDE.md` §29, §30.

## Uprostřed čeho jsme
- **Glyf životní runy nad čtením** (hlášení e9897395): opraveno a nasazeno — klepací glyf vnořený jako v hlavičce čtení, řádek bez
  zvýraznění klepnutí. Emulátor neukáže zvýraznění prstem → **owner ověří na telefonu**; když to bliká dál, hledat jinou příčinu.
- **Otázka na oblast v Asku**: lab hotový, owner po textech *„těžkost a všední den znějí nejlíp“*. Produkce beze změny (*„teď to dělat
  nebudeme“*). Otevřené v BACKLOGu „Ask: oblast znamená v Asku jen název“ (IS znění, délka tipu, stálý začátek „You might notice…“).
- **v5.04 nasazeno** (konec-otázka bez otázky runy) — sledovat v monitoru opis u konců-výroků.
- **Owner schválil postup** zkoušení slov (víc pohledů, malý vzorek, počty + texty, rozhoduje on): *„ten princip ti sedl“*.

## Co hlídá stroj (nové dnes) — CLAUDE.md §30
Záloha čtení z pokusů · API jen s `RUNAR_API_ANO` + záměrem · zpráva ownerovi: číslování, návrh jen po `uz_vime.js` · načtená hlášení
musí mít v tahu zápis · zásady slov se vypisují na začátku session.

## Past dne
- Doklad ze starých dat (22. 9.) a staré věci z vyřízených hlášení → owner: *„hlásíš spoustu starých věcí“*.
- Prohlížeč v náhledu bral starý JS z HTTP cache — před ověřením změny vynutit nové načtení (`fetch(…, {cache:'reload'})` a reload).
