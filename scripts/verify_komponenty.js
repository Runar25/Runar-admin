// verify_komponenty.js — SOUPIS KOMPONENT APPKY (jediné místo) + kontrola, že ho nový vzhled dodržuje. Smoke ㊋.
//
// Proč (owner 2026-10-20, po soupisu rozdílů od CODE-read docs/inbox/2026-10-20-jednotny-vzhled.md): „to má být sjednocené … okna,
// text, font, barvy … musíš to mít někde speciálně napsané, abys to dodržoval? Tak to udělej.“ Do té doby každá nová věc dostala
// vlastní třídu (okno se jménem, .btn-gold 2×, šest podob rozbalovače, čtyři podoby drobné poznámky) — 2026-10-19/20 i moje.
// Tahle hlavička se ukáže sama při prvním dotyku runar-reader.css / .html (hook pravidla_pri_dotyku.py, mapa „UI readeru a shrine“).
//
// NOVÝ PRVEK UI = napřed sem. Použij komponentu z tabulky. Nová třída v runar-reader.css, která tu není, projde jen s řádkem
// „VLASTNÍ .třída — důvod“ níž. Hodnoty (barvy, velikosti) bydlí v runar-reader.css, tady jen KTERÁ třída nese KTERÝ kus (§20).
//
// KOMPONENTA        TŘÍDY                                                 KDY
// okno              .modal-overlay .modal .modal-close .modal-title .modal-sub   každé okno; ✕ vždy; Esc + klik mimo = OKNA_ZAVRI
//                                                                         (runar-app.js); souhlas testera jen ✕
// plné tlačítko     .btn-full  (.small = malé plné)                       hlavní akce obrazovky, nejvýš jedna velká
// obrysové          .btn-upgrade .tn-btn .btn-half                        ostatní akce; jedna velikost; .btn-full.sec = totéž
// tlačítko v řádku  .redeem-btn .ask-btn                                  vedle pole (kód karty, otázka)
// široké vedlejší   .btn-voice                                            hlas, vedlejší široká akce
// řada tlačítek     .btn-row                                              dvě .btn-half vedle sebe
// rozbalovač        .xp-plus  (::after u .guide-lbl .hint-tgl .ask-lbl)   „+“ ZA textem → „×“; nositel tlačítko s aria-expanded
// šipka „→“         v textu tlačítka/odkazu                              VEDE JINAM (okno, obrazovka, web); jinde nikdy
// nabídka „▾“       .auth-user                                            jen nabídka pod jménem
// přepínač          .lang-toggle .lang-btn                                dvě až tři volby vedle sebe
// pilulky           .pills .pill                                          výběr z možností ve formuláři
// oznámení          .tier-notice  (.tn-compact = bez rámečku)             pruh nad formulářem
// závoj            .zavoj  (uvnitř .tn-text + .tn-btn .btn-upgrade)      zamčená věc po klepnutí: věta „… opens with {tier}“ a jedno tlačítko;
//                                                                         staví zavoj() v runar-utils.js, rozzáří rozsvit (owner 2026-11-01)
// štítek sekce      .flbl .auth-lbl .redeem-lbl                           Cinzel, zlatá
// pole              .txt                                                  podtržení, bez rámečku
// poznámka          .note                                                 vysvětlení pod polem
// drobná poznámka   .fine                                                 upozornění, poznámka v okně
// glyf runy         .rune-svg  (runeSvg v runar-utils.js, §5)             kámen = tahaná runa, holá = popisek
// ikona položky     .sp-ik     (_spText v runar-app.js)                    značka / kreslená ikona položky menu, 1,35 × text (2026-10-28)
// papír            .papir .papir-list .papir-hlava .papir-text           nadpis s „+“ a notou, rozvine se přes obsah pod ním („How a reading
//                   (.otevreny .pohyb .rozvinuty .videt .papir-posuv)     works“, BEFORE WE BEGIN; owner 2026-10-30); .videt = odkrytý odstavec;
//                                                                         .papir-posuv = ukazatel posunu dlouhého textu (2026-10-31)
// čekání na model   .whispers-loading-inner .whispers-loading-star        KAŽDÉ čekání na text od modelu: pulzující značka ᚱ (znackaSvg), nápis
//                   .whispers-loading-label .reading-loading-motto        „THE STONES SPEAK IN SILENCE…“, heslo zrcadla (_loadingMotto); čtení i runa
//                                                                         dne. Pravidlo E. (2026-11-16: runa dne dostala nápis v .note — hlášení 64005ae3)
// přehrávač         .svp .svp-nota .svp-cas .svp-svicka .svp-svisla (.hraje)  JEDINÝ přehrávač hlasu (runar-svicka.js, owner 2026-10-29): nota ·
//                   .svp-lesk .svp-vosk .svp-plamen .svp-jadro .svp-jiskra   čas · svíčka (= posuvník) · délka; .svp-svisla = svíčka v okraji
//                   .svp-kour .svp-telo                                   papíru (bez času); části kresby svíčky; .hraje = nota se houpe
//
// VLASTNÍ (třída mimo komponenty, s důvodem):
// VLASTNÍ .xp-plus — sám je komponenta rozbalovače (span tam, kde text plní JS a ::after nejde)
// VLASTNÍ .pero-let — animované pero v deníku (owner 2026-10-20 „3 pero“), jediný prvek, který letí přes stránku; žádná komponenta to nedělá
// VLASTNÍ .toast-klik — modifikátor toastu: výzva k obnovení na novou verzi zůstane a dá se klepnout (2026-10-22, DECISIONS 2026-10-22 (8))
// VLASTNÍ .topbar-tuzka .tz-cara .tz-pero — tužka u jména v liště: jen při otevřené nabídce, „podepíše“ dvě písmena (owner 2026-10-28)
// VLASTNÍ .pocet-cteni .rozzar — počet čtení v kolečku za jménem; po dobití se rozzáří a doběhne (owner 2026-10-28, hlášení 85d5ea31)
// VLASTNÍ .myslenka-pero — pírko Huginna před myšlenkou na konci čtení a v deníku (owner 2026-10-30), jediná kresba myšlenky
// VLASTNÍ .kad-zhava .kad-dym .kad-d1 .kad-d2 .kad-d3 .kad-hori — kadidlo u BEFORE WE BEGIN a jeho kouř (owner 2026-10-30), jediná ikona, která kouří
// VLASTNÍ .rod — runa dne (2026-11-15): jen rozvržení obalu pod nápisem RÚNAR a stavu v okně; uvnitř stávající komponenty
// VLASTNÍ .nad — stav proužku #hero-down-mimo v ostatních záložkách: výška 0, leží přes obsah, ať jeho objevení po sjetí nic neposune (2026-11-03, be8d2237)
//
// PRAVIDLA, KTERÁ KONTROLA HLÍDÁ:
//   A) každá třída z tabulky v runar-reader.css existuje (soupis nehnije)
//   B) nová třída (mimo základ scripts/komponenty_zaklad.json z 2026-10-20) je v tabulce nebo VLASTNÍ s důvodem
//   C) zaoblení jen 0 nebo 50 % (kruh) — nic jiného v appce zaoblené není
//   D) barva natvrdo (#…) mimo :root jen ta, která tu byla 2026-10-20; nová = token v :root
//   E) nápis čekání t('reading_loading') v JS readeru jen v komponentě čekání (.whispers-loading-label, #reading-loading-txt);
//      jinde jen s výjimkou v CEKANI_VYJIMKY (soubor + kus řádku + důvod). Proč: komponentu, kterou soupis neměl, jsem 2026-11-15 nenašel
//      a nápis dal do .note — bez pulzu, mimo střed (hlášení 64005ae3). Neumí: jiné čekání bez tohoto nápisu.
// Co NEhlídá: velikosti písma a průhlednosti zlaté (25 variant, srovnání čeká — RUNAR_BACKLOG), inline styly v HTML a JS.
//
//   node scripts/verify_komponenty.js          kontrola
//   node scripts/verify_komponenty.js --test   samotest (podstrčené vady musí spadnout)
//   node scripts/verify_komponenty.js --zaklad vypíše dnešní třídy a barvy (jen při vědomé obnově základu)
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const CSS = path.join(ROOT, 'v2', 'runar-reader.css');
const ZAKLAD = path.join(__dirname, 'komponenty_zaklad.json');
const JS_READERU = ['runar-utils.js', 'runar-journal.js', 'runar-tree.js', 'runar-auth.js', 'runar-reading.js', 'runar-app.js',
  'runar-reporter.js', 'runar-rune-popup.js', 'runar-helper.js', 'runar-runa-dne.js'];
