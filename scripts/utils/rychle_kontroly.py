# -*- coding: utf-8 -*-
# Rychlé textové kontroly při commitu — volá je hooks/pre-commit.py se seznamem staged souborů (na stdin).
#
# Proč (CODE-tune 2026-10-14, domluveno s CODE-read): tři dny po sobě šel commit bez kontroly, která čte měněný soubor — 2026-10-12 zásady
# (㊽ a ㊱ shodily pre-push), 2026-10-13 8c12069 (㊸), 2026-10-14 49db492 (㊱; zablokoval push i CODE-read). Pre-push v čisté kopii chybu
# chytí, ale až po minutách smoke a už ve sdíleném stromě, kde blokuje všechny. Tady se rychlé textové kontroly pustí hned při commitu.
# Podmínka CODE-read: pre-commit běží nad SDÍLENÝM stromem a kontroly procházejí celé repo — uvidí i cizí necommitnutou práci (proto je
# pre-push v čisté kopii, DECISIONS 2026-10-10 (40)). Commit proto zastaví JEN vada na souboru, který je ve staged: první cesta na řádku
# FAIL nebo na odsazeném řádku pod ním (verify_doc_links a verify_jazyk_ui vypisují cesty pod souhrnným FAIL). FAIL na jiném souboru nebo
# bez cesty se vypíše jako „cizí, neblokuje“ — dál ho chytí pre-push. Staged seznam bere pre-commit z indexu, se kterým commit běží
# (GIT_INDEX_FILE — commit_vlastni commituje z dočasného indexu).
# Seznam = rychlé textové kontroly ze smoke; změřeno 2026-10-14: všech 8 za sebou 3,8 s, tady běží souběžně. Prohlížečové a pomalé
# kontroly zůstávají jen v pre-push. Nová rychlá textová kontrola → řádek do KONTROLY.
#   (stdin: staged cesty)  python -X utf8 scripts/utils/rychle_kontroly.py
#   python -X utf8 scripts/utils/rychle_kontroly.py --test     · rozhodování na ukázkách skutečných tvarů výstupu (smoke přes verify_rychle_kontroly.py)
import os, re, subprocess, sys

ROOT = (os.environ.get('RUNAR_ROOT') or os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))).replace('\\', '/')
KONTROLY = ['verify_is_kontrola_jedno_misto.js', 'verify_doc_links.js', 'verify_opt_out.js', 'verify_runar_root.js', 'verify_jazyk_ui.js',
            'verify_zakazy_cesty.js', 'verify_code_doc_refs.js', 'verify_edge_imports.js']
CESTA = re.compile(r'((?:[A-Za-z]:[\\/])?(?:[\w.@-]+[\\/])*[\w.@-]+\.(?:js|py|md|html|css|ts|json|sql|sh|toml|txt|ps1))(?::\d+)?')


def umisteni(radek):
    """Kde vada je: cesta na ZAČÁTKU obsahu řádku (po „FAIL“, „·“ a značce „(A) §5“), „UI_TEXT…“ = v2/runar-translations.js.
    Cesty zmíněné dál v textu („… (CLAUDE.md §31):“, „(scripts/verify_x.js)“) nejsou umístění — jinak by cizí vada zastavila commit
    souboru, který kontrola jen jmenuje."""
    t = re.sub(r'^\s*(FAIL\b\s*)?(·\s*)?(\([A-Z]\)\s+§\d+\s+)?', '', radek)
    if t.startswith('UI_TEXT'):
        return 'v2/runar-translations.js'
    m = CESTA.match(t)
    return m.group(1).replace('\\', '/') if m else None


def je_staged(cesta, staged):
    c = cesta.lower()
    return any(c == s.lower() or c.endswith('/' + s.lower()) for s in staged)


def rozhodni(vystupy, staged):
    """vystupy: [(kontrola, navratovy_kod, text)] → (blokujici, cizi) — seznamy (kontrola, řádek)."""
    st = [s.replace('\\', '/').strip() for s in staged if s.strip()]
    blok, cizi = [], []
    for k, rc, text in vystupy:
        if rc == 0:
            continue
        pod_fail, nalezeno = False, False
        for l in text.splitlines():
            if re.match(r'^\s*FAIL\b', l):
                pod_fail = True              # řádek FAIL — umístění může být přímo na něm
            elif not (pod_fail and re.match(r'^\s+\S', l)):
                pod_fail = False             # prázdný nebo neodsazený řádek ukončí výpis pod souhrnným FAIL
                continue
            c = umisteni(l)
            if c is None:
                continue
            nalezeno = True
            (blok if je_staged(c, st) else cizi).append((k, l.strip()))
        if not nalezeno:
            cizi.append((k, '(bez umístění) ' + next((l.strip() for l in text.splitlines() if re.match(r'^\s*FAIL\b', l)), 'kontrola skončila chybou')))
    return blok, cizi


