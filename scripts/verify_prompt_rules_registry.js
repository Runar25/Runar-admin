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
  const DATA = /^(PERSON|DRAWN|SEEKER|LIFE|AREA|SEEKING|INTENTION|QUESTION|REALM|ELEMENT|FOCUS|Leiðandi|LífsRúna|Svið|Leiðin|Spurning|RÚNIN|Rúnir|DREGNA|ÁHERSLA)/;
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
    S.buildAskPrompt('A reading.', 'What do you mean?', RUNES[3].n, L, null).split(String.fromCharCode(10))
      .forEach(r => pridej(L, 'ask', r));
    S.buildSysPrompt(null, L).split(String.fromCharCode(10)).forEach(r => pridej(L, 'system', r));
  }
  // Dedup: prvni vyskyt vyhrava, proto jsou pooly nahore.
  const videl = new Set();
  return ven.filter(x => {
    const k = x.lang + '|' + x.text.slice(0, 60);
    if (videl.has(k)) return false;
    videl.add(k); return true;
  });
}

const otisk = (t) => crypto.createHash('sha1').update(t, 'utf8').digest('hex').slice(0, 12);
const ted = pravidla().map(x => ({ ...x, hash: otisk(x.text) }));

if (ZAPIS) {
  const dnes = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(REGISTR, JSON.stringify({
    poznamka: 'Otisky instrukcnich radek promptu. Zmena = kontrola ㉜ zcervena, dokud ji nekdo vedome nezaregistruje (--zapis). Nehodnoti vyznam, vynucuje pozornost.',
    zapsano: dnes,
    pravidla: ted.map(x => ({ hash: x.hash, lang: x.lang, zdroj: x.zdroj, zacatek: x.text.slice(0, 70) })),
  }, null, 1));
  console.log('  zapsano ' + ted.length + ' pravidel do ' + path.relative(REPO, REGISTR));
  process.exit(0);
}

if (!fs.existsSync(REGISTR)) {
  console.log('  ⚠  registr neexistuje — spust `node scripts/verify_prompt_rules_registry.js --zapis`');
  process.exit(1);
}
const reg = JSON.parse(fs.readFileSync(REGISTR, 'utf8'));
const zname = new Set((reg.pravidla || []).map(x => x.hash));
const nove = ted.filter(x => !zname.has(x.hash));
const zmizele = (reg.pravidla || []).filter(x => !ted.some(y => y.hash === x.hash));

if (!nove.length) {
  console.log('  OK    ' + ted.length + ' instrukcnich radek promptu, vsechny zaregistrovane (registr z ' + reg.zapsano + ')');
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
