---
name: review-everything-first-pass
description: "Text review (shop, web, translation): read EVERYTHING in both languages in the first pass, don't hand findings over in instalments"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 2f04e7f0-ff3f-4abe-a0a1-00d926b53219
  modified: 2026-10-03T17:09:59.471Z
---

When reviewing texts (e.g. agndofa.is, EN translation of an IS original), read **all** texts in **both** languages in the first pass, including the source language, and only then hand over the complete list.

**Why:** KUKY 2026-10-03, Agndofa store: „našel jsi to až napodruhé, místo hned napoprvé.“ I checked the EN translation in round 1 but only skimmed the IS original. The IS errors (bookmarks, inflection, „ljúfengan“, cacao/kakó) then turned up in rounds 3–5, so Sigrún had to go back to the site five times. On top of that, I stated „IS always says cacao“ without having read the IS pages, and it wasn't true.

**Read the RENDERED page, not just the source (KUKY 2026-10-03, second rebuke: „celkem velká chyba a úplně jsi ji minul“).** My checks read products.json and the HTML from fetch(). "Buy it now" and "Usually ready in 24 hours" only appear after the page runs in a browser, so the check reported them as "fixed" and I ticked them off. I also missed the price format "10,000 ISK" on the IS site (in IS the comma is the decimal mark), because I was looking for words, not numbers, even though it was in my own screenshot. Ever since: (1) check the result with get_page_text / a screenshot of the actual page, (2) besides words, also check NUMBERS, prices, dates and units in the format of the given language, (3) item "fixed" = seen on the rendered page, never just the "word not found in source".

**How to apply:** pull all texts first (products.json for every locale + main text of every page), read them all, check the IS findings in `is-vazba.py`, and hand over ONE list. Only claim something about a text I've actually read. For each fix, give a finished sentence to paste, not an instruction like "rephrase" (the Palo Santo "rephrase" led to the wrong continent). Related: [[break-your-own-work-before-reporting]], [[measure-dont-eyeball]].
