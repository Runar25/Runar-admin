// ㉰ ZAMČENÝ ASK + JMÉNA TARIFŮ V ISLANDSKÝCH VĚTÁCH — protlačeno produkčními funkcemi (§19).
//
// PROC (2026-09-30): (1) KUKY: „Rune Seeker → Standard, a u Standard má druhou, kterou Premium odemyká“ — po poslední povolené
// otázce musí stát, který tarif otevírá další; dřív pole jen zmizelo. (2) IS lákací věty dosazovaly jméno tarifu v 1. pádě
// i po předložce („opnast með Vegfarandi“; korpus „með vegfaranda“ 7 × „með vegfarandi“ 0) — is-grammar-qa to nevidí, takže to
// hlídá tahle kontrola: pády bydlí v TIERS.*.label_is_dat/_acc a do vět je dává tierLabel().
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
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
const src = fs.readFileSync(D + 'runar-reading.js', 'utf8');
const vyrizni = (jm) => { const i = src.indexOf('\nfunction ' + jm + '('); if (i === -1) throw new Error(jm + ' v runar-reading.js není');
  const j = src.indexOf('\nfunction ', i + 1); return src.slice(i, j === -1 ? undefined : j); };
vm.runInContext('var currentUser = null, userTier = "", lang = "en", _askCount = 0;\n'
  + ['_askLimit', '_askVyssiTarif', '_refreshAskTeaser', '_showAskMoreTeaser'].map(vyrizni).join('\n'), S);
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
for (const [k, pad] of [['q_teaser', 'dat'], ['ask_teaser', 'dat'], ['journal_teaser', 'acc'], ['journal_teaser_count', 'acc']]) {
  const v = isV(k, pad);
  if (v.indexOf(T.standard.label_is + ' ') !== -1 || v.indexOf(T.standard.label_is + '.') !== -1 || v.indexOf(T.standard.label_is + '<') !== -1)
    vady.push('IS ' + k + ': jméno tarifu v 1. pádě — „' + v.slice(0, 70) + '…“');
}
// 4) kód, který ty věty plní, opravdu volá tierLabel se správným pádem (jinak by bod 3 testoval jen data)
const app = fs.readFileSync(D + 'runar-app.js', 'utf8'), jr = fs.readFileSync(D + 'runar-journal.js', 'utf8');
if (app.indexOf("tp('q_teaser', { tier: tierLabel('standard', lang, 'dat') })") === -1) vady.push('runar-app.js: q_teaser bez tierLabel(…, \'dat\')');
if (app.indexOf("tp('journal_teaser', { tier: tierLabel('standard', lang, 'acc') })") === -1) vady.push('runar-app.js: journal_teaser bez tierLabel(…, \'acc\')');
if (jr.indexOf("tp('journal_teaser_count', { count: count, tier: tierLabel('standard', lang, 'acc') })") === -1) vady.push('runar-journal.js: journal_teaser_count bez tierLabel(…, \'acc\')');
// 5) tok Asku: po poslední povolené otázce se teaser opravdu volá (funkce výš jsou vyříznuté, tenhle řádek ne)
if (src.indexOf('if (!dalsi) _showAskMoreTeaser(ans);') === -1) vady.push('runar-reading.js: po poslední otázce se _showAskMoreTeaser nevolá');
if (vady.length) { vady.forEach((v) => console.log('FAIL  ' + v)); console.log('CELKEM ' + vady.length + ' vad v zamčeném Asku / pádech tarifů'); process.exit(1); }
console.log('OK    zamčený Ask: Rune Seeker → ' + T[nejnizsi].label + ', Standard po otázce → další tarif, Premium nic; IS jména tarifů v pádu (EN+IS)');
