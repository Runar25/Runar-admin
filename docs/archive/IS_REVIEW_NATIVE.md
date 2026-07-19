# IS Text — Přezkum rodilým mluvčím
# Tyto výrazy jsou nejisté. Prosím potvrď nebo oprav.
# Zdroj: yfirlestur.is grammar audit + ruční review
# Datum: 2026-06-04

---

## 1. Skloňování po "eins og"

**Kontext** (runar-character.js — popis Rúnarovy osobnosti):
```
Hann talar eins og fornur sögumaður við eldinn
```
**API navrhuje:** `fornu sögumaður`  
**Otázka:** Po "eins og" — nominativ (`fornur`) nebo dativ (`fornu`)?

---

## 2. "dregnu" vs "drægnu" rúnina

**Kontext** (runar-character.js — IS reading prompt):
```
Tengdu drægnu rúnina við lífsrúnina
```
**API navrhuje:** `drægju rúnina`  
**Otázka:** Správný tvar minulého participia od "draga" v dativu?  
(Aktuálně máme `drægnu` — bylo opraveno z `dregnu`)

---

## 3. Norny a "vefa"

**Kontext** (runar-character.js — popis Norns):
```
Nornirnar sem vefa örlög
```
**API navrhuje:** `gefa` místo `vefa`  
**Otázka:** "Vefa örlög" (tkají osud) je záměrné poetické vyjádření — správně?

---

## 4. "rúnalestur" vs "rúnaletur"

**Kontext** (runar-character.js — identity):
```
leiðbeina fólki í gegnum rúnalestur
```
**API navrhuje:** `rúnaletur`  
**Otázka:** `rúnalestur` = čtení run (záměr). `rúnaletur` = runové písmo. Správně `rúnalestur`?

---

## 5. "almæli" — záměrný výraz?

**Kontext** (runar-character.js):
```
Hann notar þetta til að gera lesturinn djúpt persónulegan — aldrei almæli.
```
**API navrhuje:** `afmæli` (výročí)  
**Otázka:** `almæli` = obecné/plané řeči (neologismus?) nebo chyba? Záměr: "nikdy obecné klišé"

---

## 6. "lífsvið" vs "lífssviðs"

**Kontext** (runar-character.js):
```
lífsvið sem þeir leita leiðbeiningar í
```
**API navrhuje:** `lífssviðs` (s dvojitým s)  
**Otázka:** Správný pravopis — `lífsvið` nebo `lífssviðs`?

---

## 7. Genitiv "fjarðum" vs "ferðum"

**Kontext** (runar-character.js — islandský kalendář):
```
hvalir sem koma upp í gráum fjarðum
```
**API navrhuje:** `ferðum` (cestách)  
**Otázka:** `fjarðum` = ve fjordech (dativ pl od "fjörður") — správně?

---

## 8. "lestrana þeirra" — zvratné zájmeno

**Kontext** (runar-auth.js — RS banner):
```
Þegar þeir eru genginn og steinarnir eiga enn eftir að segja...
```
**Otázka:** Celá věta zní přirozeně? Zvláště "eru genginn" — správná shoda?

---

*Po opravě: přidat potvrzené výrazy do `check-is.py` BAD_PATTERNS a do shrine `runar_corrections` DB.*
