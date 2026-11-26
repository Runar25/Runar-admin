# Runa dne ve V4 — sféry × režim obrazu (od 2026-11-26)

**Vlastní jen:** obsah runy dne podle V4 (sféry, režimy obrazu, návrhy od Gemini a jejich kontrolu). Knihovnu v produkci vlastní CODE-tune
(`supabase/functions/_shared/runa_dne_knihovna.mjs`, DECISIONS 2026-11-17 (1)); dřívější lab runy dne `docs/eval/2026-11-14-runa-dne/`.
Rozhovor ownera s Gemini o runě dne přeposílá CODE-tune (owner 2026-11-26: *„zatím ti sem budu vkládat, co řešíme kolem denní runy s Gemini.
Budeš to předávat Code V4“*).

## 1. Rozhodnutí ownera
- **2026-11-26:** *„vidím to tak, že Land a Craft by pro nás měly být směry, kudy se vydat“* → režimy obrazu **Land** (islandská příroda) a
  **Craft** (práce rukou); **Current** (město, technologie) zatím ne. Varianty runy dne = sféra × režim (otázka CODE-tune 16, owner potvrdil
  vlastním slovem Land + Craft).
- **2026-11-26 (přes CODE-tune, otázka 13):** *„obraz i význam v jedné větě“* → věta runy dne není čistý obraz; nese obraz i význam a je kratší.
  Důvod otázky: věta stojí sama a nic pod ní význam nevysvětlí (hlášení af3970a4, Sowilo: *„obraz je v pohodě, ale … hůř chápe, co má
  znázorňovat“*); vzor d1dce7ef. Věty Gemini v oddílu 3 a 4b (čistý obraz, 19–20 slov) proto v té podobě neprojdou.
- **2026-11-26 (9):** *„sorry. změna. bude to řešit V4. všechno.“* → věty runy dne (návrhy, překryv s jinými runami, IS od základu, fakta)
  navrhuje a kontroluje lab V4; CODE-tune přeposílá rozhovor s Gemini a hotové věty nasadí do knihovny. (8) neplatí.
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

## 4b. Gemini, odpověď 2 na kontrolu e–f (přeposlal CODE-tune 2026-11-26, owner bez komentáře)
**Gemini k e):** gejzír má v sobě čekání na skrytý okamžik výstřelu — to je podle něj čistě Perth; Kenaz je kontinuální žár a tření, které si
razí cestu nebo taví odpor. → Gemini výhradu e) přijal, gejzír u Kenaz nahradil.

**Gemini k f) — tvrzení, ne zdroj:** obsidián (*hrafntinna*) vzniká rychlým ochlazením ryolitové lávy při styku s vodou nebo ledem, u čedičové
lávy spíš sklovitá kůra nebo hyaloklastit; žár proti ledu pod ledovci (Katla, Grímsvötn); fumaroly (Námafjall / Hverir) mají u ústí kolem
100 °C i víc. **Stav: neověřeno** — jiný model není zdroj.

**Opravené věty Kenaz Land (doslova):**
| sféra | věta | změna |
|---|---|---|
| Insight & Clarity | A fresh crack in the black lava crust reveals the bright orange glow that has been moving underneath all along. | beze změny (Gemini: Krafla, Fagradalsfjall) |
| Craft & Shaping | Where glacial meltwater meets advancing lava, clouds of steam rise as molten rock cools into sharp, glassy stone. | obsidián → „glassy stone“ |
| Drive & Friction | Magma forcing its way upward through solid basalt melts the rock along its edges until a new fissure opens at the surface. | gejzír → trhlinová erupce |
| Fever & Exposure | Steam rising from a sulfur vent warms the freezing air around it, yet scalds any bare skin that comes too close. | „burns the hand“ → „scalds bare skin“ |

Gemini nabízí stejně Isa, Uruz, Ansuz a ptá se na přesné názvy sfér V4 pro ně — názvy sfér owner zatím neurčil.

**Kontrola odpovědi 2 (neměřeno, jen čtení):**
- h) *(CODE-tune)* Drive & Friction: magmatická žíla se podle CODE-tune šíří hlavně lámáním horniny tlakem, tavení stěn je vedlejší →
  „melts the rock along its edges“ doložit. Průnik na povrch se může krýt s Hagalaz (rozbíjející síla) nebo Thurisaz (síla, která prorazí).
- i) *(CODE-tune)* výhrada b) nevyřešená: Insight zůstal žár a světlo.
- j) *(CODE-tune)* Craft & Shaping je dál příroda, ne lidská ruka; řemeslo patří do režimu Craft — název sféry a režim se pletou.
- k) *(CODE-tune)* tři ze čtyř vět jsou láva nebo magma → kulisa se opakuje. *(V4)* Proti ownerovu „rozmanitost je nutná“ a proti
  měřítku 4M3 (sféry téže runy se mají rozlišit): čtyři sféry v jedné kulise se slejí.
- l) *(CODE-tune)* všechny čtyři věty jsou čistý obraz bez významu, 19–20 slov. Ownerův vzor runy dne (hlášení d1dce7ef, 2026-11-21) je kratší
  věta s významem: *„Something unexpected may reveal what was never as firmly in place as it seemed.“* → rozhodnuto (7): obraz i význam
  v jedné kratší větě.
- m) *(V4)* Kenaz Fever & Exposure stojí dál na tvrzení „Kenaz = horečka / vřed“ bez zdroje (zasady-pusobeni oddíl 4, pro-gemini-1 otázka 6).

## 5. Další krok
Sféry Kenaz projít na překryv s ostatními 24 runami (slepý soudce: věta + seznam run, kolikrát trefí Kenaz) — měřítko 4M1 v
[kostra-v4.md](kostra-v4.md). Bez API, v session.
