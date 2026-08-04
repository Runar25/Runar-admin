# -*- coding: utf-8 -*-
"""
is-vazba.py  —  Islandska VAZBA (rekce / pad / kolokace / idiom), vrstva NAD BIN.

BIN dava jen TVARY. Rekci (jaky pad rid sloveso), frazove vazby a idiomy dava
Islensk nutimamalsordabok (Arnastofnun) + Risamalheild korpus. Tenhle skript oba
zdroje obali do jednoho prikazu, at zadna session nehada a nemusi rucne skladat curl.

POUZITI:
  python -X utf8 is-vazba.py <slovo>              # slovnikova vazba (FALLSTJ / SOSTÆÐA / DÆMI)
  python -X utf8 is-vazba.py --freq "<fraze>" ["<fraze2>" ...]   # korpusova cetnost (n-gram)
  python -X utf8 is-vazba.py <slovo> --freq "<fraze>" ...        # obojí

Priklady:
  python -X utf8 is-vazba.py hræða
  python -X utf8 is-vazba.py hreyfa --freq "hreyfa við" "hræða við"

Recept + zdroje: memory/is-vazba-check.md  (CLAUDE.md §2). Gotcha: islandska pismena
jdou do URL vzdy jako UTF-8 %.. (resi urllib.parse.quote); doslovne znaky na Windows
shellu se poslou jako Latin-1 a korpus vrati TISE PRAZDNO.
"""
import sys, io, json, urllib.request, urllib.parse

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DICT_API = 'https://islenskordabok.arnastofnun.is/django/api/flettur_v4/'
NGRAM_API = 'https://n.arnastofnun.is/ngram/query'
UA = {'User-Agent': 'Mozilla/5.0 (runar is-vazba check)'}

# teg kody, ktere nesou vazbu (ostatni = vyklad/odkazy/vyslovnost)
TEG_LABEL = {
    'FALLSTJ': 'REKCE (pad predmetu)',
    'FALLSTJ-FS': 'REKCE (predlozkova)',
    'SOSTÆÐA': 'VAZBA/kolokace <slot=pad>',
    'SOHAUS': 'frazove sloveso (hlavicka)',
    'OSTÆÐA': 'jmenna kolokace',
    'OSTÆÐA-AUK': 'jmenna kolokace',
    'FRUMLAG': 'pad PODMETU',
    'LIÐUR': 'vyznam c.',
    'DÆMI': 'priklad',
    'ISL-TEXTI': 'vyklad',
    'Z-MERKING': 'vyklad',
    'VISUN': 'odkaz',
}


def get_json(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        raw = r.read()
    return json.loads(raw.decode('utf-8', errors='replace'))


def lookup(word):
    q = urllib.parse.quote(word, safe='')
    search = get_json('%s?search=%s&simple=false' % (DICT_API, q))
    results = search.get('results') or []
    if not results:
        print('  (zadne heslo "%s" v Islensk nutimamalsordabok)' % word)
        return
    for res in results:
        flid = res.get('flid')
        fletta = res.get('fletta', word)
        ofl = res.get('ofl', '?')
        print('\n=== %s  [%s]  (flid %s) ===' % (fletta, ofl, flid))
        detail = get_json('%s%s/' % (DICT_API, flid))
        items = detail.get('items') or []
        # poradi vypisu: rekce a vazby napred, priklady nakonec
        order = ['FALLSTJ', 'FALLSTJ-FS', 'FRUMLAG', 'SOHAUS',
                 'SOSTÆÐA', 'OSTÆÐA', 'OSTÆÐA-AUK', 'ISL-TEXTI', 'Z-MERKING', 'DÆMI']
        seen_any = False
        for teg in order:
            rows = [it for it in items if it.get('teg') == teg]
            for it in rows:
                txt = (it.get('texti') or '').strip()
                if not txt:
                    continue
                label = TEG_LABEL.get(teg, teg)
                print('  [%-22s] %s' % (label, txt))
                seen_any = True
        if not seen_any:
            print('  (heslo bez strukturovane vazby — jen tvary/odkazy)')


def ngram(phrases):
    terms = ','.join(urllib.parse.quote(p, safe='') for p in phrases)
    url = ('%s?terms=%s&case_sens=0&freq=abs&corpus=allt&word_form=ordmynd'
           % (NGRAM_API, terms))
    data = get_json(url)
    print('\n=== KORPUS n-gram (Risamalheild, soucet 2000-2021) ===')
    # odpoved je dict {termstr: [{x:rok,y:pocet}, ...]} nebo {"term":[...]}
    if isinstance(data, dict):
        # zkus namapovat kazdou zadanou frazi na serii; jinak sum vseho
        keys = list(data.keys())
        for i, p in enumerate(phrases):
            series = None
            if p in data:
                series = data[p]
            elif i < len(keys) and isinstance(data[keys[i]], list):
                series = data[keys[i]]
            total = 0
            if isinstance(series, list):
                total = sum((row.get('y') or 0) for row in series if isinstance(row, dict))
            verdict = '  <-- NEDOLOZENO (0)' if total == 0 else ''
            print('  "%s": %d%s' % (p, total, verdict))
    else:
        print('  (neocekavany tvar odpovedi: %r)' % type(data))


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        return
    words = []
    freqs = []
    i = 0
    while i < len(args):
        if args[i] == '--freq':
            freqs = args[i + 1:]
            break
        words.append(args[i])
        i += 1
    for w in words:
        lookup(w)
    if freqs:
        ngram(freqs)


if __name__ == '__main__':
    main()
