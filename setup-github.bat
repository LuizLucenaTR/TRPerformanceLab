@echo off
chcp 65001 >nul
:: 🚀 Script de Configuração Rápida para GitHub (Windows)

echo.
echo 🚀 Setup Repositório GitHub - Performance Testing
echo ================================================

:: Verificar se os parâmetros foram fornecidos
if "%~1"=="" (
    echo ❌ Uso: setup-github.bat SEU_USERNAME_GITHUB [NOME_REPOSITORIO]
    echo Exemplo: setup-github.bat joaosilva TRPerformanceLab
    pause
    exit /b 1
)

set GITHUB_USERNAME=%~1
set REPO_NAME=%~2
if "%REPO_NAME%"=="" set REPO_NAME=TRPerformanceLab

echo 👤 Username GitHub: %GITHUB_USERNAME%
echo 📁 Nome do Repositório: %REPO_NAME%
echo.

:: Verificar se Git está instalado
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git não encontrado! Instale o Git primeiro.
    echo 🔗 https://git-scm.com/download/win
    pause
    exit /b 1
)
echo ✅ Git encontrado

:: Verificar configuração do Git
for /f "tokens=*" %%a in ('git config --global user.name 2^>nul') do set GIT_USER=%%a
for /f "tokens=*" %%a in ('git config --global user.email 2^>nul') do set GIT_EMAIL=%%a

if "%GIT_USER%"=="" (
    echo ⚠️  Nome do usuário Git não configurado
    set /p GIT_USER="Digite seu nome para o Git: "
    git config --global user.name "%GIT_USER%"
    echo ✅ Nome configurado: %GIT_USER%
)

if "%GIT_EMAIL%"=="" (
    echo ⚠️  Email do Git não configurado
    set /p GIT_EMAIL="Digite seu email para o Git: "
    git config --global user.email "%GIT_EMAIL%"
    echo ✅ Email configurado: %GIT_EMAIL%
)

:: Inicializar Git se necessário
if not exist .git (
    git init
    echo ✅ Repositório Git inicializado
) else (
    echo 📁 Repositório Git já existe
)

:: Criar .gitignore
echo 📝 Criando .gitignore...
(
echo # Node modules
echo node_modules/
echo.
echo # Test results
echo test-results/
echo allure-results/
echo allure-report/
echo.
echo # Logs
echo *.log
echo logs/
echo.
echo # Environment files
echo .env
echo .env.local
echo.
echo # IDE files
echo .vscode/
echo .idea/
echo *.swp
echo *.swo
echo.
echo # OS files
echo .DS_Store
echo Thumbs.db
echo.
echo # k6 temporary files
echo *.json.tmp
) > .gitignore
echo ✅ .gitignore criado

:: Verificar se remote já existe
git remote | findstr "origin" >nul
if errorlevel 1 (
    :: Adicionar remote origin
    git remote add origin https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git
    echo ✅ Remote origin adicionado: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git
) else (
    echo 🔗 Remote origin já existe
)

:: Verificar arquivos essenciais
echo.
echo 📋 Verificando arquivos do projeto...
set FILES_OK=1

if exist ".github\workflows\performance-tests.yml" (
    echo ✅ .github\workflows\performance-tests.yml
) else (
    echo ❌ .github\workflows\performance-tests.yml
    set FILES_OK=0
)

if exist ".github\workflows\allure-report-action.yml" (
    echo ✅ .github\workflows\allure-report-action.yml
) else (
    echo ❌ .github\workflows\allure-report-action.yml
    set FILES_OK=0
)

if exist "tests\performance\load_test_scenario.js" (
    echo ✅ tests\performance\load_test_scenario.js
) else (
    echo ❌ tests\performance\load_test_scenario.js
    set FILES_OK=0
)

if exist "tests\performance\stress_test_scenario.js" (
    echo ✅ tests\performance\stress_test_scenario.js
) else (
    echo ❌ tests\performance\stress_test_scenario.js
    set FILES_OK=0
)

if %FILES_OK%==0 (
    echo.
    echo ❌ Arquivos essenciais não encontrados!
    echo Execute este script no diretório correto do projeto.
    pause
    exit /b 1
)

:: Adicionar arquivos ao Git
echo.
echo 📤 Adicionando arquivos ao Git...
git add .

:: Verificar e criar branch main se necessário
git branch | findstr "main" >nul
if errorlevel 1 (
    echo 📝 Criando branch main...
    git checkout -b main 2>nul
    if errorlevel 1 (
        echo ✅ Branch main já existe ou foi criada
    ) else (
        echo ✅ Branch main criada
    )
) else (
    echo ✅ Branch main já existe
    git checkout main 2>nul
)

:: Fazer commit
echo 📝 Fazendo commit...
git commit -m "feat: Initial setup - Performance testing pipeline with k6 and GitHub Actions"
if errorlevel 1 (
    echo ⚠️  Nenhuma alteração para commit ou commit já existe
) else (
    echo ✅ Commit realizado
)

:: Fazer push
echo 🚀 Enviando para GitHub...
git push -u origin main
if errorlevel 1 (
    echo ⚠️  Erro no push. Tentando sincronizar...
    git pull origin main --allow-unrelated-histories 2>nul
    if errorlevel 1 (
        echo 📝 Repositório remoto vazio, fazendo push inicial...
        git push -u origin main
        if errorlevel 1 (
            echo ❌ Erro no push. Veja comandos manuais abaixo.
        ) else (
            echo ✅ Push inicial realizado com sucesso!
        )
    ) else (
        git push origin main
        if errorlevel 1 (
            echo ❌ Erro no push final. Veja comandos manuais abaixo.
        ) else (
            echo ✅ Push realizado após sincronização!
        )
    )
) else (
    echo ✅ Push realizado com sucesso!
)

:: Mostrar próximos passos
echo.
echo 🎉 CONFIGURAÇÃO CONCLUÍDA!
echo ========================
echo.
echo 📋 PRÓXIMOS PASSOS:
echo.
echo 1. Acesse: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%
echo 2. Vá para Settings ^> Pages
echo 3. Configure Source: GitHub Actions
echo 4. Vá para Actions ^> Performance Tests
echo 5. Execute seu primeiro teste!
echo.
echo 📊 Relatórios ficarão disponíveis em:
echo https://%GITHUB_USERNAME%.github.io/%REPO_NAME%/allure-report/
echo.
echo 🔐 Para APIs com autenticação, configure os Secrets:
echo Settings ^> Secrets and variables ^> Actions
echo - BASIC_AUTH_PASSWORD (para Basic Auth)
echo - BEARER_TOKEN (para Bearer Token)
echo.
echo 🔧 SE AINDA HOUVER PROBLEMAS, EXECUTE MANUALMENTE:
echo git remote -v
echo git status
echo git add .
echo git commit -m "Initial setup"
echo git branch -M main
echo git push -u origin main
echo.
echo 💡 Ou use o PowerShell: .\setup-github.ps1 -GitHubUsername "%GITHUB_USERNAME%"
echo.

pause
