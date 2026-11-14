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
#
# 2026-10-30 (CODE-read, owner „5. oprav. jde to udělat ještě lépe? tak udělej“): sdílený strom = sdílená větev main. Když jiná session
# pushne během mých minut smoke, nese na server i moje commity a server pak můj push odmítne „cannot lock ref … expected <starý>“ —
# vypadá to jako chyba, i když je všechno nahoře (2026-10-30 2×: CODE-read × CODE-tune, b714eb1 a 7c3aebc). Proto hook ptá server
# (`git fetch`) NA ZAČÁTKU i PO smoke: (a) server už pushovaný commit má → řekne „už na serveru, není co pushovat“ a zastaví push dřív,
# než přijde matoucí odmítnutí; (b) server se během smoke pohnul jinam → řekne to a ať se pushne znovu. A aby opakovaný push nečekal
# znovu minuty na tentýž commit: smoke, který prošel, se zapíše (commit + základ); stejný commit se proti základu, který jen postoupil
# dopředu (starý základ je předkem nového), už znovu netestuje — obsah je týž a „co přibylo“ je podmnožina toho, co už prošlo.
# Selže-li dotaz na server (offline), hook jede postaru — dotaz push nikdy nezastaví sám od sebe.
#
# 2026-11-14 (CODE-read, owner „tak ty problémy vyřešte! udělej to tak, aby k nim už nemohlo dojít“): (1) JEDEN smoke naráz. Dvě session
# pushly přes sebe (CODE-tree 12:37, CODE-read 12:35) a oba smoke spadly, ač commit byl v pořádku — u CODE-tree doloženě na
# `TimeoutExpired` v ㊱ (hooky Claude Code), týž commit fa55742 o 20 min později sám prošel za 3 min. Proto zámek ve společném .git:
# druhý push počká, a když mu mezitím první odnese commity na server nebo týž commit otestuje, skončí bez dalšího smoke. Zámek starší
# než 30 min nebo po mrtvém procesu se přebírá. (2) CELÝ výpis smoke jde do souboru a vady (řádky s ❌) se vypíšou znovu úplně na konci
# — kdo si výstup pushe zkrátí (`| tail`), přišel o to, CO spadlo (CODE-read toho dne: „2 problémy“, ale které, už nešlo zjistit).
import atexit, os, shutil, subprocess, sys, tempfile, time

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PY = [sys.executable, '-X', 'utf8']
NAD_SDILENYM = ['verify_canonical_files.js', 'verify_memory_index.js']   # hledají neverzované soubory — mají smysl jen tady

def git(*a, **kw):
    return subprocess.run(['git', '-C', REPO] + list(a), capture_output=True, text=True, **kw)

REMOTE = sys.argv[1] if len(sys.argv) > 1 and sys.argv[1] else 'origin'   # git předá hooku jméno vzdáleného repa

def server_ma(vetve_):
    """Zeptá se serveru a vrátí (vše_nahoře, posun, ff). Pro každou pushovanou větev vezme sha VZDÁLENÉHO refu (`ls-remote`), chybí-li
    lokálně, stáhne ho (`fetch`). vše_nahoře = každý pushovaný commit je předkem toho, co je na serveru. posun = větve, kde server ukazuje
    jinam, než git čeká (remote sha ze stdin). ff = server je u všech předkem pushovaného commitu (push stačí zopakovat).
    Server nedostupný → (False, [], True): hook pak jede postaru, dotaz push nezastaví."""
    nahore, posun, ff = True, [], True
    for lok, sha, cekano, vzd in vetve_:
        try:
            l = git('ls-remote', REMOTE, vzd, timeout=60)
        except Exception:
            return False, [], True
        if l.returncode != 0:
            return False, [], True
        server = (l.stdout.split() or [''])[0]
        if server and git('cat-file', '-e', server + '^{commit}').returncode != 0:
            try:
                git('fetch', '-q', REMOTE, timeout=60)
            except Exception:
                pass
        znam = bool(server) and git('cat-file', '-e', server + '^{commit}').returncode == 0
        if not server or not znam or git('merge-base', '--is-ancestor', sha, server).returncode != 0:
            nahore = False
        if server and cekano and server != cekano:
            posun.append(vzd.replace('refs/heads/', '') + ': čekán ' + cekano[:7] + ', na serveru ' + server[:7])
        if server and (not znam or git('merge-base', '--is-ancestor', server, sha).returncode != 0):
            ff = False
    return bool(vetve_) and nahore, posun, ff

