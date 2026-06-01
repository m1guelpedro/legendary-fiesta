# Implementação de Histórico Global do Sistema (Audit Log) - FinControl

## Resumo Executivo

Foi implementado um sistema completo de auditoria e histórico de atividades que registra todas as ações realizadas pelos usuários no FinControl. O sistema funciona como trilha de auditoria centralizada, permitindo que usuários visualizem o histórico completo de suas ações de forma cronológica e organizada.

---

## Arquitetura do Sistema de Auditoria

### 1. Camada de Dados

#### Tabela: `historico_atividades`
Nova tabela PostgreSQL com seguinte estrutura:
- `id` (SERIAL PRIMARY KEY)
- `usuario_id` (FOREIGN KEY → usuario.id)
- `tipo_evento` (VARCHAR 50) - CRIADO, EDITADO, DELETADO, LOGIN, LOGOUT, EXECUTADO
- `categoria` (VARCHAR 50) - AUTH, RECEITA, DESPESA, DIVIDA, SIMULACAO
- `descricao` (TEXT) - Descrição amigável em linguagem natural
- `entidade` (VARCHAR 50) - Nome da tabela afetada (despesas, ganhos, dividas, etc)
- `entidade_id` (INTEGER) - ID do registro afetado
- `dados_anteriores` (JSONB) - Snapshot dos dados antes da alteração
- `dados_novos` (JSONB) - Snapshot dos dados após a alteração
- `metadata` (JSONB) - Metadados adicionais (IP, user-agent, etc)
- `created_at` (TIMESTAMP) - Timestamp automático

#### Índices Criados:
- `idx_historico_usuario_id` - Busca rápida por usuário
- `idx_historico_created_at` - Ordenação por data
- `idx_historico_categoria` - Filtro por categoria
- `idx_historico_tipo_evento` - Filtro por tipo de evento
- `idx_historico_usuario_created` - Combinação usuario + data (mais comum)
- `idx_historico_entidade` - Filtro por entidade

### 2. Camada de Lógica (Utilidade Centralizada)

#### Arquivo: `backend/src/utils/auditLog.js`

**Funções Exportadas:**

1. **`registrarHistorico(params)`**
   - Função principal para registrar eventos
   - Aceita: usuarioId, categoria, tipoEvento, descricao, entidade, entidadeId, dadosAnteriores, dadosNovos, metadata
   - Não lança erro se falhar (para não interromper operação principal)
   - Retorna: registro inserido ou null

2. **`obterHistorico(usuarioId, filters)`**
   - Lista eventos com paginação e filtros
   - Filtros: page, limit, categoria, tipoEvento, dataInicio, dataFim, busca
   - Retorna: { eventos, page, limit, total, pages }

3. **`obterEventoHistorico(eventoId, usuarioId)`**
   - Obtém detalhes de um evento específico
   - Verifica segurança (usuarioId)
   - Retorna: evento ou null

4. **`obterResumoAtividades(usuarioId)`**
   - Retorna contadores de atividades por categoria e tipo
   - Útil para widgets no dashboard
   - Retorna: { [categoria]: { [tipo]: count, ... }, ... }

5. **`obterUltimaAtividade(usuarioId)`**
   - Retorna a última atividade registrada
   - Útil para widget no dashboard
   - Retorna: evento ou null

### 3. Integração nos Controllers

#### AuthController (`backend/src/controller/authController.js`)
Registra eventos em:
- **Registrar usuário** (CRIADO)
  - Categoria: AUTH
  - Tipo: CRIADO
  - Salva: nome e email do novo usuário
  
- **Login** (LOGIN)
  - Categoria: AUTH
  - Tipo: LOGIN
  - Metadados: email do usuário
  
- **Logout** (LOGOUT)
  - Categoria: AUTH
  - Tipo: LOGOUT
  - Sem dados adicionais

#### ExpenseController (`backend/src/controller/expenseController.js`)
Registra eventos em:
- **Criar despesa** (CRIADO)
  - Categoria: DESPESA
  - Tipo: CRIADO
  - Salva: dados novos da despesa
  
- **Atualizar despesa** (EDITADO)
  - Categoria: DESPESA
  - Tipo: EDITADO
  - Salva: dados antes e depois
  
- **Deletar despesa** (DELETADO)
  - Categoria: DESPESA
  - Tipo: DELETADO
  - Salva: dados deletados

#### IncomeController (`backend/src/controller/incomeController.js`)
Registra eventos em:
- **Criar receita** (CRIADO)
  - Categoria: RECEITA
  - Tipo: CRIADO
  
- **Atualizar receita** (EDITADO)
  - Categoria: RECEITA
  - Tipo: EDITADO
  
- **Deletar receita** (DELETADO)
  - Categoria: RECEITA
  - Tipo: DELETADO

#### DebtController (`backend/src/controller/debtController.js`)
Registra eventos em:
- **Criar dívida** (CRIADO)
  - Categoria: DIVIDA
  - Tipo: CRIADO
  
