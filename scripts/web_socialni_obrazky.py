# -*- coding: utf-8 -*-
# web_socialni_obrazky.py — obrázky Rúnara pro sociální sítě → web/socialni/ (CODE-web 2026-10-28).
#
# Proč: owner 2026-10-27/28 — zakládá se Facebook, Instagram už je („2. ano“ na otázku, jestli připravit titulní fotku a profilovku).
# Skládá se ze stejných podkladů jako web (portrét appky, písmo Cinzel, barvy landingu), ať je to všude tentýž Rúnar.
# Složka web/socialni/ se NEnasazuje (web_nasad.py kopíruje jen web/site/) — soubory owner nahrává na Facebook / Instagram ručně.
#
# Co vznikne:
#   fb-titulni.jpg   1640×624 — titulní fotka Facebooku. Facebook ji ukazuje 820×312 na počítači a 640×360 na telefonu (ořízne
#                    boky); obě zobrazení společně vidí jen střed ~1110 px, proto Rúnar i nápis stojí uvnitř (POJISTKA níž to měří).
#   profil-ikona.jpg  720×720 — profilovka (owner 2026-10-28 „nejde to udělat ještě lépe?“): kresba ikony appky (Rúnar s kamenem ᚱ,
#                    kruh zářících run, v2/assets/runar-app-icon.svg). Srovnáno ve skutečných velikostech 176 / 110 / 40 px na tmavém
#                    i bílém pozadí: čitelná i ve 40 px, kruh run ji odliší na obou pozadích a je to tentýž obrázek, jaký lidé uvidí
#                    na ploše telefonu. Výřez uvnitř zaobleného čtverce (černý okraj ikony do kruhu nesmí, měřeno 11–15 px).
#                    Výřezy z portrétů s holí owner zamítl (2026-10-28: „profilovka A a B má Rúnara s uříznutou holí… A je úplně mimo“) —
#                    čtverec kolem obličeje hůl vždy přetne. Do profilovky proto jen záběr, kde Rúnar nic nedrží přes okraj.
#   profil-r.jpg      720×720 — druhá profilovka do zásoby: zlaté R jako nová ikona appky (owner 2026-10-29 k otázce, zda profilovka
#                    bude R, nebo tvář: „ještě nevím. připravíme to a rozhodnu se, až to budeme dělat“). Kreslí ji ikona_appky.profil()
#                    — táž předloha jako ikona appky, rámeček je kruh u okraje, protože Instagram i Facebook profilovku ořízne do kruhu.
#   python -X utf8 scripts/web_socialni_obrazky.py
import base64, io, os, re, shutil, subprocess, sys, tempfile
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ikona_appky

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CIL = os.path.join(ROOT, 'web', 'socialni')
TMAVY = os.path.join(ROOT, 'v2', 'img', 'runar-portrait.webp')        # 1024×1536, scéna s polární září
IKONA = os.path.join(ROOT, 'v2', 'assets', 'runar-app-icon.svg')      # obal kolem jednoho PNG 1254×1254 v base64 (README assets)
PISMA = os.path.join(ROOT, 'v2', 'fonts', 'fonts.css')
CHROME = [r'C:\Program Files\Google\Chrome\Application\chrome.exe',
          r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe']
W, H = 1640, 624
STRED = (265, 1375)   # pás, který vidí počítač i telefon (640/360 z 1640×624 = střed 1110 px)

def url(p):
    return 'file:///' + p.replace('\\', '/')

# Titulní fotka: tmavý portrét (scéna) uvnitř středního pásu, rozplyne se do tmy; vpravo od něj značka jako v náhledu webu (og.jpg).
TITULNI = '''<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="%(pisma)s">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:%(w)dpx;height:%(h)dpx;overflow:hidden}
body{background:radial-gradient(ellipse 45%% 80%% at 68%% 42%%,#123a3a 0%%,transparent 62%%),linear-gradient(90deg,#0b0d12,#0a0c12);position:relative}
.art{position:absolute;left:300px;top:-40px;width:520px;height:780px;background:url(%(portret)s) 40%% 0/cover no-repeat;
  -webkit-mask-image:linear-gradient(90deg,transparent 0,#000 14%%,#000 86%%,transparent 100%%),linear-gradient(180deg,#000 72%%,transparent 92%%);
  -webkit-mask-composite:source-in;mask-image:linear-gradient(90deg,transparent 0,#000 14%%,#000 86%%,transparent 100%%),linear-gradient(180deg,#000 72%%,transparent 92%%);mask-composite:intersect}
.txt{position:absolute;left:840px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center}
.eyebrow{font-family:'Cinzel',serif;font-size:28px;letter-spacing:9px;color:#FFBF00;opacity:.85;margin-bottom:20px}
.title{font-family:'Cinzel',serif;font-size:116px;letter-spacing:11px;line-height:1;color:#FFBF00;margin-bottom:36px}
.web{font-family:'Cinzel',serif;font-size:23px;letter-spacing:6px;color:#8ba5c0}
</style></head><body><div class="art"></div>
<div class="txt" id="t"><div class="eyebrow">THE RUNE KEEPER</div><div class="title">RÚNAR</div><div class="web">THERUNEKEEPER.COM</div></div>
<script>document.title = JSON.stringify(document.getElementById('t').getBoundingClientRect());</script>
</body></html>'''

def chrome(html, png, w, h):
    exe = next((c for c in CHROME if os.path.exists(c)), None)
    if not exe:
        sys.exit('web_socialni_obrazky: nenašel jsem Chrome ani Edge')
    prof = tempfile.mkdtemp(prefix='runar_soc_prof_')
    try:
        subprocess.run([exe, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
                        '--allow-file-access-from-files', '--user-data-dir=' + prof, '--window-size=%d,%d' % (w, h),
                        '--virtual-time-budget=5000', '--screenshot=' + png, url(html)], check=True, capture_output=True, timeout=120)
    finally:
        shutil.rmtree(prof, ignore_errors=True)

def vyrez(src, stred_x, stred_y, strana, ven):
    im = Image.open(src).convert('RGB')
    x0, y0 = int(stred_x - strana / 2), int(stred_y - strana / 2)
    assert x0 >= 0 and y0 >= 0 and x0 + strana <= im.width and y0 + strana <= im.height, (src, x0, y0, strana, im.size)
    c = im.crop((x0, y0, x0 + strana, y0 + strana))
    if c.width > ven:
        c = c.resize((ven, ven), Image.LANCZOS)   # jen zmenšovat — zvětšený obrázek by byl rozmazaný
    return c

def main():
    os.makedirs(CIL, exist_ok=True)
    tmp = tempfile.mkdtemp(prefix='runar_soc_')
    try:
        html = os.path.join(tmp, 'titulni.html')
        io.open(html, 'w', encoding='utf-8').write(TITULNI % {'w': W, 'h': H, 'pisma': url(PISMA), 'portret': url(TMAVY)})
        png = os.path.join(tmp, 'titulni.png')
        chrome(html, png, W, H)
        im = Image.open(png).convert('RGB')
        if im.size != (W, H):
            sys.exit('web_socialni_obrazky: Chrome vrátil %dx%d' % im.size)
        im.save(os.path.join(CIL, 'fb-titulni.jpg'), 'JPEG', quality=88, optimize=True, progressive=True)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    # Profilovka z ikony appky: střed obrázku, strana 1174 px = ikona bez černého okraje (11–15 px, změřeno 2026-10-28).
    m = re.search(r'data:image/png;base64,([A-Za-z0-9+/=]+)', io.open(IKONA, encoding='utf-8').read())
    ikona = os.path.join(tempfile.gettempdir(), 'runar-app-icon-1254.png')
    io.open(ikona, 'wb').write(base64.b64decode(m.group(1)))
    vyrez(ikona, 627, 627, 1174, 720).save(os.path.join(CIL, 'profil-ikona.jpg'), 'JPEG', quality=90, optimize=True)
    os.remove(ikona)
    ikona_appky.profil(os.path.join(CIL, 'profil-r.jpg'))
    for f in sorted(os.listdir(CIL)):
        p = os.path.join(CIL, f)
        print('%-18s %s  %d kB' % (f, '%dx%d' % Image.open(p).size, os.path.getsize(p) // 1024))

main()
