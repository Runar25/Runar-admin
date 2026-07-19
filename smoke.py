#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# smoke.py — Rúnar Smoke Test
# Spustit před každým commitem. Trvá ~5 vteřin.
# Použití: python -X utf8 smoke.py
# Exit 0 = vše OK, Exit 1 = něco selhalo

import subprocess, sys, os, re

BASE = r'C:\Users\zkuku\Downloads\Runar-admin\v2'
ROOT = r'C:\Users\zkuku\Downloads\Runar-admin'

JS_FILES = [
    'runar-config.js',
    'runar-translations.js',
    'runar-character.js',
    'runar-utils.js',
    'runar-journal.js',
    'runar-tree.js',
    'runar-gathering.js',
    'runar-auth.js',
    'runar-reading.js',
    'runar-app.js',
]

# Soubory kde §10 platí — žádné hardcoded user-visible strings
LOGIC_FILES = [
    'runar-auth.js',
    'runar-reading.js',
    'runar-app.js',
    'runar-tree.js',
    'runar-gathering.js',
    'runar-journal.js',
]

fail_count = 0
ok_count   = 0

def check(label, passed, detail=''):
    global ok_count, fail_count
    marker = '✅' if passed else '❌'
    print(f'  {marker} {label}')
    if detail:
        for line in detail.strip().split('\n'):
            if line.strip():
                print(f'       {line}')
    if passed:
        ok_count += 1
    else:
        fail_count += 1

print()
print('══════════════════════════════════════════')
print('  RÚNAR SMOKE TEST')
print('══════════════════════════════════════════')

# ── 1. JS syntax ────────────────────────────────────────────
print('\n① JS SYNTAX (node --check)')
syntax_errors = []
for fname in JS_FILES:
    fpath = os.path.join(BASE, fname)
    if not os.path.exists(fpath):
        syntax_errors.append(f'{fname}: soubor nenalezen')
        continue
    r = subprocess.run(['node', '--check', fpath],
                       capture_output=True, text=True)
    if r.returncode != 0:
        msg = (r.stderr or r.stdout).strip()
        # Zkrať na první řádek chyby
        first_line = msg.split('\n')[0] if msg else 'neznámá chyba'
        syntax_errors.append(f'{fname}: {first_line}')

check(
    'Syntax všech JS souborů OK' if not syntax_errors
    else f'Syntax error v {len(syntax_errors)} souboru',
    not syntax_errors,
    '\n'.join(syntax_errors)
)

# ── 2. Hardcoded strings (§10) ─────────────────────────────
print('\n② HARDCODED STRINGS (§10)')
# Hledej: 'VELKÁ SLOVA S MEZERAMI' nebo "..." v logic files
# IGNORUJ: řádky s t(, tp(, vn(, vl() | komentáře | prázdné
CAPS_PATTERN = re.compile(r"""(?<![:\w])['"]([A-Z][A-Z ]{3,}[A-Z])['"]""")
IGNORE_VALS  = {
    'STANDARD', 'PREMIUM', 'FREE TRIAL', 'RUNE SEEKER',
    'RUNE WALKER', 'RUNE KEEPER', 'THE GATHERING',
    'TROJICE', 'NORNS', 'KRIZ', 'HORSESHOE', 'YGGDRASIL',
    'RUNE CARD', 'GET A RUNE CARD',
    'VISITOR', 'GESTUR', 'VEGFARANDI',
    'EN', 'IS', 'OK', 'HTML', 'CSS', 'DB', 'URL', 'JS',
}
violations = []
for fname in LOGIC_FILES:
    fpath = os.path.join(BASE, fname)
    if not os.path.exists(fpath):
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        # Přeskoč komentáře
        if stripped.startswith('//') or stripped.startswith('*'):
            continue
        # Přeskoč řádky které volají t()/tp()/vn()/vl()
        if any(x in line for x in ["t('", 'tp(', 'vn(', 'vl(']):
            continue
        m = CAPS_PATTERN.search(line)
        if m:
            val = m.group(1)
            if val in IGNORE_VALS:
                continue
            violations.append(f'{fname}:{i}  "{val}"')

check(
    'Žádné hardcoded strings nalezeny' if not violations
    else f'{len(violations)} potenciálních §10 porušení',
    not violations,
    '\n'.join(violations[:15]) + ('\n     ... (zkráceno)' if len(violations) > 15 else '')
)

