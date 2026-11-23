// Owner 2026-11-23: „dej mi přesný popis toho, jak čtení vznikala, jaký prompt to byl … ostatní možnosti, z čeho takové čtení vzniká …
// chci všechny v souboru a třeba 5 rozdílných run … otestovat jiným AI. potřebuju se dostat z našeho limitovaného boxu.“
// Vyrobí testovaci-balicek.md: vše bere z produkčního kódu v2 (vm) a ze souborů labu — nic se neopisuje ručně kromě dvou stran
// runy (citace z RUNAR_POPISY_RUN.md, zdroj u každé). Nic nevolá.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const H = __dirname, ROOT = path.join(H, '..', '..', '..', '..'), D = path.join(ROOT, 'v2');
const S = { console: { log() {}, warn() {}, error() {} } }; S.window = S; S.globalThis = S;
S.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] };
S.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-utils.js', 'runar-character.js'])
  vm.runInContext(fs.readFileSync(path.join(D, f), 'utf8').replace(/^const /gm, 'var ') + '\n;\n', S);
vm.runInContext('var currentUser = null, userTier = "", userGender = "hk", lang = "en";', S);
const G = (x) => vm.runInContext(x, S);
const RUNY = ['Fehu', 'Raidho', 'Gebo', 'Hagalaz', 'Berkana'];
const KOLO4 = JSON.parse(fs.readFileSync(path.join(H, '..', 'napeti', 'kolo4', 'vety.json'), 'utf8'));
const MECH = {}; for (const r of JSON.parse(fs.readFileSync(path.join(H, '..', 'napeti', 'kolo4', 'kandidati.json'), 'utf8'))) MECH[r.runa] = r.mech;
const STRANY = {   // dvě strany runy z ownerova popisu (RUNAR_POPISY_RUN.md); Berkana, Raidho, Hagalaz = táž znění jako v ulohy_zdroj.json
  Fehu: [['value that lives only while it moves; what is fed grows', 'Fehu: „síla, která má hodnotu tehdy, když se může pohybovat“ · „To, co živíš, roste.“'],
         ['what flows in can also drain away; what is left standing loses its strength', 'Fehu: „To, co proudí dovnitř, může také odtéct.“ · „To, co necháš stát, může ztratit svou sílu.“']],
  Gebo: [['a gift means something leaves your hand, given without knowing it will return', 'Gebo: „Dar má smysl právě proto, že něco opouští tvoji ruku.“ · otázka runy „bez jistoty, že se ti to vrátí“'],
         ['receiving without having to repay at once; a gift is not a trade', 'Gebo: „Gebo proto není obchod.“ · „přijmout, aniž bys za to musel okamžitě něco vracet“']],
};
for (const u of JSON.parse(fs.readFileSync(path.join(H, 'ulohy_zdroj.json'), 'utf8')))
  if (u.zdroj === 'strany') STRANY[u.runa] = u.strany.map((s, i) => [s, (u._zdroj_stran || '')]);
