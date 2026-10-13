// Mapa nosičů: ke každému pravidlu §N v CLAUDE.md stojí, CO ho drží — kontrola ve smoke, hook v okamžiku činu, nástroj —, nebo výslovně
// „nevynutitelné + proč“. Kontrola hlídá, že mapa nezastará: nové § bez řádku, řádek pro zrušené §, nosič, který neexistuje.
//
// Proč (BACKLOG „Mapa nosičů“, 2026-08-21; postaveno CODE-read 2026-10-13 na ownerovo „pokračuj“): pravidlo o bumpu i pravidlo o délce
// doců existovala jako próza a obě se porušila — první pěti migracemi, druhé devíti docy přes limit. Pravidlo bez nosiče je přání.
// CLAUDE.md §30: co se opakovaně porušuje, dělá stroj. Mapa patří do SKRIPTU, ne do CLAUDE.md (KUKY 2026-08-21) — tam by se rozešla.
// Co mapa NEtvrdí: že nosič pravidlo drží CELÉ. „castecne“ říká, kterou část nedrží nic. Hlídá se existence nosiče, ne jeho síla —
// sílu kontrol ověřuje smoke ㊵ (scripts/protipriklady.py).
//
// Druhy nosičů:  smoke   = skript nebo vestavěná kontrola, kterou pouští smoke.py (skript musí existovat a smoke.py ho musí jmenovat)
//                hook    = hook v repu (hooks/, scripts/utils/pravidla_pri_dotyku.py) — zastaví čin
//                nastroj = skript, kterým se to dělá (jediná cesta), v repu
//                mimo    = uživatelský hook v ~/.claude (mimo repo; chybí-li, jen varování — v cizí kopii repa být nemusí)
//   node scripts/verify_nosice.js        · --test = kontrola sama sebe · --vypis = celá mapa
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const R = process.env.RUNAR_ROOT || 'C:/Users/zkuku/Downloads/Runar-admin';