# ── 3. IS texty ─────────────────────────────────────────────
print('\n③ IS TEXTY (check-is.py)')
r = subprocess.run(
    [sys.executable, '-X', 'utf8', os.path.join(ROOT, 'check-is.py')],
    capture_output=True, text=True, encoding='utf-8'
)
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
# Zobraz první řádek (OK: ... nebo FOUND N ...)
summary = output.split('\n')[0] if output else ''
check(
    summary if passed else (summary or 'IS problémy nalezeny'),
    passed,
    '' if passed else '\n'.join(output.split('\n')[1:])
)

# ── 4. Překlady ─────────────────────────────────────────────
print('\n④ PŘEKLADY (check-translations.py)')
r = subprocess.run(
    [sys.executable, '-X', 'utf8', os.path.join(ROOT, 'check-translations.py')],
    capture_output=True, text=True, encoding='utf-8'
)
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
lines  = [l for l in output.split('\n') if l.strip()]
# Zobraz info řádky (počty)
for l in lines:
    if l.startswith('  ') or l.startswith('check-'):
        print(f'       {l.strip()}')
# Najdi poslední řádek (OK nebo chyba)
summary = lines[-1].strip() if lines else ''
check(summary if summary else ('Překlady OK' if passed else 'Chybí IS překlady'), passed)

# ── 5. SW verze ─────────────────────────────────────────────
print('\n⑤ SW VERZE')
sw_path = os.path.join(BASE, 'sw.js')
try:
    with open(sw_path, 'r', encoding='utf-8') as f:
        sw_content = f.read()
    comment_m = re.search(r'Service Worker.*?v(\d+)', sw_content)
    cache_m   = re.search(r"CACHE\s*=\s*'runar-v(\d+)'", sw_content)
    v_comment = comment_m.group(1) if comment_m else '?'
    v_cache   = cache_m.group(1)   if cache_m   else '?'
    consistent = (v_comment == v_cache)
    check(
        f'SW v{v_cache} (komentář + cache shodné)' if consistent
        else f'SW nekonzistentní: komentář=v{v_comment}, cache=v{v_cache}',
        consistent
    )
except FileNotFoundError:
    check('sw.js nenalezen', False)

