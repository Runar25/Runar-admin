// verify_mazani.js — smoke ㊊: každé automatické mazání je v registru MAZANI a hlásí, kde a co smazalo.
// Proč (owner 2026-10-16): „chci vždy potvrzení že úloha po 6 měsících proběhla kde a co smazala. musíme mít kontroly! to platí pro
// všechna podobné příkazy.“ Hlídání provozu (ops-watch) umí ohlásit jen úlohu, o které ví. Do 2026-10-16 běžela všechna mazání tiše:
// pg_cron zpráv čtenářů, staré zálohy na PC a Drive, historie ElevenLabs (výsledek jen v logu funkce — 2026-10-14 nezabralo a poznal to
// až owner ze snímku). Nové mazání, které se do registru nedostane, by běželo stejně tiše — proto kontrola, ne jen pravidlo v docu (§30).
// Co hlídá:
//  1. registr: každá úloha z MAZANI (supabase/functions/_shared/ops_souhrn.ts) má zdroj, který existuje, zapisuje „purge“ a nese klíč úlohy;
//  2. mazání mimo registr — každé musí patřit k úloze z registru, nebo stát ve VYJIMKY s datem a důvodem:
//     (a) edge funkce, která volá API metodou DELETE;
//     (b) pg_cron, jehož POSLEDNÍ naplánování (nejnovější soubor v sql/) maže přímo `delete from` místo funkce, která hlásí;
//     (c) postup plánované úlohy Claude (scripts/ulohy/*.md), který přesouvá do koše, bez skriptu z registru;
//     (d) skript zálohy (scripts/utils/zaloha*.js), který maže soubory;
//  3. hlídání: ops-watch čte registr (stav purge) a ranní souhrn skládá řádek „Deleted (24 h)“.
// NETVRDÍ: že úloha opravdu běží (to v provozu hlásí ops-watch) ani že maže správné věci (samotesty úloh: zaloha_db.js --test-lhuta,
// zpravy_gmail.js --test). Mazání na žádost uživatele (smazání účtu) není automatická úloha — potvrzení dostane on v appce.
//   node scripts/verify_mazani.js            · node scripts/verify_mazani.js --test (kontrola sama sebe)
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = process.env.RUNAR_ROOT || path.resolve(__dirname, '..');
const SOUHRN = 'supabase/functions/_shared/ops_souhrn.ts';
const OPS_WATCH = 'supabase/functions/ops-watch/index.ts';
// Soubory, které maží, ale nejsou automatické mazání dat — každý s datem a důvodem (§28); výjimka bez souboru kontrolu shodí.
const VYJIMKY = {
  'scripts/utils/zaloha_konverzaci.js': '2026-10-16 maže jen dočasný soubor a složky vlastního samotestu; archivy konverzací nikdy '
    + '(hlavička: „NIC SE NEMAŽE“).',
};

function registr(src) {
  let strip;
  try { strip = require('node:module').stripTypeScriptTypes; } catch (e) { strip = null; }
  if (typeof strip !== 'function') throw new Error('tenhle Node neumí stripTypeScriptTypes (potřeba Node ≥ 22.13)');
  process.removeAllListeners('warning'); process.on('warning', () => {});
  const S = {}; vm.createContext(S);
  vm.runInContext(strip(src).replace(/^export\s+/gm, '') + '\n;globalThis.__m = MAZANI;', S);
  return S.__m;
}

