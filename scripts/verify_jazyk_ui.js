// ㉹ JAZYK KOMUNIKACE: všechno, co vidí kdokoli kromě ownera a Claude, je v ISLANDŠTINĚ a ANGLIČTINĚ (2026-10-10).
//
// PROČ: KUKY 2026-10-10: „komunikace všude veřejně a pro adminy bude IS a EN. Jen já a ty komunikujeme česky. Štítky musí být EN,
// jelikož to je náš společný jazyk se Sigrún. Zapiš, vytvoř kontrolu, cokoliv, ale tohle už nechci řešit.“ (CLAUDE.md §31.)
// Pravidlo, které musí hlídat člověk, dřív nebo později spadne na ownera (§30) → kontrola. Při zavedení našla češtinu, kterou
// dostával i model (kořen jména Óðinn „zuřivost, básnické vytržení“ v promptu rozboru jména, runar-names.js pole root),
// a admin záložky shrine (prohlížeč čtení, VOICE) psané celé česky.
//
// CO SE TU TVRDÍ: v textech, které uvidí uživatel, admin nebo model, není čeština. Pozná se třemi síty:
//   1. písmena, která islandština ani angličtina nemají: ě š č ř ž ů ť ď ň (Á É Í Ó Ú Ý mají obě řeči — nepočítají se);
//   2. česká slova bez těch písmen (CZ_SLOVA níž — „Obnovit“, „Obraz“, „podle“…);
//   3. aspoň dvě různá česká krátká slova (je, se, na, pro…) v jednom řetězci;
//   4. osamocená česká předložka jako spojka řetězců (n + ' z ' + m = „2 z 4“).
// V řetězci s HTML se dívá jen na to, co je vidět (text a atributy title/placeholder/alt/aria-label/value) — jméno třídy
// „rd-obraz“ je kód, ne řeč.
// KDE (jen soubory v gitu — co v gitu není, není v produkci): hodnoty UI_TEXT · stránky v2/*.html (text, atributy, inline
//   skripty) · JS, které ty stránky načítají, a v2/*.js · edge funkce supabase/functions/**/*.ts · šablony e-mailů
//   supabase/templates/*.html.
// VÝJIMKY: v runar-names.js hodnoty klíčů `name:` (jméno člověka, třeba Zdeněk — data, ne řeč) a `note:` (interní poznámka,
//   nezobrazuje se, do promptu nejde) · přesné hodnoty ve VYJIMKY_HODNOTY, každá s důvodem a datem; výjimka, jejíž hodnota už
//   v kódu není, shodí kontrolu, ať se smaže. Komentáře v kódu, docs, commity, paměť, skripty v scripts/ a laby (tree-lab-*)
//   jsou komunikace owner ↔ Claude → česky smí (§31).
// NETVRDÍ: že text dává smysl nebo je gramaticky správně (na to check-is, korpus) · že najde KAŽDOU češtinu — věta bez háčků,
//   bez slova ze seznamu a s jediným krátkým slovem projde (při zavedení to byly „HLAS“ a „S poznámkou“, našel je až lidský
//   průchod). Když se to stane, slovo patří do CZ_SLOVA — tak se síto zahušťuje. Nic o Gmailu (štítky jsou mimo repo —
//   memory schranka-runar-gmail) ani o datech v databázi (staré štítky verzí u uložených čtení zůstávají).
//
//   node scripts/verify_jazyk_ui.js           · node scripts/verify_jazyk_ui.js --test (kontrola sama sebe)
const fs = require('fs'), vm = require('vm'), cp = require('child_process');
const ROOT = 'C:/Users/zkuku/Downloads/Runar-admin/';
const CZ = /[ěščřžůťďňĚŠČŘŽŮŤĎŇ]/;
// Česká slova bez písmen z CZ. NEPATŘÍ sem slova, která má i angličtina nebo islandština („model“, „limit“, „evidence“), ani
// „ve“ (anglické „you've“ se rozpadne na „you“ + „ve“). Seznam vznikl z češtiny, kterou kontrola při zavedení minula.
const CZ_SLOVA = ['obraz', 'obrazy', 'obrazu', 'význam', 'významy', 'naposled', 'chyba', 'chyby', 'stav', 'stavu', 'zvolen', 'zvolil',
  'nebyl', 'nebyla', 'nebylo', 'poznámka', 'poznámky', 'poznámkou', 'poznámek', 'hledat', 'hledání', 'oblast', 'oblasti', 'modely',
  'úhel', 'úhly', 'esence', 'podoba', 'kolikrát', 'runy', 'hlas', 'hlasu', 'obnovit', 'obnoví', 'obnovení', 'smazat', 'odeslat',
  'upravit', 'zobrazit', 'skrýt', 'další', 'zatím', 'není', 'jsou', 'podle', 'nebo', 'které', 'který', 'která', 'jako', 'také',
  'tady', 'mezi', 'zde', 'kdy', 'kdo', 'dnes', 'tarif', 'hotovo', 'vybrat', 'vyber', 'zadej', 'zadejte', 'klikni', 'nový', 'nová',
  'nové', 'starý', 'stará', 'staré', 'prázdná', 'prázdné', 'vlastní', 'rámec', 'bez', 'ze', 'nalezeno', 'nenalezeno', 'snímek',
  'snímky', 'skupina', 'skupiny', 'období',
  // čeština bez diakritiky (2026-10-10: „ulozit se nepodarilo“ v konzoli stromu prošlo všemi síty). Ne „vyznam“ ani „cteni“ —
  // ty slouží i jako klíče v kódu (sáček _seasonBagPick('vyznam', …)).
  'ulozit', 'ulozeno', 'nepodarilo', 'podarilo', 'vratil', 'vratila', 'nacitam', 'vsechny', 'zadne', 'zadny', 'kdyz', 'jeste',
  'nelze', 'selhalo', 'chybi'];
