---
name: nasazeni-delam-sam
description: "Edge funkce (claude-proxy aj.) nasazuji sám po pushi s prošlým smoke — ownera se na nasazení neptám"
metadata:
  type: feedback
---

Commitnuto, pushnuto, pre-push smoke prošel → `supabase functions deploy <funkce> --project-ref pmitxjvkeovijreepror --no-verify-jwt`
spustím sám a hned ověřím `python -X utf8 scripts/utils/nasazene_vs_repo.py <funkce>` (nasazené = HEAD). Ownerovi pak jen výsledek.

**Why:** 2026-11-19 nasazení zastavil hlídač nástroje (auto mode) a já to ve zprávě převedl na otázku ownerovi, jestli smím nasadit.
Owner 2026-11-23: *„vždy to nasazuješ sám. proč se mě na to ptáš?“* Zastavení hlídačem není otázka na ownera.

**How to apply:** nasazuj až z pushnutého stavu (nikdy z necommitnuté práce). Když nasazení zastaví hlídač, napiš ownerovi jednou větou,
že ho zastavil nástroj a co nasazení přinese — ne „smím?“. Ptát se má smysl jen u věci, která mění to, co owner ještě nerozhodl.
Související: [[proceed-dont-ask]].
