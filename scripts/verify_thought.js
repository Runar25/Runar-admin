// ㉱ MYŠLENKA ✦ NA KONEC ČTENÍ — kdo ji dostane, z jaké runy, a že se oddělí od textu čtení (a tím od hlasu).
//
// PROC (2026-09-30, KUKY „nasaď to“, „myšlenka je bez hlasu“): řádek ✦ je jen pro tarif s TIERS.*.reading_thought (Standard,
// Premium, admin) a jen pro single / Kříž / Norny. Model ho píše za JSON pole i dovnitř posledního textu — parser (zrcadlo serveru)
// ho přilepí k čtení, takže bez _splitThought by skončil v textu i v hlasu. Tady se protlačí produkční funkce (§19):
// _thoughtAllowed / _thoughtFor vyříznuté z runar-reading.js, _parseSegments + _splitThought z runar-character.js.
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = path.join(__dirname, '..', 'v2') + path.sep;
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
const src = fs.readFileSync(D + 'runar-reading.js', 'utf8');
const vyrizni = (jm) => { const i = src.indexOf('\nfunction ' + jm + '('); if (i === -1) throw new Error(jm + ' v runar-reading.js není');
  const j = src.indexOf('\nfunction ', i + 1); return src.slice(i, j === -1 ? undefined : j); };
const zdrojVar = (src.match(/\nvar _THOUGHT_SOURCE = [^\n]*\n/) || [''])[0];
if (!zdrojVar) { console.log('FAIL  _THOUGHT_SOURCE v runar-reading.js chybí'); process.exit(1); }
vm.runInContext('var currentUser = null, userTier = "", lang = "en";\n' + zdrojVar + vyrizni('_thoughtAllowed') + '\n' + vyrizni('_thoughtFor'), S);
const R = vm.runInContext('RUNES', S), UI = vm.runInContext('UI_TEXT', S), MARK = vm.runInContext('THOUGHT_MARK', S);
const ADMIN = (vm.runInContext('typeof ADMIN_EMAILS !== "undefined" ? ADMIN_EMAILS : []', S) || [])[0];
const runa = (n) => R.find((r) => r.n === n);
const vady = [];
const ocek = (jm, podm, detail) => { if (!podm) vady.push(jm + (detail ? ' — ' + detail : '')); };
// 1) oddělení řádku ✦ (obě podoby, jak je model píše) + bez ✦ beze změny
const pripady = [
  ['za polem', '[{"rune":"Uruz","text":"The bull walks on. Uruz is strength."}]\n✦ What would you attempt?'],
  ['v posledním textu', '[{"rune":"Uruz","text":"The bull walks on. Uruz is strength.\\n✦ What would you attempt?"}]'],
  ['spread', '[{"rune":"Nauthiz","text":"A."},{"rune":"Tiwaz","text":"B."},{"rune":"Perth","text":"C."}]\n✦ What might remain unknown to you?'],
];
for (const [jm, raw] of pripady) {
  const seg = S._parseSegments(raw), sp = S._splitThought(seg.reading, seg.segs);
  ocek('split ' + jm + ': myšlenka', sp.thought && sp.thought.indexOf('✦') === -1 && /\?$/.test(sp.thought), JSON.stringify(sp.thought));
  ocek('split ' + jm + ': text bez ✦', sp.reading.indexOf('✦') === -1 && sp.segs.every((x) => x.text.indexOf('✦') === -1), sp.reading.slice(-40));
  ocek('split ' + jm + ': segmenty zůstaly', sp.segs.length === seg.segs.length);
}
const bez = S._splitThought('Plain reading.', [{ rune: 'Isa', text: 'Plain reading.' }]);
ocek('bez ✦ beze změny', bez.reading === 'Plain reading.' && bez.thought === '');
// 2) kdo ji dostane
const stav = (tier, email) => vm.runInContext('currentUser = ' + (email ? '{ email: ' + JSON.stringify(email) + ', id: "x" }' : 'null') + '; userTier = ' + JSON.stringify(tier) + ';', S);
for (const [tier, email, ma] of [['', null, false], ['free_trial', 'a@example.com', false], ['rune_seeker', 'a@example.com', false],
                                   ['standard', 'a@example.com', true], ['premium', 'a@example.com', true], ['rune_seeker', ADMIN, true]]) {
  stav(tier, email);
  const t = S._thoughtFor('SINGLE', [runa('Uruz')], 'en');
  ocek('tarif ' + (tier || 'nepřihlášený') + (email === ADMIN ? ' (admin)' : ''), !!t === ma, t ? 'má' : 'nemá');
}
// 3) z jaké runy a u kterých druhů (tarif Premium)
stav('premium', 'a@example.com');
const pet = ['Blank', 'Tiwaz', 'Perth', 'Ingwaz', 'Sowilo'].map(runa), tri = ['Nauthiz', 'Tiwaz', 'Perth'].map(runa);
for (const L of ['en', 'is']) {
  vm.runInContext('lang = "' + L + '"', S);
  const zdroj = (n) => UI[L].coll_rune[n][0];
  const s1 = S._thoughtFor('SINGLE', [runa('Uruz')], L), k = S._thoughtFor('KRIZ', pet, L), n = S._thoughtFor('NORNS', tri, L);
  ocek(L + ' single: zdroj = tažená runa', s1.indexOf(MARK[L]) === 0 && s1.indexOf(zdroj('Uruz')) !== -1);
  ocek(L + ' Kříž: zdroj = střed', k.indexOf(zdroj('Blank')) !== -1 && k.indexOf(zdroj('Sowilo')) === -1);
  ocek(L + ' Norny: zdroj = Skuld', n.indexOf(zdroj('Perth')) !== -1 && n.indexOf(zdroj('Nauthiz')) === -1);
  ocek(L + ' Podkova / Yggdrasil bez myšlenky', !S._thoughtFor('HORSESHOE', pet.concat(tri), L) && !S._thoughtFor('YGGDRASIL', pet.concat(tri), L));
  // _promptDraws pozná, že prompt myšlenku nesl
  ocek(L + ' _promptDraws.thought', (S._promptDraws('X\n' + s1, L) || {}).thought === 1);
}
// 4) zapojení v toku čtení (funkce výš jsou vyříznuté, tyhle řádky ne): prompt, oddělení, vykreslení MIMO výstup (hlas ho nečte)
for (const [jm, kus] of [['single prompt', "var _thL = _thoughtFor('SINGLE', [drawn], lang); if (_thL) prompt += '\\n' + _thL;"],
                          ['spread prompt', "var _thS = _thoughtFor(o.kind, o.runes, lang); if (_thS) prompt += '\\n' + _thS;"],
                          ['single split + kresba', "_paintThought('out-short', _th.thought);"],
                          ['spread split + kresba', "_paintThought(o.outId, _thX.thought);"],
                          ['soused výstupu, ne uvnitř', "kotva.after(el);"]])
  ocek('runar-reading.js: ' + jm, src.indexOf(kus) !== -1);
if (vady.length) { vady.forEach((v) => console.log('FAIL  ' + v)); console.log('CELKEM ' + vady.length + ' vad v myšlence ✦'); process.exit(1); }
console.log('OK    myšlenka ✦: jen Standard/Premium/admin, single·Kříž·Norny se správnou zdrojovou runou (EN+IS), oddělená od textu a hlasu');
