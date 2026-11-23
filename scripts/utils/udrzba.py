# -*- coding: utf-8 -*-
# udrzba.py — automatická část měsíční údržby (postup: RUNAR_UDRZBA.md) a záznam, že proběhla.
#
# Proč (2026-11-23, CODE-tune; owner „vypracuj metodiku … třeba 1 za měsíc“): údržba se dělala ve vlnách (kontrola architektury kola 1–3
# v říjnu) a pak šest týdnů nic; první měsíční pokus 2026-11-23 prošel jen provoz. Tenhle skript udělá to, co jde strojem, vypíše oblasti
# A–I k ruční práci a uloží kostru zprávy docs/udrzba/RRRR-MM.md. --hotovo zapíše do ops_events kind „udrzba“ — hlídání provozu
# (BEHY v supabase/functions/_shared/ops_souhrn.ts) po 32 dnech bez záznamu pošle e-mail, ať údržba nevisí na paměti session (§30).
#
#   python -X utf8 scripts/utils/udrzba.py                     automatická část + kostra zprávy (nic nezapisuje do DB)
#   python -X utf8 scripts/utils/udrzba.py --hotovo "<shrnutí>"  záznam „údržba proběhla“ do ops_events
#   python -X utf8 scripts/utils/udrzba.py --neuplna "<co chybí>"  začatá, ne celá → ok:false, ranní souhrn ji ukazuje jako problém
import os, sys, json, subprocess, datetime, io

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DNES = datetime.date.today()


def sql(dotaz):
    """Dotaz do produkční DB (jen čtení i zápis ops_events) přes scripts/utils/pgdump_runar.js — týž přístup jako záloha."""
    js = ("const fs=require('fs'),os=require('os'),path=require('path');const {psql}=require(process.argv[1]);"
          "const url=fs.readFileSync(path.join(os.homedir(),'.claude','runar-db-url.txt'),'utf8').trim();"
          "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{process.stdout.write(String(psql(url,['-X','-At','-F',' | ','-f','-'],"
          "{input:s,stdio:['pipe','pipe','pipe']})))});")
    r = subprocess.run(['node', '-e', js, os.path.join(REPO, 'scripts', 'utils', 'pgdump_runar.js')], input=dotaz,
                       capture_output=True, text=True, encoding='utf-8', timeout=120)
    if r.returncode != 0:
        raise RuntimeError((r.stderr or r.stdout)[:300])
    return [l for l in r.stdout.split('\n') if l.strip()]


def beh(popis, cmd):
    try:
        r = subprocess.run(cmd, cwd=REPO, capture_output=True, text=True, encoding='utf-8', timeout=600)
        radky = [l for l in (r.stdout + r.stderr).split('\n') if l.strip()]
        verdikt = next((l for l in radky if l.lstrip().startswith(('OK', 'FAIL', '❌', '✅'))), radky[0] if radky else '(bez výstupu)')
        return ('OK' if r.returncode == 0 else 'FAIL', popis, verdikt.strip()[:200])
    except Exception as e:
        return ('FAIL', popis, 'nespustilo se: %s' % e)


def hotovo(shrnuti):
    detail = json.dumps({'ok': True, 'souhrn': shrnuti[:300]}, ensure_ascii=False).replace("'", "''")
    sql("insert into public.ops_events (kind, detail) values ('udrzba', '" + detail + "'::jsonb) returning id;")
    print('OK    údržba zapsána do ops_events (udrzba) — připomínka hlídání provozu se vynuluje')


def neuplna(co_chybi):
    # Údržba začatá, ale ne celá: ok:false → ranní souhrn ji ukazuje jako problém, dokud kolo nedoběhne (žádné tiché zelené, §19.2).
    detail = json.dumps({'ok': False, 'chyba': ('neúplná: ' + co_chybi)[:200]}, ensure_ascii=False).replace("'", "''")
    sql("insert into public.ops_events (kind, detail) values ('udrzba', '" + detail + "'::jsonb) returning id;")
    print('OK    neúplná údržba zapsána (ok:false) — hlídání provozu ji ukáže, dokud nepoběží --hotovo')


