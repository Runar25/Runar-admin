// ㊱ REGISTER OBRAZŮ — každý řádek RUNE_IMAGES nese platný register D|E|P na indexu 6
// (2026-08-23, handoff Cowork: „kdo sáhne na pool, přeindexuje register" se vynucuje
// strojem, ne pamětí). Kritéria D/E/P vlastní Cowork → RUNAR_DESIGN.md (sekce image-pool).
// Prázdné/neznámé = červená. Aktuální štítky jsou PROVIZORNÍ (CODE-tune dle kritérií,
// 2026-08-23) — Cowork celý pool přeštítkuje svým souborem a provizor přepíše.
const fs = require('fs'), vm = require('vm');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const S = { console: { log() {}, warn() {}, error() {} } };
S.window = S; S.globalThis = S; S.document = { getElementById: () => null };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8'), S);

const IMGS = vm.runInContext('RUNE_IMAGES', S);
let fail = 0;
const poc = { D: 0, E: 0, P: 0 };
for (const row of IMGS) {
  const reg = row[6];
  if (reg !== 'D' && reg !== 'E' && reg !== 'P') {
    fail++;
    console.log('FAIL  ' + row[0] + ' „' + String(row[3]).slice(0, 50) + '…": register "' + reg + '" neni D|E|P');
    continue;
  }
  poc[reg]++;
}
if (!IMGS.length) { fail++; console.log('FAIL  banka prazdna'); }

