// ㉜ REGISTR PRAVIDEL PROMPTU
//
// PROC: 2026-08-20 se ukazalo, ze hlavni vada Rúnarova promptu nejsou chybejici pravidla,
// ale pravidla, ktera si ODPORUJI — tri nalezy za jedno odpoledne (`noqBranch` „obrazem,
// ne vysvetlenim" proti pojmenovani runy · zakonceni „name where the seeker stands" proti
// `_noColdRead` · oblast Vegamot „what the seeker already knows" proti temuz zakazu).
// Kazda z tech radek zni sama o sobe rozumne; vada je az ve dvojici. Clovek si to
// nezapamatuje a pri pristi uprave to nikdo neproveri.
//
// CO TAHLE KONTROLA DELA A CO NE: neposuzuje vyznam — na to nastroj nemame (textovy pruchod
// po dvojicich 2026-08-21 neprosel kalibraci). Dela to hloupe a spolehlive: kazda instrukcni
// radka promptu ma v registru otisk. Pribude nebo se zmeni radka -> cervena, dokud ji nekdo
// vedome nezaregistruje. Vynucuje tedy POZORNOST, ne verdikt.
//
// Registrace po prezkoumani:  node scripts/verify_prompt_rules_registry.js --zapis
const fs = require('fs'), path = require('path'), vm = require('vm'), crypto = require('crypto');
const REPO = path.resolve(__dirname, '..');
const D = path.join(REPO, 'v2') + path.sep;
const REGISTR = path.join(REPO, 'scripts', 'prompt_rules_registry.json');
const ZAPIS = process.argv.includes('--zapis');

const S = { console: { log() {}, warn() {}, error() {} } };
S.window = S; S.globalThis = S; S.lang = 'en';
S.document = { getElementById: () => null, querySelector: () => null };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8'), S);

const RUNES = vm.runInContext('RUNES', S);
const zJaz = (jm, L) => (vm.runInContext('typeof ' + jm + ' !== "undefined" ? ' + jm + ' : {}', S) || {})[L] || [];
const glob = (jm) => vm.runInContext('typeof ' + jm + ' !== "undefined" ? ' + jm + ' : null', S);

