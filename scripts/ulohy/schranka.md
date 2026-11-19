# Úloha: schránka runar@ — denně projít, opravit, co jde, roztřídit

Spouští ji plánovaná úloha Claude **runar-schranka** (denně 7:00 místního času = UTC; ranní souhrn Ops chodí v 6:00, noční záloha
ve 3:30). Postup vlastní CODE-web; úloha si ho při každém běhu čte odsud, takže změna postupu = commit tohohle souboru.
Proč (owner 2026-11-19): *„budeš se starat o email“*; k denní úloze *„8. ano“* (DECISIONS 2026-11-19, „Schránku runar@ má na starosti
CODE-web“). Souhrny Ops do té doby nikdo nečetl a záloha bez kopie na Drive tak běžela 9 dní. Pravidla schránky (štítky, jen
koncepty, jazyk) → `memory/schranka-runar-gmail.md`.

**Nikdy:** neposílej e-mail, neodpovídej (koncept jen na ownerovu žádost), nic nemaž ani nepřesouvej do koše, nesahej na vlákna se
štítkem Messages (vlastní je úloha runar-zpravy-gmail), neměň kód v repu. Těla zpráv lidí do výstupu neopisuj — stačí odesílatel,
předmět a jednou větou, o co jde. Gmail = konektor připojený ke schránce runar@therunekeeper.com: napřed ověř
`authuser=runar@therunekeeper.com` ve `viewUrl`; jiný účet → nic nedělej a napiš to ownerovi.
Repo = `C:\Users\zkuku\Downloads\Runar-admin` (dál jen „repo“). V Bash nikdy `cd … &&` ani `| tail`.

1. **Co přišlo:** `search_threads`, `query` = `in:inbox`, `view` = `THREAD_VIEW_SUMMARY`, `pageSize` = 50 (dokud je `nextPageToken`,
   načti další stránku). Roztřiď: Ops (noreply@therunekeeper.com, štítek Ops) · DMARC (noreply-dmarc-support@google.com) ·
   Google (sc-noreply@google.com, no-reply@accounts.google.com) · Messages (nech být) · lidé (všechno ostatní).

2. **Ranní souhrn Ops** — nejnovější „Rúnar Ops · …“ z dneška (`search_threads` `from:noreply@therunekeeper.com newer_than:1d`,
   pak `get_message`, PLAIN_TEXT). **Chybí-li dnešní souhrn**, je nejspíš ve spamu (konektor spam nevidí; 2026-11 tam Gmail odložil
   4 souhrny) → bod pro ownera: „dnešní souhrn Ops nepřišel — podívej se do spamu a dej Not spam“. Odrážky PROBLEM:
   - **Database backup missing or failed:** posledních ~10 řádků `C:\Users\zkuku\runar-eval\zaloha-db\log.txt` a stav úlohy Windows
     (PowerShell `Get-ScheduledTask -TaskName 'Runar - zaloha databaze' | Get-ScheduledTaskInfo`). Přišlo-li po souhrnu
     „RESOLVED · Database backup OK again“, je vyřízeno. Příčina „Google Drive není připojený“:
     - disk `H:` je (`Test-Path 'H:\My Drive\Runar-zalohy'`) → zkopíruj z `C:\Users\zkuku\runar-eval\zaloha-db\archiv` každý
       `runar-db-*.7z`, který na `H:\My Drive\Runar-zalohy` chybí (velikost musí sedět), a pusť
       `"C:/Program Files/nodejs/node.exe" <repo>/scripts/utils/zaloha_db.js` (exit 0 = hotovo; skript při tom smaže zálohy starší
       30 dní — to má, zásady soukromí);
     - disk `H:` není → ownerovi: „Drive pro počítač nemá připojený účet runar@ — otevři Google Drive a přihlas ho“.
     Jiná příčina → ownerovi řádek z logu.
   - **Restore test / restore copy failed:** `powershell -NoProfile -ExecutionPolicy Bypass -File <repo>\scripts\utils\probud_zkusebni_projekt.ps1`
     vypíše stav zkušebního projektu Runar Testing. `INACTIVE` (uspaný) → totéž s `-Probud -CekejMinut 15` (owner 2026-11-19
     *„7. udělej to ty“*), po `ACTIVE_HEALTHY` počkej ještě 2 minuty a pusť
     `"C:/Program Files/nodejs/node.exe" <repo>/scripts/utils/obnova_db.js --mesicni`. Spadne-li první pokus bez čitelné chyby
     (2026-11-19 se to stalo hned po probuzení), pusť ho jednou znovu. Výsledek (řádek „OK … 9 kontrolách“ / chyba) do zprávy.
   - **Deploy vs repo:** `git -C <repo> fetch -q` a `git -C <repo> log origin/main..HEAD --format='%h %an %s'`. Rozdíl, který vysvětlí
     nepushnuté nebo nenasazené commity té lane (mění soubory dané funkce), je rozdělaná práce → jen poznámka. Jinak ownerovi:
     která funkce, od kdy, čí lane (`CLAUDE.md`, „Lanes“).
   - **Cokoli jiného** (Greynir, klíče Supabase, mazací úlohy, hlášení z appky …): najdi vlastníka (`CLAUDE.md` lanes) a stav
     (`node <repo>/scripts/utils/uz_vime.js <pojmy>`). Je-li to v BACKLOGu s termínem nebo jako známá věc → jen poznámka; nové → ownerovi
     jednou větou: co, čí to je, co navrhuješ.
   Zpracované souhrny a upozornění Ops (i RESOLVED): `unlabel_thread` `["INBOX","UNREAD"]` — štítek Ops zůstává.

