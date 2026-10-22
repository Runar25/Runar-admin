// Smoke ㊈: hlídání provozu (supabase/functions/_shared/ops_souhrn.ts) na známých datech — kdy je problém, kdy jde e-mail, jak vypadá souhrn.
// Proč (CODE-tune 2026-10-14, DECISIONS 2026-10-14 (13)): upozornění, které nepřijde, je horší než žádné (owner se na něj spolehne), a
// upozornění, které chodí pořád, se přestane číst. Obojí visí na prazích a na rozhodnutí „jen při změně stavu“ — tady se protlačí
// skutečný kód (typy odstraní Node) a ověří VÝSLEDEK (§19): stav, předmět, „Needs you“, čísla, EN bez češtiny (§31), escapování.
//   node scripts/verify_ops_souhrn.js
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = process.env.RUNAR_ROOT || path.resolve(__dirname, '..');
let strip;
try { strip = require('node:module').stripTypeScriptTypes; } catch (e) { strip = null; }
if (typeof strip !== 'function') { console.log('FAIL  tenhle Node neumí stripTypeScriptTypes (potřeba Node ≥ 22.13)'); process.exit(1); }
process.removeAllListeners('warning'); process.on('warning', () => {});
const src = fs.readFileSync(path.join(ROOT, 'supabase', 'functions', '_shared', 'ops_souhrn.ts'), 'utf8');
const js = strip(src).replace(/^export\s+/gm, '');
const S = {}; vm.createContext(S);
vm.runInContext(js + '\n;globalThis.__o = { PRAHY, KLICE, MAZANI, BEHY, KVOTY, KLICE_SUPABASE, EGRESS_PRIPOMINKA, stavy, upozorneni, souhrn, vadyMazani, mazaniVeta, vadyBehu, behyVeta, kvotyNad };', S);
const O = S.__o;
let fail = 0;
const ok = (c, p) => { if (c) console.log('OK    ' + p); else { fail++; console.log('FAIL  ' + p); } };

const TED = '2026-10-14T05:00:00.000Z';
const hod = (h) => new Date(Date.parse(TED) - h * 3.6e6).toISOString();
const H = (o) => Object.assign({ ted: TED, chybModelu60: 0, zalohModelu60: 0, cteni60: 10, brzd60: 0,
  zaloha: { posledniOk: hod(3), bajtu: 5e6, posledniChyba: null } }, o);

// 1) stavy
ok(O.stavy(H({ chybModelu60: 3 })).model === 'problem' && O.stavy(H({ chybModelu60: 2 })).model === 'ok', 'model: 3 selhání za hodinu = problém, 2 ne');
ok(O.stavy(H({ zalohModelu60: 3, cteni60: 7 })).model === 'problem' && O.stavy(H({ zalohModelu60: 3, cteni60: 20 })).model === 'ok',
  'model: 3 přepnutí na zálohu při 30 % pokusů = problém, při 15 % ne');
ok(O.stavy(H({ brzd60: 1 })).voice_brake === 'problem' && O.stavy(H({})).voice_brake === 'ok', 'brzda hlasu: zásah za hodinu = problém');
ok(O.stavy(H({ zaloha: { posledniOk: hod(27), bajtu: 1, posledniChyba: null } })).backup === 'problem', 'záloha: poslední úspěch před 27 h = problém');
ok(O.stavy(H({ zaloha: { posledniOk: hod(2), bajtu: 1, posledniChyba: hod(1) } })).backup === 'problem', 'záloha: chyba po posledním úspěchu = problém');
ok(O.stavy(H({ zaloha: { posledniOk: null, bajtu: null, posledniChyba: null } })).backup === 'unknown',
  'záloha: ještě žádný záznam = neznámo, bez poplachu hned po nasazení');

// 1b) mazací úlohy (2026-10-16, owner: „chci vždy potvrzení, že úloha … proběhla, kde a co smazala. musíme mít kontroly!“)
const MZ = (o) => Object.assign({ messages_db: { kdy: hod(2), ok: true, chyba: null }, backups_pc: { kdy: hod(4), ok: true, chyba: null },
  gmail_messages: { kdy: hod(100), ok: true, chyba: null }, el_history: { kdy: hod(1), ok: true, chyba: null } }, o);
