# -*- coding: utf-8 -*-
# add_living_tree.py — wires the crown-composer living tree into the Tree tab (ADMIN-only beta).
# renderLivingTree() reads the user's FULL reading history from the `readings` table (journal),
# maps it to the engine log format, and renders via RunarTreeProd. Trunk = life rune.
# BETA gate: visible only to admins (isAdmin) until launch. Life Rune states untouched.
# Content-anchored (Rule §1: JS via Python; never Edit tool). Idempotent-guarded.
import io

P = r'C:\Users\zkuku\Downloads\Runar-admin\v2\runar-tree.js'
s = io.open(P, encoding='utf-8').read()

if 'function renderLivingTree' in s:
    print('already patched; no change'); raise SystemExit

FUNC = (
    "// FREE-SOLO living tree (ADMIN-only beta) — crown-composer tree grown from ALL your readings.\n"
    "// Source = the `readings` table (journal). Trunk = life rune; branches grow from readings.\n"
    "function readingsToTreeLog(rows) {\n"
    "  var byGlyph = {};\n"
    "  RUNES.forEach(function(r){ byGlyph[r.g] = ((r.elements && r.elements[0]) || 'Earth').toLowerCase(); });\n"
    "  var out = [];\n"
    "  (rows || []).forEach(function(row) {\n"
    "    var name = (row.rune_name || '').toUpperCase();\n"
    "    var isSpread = /NORNS|KRIZ|CROSS|COMPASS|HORSESHOE|YGGDRASIL/.test(name);\n"
    "    var src = (row.rune_glyph || '') + ' ' + (row.short_text || '');\n"
    "    var runes = [];\n"
    "    for (var i = 0; i < src.length; i++) {\n"
    "      var c = src.charCodeAt(i);\n"
    "      if (c >= 0x16A0 && c <= 0x16FF) { var g = src.charAt(i); if (byGlyph[g]) runes.push({ rune: g, el: byGlyph[g] }); }\n"
    "    }\n"
    "    if (!runes.length) return;\n"
    "    if (!isSpread) runes = [runes[0]];\n"
    "    var area = (row.area && row.area !== 'spread') ? row.area : null;\n"
    "    out.push({ spread: isSpread ? name.toLowerCase() : 'single', runes: runes, area: area, intention: row.intention || null });\n"
    "  });\n"
    "  return out;\n"
    "}\n\n"
    "async function renderLivingTree(rune) {\n"
    "  try {\n"
    "    var wrap = document.getElementById('tree-living');\n"
    "    var cv   = document.getElementById('tree-living-canvas');\n"
    "    // BETA: living tree visible to ADMINS only for now\n"
    "    if (!wrap || !cv || !window.RunarTreeProd || !rune || !currentUser || !isAdmin(currentUser.email)) {\n"
    "      if (wrap) wrap.style.display = 'none'; return;\n"
    "    }\n"
    "    var log = [];\n"
    "    try {\n"
    "      var res = await sb.from('readings').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: true });\n"
    "      if (res && res.data) log = readingsToTreeLog(res.data);\n"
    "    } catch(e) {}\n"
    "    var bk = (window.RunarBranch && window.RunarBranch.RUNES.filter(function(x){ return x.g === rune.g; })[0]);\n"
    "    var rkey = bk ? bk.k : 'berkano';\n"
    "    var dob = { d: readerUser.d, m: readerUser.m, y: readerUser.y };\n"
    "    wrap.style.display = 'block';\n"
    "    window.RunarTreeProd.render(cv, { log: log, rune: rkey, dob: dob });\n"
    "  } catch(e) {}\n"
    "}\n\n"
)

ANCHOR_A = "function updateTreeTab() {"
assert s.count(ANCHOR_A) == 1, 'anchor A not unique: %d' % s.count(ANCHOR_A)
s = s.replace(ANCHOR_A, FUNC + ANCHOR_A, 1)

ANCHOR_B = (
    "      if (txt) txt.innerHTML = t('tree_intro');\n"
    "    }\n"
    "    return;\n"
    "  }\n"
    "\n"
    "  var runeName = isIs ? rune.is_n : rune.n;"
)
assert s.count(ANCHOR_B) == 1, 'anchor B not unique: %d' % s.count(ANCHOR_B)
NEW_B = ANCHOR_B.replace(
    "\n  var runeName = isIs ? rune.is_n : rune.n;",
    "\n  renderLivingTree(rune);\n  var runeName = isIs ? rune.is_n : rune.n;")
s = s.replace(ANCHOR_B, NEW_B, 1)

io.open(P, 'w', encoding='utf-8', newline='\n').write(s)
print('patched', len(s), 'chars')
