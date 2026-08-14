// Test proti REGRESI, kterou jsem sam zpusobil: invariant nesmi zmizet, kdyz je
// v Supabase aktivni vlastni postava. Testuje se CELY zivotni cyklus toho pole
// (chybi / je prazdne / je vyplnene), ne jen dobry pripad.
const fs = require('fs'), vm = require('vm');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const s = { console }; s.window = s; s.globalThis = s; vm.createContext(s);
['runar-config.js', 'runar-runes.js', 'runar-utils.js', 'runar-character.js']
  .forEach(f => vm.runInContext(fs.readFileSync(D + f, 'utf8'), s));

// Tri invarianty, ktere se 2026-08-14 prestehovaly do zakladu. Kazdy jinym polem,
// aby test nesledoval jen `grammar`.
const INV = {
  en: [['obraz', /Rúnar uses one image per reading/], ['zákaz rady', /never tells the seeker what to do/],
       ['anti-ozvěna', /never repeats himself/]],
  is: [['obraz', /Rúnar notar eina mynd í hverjum lestri/], ['zákaz rady', /segir leitandanum aldrei hvað hann á að gera/],
       ['anti-ozvěna', /endurtekur sig aldrei/]],
};

// Realisticky radek z `runar_character`: ma sva pole, ale `grammar` nikdy nemel.
const ROW_NO_GRAMMAR = { id: 1, active: true, identity: 'Custom identity.', personality: 'Custom personality.',
  purpose: 'Custom purpose.', never: 'Custom never.', philosophy: 'Custom philosophy.', format: 'Custom format.' };
const ROW_EMPTY_GRAMMAR = Object.assign({}, ROW_NO_GRAMMAR, { grammar: '   ' });
const ROW_OWN_GRAMMAR   = Object.assign({}, ROW_NO_GRAMMAR, { grammar: 'CUSTOM GRAMMAR BLOCK.' });

let fail = 0;
function check(label, prompt, lang, expect) {
  INV[lang].forEach(([name, re]) => {
    const got = re.test(prompt);
    if (got !== expect) { console.log('  ✗ ' + label + ' [' + lang + '] ' + name + ': ceka ' + expect + ', je ' + got); fail++; }
  });
}

for (const lang of ['en', 'is']) {
  check('bez vlastni postavy', s.buildSysPrompt(null, lang), lang, true);
  check('vlastni postava BEZ grammar', s.buildSysPrompt(ROW_NO_GRAMMAR, lang), lang, true);
  check('vlastni postava s PRAZDNYM grammar', s.buildSysPrompt(ROW_EMPTY_GRAMMAR, lang), lang, true);

  // Vlastni postava, ktera grammar ZAMERNE prepise, ho prepsat SMI - to je jeji ucel.
  const own = s.buildSysPrompt(ROW_OWN_GRAMMAR, lang);
  if (!/CUSTOM GRAMMAR BLOCK/.test(own)) { console.log('  ✗ [' + lang + '] vlastni grammar se neprosadil'); fail++; }
  if (/Custom personality/.test(own) === false) { console.log('  ✗ [' + lang + '] vlastni personality se neprosadila'); fail++; }
}

// KONTROLA TESTU: umel by vubec tu chybu chytit? Simuluje stav PRED opravou (base = c).
const before = `You are Rúnar.\n\nPERSONALITY\n${ROW_NO_GRAMMAR.personality}\n\nWHAT YOU NEVER DO\n${ROW_NO_GRAMMAR.never}` +
               (ROW_NO_GRAMMAR.grammar ? '\n\n' + ROW_NO_GRAMMAR.grammar : '');
const caught = INV.en.filter(([, re]) => !re.test(before)).length;
console.log(caught === 3
  ? '  kontrola testu: stav pred opravou by propadl na vsech 3 invariantech — test chybu chytit umi'
  : '  ✗ KONTROLA TESTU SELHALA: stav pred opravou propadl jen na ' + caught + '/3');
if (caught !== 3) fail++;

console.log(fail ? '\nFAIL: ' + fail + ' problemu' : '\nOK — invarianty prezily vsechny stavy vlastni postavy');
process.exit(fail ? 1 : 0);
