# -*- coding: utf-8 -*-
# ikona_appky.py — ikona appky ze zlatého Rúnarova R z Rúnakortu (CODE-web 2026-10-29).
#
# Proč: hlášení e98e5e68 (owner 2026-10-29): „nové logo appky — zlaté Rúnarovo R, máme ho například v rune reading card“; owner
# téhož dne CODE-web: „udělej mi Rúnarovo R jako je na reading card jako ikonu pro appku“ (BACKLOG: napřed náhled, všechny velikosti).
# Kresba = tatáž, kterou kreslí karta: RUNE_SVGS.Raidho (kámen #1e2535 se zlatým obrysem + zlaté tahy runy, v2/runar-svgs.js) a zlatá
# záře jako .rk-o .rk-stone (drop-shadow #FFBF0030, ~14 % šířky kamene); pozadí jako líc karty (tmavý radiální přechod). Žádná kopie
# kresby — skript ji čte ze zdroje run (§18).
#
# Dvě kompozice:
#   PLNÁ  — tmavé pozadí přes celý čtverec, kámen se září uprostřed. Android ikonu ořízne do kruhu / zaobleného tvaru („maskable“:
#           vidět je jistě jen kruh 80 % šířky) → kámen 70 % výšky, obrys ~350 px od středu z dovolených 410 (měří pojistka_maskable;
#           záře se nepočítá — na tmavém pozadí není zlatá). iPhone a Google
#           Play jen zaoblí rohy → kámen 74 %.
#   MALÁ  — favicon (karta prohlížeče 16–48 px): jen kámen přes 94 % výšky na průhledném pozadí, bez záře; zmenšený kámen ve tmavém
#           čtverci by v 16 px nebyl čitelný.
# Soubory (jména jako dnes ve v2/icons — manifest.json, sw.js a stránky se měnit nemusí):
#   favicon.ico (16, 32, 48) · favicon-96x96.png · apple-touch-icon.png (180) · web-app-manifest-192x192.png · web-app-manifest-512x512.png
#   · play-512.png (ikona pro výpis v Google Play, 512×512 bez průhlednosti)
#   python -X utf8 scripts/ikona_appky.py --cil <složka>      (náhled kamkoli; do appky --cil v2/icons, až owner náhled schválí)
import io, json, os, shutil, subprocess, sys, tempfile
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = [r'C:\Program Files\Google\Chrome\Application\chrome.exe',
          r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe']
M = 1024   # strana předlohy; menší velikosti se z ní zmenšují (Lanczos)

def raidho():
    js = ("var s=require('fs').readFileSync(process.argv[1],'utf8');"
          "process.stdout.write(JSON.stringify(new Function(s+';return RUNE_SVGS;')().Raidho))")
    r = subprocess.run(['node', '-e', js, os.path.join(ROOT, 'v2', 'runar-svgs.js')], capture_output=True, encoding='utf-8', check=True)
    return json.loads(r.stdout)

STRANKA = '''<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;padding:0}
html,body{width:%(m)dpx;height:%(m)dpx;overflow:hidden;background:%(bg)s}
svg{position:absolute;left:50%%;top:50%%;height:%(h)dpx;transform:translate(-50%%,-50%%);%(glow)s}
</style></head><body><svg viewBox="%(vb)s" fill="none" xmlns="http://www.w3.org/2000/svg">%(paths)s</svg></body></html>'''

def predloha(r, vyska, plna, tmp, jm, tucne=False):
    h = int(M * vyska)
    x0, y0, w, hv = (float(v) for v in r['vb'].split())
    sirka = h * w / hv
    paths = r['paths']
    if tucne:
        # 16 a 32 px (karta prohlížeče): tahy runy i zlatý obrys kamene mají v kresbě pod 1 px a na tmavé liště R mizí (náhled
        # 2026-10-29) → obrys silnější a tahy runy obtažené toutéž zlatou. Tvar runy zůstává, jen je tučnější.
        paths = paths.replace('stroke-width="0.3"', 'stroke-width="0.9"').replace(
            'fill="#D6A85C"/>', 'fill="#D6A85C" stroke="#D6A85C" stroke-width="0.55" stroke-linejoin="round"/>')
    if not plna:
        # Kámen v kresbě je jen prstenec (obrys), uvnitř průhledný — na kartě prosvítá tmavé pozadí. Malá ikona tmavé pozadí nemá,
        # na světlé liště prohlížeče by zlaté R stálo na bílém → vnitřek se vyplní barvou kamene (obdélník uvnitř prstence, ten ho překryje).
        paths = ('<rect x="%.2f" y="%.2f" width="%.2f" height="%.2f" rx="2.6" fill="#1e2535"/>'
                 % (x0 + 1.1, y0 + 1.1, w - 2.2, hv - 2.2)) + paths
    # Pozor: hodnoty se do STRANKA dosazují jako hotový text — „%“ v nich jednoduše (zdvojené %% tu zůstalo doslova a prohlížeč
    # celý přechod zahodil, 2026-10-29).
    html = STRANKA % {'m': M, 'h': h, 'vb': r['vb'], 'paths': paths,
                      'bg': 'radial-gradient(ellipse at 50% 46%,#1a2230 0%,#0c0f15 70%)' if plna else 'transparent',
                      'glow': 'filter:drop-shadow(0 0 %dpx #FFBF0030)' % round(sirka * 0.145) if plna else ''}
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

def pojistka_maskable(im):
    # Obrys kamene (zlaté pixely) musí ležet v kruhu o poloměru 40 % strany — jinak ho Android v kruhové masce ořízne.
    px, r2, nej = im.load(), (0.40 * M) ** 2, 0.0
    for y in range(0, M, 2):
        for x in range(0, M, 2):
            rr, g, b, a = px[x, y]
            if rr > 150 and g > 110 and b < 120:   # zlatá #D6A85C a okolí
                nej = max(nej, (x - M / 2) ** 2 + (y - M / 2) ** 2)
    if nej > r2:
        sys.exit('ikona_appky: kámen přesahuje bezpečný kruh Androidu (%.0f px > %.0f px)' % (nej ** 0.5, r2 ** 0.5))
    return nej ** 0.5

def zmensi(im, n):
    return im.resize((n, n), Image.LANCZOS)

def main():
    # Cíl je povinný: ikony v2/icons se přepisují jen po ownerově schválení náhledu (BACKLOG „Nové logo appky“), ne omylem bez parametru.
    if '--cil' not in sys.argv:
        sys.exit('ikona_appky: chybí --cil <složka> (náhled do scratchpadu; po schválení --cil v2/icons)')
    cil = sys.argv[sys.argv.index('--cil') + 1]
    os.makedirs(cil, exist_ok=True)
    r = raidho()
    tmp = tempfile.mkdtemp(prefix='runar_ikona_')
    try:
        mask = predloha(r, 0.70, True, tmp, 'maskable')
        oble = predloha(r, 0.74, True, tmp, 'oble')
        mala = predloha(r, 0.94, False, tmp, 'mala')
        drobna = predloha(r, 0.94, False, tmp, 'drobna', tucne=True)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    print('obrys kamene od středu nejdál %.0f px z dovolených %.0f (maskable)' % (pojistka_maskable(mask), 0.40 * M))
    rgb = lambda im: im.convert('RGB')   # iPhone a Google Play: bez průhlednosti
    zmensi(mask, 512).save(os.path.join(cil, 'web-app-manifest-512x512.png'), optimize=True)
    zmensi(mask, 192).save(os.path.join(cil, 'web-app-manifest-192x192.png'), optimize=True)
    rgb(zmensi(oble, 180)).save(os.path.join(cil, 'apple-touch-icon.png'), optimize=True)
    rgb(zmensi(oble, 512)).save(os.path.join(cil, 'play-512.png'), optimize=True)
    zmensi(mala, 96).save(os.path.join(cil, 'favicon-96x96.png'), optimize=True)
    # favicon.ico: 16 a 32 px z tučné předlohy, 48 px z běžné (Pillow vezme vrstvu přesné velikosti z append_images)
    zmensi(mala, 48).save(os.path.join(cil, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)],
                          append_images=[zmensi(drobna, 16), zmensi(drobna, 32)])
    oble.save(os.path.join(cil, '_predloha-1024.png'))   # jen pro náhled; do appky nepatří
    for f in sorted(os.listdir(cil)):
        p = os.path.join(cil, f)
        if f.endswith(('.png', '.ico')):
            print('%-30s %s  %d kB' % (f, '%dx%d' % Image.open(p).size, os.path.getsize(p) // 1024))

main()
