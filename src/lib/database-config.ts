// Database configuration and environment setup

import { config } from 'dotenv';

// Load environment variables
config();

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  maxConnections: number;
  idleTimeout: number;
  connectTimeout: number;
  queryTimeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface JWTConfig {
  secret: string;
  expiresIn: string;
  algorithm: string;
}

export interface AppConfig {
  nodeEnv: string;
  apiUrl: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

// Database configuration
export const databaseConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'hemera_db',
  username: process.env.DB_USER || 'hemera_user',
  password: process.env.DB_PASSWORD || 'hemera_password',
  ssl: process.env.DB_SSL === 'true',
  maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
  idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '20', 10),
  connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT || '10', 10),
  queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30', 10),
  retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '3', 10),
  retryDelay: parseInt(process.env.DB_RETRY_DELAY || '1000', 10),
};

// JWT configuration
export const jwtConfig: JWTConfig = {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  algorithm: 'HS256',
};

// Application configuration
export const appConfig: AppConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  apiUrl: process.env.VITE_API_URL || 'http://localhost:3000',
  logLevel: (process.env.LOG_LEVEL as any) || (process.env.NODE_ENV === 'development' ? 'debug' : 'error'),
};

// Validation functions
export function validateDatabaseConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!databaseConfig.host) {
    errors.push('DB_HOST is required');
  }

  if (!databaseConfig.database) {
    errors.push('DB_NAME is required');
  }

  if (!databaseConfig.username) {
    errors.push('DB_USER is required');
  }

  if (!databaseConfig.password) {
    errors.push('DB_PASSWORD is required');
  }

  if (databaseConfig.port < 1 || databaseConfig.port > 65535) {
    errors.push('DB_PORT must be between 1 and 65535');
  }

  if (databaseConfig.maxConnections < 1) {
    errors.push('DB_MAX_CONNECTIONS must be greater than 0');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateJWTConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!jwtConfig.secret || jwtConfig.secret.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long');
  }

  if (jwtConfig.secret === 'your-super-secret-jwt-key-change-this-in-production') {
    errors.push('JWT_SECRET must be changed from default value');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Environment-specific configurations
export const isDevelopment = appConfig.nodeEnv === 'development';
export const isProduction = appConfig.nodeEnv === 'production';
export const isTest = appConfig.nodeEnv === 'test';

// Database URL for external tools
export const databaseUrl = `postgresql://${databaseConfig.username}:${databaseConfig.password}@${databaseConfig.host}:${databaseConfig.port}/${databaseConfig.database}`;

// Export configuration validation
export function validateAllConfigs(): { isValid: boolean; errors: string[] } {
  const dbValidation = validateDatabaseConfig();
  const jwtValidation = validateJWTConfig();

  return {
    isValid: dbValidation.isValid && jwtValidation.isValid,
    errors: [...dbValidation.errors, ...jwtValidation.errors],
  };
}

// Configuration summary for debugging
export function getConfigSummary() {
  return {
    database: {
      host: databaseConfig.host,
      port: databaseConfig.port,
      database: databaseConfig.database,
      username: databaseConfig.username,
      ssl: databaseConfig.ssl,
      maxConnections: databaseConfig.maxConnections,
    },
    app: {
      nodeEnv: appConfig.nodeEnv,
      apiUrl: appConfig.apiUrl,
      logLevel: appConfig.logLevel,
    },
    jwt: {
      expiresIn: jwtConfig.expiresIn,
      algorithm: jwtConfig.algorithm,
      secretLength: jwtConfig.secret.length,
    },
  };
}