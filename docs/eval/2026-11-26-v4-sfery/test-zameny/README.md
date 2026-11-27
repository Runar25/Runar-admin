# Test záměny sfér pěti run (4M1) — 2026-11-27

**Vlastní jen:** zadání, předpověď a výsledek slepého testu záměny pro sféry Kenaz, Isa, Wunjo, Nauthiz a Ansuz. Věty: [vety.json](vety.json)
(25 vět: 16 doslova od Gemini z odpovědi 3, 9 opravených nebo doplněných labem podle ownerových popisů run). Proč: rozbor odpovědi 3, oddíl 2
a 8 ([odpoved-3-rozbor.md](../konzultace/odpoved-3-rozbor.md)). Owner 2026-11-27: *„Ano, otestuj“*.

## Co testuju (a co ne)
- **Testuju:** jde z jedné věty o mechanice sféry (bez jména runy a sféry) poznat runu, když soudce zná **ownerovy popisy všech 24 run**
  (`RUNAR_POPISY_RUN.md`, bez Blank)? Kterou runu soudce zvolí místo ní?
- **Netestuju:** hotové obrazy ani věty runy dne (zatím nejsou), angličtinu ani islandštinu (věty jsou česky, jak je poslal Gemini),
  rozlišení sfér uvnitř runy (4M3), schválení ownerem.
- **Dvě sady, každá zvlášť** (soudce nesmí vidět originál a opravu vedle sebe — porovnával by je): **sada G** = 16 vět Gemini; **sada L** =
  návrh labu (19 vět: věty Gemini, které lab nechává, + opravy a doplnění: K2L, I1L, I4L, W2L, W3L, N4L, A12L, A5L, A6L; bez K2, I1, W2, W3,
  A1, A2).
- **Soudci:** na každou sadu dva čerství subagenti (G-A, G-B, L-A, L-B), každý jiné pořadí vět a jiná maskovaná čísla, nevidí repo ani tenhle
  soubor; čtou jen kopii ownerových popisů. Každý dá pro větu 1. a 2. volbu a jistotu 1–3. **Nejsou to kalibrovaní soudci v2** (kostra
  4M1) — čísla nejsou srovnatelná s měřeními v2.
- **Kritérium (stanoveno předem):** věta projde, když ji **oba** soudci dají na 1. místo správné runě. Neprojde, když ji oba dají jiné runě.
  Jinak „sporná“. Shoda soudců mezi sebou je kontrola šumu (§25 B).

## Předpověď (zapsaná před během)
1. Neprojde: W2 (luk → Eihwaz nebo Tiwaz), W3 (ohniště → Kenaz), N3 (mráz → Isa).
2. Sporná: K3 × N1 (zrod ohně), I2 × K1 (vystoupí obrysy), I3 (tenký led — v popisu Isy není), A4 (stopa slova).
3. Opravy labu dopadnou líp než originály: W2L, W3L lépe než W2, W3; I1L stejně nebo lépe než I1.
4. Nejlépe projdou: N2, A3, A5L, K1, W1.

## Výsledek (4 soudci, 70 posudků)
**Sada G (Gemini):** projde 14 · neprojde 2 z 16 · soudci se shodli na 1. volbě 15/16.
**Sada L (návrh labu):** projde 16 · sporná 1 · neprojde 2 z 19 · shoda 17/19.
Správná runa byla v 1. volbě 61/70 posudků. Když chyběla v 1. volbě, nebyla ani ve 2. Jistota 1–3 je v závorce.

