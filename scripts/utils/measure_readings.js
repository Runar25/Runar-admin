// ═══════════════════════════════════════════════════════
// RÚNAR · measure_readings.js — JEDEN nástroj na všechna měření výstupu
//
// Proč existuje: čísla se dají srovnávat jen tehdy, když se měří TOUTÉŽ metodou.
// Do 2026-08-09 se počítala ad-hoc skripty, které nikde nezůstaly — takže baseline
// nešel zopakovat. Tenhle skript je metoda; čísla z něj bydlí v RUNAR_EVAL_LOG.md.
//
//   node scripts/utils/measure_readings.js docs/inbox/probe-is-v14.jsonl
//   node scripts/utils/measure_readings.js ~/runar-eval/tester-<datum>.jsonl
//   node scripts/utils/measure_readings.js a.jsonl b.jsonl        (porovná dávky)
//   node scripts/utils/measure_readings.js --balance davka.jsonl   (rozložení losovaných pák)
//
// --balance = VYVÁŽENOST, ne prohřešky. KUKY 2026-08-09: „nejde nám o to zbavit se
// například `already` úplně — chceme mít čtení vyvážená, nejdeme hardcore zákaz na 0."
// Prompt si u každého single čtení losuje čtyři věci (úhel · sezónní obraz · umístění
// jména · tvar konce). Otázka není „kolikrát padlo zakázané slovo", ale „chodí čtení
// všemi dveřmi, nebo pořád jedněmi?". Co dávka NEUMÍ prozradit, to se vypíše nahlas —
// mlčky vytištěná nula by lhala (§19.2).
//
// Vstup = JSONL z `gen_batch.js` (nese i `prompt` → měří se i papouškování)
// nebo z `export_readings.js` (bez promptu → papouškování se přeskočí).
// ═══════════════════════════════════════════════════════
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const argv = process.argv.slice(2);
const BALANCE = argv.includes('--balance');
const files = argv.filter(a => a !== '--balance').map(f => f.replace(/^~/, os.homedir()));
if (!files.length) {
  console.error('\n  Použití: node scripts/utils/measure_readings.js <soubor.jsonl> […]\n');
  process.exit(1);
}

// ── pomocné ────────────────────────────────────────────────────────────────
function injectedImage(prompt) {
  // Návěstí se změnilo 2026-08-13 (`ÁRSTÍÐARMYND`/`SEASONAL IMAGE` → `MYND`/`IMAGE`);
  // starší dávky nesou původní tvar, proto se hledají obě.
  const line = String(prompt || '').split('\n')
    .find(l => /^(MYND|IMAGE) — /.test(l) || /ÁRSTÍÐARMYND|SEASONAL IMAGE/.test(l));
  if (!line) return null;
  if (/^(MYND|IMAGE) — /.test(line)) {
    // Obraz je MEZI dvojtečkou a ocasem. Bez horní kotvy se ocas počítal do fráze,
    // délka vyšla 19 slov místo 10 a „celá fráze doslova" hlásila falešnou nulu.
    const c = line.indexOf(': ');
    const t = line.search(/ (Láttu hana verða|Let it become)/);
    if (c < 0) return null;
    return line.slice(c + 2, t > c ? t : undefined).replace(/\.\s*$/, '').trim();
  }
  const m = line.match(/—\s*([^.]{10,160})\./);
  return m ? m[1].trim() : null;
}
// nejdelší doslovně shodný úsek ve SLOVECH (ne znacích — jinak by to nadhodnocovalo)
function longestVerbatim(a, b) {
  const A = a.toLowerCase().split(/\s+/), B = b.toLowerCase().split(/\s+/);
  let best = 0;
  for (let i = 0; i < A.length; i++) for (let j = 0; j < B.length; j++) {
    let k = 0;
    while (i + k < A.length && j + k < B.length && A[i + k] === B[j + k]) k++;
    if (k > best) best = k;
  }
  return best;
}
const pct = (n, d) => d ? Math.round(n / d * 100) + ' %' : '—';

