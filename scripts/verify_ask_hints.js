// §19 seed-and-assert: nápověda v Ask musí odpovídat TOMU čtení, které je na obrazovce.
//
// 2026-09-10 (KUKY: „text nápovědy pro ASK není dobrý. slepě opisuješ a neřešíš, že to
// potřebuje úpravy."). První verze `_askHints()` vypsala konstantní pole `ask_placeholders`.
// Konstanta nabízí i to, co pro dané čtení NEPLATÍ — „spojení mezi runami" u jediné runy,
// „jak to souvisí s tím, na co jsem se ptal" u čtení bez otázky, životní runu tomu, kdo
// žádnou nemá. Nic z toho nespadne: uživatel jen dostane otázku, na kterou Rúnar nemá
// z čeho odpovědět, a naučí se ptát hůř. Kontrola proto běží na VÝSLEDKU (co se vypíše
// pro daný stav), ne na tvaru kódu.
//
// Druhá věc, kterou hlídá: nedosazený `{placeholder}`. Klíč přejmenovaný v translations
// projde v JS tiše a v UI se objeví holé „{rune}" — přesně ta třída tiché chyby z §19.
//
//   node scripts/verify_ask_hints.js
const fs = require('fs');
const vm = require('vm');
const DIR = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';

const sandbox = {
  Math, JSON, Date, console,
  setTimeout: () => 0, clearTimeout: () => {}, setInterval: () => 0, clearInterval: () => {},
  document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] },
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
};
sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;

let code = 'var currentUser=null; var userTier="premium"; var sb=null; var activeChar=null;\n'
         + 'var corrections=[]; var voiceGenerated={}; var readerTexts={}; var isTester=false;\n';
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js',
                 'runar-character.js', 'runar-utils.js', 'runar-reading.js']) {
  code += '\n/* ' + f + ' */\n' + fs.readFileSync(DIR + f, 'utf8') + '\n;\n';
}
vm.createContext(sandbox);
try { vm.runInContext(code, sandbox, { filename: 'ask-hints.js' }); }
catch (e) { console.log('FAIL  nepodařilo se načíst reader: ' + e.message); process.exit(1); }

// `const RUNES` / `const UI_TEXT` NEJSOU vlastnosti globálu (na rozdíl od `var` a deklarací
// funkcí), takže se k nim přes `sandbox.X` nedostaneme — musí se vyhodnotit v kontextu.
const glob = (v) => vm.runInContext(v, sandbox);
const R = (n) => glob('RUNES').find(r => r.n === n);
let fail = 0;
const jmR = (r, L) => (sandbox.lang = L, glob('rnSplit')(r).name);
// ⚠️ Prompt se NESKLÁDÁ voláním `buildAskPrompt` s ručně poskládanými argumenty — to by
// testovalo BUILDER, ne ZAPOJENÍ. Přesně na tom 2026-09-11 selhal mutační test u pozic ve
// spreadu: odebrání argumentu z produkčního volání kontrolou proklouzlo. Od té doby má
// skládání jedno místo (`_askBuild`) a test jde tudy.
function promptZeStavu(L, opt) {
  const o = opt || {};
  sandbox.lang = L;
  sandbox.readerUser = {
    name: 'Anna', lifeRune: o.life || null, question: o.otazka || '',
    area: o.oblast || '', intention: o.zamer || '', seeking: o.hledani || '',
  };
  sandbox._lastDrawn = o.drawn || [];
  sandbox.readerRune = (o.drawn && o.drawn.length === 1) ? o.drawn[0] : null;
  sandbox._spreadMode = o.mode || 'single';
  return glob('_askBuild')('Cteni.', 'A co ted?', (o.drawn || []).map(r => r.n).join(', '));
}
const rekni = (ok, popis) => { if (ok) console.log('OK    ' + popis); else { fail++; console.log('FAIL  ' + popis); } };

// Stav se nastavuje PŘESNĚ tam, kam ho zapisuje produkce: `readerUser` (runar-reading.js:228)
// a `_lastDrawn` (plní se vedle `_lastSegs` po každém čtení). Fixture, který by si _askHints
// zavolal s vlastními argumenty, by tuhle vazbu neotestoval — a ta je tu ta křehká.
function hinty(L, drawn, life, otazka, oblast, zamer, hledani) {
  sandbox.lang = L;
  sandbox.readerUser = { name: 'Anna', lifeRune: life || null, question: otazka || '',
                         area: oblast || '', intention: zamer || '', seeking: hledani || '' };
  sandbox.readerRune = drawn.length === 1 ? drawn[0] : null;
  sandbox._lastDrawn = drawn;
  return glob('_askHints')();
}

