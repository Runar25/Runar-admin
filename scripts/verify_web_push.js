// verify_web_push.js — upozornění na runu dne (2026-11-18): podpis VAPID a brána push služeb protlačené známými daty.
// Proč: funkce rune-day-push se tu spustit nedá (Deno tu není) a chyba podpisu by se ukázala až tím, že ráno nikomu nic nepřijde —
// tiše, push služba jen vrátí 401/403. Endpoint posílá klient a funkce na něj volá s naším podpisem — brána služeb musí odmítnout
// cizí adresu v KÓDU i v CHECK tabulky (sql/2026-11-18_push_odbery.sql), jinak by jedna vrstva tiše propouštěla, co druhá chytá.
// Co hlídá:
//  1. vapidHlavicka: JWT ES256 ověřený VEŘEJNÝM klíčem z téhož páru (WebCrypto v Node), aud = origin služby, exp = +12 h, k = veřejný klíč;
//  2. sluzbaOk + regex CHECK z SQL: tytéž adresy projdou a tytéž neprojdou (podvržená doména, http, port, jméno v URL);
//  3. komuPoslat: kdo dnes táhl, nedostane nic; cizí služba se neposílá, jde mezi mrtvé;
//  4. vysledekPush: 2xx ok, 404/410 gone (smazat), ostatní error (nesmazat — výpadek služby nesmí mazat odběry).
// Stavy čteného: SQL soubor přejmenovaný/smazaný nebo bez CHECK → FAIL s názvem souboru (ne tiché zelené, §19.2).
// NETVRDÍ: že push služba upozornění opravdu doručí (to ukáže jen telefon — admin „SEND A TEST NOW“ v appce).
//   node scripts/verify_web_push.js
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = process.env.RUNAR_ROOT || path.resolve(__dirname, '..');
const SRC = 'supabase/functions/_shared/web_push.ts';
const SQL = 'sql/2026-11-18_push_odbery.sql';

let strip;
try { strip = require('node:module').stripTypeScriptTypes; } catch (e) { strip = null; }
if (typeof strip !== 'function') { console.log('FAIL tenhle Node neumí stripTypeScriptTypes (potřeba Node ≥ 22.13)'); process.exit(1); }
process.removeAllListeners('warning'); process.on('warning', () => {});

const chyby = [];
const ok = (c, m) => { if (!c) chyby.push(m); };
const b64u = (b) => Buffer.from(b).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