const SLOVO = new RegExp('(?<!\\p{L})(' + CZ_SLOVA.join('|') + ')(?!\\p{L})', 'iu');
const KRATKA = ['je', 'se', 'na', 'pro', 'od', 'po', 'za', 'aby', 'jak', 'jsem', 'jsi', 'ani', 'tak'];
const PRED_REGEXEM = /[(,=:[!&|?{};+\-*%<>~^]$/;
const KLICOVA = /\b(return|typeof|case|in|of|delete|void|throw|new|else)$/;
// Přesné hodnoty, které kontrola pouští — každá s datem a důvodem (§28).
const VYJIMKY_HODNOTY = {
  'v5.08-bez-elementu': '2026-10-10 štítek verze promptu, s nímž se od rána ukládají čtení; přejmenovat = rozdělit čtení téže verze '
    + 'na dvě skupiny. Další verze už anglicky (§31) — s ní tahle výjimka zmizí.',
};
const VYJIMKY = { 'v2/runar-names.js': ['name', 'note'] };

// Vrátí kousek textu kolem první češtiny, nebo '' když žádnou nenajde.
function cesky(t) {
  let i = t.search(CZ);
  if (i < 0) { const m = SLOVO.exec(t); if (m) i = m.index; }
  if (i < 0) {
    const slova = new Set(t.toLowerCase().split(/[^\p{L}]+/u));
    const k = KRATKA.filter((w) => slova.has(w));
    if (k.length >= 2) i = t.toLowerCase().search(new RegExp('(?<!\\p{L})' + k[0] + '(?!\\p{L})', 'u'));
  }
  // 4. síto: osamocená česká předložka jako spojka (n + ' z ' + m → „2 z 4“) — minula ji první tři síta, chytil smoke ㉵.
  if (i < 0 && /^\s+(z|s|k|u|ze)\s+$/i.test(t)) i = t.search(/\S/);
  return i < 0 ? '' : t.slice(Math.max(0, i - 30), i + 40).replace(/\s+/g, ' ').trim();
}
// Z řetězce s HTML jen to, co je vidět: text mezi značkami + atributy, které uživatel uvidí nebo uslyší. Řetězec v JS bývá kus
// HTML (začne nebo skončí uprostřed značky) — i ty kusy se ořežou. Bez toho hlásil „rd-obraz“ (jméno CSS třídy) jako češtinu.
function viditelne(s) {
  if (!/[<>]/.test(s)) return s;
  const out = [];
  const re = /\b(placeholder|title|aria-label|alt|value)\s*=\s*("([^"]*)"|'([^']*)')/gi;
  let m;
  while ((m = re.exec(s))) out.push(m[3] !== undefined ? m[3] : m[4]);
  out.push(s.replace(/<[^<>]*>/g, ' ').replace(/<[a-zA-Z/!][^<>]*$/, ' ').replace(/^[^<>]*>/, ' '));
  return out.join(' | ');
}
const najdi = (s) => cesky(viditelne(s));

// Řetězcové literály z JS/TS bez komentářů. Malý tokenizér: řetězce ' " `, komentáře // a /* */, regulární výrazy (heuristika:
// „/“ po operátoru, závorce, čárce nebo klíčovém slově = regex). Bez rozpoznání regexů otevřela uvozovka uvnitř (/[\u201d"]/)
// falešný řetězec, který spolkl české komentáře — při zavedení 40 falešných nálezů z 60.
// `vynech` = klíče, jejichž hodnota se nekontroluje (jen pro soubory ve VYJIMKY).
function retezce(src, vynech) {
  const out = [];
  const reVynech = (vynech && vynech.length) ? new RegExp('\\b(' + vynech.join('|') + ')\\s*:\\s*$') : null;
  let i = 0;
  const n = src.length;
  while (i < n) {
    const ch = src[i], nx = src[i + 1];
    if (ch === '/' && nx === '/') { while (i < n && src[i] !== '\n') i++; continue; }
    if (ch === '/' && nx === '*') { const k = src.indexOf('*/', i + 2); if (k < 0) break; i = k + 2; continue; }
    if (ch === '/') {
      const pred = src.slice(Math.max(0, i - 12), i).replace(/\s+$/, '');
      if (!pred || PRED_REGEXEM.test(pred) || KLICOVA.test(pred)) {
        let j = i + 1, trida = false;
        while (j < n && src[j] !== '\n') {
          if (src[j] === '\\') { j += 2; continue; }
          if (src[j] === '[') trida = true;
          else if (src[j] === ']') trida = false;
          else if (src[j] === '/' && !trida) break;
          j++;
        }
        i = j + 1;
        while (i < n && /[a-z]/i.test(src[i])) i++;
        continue;
      }
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      const q = ch;
      let j = i + 1, s = '';
      while (j < n && src[j] !== q) {
        if (src[j] === '\\') { s += src[j] + (src[j + 1] || ''); j += 2; continue; }
        s += src[j]; j++;
      }
      const radek = src.slice(0, i).split('\n').length;
      if (!(reVynech && reVynech.test(src.slice(Math.max(0, i - 16), i)))) out.push({ s: s, radek: radek });
      i = j + 1;
      continue;
    }
    i++;
  }
  return out;
}
// Viditelný text HTML po textových uzlech (bez <!-- -->, <script>, <style>) plus hodnoty atributů, které uživatel uvidí nebo uslyší.
function htmlText(src) {
  const bez = src.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<script\b[\s\S]*?<\/script>/gi, ' ').replace(/<style\b[\s\S]*?<\/style>/gi, ' ');
  const out = [];
  const atr = /\b(placeholder|title|aria-label|alt|value)\s*=\s*("([^"]*)"|'([^']*)')/gi;
  let m;
  while ((m = atr.exec(bez))) out.push(m[3] !== undefined ? m[3] : m[4]);
  bez.split(/<[^>]+>/).forEach((t) => { if (t.trim()) out.push(t); });
  return out;
}
function skriptyVHtml(src) {   // inline <script> v HTML stránkách — řetězce v nich jsou text pro uživatele (help, privacy, shrine)
  const out = [];
  const re = /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(src))) out.push(m[1]);
  return out.join('\n');
}
// Výjimky, jejichž hodnota se při průchodu nepotkala — ty jsou mrtvé a musí pryč (jinak by tiše pustily češtinu, až se vrátí).
const mrtveVyjimky = (potkane) => Object.keys(VYJIMKY_HODNOTY).filter((v) => !potkane.has(v));

