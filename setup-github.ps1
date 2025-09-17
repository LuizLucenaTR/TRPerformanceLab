# 🚀 Script de Configuração Automática para GitHub
# Execute este script para configurar automaticamente o repositório

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername,
    
    [Parameter(Mandatory=$true)]
    [string]$RepositoryName = "TRPerformanceLab",
    
    [Parameter(Mandatory=$false)]
    [string]$UserName,
    
    [Parameter(Mandatory=$false)]
    [string]$UserEmail
)

Write-Host "🚀 Iniciando configuração do repositório GitHub..." -ForegroundColor Green
Write-Host "Username: $GitHubUsername" -ForegroundColor Cyan
Write-Host "Repository: $RepositoryName" -ForegroundColor Cyan

# Verificar se estamos no diretório correto
$currentDir = Get-Location
Write-Host "📁 Diretório atual: $currentDir" -ForegroundColor Yellow

# Verificar se Git está instalado
try {
    $gitVersion = git --version
    Write-Host "✅ Git encontrado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git não encontrado. Instale o Git primeiro!" -ForegroundColor Red
    exit 1
}

# Configurar Git (se necessário)
if ($UserName) {
    git config --global user.name "$UserName"
    Write-Host "✅ Nome do usuário configurado: $UserName" -ForegroundColor Green
}

if ($UserEmail) {
    git config --global user.email "$UserEmail"
    Write-Host "✅ Email configurado: $UserEmail" -ForegroundColor Green
}

# Verificar configuração atual do Git
$currentUser = git config --global user.name
$currentEmail = git config --global user.email

if (-not $currentUser -or -not $currentEmail) {
    Write-Host "⚠️  Configuração do Git incompleta!" -ForegroundColor Yellow
    Write-Host "Execute novamente com -UserName 'Seu Nome' -UserEmail 'seu@email.com'" -ForegroundColor Yellow
}

# Inicializar Git se necessário
if (-not (Test-Path ".git")) {
    git init
    Write-Host "✅ Repositório Git inicializado" -ForegroundColor Green
} else {
    Write-Host "📁 Repositório Git já existe" -ForegroundColor Yellow
}

# Criar .gitignore
Write-Host "📝 Criando .gitignore..." -ForegroundColor Cyan
@"
# Node modules
node_modules/

# Test results
test-results/
allure-results/
allure-report/

# Logs
*.log
logs/

# Environment files
.env
.env.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# k6 temporary files
*.json.tmp

# PowerShell execution policy files
*.ps1xml
"@ | Out-File -FilePath .gitignore -Encoding UTF8
Write-Host "✅ .gitignore criado" -ForegroundColor Green

# Criar README.md
Write-Host "📝 Criando README.md..." -ForegroundColor Cyan
@"
# 🚀 $RepositoryName

Pipeline de CI/CD para Testes de Performance usando k6 e GitHub Actions.

## 📊 Funcionalidades

- **Load Testing**: Testes de carga simulando usuários reais
- **Stress Testing**: Testes de estresse para encontrar limites do sistema  
- **Relatórios Allure**: Relatórios detalhados e visuais
- **GitHub Actions**: Pipeline automatizado
- **Autenticação Flexível**: Suporte para Basic Auth e Bearer Token

## 🏃‍♂️ Como Executar