ok(O.stavy(H({ mazani: {}, zpravyPoLhute: 0 })).purge === 'unknown', 'mazání: žádná úloha ještě nehlásila = neznámo, bez poplachu hned po nasazení');
ok(O.stavy(H({ mazani: MZ({}), zpravyPoLhute: 0 })).purge === 'ok', 'mazání: všechny úlohy v lhůtě (týdenní Gmail před 100 h) = v pořádku');
ok(O.stavy(H({ mazani: MZ({ messages_db: { kdy: hod(27), ok: true, chyba: null } }), zpravyPoLhute: 0 })).purge === 'problem'
  && /messages DB: no report since/.test(O.vadyMazani(H({ mazani: MZ({ messages_db: { kdy: hod(27), ok: true, chyba: null } }), zpravyPoLhute: 0 }), 'ok')[0]),
  'mazání: denní úloha se neozvala 27 h = problém s názvem úlohy');
ok(O.stavy(H({ mazani: MZ({ gmail_messages: { kdy: hod(195), ok: true, chyba: null } }), zpravyPoLhute: 0 })).purge === 'problem',
  'mazání: týdenní Gmail se neozval 195 h (> 8 dní) = problém');
ok(O.stavy(H({ mazani: MZ({ el_history: { kdy: hod(1), ok: false, chyba: 'not_found' } }), zpravyPoLhute: 0 })).purge === 'problem',
  'mazání: poslední smazání historie ElevenLabs selhalo = problém (bez lhůty, hlídá se selhání)');
ok(O.stavy(H({ mazani: MZ({ el_history: { kdy: hod(500), ok: true, chyba: null } }), zpravyPoLhute: 0 })).purge === 'ok',
  'mazání: hlas se dlouho nečetl — ElevenLabs bez lhůty, není problém');
ok(O.stavy(H({ mazani: MZ({}), zpravyPoLhute: 2 })).purge === 'problem', 'mazání: 2 zprávy v DB po lhůtě 6 měsíců = problém, i když úloha hlásí úspěch');
const zalohaZle = { posledniOk: hod(30), bajtu: 1, posledniChyba: hod(1) };
ok(O.stavy(H({ zaloha: zalohaZle, mazani: MZ({ backups_pc: { kdy: hod(30), ok: true, chyba: null } }), zpravyPoLhute: 0 })).purge === 'ok',
  'mazání: staré zálohy se neozvaly, protože selhala záloha — hlásí se jednou (backup), ne podruhé');

// 1c) úlohy, které je dobré vidět (2026-10-18, owner: „cokoliv, co je třeba neviditelné, ale je dobré vidět, že to proběhlo, zapisovat
// emailem“) — zkouška obnovy jednou za 4 týdny, lhůta 35 dní
const BH = (o) => ({ restore_test: Object.assign({ kdy: hod(30), ok: true, chyba: null, info: '9/9' }, o) });
ok(O.stavy(H({ mazani: {}, zpravyPoLhute: 0 })).runs === 'unknown', 'běhy: žádný záznam = neznámo, bez poplachu');
ok(O.stavy(H({ mazani: {}, zpravyPoLhute: 0, behy: BH({ kdy: hod(34 * 24) }) })).runs === 'ok', 'běhy: zkouška obnovy před 34 dny = v pořádku');
ok(O.stavy(H({ mazani: {}, zpravyPoLhute: 0, behy: BH({ kdy: hod(36 * 24) }) })).runs === 'problem'
  && /^Restore test: no report since/.test(O.vadyBehu(H({ behy: BH({ kdy: hod(36 * 24) }) }))[0]), 'běhy: zkouška obnovy se neozvala 36 dní = problém s názvem');
ok(O.stavy(H({ mazani: {}, zpravyPoLhute: 0, behy: BH({ ok: false, chyba: 'archive has no pg_dump' }) })).runs === 'problem'
  && /^Restore test: last run failed at .*\(archive has no pg_dump\)$/.test(O.vadyBehu(H({ behy: BH({ ok: false, chyba: 'archive has no pg_dump' }) }))[0]),
  'běhy: zkouška obnovy selhala = problém s důvodem');
ok(O.MAZANI.restore_copy && O.MAZANI.restore_copy.lhutaH === 35 * 24 && O.BEHY.restore_test && O.BEHY.restore_test.lhutaH === 35 * 24,
  'registry: smazání zkušební kopie v MAZANI, zkouška obnovy v BEHY, obě s lhůtou 35 dní');

