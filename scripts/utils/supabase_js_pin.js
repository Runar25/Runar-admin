// Povýšení knihovny supabase-js v appce a shrine (2026-10-10, kontrola architektury).
// Od 2026-10-10 se načítá PEVNÁ verze s otiskem (SRI) — dřív `@2`, takže se každé nové vydání nahrálo všem samo a bez kontroly.
// Od 2026-10-10 (večer) ji hostujeme U NÁS: v2/vendor/supabase.min.js (owner „4. ano, hostuj u nás“, DECISIONS 2026-10-10 (33)) —
// z cdn.jsdelivr.net dostával jsDelivr IP každého návštěvníka a když nejel, appka se nespustila.
// Cena pevné verze: opravy z nových vydání nepřijdou samy. Skript ukáže, jestli je novější verze, ověří, že plná cesta dává bajtově
// tentýž soubor jako výchozí vstup balíčku, a s --zapsat ho uloží k nám + přepíše otisk a číslo verze v obou stránkách.
// Pak appku vyzkoušej (přihlášení, čtení) — řada 2.x může změnit chování.
//   node scripts/utils/supabase_js_pin.js                  → nejnovější 2.x, jen ukáže
//   node scripts/utils/supabase_js_pin.js 2.118.0          → konkrétní verze, jen ukáže
//   node scripts/utils/supabase_js_pin.js 2.118.0 --zapsat → stáhne do v2/vendor/ a přepíše stránky
'use strict';
const crypto = require('crypto'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const STRANKY = ['runar-reader.html', 'runar-shrine.html'];
const CIL = path.join(ROOT, 'v2', 'vendor', 'supabase.min.js');
const ZNACKA = /<!-- supabase-js ([\d.]+) \(u nás[^>]*-->/;
(async () => {
  const want = process.argv.slice(2).find((a) => !a.startsWith('--')) || '2';
  const r = await (await fetch('https://data.jsdelivr.com/v1/packages/npm/@supabase/supabase-js/resolved?specifier=' + want)).json();
  const ver = r.version;
  if (!ver) { console.log('verze nenalezena: ' + want); process.exit(1); }
  const url = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@' + ver + '/dist/umd/supabase.min.js';
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  const def = Buffer.from(await (await fetch('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@' + ver)).arrayBuffer());
  if (!buf.equals(def)) { console.log('POZOR: plná cesta dává jiný soubor než výchozí vstup balíčku — zkontroluj entrypoint'); process.exit(1); }
  const sri = 'sha384-' + crypto.createHash('sha384').update(buf).digest('base64');
  const html = fs.readFileSync(path.join(ROOT, 'v2', STRANKY[0]), 'utf8');
  const ted = (html.match(ZNACKA) || [])[1] || '?';
  console.log('v appce teď: ' + ted + '   ·   k dispozici: ' + ver + (ted === ver ? '   (aktuální)' : '   (NOVĚJŠÍ)'));
  console.log('integrity="' + sri + '"');
  if (!process.argv.includes('--zapsat')) return;
  fs.mkdirSync(path.dirname(CIL), { recursive: true });
  fs.writeFileSync(CIL, buf);
  for (const s of STRANKY) {
    const p = path.join(ROOT, 'v2', s);
    let t = fs.readFileSync(p, 'utf8');
    const n0 = (t.match(/src="vendor\/supabase\.min\.js" integrity="sha384-[^"]+"/g) || []).length;
    if (n0 !== 1 || !ZNACKA.test(t)) { console.log('POZOR: ' + s + ' nemá právě jeden <script src="vendor/supabase.min.js"> se značkou verze'); process.exit(1); }
    t = t.replace(/(src="vendor\/supabase\.min\.js" integrity=")sha384-[^"]+"/, '$1' + sri + '"')
         .replace(ZNACKA, (m) => m.replace(/supabase-js [\d.]+/, 'supabase-js ' + ver));
    fs.writeFileSync(p, t);
  }
  console.log('zapsáno: v2/vendor/supabase.min.js (' + buf.length + ' B) + otisk a verze v ' + STRANKY.join(', ') + ' — teď appku vyzkoušej');
})().catch((e) => { console.log('chyba: ' + e.message); process.exit(1); });