const CEKANI_OK = /whispers-loading-label|[Rr]dLoadTxt|reading-loading-txt/;
// Pravidlo E — výjimky jen s důvodem. Strom má vlastní čekání (.tree-loading-glyph/-text, CODE-tree); sjednocení = RUNAR_BACKLOG.
const CEKANI_VYJIMKY = [
  ['runar-tree.js', "getElementById('tree-loading-text')", 'čekání stromu (CODE-tree), vlastní podoba — sjednocení v RUNAR_BACKLOG (2026-11-16)'],
  ['runar-tree.js', 'loadTxt.textContent', 'čekání stromu (CODE-tree), vlastní podoba — sjednocení v RUNAR_BACKLOG (2026-11-16)'],
  ['runar-tree.js', 'btn.textContent', 'nápis v tlačítku při čtení životní runy (CODE-tree) — sjednocení v RUNAR_BACKLOG (2026-11-16)'],
];
function zkontrolujCekani(soubory) {   // soubory: [[jméno, zdroj]]
  const vady = [];
  for (const [jm, src] of soubory) src.split(/\r?\n/).forEach((r, i) => {
    if (!/t\(\s*['"]reading_loading['"]\s*\)/.test(r) || /^\s*\/\//.test(r)) return;
    if (CEKANI_OK.test(r)) return;
    if (CEKANI_VYJIMKY.some(([f, kus]) => f === jm && r.includes(kus))) return;
    vady.push('E) ' + jm + ':' + (i + 1) + ' nápis čekání mimo komponentu čekání — použij .whispers-loading-inner/-star/-label (+ .reading-loading-motto): '
      + r.trim().slice(0, 100));
  });
  return vady;
}

function soupis() {
  const radky = [];
  for (const l of fs.readFileSync(__filename, 'utf8').split('\n')) { if (/^\s*\/\//.test(l)) radky.push(l); else if (radky.length) break; }
  const komp = new Set(), vlastni = new Map();
  let vTabulce = false;
  for (const l of radky) {
    if (/KOMPONENTA\s+TŘÍDY/.test(l)) { vTabulce = true; continue; }
    if (/PRAVIDLA, KTERÁ KONTROLA HLÍDÁ/.test(l)) vTabulce = false;
    const v = l.match(/VLASTNÍ\s+\.([\w-]+)\s+—\s*(.*)$/);
    if (v) { vlastni.set(v[1], v[2].trim()); continue; }
    if (vTabulce) for (const m of l.replace(/^\s*\/\//, '').matchAll(/\.([a-zA-Z_][\w-]*)/g)) if (!/^js$/.test(m[1])) komp.add(m[1]);
  }
  return { komp, vlastni };
}

function rozeber(css) {
  const bez = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const tridy = new Set();
  for (const m of bez.matchAll(/([^{}]+)\{/g)) {
    if (/^\s*@/.test(m[1])) continue;
    for (const c of m[1].matchAll(/\.([a-zA-Z_][\w-]*)/g)) if (!/^\d/.test(c[1])) tridy.add(c[1]);
  }
  const root = (bez.match(/:root\s*\{[^}]*\}/) || [''])[0];
  const mimo = bez.replace(root, '');
  const barvy = new Set();
  for (const m of mimo.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) barvy.add(m[0].toLowerCase());
  const zaobleni = [];
  bez.split('\n').forEach((l, i) => {
    for (const m of l.matchAll(/border-radius\s*:\s*([^;}]+)/g)) {
      const v = m[1].trim();
      if (!/^(0|0px|50%)$/.test(v)) zaobleni.push('ř. ' + (i + 1) + ': border-radius:' + v);
    }
  });
  return { tridy, barvy, zaobleni };
}

function zkontroluj(css, zaklad, sp) {
  const { tridy, barvy, zaobleni } = rozeber(css);
  const vady = [];
  for (const k of sp.komp) if (!tridy.has(k)) vady.push('A) třída ze soupisu v CSS není: .' + k + ' — oprav soupis v hlavičce verify_komponenty.js');
  for (const [k, d] of sp.vlastni) if (!d) vady.push('B) VLASTNÍ .' + k + ' bez důvodu');
  const zt = new Set(zaklad.tridy);
  for (const t of tridy) if (!zt.has(t) && !sp.komp.has(t) && !sp.vlastni.has(t))
    vady.push('B) nová třída .' + t + ' nepoužívá komponentu ze soupisu — použij komponentu, nebo ji zapiš jako „VLASTNÍ .' + t + ' — důvod“');
  for (const z of zaobleni) vady.push('C) zaoblení ' + z + ' — v appce jen 0 nebo kruh (50 %)');
  const zb = new Set(zaklad.barvy);
  for (const b of barvy) if (!zb.has(b)) vady.push('D) nová barva natvrdo ' + b + ' mimo :root — přidej token do :root (nebo použij existující)');
  return { vady, tridy, barvy };
}

const args = process.argv.slice(2);
const sp = soupis();

if (args.includes('--zaklad')) {
  const { tridy, barvy } = rozeber(fs.readFileSync(CSS, 'utf8'));
  process.stdout.write(JSON.stringify({ _proc: 'Základ pro smoke ㊋ (verify_komponenty.js): třídy a barvy natvrdo v runar-reader.css ke dni vzniku kontroly (2026-10-20). Nová třída nebo barva mimo tenhle seznam musí jít přes soupis komponent / token. Obnovuje se jen vědomě (--zaklad).', tridy: [...tridy].sort(), barvy: [...barvy].sort() }, null, 1) + '\n');
  process.exit(0);
}

if (args.includes('--test')) {
  const zaklad = { tridy: ['a', 'b'], barvy: ['#000'] };
  const s = { komp: new Set(['a']), vlastni: new Map([['v', 'důvod']]) };
  const pripady = [
    ['čisté', '.a{color:#000}.b{border-radius:0}', 0],
    ['nová třída bez soupisu', '.a{}.b{}.nova{}', 1],
    ['VLASTNÍ s důvodem projde', '.a{}.b{}.v{}', 0],
    ['zaoblení 6px', '.a{border-radius:6px}', 1],
    ['kruh projde', '.a{border-radius:50%}', 0],
    ['nová barva mimo :root', ':root{--x:#123456}.a{color:#abcdef}', 1],
    ['barva v :root projde', ':root{--x:#123456}.a{color:var(--x)}', 0],
    ['třída ze soupisu chybí', '.b{}', 1],
    ['třída jen v komentáři se nepočítá', '/* .nova{} */.a{}', 0],
  ];
  let zle = 0;
  const cekani = [
    ['nápis čekání v .note', "stav.innerHTML = '<p class=\"note\">' + escapeHtml(t('reading_loading')) + '</p>';", 1],
    ['nápis v komponentě projde', "+ '<div class=\"whispers-loading-label\">' + escapeHtml(t('reading_loading')) + '</div>'", 0],
    ['čtení (#reading-loading-txt) projde', "if (rdLoadTxt) rdLoadTxt.textContent = t('reading_loading');", 0],
    ['výjimka jen ve svém souboru', "var _tlt = document.getElementById('tree-loading-text'); _tlt.textContent = t('reading_loading');", 1, 'runar-app.js'],
    ['výjimka stromu projde', "var _tlt = document.getElementById('tree-loading-text'); _tlt.textContent = t('reading_loading');", 0, 'runar-tree.js'],
  ];
  for (const [jm, radek, ocek, soubor] of cekani) {
    const n = zkontrolujCekani([[soubor || 'runar-runa-dne.js', radek]]).length;
    if (ocek ? n === 0 : n > 0) { zle++; console.log('FAIL  samotest E „' + jm + '“: ' + n + ' vad'); }
  }
  for (const [jm, css, ocek] of pripady) {
    const n = zkontroluj(css, zaklad, s).vady.length;
    const ok = ocek ? n > 0 : n === 0;
    if (!ok) { zle++; console.log('FAIL  samotest „' + jm + '“: ' + n + ' vad'); }
  }
  if (zle) process.exit(1);
  console.log('OK    samotest soupisu komponent: ' + (pripady.length + cekani.length) + ' případů');
  process.exit(0);
}

if (!fs.existsSync(ZAKLAD)) { console.log('FAIL  chybí ' + path.relative(ROOT, ZAKLAD)); process.exit(1); }
const zaklad = JSON.parse(fs.readFileSync(ZAKLAD, 'utf8'));
const { vady, tridy } = zkontroluj(fs.readFileSync(CSS, 'utf8'), zaklad, sp);
vady.push(...zkontrolujCekani(JS_READERU.map((f) => [f, fs.readFileSync(path.join(ROOT, 'v2', f), 'utf8')])));
if (vady.length) {
  for (const v of vady) console.log('  ' + v);
  console.log('FAIL  soupis komponent: ' + vady.length + ' vad v v2/runar-reader.css (soupis: hlavička scripts/verify_komponenty.js)');
  process.exit(1);
}
console.log('OK    soupis komponent: ' + sp.komp.size + ' tříd ze soupisu v CSS existuje, ' + tridy.size + ' tříd v CSS bez nové mimo soupis, zaoblení 0/kruh, barvy natvrdo jen ze základu');
