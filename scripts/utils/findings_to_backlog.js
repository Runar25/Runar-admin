// findings_to_backlog.js — nálezy z workflow SAMY do repa, ať se neztratí.
//
// PROČ EXISTUJE (2026-08-15): §20 sweep našel 34 nálezů. Opravilo se sedm. Zbytek žil
// jen v transkriptu workflow, který po zavření okna zmizí — a přežil jedině proto, že
// si o něj owner řekl a já ho ručně opsal. To je špatná pojistka: závisí na tom, jestli
// si někdo vzpomene. Nález má jít do repa PRVNÍ, ne poslední.
//
// CO DĚLÁ
//   1. přečte journal.jsonl daného workflow běhu (jeden {"type":"result"} řádek na agenta)
//   2. uloží VŠECHNY strukturované výsledky do docs/findings/<datum>-<runId>.md
//   3. přidá JEDEN řádek do RUNAR_BACKLOG.md, který na ten soubor ukazuje
//
// Proč zvlášť soubor a ne rovnou do backlogu: backlog vlastní OTEVŘENÉ ÚKOLY a má se
// dát přečíst (~200 řádků, doc-owner pravidlo). Surové nálezy jsou důkazní materiál —
// vlastní je vlastní soubor, backlog na něj odkazuje (§20).
//
//   node scripts/utils/findings_to_backlog.js <runId|cesta k transcript dir> ["popis"]
//
// Idempotentní: druhé spuštění na týž runId nic nepřepíše a řekne to.
const fs = require('fs'), path = require('path');

const REPO = 'C:/Users/zkuku/Downloads/Runar-admin';
const SESS = process.env.CLAUDE_SESSION_DIR ||
  'C:/Users/zkuku/.claude/projects/C--Users-zkuku';

function die(m) { console.error('  ✗ ' + m); process.exit(1); }

const arg = process.argv[2];
if (!arg) die('chybí runId nebo cesta. Usage: node findings_to_backlog.js <runId> ["popis"]');
const popis = process.argv[3] || 'nálezy z workflow';

// runId → cesta. Hledá se napříč session adresáři, ať uživatel nemusí znát strukturu.
let dir = arg;
if (!fs.existsSync(path.join(dir, 'journal.jsonl'))) {
  const roots = fs.existsSync(SESS) ? fs.readdirSync(SESS).map((d) => path.join(SESS, d, 'subagents/workflows')) : [];
  const found = roots.filter((r) => fs.existsSync(r))
    .flatMap((r) => fs.readdirSync(r).map((d) => path.join(r, d)))
    .find((d) => d.indexOf(arg) !== -1 && fs.existsSync(path.join(d, 'journal.jsonl')));
  if (!found) die('journal.jsonl nenalezen pro "' + arg + '"');
  dir = found;
}

const runId = path.basename(dir);
const lines = fs.readFileSync(path.join(dir, 'journal.jsonl'), 'utf8').trim().split('\n');
const results = lines.map((l) => { try { return JSON.parse(l); } catch (e) { return null; } })
  .filter((o) => o && o.type === 'result' && o.result !== undefined && o.result !== null);

if (!results.length) die('journal nemá žádný {"type":"result"} záznam — není co uložit');

const dnes = new Date().toISOString().slice(0, 10);
const outRel = 'docs/findings/' + dnes + '-' + runId + '.md';
const outAbs = path.join(REPO, outRel);
if (fs.existsSync(outAbs)) {
  console.log('  ~ ' + outRel + ' už existuje — nic nepřepisuju.');
  process.exit(0);
}
fs.mkdirSync(path.dirname(outAbs), { recursive: true });

