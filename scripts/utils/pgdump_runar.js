// pgdump_runar.js — logická záloha databáze (role, schéma, data) přes pg_dump bez Dockeru a její obnova. CODE-read 2026-10-16.
//
// Proč: noční záloha (zaloha_db.js) do 2026-10-16 ukládala jen JSON po tabulkách + popis schématu — úplné, ale databázi se z toho
// postavit nedalo (chybí DDL a pořadí cizích klíčů; RUNAR_BACKLOG „Zálohy / DR“). Owner 2026-10-16: „bezpečnou zálohu uděláme jak?“ ·
// „11. ano“ (zkouška obnovy v druhém Free projektu). Supabase doporučuje pro vlastní zálohu výpis roles / schema / data
// (supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore); `supabase db dump` chce Docker, tady není — ale
// `--dry-run` vypíše přesné příkazy pg_dump i s výjimkami Supabase, a ty se pustí s místním klientem (scoop postgresql17).
// Zkouška obnovy 2026-10-16 do projektu Runar Testing: všechny tabulky na řádek, účty se stejnými ID, kredity, politiky, triggery,
// funkce, rozšíření sedí. Našla tři věci, které tenhle modul ošetřuje:
//   1. Windowsový pg_dump nebere zkrácenou volbu `--quote-all-identifier` (GNU ji dopočítá) → přepis na `--quote-all-identifiers`.
//   2. Interní tabulky úložiště `storage.buckets_vectors`, `storage.vector_indexes` — do nich postgres v cíli nesmí (permission denied).
//   3. ⚠️ OPRÁVNĚNÍ: nový projekt dává každé nové tabulce výchozí granty pro anon/authenticated (INSERT/UPDATE/DELETE…). Výpis jen
//      PŘIDÁ produkční granty, výchozí neodebere → obnovená DB měla 90 grantů navíc, mj. na credit_ledger, allowed_emails a 6 na
//      user_profiles (sloupcové granty brání tomu, aby si uživatel zapsal kredity). Oprava `opravOpravneni`: odebrat role Supabase
//      a pustit znovu jen GRANT/REVOKE z výpisu schématu; ověřeno — tabulky 288, sloupce 1028, funkce 28 grantů = produkce.
// Při obnově se z dat vynechávají schémata cron / net / supabase_functions: obnovené naplánované úlohy by volaly produkční funkce.
// Záloha je nese celá (archiv je šifrovaný); vynechávají se až při obnově.
'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');

const PG_BIN = process.env.RUNAR_PG_BIN || path.join(os.homedir(), 'scoop', 'apps', 'postgresql17', 'current', 'bin');
const SUPABASE = process.env.RUNAR_SUPABASE || path.join(os.homedir(), 'scoop', 'shims', 'supabase.exe');
const BASH = process.env.RUNAR_BASH || 'C:/Program Files/Git/bin/bash.exe';
const PROD_REF = 'pmitxjvkeovijreepror';   // produkční projekt (v2/runar-config.js SB_URL) — obnova do něj je zakázaná
const DRUHY = { roles: ['--role-only'], schema: [], data: ['--data-only', '--use-copy'] };

function url(soubor) { return fs.readFileSync(soubor, 'utf8').replace(/^\uFEFF/, '').trim(); }

