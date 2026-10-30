# -*- coding: utf-8 -*-
# protipriklady.py — útok na kontroly: do čisté kopie repa (git worktree) podstrčí skutečnou chybu a ověří, že kontrola SPADNE.
#
# Proč (2026-10-11, CODE-read, kolo 3 kontroly architektury): ve smoke je 61 kontrol a samotest (--test) má jen 11. Kontrola, která
# prošla jen tím, kvůli čemu vznikla, není ověřená (CLAUDE.md §25 B). Naostro: 18 podstrčených chyb → 16 chyceno, ale dvě kontroly
# zápisů do DB propustily tutéž vadu v jiném tvaru (alias `_db = sb`, from("user_profiles"), update(p)) — opraveno týž den.
# A protože kontrolu může kdokoli později upravit (rozšířit regex, přepsat), útoky se pouštějí znovu SAMY: smoke ㊵ spustí ty případy,
# u kterých se od posledního úspěchu změnila kontrola, cílový soubor, případ nebo tenhle nástroj (cache .git/runar-protipriklady.json).
#
# Typy případů:  chyti    = kontrola MUSÍ spadnout (exit ≠ 0)
#                obchazka = tatáž vada v jiném tvaru; musí spadnout taky (případ vznikl ze slepoty, která byla opravena)
#                nesmi    = správný kód; kontrola NESMÍ spadnout (hlídá falešně červenou po rozšíření kontroly)
# Podstrčení:    append (text na konec) · replace (přesný text, právě 1×) · regex (právě 1 shoda) · create (nový soubor)
#                commit_append (text na konec a commit toho souboru v kopii — pro kontroly, které vidí jen commitnuté řádky, ⑮)
# Sdílený strom se nemění; do worktree se nakopírují kontroly z pracovního stromu (ať jde ověřit i necommitnutou opravu kontroly).
#
#   python -X utf8 scripts/protipriklady.py            jen změněné případy (jak ho volá smoke)
#   python -X utf8 scripts/protipriklady.py --vse      všechny
#   python -X utf8 scripts/protipriklady.py verify_x.js   jen případy té kontroly
# Podstrčení se neprojevilo (cílový text se změnil) → FAIL s pokynem: uprav případ tady, ne kontrolu.
# Soubor je SDÍLENÝ (píšou do něj všechny session): zapisuj přes commit_vlastni (cv.zapis / `commit_vlastni.py uprav`), commit
# `commit_vlastni.py commit`; pathspec commit a nástroj Edit zastaví hooky (DECISIONS 2026-10-11 (58)).
# Text útoku skládej z kousků (`'…xyz' + '.md'`), když nese vzor, který některá kontrola hledá i v scripts/ — jinak smoke chytí tenhle
# soubor (2026-10-11: odkaz na neexistující doc, pevná cesta k repu a výčet nástrojů IS v případech kola 3 / 4g zastavily push).
import hashlib, io, json, os, re, shutil, subprocess, sys, tempfile, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))).replace('\\', '/')
# git bez proměnných, které nastaví hook (GIT_INDEX_FILE, GIT_DIR…): jinak by příkazy v kopii sahaly na index hlavního stromu.
ENV = {k: v for k, v in os.environ.items() if not k.startswith('GIT_')}
# Cache ve SPOLEČNÉM .git: pre-push pouští smoke v dočasném worktree, kde je .git soubor — cache v něm by nepřežila ani jeden push.
_spol = subprocess.run(['git', '-C', ROOT, 'rev-parse', '--path-format=absolute', '--git-common-dir'],
                       capture_output=True, text=True, env=ENV).stdout.strip()
CACHE = (_spol or ROOT + '/.git').replace('\\', '/') + '/runar-protipriklady.json'
# Výstup kontroly, která propustila útok typu chyti (2026-10-12): bez něj „exit 0“ neřekne, co kontrola viděla (souběh, jiná stránka…).
PROPUSTENE = (_spol or ROOT + '/.git').replace('\\', '/') + '/runar-protipriklady-propustene'
POSLEDNI_VYSTUP = ''
APP = 'v2/runar-app.js'

