// Automatická záloha produkční databáze Rúnara (KUKY 2026-10-10: „začneme dělat automaticky… zatím Free, před produkcí Supabase Pro“).
//
// Proč: `supabase backups list` 2026-10-10 vrátil prázdný seznam — Free plán nezálohuje (RUNAR_BACKLOG.md „Zálohy / DR“). Pro by
// zálohoval denně 7 dní, ale i pak chceme kopii nezávislou na účtu u Supabase a delší historii.
// Co dělá (bez Dockeru — `supabase db dump` ho vyžaduje, tady není):
//   1. každá tabulka public + auth.users (id, e-mail, časy) jako JSON, schéma (sloupce, politiky, funkce + kdo je smí spustit, RLS,
//      granty tabulek, indexy, rozšíření — od 2026-10-10; triggery, cizí klíče,
//      granty, buckety, seznam souborů) — přes `supabase db query --linked`, jen čtení;
//   2. kontrola: každá tabulka, která v databázi má řádky, je má i v exportu (jinak konec s chybou, archiv nevznikne);
//   3. 7z AES-256 se šifrovanými názvy (-mhe=on), heslo ze souboru MIMO repo i cíl (~/.claude/runar-zaloha-heslo.txt —
//      vytvoří se při prvním běhu; owner si ho MUSÍ uložit i jinam, bez něj je záloha k ničemu);
//   4. statické audio jen když se změnilo (otisk seznamu runar_static_audio) — mění se zřídka a má ~21 MB;
//   5. ověření archivu (`7z t`) a řádek do logu. Při chybě exit 1.
//   6. po úspěšné nové záloze smaže archivy DB starší než 30 dní — lokálně i na Drive (lhůta ze zásad soukromí, 2026-10-10).
//   node scripts/utils/zaloha_db.js --test-lhuta → samotest mazání v dočasných složkách (záloha neběží, nic skutečného se nemaže).
// Data nesou osobní údaje → nic z toho nejde do repa; skript sám žádné tajemství neobsahuje.
//   node scripts/utils/zaloha_db.js            → cíl z RUNAR_ZALOHA_CIL, jinak ~/runar-eval/zaloha-db/archiv
//   node scripts/utils/zaloha_db.js --cil <složka>
'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os'), crypto = require('crypto');

const REPO = path.resolve(__dirname, '..', '..');
const ROOT = path.join(os.homedir(), 'runar-eval', 'zaloha-db');
const ai = process.argv.indexOf('--cil');
const CIL = ai > 0 ? process.argv[ai + 1] : (process.env.RUNAR_ZALOHA_CIL || path.join(ROOT, 'archiv'));
const HESLO = path.join(os.homedir(), '.claude', 'runar-zaloha-heslo.txt');
// Kopie na Google Drive účtu runar@therunekeeper.com (owner 2026-10-10: „google drive… runar@therunekeeper.com“) — Drive pro počítač
// ho připojuje jako H:. Synchronizaci do cloudu dělá Drive sám. Lokální kopie (CIL) zůstává: když Drive nesynchronizuje, záloha nezmizí.
const DRIVE = process.env.RUNAR_ZALOHA_DRIVE || 'H:/My Drive/Runar-zalohy';
const STAV = path.join(ROOT, 'stav-audio.json');
const LOG = path.join(ROOT, 'log.txt');
const DEN = new Date().toISOString().slice(0, 10);
const SEVENZ = process.env.RUNAR_7Z || path.join(os.homedir(), 'scoop', 'shims', '7z.exe');
// Plné cesty: naplánovaná úloha nemusí mít v PATH scoop shims. A `--output-format json`: bez něj CLI pod plánovačem vypisuje tabulku
// místo JSON (2026-10-10: z plánovače padal dotaz, ručně ne). Změřeno týž den: JSON přepíná proměnná AI_AGENT (Claude Code ji
// nastavuje, plánovač ne) — `--output-format json` sám nestačí, proto ji skript nastaví sám.
const SUPABASE = process.env.RUNAR_SUPABASE || path.join(os.homedir(), 'scoop', 'shims', 'supabase.exe');

