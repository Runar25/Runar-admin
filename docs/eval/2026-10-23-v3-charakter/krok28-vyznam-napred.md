# V3 lab, krok 28 — jiný pohled: význam vepředu, obraz ho nese (rozbor návrhu owner × GPT, před testem)

2026-10-28, CODE-read. Owner: „jelikož je hrozně těžké nechat model vytvářet čtení i na základě významu runy, napadl mě další přístup —
zaměřit se na to, co má výklad v člověku vyvolat … popsat význam tak, jak se má projevit … více variant významu a nechat to model zpracovat“ ·
„význam už nebude tak pasivní, ale půjde do popředí a obraz trochu do pozadí … některé obrazy byly silné ve významu, ale hodně jich bylo
ve významu slabých a z obrazu to nešlo úplně poznat.“ GPT navrhl losovat typ lidského napětí runy (u Gebo 10 směrů), ne hotové příběhy.
Úhly z kroku 27 se dořeší až po tomhle.

## Co z labu tenhle návrh podporuje
1. **Význam je dnes skoro pořád týž.** Ve všech 52 čteních kroků 23–27 nese jádro výslovně „dar váže / spojuje / provázek“ 34× (65 %);
   zbytek jsou varianty téhož („drží se navzájem“, „vyrovná hladinu“). Obraz se mění (los druhu), stránka runy ne — přesně to, co owner
   popisuje: obraz silný, význam slabý nebo stejný.
2. **Los směru funguje, los hotového obsahu ne** (kroky 9–10 los daru 7/7; krok 5 hotová věta významu opsaná 7/8). Losovat se má tedy
   směr napětí, ne věta — sedí s GPT i s ownerovým „popostrčit, ne servírovat“.
3. Ownerem schválené „fáze runy“ (krok 22) a hlášení k Nornám (bf44ef3d: Ansuz dostal ze seznamu klíčových slov význam, který k obrazu
   neseděl) míří na totéž: **význam vybírat vědomě, ne nechat model sáhnout po prvním**.

## Rizika (a co s nimi)
1. **Tvrzení o čtenáři.** Směry jsou psané jako lidské prožitky („čeká na oplátku“, „neumí přijímat“). Ve 2. osobě by se z nich stal
   výrok o čtenáři (krok 21: úhel „uvnitř“ 37/42). → směr nese scéna a postava; ke čtenáři jen otázka. Měřit v každém kroku.
2. **Věrnost runě (§23).** Směr musí stát v kánonu Gebo, ne v moderní psychologii. Ověřené zdroje (krok 5): Hávamál 145 „ey sér til gildis
   gjöf“ (dar vždy hledá oplátku) · 42 „gjalda gjöf við gjöf“ (oplatit dar darem) · 41 kdo dávají a oplácejí, jsou si přáteli nejdéle ·
   52 půl bochníku a nakloněný pohár stačily na druha · anglosaská runová báseň: štědrost je čest a pomoc tomu, kdo nic nemá.
   ⚠️ Hávamál 145 dál (podle mé paměti „betra er óbeðit en sé ofblótit“ — lépe nežádat, než přeobětovat) je **neověřeno**; ověřit před použitím.
3. **Opis směru.** Model text pokynu opisuje (krok 5) → směr krátce, vlastními slovy, a měřit ozvěnu.
4. **25 run × IS.** Směry se musí napsat pro každou runu a islandsky nativně; zdroj už existuje: ownerovy popisy run (`RUNAR_POPISY_RUN.md`:
   co runa dělá a nedělá, kdy se objevuje, druhá strana).
5. **Víc vstupů = méně tvořivosti** (owner). Když přibude los směru, typ a druh obrazu by mohly ubrat — změří se.

## Směry Gebo — ověření GPT seznamu proti kánonu
| směr (GPT) | v kánonu Gebo? |
|---|---|
| očekávání protislužby | ✔ Hávamál 145, 42 |
| pocit závazku z přijetí | ✔ odvozené z 145/42 (dar hledá oplátku) |
| vzájemnost bez účtů | ✔ Hávamál 41 |
| svobodné dávání / štědrost | ✔ anglosaská báseň (štědrost = čest, pomoc) |
| malý dar stačí (hodnota není v ceně) | ✔ Hávamál 52 (není v GPT seznamu, doplněno) |
| nerovnováha (jeden dává víc) | ~ odvozené; přeobětování jen s ověřeným 145 |
| neumět přijmout | ~ odvozené (druhá strana vzájemnosti) |
| důvěra · hranice · „chci být potřebný“ · ztráta kontroly nad darem | ✘ v kánonu Gebo nestojí — moderní psychologie; použít jen s ownerovým rozhodnutím |

## Návrh testu (krok 29)
Tytéž losy jako kroky 23–27, jen místo losu typu a druhu obrazu **los směru** (6 ověřených výše); obraz si model postaví sám, aby směr
nesl. Měřit: (a) **pozná slepý soudce ze čtení, který směr byl vylosován?** (obraz nese význam) · (b) kolik jader je pořád „dar váže“ ·
(c) tvrzení o čtenáři · (d) ozvěna slov směru · ownerovo čtení textů.
