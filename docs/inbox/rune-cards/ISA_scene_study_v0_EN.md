# ISA + Dvalin — scene study for the card (v0, for discussion) — Cowork, 2026-10-18

The dwarf is **the main character, who does what the rune means**. Below: how oracle and tarot cards are built, what Isa means, four angles (sketches in `isa_panels_EN.png`), a recommendation and a prompt.
Repo HEAD when read: `9aacc01`. Nothing here is approved.

## 1. How an oracle/tarot image is built (first, so we know which road we are on)

Sources: [Tarot Symbolism Decoded (elvitarot.com)](https://elvitarot.com/blog/tarot-symbolism-decoded-rider-waite/), [Rider–Waite Tarot (Wikipedia)](https://en.wikipedia.org/wiki/Rider%E2%80%93Waite_Tarot). Summarized from these plus general knowledge; **two web pages, not an expert study**.

- **The figure carries the card's theme**; the surroundings only add nuance. In Rider–Waite the central figure is always doing the thing that *is* the meaning (the Magician raises his wand to the sky, the Fool stands at the edge).
- **Gesture and gaze** state direction and condition: palm up = receiving, hand toward action = will, gaze down = inner life. Gaze to the right = future, to the left = past (RWS tradition).
- **The background is a landscape that finishes the meaning** (mountains = obstacles or goals, water = emotion, calm vs. rough).
- **Props are few and each carries one thing** (roses, a dog, a lion). What is not meaning is not there.
- **Color is a system:** gold = illumination, grey = difficulty, blue = intuition, white = transition, black = the unknown.
- **Near and far:** what is close is urgent; what is far comes later.
- **Pamela Colman Smith turned the numbered cards into full scenes** (instead of a few pips), and that is exactly what makes them "rich images" — the road you want: **every meaning of the rune = one visible element in the scene**.

**My recipe for the Rúnar cards (applicable to all 25):**
1. List the rune's meanings (from `k` + the owner's descriptions + DESIGN).
2. **One visible element per meaning** in Icelandic nature (where possible, take an image Rúnar already knows — `RUNE_IMAGES`).
3. The dwarf is in a position that does **the rune's verb** (Isa: he does not move).
4. Three layers: foreground (gesture and object), middle (story), background (mood, weather, light).
5. At most 5–6 symbols; more than that is crowded and the main figure disappears.
6. Color by meaning plus the Agndofa palette (one color dominates).
7. The lower fifth stays calm for text; no writing inside the image.

## 2. The meaning of Isa (sources, not from my head)

- `k` in `runar-runes.js`: **ice, stillness, waiting, pause, clarity through cold**.
- The owner's description (`RUNAR_POPISY_RUN.md`, in Czech): silence; water freezes and there is nowhere to hurry; not an end, only its time has not yet come; **the temptation to break the ice and push**; some things cannot be sped up; **under the ice the water still exists, only its movement is not visible**; **one line, one moment** (concentration); **not empty** — a silence in which you see what remains when you stop pushing. The question: *what is not moving in your life right now, and what could you see if you let it be this time?*
- `RUNAR_DESIGN.md`: Isa + **Dvalin** = *stopped above, alive below*; Dvalin is "a stone that dozes under the moss — wakes slowly and was never gone".
- **Images Rúnar already has for Isa** (`RUNE_IMAGES`, `v2/runar-character.js` ~l. 444–657) — **all Icelandic, each carrying one meaning**: the windless snowfall comes straight down (stillness) · the pond has iced over and waits without asking for anything (waiting) · **under the ice the stream can still be heard** (ice) · **the calm lies over the fjord and nothing stirs, not even the bird on the rock** (stillness) · **the boat lies frozen in the harbour, and the fjord beyond it is open water** (pause) · **in the hard frost the air is so clear that the farm across the fjord looks close enough to touch** (clarity through cold) · the clock that stopped and the cup of coffee gone cold (domestic). ⚠ Carrying text images over into a visual is a **new decision**, not a silent import (as `RUNAR_POPISY_RUN.md` itself says); here I only propose it.

## 3. Four angles — see `isa_panels_EN.png`

| | Angle | What Dvalin does | How it carries the meanings | Main risk |
|---|---|---|---|---|
| **A** | A moment of silence (story) | sits so long that a bird landed on his shoulder and moss grows on his boots; flat palm above the ice | all 5 `k` + "water runs under the ice" + "hammer set aside" | crowding |
| **B** | Two floors (cut through the ice) | sits on the ice, palm laid down, listening to what is below | below: a thin blue thread of water, a stone and roots | diagram or "fantasy cutaway", less Iceland |
| **C** | The held hammer | raised the hammer and the other hand holds it | the temptation to break the ice | action; the dominant hammer spoils the calm |
| **D** | One line | small and motionless in white emptiness | concentration, clarity | the poorest |

