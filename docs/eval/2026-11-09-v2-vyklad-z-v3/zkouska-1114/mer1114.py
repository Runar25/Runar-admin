# Lab 2026-11-14: měření čtení ze zkoušek. Na čtení: slov, vět, kolik obsahových slov obrazu se vrátilo (kmen 5 znaků),
# nejdelší doslovný úsek obrazu (slov), které věty nesou scénu (>= 2 kmeny obrazu), ve které větě je jméno runy.
# Kontrola nástroje: pokrytí CIZÍM obrazem (jiná runa téže sady) musí vyjít výrazně níž.
import json, re, sys, os
H = os.path.dirname(os.path.abspath(__file__))
STOP = set('the a an and or but of in on at to from with by for as is are was were be been it its this that you your they them there here not no than then so if when while where what which who into out over under up down still only just more most very can may might will would could has have had do does did one two each every all any some own same og á í að er sem þú þér þig þitt þín þinn það því en eða ekki við um af til frá yfir undir með hún hann'.split())
def slova(t): return re.findall(r"[^\W\d_]+", t.lower())
def kmeny(t): return [w[:5] for w in slova(t) if w not in STOP and len(w) > 2]
def vety(t): return [v.strip() for v in re.split(r'(?<=[.?!])\s+', t) if v.strip()]
def usek(a, b):
    a, b = slova(a), slova(b); best = 0
    for i in range(len(a)):
        for j in range(len(b)):
            k = 0
            while i + k < len(a) and j + k < len(b) and a[i + k] == b[j + k]: k += 1
            best = max(best, k)
    return best
for f in sys.argv[1:]:
    R = json.load(open(os.path.join(H, f), encoding='utf-8'))
    sk = {}
    for r in R:
        var = r['id'].split('-', 1)[1]; sk.setdefault(var, []).append(r)
    print('==', f)
    for var, S in sk.items():
        radky = []
        for r in S:
            io = set(kmeny(r['obraz'])); V = vety(r['text'])
            pokr = len(io & set(kmeny(r['text']))) / len(io)
            cizi = [x for x in S if x['runa'] != r['runa']]
            pc = sum(len(set(kmeny(x['obraz'])) & set(kmeny(r['text']))) / len(set(kmeny(x['obraz']))) for x in cizi) / len(cizi)
            scen = [i + 1 for i, v in enumerate(V) if len(set(kmeny(v)) & io) >= 2]
            rv = next((i + 1 for i, v in enumerate(V) if r['runa'].lower() in v.lower()), None)
            radky.append((r['runa'], len(r['text'].split()), len(V), round(pokr, 2), round(pc, 2), usek(r['obraz'], r['text']), scen, rv))
        n = len(radky)
        print(' %-9s slov Ø %.0f | pokrytí obrazu Ø %.2f (cizí obraz %.2f) | nejdelší doslovný úsek Ø %.1f | vět se scénou Ø %.1f' % (
            var, sum(x[1] for x in radky) / n, sum(x[3] for x in radky) / n, sum(x[4] for x in radky) / n, sum(x[5] for x in radky) / n, sum(len(x[6]) for x in radky) / n))
        for x in radky: print('    %-7s slov %d, vět %d, pokrytí %.2f, úsek %d, scéna ve větách %s, runa ve větě %s' % (x[0], x[1], x[2], x[3], x[5], x[6], x[7]))