PRIPADY = [
 # ㊉ mapa souborů (CODE-read 2026-10-15): nový modul appky bez řádku v CLAUDE.md → musí spadnout
 ('chyti', 'verify_soubory_claude.js', 'v2/runar-protipriklad-modul.js', 'create', '', '// modul bez řádku v mapě\n'),
 # ㉽ landing (CODE-read 2026-10-14, kolo 4): web/site čte klíč, který v UI_TEXT není (přejmenování v appce) → prázdné místo na webu
 ('chyti', 'verify_ui_text_used.js', 'web/site/index.html', 'replace', 'data-k="hero_eyebrow"', 'data-k="hero_eyebrow_v2"'),
 # ㉽ od 2026-10-21 (CODE-web) čte i podstránky webu (/ferdin/, /heim/, /kort/) a jejich U.klíč / tp('klíč'): podstránka čte klíč, který v appce není
 ('chyti', 'verify_ui_text_used.js', 'web/site/ferdin/index.html', 'replace', 'U.journey_gift', 'U.journey_giftZ'),
 # ㊇ ceník na serveru (CODE-tune 2026-10-14): cena změněná jen ve v2/ — zrcadlo nepřegenerované
 ('chyti', 'verify_ceny_server.js', 'v2/runar-config.js', 'replace', "    'gpt-6-sol':  [2, 0.2, 10],", "    'gpt-6-sol':  [3, 0.2, 10],"),
 # ㊊ automatická mazání (CODE-tune 2026-10-16, owner „musíme mít kontroly! to platí pro všechna podobné příkazy“): edge funkce mimo registr
 # MAZANI začne mazat přes API (send-line; „create“ novou složku funkce neumí) · nový pg_cron maže přímo bez funkce, která zapíše
 # potvrzení → obojí musí spadnout. Vzory po kouskách.
 ('chyti', 'verify_mazani.js', 'supabase/functions/send-line/index.ts', 'replace', '"Access-Control-Allow-Methods": "POST, OPTIONS",',
  '"Access-Control-Allow-Methods": "POST, OPTIONS", _x: fetch(u, { method: "DEL' + 'ETE" }),'),
 ('chyti', 'verify_mazani.js', 'sql/2099-12-31_protipriklad.sql', 'create', '',
  "select cron.schedule('protipriklad', '0 1 * * *', $$del" + "ete from public.bug_reports where false$$);\n"),
 # ㊈ hlídání provozu (CODE-tune 2026-10-14): práh selhání modelu desetkrát vyšší — upozornění by nepřišlo
 ('chyti', 'verify_ops_souhrn.js', 'supabase/functions/_shared/ops_souhrn.ts', 'replace', '  chybModeluZaHodinu: 3,', '  chybModeluZaHodinu: 30,'),
 # ㊈ krátké e-maily (CODE-tune 2026-10-14, owner „maily nesmí zabírat moc místa“): nad tělem znovu řádek se stavem — e-mail o řádek delší
 ('chyti', 'verify_ops_souhrn.js', 'supabase/functions/_shared/ops_souhrn.ts', 'replace', '  const text = nahore.join(', '  const text = stav + "\\n" + nahore.join('),
 # ㊈ záloha jedním řádkem (CODE-tune 2026-10-15): druhý řádek „No database backup has reported yet“ i u otevřeného problému
 ('chyti', 'verify_ops_souhrn.js', 'supabase/functions/_shared/ops_souhrn.ts', 'replace', ' && d.otevrene.backup !== "problem")', ')'),
 # ㊆ útok na skutečných výstupech (CODE-read 2026-10-14): kontrola vypisuje cestu bez „supabase/functions/“ (díra z prvního útoku) → ㊆ musí padnout
 ('chyti', 'verify_rychle_kontroly.py', 'scripts/verify_edge_imports.js', 'replace', "const rel = 'supabase/functions/' + d.name + '/' + f;", "const rel = d.name + '/' + f;"),
 # ㊆ rychlé kontroly při commitu (CODE-tune 2026-10-14): vada na staged souboru commit nezastaví · cizí vada commit zastaví
 ('chyti', 'verify_rychle_kontroly.py', 'scripts/utils/rychle_kontroly.py', 'replace', '            (blok if je_staged(c, st) else cizi).append((k, l.strip()))', '            cizi.append((k, l.strip()))'),
 ('chyti', 'verify_rychle_kontroly.py', 'scripts/utils/rychle_kontroly.py', 'replace', '            (blok if je_staged(c, st) else cizi).append((k, l.strip()))', '            blok.append((k, l.strip()))'),
 # ㊄ pravidlo 6 kontroly zpráv (CODE-tune 2026-10-14): schovaná otázka projde, když je podmínka vypnutá
 ('chyti', 'verify_hooky_claude.py', 'hooks/claude/runar-zprava-check.py', 'replace', '        ceka = CEKA.search(bod)', '        ceka = None'),
 # past §11 v pravidla_pri_dotyku (CODE-read 2026-10-14): vzor islandského escape přestane sedět → samotest hooku (㊴) musí padnout
 ('chyti', 'verify_pravidla_mapa.js', 'scripts/utils/pravidla_pri_dotyku.py', 'replace', '(?:u00|x)(e1|e9|', '(?:u00q|xq)(e1|e9|'),
 # ㊅ mazání z historie ElevenLabs (CODE-tune 2026-10-14): úklid bez hledání podle request_id — 14. 10. tak hlas v historii zůstal
 ('chyti', 'verify_el_historie.js', 'supabase/functions/elevenlabs-proxy/index.ts', 'replace',
  'const podleId = reqId ? pol.find((h) => h?.request_id === reqId) : undefined;', 'const podleId = undefined;'),
 # ㊄ hooky Claude Code (CODE-read 2026-10-14): kontrola zpráv přestane poznat příkaz; hlídač API přestane poznat OpenAI
 ('chyti', 'verify_hooky_claude.py', 'hooks/claude/runar-zprava-check.py', 'replace', '(node|git|python3?|', '(nodex|gitx|python3x?|'),
 ('chyti', 'verify_hooky_claude.py', 'hooks/claude/runar-api-guard.py', 'replace', r"API = re.compile(r'api\.openai\.com|", r"API = re.compile(r'"),
 # ⑮ §16 output B (CODE-read 2026-10-13): commitnuté rozhodnutí slíbí opravu docu, který se po něm nepohnul (neexistuje)
 ('chyti', 'verify_decisions_followthrough.js', 'RUNAR_DECISIONS.md', 'commit_append', '',
  '\n## 2026-10-13 (99) — protipříklad\n\n- Affected doc(s): `docs/protipriklad-' + 'xyz.' + 'md` — v témže commitu.\n'),
 # ㊃ kalkulačka návratnosti (CODE-read 2026-10-13): položka nákladů změněná bez součtu
 ('chyti', 'verify_payback_pricing.js', 'RUNAR_PRICING.md', 'replace', '| Supabase | 0 ✔ | 25 |', '| Supabase | 0 ✔ | 45 |'),
 # ㊂ zákazy a cesty (CODE-read 2026-10-13): po jednom útoku na každou část
 ('chyti', 'verify_zakazy_cesty.js', 'v2/runar-reader.html', 'replace', 'opacity:0.7;">ᚱ</div>', 'opacity:0.7;">◌ ᚱ ◌</div>'),   # 2026-10-20: brána s ᚱ smazaná (mrtvá)
 ('chyti', 'verify_zakazy_cesty.js', 'v2/runar-auth.js', 'regex', r"(banner\.style\.display      = 'block';\r?\n    content\.style\.display     = )'block'", r"\g<1>'none'"),
 ('chyti', 'verify_zakazy_cesty.js', 'v2/runar-app.js', 'append', '', "\nfunction _jmenoX(u) { return u.email.split('" + "@')[0]; }\n"),
 ('chyti', 'verify_zakazy_cesty.js', 'v2/runar-reading.js', 'replace', "} else if (_spreadMode === 'horseshoe') {", "} else if (_spreadMode === 'horseshoe_x') {"),
 # ㊁ mapa nosičů (CODE-read 2026-10-13): nové pravidlo bez nosiče; nosič, který smoke přestal pouštět (nadpis i volání; ㉹ — ne
 # předspuštěná kontrola, ta má jméno i v seznamu predem)
 ('chyti', 'verify_nosice.js', 'CLAUDE.md', 'append', '', '\n### §' + '99 — pravidlo bez nosiče\nText.\n'),
 ('chyti', 'verify_nosice.js', 'smoke.py', 'regex',
  r"(JAZYK KOMUNIKACE \(verify_)jazyk_ui(\.js\)'\)\r?\nr = subprocess\.run\(\['node', os\.path\.join\(ROOT, 'scripts', 'verify_)jazyk_ui(\.js'\)\],\r?\n[^\n]*\r?\nr2 = subprocess\.run\(\['node', os\.path\.join\(ROOT, 'scripts', 'verify_)jazyk_ui", r'\g<1>x\g<2>x\g<3>x'),
 # kolo 3 / 4a (2026-10-11)
 ('chyti', 'verify_doc_links.js', 'RUNAR_DESIGN.md', 'append', '', '\n\nOdkaz do prázdna: `docs/neexistuje-xyz.md`\n'),
 ('chyti', 'verify_escape_marks.js', 'RUNAR_DESIGN.md', 'append', '', '\n\nřádek s holou značkou <!-- doc-links:ok -->\n'),
 ('chyti', 'verify_admin_emails.js', 'supabase/functions/_shared/admini.ts', 'regex', r'"[\w.+-]+@agndofa\.is"', '"jiny@agndofa.is"'),   # 2026-10-22: seznam jen v _shared
 ('obchazka', 'verify_admin_emails.js', 'supabase/functions/list-reports/index.ts', 'replace', 'import { ADMIN_EMAILS } from "../_shared/admini.ts";', 'const ADMIN_EMAILS = ["kukula@agndofa.is", "info@agndofa.is"];'),   # vlastní kopie místo importu
 ('chyti', 'verify_memory_index.js', 'memory/MEMORY.md', 'append', '', '\n- [neexistuje-xyz.md](neexistuje-xyz.md) — podstrčený odkaz\n'),
 ('chyti', 'verify_decisions_numbers.js', 'RUNAR_DECISIONS.md', 'append', '', '\n## 2026-10-11 (1) — podstrčené zdvojené číslo\n\n- test\n'),
 ('chyti', 'verify_spread_prices.js', 'v2/runar-config.js', 'regex', r'(yggdrasil:\s*\{\s*free:\s*null,\s*credits:\s*)\d+', r'\g<1>97'),
 ('chyti', 'verify_sw_shell.js', 'v2/sw.js', 'regex', r"  '/Runar-admin/v2/runar-helper\.js',\r?\n", ''),
 ('chyti', 'verify_monthly_limits.js', 'supabase/functions/claude-proxy/index.ts', 'regex', r'(standard\s*:\s*)\d+', r'\g<1>9999'),
 # brzda kreditů ElevenLabs ve smoke ⑨ (2026-10-11, CODE-tune, DECISIONS 2026-10-11 (48))
 ('chyti', 'verify_monthly_limits.js', 'supabase/functions/elevenlabs-proxy/index.ts', 'replace', '    if (!brzda.pustit) {', '    if (false) {'),
 ('chyti', 'verify_monthly_limits.js', 'supabase/functions/_shared/voice_usage.ts', 'replace', '  const hladina = lim - EL_DOBITI_KREDITY;', '  const hladina = lim;'),
 ('chyti', 'verify_monthly_limits.js', 'supabase/functions/elevenlabs-static/index.ts', 'replace', '    const brzda = brzdaHlasu(kvota, kredityHlasu(resolvedModel, text.length))', '    const brzda = { pustit: true, spotreba: null, hladina: null, novych: 0 }'),
 ('chyti', 'verify_monthly_limits.js', 'scripts/utils/stats.js', 'regex', r"('eleven_v4_turbo': )0\.04", r"\g<1>0.08"),   # 2026-10-29: sazba modelu, kterým hlas mluví (do té doby v3)
 # kolo 3 / 4b (2026-10-11)
 ('chyti', 'verify_internal_tags.js', 'v2/runar-translations.js', 'append', '', '\n// [kánon] podstrčený interní tag\n'),
 ('chyti', 'verify_doc_values.js', 'RUNAR_PRIVACY.md', 'append', '', '\nTier Rune Master dostane víc čtení.\n'),
 ('chyti', 'verify_db_write_checked.js', APP, 'append', '', "\nfunction _protiA(){ sb.from('readings').update({ x: 1 }).eq('id', 1); }\n"),
 ('obchazka', 'verify_db_write_checked.js', APP, 'append', '', "\nvar _db = sb;\nfunction _protiB(){ _db.from('readings').update({ x: 1 }).eq('id', 1); }\n"),
 ('nesmi', 'verify_db_write_checked.js', APP, 'append', '', "\nasync function _protiF(){ const { error } = await sb.from('readings').update({ x: 1 }).eq('id', 1); if (error) console.warn(error); }\n"),
 ('chyti', 'verify_write_surface.js', APP, 'append', '', "\nfunction _protiC(uid){ return sb.from('user_profiles').update({ credits_balance: 999 }).eq('id', uid); }\n"),
 ('obchazka', 'verify_write_surface.js', APP, 'append', '', "\nfunction _protiD(uid){ var p = { credits_balance: 999 }; return sb.from('user_profiles').update(p).eq('id', uid); }\n"),
 ('obchazka', 'verify_write_surface.js', APP, 'append', '', "\nfunction _protiE(uid){ return sb.from(\"user_profiles\").update({ credits_balance: 999 }).eq('id', uid); }\n"),
 ('chyti', 'verify_model_labels.js', 'supabase/functions/claude-proxy/index.ts', 'regex', r'(const MODELS = \["claude-[a-z]+-)\d+', r'\g<1>77'),
 ('chyti', 'verify_canonical_files.js', 'RUNAR_PROTI.md', 'create', '', '# podstrčený neverzovaný kanonický doc\n'),
 ('nesmi', 'verify_canonical_files.js', 'RUNAR_PROTI_CERSTVY.md', 'create_cerstvy', '', '# právě rozepsaný doc (rozdělaná práce)\n'),
 ('chyti', 'verify_doc_length.js', 'RUNAR_PRIVACY.md', 'append', '', ''.join('\nřádek %d navíc' % i for i in range(300))),
 # 2026-10-21 (DECISIONS 2026-10-21 (4)): CLAUDE.md — historie a strop v bajtech; odkaz na záznam s datem historie není
 ('chyti', 'verify_doc_length.js', 'CLAUDE.md', 'append', '', '\nZ historie: do 2026-01-01 tu st' + 'álo něco jiného.\n'),
 ('chyti', 'verify_doc_length.js', 'CLAUDE.md', 'append', '', '\nPravidlo: ' + 'x' * 6000 + '\n'),
 ('chyti', 'verify_doc_length.js', 'CLAUDE.md', 'append', '', '\nJak řekl KUKY 2026' + '-01-01: tohle.\n'),
 ('nesmi', 'verify_doc_length.js', 'CLAUDE.md', 'append', '', '\nDůvod → RUNAR_DECISIONS.md 2026-10-21 (4).\n'),
 # kolo 3 / 4c (2026-10-11): jednorázové mutace z hlaviček kontrol převedené na opakované útoky (oprava (45))
 ('chyti', 'verify_image_pin.js', 'v2/runar-reading.js', 'replace', 'IMG_PIN = admin ? _imgPinMapa() : null;', 'IMG_PIN = _imgPinMapa();'),
 # zvolený obraz začne čerpat sáček (pin se uplatňuje dvakrát — `cand = [pin.row]` i `hit = pin.row`; mutace jen `cand` chování nemění)
 ('chyti', 'verify_image_pin.js', 'v2/runar-character.js', 'replace', 'var hit = pin ? pin.row : null;', 'var hit = null;'),
 ('chyti', 'verify_image_aspect_key.js', 'v2/runar-runes.js', 'replace',
  "k:    'water, flow, intuition, the unconscious, emotion, memory, dreams',",
  "k:    'water, flow, intuition, the unconscious, emotion, memory, dreams, tides',"),
 # poslední varianta esenčního rámce Opusu přestane padat (rozpočet délky má jen 1 variantu — tam by mutace nic nezměnila)
 ('chyti', 'verify_ending_angle.js', 'v2/runar-utils.js', 'regex',
  r"(var pool = lang === 'is' \? ESSENCE_FRAMES_IS : ESSENCE_FRAMES;\r?\n\s*return pool\[Math\.floor\(Math\.random\(\) \* )pool\.length", r'\g<1>(pool.length - 1)'),
 ('chyti', 'verify_ask_teaser.js', 'v2/runar-utils.js', 'replace', "return (pad && T['label_is_' + pad]) || T.label_is;", 'return T.label_is;'),
 # kolo 3 / 4d (2026-10-11): kontroly, které hlídají, že něco CHYBÍ (propustí-li, nikdo si nevšimne)
 ('chyti', 'verify_question_injection.js', 'v2/runar-character.js', 'replace', """.replace(/"/g, "'")""", ''),
 ('chyti', 'verify_question_injection.js', 'v2/runar-character.js', 'replace', r".replace(/[\r\n\t\u2028\u2029]+/g, ' ')", ''),
 ('obchazka', 'verify_question_injection.js', 'v2/runar-character.js', 'replace', r"/[\r\n\t\u2028\u2029]+/g", r"/[\r\n\t]+/g"),
 ('chyti', 'verify_journal_glyphs.js', 'v2/runar-journal.js', 'replace',
  "runeSvg(r, { frame: true, cls: 'badge-stone' }) + ' ' + escapeHtml(jm)", "escapeHtml(k)"),
 ('chyti', 'verify_tier_features.js', 'v2/runar-config.js', 'replace', 'if (v !== null && v !== undefined) out.push(', 'out.push('),
 ('chyti', 'verify_new_duplicates.js', 'RUNAR_PRIVACY.md', 'append', '', '\n**Bydlí v jiném docu → odkaz, ne převyprávění.**\n'),
 ('chyti', 'verify_fresh_dates.js', 'RUNAR_DECISIONS.md', 'append', '', '\n## 2026-10-01 (99) — podstrčený záznam se starým datem\n\n- test\n'),
 # 2026-10-15 (CODE-read): pevná revize a4cc4b6 místo HEAD~40 — když posledních 40 commitů sw.js neměnilo (samé docs/skripty), byla
 # podstrčená verze stejná jako HEAD a útok padal na „podstrčení se neprojevilo“. Verze jsou monotónní, a4cc4b6 se od HEAD liší napořád.
 ('chyti', 'verify_shared_tree.js', 'v2/sw.js', 'stage', 'a4cc4b6', ''),
 ('chyti', 'verify_shared_tree.js', 'v2/runar-verze.js', 'stage', 'a4cc4b6', ''),
 ('chyti', 'verify_commit_identity.js', '(historie)', 'commit', 'Runar Admin', ''),
 # kolo 3 / 4f (2026-10-11): peníze, soukromí, jazyk
 ('chyti', 'verify_founding_flag.js', 'v2/runar-reading.js', 'replace', "var _isFounding = (o.kind === 'NORNS'", "var _isFounding = (o.mode === 'norns'"),
 ('chyti', 'verify_owned_before_tier.js', 'v2/runar-tree.js', 'regex', r'(\n  if \(_lifeRuneText)\) \{(\r?\n)', r'\g<1> && isStdPlus) {\g<2>'),
 ('chyti', 'verify_reading_cost.js', 'v2/runar-utils.js', 'replace', 'ca * o[1]', 'ca * o[0]'),
 # kontrola bere jen verzované skripty (git ls-files) — nový necommitnutý nevidí; v praxi ho chytí pre-push v čisté kopii commitu
 ('chyti', 'verify_opt_out.js', 'scripts/utils/stats.js', 'append', '', "\nconst _protiQ = 'select text from readings where lang = $1';\n"),   # opt-out:ok 2026-10-11 podstrčená chyba pro útok na verify_opt_out, nic nečte
 ('obchazka', 'verify_opt_out.js', 'scripts/utils/stats.js', 'append', '', "\nconst _protiQ2 = `select text\n  from\n  readings where lang = $1`;\n"),   # opt-out:ok 2026-10-11 podstrčená chyba pro útok na verify_opt_out, nic nečte
 ('obchazka', 'verify_opt_out.js', 'scripts/utils/stats.js', 'append', '', "\nconst _protiQ3 = 'select text from \"readings\" where lang = $1';\n"),   # opt-out:ok 2026-10-11 podstrčená chyba pro útok na verify_opt_out, nic nečte
 ('chyti', 'verify_jazyk_ui.js', 'v2/runar-translations.js', 'replace', "'Read with Opus 5 (test)'", "'Čtení s Opusem 5 (zkouška)'"),
 # ㉹ čte i web/ (CODE-web 2026-10-19; BACKLOG čekal, až bude ve web/ první soubor v gitu): čeština ve věte, kterou vidí návštěvník webu
 ('chyti', 'verify_jazyk_ui.js', 'web/site/index.html', 'replace', "'That email address does not look right.'", "'Tahle e-mailová adresa nevypadá správně.'"),
 ('chyti', 'verify_edge_imports.js', 'supabase/functions/elevenlabs-proxy/index.ts', 'regex', r'npm:@supabase/supabase-js@[0-9.]+', 'npm:@supabase/supabase-js@2'),
 ('chyti', 'verify_rune_glyphs.js', 'v2/runar-help.html', 'replace', '</body>', '<p>ᚠ</p></body>'),
 # ㉻ hlídá od 2026-10-11 i shrine a runu z DB (CODE-tune, owner „jeď ty tři chyby“): návrat každé ze tří opravených vad musí shodit
 ('chyti', 'verify_rune_glyphs.js', 'v2/runar-shrine.html', 'replace', '<span data-rune-glyph="Fehu"></span>GENERATE GIFT CODES', 'ᚠ GENERATE GIFT CODES'),
 ('chyti', 'verify_rune_glyphs.js', 'v2/runar-shrine.html', 'replace', "setRuneText(btn, tUI('voice_btn_loading'));", "btn.textContent = tUI('voice_btn_loading');"),
 ('chyti', 'verify_rune_glyphs.js', 'v2/runar-shrine.html', 'replace', '.lbl-rune .rune-svg{display:block;height:0.82em;width:auto;}', '.lbl-rune .rune-svg{display:block;height:1.4em;width:auto;}'),
 # ㊻ datum (2026-10-11, CODE-tune): návrat staré cesty deníku, záloha pryč z datumUI, strom vlastní cestou — každé musí shodit
 ('chyti', 'verify_datum_ui.js', 'v2/runar-journal.js', 'replace', "    const dateStr = datumUI(e.drawn_at, isIs ? 'is' : 'en');", "    const dateStr = new Date(e.drawn_at).toLocaleDateString(isIs ? 'is-IS' : 'en-GB', { day:'numeric', month:'short', year:'numeric' });"),
 ('chyti', 'verify_datum_ui.js', 'v2/runar-utils.js', 'replace', "    return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear();", "    return d.toLocaleDateString('is-IS', { day: 'numeric', month: 'short', year: 'numeric' });"),
 ('chyti', 'verify_datum_ui.js', 'v2/runar-tree.js', 'replace', '  return datumUI(iso, lang);', "  return new Date(iso).toLocaleDateString('en-GB');"),
 # ㊽ čitelnost (2026-10-11, CODE-tune): upozornění zpět s průhledností 0,45 (2,41 : 1) · podnadpis úvodu barvou --dim (§5)
 ('chyti', 'verify_citelnost.js', 'v2/runar-reader.css', 'replace', "letter-spacing:0;color:var(--muted);line-height:1.6;}", "letter-spacing:0;color:var(--muted);opacity:0.45;line-height:1.6;}"),   # 2026-10-20: upozornění nese .fine (dřív .q-teaser-txt)
 ('chyti', 'verify_citelnost.js', 'v2/runar-reader.css', 'replace', '.hero-sub{font-size:1.12em;color:var(--muted);', '.hero-sub{font-size:1.12em;color:var(--dim);'),
 # ㊽ (B) zaseklá angličtina: buňka tierů zase bez id · anglická věta s „Rúnar“ (její „ú“ ji nesmí pustit jako islandskou)
 ('chyti', 'verify_citelnost.js', 'v2/runar-help.html', 'replace', '<td id="tier-lbl-seeker">RUNE SEEKER</td>', '<td>RUNE SEEKER</td>'),
 ('obchazka', 'verify_citelnost.js', 'v2/runar-help.html', 'replace', '</body>', '<p>Rúnar reads the runes for you.</p></body>'),
 # ㊽ (C) okno přepnutí jazyka zase natvrdo anglicky · ㊾ anglický text natvrdo v JS readeru (i příkaz na dvou řádcích)
 ('chyti', 'verify_citelnost.js', 'v2/runar-app.js', 'replace', "  document.getElementById('lsm-title').textContent   = tp('lsm_title', { language: jmeno(tl).toUpperCase() });", "  document.getElementById('lsm-title').textContent   = 'SPEAK AGAIN IN ' + jmeno(tl).toUpperCase() + '?';"),
 ('chyti', 'verify_en_natvrdo.js', 'v2/runar-app.js', 'replace', "  document.getElementById('lsm-cost').textContent    = cena.toUpperCase();", "  document.getElementById('lsm-cost').textContent    = '1 CREDIT LEFT';"),
 ('obchazka', 'verify_en_natvrdo.js', 'v2/runar-reading.js', 'replace', "    setSt('st-voice', _voiceErrMsg(null, 0), 'err');", "    setSt('st-voice',\n      `Voice error: ${err && err.message}`, 'err');"),
 # ㊽ (D) Deník po přepnutí jazyka: setLang ho nepřekreslí · překreslí bez aktivního filtru
 ('chyti', 'verify_citelnost.js', 'v2/runar-app.js', 'replace', "  if (activeAppTab === 'journal' && typeof prekresliDenik === 'function') prekresliDenik();", "  // (útok: Deník se po přepnutí jazyka nepřekreslí)"),
 ('obchazka', 'verify_citelnost.js', 'v2/runar-journal.js', 'replace', "  if (filtr) filterJournal(); else renderJournal(_journalCache);", "  renderJournal(_journalCache);"),
 # pojistky prohlížeče (scripts/utils/prohlizec_pojistky.js): dialog na stránce nesmí kontrolu zablokovat — musí doběhnout s FAIL
 ('chyti', 'verify_wts.js', 'v2/runar-app.js', 'append', '', "\nsetTimeout(function () { alert('útok: dialog'); }, 2500);\n"),
 # ㊽ (E) Rúnakort: zase 1. pád po „með“ · zase kalk „SLÁÐU INN {card} KÓÐA“
 ('chyti', 'verify_citelnost.js', 'v2/runar-auth.js', 'replace', "card: vl('card', lang, 'dat')", "card: vl('card', lang)"),
 ('chyti', 'verify_citelnost.js', 'v2/runar-translations.js', 'replace', "'ᚠ SLÁÐU INN KÓÐANN Á {card}'", "'ᚠ SLÁÐU INN {card} KÓÐA'"),
 # ㊽ (F) selhaný profil: chyba z databáze zase přejitá jako prázdný profil · pruh zase bez načteného profilu
 ('chyti', 'verify_citelnost.js', 'v2/runar-app.js', 'replace', "    if (error) throw error;   // 2026-10-12", "    if (false) throw error;   // 2026-10-12"),
 ('chyti', 'verify_citelnost.js', 'v2/runar-auth.js', 'replace', "    if (typeof profileLoaded !== 'undefined' && !profileLoaded) {", "    if (false) {"),
 # ㊽ (B) zástupný text e-mailu zase natvrdo (setPH pryč)
 ('chyti', 'verify_citelnost.js', 'v2/runar-app.js', 'replace', "  setPH('auth-email', t('auth_email_ph'));", "  // (útok: zástupný text e-mailu zůstane z HTML)"),
 # ㊼ verze v hlášení (2026-10-11, CODE-tune): verze rozjetá se sw.js, reportér zpět na nasazenou, worker zase chytá sw.js, soubor mimo precache
 ('chyti', 'verify_verze_hlaseni.js', 'v2/runar-verze.js', 'regex', r"RUNAR_VERZE = 'v\d+'", "RUNAR_VERZE = 'v1'"),
 ('chyti', 'verify_verze_hlaseni.js', 'v2/runar-reporter.js', 'replace', '      app_version: verzeHlaseni(),', "      app_version: VERZE_NASAZENA || 'unknown',"),
 ('chyti', 'verify_verze_hlaseni.js', 'v2/sw.js', 'regex', r"  if \(url\.pathname\.endsWith\('/sw\.js'\)\) return;\r?\n", ''),
 ('chyti', 'verify_verze_hlaseni.js', 'v2/sw.js', 'regex', r"  '/Runar-admin/v2/runar-verze\.js',\r?\n", ''),
 ('chyti', 'verify_rune_glyphs.js', 'v2/runar-readings-admin.js', 'replace', "var glyph = _rr ? runeSvg(_rr, { frame: false }) : esc(r.rune_glyph || '◻');", "var glyph = esc(r.rune_glyph || '◻');"),
 ('chyti', 'verify_lang_ternary.js', 'v2/runar-app.js', 'append', '', "\nvar _protiTern = lang === 'is' ? 'halló' : 'hello';\n"),
 # kolo 3 / 4g (2026-10-11): soulad kódu s docy a cesty dat. Texty útoků jsou poskládané z kousků (`'…' + '.md'`), aby tenhle
 # soubor sám nenesl vzor, který ty kontroly hlídají — smoke ho na tom 2026-10-11 chytil.
 # verify_decisions_followthrough útok nemá — čte git blame a necommitnuté
 # řádky záměrně přeskakuje (memory guard-test-the-lifecycle); útok by potřeboval commit s obsahem, ne jen prázdný (režim commit).
 ('chyti', 'verify_code_doc_refs.js', 'v2/runar-app.js', 'append', '', '\n// podrobnosti viz docs/neexistuje-protipriklad-xyz' + '.md\n'),
 ('chyti', 'verify_contract_wiring.js', 'v2/runar-character.js', 'replace', 'function _registerContext(seeking, lang) {', "function _registerContext(seeking, lang) { return '';"),
 ('chyti', 'verify_page_copies.js', 'v2/runar-help.html', 'replace', 'id="s1-lbl">HOW A READING WORKS', 'id="s1-lbl">HOW A READING WORKED'),
 ('chyti', 'verify_ui_text_used.js', 'v2/runar-translations.js', 'replace', "    opus_toggle:      'Read with Opus 5 (test)',", "    opus_toggle:      'Read with Opus 5 (test)',\n    zz_protipriklad_mrtvy: 'dead key',"),
 ('chyti', 'verify_runar_root.js', 'scripts/utils/stats.js', 'append', '', "\nconst _protiCesta = 'C:/Users/zkuku/Downloads/" + "Runar-admin/v2';\n"),
 ('obchazka', 'verify_runar_root.js', 'scripts/utils/stats.js', 'append', '', "\nconst _protiCesta2 = 'C:" + chr(92) * 2 + "Users" + chr(92) * 2 + "zkuku" + chr(92) * 2 + "Downloads" + chr(92) * 2 + "Runar-admin';\n"),
 ('obchazka', 'verify_code_doc_refs.js', 'v2/runar-reader.css', 'append', '', '\n/* podrobnosti viz docs/neexistuje-protipriklad-css' + '.md */\n'),
 ('chyti', 'verify_tree_signals.js', 'v2/runar-tree.js', 'replace', '(row.aol || null)', 'null'),
 # kolo 3 / 4i (2026-10-11): Ask nápověda, kolekce, páky promptu, databáze čtení. Kontroly bez útoku → BEZ_UTOKU níž.
 ('chyti', 'verify_ask_hints.js', 'v2/runar-reading.js', 'replace', 'var many = dr.length > 1, life = u.lifeRune;', 'var many = true, life = u.lifeRune;'),
 ('chyti', 'verify_coll_shape.js', 'v2/runar-app.js', 'replace', "document.getElementById('cd-shape').textContent    = (_tv && typeof _tv === 'object' && _tv[r.n]) || '';", "document.getElementById('cd-shape').textContent    = '';"),
 ('chyti', 'verify_prompt_levers.js', 'v2/runar-character.js', 'regex', r"    _kus\('ADDRESS', 'address \(gender\)', 'whole', _addressContext\(lang\)\),(\r?\n    // _describeRule)", r'\g<1>'),   # 2026-10-22: řádek obalený _kus
 ('chyti', 'verify_readings_db.js', 'v2/runar-readings-admin.js', 'replace', "var rows = (typeof RUNE_IMAGES !== 'undefined') ? RUNE_IMAGES : [];", 'var rows = [];'),
 # kolo 3 / 4j (2026-10-11). Kontroly bez útoku jmenovitě s důvodem → BEZ_UTOKU (od 2026-10-15; do té doby výčet stál tady).
 ('chyti', 'verify_pill_lang.js', 'v2/runar-app.js', 'replace', 'function _syncPillLang() {', 'function _syncPillLang() { return;'),
 ('chyti', 'verify_prompt_rules_registry.js', 'v2/runar-character.js', 'replace', 'Never name the life rune.', 'Never mention the life rune.'),
 # 2026-10-12 (CODE-tune): úplnost ㉜ — builder bez registru i bez výjimky musí kontrolu shodit; i se jménem s číslicí (regex
 # `build[A-Za-z]+\(` ho neviděl). Jméno složené z kousků, ať ho nenajde kontrola, která hledá jména funkcí i ve scripts/.
 ('chyti', 'verify_prompt_rules_registry.js', 'v2/runar-character.js', 'append', '', '\nfunction build' + 'PodstrcenyPrompt(u) { return "x"; }\n'),
 ('obchazka', 'verify_prompt_rules_registry.js', 'v2/runar-character.js', 'append', '', '\nfunction build' + 'PodstrcenyPrompt2(u) { return "x"; }\n'),
 # 2026-10-12 (CODE-tune): ㊿ — bez filtru účtu by fronta poslala cizí čtení / cizí Ask pod právě přihlášeným účtem.
 ('chyti', 'verify_fronta_ucet.js', 'v2/runar-utils.js', 'replace', "var reads = _pendGet('pendingReadings').filter(_mine);", "var reads = _pendGet('pendingReadings');"),
 ('chyti', 'verify_fronta_ucet.js', 'v2/runar-utils.js', 'replace', "var asks = _pendGet('pendingAsks').filter(_mine);", "var asks = _pendGet('pendingAsks');"),
 # 2026-10-12 (CODE-tune): ㊀ — builder, který zapomene předat jazyk (spready), a pomocník, který parametr ignoruje.
 ('chyti', 'verify_jazyk_parametr.js', 'v2/runar-character.js', 'replace', "return rk(r, lang).split(", "return rk(r).split("),
 ('obchazka', 'verify_jazyk_parametr.js', 'v2/runar-utils.js', 'replace', "function rn(r, l)  { return (l || lang) === 'is'", "function rn(r, l)  { return lang === 'is'"),
 # 2026-10-12 (CODE-tune): nápovědy pod „+“ — 2026-10-10 je úklid smazal jako mrtvé a „+“ ukazoval holý klíč „area_hint“.
 ('chyti', 'verify_citelnost.js', 'v2/runar-translations.js', 'replace', "    seek_hint:        'This sets the tone.',", ''),
 # 2026-10-12 (CODE-tune): „+“ s upozorněním u otázky (DECISIONS 2026-10-12 (7)) zmizí z popisku — (G) to musí poznat.
 ('chyti', 'verify_citelnost.js', 'v2/runar-app.js', 'replace', "qlbl.innerHTML = _tgl('qpriv', t('q_lbl') + ' <span class=\"opt\">'+t('opt')+'</span>');", "qlbl.innerHTML = t('q_lbl') + ' <span class=\"opt\">'+t('opt')+'</span>';"),   # 2026-10-20: nový tvar řádku (ab0cf88)
 # 2026-10-12 (CODE-tune): práh (A) 4,5 : 1 — „(OPTIONAL)“ zpátky na průhlednost 0,45 (3,12 : 1) musí shodit kontrolu.
 ('chyti', 'verify_citelnost.js', 'v2/runar-reader.css', 'replace', '.opt{opacity:0.65;', '.opt{opacity:0.45;'),
 # 2026-10-12 (CODE-tune): ㊽ (H) — brána souhlasu u otázky obejitá ve čtení a v Asku (DECISIONS 2026-10-12 (7)).
 ('chyti', 'verify_citelnost.js', 'v2/runar-reading.js', 'replace', "if (_qEl && _qEl.value.trim() && _needsQuestionConsent()) {", "if (false) {"),
 ('chyti', 'verify_citelnost.js', 'v2/runar-reading.js', 'replace', "  if (_needsQuestionConsent()) { _showQuestionConsent(inp);", "  if (false) { _showQuestionConsent(inp);"),
 ('obchazka', 'verify_ui_text_used.js', 'scripts/verify_ui_text_used.js', 'replace', " && !post.some((p) => k.endsWith(p))", ''),
 ('chyti', 'verify_pravidla_mapa.js', 'scripts/utils/pravidla_mapa.json', 'replace', '"pravidla": ["§30"],', '"pravidla": ["§99"],'),
 # kolo 3 / 4h (2026-10-11): obrazy, kalendář, myšlenka ✦, zrcadlo parseru
 ('chyti', 'verify_compose_mirror.js', 'v2/runar-character.js', 'replace', "var reading = segs.map(function (x) { return x.text; }).join(' ').trim();", "var reading = segs.map(function (x) { return x.text; }).join('  ').trim();"),
 ('chyti', 'verify_icelandic_calendar.js', 'v2/runar-character.js', 'replace', "if (doZimy <= 90) return 'heyannir';", "if (doZimy <= 120) return 'heyannir';"),
 ('chyti', 'verify_image_area.js', 'v2/runar-character.js', 'replace', 'function _imgPodleOblasti(cand, area) {', 'function _imgPodleOblasti(cand, area) { return cand;'),
 ('chyti', 'verify_image_motifs.js', 'v2/runar-character.js', 'replace', 'if (lastMotif) cand.forEach(', 'if (false) cand.forEach('),
 ('chyti', 'verify_image_register.js', 'v2/runar-character.js', 'replace', "bigger than it was in spring.','auður','wealth','P']", "bigger than it was in spring.','auður','wealth','X']"),
 ('chyti', 'verify_thought.js', 'v2/runar-reading.js', 'replace', "return !!(TIERS[isAdmin(currentUser.email) ? 'premium' : userTier] || {}).reading_thought;", 'return true;'),
 ('chyti', 'verify_is_kontrola_jedno_misto.js', 'memory/working-style.md', 'append', '', '\nKontrola IS: napřed check-' + 'is.py, pak is-' + 'greynir.py.\n'),
 # strom ㉳ (CODE-tree 2026-10-11): mutace z hlavičky verify_tree_mista převedené na opakované útoky. Kontrola si lab staví z builderu
 # do dočasné složky, takže útok míří na build_crown_composer.py. (a) dvě ramena v jedné výšce — přes výšky zón XLF, ne exitMinPx
 # (exitMinPx 30→5 kontrola propustila: rozestup na jejích 12 stromech drží výšky zón, min. 49 px i s 5 px); (s) seeking koření;
 # (t) návrat prohloubí kořen; (u) minulost a nitro prohlubují víc; (v) kořeny Noren hlavní.
 ('chyti', 'verify_tree_mista.js', 'build_crown_composer.py', 'replace', 'var XLF=[0.26, 0.36, 0.46, 0.56, 0.66, 0.76]', 'var XLF=[0.26, 0.26, 0.46, 0.46, 0.66, 0.66]'),
 ('chyti', 'verify_tree_mista.js', 'build_crown_composer.py', 'replace', '      if(_SL) bendRootPaths(rG.paths, kSh);', '      if(false) bendRootPaths(rG.paths, kSh);'),
 ('chyti', 'verify_tree_mista.js', 'build_crown_composer.py', 'replace', 'rTT.length*=1+0.5*fR+0.8*exMax;', 'rTT.length*=1+0.8*exMax;'),
 ('chyti', 'verify_tree_mista.js', 'build_crown_composer.py', 'replace', 'rTT.length*=1+0.5*fR+0.8*exMax;', 'rTT.length*=1+0.5*fR;'),
 ('chyti', 'verify_tree_mista.js', 'build_crown_composer.py', 'replace', 'if(_SL && !dirO && be && be.nornName){ rTT.length*=1.4;', 'if(false){ rTT.length*=1.4;'),
 # strom v aplikaci = lab (㊶, CODE-tree 2026-10-11): změna labu bez nového v2/runar-tree-prod.js musí kontrolu shodit
 ('chyti', 'verify_tree_prod_sync.js', 'build_crown_composer.py', 'replace', 'var XLF=[0.26, 0.36, 0.46, 0.56, 0.66, 0.76]', 'var XLF=[0.27, 0.36, 0.46, 0.56, 0.66, 0.76]'),
 # rituál založení (㊷, CODE-tree 2026-10-11): tlačítko založení bez stavby mřížky = owner v produkci „neukážou se runy“
 ('chyti', 'verify_zalozeni_stromu.js', 'v2/runar-tree.js', 'replace', "if (typeof buildGrid === 'function') buildGrid();", 'if (false) buildGrid();'),
 # rám záložky stromu (CODE-tree 2026-10-11, DECISIONS (62)): přehrávání bez výšky rámu (posuvník by skákal), plátno bez oříznutí,
 # „celý strom“ vizuálně pod − (obě tlačítka by se posunula) → ㊷ musí spadnout
 ('chyti', 'verify_zalozeni_stromu.js', 'v2/runar-tree.js', 'replace', 'frameH: full ? null : _treeFrameH', 'frameH: null'),
 # dialog v rituálu (CODE-tree 2026-10-11): blokoval by stránku i kontrolu navždy — ㊷ ho teď potvrdí a ohlásí jako FAIL, nezasekne se
 ('chyti', 'verify_zalozeni_stromu.js', 'v2/runar-tree.js', 'replace', "if (typeof showToast === 'function') showToast(t('tree_founding_toast'));", "alert('x'); if (typeof showToast === 'function') showToast(t('tree_founding_toast'));"),
 ('chyti', 'verify_zalozeni_stromu.js', 'v2/runar-tree-prod.js', 'replace', '_Hc=Math.ceil(_t1-_t0)+FRAME_TOP+FRAME_BOT;', '_Hc=H;'),
 ('chyti', 'verify_zalozeni_stromu.js', 'v2/runar-reader.html', 'replace', 'id="tree-zoom-all" type="button" onclick="treeZoomAll()" style="display:none;"', 'id="tree-zoom-all" type="button" onclick="treeZoomAll()" style="display:none;order:3;"'),
 # hlas patří ke čtení (㊸, CODE-tune 2026-10-11, DECISIONS (61)): holý text pro každého, podpis bez kontroly textu, server čte i myšlenku ✦,
 # cizí čtení, deník bez hlasu u single → musí spadnout; komentář navíc nesmí
 ('chyti', 'verify_hlas_ke_cteni.js', 'supabase/functions/elevenlabs-proxy/index.ts', 'replace', '    if (text === null) return json({ error: "voice_unbound" }, 403);', '    if (text === null) text = typeof body?.text === "string" ? body.text : "";'),
 ('chyti', 'verify_hlas_ke_cteni.js', 'supabase/functions/_shared/voice_ticket.ts', 'replace', '  return ok ? nonce : null;', '  return nonce;'),
 ('chyti', 'verify_hlas_ke_cteni.js', 'supabase/functions/_shared/voice_ticket.ts', 'replace', 'const i = s.indexOf("\u2726");', 'const i = -1;'),
 ('chyti', 'verify_hlas_ke_cteni.js', 'supabase/functions/elevenlabs-proxy/index.ts', 'replace', '.eq("id", reading_id).eq("user_id", userId)', '.eq("id", reading_id)'),
 ('chyti', 'verify_hlas_ke_cteni.js', 'v2/runar-journal.js', 'regex', r'        \$\{_jHlas\(e, i\)\}\r?\n', ''),
 ('nesmi', 'verify_hlas_ke_cteni.js', 'supabase/functions/elevenlabs-proxy/index.ts', 'append', '', '\n// komentář navíc — správný kód\n'),
 # 2026-10-13 (CODE-tune): zámek „jednou“ zmizí → ㊸ musí spadnout; zmínka domény ElevenLabs nad zámkem (jako mazání historie) nesmí.
 ('chyti', 'verify_hlas_ke_cteni.js', 'supabase/functions/elevenlabs-proxy/index.ts', 'replace', 'from("voice_tickets").insert({ id: zamek, user_id: userId })', 'from("voice_tickets").select("id").eq("id", zamek)'),
 ('nesmi', 'verify_hlas_ke_cteni.js', 'supabase/functions/elevenlabs-proxy/index.ts', 'replace', 'const EL_API_KEY     = Deno.env.get("ELEVENLABS_API_KEY");', 'const EL_API_KEY     = Deno.env.get("ELEVENLABS_API_KEY");   // api.elevenlabs.io (jen zmínka)'),
 # strop 5 pro všechny se nesmí vrátit; strop testera musí být živý (⑨, 2026-10-11)
 ('chyti', 'verify_monthly_limits.js', 'v2/runar-config.js', 'append', '', '\nconst VOICE_MONTHLY_' + 'LIMIT = 5;\n'),
 ('chyti', 'verify_monthly_limits.js', 'supabase/functions/elevenlabs-proxy/index.ts', 'replace', 'if (vprof?.is_tester && vUsed >= VOICE_MONTHLY_LIMIT_TESTER) {', 'if (false) {'),
 # věta o hlasu předplatitele nesmí slibovat měsíční počet (㉫, 2026-10-11)
 ('chyti', 'verify_tier_features.js', 'v2/runar-config.js', 'replace', "if (v === 'month') return 'Rúnar les hverja ' + VOCAB.cast.is + ' upphátt.';", "if (v === 'month') return 'Rúnar les allt að 5 ' + VOCAB.cast.is_pl + ' upphátt á mánuði.';"),
 # hlas v appce (㊹, CODE-tune 2026-10-11): hlas k poslednímu čtení místo k tomu na obrazovce · zakládací Norny s hlasem v deníku ·
 # počet hlasů v menu i netesterovi → musí spadnout
 ('chyti', 'verify_hlas_appka.js', 'v2/runar-reading.js', 'replace', 'reading_id: _rt.id || undefined,', 'reading_id: _lastReadingId || undefined,'),
 ('chyti', 'verify_hlas_appka.js', 'v2/runar-journal.js', 'replace', "if (!e || !e.id || (typeof _foundingReadingId !== 'undefined' && e.id === _foundingReadingId)) return '';", "if (!e || !e.id) return '';"),
 ('chyti', 'verify_hlas_appka.js', 'v2/runar-app.js', 'regex', r'if \(isTester\) \{(\r?\n\s+const vLimit = VOICE_MONTHLY_LIMIT_TESTER;)', r'if (true) {\1'),
 # okno „Where to start“ (㊺, CODE-tune 2026-10-11, DECISIONS (65)): popisek doprostřed obrazovky (let není vidět — první verze), appka si
 # nepamatuje, že okno viděl, okno se při startu vůbec neukáže → musí spadnout; komentář navíc nesmí
 ('chyti', 'verify_wts.js', 'v2/runar-app.js', 'replace', 'chci = vyska * 0.2;', 'chci = vyska * 0.5 - 10;'),
 ('chyti', 'verify_wts.js', 'v2/runar-app.js', 'replace', "  try { localStorage.setItem(WTS_KLIC, '1'); } catch (e) {}", ''),
 ('chyti', 'verify_wts.js', 'v2/runar-app.js', 'replace', '  setTimeout(maybeShowWhereToStart, 1800);', ''),
 ('nesmi', 'verify_wts.js', 'v2/runar-app.js', 'append', '', '\n// komentář navíc — správný kód\n'),
 # ㊋ soupis komponent (2026-10-20, CODE-tune): nová třída mimo soupis · zaoblení · nová barva natvrdo · třída ze soupisu zmizí
 ('chyti', 'verify_komponenty.js', 'v2/runar-reader.css', 'append', '', '\n.okno-jine{border:1px solid var(--gold);}\n'),
 ('chyti', 'verify_komponenty.js', 'v2/runar-reader.css', 'append', '', '\n.fine{border-radius:6px;}\n'),
 ('chyti', 'verify_komponenty.js', 'v2/runar-reader.css', 'append', '', '\n.fine{color:#123abc;}\n'),
 ('chyti', 'verify_komponenty.js', 'v2/runar-reader.css', 'replace', '.fine{font-family', '.drobna{font-family'),
 # ㊌ skládání promptu na serveru (2026-10-21, CODE-tune): změna builderu bez přegenerovaného balíčku · balíček s jinou náhodou
 ('chyti', 'verify_prompt_skladani.js', 'v2/runar-character.js', 'replace', 'Lestu allar sjö sem eina samfellda frásögn', 'Lestu allar sjö sem eina frásögn'),
 ('chyti', 'verify_prompt_skladani.js', 'supabase/functions/_shared/prompt_skladani.mjs', 'replace', 'Math.random = P.random || globalThis.Math.random;', 'Math.random = globalThis.Math.random;'),
 # ㊍ stín skládání promptu (2026-10-21, CODE-tune): záznamník nepošle sáček obrazů · nezapíše náhodu
 ('chyti', 'verify_prompt_stin.js', 'v2/runar-app.js', 'replace', '    if (/^season(bag|motif|last)_/.test(k)) o[k] = localStorage.getItem(k); } } catch (e) {}', '    } } catch (e) {}'),
 ('chyti', 'verify_prompt_stin.js', 'v2/runar-app.js', 'replace', 'Math.random = function () { var x = puv(); los.push(x); return x; };', 'Math.random = function () { return puv(); };'),
 # ㊎ mapa ochran (2026-10-21, CODE-read): vypnutá brána · obrácený limit · nová ochrana bez zápisu · nový mode · nová funkce
 ('chyti', 'verify_mapa_ochran.js', 'supabase/functions/claude-proxy/index.ts', 'replace', 'if (!userId) return json({ error: "unauthorized" }, 401);', 'if (false && (!userId)) return json({ error: "unauthorized" }, 401);'),
 ('chyti', 'verify_mapa_ochran.js', 'supabase/functions/send-line/index.ts', 'replace', 'if (zprava.length > MAX_ZNAKU)', 'if (zprava.length < MAX_ZNAKU)'),
 ('chyti', 'verify_mapa_ochran.js', 'supabase/functions/reset-tree/index.ts', 'replace', '    if (!prof?.is_tester) return', '    if (!user.email) return json({ error: "x" }, 403);\n    if (!prof?.is_tester) return'),
 ('chyti', 'verify_mapa_ochran.js', 'supabase/functions/claude-proxy/index.ts', 'replace', 'if (!prompt && mode !== "resave"', 'if (mode === "free" + "bie") return json({ ok: 1 });\n    if (!prompt && mode !== "resave"'),
 ('chyti', 'verify_mapa_ochran.js', 'supabase/functions/proti-nova/index.ts', 'create', '', 'serve(async (req) => new Response("x"));\n'),
 # ㊏ nic před přihlášením: dnešní chyba (stín před bránou) · zápis před bránou · rate limit podle IP před bránou smí
 ('chyti', 'verify_nic_pred_prihlasenim.js', 'supabase/functions/claude-proxy/index.ts', 'replace', 'if (!userId) return json({ error: "unauthorized" }, 401);', 'if (prompt && body.stin && typeof body.stin === "object") stinPorovnej(body.stin, system, prompt); ' + 'if (!userId) return json({ error: "unauthorized" }, 401);'),
 ('chyti', 'verify_nic_pred_prihlasenim.js', 'supabase/functions/delete-account/index.ts', 'replace', '    if (authErr || !user) return json({ error: "Invalid session" }, 401);', '    await sb.from("bug_reports").insert({ x: 1 });\n    if (authErr || !user) return json({ error: "Invalid session" }, 401);'),
 ('nesmi', 'verify_nic_pred_prihlasenim.js', 'supabase/functions/claude-proxy/index.ts', 'replace', 'if (!userId) return json({ error: "unauthorized" }, 401);', 'await sb().rpc("check_rate_limit", { p_key: "x" }); ' + 'if (!userId) return json({ error: "unauthorized" }, 401);'),
 # ㊐ Google Play bez nákupu (2026-10-21, CODE-read): značka AGNDOFA zase s odkazem · nápověda bez větve Play · okno cesty jako na webu
 ('chyti', 'verify_play_bez_nakupu.js', 'v2/runar-app.js', 'replace', "if (_ig) { _ig.style.display = (!_play && ", "if (_ig) { _ig.style.display = ("),   # 2026-10-28: Instagram v menu i v Play (dřív útok na značku RÚNAR → web; značka od 228c8f1c vede domů v appce)
 ('chyti', 'verify_play_bez_nakupu.js', 'v2/runar-help.html', 'regex', r'(<body[^>]*>)', r'\g<1><p><a href="https://agndofa.my' + 'shopify.com/">Shop</a></p>'),
 ('nesmi', 'verify_play_bez_nakupu.js', 'v2/runar-help.html', 'regex', r'(<body[^>]*>)', r'\g<1><p><a href="https://therunekeeper' + '.com/kort/">Rúnakort</a></p>'),
 ('chyti', 'verify_play_bez_nakupu.js', 'v2/runar-app.js', 'replace', "if (src === 'play') return 'play';", "if (src === 'play') return 'web';"),
('chyti', 'verify_ritual_hlas.js', 'v2/runar-translations.js', 'replace', 'and think about what is on your heart. When', 'and think about what is in your heart. When'),   # 2026-10-28: text rituálu změněný bez nové nahrávky
('chyti', 'verify_hlas_rezie.js', 'supabase/functions/_shared/voice_direction.ts', 'replace', '  return bezZnacek(znackovany) === bezZnacek(puvodni);', '  return true;'),   # 2026-10-29: pojistka značek vypnutá — model by smel změnit slovo
('chyti', 'verify_hlas_rezie.js', 'supabase/functions/elevenlabs-proxy/index.ts', 'replace', 'text: recText,', 'text,'),   # 2026-10-29: proxy pošle do ElevenLabs syrový text místo připraveného
 ('chyti', 'verify_play_bez_nakupu.js', 'v2/runar-help.html', 'regex', r'(<body[^>]*>)', r'\g<1><p><a href="https://www.insta' + 'gram.com/runartherunekeeper/">Instagram</a></p>'),   # 2026-10-27: Instagram = nepřímá cesta k nákupu
 # ㊑ web × appka (2026-10-21, CODE-read): dnešní chyba (web znovu deklaruje jméno z configu) · appka přejmenuje funkci, kterou web volá
 ('chyti', 'verify_web_appka_jmena.js', 'web/site/web.js', 'replace', "var RUNAR_APP_URL = ", "var RUNAR_HOME_URL = 'x';\nvar RUNAR_APP_URL = "),
 ('chyti', 'verify_web_appka_jmena.js', 'v2/runar-utils.js', 'replace', 'function kamenUctuSvg(', 'function kamenUctuSvgX('),
 # ㊖ hlavičky webu (2026-10-27, CODE-web): stránka bez ikony · veřejný landing bez og:image · rozbitý místní odkaz ·
 #   komentář s falešnou značkou a odkazem kontrolu nezastaví (čte stránku bez komentářů)
 ('chyti', 'verify_web_hlavicky.js', 'web/site/ferdin/index.html', 'replace', '<link rel="icon" ', '<link rel="x-icon" '),
 ('chyti', 'verify_web_hlavicky.js', 'web/site/index.html', 'replace', '<meta property="og:image" ', '<meta property="og:imageX" '),
 ('chyti', 'verify_web_hlavicky.js', 'web/site/heim/index.html', 'replace', 'href="../ferdin/"', 'href="../ferdinX/"'),
 ('nesmi', 'verify_web_hlavicky.js', 'web/site/kort/index.html', 'replace', '<title>', '<!-- <meta data-meta="neni_klic" content=""> <a href="nikam/"> -->\n<title>'),
 # ㊒ bez Supabase Storage (2026-10-22, CODE-read): portrét zpět ze Storage v appce · obrázek ze Storage ve webu
 ('chyti', 'verify_bez_storage.js', 'v2/runar-reader.html', 'regex', r'src="img/runar-portrait\.webp"', 'src="https://x.supabase.co/storage/v1/object/' + 'public/runar-images/Runar_portrait.png"'),
 ('chyti', 'verify_bez_storage.js', 'web/site/heim/index.html', 'regex', r'(<body[^>]*>)', r'\g<1><img src="https://x.supabase.co/storage/v1/object/' + 'public/a.png">'),
    # 2026-10-22 (CODE-tune): řádek builderu bez _kus — anatomie ho nesmí tiše vynechat (oblast v jedné runě)
    ('chyti', 'verify_anatomie_promptu.js', 'v2/runar-character.js', 'replace',
     "_kus('AREA', 'area + face draw', 'whole (where the image lands)', u.area ? _domainContext(u.area, lang, areaFace) : '')",
     "u.area ? _domainContext(u.area, lang, areaFace) : ''"),
 # ㊔ appka na telefonu (2026-10-22, CODE-read; ㊓ = anatomie promptu): tlačítko širší než telefon (dřív slepé: oříznutí v kartě + innerWidth po oddálení)
 ('chyti', 'verify_telefon.js', 'v2/runar-reader.css', 'append', '', '\n#begin-btn{min-width:520px}\n'),
 # přehrávač-svíčka (CODE-tune 2026-10-29): prázdné místo vlevo (jako náhled 2) = nesouměrné mezery · posun po svíčce nehne zvukem
 ('chyti', 'verify_telefon.js', 'v2/runar-svicka.js', 'replace', 'yb = yt + vy, x0 = 6, x1, L;', 'yb = yt + vy, x0 = 30, x1, L;'),
 ('chyti', 'verify_telefon.js', 'v2/runar-svicka.js', 'replace', '    S.p = nq; a.currentTime = Math.min(nq * dl, Math.max(0, dl - 0.05));', '    S.p = nq;'),
 ('chyti', 'verify_telefon.js', 'v2/runar-svicka.js', 'replace', "    if (max > 0 && fs > 0) ct.style.width = dr.style.width =", "    if (false) ct.style.width = dr.style.width ="),   # čas bez pevné šířky posouvá svíčku
 ('chyti', 'verify_telefon.js', 'v2/runar-svicka.js', 'replace', "    if (svisla && S.delka < 1) {   // svislá: napřed se od knotu dolů vytáhne", "    if (false) {   // svislá: napřed se od knotu dolů vytáhne"),   # svislá svíčka se nevytáhne
 ('chyti', 'verify_telefon.js', 'v2/runar-app.js', 'replace', '  if (_predTab !== tab) svickaZtisVse();', '  if (false) svickaZtisVse();'),   # hlas mluví dál po přepnutí záložky
 ('chyti', 'verify_telefon.js', 'v2/runar-svicka.js', 'replace', 'ukaz(true); rozmer(); zamcena();', 'ukaz(true); rozmer();'),   # zamčená obrazovka bez názvu a ovládání
 # runa na zamčené obrazovce (owner 2026-10-30 „6. ok“) · papír (owner 2026-10-30): ťuknutí vedle ho nestáhne · nota ho nerozvine
 ('chyti', 'verify_telefon.js', 'v2/runar-svicka.js', 'replace', "    var obr = runa ? _svickaObrazRuny(runa,", "    var obr = false ? _svickaObrazRuny(runa,"),
 ('chyti', 'verify_telefon.js', 'v2/runar-app.js', 'replace', "      if (obal && _papirOtevreny(k) && !obal.contains(e.target)) _papirZavri(k);", ""),   # ťuknutí vedle papír nestáhne
 ('chyti', 'verify_telefon.js', 'v2/runar-app.js', 'replace', "      _papirOtevri(k, function () { svickaPrepni(c.prefix); });", "      svickaPrepni(c.prefix);"),   # nota papír nerozvine
 # čekání na hlas (owner 2026-10-30 „10. ok“): svíčka se při čekání netvoří
 ('chyti', 'verify_telefon.js', 'v2/runar-svicka.js', 'replace', "    if (S.stav === 'tvori') S.p = tvorP(performance.now() - S.tv0);", "    if (false) S.p = tvorP(performance.now() - S.tv0);"),
 # hlas návodu „How a reading works“ (owner 2026-10-30): nahrávka bez hostitele v appce · návod změněný bez nové nahrávky
 ('chyti', 'verify_telefon.js', 'v2/runar-app.js', 'replace', "{ prefix: 'nav', host: 'guide-voice',", "{ prefix: 'nav', host: 'guide-voice-x',"),
 ('chyti', 'verify_ritual_hlas.js', 'v2/runar-translations.js', 'replace', "'Segðu mér hvað þú leitar að. Þá veit ég hvernig ég á að tala.'", "'Segðu mér hvað þú leitar að. Þá veit ég hvernig ég tala.'"),
 # verify_onclick_funkce.js (CODE-read 2026-10-22): přejmenovaná funkce v onclick v HTML · v šabloně v JS · metoda po tečce není funkce appky
 ('chyti', 'verify_onclick_funkce.js', 'v2/runar-reader.html', 'replace', 'onclick="treeZoomAll()"', 'onclick="treeZoomVse()"'),
 ('chyti', 'verify_onclick_funkce.js', 'v2/runar-journal.js', 'replace', 'onclick="playReadingVoice(', 'onclick="playReadingVoiceX('),
 ('nesmi', 'verify_onclick_funkce.js', 'v2/runar-reader.html', 'replace', 'onclick="treeZoomAll()"', 'onclick="event.stopPropagation(); treeZoomAll()"'),
]


