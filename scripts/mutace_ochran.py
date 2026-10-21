# -*- coding: utf-8 -*-
# mutace_ochran.py — mutace OCHRAN v edge funkcích: v čisté kopii repa vypne jednu ochranu (podmínku, po které funkce vrátí 4xx) a pustí
# kontroly, které čtou supabase/functions. Mutant, který PŘEŽIJE (žádná kontrola nespadne) = ochrana, kterou nic nehlídá.
#
# Proč (CODE-read 2026-10-21, zadání ownera přes CODE-tune: „chci kontrolovat místa, kde můžou být chyby a nebyly kontrolované“):
# kontroly vznikaly z toho, na co už někdo narazil. Spouštěč: v claude-proxy se stín promptu dostal PŘED ověření přihlášení (4e966cc,
# opraveno do 3 min) a žádná kontrola by to nechytila. Útoky na kontroly (scripts/protipriklady.py, smoke ㊵) ověřují kontroly, které
# máme; tohle hledá místa, kde kontrola chybí.
#
# Mutace: `if (COND)` u ochrany → `if (false && (COND))` — ochrana nikdy nezabere, syntaxe zůstane. Které řádky jsou ochrany, určuje
# verify_mapa_ochran.js (`--ochrany`, jedno místo). Nečte smysl kódu — co není `if` s návratem 4xx (CORS, podpis lístku uvnitř helperu,
# RLS v DB), tímhle nevidí; to je hranice nástroje, ne „ohlídáno“.
#
#   python -X utf8 scripts/mutace_ochran.py              všechny ochrany, souhrn přeživších
#   python -X utf8 scripts/mutace_ochran.py --seznam     jen vypíše nalezené ochrany (bez spouštění)
import os, re, subprocess, sys, tempfile, shutil, glob
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))).replace('\\', '/')
import json


def ochrany():
    # jedno místo hledání ochran = verify_mapa_ochran.js (mapa i mutace musí vidět tytéž řádky)
    r = subprocess.run(['node', ROOT + '/scripts/verify_mapa_ochran.js', '--ochrany'], capture_output=True, text=True, encoding='utf-8', check=True)
    return [('supabase/functions/%s/index.ts' % o['fn'], o['radek'], o['text'][:110]) for o in json.loads(r.stdout)]


def kontroly():
    ks = []
    for p in sorted(glob.glob(ROOT + '/scripts/verify_*.js')):
        t = open(p, encoding='utf-8', errors='replace').read()
        if re.search(r'supabase/functions|claude-proxy|elevenlabs-|redeem-code|send-line|waitlist-join|delete-account|reset-tree|voice-usage|ops-watch|list-re', t):
            ks.append(os.path.basename(p))
    return ks


def mutuj(text, radek):
    rr = text.split('\n')
    l = rr[radek - 1]
    m = re.search(r'\bif\s*\(', l)
    i, hl = m.end(), 1
    while i < len(l) and hl:
        hl += {'(': 1, ')': -1}.get(l[i], 0); i += 1
    if hl:                                   # podmínka přes víc řádků — vypnout jen začátek: `if (false && (` … `))` by chtělo hledat konec
        rr[radek - 1] = l[:m.end()] + 'false && ' + l[m.end():]
    else:
        rr[radek - 1] = l[:m.end()] + 'false && (' + l[m.end():i - 1] + ')' + l[i - 1:]
    return '\n'.join(rr)


def main():
    och = ochrany()
    if '--seznam' in sys.argv:
        for o in och: print('%s:%d  %s' % o)
        print(len(och), 'ochran'); return
    ks = kontroly()
    W = tempfile.mkdtemp(prefix='mutace-'); os.rmdir(W)
    subprocess.run(['git', '-C', ROOT, 'worktree', 'add', '--detach', '-q', W, 'HEAD'], check=True)
    try:
        for k in ks: shutil.copy(ROOT + '/scripts/' + k, W + '/scripts/' + k)
        def spust(k):
            r = subprocess.run(['node', W + '/scripts/' + k], cwd=W, capture_output=True, text=True, encoding='utf-8',
                               env=dict(os.environ, RUNAR_ROOT=W), timeout=180)
            return k, r.returncode
        with ThreadPoolExecutor(8) as ex:
            zaklad = dict(ex.map(spust, ks))
        cervene = [k for k, rc in zaklad.items() if rc]
        ks = [k for k in ks if not zaklad[k]]
        print('kontroly čtoucí edge funkce: %d (červené už bez mutace, vynechány: %s)' % (len(ks), ', '.join(cervene) or '—'))
        prezili, zabiti = [], []
        for rel, n, txt in och:
            p = W + '/' + rel
            puv = open(p, encoding='utf-8', newline='').read()
            open(p, 'w', encoding='utf-8', newline='').write(mutuj(puv, n))
            with ThreadPoolExecutor(8) as ex:
                padly = [k for k, rc in ex.map(spust, ks) if rc]
            open(p, 'w', encoding='utf-8', newline='').write(puv)
            (zabiti if padly else prezili).append((rel, n, txt, padly))
            print(('  zabit   ' if padly else '  PŘEŽIL  ') + '%s:%d  %s' % (rel, n, txt) + ('  ← ' + ', '.join(padly) if padly else ''), flush=True)
        print('\nochran %d · zabito %d · PŘEŽILO %d (nic je nehlídá)' % (len(och), len(zabiti), len(prezili)))
    finally:
        subprocess.run(['git', '-C', ROOT, 'worktree', 'remove', '--force', W], capture_output=True)
        shutil.rmtree(W, ignore_errors=True)


if __name__ == '__main__':
    main()
