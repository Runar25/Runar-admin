# -*- coding: utf-8 -*-
# web_runy.py — stránky run na webu therunekeeper.com: rejstřík (Safn rúna) a 25 run, islandsky i anglicky, každá runa s obrázkem
# pro sdílení, a sitemap.xml (CODE-web 2026-11-02; owner k náhledu „design je dobrý. zkusíme to… ať to vidím a můžu dělat změny“
# a „chci maximalizovat viditelnost na google“; podnět Cowork HANDOFF69; DECISIONS 2026-11-02 (7)).
#
# Proč staticky: náhled při sdílení (og:image) i vyhledávače čtou HTML bez JavaScriptu — text proto musí stát ve stránce, ne se
# doplňovat skriptem. Zdroj je appka (UI_TEXT.coll_rune / coll_shape, runeSvg, lifeRuneSpan, rnSplit) přes
# scripts/utils/web_runy_data.js; stránky jsou GENEROVANÉ — needitovat ručně: změna textu = změna v appce + znovu pustit tenhle skript
# (dělá to sám scripts/web_nasad.py před každým nasazením). Každá stránka nese otisk zdroje (meta generator): smoke ㊙
# (verify_web_runy.py) podle něj pozná změněný text v appce (jen ⚠ — srovná příští nasazení) od ruční úpravy stránky (FAIL).
# Obsah (owner 2026-11-02 k návrhu): z každé runy popis tvaru, první a poslední odstavec Kolekce; prostřední dva odstavce a Rúnarův
# hlas zůstávají v appce. Runa půlměsíce (owner „zatím runa půlměsíce“) = calcLifeRune s dnešním datem — počítá prohlížeč, statická
# stránka dnešek nezná. Životní runa z data narození jen v prohlížeči, nic se neposílá.
#   python -X utf8 scripts/web_runy.py                 → web/site (stránky, sitemap.xml; obrázky jen chybějící)
#   python -X utf8 scripts/web_runy.py --obrazky       totéž a všechny obrázky znovu (změnila se kresba nebo jméno runy)
#   python -X utf8 scripts/web_runy.py --nahled        → web/nahled-runy/ (noindex, mimo web/site — web_nasad.py ho nenasadí)
#   python -X utf8 scripts/web_runy.py --kontrola      jen porovná web/site se zdrojem (smoke ㊙ přes verify_web_runy.py)
import hashlib, html, io, json, os, re, shutil, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, 'web', 'site')
NAHLED = os.path.join(ROOT, 'web', 'nahled-runy')
WEB = 'https://therunekeeper.com/'
APP = 'https://runar25.github.io/Runar-admin/v2/'
CHROME = [r'C:\Program Files\Google\Chrome\Application\chrome.exe',
          r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe']
# Veřejné stránky webu mimo stránky run, které patří do sitemapy (při spuštění přibude 'ferdin/' — BACKLOG „Domovská stránka“).
DALSI_V_SITEMAPE = ['']

# Nové věty jen pro web (jako WEB_TXT na /heim/). IS ověřeno 2026-11-02: Greynir — jen S004 u vzácného „lífsrún“ a W001/w u „rúnina“
# (falešné poplachy; „rúnina“ má i nadpis Kolekce coll_rune_lbl); korpus „þeirra sem fæðast“ 79, „á þessum dögum“ 1 343, „í appinu“
# 1 299, „allur textinn“ 161, „textinn um“ 108, „les hann fyrir“ 11, „hann fyrir þig“ 664, „nú er sólin“ 28, „sólin er í“ 74 — vazba
# „sólin er í“ je táž jako v appce (tree_lr_origin „sú sem sólin var í“). „merking rúnarinnar“ 0× → do titulku se nedalo.
# skrau = tlačítko registrace z landingu (web/site/index.html); po spuštění sem přijde vstup do appky.
WEB_TXT = {
    'lr':    {'is': 'Lífsrún þeirra sem fæðast á þessum dögum.', 'en': 'The life rune of those born on these days.'},
    'app':   {'is': 'Í appinu er allur textinn um rúnina og Rúnar les hann fyrir þig.', 'en': 'The full text is in the app, and Rúnar reads it to you.'},
    'nyni':  {'is': 'Nú er sólin í {rune}', 'en': 'The sun now stands in {rune}'},
    'skrau': {'is': 'SKRÁÐU ÞIG HÉR', 'en': 'REGISTER HERE'},
    'titul': {'is': 'Rúnin {rune}', 'en': 'The rune {rune}'},
}
CESTA = {'is': 'runir/', 'en': 'en/runes/'}          # rejstřík; runa = CESTA + slug + '/'
LOCALE = {'is': 'is_IS', 'en': 'en_US'}
GEN = '<meta name="generator" content="scripts/web_runy.py · zdroj %s">'
GEN_RE = re.compile(r'<meta name="generator" content="scripts/web_runy\.py · zdroj ([0-9a-f]+)">')

def esc(s):
    return html.escape(s or '', quote=True)

def data():
    r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'utils', 'web_runy_data.js')], capture_output=True, encoding='utf-8')
    if r.returncode != 0:
        sys.exit('FAIL web_runy: ' + (r.stderr or r.stdout).strip())
    d = json.loads(r.stdout)
    for x in d['runy']:
        x['slug'] = x['n'].lower()
    return d

