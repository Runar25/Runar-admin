// Společné pro stránky webu therunekeeper.com (CODE-web 2026-10-21). Adresa appky stojí JEN tady — až appka přejde na
// app.therunekeeper.com (DECISIONS 2026-10-12 (6), plán infrastruktury), změní se jeden řádek. Do 2026-10-21 ji měla každá stránka zvlášť.
var RUNAR_APP_URL = 'https://runar25.github.io/Runar-admin/v2/runar-reader.html';
// Adresa domovské stránky (značka RÚNAR v liště) = RUNAR_HOME_URL v v2/runar-config.js — jen tam; web.js ji NEDEKLARUJE
// (2026-10-21: druhá deklarace tu shodila celý soubor a s ním web).
// Motto (UI_TEXT.hero_quote) má v datech rovné uvozovky "…" → islandsky „…“, anglicky “…” (Greynir N001, 2026-10-21).
// Jazyk webu (owner 2026-10-27 „udělej všech pět“, bod 4): kdo si přepne IS/EN, má ho i na dalších stránkách webu. Uloží se jen ta
// volba (localStorage — funkční nastavení na žádost uživatele, žádné sledování); první návštěva = islandština (IS primární, §2).
// Prohlížeč bez úložiště (soukromé okno, zákaz) → islandština, nic nespadne. webJazyk() čte, webJazyk('en') uloží a vrátí.
function webJazyk(l) {
  try {
    if (l) { localStorage.setItem('runar_web_lang', l); return l; }
    return localStorage.getItem('runar_web_lang') === 'en' ? 'en' : 'is';
  } catch (e) { return l || 'is'; }
}
// Odkaz na Instagram v patičce (owner 2026-10-27). Adresa bydlí v configu appky (RUNAR_INSTAGRAM_URL, appka ji ukazuje taky);
// dokud tam není, odkaz se neukáže — žádná druhá kopie adresy tady (§20). el = <a> v patičce.
function webInstagram(el) {
  if (!el) return;
  var u = typeof RUNAR_INSTAGRAM_URL === 'string' ? RUNAR_INSTAGRAM_URL : '';
  el.style.display = u ? '' : 'none';
  var odd = el.previousSibling;   // tečka-oddělovač „ · “ před odkazem (textový uzel) se schová s ním
  if (odd && odd.nodeType === 3) odd.textContent = u ? ' · ' : '';
  if (u) { el.href = u; el.target = '_blank'; el.rel = 'noopener'; }
}
function webUvozovky(v, lang) {
  v = String(v || '').replace(/^"|"$/g, '');
  return lang === 'is' ? '\u201E' + v + '\u201C' : '\u201C' + v + '\u201D';
}