for (const L of ['en', 'is']) {
  const jm = (r) => (sandbox.lang = L, glob('rnSplit')(r).name);

  // ── 1) single + životní runa, která tažená NEBYLA ────────────────────────────
  const a = hinty(L, [R('Jera')], R('Gebo'), '');
  rekni(a.length >= 4, L + '  single: nápověda má ' + a.length + ' tipů');
  rekni(a[0] && a[0].includes(jm(R('Gebo'))) && a[0].includes(jm(R('Jera'))),
        L + '  single: první tip nese OBĚ jména (životní + tažená) — ' + JSON.stringify(a[0] || ''));
  // ⚠️ `a.slice(1)` schválně: první tip je ten o životní runě a jméno tažené runy nese taky,
  // takže `a.some(...)` by tuhle podmínku splnil i tehdy, kdyby tip na význam runy úplně
  // zmizel. Odhalil to mutační test (konstantní seznam prošel zeleně).
  rekni(a.slice(1).some(x => x.includes(jm(R('Jera')))),
        L + '  single: vedle tipu na životní runu je i tip na význam tažené runy');

  // ── 2) životní runa BYLA tažena → nesmí se nabídnout ─────────────────────────
  // „Jak mě ovlivňuje moje životní runa Gebo" u čtení, kde Gebo padla, je otázka sama na
  // sebe. V promptu tentýž případ ošetřuje `_lifeWasDrawn`; tady musí zmizet i z nabídky.
  const b = hinty(L, [R('Gebo')], R('Gebo'), '');
  rekni(!b.some(x => x.includes(jm(R('Gebo'))) && /life|lífsrún/i.test(x)),
        L + '  životní runa byla tažena → tip na životní runu se nenabízí');

  // ── 3) bez životní runy (Visitor / bez data narození) ────────────────────────
  const c = hinty(L, [R('Jera')], null, '');
  rekni(!c.some(x => /life rune|lífsrúnin/i.test(x)),
        L + '  bez životní runy → žádný tip o životní runě');

  // ── 4) spread → „co znamenají spolu"; single tuhle otázku nemá ───────────────
  const d = hinty(L, [R('Jera'), R('Ansuz'), R('Mannaz')], R('Gebo'), '');
  const spolu = glob('UI_TEXT')[L].ask_h_runes;
  rekni(d.includes(spolu), L + '  spread: nabízí „' + spolu + '"');
  rekni(!c.includes(spolu), L + '  single: otázku na spojení run NENABÍZÍ (jedna runa)');
  rekni(!d.some(x => x.includes(jm(R('Ansuz')))),
        L + '  spread: nedosazuje jednu runu z několika');

  // ── 5) „jak to souvisí s tím, na co jsem se ptal" jen když se ptal ───────────
  const e = hinty(L, [R('Jera')], R('Gebo'), 'Should I take the job?');
  const naco = glob('UI_TEXT')[L].ask_h_asked;
  rekni(e.includes(naco), L + '  s otázkou: nabízí „' + naco + '"');
  rekni(!a.includes(naco), L + '  bez otázky: tuhle možnost nenabízí');

  // ── 6) žádný nedosazený placeholder a žádný duplikát ────────────────────────
  const vse = [].concat(a, b, c, d, e);
  const zbyle = vse.filter(x => /\{[a-z_]+\}/.test(x));
  rekni(!zbyle.length, L + '  žádný nedosazený {placeholder}' + (zbyle.length ? ' — ' + zbyle[0] : ''));
  const dup = e.filter((x, i) => e.indexOf(x) !== i);
  rekni(!dup.length, L + '  žádný tip dvakrát' + (dup.length ? ' — ' + dup[0] : ''));
  rekni(vse.every(x => typeof x === 'string' && x.trim().length > 8),
        L + '  každý tip je neprázdná věta');
}

