# -*- coding: utf-8 -*-
# web_test_ikon.py — zkušební „appky“ s kandidáty na ikonu Rúnara: therunekeeper.com/icon-test/<varianta>/ (CODE-web 2026-11-03).
#
# Proč: owner 2026-11-03 „můžeme ty ikony střídat? každý den jinou? ať vidím, jak na mobilu vypadají?“ — ikonu appky na ploše si
# iPhone uloží jednou při přidání a už ji nemění, Android ji obnovuje nepravidelně a střídala by se i testerům. Místo toho má každá
# varianta malou stránku s vlastní ikonou a manifestem; owner si je přidá na plochu všechny naráz a uvidí je vedle sebe, na svém telefonu.
# Zdroje: ownerovy ikony ve v2/assets a dnešní ikona appky (v2/icons). Výřez: čtverec uvnitř zaobleného tvaru (bez bílého / modrého
# okraje — rohy zaobluje až telefon); maskovatelná ikona pro Android = výřez zmenšený doprostřed, okraj doplní rozmazané zrcadlení
# (Android by jinak runu nebo hlavu uřízl, DECISIONS 2026-11-02 (10)). Výstup web/site/icon-test/ (noindex, mimo sitemapu), anglické názvy
# (owner 2026-11-02 „ukládej je anglicky“). GENEROVANÉ — needitovat ručně.
#   python -X utf8 scripts/web_test_ikon.py            · --tablo <soubor.png> = navíc náhled všech variant jako plocha telefonu
import io, json, os, sys
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CIL = os.path.join(ROOT, 'web', 'site', 'icon-test')
APP = 'https://runar25.github.io/Runar-admin/v2/'
# slug (složka), štítek pod ikonou na ploše, zdroj, výřez: 'uvnitr' = čtverec uvnitř zaobleného tvaru na pozadí, 'cely' = celý obrázek
VARIANTY = [
    ('blue-rune', 'Rúnar blue', 'v2/assets/runar-icon-blue-rune.jpg', 'uvnitr'),
    ('gold-rune', 'Rúnar gold', 'v2/assets/runar-icon-gold-rune.jpg', 'uvnitr'),
    ('staff-gold-frame', 'Rúnar staff', 'v2/assets/runar-icon-staff-gold-frame.jpg', 'uvnitr'),
    ('portrait-blue', 'Rúnar face', 'v2/assets/runar-icon-portrait-blue.jpg', 'uvnitr'),
    ('current', 'Rúnar now', 'v2/icons/web-app-manifest-512x512.png', 'cely'),
]
ODSAZENI = 0.09   # o kolik dovnitř od obrysu tvaru (podíl strany): rohy zaoblení (~18 % strany) zůstanou venku
MASKA_PODIL = 0.72   # Android ukáže jen prostředních ~67 % (adaptivní ikona 72/108 dp) — obsah s rezervou uvnitř

