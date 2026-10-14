# -*- coding: utf-8 -*-
# Smoke ㊆: rozhodování rychlých kontrol při commitu (scripts/utils/rychle_kontroly.py, volá je hooks/pre-commit.py).
# Proč (CODE-tune 2026-10-14, domluveno s CODE-read): pre-commit běží nad sdíleným stromem — commit smí zastavit JEN vada na staged
# souboru, cizí necommitnutá práce ho zastavit nesmí. Rozbité rozhodování by buď pouštělo vlastní chyby (tři dny po sobě se to stalo),
# nebo blokovalo commity všech kvůli cizímu souboru. Tahle kontrola pouští samotest rozhodování na ukázkách skutečných tvarů výstupu
# kontrol (řádek FAIL, souhrnný FAIL s odsazenými cestami, UI_TEXT, „soubor (text)“, cesta z Windows, soubor jen zmíněný v textu).
#   python -X utf8 scripts/verify_rychle_kontroly.py
import os, subprocess, sys
R = (os.environ.get('RUNAR_ROOT') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')).replace('\\', '/')
r = subprocess.run([sys.executable, '-X', 'utf8', R + '/scripts/utils/rychle_kontroly.py', '--test'], capture_output=True, text=True, encoding='utf-8',
                   env=dict(os.environ, RUNAR_ROOT=R), timeout=120)
print((r.stdout or '').strip() or ('FAIL  rychlé kontroly: samotest nic nevypsal — ' + (r.stderr or '').strip()[-200:]))
sys.exit(r.returncode)
