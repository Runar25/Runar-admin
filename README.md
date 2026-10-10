# Rúnar — the rune keeper (Agndofa)

> *"The runes do not decide your path… they help you remember it."*

Rúnar is a rune guide for Agndofa (Iceland): the Elder Futhark, a poetic voice, Icelandic first and English second.
This repository holds the app (`v2/`), its server functions (`supabase/functions/`), database migrations (`sql/`),
the checks that guard them (`smoke.py`, `scripts/`) and the project's working documents.

## Where things live

This README deliberately does **not** list files, tables, functions, tiers or models — every such list written here
went stale (until 2026-10-10 this file still described the v1 admin tool). Each fact has one owner:

| What | Owner |
|---|---|
| Architecture, files, load order, rules for contributors | [`CLAUDE.md`](CLAUDE.md) |
| Why things are the way they are (dated decisions) | [`RUNAR_DECISIONS.md`](RUNAR_DECISIONS.md) |
| Open work | [`RUNAR_BACKLOG.md`](RUNAR_BACKLOG.md) |
| Design, mythology, Rúnar's voice | [`RUNAR_DESIGN.md`](RUNAR_DESIGN.md) |
| Business model and costs | [`RUNAR_PRICING.md`](RUNAR_PRICING.md) |
| Privacy | [`RUNAR_PRIVACY.md`](RUNAR_PRIVACY.md) |
| Tiers, prices, spreads | `v2/runar-config.js` |
| Prompts and reading builders | `v2/runar-character.js` |
| Which model writes the readings | `supabase/functions/claude-proxy/index.ts` |

## Stack in one line

Static HTML/CSS/JS (no build step) on GitHub Pages · Supabase for the database, sign-in, server functions and storage ·
readings and voice generated through server functions, so no API key ever reaches the browser.

## Running and checking

```bash
npx serve v2          # then open http://localhost:3000/runar-reader.html
python -X utf8 smoke.py   # all checks; also runs before every push
```
