# -*- coding: utf-8 -*-
# ikona_appky.py — ikona appky ze zlatého Rúnarova R z Rúnakortu (CODE-web 2026-10-29).
#
# Proč: hlášení e98e5e68 (owner 2026-10-29): „nové logo appky — zlaté Rúnarovo R, máme ho například v rune reading card“; owner
# téhož dne CODE-web: „udělej mi Rúnarovo R jako je na reading card jako ikonu pro appku“ (BACKLOG: napřed náhled, všechny velikosti).
# Po prvním náhledu (R v kameni): „bez kamene. ale můžeme udělat zlatý rámeček po okraji ikony. tvar asi záleží na tvaru ikony
# v mobilu. necháme i s kamenem.“ → výchozí je holé R se zlatým rámečkem; --kamen dá R v kameni jako na kartě, --bez-ramecku
# rámeček vynechá (= první náhled).
# Owner 2026-11-01 (přes CODE-tune): „teď mě napadá R v lucerně. samozřejmě že by muselo být větší, aby šlo R poznat, ale je to
# zajímavý nápad“ → „5. ano udělej náhled D“. --lucerna: lucerna z kresby N1 (docs/inbox/2026-10-30-pirko-a-symboly.html — tam
# byla pro návod malá, owner 2026-10-30: „lucerna nejde poznat … třeba ji budeme moci použít větší někde jinde“), R svítí místo
# plamene. Sklo je proti N1 širší, ať je R co největší; R je i tak menší než bez lucerny (rozměry vypíše main()).
# Kresba R se nekopíruje: skript volá produkční runeSvg (v2/runar-utils.js) nad RUNE_SVGS.Raidho (v2/runar-svgs.js). Holé R =
# frame:false, tedy jen hlavní tah runy (§5); kámen = frame:true. Záře a pozadí jako líc karty (.rk-o v runar-runakort.css): tmavý
# radiální přechod a drop-shadow #FFBF0030 (na kartě 14,5 % šířky kamene = ~10 % jeho výšky). Rámeček je zlatá linka jako okraj karty,
# jen silnější, ať je v 60 pt na ploše vidět. Rámeček patří okraji ikony, ne runě — kolem R žádná ozdoba (§5); lucerna není ozdoba
# runy, ale věc, ve které R svítí (ownerův nápad).
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
#                pod 1 px a na tmavé liště R mizelo (náhled 2026-10-29). S --lucernou zůstává karta prohlížeče holé R (lucerna by
#                v 16 px byla pár pixelů a R v ní nečitelné).
# Soubory (jména jako dnes ve v2/icons — manifest.json, sw.js a stránky se měnit nemusí):
#   favicon.ico (16, 32, 48) · favicon-96x96.png · apple-touch-icon.png (180) · web-app-manifest-192x192.png · web-app-manifest-512x512.png
#   · play-512.png (ikona pro výpis v Google Play, 512×512 bez průhlednosti)
# Owner 2026-11-01 k náhledům A–D2: „ani jedno se mi nelíbí. tohle R bych chtěl“ (snímek obrazovky načítání čtení) → výchozí R
# je R ze značky appky (znackaSvg z v2/runar-znacka.js); R z kresby run (runeSvg) zůstává pod --r-runa a v kameni (--kamen).
#   python -X utf8 scripts/ikona_appky.py --cil <složka> [--kamen | --lucerna] [--bez-ramecku] [--r-runa]
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
# Lucerna podle té, která stojí vedle Rúnara na moodboardu (v2/assets/app-moodboard.png): tmavé kování se zlatými hranami, očko
# a makovice, zvonovitá stříška s kosočtvercem, okraj s nýty, okno se špičatým obloukem a vnitřní mřížkou, úzká boční okna (hloubka),
# stupňovitý podstavec s nožkami. Owner 2026-11-01 k první, holé kresbě (N1): „ta lampa je hodně špatná. zapracuj víc na detailech“.
# R svítí místo svíčky: sklo je tmavé, kouřově jantarové, a nejjasnější je R samo (světlejší zlatá a záře), ať ho jantar nepřebije.
# Zkoušeno 2026-11-01: jasné sklo s tmavou mřížkou svítí víc, ale R pak musí být krémové s tmavým obrysem — runa už není zlatá (§5).
# Jednotky: kresba 100 × ~105, střed x = 50. Kov (popředí) leží NAD R, sklo a světlo POD ním — mřížka R nekříží.
LUC_ZLATA_R = '#FFD36A'        # R v lucerně: zlatá světlejší než hrany kování (R je zdroj světla)
LUC_KOV = '#D6A85C'            # hrany kování = zlatá okrajů karty
LUC_BODY = [(50, 0.0), (16, 27.6), (84, 27.6), (16, 31.2), (84, 31.2), (16.5, 96.6), (83.5, 96.6), (18.5, 101.6), (81.5, 101.6),
            (19.5, 104.4), (80.5, 104.4)]                  # obrys pro výpočet velikosti (očko, okraj stříšky, podstavec, nožky)