def vyrez(img, zpusob):
    img = img.convert('RGB')
    if zpusob == 'cely':
        return img
    w, h = img.size
    roh = img.getpixel((4, 4))                       # barva pozadí kolem tvaru (bílá / modrá / tmavá)
    rozdil = ImageChops.difference(img, Image.new('RGB', img.size, roh)).convert('L')
    x0, y0, x1, y1 = rozdil.point(lambda v: 255 if v > 30 else 0).getbbox()
    s = min(x1 - x0, y1 - y0); od = int(s * ODSAZENI); s -= 2 * od
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    return img.crop((cx - s // 2, cy - s // 2, cx + s // 2, cy + s // 2))

def maskovatelna(ctverec, n=512):
    s = int(n * MASKA_PODIL); stred = ctverec.resize((s, s), Image.LANCZOS)
    fx, fy = ImageOps.mirror(stred), ImageOps.flip(stred); fxy = ImageOps.flip(fx)
    platno = Image.new('RGB', (n, n)); o = (n - s) // 2
    for dx in (-1, 0, 1):
        for dy in (-1, 0, 1):
            dlazdice = stred if (dx, dy) == (0, 0) else fx if dy == 0 else fy if dx == 0 else fxy
            platno.paste(dlazdice, (o + dx * s, o + dy * s))
    rozmazane = platno.filter(ImageFilter.GaussianBlur(n * 0.02))
    rozmazane.paste(stred, (o, o))                  # střed ostrý, okraj (zrcadlení) rozmazaný
    return rozmazane

STRANKA = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>%(stitek)s · icon test</title>
<!-- GENEROVÁNO scripts/web_test_ikon.py — zkušební ikona pro plochu telefonu; needitovat ručně. -->
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="192x192" href="icon-192.png">
<link rel="apple-touch-icon" href="icon-180.png">
<meta name="apple-mobile-web-app-title" content="%(stitek)s">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="theme-color" content="#0a0c12">
<link rel="stylesheet" href="%(app)sfonts/fonts.css">
<style>body{margin:0;background:#0a0c12;color:#F2F5F7;font-family:'Cormorant Garamond',serif;text-align:center;padding:48px 16px}
h1{font-family:'Cinzel',serif;font-weight:400;letter-spacing:5px;color:#FFBF00;font-size:22px;margin:22px 0 10px}
img{width:180px;height:180px;border-radius:40px}p{font-size:18px;color:#8ba5c0;max-width:26em;margin:10px auto}a{color:#FFBF00}</style>
</head>
<body>
<img src="icon-512.png" alt="%(stitek)s">
<h1>%(stitek_velky)s</h1>
<p>Add this page to your home screen to see the icon there. iPhone: Safari → Share → Add to Home Screen. Android: Chrome → ⋮ → Add to home screen.</p>
<p><a href="../">All test icons</a></p>
</body>
</html>
'''

PREHLED = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>Rúnar · icon test</title>
<!-- GENEROVÁNO scripts/web_test_ikon.py — rozcestník zkušebních ikon; needitovat ručně. -->
<link rel="icon" type="image/png" sizes="96x96" href="%(app)sicons/favicon-96x96.png">
<link rel="apple-touch-icon" href="%(app)sicons/apple-touch-icon.png">
<link rel="stylesheet" href="%(app)sfonts/fonts.css">
<style>body{margin:0;background:#0a0c12;color:#F2F5F7;font-family:'Cormorant Garamond',serif;text-align:center;padding:40px 16px}
h1{font-family:'Cinzel',serif;font-weight:400;letter-spacing:5px;color:#FFBF00;font-size:22px}
p{font-size:18px;color:#8ba5c0;max-width:28em;margin:10px auto 26px}
.grid{display:flex;flex-wrap:wrap;justify-content:center;gap:22px;max-width:640px;margin:0 auto}
.grid a{color:#F2F5F7;text-decoration:none;font-size:15px;width:110px}
.grid img{width:96px;height:96px;border-radius:22px;display:block;margin:0 auto 8px}</style>
</head>
<body>
<h1>RÚNAR · ICON TEST</h1>
<p>Open each icon on your phone and add it to the home screen. iPhone: Safari → Share → Add to Home Screen. Android: Chrome → ⋮ → Add to home screen.</p>
<div class="grid">
%(polozky)s
</div>
</body>
</html>
'''

def zapis(p, s):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    io.open(p, 'w', encoding='utf-8', newline='\n').write(s)

def tablo(ikony, cil):
    # náhled jako plocha telefonu: nahoře iPhone (zaoblený čtverec), dole Android (kruh z maskovatelné ikony)
    n, mez = 150, 34
    w = len(ikony) * (n + mez) + mez
    t = Image.new('RGB', (w, 2 * n + 150), (16, 18, 26)); d = ImageDraw.Draw(t)
    from PIL import ImageFont
    pismo = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 20)   # výchozí písmo PIL nemá „ú“
    k = int(512 * (1 - 72 / 108) / 2)   # Android ukáže jen prostředních 72/108 adaptivní ikony
    for i, (stitek, ctverec, maska) in enumerate(ikony):
        x = mez + i * (n + mez)
        m = Image.new('L', (n, n), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, n - 1, n - 1), radius=int(n * 0.2237), fill=255)
        t.paste(ctverec.resize((n, n), Image.LANCZOS), (x, 24), m)
        m2 = Image.new('L', (n, n), 0); ImageDraw.Draw(m2).ellipse((0, 0, n - 1, n - 1), fill=255)
        t.paste(maska.crop((k, k, 512 - k, 512 - k)).resize((n, n), Image.LANCZOS), (x, n + 84), m2)
        d.text((x + 8, n + 30), stitek, fill=(230, 230, 235), font=pismo)
    t.save(cil)

def main():
    polozky, pro_tablo = [], []
    for slug, stitek, zdroj, zpusob in VARIANTY:
        ctverec = vyrez(Image.open(os.path.join(ROOT, zdroj)), zpusob)
        slozka = os.path.join(CIL, slug)
        os.makedirs(slozka, exist_ok=True)
        for n in (180, 192, 512):
            ctverec.resize((n, n), Image.LANCZOS).save(os.path.join(slozka, 'icon-%d.png' % n), optimize=True)
        maska = maskovatelna(ctverec)
        maska.save(os.path.join(slozka, 'icon-512-maskable.png'), optimize=True)
        zapis(os.path.join(slozka, 'manifest.webmanifest'), json.dumps({
            'name': stitek + ' (icon test)', 'short_name': stitek, 'start_url': './', 'scope': './', 'display': 'standalone',
            'background_color': '#0a0c12', 'theme_color': '#0a0c12',
            'icons': [{'src': 'icon-192.png', 'sizes': '192x192', 'type': 'image/png', 'purpose': 'any'},
                      {'src': 'icon-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'any'},
                      {'src': 'icon-512-maskable.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'}]},
            ensure_ascii=False, indent=1) + '\n')
        zapis(os.path.join(slozka, 'index.html'), STRANKA % {'stitek': stitek, 'stitek_velky': stitek.upper(), 'app': APP})
        polozky.append('<a href="%s/"><img src="%s/icon-180.png" alt="%s">%s</a>' % (slug, slug, stitek, stitek))
        pro_tablo.append((stitek, ctverec, maska))
    zapis(os.path.join(CIL, 'index.html'), PREHLED % {'app': APP, 'polozky': '\n'.join(polozky)})
    print('zkušební ikony: %d → %s' % (len(VARIANTY), os.path.relpath(CIL, ROOT)))
    if '--tablo' in sys.argv:
        cil = sys.argv[sys.argv.index('--tablo') + 1]
        tablo(pro_tablo, cil)
        print('tablo →', cil)

if __name__ == '__main__':
    main()
