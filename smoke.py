#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# smoke.py — Rúnar Smoke Test
# Spustit před každým commitem. Trvá ~5 vteřin.
# Použití: python -X utf8 smoke.py
# Exit 0 = vše OK, Exit 1 = něco selhalo

import subprocess, sys, os, re

BASE = os.environ.get('RUNAR_ROOT', r'C:\Users\zkuku\Downloads\Runar-admin') + r'\v2'
ROOT = os.environ.get('RUNAR_ROOT', r'C:\Users\zkuku\Downloads\Runar-admin') + r''

JS_FILES = [
    'runar-config.js',
    'runar-translations.js',
    'runar-character.js',
    'runar-utils.js',
    'runar-journal.js',
    'runar-tree.js',
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
    'SINGLE',   # 2026-09-30: klíč druhu čtení pro myšlenku ✦ (_thoughtFor), ne text pro uživatele — jako NORNS/KRIZ výš
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
# 2026-07-18: RUNAR_DOC_SYNC.md (nikdy neexistoval), RUNAR_TREE_LAB.md vedený jako živý  # doc-links:ok 2026-10-10 záměrně: historie (kontrola ㉺)
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

# ── Inbox freshness: ŽLUTÝ alarm, nikdy neblokuje ────────────────────
# docs/inbox/ je mimo doc-kontroly (chaos OK). Když se přestane vysávat, stane se
# tichým junk drawerem. Tenhle check to dělá HLUČNÝM — ⚠ řádek, ale VŽDY zelená
# (exit 0). Cadence = práce (Cowork), check = pojistka. Vzor: ⑰ tiskne ℹ, prochází.
print('\n' + chr(0x3253) + ' INBOX FRESHNESS (verify_inbox_freshness.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_inbox_freshness.js')],
                   capture_output=True, text=True, encoding='utf-8')
output = (r.stdout + r.stderr).strip()
outl = [l for l in output.split('\n') if l.strip()]
for l in outl:
    if l.startswith('⚠') or l.startswith('ℹ'):   # ⚠ / ℹ
        print('       ' + l.strip())
warn = [l for l in outl if l.startswith('⚠')]
summary = warn[0].strip() if warn else (outl[-1].strip() if outl else 'inbox check ran')
check(summary, True)   # VŽDY True — informační, nikdy neblokuje push

# ── Interní tagy: provenience [kánon]/[Agndofa] nesmí prosáknout do user-facing ──
# 2026-07-30: Yggdrasil bytosti přišly do RUNAR_DESIGN.md s tagy [kánon]/[Agndofa].
# Ty jsou INTERNÍ — nesmí do UI/promptu/HTML, jinak je uživatel uvidí ve čtení.
# (KUKY: „aby se Agndofa nikde nezobrazovala. je to jen interní poznámka.")
print('\n' + chr(0x3254) + ' INTERNÍ TAGY (verify_internal_tags.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_internal_tags.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
first = output.split('\n')[0] if output else 'internal-tags check ran'
check(first if passed else 'interní tag [kánon]/[Agndofa] v user-facing ploše', passed,
      '' if passed else output)

# ── 25. Otevřené věci před spuštěním ────────────────────────
# Nález, který se NEZAPSAL, žádná kontrola nechytí (verify_decisions_followthrough
# hlídá jen zapsaná rozhodnutí). Jakmile ale zapsaný je, může ho tohle držet na očích.
# Nehlásí chybu záměrně: ve vývoji jsou tyhle věci legitimně otevřené a padající
# smoke by se první den vypnul.
print('\n' + chr(0x3255) + ' PŘED SPUŠTĚNÍM (verify_prelaunch_open.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_prelaunch_open.js')],
                   capture_output=True, text=True, encoding='utf-8')
output = (r.stdout + r.stderr).strip()
first = output.split('\n')[0] if output else 'pre-launch check ran'
rest = '\n'.join(output.split('\n')[1:])
check(first, True, rest)

# ── 26. Nahlášená fráze pořád ve zdroji ─────────────────────
# KUKY 2026-08-16: „report se zpracuje, jen když na to upozorním. jde to udělat jinak?"
# Jde: `bug_reports.flagged_text` se porovná se zdrojem `v2/`. Shoda = nahlášená vada,
# která tam pořád je. Doloženo: „ríður vindinum" nahlášeno rodilým mluvčím 2026-08-02
# a v promptu zůstalo 14 dní, protože z reportu nevedla cesta zpátky do kódu.
# Nehlásí chybu — otevřený report je legitimní stav; padající smoke by se vypnul.
print('\n' + chr(0x3256) + ' NAHLÁŠENÉ FRÁZE (verify_open_reports.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_open_reports.js')],
                   capture_output=True, text=True, encoding='utf-8')
output = (r.stdout + r.stderr).strip()
first = output.split('\n')[0] if output else 'open-reports check ran'
check(first, True, '\n'.join(output.split('\n')[1:]))

