// zpravy_gmail.js — zprávy čtenářů („Send Rúnar a line“) ve schránce runar@: zodpovězené označí v DB a určí vlákna k smazání po 6 měsících.
// Proč (owner 2026-10-16): k bodu 9 („až odpovíš, označ zprávu ve shrine jako fixed“) — „to dělej ty automaticky. já to dělat nebudu.“;
// k bodu 12 (kopie v Gmailu se samy nesmažou, Workspace na to pravidlo nemá) — „udělej plánovanou úlohu. chci vždy potvrzení že úloha
// po 6 měsících proběhla kde a co smazala. musíme mít kontroly! to platí pro všechna podobné příkazy.“
// Gmail vidí jen konektor v Claude, proto ho obsluhuje plánovaná úloha Claude podle postupu scripts/ulohy/zpravy-gmail.md. VŠECHNO
// rozhodování je tady (samotest --test): úloha jen přenese výsledek hledání a provede, co skript vypíše — model nic neposuzuje.
//   node scripts/utils/zpravy_gmail.js plan <stranky.json>               → označí zodpovězené v DB, vypíše „KOS: <threadId> …“
//   node scripts/utils/zpravy_gmail.js potvrd <stranky.json> [threadId…]  → potvrzení do ops_events (kind purge, job gmail_messages)
//   node scripts/utils/zpravy_gmail.js chyba "<popis>"                    → selhání běhu do ops_events (ok:false)
//   node scripts/utils/zpravy_gmail.js --test                             → samotest rozhodování (bez DB a bez sítě)
// Pravidla:
// - vlákno je naše, jen když jeho PRVNÍ zpráva přišla z noreply@therunekeeper.com s předmětem „A line from a reader“ a některá zpráva
//   nese štítek Messages (Label_7, memory schranka-runar-gmail). Cizí vlákno skript nikdy nepošle do koše, jen ho vypíše.
// - zodpovězeno = ve vlákně je zpráva odeslaná z runar@therunekeeper.com; resolved_at = čas poslední z nich (od něj běží 6 měsíců v DB,
//   public.purge_reader_messages v sql/2026-10-16_mazani_hlasi.sql)
// - do koše = POSLEDNÍ zpráva vlákna (kterýmkoli směrem) je starší než 6 měsíců; koš Gmailu maže sám po 30 dnech
// - párování s DB: značka „ref <8 znaků id>“ v předmětu (send-line od 2026-10-16); starší zprávy bez značky podle času příchodu (±120 s,
//   jen když sedí právě jedna)
// Registr mazacích úloh (kde se co maže, lhůta hlášení): supabase/functions/_shared/ops_souhrn.ts → MAZANI.gmail_messages.
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const { execFileSync } = require('child_process');

const REPO = path.resolve(__dirname, '..', '..');
const NAS = 'noreply@therunekeeper.com';
const MY = 'runar@therunekeeper.com';
const STITEK = 'Label_7';                       // Messages (memory schranka-runar-gmail)
const PREDMET = /A line from a reader/;
const REF = /\bref ([0-9a-f]{8})\b/;
const OKNO_S = 120;                             // párování bez značky: čas příchodu e-mailu ±120 s od uložení v DB
const SUPABASE = process.env.RUNAR_SUPABASE || (fs.existsSync(path.join(os.homedir(), 'scoop', 'shims', 'supabase.exe'))
  ? path.join(os.homedir(), 'scoop', 'shims', 'supabase.exe') : 'supabase');

const adresa = (s) => { const t = String(s || '').trim().toLowerCase(); const m = /<([^>]+)>/.exec(t); return (m ? m[1] : t).trim(); };
const cas = (s) => { const t = Date.parse(s); return Number.isFinite(t) ? t : null; };
function minus6mesicu(tedMs) { const d = new Date(tedMs); d.setUTCMonth(d.getUTCMonth() - 6); return d.getTime(); }

// Výsledek search_threads (jedna stránka nebo pole stránek) → vlákna bez duplicit.
function vlakna(stranky) {
  const pole = Array.isArray(stranky) ? stranky : [stranky];
  const o = new Map();
  for (const s of pole) for (const t of (s && s.threads) || []) if (t && t.id && !o.has(t.id)) o.set(t.id, t);
  return [...o.values()];
}