// ── 7) OBLAST a ZÁMĚR: přebírají stávající řádek, NEPŘIDAJÍ nový ──────────────
// Bez těchhle případů by nové větve `_askHints` byly TICHÁ ZELENÁ (§19.2): kontrola by
// proběhla, ale ani jednou by je nespustila. Hlídá se především to, co je tu křehké — že
// seznam NEROSTE. Osm vět pod tlačítkem už není nápověda, ale zeď.
for (const L of ['en', 'is']) {
  const T = glob('UI_TEXT')[L];
  const OBL = glob('AREAS')[L][2];            // Career & Creativity / Starf & Sköpun
  const ZAM = glob('INTENTIONS')[L];
  const bez = hinty(L, [R('Jera')], R('Gebo'), '');

  // oblast: řádek o obrazu ji pojmenuje, holý řádek o obrazu zmizí
  const so = hinty(L, [R('Jera')], R('Gebo'), '', OBL, '');
  rekni(so.some(x => x.includes(OBL)), L + '  oblast zvolena → tip nese její název (' + OBL + ')');
  rekni(!so.includes(T.ask_h_image), L + '  oblast zvolena → holý tip na obraz už tam není');
  rekni(bez.includes(T.ask_h_image), L + '  oblast nezvolena → holý tip na obraz zůstává');
  rekni(so.length === bez.length, L + '  oblast NEPŘIDALA řádek (' + bez.length + ' → ' + so.length + ')');

  // záměr: každá ze tří hodnot má vlastní větu a přebírá časový řádek
  const ocek = [T.ask_h_when_now, T.ask_h_when_ahead, T.ask_h_when_past];
  for (let i = 0; i < 3; i++) {
    const sz = hinty(L, [R('Jera')], R('Gebo'), '', '', ZAM[i]);
    rekni(sz.includes(ocek[i]), L + '  záměr „' + ZAM[i] + '" → „' + ocek[i] + '"');
    rekni(!sz.includes(T.ask_h_now), L + '  záměr „' + ZAM[i] + '" → obecné „proč teď" zmizelo');
    rekni(sz.length === bez.length, L + '  záměr „' + ZAM[i] + '" NEPŘIDAL řádek');
  }
  rekni(bez.includes(T.ask_h_now), L + '  záměr nezvolen → obecné „proč teď" zůstává');

  // pilulka vybraná v druhém jazyce musí dát TÙŽ větu — index, ne shoda řetězce
  const druhy = L === 'en' ? 'is' : 'en';
  const sc = hinty(L, [R('Jera')], R('Gebo'), '', '', glob('INTENTIONS')[druhy][1]);
  rekni(sc.includes(T.ask_h_when_ahead),
        L + '  záměr uložený ve druhém jazyce se přesto trefí do správné věty');

  // neznámá hodnota nesmí shodit ani vyrobit prázdný tip
  const sx = hinty(L, [R('Jera')], R('Gebo'), '', '', 'naprosto neznamy zamer');
  rekni(sx.includes(T.ask_h_now) && sx.length === bez.length,
        L + '  neznámý záměr → spadne zpátky na obecné „proč teď"');

  // strop: i když je vybráno ÚPLNĚ VŠECHNO, seznam musí zůstat do šesti
  const max = hinty(L, [R('Jera'), R('Ansuz'), R('Mannaz')], R('Gebo'), 'Should I take it?', OBL, ZAM[1]);
  rekni(max.length <= 6, L + '  všechno vybráno → seznam má ' + max.length + ' tipů (strop 6)');
  rekni(!max.some(x => /\{[a-z_]+\}/.test(x)), L + '  všechno vybráno → žádný nedosazený {placeholder}');
  rekni(max.filter((x, i) => max.indexOf(x) !== i).length === 0, L + '  všechno vybráno → žádný tip dvakrát');
}