def webjs_verze():
    # stejně jako scripts/web_nasad.py (h()): prvních 10 znaků SHA-256 obsahu — stránka pak po nasazení vypadá stejně jako tady.
    # Konce řádků sjednocené na LF (2026-11-02): čistá kopie repa (pre-push, protipříklady) má soubory s CRLF, pracovní strom LF —
    # verze vyšla jinak, otisk zdroje taky, všech 52 stránek se tvářilo zastarale a útok „ruční úprava“ tím prošel jako ⚠.
    return hashlib.sha256(open(os.path.join(SITE, 'web.js'), 'rb').read().replace(b'\r\n', b'\n')).hexdigest()[:10]

def otisk(d):
    # otisk všeho, z čeho stránky vznikají (data appky, nové věty webu, verze web.js) — ne šablony; změnu šablony bez přegenerování
    # chytí kontrola jako FAIL (otisk sedí, obsah ne)
    s = json.dumps([d, WEB_TXT, webjs_verze()], ensure_ascii=False, sort_keys=True)
    return hashlib.sha256(s.encode('utf-8')).hexdigest()[:12]

def koren(l, runa):
    # relativní cesta ke kořeni webu: runir/x/ → ../../, en/runes/x/ → ../../../, rejstříky o patro míň
    return '../' * (CESTA[l].count('/') + (1 if runa else 0))

def jmeno(x, l):
    return x[l]['jmeno'] + (' (' + x[l]['glosa'] + ')' if x[l]['glosa'] else '')

STYL = '''<style>
/* jen to, co appka nemá — vzhled jinak z runar-reader.css appky (lišta, písmo, barvy, mřížka Kolekce .coll-grid / .coll-cell) */
.w-lang a{font-family:'Cinzel',serif;font-size:0.72em;letter-spacing:3px;color:var(--gold);opacity:.5;text-decoration:none;margin-left:14px}
.w-lang a.on{opacity:.9}
.w-main{position:relative;z-index:1;max-width:680px;margin:0 auto;padding:36px 16px 40px;text-align:center}
.w-stone{width:120px;height:auto;display:block;margin:0 auto 18px}
.w-h1{font-family:'Cinzel',serif;font-weight:400;font-size:1.9em;letter-spacing:7px;color:var(--gold);margin:0}
.w-gloss{font-style:italic;color:var(--muted);margin-top:4px}
.w-half{font-family:'Cinzel',serif;font-size:0.78em;letter-spacing:3px;color:var(--gold);opacity:.85;margin-top:18px}
.w-lr{font-style:italic;color:var(--muted);font-size:0.95em;margin-top:4px}
.w-block{text-align:left;margin-top:34px}
.w-shape{font-style:italic;color:var(--muted);line-height:1.85;margin:0}
.w-sep{width:32px;height:1px;background:linear-gradient(to right,var(--gold),transparent);margin:16px 0}
.w-text p{line-height:1.75;margin:0 0 14px}
.w-q{font-style:italic}
.w-cta{margin-top:30px}
.w-cta .note{margin-bottom:12px}
a.btn-upgrade{display:inline-block;text-decoration:none}
.w-nav{display:flex;justify-content:space-between;gap:12px;margin-top:40px;font-family:'Cinzel',serif;font-size:0.72em;letter-spacing:2.5px}
.w-nav a{color:var(--gold);text-decoration:none;opacity:.8}
.w-nav a:hover{opacity:1}
.w-now{margin:26px 0 8px}
.w-now a{color:inherit;text-decoration:none}
.w-now .w-stone{width:96px;margin-bottom:12px}
.w-now-t{font-family:'Cinzel',serif;font-size:0.9em;letter-spacing:3px;color:var(--gold)}
.w-lrf{margin:30px auto 0;max-width:30em}
.w-lrf .dob-row{display:flex;gap:10px;justify-content:center;margin-top:14px}
.w-lrf input{width:6.5em;background:transparent;border:1px solid var(--border);color:var(--white);font-family:'Cormorant Garamond',serif;font-size:1em;padding:10px 12px;text-align:center}
.w-lrf button{margin-top:16px}
.w-lr-out{margin-top:22px;display:none}
.w-lr-out a{color:inherit;text-decoration:none}
.w-origin{font-style:italic;color:var(--muted);font-size:0.9em;line-height:1.7;margin:16px auto 0;max-width:34em}
.w-main .coll-grid{margin-top:36px}
a.coll-cell{text-decoration:none}
.w-foot{position:relative;z-index:1;text-align:center;font-family:'Cinzel',serif;font-size:11px;letter-spacing:2.5px;color:var(--muted);padding:20px 16px 36px;border-top:1px solid rgba(46,74,112,0.3)}
.w-foot a{color:inherit;text-decoration:none}
.w-foot a:hover{color:var(--gold)}
</style>'''

