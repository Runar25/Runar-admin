// ㉦ MĚSÍC NAROZENÍ PODLE STARÉHO ISLANDSKÉHO KALENDÁŘE (misseristal), ne podle gregoriánského.
//
// PROČ: do 2026-09-12 bral prompt životní runy islandský měsíc podle gregoriánského měsíce
// (červenec = Heyannir). Owner, narozen 4. 7., dostal „Heyannir" — Heyannir ale začíná nedělí
// 23.–30. 7. Tabulka navíc neměla Einmánuður ani Tvímánuður, Haustmánuður měla dvakrát, psala
// „Gói" a „Jól" (měsícem není). Detail RUNAR_DECISIONS.md 2026-09-12 (11).
//
// CO SE TU TVRDÍ: že `icelandicMonthKey` dává každému měsíci začátek ve SPRÁVNÝ den v týdnu a
// v okně, které uvádějí prameny, pro každý rok 1900–2100; a že výsledek dojde až do promptu.
// Okna = Almanak Háskóla Íslands (almanak.hi.is/rim.html), shodně Vísindavefur + is.wikipedia a
// Janson / en.wikipedia; osmý den okna = rímspillisár. Haustmánuður: Vísindavefur 1132 uvádí
// 20.–26. 9., ale Almanak, is.wikipedia i Vísindavefur 83139 21.–27. (28.) — bere se Almanak.
// NETVRDÍ SE: nic o kalendáři před rokem 1700 (juliánská podoba) ani o starším počítání zimy
// od pátku (16. st.–1837).
//
//   node scripts/verify_icelandic_calendar.js
const fs = require('fs'), vm = require('vm');
const D = 'C:/Users/zkuku/Downloads/Runar-admin/v2/';
const S = { console: { log() {}, warn() {}, error() {} }, Math, JSON, Date,
  document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {} },
  localStorage: { getItem: () => null, setItem() {} }, navigator: {}, setTimeout: () => 0 };
S.window = S; S.self = S; S.globalThis = S; vm.createContext(S);
let c = '';
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-character.js', 'runar-utils.js'])
  c += fs.readFileSync(D + f, 'utf8') + '\n;\n';
c += 'var lang="en";';
vm.runInContext(c, S);
const fn = (n) => vm.runInContext(n, S);

let fail = 0;
const rekni = (ok, popis) => { if (ok) console.log('  ✓ ' + popis); else { fail++; console.log('  ✗ ' + popis); } };

const key = fn('icelandicMonthKey');
const BM = fn('BIRTH_MONTHS');

// Pravidla z pramenů: den v týdnu (0 = neděle) + okno [měsíc, od, do].
const PRAVIDLA = {
  harpa:        [4, 4, 19, 25], skerpla:    [6, 5, 19, 25], solmanudur: [1, 6, 18, 24],
  aukanaetur:   [3, 7, 18, 24], heyannir:   [0, 7, 23, 30], tvimanudur: [2, 8, 22, 29],
  haustmanudur: [4, 9, 21, 28], gormanudur: [6, 10, 21, 28], ylir:      [1, 11, 20, 27],
  morsugur:     [3, 12, 20, 27], thorri:    [5, 1, 19, 26], goa:        [0, 2, 18, 25],
  einmanudur:   [2, 3, 20, 26],
};

// 1) Každý měsíc každého roku začíná podle pravidla. Začátek = den, kdy se klíč změnil.
{
  const chyby = [];
  let zacatku = 0;
  const pocty = {};
  for (let y = 1900; y <= 2100; y++) {
    let prev = null;
    for (let t = Date.UTC(y, 0, 1); t < Date.UTC(y + 1, 0, 1); t += 864e5) {
      const dt = new Date(t);
      const k = key(dt.getUTCDate(), dt.getUTCMonth() + 1, dt.getUTCFullYear());
      if (k !== prev && prev !== null) {
        zacatku++;
        pocty[k] = (pocty[k] || 0) + 1;
        const p = PRAVIDLA[k];
        const ok = p && dt.getUTCDay() === p[0] && dt.getUTCMonth() + 1 === p[1] && dt.getUTCDate() >= p[2] && dt.getUTCDate() <= p[3];
        if (!ok && chyby.length < 5) chyby.push(k + ' ' + dt.toISOString().slice(0, 10) + ' (den ' + dt.getUTCDay() + ')');
        if (!ok) chyby.total = (chyby.total || 0) + 1;
      }
      prev = k;
    }
  }
  rekni(!chyby.length, '1900–2100: ' + zacatku + ' začátků měsíců, každý ve svůj den v týdnu a v okně podle pramenů'
        + (chyby.length ? ' — MIMO (' + chyby.total + '): ' + chyby.join(', ') : ''));
  const chybi = Object.keys(PRAVIDLA).filter((k) => !pocty[k]);
  rekni(!chybi.length, 'všech 12 měsíců + aukanætur se v kalendáři skutečně objeví' + (chybi.length ? ' — CHYBÍ: ' + chybi.join(', ') : ''));
}

