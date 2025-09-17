# ⚡ Comandos Rápidos - GitHub Setup

## 🚀 Setup Automático

### PowerShell (Recomendado)
```powershell
# Com configuração de usuário
.\setup-github.ps1 -GitHubUsername "seu-usuario" -UserName "Seu Nome" -UserEmail "seu@email.com"

# Apenas username (se Git já estiver configurado)
.\setup-github.ps1 -GitHubUsername "seu-usuario"
```

### Batch/CMD
```cmd
# Setup básico
setup-github.bat seu-usuario

# Com nome personalizado do repositório  
setup-github.bat seu-usuario MeuRepoTestes
```

## 🔧 Setup Manual

### 1. Configurar Git
```powershell
git init
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
git remote add origin https://github.com/SEU-USUARIO/REPO.git
```

### 2. Primeira vez enviando
```powershell
git add .
git commit -m "Initial commit"
git push -u origin main
```

### 3. Se der erro no push
```powershell
git pull origin main --allow-unrelated-histories
git push origin main
```

## 🔄 Comandos Git Úteis

### Status e Informações
```powershell
git status                    # Ver status atual
git remote -v                 # Ver repositórios remotos
git log --oneline            # Histórico de commits
git branch -a                # Ver todas as branches
```

### Sincronização
```powershell
git pull origin main         # Baixar alterações
git push origin main         # Enviar alterações
git fetch                    # Baixar refs sem merge
```

### Correções Rápidas
```powershell
# Desfazer último commit (mantém arquivos)
git reset --soft HEAD~1

# Desfazer alterações não commitadas
git checkout -- .

# Forçar push (cuidado!)
git push --force-with-lease origin main
```

## ⚙️ GitHub - Configurações Essenciais

### 1. Habilitar GitHub Pages
1. Settings → Pages
2. Source: **GitHub Actions**
3. Save

### 2. Configurar Secrets
```
Settings → Secrets and variables → Actions → New repository secret
```

**Secrets Comuns:**
- `BASIC_AUTH_PASSWORD` - Senha para Basic Auth
- `BEARER_TOKEN` - Token para Bearer Auth  
- `API_KEY` - Chave da API
- `TEST_USER` - Usuário de teste
- `TEST_PASSWORD` - Senha de teste

### 3. Executar Workflow
```
Actions → Performance Tests (Load & Stress) → Run workflow
```

## 🎯 Configurações de Teste

### Teste Básico (httpbin.org)
```
Test Type: load
Target Endpoint: https://httpbin.org  
Virtual Users: 5
Test Duration: 2m
Ramp Up Time: 30s
Authentication: none
```

### Teste com Autenticação
```
Test Type: load
Target Endpoint: https://sua-api.com
Virtual Users: 10
Test Duration: 5m
Ramp Up Time: 1m
Auth Type: bearer_token
Bearer Token Secret Name: BEARER_TOKEN
```

### Teste de Estresse
```
Test Type: stress
Target Endpoint: https://sua-api.com
Virtual Users: 20
Test Duration: 10m  
Ramp Up Time: 2m
RPS Rate: 50
Authentication: none
```

## 📊 URLs Importantes

### Repositório
```
https://github.com/SEU-USUARIO/SEU-REPO
```

### Actions (Workflows)
```
https://github.com/SEU-USUARIO/SEU-REPO/actions
```

### Relatórios Allure
```
https://SEU-USUARIO.github.io/SEU-REPO/allure-report/
```

### Settings
```
https://github.com/SEU-USUARIO/SEU-REPO/settings
```

## 🔍 Troubleshooting

### Push Rejeitado
```powershell
# Opção 1: Sync e retry
git pull origin main --allow-unrelated-histories
git push origin main

# Opção 2: Force push (cuidado!)
git push --force-with-lease origin main
```

### Workflow Não Aparece
```powershell
# Verificar arquivos
ls .github/workflows/
# Deve mostrar: performance-tests.yml, allure-report-action.yml

# Verificar syntax
cat .github/workflows/performance-tests.yml
```

### GitHub Pages 404
1. Repositório deve ser **público**
2. Aguardar até 10 minutos  
3. Verificar em Settings → Pages
4. URL: `https://username.github.io/repo-name/allure-report/`

### Teste Falha
1. Verificar endpoint está acessível
2. Conferir secrets estão configurados
3. Ver logs detalhados em Actions
4. Testar endpoint manualmente

## 📝 Exemplos de APIs para Teste

### APIs Públicas (Sem Auth)
```
https://httpbin.org         # HTTP testing service
https://jsonplaceholder.typicode.com  # Fake REST API
https://reqres.in          # Test REST API
https://dog.ceo/api        # Dog API
```

### Testes de Carga Típicos
```
VUsers: 1-10      → Teste funcional
VUsers: 10-50     → Teste de carga leve
VUsers: 50-200    → Teste de carga média
VUsers: 200-500   → Teste de carga pesada
VUsers: 500+      → Teste de estresse
```

## 🎯 Checklist Pós-Setup

- [ ] ✅ Repositório criado no GitHub
- [ ] ✅ Código enviado (push)
- [ ] ✅ GitHub Pages habilitado
- [ ] ✅ Secrets configurados (se necessário)
- [ ] ✅ Primeiro teste executado
- [ ] ✅ Relatório Allure funcionando
- [ ] ✅ URL do relatório acessível

---
**⚡ Guia de referência rápida para Performance Testing com k6 + GitHub Actions**
