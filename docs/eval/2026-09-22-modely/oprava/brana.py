# -*- coding: utf-8 -*-
# CODE-read 2026-09-26 — KORPUSOVA BRANA pro islandsky korektor (plan ownera, scheduled task runar-korektor-korpusova-brana).
# Zmenu korektoru PROPUSTI jen kdyz novy tvar je v korpusu doložený (>0) a stary ne (=0). Jinak ZASTAV.
# Korpus vidi jen 1-3slovne fraze; jadro zmeny delsi nez 3 slova = NELZE POSOUDIT (pocita se jako zastaveno, hlasi se zvlast).
# Ownerova data lezi jen tady (C:/Users/zkuku/runar-eval/korektor), skript sam zadny text ownera nenese.
import sys, io, json, re, urllib.request, urllib.parse
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
K = 'C:/Users/zkuku/runar-eval/korektor/'
NGRAM_API = 'https://n.arnastofnun.is/ngram/query'
UA = {'User-Agent': 'Mozilla/5.0 (runar korektor brana)'}
_cache = {}

def _chunk(phrases):
    terms = ','.join(urllib.parse.quote(p, safe='') for p in phrases)
    url = '%s?terms=%s&case_sens=0&freq=abs&corpus=allt&word_form=ordmynd' % (NGRAM_API, terms)
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        data = json.loads(r.read().decode('utf-8', errors='replace'))
    out = {}
    for p in phrases:                       # parovat JMENEM (API vraci jine poradi)
        s = data.get(p) if isinstance(data, dict) else None
        if isinstance(s, list):
            out[p] = sum((row.get('y') or 0) for row in s if isinstance(row, dict))
    return out

def freq(phrases):
    need = [p for p in dict.fromkeys(phrases) if p not in _cache]
    for i in range(0, len(need), 10):       # API bere max 10 termu, zbytek tise zahodi
        got = _chunk(need[i:i + 10])
        for p in need[i:i + 10]:
            _cache[p] = got.get(p)          # None = neodpovezeno, NIKDY 0
    return {p: _cache[p] for p in phrases}

TOK = re.compile(r"[\wÞþÆæÖöÐðÁáÉéÍíÓóÚúÝý'-]+")
def toks(s): return [t.lower() for t in TOK.findall(s)]

def okna(sent, frm, to):
    """Jadro zmeny + kontext z vety; vrati seznam (stare, nove) oken o 2-3 slovech, primarni prvni."""
    S, F, T = toks(sent), toks(frm), toks(to)
    pos = next((i for i in range(len(S) - len(F) + 1) if S[i:i + len(F)] == F), None)
    if pos is None: return None, 'zmena ve vete nenalezena'
    p = 0
    while p < min(len(F), len(T)) and F[p] == T[p]: p += 1
    s = 0
    while s < min(len(F), len(T)) - p and F[len(F) - 1 - s] == T[len(T) - 1 - s]: s += 1
    cF, cT = F[p:len(F) - s], T[p:len(T) - s]
    if max(len(cF), len(cT)) > 3: return None, 'jadro %d slov' % max(len(cF), len(cT))
    L = S[:pos + p]; R = S[pos + len(F) - s:]
    out = []
    for kl in (2, 1, 0):                    # preferuj levy kontext (predlozka / sloveso ridi pad)
        for kr in (0, 1, 2):
            a = (L[len(L) - kl:] if kl else []) + cF + R[:kr]
            b = (L[len(L) - kl:] if kl else []) + cT + R[:kr]
            if kl > len(L) or kr > len(R): continue
            if 2 <= max(len(a), len(b)) <= 3 and min(len(a), len(b)) >= 1:
                pr = (' '.join(a), ' '.join(b))
                if pr not in out: out.append(pr)
    return out, ''

def rozhodni(a, b, f):
    fa, fb = f.get(a), f.get(b)
    if fa is None or fb is None: return 'NEODPOVEZENO'
    return 'PROPUSTIT' if (fb > 0 and fa == 0) else 'ZASTAVIT'

if __name__ == '__main__':
    # samotest na zname skode z testu
    f = freq(['í rakri jörðinni', 'í röku jörðinni'])
    st = rozhodni('í rakri jörðinni', 'í röku jörðinni', f)
    print('SAMOTEST „í rakri jörðinni“ → „í röku jörðinni“:', f, st)
    assert st == 'ZASTAVIT', 'samotest selhal'
    rows = [json.loads(l) for l in open(K + 'oprava-moje.jsonl', encoding='utf-8') if l.strip()]
    ver = {v['id']: v for b in json.load(open(K + 'overeni-zmen.json', encoding='utf-8'))['overeni'] for v in b['verdicts']}
    zmeny = []
    for r in rows:
        if r.get('error'): continue
        for c in r.get('zmeny', []): zmeny.append((r, c))
    prip = []
    for i, (r, c) in enumerate(zmeny, 1):
        zid = 'Z%d' % i
        vety = re.split(r'(?<=[.?!])\s+', r['text'])
        sent = next((v for v in vety if c['from'].lower() in v.lower()), r['text'])
        o, why = okna(sent, c['from'], c['to'])
        prip.append((zid, c, o, why))
    allp = [x for _, _, o, _ in prip if o for pr in o for x in pr]
    f = freq(allp)
    res = []
    for zid, c, o, why in prip:
        v = ver.get(zid, {}).get('verdict', '?')
        if not o:
            res.append((zid, v, 'NELZE POSOUDIT', c, why, [])); continue
        det = [(a, b, f.get(a), f.get(b), rozhodni(a, b, f)) for a, b in o]
        res.append((zid, v, det[0][4], c, '', det))
    json.dump([{'id': z, 'verdict': v, 'brana': d, 'from': c['from'], 'to': c['to'], 'pozn': w,
                'okna': [{'stare': a, 'nove': b, 'f_stare': fa, 'f_nove': fb, 'rozhodnuti': rr} for a, b, fa, fb, rr in det]}
               for z, v, d, c, w, det in res], open(K + 'brana-vysledek.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    for z, v, d, c, w, det in res:
        print('\n%s [%s] %s  „%s“ → „%s“ %s' % (z, v, d, c['from'], c['to'], w))
        for k, (a, b, fa, fb, rr) in enumerate(det):
            print('   %s „%s“ %s × „%s“ %s → %s' % ('*' if k == 0 else ' ', a, fa, b, fb, rr))
    print('\nSOUHRN (primarni okno):')
    for v in ['oprava', 'skoda', 'zbytecne', 'nejiste']:
        xs = [x for x in res if x[1] == v]
        print('  %-9s n=%d  propusteno %d · zastaveno %d · nelze posoudit %d · neodpovezeno %d' % (v, len(xs),
              sum(x[2] == 'PROPUSTIT' for x in xs), sum(x[2] == 'ZASTAVIT' for x in xs),
              sum(x[2] == 'NELZE POSOUDIT' for x in xs), sum(x[2] == 'NEODPOVEZENO' for x in xs)))
    print('\nUTOK §27 (rozhodnuti se lisi podle okna):')
    for z, v, d, c, w, det in res:
        rs = set(x[4] for x in det)
        if len(rs) > 1: print('  %s [%s]: %s' % (z, v, ' | '.join('„%s“→„%s“ %s' % (a, b, rr) for a, b, fa, fb, rr in det)))
