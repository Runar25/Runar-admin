// verify_hlas_rezie.js — hlas výkladu čte JEN to, co uživatel vidí; značky od modelu výkladu nesmí změnit slovo. Smoke ㊘.
//
// Proč (2026-10-29, owner: „v4 Turbo je dobré i pro IS. Použijeme“ · „R3 zní dobře pro výklad“): do ElevenLabs jde text, který přepsal
// model (sol vkládá intonační značky). Kdyby značky prošly bez pojistky, Rúnar by nahlas mohl říct něco, co ve čtení nestojí — a nikdo by
// to neviděl, protože text na obrazovce je originál. Pojistka a recept žijí v supabase/functions/_shared/voice_direction.ts.
// Co hlídá (modul se IMPORTUJE a pouští na známých vstupech, model se nevolá — odpověď podstrčí falešný fetch, §19):
//   (1) overZnacky: povolené značky projdou; změněné / přidané / ubrané slovo, cizí značka a moc značek NE,
//   (2) hlasovyText: dobrá odpověď → značky + úvod + pauzy; špatná odpověď, chyba HTTP, výjimka, chybějící klíč → hlas bez značek;
//       VŽDY: text bez značek = čtení slovo od slova,
//   (3) elevenlabs-proxy: posílá do ElevenLabs text z hlasovyText (ne syrový), brzda a evidence počítají s ním,
//   (4) el_voice.ts: model obou jazyků má sazbu v EL_KREDITY_NA_ZNAK (jinak brzda počítá 1 kredit na znak).
//   ⚠ (žlutě) HLAS_REZIE_MODEL ≠ SOL_MODEL v claude-proxy — smí se lišit, ale má to být vědomé.
//   node scripts/verify_hlas_rezie.js
'use strict';
const fs = require('fs'), path = require('path'), url = require('url');
const R = (process.env.RUNAR_ROOT || path.resolve(__dirname, '..')) + '/';
const cti = (p) => fs.readFileSync(R + p, 'utf8');
let fail = 0;
const rekni = (ok, co) => { if (!ok) fail++; console.log((ok ? 'OK    ' : 'FAIL  ') + co); };

(async () => {
  let m = null;
  try { m = await import(url.pathToFileURL(R + 'supabase/functions/_shared/voice_direction.ts').href); }
  catch (e) { rekni(false, 'voice_direction.ts nejde načíst: ' + e.message); }
  if (m) {
    const C = 'The wind has passed, and one tree stands. Hagalaz stands for clearing. What falls may be what you need.';
    const DOBRY = '[softly] The wind has passed, and one tree stands. [gravely] Hagalaz stands for clearing. [long pause] What falls may be what you need.';
    rekni(m.overZnacky(C, DOBRY), '(1) povolené značky, slova beze změny → projde');
    rekni(!m.overZnacky(C, DOBRY.replace('one tree', 'a tree')), '(1) změněné slovo → neprojde');
    rekni(!m.overZnacky(C, DOBRY.replace('What falls', 'What truly falls')), '(1) přidané slovo → neprojde');
    rekni(!m.overZnacky(C, DOBRY.replace(' and one tree stands', '')), '(1) ubraná slova → neprojde');
    rekni(!m.overZnacky(C, DOBRY.replace('[softly]', '[shouting]')), '(1) cizí značka → neprojde');
    rekni(!m.overZnacky(C, '[softly] '.repeat(m.HLAS_ZNACEK_MAX + 1) + C), '(1) víc značek než HLAS_ZNACEK_MAX → neprojde');
    const odpoved = (obsah, status) => async () => ({ ok: (status || 200) < 300, status: status || 200, json: async () => ({ choices: [{ message: { content: obsah } }], usage: { total_tokens: 1 } }) });
    const pripady = [
      ['dobrá odpověď', odpoved(DOBRY), 'tagged'],
      ['odpověď se změněným slovem', odpoved(DOBRY.replace('clearing', 'cleansing')), 'untagged'],
      ['odpověď s cizí značkou', odpoved(DOBRY.replace('[gravely]', '[laughs]')), 'untagged'],
      ['HTTP 500', odpoved('', 500), 'failed'],
      ['výjimka (síť, čas)', async () => { throw new Error('timeout'); }, 'failed'],
    ];
    for (const [jm, f, cekam] of pripady) {
      const h = await m.hlasovyText(C, 'en', 'klic-testu', f);
      rekni(h.rezie === cekam && h.text.startsWith(m.HLAS_UVOD) && m.bezZnacek(h.text) === m.bezZnacek(C),
        '(2) ' + jm + ' → ' + cekam + ', úvod na začátku, slova = čtení' + (h.rezie !== cekam ? ' (dostal ' + h.rezie + ')' : ''));
    }
    const bk = await m.hlasovyText(C, 'is', undefined, async () => { throw new Error('nemá se volat'); });
    rekni(bk.rezie === 'failed' && m.bezZnacek(bk.text) === m.bezZnacek(C), '(2) bez klíče OpenAI → hlas bez značek, model se nevolá');
    const dobra = await m.hlasovyText(C, 'en', 'k', odpoved(DOBRY));
    rekni(dobra.znacky.length === 3 && /\. … \[gravely\]/.test(dobra.text), '(2) značky se dostanou do hlasu a mezi větami je pauza „ … “');
    const sol = (cti('supabase/functions/claude-proxy/index.ts').match(/const SOL_MODEL = "([^"]+)"/) || [])[1];
    if (sol && sol !== m.HLAS_REZIE_MODEL) console.log('⚠     HLAS_REZIE_MODEL ' + m.HLAS_REZIE_MODEL + ' ≠ SOL_MODEL ' + sol + ' — smí se lišit, ale vědomě (voice_direction.ts)');
  }
  const px = cti('supabase/functions/elevenlabs-proxy/index.ts');
  rekni(/import \{[^}]*\bhlasovyText\b[^}]*\} from "\.\.\/_shared\/voice_direction\.ts"/.test(px) && /const hlas = await hlasovyText\(text, lang,/.test(px), '(3) proxy volá hlasovyText nad čtením');
  rekni(/body: JSON\.stringify\(\{\s*text: recText,/.test(px) && /kredityHlasu\(resolvedModel, recText\.length\)/.test(px) && /chars: recText\.length/.test(px),
    '(3) ElevenLabs, brzda i evidence dostanou text z hlasovyText');
  rekni(!/body: JSON\.stringify\(\{\s*text,\s/.test(px), '(3) syrový text čtení do ElevenLabs nejde');
  const el = cti('supabase/functions/_shared/el_voice.ts');
  const sazby = el.match(/EL_KREDITY_NA_ZNAK[^=]*=\s*\{([^}]*)\}/)[1];
  for (const k of ['EL_MODEL_EN', 'EL_MODEL_IS']) {
    const mdl = (el.match(new RegExp('export const ' + k + ' = "([^"]+)"')) || [])[1];
    rekni(!!mdl && new RegExp('\\b' + mdl + ':').test(sazby), '(4) ' + k + ' (' + mdl + ') má sazbu v EL_KREDITY_NA_ZNAK');
  }
  console.log(fail ? 'FAIL  hlas výkladu: ' + fail + ' selhalo' : 'OK    hlas výkladu: značky od modelu jen povolené a bez změny slova, jinak hlas bez nich; proxy čte připravený text, model má sazbu');
  process.exit(fail ? 1 : 0);
})();
