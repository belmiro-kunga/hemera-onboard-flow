# Docker Setup Guide for Hemera

Este guia ajuda a configurar o Docker para o projeto Hemera no ambiente WSL2/Ubuntu.

## Verificação Rápida

Antes de começar, execute:

```bash
npm run db:check
```

Este comando verificará todos os pré-requisitos e fornecerá instruções específicas para seu ambiente.

## Configuração do Docker no WSL2

### 1. Verificar se Docker está instalado

```bash
docker --version
docker compose version
```

### 2. Configurar permissões do Docker

Se você receber erros de permissão, execute:

```bash
# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Aplicar as mudanças sem fazer logout
newgrp docker

# Testar se funcionou
docker info
```

### 3. Iniciar o serviço Docker

Se o Docker não estiver rodando:

```bash
# Iniciar Docker
sudo systemctl start docker

# Habilitar Docker para iniciar automaticamente
sudo systemctl enable docker

# Verificar status
sudo systemctl status docker
```

### 4. Verificar porta 5432

Se a porta 5432 estiver em uso por outro PostgreSQL:

```bash
# Verificar o que está usando a porta
sudo netstat -tulpn | grep :5432

# Parar PostgreSQL local se necessário
sudo systemctl stop postgresql
sudo service postgresql stop
```

## Configuração Inicial do Banco

Após configurar o Docker, execute:

```bash
# 1. Verificar pré-requisitos
npm run db:check

# 2. Configurar banco de dados
npm run db:setup
```

## Comandos Úteis

```bash
# Gerenciamento do banco
npm run db:start    # Iniciar banco
npm run db:stop     # Parar banco
npm run db:reset    # Resetar banco (APAGA DADOS!)

# Comandos Docker diretos
docker compose ps                    # Ver status dos containers
docker compose logs postgres        # Ver logs do PostgreSQL
docker compose exec postgres bash   # Conectar ao container
```

## Troubleshooting

### Erro: "permission denied while trying to connect to the Docker daemon socket"

```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Erro: "Docker daemon is not running"

```bash
sudo systemctl start docker
```

### Erro: "Port 5432 is already in use"

```bash
sudo systemctl stop postgresql
# ou
sudo service postgresql stop
```

### Erro: "No space left on device"

```bash
# Limpar containers e imagens não utilizados
docker system prune -a

# Verificar espaço em disco
df -h
```

### Container não inicia

```bash
# Ver logs detalhados
docker compose logs postgres

# Remover container e volume
docker compose down
docker volume prune

# Tentar novamente
npm run db:setup
```

## Configuração Avançada

### Alterar porta do PostgreSQL

Edite `docker-compose.yml`:

```yaml
ports:
  - "5433:5432"  # Usar porta 5433 em vez de 5432
```

E atualize `.env`:

```env
DB_PORT=5433
```

### Configurar memória do PostgreSQL

Adicione ao `docker-compose.yml`:

```yaml
environment:
  POSTGRES_INITDB_ARGS: "--shared_buffers=256MB --effective_cache_size=1GB"
```

### Backup automático

```bash
# Criar backup
docker compose exec postgres pg_dump -U hemera_user hemera_db > backup.sql

# Restaurar backup
docker compose exec -T postgres psql -U hemera_user -d hemera_db < backup.sql
```

## Próximos Passos

Após configurar o Docker e banco:

1. Execute `npm run db:setup` para inicializar
2. Aplique as migrações (próxima tarefa)
3. Inicie a aplicação com `npm run dev`

## Suporte

Se encontrar problemas:

1. Execute `npm run db:check` para diagnóstico
2. Verifique os logs: `docker compose logs postgres`
3. Consulte a documentação do Docker: https://docs.docker.com/