// 2) upozornění jen při změně
const vse = (s) => ({ model: s, voice_brake: s, backup: s });
ok(O.upozorneni(vse('ok'), vse('ok'), H({})) === null, 'beze změny stavu žádný e-mail');
ok(O.upozorneni({ model: 'unknown', voice_brake: 'unknown', backup: 'unknown' }, vse('ok'), H({})) === null, 'neznámo → v pořádku: žádný e-mail');
const p = O.upozorneni(vse('ok'), { model: 'ok', voice_brake: 'ok', backup: 'problem' }, H({ zaloha: { posledniOk: hod(27), bajtu: 1, posledniChyba: null } }));
ok(p && /^Rúnar Ops · PROBLEM · Database backup/.test(p.subject) && /Last successful backup/.test(p.text), 'v pořádku → problém: e-mail PROBLEM s důvodem');
const r = O.upozorneni({ model: 'problem', voice_brake: 'ok', backup: 'ok' }, vse('ok'), H({}));
const pm = O.upozorneni(Object.assign(vse('ok'), { purge: 'ok' }), Object.assign(vse('ok'), { purge: 'problem' }),
  H({ mazani: MZ({ messages_db: { kdy: hod(27), ok: true, chyba: null } }), zpravyPoLhute: 0 }));
ok(pm && /^Rúnar Ops · PROBLEM · A deletion job/.test(pm.subject) && /messages DB: no report since/.test(pm.text), 'mazání v pořádku → problém: e-mail říká, která úloha');
ok(r && /^Rúnar Ops · RESOLVED · Reading model/.test(r.subject), 'problém → v pořádku: e-mail RESOLVED');
const pb = O.upozorneni(Object.assign(vse('ok'), { runs: 'ok' }), Object.assign(vse('ok'), { runs: 'problem' }), H({ behy: BH({ ok: false, chyba: null }) }));
ok(pb && /^Rúnar Ops · PROBLEM · A scheduled check failed/.test(pb.subject) && /Restore test: last run failed at/.test(pb.text),
  'běh v pořádku → problém: e-mail říká, která úloha');

// 3) ranní souhrn
const D = (o) => Object.assign({ od: hod(24), do: TED, cteni: 0, spready: 0, asky: 0, modely: {}, cenaModelu: 0, bezCeny: 0, hlasy: 0, znakyHlasu: 0,
  cenaHlasu: 0, hlaseni: {}, neprectena: 0, ulozeno: 0, chybModelu: 0, zalohModelu: 0, brzd: 0,
  kredity: { spotreba: 3000, hladina: 90000, limit: 103807, reset: '2026-11-10T00:00:00.000Z' },
  zaloha: { posledniOk: hod(3), bajtu: 5e6, posledniChyba: null }, otevrene: vse('ok') }, o);
const klid = O.souhrn(D({}));
ok(klid.stav === 'OK' && klid.subject === 'Rúnar Ops · OK · 0 readings · 0 voices · $0.00' && /Nothing needs you/.test(klid.text), 'klidný den: OK, „Nothing needs you“');
const den = O.souhrn(D({ cteni: 12, spready: 2, asky: 3, modely: { 'gpt-6-sol': 14, 'claude-opus-5': 1 }, cenaModelu: 0.21, hlasy: 7, znakyHlasu: 2100,
  cenaHlasu: 0.1, hlaseni: { crash: 1, visual: 2 }, neprectena: 2, ulozeno: 4 }));
ok(den.stav === 'WATCH' && den.subject === 'Rúnar Ops · WATCH · 12 readings · 7 voices · $0.31' && /2 unread app reports — ask CODE to load them\./.test(den.text)
  && /App reports \(24 h\) visual 2, crash 1 · Keep 4/.test(den.text), 'den s nepřečtenými hlášeními: WATCH, počty podle typu bez textu, Keep zvlášť');
// 2026-10-14: hlášení za 24 h, ale všechna už načtená (první zkušební souhrn psal „Ask CODE to load“ u uzavřeného hlášení)
// 2026-10-21 (DECISIONS (7)): registrace čekatelů — číslo, bez adres; nula se nevypisuje
const cek = O.souhrn(D({ cekatele: 3 }));
ok(/Waitlist \+3 \(24 h\)/.test(cek.text) && cek.stav === 'OK' && !/Waitlist/.test(klid.text), 'registrace čekatelů: „Waitlist +3 (24 h)“, nula nic, stav beze změny');
const nacteno = O.souhrn(D({ hlaseni: { other: 1 } }));
ok(nacteno.stav === 'OK' && /Nothing needs you/.test(nacteno.text) && /App reports \(24 h\) other 1/.test(nacteno.text),
  'hlášení za 24 h už načtená: v číslech ano, v „Needs you“ ne, stav OK');