1. Vá para **Actions** → **Performance Tests (Load & Stress)**
2. Clique em **Run workflow**
3. Configure os parâmetros do teste:
   - **Test Type**: load ou stress
   - **Target Endpoint**: URL da API (ex: https://api.exemplo.com)
   - **Virtual Users**: Número de usuários simultâneos
   - **Test Duration**: Duração do teste (ex: 5m)
   - **Authentication**: Tipo de autenticação
4. Execute e aguarde os resultados

## 📈 Visualizar Relatórios

Os relatórios Allure estarão disponíveis em:
**https://$GitHubUsername.github.io/$RepositoryName/allure-report/**

## 🔧 Configuração

### Secrets Necessários (se usando autenticação):

**Para Basic Auth:**
- `BASIC_AUTH_PASSWORD` - Senha para autenticação básica

**Para Bearer Token:**
- `BEARER_TOKEN` - Token de autorização

### Como Adicionar Secrets:
1. Vá para Settings → Secrets and variables → Actions
2. Clique em "New repository secret"
3. Adicione o nome e valor do secret

## 📋 Estrutura do Projeto

```
.github/workflows/
├── performance-tests.yml        # Workflow principal
└── allure-report-action.yml     # Workflow para relatórios

tests/performance/
├── load_test_scenario.js        # Script de teste de carga
└── stress_test_scenario.js      # Script de teste de estresse
```

## 🎯 Exemplos de Uso

### Teste de Carga Básico
- **Target**: https://httpbin.org
- **VUsers**: 10
- **Duration**: 5m
- **Auth**: none

### Teste de Estresse API REST
- **Target**: https://sua-api.com
- **VUsers**: 50
- **Duration**: 10m
- **Auth**: bearer_token

## 📊 Métricas Analisadas

- **Response Time**: Tempo de resposta (avg, min, max, p95)
- **Throughput**: Requisições por segundo
- **Error Rate**: Taxa de erro
- **Virtual Users**: Usuários simultâneos
- **HTTP Status**: Distribuição de códigos de status

## 🔍 Troubleshooting

### Pipeline Falha
1. Verifique se o endpoint está acessível
2. Confirme se os secrets estão configurados
3. Veja os logs na aba Actions

### Relatório Não Aparece
1. Verifique se GitHub Pages está habilitado
2. Aguarde alguns minutos após a execução
3. Confirme se o repositório é público

## 🚀 Próximos Passos

- [ ] Configure alertas para falhas
- [ ] Integre com monitoring (Grafana, DataDog)
- [ ] Automatize execução via schedule
- [ ] Customize thresholds para sua API
- [ ] Adicione mais cenários de teste

---

**Criado com ❤️ usando k6 e GitHub Actions**
"@ | Out-File -FilePath README.md -Encoding UTF8
Write-Host "✅ README.md criado" -ForegroundColor Green

# Verificar se remote já existe
$remotes = git remote
if ($remotes -contains "origin") {
    Write-Host "🔗 Remote origin já existe" -ForegroundColor Yellow
    $currentOrigin = git remote get-url origin
    Write-Host "   URL atual: $currentOrigin" -ForegroundColor Gray
} else {
    # Adicionar remote origin
    $repoUrl = "https://github.com/$GitHubUsername/$RepositoryName.git"
    git remote add origin $repoUrl
    Write-Host "✅ Remote origin adicionado: $repoUrl" -ForegroundColor Green
}

# Verificar arquivos criados
Write-Host "📋 Verificando arquivos criados..." -ForegroundColor Cyan
$requiredFiles = @(
    ".github/workflows/performance-tests.yml",
    ".github/workflows/allure-report-action.yml", 
    "tests/performance/load_test_scenario.js",
    "tests/performance/stress_test_scenario.js",
    "README.md",
    ".gitignore"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file (não encontrado)" -ForegroundColor Red
    }
}

# Adicionar arquivos ao Git
Write-Host "📤 Adicionando arquivos ao Git..." -ForegroundColor Cyan
git add .

# Fazer commit
$commitMessage = @"
feat: Initial setup - Performance testing pipeline with k6 and GitHub Actions

- Add GitHub Actions workflow for load and stress testing
- Add k6 scripts for load and stress test scenarios
- Add Allure reporting integration  
- Configure authentication support (Basic Auth, Bearer Token)
- Add reusable workflow for report generation
- Setup automated CI/CD pipeline
"@

git commit -m $commitMessage
Write-Host "✅ Commit realizado" -ForegroundColor Green

# Fazer push
Write-Host "🚀 Enviando para GitHub..." -ForegroundColor Cyan
try {
    git push -u origin main
    Write-Host "✅ Push realizado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Erro no push. Tentando alternativa..." -ForegroundColor Yellow
    try {
        git pull origin main --allow-unrelated-histories
        git push origin main
        Write-Host "✅ Push realizado após sincronização!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro no push. Verifique manualmente:" -ForegroundColor Red
        Write-Host "   git push -u origin main" -ForegroundColor Gray
    }
}

# Mostrar próximos passos
Write-Host ""
Write-Host "🎉 CONFIGURAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. Acesse: https://github.com/$GitHubUsername/$RepositoryName" -ForegroundColor White
Write-Host "2. Vá para Settings → Pages" -ForegroundColor White
Write-Host "3. Configure Source: GitHub Actions" -ForegroundColor White
Write-Host "4. Vá para Actions → Performance Tests" -ForegroundColor White
Write-Host "5. Execute seu primeiro teste!" -ForegroundColor White
Write-Host ""
Write-Host "📊 Relatórios ficarão em:" -ForegroundColor Yellow
Write-Host "https://$GitHubUsername.github.io/$RepositoryName/allure-report/" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔐 Se precisar de autenticação, configure os Secrets:" -ForegroundColor Yellow
Write-Host "Settings → Secrets and variables → Actions" -ForegroundColor White
Write-Host "- BASIC_AUTH_PASSWORD (para Basic Auth)" -ForegroundColor White
Write-Host "- BEARER_TOKEN (para Bearer Token)" -ForegroundColor White