// ── 8) INVARIANT: co nápověda NABÍZÍ, musí mít v promptu PODKLAD ─────────────
// Tip je otázka. Když Rúnar nemá z čeho odpovědět, **domyslí si to** (§23) — a uživatel
// nepozná, že dostal vymyšlenou odpověď na vlastní otázku. Tahle díra žila **dvakrát**:
//   · životní runa — `buildAskPrompt` ji nedostával (opraveno 2026-09-10)
//   · původní otázka — `ask_h_asked` nabízel „jak to souvisí s tím, na co jsem se ptal",
//     ale do promptu šla jen NOVÁ doplňující otázka (nalezeno 2026-09-11)
// Pokaždé to byla táž chyba a pokaždé ji nenašel test. Proto se od teď páruje NABÍDKA
// s PROMPTEM postaveným ze **stejného stavu**, přes `_askCast()` — tedy přes tutéž funkci,
// kterou volá produkční `askRunar()`. Opsaný sběr faktů by nebyl otestovaná hranice (§19.1).
for (const L of ['en', 'is']) {
  const T = glob('UI_TEXT')[L];
  const OBL = glob('AREAS')[L][2], ZAM = glob('INTENTIONS')[L][1];
  const OTAZKA = L === 'is' ? 'Á ég að skipta um starf?' : 'Should I leave the job I have?';
  const tipy = hinty(L, [R('Jera')], R('Gebo'), OTAZKA, OBL, ZAM);
  const prompt = promptZeStavu(L, { drawn: [R('Jera')], life: R('Gebo'),
    otazka: OTAZKA, oblast: OBL, zamer: ZAM });
  const ma = (x) => prompt.indexOf(x) !== -1;

  for (const tip of tipy) {
    if (tip === T.ask_h_asked)
      rekni(ma(OTAZKA), L + '  tip na původní otázku → otázka JE v promptu');
    else if (tip.indexOf(OBL) === 0)
      rekni(ma(OBL), L + '  tip na oblast → oblast JE v promptu');
    else if ([T.ask_h_when_now, T.ask_h_when_ahead, T.ask_h_when_past].indexOf(tip) !== -1)
      rekni(ma(ZAM), L + '  tip na záměr → záměr JE v promptu');
    else if (tip.indexOf(jmR('Gebo', L)) !== -1 && /life rune|lífsrúnin/i.test(tip))
      rekni(ma(jmR('Gebo', L)), L + '  tip na životní runu → runa JE v promptu');
  }

  // Obráceně: co člověk NEVYBRAL, nesmí být v promptu — jinak Rúnar mluví o cizim zadání.
  const prazdny = promptZeStavu(L, { drawn: [R('Jera')] });
  rekni(prazdny.indexOf('CAST FOR') === -1 && prazdny.indexOf('FYRIR HVAÐ') === -1,
        L + '  nic nevybráno → blok o zadání v promptu vůbec není');

  // SEEKING: od 2026-09-11 tip MÁ — a přebírá řádek „co nevidím".
  // KUKY po měření: „v ASK se může člověk zeptat úplně na cokoliv. To znamená, že Rúnar
  // s tím musí umět pracovat, a tím, že zakážeme funkci kterou sami nabízíme, to
  // nezajistíme!" Můj původní důvod pro vynechání (zrcadlení) v měření neobstál — 0/27
  // ve všech čtyřech podmínkách (RUNAR_EVAL_LOG.md 2026-09-11 (2)).
  const HL = glob('SEEKS')[L];
  const ocekHl = ['', T.ask_h_seek_clarity, T.ask_h_seek_confirm,
                  T.ask_h_seek_challenge, T.ask_h_seek_reflect];
  const bezH = hinty(L, [R('Jera')], R('Gebo'), '', '', '');
  for (let i = 1; i < HL.length; i++) {
    const sH = hinty(L, [R('Jera')], R('Gebo'), '', '', '', HL[i]);
    rekni(sH.includes(ocekHl[i]), L + '  hledání „' + HL[i] + '" → „' + ocekHl[i] + '"');
    rekni(!sH.includes(T.ask_h_unseen), L + '  hledání „' + HL[i] + '" → „co nevidím" zmizelo');
    rekni(sH.length === bezH.length, L + '  hledání „' + HL[i] + '" NEPŘIDALO řádek');
  }
  // „Almenn leiðsögn / General Guidance" tip VĚDOMĚ nedostává: neříká nic konkrétního,
  // takže by dobrou otázku vytlačila horší. Stejný vzor jako u neznámé hodnoty.
  const obecne = hinty(L, [R('Jera')], R('Gebo'), '', '', '', HL[0]);
  rekni(obecne.includes(T.ask_h_unseen), L + '  hledání „' + HL[0] + '" → „co nevidím" zůstává');
  const hlX = hinty(L, [R('Jera')], R('Gebo'), '', '', '', 'naprosto neznama hodnota');
  rekni(hlX.includes(T.ask_h_unseen) && hlX.length === bezH.length,
        L + '  neznámé hledání → spadne zpátky na „co nevidím"');
  // Uložené ve druhém jazyce se musí trefit taky — index, ne shoda řetězce.
  const hlD = hinty(L, [R('Jera')], R('Gebo'), '', '', '', glob('SEEKS')[L === 'en' ? 'is' : 'en'][2]);
  rekni(hlD.includes(T.ask_h_seek_confirm),
        L + '  hledání uložené ve druhém jazyce se přesto trefí do správné věty');

  // Neznámý štítek oblasti (v DB řádku stává `area: 'spread'`) nesmí vyrobit tip.
  const sp = hinty(L, [R('Jera')], R('Gebo'), '', 'spread', '');
  rekni(sp.includes(T.ask_h_image) && !sp.some(x => x.indexOf('spread') === 0),
        L + '  neznámý štítek oblasti → tip na oblast nevznikne');

  // Štítek smi stát JEN jako nadpis před pomlčkou. `tp()` umí dosazení, ne shodu v čísle
  // ani pád — 6 z 8 islandských názvů jsou souřadné fráze a tři mají jiný akuzativ
  // (Tilgang · Fjölskyldu · Innri Vöxt). Kdo to jednou dosadí do věty, rozbije šest z osmi.
  glob('AREAS')[L].forEach((popisek) => {
    const h = hinty(L, [R('Jera')], R('Gebo'), '', popisek, '');
    const s = h.filter(x => x.indexOf(popisek) !== -1);
    rekni(s.length === 1 && s[0].indexOf(popisek + ' — ') === 0,
          L + '  „' + popisek + '" stojí jako nadpis před pomlčkou (nominativ)');
  });
}

