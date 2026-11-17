// runa_dne_knihovna.js — knihovna textů runy dne: doplní varianty, převezme texty z produkce, vypíše stav (CODE-tune 2026-11-17).
//
// Proč (owner 2026-11-17): „nebudeme je dělat pořád dokola voláním a generovat nové. vyrobíme jich několik a budeme je střídat …
// čtení jedné runy se nesmí opakovat … až pro jednu runu už dostane všech 5 variant, můžeme vygenerovat dalších 5, přečíst a upravit
// … můžeme teď udělat třeba jen 3 pro začátek“; „při dalším generování variant to má být bráno v potaz, ať se negenerují zase stejné“.
// Cena textu změřená v model_usage (5 run dne): 1 426 tokenů vstup, 114 výstup = $0,004. Knihovna stojí jednou, ne za každého člověka.
//
// Knihovna = supabase/functions/_shared/runa_dne_knihovna.mjs (jediné místo; claude-proxy ji importuje, oprava textu = diff v gitu).
// Záznam: id · runa · lang · rod (jen is: kk/kvk/hk — oslovení) · varianta (číslo v rámci runy a jazyka) · losy · verze · text · ok · zdroj.
// `ok: false` = ke kontrole; server dává jen `ok: true`. Islandština: Greynir + korpus před ok (CLAUDE.md §2), angličtinu čte owner.
// Varianta k je v islandštině TÁŽ ve všech třech rodech (stejné losy, jiné oslovení) — počítadlo člověka jde po variantách, ne po rodech.
// Pestrost: losy se táhnou PRODUKČNÍM builderem (buildDayRunePrompt, sáčky _seasonBagPick) a sáček runy se napřed zbaví poloh, které
// už v knihovně jsou — nová varianta nedostane tytéž páky, dokud jsou jiné volné.
//
//   node scripts/runa_dne_knihovna.js --stav                       počty variant po runách a jazycích (ok / ke kontrole)
//   node scripts/runa_dne_knihovna.js --z-produkce [--dry-run]     převezme dnešní texty z rune_day (bez text_id) jako varianty ke kontrole
//   node scripts/runa_dne_knihovna.js --dopln N [--runy A,B] [--dry-run]   doplní každou runu na N variant (en + is ve 3 rodech), přes API
//   API: hlídač chce RUNAR_API_ANO + RUNAR_API_ZAMER (nad 50 i RUNAR_API_OWNER) — počet volání vypíše --dry-run.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), os = require('os'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
const KNIHOVNA = path.join(ROOT, 'supabase', 'functions', '_shared', 'runa_dne_knihovna.mjs');
const ROD_IS = ['kk', 'kvk', 'hk'];
const args = process.argv.slice(2), arg = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const DRY = args.includes('--dry-run');

function nacti() {
  if (!fs.existsSync(KNIHOVNA)) return { _proc: 'Knihovna textů runy dne — generuje a doplňuje scripts/runa_dne_knihovna.js (hlavička tam). '
    + 'claude-proxy dává jen ok:true. Text opravuj tady; varianta k je v islandštině táž ve všech rodech.', texty: [] };
  const src = fs.readFileSync(KNIHOVNA, 'utf8');
  return JSON.parse(src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1));   // modul: export const KNIHOVNA = {…};
}
function uloz(k) {   // jeden záznam na řádek — diff v gitu ukáže opravu jednoho textu
  const radky = k.texty.map((t) => '  ' + JSON.stringify(t));
  fs.writeFileSync(KNIHOVNA, '// GENEROVANÉ A RUČNĚ OPRAVOVANÉ: knihovna textů runy dne — scripts/runa_dne_knihovna.js (hlavička tam). Text opravuj tady, řádek = záznam.\n'
    + 'export const KNIHOVNA = {\n "_proc": ' + JSON.stringify(k._proc) + ',\n "texty": [\n' + radky.join(',\n') + '\n ]\n};\n', 'utf8');
}
const idZaznamu = (t) => t.runa + '-' + t.varianta + '-' + t.lang + (t.rod ? '-' + t.rod : '');

function kontext() {
  const ls = new Map();
  const S = { console: { log() {}, warn() {}, error() {} },
    localStorage: { getItem: (k) => (ls.has(k) ? ls.get(k) : null), setItem: (k, v) => ls.set(k, String(v)), removeItem: (k) => ls.delete(k) } };
  vm.createContext(S);
  for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-character.js', 'runar-utils.js'])
    vm.runInContext(fs.readFileSync(path.join(ROOT, 'v2', f), 'utf8') + '\n;\n', S);
  S._ls = ls;
  S.RUNES = vm.runInContext('RUNES', S);   // const v configu není vlastnost kontextu
  return S;
}
function seeded(seed) { let x = (seed * 7919 + 104729) % 233280; return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; }; }

