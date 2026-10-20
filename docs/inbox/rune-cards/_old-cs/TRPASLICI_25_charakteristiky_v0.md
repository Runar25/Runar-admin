# 25 trpaslíků pro 25 run — charakteristiky v0 (Cowork) — K POSOUZENÍ OWNEREM

autor: Cowork · 2026-10-18 · HEAD při čtení `9aacc01` · **Nic z toho není schválené; jména označená „pracovní“ jsou moje, IS neověřená.**

Postup (ownerův): **runa → její význam → trpaslík, který na ni sedí**, ne naopak. Význam beru z `RUNAR_POPISY_RUN.md` (ownerovy popisy: obraz runy, napětí uvnitř ní, otázka) a z `k` v `v2/runar-runes.js`. Tvar charakteristiky je převzatý z toho, jak je postavený Rúnar: `DEF_CHAR_EN` v `v2/runar-character.js` (identity · personality · purpose · never) + „Jak vypadá“ v `RUNAR_DESIGN.md` + character sheet `v2/assets/runar-fullbody.png` + paleta `v2/assets/sacred-palette.png`. Z toho vzniká **prompt pro obraz** (jiný software to nakreslí; já kreslit neumím).

## A. Střety s tím, co repo už říká (nahlásit, ne obejít)

1. **`RUNAR_DESIGN.md` ř. ~486–530, „Dverg pod runou“:** dverg je tam **materiál, ne postava**; ve čtení **nikdy jménem**; „runy bez dverga se nedoplňují vymýšlením“; **Sowilo a Dagaz žádného dverga nemají** (kotva: slunce proměnilo Alvísse v kámen). Ownerův nový nápad (25 run = 25 trpaslíků) je **jiná vrstva — vizuál karet**, ne text čtení. Pokud to tak má být, musí to být v katalogu napsáno (kde se postavy smějí jmenovat a že na čtení se to nepřenáší). → otázka pro ownera/CODE, ne pro mě.
2. **Sowilo a Dagaz:** řešení, které kotvu neláme — **Dagaz = Þjóðreyrir** (katalog sám ho má jako „pant“ u prahu úsvitu), **Sowilo = Suðri**, který stojí **na kraji stínu** a nechává slunce odrazit od obsidiánového zrcadla; do světla nevstupuje. Viz karty.
3. **Nová jména (12 z 25)** jsou **pracovní** a v katalogu `RUNAR_DESIGN.md` nejsou. Podle jeho pravidla („Přidáváš postavu? Nejdřív sem“) se do něj zapíšou **dřív** než se kreslí. IS tvary nechat ověřit CODE.
4. **Gebo (Alfrigg z Brísingar):** DESIGN výslovně: brát **předmět (pouto z pramenů), ne cenu**. V charakteristice je to zakázáno.

## B. Společný základ rodiny (z Rúnara — platí pro všechny)

Z Rúnarova character sheetu a popisu: **Dvergar nejsou komické postavičky** (DESIGN: „prastarý řemeslník kamene“, *dverga-smíði*); ageless 45–65, kompaktní, silné postavy; **spletené vlasy a vousy** s kroužky, řemínky, korálky; **vlněný kabát s kožešinou** a vyšívaným severským **pletencem**; kožená brašna a opasek s **runou jako sponou**; **obsidiánový přívěsek se svítící runou** (whisper blue); **runa na čele**; ošlehaná laskavá tvář; klidná uzemňující přítomnost.
**Co je rodinné (nesmí chybět):** pletenec/šperk ve vousech, runa na čele a na přívěsku = **jeho vlastní runa** (Rúnar má na přívěsku ᚱ), kabát s kožešinou nebo hrubou vlnou, ruční kožené věci.
**Co je jeho (odlišuje bratra):** řemeslo/nářadí v ruce, **jedna barva z palety Agndofy** (whisper blue `#5BB8FF` · obsidian `#1E1E1E` · ember gold `#D6A85C` · rune cloth blue `#2E4A70` · aurora green `#7ED9B5` · frost white `#F2F5F7` · hearthwood `#7D5838`), věk, postava, **místo v islandské krajině** (hraun, stuðlaberg, fjord, turf dům, hver, ledovec, vřesoviště).
**Rúnar** zůstává Rune Keeper — modré roucho, hůl s obsidiánem, otevřená dlaň — **26. nikdo; ostatních 25 jsou jeho bratři a bratranci**, každý jedné runy.

### Společný STYLE LOCK pro prompt (vkládat před každou postavu; přiložit jako referenci `runar-fullbody.png` + `sacred-palette.png`)

