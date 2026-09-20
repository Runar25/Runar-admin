# -*- coding: utf-8 -*-
# Detektor spony "<Runa> is/er ..." — vada, kterou owner pojmenoval ("this is Raidho").
# §27: napred se obhaji na STARYCH ctenich (musi dat 3/3), teprve pak verim nulam u novych.
import re, sys, io
RUNY = ['Berkana', 'Gebo', 'Isa', 'Raidho', 'Laguz', 'Othila', 'Ingwaz', 'Blank', 'Uruz', 'Ansuz']
VZOR = re.compile(r'\b(' + '|'.join(RUNY) + r')\b\s*(?:\([^)]*\)\s*)?(is|are|er|eru)\b', re.I)
for jm, texty in [('STARA (pred opravou)', [
    "You are at the far end of the room, where the child's first step is happening. Berkana is that crossing, Anna.",
    "Gebo is the exchange that only happens when both hands are in it.",
    "Berkana er þetta skref, Anna — augnablikið þegar eitthvað byrjar.",
]), ('NOVA (po oprave)', [
    "You are at the far end of the room, Anna, where the first step is happening. Berkana moves under the foot that has not landed — what begins before it can hold itself.",
    "The door has been open a while, and the second cup has gone cold waiting. Gebo runs between two hands or it does not run at all.",
    "Þú stendur við hinn enda gólfsins, Anna, þar sem fyrsta skrefið er að gerast. Berkana ber það sem byrjar áður en það stendur sjálft.",
])]:
    zasah = [t for t in texty if VZOR.search(t)]
    print('%-22s spona %d/%d' % (jm, len(zasah), len(texty)))
    for t in zasah: print('      ' + VZOR.search(t).group(0))
