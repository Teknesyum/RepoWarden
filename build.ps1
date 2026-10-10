$ErrorActionPreference = 'Stop'
$kok = $PSScriptRoot
$cikti = Join-Path $kok 'dist'
$obj = Join-Path $cikti 'obj'
New-Item -ItemType Directory -Force $obj | Out-Null
Get-Process RepoWarden -ErrorAction SilentlyContinue | Stop-Process -Force
$fw = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319'
$csc = Join-Path $fw 'csc.exe'
$palet = Get-Content -Encoding UTF8 (Join-Path $kok 'teknesyum-ui\winforms\Palette.cs')
$bas = [array]::IndexOf($palet, ($palet | Where-Object { $_ -match '^public static class Palette' } | Select-Object -First 1))
$son = [array]::IndexOf($palet, ($palet | Where-Object { $_ -match '^public static class Ansi' } | Select-Object -First 1))
$uyeler = $palet[$bas..$son] | Where-Object { $_ -match '^\s+public (const |static readonly Color )' }
$jeton = Get-Content -Raw -Encoding UTF8 (Join-Path $kok 'teknesyum-ui\theme.tokens.json') | ConvertFrom-Json
function Pascal($ad) { (($ad -split '-') | ForEach-Object { $_.Substring(0, 1).ToUpperInvariant() + $_.Substring(1) }) -join '' }
$ton = foreach ($t in $jeton.derived.'tone-scale'.bases) { foreach ($a in $jeton.derived.'tone-scale'.steps) { "    public static readonly Color $(Pascal $t)Yuzde$a = Color.FromArgb($([int][math]::Round($a * 255 / 100, [MidpointRounding]::AwayFromZero)), Palette.$(Pascal $t));" } }
$duzen = @('using System.Drawing;', 'namespace Teknesyum.Theme {', 'public static class Palette {') + $uyeler + @('}', 'public static class Ton {') + $ton + @('}', '}')
[IO.File]::WriteAllLines((Join-Path $obj 'Duzen.cs'), $duzen, (New-Object Text.UTF8Encoding $true))
$ek = @("/resource:$(Join-Path $kok 'assets\icon\icon-256.png'),icon.png", "/win32icon:$(Join-Path $kok 'assets\icon\icon.ico')")
Get-ChildItem (Join-Path $kok 'teknesyum-ui\winforms') -Filter 'labels.*.json' | ForEach-Object { $ek += "/resource:$($_.FullName),$($_.Name)" }
& $csc /nologo /optimize+ /target:winexe /codepage:65001 /out:"$cikti\RepoWarden.exe" /noconfig /nostdlib /r:"$fw\mscorlib.dll" /r:"$fw\System.dll" /r:"$fw\System.Windows.Forms.dll" /r:"$fw\System.Drawing.dll" /r:"$fw\System.Core.dll" /r:"$fw\System.Web.Extensions.dll" @ek "$kok\src\RepoWarden.cs" "$obj\Duzen.cs"
if ($LASTEXITCODE -ne 0) { throw "build failed ($LASTEXITCODE)" }
Write-Host "built: $cikti\RepoWarden.exe"