3. **DMARC:** u každého vlákna `get_thread` (PLAIN_TEXT dá `attachments`) → `download_gmail_attachment` → soubor zkopíruj do nové
   prázdné složky ve svém scratchpadu → `python -X utf8 -I <repo>/scripts/utils/dmarc_cti.py <soubory>`. Pak každou zprávu
   `update_message_labels`: přidat štítek **DMARC** (id z `list_labels`), odebrat `INBOX` a `UNREAD`. Ownerovi jen řádek „POZOR …“
   (kolik zpráv neprošlo a odkud). Známé zdroje, které procházejí: Brevo (77.32.148.x, podpis brevo1/brevo2), Google (podpis google).

4. **Google:** Search Console — u hlášek o indexaci ověř, že každá `<loc>` z `<repo>/web/site/sitemap.xml` vrací 200
   (`curl -s -o /dev/null -w '%{http_code}'`, bez `-L`); ownerovi jen adresa ze sitemapy, která 200 nevrací. Bezpečnostní upozornění
   účtu runar@: známá zařízení — iPhone 12 Pro = Sigrún (owner 2026-11-19). Neznámé zařízení, změna hesla nebo nový přístup → ownerovi
   hned, nahoru. Vyřízené: `unlabel_thread` `["INBOX","UNREAD"]`.

5. **Lidé** (testeři, čtenáři mimo Messages, firmy): štítek podle obsahu (Testers · Login · Bugs · Ideas · Other), v doručené poště
   nech **nepřečtené**, ownerovi jedním řádkem: kdo, o čem, co navrhuješ. Zjevný spam nebo nabídka služeb (SEO, weby) → štítek Other
   a jen poznámka. Chyba nebo nápad z pošty → do `RUNAR_BACKLOG.md` jako hlášení (přes `scripts/utils/commit_vlastni.py`, lane
   CODE-web, a commit), jinak v repu nic neměň.

6. **Zpráva ownerovi** (česky, krátce, body číslované, otázky s otazníkem; než položíš otázku nebo návrh, pusť
   `node <repo>/scripts/utils/uz_vime.js <pojmy>` — chce to hook): nahoře, co potřebuje ownera; pak jednou větou, co úloha opravila.
   Nic pro ownera → jediný řádek „Schránka v pořádku — <kolik vláken>, <co opraveno>“.

**Selhání** (konektor chybí, skript spadne, výsledek nesedí): nic dalšího neopravuj naslepo, napiš ownerovi, který krok a s jakou
chybou (bez obsahu zpráv). Neozve-li se úloha, pozná to owner podle toho, že od ní ráno nic nepřišlo.
