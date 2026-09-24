# Second batch: "one detail" image line vs production — draft conclusions to attack

## What was tested
- PROD: "IMAGE — …: <image>. Let it become your own seeing in the text."
- DETAIL: "… <image>. Let it become your own seeing in the text, down to one detail the sentence does not name."
Background: an earlier variant ("look closer, at what someone there would notice first") cut restating of the image
sentence but was echoed verbatim by Opus 4.8 ("Look closer, and you see…" 4×). DETAIL avoids any verb the model could
repeat to the listener. Owner said the new sentence "sounds better than production".
Owner boundaries (given to judges): an imperative stepping INTO the image ("See the faint crease…") is fine; only advice
about the seeker's life violates "never tells the seeker what to do". A physical consequence told as picture ("your
knuckles have learned this before your mind has") is fine; cold reading = claims about inner state.

## Design
Same 14 production-built prompts as batch 1 (7 angles × sight/non-sight image), same PROD readings reused, DETAIL arm
new: gpt-6-sol + claude-opus-4-8 (production), 2 reps → 56 DETAIL readings, $0.39. Blind judges (Claude Opus 5.5), this
time WITH the system prompt (canon) visible; brief without the tested sentence; A/B by hash 28:28.
L1 how closely the opening retells the source sentence (mostly/partly/no) + which is closer to it;
L2 fidelity with skeptic on one-sided drift AND sense-loss claims; L3 overall ×2 (second swapped) + tiebreak, plus flag
lists: advice, inner-state claims, rune as physical force, formula.
Data: soudy2-odslepene.json (one row per pair, prod_*/detail_* fields, l3, texts), mereni3.json (hard metrics, all 3 arms).

## Numbers
Hard (28 per cell): Opus usek 3.57 → 2.93, usek≥5 7 → 2, v1 .45 → .34 (paired 16 less / 5 same / 7 more), holds in both
halves and both reps; imperative openings 6 → 3 (all scene-entry); echo of the wording 0; sound kept (sound images, first
two sentences) 4/6 → 5/6. sol usek 3.32 → 3.04, usek≥5 4 → 1, v1 .54 → .46 (paired 14/10/4); perceiver "you see/hear…" in
sentence 1: sol 6 → 9 (look-closer arm had 16).
Judges:
| | sol PROD | sol DETAIL | Opus PROD | Opus DETAIL |
|---|---|---|---|---|
| opening retells mostly/partly/no | 20/5/3 | 12/10/6 | 15/11/2 | 7/14/7 |
| closer to source | 19 | 6 | 19 | 8 |
| advice / inner / rune-force / formula (readings flagged) | 2/3/16/22 | 1/2/15/20 | 8/6/17/26 | 3/10/18/19 |
| drift / sense lost (after skeptic) | 1/0 | 2/0 | 1/1 | 2/1 |
L3 overall: Opus DETAIL 18 : PROD 10 (agree 24/28, 4 tiebreaks), reps 9–5 and 9–5, halves 10–4 and 8–6, shorter reading
won 16/26; prompt level 5 DETAIL / 1 PROD / 8 split; pair sign test p≈0.19, prompt p≈0.22.
sol DETAIL 12 : PROD 16 (agree 27/28), reps 4–10 and 8–6, halves 5–9 and 7–7; prompt level 4/6/4.

## Draft conclusions (attack these)
1. DETAIL cuts restating of the image sentence for both models (judges and hard metrics agree, both halves, both reps).
2. For Opus 4.8 (production) DETAIL leans better overall (18:10, same direction in every split) but it is NOT proven (p≈0.2).
3. For sol no overall gain was detected (12:16, reps disagree).
4. DETAIL has none of the look-closer costs: no verbatim echo, fewer imperatives, fewer life-advice flags (8 → 3 on Opus).
   Watch: inner-state flags 6 → 10 on Opus (unverified judge flags).
5. Recommendation: hand DETAIL to CODE-tune for production (EN) as a small, reversible change with owner's OK;
   IS counterpart must be written and verified first (IS primary), and inner-state claims watched in live readings.