// Pool úhlů ze ZDROJE, ne opsaný sem (§20). Produkční řádek nese jen index, takže bez
// tohohle by výpis byl „0 ·" a index by se musel dohledávat ručně. Nejde-li to načíst,
// zůstane index — nikdy se nehádá text.
function anglePool(lang) {
  try {
    const vm = require('vm');
    const src = fs.readFileSync(path.join(__dirname, '..', '..', 'v2', 'runar-utils.js'), 'utf8');
    const ctx = { console };
    ctx.window = ctx; ctx.globalThis = ctx;
    vm.createContext(ctx);
    vm.runInContext(src + ';__P={en:READING_ANGLES,is:READING_ANGLES_IS};', ctx, { filename: 'u.js' });
    const p = ctx.__P[lang === 'is' ? 'is' : 'en'];
    return Array.isArray(p) && p.length ? p : null;
  } catch (e) { return null; }
}
const med = a => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

for (const f of files) {
  if (!fs.existsSync(f)) { console.error('\n  Soubor neexistuje: ' + f + '\n'); process.exit(1); }
  const rows = fs.readFileSync(f, 'utf8').trim().split('\n')
    .map(l => { try { return JSON.parse(l); } catch (e) { return null; } })
    .filter(r => r && (r.reading_text || '').trim().length > 20);
  if (!rows.length) { console.log('\n── ' + path.basename(f) + ' — žádná použitelná čtení\n'); continue; }

  const langs = [...new Set(rows.map(r => r.lang).filter(Boolean))];
  const vers = [...new Set(rows.map(r => r.prompt_version).filter(Boolean))];
  console.log('\n══ ' + path.basename(f) + ' ══');
  console.log('   n = ' + rows.length + '  ·  jazyk: ' + (langs.join(',') || '?') +
    '  ·  verze: ' + (vers.join(',') || '(bez tagu)'));

  // Smisena populace = cisla NEJSOU srovnatelna s probe davkou (jeden spread, jedna verze).
  // Spready jsou delsi z definice a starsi verze mely jina pravidla koncu — bez teto
  // hlasky by srovnani "86 slov vs 40 slov" vyrobilo falesny zaver.
  const spreads = [...new Set(rows.map(r => r.spread).filter(Boolean))];
  const mixed = [];
  if (spreads.length > 1) mixed.push(spreads.length + ' druhů čtení (' + spreads.join(',') + ')');
  if (vers.length > 1 || (vers.length && rows.some(r => !r.prompt_version)))
    mixed.push('víc verzí promptu');
  if (langs.length > 1) mixed.push('víc jazyků');
  if (mixed.length)
    console.log('   ⚠ SMÍŠENÁ DÁVKA (' + mixed.join(' · ') + ') — délku a tvar konce\n' +
                '     NEsrovnávej s probe dávkou; ta má jeden druh čtení a jednu verzi.');

  // 1 — PAPOUŠKOVÁNÍ vloženého obrazu (jen když je v datech prompt)
  const withPrompt = rows.filter(r => r.prompt && injectedImage(r.prompt));
  if (withPrompt.length) {
    let full = 0, half = 0, sumLv = 0, sumW = 0;
    for (const r of withPrompt) {
      const img = injectedImage(r.prompt);
      const w = img.split(/\s+/).length, lv = longestVerbatim(img, r.reading_text);
      sumLv += lv; sumW += w;
      if (lv >= w - 1) full++; else if (lv >= Math.ceil(w / 2)) half++;
    }
    const n = withPrompt.length;
    console.log('   papouškování obrazu (n=' + n + '): celá fráze doslova ' + pct(full, n) +
      ' · půlka a víc ' + pct(half, n) + ' · přepsáno ' + pct(n - full - half, n));
    console.log('     nejdelší doslovný úsek: ' + (sumLv / n).toFixed(1) + ' z ' + (sumW / n).toFixed(1) +
      ' slov (' + Math.round(sumLv / sumW * 100) + ' % fráze)');
    const imgs = withPrompt.map(r => injectedImage(r.prompt));
    console.log('     různých vložených obrazů: ' + new Set(imgs).size + '/' + n);
  } else {
    console.log('   papouškování: nelze (data nenesou `prompt` — to umí jen gen_batch)');
  }

  // 2 — tvar čtení
  const q = rows.filter(r => /\?\s*$/.test(r.reading_text.trim())).length;
  const wc = rows.map(r => r.reading_text.split(/\s+/).length);
  console.log('   konec otázkou: ' + pct(q, rows.length) + '   (cíl ~33 %)');
  console.log('   délka: medián ' + med(wc) + ' slov, rozsah ' + Math.min(...wc) + '–' + Math.max(...wc) +
    '   (single zadává 38–45)');

  // 3 — otevření DEFINICÍ runy (co _describeRule zakazuje)
  const defs = rows.filter(r => /^[A-ZÞÆÖÁÍÓÚÝÐ][a-zþæöáíóúýð]+\s+(is|er)\s+(the|rún|sú|það)/.test(r.reading_text.trim()));
  console.log('   otevřeno definicí runy („X er rún…"): ' + defs.length + '/' + rows.length + '  ' + pct(defs.length, rows.length));

  // 4 — rúnaþula ve výstupu (vypnuta 2026-08-09; hlídáme, že se nevrátila)
  const thula = rows.filter(r => /\b\w+ er rún \w+/i.test(r.reading_text)).length;
  console.log('   tvar rúnaþuly ve výstupu: ' + thula + '/' + rows.length);

  if (BALANCE) balance(rows);

  // 5 — „already"/„þegar" — SLEDUJE SE, NEHONÍ K NULE (KUKY 2026-08-09).
  //     Je to ukazatel vyváženosti, ne počet prohřešků: čtení, které přijde dveřmi
  //     „weight", ho klidně použít má. Vada by byl až extrém na obou koncích.
  const en = rows.filter(r => r.lang !== 'is'), is = rows.filter(r => r.lang === 'is');
  if (en.length) console.log('   EN „already": ' + pct(en.filter(r => /\balready\b/i.test(r.reading_text)).length, en.length));
  if (is.length) console.log('   IS „þegar" (často spojka „když" — ne nutně únik): ' +
    pct(is.filter(r => /\bþegar\b/i.test(r.reading_text)).length, is.length));
}
console.log('\n  (zákazy na výstupu měří `lint_readings.js`, IS gramatiku `is-grammar-qa.py`)\n');

