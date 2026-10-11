# v2/assets — designové podklady Rúnara (NEMAZAT)

Obrázky z 2026-05-16/17, ikona z 2026-05-24. **Appka je nenačítá** a nic v kódu na ně neodkazuje — jsou to **podklady pro budoucí vizuál**
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
| `runar-app-icon.svg` | **Ikona appky v plném rozlišení (1254 px):** Rúnar drží kámen se zářící runou ᚱ, za ním kruh modře zářících run, ᚱ i na přívěsku; zaoblený čtverec na černém. Táž kresba jako ikony ve `v2/icons/`, jen větší (pod tabulkou). |

**Pozor při použití:**
- **Živé barvy appky jsou tokeny v `v2/runar-reader.css`**, ne hexy z obrázků (CLAUDE.md §5, §20). Paleta je původ, ne zdroj pravdy.
- **Moodboard je návrh z května, ne dnešní appka** — obrazovky (Daily Guidance, Streak, Meditation…), písmo a texty na něm
  neodpovídají tomu, co appka dělá. Ber z něj náladu, ne funkce ani copy.
- **Runy na obrázcích jsou kresba generátoru, ne naše glyfy** — v appce vždy `RUNE_SVGS` / `runeSvg()` (CLAUDE.md §5).
- Portrét, který appka skutečně ukazuje, leží v Supabase úložišti (`runar-images/Runar_portrait.png`, `v2/runar-reader.html`).
- `v2/runar-portrait.png` (o složku výš) je **bajtově shodná kopie** `runar-portrait.png` odsud (2026-05-16, pro dřívější úvodní
  sekci); nic ji nenačítá. Ponechána podle ownerova „nemazat“.
- **`runar-app-icon.svg` není vektor** — je to obal RealFaviconGeneratoru kolem jednoho PNG 1254×1254 v base64 (proto 3,1 MB;
  metadata C2PA v PNG uvádějí jako generátor OpenAI). Ikony ve `v2/icons/` z něj vznikly: zmenšeno na 32×32 se liší od ikony
  512 px o 0,7 z 255, od zrcadlené o 30 (změřeno 2026-10-11). Do 2026-10-11 ležel jako icons/favicon.svg a od 2026-09-11 ho
  appka nenačítá (důvod v komentáři u ikon ve `v2/runar-reader.html`). **Zpátky do `<link rel="icon">` nepatří** — sem se
  přesunul proto, aby mezi živými ikonami nevypadal jako jedna z nich.