LUC_RAMEC = (50, 61.0, 37.7, 21.8)                         # R: střed x, y, výška, nejvyšší šířka (mezi vrcholem oblouku a příčkou)
LUC_MERENI = (41, 40, 59, 83.5)                            # sloupec, kde je jen R (bez mřížky) — pro měření jeho výšky
# Velikost lucerny jako podíl strany: [s rámečkem, bez rámečku]. Kruhové tvary (Android, profilovka): nejvzdálenější bod lucerny
# od středu — Android do 40 % (jistý kruh, hlídá pojistka_maskable), s rámečkem s mezerou k němu. iPhone / Play: výška lucerny.
LUC_MIRA = {'android': (0.335, 0.385), 'profil': (0.38, 0.43), 'iphone': (0.72, 0.80), 'play': (0.72, 0.80)}
OKNO = 'M33.6 88.6 L33.6 47 C33.6 40.5 40.5 36.3 50 34.6 C59.5 36.3 66.4 40.5 66.4 47 L66.4 88.6 Z'
OKNO_L = 'M22.1 88.6 L22.1 44 C22.1 39.5 24.5 36.6 26.35 35.4 C28.2 36.6 30.6 39.5 30.6 44 L30.6 88.6 Z'
OKNO_P = 'M69.4 88.6 L69.4 44 C69.4 39.5 71.8 36.6 73.65 35.4 C75.5 36.6 77.9 39.5 77.9 44 L77.9 88.6 Z'
# popředí: kování (výplň tmavý bronz, hrany zlatá), mřížka a nýty
LUC_POPREDI = (
    '<defs><linearGradient id="kov" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#33281a"/>'
    '<stop offset="1" stop-color="#17110b"/></linearGradient></defs>'
    '<g stroke="' + LUC_KOV + '" stroke-linejoin="round">'
    '<circle cx="50" cy="3" r="2.4" fill="none" stroke-width="1.2"/>'
    '<rect x="49.1" y="5.4" width="1.8" height="1.6" fill="url(#kov)" stroke-width="0.45"/>'
    '<path d="M45.6 12 L54.4 12 L53 9.2 L47 9.2 Z" fill="url(#kov)" stroke-width="0.65"/>'
    '<circle cx="50" cy="7.9" r="1.5" fill="url(#kov)" stroke-width="0.6"/>'
    '<path d="M45.6 12 C44.6 18.5 35 24.4 18 27.6 L82 27.6 C65 24.4 55.4 18.5 54.4 12 Z" fill="url(#kov)" stroke-width="0.8"/>'
    '<path d="M47.8 12.4 C47 18.4 41 23.8 32 27.2 M52.2 12.4 C53 18.4 59 23.8 68 27.2" fill="none" stroke-width="0.4" stroke-opacity="0.55"/>'
    '<path d="M50 16.4 L52.7 19.9 L50 23.4 L47.3 19.9 Z" fill="none" stroke-width="0.6"/>'
    '<rect x="16" y="27.6" width="68" height="3.6" fill="url(#kov)" stroke-width="0.8"/>'
    '<rect x="17.5" y="31.2" width="4.6" height="61.2" fill="url(#kov)" stroke-width="0.7"/>'
    '<rect x="77.9" y="31.2" width="4.6" height="61.2" fill="url(#kov)" stroke-width="0.7"/>'
    '<rect x="22.1" y="31.2" width="55.8" height="2.4" fill="url(#kov)" stroke-width="0.6"/>'
    '<rect x="30.6" y="33.6" width="3" height="55" fill="url(#kov)" stroke-width="0.6"/>'
    '<rect x="66.4" y="33.6" width="3" height="55" fill="url(#kov)" stroke-width="0.6"/>'
    '<path d="M33.6 33.6 H66.4 V88.6 H33.6 Z ' + OKNO + '" fill="url(#kov)" fill-rule="evenodd" stroke-width="0.7"/>'
    '<path d="M22.1 33.6 H30.6 V88.6 H22.1 Z ' + OKNO_L + '" fill="url(#kov)" fill-rule="evenodd" stroke-width="0.55"/>'
    '<path d="M69.4 33.6 H77.9 V88.6 H69.4 Z ' + OKNO_P + '" fill="url(#kov)" fill-rule="evenodd" stroke-width="0.55"/>'
    '<path d="M36.4 84.4 L36.4 47.6 C36.4 42.2 42 38.6 50 37.3 C58 38.6 63.6 42.2 63.6 47.6 L63.6 84.4 Z" fill="none" stroke-width="0.5" stroke-opacity="0.55"/>'
    '<path d="M26.35 38 V88.6 M73.65 38 V88.6 M22.1 62 H30.6 M69.4 62 H77.9" fill="none" stroke-width="0.4" stroke-opacity="0.65"/>'
    '<rect x="22.1" y="88.6" width="55.8" height="3.8" fill="url(#kov)" stroke-width="0.6"/>'
    '<rect x="20.5" y="92.4" width="59" height="4.2" fill="url(#kov)" stroke-width="0.7"/>'
    '<path d="M16.5 96.6 L83.5 96.6 L81.5 101.6 L18.5 101.6 Z" fill="url(#kov)" stroke-width="0.8"/>'
    '<path d="M19 99.1 H81" fill="none" stroke-width="0.35" stroke-opacity="0.5"/>'
    '<rect x="19.5" y="101.6" width="7" height="2.8" fill="url(#kov)" stroke-width="0.6"/>'
    '<rect x="73.5" y="101.6" width="7" height="2.8" fill="url(#kov)" stroke-width="0.6"/>'
    '</g><g fill="#E9C988">'
    + ''.join('<circle cx="%g" cy="29.4" r="0.65"/>' % x for x in (19.5, 34.5, 50, 65.5, 80.5))
    + ''.join('<circle cx="%g" cy="90.5" r="0.6"/>' % x for x in (26, 50, 74))
    + ''.join('<circle cx="%g" cy="94.5" r="0.6"/>' % x for x in (24, 76))
    + '<circle cx="50" cy="19.9" r="0.7"/></g>')
