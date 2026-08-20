---
name: runar-api-key-file
description: Anthropic API klíč pro generování dávek bydlí v ~/.claude/runar-api-key.txt (mimo repo); gen_direct.js si ho vezme sám — ownera o něj nežádat
metadata:
  type: feedback
---

Klíč k `api.anthropic.com` leží v `C:\Users\zkuku\.claude\runar-api-key.txt`.
`scripts/utils/gen_direct.js` ho čte sám, když není `ANTHROPIC_API_KEY` v env — takže
generování dávky **nevyžaduje žádnou akci ownera**.

**Why:** KUKY 2026-08-20: *„proč jsi ho neuložil? teď se mě na to budeš pořád ptát?"*
Klíč jsem po doběhnutí dávky smazal ze scratchpadu jako hygienu — a za dvacet minut ho
potřeboval znovu, takže jsem o něj musel žádat. Úklid, který si owner nevyžádal, mu udělal
práci navíc. Souvisí: [[read-token-from-clipboard]] (to je JINÁ věc — Supabase JWT s hodinovou
platností, ten se opravdu obnovuje ze schránky).

**How to apply:**
- Klíč **mimo repo**, nikdy dovnitř. Repo je veřejné a gitignore není pojistka — jedno
  `git add -f` a je venku. Proto `~/.claude/`, ne `scripts/`.
- Do chatu ani do commitu se nevypisuje.
- Když soubor chybí, generátor to řekne cestou k souboru; teprve pak si říct ownerovi.
- Smazat ho jen tehdy, když o to owner požádá.
