// PostgreSQL Database Connection
import { logger } from '../logging/logger';

// Database configuration interface
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

// Default configuration (will be overridden by environment variables)
const defaultConfig: DatabaseConfig = {
  host: import.meta.env.VITE_DB_HOST || 'localhost',
  port: parseInt(import.meta.env.VITE_DB_PORT || '5432'),
  database: import.meta.env.VITE_DB_NAME || 'hemera_onboard',
  user: import.meta.env.VITE_DB_USER || 'postgres',
  password: import.meta.env.VITE_DB_PASSWORD || '',
  ssl: import.meta.env.VITE_DB_SSL === 'true',
  max: parseInt(import.meta.env.VITE_DB_MAX_CONNECTIONS || '20'),
  idleTimeoutMillis: parseInt(import.meta.env.VITE_DB_IDLE_TIMEOUT || '30000'),
  connectionTimeoutMillis: parseInt(import.meta.env.VITE_DB_CONNECTION_TIMEOUT || '2000'),
};

// Mock database for development when PostgreSQL is not available
class MockDatabase {
  async query(text: string, params?: any[]) {
    logger.debug('Mock database query', { query: text, params });
    return { rows: [], rowCount: 0 };
  }

  async connect() {
    return {
      query: this.query.bind(this),
      release: () => logger.debug('Mock client released')
    };
  }

  on(event: string, callback: Function) {
    // Mock event handler
  }

  async end() {
    logger.debug('Mock database pool ended');
  }

  get totalCount() { return 0; }
  get idleCount() { return 0; }
  get waitingCount() { return 0; }
}

// Try to import PostgreSQL driver, fallback to mock if not available
let Pool: any;
let pool: any;

try {
  // Use require for synchronous import
  const { Pool: PgPool } = require('pg');
  Pool = PgPool;
  pool = new Pool(defaultConfig);
  
  // Handle pool errors
  pool.on('error', (err: Error) => {
    logger.error('Unexpected error on idle client', err);
  });
  
  logger.info('PostgreSQL connection pool initialized');
} catch (error) {
  logger.warn('PostgreSQL driver not available, using mock database for development');
  Pool = MockDatabase;
  pool = new MockDatabase();
}

// Database connection wrapper
export class Database {
  private pool: any;

  constructor(poolInstance?: any) {
    this.pool = poolInstance || pool;
    
    // Log connection info
    logger.info('Database connection wrapper initialized');
  }

  // Execute a query
  async query(text: string, params?: any[]) {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      logger.debug('Database query executed', {
        query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        duration: `${duration}ms`,
        rows: result.rowCount
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error('Database query failed', error as Error, {
        query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        duration: `${duration}ms`,
        params: params ? '[PARAMS_PROVIDED]' : 'NO_PARAMS'
      });
      throw error;
    }
  }

  // Get a client from the pool for transactions
  async getClient() {
    try {
      const client = await this.pool.connect();
      logger.debug('Database client acquired from pool');
      return client;
    } catch (error) {
      logger.error('Failed to acquire database client', error as Error);
      throw error;
    }
  }

  // Execute a transaction
  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      logger.debug('Database transaction started');
      
      const result = await callback(client);
      
      await client.query('COMMIT');
      logger.debug('Database transaction committed');
      
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Database transaction rolled back', error as Error);
      throw error;
    } finally {
      client.release();
      logger.debug('Database client released');
    }
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.query('SELECT NOW() as current_time');
      logger.info('Database connection test successful', {
        serverTime: result.rows[0]?.current_time
      });
      return true;
    } catch (error) {
      logger.error('Database connection test failed', error as Error);
      return false;
    }
  }

  // Close all connections
  async close(): Promise<void> {
    try {
      await this.pool.end();
      logger.info('Database connection pool closed');
    } catch (error) {
      logger.error('Error closing database connection pool', error as Error);
      throw error;
    }
  }

  // Get pool status
  getPoolStatus() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount
    };
  }
}

// Create and export default database instance
export const database = new Database();

// Conditionally export Pool if available
let PgPool: any;
try {
  PgPool = require('pg').Pool;
} catch {
  PgPool = MockDatabase;
}
export { PgPool as Pool };

// Helper function to create a new database instance with custom config
export function createDatabase(config?: Partial<DatabaseConfig>): Database {
  if (config) {
    try {
      const customPool = new Pool({ ...defaultConfig, ...config });
      return new Database(customPool);
    } catch {
      return new Database(new MockDatabase());
    }
  }
  return new Database();
}

// Utility function for safe database operations
export async function withDatabase<T>(
  operation: (db: Database) => Promise<T>
): Promise<T> {
  try {
    return await operation(database);
  } catch (error) {
    logger.error('Database operation failed', error as Error);
    throw error;
  }
}