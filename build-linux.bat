@echo off
title Himari Games - Build Linux
color 0A
cd /d "%~dp0"

echo.
echo  ============================================
echo   HIMARI GAMES - Compilador para Linux
echo  ============================================
echo.

:: Verifica se node esta instalado
where node >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado. Instale em https://nodejs.org
    pause
    exit /b 1
)

:: Instala dependencias se node_modules nao existe
if not exist "node_modules\" (
    echo [1/3] Instalando dependencias...
    call npm install
    if errorlevel 1 ( echo [ERRO] Falha ao instalar dependencias. & pause & exit /b 1 )
) else (
    echo [1/3] Dependencias ja instaladas.
)

:: Instala electron-builder se nao estiver presente
if not exist "node_modules\electron-builder\" (
    echo [2/3] Instalando electron-builder...
    call npm install --save-dev electron-builder
    if errorlevel 1 ( echo [ERRO] Falha ao instalar electron-builder. & pause & exit /b 1 )
) else (
    echo [2/3] electron-builder ja instalado.
)

:: Gera o build para Linux
echo [3/3] Compilando para Linux (AppImage)...
echo.

call npm run build:linux

if errorlevel 1 (
    echo.
    echo [ERRO] Build para Linux falhou. Veja os logs acima.
    pause
    exit /b 1
)

echo.
echo  ============================================
echo   Build Linux concluido! Pasta: dist\
echo  ============================================
echo.
pause
