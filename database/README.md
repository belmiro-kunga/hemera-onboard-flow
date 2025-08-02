# Database Setup Guide

Este guia explica como configurar e usar o banco de dados PostgreSQL local para o projeto Hemera.

## Pré-requisitos

- Docker e Docker Compose instalados
- WSL2 (se estiver no Windows)

## Configuração Inicial

1. **Clone o repositório e navegue até a pasta do projeto**

2. **Execute o setup inicial:**
   ```bash
   npm run db:setup
   ```

   Este comando irá:
   - Criar o arquivo `.env` se não existir
   - Inicializar o container PostgreSQL
   - Configurar o banco de dados com extensões necessárias
   - Criar tabelas de autenticação básicas

3. **Verifique se o banco está funcionando:**
   ```bash
   docker compose ps
   ```

## Comandos Disponíveis

### Gerenciamento do Container

```bash
# Iniciar o banco de dados
npm run db:start

# Parar o banco de dados (preserva dados)
npm run db:stop

# Resetar completamente o banco (APAGA TODOS OS DADOS!)
npm run db:reset

# Setup inicial completo
npm run db:setup
```

### Comandos Docker Diretos

```bash
# Ver logs do PostgreSQL
docker compose logs postgres

# Conectar ao banco via psql
docker compose exec postgres psql -U hemera_user -d hemera_db

# Backup do banco
docker compose exec postgres pg_dump -U hemera_user hemera_db > backup.sql

# Restaurar backup
docker compose exec -T postgres psql -U hemera_user -d hemera_db < backup.sql
```

## Configuração do Banco

### Credenciais Padrão
- **Host:** localhost
- **Porta:** 5432
- **Database:** hemera_db
- **Usuário:** hemera_user
- **Senha:** hemera_password

### Variáveis de Ambiente

O arquivo `.env` contém as configurações do banco:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hemera_db
DB_USER=hemera_user
DB_PASSWORD=hemera_password
DB_SSL=false
```

## Estrutura do Banco

### Schemas

- **public:** Tabelas principais da aplicação
- **auth:** Sistema de autenticação local

### Extensões Habilitadas

- **uuid-ossp:** Geração de UUIDs
- **pgcrypto:** Funções de criptografia

### Funções Especiais

- `auth.uid()`: Retorna o ID do usuário atual (similar ao Supabase)
- `auth.set_user_id(uuid)`: Define o usuário atual para a sessão

## Troubleshooting

### Container não inicia

1. Verifique se o Docker está rodando:
   ```bash
   docker info
   ```

2. Verifique se a porta 5432 não está em uso:
   ```bash
   netstat -an | grep 5432
   ```

3. Remova containers antigos:
   ```bash
   docker compose down
   docker system prune
   ```

### Erro de conexão

1. Verifique se o container está rodando:
   ```bash
   docker compose ps
   ```

2. Teste a conexão:
   ```bash
   docker compose exec postgres pg_isready -U hemera_user -d hemera_db
   ```

3. Verifique os logs:
   ```bash
   docker compose logs postgres
   ```

### Performance lenta

1. Verifique recursos do Docker:
   - Aumente memória alocada para Docker
   - Verifique espaço em disco

2. Otimize configurações do PostgreSQL (se necessário):
   - Edite `docker-compose.yml`
   - Adicione configurações de performance

## Migração de Dados

Para migrar dados do Supabase existente:

1. **Export dos dados do Supabase** (será implementado na próxima tarefa)
2. **Import para PostgreSQL local** (será implementado na próxima tarefa)

## Segurança

### Desenvolvimento Local

- As credenciais padrão são adequadas para desenvolvimento
- O banco só é acessível localmente
- SSL está desabilitado para simplicidade

### Produção

Para produção, altere:
- Senhas fortes
- Habilite SSL
- Configure firewall adequadamente
- Use variáveis de ambiente seguras

## Backup e Restore

### Backup Automático

```bash
# Criar backup com timestamp
docker compose exec postgres pg_dump -U hemera_user hemera_db > "backup_$(date +%Y%m%d_%H%M%S).sql"
```

### Restore

```bash
# Restaurar de backup
docker compose exec -T postgres psql -U hemera_user -d hemera_db < backup.sql
```

## Monitoramento

### Verificar Status

```bash
# Status do container
docker compose ps postgres

# Uso de recursos
docker stats hemera-postgres

# Conexões ativas
docker compose exec postgres psql -U hemera_user -d hemera_db -c "SELECT count(*) FROM pg_stat_activity;"
```