def uz_nahore(kdy):
    print('\n[pre-push] ✅ ' + kdy + ' už server tvoje commity má — nesl je push jiné session (sdílená větev). Není co pushovat.')
    print('  Řádek „error: failed to push some refs“ pod tímhle je jen git, který hlásí zastavený push — nic se neztratilo.')
    sys.exit(1)

PROSLO = os.path.join(git('rev-parse', '--git-common-dir').stdout.strip() or os.path.join(REPO, '.git'), 'runar-prepush-proslo.txt')
if not os.path.isabs(PROSLO):
    PROSLO = os.path.join(REPO, PROSLO)

ZAMEK = os.path.join(os.path.dirname(PROSLO), 'runar-prepush-zamek.txt')
LOG = os.path.join(os.path.dirname(PROSLO), 'runar-prepush-posledni.log')
ZAMEK_STARY = 30 * 60   # s; smoke sám trvá minuty

def _zije(pid):
    try:
        q = subprocess.run(['tasklist', '/FI', 'PID eq %d' % pid, '/NH'], capture_output=True, text=True, timeout=20)
        return str(pid) in q.stdout
    except Exception:
        return True   # nejde zjistit (jiný systém) → rozhodne stáří zámku

def zamek_pust():
    try:
        if open(ZAMEK, encoding='utf-8').read().split()[0] == str(os.getpid()):
            os.remove(ZAMEK)
    except Exception:
        pass