# pozadí lucerny: záře kolem, jantarové sklo předního okna, tmavší boční okna (sklo z boku)
LUC_POZADI = (
    '<defs><radialGradient id="halo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFBF00" stop-opacity="0.07"/>'
    '<stop offset="1" stop-color="#FFBF00" stop-opacity="0"/></radialGradient>'
    '<radialGradient id="sklo" cx="50" cy="61" r="30" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#D07A22" stop-opacity="0.95"/>'
    '<stop offset="0.45" stop-color="#6a3410" stop-opacity="0.95"/><stop offset="1" stop-color="#1a0d05" stop-opacity="1"/></radialGradient>'
    '<linearGradient id="bokL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1e1108" stop-opacity="0.95"/>'
    '<stop offset="1" stop-color="#9a5418" stop-opacity="0.8"/></linearGradient>'
    '<linearGradient id="bokP" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#1e1108" stop-opacity="0.95"/>'
    '<stop offset="1" stop-color="#9a5418" stop-opacity="0.8"/></linearGradient></defs>'
    '<ellipse cx="50" cy="60" rx="58" ry="62" fill="url(#halo)"/>'
    '<path d="' + OKNO + '" fill="url(#sklo)"/>'
    '<path d="' + OKNO_L + '" fill="url(#bokL)"/><path d="' + OKNO_P + '" fill="url(#bokP)"/>')

