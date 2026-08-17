// Datovaný záznam, který vznikl DNES, musí nést DNEŠNÍ datum.
//
// KUKY 2026-08-17 strávil den tím, že mě po compactu učil věci, které už dávno zapsané jsou.
// Jedna z příčin byla měřitelná: **19 záznamů zapsaných 17. 8. neslo datum 16. 8.** Datum jsem
// opsal z kontextu vlitého po compactu (nesl včerejší snapshot), místo abych ho zjistil.
//
// Proč to není kosmetika: celý systém rozhodování stojí na větě „při sporu vyhrává NOVĚJŠÍ
// datovaný záznam" (MEMORY.md, CLAUDE.md §20). Záznam s datem o den zpět tenhle rozhodčí
// mechanismus tiše obrací — a po compactu už nikdo nepozná, který stamp je pravý.
//
// Hlídá tři věci, všechny s nulovým prostorem pro falešný poplach:
//   1. NOVÝ nadpis `## YYYY-MM-DD` v RUNAR_DECISIONS.md  → musí být dnešek
//   2. NOVÝ soubor `memory/snapshots/YYYY-MM-DD-*.md`    → musí být dnešek
//   3. append-only pořadí v RUNAR_DECISIONS.md           → poslední nadpis = nejvyšší datum
//      (2026-08-17 mi záznam spadl NAD dva starší dnešní; všiml jsem si až ručně)
//
// „Nový" = přibylo proti HEAD (`git diff HEAD` + untracked). Beze změn kontrola mlčí.
//
//   node scripts/verify_fresh_dates.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = process.env.RUNAR_ROOT || 'C:/Users/zkuku/Downloads/Runar-admin';
const DEC = 'RUNAR_DECISIONS.md';
const SNAP = 'memory/snapshots';
const NADPIS = /^##\s+(\d{4}-\d{2}-\d{2})\b/;
const SOUBOR = /^(\d{4}-\d{2}-\d{2})-.+\.md$/;

function git(args) {
  try {
    return execSync('git ' + args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch (e) {
    return '';   // není repo / git nedostupný → kontrola mlčí, nesmí shodit smoke
  }
}

// dnešek v LOKÁLNÍM čase (ne UTC — o půlnoci by UTC hlásilo jiný den než `git log`)
const d = new Date();
const DNES = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
  + '-' + String(d.getDate()).padStart(2, '0');

const nalezy = [];

// ── 1. nové nadpisy v RUNAR_DECISIONS.md ────────────────────────────────
const diff = git('diff HEAD -U0 -- ' + DEC);
for (const ln of diff.split('\n')) {
  if (!ln.startsWith('+') || ln.startsWith('+++')) continue;
  const m = NADPIS.exec(ln.slice(1));
  if (m && m[1] !== DNES) {
    nalezy.push(DEC + ': nový záznam datovaný ' + m[1] + ', ale dnes je ' + DNES
      + '\n    „' + ln.slice(1).trim().slice(0, 76) + '"');
  }
}

// ── 2. nové snapshoty ───────────────────────────────────────────────────
// `-uall` je nutné: kdyby byla celá složka neverzovaná, git vypíše JEN ji („?? memory/snapshots/")
// a jednotlivé soubory zamlčí — nový snapshot by prošel. Odhalil to stav D rozbíjecího testu.
const nove = git('status --porcelain -uall -- ' + SNAP).split('\n')
  .map((l) => l.trim())
  .filter((l) => l.startsWith('??') || l.startsWith('A '))
  .map((l) => path.basename(l.replace(/^(\?\?|A )\s*/, '').replace(/"/g, '')));
for (const jm of nove) {
  const m = SOUBOR.exec(jm);
  if (m && m[1] !== DNES) {
    nalezy.push(SNAP + '/' + jm + ': nový snapshot datovaný ' + m[1] + ', ale dnes je ' + DNES);
  }
}

// ── 3. append-only: nový záznam patří na KONEC ──────────────────────────
// ⚠️ NEkontroluje se „celý soubor je seřazený". První verze to dělala a okamžitě shodila smoke
// na inverzi z června 2026 — cizí historii, se kterou nemá dnešní práce nic společného. Kontrola,
// která padá za cizí minulost, se do týdne vypne. Porovnává se proto TVAR ZMĚNY: seznam nadpisů
// v HEAD musí být PŘEDPONOU seznamu teď. Vloží-li se záznam doprostřed, předpona se rozejde.
// Doloženo 2026-08-17: záznam mi spadl NAD dva starší dnešní a všiml jsem si až ručně.
if (diff.trim()) {
  const nadpisy = (txt) => txt.split('\n').map((l) => NADPIS.exec(l)).filter(Boolean).map((m) => m[1]);
  const cesta = path.join(ROOT, DEC);
  const vHead = git('show HEAD:"' + DEC + '"');
  if (vHead && fs.existsSync(cesta)) {
    const pred = nadpisy(vHead);
    const ted = nadpisy(fs.readFileSync(cesta, 'utf8'));
    const kolize = pred.findIndex((d, i) => ted[i] !== d);
    if (kolize >= 0) {
      nalezy.push(DEC + ': nový záznam nepřibyl na KONEC — na pozici ' + (kolize + 1)
        + ' bylo „' + pred[kolize] + '", teď je tam „' + (ted[kolize] || '(nic)') + '"'
        + '\n    Append-only znamená připsat pod poslední záznam, ne vložit mezi.');
    }
  }
}

if (nalezy.length) {
  console.log('datum záznamu nesouhlasí s dneškem (' + DNES + ')');
  for (const n of nalezy) console.log('  • ' + n);
  console.log('  Datum ber z `date`, ne z paměti ani z vlitého kontextu — ten nese VČEREJŠÍ snapshot.');
  process.exit(1);
}
console.log('datované záznamy z tohoto stromu nesou dnešek (' + DNES + ') a drží append-only pořadí');