const PDD = 'scripts/utils/pravidla_pri_dotyku.py';
const ZPRAVA = '~/.claude/runar-zprava-check.py';
const MAPA = {
  '§1':  { drzi: [{ smoke: '① JS SYNTAX' }, { hook: 'hooks/pre-commit.py', co: 'sdílené soubory jen přes commit_vlastni (_SDILENE)' },
                  { hook: PDD, co: 'Edit na sdílený soubor zastaví; pravidla při prvním dotyku JS' }],
           castecne: 'patch skript místo Edit u nesdíleného JS nehlídá nic — chytí jen následek (SyntaxError) v ①' },
  '§2':  { drzi: [{ smoke: 'check-is.py' }, { hook: 'hooks/pre-commit.py', co: 'pouští check-is.py' }, { smoke: 'verify_is_kontrola_jedno_misto.js' }],
           castecne: 'islandštinu výstupu modelu za běhu nekontroluje nic (hlavička check-is.py); jen známé chyby ze zdroje' },
  '§3':  { slouceno: '§18' },
  '§4':  { drzi: [{ hook: 'hooks/pre-commit.py', co: 'auto-bump sw.js, stráž proti downgrade' }, { smoke: '⑤ SW VERZE' }, { smoke: 'verify_sw_shell.js' }] },
  '§5':  { drzi: [{ smoke: 'verify_citelnost.js' }, { smoke: 'verify_rune_glyphs.js' }, { smoke: 'verify_journal_glyphs.js' },
                  { smoke: 'verify_zakazy_cesty.js' }] },   // 2026-10-13: ᚱ bez ozdob a neskrytý reader-content drží ㊂
  '§6':  { nevynutitelne: 'seznam záměrně anglických pojmů je krátký a mění se zřídka; žádná kontrola nepozná, že někdo THE GATHERING přeložil' },
  '§7':  { drzi: [{ hook: 'hooks/pre-push.py', co: 'smoke v čisté kopii commitu' }],
           castecne: '„jeden commit = jedna věc“ a „push ihned“ jsou úsudek; nehlídá je nic' },
  '§8':  { slouceno: '§10' },
  '§9':  { slouceno: '§2' },
  '§10': { drzi: [{ smoke: '② HARDCODED STRINGS' }, { smoke: 'verify_lang_ternary.js' }, { smoke: 'verify_en_natvrdo.js' },
                  { smoke: 'verify_tier_features.js' }, { smoke: 'verify_spread_prices.js' }, { smoke: 'verify_doc_values.js' }] },
  '§11': { drzi: [{ hook: PDD, co: 'past: heredoc se zpětným lomítkem, neviditelný znak z escape v Edit/Write' }],
           castecne: 'escape sekvence v Python skriptu napsaném nástrojem Write nehlídá nic' },
  '§12': { drzi: [{ smoke: 'verify_liferune_states.js' }, { smoke: 'verify_zakazy_cesty.js' }] },   // 2026-10-13: jméno z e-mailu chytá ㊂ (C)
  '§13': { drzi: [{ smoke: 'verify_contract_wiring.js' }, { smoke: 'verify_prompt_levers.js' }, { smoke: 'verify_zakazy_cesty.js' }],
           castecne: 'výklad musí být zapsaný v _SPREAD_COST_KEY, jinak o něm ㊂ neví; nové POLE formuláře mimo prompt a shrine parts[] nehlídá nic' },
  '§14': { drzi: [{ smoke: 'verify_liferune_states.js' }, { smoke: 'verify_pill_lang.js' }, { smoke: 'verify_citelnost.js' }],
           castecne: 'hlídá známé případy (okno jména, pilulky, Deník); nový stavový obsah v updateUIText nepozná' },
  '§15': { slouceno: '§10' },
  '§16': { drzi: [{ smoke: 'verify_decisions_followthrough.js' }, { smoke: 'verify_decisions_numbers.js' }] },
  '§17': { drzi: [{ smoke: 'verify_memory_index.js' }, { smoke: 'verify_canonical_files.js' }, { nastroj: 'scripts/utils/commit_vlastni.py' }] },
  '§18': { drzi: [{ smoke: 'verify_new_duplicates.js' }, { smoke: 'verify_compose_mirror.js' }, { smoke: 'verify_page_copies.js' },
                  { smoke: 'verify_admin_emails.js' }],
           castecne: '„skoro stejná funkce“ (bod 2) a golden-verify refaktoru (bod 3) jsou úsudek' },
  '§19': { drzi: [{ smoke: 'golden_contracts.js' }, { smoke: 'protipriklady.py' }],
           castecne: 'seed-and-assert u NOVÉ hranice nikdo nevynutí' },
  '§20': { drzi: [{ smoke: 'verify_new_duplicates.js' }, { smoke: 'verify_doc_values.js' }, { smoke: 'check-docs.py' },
                  { hook: PDD, co: 'nový text porovná s kánonem; zápis do docs až po uz_vime.js' }] },
  '§21': { nevynutitelne: 'kritický pohled na ownerův nápad je úsudek; stroj ho nepozná ani nevynutí' },
  '§22': { slouceno: '§20' },
  '§23': { drzi: [{ mimo: ZPRAVA, co: 'pravidlo 4: „nejspíš/pravděpodobně“ bez „neověřeno“' }],
           castecne: 'výmysl řečený jistě nepozná nic' },
  '§24': { drzi: [{ mimo: ZPRAVA, co: 'pravidlo 4' }],
           castecne: 'jistě znějící neověřené tvrzení nepozná nic' },
  '§25': { drzi: [{ smoke: 'protipriklady.py' }],
           castecne: 'B (útok na kontroly) drží ㊵; A (obrácená páka u hypotéz) je metoda, nevynutí ji nic' },
  '§26': { slouceno: '§21' },
  '§27': { slouceno: '§25' },
  '§28': { drzi: [{ smoke: 'verify_escape_marks.js' }],
           castecne: 'jen výjimky z kontrol (značky s důvodem a datem); důvod u změny kódu nehlídá nic' },
  '§29': { drzi: [{ nastroj: 'scripts/nacti_cteni.js' }, { mimo: ZPRAVA, co: 'tah neskončí s nezapsaným hlášením' }] },
  '§30': { drzi: [{ hook: 'hooks/pre-commit.py', co: '_SDILENE, mazání cizích řádků' }, { hook: PDD, co: 'pravidla při dotyku, pasti' },
                  { mimo: '~/.claude/runar-api-guard.py', co: 'pokus přes API' }, { smoke: 'verify_pravidla_mapa.js' },
                  { smoke: 'protipriklady.py' }, { smoke: 'verify_nosice.js' }] },
  '§31': { drzi: [{ smoke: 'verify_jazyk_ui.js' }], castecne: 'Gmail (štítky, koncepty) nevidí — postup v paměti schranka-runar-gmail' },
  '§32': { drzi: [{ smoke: 'verify_zaklad_produkce.js' }] },
};