const zle = O.souhrn(D({ otevrene: { model: 'ok', voice_brake: 'problem', backup: 'ok' } }));
ok(zle.stav === 'PROBLEM' && /credit brake/.test(zle.text), 'otevřený problém: PROBLEM a nahoře v „Needs you“');
const malo = O.souhrn(D({ kredity: { spotreba: 85000, hladina: 90000, limit: 103807, reset: null } }));
ok(/only 5,000 credits left/.test(malo.text) && malo.stav === 'WATCH', 'málo kreditů do brzdy: řádek v „Needs you“');
const bez = O.souhrn(D({ zaloha: { posledniOk: null, bajtu: null, posledniChyba: null } }));
ok(/No database backup has reported/.test(bez.text) && bez.stav === 'WATCH', 'záloha ještě nehlásila: WATCH s pokynem');
// 2026-10-15: záloha selhala (žádný úspěch, chyba v 00:38) a je otevřená jako problém → JEDEN řádek o záloze, s časem selhání
const zal = O.souhrn(D({ otevrene: { model: 'ok', voice_brake: 'ok', backup: 'problem' }, zaloha: { posledniOk: null, bajtu: null, posledniChyba: '2026-10-15T00:38:18.000Z' } }));
const radkyZal = zal.text.split('\n\n')[0].split('\n').filter((x) => /backup/i.test(x));
ok(zal.stav === 'PROBLEM' && radkyZal.length === 1 && /Last attempt failed at 2026-10-15 00:38 UTC/.test(radkyZal[0]) && !/26 h/.test(zal.text),
  'záloha selhala: jeden řádek s časem selhání, ne dva a ne „26 h“');
// 2026-10-16: řádek „Deleted (24 h)“ vždy — kde (úloha) a co (počet + položky), týdenní Gmail s posledním během, nula u hlasu
const MD = (o) => Object.assign({ messages_db: { behu: 1, smazano: 0, polozky: [], chyb: 0, posledni: hod(2) },
  backups_pc: { behu: 1, smazano: 2, polozky: ['runar-db-2026-09-16.7z'], chyb: 0, posledni: hod(4) },
  gmail_messages: { behu: 0, smazano: 0, polozky: [], chyb: 0, posledni: '2026-10-12T07:05:00.000Z' },
  el_history: { behu: 3, smazano: 3, polozky: [], chyb: 0, posledni: hod(1) },
  restore_copy: { behu: 0, smazano: 0, polozky: [], chyb: 0, posledni: '2026-10-12T04:20:00.000Z' },
  // 2026-10-22: denní mazání provozních dat (sql/2026-10-22_mazani_provoz.sql) — hlášení po vyřešení s id, ostatní nulou
  cron_history: { behu: 1, smazano: 0, polozky: [], chyb: 0, posledni: hod(3) },
  ops_events: { behu: 1, smazano: 0, polozky: [], chyb: 0, posledni: hod(3) },
  reports_db: { behu: 1, smazano: 1, polozky: ['a1b2c3d4'], chyb: 0, posledni: hod(3) } }, o);
const smaz = O.souhrn(D({ mazani: MD({}), vadyMazani: [] }));
ok(/^Deleted \(24 h\) messages DB 0 · backups PC\+Drive 2 \(runar-db-2026-09-16\.7z\) · Gmail Messages last run 2026-10-12 · ElevenLabs 3 · restore copy last run 2026-10-12 · cron history 0 · ops events 0 · reports DB 1 \(a1b2c3d4\)$/m.test(smaz.text),
  'souhrn: řádek Deleted — nula = proběhla, archivy jménem, týdenní Gmail a kopie zkoušky s posledním během, hlas počtem');
ok(/Deleted \(24 h\) messages DB no run yet · backups PC\+Drive no run yet · Gmail Messages no run yet · ElevenLabs 0/.test(klid.text),
  'souhrn: úlohy, které ještě nehlásily — „no run yet“, řádek je i v klidný den');
const smazMoc = O.mazaniVeta(MD({ messages_db: { behu: 1, smazano: 5, polozky: ['a1', 'b2', 'c3', 'd4', 'e5'], chyb: 0, posledni: hod(2) } }));
ok(/messages DB 5 \(a1, b2, c3, …\)/.test(smazMoc), 'souhrn: víc než 3 položky → první tři a „…“');
const smazZle = O.souhrn(D({ otevrene: Object.assign(vse('ok'), { purge: 'problem' }), mazani: MD({}),
  vadyMazani: ['messages DB: no report since 2026-10-13 03:10 UTC'] }));
