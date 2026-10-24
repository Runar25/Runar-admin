# Dverg Tarot — 25 × 5 criteria table (phase 1, step 1) — v0 for owner review

author: Cowork · 2026-10-21 · repo HEAD verified live: `3c2ed59` · status: **draft, nothing here is approved**
input: `dverg-tarot/postavy/DWARVES_25_characterizations_v0_EN.md` (called **v0** below) · method: brief §4.4 (origin tags) and §4.5 (five criteria)
language: English (card material). Quotes from the owner's Czech texts are given in Czech with an English gloss.

---

## 0. How to read this

**Rule from the brief:** no citation = the judgment does not count. Every cell below carries a citation key (section 4).

**Origin tags** (brief §4.4): **[pramen]** = what a source actually says · **[odvození]** = what reasonably follows from it · **[naše]** = invented for Agndofa.

**Scales**
- Criterion 1 (mythological support): **Story** = a specific attested act or function relevant to the rune · **Hook** = attested, but only a name-level or partly relevant fact · **Name only** · **None found**.
  "None found" means *not in the stanzas I actually read* (Völuspá 9–16 as printed on the source page). It does **not** mean "no such dwarf exists" — the full Dvergatal (other manuscripts, Gylfaginning list) was not checked.
- Criteria 2–5: **Strong / Mixed / Weak**.

**Honest limits**
- **Criteria 3–5 are predictions.** No image exists and nothing has been shown to a person (brief §3, §10). The evidence for them is a quoted line from v0; the judgment is mine.
- **Criterion 2 is the most checkable** — it compares two texts (the owner's rune description and v0's dwarf). It is also the easiest to over-rate, because a vague rune text fits many dwarves. Section 5 proposes a way to attack it.
- 5 of the 9 external sources are Wikipedia articles (secondary). Marked "secondary" wherever used.
- Name forms (ON/IS) are **not checked** — `is-vazba.py` / `is-grammar-qa.py` were not run here (brief §10).

---

## 1. Matrix

| # | Rune | Dwarf | Origin | 1 Myth | 2 Fit | 3 Legible | 4 Original | 5 Reading | Main flag |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Fehu | Straumr | [naše] | None found | Strong | Mixed | Mixed | Strong | water duplicates Laguz |
| 2 | Uruz | Mótsognir | [pramen]+[odvození] | Hook | Strong | Mixed | Weak | Strong | "mountain dwarf" cliché; "Ymir's blood" not in the stanza |
| 3 | Thurisaz | Þyrnir | [naše] | None found | Mixed | Strong | Mixed | Strong | v0 drops the "breaks what must not hold" side |
| 4 | Ansuz | Alvíss | [pramen]+[odvození] | Story | Strong | Mixed | Strong | Mixed | stone ending is not in the stanza read; reads as a verdict |
| 5 | Raidho | Varði | [naše] | None found | Strong | Mixed | Strong | Strong | v0 contradicts itself (cairns "ahead"); ᚱ clash |
| 6 | Kenaz | Eitri | [pramen, secondary]+[odvození] | Story | Strong | Strong | Weak | Strong | generic smith; Eitri = Sindri not source-stated |
| 7 | Gebo | Alfrigg | [pramen]+[naše] | Story | Mixed | Strong | Mixed | Strong | his only myth is a purchase |
| 8 | Wunjo | Yndi | [naše] | None found | Strong | Mixed | Weak | Strong | turf house duplicates Othila |
| 9 | Hagalaz | Hagl | [naše] | None found | Strong | Strong | Mixed | Strong | stoic pose may preach endurance |
| 10 | Nauthiz | Nauðr | [naše] | None found | Strong | Strong | Strong | Strong | small fire near Kenaz |
| 11 | Isa | Dvalin | [pramen]+[odvození] | Hook | Strong | Mixed | Mixed | Strong | crowding (study admits it) |
| 12 | Jera | Ársæll | [naše] | None found | Mixed | Mixed | Weak | Mixed | shows the harvest, not the waiting |
| 13 | Eihwaz | Dáinn | [pramen]+[odvození] | Hook | Mixed | Strong | Weak | Strong | elf in Hávamál, dwarf in Völuspá; doorway repeats |
| 14 | Perth | Dulinn | [naše] | None found | Strong | Mixed | Mixed | Strong | hood hides the face |
| 15 | Algiz | Norðri | [pramen]+[naše] | Story | Mixed | Strong | Strong | Strong | myth = carrying a burden, rune = watchfulness |
| 16 | Sowilo | Suðri | [pramen name]+[naše] | Hook | **Weak** | Mixed | Strong | Mixed | "stays out of the light" vs "strength not to shrink" |
| 17 | Tiwaz | Örvar | [naše] | None found | Strong | Mixed | Mixed | Strong | the cost (scar) is a tiny detail |
| 18 | Berkana | Móberg | [naše] (Agndofa) | None found | Strong | Strong | Strong | Strong | seed/growth trio with 12 and 22 |
| 19 | Ehwaz | Jór | [naše] | None found | Strong | Strong | Mixed | Strong | — |
| 20 | Mannaz | Speki | [naše] | None found | Strong | Mixed | Mixed | Strong | "no ornament" vs the style lock |
| 21 | Laguz | Lögr | [naše] | None found | Strong | Mixed | Mixed | Strong | water duplicates Fehu |
| 22 | Ingwaz | Lyngri | [naše] (Agndofa) | None found | Strong | Mixed | Weak | Strong | still pose duplicates Isa; cute-gnome risk |
| 23 | Othila | Durinn | [pramen]+[odvození] | Hook | Mixed | Mixed | Weak | Strong | Gandalf-elder trope; Tolkien's Durin; doorway |
| 24 | Dagaz | Þjóðreyrir | [pramen]+[odvození] | Story (1 line) | Strong | Mixed | Mixed | Strong | doorway repeats; stanza text not seen |
| 25 | Blank | Gandálfr | [pramen name only] | Name only | Strong | Mixed | Weak | Strong | reads as Gandalf; Blank is a modern addition |