function najdi(jmeno) {
  for (const d of ['scripts', 'scripts/utils', '.', 'scripts/golden']) {
    if (fs.existsSync(path.join(R, d, jmeno))) return true;
  }
  return false;
}

// claude = text CLAUDE.md, smoke = text smoke.py, jeSoubor(rel) a jeMimo(cesta) = existence
function over(mapa, claude, smoke, jeSoubor, jeMimo) {
  const vady = [], varovani = [];
  const nadpisy = {};
  const re = /^### (§\d+) — .*$/gm; let m;
  while ((m = re.exec(claude))) nadpisy[m[1]] = m.index;
  const poradi = Object.keys(nadpisy).sort((a, b) => nadpisy[a] - nadpisy[b]);
  const telo = (s) => {
    const i = poradi.indexOf(s), doo = i + 1 < poradi.length ? nadpisy[poradi[i + 1]] : claude.length;
    return claude.slice(nadpisy[s], doo).split('\n').slice(1, 3).join('\n');   // první dvě řádky pod nadpisem
  };
  for (const s of poradi) if (!mapa[s]) vady.push(s + ': pravidlo v CLAUDE.md nemá v mapě nosič — dopiš ho, nebo „nevynutitelne: <proč>“');
  for (const s of Object.keys(mapa)) {
    const z = mapa[s];
    if (!(s in nadpisy)) { vady.push(s + ': v mapě je, v CLAUDE.md nadpis „### ' + s + ' —“ není (zrušené nebo přečíslované pravidlo)'); continue; }
    if (z.slouceno) {
      if (!new RegExp('^→ ' + z.slouceno + '\\b', 'm').test(telo(s))) vady.push(s + ': mapa říká „sloučeno do ' + z.slouceno + '“, CLAUDE.md to neříká');
      continue;
    }
    if (/^→ §\d+/m.test(telo(s))) vady.push(s + ': CLAUDE.md ho vede jako sloučené, mapa ne');
    const drzi = z.drzi || [];
    if (!drzi.length && !(z.nevynutitelne && z.nevynutitelne.length >= 20)) vady.push(s + ': žádný nosič a chybí „nevynutitelne“ s důvodem');
    for (const n of drzi) {
      if (n.smoke) {
        const jeSkript = /\.(js|py)$/.test(n.smoke);
        if (jeSkript && !jeSoubor(n.smoke)) vady.push(s + ': nosič ' + n.smoke + ' neexistuje');
        if (smoke.indexOf(jeSkript ? path.basename(n.smoke) : n.smoke) === -1) vady.push(s + ': smoke.py nosič „' + n.smoke + '“ nepouští');
      } else if (n.hook || n.nastroj) {
        if (!jeSoubor(n.hook || n.nastroj)) vady.push(s + ': nosič ' + (n.hook || n.nastroj) + ' neexistuje');
      } else if (n.mimo) {
        if (!jeMimo(n.mimo)) varovani.push(s + ': uživatelský hook ' + n.mimo + ' tady není (mimo repo — v téhle kopii pravidlo nedrží)');
      } else vady.push(s + ': neznámý druh nosiče ' + JSON.stringify(n));
    }
  }
  return { vady, varovani, pocet: poradi.length };
}

