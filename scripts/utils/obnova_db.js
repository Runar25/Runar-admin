// obnova_db.js — zkouška obnovy noční zálohy do ZKUŠEBNÍHO projektu a porovnání s produkcí. CODE-read 2026-10-18.
//
// Proč: záloha, kterou nikdo nezkusil obnovit, je jen domněnka (owner 2026-10-15 „6. ověř ji“, 2026-10-16 „11. ano“). Ruční zkouška
// 2026-10-16 do Runar Testing prošla a našla díru v oprávněních (RUNAR_BACKLOG „Zálohy / DR“, `pgdump_runar.js` hlavička) — tenhle skript
// ji opakuje stejně pokaždé, ať se dá pouštět jednou měsíčně a po každé změně schématu.
// Pojistky: cíl nesmí být produkce (ref v pgdump_runar.PROD_REF) · cíl musí mít prázdné schéma public · vše v jedné transakci (chyba =
// nic se nezapíše) · z dat se neobnovuje cron/net/supabase_functions ani storage (kopie by volala produkci / mrtvé odkazy) · výpis se
// rozbaluje do dočasné složky a maže. Kopie nese skutečné osobní údaje → po zkoušce `--vycistit` (RUNAR_PRIVACY: zálohy 30 dní).
//   node scripts/utils/obnova_db.js                    nejnovější archiv → Runar Testing, porovnání s produkcí
//   node scripts/utils/obnova_db.js --archiv <cesta>   konkrétní archiv
//   node scripts/utils/obnova_db.js --vycistit         jen smazat kopii ve zkušebním projektu (public schéma + auth.users)
// Připojení: ~/.claude/runar-test-db-url.txt (cíl), ~/.claude/runar-db-url.txt (produkce, jen čtení na porovnání). Heslo zálohy
// ~/.claude/runar-zaloha-heslo.txt. Nic z toho se nevypisuje.
'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');
const pg = require('./pgdump_runar.js');

const H = os.homedir();
const CIL_URL = pg.url(process.env.RUNAR_TEST_DB_URL_FILE || path.join(H, '.claude', 'runar-test-db-url.txt'));
const PROD_URL_SOUBOR = path.join(H, '.claude', 'runar-db-url.txt');
const ARCHIV_DIR = process.env.RUNAR_ZALOHA_CIL || path.join(H, 'runar-eval', 'zaloha-db', 'archiv');
const SEVENZ = process.env.RUNAR_7Z || path.join(H, 'scoop', 'shims', '7z.exe');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const ENV = Object.assign({}, process.env, { PGCLIENTENCODING: 'UTF8' });

if (CIL_URL.indexOf(pg.PROD_REF) !== -1) { console.error('STOP: cíl je produkční projekt — obnova do produkce tímhle skriptem nejde.'); process.exit(1); }
const sql = (u, q) => pg.psql(u, ['-tAc', q], { env: ENV }).trim();

function vycistit() {
  pg.psql(CIL_URL, ['--single-transaction', '-v', 'ON_ERROR_STOP=1', '-q', '-c', 'DROP SCHEMA public CASCADE', '-c', 'CREATE SCHEMA public',
    '-c', 'GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role', '-c', 'GRANT ALL ON SCHEMA public TO postgres, service_role',
    // Celé schéma auth kromě historie migrací: 2026-10-18 zůstal po `DELETE FROM auth.users` plný auth.flow_state a další obnova spadla na
    // duplicitním klíči. Seznam tabulek se bere z DB, ať nový typ tabulky v auth nic nepřeskočí.
    '-c', "DO $$ DECLARE t text; BEGIN FOR t IN SELECT format('%I.%I', schemaname, tablename) FROM pg_tables WHERE schemaname = 'auth' AND tablename <> 'schema_migrations' LOOP EXECUTE 'TRUNCATE ' || t || ' CASCADE'; END LOOP; END $$"], { env: ENV });
  console.log('vyčištěno: ' + sql(CIL_URL, "select 'tabulky ' || (select count(*) from pg_tables where schemaname='public') || ', ucty ' || (select count(*) from auth.users) || ', buckety ' || (select count(*) from storage.buckets)"));
}