// ── 9) PRINCIP: co člověk vyplní, to Rúnar v Ask MUSÍ znát ──────────────────
// KUKY 2026-09-11: „všechno co člověk může vyplnit jako dotaz by měl Rúnar vědět, že
// uživatel vyplnil, a být schopný na to odpovědět. To myslím dává naprostou logiku."
// Předtím: „v ASK se může člověk zeptat úplně na cokoliv. To znamená, že Rúnar s tím musí
// umět pracovat, a tím, že zakážeme funkci kterou sami nabízíme, to nezajistíme!"
//
// Tohle je ten princip jako KONTROLA, ne jako paměť. Dvakrát se stalo, že pole zůstalo
// viset (životní runa · původní otázka) a pokaždé to našel až člověk. Test proto bere
// VŠECHNY klíče `readerUser` po vyplněném formuláři a žádá, aby každý z nich buď dorazil
// do Ask promptu, nebo stál ve výjimkách S DŮVODEM (§28). Přibude-li do formuláře nové
// pole, tahle kontrola zčervená dřív, než si toho někdo nevšimne.
const VYJIMKY = {
  name: 'Jméno nese text čtení a `_addressContext`; není to téma otázky, ale oslovení.',
  d: 'Není to vyplněné pole — v `readerUser` je vždy null; datum narození žije jinde a ústí do lifeRune.',
  m: 'Měsíc narození — stejně jako `d` není vyplněné pole formuláře a do Ask nepatří.',
  y: 'Rok narození — stejně jako `d` není vyplněné pole formuláře a do Ask nepatří.',
  lifeRune: 'Dochází do Ask VLASTNÍM parametrem `life`, ne přes `_askCast` — ověřeno v sekci 8.',
  lifeLensOn: 'Vědomě mimo Ask: přepínač řídí, co Rúnar řekne SÁM OD SEBE ve čtení, nikdy to, '
    + 'nač se smí člověk zeptat (rozhodnutí 2026-09-10).',
};

for (const L of ['en', 'is']) {
  const T = glob('UI_TEXT')[L];
  const A = glob('AREAS')[L], I = glob('INTENTIONS')[L], SK = glob('SEEKS')[L];
  const OT = L === 'is' ? 'Á ég að skipta um starf?' : 'Should I leave the job I have?';
  // Seed přes produkční cestu: tytéž klíče, jaké nastavuje `startReading`.
  const prompt = promptZeStavu(L, { drawn: [R('Jera')], life: R('Gebo'),
    otazka: OT, oblast: A[2], zamer: I[1], hledani: SK[2] });
  const cast = glob('_askCast')();

  // (a) Každý klíč formuláře je buď v `_askCast`, nebo má zapsanou výjimku.
  const klice = Object.keys(glob('readerUser'));
  const nezapojene = klice.filter(k => !(k in cast) && !(k in VYJIMKY));
  rekni(!nezapojene.length,
        L + '  každé pole formuláře je v Ask, nebo má zapsanou výjimku'
        + (nezapojene.length ? ' — CHYBÍ: ' + nezapojene.join(', ') : ''));

  // (b) Co `_askCast` sbírá a je vyplněné, musí být v promptu K NALEZENÍ.
  //     Sbírat hodnotu a zahodit ji cestou je přesně ta tichá chyba, co tu byla dvakrát.
  Object.keys(cast).forEach((k) => {
    if (!cast[k]) return;
    rekni(prompt.indexOf(String(cast[k])) !== -1,
          L + '  `' + k + '` doputovalo do Ask promptu');
  });

  // (c) Výjimka bez důvodu je zakázaná (§28) — holý klíč by umlčel červenou.
  Object.keys(VYJIMKY).forEach((k) => {
    rekni(typeof VYJIMKY[k] === 'string' && VYJIMKY[k].length > 30,
          L + '  výjimka `' + k + '` nese důvod');
  });
}

