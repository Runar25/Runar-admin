// ㉶ VÝBĚR OBRAZU PRO ADMINA (2026-10-06, KUKY „přidej výběr obrazu pro admina“) — owner testuje jednu runu opakovaně a chce
// tentýž obraz víckrát; sáček mu dával pokaždé jiný. Seed-and-assert produkční cestou (§19): reader UI (_paintImgPin, setImgPin)
// → IMG_PIN → _seasonalImagery → buildReadingPrompt / buildNornsPrompt → řádek obrazu a `focus on:` / `áhersla:` → _drawsSPinem.
// Hlídá: zvolený obraz padne i mimo svou oblast a sezónu · zvolený význam drží, „střídat“ střídá · sáček a „poslední obraz“ se
// nečerpají · ne-admin volbu nemá · bez volby se nic nemění · prompt_draws nese pin jen u čtení na zvoleném obraze.
// Mutace 2026-10-06: ne-admin s volbou · zvolený obraz čerpá sáček · zvolený význam ignorován · volba jen v sezóně · volba ne ve
// spreadu · volba jen v „povolené“ oblasti → všech 6 FAIL. Dvě mutace jsou v dosažitelných stavech bez rozdílu, proto je test
// chytit nemůže: nenulovat _imgPinPouzit na začátku (každá banka má kandidáta, takže se příznak vždy přepíše) a filtrovat zvolený
// obraz oblastí (_imgPodleOblasti při prázdném výsledku vrací vstup).
//   node scripts/verify_image_pin.js
const vm = require('vm'), fs = require('fs'), path = require('path');
const D = path.join(__dirname, '..', 'v2') + path.sep;
const st = {}, el = {};
const mk = (id) => (el[id] = el[id] || { id, innerHTML: '', textContent: '', value: '', title: '', style: {}, classList: { add() {}, remove() {}, toggle() {} } });
const S = { console: { log() {}, warn() {}, error() {} }, setTimeout: () => 0, clearTimeout() {}, navigator: {}, location: { search: '', href: '' }, addEventListener() {},
  document: { getElementById: mk, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, createElement: () => mk('x') },
  localStorage: { getItem: (k) => (k in st ? st[k] : null), setItem: (k, v) => { st[k] = String(v); }, removeItem: (k) => { delete st[k]; } } };
S.window = S; S.globalThis = S; vm.createContext(S);
for (const f of ['runar-config.js', 'runar-runes.js', 'runar-translations.js', 'runar-character.js', 'runar-utils.js', 'runar-reading.js'])
  vm.runInContext(fs.readFileSync(D + f, 'utf8') + '\n;\n', S);
// Červenec: zvolený „cold“ obraz (poryv) by sezónou nikdy neprošel — volba ho musí pustit.
vm.runInContext('var lang = "en"; var currentUser = null; var readerRune = null; var __RD = Date; Date = function () { return new __RD(2026, 6, 15); }; Date.now = __RD.now;' +
  'var __s = 7; Math.random = function () { __s = (__s * 1103515245 + 12345) % 2147483648; return __s / 2147483648; };', S);
let fail = 0;
const rekni = (ok, popis) => { if (ok) console.log('OK    ' + popis); else { fail++; console.log('FAIL  ' + popis); } };
const IM = vm.runInContext('RUNE_IMAGES', S), RU = vm.runInContext('RUNES', S), ADMIN = vm.runInContext('ADMIN_EMAILS', S)[0];
const runa = (n) => RU.find((r) => r.n === n), H = runa('Hagalaz');
const poryv = IM.find((r) => r[0] === 'Hagalaz' && r[3].indexOf('The squall strikes') === 0);
const okno = IM.find((r) => r[0] === 'Hagalaz' && r[3].indexOf('The storm breaks the window') === 0);
const bez = (t) => t.replace(/\.\s*$/, '');
const u = (area) => ({ name: 'Kuky', area, seeking: '', question: '', intention: '' });
const fokus = (p, l) => { const m = p.match(new RegExp((l === 'is' ? 'áhersla' : 'focus on') + ': ([^·\\n]+)')); return m ? m[1].trim() : ''; };
const id = (row) => S._imgId(row);

// 1) UI: admin vybere runu a obraz; ne-admin volbu nemá
S.localStorage.setItem('runar_img_pin', JSON.stringify({ Hagalaz: { img: id(poryv), vyz: '' } }));
vm.runInContext('currentUser = { email: ' + JSON.stringify(ADMIN) + ' }; readerRune = RUNES.find(function (r) { return r.n === "Hagalaz"; });', S);
S._paintImgPin();
rekni(el['img-pin'].style.display === 'flex', 'admin s vybranou runou volbu vidí');
rekni(el['img-pin-img'].innerHTML.indexOf('selected') !== -1 && el['img-pin-img'].innerHTML.indexOf('The squall strikes') !== -1, 'uložený obraz je ve výběru označen');
rekni(el['img-pin-vyz'].style.display === '' && (el['img-pin-vyz'].innerHTML.match(/<option/g) || []).length === 3, 'obraz se dvěma významy nabídne „střídat“ + 2 významy');
vm.runInContext('currentUser = { email: "nekdo@example.com" };', S);
S._paintImgPin();
rekni(vm.runInContext('IMG_PIN', S) === null && el['img-pin'].style.display === 'none', 'ne-admin: volba skrytá a IMG_PIN prázdný (los jako vždy)');
vm.runInContext('currentUser = { email: ' + JSON.stringify(ADMIN) + ' };', S);
S._paintImgPin();