# ── 27. Datovaný záznam z dneška musí nést dnešek ───────────
# KUKY 2026-08-17: „celý den jsem trávil tím, že jsem tě to zase učil."  Jedna z příčin je
# měřitelná: 19 záznamů zapsaných 17. 8. neslo datum 16. 8. — opsal jsem ho z kontextu
# vlitého po compactu místo abych ho zjistil. Rozhodčí pravidlo „vyhrává NOVĚJŠÍ datovaný
# záznam" tím tiše obrací. BLOKUJE (na rozdíl od ㉕/㉖): připomínka na tohle dnes selhala
# devatenáctkrát, blok je jediné, co v tomhle projektu prokazatelně mění chování.
print('\n' + chr(0x3257) + ' DATUM ZÁZNAMŮ (verify_fresh_dates.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_fresh_dates.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
first = output.split('\n')[0] if output else 'fresh-dates check ran'
check(first, passed, '' if passed else '\n'.join(output.split('\n')[1:]))

# ── 28. Tvrzení, které v kánonu už stojí ────────────────────
# „Drift a duplikáty jsou nejhorší" (KUKY, opakovaně) — a §20 to zakazuje od 2026-07-18.
# Přesto jsem 2026-08-17 vložil tvrzení „Claude drží snapshots/ čerstvý" do working-style.md
# PODRUHÉ, přímo do pravidla o tom. Blokuje jen NOVÉ opakování; starší vypisuje jako ℹ,
# aby se nezametla (§19.2), ale smoke neshazuje — jinak by se kontrola první den vypnula.
print('\n' + chr(0x3258) + ' DRUHÁ KOPIE TVRZENÍ (verify_new_duplicates.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_new_duplicates.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
first = output.split('\n')[0] if output else 'duplicates check ran'
check(first, passed, '\n'.join(output.split('\n')[1:]))

# ── 29. Invarianty páteře přežijí vlastní postavu ───────────
# `test_spine.js` existoval od 2026-08-14 a testuje celý životní cyklus pole vlastní postavy
# (chybí / prázdné / vyplněné). Běžel ale JEN ručně — tedy podle toho, jestli si na něj někdo
# vzpomene. 2026-08-17 se ukázalo, oč jde: shrine si nastavoval `{...DEF_CHAR}` a islandský
# prompt tím přišel o gramatiku. Tenhle test to sám nechytil, protože nikdo nespustil.
print('\n' + chr(0x3259) + ' PÁTEŘ vs VLASTNÍ POSTAVA (test_spine.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'utils', 'test_spine.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
last = [l for l in output.split('\n') if l.strip()]
check(last[-1].strip() if last else 'spine test ran', passed, '' if passed else output)

# ── 30. Dojde každá per-čtení páka na každou cestu? ─────────
# Audit promptu 2026-08-17/18 našel čtyři vady a ANI JEDNA nebyla ve znění — všechny byly
# v zapojení: ÁVARP mělo 6 ze 7 islandských cest (u životní runy si model rod čtenáře volil
# sám), úhel má 1 ze 7, shrine přebil celý jazyk. Všechno našel člověk čtením.
# Kontrola drží MAPU (co kam dochází + proč ne, s datem) a hlásí ZMĚNU proti ní.
print('\n' + chr(0x325A) + ' PÁKY PROMPTU vs CESTY (verify_prompt_levers.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_prompt_levers.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
check(radky[-1].strip() if radky else 'lever check ran', passed, '' if passed else output)

# ── 31. Pozná git log, která session commit napsala? ────────
# 2026-08-18: CLAUDE.md tvrdilo „jediné, co rozliší autora, je commit prefix". Pak přibyla
# třetí CODE session, začala commitovat pod [tune] jako CODE-tune, a ta věta tiše přestala
# platit — nevšiml si toho nikdo, protože to nic nehlídalo. Owner: „jak tohle hlídat?"
# Kořen nebyl prefix, ale společný podpis; kontrola proto sleduje JMÉNO autora.
# SAMOAKTIVAČNÍ: dokud se všechny tři lane nepodepíšou, jen hlásí (blokovat je za pravidlo,
# o kterém nevědí, by bylo nefér); jakmile se podepíšou všechny, přepne se sama na blokující.
print('\n' + chr(0x325B) + ' IDENTITA SESSION V COMMITU (verify_commit_identity.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_commit_identity.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = next((l for l in radky if not l.startswith('  ')), radky[-1] if radky else 'identity check ran')
check(prvni.strip(), passed, '\n'.join(l for l in radky if l != prvni))

print('\n' + chr(0x325C) + ' REGISTR PRAVIDEL PROMPTU (verify_prompt_rules_registry.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_prompt_rules_registry.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[0] if radky else 'registr pravidel probehl'
check(prvni.strip(), passed, '\n'.join(radky[1:]))

print('\n' + chr(0x325D) + ' DÉLKA ŽIVÝCH DOCŮ (verify_doc_length.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_doc_length.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[0] if radky else 'kontrola delky probehla'
check(prvni.strip(), passed, '\n'.join(radky[1:]))

print('\n' + chr(0x325E) + ' STAV SDÍLENÉHO STROMU (verify_shared_tree.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_shared_tree.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[0] if radky else 'kontrola sdileneho stromu probehla'
check(prvni.strip(), passed, '\n'.join(radky[1:]))

print('\n' + chr(0x325F) + ' MOTIVY OBRAZU (verify_image_motifs.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_image_motifs.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[0] if radky else 'kontrola motivu probehla'
check(prvni.strip(), passed, '\n'.join(radky[1:]))

print('\n' + chr(0x3260) + ' REGISTER OBRAZU (verify_image_register.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_image_register.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[0] if radky else 'kontrola registru probehla'
check(prvni.strip(), passed, '\n'.join(radky[1:]))

# Nápověda v Ask se od 2026-09-10 STAVÍ z toho, co je ve čtení (jedna runa / spread /
# je-li životní runa / ptal se člověk na něco) — konstantní seznam nabízel i to, co pro
# dané čtení neplatí. Tvrzení „je kontextová" musí být dokázané, ne napsané (§24).
print('\n' + chr(0x3261) + ' NÁPOVĚDA V ASK (verify_ask_hints.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_ask_hints.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola napovedy probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]) if not passed else '')

# Pilulky (oblast/cesta/záměr) si ukládají lokalizovaný POPISEK, ne index — po přepnutí
# jazyka se volba tvářila jako zrušená, ale dál tekla do promptu ve staré řeči
# („Svið: Career & Creativity“). Ani jedna polovina toho nespadla — proto kontrola
# na VÝSLEDKU, ne na tvaru kódu (§19).
print('\n' + chr(0x3262) + ' PILULKY PŘEŽIJÍ PŘEPNUTÍ JAZYKA (verify_pill_lang.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_pill_lang.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola pilulek probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]) if not passed else '')

# Záložka životní runy je od 2026-09-11 pro VŠECHNY, i nepřihlášené. Do té doby tam byla
# slepá ulička: návštěvník vyplnil datum, zmáčkl „REVEAL MY LIFE RUNE" a vrátila se mu
# tatáž brána. Kontrola drží i druhou křehkou věc — nabídka za kredity se návštěvníkovi
# skrývá stylem na prvku, takže se přihlášenému musí VRÁTIT.
print('\n' + chr(0x3263) + ' ŽIVOTNÍ RUNA PRO VŠECHNY (verify_liferune_states.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_liferune_states.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola zivotni runy probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]) if not passed else '')

# Aspekt obrazu jde do TÉŽE řádky promptu jako klíč runy (`focus:` / `áhersla:`). Když se
# rozejdou, dostane model dvě verze téže stránky runy — tak vznikl Perthův „focus: hidden
# things" a z něj „the thing whose meaning waits sealed". Pravidlo dosud hlídala jen paměť.
print('\n' + chr(0x3264) + ' ASPEKT OBRAZU vs KLÍČ RUNY (verify_image_aspect_key.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_image_aspect_key.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola aspektu probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]))

# Otázka od uživatele je text, ne instrukce. Do 2026-09-12 uvozovka v otázce ukončila úsek
# v instrukci single čtení a zbytek stál v promptu volně (ověřeno protlačením). Kontrola hlídá
# všech šest cest, kudy otázka teče, a že normální otázka projde beze změny.
print('\n' + chr(0x3265) + ' OTÁZKA NEPŘEPÍŠE INSTRUKCI (verify_question_injection.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_question_injection.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola otazky probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]) if not passed else '')

# Měsíc narození v životní runě = starý islandský kalendář, ne gregoriánský měsíc. Do 2026-09-12
# dostal owner (4. 7.) „Heyannir"; správně Sólmánuður. Kontrola projde 1900–2100 proti oknům
# z pramenů (Almanak HÍ) a protlačí výsledek produkčním builderem až do promptu.
print('\n' + chr(0x3266) + ' MĚSÍC NAROZENÍ = ISLANDSKÝ KALENDÁŘ (verify_icelandic_calendar.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_icelandic_calendar.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola kalendare probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]) if not passed else '')

# SW precache musí nést všechno, co reader načítá, a instalovat s obchvatem HTTP cache.
# 2026-09-14: cache runar-v398 nesla starý popup (7 souborů mimo precache + addAll přes HTTP cache).
print('\n' + chr(0x3267) + ' SW PRECACHE ÚPLNÁ A ČERSTVÁ (verify_sw_shell.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_sw_shell.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola precache probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]) if not passed else '')

# Úhel [6] (seeker v obraze) se nesmí vylosovat s koncem open[1] (kde seeker stojí v obraze)
# — týž tah dvakrát (handoff CODE-read 2026-09-18, bod C). Kontrola losem, ne tvarem kódu.
print('\n' + chr(0x3268) + ' ÚHEL × KONEC SE NEPOTKAJÍ (verify_ending_angle.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_ending_angle.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola vylouceni probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]) if not passed else '')

# Číslo za datem v RUNAR_DECISIONS.md je jednoznačný klíč. Pravidlo v hlavičce docu nestačilo:
# 2026-09-23 vznikly za den tři kolize ((6)/(7), (12), (15)) a odkazy ukazovaly na různé záznamy.
print('\n' + chr(0x3269) + ' ČÍSLA V DECISIONS JEDNOZNAČNÁ (verify_decisions_numbers.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_decisions_numbers.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola cisel probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]) if not passed else '')

# Seznam adminů je natvrdo v configu klienta i v každé admin edge funkci (ty config načíst nemůžou).
# 2026-09-23 přibyla sedmá kopie (gpt-review, zrušen 2026-10-09) — shodu dřív nehlídalo nic.
print('\n' + chr(0x326A) + ' SEZNAM ADMINŮ VŠUDE STEJNÝ (verify_admin_emails.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_admin_emails.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola adminu probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]) if not passed else '')

# Výpis featur tierů (panel účtu + nápověda) se od 2026-09-26 SKLÁDÁ z nastavení (TIER_FEATURES v runar-config.js).
# KUKY: „abychom to pořád nemuseli dělat manuálně“ — ruční kopie zastaraly (Yggdrasil jako výhoda Premium, Ask chyběl).
print('\n' + chr(0x326B) + ' FEATURY TIERŮ Z NASTAVENÍ (verify_tier_features.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_tier_features.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola featur tieru probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]) if not passed else '')

# Mapy pák (AREAS → _domainContext, SEEKS → _registerContext) jsou indexované POŘADÍM: přeskládaný seznam dá každému čtení
# cizí instrukci a nic nespadne. Test existoval od 2026-08-16, ale ve smoke nebyl a od 2026-09-08 tiše padal (kotva SEEKS
# = jméno rejstříku, které se tehdy záměrně odebralo). 2026-09-26 kotva = význam věty a test zapojen (BACKLOG, úklid).
print('\n' + chr(0x326C) + ' MAPY PÁK PODLE POŘADÍ (utils/test_lever_maps.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'utils', 'test_lever_maps.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola map pak probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]) if not passed else '')

# §5 v deníku: runy spreadu ze short_text se vykreslí jako kameny z runeSvg, ne jako znaky písma (a Blank nikdy „○“).
# Do 2026-09-27 to deník dělal textem a nic to nehlídalo (KUKY „jeď bod 4, deník spready glyfy“).
print('\n' + chr(0x326D) + ' DENÍK: RUNY SPREADU JAKO KAMENY (verify_journal_glyphs.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_journal_glyphs.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola deniku probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]) if not passed else '')

# Cena čtení: jeden výpočet (MODEL_PRICES v config + readingCostUsd v utils) pro deník, report i stats.js; admin ji vidí u každého
# čtení i Asku, běžný uživatel ne (KUKY 2026-09-29 „ať přesně vidíme každé čtení“).
print('\n' + chr(0x326E) + ' CENA ČTENÍ (verify_reading_cost.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_reading_cost.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola ceny probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]) if not passed else '')

# Texty Kolekce: popis tvaru vedle glyfu + 4 odstavce textu runy — protlačené produkční openCollDetail v obou jazycích
# (KUKY 2026-09-30 bod 5: „dáme popis do rune collection přesně vedle toho velkého glyfu“). Klíč v datech nestačí (§19.3).
print('\n' + chr(0x326F) + ' TEXTY KOLEKCE (verify_coll_shape.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_coll_shape.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola textu kolekce probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]) if not passed else '')

# Zamčený Ask + pády jmen tarifů v IS větách (KUKY 2026-09-30: „Standard má druhou, kterou Premium odemyká“; IS „með Vegfarandi“
# = 1. pád po předložce, is-grammar-qa to nevidí). Stavy tarifů protlačené produkčními funkcemi.
print('\n' + chr(0x3270) + ' ZAMCENY ASK A PADY TARIFU (verify_ask_teaser.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_ask_teaser.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola zamceneho Asku probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]) if not passed else '')

# Myšlenka ✦ na konec čtení (KUKY 2026-09-30 „nasaď to“, „myšlenka je bez hlasu“): tarif, druh čtení, zdrojová runa, oddělení
# od textu čtení (a tím od hlasu) — produkční funkce z runar-reading.js a runar-character.js.
print('\n' + chr(0x3271) + ' MYSLENKA NA KONEC CTENI (verify_thought.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_thought.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola myslenky probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]) if not passed else '')

# Obraz podle oblasti (KUKY 2026-10-03 „obraz vybírat podle oblasti, jeď“): zvolená oblast vyřadí obrazy, které patří jen do
# jiných oblastí (11. sloupec RUNE_IMAGES) — výsledek produkční cestou (single i Norny), EN i IS štítek, bez oblasti beze změny.
print('\n' + chr(0x3272) + ' OBRAZ PODLE OBLASTI (verify_image_area.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_image_area.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola obrazu podle oblasti probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]) if not passed else '')

# Strom (lab, CODE-tree 2026-10-03): kazda vetev z jineho mista + nic neklikatelneho + nejvys 15 pramenu. KUKY: "nechci, aby
# vyrustaly dve nebo vice vetvi ze stejneho mista — tohle resim od samoho zacatku" · "na strome nema byt nic, co sam uzivatel
# nevytvoril". Pred opravou 19 dvojic ramen pod 10 px a 55 neklikatelnych tahu; hlidal to jen owner okem.
print('\n' + chr(0x3273) + ' STROM (lab): MISTA VETVI, KLIKATELNOST, INSPEKCE (verify_tree_mista.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_tree_mista.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola mist vetvi probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]) if not passed else '')

# ㊶ 2026-10-11 (CODE-tree, port stromu do aplikace): strom v aplikaci = kód labu (build_tree_production.py bere skript labu doslova).
# Změna labu bez nového výstupu by produkci tiše nechala na staré verzi — owner by na svých čteních viděl jiný strom než v labu.
print('\n' + chr(0x32B6) + ' STROM V APLIKACI = LAB (verify_tree_prod_sync.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_tree_prod_sync.js')],
                   capture_output=True, text=True, encoding='utf-8')
radky = [l for l in (r.stdout + r.stderr).strip().split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola stromu v aplikaci probehla'
check(prvni.strip(), r.returncode == 0, '\n'.join(radky[:-1]) if r.returncode != 0 else '')

# ㊷ 2026-10-11 (CODE-tree; owner: „neukážou se runy. je potřeba, abys to celé prošel, že to funguje“): rituál založení stromu klik po
# kliku skutečnou appkou — tah zakládacích Noren byl bez run a nic to nehlásilo. Proxy i DB podvržené jen v prohlížeči testu.
print('\n' + chr(0x32B7) + ' ZALOŽENÍ STROMU KLIK PO KLIKU (verify_zalozeni_stromu.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_zalozeni_stromu.js')],
                   capture_output=True, text=True, encoding='utf-8')
radky = [l for l in (r.stdout + r.stderr).strip().split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola zalozeni probehla'
check(prvni.strip(), r.returncode == 0, '\n'.join(radky[:-1]) if r.returncode != 0 else '')

# ㊸ 2026-10-11 (CODE-tune; owner: „jo varianta 7 … ok udělej“): hlas patří ke čtení — jednou ke každému čtení, hlídá ho server a uložený
# hlas se v deníku pouští znovu. Do té doby proxy přečetla jakýkoli text a „jedno čtení = jeden hlas“ hlídalo jen tlačítko (DECISIONS 2026-10-11 (61)).
print('\n' + chr(0x32B8) + ' HLAS PATŘÍ KE ČTENÍ (verify_hlas_ke_cteni.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_hlas_ke_cteni.js')],
                   capture_output=True, text=True, encoding='utf-8')
radky = [l for l in (r.stdout + r.stderr).strip().split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola hlasu probehla'
check(prvni.strip(), r.returncode == 0, '\n'.join(radky[:-1]) if r.returncode != 0 else '')

# ㊹ 2026-10-11 (CODE-tune): hlas v appce klik po kliku — co appka pošle serveru hlasu (uložené čtení id, neuložené podpis, jazyk na
# obrazovce, deník, menu). Vazba hlasu na čtení se 2026-08-03 vracela do hodiny, protože ji nikdo neproklikal (DECISIONS 2026-08-03 „#2b VRÁCENO“).
print('\n' + chr(0x32B9) + ' HLAS V APPCE KLIK PO KLIKU (verify_hlas_appka.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_hlas_appka.js')],
                   capture_output=True, text=True, encoding='utf-8')
radky = [l for l in (r.stdout + r.stderr).strip().split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola hlasu v appce probehla'
check(prvni.strip(), r.returncode == 0, '\n'.join(radky[:-1]) if r.returncode != 0 else '')

# ㊺ 2026-10-11 (CODE-tune; owner: „pop up… poprvé… viditelně se tam musí nějakým hezkým efektem zasunout, zajet“): okno „Where to start“
# skutečnou appkou — jednou, EN i IS, let do „How a reading works“ na telefonu i počítači, tlačítko do Kolekce, bez animací. První verze
# let neměla (popisek uprostřed obrazovky = tam, kde stojí okno), proto se let MĚŘÍ. DECISIONS 2026-10-11 (65).
print('\n' + chr(0x32BA) + ' OKNO WHERE TO START (verify_wts.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_wts.js')],
                   capture_output=True, text=True, encoding='utf-8')
radky = [l for l in (r.stdout + r.stderr).strip().split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola okna where to start probehla'
check(prvni.strip(), r.returncode == 0, '\n'.join(radky[:-1]) if r.returncode != 0 else '')

# ㊻ 2026-10-11 (CODE-tune; nalezl CODE-tree, owner „jeď ty tři chyby“): datum v deníku a ve stromě islandsky i v prohlížeči bez
# islandských dat — Chrome na Windows je nemá a deník psal „May 21, 2026“. Jeden pomocník datumUI (runar-utils.js); kontrola tvrdí
# výsledek produkčním deníkem a stromem, zdroj (jinde 'is-IS' nesmí) a skutečný Chrome bez okna. DECISIONS 2026-10-11 (67).
print('\n' + chr(0x32BB) + ' DATUM V JAZYCE UŽIVATELE (verify_datum_ui.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_datum_ui.js')],
                   capture_output=True, text=True, encoding='utf-8')
r2 = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_datum_ui.js'), '--test'],
                    capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0 and r2.returncode == 0
radky = [l for l in (r2.stdout + r.stdout + r.stderr + r2.stderr).strip().split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola data probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]) if not passed else '')

# ㊼ 2026-10-11 (CODE-tune; owner „jeď ty tři chyby“, BACKLOG 2026-10-09): hlášení nese verzi kódu, který v okně BĚŽÍ (v2/runar-verze.js,
# píše ho hooks/pre-commit.py), a nasazenou, když se liší — hlášení 24c6c548 neslo nasazenou v564, okno jelo na starém JS. Skutečný
# service worker ve čtyřech stavech. DECISIONS 2026-10-11 (68).
print('\n' + chr(0x32BC) + ' VERZE V HLÁŠENÍ (verify_verze_hlaseni.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_verze_hlaseni.js')],
                   capture_output=True, text=True, encoding='utf-8')
radky = [l for l in (r.stdout + r.stderr).strip().split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola verze v hlaseni probehla'
check(prvni.strip(), r.returncode == 0, '\n'.join(radky[:-1]) if r.returncode != 0 else '')

# ㉴ Štítek modelu v UI = model v edge funkci (CODE-tune 2026-10-05). KUKY (report 2026-10-05 07:40): „Pokud jsi změnil model
# na sol6.1, proč jsi to taky neupravil… Tady v readeru. Což znamená, že nevíš, kde co je.“ Proxy běžela na gpt-6.1-sol, přepínač
# admina hlásil „GPT-6 sol“ — dvě místa (edge funkce × překlady), která nikdo nehlídal.
print('\n' + chr(0x3274) + ' STITEK MODELU = MODEL V PROXY (verify_model_labels.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_model_labels.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola stitku modelu probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]) if not passed else '')

# ㉵ Databáze čtení v shrine (CODE-tune 2026-10-05, KUKY: „vyberu runu a obraz a uvidím všechna čtení toho obrazu“). Smyšlená
# čtení (repo je veřejné): obraz EN+IS = jeden řádek přehledu, výběr obrazu, poznámky a ✦ Keep, filtry. Mutace párování IS → FAIL.
print('\n' + chr(0x3275) + ' DATABAZE CTENI V SHRINE (verify_readings_db.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_readings_db.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola databaze cteni probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]) if not passed else '')

# ㉶ Výběr obrazu pro admina (CODE-tune 2026-10-06, KUKY „přidej výběr obrazu pro admina“): admin vybere runě obraz (a význam)
# a ten drží i mimo sezónu a oblast, single i spread; sáček obrazů runy se nečerpá; ne-admin volbu nemá; prompt_draws nese pin.
print('\n' + chr(0x3276) + ' VYBER OBRAZU PRO ADMINA (verify_image_pin.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_image_pin.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola vyberu obrazu probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]) if not passed else '')

# ㉷ Monitor ozvěn (CODE-tune 2026-10-06, KUKY „potřebuju, aby se to vyhodnocovalo… zapisovat do tabulky“): co z promptu se vrací
# doslova ve výstupu. Smoke pouští jen samotest na smyšlených čteních (bez databáze) — monitor musí známé ozvěny poznat.
print('\n' + chr(0x3277) + ' MONITOR OZVEN (monitor_ozveny.js --test)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'monitor_ozveny.js'), '--test'],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola monitoru ozven probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]) if not passed else '')

# ㉸ Text natvrdo podle jazyka (CODE-read 2026-10-09, kontrola architektury — DECISIONS 2026-10-09 (15)): §10 zakazuje text
# v logice, ale `lang === 'is' ? '…' : '…'` kontrola ② nevidí a v2/ jich měl 44 (první počet 57 bral i výběr jazyka).
# Ráčna: počet na soubor nesmí stoupnout.
print('\n' + chr(0x3278) + ' TEXT NATVRDO PODLE JAZYKA (verify_lang_ternary.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_lang_ternary.js')],
                   capture_output=True, text=True, encoding='utf-8')
r2 = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_lang_ternary.js'), '--test'],
                    capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0 and r2.returncode == 0
output = (r2.stdout + r.stdout + r.stderr + r2.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola textu natvrdo probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]) if not passed else '')

# ㉹ Jazyk komunikace (CODE-tune 2026-10-10, KUKY „komunikace všude veřejně a pro adminy bude IS a EN… tohle už nechci řešit“,
# CLAUDE.md §31): v textu pro uživatele, admina nebo model není čeština. Při zavedení našla české admin záložky shrine
# a českou glosu kořene Óðinn v promptu rozboru jména.
print('\n' + chr(0x3279) + ' JAZYK KOMUNIKACE (verify_jazyk_ui.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_jazyk_ui.js')],
                   capture_output=True, text=True, encoding='utf-8')
r2 = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_jazyk_ui.js'), '--test'],
                    capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0 and r2.returncode == 0
output = (r2.stdout + r.stdout + r.stderr + r2.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola jazyka komunikace probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]) if not passed else '')

# ㉺ Odkazy z kódu na dokumenty (CODE-read 2026-10-10, kontrola architektury — owner „jak jsi našel README… pozor na to“):
# ⑯ hlídá odkazy jen v dokumentech; hlavička runar-reporter.js odkazovala na spec, který nikdy neexistoval, a nic to nechytilo.
print('\n' + chr(0x327A) + ' ODKAZY Z KÓDU NA DOKUMENTY (verify_code_doc_refs.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_code_doc_refs.js')],
                   capture_output=True, text=True, encoding='utf-8')
r2 = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_code_doc_refs.js'), '--test'],
                    capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0 and r2.returncode == 0
output = (r2.stdout + r.stdout + r.stderr + r2.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola odkazu z kodu probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]) if not passed else '')

# ㉽ Mrtvé klíče UI_TEXT (CODE-read 2026-10-10, kontrola architektury): check-translations hlídá jen shodu EN×IS, ne to, jestli
# klíč někdo čte. Při zavedení 35 mrtvých v obou jazycích (editor charakteru, starý formulář, „3 readings“…) — ráčna podle jmen.
print('\n' + chr(0x327D) + ' MRTVÉ KLÍČE UI_TEXT (verify_ui_text_used.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_ui_text_used.js')],
                   capture_output=True, text=True, encoding='utf-8')
r2 = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_ui_text_used.js'), '--test'],
                    capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0 and r2.returncode == 0
output = (r2.stdout + r.stdout + r.stderr + r2.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola mrtvych klicu probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]) if not passed else '')

# ㉾ Odhlášení z analýzy (CODE-read 2026-10-10, kontrola architektury část 31): zásady slibují, že čtení odhlášených se do
# analýzy nedostanou; 11 skriptů četlo readings napřímo a filtr nemělo. Čtení pro analýzu jdou přes scripts/utils/cteni_analyza.sql.
print('\n' + chr(0x327E) + ' ODHLÁŠENÍ Z ANALÝZY VE SKRIPTECH (verify_opt_out.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_opt_out.js')],
                   capture_output=True, text=True, encoding='utf-8')
r2 = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_opt_out.js'), '--test'],
                    capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0 and r2.returncode == 0
output = (r2.stdout + r.stdout + r.stderr + r2.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola odhlaseni z analyzy probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]) if not passed else '')

