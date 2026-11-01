// ㉰ ZAMČENÝ ASK + JMÉNA TARIFŮ V ISLANDSKÝCH VĚTÁCH — protlačeno produkčními funkcemi (§19).
//
// PROC (2026-09-30): (1) KUKY: „Rune Seeker → Standard, a u Standard má druhou, kterou Premium odemyká“ — po poslední povolené
// otázce musí stát, který tarif otevírá další; dřív pole jen zmizelo. (2) IS lákací věty dosazovaly jméno tarifu v 1. pádě
// i po předložce („opnast með Vegfarandi“; korpus „með vegfaranda“ 7 × „með vegfarandi“ 0) — is-grammar-qa to nevidí, takže to
// hlídá tahle kontrola: pády bydlí v TIERS.*.label_is_dat/_acc a do vět je dává tierLabel().
// (3) 2026-11-01 (owner, náhled teaserů docs/inbox/2026-11-01-teasery.html body 1–2): zamčený Ask má živé pole a ASK; po ASK se model
// NEvolá a rozzáří se závoj s účtem, který otázku otevře — protlačeno skutečným askRunar() (bod 6 níž), ne tvarem kódu.
// SLEPÉ MÍSTO (dokázané mutací 2026-09-30): větev `!vt` v _refreshAskTeaser (nejvyšší tarif, teaser viditelný) je pojistka —
// v dnešních stavech na ni nic nedojde (Premium teaser nikdy neukáže), takže ji tahle kontrola nevidí.
const fs = require('fs'), vm = require('vm'), path = require('path');
const D = path.join(__dirname, '..', 'v2') + path.sep;
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
const EL = {};
// Stub = jen to, co funkce používají; teaser má výchozí display:none jako v runar-reader.html. after(x) si zapamatuje, KDO přišel za mě.
const el = (id) => EL[id] || (EL[id] = { id, textContent: '', style: { display: id === 'ask-teaser' ? 'none' : '' }, after(x) { this._za = x.id; } });
S.document = { getElementById: el, querySelectorAll: () => [], querySelector: () => null };
S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
S.sessionStorage = { _d: {}, getItem(k) { return k in this._d ? this._d[k] : null; }, setItem(k, v) { this._d[k] = String(v); }, removeItem(k) { delete this._d[k]; } };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
const src = fs.readFileSync(D + 'runar-reading.js', 'utf8');
const vyrizni = (jm) => { const i = src.indexOf('\nfunction ' + jm + '('); if (i === -1) throw new Error(jm + ' v runar-reading.js není');
  const j = src.indexOf('\nfunction ', i + 1); return src.slice(i, j === -1 ? undefined : j); };
// askRunar je async — vyříznutý celý až po další funkci; model a okno cesty jsou počítadla (model se v zamčeném Asku volat NESMÍ).
const askRunarSrc = (() => { const i = src.indexOf('\nasync function askRunar('); if (i === -1) throw new Error('askRunar v runar-reading.js není');
  const j = src.indexOf('\nfunction ', i + 1); return src.slice(i, j === -1 ? undefined : j); })();
vm.runInContext('var currentUser = null, userTier = "", lang = "en", _askCount = 0, _lastReadingId = "r1", readerTexts = {};\n'
  + 'var _volano = 0, _zav = []; function callProxy() { _volano++; return {}; } function openJourney() {}\n'
  + ['_askLimit', '_askVyssiTarif', '_refreshAskTeaser', '_showAskMoreTeaser', '_askZavoj', '_askCeka'].map(vyrizni).join('\n') + askRunarSrc, S);
// závoj z runar-utils.js staví DOM — tady jen záznam, co se mu předalo (kotva, věta, tlačítko, rozzářit)
vm.runInContext('zavoj = function (id, kotva, text, tl, akce, svit) { _zav.push({ id: id, kotva: kotva && kotva.id, text: text, tl: tl, svit: svit }); };', S);
const T = vm.runInContext('TIERS', S), UI = vm.runInContext('UI_TEXT', S);
const vady = [];
const ocek = (jm, a, b) => { if (a !== b) vady.push(jm + ': „' + a + '“ ≠ „' + b + '“'); };
// 1) pády jako data + tierLabel
for (const k of ['free_trial', 'rune_seeker', 'standard', 'premium'])
  if (!T[k].label_is_dat || !T[k].label_is_acc) vady.push(k + ': chybí label_is_dat / label_is_acc');
