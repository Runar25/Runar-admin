// fraze_z_historie.js — ODKUD SE BEROU OPAKOVANÉ FRÁZE: přirozený pokus z historie, bez nových volání modelu.
//
// Proč: krok 6 plánu „z čeho se skládá čtení“ (owner 2026-10-22 „10. ano 11. ano“, krok 6 „přirozené pokusy z historie: změny kusů
// v gitu proti verzi promptu u čtení — odkud se berou opakované fráze, bez nových volání“; owner 2026-10-26 „pokračuj krokem 6“).
// Monitor ozvěn hledá zdroj fráze v DNEŠNÍM promptu; tady má každé čtení prompt své doby (scripts/utils/prompt_doby.js).
//
// Jak:
//   1. Opakovaná fráze = 4 slova za sebou ve ≥ --min čteních (EN, jedna runa), aspoň 1 plnovýznamové (2026-10-26: se dvěma vypadly
//      právě větné rámce „is the rune of“, „at the edge of the“ — ověřeno výpisem n-gramů bez filtru). Sousední čtveřice se stejnými
//      čteními se spojí do jedné delší fráze.
//   2. U každého čtení: stála fráze v promptu té doby? Úroveň „prompt“ = v promptu, který model dostal (builder té verze + losy čtení);
//      úroveň „kód“ = jen v souborech, ze kterých se prompt té doby skládal (staré čtení bez losů) — ve výstupu zvlášť.
//   3. Pokus: výskyt fráze ve čteních, kde v promptu STÁLA, proti čtením, kde NESTÁLA — zvlášť podle modelu (Claude / sol), protože
//      změna modelu jde v čase se změnami promptu. Fráze vázaná na pár run (obraz, význam) se počítá jen na čteních těch run.
//   4. Verdikt: „z promptu“ jen když výskyt s frází v promptu je aspoň 2× vyšší než bez ní (n ≥ 5 na obou stranách, týž model) —
//      obrácená páka (§25 A) je v tom porovnání: fráze přišla do promptu, nebo z něj odešla. „model sám“ = v promptu nestála nikdy.
// Hranice (§25): shoda v čase není příčina — verze nesou víc změn naráz; verze mají málo čtení (proto dvě skupiny, ne verze po verzi);
// úroveň „kód“ říká jen, že text v kódu byl, ne že ho model dostal. Výstup nese fráze z textů čtení → mimo repo.
//   node scripts/fraze_z_historie.js [--min 6] [--posledni 100] [--vystup <cesta>]
//   --posledni N = jen N nejnovějších čtení (owner 2026-10-26: „11 je málo. tak to vem na posledních 100 čtení“)
//   node scripts/fraze_z_historie.js --test   (samotest: spojení čtveřic a verdikt na smyšlených datech)
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), cp = require('child_process');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i !== -1 ? process.argv[i + 1] : d; };
const MIN = Number(arg('--min', 6));
const POSLEDNI = Number(arg('--posledni', 0));
const VYSTUP = arg('--vystup', path.join(os.tmpdir(), 'runar_fraze_z_historie_' + new Date().toISOString().slice(0, 10) + '.md'));

const STOP = new Set(('the a an of in on to this that is are be what does do my me i you your it its how why with for about and or not no as at by ' +
  'from into than then there their they them he she his her we our was were has have had will would can could may might one so if but just ' +
  'only even still when where which who whom whose all any some more most much very own same such here now')
  .split(' '));
