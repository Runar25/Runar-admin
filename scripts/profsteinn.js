// ═══════════════════════════════════════════════════════════════════════════════════
// PRÓFSTEINN — prubířský kámen čtení  (pojmenováno 2026-08-22; is. prófsteinn = zkušební
// kámen, „málið er prófsteinn á íslenskt réttarfar")
//
// K ČEMU JE: přijde stížnost na čtení (tester přes reporter, owner okem) → tenhle nástroj
// je PRVNÍ krok. Prožene text (nebo dávku, nebo čerstvě vygenerovaná čtení produkční
// cestou) třemi ustálenými soudci a řekne, JESTLI a KDE je vada měřitelná:
//
//   svět    — z kolika ODLIŠNÝCH konkrétních světů čtení bere obrazy (cíl 1; kostra 22.8.)
//   soulad  — žijí pojmenování runy a obraz v JEDNOM světě? (znění s příklady — jediné,
//             které drží; varianty bez příkladů driftovaly ±4, RUNAR_EVAL_LOG 21.-22.8.)
//   chlad   — studené čtení: tvrzení o čtenáři, které nejde vyvrátit (zákaz v promptu)
//
// Soudce = claude-opus-4-8, 3 hlasy, většina (svět = medián). ZNĚNÍ SOUDCŮ VLASTNÍ TENHLE
// SOUBOR — kostra/soud skripty 22.8. byly scratch; druhá kopie znění by driftovala (§18).
// ⚠️ Čísla jsou MANTINEL, ne rozhodčí: rozhoduje oko ownera nad celým čtením. Soudce
// „smysl" byl vyřazen (trestal přesně MYND splynutí — 0/3 vs 3/3 na témž textu).
//
// CO NÁSTROJ NEUMÍ (a kam stížnost poslat dál):
//   · vadný OBRAZ u runy      → slepý test obrazu (vzor docs/eval/2026-08-22-obrazy-blind/,
//                               skript: obraz + 5 sad významů, 3 hlasy, šance 20 %)
//   · islandská vazba/slovo   → python -X utf8 is-vazba.py <slovo> · check-is.py · korekce
//                               do DB přes shrine + BAD_PATTERNS
//   · změna páky promptu      → rejstřík pák v RUNAR_EVAL_LOG.md (přečti PŘED zásahem),
//                               golden před/po, bump RUNAR_PROMPT_VERSION (vynucuje ㉜)
//   · rozhodnutí o chování    → datovaný záznam RUNAR_DECISIONS.md (§16)
//
// POUŽITÍ:
//   node scripts/profsteinn.js --text "..." --rune Ansuz --lang en     # jedna stížnost
//   node scripts/profsteinn.js --file cesta.jsonl [--lang en]          # dávka (jsonl:
//         {text|reading_text, rune|runes, lang}) — --lang dávku profiltruje
//   node scripts/profsteinn.js --gen --lang is --n 16 [--rune X]       # vygeneruj
//         produkční cestou (gen_direct) a rovnou suď
// Klíč: env ANTHROPIC_API_KEY, jinak ~/.claude/runar-api-key.txt (mimo repo, nevypisovat).
// ═══════════════════════════════════════════════════════════════════════════════════
const fs = require('fs'), path = require('path'), cp = require('child_process');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const KEY = process.env.ANTHROPIC_API_KEY
  || fs.readFileSync(path.join(require('os').homedir(), '.claude', 'runar-api-key.txt'), 'utf8').trim();

const SOUDCI = {
  svety: ['Count how many DISTINCT concrete worlds a rune reading draws its imagery from.',
    'A world is a coherent physical setting whose things belong together. Abstract words are not a world.',
    'Answer with a single digit: 1, 2, 3 or 4. Nothing else.'].join('\n'),
  soulad: ['A rune reading does two things: it names what the rune stands for, and it shows an image.',
    '', 'Judge ONE property: do the naming and the image live in the SAME world, so that the image',
    'is an instance of what was named?', '',
    'YES — "Gebo is the even weight of giving and taking" + a pebble rolled round by water that',
    'gives and takes. The image IS that evenness.',
    'YES — "Berkana is the birch, the rune of small tender beginnings" + a birch holding its',
    'ground. Same world.',
    'NO — "Jera is the rune of the harvest that comes only in its own time" + dough rising under',
    'a cloth. Harvest is a dictionary word for the rune; the dough is a different world placed',
    'beside it, and the reader has to bridge them.',
    'NO — the reading names the rune with a label and the image never touches that label.',
    '', 'If the reading does not name the rune at all, answer SKIP.',
    'One word: YES, NO or SKIP.'].join('\n'),
  chlad: ['You grade rune readings for ONE property: COLD READING.',
    'A reading COLD-READS when it asserts something it cannot know and the reader cannot disconfirm:',
    'the reader\'s inner state or knowledge; a claim smuggled inside a question; or a claim about',
    'another person or about events in the reader\'s life.',
    'Placing the reader inside the IMAGE is not cold reading. Naming what the rune is, is not.',
    'One word: YES or NO.'].join('\n'),
};

