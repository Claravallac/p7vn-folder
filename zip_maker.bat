@echo off
chcp 65001 >nul
setlocal

:: ── Configuração ─────────────────────────────────────────────
set PROJETO=%~dp0
set SAIDA=%PROJETO%para-claude.zip

:: Remove zip antigo se existir
if exist "%SAIDA%" del "%SAIDA%"

echo.
echo  Criando zip para enviar ao Claude...
echo.

:: Verifica se o PowerShell está disponível (Windows 10+)
where powershell >nul 2>&1
if errorlevel 1 (
    echo  ERRO: PowerShell nao encontrado.
    pause
    exit /b 1
)

:: Cria o zip com os arquivos relevantes usando PowerShell
powershell -NoProfile -Command ^
    "Add-Type -Assembly 'System.IO.Compression.FileSystem';" ^
    "$zip = [System.IO.Compression.ZipFile]::Open('%SAIDA%', 'Create');" ^
    "$base = '%PROJETO%';" ^
    "$files = @(" ^
    "    'index.html'," ^
    "    'main.js'," ^
    "    'preload.js'," ^
    "    'package.json'," ^
    "    'chapters.json'," ^
    "    'dialogues.json'," ^
    "    'discord-presence.js'," ^
    "    'js\chapters-data.js'," ^
    "    'js\chapters.js'," ^
    "    'js\chapter-1-3-complete.js'," ^
    "    'js\chapter-1-3-discord-call.js'," ^
    "    'js\chapter-1-3-executor.js'," ^
    "    'js\chapter-1-4.js'," ^
    "    'js\dialogue.js'," ^
    "    'js\history.js'," ^
    "    'js\game.js'," ^
    "    'js\game-bootstrap.js'," ^
    "    'js\horror-event.js'," ^
    "    'js\replay-dialogues.js'," ^
    "    'js\inventory.js'," ^
    "    'js\ending-9999.js'," ^
    "    'js\battle-core.js'," ^
    "    'js\battle-nero.js'," ^
    "    'js\battle-nero-store.js'," ^
    "    'js\battle-nero-standalone.js'," ^
    "    'js\battle-arabel.js'," ^
    "    'js\battle-arabel-intro.js'," ^
    "    'js\battle-arabel-pokemon.js'," ^
    "    'js\transition-arabel-nero.js'," ^
    "    'js\discord-renderer.js'," ^
    "    'css\animations.css'," ^
    "    'css\base.css'," ^
    "    'css\battle.css'," ^
    "    'css\debug-overlay.css'," ^
    "    'css\dialogue.css'," ^
    "    'css\ending.css'," ^
    "    'css\menu.css'," ^
    "    'css\style.css'," ^
    "    'css\ui.css'," ^
    "    'css\z-index-system.css'" ^
    ");" ^
    "foreach ($f in $files) {" ^
    "    $full = Join-Path $base $f;" ^
    "    if (Test-Path $full) {" ^
    "        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $full, $f) | Out-Null;" ^
    "        Write-Host ('  + ' + $f);" ^
    "    } else {" ^
    "        Write-Host ('  - nao encontrado: ' + $f);" ^
    "    }" ^
    "};" ^
    "$zip.Dispose();"

if exist "%SAIDA%" (
    echo.
    echo  Zip criado com sucesso:
    echo  %SAIDA%
    echo.
    echo  Abrir pasta? [S/N]
    choice /c SN /n >nul
    if errorlevel 2 goto :fim
    explorer /select,"%SAIDA%"
) else (
    echo.
    echo  ERRO: Nao foi possivel criar o zip.
)

:fim
echo.
pause