# ㉿ Kořen repa z RUNAR_ROOT (CODE-read 2026-10-10, BACKLOG část 37): pre-push pouští smoke v čisté kopii pushovaného commitu;
# skript s pevnou cestou k repu by tam tiše kontroloval sdílený strom (s cizí rozdělanou prací) a oprava by byla jen na oko.
print('\n' + chr(0x327F) + ' KOŘEN REPA Z RUNAR_ROOT (verify_runar_root.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_runar_root.js')],
                   capture_output=True, text=True, encoding='utf-8')
r2 = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_runar_root.js'), '--test'],
                    capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0 and r2.returncode == 0
output = (r2.stdout + r.stdout + r.stderr + r2.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola korene repa probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]) if not passed else '')

# ㉻ Runy písmem (CODE-tune 2026-10-10, KUKY bod 11 „nahradit našimi glyfy“; §5): klíče UI_TEXT s runou na začátku jen přes
# setRuneText a stránky readeru bez run písmem (kromě ᚱ). Při zavedení našla i ᛜ na stránce soukromí, kterou nikdo nehlásil.
print('\n' + chr(0x327B) + ' RUNY PÍSMEM (verify_rune_glyphs.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_rune_glyphs.js')],
                   capture_output=True, text=True, encoding='utf-8')
