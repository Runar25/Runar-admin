// MONITOR OZVĚN — co z toho, co dáváme modelu do promptu, se vrací doslova ve výstupu (CODE-tune 2026-10-06).
//
// PROČ (KUKY 2026-10-06): „Víme, jaká tam jsou slova, a jestli jsou v té části, kde se má ten vstup objevit, objeví přesně ta slova.
// Pokud použije přesně to sloveso nebo podnět skoro pořád, tak to prostě je viditelný problém… Až nám bude chodit hodně čtení… potřebuju,
// aby se to vyhodnocovalo. Klidně automaticky a zapisovat někde do tabulky.“ Doklady, že to se modelem dělá: sol převzal sloveso rámce
// („Hagalaz names…“ 14/33), slovo „drawn“ z promptu Asku („Algiz is the rune drawn here“ 11/18), frázi z otázky („in this picture“).
//
// CO MĚŘÍ (každé čtení se rozloží podle `prompt_draws` zpět na texty, které do něj vstoupily):
//   ČTENÍ (single): obraz opsaný (≥ 4 slova za sebou) · význam z hlavičky doslova · sloveso po jménu runy · podoba oblasti opsaná
//     (≥ 3 slova) · pokyn úhlu / konce opsaný (≥ 4 slova) · fráze, které se opakují ve ≥ 30 % čtení
//   ASK: slova otázky zopakovaná v odpovědi · ozvěny pokynů („drawn“, „does not say“, „leaves … open“, „not a promise / verdict“) ·
//     opakované fráze
// ⚠ = vstup se vrací ve ≥ 50 % případů (n ≥ 3) — to je „viditelný problém“, na který má CODE ownera upozornit.
// Ve výstupu jen čísla a fráze z malých písmen (žádná jména, žádné otázky uživatelů) — tabulka smí do veřejného repa.
//
//   node scripts/monitor_ozveny.js [--od 2026-10-06] [--soubor export.json] [--zapis]   → souhrn; --zapis = připsat do docs/monitor/ozveny.md
//   node scripts/monitor_ozveny.js --nove --zapis   → jen čtení od posledního zápisu (značka „do:“ na konci každé sekce tabulky);
//     bez nových čtení nic nepřipíše. Tohle CODE pouští při každém načtení nových čtení — owner chce slyšet, co se opakuje.
//   node scripts/monitor_ozveny.js --test   (smoke ㉷: smyšlená čtení se známými ozvěnami musí být poznána)
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..'), D = path.join(ROOT, 'v2') + path.sep;
const S = { console: { log() {}, warn() {}, error() {} }, document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] },
  localStorage: { getItem: () => null, setItem() {} } };
S.window = S; S.globalThis = S; vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-character.js', 'runar-utils.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
const G = (n) => vm.runInContext(n, S);
const RUNES = G('RUNES'), AREAS = G('AREAS'), FACES = G('AREA_FACES');
const ANG = { en: G('READING_ANGLES'), is: G('READING_ANGLES_IS') };
const END = { en: { heavy: G('ENDING_HEAVY'), open: G('ENDING_OPEN') }, is: { heavy: G('ENDING_HEAVY_IS'), open: G('ENDING_OPEN_IS') } };

