# -*- coding: utf-8 -*-
# OBLOUK — designová kontrola (KUKY 2026-08-23: oblouk se MĚŘÍ, do promptu se neinstruuje;
# rozhodnutí + baseline → RUNAR_DECISIONS.md / RUNAR_EVAL_LOG.md 2026-08-23).
# Otázka: vrací závěr dlouhého čtení PROMĚNĚNÝ otevírací obraz?
# Nástroj jen VYŘÍZNE dvojice otevření/závěr z reálných prod čtení (deep_text ⇒ spready
# a Yggdrasil; žádné API, žádný soudce v kódu — §19.3: kontrola běží na ploše, kde bug
# žije, tj. na modelovém výstupu z produkce). Verdikt dává session/owner pohledem, škála:
#   PLNÝ OBLOUK (návrat + proměna) · NÁVRAT BEZ PROMĚNY · BEZ NÁVRATU
# Použití: python -X utf8 scripts/oblouk.py [--days N]   (default 7)
import json, re, subprocess, sys

days = 7
if '--days' in sys.argv:
    days = int(sys.argv[sys.argv.index('--days') + 1])

SQL = ("select to_char(drawn_at,'YYYY-MM-DD HH24:MI') as t, rune_name, lang, deep_text as txt "
       "from readings where nullif(deep_text,'') is not null "
       "and drawn_at >= now() - interval '%d days' order by drawn_at" % days)

def spust():
    for exe in ('supabase', 'supabase.exe', 'supabase.cmd'):
        try:
            p = subprocess.run([exe, 'db', 'query', '--linked', SQL],
                               capture_output=True, text=True, encoding='utf-8', errors='replace')
            if p.stdout and '{' in p.stdout:
                return p.stdout
        except FileNotFoundError:
            continue
    print('supabase CLI se nepodarilo spustit'); sys.exit(1)

out = spust()
data = json.loads(out[out.find('{'):])
rows = data.get('rows', [])
if not rows:
    print('zadna dlouha cteni za poslednich %d dni' % days); sys.exit(0)

def vety(t):
    return [v.strip() for v in re.split(r'(?<=[.!?…])\s+', t.strip()) if v.strip()]

for r in rows:
    v = vety(r['txt'] or '')
    print('━━ %s · %s (%s) · %d vet' % (r['t'], r['rune_name'], r.get('lang', '?'), len(v)))
    print('OTEVRENI: ' + ' '.join(v[:2]))
    print('ZAVER:    ' + ' '.join(v[-2:]))
    print()
print('%d cteni — verdikt: PLNY OBLOUK / NAVRAT BEZ PROMENY / BEZ NAVRATU' % len(rows))
