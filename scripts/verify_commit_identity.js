// Pozná `git log`, KTERÁ session commit napsala?
//
// PROČ EXISTUJE — 2026-08-18: `CLAUDE.md` tvrdilo *„Git je všechny podepisuje Runar Admin,
// takže jediné, co v historii rozliší autora, je commit prefix."* Pak přibyla třetí CODE
// session, začala commitovat pod `[tune]` stejně jako CODE-tune, a **ta věta tiše přestala
// platit**. Nikdo si toho nevšiml, protože to nic nehlídalo. Owner: *„jak tohle hlídat?"*
//
// KOŘEN nebyl prefix, ale to, že se všichni podepisují týmž jménem. Prefix nesl celou tíhu
// sám a byl to slib, ne mechanismus. Oprava je o patro níž: **každá session commituje pod
// svým jménem** — `git -c user.name='CODE-tune' commit …` (per-commit, NE `git config`,
// protože všechny tři session sdílejí jeden pracovní strom a config by si přepisovaly).
// E-mail zůstává stejný, takže atribuce na GitHubu se nemění.
//
// SAMOAKTIVACE — ta kontrola se nesmí zapnout dřív, než ji ostatní přijmou, jinak bych
// jejich commity blokoval za pravidlo, o kterém nevědí:
//   fáze 1 (dnes)  — vypíše rozdělení autorů, NEBLOKUJE
//   fáze 2 (sama)  — jakmile se v historii objeví VŠECHNY tři identity, mechanismus žije
//                    a generické jméno u novějšího commitu je regrese → BLOKUJE
// Nikdo si nemusí pamatovat, že se to má přepnout.
//
//   node scripts/verify_commit_identity.js
'use strict';
const { execSync } = require('child_process');

const ROOT = process.env.RUNAR_ROOT || 'C:/Users/zkuku/Downloads/Runar-admin';
const LANES = ['CODE-tune', 'CODE-read', 'CODE-tree'];
const GENERIC = 'Runar Admin';
const KOLIK = 80;

function git(args) {
  try {
    return execSync('git ' + args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch (e) {
    return null;
  }
}

const raw = git('log -' + KOLIK + ' --format=%H%x09%an%x09%s');
if (raw === null) {
  console.log('POZOR: git nedostupný nebo výpis prázdný — kontrola NEPROBĚHLA (není to zelená)');
  process.exit(0);
}
const commity = raw.trim().split('\n').filter(Boolean).map((l) => {
  const [h, an, ...zbytek] = l.split('\t');
  return { h, an, s: zbytek.join('\t') };
});

const pocty = new Map();
for (const c of commity) pocty.set(c.an, (pocty.get(c.an) || 0) + 1);

console.log('  autoři posledních ' + commity.length + ' commitů:');
for (const [jm, n] of [...pocty.entries()].sort((a, b) => b[1] - a[1])) {
  const znam = LANES.indexOf(jm) !== -1;
  console.log('    ' + (znam ? '✓' : '·') + ' ' + jm.padEnd(16) + String(n).padStart(4));
}

// které lane se už kdy podepsaly (celá historie, ne jen okno)
const vsichni = (git('log --format=%an') || '').split('\n');
const prijali = LANES.filter((l) => vsichni.indexOf(l) !== -1);
console.log('  identitu už používá: ' + (prijali.length ? prijali.join(', ') : 'nikdo'));

if (prijali.length < LANES.length) {
  console.log('fáze 1 — ' + prijali.length + '/' + LANES.length
    + ' lane se podepisuje vlastním jménem; kontrola zatím NEBLOKUJE');
  console.log('  Až se podepíšou všechny tři, přepne se sama na blokující.');
  console.log('  Jak: `git -c user.name=\'CODE-<lane>\' commit …` (per-commit, ne git config —'
    + ' strom je sdílený).');
  process.exit(0);
}

// fáze 2: mechanismus žije → generické jméno je regrese
const spatne = commity.filter((c) => c.an === GENERIC);
if (spatne.length) {
  console.log('commit bez identity session — `git log` nepozná autora');
  for (const c of spatne.slice(0, 5)) {
    console.log('  • ' + c.h.slice(0, 7) + '  „' + c.s.slice(0, 62) + '"');
  }
  console.log('  Commituj jako `git -c user.name=\'CODE-<lane>\' commit …`.');
  process.exit(1);
}
console.log('každý commit v okně nese identitu své session');
