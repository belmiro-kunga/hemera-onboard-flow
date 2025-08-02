// Database utilities for logging and error handling

export interface DatabaseError {
  message: string;
  code?: string;
  details?: any;
  hint?: string;
}

export class DatabaseLogger {
  private static instance: DatabaseLogger;
  private logLevel: 'debug' | 'info' | 'warn' | 'error';

  private constructor() {
    this.logLevel = (process.env.NODE_ENV === 'development') ? 'debug' : 'error';
  }

  static getInstance(): DatabaseLogger {
    if (!DatabaseLogger.instance) {
      DatabaseLogger.instance = new DatabaseLogger();
    }
    return DatabaseLogger.instance;
  }

  setLogLevel(level: 'debug' | 'info' | 'warn' | 'error') {
    this.logLevel = level;
  }

  private shouldLog(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  debug(message: string, data?: any) {
    if (this.shouldLog('debug')) {
      console.log(`[DB DEBUG] ${message}`, data || '');
    }
  }

  info(message: string, data?: any) {
    if (this.shouldLog('info')) {
      console.info(`[DB INFO] ${message}`, data || '');
    }
  }

  warn(message: string, data?: any) {
    if (this.shouldLog('warn')) {
      console.warn(`[DB WARN] ${message}`, data || '');
    }
  }

  error(message: string, error?: any) {
    if (this.shouldLog('error')) {
      console.error(`[DB ERROR] ${message}`, error || '');
    }
  }

  query(query: string, params?: any[]) {
    if (this.shouldLog('debug')) {
      console.log(`[DB QUERY] ${query}`, params ? `Params: ${JSON.stringify(params)}` : '');
    }
  }
}

export const logger = DatabaseLogger.getInstance();

// Error handling utilities
export function handleDatabaseError(error: any): DatabaseError {
  logger.error('Database operation failed', error);

  // PostgreSQL error codes mapping
  const errorCodeMap: Record<string, string> = {
    '23505': 'Duplicate key violation',
    '23503': 'Foreign key violation',
    '23502': 'Not null violation',
    '23514': 'Check constraint violation',
    '42P01': 'Table does not exist',
    '42703': 'Column does not exist',
    '42883': 'Function does not exist',
    '28P01': 'Invalid password',
    '3D000': 'Database does not exist',
    '08006': 'Connection failure',
    '08001': 'Unable to connect to server',
  };

  const dbError: DatabaseError = {
    message: error.message || 'Unknown database error',
    code: error.code,
    details: error.detail,
    hint: error.hint,
  };

  // Add user-friendly message for known error codes
  if (error.code && errorCodeMap[error.code]) {
    dbError.message = errorCodeMap[error.code];
  }

  return dbError;
}

// Connection pool monitoring
export class ConnectionMonitor {
  private static instance: ConnectionMonitor;
  private connectionCount = 0;
  private maxConnections = 20;

  private constructor() {}

  static getInstance(): ConnectionMonitor {
    if (!ConnectionMonitor.instance) {
      ConnectionMonitor.instance = new ConnectionMonitor();
    }
    return ConnectionMonitor.instance;
  }

  incrementConnection() {
    this.connectionCount++;
    logger.debug(`Connection opened. Active connections: ${this.connectionCount}`);
  }

  decrementConnection() {
    this.connectionCount = Math.max(0, this.connectionCount - 1);
    logger.debug(`Connection closed. Active connections: ${this.connectionCount}`);
  }

  getConnectionCount(): number {
    return this.connectionCount;
  }

  isPoolExhausted(): boolean {
    return this.connectionCount >= this.maxConnections;
  }

  getPoolStatus() {
    return {
      active: this.connectionCount,
      max: this.maxConnections,
      available: this.maxConnections - this.connectionCount,
      utilization: (this.connectionCount / this.maxConnections) * 100,
    };
  }
}

export const connectionMonitor = ConnectionMonitor.getInstance();

// Query performance monitoring
export class QueryPerformanceMonitor {
  private static instance: QueryPerformanceMonitor;
  private queryStats: Map<string, { count: number; totalTime: number; avgTime: number }> = new Map();

  private constructor() {}

  static getInstance(): QueryPerformanceMonitor {
    if (!QueryPerformanceMonitor.instance) {
      QueryPerformanceMonitor.instance = new QueryPerformanceMonitor();
    }
    return QueryPerformanceMonitor.instance;
  }

  startQuery(queryId: string): () => void {
    const startTime = Date.now();
    
    return () => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      this.recordQuery(queryId, duration);
      
      if (duration > 1000) { // Log slow queries (> 1 second)
        logger.warn(`Slow query detected: ${queryId} took ${duration}ms`);
      }
    };
  }

  private recordQuery(queryId: string, duration: number) {
    const existing = this.queryStats.get(queryId);
    
    if (existing) {
      existing.count++;
      existing.totalTime += duration;
      existing.avgTime = existing.totalTime / existing.count;
    } else {
      this.queryStats.set(queryId, {
        count: 1,
        totalTime: duration,
        avgTime: duration,
      });
    }
  }

  getStats() {
    const stats = Array.from(this.queryStats.entries()).map(([query, data]) => ({
      query,
      ...data,
    }));
    
    return stats.sort((a, b) => b.avgTime - a.avgTime);
  }

  clearStats() {
    this.queryStats.clear();
  }
}

export const performanceMonitor = QueryPerformanceMonitor.getInstance();

// Utility functions
export function sanitizeTableName(tableName: string): string {
  // Remove any potentially dangerous characters
  return tableName.replace(/[^a-zA-Z0-9_\.]/g, '');
}

export function sanitizeColumnName(columnName: string): string {
  // Remove any potentially dangerous characters
  return columnName.replace(/[^a-zA-Z0-9_]/g, '');
}

export function buildWhereClause(conditions: Record<string, any>): { clause: string; params: any[] } {
  const keys = Object.keys(conditions);
  if (keys.length === 0) {
    return { clause: '', params: [] };
  }

  const clauses = keys.map((key, index) => `${sanitizeColumnName(key)} = $${index + 1}`);
  const params = Object.values(conditions);

  return {
    clause: `WHERE ${clauses.join(' AND ')}`,
    params,
  };
}

export function formatDatabaseUrl(): string {
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '5432';
  const database = process.env.DB_NAME || 'hemera_db';
  const username = process.env.DB_USER || 'hemera_user';
  const password = process.env.DB_PASSWORD || 'hemera_password';
  
  return `postgresql://${username}:${password}@${host}:${port}/${database}`;
}

// Retry mechanism for failed queries
export async function retryQuery<T>(
  queryFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await queryFn();
    } catch (error) {
      lastError = error;
      logger.warn(`Query attempt ${attempt} failed`, error);

      if (attempt < maxRetries) {
        logger.info(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
  }

  throw lastError;
}