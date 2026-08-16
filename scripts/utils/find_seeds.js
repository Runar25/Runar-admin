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

// ═══════════════════════════════════════════════════════
// --kws · PŘÍČINNÝ test UVNITŘ jedné runy
//
// ⚠️ ZASETO u `rune_name` NEDOKAZUJE, že to slovo způsobil náš text. „stillness" u Isy
// (70 % vs 5 %) je v promptu — ale Isa JE ledová a model to ví i bez nás. Runa způsobuje
// obojí najednou: náš seznam i model. Korelace s pákou tady příčinu neurčí.
//
// ⭐ Jenže prompt losuje 3 klíčová slova z 5–6 a od 2026-08-10 zapisuje do `prompt_draws.kws`,
// KTERÁ padla. To je randomizovaný pokus, který si appka dělá sama — jen ho nikdo nečetl.
// Uvnitř JEDNÉ runy porovnáme čtení, kde slovo PADLO, proti těm, kde NEPADLO. Runa je
// v obou skupinách táž, takže „model to ví" se vyruší a zbyde vliv NAŠEHO textu.
//
// Odpovídá tím na ownerovu otázku (2026-08-15: „co kdybychom dal těm slovům pár ekvivalentů?")
// DŘÍV, než se ekvivalenty napíšou: nemá smysl rozšiřovat košík, ze kterého se netahá.
//
//   node scripts/utils/find_seeds.js --kws           ostrý běh z DB
//   node scripts/utils/find_seeds.js --selftest      ověří, že ta analýza vůbec něco pozná
// ═══════════════════════════════════════════════════════
const KWS_MIN_ROWS = 30;

// Sonda pro klíčové slovo. Delší slovo se zkracuje na 4 znaky, aby chytilo ohyby
// („waiting" → „wait" chytí i „waits"). Krátké slovo MUSÍ sedět celé: sonda „ice"
// jako předpona by v islandské appce chytala „Iceland" v každém druhém čtení.
function probeOf(kw) {
  const ws = words(kw).filter(w => w.length >= 3 && !STOP.has(w));
  if (!ws.length) return null;
  const w = ws[0];
  return { probe: w.length >= 5 ? w.slice(0, 4) : w, whole: w.length < 4 };
}
function hitsProbe(txt, pr) {
  return new RegExp('\\b' + pr.probe + (pr.whole ? '\\b' : ''), 'i').test(txt);
}

// Kolikrat vic dat by pri STEJNYCH pomerech doslo pod p<0,05. Odpoved "potrebujeme
// zhruba 3x tolik" je akcni; holé "nevyslo to" neni.
function needFactor(a, b, c, d) {
  for (const m of [2, 3, 4, 6, 8, 12, 20]) {
    if (fisher(Math.round(a * m), Math.round(b * m), Math.round(c * m), Math.round(d * m)) < 0.05) return m;
  }
  return 0;
}