def zamek_vezmi(popis):
    """Vezme zámek; vrátí True, když se na jinou session čekalo."""
    cekal = False
    while True:
        try:
            fd = os.open(ZAMEK, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
            os.write(fd, ('%d %s' % (os.getpid(), popis)).encode('utf-8'))
            os.close(fd)
            atexit.register(zamek_pust)
            return cekal
        except FileExistsError:
            try:
                stari = time.time() - os.path.getmtime(ZAMEK)
            except OSError:
                continue   # právě zmizel
            try:
                pid = int(open(ZAMEK, encoding='utf-8').read().split()[0])
            except Exception:
                pid = 0
            if stari > ZAMEK_STARY or (pid and not _zije(pid)) or (not pid and stari > 60):
                try:
                    os.remove(ZAMEK)
                except OSError:
                    pass
                continue
            if not cekal:
                print('[pre-push] smoke teď pouští jiná session (proces %d, %d s) — čekám, dva naráz se navzájem shazují…' % (pid, stari))
                sys.stdout.flush()
            cekal = True
            time.sleep(5)

def uz_proslo(cil_, zaklad_):
    try:
        p = open(PROSLO, encoding='utf-8').read().split()
    except Exception:
        return False
    return len(p) >= 1 and p[0] == cil_ and (len(p) < 2 or not p[1] or not zaklad_
                                             or git('merge-base', '--is-ancestor', p[1], zaklad_).returncode == 0)

def smoke_s_logem(cmd, cwd, env):
    """Pustí smoke, výstup tiskne i ukládá do LOG; vrátí (returncode, řádky s ❌)."""
    vady = []
    env = dict(env, PYTHONUNBUFFERED='1')
    with open(LOG, 'w', encoding='utf-8') as f:
        p = subprocess.Popen(cmd, cwd=cwd, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, encoding='utf-8', errors='replace')
        for l in p.stdout:
            sys.stdout.write(l)
            f.write(l)
            if '❌' in l:
                vady.append(l.strip())
        p.wait()
    sys.stdout.flush()
    return p.returncode, vady

# Co se pushuje: stdin nese „<local ref> <local sha> <remote ref> <remote sha>“; mazání větve má local sha samé nuly.
shas, zaklady, vetve = [], [], []
try:
    for line in sys.stdin.read().splitlines():
        p = line.split()
        if len(p) >= 2 and p[1].strip('0'):
            shas.append(p[1])
            vetve.append((p[0], p[1], p[3] if len(p) >= 4 and p[3].strip('0') else '', p[2] if len(p) >= 3 else p[0]))
            # (lokální ref, testovaný commit, co git čeká na serveru, vzdálený ref)
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

# Remote sha ve stdin = co git na serveru našel při startu pushe (ne zastaralá sledovací větev; lifecycle test 2026-10-30).
if not vetve:
    print('[pre-push] nic nového k odeslání (server ten commit už má, nebo jde jen o smazání větve) — smoke se nepouští.')
    sys.exit(0)
if vetve:
    _nahore, _posun, _ff = server_ma(vetve)
    if _nahore:
        uz_nahore('Ještě před kontrolou')
    if not _ff:
        print('\n[pre-push] ZASTAVENO ještě před kontrolou — na serveru je práce, kterou nemáš. `git pull`, pak push znovu.')
        sys.exit(1)
    if uz_proslo(cil, zaklad):
        print('[pre-push] commit ' + cil[:7] + ' už smoke prošel (základ jen postoupil dopředu) — znovu se netestuje.')
        print('[pre-push] OK')
        sys.exit(0)

def zapsat_proslo():
    try:
        with open(PROSLO, 'w', encoding='utf-8') as f:
            f.write(cil + ' ' + (zaklad or ''))
    except Exception:
        pass   # zápis paměti nesmí push zastavit

def postaru(duvod):
    print('[pre-push] ' + duvod + ' — smoke nad sdíleným stromem (postaru).')
    r = subprocess.run(PY + [os.path.join(REPO, 'smoke.py')], cwd=REPO)
    if r.returncode != 0:
        print('\n[pre-push] ZABLOKOVÁNO — smoke neprošel. Oprav to, nebo `git push --no-verify`.')
        sys.exit(1)
    zapsat_proslo()
    print('[pre-push] OK')
    sys.exit(0)

# Úklid (2026-10-14, CODE-read, owner „2. ano, smaž to“ u zapomenuté kopie): spadlý nebo zabitý push nechá svou kopii v %TEMP% a v
# `git worktree list` — našla se jedna tři dny stará (z 2026-10-11, kdy ㊺ visel 48 min). Kopie starší než 2 h se smažou; živý push trvá minuty.
try:
    import time
    for radek in git('worktree', 'list', '--porcelain').stdout.splitlines():
        if radek.startswith('worktree ') and 'runar-prepush-' in radek:
            cesta = radek[len('worktree '):].strip()
            if os.path.isdir(cesta) and time.time() - os.path.getmtime(cesta) > 2 * 3600:
                git('worktree', 'remove', '--force', cesta)
                shutil.rmtree(cesta, ignore_errors=True)
                print('[pre-push] uklizena osiřelá kopie ' + os.path.basename(cesta))
    git('worktree', 'prune')
except Exception:
    pass   # úklid nesmí push zastavit

if zamek_vezmi(cil[:7]) and vetve:
    _nahore, _posun, _ff = server_ma(vetve)
    if _nahore:
        uz_nahore('Během čekání na kontrolu jiné session')
    if uz_proslo(cil, zaklad):
        print('[pre-push] commit ' + cil[:7] + ' mezitím prošel smoke jiné session — znovu se netestuje.')
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
    _rc, VADY = smoke_s_logem(PY + [os.path.join(tmp, 'smoke.py')], tmp, env)
    ok = _rc == 0
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
    zamek_pust()

if not ok:
    print('\n[pre-push] CO SPADLO (celý výpis: ' + LOG.replace('\\', '/') + '):')
    for v in (globals().get('VADY') or ['(žádný řádek s ❌ — čti celý výpis)']):
        print('  ' + v)
    print('\n[pre-push] ZABLOKOVÁNO — smoke neprošel. Oprav to, nebo `git push --no-verify`.')
    sys.exit(1)
posunute = []
for ref, sha, _cekano, _vzd in vetve:
    ted = git('rev-parse', '--verify', '-q', ref).stdout.strip()
    if ted and ted != sha:
        posunute.append(ref + ': otestován ' + sha[:7] + ', teď ' + ted[:7])
if posunute:
    print('\n[pre-push] ZABLOKOVÁNO — během kontroly přibyl commit, který smoke neviděl (' + '; '.join(posunute) + ').')
    print('  Přes HTTPS by na server odešel ten NOVÝ commit, neotestovaný. Pusť push znovu — otestuje se aktuální stav.')
    sys.exit(1)
zapsat_proslo()
_nahore, _posun, _ff = server_ma(vetve)
if _nahore:
    uz_nahore('Během kontroly')
if _posun:
    print('\n[pre-push] ZASTAVENO — během kontroly pushla jiná session (' + '; '.join(_posun) + ').')
    if _ff:
        print('  Server by push odmítl („cannot lock ref“). Pusť push znovu — server je předek tvého commitu a ten už prošel, smoke se přeskočí.')
    else:
        print('  Server by push odmítl. Na serveru je práce, kterou nemáš: `git pull`, pak push znovu (nový commit projde smoke znovu).')
    sys.exit(1)
print('[pre-push] OK')
