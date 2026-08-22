// Dojde KAŽDÁ per-čtení páka na KAŽDOU cestu? (§13 přenesené na prompt)
//
// PROČ EXISTUJE — audit promptu 2026-08-17/18 našel čtyři vady a ANI JEDNA nebyla ve znění:
//   · `ÁVARP` (rod oslovení) mělo 6 ze 7 islandských cest — u životní runy si model rod
//     čtenáře volil sám, ačkoli system prompt říká „kynid er tilgreint í ÁVARP; fylgdu því"
//   · úhel čtení má 1 ze 7 cest, ačkoli páteř slibuje „každé čtení z jiného úhlu"
//   · shrine přebil celý jazyk a do islandštiny posílal „Respond only in English"
//   · `journey` byl zakázaný dvakrát a pokaždé jinak
// Všechno našel ČLOVĚK čtením. Pravidlo, které musí hlídat člověk, dřív nebo později spadne
// na ownera (CLAUDE.md) — tohle je z něj kontrola.
//
// JAK: páky se NEVYPISUJÍ znovu — čtou se z `gen_batch.js` (`WITHOUT`), který je jejich
// jediným seznamem (§18). Funkční páka se ve vm obalí špionem (přispěla = vrátila neprázdné),
// řádková se hledá podle markeru z packu TÉ CESTY — stejně jako `gen_batch --without`.
//
// ⚠️ DVĚ VĚCI, KTERÉ MĚŘIDLO NEJDŘÍV HLÁSILO ŠPATNĚ (a proto se sem píšou):
//   1. `voice` má v gen_batch `sys: true` — bydlí v SYSTÉMOVÉM promptu, ne v uživatelském.
//      První verze ho hledala v user promptu a hlásila „NE" u všech sedmi cest. Systémové
//      páky se proto měří zvlášť, na `buildSysPrompt`, a jsou pro všechny cesty společné.
//   2. Marker řádkové páky se bral vždy z `RP_SINGLE`, takže u ostatních packů minul
//      i to, co tam je. Každá cesta má teď svůj pack.
//
// CO JE CHYBA: kontrola NEříká „všude musí být všechno". Některé mezery jsou rozhodnuté.
// Chyba je ZMĚNA proti mapě níž: páka přestala docházet tam, kam dřív docházela, nebo se
// objevila tam, kde být nemá. Přesně tak zmizelo ÁVARP a nikdo si toho nevšiml.
//
//   node scripts/verify_prompt_levers.js
//   node scripts/verify_prompt_levers.js --mapa      (jen vypíše mapu, nic neporovnává)
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = process.env.RUNAR_ROOT || 'C:/Users/zkuku/Downloads/Runar-admin';
const V2 = path.join(ROOT, 'v2');
const JEN_MAPA = process.argv.includes('--mapa');

// ── seznam pák: JEDINÝ zdroj je gen_batch.js ─────────────────────────────
function paky() {
  const zdroj = fs.readFileSync(path.join(ROOT, 'scripts', 'utils', 'gen_batch.js'), 'utf8');
  const zac = zdroj.indexOf('const WITHOUT = {');
  if (zac < 0) return null;
  const kus = zdroj.slice(zac, zdroj.indexOf('};', zac));
  const out = [];
  const re = /^\s*(\w+):\s*\{([^\n]*)$/gm;
  let m;
  while ((m = re.exec(kus))) {
    const telo = m[2];
    const d = /(line|fn):\s*'([^']+)'/.exec(telo);
    if (!d) continue;
    out.push({ klic: m[1], druh: d[1], co: d[2], sys: /sys:\s*true/.test(telo) });
  }
  return out.length ? out : null;
}

function svet(lang) {
  const S = { console: { log() {}, warn() {}, error() {} } };
  S.window = S; S.globalThis = S; S.lang = lang;
  S.document = { getElementById: () => null, querySelector: () => null };
  vm.createContext(S);
  for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js']) {
    vm.runInContext(fs.readFileSync(path.join(V2, f), 'utf8'), S);
  }
  return S;
}

