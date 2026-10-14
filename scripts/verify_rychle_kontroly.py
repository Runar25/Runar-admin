# -*- coding: utf-8 -*-
# Smoke ㊆: rozhodování rychlých kontrol při commitu (scripts/utils/rychle_kontroly.py, volá je hooks/pre-commit.py).
# Proč (CODE-tune 2026-10-14, domluveno s CODE-read): pre-commit běží nad sdíleným stromem — commit smí zastavit JEN vada na staged
# souboru, cizí necommitnutá práce ho zastavit nesmí. Rozbité rozhodování by buď pouštělo vlastní chyby (tři dny po sobě se to stalo),
# nebo blokovalo commity všech kvůli cizímu souboru. Tahle kontrola pouští samotest rozhodování na ukázkách skutečných tvarů výstupu
# kontrol (řádek FAIL, souhrnný FAIL s odsazenými cestami, UI_TEXT, „soubor (text)“, cesta z Windows, soubor jen zmíněný v textu).
# Útok na skutečných výstupech (CODE-read 2026-10-14, se souhlasem CODE-tune): ukázky v samotestu se můžou rozejít se skutečností — první
# útok našel dvě kontroly, jejichž výpis cestu nenesl nebo nesl zkráceně (㊂ (D), verify_edge_imports), a vada ve staged souboru by commitem
# prošla. Proto se v dočasné kopii repa do souboru podstrčí skutečná vada, pustí se SKUTEČNÁ kontrola a její výstup jde do rozhodni():
# staged = ten soubor → musí zastavit; staged = jiný soubor → nesmí. Nová rychlá kontrola (KONTROLY v rychle_kontroly.py) = nový případ tady.
#   python -X utf8 scripts/verify_rychle_kontroly.py      (samotest + útok)
import io, os, re, shutil, subprocess, sys, tempfile
R = (os.environ.get('RUNAR_ROOT') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')).replace('\\', '/')

r = subprocess.run([sys.executable, '-X', 'utf8', R + '/scripts/utils/rychle_kontroly.py', '--test'], capture_output=True, text=True, encoding='utf-8',
                   env=dict(os.environ, RUNAR_ROOT=R), timeout=120)
print((r.stdout or '').strip() or ('FAIL  rychlé kontroly: samotest nic nevypsal — ' + (r.stderr or '').strip()[-200:]))
if r.returncode != 0:
    sys.exit(r.returncode)

# ── útok: skutečná vada → skutečný výstup kontroly → rozhodni() ─────────────────────────────────────────────────────────────────
# Texty vad složené z kousků, ať je kontroly nevidí přímo v tomhle souboru (jako v scripts/protipriklady.py).
PRIPADY = [
    ('verify_is_kontrola_jedno_misto.js', 'memory/working-style.md', 'append', '', '\nKontrola IS: napřed check-' + 'is.py, pak is-' + 'greynir.py.\n'),
    ('verify_doc_links.js', 'RUNAR_DESIGN.md', 'append', '', '\n\nOdkaz do prázdna: `docs/neexistuje-' + 'xyz.md`\n'),
    ('verify_opt_out.js', 'scripts/utils/stats.js', 'append', '', "\nconst _protiQ = 'select text from read" + "ings where lang = $1';\n"),
    ('verify_runar_root.js', 'scripts/utils/stats.js', 'append', '', "\nconst _protiCesta = 'C:/Users/zkuku/Downloads/" + "Runar-admin/v2';\n"),
    ('verify_jazyk_ui.js', 'v2/runar-help.html', 'append', '', '\n<p>Tohle je česká věta, která tu nemá co dě' + 'lat.</p>\n'),
    ('verify_zakazy_cesty.js', 'v2/runar-app.js', 'append', '', "\nfunction _jmenoX(u) { return u.email.split('" + "@')[0]; }\n"),
    ('verify_zakazy_cesty.js', 'v2/runar-reading.js', 'replace', "} else if (_spreadMode === 'horse" + "shoe') {", "} else if (_spreadMode === 'horseshoe_x') {"),
    ('verify_code_doc_refs.js', 'v2/runar-app.js', 'append', '', '\n// podrobnosti viz docs/neexistuje-protipriklad-xyz' + '.md\n'),
    ('verify_edge_imports.js', 'supabase/functions/elevenlabs-proxy/index.ts', 'regex', r'npm:@supabase/supabase-js@[0-9.]+', 'npm:@supabase/supabase-js@' + '2'),
]
sys.path.insert(0, R + '/scripts/utils')
import rychle_kontroly as rk
W = tempfile.mkdtemp(prefix='rychle-utok-'); os.rmdir(W)
g = subprocess.run(['git', '-C', R, 'worktree', 'add', '--detach', W, 'HEAD'], capture_output=True, text=True)
if g.returncode != 0:
    print('FAIL  rychlé kontroly — útok: kopii repa nejde vytvořit (' + (g.stderr or '').strip()[-150:] + ')'); sys.exit(1)
vady = []
try:
    for k in set(p[0] for p in PRIPADY):                       # kontroly z kopie, kterou smoke pouští (pracovní strom / pushovaný commit)
        shutil.copy(R + '/scripts/' + k, W + '/scripts/' + k)
    for k, rel, mode, a, b in PRIPADY:
        p = W + '/' + rel
        s = io.open(p, encoding='utf-8', newline='').read()
        if mode == 'append':
            t = s + b
        elif mode == 'replace':
            t = s.replace(a, b) if s.count(a) == 1 else s
        else:
            t = re.sub(a, b, s, count=1)
        if t == s:
            vady.append(k + ' [' + rel + ']: podstrčení se neprojevilo — cílový text se změnil; uprav případ v PRIPADY'); continue
        io.open(p, 'w', encoding='utf-8', newline='').write(t)
        v = subprocess.run(['node', W + '/scripts/' + k], cwd=W, capture_output=True, text=True, encoding='utf-8', env=dict(os.environ, RUNAR_ROOT=W), timeout=120)
        out = (v.stdout or '') + (v.stderr or '')
        subprocess.run(['git', '-C', W, 'checkout', '-q', '--', rel])
        if v.returncode == 0:
            vady.append(k + ' [' + rel + ']: kontrola vadu vůbec nechytila (exit 0)'); continue
        blok, _ = rk.rozhodni([(k, v.returncode, out)], [rel])
        cizi, _ = rk.rozhodni([(k, v.returncode, out)], ['RUNAR_BACKLOG.md'])
        if not blok:
            vady.append(k + ' [' + rel + ']: vada ve staged souboru commit NEZASTAVÍ — výpis kontroly nenese cestu, kterou pre-commit spáruje: '
                        + ' | '.join(l.strip() for l in out.splitlines() if 'FAIL' in l)[:200])
        if cizi:
            vady.append(k + ' [' + rel + ']: vada v cizím souboru commit ZASTAVÍ (staged jen RUNAR_BACKLOG.md)')
finally:
    subprocess.run(['git', '-C', R, 'worktree', 'remove', '--force', W], capture_output=True)
    shutil.rmtree(W, ignore_errors=True)
for x in vady:
    print('FAIL  ' + x)
if vady:
    print('FAIL  rychlé kontroly — útok na skutečných výstupech: ' + str(len(vady)) + ' z ' + str(len(PRIPADY)) + ' případů nesedí')
    sys.exit(1)
print('OK    rychlé kontroly: samotest + útok na skutečných výstupech (' + str(len(PRIPADY)) + ' vad ve ' + str(len(set(p[0] for p in PRIPADY)))
      + ' kontrolách: staged soubor zastaví, cizí ne)')
