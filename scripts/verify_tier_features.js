// Výpis featur tierů se SKLÁDÁ z nastavení (TIER_FEATURES + tierFeatures v runar-config.js, 2026-09-26).
//
// KUKY: „chtělo by to dělat tak, abychom to pořád nemuseli dělat manuálně. věci přibývají a odpadají.“ Do té doby byl výpis psaný
// ručně ve dvou kopiích (TIER_LIMITS.*.panel_props a runar-help.html) — obě zastaraly (Yggdrasil jako výhoda Premium, Ceremonial
// mode nepostavený, Ask chyběl, čísla opsaná). Tahle kontrola tvrdí VÝSLEDEK (§19), ne tvar kódu:
//  (1) čísla ve výpisu = čísla v TIERS (měsíční čtení, Asky, deník) v obou jazycích,
//  (2) změna nastavení se do výpisu propíše SAMA (seed: jiný počet Asků / vypnutý Ask → jiná věta / žádná),
//  (3) Premium skládá shodné řádky do „Everything a <Standard> has“ a vypisuje jen rozdíl,
//  (4) žádný nedosazený {placeholder}, žádné undefined,
//  (5) panel účtu i nápověda výpis BEROU z tierFeatures — ruční kopie (panel_props, věty v help.html) se nevrátí.
//
//   node scripts/verify_tier_features.js
'use strict';
const fs = require('fs'), vm = require('vm');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
let fail = 0;
const rekni = (ok, popis) => { if (ok) console.log('OK    ' + popis); else { fail++; console.log('FAIL  ' + popis); } };
const nacti = () => { const S = { console }; S.window = S; vm.createContext(S); vm.runInContext(fs.readFileSync(D + 'runar-config.js', 'utf8'), S); return S; };

let S = nacti();
const T = vm.runInContext('TIERS', S), tf = vm.runInContext('tierFeatures', S);
for (const L of ['en', 'is']) {
  for (const id of ['rune_seeker', 'standard', 'premium']) {
    const r = tf(id, L), txt = r.join(' ');
    rekni(r.length > 0 && !/\{|undefined|null/.test(txt), L + '  ' + id + ': ' + r.length + ' řádků, nic nedosazeného');
    const m = T[id].monthly_readings;
    if (m > 0) rekni(txt.indexOf(String(m)) !== -1, L + '  ' + id + ': počet čtení ' + m + ' je ve výpisu');
  }
  const std = tf('standard', L).join(' '), prem = tf('premium', L);
  rekni(/Everything a |Allt sem /.test(prem.join(' ')) && prem.length < tf('standard', L).length + 1,
        L + '  premium: shodné řádky složené do „Everything…“ (' + prem.length + ' řádky)');
  rekni(prem.join(' ').indexOf(tf('standard', L)[1]) === -1, L + '  premium neopakuje řádek, který má i Standard');
}

// (2) seed-and-assert: nastavení → věta
S = nacti();
vm.runInContext('TIERS.standard.asks_per_reading = 3; TIERS.premium.asks_per_reading = 0;', S);
const tf2 = vm.runInContext('tierFeatures', S);
rekni(/Three questions/.test(tf2('standard', 'en').join(' ')) && /Þrjár eigin spurningar/.test(tf2('standard', 'is').join(' ')),
      'změna asks_per_reading 1 → 3 se propíše do výpisu (en + is)');
{
  const p = tf2('premium', 'en').join(' ') + ' ' + tf2('premium', 'is').join(' ');
  rekni(!/question|spurning/.test(p), 'Ask vypnutý (0) → řádek o otázkách u tieru zmizí');
  // Premium bez Asku NESMÍ tvrdit „Everything a Rune Walker has“ — Rune Walker otázky má
  rekni(!/Everything|Allt sem/.test(p), 'tier, kterému chybí featura základu, netvrdí „Everything a <základ> has“');
}
vm.runInContext('TIERS.standard.monthly_readings = 60;', S);
rekni(tf2('standard', 'en')[0].indexOf('60') === 0, 'změna monthly_readings 50 → 60 se propíše do výpisu');

// (5) spotřebitelé berou výpis z tierFeatures; ruční kopie se nevrátily
const app = fs.readFileSync(D + 'runar-app.js', 'utf8'), help = fs.readFileSync(D + 'runar-help.html', 'utf8');
const cfg = fs.readFileSync(D + 'runar-config.js', 'utf8');
rekni(/_feat\('rune_seeker'\)/.test(app) && /_feat\('standard'\)/.test(app) && /_feat\('premium'\)/.test(app), 'panel účtu skládá tiery přes tierFeatures');
rekni((help.match(/tierFeatures\('(rune_seeker|standard|premium)', '(en|is)'\)/g) || []).length === 6, 'nápověda skládá 3 tiery × 2 jazyky přes tierFeatures');
{
  const S0 = nacti();
  rekni(['rune_seeker', 'standard', 'premium'].every(id => vm.runInContext('TIER_LIMITS.' + id + '.panel_props', S0) === undefined),
        'TIER_LIMITS už nemá ruční panel_props pro placené tiery / Rune Seekera');
}

console.log(fail ? '\n' + fail + ' selhalo' : '\nOK  výpis featur tierů se skládá z nastavení');
process.exit(fail ? 1 : 0);
