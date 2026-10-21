// Společné pro stránky webu therunekeeper.com (CODE-web 2026-10-21). Adresa appky stojí JEN tady — až appka přejde na
// app.therunekeeper.com (DECISIONS 2026-10-12 (6), plán infrastruktury), změní se jeden řádek. Do 2026-10-21 ji měla každá stránka zvlášť.
var RUNAR_APP_URL = 'https://runar25.github.io/Runar-admin/v2/runar-reader.html';
// Adresa domovské stránky (značka RÚNAR v liště) = RUNAR_HOME_URL v v2/runar-config.js — jen tam; web.js ji NEDEKLARUJE
// (2026-10-21: druhá deklarace tu shodila celý soubor a s ním web).
// Motto (UI_TEXT.hero_quote) má v datech rovné uvozovky "…" → islandsky „…“, anglicky “…” (Greynir N001, 2026-10-21).
function webUvozovky(v, lang) {
  v = String(v || '').replace(/^"|"$/g, '');
  return lang === 'is' ? '\u201E' + v + '\u201C' : '\u201C' + v + '\u201D';
}
