# -*- coding: utf-8 -*-
# is-gpt-check.py — islandská korektura přes GPT (náhrada za Yfirlestur API).
#
# Proč (2026-10-10): is-grammar-qa.py volal https://yfirlestur.is/correct.api a ten od 2026-10 trvale přesměrovává (HTTP 301) na
# malstadur.mideind.is/malfridur — Miðeind službu přesunul do placeného produktu Málstaður (API má jen tarif „Frjáls áskrift“: 2 990 kr
# na uživatele a měsíc + oprava přes API 1 kr za 100 znaků — ověřeno 2026-10-14 na malstadur.mideind.is/askrift; do té doby tu stálo
# „bez veřejného API“). urllib přesměrování
# následoval jako GET, dostal HTML stránku a padal na „Expecting value“ → každá kontrola skončila „NEZKONTROLOVÁNO“.
# KUKY 2026-10-10: „zjisti příčinu. najdi jiné lepší řešení. GPT dělá dobrou IS.“
#
# Co dělá: pošle text(y) modelu gpt-6-sol (tentýž, který píše čtení) se zadáním rodilého korektora a vrátí jen JISTÉ chyby:
# pád/rod/číslo/shoda, vazba (rekce), pravopis, neexistující slovo, doslovný překlad (kalk) nebo nepřirozený obrat, který by rodilý
# mluvčí nenapsal. Styl a vkus nehlásí. Odpověď je JSON (úsek → oprava, druh, jistota, proč).
# Žádné tiché zelené (§19.2): když API selže nebo odpověď nejde přečíst, výsledek je „NEZKONTROLOVÁNO“ (exit 2), ne čistý.
# Nástroj se obhájil 2026-10-10 na sadě známých chyb a správných vět z produkce — `--samotest` (1 volání).
# Kde stojí mezi ostatními kontrolami IS (pořadí, co vidí a co ne): jen CLAUDE.md §2.
#
#   python -X utf8 is-gpt-check.py --text "…"         · jeden text
#   python -X utf8 is-gpt-check.py <soubor>           · text na řádek
#   python -X utf8 is-gpt-check.py --samotest         · obhajoba nástroje: známé chyby musí najít, správné věty nechat
# Volá API → hlídač ~/.claude/runar-api-guard.py chce RUNAR_API_ANO=<počet volání> a RUNAR_API_ZAMER=„…“ (1 volání = až 40 textů).
# Náklady (KUKY 2026-10-10 „chci aby jsi mapoval kolik přesně stojí oprava IS pomocí GPT“): každé zaplacené volání se zapíše SAMO —
# tokeny, které vrátilo API, do ~/runar-eval/is-gpt-check-naklady.jsonl; cenu počítá výpočet appky (readingCostUsd nad MODEL_PRICES)
# přes scripts/utils/is_gpt_naklady.js. Na konci běhu se vypíše cena běhu; souhrn: node scripts/utils/is_gpt_naklady.js.
# Zapisuje se HNED po odpovědi, ještě před čtením obsahu — i volání, jehož odpověď pak nejde přečíst, bylo zaplacené.
import io, sys, os, json, time, subprocess, urllib.request, urllib.error

MODEL = 'gpt-6-sol'
KLIC = os.path.join(os.path.expanduser('~'), '.claude', 'runar-openai-key.txt')
DAVKA = 40
TU = os.path.dirname(os.path.abspath(__file__))
ZAZNAM = os.path.join(os.path.expanduser('~'), 'runar-eval', 'is-gpt-check-naklady.jsonl')
REZIM = 'text'      # main() přepíše: samotest | text | soubor | stdin — kvůli souhrnu
BEH = []            # náklady volání tohoto běhu (usd může být None, když ceník model nezná)

ZADANI = """You are a meticulous native Icelandic proofreader (málfarsráðgjafi) checking short UI texts and legal notices for an app.
For each numbered text, report ONLY definite errors that a careful native speaker would correct:
- wrong case, gender, number or agreement (incl. numerals ending in 1 taking the singular);
- wrong verb/preposition government (rekcija, e.g. "eyða" + dative);
- misspelling or a word that does not exist in Icelandic;
- a literal calque from English or a phrase no native speaker would write (say what a native would write).
Do NOT report stylistic preferences, punctuation choices, capitalisation of UI labels, or anything you are not sure about.
Proper names (Rúnar, Agndofa, Google, Supabase, OpenAI) and placeholders like {n} are correct as they are.
Return JSON only: {"vysledky":[{"cislo":<number>,"chyby":[{"usek":"<exact substring>","oprava":"<corrected substring>",
"druh":"case|gender|number|agreement|government|spelling|nonword|calque|unnatural","jistota":"high|medium","proc":"<short reason in English>"}]}]}
Every numbered text must appear in "vysledky"; use an empty "chyby" list when the text is correct."""


