# -*- coding: utf-8 -*-
# web_og_obrazek.py — obrázek náhledu při sdílení webu (og:image, 1200×630) → web/site/img/og.jpg (CODE-web 2026-10-27).
#
# Proč: owner 2026-10-27 („udělej všech pět“, bod 3; Instagram máme, Facebook se zakládá). Odkaz na therunekeeper.com sdílený
# na Facebooku, v Messengeru, iMessage nebo z bia na Instagramu ukazoval jen holou adresu — stránka neměla og značky ani obrázek.
# Obrázek se skládá ze stejných věcí jako stránka (portrét img/runar.jpg, písmo Cinzel appky, barvy landingu), ať je to tentýž
# Rúnar; text je jen značka (RÚNAR, THE RUNE KEEPER, adresa) — bez věty v jednom jazyce, platí pro IS i EN.
# Kreslí ho Chrome bez okna (headless), ať písmo vypadá přesně jako na webu; Pillow pak uloží JPG.
#   python -X utf8 scripts/web_og_obrazek.py          → přepíše web/site/img/og.jpg (pak nasadit scripts/web_nasad.py)
import io, os, shutil, subprocess, sys, tempfile
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CIL = os.path.join(ROOT, 'web', 'site', 'img', 'og.jpg')
PORTRET = os.path.join(ROOT, 'web', 'site', 'img', 'runar.jpg')
PISMA = os.path.join(ROOT, 'v2', 'fonts', 'fonts.css')
W, H = 1200, 630
CHROME = [r'C:\Program Files\Google\Chrome\Application\chrome.exe',
          r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe']

def url(p):
    return 'file:///' + p.replace('\\', '/')

# Kompozice jako landing: Rúnar vlevo (portrét přes výšku, doprava se rozplyne až za natažená ruku — ruka je na 85 % obrazu),
# vpravo značka. Barvy = :root landingu (web/site/index.html).
STRANKA = '''<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="%(pisma)s">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:%(w)dpx;height:%(h)dpx;overflow:hidden}
body{background:radial-gradient(ellipse at 20%% 30%%,#123a3a 0%%,transparent 45%%),linear-gradient(90deg,#0b0d12,#0a0c12);position:relative}
.art{position:absolute;left:0;top:0;bottom:0;width:54%%;background:url(%(portret)s) 30%% 20%%/cover no-repeat;
  -webkit-mask-image:linear-gradient(90deg,#000 76%%,transparent 100%%);mask-image:linear-gradient(90deg,#000 76%%,transparent 100%%)}
.txt{position:absolute;left:56%%;right:40px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center}
.eyebrow{font-family:'Cinzel',serif;font-size:22px;letter-spacing:7px;color:#FFBF00;opacity:.85;margin-bottom:18px}
.title{font-family:'Cinzel',serif;font-size:104px;letter-spacing:10px;line-height:1;color:#FFBF00;margin-bottom:34px}
.web{font-family:'Cinzel',serif;font-size:19px;letter-spacing:5px;color:#8ba5c0}
</style></head><body>
<div class="art"></div>
<div class="txt"><div class="eyebrow">THE RUNE KEEPER</div><div class="title">RÚNAR</div><div class="web">THERUNEKEEPER.COM</div></div>
</body></html>'''

def main():
    chrome = next((c for c in CHROME if os.path.exists(c)), None)
    if not chrome:
        sys.exit('web_og_obrazek: nenašel jsem Chrome ani Edge')
    tmp = tempfile.mkdtemp(prefix='runar_og_')
    try:
        html = os.path.join(tmp, 'og.html')
        io.open(html, 'w', encoding='utf-8').write(STRANKA % {'w': W, 'h': H, 'pisma': url(PISMA), 'portret': url(PORTRET)})
        png = os.path.join(tmp, 'og.png')
        subprocess.run([chrome, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
                        '--allow-file-access-from-files', '--user-data-dir=' + os.path.join(tmp, 'profil'),
                        '--window-size=%d,%d' % (W, H), '--virtual-time-budget=5000', '--screenshot=' + png, url(html)],
                       check=True, capture_output=True, timeout=120)
        im = Image.open(png).convert('RGB')
        if im.size != (W, H):
            sys.exit('web_og_obrazek: Chrome vrátil %dx%d místo %dx%d' % (im.size + (W, H)))
        im.save(CIL, 'JPEG', quality=86, optimize=True, progressive=True)
        print('og obrázek: %s (%d kB)' % (os.path.relpath(CIL, ROOT), os.path.getsize(CIL) // 1024))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

main()
