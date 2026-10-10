// Automatická záloha produkční databáze Rúnara (KUKY 2026-10-10: „začneme dělat automaticky… zatím Free, před produkcí Supabase Pro“).
//
// Proč: `supabase backups list` 2026-10-10 vrátil prázdný seznam — Free plán nezálohuje (RUNAR_BACKLOG.md „Zálohy / DR“). Pro by
// zálohoval denně 7 dní, ale i pak chceme kopii nezávislou na účtu u Supabase a delší historii.
// Co dělá (bez Dockeru — `supabase db dump` ho vyžaduje, tady není):
//   1. každá tabulka public + auth.users (id, e-mail, časy) jako JSON, schéma (sloupce, politiky, funkce, triggery, cizí klíče,
//      granty, buckety, seznam souborů) — přes `supabase db query --linked`, jen čtení;
//   2. kontrola: každá tabulka, která v databázi má řádky, je má i v exportu (jinak konec s chybou, archiv nevznikne);
//   3. 7z AES-256 se šifrovanými názvy (-mhe=on), heslo ze souboru MIMO repo i cíl (~/.claude/runar-zaloha-heslo.txt —
//      vytvoří se při prvním běhu; owner si ho MUSÍ uložit i jinam, bez něj je záloha k ničemu);
//   4. statické audio jen když se změnilo (otisk seznamu runar_static_audio) — mění se zřídka a má ~21 MB;
//   5. ověření archivu (`7z t`) a řádek do logu. Při chybě exit 1.
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

function log(m) { const r = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' ' + m; fs.appendFileSync(LOG, r + '\n'); console.log(r); }
function q(sql) {
  let s;
  try {
    s = execFileSync(SUPABASE, ['db', 'query', '--linked', sql, '--workdir', REPO, '--output-format', 'json'], { encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, AI_AGENT: process.env.AI_AGENT || 'runar-zaloha' } });
  } catch (e) { throw new Error('supabase selhal: ' + String((e.stderr || '') + (e.stdout || '') || e.message).slice(0, 300)); }
  if (s.indexOf('{') < 0) throw new Error('supabase nevrátil JSON: ' + s.slice(0, 300));
  const j = JSON.parse(s.slice(s.indexOf('{')));
  if (!Array.isArray(j.rows)) throw new Error('dotaz selhal: ' + s.slice(0, 200));
  return j.rows;
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
      const rows = q(`select * from public."${t}"`);
      if ((pocty[t] || 0) > 0 && rows.length === 0) throw new Error('tabulka ' + t + ' má v DB ~' + pocty[t] + ' řádků, export 0');
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
      buckety: q('select id, public, file_size_limit from storage.buckets'),
      soubory: q("select bucket_id, name, (metadata->>'size') bajtu, created_at from storage.objects order by 1,2"),
    }));
    fs.writeFileSync(path.join(tmp, 'souhrn.json'), JSON.stringify({ kdy: new Date().toISOString(), radku: souhrn }));
    const archivDb = path.join(CIL, 'runar-db-' + DEN + '.7z');
    zabal(archivDb, fs.readdirSync(tmp).map((f) => path.join(tmp, f)), h);
    naDrive(archivDb);
    log('DB ok → ' + archivDb + ' (' + fs.statSync(archivDb).size + ' B; ' + Object.entries(souhrn).map(([k, v]) => k + ' ' + v).join(', ') + ')');

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
main().catch((e) => { log('CHYBA: ' + e.message); process.exit(1); });
