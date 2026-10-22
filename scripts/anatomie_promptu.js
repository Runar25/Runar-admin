// anatomie_promptu.js — Z ČEHO SE SKLÁDÁ KAŽDÉ ČTENÍ: pro každý druh (jedna runa, čtyři výklady, Ask, životní runa, rozbor jména,
// systémový prompt) vypíše kusy promptu v pořadí, v jakém je model dostane — co kus přidalo (vstup), na kterou větu čtení míří, KDY v promptu
// je (vždy / jen s oblastí / jen bez otázky…), jestli se losuje (kolik různých znění v 20 tazích) a kolik má slov. EN i IS.
//
// Proč (owner 2026-10-22): „důležité je vědět přesně, z čeho se skládá čtení pro každou část čtení — runové čtení, Ask, životní runa atd.
// Přesně vědět, co do něj chodí … ne hádat, ale vědět“ a „máme AREA, SEEKING, INTENTION a další vstupy — na to nezapomeň“. Krok 3 plánu
// schváleného „10. ano 11. ano“ (krok 2 = kusy _kus v runar-character.js, b12697a).
//
// Jak: produkční soubory appky v izolovaném kontextu (jako verify_thought.js), kusy z _skladba (runar-character.js). Podmínka kusu = pustí se
// prázdný vstup, pak každý vstup zvlášť zapnutý, pak všechny naráz. Los = 20 tahů s pevnými semínky. Appka po builderu přidá myšlenku ✦
// a připomínku délky (runar-reading.js, single ř. ~323); obojí se tu skládá STEJNÝMI funkcemi (_thoughtFor vyříznutá z runar-reading.js,
// _lengthReminder z runar-utils.js) a pořadím, které kontrola níž ověří proti zdroji.
// Hranice: anatomie popisuje PROMPT, ne to, co z něj model udělá (to je krok 5, rozbor po větách). Ask „vstup čtení“ je zástupný text.
// Výstup nese text promptu (žádná data uživatelů) — jde mimo repo: prompt bydlí v kódu (§20), tohle je jeho generovaný pohled.
//
//   node scripts/anatomie_promptu.js [--vystup <cesta>]        výchozí %TEMP%\runar_anatomie_promptu_<datum>.md
//   node scripts/anatomie_promptu.js --test                       kontrola: každý řádek každého promptu patří kusu, text = builder
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path'), os = require('os');
const D = path.join(__dirname, '..', 'v2') + path.sep;
const arg = (k, d) => { const i = process.argv.indexOf(k); return i !== -1 ? process.argv[i + 1] : d; };

// ── kontext appky ──
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
const READ = fs.readFileSync(D + 'runar-reading.js', 'utf8');
const vyrizni = (jm) => { const i = READ.indexOf('\nfunction ' + jm + '('); if (i === -1) throw new Error(jm + ' v runar-reading.js není');
  const j = READ.indexOf('\nfunction ', i + 1); return READ.slice(i, j === -1 ? undefined : j); };
const zdrojVar = (READ.match(/\nvar _THOUGHT_SOURCE = [^\n]*\n/) || [''])[0];
const ADMIN = (vm.runInContext('ADMIN_EMAILS', S) || [])[0];
vm.runInContext('var currentUser = null, userTier = "", userGender = "hk", lang = "en";\n' + zdrojVar + vyrizni('_thoughtAllowed') + '\n' + vyrizni('_thoughtFor')
  + '\nvar __semeno = 1; Math.random = function () { __semeno |= 0; __semeno = (__semeno + 0x6D2B79F5) | 0; var t = Math.imul(__semeno ^ (__semeno >>> 15), 1 | __semeno);'
  + ' t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };', S);
const G = (x) => vm.runInContext(x, S);
const RUNES = G('RUNES'), AREAS = G('AREAS'), SEEKS = G('SEEKS'), INTENTIONS = G('INTENTIONS');
const R = (n) => RUNES.find((r) => r.n === n);

