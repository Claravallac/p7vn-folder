@echo off
title Himari Games - Build + Publicar Update
color 0D
cd /d "%~dp0"

echo.
echo  ============================================
echo   HIMARI GAMES - Build ^& Publicar Update
echo  ============================================
echo.

echo  O que deseja fazer?
echo.
echo   [1] Gerar installer (primeira distribuicao)
echo   [2] Update leve    (codigo: index.html, JS, CSS...)
echo   [3] Update completo (codigo + assets de midia)
echo.
set /p OPCAO= Escolha (1, 2 ou 3): 

if "%OPCAO%"=="1" goto :installer
if "%OPCAO%"=="2" goto :update_leve
if "%OPCAO%"=="3" goto :update_completo
echo [ERRO] Opcao invalida.
pause & exit /b 1

:: ══════════════════════════════════════════════════════════════════════════════
:installer
:: ══════════════════════════════════════════════════════════════════════════════
echo.
echo  Gerando installer...
echo.

where node >nul 2>&1
if errorlevel 1 ( echo [ERRO] Node.js nao encontrado. & pause & exit /b 1 )

for /f "tokens=2 delims=:, " %%v in ('findstr /i "\"installerVersion\"" package.json') do (
    set RAW_INST=%%~v & goto :got_inst_ver
)
:got_inst_ver
set CURRENT_INST=%RAW_INST:"=%

echo  Versao atual do installer: %CURRENT_INST%
set /p INST_VERSION= Nova versao do installer (ex: 1.0.0): 
if "%INST_VERSION%"=="" set INST_VERSION=%CURRENT_INST%

node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json','utf8'));p.installerVersion='%INST_VERSION%';p.version=p.version||'1.0.0';fs.writeFileSync('package.json',JSON.stringify(p,null,2),'utf8');"
echo  Versao do installer definida: %INST_VERSION%
echo.

if not exist "node_modules\" (
    echo Instalando dependencias...
    call npm install
    if errorlevel 1 ( echo [ERRO] npm install falhou. & pause & exit /b 1 )
)
if not exist "node_modules\electron-builder\" call npm install --save-dev electron-builder

echo Compilando installer...
if exist "dist\win-unpacked" rd /s /q "dist\win-unpacked"
if exist "dist\.icon-ico"    rd /s /q "dist\.icon-ico"

call npm run build:installer
if errorlevel 1 ( echo [ERRO] Build falhou. & pause & exit /b 1 )

set INSTALLER_PATH=
for %%f in (dist\*Setup*.exe) do set INSTALLER_PATH=%%f
if "%INSTALLER_PATH%"=="" (
    for %%f in (dist\*.exe) do set INSTALLER_PATH=%%f
)
if "%INSTALLER_PATH%"=="" ( echo [ERRO] Installer nao encontrado. & pause & exit /b 1 )

echo.
echo  ============================================
echo   Installer v%INST_VERSION% gerado!
echo   Arquivo: %INSTALLER_PATH%
echo   Distribua este arquivo para os jogadores.
echo  ============================================
echo.
explorer dist
pause
goto :eof

:: ══════════════════════════════════════════════════════════════════════════════
:update_leve
:: ══════════════════════════════════════════════════════════════════════════════
echo.
echo  Update leve - apenas codigo (JS, CSS, HTML...)
echo.

where node >nul 2>&1
if errorlevel 1 ( echo [ERRO] Node.js nao encontrado. & pause & exit /b 1 )
where gh >nul 2>&1
if errorlevel 1 ( echo [ERRO] GitHub CLI nao encontrado. & pause & exit /b 1 )
where git >nul 2>&1
if errorlevel 1 ( echo [ERRO] Git nao encontrado. & pause & exit /b 1 )

git config --global user.email "claravallac@github.com"
git config --global user.name "Claravallac"
if not exist ".git\" (
    git init
    git remote add origin https://github.com/Claravallac/p7vn-folder.git
    git add .
    git commit -m "inicial"
    git push --set-upstream origin main
)

for /f "tokens=2 delims=:, " %%v in ('findstr /i "\"version\"" package.json') do (
    set RAW_VER=%%~v & goto :got_ver_leve
)
:got_ver_leve
set CURRENT_VER=%RAW_VER:"=%
echo  Versao atual: %CURRENT_VER%
set /p VERSION= Nova versao (ex: 1.0.1): 
if "%VERSION%"=="" set VERSION=%CURRENT_VER%
node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json','utf8'));p.version='%VERSION%';fs.writeFileSync('package.json',JSON.stringify(p,null,2),'utf8');"
echo  Versao definida: %VERSION%

set /p NOTES= Notas desta versao: 
if "%NOTES%"=="" set NOTES=Nova atualizacao disponivel.
echo.

