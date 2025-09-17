# 🚀 TRPerformanceLab

Pipeline de CI/CD completo para **Testes de Performance** usando **k6** e **GitHub Actions**.

## 📊 Funcionalidades

- ✅ **Load Testing**: Testes de carga simulando usuários reais
- ✅ **Stress Testing**: Testes de estresse para encontrar limites do sistema  
- ✅ **Relatórios Allure**: Relatórios detalhados e visuais automatizados
- ✅ **GitHub Actions**: Pipeline CI/CD totalmente automatizado
- ✅ **Autenticação Flexível**: Suporte para Basic Auth e Bearer Token
- ✅ **Configuração via Interface**: Sem necessidade de editar código

## 🏗️ Estrutura do Projeto

```
.github/workflows/
├── performance-tests.yml        # Workflow principal do GitHub Actions
└── allure-report-action.yml     # Workflow para geração de relatórios Allure

tests/performance/
├── load_test_scenario.js        # Script k6 para testes de carga
└── stress_test_scenario.js      # Script k6 para testes de estresse
```

---

## 🚀 Setup Inicial do Repositório

### 1️⃣ **Criar Repositório no GitHub**

1. Acesse [github.com](https://github.com) e faça login
2. Clique em **"New repository"** ou no botão **"+"**
3. Configure:
   - **Repository name**: `TRPerformanceLab` (ou nome desejado)
   - **Description**: `CI/CD Pipeline for Load and Stress Testing with k6 and GitHub Actions`
   - ✅ Marque **Public** (necessário para GitHub Pages gratuito)
   - ❌ **NÃO** marque "Add a README file"
   - ❌ **NÃO** adicione .gitignore ou license
4. Clique **"Create repository"**

### 2️⃣ **Configurar Git Local**

```powershell
# Navegar para o diretório do projeto
cd C:\GitHub\TRPerformanceLab

# Inicializar Git (se não foi feito)
git init

# Configurar usuário (substitua pelos seus dados)
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@exemplo.com"

# Adicionar repositório remoto (SUBSTITUA SEU-USUARIO)
git remote add origin https://github.com/SEU-USUARIO/TRPerformanceLab.git
```

### 3️⃣ **Fazer Upload dos Arquivos**

```powershell
# Criar branch main
git checkout -b main

# Adicionar todos os arquivos
git add .

# Fazer commit inicial
git commit -m "feat: Initial setup - Performance testing pipeline with k6 and GitHub Actions"

# Enviar para GitHub
git push -u origin main
```

### 🔧 **Solução de Problemas no Setup**

Se o comando `git push` falhar com erro **"src refspec main does not match any"**:

```powershell
# 1. Verificar e corrigir remote
git remote -v
git remote remove origin
git remote add origin https://github.com/SEU-USUARIO/TRPerformanceLab.git

# 2. Garantir branch main existe
git checkout -b main
git add .
git commit -m "Initial setup"

# 3. Push forçado se necessário
git branch -M main
git push -u origin main
```

---

## ⚙️ Configuração do GitHub Pages

### 1️⃣ **Habilitar GitHub Pages**
1. No seu repositório, clique em **Settings**
2. No menu lateral, clique em **Pages**
3. Em **Source**, selecione **"GitHub Actions"**
4. Clique **Save**

### 2️⃣ **URL dos Relatórios**
Após configurado, os relatórios ficarão disponíveis em:
```
https://SEU-USUARIO.github.io/SEU-REPOSITORIO/allure-report/
```

---

## 🔐 Configuração de Secrets (Para APIs com Autenticação)

### 1️⃣ **Como Adicionar Secrets**
1. Vá para seu repositório no GitHub
2. Clique em **Settings** → **Secrets and variables** → **Actions**
3. Clique **"New repository secret"**
4. Adicione o **Name** e **Secret** conforme necessário

### 2️⃣ **Secrets Recomendados**

| Nome do Secret | Descrição | Quando Usar |
|---|---|---|
| `BASIC_AUTH_USER` | Usuário para Basic Authentication | Quando `auth_type` = `basic_auth` |
| `BASIC_AUTH_PASS` | Senha para Basic Authentication | Quando `auth_type` = `basic_auth` |
| `BEARER_TOKEN` | Token para Bearer Authentication | Quando `auth_type` = `bearer_token` |
| `API_TEST_TOKEN` | Token específico da API de teste | Para APIs customizadas |

### 3️⃣ **Exemplo Passo a Passo - Basic Auth**

Para configurar Basic Authentication, você precisa criar **2 secrets**:

#### **Secret 1 - Usuário:**
1. **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**
3. Preencher:
   - **Name**: `BASIC_AUTH_USER`
   - **Secret**: `seu-usuario-aqui` (ex: `admin`, `testuser`)
4. **Add secret**

#### **Secret 2 - Senha:**
1. **New repository secret** (novamente)
2. Preencher:
   - **Name**: `BASIC_AUTH_PASS`
   - **Secret**: `sua-senha-aqui` (ex: `minhaSenha123!`)
3. **Add secret**

### 4️⃣ **Exemplo Passo a Passo - Bearer Token**

1. **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**
3. Preencher:
   - **Name**: `BEARER_TOKEN`
   - **Secret**: `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...` (seu token)
4. **Add secret**

### 5️⃣ **Resumo por Tipo de Autenticação**

| Tipo de Auth | Secrets Necessários | Observações |
|---|---|---|
| **none** | Nenhum | Para APIs públicas |
| **basic_auth** | `BASIC_AUTH_USER` e `BASIC_AUTH_PASS` | Ambos são obrigatórios |
| **bearer_token** | `BEARER_TOKEN` | Token JWT ou similar |

**⚠️ IMPORTANTE:** Para Basic Auth, você **DEVE** criar os dois secrets. O workflow usa automaticamente esses nomes fixos - não é mais possível inserir usuário/senha como parâmetros no workflow.

---

## 🎯 Executando Testes

### 1️⃣ **Acessar o Workflow**
1. No repositório, clique na aba **Actions**
2. Selecione **"Performance Tests (Load & Stress)"**
3. Clique **"Run workflow"**

### 2️⃣ **Configurar Parâmetros**

| Parâmetro | Descrição | Exemplo | Obrigatório |
|---|---|---|---|
| **Test Type** | Tipo do teste | `load` ou `stress` | ✅ |
| **Target Endpoint** | URL base da API | `https://api.exemplo.com` | ✅ |
| **Virtual Users** | Usuários simultâneos | `10` | ✅ |
| **Test Duration** | Duração do teste | `5m` | ✅ |
| **Ramp Up Time** | Tempo para atingir máx VUs | `1m` | ✅ |
| **RPS Rate** | Requisições por segundo | `50` | ❌ |
| **Auth Type** | Tipo de autenticação | `none`, `basic_auth`, `bearer_token` | ✅ |
| **Bearer Token Secret** | Nome do secret do token | `BEARER_TOKEN` | ❌ |

### 3️⃣ **Exemplos de Configuração**

#### **Teste Básico (Sem Autenticação)**
```
Test Type: load
Target Endpoint: https://httpbin.org
Virtual Users: 5
Test Duration: 2m
Ramp Up Time: 30s
RPS Rate: (deixar vazio)
Auth Type: none
```

#### **Teste com Basic Auth**
```
Test Type: load
Target Endpoint: https://sua-api.com
Virtual Users: 10
Test Duration: 5m
Ramp Up Time: 1m
Auth Type: basic_auth

⚠️  Certifique-se de configurar os secrets:
- BASIC_AUTH_USER (usuário)
- BASIC_AUTH_PASS (senha)
```

#### **Teste com Bearer Token**
```
Test Type: stress
Target Endpoint: https://api.exemplo.com
Virtual Users: 20
Test Duration: 10m
Ramp Up Time: 2m
RPS Rate: 100
Auth Type: bearer_token
Bearer Token Secret Name: BEARER_TOKEN
```

---

## 📊 Interpretando Resultados

### 1️⃣ **Acessar Relatórios**
- **Durante execução**: Acompanhe logs em tempo real na aba Actions
- **Após execução**: Acesse o relatório Allure em `https://seu-usuario.github.io/seu-repo/allure-report/`

### 2️⃣ **Métricas Principais**

| Métrica | Descrição | Ideal |
|---|---|---|
| **Response Time (avg)** | Tempo médio de resposta | < 500ms (load), < 2s (stress) |
| **Response Time (p95)** | 95% das requests abaixo de | < 1s (load), < 5s (stress) |
| **Error Rate** | Porcentagem de erros | < 1% (load), < 10% (stress) |
| **Throughput** | Requisições por segundo | Dependente do objetivo |
| **Virtual Users** | Usuários simultâneos ativos | Conforme configurado |

### 3️⃣ **Interpretação por Tipo de Teste**

#### **Load Testing**
- ✅ **Objetivo**: Validar performance sob carga esperada
- ✅ **Sucesso**: Baixa taxa de erro + tempos de resposta aceitáveis
- ⚠️ **Atenção**: Error rate > 1% ou response time > 1s

#### **Stress Testing**  
- ✅ **Objetivo**: Encontrar limite de capacidade do sistema
- ✅ **Sucesso**: Sistema degrada gracefully sem crashes
- ⚠️ **Atenção**: Sistema para de responder completamente

---

## 🔧 Limpeza e Manutenção do Repositório

### 1️⃣ **Remover Arquivos Desnecessários (Se Existirem)**

Se você tiver arquivos de setup antigos na raiz, remova-os:

```powershell
# Verificar arquivos na raiz
dir

# Remover arquivos de setup (se existirem)
git rm setup-github.ps1 2>$null
git rm setup-github.bat 2>$null  
git rm fix-git-push.bat 2>$null
git rm SETUP-GITHUB.md 2>$null
git rm COMANDOS-RAPIDOS.md 2>$null

# Commit das remoções
git add .
git commit -m "chore: Remove setup files from root - all instructions now in README"
git push origin main
```

### 2️⃣ **Estrutura Limpa Final**

Após limpeza, seu repositório deve ter apenas:
```
.github/workflows/          # Workflows do GitHub Actions
tests/performance/          # Scripts k6
.gitignore                  # Arquivos ignorados
README.md                   # Este arquivo com todas as instruções
```

---

## 🔍 Troubleshooting

### ❌ **Workflow não aparece**
- Verifique se arquivos estão em `.github/workflows/`
- Confirme se o push foi realizado com sucesso
- Aguarde alguns minutos após o push

### ❌ **Teste falha**
1. Verifique se o endpoint está acessível
2. Confirme se os secrets estão configurados corretamente
3. Veja logs detalhados na aba Actions
4. Teste o endpoint manualmente primeiro

### ❌ **Relatório não aparece**
1. Confirme se GitHub Pages está habilitado
2. Aguarde até 10 minutos após execução
3. Verifique se repositório é público
4. URL correta: `https://usuario.github.io/repositorio/allure-report/`

### ❌ **Erro de autenticação**
1. Verifique se o secret existe e tem o nome correto
2. Confirme se o valor do secret está correto
3. Teste credenciais manualmente (curl, Postman)

---

## 🎯 Exemplos de APIs para Teste

### **APIs Públicas (Sem Autenticação)**
- `https://httpbin.org` - Serviço de teste HTTP
- `https://jsonplaceholder.typicode.com` - API REST fake
- `https://reqres.in` - API de teste
- `https://dog.ceo/api` - Dog API

### **Cenários de Teste Recomendados**

| VUsers | Tipo | Descrição |
|---|---|---|
| 1-5 | Funcional | Teste básico de funcionamento |
| 10-20 | Carga Leve | Simulação de uso normal |
| 50-100 | Carga Média | Pico de uso esperado |
| 200-500 | Carga Pesada | Máxima capacidade esperada |
| 500+ | Estresse | Teste de limites e breaking points |

---

## 📋 Checklist Pós-Setup

- [ ] ✅ Repositório criado no GitHub
- [ ] ✅ Código enviado via git push
- [ ] ✅ GitHub Pages habilitado (Settings → Pages)
- [ ] ✅ Secrets configurados (se necessário)
- [ ] ✅ Primeiro teste executado com sucesso
- [ ] ✅ Relatório Allure acessível
- [ ] ✅ URL dos relatórios funcionando
- [ ] ✅ Pipeline executando sem erros

---

## 🚀 Próximos Passos

### **Melhorias Sugeridas**
- [ ] Configurar alertas para falhas de performance
- [ ] Integrar com ferramentas de monitoring (Grafana, DataDog)
- [ ] Automatizar execução via schedule (cron)
- [ ] Personalizar thresholds para sua API específica
- [ ] Adicionar mais cenários de teste personalizados
- [ ] Configurar notificações via Slack/Teams

### **Automação Avançada**
- [ ] Webhook para execução automática após deploys
- [ ] Integração com pipeline de CI/CD existente
- [ ] Testes regressivos automatizados
- [ ] Comparação de performance entre versões

---

**🎉 Seu pipeline de performance testing está pronto para produção!**

*Criado com ❤️ usando k6 e GitHub Actions*