ocek('tierLabel standard IS 3. p.', S.tierLabel('standard', 'is', 'dat'), T.standard.label_is_dat);
ocek('tierLabel premium EN', S.tierLabel('premium', 'en', 'dat'), T.premium.label);
ocek('tierLabel bez pádu', S.tierLabel('standard', 'is'), T.standard.label_is);
// 2) stavy Asku: kdo co uvidí
const stav = (tier, L, pocet) => {
  vm.runInContext('currentUser = { email: "tester@example.com", id: "x" }; userTier = "' + tier + '"; lang = "' + L + '"; _askCount = ' + pocet + ';', S);
  for (const k of Object.keys(EL)) delete EL[k];
  const t = el('ask-teaser');
  if (pocet === 0) { t.style.display = S._askLimit() === 0 ? '' : 'none'; S._refreshAskTeaser(); }
  else S._showAskMoreTeaser(el('ask-answer'));
  return { text: t.style.display === 'none' ? '(skryto)' : t.textContent, pod: (EL['ask-answer'] || {})._za === 'ask-teaser' ? 'ask-answer' : undefined };
};
const nejnizsi = ['standard', 'premium'].find((k) => T[k].asks_per_reading > 0);
for (const L of ['en', 'is']) {
  const lab = (k) => (L === 'is' ? T[k].label_is_dat : T[k].label);
  const s0 = stav('rune_seeker', L, 0);
  ocek(L + ' Rune Seeker', s0.text, UI[L].ask_teaser.split('{tier}').join(lab(nejnizsi)));
  const vyssi = ['standard', 'premium'].find((k) => T[k].asks_per_reading > T.standard.asks_per_reading);
  const s1 = stav('standard', L, T.standard.asks_per_reading);
  if (vyssi) { ocek(L + ' Standard po poslední otázce', s1.text, UI[L].ask_teaser_more.split('{tier}').join(lab(vyssi)));
    ocek(L + ' Standard: teaser pod odpovědí', s1.pod, 'ask-answer'); }
  const s2 = stav('premium', L, T.premium.asks_per_reading);
  ocek(L + ' Premium po poslední otázce', s2.text, '(skryto)');
}
// 3) IS věty s předložkou před {tier} nesmí dostat 1. pád — protlačeno tp() s tím, co dosazuje kód
const isV = (k, pad) => S.tp(k, { count: 7, tier: S.tierLabel('standard', 'is', pad) });
vm.runInContext('lang = "is"', S);
// 2026-11-01: q_teaser zrušen (mrtvý), věta deníku o vyšším účtu přešla do závoje (journal_zavoj, „opnast með“ = 3. pád jako ostatní)
for (const tier of ['standard', 'rune_seeker'])
  for (const [k, pad] of [['ask_teaser', 'dat'], ['ask_teaser_more', 'dat'], ['ask_zavoj', 'dat'], ['journal_zavoj', 'dat'], ['tree_visitor_read', 'dat']]) {
    const v = S.tp(k, { count: 7, tier: S.tierLabel(tier, 'is', pad) }), jm1 = T[tier].label_is;
    if (v.indexOf(jm1 + ' ') !== -1 || v.indexOf(jm1 + '.') !== -1 || v.indexOf(jm1 + '<') !== -1)
      vady.push('IS ' + k + ': jméno tarifu v 1. pádě — „' + v.slice(0, 70) + '…“');
  }
// 4) kód, který ty věty plní, opravdu volá tierLabel se správným pádem (jinak by bod 3 testoval jen data)
const jr = fs.readFileSync(D + 'runar-journal.js', 'utf8'), tr = fs.readFileSync(D + 'runar-tree.js', 'utf8');
for (const [soub, txt, vzor] of [['runar-reading.js', src, "tp('ask_zavoj', { tier: tierLabel(vt, lang, 'dat') })"],
    ['runar-reading.js', src, "tp('ask_teaser_more', { tier: tierLabel(vt, lang, 'dat') })"],
    ['runar-journal.js', jr, "tp('journal_zavoj', { tier: tierLabel('standard', lang, 'dat') })"],
    ['runar-tree.js', tr, "tp('tree_visitor_read', { tier: tierLabel('rune_seeker', lang, 'dat') })"]])
  if (txt.indexOf(vzor) === -1) vady.push(soub + ': věta závoje bez tierLabel(…, \'dat\') — ' + vzor);