// Čisté rozhodnutí: co označit v DB, co do koše, co je cizí / nespárované. radky = zprávy z DB { id, id8, created_at, status, resolved_at }.
function naplanuj(stranky, radky, tedMs) {
  const hranice = minus6mesicu(tedMs);
  const plan = { vlaken: 0, oznacit: [], kos: [], cizi: [], nesparovano: [] };
  for (const t of vlakna(stranky)) {
    plan.vlaken++;
    const zpravy = (t.messages || []).filter((m) => cas(m.date) != null).sort((a, b) => cas(a.date) - cas(b.date));
    const prvni = zpravy[0];
    const nase = !!prvni && adresa(prvni.sender) === NAS && PREDMET.test(prvni.subject || '')
      && zpravy.some((m) => (m.labelIds || []).includes(STITEK));
    if (!nase) { plan.cizi.push(t.id); continue; }
    const ref = (REF.exec(prvni.subject || '') || [])[1] || null;
    const odpovedi = zpravy.filter((m) => adresa(m.sender) === MY);
    const odpoved = odpovedi.length ? odpovedi[odpovedi.length - 1].date : null;
    const posledni = zpravy[zpravy.length - 1].date;
    let radek = null;
    if (ref) radek = radky.find((r) => r.id8 === ref) || null;
    else {
      const kand = radky.filter((r) => Math.abs(cas(r.created_at) - cas(prvni.date)) <= OKNO_S * 1000);
      if (kand.length === 1) radek = kand[0];
    }
    const znacka = ref || (radek && radek.id8) || ('t:' + String(t.id).slice(-8));
    if (!radek) plan.nesparovano.push({ vlakno: t.id, znacka });
    if (radek && odpoved && (radek.status !== 'fixed' || !radek.resolved_at || cas(radek.resolved_at) < cas(odpoved)))
      plan.oznacit.push({ id: radek.id, id8: radek.id8, resolved_at: new Date(cas(odpoved)).toISOString() });
    if (cas(posledni) < hranice) plan.kos.push({ vlakno: t.id, znacka, posledni: new Date(cas(posledni)).toISOString() });
  }
  return plan;
}

// Potvrzení po přesunu do koše: co se povedlo, co ne, co nebylo v plánu (to se nesmí stát).
function vyhodnot(plan, presunute) {
  const p = new Set(presunute), v = new Set(plan.kos.map((k) => k.vlakno));
  const hotovo = plan.kos.filter((k) => p.has(k.vlakno));
  const selhalo = plan.kos.filter((k) => !p.has(k.vlakno));
  const navic = presunute.filter((x) => !v.has(x));
  return { ok: !selhalo.length && !navic.length, hotovo, selhalo, navic };
}

