# Jednotný vzhled appky — soupis rozdílů a návrh výchozích komponent (CODE-read, 2026-10-20)

Zadání: owner přes CODE-tune 2026-10-20 (body 4, 5, 9 z hlášení 2026-10-19/20; BACKLOG „Hlášení z appky 2026-10-19 / 20“):
*„to má být sjednocené … okna, text, font, barvy … musíš to mít někde speciálně napsané, abys to dodržoval? Tak to udělej.“*
Tenhle soubor je **podklad**: z tabulky postaví CODE-tune soupis komponent na jednom místě a kontrolu („nová třída buď komponentu
používá, nebo je v soupisu s důvodem“). Intake, ne kánon — po převzetí zmizí.

Zdroj: soupis CSS/HTML/JS (subagent, řádky ověřené namátkou: `--dim-text` 3× bez definice, `.btn-gold` 2× css:369+522,
`.auth-gate-rune` bez barvy) + prohlížeč (produkce, telefon 375 px, IS/EN). Řádky = `v2/runar-reader.css`, není-li řečeno jinak.

## 1. Komponenty × místa × čím se liší × návrh výchozí

| Komponenta | Varianty dnes | Čím se liší | Návrh výchozí (všude) |
|---|---|---|---|
| **Okno** | `.modal` (auth, send-line, lang-switch, install, tester, delete) · `.wts-card` · `.journey-card` · `.name-overlay/.name-card` · side panel · dropdown · rune popup · reporter sheet | šířka 340/420/440/90 %, titul vlevo × uprostřed, ✕ ano/ne (delete, lang-switch, name overlay bez ✕), zavření klikem mimo ano/ne, rozmazané pozadí jen name overlay, název `.name-card-title` jiný než `.modal-title`, runa v hlavičce font ᚱ (install, name) × `runeSvg` | **`.modal`**: 1px zlatý rámeček, padding 32, max 420 (journey smí 440 kvůli cestě), titul `.modal-title` vlevo, **✕ `.modal-close` vždy**, Esc + klik mimo zavře vždy (kromě souhlasu testera), runa v hlavičce vždy `runeSvg` kámen (§5). Name overlay převést na `.modal`. |
| **Tlačítko plné** | `.btn-full` (0.9em bold 700) · `.btn-gold` (2× definované, text #0d1824, hover #e6ab00) · `.redeem-btn` · reporter `.br-send` | velikost, váha, barva textu, hover (#fff × #e6ab00) | **`.btn-full`** (hlavní akce obrazovky, max 1 na obrazovku); `.btn-gold` sloučit do něj; malá varianta jen `.btn-full.mala` |
| **Tlačítko obrysové** | `.btn-upgrade`+`.tn-btn` (0.58em) · `.vcn-btn.btn-upgrade` (0.62em, táž věta jinak velká) · `.btn-full.sec` (0.9em bold — mnohem těžší) · `.btn-half(.sec)` · `.name-card-btn` · `.ask-btn` · `#sp-higher-toggle` (hover jen tónem) | velikost 0.58–0.9em, váha, hover výplň × tón | **`.btn-upgrade`** jedna velikost (0.62em, padding 12×28), hover = výplň zlatou + černý text; `.btn-full.sec` → tahle; dvojice dole `.btn-half` zůstává (rozložení), ale stejné písmo |
| **Šipka →** | jen u GERAST LEITANDI, tree-dob, dd-journey, sp-path; **ne** u WALK ON / STEP BACK / MANAGE, wts_open | nahodilé | **„→“ = vede jinam** (otevře okno / jinou obrazovku / web) — u všech takových, u ostatních nikdy |
| **Rozbalovač** | `.guide-lbl::after` „+/−“ · `.hint-tgl` · `.ask-lbl` (Cormorant, muted) · `.tree-toggle-arrow` „+“ otočené 45° (u „0 rune readings remaining“ = ownerův vzor) · `.sp-curr-arrow` „+/−“ před jménem · `.jcard-arrow` „▾“ otočené 180° · `.auth-user::after` „▾“ | znak, velikost, barva (zlatá × muted), poloha (před × za), animace (žádná × 45° × 180°), aria-expanded jen někde | **jeden prvek „+“ za textem, zlatý, o stupeň větší než dnes (owner „výraznější“), otevřením se otočí o 45° kolem svého středu na „×“ (0,25 s; bez animací jen výměna)** — u všech rozbalení na místě; vždy `button` + `aria-expanded`. Deníkové karty taky („▾“ pryč). |
| **Nadpis sekce (Cinzel)** | `.flbl` `.guide-lbl` `.auth-lbl` `.redeem-lbl` 0.65em/2px zlatá (většina) · `.card-lbl` 0.7 · `.layer*-lbl` muted · `.ask-lbl` Cormorant 0.72**rem** · `.tree-*-label` muted · `.journey-nm` **bílá** 0.78 · `.dd-tier` 0.58 | velikost 0.5–0.9, barva zlatá × muted × bílá, jednotka em × rem | **0.65em / 2px / zlatá**; muted jen pro popisky vrstev čtení (záměr: text čtení vede); `.journey-nm` zlatě (aktivní) / zlatě s průhledností (ostatní), ne bílá |
| **Pruh / oznámení** | `.tier-notice` (4×) · `.tn-compact` · `.redeem-section` (modrý rámeček) · `.coll-detail` (zlatý) · `.credits-banner`, `.auth-gate` (mrtvé) | rámeček zlatá .2 × modrá × plná zlatá | **`.tier-notice`** pro všechna oznámení; mrtvé (`#upgrade-gate`, `#credits-banner`) smazat |
| **Drobný text** | `.ai-note` (Cormorant 0.8) a pod ním `#reader-disclaimer` (**Cinzel** 0.6) na téže obrazovce · `.line-note` · `.wts-note` (ne kurzíva) · `.credit-note` Cinzel 0.58 | písmo, kurzíva | **Cormorant kurzíva 0.8em muted** pro všechnu drobnou poznámku; disclaimer stejně jako `ai-note` |
| **Text karet** | ~20 variant kurzívy 0.71–1.05em, řádkování 1.6–1.9 | velikost | dvě: **text** (0.92em / 1.8) a **poznámka** (0.8em / 1.6) |
| **Barvy** | 25 průhledností zlaté, #D6A85C (jen SVG + `.journey-gift`), #FFE6A0/#FFD060 (svíčka), 6 tmavých pozadí mimo tokeny (#0d1220 6×), červené bez tokenu | — | jen tokeny; přidat `--gold-soft` (#D6A85C, jen kresby run a jejich text), `--danger` (#e07070), `--panel` (#0d1220); průhlednosti zlaté na 4 stupně (.08 tón · .2 rámeček · .4 linka · .7 text) |
| **Zaoblení** | komentář css:760 „nikde“, ale 2–14 px na 10 místech | — | **0** všude kromě kulatých plovoucích tlačítek (? ⚑) |

## 2. Nové třídy z 2026-10-19/20 (owner je vytkl první)
1. `.dd-journey` — vodorovný padding **0** (sourozenci 18px) → text u kraje; plný modrý okraj místo .3; bez hoveru. → padding 18, okraj jako `.dd-tier`, hover jako `.sp-item`.
2. `.journey-card` — titul na středu (ostatní okna vlevo); `.journey-per` podtržení 1px (ostatní přepínače 2px, s rámečkem); `.journey-nm` bílá; `.journey-gift` natvrdo #D6A85C; `.journey-foot` modrá linka (jinde zlatá .1); `.journey-note.klik` třetí barva podtržení.
3. `.svice` — barvy natvrdo; `forwards` nechá text #FFD060, takže **přebije hover `.btn-upgrade`** (zlatý text na zlaté výplni = nečitelné) a barvu štítku zámku. → po doznění vrátit barvu tokenem; u tlačítka svítí jen rámeček (ring), ne text.
4. `.atab-ikona` — velikost odvozená od písma záložky → ikony se v obou řádcích záložek liší; vlastní systém vedle `.lbl-rune`. → pevná velikost v px, jedna třída pro ikony u popisků.
5. `.visitor-lock-hint` 0.72em/.75 vs `.opt` 0.85em/.65 v tomtéž popisku; dvě varianty zamčených pilulek (`.pills-locked` × `.pill-locked`).
6. `#sp-higher-toggle` — třídy se jmenují pořád jako rozbalovač, „+“ v HTML se v JS mění na „→“.

## 3. Vady mimo vzhled (opravit)
- `--dim-text` není definovaný (css:1029, 1042, 1091) → neaktivní tlačítka výkladů a prázdná čísla slotů jsou bílá místo tlumených.
- Dvojí definice: `.btn-gold` (369, 522), `.tree-rune-name` (341, 362), `.ask-lbl` (757, 767), `.auth-user`, `.name-card`, `.badge-life`.
- **Helper „?“ (z-index 99998) leží nad každým oknem (`.modal-overlay` 100)** — v okně „Ferð þín“ na telefonu překrývá spodní levý roh (ověřeno v prohlížeči).
- `.auth-gate-rune` (mrtvé) bez barvy → ᚱ bílá (§5 „vždy zlatá“).
- `.ask-input:disabled` text v `--dim` (§5).
- Hover, který nic nemění: `.tn-counter.warn`, `.tier-notice.curious`, `.vcn-btn:hover{}`, `.name-card-skip:hover`.

## 4. Symboly pro rozbalování a schované menu (owner: *„co ještě dalšího … aby to mohl uživatel jednoduše poznat?“*)
| Co | Symbol | Proč |
|---|---|---|
| rozbalí obsah na místě | **„+“ → otočí se na „×“** (ownerův vzor u „0 rune readings remaining“) | jeden význam = jeden znak; otočení ukazuje, že se dá zavřít týmž místem |
| otevře okno / jinou obrazovku | **„→“** | „jdu jinam“; dnes nahodile |
| rozbalovací nabídka (jméno nahoře) | **„▾“, otočí se o 180°** | zavedený význam „vyber z nabídky“; jen tady |
| boční menu | **tři čárky (dnes)** | zůstává |
| víc možností u položky (do budoucna) | **„⋯“** | jen kdyby přibylo; dnes nikde |
Zamítám do appky: šipky ‹ › (čtou se jako listování), runy jako ovládací znaky (runa je obsah, §5).

## 5. Okno „Walk with Rúnar“ (bod 5) — co dalšího nesedí (prohlížeč, telefon IS)
1. Kámen „þú ert hér“ **nesvítí** — `.kamen-uctu.zivy` nese jen pohyb symbolu; u Gesta (prázdný kámen) tím chybí jakékoli označení na kameni. Schválená ukázka měla zlatý obrys + teplou výplň + jemnou záři. → doplnit.
2. Helper „?“ přes okno (výš, §3).
3. „Ókeypis“ × „Skráning er ókeypis.“ — jednou s tečkou, jednou bez; sjednotit (bez tečky, je to štítek).
4. Okno na telefonu roluje uvnitř (999 / 770 px) — v pořádku, ale s Rúnakortem jako třetí kartou poroste; karty Rúnakortu dát pod přepínač, ne pod cestu.
5. Rúnakort jako třetí karta: přepínač **MÁNAÐARLEGA · ÁRLEGA · RÚNAKORT** (název z `vl('card')`), u Leitandi odkaz „Rúnakort →“ přepne na kartu (šipka = jinam, §4). Balíčky z `CARD_PACKS`.
6. Stopy mezi kameny: místo čárkované linky střídavě levá/pravá stopa, mírně nesouměrné, menší směrem dolů (perspektiva cesty jako stezka B), zlatá .4; bez pohybu.
7. IS texty (ověřeno, §2): nadpis **„GAKKTU MEÐ RÚNARI“** (rozkaz jako „Gakktu inn í heim Rúnars“ v okně přihlášení; „gakktu með“ 29×) · podtitul **„Með hverju skrefi færðu fleiri {casts_is}. Farðu eins langt og þú vilt og snúðu við þegar þér hentar.“** (Greynir OK; „með hverju skrefi“ 335×, „færðu fleiri“ 112×; {casts} z VOCAB — §10, EN „more rune readings“ taky z VOCAB).

## 6. Hlášení „nerozumím“ (bod 9) — čtení Norn 452a97c5 (IS, 2026-10-19 21:03)
Ke stejnému čtení patří f35d5943 (21:05, „Hljómar ekki rétt málfarslega“) a nejspíš i aa0a852e (23:01, „Ég skil ekki þessa
settningu“ — bez id; jiné čtení v té době nevzniklo) a db5e2b38 (00:02, malé písmo + celý text). Tester se pak v Asku dvakrát ptal,
co čtení znamená — druhá odpověď vysvětluje právě „án þess að þú knýir á“. Greynir: všech 7 vět OK (idiomy nevidí, §2); korpus:
- „**skottið dillaði sér**“ 0× — česky „ocas se vrtěl sám“; správně „**dillaði skottinu**“ (19×, „dilla skottinu“ 49×).
- „**allur afturhlutinn tók undir**“ — „taka undir“ = přidat se ke zpěvu / ozvat se (slovník: „taka undir sönginn“, „það tekur undir í fjöllunum“); o těle je to kalk z EN „the whole rear joined in“.
- „**þegar haglið lægir**“ 0× — „lægja“ se říká o větru a počasí („veðrið lægir“ 17×), ne o krupobití.
- Závěr „**Í lífi þínu gæti þetta verið kunnugleg nánd sem breytist í hlé, eða hlé sem gefur henni nýtt rými.**“ — abstraktní, spojení 0×;
  tohle je nejspíš „nerozumím“. Současně tvrzení o životě (místo (a) v BACKLOGu).
- Myšlenka ✦ „Hvað gæti komið í ljós hjá þér án þess að þú knýir á?“ — tvar správný („knýja á“ 3 280×), ale abstraktní; tester se na ni ptal.
Zdroj je výstup modelu, ne řetězec v kódu → opravit se dá jen promptem (IS závěr Norn a myšlenka ✦ chtějí obraz, ne pojmy) nebo
korekcí, až se tvar zopakuje (`runar_corrections`, vrstva 3 §2: „skottið dillaði sér“ → „dillaði skottinu“). Písmo (db5e2b38) → bod 4.
