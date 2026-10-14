# -*- coding: utf-8 -*-
# Nasazené edge funkce proti repu: stáhne kód každé funkce ze Supabase (do dočasné složky, repo se nemění) a porovná ho s HEAD.
#
# Proč (2026-10-14, CODE-read, owner „pokračuj“ v kontrole): po každém nasazení si to session ověřovaly ručně („stažená v81 = repo“,
# DECISIONS 2026-10-11 (32), (52)…), ale celé to nikdo neprošel — funkce nasazená z rozdělaného stromu, nebo commit, který nikdo nenasadil,
# žije v produkci jinak, než říká repo, a nic to neukáže. Tohle je ta jedna cesta ke všem.
# Hlásí: ROZDÍL (soubor v produkci ≠ HEAD — nasazeno z necommitnuté práce, nebo commit nenasazený) · JEN V PRODUKCI · JEN V REPU (funkce
# v repu, která nasazená není). Konce řádků se nepočítají. Síť → do smoke nepatří; pouštět po nasazení nebo při kontrole.
#   python -X utf8 scripts/utils/nasazene_vs_repo.py [funkce …]
import json, os, subprocess, sys, tempfile, shutil

R = (os.environ.get('RUNAR_ROOT') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')).replace('\\', '/')
REF = 'pmitxjvkeovijreepror'


def head(rel):
    r = subprocess.run(['git', '-C', R, 'show', 'HEAD:' + rel], capture_output=True)
    return r.stdout.replace(b'\r\n', b'\n') if r.returncode == 0 else None


def main():
    out = subprocess.run('supabase functions list --project-ref ' + REF + ' -o json', shell=True, capture_output=True, text=True, encoding='utf-8')
    try:
        nasazene = {f['slug']: f for f in json.loads(out.stdout[out.stdout.index('['):] if '[' in out.stdout else '[]')}
    except Exception:
        try:
            nasazene = {f['slug']: f for f in json.loads(out.stdout).get('functions', [])}
        except Exception:
            print('FAIL  seznam funkcí ze Supabase nejde přečíst: ' + (out.stderr or out.stdout)[-200:]); return 2
    v_repu = sorted(d for d in os.listdir(R + '/supabase/functions') if not d.startswith('_') and os.path.isdir(R + '/supabase/functions/' + d))
    chtene = sys.argv[1:] or sorted(set(nasazene) | set(v_repu))
    tmp = tempfile.mkdtemp(prefix='nasazene-')
    nalezy, ok = [], []
    try:
        for fn in chtene:
            if fn not in nasazene:
                nalezy.append('JEN V REPU   ' + fn + ' — v repu je, nasazená není'); continue
            if fn not in v_repu:
                nalezy.append('JEN V PRODUKCI ' + fn + ' — nasazená, v repu chybí'); continue
            d = os.path.join(tmp, fn)
            os.makedirs(d, exist_ok=True)   # CLI chce existující --workdir (jinak NotFound: FileSystem.realPath)
            r = subprocess.run('supabase functions download ' + fn + ' --project-ref ' + REF + ' --workdir "' + d + '"', shell=True,
                               capture_output=True, text=True, encoding='utf-8')
            koren = os.path.join(d, 'supabase', 'functions')
            if r.returncode != 0 or not os.path.isdir(koren):
                nalezy.append('NESTAŽENO   ' + fn + ' — ' + (r.stderr or r.stdout).strip()[-150:]); continue
            rozdily = []
            for kde, _, soubory in os.walk(koren):
                for s in soubory:
                    abs_ = os.path.join(kde, s)
                    rel = 'supabase/functions/' + os.path.relpath(abs_, koren).replace('\\', '/')
                    prod = open(abs_, 'rb').read().replace(b'\r\n', b'\n')
                    h = head(rel)
                    if h is None:
                        rozdily.append(rel + ' (v HEAD není)')
                    elif h != prod:
                        rozdily.append(rel)
            ver = nasazene[fn].get('version')
            if rozdily:
                nalezy.append('ROZDÍL      ' + fn + ' v' + str(ver) + ': ' + ', '.join(rozdily))
            else:
                ok.append(fn + ' v' + str(ver))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    for n in nalezy:
        print(n)
    print(('OK    ' if not nalezy else 'POZOR ') + 'nasazené = HEAD: ' + str(len(ok)) + ' funkcí' + (' (' + ', '.join(ok) + ')' if ok else '')
          + ('' if not nalezy else ' · ' + str(len(nalezy)) + ' nálezů výš'))
    return 1 if nalezy else 0


if __name__ == '__main__':
    sys.exit(main())
