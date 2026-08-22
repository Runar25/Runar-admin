# -*- coding: utf-8 -*-
# NÁKLADY ČTENÍ — report z produkčních dat (owner 2026-08-23: „chtěl jsem je znát,
# kvůli počítání ceny, kdy je peak"). Zdroj: readings.usage (od 2026-08-15 ukládá
# claude-proxy tokeny + model ke každému čtení) přes `supabase db query --linked`.
# ⚠️ Hlas (ElevenLabs) v těchhle číslech NENÍ — je to ~95 % ceny čtení s hlasem
# a žije v EL dashboardu. Tady je jen Claude (text).
# Sazby = claude-opus-4-8 (proxy MODELS): input $5/M · output $25/M · cache read
# $0.50/M · cache write (5m) $6.25/M. Změna modelu v proxy => uprav SAZBY tady.
#   python -X utf8 scripts/utils/naklady.py
import json, subprocess, sys

SAZBY = {'vstup': 5.0, 'vystup': 25.0, 'cache_cteni': 0.50, 'cache_zapis': 6.25}  # $/M tok.

def dotaz(sql):
    r = subprocess.run(['supabase', 'db', 'query', '--linked', sql],
                       capture_output=True, text=True, encoding='utf-8')
    t = r.stdout + r.stderr
    z = t[t.index('{'):t.rindex('}') + 1]
    return json.loads(z)['rows']

celek = dotaz("""
select count(*) as n,
  sum((usage->>'input_tokens')::int) as vstup,
  sum((usage->>'output_tokens')::int) as vystup,
  sum(coalesce((usage->>'cache_read_input_tokens')::int,0)) as cache_cteni,
  sum(coalesce((usage->>'cache_creation_input_tokens')::int,0)) as cache_zapis
from readings where usage is not null""")[0]

cena = sum(SAZBY[k] * (celek[k] or 0) / 1e6 for k in SAZBY)
print('ČTENÍ S USAGE (od 15. 8.): %d   ·   Claude cena celkem: $%.3f   ·   na čtení: $%.4f'
      % (celek['n'], cena, cena / max(1, celek['n'])))
print('  tokeny: vstup %s · výstup %s · cache čtení %s · cache zápis %s'
      % (celek['vstup'], celek['vystup'], celek['cache_cteni'], celek['cache_zapis']))

print('\nPO DNECH (posledních 10):')
for r in dotaz("""
select to_char(drawn_at,'YYYY-MM-DD') as den, count(*) as n,
  sum(coalesce((usage->>'output_tokens')::int,0)) as vystup
from readings group by 1 order by den desc limit 10"""):
    print('  %s  %3d čtení   výstup %s tok.' % (r['den'], r['n'], r['vystup']))

print('\nŠPIČKY (hodina UTC = islandský čas, celá historie):')
for r in dotaz("""
select to_char(drawn_at,'HH24') as h, count(*) as n
from readings group by 1 order by n desc limit 5"""):
    print('  %s:00  %3d čtení' % (r['h'], r['n']))
print('\n(pozn.: zatím převážně testovací provoz — špičky jsou z velké části vlastní ladění)')
