// Configuration types and interfaces

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableMocking: boolean;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  ssl: boolean;
  connectionTimeout: number;
  queryTimeout: number;
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  bufferSize: number;
  flushInterval: number;
}

export interface FeatureFlags {
  enableVideoCoursesModule: boolean;
  enableSimuladosModule: boolean;
  enableUserManagement: boolean;
  enableAnalytics: boolean;
  enableNotifications: boolean;
  enableCaching: boolean;
  enableOfflineMode: boolean;
}

export interface UIConfig {
  theme: 'light' | 'dark' | 'auto';
  pageSize: number;
  debounceMs: number;
  animationDuration: number;
  maxFileSize: number;
  supportedImageFormats: string[];
  supportedVideoFormats: string[];
}

export interface SecurityConfig {
  enableCSRF: boolean;
  enableCORS: boolean;
  corsOrigins: string[];
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  enableTwoFactor: boolean;
}

export interface PerformanceConfig {
  enableCodeSplitting: boolean;
  enableLazyLoading: boolean;
  enableServiceWorker: boolean;
  cacheStrategy: 'cache-first' | 'network-first' | 'stale-while-revalidate';
  maxCacheSize: number;
  preloadRoutes: string[];
}

export interface AppConfig {
  environment: 'development' | 'staging' | 'production';
  version: string;
  buildDate: string;
  api: ApiConfig;
  database: DatabaseConfig;
  logging: LoggingConfig;
  features: FeatureFlags;
  ui: UIConfig;
  security: SecurityConfig;
  performance: PerformanceConfig;
}

export interface ConfigValidationResult {
  isValid: boolean;
  errors: ConfigValidationError[];
  warnings: ConfigValidationWarning[];
}

export interface ConfigValidationError {
  path: string;
  message: string;
  value?: any;
}

export interface ConfigValidationWarning {
  path: string;
  message: string;
  suggestion?: string;
}