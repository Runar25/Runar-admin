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
# do ../therunekeeper-web (kromě CNAME, ten si drží GitHub), co ve web/site není, tam smaže (zrcadlo), commitne a pushne tam. Repo Runar-admin necommituje — to udělá session.
# Taky doplní popis do <meta … data-meta="klíč" content="…"> z UI_TEXT.is (náhled při sdílení, 2026-10-27) — viz popisy().
#   python -X utf8 scripts/web_nasad.py "<zpráva commitu v EN>"      nasadit
#   python -X utf8 scripts/web_nasad.py --jen-verze                  jen přepsat verze (bez kopírování)
import hashlib, html, io, json, os, re, shutil, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, 'web', 'site')
WEB = os.path.join(os.path.dirname(ROOT), 'therunekeeper-web')
SDILENE = ['web.js']   # soubory, které načítá víc stránek; runakort.* se 2026-10-21 přestěhovaly do appky (v2/runar-runakort.*)
NECHAT = {'CNAME', '.git', '.nojekyll', 'README.md'}   # v repu webu, ale ne ve web/site — nemazat

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

# Náhled při sdílení (owner 2026-10-27, „udělej všech pět“, bod 3): Facebook, Instagram, Messenger ani iMessage JS nespouštějí, čtou jen
# <meta> v HTML. Stránka si texty bere z UI_TEXT až v prohlížeči, takže popis v <meta> by byl druhá kopie textu (§20) — proto ho
# nepíšeme ručně: <meta … data-meta="hero_quote" content=""> dostane při nasazení UI_TEXT.is.hero_quote (islandština = výchozí
# jazyk webu, §2), bez uvozovek a zalomení. Změní-li tune text v appce, srovná ho příští nasazení webu.
def ui_text():
    js = ("var s=require('fs').readFileSync(process.argv[1],'utf8');"
          "process.stdout.write(JSON.stringify(new Function(s+';return UI_TEXT;')()))")
    r = subprocess.run(['node', '-e', js, os.path.join(ROOT, 'v2', 'runar-translations.js')],
                       capture_output=True, encoding='utf-8', check=True)
    return json.loads(r.stdout)

def cisty(v):
    v = re.sub(r'<br\s*/?>', ' ', v)
    v = re.sub(r'<[^>]+>', '', v)
    v = re.sub(r'\s+', ' ', v).strip().strip('"„“”').strip()
    return html.escape(v, quote=True)

def popisy():
    U, zmeneno = None, []
    for d, _, fs in os.walk(SITE):
        for f in fs:
            p = os.path.join(d, f)
            if not f.endswith('.html'):
                continue
            s = io.open(p, encoding='utf-8').read()
            if 'data-meta="' not in s:
                continue
            if U is None:
                U = ui_text()['is']
            def nahrad(m):
                if not U.get(m.group(2)):
                    sys.exit('web_nasad: klíč %s (%s) v UI_TEXT.is není' % (m.group(2), os.path.relpath(p, ROOT)))
                return m.group(1) + cisty(U[m.group(2)]) + m.group(3)
            n = re.sub(r'(<meta\b[^>]*\bdata-meta="(\w+)"[^>]*\bcontent=")[^"]*(")', nahrad, s)
            if n != s:
                io.open(p, 'w', encoding='utf-8', newline='\n').write(n)
                zmeneno.append(os.path.relpath(p, ROOT))
    return zmeneno

def main():
    hashe, zmeneno = verze()
    print('verze:', ', '.join('%s=%s' % kv for kv in hashe.items()))
    print('přepsané stránky:', ', '.join(zmeneno) or 'žádné (verze sedí)')
    print('popisy pro sdílení:', ', '.join(popisy()) or 'beze změny')
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
    for d, ds, fs in os.walk(WEB):
        ds[:] = [x for x in ds if x not in NECHAT]
        for f in fs:
            rel = os.path.relpath(os.path.join(d, f), WEB)
            if rel.split(os.sep)[0] in NECHAT:
                continue
            if not os.path.exists(os.path.join(SITE, rel)):
                os.remove(os.path.join(d, f))
                print('web: smazáno (není ve web/site):', rel)
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
