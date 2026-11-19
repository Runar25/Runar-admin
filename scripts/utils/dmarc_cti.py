# -*- coding: utf-8 -*-
# dmarc_cti.py — přečte souhrnná hlášení DMARC (zip / gz / xml), která Google posílá do runar@ (rua v `_dmarc`), a řekne, jestli pošta
# s odesílatelem therunekeeper.com prošla ověřením. CODE-web 2026-11-19 (owner: „budeš se starat o email“, denní úloha runar-schranka,
# postup `scripts/ulohy/schranka.md`).
#
# Proč: hlášení chodí denně a člověk je nečte; neprojde-li DKIM i SPF (špatný záznam DNS po přesunu, cizí služba posílá naším jménem,
# podvržená pošta), přihlašovací kódy a souhrny provozu začnou padat do spamu nebo karantény (`p=quarantine`) a nikdo to nepozná.
# Soubor je nedůvěryhodný vstup (příloha z pošty): jen standardní parser XML, nic se nespouští, velikost je omezená.
#
#   python -X utf8 -I scripts/utils/dmarc_cti.py <hlášení> [<hlášení> …]
# Poslední řádek: „DMARC OK: …“, nebo „POZOR: …“ (výstup s POZOR → bod pro ownera). Exit 1 jen při nečitelném souboru.
import sys, zipfile, gzip, io, datetime
import xml.etree.ElementTree as ET

MAX = 20 * 1024 * 1024   # hlášení mají stovky bajtů až kilobajty; víc = podezřelý soubor


def xml_z(cesta):
    data = open(cesta, 'rb').read(MAX + 1)
    if len(data) > MAX:
        raise ValueError('soubor je větší než 20 MB')
    if data[:2] == b'PK':
        z = zipfile.ZipFile(io.BytesIO(data))
        info = z.infolist()[0]
        if info.file_size > MAX:
            raise ValueError('rozbalené XML je větší než 20 MB')
        return z.read(info)
    if data[:2] == b'\x1f\x8b':
        return gzip.GzipFile(fileobj=io.BytesIO(data)).read(MAX + 1)[:MAX]
    return data


def cas(s):
    try:
        return datetime.datetime.fromtimestamp(int(s), datetime.timezone.utc).strftime('%Y-%m-%d %H:%M')
    except (TypeError, ValueError):
        return '?'


def main(cesty):
    zprav = neproslo = 0
    spatne = []
    for cesta in cesty:
        try:
            k = ET.fromstring(xml_z(cesta))
        except Exception as e:
            print('NEČITELNÉ:', cesta, '—', str(e)[:120])
            return 1
        t = lambda e, p: (e.findtext(p) or '').strip()
        print('hlášení', t(k, 'report_metadata/org_name'), cas(t(k, 'report_metadata/date_range/begin')), '→',
              cas(t(k, 'report_metadata/date_range/end')), 'UTC · politika p=' + t(k, 'policy_published/p'))
        for r in k.findall('record'):
            n = int(t(r, 'row/count') or 0)
            dkim, spf = t(r, 'row/policy_evaluated/dkim'), t(r, 'row/policy_evaluated/spf')
            ip, disp = t(r, 'row/source_ip'), t(r, 'row/policy_evaluated/disposition')
            podpisy = ', '.join(t(d, 'domain') + '/' + t(d, 'selector') + '=' + t(d, 'result') for d in r.findall('auth_results/dkim'))
            print('  %s · %d zpráv · DKIM %s · SPF %s · dispozice %s · %s' % (ip, n, dkim, spf, disp, podpisy or 'bez podpisu'))
            zprav += n
            # DMARC projde, když aspoň jedno z DKIM / SPF projde se zarovnanou doménou (policy_evaluated to už vyhodnotil)
            if dkim != 'pass' and spf != 'pass':
                neproslo += n
                spatne.append('%s (%d×, dispozice %s)' % (ip, n, disp or '?'))
    if neproslo:
        print('POZOR: %d z %d zpráv s odesílatelem therunekeeper.com neprošlo ověřením — zdroj: %s' % (neproslo, zprav, '; '.join(spatne)))
    else:
        print('DMARC OK: %d zpráv, všechny prošly (DKIM nebo SPF)' % zprav)
    return 0


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__ or 'použití: dmarc_cti.py <hlášení> …')
        sys.exit(2)
    sys.exit(main(sys.argv[1:]))