// 2) Délky: měsíc 30 dní, aukanætur 4 nebo 11 (se sumarauki). Kontrola na jednom roce s aukanætur
//    4 a jednom s 11 by nestačila — bere se celé období.
{
  // Souvislý průchod dnů; první a poslední úsek jsou useknuté, ty se nepočítají.
  const useky = [];
  let prev = null, n = 0;
  for (let t = Date.UTC(1900, 0, 1); t < Date.UTC(2101, 0, 1); t += 864e5) {
    const dt = new Date(t);
    const k = key(dt.getUTCDate(), dt.getUTCMonth() + 1, dt.getUTCFullYear());
    if (k !== prev) { if (prev !== null) useky.push([prev, n]); prev = k; n = 0; }
    n++;
  }
  const delky = {};
  useky.slice(1).forEach(([k, len]) => { (delky[k] = delky[k] || new Set()).add(len); });
  const spatne = Object.keys(delky).filter((k) => k === 'aukanaetur'
    ? [...delky[k]].some((n) => n !== 4 && n !== 11)
    : [...delky[k]].some((n) => n !== 30));
  rekni(!spatne.length, 'měsíce mají 30 dní, aukanætur 4 nebo 11' + (spatne.length ? ' — ŠPATNĚ: ' + spatne.map((k) => k + '=' + [...delky[k]].join('/')).join(', ') : ''));
}

// 3) Hranice kolem kotvy a ownerův případ.
rekni(key(23, 4, 2026) === 'harpa' && key(22, 4, 2026) === 'einmanudur', 'Sumardagurinn fyrsti 2026 (23. 4.) = 1. den hörpu, den předtím einmánuður');
rekni(key(24, 10, 2026) === 'gormanudur' && key(23, 10, 2026) === 'haustmanudur', 'Fyrsti vetrardagur 2026 (24. 10.) = 1. den gormánuður');
rekni(key(4, 7, 1985) === 'solmanudur', '4. 7. 1985 (owner) = sólmánuður, ne heyannir');
rekni(key(1, 1, 2000) === 'morsugur' && key(31, 12, 1999) === 'morsugur', 'přelom roku leží uvnitř mörsugur');
rekni(key(undefined, 7, 1985) === null && key(NaN, NaN, NaN) === null, 'neplatné datum → null (ne aukanætur)');

// 4) Data tabulky: každý klíč má jméno i obě řeči; žádné „Jól", žádné „Gói".
{
  const klice = Object.keys(PRAVIDLA);
  const neuplne = klice.filter((k) => !BM[k] || !BM[k].name || !BM[k].is || !BM[k].en);
  rekni(!neuplne.length, 'každý měsíc má v BIRTH_MONTHS jméno + IS + EN' + (neuplne.length ? ' — NEÚPLNÉ: ' + neuplne.join(', ') : ''));
  const jmena = Object.keys(BM).map((k) => BM[k].name);
  rekni(jmena.indexOf('Jól') === -1 && jmena.indexOf('Gói') === -1 && jmena.indexOf('Góa') !== -1, 'žádné „Jól" (není měsíc), „Góa" místo staršího „Gói"');
  rekni(Object.keys(BM).length === klice.length, 'tabulka nemá klíč navíc (' + Object.keys(BM).length + ')');
}

