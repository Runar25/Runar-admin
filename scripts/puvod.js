// puvod.js — odkud se vzalo KAŽDÉ slovo čtení: je v promptu, a pokud ano, v kterém bloku?
//
// Proč (KUKY 2026-09-16): „každé slovo nebo slovní spojení chci vědět, jak se dostalo do čtení" — u testovacích
// čtení se opakovaně ptal na výrazy („grey on the rise", „handing-on", „browning heather"), které v obrazu nejsou.
//
// ⚠️ Co nástroj UMÍ a co ne:
//  - Umí: u každého plnovýznamového slova najít, jestli (a kde) stojí v promptu — systémový prompt rozdělený na
//    oddíly (IDENTITY, PERSONALITY, HOW YOU SPEAK = hlasový profil se vzory, …) a user message na řádky
//    (DRAWN RUNE, ANGLE, IMAGE, ESSENCE, …). Porovnává kořen slova (stands/stand, browning/brown).
//  - Neumí: dokázat PŘÍČINU. Slovo, které v promptu stojí, tam model mohl vzít — nebo ho napsal sám.
//    Slovo, které v promptu není, je modelovo vlastní (asociace k obrazu, obecná znalost). Příčinu dokáže jen
//    test odebráním (slovo z promptu vyndat a spočítat, jestli ze čtení zmizí).
//
//   node scripts/puvod.js <prompt.txt> "<text čtení>"        (prompt ve tvaru === SYSTEM PROMPT === / === USER MESSAGE ===)
'use strict';
const fs = require('fs');

const STOP = new Set(('the a an and or but of in on at to from by for with as is are was were be been it its this that these those ' +
  'you your yours he his she her they their them we our i me my not no nor so than then there here what which who whom whose ' +
  'when where while if into onto over under out up down off all each every one ones two own same other another more most ' +
  'only just also even still yet ever can could will would shall should may might must do does did has have had how why ' +
  'let lets s t very too about after before again against between both such once').split(' '));

// Tvary jednoho slova: stands/stand, browning/brown, rises/rise, stones/stone. Záměrně BEZ -er/-est/-ly:
// „heather" není „heath" (první verze nástroje je slila a ukázala vřes jako slovo z obrazu).
function tvary(w) {
  w = w.toLowerCase().replace(/'s$/, '');
  const out = new Set([w]);
  const pridej = (z) => { if (z.length > 2) { out.add(z); out.add(z + 'e'); if (z.length > 3 && /(.)\1$/.test(z)) out.add(z.slice(0, -1)); } };
  for (const suf of ['ies', 'es', 's', 'ied', 'ed', 'd', 'ing']) if (w.length > suf.length + 2 && w.endsWith(suf)) pridej(w.slice(0, -suf.length));
  if (w.endsWith('ies') || w.endsWith('ied')) out.add(w.slice(0, -3) + 'y');
  return out;
}
const shoda = (a, b) => { for (const x of a) if (b.has(x)) return true; return false; };

function bloky(prompt) {
  const sys = (prompt.split('=== USER MESSAGE ===')[0] || '').replace('=== SYSTEM PROMPT ===', '');
  const user = prompt.split('=== USER MESSAGE ===')[1] || '';
  const out = [];
  // systém: oddíly podle nadpisů VELKÝMI PÍSMENY
  let jmeno = 'SYSTEM úvod', buf = [];
  for (const l of sys.split('\n')) {
    if (/^[A-Z][A-Z &']{3,}$/.test(l.trim())) { if (buf.length) out.push({ jmeno, text: buf.join('\n') }); jmeno = 'SYSTEM · ' + l.trim(); buf = []; }
    else buf.push(l);
  }
  if (buf.length) out.push({ jmeno, text: buf.join('\n') });
  // user message: každý řádek je vlastní blok, pojmenovaný podle začátku
  const JM = [[/^PERSON/, 'PERSON (jméno)'], [/^DRAWN RUNE/, 'DRAWN RUNE (runa · aspekt · svět · živly)'], [/^READING ANGLE/, 'ÚHEL'],
    [/^IMAGE/, 'OBRAZ'], [/^THE ESSENCE LINE/, 'ESENČNÍ ŘÁDEK'], [/^NO COLD READING/, 'NO COLD READING'], [/^One flowing reading/, 'DÉLKA'],
    [/^Mention /, 'JMÉNO RUNY'], [/^End /, 'KONEC'], [/^CLOSING LENS/, 'ČOČKA ŽIVOTNÍ RUNY'], [/^One paragraph/, 'UZAVŘENÍ + JMÉNO'],
    [/^Output format/, 'FORMÁT'], [/^The reading is for/, 'OBLAST'], [/^Let /, 'OTÁZKA/HLEDÁNÍ']];
  for (const l of user.split('\n').filter(x => x.trim())) {
    const hit = JM.find(([re]) => re.test(l));
    out.push({ jmeno: hit ? hit[1] : 'USER · ' + l.slice(0, 20), text: l });
  }
  return out.map(b => { const k = new Set(); (b.text.match(/[A-Za-z']+/g) || []).forEach(w => tvary(w).forEach(x => k.add(x))); return { jmeno: b.jmeno, koreny: k }; });
}

function puvod(prompt, text) {
  const B = bloky(prompt);
  const slova = text.match(/[A-Za-z][A-Za-z'-]*|[^A-Za-z]+/g) || [];
  return slova.map(s => {
    if (!/[A-Za-z]/.test(s)) return { s };
    const casti = s.split('-');
    const lc = s.toLowerCase();
    if (STOP.has(lc) || lc.length < 3) return { s };
    const zdroje = [];
    for (const c of casti) {
      if (STOP.has(c.toLowerCase()) || c.length < 3) continue;       // „on" v „handing-on" nic nedokazuje
      const t = tvary(c);
      B.forEach(b => { if (shoda(t, b.koreny) && !zdroje.includes(b.jmeno)) zdroje.push(b.jmeno); });
    }
    return { s, zdroje };
  });
}

module.exports = { puvod };

if (require.main === module) {
  const [pf, text] = process.argv.slice(2);
  if (!pf || !text) { console.error('pouziti: node scripts/puvod.js <prompt.txt> "<text>"'); process.exit(1); }
  const r = puvod(fs.readFileSync(pf, 'utf8'), text);
  console.log(r.map(x => x.zdroje ? (x.zdroje.length ? x.s + '[' + x.zdroje.join(' + ') + ']' : x.s + '[—]') : x.s).join(''));
}
