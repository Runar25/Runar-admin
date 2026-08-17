// Tvrzení, které v kánonu už jednou stojí, se právě píše podruhé. Zachytit to TEĎ.
//
// KUKY opakovaně: „drift a duplikáty jsou nejhorší" · §20: „nechci, aby informace žily na víc
// než jednom místě". Audit 2026-07-18 našel 97 rozporů nad ~12 fakty — každý začal druhou kopií.
// Yggdrasil kvůli tomu owner opravoval 5×: opraví se tři výskyty, čtvrtý přežije jako pravda.
//
// 2026-08-17 se to stalo znovu a přímo v pravidle o tom: do `memory/working-style.md` jsem vložil
// tvrzení „Claude drží memory/snapshots/ čerstvý průběžně" PODRUHÉ. Vlastní krok 2 postupu
// („grepni cílový soubor na pojem, který do něj neseš") jsem na sebe nepoužil. Tohle je ten grep.
//
// ⚠️ JEDNOTKA JE **TUČNÝ ÚSEK**, NE ŘÁDKA ANI VĚTA — a je to změřené, ne odhadnuté.
// První verze (2026-08-17) porovnávala celé řádky. Na skutečné vadě NESEDLA: doky jsou ručně
// zalamované, takže tytéž dvě tvrzení stály na řádkách, které se po pomlčce lišily. Změřeno na
// stavu, kde vada prokazatelně byla (commit dd0a245) i na dnešním kánonu:
//     jednotka          celkem   opakovaných (dnes)   chytí tu vadu?
//     tučný úsek ≥25      1905          2                 ANO
//     věta ≥60            2889          2                 ne (0 na vadném stavu)
//     8-gram ≥45         36675         93                 ano, ale v šumu
// V těchhle docích nese tučný úsek právě to tvrzení, o které jde; proto je jednotkou on.
//
// BLOKUJE jen NOVÉ opakování (přibylo proti HEAD). Zastaralá opakování se VYPÍŠOU jako ℹ —
// §19.2 zakazuje tiché zelené — ale smoke neshodí, jinak by se kontrola první den vypnula.
//
//   node scripts/verify_new_duplicates.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = process.env.RUNAR_ROOT || 'C:/Users/zkuku/Downloads/Runar-admin';
const MIN = 25;   // pod tím jsou to štítky („Proč:", „Pravidlo") a shoda nic neznamená

// Kánon = doky, kde má fakt bydlet právě jednou. VYNECHÁNO schválně:
//   RUNAR_DECISIONS.md — append-only log; nový záznam legitimně cituje starý
//   memory/snapshots/  — historie ke svému dni; opakování mezi dny je v pořádku
function kanon() {
  const out = [];
  for (const f of fs.readdirSync(ROOT)) {
    if (f === 'CLAUDE.md' || (f.startsWith('RUNAR_') && f.endsWith('.md') && f !== 'RUNAR_DECISIONS.md')) {
      out.push(f);
    }
  }
  const mem = path.join(ROOT, 'memory');
  if (fs.existsSync(mem)) {
    for (const f of fs.readdirSync(mem)) if (f.endsWith('.md')) out.push('memory/' + f);
  }
  return out.sort();
}

function git(args) {
  try {
    return execSync('git ' + args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch (e) {
    return null;   // není repo / soubor není v HEAD → chová se jako prázdný předchozí stav
  }
}

const norm = (t) => t.replace(/<!--[\s\S]*?-->/g, ' ').replace(/[*_`#>]/g, ' ')
  .replace(/\s+/g, ' ').trim().toLowerCase();

// Tučné úseky v jednom textu → mapa klíč → počet
//
// ⚠️ NE regexem `\*\*([^*]{20,})\*\*`. Ten páruje hvězdičky napřeskáčku: stojí-li před dlouhým
// úsekem krátký (**Proč:** … **dlouhé tvrzení**), spáruje se ZAVÍRACÍ dvojice prvního s OTVÍRACÍ
// druhého, sežere ji — a skutečný úsek se nikdy nezměří. Odhalily to stavy D+E rozbíjecího testu
// (samotná kontrola na nich mlčela) a znehodnotilo to i moje první měření kánonu.
// Správně: dělit na `**` a brát liché díly — pak jsou dvojice v pořadí, v jakém v textu jsou.
function tucne(text) {
  const m = new Map();
  const bezKodu = text.replace(/```[\s\S]*?```/g, ' ');
  const dily = bezKodu.split('**');
  for (let i = 1; i < dily.length; i += 2) {
    const obsah = dily[i];
    if (/\n\s*\n/.test(obsah)) continue;   // přes prázdný řádek = nepárová hvězdička, ne úsek
    const k = norm(obsah);
    if (k.length >= MIN) m.set(k, (m.get(k) || 0) + 1);
  }
  return m;
}

const ted = new Map();     // klíč → [soubory]
const drive = new Map();   // klíč → počet v HEAD
let bezGitu = true;        // shodí se na false, jakmile se povede přečíst cokoli z HEAD
for (const rel of kanon()) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) continue;
  for (const [k, n] of tucne(fs.readFileSync(p, 'utf8'))) {
    if (!ted.has(k)) ted.set(k, []);
    for (let i = 0; i < n; i++) ted.get(k).push(rel);
  }
  const head = git('show HEAD:"' + rel + '"');
  if (head !== null) {
    bezGitu = false;
    for (const [k, n] of tucne(head)) drive.set(k, (drive.get(k) || 0) + n);
  }
}

// Mimo git (nebo úplně nový strom) NENÍ s čím porovnat — pak by KAŽDÉ opakování vypadalo jako
// nové a kontrola by shodila smoke za cizí historii. Bez porovnání se proto jen hlásí, neblokuje.
if (bezGitu) {
  for (const [k, kde] of ted) if (kde.length > 1) drive.set(k, kde.length);
}

const nove = [], stare = [];
for (const [k, kde] of ted) {
  if (kde.length < 2) continue;
  const bylo = drive.get(k) || 0;
  const popis = kde.length + '× „' + k.slice(0, 66) + '…"\n      ' + [...new Set(kde)].join(' · ');
  if (kde.length > bylo) nove.push(popis + (bylo ? '   (v HEAD bylo ' + bylo + '×)' : ''));
  else stare.push(popis);
}

if (nove.length) {
  console.log('nové opakování tvrzení, které v kánonu UŽ stojí (§20 — jedna informace, jedno místo)');
  for (const n of nove) console.log('  • ' + n);
  console.log('  Buď to připiš k existujícímu, nebo tam nech odkaz. Druhá kopie se dřív či později rozejde.');
  if (stare.length) console.log('  (a ' + stare.length + ' starších opakování, ta smoke neshazují)');
  process.exit(1);
}
if (stare.length) {
  console.log('nic nového; POZOR na ' + stare.length + ' starší opakování v kánonu (neblokují)');
  for (const s of stare) console.log('  ℹ ' + s);
} else {
  console.log('žádné tvrzení v kánonu nestojí dvakrát');
}