// ── JADRA (2026-09-19): kazdy radek s jadrem musi mit mista sveho registru — jinak by
// slozeni tise vypadlo. A slozena radka se musi dat ROZLOZIT zpet (_promptDraws: image
// bez mista + place zvlast), jinak mereni obrazu zacne pocitat mista.
{
  const PLACES = vm.runInContext('IMG_PLACES', S);
  const jadra = IMGS.filter(r => r[8] === 'jadro');
  if (!jadra.length) { fail++; console.log('FAIL  zadny radek s jadrem (cekaji se 3 Raidho)'); }
  for (const r of jadra) {
    if (!PLACES[r[6]] || !PLACES[r[6]].length) { fail++; console.log('FAIL  jadro ' + r[0] + ' bez mist registru ' + r[6]); }
  }
  for (const reg of Object.keys(PLACES)) {
    for (const pr of PLACES[reg]) if (!(pr && pr[0] && pr[1])) { fail++; console.log('FAIL  misto registru ' + reg + ' bez IS/EN tvaru'); }
  }
  // Round-trip pres produkcni cteni: veta s mistem -> image + place; bez mista postaru.
  const draws = vm.runInContext('_promptDraws', S);
  const nl = String.fromCharCode(10);
  const dEn = draws('X' + nl + 'IMAGE — the picture in this reading comes from here: a road vanishing round the next bend. Where: a mountain pass. Let it become your own seeing in the text.' + nl + 'Y', 'en');
  const dIs = draws('X' + nl + 'MYND — héðan kemur myndin í þessum lestri: Vegurinn hverfur fyrir næstu beygju. Þetta á sér stað í fjallaskarði. Láttu hana verða að þinni eigin sýn í textanum.' + nl + 'Y', 'is');
  if (!dEn || dEn.place !== 'a mountain pass' || dEn.image !== 'a road vanishing round the next bend') {
    fail++; console.log('FAIL  EN rozklad jadra: ' + JSON.stringify(dEn && { image: dEn.image, place: dEn.place }));
  }
  if (!dIs || dIs.place !== 'í fjallaskarði' || dIs.image !== 'Vegurinn hverfur fyrir næstu beygju') {
    fail++; console.log('FAIL  IS rozklad jadra: ' + JSON.stringify(dIs && { image: dIs.image, place: dIs.place }));
  }
  const dBez = draws('X' + nl + 'IMAGE — the picture in this reading comes from here: The sea gives and takes on the shore. Let it become your own seeing in the text.' + nl + 'Y', 'en');
  if (!dBez || dBez.place !== undefined || dBez.image !== 'The sea gives and takes on the shore') {
    fail++; console.log('FAIL  rozklad bez mista se rozbil: ' + JSON.stringify(dBez && { image: dBez.image, place: dBez.place }));
  }
  if (!fail) console.log('OK    jadra: ' + jadra.length + ' radku, mista registru uplna, rozklad image+place drzi');
}
// ── POSTAVA (2026-09-30): obraz se zvířetem v hlavní roli (index 9 „postava“) dostane HNED ZA OBRAZ pokyn z IMG_POSTAVA —
// single jen „pojmenuj“, Norny „pojmenuj + z jeho strany“ (B2); jiný obraz nic; Cross/Horseshoe/Yggdrasil nic (netestováno).
// Norny mají Skuld jako NIT, ne „kam jdeš ty“. Protlačeno PRODUKČNÍM builderem (§19): řádek se vnutí jako jediný kandidát
// (_runeImageCandidates), příznak nastaví skutečný _seasonalImagery → kontrola vidí VÝSLEDEK v promptu, ne značku v datech.
// Běží přes VŠECH 182 řádků střídavě, takže příznak, který by se nepřepsal, by u dalšího obrazu bez zvířete zčervenal.
// DECISIONS 2026-09-30 (2). Předchůdce (perspektiva B jen v single) stažen 2026-09-29 (2) — nepojmenoval zvíře.
{
  const P = { console: { log() {}, warn() {}, error() {} } }; P.window = P; P.globalThis = P;
  P.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
  const st = {}; P.localStorage = { getItem: (k) => st[k] || null, setItem: (k, v) => { st[k] = v; }, removeItem: (k) => { delete st[k]; } };
  vm.createContext(P);
  for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
    vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', P);
  vm.runInContext('var __s=1;Math.random=function(){__s=(__s*1103515245+12345)%2147483648;return __s/2147483648;};'
    + 'var __vnut=null, __cand=_runeImageCandidates; _runeImageCandidates=function(d,b){ return __vnut ? [__vnut] : __cand(d,b); };', P);
  const IM = vm.runInContext('RUNE_IMAGES', P), RU = vm.runInContext('RUNES', P), POK = vm.runInContext('IMG_POSTAVA', P);
  const post = IM.filter((r) => r[9] === 'postava');
  const sYou = post.filter((r) => /\byou(r)?\b/i.test(r[3]));
  if (!post.length) { fail++; console.log('FAIL  zadny obraz se znackou „postava“'); }
  if (sYou.length) { fail++; console.log('FAIL  „postava“ u obrazu, kde je „you“ (ctenar JE v obraze): ' + sYou.map((r) => r[0]).join(', ')); }
  const u = { name: 'Kuky', area: '', seeking: '', question: '', intention: '' };
  const runa = (n) => RU.find((r) => r.n === n);
  const vady = [];
  for (const L of ['en', 'is']) {
    vm.runInContext('lang="' + L + '"', P);
    const mark = L === 'is' ? 'MYND — ' : 'IMAGE — ';
    const zaObrazem = (p) => { const r = p.split('\n'), i = r.findIndex((l) => l.indexOf(mark) === 0); return i === -1 ? '(bez obrazu)' : r[i + 1]; };
    const J = POK[L].jmenuj, B2 = POK[L].jmenuj + ' ' + POK[L].pohled;
    const nit = L === 'is' ? 'hvert þráðurinn stefnir' : 'where the thread is heading';
    const ty = L === 'is' ? 'hvert þú stefnir' : 'where you are heading';
    const stred = vm.runInContext(L === 'is' ? 'NAME_PLACEMENTS_IS' : 'NAME_PLACEMENTS', P)[0].split('{name}').join(u.name);
    let nStred = 0;   // kolikrát „uprostřed“ padlo u Norn BEZ zvířete — důkaz, že los tu variantu vůbec nabízí (jinak by kontrola nic nehlídala)
    let nPost = 0, nJine = 0;
    for (const row of IM) {
      P.__vnut = row; vm.runInContext('__vnut = this.__vnut;', P);
      const r0 = runa(row[0]); if (!r0) { vady.push(L + ' ' + row[0] + ': runa neexistuje'); continue; }
      const dalsi = RU.filter((r) => r.n !== row[0]).slice(0, 2);
      const sP = P.buildReadingPrompt(u, r0, L, []), nP = P.buildNornsPrompt(u, [r0].concat(dalsi), L, []);
      const ds = P._promptDraws(sP, L) || {}, dn = P._promptDraws(nP, L) || {};
      const jm = row[0] + ' „' + String(row[3]).slice(0, 28) + '…“';
      if (nP.indexOf(ty) !== -1 || nP.split(nit).length - 1 < 3) vady.push(L + ' Norny ' + jm + ': Skuld není nit (štítek + beat + bigInstruction)');
      if (row[9] === 'postava') {
        nPost++;
        if (zaObrazem(sP) !== J || sP.indexOf(POK[L].pohled) !== -1 || ds.postava !== 1) vady.push(L + ' single ' + jm + ': za obrazem „' + String(zaObrazem(sP)).slice(0, 40) + '…“, draws.postava ' + ds.postava);
        if (zaObrazem(nP) !== B2 || dn.postava !== 2) vady.push(L + ' Norny ' + jm + ': za obrazem „' + String(zaObrazem(nP)).slice(0, 40) + '…“, draws.postava ' + dn.postava);
        if (nP.indexOf(stred) !== -1) vady.push(L + ' Norny ' + jm + ': B2 a zároveň „jméno uprostřed“ — odporuje „k tazateli až poslední věta“');
        const ost = [['Cross', P.buildKrizPrompt(u, [r0].concat(RU.filter((r) => r.n !== row[0]).slice(0, 4)), L, [])],
                     ['Horseshoe', P.buildHorseshoePrompt(u, [r0].concat(RU.filter((r) => r.n !== row[0]).slice(0, 6)), L, [])],
                     ['Yggdrasil', P.buildYggdrasilPrompt(u, [r0].concat(RU.filter((r) => r.n !== row[0]).slice(0, 8)), L, [])]];
        for (const [sp, p] of ost) if (p.indexOf(J) !== -1) vady.push(L + ' ' + sp + ' ' + jm + ': pokyn tam je, ale netestován (DECISIONS 2026-09-30 (2): jen single + Norny)');
      } else {
        nJine++;
        if (sP.indexOf(J) !== -1 || nP.indexOf(J) !== -1 || ds.postava !== undefined || dn.postava !== undefined) vady.push(L + ' ' + jm + ': obraz BEZ zvířete, a pokyn v promptu je');
        if (nP.indexOf(stred) !== -1) nStred++;
      }
    }
    if (!nStred) vady.push(L + ' Norny: „jméno uprostřed“ nepadlo ani jednou ani bez zvířete — kontrola B2 × jméno by nic nehlídala');
    P.__vnut = null; vm.runInContext('__vnut = null;', P);
    if (!vady.some((v) => v.indexOf(L + ' ') === 0)) console.log('OK    ' + L + ' postava: ' + nPost + ' obrazu se zviretem → single „pojmenuj“, Norny B2 hned za obrazem a jmeno nikdy uprostred (bez zvirete ' + nStred + '×); ' + nJine + ' jinych bez pokynu; Skuld = nit');
  }
  if (vady.length) { fail += vady.length; vady.slice(0, 12).forEach((v) => console.log('FAIL  ' + v)); if (vady.length > 12) console.log('FAIL  … a dalsich ' + (vady.length - 12)); }
}
console.log(fail === 0
  ? 'OK    register obrazu: ' + IMGS.length + ' radku, vsechny D|E|P  (D ' + poc.D + ' · E ' + poc.E + ' · P ' + poc.P + ')'
  : 'CELKEM ' + fail + ' radku bez platneho registru');
process.exit(fail === 0 ? 0 : 1);