echo Detectando arquivos removidos...
node detect-removed.js
echo Atualizando changelog...
node update-changelog.js
node -e "const fs=require('fs');fs.writeFileSync('version.json',JSON.stringify({version:'%VERSION%',notes:'%NOTES%'},null,2),'utf8');"

echo Subindo arquivos para o GitHub...
git add --all -- . ":(exclude)assets/*"
git commit -m "update leve: versao %VERSION%"
git push --force origin main
if errorlevel 1 ( echo [ERRO] Push falhou. & pause & exit /b 1 )

goto :publicar_delta

:: ══════════════════════════════════════════════════════════════════════════════
:update_completo
:: ══════════════════════════════════════════════════════════════════════════════
echo.
echo  Update completo - codigo + assets de midia
echo.

where node >nul 2>&1
if errorlevel 1 ( echo [ERRO] Node.js nao encontrado. & pause & exit /b 1 )
where gh >nul 2>&1
if errorlevel 1 ( echo [ERRO] GitHub CLI nao encontrado. & pause & exit /b 1 )
where git >nul 2>&1
if errorlevel 1 ( echo [ERRO] Git nao encontrado. & pause & exit /b 1 )

git config --global user.email "claravallac@github.com"
git config --global user.name "Claravallac"
if not exist ".git\" (
    git init
    git remote add origin https://github.com/Claravallac/p7vn-folder.git
    git add .
    git commit -m "inicial"
    git push --set-upstream origin main
)

for /f "tokens=2 delims=:, " %%v in ('findstr /i "\"version\"" package.json') do (
    set RAW_VER=%%~v & goto :got_ver_completo
)
:got_ver_completo
set CURRENT_VER=%RAW_VER:"=%
echo  Versao atual: %CURRENT_VER%
set /p VERSION= Nova versao (ex: 1.0.1): 
if "%VERSION%"=="" set VERSION=%CURRENT_VER%
node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json','utf8'));p.version='%VERSION%';fs.writeFileSync('package.json',JSON.stringify(p,null,2),'utf8');"
echo  Versao definida: %VERSION%

set /p NOTES= Notas desta versao: 
if "%NOTES%"=="" set NOTES=Nova atualizacao disponivel.
echo.

echo Detectando arquivos removidos...
node detect-removed.js
echo Atualizando changelog...
node update-changelog.js
node -e "const fs=require('fs');fs.writeFileSync('version.json',JSON.stringify({version:'%VERSION%',notes:'%NOTES%'},null,2),'utf8');"

echo Subindo arquivos para o GitHub (incluindo assets)...
git add --all .
git add -f assets/audio/
git add -f assets/fonts/
git add -f assets/images/
git add -f assets/videos/
git commit -m "update completo: versao %VERSION%"
git push --force origin main
if errorlevel 1 ( echo [ERRO] Push falhou. & pause & exit /b 1 )

goto :publicar_delta

:: ══════════════════════════════════════════════════════════════════════════════
:publicar_delta
:: ══════════════════════════════════════════════════════════════════════════════
echo.
echo Gerando ZIP delta...
node make-delta.js %VERSION%
if errorlevel 1 ( echo [AVISO] Delta nao gerado — continuando sem ele. & goto :publicar_delta_end )

set DELTA_FILE=delta-v%VERSION%.zip
if not exist "%DELTA_FILE%" ( echo [AVISO] Arquivo delta nao encontrado — continuando sem ele. & goto :publicar_delta_end )

echo Criando GitHub Release v%VERSION%...
gh release create v%VERSION% "%DELTA_FILE%" --title "v%VERSION%" --notes "%NOTES%" --repo Claravallac/p7vn-folder
if errorlevel 1 ( echo [AVISO] Release falhou — jogadores usarao fallback do ZIP da branch. & goto :publicar_delta_cleanup )

gh release view v%VERSION% --repo Claravallac/p7vn-folder --json assets >_tmp_assets.json 2>nul
for /f "delims=" %%u in ('node get-release-url.js') do set DELTA_URL=%%u
del _tmp_assets.json 2>nul

if "%DELTA_URL%"=="" (
    echo [AVISO] URL do delta nao obtida — jogadores usarao fallback.
    goto :publicar_delta_cleanup
)

echo URL do delta: %DELTA_URL%

node -e "const fs=require('fs');fs.writeFileSync('version.json',JSON.stringify({version:'%VERSION%',notes:'%NOTES%',url:'%DELTA_URL%'},null,2),'utf8');"
git add version.json
git commit -m "update: url delta v%VERSION%"
git push --force origin main

echo.
echo  ============================================
echo   Update v%VERSION% publicado com delta!
echo   Players baixam apenas os arquivos alterados.
echo  ============================================

:publicar_delta_cleanup
if exist "%DELTA_FILE%" del "%DELTA_FILE%"

:publicar_delta_end
echo.
pause
goto :eof
