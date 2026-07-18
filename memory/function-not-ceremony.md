---
name: function-not-ceremony
description: "Kuky wants working software, not reassurance — never build process for his comfort; if it would not help me, say so and skip it"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 12b7cce8-c1bb-4d60-afe0-c53fe2a58d0b
---

Never build something to reassure Kuky or to look thorough. If a proposed mechanism would not actually help me do the work, say so plainly and skip it. His words: „pro me uspokojeni nic nedelej. jde mi o funkcnost. pokud ti to nepomuze tak to nedelej."

**Why:** 2026-07-17 the coordination protocol grew all day — lanes, action log, ZMĚNĚNO sections, prefixes — and Kuky's complaint was that he then does nothing but coordination. Process he has to police lands on him. When he asked whether to add a file-lock registry, the honest answer was no: not one of that day's four incidents would have been prevented by it, locks have their own failure (a stale `.git/index.lock` had just caused a false diagnosis), and it adds bookkeeping. He accepted that immediately — he was inviting the judgement, not the mechanism.

**How to apply:** before proposing or accepting any new rule, doc, protocol or tool, test it against real incidents: *which one would this have prevented?* If the answer is none, say that and drop it. Prefer, in order: (1) remove the ability to be wrong (Cowork does not write to the repo → that whole class is gone), (2) a mechanical check that fires by itself (smoke ⑩/⑪), (3) a rule someone must remember — last resort, because it decays and its policing lands on Kuky. Also: don't pad answers to look diligent. He reads carefully and a short correct answer beats a long one. Related: [[proceed-dont-ask]], [[verify-agent-claims-about-code]].