if (process.argv.includes('--test')) {
  // Životní cyklus (memory guard-test-the-lifecycle): čeština s háčky i bez nich chycena · v komentáři ne · v regexu s uvozovkou
  // ne · islandština a angličtina ne (ani „you've“ a „pro“) · HTML komentář ne · atribut a text tlačítka ano · jméno CSS třídy
  // ne, title ano · výjimky name:/note: ne · výjimka hodnoty: potkaná žije, nepotkaná je mrtvá.
  const pocet = (src, v) => retezce(src, v).filter((x) => najdi(x.s)).length;
  const t = [
    pocet("var a = 'Uloženo'; // čeština v komentáři\n/* také ř */ var b = 'Þú ert Gestur';") === 1,
    pocet("if (/[\\u201d\"]$/.test(t)) return t;\n// komentář s „uvozovkou\" a češtinou ř\nvar x = 'ok';") === 0,
    pocet("x = `Hver rúna — síðasta`;") === 0,
    pocet("{ name: 'Zdeněk', note: 'ověřit', root: 'slov. (ze Zdislav)' }", ['name', 'note']) === 1,
    pocet("var r = a / b; var s = 'čeština';") === 1,
    pocet("c = n + ' z ' + m; d = x + ' a ' + y;") === 1,
    pocet("x = '<div class=\"rd-obraz\" title=\"' + t + '\">';") === 0,
    pocet("x = '<span class=\"rd-tag\" title=\"obraz zvolen\">📌</span>';") === 1,
    htmlText('<p>Rúnar les í rúnirnar</p><!-- Uloženo --><input placeholder="Načíst"><button>Obnovit</button>').filter(cesky).length === 2,
    ['Hledat v textu', 'Podle skupiny', 'Obraz (Fehu)', '🔊 HLAS — ELEVENLABS', '💬 S poznámkou', 'text vratil, ale ulozit se nepodarilo'].every((x) => cesky(x)),
    ["You've got a pro plan on the way", 'Þú ert á réttri leið og hún er þín', 'Refresh', 'All runes (last 100)'].every((x) => !cesky(x)),
    mrtveVyjimky(new Set(Object.keys(VYJIMKY_HODNOTY))).length === 0 && mrtveVyjimky(new Set()).length === Object.keys(VYJIMKY_HODNOTY).length,
  ];
  const ok = t.every(Boolean);
  console.log(ok ? 'OK    samotest: čeština s háčky i bez chycena; komentář, regex, CSS třída, islandština, angličtina a výjimky ne'
                 : 'FAIL  samotest (' + t.map((x) => (x ? '✓' : '✗')).join('') + ')');
  process.exit(ok ? 0 : 1);
}

