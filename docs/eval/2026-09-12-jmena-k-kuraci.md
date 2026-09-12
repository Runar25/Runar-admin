# Jména k dokurátorování — 289 běžných islandských jmen, která v seznamu nejsou

od: CODE-tune → Cowork-tune · 2026-09-12 · ZMĚNĚNO v kódu: zapojen rejstřík (viz níž)

## Proč tenhle seznam existuje

`v2/runar-names.js` je kurátorovaný seznam (etymologie · význam EN+IS · mýtus · přezdívky) a má
dnes **123 jmen**. Proti nejběžnějším islandským jménům (Coats 2019, `stcoats/Nordic-Name-Data` —
jména přiřazená rodu s ≥ 80 % jistotou podle nordických statistických úřadů) v něm
**289 ze 402 chybí, tedy 72 %**.

Než se to změřilo, dostávalo každé takové jméno větu *„Rúnar sees no Norse root in this name"* —
a to je u **Einara, Dagura, Bjarniho, Árniho, Gísliho** prostě nepravda. Kořeny mají; jen jsme je
nedohledali my.

**Co už je nasazené:** rejstřík Mannanafnaskrá (5 141 schválených jmen, island.is GraphQL)
rozhoduje otázku „je to vůbec islandské jméno?". Jméno z rejstříku proto dnes dostane pravdivou
větu *„Rúnar knows this name, but has not traced its roots."* /
*„Rúnar þekkir þetta nafn, en hefur ekki rakið rætur þess."* — místo lži.

⚠️ **Rejstřík NENESE etymologii** (ověřeno na datech: `description` má 308 z 5 859 záznamů a je to
2. pád nebo úřední poznámka). `norse: true/false` se z něj odvodit **nedá** a nikdo to nemá
zkoušet (§23). Původ vzniká výhradně kurací — tedy tímhle seznamem.

## Co dodat na každé jméno

Tvar řádku je stejný jako dnes v `runar-names.js`, nic nového se nezavádí:

```js
{ name: 'Sigrún', g: 'f', norse: true, root: "ON sigr + rún", en: 'victory-rune', is: 'sigur + rún',
  myth_en: 'A valkyrie in the Helgi lays', myth_is: 'Valkyrja í Helgakviðum', nick: [] },
```

U **neseverského** jména navíc `origin` + `origin_is` — druhý ve **2. pádě**, protože věta končí
vazbou *„það á rætur að rekja til …"* (ověřeno: rætur að rekja 7802 · að rekja til 18075). A `note`,
když je to případ „časté na Islandu, a přesto neseverské" (vzor: Magnús, Jón).

## Laťka kvality — ownerův příklad (2026-09-12)

Owner ukázal, na jaké úrovni to chce, slovy *„mi může říct klidně to, co teď napsal GPT"*:

