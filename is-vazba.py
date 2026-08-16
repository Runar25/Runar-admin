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


# ⚠️ API BERE NEJVYS 10 TERMU NA DOTAZ a vse nad to TISE ZAHODI (overeno 2026-08-16:
# posli 12 -> vrati 10, posli 15 -> vrati 10; zadna chyba, zadne varovani).
# Puvodni verze poslala vsechny fraze naraz a nezodpovezene tiskla jako "NEDOLOZENO (0)".
# To NENI chybejici doklad, to je FALESNY DUKAZ PROTI — malem kvuli nemu byla prepsana
# islandstina, ktera je v produkci spravne ("svignar undan" hlasilo 0, ve skutecnosti 94).
MAX_TERMS = 10


def _ngram_chunk(phrases):
    """Vrati {fraze: soucet} JEN pro fraze, na ktere API skutecne odpovedelo."""
    terms = ','.join(urllib.parse.quote(p, safe='') for p in phrases)
    url = ('%s?terms=%s&case_sens=0&freq=abs&corpus=allt&word_form=ordmynd'
           % (NGRAM_API, terms))
    data = get_json(url)
    if not isinstance(data, dict):
        return None
    out = {}
    for p in phrases:
        # ⚠️ PAROVAT VYHRADNE JMENEM. Odpoved chodi v JINEM PORADI, nez se posila
        # (overeno: poslano [A,B,C] -> vraceno [C,A,B]), takze puvodni pozicni fallback
        # `data[keys[i]]` umel frazi pripsat CIZI cislo. Nezodpovezena fraze musi zustat
        # nezodpovezena — nikdy 0, nikdy soucet nekoho jineho.
        series = data.get(p)
        if isinstance(series, list):
            out[p] = sum((row.get('y') or 0) for row in series if isinstance(row, dict))
    return out


def ngram(phrases):
    print('\n=== KORPUS n-gram (Risamalheild, soucet 2000-2021) ===')
    # ⚠️ `case_sens=0` v URL NEDELA, co slibuje: "Allan veturinn" = 37, "allan veturinn"
    # = 2524. Fraze psana s velkym pismenem (tj. tak, jak se prirozene pise na zacatku
    # vety) proto vypada jako slabe dolozena. Hlasi se to nahlas.
    velka = [p for p in phrases if p != p.lower()]
    if velka:
        print('  ⚠️ VELKE PISMENO menu vysledek (case_sens=0 nefunguje): ' +
              ', '.join('"%s"' % p for p in velka))
        print('     dotaz se posila i v malych pismenech; ber vyssi cislo.')
        phrases = phrases + [p.lower() for p in velka if p.lower() not in phrases]

    got, chyba = {}, False
    for i in range(0, len(phrases), MAX_TERMS):
        res = _ngram_chunk(phrases[i:i + MAX_TERMS])
        if res is None:
            chyba = True
        else:
            got.update(res)

    for p in phrases:
        if p not in got:
            # NIKDY netisknout 0 za neodpovezenou frazi — to je presne ta ticha chyba.
            print('  "%s": NEODPOVEZENO — API neposlalo serii, zopakuj SAMOSTATNE' % p)
            continue
        total = got[p]
        verdict = '  <-- NEDOLOZENO (0)' if total == 0 else ''
        print('  "%s": %d%s' % (p, total, verdict))
    if chyba:
        print('  ⚠️ nejmene jedna davka se nevratila jako dict — vysledek NENI uplny')


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
