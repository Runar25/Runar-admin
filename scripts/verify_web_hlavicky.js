// verify_web_hlavicky.js — hlavičky a okolí stránek webu therunekeeper.com (CODE-web 2026-10-27).
//
// Proč (owner 2026-10-27: „zajímavé, že jsi na to za celou dobu nepřišel… na co jsi ještě nepřišel, protože jsi to neskontroloval?“):
// odkaz sdílený z Instagramu nebo Messengeru neměl náhled (žádné og značky ani obrázek), /ferdin/ neměla ikonu, ikonu pro plochu iPhonu
// neměla /heim/ ani /kort/, neexistující adresa ukazovala obecnou stránku GitHubu a /favicon.ico vracel 404. Testovalo se jen to, co
// stránka ukazuje; hlavičku a okolí stránky nehlídal nikdo. Co se má dít pokaždé, dělá stroj (§30).
//
// Co hlídá (každá stránka web/site/**/*.html, bez komentářů a vložených skriptů):
//   (a) <html lang>, meta viewport, neprázdný <title>, ikona (rel="icon") a ikona pro plochu iPhonu (rel="apple-touch-icon");
//   (b) veřejná stránka (bez noindex) má náhled při sdílení: meta description, og:title, og:description, og:image, og:url, twitter:card.
//       Stránka skrytá noindexem ne — až /heim/ při spuštění noindex ztratí, kontrola si og:url vyžádá sama (krok v BACKLOGu);
//   (c) <meta data-meta="klíč" content="…">: klíč je v UI_TEXT.is a content není prázdný (doplňuje ho scripts/web_nasad.py). Liší-li se
//       content od UI_TEXT, je to jen ⚠: text mění tune, web nasazuje web — kontrola nesmí zastavit cizí push; příští nasazení ho srovná.
//       Smazaný nebo přejmenovaný klíč ale FAIL: web na něm stojí (web_nasad.py by při nasazení skončil chybou);
//   (d) og:image na therunekeeper.com a místní odkazy (href/src relativní nebo od kořene) vedou na soubor ve web/site;
//   (e) web/site/404.html a web/site/favicon.ico existují.
// Životní cyklus (memory guard-test-the-lifecycle): nová stránka bez ikon → FAIL · tune změní hero_quote → ⚠, push projde · tune klíč smaže → FAIL
// · /heim/ ztratí noindex při spuštění → FAIL, dokud nemá og:url · smazaný og.jpg → FAIL · vendor/ (cizí knihovny) se nečte.
// Neumí: odkazy mimo web (https://…), odkazy skládané v JS ani to, jak náhled vykreslí Facebook — to jen ručně (vložit odkaz do Messengeru).
//   node scripts/verify_web_hlavicky.js        · --test = kontrola sama sebe (dočasný strom)
'use strict';
const fs = require('fs'), path = require('path'), os = require('os');
const ROOT = path.resolve(__dirname, '..');
const WEB = 'https://therunekeeper.com/';
const NAHLED = [['name', 'description'], ['property', 'og:title'], ['property', 'og:description'], ['property', 'og:image'],
  ['property', 'og:url'], ['name', 'twitter:card']];

function uiText(root) {
  const src = fs.readFileSync(path.join(root, 'v2', 'runar-translations.js'), 'utf8');
  return new Function(src + '\n;return UI_TEXT;')();
}

function stranky(d) {
  let out = [];
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) { if (f !== 'vendor') out = out.concat(stranky(p)); }
    else if (f.endsWith('.html')) out.push(p);
  }
  return out;
}

// stejné čištění jako cisty() ve web_nasad.py (bez escapování — porovnává se s odescapovaným content)
function cisty(v) {
  return String(v || '').replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
    .replace(/^["„“”]+|["„“”]+$/g, '').trim();
}
const odescapuj = (v) => v.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const atribut = (tag, jm) => { const m = tag.match(new RegExp('\\b' + jm + '="([^"]*)"', 'i')); return m ? m[1] : null; };

