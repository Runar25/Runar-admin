#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
show_corrections.py
Fetch current Word Corrections from Supabase and print them.
Run this BEFORE making any IS text changes.
"""
import sys, io, urllib.request, json
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

URL = 'https://pmitxjvkeovijreepror.supabase.co/rest/v1/runar_corrections?select=original_phrase,replacement_phrase,context,lang_scope&order=lang_scope.asc,created_at.asc'
KEY = 'sb_publishable_iS8zD-m5BC9N3BYJa3XnHQ_UTkIlNy2'   # 2026-11-02: veřejný klíč nového typu (Klíče Supabase, krok 2), jako is-corr-qa.py

req = urllib.request.Request(URL, headers={'apikey': KEY, 'Authorization': f'Bearer {KEY}'})
with urllib.request.urlopen(req) as r:
    data = json.loads(r.read())

# Filter out test entries
real = [d for d in data if d['original_phrase'] != 'test']

print(f'\n=== WORD CORRECTIONS ({len(real)} entries) ===\n')
for d in real:
    scope = f"[{d['lang_scope'].upper()}]"
    ctx = f"  ({d['context']})" if d['context'] else ''
    print(f'{scope} "{d["original_phrase"]}"')
    print(f'  → "{d["replacement_phrase"]}"{ctx}')
    print()