def kresba_znacka(barva=ZLATA):
    # Značka ᚱ z appky: znackaSvg ve v2/runar-znacka.js — jediná kresba pro appku, web i ikonu (§18; proč a odkud tvar → hlavička
    # toho souboru). Do 2026-11-02 žila geometrie tady (R_ZNACKA), CODE-tune ji 1:1 přenesla do appky (c9ce542).
    # data-vb: viewBox je pevný (ořez clipPath getBBox nevidí, výpočet obrysu ve stránce by R posunul).
    js = ("var fs=require('fs');"
          "process.stdout.write(new Function(fs.readFileSync(process.argv[1],'utf8')+';return znackaSvg;')()({barva:process.argv[2]}))")
    r = subprocess.run(['node', '-e', js, os.path.join(ROOT, 'v2', 'runar-znacka.js'), barva],
                       capture_output=True, encoding='utf-8', check=True)
    m = re.match(r'<svg class="znacka[^"]*" viewBox="([^"]+)"[^>]*>(.*)</svg>$', r.stdout, re.S)
    if not m or 'clipPath' not in m.group(2):
        sys.exit('ikona_appky: znackaSvg nevrátil kresbu: %s' % r.stdout[:120])
    return ' viewBox="%s" data-vb="1" xmlns="http://www.w3.org/2000/svg"' % m.group(1), m.group(2)

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
#runa{position:absolute;left:%(x)s;top:%(y)s;height:%(h)dpx;transform:translate(-50%%,-50%%);%(glow)s}
#svit,#ram{position:absolute;left:0;top:0;width:100%%;height:100%%}
</style></head><body><div id="pozadi"></div>
<svg id="svit" viewBox="0 0 %(m)d %(m)d" xmlns="http://www.w3.org/2000/svg">%(svit)s</svg>
<svg id="runa"%(atributy)s><g>%(paths)s</g></svg>
<svg id="ram" viewBox="0 0 %(m)d %(m)d" xmlns="http://www.w3.org/2000/svg">%(lucerna)s%(ramecek)s</svg>
<script>
// viewBox = skutečný obrys kresby (holé R zabírá jen část plochy kamene, viewBox kresby počítá s kamenem); 2 %% rezerva na vyhlazení
var s=document.getElementById('runa'),maxw=%(maxw)g,bw,bh;
if(s.hasAttribute('data-vb')){var v=s.viewBox.baseVal;bw=v.width;bh=v.height;}
else{var b=s.querySelector('g').getBBox(),o=b.height*0.02;s.setAttribute('viewBox',[b.x-o,b.y-o,b.width+2*o,b.height+2*o].join(' '));
bw=b.width+2*o;bh=b.height+2*o;}
// v lucerně: R nesmí být širší než sklo dovolí
if(maxw>0&&s.getBoundingClientRect().width>maxw)s.style.height=(maxw*bh/bw)+'px';
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

def lucerna(tvar, s_rameckem):
    # Vrátí (kování, sklo a záře, střed R x, y v px, výška R v px, nejvyšší šířka R v px, sloupec jen s R x0, y0, x1, y1 v px).
    x0, x1 = min(p[0] for p in LUC_BODY), max(p[0] for p in LUC_BODY)
    y0, y1 = min(p[1] for p in LUC_BODY), max(p[1] for p in LUC_BODY)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    mira = LUC_MIRA[tvar][0 if s_rameckem else 1]
    if TVARY[tvar][0] == 'kruh':
        k = mira * M / (max(((x - cx) ** 2 + (y - cy) ** 2) ** 0.5 for x, y in LUC_BODY) + 0.6)   # + polovina nejsilnější hrany
    else:
        k = mira * M / (y1 - y0 + 1.2)
    tx, ty = M / 2 - cx * k, M / 2 - cy * k
    obal = '<g transform="translate(%g %g) scale(%g)">%%s</g>' % (tx, ty, k)
    rx, ry, rh, rw = LUC_RAMEC
    mx0, my0, mx1, my1 = LUC_MERENI
    mereni = (tx + mx0 * k, ty + my0 * k, tx + mx1 * k, ty + my1 * k)
    return obal % LUC_POPREDI, obal % LUC_POZADI, tx + rx * k, ty + ry * k, rh * k, rw * k, mereni

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

def predloha(tvar, kamen, s_rameckem, tmp, tucne=False, s_lucernou=False, znacka=True):
    znacka = znacka and not kamen   # kámen je kresba run (runeSvg frame:true), R ze značky v něm není
    atributy, paths = kresba_znacka(LUC_ZLATA_R if s_lucernou else ZLATA) if znacka else kresba(kamen)
    vyska = VYSKY[tvar][0 if not kamen else (1 if s_rameckem else 2)]
    h = int(M * vyska * (1.01 if znacka else 1.04))   # rezerva viewBoxu (runeSvg 2 % nahoře i dole, značka 0,5 %)
    x = y = '50%'
    luc = svit = ''
    maxw = 0
    if s_lucernou:
        luc, svit, rx, ry, rh, maxw, _ = lucerna(tvar, s_rameckem)
        x, y, h, vyska = '%gpx' % rx, '%gpx' % ry, int(rh * (1.01 if znacka else 1.04)), rh / M
        paths = paths.replace('fill="%s"' % ZLATA, 'fill="%s"' % LUC_ZLATA_R)
    if tucne and not znacka:   # R ze značky má tah ~11 % výšky, v 16 px přes 1 px — zesilovat netřeba
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
        'm': M, 'h': h, 'x': x, 'y': y, 'maxw': maxw, 'atributy': atributy, 'paths': paths, 'svit': svit, 'lucerna': luc,
        'bg': 'transparent' if maly_kamen else POZADI,
        'zaobleni': '%g%%' % (TVARY['dlazdice'][1] * 100) if tvar == 'dlazdice' else '0',
        'glow': '' if tvar == 'dlazdice' else ('filter:drop-shadow(0 0 %dpx #FFB000C0)' % round(0.09 * M * vyska) if s_lucernou
                                                else 'filter:drop-shadow(0 0 %dpx #FFBF0030)' % round(0.10 * M * vyska)),
        'ramecek': ramecek(tvar) if s_rameckem and tvar != 'dlazdice' else ''}
    return chrome(html, tmp, '%s-%d%d%d%d%d' % (tvar, kamen, s_rameckem, tucne, s_lucernou, znacka))

