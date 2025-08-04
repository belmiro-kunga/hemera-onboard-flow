# Requirements Document

## Introduction

O sistema de simulados não está funcionando corretamente na página de administração. Os simulados criados não estão sendo persistidos no banco de dados PostgreSQL, e as operações de CRUD (Create, Read, Update, Delete) não estão funcionando como esperado. Este problema impede que os administradores gerenciem adequadamente os simulados da plataforma.

## Requirements

### Requirement 1

**User Story:** Como administrador, eu quero que o servidor da API esteja rodando e conectado ao banco de dados, para que as operações de simulados funcionem corretamente.

#### Acceptance Criteria

1. WHEN o servidor da API é iniciado THEN ele deve conectar-se ao banco PostgreSQL com sucesso
2. WHEN uma requisição é feita para /api/health THEN deve retornar status "connected" para o banco de dados
3. WHEN o servidor está rodando THEN deve estar disponível na porta 3001

### Requirement 2

**User Story:** Como administrador, eu quero visualizar todos os simulados existentes na página de administração, para que eu possa gerenciar o conteúdo da plataforma.

#### Acceptance Criteria

1. WHEN acesso a página /admin/simulados THEN deve carregar e exibir todos os simulados do banco de dados
2. WHEN não há simulados THEN deve exibir uma mensagem apropriada com opção de criar o primeiro simulado
3. WHEN há simulados THEN deve exibir informações como título, descrição, dificuldade, status ativo/inativo, número de questões e tentativas

### Requirement 3

**User Story:** Como administrador, eu quero criar novos simulados com questões, para que eu possa adicionar conteúdo educacional à plataforma.

#### Acceptance Criteria

1. WHEN clico no botão "Novo Simulado" THEN deve abrir o wizard de criação
2. WHEN preencho os dados do simulado e questões THEN deve salvar no banco de dados PostgreSQL
3. WHEN o simulado é criado com sucesso THEN deve exibir mensagem de confirmação e atualizar a lista
4. WHEN há erro na criação THEN deve exibir mensagem de erro apropriada

### Requirement 4

**User Story:** Como administrador, eu quero editar simulados existentes, para que eu possa manter o conteúdo atualizado.

#### Acceptance Criteria

1. WHEN clico no botão "Editar" de um simulado THEN deve abrir o wizard com os dados preenchidos
2. WHEN modifico os dados e salvo THEN deve atualizar no banco de dados
3. WHEN a edição é bem-sucedida THEN deve exibir mensagem de confirmação e atualizar a lista
4. WHEN há erro na edição THEN deve exibir mensagem de erro apropriada

### Requirement 5

**User Story:** Como administrador, eu quero ativar/desativar simulados, para que eu possa controlar quais estão disponíveis para os usuários.

#### Acceptance Criteria

1. WHEN clico no botão de ativar/desativar THEN deve alterar o status no banco de dados
2. WHEN o status é alterado THEN deve exibir mensagem de confirmação
3. WHEN há erro na alteração THEN deve exibir mensagem de erro apropriada
4. WHEN o simulado está ativo THEN deve exibir badge verde "Ativo"
5. WHEN o simulado está inativo THEN deve exibir badge cinza "Inativo"

### Requirement 6

**User Story:** Como administrador, eu quero excluir simulados, para que eu possa remover conteúdo obsoleto da plataforma.

#### Acceptance Criteria

1. WHEN clico no botão de excluir THEN deve solicitar confirmação
2. WHEN confirmo a exclusão THEN deve remover o simulado e suas questões do banco de dados
3. WHEN a exclusão é bem-sucedida THEN deve exibir mensagem de confirmação e atualizar a lista
4. WHEN há erro na exclusão THEN deve exibir mensagem de erro apropriada

### Requirement 7

**User Story:** Como administrador, eu quero que o componente SimuladoWizard funcione corretamente, para que eu possa criar e editar simulados com interface amigável.

#### Acceptance Criteria

1. WHEN o wizard é aberto THEN deve carregar sem erros
2. WHEN estou criando um simulado THEN deve permitir adicionar questões e opções
3. WHEN estou editando THEN deve carregar os dados existentes do simulado
4. WHEN salvo o simulado THEN deve chamar as funções corretas do hook useSimulados