async function claude(sys, obsah, maxTok) {
  for (let p = 0; p < 4; p++) {
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-opus-4-8', max_tokens: maxTok,
          system: [{ type: 'text', text: sys, cache_control: { type: 'ephemeral' } }],
          messages: [{ role: 'user', content: obsah }] }),
      });
      const d = await r.json();
      if (r.ok) return (d.content || []).map(c => c.text).join('');
      if (r.status !== 429 && r.status < 500) return null;
    } catch (e) { /* sit */ }
    await new Promise(res => setTimeout(res, 1500 * (p + 1)));
  }
  return null;
}

async function sud(radky) {
  const v = { svety: [], soulad: [], chlad: [] };
  for (let i = 0; i < radky.length; i += 4) {
    const c = radky.slice(i, i + 4);
    for (const klic of Object.keys(SOUDCI)) {
      const o = await Promise.all(c.map(x =>
        Promise.all([0, 1, 2].map(() => claude(SOUDCI[klic],
          'Rune drawn: ' + x.rune + '\n\nReading:\n"' + x.text + '"', klic === 'svety' ? 4 : 5)))
        .then(hlasy => {
          if (klic === 'svety') {
            const cisla = hlasy.map(h => parseInt(((h || '').match(/\d/) || ['0'])[0], 10)).filter(Boolean);
            return cisla.sort((a, b) => a - b)[Math.floor(cisla.length / 2)] || 0;
          }
          return hlasy.filter(h => (h || '').trim().toUpperCase().indexOf('YES') === 0).length >= 2;
        })));
      v[klic].push(...o);
    }
    process.stdout.write('\r  souzeno ' + Math.min(i + 4, radky.length) + '/' + radky.length + '   ');
  }
  return v;
}

function vypis(radky, v) {
  console.log('\n');
  radky.forEach((x, i) => {
    const zle = [];
    if (v.svety[i] > 1) zle.push(v.svety[i] + ' světy');
    if (!v.soulad[i]) zle.push('nesoulad');
    if (v.chlad[i]) zle.push('CHLAD');
    console.log('  ' + (zle.length ? '⚠  ' : 'ok ') + String(x.rune).padEnd(10)
      + (zle.length ? zle.join(' · ') : '') );
    if (zle.length) console.log('     „' + x.text.replace(/\s+/g, ' ').slice(0, 110) + '…"');
  });
  const sv = v.svety.filter(Boolean);
  console.log('\n  ═ souhrn: svět ' + (sv.reduce((a, b) => a + b, 0) / (sv.length || 1)).toFixed(2)
    + ' · soulad ' + v.soulad.filter(Boolean).length + '/' + radky.length
    + ' · chlad ' + v.chlad.filter(Boolean).length + '/' + radky.length);
  console.log('  (mantinel, ne rozhodčí — celá čtení posuzuje oko ownera)');
}

(async () => {
  let radky = [];
  if (arg('text', '')) {
    if (!arg('rune', '')) { console.error('  --text potřebuje --rune'); process.exit(1); }
    radky = [{ rune: arg('rune'), text: arg('text'), lang: arg('lang', 'en') }];
  } else if (arg('file', '')) {
    radky = fs.readFileSync(arg('file'), 'utf8').trim().split('\n').map(x => JSON.parse(x))
      .map(z => ({ rune: z.rune || (z.runes && z.runes[0]) || '?', lang: z.lang,
                   text: z.text || z.reading_text || '' }))
      .filter(z => z.text && (!arg('lang', '') || z.lang === arg('lang')));
  } else if (process.argv.includes('--gen')) {
    const L = arg('lang', 'en'), n = arg('n', '16');
    const runa = arg('rune', '') ? ['--rune', arg('rune')] : [];
    cp.execFileSync('node', ['scripts/utils/gen_direct.js', '--spread', 'single', '--lang', L,
      '--n', n, '--tag', 'profsteinn', ...runa], { stdio: 'inherit' });
    const soubor = 'C:/Users/zkuku/Downloads/Runar-admin/eval_out/archive/gen-single-' + L + '-profsteinn.jsonl';
    radky = fs.readFileSync(soubor, 'utf8').trim().split('\n').map(x => JSON.parse(x))
      .filter(z => z.reading_text && !z.error)
      .map(z => ({ rune: z.runes[0], lang: z.lang, text: z.reading_text }));
  } else {
    console.log('  použití: --text "..." --rune X --lang en  |  --file cesta.jsonl [--lang en]  |  --gen --lang is --n 16');
    process.exit(0);
  }
  if (!radky.length) { console.error('  nic k souzení'); process.exit(1); }
  vypis(radky, await sud(radky));
})();
