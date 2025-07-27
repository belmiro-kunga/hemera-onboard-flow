# Implementation Plan

## Fase 1: Consolidação de Utilitários Base ✅

- [x] 1.1 Criar arquivo de padrões comuns
  - Implementar `src/lib/common-patterns.ts` com hooks e funções base
  - Definir interfaces TypeScript para consistência
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 1.2 Criar hook base comum para outros hooks
  - Implementar `src/hooks/useCommonHook.ts` com funcionalidades compartilhadas
  - Consolidar padrões de queryClient e toast
  - _Requirements: 3.1, 3.2_

- [x] 1.3 Implementar funções de tratamento de erro/sucesso
  - Criar `handleError()` e `handleSuccess()` centralizadas
  - Padronizar mensagens e comportamentos de toast
  - _Requirements: 1.3, 2.4_

## Fase 2: Refatoração de Admin Pages ✅

- [x] 2.1 Refatorar VideoLibrary.tsx
  - Substituir estados duplicados por `useSearchAndFilter()`
  - Implementar queries comuns e filtros padronizados
  - Adicionar loading states consistentes
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 2.2 Refatorar UserManagement.tsx
  - Aplicar padrões comuns de busca e filtro
  - Implementar tratamento de erro/sucesso padronizado
  - Manter funcionalidade existente intacta
  - _Requirements: 2.1, 2.2, 2.4_

- [x] 2.3 Refatorar CertificatesAdmin.tsx
  - Consolidar lógica de busca com `createSearchFilter()`
  - Padronizar tratamento de downloads e erros
  - Otimizar queries e filtros
  - _Requirements: 2.1, 2.4_

- [x] 2.4 Refatorar SimuladosAdmin.tsx
  - Aplicar hooks comuns para estados
  - Implementar tratamento padronizado de CRUD operations
  - Manter funcionalidades específicas do simulado
  - _Requirements: 2.1, 2.2, 2.4_

## Fase 3: Refatoração de Hooks Personalizados 🔄

- [x] 3.1 Refatorar useAssignments.ts
  - Substituir padrões duplicados por `useCommonHook()`
  - Consolidar lógica de invalidação de queries
  - Padronizar tratamento de mutations
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 3.2 Refatorar useUsers.ts
  - Aplicar padrão `useCommonHook()` para eliminar duplicação
  - Consolidar lógica de CRUD de usuários
  - Implementar tratamento padronizado de erros
  - _Requirements: 3.1, 3.2, 3.4_

- [ ] 3.3 Refatorar useEmailTemplates.ts
  - Substituir queryClient e toast por utilitários comuns
  - Padronizar mutations de templates de email
  - Consolidar validações e tratamento de erros
  - _Requirements: 3.1, 3.2, 3.4_

- [ ] 3.4 Refatorar useNotifications.ts
  - Aplicar padrões comuns de hook base
  - Consolidar lógica de notificações
  - Implementar invalidação inteligente de queries
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 3.5 Refatorar useCompanyPresentation.ts
  - Eliminar duplicação com `useCommonHook()`
  - Padronizar mutations de apresentação da empresa
  - Consolidar tratamento de uploads e erros
  - _Requirements: 3.1, 3.2, 3.4_

- [ ] 3.6 Refatorar useAssignmentTemplates.ts
  - Aplicar padrões consolidados de hook base
  - Eliminar duplicação de lógica de templates
  - Implementar tratamento consistente de CRUD
  - _Requirements: 3.1, 3.2, 3.4_

## Fase 4: Refatoração de Admin Pages Restantes

- [ ] 4.1 Refatorar VideoCoursesAdmin.tsx
  - Aplicar todos os padrões comuns estabelecidos
  - Consolidar lógica de gerenciamento de cursos
  - Implementar loading e error states padronizados
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 4.2 Refatorar AdminDashboard.tsx
  - Consolidar widgets e métricas com padrões comuns
  - Implementar queries otimizadas para dashboard
  - Padronizar layout e componentes de estatísticas
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 4.3 Refatorar AdminLayout.tsx
  - Consolidar lógica de layout e navegação
  - Implementar tratamento padronizado de autenticação
  - Otimizar re-renders e performance
  - _Requirements: 2.1, 2.3_