// ── ROZLOŽENÍ LOSOVANÝCH PÁK ────────────────────────────────────────────────
// Rovnoměrnost se neposuzuje okem: u N pozorování a K možností je očekávaná četnost
// N/K a i dokonale férový los se od ní běžně liší. Vypisuje se proto i to, kolik
// pozorování na jednu možnost vůbec připadá — pod ~5 nemá smysl mluvit o nerovnováze.
function dist(label, pairs, note) {
  const total = pairs.reduce((a, p) => a + p[1], 0);
  if (!total) { console.log('   ' + label + ': —'); return; }
  const k = pairs.length;
  console.log('   ' + label + '  (n=' + total + ', možností ' + k +
    ', na jednu očekáváno ' + (total / k).toFixed(1) + ')' + (note ? '  ' + note : ''));
  const w = Math.max(...pairs.map(p => String(p[0]).length));
  for (const [name, n] of pairs) {
    const pctv = total ? n / total * 100 : 0;
    const bar = '█'.repeat(Math.round(pctv / 4));
    console.log('     ' + String(name).padEnd(w) + '  ' + String(n).padStart(3) +
      '  ' + pctv.toFixed(0).padStart(3) + ' %  ' + bar);
  }
  if (total / k < 5)
    console.log('     ⚠ méně než 5 pozorování na možnost — o (ne)rovnováze tahle dávka nevypovídá.');
}

