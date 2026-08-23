# -*- coding: utf-8 -*-
# NO-RECUR — opravená fráze se nesmí vracet (BACKLOG „Sittu með": F-001 ✗ · F-005 ✓ · F-006 ✗).
# §19.3: kontrola běží na PLOŠE, kde bug žije — MODELOVÝ VÝSTUP (uložená čtení v DB
# + commitnuté eval dávky), ne zdrojový kód (ten hlídá check-is).
#
# Fráze bere ze dvou vlastníků (žádná vlastní kopie, §20):
#   1. check-is.py BAD_PATTERNS (parsují se za běhu z jeho zdroje)
#   2. bug_reports: status='fixed' AND flagged_source='selection' (= označeno ve čtení)
#      — kontroluje se jen výskyt PO resolved_at (návrat po opravě, ne historie před ní)
#
# Kdy pouštět: na požádání + před vydáním (síť → NENÍ ve smoke). Součást testovacího
# postupu (viz hlavička scripts/profsteinn.js).
#   python -X utf8 scripts/verify_no_recur.py
import glob, io, json, os, re, subprocess, sys

ROOT = r'C:\Users\zkuku\Downloads\Runar-admin'

# ── 1. BAD_PATTERNS z check-is.py (vlastník zůstává tam) ─────────────────────
src = io.open(os.path.join(ROOT, 'check-is.py'), encoding='utf-8').read()
blok = src[src.index('BAD_PATTERNS = ['):]
blok = blok[:blok.index(']\n') + 1]
bad = [m.group(1) for m in re.finditer(r"\(\s*r?'((?:[^'\\]|\\.)+)'\s*,", blok)]
bad = [b for b in bad if len(b) >= 4]

def dotaz(sql):
    r = subprocess.run(['supabase', 'db', 'query', '--linked', sql],
                       capture_output=True, text=True, encoding='utf-8')
    t = r.stdout + r.stderr
    try:
        z = t[t.index('{'):t.rindex('}') + 1]
        return json.loads(z)['rows']
    except Exception:
        print('  DB dotaz selhal: ' + t[:200]); sys.exit(2)

# ── 2. opravené fráze z reportů ──────────────────────────────────────────────
opravene = dotaz("select flagged_text, resolved_at from bug_reports "
                 "where status = 'fixed' and flagged_source = 'selection' "
                 "and flagged_text is not null and length(flagged_text) >= 8")

# ── 3. plochy: čtení v DB + commitnuté dávky ────────────────────────────────
cteni = dotaz("select drawn_at, coalesce(deep_text, short_text, '') as t from readings "
              "where coalesce(deep_text, short_text, '') <> '' order by drawn_at")
davky = []
for p in glob.glob(os.path.join(ROOT, 'docs', 'eval', '**', '*.jsonl'), recursive=True):
    for line in io.open(p, encoding='utf-8', errors='replace'):
        try:
            z = json.loads(line)
        except Exception:
            continue
        t = z.get('reading_text') or z.get('text') or ''
        if t:
            davky.append((os.path.relpath(p, ROOT), t))

fail = 0

def norm(s):
    return re.sub(r'\s+', ' ', s).strip().lower()

# BAD_PATTERNS: regexy — jakýkoli výskyt v modelovém výstupu je červený
import datetime
prah = (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=30)).isoformat()
for vzor in bad:
    try:
        rx = re.compile(vzor, re.IGNORECASE)
    except re.error:
        continue
    cerstve = [r for r in cteni if rx.search(r['t']) and str(r['drawn_at']) > prah]
    stare   = sum(1 for r in cteni if rx.search(r['t']) and str(r['drawn_at']) <= prah)
    dv      = sorted({p for p, t in davky if rx.search(t)})
    if cerstve:
        fail += 1
        print('RECUR  BAD_PATTERN „%s"  · DB za 30 dni %d×' % (vzor[:50], len(cerstve)))
    if dv:
        print('ZLUTA  BAD_PATTERN „%s" v davkach: %s  (experiment vs produkce posud sam)' % (vzor[:40], ', '.join(dv[:3])))
    if stare and not cerstve:
        print('info   „%s": %d× jen ve starych ctenich (pred %s) — historie, ne navrat' % (vzor[:40], stare, prah[:10]))

# fixed reporty: jen výskyt PO resolved_at (DB) + dávky (všechny — jsou nové)
for r in opravene:
    fráze = norm(r['flagged_text'])
    if len(fráze) < 8 or '\n' in (r['flagged_text'] or ''):
        continue
    po = [x for x in cteni if str(x['drawn_at']) > str(r['resolved_at'] or '') and fráze in norm(x['t'])]
    dv = [p for p, t in davky if fráze in norm(t)]
    if po or dv:
        fail += 1
        print('RECUR  „%s…"  · DB po opravě %d× · dávky %d×' % (r['flagged_text'][:45], len(po), len(dv)))

print()
print('OK    no-recur: %d BAD_PATTERNS + %d opravených frází · %d čtení v DB · %d řádků dávek — žádný návrat'
      % (len(bad), len(opravene), len(cteni), len(davky))
      if fail == 0 else 'CELKEM %d frází se VRACÍ — oprava nebo nový záznam (§22)' % fail)
sys.exit(0 if fail == 0 else 1)
