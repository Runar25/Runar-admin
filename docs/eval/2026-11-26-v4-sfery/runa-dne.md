# Runa dne ve V4 — sféry × režim obrazu (od 2026-11-26)

**Vlastní jen:** obsah runy dne podle V4 (sféry, režimy obrazu, návrhy od Gemini a jejich kontrolu). Knihovnu v produkci vlastní CODE-tune
(`supabase/functions/_shared/runa_dne_knihovna.mjs`, DECISIONS 2026-11-17 (1)); dřívější lab runy dne `docs/eval/2026-11-14-runa-dne/`.
Rozhovor ownera s Gemini o runě dne přeposílá CODE-tune (owner 2026-11-26: *„zatím ti sem budu vkládat, co řešíme kolem denní runy s Gemini.
Budeš to předávat Code V4“*).

## 1. Rozhodnutí ownera
- **2026-11-26:** *„vidím to tak, že Land a Craft by pro nás měly být směry, kudy se vydat“* → režimy obrazu **Land** (islandská příroda) a
  **Craft** (práce rukou); **Current** (město, technologie) zatím ne. Varianty runy dne = sféra × režim (otázka CODE-tune 16, owner potvrdil
  vlastním slovem Land + Craft).
- **Otevřené — sféry jako jediný zdroj významů runy dne** (otázka CODE-tune 15): „ano“ řekl Gemini, owner vložil jeho text, vlastním slovem
  nepotvrdil. Směr, ne rozhodnutí.
- **Dřívější, platí dál:** knihovna bez API, varianty se člověku neopakují (DECISIONS 2026-11-17 (1)); jedna kratší věta (BACKLOG 18,
  owner 2026-11-21). Další body, jak je předal CODE-tune (neověřeno v DECISIONS): „you/today“ není nutné, zkusí se s ním i bez něj; víc
  moderních významů, u některé runy víc, u jiné míň; variant víc, než se použije, ale musí sedět.

## 2. Craft předefinovaný (Gemini, po PDF)
V PDF byl Craft „ocel, beton, ložisko, akustika“. Teď: **kovářská výheň, dřevo, vlna, nůž, loď, provaz** — tradiční materiál a práce rukou.
Moderní význam nese situace nebo princip ve větě, ne moderní rekvizita.

## 3. Návrh Gemini: Kenaz, režim Land (EN, třetí osoba), doslova
| sféra | věta |
|---|---|
| Insight & Clarity | A fresh crack in the black lava crust reveals the bright orange glow that has been moving underneath all along. |
| Craft & Shaping | Where glacial meltwater meets a hot lava flow, steam rises and raw stone is quenched into jagged obsidian. |
| Drive & Friction | Deep beneath a quiet moss field, water heated by the earth builds pressure until the geyser breaks the surface. |
| Fever & Exposure | Sulfur steam rising from a bare hillside warms the cold air, yet burns the hand that reaches too close to the vent. |

IS podle Gemini psát od základu (slova *hraun, sprunga, hver, hrafntinna*), ne překládat — souhlasí s §2.

## 4. Kontrola (neměřeno nástrojem, jen čtení; a–d od CODE-tune, e–f V4)
- a) Šablona „X does not Y; it simply Z“ v PDF (všechny tři ukázky Kenaz Insight) — ve stovkách variant tik; hlídat strojem.
- b) Kenaz Insight je zase světlo (žhnoucí láva). Owner světlo a oheň všude odmítl (*„skoro všude je světlo, fire, lamp, nelíbí se mi to“*).
- c) Sféry Gemini nikdo neověřil proti jiným runám: Drive & Friction × Uruz / Nauthiz, Fever × Hagalaz / Nauthiz. Owner chce překryv
  *„pořádně zkontrolovat“*.
- d) Craft & Shaping (obsidián) = střet ohně a ledu → může sedět i na Hagalaz nebo Isa.
- e) Drive & Friction (gejzír, tlak pod povrchem) se blíží Perth („skryté vychází na světlo“) — totéž ověřit.
- f) Přírodní fakta (obsidián z lávy zchlazené vodou, gejzír pod mechovým polem) doložit, než půjdou do knihovny (poučení P01).
- g) Měřítko: slepí soudci CODE-tune s podstatou run z `RUNAR_POPISY_RUN.md` zamítnou každý význam, který v ownerově popisu runy nestojí.
  Sféra, která popis rozšiřuje, potřebuje ownerovo slovo dřív, než ji soudci budou posuzovat — jinak propadne vždy.

## 5. Další krok
Sféry Kenaz projít na překryv s ostatními 24 runami (slepý soudce: věta + seznam run, kolikrát trefí Kenaz) — měřítko 4M1 v
[kostra-v4.md](kostra-v4.md). Bez API, v session.