## 4. Recommendation: A as the base plus a small piece of B

A says the most meanings in a single scene and rests on images Rúnar already has. From B I take only one thing: **the ice is transparent and a dark stream is visible beneath it** (no cutaway, no two floors), because that is what makes Isa "not empty".

**The scene (foreground → background):**
- *Foreground:* Dvalin sits on a mossy boulder beside a frozen pond. **A flat palm** above the ice, not touching. An ice hammer lies beside him. **A motionless bird** sits on his shoulder; **rime and moss** on his boots and in his beard.
- *Middle:* **ice clear as glass**; **a dark stream of water beneath it** (the single dark line in the image).
- *Background:* **a fjord where a boat is frozen into the harbour but open water lies just beyond**; **a distant farm sharp as if within reach** (clear air). Snow **falls straight down**, no wind.
- *Light and color:* low winter sun, ice blue and white; the one warm spot is Dvalin's pendant with the **glowing rune ᛁ** and the edge of a small lantern; palette: frost white, rune cloth blue, obsidian, whisper blue.
- *Gesture/gaze:* gaze **down at the ice**, not into the distance (inner life, waiting); eyes closed or half closed, **no visible breath**.

**Icelandic markers the generator must be given explicitly** (otherwise it draws Alaska or Canada): black volcanic rock sticking out of the snow, moss-covered lava fields, a fjord with steep bare mountains, low birch scrub instead of conifer forest, a turf house, low winter sun, ice blocks with black ash stripes. **No** conifer forests, deer, sleds, igloos or polar bears.

## 5. What to avoid for Isa (from the descriptions and DESIGN)

- No corpse and no "frozen unfortunate"; Dvalin **is alive and resting** (DESIGN: dozing, never gone).
- No shivering dwarf, no breath cloud (invisible breath is part of the silence), no fire — except the small lantern and the glowing rune.
- It is not "sadness" — it is silence and clarity; the colors are cold but **not depressing**.
- One hammer, set aside, not a threat.
- Do not let it be confused with Hagalaz (hail, destruction) or Nauthiz (need-fire): no hail, no little fire in the hands.

## 6. Prompt (A + a piece of B) — for the generator, with `runar-fullbody.png` and `sacred-palette.png` attached

> Same character family and art style as the attached Rúnar character sheet. Portrait card composition, 70×120. **Dvalin**, a sturdy, compact Nordic dwarf with a long frost-white braided beard and hair threaded with small rings, wearing a pale blue-grey wool coat with fur trim and Nordic knotwork, sits perfectly still on a moss-covered black lava boulder at the edge of a frozen pond; rime on his beard and shoulders, moss growing over his boots; his eyes half closed, looking down at the ice; one flat open palm held just above the ice without touching it; a small bird sits motionless on his shoulder; an ice hammer lies beside him on the snow. The ice is clear as glass and shows a thin dark stream of water flowing beneath it. His forehead carries a faint rune ᛁ and his obsidian pendant glows whisper-blue with the same rune. Behind him: an Icelandic fjord with steep bare mountains, a small wooden boat frozen into the harbour with open dark water just beyond it, and a distant farmhouse with a turf roof shown crisp and clear in very still, cold air; snow falls straight down without wind; low winter sun, pale gold on the mountain tops; no trees except a few low birch shrubs. Palette: frost white, rune-cloth blue (#2E4A70), obsidian, whisper blue (#5BB8FF) only on the rune. Calm, silent mood — stillness, not sadness. Leave the lower fifth uncluttered. No text. No breath clouds, no fire, no pine forest, no igloo, no sled.

## 7. Strongest argument against (honestly)

- **Crowding:** six meanings in one scene is at the limit; RWS has 3–5 symbols. If the generator breaks the scene, **drop the hammer and the boat first**; keep: the palm above the ice, the bird, the transparent ice with the stream, the clear air and the farm.
- **The person reading the card has not seen the rune's meanings:** the image must work without them; "bird on the shoulder" is readable, "boat in the harbour" may not be.
- **Isa is the quietest rune; the others are louder.** The rule "every meaning = an element" may collide with composition for Hagalaz or Tiwaz. Isa is a good first test, not proof.
- **The one bird and the one hammer are my ideas**, not from the descriptions — the bird comes from Rúnar's image "not even the bird on the rock", the hammer from the description's "urge to break the ice".

## 8. What I need from the owner

Pick one of the four angles or a combination (my recommendation: A + the transparent ice from B). Then I will apply the same procedure to the other runes.
