// verify_ritual_hlas.js — hlas rituálu sedí na text rituálu. Smoke ㊗.
//
// Proč (2026-10-28, owner: hlas rituálu = varianta F, „můžeme se od ní odrážet dál pro další rituální čtení“): nahrávka je statický soubor
// u appky (v2/audio/), text žije v UI_TEXT.ritual_text. Kdo text změní, nahrávka by dál říkala starý — tiše, nikdo by to nepoznal, dokud
// to někdo neposlechne. Otisk textu, ze kterého se namluvila (RUNAR_RITUAL_HLAS.*.text_sha1 v runar-config.js), to drží.
// Co hlídá: každý jazyk UI_TEXT má nahrávku; soubor existuje a není prázdný; otisk ritual_text = text_sha1.
// 2026-10-30: totéž pro hlas návodu (RUNAR_NAVOD_HLAS × guide_lines spojené \n; owner „How a reading works … chci taky s hlasem“).
// Oprava návodu: node docs/eval/2026-10-27-ritual-hlas/gen.js --navod  →  poslech  →  --navod --do-appky F.
// Oprava při FAIL: node docs/eval/2026-10-27-ritual-hlas/gen.js --jen F  →  poslech  →  --do-appky F (zkopíruje a vypíše otisky do configu).
//   node scripts/verify_ritual_hlas.js          kontrola
//   node scripts/verify_ritual_hlas.js --test   samotest (podstrčený jiný text a chybějící soubor musí spadnout)
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), crypto = require('crypto');
const R = path.resolve(__dirname, '..');

function nacti(root) {
  const S = { window: {}, console }; S.window = S; vm.createContext(S);
  for (const f of ['runar-config.js', 'runar-translations.js']) vm.runInContext(fs.readFileSync(path.join(root, 'v2', f), 'utf8'), S, { filename: f });
  vm.runInContext('this.__UI = UI_TEXT; this.__H = typeof RUNAR_RITUAL_HLAS === "undefined" ? null : RUNAR_RITUAL_HLAS;'
    + ' this.__N = typeof RUNAR_NAVOD_HLAS === "undefined" ? null : RUNAR_NAVOD_HLAS;', S);
  return { UI: S.__UI, H: S.__H, N: S.__N };
}
// Nahrávky textů: [jméno v configu, klíč UI_TEXT, text pro otisk]
const HLASY = [['RUNAR_RITUAL_HLAS', 'ritual_text', (x) => x], ['RUNAR_NAVOD_HLAS', 'guide_lines', (x) => Array.isArray(x) ? x.join('\n') : x]];

function zkontroluj(UI, H, existuje, jmeno = 'RUNAR_RITUAL_HLAS', klic = 'ritual_text', text = (x) => x) {
  const vady = [];
  if (!H) return ['v runar-config.js chybí ' + jmeno];
  for (const l of Object.keys(UI)) {
    const txt = UI[l] && UI[l][klic] && text(UI[l][klic]);
    if (!txt) continue;
    const h = H[l];
    if (!h) { vady.push(l + ': ' + klic + ' je, nahrávka v ' + jmeno + ' chybí'); continue; }
    const vel = existuje(h.src);
    if (!vel) vady.push(l + ': soubor v2/' + h.src + ' chybí nebo je prázdný');
    const sha = crypto.createHash('sha1').update(txt, 'utf8').digest('hex');
    if (sha !== h.text_sha1) vady.push(l + ': ' + klic + ' se změnil od namluvení (otisk ' + sha.slice(0, 10) + '… ≠ ' + String(h.text_sha1).slice(0, 10) + '…) — nahrávka říká starý text');
  }
  return vady;
}
const vsechny = (UI, C, existuje) => HLASY.flatMap(([j, k, tx]) => zkontroluj(UI, C[j === 'RUNAR_RITUAL_HLAS' ? 'H' : 'N'], existuje, j, k, tx).map((v) => j + ' · ' + v));

const naDisku = (src) => { try { const s = fs.statSync(path.join(R, 'v2', src)); return s.size > 10000 ? s.size : 0; } catch (e) { return 0; } };

if (process.argv.includes('--test')) {
  const C = nacti(R), { UI, H } = C;
  const zmeneny = JSON.parse(JSON.stringify(UI)); zmeneny.en.ritual_text += ' ';
  const navod = JSON.parse(JSON.stringify(UI)); navod.is.guide_lines[1] += ' ';
  const pripady = [
    ['jiný návod IS', vsechny(navod, C, naDisku).some((v) => /^RUNAR_NAVOD_HLAS · is: guide_lines se změnil/.test(v))],
    ['návod bez nahrávky', vsechny(UI, { H, N: null }, naDisku).some((v) => /chybí RUNAR_NAVOD_HLAS/.test(v))],
    ['jiný text EN', zkontroluj(zmeneny, H, naDisku).some((v) => /^en: ritual_text se změnil/.test(v))],
    ['chybějící soubor', zkontroluj(UI, H, () => 0).some((v) => /chybí nebo je prázdný/.test(v))],
    ['jazyk bez nahrávky', zkontroluj(UI, { en: H.en }, naDisku).some((v) => /^is: .*nahrávka v RUNAR_RITUAL_HLAS chybí/.test(v))],
    ['dnešní stav projde', vsechny(UI, C, naDisku).length === 0],
  ];
  const spatne = pripady.filter((p) => !p[1]);
  if (spatne.length) { console.log('FAIL  samotest hlasu rituálu: ' + spatne.map((p) => p[0]).join(', ')); process.exit(1); }
  console.log('OK    samotest hlasu rituálu: ' + pripady.length + ' případy');
  process.exit(0);
}

const C = nacti(R);
const vady = vsechny(C.UI, C, naDisku);
if (vady.length) {
  vady.forEach((v) => console.log('  ' + v));
  console.log('FAIL  hlas rituálu / návodu: nahrávka nesedí na text — vyrob ji znovu (docs/eval/2026-10-27-ritual-hlas/gen.js --jen F nebo --navod, pak --do-appky F)');
  process.exit(1);
}
console.log('OK    hlas rituálu i návodu: ' + Object.keys(C.H).length + ' + ' + Object.keys(C.N).length + ' jazyky — nahrávky u appky, namluvené z dnešního textu');
