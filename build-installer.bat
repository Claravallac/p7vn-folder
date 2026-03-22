@echo off
title Himari Games - Build Instalador
color 0B
cd /d "%~dp0"

echo.
echo  ============================================
echo   HIMARI GAMES - Compilador de Instalador
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

:: Gera o instalador
echo [3/3] Compilando instalador (setup.exe)...
echo.

:: Remove builds anteriores
if exist "dist\win-unpacked" (
    echo Limpando build anterior...
    rd /s /q "dist\win-unpacked"
)
if exist "dist\win-ia32-unpacked" rd /s /q "dist\win-ia32-unpacked"
if exist "dist\win-x64" rd /s /q "dist\win-x64"
if exist "dist\win32" rd /s /q "dist\win32"
if exist "dist\*.exe" del /q "dist\*.exe"

call npm run build:installer

if errorlevel 1 (
    echo.
    echo [ERRO] Build do instalador falhou. Veja os logs acima.
    pause
    exit /b 1
)

echo.
echo  ============================================
echo   Instalador criado! Pasta: dist\
echo  ============================================
echo.
pause