ok(smazZle.stav === 'PROBLEM' && /A deletion job failed or did not report — messages DB: no report since/.test(smazZle.text),
  'souhrn: otevřený problém mazání nahoře v „Needs you“ s názvem úlohy');
// 2026-10-18: zkouška obnovy na řádku zálohy (e-mail nenaroste), bez zálohy samostatně, otevřený problém nahoře
const obn = O.souhrn(D({ behy: { restore_test: { kdy: '2026-10-12T04:20:00.000Z', ok: true, chyba: null, info: '9/9' } } }));
ok(/^Checks restore test OK 2026-10-12 \(9\/9\) · Greynir update no run yet$/m.test(obn.text) && /^Backup .* · 5\.0 MB$/m.test(obn.text) && obn.stav === 'OK',
  'souhrn: řádek Checks — zkouška obnovy s počtem kontrol, Greynir „no run yet“; řádek zálohy beze změny');
ok(/^Checks restore test no run yet · Greynir update no run yet$/m.test(klid.text), 'souhrn: úlohy, které ještě neběžely — „no run yet“, řádek i v klidný den');
// každá úloha z BEHY má zdroj, který existuje a zapisuje svůj kind (bez zápisu by ops-watch hlásil „no report“ jen podle lhůty)
const bezZapisu = Object.entries(O.BEHY).filter(([kind, b]) => { const f = path.join(ROOT, b.zdroj); return !fs.existsSync(f) || fs.readFileSync(f, 'utf8').indexOf(kind) < 0; });
ok(!bezZapisu.length, 'registr BEHY: zdroj každé úlohy existuje a obsahuje její kind' + (bezZapisu.length ? ' — chybí: ' + bezZapisu.map((x) => x[0]).join(', ') : ''));
const obnBez = O.souhrn(D({ zaloha: { posledniOk: null, bajtu: null, posledniChyba: null }, behy: { restore_test: { kdy: '2026-10-12T04:20:00.000Z', ok: false, chyba: null, info: null } } }));
ok(/^Checks restore test FAILED 2026-10-12 · Greynir update no run yet$/m.test(obnBez.text), 'souhrn: selhaná zkouška obnovy „FAILED“ i bez úspěšné zálohy');
const obnZle = O.souhrn(D({ otevrene: Object.assign(vse('ok'), { runs: 'problem' }), vadyBehu: ['Restore test: no report since 2026-09-10 04:15 UTC'] }));
ok(obnZle.stav === 'PROBLEM' && /A scheduled check failed or did not report — Restore test: no report since/.test(obnZle.text),
  'souhrn: otevřený problém běhu nahoře v „Needs you“ s názvem úlohy');
const zly = O.souhrn(D({ modely: { '<script>x': 1 } }));
ok(zly.html.indexOf('<script>') === -1 && zly.html.indexOf('&lt;script&gt;') !== -1, 'HTML escapované');
// 2026-10-14 owner po zkušebním souhrnu: „maily nesmí zabírat moc místa. to myslím obecně.“ (memory emaily-kratke) — e-mail na jednu
// obrazovku telefonu. Do té doby 14–16 řádků textu i v klidný den (nadpis, „Needs you“, tabulka devíti řádků, patička), HTML ~2 kB.
// 2026-10-16: meze o řádek výš (klidný den 4, běžný 8, čísla 6) — řádek „Deleted (24 h)“ je vždy (owner: „chci vždy potvrzení“).
const radku = (e) => e.text.split('\n').filter((x) => x.trim()).length;
const cisel = (e) => (e.text.split('\n\n')[1] || '').split('\n').filter((x) => x.trim()).length;
const jeden = O.souhrn(D({ cteni: 1, modely: { 'gpt-6-sol': 1 }, cenaModelu: 0.01, neprectena: 1 }));
ok(/1 unread app report — ask CODE to load it\./.test(jeden.text) && /Cost models \$0\.01$/m.test(jeden.text), 'jedno hlášení „it“, nulová cena hlasu vynechaná');
ok(radku(klid) <= 5 && radku(obn) <= 5 && radku(den) <= 9 && [klid, den, nacteno, zle, malo, bez, smaz, obn, obnBez, obnZle].every((e) => cisel(e) <= 7) && radku(p) <= 2 && radku(r) <= 2
  && radku(pm) <= 2 && radku(pb) <= 2 && [klid, den, zle, p, r, pm, pb, smaz, obn].every((e) => e.html.indexOf('<table') === -1 && Buffer.byteLength(e.html) <= 1000),
  'krátké e-maily: klidný den ≤ 5 řádků, běžný ≤ 9, čísla ≤ 7, upozornění ≤ 2, bez tabulky, HTML ≤ 1 kB (owner 2026-10-14, 2026-10-16, 2026-10-18)');
