# -*- coding: utf-8 -*-
# SIROTČÍ ZÁMEK — vynucení úklidu (KUKY 2026-08-23: „jak to, že se nevynucuje odemčení
# zámku… nemůže nás takhle pořád blokovat").
#
# Fakta, se kterými se tu pracuje:
#  · `.git/index.lock` vytváří git sám, je PRÁZDNÝ a autora nenese — kdo ho vytvořil,
#    se zpětně zjistit NEDÁ (git to nezapisuje). Vynutit jde dvě věci: automatický úklid
#    sirotka s auditním záznamem, a to, že session, které git spadl, se pozná sama —
#    její příští commit selže a MUSÍ se ohlásit (CLAUDE.md, sekce N paralelních session).
#  · ŽIVÝ zámek (běží git proces, nebo je mladší než práh) se NIKDY nemaže — to je
#    normální provoz souběžných session.
#
# Použití (když commit narazí na zámek):
#   python -X utf8 scripts/git_zamek.py <lane>        # lane = kdo uklízí (tune/read/tree)
# Audit: .git/runar-zamky.log — kdy · stáří · kdo uklidil · git procesy · poslední reflog
# (poslední dokončená operace = vodítko, kdo byl aktivní). Čte ho smoke ㉞.
import io, os, subprocess, sys, time

ROOT = r'C:\Users\zkuku\Downloads\Runar-admin'
ZAMEK = os.path.join(ROOT, '.git', 'index.lock')
LOG = os.path.join(ROOT, '.git', 'runar-zamky.log')
PRAH_S = 10 * 60   # 10 minut — dosavadní sirotci meli 60-80+ minut

lane = sys.argv[1] if len(sys.argv) > 1 else 'nezname'

if not os.path.exists(ZAMEK):
    print('zamek neexistuje — nic k uklizeni')
    sys.exit(0)

stari = time.time() - os.path.getmtime(ZAMEK)
try:
    r = subprocess.run(['tasklist', '/FI', 'IMAGENAME eq git.exe'],
                       capture_output=True, text=True)
    git_procesu = r.stdout.count('git.exe')
except Exception:
    git_procesu = -1   # nevime -> chovej se, jako by bezel (nemazat)

if stari < PRAH_S or git_procesu != 0:
    print('ZIVY zamek (stari %d s, git procesu: %s) — NEMAZAT, cekej nebo to ohlas'
          % (int(stari), git_procesu if git_procesu >= 0 else '?'))
    sys.exit(1)

try:
    reflog = subprocess.run(['git', 'reflog', '-1', '--date=iso'],
                            cwd=ROOT, capture_output=True, text=True,
                            encoding='utf-8').stdout.strip()[:120]
except Exception:
    reflog = '?'
os.remove(ZAMEK)
radek = '%s | sirotek %d min | uklidil %s | git procesu 0 | posledni op: %s\n' % (
    time.strftime('%Y-%m-%d %H:%M:%S'), int(stari // 60), lane, reflog)
with io.open(LOG, 'a', encoding='utf-8') as f:
    f.write(radek)
print('SIROTEK smazan (stari %d min) — audit v .git/runar-zamky.log' % int(stari // 60))
