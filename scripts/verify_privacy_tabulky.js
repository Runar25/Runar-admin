// verify_privacy_tabulky.js — každá tabulka v databázi (podle sql/) je v RUNAR_PRIVACY.md, nebo má tady důvod, proč osobní údaj nenese.
//
// Proč (2026-11-23, CODE-tune, údržba; owner „zjistit, proč se jaký problém stal, a napravit ho“): runa dne (rune_day, od 2026-11-15)
// a odběr upozornění (push_subscriptions, 2026-11-18) se ukládaly týden, ale veřejné zásady soukromí o nich mlčely (GDPR čl. 13) —
// a inactive_notices (2026-11-01) ani reading_locks nejmenoval ani RUNAR_PRIVACY.md. Nová tabulka vznikla, doc soukromí se nepohnul a
// nic to nehlídalo (§30: podruhé → stroj). Kontrola: tabulka ze `create table` v sql/ (bez těch, které sql/ zase zahodil) musí stát
// v RUNAR_PRIVACY.md jménem; jinak ji sem dej do BEZ_OSOBNICH s důvodem. Veřejné zásady (runar-privacy.html) hlídá owner nad
// RUNAR_PRIVACY.md — tabulky se tam jménem neuvádějí.
//
//   node scripts/verify_privacy_tabulky.js          kontrola
//   node scripts/verify_privacy_tabulky.js --test   samotest
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = process.env.RUNAR_ROOT || path.join(__dirname, '..');

// Tabulky bez osobních údajů (žádné user_id, e-mail, text od člověka) — důvod povinný.
const BEZ_OSOBNICH = {
  ops_alert_state: 'stav upozornění hlídání provozu (klíč, stav, čas)',
  runar_character: 'nastavení Rúnarovy postavy pro prompt',
  runar_corrections: 'korekce islandštiny (slovo → slovo)',
  runar_corrections_zaloha: 'záloha korekcí islandštiny',
  runar_static_audio: 'statické texty a hlas run v Kolekci',
};

function tabulky(sqlTexty) {
  const bezKomentaru = sqlTexty.map((t) => t.replace(/--[^\n]*/g, '')).join('\n');
  const vytvorene = new Set([...bezKomentaru.matchAll(/create table (?:if not exists )?(?:public\.)?"?([a-z_]+)"?/gi)].map((m) => m[1].toLowerCase()));
  const zahozene = new Set([...bezKomentaru.matchAll(/drop table (?:if exists )?(?:public\.)?"?([a-z_]+)"?/gi)].map((m) => m[1].toLowerCase()));
  return [...vytvorene].filter((t) => !zahozene.has(t)).sort();
}

function kontrola(sqlTexty, privacy, bez) {
  return tabulky(sqlTexty).filter((t) => !bez[t] && !new RegExp('`' + t + '`|\\b' + t + '\\b').test(privacy));
}

if (process.argv.includes('--test')) {
  const sql = ['create table public.a (user_id uuid);', 'create table if not exists public.b (x int);', 'create table c (x int);\n-- create table d',
               'create table e (x int);', 'drop table if exists public.e;'];
  const pripady = [
    ['všechno v docu nebo v BEZ', sql, '`a` a b', { c: 'x' }, 0],
    ['nová tabulka bez řádku v docu (rune_day 2026-11-15)', sql, '`a`', { c: 'x' }, 1],
    ['zakomentovaná a zahozená se nepočítají', sql, 'a b c', {}, 0],
  ];
  let spatne = 0;
  for (const [popis, s, doc, bez, cek] of pripady) {
    const n = kontrola(s, doc, bez).length;
    if (n !== cek) { spatne++; console.log('FAIL  samotest: ' + popis + ' — ' + n + ', čekáno ' + cek); }
  }
  if (spatne) process.exit(1);
  console.log('OK    samotest tabulek v zásadách: ' + pripady.length + ' případů');
  process.exit(0);
}

const dir = path.join(ROOT, 'sql');
const sqlTexty = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).map((f) => fs.readFileSync(path.join(dir, f), 'utf8'));
const privacy = fs.readFileSync(path.join(ROOT, 'RUNAR_PRIVACY.md'), 'utf8');
const vse = tabulky(sqlTexty);
const chybi = kontrola(sqlTexty, privacy, BEZ_OSOBNICH);
const mrtveBez = Object.keys(BEZ_OSOBNICH).filter((t) => vse.indexOf(t) === -1);
if (chybi.length || mrtveBez.length) {
  if (chybi.length) console.log('FAIL  tabulka bez řádku v RUNAR_PRIVACY.md: ' + chybi.join(', ') + ' — napiš, co nese a jak dlouho (a do veřejných zásad), nebo důvod do BEZ_OSOBNICH');
  if (mrtveBez.length) console.log('FAIL  BEZ_OSOBNICH jmenuje tabulku, kterou sql/ nezná: ' + mrtveBez.join(', '));
  process.exit(1);
}
console.log('OK    zásady soukromí znají všechny tabulky: ' + vse.length + ' z sql/, z toho ' + Object.keys(BEZ_OSOBNICH).length + ' bez osobních údajů (s důvodem)');
