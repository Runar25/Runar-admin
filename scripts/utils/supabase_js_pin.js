// Povýšení knihovny supabase-js v appce a shrine (2026-10-10, kontrola architektury).
// Od 2026-10-10 se načítá PEVNÁ verze s otiskem (SRI) — dřív `@2`, takže se každé nové vydání nahrálo všem samo a bez kontroly.
// Cena pevné verze: opravy z nových vydání nepřijdou samy. Tenhle skript ukáže, jestli je novější verze, a vypíše pro ni
// adresu + otisk; ověří, že pevná adresa dává bajtově tentýž soubor. Do HTML je přepiš ručně (runar-reader.html, runar-shrine.html)
// a appku vyzkoušej (přihlášení, čtení) — řada 2.x může změnit chování.
//   node scripts/utils/supabase_js_pin.js            → nejnovější 2.x
//   node scripts/utils/supabase_js_pin.js 2.118.0    → konkrétní verze
'use strict';
const crypto = require('crypto'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
(async () => {
  const want = process.argv[2] || '2';
  const r = await (await fetch('https://data.jsdelivr.com/v1/packages/npm/@supabase/supabase-js/resolved?specifier=' + want)).json();
  const ver = r.version;
  if (!ver) { console.log('verze nenalezena: ' + want); process.exit(1); }
  const url = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@' + ver + '/dist/umd/supabase.min.js';
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  const def = Buffer.from(await (await fetch('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@' + ver)).arrayBuffer());
  if (!buf.equals(def)) { console.log('POZOR: plná cesta dává jiný soubor než výchozí vstup balíčku — zkontroluj entrypoint'); process.exit(1); }
  const sri = 'sha384-' + crypto.createHash('sha384').update(buf).digest('base64');
  const html = fs.readFileSync(path.join(ROOT, 'v2', 'runar-reader.html'), 'utf8');
  const ted = (html.match(/supabase-js@([\d.]+)\//) || [])[1] || '?';
  console.log('v appce teď: ' + ted + '   ·   k dispozici: ' + ver + (ted === ver ? '   (aktuální)' : '   (NOVĚJŠÍ)'));
  console.log('src="' + url + '"');
  console.log('integrity="' + sri + '" crossorigin="anonymous"');
})().catch((e) => { console.log('chyba: ' + e.message); process.exit(1); });