// ── DB (supabase CLI jako zaloha_db.js; JSON výstup přepíná AI_AGENT) ──
function q(sql) {
  const s = execFileSync(SUPABASE, ['db', 'query', '--linked', sql, '--workdir', REPO, '--output-format', 'json'],
    { encoding: 'utf8', maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, AI_AGENT: process.env.AI_AGENT || 'runar-zpravy-gmail' } });
  if (s.indexOf('{') < 0) throw new Error('supabase nevrátil JSON: ' + s.slice(0, 200));
  const j = JSON.parse(s.slice(s.indexOf('{')));
  if (!Array.isArray(j.rows)) throw new Error('dotaz selhal: ' + s.slice(0, 200));
  return j.rows;
}
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
function zapisUdalost(detail) {
  q("insert into public.ops_events (kind, detail) values ('purge', '" + JSON.stringify(Object.assign({ job: 'gmail_messages' }, detail)).replace(/'/g, "''") + "'::jsonb) returning id");
}
const planSoubor = (f) => f + '.plan.json';

function cmdPlan(soubor) {
  const stranky = JSON.parse(fs.readFileSync(soubor, 'utf8'));
  const radky = q("select id::text as id, left(id::text, 8) as id8, created_at, status, resolved_at from public.bug_reports where type = 'message'");
  const plan = naplanuj(stranky, radky, Date.now());
  for (const o of plan.oznacit) {
    if (!UUID.test(o.id) || !ISO.test(o.resolved_at)) throw new Error('neplatné id nebo čas: ' + o.id8);
    q("update public.bug_reports set status = 'fixed', resolved_at = '" + o.resolved_at + "' where id = '" + o.id + "' and type = 'message' returning id");
  }
  fs.writeFileSync(planSoubor(soubor), JSON.stringify(plan));
  console.log('vláken ve štítku Messages: ' + plan.vlaken + ' · označeno zodpovězených: ' + plan.oznacit.length
    + (plan.oznacit.length ? ' (' + plan.oznacit.map((o) => o.id8 + ' ' + o.resolved_at.slice(0, 10)).join(', ') + ')' : '')
    + ' · k smazání (poslední zpráva starší než 6 měsíců): ' + plan.kos.length);
  if (plan.cizi.length) console.log('CIZÍ vlákna ve štítku (nemažou se, zkontroluj filtr): ' + plan.cizi.join(' '));
  if (plan.nesparovano.length) console.log('bez řádku v DB (smazaný účet nebo už smazaná zpráva): ' + plan.nesparovano.map((n) => n.znacka).join(', '));
  console.log('KOS: ' + plan.kos.map((k) => k.vlakno).join(' '));
}

function cmdPotvrd(soubor, presunute) {
  const plan = JSON.parse(fs.readFileSync(planSoubor(soubor), 'utf8'));
  const v = vyhodnot(plan, presunute);
  zapisUdalost({ ok: v.ok, deleted: v.hotovo.length, items: v.hotovo.map((k) => k.znacka), marked: plan.oznacit.length,
    threads: plan.vlaken, failed: v.selhalo.length, unexpected: v.navic.length, foreign: plan.cizi.length });
  // Výsledek hledání nese adresy čtenářů (příjemci odpovědí) — po potvrzení pryč i on, ne jen plán.
  fs.rmSync(planSoubor(soubor), { force: true });
  fs.rmSync(soubor, { force: true });
  console.log((v.ok ? 'OK    ' : 'CHYBA ') + 'Gmail runar@ · štítek Messages: do koše ' + v.hotovo.length + ' vláken'
    + (v.hotovo.length ? ' (' + v.hotovo.map((k) => k.znacka + ', poslední zpráva ' + k.posledni.slice(0, 10)).join('; ') + ')' : '')
    + ' · označeno zodpovězených ' + plan.oznacit.length + ' · prošlo vláken ' + plan.vlaken
    + (v.selhalo.length ? ' · NEPŘESUNUTO ' + v.selhalo.map((k) => k.znacka).join(', ') : '')
    + (v.navic.length ? ' · MIMO PLÁN ' + v.navic.join(', ') : '') + ' — zapsáno do hlídání provozu (ops_events purge).');
  if (!v.ok) process.exitCode = 1;
}

function samotest() {
  const TED = Date.parse('2026-10-16T12:00:00Z');
  const m = (date, sender, subject, labels) => ({ date, sender, subject, labelIds: labels || ['Label_7'] });
  const S = 'Rúnar · A line from a reader';
  const stranky = [{ threads: [
    { id: 'A', messages: [m('2026-10-01T10:00:00Z', NAS, S + ' · ref aaaaaaaa'), m('2026-10-02T09:00:00Z', 'Rúnar <runar@therunekeeper.com>', 'Re: ' + S + ' · ref aaaaaaaa', [])] },
    { id: 'B', messages: [m('2026-03-01T08:00:00Z', NAS, S), m('2026-03-03T08:00:00Z', MY, 'Re: ' + S, [])] },
    { id: 'C', messages: [m('2025-01-01T08:00:00Z', 'someone@example.com', 'A line from a reader')] },
    { id: 'D', messages: [m('2026-10-05T08:00:00Z', NAS, S + ' · ref dddddddd'), m('2026-10-06T08:00:00Z', MY, 'Re: ' + S, [])] },
  ], nextPageToken: 'x' }, { threads: [
    { id: 'E', messages: [m('2026-02-01T08:00:00Z', NAS, S + ' · ref eeeeeeee')] },
    { id: 'F', messages: [m('2026-01-10T08:00:00Z', NAS, S + ' · ref ffffffff')] },
    { id: 'A', messages: [m('2026-10-01T10:00:00Z', NAS, S + ' · ref aaaaaaaa')] },
    { id: 'G', messages: [m('2026-01-10T08:00:00Z', NAS, S + ' · ref 99999999', ['INBOX'])] },
  ] }];
  const radky = [
    { id: 'aaaaaaaa-0000-0000-0000-000000000000', id8: 'aaaaaaaa', created_at: '2026-10-01T09:59:59Z', status: 'new', resolved_at: null },
    { id: 'bbbbbbbb-0000-0000-0000-000000000000', id8: 'bbbbbbbb', created_at: '2026-03-01T07:59:30Z', status: 'new', resolved_at: null },
    { id: 'dddddddd-0000-0000-0000-000000000000', id8: 'dddddddd', created_at: '2026-10-05T08:00:00Z', status: 'fixed', resolved_at: '2026-10-06T08:00:00.000Z' },
    { id: 'eeeeeeee-0000-0000-0000-000000000000', id8: 'eeeeeeee', created_at: '2026-02-01T08:00:00Z', status: 'new', resolved_at: null },
  ];
  const p = naplanuj(stranky, radky, TED);
  let fail = 0;
  const ok = (c, t) => { if (c) console.log('OK    ' + t); else { fail++; console.log('FAIL  ' + t); } };
  ok(p.vlaken === 7, 'dvě stránky, vlákno A dvakrát → 7 vláken');
  ok(JSON.stringify(p.oznacit.map((o) => o.id8 + '@' + o.resolved_at)) === JSON.stringify(['aaaaaaaa@2026-10-02T09:00:00.000Z', 'bbbbbbbb@2026-03-03T08:00:00.000Z']),
    'zodpovězené: A podle značky, B bez značky podle času (±120 s); D už fixed se stejným časem se znovu neoznačuje');
  ok(JSON.stringify(p.kos.map((k) => k.vlakno + ':' + k.znacka)) === JSON.stringify(['B:bbbbbbbb', 'E:eeeeeeee', 'F:ffffffff']),
    'do koše jen naše vlákna s poslední zprávou starší než 6 měsíců (B s odpovědí 3. 3., E bez odpovědi, F bez řádku v DB)');
  ok(JSON.stringify(p.cizi) === JSON.stringify(['C', 'G']), 'cizí: jiný odesílatel (C) a vlákno bez štítku Messages (G) — nikdy do koše, i když jsou staré');
  ok(JSON.stringify(p.nesparovano.map((n) => n.znacka)) === JSON.stringify(['ffffffff']), 'nespárované: značka bez řádku v DB (F)');
  const v1 = vyhodnot(p, ['B', 'E', 'F']), v2 = vyhodnot(p, ['B', 'E']), v3 = vyhodnot(p, ['B', 'E', 'F', 'C']);
  ok(v1.ok && v1.hotovo.length === 3, 'potvrzení: přesunuto vše z plánu → ok');
  ok(!v2.ok && v2.selhalo.map((k) => k.vlakno).join() === 'F', 'potvrzení: chybí F → chyba a F jmenovitě');
  ok(!v3.ok && v3.navic.join() === 'C', 'potvrzení: přesunuto cizí vlákno C mimo plán → chyba');
  const hr = new Date(minus6mesicu(TED)).toISOString().slice(0, 10);
  ok(hr === '2026-04-16', 'hranice 6 měsíců k 2026-10-16 = 2026-04-16 (jako interval \'6 months\' v SQL)');
  console.log(fail ? 'FAIL  zpravy_gmail: ' + fail + ' případů nesedí' : 'OK    zpravy_gmail: označení zodpovězených, koš po 6 měsících, cizí vlákna nikdy');
  process.exit(fail ? 1 : 0);
}

if (require.main === module) {
  const [cmd, a1, ...dalsi] = process.argv.slice(2);
  try {
    if (cmd === '--test') samotest();
    else if (cmd === 'plan' && a1) cmdPlan(a1);
    else if (cmd === 'potvrd' && a1) cmdPotvrd(a1, dalsi);
    else if (cmd === 'chyba') { zapisUdalost({ ok: false, deleted: 0, error: String(a1 || 'unknown').slice(0, 120) }); console.log('zapsáno selhání běhu do hlídání provozu'); }
    else { console.log('použití: plan <stranky.json> | potvrd <stranky.json> [threadId…] | chyba "<popis>" | --test'); process.exitCode = 2; }
  } catch (e) {
    console.log('CHYBA ' + e.message);
    try { zapisUdalost({ ok: false, deleted: 0, error: ('script: ' + e.message).slice(0, 120) }); } catch (_) { /* DB nedostupná — hlídání to pozná podle chybějícího záznamu */ }
    process.exitCode = 1;
  }
}
module.exports = { naplanuj, vyhodnot, vlakna, minus6mesicu };
