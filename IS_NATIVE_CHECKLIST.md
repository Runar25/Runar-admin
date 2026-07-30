# IS Native Checklist — native corrections → Rúnar's rules

**What this is:** the running rulebook for making Rúnar speak like a native Icelander, built
FROM real native corrections during live testing. It works two ways at once — a native reviewer
(Sigrún and other Icelandic testers) reads it *while testing* to know which error-classes to
watch, and we harvest: each confirmed correction becomes one durable rule.

**This is NOT the cancelled Sigrún queue** (§19.2 · [[is-done-together-not-for-sigrun]]). We do
not write half-finished IS and park it for someone else to fix — that queue is gone and stays
gone. We write IS *finished and verified*; a native then corrects it *in the flow of reading a
real reading*; we distil each correction into a rule so Rúnar says it right next time. The work
stays ours — only the learning flows in. Same-looking as the old queue, opposite direction.

**Why it's needed:** our automated tools (GreynirCorrect, BÍN) catch *words* — misspellings,
non-words, unknown forms. They provably **miss subtle grammar and idiom**. A production reading
said *„láta séð til þín"* and every tool passed it (GreynirCorrect only failed to *parse* the
sentence — code `E001`, which is not an error message). Only a native ear caught it.
Note: `E001` is **not** a native-eye queue — it means *rewrite until the tool understands it*
(§19.2). The native's contribution is the subtle grammar/idiom the tools are blind to, caught
live in testing — never an automated hand-off.

**How a correction becomes a rule:** for each fix, record **„…" → „…"** plus one line of *why*.
Each confirmed fix becomes one prompt-rule in the IS grammar block (`v2/runar-character.js` —
grammar's single home, §20), or a `runar_corrections` row if corrections are re-enabled. The
categories below are the scan-guide and hold illustrative examples; the operative rule lives
with the grammar, never duplicated here.

---

## What tools miss — scan for these

1. **Causatives: `láta` / `gera` / `fá` + FOLLOWING VERB must be the INFINITIVE, not a participle.**
   - ✗ „láta **séð** til þín"  → ✓ „láta **sjá** til þín" (idiom *láta sjá til sín* = to show up)
   - The verb after *láta* is always the nafnháttur (sjá, koma, vita), never séð/komið/vitað.

2. **Two-word / phrasal verb constructions.** Is the auxiliary + main verb the right pairing?
   - Perfect tense: `hafa` + supine (*hafði þagnað*), or `vera` + participle for change-of-state
     verbs (*var kominn*, *var farinn*). Wrong auxiliary reads as translated-from-English.

3. **Adjective–noun gender & case agreement.** Adjective must match the noun's gender/case/number.
   - Determine the noun's gender FIRST (frost = hk, súld = kvk), then inflect the adjective.
   - ✗ „sérstæðan augnablik" → ✓ „sérstætt augnablik" (augnablik = hk).

4. **Definite-article endings**, especially on our domain compounds.
   - *rún → rúnin*, *lífsrún → lífsrúnin* (kvk). Watch *auða rúnin* (not *rúnan*).

5. **Second person consistency + register.** Whole reading stays in *þú*; formal/archaic tone
   is fine, but a single slip into a wrong pronoun or an English-shaped clause stands out.

6. **Collocation & idiom — the tool-green class** (harvested from testing, 2026-07-30).
   All three below are *valid words + valid grammar* → GreynirCorrect and BÍN pass them **green**.
   A native still corrected each one: a fixed idiom, the right preposition, a precise compound
   verb. This is exactly the class no tool can see — and Rúnar's specific weak spot is
   **verb + preposition / particle**, not agreement. Do a **collocation pass** after composing:
   for every verb ask *„is this the set phrase a native reaches for, or a literal build from English?"*
   - ✗ „réttir sig aftur" → ✓ „réttir aftur úr sér" — *rétta úr sér* is the fixed idiom for
     straightening up; don't assemble a literal reflexive out of English.
   - ✗ „stígur af hvernum" → ✓ „rís upp frá hvernum" — steam rising from a source = *rís upp frá*
     + dative; *af* reads as „step down off a surface".
   - ✗ „þokan taki" → ✓ „þokan yfirtaki" — *taka* (take) is generic; *yfirtaka* (engulf / take over)
     is precise for fog swallowing a mountain.
   *(The three corrections are Sigrún's — native-authoritative. The „why" is Cowork's reading of
   her fix; confirm with Sigrún before any of it hardens into a grammar rule.)*

---

*Not a grammar exam — read it aloud; where it does not sound like natural written Icelandic,
mark it. Your ear is the instrument the tools do not have.*
