Add-Type -Assembly 'System.IO.Compression.FileSystem'

$base  = Split-Path -Parent $MyInvocation.MyCommand.Path
$saida = Join-Path $base 'para-claude.zip'

if (Test-Path $saida) { Remove-Item $saida }

Write-Host ""
Write-Host " Criando zip para enviar ao Claude..."
Write-Host ""

$zip = [System.IO.Compression.ZipFile]::Open($saida, 'Create')

# ── Arquivos da raiz ──────────────────────────────────────────
$raiz = @(
    'index.html',
    'main.js',
    'preload.js',
    'package.json',
    'chapters.json',
    'dialogues.json',
    'discord-presence.js'
)

foreach ($f in $raiz) {
    $full = Join-Path $base $f
    if (Test-Path $full) {
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $full, $f) | Out-Null
        Write-Host "  + $f"
    } else {
        Write-Host "  - nao encontrado: $f"
    }
}

# ── Todas as pastas de código (sem assets) ────────────────────
$pastas = @('js', 'css')

foreach ($pasta in $pastas) {
    $dir = Join-Path $base $pasta
    if (-not (Test-Path $dir)) { continue }

    Get-ChildItem -Path $dir -File -Recurse | ForEach-Object {
        $rel = $_.FullName.Substring($base.Length + 1)
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $rel) | Out-Null
        Write-Host "  + $rel"
    }
}

$zip.Dispose()

Write-Host ""
Write-Host " Zip criado: $saida"
Write-Host ""
Pause