function runKws(rows, label) {
  const kwField = LANG === 'is' ? 'k_is' : 'k';
  let a = 0, b = 0, c = 0, d = 0;
  const per = {}, unmatched = {};
  for (const r of rows) {
    const rune = S.__RUNES.find(x => x.n === r.rune_name || x.is_n === r.rune_name);
    // ⚠️ Nespárovaný řádek se NESMÍ tiše přeskočit. Tichý `continue` je přesně to,
    // co dělá z rozbitého párování čistý nulový výsledek (§19.2).
    if (!rune || !rune[kwField]) { unmatched[r.rune_name] = (unmatched[r.rune_name] || 0) + 1; continue; }
    const all = rune[kwField].split(',').map(s => s.trim()).filter(Boolean);
    const drawn = String(r.kws || '').split(',').map(s => s.trim()).filter(Boolean);
    for (const kw of all) {
      const pr = probeOf(kw);
      if (!pr) continue;
      const wasDrawn = drawn.indexOf(kw) !== -1;
      const appears = hitsProbe(r.txt, pr);
      const k = r.rune_name + ' · ' + kw;
      per[k] = per[k] || { dr: 0, drHit: 0, nd: 0, ndHit: 0 };
      if (wasDrawn) { per[k].dr++; if (appears) { per[k].drHit++; a++; } else b++; }
      else { per[k].nd++; if (appears) { per[k].ndHit++; c++; } else d++; }
    }
  }
  const p = fisher(a, b, c, d);
  const rDr = a + b ? a / (a + b) : 0, rNd = c + d ? c / (c + d) : 0;
  console.log('\n═══ PŘÍČINNÝ TEST klíčových slov · ' + label + ' ═══');
  console.log('  čtení s logem losu: ' + rows.length + '   dvojic (čtení × slovo): ' + (a + b + c + d));
  console.log('  slovo PADLO do promptu   → objevilo se v ' + a + '/' + (a + b) + ' = ' + (rDr * 100).toFixed(0) + ' %');
  console.log('  slovo NEPADLO            → objevilo se v ' + c + '/' + (c + d) + ' = ' + (rNd * 100).toFixed(0) + ' %');
  console.log('  Fisher p = ' + p.toExponential(2));
  const un = Object.keys(unmatched);
  if (un.length) console.log('  ⚠️ NESPÁROVÁNO s RUNES (nepočítá se jako nula): ' +
    un.map(k => k + '×' + unmatched[k]).join(', '));
  const top = Object.keys(per).filter(k => per[k].drHit || per[k].ndHit)
    .sort((x, y) => per[y].drHit - per[x].drHit).slice(0, 6);
  if (top.length) {
    console.log('  slova, která se vůbec objevila:');
    for (const k of top) console.log('    ' + k + '  padlo ' + per[k].drHit + '/' + per[k].dr +
      ' · nepadlo ' + per[k].ndHit + '/' + per[k].nd);
  }
  if (rows.length < KWS_MIN_ROWS) {
    console.log('\n  ⚠️ NEDOSTATEK DAT (' + rows.length + ' < ' + KWS_MIN_ROWS + ' čtení s logem losu).');
    console.log('     Tohle NENÍ výsledek. `prompt_draws.kws` se píše až od 2026-08-10.');
  } else if (p < 0.05 && rDr > rNd) {
    console.log('\n  → NÁŠ SEZNAM to způsobuje. Rozšířit ho o ekvivalenty dává smysl.');
  } else if (rDr > rNd) {
    // ⚠️ „Nevyšlo p" NENI „neni tam nic". Smer sedi, jen na to nemame dost dat —
    // a tvrdit v tomhle stave „nezpusobuje" je presne ta ticha zelena, kterou §19.2 zakazuje.
    console.log('\n  → NEROZHODNUTO. Směr sedí (' + (rDr * 100).toFixed(0) + ' % vs ' +
      (rNd * 100).toFixed(0) + ' %), ale p = ' + p.toFixed(3) + ' na hladinu nestačí.');
    const m = needFactor(a, b, c, d);
    console.log('     Při stejných poměrech by to rozhodlo zhruba ' +
      (m ? m + '× víc dat (~' + Math.ceil(rows.length * m) + ' čtení)' : 'víc dat, než má smysl sbírat') + '.');
    // ⚠️ DOLOZENO 2026-08-16: tenhle odhad se spletl. Rekl "2x vic dat (~100 cteni)";
    // po zdvojnaseni na 100 slo p z 0,099 na 0,179, protoze efekt sam klesl z 11/5 na 10/6.
    // Hranicni prvni odhad je skoro vzdy nafouknuty sumem — extrapolace z nej lze.
    console.log('     ⚠️ Ber ten odhad jako STROP, ne plán: hraniční první měření bývá');
    console.log('        nafouknuté šumem, takže po dosypání dat p často vyjde HŮŘ, ne líp.');
    console.log('     NETVRDÍ SE, že seznam nic nedělá — tvrdí se, že to zatím nevíme.');
  } else {
    console.log('\n  → Směr je opačný nebo plochý: nic nenasvědčuje tomu, že by seznam');
    console.log('     to slovo do čtení tlačil. (Pořád to není důkaz nepřítomnosti.)');
  }
  return { a, b, c, d, p };
}