let md = '# Nálezy — ' + popis + '\n\n';
md += '**Běh:** `' + runId + '` · **uloženo:** ' + dnes + ' · **agentů:** ' + results.length + '\n\n';
md += '> Surový výstup workflow, uložený automaticky (`scripts/utils/findings_to_backlog.js`).\n';
md += '> Není to zadání ani rozhodnutí — je to **důkazní materiál**. Co z toho je otevřený úkol,\n';
md += '> patří do `RUNAR_BACKLOG.md`; co je rozhodnutí, do `RUNAR_DECISIONS.md` (§20).\n';
md += '> Nálezy z workflow jsou **tvrzení agentů** — než podle nich sáhneš do kódu, ověř je\n';
md += '> spuštěním (§24). V tomhle repu už se stalo, že agent doložil nález zdrojem, který\n';
md += '> existoval, ale byl podvržený.\n\n';
results.forEach((r, i) => {
  const v = typeof r.result === 'string' ? r.result : JSON.stringify(r.result, null, 1);
  md += '---\n\n## Agent ' + (i + 1) + (r.label ? ' — ' + r.label : '') + '\n\n';
  md += (typeof r.result === 'string' ? v : '```json\n' + v + '\n```') + '\n\n';
});
// ⚠️ REPO JE VEŘEJNÉ. Workflow, které analyzuje ČTENÍ, drží osobní údaje
// (RUNAR_PRIVACY.md) — commit by je zveřejnil. `export_readings.js` proto zápis do repa
// odmítá úplně; tady odmítáme taky, jen cíleně, protože většina sweepů je čistě o kódu.
// Radši falešný poplach než zveřejněné cizí čtení: v pochybnostech to spadne.
const OSOBNI = [
  [/\buser_id\b/i, 'user_id'],
  [/[\w.+-]+@[\w-]+\.[a-z]{2,}/i, 'e-mailová adresa'],
  [/"(reading_text|short_text|deep_text|ask_a|ask_q)"\s*:/i, 'text čtení z DB'],
  [/\bauth\.users\b/i, 'auth.users'],
  [/\b(eyJ[A-Za-z0-9_-]{20,})/, 'JWT token'],
  [/\bservice_role\b/i, 'service_role klíč'],
];
const nalezeno = OSOBNI.filter(([re]) => re.test(md)).map(([, jm]) => jm);
if (nalezeno.length) {
  console.error('  ✗ NEZAPSÁNO — výstup vypadá, že obsahuje osobní údaje nebo tajemství:');
  nalezeno.forEach((n) => console.error('      · ' + n));
  console.error('    Repo Runar25/Runar-admin je VEŘEJNÉ (RUNAR_PRIVACY.md).');
  console.error('    Ulož to mimo repo (~/runar-eval/) a do backlogu dej jen shrnutí bez dat.');
  process.exit(1);
}

fs.writeFileSync(outAbs, md, 'utf8');

const BL = path.join(REPO, 'RUNAR_BACKLOG.md');
let bl = fs.readFileSync(BL, 'utf8');
const MARK = '<!-- AUTO-NALEZY -->';
const radek = '- [' + dnes + ' — ' + popis + '](' + outRel + ') · běh `' + runId + '` · ' + results.length + ' agentů — **k triáži**';
if (bl.indexOf(outRel) !== -1) {
  console.log('  ~ backlog už na to ukazuje.');
} else if (bl.indexOf(MARK) !== -1) {
  bl = bl.replace(MARK, MARK + '\n' + radek);
  fs.writeFileSync(BL, bl, 'utf8');
} else {
  bl = bl.replace(/\n*$/, '\n') +
    '\n## Nálezy z workflow — k triáži\n' +
    'Ukládá se sem automaticky. Surový materiál žije v `docs/findings/`, tady je jen ukazatel (§20).\n' +
    MARK + '\n' + radek + '\n';
  fs.writeFileSync(BL, bl, 'utf8');
}

console.log('  ✓ ' + outRel + '  (' + results.length + ' agentů, ' + Math.round(md.length / 1024) + ' kB)');
console.log('  ✓ RUNAR_BACKLOG.md — ukazatel doplněn');
console.log('  → commitni obojí, jinak to pořád žije jen u tebe na disku');
