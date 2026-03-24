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
echo   [4] Checkpoint leve    (ZIP da branch, so codigo)
echo   [5] Checkpoint completo (ZIP da branch, codigo + assets)
echo.
set /p OPCAO= Escolha (1, 2, 3, 4 ou 5): 

if "%OPCAO%"=="1" goto :installer
if "%OPCAO%"=="2" goto :update_leve
if "%OPCAO%"=="3" goto :update_completo
if "%OPCAO%"=="4" goto :checkpoint_leve
if "%OPCAO%"=="5" goto :checkpoint_completo
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
:checkpoint_leve
:: ══════════════════════════════════════════════════════════════════════════════
echo.
echo  Checkpoint leve - ZIP da branch como URL (so codigo, sem assets)
echo.

where node >nul 2>&1
if errorlevel 1 ( echo [ERRO] Node.js nao encontrado. & pause & exit /b 1 )
where git >nul 2>&1
if errorlevel 1 ( echo [ERRO] Git nao encontrado. & pause & exit /b 1 )

git config --global user.email "claravallac@github.com"
git config --global user.name "Claravallac"

for /f "tokens=2 delims=:, " %%v in ('findstr /i "\"version\"" package.json') do (
    set RAW_VER=%%~v & goto :_cpl_ver
)
:_cpl_ver
set CURRENT_VER=%RAW_VER:"=%
echo  Versao atual: %CURRENT_VER%
set /p VERSION= Nova versao (ex: 1.0.31): 
if "%VERSION%"=="" set VERSION=%CURRENT_VER%
node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json','utf8'));p.version='%VERSION%';fs.writeFileSync('package.json',JSON.stringify(p,null,2),'utf8');"
echo  Versao definida: %VERSION%

set /p NOTES= Notas desta versao: 
if "%NOTES%"=="" set NOTES=Checkpoint.

echo Detectando arquivos removidos...
node detect-removed.js
echo Atualizando changelog...
node update-changelog.js

echo %NOTES%> _cp_notes.txt
echo const fs=require('fs'); > _cp_write.js
echo const ver='%VERSION%'; >> _cp_write.js
echo const notes=fs.readFileSync('_cp_notes.txt','utf8').trim(); >> _cp_write.js
echo const zip='https://github.com/Claravallac/p7vn-folder/archive/refs/heads/main.zip'; >> _cp_write.js
echo fs.writeFileSync('version.json',JSON.stringify({version:ver,notes:notes,url:zip},null,2),'utf8'); >> _cp_write.js
echo const cl=JSON.parse(fs.readFileSync('changelog.json','utf8')); >> _cp_write.js
echo const e=cl.find(function(x){return x.version===ver;}); >> _cp_write.js
echo if(e){e.url=zip;fs.writeFileSync('changelog.json',JSON.stringify(cl,null,2),'utf8');} >> _cp_write.js
node _cp_write.js
del _cp_write.js _cp_notes.txt 2>nul

git add --all -- . ":(exclude)assets/*"
git commit -m "checkpoint leve: versao %VERSION%"
git push --force origin main
if errorlevel 1 ( echo [ERRO] Push falhou. & pause & exit /b 1 )

echo.
echo  ============================================
echo   Checkpoint v%VERSION% publicado!
echo   Jogadores que passarem por esta versao
echo   recebem o estado completo do jogo.
echo  ============================================
echo.
pause
goto :eof

:: ══════════════════════════════════════════════════════════════════════════════
:checkpoint_completo
:: ══════════════════════════════════════════════════════════════════════════════
echo.
echo  Checkpoint completo - ZIP da branch como URL (codigo + assets)
echo.

where node >nul 2>&1
if errorlevel 1 ( echo [ERRO] Node.js nao encontrado. & pause & exit /b 1 )
where git >nul 2>&1
if errorlevel 1 ( echo [ERRO] Git nao encontrado. & pause & exit /b 1 )

git config --global user.email "claravallac@github.com"
git config --global user.name "Claravallac"

for /f "tokens=2 delims=:, " %%v in ('findstr /i "\"version\"" package.json') do (
    set RAW_VER=%%~v & goto :_cpc_ver
)
:_cpc_ver
set CURRENT_VER=%RAW_VER:"=%
echo  Versao atual: %CURRENT_VER%
set /p VERSION= Nova versao (ex: 1.0.31): 
if "%VERSION%"=="" set VERSION=%CURRENT_VER%
node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json','utf8'));p.version='%VERSION%';fs.writeFileSync('package.json',JSON.stringify(p,null,2),'utf8');"
echo  Versao definida: %VERSION%

set /p NOTES= Notas desta versao: 
if "%NOTES%"=="" set NOTES=Checkpoint.

echo Detectando arquivos removidos...
node detect-removed.js
echo Atualizando changelog...
node update-changelog.js

echo %NOTES%> _cp_notes.txt
echo const fs=require('fs'); > _cp_write.js
echo const ver='%VERSION%'; >> _cp_write.js
echo const notes=fs.readFileSync('_cp_notes.txt','utf8').trim(); >> _cp_write.js
echo const zip='https://github.com/Claravallac/p7vn-folder/archive/refs/heads/main.zip'; >> _cp_write.js
echo fs.writeFileSync('version.json',JSON.stringify({version:ver,notes:notes,url:zip},null,2),'utf8'); >> _cp_write.js
echo const cl=JSON.parse(fs.readFileSync('changelog.json','utf8')); >> _cp_write.js
echo const e=cl.find(function(x){return x.version===ver;}); >> _cp_write.js
echo if(e){e.url=zip;fs.writeFileSync('changelog.json',JSON.stringify(cl,null,2),'utf8');} >> _cp_write.js
node _cp_write.js
del _cp_write.js _cp_notes.txt 2>nul

git add --all .
git add -f assets/audio/
git add -f assets/fonts/
git add -f assets/images/
git add -f assets/videos/
git commit -m "checkpoint completo: versao %VERSION%"
git push --force origin main
if errorlevel 1 ( echo [ERRO] Push falhou. & pause & exit /b 1 )

echo.
echo  ============================================
echo   Checkpoint v%VERSION% publicado!
echo   Jogadores que passarem por esta versao
echo   recebem o estado completo do jogo.
echo  ============================================
echo.
pause
goto :eof

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

:: Atualiza changelog.json com URL do delta desta versao
node -e "const fs=require('fs');const cl=JSON.parse(fs.readFileSync('changelog.json','utf8'));const e=cl.find(function(x){return x.version==='%VERSION%';});if(e){e.url='%DELTA_URL%';fs.writeFileSync('changelog.json',JSON.stringify(cl,null,2),'utf8');console.log('changelog.json atualizado com URL');}"

git add version.json changelog.json
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
