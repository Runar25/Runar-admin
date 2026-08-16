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
const RULES   = argv.includes('--rules');
const files = argv.filter(a => a !== '--balance' && a !== '--rules')
  .map(f => f.replace(/^~/, os.homedir()));
if (!files.length) {
  console.error('\n  Použití: node scripts/utils/measure_readings.js <soubor.jsonl> […]\n');
  process.exit(1);
}


// ═══════════════════════════════════════════════════════
// --rules · dodrzuje Runar na VYSTUPU to, co mu prompt zakazuje?
//
// Zdrojove hlidace (test_no_planted_bans) overuji, ze si zakazane slovo nesazime do promptu.
// To je nutne, ale nestaci: model umi zakaz porusit sam. 2026-08-16 doloseno — vlozeny obraz
// rikal "you DO NOT know", cteni napsalo "You KNOW this stillness". Kontrola musi bezet
// na plose, kde vada zije (§19.3).
//
// Zakazy se ctou Z PROMPTU, ne z rucni listiny.
// ═══════════════════════════════════════════════════════
function loadPromptEnv() {
  const vm = require('vm');
  const V2 = path.resolve(__dirname, '../../v2') + '/';
  const S = { console };
  S.window = S; S.globalThis = S; S.lang = 'en';
  S.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  S.document = { getElementById: () => null };
  vm.createContext(S);
  vm.runInContext(
    ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js']
      .map(f => fs.readFileSync(V2 + f, 'utf8')).join('\n;\n') +
    '\n;globalThis.__EN = DEF_CHAR_EN; globalThis.__IS = DEF_CHAR_IS; globalThis.__RUNES = RUNES;', S);
  return S;
}
// ⚠️ NE vsechna slova v uvozovkach jsou zakazy. `grammar` nese i PREDPISY v uvozovkach
// ("piš v druhé osobě: \"you\", \"your\"") a prvni verze je brala taky — vysledek hlasil,
// ze 99 % cteni porusuje zakaz slova "you". Nesmysl na prvni pohled, a proto se chytil;
// kdyby to bylo 12 %, prosel by jako nalez. Extrahuje se proto uzce:
//   `never`  = samé zákazy, brat vse v uvozovkach
//   `grammar` = jen veta ZA navestim "Banned:" / "Bannað að segja"
const QUALIFIED = new Set();   // zakazy, ktere plati jen v urcitem uziti
function bannedFrom(ch) {
  const out = new Set();
  const add = (w) => { const c = String(w).replace(/[„“”"']/g, '').trim().toLowerCase();
    if (c.length > 2) out.add(c); };
  // ⚠️ Zakaz muze mit PODMINKU: `does not use the word "journey" AS A METAPHOR FOR
  // PERSONAL GROWTH` neni zakaz slova, je to zakaz jednoho uziti. Radek se proto uchova
  // a podmineny zakaz se ve vypisu OZNACI — cislo se nesmi vzit bez pohledu na uryvek.
  String(ch.never || '').split('\n').forEach(line => {
    (line.match(/[„"]([^"“”]+)[”“"]/g) || []).forEach(q => {
      add(q);
      const c = String(q).replace(/[„“”"']/g, '').trim().toLowerCase();
      const after = line.slice(line.lastIndexOf(q) + q.length).trim();
      if (after && !/^[.;,]?$/.test(after) && !/^(or|eða)\b/.test(after)) QUALIFIED.add(c);
    });
  });
  const g = String(ch.grammar || '');
  const m = /(?:Banned:|Bannað að segja)([^.]*)/.exec(g);
  if (m) (m[1].match(/"([^"]+)"/g) || []).forEach(add);
  return [...out];
}
// Studene cteni: tvrzeni o tom, co ma clovek UVNITR. Zapor se nepocita — "you do not know"
// nevedomost TVRDI, ne pripisuje. Odladeno v test_no_planted_bans.js, tady na vystupu.
// ⚠️ `carry` VYHOZENO. Rucni pohled na 11 zasahu ukazal, ze tri jsou fyzicke ("what you
// carry forward, you carry for others too") — carry neni epistemicke sloveso, nese se batoh
// i vina. S nim mel detektor presnost ~40 %: z namerenych 32 % by skutecnych bylo ~13 %.
const COLD_VERB   = /\byou\b((?:\s+\w+){0,3})\s+(know|knows|feel|feels|remember|remembers|sense|senses)\b/i;
const COLD_PHRASE = /\b(something in you|what you know|you have always|deep in you)\b/i;
const NEGATED     = /\b(do not|don't|cannot|can't|never|no longer|did not|didn't)\b/i;
// Veta zakoncena otaznikem se NEPOCITA: "What did you carry?" se PTA, netvrdi.
// `_noColdRead` zakazuje RIKAT tazateli, co v sobe zna — otazka mu to nerika.
function sentenceAt(txt, i) {
  const start = Math.max(txt.lastIndexOf('.', i), txt.lastIndexOf('?', i), txt.lastIndexOf('!', i)) + 1;
  const m = /[.?!]/.exec(txt.slice(i));
  return txt.slice(start, m ? i + m.index + 1 : txt.length).trim();
}
// ─── islandsky ekvivalent ───
// `veist`/`manst` = jen 2. os. j. c., staci samy. `finnur`/`skynjar`/`þekkir` jsou i 3. osoba,
// proto u nich musi byt `þú` v okoli — jinak by veta o rune vysla jako narok na tazatele.
// ⚠️ ZADNE `\b` ANI `\w` NA ISLANDSTINU. JS je ma na [A-Za-z0-9_], takze mezi mezerou
// a "þ" hranice slova NENI: /\bþekkir\b/ na "Þú þekkir þessa fjöru" vrati FALSE.
// Prvni verze mela kvuli tomu MRTVOU dvojznacnou vetev — nesedla nikdy a islandska
// cisla byla podhodnocena. Hranice se proto delaji lookaroundem nad islandskou abecedou.
const IS_L  = 'a-záðéíóúýþæöA-ZÁÐÉÍÓÚÝÞÆÖ';
const isb   = (w) => '(?<![' + IS_L + '])(?:' + w + ')(?![' + IS_L + '])';
const IS_SOLO   = new RegExp(isb('veist|manst|veistu|manstu'), 'i');
const IS_AMBIG  = new RegExp(isb('þú') + '(?:\\s+[' + IS_L + ']+){0,3}\\s+' +
                             isb('finnur|skynjar|þekkir|kannast'), 'i');
const IS_PHRASE = new RegExp(isb('eitthvað í þér|innra með þér|það sem þú veist'), 'i');
const IS_NEG    = /\b(ekki|aldrei|hvorki|ekkert)\b/i;
function isColdReadIS(txt) {
  const check = (m) => {
    if (!m) return false;
    const sent = sentenceAt(txt, m.index);
    return !sent.endsWith('?') && !IS_NEG.test(sent);
  };
  return check(IS_PHRASE.exec(txt)) || check(IS_SOLO.exec(txt)) || check(IS_AMBIG.exec(txt));
}

function isColdRead(txt) {
  const mp = COLD_PHRASE.exec(txt);
  if (mp && !sentenceAt(txt, mp.index).endsWith('?')) return true;
  const m = COLD_VERB.exec(txt);
  if (!m || NEGATED.test(m[1])) return false;
  return !sentenceAt(txt, m.index).endsWith('?');
}

function rulesAudit(rows) {
  const S = loadPromptEnv();
  const BAN = { en: bannedFrom(S.__EN), is: bannedFrom(S.__IS) };
  const langs = [...new Set(rows.map(r => r.lang).filter(Boolean))].sort();
  console.log('\n═══ DODRŽUJE VÝSTUP TO, CO PROMPT ZAKAZUJE? ═══');
  console.log('  Zákazy čtené Z PROMPTU: EN ' + BAN.en.length + ' · IS ' + BAN.is.length +
    ' výrazů (ruční listina by se rozešla při první úpravě promptu).\n');

  for (const L of langs) {
    const rs = rows.filter(r => r.lang === L && r.reading_text);
    if (!rs.length) continue;
    const hits = {};
    let bang = 0, cold = 0;
    for (const r of rs) {
      const t = r.reading_text;
      if (/!/.test(t)) bang++;
      for (const b of BAN[L] || []) {
        const re = new RegExp('\\b' + b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
        const m = re.exec(t);
        // Ulozi se URYVEK, ne jednicka. Cislo bez dukazu dnes uz dvakrat lhalo.
        if (m) (hits[b] = hits[b] || []).push(t.slice(Math.max(0, m.index - 60), m.index + 60).replace(/\s+/g, ' ').trim());
      }
      if (L === 'is' ? isColdReadIS(t) : isColdRead(t)) cold++;
    }
    const top = Object.keys(hits).sort((a, b) => hits[b].length - hits[a].length);
    console.log('  ── ' + L.toUpperCase() + ' · ' + rs.length + ' čtení');
    console.log('     vykřičník            ' + bang + '  (' + (bang / rs.length * 100).toFixed(0) + ' %)');
    console.log('     nárok na vnitřní stav ' + cold + '  (' + (cold / rs.length * 100).toFixed(0) + ' %)');
    if (!top.length) console.log('     zakázaný výraz       žádný');
    for (const b of top) {
      const rate = hits[b].length / rs.length;
      console.log('     „' + b + '"' + ' '.repeat(Math.max(1, 20 - b.length)) +
        hits[b].length + '  (' + (rate * 100).toFixed(0) + ' %)' +
        // ⚠️ Zakaz, ktery porusuje pulka cteni, je skoro jiste SPATNE VYTAZENY (predpis
        // misto zakazu), ne masove poruseni. Radeji hlasit podezreni na nastroj nez
        // vydat vlastni chybu za nalez.
        (QUALIFIED.has(b) ? '   ⚠️ PODMÍNĚNÝ zákaz — posuď z úryvku, ne z počtu' : '') +
        (rate > 0.5 ? '   ⚠️ přes polovinu — spíš špatně vytažený zákaz než nález' : ''));
      // Uryvky: bez nich je to jen cislo, a cislo dnes uz dvakrat lhalo (§24).
      hits[b].slice(0, 2).forEach(f => console.log('        …' + f + '…'));
    }
    console.log('');
  }
  // ⚠️ Kontrola, ktera nikdy nic nenajde, projde stejne tise jako spravna.
  const probes = [
    ['You already know what this means.', true, 'narok na vnitrni stav'],
    ['You do not know what waits beyond it.', false, 'zapor NENI narok'],
    ['The ice holds and the morning is quiet.', false, 'bezny text'],
    ['Something in you is waiting.', true, 'fraze "something in you"'],
    ['What did you carry that was never yours?', false, 'otazka se NEPOCITA — pta se, netvrdi'],
    ['What you carry forward, you carry for others too.', false, 'carry je fyzicke, ne epistemicke'],
    ['You know this stillness, the waiting before the shape appears.', true, 'realny nalez 2026-08-15'],
  ];
  let bad = 0;
  const probesIS = [
    ['Þú veist hvað þetta þýðir.', true, 'IS: narok "þú veist"'],
    ['Þú veist ekki hvað bíður handan við.', false, 'IS: zapor se NEPOCITA'],
    ['Veist þú hvað þetta þýðir?', false, 'IS: otazka se NEPOCITA'],
    ['Ísinn heldur og morgunninn er kyrr.', false, 'IS: bezny text'],
    ['Hann finnur kuldann í fjörunni.', false, 'IS: 3. osoba NENI narok na tazatele'],
    // ⚠️ TYHLE TRI CHYBELY A PRAVE ONY BY BYLY CHYTILY MRTVOU VETEV (2026-08-16).
    // Kazda cvici DVOJZNACNOU vetev POZITIVNE — tedy tu, ktera kvuli `\b` nesedala.
    ['Þú finnur kuldann í fjörunni.', true, 'IS: 2. osoba U DVOJZNACNEHO slovesa'],
    ['Þú þekkir þessa fjöru vel.', true, 'IS: þekkir po þú (zacina na þ — past s \\b)'],
    ['Þú skynjar það sem bíður.', true, 'IS: skynjar po þú'],
    ['Eitthvað í þér bíður.', true, 'IS: fraze "eitthvað í þér"'],
  ];
  console.log('  ── kontrola detektoru');
  for (const [txt, want, label] of probesIS) {
    const got = isColdReadIS(txt);
    if (got !== want) { console.log('     ✘ ' + label + ' -> ' + got + ', čekáno ' + want); bad++; }
  }
  for (const [txt, want, label] of probes) {
    const got = isColdRead(txt);
    if (got !== want) { console.log('     ✘ ' + label + ' -> ' + got + ', čekáno ' + want); bad++; }
  }
  console.log(bad ? '     ✘ detektor SELHAL v ' + bad + ' bodech' : '     ✔ detektor pozná nárok i zápor i běžný text');
  console.log('');
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

if (RULES) {
  const rows = files.flatMap(f => fs.readFileSync(f, 'utf8').split('\n')
    .filter(l => l.trim()).map(l => { try { return JSON.parse(l); } catch (e) { return null; } })
    .filter(Boolean));
  rulesAudit(rows);
}
