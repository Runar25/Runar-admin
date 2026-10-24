# Dverg Tarot — the minimum family markers (phase 1, step 4) — proposal v0 for owner review

author: Cowork · 2026-10-21 · repo HEAD verified live: `3c2ed59` · status: **proposal, nothing approved, nothing generated**
Question from the brief (§4.3, §7 step 5): the README lists, as „rodinné znaky… se nesmí rozjet" (family traits that must not drift), **braided beards, a robe, a rune on the forehead and a pendant with the dwarf's own rune** („spletené vousy, roucho, runa na čele a přívěsek s vlastní runou") — which may produce 25 similar characters. **How few shared markers are enough for the cards to hold together while each dwarf stays recognisable as his own?**

**Evidence base.** I looked at the three reference images, not only at the text: `v2/assets/runar-fullbody.png` (character sheet), `runar-portrait.png`, `sacred-palette.png`; and I cropped and enlarged the forehead in both. Text sources: `RUNAR_DESIGN.md` "Jak vypadá" ([DES]); `v2/assets/README.md`; the README and v0 §B of `dverg-tarot/`.
Everything about the images below is **my observation of two generated pictures**, not a measurement.

---

## 1. What Rúnar's references actually show

**[DES] "Jak vypadá" (the canon text) says:** a kind Nordic dwarf-like figure around fifty; **long braided hair and beard**; weathered eyes full of knowing; a calm, grounding presence; traditional Nordic robes with discreet rune marks; **an obsidian rune pendant on the neck**. Nothing about a forehead mark, a fur collar, a belt buckle or a pouch.

**What I see in the images:**
- Style: **rounded, warm, tactile 3D-animation look** — large eyes, a big round nose, soft cheeks, a large head on a short, stocky body.
- Hair and beard: light-brown, wavy hair with braids; a long braided beard with **metal cuffs** on the braids.
- Clothing: a **rune-cloth-blue wool coat with gold knotwork trim and a thick fur collar and cuffs**; a leather belt with a **round buckle carrying ᚱ**; a leather pouch with **a different rune** on it.
- **Pendant:** obsidian, oval, with **ᚱ glowing whisper-blue** — clear in the portrait and the sheet.
- Props that are his and not family: the staff with an obsidian crystal and a hanging rune medallion; the open palm; the book.
- **Forehead mark:** a small painted **triangle with a vertical line** (blue in the sheet; grey-blue with an extra small oval inside in the portrait). **It is not ᚱ, it does not glow, and it is drawn a little differently in every view** (I checked four crops of the sheet and one of the portrait).

**What follows from that**
1. **v0 §B is wrong about the forehead.** It says "the forehead rune and the pendant rune = his own rune (Rúnar's pendant carries ᚱ)". In the reference the forehead mark is a different, non-glowing glyph. The pendant carries ᚱ; the forehead does not.
2. **The forehead mark drifts even within Rúnar's own sheet.** A marker that a generator redraws differently in five crops of the same character cannot be a lock for 25 characters; 25 tiny forehead glyphs would multiply that. (`v2/assets/README.md` says the same of every rune in these pictures: "kresba generátoru, ne naše glyfy" — drawn by the generator, not our glyphs.)
3. **The shared style lock in v0 contradicts the reference.** v0's lock asks for a "high-detail stylized-realistic 3D look" and says "Not a cartoon, not comic, not fantasy-game armor." The attached reference is clearly a stylised animated look. A generator given both instructions has to pick one.
4. **Rúnar wears blue.** His identity is, besides the pendant, **a blue coat with fur** — so a dwarf in saturated rune-cloth blue would read as a sibling-in-costume rather than a new character (see file 02a "Cross-sheet checks").

## 2. Proposal: three tiers

### Tier 1 — LOCK (on every card, three items)
1. **The pendant:** an **obsidian pendant carrying the dwarf's own rune, glowing whisper-blue (#5BB8FF)**. It is the **only place whisper-blue appears** on the card. (Blank: a blank, unmarked obsidian stone.)
2. **Hand-made materials:** visible **wool, leather and/or fur, with stitching or knotwork somewhere** — no plate armour, no polished metal costume. (Mótsognir is the one deliberate exception: raw hide and no embroidery — `03` §1.)
3. **A braid with a cuff or bead:** **at least one braid in the hair or beard, fastened with a metal cuff, ring or bead.** The amount varies from one thin braid (Lögr, Speki, Gandálfr) to heavy braiding (Dvalin, Durinn).

### Tier 2 — SHARED STYLE (applies to the rendering, not to the dwarf)
- The same two references attached to every generation (`runar-fullbody.png` for the figure, `sacred-palette.png` for the palette).
- **One dominant colour from the seven** and nothing outside them; **no saturated rune-cloth blue as the main coat colour** for anyone but Rúnar.
- **Icelandic setting** with the markers from file 03; **calm lower fifth; no text or letters in the image** except the glowing rune.
- The dwarf is **a dignified, kind craftsman** (v0: "not comic"), never a comedian or a warrior.