// Jádro nad mapou {cesta: obsah} — stejné pro skutečný strom i samotest.
function zkontroluj(soubory) {
  const chyby = [];
  if (!soubory[SOUHRN]) return ['chybí ' + SOUHRN];
  let M;
  try { M = registr(soubory[SOUHRN]); } catch (e) { return ['registr MAZANI nejde načíst: ' + e.message]; }
  if (!M || !Object.keys(M).length) return ['registr MAZANI je prázdný'];
  const zdroje = new Set();
  // 1) registr
  for (const [job, m] of Object.entries(M)) {
    const z = soubory[m.zdroj];
    zdroje.add(m.zdroj);
    if (z == null) { chyby.push(job + ': zdroj ' + m.zdroj + ' neexistuje'); continue; }
    if (!/purge/.test(z)) chyby.push(job + ': ' + m.zdroj + ' nezapisuje „purge“ — mazání by neslo potvrdit');
    if (z.indexOf(job) < 0) chyby.push(job + ': ' + m.zdroj + ' nenese klíč úlohy „' + job + '“');
  }
  const kryto = (p) => zdroje.has(p) || Object.prototype.hasOwnProperty.call(VYJIMKY, p);
  // 2a) edge funkce s DELETE
  for (const p of Object.keys(soubory).filter((x) => /^supabase\/functions\/[^/]+\/index\.ts$/.test(x)))
    if (/method:\s*["']DELETE["']/.test(soubory[p]) && !kryto(p)) chyby.push(p + ': volá API metodou DELETE a není v registru MAZANI');
  // 2b) pg_cron: poslední naplánování každé úlohy
  const posledni = {};
  for (const p of Object.keys(soubory).filter((x) => /^sql\/[^/]+\.sql$/.test(x)).sort()) {
    const re = /cron\.schedule\(\s*'([^']+)'\s*,\s*'[^']*'\s*,\s*\$\$([\s\S]*?)\$\$\s*\)/g;
    let m;
    while ((m = re.exec(soubory[p]))) posledni[m[1]] = { soubor: p, prikaz: m[2] };
  }
  for (const [jm, x] of Object.entries(posledni))
    if (/\bdelete\s+from\b/i.test(x.prikaz)) chyby.push('pg_cron „' + jm + '“ (' + x.soubor + ') maže přímo `delete from` — mazání patří do funkce, která zapíše „purge“');
  // 2c) postupy plánovaných úloh
  for (const p of Object.keys(soubory).filter((x) => /^scripts\/ulohy\/[^/]+\.md$/.test(x)))
    if (/trash_(thread|message)/.test(soubory[p]) && ![...zdroje].some((z) => soubory[p].indexOf(z) >= 0))
      chyby.push(p + ': přesouvá do koše bez skriptu z registru MAZANI — smazání by neslo potvrdit');
  // 2d) skripty záloh
  for (const p of Object.keys(soubory).filter((x) => /^scripts\/utils\/zaloha[^/]*\.js$/.test(x)))
    if (/unlinkSync\(|rmSync\(/.test(soubory[p]) && !kryto(p)) chyby.push(p + ': maže soubory a není v registru MAZANI ani ve VYJIMKY');
  for (const p of Object.keys(VYJIMKY)) if (soubory[p] == null) chyby.push('výjimka pro ' + p + ' — soubor už není, smaž ji');
  // 3) hlídání
  const ow = soubory[OPS_WATCH] || '';
  if (!/mazaniPosledni/.test(ow) || !/MAZANI/.test(ow)) chyby.push(OPS_WATCH + ': nečte registr MAZANI — stav purge by nikdo nehlídal');
  if (!/cisla\.push\(mazaniVeta\(/.test(soubory[SOUHRN])) chyby.push(SOUHRN + ': ranní souhrn neskládá řádek „Deleted (24 h)“');
  return chyby;
}

function nactiStrom() {
  const o = {};
  const pridej = (rel) => { o[rel] = fs.readFileSync(path.join(ROOT, rel), 'utf8'); };
  const projdi = (dir, re) => {
    const abs = path.join(ROOT, dir);
    if (!fs.existsSync(abs)) return;
    for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
      const rel = dir + '/' + e.name;
      if (e.isDirectory()) projdi(rel, re); else if (re.test(rel)) pridej(rel);
    }
  };
  projdi('supabase/functions', /\.ts$/);
  projdi('sql', /\.sql$/);
  projdi('scripts/ulohy', /\.md$/);
  projdi('scripts/utils', /\.js$/);
  return o;
}

function samotest() {
  const zaklad = nactiStrom();
  let fail = 0;
  const ok = (c, t) => { if (c) console.log('OK    ' + t); else { fail++; console.log('FAIL  ' + t); } };
  const s = (zmena) => zkontroluj(Object.assign({}, zaklad, zmena));
  ok(s({}).length === 0, 'skutečný strom projde');
  const bezPurge = zaklad['scripts/utils/zaloha_db.js'].replace(/'purge'/g, "'xxx'");
  ok(s({ 'scripts/utils/zaloha_db.js': bezPurge }).some((c) => /backups_pc: .*nezapisuje „purge“/.test(c)), 'zdroj bez zápisu „purge“ → chyba');
  ok(s({ 'supabase/functions/novy/index.ts': 'await fetch(u, { method: "DELETE" })' }).some((c) => /novy\/index\.ts: volá API metodou DELETE/.test(c)),
    'nová edge funkce s DELETE mimo registr → chyba');
  ok(s({ 'sql/2099-01-01_x.sql': "select cron.schedule('nova', '0 1 * * *', $$delete from public.x where y$$);" }).some((c) => /pg_cron „nova“/.test(c)),
    'nový pg_cron, který maže přímo → chyba');
  ok(s({ 'sql/2099-01-01_x.sql': "select cron.schedule(\n  'zpravy-runarovi-mazani',\n  '10 3 * * *',\n  $$delete from public.bug_reports where 1=0$$\n);" })
    .some((c) => /zpravy-runarovi-mazani/.test(c)), 'novější soubor vrátí přímé mazání u existující úlohy (víc řádků) → chyba');
  ok(s({ 'scripts/ulohy/nova.md': 'Každé vlákno přesuň nástrojem trash_thread.' }).some((c) => /nova\.md: přesouvá do koše/.test(c)),
    'postup úlohy s košem bez skriptu z registru → chyba');
  ok(s({ 'scripts/utils/zaloha_nova.js': 'fs.unlinkSync(f);' }).some((c) => /zaloha_nova\.js: maže soubory/.test(c)), 'nový skript zálohy, který maže → chyba');
  const bezHlidani = zaklad[OPS_WATCH].replace(/mazaniPosledni/g, 'x');
  ok(s({ [OPS_WATCH]: bezHlidani }).some((c) => /nečte registr MAZANI/.test(c)), 'ops-watch registr nečte → chyba');
  ok(s({ 'sql/2099-01-01_x.sql': "select cron.schedule('jina', '0 1 * * *', $$select net.http_post(url := 'x')$$);" }).length === 0,
    'pg_cron bez mazání (volání funkce) projde');
  console.log(fail ? 'FAIL  verify_mazani samotest: ' + fail + ' případů nesedí' : 'OK    verify_mazani samotest: registr, DELETE, pg_cron, koš, zálohy, hlídání');
  process.exit(fail ? 1 : 0);
}

if (process.argv.includes('--test')) samotest();
else {
  const chyby = zkontroluj(nactiStrom());
  for (const c of chyby) console.log('FAIL  ' + c);
  console.log(chyby.length ? 'FAIL  automatická mazání: ' + chyby.length + ' bez potvrzení nebo mimo registr'
    : 'OK    automatická mazání: všechna v registru MAZANI, každé hlásí „purge“, ops-watch je hlídá a souhrn je ukazuje');
  process.exit(chyby.length ? 1 : 0);
}
