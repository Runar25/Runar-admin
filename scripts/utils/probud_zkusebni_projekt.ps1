# probud_zkusebni_projekt.ps1 - stav a probuzeni zkusebniho projektu Supabase "Runar Testing" (zkouska obnovy, scripts/utils/obnova_db.js).
# CODE-web 2026-11-19, owner: "7. udelej to ty" (probudit) a "8. ano" (denni uloha runar-schranka, postup scripts/ulohy/schranka.md).
#
# Proc: Free projekt Supabase po tydnu bez provozu uspi (INACTIVE) a uspany projekt neprijme spojeni ("tenant/user ... not found").
# Mesicni zkouska obnovy (jednou za 4 tydny) proto na uspanem projektu pada - 2026-11-16 poprve (RUNAR_BACKLOG "Zkouska obnovy jednou
# mesicne"). CLI na probuzeni prikaz nema; Management API ano (POST /v1/projects/{ref}/restore, overeno 2026-11-19: HTTP 200,
# INACTIVE -> COMING_UP -> ACTIVE_HEALTHY).
# Token bere z uloziste prihlasovacich udaju Windows, kam ho ulozilo `supabase login` (cil "Supabase CLI:supabase"); nikdy ho nevypisuje.
# Ref je natvrdo zkusebni projekt a skript overi i jeho jmeno -> produkci (pmitxjvkeovijreepror) tudy probudit ani zmenit nejde.
# Vystup jen ASCII: Windows PowerShell 5.1 cte skript bez BOM v kodove strance systemu a diakritiku by ve vypisu rozbil.
#
#   powershell -NoProfile -File scripts\utils\probud_zkusebni_projekt.ps1                      jen stav
#   powershell -NoProfile -File scripts\utils\probud_zkusebni_projekt.ps1 -Probud -CekejMinut 15  probudit a pockat na ACTIVE_HEALTHY
# Exit 0 = projekt bezi (ACTIVE_HEALTHY), 1 = nebezi / chyba, 2 = cekani vyprselo.
param([switch]$Probud, [int]$CekejMinut = 0)
$ErrorActionPreference = 'Stop'
$ref = 'oirladulbkngjxiumdzb'   # Runar Testing (organizace Runar Test, eu-west-1)
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class RunarCred {
  [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
  public struct CREDENTIAL { public int Flags; public int Type; public string TargetName; public string Comment;
    public System.Runtime.InteropServices.ComTypes.FILETIME LastWritten; public int CredentialBlobSize; public IntPtr CredentialBlob;
    public int Persist; public int AttributeCount; public IntPtr Attributes; public string TargetAlias; public string UserName; }
  [DllImport("advapi32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
  public static extern bool CredRead(string target, int type, int flags, out IntPtr cred);
  [DllImport("advapi32.dll")] public static extern void CredFree(IntPtr cred);
  public static byte[] Read(string target) {
    IntPtr p; if (!CredRead(target, 1, 0, out p)) return null;
    try { var c = (CREDENTIAL)Marshal.PtrToStructure(p, typeof(CREDENTIAL)); var b = new byte[c.CredentialBlobSize];
      Marshal.Copy(c.CredentialBlob, b, 0, b.Length); return b; } finally { CredFree(p); }
  }
}
'@
$b = [RunarCred]::Read('Supabase CLI:supabase')
if (-not $b) { 'CHYBA: token Supabase CLI v ulozisti Windows neni (supabase login)'; exit 1 }
$t = [Text.Encoding]::UTF8.GetString($b)
if ($t.StartsWith('go-keyring-base64:')) { $t = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($t.Substring(18))) }
$h = @{ Authorization = 'Bearer ' + $t.Trim() }
function Stav { Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/$ref" -Headers $h }
try { $p = Stav } catch { 'CHYBA: Management API neodpovedelo (' + $_.Exception.Message.Substring(0, [Math]::Min(80, $_.Exception.Message.Length)) + ')'; exit 1 }
if ($p.name -ne 'Runar Testing') { 'STOP: ref nepatri projektu Runar Testing'; exit 1 }
'projekt Runar Testing - stav ' + $p.status
if ($Probud -and $p.status -eq 'INACTIVE') {
  $r = Invoke-WebRequest -Uri "https://api.supabase.com/v1/projects/$ref/restore" -Method Post -Headers $h -UseBasicParsing
  'probuzeni: HTTP ' + $r.StatusCode
}
if ($CekejMinut -gt 0) {
  $konec = (Get-Date).AddMinutes($CekejMinut)
  while ($p.status -ne 'ACTIVE_HEALTHY' -and (Get-Date) -lt $konec) { Start-Sleep -Seconds 30; $p = Stav }
  'po cekani - stav ' + $p.status
  if ($p.status -ne 'ACTIVE_HEALTHY') { exit 2 }
}
if ($p.status -eq 'ACTIVE_HEALTHY') { exit 0 } else { exit 1 }
