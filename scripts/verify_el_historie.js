// verify_el_historie.js — mazání z historie ElevenLabs (elevenlabs-proxy, smazHistorii) najde a smaže SVOU položku, cizí nechá.
//
// Proč (2026-10-14, CODE-tune): zásady slibují „As soon as the audio is ready, we delete the text and the audio from our ElevenLabs
// account“ (DECISIONS 2026-10-13 (6)). První skutečný hlas po nasazení (14. 10. 08:25:56 UTC) v historii zůstal — log funkce „EL history
// item not found“: hledalo se jen podle přesného textu a jen ~5 s. Oprava hledá podle request_id (hlavička `request-id`), text je záloha
// (normalizovaný na obou stranách) a čeká se ~50 s. Kontrola protlačí SKUTEČNÝ kód funkce (vytažený ze zdroje, typy odstraní Node)
// podvrženými odpověďmi ElevenLabs a ověří výsledek — kterou položku smazal a co šlo do logu (§19). Původní kód shodí všech 5 případů.
// Co NEověří: že ElevenLabs hlavičku `request-id` u streamu opravdu posílá a že položku zapíše do ~50 s. To řekne log funkce u skutečného
// hlasu: „EL history deleted (match: request_id|text, try N)“, nebo „… not found … (request-id present|missing, items …)“.
//   node scripts/verify_el_historie.js
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = process.env.RUNAR_ROOT || path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'supabase', 'functions', 'elevenlabs-proxy', 'index.ts');
let fail = 0;
const ok = (c, p) => { if (c) console.log('OK    ' + p); else { fail++; console.log('FAIL  ' + p); } };

const src = fs.readFileSync(SRC, 'utf8');
// Volání: id požadavku z odpovědi ElevenLabs musí dojít až do úklidu (jinak by zbylo jen hledání podle textu, které 14. 10. selhalo).
ok(/const reqId = elRes\.headers\.get\("request-id"\)/.test(src) && /smazHistorii\((text|recText), odUnix, reqId\)/.test(src),
  'proxy čte hlavičku request-id a předává ji úklidu historie');

let strip;
try { strip = require('node:module').stripTypeScriptTypes; } catch (e) { strip = null; }
if (typeof strip !== 'function') {
  console.log('FAIL  tenhle Node neumí stripTypeScriptTypes (potřeba Node ≥ 22.13) — kód úklidu nejde protlačit');
  process.exit(1);
}
process.removeAllListeners('warning'); process.on('warning', () => {});   // „ExperimentalWarning: Type Stripping…“ nepatří do výstupu kontroly
const a = src.indexOf('const CEKANI_HISTORIE_MS'), b = src.indexOf('\nserve(');
if (a < 0 || b < a) { console.log('FAIL  v elevenlabs-proxy chybí CEKANI_HISTORIE_MS / smazHistorii — úklid historie zmizel?'); process.exit(1); }
const js = strip(src.slice(a, b));

async function beh(scenar) {
  const log = [], smazano = [];
  let volani = 0;
  const ctx = {
    console: { log: (...x) => log.push('log ' + x.join(' ')), warn: (...x) => log.push('warn ' + x.join(' ')), error: (...x) => log.push('error ' + x.join(' ')) },
    setTimeout: (f) => f(), EL_VOICE_ID: 'VOICE', EL_API_KEY: 'k',
    normalizuj: (s) => String(s ?? '').replace(/\s+/g, ' ').trim(),   // táž definice jako _shared/voice_ticket.ts
    fetch: async (url, opt) => {
      if (opt && opt.method === 'DELETE') {
        smazano.push(String(url).split('/').pop());
        return { ok: scenar.delOk !== false, status: scenar.delOk === false ? 401 : 200, text: async () => '{"detail":{"status":"missing_permissions"}}' };
      }
      volani++;
      if (scenar.list401) return { ok: false, status: 401, text: async () => '{"detail":{"status":"missing_permissions"}}', json: async () => ({}) };
      return { ok: true, status: 200, json: async () => ({ history: scenar.polozky(volani) }) };
    },
  };
  vm.createContext(ctx);
  vm.runInContext(js + '\n;globalThis.__smaz = smazHistorii;', ctx);
  await ctx.__smaz(scenar.text, 1000, scenar.reqId);
  return { log, smazano, volani };
}

const TEXT = 'Við jaðar einstigisins tekur grasið við af mölinni.';   // smyšlený text, žádné čtení
const cizi = { history_item_id: 'CIZI', request_id: 'r-cizi', text: 'Owner test on the website.' };
const nase = (t) => ({ history_item_id: 'NASE', request_id: 'r-nase', text: t });
(async () => {
  // 1) položka se objeví až na 4. pokus a ElevenLabs má jiný text → najde se podle request_id; cizí položka zůstane
  let r = await beh({ text: TEXT, reqId: 'r-nase', polozky: (n) => (n < 4 ? [cizi] : [cizi, nase('jiný text')]) });
  ok(r.smazano.join() === 'NASE' && r.log.some((l) => /deleted \(match: request_id, try 4\)/.test(l)),
    'pozdě zapsaná položka s jiným textem: smazána podle request_id na 4. pokus, cizí zůstala');
  // 2) hlavička request-id chybí, text se liší jen mezerami a koncem řádku → najde se podle textu
  r = await beh({ text: TEXT, reqId: null, polozky: () => [cizi, nase(TEXT.replace(/ /g, '  ') + '\n')] });
  ok(r.smazano.join() === 'NASE' && r.log.some((l) => /match: text/.test(l)), 'bez request-id: smazána podle textu (mezery a konec řádku nevadí)');
  // 3) naše položka se neobjeví vůbec → nesmaže se nic (ani cizí), log nese počty, ne text čtení (soukromí)
  r = await beh({ text: TEXT, reqId: 'r-nase', polozky: () => [cizi] });
  ok(r.smazano.length === 0 && r.volani === 7 && r.log.some((l) => /not found .*request-id present, items of our voice since start: 1/.test(l))
    && !r.log.some((l) => l.indexOf(TEXT) !== -1), 'položka nikde: 7 výpisů (~50 s), cizí nesmazána, log s počty a bez textu čtení');
  // 4) klíč historii číst nesmí → konec po prvním výpisu, log s kódem i důvodem
  r = await beh({ text: TEXT, reqId: 'r-nase', list401: true, polozky: () => [] });
  ok(r.volani === 1 && r.log.some((l) => /EL history list 401: .*missing_permissions/.test(l)), 'výpis 401: konec po prvním pokusu, log nese kód i důvod');
  // 5) mazání zakázané → log s kódem i důvodem
  r = await beh({ text: TEXT, reqId: 'r-nase', delOk: false, polozky: () => [nase(TEXT)] });
  ok(r.log.some((l) => /EL history delete 401: .*missing_permissions/.test(l)), 'mazání 401: log nese kód i důvod');

  console.log(fail ? '\nFAIL  mazání z historie ElevenLabs: ' + fail + ' případů nesedí'
    : '\nOK    mazání z historie ElevenLabs: smaže svou položku podle request_id (záložně podle textu), cizí nechá, chyby ElevenLabs loguje s důvodem');
  process.exit(fail ? 1 : 0);
})();
