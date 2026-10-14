#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# PRE-PUSH BRÁNA — smoke musí projít, než se práce stane viditelnou pro ostatní.
#
# PROČ pre-push a ne pre-commit: smoke běží desítky sekund a commity děláme malé a časté
# (§7 „jeden commit = jedna věc"). Tolik času na každý commit by lidi naučilo hook
# obcházet přes --no-verify, což je horší než žádný hook. Push je ten správný
# okamžik: tam práce opouští tenhle stroj a začne ji číst druhá lane.
#
# PROČ vůbec: do 2026-07-19 se smoke spouštěl RUČNĚ. Osmnáct kontrol chránilo kód
# jen tehdy, když si někdo vzpomněl — tedy pravidlo, které musí hlídat člověk,
# přesně to, co CLAUDE.md zakazuje („spadne to na ownera"). A už to selhalo:
# RUNAR_TREE_RENDER.md ležel 9 dní mimo git, ačkoli kontrola ⑫ na to existuje.
#
# 2026-10-10 (CODE-read, owner „3. ano, udělej to“, BACKLOG část 37): smoke běží v DOČASNÉ ČISTÉ KOPII pushovaného commitu
# (`git worktree add --detach`), ne nad sdíleným pracovním stromem. Do té doby rozdělaná práce kterékoli session blokovala push
# všem (dnes 3×: ㉸, ㉣, ㉳ — pokaždé chyba v kódu, který se vůbec nepushoval) a naopak push mohl projít jen díky necommitnuté
# opravě, která v pushi nebyla. Sdílený strom zůstává jeden (tohle NENÍ zamítnutý „worktree pro každou session“, DECISIONS
# 2026-07-19) — kopie žije jen po dobu hooku. Kontroly si kořen berou z RUNAR_ROOT. Dvě kontroly, které hledají soubory
# zapomenuté MIMO git (v čisté kopii z principu nejsou), běží navíc nad sdíleným stromem. Když kopie nejde vytvořit, hook
# pustí smoke postaru nad sdíleným stromem (a řekne to).
#
# Obejít se dá `git push --no-verify` — vědomě a viditelně, ne mlčky.
#
# 2026-10-14 (CODE-read, owner „pokračuj“ po incidentu 8c12069): přes HTTPS (GitHub) git předá pomocníkovi git-remote-https větev JMÉNEM
# a ten ji přeloží na commit až PO tomhle hooku. Vznikl-li commit během běhu smoke (sdílený strom, minuty), odejde na server neotestovaný
# — a lokální origin/main přitom tvrdí, že odešel ten otestovaný. Doloženo: 2026-10-13 pre-push CODE-read testoval 9681561 a server
# dostal 8c12069 (commit CODE-tune z 21:19, rozbitá ㊸) — reflog `origin/main` 9681561 „update by push“, o 96 s později fetch 8c12069;
# pokus přes git http-backend týž průběh zopakoval (bez HTTP, lokálním přenosem, ne — proto ho první pokus neukázal). Proto se na konci
# ověří, že každá pushovaná větev pořád ukazuje na commit, který prošel; když ne, push se zastaví. Zbývá okno mezi koncem hooku
# a odesláním (zlomek sekundy místo minut).
import os, shutil, subprocess, sys, tempfile

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PY = [sys.executable, '-X', 'utf8']
NAD_SDILENYM = ['verify_canonical_files.js', 'verify_memory_index.js']   # hledají neverzované soubory — mají smysl jen tady

def git(*a, **kw):
    return subprocess.run(['git', '-C', REPO] + list(a), capture_output=True, text=True, **kw)

# Co se pushuje: stdin nese „<local ref> <local sha> <remote ref> <remote sha>“; mazání větve má local sha samé nuly.
shas, zaklady, vetve = [], [], []
try:
    for line in sys.stdin.read().splitlines():
        p = line.split()
        if len(p) >= 2 and p[1].strip('0'):
            shas.append(p[1])
            vetve.append((p[0], p[1]))   # (lokální ref, testovaný commit) — na konci se ověří, že se nepohnul
            if len(p) >= 4 and p[3].strip('0'):
                zaklady.append(p[3])