// Doplňky appky za builderem: runar-reading.js tyto řádky skládá přesně takhle (ověřuje --test proti zdroji).
const DOPLNEK_SINGLE = ["var _thL = _kus('THOUGHT-✦'", "var _dR = _kus('LENGTH-REMINDER'"];
function sAppkou(kind, fn, args, runes, L) {
  return function () {
    var p = fn.apply(null, args);
    var th = G('_kus')('THOUGHT-✦', 'account (reading_thought)', '✦ line', G('_thoughtFor')(kind, runes, L)); if (th) p += '\n' + th;
    if (kind === 'SINGLE') { var dr = G('_kus')('LENGTH-REMINDER', 'fixed', 'whole', G('_lengthReminder')(L)); if (dr) p += '\n' + dr; }
    return p;
  };
}

// ── druhy čtení: vstupy (prázdný / vyplněný) a jak se prompt sestaví ──
const SPREADY = { norns: ['NORNS', 'buildNornsPrompt', ['Fehu', 'Isa', 'Perth']], kriz: ['KRIZ', 'buildKrizPrompt', ['Fehu', 'Uruz', 'Isa', 'Perth', 'Algiz']],
  horseshoe: ['HORSESHOE', 'buildHorseshoePrompt', ['Fehu', 'Uruz', 'Isa', 'Perth', 'Algiz', 'Sowilo', 'Tiwaz']],
  yggdrasil: ['YGGDRASIL', 'buildYggdrasilPrompt', ['Fehu', 'Uruz', 'Isa', 'Perth', 'Algiz', 'Sowilo', 'Tiwaz', 'Berkana', 'Ehwaz']] };
const uVstupy = (L, sZamerem) => Object.assign({
  name: ['', 'Anna'], area: ['', AREAS[L][0]], seeking: ['', SEEKS[L][1]], question: ['', L === 'is' ? 'Heldur þetta?' : 'Will it hold?'],
}, sZamerem ? { intention: ['', INTENTIONS[L][1]] } : {});
const UCET = { ucet: [null, 'premium'] };   // účet: nepřihlášený / Premium (myšlenka ✦)
const ROD = { rod: ['hk', 'kvk'] };          // oslovení v IS (hk = výchozí)
function nastavUcet(v) { G('currentUser = ' + (v ? JSON.stringify({ email: ADMIN }) : 'null') + '; userTier = ' + JSON.stringify(v || '')); }

const DRUHY = [
  { id: 'single', jm: 'Jedna runa', vstupy: (L) => Object.assign(uVstupy(L, true), UCET, ROD),
    sloz: (v, L) => sAppkou('SINGLE', G('buildReadingPrompt'), [{ name: v.name, area: v.area, seeking: v.seeking, question: v.question, intention: v.intention }, R('Perth'), L, []], [R('Perth')], L) },
].concat(Object.keys(SPREADY).map((k) => ({ id: k, jm: { norns: 'Norny', kriz: 'Kompas (Kříž)', horseshoe: 'Podkova', yggdrasil: 'Yggdrasil' }[k],
  vstupy: (L) => Object.assign(uVstupy(L, false), UCET, ROD),
  sloz: (v, L) => { const r = SPREADY[k][2].map(R); return sAppkou(SPREADY[k][0], G(SPREADY[k][1]), [{ name: v.name, area: v.area, seeking: v.seeking, question: v.question }, r, L, []], r, L); } })))