// Vstup musí být PLNÝ, jinak páka mlčí kvůli chybějícímu vstupu a ne kvůli zapojení.
function vstup(S, lang) {
  const R = vm.runInContext('RUNES', S);
  const pole = (jm) => (vm.runInContext('typeof ' + jm + ' !== "undefined" ? ' + jm + ' : {}', S) || {})[lang] || [];
  return {
    runy: R.slice(0, 9),
    u: { name: 'Anna', area: pole('AREAS')[0], seeking: pole('SEEKS')[0],
         intention: pole('INTENTIONS')[0], question: '', lifeRune: R[3] },
  };
}

// cesta → builder + JEJÍ pack (kvůli markerům řádkových pák)
const CESTY = [
  ['single',    'RP_SINGLE',    (S, u, r, l) => S.buildReadingPrompt(u, r[0], l, null)],
  ['norns',     'RP_NORNS',     (S, u, r, l) => S.buildNornsPrompt(u, r.slice(0, 3), l, null)],
  ['kriz',      'RP_KRIZ',      (S, u, r, l) => S.buildKrizPrompt(u, r.slice(0, 5), l, null)],
  ['horseshoe', 'RP_HORSESHOE', (S, u, r, l) => S.buildHorseshoePrompt(u, r.slice(0, 7), l, null)],
  ['yggdrasil', 'RP_YGGDRASIL', (S, u, r, l) => S.buildYggdrasilPrompt(u, r.slice(0, 9), l, null)],
  ['ask',       'RP_ASK',       (S, u, r, l) => S.buildAskPrompt('Fyrri lestur.', 'Spurning?', r.slice(0, 1), l, null)],
  ['liferune',  'RP_LIFE',      (S, u, r, l) => S.buildLifeRunePrompt(u.name, r[0], 14, 6, 1990, l, false, null)],
];

function zmer(lang) {
  const seznam = paky();
  if (!seznam) return null;
  const S = svet(lang);
  const { runy, u } = vstup(S, lang);
  const vysledek = {};

  // ── systémové páky: společné pro všechny cesty, měří se na buildSysPrompt ──
  const sysStav = {};
  for (const p of seznam.filter((x) => x.sys && x.druh === 'fn')) {
    if (!vm.runInContext('typeof ' + p.co + ' === "function"', S)) { sysStav[p.klic] = null; continue; }
    S['__spy_' + p.klic] = { hit: false };
    vm.runInContext('var __orig_' + p.klic + ' = ' + p.co + ';\n'
      + p.co + ' = function () { var v = __orig_' + p.klic + '.apply(this, arguments);'
      + ' if (v !== undefined && v !== null && String(v).trim() !== "") __spy_' + p.klic + '.hit = true;'
      + ' return v; };', S);
    try { S.buildSysPrompt(null, lang); } catch (e) { /* projevi se jinde */ }
    sysStav[p.klic] = !!S['__spy_' + p.klic].hit;
    vm.runInContext(p.co + ' = __orig_' + p.klic + ';', S);
  }

  for (const [jmeno, packJm, stav] of CESTY) {
    const zasah = {};
    const obaleno = {};
    for (const p of seznam) {
      if (p.druh !== 'fn' || p.sys) continue;
      if (!vm.runInContext('typeof ' + p.co + ' === "function"', S)) { zasah[p.klic] = null; continue; }
      obaleno[p.klic] = true;
      S['__spy_' + p.klic] = { hit: false };
      vm.runInContext('var __orig_' + p.klic + ' = ' + p.co + ';\n'
        + p.co + ' = function () { var v = __orig_' + p.klic + '.apply(this, arguments);'
        + ' if (v !== undefined && v !== null && String(v).trim() !== "") __spy_' + p.klic + '.hit = true;'
        + ' return v; };', S);
    }
    let prompt = '';
    try { prompt = String(stav(S, u, runy, lang) || ''); } catch (e) { prompt = '__CHYBA__ ' + e.message; }
    for (const p of seznam) {
      if (p.sys) { zasah[p.klic] = sysStav[p.klic]; continue; }
      if (p.druh === 'fn') {
        if (obaleno[p.klic]) {
          zasah[p.klic] = !!(S['__spy_' + p.klic] && S['__spy_' + p.klic].hit);
          vm.runInContext(p.co + ' = __orig_' + p.klic + ';', S);
        }
      } else {
        const pack = vm.runInContext('typeof ' + packJm + ' !== "undefined" ? ' + packJm + ' : null', S);
        const marker = pack && (pack[lang] || pack.en) && (pack[lang] || pack.en)[p.co];
        zasah[p.klic] = marker ? prompt.indexOf(String(marker).slice(0, 30)) !== -1 : null;
      }
    }
    zasah.__chyba = prompt.indexOf('__CHYBA__') === 0 ? prompt.slice(0, 90) : null;
    vysledek[jmeno] = zasah;
  }
  return { seznam, vysledek };
}