### Tier 3 — FREE (this is what makes each dwarf his own)
Age, build and size · face shape and expression · hair colour, length and style · beard length and shape · coat colour (within the palette) · tools, props and animals · posture · what he is doing.

### Dropped from the "lock" list
- **The forehead mark** (evidence above). **Option:** keep it as a *free* feature — any dwarf may carry a small painted sign if the scene wants it — but never as a requirement.
- **The "robe"/"coat with fur trim" as a uniform:** fur is allowed, not required (Nauðr: patched undyed wool; Alfrigg: a fine coat).
- **The belt buckle with ᚱ and the rune pouch:** Rúnar's own; optional for others.
- **The staff, the open palm, the book and the role of a guide:** Rúnar's personality, not equipment (brief §4.3).

## 3. Revised style lock (to replace v0 §B's paragraph)

Two variants, because the reference and the v0 wording disagree:

> **Variant A (follows the reference — my recommendation):** *Same character family and the same art style as the attached Rúnar character sheet: a rounded, warm, tactile stylised 3D character; a sturdy, compact Nordic dwarf with kind weathered eyes, long hair with at least one braid fastened with a small metal cuff, hand-made wool, leather or fur clothing with stitching or knotwork, and an obsidian pendant carrying his own rune in whisper-blue light (#5BB8FF) — the only saturated colour on him. One dominant colour from the attached Agndofa palette. Icelandic nature behind him (black lava, moss, basalt columns, fjords, glacial rivers, turf houses; no pine forests and no Alaska or Canada scenery). Portrait composition from the knees or waist up; calm lower fifth. No text or letters in the image except the glowing rune. The image is as rich as the rune is rich in meanings: each meaning appears as one visible element.*
>
> **Variant B (the owner's wording, as in v0):** the same, but with "high-detail stylized-realistic 3D look" and "Not a cartoon, not comic". **It conflicts with the attached reference** — if the owner prefers it, the reference images should be replaced by ones that match it.

Removed from v0's lock: "a faint glowing rune mark on the forehead", "wool coat with fur trim" as a requirement, "braided hair and beard with metal rings" as a requirement for both (now: one braid with a cuff).

## 4. Strongest argument against this proposal
- **Three markers may be too few.** Without the forehead mark and the uniform coat, the 25 may look like 25 unrelated fantasy dwarves. The pendant is small, and it is the most likely thing for a generator to garble.
- **The glyph problem remains.** If the generator draws pseudo-runes (as it did on the forehead), the "own rune on the pendant" lock will fail on many cards. The practical answer is a **production decision**: overlay or correct the glyph after generation. That is outside what I can decide, and the glyph shapes would have to be taken from the data in `v2/runar-runes.js` as a read-only reference — which touches the boundary in the README („Jediné, co se z Rúnara bere, je vzhled" — only the look is taken from Rúnar).
- **Dropping the forehead mark removes a "magical" cue** that the owner or the viewer may like.
- **„Rúnar není jeden. Každý uživatel má svého Rúnara."** (Rúnar is not one; every user has their own — [DES]). If Rúnar himself is allowed to vary, then a strict family lock is stricter than the standard it is supposed to follow.
- All of this rests on **two generated images** of one character. It is a hypothesis about what a generator keeps constant.

## 5. How to test it (before 25 images exist)
This follows the reversed-lever rule (CLAUDE.md §25): take a marker **away** and see whether the family still holds.
1. Pick **five dwarves that differ most** — e.g. Mótsognir, Alfrigg, Nauðr, Speki, Gandálfr.
2. Generate each twice: **(i) with the full v0 lock, (ii) with the Tier-1 minimum.**
3. Show the ten images to people who have not seen Rúnar. Ask **only**: which of these belong to the same set? Which two are the most alike?
4. Then take each Tier-1 marker away in turn on a second set (no pendant glow; no braid; smooth modern clothes) and note **at which removal viewers stop grouping the cards**. That marker is the real minimum.
No numbers are proposed here; the test needs real images and real viewers.

## 6. Decisions for the owner
1. **Forehead mark:** drop from the lock (my recommendation), keep as optional, or keep as required?
2. **Style wording:** Variant A (matches the reference) or Variant B (needs different references)?
3. **Varði (Raidho) and ᚱ:** keep ᚱ on his pendant like the others, or give him a pendant that differs from Rúnar's?
4. **Palette:** keep the seven colours strictly (four v0 colours were moved into them), or extend it for the card set?
5. **Uruz:** is the unadorned look an acceptable exception to Tier 1 item 2?
6. **Glyph handling:** who corrects generator-drawn runes on the pendants after generation?