# Kontroly ve smoke, které útok mít nemůžou nebo si chybu podstrčí samy — JMENOVITĚ s důvodem (2026-10-15, CODE-read, kolo 4).
# Proč: §30 říká „nová kontrola = aspoň jeden útok v PRIPADY“, ale nic to nevynucovalo — výjimky stály jen v komentáři u kol 3/4i a 4j
# a kontrola přidaná bez útoku by prošla tiše. Teď: kontrola ve smoke.py, která není v PRIPADY ani tady → FAIL.
BEZ_UTOKU = {
    'verify_open_reports.js': 'čte hlášení z produkční DB — podstrčit by šlo jen zápisem do DB',
    'verify_inbox_freshness.js': 'stáří z historie gitu — podstrčit by šlo jen commitem se zfalšovaným datem',
    'verify_prelaunch_open.js': 'jen vypisuje, nikdy nepadá',
    'verify_zaklad_produkce.js': 'chybu si podstrčí sama v každém běhu (samotest: skryté Norny, fotka, chyba JS)',
    'verify_liferune_states.js': 'chybu si podstrčí sama v každém běhu',
}


def pokryti(smoke_txt, pripady, bez, existuje):
    """Vrátí (chybi, navic): kontroly ze smoke bez útoku i výjimky · výjimky, které už útok mají nebo ve smoke nejsou."""
    vsmoke = sorted({m for m in re.findall(r'(verify_[a-z0-9_]+\.(?:js|py))', smoke_txt) if existuje(m)})
    s_utokem = {x[1] for x in pripady}
    chybi = [k for k in vsmoke if k not in s_utokem and k not in bez]
    navic = [k for k in bez if k in s_utokem or k not in vsmoke]
    return chybi, navic