// ROZKOPAT VLASTNÍ PRÁCI: analýza, která nikdy nic nenajde, projde stejně tiše jako správná.
// Tři případy, ne jen ten dobrý — musí najít efekt, NESMÍ ho najít v nulových datech,
// a sonda musí umět ohyb i past („ice" NESMÍ chytit „Iceland").
if (has('--selftest')) {
  let bad = 0;
  const chk = (ok, msg) => { console.log('  ' + (ok ? '✔' : '✘ SELHALO') + '  ' + msg); if (!ok) bad++; };

  console.log('\n─── sonda ───');
  const pIce = probeOf('ice'), pWait = probeOf('waiting'), pStill = probeOf('stillness');
  chk(hitsProbe('the ice holds', pIce), '"ice" chytí "ice"');
  chk(!hitsProbe('a farm in Iceland', pIce), '"ice" NEchytí "Iceland" (past: krátká sonda jako předpona)');
  chk(hitsProbe('he waits by the door', pWait), '"waiting" chytí ohyb "waits"');
  chk(!hitsProbe('the water rose', pWait), '"waiting" NEchytí "water"');
  chk(hitsProbe('a stillness settled', pStill), '"stillness" chytí sebe');

  // Isa.k = 'ice, stillness, waiting, pause, clarity through cold'
  const mk = (kws, txt) => ({ rune_name: 'Isa', kws, txt });
  console.log('\n─── data s FALEŠNÝM efektem (slovo se objeví, jen když padne) ───');
  const eff = [];
  for (let i = 0; i < 12; i++) {
    eff.push(mk('ice, stillness, waiting', 'the ice and a stillness and he waits here'));
    eff.push(mk('pause, clarity through cold, ice', 'a pause in the clear cold ice of morning'));
  }
  const rE = runKws(eff, 'SELFTEST efekt');
  chk(rE.p < 0.05 && rE.a / (rE.a + rE.b) > rE.c / (rE.c + rE.d), 'efekt se NAJDE (p<0,05, správný směr)');

  console.log('\n─── NULOVÁ data (text se o los vůbec neopírá) ───');
  const nul = [];
  for (let i = 0; i < 12; i++) {
    nul.push(mk('ice, stillness, waiting', 'the ice and a stillness and he waits, a pause, clear cold'));
    nul.push(mk('pause, clarity through cold, ice', 'the ice and a stillness and he waits, a pause, clear cold'));
  }
  const rN = runKws(nul, 'SELFTEST nula');
  chk(!(rN.p < 0.05), 'v nulových datech se NIC nenajde');

  console.log(bad ? '\n✘ SELFTEST SELHAL — ' + bad + ' bod(ů)\n' : '\n✔ SELFTEST OK — analýza pozná efekt i jeho nepřítomnost\n');
  process.exit(bad ? 1 : 0);
}

// Davka z gen_batch.js. Zapisuje `draws` v temze tvaru jako produkcni `prompt_draws`
// (gen_batch.js:717), takze se to da merit hned a necekat na provoz.
function loadJsonl(file) {
  const bad = [];
  const rws = fs.readFileSync(file, 'utf8').split('\n').filter(l => l.trim()).map((l, i) => {
    let o; try { o = JSON.parse(l); } catch (e) { bad.push(i + 1); return null; }
    if (!o.reading_text) { bad.push(i + 1); return null; }   // spadle cteni != nula
    return { rune_name: o.rune, kws: (o.draws || {}).kws || '', txt: o.reading_text,
             angle: (typeof o.angle_idx === 'number') ? o.angle_idx : -1 };
  }).filter(Boolean);
  if (bad.length) console.log('  ⚠️ ' + path.basename(file) + ': ' + bad.length +
    ' řádků bez čtení nebo nerozparsovaných — vynecháno, ne započteno jako nula.');
  return rws;
}