function balance(rows) {
  console.log('\n   ── rozložení losovaných pák (vyváženost, ne prohřešky) ──');

  // 1) ÚHEL — jen když dávka nese prompt (gen_batch). Produkce ho nepersistuje.
  // Dva zdroje téhož: probe dávka nese `angle_idx` (gen_batch), produkční export nese
  // `draws` (readings.prompt_draws, od 2026-08-09). Čtení starší než ta migrace `draws`
  // nemají — a to se řekne, místo mlčky vytištěné nuly (§19.2).
  const angleOf = r => (r.draws && typeof r.draws.angle === 'number') ? r.draws.angle
                     : (typeof r.angle_idx === 'number' && r.angle_idx >= 0) ? r.angle_idx : null;
  const withAngle = rows.filter(r => angleOf(r) !== null);
  if (withAngle.length) {
    // jazyk se bere z RADKU (funkce nevidi do smycky nad soubory)
    const ls = [...new Set(withAngle.map(r => r.lang).filter(Boolean))];
    const pool = anglePool(ls.length === 1 ? ls[0] : 'en');
    const m = new Map();
    for (const r of withAngle) {
      const i = angleOf(r);
      const txt = r.angle || (pool && pool[i]) || '';
      m.set(i + ' · ' + String(txt).slice(0, 46), (m.get(i + ' · ' + String(txt).slice(0, 46)) || 0) + 1);
    }
    if (!pool && !withAngle.some(r => r.angle))
      console.log('     (pool úhlů se nepodařilo načíst — jen indexy)');
    dist('úhel čtení', [...m.entries()].sort());
    if (withAngle.length < rows.length)
      console.log('     ⚠ ' + (rows.length - withAngle.length) + ' z ' + rows.length +
        ' čtení úhel nenese (starší než 2026-08-09) — do rozložení se nepočítají.');
  } else {
    console.log('   úhel čtení: NELZE ZJISTIT z téhle dávky.');
    console.log('     Buď je celá starší než záznam losů (2026-08-09), nebo nenese ani');
    console.log('     `draws` (produkční export), ani `prompt` (probe z gen_batch).');
  }

  // 2) SEZÓNNÍ OBRAZ — táž podmínka.
  const imgs = rows.map(r => (r.draws && r.draws.image) || injectedImage(r.prompt)).filter(Boolean);
  if (imgs.length) {
    // Bez rámce „očekávaná četnost": pool má desítky položek a dávka jich uvidí hrstku,
    // takže rovnoměrnost tu nic neznamená. Co znamená: kolik RŮZNÝCH a co se OPAKOVALO.
    const m = new Map();
    for (const i of imgs) m.set(i, (m.get(i) || 0) + 1);
    const rep2 = [...m.entries()].filter(p => p[1] > 1).sort((a, b) => b[1] - a[1]);
    console.log('   sezónní obraz  (n=' + imgs.length + ')');
    console.log('     různých obrazů: ' + m.size + ' na ' + imgs.length + ' čtení' +
      (m.size === imgs.length ? '   (žádný se neopakoval)' : ''));
    if (rep2.length) {
      console.log('     opakované:');
      for (const [img, n] of rep2) console.log('       ' + n + '× ' + img.slice(0, 62));
    }
  } else {
    console.log('   sezónní obraz: NELZE ZJISTIT — dávka nenese ani `draws`, ani `prompt`.');
  }

  // Umístění jména z `draws` (produkce). Z textu to jde jen tam, kde dávka jméno nese.
  const withName = rows.filter(r => r.draws && typeof r.draws.name === 'number');
  if (withName.length) {
    const LBL = ['brzy', 'uprostřed', 'na konci', 'jméno vynecháno'];
    const m = new Map();
    for (const r of withName) {
      const l = LBL[r.draws.name] || ('varianta ' + r.draws.name);
      m.set(l, (m.get(l) || 0) + 1);
    }
    dist('umístění jména (z draws)', [...m.entries()].sort(), '(návrh: vynecháno ~55 %)');
  }

  // 3) TVAR KONCE — tenhle JDE z textu, prompt netřeba.
  const q = rows.filter(r => /\?\s*$/.test(r.reading_text.trim())).length;
  dist('tvar konce', [['otázkou', q], ['tvrzením', rows.length - q]], '(z textu, prompt netřeba)');

  // 4) JMÉNO — jen když dávka jméno nese (produkční export ho kvůli minimalizaci nemá).
  const named = rows.filter(r => r.name && r.name !== 'you' && r.name !== 'þú');
  if (named.length) {
    let none = 0, early = 0, mid = 0, late = 0;
    for (const r of named) {
      const t = r.reading_text, i = t.indexOf(r.name);
      if (i < 0) { none++; continue; }
      const rel = i / t.length;
      if (rel < 0.33) early++; else if (rel < 0.66) mid++; else late++;
    }
    dist('umístění jména', [['vůbec ne', none], ['začátek', early], ['střed', mid], ['konec', late]],
      '(z textu)');
  } else if (!withName.length) {
    console.log('   umístění jména: NELZE ZJISTIT — dávka nenese ani `draws`, ani jméno' +
      ' (produkční export jméno vypouští, oslovení bývá „you"/„þú").');
  }
}
