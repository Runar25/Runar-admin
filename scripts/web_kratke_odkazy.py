# -*- coding: utf-8 -*-
# web_kratke_odkazy.py — krátké adresy kanálů: therunekeeper.com/ig, /tt, /yt, /fb → landing se štítkem kanálu (?z=ig …)
# (CODE-web 2026-11-02; owner „5. ano“ na nabídku hezčích odkazů do bia — „therunekeeper.com/?z=ig“ v biu vypadá hůř než „…/ig“).
# Seznam kanálů = KANALY v supabase/functions/waitlist-join/index.ts (server jiné štítky zahodí); tady se jen čte, druhá kopie nevzniká
# (§18). Stránka přesměruje hned (meta refresh i JS), je noindex a canonical míří na kořen — pro vyhledávač to není další stránka.
# GENEROVANÉ — needitovat ručně; pouští ho i scripts/web_nasad.py před každým nasazením.
#   python -X utf8 scripts/web_kratke_odkazy.py        → web/site/<kanál>/index.html
import io, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, 'web', 'site')
FN = os.path.join(ROOT, 'supabase', 'functions', 'waitlist-join', 'index.ts')
APP = 'https://runar25.github.io/Runar-admin/v2/'

STRANKA = '''<!doctype html>
<html lang="is">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>Rúnar · The Rune Keeper</title>
<!-- GENEROVÁNO scripts/web_kratke_odkazy.py: krátká adresa kanálu → landing se štítkem; needitovat ručně. -->
<link rel="canonical" href="https://therunekeeper.com/">
<meta http-equiv="refresh" content="0; url=../?z=%(k)s">
<link rel="icon" type="image/png" sizes="96x96" href="%(app)sicons/favicon-96x96.png">
<link rel="apple-touch-icon" href="%(app)sicons/apple-touch-icon.png">
</head>
<body>
<script>location.replace('../?z=%(k)s');</script>
<a href="../?z=%(k)s">therunekeeper.com</a>
</body>
</html>
'''

def kanaly():
    m = re.search(r'const KANALY = new Set\(\[([^\]]*)\]\)', io.open(FN, encoding='utf-8').read())
    k = re.findall(r'"([a-z]{1,12})"', m.group(1)) if m else []
    if not k:
        sys.exit('FAIL web_kratke_odkazy: seznam KANALY ve waitlist-join nenalezen')
    return k

def main():
    k = kanaly()
    for x in k:
        p = os.path.join(SITE, x, 'index.html')
        os.makedirs(os.path.dirname(p), exist_ok=True)
        io.open(p, 'w', encoding='utf-8', newline='\n').write(STRANKA % {'k': x, 'app': APP})
    print('krátké adresy: ' + ', '.join('/' + x for x in k) + ' → web/site')

if __name__ == '__main__':
    main()