// ── 10) POZICE VE SPREADU se musí dostat do Ask promptu ─────────────────────
// HANDOFF57 bod 4: `askRunar` předával runy jako plochý seznam, takže Rúnar u Kříže nevěděl,
// která byla ve Středu a která Za zády — přestože ty pozice člověk na obrazovce VIDÍ.
// §13: platí pro VŠECH PĚT typů čtení, proto se testují všechny, ne jen jeden spread.
// Štítky se čtou z RP_* packů; test je také čte odtud, takže přejmenování pozice
// v packu nerozhodí tenhle test — rozhodí ho jen to, když se do promptu NEDOSTANE.
const SPREADY = [
  { mode: 'kriz', pack: 'RP_KRIZ', n: 5 },
  { mode: 'norns', pack: 'RP_NORNS', n: 3 },
  { mode: 'horseshoe', pack: 'RP_HORSESHOE', n: 7 },
  { mode: 'yggdrasil', pack: 'RP_YGGDRASIL', n: 9 },
];
const RUNY9 = ['Fehu', 'Uruz', 'Thurisaz', 'Ansuz', 'Raidho', 'Kenaz', 'Gebo', 'Wunjo', 'Hagalaz'];

for (const L of ['en', 'is']) {
  // single nesmí vyrobit blok — prázdná hlavička by byl jen šum
  const jednaP = promptZeStavu(L, { drawn: [R('Jera')], mode: 'single' });
  rekni(!/POSITIONS IN THIS READING|STÖÐURNAR Í LESTRINUM/.test(jednaP),
        L + '  single → blok o pozicích v promptu NENÍ');

  for (const sp of SPREADY) {
    const runy = RUNY9.slice(0, sp.n);
    const p = promptZeStavu(L, { drawn: runy.map(R), mode: sp.mode });
    const S = glob(sp.pack)[L] || glob(sp.pack).en;
    const stitky = S.positions || S.labels;
    rekni(!!stitky && stitky.length === sp.n,
          L + '  ' + sp.mode + ': pack má ' + (stitky ? stitky.length : 0) + ' štítků (čekáno ' + sp.n + ')');
    // KAŽDÁ pozice i KAŽDÁ runa musí být v promptu — jinak se některá cestou ztratí
    let chybi = 0;
    stitky.forEach((st) => { if (p.indexOf(String(st).replace(/\s*:\s*$/, '')) === -1) chybi++; });
    rekni(!chybi, L + '  ' + sp.mode + ': všech ' + sp.n + ' štítků pozic je v promptu');
    rekni(runy.every(r => p.indexOf(r) !== -1),
          L + '  ' + sp.mode + ': všech ' + sp.n + ' jmen run je v promptu');
    rekni(p.indexOf(':: ') === -1, L + '  ' + sp.mode + ': žádná dvojitá dvojtečka ve výpisu');
  }

  // obranné větve: neznámý typ a spread bez run nesmí vyrobit prázdnou hlavičku
  ['naprosto-neznamy', ''].forEach((m, i) => {
    const p = promptZeStavu(L, { mode: m, drawn: i === 0 ? [R('Jera')] : [] });
    rekni(!/POSITIONS IN THIS READING|STÖÐURNAR Í LESTRINUM/.test(p),
          L + '  ' + (i === 0 ? 'neznámý typ čtení' : 'spread bez run') + ' → žádný prázdný blok');
  });
}

// ── 11) placeholder v poli čerpá z TÉHOŽ seznamu (§18 — jeden zdroj, dvě podoby) ──
// Kdyby se rozešly, v poli by problikávaly jiné věty, než jaké nabízí rozbalená nápověda.
sandbox.lang = 'en';
sandbox.readerUser = { name: 'Anna', lifeRune: R('Gebo'), question: '' };
sandbox.readerRune = R('Jera'); sandbox._lastDrawn = [R('Jera')]; sandbox._askPhIdx = 0;
const ph = glob('_askPlaceholder')();
rekni(glob('_askHints')().includes(ph), 'placeholder pole je jeden z tipů nápovědy — „' + ph + '"');

console.log(fail ? '\n' + fail + ' selhalo' : '\nOK  nápověda Ask odpovídá stavu čtení');
process.exit(fail ? 1 : 0);
