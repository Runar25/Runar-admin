# is-grammar-qa.py — IS OUTPUT quality checker (dev / QA).
# Runs GENERATED Icelandic readings through GreynirCorrect (Miðeind) via the public
# Yfirlestur API and FLAGS suspected issues — spelling, unknown words (possible
# neologisms), grammar. FLAG-ONLY: it never rewrites. Sigrún (native) decides.
#
# This is the OUTPUT-side companion to check-is.py (which lints SOURCE strings only).
# The two cover different surfaces: check-is = bad IS hardcoded in source;
# is-grammar-qa = bad IS the MODEL generates. Use after bigger IS/prompt changes to
# tune the prompt + fill runar_corrections. Sigrún decides the borderline cases.
#
# Usage:
#   python -X utf8 is-grammar-qa.py <file>          # one reading per line
#   python -X utf8 is-grammar-qa.py --text "..."    # a single text
#   echo "..." | python -X utf8 is-grammar-qa.py    # stdin
#
# PRIVACY: sends text to yfirlestur.is (Miðeind). Fine for DEV over our own generated
# readings (not user PII). A RUNTIME/user-data pass would self-host GreynirCorrect
# (offline) — deferred. Licenses: GreynirCorrect = MIT, BÍN = CC BY-SA 4.0, both OK
# for commercial use. WARNING (2025 research): generative/grammar correctors OVER-correct
# poetic text — NEVER auto-apply these to a reading; flag only, human judges.

import sys, json, time, urllib.request, urllib.parse
from collections import Counter

API = 'https://yfirlestur.is/correct.api'
UA  = 'Mozilla/5.0 (RunarIS-QA dev tool)'

# E001 = "could not parse sentence" — fires on poetic / complex prose a lot, low signal.
# U001 = unknown word => the strongest neologism/typo signal for us. S00x = spelling.
LOW_SIGNAL = {'E001'}

def check(text):
    data = urllib.parse.urlencode({'text': text}).encode('utf-8')
    req = urllib.request.Request(API, data=data, headers={
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'User-Agent': UA})
    d = json.load(urllib.request.urlopen(req, timeout=60))
    out = []
    for para in d.get('result', []):
        for sent in para:
            for a in sent.get('annotations', []):
                out.append({'code': a.get('code'), 'text': a.get('text'), 'suggest': a.get('suggest')})
    return out

def read_inputs():
    args = sys.argv[1:]
    if args and args[0] == '--text':
        return [' '.join(args[1:])]
    if args:
        with open(args[0], 'r', encoding='utf-8') as f:
            return [ln.strip() for ln in f if ln.strip()]
    return [ln.strip() for ln in sys.stdin if ln.strip()]

def main():
    texts = read_inputs()
    if not texts:
        print('No input. Usage: python -X utf8 is-grammar-qa.py <file | --text "...">')
        return
    codes = Counter(); flagged = 0
    for i, t in enumerate(texts, 1):
        try:
            anns = check(t)
        except Exception as e:
            print('  [%d] API error: %s' % (i, e)); continue
        real = [a for a in anns if a['code'] not in LOW_SIGNAL]
        if real:
            flagged += 1
            head = (t[:72] + '…') if len(t) > 72 else t
            print('\n[%d] %s' % (i, head))
            for a in real:
                codes[a['code']] += 1
                sug = (' -> ' + a['suggest']) if a.get('suggest') else ''
                print('    %-6s %s%s' % (a['code'], a['text'], sug))
        time.sleep(0.4)  # be polite to the public API
    print('\n' + '=' * 52)
    print('%d texts, %d with flags. By code: %s' % (len(texts), flagged, dict(codes) or '{}'))
    print('U001 = unknown word (possible neologism) · S00x = spelling · rest = grammar.')
    print('FLAG-ONLY — Sigrún decides. Real fixes -> runar_corrections (shrine) or the prompt.')

if __name__ == '__main__':
    main()
