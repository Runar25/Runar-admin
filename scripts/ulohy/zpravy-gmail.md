# Úloha: zprávy čtenářů v Gmailu — zodpovězené a mazání po 6 měsících

Spouští ji plánovaná úloha Claude **runar-zpravy-gmail** (týdně, pondělí 9:00). Postup vlastní CODE-tune; úloha si ho při každém běhu
čte odsud, takže změna postupu = commit tohohle souboru.
Proč (owner 2026-10-16): k označování zodpovězených zpráv *„to dělej ty automaticky. já to dělat nebudu.“*; k mazání kopií v Gmailu
*„udělej plánovanou úlohu. chci vždy potvrzení že úloha po 6 měsících proběhla kde a co smazala. musíme mít kontroly!“*
(DECISIONS 2026-10-16 (2)). Rozhoduje skript `scripts/utils/zpravy_gmail.js` (pravidla v jeho hlavičce, samotest `--test`); úloha jen
přenese výsledek hledání z Gmailu a provede, co skript vypíše.

**Nikdy:** neposílej e-mail, neodpovídej, neměň štítky, nepřesouvej do koše nic, co není v řádku `KOS:` z kroku 3. Těla zpráv
nečti a nevypisuj (stačí výsledek hledání). Když si nejsi jistý, nemaž a jdi rovnou na „Selhání“.

1. Gmail konektor (schránka runar@therunekeeper.com), nástroj `search_threads`: `query` = `label:Messages`,
   `view` = `THREAD_VIEW_MINIMAL`, `pageSize` = 50. Dokud odpověď nese `nextPageToken`, načti další stránku (`pageToken`).
2. Všechny odpovědi ulož beze změny jako JSON pole `[stránka1, stránka2, …]` do souboru `gmail-messages.json` ve svém scratchpad <!-- doc-links:ok 2026-10-16 soubor vzniká až za běhu úlohy v jejím scratchpadu a krok 5 ho smaže -->
   adresáři (nástroj Write). Prázdná odpověď `{}` je platná stránka.
3. Spusť `node C:/Users/zkuku/Downloads/Runar-admin/scripts/utils/zpravy_gmail.js plan "<plná cesta k souboru>"`.
   Skript označí zodpovězené zprávy v databázi; poslední řádek výstupu je `KOS: <threadId> <threadId> …` (může být prázdný).
4. Každé vlákno z řádku `KOS:` přesuň do koše nástrojem `trash_thread`. Poznamenej si, která se opravdu přesunula.
5. Spusť `node C:/Users/zkuku/Downloads/Runar-admin/scripts/utils/zpravy_gmail.js potvrd "<plná cesta k souboru>" <threadId …>` —
   jen vlákna, která se v kroku 4 opravdu přesunula (žádné = bez dalších argumentů). Skript zapíše potvrzení do hlídání provozu
   (ops_events, ranní souhrn „Deleted (24 h)“) a oba soubory smaže.
6. Na konec napiš výstup kroku 5 a nic dalšího.

**Selhání** (kterýkoli krok selže, konektor Gmail chybí, výstup nesedí): nepokračuj v mazání a spusť
`node C:/Users/zkuku/Downloads/Runar-admin/scripts/utils/zpravy_gmail.js chyba "<krok a krátký popis, bez obsahu zpráv>"`; pak skonči a
napiš, co selhalo. Hlídání provozu (ops-watch) pošle ownerovi upozornění. Neozve-li se úloha vůbec déle než 8 dní, upozorní taky.
