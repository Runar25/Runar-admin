# Snapshot 2026-10-05 — CODE-read: Vegvísir ODLOŽEN, kde jsme skončili (práce 2026-09-27)

Historický záznam ke dni — **stav vlastní `RUNAR_BACKLOG.md` (sekce Vegvísir) a `git log`**, ne tenhle soubor.
Owner 2026-10-05: *„vegvísir zatím odkládáme. Vrátíme se k tomu. Zapiš si, co jsme tu probrali."*

## Co je rozhodnuté (vlastník = RUNAR_DECISIONS.md 2026-09-27)
- (3) statický svět scén napřed, vlastní slova později · mezi rameny se **nic nepřenáší** (přenos = varianta k testu) · krajiny,
  momenty, krajinný graf a osa „nit" **odloženy** · životní runa jako rameno = v1 NE (2026-08-25), alternativa v šuplíku.
- (4) **OPRAVA:** Vegvísir NENÍ jen anglicky — owner navrhuje v EN, **IS dělá CODE-read** · uživatel píše **CESTU** (a co na ní najde,
  potká, zastaví se), **ne vztah**; *„What passes between me and this place?"* = otázka, kterou si člověk položí zpětně (Ask).
- (6) rameno **BEZ středu** (životní runa do promptu ramene nejde) · vazbu životní × tažená runa nese **Ask**.
- `you` ve čtení není tvrzení (memory `rozkaz-a-studene-cteni-hranice` bod 3).

## Co je změřené (vlastník = RUNAR_EVAL_LOG.md 2026-09-27 (1)–(4), data `docs/eval/2026-09-27-vegvisir-scena/`)
- (1) formulace scény: Q1 *„What passes between me and this place?"* předvede Gebo 3/4 (ostatní 0–1/4).
- (2) cesta bez středu drží cestu 4/4, se středem 0/4 (Rúnar vnutí Gebo do každé cesty).
- (3) IS rameno: kolo 2 bez zavírání (3/8 → 0/8); meta *mynd* jde z produkčního `_noColdRead('is')` „Lýstu myndinni".
- (4) hranice cesty — 6 druhů vstupu (pohyb · zastavení · nález · setkání · dar · pohled do dálky): **EN drží vše** (kvalita 4,0),
  IS 3,0/2,8 a **definuje runu 12/12** (hypotéza „nese to blok korekcí" padla) · runa si přinese **živel** (Isa led, Dagaz svítání) 8/8 ·
  IS vymýšlí rčení/lore (*„Í Agndofa er sagt…"*) · řádek korekce Fehu prosákl doslova → owner smazal 2 řádky (DECISIONS (11)).

## Kde jsme skončili — co visí (navázat odtud)
1. **Owner neposoudil 12 anglických čtení** z testu hranic (ukázána celá v chatu 2026-09-27; texty `spektrum.jsonl`, lang=en).
   Moje poznámky: Fehu v3 a Dagaz v3 runu nejmenují · Isa scénu zamrazí · Ehwaz „kůň" vedle ptáka · Raidho v2 hádanka, v3 poučka.
2. **Živel runy ve scéně** (Isa → led k „zastavím se") — povolit, nebo ne? Rozhodne owner.
3. **IS:** definice runy 12/12 a vymyšlená rčení — další páka k testu: hlavička bez klíčových slov runy (netestováno).
4. Prompt ramene **v3** (*„what is happening on their way"*, vlastní věta proti studenému čtení místo „Describe the image") — EN beze
   ztráty; IS konec v3 vyrobil formuli „Vindurinn…" 7/12.
5. Islandská gramatika: jednorázové chyby shody (*hvert skref*, *vegurinn liggur*) — žádný nový vzor do korekcí.

## Lekce
- *„Teď to dělám anglicky"* = pracovní postup, ne rozhodnutí o jazyce produktu (memory `ownerovo-slovo-neni-spec`).
- Patch/zápis přes heredoc a Python s uvozovkami padal opakovaně → skripty přes Write (memory `heredoc-mangles-backslash-escapes`).
- Ownerovi vždy celé texty, ne tabulku soudce (*„nespokojím se jen s tvým odhadem"*) — memory `always-show-reading-samples`.
