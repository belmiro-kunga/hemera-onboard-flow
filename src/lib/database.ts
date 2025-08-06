// Database client for frontend
// This is a mock implementation for frontend use
// In a real application, this would connect to Supabase or similar

export interface DatabaseClient {
  from(table: string): QueryBuilder;
  rpc(functionName: string, params?: any): Promise<{ data: any; error: any }>;
}

export interface QueryBuilder {
  select(columns?: string): QueryBuilder;
  insert(data: any): QueryBuilder;
  update(data: any): QueryBuilder;
  delete(): QueryBuilder;
  eq(column: string, value: any): QueryBuilder;
  not(column: string, operator: string, value: any): QueryBuilder;
  order(column: string, options?: { ascending?: boolean }): QueryBuilder;
  limit(count: number): QueryBuilder;
  single(): QueryBuilder;
  select_query(): Promise<{ data: any; error: any }>;
}

class MockQueryBuilder implements QueryBuilder {
  private tableName: string;
  private selectColumns?: string;
  private whereConditions: any[] = [];
  private orderBy?: { column: string; ascending: boolean };
  private limitCount?: number;
  private isSingle = false;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns?: string): QueryBuilder {
    this.selectColumns = columns;
    return this;
  }

  insert(data: any): QueryBuilder {
    console.warn(`🔧 Mock database: INSERT into ${this.tableName}`, data);
    return this;
  }

  update(data: any): QueryBuilder {
    console.warn(`🔧 Mock database: UPDATE ${this.tableName}`, data);
    return this;
  }

  delete(): QueryBuilder {
    console.warn(`🔧 Mock database: DELETE from ${this.tableName}`);
    return this;
  }

  eq(column: string, value: any): QueryBuilder {
    this.whereConditions.push({ column, operator: '=', value });
    return this;
  }

  not(column: string, operator: string, value: any): QueryBuilder {
    this.whereConditions.push({ column, operator: `NOT ${operator}`, value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }): QueryBuilder {
    this.orderBy = { column, ascending: options?.ascending ?? true };
    return this;
  }

  limit(count: number): QueryBuilder {
    this.limitCount = count;
    return this;
  }

  single(): QueryBuilder {
    this.isSingle = true;
    return this;
  }

  async select_query(): Promise<{ data: any; error: any }> {
    console.warn(`🔧 Mock database query: SELECT ${this.selectColumns || '*'} FROM ${this.tableName}`);
    
    // Return mock data based on table
    switch (this.tableName) {
      case 'user_levels':
        return {
          data: {
            id: 'mock-level-1',
            user_id: 'mock-user-1',
            current_level: 1,
            total_points: 150,
            points_to_next_level: 50,
            current_streak_days: 3,
            longest_streak_days: 7,
            last_activity_date: new Date().toISOString(),
            courses_completed: 2,
            simulados_completed: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          error: null
        };
      
      case 'user_badges':
        return {
          data: [
            {
              id: 'mock-user-badge-1',
              user_id: 'mock-user-1',
              badge_id: 'mock-badge-1',
              earned_at: new Date().toISOString(),
              badge: {
                id: 'mock-badge-1',
                name: 'Primeiro Login',
                description: 'Fez o primeiro login no sistema',
                icon_name: 'trophy',
                icon_color: '#FFD700',
                criteria_type: 'login',
                criteria_value: 1,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            }
          ],
          error: null
        };
      
      case 'profiles':
        return {
          data: [
            {
              user_id: 'mock-user-1',
              name: 'João Silva',
              email: 'joao@example.com',
              department: 'TI',
              job_position: 'Desenvolvedor',
              birth_date: '1990-03-15',
              photo_url: null
            },
            {
              user_id: 'mock-user-2',
              name: 'Maria Santos',
              email: 'maria@example.com',
              department: 'RH',
              job_position: 'Analista',
              birth_date: '1985-03-13',
              photo_url: null
            }
          ],
          error: null
        };
      
      default:
        return { data: [], error: null };
    }
  }
}

class MockDatabaseClient implements DatabaseClient {
  from(table: string): QueryBuilder {
    return new MockQueryBuilder(table);
  }

  async rpc(functionName: string, params?: any): Promise<{ data: any; error: any }> {
    console.warn(`🔧 Mock database RPC: ${functionName}`, params);
    
    switch (functionName) {
      case 'get_upcoming_birthdays':
        const today = new Date();
        const mockBirthdays = [
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
        ];
        return { data: mockBirthdays, error: null };
      
      case 'get_leaderboard':
        const mockLeaderboard = [
          {
            user_id: 'mock-user-1',
            name: 'João Silva',
            total_points: 150,
            current_level: 2,
            courses_completed: 3,
            simulados_completed: 2,
            badge_count: 1
          },
          {
            user_id: 'mock-user-2',
            name: 'Maria Santos',
            total_points: 120,
            current_level: 1,
            courses_completed: 2,
            simulados_completed: 1,
            badge_count: 1
          }
        ];
        return { data: mockLeaderboard, error: null };
      
      default:
        return { data: null, error: { message: `RPC function ${functionName} not implemented` } };
    }
  }
}

// Export a singleton instance
export const database = new MockDatabaseClient();

// Export types for use in other files
export type { QueryBuilder, DatabaseClient };