| věta | runa · sféra | zdroj | výsledek | soudce A · soudce B (1./2. volba, jistota) |
|---|---|---|---|---|
| W1 | Wunjo · Clean Joint | gemini | ✖ neprojde (obě sady) | Gebo/Ehwaz (1) · Ehwaz/Gebo (1) |
| N3 | Nauthiz · Bare Exposure | gemini | ✖ neprojde (obě sady) | Hagalaz/Algiz (2) · Hagalaz/Algiz (2) |
| N1 | Nauthiz · Hard Friction | gemini | G projde, L sporná | G: Nauthiz (1) · Nauthiz (1) — L: **Kenaz** (1) · Nauthiz (1) |
| W2 | Wunjo · Slack String | gemini | projde, slabě | Wunjo/Tiwaz (1) · Wunjo/Tiwaz (1) |
| I3 | Isa · Thin Ice | gemini | projde, slabě | G: (2) · (2) — L: (1) · (1), vždy 2. Laguz |
| I2 | Isa · Sharp Air | gemini | projde, slabě | G: Isa/Sowilo (2) · Isa/Kenaz (2) — L: (1) · (2) |
| K2 | Kenaz · Shaping | gemini | projde | Kenaz/Uruz (2) · (2) |
| W3 | Wunjo · Shared Hearth | gemini | projde | Wunjo/Othila (2) · (2) |
| A2 | Ansuz · Carried Sound | gemini | projde | Ansuz/Laguz (2) · (2) |
| A3 | Ansuz · Listening Ear | gemini | projde | (2) ve všech čtyřech |
| K1, K3, I1, N2, A1, A4 | | gemini | projde jistě | (3) skoro všude |
| K2L, I1L, I4L, W2L, W3L, N4L, A12L, A5L, A6L | | lab | **všech 9 projde jistě** | (3) u všech 18 posudků |

**Proti předpovědi:**
1. Předpověď 1 vyšla jen u N3 (Bare Exposure). Soudci ale nezvolili Isu, jak jsem čekal, nýbrž Hagalaz. W2 (luk) a W3 (ohniště) prošly, W2 jen s jistotou 1 a s Tiwaz na 2. místě.
2. Předpověď 2 vyšla napůl. N1 je jediná věta, na které se soudci rozešli: jeden z nich dal Kenaz. K3, I2, I3 a A4 prošly, I2 a I3 s nízkou jistotou.
3. Předpověď 3 vyšla v jistotě, ne ve výsledku: opravy prošly stejně jako originály, ale s jistotou 3 místo 1–2 (W2 1 → W2L 3, W3 2 → W3L 3, K2 2 → K2L 3).
4. **Předpověď 4 nevyšla u W1:** Clean Joint jsem čekal mezi nejjistějšími, ale propadl u všech čtyř soudců (Gebo nebo Ehwaz). Dva kusy, které „nesou zátěž společně“, čtou soudci jako vztah dvou, ne jako soulad.

**Hranice nálezu (§25):**
- **Věty labu jsou napsané z ownerových popisů, často jejich slovy** („smích u stolu“, „uprostřed cesty“, „pod ledem voda“, „už to nejde nevidět“).
  Soudci to sami píšou („výslovně“). Jistota 3 u labu tedy z části měří **shodu slov s popisem**, ne rozlišitelnost obrazu. Hotové obrazy ta
  slova nést nebudou, takže test obrazů je potřeba zopakovat.
- Testována je věta o mechanice sféry (česky), ne obraz, ne EN/IS. Rozlišení sfér uvnitř runy (4M3) netestováno.
- n = 2 soudci na sadu, stejný model, bez nulové kontroly. Šum: deset vět je v obou sadách a ve 39 ze 40 posudků dopadly stejně (výjimka N1).
- Soudci nejsou kalibrovaní soudci v2.

**Co z toho plyne (návrh, rozhoduje owner):**
1. **Vyřadit nebo přepsat:**
   - W1 Clean Joint: čte se jako Gebo nebo Ehwaz. Ownerovo *„něco zapadne na své místo“* je přepsat bez dvou partnerů.
   - N3 Bare Exposure: čte se jako Hagalaz a v ownerově popisu není.
2. **Slabé, do další várky přepsat z popisu:**
   - N1 Hard Friction (jistota 1, jednou Kenaz),
   - W2 Slack String (jistota 1, Tiwaz),
   - I3 Thin Ice (jistota 1–2, v popisu není),
   - I2 Sharp Air (jistota 1–2).
3. **Doplněné stránky z popisů obstály:** I4L (ještě nenastal čas), N4L (tlak obrácený dovnitř), A5L (pojmenování), A6L (slovo, které zakryje).

Soubory: odpovědi soudců, mapy maskování a zadání v [vysledky/](vysledky/) · skripty v [skripty/](skripty/) (běžely ze scratchpadu, cesty v nich
míří tam).