- **Atualizar dívida** (EDITADO)
  - Categoria: DIVIDA
  - Tipo: EDITADO
  
- **Deletar dívida** (DELETADO)
  - Categoria: DIVIDA
  - Tipo: DELETADO

#### SimulationController (`backend/src/controller/simulationController.js`)
Registra eventos em:
- **Executar simulação** (EXECUTADO)
  - Categoria: SIMULACAO
  - Tipo: EXECUTADO
  - Metadados: número de receitas, despesas, dívidas

### 4. Camada de Rotas (Backend)

#### Arquivo: `backend/src/routes/historyRoutes.js`

**Endpoints Implementados:**

1. **GET `/api/historico`** (protegido)
   - Lista eventos do usuário autenticado
   - Query params: page, limit, categoria, tipoEvento, dataInicio, dataFim, busca
   - Resposta: { eventos: [...], page, limit, total, pages }

2. **GET `/api/historico/:id`** (protegido)
   - Obtém detalhes de um evento específico
   - Validação de segurança (apenas proprietário visualiza)
   - Resposta: { evento }

3. **GET `/api/historico/resumo/atividades`** (protegido)
   - Retorna contadores por categoria para widgets
   - Resposta: { resumo: {...} }

4. **GET `/api/historico/ultima/atividade`** (protegido)
   - Última atividade para widget "Última Atividade"
   - Resposta: { ultimaAtividade }

---

## Frontend - Componentes Criados

### Services

#### Arquivo: `frontend/src/services/historyService.js`
- `list(filters)` - Lista eventos com filtros
- `getById(id)` - Detalhes de um evento
- `getResumo()` - Resumo de atividades
- `getUltima()` - Última atividade

### Hooks

#### Arquivo: `frontend/src/hooks/useHistory.js`
- Gerencia estado de eventos, paginação e filtros
- Integra automaticamente com serviço
- Exports: eventos, loading, error, page, limit, total, pages, setLimit, applyFilters, goToPage, refresh

#### Arquivo: `frontend/src/hooks/useActivitySummary.js`
- Carrega resumo de atividades para dashboard
- Exports: resumo, ultimaAtividade, loading, error, refresh

### Pages

#### Arquivo: `frontend/src/pages/HistoricoAtividades/HistoricoAtividades.jsx`
Página completa com:
- **Filtros**: categoria, tipo de evento, busca por texto
- **Timeline visual**: cards de atividades com ícones coloridos
- **Paginação**: navegação entre páginas
- **Modal detalhes**: exibe antes/depois de alterações em JSON
- **Responsividade**: layout adaptável para mobile

### Estilos

#### Arquivo: `frontend/src/styles/history.css`
Estilos completos para:
- Cards de atividades
- Filtros e busca
- Timeline
- Badges de status
- Widgets no dashboard
- Modais
- Paginação

### Integração no Dashboard

#### Arquivo: `frontend/src/pages/Dashboard/Dashboard.jsx` (atualizado)
Adicionados widgets:
- **Total de Atividades**: contador global
- **Receitas Criadas**: contador específico
- **Despesas Criadas**: contador específico
- **Dívidas Criadas**: contador específico
- **Última Atividade**: mostra ação mais recente com timestamp

### Rotas

#### Arquivo: `frontend/src/routes/AppRoutes.jsx` (atualizado)
Nova rota criada:
- `/atividades` → HistoricoAtividades (página de histórico completo)

---

## Arquivos Modificados (Resumo)

### Backend
- `backend/sql/init.sql` - Adicionada tabela `historico_atividades` com índices
- `backend/src/controller/authController.js` - Integração com auditoria
- `backend/src/controller/expenseController.js` - Integração com auditoria
- `backend/src/controller/incomeController.js` - Integração com auditoria
- `backend/src/controller/debtController.js` - Integração com auditoria
- `backend/src/controller/simulationController.js` - Integração com auditoria
- `backend/src/index.js` - Registro de nova rota
- **NOVO**: `backend/src/utils/auditLog.js` - Utilidade centralizada
- **NOVO**: `backend/src/routes/historyRoutes.js` - Rotas de histórico

### Frontend
- `frontend/src/routes/AppRoutes.jsx` - Nova rota `/atividades`
- `frontend/src/pages/Dashboard/Dashboard.jsx` - Widgets de atividades
- **NOVO**: `frontend/src/services/historyService.js` - Serviço de API
- **NOVO**: `frontend/src/hooks/useHistory.js` - Hook para histórico
- **NOVO**: `frontend/src/hooks/useActivitySummary.js` - Hook para resumo
- **NOVO**: `frontend/src/pages/HistoricoAtividades/HistoricoAtividades.jsx` - Página completa
- **NOVO**: `frontend/src/styles/history.css` - Estilos

---

## Como Usar em Novos Módulos

### Registrar um evento de auditoria em um novo controller:

