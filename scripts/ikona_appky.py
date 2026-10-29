# -*- coding: utf-8 -*-
# ikona_appky.py — ikona appky ze zlatého Rúnarova R z Rúnakortu (CODE-web 2026-10-29).
#
# Proč: hlášení e98e5e68 (owner 2026-10-29): „nové logo appky — zlaté Rúnarovo R, máme ho například v rune reading card“; owner
# téhož dne CODE-web: „udělej mi Rúnarovo R jako je na reading card jako ikonu pro appku“ (BACKLOG: napřed náhled, všechny velikosti).
# Po prvním náhledu (R v kameni): „bez kamene. ale můžeme udělat zlatý rámeček po okraji ikony. tvar asi záleží na tvaru ikony
# v mobilu. necháme i s kamenem.“ → výchozí je holé R se zlatým rámečkem; --kamen dá R v kameni jako na kartě, --bez-ramecku
# rámeček vynechá (= první náhled).
# Kresba se nekopíruje: skript volá produkční runeSvg (v2/runar-utils.js) nad RUNE_SVGS.Raidho (v2/runar-svgs.js). Holé R =
# frame:false, tedy jen hlavní tah runy (§5); kámen = frame:true. Záře a pozadí jako líc karty (.rk-o v runar-runakort.css): tmavý
# radiální přechod a drop-shadow #FFBF0030 (na kartě 14,5 % šířky kamene = ~10 % jeho výšky). Rámeček je zlatá linka jako okraj karty,
# jen silnější, ať je v 60 pt na ploše vidět. Rámeček patří okraji ikony, ne runě — kolem R žádná ozdoba (§5).
#
# Tvar rámečku = tvar, do kterého ikonu ořízne telefon (owner: „tvar záleží na tvaru ikony v mobilu“); rámeček leží 4 % strany
# od viditelného okraje, ať ho nepatrně jiná maska neusekne:
#   iPhone       zaoblený čtverec, rohy ~22,37 % strany (naměřeno na iOS, Apple číslo neuvádí)      → apple-touch-icon.png
#   Google Play  výpis zaoblí rohy o 20 % strany (zadání ikony pro Google Play)                      → play-512.png
#   Android      tvar volí výrobce telefonu (kruh, zaoblený čtverec…), appka ho nezná. Chrome dá „maskable“ obrázek na 55/72
#                adaptivní vrstvy a maska ukáže jejích vnitřních 72 ze 108 dp → kruh o poloměru 24/55 ≈ 43,6 % strany obrázku
#                (Chromium WebappsIconUtils.java: MASKABLE_SAFE_ZONE_RATIO 4/5, ADAPTIVE_SAFE_ZONE_RATIO 66/108; čteno 2026-10-29).
#                Jistý je jen kruh 40 % (W3C) → rámeček je kruh s vnější hranou 39,6 %: na kulaté ikoně leží u okraje, na zaoblené
#                čtvercové je to zlatý kruh v tmavém poli.                                           → web-app-manifest-*.png
#   Karta prohlížeče  tvar volíme sami: tmavý zaoblený čtvereček s R; s --kamen kámen sám (bez čtverečku). Bez rámečku: v 16 px
#                (a 32 px, z nichž ostrý displej kreslí kartu v téže fyzické velikosti) z rámečku zbyl hnědý okraj a R se zmenšilo
#                na 7 px (srovnáno zvětšeně 2026-10-29) — značkou je tu R samo. 16 a 32 px mají tahy zesílené — běžné jsou v 16 px
#                pod 1 px a na tmavé liště R mizelo (náhled 2026-10-29).
# Soubory (jména jako dnes ve v2/icons — manifest.json, sw.js a stránky se měnit nemusí):
#   favicon.ico (16, 32, 48) · favicon-96x96.png · apple-touch-icon.png (180) · web-app-manifest-192x192.png · web-app-manifest-512x512.png
#   · play-512.png (ikona pro výpis v Google Play, 512×512 bez průhlednosti)
#   python -X utf8 scripts/ikona_appky.py --cil <složka> [--kamen] [--bez-ramecku]
#   (náhled kamkoli; do appky --cil v2/icons, až owner náhled schválí). profil() kreslí z téže předlohy profilovku na sítě
#   (scripts/web_socialni_obrazky.py).
import io, os, re, shutil, subprocess, sys, tempfile
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = [r'C:\Program Files\Google\Chrome\Application\chrome.exe',
          r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe']
M = 1024           # strana předlohy; menší velikosti se z ní zmenšují (Lanczos)
ZLATA = '#D6A85C'  # zlatá run i okraje karty
ODSAZENI = 0.04    # rámeček od viditelného okraje (podíl strany)
LINKA = 0.014      # síla rámečku; tah R má ~3 % strany, rámeček je slabší, ať zůstane hlavní runa
SILA = 0.85        # krytí rámečku
POZADI = 'radial-gradient(ellipse at 50% 46%,#1a2230 0%,#0c0f15 70%)'   # líc karty .rk-o (tam „at 30% 50%“ — kámen stojí vlevo)
# viditelný tvar ikony: (druh, poloměr kruhu / rohu) jako podíl strany obrázku — odvození v hlavičce
TVARY = {'android': ('kruh', 24 / 55), 'iphone': ('roh', 0.2237), 'play': ('roh', 0.20),
         'profil': ('kruh', 0.5),      # Instagram i Facebook ukazují profilovku v kruhu přes celý čtverec
         'dlazdice': ('roh', 0.22)}    # karta prohlížeče
# výška runy (holé R) / kamene jako podíl strany: [holé R, kámen s rámečkem, kámen bez rámečku]. Kámen bez rámečku = velikost
# z prvního náhledu (tam 0,70 / 0,74 / 0,94 výšky kresby; kámen zabírá ~91,4 % jejího viewBoxu, změřeno obrysem 350 → 383 px).
# Kámen s rámečkem je menší, ať se obrys kamene nemačká na rámeček.
VYSKY = {'android': (0.47, 0.55, 0.64), 'iphone': (0.54, 0.62, 0.676), 'play': (0.54, 0.62, 0.676),
         'profil': (0.50, 0.55, 0.64), 'dlazdice': (0.74, 0.86, 0.86)}

def kresba(kamen):
    # runeSvg z produkce: výběr tahů holé runy (RUNE_BARE_KEEP) i kresba zůstávají na jednom místě (§18)
    js = ("var fs=require('fs'),u=fs.readFileSync(process.argv[2],'utf8'),m=u.match(/var RUNE_BARE_KEEP[\\s\\S]*?\\n}\\n/);"
          "if(!m)throw new Error('runeSvg v runar-utils.js nenalezen');"
          "process.stdout.write(new Function(fs.readFileSync(process.argv[1],'utf8')+';'+m[0]+';return runeSvg;')()"
          "({svg:'Raidho'},{frame:process.argv[3]==='1'}))")
    r = subprocess.run(['node', '-e', js, os.path.join(ROOT, 'v2', 'runar-svgs.js'), os.path.join(ROOT, 'v2', 'runar-utils.js'),
                        '1' if kamen else '0'], capture_output=True, encoding='utf-8', check=True)
    m = re.match(r'<svg class="rune-svg[^"]*"([^>]*)>(.*)</svg>$', r.stdout, re.S)
    if not m or '<path' not in m.group(2):
        sys.exit('ikona_appky: runeSvg nevrátil kresbu: %s' % r.stdout[:120])
    return m.group(1), m.group(2)

STRANKA = '''<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0}
html,body{width:%(m)dpx;height:%(m)dpx;overflow:hidden;background:transparent}
#pozadi{position:absolute;left:0;top:0;width:100%%;height:100%%;background:%(bg)s;border-radius:%(zaobleni)s}
#runa{position:absolute;left:50%%;top:50%%;height:%(h)dpx;transform:translate(-50%%,-50%%);%(glow)s}
#ram{position:absolute;left:0;top:0;width:100%%;height:100%%}
</style></head><body><div id="pozadi"></div><svg id="runa"%(atributy)s><g>%(paths)s</g></svg>
<svg id="ram" viewBox="0 0 %(m)d %(m)d" xmlns="http://www.w3.org/2000/svg">%(ramecek)s</svg>
<script>
// viewBox = skutečný obrys kresby (holé R zabírá jen část plochy kamene, viewBox kresby počítá s kamenem); 2 %% rezerva na vyhlazení
var s=document.getElementById('runa'),b=s.querySelector('g').getBBox(),o=b.height*0.02;
s.setAttribute('viewBox',[b.x-o,b.y-o,b.width+2*o,b.height+2*o].join(' '));
</script></body></html>'''

def ramecek(tvar):
    druh, r = TVARY[tvar]
    w = LINKA * M
    if druh == 'kruh':
        return ('<circle cx="%g" cy="%g" r="%g" fill="none" stroke="%s" stroke-opacity="%g" stroke-width="%g"/>'
                % (M / 2, M / 2, (r - ODSAZENI) * M - w / 2, ZLATA, SILA, w))
    d = ODSAZENI * M + w / 2   # střed linky; roh = roh masky zmenšený o odsazení (souběžná křivka)
    return ('<rect x="%g" y="%g" width="%g" height="%g" rx="%g" fill="none" stroke="%s" stroke-opacity="%g" stroke-width="%g"/>'
            % (d, d, M - 2 * d, M - 2 * d, (r - ODSAZENI) * M - w / 2, ZLATA, SILA, w))

def chrome(html, tmp, jm):
    p = os.path.join(tmp, jm + '.html')
    io.open(p, 'w', encoding='utf-8').write(html)
    png = os.path.join(tmp, jm + '.png')
    exe = next((c for c in CHROME if os.path.exists(c)), None)
    if not exe:
        sys.exit('ikona_appky: nenašel jsem Chrome ani Edge')
    subprocess.run([exe, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
                    '--default-background-color=00000000', '--user-data-dir=' + os.path.join(tmp, 'prof-' + jm),
                    '--window-size=%d,%d' % (M, M), '--screenshot=' + png, 'file:///' + p.replace('\\', '/')],
                   check=True, capture_output=True, timeout=120)
    im = Image.open(png).convert('RGBA')
    if im.size != (M, M):
        sys.exit('ikona_appky: Chrome vrátil %dx%d' % im.size)
    return im

def predloha(tvar, kamen, s_rameckem, tmp, tucne=False):
    atributy, paths = kresba(kamen)
    vyska = VYSKY[tvar][0 if not kamen else (1 if s_rameckem else 2)]
    h = int(M * vyska * 1.04)   # +2 % rezerva viewBoxu nahoře i dole
    if tucne:
        # 16 a 32 px: tahy runy i zlatý obrys kamene mají v kresbě pod 1 px → obrys silnější, tahy obtažené toutéž zlatou.
        # Tvar runy zůstává, jen je tučnější.
        paths = paths.replace('stroke-width="0.3"', 'stroke-width="0.9"').replace(
            'fill="%s"/>' % ZLATA, 'fill="%s" stroke="%s" stroke-width="0.55" stroke-linejoin="round"/>' % (ZLATA, ZLATA))
    maly_kamen = tvar == 'dlazdice' and kamen
    if maly_kamen:
        # Favicon s kamenem: kámen sám je dlaždice, bez tmavého pozadí. V kresbě je jen prstenec (obrys), uvnitř průhledný → na světlé
        # liště prohlížeče by R stálo na bílém; vnitřek se vyplní barvou kamene (obdélník uvnitř prstence, prstenec ho překryje).
        x0, y0, w, hv = (float(v) for v in re.search(r'viewBox="([^"]+)"', atributy).group(1).split())
        paths = ('<rect x="%.2f" y="%.2f" width="%.2f" height="%.2f" rx="2.6" fill="#1e2535"/>'
                 % (x0 + 1.1, y0 + 1.1, w - 2.2, hv - 2.2)) + paths
    # Pozor: hodnoty se do STRANKA dosazují jako hotový text — „%“ v nich jednoduše (zdvojené %% tu zůstalo doslova a prohlížeč
    # celý přechod zahodil, 2026-10-29).
    html = STRANKA % {
        'm': M, 'h': h, 'atributy': atributy, 'paths': paths,
        'bg': 'transparent' if maly_kamen else POZADI,
        'zaobleni': '%g%%' % (TVARY['dlazdice'][1] * 100) if tvar == 'dlazdice' else '0',
        'glow': '' if tvar == 'dlazdice' else 'filter:drop-shadow(0 0 %dpx #FFBF0030)' % round(0.10 * M * vyska),
        'ramecek': ramecek(tvar) if s_rameckem and tvar != 'dlazdice' else ''}
    return chrome(html, tmp, '%s-%d%d%d' % (tvar, kamen, s_rameckem, tucne))

def pojistka_maskable(im):
    # Vše zlaté (runa i rámeček) musí ležet v kruhu o poloměru 40 % strany — jinak to Android v některé masce ořízne.
    px, r2, nej = im.load(), (0.40 * M) ** 2, 0.0
    for y in range(0, M, 2):
        for x in range(0, M, 2):
            rr, g, b, a = px[x, y]
            if rr > 150 and g > 110 and b < 120:   # zlatá #D6A85C a okolí (záře na tmavém pozadí zlatá není)
                nej = max(nej, (x - M / 2) ** 2 + (y - M / 2) ** 2)
    if nej > r2:
        sys.exit('ikona_appky: zlatá přesahuje bezpečný kruh Androidu (%.0f px > %.0f px)' % (nej ** 0.5, r2 ** 0.5))
    return nej ** 0.5

def zmensi(im, n):
    return im.resize((n, n), Image.LANCZOS)

def profil(cesta, kamen=False, s_rameckem=True, strana=720):
    # Profilovka na Instagram / Facebook: táž předloha, rámeček v kruhu, do kterého sítě profilovku ořízne.
    tmp = tempfile.mkdtemp(prefix='runar_profil_')
    try:
        zmensi(predloha('profil', kamen, s_rameckem, tmp), strana).convert('RGB').save(cesta, 'JPEG', quality=92, optimize=True)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

def main():
    # Cíl je povinný: ikony v2/icons se přepisují jen po ownerově schválení náhledu (BACKLOG „Nové logo appky“), ne omylem bez parametru.
    if '--cil' not in sys.argv:
        sys.exit('ikona_appky: chybí --cil <složka> (náhled do scratchpadu; po schválení --cil v2/icons)')
    cil = sys.argv[sys.argv.index('--cil') + 1]
    kamen, s_rameckem = '--kamen' in sys.argv, '--bez-ramecku' not in sys.argv
    os.makedirs(cil, exist_ok=True)
    tmp = tempfile.mkdtemp(prefix='runar_ikona_')
    try:
        android = predloha('android', kamen, s_rameckem, tmp)
        iphone = predloha('iphone', kamen, s_rameckem, tmp)
        play = predloha('play', kamen, s_rameckem, tmp)
        mala = predloha('dlazdice', kamen, s_rameckem, tmp)
        drobna = predloha('dlazdice', kamen, s_rameckem, tmp, tucne=True)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    print('zlatá od středu nejdál %.0f px z dovolených %.0f (Android)' % (pojistka_maskable(android), 0.40 * M))
    rgb = lambda im: im.convert('RGB')   # iPhone a Google Play: bez průhlednosti
    zmensi(android, 512).save(os.path.join(cil, 'web-app-manifest-512x512.png'), optimize=True)
    zmensi(android, 192).save(os.path.join(cil, 'web-app-manifest-192x192.png'), optimize=True)
    rgb(zmensi(iphone, 180)).save(os.path.join(cil, 'apple-touch-icon.png'), optimize=True)
    rgb(zmensi(play, 512)).save(os.path.join(cil, 'play-512.png'), optimize=True)
    zmensi(mala, 96).save(os.path.join(cil, 'favicon-96x96.png'), optimize=True)
    # favicon.ico: 16 a 32 px z tučné předlohy, 48 px z běžné (Pillow vezme vrstvu přesné velikosti z append_images)
    zmensi(mala, 48).save(os.path.join(cil, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)],
                          append_images=[zmensi(drobna, 16), zmensi(drobna, 32)])
    for f in sorted(os.listdir(cil)):
        p = os.path.join(cil, f)
        if f.endswith(('.png', '.ico')):
            print('%-30s %s  %d kB' % (f, '%dx%d' % Image.open(p).size, os.path.getsize(p) // 1024))

if __name__ == '__main__':
    main()