function jeSouborRepo(rel) { return /\//.test(rel) ? fs.existsSync(path.join(R, rel)) : najdi(rel); }
function jeMimoDomov(p) { return fs.existsSync(p.replace(/^~/, os.homedir())); }

if (process.argv.includes('--test')) {
  const C = '### §1 — a\nx\n### §2 — b\n→ §1 (sloučeno)\n### §3 — c\ny\n';
  const S = 'verify_a.js ① JS';
  const ano = () => true, ne = () => false;
  const D = 'úsudek, který stroj nepozná nikdy';
  const pripady = [
    ['správná mapa projde', { '§1': { drzi: [{ smoke: 'verify_a.js' }] }, '§2': { slouceno: '§1' }, '§3': { nevynutitelne: D } }, ano, 0],
    ['vestavěná kontrola smoke projde', { '§1': { drzi: [{ smoke: '① JS' }] }, '§2': { slouceno: '§1' }, '§3': { nevynutitelne: D } }, ano, 0],
    ['nové § bez řádku padne', { '§1': { drzi: [{ smoke: 'verify_a.js' }] }, '§2': { slouceno: '§1' } }, ano, 1],
    ['nosič, který neexistuje, padne', { '§1': { drzi: [{ smoke: 'verify_a.js' }] }, '§2': { slouceno: '§1' }, '§3': { drzi: [{ hook: 'hooks/x.py' }] } }, (r) => r !== 'hooks/x.py', 1],
    ['nosič, který smoke nepouští, padne', { '§1': { drzi: [{ smoke: 'verify_b.js' }] }, '§2': { slouceno: '§1' }, '§3': { nevynutitelne: D } }, ano, 1],
    ['řádek pro zrušené § padne', { '§1': { drzi: [{ smoke: 'verify_a.js' }] }, '§2': { slouceno: '§1' }, '§3': { nevynutitelne: D }, '§9': { slouceno: '§1' } }, ano, 1],
    ['sloučení, které CLAUDE.md neříká, padne', { '§1': { slouceno: '§3' }, '§2': { slouceno: '§1' }, '§3': { nevynutitelne: D } }, ano, 1],
    ['sloučené v CLAUDE.md, v mapě s nosičem, padne', { '§1': { drzi: [{ smoke: 'verify_a.js' }] }, '§2': { drzi: [{ smoke: 'verify_a.js' }] }, '§3': { nevynutitelne: D } }, ano, 1],
    ['bez nosiče i bez důvodu padne', { '§1': { drzi: [{ smoke: 'verify_a.js' }] }, '§2': { slouceno: '§1' }, '§3': {} }, ano, 1],
  ];
  let spatne = 0;
  for (const [jmeno, mapa, je, cekam] of pripady) {
    const r = over(mapa, C, S, je, ne);
    const ok = cekam ? r.vady.length > 0 : r.vady.length === 0;
    if (!ok) { spatne++; console.log('FAIL  samotest: ' + jmeno + ' — vady: ' + JSON.stringify(r.vady)); }
  }
  if (spatne) process.exit(1);
  console.log('OK    samotest mapy nosičů: ' + pripady.length + ' stavů');
  process.exit(0);
}

const claude = fs.readFileSync(path.join(R, 'CLAUDE.md'), 'utf8');
const smoke = fs.readFileSync(path.join(R, 'smoke.py'), 'utf8');
const r = over(MAPA, claude, smoke, jeSouborRepo, jeMimoDomov);
if (process.argv.includes('--vypis')) {
  for (const s of Object.keys(MAPA)) {
    const z = MAPA[s];
    const t = z.slouceno ? '→ ' + z.slouceno : (z.drzi || []).map((n) => n.smoke || n.hook || n.nastroj || n.mimo).join(' · ') || '—';
    console.log(s.padEnd(4) + ' ' + t + (z.castecne ? '\n      nedrží: ' + z.castecne : '') + (z.nevynutitelne ? '\n      nevynutitelné: ' + z.nevynutitelne : ''));
  }
}
r.varovani.forEach((v) => console.log('WARN  ' + v));
r.vady.forEach((v) => console.log('FAIL  ' + v));
const vlastni = Object.keys(MAPA).filter((s) => !MAPA[s].slouceno);
const plne = vlastni.filter((s) => (MAPA[s].drzi || []).length && !MAPA[s].castecne).length;
const cast = vlastni.filter((s) => (MAPA[s].drzi || []).length && MAPA[s].castecne).length;
const nic = vlastni.filter((s) => !(MAPA[s].drzi || []).length).length;
if (r.vady.length) { console.log('FAIL  mapa nosičů: ' + r.vady.length + ' vad (scripts/verify_nosice.js, MAPA)'); process.exit(1); }
console.log('OK    nosiče pravidel: ' + r.pocet + ' § v CLAUDE.md — ' + plne + ' drží stroj, ' + cast + ' jen zčásti, ' + nic
  + ' nevynutitelné, ' + (r.pocet - vlastni.length) + ' sloučené');