def pojistka_maskable(im):
    # Vše zlaté (runa, lucerna i rámeček) musí ležet v kruhu o poloměru 40 % strany — jinak to Android v některé masce ořízne.
    px, r2, nej = im.load(), (0.40 * M) ** 2, 0.0
    for y in range(0, M, 2):
        for x in range(0, M, 2):
            rr, g, b, a = px[x, y]
            if rr > 150 and g > 110 and b < 120:   # zlatá #D6A85C a okolí (záře na tmavém pozadí zlatá není)
                nej = max(nej, (x - M / 2) ** 2 + (y - M / 2) ** 2)
    if nej > r2:
        sys.exit('ikona_appky: zlatá přesahuje bezpečný kruh Androidu (%.0f px > %.0f px)' % (nej ** 0.5, r2 ** 0.5))
    return nej ** 0.5

def vyska_zlate(im, sklo):
    # Svislý rozměr zlatých pixelů uvnitř skla (bez jeho obrysu) = výška R, jak ji kresba opravdu ukáže.
    x0, y0, x1, y1 = (int(round(v)) for v in sklo)
    px, ys = im.load(), []
    for y in range(y0 + 3, y1 - 3):
        for x in range(x0 + 3, x1 - 3, 2):
            rr, g, b, a = px[x, y]
            if rr > 150 and g > 110 and b < 120:
                ys.append(y)
                break
    return (max(ys) - min(ys) + 1) if ys else 0

def zmensi(im, n):
    return im.resize((n, n), Image.LANCZOS)

def profil(cesta, kamen=False, s_rameckem=True, strana=720, s_lucernou=False, znacka=True):
    # Profilovka na Instagram / Facebook: táž předloha, rámeček v kruhu, do kterého sítě profilovku ořízne.
    tmp = tempfile.mkdtemp(prefix='runar_profil_')
    try:
        zmensi(predloha('profil', kamen, s_rameckem, tmp, s_lucernou=s_lucernou, znacka=znacka), strana).convert('RGB').save(
            cesta, 'JPEG', quality=92, optimize=True)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

def main():
    # Cíl je povinný: ikony v2/icons se přepisují jen po ownerově schválení náhledu (BACKLOG „Nové logo appky“), ne omylem bez parametru.
    if '--cil' not in sys.argv:
        sys.exit('ikona_appky: chybí --cil <složka> (náhled do scratchpadu; po schválení --cil v2/icons)')
    cil = sys.argv[sys.argv.index('--cil') + 1]
    kamen, s_rameckem, s_lucernou = '--kamen' in sys.argv, '--bez-ramecku' not in sys.argv, '--lucerna' in sys.argv
    znacka = '--r-runa' not in sys.argv
    if kamen and s_lucernou:
        sys.exit('ikona_appky: --kamen a --lucerna naráz ne (R svítí v lucerně holé)')
    os.makedirs(cil, exist_ok=True)
    tmp = tempfile.mkdtemp(prefix='runar_ikona_')
    try:
        android = predloha('android', kamen, s_rameckem, tmp, s_lucernou=s_lucernou, znacka=znacka)
        iphone = predloha('iphone', kamen, s_rameckem, tmp, s_lucernou=s_lucernou, znacka=znacka)
        play = predloha('play', kamen, s_rameckem, tmp, s_lucernou=s_lucernou, znacka=znacka)
        mala = predloha('dlazdice', kamen, s_rameckem, tmp, znacka=znacka)   # karta prohlížeče: vždy bez lucerny (hlavička)
        drobna = predloha('dlazdice', kamen, s_rameckem, tmp, tucne=True, znacka=znacka)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    print('zlatá od středu nejdál %.0f px z dovolených %.0f (Android)' % (pojistka_maskable(android), 0.40 * M))
    if s_lucernou:
        for nazev, tvar, im in (('Android', 'android', android), ('iPhone', 'iphone', iphone)):
            print('R v lucerně (%s): výška %d px z %d, bez lucerny %d px' % (
                nazev, vyska_zlate(im, lucerna(tvar, s_rameckem)[6]), M, round(VYSKY[tvar][0] * M)))
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
