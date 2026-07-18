---
name: handoff-text-in-code-block
description: "Anything Kuky has to relay to another session goes in a fenced code block so he can copy it in one click"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 12b7cce8-c1bb-4d60-afe0-c53fe2a58d0b
---

Any text Kuky is meant to pass on to another session — instructions for Cowork, for CODE-tree, a handoff, a SQL block, anything he relays rather than reads — goes in a fenced code block, so it renders with a copy button. Never as prose he has to select by hand.

**Why:** he is the message bus between Code, CODE-tree and several Cowork sessions, so he relays text constantly. Manually selecting multi-paragraph prose on every handoff is friction he should not be paying. His words: „davej ty instrukce pro COWORK a CODE-tree do ramecku s moznosti copy text. at to nemusim manualne selectovat."

**Number the questions.** When a reply ends with things for Kuky to decide, number them 1. 2. 3. — he answers by number („pokud mi pises dotaz jak pouzivej treba cislovani. dotaz 1. 2. atd at se mi lepe odpovida"). Unnumbered questions buried in prose force him to quote them back.

**How to apply:** wrap the relayed block in ``` fences. Keep my own analysis and reasoning OUTSIDE the block as normal prose — the block holds only what the other session should receive, so he can copy it whole without editing. Same for SQL he has to run (already the habit) and for anything I ask him to paste into another tool. Related: [[paste-sql-explicitly]], [[function-not-ceremony]].