def _samotest_pokryti():
    # Životní cyklus: kontrola s útokem · nová bez útoku · výjimka · výjimka, která útok dostala · výjimka zmizelá ze smoke ·
    # jméno ve smoke, ke kterému soubor neexistuje (komentář o smazané kontrole) — to se nepočítá.
    smoke = "run('verify_a.js') run('verify_b.py') run('verify_c.js') run('verify_d.js') # dřív verify_gone.js"
    pr = [('chyti', 'verify_a.js', 'x', 'append', '', ''), ('chyti', 'verify_d.js', 'x', 'append', '', '')]
    bez = {'verify_c.js': 'x', 'verify_d.js': 'x', 'verify_e.js': 'x'}
    chybi, navic = pokryti(smoke, pr, bez, lambda m: m != 'verify_gone.js')
    return chybi == ['verify_b.py'] and sorted(navic) == ['verify_d.js', 'verify_e.js']


def h(*casti):
    m = hashlib.sha256()
    for c in casti:
        m.update(c if isinstance(c, bytes) else str(c).encode('utf-8'))
        m.update(b'\0')
    return m.hexdigest()[:16]


def cti_bin(p):
    # bez \r: core.autocrlf=true dá v kopii z checkoutu CRLF a ve sdíleném stromě bývá LF — týž obsah, jiný klíč
    try:
        return open(p, 'rb').read().replace(b'\r\n', b'\n')
    except OSError:
        return b''


