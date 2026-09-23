# Batch: one sentence after the image in a rune-reading prompt (EN) — draft conclusions to attack

## What was tested
Production prompt (EN single reading) contains, after the image source sentence:
- PROD: "IMAGE — the picture in this reading comes from here: <image>. Let it become your own seeing in the text."
- NOVA: "... <image>. Let it become your own seeing: look closer, at what someone there would notice first."
Motivation: gpt-6-sol (a cheaper model under consideration) tends to open by restating the image sentence nearly verbatim.
On ONE prompt (Algiz, 5 readings per arm) NOVA cut restating clearly. This batch checks it at scale.

## Design
- 14 prompts built by the production builders (current code, current word-corrections block): all 7 opening angles × 2 images
  per angle (one sight image, one non-sight: sound ×3, smell, touch ×2, warmth); 5 of the 14 runes are "heavy" (different ending).
- Two arms per prompt identical except that one sentence (hard-checked). Models: gpt-6-sol (reasoning none) and
  claude-opus-4-8 (= production model, no thinking, system cached like the production proxy). 2 repetitions. 112 readings.
- Not included: the production per-user system context (tree/session/voice state).
- Hard metrics (mereni.json): longest verbatim word run shared with the image sentence ("usek"), share of image content
  words in sentence 1 ("v1"), instruction echo, imperative sentence openings.
- Blind judges (Claude Opus 5.5; brief given with the tested sentence removed; A/B order by hash, balanced 28/28):
  L1 how the opening takes up the image (restates/partly/re-sees) + which makes the image more its own;
  L2 fidelity (core kept, sense kept for non-sight images) with a skeptic on one-sided drift claims;
  L3 overall better reading, two independent judges (second saw A/B swapped), tiebreak on disagreement.
  Unblinded rows: soudy-odslepene.json (fields prod_*/nova_*, l1, l3, texts).

## Numbers
Hard metrics (mean over 28 per cell): usek sol 3.32 → 2.93, Opus 3.57 → 2.89; v1 sol .54 → .43, Opus .45 → .37.
Paired usek: shorter 11 / same 13 / longer 4 (both models). Direction holds in both halves (prompts 01–07 vs 08–14).
Imperative sentence openings: sol 0/28 → 0/28; Opus 6/28 → 14/28 ("Look" 0 → 7).

| | sol PROD | sol NOVA | Opus PROD | Opus NOVA |
|---|---|---|---|---|
| opening restates / partly / re-sees | 11/13/4 | 1/17/10 | 13/8/7 | 9/3/16 |
| drift after skeptic | 1 | 1 | 4 | 4 |
| sense lost (14 non-sight readings per cell) | 0 | 0 | 2 | 5 |
L1 "makes the image more its own": sol NOVA 21 / PROD 4 / tie 3; Opus NOVA 20 / PROD 5 / tie 3. Halves: sol 9–3 and 12–1; Opus 8–3 and 12–2.
L3 overall: sol NOVA 17 / PROD 11 (L3a×L3b agree 27/28) — halves 11–3 and 6–8. Opus NOVA 14 / PROD 14 (agree 24/28) — halves 9–5 and 5–9.
Opus NOVA sense losses: Perth smell image told as "Look at the thin curl of steam…" / "See the thin thread of steam…" (both reps),
Laguz groundswell "Look down and you see water pooling…"; Isa (sound under ice) loses the sound in BOTH arms (angle 4 = "out of sight").

## Draft conclusions (attack these)
1. NOVA reliably changes how the image is taken up: far fewer restating openings, judges prefer it on that lens ~4:1, in both halves, both models.
2. It does NOT robustly improve the reading overall: sol 17:11 but the halves disagree (11–3 vs 6–8); Opus 14:14.
3. For the production model (Opus 4.8) NOVA has a cost: "look closer" leaks as imperatives to the listener (imperative openings 6 → 14 of 28,
   "Look" 0 → 7) and pulls non-sight images into sight (sense lost 2 → 5 of 14). sol shows neither cost.
4. Recommendation: do not put NOVA into production for Opus 4.8. Keep it as a candidate tied to a possible switch to sol.
   Next small test: the same idea without the visual verb (no "look"), on the prompts where Opus leaked or lost the sense, then re-check sol.