const cz = [klid, den, nacteno, zle, malo, bez, p, r, jeden, pm, pb, smaz, smazZle, obn, obnBez, obnZle].map((e) => e.subject + e.html + e.text).join(' ');
ok(!/[ěščřžůňťďĚŠČŘŽŮŇŤĎ]/.test(cz), 'e-maily bez češtiny (§31 — admini EN)');

// 2026-10-22: registr kvót (DECISIONS 2026-10-22 (6)) — Supabase Free databáze 500 MB, soubory 1 GB; 50 % = WATCH v souhrnu, 80 % = upozornění
ok(O.stavy(H({ kvoty: { db: 410e6, storage: 1e6 } })).quota === 'problem' && O.stavy(H({ kvoty: { db: 300e6, storage: 1e6 } })).quota === 'ok'
  && O.stavy(H({})).quota === 'unknown' && O.stavy(H({ kvoty: { db: null, storage: null } })).quota === 'unknown',
  'kvóty: DB 82 % = problém, 60 % ne; bez funkce ops_kvoty (null) = neznámo, bez poplachu');
const kvKlid = O.souhrn(D({ kvoty: { db: 17e6, storage: 45e6 } }));
ok(kvKlid.stav === 'OK' && /Backup 2026-10-14 02:00 UTC · 5\.0 MB · Supabase DB 17 MB of 500 MB · storage 45 MB of 1 GB/.test(kvKlid.text) && radku(kvKlid) <= 5,
  'kvóty: čísla na řádku zálohy (žádný řádek navíc), klidný den zůstane OK');
const kvPul = O.souhrn(D({ kvoty: { db: 300e6, storage: 45e6 } }));
ok(kvPul.stav === 'WATCH' && /Supabase Free: DB 300 MB of 500 MB \(60 %\)\./.test(kvPul.text), 'kvóty: 60 % = WATCH s řádkem v „Needs you“');
const kvMail = O.upozorneni(vse('ok'), Object.assign(vse('ok'), { quota: 'problem' }), H({ kvoty: { db: 1e6, storage: 850e6 } }));
ok(kvMail && /Supabase Free limit nearly used/.test(kvMail.subject) && /storage 850 MB of 1 GB \(85 %\)/.test(kvMail.text),
  'kvóty: přes 80 % upozornění e-mailem s tím, která kvóta a kolik');
const kvJindy = (iso) => O.souhrn(D({ od: iso, do: iso, otevrene: vse('ok') }));
const kl1 = kvJindy('2026-11-05T05:00:00.000Z'), kl2 = kvJindy('2026-12-02T05:00:00.000Z');
ok(!O.KLICE_SUPABASE.vymeneno ? (!/legacy API keys/.test(klid.text) && kl1.stav === 'WATCH' && /legacy API keys end by 2026-12-31 \(57 days\)/.test(kl1.text)
  && kl2.stav === 'PROBLEM' && /\(30 days\)/.test(kl2.text)) : !/legacy API keys/.test(kl2.text),
  'staré klíče Supabase: před 1. 11. nic, 5. 11. WATCH s odpočtem, od 1. 12. PROBLEM; po výměně (vymeneno) nic');
const pondeli = kvJindy('2026-10-19T05:00:00.000Z');
ok(pondeli.text.indexOf(O.EGRESS_PRIPOMINKA) !== -1 && klid.text.indexOf(O.EGRESS_PRIPOMINKA) === -1 && pondeli.stav === 'WATCH',
  'egress Supabase: připomínka jen v pondělí (API ho neukazuje)');

console.log(fail ? '\nFAIL  hlídání provozu: ' + fail + ' případů nesedí'
  : '\nOK    hlídání provozu: prahy, e-mail jen při změně stavu, ranní souhrn (OK / WATCH / PROBLEM, co potřebuje ownera, čísla) — krátké, EN, escapované');
process.exit(fail ? 1 : 0);