// Sber pravidel: pooly PRVNI (aby si clen poolu, ktery postaveny prompt zrovna vylosoval,
// nesebral stitek `single`), pak pevne radky jedne postavene cesty a systemovy prompt.
function pravidla() {
  const ven = [];
  // Hlavicky radek s nahodnym obsahem — uhel a obraz. Ctou se z kodu, at se nerozejdou.
  const hlavicky = {};
  // Varianty umisteni jmena s dosazenym jmenem — presne v podobe, v jake se objevi v radce.
  const jmenaVarianty = {};
  for (const L of ['en', 'is']) {
    const pack = glob('RP_SINGLE');
    const uhel = pack && (pack[L] || pack.en) && (pack[L] || pack.en).angleIntro;
    const obraz = String(S._seasonalImagery(L, RUNES[3]) || '');
    const rez = obraz.indexOf(': ');
    hlavicky[L] = [uhel, rez > 0 ? obraz.slice(0, rez + 2) : null].filter(Boolean);
    const pool = (L === 'is' ? glob('NAME_PLACEMENTS_IS') : glob('NAME_PLACEMENTS')) || [];
    jmenaVarianty[L] = pool.map((x) => String(x).replace(/\{name\}/g, 'Anna'));
  }
  const pridej = (lang, zdroj, text) => {
    let t = String(text || '').replace(/\s+/g, ' ').trim();
    (hlavicky[lang] || []).forEach((h) => { if (h && t.indexOf(h) === 0) t = h.trim(); });
    (jmenaVarianty[lang] || []).forEach((v) => { if (v && t.indexOf(v) !== -1) t = t.replace(v, '').replace(/\s+/g, ' ').trim(); });
    if (t.length > 20) ven.push({ lang, zdroj, text: t });
  };
    // ⚠️ `RUNE `, `URÐUR`, `VERÐANDI`, `SKULD` přibyly 2026-09-11: jsou to ŠTÍTKY POZIC
  // ze spreadu, které Ask prompt vypisuje vedle jmen tažených run. Je to DATA (pozice +
  // runa), ne instrukce — registrovat je by znamenalo, že registr nese jména run z testovací
  // fixture a zčervenal by při každé její změně. IS tvar `RÚNIN` v seznamu už byl;
  // EN tvar a Norny chyběly, protože do 2026-09-11 žádný blok pozic v Ask promptu nebyl.
const DATA = /^(PERSON|DRAWN|SEEKER|LIFE|AREA|SEEKING|INTENTION|QUESTION|REALM|ELEMENT|FOCUS|Leiðandi|LífsRúna|Svið|Leiðin|Spurning|RÚNIN|Rúnir|DREGNA|ÁHERSLA|RUNE |URÐUR|VERÐANDI|SKULD)/;
  for (const L of ['en', 'is']) {
    (L === 'is' ? glob('READING_ANGLES_IS') : glob('READING_ANGLES') || []).forEach((a, i) => pridej(L, 'uhel[' + i + ']', a));
    (L === 'is' ? glob('ENDING_OPEN_IS') : glob('ENDING_OPEN') || []).forEach((a, i) => pridej(L, 'zakonceni_open[' + i + ']', a));
    (L === 'is' ? glob('ENDING_HEAVY_IS') : glob('ENDING_HEAVY') || []).forEach((a, i) => pridej(L, 'zakonceni_heavy[' + i + ']', a));
    (L === 'is' ? glob('NAME_PLACEMENTS_IS') : glob('NAME_PLACEMENTS') || []).forEach((a, i) => pridej(L, 'jmeno[' + i + ']', a));
    (L === 'is' ? glob('LENGTH_BUDGETS_IS') : glob('LENGTH_BUDGETS') || []).forEach((a, i) => pridej(L, 'delka[' + i + ']', a));
    zJaz('AREAS', L).forEach((a, i) => pridej(L, 'oblast[' + i + ']', S._domainContext(a, L)));
    zJaz('SEEKS', L).forEach((a, i) => pridej(L, 'registr[' + i + ']', S._registerContext(a, L)));
    zJaz('INTENTIONS', L).forEach((a, i) => pridej(L, 'zamer[' + i + ']', S._intentionContext(a, L)));
    pridej(L, 'cocka', S._lensContext(RUNES[18], RUNES[3], L));
    pridej(L, 'priorita', S._priorityContext(true, RUNES[3], L));
    const u = { name: 'Anna', area: '', seeking: '', intention: '', question: '', lifeRune: RUNES[18] };
    S.buildReadingPrompt(u, RUNES[3], L, null).split(String.fromCharCode(10))
      .forEach(r => { if (!DATA.test(r.trim())) pridej(L, 'single', r); });
    // Ask prompt se sklada ze dvou tvaru: s obema volbami (oblast + zamer) a jen s jednou.
    // Vety se lisi shodou v cisle („neither is" vs „this is"), takze registrovat JEDEN tvar
    // by druhy nechalo neviditelny. 2026-09-11: puvodni volani melo sest argumentu, takze
    // `_askCastContext` vracel prazdno a cely blok registru unikal — tichá zelená (§19.2).
    const _obl = zJaz('AREAS', L)[2], _zam = zJaz('INTENTIONS', L)[1];
    // Puvodni otazka je treti tvar bloku — bez ni by jeji vety registru unikly stejne,
    // jako mu 2026-09-11 unikal cely blok, dokud se volalo se sesti argumenty.
    const _ot = L === 'is' ? 'A eg ad skipta um starf?' : 'Should I leave the job I have?';
    [{ area: _obl, intention: _zam }, { area: _obl }, { question: _ot },
     { area: _obl, intention: _zam, question: _ot },
     { seeking: zJaz('SEEKS', L)[2] },
     { area: _obl, intention: _zam, seeking: zJaz('SEEKS', L)[2] }].forEach((_c, _i) =>
      S.buildAskPrompt('A reading.', 'What do you mean?', RUNES[3].n, L, null, RUNES[18], _c)
        .split(String.fromCharCode(10))
        .forEach(r => { if (!DATA.test(r.trim())) pridej(L, 'ask', r); }));
    // Blok o pozicich ve spreadu ma vlastni hlavicku a do Ask promptu se dostane jen
    // s osmym argumentem — bez nej by registru unikl (tataz tichá zelená jako 2026-09-11).
    // ZIVOTNI RUNA a ROZBOR JMENA (2026-09-11): do dneska je registr NESKENOVAL vubec.
    // Projevilo se to tak, ze odpojeni celeho odstavce o jmenu z promptu zivotni runy
    // proslo bez jedine cervene — a prave ten odstavec u nesevrskeho jmena vynucoval vymysl.
    S.buildLifeRunePrompt('Anna', RUNES[3], 24, 12, 1979, L, true, null)
      .split(String.fromCharCode(10))
      .forEach(r => { if (!DATA.test(r.trim())) pridej(L, 'liferune', r); });
    S.buildNameLorePrompt('Anna', L, null)
      .split(String.fromCharCode(10))
      .forEach(r => { if (!DATA.test(r.trim())) pridej(L, 'namelore', r); });
    S.buildAskPrompt('A reading.', 'What do you mean?', RUNES[3].n, L, null, null, null,
      { mode: 'kriz', runy: ['Fehu', 'Uruz', 'Thurisaz', 'Ansuz', 'Raidho'] })
      .split(String.fromCharCode(10))
      .forEach(r => { if (!DATA.test(r.trim())) pridej(L, 'ask', r); });
    S.buildSysPrompt(null, L).split(String.fromCharCode(10)).forEach(r => pridej(L, 'system', r));
  }
  // Dedup: prvni vyskyt vyhrava, proto jsou pooly nahore.
  // ⚠️ Klicuje se na CELY text, ne na zacatek. Pri klici z prvnich 60 znaku se ztracelo
  // 8 pravidel z 32 — pet variant registru a osm oblasti sdili stejnou uvodni vetu, takze
  // se do registru dostala jen prvni z nich a zmena zbylych by nezcervenala.
  const videl = new Set();
  return ven.filter(x => {
    const k = x.lang + '|' + x.text;
    if (videl.has(k)) return false;
    videl.add(k); return true;
  });
}

