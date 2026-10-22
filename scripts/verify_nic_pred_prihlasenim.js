// NIC PŘED PŘIHLÁŠENÍM — v každé edge funkci se před ověřením identity nic nezapisuje, nic nevolá model ani cizí API a nic neběží na pozadí.
//
// Proč (CODE-read 2026-10-21, zadání ownera přes CODE-tune bod 3): stín promptu v claude-proxy se volal PŘED `if (!userId) return 401`
// (4e966cc) — sonda bez přihlášení dostala 401, ale porovnání už běželo a zapsalo do ops_events. Opraveno do 3 minut, žádná kontrola by
// to nechytila. Kdo smí funkci volat bez přihlášení, ten nesmí spustit nic, co stojí peníze, zapisuje nebo běží dál po odpovědi.
//
// Jak: úsek handleru od `serve(` po bránu identity (první řádek, který odmítne chybějícího ověřeného uživatele: `!userId`, `!user`,
// `!caller`, `x-ops-secret`). V úseku je zakázáno: .insert/.update/.upsert/.delete, .rpc (kromě check_rate_limit — limit podle IP
// před přihlášením je ochrana, ne práce), waitUntil, fetch, a volání funkce z téhož souboru, v jejímž těle něco z toho stojí
// (tak se chytil stinPorovnej). Výjimky jmenovitě v BEZ_PRIHLASENI.
// Co NEvidí: práci schovanou ve funkci importované z _shared/ (čte jen funkce téhož souboru) a bránu napsanou jinými slovy (pak FAIL
// „brána nenalezena“ — doplň vzor do BRANA, ne výjimku).
//   node scripts/verify_nic_pred_prihlasenim.js
'use strict';
const fs = require('fs'), path = require('path');
const R = process.env.RUNAR_ROOT || path.resolve(__dirname, '..');
const DIR = path.join(R, 'supabase', 'functions');

const BEZ_PRIHLASENI = {
  'client-error': 'chyby appky u uživatelů (2026-10-22, DECISIONS 2026-10-22 (11)) — přihlášení z principu nemá (chyba přijde i od návštěvníka); '
    + 'drží ho limity check_rate_limit (10 / h na IP, 60 / h celkem), 2 kB a jen vybraná pole',
  'waitlist-join': 'veřejný zápis na čekací listinu z webu — přihlášení z principu nemá; drží ho tři limity check_rate_limit a dvojí opt-in Brevo',
};
const BRANA = /if\s*\(\s*(!userId\b|authErr\s*\|\|\s*!user\b|!user\b|!caller\b)|x-ops-secret/;
const PRACE = /\.(insert|update|upsert|delete)\s*\(|waitUntil|\bfetch\s*\(|\.rpc\s*\(\s*"(?!check_rate_limit")/;

function funkcePrace(src) {
  // jména top-level funkcí (function X / const X = (async) (…) =>), v jejichž těle stojí PRACE
  const jmena = new Set();
  const re = /^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)|^const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(/gm;
  let m;
  const starty = [];
  while ((m = re.exec(src))) starty.push({ jm: m[1] || m[2], i: m.index });
  for (const s of starty) {
    // tělo = od první `{` po párovou `}` (závorky v řetězcích se nerozlišují — na funkce v edge souborech to stačí)
    const o = src.indexOf('{', s.i);
    let hl = 0, j = o;
    for (; j < src.length; j++) { if (src[j] === '{') hl++; else if (src[j] === '}' && --hl === 0) break; }
    if (PRACE.test(src.slice(o, j + 1))) jmena.add(s.jm);
  }
  return jmena;
}

const vady = [];
let n = 0;
for (const fn of fs.readdirSync(DIR).sort()) {
  const f = path.join(DIR, fn, 'index.ts');
  if (fn.startsWith('_') || !fs.existsSync(f)) continue;
  n++;
  if (BEZ_PRIHLASENI[fn]) continue;
  const src = fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n');
  const radky = src.split('\n');
  const start = radky.findIndex((l) => /^(Deno\.)?serve\(/.test(l));
  if (start < 0) { vady.push(`FAIL  supabase/functions/${fn}/index.ts — handler serve( nenalezen`); continue; }
  const brana = radky.findIndex((l, i) => i > start && BRANA.test(l));
  if (brana < 0) { vady.push(`FAIL  supabase/functions/${fn}/index.ts — brána identity nenalezena (doplň vzor do BRANA, nebo výjimku s důvodem)`); continue; }
  const prace = funkcePrace(src);
  const volani = prace.size ? new RegExp('\\b(' + [...prace].join('|') + ')\\s*\\(') : null;
  for (let i = start + 1; i <= brana; i++) {
    // řádek brány se čte jen PŘED vzorem brány (`práce(); if (!userId) return …` na jednom řádku je taky práce před přihlášením)
    const l = i < brana ? radky[i] : radky[i].slice(0, radky[i].search(BRANA));
    if (/^\s*\/\//.test(l)) continue;
    const m = l.match(PRACE) || (volani && l.match(volani));
    if (m) vady.push(`FAIL  supabase/functions/${fn}/index.ts:${i + 1} práce před ověřením přihlášení (${m[0].trim()}) — brána je na ř. ${brana + 1}`);
  }
}
if (vady.length) {
  vady.forEach((v) => console.log(v));
  console.log(`FAIL  nic před přihlášením: ${vady.length} nález(ů) v ${n} edge funkcích`);
  process.exit(1);
}
console.log(`OK    nic před přihlášením: ${n} edge funkcí, před bránou identity žádný zápis, model, fetch ani práce na pozadí (výjimky: ${Object.keys(BEZ_PRIHLASENI).join(', ')})`);