r2 = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_rune_glyphs.js'), '--test'],
                    capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0 and r2.returncode == 0
output = (r2.stdout + r.stdout + r.stderr + r2.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola run pismem probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]) if not passed else '')

# ㉼ Základ produkce (CODE-tune 2026-10-10, KUKY „nikdy do produkce nebudeš sahat tak, že z ní odstraníš to, co je její základ…
# tohle si budeš kontrolovat“; CLAUDE.md §32): skutečný prohlížeč bez okna, appka jako návštěvník i simulovaný přihlášený, všechny
# stavy. Na commitu 2a3f03b našla 10 vad (Norny skryté, Rúnarova fotka po návratu do Spá) — tam, kde je owner našel v produkci.
print('\n' + chr(0x327C) + ' ZÁKLAD PRODUKCE (verify_zaklad_produkce.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_zaklad_produkce.js')],
                   capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0
output = (r.stdout + r.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola zakladu produkce probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]) if not passed else '')

# ㊱ Kontrola IS na jednom místě (CODE-tune 2026-10-11, KUKY „proč je těch míst několik? má být jedno. pro všechno, to má být
# jednodušší na opravu po nějaké změně“): výčet nástrojů kontroly IS a jejich pořadí smí stát jen v CLAUDE.md §2, jinde odkaz.
# Při zavedení našla 7 kopií mimo §2 (paměti, katalog nástrojů, Prófsteinn, komentář v check-is) — po zániku Yfirlestur zastaraly.
print('\n' + chr(0x32B1) + ' KONTROLA IS NA JEDNOM MÍSTĚ (verify_is_kontrola_jedno_misto.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_is_kontrola_jedno_misto.js')],
                   capture_output=True, text=True, encoding='utf-8')