.concat([
  { id: 'ask', jm: 'Ask (otázka ke čtení)', vstupy: (L) => ({
      aspekt: ['', L === 'is' ? 'hið hulda kemur í ljós' : 'the hidden coming to light'],
      predchozi: [null, [{ q: L === 'is' ? 'Hvað felur Perth?' : 'What does Perth hide?', a: L === 'is' ? 'Það sem bíður.' : 'What waits.', lang: L }]],
      zivotni: [null, 'Isa'], zadani: [null, 'ano'], vyklad: [null, 'norns'], dvergar: ['', 'ano'], rod: ['hk', 'kvk'] }),
    sloz: (v, L) => () => G('buildAskPrompt')('READING TEXT (the reading the person got).',
      (v.dvergar ? (L === 'is' ? 'Hver er dvergurinn?' : 'Who is the dwarf?') : (L === 'is' ? 'Hvað þýðir þetta fyrir mig?' : 'What does this mean for me?')),
      v.vyklad ? 'Fehu, Isa, Perth' : 'Perth', L, [], v.zivotni ? R(v.zivotni) : null,
      v.zadani ? { area: AREAS[L][0], seeking: SEEKS[L][1], intention: INTENTIONS[L][1], question: L === 'is' ? 'Heldur þetta?' : 'Will it hold?' } : null,
      v.vyklad ? { mode: 'norns', runy: ['Fehu', 'Isa', 'Perth'] } : null, v.aspekt, v.predchozi) },
  { id: 'life', jm: 'Životní runa', vstupy: (L) => ({ name: ['', 'Anna'], rok: [null, 1990], rod: ['hk', 'kvk'] }),
    sloz: (v, L) => () => G('buildLifeRunePrompt')(v.name, R('Perth'), 5, 3, v.rok, L, []) },
  { id: 'name', jm: 'Rozbor jména', vstupy: (L) => ({ zaznam: [null, { root: 'arn + björg', en: 'eagle + help', is: 'örn + hjálp' }], rod: ['hk', 'kvk'] }),
    sloz: (v, L) => () => G('buildNameLorePrompt')('Arnbjörg', v.zaznam, L, []) },
  { id: 'sys', jm: 'Systémový prompt (charakter + hlas; jde ke každému volání)', vstupy: () => ({}),
    sloz: (v, L) => () => G('buildSysPrompt')(null, L) },
]);

function postav(druh, v, L, semeno) {
  G('lang = ' + JSON.stringify(L) + '; __semeno = ' + (semeno | 0) + '; userGender = ' + JSON.stringify(v.rod || 'hk'));
  nastavUcet(v.ucet);
  return G('_skladba')(druh.sloz(v, L), []);
}
const klice = (kusy) => { const n = {}; return kusy.map((k) => { n[k.kus] = (n[k.kus] || 0) + 1; return k.kus + (n[k.kus] > 1 ? ' #' + n[k.kus] : ''); }); };
const slov = (t) => (String(t).match(/\S+/g) || []).length;

function rozbor(druh, L) {
  const V = druh.vstupy(L), jmena = Object.keys(V);
  const prazdne = {}, plne = {};
  jmena.forEach((k) => { prazdne[k] = V[k][0]; plne[k] = V[k][1]; });
  const vPrazdnem = new Set(klice(postav(druh, prazdne, L, 1).kusy));
  const sVstupem = {}, bezVstupu = {};
  for (const k of jmena) {
    const v = Object.assign({}, prazdne, { [k]: V[k][1] });
    const ks = new Set(klice(postav(druh, v, L, 1).kusy));
    ks.forEach((x) => { if (!vPrazdnem.has(x)) (sVstupem[x] = sVstupem[x] || []).push(k); });
    vPrazdnem.forEach((x) => { if (!ks.has(x)) (bezVstupu[x] = bezVstupu[x] || []).push(k); });
  }
  const tahy = [];
  for (let s = 1; s <= 20; s++) tahy.push(postav(druh, plne, L, s * 7919));
  const plny = tahy[0];
  const znen = {};
  for (const t of tahy) { const kk = klice(t.kusy); t.kusy.forEach((x, i) => { (znen[kk[i]] = znen[kk[i]] || new Set()).add(x.text); }); }
  const radky = [], videno = new Set();
  const poradi = klice(plny.kusy).map((k, i) => [k, plny.kusy[i]]);
  for (const x of vPrazdnem) if (!poradi.some(([k]) => k === x)) {   // kus, který se s vyplněným vstupem ztratí (např. NO-QUESTION)
    const t = postav(druh, prazdne, L, 1); const kk = klice(t.kusy); const i = kk.indexOf(x); poradi.splice(Math.min(i, poradi.length), 0, [x, t.kusy[i]]);
  }
  for (const [k, kus] of poradi) {
    if (videno.has(k)) continue; videno.add(k);
    const kdy = vPrazdnem.has(k) ? (bezVstupu[k] ? 'jen bez: ' + bezVstupu[k].join(', ') : 'vždy')
      : (sVstupem[k] ? 's: ' + sVstupem[k].join(' / ') : 'jen s více vstupy naráz');
    const n = znen[k] ? znen[k].size : 1;
    radky.push({ k, vstup: kus.vstup, veta: kus.veta, kdy, los: n > 1 ? n + ' / 20' : 'pevný', slov: slov(kus.text), text: kus.text });
  }
  return { radky, plny, jmena, slovCelkem: slov(plny.text) };
}