const git = cp.execSync('git -C "' + ROOT + '" ls-files', { encoding: 'utf8' }).split('\n').filter(Boolean);
const nalezy = [];
const potkane = new Set();
const zkus = (s, kde) => {
  if (Object.prototype.hasOwnProperty.call(VYJIMKY_HODNOTY, s)) { potkane.add(s); return; }
  const u = najdi(s);
  if (u) nalezy.push(kde + ' „' + u + '“');
};
// 1) UI_TEXT
{
  const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
  S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
  S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
  vm.createContext(S);
  for (const f of ['runar-config.js', 'runar-translations.js']) vm.runInContext(fs.readFileSync(ROOT + 'v2/' + f, 'utf8') + '\n;\n', S);
  const projdi = (o, cesta) => {
    if (typeof o === 'string') { zkus(o, 'UI_TEXT' + cesta); return; }
    if (o && typeof o === 'object') for (const k of Object.keys(o)) projdi(o[k], cesta + '.' + k);
  };
  projdi(vm.runInContext('UI_TEXT', S), '');
}
// 2) stránky v2/ (text + atributy + inline skripty); zároveň sběr JS, které načítají
const js = new Set(git.filter((p) => /^v2\/[^/]+\.js$/.test(p)));
for (const p of git.filter((x) => /^v2\/[^/]+\.html$/.test(x))) {
  const src = fs.readFileSync(ROOT + p, 'utf8');
  htmlText(src).forEach((t) => zkus(t, p + ' (text)'));
  retezce(skriptyVHtml(src)).forEach((x) => zkus(x.s, p + ' (skript)'));
  const re = /<script\b[^>]*\bsrc="([^"]+)"/gi;
  let m;
  while ((m = re.exec(src))) { const q = 'v2/' + m[1].split('?')[0]; if (!/^https?:/.test(m[1]) && git.includes(q)) js.add(q); }
}
// 3) JS a edge funkce
for (const p of [...js, ...git.filter((x) => /^supabase\/functions\/.+\.ts$/.test(x))]) {
  retezce(fs.readFileSync(ROOT + p, 'utf8'), VYJIMKY[p]).forEach((x) => zkus(x.s, p + ':' + x.radek));
}
// 4) šablony e-mailů
for (const p of git.filter((x) => /^supabase\/templates\/[^/]+\.html$/.test(x))) {
  htmlText(fs.readFileSync(ROOT + p, 'utf8')).forEach((t) => zkus(t, p));
}

const mrtve = mrtveVyjimky(potkane);
if (nalezy.length || mrtve.length) {
  if (nalezy.length) {
    console.log('FAIL  čeština v textu pro uživatele, admina nebo model (' + nalezy.length + '×) — veřejně i pro adminy jen IS a EN (CLAUDE.md §31):');
    nalezy.slice(0, 80).forEach((x) => console.log('        ' + x));
  }
  if (mrtve.length) console.log('FAIL  mrtvá výjimka (hodnota už v kódu není) — smaž ji z VYJIMKY_HODNOTY: ' + mrtve.join(', '));
  process.exit(1);
}
console.log('OK    jazyk komunikace: v UI_TEXT, stránkách v2/, jejich JS, edge funkcích ani e-mailech není čeština (jen IS a EN)');