r2 = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_is_kontrola_jedno_misto.js'), '--test'],
                    capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0 and r2.returncode == 0
output = (r2.stdout + r.stdout + r.stderr + r2.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola IS na jednom miste probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]) if not passed else '')

# ㊲ Kopie textů stránek (CODE-read 2026-10-11, kolo 2 / 8; zapojil CODE-tune na ownerovo „6. ano“): nápověda a zásady drží
# angličtinu dvakrát — statické HTML (záloha, než naběhne JS) a slovník v JS. Pravidlo „měnit obojí“ stálo jen v komentáři (§30);
# při zavedení našla nadpis „Online purchase“ rozešlý od 2026-05-20 (sjednocen v témže commitu).
print('\n' + chr(0x32B2) + ' KOPIE TEXTŮ STRÁNEK (verify_page_copies.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_page_copies.js')],
                   capture_output=True, text=True, encoding='utf-8')
r2 = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_page_copies.js'), '--test'],
                    capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0 and r2.returncode == 0
output = (r2.stdout + r.stdout + r.stderr + r2.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola kopii textu stranek probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]) if not passed else '')

# ㊳ Importy edge funkcí s přesnou verzí (CODE-tune 2026-10-11, nález CODE-read kolo 2 / 9; owner „8. připrav a pak nasaď“): všech 10
# funkcí bralo plovoucí `esm.sh/@supabase/supabase-js@2` — každé nasazení jiná knihovna a cizí CDN v cestě. Připnuto na npm: x.y.z.
print('\n' + chr(0x32B3) + ' IMPORTY EDGE FUNKCÍ S PŘESNOU VERZÍ (verify_edge_imports.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_edge_imports.js')],
                   capture_output=True, text=True, encoding='utf-8')
