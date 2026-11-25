# -*- coding: utf-8 -*-
# Zpětné dohledání běhů pokusů přes API z přepisů konverzací → docs/kostra/behy-zpetne.json.
#
# Proč (2026-11-25, CODE-read; owner: „jak vyřešíš, že máš zapsané, kdy jsi to dělal? dohledáš to zpětně?“): do 2026-11-25 záznam běhu
# nikdo nepsal — log ~/.claude/runar-api-pokusy.log je mimo repo, od 11-24 má číslo pokusu, ale řetězené příkazy zapsal jen prvním pokusem
# (P10, P20 chybí) a mezi pokusy jsou testy hlídače. Od 2026-11-25 píše záznam každého běhu hlídač API sám (docs/kostra/behy/); tohle
# je jednorázové doplnění minulosti ze skutečně puštěných příkazů v přepisech (CODE session na tomhle disku).
# Přiřazení k pokusu: RUNAR_POKUS v příkazu; jinak podle složky pokusu (pokusy.json „slozka“) v cestě skriptu nebo úlohy; jinak „—“.
# Příkaz, který hook zamítl (výsledek nástroje = chyba hooku), se nepočítá. Texty čtení ani výstupy se nečtou — jen příkazy.
#   python -X utf8 scripts/utils/behy_zpetne.py          přepíše docs/kostra/behy-zpetne.json a vypíše souhrn
import glob, io, json, os, re, sys

R = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
H = os.path.expanduser('~')
POKUSY = json.load(io.open(os.path.join(R, 'docs', 'kostra', 'pokusy.json'), encoding='utf-8'))['pokusy']
SLOZKY = sorted([(x['slozka'], x['id']) for x in POKUSY if x.get('slozka')], key=lambda t: -len(t[0]))


def prepisy():
    vid = {}
    for f in glob.glob(os.path.join(H, '.claude', 'projects', '*', '*.jsonl')) + glob.glob(os.path.join(H, '.claude', 'compact-backups', '*.jsonl')):
        sid = os.path.basename(f)[:-6]
        if sid not in vid or os.path.getsize(f) > os.path.getsize(vid[sid]):   # záloha i živý přepis téže session: vezmi větší
            vid[sid] = f
    return vid


def env(seg, jm):
    m = re.search(jm + r'=(?:\\?"((?:[^"\\]|\\.)*?)\\?"|\'([^\']*)\'|(\S+))', seg)
    return ((m.group(1) or m.group(2) or m.group(3) or '') if m else '').strip()


def pokus_pro(seg):
    p = env(seg, 'RUNAR_POKUS')
    if p:
        return p, 'RUNAR_POKUS'
    s = seg.replace('\\\\', '/').replace('\\', '/')
    for sl, pid in SLOZKY:
        if sl in s or ('/' in sl and sl.rsplit('/', 1)[1] in s and len(sl.rsplit('/', 1)[1]) > 12):
            return pid, 'složka'
    return '—', '—'


def main():
    behy, zamitnute = [], 0
    for sid, f in prepisy().items():
        pouzite, chyby = {}, set()
        with io.open(f, 'rb') as fh:
            posl = ''
            for bl in fh:
                i = bl.find(b'"timestamp":"')
                if i >= 0:
                    posl = bl[i + 13:i + 32].decode('ascii', 'replace')   # zálohy a některé řádky nemají vlastní čas → poslední známý
                if b'RUNAR_API_ANO=' not in bl and b'"is_error":true' not in bl:
                    continue
                try:
                    rec = json.loads(bl.decode('utf-8', 'replace'))
                except Exception:
                    continue
                if rec.get('isSidechain'):
                    continue
                for c in ((rec.get('message') or {}).get('content') or []):
                    if not isinstance(c, dict):
                        continue
                    if c.get('type') == 'tool_use' and c.get('name') in ('Bash', 'PowerShell'):
                        cmd = str((c.get('input') or {}).get('command') or '')
                        if 'RUNAR_API_ANO=' in cmd:
                            if re.match(r'\s*(grep|sed|cat|echo|printf|awk|cut|head|tail)\b', cmd):
                                continue   # jen hledání v přepisech nebo textu, nic se nespouští
                            pouzite[c.get('id')] = (rec.get('timestamp') or posl, cmd)
                    elif c.get('type') == 'tool_result' and c.get('is_error'):
                        chyby.add(c.get('tool_use_id'))
        for tid, (cas, cmd) in pouzite.items():
            if tid in chyby:
                zamitnute += 1
                continue
            casti = [m.start() for m in re.finditer(r'RUNAR_API_ANO=', cmd)]
            for i, a in enumerate(casti):
                seg = cmd[max(0, cmd.rfind(';', 0, a) + 1 if i else 0):casti[i + 1] if i + 1 < len(casti) else len(cmd)]
                if 'P999' in seg or 'protipříklad' in seg or 'protipriklad' in seg:
                    continue
                if not re.search(r'\b(node|python3?|curl)\s', seg) or re.search(r'\bgrep\s+-[a-zA-Z]*o', seg):
                    continue   # segment nic nespouští (jen hledá v přepisu nebo text)
                pk, jak = pokus_pro(seg)
                sk = re.search(r'(?:node|python3?)(?:\s+-X\s+\S+)?\s+["\']?([^\s"\';|&]+\.(?:js|py))', seg)
                n = re.search(r'RUNAR_API_ANO=["\']?(\d+)', seg)
                behy.append({'cas': cas[:19].replace('T', ' '), 'pokus': pk, 'prirazeno': jak, 'volani': int(n.group(1)) if n else None,
                             'zamer': env(seg, 'RUNAR_API_ZAMER')[:300], 'skript': (sk.group(1) if sk else '')[-160:], 'session': sid[:8]})
    behy.sort(key=lambda b: b['cas'])
    out = {'_co': ('Běhy pokusů přes API dohledané ZPĚTNĚ z přepisů konverzací (scripts/utils/behy_zpetne.py, 2026-11-25). Jen příkazy, které hook '
                   'pustil; přiřazení: RUNAR_POKUS v příkazu, jinak podle složky pokusu v cestě, jinak „—“ (nepřiřazeno). Od 2026-11-25 píše '
                   'záznam každého běhu hlídač API sám do docs/kostra/behy/. Přepisy starší, než sahají soubory na disku, tu nejsou.'),
           'behy': behy}
    io.open(os.path.join(R, 'docs', 'kostra', 'behy-zpetne.json'), 'w', encoding='utf-8', newline='\n').write(json.dumps(out, ensure_ascii=False, indent=1) + '\n')
    po = {}
    for b in behy:
        po.setdefault(b['pokus'], [0, 0])
        po[b['pokus']][0] += 1
        po[b['pokus']][1] += b['volani'] or 0
    print('běhů', len(behy), '· zamítnutých hookem', zamitnute, '· od', behy[0]['cas'] if behy else '-', 'do', behy[-1]['cas'] if behy else '-')
    for k in sorted(po):
        print('  ', k, po[k][0], 'běhů,', po[k][1], 'volání')


if __name__ == '__main__':
    main()
