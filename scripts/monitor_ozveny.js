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
//     opakované fráze · STEJNÝ ZAČÁTEK odpovědí na týž tip (první tři slova, jméno runy = [runa]; od 2026-10-06 — každé znění tipu
//     má na solu svůj stálý začátek, např. „[runa] does not say why this appears now“ 9/9, a trojice slov z otázky ho nevidí)
//   KDE (od 2026-10-06 večer): u každého vstupu, který se vrátil, VE KTERÉ VĚTĚ čtení stojí (1, 2, …, posl.) — owner: „informace
//     jako vstup jde do promptu většinou na nějaké místo, 1. věta, 2. věta“.
//   SLOVESO Z LOSU (v5.01): sol dostane do esenčního rámce „<Runa> <sloveso>“; řádek kontroluje, že ho převzal (záměr → ⚠ při < 80 %).
//   ODKUD: u opakované fráze a ozvěny pokynu najde, kde v PEVNÉM textu promptu stojí (přesně, nebo řádek s jejími plnovýznamovými
//     slovy), a jestli nepřišla ze vstupu toho čtení (obraz, oblast…) nebo u Asku z textu čtení. Pevný text se skládá ŽIVĚ
//     produkčními buildery (systémový prompt, prompt čtení opus/sol, prompt Asku) — mapa promptu je snímek, builder je vždy aktuální.
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
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} } };
S.window = S; S.globalThis = S; vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-character.js', 'runar-utils.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
const G = (n) => vm.runInContext(n, S);
const RUNES = G('RUNES'), AREAS = G('AREAS'), FACES = G('AREA_FACES');
const ANG = { en: G('READING_ANGLES'), is: G('READING_ANGLES_IS') };
const END = { en: { heavy: G('ENDING_HEAVY'), open: G('ENDING_OPEN') }, is: { heavy: G('ENDING_HEAVY_IS'), open: G('ENDING_OPEN_IS') } };