// ── MAPA VÝJIMEK — co dnes NEdochází a PROČ (§28: důvod + datum) ─────────
const VYJIMKY = {
  length: {
    cesty: ['norns', 'kriz', 'horseshoe', 'yggdrasil', 'ask', 'liferune'],
    proc: 'Rozpočet délky je od 2026-08-21 losovaná páka (3 nebo 4 věty) a byl MĚŘEN jen '
        + 'na single. Životní runa i follow-up mají vlastní instrukci o délce ve svém '
        + 'builderu — dvě délky proti sobě by si odporovaly. → RUNAR_EVAL_LOG.md 2026-08-21.',
  },
  angle: {
    cesty: ['norns', 'kriz', 'horseshoe', 'yggdrasil', 'ask', 'liferune'],
    proc: 'Rozhodnuto 2026-08-18 po měření na 300 čteních: vypnutí úhlu u single stejnost '
        + 'nezvýšilo, takže „spready bez úhlu splývají" neobstálo. → RUNAR_EVAL_LOG.md 2026-08-18.',
  },
  lens: {
    cesty: ['single', 'kriz', 'horseshoe', 'yggdrasil', 'ask', 'liferune'],
    proc: 'Životní runa JE ta čočka (nemá se zrcadlit sama); `ask` navazuje na hotové čtení. '
        + 'U velkých spreadů zapojená není — ZJIŠTĚNO 2026-08-18 touhle kontrolou, '
        + 'NEROZHODNUTO. Otevřeno v RUNAR_BACKLOG.md.'
        + ' Single: v4.0 kostra 2026-08-22 — owner: "napred budeme ladit samotne cteni"; vraci se po jednom, zmerene.',
  },
  name: { cesty: ['ask', 'liferune'], proc: '`ask` je odpověď k hotovému čtení; životní runa má jméno ve svém základu (`buildLifeRuneBase`). Ověřeno 2026-08-18.' },
  image: { cesty: ['ask', 'liferune'], proc: '`ask` navazuje na čtení, kde obraz už zazněl; životní runa staví obraz ve vlastním základu. Ověřeno 2026-08-18.' },
  keywords: { cesty: ['ask', 'liferune'], proc: 'Táž příčina jako u `image` — obě cesty mají vlastní základ. Ověřeno 2026-08-18.' },
  ending: { cesty: ['ask', 'liferune'], proc: 'Táž příčina jako u `image`. Ověřeno 2026-08-18.' },
  domain: { cesty: ['ask', 'liferune'], proc: '`ask` ani životní runa nedostávají oblast života na vstupu. Ověřeno 2026-08-18. (Single: oblast vrácena v4.1, 22. 8.)' },
  register: { cesty: ['ask', 'liferune'], proc: 'Táž příčina jako u `domain`. Ověřeno 2026-08-18.' },
  intention: { cesty: ['ask', 'liferune'], proc: 'Táž příčina jako u `domain`. Ověřeno 2026-08-18.' },
  priority: { cesty: ['single', 'ask', 'liferune'], proc: 'Táž příčina jako u `domain`. Ověřeno 2026-08-18.' },
};
const zvlast = (klic, cesta) => !!(VYJIMKY[klic] && VYJIMKY[klic].cesty.indexOf(cesta) !== -1);

