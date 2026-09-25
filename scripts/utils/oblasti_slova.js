// Slova oblastí — která slova se v čteních dané oblasti (AREA) opakují a jinde ne.
// KUKY 2026-09-24 (bod 5): „některá slova, co z oblasti vychází, se opakují. Bylo by dobré je sledovat a tím
// zjistit, jak moc se opakují, a mít základ toho, kde co rozšířit." Tohle je to sledování.
//
// Metoda: pro každou oblast podíl čtení TÉ oblasti, ve kterých slovo stojí, proti podílu čtení OSTATNÍCH oblastí.
// Slovo, které je časté jen v jedné oblasti, je „slovo oblasti". Počítá se výskyt v čtení (ano/ne), ne počet.
// Jen single čtení s oblastí (spready mají area = 'spread'). Data jdou z produkční DB přes Supabase CLI.
//
// První měření 2026-09-24 (EN, prompty v4.39+, 7–10 čtení na oblast): Career „work" 7/7 a „making" 6/7,
// Love „between" 8/8, Healing „mending" 6/10 a „rest" 8/10, Purpose „going" 6/9 — všechno slova, která stojí
// v promptu DVAKRÁT (popis oblasti `_domainContext` + cíl mostu, tehdy `BRIDGE_AREAS`). Od 2026-09-25 se oblast losuje z podob (`AREA_FACES`).
//
// Spuštění (z kořene repa):  node scripts/utils/oblasti_slova.js [--od v4.47]
//   --od vX.Y  … jen čtení s prompt_version od téhle verze (bez parametru v4.39, od kdy platí dnešní stavba čtení)
const { execSync } = require('child_process');
const arg = process.argv.indexOf('--od');
const OD = arg !== -1 ? process.argv[arg + 1] : 'v4.39';
const SQL = "select lang, area, prompt_version, short_text from readings " +
            "where area is not null and area not in ('spread','gathering','') and short_text is not null";
const raw = execSync('supabase db query --linked "' + SQL + '"', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64e6 });
const rows = JSON.parse(raw.slice(raw.indexOf('{'))).rows;

const AREAS = {
  en: ['Love & Relationships', 'Purpose & Path', 'Career & Creativity', 'Healing & Wellbeing', 'The Unseen', 'Family & Home', 'Inner Growth', 'Crossroads & Decisions'],
  is: ['Ást & Sambönd', 'Tilgangur & Leið', 'Starf & Sköpun', 'Heilun & Líðan', 'Hið dulda', 'Fjölskylda & Heimili', 'Innri Vöxtur', 'Vegamót & Ákvarðanir'],
};
// Funkční slova se nepočítají — nenesou oblast. Jméno testera (Kuky) taky ne.
const STOP = {
  en: new Set(('the a an and or of to in on at by for with from as is are was be been it its this that these those you your yours ' +
    'what which who not no but if so than then there here into out up down over under one two may might can could would will do ' +
    'does did has have had just only still where when while all some any each more most kuky their them they he she his her ' +
    'i me my we our us rune').split(/\s+/)),
  is: new Set(('og að í á er sem en það við um af til með frá þú þig þér þín þinn þitt þinni þínu þínum hann hún hán þau þeir ' +
    'ekki eða ef svo þá hvað hver hvort sig sér sín sínu nú enn þegar þar hér eitt einn ein eins fyrir undir yfir inn út upp ' +
    'niður gæti getur verið vera var hefur hafa kuky rúnin rúnar').split(/\s+/)),
};
const ver = v => { const m = /^v(\d+)\.(\d+)/.exec(v || ''); return m ? (+m[1]) * 1000 + (+m[2]) : 0; };
const slova = (t, l) => new Set((String(t).toLowerCase().match(/[a-záðéíóúýþæö][a-záðéíóúýþæö'-]+/g) || [])
  .map(w => w.replace(/'s$/, '')).filter(w => w.length > 2 && !STOP[l].has(w)));

for (const l of ['en', 'is']) {
  // Oblast bývá v DB uložená v jazyce formuláře, ne v jazyce čtení (IS čtení s „Love & Relationships" a naopak),
  // proto se páruje podle POŘADÍ oblasti v obou seznamech, ne podle štítku.
  const idx = a => { const i = AREAS.en.indexOf(a); return i !== -1 ? i : AREAS.is.indexOf(a); };
  const vzorek = rows.filter(r => r.lang === l && idx(r.area) !== -1 && ver(r.prompt_version) >= ver(OD));
  console.log('\n######## ' + l.toUpperCase() + ' · prompt od ' + OD + ' · ' + vzorek.length + ' čtení');
  const per = {};
  vzorek.forEach(r => { const a = AREAS[l][idx(r.area)]; (per[a] = per[a] || []).push(slova(r.short_text, l)); });
  for (const a of AREAS[l]) {
    const tady = per[a] || [];
    if (tady.length < 3) { console.log(a + ' [' + tady.length + ']: málo čtení'); continue; }
    const jinde = AREAS[l].filter(x => x !== a).flatMap(x => per[x] || []);
    const df = {};
    tady.forEach(s => s.forEach(w => { df[w] = (df[w] || 0) + 1; }));
    const out = Object.keys(df).map(w => ({ w, n: df[w], tu: df[w] / tady.length,
      ji: jinde.length ? jinde.filter(s => s.has(w)).length / jinde.length : 0 }))
      .filter(x => x.n >= 2 && x.tu >= 0.25 && x.tu >= 2 * x.ji + 0.1)
      .sort((x, y) => (y.tu - y.ji) - (x.tu - x.ji)).slice(0, 6);
    console.log(a + ' [' + tady.length + ']: ' + (out.map(x => x.w + ' ' + x.n + '/' + tady.length +
      ' (jinde ' + Math.round(x.ji * 100) + ' %)').join(' · ') || '—'));
  }
}
