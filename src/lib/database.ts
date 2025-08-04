// Database client with environment detection
import type { DatabaseResponse } from './database-types';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Mock implementation for browser
class MockDatabaseClient {
  private currentUserId: string | null = null;

  setUserId(userId: string | null) {
    this.currentUserId = userId;
    console.warn('🔧 Using mock database client - setUserId called with:', userId);
  }

  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  async query(query: string, params: any[] = []): Promise<DatabaseResponse> {
    console.warn('🔧 Using mock database client - query called:', query);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (query.includes('SELECT 1')) {
      return { data: [{ test: 1 }], error: null };
    }
    
    return { data: [], error: null };
  }

  from(table: string) {
    console.warn('🔧 Using mock database client - from called with table:', table);
    return new MockQueryBuilder(table);
  }

  async rpc(functionName: string, params: Record<string, any> = {}): Promise<DatabaseResponse> {
    console.warn('🔧 Using mock database client - rpc called:', functionName);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    switch (functionName) {
      case 'is_admin_user':
        return { data: false, error: null };
      case 'get_upcoming_birthdays':
        // Return mock birthday data
        return { 
          data: [
            {
              user_id: 'mock-user-1',
              name: 'João Silva',
              email: 'joao@example.com',
              department: 'TI',
              job_position: 'Desenvolvedor',
              birth_date: '1990-03-15',
              days_until_birthday: 2,
              is_today: false
            },
            {
              user_id: 'mock-user-2',
              name: 'Maria Santos',
              email: 'maria@example.com',
              department: 'RH',
              job_position: 'Analista',
              birth_date: '1985-03-13',
              days_until_birthday: 0,
              is_today: true
            }
          ], 
          error: null 
        };
      case 'get_admin_users_with_emails':
        return {
          data: [
            { id: 'mock-user-1', name: 'João Silva', email: 'joao@example.com' },
            { id: 'mock-user-2', name: 'Maria Santos', email: 'maria@example.com' },
            { id: 'mock-user-3', name: 'Pedro Costa', email: 'pedro@example.com' }
          ],
          error: null
        };
      case 'get_users_with_details':
        return {
          data: [
            {
              id: 'mock-user-1',
              user_id: 'mock-user-1',
              name: 'João Silva',
              email: 'joao@example.com',
              department: 'TI',
              job_position: 'Desenvolvedor',
              role: 'funcionario',
              is_active: true,
              created_at: new Date().toISOString()
            },
            {
              id: 'mock-user-2',
              user_id: 'mock-user-2',
              name: 'Maria Santos',
              email: 'maria@example.com',
              department: 'RH',
              job_position: 'Analista',
              role: 'funcionario',
              is_active: true,
              created_at: new Date().toISOString()
            },
            {
              id: 'mock-admin',
              user_id: 'mock-admin',
              name: 'Admin User',
              email: 'admin@example.com',
              department: 'TI',
              job_position: 'Administrador',
              role: 'admin',
              is_active: true,
              created_at: new Date().toISOString()
            }
          ],
          error: null
        };
      case 'create_user_with_profile':
        return {
          data: {
            success: true,
            user_id: `mock-user-${Date.now()}`,
            message: 'User created successfully (mock)'
          },
          error: null
        };
      case 'generate_temporary_password':
        return {
          data: {
            success: true,
            temporary_password: 'mock-temp-password'
          },
          error: null
        };
      case 'apply_template_to_user':
        return {
          data: Math.floor(Math.random() * 5) + 1, // Mock 1-5 assignments created
          error: null
        };
      default:
        // For unknown functions, return empty data instead of error
        console.warn(`🔧 Mock RPC function '${functionName}' not implemented, returning empty data`);
        return { data: null, error: null };
    }
  }
}

class MockQueryBuilder {
  private table: string;
  private selectFields: string = '*';
  private whereConditions: Array<{ column: string; operator: string; value: any }> = [];
  private orderByClause: { column: string; ascending: boolean } | null = null;
  private limitValue: number | null = null;

