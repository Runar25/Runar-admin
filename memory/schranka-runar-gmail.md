---
name: schranka-runar-gmail
description: Pracovní schránka runar@therunekeeper.com — třídí ji Claude přes Gmail konektor do štítků; odeslat nic bez ownerova ano; chyby z pošty do BACKLOGu
metadata:
  node_type: memory
  type: reference
  originSessionId: 12b7cce8-c1bb-4d60-afe0-c53fe2a58d0b
  modified: 2026-10-10T19:36:50.053Z
---

Schránka **runar@therunekeeper.com** (Google Workspace, od 2026-10-10) je kontakt pro testery a dotazy k Rúnarovi — uvádí ji
nápověda (`v2/runar-help.html`) i e-mail s přihlašovacím kódem (`supabase/templates/prihlaseni-kod.html`; odesílatel kódu
zůstává `noreply@therunekeeper.com`). Stránka soukromí má dál `info@agndofa.is` (správce údajů je Agndofa ehf.).

Claude ji čte přes **Gmail konektor** (připojený účet = runar@therunekeeper.com, ověř `authuser` v `viewUrl`, než cokoli uděláš).
Štítky: **Testers · Login · Bugs · Ideas · Other** (Label_1–Label_5) + **Ops** (Label_6, od 2026-10-14: hlídání provozu — e-maily
„Rúnar Ops · …“ od noreply@therunekeeper.com, DECISIONS 2026-10-14 (13)) + **Messages** (Label_7, od 2026-10-15: zprávy čtenářů
„Rúnar · A line from a reader“ z menu appky, Reply-To = uživatel; odpovídá owner tlačítkem Odpovědět, pak zprávu ve shrine (REPORTS)
označí „fixed“ — od toho času běží 6 měsíců do smazání z DB; DECISIONS 2026-10-15) — anglicky, je to společná řeč se Sigrún (CLAUDE.md §31,
KUKY 2026-10-10: „štítky musí být EN“; do té doby česky; 2026-10-14 znovu: „žádná čeština v Gmail. Nikdy. Vše EN.“).

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
**Ani inline příloha nepomůže** (ověřeno 2026-10-10 na RAW konceptu): `<img src="cid:…">` konektor vyřízne taky a obrázek uloží jen
jako přílohu na konec zprávy (Content-ID si vymyslí vlastní). Koncept, který owner upravuje v Gmailu, proto obrázky nikdy nemá, dokud do
něj nevloží zkopírovanou stránku — 2026-10-10 to owner zjistil až v hotovém konceptu („chybí obrázky!!!“). Hned při předání konceptu
říct, že obrázky přijdou jen vložením stránky, a stránku stavět z JEHO aktuálního konceptu (vytáhnout přes get_draft), ne ze staré kopie.

Souvisí: [[copy-always-in-runar-voice]], [[is-vazba-check]], [[nacti-cteni-a-reporty]].