// Verze promptu — cte se z configu, neopisuje se (§20).
const VERZE = String(glob('RUNAR_PROMPT_VERSION') || '');

const otisk = (t) => crypto.createHash('sha1').update(t, 'utf8').digest('hex').slice(0, 12);
const ted = pravidla().map(x => ({ ...x, hash: otisk(x.text) }));

if (ZAPIS) {
  // ZAVORA: zmenena pravidla + nezmenena verze = cteni v DB se nerozeznaji od vcerejsich.
  // Presne tohle se stalo 2026-08-21 (pet migraci pod v2.1), proto to tady stoji.
  if (fs.existsSync(REGISTR)) {
    const stary = JSON.parse(fs.readFileSync(REGISTR, 'utf8'));
    const znameStare = new Set((stary.pravidla || []).map((x) => x.hash));
    const zmenene = ted.filter((x) => !znameStare.has(x.hash));
    if (zmenene.length && stary.prompt_version === VERZE) {
      console.log('  ODMITNUTO: ' + zmenene.length + ' pravidel se zmenilo, ale RUNAR_PROMPT_VERSION je porad '
        + VERZE + '.');
      console.log('       Cteni vygenerovana po tehle zmene by se v DB nerozeznala od tech pred ni.');
      console.log('       Bumpni `RUNAR_PROMPT_VERSION` v v2/runar-config.js a spust --zapis znovu.');
      process.exit(1);
    }
  }
  const dnes = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(REGISTR, JSON.stringify({
    poznamka: 'Otisky instrukcnich radek promptu. Zmena = kontrola ㉜ zcervena, dokud ji nekdo vedome nezaregistruje (--zapis). Nehodnoti vyznam, vynucuje pozornost.',
    zapsano: dnes,
    prompt_version: VERZE,
    pravidla: ted.map(x => ({ hash: x.hash, lang: x.lang, zdroj: x.zdroj, zacatek: x.text.slice(0, 70) })),
  }, null, 1));
  console.log('  zapsano ' + ted.length + ' pravidel do ' + path.relative(REPO, REGISTR) + '  (verze ' + VERZE + ')');
  process.exit(0);
}

