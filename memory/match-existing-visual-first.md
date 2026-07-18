---
name: match-existing-visual-first
description: "Before adding any UI, read how the existing UI already looks and copy it — never invent radii, colours, fonts or spacing"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 12b7cce8-c1bb-4d60-afe0-c53fe2a58d0b
---

Before adding ANY new UI to Rúnar, FIRST read how the existing UI does that same job, then match it exactly. Applies to border-radius, colours, shades, fonts, sizes, spacing, hover and disabled states — everything. Never invent a new visual value.

**Why:** Ask Rúnar was added later and I gave it `border-radius:6px`, a filled boxed input, `font-family:inherit`, `letter-spacing:2px` and an off-palette hex `#e9e1d1` — while **nothing** in the app has a border-radius, every prose input is a bare underline, and an exact precedent for an input+button row already existed (`.redeem-row`). KUKY: „tyhle veci jsou jednoduche a maji byt od zacatku spravne" — it cost a round of rework on something that should have been right the first time, and he is right that this knowledge decays unless it is written down.

**How to apply — before writing a single line of new UI CSS/markup:**
1. Find the nearest existing component doing the same job: input+button row → `.redeem-row` · prose input → `.txt` · secondary button → `.btn-half` / `.btn-outline` · primary → `.btn-gold` / `.btn-full` / `.redeem-btn` · tertiary → `.btn-voice`.
2. Read its rules in `v2/runar-reader.css` and copy the structure; vary ONLY what genuinely differs.
3. Verify by comparing **computed styles in the browser** against the precedent (preview_start → javascript_tool → getComputedStyle), not by eye.

**Established conventions (2026-07-17):** NO `border-radius` on any button or input · inputs = `background:transparent; border:none; border-bottom:1px solid var(--border2)`, focus turns the underline `var(--gold)` · prose inputs = `'Cormorant Garamond',serif`; code inputs = `'Cinzel',serif` uppercase · buttons = `'Cinzel',serif`, square; outlined-gold hovers to `background:var(--gold);color:#000` · colours ONLY from palette vars, never a hardcoded hex. Related: [[proceed-dont-ask]].