_HEADY = None
def v_head(rel):
    # cíl z HEAD, ne z pracovního stromu: útočí se na kopii HEAD a cizí rozdělaná práce by klíč měnila (2026-10-11: z worktree pre-push
    # se proto pustilo 12 útoků z 19, ač se nic nezměnilo)
    # 2026-10-13 (CODE-read, zrychlení smoke): všechny cíle najednou jedním `git cat-file --batch` — dřív `git show` pro každý ze 145 případů,
    # ~5,6 s i v běhu, kdy se žádný útok nespouští. Chybějící soubor = b'' jako dřív.
    global _HEADY
    if _HEADY is None:
        _HEADY = {}
        cile = sorted(set(x[2] for x in PRIPADY))
        r = subprocess.run(['git', '-C', ROOT, 'cat-file', '--batch'], input=''.join('HEAD:' + c + '\n' for c in cile).encode('utf-8'),
                           capture_output=True, env=ENV)
        buf, i = r.stdout, 0
        for c in cile:
            nl = buf.find(b'\n', i)
            if nl < 0:
                break
            hlava = buf[i:nl].decode('utf-8', 'replace').split(' ')
            i = nl + 1
            if len(hlava) == 3 and hlava[1] == 'blob':
                n = int(hlava[2])
                _HEADY[c] = buf[i:i + n].replace(b'\r\n', b'\n')
                i += n + 1
    return _HEADY.get(rel, b'')


