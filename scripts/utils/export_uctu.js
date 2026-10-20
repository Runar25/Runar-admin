// export_uctu.js — export osobních údajů JEDNOHO účtu (GDPR čl. 15 a 20) do JSON souboru mimo repo. CODE-read 2026-10-20.
//
// Proč: owner 2026-10-18 rozhodl, že export dostane člověk jen na žádost e-mailem z adresy účtu a odpověď jde na tutéž adresu
// (DECISIONS 2026-10-18 (3), RUNAR_PRIVACY.md „Retence + práva“). Do té doby nebylo čím export vyrobit — lhůta je měsíc.
//
// Co vyveze (čte jen produkční DB, nic nemění): účet (auth.users: e-mail, kdy vznikl, poslední přihlášení, způsob přihlášení),
// profil (user_profiles celý), všechna čtení i Asky (readings), pohyby kreditu (credit_ledger), uplatněné kódy Rúnakortu
// (gift_codes.used_by), hlas (voice_usage, voice_tickets), rozbory čtení (gpt_reviews), záznam na seznamu testerů (allowed_emails).
// NEvyveze: hlášení z appky (bug_reports) — nemají vazbu na účet, jen jméno, které si tester sám napsal; v souboru o tom stojí
// věta. Zálohy (30 dní) a přepisy konverzací se neprohledávají (RUNAR_PRIVACY.md).
//
// Bezpečnost: e-mail ani nic z dat se nevypisuje na obrazovku — jen počty a cesta k souboru. Soubor leží v ~/runar-export/
// (mimo git); po odeslání ho smaž. Najde-li se 0 nebo víc účtů, skončí bez souboru.
//
//   node scripts/utils/export_uctu.js --email <adresa>      (adresa, ze které přišla žádost)
//   node scripts/utils/export_uctu.js --uid <uuid>
//   node scripts/utils/export_uctu.js --test               (pravidlo § 19: vyveze účet ownera z ADMIN_EMAILS a ověří, že sedí počty)
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const { url, psql } = require('./pgdump_runar');

const DB_URL_SOUBOR = path.join(os.homedir(), '.claude', 'runar-db-url.txt');
const CIL = path.join(os.homedir(), 'runar-export');

// Jeden dotaz → jeden JSON. Vstup jde přes proměnné psql (:'email', :'uid'), ne skládáním řetězce — adresa ze žádosti je cizí text.
const SQL = String.raw`\set ON_ERROR_STOP on
\pset tuples_only on
\pset format unaligned
with u as (
  select id, email, created_at, email_confirmed_at, last_sign_in_at, raw_app_meta_data->>'provider' as provider
  from auth.users
  where (:'uid' <> '' and id::text = :'uid') or (:'email' <> '' and lower(email) = lower(:'email'))
), jeden as (select * from u where (select count(*) from u) = 1)
select case when (select count(*) from u) <> 1 then json_build_object('chyba', 'nalezeno uctu: ' || (select count(*) from u))
else json_build_object(
  'export', json_build_object('created_at', now(), 'by', 'Rúnar (Agndofa ehf.)', 'format', 'JSON',
    'note_en', 'Your personal data held by Rúnar. Bug reports sent from the app are not linked to accounts and are not included.',
    'note_is', 'Persónuupplýsingar þínar sem Rúnar geymir. Ábendingar sem sendar voru úr appinu eru ekki tengdar aðgangi og fylgja ekki með.'),
  'account', (select row_to_json(j) from jeden j),
  'profile', (select row_to_json(p) from public.user_profiles p where p.id = (select id from jeden)),
  'readings', (select coalesce(json_agg(r order by r.drawn_at), '[]'::json) from public.readings r where r.user_id = (select id from jeden)),  -- opt-out:ok 2026-10-20 export čl. 15/20 patří i účtu odhlášenému z analýzy
  'credit_ledger', (select coalesce(json_agg(c order by c.at), '[]'::json) from public.credit_ledger c where c.user_id = (select id from jeden)),
  'gift_codes_redeemed', (select coalesce(json_agg(json_build_object('code', g.code, 'credits', g.credits, 'used_at', g.used_at) order by g.used_at), '[]'::json)
                          from public.gift_codes g where g.used_by = (select id from jeden)),
  'voice_usage', (select coalesce(json_agg(v order by v.created_at), '[]'::json) from public.voice_usage v where v.user_id = (select id from jeden)),
  'voice_tickets', (select coalesce(json_agg(t order by t.created_at), '[]'::json) from public.voice_tickets t where t.user_id = (select id from jeden)),
  'reading_reviews', (select coalesce(json_agg(w order by w.created_at), '[]'::json) from public.gpt_reviews w where w.user_id = (select id from jeden)),
  'tester_list', (select coalesce(json_agg(a), '[]'::json) from public.allowed_emails a where lower(a.email) = lower((select email from jeden)))
) end;
`;

