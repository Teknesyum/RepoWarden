param([string]$Owner = 'cli')
$ErrorActionPreference = 'Stop'
$kok = Split-Path $PSScriptRoot
$gecici = Join-Path $kok 'tmp\shot'
$hedef = Join-Path $kok '.teknesyum'
$p = Start-Process (Join-Path $kok 'dist\RepoWarden.exe') -ArgumentList '--goruntu', "`"$gecici`"", '--owner', $Owner -PassThru
if (-not $p.WaitForExit(90000)) { $p.Kill(); throw 'RepoWarden.exe did not finish' }
Add-Type -AssemblyName System.Drawing
$jeton = Get-Content -Raw -Encoding UTF8 (Join-Path $kok 'teknesyum-ui\theme.tokens.json') | ConvertFrom-Json
$zemin = [Drawing.ColorTranslator]::FromHtml($jeton.brand.surface.value)
$menu = [Drawing.Image]::FromFile((Join-Path $gecici 'menu.png'))
$jpg = [Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$ayar = New-Object Drawing.Imaging.EncoderParameters 1
$ayar.Param[0] = New-Object Drawing.Imaging.EncoderParameter ([Drawing.Imaging.Encoder]::Quality), 92L
foreach ($k in @(@('shot.jpg', 640, 412), @('full.jpg', 1440, 926))) {
    $b = New-Object Drawing.Bitmap $k[1], $k[2]
    $g = [Drawing.Graphics]::FromImage($b)
    $g.Clear($zemin)
    $g.InterpolationMode = 'HighQualityBicubic'
    $o = [math]::Min(1.0, [math]::Min($k[1] * 0.9 / $menu.Width, $k[2] * 0.9 / $menu.Height))
    $w = [int]($menu.Width * $o); $h = [int]($menu.Height * $o)
    $g.DrawImage($menu, [int](($k[1] - $w) / 2), [int](($k[2] - $h) / 2), $w, $h)
    $g.Dispose()
    $b.Save((Join-Path $hedef $k[0]), $jpg, $ayar)
    $b.Dispose()
}
$menu.Dispose()
$simge = [Drawing.Image]::FromFile((Join-Path $kok 'assets\icon\icon-256.png'))
$b = New-Object Drawing.Bitmap 128, 128
$g = [Drawing.Graphics]::FromImage($b); $g.InterpolationMode = 'HighQualityBicubic'; $g.DrawImage($simge, 0, 0, 128, 128); $g.Dispose()
$b.Save((Join-Path $hedef 'icon.png'), [Drawing.Imaging.ImageFormat]::Png); $b.Dispose(); $simge.Dispose()
Write-Host "written: $hedef\icon.png, shot.jpg, full.jpg"
