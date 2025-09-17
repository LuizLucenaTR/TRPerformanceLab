# 🚀 TRPerformanceLab

Pipeline de CI/CD para Testes de Performance usando k6 e GitHub Actions.

## 📊 Funcionalidades

- **Load Testing**: Testes de carga simulando usuários reais
- **Stress Testing**: Testes de estresse para encontrar limites do sistema  
- **Relatórios Allure**: Relatórios detalhados e visuais
- **GitHub Actions**: Pipeline automatizado
- **Autenticação Flexível**: Suporte para Basic Auth e Bearer Token

## 🚀 Setup Rápido

### Configuração Automática
```powershell
# PowerShell (Recomendado)
.\setup-github.ps1 -GitHubUsername "seu-usuario"

# CMD/Batch  
setup-github.bat seu-usuario
```

### Documentação Completa
- **[SETUP-GITHUB.md](SETUP-GITHUB.md)** - Guia passo a passo completo
- **[COMANDOS-RAPIDOS.md](COMANDOS-RAPIDOS.md)** - Comandos e referência rápida

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
**https://SEU-USUARIO.github.io/SEU-REPO/allure-report/**

## 🔧 Configuração de Secrets

### Para APIs com Autenticação

**Basic Auth:**
- `BASIC_AUTH_PASSWORD` - Senha para autenticação básica

**Bearer Token:**
- `BEARER_TOKEN` - Token de autorização

### Como Adicionar Secrets:
1. Vá para **Settings** → **Secrets and variables** → **Actions**
2. Clique em **New repository secret**
3. Adicione o nome e valor do secret

## 📋 Estrutura do Projeto

```
.github/workflows/
├── performance-tests.yml        # Workflow principal
└── allure-report-action.yml     # Workflow para relatórios

tests/performance/
├── load_test_scenario.js        # Script de teste de carga
└── stress_test_scenario.js      # Script de teste de estresse

# Scripts de configuração
├── setup-github.ps1             # Setup PowerShell
├── setup-github.bat             # Setup Batch/CMD
├── SETUP-GITHUB.md              # Guia completo
└── COMANDOS-RAPIDOS.md          # Referência rápida
```

## 🎯 Exemplos de Uso

### Teste de Carga Básico
```
Test Type: load
Target: https://httpbin.org
VUsers: 10
Duration: 5m
Auth: none
```

### Teste de Estresse API REST
```
Test Type: stress
Target: https://sua-api.com
VUsers: 50
Duration: 10m
Auth: bearer_token
```

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
3. Veja os logs na aba **Actions**

### Relatório Não Aparece
1. Verifique se **GitHub Pages** está habilitado
2. Aguarde alguns minutos após a execução
3. Confirme se o repositório é **público**

### Setup Issues
- Execute os scripts na raiz do projeto
- Verifique se o Git está instalado e configurado
- Confirme se tem permissões no repositório GitHub

## 🚀 Próximos Passos

- [ ] Configure alertas para falhas
- [ ] Integre com monitoring (Grafana, DataDog)
- [ ] Automatize execução via schedule
- [ ] Customize thresholds para sua API
- [ ] Adicione mais cenários de teste

## 📞 Comandos Úteis

```powershell
# Verificar status
git status

# Sincronizar
git pull origin main
git push origin main

# Ver workflows
gh workflow list    # (GitHub CLI)
```

---

**Criado com ❤️ usando k6 e GitHub Actions**
