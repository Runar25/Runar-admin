// verify_necinne_ucty.js — smoke: opuštěné účty (supabase/functions/_shared/necinne_ucty.ts) na známých datech.
// Proč (2026-11-01, DECISIONS 2026-11-01 (3)): úloha maže účty lidí. Chyba v lhůtě = někdo přijde o čtení bez upozornění, nebo dostane
// e-mail, který nemá. Účty staré 3 roky v provozu ještě nejsou (appka je od 2026), takže naostro to dlouho nic nevyzkouší — proto známé
// případy tady, s pravými funkcemi z produkčního souboru (§19.1).
// Samotest v každém běhu: podstrčí vadu (ochrana kreditů vypnutá, lhůta od upozornění vypnutá, přihlášení v lhůtě nepozná) a ta MUSÍ
// spadnout — jinak je kontrola slepá. Soubor chybí nebo se nedá načíst = FAIL, ne tiché zelené.
//   node scripts/verify_necinne_ucty.js
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = process.env.RUNAR_ROOT || path.resolve(__dirname, '..');
let strip;
try { strip = require('node:module').stripTypeScriptTypes; } catch (e) { strip = null; }
if (typeof strip !== 'function') { console.log('FAIL  tenhle Node neumí stripTypeScriptTypes (potřeba Node ≥ 22.13)'); process.exit(1); }
const SRC = fs.readFileSync(path.join(ROOT, 'supabase', 'functions', '_shared', 'necinne_ucty.ts'), 'utf8');

function nacti(src) {
  const ctx = {};
  vm.createContext(ctx);
  vm.runInContext(strip(src).replace(/^export\s+/gm, '') + '\n;this.M = { rozhodni, denSmazani, email, datum, terminSmazani };', ctx);
  return ctx.M;
}

