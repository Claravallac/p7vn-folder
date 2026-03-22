@echo off
cd /d "%~dp0"
title Volkenburt Teaser

if not exist "electron-bin\electron.exe" (
    echo  [ERRO] electron.exe nao encontrado em electron-bin\
    echo.
    echo  Baixe o Electron em:
    echo  https://github.com/electron/electron/releases/latest
    echo.
    echo  Escolha: electron-vXX.X.X-win32-x64.zip
    echo  Extraia o conteudo na pasta electron-bin\
    pause
    exit /b 1
)

echo  Iniciando Volkenburt Teaser...
electron-bin\electron.exe .
pause
