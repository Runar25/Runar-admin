---
name: schranka-runar-gmail
description: Pracovní schránka runar@therunekeeper.com — třídí ji Claude přes Gmail konektor do štítků; odeslat nic bez ownerova ano; chyby z pošty do BACKLOGu
metadata:
  node_type: memory
  type: reference
  originSessionId: 12b7cce8-c1bb-4d60-afe0-c53fe2a58d0b
  modified: 2026-10-10T12:20:45.179Z
---

Schránka **runar@therunekeeper.com** (Google Workspace, od 2026-10-10) je kontakt pro testery a dotazy k Rúnarovi — uvádí ji
nápověda (`v2/runar-help.html`) i e-mail s přihlašovacím kódem (`supabase/templates/prihlaseni-kod.html`; odesílatel kódu
zůstává `noreply@therunekeeper.com`). Stránka soukromí má dál `info@agndofa.is` (správce údajů je Agndofa ehf.).

Claude ji čte přes **Gmail konektor** (připojený účet = runar@therunekeeper.com, ověř `authuser` v `viewUrl`, než cokoli uděláš).
Štítky: **Testeři · Přihlášení · Chyby · Nápady · Ostatní** (Label_1–Label_5).

Jak s ní pracovat (owner 2026-10-10: „jsi schopný si tu korespondenci přebírat, až jí bude hodně, a sortovat?“ → „ano, udělej všechno“):
- třídit do štítků a shrnovat, co přišlo; chyby a nápady z pošty zapsat do `RUNAR_BACKLOG.md` jako hlášení z appky;
- odpovědi jen jako **koncepty** (Rúnarův hlas, IS ověřená nástroji) — **nic neodeslat bez ownerova výslovného ano** u každé zprávy;
- automatický filtr (stálé pravidlo) založit jen s ownerovým ano.

Souvisí: [[copy-always-in-runar-voice]], [[is-vazba-check]], [[nacti-cteni-a-reporty]].
