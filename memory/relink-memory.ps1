# relink-memory.ps1 - Runar sdilena pamet (§17).
# Nasmeruje OBE platformni pametove slozky (Claude Code + Cowork/Claude app)
# na tuto jednu kanonickou slozku v repu = jediny zdroj.
#
# KDY spustit: kdyz nekterá pamet vypada prazdna/zastarala (napr. po update
# Claude appky, ktera si svou memory slozku znovu vytvorila jako prazdnou).
# Skript je idempotentni + bezpecny: skutecnou slozku pred nahrazenim zazalohuje.
#
# Spusteni (PowerShell):  powershell -ExecutionPolicy Bypass -File .\memory\relink-memory.ps1

$ErrorActionPreference = 'Stop'

# Kanonicka slozka = tato (v repu). Hardcoded, aby nedoslo k self-reference pres junction.
$repoMem = 'C:\Users\zkuku\Downloads\Runar-admin\memory'

# Platformni cesty, ktere maji ukazovat sem:
$links = @(
  'C:\Users\zkuku\AppData\Roaming\Claude\memory',                 # Cowork / Claude app
  'C:\Users\zkuku\.claude\projects\C--Users-zkuku\memory'         # Claude Code (CWD = C:\Users\zkuku)
)

if (-not (Test-Path -LiteralPath $repoMem)) {
  throw "Kanonicka slozka neexistuje: $repoMem  (uprav `$repoMem v tomto skriptu)"
}

foreach ($link in $links) {
  $item = Get-Item -LiteralPath $link -ErrorAction SilentlyContinue

  if ($item -and $item.LinkType -eq 'Junction' -and (@($item.Target) -contains $repoMem)) {
    Write-Host "OK (uz propojeno): $link"
    continue
  }

  if ($item) {
    if ($item.LinkType) {
      # zastaraly junction (spatny cil) -> odstranit jen reparse point
      cmd /c rmdir "$link" | Out-Null
      Write-Host "odstranen stary junction: $link"
    } else {
      # skutecna slozka -> zazalohovat pred nahrazenim
      $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
      $bak = "$link.bak-$stamp"
      Move-Item -LiteralPath $link -Destination $bak
      Write-Host "zaloha skutecne slozky -> $bak"
    }
  }

  $parent = Split-Path $link -Parent
  if (-not (Test-Path -LiteralPath $parent)) {
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
  }

  New-Item -ItemType Junction -Path $link -Target $repoMem | Out-Null
  Write-Host "propojeno: $link  ->  $repoMem"
}

Write-Host ""
Write-Host "Hotovo. Obe pametove slozky ukazuji na $repoMem"
