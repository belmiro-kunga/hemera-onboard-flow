# Design Document

## Overview

Esta migração transformará o sistema atual que utiliza Supabase como backend para uma arquitetura local usando PostgreSQL em Docker. O objetivo é manter toda a funcionalidade existente enquanto permite desenvolvimento local independente de serviços externos.

A migração envolve três componentes principais:
1. **Infraestrutura**: Setup do PostgreSQL em Docker
2. **Migração de Schema**: Aplicação das migrações existentes do Supabase
3. **Adaptação do Cliente**: Modificação da camada de acesso a dados

## Architecture

### Current Architecture
```
React App → Supabase Client → Supabase Cloud (PostgreSQL + Auth + Realtime)
```

### Target Architecture
```
React App → PostgreSQL Client → Local PostgreSQL (Docker)
```

### Key Changes
- Substituir `@supabase/supabase-js` por cliente PostgreSQL direto (ex: `pg` ou `postgres.js`)
- Implementar autenticação local (JWT + bcrypt)
- Remover dependências de funcionalidades específicas do Supabase (Realtime, Storage, Edge Functions)
- Manter compatibilidade com queries existentes

## Components and Interfaces

### 1. Docker Infrastructure

**Docker Compose Configuration:**
- PostgreSQL 15+ container
- Persistent volume para dados
- Configuração de rede local
- Variáveis de ambiente para credenciais

**Environment Variables:**
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=app_database
DB_USER=app_user
DB_PASSWORD=secure_password
```

### 2. Database Client Layer

**New Database Client (`src/lib/database.ts`):**
- Connection pool management
- Query builder/wrapper functions
- Error handling and logging
- Transaction support

**Interface Compatibility:**
- Manter interface similar ao Supabase client
- Implementar métodos `.select()`, `.insert()`, `.update()`, `.delete()`
- Suporte a filtros e ordenação

### 3. Authentication System

**Local Auth Implementation:**
- JWT token generation/validation
- Password hashing com bcrypt
- Session management
- User registration/login endpoints

**Auth Context Adaptation:**
- Manter interface existente do `AuthContext`
- Adaptar para usar autenticação local
- Preservar funcionalidade de admin check

### 4. Migration System

**Schema Migration:**
- Script para aplicar todas as migrações existentes
- Validação de integridade do schema
- Backup/restore capabilities

**Data Migration (opcional):**
- Export de dados do Supabase
- Import para PostgreSQL local
- Validação de dados migrados

## Data Models

### Database Schema
O schema será idêntico ao atual, baseado nas migrações existentes:

**Core Tables:**
- `profiles` - Perfis de usuário
- `video_courses` - Cursos em vídeo
- `course_enrollments` - Matrículas em cursos
- `course_assignments` - Atribuições de cursos
- `assignment_templates` - Templates de atribuição
- `simulados` - Simulados/testes
- `notifications` - Sistema de notificações

**Key Relationships:**
- User → Profiles (1:1)
- Profiles → Course Enrollments (1:N)
- Profiles → Course Assignments (1:N)
- Templates → Template Courses (1:N)

### Data Types
Manter compatibilidade com tipos PostgreSQL:
- UUID para IDs
- TIMESTAMP WITH TIME ZONE para datas
- JSONB para dados estruturados
- TEXT para conteúdo longo

## Error Handling

### Database Connection Errors
- Connection pool exhaustion
- Network connectivity issues
- Authentication failures
- Query timeout handling

### Migration Errors
- Schema conflicts
- Data integrity violations
- Rollback procedures
- Validation failures

### Application Errors
- Graceful degradation
- User-friendly error messages
- Logging and monitoring
- Retry mechanisms

## Testing Strategy

### Unit Tests
- Database client functions
- Authentication utilities
- Migration scripts
- Error handling scenarios

### Integration Tests
- End-to-end database operations
- Authentication flow
- Migration process
- Data integrity validation

### Performance Tests
- Connection pool performance
- Query optimization
- Load testing
- Memory usage monitoring

### Compatibility Tests
- Existing functionality preservation
- API compatibility
- User experience consistency
- Admin features validation

## Security Considerations

### Database Security
- Strong password policies
- Connection encryption (SSL)
- Network isolation
- Access control (roles/permissions)

### Authentication Security
- JWT secret management
- Password hashing (bcrypt)
- Session timeout
- CSRF protection

### Development Security
- Environment variable management
- Docker security best practices
- Local network isolation
- Backup encryption

## Performance Optimization

### Database Performance
- Connection pooling
- Query optimization
- Index maintenance
- Prepared statements

### Application Performance
- Lazy loading
- Caching strategies
- Batch operations
- Memory management

## Migration Strategy

### Phase 1: Infrastructure Setup
- Docker configuration
- PostgreSQL installation
- Network setup
- Environment configuration

### Phase 2: Schema Migration
- Apply existing migrations
- Validate schema integrity
- Create indexes and constraints
- Test database functionality

### Phase 3: Client Adaptation
- Replace Supabase client
- Implement database wrapper
- Update authentication
- Test application functionality

### Phase 4: Data Migration (Optional)
- Export Supabase data
- Transform and import
- Validate data integrity
- Performance testing

### Phase 5: Cleanup
- Remove Supabase dependencies
- Update documentation
- Final testing
- Deployment preparation