import postgres from 'postgres';
import { databaseConfig, validateDatabaseConfig } from './database-config';
import { logger, handleDatabaseError } from './database-utils';
import type { DatabaseResponse } from './database-types';

// Validate configuration on startup
const configValidation = validateDatabaseConfig();
if (!configValidation.isValid) {
  logger.error('Invalid database configuration:', configValidation.errors);
  throw new Error(`Database configuration errors: ${configValidation.errors.join(', ')}`);
}

// Create PostgreSQL connection
const sql = postgres({
  host: databaseConfig.host,
  port: databaseConfig.port,
  database: databaseConfig.database,
  username: databaseConfig.username,
  password: databaseConfig.password,
  ssl: databaseConfig.ssl,
  max: databaseConfig.maxConnections,
  idle_timeout: databaseConfig.idleTimeout,
  connect_timeout: databaseConfig.connectTimeout,
  prepare: false,
});

// Database client interface that mimics Supabase client
export class DatabaseClient {
  private sql: typeof sql;
  private currentUserId: string | null = null;

  constructor(sqlInstance: typeof sql) {
    this.sql = sqlInstance;
  }

  // Set current user ID for RLS policies
  setUserId(userId: string | null) {
    this.currentUserId = userId;
  }

  // Get current user ID
  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  // Execute raw SQL query
  async query(query: string, params: any[] = []): Promise<DatabaseResponse> {
    try {
      // Set user context if available
      if (this.currentUserId) {
        await this.sql`SELECT auth.set_user_id(${this.currentUserId}::UUID)`;
      }
      
      const result = await this.sql.unsafe(query, params);
      return { data: result, error: null };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      return { data: null, error: dbError };
    }
  }

  // Select data from table (Supabase-like interface)
  from(table: string) {
    return new QueryBuilder(this.sql, table, this.currentUserId);
  }

  // Execute RPC function
  async rpc(functionName: string, params: Record<string, any> = {}): Promise<DatabaseResponse> {
    try {
      // Set user context if available
      if (this.currentUserId) {
        await this.sql`SELECT auth.set_user_id(${this.currentUserId}::UUID)`;
      }

      // Build function call with named parameters
      const paramEntries = Object.entries(params);
      if (paramEntries.length === 0) {
        const result = await this.sql`SELECT ${this.sql(functionName)}() as result`;
        return { data: result[0]?.result, error: null };
      } else {
        // For functions with parameters, we need to build the call dynamically
        const paramList = paramEntries.map(([key, value]) => `${key} => ${this.sql.typed.text(value)}`).join(', ');
        const query = `SELECT ${functionName}(${paramList}) as result`;
        const result = await this.sql.unsafe(query);
        return { data: result[0]?.result, error: null };
      }
    } catch (error) {
      const dbError = handleDatabaseError(error);
      return { data: null, error: dbError };
    }
  }
}

// Query builder class to mimic Supabase query interface
class QueryBuilder {
  private sql: typeof sql;
  private table: string;
  private selectFields: string = '*';
  private whereConditions: Array<{ condition: string; value: any }> = [];
  private orderByClause: string = '';
  private limitClause: number | null = null;
  private currentUserId: string | null;

  constructor(sqlInstance: typeof sql, table: string, userId: string | null = null) {
    this.sql = sqlInstance;
    this.table = table;
    this.currentUserId = userId;
  }

  // Select specific fields
  select(fields: string = '*') {
    this.selectFields = fields;
    return this;
  }

  // Add WHERE condition
  eq(column: string, value: any) {
    this.whereConditions.push({ condition: `${column} = $`, value });
    return this;
  }

  // Add WHERE NOT EQUAL condition
  neq(column: string, value: any) {
    this.whereConditions.push({ condition: `${column} != $`, value });
    return this;
  }

  // Add WHERE GREATER THAN condition
  gt(column: string, value: any) {
    this.whereConditions.push({ condition: `${column} > $`, value });
    return this;
  }

  // Add WHERE GREATER THAN OR EQUAL condition
  gte(column: string, value: any) {
    this.whereConditions.push({ condition: `${column} >= $`, value });
    return this;
  }

  // Add WHERE LESS THAN condition
  lt(column: string, value: any) {
    this.whereConditions.push({ condition: `${column} < $`, value });
    return this;
  }

  // Add WHERE LESS THAN OR EQUAL condition
  lte(column: string, value: any) {
    this.whereConditions.push({ condition: `${column} <= $`, value });
    return this;
  }

  // Add WHERE LIKE condition
  like(column: string, pattern: string) {
    this.whereConditions.push({ condition: `${column} LIKE $`, value: pattern });
    return this;
  }

