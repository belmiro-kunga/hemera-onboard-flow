# Design Document

## Overview

O problema principal é que o servidor da API não está rodando consistentemente, causando falhas nas operações CRUD dos simulados. O sistema já possui a estrutura correta (tabelas no banco, endpoints na API, componentes React), mas há problemas de conectividade e inicialização do servidor.

## Architecture

### Current Architecture
```
Frontend (React) → API Server (Express) → PostgreSQL Database
     ↓                    ↓                      ↓
SimuladosAdmin.tsx   api-server.js         simulados table
useSimulados.ts      /api/simulados/*      questoes table
simulados.ts API                           opcoes_resposta table
```

### Issues Identified
1. **API Server Startup**: O servidor não está sendo iniciado de forma consistente
2. **Connection Management**: Falta de verificação de conectividade antes das operações
3. **Error Handling**: Fallback para mock data pode mascarar problemas reais
4. **Process Management**: Servidor pode não estar rodando em background

## Components and Interfaces

### 1. API Server Management
- **File**: `backend/api-server.js`
- **Status**: Implementado, mas com problemas de inicialização
- **Required Changes**: Melhorar logging e verificação de conexão

### 2. Frontend API Client
- **File**: `src/lib/api/simulados.ts`
- **Status**: Implementado com fallback para mock data
- **Required Changes**: Melhorar detecção de API disponível

### 3. React Hook
- **File**: `src/hooks/useSimulados.ts`
- **Status**: Implementado corretamente
- **Required Changes**: Melhorar tratamento de erros

### 4. Admin Interface
- **File**: `src/pages/admin/SimuladosAdmin.tsx`
- **Status**: Implementado corretamente
- **Required Changes**: Verificar se SimuladoWizard existe

### 5. SimuladoWizard Component
- **File**: `src/components/admin/SimuladoWizard.tsx`
- **Status**: Referenciado mas pode não existir
- **Required Changes**: Criar se não existir

## Data Models

### Database Schema (Already Exists)
```sql
-- Simulados table
CREATE TABLE public.simulados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  total_questions INTEGER NOT NULL DEFAULT 10,
  difficulty difficulty_level DEFAULT 'medio',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Questions table
CREATE TABLE public.questoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulado_id UUID REFERENCES public.simulados(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type question_type NOT NULL DEFAULT 'multiple_choice',
  explanation TEXT,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Options table
CREATE TABLE public.opcoes_resposta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  questao_id UUID REFERENCES public.questoes(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### API Interfaces (Already Defined)
```typescript
interface Simulado {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  total_questions: number;
  difficulty: 'facil' | 'medio' | 'dificil';
  is_active: boolean;
  created_at: string;
  _count?: {
    attempts: number;
    questions: number;
  };
}

interface Question {
  id?: string;
  text: string;
  type: 'multiple_choice' | 'single_answer';
  explanation: string;
  order_number: number;
  options: Option[];
}

interface Option {
  id?: string;
  text: string;
  is_correct: boolean;
  order_number: number;
}
```

## Error Handling

### Current Issues
1. **Silent Failures**: API client falls back to mock data without clear indication
2. **Connection Errors**: No retry mechanism for database connections
3. **User Feedback**: Limited error messages to users

### Proposed Solutions
1. **API Health Check**: Implement proper health checking before operations
2. **Error Boundaries**: Better error handling in React components
3. **User Notifications**: Clear error messages and success confirmations
4. **Retry Logic**: Implement retry for transient failures

## Testing Strategy

### Manual Testing Steps
1. **Database Connection**: Verify PostgreSQL is running and accessible
2. **API Server**: Ensure server starts and responds to health checks
3. **CRUD Operations**: Test each operation (Create, Read, Update, Delete)
4. **UI Integration**: Verify all buttons and forms work correctly
5. **Error Scenarios**: Test with API down, database down, invalid data

### Automated Testing
1. **API Endpoints**: Test all simulados endpoints
2. **Database Operations**: Verify data persistence
3. **React Components**: Test component rendering and interactions

## Implementation Plan

### Phase 1: Server Startup and Connection
1. Verify database is running
2. Start API server properly
3. Test basic connectivity

### Phase 2: Component Verification
1. Check if SimuladoWizard component exists
2. Create if missing
3. Verify all imports are correct

### Phase 3: CRUD Operations Testing
1. Test each operation individually
2. Fix any database or API issues
3. Verify UI updates correctly

### Phase 4: Error Handling Improvements
1. Improve error messages
2. Add better user feedback
3. Implement retry logic where appropriate

## Dependencies

### External Dependencies
- PostgreSQL database (running in Docker)
- Node.js runtime
- Express.js server
- postgres npm package

### Internal Dependencies
- Database schema (already created)
- API endpoints (already implemented)
- React components (mostly implemented)
- Common hooks and utilities

## Security Considerations

### Current Security
- Row Level Security (RLS) policies already implemented
- Admin-only access to simulados management
- Input validation in API endpoints

### Additional Considerations
- Ensure proper authentication for admin operations
- Validate all input data before database operations
- Sanitize user input to prevent SQL injection