// 5) Výsledek dojde až do promptu — produkční builder, obě řeči.
{
  const RUNES = fn('RUNES');
  const gebo = RUNES.find((r) => r.n === 'Gebo');
  const en = fn('buildLifeRunePrompt')('Thor', gebo, 4, 7, 1985, 'en', false, null);
  const is = fn('buildLifeRunePrompt')('Thor', gebo, 4, 7, 1985, 'is', false, null);
  rekni(/ICELANDIC MONTH: Sólmánuður — /.test(en) && en.indexOf('Heyannir') === -1, 'EN prompt: „ICELANDIC MONTH: Sólmánuður", Heyannir nikde');
  // 2026-09-27: část 1 stojí na půlměsíci runy, islandský měsíc je v ní kontext v ZÁVORCE, malým písmenem (DECISIONS 2026-09-27 (7)).
  rekni(/ÍSLENSKUR MÁNUÐUR: Sólmánuður — /.test(is) && is.indexOf('(sólmánuður)') !== -1, 'IS prompt: měsíc v řádku i ve větě („(sólmánuður)")');
  // Množné jméno měsíce: dřív „Hvað ber Heyannir" (sloveso v jednotném čísle). Teď v závorce, s ničím se neshoduje.
  const hey = fn('buildLifeRunePrompt')('Thor', gebo, 1, 8, 1985, 'is', false, null);
  rekni(hey.indexOf('(heyannir)') !== -1 && !/Hvað ber heyannir/i.test(hey) && !/Hvað ber sólmánuður/i.test(is),
        'IS prompt: jméno měsíce není podmět („Hvað ber Heyannir" nesedělo číslem)');
  // 2026: léto 23. 4. → aukanætur 22.–25. 7. (středa), heyannir od neděle 26. 7. — kalendář s rokem dál platí (key).
  // 2026-10-09: prompt rok NEČTE (rok se nezadává, report 58a0c728). 23. 7. bez roku = jediný den, který může padnout do tří
  // období — prompt je musí nést všechny, v pořadí roku. Do 2026-10-08 se tu čekalo jen „(aukanætur)“ podle roku 2026.
  const auk = fn('buildLifeRunePrompt')('Thor', gebo, 23, 7, 2026, 'is', false, null);
  rekni(auk.indexOf('(sólmánuður, aukanætur eða heyannir)') !== -1 && auk.indexOf('ÍSLENSKUR MÁNUÐUR: Sólmánuður, Aukanætur eða Heyannir — ') !== -1
        && key(21, 7, 2026) === 'solmanudur' && key(26, 7, 2026) === 'heyannir',
        '23. 7. bez roku: v promptu všechna tři možná období v pořadí roku; kalendář 2026: 21. 7. sólmánuður, 26. 7. heyannir');
  const nic = fn('buildLifeRunePrompt')('Thor', gebo, undefined, undefined, undefined, 'en', false, null);
  rekni(nic.indexOf('ICELANDIC MONTH: unknown month') !== -1, 'bez data → „unknown month", nic si nevymyslí');
  const lab = fn('_getIcelandicSeason')();
  rekni(Object.keys(BM).some((k) => lab.indexOf(BM[k].name + ' (') === 0), 'laboratorní V2 cesta bere jméno z téhož kalendáře');
}

// 6) Měsíc BEZ ROKU (2026-10-09, report 58a0c728 — rok se nezadává). icelandicMonthKeysNoYear počítá přes 1980–2040; musí dát pro
//    každý den roku přesně tutéž sadu jako celé 1900–2100, jinak by někomu na hranici měsíc chyběl nebo přebýval. Rozložení
//    281 / 84 / 1 (jeden, dva, tři možné měsíce) je změřené při zavedení — změní-li se, změnil se kalendář a je potřeba to vědět.
{
  const bez = fn('icelandicMonthKeysNoYear'), dny = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let nesedi = 0; const hist = {};
  for (let m = 1; m <= 12; m++) for (let d = 1; d <= dny[m]; d++) {
    const s = new Set();
    for (let y = 1900; y <= 2100; y++) { if (new Date(Date.UTC(y, m - 1, d)).getUTCMonth() !== m - 1) continue; s.add(key(d, m, y)); }
    const b = bez(d, m); hist[b.length] = (hist[b.length] || 0) + 1;
    if (b.length !== s.size || !b.every((k) => s.has(k))) nesedi++;
  }
  rekni(nesedi === 0 && hist[1] === 281 && hist[2] === 84 && hist[3] === 1,
        'měsíc bez roku: sady 1980–2040 = 1900–2100 pro všech 366 dnů (neshod ' + nesedi + '; 1/2/3 měsíce: ' + [hist[1], hist[2], hist[3]].join('/') + ')');
  const p = fn('icelandicMonthKeysNoYear');
  rekni(p(22, 4).join() === 'einmanudur,harpa' && p(21, 1).join() === 'morsugur,thorri',
        'pořadí roku i přes přelom: 22. 4. einmánuður → harpa, 21. 1. mörsugur → þorri');
}

console.log('');
if (fail) { console.log('FAIL — ' + fail + ' kontrol neprošlo.'); process.exit(1); }
console.log('OK — měsíc narození podle starého islandského kalendáře (1900–2100, 13 období, až do promptu).');
