---
name: schranka-runar-gmail
description: Pracovní schránka runar@therunekeeper.com — třídí ji Claude přes Gmail konektor do štítků; odeslat nic bez ownerova ano; chyby z pošty do BACKLOGu
metadata:
  node_type: memory
  type: reference
  originSessionId: 12b7cce8-c1bb-4d60-afe0-c53fe2a58d0b
  modified: 2026-10-10T13:56:20.812Z
---

Schránka **runar@therunekeeper.com** (Google Workspace, od 2026-10-10) je kontakt pro testery a dotazy k Rúnarovi — uvádí ji
nápověda (`v2/runar-help.html`) i e-mail s přihlašovacím kódem (`supabase/templates/prihlaseni-kod.html`; odesílatel kódu
zůstává `noreply@therunekeeper.com`). Stránka soukromí má dál `info@agndofa.is` (správce údajů je Agndofa ehf.).

Claude ji čte přes **Gmail konektor** (připojený účet = runar@therunekeeper.com, ověř `authuser` v `viewUrl`, než cokoli uděláš).
Štítky: **Testers · Login · Bugs · Ideas · Other** (Label_1–Label_5) — anglicky, je to společná řeč se Sigrún (CLAUDE.md §31,
KUKY 2026-10-10: „štítky musí být EN“; do té doby česky).

Jak s ní pracovat (owner 2026-10-10: „jsi schopný si tu korespondenci přebírat, až jí bude hodně, a sortovat?“ → „ano, udělej všechno“):
- třídit do štítků a shrnovat, co přišlo; chyby a nápady z pošty zapsat do `RUNAR_BACKLOG.md` jako hlášení z appky;
- odpovědi jen jako **koncepty** v IS a EN (Rúnarův hlas, IS ověřená nástroji; česky nikdy — §31) — **nic neodeslat bez ownerova
  výslovného ano** u každé zprávy;
- automatický filtr (stálé pravidlo) založit jen s ownerovým ano.

**Hromadný e-mail testerům** (owner 2026-10-10 chtěl „skupinu testers“): adresy VŽDY čerstvě z DB do **BCC** — `select email from
public.allowed_emails where role = 'tester'` (přes `supabase db query --linked`); Komu = runar@therunekeeper.com. Skupinu kontaktů
NEzakládat: konektor kontakty neumí, byl by to druhý seznam vedle `allowed_emails` (§20) a v poli Komu by testeři viděli adresy
ostatních. Nový tester v `allowed_emails` = je v příštím e-mailu sám.

**Konektor ořezává HTML konceptu** (ověřeno 2026-10-10 na RAW konceptu): `<img>` pryč, barvy pozadí pryč, každý odkaz i holá
adresa se obalí `google.com/url?q=…` (příjemce by po kliknutí viděl přesměrovací stránku Google). Text, tučné, nadpisy a seznamy
přežijí. E-mail s obrázky a čistými odkazy: HTML soubor → owner ho otevře v prohlížeči, Ctrl+A, Ctrl+C a vloží do konceptu
(obrázky musí ležet na veřejné adrese — `v2/email/` na GitHub Pages; Gmail nezobrazí obrázky vložené jako `data:`).

Souvisí: [[copy-always-in-runar-voice]], [[is-vazba-check]], [[nacti-cteni-a-reporty]].