r2 = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_edge_imports.js'), '--test'],
                    capture_output=True, text=True, encoding='utf-8')
passed = r.returncode == 0 and r2.returncode == 0
output = (r2.stdout + r.stdout + r.stderr + r2.stderr).strip()
radky = [l for l in output.split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola importu edge funkci probehla'
check(prvni.strip(), passed, '\n'.join(radky[:-1]) if not passed else '')

# ㊴ Pravidla při dotyku (CODE-read 2026-10-11; KUKY „žádná session nekontroluje, jestli to pravidlo existuje… ať je automaticky čtou,
# jakmile se jich dotknou“): mapa scripts/utils/pravidla_mapa.json nesmí ukazovat do prázdna (sloučené §, přejmenovaný nadpis, mrtvá
# paměť) a hook pravidla_pri_dotyku.py musí projít samotestem. DECISIONS 2026-10-11 (17).
print('\n' + chr(0x32B4) + ' PRAVIDLA PŘI DOTYKU — MAPA A HOOK (verify_pravidla_mapa.js)')
r = subprocess.run(['node', os.path.join(ROOT, 'scripts', 'verify_pravidla_mapa.js')],
                   capture_output=True, text=True, encoding='utf-8')
radky = [l for l in (r.stdout + r.stderr).strip().split('\n') if l.strip()]
prvni = radky[-1] if radky else 'kontrola mapy pravidel probehla'
check(prvni.strip(), r.returncode == 0, '\n'.join(radky[:-1]) if r.returncode != 0 else '')

# ㊵ 2026-10-11 (CODE-read, kolo 3 kontroly): kontroly samy pod útokem — podstrčená chyba v čisté kopii musí kontrolu shodit.
# Běží jen útoky na kontroly změněné od posledního úspěchu (cache ve společném .git), jinak ~1 s. Proč → hlavička nástroje.
print('\n' + chr(0x32B5) + ' PROTIPŘÍKLADY — KONTROLY POD ÚTOKEM (scripts/protipriklady.py)')
r = subprocess.run([sys.executable, '-X', 'utf8', os.path.join(ROOT, 'scripts', 'protipriklady.py')],
                   capture_output=True, text=True, encoding='utf-8')
radky = [l for l in (r.stdout + r.stderr).strip().split('\n') if l.strip()]
prvni = radky[-1] if radky else 'protipriklady probehly'
check(prvni.strip(), r.returncode == 0, '\n'.join(radky[:-1]) if r.returncode != 0 else '')

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
