// verify_prompt_skladani.js — skládání promptu na serveru dává BAJTOVĚ stejný prompt jako prohlížeč (krok 1 plánu infrastruktury).
//
// Proč: prompt se stěhuje do claude-proxy (owner 2026-10-15 „9. beru“, 2026-10-21 „ok začni“). Balíček
// supabase/functions/_shared/prompt_skladani.mjs je TÝŽ kód jako v appce, jen běží ve striktním modulu s náhodou a úložištěm
// zvenku — a právě tam se může tiše rozejít (proměnná, kterou prohlížeč bere z window, Date, Math, pořadí losu). Kontrola:
//   A) balíček je aktuální (vygenerovaný z dnešních v2/ souborů — jinak by server skládal starý prompt),
//   B) všech 40 golden vzorků přes rozhraní serveru = scripts/golden/golden_baseline.json (náhoda 0,5 jako golden harness).
// Vzorky jsou kopie scripts/golden/golden_dump.js ve stejném pořadí (stav sáčku obrazů se mezi nimi přenáší) — když se golden
// vzorky změní, B spadne a tady se dopíše totéž; tiché rozejití to nedovolí.
//   node scripts/verify_prompt_skladani.js
'use strict';
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const ROOT = path.join(__dirname, '..');
const { vyrob, CIL } = require('./build_prompt_skladani.js');

(async () => {
  let vady = [];
  if (!fs.existsSync(CIL) || fs.readFileSync(CIL, 'utf8') !== vyrob()) {
    console.log('FAIL  A) ' + path.relative(ROOT, CIL) + ' není aktuální — pusť node scripts/build_prompt_skladani.js');
    process.exit(1);
  }
  const { vytvorSkladani } = await import(pathToFileURL(CIL).href);
  const zaklad = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts', 'golden', 'golden_baseline.json'), 'utf8'));
  const bag = {};
  const uloziste = { getItem: (k) => (k in bag ? bag[k] : null), setItem: (k, v) => { bag[k] = String(v); }, removeItem: (k) => { delete bag[k]; } };
  const save = () => JSON.stringify(bag), load = (x) => { Object.keys(bag).forEach((k) => delete bag[k]); Object.assign(bag, JSON.parse(x)); };
  const S = vytvorSkladani({ random: () => 0.5, uloziste, lang: 'en', userGender: 'hk' });
  const R = (n) => S.RUNES.find((r) => r.n === n);
  const OUT = {};
  const grab = (k, fn) => { try { OUT[k] = fn(); } catch (e) { OUT[k] = 'ERROR: ' + e.message; } };
  const u = { name: 'Anna', area: 'work and direction', seeking: 'clarity', question: 'What should I focus on?', d: 15, m: 6, y: 1990 };
  u.intention = S.INTENTIONS && S.INTENTIONS.en ? S.INTENTIONS.en[0] : ''; u.lifeRune = R('Fehu');
  const u2 = { name: 'Bjorn', area: 'health', seeking: 'strength', question: '', intention: '', lifeRune: null };
  const drawn = R('Raidho');
  const u3 = Object.assign({}, u, { lifeRune: R('Isa') });
  const pool = ['Fehu', 'Uruz', 'Thurisaz', 'Ansuz', 'Raidho', 'Kenaz', 'Gebo', 'Wunjo', 'Hagalaz'].map(R);
  const corr = [{ from: 'Arctic', to: 'Norðurljós', lang: 'both', context: 'test' }];
  const jmeno = { root: 'ON sigr + rún', en: 'victory + rune', is: 'sigur + rún', myth_en: '', myth_is: '' };
  for (const L of ['is', 'en']) {
    S.nastav('lang', L);
    grab('system_' + L, () => S.buildSysPrompt(null, L));
    grab('angles_' + L, () => (L === 'is' ? S.READING_ANGLES_IS : S.READING_ANGLES).join('\n'));
    grab('single_' + L, () => S.buildReadingPrompt(u, drawn, L, []));
    const pred = save();
    grab('single_noq_' + L, () => S.buildReadingPrompt(u2, drawn, L, []));
    const po = save(); load(pred);
    S.nastav('engine', 'opus');
    grab('single_opus_' + L, () => S.buildReadingPrompt(u2, drawn, L, []));
    S.nastav('engine', 'sol'); load(po);
    grab('single_corr_' + L, () => S.buildReadingPrompt(u, drawn, L, corr));
    grab('single_selflife_' + L, () => S.buildReadingPrompt(u, u.lifeRune, L, []));
    grab('norns_' + L, () => S.buildNornsPrompt(u, pool.slice(0, 3), L, []));
    grab('norns_lens_' + L, () => S.buildNornsPrompt(u3, pool.slice(0, 3), L, []));
    grab('kriz_lens_' + L, () => S.buildKrizPrompt(u3, pool.slice(0, 5), L, []));
    grab('horseshoe_lens_' + L, () => S.buildHorseshoePrompt(u3, pool.slice(0, 7), L, []));
    grab('yggdrasil_lens_' + L, () => S.buildYggdrasilPrompt(u3, pool, L, []));
    grab('kriz_' + L, () => S.buildKrizPrompt(u, pool.slice(0, 5), L, []));
    grab('horseshoe_' + L, () => S.buildHorseshoePrompt(u, pool.slice(0, 7), L, []));
    grab('yggdrasil_' + L, () => S.buildYggdrasilPrompt(u, pool, L, []));
    grab('liferune_' + L, () => S.buildLifeRunePrompt('Anna', u.lifeRune, 15, 6, 1990, L, []));
    grab('ask_' + L, () => S.buildAskPrompt('SAMPLE READING', 'what does it mean for me', 'Raidho', L, [], null, null, null));
    grab('ask_life_' + L, () => S.buildAskPrompt('SAMPLE READING', 'what does it mean for me', 'Raidho', L, [], u.lifeRune, null, null));
    grab('ask_earlier_' + L, () => S.buildAskPrompt('SAMPLE READING', 'and what does that ask of me', 'Raidho', L, [], null, null, null, '',
      [{ q: 'what does it mean for me', a: 'SAMPLE ANSWER' }]));
    grab('namelore_' + L, () => S.buildNameLorePrompt('Sigrún', jmeno, L, []));
  }
  const klice = Object.keys(zaklad);
  for (const k of klice) {
    if (!(k in OUT)) { vady.push(k + ': chybí vzorek (golden_dump.js má nový — dopiš ho sem)'); continue; }
    if (OUT[k] !== zaklad[k]) {
      const a = String(zaklad[k]), b = String(OUT[k]); let i = 0; while (i < a.length && a[i] === b[i]) i++;
      vady.push(k + ': liší se od znaku ' + i + ' — prohlížeč „' + a.slice(i, i + 50).replace(/\n/g, '⏎') + '“ × server „' + b.slice(i, i + 50).replace(/\n/g, '⏎') + '“');
    }
  }
  for (const k of Object.keys(OUT)) if (!(k in zaklad)) vady.push(k + ': vzorek navíc (golden_dump.js ho nemá)');
  if (vady.length) {
    vady.slice(0, 12).forEach((v) => console.log('  ' + v));
    console.log('FAIL  skládání promptu na serveru se liší od prohlížeče v ' + vady.length + ' z ' + klice.length + ' vzorků');
    process.exit(1);
  }
  console.log('OK    skládání promptu na serveru = prohlížeč: ' + klice.length + '/' + klice.length + ' golden vzorků bajt po bajtu, balíček aktuální');
})();