```javascript
import { registrarHistorico } from '../utils/auditLog.js';

// Em qualquer função após operação bem-sucedida:
await registrarHistorico({
  usuarioId: usuario_id,
  categoria: 'MINHA_CATEGORIA', // AUTH, RECEITA, DESPESA, DIVIDA, SIMULACAO
  tipoEvento: 'MEU_TIPO', // CRIADO, EDITADO, DELETADO, etc
  descricao: 'Descrição amigável em linguagem natural',
  entidade: 'tabela_afetada', // opcional
  entidadeId: id, // opcional
  dadosAnteriores: objetoAntes, // opcional
  dadosNovos: objetoDepois, // opcional
  metadata: { /* dados adicionais */ }, // opcional
});
```

### Exemplo real (já implementado):
```javascript
// Em expenseController.js - createExpense
const despesa = result.rows[0];

await registrarHistorico({
  usuarioId: usuario_id,
  categoria: 'DESPESA',
  tipoEvento: 'CRIADO',
  descricao: `Despesa criada: ${descricao} - R$ ${valor}`,
  entidade: 'despesas',
  entidadeId: despesa.id,
  dadosNovos: despesa,
});
```

---

## Segurança

### Validações Implementadas

1. **Autenticação**: Todos os endpoints de histórico requerem token JWT
2. **Autorização**: Usuário só visualiza seu próprio histórico (validado em `obterHistorico`)
3. **Validações adicionais**:
   - Valores numéricos (valor > 0)
   - Datas válidas e consistentes (data_fim >= data_inicio)
   - Campos obrigatórios
4. **Dados**: Histórico completo preservado (dados antes/depois)

---

## Performance

### Índices Otimizados
- Consultas por usuário + data: `idx_historico_usuario_created`
- Filtros por categoria: `idx_historico_categoria`
- Ordenação por data: `idx_historico_created_at`

### Paginação
- Padrão 20 itens por página (máx 100)
- Offset-based pagination para escalabilidade

---

## Casos de Uso

### 1. Auditoria Completa
Visualizar todas as ações de uma conta em ordem cronológica.

### 2. Rastreamento de Alterações
Comparar dados antes/depois de edições (útil para debugging).

### 3. Monitoramento de Atividade
Dashboard mostra atividades recentes e contadores por categoria.

### 4. Conformidade
Relatório de auditoria para fins regulatórios/legais.

### 5. Investigação de Problemas
Identificar quando/como dados foram criados/alterados.

---

## Próximas Melhorias Sugeridas

1. **Exportação de Relatórios**
   - CSV/PDF com filtros personalizados
   
2. **Alertas em Tempo Real**
   - Notificação de atividades suspeitas
   
3. **Soft Deletes**
   - Marcar dadas como deletados sem perder histórico
   
4. **Assinatura de Auditoria**
   - Hash/signature para garantir integridade
   
5. **Retenção de Dados**
   - Política de limpeza automática de histórico antigo
   
6. **Busca Avançada**
   - Filtro por intervalo de valores, padrões de texto
   
7. **Webhooks**
   - Notificar sistemas externos sobre eventos

---

## Migração do Banco de Dados

Se já possui banco em produção, execute:

```sql
-- Criar tabela
CREATE TABLE IF NOT EXISTS historico_atividades (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  tipo_evento VARCHAR(50) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  descricao TEXT NOT NULL,
  entidade VARCHAR(50),
  entidade_id INTEGER,
  dados_anteriores JSONB,
  dados_novos JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Criar índices
CREATE INDEX idx_historico_usuario_id ON historico_atividades(usuario_id);
CREATE INDEX idx_historico_created_at ON historico_atividades(created_at DESC);
CREATE INDEX idx_historico_categoria ON historico_atividades(categoria);
CREATE INDEX idx_historico_tipo_evento ON historico_atividades(tipo_evento);
CREATE INDEX idx_historico_usuario_created ON historico_atividades(usuario_id, created_at DESC);
CREATE INDEX idx_historico_entidade ON historico_atividades(entidade, entidade_id);
```

---

## Testes Recomendados

1. Criar receita/despesa/dívida e verificar histórico
2. Editar e comparar dados antes/depois
3. Deletar e verificar registro preservado
4. Login/logout e verificar eventos AUTH
5. Executar simulação e verificar evento SIMULACAO
6. Filtrar por categoria/tipo/data
7. Verificar segurança (usuário não visualiza histórico de outro)

---

## Conclusão

Sistema completo de auditoria implementado com:
- ✅ Registro automático em 5 categorias
- ✅ UI intuitiva com timeline e filtros
- ✅ Dashboard com widgets informativos
- ✅ Segurança integrada
- ✅ Performance otimizada com índices
- ✅ Extensível para novos módulos
- ✅ Dados completos (antes/depois)

O sistema está pronto para produção e pode ser facilmente estendido conforme novos requisitos surgirem.
