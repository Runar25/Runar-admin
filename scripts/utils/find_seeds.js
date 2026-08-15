// ═══════════════════════════════════════════════════════
// RÚNAR · find_seeds.js — hledá ZÁRODKY: slova, která jsme do čtení zaseli promptem
//
// KUKY 2026-08-15: „je jasne ze vsechno ma nekde svuj zarodek. a my ho zaseli textem."
//
// PROČ existuje. „already" se hledalo ručně a trvalo to hodinu: vzít 226 čtení, uhodnout
// podezřelou páku, spočítat Fisherův test, ověřit kontrolou. Vyšlo z toho, že text volby
// `seeking=Confirmation` nesl slovo doslova (54 % proti 26 %, p = 0,0078). Ta cesta je
// mechanická — a proto patří do nástroje, ne do hlavy. S testery přibude čtení i pák
// a ručně to přestane jít.
//
// CO DĚLÁ. Pro každou páku (`area`, `seeking`, `intention`, `rune_name`, …) zjistí, KTERÁ
// SLOVA ta páka do promptu přidává, a změří, jestli se ta slova objevují ve čteních s tou
// pákou častěji než ve zbytku.
//
// ⭐ Slovník páky se NEPÍŠE RUČNĚ — počítá se DIFFEM postavených promptů (páka nastavená
// vs. nenastavená). Ruční tabulka by se rozešla při první úpravě promptu a nikdo by si
// toho nevšiml; diff se rozejít nemůže, protože čte tentýž builder jako produkce (§19.3).
//
// TŘI TŘÍDY NÁLEZU:
//   ZASETO      slovo je v textu páky A ve čteních s tou pákou je nadreprezentované
//               → tohle jsme napsali my a model to opisuje. Akční.
//   TICHO       slovo je v textu páky, ale signál žádný → prompt neprosakuje. Dobrá zpráva.
//   DRIFT       slovo je nadreprezentované, ale v textu páky NENÍ → nezasel jsme ho my.
//               Asociace modelu. NENÍ to nález, je to otázka pro člověka.
//
// ⚠️ NÁSTROJ SE OBHAJUJE SÁM (§27). Každý nález nese sloupec REPLIKUJE: dávka se rozdělí
// na dvě půlky (deterministicky podle id, ne náhodně — jinak by nešel zopakovat) a nález
// musí ukázat TÝMŽ SMĚREM v obou. Co nepřežije půlku, je šum. Nástroj navíc vypíše, co
// při současném `n` NEUVIDÍ — mlčky vytištěná nula by lhala (§19.2).
//
// ⚠️ PROMPT SE LOSUJE — nejen úhel a sezónní obraz, ale i klíčová slova runy (`.slice(0, 4)`).
// Diff proto běží N-krát na obě strany a bere SJEDNOCENÍ MINUS SJEDNOCENÍ: slovo patří páce,
// když ho páka umí vyrobit a základ nikdy. (První verze chtěla slovo ve VŠECH bězích; Isa
// nese „stillness" jen v půlce, takže prunik zahazoval právě ty nejzajímavější nálezy.)
// Hlídač téhle volby je `--null`: kdyby bylo sjednocení moc benevolentní, nulový běh
// by začal vyrábět nálezy. Nezačal.
//
// SOUKROMÍ (repo je PUBLIC): nečte se `user_id`, `question` ani celé texty na výstup.
// Do výstupu jdou jen jednotlivá slova a čísla; drift slovo musí být aspoň ve 3 různých
// čteních, aby se z výstupu nedal složit ojedinělý osobní řetězec.
//
//   node scripts/utils/find_seeds.js                  EN, z produkční DB
//   node scripts/utils/find_seeds.js --lang is
//   node scripts/utils/find_seeds.js --min 8          min. čtení na hodnotu páky
//   node scripts/utils/find_seeds.js --drift          přidá sekci DRIFT (otázky pro člověka)
//   node scripts/utils/find_seeds.js --json           strojový výstup
// ═══════════════════════════════════════════════════════
const fs = require('fs'), vm = require('vm'), os = require('os'), path = require('path');
const { execSync } = require('child_process');

