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
KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtaXR4anZrZW92aWpyZWVwcm9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzE0OTIsImV4cCI6MjA5Mzg0NzQ5Mn0.-qk3vHqZGkj9yplSlK1PUKbypxDeXOtllp49JLICGyw'

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