def zavolej(texty):
    klic = io.open(KLIC, encoding='utf-8').read().strip()
    zadani = '\n'.join('%d. %s' % (i + 1, t) for i, t in enumerate(texty))
    telo = json.dumps({
        'model': MODEL,
        'reasoning_effort': 'medium',
        'response_format': {'type': 'json_object'},
        'max_completion_tokens': 12000,
        'messages': [{'role': 'system', 'content': ZADANI}, {'role': 'user', 'content': zadani}],
    }).encode('utf-8')
    req = urllib.request.Request('https://api.openai.com/v1/chat/completions', data=telo, headers={
        'Content-Type': 'application/json', 'Authorization': 'Bearer ' + klic})
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            d = json.load(r)
    except urllib.error.HTTPError as e:
        raise RuntimeError('HTTP %d: %s' % (e.code, e.read().decode('utf-8', 'replace')[:300]))
    zapis_naklady(d, len(texty))
    obsah = d['choices'][0]['message']['content']
    vys = json.loads(obsah)['vysledky']
    podle = {int(v['cislo']): v.get('chyby') or [] for v in vys}
    if sorted(podle) != list(range(1, len(texty) + 1)):
        raise RuntimeError('odpověď nepokrývá všechny texty: ' + str(sorted(podle)))
    return [podle[i + 1] for i in range(len(texty))]


def zapis_naklady(d, n_textu):
    """Tokeny z odpovědi → cena (výpočet appky) → řádek do záznamu. Chyba zápisu korekturu nezastaví, jen se ohlásí."""
    u = dict(d.get('usage') or {})
    u['model'] = MODEL   # cena podle modelu, který jsme objednali; API může vrátit jméno s datem verze (model_api)
    usd = None
    try:
        r = subprocess.run(['node', os.path.join(TU, 'scripts', 'utils', 'is_gpt_naklady.js'), '--cena', json.dumps(u)],
                           capture_output=True, text=True, timeout=60)
        usd = None if r.stdout.strip() in ('', 'null') else float(r.stdout.strip())
    except Exception as e:
        print('⚠ cenu se nepodařilo spočítat (%s) — tokeny se zapíšou, souhrn ji dopočítá' % e)
    radek = {'cas': time.strftime('%Y-%m-%d %H:%M:%S'), 'model': MODEL, 'model_api': d.get('model'), 'rezim': REZIM,
             'texty': n_textu, 'usage': u, 'usd': usd, 'zamer': os.environ.get('RUNAR_API_ZAMER', '')[:300]}
    if not d.get('usage'):
        print('⚠ API nevrátilo usage — cena tohoto volání neznámá')
    BEH.append(radek)
    try:
        os.makedirs(os.path.dirname(ZAZNAM), exist_ok=True)
        with io.open(ZAZNAM, 'a', encoding='utf-8') as f:
            f.write(json.dumps(radek, ensure_ascii=False) + '\n')
    except Exception as e:
        print('⚠ záznam nákladů se nepodařilo zapsat (%s): %s' % (ZAZNAM, e))


def vypis_cenu():
    if not BEH:
        return
    known = [r['usd'] for r in BEH if r['usd'] is not None]
    u = [r['usage'] for r in BEH]
    vstup = sum(x.get('prompt_tokens', 0) for x in u)
    cache = sum((x.get('prompt_tokens_details') or {}).get('cached_tokens', 0) for x in u)
    vystup = sum(x.get('completion_tokens', 0) for x in u)
    prem = sum((x.get('completion_tokens_details') or {}).get('reasoning_tokens', 0) for x in u)
    cena = ('$%.4f' % sum(known)) + ('' if len(known) == len(BEH) else ' + %d volání bez ceny' % (len(BEH) - len(known)))
    n = sum(r['texty'] for r in BEH)
    texty = '%d %s' % (n, 'text' if n == 1 else 'texty' if 2 <= n <= 4 else 'textů')
    print('Cena běhu: %s · %d volání · %s · tokeny: vstup %d (z cache %d), výstup %d (z toho přemýšlení %d). '
          'Souhrn: node scripts/utils/is_gpt_naklady.js' % (cena, len(BEH), texty, vstup, cache, vystup, prem))


def zkontroluj(texty):
    """Vrací seznam (text, chyby) nebo vyhodí výjimku — nikdy tiché „v pořádku“."""
    out = []
    for i in range(0, len(texty), DAVKA):
        cast = texty[i:i + DAVKA]
        out += list(zip(cast, zavolej(cast)))
    return out