const ARGS = process.argv.slice(2);
const has = (f) => ARGS.indexOf(f) !== -1;
const val = (f, d) => { const i = ARGS.indexOf(f); return i !== -1 && ARGS[i + 1] ? ARGS[i + 1] : d; };
const LANG = val('--lang', 'en');
const MIN_N = parseInt(val('--min', '8'), 10);
const JSON_OUT = has('--json');
const SHOW_DRIFT = has('--drift');
const BUILDS = 14;             // bezu na stranu diffu (prompt se losuje - obe sjednoceni musi zkonvergovat)
const DRIFT_MIN_DOCS = 3;      // slovo musí být aspoň ve 3 čteních (soukromí + šum)
const Q_MAX = 0.10;            // BH-FDR práh

// ─── DB ───────────────────────────────────────────────────
function q(sql) {
  const tmp = path.join(os.tmpdir(), 'runar_seeds_' + process.pid + '.sql');
  fs.writeFileSync(tmp, sql, 'utf8');
  try {
    const out = execSync('supabase db query --linked -f "' + tmp + '"',
      { cwd: path.resolve(__dirname, '../..'), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    const i = out.indexOf('{');
    if (i === -1) throw new Error('DB nevratila JSON');
    return JSON.parse(out.slice(i)).rows || [];
  } catch (e) {
    console.error('CHYBA: DB dotaz selhal — ' + (e.message || e).split('\n')[0]);
    console.error('       (potrebuje prihlaseny `supabase db query --linked`)');
    process.exit(1);
  } finally { try { fs.unlinkSync(tmp); } catch (_) {} }
}

// ─── prostředí promptu (tentýž kód jako produkce, §19.3) ──
// --v2 <dir> pusti tyz sken proti JINE verzi promptu (napr. `git show <hash>:v2/...`).
// Bez toho nejde overit, ze nastroj najde nalez, o kterem uz vime, ze v datech je.
const D = val('--v2', path.resolve(__dirname, '../../v2')) + '/';
const S = { console };
S.window = S; S.globalThis = S;
S.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
S.document = { getElementById: () => null };
// ⚠️ `rk()`/`rn()` v runar-utils.js ctou GLOBALNI `lang`, ne parametr builderu. V produkci
// to vychazi, protoze volajici predava tutez promennou; tady se to musi nastavit, jinak
// builder spadne. (Latentni past — zapsano v RUNAR_BACKLOG.md.)
S.lang = LANG;
vm.createContext(S);
// ⚠️ JEDEN SPOJENY SKRIPT, ne pet volani. `runar-runes.js` deklaruje `const RUNES/AREAS/
// SEEKS/INTENTIONS` — a lexikalni vazba (`const`/`let`) se mezi volanimi vm.runInContext
// NESDILI. Pri nacitani po jednom videl `runar-character.js` SEEKS jako undefined, jeho
// obrana `typeof SEEKS === 'undefined' -> return ''` to spolkla, prompt se postavil BEZ
// kontextu pak a nastroj hlasil "paka nepridava nic" u uplne vsech pak. Tiche prazdno,
// ktere vypadalo jako vysledek (§19.2). Spojeni je nutne, ne kosmetika.
vm.runInContext(
  ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js']
    .map(f => fs.readFileSync(D + f, 'utf8')).join('\n;\n') +
  '\n;globalThis.__RUNES = typeof RUNES !== "undefined" ? RUNES : null;' +
  '\n;globalThis.__SEEKS = typeof SEEKS !== "undefined" ? SEEKS : null;', S);
if (!S.__RUNES || !S.__SEEKS) {
  console.error('CHYBA: prostredi promptu se nenacetlo (RUNES/SEEKS chybi) — nemer, opravuj.');
  process.exit(1);
}

// ─── text ────────────────────────────────────────────────
// Rúnarova slova jsou i islandská; \p{L} bere obojí. Apostrofy uvnitř slova drží
// "don't" pohromadě, aby se ze zákazu nestal falešný výskyt slova "not".
const STOP = new Set(('a an the and or but of to in on at by for with from as is are was were be been being ' +
  'it its this that these those you your yours he she they them his her their we our i not no do does did ' +
  'have has had will would can could may might must shall should if then than so such what which who whom ' +
  'when where why how all any both each few more most other some only own same too very just also into ' +
  'og að er em ert eru var voru vera hann hún það þau þeir þær þú þín þitt þinn ekki ef sem en eða um við ' +
  'til frá af á í úr yfir undir með fyrir eftir milli hjá nú þá hér þar þegar hvað hver hvernig því ' +
  'sig sér sinn sína sitt mun muni skal geta getur hefur hafa haft').split(/\s+/));

function words(txt) {
  return (String(txt || '').toLowerCase().match(/[\p{L}]+(?:['’][\p{L}]+)?/gu) || []);
}
function contentSet(txt) {
  const out = new Set();
  for (const w of words(txt)) if (w.length > 3 && !STOP.has(w)) out.add(w);
  return out;
}

// ─── statistika ──────────────────────────────────────────
const LF = [0, 0];
function lnFact(n) { for (let i = LF.length; i <= n; i++) LF[i] = LF[i - 1] + Math.log(i); return LF[n]; }
function lnHyp(a, b, c, d) {
  return lnFact(a + b) + lnFact(c + d) + lnFact(a + c) + lnFact(b + d)
       - lnFact(a) - lnFact(b) - lnFact(c) - lnFact(d) - lnFact(a + b + c + d);
}
// Fisher exact, oboustranny. Scita tabulky, ktere nejsou pravdepodobnejsi nez pozorovana.
function fisher(a, b, c, d) {
  const n = a + b + c + d, r1 = a + b, k = a + c;
  if (n === 0) return 1;
  const p0 = lnHyp(a, b, c, d);
  const lo = Math.max(0, k - (c + d)), hi = Math.min(r1, k);
  let s = 0;
  for (let x = lo; x <= hi; x++) {
    const lp = lnHyp(x, r1 - x, k - x, n - r1 - k + x);
    if (lp <= p0 + 1e-9) s += Math.exp(lp);
  }
  return Math.min(1, s);
}
// Benjamini-Hochberg. Bonferroni by pri stovkach testu a n~200 zabil uplne vsechno
// vcetne nalezu, ktery se rucne potvrdil — FDR je spravny kompromis pro screening.
function bh(ps) {
  const idx = ps.map((p, i) => [p, i]).sort((x, y) => x[0] - y[0]);
  const qs = new Array(ps.length); let prev = 1;
  for (let r = idx.length - 1; r >= 0; r--) {
    const [p, i] = idx[r];
    prev = Math.min(prev, p * idx.length / (r + 1));
    qs[i] = prev;
  }
  return qs;
}
// Co nastroj pri tomhle n NEUVIDI: nejmensi pocet zasahu ve skupine, ktery jeste da p<0,05.
function minDetectable(nIn, nOut, hitsOut) {
  for (let k = 0; k <= nIn; k++) {
    if (k / nIn <= hitsOut / Math.max(1, nOut)) continue;
    if (fisher(k, nIn - k, hitsOut, nOut - hitsOut) < 0.05) return k / nIn;
  }
  return 1;
}
// Deterministicke pulky: podle id, ne Math.random — nalez musi jit zopakovat.
function halfOf(id) {
  let h = 0; const s = String(id);
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h & 1;
}

// ─── slovník páky = DIFF postavených promptů ─────────────
const RUNE = S.__RUNES[0];
function buildOnce(over, rune) {
  const u = Object.assign({ name: 'Anna', area: '', seeking: '', intention: '', question: '' }, over);
  try { return String(S.buildReadingPrompt(u, rune || RUNE, LANG, null) || ''); } catch (e) { return ''; }
}
// Slova, ktera pridava JEN tahle hodnota paky: musi byt ve VSECH bezich s pakou
// a v ZADNEM bez ni. Bez pruniku by losovani (uhel, sezona, konec) delalo falesne zarodky.
//
// ⚠️ `rune_name` neni pole `u` — runa se predava zvlast. Prvni verze ji v diffu vubec
// nemenila, takze jmeno runy melo prazdny slovnik a spadlo do DRIFTU ("perth" 100 % vs 6 %
// jako by si to model vymyslel). Bylo to ZASETO, a to zamerne: prompt jmeno runy nese
// a nese ho spravne. Chyba byla v nastroji, ne v promptu.
// ⚠️ SJEDNOCENI MINUS SJEDNOCENI, ne prunik. Prvni verze zadala, aby slovo bylo ve VSECH
// bezich s pakou — jenze prompt si losuje i klicova slova runy (`.slice(0, 4)`), takze
// Isa nese "stillness" jen ve 3 z 6 bezich. Prunik prave ta nejzajimavejsi slova zahazoval
// a poslal je do DRIFTU, jako by si je model vymyslel. Slovo patri pace, kdyz ho paka umi
// vyrobit a baseline nikdy. Randomizaci tak neresi prisnejsi pravidlo, ale VIC bezu —
// obe sjednoceni musi stihnout zkonvergovat. Hlidac te volby je `--null`: kdyby bylo
// sjednoceni moc benevolentni, nulovy beh zacne vyrabet nalezy.
function leverVocab(lever, value) {
  const withL = new Set(), without = new Set();
  if (lever === 'rune_name') {
    const r = S.__RUNES.find(x => x.n === value || x.is_n === value);
    if (!r) return [];
    const others = S.__RUNES.filter(x => x !== r).slice(0, 4);
    for (let i = 0; i < BUILDS; i++) {
      for (const x of contentSet(buildOnce({}, r))) withL.add(x);
      for (const o of others) for (const x of contentSet(buildOnce({}, o))) without.add(x);
    }
  } else {
    for (let i = 0; i < BUILDS; i++) {
      for (const x of contentSet(buildOnce({ [lever]: value }))) withL.add(x);
      for (const x of contentSet(buildOnce({}))) without.add(x);
    }
  }
  return [...withL].filter(w => !without.has(w));
}

// ─── běh ─────────────────────────────────────────────────
const LEVERS = ['area', 'seeking', 'intention', 'rune_name'];
// ⚠️ JEN SINGLE. Spready (`spread_data is not null`) staví jine buildery (norns/kriz/
// horseshoe/yggdrasil); merit je proti single promptu znamena merit proti spatnemu textu —
// prvni verze tak hlasila "thread" u NORNS jako DRIFT, pritom to slovo nese spread builder.
// Rozsireni na spready = vlastni krok, ne tichy predpoklad (§19.3).
const LSAFE = LANG.replace(/[^a-z]/gi, '');
const rows = q(
  "select id, area, seeking, intention, rune_name, " +
  "coalesce(short_text,'') || ' ' || coalesce(deep_text,'') as txt " +
  "from public.readings where lang = '" + LSAFE + "' " +
  "and coalesce(area,'') <> 'spread' and coalesce(short_text,'') <> '';"
);
// ⚠️ Marker spreadu je `area='spread'`, NE `spread_data`. Sloupec `spread_data` je u vsech
// spreadu prazdny — nikdo do nej nepise (zapsano v RUNAR_BACKLOG.md). Prvni verze filtrovala
// podle nej a propustila vsech 63 spreadu do skenu.
const nSpread = (q("select count(*) as c from public.readings where lang = '" + LSAFE +
  "' and coalesce(area,'') = 'spread';")[0] || {}).c || 0;
if (!rows.length) { console.error('Zadna cteni pro lang=' + LANG); process.exit(1); }

const docs = rows.map(r => ({
  id: r.id, half: halfOf(r.id),
  area: r.area, seeking: r.seeking, intention: r.intention, rune_name: r.rune_name,
  set: new Set(words(r.txt)),
}));

// ⚠️ --null: NULOVÁ TRANSFORMACE (§27, útok 3). Přehází hodnoty pák mezi čteními, takže
// vazba text→páka je rozbitá. Nástroj tu MUSÍ najít (skoro) nic. Když najde, jeho statistika
// (BH-FDR) je moc měkká a všechny ostatní nálezy jsou podezřelé. Míchání je deterministické —
// nález musí jít zopakovat, takže ne Math.random.
if (has('--null')) {
  let seed = 20260815;
  const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  for (const lever of LEVERS) {
    const col = docs.map(d => d[lever]);
    for (let i = col.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [col[i], col[j]] = [col[j], col[i]]; }
    docs.forEach((d, i) => { d[lever] = col[i]; });
  }
  console.log('\n⚠️  NULOVÝ BĚH: páky přeházené. Očekávaný výsledek je ŽÁDNÝ nález.');
}

const tests = [];   // {lever, value, word, nIn, hitIn, nOut, hitOut, p, planted}
const skipped = []; // páky/hodnoty pod prahem — vypsat, ne zamlčet
const vocabCache = {};

for (const lever of LEVERS) {
  const values = [...new Set(docs.map(d => d[lever]).filter(v => v && String(v).trim()))];
  for (const value of values) {
    const inG = docs.filter(d => d[lever] === value), outG = docs.filter(d => d[lever] !== value);
    if (inG.length < MIN_N || outG.length < MIN_N) {
      skipped.push({ lever, value, n: inG.length, why: 'n < ' + MIN_N });
      continue;
    }
    const key = lever + '=' + value;
    const vocab = vocabCache[key] || (vocabCache[key] = leverVocab(lever, value));
    if (!vocab.length) { skipped.push({ lever, value, n: inG.length, why: 'nepridava do promptu zadne vlastni slovo' }); continue; }
    for (const w of vocab) {
      const hitIn = inG.filter(d => d.set.has(w)).length;
      const hitOut = outG.filter(d => d.set.has(w)).length;
      if (hitIn + hitOut < DRIFT_MIN_DOCS) continue;
      tests.push({
        lever, value, word: w, planted: true,
        nIn: inG.length, hitIn, nOut: outG.length, hitOut,
        p: fisher(hitIn, inG.length - hitIn, hitOut, outG.length - hitOut),
        inG, outG,
      });
    }
  }
}

// DRIFT: slova NADREPREZENTOVANA, ktera do promptu ta paka NEPRIDAVA. Neni to nalez,
// je to otazka pro cloveka — model si to asocioval sam.
if (SHOW_DRIFT) {
  const df = {};
  for (const d of docs) for (const w of d.set) if (w.length > 3 && !STOP.has(w)) df[w] = (df[w] || 0) + 1;
  const common = Object.keys(df).filter(w => df[w] >= Math.max(DRIFT_MIN_DOCS, docs.length * 0.03));
  for (const lever of LEVERS) {
    for (const value of [...new Set(docs.map(d => d[lever]).filter(Boolean))]) {
      const inG = docs.filter(d => d[lever] === value), outG = docs.filter(d => d[lever] !== value);
      if (inG.length < MIN_N || outG.length < MIN_N) continue;
      const vocab = new Set(vocabCache[lever + '=' + value] || []);
      for (const w of common) {
        if (vocab.has(w)) continue;
        const hitIn = inG.filter(d => d.set.has(w)).length, hitOut = outG.filter(d => d.set.has(w)).length;
        if (hitIn / inG.length <= hitOut / outG.length) continue;
        tests.push({
          lever, value, word: w, planted: false,
          nIn: inG.length, hitIn, nOut: outG.length, hitOut,
          p: fisher(hitIn, inG.length - hitIn, hitOut, outG.length - hitOut),
          inG, outG,
        });
      }
    }
  }
}

const qs = bh(tests.map(t => t.p));
tests.forEach((t, i) => {
  t.q = qs[i];
  t.rIn = t.hitIn / t.nIn; t.rOut = t.hitOut / t.nOut;
  // REPLIKACE (§27, utok 1): musi ukazovat TYMZ smerem v obou nezavislych pulkach.
  t.repl = [0, 1].every(h => {
    const a = t.inG.filter(d => d.half === h), b = t.outG.filter(d => d.half === h);
    if (!a.length || !b.length) return false;
    return a.filter(d => d.set.has(t.word)).length / a.length
         > b.filter(d => d.set.has(t.word)).length / b.length;
  });
  t.minDet = minDetectable(t.nIn, t.nOut, t.hitOut);
});

const hits = tests.filter(t => t.q < Q_MAX && t.rIn > t.rOut).sort((a, b) => a.p - b.p);
const planted = hits.filter(t => t.planted), drift = hits.filter(t => !t.planted);
const silent = tests.filter(t => t.planted && !(t.q < Q_MAX && t.rIn > t.rOut));

if (JSON_OUT) {
  const strip = t => ({ lever: t.lever, value: t.value, word: t.word, nIn: t.nIn, hitIn: t.hitIn,
    nOut: t.nOut, hitOut: t.hitOut, rateIn: +t.rIn.toFixed(3), rateOut: +t.rOut.toFixed(3),
    p: +t.p.toExponential(2), q: +t.q.toExponential(2), replikuje: t.repl, minDetekovatelne: +t.minDet.toFixed(3) });
  console.log(JSON.stringify({ lang: LANG, readings: docs.length, testu: tests.length,
    zaseto: planted.map(strip), drift: drift.map(strip), ticho: silent.length,
    preskoceno: skipped }, null, 2));
  process.exit(0);
}

const pct = x => (x * 100).toFixed(0) + ' %';
console.log('\n═══ ZÁRODKY · lang=' + LANG + ' · ' + docs.length + ' čtení · ' + tests.length + ' testů ═══\n');

console.log('ZASETO — slovo je v textu páky A ve čteních s ní je častější (BH-FDR q<' + Q_MAX + ').');
console.log('         ⚠️ ZASETO ≠ vada. Jméno runy se ve čtení objevit MÁ. Nástroj říká „tohle');
console.log('         prosakuje z promptu"; jestli to tam patří, rozhoduje člověk.\n');
if (!planted.length) console.log('  (žádné — prompt do výstupu neprosakuje měřitelně)');
for (const t of planted) {
  console.log('  ' + (t.repl ? '✔' : '⚠') + ' "' + t.word + '"  ' + t.lever + '=' + t.value);
  console.log('      s pákou ' + t.hitIn + '/' + t.nIn + ' = ' + pct(t.rIn) +
              '   bez ní ' + t.hitOut + '/' + t.nOut + ' = ' + pct(t.rOut) +
              '   p=' + t.p.toExponential(1) + ' q=' + t.q.toExponential(1) +
              (t.repl ? '   replikuje v obou půlkách' : '   ⚠ NEREPLIKUJE — ber jako šum'));
}

if (SHOW_DRIFT) {
  console.log('\nDRIFT — nadreprezentované, ale páka to do promptu NEDÁVÁ. Otázka pro člověka, ne nález:');
  if (!drift.length) console.log('  (žádné)');
  for (const t of drift.slice(0, 15))
    console.log('  ' + (t.repl ? '✔' : '⚠') + ' "' + t.word + '"  ' + t.lever + '=' + t.value +
                '   ' + pct(t.rIn) + ' vs ' + pct(t.rOut) + '  q=' + t.q.toExponential(1));
}

console.log('\nTICHO — ' + silent.length + ' slov z promptu bez signálu (prompt tam neprosakuje).');
if (nSpread) console.log('MIMO SKEN — ' + nSpread + ' spreadů: staví je jiné buildery, single prompt na ně neplatí.');

// ⚠️ Co nastroj NEUVIDI. Mlcky vytistena nula by lhala (§19.2).
if (tests.length) {
  const med = tests.map(t => t.minDet).sort((a, b) => a - b)[Math.floor(tests.length / 2)];
  console.log('\nSLEPOTA při tomhle n: medián nejmenšího zachytitelného výskytu je ' + pct(med) +
              ' ve skupině.\n  Slabší zárodek tenhle běh NEVIDÍ — není to „čisto", je to „málo dat".');
}
if (skipped.length) {
  console.log('\nPŘESKOČENO (nepočítá se jako čisto):');
  for (const s of skipped) console.log('  ' + s.lever + '=' + s.value + ' (n=' + s.n + ') — ' + s.why);
}
console.log('');