def klic(pripad, ja):
    typ, sk, rel, mode, a, b = pripad
    return h(json.dumps(pripad, ensure_ascii=False), cti_bin(ROOT + '/scripts/' + sk), v_head(rel), ja)


def podstrc(W, rel, mode, a, b):
    p = W + '/' + rel
    # stage (2026-10-11): do INDEXU kopie dá verzi souboru z revize `a` (kontroly stavu sdíleného stromu čtou index, ne soubor)
    if mode == 'stage':
        g = lambda *x: subprocess.run(['git', '-C', W] + list(x), capture_output=True, text=True, env=ENV)
        stary, novy = g('rev-parse', a + ':' + rel).stdout.strip(), g('rev-parse', 'HEAD:' + rel).stdout.strip()
        if not stary or stary == novy:
            return 'verze z ' + a + ' chybí nebo je stejná jako v HEAD'
        return '' if g('update-index', '--cacheinfo', '100644,' + stary + ',' + rel).returncode == 0 else 'update-index selhal'
    # commit (2026-10-11): prázdný commit pod jménem `a` v kopii (kontroly historie čtou git log); úklid ho vrátí
    if mode == 'commit':
        r = subprocess.run(['git', '-C', W, '-c', 'user.name=' + a, '-c', 'user.email=protipriklad@local', 'commit', '-q', '--allow-empty',
                            '-m', 'protipříklad (scripts/protipriklady.py)'], capture_output=True, text=True, encoding='utf-8', env=ENV)
        return '' if r.returncode == 0 else 'commit selhal: ' + (r.stdout + r.stderr)[-120:]
    # commit_append (2026-10-13, CODE-read): text na konec souboru a commit jen toho souboru — ⑮ čte git blame, necommitnutý řádek
    # schválně přeskakuje (rozdělaná práce), takže bez commitu by na ni žádný útok nedosáhl. Úklid vrátí HEAD i soubor.
    if mode == 'commit_append':
        puvodni = io.open(p, encoding='utf-8', newline='').read()
        io.open(p, 'w', encoding='utf-8', newline='').write(puvodni + b)
        r = subprocess.run(['git', '-C', W, '-c', 'user.name=protipriklad', '-c', 'user.email=protipriklad@local', 'commit', '-q',
                            '-m', 'protipříklad (scripts/protipriklady.py)', '--', rel], capture_output=True, text=True, encoding='utf-8',
                           env=dict(ENV, RUNAR_SDILENE_OK='protipříklad v dočasné kopii repa (scripts/protipriklady.py, commit_append) — do historie nejde'))
        if r.returncode != 0:
            io.open(p, 'w', encoding='utf-8', newline='').write(puvodni)
            return 'commit selhal: ' + (r.stdout + r.stderr)[-120:]
        return ''
    # create = podstrčený ZAPOMENUTÝ soubor: datum o 3 dny zpět (2026-10-11: kontroly souborů mimo git berou čerstvý soubor mladší než
    # 2 h jako rozdělanou práci a jen varují); create_cerstvy = soubor právě vytvořený
    if mode in ('create', 'create_cerstvy'):
        if os.path.exists(p):
            return 'soubor už existuje'
        os.makedirs(os.path.dirname(p), exist_ok=True)   # 2026-10-21: nová edge funkce = nová složka s index.ts
        io.open(p, 'w', encoding='utf-8', newline='').write(b)
        if mode == 'create':
            stare = time.time() - 3 * 86400
            os.utime(p, (stare, stare))
        return ''
    s = io.open(p, encoding='utf-8', newline='').read()
    if mode == 'append':
        t = s + b
    elif mode == 'replace':
        if s.count(a) != 1:
            return 'přesný text je tam %d× (čekám 1×)' % s.count(a)
        t = s.replace(a, b)
    else:
        n = len(re.findall(a, s))
        if n < 1:
            return 'regex nenašel nic'
        t = re.sub(a, b, s, count=1)
    if t == s:
        return 'text se nezměnil'
    io.open(p, 'w', encoding='utf-8', newline='').write(t)
    return ''