// Porovnání zdroj × cíl: jen počty a otisky, žádná data.
// Pozor: v string_agg řadit podle výrazu — `order by 1` je tam konstanta a pořadí vyjde náhodně (2026-10-18 dalo 5× falešné LIŠÍ).
const KONTROLY = [
  ['tabulky (řádky)', "select string_agg(t || '=' || n, ' ' order by t) from (select relname t, (xpath('/row/c/text()', query_to_xml('select count(*) c from public.\"' || relname || '\"', false, true, '')))[1]::text n from pg_stat_user_tables where schemaname='public') x"],
  ['účty a profily (ID)', "select md5(string_agg(u.id::text || coalesce(p.id::text,'-'), ',' order by u.id)) from auth.users u left join public.user_profiles p on p.id=u.id"],
  ['kredity', "select coalesce(sum(credits_balance),0) || '/' || coalesce(sum(free_balance),0) from public.user_profiles"],
  ['granty tabulek', "select md5(string_agg(table_name||grantee||privilege_type, ',' order by table_name||grantee||privilege_type)) from information_schema.role_table_grants where table_schema='public' and grantee in ('anon','authenticated','service_role')"],
  ['granty sloupců', "select md5(string_agg(table_name||column_name||grantee||privilege_type, ',' order by table_name||column_name||grantee||privilege_type)) from information_schema.column_privileges where table_schema='public' and grantee in ('anon','authenticated')"],
  ['granty funkcí', "select md5(string_agg(routine_name||grantee||privilege_type, ',' order by routine_name||grantee||privilege_type)) from information_schema.routine_privileges where routine_schema='public' and grantee in ('anon','authenticated','service_role','PUBLIC')"],
  ['politiky RLS', "select md5(string_agg(tablename||policyname||cmd||coalesce(qual,'')||coalesce(with_check,''), ',' order by tablename||policyname||cmd||coalesce(qual,'')||coalesce(with_check,''))) from pg_policies where schemaname='public'"],
  ['triggery', "select md5(string_agg(event_object_table||trigger_name||action_timing||event_manipulation, ',' order by event_object_table||trigger_name||action_timing||event_manipulation)) from information_schema.triggers where trigger_schema='public'"],
  // těla funkcí bez bílých znaků: obnova z Windows zapíše CRLF, chování to nemění (zjištěno 2026-10-16)
  ['těla funkcí', "select md5(string_agg(p.proname||md5(regexp_replace(p.prosrc,'\\s+',' ','g')), ',' order by p.proname||md5(regexp_replace(p.prosrc,'\\s+',' ','g')))) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.prokind='f'"],
];

function main() {
  if (process.argv.includes('--vycistit')) return vycistit();
  if (Number(sql(CIL_URL, "select count(*) from pg_tables where schemaname='public'")) > 0) {
    console.error('STOP: ve zkušebním projektu už jsou tabulky — napřed `node scripts/utils/obnova_db.js --vycistit`.'); process.exit(1);
  }
  const archiv = arg('--archiv') || path.join(ARCHIV_DIR, fs.readdirSync(ARCHIV_DIR).filter((f) => /^runar-db-.*\.7z$/.test(f)).sort().pop());
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'runar-obnova-'));
  try {
    const heslo = fs.readFileSync(path.join(H, '.claude', 'runar-zaloha-heslo.txt'), 'utf8').trim();
    execFileSync(SEVENZ, ['x', '-y', '-p' + heslo, '-o' + tmp, archiv], { stdio: 'ignore' });
    const najdi = (j) => { const f = fs.readdirSync(tmp, { recursive: true }).find((x) => path.basename(String(x)) === j); return f ? path.join(tmp, String(f)) : null; };
    const soubory = { roles: najdi('roles.sql'), schema: najdi('schema.sql'), data: najdi('data.sql') };
    if (!soubory.schema || !soubory.data) throw new Error('archiv ' + path.basename(archiv) + ' nemá výpis pg_dump (schema.sql / data.sql) — starší záloha jen s JSON');
    const dataObn = path.join(tmp, 'data_obnova.sql');
    fs.writeFileSync(dataObn, pg.dataProObnovu(fs.readFileSync(soubory.data, 'utf8')));
    const aclSoubor = path.join(tmp, 'acl.sql');
    fs.writeFileSync(aclSoubor, pg.opravOpravneni(fs.readFileSync(soubory.schema, 'utf8')));
    const args = ['--single-transaction', '-v', 'ON_ERROR_STOP=1', '-q'];
    if (soubory.roles) args.push('-f', soubory.roles);
    args.push('-f', soubory.schema, '-c', 'SET session_replication_role = replica', '-f', dataObn, '-c', 'SET session_replication_role = origin', '-f', aclSoubor);
    pg.psql(CIL_URL, args, { env: ENV });
    console.log('obnoveno z ' + path.basename(archiv) + ' → zkušební projekt');
    if (!fs.existsSync(PROD_URL_SOUBOR)) { console.log('porovnání přeskočeno: chybí ' + PROD_URL_SOUBOR); return; }
    const PROD = pg.url(PROD_URL_SOUBOR);
    let vad = 0;
    for (const [jm, q] of KONTROLY) {
      const a = sql(PROD, q), b = sql(CIL_URL, q);
      if (a === b) console.log('  SEDÍ  ' + jm);
      else { vad++; console.log('  LIŠÍ  ' + jm + (jm.startsWith('tabulky') || jm === 'kredity' ? '\n        produkce: ' + a + '\n        kopie:    ' + b : '')); }
    }
    console.log(vad ? 'ROZDÍLY: ' + vad + ' (tabulky se mohou lišit o řádky přibylé od zálohy)' : 'OK    obnova sedí s produkcí ve všech ' + KONTROLY.length + ' kontrolách');
    console.log('Kopie nese osobní údaje — po prohlédnutí: node scripts/utils/obnova_db.js --vycistit');
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
}
// Chyby bez adresy databáze: execFileSync vrací celý příkaz psql i s připojovacím řetězcem (v něm heslo) — 2026-10-18 se tak dostal do výstupu.
try { main(); } catch (e) {
  const zprava = String((e.stderr || '') + '\n' + (e.message || e)).replace(/postgres(ql)?:\/\/\S+/g, '<url>').split('\n')
    .filter((l) => /ERROR|DETAIL|HINT|CONTEXT|STOP|Error:/.test(l)).slice(0, 8).join('\n');
  console.error('CHYBA obnovy (transakce vrácena, nic se nezapsalo):\n' + zprava);
  process.exit(1);
}
