@echo off
chcp 65001 >nul
:: 🔧 Script para Corrigir Problemas de Git Push

echo.
echo 🔧 Correção de Problemas Git Push
echo ================================

:: Verificar se os parâmetros foram fornecidos
if "%~1"=="" (
    echo ❌ Uso: fix-git-push.bat SEU_USERNAME_GITHUB [NOME_REPOSITORIO]
    echo Exemplo: fix-git-push.bat joaosilva TRPerformanceLab
    pause
    exit /b 1
)

set GITHUB_USERNAME=%~1
set REPO_NAME=%~2
if "%REPO_NAME%"=="" set REPO_NAME=TRPerformanceLab

echo 👤 Username: %GITHUB_USERNAME%
echo 📁 Repositório: %REPO_NAME%
echo.

:: Verificar status atual
echo 📋 Status atual do Git:
git status
echo.

:: Verificar remote
echo 🔗 Verificando remote:
git remote -v
echo.

:: Remover remote se estiver errado
echo 🧹 Limpando configuração remota...
git remote remove origin 2>nul

:: Adicionar remote correto
echo ➕ Adicionando remote correto...
git remote add origin https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git
git remote -v
echo.

:: Verificar branch atual
echo 🌿 Verificando branch atual:
git branch
echo.

:: Criar/mudar para branch main
echo 📝 Configurando branch main...
git checkout main 2>nul
if errorlevel 1 (
    echo Criando branch main...
    git checkout -b main
) else (
    echo ✅ Já na branch main
)
echo.

:: Adicionar arquivos
echo 📤 Adicionando arquivos...
git add .
echo.

:: Fazer commit
echo 💾 Fazendo commit...
git commit -m "feat: Initial setup - Performance testing pipeline with k6 and GitHub Actions"
if errorlevel 1 (
    echo ⚠️  Nenhuma alteração para commit
) else (
    echo ✅ Commit realizado
)
echo.

:: Tentar push
echo 🚀 Tentativa 1 - Push simples...
git push -u origin main
if not errorlevel 1 (
    echo ✅ Push realizado com sucesso!
    goto success
)

echo ⚠️  Falhou. Tentativa 2 - Forçar branch upstream...
git branch -M main
git push -u origin main
if not errorlevel 1 (
    echo ✅ Push realizado após configurar branch!
    goto success
)

echo ⚠️  Falhou. Tentativa 3 - Force push...
git push --force-with-lease -u origin main
if not errorlevel 1 (
    echo ✅ Push realizado com force!
    goto success
)

echo ❌ Todas as tentativas falharam.
echo.
echo 🔍 POSSÍVEIS CAUSAS:
echo 1. Repositório não existe no GitHub
echo 2. Sem permissão de acesso
echo 3. Credenciais incorretas
echo 4. Nome de usuário/repositório incorreto
echo.
echo 🛠️  SOLUÇÕES:
echo 1. Verifique se o repositório existe: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%
echo 2. Verifique suas credenciais do Git
echo 3. Tente fazer login: gh auth login (se tiver GitHub CLI)
echo.
goto end

:success
echo.
echo 🎉 PUSH REALIZADO COM SUCESSO!
echo ==============================
echo.
echo 📋 PRÓXIMOS PASSOS:
echo 1. Acesse: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%
echo 2. Configure GitHub Pages: Settings ^> Pages ^> Source: GitHub Actions
echo 3. Execute seu primeiro teste: Actions ^> Performance Tests
echo.
echo 📊 Relatórios em: https://%GITHUB_USERNAME%.github.io/%REPO_NAME%/allure-report/
echo.

:end
pause
