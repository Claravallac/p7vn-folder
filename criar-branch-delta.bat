@echo off
title Himari Games - Criar Branch Delta Update
color 0D
cd /d "%~dp0"

echo.
echo  ============================================
echo   Criando branch delta-update
echo  ============================================
echo.

where git >nul 2>&1
if errorlevel 1 ( echo [ERRO] Git nao encontrado. & pause & exit /b 1 )

echo [1/5] Verificando repositorio...
git fetch origin >nul 2>&1

:: Guarda mudancas nao commitadas
git stash >nul 2>&1

:: Tenta ir para main
git checkout main >nul 2>&1
if errorlevel 1 (
    git checkout -b main >nul 2>&1
    if errorlevel 1 ( echo [ERRO] Nao foi possivel acessar a branch main. & pause & exit /b 1 )
)

:: Deleta branch antiga se existir
git branch -D delta-update >nul 2>&1
git push origin --delete delta-update >nul 2>&1

:: Cria branch nova a partir da main
echo [2/5] Criando branch delta-update...
git checkout -b delta-update
if errorlevel 1 ( echo [ERRO] Falha ao criar branch. & pause & exit /b 1 )

:: Ajusta package.json para asar=false
echo [3/5] Ajustando package.json para asar=false...
node -e "const fs=require('fs'); const p=JSON.parse(fs.readFileSync('package.json','utf8')); if(p.build) p.build.asar=false; fs.writeFileSync('package.json',JSON.stringify(p,null,2),'utf8');"

:: Copia arquivos do sistema delta
echo [4/5] Adicionando arquivos do sistema delta...
copy /y "%~dp0main.js" "main.js" >nul 2>&1
copy /y "%~dp0updater.js" "updater.js" >nul 2>&1
copy /y "%~dp0r2-upload.js" "r2-upload.js" >nul 2>&1

:: Commita
git add package.json main.js updater.js r2-upload.js
git commit -m "delta-update: asar=false, auto-extract, r2 delta zip"
if errorlevel 1 ( echo [ERRO] Commit falhou. & pause & exit /b 1 )

:: Sobe a branch
echo [5/5] Subindo branch para o GitHub...
git push origin delta-update
if errorlevel 1 ( echo [AVISO] Push falhou. Verifique sua conexao. )

echo.
echo  ============================================
echo   Branch delta-update criada com sucesso!
echo.
echo   Para buildar nessa branch: build.bat
echo   Para voltar pra main: git checkout main
echo  ============================================
echo.
pause
