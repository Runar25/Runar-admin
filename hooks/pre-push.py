#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# PRE-PUSH BRÁNA — smoke musí projít, než se práce stane viditelnou pro ostatní.
#
# PROČ pre-push a ne pre-commit: smoke běží ~14 s a commity děláme malé a časté
# (§7 „jeden commit = jedna věc"). 14 s na každý commit by lidi naučilo hook
# obcházet přes --no-verify, což je horší než žádný hook. Push je ten správný
# okamžik: tam práce opouští tenhle stroj a začne ji číst druhá lane.
#
# PROČ vůbec: do 2026-07-19 se smoke spouštěl RUČNĚ. Osmnáct kontrol chránilo kód
# jen tehdy, když si někdo vzpomněl — tedy pravidlo, které musí hlídat člověk,
# přesně to, co CLAUDE.md zakazuje („spadne to na ownera"). A už to selhalo:
# RUNAR_TREE_RENDER.md ležel 9 dní mimo git, ačkoli kontrola ⑫ na to existuje.
#
# Obejít se dá `git push --no-verify` — vědomě a viditelně, ne mlčky.
import os, subprocess, sys

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

print('[pre-push] smoke…')
r = subprocess.run([sys.executable, '-X', 'utf8', os.path.join(REPO, 'smoke.py')], cwd=REPO)
if r.returncode != 0:
    print('\n[pre-push] ZABLOKOVÁNO — smoke neprošel. Oprav to, nebo `git push --no-verify`.')
    sys.exit(1)
print('[pre-push] OK')