def hlavicka(l, titul, popis, url, alt, obrazek, noindex, zdroj):
    druhy = 'en' if l == 'is' else 'is'
    r = ['<!doctype html>', '<html lang="%s">' % l, '<head>', '<meta charset="utf-8">',
         '<meta name="viewport" content="width=device-width,initial-scale=1">']
    if noindex:
        r.append('<meta name="robots" content="noindex,nofollow">')
    r += ['<title>%s</title>' % esc(titul),
          '<!-- GENEROVÁNO scripts/web_runy.py z dat appky (UI_TEXT, runeSvg, lifeRuneSpan) — needitovat ručně; změna = appka + znovu skript. -->',
          GEN % zdroj,
          '<meta name="description" content="%s">' % esc(popis),
          '<link rel="canonical" href="%s">' % url,
          '<link rel="alternate" hreflang="%s" href="%s">' % (l, url),
          '<link rel="alternate" hreflang="%s" href="%s">' % (druhy, alt),
          '<link rel="alternate" hreflang="x-default" href="%s">' % (url if l == 'is' else alt),
          '<meta property="og:type" content="website">',
          '<meta property="og:url" content="%s">' % url,
          '<meta property="og:site_name" content="Rúnar · The Rune Keeper">',
          '<meta property="og:title" content="%s">' % esc(titul),
          '<meta property="og:description" content="%s">' % esc(popis),
          '<meta property="og:locale" content="%s">' % LOCALE[l],
          '<meta property="og:image" content="%s">' % obrazek,
          '<meta property="og:image:width" content="1200">',
          '<meta property="og:image:height" content="630">',
          '<meta name="twitter:card" content="summary_large_image">',
          '<link rel="icon" type="image/png" sizes="96x96" href="%sicons/favicon-96x96.png">' % APP,
          '<link rel="apple-touch-icon" href="%sicons/apple-touch-icon.png">' % APP,
          '<link rel="stylesheet" href="%sfonts/fonts.css">' % APP,
          '<link rel="stylesheet" href="%srunar-reader.css">' % APP,
          STYL, '</head>', '<body>']
    return r

def lista(l, k, href_is, href_en):
    return ['<header class="topbar"><div class="topbar-inner">',
            '  <a class="brand" href="%s">RÚNAR</a>' % k,
            '  <span class="w-lang"><a href="%s" data-l="is"%s>IS</a><a href="%s" data-l="en"%s>EN</a></span>' % (
                href_is, ' class="on"' if l == 'is' else '', href_en, ' class="on"' if l == 'en' else ''),
            '</div></header>']