function zkontroluj(site, UI) {
  const chyby = [], varovani = [];
  for (const nutny of ['404.html', 'favicon.ico']) if (!fs.existsSync(path.join(site, nutny))) chyby.push('web/site/' + nutny + ' chybí');
  const vse = stranky(site);
  for (const p of vse) {
    const jm = path.relative(site, p).replace(/\\/g, '/');
    const html = fs.readFileSync(p, 'utf8').replace(/<!--[\s\S]*?-->/g, '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
    const ch = (t) => chyby.push(jm + ': ' + t);
    // (a)
    if (!/<html\b[^>]*\blang="[a-z]{2}"/i.test(html)) ch('chybí <html lang>');
    if (!/<meta\b[^>]*\bname="viewport"/i.test(html)) ch('chybí meta viewport');
    if (!/<title>\s*[^<\s][^<]*<\/title>/i.test(html)) ch('chybí nebo je prázdný <title>');
    if (!/<link\b[^>]*\brel="icon"/i.test(html)) ch('chybí ikona (link rel="icon")');
    if (!/<link\b[^>]*\brel="apple-touch-icon"/i.test(html)) ch('chybí ikona pro plochu iPhonu (link rel="apple-touch-icon")');
    const metas = html.match(/<meta\b[^>]*>/gi) || [];
    const skryta = metas.some((t) => (atribut(t, 'name') || '').toLowerCase() === 'robots' && /noindex/i.test(atribut(t, 'content') || ''));
    // (b)
    if (!skryta) {
      for (const [a, h] of NAHLED) {
        const t = metas.find((x) => (atribut(x, a) || '').toLowerCase() === h);
        if (!t) ch('veřejná stránka bez ' + h + ' (náhled při sdílení)');
        else if (!(atribut(t, 'content') || '').trim()) ch(h + ' má prázdný content');
      }
    }
    // (c)
    for (const t of metas) {
      const k = atribut(t, 'data-meta');
      if (k === null) continue;
      const c = odescapuj(atribut(t, 'content') || '');
      if (!UI.is || !UI.is[k]) ch('data-meta="' + k + '" — klíč v UI_TEXT.is není');
      else if (!c.trim()) ch('data-meta="' + k + '" má prázdný content — pusť python -X utf8 scripts/web_nasad.py --jen-verze');
      else if (c !== cisty(UI.is[k])) varovani.push(jm + ': popis data-meta="' + k + '" se liší od UI_TEXT.is (srovná ho příští scripts/web_nasad.py)');
    }
    // (d)
    const og = metas.find((x) => (atribut(x, 'property') || '') === 'og:image');
    const ogc = og ? atribut(og, 'content') || '' : '';
    if (ogc.startsWith(WEB) && !fs.existsSync(path.join(site, ogc.slice(WEB.length).split(/[?#]/)[0]))) ch('og:image ' + ogc + ' ve web/site není');
    const re = /\b(?:href|src)="([^"]*)"/gi;
    let m;
    while ((m = re.exec(html))) {
      const u = m[1].split(/[?#]/)[0];
      if (!u || /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(m[1])) continue;   // https:, mailto:, data:… a //host mimo web
      let cil = u.startsWith('/') ? path.join(site, u) : path.join(path.dirname(p), u);
      if (u.endsWith('/')) cil = path.join(cil, 'index.html');
      if (!fs.existsSync(cil)) ch('místní odkaz „' + m[1] + '“ vede na soubor, který ve web/site není');
    }
  }
  return { chyby, varovani, n: vse.length };
}

if (process.argv.includes('--test')) {
  const UI = { is: { hero_quote: '"Fyrsta lína.<br>Önnur lína."' } };
  const HLAVA = '<!doctype html><html lang="is"><head><meta name="viewport" content="width=device-width"><title>T</title>' +
    '<link rel="icon" href="https://x/i.png"><link rel="apple-touch-icon" href="https://x/a.png">';
  const SKRYTA = '<meta name="robots" content="noindex">';
  const NAHL = '<meta name="description" data-meta="hero_quote" content="Fyrsta lína. Önnur lína."><meta property="og:title" content="T">' +
    '<meta property="og:description" data-meta="hero_quote" content="Fyrsta lína. Önnur lína."><meta property="og:image" content="' + WEB +
    'img/og.jpg"><meta property="og:url" content="' + WEB + '"><meta name="twitter:card" content="summary_large_image">';
  const KONEC = '</head><body><a href="sub/">x</a><img src="/img/og.jpg"><a href="mailto:a@b.c">m</a><a href="https://y/">y</a>' +
    '<script>var s = \'<a href="\' + nikam + \'">\';</script><!-- <a href="neni/"> --></body></html>';
  // [popis, soubory {cesta: obsah | null = smazat}, má spadnout]
  const P = [
    ['dobrý web projde', {}, false],
    ['veřejná stránka bez og:image', { 'index.html': HLAVA + NAHL.replace(/<meta property="og:image"[^>]*>/, '') + KONEC }, true],
    ['veřejná stránka bez og:url (/heim/ po spuštění)', { 'index.html': HLAVA + NAHL.replace(/<meta property="og:url"[^>]*>/, '') + KONEC }, true],
    ['skrytá stránka bez náhledu projde', { 'sub/index.html': HLAVA + SKRYTA + '</head><body><a href="../">z</a></body></html>' }, false],
    ['stránka bez ikony', { 'sub/index.html': HLAVA.replace('rel="icon"', 'rel="x"') + SKRYTA + '</head></html>' }, true],
    ['stránka bez ikony pro iPhone', { 'sub/index.html': HLAVA.replace('apple-touch-icon', 'x') + SKRYTA + '</head></html>' }, true],
    ['prázdný popis z data-meta', { 'index.html': HLAVA + NAHL.replace('content="Fyrsta lína. Önnur lína."', 'content=""') + KONEC }, true],
    ['data-meta s klíčem, který v UI_TEXT není', { 'index.html': HLAVA + NAHL.replace('data-meta="hero_quote" content', 'data-meta="neni_klic" content') + KONEC }, true],
    ['rozbitý místní odkaz', { 'index.html': HLAVA + NAHL + KONEC.replace('href="sub/"', 'href="subX/"') }, true],
    ['og:image na soubor, který není', { 'index.html': HLAVA + NAHL.replace('img/og.jpg', 'img/ogX.jpg') + KONEC }, true],
    ['chybí 404.html', { '404.html': null }, true],
    ['chybí favicon.ico', { 'favicon.ico': null }, true],
    ['jiný popis než UI_TEXT = jen varování', { 'index.html': HLAVA + NAHL.replace(/Önnur lína\./g, 'Gömul lína.') + KONEC }, false],
  ];
  const zle = [];
  for (const [popis, soubory, spadne] of P) {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), 'runar-webhl-'));
    const zaklad = { 'index.html': HLAVA + NAHL + KONEC, 'sub/index.html': HLAVA + SKRYTA + '</head><body><a href="../">z</a></body></html>',
      '404.html': HLAVA + SKRYTA + '</head></html>', 'favicon.ico': 'x', 'img/og.jpg': 'x' };
    for (const [f, obsah] of Object.entries(Object.assign({}, zaklad, soubory))) {
      if (obsah === null) continue;
      fs.mkdirSync(path.dirname(path.join(d, f)), { recursive: true });
      fs.writeFileSync(path.join(d, f), obsah);
    }
    const r = zkontroluj(d, UI);
    if ((r.chyby.length > 0) !== spadne) zle.push(popis + (spadne ? ' — nespadla' : ' — spadla: ' + r.chyby.join('; ')));
    if (popis.indexOf('varování') >= 0 && !r.varovani.length) zle.push(popis + ' — varování chybí');
    fs.rmSync(d, { recursive: true, force: true });
  }
  zle.forEach((z) => console.log('FAIL test: ' + z));
  if (!zle.length) console.log('OK    test kontroly hlaviček webu: ' + P.length + ' případů (zachytí i pustí)');
  process.exit(zle.length ? 1 : 0);
}

const r = zkontroluj(path.join(ROOT, 'web', 'site'), uiText(ROOT));
r.varovani.forEach((v) => console.log('⚠     ' + v));
if (r.chyby.length) {
  r.chyby.forEach((c) => console.log('FAIL  ' + c));
  console.log('FAIL  web hlavičky: ' + r.chyby.length + ' vad(a) — ikony, náhled při sdílení, místní odkazy, 404 nebo favicon');
  process.exit(1);
}
console.log('OK    web hlavičky: ' + r.n + ' stránek — ikony, náhled při sdílení (veřejné), popisy z UI_TEXT, místní odkazy, 404 a favicon');