const D = (s) => new Date(s);
const ucet = (o) => Object.assign({ id: 'u1', email: 'a@b.is', posledni: '2026-11-01T10:00:00Z', admin: false, kredity: 0, tier: 'rune_seeker', tester: false }, o);
// termín smazání = 2029-11-01T10:00Z; první upozornění od 2029-10-02T10:00Z; druhé od 2029-10-25T10:00Z
function pripady(M) {
  const v = [];
  let n = 0;
  const chk = (jm, dostal, cekal) => { n++; if (dostal !== cekal) v.push(`${jm}: ${dostal} ≠ ${cekal}`); };
  chk('čerstvý účet', M.rozhodni(ucet(), null, D('2027-01-01')), 'none');
  chk('den před prvním upozorněním', M.rozhodni(ucet(), null, D('2029-10-01T10:00Z')), 'none');
  chk('první upozornění', M.rozhodni(ucet(), null, D('2029-10-02T11:00Z')), 'first');
  chk('admin se nemaže', M.rozhodni(ucet({ admin: true }), null, D('2030-01-01')), 'protected');
  chk('kredity se nemažou', M.rozhodni(ucet({ kredity: 3 }), null, D('2030-01-01')), 'protected');
  chk('předplatné se nemaže', M.rozhodni(ucet({ tier: 'standard' }), null, D('2030-01-01')), 'protected');
  chk('tester s premium se maže (premium mu dává seznam, ne platba)', M.rozhodni(ucet({ tier: 'premium', tester: true }), null, D('2030-01-01')), 'first');
  chk('bez e-mailu nic (nejde upozornit)', M.rozhodni(ucet({ email: null }), null, D('2030-01-01')), 'none');
  const z1 = { posledni: '2026-11-01T10:00:00Z', prvni: '2029-10-02T11:00:00Z', druhe: null };
  chk('mezi upozorněními', M.rozhodni(ucet(), z1, D('2029-10-20')), 'none');
  chk('druhé upozornění', M.rozhodni(ucet(), z1, D('2029-10-25T12:00Z')), 'second');
  const z2 = Object.assign({}, z1, { druhe: '2029-10-25T12:00:00Z' });
  chk('po druhém, před termínem', M.rozhodni(ucet(), z2, D('2029-10-31')), 'none');
  chk('smazání', M.rozhodni(ucet(), z2, D('2029-11-02T12:00Z')), 'delete');
  chk('přihlásil se po upozornění → obnovit', M.rozhodni(ucet({ posledni: '2029-10-10T08:00:00Z' }), z2, D('2029-11-02T12:00Z')), 'reset');
  chk('stejný čas jiným zápisem není přihlášení', M.rozhodni(ucet({ posledni: '2026-11-01T10:00:00.000Z' }), z2, D('2029-11-02T12:00Z')), 'delete');
  // Úloha spuštěná pozdě: účet 4 roky nečinný, žádné upozornění → napřed upozornit, smazat nejdřív 30 dní po prvním a 7 po druhém
  chk('pozdní start: napřed upozornit', M.rozhodni(ucet(), null, D('2031-01-01')), 'first');
  const zp = { posledni: '2026-11-01T10:00:00Z', prvni: '2031-01-01T00:00:00Z', druhe: null };
  chk('pozdní start: druhé ne hned', M.rozhodni(ucet(), zp, D('2031-01-10')), 'none');
  chk('pozdní start: druhé po 23 dnech', M.rozhodni(ucet(), zp, D('2031-01-24T00:00Z')), 'second');
  const zp2 = Object.assign({}, zp, { druhe: '2031-01-24T00:00:00Z' });
  chk('pozdní start: smazat ne dřív než 30 dní po prvním', M.rozhodni(ucet(), zp2, D('2031-01-30')), 'none');
  chk('pozdní start: smazat po 30 / 7 dnech', M.rozhodni(ucet(), zp2, D('2031-01-31T01:00Z')), 'delete');
  // Záznam, kde druhé upozornění přišlo hned po prvním (ruční zásah, dvojí běh): 30 dní od prvního platí i tak
  chk('30 dní od prvního i při rychlém druhém', M.rozhodni(ucet(), { posledni: '2026-11-01T10:00:00Z', prvni: '2031-01-01T00:00:00Z', druhe: '2031-01-02T00:00:00Z' }, D('2031-01-10')), 'none');
  // Datum v e-mailu = den, kdy se opravdu smaže
  chk('datum v prvním e-mailu', M.denSmazani(ucet(), D('2029-10-02T11:00Z'), null).toISOString().slice(0, 10), '2029-11-01');
  chk('datum při pozdním startu', M.denSmazani(ucet(), D('2031-01-01T00:00Z'), null).toISOString().slice(0, 10), '2031-01-31');
  // E-mail: jazyk podle účtu, oba při neznámém, datum v textu
  const en = M.email('en', D('2029-11-01'), false), is = M.email('is', D('2029-11-01'), true), oba = M.email(undefined, D('2029-11-01'), false);
  chk('EN jen anglicky s datem', /reikningnum/.test(en.subject) || !/1 November 2029/.test(en.text), false);
  chk('IS jen islandsky + poslední upozornění', /Síðasta áminning/.test(is.text) && /1\. nóvember 2029/.test(is.subject) && !/account/.test(is.text), true);
  chk('neznámý jazyk = oba', /reikningnum/.test(oba.subject) && /account/.test(oba.subject), true);
  chk('odkaz do appky', oba.html.includes('runar-reader.html'), true);
  return { v, n };
}

let vysl;
try { vysl = pripady(nacti(SRC)); } catch (e) { console.log('FAIL  opuštěné účty: modul nejde načíst — ' + e.message); process.exit(1); }
// Samotest: podstrčené vady musí spadnout
const podvrhy = [
  ['ochrana kreditů vypnutá', SRC.replace('if ((u.kredity || 0) > 0) return "credits";', '')],
  ['lhůta od prvního upozornění vypnutá', SRC.replace('&& t >= prvni + PRVNI_DNI * DEN ', '')],
  ['přihlášení po upozornění nepozná', SRC.replace('if (z && new Date(z.posledni).getTime() !== new Date(u.posledni).getTime()) return "reset";', '')],
];
const slepe = [];
for (const [jm, s] of podvrhy) {
  if (s === SRC) { slepe.push(jm + ' (podvrh nesedí na zdroj — uprav ho tady)'); continue; }
  let spadl;
  try { spadl = pripady(nacti(s)).v.length > 0; } catch (e) { spadl = true; }
  if (!spadl) slepe.push(jm);
}
if (vysl.v.length || slepe.length) {
  vysl.v.forEach((x) => console.log('  ✗ ' + x));
  slepe.forEach((x) => console.log('  ✗ samotest: kontrola nepozná vadu „' + x + '“'));
  console.log('FAIL  opuštěné účty: ' + vysl.v.length + ' vad, ' + slepe.length + ' slepých míst');
  process.exit(1);
}
console.log('OK    opuštěné účty: ' + vysl.n + ' případů (lhůty, ochrany, přihlášení v lhůtě, pozdní start, e-mail EN/IS) + ' + podvrhy.length + ' podvrhy spadly');