# ── 6. Corrections contract (seed-and-assert, real path) ───
print('\n⑥ CORRECTIONS CONTRACT (golden_contracts.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'golden_contracts.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
check(output.split('\n')[0] if output else 'contract ran', passed,
      '' if passed else output)

# ── 7. Compose mirror (proxy composeReading == client _parseSegments) ───
print('\n⑦ COMPOSE MIRROR (verify_compose_mirror.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_compose_mirror.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
last = output.split('\n')[-1] if output else 'mirror ran'
check(last if passed else 'compose mirror MISMATCH — update proxy composeReading', passed,
      '' if passed else output)

# ── 8. Reading contract wiring (single + all 4 spreads, both langs) ───
print('\n⑧ CONTRACT WIRING (verify_contract_wiring.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_contract_wiring.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
last = output.split('\n')[-1] if output else 'contract check ran'
check(last if passed else 'contract NEDORAZIL do všech builderů', passed,
      '' if passed else output)

# ── 9. Monthly cap: config == proxy (§18 — the copy must not drift) ───
print('\n⑨ MONTHLY CAP (verify_monthly_limits.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_monthly_limits.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
last = output.split('\n')[-1] if output else 'cap check ran'
check(last if passed else 'cap v configu != cap vynucovaný proxy', passed,
      '' if passed else output)

# ── 10. Write surface: co smí uživatel zapsat (§19 — the seam, not the file) ──
print('\n⑩ WRITE SURFACE (verify_write_surface.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_write_surface.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
first = output.split('\n')[0] if output else 'write surface check ran'
check(first if passed else 'klient vs granty se rozešly (tichá 403 nebo díra)', passed,
      '' if passed else output)

# ── 11. Memory index: odkazy vedou někam + nic neverzovaného (§17) ───
print('\n⑪ MEMORY INDEX (verify_memory_index.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_memory_index.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
first = output.split('\n')[0] if output else 'memory index check ran'
check(first if passed else 'rozbitý odkaz nebo neverzovaný soubor v memory/', passed,
      '' if passed else output)

# ⑫ — táž vada jako ⑪, o patro výš: kanonický doc, co není v gitu, neexistuje
# (clean checkout ho nemá, Cowork přes `git show HEAD:` ho nevidí). 2026-07-17: RUNAR_TREE.md
# ležel untracked 13 dní a Cowork navrhoval udělat konsolidaci, která už byla hotová.
print('\n⑫ KANONICKÉ SOUBORY (verify_canonical_files.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_canonical_files.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
first = output.split('\n')[0] if output else 'canonical files check ran'
check(first if passed else 'kanonický doc nebo SQL migrace NENÍ v gitu — §17', passed,
      '' if passed else output)

# ⑬ — signál z DB musí DOJET do stromu. 2026-07-18: osa B (area → strana) byla pro každý
# spread mrtvá — klient ukládá area='spread' (marker) + oblast do `aol`, strom četl jen `area`.
# Data v DB ležela, strom je zahodil. Nic nespadlo → kontrola na výsledku, ne na tvaru kódu.
print('\n⑬ TREE SIGNÁLY (verify_tree_signals.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_tree_signals.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
first = output.split('\n')[0] if output else 'tree signals check ran'
check(first if passed else 'signál z DB nedojel do stromu (tichá ztráta umístění)', passed,
      '' if passed else output)

# ⑭ — sourozenec ③ check-is.py, o patro výš: mrtvá tvrzení v ŽIVÉ dokumentaci.
# 2026-07-18: audit našel 97 rozporů nad ~12 fakty (4-7 míst každý). Owner opravoval
# Yggdrasil POPÁTÉ — a i po cíleném auditu zbylo 5 dalších míst, která našla až tahle
# kontrola. Pozná řetězec, ne význam: „founding ritual free" proti kódu neodhalí.
print('\n⑭ ŽIVÁ DOKUMENTACE (check-docs.py)')
r = subprocess.run([sys.executable, '-X', 'utf8', os.path.join(ROOT, 'check-docs.py')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
lines = [l for l in output.split('\n') if l.strip()]
summary = lines[-1].strip() if lines else 'doc lint ran'
check(summary if passed else 'mrtvé tvrzení v živém docu (retirovaný pojem / neplatné pravidlo)',
      passed, '' if passed else output)

# ⑮ — kontrola na MECHANISMUS, ne na obsah. Ostatni kontroly chytaji nasledky
# rozsypane dokumentace; tahle chyta pricinu: nesplneny radek `Affected doc(s)`
# v RUNAR_DECISIONS.md. Prace se udela, rozhodnuti zapise, doc zustane spatne —
# presne tak vzniklo 97 rozporu nalezenych 2026-07-18. Zpetne nevymaha.
print('\n⑮ §16 OUTPUT B (verify_decisions_followthrough.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_decisions_followthrough.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
outl = [l for l in output.split('\n') if l.strip()]
for l in outl:
    if l.startswith(chr(8505)) or l.startswith('     '):
        print('       ' + l.strip())
summary = outl[-1].strip() if outl else 'followthrough ran'
check(summary if passed else 'rozhodnuti slibilo opravu docu, ktera se nestala', passed,
      '' if passed else output)

# ⑯ — odkaz do prázdna pošle čtenáře hledat náhradu, a ta se najde v zastaralé kopii.
# 2026-07-18: RUNAR_DOC_SYNC.md (nikdy neexistoval), RUNAR_TREE_LAB.md vedený jako živý
# (byl v archivu), scripts/utils/ cesty (nástroje jsou v kořeni). Rozšíření ⑪ na celý repo.
print('\n⑯ DOC ODKAZY (verify_doc_links.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_doc_links.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
outl = [l for l in output.split('\n') if l.strip()]
for l in outl:
    if l.startswith(chr(8505)) or l.startswith('     '):
        print('       ' + l.strip())
summary = outl[-1].strip() if outl else 'verify_doc_links.js ran'
check(summary if passed else 'odkaz do prazdna — doc posila ctenare na neexistujici soubor', passed,
      '' if passed else output)

# ⑰ — na rozdíl od ⑭ nezná seznam mrtvých pojmů; čte AKTUÁLNÍ config a odvozuje, co
# je platné. Chytí i přejmenování, které ještě nikoho nenapadlo: „Rune Keeper" propadne
# ne proto, že je na seznamu, ale proto, že v TIERS není. Čísla hlásí jen žlutě.
print('\n⑰ DOC HODNOTY (verify_doc_values.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_doc_values.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
outl = [l for l in output.split('\n') if l.strip()]
for l in outl:
    if l.startswith(chr(8505)) or l.startswith('     '):
        print('       ' + l.strip())
summary = outl[-1].strip() if outl else 'verify_doc_values.js ran'
check(summary if passed else 'jmeno tieru, ktere v configu neni (§20 — hodnoty se neopisuji)', passed,
      '' if passed else output)

# ── DB zápisy: každý musí pozorovat svůj výsledek (§19) ──────────────
print('\n⑱ DB ZÁPISY (verify_db_write_checked.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_db_write_checked.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
first = output.split('\n')[0] if output else 'db write check ran'
check(first if passed else 'DB zápis, který tiše selže (supabase-js nevyhazuje)', passed,
      '' if passed else output)

# ── Escape značky: každá musí nést důvod + datum (§19.2) ─────────────
print('\n' + chr(0x2472) + ' ESCAPE ZNAČKY (verify_escape_marks.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_escape_marks.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
first = output.split('\n')[0] if output else 'escape mark check ran'
check(first if passed else 'escape značka umlčuje kontrolu bez zdůvodnění', passed,
      '' if passed else output)

# ── Ceny spreadů: jeden vlastník (SPREAD_COSTS) ──────────────────────
# ⑰ uměla jen jména tierů; cena byla na TŘECH místech (SPREAD_COSTS, jeho vlastní
# kopie v SPREAD_CONFIG, tabulka v RUNAR_PRICING) a nic je neporovnávalo. Tak vznikl
# „founding ritual free": doc sliboval jedno, kód dělal druhé.
print('\n' + chr(0x2473) + ' CENY SPREADŮ (verify_spread_prices.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_spread_prices.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
first = output.split('\n')[0] if output else 'spread price check ran'
check(first if passed else 'cena spreadu se rozešla se SPREAD_COSTS (§20 — hodnoty se neopisují)', passed,
      '' if passed else output)

# ── Vlastnictví se testuje PŘED tierem ───────────────────────────────
# Owner 2026-07-19: životní runa se vygenerovala, zobrazila a při dalším překreslení
# tabu zmizela. Příčina bylo POŘADÍ — větev podle tieru se vracela dřív, než se kód
# zeptal, jestli hotové čtení existuje. Nic nespadlo, obsah prostě zmizel.
print(chr(0x3251) + ' VLASTNICTVÍ PŘED TIEREM (verify_owned_before_tier.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_owned_before_tier.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
first = output.split('\n')[0] if output else 'owned-before-tier check ran'
check(first if passed else 'hotové čtení schované za kontrolou tieru', passed,
      '' if passed else output)

# ── Rozpoznání zakládání čte vlastnost, kterou volající posílá ───────
# 2026-07-19: `_isFounding` cetlo `o.mode`, ktere v predavanem objektu neexistuje
# (posila se `kind`). Vyraz byl vzdy false -> zalozeni stromu se nespustilo ani
# jednou, uzivatel misto nej dostal placene Norny. JS na to neupozorni: cteni
# neexistujici vlastnosti je undefined, ne chyba.
print(chr(0x3252) + ' PRIZNAK ZAKLADANI (verify_founding_flag.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_founding_flag.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
first = output.split('\n')[0] if output else 'founding flag check ran'
check(first if passed else 'zalozeni cte vlastnost, kterou nikdo neposila', passed,
      '' if passed else output)

# ── Výsledek ─────────────────────────────────────────────────
print()
print('══════════════════════════════════════════')
if fail_count == 0:
    print(f'  ✅  SMOKE TEST PROŠEL  —  {ok_count}/{ok_count + fail_count} kontrol OK')
else:
    print(f'  ❌  SMOKE TEST SELHAL  —  {fail_count} problém(ů), {ok_count} OK')
print('══════════════════════════════════════════')
print()

# ── §16 DOC SYNC reminder (NEblokující — jen připomínka, neovlivňuje exit) ──
try:
    _staged = subprocess.run(['git', 'diff', '--cached', '--name-only'],
                             cwd=ROOT, capture_output=True, text=True)
    _files = [l.strip() for l in _staged.stdout.splitlines() if l.strip()]
    _js_changed  = any(f.endswith('.js') for f in _files)
    _dec_staged  = any('RUNAR_DECISIONS.md' in f for f in _files)
    if _js_changed and not _dec_staged:
        print('  ℹ  §16: staged JS beze změny RUNAR_DECISIONS.md')
        print('       Pokud se změnilo CHOVÁNÍ/rozhodnutí → přidej záznam. Refactor/CSS ignoruj.')
        print()
except Exception:
    pass  # git nedostupný / žádné staged soubory → připomínku tiše přeskoč

sys.exit(0 if fail_count == 0 else 1)
