@echo off
title Himari Games - Visual Novel
color 0A

echo.
echo ============================================
echo   HIMARI GAMES - Inicializador
echo ============================================
echo.

:: Mudar para a pasta do script
cd /d "%~dp0"

:: Verificar se node esta instalado
where node >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado!
    echo.
    echo Por favor, instale o Node.js em: https://nodejs.org
    echo.
    pause
    exit /b 1
)

:: Verificar se npm esta instalado
where npm >nul 2>&1
if errorlevel 1 (
    echo [ERRO] NPM nao encontrado!
    echo.
    echo O NPM deve vir junto com o Node.js. Reinstale o Node.js.
    echo.
    pause
    exit /b 1
)

:: Verificar se package.json existe
if not exist "package.json" (
    echo [ERRO] package.json nao encontrado!
    echo.
    echo Certifique-se de estar na pasta correta do projeto.
    echo.
    pause
    exit /b 1
)

:: Instalar dependencias se node_modules nao existe
if not exist "node_modules\" (
    echo [1/3] Instalando dependencias do projeto...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo [ERRO] Falha ao instalar dependencias.
        echo Verifique sua conexao com a internet e tente novamente.
        echo.
        pause
        exit /b 1
    )
    echo.
) else (
    echo [1/3] Dependencias ja instaladas.
)

:: Verificar se electron esta instalado
if not exist "node_modules\electron\" (
    echo [2/3] Electron nao encontrado. Instalando...
    echo.
    call npm install --save-dev electron
    if errorlevel 1 (
        echo.
        echo [ERRO] Falha ao instalar Electron.
        echo.
        pause
        exit /b 1
    )
    echo.
) else (
    echo [2/3] Electron encontrado.
)

:: Verificar se main.js existe
if not exist "main.js" (
    echo [ERRO] Arquivo main.js nao encontrado!
    echo.
    pause
    exit /b 1
)

:: Iniciar Electron
echo [3/3] Iniciando aplicacao...
echo.
echo Pressione Ctrl+C para parar o aplicativo.
echo.

:: Executar Electron
call npm start

if errorlevel 1 (
    echo.
    echo [ERRO] Falha ao iniciar o Electron.
    echo.
    echo Possiveis solucoes:
    echo 1. Execute "npm install" novamente
    echo 2. Verifique se ha erros no console acima
    echo 3. Tente executar manualmente: npm start
    echo.
    pause
    exit /b 1
)