const slova = (t) => String(t).toLowerCase().replace(/\\u2019|[’‘]/g, "'").replace(/\\'/g, "'").match(/[a-z]+(?:'[a-z]+)?/g) || [];
const ctverice = (w) => { const o = new Set(); for (let i = 0; i + 4 <= w.length; i++) o.add(w.slice(i, i + 4).join(' ')); return o; };
const plnych = (g) => g.split(' ').filter((x) => !STOP.has(x) && x.length > 2).length;
const obsahuje = (text, fraze) => (' ' + slova(text).join(' ') + ' ').indexOf(' ' + fraze + ' ') !== -1;
const rodina = (model, drawn) => /gpt|sol/i.test(model || '') ? 'sol' : (model ? 'claude' : (String(drawn) < '2026-09-24' ? 'claude' : '?'));

// 1. opakované fráze ze čtení: [{ fraze, ctverice: [...], cteni: Set(id) }]
function najdiFraze(cteni, min, jmenaRun) {
  const df = new Map();
  for (const c of cteni) for (const g of c.g) { if (!df.has(g)) df.set(g, new Set()); df.get(g).add(c.id); }
  const kand = [...df].filter(([g, s]) => s.size >= min && plnych(g) >= 1 && !g.split(' ').every((x) => jmenaRun.has(x)));
  // spojit řetěz: čtveřice b navazuje na a (posun o 1 slovo) a má TÁŽ čtení
  const klic = (s) => [...s].sort().join(',');
  const podleCteni = new Map();
  for (const [g, s] of kand) { const k = klic(s); if (!podleCteni.has(k)) podleCteni.set(k, []); podleCteni.get(k).push(g); }
  const out = [];
  for (const [k, gs] of podleCteni) {
    const zbyle = new Set(gs);
    while (zbyle.size) {
      let cur = [...zbyle][0]; zbyle.delete(cur);
      let w = cur.split(' '), pouzite = [cur], zmena = true;
      while (zmena) {
        zmena = false;
        for (const g of [...zbyle]) {
          const v = g.split(' ');
          if (v.slice(0, 3).join(' ') === w.slice(-3).join(' ')) { w = w.concat(v[3]); zbyle.delete(g); pouzite.push(g); zmena = true; }
          else if (v.slice(1).join(' ') === w.slice(0, 3).join(' ')) { w = [v[0]].concat(w); zbyle.delete(g); pouzite.push(g); zmena = true; }
        }
      }
      out.push({ fraze: w.join(' '), ctverice: pouzite, cteni: new Set(k.split(',')) });
    }
  }
  return out.sort((a, b) => b.cteni.size - a.cteni.size);
}

// 3.–4. pokus pro jednu frázi; zaznamy = [{ id, runa, rodina, uroven, vPromptu, kde }]
function verdikt(f, zaznamy) {
  const runy = new Set(zaznamy.filter((z) => f.cteni.has(z.id)).map((z) => z.runa));
  const vazana = runy.size <= 3;
  const zakl = zaznamy.filter((z) => !vazana || runy.has(z.runa));
  const sk = {};
  for (const z of zakl) {
    const k = z.rodina + '|' + (z.vPromptu ? 'v' : 'mimo');
    sk[k] = sk[k] || { n: 0, hit: 0 }; sk[k].n++; if (f.cteni.has(z.id)) sk[k].hit++;
  }
  const nikdy = !zakl.some((z) => z.vPromptu);
  let typ = nikdy ? 'model sám' : 'nerozhodnuto';
  const dukaz = [];
  for (const r of ['claude', 'sol']) {
    const v = sk[r + '|v'], m = sk[r + '|mimo'];
    if (v && m && v.n >= 5 && m.n >= 5) {
      const pv = v.hit / v.n, pm = m.hit / m.n;
      if (pv >= 2 * pm && pv > 0) { typ = 'z promptu'; dukaz.push(r); }
      else if (typ === 'nerozhodnuto') typ = 'v promptu, výskyt na tom nezávisí';
    }
  }
  if (!nikdy && typ === 'nerozhodnuto' && !zakl.some((z) => !z.vPromptu)) typ = 'v promptu vždy (bez srovnání)';
  return { typ, dukaz, vazana, runy: [...runy], sk };
}

function test() {
  const jm = new Set(['isa']);
  const cteni = [];
  for (let i = 0; i < 8; i++) cteni.push({ id: 'a' + i, g: ctverice(slova('the ice holds the river still tonight and more')) });
  for (let i = 0; i < 8; i++) cteni.push({ id: 'b' + i, g: ctverice(slova('something else entirely without it here')) });
  const fr = najdiFraze(cteni, 6, jm);
  const ice = fr.find((f) => f.fraze.indexOf('ice holds the river still') !== -1);
  if (!ice || ice.fraze.split(' ').length < 6) { console.log('FAIL  spojení čtveřic: ' + JSON.stringify(fr.map((f) => f.fraze))); process.exit(1); }
  if (!obsahuje("it\\u2019s cold", "it's cold")) { console.log('FAIL  apostrof z kódu'); process.exit(1); }
  const zaz = [];
  for (let i = 0; i < 8; i++) zaz.push({ id: 'a' + i, runa: 'R' + (i % 5), rodina: 'sol', vPromptu: true });
  for (let i = 0; i < 8; i++) zaz.push({ id: 'b' + i, runa: 'R' + (i % 5), rodina: 'sol', vPromptu: false });
  const v1 = verdikt(ice, zaz);
  const v2 = verdikt(ice, zaz.map((z) => Object.assign({}, z, { vPromptu: false })));
  const v3 = verdikt(ice, zaz.map((z) => Object.assign({}, z, { vPromptu: z.id[0] === 'b' })));   // obráceně: v promptu jen kde se neobjevila
  if (v1.typ !== 'z promptu' || v2.typ !== 'model sám' || v3.typ === 'z promptu') { console.log('FAIL  verdikt: ' + [v1.typ, v2.typ, v3.typ].join(' / ')); process.exit(1); }
  console.log('OK    samotest: čtveřice se spojí, apostrof z kódu sedí, verdikt rozliší z promptu / model sám / obrácenou páku');
}
if (process.argv.includes('--test')) { test(); process.exit(0); }

const M = require('./monitor_ozveny.js');
const P = require('./utils/prompt_doby.js');
const sql = "select id, drawn_at, rune_name, aol, area, seeking, intention, question, short_text, prompt_draws, prompt_version, usage->>'model' as model from " + M.CTENI
  + " where lang = 'en' and coalesce(area,'') <> 'spread' and short_text is not null order by drawn_at" + (POSLEDNI ? ' desc limit ' + POSLEDNI : '');
const src = cp.execSync('supabase db query --linked "' + sql.replace(/"/g, '\\"') + '"', { cwd: P.ROOT, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
const j = JSON.parse(src.slice(src.search(/[\[{]/))), rows = (Array.isArray(j) ? j : j.rows).sort((a, b) => String(a.drawn_at).localeCompare(String(b.drawn_at)));
const jmenaRun = new Set(M.RUNES.map((r) => String(r.n).toLowerCase()));
const cteni = rows.map((r) => ({ id: r.id, g: ctverice(slova(M.telo(r.short_text))) }));
const fraze = najdiFraze(cteni, MIN, jmenaRun);

// prompt každého čtení (jednou), pak u každé fráze: stála v něm?
const prompty = new Map();
const urovne = { prompt: 0, 'kód': 0, nenalezeno: 0 };
for (const r of rows) {
  const pc = P.promptCteni(r);
  if (!pc) { urovne.nenalezeno++; continue; }
  urovne[pc.uroven]++;
  prompty.set(r.id, { r, pc, text: pc.radky.map((x) => ' ' + slova(x.text).join(' ') + ' ') });
}
const md = ['# Odkud se berou opakované fráze — přirozený pokus z historie (' + new Date().toISOString().slice(0, 10) + ')', '',
  'Čtení EN jedné runy: ' + rows.length + (rows.length ? ' (' + String(rows[0].drawn_at).slice(0, 10) + ' → ' + String(rows[rows.length - 1].drawn_at).slice(0, 10) + ')' : '') + ' · prompt složen přesně: ' + urovne.prompt + ' · jen kód té doby: ' + urovne['kód'] + ' · verze nenalezena: ' + urovne.nenalezeno
  + '. Fráze = 4+ slova ve ≥ ' + MIN + ' čteních. Hlavička skriptu: jak a hranice.', ''];
const souhrn = {};
for (const f of fraze) {
  const zaz = [];
  for (const [id, x] of prompty) {
    const i = x.text.findIndex((t) => f.ctverice.some((g) => t.indexOf(' ' + g + ' ') !== -1));
    zaz.push({ id, runa: x.r.rune_name, rodina: rodina(x.r.model, x.r.drawn_at), uroven: x.pc.uroven, vPromptu: i !== -1, kde: i !== -1 ? x.pc.radky[i] : null,
      verze: x.r.prompt_version || '(bez verze)', drawn: String(x.r.drawn_at).slice(0, 10) });
  }
  const v = verdikt(f, zaz);
  souhrn[v.typ] = (souhrn[v.typ] || 0) + 1;
  const sk = (k) => v.sk[k] ? v.sk[k].hit + '/' + v.sk[k].n : '—';
  const hity = zaz.filter((z) => f.cteni.has(z.id));
  const od = hity.map((z) => z.drawn).sort();
  md.push('### „' + f.fraze + '“ — ' + f.cteni.size + ' čtení · **' + v.typ + '**' + (v.dukaz.length ? ' (' + v.dukaz.join(', ') + ')' : ''));
  md.push('- výskyt (fráze v promptu / mimo): Claude ' + sk('claude|v') + ' / ' + sk('claude|mimo') + ' · sol ' + sk('sol|v') + ' / ' + sk('sol|mimo')
    + (v.vazana ? ' · jen čtení run ' + v.runy.join(', ') : ' · ' + v.runy.length + ' run'));
  md.push('- čtení s frází: ' + od[0] + ' → ' + od[od.length - 1] + ' · verze: ' + [...new Set(hity.map((z) => z.verze))].slice(0, 6).join(', '));
  const kde = {};
  for (const z of zaz.filter((z) => z.vPromptu)) { const k = z.kde.kde; kde[k] = kde[k] || { n: 0, text: z.kde.text, ur: z.uroven }; kde[k].n++; }
  for (const [k, x] of Object.entries(kde).sort((a, b) => b[1].n - a[1].n).slice(0, 3))
    md.push('- v promptu: **' + k + '** (' + x.n + ' čtení' + (x.ur === 'kód' ? ', jen úroveň kódu' : '') + ') — „' + x.text.slice(0, 200) + (x.text.length > 200 ? '…' : '') + '“');
  md.push('');
}
md.splice(3, 0, '**Souhrn (' + fraze.length + ' frází):** ' + Object.entries(souhrn).sort((a, b) => b[1] - a[1]).map(([k, n]) => k + ' ' + n).join(' · '), '');
fs.writeFileSync(VYSTUP, md.join('\n'));
console.log('zapsáno (mimo repo — nese fráze z čtení):', VYSTUP);
console.log(md.slice(0, 6).join('\n'));