def main():
    if len(sys.argv) > 2 and sys.argv[1] == '--hotovo':
        return hotovo(sys.argv[2])
    if len(sys.argv) > 2 and sys.argv[1] == '--neuplna':
        return neuplna(sys.argv[2])
    out = ['# Údržba %s' % DNES.strftime('%Y-%m'), '', '*Kostra z `scripts/utils/udrzba.py` %s; postup `RUNAR_UDRZBA.md`.*' % DNES, '']

    # od kdy: poslední záznam údržby, jinak 30 dní
    try:
        posl = sql("select to_char(max(created_at),'YYYY-MM-DD') from ops_events where kind='udrzba';")
        od = posl[0] if posl and posl[0].strip() else (DNES - datetime.timedelta(days=30)).isoformat()
    except Exception as e:
        od = (DNES - datetime.timedelta(days=30)).isoformat()
        out.append('⚠ DB nedostupná (%s) — provoz ručně' % str(e)[:120])
    out += ['## Od minulé údržby (%s)' % od, '']
    log = subprocess.run(['git', 'log', '--since', od, '--format=%an'], cwd=REPO, capture_output=True, text=True, encoding='utf-8').stdout.split('\n')
    pocty = {}
    for a in [x for x in log if x.strip()]:
        pocty[a] = pocty.get(a, 0) + 1
    out.append('Commity: ' + (', '.join('%s %d' % kv for kv in sorted(pocty.items(), key=lambda kv: -kv[1])) or 'žádné'))
    out.append('')

    # A — provoz
    out += ['## A. Provoz (stroj)', '']
    dotazy = [
        ('Upozornění hlídání', "select to_char(created_at,'MM-DD HH24:MI') || '  ' || (detail->>'subject') from ops_events where kind='alert_sent' and created_at > '%s' order by created_at;" % od),
        ('Chyby JS u uživatelů', "select to_char(max(created_at),'MM-DD') || '  ' || count(*) || '×  ' || left(detail->>'msg',90) || '  (' || coalesce(detail->>'src','?') || ')' from ops_events where kind='client_error' and created_at > '%s' group by detail->>'msg', detail->>'src' order by max(created_at);" % od),
        ('Selhání úloh', "select kind || '  ' || count(*) || '×, naposledy ' || to_char(max(created_at),'MM-DD') from ops_events where created_at > '%s' and (kind like '%%fail%%' or detail->>'ok'='false') group by kind;" % od),
        ('Hlášení otevřená bez položky', "select status || ' ' || count(*) from bug_reports where status <> 'fixed' and type <> 'message' and (status='new' or coalesce(notes,'')='') group by status;"),
    ]
    for nadpis, q in dotazy:
        try:
            r = sql(q)
        except Exception as e:
            r = ['⚠ dotaz selhal: %s' % str(e)[:120]]
        out.append('**%s:** %s' % (nadpis, 'nic' if not r else ''))
        out += ['- ' + x for x in r[:25]]
        out.append('')
    ulohy = subprocess.run(['powershell', '-NoProfile', '-Command',
                            "Get-ScheduledTask | ? TaskName -like 'Runar*' | % { $i = $_ | Get-ScheduledTaskInfo; '{0} | posledni {1} | vysledek {2} | zmeskane {3}' -f $_.TaskName, $i.LastRunTime, $i.LastTaskResult, $i.NumberOfMissedRuns }"],
                           capture_output=True, text=True, encoding='utf-8', errors='replace').stdout.strip().split('\n')
    out += ['**Naplánované úlohy Windows:**'] + ['- ' + x.strip() for x in ulohy if x.strip()] + ['']

    # stroje, které jdou rychle
    vysl = [
        beh('nasazené funkce = repo', [sys.executable, '-X', 'utf8', 'scripts/utils/nasazene_vs_repo.py']),
        beh('nedefinovaná jména v appce', ['node', 'scripts/verify_nedefinovane.js']),
        beh('délka docu a strop CLAUDE.md', ['node', 'scripts/verify_doc_length.js']),
        beh('opakování v kánonu', ['node', 'scripts/verify_new_duplicates.js']),
        beh('index paměti', ['node', 'scripts/verify_memory_index.js']),
        beh('odkazy v docích', ['node', 'scripts/verify_doc_links.js']),
        beh('nosiče pravidel', ['node', 'scripts/verify_nosice.js']),
        beh('hooky Claude Code', [sys.executable, '-X', 'utf8', 'scripts/verify_hooky_claude.py']),
        beh('Greynir samotest', [sys.executable, '-X', 'utf8', 'is-greynir.py', '--samotest']),
    ]
    out += ['## Stroje (rychlé)', '']
    for stav, popis, v in vysl:
        out.append('- %s %s — %s' % ('✅' if stav == 'OK' else '❌', popis, v))
    out += ['', 'Dlouhé, pustit na pozadí: `python -X utf8 smoke.py` · `python -X utf8 scripts/protipriklady.py --vse`', '']

    # ruční oblasti
    out += ['## Ruční oblasti (RUNAR_UDRZBA.md „Oblasti a otázky“) — odškrtnout, neprošlé do BACKLOGu', '']
    for o in ['A. Provoz — u každé chyby výš: proč a kdy by ji ohlásil stroj', 'B. Pravidla (CLAUDE.md) — každý §',
              'C. Paměť — každý soubor, skilly, mapa pravidel hooků', 'D. Kanonické docy × kód', 'E. Kontroly a stroje (smoke, útoky --vse)',
              'F. Kód appky v2', 'G. Server (edge funkce, DB, cron)', 'H. Sliby uživateli', 'I. Peníze']:   # čtení se neprochází (owner 2026-11-23)
        out.append('- [ ] ' + o)
    out.append('')

    cil = os.path.join(REPO, 'docs', 'udrzba', DNES.strftime('%Y-%m') + '.md')
    os.makedirs(os.path.dirname(cil), exist_ok=True)
    if os.path.exists(cil):
        cil = cil[:-3] + '-' + DNES.strftime('%d') + '.md'
    io.open(cil, 'w', encoding='utf-8', newline='\n').write('\n'.join(out))
    for stav, popis, v in vysl:
        print('%-5s %s — %s' % (stav, popis, v[:120]))
    print('\nKostra zprávy: ' + os.path.relpath(cil, REPO).replace('\\', '/'))


if __name__ == '__main__':
    main()