def spust(staged):
    beh = []
    for k in KONTROLY:
        p = ROOT + '/scripts/' + k
        if os.path.exists(p):
            beh.append((k, subprocess.Popen(['node', p], cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, encoding='utf-8')))
    vystupy = []
    for k, pr in beh:
        try:
            out, _ = pr.communicate(timeout=120)
        except subprocess.TimeoutExpired:
            pr.kill(); out = 'FAIL  kontrola visí přes 120 s'
        vystupy.append((k, pr.returncode, out or ''))
    return rozhodni(vystupy, staged)


def samotest():
    st = ['scripts/utils/x.js', 'RUNAR_BACKLOG.md', 'CLAUDE.md', 'v2/runar-translations.js', 'v2/runar-help.html']
    v = [
        # ㊱ — umístění na řádku FAIL (staged → blokuje); soubor zmíněný dál v textu se nepočítá
        ('verify_is_kontrola_jedno_misto.js', 1, 'FAIL  scripts/utils/x.js:9  [nástroj-a, nástroj-b]  // zmínka o `jiny/soubor.py` dál v textu\n1× souhrn'),
        # doc_links — souhrnný FAIL, umístění pod ním je CIZÍ; staged RUNAR_BACKLOG.md dál v řádku není umístění → neblokuje
        ('verify_doc_links.js', 1, 'FAIL  1 odkaz(ů) míří na soubor, který neexistuje:\n  · docs/cizi.md:3  link → RUNAR_BACKLOG.md\n\n  Oprav cestu.'),
        # jazyk — souhrnný FAIL jmenuje staged CLAUDE.md jen jako odkaz; vada pod ním je v cizím souboru → neblokuje
        ('verify_jazyk_ui.js', 1, 'FAIL  čeština v textu (1×) — jen IS a EN (CLAUDE.md §31):\n        web/cizi.html (text) „ahoj“'),
        # jazyk — UI_TEXT = překlady (staged) → blokuje; „soubor (text)“ u staged nápovědy → blokuje; Windows absolutní cesta → blokuje
        ('verify_jazyk_ui.js#2', 1, 'FAIL  čeština v textu (3×):\n        UI_TEXT.en.foo „ahoj“\n        v2/runar-help.html (text) „čau“\n        C:\\repo\\scripts\\utils\\x.js:12 „x“'),
        # zákazy — „(A) §5 soubor:řádek“; cizí soubor → neblokuje; souhrn jmenuje kontrolu → není umístění
        ('verify_zakazy_cesty.js', 1, 'FAIL  (A) §5 v2/cizi.js:4 ozdoba\nFAIL  zákazy a cesty: 1 vad (scripts/verify_zakazy_cesty.js)'),
        # samotest bez umístění → neblokuje
        ('verify_runar_root.js', 1, 'FAIL  samotest'),
        # prošlá kontrola se nečte
        ('verify_opt_out.js', 0, 'FAIL  scripts/utils/x.js:1 (nemá se číst — rc 0)'),
    ]
    blok, cizi = rozhodni(v, st)
    bl = sorted(l for _, l in blok)
    ok = sorted(k for k, _ in blok) == ['verify_is_kontrola_jedno_misto.js', 'verify_jazyk_ui.js#2', 'verify_jazyk_ui.js#2', 'verify_jazyk_ui.js#2'] \
        and not any(k in ('verify_doc_links.js', 'verify_jazyk_ui.js', 'verify_zakazy_cesty.js', 'verify_runar_root.js', 'verify_opt_out.js') for k, _ in blok) \
        and any(k == 'verify_runar_root.js' for k, _ in cizi) and any(k == 'verify_doc_links.js' for k, _ in cizi)
    print(('OK    ' if ok else 'FAIL  ') + 'rychlé kontroly: vada na staged souboru zastaví (na řádku FAIL, pod souhrnem, UI_TEXT, „soubor (text)“, cesta z Windows); '
          'cizí soubor, soubor jen zmíněný v textu a FAIL bez umístění ne' + ('' if ok else ' — blok=' + str(bl) + ' cizi=' + str(cizi)))
    return ok


if __name__ == '__main__':
    if '--test' in sys.argv:
        sys.exit(0 if samotest() else 1)
    staged = [l.strip() for l in sys.stdin.read().splitlines() if l.strip()]
    if not staged:
        sys.exit(0)
    blok, cizi = spust(staged)
    for k, l in cizi[:3]:
        print('[hook] rychlé kontroly — cizí, neblokuje (' + k + '): ' + l[:150])
    if len(cizi) > 3:
        print('[hook] rychlé kontroly — … a dalších ' + str(len(cizi) - 3) + ' cizích (neblokují; chytí je pre-push)')
    if blok:
        for k, l in blok:
            print('[hook] rychlé kontroly — ZASTAVENO (' + k + '): ' + l[:200])
        print('[hook] Commit zastaven: kontrola padá na souboru, který commituješ. Oprav ho — pre-push by ho stejně zastavil, už ve sdíleném stromě.')
        sys.exit(1)
    sys.exit(0)