> **Magnús** není původně severské jméno: pochází z latinského *magnus* — „veliký". Do Skandinávie
> a na Island se dostalo přes norského krále Magnuse I., pojmenovaného po Karlu Velikém
> (*Carolus Magnus*). Má tedy královský a historický náboj, ne runově-mytologickou stavbu.
>
> **Einar / Einarr** je staroseverské a rozebrat jde: nejčastěji se vykládá jako *ein* („jeden,
> osamělý") + *arr* („válečník", případně „bojovník s kopím"). Zhruba: „osamělý bojovník". Není to
> jméno boha, ale sedí do severského hrdinského světa — člověk, který stojí sám v boji.

**Co z toho plyne pro řádek v datech:** nestačí `root` a jednoslovný význam. Chce to i **cestu**,
po které jméno k Islandu přišlo (u neseverských) nebo **do jakého světa patří** (u severských) —
to je přesně ten materiál, ze kterého Rúnar může napsat rozbor, místo aby si ho domyslel.
U neseverského jména to nese `note`, u severského `myth_en` / `myth_is`.

⚠️ **Einar dnes v seznamu vůbec není** — je v tom seznamu 289 níž. Ten Magnús ano, a jeho řádek má
`root: "lat. magnus 'mikill'"` + `note`, ale tu cestu přes Magnúse I. neobsahuje. Takže tohle je
zároveň příklad **doplnění u jména, které už v seznamu je**.

## Pořadí

Zdroj je frekvenční, takže seznam je řazený od nejběžnějších — ber ho shora. **Není potřeba dodat
všech 289 najednou**; každé přidané jméno je samostatné zlepšení a kontrola ㉣ hlídá, že se seznam
nerozbije.

## Mužská jména (171)

Aðalsteinn · Agnar · Alexander · Andrés · Andri · Anton · Arnar · Arnór  
Aron · Atli · Axel · Ágúst · Árni · Ásmundur · Baldvin · Benedikt  
Bergur · Birgir · Birkir · Bjarki · Bjarni · Brynjar · Daði · Dagur  
Eggert · Einar · Elías · Elvar · Emil · Eyþór · Fannar · Finnur  
Friðrik · Garðar · Geir · Gísli · Grétar · Guðjón · Guðni · Gunnlaugur  
Gylfi · Hafsteinn · Hafþór · Hallgrímur · Hannes · Haukur · Hákon · Heiðar  
Heimir · Helgi · Hermann · Hilmar · Hjalti · Hjálmar · Hjörtur · Hlynur  
Hreinn · Hörður · Ingi · Ingólfur · Ingvar · Ísak · Jakob · Jens  
Jóhann · Jóhannes · Jónas · Júlíus · Kári · Kristinn · Lárus · Oddur  
Óli · Ómar · Óskar · Pálmi · Reynir · Róbert · Rúnar · Sigfús  
Sigurgeir · Sindri · Skúli · Smári · Snorri · Steingrímur · Svavar · Sveinbjörn  
Sverrir · Sævar · Trausti · Tryggvi · Valdimar · Valur · Viðar · Vignir  
Viktor · Þórarinn · Þórður · Þórhallur · Þórir · Þröstur · Geir · Gísli  
Grétar · Guðjón · Guðni · Gunnlaugur · Gylfi · Hafsteinn · Hafþór · Hallgrímur  
Hannes · Haukur · Hákon · Heiðar · Heimir · Helgi · Hermann · Hilmar  
Hjalti · Hjálmar · Hjörtur · Hlynur · Hreinn · Hörður · Ingi · Ingólfur  
Ingvar · Ísak · Jakob · Jens · Jóhann · Jóhannes · Jónas · Júlíus  
Kári · Kristinn · Lárus · Oddur · Óli · Ómar · Óskar · Pálmi  
Reynir · Róbert · Rúnar · Sigfús · Sigurgeir · Sindri · Skúli · Smári  
Snorri · Steingrímur · Svavar · Sveinbjörn · Sverrir · Sævar · Trausti · Tryggvi  
Valdimar · Valur · Viðar · Vignir · Viktor · Þórarinn · Þórður · Þórhallur  
Þórir · Þröstur · Örn

## Ženská jména (118)

Aðalbjörg · Agnes · Alda · Aldís · Alexandra · Andrea · Aníta · Arna  
Arndís · Auður · Ágústa · Ása · Áslaug · Bára · Berglind · Birgitta  
Birna · Birta · Björg · Björk · Bryndís · Brynja · Dagbjört · Dagný  
Dóra · Edda · Elín · Elísa · Elsa · Elva · Emilía · Erla  
Erna · Ester · Eva · Eydís · Eygló · Eyrún · Fanney · Fjóla  
Fríða · Gréta · Guðfinna · Guðmunda · Guðný · Guðríður · Gunnhildur · Gyða  
Hafdís · Halla · Hanna · Harpa · Heiða · Heiðrún · Helena · Helga  
Herdís · Hjördís · Hólmfríður · Hrefna · Hrönn · Hugrún · Hulda · Inga  
Ingibjörg · Ingunn · Íris · Jenný · Jóhanna · Jóna · Jónína · Júlía  
Karen · Katrín · Kristjana · Kristrún · Laufey · Lára · Lilja · Linda  
Lovísa · Magnea · Marta · Matthildur · Nanna · Oddný · Ólafía · Ólöf  
Ragna · Rakel · Rannveig · Rebekka · Rósa · Sandra · Sara · Selma  
Sesselja · Soffía · Sonja · Sóley · Sólrún · Stefanía · Sunna · Svala  
Svanhildur · Svava · Thelma · Tinna · Una · Valdís · Valgerður · Vigdís  
Vilborg · Þorbjörg · Þorgerður · Þórey · Þórhildur · Þuríður
