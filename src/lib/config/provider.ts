// Configuration provider implementation
import { AppConfig, ConfigValidationResult, ConfigValidationError, ConfigValidationWarning } from './types';

export class ConfigProvider {
  private static instance: ConfigProvider;
  private config: AppConfig;
  private isInitialized = false;

  private constructor() {
    this.config = this.createDefaultConfig();
  }

  static getInstance(): ConfigProvider {
    if (!ConfigProvider.instance) {
      ConfigProvider.instance = new ConfigProvider();
    }
    return ConfigProvider.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Load configuration from environment variables
      this.config = this.loadFromEnvironment();
      
      // Validate configuration
      const validation = this.validateConfig();
      if (!validation.isValid) {
        throw new Error(`Configuration validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      // Log warnings if any
      if (validation.warnings.length > 0) {
        console.warn('Configuration warnings:', validation.warnings);
      }

      this.isInitialized = true;
      console.info('Configuration initialized successfully');
    } catch (error) {
      console.error('Failed to initialize configuration:', error);
      throw error;
    }
  }

  getConfig(): AppConfig {
    if (!this.isInitialized) {
      throw new Error('Configuration not initialized. Call initialize() first.');
    }
    return { ...this.config };
  }

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.getConfig()[key];
  }

  isProduction(): boolean {
    return this.config.environment === 'production';
  }

  isDevelopment(): boolean {
    return this.config.environment === 'development';
  }

  isStaging(): boolean {
    return this.config.environment === 'staging';
  }

  private createDefaultConfig(): AppConfig {
    return {
      environment: 'development',
      version: '1.0.0',
      buildDate: new Date().toISOString(),
      api: {
        baseUrl: 'http://localhost:3001',
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000,
        enableMocking: false
      },
      database: {
        host: 'localhost',
        port: 5432,
        database: 'hemera_dev',
        ssl: false,
        connectionTimeout: 10000,
        queryTimeout: 30000
      },
      logging: {
        level: 'info',
        enableConsole: true,
        enableRemote: false,
        bufferSize: 100,
        flushInterval: 30000
      },
      features: {
        enableVideoCoursesModule: true,
        enableSimuladosModule: true,
        enableUserManagement: true,
        enableAnalytics: false,
        enableNotifications: true,
        enableCaching: true,
        enableOfflineMode: false
      },
      ui: {
        theme: 'light',
        pageSize: 10,
        debounceMs: 300,
        animationDuration: 200,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        supportedImageFormats: ['image/jpeg', 'image/png', 'image/webp'],
        supportedVideoFormats: ['video/mp4', 'video/webm']
      },
      security: {
        enableCSRF: true,
        enableCORS: true,
        corsOrigins: ['http://localhost:5173'],
        sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
        maxLoginAttempts: 5,
        passwordMinLength: 8,
        enableTwoFactor: false
      },
      performance: {
        enableCodeSplitting: true,
        enableLazyLoading: true,
        enableServiceWorker: false,
        cacheStrategy: 'stale-while-revalidate',
        maxCacheSize: 50 * 1024 * 1024, // 50MB
        preloadRoutes: ['/dashboard', '/admin/video-courses']
      }
    };
  }

  private loadFromEnvironment(): AppConfig {
    const config = this.createDefaultConfig();

    // Environment
    config.environment = (import.meta.env.VITE_NODE_ENV || 'development') as 'development' | 'staging' | 'production';
    config.version = import.meta.env.VITE_APP_VERSION || config.version;

    // API Configuration
    config.api.baseUrl = import.meta.env.VITE_API_BASE_URL || config.api.baseUrl;
    config.api.timeout = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');
    config.api.retryAttempts = parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || '3');
    config.api.enableMocking = import.meta.env.VITE_ENABLE_API_MOCKING === 'true';

    // Database Configuration
    config.database.host = import.meta.env.VITE_DB_HOST || config.database.host;
    config.database.port = parseInt(import.meta.env.VITE_DB_PORT || '5432');
    config.database.database = import.meta.env.VITE_DB_NAME || config.database.database;
    config.database.ssl = import.meta.env.VITE_DB_SSL === 'true';

    // Logging Configuration
    config.logging.level = (import.meta.env.VITE_LOG_LEVEL || 'info') as 'debug' | 'info' | 'warn' | 'error';
    config.logging.enableRemote = import.meta.env.VITE_ENABLE_REMOTE_LOGGING === 'true';
    config.logging.remoteEndpoint = import.meta.env.VITE_LOG_ENDPOINT;

    // Feature Flags
    config.features.enableVideoCoursesModule = import.meta.env.VITE_ENABLE_VIDEO_COURSES !== 'false';
    config.features.enableSimuladosModule = import.meta.env.VITE_ENABLE_SIMULADOS !== 'false';
    config.features.enableAnalytics = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';
    config.features.enableCaching = import.meta.env.VITE_ENABLE_CACHING !== 'false';

    // UI Configuration
    config.ui.theme = (import.meta.env.VITE_DEFAULT_THEME || 'light') as 'light' | 'dark' | 'auto';
    config.ui.pageSize = parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE || '10');

    // Security Configuration
    config.security.enableCSRF = import.meta.env.VITE_ENABLE_CSRF !== 'false';
    config.security.enableCORS = import.meta.env.VITE_ENABLE_CORS !== 'false';
    if (import.meta.env.VITE_CORS_ORIGINS) {
      config.security.corsOrigins = import.meta.env.VITE_CORS_ORIGINS.split(',');
    }

    // Performance Configuration
    config.performance.enableCodeSplitting = import.meta.env.VITE_ENABLE_CODE_SPLITTING !== 'false';
    config.performance.enableServiceWorker = import.meta.env.VITE_ENABLE_SERVICE_WORKER === 'true';

    return config;
  }

  private validateConfig(): ConfigValidationResult {
    const errors: ConfigValidationError[] = [];
    const warnings: ConfigValidationWarning[] = [];

    // Validate API configuration
    if (!this.config.api.baseUrl) {
      errors.push({
        path: 'api.baseUrl',
        message: 'API base URL is required'
      });
    }

    if (this.config.api.timeout < 1000) {
      warnings.push({
        path: 'api.timeout',
        message: 'API timeout is very low',
        suggestion: 'Consider using at least 5000ms'
      });
    }

    if (this.config.api.retryAttempts > 5) {
      warnings.push({
        path: 'api.retryAttempts',
        message: 'High retry attempts may cause delays',
        suggestion: 'Consider using 3 or fewer attempts'
      });
    }

    // Validate database configuration
    if (!this.config.database.host) {
      errors.push({
        path: 'database.host',
        message: 'Database host is required'
      });
    }

    if (this.config.database.port < 1 || this.config.database.port > 65535) {
      errors.push({
        path: 'database.port',
        message: 'Database port must be between 1 and 65535',
        value: this.config.database.port
      });
    }

    // Validate UI configuration
    if (this.config.ui.pageSize < 1 || this.config.ui.pageSize > 100) {
      errors.push({
        path: 'ui.pageSize',
        message: 'Page size must be between 1 and 100',
        value: this.config.ui.pageSize
      });
    }

    if (this.config.ui.debounceMs < 0) {
      errors.push({
        path: 'ui.debounceMs',
        message: 'Debounce time cannot be negative',
        value: this.config.ui.debounceMs
      });
    }

    // Validate security configuration
    if (this.config.security.passwordMinLength < 6) {
      warnings.push({
        path: 'security.passwordMinLength',
        message: 'Password minimum length is low',
        suggestion: 'Consider using at least 8 characters'
      });
    }

    if (this.config.security.sessionTimeout < 60000) { // 1 minute
      warnings.push({
        path: 'security.sessionTimeout',
        message: 'Session timeout is very short',
        suggestion: 'Consider using at least 1 hour'
      });
    }

    // Environment-specific validations
    if (this.config.environment === 'production') {
      if (this.config.logging.level === 'debug') {
        warnings.push({
          path: 'logging.level',
          message: 'Debug logging enabled in production',
          suggestion: 'Consider using "info" or "warn" level'
        });
      }

      if (!this.config.security.enableCSRF) {
        warnings.push({
          path: 'security.enableCSRF',
          message: 'CSRF protection disabled in production',
          suggestion: 'Enable CSRF protection for security'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Method to update configuration at runtime (for testing or dynamic config)
  updateConfig(updates: Partial<AppConfig>): void {
    this.config = { ...this.config, ...updates };
    
    const validation = this.validateConfig();
    if (!validation.isValid) {
      throw new Error(`Configuration update failed validation: ${validation.errors.map(e => e.message).join(', ')}`);
    }
  }

  // Method to reset configuration to defaults
  reset(): void {
    this.config = this.createDefaultConfig();
    this.isInitialized = false;
  }
}

// Export singleton instance
export const configProvider = ConfigProvider.getInstance();

// Convenience function to get configuration
export function getConfig(): AppConfig {
  return configProvider.getConfig();
}

// Convenience function to get specific config section
export function getConfigSection<K extends keyof AppConfig>(section: K): AppConfig[K] {
  return configProvider.get(section);
}