---
name: paste-sql-explicitly
description: "When asking the owner to run SQL/an action, paste the exact thing — never a \"like last time\" back-reference"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 12b7cce8-c1bb-4d60-afe0-c53fe2a58d0b
---

When telling Kuky to run a migration or take an action, ALWAYS paste the exact SQL (or exact steps) inline in the message, in a code block. Never say "run it like last time" / "spusť to jako minule" / reference a file path to open — Kuky does not track which prior thing that was and it just causes friction.

**Why:** Kuky pushed back twice (2026-07-13 file-reference; 2026-07-14 "jako minule nevím co je"). The owner runs SQL in the Supabase editor by copy-paste; a back-reference forces them to hunt.

**Say WHERE it goes.** The exact SQL is not enough — name the destination on the line above the block: „**Supabase → SQL Editor → New query → Run**", „konzole prohlížeče (F12)", „terminál v repu". Kuky runs several tools at once and pasted SQL into the browser console once because I had only said „run this" (2026-07-17). He asked for it explicitly on 2026-07-18.

**No placeholders, and say what it BELONGS to.** A block containing `<user-uuid>`, `<id>`, or `sem@dej.email` is a template, not SQL — the owner cannot run it and, worse, cannot tell which feature it came from. Kuky, 2026-07-19: *„pokud má jít tohle do SQL, tak to musíš napsat jinak, já nevím k čemu to patří."* So: a header comment naming the feature and the file it lives in, values resolvable from something the owner actually knows (an **email**, not a uuid — note `user_profiles` has no `email` column, so join `auth.users`), every edit point marked `← ZMĚŇ`, and a `returning` clause or a follow-up `select` so a no-op is visible instead of silent.

**Where it lives matters too.** `sql/` splits by lifecycle: dated `YYYY-MM-DD_*.sql` = migration, run once; undated = reusable tool. A repeatable admin action pasted into the footer of a one-shot migration will eventually be run whole, by accident.

**How to apply:** Every "run this" → destination named, then a self-contained code block with the literal SQL, plus one line of what it does. Related: [[working-style]], [[handoff-text-in-code-block]].