// ─── --kwrate: trefi model runu i BEZ naseho seznamu? ─────
// Doplnek k --kws. Ten meri, jestli konkretni slovo zavisi na tom, jestli padlo.
// Tohle meri hrubeji a primo: kolik procent cteni obsahuje ASPON JEDNO klicove slovo sve runy.
// Porovnanim normalni davky proti davce `--without keywords` se ukaze, jestli seznam vubec
// neco nese — kdyz cislo nespadne, model runu trefuje sam a ekvivalenty nemaji co zlepsit (§25).
function kwRate(rows, label) {
  const kwField = LANG === 'is' ? 'k_is' : 'k';
  let hit = 0, tot = 0; const unmatched = {}; const words_ = new Set();
  for (const r of rows) {
    const rune = S.__RUNES.find(x => x.n === r.rune_name || x.is_n === r.rune_name);
    if (!rune || !rune[kwField]) { unmatched[r.rune_name] = (unmatched[r.rune_name] || 0) + 1; continue; }
    tot++;
    let any = false;
    for (const kw of rune[kwField].split(',').map(s => s.trim()).filter(Boolean)) {
      const pr = probeOf(kw);
      if (pr && hitsProbe(r.txt, pr)) { any = true; words_.add(r.rune_name + '·' + kw); }
    }
    if (any) hit++;
  }
  const un = Object.keys(unmatched);
  if (un.length) console.log('  ⚠️ ' + label + ' NESPÁROVÁNO: ' + un.map(k => k + '×' + unmatched[k]).join(', '));
  console.log('  ' + label.padEnd(22) + hit + '/' + tot + ' = ' + (tot ? (hit / tot * 100).toFixed(0) : 0) +
    ' % čtení obsahuje aspoň jedno klíčové slovo své runy   (různých slov: ' + words_.size + ')');
  return { hit, tot };
}

if (has('--kwrate')) {
  const files = ARGS.filter(a => /\.jsonl$/i.test(a));
  if (files.length < 1) { console.error('pouziti: --kwrate a.jsonl [b.jsonl]'); process.exit(1); }
  console.log('\n═══ TREFÍ MODEL RUNU I BEZ NAŠEHO SEZNAMU? ═══');
  const res = files.map(f => kwRate(loadJsonl(f), path.basename(f)));
  if (res.length === 2) {
    const [A, B] = res;
    const p = fisher(A.hit, A.tot - A.hit, B.hit, B.tot - B.hit);
    console.log('\n  Fisher p = ' + p.toExponential(2));
    if (p < 0.05) console.log('  → seznam NĚCO nese: bez něj to měřitelně spadlo.');
    else console.log('  → rozdíl NEPROKÁZÁN: model runu trefuje i bez našeho seznamu.\n' +
                     '    Přidávat ekvivalenty do košíku, ze kterého se netahá, nemá účinek.');
    // ⚠️ Tahle metrika je zaujata JEDNIM smerem a musi to byt videt (§27).
    console.log('\n  ⚠️ Výhrada: sonda hledá NAŠE slovo. Když model bez seznamu řekne „quiet"');
    console.log('     místo „stillness", spočítá se to jako minutí — rameno bez seznamu tedy');
    console.log('     vyjde níž, i kdyby runu trefilo stejně dobře. Metrika umí NADHODNOTIT');
    console.log('     vliv seznamu, nikdy ho podhodnotit. Rozhoduje proto `--kws`, ne tohle:');
    console.log('     tam je los náhodný uvnitř TÉHOŽ promptu, takže žádná taková asymetrie není.');
  }
  console.log('');
  process.exit(0);
}