**Tally (counted from the table):** criterion 1 — Story 5 · Hook 5 · Name only 1 · None found 14. Of the 14, 12 are v0's working names and 2 (Móberg, Lyngri) are labelled `[Agndofa]` in `RUNAR_DESIGN.md`. So **11 of 25 dwarves have any Norse attestation**, not 13 (the README and brief count 13).

---

## 2. Evidence per rune

Format of each line: **rating** — reason, with citation keys. Czech quotes are from `RUNAR_POPISY_RUN.md` [POP].

### 1 · Fehu — Straumr — [naše]
1. **None found.** Not among the names in [VOL] 10–16. "Stream" is v0's gloss; ON form unchecked.
2. **Strong.** [POP]: "Fehu je něco, co proudí" (Fehu is something that flows) ↔ [v0]: "keeps a stream of goods moving". Caveat: [K] opens with "wealth, cattle, material prosperity"; v0 follows the owner's text, not [K].
3. **Mixed.** [v0] look: "a wooden scoop of running water… sheep drifting into a fold". Three props; the water-scoop gesture is also what Laguz (#21) does.
4. **Mixed.** Nothing in [v0] separates him from a generic generous farmer beyond the glacier stream.
5. **Strong.** [v0] never: "no pile of coins, no chest, no clenched fist" — the image cannot promise wealth; the empty open hand leaves [POP]'s closing question open.

### 2 · Uruz — Mótsognir — [pramen] + [odvození]
1. **Hook.** [VOL] 10: "Þar var Mótsognir mæztr um orðinn dverga allra, en Durinn annarr" — "Then was Mötsognir created greatest of all the dwarfs, and Durin second" (Thorpe 1866). Nothing else is said about him. Note: [DES] says "from Ymir's blood"; [VOL] 9 says the dwarf race was made "ór Brimis blóði ok ór Bláins leggjum" (from Brimir's blood and Bláinn's bones). Equating Brimir/Bláinn with Ymir is an interpretation I did not check → [odvození].
2. **Strong.** [POP]: "Uruz přichází z místa, kde ještě není hotový tvar" (comes from a place where there is no finished shape yet) ↔ the first, largest, unfinished dwarf. The aurochs link rides on the mantle, not on the myth.
3. **Mixed.** [v0] look: "one hand resting on the rock as if it were his own body". [POP]: "Je to síla, kterou poznáš ve chvíli, kdy ji potřebuješ" (a strength you recognise when you need it) — hard to draw in a still frame; may read as only big and old.
4. **Weak.** "Enormous rough-hewn dwarf in an aurochs-hide mantle" [v0] is close to the stock mountain dwarf; only the hand-on-rock gesture is specific.
5. **Strong.** [v0] never: "no raised weapon"; [POP]: "Neříká: buď silnější." (It does not say: be stronger.)

### 3 · Thurisaz — Þyrnir — [naše]
1. **None found.** "Þyrnir" is an ordinary ON word (thorn) and also a registered Icelandic name (`runar-names-registry.js` l. 364, lower-case entry `þyrnir`).
2. **Mixed.** [POP]: "Thurisaz stojí u dveří… Ještě chvíli. Podívej se, co se právě otevřelo." ↔ warden with flat palm — good. But [POP] also has "silou, která dokáže rozbít to, co už nemá držet pohromadě" (a force that can break what should no longer hold together) and [K] "disruptive force": v0 drops that side completely.
3. **Strong.** [v0] prompt: "one flat raised palm… narrow gate between two black lava ribs" — "wait" is a gesture needing no text.
4. **Mixed.** Gate warden with a staff is a trope; lava ribs and the blackthorn are specific.
5. **Strong.** [v0] never: "no menace… firm, not hostile"; it asks for a pause and predicts nothing.

### 4 · Ansuz — Alvíss — [pramen] + [odvození]
1. **Story.** [ALV] 35 (page numbering): "The day has caught thee, dwarf! (Now the sun shines here in the hall.)" — Alvíss is kept answering Thor until daylight. [DES] glosses the name as „vševědoucí" (all-knowing). **The stanza does not narrate petrification**; the page's footnote only says dwarfs cannot endure sunlight (see F3).
2. **Strong.** [POP]: "Ansuz není jen o tom mluvit. Je také o tom naslouchat." (not only speaking, also listening) ↔ [v0] hand cupped to ear.
3. **Mixed.** Listening reads at once. But [v0]: "the edge of his cloak and one shoulder already pale as stone" adds a second message (petrification) to a card about hearing.
4. **Strong.** The dawn-stone edge is on no other card.
5. **Mixed.** A dwarf turning to stone for talking all night reads as a verdict: too much talk is punished. [POP]'s question is a different one: "Co se změní, když opravdu uslyšíš to, co k tobě právě přichází?"

### 5 · Raidho — Varði — [naše]
1. **None found.** Varði (from *varða*, cairn) is also a registered Icelandic name (registry l. 326).
2. **Strong.** [POP]: "A teprve zpětně je vidět, že vytvořily cestu." (only afterwards it is visible that the steps made a road) ↔ cairns laid behind him.
3. **Mixed.** Cairns say "route" at once; being seen only afterwards cannot be shown in one frame. **v0 slips:** the look says cairns "receding behind **and ahead** of him", the prompt says "behind him" only. Cairns ahead make a destination, contradicting v0's own never ("no fixed destination").
4. **Strong.** Cairn-builder is specific and Icelandic.
5. **Strong.** [v0] never: "no signpost with arrows, no map".
Also: ᚱ is Rúnar's pendant rune — v0 already puts it on the forehead only (v0 §C-5).

### 6 · Kenaz — Eitri — [pramen, secondary] + [odvození]
1. **Story.** [EIT] (secondary): "Eitri succeeded in making the golden boar Gullinbursti, the golden ring Draupnir, and the hammer Mjöllnir"; Brokkr worked the bellows (Skáldskaparmál per the article). The same article titles him "Eitri (… or Sindri)" without saying which source equates them → the Sindri identity is [odvození].
2. **Strong.** [POP]: "Neosvítí celý svět. Jen malý prostor před tebou" (lights not the world, only a small space before you) ↔ forge lit only by the work; [K] "torch, inner light, creativity, knowledge, fire". Not independent evidence: the Kenaz–Eitri pair is already in [DES] as "naše konstrukce".
3. **Strong.** [v0]: "lighting only a small circle — his face, his hands, the tongs".
4. **Weak.** Smith with apron at an anvil is the commonest dwarf picture; only the lighting is distinctive.
5. **Strong.** A half-formed object; the image does not resolve.

### 7 · Gebo — Alfrigg — [pramen] + [naše]
1. **Story.** [SÖR]: "one called Alfrigg, the next Dvalin, then Berling and Grer" (Tunstall 2005); "The dwarves were forging a gold necklace"; Freyja gets it by agreeing "to lie a night with each of them". Alfrigg has no individual traits in the text — v0's "Open, courteous, easy in company" is [naše].
2. **Mixed.** [POP]: "Gebo proto není obchod. Není v ní účetnictví typu já jsem dal tolik, ty mi dlužíš tolik." (not trade, no bookkeeping) — yet Alfrigg's only story is a purchase paid with a body. v0 and [DES] solve it with "the object, not the price". It works, but the myth is the inverse of the rune.
3. **Strong.** [v0]: "One hand holding out a braid of four gold strands, the other open to receive" and "a second hand just visible entering the frame to take it".
4. **Mixed.** "Ornate but warm gold-and-green coat" — nothing distinctive beyond the braid.
5. **Strong.** [v0] never: "No scene of payment, price, bargaining, a night spent, a ledger, scales or coins"; the receiving hand is unidentified.
Note: the co-maker Dvalin is Isa's dwarf (F15).

### 8 · Wunjo — Yndi — [naše]
1. **None found.** "Yndi" (delight) — ON/IS form unchecked.
2. **Strong.** [POP]: "Smích u stolu… Okamžik, kdy nemusíš nic dokazovat." ↔ table, mug, pulled-out empty seats.
3. **Mixed.** "Cosy" reads at once; "joy" specifically is carried by no element. Turf-house interior duplicates Othila's turf-house doorway (#23).
4. **Weak.** Dwarf with a mug by the hearth is the stock tavern dwarf.
5. **Strong.** [v0] never: "no party, no wild cheering"; empty seats invite.

### 9 · Hagalaz — Hagl — [naše]
1. **None found.**
2. **Strong.** [POP]: "Ledové zrno dopadne na krajinu… Hagalaz ale není trest." ↔ standing in hail with a calm face; the changed heath behind him carries "co po tom zůstane".
3. **Strong.** Hail bouncing off shoulders and beard is unmistakable.
4. **Mixed.** Stoic-in-storm; no craft or object of his own.
5. **Strong.** [v0] never: "no catastrophe, no destruction scene". Watch: "he stands upright with his head slightly bowed" can preach endurance; [POP]'s question is "what remains".

### 10 · Nauthiz — Nauðr — [naše]
1. **None found.** v0's glosses (nauðr = necessity; nauðeldr = need-fire kindled by friction) were not checked by me.
2. **Strong.** [POP]: "Je to tlak, který odděluje potřebu od touhy." (a pressure that separates need from desire) ↔ the one ember, "the one warm thing in the frame".
3. **Strong.** Ember in cupped hands, snow all around.
4. **Strong.** Friction-fire and a lean, patched figure are on no other card.
5. **Strong.** [v0] never: "no begging, no despair, no starvation imagery".
Watch: fire in the hands is near Kenaz (#6); the Isa study already forbids "little fire in the hands" for Isa ([ISA] §5).

### 11 · Isa — Dvalin — [pramen] + [odvození]
1. **Hook.** [DVA] (secondary): name = "the dormant one" / "the one slumbering"; [HAV143] (Bellows): "Dvalin for the dwarfs" (runes); [VOL] 11 lists "Dvalinn". The Isa link is the etymology → [odvození].
2. **Strong.** [POP]: "Pod ledem může voda stále existovat. Jen její pohyb není vidět." ↔ a stone dozing under moss and ice. Not independent: the Isa–Dvalin pair is already in [DES] as "naše konstrukce".
3. **Mixed.** [ISA] §7: "six meanings in one scene is at the limit." Prediction, untested.
4. **Mixed.** Seated still dwarf with rime on his beard; the transparent ice with the dark stream is the specific part.
5. **Strong.** [ISA] §5: not sadness, "it is silence and clarity"; no corpse, no breath cloud.

### 12 · Jera — Ársæll — [naše]
1. **None found.** Also a registered Icelandic name (registry l. 342: `ársæll`).
2. **Mixed.** [POP]: "Semeno je v zemi. Dlouho se nic neděje… Není to runa okamžité odměny." (the seed is in the ground; nothing happens for long; not a rune of instant reward) ↔ v0 shows "a ripe slope behind him in August light" — the end of the cycle, not the long waiting [POP] puts first.
3. **Mixed.** A berry basket reads "harvest"; time and cycle are not visible.
4. **Weak.** Farmer with a basket is generic.
5. **Mixed.** A ripe slope can read as a promise of reward — [POP] says it is not that; [v0] never ("no wealth, no heap of grain, no overflowing harvest-cart cliché") only partly guards it.

### 13 · Eihwaz — Dáinn — [pramen] + [odvození]
1. **Hook.** [VOL] 11 lists Dáinn (the name sits in brackets in the ON text); [HAV143]: "Dain for the elves" — he is an elf there, a dwarf in Völuspá ([DÁI], secondary, which glosses the name "Dead"). The Yggdrasil stag named Dáinn (Grímnismál 33, mentioned in [DES]) was not opened by me.
2. **Mixed.** [POP]: "Eihwaz stojí mezi dvěma světy… tis" ↔ doorway between worlds. The link to the dwarf is the name ("dead"; [K] "death and rebirth") and his elf/dwarf ambiguity — while v0's never rejects death imagery, which is exactly what the name says.
3. **Strong.** [v0]: "stands exactly in the middle of a double doorway, half in light and half in dark".
4. **Weak.** The doorway repeats Thurisaz, Othila and Dagaz (F8).
5. **Strong.** Duration and transition, nothing prescribed.

### 14 · Perth — Dulinn — [naše]
1. **None found.** v0's gloss "dulinn = hidden" and the app string "Duldir hlutir" were not checked.
2. **Strong.** [POP]: "Perth je nádoba, která něco ukrývá… ještě nevím" ↔ closed vessel held close, head tilted to listen.
3. **Mixed.** The closed vessel is clear. [v0]: "hood half raised" hides the face, which carries recognisability.
4. **Mixed.** Hooded-mystic trope, limited by [v0] never ("no crystal ball, no cards").
5. **Strong.** [v0] never: "no glow that reveals the content".

### 15 · Algiz — Norðri — [pramen] + [naše]
1. **Story.** [GYL8] (secondary, Brodeur translation): the gods make the sky from Ymir's skull and set a dwarf under each corner — "Austri, Vestri, Norðri, Suðri"; [VOL] 11 lists them. "Under the northern glacier" is placement from the name → [odvození]/[naše].
2. **Mixed.** Shape fits: [POP] "Algiz se zvedá vzhůru jako paroží" ↔ raised arms. But the myth's act is carrying a load — [GYL8] article quotes Skáldskaparmál 31 "erfiði eða byrði dverganna" (toil or burden of the dwarfs) — while [POP] is about watchful protection with an open boundary.
3. **Strong.** [v0]: pose "literally the shape of the rune".
4. **Strong.** Raised arms, antler-like braids, aurora.
5. **Strong.** [v0] never: "no shield wall, no clenched stance".

### 16 · Sowilo — Suðri — [pramen name] + [naše]
1. **Hook.** [GYL8] article: the name derives from *suðr* (south), and it describes no source that gives Suðri a distinct function beyond holding up the sky. The sun connection is entirely [naše].
2. **Weak.** [POP]: "Je v ní také síla… být tím, čím jsi, bez potřeby se zmenšovat." (strength to be what you are without shrinking) ↔ [v0] Suðri "never steps into the light". The figure enacts staying back. [DES] itself says Sowilo and Dagaz have no dwarf and that the light pole is "hubený" (thin). The owner overrode this (brief §2.3), so the fit is a design compromise, the weakest of the 25.
3. **Mixed.** Obsidian disc throwing a beam is readable; "edge of the shade" is subtle.
4. **Strong.** Mirror on black sand is on no other card.
5. **Mixed.** Reflecting the light but never entering it can read as advice to hold back; [POP]: "teď to můžeš vidět" (now you can see it).

### 17 · Tiwaz — Örvar — [naše]
1. **None found.** Also a registered Icelandic name (registry l. 355: `örvar`).
2. **Strong.** [POP] version B: "Tiwaz je šíp… Co jsi ochoten nést?" (what are you willing to carry) ↔ vertical arrow plus scarred palm. Týr's hand is deliberately not copied.
3. **Mixed.** The arrow says "direction". The scar (the cost) is a tiny detail likely lost in generation.
4. **Mixed.** Fletcher-smith with steel-blue tones.
5. **Strong.** [v0] never: "no battle, no victory pose"; [POP]: "Neříká: vyhraj."

### 18 · Berkana — Móberg — [naše] (Agndofa)
1. **None found in Norse sources.** [DES]: "[Agndofa] Móberg — mladý dverg tufu (móberg = islandská hornina z ohně a vody)". Also a registered name (registry l. 238).
2. **Strong.** [POP]: "To, co je malé, nemusí být slabé… Příliš mnoho zásahů může být stejně škodlivých" ↔ hands held just above the seedling; [K] "birch".
3. **Strong.** One seedling, two held-off hands.
4. **Strong.** The only young-looking dwarf.
5. **Strong.** [v0] never: no giant tree, no "growth montage".

### 19 · Ehwaz — Jór — [naše]
1. **None found.** v0's gloss (jór = horse, poetic) is unchecked. `jór` is **not** a registry entry (checked: only inside words such as *hafsjór*).
2. **Strong.** [POP] version B: "Musíš trochu povolit otěže, aby se mohl objevit skutečný pohyb." ↔ "reins slack… matched stride".
3. **Strong.** Horse and dwarf in matching rhythm at a ford.
4. **Mixed.** Dwarf with an Icelandic horse is distinctive; the braided mane echoing his beard is the personal touch.
5. **Strong.** [v0] never: "no whip or spurs; no domination".

### 20 · Mannaz — Speki — [naše]
1. **None found.** "Speki = wisdom" — gloss unchecked.
2. **Strong.** [POP]: "Někdy v něm vidíš sebe. Jindy v něm uvidíš někoho jiného" ↔ another person's face in the mirror.
3. **Mixed.** A mirror showing someone else's face is hard for image generators and likely defaults to his own reflection ([v0] never: "no ghostly double").
4. **Mixed.** [v0] look: "no showy ornament" conflicts with the shared style lock (§B: "long braided hair and beard with metal rings"). Either the lock bends for him or being "the most ordinary-looking of the brothers" is lost.
5. **Strong.** Surprised, open look; nothing prescribed.

### 21 · Laguz — Lögr — [naše]
1. **None found.** "Lögr" (water) — form unchecked.
2. **Strong.** [POP]: "Voda… může nést obraz nebe" and "Ne každý pocit je pravda." ↔ pool reflecting an aurora sky the dwarf is not looking at.
3. **Mixed.** Hands in water is the same gesture family as Fehu's scoop (#1).
4. **Mixed.** Cave pool and teal light are specific; the dwarf himself is not.
5. **Strong.** [v0] never: "no mermaid or sea-god look".

### 22 · Ingwaz — Lyngri — [naše] (Agndofa)
1. **None found in Norse sources.** [DES]: "[Agndofa] Lyngri — nejmenší; pečuje o kořeny lyngu".
2. **Strong.** [POP]: "Zvenku se zdá, že se nic neděje… A přesto uvnitř něco dozrává." ↔ sealed pose, seed stone against the chest.
3. **Mixed.** Curled dwarf with closed eyes ≈ Isa's still dwarf with half-closed eyes (#11).
4. **Weak.** The smallest dwarf curled in moss risks the cute-gnome look that [v0] never already names.
5. **Strong.** Modest and sealed; nothing prescribed.

### 23 · Othila — Durinn — [pramen] + [odvození]
1. **Hook.** [VOL] 10: "en Durinn annarr" (and Durin second). [DVA]: Dvalinn and Durinn forge a sword in Hervarar saga. [v0] calls him "the dwarf after whose pattern others were made" — I read only line 1 of stanza 10, so that is **not verified**.
2. **Mixed.** [POP]: "Othila je místo, kam se vracíš… Co z nich chceš skutečně nést dál?" ↔ elder holding out a worn object, palm up. The tie to the name (second dwarf, therefore ancestor) is [odvození].
3. **Mixed.** Palm-up small object is legible; [v0]'s "many small rings (generations)" is invisible to a viewer.
4. **Weak.** Long white-silver beard elder is the Gandalf/Dumbledore trope, and Durinn is Tolkien's Durin; the doorway repeats others (F8).
5. **Strong.** [v0] look: "palm up, not insisting".

### 24 · Dagaz — Þjóðreyrir — [pramen] + [odvození]
1. **Story (one line).** [HAV160], secondary: "In Hávamál 160 it is said that the dwarf Thjódrørir sang before Delling's doors" (C. Tolkien, 1960); Tolkien: it "may mean that he gave warning to his people that the sun was coming up"; Lindow (2001): "Dellingr's doors" may be a sunrise metaphor. Dellingr is Day's father (Vafþrúðnismál 25, same article). **The stanza text itself was not seen.** "Threshold of dawn" is therefore [odvození].
2. **Strong.** [POP]: "Nejsi už tam, kde jsi byl, ale ještě nestojíš úplně na druhé straně… Možná už stojíš v jejich prahu." ↔ half-lit face in a doorway. The closest fit of the 25.
3. **Mixed.** Clear in itself; the doorway motif appears on four cards.
4. **Mixed.** Fjord and half-gold face are specific; the doorway is not.
5. **Strong.** [v0] never: "no dazzling sunrise, no raised arms in glory".

### 25 · Blank — Gandálfr — [pramen name only]
1. **Name only.** [VOL] 12: "Veigr ok Gandalfr, Vindalfr, Þráinn, Þekkr ok Þorinn" — a list item, no story. The blank rune is a modern addition (brief §6).
2. **Strong.** [POP]: "Stránka je otevřená… Nehledej význam tam, kde zatím žádný není." ↔ a dwarf who has no story for a rune that has no sign.
3. **Mixed.** Blank stone on an open palm reads "empty"; [POP] wants "pauzu v příběhu" (a pause in the story), not void.
4. **Weak.** For most viewers the name is Gandalf. Same source gives an alternative: "Svíorr" ([VOL] 13: "Fíli, Kíli, Fundinn, Náli, Hepti, Víli, Hanarr, Svíorr").
5. **Strong.** Open palm, nothing prescribed.

---

## 3. Findings that go beyond the table

**F1 — Count of attested dwarves.** 11, not 13. Móberg and Lyngri are `[Agndofa]` in [DES], i.e. invented; README and brief list them with the canon.
**F2 — "From Ymir's blood."** [VOL] 9 says Brimir's blood and Bláinn's bones. [DES] catalog line for Mótsognir repeats "z Ymiho krve". Not changed by me; the equation is an interpretation I did not check.
**F3 — The stone anchor.** [DES] states as 🔒 anchor "slunce proměnilo Alvísse v kámen". The stanza I read ([ALV] 35) ends "The day has caught thee, dwarf!"; the stone appears only in the page's editorial footnote. The anchor drives Suðri (#16) and Þjóðreyrir (#24). **Needs a check in a fuller text** (not done).
**F4 — Suðri's sun link is 100 % ours.** [GYL8] article: no source gives him a distinct role.
**F5 — Þjóðreyrir** rests on one line of Hávamál 160 seen only through a secondary article; Lindow's caveat about "Dellingr's doors" is open.
**F6 — Dáinn** is an elf in Hávamál 143 and a dwarf in Völuspá 11.
**F7 — Eitri = Sindri** is not source-stated in the article I read.
**F8 — Doorways on four cards:** Thurisaz (gate), Eihwaz (double doorway), Othila (turf-house door), Dagaz (stone doorway). Without differentiation they blur.
**F9 — Motif collisions:** water (Fehu, Laguz) · small fire (Kenaz, Nauthiz) · seed/growth (Jera, Berkana, Ingwaz) · still seated figure with closed eyes (Isa, Ingwaz) · turf house (Wunjo, Othila).
**F10 — Three pairs are inherited from Rúnar:** Isa–Dvalin, Kenaz–Eitri, Ansuz–Alvíss are the three "ověřené dvojice" in [DES]. Brief §4.2/§9 say anything from Rúnar is a new decision, not a silent import. Their criterion-2 evidence above rests on the rune texts only, not on [DES].
**F11 — Dvalin sits on two cards' mythology:** he is Isa's dwarf and one of the four makers of Gebo's necklace ([SÖR]; also [DES] "jeden dverg ve dvou mýtech").
**F12 — v0 slips to fix in the next version:** Varði's cairns "ahead" (#5) · Mannaz "no ornament" vs the style lock (#20) · Jera shows the result, not the waiting (#12).
**F13 — Name registry check (re-done here):** `þyrnir`, `varði`, `ársæll`, `örvar`, `móberg` are entries in `v2/runar-names-registry.js`; `jór` is not. v0 §D.1 is correct. The registry file itself says it carries names only and cannot show whether a name is Norse.
**F14 — Names verifiable in the Dvergatal text I read:** Hepti ([VOL] 13), Fundinn (13), Svíorr (13), Frosti (16), Andvari (15, only in a bracketed line). **Not found in that text:** Draupnir, Farli, Uni, Ónn, Bildr, Hugstari, Vegdrasill, Vitr — the CODE-read proposal in the README for those eight stays unverified.

---

## 4. Sources (what was actually opened, 2026-10-21)

**Primary (text opened)**
- [VOL] Völuspá, ON text (Codex Regius/Hauksbók) with Thorpe 1866 — stanzas 9–16 as numbered on the page: https://germanicmythology.com/elderedda/VoluspaEnglish3.html
- [HAV143] Hávamál 141–145, Bellows translation: https://www.voluspa.org/havamal141-145.htm
- [ALV] Alvíssmál 31–35: https://www.voluspa.org/alvissmal31-35.htm (page does not name the translator; site keywords say Bellows)
- [SÖR] Sörla þáttr, Morris–Magnússon 1875 and Tunstall 2005: https://germanicmythology.com/FORNALDARSAGAS/SorliThattrHedinHogniMorrisTunstall.html

**Secondary (Wikipedia; quoted lines pass through them)**
- [HAV160] "Dellingr" (quotes C. Tolkien 1960, Lindow 2001; stanza text not shown): https://en.wikipedia.org/wiki/Dellingr
- [GYL8] "Austri, Vestri, Norðri and Suðri" (Gylfaginning 8, Brodeur): https://en.wikipedia.org/wiki/Austri,_Vestri,_Nor%C3%B0ri_and_Su%C3%B0ri
- [EIT] "Eitri" (2022 archive copy): https://webcf.waybackmachine.org/web/20220320035905/https://en.wikipedia.org/wiki/Eitri
- [DÁI] "Dáinn (Norse dwarf)": https://en.wikipedia.org/wiki/D%C3%A1inn_(Norse_dwarf)
- [DVA] "Dvalin": https://en.wikipedia.org/wiki/Dvalin

**Repo (read live, HEAD `3c2ed59`)**
- [POP] `RUNAR_POPISY_RUN.md` (owner's rune descriptions; Czech working source) · [K] `k` fields in `v2/runar-runes.js` · [DES] `RUNAR_DESIGN.md` (dwarf catalog, "Dverg pod runou") · [v0] `dverg-tarot/postavy/DWARVES_25_characterizations_v0_EN.md` · [ISA] `dverg-tarot/postavy/ISA_scene_study_v0_EN.md`

**Not opened:** the full Dvergatal (Gylfaginning/Hauksbók lists), Skáldskaparmál and Gylfaginning themselves, Grímnismál 33, Hávamál 160 as text, Gould "Dwarf-Names", any Icelandic or ON dictionary.

---

## 5. Strongest argument against this table, and how to test it

- **Argument:** criterion 2 can be passed by almost any dwarf if the rune text is vague, and every "Strong" above is my reading of two texts I know side by side. Criteria 3–5 are untested predictions. The table can look more certain than it is.
- **Test (reversed lever, per CLAUDE.md §25):** give someone the 25 dwarf descriptions (look + doing, no name, no rune) and the 25 rune names with the owner's short meanings, and ask them to match. Pairs that are matched wrongly, or not at all, are the real weak fits. Cheap, no images needed, and it can run on text before any generation.
- **Decisions this table does not make (owner, brief §8):** names (keep the 12 working names / Dvergatal names / mix — and F14 shows only some of the Dvergatal proposals are verified), product name, card format, whether to keep the Sowilo and Dagaz solutions given F3.
