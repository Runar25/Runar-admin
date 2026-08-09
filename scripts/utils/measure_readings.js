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
//
// Vstup = JSONL z `gen_batch.js` (nese i `prompt` → měří se i papouškování)
// nebo z `export_readings.js` (bez promptu → papouškování se přeskočí).
// ═══════════════════════════════════════════════════════
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const files = process.argv.slice(2).map(f => f.replace(/^~/, os.homedir()));
if (!files.length) {
  console.error('\n  Použití: node scripts/utils/measure_readings.js <soubor.jsonl> […]\n');
  process.exit(1);
}

// ── pomocné ────────────────────────────────────────────────────────────────
function injectedImage(prompt) {
  const line = String(prompt || '').split('\n').find(l => /ÁRSTÍÐARMYND|SEASONAL IMAGE/.test(l));
  if (!line) return null;
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

  // 5 — „already"/„þegar" (cold-read únik, řešeno v v1.2)
  const en = rows.filter(r => r.lang !== 'is'), is = rows.filter(r => r.lang === 'is');
  if (en.length) console.log('   EN „already": ' + pct(en.filter(r => /\balready\b/i.test(r.reading_text)).length, en.length));
  if (is.length) console.log('   IS „þegar" (často spojka „když" — ne nutně únik): ' +
    pct(is.filter(r => /\bþegar\b/i.test(r.reading_text)).length, is.length));
}
console.log('\n  (zákazy na výstupu měří `lint_readings.js`, IS gramatiku `is-grammar-qa.py`)\n');
