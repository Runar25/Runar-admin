---
name: fix-substance-not-shape
description: "U bezpečnostní/metering opravy oprav PODSTATU, ne tvar; ověř, že díra nejde obejít jinudy"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 12b7cce8-c1bb-4d60-afe0-c53fe2a58d0b
  modified: 2026-08-03T22:00:01.303Z
---

Dvakrát po sobě (2026-08-03: #2b voice gate, #4 spread cost) jsem našel „díru", opravil
její TVAR a nasadil — a fix buď nic nevyřešil, nebo přidal regresi. Owner: *„najdeš něco
o čem si myslíš, že je to díra a nehledáš co to vlastně dělá!"* a *„u každé opravy si zjisti
co přesně dělá."*

**#4 kanonický příklad:** klient posílal cenu jako číslo (`spread_cost`) → „opravil" jsem to
na slug (`spread:'yggdrasil'`), aby cenu určoval server. Jenže **obsah čtení (`system`+`prompt`)
posílá pořád klient a server ho nekontroluje** → pošlu Yggdrasil prompt se `spread:'single'` a
platím 1 místo 5. Spoof se jen přesunul z čísla na slug. Metering NEJDE postavit na klientem
deklarovaných metadatech, dokud prompt staví klient — server nezná pravý spread.

**Pravidlo:** než prohlásím metering/security fix za hotový, adversariálně ověř: *dá se ten
samý výsledek získat JINOU cestou?* (jiné pole, prototype-chain klíč `constructor`→NaN, prázdná
hodnota→fallback, jiný endpoint). Kde jde, pusť na to Workflow s víc nezávislými útočníky (přesně
to u #4 chytlo 9 nálezů, co jsem sám přehlédl). Root příčina > tvar. Verify OUTCOME (§19/§24),
ne že „to teď vrací 400".

**Proč to platí:** owner opakovaně řekl, že hasty fix bez pochopení podstaty = horší než žádný.
**Jak aplikovat:** [[decisions-are-directions-not-locks]] · [[measure-dont-eyeball]] · [[verify-agent-claims-about-code]]. Architektonický fix (server staví prompt) = rozhodnutí ownera (§21), ne rychlá záplata.
