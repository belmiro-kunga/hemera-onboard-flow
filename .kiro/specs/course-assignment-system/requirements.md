# Requirements Document

## Introduction

Este documento define os requisitos para implementar um sistema de atribuição de cursos no sistema HCP Onboarding. O objetivo é permitir que administradores atribuam cursos específicos a funcionários específicos, controlando o acesso e disponibilidade dos cursos de forma granular, ao invés de todos os cursos estarem disponíveis para todos os usuários.

## Requirements

### Requirement 1

**User Story:** Como administrador, eu quero atribuir cursos específicos a funcionários específicos, para que eu possa controlar quais cursos cada funcionário tem acesso e deve completar.

#### Acceptance Criteria

1. WHEN o administrador acessa a interface de atribuição de cursos THEN o sistema SHALL exibir uma lista de todos os funcionários cadastrados
2. WHEN o administrador seleciona um funcionário THEN o sistema SHALL mostrar os cursos já atribuídos e disponíveis para atribuição
3. WHEN o administrador atribui um curso a um funcionário THEN o sistema SHALL criar a associação e notificar o funcionário
4. WHEN o administrador remove uma atribuição THEN o sistema SHALL desassociar o curso do funcionário sem afetar o progresso já realizado
5. WHEN o administrador atribui um curso THEN o sistema SHALL permitir definir prazo de conclusão opcional

### Requirement 2

**User Story:** Como funcionário, eu quero ver apenas os cursos que foram atribuídos a mim, para que eu possa focar nos cursos relevantes para minha função e desenvolvimento.

#### Acceptance Criteria

1. WHEN o funcionário acessa a página de cursos THEN o sistema SHALL exibir apenas os cursos atribuídos a ele
2. WHEN o funcionário não tem cursos atribuídos THEN o sistema SHALL exibir uma mensagem informativa
3. WHEN o funcionário visualiza um curso atribuído THEN o sistema SHALL mostrar informações sobre prazo e prioridade
4. WHEN o funcionário completa um curso atribuído THEN o sistema SHALL notificar o administrador
5. WHEN o funcionário acessa um curso não atribuído THEN o sistema SHALL bloquear o acesso com mensagem explicativa

### Requirement 3

**User Story:** Como administrador, eu quero gerenciar atribuições em massa, para que eu possa atribuir cursos a múltiplos funcionários de forma eficiente.

#### Acceptance Criteria

1. WHEN o administrador seleciona múltiplos funcionários THEN o sistema SHALL permitir atribuir um curso a todos simultaneamente
2. WHEN o administrador seleciona um departamento THEN o sistema SHALL permitir atribuir cursos a todos os funcionários do departamento
3. WHEN o administrador importa uma lista de atribuições THEN o sistema SHALL processar o arquivo CSV e criar as atribuições
4. WHEN o administrador cria atribuições em massa THEN o sistema SHALL validar todas as atribuições antes de processar
5. WHEN o administrador executa atribuições em massa THEN o sistema SHALL fornecer relatório de sucesso/erro

### Requirement 4

**User Story:** Como administrador, eu quero definir prazos e prioridades para cursos atribuídos, para que eu possa gerenciar cronogramas de treinamento e desenvolvimento.

#### Acceptance Criteria

1. WHEN o administrador atribui um curso THEN o sistema SHALL permitir definir data limite para conclusão
2. WHEN o administrador define prioridade THEN o sistema SHALL aceitar valores como Alta, Média, Baixa
3. WHEN um prazo está próximo do vencimento THEN o sistema SHALL enviar notificações automáticas
4. WHEN um prazo é ultrapassado THEN o sistema SHALL marcar como atrasado e notificar administrador
5. WHEN o administrador visualiza atribuições THEN o sistema SHALL ordenar por prioridade e prazo

### Requirement 5

**User Story:** Como administrador, eu quero acompanhar o progresso das atribuições, para que eu possa monitorar o cumprimento dos treinamentos e identificar necessidades de suporte.

#### Acceptance Criteria

1. WHEN o administrador acessa relatórios de atribuição THEN o sistema SHALL exibir status de todos os cursos atribuídos
2. WHEN o administrador consulta progresso individual THEN o sistema SHALL mostrar detalhes de cada funcionário
3. WHEN o administrador visualiza estatísticas THEN o sistema SHALL exibir taxas de conclusão por departamento
4. WHEN o administrador acessa alertas THEN o sistema SHALL mostrar cursos em atraso e próximos ao vencimento
5. WHEN o administrador gera relatórios THEN o sistema SHALL permitir exportar dados em CSV e PDF

### Requirement 6

**User Story:** Como funcionário, eu quero receber notificações sobre cursos atribuídos, para que eu seja informado sobre novos treinamentos e prazos importantes.

#### Acceptance Criteria

1. WHEN um curso é atribuído ao funcionário THEN o sistema SHALL enviar notificação por email e no sistema
2. WHEN o prazo de um curso está próximo THEN o sistema SHALL enviar lembretes automáticos
3. WHEN o funcionário não iniciou um curso atribuído THEN o sistema SHALL enviar notificação de lembrete
4. WHEN o funcionário completa um curso THEN o sistema SHALL enviar confirmação de conclusão
5. WHEN há mudanças na atribuição THEN o sistema SHALL notificar o funcionário sobre as alterações

### Requirement 7

**User Story:** Como administrador, eu quero criar templates de atribuição por cargo/departamento, para que eu possa padronizar treinamentos obrigatórios por função.

#### Acceptance Criteria

1. WHEN o administrador cria um template THEN o sistema SHALL permitir definir cursos obrigatórios por cargo
2. WHEN o administrador associa template a um cargo THEN o sistema SHALL aplicar automaticamente a novos funcionários
3. WHEN o administrador modifica um template THEN o sistema SHALL perguntar se aplica mudanças aos funcionários existentes
4. WHEN um funcionário muda de cargo THEN o sistema SHALL aplicar o template do novo cargo automaticamente
5. WHEN o administrador visualiza templates THEN o sistema SHALL mostrar quantos funcionários são afetados por cada template