# Obhajoba nástroje (§27): známé chyby z appky a korpusu musí najít, správné věty z produkce nechat. Do 2026-10-10 byly všechny
# chybné řádky skutečně v produkci (tabulka zásad, deník) nebo v BAD_PATTERNS (rodilý mluvčí).
SAMOTEST = [
    ('Þegar þú ferð um Rúnar, eru ákveðin hlutir munuð.', True),              # rod: hlutir (m.) × ákveðin
    ('Fjöldi lestrar á mánuði.', True),                                        # fjöldi + gen. pl. → lestra
    ('Geymt vegna bókhalds (nafnlægt þegar reikningi er eytt).', True),        # nafnlægt neexistuje
    ('Þú átt 1 lestrar eftir.', True),                                         # číslo 1 → jednotné
    # SLEPÉ MÍSTO (doloženo 2026-10-10, 1. běh): gramaticky správný doslovný idiom GPT nepozná — kalk „riding the wind“, který rodilá
    # mluvčí nahlásila 2026-08-02 (korpus 0×), prošel jako OK. Idiomy a obraty proto dál kryje korpus: `is-vazba.py --freq "<obrat>"`.
    # None = do výsledku samotestu se nepočítá, jen se vypíše, ať je slepota vidět (§27 — dokázaná, ne tušená).
    ('Örninn ríður vindinum yfir fjöllunum.', None),
    ('Ekki tókst að vista — athugaðu nettenginguna og reyndu aftur.', False),  # produkce
    ('Rúnirnar spá ekki fyrir um örlög þín.', False),                          # produkce
    ('Þú ert hér Gestur. Dragðu rún og sjáðu hver kemur til þín.', False),     # produkce
    ('Einu sinni á dag geymum við þar öryggisafrit af gagnagrunninum okkar, á dulkóðuðu formi.', False),
    ('Hverju afriti er eytt eftir 30 daga.', False),                           # eyða + dat.
]


def tiskni(vysledky):
    nalezu = 0
    for i, (t, chyby) in enumerate(vysledky, 1):
        if not chyby:
            print('  [%d] OK      %s' % (i, t[:110]))
            continue
        nalezu += 1
        print('  [%d] CHYBA   %s' % (i, t[:110]))
        for c in chyby:
            print('        „%s“ → „%s“  (%s, %s) %s' % (c.get('usek'), c.get('oprava'), c.get('druh'), c.get('jistota'), c.get('proc', '')))
    return nalezu


def main():
    global REZIM
    a = sys.argv[1:]
    REZIM = 'samotest' if a[:1] == ['--samotest'] else 'text' if a[:1] == ['--text'] else 'soubor' if a else 'stdin'
    if a and a[0] == '--samotest':
        texty = [t for t, _ in SAMOTEST]
        try:
            vys = zkontroluj(texty)
        except Exception as e:
            print('NEZKONTROLOVÁNO — %s' % e); sys.exit(2)
        tiskni(vys)
        spatne = [(i + 1, t) for i, ((t, cekano), (_, chyby)) in enumerate(zip(SAMOTEST, vys)) if cekano is not None and bool(chyby) != cekano]
        slepe = [(i + 1, bool(chyby)) for i, ((t, cekano), (_, chyby)) in enumerate(zip(SAMOTEST, vys)) if cekano is None]
        for i, nasel in slepe:
            print('ℹ     [%d] slepé místo (idiom): %s' % (i, 'tentokrát nalezeno' if nasel else 'nenalezeno — kryje is-vazba.py --freq'))
        if spatne:
            print('FAIL  samotest: %d z %d nesedí — %s' % (len(spatne), len(SAMOTEST), ', '.join('[%d]' % i for i, _ in spatne)))
            sys.exit(1)
        print('OK    samotest: všech %d známých chyb nalezeno, %d správných vět bez nálezu'
              % (sum(1 for _, c in SAMOTEST if c), sum(1 for _, c in SAMOTEST if c is False)))
        return
    if a and a[0] == '--text':
        texty = [' '.join(a[1:])]
    elif a:
        texty = [r.strip() for r in io.open(a[0], encoding='utf-8') if r.strip()]
    else:
        texty = [r.strip() for r in sys.stdin.read().splitlines() if r.strip()]
    try:
        vys = zkontroluj(texty)
    except Exception as e:
        print('NEZKONTROLOVÁNO — %s — výsledek NENÍ čistý.' % e); sys.exit(2)
    n = tiskni(vys)
    print('\n%d %s, %d s nálezem (model %s).' % (len(texty), 'text' if len(texty) == 1 else 'texty' if 2 <= len(texty) <= 4 else 'textů', n, MODEL))
    sys.exit(1 if n else 0)


if __name__ == '__main__':
    try:
        main()
    finally:
        vypis_cenu()   # i po chybě a po sys.exit — zaplacené volání se ukáže vždy
