# IS Native Checklist — for Sigrún

**Why this exists:** our automated tools (GreynirCorrect, BÍN) catch *words* — misspellings,
non-words, unknown forms. They provably **miss subtle grammar** (constructions, agreement).
A real production reading said *„láta séð til þín"* and every tool passed it (GreynirCorrect
only failed to parse the sentence — code `E001` — which is not an error message). Only a
native eye caught it. So a few minutes of native review are worth more here than any tool.

**How it's fed to you:** `is-grammar-qa.py` now writes readings it couldn't parse (E001) to
a *needs-native-eye* list. Those, plus a small sample of recent readings, are what to scan.

**How to mark:** for each reading, write **OK** / **FIX: „…" → „…"** / **UNSURE**.
Each confirmed FIX becomes one prompt-rule (grammar), or — if corrections are re-enabled — a
`runar_corrections` row via the shrine. One place per fix (§18), never scattered.

---

## The 5 things tools miss — scan for these

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

---

*Not a grammar exam — read it aloud; where it does not sound like natural written Icelandic,
mark FIX. Your ear is the instrument the tools do not have.*
