# Souhrn týdne z run dne — ukázky bez modelu (CODE-tune, 2026-11-19)

Owner 2026-11-19 k plánu: *„1. kalendářní týden 2. dejme 5, ať se uživatel musí vracet … 3. později 4. ano 5. ano“* —
tedy týden po–ne, souhrn až od 5 dnů s tahem, poznámky z deníku zatím ne, zdarma, napřed ukázky psané ručně (žádné API).
Položka: `RUNAR_BACKLOG.md` „Souhrn týdne / měsíce z run dne“. Vzor: popis větve od CODE-tree (`eval_out/vetev_popis_*.json`).

**Co tohle je:** návrh instrukce + 4 texty, které jsem napsal sám podle ní. Nejsou to výstupy modelu — ukazují cíl,
ne to, co model udělá. Až owner řekne směr, přijde malý vzorek přes model (sol), se vstupem jako v produkci.

## Návrh instrukce (EN, user prompt; systém = Rúnarův charakter jako u čtení)

```
This is not a reading. The seeker has drawn a rune of the day on most days of the week that has just ended.
Speak about what these runes say together, as one week.

The week, day by day:
- Monday: Isa (ice, stillness, waiting, pause, clarity through cold)
- Tuesday: Raidho (the road, movement, natural rhythm, right action)
- …
Read them as one movement through the week, the way a spread is read: one meaning that passes through them,
not one sentence for each day. A rune that came more than once carries the most weight.

How to speak:
- Never say how many days there were or how often a rune came.
- Do not predict the coming week. This mirrors the week that passed; it is not a forecast.
- Three to five sentences, one paragraph, no headings.
```

Dny bez tahu ve vstupu **nejsou** (štítek „no rune“ by se podle DESIGN „Slova, která dáváme modelu“ bod 3 vyslovil).

## Ukázky (psané ručně)

**A — 6 dnů, Isa dvakrát** · po Isa · út Raidho · st — · čt Isa · pá Laguz · so Sowilo · ne Berkana

> Isa held this week, a stillness you came back to even after the road had started to move. Raidho pulled you forward
> early, and Isa met you again before the week was half done. Then Laguz let things soften and run, and by the weekend
> Sowilo and Berkana stood in clearer light, something small beginning to grow. The week moved from cold waiting toward
> a warmth that did not need to be hurried.

**B — 5 dnů, víkend bez tahu** · po Fehu · út Hagalaz · st Nauthiz · čt Gebo · pá Wunjo

> This week began with what you have, and Hagalaz broke into it early. Nauthiz kept you close to what you truly need,
> the narrow part of the week. From there Gebo turned you toward giving and receiving, and Wunjo closed the week with
> something that felt like belonging. What was shaken loose at the start made space for what you share with others.

**C — všech 7 dnů** · Ansuz · Kenaz · Ehwaz · Mannaz · Thurisaz · Jera · Dagaz

> Ansuz opened the week with words, something said or heard that mattered. Kenaz and Ehwaz carried it forward, a light
> you could work by and a pace you could keep with someone beside you. In the middle Mannaz turned you toward yourself,
> and Thurisaz stood at a threshold where caution had its place. Jera and Dagaz closed the week together, what you had
> tended for a while coming to a turn.

**D — 6 dnů, prázdná runa, Algiz na začátku i na konci** · po Algiz · út Blank · st Perth · čt Tiwaz · pá — · so Othila · ne Algiz

> Algiz framed this week, shelter at its start and shelter again at its end. Between them the blank rune and Perth
> left much unwritten, things not yet in view. Tiwaz asked for courage in the middle of it, and Othila brought you
> back toward home. The week asked you to stand in the unknown and still keep what is yours.

## Na co jsem při psaní narazil

- **Opakování runy je v týdnu běžné:** při 7 tazích z 25 run má aspoň jedno opakování zhruba 60 % týdnů (1 − 25·24·…·19 / 25⁷ ≈ 0,60).
  Ownerovo „nejčastější runa = základ“ tu proto platí častěji než u stromu. Ukázky A a D vracející se runu pojmenují („met you
  again“, „at its start and again at its end“) bez čísla.
- **Den bez tahu ≠ prázdná runa.** Prázdná runa (Blank) je skutečná runa a kreslí se jako orámované prázdno (CLAUDE.md §5).
  Den bez tahu proto nesmí vypadat jako prázdný kámen, jak stálo v prvním plánu — jinak by D četl člověk jako dva Blanky.
