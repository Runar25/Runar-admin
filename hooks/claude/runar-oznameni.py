# -*- coding: utf-8 -*-
# UserPromptSubmit: OZNÁMENÍ ZMĚN SYSTÉMU od jiných session.
#
# PROČ (owner 2026-11-26 po stavbě karty a knihy selhání: „ostatní session o tom vždy také musí vědět, pokud dochází k těmto úpravám“):
#   Session pracují souběžně nad JEDNÍM pracovním stromem. Když jedna změní pravidla, hooky nebo paměť, ostatní se to dozvěděly jen při
#   startu nebo compactu (karta ukazuje nadpisy DECISIONS) — běžící session jela dál podle starého. Zpráva přes SendMessage závisí na
#   tom, jestli si na ni session vzpomene a jestli příjemce běží (2026-11-25 Runar-tune nedosažitelná).
#   Proto to dělá stroj: při každé zprávě ownera hook porovná HEAD s tím, co session už viděla, a vypíše commity cizích lane do
#   systémových cest + nové nadpisy v RUNAR_DECISIONS.md. Zdroj je `git log` (stav vlastní git, §20) — žádný zvláštní seznam oznámení.
#
# Viděno: ~/.claude/runar-lane/<session>.videno (hash HEAD). Bez něj (session běží od dřív) se bere čas startu session (vznik přepisu).
# Vlastní lane (z ~/.claude/runar-lane/<session>.txt, píše karta runar-context.py) se vynechá — své změny session zná.
# Hook nesmí spadnout ani zdržet: cokoli selže → prázdný výstup.
import io, json, os, subprocess, sys, datetime

REPO = os.environ.get('RUNAR_ROOT') or r'C:\Users\zkuku\Downloads\Runar-admin'
LANE_DIR = os.environ.get('RUNAR_LANE_DIR') or os.path.join(os.path.expanduser('~'), '.claude', 'runar-lane')
STROP = 3000
# Co je „systém“: pravidla, hooky, paměť, mapa pravidel, nástroje commitu, slovník slov a zdrojů pro model, rozhodnutí.
SYSTEM = ['CLAUDE.md', 'hooks', 'memory', 'RUNAR_DECISIONS.md', 'scripts/utils/pravidla_mapa.json', 'scripts/utils/pravidla_pri_dotyku.py',
          'scripts/utils/commit_vlastni.py', 'docs/kostra/slova.json', 'docs/kostra/kostra.json', 'docs/projekt-mapa.md']


def git(*a):
    r = subprocess.run(['git'] + list(a), cwd=REPO, capture_output=True, text=True, encoding='utf-8', timeout=6)
    return r.stdout if r.returncode == 0 else ''


def cti(p):
    try:
        return io.open(p, encoding='utf-8').read().strip() or None
    except Exception:
        return None


def zapis(p, t):
    try:
        os.makedirs(os.path.dirname(p), exist_ok=True)
        io.open(p, 'w', encoding='utf-8').write(t)
    except Exception:
        pass


def oznameni(hook):
    sid = str(hook.get('session_id') or '').replace('/', '_').replace('\\', '_')
    if not sid:
        return ''
    head = git('rev-parse', 'HEAD').strip()
    if not head:
        return ''
    videno_p = os.path.join(LANE_DIR, sid + '.videno')
    videno = cti(videno_p)
    if videno == head:
        return ''
    if videno and git('cat-file', '-t', videno).strip() == 'commit':
        rozsah = [videno + '..' + head]
    else:
        tp = hook.get('transcript_path')
        try:
            start = datetime.datetime.fromtimestamp(os.path.getctime(tp)).isoformat(timespec='seconds') if tp and os.path.isfile(tp) else None
        except Exception:
            start = None
        if not start:
            zapis(videno_p, head)
            return ''
        rozsah = ['--since=' + start, head]
    lane = cti(os.path.join(LANE_DIR, sid + '.txt'))
    radky = []
    for l in git('log', '--no-merges', '--format=%h\t%an\t%ad\t%s', '--date=short', *rozsah, '--', *SYSTEM).splitlines():
        h, an, ad, s = (l.split('\t') + ['', '', '', ''])[:4]
        if lane and an == lane:
            continue
        radky.append('  ' + ad + ' ' + h + ' ' + an + ': ' + (s if len(s) <= 150 else s[:147] + '…'))
    roz = []
    if radky:
        diff = git('log', '--no-merges', '-p', '--format=', *rozsah, '--', 'RUNAR_DECISIONS.md')
        roz = [x[4:].strip() for x in diff.splitlines() if x.startswith('+## ')]
    zapis(videno_p, head)
    if not radky:
        return ''
    t = ('⚠️ ZMĚNA SYSTÉMU od jiné session (od tvého posledního pohledu) — platí i pro tebe:\n' + '\n'.join(radky[:15])
         + ('\n  …a dalších ' + str(len(radky) - 15) if len(radky) > 15 else ''))
    if roz:
        t += '\nNOVÁ ROZHODNUTÍ v RUNAR_DECISIONS.md:\n' + '\n'.join('  - ' + (x if len(x) <= 160 else x[:157] + '…') for x in roz[:8])
    t += ('\nNež budeš pokračovat: přečti, co se tě týká (`git show --stat <hash>`, záznam v DECISIONS). Mění-li to tvou rozdělanou práci'
          ' nebo to, co jsi ownerovi slíbil, řekni mu to.')
    return t if len(t) <= STROP else t[:STROP - 20] + '\n…(zkráceno)'


def main():
    try:
        raw = sys.stdin.read() if not sys.stdin.isatty() else ''
        hook = json.loads(raw) if raw.strip() else {}
        t = oznameni(hook)
    except Exception:
        t = ''
    if t:
        sys.stdout.write(json.dumps({'hookSpecificOutput': {'hookEventName': 'UserPromptSubmit', 'additionalContext': t}}, ensure_ascii=False))


if __name__ == '__main__':
    main()