const arg = (k) => { const i = process.argv.indexOf(k); return i !== -1 ? process.argv[i + 1] : null; };
const slova = (s) => String(s || '').toLowerCase().replace(/[’']/g, "'").replace(/[^a-záðéíóúýþæöäü' ]+/gi, ' ').split(/\s+/).filter(Boolean);
const STOP = new Set('the a an of in on to this that is are be what does do my me i you your it its how why with for about and or not no as at by from into than then there their they them he she his her we our was were has have had'.split(' '));
function nejdelsiShoda(zdroj, cil) {   // nejdelší souvislý úsek slov zdroje, který stojí i v cíli
  const z = slova(zdroj), c = ' ' + slova(cil).join(' ') + ' ';
  let best = 0, kus = '';
  for (let i = 0; i < z.length; i++) for (let j = z.length; j > i + best; j--) {
    const g = z.slice(i, j); if (g.every((w) => STOP.has(w))) continue;
    if (c.indexOf(' ' + g.join(' ') + ' ') !== -1) { best = j - i; kus = g.join(' '); break; }
  }
  return { n: best, kus };
}
function telo(t) { let b = String(t || ''); try { const j = JSON.parse(b.slice(b.indexOf('['), b.lastIndexOf(']') + 1)); b = j.map((x) => x.text).join(' '); } catch (e) {} return b.split('✦')[0].trim(); }
function sloveso(text, runa) {
  const m = text.match(new RegExp('\\b' + runa + "(?:’s|'s)?\\s+(\\w+)(?:\\s+(of|as|to))?", 'i'));
  return m ? (m[1] + (m[2] ? ' ' + m[2] : '')).toLowerCase() : '';
}
const POKYNY = [
  ['„drawn“ (runa tažená / netažená)', /\bdrawn here\b|\brune drawn\b|\bwas not drawn\b|\bnot (one of|among) the runes\b|\bwas cast here\b|\bonly [A-Z][a-z]+ was (drawn|cast)\b/i],
  ['„the rune / reading does not say“', /\b(the )?(rune|runes|reading|picture|image) (does|do) not (say|tell|decide|settle|show)\b/i],
  ['„leaves … open“', /\bleaves? (that|it|this|the [a-z]+|room for)? ?(question )?open\b|\bleaves room for\b/i],
  ['„not a promise / verdict / sign“', /\bnot a (promise|verdict|prediction|sign|warning)\b/i],
];
function opakovane(texty, min) {   // čtyřslovné fráze z malých písmen ve ≥ min % textů
  const pocty = {};
  for (const t of texty) {
    const w = String(t).replace(/[’']/g, "'").split(/[^A-Za-záðéíóúýþæöÁÐÉÍÓÚÝÞÆÖ']+/).filter(Boolean);
    const vid = new Set();
    for (let i = 0; i + 4 <= w.length; i++) {
      const g = w.slice(i, i + 4); if (g.some((x) => x !== x.toLowerCase())) continue;
      if (g.filter((x) => !STOP.has(x)).length < 2) continue;
      const s = g.join(' '); if (!vid.has(s)) { vid.add(s); pocty[s] = (pocty[s] || 0) + 1; }
    }
  }
  return Object.entries(pocty).filter(([, c]) => c >= Math.max(2, min * texty.length)).sort((a, b) => b[1] - a[1]).slice(0, 6);
}
function rozber(rows) {
  const R = { cteni: [], ask: [] };
  for (const r of rows) {
    const L = r.lang === 'is' ? 'is' : 'en';
    let d = r.prompt_draws; if (typeof d === 'string') { try { d = JSON.parse(d); } catch (e) { d = {}; } } d = d || {};
    const model = String(r.model || (r.usage && r.usage.model) || '?').replace('claude-', '');
    if (r.area !== 'spread' && r.short_text) {
      const t = telo(r.short_text), x = { model, L, runa: r.rune_name };
      if (d.image) x.obraz = nejdelsiShoda(d.image, t);
      if (d.kws && d.kws.indexOf(',') === -1) x.aspekt = new RegExp('\\b' + d.kws.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(t);
      x.sloveso = sloveso(t, r.rune_name);
      const ai = Math.max(AREAS.en.indexOf(r.aol || r.area), AREAS.is.indexOf(r.aol || r.area));
      if (ai >= 0 && d.area_face !== undefined && FACES[ai] && FACES[ai][d.area_face]) {
        const f = FACES[ai][d.area_face][L] || [];
        const s = [nejdelsiShoda(f[0], t), nejdelsiShoda(f[1], t)].sort((a, b) => b.n - a.n)[0];
        x.oblast = s;
      }
      if (d.angle !== undefined && ANG[L][d.angle]) x.uhel = nejdelsiShoda(ANG[L][d.angle], t);
      const em = String(d.ending || '').match(/^(heavy|open)(\d+)$/);
      if (em && END[L][em[1]][Number(em[2])]) x.konec = nejdelsiShoda(END[L][em[1]][Number(em[2])], t);
      x.text = t;
      R.cteni.push(x);
    }
    for (const f of r.follow_up || []) {
      if (!f || !f.q || !f.a) continue;
      const q = String(f.q), a = String(f.a);
      const qz = slova(q).map((w) => (w === 'i' ? 'you' : w === 'my' ? 'your' : w === 'me' ? 'you' : w));
      const ac = ' ' + slova(a).join(' ') + ' ';
      let ozvena = '';
      for (let i = 0; i + 3 <= qz.length && !ozvena; i++) { const g = qz.slice(i, i + 3); if (g.filter((w) => !STOP.has(w)).length >= 1 && ac.indexOf(' ' + g.join(' ') + ' ') !== -1) ozvena = g.join(' '); }
      R.ask.push({ model: String((f.usage && f.usage.model) || model).replace('claude-', ''), ozvena, pokyny: POKYNY.filter(([, re]) => re.test(a)).map(([jm]) => jm), text: a });
    }
  }
  return R;
}
function souhrn(R) {
  const p = (a, n) => n ? a + '/' + n : '—';
  const C = R.cteni, A = R.ask, out = [], var_ = [];
  // 2026-10-06: zvlášť sol a Opus — chovají se jinak (sloveso „names“ dělá jen sol), smíchaný podíl by vzorec jednoho modelu schoval.
  const SKUP = [['sol', (x) => /^gpt/.test(x.model)], ['opus', (x) => /opus/.test(x.model)]];
  let _rozpad = null;   // nastaví radekM: pro každou skupinu [a, n]
  const radek = (jm, a, n, pozn) => {
    const bunky = [p(a, n)].concat((_rozpad || []).map(([g, aa, nn]) => p(aa, nn)));
    const zlute = [[a, n, '']].concat((_rozpad || []).map(([g, aa, nn]) => [aa, nn, ' (' + g + ')'])).filter(([aa, nn]) => nn >= 3 && aa / nn >= 0.5);
    zlute.forEach(([aa, nn, g]) => var_.push(jm + g + ' ' + p(aa, nn)));
    out.push('| ' + (zlute.length ? '⚠ ' : '') + jm + ' | ' + bunky.join(' | ') + ' | ' + (pozn || '') + ' |');
    _rozpad = null;
  };
  const radekM = (jm, kde, f, pozn) => {   // kde = pole záznamů, f = podmínka „vstup se vrátil“, počítá se jen kde je vstup známý
    _rozpad = SKUP.map(([g, je]) => { const xs = kde.filter(je); return [g, xs.filter(f).length, xs.length]; });
    radek(jm, kde.filter(f).length, kde.length, pozn);
  };
  const s = (f) => C.filter(f);
  radekM('obraz opsán (≥ 4 slova za sebou)', s((x) => x.obraz), (x) => x.obraz.n >= 4, '');
  radekM('význam z hlavičky doslova v textu', s((x) => x.aspekt !== undefined), (x) => x.aspekt === true, '');
  const sl = {}; C.forEach((x) => { if (x.sloveso) sl[x.sloveso] = (sl[x.sloveso] || 0) + 1; });
  const top = Object.entries(sl).sort((a, b) => b[1] - a[1]);
  radekM('nejčastější sloveso po jménu runy (' + (top.length ? top[0][0] : '—') + ')', C.filter((x) => x.sloveso), (x) => top.length && x.sloveso === top[0][0], top.slice(0, 4).map(([k, n]) => k + ' ' + n).join(', '));
  radekM('podoba oblasti opsaná (≥ 3 slova)', s((x) => x.oblast), (x) => x.oblast.n >= 3,
    [...new Set(s((x) => x.oblast && x.oblast.n >= 3).map((x) => '„' + x.oblast.kus + '“'))].slice(0, 3).join(' · '));
  radekM('pokyn úhlu opsaný (≥ 4 slova)', s((x) => x.uhel), (x) => x.uhel.n >= 4, '');
  radekM('pokyn konce opsaný (≥ 4 slova)', s((x) => x.konec), (x) => x.konec.n >= 4, '');
  radekM('Ask: slova otázky zopakovaná', A, (x) => !!x.ozvena,
    [...new Set(A.filter((x) => x.ozvena).map((x) => '„' + x.ozvena + '“'))].slice(0, 3).join(' · '));
  for (const [jm] of POKYNY) radekM('Ask: ' + jm, A, (x) => x.pokyny.indexOf(jm) !== -1, '');
  const rc = opakovane(C.map((x) => x.text), 0.3), ra = opakovane(A.map((x) => x.text), 0.3);
  const modely = {}; C.concat(A).forEach((x) => { modely[x.model] = (modely[x.model] || 0) + 1; });
  return { tabulka: '| vstup → výstup | vše | sol | opus | poznámka |\n|---|---|---|---|---|\n' + out.join('\n'), varovani: var_, rc, ra, modely, n: C.length, na: A.length };
}
const TABULKA = path.join(ROOT, 'docs', 'monitor', 'ozveny.md');
// 2026-10-06: --nove čte značku „<!-- do: … -->“ z poslední sekce tabulky — stav žije v tabulce samé, ne v dalším souboru (§20).
function posledniZnacka() {
  if (!fs.existsSync(TABULKA)) return null;
  const m = fs.readFileSync(TABULKA, 'utf8').match(/<!-- do: ([^>]+?) -->/g);
  return m ? m[m.length - 1].replace(/^<!-- do: | -->$/g, '') : null;
}
function nacti() {
  const soubor = arg('--soubor');
  let src;
  if (soubor) src = fs.readFileSync(soubor, 'utf8');
  else {
    const znacka = process.argv.includes('--nove') ? posledniZnacka() : null;
    const od = arg('--od') || new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    const kde = znacka ? "drawn_at > '" + znacka.replace(/'/g, '') + "'" : "drawn_at >= '" + od.replace(/'/g, '') + "'";
    const sql = "select id, drawn_at, lang, rune_name, area, aol, short_text, follow_up, prompt_draws, prompt_version, usage->>'model' as model from readings where " + kde + " order by drawn_at";
    src = cp.execSync('supabase db query --linked "' + sql.replace(/"/g, '\\"') + '"', { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  }
  const j = JSON.parse(src.slice(src.search(/[\[{]/)));
  return Array.isArray(j) ? j : j.rows;
}
function vypis(S2, nadpis, doZnacka) {
  let md = '\n## ' + nadpis + '\n\nČtení ' + S2.n + ' · Asků ' + S2.na + ' · modely: ' + Object.entries(S2.modely).map(([m, c]) => m + ' ' + c).join(', ') + '\n\n' + S2.tabulka + '\n';
  if (S2.rc.length) md += '\nOpakované fráze ve čteních (≥ 30 %): ' + S2.rc.map(([t, c]) => '„' + t + '“ ' + c).join(' · ') + '\n';
  if (S2.ra.length) md += 'Opakované fráze v Ascích (≥ 30 %): ' + S2.ra.map(([t, c]) => '„' + t + '“ ' + c).join(' · ') + '\n';
  md += S2.varovani.length ? '\n**⚠ Upozornit ownera:** ' + S2.varovani.join(' · ') + '\n' : '\nBez varování.\n';
  if (doZnacka) md += '<!-- do: ' + doZnacka + ' -->\n';
  return md;
}

if (process.argv.includes('--test')) {
  // Smyšlená čtení se ZNÁMÝMI ozvěnami (repo je veřejné, skutečná čtení sem nepatří). Kontrola musí každou poznat a nic si nevymyslet.
  const hag = RUNES.find((r) => r.n === 'Hagalaz');
  const ai = AREAS.en.indexOf('Family & Home');
  const face = FACES[ai][2].en[0];   // „the generations before and after“
  const rows = [0, 1, 2].map((i) => ({ lang: 'en', rune_name: 'Hagalaz', area: 'Family & Home', aol: 'Family & Home', model: 'gpt-6-sol',
    prompt_draws: { image: 'The river swells overnight and takes with it whatever stood too near the bank', kws: 'disruption', area_face: 2, angle: 0 },
    short_text: 'The river swells overnight and takes with it whatever stood too near the bank. Hagalaz names disruption that no one chose. '
      + 'It touches ' + face + ' alike. What stands now?',
    follow_up: [{ q: 'How does my life rune Isa show itself in this picture?', a: 'Isa is the stillness in this picture. Algiz is the rune drawn here, and the rune does not say which.' }] }));
  rows.push({ lang: 'en', rune_name: 'Fehu', area: 'Inner Growth', aol: 'Inner Growth', model: 'claude-opus-5',
    prompt_draws: { image: 'The milk spills over the brim of the pail', kws: 'wealth', area_face: 0, angle: 1 },
    short_text: 'A pail overflows in the byre. Fehu counts what can be shared. What will you pass on?', follow_up: [] });
  const X = souhrn(rozber(rows));
  let fail = 0;
  const ok = (c, m) => { if (c) console.log('OK    ' + m); else { fail++; console.log('FAIL  ' + m); } };
  const t = X.tabulka;
  ok(/obraz opsán[^|]*\| 3\/4/.test(t), 'obraz opsaný doslova poznán 3/4');
  ok(/význam z hlavičky doslova v textu \| 3\/4/.test(t), 'holé slovo významu poznáno 3/4');
  ok(/nejčastější sloveso po jménu runy \(names\) \| 3\/4 \| 3\/3 \| 0\/1 \| names 3, counts 1/.test(t), 'sloveso „names“ 3/4 (sol 3/3, opus 0/1) a „counts“ 1');
  ok(/podoba oblasti opsaná[^|]*\| 3\/4/.test(t) && t.indexOf('generations before and after') !== -1, 'podoba oblasti opsaná poznána 3/4 i s frází');
  ok(/slova otázky zopakovaná \| 3\/3 \| 3\/3 \| — \| „in this picture“/.test(t), 'Ask: fráze z otázky „in this picture“ 3/3 (sol 3/3)');
  ok(/„drawn“[^|]*\| 3\/3/.test(t) && /does not say“ \| 3\/3/.test(t), 'Ask: ozvěny „drawn“ a „does not say“ 3/3');
  ok(X.varovani.length >= 5 && X.varovani.every((v) => v.indexOf('⚠') === -1), 'varování vznikla (≥ 5) a nesou čísla');
  ok(!/kuky|isa is/.test(JSON.stringify(X.rc).toLowerCase()), 'opakované fráze bez jmen');
  if (fail) { console.log('\n' + fail + ' selhalo'); process.exit(1); }
  console.log('\nOK    monitor ozvěn: obraz, význam, sloveso, podoba oblasti, otázka Asku a ozvěny pokynů poznány na smyšlených čteních');
  process.exit(0);
}
const rows = nacti();
const znacka = process.argv.includes('--nove') ? posledniZnacka() : null;
if (!rows.length) { console.log('Žádná nová čtení' + (znacka ? ' od ' + znacka : '') + ' — nic se nepřipisuje.'); process.exit(0); }
const posl = rows.map((r) => String(r.drawn_at || '')).sort().pop();
const od = znacka ? 'po ' + znacka.slice(0, 16) : (arg('--od') || '(soubor)');
const X = souhrn(rozber(rows));
const md = vypis(X, new Date().toISOString().slice(0, 10) + ' · čtení ' + od + ' → ' + posl.slice(0, 16), arg('--soubor') ? null : posl);
console.log(md);
if (process.argv.includes('--zapis')) {
  if (!fs.existsSync(TABULKA)) fs.writeFileSync(TABULKA, '# Monitor ozvěn — co z promptu se vrací doslova ve výstupu\n\nPíše `scripts/monitor_ozveny.js --zapis` (CODE-tune). Proč a co se měří: hlavička skriptu. ⚠ = ve ≥ 50 % případů (n ≥ 3).\n');
  fs.appendFileSync(TABULKA, md);
}
