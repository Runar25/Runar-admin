# -*- coding: utf-8 -*-
# web_nasad.py — nasazení webu therunekeeper.com (CODE-web 2026-10-21).
#
# Proč: (1) GitHub Pages posílá soubory s max-age=600 → po změně sdíleného souboru (runakort.js…) držel prohlížeč ownera starou verzi
# a stránka /heim/ se nevykreslila celá (owner 2026-10-21: „pod kartou není text … hrůza“). Stránky proto načítají sdílené soubory
# s verzí v adrese (?v=…). Ručně psaná verze by se zapomněla zvýšit (§30: co se má dít pokaždé, dělá stroj) → tenhle skript ji
# spočítá z obsahu souboru (prvních 10 znaků SHA-256): změní se soubor, změní se adresa. (2) Do 2026-10-21 se nasazovalo ručním
# kopírováním jednotlivých souborů do repa Runar25/therunekeeper-web — snadno se jeden zapomněl.
#
# Co dělá: v HTML pod web/site/ přepíše ?v=… u sdílených souborů na hash obsahu (v repu, ať zdroj = nasazené), zkopíruje web/site/
# do ../therunekeeper-web (kromě CNAME, ten si drží GitHub), commitne a pushne tam. Repo Runar-admin necommituje — to udělá session.
#   python -X utf8 scripts/web_nasad.py "<zpráva commitu v EN>"      nasadit
#   python -X utf8 scripts/web_nasad.py --jen-verze                  jen přepsat verze (bez kopírování)
import hashlib, io, os, re, shutil, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, 'web', 'site')
WEB = os.path.join(os.path.dirname(ROOT), 'therunekeeper-web')
SDILENE = ['runakort.css', 'runakort.js', 'web.js']   # soubory, které načítá víc stránek

def h(p):
    return hashlib.sha256(open(os.path.join(SITE, p), 'rb').read()).hexdigest()[:10]

def verze():
    hashe = {f: h(f) for f in SDILENE}
    zmeneno = []
    for d, _, fs in os.walk(SITE):
        for f in fs:
            if not f.endswith('.html'):
                continue
            p = os.path.join(d, f)
            s = io.open(p, encoding='utf-8').read()
            n = s
            for sd, hv in hashe.items():
                n = re.sub(r'(' + re.escape(sd) + r')(\?v=[0-9a-zA-Z]*)?"', r'\1?v=' + hv + '"', n)
            if n != s:
                io.open(p, 'w', encoding='utf-8', newline='\n').write(n)
                zmeneno.append(os.path.relpath(p, ROOT))
    return hashe, zmeneno

def main():
    hashe, zmeneno = verze()
    print('verze:', ', '.join('%s=%s' % kv for kv in hashe.items()))
    print('přepsané stránky:', ', '.join(zmeneno) or 'žádné (verze sedí)')
    if '--jen-verze' in sys.argv:
        return
    if len(sys.argv) < 2 or sys.argv[1].startswith('--'):
        sys.exit('chybí zpráva commitu (EN)')
    if not os.path.isdir(os.path.join(WEB, '.git')):
        sys.exit('nenalezeno repo webu: ' + WEB)
    subprocess.run(['git', '-C', WEB, 'pull', '-q', '--rebase'], check=True)
    for d, _, fs in os.walk(SITE):
        for f in fs:
            src = os.path.join(d, f)
            rel = os.path.relpath(src, SITE)
            if rel == 'CNAME':
                continue
            dst = os.path.join(WEB, rel)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copyfile(src, dst)
    subprocess.run(['git', '-C', WEB, 'add', '-A'], check=True)
    st = subprocess.run(['git', '-C', WEB, 'status', '--porcelain'], capture_output=True, text=True).stdout.strip()
    if not st:
        print('web: beze změny, nic k nasazení')
        return
    print('web: změněno\n' + st)
    subprocess.run(['git', '-C', WEB, '-c', 'user.name=CODE-web', 'commit', '-q', '-m', sys.argv[1]], check=True)
    subprocess.run(['git', '-C', WEB, 'push', '-q'], check=True)
    print('web: pushnuto (GitHub Pages nasadí do ~1 min)')

main()
