# PRÁCE PRO COWORK — visitor: 5 odemčených run místo 1 (Fehu)

zadal CODE-reader [tune] · 2026-08-02 · rozhodl KUKY

## PROČ
Visitor má teď odemčenou jen **Fehu** (`runar-app.js:883` `locked = isVisitor && r.n !== 'Fehu'`).
Jedna runa bez live čtení = slabá ochutnávka. KUKY: dát **pocit plné řady — 5 run**, ať
visitor uvidí **rozsah Rúnarova hlasu**, ne pět podobných.

## CO VYBRAT (Cowork = obsah/design)
**5 run napříč ætty a náladami:**
- napříč všemi třemi ætty (freya · heimdall · tyr — viz `runar-runes.js` pole `aett`)
- pestré nálady: jedna **světlá**, jedna **studená** (Isa nebo Hagalaz), jedna **akční** —
  aby ochutnávka ukázala šíři hlasu, ne monotónní řadu
- Fehu („rune of beginnings") nejspíš zůstává jako jedna z pěti — na tobě

## PODMÍNKA (klíčová — bez ní visitor odemkne prázdno)
Visitor nemá live proxy → dostane **předgenerovaný static** z tabulky `runar_static_audio`.
KUKY říká, že static jsou „vygenerované dávno". **Vyber 5 jen z run, které MAJÍ ready
static (EN + IS).** Které to jsou = DB dotaz (`runar_static_audio` where ready) — to CODE
ani Cowork nevidí z repa; **potvrď u KUKYho / v shrine admin**, které runy static mají,
a vybírej jen z nich. Pokud některá vybraná static nemá, buď ji nahraď, nebo se dogeneruje
v teach (teach čtení teď funguje).

## OVĚŘ KVALITU
Přečti static čtení těch 5 run (EN + IS) — ať ochutnávka drží úroveň (žádné useknuté,
žádný raw JSON, IS gramatika OK). Cokoli slabého → přegeneruj v teach.

## COPY (Cowork)
Intro visitor collection je teď o Fehu (`runar-app.js:872`):
  „You walk here as a Visitor. Fehu — the rune of beginnings — opens its voice to you
   freely. Draw it. …"
Navrhni **EN + IS** verzi pro 5 run (pocit plné řady, ne výčet jmen). Drž hlas značky.

## PŘEDEJ CODE
1. **Přesná jména 5 run** (jak jsou v `RUNES.n`, EN forma — Fehu, Isa, Tiwaz, …)
2. **Nový intro copy** (EN + IS)
→ CODE-tune udělá unlock gate (`locked` na seznam) + intro + projde full-path (§13:
   collection, reading tab, resetReader). Kód je malý; čeká na tvůj výběr + copy.

## MIMO ROZSAH (nedělat)
Kód (gate/intro) = CODE. Static generování jednotlivých run = teach (až kdyby chyběl).