// Sáček runy bez poloh, které knihovna už má (owner: „ať se negenerují zase stejné“). Hodnoty losů → id v sáčku podle buildDayRunePrompt.
function zbavSackuPouzite(S, runa, lang, pouzite) {
  const L = lang === 'is' ? 'is' : 'en', RP = vm.runInContext('RP_DAY', S)[L], r = S.RUNES.find((x) => x.n === runa);
  const klice = String(RP.rcore(r) || '').split(',').map((x) => x.trim()).filter(Boolean);
  const slovesa = L === 'is' ? vm.runInContext('DAY_SLOVESA_IS', S) : vm.runInContext('ESSENCE_VERBS_SOL', S);
  const zac = vm.runInContext('DAY_ZACATEK', S)[L];
  const v = vm.runInContext('DAY_VYJIMKY', S)[runa] || {};
  const sady = {
    vyznam: [klice.map((x, i) => String(i)), (h) => String(klice.indexOf(h))],
    vstup: [(v.vstup || ['name', 'does', 'other']), (h) => h],
    sloveso: [slovesa.map((x, i) => String(i)), (h) => String(slovesa.indexOf(h))],
    cocka: [['missing', 'unseen', 'toomuch'], (h) => h],
    zamer: [['notice', 'think', 'tend'], (h) => h],
    zacatek: [zac.map((x, i) => String(i)), (h) => String(zac.indexOf(h))],
  };
  for (const [paka, [ids, naId]] of Object.entries(sady)) {
    const bez = new Set(pouzite.map((l) => l && l[paka] != null ? naId(l[paka]) : null).filter(Boolean));
    const zbyva = ids.filter((id) => !bez.has(id));
    S._ls.set('seasonbag_dne_' + runa + '_' + paka, JSON.stringify(zbyva.length ? zbyva : ids));
  }
}

function prompty(S, runa, lang, rod, seed) {
  vm.runInContext('Math.random = (' + seeded.toString() + ')(' + seed + '); userGender = ' + JSON.stringify(rod || 'hk')
    + '; lang = ' + JSON.stringify(lang) + ';', S);
  const r = S.RUNES.find((x) => x.n === runa);
  const prompt = S.buildDayRunePrompt(r, lang, []);
  return { prompt, sys: S.buildSysPrompt(null, lang), losy: S._dayLosy() };
}

async function sol(system, prompt, key, maxTokens) {
  for (let pokus = 0; pokus < 4; pokus++) {
    for (const eff of ['none', 'minimal']) {   // jako claude-proxy (SOL_EFFORTS)
      const res = await fetch('https://api.openai.com/v1/chat/completions', { method: 'POST',
        headers: { 'content-type': 'application/json', authorization: 'Bearer ' + key },
        body: JSON.stringify({ model: 'gpt-6-sol', reasoning_effort: eff, max_completion_tokens: maxTokens, prompt_cache_options: { mode: 'explicit' },
          messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }] }) });
      if (res.status === 400 && eff === 'none') continue;
      if (res.ok) { const d = await res.json(); return { text: String(d.choices[0].message.content || '').trim(), usage: d.usage }; }
      if (res.status === 429 || res.status >= 500) { await new Promise((r) => setTimeout(r, 2500 * (pokus + 1))); break; }
      throw new Error('sol ' + res.status + ' ' + (await res.text()).slice(0, 200));
    }
  }
  throw new Error('sol: 4 pokusy selhaly');
}

function stav(k) {
  const m = new Map();
  for (const t of k.texty) {
    const kl = t.runa + ' ' + t.lang;
    if (!m.has(kl)) m.set(kl, { ok: new Set(), kontrola: new Set() });
    m.get(kl)[t.ok ? 'ok' : 'kontrola'].add(t.varianta);
  }
  const S = kontext();
  for (const r of S.RUNES) for (const lang of ['en', 'is']) {
    const x = m.get(r.n + ' ' + lang) || { ok: new Set(), kontrola: new Set() };
    console.log((r.n + ' ' + lang).padEnd(14), 'ok', String(x.ok.size).padStart(2), '· ke kontrole', String(x.kontrola.size).padStart(2));
  }
  console.log('záznamů celkem', k.texty.length, '· ok', k.texty.filter((t) => t.ok).length);
}