except Exception:
    pass
cil = shas[-1] if shas else git('rev-parse', 'HEAD').stdout.strip()
# Základ = co už má server (remote sha ze stdin); u nové větve merge-base s origin/main. Kontroly „co přibylo“ (verify_new_duplicates,
# verify_fresh_dates) srovnávají proti němu — proti HEAD by při pushi viděly prázdný rozdíl (commitnutá práce = HEAD). 2026-10-10:
# tím prošel 3× zdvojený odstavec v BACKLOGu. Když základ nejde zjistit, proměnná se nenastaví a kontroly běží postaru.
zaklad = zaklady[-1] if zaklady else git('merge-base', cil, 'origin/main').stdout.strip()
if zaklad and git('cat-file', '-e', zaklad + '^{commit}').returncode != 0:
    zaklad = ''

def postaru(duvod):
    print('[pre-push] ' + duvod + ' — smoke nad sdíleným stromem (postaru).')
    r = subprocess.run(PY + [os.path.join(REPO, 'smoke.py')], cwd=REPO)
    if r.returncode != 0:
        print('\n[pre-push] ZABLOKOVÁNO — smoke neprošel. Oprav to, nebo `git push --no-verify`.')
        sys.exit(1)
    print('[pre-push] OK')
    sys.exit(0)

tmp = tempfile.mkdtemp(prefix='runar-prepush-')
w = git('worktree', 'add', '--detach', tmp, cil)
if w.returncode != 0:
    shutil.rmtree(tmp, ignore_errors=True)
    postaru('čistou kopii commitu se nepodařilo vytvořit (' + (w.stderr.strip().splitlines() or ['?'])[-1] + ')')
ok = True
try:
    print('[pre-push] smoke v čisté kopii commitu ' + cil[:7] + ' (cizí rozdělaná práce ve sdíleném stromě se nepočítá)…')
    env = dict(os.environ, RUNAR_ROOT=tmp.replace('\\', '/'))
    if zaklad:
        env['RUNAR_BASE'] = zaklad
        print('[pre-push] „co přibylo“ se měří proti ' + zaklad[:7] + ' (co už má server)')
    r = subprocess.run(PY + [os.path.join(tmp, 'smoke.py')], cwd=tmp, env=env)
    ok = r.returncode == 0
    print('[pre-push] soubory zapomenuté mimo git (sdílený strom)…')
    for s in NAD_SDILENYM:
        q = subprocess.run(['node', os.path.join(REPO, 'scripts', s)], cwd=REPO, capture_output=True, text=True, encoding='utf-8')
        posledni = [l for l in (q.stdout or '').splitlines() if l.strip()][-1:] or ['?']
        print('  ' + ('✅ ' if q.returncode == 0 else '❌ ') + posledni[0])
        if q.returncode != 0:
            ok = False
            print('\n'.join('     ' + l for l in (q.stdout or '').splitlines()[:-1]))
finally:
    git('worktree', 'remove', '--force', tmp)
    shutil.rmtree(tmp, ignore_errors=True)
    git('worktree', 'prune')

if not ok:
    print('\n[pre-push] ZABLOKOVÁNO — smoke neprošel. Oprav to, nebo `git push --no-verify`.')
    sys.exit(1)
posunute = []
for ref, sha in vetve:
    ted = git('rev-parse', '--verify', '-q', ref).stdout.strip()
    if ted and ted != sha:
        posunute.append(ref + ': otestován ' + sha[:7] + ', teď ' + ted[:7])
if posunute:
    print('\n[pre-push] ZABLOKOVÁNO — během kontroly přibyl commit, který smoke neviděl (' + '; '.join(posunute) + ').')
    print('  Přes HTTPS by na server odešel ten NOVÝ commit, neotestovaný. Pusť push znovu — otestuje se aktuální stav.')
    sys.exit(1)
print('[pre-push] OK')
