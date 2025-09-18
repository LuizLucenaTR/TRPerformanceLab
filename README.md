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

## 🔐 Configuração de Variables (Para APIs com Autenticação)

### 1️⃣ **Como Adicionar Variables**
1. Vá para seu repositório no GitHub
2. Clique em **Settings** → **Secrets and variables** → **Actions**
3. Na seção **Variables**, clique **"New repository variable"**
4. Adicione o **Name** e **Value** conforme necessário

### 2️⃣ **Variables Necessárias**

| Nome da Variable | Descrição | Quando Usar |
|---|---|---|
| `BASIC_AUTH_USER` | Usuário para Basic Authentication | Quando `auth_type` = `basic_auth` |
| `BASIC_AUTH_PASS` | Senha para Basic Authentication | Quando `auth_type` = `basic_auth` |
| `BEARER_TOKEN` | Token para Bearer Authentication | Quando `auth_type` = `bearer_token` |

### 3️⃣ **Exemplo Passo a Passo - Basic Auth**

Para configurar Basic Authentication, você precisa criar **2 variables**:

#### **Variable 1 - Usuário:**
1. **Settings** → **Secrets and variables** → **Actions**
2. Na seção **Variables**, clique **"New repository variable"**
3. Preencher:
   - **Name**: `BASIC_AUTH_USER`
   - **Value**: `seu-usuario-aqui` (ex: `admin`, `testuser`)
4. **Add variable**

#### **Variable 2 - Senha:**
1. **New repository variable** (novamente)
2. Preencher:
   - **Name**: `BASIC_AUTH_PASS`
   - **Value**: `sua-senha-aqui` (ex: `minhaSenha123!`)
3. **Add variable**

### 4️⃣ **Exemplo Passo a Passo - Bearer Token**

1. **Settings** → **Secrets and variables** → **Actions**
2. Na seção **Variables**, clique **"New repository variable"**
3. Preencher:
   - **Name**: `BEARER_TOKEN`
   - **Value**: `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...` (seu token)
4. **Add variable**

### 5️⃣ **Resumo por Tipo de Autenticação**

| Tipo de Auth | Variables Necessárias | Observações |
|---|---|---|
| **none** | Nenhuma | Para APIs públicas |
| **basic_auth** | `BASIC_AUTH_USER` e `BASIC_AUTH_PASS` | Ambas são obrigatórias |
| **bearer_token** | `BEARER_TOKEN` | Token JWT ou similar |

**⚠️ IMPORTANTE:** Para qualquer tipo de autenticação, você **DEVE** criar as variables correspondentes. O workflow usa automaticamente esses nomes fixos - não é mais possível inserir credenciais como parâmetros no workflow.

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

⚠️  Certifique-se de configurar as variables:
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

⚠️  Certifique-se de configurar a variable:
- BEARER_TOKEN (seu token JWT/API)
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

## 🔍 Troubleshooting

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

- [ ] ✅ Secrets configurados (se necessário)
- [ ] ✅ Primeiro teste executado com sucesso
- [ ] ✅ Relatório Allure acessível
- [ ] ✅ URL dos relatórios funcionando
- [ ] ✅ Pipeline executando sem erros