// 5) tok Asku: po poslední povolené otázce se teaser opravdu volá (funkce výš jsou vyříznuté, tenhle řádek ne)
if (src.indexOf('if (!dalsi) _showAskMoreTeaser(') === -1) vady.push('runar-reading.js: po poslední otázce se _showAskMoreTeaser nevolá');
// 6) závoj zamčeného Asku (2026-11-01): skutečné askRunar() s napsanou otázkou — model se nezavolá, závoj nese správnou větu a tlačítko,
//    otázka čeká v sessionStorage. Očekávané texty skládá kontrola z dat (UI_TEXT, TIERS), ne produkční funkcí.
const zavojAsku = (tier, L, pocet, otazka) => {
  vm.runInContext('currentUser = { email: "tester@example.com", id: "x" }; userTier = "' + tier + '"; lang = "' + L + '"; _askCount = ' + pocet + '; _zav = []; _volano = 0;', S);
  for (const k of Object.keys(EL)) delete EL[k];
  S.sessionStorage._d = {};
  el('ask-input').value = otazka; el('ask-teaser').style.display = '';   // řádek pod polem svítí (Seeker od začátku, Walker po poslední otázce)
  S.askRunar();
  return { z: vm.runInContext('_zav', S), volano: vm.runInContext('_volano', S), ceka: S.sessionStorage.getItem('runar_ask_ceka'), teaser: el('ask-teaser').style.display };
};
for (const L of ['en', 'is']) {
  const dat = (k) => (L === 'is' ? T[k].label_is_dat : T[k].label), krok = (k) => UI[L].journey_walk_on.split('{tier}').join((L === 'is' ? T[k].label_is : T[k].label).toUpperCase()) + ' →';
  const a = zavojAsku('rune_seeker', L, 0, 'What does the light ask of me?');
  if (a.volano) vady.push(L + ' Rune Seeker: zamčený Ask zavolal model');
  if (a.z.length !== 1) vady.push(L + ' Rune Seeker: po ASK závoj ' + a.z.length + '×, čekán 1×');
  else { ocek(L + ' Rune Seeker závoj: věta', a.z[0].text, UI[L].ask_zavoj.split('{tier}').join(dat(nejnizsi)));
    ocek(L + ' Rune Seeker závoj: tlačítko', a.z[0].tl, krok(nejnizsi)); ocek(L + ' Rune Seeker závoj: rozzářený', a.z[0].svit, true);
    ocek(L + ' Rune Seeker závoj: pod řádkem ask_teaser', a.z[0].kotva, 'ask-teaser'); }
  if (!a.ceka || JSON.parse(a.ceka).q !== 'What does the light ask of me?') vady.push(L + ' Rune Seeker: otázka ze závoje se neuložila (' + a.ceka + ')');
  const prazdna = zavojAsku('rune_seeker', L, 0, '   ');
  if (prazdna.z.length || prazdna.volano) vady.push(L + ' Rune Seeker: prázdné pole po ASK rozzářilo závoj / volalo model');
  const vyssi = ['standard', 'premium'].find((k) => T[k].asks_per_reading > T.standard.asks_per_reading);
  if (vyssi) {
    const b = zavojAsku('standard', L, T.standard.asks_per_reading, 'And what now?');
    if (b.volano) vady.push(L + ' Standard po poslední otázce: zavolal model');
    if (b.z.length !== 1) vady.push(L + ' Standard po poslední otázce: závoj ' + b.z.length + '×, čekán 1×');
    else { ocek(L + ' Standard závoj: věta', b.z[0].text, UI[L].ask_teaser_more.split('{tier}').join(dat(vyssi)));
      ocek(L + ' Standard závoj: tlačítko', b.z[0].tl, krok(vyssi)); ocek(L + ' Standard závoj: pod polem', b.z[0].kotva, 'ask-input-wrap');
      ocek(L + ' Standard: řádek pod polem ustoupí závoji', b.teaser, 'none'); }
  }
  const c = zavojAsku('premium', L, T.premium.asks_per_reading, 'More?');
  if (c.z.length || c.volano) vady.push(L + ' Premium po poslední otázce: závoj / model (nejvyšší účet nemá kam postoupit)');
}
if (vady.length) { vady.forEach((v) => console.log('FAIL  ' + v)); console.log('CELKEM ' + vady.length + ' vad v zamčeném Asku / pádech tarifů'); process.exit(1); }
console.log('OK    zamčený Ask: Rune Seeker → ' + T[nejnizsi].label + ', Standard po otázce → další tarif, Premium nic; po ASK závoj bez volání modelu; IS jména tarifů v pádu (EN+IS)');
