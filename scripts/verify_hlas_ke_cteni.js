// verify_hlas_ke_cteni.js — hlas patří ke čtení: jednou ke každému čtení, hlídá ho server (DECISIONS 2026-10-11 (61)).
//
// Proč (2026-10-11, owner: „jo varianta 7 … ok udělej“): elevenlabs-proxy do té doby přečetl JAKÝKOLI text do 3 000 znaků, 5× za minutu.
// „Jedno čtení = jeden hlas“ hlídalo jen tlačítko v prohlížeči a měsíční strop 5 (ownerův pokyn pro testery, omylem pro všechny). Bez
// stropu by účet se skriptem spálil 6 000 kreditů ElevenLabs za minutu. Kontrola hlídá, že vazba hlasu na čtení je ŽIVÁ, ne jen napsaná:
//   (1) podpis neuloženého čtení (_shared/voice_ticket.ts) — modul se IMPORTUJE a pouští na známých vstupech (seed-and-assert, §19):
//       pravý text projde i s jinými mezerami; jiný text, jiný uživatel, jiné tajemství, smetí a prázdné tajemství neprojdou,
//   (2) textKHlasu = `reading` z _splitThought (v2/runar-character.js) — appka čte bez řádku ✦ a server musí číst totéž,
//   (3) elevenlabs-proxy: text bez čtení jen admin; čtení jen vlastní; zakládací Norny ne; zámek PŘED voláním ElevenLabs; uložené přehrát,
//   (4) claude-proxy podepisuje neuložená čtení a podpis vrací; appka posílá reading_id i podpis; deník má hlas u single i výkladu,
//   (5) delete-account maže soubory hlasu; SQL zakládá tabulku zámků a SOUKROMÉ úložiště.
//   node scripts/verify_hlas_ke_cteni.js
const fs = require('fs'), path = require('path'), url = require('url');
const R = (process.env.RUNAR_ROOT || path.resolve(__dirname, '..')) + '/';
const cti = (p) => fs.readFileSync(R + p, 'utf8');
let fail = 0;
const rekni = (ok, co) => { if (!ok) fail++; console.log((ok ? 'OK    ' : 'FAIL  ') + co); };