const arg = (k) => { const i = process.argv.indexOf(k); return i !== -1 ? process.argv[i + 1] : null; };
// Tipy Asku z UI_TEXT (EN i IS): otázka se přiřadí k šabloně, {rune}/{life}/{area} = cokoli. Zdroj znění = translations (§20).
const UI = G('UI_TEXT');
const _esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const SABLONY = [];
for (const L of ['en', 'is']) for (const k of Object.keys(UI[L] || {}).filter((k) => /^ask_h_/.test(k))) {
  const t = UI[L][k]; if (typeof t !== 'string') continue;
  const kusy = t.replace(/[?.]\s*$/, '').split(/\{(?:rune|life|area)\}/).map(_esc);
  SABLONY.push({ k, re: new RegExp('^\\s*' + kusy.join('(.+?)') + '\\s*[?.]?\\s*$', 'i') });
}
const JMENA_RUN = new Set(RUNES.flatMap((r) => [r.n, String(r.is_n || '').replace(/\s*\(.*$/, '')]).filter(Boolean).map((x) => x.toLowerCase()));
function zacatek(a) {   // první tři slova odpovědi; oslovení jménem pryč, jméno runy = [runa], jiné jméno → null (repo je veřejné)
  const s = String(a).trim().replace(/^[A-ZÁÐÉÍÓÚÝÞÆÖ][a-záðéíóúýþæö]+,\s+/, '');
  const w = s.split(/\s+/).slice(0, 3).map((x) => x.replace(/[’']s$/, '').replace(/[^A-Za-záðéíóúýþæöÁÐÉÍÓÚÝÞÆÖ']/g, ''));
  if (w.length < 3) return null;
  const out = [];
  for (let i = 0; i < w.length; i++) {
    const x = w[i]; if (!x) return null;
    if (JMENA_RUN.has(x.toLowerCase())) { out.push('[runa]'); continue; }
    if (i > 0 && x !== x.toLowerCase()) return null;
    out.push(x.toLowerCase());
  }
  return out.join(' ');
}
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
const vetyTextu = (t) => String(t || '').split(/(?<=[.!?])\s+/).map((v) => v.trim()).filter(Boolean);
function kdeVeta(t, kus) {   // ve které větě textu stojí úsek „kus“: '1', '2', … ; poslední věta = 'posl.'
  if (!kus) return null;
  const v = vetyTextu(t), k = ' ' + slova(kus).join(' ') + ' ';
  for (let i = 0; i < v.length; i++) if ((' ' + slova(v[i]).join(' ') + ' ').indexOf(k) !== -1) return (i === v.length - 1 && i > 0) ? 'posl.' : String(i + 1);
  return null;
}
const rozlozeni = (kdes) => { const c = {}; kdes.filter(Boolean).forEach((k) => { c[k] = (c[k] || 0) + 1; });
  const e = Object.entries(c).sort((a, b) => (a[0] === 'posl.') - (b[0] === 'posl.') || a[0] - b[0]);
  return e.length ? 'věta ' + e.map(([k, n]) => k + ': ' + n).join(' · ') : ''; };
const SLOVESA_LOS = (() => { try { return G('ESSENCE_VERBS_SOL'); } catch (e) { return []; } })();
// ODKUD: pevný text promptu po řádcích, složený produkčními buildery (vzorek čtení přes runy, oblasti, hledání; opus i sol).
const kmen = (w) => (w.length > 3 ? w.replace(/(ing|ed|es|s|e)$/, '') : w);
let _bloky = null;
function bloky() {
  if (_bloky) return _bloky;
  const out = [], vid = new Set(), SK = G('SEEKS');
  const pridej = (druh, text) => { let sek = '';
    String(text || '').split('\n').forEach((r) => { const t = r.trim(); if (!t) return;
      if (/^[A-ZÁÐÉÍÓÚÝÞÆÖ &—,:-]{6,}$/.test(t)) { sek = t; return; }   // nadpis sekce systémového promptu
      const w = slova(t); if (w.length < 4) return; const k = w.join(' '); if (vid.has(druh + k)) return; vid.add(druh + k);
      out.push({ druh, sek, text: t, norm: ' ' + k + ' ', kmeny: new Set(w.map(kmen)) }); }); };
  for (const L of ['en', 'is']) {
    pridej('čtení', S.buildSysPrompt(null, L)); pridej('ask', S.buildSysPrompt(null, L));
    for (const eng of ['opus', 'sol']) {
      vm.runInContext('READ_ENGINE = "' + eng + '"; lang = "' + L + '";', S);
      for (let i = 0; i < 8; i++)
        pridej('čtení', S.buildReadingPrompt({ name: 'Anna', area: AREAS[L][i % AREAS[L].length], seeking: SK[L][i % SK[L].length], question: '', intention: '' }, RUNES[(i * 5) % 24], L, []));
    }
    vm.runInContext('READ_ENGINE = "opus";', S);
    pridej('ask', S.buildAskPrompt('READING TEXT.', 'QUESTION TEXT?', 'Fehu', L, [], RUNES[10],
      { area: AREAS[L][1], intention: '', seeking: SK[L][2], question: '' }, { mode: 'single', runy: ['Fehu'] }, 'wealth', []));
  }
  _bloky = out; return out;
}
function odkud(fraze, druh, klic) {   // kde v pevném textu promptu fráze stojí: přesně, nebo řádky se všemi jejími plnovýznamovými slovy
  const B = bloky().filter((b) => b.druh === druh), fw = slova(fraze), f = ' ' + fw.join(' ') + ' ';
  const vse = [...new Set(fw.map(kmen))];
  // úryvek kolem nalezeného místa — začátek řádku by často neukázal, proč tam ten řádek je
  const uryvek = (b, kmeny) => { const words = b.text.split(/\s+/); let i = words.findIndex((x) => kmeny.includes(kmen(slova(x)[0] || '')));
    if (i < 0) i = 0; const a = Math.max(0, i - 4); return (b.sek ? b.sek + ' › ' : '') + (a > 0 ? '…' : '') + words.slice(a, a + 12).join(' ') + '…'; };
  const fmt = (xs, kmeny) => xs.slice(0, 2).map((b) => '„' + uryvek(b, kmeny) + '“').join(' · ') + (xs.length > 2 ? ' (+' + (xs.length - 2) + ')' : '');
  const poradi = (xs) => xs.map((b) => [b, vse.filter((x) => b.kmeny.has(x)).length]).sort((a, b) => b[1] - a[1]).map(([b]) => b);
  const presne = B.filter((b) => b.norm.indexOf(f) !== -1);
  if (presne.length) return 'v promptu přesně: ' + fmt(presne, fw.map(kmen));
  const w = (klic || fw.filter((x) => !STOP.has(x) && !JMENA_RUN.has(x) && x.length > 2)).map(kmen);
  if (!w.length) return '';
  const sdili = poradi(B.filter((b) => w.every((x) => b.kmeny.has(x))));
  return sdili.length ? 'v promptu slova „' + w.join(', ') + '“: ' + fmt(sdili, w) : 'v promptu není → zvyk modelu (nebo vstup, který monitor nezná)';
}
// Otázka runy = 4. odstavec popisu runy v Kolekci (UI_TEXT[lang].coll_rune), za dvojtečkou — týž výřez jako _runeQuestion.
function otazkaRuny(runa, L) {
  const o = (UI[L] && UI[L].coll_rune && UI[L].coll_rune[runa]) || [];
  const p = Array.isArray(o) ? String(o[3] || '') : '';
  const i = p.indexOf(':');
  return (i !== -1 ? p.slice(i + 1) : p).trim();
}
function telo(t) { let b = String(t || ''); try { const j = JSON.parse(b.slice(b.indexOf('['), b.lastIndexOf(']') + 1)); b = j.map((x) => x.text).join(' '); } catch (e) {} return b.split('✦')[0].trim(); }
function sloveso(text, runa) {
  const m = text.match(new RegExp('\\b' + runa + "(?:’s|'s)?\\s+(\\w+)(?:\\s+(of|as|to))?", 'i'));
  return m ? (m[1] + (m[2] ? ' ' + m[2] : '')).toLowerCase() : '';
}
// Třetí položka = plnovýznamová slova, podle kterých „odkud“ hledá řádek promptu, na který ozvěna odpovídá.
const POKYNY = [
  ['„drawn“ (runa tažená / netažená)', /\bdrawn here\b|\brune drawn\b|\bwas not drawn\b|\bnot (one of|among) the runes\b|\bwas cast here\b|\bonly [A-Z][a-z]+ was (drawn|cast)\b/i, ['drawn']],
  ['„the rune / reading does not say“', /\b(the )?(rune|runes|reading|picture|image) (does|do) not (say|tell|decide|settle|show)\b/i, ['say']],
  ['„leaves … open“', /\bleaves? (that|it|this|the [a-z]+|room for)? ?(question )?open\b|\bleaves room for\b/i, ['leave', 'open']],
  ['„not a promise / verdict / sign“', /\bnot a (promise|verdict|prediction|sign|warning)\b/i, ['promise']],
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
      const vstupy = [];
      if (d.image) { x.obraz = nejdelsiShoda(d.image, t); x.obraz.kde = x.obraz.n >= 4 ? kdeVeta(t, x.obraz.kus) : null; vstupy.push(d.image); }
      if (d.kws && d.kws.indexOf(',') === -1) {
        x.aspekt = new RegExp('\\b' + d.kws.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i').test(t);
        x.aspektKde = x.aspekt ? kdeVeta(t, d.kws) : null;
      }
      x.sloveso = sloveso(t, r.rune_name);
      if (d.verb !== undefined && SLOVESA_LOS[d.verb]) {   // v5.01: sol dostal sloveso losem — převzal ho hned za jménem runy?
        const v = SLOVESA_LOS[d.verb];
        x.los = { v, ok: new RegExp('\\b' + r.rune_name + "(?:’s|'s)?\\s+" + v.replace(/ /g, '\\s+') + '\\b', 'i').test(t) };
        x.los.kde = x.los.ok ? kdeVeta(t, r.rune_name + ' ' + v) : null;
      }
      const ai = Math.max(AREAS.en.indexOf(r.aol || r.area), AREAS.is.indexOf(r.aol || r.area));
      if (ai >= 0 && d.area_face !== undefined && FACES[ai] && FACES[ai][d.area_face]) {
        const f = FACES[ai][d.area_face][L] || [];
        const s = [nejdelsiShoda(f[0], t), nejdelsiShoda(f[1], t)].sort((a, b) => b.n - a.n)[0];
        s.kde = s.n >= 3 ? kdeVeta(t, s.kus) : null;
        x.oblast = s; vstupy.push(f[0], f[1]);
      }
      if (d.angle !== undefined && ANG[L][d.angle]) { x.uhel = nejdelsiShoda(ANG[L][d.angle], t); x.uhel.kde = x.uhel.n >= 4 ? kdeVeta(t, x.uhel.kus) : null; vstupy.push(ANG[L][d.angle]); }
      const em = String(d.ending || '').match(/^(heavy|open)(\d+)$/);
      if (em && END[L][em[1]][Number(em[2])]) { const et = END[L][em[1]][Number(em[2])]; x.konec = nejdelsiShoda(et, t); x.konec.kde = x.konec.n >= 4 ? kdeVeta(t, x.konec.kus) : null; vstupy.push(et); }
      // Otázka runy (_runeQuestion): jen single a jen bez vlastní otázky tazatele — tak ji dává builder (runar-character.js).
      // 2026-10-07 (v5.04): ani u konce ve tvaru otázky — tam ji builder od té doby nedává (_konecSOtazkouRuny). Starší čtení
      // (do v5.03) ji tam měla; rozlišuje se podle verze promptu, ať se starý opis nepřestane počítat jako opis ze vstupu.
      const v504 = /^v(\d+)\.(\d+)/.exec(r.prompt_version || ''), poV504 = v504 && (Number(v504[1]) * 100 + Number(v504[2]) >= 504);
      const oq = (r.question || (poV504 && /^(heavy|open)2$/.test(String(d.ending || '')))) ? '' : otazkaRuny(r.rune_name, L);
      if (oq) { x.otazka = nejdelsiShoda(oq, t); x.otazka.kde = x.otazka.n >= 3 ? kdeVeta(t, x.otazka.kus) : null; vstupy.push(oq); }
      x.vstupy = ' ' + slova(vstupy.join(' ')).join(' ') + ' ';
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
      let tip = null; for (const s of SABLONY) if (s.re.test(q)) { tip = s.k; break; }
      R.ask.push({ model: String((f.usage && f.usage.model) || model).replace('claude-', ''), ozvena, pokyny: POKYNY.filter(([, re]) => re.test(a)).map(([jm]) => jm), text: a, tip, zac: zacatek(a),
        cteni: ' ' + slova(telo(r.short_text)).join(' ') + ' ' });
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
  let _zamer = false;   // řádek „záměr“: vrátit se MÁ — varuje se obráceně, když se vrací v < 80 %
  let _info = false;    // řádek jen informuje, nevaruje (2026-10-07: návrat je v pořádku, owner ho potvrdil)
  const radek = (jm, a, n, pozn) => {
    const bunky = [p(a, n)].concat((_rozpad || []).map(([g, aa, nn]) => p(aa, nn)));
    const zlute = [[a, n, '']].concat((_rozpad || []).map(([g, aa, nn]) => [aa, nn, ' (' + g + ')'])).filter(([aa, nn]) => !_info && nn >= 3 && (_zamer ? aa / nn < 0.8 : aa / nn >= 0.5));
    _zamer = false; _info = false;
    zlute.forEach(([aa, nn, g]) => var_.push(jm + g + ' ' + p(aa, nn)));
    out.push('| ' + (zlute.length ? '⚠ ' : '') + jm + ' | ' + bunky.join(' | ') + ' | ' + (pozn || '') + ' |');
    _rozpad = null;
  };
  const radekM = (jm, kde, f, pozn) => {   // kde = pole záznamů, f = podmínka „vstup se vrátil“, počítá se jen kde je vstup známý
    _rozpad = SKUP.map(([g, je]) => { const xs = kde.filter(je); return [g, xs.filter(f).length, xs.length]; });
    radek(jm, kde.filter(f).length, kde.length, pozn);
  };
  const s = (f) => C.filter(f);
  radekM('obraz opsán (≥ 4 slova za sebou)', s((x) => x.obraz), (x) => x.obraz.n >= 4, rozlozeni(C.map((x) => x.obraz && x.obraz.kde)));
  // 2026-10-07: jen informuje — definiční věta jmenuje runu jejím významem záměrně (v5.01) a owner to pochválil (hlášení 4da5d566).
  _info = true;
  radekM('význam z hlavičky doslova v textu (definiční věta, záměr)', s((x) => x.aspekt !== undefined), (x) => x.aspekt === true, rozlozeni(C.map((x) => x.aspektKde)));
  if (C.some((x) => x.los)) {
    _zamer = true;
    radekM('sloveso z losu hned za jménem runy (záměr, v5.01)', s((x) => x.los), (x) => x.los.ok,
      rozlozeni(C.map((x) => x.los && x.los.kde)) + ' · ' + Object.entries(C.filter((x) => x.los).reduce((o, x) => { o[x.los.v] = (o[x.los.v] || 0) + 1; return o; }, {})).map(([k, n]) => k + ' ' + n).join(', '));
  }
  const sl = {}; C.forEach((x) => { if (x.sloveso) sl[x.sloveso] = (sl[x.sloveso] || 0) + 1; });
  const top = Object.entries(sl).sort((a, b) => b[1] - a[1]);
  radekM('nejčastější sloveso po jménu runy (' + (top.length ? top[0][0] : '—') + ')', C.filter((x) => x.sloveso), (x) => top.length && x.sloveso === top[0][0], top.slice(0, 4).map(([k, n]) => k + ' ' + n).join(', '));
  radekM('podoba oblasti opsaná (≥ 3 slova)', s((x) => x.oblast), (x) => x.oblast.n >= 3,
    [...new Set(s((x) => x.oblast && x.oblast.n >= 3).map((x) => '„' + x.oblast.kus + '“'))].slice(0, 3).join(' · ') + ' ' + rozlozeni(C.map((x) => x.oblast && x.oblast.kde)));
  radekM('otázka runy z Kolekce opsaná (≥ 3 slova)', s((x) => x.otazka), (x) => x.otazka.n >= 3,
    [...new Set(s((x) => x.otazka && x.otazka.n >= 3).map((x) => '„' + x.otazka.kus + '“'))].slice(0, 3).join(' · ') + ' ' + rozlozeni(C.map((x) => x.otazka && x.otazka.kde)));
  radekM('pokyn úhlu opsaný (≥ 4 slova)', s((x) => x.uhel), (x) => x.uhel.n >= 4, rozlozeni(C.map((x) => x.uhel && x.uhel.kde)));
  radekM('pokyn konce opsaný (≥ 4 slova)', s((x) => x.konec), (x) => x.konec.n >= 4, rozlozeni(C.map((x) => x.konec && x.konec.kde)));
  radekM('Ask: slova otázky zopakovaná', A, (x) => !!x.ozvena,
    [...new Set(A.filter((x) => x.ozvena).map((x) => '„' + x.ozvena + '“'))].slice(0, 3).join(' · '));
  for (const [jm] of POKYNY) radekM('Ask: ' + jm, A, (x) => x.pokyny.indexOf(jm) !== -1, '');
  // Stejný začátek na týž tip: řádek jen tam, kde se nějaký začátek opakuje (≥ 2) a tip má n ≥ 3.
  const poTipu = {};
  A.forEach((x) => { if (x.tip) (poTipu[x.tip] = poTipu[x.tip] || []).push(x); });
  for (const [tip, xs] of Object.entries(poTipu).sort((a, b) => b[1].length - a[1].length)) {
    const c = {}; xs.forEach((x) => { if (x.zac) c[x.zac] = (c[x.zac] || 0) + 1; });
    const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
    if (xs.length < 3 || !top || top[1] < 2) continue;
    radekM('Ask ' + tip + ': stejný začátek „' + top[0] + '…“', xs, (x) => x.zac === top[0], '');
  }
  const rc = opakovane(C.map((x) => x.text), 0.3), ra = opakovane(A.map((x) => x.text), 0.3);
  const modely = {}; C.concat(A).forEach((x) => { modely[x.model] = (modely[x.model] || 0) + 1; });
  // ODKUD: u každé opakované fráze napřed vstup toho čtení (u Asku text čtení), pak pevný text promptu.
  const zdroje = [];
  const zVstupu = (fr, xs, pole) => { const f = ' ' + slova(fr).join(' ') + ' '; return xs.filter((x) => (x[pole] || '').indexOf(f) !== -1).length; };
  const spolu = (v, kde, o) => v ? kde + ' ' + v + '×' + (/^v promptu (přesně|slova)/.test(o) ? ' · ' + o : '') : (o || 'jen výplňová slova');
  for (const [fr, n] of rc) zdroje.push('„' + fr + '“ ve čteních ' + n + '× — ' + spolu(zVstupu(fr, C, 'vstupy'), 'ze vstupu toho čtení', odkud(fr, 'čtení')));
  for (const [fr, n] of ra) zdroje.push('„' + fr + '“ v Ascích ' + n + '× — ' + spolu(zVstupu(fr, A, 'cteni'), 'z textu čtení', odkud(fr, 'ask')));
  for (const [jm, , klic] of POKYNY) { const n = A.filter((x) => x.pokyny.indexOf(jm) !== -1).length;
    if (n) zdroje.push('Ask ' + jm + ' ' + n + '× — ' + odkud(jm.replace(/[„“]/g, ''), 'ask', klic)); }
  return { tabulka: '| vstup → výstup | vše | sol | opus | poznámka |\n|---|---|---|---|---|\n' + out.join('\n'), varovani: var_, rc, ra, modely, n: C.length, na: A.length, zdroje };
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
    // 2026-10-07: + question — bez ní monitor bral otázku runy jako vstup i u čtení s vlastní otázkou (builder ji tam nedává).
    const sql = "select id, drawn_at, lang, rune_name, area, aol, question, short_text, follow_up, prompt_draws, prompt_version, usage->>'model' as model from readings where " + kde + " order by drawn_at";
    src = cp.execSync('supabase db query --linked "' + sql.replace(/"/g, '\\"') + '"', { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  }
  const j = JSON.parse(src.slice(src.search(/[\[{]/)));
  return Array.isArray(j) ? j : j.rows;
}
function vypis(S2, nadpis, doZnacka) {
  let md = '\n## ' + nadpis + '\n\nČtení ' + S2.n + ' · Asků ' + S2.na + ' · modely: ' + Object.entries(S2.modely).map(([m, c]) => m + ' ' + c).join(', ') + '\n\n' + S2.tabulka + '\n';
  if (S2.rc.length) md += '\nOpakované fráze ve čteních (≥ 30 %): ' + S2.rc.map(([t, c]) => '„' + t + '“ ' + c).join(' · ') + '\n';
  if (S2.ra.length) md += 'Opakované fráze v Ascích (≥ 30 %): ' + S2.ra.map(([t, c]) => '„' + t + '“ ' + c).join(' · ') + '\n';
  if (S2.zdroje && S2.zdroje.length) md += '\n**Odkud se to bere** (vstup čtení / text čtení / pevný text promptu podle živých builderů):\n' + S2.zdroje.map((z) => '- ' + z).join('\n') + '\n';
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
  ok(/význam z hlavičky doslova v textu \(definiční věta, záměr\) \| 3\/4/.test(t) && !/⚠ význam z hlavičky/.test(t), 'holé slovo významu poznáno 3/4, bez varování (záměr od v5.01)');
  ok(/nejčastější sloveso po jménu runy \(names\) \| 3\/4 \| 3\/3 \| 0\/1 \| names 3, counts 1/.test(t), 'sloveso „names“ 3/4 (sol 3/3, opus 0/1) a „counts“ 1');
  ok(/podoba oblasti opsaná[^|]*\| 3\/4/.test(t) && t.indexOf('generations before and after') !== -1, 'podoba oblasti opsaná poznána 3/4 i s frází');
  ok(/slova otázky zopakovaná \| 3\/3 \| 3\/3 \| — \| „in this picture“/.test(t), 'Ask: fráze z otázky „in this picture“ 3/3 (sol 3/3)');
  ok(/„drawn“[^|]*\| 3\/3/.test(t) && /does not say“ \| 3\/3/.test(t), 'Ask: ozvěny „drawn“ a „does not say“ 3/3');
  ok(X.varovani.length >= 5 && X.varovani.every((v) => v.indexOf('⚠') === -1), 'varování vznikla (≥ 5) a nesou čísla');
  ok(!/kuky|isa is/.test(JSON.stringify(X.rc).toLowerCase()), 'opakované fráze bez jmen');
  // 2026-10-06: stejný začátek na týž tip — tři odpovědi na „What am I not seeing here?“, dvě začnou stejně (jméno runy se liší),
  // jedna jinak; oslovení jménem na začátku se nesmí dostat do tabulky. (Do večera 2026-10-06 tu stál tip „Why is this showing
  // up now?“ — owner ho odstranil, šablona z UI_TEXT zmizela a test by tiše přestal nic měřit.)
  const rowsT = ['Hagalaz', 'Algiz', 'Sowilo'].map((n, i) => ({ lang: 'en', rune_name: n, area: 'spread', model: 'gpt-6-sol',
    follow_up: [{ q: 'What am I not seeing here?', a: [n + ' does not show what is hidden.', 'Kuky, ' + n + ' does not say more.', 'The moment holds still.'][i] }] }));
  const T = souhrn(rozber(rowsT)).tabulka;
  ok(/⚠ Ask ask_h_unseen: stejný začátek „\[runa\] does not…“ \| 2\/3/.test(T) && !/kuky/i.test(T), 'Ask: stejný začátek na týž tip 2/3 (jméno runy jako [runa], oslovení pryč)');
  // 2026-10-06 večer: KDE — obraz stojí v 1. větě všech tří čtení Hagalazu; ODKUD — „does not say“ v Asku najde řádek promptu Asku
  // se slovem „say“ (pravidla „…say what the runes of this reading…“), ne prompt čtení.
  ok(/obraz opsán[^\n]*věta 1: 3/.test(t), 'KDE: obraz opsaný v 1. větě 3×');
  // 2026-10-07 (v5.03, DECISIONS 2026-10-07 (1)): pravidla Asku už „say what the runes of this reading…“ nemají — ODKUD teď najde jen
  // slabší řádky se „say“. Test hlídá obojí: zdroj se pořád najde v promptu Asku a odkaz na smazané pravidlo nevznikne.
  ok(X.zdroje.some((z) => /does not say“ 3× — v promptu slova „say“: /i.test(z)) && !X.zdroje.some((z) => /say what the runes/i.test(z)),
     'ODKUD: „does not say“ → řádek promptu Asku se slovem „say“ (od v5.03 bez „say what the runes…“)');
  // Sloveso z losu (v5.01): tři čtení solu, dvě sloveso převzala, jedno ne → 2/3 < 80 % → ⚠ (záměr nevyšel). Třetí věta sloveso
  // MÁ, ale ne za jménem runy — počítat se smí jen „<Runa> <sloveso>“ (mutace „sloveso kdekoli v textu“ musí test shodit).
  const iv = SLOVESA_LOS.indexOf('represents');
  const rowsS = ['Hagalaz represents disruption no one chose.', 'Hagalaz represents what breaks.', 'Hagalaz names what the storm represents.'].map((tx) => ({
    lang: 'en', rune_name: 'Hagalaz', area: 'Inner Growth', aol: 'Inner Growth', model: 'gpt-6-sol', prompt_draws: { verb: iv },
    short_text: 'The hail comes down on the barley. ' + tx + ' What still stands?', follow_up: [] }));
  const TS = souhrn(rozber(rowsS));
  ok(iv >= 0 && /⚠ sloveso z losu hned za jménem runy \(záměr, v5\.01\) \| 2\/3[^\n]*věta 2: 2[^\n]*represents 3/.test(TS.tabulka), 'sloveso z losu 2/3 → ⚠ (záměr pod 80 %), ve 2. větě');
  // …a obráceně: převzal 3/3 → žádné ⚠ (u běžného řádku by 3/3 varovalo — tady je návrat ZÁMĚR).
  const TS3 = souhrn(rozber(rowsS.slice(0, 2).concat([Object.assign({}, rowsS[0])])));
  ok(/\| sloveso z losu hned za jménem runy \(záměr, v5\.01\) \| 3\/3/.test(TS3.tabulka) && !/⚠ sloveso z losu/.test(TS3.tabulka), 'sloveso z losu 3/3 → bez ⚠ (záměr splněn)');
  // 2026-10-06: otázka runy z Kolekce — Thurisaz ji má („…you do not strike back?“); čtení bez vlastní otázky ji opíše v poslední větě,
  // čtení S vlastní otázkou ji v promptu nemá → nepočítá se. Opakovaná fráze z ní se přiřadí ke vstupu, ne ke zvyku modelu.
  const oqT = otazkaRuny('Thurisaz', 'en');
  const rowsQ = [0, 1, 2].map((i) => ({ lang: 'en', rune_name: 'Thurisaz', area: 'Inner Growth', aol: 'Inner Growth', model: 'gpt-6-sol', question: i === 2 ? 'Should I go?' : '',
    prompt_draws: {}, short_text: 'A thorn holds your sleeve at the edge. Thurisaz represents caution. What appears if you do not strike back?', follow_up: [] }));
  const XQ = souhrn(rozber(rowsQ));
  // 2026-10-07 (v5.04): konec ve tvaru otázky otázku runy nedostává → u čtení z v5.04+ s koncem [2] se nepočítá; starší ano.
  const rowsQ2 = [rowsQ[0], Object.assign({}, rowsQ[1], { prompt_version: 'v5.04-x', prompt_draws: { ending: 'heavy2' } })];
  const XQ2 = souhrn(rozber(rowsQ2));
  ok(/otázka runy z Kolekce opsaná[^|]*\| 1\/1 /.test(XQ2.tabulka), 'otázka runy: čtení v5.04+ s koncem-otázkou se nepočítá (1/1)');
  ok(/do not strike back/.test(oqT) && /otázka runy z Kolekce opsaná[^|]*\| 2\/2 [^\n]*věta posl\.: 2/.test(XQ.tabulka), 'otázka runy: 2/2 (čtení s vlastní otázkou se nepočítá), v poslední větě');
  ok(XQ.zdroje.some((z) => /strike back[^\n]*ze vstupu toho čtení/.test(z)) && !XQ.zdroje.some((z) => /strike back[^\n]*zvyk modelu/.test(z)),
    'opakovaná fráze z otázky runy → „ze vstupu toho čtení“, ne zvyk modelu');
  if (fail) { console.log('\n' + fail + ' selhalo'); process.exit(1); }
  console.log('\nOK    monitor ozvěn: obraz, význam, sloveso (i z losu), podoba oblasti, otázka runy, otázka Asku, ozvěny pokynů, stejný začátek na týž tip, KDE a ODKUD poznány na smyšlených čteních');
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
