// kostra_vstupy.js — JAK MODEL PRACUJE S KAŽDÝM VSTUPEM: přes všechna čtení jedné runy ze solu (EN) rozloží každou větu podle toho, ze kterého
// vstupu má slova (obraz, slovo významu, úhel, podoba oblasti, tvar konce, otázka runy, klíčová slova runy), a co si do obrazu (věta 1) přidal
// sám — podle úhlu a podle obrazu (tam bydlí pasti jako pant u úhlu „věc, která stojí pevně“).
//
// Proč (owner 2026-11-24): „tohle je hodně důležité … být schopni identifikovat, z čeho model bere slova. u jiné runy a jiného obrazu to bude
// něco jiného. všechno musí být zapsané jednoduše vyhledatelné … tohle potřebujeme pro každou informaci, co jde do promptu jako vstup. jak
// s ním model pracuje“ · „super by bylo projít zpětně vše, co bylo uděláno na SOL 6 … je to obraz × úhel, co dělá problém“ · „měli bychom být
// schopni si být spíš jistí než jen hádat“.
// Staví na monitor_ozveny.js (doslovné ozvěny, CODE-tune 2026-10-06) a odkud_slova.js (úseky ≥ 3 slov, 2026-10-22); tohle přidává
// SLOVO PO SLOVU (kmen) a co je modelovo vlastní v obraze. Výstup docs/kostra/VSTUPY.md = jen čísla a jednotlivá slova malými písmeny
// (slova psaná velkým písmenem uprostřed věty — jména — se vynechají; repo je veřejné, texty čtení sem nepatří).
// Hranice: jen EN (islandské tvary slov by bez rozboru tvarů zkreslily) · slovo se mohlo do čtení dostat i odjinud (shoda ≠ příčina; příčinu
// dokáže jen test odebráním, §25) · úhel a obraz jsou z `prompt_draws`, texty vstupů z DNEŠNÍCH builderů (starší čtení mohla mít jiné znění).
//   node scripts/kostra_vstupy.js [--od 2026-10-09] [--zapis]     → souhrn; --zapis = docs/kostra/VSTUPY.md
//   node scripts/kostra_vstupy.js --test                           → útok na rozklad (smyšlené čtení se známým původem slov)
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const M = require('./monitor_ozveny.js');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i !== -1 ? process.argv[i + 1] : d; };
const kmen = (w) => w.replace(/'s$/, '').replace(/(ies)$/, 'y').replace(/(ing|ed|es|s|ly)$/, '').replace(/(.)\1$/, '$1');
const obsah = (t) => M.slova(t).filter((w) => w.length > 2 && !M.STOP.has(w));
const kmeny = (t) => new Set(obsah(t).map(kmen));
const vety = (t) => String(t || '').split(/(?<=[.!?])\s+/).map((v) => v.trim()).filter(Boolean);
const RK = {}; for (const r of M.RUNES) RK[r.n] = r.k || '';
const VSTUPY = ['obraz', 'slovo významu', 'úhel', 'podoba oblasti', 'tvar konce', 'otázka runy', 'klíčová slova runy'];

function zdroje(r) {   // texty vstupů jednoho čtení (EN), stejně jako je rozkládá monitor ozvěn
  let d = r.prompt_draws; if (typeof d === 'string') { try { d = JSON.parse(d); } catch (e) { d = {}; } } d = d || {};
  const z = {};
  if (d.image) z['obraz'] = d.image;
  if (d.kws) z['slovo významu'] = d.kws;
  if (d.angle !== undefined && M.ANG.en[d.angle]) z['úhel'] = M.ANG.en[d.angle];
  const ai = M.AREAS.en.indexOf(r.aol || r.area);
  if (ai >= 0 && d.area_face !== undefined && M.FACES[ai] && M.FACES[ai][d.area_face]) z['podoba oblasti'] = (M.FACES[ai][d.area_face].en || []).join(' ');
  const em = String(d.ending || '').match(/^(heavy|open)(\d+)$/);
  if (em && M.END.en[em[1]][Number(em[2])]) z['tvar konce'] = M.END.en[em[1]][Number(em[2])].replace('{L}', '');
  if (!r.question && !(em && em[2] === '2')) { const q = M.otazkaRuny(r.rune_name, 'en'); if (q) z['otázka runy'] = q; }
  if (RK[r.rune_name]) z['klíčová slova runy'] = RK[r.rune_name];
  return { z, uhel: d.angle, obraz: d.image || '' };
}

function rozloz(r) {
  const t = M.telo(r.short_text), V = vety(t), { z, uhel, obraz } = zdroje(r);
  const ks = {}; for (const [n, txt] of Object.entries(z)) ks[n] = kmeny(txt);
  const vse = new Set([].concat(...Object.values(ks).map((s) => [...s]), [...kmeny(r.rune_name)]));
  const vstup = {};   // vstup → { veta: [počty převzatých kmenů po větách], doslovne: n }
  for (const n of Object.keys(z)) vstup[n] = { vety: V.map((v) => obsah(v).map(kmen).filter((w) => ks[n].has(w)).length), doslovne: M.nejdelsiShoda(z[n], t).n };
  // věta 1: co v ní je a nestojí v žádném vstupu (modelovo vlastní). Jméno (velké písmeno uprostřed věty) a jméno runy se vynechají.
  const prvni = V[0] || '';
  const jmena = new Set((prvni.match(/(?<!^)(?<![.!?]\s)\b[A-ZÁÐÉÍÓÚÝÞÆÖ][a-záðéíóúýþæö]+/g) || []).map((x) => x.toLowerCase()));
  const vlastni = [...new Set(obsah(prvni).filter((w) => !jmena.has(w) && !M.JMENA_RUN.has(w) && !vse.has(kmen(w))))];
  return { runa: r.rune_name, uhel, obraz, n_vet: V.length, vstup, vlastni };
}

// Krátký rozbor jednoho čtení pro „načti čtení a reporty“ (owner 2026-11-24: „když dám načíst reporty, tak udělat automaticky i rozbor …
// určíš automaticky, z čeho to složil, a dáš mi kratší analýzu“). Vrací řádky do terminálu (nesou kus obrazu a slova čtení → jen mimo repo).
function kratky(r) {
  const id = String(r.id || '').slice(0, 8), { z, uhel } = zdroje(r);
  const hl = '· ' + id + ' · ' + r.rune_name + (r.lang === 'is' ? ' · IS' : '') + ' · úhel [' + (uhel === undefined ? '?' : uhel) + '] · obraz: ' + String(z['obraz'] || '—').slice(0, 80)
    + (z['podoba oblasti'] ? ' · oblast: ' + z['podoba oblasti'].split(' in ')[0].slice(0, 40) : '');
  if (r.lang === 'is') return [hl, '   (rozklad slov jen pro EN — islandské tvary by ho zkreslily)'];
  const x = rozloz(r), out = [hl];
  for (let i = 0; i < x.n_vet; i++) {
    const kdo = Object.entries(x.vstup).filter(([, v]) => v.vety[i] > 0).map(([n, v]) => n + ' ' + v.vety[i]);
    out.push('   věta ' + (i + 1) + ': ' + (kdo.length ? kdo.join(' · ') : 'nic ze vstupů (vlastní)') + (i === 0 && x.vlastni.length ? ' | přidal sám: ' + x.vlastni.slice(0, 10).join(', ') : ''));
  }
  return out;
}

function souhrn(rows) {
  const R = rows.filter((r) => r.lang !== 'is' && r.area !== 'spread' && r.short_text && /sol/.test(String(r.model || ''))).map(rozloz);
  const L = [];
  L.push('# Jak model pracuje se vstupy (GENEROVANÉ `node scripts/kostra_vstupy.js --zapis`, needitovat)', '');
  L.push('Čtení jedné runy ze solu, EN: **' + R.length + '**. Slovo = kmen plnovýznamového slova. „Převzal“ = aspoň jedno slovo vstupu ve větě; „doslova“ = úsek ≥ 3 slov. '
    + 'Shoda neříká příčinu (§25); vstupy podle dnešních builderů. Kostra: `docs/kostra/KOSTRA.md` (vstupy V1–V12).', '');
  L.push('## 1. Každý vstup: jak často ho model převezme a do které věty', '', '| vstup | čtení s ním | převzal | věta 1 | věta 2 | věta 3 | věta 4+ | doslova ≥ 3 slova |', '|---|---|---|---|---|---|---|---|');
  for (const n of VSTUPY) {
    const s = R.filter((x) => x.vstup[n]); if (!s.length) continue;
    const pv = (i) => s.filter((x) => (i < 3 ? x.vstup[n].vety[i] : x.vstup[n].vety.slice(3).reduce((a, b) => a + b, 0)) > 0).length;
    const pr = s.filter((x) => x.vstup[n].vety.some((c) => c > 0)).length, dos = s.filter((x) => x.vstup[n].doslovne >= 3).length;
    const p = (k) => Math.round(100 * k / s.length) + ' %';
    L.push('| ' + n + ' | ' + s.length + ' | ' + p(pr) + ' | ' + p(pv(0)) + ' | ' + p(pv(1)) + ' | ' + p(pv(2)) + ' | ' + p(pv(3)) + ' | ' + p(dos) + ' |');
  }
  L.push('', '## 2. Co si model v obraze (věta 1) přidal sám — podle úhlu otevření', '',
    'Slova věty 1, která nestojí v žádném vstupu čtení. Opakuje-li se slovo u téhož úhlu, je to zvyk úhlu (u úhlu [3] tak vznikl pant).', '');
  const uhly = [...new Set(R.map((x) => x.uhel))].filter((u) => u !== undefined).sort((a, b) => a - b);
  for (const u of uhly) {
    const s = R.filter((x) => x.uhel === u), c = {};
    for (const x of s) for (const w of x.vlastni) c[w] = (c[w] || 0) + 1;
    const top = Object.entries(c).filter(([, k]) => k >= 2).sort((a, b) => b[1] - a[1]).slice(0, 15);
    L.push('- **úhel [' + u + ']** (' + s.length + ' čtení) — „' + String(M.ANG.en[u] || '').slice(0, 70) + '…“ · průměr vlastních slov ve větě 1: '
      + (s.reduce((a, x) => a + x.vlastni.length, 0) / s.length).toFixed(1) + (top.length ? ' · opakují se: ' + top.map(([w, k]) => w + ' ' + k).join(', ') : ''));
  }
  L.push('', '## 3. Obrazy, ke kterým model přidává nejvíc vlastního (kandidáti na past obraz × úhel)', '',
    '| obraz (z banky) | čtení | úhly | vlastní slova ve větě 1 |', '|---|---|---|---|');
  const po = {}; for (const x of R) if (x.obraz) (po[x.obraz] = po[x.obraz] || []).push(x);
  const serazene = Object.entries(po).map(([o, s]) => [o, s, s.reduce((a, x) => a + x.vlastni.length, 0) / s.length]).sort((a, b) => b[2] - a[2]).slice(0, 20);
  for (const [o, s, prum] of serazene) {
    const w = [...new Set([].concat(...s.map((x) => x.vlastni)))].slice(0, 12);
    L.push('| ' + o.slice(0, 90) + ' | ' + s.length + ' | ' + [...new Set(s.map((x) => x.uhel))].join(', ') + ' | ' + prum.toFixed(1) + ': ' + w.join(', ') + ' |');
  }
  return L.join('\n') + '\n';
}

function nacti(od) {
  const sql = "select id, drawn_at, lang, rune_name, area, aol, question, short_text, prompt_draws, prompt_version, usage->>'model' as model from " + M.CTENI
    + " where drawn_at >= '" + od.replace(/'/g, '') + "' and prompt_draws is not null order by drawn_at";
  const src = cp.execSync('supabase db query --linked "' + sql.replace(/"/g, '\\"') + '"', { cwd: M.ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const j = JSON.parse(src.slice(src.search(/[\[{]/)));
  return Array.isArray(j) ? j : j.rows;
}

if (require.main !== module) { module.exports = { rozloz, zdroje, kratky, souhrn }; return; }
if (process.argv.includes('--test')) {
  // smyšlené čtení se známým původem: věta 1 z obrazu + vlastní slovo „hinge“, věta 2 klíčové slovo runy, věta 3 podoba oblasti
  const r = { lang: 'en', rune_name: 'Fehu', area: 'Career & Creativity', aol: 'Career & Creativity', question: '', model: 'gpt-6-sol',
    prompt_draws: { image: 'The milk spills over the brim of the pail', kws: 'wealth', angle: 1, area_face: 0 },
    short_text: 'Milk spills over the brim of the pail beside a rusted hinge. Fehu represents wealth that moves. In making and shaping, it may ask for use. What could flow?' };
  const x = rozloz(r), chyby = [];
  if (!(x.vstup['obraz'].vety[0] > 0)) chyby.push('obraz ve větě 1 nepoznán');
  if (!x.vlastni.includes('hinge') || !x.vlastni.includes('rusted')) chyby.push('vlastní slova věty 1 nepoznána: ' + x.vlastni.join(','));
  if (x.vlastni.includes('milk') || x.vlastni.includes('pail')) chyby.push('slovo z obrazu vedeno jako vlastní');
  if (!(x.vstup['slovo významu'].vety[1] > 0)) chyby.push('slovo významu ve větě 2 nepoznáno');
  if (!(x.vstup['podoba oblasti'].vety[2] > 0)) chyby.push('podoba oblasti ve větě 3 nepoznána');
  const jm = rozloz(Object.assign({}, r, { short_text: 'Kuky, the milk spills over the pail while Anna watches the hinge. Fehu represents wealth.' }));
  if (jm.vlastni.includes('anna')) chyby.push('jméno uprostřed věty prošlo jako slovo');
  console.log(chyby.length ? 'FAIL scripts/kostra_vstupy.js --test: ' + chyby.join(' · ') : 'OK  kostra_vstupy --test: původ slov po větách a vlastní slova obrazu poznány, jméno vynecháno');
  process.exit(chyby.length ? 1 : 0);
}
const md = souhrn(nacti(arg('--od', '2026-10-09')));
if (process.argv.includes('--zapis')) { fs.writeFileSync(path.join(M.ROOT, 'docs', 'kostra', 'VSTUPY.md'), md); console.log('zapsáno docs/kostra/VSTUPY.md'); }
else process.stdout.write(md);