(async () => {
  // (1) podpis
  let m = null;
  try { m = await import(url.pathToFileURL(R + 'supabase/functions/_shared/voice_ticket.ts').href); }
  catch (e) { rekni(false, 'voice_ticket.ts nejde načíst: ' + e.message); }
  if (m) {
    const T = 'tajemstvi-testu', U = '11111111-2222-3333-4444-555555555555', U2 = '99999999-2222-3333-4444-555555555555';
    const txt = 'Fehu stands in the field.  The cattle move.\n';
    const l = await m.podepis(T, U, txt);
    rekni(typeof l === 'string' && /^[0-9a-f-]{36}\.[A-Za-z0-9_-]+$/.test(l), 'podpis má tvar <nonce>.<podpis>');
    rekni((await m.over(T, l, U, txt)) === l.split('.')[0], 'pravý text, pravý uživatel → projde a vrátí nonce');
    rekni(!!(await m.over(T, l, U, 'Fehu stands in the field. The cattle move.')), 'jiné mezery a konce řádků → projde (normalizace)');
    rekni((await m.over(T, l, U, 'Fehu stands in the field. The cattle run.')) === null, 'jiný text → neprojde');
    rekni((await m.over(T, l, U2, txt)) === null, 'cizí uživatel → neprojde');
    rekni((await m.over('jine-tajemstvi', l, U, txt)) === null, 'jiné tajemství (padělek) → neprojde');
    rekni((await m.over(T, 'abc.def', U, txt)) === null && (await m.over(T, null, U, txt)) === null && (await m.over(T, l.split('.')[0], U, txt)) === null,
          'smetí, prázdno, nonce bez podpisu → neprojde');
    rekni((await m.podepis('', U, txt)) === null && (await m.over('', l, U, txt)) === null, 'prázdné tajemství → žádný podpis ani ověření');

    // (2) textKHlasu = _splitThought(...).reading — doslova funkce appky, ne opis (§19)
    const ch = cti('v2/runar-character.js');
    const src = (ch.match(/function _splitThought\(reading, segs\) \{[\s\S]*?\n\}/) || [])[0];
    if (!src) rekni(false, '_splitThought v runar-character.js nenalezena');
    else {
      const split = new Function(src + '\nreturn _splitThought;')();
      const vzorky = ['Čtení tady.\n✦ Myšlenka na konec.', 'Bez myšlenky ', '  Úvod. Prostředek ✦ konec ✦ druhý', '✦ jen myšlenka', '',
                      'Řádek jedna.\nŘádek dva.\n\n✦ — Myšlenka s pomlčkou'];
      const zle = vzorky.filter((v) => m.textKHlasu(v) !== split(v, []).reading.trim());
      rekni(!zle.length, 'textKHlasu = _splitThought().reading na ' + vzorky.length + ' vzorcích' + (zle.length ? ' (liší se: ' + JSON.stringify(zle) + ')' : ''));
    }
  }

  // (3) elevenlabs-proxy
  const el = cti('supabase/functions/elevenlabs-proxy/index.ts');
  rekni(/import \{[^}]*\bover\b[^}]*\btextKHlasu\b[^}]*\} from "\.\.\/_shared\/voice_ticket\.ts"|import \{[^}]*\btextKHlasu\b[^}]*\bover\b[^}]*\} from "\.\.\/_shared\/voice_ticket\.ts"/.test(el),
        'elevenlabs-proxy bere podpis a text k hlasu z _shared/voice_ticket.ts');
  rekni(!/const \{ text, lang \} = await req\.json\(\)/.test(el), 'elevenlabs-proxy už nebere holý text od klienta (stará cesta pryč)');
  rekni(/if \(text === null && ADMIN_EMAILS\.includes\(email\) && typeof body\?\.text === "string"\) text = body\.text;/.test(el) &&
        /if \(text === null\) return json\(\{ error: "voice_unbound" \}, 403\);/.test(el), 'text bez čtení jen admin, jinak voice_unbound');
  rekni(/\.from\("readings"\)\s*\n?\s*\.select\([^)]*\)\.eq\("id", reading_id\)\.eq\("user_id", userId\)/.test(el), 'čtení se hledá jen mezi vlastními (user_id)');
  rekni(/pf\?\.founding_reading_id === r\.id\) return json\(\{ error: "voice_not_offered" \}/.test(el), 'zakládací Norny hlas nedostanou');
  rekni(/const nonce = await over\(/.test(el) && /if \(!nonce\) return json\(\{ error: "voice_unbound" \}/.test(el), 'neuložené čtení jen s platným podpisem');
  const iZamek = el.indexOf('from("voice_tickets").insert'), iEl = el.indexOf('api.elevenlabs.io');
  rekni(iZamek !== -1 && iEl !== -1 && iZamek < iEl, 'zámek „jednou“ vzniká PŘED voláním ElevenLabs');
  rekni(/zErr\.code === "23505"\) return json\(\{ error: "voice_used" \}/.test(el), 'druhý pokus o týž hlas → voice_used');
  rekni((el.match(/await pustZamek\(\)/g) || []).length >= 3, 'selhání ElevenLabs zámek uvolní (síť, odpověď, tělo)');
  rekni(/createSignedUrl\(uz\.path, \d+\)/.test(el) && /upload\(ulozit, bytes/.test(el), 'uložené čtení: hlas se uloží a podruhé pustí z úložiště');
  rekni(!/^const VOICE_MONTHLY_LIMIT\s*=/m.test(el), 'měsíční strop 5 pro všechny v proxy není (DECISIONS 2026-10-11 (49), (61))');

  // (4) claude-proxy + appka
  const cp = cti('supabase/functions/claude-proxy/index.ts');
  rekni(/if \(userId && !readingId && mode === ""\) \{/.test(cp) && /await podepis\(/.test(cp) && /\.\.\.\(voice \? \{ voice \} : \{\}\)/.test(cp),
        'claude-proxy podepisuje neuložené čtení a podpis vrací');
  const rd = cti('v2/runar-reading.js');
  rekni(/const _rt = readerTexts\[lang\] \|\| \{\};/.test(rd) && /reading_id: _rt\.id \|\| undefined,/.test(rd) && /ticket: _rt\.voice \? _rt\.voice\.ticket : undefined/.test(rd),
        'hlas ve čtení posílá reading_id i podpis čtení, které je NA OBRAZOVCE (po přepnutí jazyka jiné než poslední)');
  rekni((rd.match(/_voiceTicket = \(res && res\.voice\) \|\| null;/g) || []).length === 2 &&
        (rd.match(/readerTexts\[lang\] = \{ short: [a-z]+, deep: '', id: _lastReadingId, voice: _voiceTicket \};/g) || []).length === 2,
        'single i výklad si id a podpis uloží k textu svého jazyka');
  const jr = cti('v2/runar-journal.js');
  rekni((jr.match(/\$\{_jHlas\(e, i\)\}/g) || []).length === 2 && /async function playReadingVoice\(i\)/.test(jr), 'deník: hlas u single i u výkladu');

  // (5) smazání účtu + SQL
  const del = cti('supabase/functions/delete-account/index.ts');
  rekni(/storage\.from\("reading-voice"\)\.remove\(/.test(del), 'delete-account maže soubory hlasu');
  const sql = cti('sql/2026-10-11_hlas_ke_cteni.sql');
  rekni(/create table if not exists public\.voice_tickets/.test(sql) && /\('reading-voice', 'reading-voice', false/.test(sql), 'SQL: tabulka zámků a SOUKROMÉ úložiště');

  console.log(fail ? '\n' + fail + ' selhalo' : '\nOK  hlas patří ke čtení: jednou, hlídá server, uložený se pouští znovu');
  process.exit(fail ? 1 : 0);
})();