function log(m) {
  const r = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' ' + m;
  if (!process.env.RUNAR_ZALOHA_TICHY_LOG) fs.appendFileSync(LOG, r + '\n');   // samotest nepíše do skutečného logu
  console.log(r);
}
// Přechodná chyba Supabase se zkusí znovu (2026-10-15, CODE-tune): ráno po opravě kontroly padla záloha dvakrát po sobě na „unexpected
// login role status 520“ (Cloudflare) a o minutu později prošla. Noční úloha běží bez dozoru — jeden výpadek API znamenal noc bez zálohy.
// Tři pokusy s pauzou 20 s a 60 s; chyba SQL nebo oprávnění se neopakuje. Samotest: --test-prechodna.
const PRECHODNA = /status 5\d\d|error 5\d\d|ECONNRESET|ETIMEDOUT|EAI_AGAIN|ENOTFOUND|socket hang up|timed out|cloudflare/i;
function cekej(ms) { if (ms > 0) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
function spustSupabase(sql) {
  return execFileSync(SUPABASE, ['db', 'query', '--linked', sql, '--workdir', REPO, '--output-format', 'json'], { encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, AI_AGENT: process.env.AI_AGENT || 'runar-zaloha' } });
}
function q(sql, spust = spustSupabase) {
  let s;
  for (let pokus = 1; ; pokus++) {
    try { s = spust(sql); break; } catch (e) {
      const t = String((e.stderr || '') + (e.stdout || '') || e.message);
      if (pokus < 3 && PRECHODNA.test(t)) {
        log('supabase přechodně selhal (pokus ' + pokus + ' ze 3), zkouším znovu: ' + t.replace(/\s+/g, ' ').slice(0, 120));
        const env = process.env.RUNAR_ZALOHA_CEKANI_MS;
        cekej(env != null ? Number(env) : (pokus === 1 ? 20000 : 60000));
        continue;
      }
      throw new Error('supabase selhal: ' + t.slice(0, 300));
    }
  }
  if (s.indexOf('{') < 0) throw new Error('supabase nevrátil JSON: ' + s.slice(0, 300));
  const j = JSON.parse(s.slice(s.indexOf('{')));
  if (!Array.isArray(j.rows)) throw new Error('dotaz selhal: ' + s.slice(0, 200));
  return j.rows;
}
// Výsledek zálohy do ops_events pro hlídání provozu (2026-10-14, DECISIONS 2026-10-14 (13)): edge funkce ops-watch pošle upozornění, když
// záloha selže nebo úspěch chybí déle než 26 h (pozná i zálohu, která vůbec neběžela). Jen čísla a zkrácená chybová hláška, žádná data.
// Zápis nesmí zálohu nikdy shodit — tabulka nemusí existovat (sql/2026-10-14_ops_watch.sql) nebo může být DB nedostupná.
function hlasProvoz(kind, detail) {
  try {
    q("insert into public.ops_events (kind, detail) values ('" + kind + "', '" + JSON.stringify(detail).replace(/'/g, "''") + "'::jsonb) returning id");
  } catch (e) { log('ops_events (' + kind + ') nezapsáno: ' + String(e.message).slice(0, 150)); }
}
function heslo() {
  if (!fs.existsSync(HESLO)) {
    fs.mkdirSync(path.dirname(HESLO), { recursive: true });
    fs.writeFileSync(HESLO, crypto.randomBytes(24).toString('base64url') + '\n', { mode: 0o600 });
    log('vytvořeno nové heslo záloh: ' + HESLO + ' — ULOŽ HO I JINAM (správce hesel), bez něj nejde zálohu otevřít');
  }
  const h = fs.readFileSync(HESLO, 'utf8').trim();
  if (h.length < 20) throw new Error('heslo záloh je podezřele krátké');
  return h;
}
function zabal(archiv, soubory, h) {
  execFileSync(SEVENZ, ['a', '-t7z', '-mx=9', '-mhe=on', '-p' + h, archiv, ...soubory], { stdio: 'ignore' });
  execFileSync(SEVENZ, ['t', '-p' + h, archiv], { stdio: 'ignore' });   // ověř, že jde otevřít
}

// Lhůta záloh 30 dní (KUKY 2026-10-10 „7. ano, 30 dní“). Do té doby se archivy nemazaly vůbec — data smazaného účtu (e-mail, čtení)
// v nich zůstala natrvalo, zatímco zásady slibují „Delete your account… Everything goes“ (nález CODE-tune při psaní zásad, BACKLOG
// část 33). Maže se JEN archiv databáze `runar-db-RRRR-MM-DD.7z`, datum z názvu (čas změny Drive při synchronizaci přepisuje); archiv
// ze dne D zmizí v den D+30. Audio archivy osobní údaje nenesou a vznikají jen při změně — nemažou se. Běží až po úspěšné nové záloze.
// Co se smaže na Drive, padá do jeho koše; koš Google maže sám po 30 dnech (support.google.com/drive/answer/2375102).
const LHUTA_DNI = 30;
function smazStare(dnes, slozky) {
  const hranice = new Date(Date.parse(dnes + 'T00:00:00Z') - (LHUTA_DNI - 1) * 86400000).toISOString().slice(0, 10);
  const smazano = [];
  for (const dir of slozky) {
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      const m = /^runar-db-(\d{4}-\d{2}-\d{2})\.7z$/.exec(f);
      if (!m || m[1] >= hranice || m[1] === dnes) continue;
      fs.unlinkSync(path.join(dir, f));
      smazano.push(path.join(dir, f));
    }
  }
  return smazano;
}

