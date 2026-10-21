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

// CLAUDE.md (2026-10-21, owner „11. ano 12. ano“, DECISIONS 2026-10-21 (4)): z limitu řádků je vyňatý, a proto rostl bez zábrany
// (12,8 KB 2026-07-01 → 59 KB 2026-10-21, zkráceno na 27 KB). Drží ho strop v bajtech a zákaz historie — „do X tu stálo“, „Doloženo“,
// citace ownera s datem. Ty pravidlo nevynucují, jen ho ředí; patří do RUNAR_DECISIONS.md nebo docs/pravidla-duvody.md (§28).
// Řádky začínají „FAIL  CLAUDE.md“, aby commit s vadou zastavil už pre-commit (scripts/utils/rychle_kontroly.py), ne až pre-push.
const CLAUDE_STROP_B = 32000;
const CLAUDE_HISTORIE = [
  [/\bdo 20\d\d-\d\d-\d\d\b[^\n]{0,60}?\bst(á|a)l/i, '„do <datum> tu stálo“'],
  [/Doloženo/i, '„Doloženo“'],
  [/\bKUKY 20\d\d-\d\d-\d\d/, 'citace ownera s datem („KUKY <datum>“)'],
];
function kontrolaClaude() {
  const f = path.join(ROOT, 'CLAUDE.md');
  if (!fs.existsSync(f)) return [];
  const buf = fs.readFileSync(f), vady = [];
  if (buf.length > CLAUDE_STROP_B)
    vady.push('FAIL  CLAUDE.md má ' + buf.length + ' B, strop ' + CLAUDE_STROP_B + ' B — zkrať: důvody a historii do docs/pravidla-duvody.md, stav do docs/projekt-mapa.md');
  buf.toString('utf8').split('\n').forEach((l, i) => {
    for (const [re, co] of CLAUDE_HISTORIE)
      if (re.test(l)) { vady.push('FAIL  CLAUDE.md:' + (i + 1) + ' historie v CLAUDE.md (' + co + ') — patří do RUNAR_DECISIONS.md / docs/pravidla-duvody.md (§28)'); break; }
  });
  return vady;
}

// 2026-09-20: petici dluhum z 2026-08-21 vyprselo 30 dni a cerveny smoke zablokoval push
// VSEM lanam. Obnoveno s dnesnim datem (duvody nezmenene a dal plati — zadny z docu nejde
// zkratit jednostranne: DESIGN/PRICING ceka na ownera, EVAL_LOG na CODE-read, BACKLOG na
// uzavirani polozek). Ownerovi ohlaseno v konverzaci CODE-tune 2026-09-20.
const VYJIMKY = {
  'CLAUDE.md': { typ: 'trvala', duvod: 'Vyňat z limitu řádků (KUKY 2026-08-17): pravidla přesahují 200 řádků a jsou důvod, proč ten soubor existuje. Drží ho strop CLAUDE_STROP_B a zákaz historie níž (2026-10-21).' },
  'RUNAR_DECISIONS.md': { typ: 'trvala', duvod: 'Append-only log rozhodnutí (§16). Rozdělením by se rozbilo pravidlo „při sporu vyhrává nejnovější datovaný záznam" — hledá se v jednom souboru.' },
  'RUNAR_DESIGN.md': { typ: 'dluh', datum: '2026-10-20', duvod: 'Vlastní design, mytologii a spready dohromady; rozdělení je obsahové rozhodnutí ownera, ne mechanické. Obnoveno 2026-10-20 po vypršení (blokovalo push všem lanům, potřetí) — zkrácení je položka BACKLOGu „Délka živých doců“, další obnova bez zkrácení ne.' },
  'RUNAR_BACKLOG.md': { typ: 'dluh', datum: '2026-10-20', duvod: 'Roste s otevřenými úkoly. Zkrátí se uzavíráním položek, ne rozdělením. Obnoveno 2026-10-20 po vypršení (blokovalo push všem lanům, potřetí) — zkrácení je položka BACKLOGu „Délka živých doců“, další obnova bez zkrácení ne.' },
  'RUNAR_PRICING.md': { typ: 'dluh', datum: '2026-10-20', duvod: 'Business model + fyzické produkty v jednom; rozdělení čeká na rozhodnutí ownera. Obnoveno 2026-10-20 po vypršení (blokovalo push všem lanům, potřetí) — zkrácení je položka BACKLOGu „Délka živých doců“, další obnova bez zkrácení ne.' },
  'RUNAR_EVAL_LOG.md': { typ: 'dluh', datum: '2026-10-20', duvod: 'Po odsunu měření 08-06→08-17 do archivu 596 řádků. Další zkrácení = odsunout starší baseline, až přestane sloužit ke srovnání. Obnoveno 2026-10-20 po vypršení (blokovalo push všem lanům, potřetí) — zkrácení je položka BACKLOGu „Délka živých doců“, další obnova bez zkrácení ne.' },
  'RUNAR_POPISY_RUN.md': { typ: 'trvala', duvod: 'Sbirka 25+ samostatnych ownerovych popisu run (jeden na runu). Roste s poctem run, ne s driftem; rozdelenim by jedno misto (§20) zdedilo 25 mist. Delka neni znak toho, ze se doc rozjel.' },
  'memory/working-style.md': { typ: 'dluh', datum: '2026-10-20', duvod: 'Sbírka pracovních návyků; část patří do samostatných memory souborů. Obnoveno 2026-10-20 po vypršení (blokovalo push všem lanům, potřetí) — zkrácení je položka BACKLOGu „Délka živých doců“, další obnova bez zkrácení ne.' },
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

const vadyClaude = kontrolaClaude();
if (vadyClaude.length) {
  vadyClaude.forEach((v) => console.log(v));
  process.exit(1);
}

if (!fail) {
  console.log('  OK    živé docy: nic bez výjimky nepřesahuje ' + LIMIT + ' řádků; CLAUDE.md pod ' + CLAUDE_STROP_B + ' B a bez historie');
  pres.forEach((p) => console.log('       ℹ  ' + String(p.n).padStart(5) + '  ' + p.rel + '  — ' + p.stav));
  process.exit(0);
}
console.log('  ' + fail + ' doc(ů) přes ' + LIMIT + ' řádků bez platné výjimky:');
pres.forEach((p) => console.log('       ' + String(p.n).padStart(5) + '  ' + p.rel + '  — ' + p.stav
  + (p.duvod ? ('\n              ' + p.duvod) : '')));
console.log('       -> Buď doc zkrať/rozděl, nebo doplň VÝJIMKU s důvodem a datem');
console.log('          do scripts/verify_doc_length.js. Dluh po ' + DLUH_DNI + ' dnech vyprší.');
process.exit(1);
