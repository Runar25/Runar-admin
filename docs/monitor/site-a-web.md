# Monitor sítí a webu — čísla Rúnara v čase (CODE-web)

Vlastní: časovou řadu veřejných čísel Rúnara na sítích a webu a co se mezi měřeními změnilo. Obsah sítí dělá Sigrún, monitoring
a techniku CODE-web (DECISIONS 2026-11-02 (8)). Doporučení k sítím a stav profilů → RUNAR_BACKLOG „Sociální sítě Rúnara“.

**Zdroje (bez přihlášení):** veřejné profily Instagramu, TikToku a YouTube · web: Search Console (hlášení chodí do runar@, jen když tam
je runar@therunekeeper.com uživatelem) · registrace: oznámení „New waitlist signup“ na runar@ (od 2026-10-21; od 2026-11-02 se štítkem
kanálu „Channel: ig“, DECISIONS 2026-11-02 (3)).
**Kdy:** každé pondělí kolem 8:30 naplánovaná úloha `runar-prehled-site-a-web` (DECISIONS 2026-11-02 (11)) — jen čte a ownerovi
dá krátký přehled; sekci níž z něj připíše CODE-web. Běží, jen když je appka Claude otevřená.
**Nevidím:** dosah a zobrazení příspěvků — statistiky Instagramu a TikToku jsou jen v účtu; bez nich se dosah pozná jen ze sledujících,
reakcí a registrací podle kanálu.

## 2026-11-02 · výchozí stav

| kanál | sledující | příspěvky | odkaz na web | AI v biu |
|---|---|---|---|---|
| Instagram @runartherunekeeper | 12 (sám sleduje 2) | 0 | therunekeeper.com, bez `?z=ig` | ne |
| TikTok @runartherunekeeper | 1 (sám sleduje 1), 0 lajků | 0 | https://therunekeeper.com, bez `?z=tt` | ne |
| YouTube @RunartheRuneKeeper | 4 odběratelé | 0 | žádný | ne (v zobrazené části popisu) |

Web: nasazeno 2026-11-02 — 53 adres v sitemapě (landing, 2 rejstříky run, 50 stránek run), Search Console: ownerův účet vlastnost
therunekeeper.com zatím nemá. Registrace: od 2026-10-21 na runar@ jedno oznámení.

## 2026-11-03 · odkazy se štítkem v biu

| kanál | sledující | příspěvky | odkaz na web | AI v biu |
|---|---|---|---|---|
| Instagram | 12 (sám sleduje 2) | 0 | `therunekeeper.com/?z=ig`, klikací | ne |
| TikTok | 1, 0 lajků | 0 | `https://therunekeeper.com/?z=tt` jen jako text v biu, klikací ne | ne |
| YouTube | 4 odběratelé | 0 (RSS kanálu bez videí) | `https://therunekeeper.com/?z=yt` na konci popisu | ne |

Od 2026-11-02: všechna tři bia mají odkaz se štítkem (DECISIONS 2026-11-03 (2)), YouTube odkaz poprvé; sledující beze změny.
Web: krátké adresy `/ig`, `/tt`, `/yt`, `/fb` a zkušební ikony `/icon-test/` nasazeny 2026-11-03 (noindex, mimo sitemapu).
Registrace: na runar@ za poslední 3 dny žádné oznámení.

## 2026-11-23 · tři týdny bez jediného příspěvku

| kanál | sledující | příspěvky | odkaz na web | štítky AI |
|---|---|---|---|---|
| Instagram | 13 (sám sleduje 2) | 0 | `therunekeeper.com/?z=ig`, klikací | štítek profilu ve veřejném zobrazení není; v biu ne |
| TikTok | 1, 0 lajků | 0 | `https://therunekeeper.com/?z=tt` jen jako text v biu | v biu ne; videa nejsou |
| YouTube | 4 odběratelé | 0 (RSS bez položek) | `https://therunekeeper.com/?z=yt` na konci popisu | v popisu ne; videa nejsou |

Pondělní měření 9. 11. a 16. 11. dala totéž: Instagram 12 → 13 do 9. 11., pak beze změny; TikTok a YouTube beze změny. Na žádném
kanálu zatím není příspěvek ani video — bez obsahu dosah nemá z čeho růst (obsah dělá Sigrún). YouTube: odkaz na web je jen v popisu;
v sekci **Links** nastavení kanálu by se ukázal klikací pod jménem kanálu i bez videí (návrh úlohy 2026-11-23, pro Sigrún).
Registrace: od 2026-10-21 žádné nové oznámení. Web: `/`, `/runir/`, `/en/runes/` a `/sitemap.xml` vrací 200, sitemapa 53 adres.
Search Console: vlastnost ověřená 2026-11-07 (účet runar@); hláška 2026-11-09 o neindexovaných stránkách (Page with redirect, Blocked
by robots.txt, Not found) se adres ze sitemapy netýká — všech 53 vrací 200 a `robots.txt` povoluje vše (CODE-web 2026-11-19); jde
o přesměrování (http, www, adresy bez lomítka) a adresy mimo web. Zdroje měření: úloha `runar-prehled-site-a-web` 9., 16. a 23. 11.
