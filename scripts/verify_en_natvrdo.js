// verify_en_natvrdo.js — smoke ㊾: anglický text natvrdo v JS readeru, který jde do stránky (CODE-tune 2026-10-11).
//
// Proč: okno „SPEAK AGAIN IN …?“ (runar-app.js) a hláška „Voice error: …“ (runar-reading.js) psaly anglicky i islandskému uživateli —
// texty stály v JS natvrdo, mimo UI_TEXT (§2, §10, §31). Kontroly je propustily: ㉹ hledá češtinu, ㉸ jen větvení `lang === 'is' ?`,
// anglický text v šabloně neviděla žádná (procházka CODE-read 2026-10-11, návrh „kontrola: anglická věta v JS mimo UI_TEXT“).
// Co dělá: v JS readeru najde řádek, který zapisuje do stránky (textContent / innerHTML / innerText / placeholder / title, setText, setSt,
// showToast, setRuneText, alert, confirm), a v jeho řetězci — i na dalším řádku, když příkaz pokračuje — dvě anglická slova za sebou,
// po odstranění ${…}, HTML značek a entit. Takový text patří do UI_TEXT (t / tp). RÁČNA: VYJIMKY jsou prázdné, nová jen s důvodem.
// Neumí: text složený do proměnné a zapsaný jinde (const msg = 'Some text'; … el.textContent = msg). Prompty a data (runar-character.js,
// config, runy) nehlídá — tam angličtina patří; shrine taky ne (§31: pro adminy anglicky).
//   node scripts/verify_en_natvrdo.js [--test]
'use strict';
const fs = require('fs'), path = require('path');
const V2 = path.resolve(process.env.RUNAR_ROOT || path.join(__dirname, '..'), 'v2');
const JS_READERU = ['runar-utils.js', 'runar-journal.js', 'runar-tree.js', 'runar-auth.js', 'runar-reading.js', 'runar-app.js',
  'runar-reporter.js', 'runar-rune-popup.js', 'runar-helper.js'];
const VYJIMKY = new Set([]);   // 'soubor:text řádku' — jen s důvodem a datem v komentáři
const DOM = /(\.textContent\s*=|\.innerHTML\s*\+?=|\.innerText\s*=|\.placeholder\s*=|\.title\s*=|\bsetText\s*\(|\bsetSt\s*\(|\bshowToast\s*\(|\bsetRuneText\s*\(|\balert\s*\(|\bconfirm\s*\()/;
const LIT = /(['"`])((?:\\.|(?!\1)[^\\])*)\1/g;

// Komentáře pryč (čísla řádků zůstanou); `//` za dvojtečkou nebo uvozovkou je adresa, ne komentář. Konce řádků na LF (čistá kopie má CRLF).
function radkyBezKomentaru(src) {
  return src.replace(/\r\n/g, '\n').replace(/\/\*[\s\S]*?\*\//g, (x) => x.replace(/[^\n]/g, ' '))
    .split('\n').map((r) => r.replace(/(^|[^:'"\\])\/\/.*$/, '$1'));
}
function kontrola(src, soubor) {
  const radky = radkyBezKomentaru(src), chyby = [];
  radky.forEach((r, i) => {
    if (!DOM.test(r)) return;
    const txt = /[=(+,]\s*$/.test(r) && radky[i + 1] !== undefined ? r + ' ' + radky[i + 1] : r;   // příkaz pokračuje na dalším řádku
    let m; LIT.lastIndex = 0;
    while ((m = LIT.exec(txt))) {
      const s = m[2].replace(/\$\{[^}]*\}/g, ' ').replace(/<\/?[a-z][^>]*(>|$)/gi, ' ').replace(/&[a-z]+;/gi, ' ');
      if (/\b[A-Za-z]{2,}\s+[A-Za-z]{2,}\b/.test(s)) {
        const klic = soubor + ':' + r.trim();
        if (!VYJIMKY.has(klic)) chyby.push(soubor + ':' + (i + 1) + '  ' + r.trim().slice(0, 120));
        break;
      }
    }
  });
  return chyby;
}

if (process.argv.includes('--test')) {
  // Životní cyklus kontroly: špatné musí padnout, dobré projít (memory guard-test-the-lifecycle).
  const P = [
    ['šablona s anglickou větou padne', kontrola("  el.textContent = `SPEAK AGAIN IN ${x}?`;", 'a.js').length === 1],
    ['hláška setSt anglicky padne', kontrola("  setSt('st-voice', `Voice error: ${err.message}`, 'err');", 'a.js').length === 1],
    ['příkaz na dvou řádcích padne', kontrola("  el.textContent =\n    'Some English text';", 'a.js').length === 1],
    ['t() projde', kontrola("  el.textContent = t('voice_btn');", 'a.js').length === 0],
    ['id prvku projde', kontrola("  setText('reader-disclaimer', t('disclaimer'));", 'a.js').length === 0],
    ['kus HTML značky s atributy projde', kontrola("  gl.innerHTML = ' <span class=\"rlbl-glyph\" data-rune=\"' + r + '\">';", 'a.js').length === 0],
    ['komentář projde', kontrola("  // el.textContent = 'Some text here';", 'a.js').length === 0],
    ['konce řádků CRLF', kontrola("  el.textContent =\r\n    'Some English text';\r\n", 'a.js').length === 1],
  ];
  const zle = P.filter((p) => !p[1]);
  zle.forEach((p) => console.log('FAIL test: ' + p[0]));
  if (!zle.length) console.log('OK    test kontroly anglického textu natvrdo: ' + P.length + ' případů (zachytí i pustí)');
  process.exit(zle.length ? 1 : 0);
}

let chyby = [];
for (const f of JS_READERU) chyby = chyby.concat(kontrola(fs.readFileSync(path.join(V2, f), 'utf8'), f));
if (chyby.length) {
  chyby.forEach((c) => console.log('  ' + c));
  console.log('FAIL  anglický text natvrdo v JS readeru: ' + chyby.length + ' míst — patří do UI_TEXT (t / tp), §10');
  process.exit(1);
}
console.log('OK    anglický text natvrdo v JS readeru: žádný (' + JS_READERU.length + ' souborů; text do stránky jen z UI_TEXT)');