def paticka(ui, l):
    return ['<footer class="w-foot">© 2026 AGNDOFA EHF. · <a href="mailto:runar@therunekeeper.com">RUNAR@THERUNEKEEPER.COM</a> · '
            '<a href="%srunar-privacy.html">%s</a> · <a id="w-ig" style="display:none">INSTAGRAM</a></footer>' % (APP, esc(ui[l]['sp_privacy_link']))]

def skripty(k, extra, verze):
    return ['<script src="%srunar-config.js"></script>' % APP] + extra + [
            '<script src="%sweb.js%s"></script>' % (k, '?v=' + verze if verze else ''),
            '<script>',
            "document.querySelectorAll('.w-lang a').forEach(function (a) { a.onclick = function () { webJazyk(a.getAttribute('data-l')); }; });",
            "webInstagram(document.getElementById('w-ig'));"]

def stranka_runy(d, i, l, noindex, zdroj, verze):
    x = d['runy'][i]; ui = d['ui']; n = len(d['runy'])
    pred, dal = d['runy'][(i - 1) % n], d['runy'][(i + 1) % n]
    k = koren(l, True)
    url = WEB + CESTA[l] + x['slug'] + '/'
    druhy = 'en' if l == 'is' else 'is'
    alt = WEB + CESTA[druhy] + x['slug'] + '/'
    t = x[l]['text']
    titul = WEB_TXT['titul'][l].replace('{rune}', jmeno(x, l)) + ' · Rúnar'
    href = {l2: k + CESTA[l2] + x['slug'] + '/' for l2 in ('is', 'en')}
    r = hlavicka(l, titul, t[0], url, alt, WEB + 'img/runir/' + x['slug'] + '.jpg', noindex, zdroj)
    r += lista(l, k, href['is'], href['en'])
    r += ['<main class="w-main">', '  ' + x['kamen'],
          '  <h1 class="w-h1">%s</h1>' % esc(x[l]['jmeno'].upper())]
    if x[l]['glosa']:
        r.append('  <div class="w-gloss">%s</div>' % esc(x[l]['glosa']))
    if x[l]['pulmesic']:
        r += ['  <div class="w-half">%s</div>' % esc(x[l]['pulmesic'].upper()),
              '  <div class="w-lr">%s</div>' % esc(WEB_TXT['lr'][l])]
    r += ['  <section class="w-block">',
          '    <div class="card-lbl">%s</div>' % esc(ui[l]['coll_rune_lbl']),
          '    <p class="w-shape">%s</p>' % esc(x[l]['tvar']),
          '    <div class="w-sep"></div>',
          '    <div class="w-text"><p>%s</p><p class="w-q">%s</p></div>' % (esc(t[0]), esc(t[3])),
          '  </section>',
          '  <div class="w-cta"><p class="note">%s</p><a class="btn-upgrade" href="%s">%s →</a></div>' % (
              esc(WEB_TXT['app'][l]), k, esc(WEB_TXT['skrau'][l])),
          '  <nav class="w-nav"><a href="../%s/">← %s</a><a href="../">%s</a><a href="../%s/">%s →</a></nav>' % (
              pred['slug'], esc(pred[l]['jmeno'].upper()), esc(ui[l]['atab_collection']), dal['slug'], esc(dal[l]['jmeno'].upper())),
          '</main>']
    r += paticka(ui, l) + skripty(k, [], verze) + ['</script>', '</body>', '</html>', '']
    return '\n'.join(r)