- [ ] 4.4 Refatorar AdminLogin.tsx
  - Padronizar lógica de autenticação
  - Consolidar validações e tratamento de erros
  - Implementar loading states consistentes
  - _Requirements: 2.1, 2.4_

## Fase 5: Consolidação de Componentes de Assignment

- [ ] 5.1 Refatorar AssignmentManager.tsx
  - Consolidar lógica de gerenciamento de atribuições
  - Aplicar padrões comuns de formulários e validações
  - Implementar queries otimizadas
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 5.2 Refatorar AssignmentReports.tsx
  - Consolidar lógica de relatórios e filtros
  - Implementar componentes de gráficos reutilizáveis
  - Padronizar exportação de dados
  - _Requirements: 4.1, 4.2_

- [ ] 5.3 Refatorar BulkAssignmentTool.tsx
  - Consolidar lógica de atribuições em massa
  - Implementar validações padronizadas
  - Otimizar performance para grandes volumes
  - _Requirements: 4.1, 4.3_

- [ ] 5.4 Refatorar CSVImportTool.tsx
  - Consolidar lógica de importação de CSV
  - Implementar validações e tratamento de erros padronizados
  - Criar componente reutilizável de upload
  - _Requirements: 4.1, 4.2, 4.3_

## Fase 6: Consolidação de Componentes CMS

- [ ] 6.1 Refatorar componentes de configuração
  - Consolidar BrandingSettings, GeneralSettings, SystemManager
  - Criar componente base para configurações
  - Implementar validações e persistência padronizadas
  - _Requirements: 4.1, 4.2, 4.4_

- [ ] 6.2 Refatorar componentes de conteúdo
  - Consolidar MediaLibrary, PageManager, MenuManager
  - Criar componentes reutilizáveis de upload e edição
  - Implementar drag-and-drop padronizado
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 6.3 Refatorar componentes de templates
  - Consolidar CertificateTemplateEditor e EmailTemplateEditor
  - Criar editor base reutilizável
  - Implementar preview e validação padronizados
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 6.4 Refatorar RoleManager.tsx
  - Consolidar lógica de gerenciamento de roles
  - Implementar permissões padronizadas
  - Criar componente de seleção de permissões reutilizável
  - _Requirements: 4.1, 4.2_

## Fase 7: Otimizações Finais e Documentação

- [ ] 7.1 Implementar testes para utilitários comuns
  - Criar testes unitários para `common-patterns.ts`
  - Testar hooks comuns e funções de filtro
  - Implementar testes de integração para componentes refatorados
  - _Requirements: 5.1, 5.2, 6.1_

- [ ] 7.2 Otimizar performance e bundle size
  - Analisar bundle size após refatorações
  - Implementar lazy loading onde apropriado
  - Otimizar re-renders e memoização
  - _Requirements: 5.1, 5.3_

- [ ] 7.3 Documentar padrões e guias de uso
  - Criar documentação de utilitários comuns
  - Escrever guias de migração para novos componentes
  - Documentar best practices estabelecidas
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 7.4 Implementar métricas e monitoramento
  - Configurar ferramentas de análise de código
  - Implementar métricas de performance
  - Criar dashboard de progresso da refatoração
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

## Fase 8: Validação e Cleanup Final

- [ ] 8.1 Auditoria completa do código refatorado
  - Revisar todos os componentes e hooks refatorados
  - Validar consistência de padrões aplicados
  - Verificar funcionalidade mantida
  - _Requirements: 5.1, 5.2, 6.4_

- [ ] 8.2 Cleanup de código legado
  - Remover arquivos e funções não utilizadas
  - Limpar imports desnecessários
  - Consolidar tipos e interfaces duplicadas
  - _Requirements: 5.3, 5.4_

- [ ] 8.3 Testes de regressão completos
  - Executar suite completa de testes
  - Validar funcionalidades críticas
  - Testar performance em produção
  - _Requirements: 5.1, 5.2, 5.4_

- [ ] 8.4 Documentação final e handover
  - Finalizar documentação técnica
  - Criar guias de onboarding atualizados
  - Preparar apresentação de resultados
  - _Requirements: 6.1, 6.2, 6.3, 6.4_