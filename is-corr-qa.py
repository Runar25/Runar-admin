# is-corr-qa.py — Word-correction QC (dev). Validates runar_corrections against BÍN
# (Beygingarlýsing íslensks nútímamáls, via the `islenska` package) so a NON-NATIVE can
# sanity-check corrections WITHOUT Sigrún.
#
# Checks per correction (X -> Y):
#   1. Is the REPLACEMENT Y a real Icelandic form? (BÍN lookup — catches invented Y)
#   2. Is Y's grammatical class AMBIGUOUS? (e.g. 'biður' = noun 'biða' OR verb 'biðja')
#   3. Is X a SINGLE WORD? -> context-blind: a fixed substring can be wrong in other
#      case/tense/person. Prefer PHRASE-level corrections (they carry their own context).
#
# BÍN is local + OFFLINE (no data leaves the machine) and domain-aware: it decomposes our
# compounds (lífs-rún, Hermanns-andi) that GreynirCorrect mangles. Use THIS for correction
# validity; use is-grammar-qa.py (GreynirCorrect) for OUTPUT quality over full readings.
# NEVER auto-apply — this only flags; the human decides. Sigrún for the genuinely ambiguous.
#
# Usage: python -X utf8 is-corr-qa.py

import json, re, urllib.request
from islenska import Bin

SB  = ('https://pmitxjvkeovijreepror.supabase.co/rest/v1/runar_corrections'
       '?select=original_phrase,replacement_phrase,lang_scope&order=created_at')
KEY = 'sb_publishable_iS8zD-m5BC9N3BYJa3XnHQ_UTkIlNy2'
b = Bin()

def words(s):
    return re.findall(r"[A-Za-zÁÐÉÍÓÚÝÞÆÖáðéíóúýþæö]+", s or '')

def classes(w):
    _, forms = b.lookup(w)
    return sorted(set(m.ofl for m in forms)) if forms else None  # ofl = word class; None = not found

def main():
    rows = json.loads(urllib.request.urlopen(urllib.request.Request(SB, headers={'apikey': KEY})).read())
    checks = 0
    print('%-5s %-40s %-38s %s' % ('', 'from (X)', 'to (Y)', 'BÍN check'))
    print('-' * 118)
    for r in rows:
        f = (r.get('original_phrase') or '').strip()
        t = (r.get('replacement_phrase') or '').strip()
        if not f or f == 'test':
            continue
        fw, tw = words(f), words(t)
        flags = []
        if len(fw) == 1:
            flags.append('single-word (context-blind)')
        missing = [w for w in tw if classes(w) is None]
        if missing:
            flags.append('Y not in BÍN: ' + ', '.join(missing))
        if len(tw) == 1:
            c = classes(tw[0])
            if c and len(c) > 1:
                flags.append('Y ambiguous: ' + '/'.join(c))
        tag = 'ok' if not flags else 'CHECK'
        if flags:
            checks += 1
        print('%-5s %-40s %-38s %s' % (tag, f[:40], t[:38], ' · '.join(flags) or 'Y is a real Icelandic form'))
    print('-' * 118)
    print('%d corrections need a look. single-word/ambiguous = verify the fix is right in EVERY context.' % checks)
    print('Y-not-in-BÍN = possibly invented replacement. BÍN offline; Sigrún for the truly ambiguous.')

if __name__ == '__main__':
    main()