(async () => {
  const W = await import('data:text/javascript;base64,' + Buffer.from(strip(fs.readFileSync(path.join(ROOT, SRC), 'utf8'))).toString('base64'));

  // 1. podpis
  const par = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const jPub = await crypto.subtle.exportKey('jwk', par.publicKey), jPriv = await crypto.subtle.exportKey('jwk', par.privateKey);
  const pub = b64u(Buffer.concat([Buffer.from([4]), Buffer.from(jPub.x, 'base64'), Buffer.from(jPub.y, 'base64')]));
  const ep = 'https://fcm.googleapis.com/fcm/send/abc:XYZ';
  const ted = 1763456400;
  const hl = await W.vapidHlavicka(ep, await W.vapidKlic(pub, jPriv.d), pub, 'https://therunekeeper.com', ted);
  const m = /^vapid t=([^.]+)\.([^.]+)\.([^,]+), k=(.+)$/.exec(hl);
  ok(m, 'hlavička nemá tvar „vapid t=<jwt>, k=<klíč>“: ' + hl.slice(0, 60));
  if (m) {
    const [, h, c, s, k] = m;
    const hlava = JSON.parse(Buffer.from(h, 'base64').toString()), claims = JSON.parse(Buffer.from(c, 'base64').toString());
    ok(hlava.alg === 'ES256', 'JWT alg není ES256');
    ok(claims.aud === 'https://fcm.googleapis.com', 'aud není origin služby: ' + claims.aud);
    ok(claims.exp === ted + 12 * 3600, 'exp není +12 h');
    ok(claims.sub === 'https://therunekeeper.com', 'sub nesedí');
    ok(k === pub, 'k není veřejný klíč');
    const podpis = Buffer.from(s, 'base64');
    ok(podpis.length === 64, 'podpis nemá 64 B (r||s): ' + podpis.length);
    const platny = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, par.publicKey, podpis, Buffer.from(h + '.' + c));
    ok(platny, 'podpis JWT neověří veřejný klíč téhož páru');
    const jiny = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
    ok(!(await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, jiny.publicKey, podpis, Buffer.from(h + '.' + c))),
      'podpis ověřil i CIZÍ klíč — test by nic nedokázal');
  }
  let spatny = false;
  try { await W.vapidKlic('AAAA', jPriv.d); } catch (e) { spatny = true; }
  ok(spatny, 'vapidKlic přijal veřejný klíč špatné délky');

  // 2. brána služeb — kód i CHECK z SQL
  const sql = fs.readFileSync(path.join(ROOT, SQL), 'utf8');
  const rm = /endpoint ~ '([^']+)'/.exec(sql);
  ok(rm, SQL + ': nenašel jsem CHECK endpoint ~ \'…\'');
  const reSql = rm ? new RegExp(rm[1]) : null;
  const ano = ['https://fcm.googleapis.com/fcm/send/x', 'https://updates.push.services.mozilla.com/wpush/v2/x',
    'https://wns2-db5p.notify.windows.com/w/?token=x', 'https://web.push.apple.com/x'];
  const ne = ['http://fcm.googleapis.com/fcm/send/x', 'https://fcm.googleapis.com.evil.example/x', 'https://evil.example/fcm.googleapis.com/x',
    'https://fcm.googleapis.com:8443/x', 'https://user@fcm.googleapis.com/x', 'https://notify.windows.com.evil.example/x', 'nesmysl'];
  for (const u of ano) { ok(W.sluzbaOk(u), 'kód odmítl platnou službu: ' + u); if (reSql) ok(reSql.test(u), 'SQL CHECK odmítl platnou službu: ' + u); }
  for (const u of ne) { ok(!W.sluzbaOk(u), 'kód PROPUSTIL cizí adresu: ' + u); if (reSql) ok(!reSql.test(u), 'SQL CHECK PROPUSTIL cizí adresu: ' + u); }

  // 3. komu poslat
  const k = W.komuPoslat([{ endpoint: ano[0], user_id: 'a' }, { endpoint: ano[1], user_id: 'b' }, { endpoint: ne[1], user_id: 'c' }], new Set(['b']));
  ok(k.poslat.length === 1 && k.poslat[0].user_id === 'a', 'komuPoslat: poslat má být jen „a“ (b dnes táhl, c cizí služba)');
  ok(k.uzTahli === 1, 'komuPoslat: uzTahli má být 1');
  ok(k.spatnaSluzba.length === 1 && k.spatnaSluzba[0].user_id === 'c', 'komuPoslat: cizí služba má jít mezi špatné');

  // 4. odpověď služby
  ok(W.vysledekPush(201) === 'ok' && W.vysledekPush(200) === 'ok', 'vysledekPush: 2xx není ok');
  ok(W.vysledekPush(410) === 'gone' && W.vysledekPush(404) === 'gone', 'vysledekPush: 404/410 není gone (zanikl)');
  for (const s of [400, 401, 403, 413, 429, 500, 503]) ok(W.vysledekPush(s) === 'error', 'vysledekPush: ' + s + ' má být error (nesmazat odběr)');

  if (chyby.length) { chyby.forEach((x) => console.log('  ✗ ' + x)); console.log('FAIL web push: ' + chyby.length + ' chyb'); process.exit(1); }
  console.log('OK web push: podpis VAPID ověřen veřejným klíčem, brána služeb v kódu = v SQL (' + (ano.length + ne.length) + ' adres), výběr adresátů a odpovědi služby');
})().catch((e) => { console.log('FAIL web push: ' + e.message); process.exit(1); });
