---
name: measure-dont-eyeball
description: "Never present a visual impression as a finding — measure it, or say I do not know; Kuky explicitly does not accept my impressions"
metadata:
  node_type: memory
  type: feedback
---

Do not turn a look at a screenshot, a rendered image, or a tool's formatted output into a claim of fact. Either measure it (pixel counts, image fingerprints, a reproduction) or say plainly that I cannot tell. Kuky's words, 2026-07-19: **„na tvůj dojem nedám, sorry."**

**Why:** twice in one day I did exactly this. (1) I read a `\` in Grep's formatted output and announced a syntax error in production code — it was a rendering artifact; the file was fine. (2) Kuky sent three screenshots of the tree; I declared that two of them at the same slider position showed different silhouettes and used it as evidence of a rendering bug. They were at different crops and zoom levels, so the comparison was worthless, and the actual difference he cared about was between two *different* positions. Both times the tone was confident and the surface was unreliable — and this was during a session where I was repeatedly telling him "measure, don't eyeball". An impression dressed as a finding costs him more than silence, because he has to spend his own time disproving it.

**How to apply:** when the evidence is an image or a formatted view, run the measurement instead — canvas pixel mass, an image fingerprint over the same canvas, or a reproduction with known inputs. When measurement is not available, write "nedokážu z tohohle rozhodnout" and say what would settle it. Watch especially for comparisons across images that were captured separately — different crop, zoom, or device scale makes silhouette comparison meaningless. And when a real diagnosis exists alongside the guess, keep them apart: after this mistake the oscillation diagnosis still held, because it came from a reproduction, not from the screenshots. Related: [[verify-agent-claims-about-code]], [[guard-test-the-lifecycle]], [[read-the-check-before-push]].