const nalezy = [];
for (const lang of ['en', 'is']) {
  const v = zmer(lang);
  if (!v) { console.log('seznam pák se nepodařilo přečíst z gen_batch.js — kontrola NEBĚŽELA'); process.exit(1); }
  const { seznam, vysledek } = v;
  console.log('\n  ── ' + lang.toUpperCase() + ' ──');
  const sirka = Math.max(...seznam.map((p) => p.klic.length)) + 1;
  console.log('  ' + 'páka'.padEnd(sirka) + CESTY.map(([j]) => j.slice(0, 9).padEnd(10)).join(''));
  for (const p of seznam) {
    const bunky = [];
    for (const [jmeno] of CESTY) {
      const hod = vysledek[jmeno][p.klic];
      const enAdresa = (p.klic === 'address' && lang === 'en');   // ÁVARP je z principu jen IS
      let znak = hod === null ? '  -  ' : (hod ? ' ano ' : ' NE  ');
      if (enAdresa) znak = '  ·  ';
      else if (hod === false && zvlast(p.klic, jmeno)) znak = ' (ne)';
      else if (hod === false) nalezy.push(lang + ' · ' + jmeno + ' · ' + p.klic + ' (' + p.co + ') nedochází a není to zapsaná výjimka');
      if (hod === true && zvlast(p.klic, jmeno)) nalezy.push(lang + ' · ' + jmeno + ' · ' + p.klic + ' NAOPAK dochází, ačkoli mapa říká, že nemá');
      bunky.push(znak.padEnd(10));
    }
    console.log('  ' + p.klic.padEnd(sirka) + bunky.join(''));
  }
  for (const [jmeno] of CESTY) {
    if (vysledek[jmeno].__chyba) nalezy.push(lang + ' · ' + jmeno + ' · builder spadl: ' + vysledek[jmeno].__chyba);
  }
}
console.log('\n  ano = páka přispěla · NE = nedochází · (ne) = zapsaná výjimka · · = neplatí pro jazyk · - = funkce neexistuje');

if (JEN_MAPA) process.exit(0);
// REJSTRIK PAK — kazda paka musi mit radek v RUNAR_EVAL_LOG, aby slo pred tvrzenim o pace
// precist, co uz je o ni zmereno. Rejstrik se jinak rozejde tise: pribude paka, nikdo ji
// tam nezapise, a priste o ni zase nekdo tvrdi neco z hlavy (stalo se 2026-08-21, dvakrat).
(function rejstrik() {
  const LOG = path.join(ROOT, "RUNAR_EVAL_LOG.md");
  if (!fs.existsSync(LOG)) { nalezy.push("RUNAR_EVAL_LOG.md nenalezen — rejstrik pak nelze overit"); return; }
  const cely = fs.readFileSync(LOG, "utf8");
  // Jen sekce rejstriku, ne cely log: `| **intention**` je v logu 3x i mimo nej, takze
  // hledani po celem souboru by paku bez radku pustilo zelene.
  const zacatek = cely.indexOf("## Rejstřík pák");
  if (zacatek < 0) { nalezy.push("rejstrik pak: sekce `## Rejstřík pák` v RUNAR_EVAL_LOG chybi"); return; }
  const dalsi = cely.indexOf(String.fromCharCode(10) + "## ", zacatek + 3);
  const text = dalsi > 0 ? cely.slice(zacatek, dalsi) : cely.slice(zacatek);
  const seznam = paky() || [];
  const chybi = seznam.filter(function (p) { return text.indexOf("| **" + p.klic + "**") === -1; })
                      .map(function (p) { return p.klic; });
  if (chybi.length) nalezy.push("rejstrik pak: bez radku v RUNAR_EVAL_LOG — " + chybi.join(", "));
})();

if (nalezy.length) {
  console.log('\npáka nedochází tam, kam podle mapy má (nebo naopak)');
  for (const n of nalezy) console.log('  • ' + n);
  console.log('  Buď to zapoj, nebo doplň VÝJIMKU s důvodem a datem do verify_prompt_levers.js.');
  process.exit(1);
}
console.log('\nkaždá per-čtení páka dochází tam, kam podle zapsané mapy má');
