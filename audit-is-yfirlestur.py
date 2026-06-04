# audit-is-yfirlestur.py
# Extrahuje IS texty z projektu a zkontroluje grammatiku pres yfirlestur.is API.
# Vystup: is-audit-report.txt
#
# Pouziti: python audit-is-yfirlestur.py

import re, json, urllib.request, urllib.parse, time, os

BASE = r'C:\Users\zkuku\Downloads\Runar-admin\v2'
OUT  = r'C:\Users\zkuku\Downloads\Runar-admin\is-audit-report.txt'

# ── Extrakce IS textu ────────────────────────────────────────────

def extract_is_strings(path):
    """Najde IS retezce v souboru — IS sekce v JS objektech a staticke IS texty."""
    with open(path, 'r', encoding='utf-8') as f:
        src = f.read()

    results = []
    fname = os.path.basename(path)

    # 1. JS string literals (jednoduche + dvojite uvozovky + template literals)
    #    Hledame IS text — obsahuje islandske znaky
    IS_CHARS = set('áéíóúýðþæöÁÉÍÓÚÝÐÞÆÖ')

    # Jednoduse: vsechny retezce delsi nez 15 znaku obsahujici IS pismena
    pattern = r"(?:'([^'\\]{15,})'|\"([^\"\\]{15,})\"|`([^`]{15,})`)"
    for m in re.finditer(pattern, src):
        text = m.group(1) or m.group(2) or m.group(3)
        if not text:
            continue
        # Musi obsahovat IS znaky
        if not any(c in IS_CHARS for c in text):
            continue
        # Preskoc JS kod, URL, CSS
        if any(x in text for x in ['function', 'document.', 'getElementById', 'http', 'var ', 'const ', '.js', '.css', 'rgba(']):
            continue
        # Preskoc EN texty (zadne IS pismena mezi slovy)
        line_no = src[:m.start()].count('\n') + 1
        results.append((fname, line_no, text.strip()))

    return results

FILES = [
    'runar-translations.js',
    'runar-character.js',
    'runar-app.js',
    'runar-auth.js',
    'runar-reading.js',
    'runar-tree.js',
    'runar-utils.js',
    'runar-gathering.js',
    'runar-help.html',
    'runar-yggdrasil.html',
    'runar-reader.html',
]

print('Extrakce IS textu...')
all_strings = []
for fname in FILES:
    path = os.path.join(BASE, fname)
    if os.path.exists(path):
        strings = extract_is_strings(path)
        print(f'  {fname}: {len(strings)} IS retezcu')
        all_strings.extend(strings)

print(f'\nCelkem: {len(all_strings)} IS retezcu\n')

# ── Volani yfirlestur.is API ─────────────────────────────────────

def check_is(text):
    """Posle text na yfirlestur.is a vrati opravy."""
    url = 'https://yfirlestur.is/correct.api'
    data = urllib.parse.urlencode({'text': text}).encode('utf-8')
    req = urllib.request.Request(url, data=data, method='POST')
    req.add_header('Content-Type', 'application/x-www-form-urlencoded')
    req.add_header('Accept', 'application/json')
    req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        return {'error': str(e)}

# ── Batching — posli po blocich, max 500 znaku na volani ────────

def chunk_strings(strings, max_chars=400):
    """Sdruz kratke retezce do bloku pro efektivni API volani."""
    chunks = []
    current_texts = []
    current_sources = []
    current_len = 0

    for fname, lineno, text in strings:
        if current_len + len(text) > max_chars and current_texts:
            chunks.append((current_sources[:], '\n'.join(current_texts)))
            current_texts = []
            current_sources = []
            current_len = 0
        current_texts.append(text)
        current_sources.append((fname, lineno))
        current_len += len(text) + 1

    if current_texts:
        chunks.append((current_sources, '\n'.join(current_texts)))

    return chunks

chunks = chunk_strings(all_strings)
print(f'Bloky pro API: {len(chunks)}\n')

# ── Zpracovani a zapis reportu ───────────────────────────────────

report_lines = []
report_lines.append('IS GRAMMAR AUDIT — yfirlestur.is')
report_lines.append('=' * 60)
report_lines.append(f'Soubory: {len(FILES)}, IS retezce: {len(all_strings)}, API bloky: {len(chunks)}')
report_lines.append('')

total_annotations = 0

for i, (sources, block_text) in enumerate(chunks):
    print(f'API volani {i+1}/{len(chunks)}...', end=' ', flush=True)
    result = check_is(block_text)

    if 'error' in result:
        print(f'CHYBA: {result["error"]}')
        report_lines.append(f'[CHUNK {i+1}] API CHYBA: {result["error"]}')
        continue

    # Projdi vety a najdi anotace (opravy)
    chunk_annotations = []
    paragraphs = result.get('result', [])
    for para in paragraphs:
        for sent in para:
            annotations = sent.get('annotations', [])
            corrected = sent.get('corrected', '')
            original = sent.get('text', '')
            if annotations:
                for ann in annotations:
                    chunk_annotations.append({
                        'original':  original,
                        'corrected': corrected,
                        'code':      ann.get('code', ''),
                        'text':      ann.get('text', ''),
                        'suggest':   ann.get('suggest', ''),
                    })

    print(f'{len(chunk_annotations)} oprav')
    total_annotations += len(chunk_annotations)

    if chunk_annotations:
        # Zjisti ze ktereho souboru pochazi (aproximace — prvni zdroj bloku)
        src_label = ', '.join(set(f'{f}:{l}' for f, l in sources[:3]))
        report_lines.append(f'--- BLOK {i+1} ({src_label}) ---')
        for ann in chunk_annotations:
            report_lines.append(f'  ORIGINAL:  {ann["original"]}')
            report_lines.append(f'  CORRECTED: {ann["corrected"]}')
            if ann["suggest"]:
                report_lines.append(f'  SUGGEST:   {ann["suggest"]}')
            report_lines.append(f'  KOD:       {ann["code"]} — {ann["text"]}')
            report_lines.append('')

    # Rate limiting — max ~4 volani/s
    time.sleep(0.3)

report_lines.append('=' * 60)
report_lines.append(f'CELKEM OPRAV: {total_annotations}')

with open(OUT, 'w', encoding='utf-8') as f:
    f.write('\n'.join(report_lines))

print(f'\nHotovo. Celkem oprav: {total_annotations}')
print(f'Report: {OUT}')
