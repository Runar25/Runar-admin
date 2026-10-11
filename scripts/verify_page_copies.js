// Kontrola pro smoke (číslo přidělí, kdo ji zapojí) — statické stránky (nápověda, soukromí) drží angličtinu DVAKRÁT: v HTML (záloha, než naběhne JS) a ve slovníku v JS.
// Obě kopie se nesmí rozejít.
//
// Proč (2026-10-11, kontrola architektury kolo 2 / 8, CODE-read): v kódu stálo jen „Statická záloha v HTML nese TÝŽ text — měnit obojí“
// — pravidlo na paměti (§30). Nápověda se už rozešla: HTML „ONLINE PURCHASE — coming soon“ × JS „ONLINE PURCHASE“. JS text po načtení
// přepíše, takže většina lidí vidí JS verzi; HTML vidí ten, komu JS nenaběhne (a vyhledávače) — dvě různé pravdy o téže věci (§20).
// Co dělá: pro každý prvek s id, který má i klíč v EN slovníku (s-1-body ~ s1Body, bez pomlček a velikosti písmen), porovná text po
// odstranění značek a zástupných {…} / ${…}. Rozdíl = FAIL.
//   node scripts/verify_page_copies.js          · node scripts/verify_page_copies.js --test
'use strict';
const fs = require('fs'), path = require('path');
const V2 = path.join(path.resolve(__dirname, '..'), 'v2');
const STRANKY = ['runar-help.html', 'runar-privacy.html'];
const norm = (x) => String(x).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
  .replace(/\$\{[^}]+\}/g, '').replace(/\{[a-z_]+\}/g, '').replace(/\s+/g, ' ').trim();
const klic = (k) => k.replace(/-/g, '').toLowerCase();

function porovnej(t) {
  const stat = {};
  for (const m of t.matchAll(/<([a-z0-9]+)[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g)) stat[klic(m[2])] = norm(m[3]);
  const enStart = t.indexOf('en: {'), isStart = t.indexOf('is: {', enStart);
  if (enStart < 0) return { spol: 0, lisi: [] };
  const enBlok = t.slice(enStart, isStart > 0 ? isStart : undefined);
  const js = {};
  for (const m of enBlok.matchAll(/['"]?([A-Za-z0-9_-]+)['"]?\s*:\s*(`([\s\S]*?)`|'((?:\\'|[^'])*)')/g))
    js[klic(m[1])] = norm(m[3] !== undefined ? m[3] : m[4].replace(/\\'/g, "'"));
  let spol = 0; const lisi = [];
  for (const k of Object.keys(js)) if (stat[k] !== undefined) { spol++; if (stat[k] !== js[k]) lisi.push({ k, html: stat[k], js: js[k] }); }
  return { spol, lisi };
}

if (process.argv.includes('--test')) {
  const stejne = '<h2 id="s1-lbl">TITLE</h2><script>const C = { en: { \'s1-lbl\': \'TITLE\' }, is: {} }</script>';
  const jine = '<h2 id="s1-lbl">TITLE — soon</h2><script>const C = { en: { \'s1-lbl\': \'TITLE\' }, is: {} }</script>';
  const camel = '<p id="s7-body">Hello <b>you</b></p><script>const C = { en: { s7Body: `<p>Hello you</p>` }, is: {} }</script>';
  const ok = porovnej(stejne).lisi.length === 0 && porovnej(stejne).spol === 1 && porovnej(jine).lisi.length === 1 && porovnej(camel).lisi.length === 0;
  console.log(ok ? 'OK    samotest: shodná kopie projde, rozdílná se pozná, s7-body ~ s7Body a značky se nepočítají' : 'FAIL  samotest');
  process.exit(ok ? 0 : 1);
}

let fail = 0, celkem = 0;
for (const pg of STRANKY) {
  const r = porovnej(fs.readFileSync(path.join(V2, pg), 'utf8'));
  celkem += r.spol;
  for (const d of r.lisi) {
    fail++;
    let i = 0; while (i < d.html.length && d.html[i] === d.js[i]) i++;
    console.log('FAIL  ' + pg + ' „' + d.k + '“: HTML „…' + d.html.slice(Math.max(0, i - 20), i + 50) + '…“ × JS „…' + d.js.slice(Math.max(0, i - 20), i + 50) + '…“');
  }
}
console.log(fail ? 'FAIL  ' + fail + ' rozešlých kopií textu (statické HTML × slovník v JS) — oprav obě na totéž'
  : 'OK    statické HTML a slovník v JS nesou tentýž text (' + celkem + ' prvků v ' + STRANKY.length + ' stránkách)');
process.exit(fail ? 1 : 0);