> Same character family and same art style as the attached Rúnar character sheet: warm, softly lit, high-detail stylized-realistic 3D look; a sturdy, compact Nordic dwarf of no fixed age (about 45–65), kind weathered eyes, long braided hair and beard with metal rings and leather wraps, wool coat with fur trim and Nordic knotwork embroidery, hand-crafted leather belt and pouch, a faint glowing rune mark on the forehead and an obsidian pendant carrying his own rune in whisper-blue light (#5BB8FF). Not a cartoon, not comic, not fantasy-game armor. Palette from the attached Agndofa palette. Icelandic nature behind him. Portrait composition, character from knees or waist up, calm lower fifth left uncluttered for a text plate. No text, no letters in the image except the glowing runes.

---

## C. 25 charakteristik

Formát každé: **jméno · odkud** → **identity** (kdo je) → **personality** → **purpose** (co v Agndofě dělá) → **sedí na runu, protože** (z popisů) → **look** → **never** → **image prompt (varianta)**. Texty v EN, jsou to zadání (jako `DEF_CHAR_EN`), ne věty, které by Rúnar řekl.

### 1 · Fehu — **Straumr** *(pracovní jméno; ON straumr = proud)* · nový
**identity:** A dwarf who keeps a stream of goods moving along the foot of a glacier meltwater river; nothing stays long in his hands.
**personality:** Generous without being careless, quick to share, never hoards; patient with the time things take to come back.
**purpose:** He passes value from hand to hand — bowls of water, loaves, wool, seed — and knows what each thing is worth only while it moves.
**sedí na runu:** Fehu je „něco, co proudí“, hodnota, která má cenu, jen když se může pohybovat; živá hodnota prochází rukama; „to, co necháš stát, může ztratit svou sílu“.
**look:** Warm, broad, open-handed; ember-gold coat; one hand holding out a wooden scoop of running water, the other open and empty; a small flock of Icelandic sheep drifting into a fold behind him at evening.
**never:** no pile of coins, no chest, no clenched fist, no dragon-hoard imagery.
**prompt:** *Straumr, ember-gold coat, standing at a glacial stream at golden evening, offering a wooden scoop of running water with one open hand, the other palm open and empty; sheep moving toward a stone fold behind him; forehead rune ᚠ and pendant ᚠ glowing faint blue.*

### 2 · Uruz — **Mótsognir** · kánon (první a největší z dvergů, z Ymiho krve)
**identity:** The first of the dwarf-kin and the largest; rough, unfinished, older than the shapes that came after.
**personality:** Slow, heavy, immovable until he moves; not proud of his strength — he only knows it when he needs it.
**purpose:** Lives in the deepest rock under the middle of the island and holds the raw force that later became craft.
**sedí na runu:** Uruz přichází „z místa, kde ještě není hotový tvar“, pratur, síla těla a země, která nepotřebuje předvádět; schopnost proměny, syrovost.
**look:** Heavier and rougher than his kin; rough-hewn features, unpolished stone-grey and hide-brown clothing, an aurochs-hide mantle, ruddy basalt dust on his beard; the braids are plain and thick, not delicate.
**never:** not a brute or barbarian cliché, no spiked armor, no raised weapon — the strength is in being planted.
**prompt:** *Mótsognir, enormous rough-hewn dwarf in an aurochs-hide mantle, standing planted at the mouth of a deep basalt cave, stone dust on his beard, one hand resting on the rock as if it were his own body; forehead rune ᚢ.*

### 3 · Thurisaz — **Þyrnir** *(pracovní jméno; þyrnir = trn)* · nový
**identity:** Warden of a lava-gate in a field of old hraun, where the path narrows between two black ribs of stone.
**personality:** Watchful, plain-spoken, patient; stops people without hostility and lets them see what they were about to walk into.
**purpose:** Holds the doorway so that no one passes in anger or haste; he does not turn anyone away, he only makes them wait a breath.
**sedí na runu:** „Thurisaz stojí u dveří“, trn, okamžik mezi impulsem a činem; „ještě chvíli, podívej se, co se otevřelo“; tvrdost, která ochraňuje.
**look:** A blackthorn staff, one raised flat hand (not a fist) — *wait*; weathered hawthorn-red coat; scratches on his forearms; beyond him a doorway of dark stone with something glimmering that he has not yet let anyone see.
**never:** no menace, no blocking with a weapon, no threatening face — firm, not hostile.
**prompt:** *Þyrnir, dwarf warden with a blackthorn staff, one flat raised palm, standing in a narrow gate between two black lava ribs at dusk, behind him a faintly lit opening; forehead rune ᚦ.*

### 4 · Ansuz — **Alvíss** · kánon (vševědoucí; znal jména všech věcí; chytilo ho svítání)
**identity:** The dwarf who knew the name of every thing; caught by sunrise by Thor's long questioning and turned to stone — in Agndofa a lone rock on the eastern heath.
**personality:** Attentive more than talkative; listens as much as he speaks; knows how much one word can open and how much it can cover.
**purpose:** Keeps words for the moment they are needed; carries the knowledge that a thing said too long loses what it was for.
**sedí na runu:** Ansuz je „slovo, které zazní ve správný okamžik“, hlas, dech, řeč, porozumění, a také **naslouchání**; „co se změní, když opravdu uslyšíš to, co k tobě přichází?“
**look:** One hand cupped behind his ear, mouth just closed; cool grey-white and pale-blue coat; the edge of his cloak and one shoulder already pale as stone, as if the light were slowly arriving; pale eastern heath at first light.
**never:** no open-mouthed orating, no scroll of names, no sage-with-book cliché; no pointed hat or grey wizard imagery.
**prompt:** *Alvíss, dwarf in a cool grey-blue coat, one hand cupped to his ear, listening, the edge of his cloak turning to pale stone in the first light on an eastern heath; forehead rune ᚨ.*

### 5 · Raidho — **Varði** *(pracovní jméno; varða = kamenná mohyla, ukazatel cesty)* · nový
**identity:** Cairn-builder; he lays the stone markers that mark paths across the lava fields and highland heath.
**personality:** Even, rhythmic, unhurried; thinks in steps; never points at a destination — he marks only the way already walked.
**purpose:** Piles stone upon stone so that a path becomes visible *after* it has been walked.
**sedí na runu:** Raidho je „cesta, která už začala“, rytmus kroků, „teprve zpětně je vidět, že vytvořily cestu“; správný způsob, jak jít; „stačí vidět, kde stojíš a jaký je další krok“.
**look:** Carrying one stone, a line of small cairns receding behind and ahead of him across the hraun; weather-worn travel coat, walking boots; staff with a leather strap; moss-green and heath-brown.
**never:** no signpost with arrows, no map, no fixed destination in the frame.
**prompt:** *Varði, dwarf in a weather-worn traveller's coat, lifting one stone onto a cairn, a line of other cairns leading into a misty lava field behind him; forehead rune ᚱ.* — ⚠ ᚱ je i Rúnarovo písmeno na přívěsku: u Varðiho dát runu **jen na čelo**, přívěsek s kamenem bez runy nebo jinou značkou, ať se dvojice nepřipletou.

### 6 · Kenaz — **Eitri (Sindri)** · kánon (kovář; ukoval Mjölni, Draupni, kance Gullinbursti)
**identity:** Master smith in a forge deep under an active, warm earth; one of the two brothers who made the gods' treasures.
**personality:** Precise and absorbed; talks little at the anvil; knows that the light shows the shape but that fire needs fuel and care.
**purpose:** Makes things appear from the dark by light and heat; lets nothing be seen only half.
**sedí na runu:** Kenaz je světlo, které něco odhalí; tvořivý oheň; „oheň potřebuje potravu“; „když světlo dopadne na věc, už ji nemůžeš vidět tak jako předtím“. (DESIGN už Kenaz spojuje s Brokkrem a Eitrim.)
**look:** Leather apron over a dark-red coat, soot, a half-formed piece of glowing metal on the anvil lighting only a small circle — his face, his hands, the tongs; the rest of the forge is dark.
**never:** no huge blaze, no fireball, no magic sparks — a small, controlled light on one task.
**prompt:** *Eitri, dwarf smith at an anvil in a dark forge lit only by the glow of the half-formed metal he holds in tongs, soot on his forearms, leather apron; forehead rune ᚲ.*

### 7 · Gebo — **Alfrigg** (z Brísingar) · kánon (jeden ze čtyř, co ukovali náhrdelník)
**identity:** One of the four craftsmen of the Brísingar, who wove four strands of gold into a single necklace that holds only because the strands hold each other.
**personality:** Open, courteous, easy in company; speaks of what is given, never of what is owed.
**purpose:** Makes things whose whole value is that they pass from one to another.
**sedí na runu:** Gebo je „dar, který vzniká mezi dvěma stranami“; vzájemnost, **není obchod, není účetnictví**; dar, který není vynucený.
**look:** One hand holding out a braid of four gold strands, the other open to receive; ornate but warm gold-and-green coat; a second hand just visible entering the frame to take it.
**never:** ⚠ **DESIGN: předmět, ne cena.** No scene of payment, price, bargaining, a night spent, a ledger, scales or coins.
**prompt:** *Alfrigg, dwarf craftsman holding out a braid of four woven gold strands in one open hand and offering the other hand open, a second hand entering the frame to receive; warm golden light; forehead rune ᚷ.*

### 8 · Wunjo — **Yndi** *(pracovní jméno; yndi = potěšení, radost)* · nový
**identity:** The dwarf of the hearth; his hall is a small, warm, low-roofed turf house at the edge of a valley.
**personality:** Warm, unhurried, a laugh that comes late and stays; makes room for others; does not ask anyone to prove anything.
**purpose:** Keeps the table, the lamp and the cup; he notices when a moment sits right and lets others notice it too.
**sedí na runu:** Wunjo je chvíle, kdy něco zapadne na své místo; radost a sounáležitost uprostřed cesty; „smích u stolu“; „nemusíš nic dokazovat“; „můžeš na chvíli povolit ruce“.
**look:** At a long wooden table with a mug; hearthwood-brown and amber tones; a lantern; relaxed shoulders, hands loosely open; others' empty seats pulled out around him (no one shown).
**never:** no party, no wild cheering, no clinking crowd — a quiet, shared warmth.
**prompt:** *Yndi, dwarf at a low turf-house table, a wooden mug in one relaxed hand, lantern glow and hearth fire, soft late-afternoon light through a small window, an easy half-smile; forehead rune ᚹ.*

### 9 · Hagalaz — **Hagl** *(pracovní jméno; hagl = kroupy)* · nový
**identity:** Dwarf of the storm-flats on the high heath, who has stood through more hailstorms than anyone remembers.
**personality:** Stoic, unsurprised, without anger at the sky; does not ask why — he looks to see what remains.
**purpose:** Stays when the hail comes and shows what had real roots afterwards.
**sedí na runu:** Hagalaz je narušení, které nepřišlo na zavolání; „není trest“; síla, kterou nelze řídit; „co po tom zůstane, když bouře přejde?“; pod ledem může čekat změna.
**look:** Mid-storm: ice grains bouncing off his shoulders, frost in his beard, a coat torn at one edge; he shelters nothing — he stands upright with his head slightly bowed; behind, a heath changed by white pellets.
**never:** no catastrophe, no destruction scene, no lightning drama — a human reaction to weather, not a punishment.
**prompt:** *Hagl, dwarf standing upright in a hailstorm on a bare heath, ice grains bouncing off his shoulders and beard, a slightly torn coat, calm face; forehead rune ᚺ.*

### 10 · Nauthiz — **Nauðr** *(pracovní jméno; nauðr = nutnost, tíseň; nauðeldr = „nouzový oheň“ třený dřevem)* · nový
**identity:** A lean, spare dwarf who lives on little, up where the winter is longest; he kindles *need-fire* by friction when everything else has failed.
**personality:** Honest about what he lacks; does not pretend not to need; distinguishes what he needs from what he only wants.
**purpose:** Knows exactly what is necessary, because he has had to learn it.
**sedí na runu:** Nauthiz je pocit, že něco chybí; potřeba, omezení, nutnost; „tlak, který odděluje potřebu od touhy“; „co ti chybí tak silně, že už nemůžeš předstírat, že to nepotřebuješ?“
**look:** Thinner than his kin; worn, patched, undyed wool; kneeling with two sticks and a tiny ember cupped in both hands, breath held; bare snow around him; the one warm thing in the whole frame is the ember.
**never:** no begging, no despair, no starvation imagery — dignified, focused need.
**prompt:** *Nauðr, lean dwarf in patched undyed wool, kneeling in snow, cupping a single tiny ember between two fire-sticks in both hands, focused face lit from below; forehead rune ᚾ.*

### 11 · Isa — **Dvalin** · kánon (spjatý s runami; „dřímající“); DESIGN už Isu s Dvalinem páruje
**identity:** The dwarf of the stone that sleeps beneath moss; he has never left, only slowed.
**personality:** Still, silent, inward; knows that some things cannot be hurried and that a pause is not an end.
**purpose:** Holds things in place until it is their time.
**sedí na runu:** Isa je ticho, led, zastavení; „pod ledem může voda stále existovat“; soustředění; „co se ukáže, když přestaneš tlačit?“ (DESIGN: „zastaveno nahoře, dole to žije“.)
**look:** Seated on a mossy boulder, eyes half closed, breath not visible; rime on his beard and shoulders; pale blue-white; very little color; a thin sheet of ice around his feet with dark water faintly visible beneath it.
**never:** no corpse, no frozen victim, no sleeping-on-duty — alive, resting, attentive.
**prompt:** *Dvalin, dwarf sitting perfectly still on a mossy boulder, eyes half closed, rime on his beard, a thin sheet of ice at his feet with dark water faintly visible beneath it, pale blue light; forehead rune ᛁ.*

### 12 · Jera — **Ársæll** *(pracovní jméno; ár = rok/úroda; existuje jako islandské jméno)* · nový
**identity:** A farmer-dwarf who tends a small hillside plot and a bilberry heath; he works by seasons, not by days.
**personality:** Unhurried, trusting of time; does not dig up the seed to check; reads outcomes without judgment.
**purpose:** Keeps the cycle: sow, wait, gather — and accepts what the season gives back.
**sedí na runu:** Jera je „čas, který pracuje“; cyklus, úroda; „důsledek“, ne trest; „nemusíš každý den vykopávat semeno“; co jsi zasel, přijde.
**look:** Warm green and brown; a basket of bilberries, a small sickle at his belt; hands stained with berry-blue; a ripe slope behind him in August light.
**never:** no wealth, no heap of grain, no overflowing harvest-cart cliché.
**prompt:** *Ársæll, dwarf farmer in a green-brown coat with a basket of bilberries and berry-stained hands, standing on a ripe heath slope in late-summer light; forehead rune ᛃ.*

### 13 · Eihwaz — **Dáinn** · kánon (jméno sdílí jelen Yggdrasilu; „mrtvý“)
**identity:** The dwarf who stands between two worlds, in the doorway of a stone gate, with a yew staff.
**personality:** Enduring, deliberate; not interested in forcing a change — he is the axis the change turns around.
**purpose:** Holds the passage; the one who stays standing while the old form ends and the new has no shape yet.
**sedí na runu:** Eihwaz stojí mezi dvěma světy; tis, vytrvalost, přechod; „kořen nemusí vědět, jak bude vypadat větev, stačí, že drží“; osa, kolem které musíš projít.
**look:** Deep red-brown yew-bark coat; a long yew staff; stands exactly in the middle of a double doorway, half in light and half in dark; roots seen at his feet.
**never:** no skull, no gravestone, no death-mask drama — duration and transition, not mourning.
**prompt:** *Dáinn, dwarf in a deep red-brown yew-bark coat with a long yew staff, standing exactly in the middle of a stone doorway between a lit side and a dark side, roots at his feet; forehead rune ᛇ.*

### 14 · Perth — **Dulinn** *(pracovní jméno; dulinn = skrytý; v appce `is_n` Perth = „Duldir hlutir“)* · nový
**identity:** A hooded dwarf who carries a closed vessel and has never said what is in it; perhaps he does not know either.
**personality:** Quiet, patient with not knowing; says “not yet” rather than “I don't know”.
**purpose:** Holds the container until the question that opens it is asked.
**sedí na runu:** Perth je nádoba, která něco ukrývá; tajemství, možnost; „ještě nevím“ (ne „nevím nic“); „možná stačí chvíli vydržet s tím, že to ještě nevíš“.
**look:** Hood half raised, both hands around a lidded stone-and-wood vessel held close; head tilted, as if listening to it; deep indigo-grey; a seam of faint light at the vessel's lid.
**never:** no mystic grin, no fortune-teller props (no crystal ball, no cards), no leak of glow that reveals the content.
**prompt:** *Dulinn, hooded dwarf holding a closed lidded vessel close with both hands, head tilted as if listening to it, a hairline of faint light at the lid; deep indigo-grey tones; forehead rune ᛈ.*

### 15 · Algiz — **Norðri** · kánon (drží nebe na severu; pod severním ledovcem)
**identity:** One of the four who hold up the sky; the north one, under the northern glacier.
**personality:** Vigilant but open, not defensive; trusts what the body notices before the mind names it.
**purpose:** Stands with raised arms — open, branching like antlers — guarding without closing.
**sedí na runu:** Algiz se zvedá vzhůru jako paroží; ochrana a bdělost, instinkt, hranice; „ochrana neznamená uzavření, paroží se rozvětvuje do prostoru“. Pózou doslova tvar runy.
**look:** Both arms raised and slightly spread, palms open, as if holding up the sky; ice-blue and silver tones; aurora behind; antler-like branching in the braids of his hair; head slightly up, as if hearing something.
**never:** no shield wall, no clenched stance; protective, not armored.
**prompt:** *Norðri, dwarf standing with both arms raised and palms open as if holding the sky, aurora above, northern glacier behind, antler-like branching braids, head tilted up as if hearing something; forehead rune ᛉ.*

### 16 · Sowilo — **Suðri** · kánon (jižní z čtyř; černé písky) — *s ohledem na kotvu: stojí na kraji stínu*
**identity:** The south one of the four sky-holders, on the black sands; he stands at the edge of the shade at midday.
**personality:** Clear, steady, undramatic; does not need to persuade the sun to shine; he shows, he does not explain.
**purpose:** Reflects the light onto what was hidden without ever stepping into it himself.
**sedí na runu:** Sowilo je slunce po dlouhém putování; jasnost, síla být tím, čím jsi, bez zmenšování; „teď to můžeš vidět“; příliš ostré světlo může oslnit.
**look:** Black volcanic sand beach in strong sun; he stands exactly on the line between shadow and light; in his hands a polished obsidian disc catching the sun and throwing a bright beam across the sand onto something; ember-gold and obsidian.
**never:** ⚠ **kotva:** no dwarf standing in full sunlight; no blinding glare, no “radiant god” image; no rays from his body.
**prompt:** *Suðri, dwarf standing on the edge of shadow at the border with bright midday light on black volcanic sand, holding a polished obsidian disc that throws a clear beam of sunlight across the sand; ember-gold and obsidian tones; forehead rune ᛊ.*

### 17 · Tiwaz — **Örvar** *(pracovní jméno; örvar = šípy)* · nový
**identity:** A fletcher-smith who makes arrows that are straight because he has taken the choice that has a cost.
**personality:** Direct, resolute, quiet in tension; does not seek victory; asks what is worth being carried.
**purpose:** Keeps the line: an arrow's strength is its single axis and its tension before it is released.
**sedí na runu:** Tiwaz je šíp; směr, který něco stojí; odhodlání, odpovědnost; **neříká: vyhraj, říká: za čím stojíš**; šíp může být napnutý dlouho před vypuštěním; „co jsi ochoten nést?“
**look:** A straight arrow-shaft held vertically in one hand, the other hand scarred across the palm; steel-blue and iron tones; plain, straight-lined clothing; steady gaze along the shaft.
**never:** no battle, no victory pose, no drawn bow loosed at a target; no direct Týr-hand-in-wolf copy.
**prompt:** *Örvar, dwarf holding a single straight arrow-shaft vertically, the other palm scarred, steel-blue tones, steady gaze along the shaft, plain straight-cut clothing, a cold bright sky; forehead rune ᛏ.*

### 18 · Berkana — **Móberg** · Agndofa-kánon (mladý dverg tufu, v mladých lávových polích)
**identity:** The youngest of the stone-dwarves, shaping soft tuff; he cares for small beginnings.
**personality:** Gentle, curious, careful not to meddle; knows that too many touches can harm as much as none.
**purpose:** Plants and then steps back; gives a small thing room to grow at its own pace.
**sedí na runu:** Berkana je první zelená větev po zimě; růst, zrození, péče; „to, co je malé, nemusí být slabé“; nechat něco růst, aniž musíš vědět, čím se stane; příliš mnoho zásahů škodí.
**look:** Younger-looking and somewhat smaller than his kin, thinner beard with just beginning braids; tuff-ochre and fresh-green tones; kneeling beside a single birch seedling in a crack of fresh stone, his hands held a little way off it, not touching.
**never:** no giant tree, no “growth montage”; small, hands off.
**prompt:** *Móberg, young-looking dwarf with a thin new braided beard, kneeling beside a tiny birch seedling in a crack of fresh tuff, his hands held just above it without touching, ochre stone and fresh green; forehead rune ᛒ.*

### 19 · Ehwaz — **Jór** *(pracovní jméno; jór = kůň, básnicky)* · nový
**identity:** A horseman-dwarf and his Icelandic horse; he knows the rhythm of two moving as one.
**personality:** Relaxed in the saddle, attentive to the animal, loosens the reins to find the pace.
**purpose:** Moves with something else rather than pushing it.
**sedí na runu:** Ehwaz je pohyb, který vzniká ve dvou; kůň a člověk, důvěra, souhra, ne rychlost; „povolit otěže, aby se objevil skutečný pohyb“; „nejde o to, kdo vede“.
**look:** Walking beside / riding his stocky Icelandic horse across a river ford at an easy tolt; the reins slack; the two are mid-step in matching rhythm; warm brown and heath-gold; the horse's mane braided like his beard.
**never:** no galloping hero charge, no whip or spurs; no domination.
**prompt:** *Jór, dwarf riding his sturdy Icelandic horse across a shallow river ford at an easy pace, reins slack, mane braided like his beard, matched stride; warm brown and heath-gold; forehead rune ᛖ.*

### 20 · Mannaz — **Speki** *(pracovní jméno; speki = moudrost, rozvaha)* · nový
**identity:** The most ordinary-looking of the brothers; he lives among people and listens to how they see each other.
**personality:** Sociable, honest about his own blind spots; learns who he is from who he meets.
**purpose:** Holds the mirror between people so that each can see what they cannot see from inside.
**sedí na runu:** Mannaz je člověk mezi lidmi; zrcadlo; identita ve vztahu k druhým; „kdo jsem, když jsem mezi ostatními?“; vlastní nedokonalost; někdo nebo něco jako zrcadlo.
**look:** Plain, friendly face, middle-aged, ordinary wool and leather, no showy ornament; a small bronze hand-mirror held at an angle so we see another face in it (not his); a still pool behind; open, slightly surprised expression.
**never:** no vanity mirror pose, no ghostly double; the face in the mirror is someone else's.
**prompt:** *Speki, ordinary-looking friendly middle-aged dwarf holding a small bronze hand-mirror at an angle so another person's face is reflected, a still pool behind him, simple wool and leather, a slightly surprised kind look; forehead rune ᛗ.*

### 21 · Laguz — **Lögr** *(pracovní jméno; lögr = voda, moře)* · nový
**identity:** A dwarf of the springs and the dark water in caves; he lives where water goes under the ground and comes up again.
**personality:** Fluid, dreamlike, listens to depths; does not insist that every feeling is truth.
**purpose:** Watches what moves under the surface and learns when to follow it.
**sedí na runu:** Laguz je voda; intuice, emoce, hluboké vnímání; hledá si cestu mezi kameny, ztrácí se pod zemí, vrací se; „ne každý pocit je pravda“; „chvíli poslouchat hladinu“.
**look:** Seated at the edge of a steaming geothermal pool or a cave-pool; deep teal and aurora-green; hair and beard hang like flowing strands; both hands gently lowered into the water; the surface shows a sky he is not looking at.
**never:** no mermaid/sea-god look, no trident, no storm waves.
**prompt:** *Lögr, dwarf kneeling at the edge of a dark cave-pool with both hands resting just under the surface, deep teal and aurora-green light on his hair and beard, the water reflecting an aurora sky; forehead rune ᛚ.*

### 22 · Ingwaz — **Lyngri** · Agndofa-kánon (nejmenší; kořeny lyngu ve spárách hraunů)
**identity:** The smallest of the stone-dwarves, tending heather roots in the cracks of the lava; he carries messages between stone and surface.
**personality:** Inward, patient, holds things until they are ready; does not rush to send what is not finished.
**purpose:** Lets a thing finish inside itself before it is brought out.
**sedí na runu:** Ingwaz je semeno ukryté v zemi; zrání, uzavření cyklu; „zvenku se zdá, že se nic neděje, ale uvnitř dozrává“; „co ve mně už dozrálo natolik, že to nemusím držet uvnitř?“
**look:** Smaller than his brothers; curled in a hollow of mossy lava, a round seed-like stone cupped in both hands against his chest, eyes closed; heather-purple and moss-green; roots through the crack under him.
**never:** no cute-gnome look, no giant glowing seed; modest and sealed.
**prompt:** *Lyngri, the smallest dwarf, curled in a mossy hollow of black lava, a round seed-like stone cupped against his chest, eyes closed, heather roots visible through the stone beneath him, soft purple-green light; forehead rune ᛜ.*

### 23 · Othila — **Durinn** · kánon (druhý po Mótsognim; podle něj se tvořili další; prastarý bazalt v řadách)
**identity:** The dwarf at whose pattern others were made; he lives among ancient basalt columns standing in rows.
**personality:** Dignified, rooted, reflective; knows that an inheritance is both a root and a decision.
**purpose:** Keeps what has been handed on, and asks each heir what they will carry.
**sedí na runu:** Othila je místo, kam se vracíš; dědictví, kořeny, dům, příběhy, hodnoty; dvě tváře: „tady jsou tvoje kořeny“ / „co z nich chceš nést dál?“; část můžeš položit zpátky na zem.
**look:** An elder with a long white-silver braided beard threaded with many small rings (generations); standing in the door of a turf house against basalt columns; a worn heirloom belt buckle; one hand resting on the lintel, the other holding out a small object, palm up, not insisting.
**never:** no throne, no crown, no genealogical scroll; not a patriarch lecturing.
**prompt:** *Durinn, elderly dwarf with a long silver braided beard threaded with many small rings, standing in the doorway of a turf house against a backdrop of basalt columns, one hand on the lintel, the other held out palm-up with a small worn object; forehead rune ᛟ.*

### 24 · Dagaz — **Þjóðreyrir** · kánon (zaříkává u prahu úsvitu; jediný dverg spjatý se dnem; podle DESIGN „pant, kde se skryté překlápí v odhalené“)
**identity:** The dwarf at the threshold of dawn, who speaks at the door of day (Hávamál 160).
**personality:** Quiet, receptive; does not announce a new day — he notices it before others do.
**purpose:** Keeps the line where night turns to light and tells no one what is on the other side.
**sedí na runu:** Dagaz je okamžik, kdy se noc láme ve světlo; průlom, změna perspektivy; „nejsi už tam, kde jsi byl, ale ještě nestojíš na druhé straně“; „možná už stojíš v prahu“.
**look:** Standing in a stone doorway at the edge of a fjord, the first thin line of light on the horizon; half his face in blue night, half in the first gold; one hand on the door-frame, one palm open at his side; deep blue turning to gold.
**never:** ⚠ **kotva:** he is *at* the threshold, not in the full sun; no dazzling sunrise, no raised arms in glory.
**prompt:** *Þjóðreyrir, dwarf standing in a stone doorway at the edge of a fjord, the first thin line of gold on the horizon lighting half his face while the other half remains in blue night, one hand on the door-frame; forehead rune ᛞ.*

### 25 · Blank (Unknown) — **Gandálfr** · kánon-jen-jméno (v Dvergatalu jen jméno, bez příběhu)
**identity:** A dwarf known only by a name; the poem gives him no story.
**personality:** Open, undefined, unhurried; does not fill the gap with a ready answer.
**purpose:** Stands for the page where nothing is written; lets the empty space stay empty until life writes into it.
**sedí na runu:** Prázdná runa nemá znak; „pauza v příběhu, stránka je otevřená“; nehledej význam, kde žádný není; „co v mém životě ještě nemá jméno — dokážu to chvíli nechat otevřené?“
**look:** **No rune on his forehead** and a **blank unmarked stone** pendant — the only dwarf with neither; plain undyed grey-white clothing; holds out an unmarked, smooth flat stone on his open palm; a pale, empty horizon.
**never:** ⚠ **not Tolkien's Gandalf:** no pointed hat, no grey wizard cloak, no long staff, no pipe; not a shadow or void-demon; no “Odin” attributes in the image.
**prompt:** *Gandálfr, dwarf in plain undyed clothing, smooth forehead with no rune mark, a blank unmarked stone pendant, holding out a smooth flat unmarked stone on one open palm against a pale empty horizon; no pointed hat, no wizard robes.*

---

## D. Co v tom nesedí / co si nejsem jistý (nejsilnější argumenty proti)

1. **Ověřeno grepem v `v2/runar-names-registry.js` (2026-10-18):** pět jmen **je v registru islandských osobních jmen** (Þyrnir, Varði, Ársæll, Örvar a Móberg) — jsou to tedy skutečná jména lidí, ne jen dvergí; to nevadí, ale CODE ať ví. Ostatních deset v registru není.
2. **Jména (12 pracovních)** jsou mé, ne z katalogu; ON/IS tvary (např. *Straumr, Þyrnir, Varði, Yndi, Hagl, Nauðr, Ársæll, Dulinn, Örvar, Jór, Speki, Lögr*) jsem neověřoval. U IS by CODE mělo zkontrolovat tvary a že nekolidují s `runar-names.js` / `runar-names-registry.js` (uživatelská jména!).
3. **Nauðr / Dulinn / Hagl:** tři „těžké“ runy — hrozí, že to vypadá chmurně; popisy ale výslovně říkají „není trest“ a „není prázdná“. Hlídat při kreslení.
4. **Raidho a Rúnar mají obě ᚱ:** viz poznámka u Varðiho.
5. **Dva dvergy (Kenaz Eitri / Ehwaz Jór)** nahrazují dvojici „Brokkr a Eitri“ z DESIGN — Brokkr zůstává nevyužit (DESIGN o něm píše jen pro Kenaz, takže nic nerozbíjí).
6. **Nevyužitelní z katalogu:** Austri, Vestri, Fjalar a Galar, Andvari, synové Ivaldiho, Regin atd. — bez role. Záměrně: Fjalar/Galar jsou vrazi, Andvari střeží (Fehu je o proudění), synové Ivaldiho jsou víc než jedna postava.
7. **Konzistence obrazů:** 25 postav z jednoho generátoru podle dvou referencí je nejtěžší technická část; rodinné znaky (sekce B) nesmí tiše mizet.
8. **Rúnar není jeden (DESIGN ř. 22):** 25 pojmenovaných bratří nekoliduje, pokud jsou jen vizuál karet. Jakmile by karta mluvila (radila), je to věštění — zakázáno.

## E. Co od ownera potřebuji

Projít 25 řádků **„sedí na runu“** a říct, u kterých trpaslík **nesedí** na význam (ten je jádro práce). Až potom se z toho dělá finální charakteristika a prompt.