// Příkazy pg_dump tak, jak by je spustil `supabase db dump`, upravené pro místní Windows klient.
function skript(dbUrl, druh) {
  const out = execFileSync(SUPABASE, ['db', 'dump', '--db-url', dbUrl, '--dry-run', ...DRUHY[druh]],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  let s = out.split('\n').filter((l) => !/^(DRY RUN|Dumping)/.test(l)).join('\n');
  s = s.replace(/--quote-all-identifier(?!s)/g, '--quote-all-identifiers');
  if (druh === 'data') {
    const kotva = '    --exclude-table "storage.migrations" \\\n';
    if (s.indexOf(kotva) === -1) throw new Error('pg_dump data: kotva storage.migrations nenalezena — supabase CLI změnilo skript');
    s = s.replace(kotva, kotva + '    --exclude-table "storage.buckets_vectors" \\\n    --exclude-table "storage.vector_indexes" \\\n');
  }
  if (!/pg_dump(all)? \\/.test(s)) throw new Error('pg_dump ' + druh + ': ve skriptu není pg_dump');
  return s;
}

// Výpis roles.sql, schema.sql, data.sql do složky; vrací velikosti. Heslo jde jen přes proměnnou ve skriptu, nikam se nevypisuje.
function vypis(dbUrl, slozka) {
  const vel = {};
  for (const druh of ['roles', 'schema', 'data']) {
    const sh = path.join(slozka, '_' + druh + '.sh');
    fs.writeFileSync(sh, skript(dbUrl, druh), { mode: 0o600 });
    try {
      const sql = execFileSync(BASH, [sh], { encoding: 'utf8', maxBuffer: 1 << 30, env: Object.assign({}, process.env,
        { PATH: PG_BIN + path.delimiter + process.env.PATH }), stdio: ['ignore', 'pipe', 'pipe'] });
      fs.writeFileSync(path.join(slozka, druh + '.sql'), sql);
      vel[druh] = Buffer.byteLength(sql);
    } finally { fs.rmSync(sh, { force: true }); }
  }
  if (!vel.schema || !/CREATE TABLE/.test(fs.readFileSync(path.join(slozka, 'schema.sql'), 'utf8')))
    throw new Error('pg_dump: schema.sql bez CREATE TABLE');
  return vel;
}

// data.sql bez bloků COPY ze schémat, která se do cíle obnovovat nesmí (naplánované úlohy, síťová volání), a bez záznamů o souborech
// (`storage.objects`): soubory samotné záloha DB nenese, takže by po obnově zbyly mrtvé odkazy — a Supabase je SQL smazat nedovolí
// („Direct deletion from storage tables is not allowed“, zjištěno při úklidu Runar Testing 2026-10-16). Buckety (definice) se obnoví.
const BEZ_OBNOVY = ['cron', 'net', 'supabase_functions'];
const BEZ_OBNOVY_TABULKY = ['"storage"."objects"'];
function dataProObnovu(sql) {
  const radky = sql.split('\n'), out = [];
  let skip = false;
  for (const r of radky) {
    if (!skip && (BEZ_OBNOVY.some((s) => r.startsWith('COPY "' + s + '".')) || BEZ_OBNOVY_TABULKY.some((x) => r.startsWith('COPY ' + x + ' ')))) { skip = true; continue; }
    if (skip) { if (r === '\\.' || r === '\\.\r') skip = false; continue; }
    out.push(r);
  }
  return out.join('\n');
}

// Oprávnění po obnově přesně jako ve zdroji (bod 3 hlavičky).
function opravOpravneni(schemaSql) {
  const acl = schemaSql.split('\n').filter((l) => /^(GRANT|REVOKE) /.test(l)).join('\n');
  return [
    'GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO PUBLIC;',   // výchozí stav Postgresu; výpis REVOKE FROM PUBLIC vrátí, kde má být
    'REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated, service_role;',
    'REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated, service_role;',
    'REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated, service_role;',
    acl, ''].join('\n');
}

function psql(dbUrl, args, opts) {
  return execFileSync(path.join(PG_BIN, 'psql.exe'), [dbUrl, ...args], Object.assign({ encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 1 << 28 }, opts || {}));
}

module.exports = { PG_BIN, PROD_REF, url, skript, vypis, dataProObnovu, opravOpravneni, psql, BEZ_OBNOVY };

if (require.main === module && process.argv.includes('--test')) {
  // Samotest čistých funkcí (bez sítě): filtr COPY bloků, oprava oprávnění.
  const d = ['SET x;', 'COPY "cron"."job" ("a") FROM stdin;', '1', '\\.', 'COPY "public"."readings" ("a") FROM stdin;', '2', '\\.',
    'COPY "net"."http_request_queue" ("a") FROM stdin;', '3', '\\.', 'COPY "storage"."objects" ("a") FROM stdin;', '4', '\\.',
    'COPY "storage"."buckets" ("a") FROM stdin;', '5', '\\.', 'RESET ALL;'].join('\n');
  const f = dataProObnovu(d);
  const ok1 = f.indexOf('cron') === -1 && f.indexOf('"net"') === -1 && f.indexOf('"readings"') !== -1 && f.indexOf('\n2\n') !== -1
    && f.indexOf('"objects"') === -1 && f.indexOf('"buckets"') !== -1;
  const a = opravOpravneni('CREATE TABLE x;\nGRANT SELECT ON TABLE "public"."x" TO "anon";\nREVOKE ALL ON FUNCTION "public"."f"() FROM PUBLIC;');
  const ok2 = /REVOKE ALL ON ALL TABLES/.test(a) && /GRANT SELECT ON TABLE "public"\."x"/.test(a) && a.indexOf('CREATE TABLE') === -1
    && a.indexOf('TO PUBLIC;') < a.indexOf('FROM PUBLIC;');
  console.log(ok1 && ok2 ? 'OK    samotest pgdump_runar: filtr cron/net drží public data; oprávnění: odebrat, pak granty z výpisu'
    : 'FAIL  samotest pgdump_runar ' + JSON.stringify({ ok1, ok2 }));
  process.exit(ok1 && ok2 ? 0 : 1);
}