const KONCE = {
  'General Guidance': 'open, as a question, what may deserve attention now',
  'Clarity': 'draw, as a question, a distinction between two things that are easily mistaken for each other',
  'Confirmation': 'neither confirm nor refute; name what the reading has made visible, without certainty',
  'Insight into Challenge': 'ask where the friction actually sits, without softening it',
  'Reflection': 'ask one question about what may have gone unnoticed',
};
const AREAS = G('AREAS'), SEEKS = G('SEEKS'), INT = G('INTENTIONS'), FACES = G('AREA_FACES'), ANG = G('READING_ANGLES'), MIMO = G('READING_ANGLES_MIMO_LOS');
const IMG = G('RUNE_IMAGES'), COLL = G('UI_TEXT').en.coll_rune;
const sys = G('buildSysPrompt')(null, 'en');
const intLine = (i) => (G('_intentionContext')(INT.en[i], 'en') || '').trim();
const VYS = JSON.parse(fs.readFileSync(path.join(H, 'ulohy_zdroj_vysledky.json'), 'utf8'));
const VYS0 = JSON.parse(fs.readFileSync(path.join(H, 'ulohy_vysledky.json'), 'utf8'));
let t = '';
const w = (s = '') => { t += s + '\n'; };
w('# Rúnar — testovací balíček: jak vzniká čtení ve čtyřech pohybech (CODE-read, 2026-11-23)');
w();
w('Pro ownera (česky): soubor je celý pro jinou AI. Oddíl 1 je přesný popis, jak vznikla naše čtení (systém + zadání, slovo od slova).');
w('Oddíl 2 jsou všechny vstupy, ze kterých se zadání skládá, oddíl 3 je pět run se vším, co k nim máme, oddíl 4 je úkol pro jinou AI.');
w('Vše je vytažené skriptem `balicek_build.js` přímo z produkčního kódu v2 a ze souborů labu; ručně jsou psané jen „dvě strany“ u Fehu a Gebo');
w('(citace z `RUNAR_POPISY_RUN.md` u každé).');
w();
w('---');
w();
w('## 0. Instructions for the AI that receives this file');
w('You are given everything needed to rebuild the prompts that produced the readings below, plus every input the prompt can take.');
w('Your job (section 4): generate readings across many input combinations for five runes, then judge how varied they are. Write readings');
w('as Rúnar would — you are standing in for the production model. Do not invent new inputs; use only the options listed here.');
w();
w('## 1. How the three readings were made — exact prompts');
w('Model: `gpt-6-sol`, reasoning effort `none`, max 700 output tokens. Two messages: **system** (1.1) and **user** (1.2). No examples, no');
w('earlier turns. The model returns a JSON array `[{"rune": …, "text": …}]`; only `text` is the reading.');
w();
w('### 1.1 System message (production, verbatim)');
w('```'); w(sys.trim()); w('```');
w();
w('### 1.2 User message — template');
w('Slots in `{BRACES}` are filled from section 2 and 3. `{SOURCE_LINE}` has three variants (1.3).');
w('```');
w('DRAWN RUNE: {RUNE} — focus on: {FOCUS_WORD}');
w('{PURPOSE_LINE}');
w('READING ANGLE (follow this entry point — let it shape the opening and tone): {ANGLE}');
w('{SOURCE_LINE}');
w('THE PICTURE: {PICTURE}');
w('');
w('Write the reading as four sentences, each with its own work, each adding something the others do not:');
w('1. IMAGE — the picture, seen your own way, down to one detail the sentence does not name. The tension it holds stays inside the scene; do not explain it.');
w('2. MEANING — what the picture reveals about human experience: the side of {RUNE} {SIDE_REF}, as something that would not be true of another rune. Not a definition, and not the picture said again.');
w('3. LANDING — bring that meaning to {AREA_FACE}: a possibility, a tension, or two sides of it, without saying what is true in their life and without advice. Do not list the choices they made.');
w('4. OPENING — {ENDING_FUNCTION}. Let it grow out of the first three sentences and leave the answer with them.');
w('');
w('Do not name or define the rune — no "{RUNE} is", "stands for", "represents", "the rune of"; the seeker already sees which rune was drawn.');
w('NO COLD READING: never tell the seeker what is true, stirring, or known inside them — that is an unfalsifiable guess wearing the clothes of knowledge. Describe the image; their inner life is not yours to narrate. The world is not arranging itself around them either: no omen, no preparation, no destiny at work.');
w('One paragraph, 50 to 65 words, read aloud. No advice: no "should", "must", "try", "need to".');
w('Output format — return ONLY this JSON array, nothing before or after: [{"rune": "(the rune name)", "text": "(the reading, one paragraph)"}]');
w('```');
w();
w('### 1.3 `{SOURCE_LINE}` — the three variants we tried');
w('| variant | `{SOURCE_LINE}` | `{SIDE_REF}` |');
w('|---|---|---|');
w('| A. mechanism sentence | `THE SIDE OF {RUNE} THIS PICTURE CARRIES (your source, not words to repeat): {MECHANISM}` | `it carries` |');
w('| B. focus word only | *(line left out)* | `named by the focus word` |');
w('| C. two sides | `TWO SIDES OF {RUNE} (choose the one this picture carries best, and let only that one shape the reading; your source, not words to repeat): 1) {SIDE_1} · 2) {SIDE_2}` | `you chose` |');
w();
w('### 1.4 The readings and their exact inputs');
const proc = (arr, nazev) => {
  w('**' + nazev + '**'); w();
  for (const x of arr) {
    const m = x.prompt.match(/READING ANGLE \(follow this entry point — let it shape the opening and tone\): (.+)/);
    w('- **' + x.runa + '** · area *' + x.area + '* · seeking *' + x.seeking + '* · purpose *' + x.intention + '* · angle *' + (m ? m[1] : '?') + '* · picture *' + x.obraz + '* · focus *' + x.fokus + '*');
    w('  > ' + x.text);
  }
  w();
};
proc(VYS0, 'Variant A (mechanism sentence)');
proc(VYS.filter((x) => x.zdroj === 'slovo'), 'Variant B (focus word only)');
proc(VYS.filter((x) => x.zdroj === 'strany'), 'Variant C (two sides)');
w('Full user prompt of each reading, word for word, is in `ulohy_vysledky.json` and `ulohy_zdroj_vysledky.json` (field `prompt`). Example, Hagalaz C:');
w('```'); w(VYS.find((x) => x.id === 'hagalaz-strany').prompt); w('```');
w();
w('## 2. Every input the user prompt can take');
w('All of area, seeking and purpose are **optional** for the seeker. The angle is always drawn by lot.');
w();
w('### 2.1 Area of life → `{AREA_FACE}` (one face of the area is drawn by lot)');
w('If no area is chosen, use `{AREA_FACE}` = `the seeker\'s life as it is now` (lab choice; production then has no area line).');
AREAS.en.forEach((a, i) => w('- **' + a + '** — ' + FACES[i].map((f) => '`' + f.en[0] + '`').join(' · ')));
w();
w('### 2.2 What are you seeking? → `{ENDING_FUNCTION}`');
w('If nothing is chosen, use General Guidance. (These five are the lab wording; production v2 has a shorter tone line per seeking.)');
SEEKS.en.forEach((s) => w('- **' + s + '** — `' + KONCE[s] + '`'));
w();
w('### 2.3 This reading is for → `{PURPOSE_LINE}`');
w('If nothing is chosen, leave the line out.');
INT.en.forEach((s, i) => w('- **' + s + '** — `' + intLine(i) + '`'));
w();
w('### 2.4 Opening angle → `{ANGLE}` (drawn by lot; [' + MIMO.join(', ') + '] is out of the lot since 2026-11-19 — it made the model invent a fixed object)');
ANG.forEach((a, i) => w('- [' + i + ']' + (MIMO.includes(i) ? ' *(out of lot)*' : '') + ' `' + a + '`'));
w();
w('### 2.5 What production v2 adds today that the four-movement prompt does NOT use (for comparison, not for section 4)');
w('- **Essence line:** after the picture, a line beginning `{RUNE} {VERB}` that says the rune\'s meaning; `{VERB}` drawn from: ' + G('ESSENCE_VERBS_SOL').map((v) => '`' + v + '`').join(' · ') + '.');
w('- **Ending shape** (drawn, or fixed by seeking), `{L}` = the area face:');
G('ENDING_OPEN').forEach((e, i) => w('  - open [' + i + '] `' + e + '`'));
w('- **Heavy ending** (used for heavy runes and for Insight into Challenge). Heavy runes: ' + (G('HEAVY_RUNES').names || []).join(', ') + '.');
G('ENDING_HEAVY').forEach((e, i) => w('  - heavy [' + i + '] `' + e + '`'));
w('- Production also feeds: the seeker\'s name and where it lands, the life rune as a lens for the last sentence, a block of picture rules');
w('  (THE IMAGE), and the rune\'s own question as the source of the ending. A full production prompt can be printed with `vypis_v2.js`.');
w();
w('## 3. Five runes — everything we have for each');
w('`{FOCUS_WORD}` comes with the picture: bank pictures carry their own focus word; for round-4 pictures use the rune\'s first bank focus word.');
w('Bank = pictures in production today. Round 4 = new pictures with built-in tension (lab, approved by the owner, not yet in production).');
for (const R of RUNY) {
  w(); w('### ' + R);
  w('- **Rune\'s own question** (from the app\'s rune page; production uses it as the source for the ending): ' + (COLL[R] ? COLL[R][3] : '?'));
  w('- **Mechanism sentence** (variant A): ' + MECH[R]);
  const st = STRANY[R] || [];
  w('- **Two sides** (variant C): 1) ' + (st[0] ? st[0][0] : '?') + ' · 2) ' + (st[1] ? st[1][0] : '?'));
  if (st[0] && st[0][1]) w('  - source (owner\'s Czech description): ' + st.map((s) => s[1]).filter((v, i, a) => a.indexOf(v) === i).join(' · '));
  w('- **Bank pictures** (picture — focus word):');
  for (const row of IMG.filter((r) => r[0] === R)) w('  - ' + row[3] + ' — *' + row[5] + '*');
  w('- **Round-4 pictures:**');
  for (const s of KOLO4[R] || []) w('  - ' + s);
}
w();
w('## 4. Task for the other AI');
w('1. For each of the five runes, write **8 readings**: 4 pictures (2 bank, 2 round-4) × 2 combinations of area / seeking / purpose / angle that');
w('   differ from each other. Use variant C (two sides) unless told otherwise. Follow the system and user message exactly as in section 1.');
w('2. For every reading, list the inputs you used (rune, picture, focus word, area + face, seeking, purpose, angle, chosen side).');
w('3. Then judge the 40 readings:');
w('   - **Variety:** phrases or sentence openings that repeat across readings of the same rune (quote them, count them).');
w('   - **Copying:** words taken over from the source line, the focus word, the area face or the rune\'s question.');
w('   - **Rules:** rune named or defined · advice · claims about the seeker\'s inner life · omen or fate.');
w('   - **Sense:** does sentence 2 still make sense with this picture? Does the whole reading sound natural read aloud?');
w('4. Say which inputs made the readings most alike and which made them most different, and what you would change in the user message.');
fs.writeFileSync(path.join(H, 'testovaci-balicek.md'), t);
console.log('ok', t.split('\n').length, 'řádků');