// ─── --variety: jsou čtení TÉŽE runy stejná? ─────────────
// Klíčová slova jsou jen prostředek; ownerův cíl je, aby čtení téže runy nebyla stejná.
// Měří se překryv slovníku mezi čteními JEDNÉ runy (Jaccard), a runy se pak PÁRUJÍ mezi
// rameny — každá runa je sama sobě kontrolou, takže rozdíl mezi runami se vyruší.
//
// ⚠️ Bez páru s NULOVÝM srovnáním je to číslo bezcenné: neví se, kolik dělá samo losování.
// Proto se vždy počítá i rameno A proti SOBĚ (první polovina vs druhá). Tam musí vyjít nula.
// Žádný bootstrap s opakováním — duplikát dá shodu 1,0 a metriku nafoukne.
function jaccard(a, b) {
  let inter = 0;
  for (const w of a) if (b.has(w)) inter++;
  const uni = a.size + b.size - inter;
  return uni ? inter / uni : 0;
}
function overlapByRune(rows, take, skip) {
  const by = {};
  for (const r of rows) (by[r.rune_name] = by[r.rune_name] || []).push(r);
  const out = {};
  for (const k of Object.keys(by)) {
    const sel = by[k].slice(skip || 0, (skip || 0) + take);
    if (sel.length < 2) continue;
    const sets = sel.map(r => contentSet(r.txt));
    let s = 0, n = 0;
    for (let i = 0; i < sets.length; i++) for (let j = i + 1; j < sets.length; j++) { s += jaccard(sets[i], sets[j]); n++; }
    if (n) out[k] = s / n;
  }
  return out;
}
function lnC(n, k) { let r = 0; for (let i = 0; i < k; i++) r += Math.log(n - i) - Math.log(i + 1); return r; }
function signP(k, n) {                       // oboustranny znamenkovy test, p=0,5
  if (!n) return 1;
  const lo = Math.min(k, n - k);
  let t = 0; for (let i = 0; i <= lo; i++) t += Math.exp(lnC(n, i) - n * Math.LN2);
  return Math.min(1, 2 * t);
}
function cmpVariety(oA, oB, la, lb) {
  const runes = Object.keys(oA).filter(k => k in oB);
  let win = 0; const d = [];
  for (const k of runes) { d.push(oA[k] - oB[k]); if (oA[k] > oB[k]) win++; }
  d.sort((x, y) => x - y);
  const med = runes.length ? d[Math.floor(d.length / 2)] : 0;
  const mA = runes.reduce((s, k) => s + oA[k], 0) / (runes.length || 1);
  const mB = runes.reduce((s, k) => s + oB[k], 0) / (runes.length || 1);
  console.log('  ' + la + ' překryv ' + (mA * 100).toFixed(1) + ' %  vs  ' + lb + ' ' + (mB * 100).toFixed(1) + ' %' +
    '   (' + runes.length + ' run párováno)');
  console.log('    medián rozdílu ' + (med * 100).toFixed(1) + ' b.  ·  ' + la + ' stejnější u ' + win + '/' + runes.length +
    ' run  ·  znaménkový test p = ' + signP(win, runes.length).toFixed(3));
  return { p: signP(win, runes.length), med };
}

// ─── --angles: dělá stejnost ÚHEL, ne klíčová slova? ─────
// Prompt losuje 1 ze 7 úhlů („čím čtení začne"). Na dávce se ukázalo, že dvojice čtení téže
// runy se STEJNÝM úhlem si jsou podobnější než s různým — a byl to nález POST HOC, z pohledu
// do dat. Proto tenhle režim: dávka s VYNUCENÝM úhlem (`gen_batch --angle N`) vyrobí dost
// dvojic se stejným úhlem na to, aby se to dalo otestovat záměrně, ne náhodou.
//
//   node scripts/utils/gen_batch.js --all-runes --n 2 --angle 3 --out eval_out/ang3.jsonl
//   node scripts/utils/find_seeds.js --angles eval_out/kws-a-all.jsonl eval_out/ang3.jsonl
//
// Páruje se PO RUNÁCH: každá runa je sama sobě kontrolou, takže rozdíly mezi runami se vyruší.
if (has('--angles')) {
  const files = ARGS.filter(a => /\.jsonl$/i.test(a));
  if (files.length !== 2) { console.error('pouziti: --angles <mixed.jsonl> <forced.jsonl>'); process.exit(1); }
  const mixed = loadJsonl(files[0]), forced = loadJsonl(files[1]);
  const angs = new Set(forced.map(r => r.angle));
  console.log('\n═══ DĚLÁ STEJNOST ÚHEL? ═══');
  if (angs.size !== 1) console.log('  ⚠️ vynucená dávka má ' + angs.size + ' různých úhlů (' +
    [...angs].join(',') + ') — není to čistý test.');
  const grp = rows => { const b = {}; for (const r of rows) (b[r.rune_name] = b[r.rune_name] || []).push(r); return b; };
  const gm = grp(mixed), gf = grp(forced);
  const same = {}, diff = {};
  for (const k of Object.keys(gf)) {                       // vynuceny uhel = same-angle dvojice
    const s = gf[k].map(r => contentSet(r.txt)); let t = 0, n = 0;
    for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) { t += jaccard(s[i], s[j]); n++; }
    if (n) same[k] = t / n;
  }
  for (const k of Object.keys(gm)) {                       // z mixu jen dvojice s RUZNYM uhlem
    const g = gm[k]; let t = 0, n = 0;
    for (let i = 0; i < g.length; i++) for (let j = i + 1; j < g.length; j++) {
      if (g[i].angle === g[j].angle || g[i].angle < 0) continue;
      t += jaccard(contentSet(g[i].txt), contentSet(g[j].txt)); n++;
    }
    if (n) diff[k] = t / n;
  }
  console.log('  stejný úhel = z vynucené dávky · různý úhel = jen různoúhlé dvojice z mixu\n');
  const r = cmpVariety(same, diff, 'stejný úhel', 'různý úhel');
  console.log('\n  ' + (r.p < 0.05
    ? '→ ÚHEL stejnost DĚLÁ. Je to větší páka než klíčová slova (ta nedělaly nic).'
    : '→ NEPROKÁZÁNO na těchhle datech. Nález z první dávky se záměrným testem nepotvrdil.'));
  console.log('');
  process.exit(0);
}