def vrat(W, rel, mode=''):
    if mode == 'commit':
        subprocess.run(['git', '-C', W, 'reset', '-q', '--soft', 'HEAD~1'], check=True, env=ENV)
        return
    if mode == 'commit_append':
        subprocess.run(['git', '-C', W, 'reset', '-q', '--mixed', 'HEAD~1'], check=True, env=ENV)   # index ← předchozí HEAD, soubor pak níž
    if mode == 'stage':
        subprocess.run(['git', '-C', W, 'reset', '-q', '--', rel], check=True, env=ENV)   # index ← HEAD
    r = subprocess.run(['git', '-C', W, 'ls-files', '--error-unmatch', '--', rel], capture_output=True, env=ENV)
    if r.returncode == 0:
        subprocess.run(['git', '-C', W, 'checkout', '-q', '--', rel], check=True, env=ENV)
    elif os.path.exists(W + '/' + rel):
        os.remove(W + '/' + rel)


# Limit na jeden běh kontroly (2026-10-11, nahlásil CODE-tune): útok na ㊷ nechal node bez výstupu 15 min a pre-push čekal napořád.
# Po vypršení se zabije CELÝ strom procesů (na Windows by jinak žil Chrome pod node) a beh vrátí kód None — vypršení se NIKDY nesmí
# počítat jako „chyceno“ (zabitý node = exit ≠ 0 by útok typu chyti tiše uznal a uložil do cache).
LIMIT_S = int(os.environ.get('RUNAR_PROTI_LIMIT_S', '240'))