# Rejstřík: mřížka jako Kolekce v appce (.coll-grid 5 × 5), nahoře runa půlměsíce, pod ní životní runa z data narození.
# Jména s předponou w — skript sdílí prostor jmen se soubory appky (smoke ㊑ hlídá dvojí deklaraci).
REJSTRIK_JS = r'''var wNowTxt = %(nyni)s, wErrTxt = %(chyba)s;
var wGrid = document.querySelector('.coll-grid');
function wCell(r) { return r ? wGrid.querySelector('[data-rune="' + r.n.toLowerCase() + '"]') : null; }
function wShow(box, c) {
  // kámen se jen zkopíruje z mřížky (táž kresba runeSvg) — žádná druhá kopie kresby
  var a = box.querySelector('a');
  a.href = c.getAttribute('href');
  a.querySelector('.w-k').innerHTML = c.querySelector('svg').outerHTML.replace('coll-svg', 'w-stone');
  a.querySelector('.w-j').textContent = c.getAttribute('data-name');
  a.querySelector('.w-p').textContent = c.getAttribute('data-half');
  box.style.display = 'block';
}
// Runa půlměsíce (owner 2026-11-02 „zatím runa půlměsíce“): calcLifeRune z appky s dnešním datem prohlížeče.
var wToday = new Date(), wNow = wCell(calcLifeRune(wToday.getDate(), wToday.getMonth() + 1));
if (wNow) {
  wNow.classList.add('active');
  wShow(document.getElementById('w-now'), wNow);
  document.querySelector('#w-now .w-now-t').textContent = wNowTxt.replace('{rune}', wNow.getAttribute('data-name')).toUpperCase();
}
// Životní runa: výpočet jen tady v prohlížeči — datum se nikam neposílá ani neukládá. Platné datum jako appka (setTreeDOB):
// den a měsíc, který v nějakém roce existuje (29. 2. ano, 31. 4. ne).
document.getElementById('w-lr-form').addEventListener('submit', function (e) {
  e.preventDefault();
  var d = parseInt(document.getElementById('w-d').value, 10), m = parseInt(document.getElementById('w-m').value, 10);
  var ok = d >= 1 && d <= 31 && m >= 1 && m <= 12 && new Date(Date.UTC(2000, m - 1, d)).getUTCMonth() === m - 1;
  var c = ok ? wCell(calcLifeRune(d, m)) : null, out = document.getElementById('w-lr-out'), er = document.getElementById('w-lr-err');
  er.textContent = c ? '' : wErrTxt;
  if (c) wShow(out, c); else out.style.display = 'none';
});
'''

def rejstrik(d, l, noindex, zdroj, verze):
    ui = d['ui']; k = koren(l, False)
    url = WEB + CESTA[l]; druhy = 'en' if l == 'is' else 'is'; alt = WEB + CESTA[druhy]
    titul = ui[l]['atab_collection'].capitalize() + ' · Rúnar'
    href = {l2: k + CESTA[l2] for l2 in ('is', 'en')}
    r = hlavicka(l, titul, ui[l]['tree_visitor_dob'], url, alt, WEB + 'img/og.jpg', noindex, zdroj)
    r += lista(l, k, href['is'], href['en'])
    r += ['<main class="w-main">',
          '  <h1 class="w-h1">%s</h1>' % esc(ui[l]['atab_collection']),
          '  <div class="w-now" id="w-now" style="display:none"><a href="#"><div class="w-k"></div>'
          '<div class="w-now-t"></div><div class="w-half w-p"></div><span class="w-j" hidden></span></a></div>',
          '  <form class="w-lrf" id="w-lr-form" novalidate>',
          '    <p class="note">%s</p>' % esc(ui[l]['tree_visitor_dob']),
          '    <div class="dob-row"><input id="w-d" type="number" inputmode="numeric" min="1" max="31" placeholder="%s" aria-label="%s">'
          '<input id="w-m" type="number" inputmode="numeric" min="1" max="12" placeholder="%s" aria-label="%s"></div>' % (
              esc(ui[l]['day_ph']), esc(ui[l]['day_ph']), esc(ui[l]['month_ph']), esc(ui[l]['month_ph'])),
          '    <button type="submit" class="btn-upgrade">%s →</button>' % esc(ui[l]['tree_reveal_btn']),
          '    <div class="w-lr" id="w-lr-err" role="status" aria-live="polite"></div>',
          '    <div class="w-lr-out" id="w-lr-out"><div class="card-lbl">%s</div><a href="#"><div class="w-k"></div>'
          '<div class="w-now-t w-j"></div><div class="w-half w-p"></div></a></div>' % esc(ui[l]['life_rune_lbl']),
          '    <p class="w-origin">%s</p>' % esc(ui[l]['tree_lr_origin']),
          '  </form>',
          '  <div class="coll-grid">']
    for x in d['runy']:
        svg = x['kamen'].replace('rune-svg w-stone', 'rune-svg coll-svg')
        tr = '<span class="coll-tr">(%s)</span>' % esc(x[l]['glosa']) if x[l]['glosa'] else ''
        r.append('    <a class="coll-cell" href="%s/" data-rune="%s" data-name="%s" data-half="%s">%s<span class="coll-name">%s</span>%s</a>' % (
            x['slug'], x['slug'], esc(x[l]['jmeno']), esc(x[l]['pulmesic'].upper()), svg, esc(x[l]['jmeno']), tr))
    r += ['  </div>', '</main>']
    js = REJSTRIK_JS % {'nyni': json.dumps(WEB_TXT['nyni'][l], ensure_ascii=False), 'chyba': json.dumps(ui[l]['invalid_date'], ensure_ascii=False)}
    r += paticka(ui, l) + skripty(k, ['<script src="%srunar-runes.js"></script>' % APP], verze) + [js, '</script>', '</body>', '</html>', '']
    return '\n'.join(r)