// Kopie na Drive; když disk není (Drive pro počítač neběží / účet odpojen), chyba → exit 1 a řádek v logu, ať to není tiché.
function naDrive(soubor) {
  if (!fs.existsSync(path.parse(DRIVE).root)) throw new Error('Google Drive není připojený (' + DRIVE + ') — lokální záloha je v ' + soubor);
  fs.mkdirSync(DRIVE, { recursive: true });
  const cil = path.join(DRIVE, path.basename(soubor));
  fs.copyFileSync(soubor, cil);
  if (fs.statSync(cil).size !== fs.statSync(soubor).size) throw new Error('kopie na Drive nesedí velikostí: ' + cil);
}

async function main() {
  fs.mkdirSync(ROOT, { recursive: true });
  fs.mkdirSync(CIL, { recursive: true });
  const h = heslo();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'runar-zaloha-'));
  try {
    const tabulky = q("select tablename t from pg_tables where schemaname='public' order by 1").map((r) => r.t);
    const pocty = Object.fromEntries(q("select relname t, n_live_tup n from pg_stat_user_tables where schemaname='public'").map((r) => [r.t, Number(r.n)]));
    const souhrn = {};
    for (const t of tabulky) {
      let rows = q(`select * from public."${t}"`);
      // Prázdný export u tabulky, kde statistika hlásí řádky → rozhodne přesný počet. Proč (2026-10-15, CODE-tune): n_live_tup je jen
      // odhad a u reading_locks (zámky běžícího čtení, řádky hned mizí) zůstal na 1, i když tabulka byla prázdná — záloha kvůli tomu padala
      // každou noc od 2026-10-12 (log.txt), až ji 2026-10-15 nahlásilo hlídání provozu. Role zálohy (postgres) obchází RLS, takže count(*)
      // vidí totéž co export; druhý pokus o export kryje zámek, který mezi dotazy vznikl.
      if ((pocty[t] || 0) > 0 && rows.length === 0) {
        const n = Number((q(`select count(*) n from public."${t}"`)[0] || {}).n || 0);
        if (n > 0) rows = q(`select * from public."${t}"`);
        if (n > 0 && rows.length === 0) throw new Error('tabulka ' + t + ' má v DB ' + n + ' řádků, export 0');
      }
      fs.writeFileSync(path.join(tmp, 'public.' + t + '.json'), JSON.stringify(rows));
      souhrn[t] = rows.length;
    }
    const auth = q('select id, email, created_at, last_sign_in_at, raw_app_meta_data from auth.users order by created_at');
    fs.writeFileSync(path.join(tmp, 'auth.users.json'), JSON.stringify(auth));
    souhrn['auth.users'] = auth.length;
    fs.writeFileSync(path.join(tmp, 'schema.json'), JSON.stringify({
      sloupce: q("select table_name, column_name, data_type, is_nullable, column_default, ordinal_position from information_schema.columns where table_schema='public' order by table_name, ordinal_position"),
      politiky: q("select schemaname, tablename, policyname, permissive, roles::text, cmd, qual, with_check from pg_policies where schemaname in ('public','storage') order by 1,2,3"),
      funkce: q("select proname, pg_get_functiondef(oid) def from pg_proc where pronamespace='public'::regnamespace order by 1"),
      triggery: q("select event_object_table t, trigger_name, action_timing, event_manipulation, action_statement from information_schema.triggers where trigger_schema='public' order by 1,2"),
      cizi_klice: q("select conrelid::regclass::text tabulka, conname, pg_get_constraintdef(oid) def from pg_constraint where connamespace='public'::regnamespace order by 1,2"),
      granty_sloupcu: q("select table_name, grantee, privilege_type, string_agg(column_name, ',' order by column_name) cols from information_schema.column_privileges where table_schema='public' and grantee in ('anon','authenticated') group by 1,2,3 order by 1,2,3"),
      // 2026-10-10 (CODE-read): bez těchhle by obnova byla tichá díra — add_credits/use_credit smí dnes spustit JEN service_role,
      // nová funkce má výchozí EXECUTE pro PUBLIC; RLS a granty tabulek se při ručním CREATE TABLE taky nevezmou samy.
      opravneni_funkci: q("select p.proname, pg_get_function_identity_arguments(p.oid) args, r.rolname from pg_proc p cross join pg_roles r where p.pronamespace='public'::regnamespace and r.rolname in ('anon','authenticated','service_role') and has_function_privilege(r.oid, p.oid, 'EXECUTE') order by 1,3"),
      rls: q("select c.relname t, c.relrowsecurity rls, c.relforcerowsecurity force from pg_class c where c.relnamespace='public'::regnamespace and c.relkind='r' order by 1"),
      granty_tabulek: q("select table_name, grantee, string_agg(privilege_type, ',' order by privilege_type) prava from information_schema.role_table_grants where table_schema='public' and grantee in ('anon','authenticated','service_role') group by 1,2 order by 1,2"),
      indexy: q("select schemaname, tablename, indexname, indexdef from pg_indexes where schemaname in ('public','storage') order by 1,2,3"),
      rozsireni: q('select extname, extversion from pg_extension order by 1'),
      buckety: q('select id, public, file_size_limit from storage.buckets'),
      soubory: q("select bucket_id, name, (metadata->>'size') bajtu, created_at from storage.objects order by 1,2"),
    }));
    fs.writeFileSync(path.join(tmp, 'souhrn.json'), JSON.stringify({ kdy: new Date().toISOString(), radku: souhrn }));
    const archivDb = path.join(CIL, 'runar-db-' + DEN + '.7z');
    zabal(archivDb, fs.readdirSync(tmp).map((f) => path.join(tmp, f)), h);
    naDrive(archivDb);
    hlasProvoz('backup_ok', { bytes: fs.statSync(archivDb).size, tables: Object.keys(souhrn).length });
    log('DB ok → ' + archivDb + ' (' + fs.statSync(archivDb).size + ' B; ' + Object.entries(souhrn).map(([k, v]) => k + ' ' + v).join(', ') + ')');
    smazStare(DEN, [CIL, DRIVE]).forEach((f) => log('smazána záloha starší než ' + LHUTA_DNI + ' dní: ' + f));

    // Audio jen při změně: otisk = seznam (jazyk, runa, verze, adresa, změna)
    const audio = JSON.parse(fs.readFileSync(path.join(tmp, 'public.runar_static_audio.json'), 'utf8'));
    const otisk = crypto.createHash('sha1').update(JSON.stringify(audio.map((r) => [r.lang, r.rune_name, r.version, r.audio_url, r.updated_at]).sort())).digest('hex');
    const minule = fs.existsSync(STAV) ? JSON.parse(fs.readFileSync(STAV, 'utf8')).otisk : null;
    if (otisk !== minule) {
      const adir = path.join(tmp, 'audio'); fs.mkdirSync(adir);
      for (const r of audio) {
        const res = await fetch(r.audio_url);
        if (!res.ok) throw new Error('audio ' + r.audio_url + ' → ' + res.status);
        fs.writeFileSync(path.join(adir, r.lang + '_' + String(r.rune_name).toLowerCase() + '_' + r.version + '.mp3'), Buffer.from(await res.arrayBuffer()));
      }
      const archivA = path.join(CIL, 'runar-audio-' + DEN + '.7z');
      zabal(archivA, [adir], h);
      naDrive(archivA);
      fs.writeFileSync(STAV, JSON.stringify({ otisk, kdy: DEN, souboru: audio.length }));
      log('audio změněné → ' + archivA + ' (' + audio.length + ' souborů, ' + fs.statSync(archivA).size + ' B)');
    } else {
      log('audio beze změny — nezálohuje se');
    }
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });   // dočasná nešifrovaná data pryč (cesta z mkdtemp, nikdy prázdná)
  }
}
// Samotest lhůty: skutečná smazStare na dvou dočasných složkách (lokální + „Drive“), nikdy na CIL/DRIVE.
if (process.argv.includes('--test-lhuta')) {
  const dnes = '2026-11-15';
  const jmena = ['runar-db-2026-11-15.7z', 'runar-db-2026-10-17.7z', 'runar-db-2026-10-16.7z', 'runar-db-2026-10-01.7z',
    'runar-audio-2026-09-01.7z', 'runar-db-2026-09-01.7z.bak', 'jiny.txt'];
  const slozky = [fs.mkdtempSync(path.join(os.tmpdir(), 'runar-lhuta-a-')), fs.mkdtempSync(path.join(os.tmpdir(), 'runar-lhuta-b-'))];
  slozky.forEach((d) => jmena.forEach((j) => fs.writeFileSync(path.join(d, j), 'x')));
  const smazano = smazStare(dnes, slozky).map((f) => path.basename(f)).sort();
  const zbylo = slozky.map((d) => fs.readdirSync(d).sort().join(','));
  slozky.forEach((d) => fs.rmSync(d, { recursive: true, force: true }));
  // archiv z 10-16 je v den 11-15 starý 30 dní → pryč; z 10-17 (29 dní) zůstává; audio, .bak a cizí soubor nikdy
  const cekano = ['runar-db-2026-10-01.7z', 'runar-db-2026-10-01.7z', 'runar-db-2026-10-16.7z', 'runar-db-2026-10-16.7z'];
  const ok = JSON.stringify(smazano) === JSON.stringify(cekano) && zbylo[0] === zbylo[1]
    && zbylo[0] === 'jiny.txt,runar-audio-2026-09-01.7z,runar-db-2026-09-01.7z.bak,runar-db-2026-10-17.7z,runar-db-2026-11-15.7z';
  console.log((ok ? 'OK    ' : 'FAIL  ') + 'lhůta ' + LHUTA_DNI + ' dní k ' + dnes + ': smazáno ' + JSON.stringify(smazano) + '; zůstalo ' + zbylo[0]);
  process.exit(ok ? 0 : 1);
}
// Samotest opakování (2026-10-15): skutečná q() s podstrčeným spouštěčem, bez sítě a bez čekání — 520 dvakrát a pak JSON → řádky po třech
// pokusech; chyba SQL → hned chyba (jeden pokus); 520 třikrát → chyba po třech pokusech.
if (process.argv.includes('--test-prechodna')) {
  process.env.RUNAR_ZALOHA_TICHY_LOG = '1'; process.env.RUNAR_ZALOHA_CEKANI_MS = '0';
  const chyba = (stderr) => Object.assign(new Error('selhalo'), { stderr });
  const e520 = 'Initialising login role...\n{"_tag":"Error","error":{"code":"LegacyDbConfigLoginRoleStatusError","message":"unexpected login role status 520: Error 520: Web server is returning an unknown error"}}';
  const eSql = 'ERROR: relation "public.neni" does not exist (SQLSTATE 42P01)';
  const spoustec = (plan) => { let n = 0; const f = () => { const k = plan[n++]; if (k === 'ok') return '{"rows":[{"ok":1}]}'; throw chyba(k === '520' ? e520 : eSql); }; f.pocet = () => n; return f; };
  const zkus = (plan) => { const f = spoustec(plan); try { return { r: q('select 1 as ok', f), n: f.pocet() }; } catch (e) { return { chyba: e.message, n: f.pocet() }; } };
  const a = zkus(['520', '520', 'ok']), b = zkus(['sql', 'ok']), c = zkus(['520', '520', '520', 'ok']);
  const ok = a.r && a.r.length === 1 && a.n === 3 && /SQLSTATE/.test(b.chyba || '') && b.n === 1 && /status 520/.test(c.chyba || '') && c.n === 3;
  console.log((ok ? 'OK    ' : 'FAIL  ') + 'přechodná chyba Supabase: 520 → znovu (nejvýš 3 pokusy), chyba SQL hned · pokusy ' + [a.n, b.n, c.n].join('/'));
  process.exit(ok ? 0 : 1);
}
// Krok 7 (2026-10-11, KUKY „pravidelná záloha z konverzace… ať se nic neztratí“, DECISIONS 2026-10-11): šifrovaná kopie všech konverzací
// a hooků (zaloha_konverzaci.js). Běží VŽDY, i když záloha DB selže — do kola 3 kontroly (2026-10-11) jela jen po úspěchu DB, takže výpadek
// Supabase CLI by zastavil i zálohu konverzací, se kterou nesouvisí. Výsledek: DB selhala → exit 1; jen konverzace → exit 2.
function konverzace() {
  try {
    const out = execFileSync(process.execPath, [path.join(__dirname, 'zaloha_konverzaci.js')], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    log('konverzace: ' + out.trim().replace(/^OK\s+/, ''));
    return true;
  } catch (e) {
    log('CHYBA konverzace: ' + String((e.stdout || '') + (e.message || '')).trim().slice(0, 300));
    return false;
  }
}
if (process.env.RUNAR_ZALOHA_TEST_DB_SELZE) main = async () => { throw new Error('test: záloha DB selhala'); };   // jen samotest kroku 7
main().then(() => { if (!konverzace()) process.exitCode = 2; })
  .catch((e) => { log('CHYBA: ' + e.message); hlasProvoz('backup_fail', { error: String(e.message).replace(/\S+@\S+/g, '[e-mail]').slice(0, 200) });
    konverzace(); process.exit(1); });
