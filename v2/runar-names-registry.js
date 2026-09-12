// MANNANAFNASKRÁ — schválená islandská jména, 5141 položek.
//
// GENEROVANÉ — needituj ručně. Zdroj: island.is GraphQL `getAllIcelandicNames`
// (Mannanafnaskrá, Þjóðskrá Íslands). Stáhnout znovu: node scripts/import_mannanafnaskra.js
// Stav k 2026-09-12: 5859 záznamů v rejstříku, 690 nepřevzato
// (zamítnutá `Haf` + neviditelná — o zamítnutém jménu netvrdíme, že je islandské).
//
// ⚠️ NESE JEN JMÉNA. Žádnou etymologii, žádný původ — `norse: true/false` se z tohohle
// odvodit NEDÁ a kdo to zkusí, domýšlí si (§23). Původ vlastní kurátorovaný `runar-names.js`.
// K čemu to tedy je: rozhodne „je to vůbec islandské jméno?", takže u jména mimo kurátorovaný
// seznam umí Rúnar říct pravdu („znám ho, kořeny jsem nedohledal") místo „kořeny nevidím".
//
// Uloženo jako JEDEN řetězec oddělený mezerou (37 kB proti 47 kB v poli, 15 kB po gzipu);
// na Set se převádí až při první otázce, ne při načtení stránky.
const IS_NAME_REGISTRY = 
  'aage aagot aaliyah aaron abel abela abigael abraham ada adam adda addi addú addý adel adela adele adelía adil ' +
  'adolf adolfína adolph adrian adriana adrían adríana adríanna adríel adíel adólf aelía agata agatha agl agla ' +
  'agnar agnea agnes agneta agney agni agok agða ahelia ai aisha akarn akira aksel alan alanta alaía alba albert ' +
  'alberta albjört albína alda aldan aldar aldey aldný aldur aldís alejandro alena aleta aletta alex alexa ' +
  'alexander alexandra alexandría alexia alexis alexstrasa alexía alexíus alf alfa alfons alfred alfreð alfífa ' +
  'ali alica alice alida alisa alla allan alli allý alma almar alpa alparós alpha alrekur alrún althea alva alvar ' +
  'alvilda alvin alía alíana alída alífa alína alís alísa alíta amadea amal amalía amanda amaníta amara amarie ' +
  'amelia amelía amil amilía amir amira amon amor amos amy amía amína amír amíra amý ana analía anastasía anders ' +
  'andra andrea andrean andreas andrei andres andri andrá andré andrés andríana anes anetta anfinn angantýr ' +
  'angela angelía angelíka angelína angi anika anita anja ann anna annabella annalísa annamaría annar annarr ' +
  'annarósa annas anne annel annelí annes annetta anney annika annmar annía anný annþór anor anteo anthony anton ' +
  'antonio antonía antoníus antónio antóníus anya anída aníka anína aníta anóra apel apollo apríl ara arabella ' +
  'araminta aran araþon ardís arent ares arey ari arianna arilíus arin arinbjörg arinbjörn aris arisa arja arkíta ' +
  'arló arman armand armandó armenía arna arnald arnaldur arnar arnarr arnberg arnbergur arnbjörg arnbjörn ' +
  'arnborg arndís arndór arne arnes arney arnfinna arnfinnur arnfjörð arnfreyr arnfríður arngarður arngeir ' +
  'arngerður arngils arngrímur arngunnur arnheiður arnhildur arnika arnkatla arnkell arnlaug arnlaugur arnleif ' +
  'arnleifur arnljót arnljótur arnlín arnmundur arnmóður arnoddur arnold arnrós arnrún arnsteinn arntinna arntýr ' +
  'arnviður arnór arnóra arnúlfur arnþrúður arnþór arnþóra aron arslan art artemis arthur arthúr artúr aría arían ' +
  'aríana aríanna aríaðna aríel aríela aríella arín arína arís aríus aró arún asael askalín askja askur aspar ' +
  'assa aster astrid astró asía asírí atalía atena athen athena atla atlanta atlas atli aurora austan austar ' +
  'austdal austfjörð austin austmann austmar austri auðberg auðbergur auðbert auðbjörg auðbjörn auðbjört auðdís ' +
  'auðgeir auðkell auðlín auðmundur auðna auðný auðrún auðun auðunn auður auðólfur ava avelin aveline avelín avía ' +
  'axel axelma axelía ayah aðalberg aðalbergur aðalbert aðalbjörg aðalbjörn aðalbjört aðalborg aðalborgar aðaldal ' +
  'aðaldís aðaley aðalfríður aðalgeir aðalheiður aðalmundur aðalráður aðalrós aðalsteina aðalsteinn aðalsteinunn ' +
  'aðalsól aðalveig aðalvíkingur aðdal aðólf aþanasíus aþena baddi baggi baggio bakkdal bakkmann bald baldey ' +
  'baldrún baldur baldvin baldvina baldwin baldína baltasar baltazar bambi bambus barbara barbára barri barði ' +
  'baróns bassi bassí bastían baugur baui beata bebba begga beggi beinir beinteinn beitir bekan belinda bella ben ' +
  'bendt benedikt benedikta bengta benidikt benidikta benjamin benjamín benna benney benni benný benoný bent ' +
  'benta bentey bentley bentína benvý benía beníta benóní benóný bera berent berg bergdís bergey bergfinnur ' +
  'bergfríður bergheiður berghildur bergholt berghreinn bergjón bergland berglaug berglind bergljót berglín ' +
  'bergmann bergmannía bergmar bergmundur bergný bergrán bergrín bergrós bergrún bergset bergsteinn bergsveina ' +
  'bergsveinn bergur bergveig bergvin bergúlfur bergþór bergþóra berit bernadette bernhard bernharð bernharður ' +
  'berni bernódus bernódía bersi berta bertel bertha berti bertmarí bertram bessa bessi bessí best bestla beta ' +
  'betanía beth betsý bettý betúel bil bill binna birgir birgit birgitta birkir birmir birna birningur birnir ' +
  'birta birtingur birtir birtna bix bjarg bjargar bjargdís bjargey bjargheiður bjarghildur bjarglind bjargmundur ' +
  'bjargþór bjarkan bjarkar bjarkey bjarki bjarklind bjarma bjarmar bjarmi bjarnar bjarndal bjarndís bjarney ' +
  'bjarnfinnur bjarnfjörð bjarnfreður bjarnfríður bjarngerður bjarnharður bjarnheiður bjarnhildur bjarnhéðinn ' +
  'bjarni bjarnlaug bjarnlaugur bjarnleifur bjarnrún bjarnsteinn bjarnveig bjarnólfur bjarný bjarnþrúður bjarnþór ' +
  'bjarnþóra bjart bjartdís bjartey bjartmann bjartmar bjartmey bjartur bjartþór bjólan bjólfur björg björgey ' +
  'björgheiður björghildur björgmundur björgvin björgólfur björgúlfur björk björn björney björnfríður björnólfur ' +
  'björnúlfur björt blake bliki blom bláey bláfeld bláklukka blár blædís blængur blær blævar blín blíða blíður ' +
  'blóm blómey blómkvist bobba boga bogdís bogey bogga boghildur bogi bolli bond borg borgar borgdal borgdís ' +
  'borghild borghildur borgný borgrún borgúlfur borgþór borgþóra botnía boði braga braghildur bragi branddís ' +
  'brandr brandur brandís breki brekkmann bresi brestir brettingur brian briet brigitta brim brimar brimdís ' +
  'brimey brimhildur brimi brimir brimrún brimþór brit britt britta brjánn broddi broteva bruno bryn bryndís ' +
  'brynfríður bryngeir bryngerður brynheiður brynhildur brynja brynjar brynjarr brynjólfur brynjúlfur brynleifur ' +
  'brynmar brynný brynsteinn bryntýr brynylfa brynþór brá brák bría bríana bríanna bríet brími brímir brúnsteð ' +
  'bubbi buck buffý burkney burkni bylgja bylur bábó bára bári bárðdal bárður bæring bæringur bæron bæssam bíbí ' +
  'bíi bíldsfells bína bísan bóas bóel bói bót bóthildur bótólfur börkur böðvar búi búri búálfur cameron camilla ' +
  'caritas carl carla carlo carmen casandra cathinca cecil cecilia cecilía celin celina cesar charles charlie ' +
  'charlotta charlotte chloé chris chrissie christa christel christian christina christine christopher clara ' +
  'cleopatra cristiano cyrus cæsar cýrus dagbjartur dagbjörg dagbjört dagfari dagfinnur dagfríður daggeir daggrós ' +
  'dagheiður dagmann dagmar dagmey dagný dagnýr dagrún dagur dagþór dal dalbert daldís daley dalhoff dalla ' +
  'dalland dalli dallilja dalmann dalmar dalrós dalrún dalur dalvin dalí dalía damjan damon damíen dan dana ' +
  'danelíus daney danfríður danheiður danhildur dania daniel danival dante danía daníel daníela daníella daníval ' +
  'dara darri daría daríus davíð dawn daðey daði daðína debora debóra deda degen deimos delía demus dendý dengsi ' +
  'dennis denný deníel dexter didda diddi diego dilja diljan diljar diljá dilla dillý dimma dimmblá dimmey dissý ' +
  'dittó diðrik doddi dofri dolli dolma dominik donna doris dorothea dorri drangey drauma draumey draumland ' +
  'draumur draupnir drea dreki drengur droplaug drífa drómi drótt dröfn dufgus dufþakur dugfús dunya dvalinn ' +
  'dylan dyljá dynja dynþór dáð dæja día díana díanna díbus dídí díma dímon dímítrí díon dís dísa dísella ' +
  'díómedes dóa dómald dómaldi dómaldur dómhildur dónald dónaldur dór dóra dórey dóri dóris dórothea dórótea ' +
  'dóróthe dóróthea dóróþea dósóþeus dögg döggvi dögun dúa dúfa dúi dúna dúni dúnn dúnna dúrra dýrborg dýrfinna ' +
  'dýri dýrlaug dýrleif dýrley dýrmundur dýrunn ebba ebbi ebeneser ebenezer eberg ebonney edda eddi edel eden ' +
  'edgar edil edilon edit edith edor edvard edvin edward edílon efemía efraím egedía eggert eggrún eggþór egill ' +
  'egilína egla eia eik eikar eileif eileiþía eilíf eilífur einar einara einbjörg eindís einey einfríður ' +
  'einhildur einir einrún einsa einvarður einína einþór eir eirdís eirfinna eirný eiríka eiríksína eiríkur eirún ' +
  'eiva eivin eivör eiðar eiðný eiðunn eiður ekkó ektavon elba elberg elbert eldar eldberg eldbjartur eldbjörg ' +
  'eldborg elddís eldey eldgrímur eldhamar eldjárn eldlilja eldmar eldmey eldon eldrós eldrún eldur eldór eldþóra ' +
  'elea eleana eleina elektra elena elenborg elenora elentínus elenóra eleonora elfa elfar elfráður elfríð elfur ' +
  'elias elidon elika elimar elina elinborg elinór elinóra elio elis elisabeth elise elizabet elizabeth elja ' +
  'eljar elka ella ellen ellert elley elli elling elliott ellisif elliði elly ellín ellíot ellís ellý elma elmar ' +
  'elna elri elsa elsabet elsie elsí elsý elva elvan elvar elvi elvin elvira elvis elvíra elvý elí elía elían ' +
  'elíana elíanna elías elíeser elímar elín elína elínbergur elínbet elínbjörg elínbjört elínborg elíndís ' +
  'elíngunn elíngunnur elínheiður elínmundur elínora elínrós elíná elínór elínóra elíott elírós elís elísa ' +
  'elísabet elísabeth elísberg elíza elízabet eló emanuel emanúel emanúela embla embrek emely emelí emelía ' +
  'emelíana emelína emelý emerald emeralda emerentíana emhild emi emil emill emilí emilía emilíana emilíanna ' +
  'emilý emir emma emmanúel emmi emmý emír emý enea eneka engilbert engilbjartur engilbjört engiljón engill ' +
  'engilráð engilrós engla enika enja enok enora enya eníta enóla eragon erasmus eres eric erica erik erika erin ' +
  'erla erlar erlen erlendur erlinda erling erlingur erlín ermenga ermenrekur erna ernest ernestó ernir ernst ' +
  'eron eros erpur erykah esekíel esi esja esjar eskfjörð eskja esmeralda espólín esra estefan estel ester esther ' +
  'estiva estíva esí ethel etna eufemía eugenía eva evald evan evelyn evelía evert evey evfemía evgenía evin ' +
  'evlalía evían evíta ey eyberg eybjörg eybjört eyborg eydís eydór eyfríður eygerður eygló eyhildur eyhlíð eyja ' +
  'eyjalín eyjar eyjólfur eykam eylaugur eyleif eyleifur eylín eymar eymir eymundur eyrarrós eyrfeld eyríkur ' +
  'eyrós eyrún eysteinn eyva eyvar eyveig eyvindur eyvík eyvör eyð eyþrúður eyþór eyþóra ezra eðna eðvald eðvar ' +
  'eðvarð fabrisíus falgeir falk falur fannar fannberg fanndís fanney fanngeir fannlaug fanny fanný fannþór ' +
  'febrún felix fema fengur fenix fenrir ferdinand ferdínand fertram feykir filip filippa filippus filippía ' +
  'filipía finn finna finnbjörg finnbjörk finnbjörn finnboga finnbogi finnborg finndal finndís finney finnfríður ' +
  'finngeir finni finnjón finnlaug finnlaugur finnrós finnur finnvarður fjalar fjalarr fjalldís fjalley fjallmann ' +
  'fjara fjarki fjóla fjólar fjólmundur fjölnir fjölvar fjörnir fjörður flati flemming flosi flóki flóra flórent ' +
  'flóres flóvent fold folda forni foss fossberg fossmar foster fox francis frank franka franklin franklín frans ' +
  'fransiska franz franzisca franziska frederik fregn frey freya freybjörn freydal freydís freygarður freygerður ' +
  'freyja freyjó freylaug freyleif freymann freymar freymundur freymóður freyr freysi freysteinn freyviður ' +
  'freyþór frida friedrich frigg fritz friðberg friðbergur friðbert friðbjörg friðbjörn friðbjört friðborg ' +
  'friðdís friðdóra friðey friðfinna friðfinnur friðgeir friðgerður friðhólm friðjón friðjóna friðlaug friðlaugur ' +
  'friðleif friðleifur friðlín friðmann friðmar friðmey friðmundur friðný friðrik friðrika friðrikka friðríkur ' +
  'friðrós friðrún friðsemd friðsteinn friður friðveig friðvin friðálv friðþjófur friðþór friðþóra frost ' +
  'frostberg frosti frostrós frostúlfur frán fránn frár frímann fríða fríðhólm fríðsteinn fríður fróði fróðmar ' +
  'fróðný funi fura fylkir fáfnir fálki fædon fævý fía fídes fífa fífill fíus fíóna fólki föld fönn fúsi gabriel ' +
  'gabriela gabríel gabríela gabríella gabríerla gaddi gael gaja galdur galti gamalíel gandri ganna garbó ' +
  'garibaldi garpur garri garðar gaston gaui gauja gaukur gauthildur gauti gautrekur gautur gautviður gefjun gefn ' +
  'geimar geir geira geirarður geirbjörg geirdís geirfinna geirfinnur geirfríður geirharður geirhildur ' +
  'geirhjörtur geirhvatur geiri geirlaug geirlaugur geirleifur geirlöð geirmundur geirný geirríður geirröður ' +
  'geirrún geirtryggur geirvaldur geirólfur geirþjófur geirþrúður geisli gellir georg george georgía gerald geri ' +
  'gerða gerðar gerður gestar gestheiður gestný gestrún gestur gilbert giljan gill gilla gillý gilmar gils ' +
  'gilsfjörð gilslaug gissunn gissur gizur gjaflaug gjóska gjöll gjúki gletting gleymmérei gloría glytta gló glóa ' +
  'glóbjört glódís glóey glói glóð glúmur gnarr gneisti gnurr gná gnádís gnúpur gnýr gola gosi gottlieb gottskálk ' +
  'gottsveinn goðdal goði goðmundur grani grankell gratíana gregor grein greipur grendal greppur gret greta ' +
  'gretar grethe grettir grindvík grjótgarð grjótgarður grélöð grét gréta grétar gríma grímar grímey grímheiður ' +
  'grímhildur grímkell grímlaugur grímnir grímur grímólfur grímúlfur gró gróa grótta guja gull gulla gullbrá ' +
  'gulli gullveig gullý gumi gumma gunna gunnar gunnberg gunnbjörg gunnbjörn gunnbjört gunnborg gunndís gunndór ' +
  'gunndóra gunnella gunnfinna gunnfríður gunngeir gunnhallur gunnharða gunnheiður gunnhildur gunni gunnjóna ' +
  'gunnlaug gunnlaugur gunnleif gunnleifur gunnlöð gunnröður gunnrún gunnsteinn gunnur gunnvaldur gunnveig ' +
  'gunnvör gunnólfur gunnóli gunný gunnþór gunnþóra gunnþórunn gurrý gustav gutti guttormur guðberg guðbergur ' +
  'guðbjarni guðbjartur guðbjörg guðbjörn guðbjört guðborg guðbrandur guðdís guðfinna guðfinnur guðfreður ' +
  'guðfríður guðgeir guðjón guðjóna guðlaug guðlaugur guðleif guðleifur guðleikur guðlín guðmann guðmar guðmey ' +
  'guðmon guðmunda guðmundur guðmundína guðna guðni guðný guðráður guðríður guðröður guðrún guðsteina guðsteinn ' +
  'guðvarður guðveig guðveigur guðvin guðþór gylfi gyrðir gytta gyða gyðja gyðríður gáki gára gæfa gæflaug gía ' +
  'gídeon gígja gígjar gígur gígí gísela gísella gísla gísley gísli gíslný gíslrún gíslunn gíslína gíta góa gógó ' +
  'gói góði gúa gúníta gúrí gústaf gústav gýgjar gýmir hadda haddi haddur haddý hafalda hafberg hafbjörg hafborg ' +
  'hafdís hafey haffjörð haffý hafgnýr hafgrímur hafliða hafliði haflína hafnar hafnes hafnfjörð hafni hafný ' +
  'hafrós hafrún hafsjór hafsteina hafsteinn hafsól haftýr hafþór hafþóra hagalín hagbarður hagbert hagg haki ' +
  'hakim halla hallbera hallberg hallbjörg hallbjörn hallborg halldís halldór halldóra halley hallfreður ' +
  'hallfríður hallgarður hallgeir hallgerður hallgils hallgrímur hallgunnur halli hallkatla hallkell hallmann ' +
  'hallmar hallmundur hallný hallrún hallsteinn hallur hallvarður hallveig hallvör hallþór hamar hamína hanna ' +
  'hannah hannes hanney hannibal hanný hans hansa hansína har harald haraldur harley harne haron harpa harri ' +
  'harry harrý hartmann hartvig haukrún hauksteinn haukur haukvaldur hauður heba hebba hector hedda hedí heida ' +
  'heidi heikir heilmóður heimdal heimir heimsberg heinrekur heisi heiða heiðar heiðarr heiðberg heiðbert ' +
  'heiðbjartur heiðbjörg heiðbjörk heiðbjört heiðbrá heiðdís heiðlaug heiðlindur heiðlóa heiðmann heiðmar ' +
  'heiðmundur heiðný heiðrekur heiðrós heiðrún heiðsteinn heiður heiðveig hekla hektor helen helena helga helgey ' +
  'helgfell helgi heli hella helma helmút hemmert hendrik hendrikka hendrix henning henný henrietta henrik ' +
  'henrika henry henríetta henrý hera herberg herbert herbjörg herbjörn herbjört herborg herdís herfinnur ' +
  'herfríður hergeir hergerður hergill hergils herjólfur herkúles herlaug herlaugur herleifur herluf hermann ' +
  'hermundur hermína hermóður herner hersilía hersir hersteinn hersveinn herta hertha hervar hervarður hervin ' +
  'hervör heró herþrúður heydal hilaríus hilbert hild hilda hildar hildegard hildiberg hildibergur hildibjörg ' +
  'hildibrandur hildigeir hildigerður hildiglúmur hildigunnur hildimar hildimundur hildingur hildir hildiríður ' +
  'hildisif hildiþór hildur hildís hilja hilma hilmar hilmir himbrimi himinbjörg himinljómi himri hind hinrik ' +
  'hinrika hinrikka hjallkár hjalmar hjalta hjaltalín hjaltdal hjaltey hjalti hjarnar hjálmar hjálmdís hjálmey ' +
  'hjálmfríður hjálmgeir hjálmgerður hjálmrós hjálmrún hjálmtýr hjálmur hjálmveig hjálmþór hjördís hjörfríður ' +
  'hjörleif hjörleifur hjörný hjörtfríður hjörtur hjörtþór hjörvar hlaðgerður hleiðar hleiður hlini hljómur ' +
  'hlynur hlédís hlégestur hlér hlíf hlífar hlín hlíðar hlíðbekk hlíðberg hlíðkvist hlökk hlöðmundur hlöður ' +
  'hlöðvarður hlöðver hlýja hnappdal hnefill hnikar hnikarr hnífsdal hofdís hofland hofteig holgeir holger holti ' +
  'hornfjörð hrafn hrafna hrafnan hrafnar hrafnbergur hrafnbjört hrafnborg hrafndal hrafndís hrafnea hrafney ' +
  'hrafnfjörð hrafnfífa hrafngerður hrafnheiður hrafnhetta hrafnhildur hrafnkatla hrafnkell hrafnlaug hrafnrós ' +
  'hrafnrún hrafnsunna hrafntinna hrafntýr hrafnynja hrafnþór hrannar hrappur hraunar hraunberg hraundís hrefna ' +
  'hreggviður hreimur hreinberg hreindal hreindís hreinn hreiðar hreiðmar hringur hrollaugur hrolleifur hrund ' +
  'hrymur hrærekur hrím hrímir hrímnir hróaldur hróar hróbjartur hrói hrólfdís hrólfur hrómundur hróðgeir hróðmar ' +
  'hróðný hróðvar hróðólfur hröfn hrönn hrútfjörð hrútur hugberg hugbjörg hugbjört hugborg hugdís hugi huginn ' +
  'hugleikur hugljúf hugo hugríkur hugrós hugrún hugó huld hulda huldar huldrún huldís hunter huxley hvammdal ' +
  'hvannar hvítfeld hvönn hyltir hylur hymir hyrrokkin hákon hákonía háleygur hálfdan hálfdán hámundur hárekur ' +
  'hárlaugur háski hásteinn hávar hávarr hávarður hædý hængur hænir héðinn híram híramía hóffý hófí hólm hólmar ' +
  'hólmberg hólmbert hólmbjörg hólmdís hólmfastur hólmfríður hólmgeir hólmgrímur hólmkell hólmsteinn hólmþór ' +
  'hóseas hödd höfðdal högna högni hörgdal hörn hörðdal hörður höskuldur höður húbert húgó húmi húna húnbjörg ' +
  'húnbogi húndís húngerður húni húnn húnröður húrinn ian ida idda illugi illíes ilmur ilse ilías ilíes imba imma ' +
  'immanúel immý ina inda india indiana indika indra indriði indí indía indíana indíra inga ingaló inganna ' +
  'ingberg ingdís ingeborg inger ingey ingheiður inghildur ingi ingiberg ingibergur ingibert ingibjartur ' +
  'ingibjörg ingibjörn ingibjört ingiborg ingifinna ingifríður ingigerður ingilaug ingileif ingileifur ingilín ' +
  'ingimagn ingimar ingimaría ingimunda ingimundur ingiríður ingirós ingirún ingisól ingivaldur ingiveig ingiþór ' +
  'ingjaldur ingmar ingrid ingrún ingunn ingvaldur ingvar ingveldur ingvi ingólfur ingþór inna inuk irena irene ' +
  'irja irma irmelín irmý irpa isabel isabella isadora isak isidora ismael issa issi ivan ivar ivy ivý iða iðja ' +
  'iðunn jack jad jafet jagger jakey jaki jakob jakobína jakop james jamil jan jana jane janetta janey jannika ' +
  'janus jara jarfi jarl jarla jarpi jarún jarþrúður jasmin jasmine jasmín jason jasper javí jean jeanne jenetta ' +
  'jenna jenni jenny jenný jens jensína jeremías jes jesper jessý jim jimmi jochum johan john jones jonna jonni ' +
  'jonný josefina joseph josephine joshua josé jovina joð judith julia julian járnbrá járngerður járngrímur ' +
  'játgeir játmundur játvarður jóa jóakim jóann jóanna jóda jódís jóel jóey jófríður jóga jóhann jóhanna ' +
  'jóhanndína jóhannes jói jólín jómar jómundur jón jóna jónanna jónar jónas jónasína jónatan jónbjarni jónbjörg ' +
  'jónbjörn jónbjört jónborg jóndís jóndór jóndóra jóney jónfríður jóngeir jóngerð jónheiður jónhildur jóninna ' +
  'jónmundur jónný jónsi jónsteinn jóní jónía jónída jónína jóný jónþór jóra jórlaug jórunn jórvík jóríður ' +
  'jósafat jósavin jósebína jósef jósefín jósefína jósep jósi jósmundur jósteinn jósúa jóvin jökla jöklar jökli ' +
  'jökull jökulrós jörfi jörgen jörgína jörmundur jörri jörundur jörvaldi jörvar jörvi jötunn júdea júdit júl ' +
  'júlí júlía júlían júlíana júlíanna júlíetta júlíhuld júlína júlírós júlíus júní júnía júníana júníus júrek kai ' +
  'kaia kaija kaj kaja kakali kaktus kala kaldakvísl kaldbak kalddal kaldi kaleb kaleo kali kalix kalla kalli ' +
  'kalman kalmann kalmar kalmara kamal kamilla kamilus kamma kamí kaos kapitola kappi kaprasíus kapítóla kara ' +
  'karabaldi kareem karel karen karim karin karitas karkur karl karla karles karli karlinna karlotta karlynja ' +
  'karlína karma karmen karna karol karolína karvel karí karín karína karítas karó karólín karólína karún kaspar ' +
  'kasper kaspían kassandra kastíel kat kata katarína katarínus kateri katerína katharina kathinka katinka katla ' +
  'katra katrín katrína kató katý kaya kaía kaín kaðlín kelddal keli kellý kendra kenny kenya keran ketilbjörg ' +
  'ketilbjörn ketilfríður ketill ketilríður kiddi kiddý kikka kilja kiljan kilían kim kinan kira kirsten kirstín ' +
  'kittý kjalar kjallakur kjalvör kjaran kjarrval kjartan kjarval kjárr kjói klaki klara klaría kleifar klemens ' +
  'klementína klemenz klettur kleópatra kling kládía klængur klöpp knaran knarran knörr knútur koggi kolbeinn ' +
  'kolbjörg kolbjörn kolbrá kolbrún koldís kolfinna kolfinnur kolfreyja kolgríma kolgrímur kolka kolmar ' +
  'kolskeggur kolur kolviður kolþerna kona konkordía konn konni konný konráð konstantín konstantína konstantínus ' +
  'korka kormlöð kormákur kornelía kornelíus korri kort koðrán kraki kreml kris kriss krista kristall kristan ' +
  'kristberg kristbergur kristbjörg kristbjörn kristborg kristdór kristel kristens kristensa krister kristey ' +
  'kristfinnur kristfríður kristgeir kristgerður kristian kristin kristine kristinn kristinna kristjana kristján ' +
  'kristjón kristjóna kristlaug kristlaugur kristleifur kristlind kristlín kristmann kristmar kristmey ' +
  'kristmundur kristný kristofer kristrós kristrún kristvaldur kristvarður kristveig kristvin kristvina kristíana ' +
  'kristíanna kristín kristína kristó kristóbert kristófer kristólín kristólína kristý kristþór kristþóra ' +
  'krossdal krossá krumma krummi kráka krákur kría kubbur kuggi kusi kvasir kveldúlfur kvika kvikan kvist ká kár ' +
  'kára kári kárí kæja kía kíra kíran kóbra kókó kópur kórekur laia laila laki lalía lalíla lambert lambi lana ' +
  'lara lars lauf laufar laufey laufheiður laufhildur laufkvist laufland lauga laugdal laugey laugheiður laugi ' +
  'lauritz laxfoss laíla lea leif leifur leiknir leikný leila lein leiðólfur lella lena lennon leo leon leona ' +
  'leonard leonardo leonardó leonel leonhard leonóra lerkir leví levý lexí leya leyla leynd leó leóna leónardó ' +
  'leónóra leópold liam liisa lilith lilja liljan liljar liljurós liljá lill lilla lilley lillian lilly lillín ' +
  'lillý lillýana lily lilý lind linda lindar lindberg linddal linddís lindey lindi lingný link linnea lisbeth ' +
  'lissie list listalín listó litríkur liv ljóney ljóni ljónshjarta ljós ljósbera ljósbjörg ljósbrá ljósunn ' +
  'ljósynja ljósálfur ljótunn ljótur ljúfur lofn lofthildur loftur loftveig logar logey logi logn lokbrá loki ' +
  'lotta louisa louise lousie love lovísa loðmfjörð loðmundur luca lucas lucia lucy lucía ludvig luka lukka luna ' +
  'lundi lydia lydía lynd lyngar lyngberg lyngheiður lyngþór láki lán lár lára lárensína lárent lárentína ' +
  'lárentíus lárenz lárenzína láretta lárey lárus læla lér líam líana líba líf lífdís lílú lílý lín lína línberg ' +
  'línbjörg líndís líneik líney línhildur líni líonel lísa lísabet lísandra lísbet lísebet líus lív líó lóa lói ' +
  'lóla lóley lóni lóreley lórens lórenz lótus lúcía lúgó lúis lúkas lúna lúsinda lúsía lúter lúther lúvísa lúísa ' +
  'lúðvíg lúðvík lúðvíka lýdía lýra lýtingur lýðgerður lýður maddý magda magdal magdalena magg magga maggey maggi ' +
  'maggý magna magndís magnea magnes magney magnfríður magngeir magnheiður magnhildur magni magnína magnólía ' +
  'magnús magnúsína magný magnþór magnþóra magðalena maia maj maja makan malcolm malen malena malika malin malla ' +
  'malía malín malína manasína manda manfred manfreð manley mannsi manuel manuela manúel manúela manúella mar ' +
  'mara marbjörn marcus mardís marel marela marella maren marey marfríður margaret margeir margit margot margret ' +
  'margrjet margrét margrímur margunnur marheiður mari maria mariam marianne marie marijón marikó marinella ' +
  'marino marinó marion mariska marit marja marjón mark markrún markó markús markþór marla marlaug marlena marley ' +
  'marlon marlín marlís marló maron marri mars marsa marsellíus marselía marselín marselína marsibil marsilía ' +
  'marsý marta marteinn martel marten martha marthen martin martína marvin mary marzellíus marzibil marzilíus ' +
  'marí maría maríabet maríam marían maríana maríanna marías maríel maríella maríkó marín marína marínella marínó ' +
  'maríon marís marísa marísól marít maríuerla maríus marólína marý marþór mateo mateó matheo matheó mathilda ' +
  'mathías matilda matt matta mattea matteo matteó matthea mattheó matthilda matthildur matthía matthías matti ' +
  'mattíana mattías mattína mattý max maxima maximus may maya maí maía maídís maísól meda meinert mekkin mekkinó ' +
  'mekkín melinda melissa melkorka melkíor melkólmur melrakki melrós melía melódía menja mensalder merkel merkúr ' +
  'meryem messíana methúsalem metta metúsalem mey meyja meyvant michael michell miguel mikael mikaela mikaelína ' +
  'mikjáll mikkael mikkalína mikkel mikki mila milan milda mildinberg mildríður milla milli millý milo minerva ' +
  'minna minney minný mio mir miriam mirja mirjam mirra miró mist miðdal miðrik miðvík mjalldís mjallhvít ' +
  'mjaðveig mjófjörð mjöll mjöllnir mjölnir moli mollý mona monika moon mordal mordekaí morgan morgunsól moritz ' +
  'morri mortan morten mosi muggi muggur mummi munda mundheiður mundhildur mundína muni muninn mylla myrk myrkey ' +
  'myrkrún myrktýr myrkva myrkvar myrkvi myrkár myrra myríam mábil málfríður málhildur málmfríður mánadís mánarós ' +
  'máney máni már mára márey mári márus mæja mía mías míkah míla míló mímir mímósa mínerva mír míra míranda mírey ' +
  'míríel mítra míó móa móberg módís móeiður móey móheiður mói móna mónika móníka móra móri mórits móses móði ' +
  'mörk mörður múhameð múli múr mýr mýra mýrkjartan mýrmann mýrún nadia nadja nadía nala nana nancy nanna nanný ' +
  'nansý naní naomí nara naranja narfey narfi natalie natalí natalía natan natanael nataníel natasha natasja ' +
  'nathalia nathalía nathan nathanael nathaníel naómí neisti nella nellý nenna nenni neptúnus neró nesmann neó ' +
  'nicolai nicolas nicole nieljohníus niels nift nikanor nikk nikolai nikolaj nikolas nikoletta nikulás nikíta ' +
  'nikólína nils ninja ninna ninni niðbjörg njála njáll njóla njörður noah nonni nora norbert norma normann ' +
  'norðland norðmann norður nátt náttey náttfari nátthrafn náttmörður náttrós náttrún náttsól náttúlfur náttúra ' +
  'náð níeljohníus níels níls nína níní nísa nóa nóam nóel nói nóla nólan nóni nóra nóri nótt nóvember nökkvi ' +
  'númi núpdal núra núri nýbjörg nýdönsk nývarð obba octavia octavius odda oddbergur oddbjörg oddbjörn oddey ' +
  'oddfreyja oddfreyr oddfríður oddgeir oddgerður oddhildur oddi oddkell oddlaug oddleif oddleifur oddmar oddný ' +
  'oddrún oddsteinn oddur oddvar oddveig oddvör oddþór oktavía oktavías oktavíus októ októvía októvíus olaf olav ' +
  'olavi olavur olga olgeir oliver olivert olivia olivía olli ollý omar omel ora ordal orfeus orka ormar ' +
  'ormheiður ormhildur ormsvíkingur ormur orri orvar oríana othar otkatla otkell otri otta otti ottó otur palli ' +
  'palma pamela panpan paolo paradís parmes parís patrek patrekur patricia patrick patrik patrisía patti pedró ' +
  'per perla peta peter petra petrea petronella petrína petrónella petrós petrún petrúnella petter pia pjetur ' +
  'polly pollý pomóna pría príor pá pála páldís páley pálfríður pálhanna pálheiður pálhildur páll pálma pálmar ' +
  'pálmey pálmfríður pálmi pálrún pálín pálína pétrína pétrún pétur pía pírati quin rabbi rae rafael rafaela rafn ' +
  'rafnar rafney rafnhildur rafnkell raggý ragn ragna ragnar ragnbjörg ragney ragnfríður ragnheiður ragnhildur ' +
  'ragný ragúel rakel raknar ram ramses ramóna randalín randver randí randíður randý ranimosk ranka rannva ' +
  'rannveig rannver rasmus raven ray rayna rea rebekka refur regin reginbald reginbaldur reginbjörg reginn regn ' +
  'regína rei reidar reifnir reimar rein reinar reinhard reinhart reinhold reinholdt remek renata rex rey reykdal ' +
  'reykfell reykfjörð reykjalín reyla reymar reyn reynald reynar reynarð reyndís reynheiður reynhildur reynholt ' +
  'reynir reyr reyðfjörð richard rick rikard rikharð rikharður rikka rikki ripley rita river robert roj rokk rolf ' +
  'ronald ronja rorí rose rosemarie roxanna rudolf runi runný runólfur rut ruth rán ránar ráðgeir ráðhildur ' +
  'ráðvarður ríkarður ríkey ríkharð ríkharður ríma rín ríta ríó róbert róberta róbjörg rói rólant róm róma róman ' +
  'rómeó rós rósa rósalind rósalía rósamunda rósanna rósant rósar rósberg rósbjörg rósborg róselía rósenberg ' +
  'rósey rósfríður róshildur rósi rósinberg rósinkar rósinkara rósinkrans rósinkransa róska róslaug róslind ' +
  'róslinda róslín rósmann rósmar rósmary rósmarý rósmundur rósný rósý röfn röggi rögn rögnvald rögnvaldur ' +
  'rögnvar rökkur rökkurdís rökkva rökkvi röskva röskvi röðull rúa rúbar rúben rúbý rúdólf rún rúna rúnar rúndís ' +
  'rúnel rúnhildur rúni rúrik rúrí rúrý rútur saara sabrína sabína safír safíra saga sakarías sakura salberg ' +
  'salbjörg saldís salgerður salka salma salmann salmar salný salome salomína salts salvador salvadór salvar ' +
  'salvía salvör salín salína salóme salómon samir sammi sammy samson samíra samúel sandel sandhólm sandra sandri ' +
  'sandur sanna sanný santos santía sara sarah sarína sasha sasi saxi scarlet scott seba sebastian sebastían ' +
  'sefanía seifur seimur selena selina selja seljan selka selma senía septíma sera serena sesar seselía sesil ' +
  'sesilía sesselja sesselía sesselíus sessilía siddý sif sifjar sig sigarr sigbergur sigbert sigbjartur sigbjörn ' +
  'sigdís sigdór sigdóra sigfastur sigfinnur sigfreður sigfríð sigfríður sigfús sigga siggeir siggerður siggi ' +
  'sighvatur sigjón siglaugur sigmann sigmar sigmunda sigmundur signa signar signhildur signý sigri sigrid ' +
  'sigríkur sigríður sigrún sigsteinn sigtryggur sigtýr sigur sigurbaldur sigurberg sigurbergur sigurbirna ' +
  'sigurbjarni sigurbjartur sigurbjörg sigurbjörn sigurbjört sigurbogi sigurborg sigurbrandur sigurbára sigurdríf ' +
  'sigurdrífa sigurdís sigurdór sigurdóra sigurey sigurfinna sigurfinnur sigurfljóð sigurgeir sigurgeira ' +
  'sigurgestur sigurgrímur sigurgísli sigurhanna sigurhans sigurhelga sigurhildur sigurhjörtur sigurhólm ' +
  'sigurhörður sigurjón sigurjóna sigurkarl sigurlaug sigurlaugur sigurleif sigurleifur sigurlilja sigurlinn ' +
  'sigurlinni sigurliði sigurlogi sigurlás sigurlín sigurlína sigurmann sigurmar sigurmon sigurmunda sigurmundur ' +
  'sigurmáni sigurnanna sigurnýas sigurnýjas siguroddur sigurpáll sigurrós sigursteina sigursteinn sigursveinn ' +
  'sigurunn sigurvaldi sigurveig sigurvin sigurvina sigurást sigurásta sigurða sigurður siguróli sigurósk ' +
  'sigurörn sigurþór sigurþóra sigvalda sigvaldi sigvard sigvarður sigyn sigþrúður sigþór sigþóra silfa silfra ' +
  'silfrún silfur silfurregn silfá silja silka silla silli silva silvana silvía sindri sirra sirrey sirrí sirrý ' +
  'sirí sisa sissa siv sivía sjafnar sjana sjöfn skaftfeld skafti skagalín skapti skarpheiður skarphéðinn skaði ' +
  'skefill skeggi skellir skipstað skjaldmey skjöld skjöldur skorri skröggur skrýmir skugga skuggi skuld sky ' +
  'skylar skær skæringur skírnir skíðdal skíði skógur skúa skúla skúli skúlína skúmur skúta smiður smyrill smári ' +
  'smíta snekkja snjáfríður snjáka snjófríður snjókaldur snjóki snjólaug snjólaugur snjólfur snjór snorra snorri ' +
  'snæ snæberg snæbjartur snæbjörg snæbjörk snæbjörn snæbjört snæborg snæbrá snædahl snædís snæfellsjökuls ' +
  'snæfrost snæfríð snæfríður snæhólm snælaug snælaugur snær snæringur snærós snærún snæsól snævar snævarr snæþór ' +
  'snót soffanías soffía sofia sofie sofía solveig sonja sonny sonný sophanías sophia sophie sophus soren sotti ' +
  'spartakus sporði sprettur spói stanley stapi star stardal stari starkaður starr starri stasía stefan stefana ' +
  'stefanía stefnir stefán stefánný stein steina steinar steinarr steinbekk steinberg steinbergur steinbjörg ' +
  'steinbjörn steinbogi steinborg steindís steindór steindóra steiney steinfinnur steinfríður steingerður ' +
  'steingrímur steinhildur steinhólm steini steinkell steinlaug steinmann steinmar steinmóður steinn steinrós ' +
  'steinröður steinrún steinunn steinvarður steinvör steinólfur steinþór steinþóra stella steðji stinne stirni ' +
  'stirnir stjarna stjarney storm stormar stormey stormur straumberg straumur strympa sturla sturlaugur sturri ' +
  'styr styrbjörn styrgerður styrkur styrkár styrmir styrr stígheiður stígrún stígur stína stórólfur sumar ' +
  'sumarliði sumarlín sumarlína sumarrós sunna sunnefa sunneva sunney sunniva sunníva susan susie svafa svafar ' +
  'svala svali svalrún svalur svan svana svanberg svanbergur svanbjörg svanbjörn svanbjört svanborg svandís ' +
  'svaney svanfríður svangeir svanheiður svanhild svanhildur svanhvít svanhólm svani svanlaug svanlaugur ' +
  'svanmundur svanrós svanur svaný svanþrúður svanþór svarfdal svarthöfði svava svavar svea sveina sveinar ' +
  'sveinberg sveinbjartur sveinbjörg sveinbjörn sveinborg sveindís sveiney sveinfríður sveingerður sveinhildur ' +
  'sveinjón sveinlaug sveinlaugur sveinmar sveinn sveinrós sveinrún sveinsína sveinungi sveinveig sveinþór svend ' +
  'sverre sverrir sverð sváfnir svæk svölnir svörfuður sylgja sylva sylvia sylvía systa sál sæ sæberg sæbergur ' +
  'sæbjartur sæbjörg sæbjörn sæbjört sæborg sæbrá sædal sædís sædóra sæfinna sæfríður sæhildur sæi sæla sælaug ' +
  'sælaugur sæm sæmann sæmar sæmey sæmi sæmunda sæmundur sæný sær særós særún sæsól sæunn sævald sævaldur sævar ' +
  'sævarr sævin sævör sæþór sía símon símona símonía sírnir sírus sísí síta sívar sófus sófía sófónías sófús ' +
  'sókrates sól sóla sólan sólar sólarr sólberg sólbergur sólbjartur sólbjörg sólbjörn sólbjört sólborg sólbrá ' +
  'sólbráð sólbrún sóldís sóldögg sóley sólfríður sólgerður sólheiður sólhildur sólhrafn sólimann sólkatla ' +
  'sóllilja sólmar sólmundur sólmyrkvi sólmáni sólný sólon sólrós sólrún sólskríkja sólsteinn sólveig sólver ' +
  'sólvin sólvör sólynja sólín sólúlfur sónata sölmundur sölva sölvar sölvey sölvi sölvína sören sörli súddi súla ' +
  'súlamít súsan súsanna sýrus tala talitha talía tamar tamara tandri tangi tanja tanya tanía tara tarfur taríel ' +
  'tarón tatiana tatjana tatía tea teitný teitur tekla telekía telma tenchi teodor tera teresa teresía tereza ' +
  'terra teó thalia thalía thea theadór theadóra thelma theo theodor theodór theodóra theresa theó theódór ' +
  'theódóra thiago thomas thor thorberg thorsteinn thór tildra tindar tindra tindri tindur tinna tinni tirsa ' +
  'tjaldur tjörfi tjörvi tobbi tobías todda toddi todor toggi tolli tonni toný torben torbjörg torfey torfheiður ' +
  'torfhildur torfi trausta trausti tristan tristana trostan tryggva tryggvi tryggvína trú trúmann tumas tumi ' +
  'tyrfingur tía tíalilja tíberíus tíbor tíbrá tími tímon tímoteus tímóteus tína tístran tóbías tóbý tófa tói ' +
  'tóka tóki tómas tóní tór tóta tóti tótla týr týra týri ubbi uggi ugla ugluspegill ullr ullur ulrich una undína ' +
  'uni unn unna unnar unnbjörg unnbjörn unndís unndór unnsteinn unnur unnþór ursula urðar urður uxi vagn vagna ' +
  'vagnbjörg vagnfríður vaka vakur val vala valagils valberg valbergur valbjörg valbjörk valbjörn valbjört ' +
  'valborg valbrandur vald valdemar valdheiður valdi valdimar valdís valdór valent valentín valentína valentínus ' +
  'valerí valería valey valfríður valgarð valgarður valgeir valgerða valgerður valgý valhildur valjón valka ' +
  'valkyrja vallaður vallý valmar valmundur valný valrós valrún valsteinn valter valtýr valur valva valves valía ' +
  'valíant valý valþrúður valþór vana vanadís vanda vanja varmar varmdal varmi varða varði vatnar vatneyr ' +
  'vatnsfjörð vattar vattarnes vattnes vava vega veig veiga veigar veigur venedía venný venus ver vera vermundur ' +
  'vernharð vernharður veronica veronika veróna verónika veróníka vest vestar vestmar vestur vetle vetrarrós ' +
  'vetrarsól vetur veturliði vex vibeka victor victoria victoría vigdís vigfús viggó viglín vignir vigný vigri ' +
  'vigtýr vigur vikar viktor viktoria viktoría vilberg vilbergur vilbert vilbjörn vilbogi vilborg vilbrandur ' +
  'vildís vilfreð vilfríður vilgeir vilgerður vilhelm vilhelmína vilhjálmur vili viljar vilji villa villi villiam ' +
  'villiblóm villiljós villimey vilma vilmar vilmundur vilný vin vinbjörg vincent vindar vinjar vinný vinsý viola ' +
  'virgil virgill virginía vitja vivian viðar viðey viðfjörð viðja viðjar von voney vopna vopnfjörð vopni vordís ' +
  'vorm vorsól váli ván vápni vár værð vébjörg vébjörn védís végeir végerður vékell vélaug vélaugur vémundur véný ' +
  'vésteinn víbekka vídalín víf vífill vígberg vígdögg víggunnur víglundur vígmar vígmundur vígsteinn vígþór ' +
  'víking víkingur vísa víðar víðir víóla víóletta vöggur vök völundur vörður vöttur výrin walter werner wilhelm ' +
  'willard william willum willy winter xavier xenia yggdrasil ylfa ylfingur ylfur ylja ylur ylva ymir ymur ynda ' +
  'yndís yngling yngvar yngveldur yngvi ynja yrja yrkill yrkir yrkja yrsa zachary zakaría zakarías zar zion zoe ' +
  'zophanías zophonías zophía zulima zíta zóphanías zóphonías ágúst ágústa ágústína áki álfa álfar álfdís álfey ' +
  'álfgeir álfgerður álfgrímur álfheiður álfhildur álfkell álfrós álfrún álfsól álfur álfþór ámundi ár ára ' +
  'árbjartur árbjörg árbjörn árbjört árdís árelía árelíus árey árgeir árgils árheim ári árland árlaug ármann ' +
  'ármey ármúla árna árndís árney árnheiður árni árnína árný árnþór ársæl ársæll ársól árveig árvök áróra árún ' +
  'árþóra ás ása ásar ásberg ásbergur ásbjörg ásbjörn ásborg ásbrandur ásdís ásdór ásfríður ásgautur ásgeir ' +
  'ásgerður ásgils ásgrímur áshildur ási áskatla áskell ásla áslaug áslaugur ásleif áslákur ásmar ásmundur ásný ' +
  'ásrós ásröður ásrún áss ást ásta ástbjörg ástbjörn ástbjört ástborg ástdís ástey ástfríður ástgeir ástgerður ' +
  'ástheiður ásthildur ástmar ástmarý ástmundur ástráður ástríkur ástríður ástrós ástrún ástvald ástvaldur ástvar ' +
  'ástveig ástvin ástý ástþrúður ástþór ástþóra ásvaldur ásvarður ásvör ásynja ásólfur ásþór ægileif ægir æja æsa ' +
  'æsgerður æsir ævar ævarr ævi æví ævör éljagrímur ían ída íena ígor íkarus ílena íma ími ína ínes ír íren írena ' +
  'íris írunn ísabel ísabella ísadóra ísafold ísak ísalind ísar ísarr ísbjörg ísbjörn ísbjört ísbrá ísdís ísdögg ' +
  'íseldur íselín ísey ísfjörð ísfold ísgeir ísgerður íshildur íshólm ísidór ísidóra ísis ísjak íslaug ísleif ' +
  'ísleifur íslilja ísmael ísmar ísmey ísobel ísold ísrael ísrún íssól ísveig ísvöld ísól ísólfur ítalía íunn íva ' +
  'ívalú ívan ívar íviðja ívör óbi óda ófeigur ófelía ói óla ólaf ólafur ólafía ólafína ólavía óldal ólfjörð óli ' +
  'óliver ólivía ólína ólíver ólöf ómar ómi ónar ónarr óri óríon ósa ósk óskar ósklín ósland ósmann ósvald ' +
  'ósvaldur ósvífur ótta óttar óttarr óðinn óðný óður ögmunda ögmundur ögn ögri ölnir ölrún ölveig ölver ölvir ' +
  'öndólfur önfjörð önundur örbekk örbrún örk örlaugur örlygur örn örnólfur örri örvar ösp össur öxar öxdal öxi ' +
  'öxndal özur úa úddi úlfa úlfar úlfberg úlfdal úlfdís úlfey úlfgeir úlfgrímur úlfheiður úlfhildur úlfhéðinn ' +
  'úlfkell úlfljótur úlfrún úlfstað úlftýr úlfur úlla úlrik úna úndína úranus úranía úrsúla úrsúley ýda ýja ýlfa ' +
  'ýma ýmir ýr ýrar ýri ýrr ýrún þalía þangbrandur þeba þengill þeyr þeódís þeódór þeódóra þingey þinur þiðrandi ' +
  'þiðrik þjálfi þjóstar þjóstólfur þjóðann þjóðar þjóðbjörg þjóðbjörn þjóðgeir þjóðhildur þjóðleifur þjóðmar ' +
  'þjóðrekur þjóðvarður þjóðólfur þoka þollý þor þorberg þorbergur þorbirna þorbjörg þorbjörn þorbrandur þorbrá ' +
  'þorfinna þorfinnur þorgarður þorgautur þorgeir þorgerður þorgestur þorgils þorgnýr þorgríma þorgrímur þorgísl ' +
  'þorkatla þorkell þorlaug þorlaugur þorleif þorleifur þorleikur þorlákur þormar þormundur þormóður þorri ' +
  'þorskfjörð þorsteina þorsteinn þorstína þorvaldur þorvar þorvarður þrastar þruma þrymir þrymur þrá þráinn ' +
  'þrándur þróttur þröstur þrúða þrúðmar þrúður þula þura þurí þuríður þurý þyra þyri þyrill þyrnir þyrnirós þyrí ' +
  'þór þóra þóranna þórar þórarinn þórarna þórberg þórbergur þórbjarni þórbjörg þórbjörn þórdís þórelfa þórelfur ' +
  'þórey þórfríður þórgnýr þórgrímur þórgunna þórgunnur þórhaddur þórhalla þórhalli þórhallur þórhanna þórhannes ' +
  'þórheiður þórhildur þóri þórinn þórir þórkatla þórlaug þórlaugur þórleif þórleifur þórlindur þórmar þórmundur ' +
  'þórný þórodda þóroddur þórormur þórsteina þórsteinn þórsteinunn þórstína þórunn þórunnbjörg þórunnborg þórveig ' +
  'þórvör þórína þórða þórður þórólfur þórörn þöll þúfa';