  constructor(table: string) {
    this.table = table;
  }

  select(fields: string = '*') {
    this.selectFields = fields;
    return this;
  }

  eq(column: string, value: any) {
    this.whereConditions.push({ column, operator: 'eq', value });
    return this;
  }

  neq(column: string, value: any) {
    this.whereConditions.push({ column, operator: 'neq', value });
    return this;
  }

  gt(column: string, value: any) {
    this.whereConditions.push({ column, operator: 'gt', value });
    return this;
  }

  gte(column: string, value: any) {
    this.whereConditions.push({ column, operator: 'gte', value });
    return this;
  }

  lt(column: string, value: any) {
    this.whereConditions.push({ column, operator: 'lt', value });
    return this;
  }

  lte(column: string, value: any) {
    this.whereConditions.push({ column, operator: 'lte', value });
    return this;
  }

  like(column: string, pattern: string) {
    this.whereConditions.push({ column, operator: 'like', value: pattern });
    return this;
  }

  ilike(column: string, pattern: string) {
    this.whereConditions.push({ column, operator: 'ilike', value: pattern });
    return this;
  }

  in(column: string, values: any[]) {
    this.whereConditions.push({ column, operator: 'in', value: values });
    return this;
  }

  is(column: string, value: null) {
    this.whereConditions.push({ column, operator: 'is', value });
    return this;
  }

  order(column: string, options: { ascending?: boolean } = {}) {
    this.orderByClause = { column, ascending: options.ascending !== false };
    return this;
  }

  limit(count: number) {
    this.limitValue = count;
    return this;
  }

  async select_query(): Promise<DatabaseResponse> {
    console.warn('🔧 Mock query builder - select_query called for table:', this.table);
    await new Promise(resolve => setTimeout(resolve, 100));
    return { data: [], error: null };
  }

  async insert(data: Record<string, any> | Record<string, any>[]): Promise<DatabaseResponse> {
    console.warn('🔧 Mock query builder - insert called for table:', this.table);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const records = Array.isArray(data) ? data : [data];
    const newRecords = records.map(record => ({
      ...record,
      id: record.id || Math.random().toString(36).substr(2, 9),
      created_at: record.created_at || new Date().toISOString(),
      updated_at: record.updated_at || new Date().toISOString()
    }));

    return { data: newRecords, error: null };
  }

  async update(data: Record<string, any>): Promise<DatabaseResponse> {
    console.warn('🔧 Mock query builder - update called for table:', this.table);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (this.whereConditions.length === 0) {
      return { data: null, error: { message: 'Update requires WHERE conditions', code: 'MOCK_ERROR' } };
    }

    return { data: [{ ...data, updated_at: new Date().toISOString() }], error: null };
  }

  async delete(): Promise<DatabaseResponse> {
    console.warn('🔧 Mock query builder - delete called for table:', this.table);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (this.whereConditions.length === 0) {
      return { data: null, error: { message: 'Delete requires WHERE conditions', code: 'MOCK_ERROR' } };
    }

    return { data: [{ id: 'mock-deleted-id' }], error: null };
  }
}

// Create database client based on environment
let databaseClient: MockDatabaseClient;

if (isBrowser) {
  // Browser environment - use mock client
  console.warn('🔧 Initializing mock database client for browser environment');
  databaseClient = new MockDatabaseClient();
} else {
  // This should not happen in browser, but TypeScript needs it
  databaseClient = new MockDatabaseClient();
}

// Export the client
export const database = databaseClient;

// Mock connection functions for browser
export async function checkDatabaseConnection(): Promise<boolean> {
  if (isBrowser) {
    console.warn('🔧 Mock database connection check - always returns true in browser');
    return true;
  }
  return false;
}

export async function closeDatabaseConnection(): Promise<void> {
  if (isBrowser) {
    console.warn('🔧 Mock database connection close - no-op in browser');
  }
}

// Export for compatibility
export const sql = databaseClient;