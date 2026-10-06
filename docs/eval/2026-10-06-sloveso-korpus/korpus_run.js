// CODE-tune 2026-10-06 — jak anglické texty o runách pojmenují význam runy: jaké sloveso stojí za jménem runy.
// Korpus = Wikipedie (24 run + Rune poem) + weby s výklady run. node korpus_run.js [výstup.json] → výpis délek.
// Stažený text je cizí autorský obsah → do repa NEPATŘÍ; ukládá se mimo repo (výchozí: dočasná složka systému).
'use strict';
const fs = require('fs'), os = require('os'), path = require('path');
const VYSTUP = process.argv[2] || path.join(os.tmpdir(), 'korpus_run.json');
const UA = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36', 'accept-language': 'en' };
const WIKI = ['Fehu', 'Uruz', 'Thurisaz', 'Ansuz', 'Raido', 'Kaunan', 'Gebo', 'Wunjo', 'Hagalaz', 'Naudiz', 'Isaz', 'Jera (rune)', 'Eihwaz', 'Perthro',
  'Algiz', 'Sowilo', 'Tiwaz', 'Berkanan', 'Ehwaz', 'Mannaz', 'Laguz', 'Ingwaz', 'Dagaz', 'Othala', 'Rune poem', 'Elder Futhark'];
const WEB = [
  'https://vikingr.org/magic-symbols/fehu', 'https://vikingr.org/magic-symbols/hagalaz', 'https://www.pagangrimoire.com/fehu-rune/',
  'https://www.vikingheritage.net/blogs/viking/fehu-rune-meaning', 'https://runedictionary.com/fehu-the-rune-of-wealth-and-new-beginnings/',
  'https://www.runichub.com/post/fehu-rune', 'https://www.runichub.com/post/hagalaz-rune', 'https://www.mysticdoorway.com/fehu/',
  'https://www.ifate.com/rune-meanings/what-does-the-fehu-rune-mean.html', 'https://thewickedgriffin.com/hagalaz-rune-meaning/',
  'https://thenordichearth.com/runes/hagalaz-meaning/', 'https://astratrainer.com/pages/runes/hagalaz', 'https://www.auntyflo.com/rune-stones/hagalaz',
  'https://www.vikingtimes.co.uk/viking-culture/viking-runes/elder-futhark-runes/the-second-aett-heimdalls-or-hagals-aett-runes/hagalaz-rune/',
  'https://plentifulearth.com/ancestral-wisdom/elder-futhark-rune-meanings/', 'https://evoluteur.github.io/rune-reading/runes/index.html',
  'http://www.shieldmaidenssanctum.com/blog/2019/3/12/the-elder-futhark-runes-and-their-meanings', 'https://asktherunes.com/rune-meanings/',
  'https://astratrainer.com/blog/spiritual/elder-futhark-rune-meanings', 'https://deckaura.com/blogs/guide/rune-meanings',
  'https://www.polytranslator.com/alphabet/runic/', 'https://tsmm.substack.com/p/the-runes-a-brief-introduction',
  'https://norse-mythology.org/runes/', 'https://www.planderful.com/blogs/viking-rune/fehu-rune-meaning-the-norse-symbol-of-wealth-and-prosperity',
  'https://medium.com/mythic-writes/the-rune-series-hagalaz-hail-d1059343d76f', 'https://mysticryst.com/blogs/the-mystic-journal/hagalaz-rune-complete-guide',
  'https://predictress.com/hagalaz',
];
const ent = (s) => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&#x27;|&rsquo;|&lsquo;/g, "'")
  .replace(/&ldquo;|&rdquo;/g, '"').replace(/&mdash;/g, ' — ').replace(/&ndash;/g, '–').replace(/&#\d+;/g, ' ').replace(/&[a-z]+;/g, ' ');
const holy = (h) => ent(h.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
  .replace(/<\/(p|div|li|h\d|br|tr|td)>/gi, '. ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
async function stahni(url) {
  try { const r = await fetch(url, { headers: UA, redirect: 'follow' }); if (!r.ok) return { url, err: r.status }; return { url, text: holy(await r.text()) }; }
  catch (e) { return { url, err: e.message.slice(0, 60) }; }
}
async function wiki(t) {
  const u = 'https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&redirects=1&format=json&titles=' + encodeURIComponent(t);
  for (let i = 0; i < 5; i++) {
    await new Promise((ok) => setTimeout(ok, 2500 + 2500 * i));
    const r = await fetch(u, { headers: { 'user-agent': 'RunarRuneResearch/1.0 (github.com/Runar25)' } }); const tx = await r.text();
    if (!tx.startsWith('{')) continue;
    const p = Object.values(JSON.parse(tx).query.pages)[0];
    return { url: 'wikipedia:' + t, text: String(p.extract || '').replace(/\s+/g, ' ') };
  }
  return { url: 'wikipedia:' + t, err: 'rate limit' };
}
(async () => {
  const docs = [];
  for (const t of WIKI) docs.push(await wiki(t));
  for (let i = 0; i < WEB.length; i += 6) docs.push(...(await Promise.all(WEB.slice(i, i + 6).map(stahni))));
  fs.writeFileSync(VYSTUP, JSON.stringify(docs));
  for (const d of docs) console.log((d.err ? 'CHYBA ' + d.err : String(d.text.length).padStart(7)) + '  ' + d.url);
})();
