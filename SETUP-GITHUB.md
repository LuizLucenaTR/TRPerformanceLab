# 🚀 Guia Completo: Configuração do Repositório GitHub para Testes de Performance

## 📋 Pré-requisitos

- ✅ Conta no GitHub
- ✅ Git instalado na máquina
- ✅ Terminal/PowerShell/CMD
- ✅ Acesso à API que será testada

---

## 🔧 Passo 1: Criar Repositório no GitHub

### 1.1 Via Interface Web do GitHub
1. Acesse [github.com](https://github.com)
2. Faça login na sua conta
3. Clique no botão **"New repository"** (ou "+")
4. Configure o repositório:
   - **Repository name:** `TRPerformanceLab` (ou nome de sua preferência)
   - **Description:** `CI/CD Pipeline for Load and Stress Testing with k6 and GitHub Actions`
   - ✅ **Public** (para usar GitHub Pages gratuito)
   - ❌ **Não** marque "Add a README file"
   - ❌ **Não** adicione .gitignore ou license ainda
5. Clique em **"Create repository"**

### 1.2 Copiar URL do Repositório
Após criar, copie a URL do repositório (formato: `https://github.com/seu-usuario/TRPerformanceLab.git`)

---

## 🔄 Passo 2: Configurar Git Local

### 2.1 Navegar para o Diretório do Projeto
```powershell
cd C:\GitHub\TRPerformanceLab
```

### 2.2 Inicializar Git (se não estiver inicializado)
```powershell
git init
```

### 2.3 Configurar Git (se não estiver configurado)
```powershell
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"
```

### 2.4 Adicionar Remote Origin
```powershell
git remote add origin https://github.com/SEU-USUARIO/TRPerformanceLab.git
```

**⚠️ Substitua `SEU-USUARIO` pelo seu username do GitHub**

---

## 📁 Passo 3: Preparar Arquivos para Upload

### 3.1 Criar .gitignore
```powershell
# Criar arquivo .gitignore
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
"@ | Out-File -FilePath .gitignore -Encoding UTF8
```

### 3.2 Criar README.md
```powershell
# Criar README principal
@"
# 🚀 TRPerformanceLab

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
3. Configure os parâmetros do teste
4. Execute e aguarde os resultados

## 📈 Visualizar Relatórios

Os relatórios Allure estarão disponíveis em:
https://SEU-USUARIO.github.io/TRPerformanceLab/allure-report/

## 🔧 Configuração

Veja [SETUP-GITHUB.md](SETUP-GITHUB.md) para instruções de configuração completa.
"@ | Out-File -FilePath README.md -Encoding UTF8
```

---

## 📤 Passo 4: Fazer Upload dos Arquivos

### 4.1 Adicionar Todos os Arquivos
```powershell
git add .
```

### 4.2 Fazer Commit Inicial
```powershell
git commit -m "feat: Initial setup - Performance testing pipeline with k6 and GitHub Actions

- Add GitHub Actions workflow for load and stress testing
- Add k6 scripts for load and stress test scenarios  
- Add Allure reporting integration
- Configure authentication support (Basic Auth, Bearer Token)
- Add reusable workflow for report generation"
```

### 4.3 Push para GitHub
```powershell
git push -u origin main
```

---

## ⚙️ Passo 5: Configurar GitHub Pages

### 5.1 Habilitar GitHub Pages
1. Vá para o seu repositório no GitHub
2. Clique em **Settings** (aba no topo)
3. Scroll down até **Pages** (menu lateral esquerdo)
4. Em **Source**, selecione **GitHub Actions**
5. Clique **Save**

### 5.2 Verificar Configuração
- ✅ Source: GitHub Actions
- ✅ Custom domain: (deixe vazio, a menos que tenha um domínio próprio)

---

## 🔐 Passo 6: Configurar Secrets (Se Necessário)

### 6.1 Para APIs com Autenticação
Se sua API requer autenticação, configure os secrets:

1. Vá para **Settings** → **Secrets and variables** → **Actions**
2. Clique **New repository secret**

### 6.2 Secrets Recomendados

**Para Basic Authentication:**
- **Name:** `BASIC_AUTH_PASSWORD`
- **Secret:** `sua-senha-aqui`

**Para Bearer Token:**
- **Name:** `BEARER_TOKEN`  
- **Secret:** `seu-token-aqui`

**Para APIs de Teste:**
- **Name:** `API_TEST_TOKEN`
- **Secret:** `token-da-api-de-teste`

---

## 🎯 Passo 7: Executar Primeiro Teste

### 7.1 Navegar para Actions
1. No seu repositório, clique na aba **Actions**
2. Você verá o workflow **"Performance Tests (Load & Stress)"**
3. Clique em **Run workflow**

### 7.2 Configurar Teste Inicial
```
Test Type: load
Target Endpoint: https://httpbin.org
Virtual Users: 5
Test Duration: 2m
Ramp Up Time: 30s
Authentication: none
```

### 7.3 Executar e Monitorar
1. Clique **Run workflow**
2. Aguarde a execução (3-5 minutos)
3. Verifique os logs em tempo real

---

## 📊 Passo 8: Verificar Relatórios

### 8.1 Acessar Relatório Allure
Após o teste, acesse:
`https://SEU-USUARIO.github.io/TRPerformanceLab/allure-report/`

### 8.2 Verificar GitHub Pages
1. **Settings** → **Pages**
2. Verifique se mostra: **"Your site is published at..."**
3. Pode levar alguns minutos para ficar disponível

---

## 🔍 Passo 9: Verificação Completa

### ✅ Checklist Final
- [ ] Repositório criado e arquivos enviados
- [ ] GitHub Pages habilitado
- [ ] Secrets configurados (se necessário)
- [ ] Primeiro teste executado com sucesso
- [ ] Relatório Allure acessível
- [ ] Pipeline funcionando corretamente

---

## 🆘 Solução de Problemas Comuns

### Problema 1: Git Push Rejeitado
```powershell
# Se o push for rejeitado, tente:
git pull origin main --allow-unrelated-histories
git push origin main
```

### Problema 2: GitHub Pages Não Funciona
- Verifique se o repositório é **público**
- Aguarde até 10 minutos após habilitar
- Verifique se há erros na aba **Actions**

### Problema 3: Workflow Não Aparece
```powershell
# Verifique se a estrutura está correta:
ls .github/workflows/
# Deve mostrar: performance-tests.yml, allure-report-action.yml
```

### Problema 4: Teste Falha
- Verifique se o endpoint está acessível
- Confirme se os secrets estão configurados corretamente
- Verifique os logs na aba Actions

---

## 📞 Comandos de Referência Rápida

```powershell
# Ver status do git
git status

# Ver remote configurado
git remote -v

# Ver histórico de commits
git log --oneline

# Sincronizar com GitHub
git pull origin main
git push origin main

# Ver branches
git branch -a
```

---

## 🎉 Próximos Passos

Após a configuração:

1. **Teste sua API real** substituindo `https://httpbin.org` 
2. **Configure alertas** para falhas de performance
3. **Automatize execução** via cron ou webhooks
4. **Customize thresholds** nos scripts k6
5. **Integre com monitoring** (Grafana, DataDog, etc.)

---

**🚀 Seu pipeline de performance testing está pronto!**