def _zabij_strom(p):
    if os.name == 'nt':
        subprocess.run(['taskkill', '/T', '/F', '/PID', str(p.pid)], capture_output=True)
    else:
        try: os.killpg(p.pid, 9)
        except Exception: p.kill()


def beh(W, sk):
    env = dict(ENV, RUNAR_ROOT=W)
    # 2026-10-14 (CODE-read): kontrola v Pythonu (㊄ verify_hooky_claude.py) se pouští Pythonem — do té doby vždy node a útok spadl na „už na
    # čisté kopii exit 1“ (node nerozumí .py).
    prikaz = [sys.executable, '-X', 'utf8'] if sk.endswith('.py') else ['node']
    p = subprocess.Popen(prikaz + [W + '/scripts/' + sk], cwd=W, env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                         text=True, encoding='utf-8', **({} if os.name == 'nt' else {'start_new_session': True}))
    try:
        out, _ = p.communicate(timeout=LIMIT_S)
    except subprocess.TimeoutExpired:
        _zabij_strom(p)
        try: p.communicate(timeout=10)
        except Exception: pass
        return None, 'visí — bez výsledku po ' + str(LIMIT_S) + ' s, proces zabit'
    out = out or ''
    global POSLEDNI_VYSTUP
    POSLEDNI_VYSTUP = out   # celý výstup posledního běhu — při propuštěném útoku se uloží (main)
    class _V: pass
    r = _V(); r.returncode = p.returncode
    neprazdne = [l.strip() for l in out.split('\n') if l.strip()]
    # řádek s důvodem: FAIL/CHYBA/✗, jinak poslední neprázdný (některé kontroly hlásí chybu jinak — fresh_dates, commit_identity)
    radek = next((l for l in neprazdne if re.match(r'(FAIL|CHYBA|✗)', l)), neprazdne[-1] if neprazdne and r.returncode else '')
    return r.returncode, radek


def _bezi(pid):
    try:
        if os.name == 'nt':
            r = subprocess.run(['tasklist', '/FI', 'PID eq ' + str(pid), '/NH'], capture_output=True, text=True)
            return str(pid) in r.stdout
        os.kill(pid, 0); return True
    except Exception:
        return False


def uklid_opustenych():
    # 2026-10-11: běh zabitý zvenku (CODE-tune zabil visící pre-push) nestihne finally — kopie proti-* zůstane na disku i v `git worktree
    # list` (prune ji nevezme, složka existuje). Smaže se, když její běh už neběží (pid.txt), nebo bez pid.txt po 2 h (starší běhy).
    out = subprocess.run(['git', '-C', ROOT, 'worktree', 'list', '--porcelain'], capture_output=True, text=True, env=ENV).stdout
    for l in out.split('\n'):
        if not l.startswith('worktree ') or '/proti-' not in l.replace('\\', '/'): continue
        w = l[9:].strip().replace('\\', '/'); rodic = os.path.dirname(w)
        try:
            pid = int(open(rodic + '/pid.txt').read().strip())
            mrtvy = not _bezi(pid)
        except (OSError, ValueError):
            mrtvy = (not os.path.exists(rodic)) or (time.time() - os.path.getmtime(rodic) > 7200)
        if mrtvy:
            subprocess.run(['git', '-C', ROOT, 'worktree', 'remove', '--force', w], capture_output=True, env=ENV)
            shutil.rmtree(rodic, ignore_errors=True)
            print('  úklid: opuštěná kopie ' + w)


def main():
    argy = [x for x in sys.argv[1:] if not x.startswith('--')]
    vse = '--vse' in sys.argv
    # Otisk KÓDU nástroje bez seznamu PRIPADY (2026-10-11): s ním přidání jediného útoku kteroukoli session zneplatnilo cache všech
    # a další pre-push pouštěl všech ~100 útoků (push přes 10 min). Změnu případu pozná klíč sám — nese json případu.
    cely = cti_bin(os.path.abspath(__file__))
    ja = re.sub(rb'\nPRIPADY = \[.*?\n\]\n', b'\nPRIPADY = []\n', cely, count=1, flags=re.S)
    try:
        cache = json.load(open(CACHE, encoding='utf-8'))
    except (OSError, ValueError):
        cache = {}
    pokr = []
    if not _samotest_pokryti():
        pokr.append('FAIL  protipříklady: samotest ráčny pokrytí neprošel (pokryti() v scripts/protipriklady.py)')
    if not argy:
        chybi, navic = pokryti(open(os.path.join(ROOT, 'smoke.py'), encoding='utf-8').read(), PRIPADY, BEZ_UTOKU,
                               lambda m: os.path.exists(os.path.join(ROOT, 'scripts', m)))
        for k in chybi:
            pokr.append('FAIL  %s je ve smoke bez útoku — přidej útok do PRIPADY, nebo ji s důvodem do BEZ_UTOKU (§30)' % k)
        if navic:
            print('ℹ  BEZ_UTOKU: už má útok nebo není ve smoke — vyškrtni: ' + ' · '.join(navic))
    vybrane = [p for p in PRIPADY if not argy or p[1] in argy]
    kspusteni = [p for p in vybrane if vse or argy or cache.get(klic(p, ja)) != 'ok']
    if not kspusteni:
        if pokr:
            for c in pokr: print(c)
            print('FAIL  protipříklady: pokrytí kontrol útoky')
            return 1
        print('OK    protipříklady: %d útoků na %d kontrol, žádná kontrola se od posledního úspěchu nezměnila'
              % (len(PRIPADY), len({p[1] for p in PRIPADY})))
        return 0

    uklid_opustenych()
    subprocess.run(['git', '-C', ROOT, 'worktree', 'prune'], capture_output=True, env=ENV)
    W = tempfile.mkdtemp(prefix='proti-').replace('\\', '/') + '/w'
    open(os.path.dirname(W) + '/pid.txt', 'w').write(str(os.getpid()))   # podle něj pozná úklid příštího běhu, že tahle kopie žije
    subprocess.run(['git', '-C', ROOT, 'worktree', 'add', '--detach', '-q', W, 'HEAD'], check=True, env=ENV)
    chyby = []
    try:
        for f in os.listdir(ROOT + '/scripts'):
            if f.startswith('verify_') and f.endswith(('.js', '.py')):   # .py od 2026-10-15 — jinak útok na necommitnutou opravu .py kontroly běžel proti HEAD
                shutil.copyfile(ROOT + '/scripts/' + f, W + '/scripts/' + f)
        cista = {}
        for p in kspusteni:
            typ, sk, rel, mode, a, b = p
            if sk not in cista:
                cista[sk] = beh(W, sk)
            k0, r0 = cista[sk]
            if k0 is None:
                chyby.append('FAIL  %s: na čisté kopii %s — útok nemá smysl' % (sk, r0))
                continue
            if k0 != 0:
                chyby.append('FAIL  %s: už na čisté kopii exit %d (%s) — útok nemá smysl, nejdřív oprav strom' % (sk, k0, r0[:90]))
                continue
            proc = podstrc(W, rel, mode, a, b)
            if proc:
                chyby.append('FAIL  %s [%s]: podstrčení se neprojevilo (%s) — cílový text se změnil; uprav případ v scripts/protipriklady.py'
                             % (sk, rel, proc))
                if mode not in ('commit', 'commit_append'): vrat(W, rel, mode)   # nepovedený commit nic nevytvořil — reset by sebral skutečný HEAD kopie
                continue
            k1, r1 = beh(W, sk)
            vrat(W, rel, mode)
            if k1 is None:
                chyby.append('FAIL  %s [%s]: s podstrčenou chybou %s — nepočítá se jako chycený' % (sk, rel, r1))
                continue
            spravne = (k1 == 0) if typ == 'nesmi' else (k1 != 0)
            if spravne:
                cache[klic(p, ja)] = 'ok'
                print('  ok   %-8s %s [%s]%s' % (typ, sk, rel, ('  | ' + r1[:90]) if r1 else ''))
            elif typ == 'nesmi':
                chyby.append('FAIL  %s [%s]: FALEŠNĚ ČERVENÁ na správném kódu (%s)' % (sk, rel, r1[:90]))
            else:
                os.makedirs(PROPUSTENE, exist_ok=True)
                soub = PROPUSTENE + '/' + time.strftime('%Y%m%d-%H%M%S') + '_' + re.sub(r'[^A-Za-z0-9_.-]', '_', sk + '_' + rel) + '.txt'
                with open(soub, 'w', encoding='utf-8') as f: f.write(POSLEDNI_VYSTUP)
                konec = ' | '.join([l.strip() for l in POSLEDNI_VYSTUP.split('\n') if l.strip()][-2:])[:160]
                chyby.append('FAIL  %s [%s]: kontrola PROPOUŠTÍ podstrčenou chybu (%s) — exit 0; konec výstupu: %s · celý: %s' % (sk, rel, typ, konec, soub))
    finally:
        subprocess.run(['git', '-C', ROOT, 'worktree', 'remove', '--force', W], capture_output=True, env=ENV)
        shutil.rmtree(os.path.dirname(W), ignore_errors=True)
        try:
            json.dump(cache, open(CACHE, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
        except OSError:
            pass
    chyby = pokr + chyby
    for c in chyby:
        print(c)
    if chyby:
        print('FAIL  protipříklady: %d z %d spuštěných útoků nesedí' % (len(chyby), len(kspusteni)))
        return 1
    print('OK    protipříklady: %d spuštěno (změněné kontroly), všechny sedí; celkem %d útoků na %d kontrol'
          % (len(kspusteni), len(PRIPADY), len({p[1] for p in PRIPADY})))
    return 0


if __name__ == '__main__':
    sys.exit(main())
