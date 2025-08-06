# Documentação do Painel Administrativo

## Visão Geral

O painel administrativo do Hemera Onboard Flow é uma interface completa para gerenciamento de usuários, conteúdo e configurações do sistema. Esta documentação detalha a implementação atual e os próximos passos para completar o desenvolvimento.

## Estrutura Atual

### Arquivos Implementados

#### Páginas Principais
- `src/pages/admin/AdminDashboard.tsx` - Componente principal que integra AdminPanel e Dashboard
- `src/pages/admin/AdminPanel.tsx` - Layout e navegação do painel administrativo
- `src/pages/admin/AdminLogin.tsx` - Página de login específica para administradores
- `src/pages/admin/Dashboard.tsx` - Dashboard principal com estatísticas e métricas

#### Sistema de Design
- `src/lib/design-system/admin-dashboard-utils.ts` - Tokens e utilitários para o design system
- Tokens disponíveis:
  - `stats`: cardBackground, cardBorder, valueColor
  - `activities`: userColor, timeColor
  - `charts`: primaryColor, secondaryColor
  - `dashboard`: backgroundColor, textColor

### Navegação Implementada

O painel administrativo possui a seguinte estrutura de navegação:

#### Principal
- **Dashboard** (`/admin/dashboard`) ✅ Implementado
- **Usuários** (`/admin/users`) ❌ Pendente
- **Simulados** (`/admin/simulations`) ❌ Pendente
- **Vídeos** (`/admin/videos`) ❌ Pendente
- **Tarefas** (`/admin/assignments`) ❌ Pendente
- **Gamificação** (`/admin/gamification`) ❌ Pendente
- **Analytics** (`/admin/analytics`) ❌ Pendente

#### Sistema
- **CMS** (`/admin/cms`) ❌ Pendente
- **Notificações** (`/admin/notifications`) ❌ Pendente
- **Apresentação** (`/admin/presentation`) ❌ Pendente
- **Relatórios** (`/admin/reports`) ❌ Pendente
- **Certificados** (`/admin/certificates`) ❌ Pendente
- **Configurações** (`/admin/settings`) ❌ Pendente

#### Suporte
- **Tickets** (`/admin/support`) ❌ Pendente

## Componentes Disponíveis

### Componentes de Autenticação
- `AdminLoginForm.tsx` - Formulário de login administrativo

### Componentes de Gestão
- `AssignmentManager.tsx` - Gerenciamento de tarefas
- `BadgesAdmin.tsx` - Administração de badges
- `BrandingSettings.tsx` - Configurações de marca

### Componentes UI
- `button.tsx`, `table.tsx`, `card.tsx` - Componentes base da interface

## Hooks Disponíveis

- `useUsers.ts` - Gerenciamento de usuários
- `useAssignments.ts` - Gerenciamento de tarefas
- `useGamification.ts` - Sistema de gamificação
- `useNotifications.ts` - Sistema de notificações
- `useSimulados.ts` - Gerenciamento de simulados
- `useVideoCourses.ts` - Gerenciamento de cursos em vídeo
- `useEmailTemplates.ts` - Templates de email
- `useCSVImport.ts` - Importação de dados CSV

## Roteamento

### Rotas Implementadas
```typescript
// Em src/App.tsx
<Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
<Route path="/admin/dashboard" element={<AdminDashboard />} />
```

### Rotas Pendentes
Todas as demais rotas do menu de navegação precisam ser implementadas.

## Lista de Tarefas

### Prioridade Alta
1. **Criar páginas administrativas faltantes** (13 páginas)
   - Users, Simulations, Videos, Assignments, Gamification, Analytics
   - CMS, Notifications, Presentation, Reports, Certificates, Settings
   - Support

2. **Configurar roteamento completo**
   - Adicionar todas as rotas em `App.tsx`
   - Implementar proteção de rotas administrativas

3. **Integrar componentes existentes**
   - Conectar `AssignmentManager` à página de tarefas
   - Integrar `BadgesAdmin` à gamificação
   - Conectar hooks aos respectivos componentes

### Prioridade Média
4. **Implementar funcionalidades específicas**
   - CRUD completo para cada seção
   - Validações e tratamento de erros
   - Feedback visual para ações

5. **Melhorias UX/UI**
   - Responsividade completa
   - Loading states
   - Confirmações de ações

### Prioridade Baixa
6. **Recursos avançados**
   - Filtros e busca avançada
   - Exportação de dados
   - Logs de auditoria

## Estimativa de Desenvolvimento

- **Tempo estimado total**: 40-60 horas
- **Status atual**: Base implementada (~20% concluído)
- **Próximo passo**: Criação das páginas administrativas

## Como Contribuir

1. **Para adicionar uma nova página administrativa**:
   ```bash
   # Criar o arquivo da página
   touch src/pages/admin/[NomeDaPagina].tsx
   
   # Adicionar a rota em App.tsx
   # Implementar o componente usando o padrão existente
   ```

2. **Padrão de implementação**:
   - Usar o design system existente
   - Integrar hooks apropriados
   - Seguir a estrutura de layout do AdminPanel
   - Implementar tratamento de erros

## Tecnologias Utilizadas

- **React** + **TypeScript**
- **Tailwind CSS** para estilização
- **React Router** para navegação
- **Design System** customizado
- **Hooks customizados** para lógica de negócio

## Contato e Suporte

Para dúvidas sobre a implementação ou contribuições, consulte a documentação técnica do projeto ou entre em contato com a equipe de desenvolvimento.