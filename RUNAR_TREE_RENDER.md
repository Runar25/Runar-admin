# RUNAR_TREE_RENDER.md — Vizualizace stromu: materiál vs pravda
# Vznik: 2026-07-09 · Cowork · ZÁKLAD k art direction (ne finální spec). Stavíme na tom.
# Doména: TREE vizuál. Vstupní bod stromu = RUNAR_TREE.md (co/proč). Tady = JAK to vypadá.

---

## 0. Princip (drží to celé)
**Diffusion / foto = najdi VZHLED (materiál, paleta). Renderer (canvas → SVG) = PRAVDA (struktura, deterministická, tvoje, reprodukovatelná, laser-ready).**
Diffusion NIKDY nevyrábí strom — vyrábí materiál, který se pak zakóduje deterministicky. Model ti nedá věrný výstup z tvého tree-data modelu; dá pokaždé jiný hezký strom bez vazby na data. A pro CNC/laser je generovaný raster nepoužitelný — tam potřebuješ vektor. → cesta zůstává **canvas → SVG export → laser/CNC**.
(Je to ten samý princip jako image pool: „omez materiál, uvolni kompozici" — jen o patro výš.)

## 1. Materiál = DATA-DRIVEN (krása nese význam)
Strom je TY → textura má nést tentýž význam jako struktura, ne být dekorace:
- stará rozpraskaná kůra = větve z **dávných** čtení (věk)
- svěží zelené výhony = **čerstvá** čtení (mladé)
- **element** = tón kůry + záře listů
- **sezónní** nádech listů = kdy jsi četl
→ „krásný strom" se nerozejde s „tvůj strom". Vizuál a interpretace jsou jedno.

## 2. Dvě kůže, jedna struktura
Stejná deterministická STRUKTURA (limby / cesty) → dva render-cíle:
- **Obrazovka (app):** bohatá, malířská, texturovaná (raster OK na canvasu).
- **Laser / CNC:** čistý **vektor** (linka / výplň / šrafura), žádné foto.

## 3. Materiálové sloty (co plnit — vše procedurální, f(data), informované referencí)
| Slot | Přístup | Řízeno |
|---|---|---|
| **Kůra** | procedurální, sleduje limbu. **NE nalepené foto** (tiluje se, nesedí na větev, je pro všechny stejné = rozbije „tvůj strom"). Foto/diffusion = jen reference (paleta jasanu, směr vláken, žebrování). | **f(věk):** mladá hladká šedozelená → stará rozpraskaná šedohnědá. Element = jemný tón. |
| **Listy** | jasan = **složený list** (5–13 lístků, charakteristický). Řídké, decentní (strom = struktura, ne hustý baldachýn). | element-tint + sezónní nádech · bloom fáze (silueta→růst→plno→olistění) · shimmer vzácný |
| **Mladé vs staré větve** | taper + kůra + barva společně. da Vinci taper (zachování průřezu). | **f(věk/vigor):** mladý výhon tenký/hladký/zelený; stará limba tlustá/rozpraskaná/tmavá/gnarled |
| **Dřevo / světlo / pozadí** | malířské 3-vrstvé stínování (už je), světlo zleva-shora; pozadí = materiálová plate. | tady **diffusion pomůže nejvíc** |

## 4. Workflow (jak vzniká vzhled)
**Gemini (Flow / Veo / Imagen)** =
- **art-direction studie** — jak má jasan působit (akvarel? rytina? malířský realismus?)
- **textury / material plates** pod strukturální vrstvu
- **marketing a app-store vizuály** pro Agndofa
- **animované koncepty pro Sigrún** (bez psaní kódu)

→ vybereš vzhled → přeloží se do **RUNAR_CONFIG konstant + procedurálních textur** → **renderer to dělá sám**, deterministicky.
**Foto kůry / diffusion = reference, NIKDY render stromu.**

## 5. Stav + další krok
STATUS: **foundation / úvaha.** Nic z toho není spec ani v kódu.
Další praktický krok: zadat Gemini **2–3 art-direction studie jasanu** (různé směry — akvarel / rytina / realismus), vybrat vzhled, teprve pak konstanty.

---
*Vazba: RUNAR_TREE.md = struktura/význam (co/proč) · tento doc = materiál/vzhled (jak) · RUNAR_TREE_SPECIALS.md = speciální motivy · RUNAR_TREE_TODO.md = stav labu.*