if (has('--variety')) {
  const files = ARGS.filter(a => /\.jsonl$/i.test(a));
  if (files.length !== 2) { console.error('pouziti: --variety a.jsonl b.jsonl'); process.exit(1); }
  const K = parseInt(val('--take', '2'), 10);
  const A = loadJsonl(files[0]), B = loadJsonl(files[1]);
  console.log('\n═══ STEJNOST ČTENÍ TÉŽE RUNY (překryv slovníku) ═══');
  console.log('  nižší překryv = pestřejší čtení. ' + K + ' čtení na runu.\n');
  cmpVariety(overlapByRune(A, K, 0), overlapByRune(B, K, 0), path.basename(files[0]), path.basename(files[1]));
  const nullA = overlapByRune(A, K, K);
  if (Object.keys(nullA).length) {
    console.log('\n  NULOVÉ SROVNÁNÍ (totéž rameno proti sobě — tady MUSÍ vyjít nula):');
    cmpVariety(overlapByRune(A, K, 0), nullA, 'A 1. půle', 'A 2. půle');
  } else {
    console.log('\n  ⚠️ NULOVÉ SROVNÁNÍ NELZE — rameno A nemá ' + (2 * K) + ' čtení na runu.');
    console.log('     Bez něj se neví, kolik z rozdílu dělá samo losování. Neber číslo výš jako výsledek.');
  }
  console.log('');
  process.exit(0);
}

if (has('--kws')) {
  const file = val('--file', null);
  let rws, label;
  if (file) {
    rws = loadJsonl(file);
    label = 'dávka ' + path.basename(file);
  } else {
    rws = q("select rune_name, prompt_draws->>'kws' as kws, " +
      "coalesce(short_text,'') || ' ' || coalesce(deep_text,'') as txt " +
      "from public.readings where lang = '" + LANG.replace(/[^a-z]/gi, '') + "' " +
      "and prompt_draws ? 'kws' and coalesce(area,'') <> 'spread';");
    label = 'produkce · lang=' + LANG;
  }
  runKws(rws, label);
  console.log('');
  process.exit(0);
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
let warnedRune = false;
for (const t of planted) {
  console.log('  ' + (t.repl ? '✔' : '⚠') + ' "' + t.word + '"  ' + t.lever + '=' + t.value);
  // ⚠️ U runy korelace NEURCI pricinu: runa zpusobuje nas seznam I model najednou.
  // "road" u Raidho se objevilo i ve cteni, kde to slovo NEPADLO (--kws).
  if (t.lever === 'rune_name' && !warnedRune) {
    warnedRune = true;
    console.log('      ⚠️ u runy tohle NEDOKAZUJE, že to způsobil náš text — runa způsobuje');
    console.log('         náš seznam i model najednou. Příčinu rozhodne `--kws`.');
  }
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
