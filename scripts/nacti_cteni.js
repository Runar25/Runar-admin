// NAČTI ČTENÍ A REPORTY — rutina, kterou CODE pouští, když owner řekne „načti (si) čtení a reporty“ (CODE-tune 2026-10-06).
//
// PROČ (KUKY 2026-10-06): „stačí, že to uděláš automaticky, když řeknu načti si čtení a reporty. To, co je v reportech, je taky
// důležité — ukazuje to na něco, co zmíním nebo někdo jiný!“ Do té doby se čtení a reporty stahovaly ručně a monitor ozvěn se
// pouštěl, jen když si na něj někdo vzpomněl. Jeden příkaz = pokaždé stejné okno a nic se nevynechá.
//
// CO DĚLÁ (vše od posledního zápisu monitoru — značka „do:“ v docs/monitor/ozveny.md; bez značky 2 dny zpět):
//   1) nová čtení → CELÉ řádky do souboru MIMO repo (nesou jména a otázky lidí; repo je veřejné) — ten soubor CODE čte
//   2) monitor ozvěn --nove --zapis → tabulka do docs/monitor/ozveny.md + ⚠ k ohlášení
//   3) hlášení z appky (bug_reports) se stavem „new“ (NEPŘEČTENÁ, bez ohledu na datum) → do terminálu (texty lidí do repa nepatří,
//      RUNAR_PRIVACY.md) a hned se OZNAČÍ jako přečtená („triaged“). Stav v DB je jediný zdroj (§20): každá session i po compactu
//      vidí jen to, co ještě nikdo nečetl. KUKY 2026-10-06: „načteš je, označ jako přečtené, uděláme je, co se neudělá, je backlog!“
//      Hotové:   node scripts/nacti_cteni.js --hotovo <id8> "<co se udělalo, commit>"   → „fixed“
//      Nehotové: node scripts/nacti_cteni.js --backlog <id8> "<položka v RUNAR_BACKLOG.md>" → zůstane „triaged“ s odkazem
//      ✦ Keep = „nechat“ (uložený text, ne úkol) — označí se přečtené a dál se neřeší.
//   node scripts/nacti_cteni.js [--od 2026-10-06] [--vystup <soubor.json>] [--bez-zapisu]
//   --bez-zapisu = monitor jen vypíše, nepřipíše do tabulky (zkušební běh — neposune značku pro ownerovo příští „načti“)
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i !== -1 ? process.argv[i + 1] : null; };
const TABULKA = path.join(ROOT, 'docs', 'monitor', 'ozveny.md');
function znacka() {   // táž značka, kterou čte monitor_ozveny.js --nove (stav žije v tabulce, §20)
  if (!fs.existsSync(TABULKA)) return null;
  const m = fs.readFileSync(TABULKA, 'utf8').match(/<!-- do: ([^>]+?) -->/g);
  return m ? m[m.length - 1].replace(/^<!-- do: | -->$/g, '') : null;
}
function dotaz(sql) {
  const src = cp.execSync('supabase db query --linked "' + sql.replace(/"/g, '\\"') + '"', { cwd: ROOT, encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 });
  const j = JSON.parse(src.slice(src.search(/[\[{]/)));
  return Array.isArray(j) ? j : j.rows;
}
const sqlText = (t) => String(t || '').replace(/'/g, "''");
// Načtená hlášení BEZ zápisu, co se s nimi stalo (2026-10-07, KUKY: „prostě si piš po načtení reportů, co jsme udělali“). Soubor
// mimo repo; --hotovo / --backlog z něj hlášení odebere a Stop-hook (~/.claude/runar-zprava-check.py) session, která hlášení načetla,
// tah neukončí, dokud v něm něco zbývá. Keep („nechat“) se nezapisuje — jeho zápis je samo označení přečtené.
const K_ZAPISU = path.join(os.homedir(), '.claude', 'runar-hlaseni-k-zapisu.json');
const kZapisu = () => { try { return JSON.parse(fs.readFileSync(K_ZAPISU, 'utf8')); } catch (e) { return {}; } };
const ulozKZapisu = (o) => { try { fs.writeFileSync(K_ZAPISU, JSON.stringify(o, null, 1)); } catch (e) {} };
// --hotovo / --backlog: jedno hlášení podle prvních znaků id (musí sedět právě jedno)
for (const [prep, stav, popis] of [['--hotovo', 'fixed', 'hotovo'], ['--backlog', 'triaged', 'backlog']]) {
  const id = arg(prep);
  if (!id) continue;
  const pozn = process.argv[process.argv.indexOf(prep) + 2] || '';
  if (!/^[0-9a-f-]{6,36}$/i.test(id) || !pozn.trim()) { console.log('Použití: ' + prep + ' <id8> "<poznámka>"'); process.exit(1); }
  const kolik = dotaz("select count(*) as n from bug_reports where id::text like '" + id + "%'");
  if (Number(kolik[0] && kolik[0].n) !== 1) { console.log('Id „' + id + '“ nesedí na právě jedno hlášení (' + (kolik[0] && kolik[0].n) + ').'); process.exit(1); }
  const r = dotaz("update bug_reports set status='" + stav + "'" + (stav === 'fixed' ? ', resolved_at=now()' : '')
    + ", notes=coalesce(nullif(notes,'') || ' · ', '') || '" + new Date().toISOString().slice(0, 10) + ' ' + popis + ': ' + sqlText(pozn) + "'"
    + " where id::text like '" + id + "%' returning id, status");
  console.log((r[0] ? r[0].id.slice(0, 8) + ' → ' + r[0].status : 'nic') + ' (' + popis + ')');
  const kz = kZapisu(); let zbyva = 0;
  for (const k of Object.keys(kz)) { if (k.indexOf(id) === 0) delete kz[k]; else zbyva++; }
  ulozKZapisu(kz);
  if (zbyva) console.log('   ještě bez zápisu: ' + zbyva + ' (' + Object.keys(kz).map((k) => k.slice(0, 8)).join(', ') + ')');
  process.exit(0);
}
const od = arg('--od') || znacka() || new Date(Date.now() - 2 * 864e5).toISOString();
const odSql = od.replace(/'/g, '');
const kratce = (s, n) => { const t = String(s || '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n) + '…' : t; };

// 1) čtení
const cteni = dotaz("select id, drawn_at, lang, rune_name, area, aol, seeking, intention, question, reading_mode, life_rune, short_text, follow_up, "
  + "prompt_draws, prompt_version, usage from readings where drawn_at > '" + odSql + "' order by drawn_at");
const vystup = arg('--vystup') || path.join(os.tmpdir(), 'runar_cteni_' + new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-') + '.json');
fs.writeFileSync(vystup, JSON.stringify(cteni, null, 1));
const poModelu = {}, poJazyku = {}; let asku = 0;
for (const r of cteni) {
  const m = String((r.usage && r.usage.model) || '?').replace('claude-', ''); poModelu[m] = (poModelu[m] || 0) + 1;
  poJazyku[r.lang] = (poJazyku[r.lang] || 0) + 1; asku += (r.follow_up || []).length;
}
console.log('══ ČTENÍ od ' + od.slice(0, 16) + ': ' + cteni.length + ' (Asků ' + asku + ') · ' + Object.entries(poModelu).map(([k, n]) => k + ' ' + n).join(', ')
  + ' · ' + Object.entries(poJazyku).map(([k, n]) => k + ' ' + n).join(', '));
console.log('   celé řádky (mimo repo): ' + vystup);

// 2) monitor ozvěn — jen když přibyla čtení (bez nich nemá co měřit a nic nepřipíše)
if (cteni.length) {
  const okno = arg('--od') ? ['--od', arg('--od')] : ['--nove'];   // táž okna jako čtení výš
  const zapis = !process.argv.includes('--bez-zapisu');
  const r = cp.spawnSync('node', [path.join(__dirname, 'monitor_ozveny.js')].concat(okno, zapis ? ['--zapis'] : []), { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  console.log('\n══ MONITOR OZVĚN' + (zapis ? ' (připsáno do docs/monitor/ozveny.md)' : ' (jen výpis, bez zápisu)'));
  console.log(String(r.stdout || '').split('\n').filter((l) => l.trim() && !/^Initialising/.test(l)).join('\n'));
  if (r.status !== 0) console.log('   ⚠ monitor skončil chybou: ' + kratce(r.stderr, 300));
}

// 3) hlášení — NEPŘEČTENÁ (stav „new“), bez ohledu na datum
const rep = dotaz("select id, created_at, type, status, message, flagged_text, suggested_replacement, screen_context, locale, app_version "
  + "from bug_reports where status = 'new' order by created_at");
const rozdelana = dotaz("select count(*) as n from bug_reports where status = 'triaged' and type <> 'keep'");
console.log('\n══ HLÁŠENÍ NOVÁ (nepřečtená): ' + rep.length + ' · přečtená a nehotová: ' + ((rozdelana[0] && rozdelana[0].n) || 0)
  + ' (hotová: --hotovo, nehotová do BACKLOGu: --backlog)');
for (const x of rep) {
  console.log('\n· ' + x.id.slice(0, 8) + ' · ' + String(x.created_at).slice(0, 16) + ' · ' + (x.type === 'keep' ? 'keep (nechat)' : x.type) + (x.locale ? ' · ' + x.locale : '') + (x.screen_context ? ' · ' + kratce(x.screen_context, 40) : ''));
  if (x.message) console.log('  zpráva: ' + kratce(x.message, 400));
  if (x.flagged_text) console.log('  označeno: ' + kratce(x.flagged_text, 300));
  if (x.suggested_replacement) console.log('  návrh: ' + kratce(x.suggested_replacement, 200));
}
// Přečteno → „triaged“ (keep s poznámkou „nechat“). Zkušební běh (--bez-zapisu) nic neoznačí.
if (rep.length && !process.argv.includes('--bez-zapisu')) {
  const ids = rep.map((x) => "'" + x.id + "'").join(',');
  dotaz("update bug_reports set status='triaged', notes=coalesce(nullif(notes,'') || ' · ', '') || '" + new Date().toISOString().slice(0, 10)
    + " přečteno' || case when type='keep' then ' (keep — nechat)' else '' end where id in (" + ids + ") and status='new' returning id");
  console.log('\n   ' + rep.length + ' hlášení označeno jako přečtená (triaged).');
  const kz = kZapisu();
  // 2026-10-10: + `session` (CLAUDE_CODE_SESSION_ID = session_id, který dostává Stop-hook) — hook pak zastaví jen session, která hlášení
  // načetla. Do té doby ji poznával podle textu „nacti_cteni.js“ v příkazech a zastavil i CODE-read, která soubor jen četla grepem.
  for (const x of rep) if (x.type !== 'keep') kz[x.id] = { nacteno: new Date().toISOString().slice(0, 16), zprava: kratce(x.message || x.flagged_text, 80),
                                                       session: process.env.CLAUDE_CODE_SESSION_ID || null };
  ulozKZapisu(kz);
  const n = Object.keys(kz).length;
  if (n) console.log('   ⚠ K zápisu (' + n + '): ke každému --hotovo <id8> "<co se udělalo>", nebo --backlog <id8> "<položka>". Dokud něco zbývá, Stop-hook tah neukončí.');
}