// ── --test: každý řádek patří kusu, text kusů = builder, doplňky appky stojí ve zdroji ──
if (process.argv.includes('--test')) {
  const vady = [];
  DOPLNEK_SINGLE.forEach((x) => { if (READ.indexOf(x) === -1) vady.push('runar-reading.js: doplněk se změnil, anatomie ho skládá jinak než appka — „' + x + '“'); });
  for (const L of ['en', 'is']) for (const d of DRUHY) for (const plne of [false, true]) {
    const V = d.vstupy(L), v = {}; Object.keys(V).forEach((k) => { v[k] = V[k][plne ? 1 : 0]; });
    const r = postav(d, v, L, 3);
    G('__semeno = 3'); const holy = d.sloz(v, L)();
    if (holy !== r.text) vady.push(L + ' ' + d.id + ': text rozboru ≠ text builderu');
    const pokryte = r.kusy.map((k) => k.text).join('\n');
    const nep = r.text.split('\n').map((x) => x.trim()).filter((x) => x && pokryte.indexOf(x) === -1);
    if (nep.length) vady.push(L + ' ' + d.id + (plne ? ' (vše vyplněno)' : ' (prázdné)') + ': řádek mimo kus — „' + nep[0].slice(0, 80) + '“');
  }
  vady.forEach((x) => console.log('FAIL  ' + x));
  if (!vady.length) console.log('OK    anatomie promptu: ' + DRUHY.length + ' druhů × EN/IS × prázdný/plný vstup — každý řádek patří kusu, text = builder, doplňky appky = zdroj');
  process.exit(vady.length ? 1 : 0);
}

// ── výpis ──
const VYSTUP = arg('--vystup', path.join(os.tmpdir(), 'runar_anatomie_promptu_' + new Date().toISOString().slice(0, 10) + '.md'));
const esc = (t) => String(t).replace(/\|/g, '\\|').replace(/\n/g, ' ⏎ ');
const md = ['# Anatomie promptu — ' + new Date().toISOString().slice(0, 10), '',
  'Generováno z kódu (`node scripts/anatomie_promptu.js`); pravda je kód. Kusy v pořadí, v jakém je model dostane. ' +
  '**Kdy** = při jakém vstupu je kus v promptu (pokus: prázdný vstup, pak každý vstup zvlášť). **Los** = kolik různých znění v 20 tazích ' +
  '(všechny vstupy vyplněné). **Věta** = na kterou větu čtení kus míří. Myšlenku ✦ dostává jen účet s ní (Standard/Premium/admin).', ''];
for (const d of DRUHY) {
  md.push('## ' + d.jm, '');
  for (const L of ['en', 'is']) {
    const r = rozbor(d, L);
    md.push('### ' + L.toUpperCase() + ' — ' + r.radky.length + ' kusů, ' + r.slovCelkem + ' slov se vším vyplněným' + (r.jmena.length ? ' · vstupy: ' + r.jmena.join(', ') : ''), '');
    md.push('| kus | co ho přidá | věta | kdy | los | slov | znění (1. tah) |', '|---|---|---|---|---|---|---|');
    for (const x of r.radky) md.push('| ' + [x.k, x.vstup, x.veta, x.kdy, x.los, x.slov, esc(x.text.length > 220 ? x.text.slice(0, 220) + '…' : x.text)].join(' | ') + ' |');
    md.push('');
  }
}
fs.writeFileSync(VYSTUP, md.join('\n'));
console.log('zapsáno (mimo repo — generovaný pohled na kód):', VYSTUP);
for (const d of DRUHY) { const e = rozbor(d, 'en'), i = rozbor(d, 'is'); console.log(d.id.padEnd(10), 'EN ' + e.radky.length + ' kusů / ' + e.slovCelkem + ' slov · IS ' + i.radky.length + ' kusů / ' + i.slovCelkem + ' slov'); }
