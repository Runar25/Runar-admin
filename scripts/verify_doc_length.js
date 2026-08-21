// ㉝ DÉLKA ŽIVÝCH DOCŮ
//
// PROC: pravidlo „doc ~200 radku, 250 uz je moc" existuje od 2026-07-05. K 2026-08-21 melo
// DEVET zivych docu pres limit, jeden osminasobek (RUNAR_EVAL_LOG 1729 radek) — a nikdo nic
// nerekl, protoze delku NIC NEPOCITALO. Psalo se do nich dal, jako by se nechumelilo.
// Pravidlo bez zavory je preani.
//
// ⚠️ VYJIMKA S DATEM SAMA VYPRSI. Trvala vyjimka musi mit duvod, ktery plati porad (append-only
// log). Dluh je jina vec: dostane datum a po 30 dnech kontrola ZCERVENA. Bez toho by se z
// vyjimek stala tapeta — presne to, co u escape znacek uz jednou nastalo (35 holych znacek
// umlcelo cervenou a nikdo nepoznal, ktera je legitimni).
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const LIMIT = 250;          // doc-owner pravidlo: ~200, 250 jeste OK
const DLUH_DNI = 30;        // dluh starsi nez tohle uz neni dluh, ale stav

const VYJIMKY = {
  'CLAUDE.md': { typ: 'trvala', duvod: 'Vyňat z limitu rozhodnutím KUKY 2026-08-17 po měření: samotná pravidla §1–§28 přesahují 200 řádků a jsou důvod, proč ten soubor existuje. Platí pro něj jen test „způsobí jeho chybění chybu?".' },
  'RUNAR_DECISIONS.md': { typ: 'trvala', duvod: 'Append-only log rozhodnutí (§16). Rozdělením by se rozbilo pravidlo „při sporu vyhrává nejnovější datovaný záznam" — hledá se v jednom souboru.' },
  'RUNAR_DESIGN.md': { typ: 'dluh', datum: '2026-08-21', duvod: 'Vlastní design, mytologii a spready dohromady; rozdělení je obsahové rozhodnutí ownera, ne mechanické.' },
  'RUNAR_BACKLOG.md': { typ: 'dluh', datum: '2026-08-21', duvod: 'Roste s otevřenými úkoly. Zkrátí se uzavíráním položek, ne rozdělením.' },
  'RUNAR_PRICING.md': { typ: 'dluh', datum: '2026-08-21', duvod: 'Business model + fyzické produkty v jednom; rozdělení čeká na rozhodnutí ownera.' },
  'RUNAR_EVAL_LOG.md': { typ: 'dluh', datum: '2026-08-21', duvod: 'Po odsunu měření 08-06→08-17 do archivu 596 řádků. Další zkrácení = odsunout starší baseline, až přestane sloužit ke srovnání.' },
  'memory/working-style.md': { typ: 'dluh', datum: '2026-08-21', duvod: 'Sbírka pracovních návyků; část patří do samostatných memory souborů.' },
};

function zivedocs() {
  const out = [];
  for (const f of fs.readdirSync(ROOT))
    if (/^(RUNAR_.*|CLAUDE)\.md$/.test(f)) out.push(f);
  const mem = path.join(ROOT, 'memory');
  if (fs.existsSync(mem))
    for (const f of fs.readdirSync(mem))
      if (f.endsWith('.md')) out.push('memory/' + f);
  return out.sort();
}

const dnes = new Date();
const stari = (d) => Math.round((dnes - new Date(d)) / 86400000);

let fail = 0;
const pres = [];
for (const rel of zivedocs()) {
  const n = fs.readFileSync(path.join(ROOT, rel), 'utf8').split('\n').length;
  if (n <= LIMIT) continue;
  const v = VYJIMKY[rel];
  if (!v) { fail++; pres.push({ rel, n, stav: 'BEZ VÝJIMKY' }); continue; }
  if (v.typ === 'trvala') { pres.push({ rel, n, stav: 'trvalá výjimka', duvod: v.duvod }); continue; }
  if (!v.datum) { fail++; pres.push({ rel, n, stav: 'DLUH BEZ DATA' }); continue; }
  const dni = stari(v.datum);
  if (dni > DLUH_DNI) { fail++; pres.push({ rel, n, stav: 'DLUH VYPRŠEL (' + dni + ' dní)', duvod: v.duvod }); }
  else pres.push({ rel, n, stav: 'dluh, ' + dni + ' dní z ' + DLUH_DNI, duvod: v.duvod });
}

if (!fail) {
  console.log('  OK    živé docy: nic bez výjimky nepřesahuje ' + LIMIT + ' řádků');
  pres.forEach((p) => console.log('       ℹ  ' + String(p.n).padStart(5) + '  ' + p.rel + '  — ' + p.stav));
  process.exit(0);
}
console.log('  ' + fail + ' doc(ů) přes ' + LIMIT + ' řádků bez platné výjimky:');
pres.forEach((p) => console.log('       ' + String(p.n).padStart(5) + '  ' + p.rel + '  — ' + p.stav
  + (p.duvod ? ('\n              ' + p.duvod) : '')));
console.log('       -> Buď doc zkrať/rozděl, nebo doplň VÝJIMKU s důvodem a datem');
console.log('          do scripts/verify_doc_length.js. Dluh po ' + DLUH_DNI + ' dnech vyprší.');
process.exit(1);