// stdio 'pipe' i pro vstup: psql() z pgdump_runar má stdin 'ignore' a dotaz by do psql nedošel (první běh 2026-10-20 vrátil prázdno).
function vyvez(dbUrl, kdo) {
  const args = ['-X', '-q', '-v', 'email=' + (kdo.email || ''), '-v', 'uid=' + (kdo.uid || ''), '-f', '-'];
  const out = psql(dbUrl, args, { input: SQL, stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  return JSON.parse(out);
}

function pocty(d) {
  const k = ['readings', 'credit_ledger', 'gift_codes_redeemed', 'voice_usage', 'voice_tickets', 'reading_reviews', 'tester_list'];
  return k.map((x) => x + ' ' + (Array.isArray(d[x]) ? d[x].length : '?')).join(' · ');
}

function hlavni() {
  const a = process.argv.slice(2);
  const i = (f) => { const n = a.indexOf(f); return n >= 0 ? a[n + 1] : ''; };
  const test = a.includes('--test');
  let kdo = { email: i('--email'), uid: i('--uid') };
  if (test) {
    // ADMIN_EMAILS z configu — účet ownera, jeho data smíme číst; adresa se nevypisuje.
    const cfg = fs.readFileSync(path.join(__dirname, '..', '..', 'v2', 'runar-config.js'), 'utf8');
    const m = cfg.match(/ADMIN_EMAILS\s*=\s*\[\s*'([^']+)'/);
    if (!m) { console.error('test: ADMIN_EMAILS v configu nenalezeno'); process.exit(2); }
    kdo = { email: m[1], uid: '' };
  }
  if (!kdo.email && !kdo.uid) { console.error('Použití: --email <adresa> | --uid <uuid> | --test'); process.exit(2); }
  let dbUrl;
  try { dbUrl = url(DB_URL_SOUBOR); } catch (e) { console.error('Chybí ' + DB_URL_SOUBOR); process.exit(2); }
  let d;
  try { d = vyvez(dbUrl, kdo); } catch (e) { console.error('Dotaz selhal: ' + String(e.stderr || e.message).replace(/postgres(ql)?:\/\/\S+/g, '<url>').slice(0, 400)); process.exit(1); }
  if (d.chyba) { console.error('Export neproběhl — ' + d.chyba + ' (čekám právě jeden).'); process.exit(1); }
  const uid8 = String(d.account.id).slice(0, 8);
  if (test) {
    // Seed-and-assert na hranici DB → soubor: počet čtení v exportu = počet řádků readings toho účtu, spočítaný zvlášť.
    const n = parseInt(psql(dbUrl, ['-X', '-q', '-At', '-v', 'uid=' + d.account.id, '-f', '-'],
      { input: "select count(*) from public.readings where user_id = :'uid';\n", stdio: ['pipe', 'pipe', 'pipe'] }).trim(), 10);   // opt-out:ok 2026-10-20 samotest exportu jednoho účtu, žádná analýza
    const ok = d.readings.length === n && d.profile && d.profile.id === d.account.id && d.export.note_is;
    console.log((ok ? 'OK' : 'FAIL') + ' export_uctu --test: účet ' + uid8 + '… · čtení v exportu ' + d.readings.length + ' / v DB ' + n + ' · ' + pocty(d));
    process.exit(ok ? 0 : 1);
  }
  fs.mkdirSync(CIL, { recursive: true });
  const soubor = path.join(CIL, 'runar-export-' + uid8 + '-' + new Date().toISOString().slice(0, 10) + '.json');
  fs.writeFileSync(soubor, JSON.stringify(d, null, 2), 'utf8');
  console.log('Hotovo: účet ' + uid8 + '… · ' + pocty(d));
  console.log('Soubor: ' + soubor);
  console.log('Pošli ho jako přílohu NA ADRESU ÚČTU (ne jinam) a pak ho smaž.');
}

if (require.main === module) hlavni();
module.exports = { SQL };
