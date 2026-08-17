# 2026-08-16 — kde jsme skončili (session CODE-tune)
# Rozdělaná práce k tomuto dni. NENÍ to popis aktuálního stavu — ten vlastní produkce,
# `git log` a doky dle rozcestníku. Co má vlastníka jinde, tu schválně NENÍ.

## Uprostřed čeho jsme byli

**Registr `direct`** je napsaný a zapojený, `ACTIVE_VOICE_PROFILE` zůstává `focused`.
Vygenerováno pět anglických čtení, owner je viděl. Perth si v nich význam vymyslel.

**Owner chce pokračovat od PRVNÍ INSTRUKCE promptu** a projít je od začátku — ne lovit
jednotlivosti uvnitř. Systémový prompt = 13 bloků, 3 906 znaků, začíná
`You are Rúnar, the rune keeper of Agndofa.` Reading prompt = 18 vrstev.
Výpis bloků: `buildSysPrompt(null,'en')`.

## Další krok

Projít ty bloky od [1]. U každého: k čemu tu je · co doloženě dělá · co stojí ostatní.

## Co viselo nedořešené

- Sentenční rozpočet pro `direct` — v 5,9 věty (norns) se „jedna věc na větu" u tří run nedá.
- Perthovy tři obrazy nesou výklad samy (`waiting to be drawn up`). Jediná runa z 25 taková.
  ⚠️ Detektor „výkladu v obraze" je můj a nikdo na něj nezaútočil (§27) — „7 z 81" je
  „7 podle vzoru, který jsem si k tomu ušil", ne dokázaná příčina.
- Rozpor v dokumentaci: `working-style` přikazoval psát do snapshotů stav, `MEMORY.md`
  zakazuje z nich stav brát. **Vyřešeno 2026-08-16** — protokol přepsán, snapshot nese
  jen rozdělanou práci.
