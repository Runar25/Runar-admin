# v2/assets — designové podklady Rúnara (NEMAZAT)

Obrázky z 2026-05-16/17. **Appka je nenačítá** a nic v kódu na ně neodkazuje — jsou to **podklady pro budoucí vizuál**
(ilustrace, obrazovky, marketing, fyzické produkty). KUKY 2026-10-10: *„nemazat. je to designový podklad. dej tomu nějaké
vysvětlení a odkaz, ať se ví, kde to je, pokud budeme dělat nějaký vizuál.“* Odkaz sem vede z `RUNAR_DESIGN.md` → „Jak vypadá“.

| Soubor | Co na něm je |
|---|---|
| `runar-portrait.png` | Rúnar do pasu: hůl s obsidiánem a runou ᚱ na přívěsku, otevřená dlaň (gesto „pojď“), modré roucho s kožešinou. |
| `runar-fullbody.png` | Character sheet v **modrém rouchu s kožešinou**: zepředu/z boku/zezadu, hůl zvlášť, gesta (dlaň, kniha, založené ruce), hlavy z více úhlů, pruh materiálů a barev. |
| `runar-ceremonial.png` | Totéž v **slavnostním tmavém rouchu se zlatým vyšíváním**; navíc gesto se zářící modrou runou v dlani. |
| `runar-travel.png` | Totéž v **cestovní hnědé výstroji s batohem**. |
| `runar-expressions.png` | 10 výrazů tváře s popisky: Neutral · Happy · Wise/Thoughtful · Surprised · Laughing · Serious · Compassionate · Teaching/Explaining · Mischievous · Reflective/Calm. |
| `sacred-palette.png` | **Agndofa Sacred Color Palette** — 7 barev s hex kódem, jménem a účelem, pod každou ukázkový obraz; dole „The feeling of Agndofa“. |
| `app-moodboard.png` | Moodboard appky z doby návrhu: Rúnar, mockupy obrazovek, paleta, písmo, materiály, ikony, prostředí, styl runových kamenů. |

**Pozor při použití:**
- **Živé barvy appky jsou tokeny v `v2/runar-reader.css`**, ne hexy z obrázků (CLAUDE.md §5, §20). Paleta je původ, ne zdroj pravdy.
- **Moodboard je návrh z května, ne dnešní appka** — obrazovky (Daily Guidance, Streak, Meditation…), písmo a texty na něm
  neodpovídají tomu, co appka dělá. Ber z něj náladu, ne funkce ani copy.
- **Runy na obrázcích jsou kresba generátoru, ne naše glyfy** — v appce vždy `RUNE_SVGS` / `runeSvg()` (CLAUDE.md §5).
- Portrét, který appka skutečně ukazuje, leží v Supabase úložišti (`runar-images/Runar_portrait.png`, `v2/runar-reader.html`).
- `v2/runar-portrait.png` (o složku výš) je **bajtově shodná kopie** `runar-portrait.png` odsud (2026-05-16, pro dřívější úvodní
  sekci); nic ji nenačítá. Ponechána podle ownerova „nemazat“.