// 2) zvolený obraz padne i mimo sezónu (červenec × „cold“) a sáček se nečerpá
// Sáček obrazů TÉTO runy (klíče s „rune_“). Sezónní pool má vlastní sáček, který se čerpá při každém čtení (CLAUDE.md „Obraznost“)
// a obrazy run nevybírá — do srovnání nepatří. Napřed dva běžné losy, ať je co porovnávat.
const sacekRuny = () => JSON.stringify(Object.entries(st).filter(([k]) => /^(seasonbag_[a-z]+_rune_|seasonlast_rune_|seasonmotif_rune_)/.test(k)).sort());
vm.runInContext('IMG_PIN = null;', S);
S.buildReadingPrompt(u('Inner Growth'), H, 'en', []); S.buildReadingPrompt(u('Inner Growth'), H, 'en', []);
S._paintImgPin();
const pred = sacekRuny();
const fEN = [];
for (let i = 0; i < 4; i++) {
  const p = S.buildReadingPrompt(u('Inner Growth'), H, 'en', []);
  if (p.indexOf(bez(poryv[3])) === -1) { rekni(false, 'zvolený obraz v promptu (tah ' + (i + 1) + ')'); break; }
  fEN.push(fokus(p, 'en'));
  if (!vm.runInContext('_imgPinPouzit', S)) rekni(false, '_imgPinPouzit po tahu ' + (i + 1));
}
rekni(fEN.length === 4, 'zvolený „cold“ obraz padá i v červenci, 4 tahy ze 4');
rekni(new Set(fEN).size === 2, 'význam „střídat“ dál střídá (' + fEN.join(' / ') + ')');
const po = sacekRuny();
rekni(pred !== '[]' && pred === po, 'sáček obrazů runy ani „poslední obraz“ se zvoleným obrazem nečerpají');

// 3) admin zvolí i význam → drží v obou jazycích; obraz cizí oblasti padne i tam
el['img-pin-img'].value = id(okno); S.setImgPin();
el['img-pin-vyz'].value = '1'; S.setImgPin();
const ulozeno = JSON.parse(st.runar_img_pin).Hagalaz;
rekni(ulozeno.img === id(okno) && ulozeno.vyz === '1', 'setImgPin uloží obraz i význam');
const altEN = okno[5].split('|'), altIS = okno[4].split('|');
let drzi = true;
for (let i = 0; i < 3; i++) {
  const pe = S.buildReadingPrompt(u('Career & Creativity'), H, 'en', []);
  const pi = S.buildReadingPrompt(u('Career & Creativity'), H, 'is', []);
  if (pe.indexOf(bez(okno[3])) === -1 || pi.indexOf(bez(okno[2])) === -1 || fokus(pe, 'en') !== altEN[1] || fokus(pi, 'is') !== altIS[1]) drzi = false;
}
rekni(drzi, 'obraz jen pro Love/Family padne i v Career; zvolený význam drží (EN ' + altEN[1] + ', IS ' + altIS[1] + ')');
const pS = S.buildNornsPrompt(u(''), ['Fehu', 'Hagalaz', 'Isa'].map(runa), 'en', []);
rekni(pS.indexOf(bez(okno[3])) !== -1 && vm.runInContext('_imgPinPouzit', S) === true, 'spread se zvolenou runou bere zvolený obraz');

// 4) prompt_draws: pin jen u čtení na zvoleném obraze
const pP = S.buildReadingPrompt(u(''), H, 'en', []);
rekni(S._drawsSPinem(pP, 'en').pin === 1, 'prompt_draws.pin = 1 u čtení na zvoleném obraze');
const pI = S.buildReadingPrompt(u(''), runa('Isa'), 'en', []);
rekni(!S._drawsSPinem(pI, 'en').pin && vm.runInContext('_imgPinPouzit', S) === false, 'jiná runa: los jako vždy, bez pin');

// 5) volba zpět na „náhodně“ → los; obraz jen pro Love/Family se v Career zase nevylosuje
el['img-pin-img'].value = ''; S.setImgPin();
rekni(!JSON.parse(st.runar_img_pin).Hagalaz, '„náhodně“ volbu smaže');
let cizi = 0;
for (let i = 0; i < 60; i++) if (S.buildReadingPrompt(u('Career & Creativity'), H, 'en', []).indexOf(bez(okno[3])) !== -1) cizi++;
rekni(cizi === 0 && vm.runInContext('_imgPinPouzit', S) === false, 'bez volby: obraz cizí oblasti 0× z 60, pin se nezapisuje');

if (fail) { console.log('\n' + fail + ' selhalo'); process.exit(1); }
console.log('\nOK    výběr obrazu pro admina: obraz i význam drží (mimo sezónu i oblast, single i spread), sáček netknutý, ne-admin bez volby, pin v prompt_draws');