def sitemapa(d):
    adresy = [WEB + p for p in DALSI_V_SITEMAPE]
    for l in ('is', 'en'):
        adresy.append(WEB + CESTA[l])
        adresy += [WEB + CESTA[l] + x['slug'] + '/' for x in d['runy']]
    r = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for a in adresy:
        r += ['  <url>', '    <loc>%s</loc>' % a, '  </url>']
    return '\n'.join(r + ['</urlset>', ''])

def vystupy(d, nahled):
    # rel. cesta (s /) → obsah všech textových souborů, které generátor píše
    zdroj = otisk(d); verze = '' if nahled else webjs_verze()
    out = {}
    for l in ('is', 'en'):
        out[CESTA[l] + 'index.html'] = rejstrik(d, l, nahled, zdroj, verze)
        for i, x in enumerate(d['runy']):
            out[CESTA[l] + x['slug'] + '/index.html'] = stranka_runy(d, i, l, nahled, zdroj, verze)
    if not nahled:
        out['sitemap.xml'] = sitemapa(d)
    return out

# Obrázek pro sdílení (1200×630): kámen runy a jméno — bez věty v jednom jazyce, platí pro IS i EN stránku (jako img/og.jpg).
OG = '''<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="%(pisma)s">
<style>*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1200px;height:630px;overflow:hidden}
body{background:radial-gradient(ellipse at 22%% 40%%,#123a3a 0%%,transparent 48%%),linear-gradient(90deg,#0b0d12,#0a0c12);position:relative}
.k{position:absolute;left:150px;top:95px;width:360px;height:440px;display:flex;align-items:center;justify-content:center}
.k svg{width:360px;height:auto;filter:drop-shadow(0 0 28px rgba(255,191,0,0.18))}
.t{position:absolute;left:600px;right:60px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center}
.e{font-family:'Cinzel',serif;font-size:22px;letter-spacing:7px;color:#FFBF00;opacity:.85;margin-bottom:22px}
.n{font-family:'Cinzel',serif;font-size:%(vel)dpx;letter-spacing:8px;line-height:1.05;color:#FFBF00;margin-bottom:34px}
.w{font-family:'Cinzel',serif;font-size:19px;letter-spacing:5px;color:#8ba5c0}
</style></head><body><div class="k">%(svg)s</div>
<div class="t"><div class="e">RÚNAR · THE RUNE KEEPER</div><div class="n">%(jmeno)s</div><div class="w">THERUNEKEEPER.COM</div></div></body></html>'''

def obrazky(d, ven, vsechny):
    cil = os.path.join(ven, 'img', 'runir'); os.makedirs(cil, exist_ok=True)
    runy = [x for x in d['runy'] if vsechny or not os.path.exists(os.path.join(cil, x['slug'] + '.jpg'))]
    if not runy:
        print('obrázky pro sdílení: všechny jsou (nové jen s --obrazky)')
        return
    from PIL import Image
    chrome = next((c for c in CHROME if os.path.exists(c)), None)
    if not chrome:
        sys.exit('FAIL web_runy: nenašel jsem Chrome ani Edge (obrázky pro sdílení)')
    tmp = tempfile.mkdtemp(prefix='runar_runy_')
    pisma = 'file:///' + os.path.join(ROOT, 'v2', 'fonts', 'fonts.css').replace('\\', '/')
    try:
        for x in runy:
            j = x['en']['jmeno'].upper()
            p = os.path.join(tmp, x['slug'] + '.html')
            io.open(p, 'w', encoding='utf-8').write(OG % {'pisma': pisma, 'svg': x['kamen'], 'jmeno': esc(j), 'vel': 92 if len(j) <= 8 else 74})
            png = os.path.join(tmp, x['slug'] + '.png')
            subprocess.run([chrome, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
                            '--allow-file-access-from-files', '--user-data-dir=' + os.path.join(tmp, 'profil'),
                            '--window-size=1200,630', '--virtual-time-budget=4000', '--screenshot=' + png, 'file:///' + p.replace('\\', '/')],
                           check=True, capture_output=True, timeout=120)
            im = Image.open(png).convert('RGB')
            if im.size != (1200, 630):
                sys.exit('FAIL web_runy: Chrome vrátil %dx%d' % im.size)
            im.save(os.path.join(cil, x['slug'] + '.jpg'), 'JPEG', quality=86, optimize=True, progressive=True)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    print('obrázky pro sdílení: %d → %s' % (len(runy), os.path.relpath(cil, ROOT)))