if (!fs.existsSync(REGISTR)) {
  console.log('  ⚠  registr neexistuje — spust `node scripts/verify_prompt_rules_registry.js --zapis`');
  process.exit(1);
}
// ── UPLNOST: kazdy `build*Prompt` je bud SKENOVANY, nebo ma datovanou vyjimku ──
// ⚠️ 2026-09-11: tahle kontrola vznikla proto, ze registr kryl jen TRI cesty ze sedmi a nikdo
// o tom nevedel — dira se neohlasila, protoze se neohlasovalo nic. Ticho neni zelena.
// Od ted: pribude builder a nikdo ho nezapoji → tady zcervena a jmenuje ho.
const VYJIMKY_BUILDERU = {
  buildSysPromptV2:         'Lab, do produkce nevede — reader pouziva buildSysPrompt. Overeno 2026-09-11.',
  buildReadingPromptSingle: 'Implementace za `buildReadingPrompt`, ktery SE skenuje — tataz cesta. 2026-09-11.',
  buildKrizPromptCross:     'Implementace za `buildKrizPrompt`. 2026-09-11.',
  buildNornsPromptFate:     'Implementace za `buildNornsPrompt`. 2026-09-11.',
  buildHorseshoePromptSeven:'Implementace za `buildHorseshoePrompt`. 2026-09-11.',
  buildYggdrasilPromptNine: 'Implementace za `buildYggdrasilPrompt`. 2026-09-11.',
  // ⚠️ DLUH, ne rozhodnuti. Ctyri spready registr NEKRYJE, takze zmena jejich instrukci
  // projde bez povsimnuti. Nezapojeno hned zamerne: je to ~100 novych radek a odklepnout je
  // hromadne by z registru udelalo razitko. Rozepsano v RUNAR_BACKLOG.md 2026-09-11.
  buildKrizPrompt:      'DLUH 2026-09-11 — nezapojeno, radky k projiti. Viz RUNAR_BACKLOG.',
  buildNornsPrompt:     'DLUH 2026-09-11 — nezapojeno, radky k projiti. Viz RUNAR_BACKLOG.',
  buildHorseshoePrompt: 'DLUH 2026-09-11 — nezapojeno, radky k projiti. Viz RUNAR_BACKLOG.',
  buildYggdrasilPrompt: 'DLUH 2026-09-11 — nezapojeno, radky k projiti. Viz RUNAR_BACKLOG.',
};
{
  const zdrojCh = fs.readFileSync(D + 'runar-character.js', 'utf8');
  const tentoSkript = fs.readFileSync(__filename, 'utf8');
  const buildeři = (zdrojCh.match(/^function (build[A-Za-z]+)\(/gm) || [])
    .map(m => m.replace(/^function /, '').replace(/\($/, ''))
    .filter(n => /Prompt/.test(n));
  let chybi = 0;
  for (const b of buildeři) {
    if (tentoSkript.indexOf('S.' + b + '(') !== -1) continue;
    const v = VYJIMKY_BUILDERU[b];
    if (!v) { chybi++; console.log('  FAIL  `' + b + '` neni v registru ani ve vyjimkach — cela cesta promptu bez pojistky'); }
    else if (String(v).length < 25) { chybi++; console.log('  FAIL  vyjimka pro `' + b + '` nenese duvod (§28)'); }
  }
  if (chybi) { console.log('\n  ' + chybi + ' builderu bez pojistky i bez duvodu.'); process.exit(1); }
  console.log('  OK    uplnost: ' + buildeři.length + ' builderu — kazdy skenovany, nebo s datovanou vyjimkou');
}

const reg = JSON.parse(fs.readFileSync(REGISTR, 'utf8'));
const zname = new Set((reg.pravidla || []).map(x => x.hash));
const nove = ted.filter(x => !zname.has(x.hash));
const zmizele = (reg.pravidla || []).filter(x => !ted.some(y => y.hash === x.hash));

if (!nove.length) {
  console.log('  OK    ' + ted.length + ' instrukcnich radek promptu, vsechny zaregistrovane'
    + '  (verze ' + VERZE + ', registr z ' + reg.zapsano + ')');
  if (zmizele.length) console.log('       ℹ  ' + zmizele.length + ' radek z registru uz v promptu neni (smazane nevadi, jen registr zestarl)');
  process.exit(0);
}
console.log('  ' + nove.length + ' NEZAREGISTROVANYCH instrukcnich radek promptu:');
nove.slice(0, 12).forEach(x => console.log('       [' + x.lang + ' ' + x.zdroj + '] ' + x.text.slice(0, 96)));
if (nove.length > 12) console.log('       … a dalsich ' + (nove.length - 12));
console.log('       -> Nova nebo zmenena radka nebyla proverena proti ostatnim. Prectete ji vedle');
console.log('          zakazu, kterych se tyka (napr. _noColdRead, _describeRule, delka), a teprve');
console.log('          pak zaregistrujte: node scripts/verify_prompt_rules_registry.js --zapis');
process.exit(1);