  // Add WHERE ILIKE condition (case insensitive)
  ilike(column: string, pattern: string) {
    this.whereConditions.push({ condition: `${column} ILIKE $`, value: pattern });
    return this;
  }

  // Add WHERE IN condition
  in(column: string, values: any[]) {
    this.whereConditions.push({ condition: `${column} = ANY($)`, value: values });
    return this;
  }

  // Add WHERE IS NULL condition
  is(column: string, value: null) {
    if (value === null) {
      this.whereConditions.push({ condition: `${column} IS NULL`, value: null });
    }
    return this;
  }

  // Add ORDER BY clause
  order(column: string, options: { ascending?: boolean } = {}) {
    const direction = options.ascending === false ? 'DESC' : 'ASC';
    this.orderByClause = `ORDER BY ${column} ${direction}`;
    return this;
  }

  // Add LIMIT clause
  limit(count: number) {
    this.limitClause = count;
    return this;
  }

  // Execute SELECT query
  async select_query(): Promise<DatabaseResponse> {
    try {
      // Set user context if available
      if (this.currentUserId) {
        await this.sql`SELECT auth.set_user_id(${this.currentUserId}::UUID)`;
      }

      // Build the query using postgres.js template literals
      let query = this.sql`SELECT ${this.sql.unsafe(this.selectFields)} FROM ${this.sql(this.table)}`;
      
      // Add WHERE conditions
      for (const condition of this.whereConditions) {
        if (condition.value !== null) {
          query = this.sql`${query} WHERE ${this.sql.unsafe(condition.condition.replace('$', '${condition.value}'))}`;
        } else {
          query = this.sql`${query} WHERE ${this.sql.unsafe(condition.condition)}`;
        }
      }
      
      // Add ORDER BY
      if (this.orderByClause) {
        query = this.sql`${query} ${this.sql.unsafe(this.orderByClause)}`;
      }
      
      // Add LIMIT
      if (this.limitClause) {
        query = this.sql`${query} LIMIT ${this.limitClause}`;
      }

      const result = await query;
      return { data: result, error: null };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      return { data: null, error: dbError };
    }
  }

  // Insert data
  async insert(data: Record<string, any> | Record<string, any>[]): Promise<DatabaseResponse> {
    try {
      // Set user context if available
      if (this.currentUserId) {
        await this.sql`SELECT auth.set_user_id(${this.currentUserId}::UUID)`;
      }

      const records = Array.isArray(data) ? data : [data];
      const result = await this.sql`INSERT INTO ${this.sql(this.table)} ${this.sql(records)} RETURNING *`;
      return { data: result, error: null };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      return { data: null, error: dbError };
    }
  }

  // Update data
  async update(data: Record<string, any>): Promise<DatabaseResponse> {
    try {
      // Set user context if available
      if (this.currentUserId) {
        await this.sql`SELECT auth.set_user_id(${this.currentUserId}::UUID)`;
      }

      // Build WHERE clause
      const whereClause = this.whereConditions.map(c => c.condition).join(' AND ');
      const whereValues = this.whereConditions.map(c => c.value).filter(v => v !== null);

      if (this.whereConditions.length === 0) {
        throw new Error('Update requires WHERE conditions');
      }

      const result = await this.sql`
        UPDATE ${this.sql(this.table)} 
        SET ${this.sql(data)} 
        WHERE ${this.sql.unsafe(whereClause, whereValues)}
        RETURNING *
      `;
      
      return { data: result, error: null };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      return { data: null, error: dbError };
    }
  }

  // Delete data
  async delete(): Promise<DatabaseResponse> {
    try {
      // Set user context if available
      if (this.currentUserId) {
        await this.sql`SELECT auth.set_user_id(${this.currentUserId}::UUID)`;
      }

      if (this.whereConditions.length === 0) {
        throw new Error('Delete requires WHERE conditions');
      }

      const whereClause = this.whereConditions.map(c => c.condition).join(' AND ');
      const whereValues = this.whereConditions.map(c => c.value).filter(v => v !== null);

      const result = await this.sql`
        DELETE FROM ${this.sql(this.table)} 
        WHERE ${this.sql.unsafe(whereClause, whereValues)}
        RETURNING *
      `;
      
      return { data: result, error: null };
    } catch (error) {
      const dbError = handleDatabaseError(error);
      return { data: null, error: dbError };
    }
  }
}

// Create and export database client instance
export const database = new DatabaseClient(sql);

// Export SQL instance for direct queries if needed
export { sql };

// Connection health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1`;
    logger.info('Database connection successful');
    return true;
  } catch (error) {
    logger.error('Database connection failed:', error);
    return false;
  }
}

// Close database connection
export async function closeDatabaseConnection(): Promise<void> {
  try {
    await sql.end();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
  }
}