def zapis(p, s):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    io.open(p, 'w', encoding='utf-8', newline='\n').write(s)

def kontrola():
    """Porovná web/site s tím, co by generátor napsal teď. Vrací (fail, zastarale, pocet). FAIL = chybí soubor, je navíc, nebo se liší
    při stejném otisku zdroje (ruční úprava / šablona změněná bez přegenerování). Jiný otisk = zastaralé (text v appce se změnil)."""
    d = data(); zdroj = otisk(d); ocek = vystupy(d, False)
    fail, zastarale = [], []
    for rel, obsah in ocek.items():
        p = os.path.join(SITE, rel)
        if not os.path.exists(p):
            fail.append(rel + ' chybí'); continue
        s = io.open(p, encoding='utf-8').read().replace('\r\n', '\n')
        if s == obsah:
            continue
        m = GEN_RE.search(s)
        if m and m.group(1) != zdroj:
            zastarale.append(rel)
        else:
            fail.append(rel + ' se liší od generátoru (ruční úprava, nebo změna generátoru bez přegenerování)')
    for l in ('is', 'en'):
        slozka = os.path.join(SITE, CESTA[l])
        if os.path.isdir(slozka):
            for f in os.listdir(slozka):
                if os.path.isdir(os.path.join(slozka, f)) and (CESTA[l] + f + '/index.html') not in ocek:
                    fail.append(CESTA[l] + f + '/ je navíc (runa, kterou appka nemá)')
    for x in d['runy']:
        if not os.path.exists(os.path.join(SITE, 'img', 'runir', x['slug'] + '.jpg')):
            fail.append('img/runir/' + x['slug'] + '.jpg chybí (obrázek pro sdílení)')
    return fail, zastarale, len(ocek)

def main():
    if '--kontrola' in sys.argv:
        fail, zastarale, n = kontrola()
        if zastarale:
            print('⚠ stránky run: %d zastaralých — text nebo data v appce se změnily; srovná je příští nasazení webu (scripts/web_nasad.py)' % len(zastarale))
        if fail:
            print('\n'.join('  ' + f for f in fail[:12]))
            print('FAIL stránky run: %d vad — pusť python -X utf8 scripts/web_runy.py (stránky jsou generované, ručně se needitují)' % len(fail))
            sys.exit(1)
        if zastarale:
            print('stránky run: bez vady, %d z %d souborů zastaralých (⚠ výš) — obrázky pro sdílení jsou' % (len(zastarale), n))
        else:
            print('stránky run: %d souborů odpovídá generátoru (rejstříky, stránky run, sitemapa), obrázky pro sdílení jsou' % n)
        return
    nahled = '--nahled' in sys.argv
    ven = NAHLED if nahled else SITE
    d = data()
    out = vystupy(d, nahled)
    for rel, obsah in out.items():
        zapis(os.path.join(ven, rel), obsah)
    if nahled:
        shutil.copy(os.path.join(SITE, 'web.js'), os.path.join(ven, 'web.js'))   # náhled stojí mimo web/site; stránky čtou web.js z kořene
    print('stránky run: %d souborů → %s' % (len(out), os.path.relpath(ven, ROOT)))
    if '--bez-obrazku' not in sys.argv:
        obrazky(d, ven, '--obrazky' in sys.argv)

if __name__ == '__main__':
    main()
