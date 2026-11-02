# -*- coding: utf-8 -*-
# verify_web_runy.py — stránky run na webu (web/site/runir/, web/site/en/runes/, sitemap.xml) odpovídají generátoru (smoke ㊙).
#
# Proč (CODE-web 2026-11-02; owner „design je dobrý, zkusíme to“, DECISIONS 2026-11-02 (7)): stránky jsou GENEROVANÉ z dat appky
# (scripts/web_runy.py). Ruční úprava vygenerované stránky by se příštím přegenerováním tiše ztratila a změna šablony bez přegenerování
# by na webu nikdy nebyla — obojí FAIL. Změněný text v appce (tune upraví coll_rune) je jen ⚠: text mění tune, web nasazuje web,
# kontrola nesmí zastavit cizí push; scripts/web_nasad.py stránky před každým nasazením přegeneruje sám (§30).
# Jak: generátor složí všechny stránky v paměti a porovná je se soubory; každá stránka nese otisk zdroje (meta generator) — jiný otisk
# = zastaralá (⚠), stejný otisk a jiný obsah = vada (FAIL). Dál chybějící / přebývající stránka a chybějící obrázek pro sdílení = FAIL.
# Neumí: jak stránky vypadají v prohlížeči (to jen ručně v náhledu) a jestli je nasazený web aktuální (vidí repo, ne therunekeeper.com).
#   python -X utf8 scripts/verify_web_runy.py
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.argv = [sys.argv[0], '--kontrola']
import web_runy
web_runy.main()