(async () => {
  const k = nacti();
  if (args.includes('--stav')) return stav(k);

  if (args.includes('--z-produkce')) {
    // Texty runy dne, které lidé už dostali živě (rune_day bez text_id) → varianty ke kontrole. Jen čtení z DB (supabase CLI).
    const out = cp.execSync('supabase db query --linked "select d.rune, d.lang, d.text, d.draws, d.prompt_version, p.address_gender g '
      + 'from rune_day d left join user_profiles p on p.id = d.user_id order by d.created_at"', { cwd: ROOT, encoding: 'utf8' });   // text z knihovny se pozná shodou textu níž
    const rows = JSON.parse(out.slice(out.indexOf('{'))).rows;
    let n = 0;
    for (const r of rows) {
      if (k.texty.some((t) => t.text === r.text)) continue;
      const lang = r.lang === 'is' ? 'is' : 'en', rod = lang === 'is' ? (ROD_IS.includes(r.g) ? r.g : 'hk') : null;
      const varianta = 1 + Math.max(0, ...k.texty.filter((t) => t.runa === r.rune && t.lang === lang).map((t) => t.varianta));
      const t = { runa: r.rune, lang, rod, varianta, losy: r.draws || null, verze: r.prompt_version || null, text: r.text, ok: false, zdroj: 'zive' };
      t.id = idZaznamu(t); k.texty.push(t); n++;
      console.log('+', t.id, r.text.slice(0, 70).replace(/\n/g, ' '));
    }
    if (!DRY) uloz(k);
    return console.log((DRY ? '[dry-run] ' : '') + 'převzato ' + n);
  }

  const cil = Number(arg('--dopln'));
  if (!cil) { console.log('použití: --stav | --z-produkce | --dopln N [--runy A,B] [--dry-run]'); process.exit(1); }
  const S = kontext(), maxTokens = vm.runInContext('RUNAR_MODES', S).rune_day.max_tokens;
  const runy = arg('--runy') ? arg('--runy').split(',') : S.RUNES.map((r) => r.n);
  const ulohy = [];
  for (const runa of runy) for (const lang of ['en', 'is']) {
    const mam = k.texty.filter((t) => t.runa === runa && t.lang === lang);
    const varianty = new Set(mam.map((t) => t.varianta));
    zbavSackuPouzite(S, runa, lang, mam.map((t) => t.losy));
    let dalsi = 1 + Math.max(0, ...varianty);
    for (let i = varianty.size; i < cil; i++, dalsi++) {
      const seed = runa.length * 1000 + dalsi * 37 + (lang === 'is' ? 5 : 0);
      const pred = new Map(S._ls);                     // stav sáčků před losem — islandské rody dostanou TYTÉŽ losy
      const rody = lang === 'is' ? ROD_IS : [null];
      let po = null;
      for (const rod of rody) {
        S._ls.clear(); for (const [a, b] of pred) S._ls.set(a, b);
        const p = prompty(S, runa, lang, rod, seed);
        po = new Map(S._ls);
        ulohy.push({ runa, lang, rod, varianta: dalsi, ...p });
      }
      S._ls.clear(); for (const [a, b] of po) S._ls.set(a, b);   // další varianta táhne z vyprázdněnějšího sáčku
    }
  }
  console.log('volání:', ulohy.length, '· odhad $' + (ulohy.length * 0.004).toFixed(2));
  if (DRY && args.includes('--losy')) { for (const u of ulohy) console.log(u.runa, u.lang, u.rod || '', u.varianta, JSON.stringify(u.losy)); return; }
  if (DRY) { const u = ulohy[0]; if (u) console.log(JSON.stringify(u.losy) + '\n' + u.prompt.slice(0, 1200)); return; }
  const key = fs.readFileSync(path.join(os.homedir(), '.claude', 'runar-openai-key.txt'), 'utf8').trim();
  let i = 0, usd = 0;
  const verze = vm.runInContext('RUNAR_PROMPT_VERSION', S);
  async function pracovnik() {
    while (i < ulohy.length) {
      const u = ulohy[i++];
      const r = await sol(u.sys, u.prompt, key, maxTokens);
      usd += ((r.usage?.prompt_tokens || 0) * 2 + (r.usage?.completion_tokens || 0) * 10) / 1e6;
      const t = { runa: u.runa, lang: u.lang, rod: u.rod, varianta: u.varianta, losy: u.losy, verze, text: r.text, ok: false, zdroj: 'lab' };
      t.id = idZaznamu(t); k.texty.push(t); process.stdout.write('.');
    }
  }
  await Promise.all([pracovnik(), pracovnik(), pracovnik(), pracovnik()]);
  k.texty.sort((a, b) => a.runa.localeCompare(b.runa) || a.lang.localeCompare(b.lang) || a.varianta - b.varianta || String(a.rod).localeCompare(String(b.rod)));
  uloz(k);
  console.log('\nhotovo', ulohy.length, '· $' + usd.toFixed(3));
})().catch((e) => { console.error('CHYBA', e.message); process.exit(1); });
