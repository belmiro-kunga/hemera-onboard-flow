// Application startup utilities and database connection validation

import { checkDatabaseConnection } from './database';
import { validateAllConfigs, getConfigSummary } from './database-config';
import { logger } from './database-utils';

export interface StartupResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  databaseConnected: boolean;
  configValid: boolean;
}

export class AppStartup {
  private static instance: AppStartup;
  private startupComplete = false;
  private startupResult: StartupResult | null = null;

  private constructor() {}

  static getInstance(): AppStartup {
    if (!AppStartup.instance) {
      AppStartup.instance = new AppStartup();
    }
    return AppStartup.instance;
  }

  async initialize(): Promise<StartupResult> {
    if (this.startupComplete && this.startupResult) {
      return this.startupResult;
    }

    logger.info('Starting application initialization...');

    const result: StartupResult = {
      success: true,
      errors: [],
      warnings: [],
      databaseConnected: false,
      configValid: false,
    };

    try {
      // 1. Validate configuration
      await this.validateConfiguration(result);

      // 2. Check database connection
      await this.validateDatabaseConnection(result);

      // 3. Perform additional startup checks
      await this.performStartupChecks(result);

      // Determine overall success
      result.success = result.errors.length === 0;

      this.startupResult = result;
      this.startupComplete = true;

      if (result.success) {
        logger.info('Application initialization completed successfully');
      } else {
        logger.error(`Application initialization failed with ${result.errors.length} errors`);
      }

      return result;
    } catch (error) {
      logger.error('Application initialization failed:', error);
      result.success = false;
      result.errors.push(`Initialization failed: ${error}`);
      return result;
    }
  }

  private async validateConfiguration(result: StartupResult): Promise<void> {
    try {
      logger.info('Validating application configuration...');

      const configValidation = validateAllConfigs();
      result.configValid = configValidation.isValid;

      if (!configValidation.isValid) {
        result.errors.push(...configValidation.errors);
        logger.error('Configuration validation failed:', configValidation.errors);
      } else {
        logger.info('Configuration validation passed');
        
        // Log configuration summary in development
        if (process.env.NODE_ENV === 'development') {
          const summary = getConfigSummary();
          logger.debug('Configuration summary:', summary);
        }
      }
    } catch (error) {
      result.errors.push(`Configuration validation failed: ${error}`);
      logger.error('Configuration validation error:', error);
    }
  }

  private async validateDatabaseConnection(result: StartupResult): Promise<void> {
    try {
      logger.info('Validating database connection...');

      const isConnected = await checkDatabaseConnection();
      result.databaseConnected = isConnected;

      if (!isConnected) {
        result.errors.push('Database connection failed');
        logger.error('Database connection validation failed');
        
        // Provide helpful instructions
        result.warnings.push('Make sure PostgreSQL is running: npm run db:start');
        result.warnings.push('Check database configuration in .env file');
      } else {
        logger.info('Database connection validation passed');
      }
    } catch (error) {
      result.errors.push(`Database connection validation failed: ${error}`);
      logger.error('Database connection validation error:', error);
    }
  }

  private async performStartupChecks(result: StartupResult): Promise<void> {
    try {
      // Check if we're in development mode
      if (process.env.NODE_ENV === 'development') {
        result.warnings.push('Running in development mode');
      }

      // Check for required environment variables
      const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
      const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

      if (missingEnvVars.length > 0) {
        result.errors.push(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
      }

      // Check JWT configuration
      if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-this-in-production') {
        result.warnings.push('JWT_SECRET should be changed from default value for security');
      }

      // Check if Supabase dependencies are still present (should be removed)
      try {
        require('@supabase/supabase-js');
        result.warnings.push('Supabase dependencies are still present - consider removing them');
      } catch {
        // This is expected - Supabase should not be available
      }

    } catch (error) {
      result.warnings.push(`Startup checks failed: ${error}`);
      logger.warn('Startup checks error:', error);
    }
  }

  getStartupResult(): StartupResult | null {
    return this.startupResult;
  }

  isStartupComplete(): boolean {
    return this.startupComplete;
  }

  async waitForStartup(timeoutMs: number = 10000): Promise<StartupResult> {
    const startTime = Date.now();

    while (!this.startupComplete && (Date.now() - startTime) < timeoutMs) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!this.startupComplete) {
      throw new Error('Startup timeout exceeded');
    }

    return this.startupResult!;
  }
}

// Create singleton instance
export const appStartup = AppStartup.getInstance();

// Utility function to initialize app
export async function initializeApp(): Promise<StartupResult> {
  return await appStartup.initialize();
}

// Utility function to check if app is ready
export function isAppReady(): boolean {
  const result = appStartup.getStartupResult();
  return result?.success === true;
}

// React hook for startup status
export function useAppStartup() {
  const [startupResult, setStartupResult] = React.useState<StartupResult | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    initializeApp().then(result => {
      setStartupResult(result);
      setIsLoading(false);
    });
  }, []);

  return {
    startupResult,
    isLoading,
    isReady: startupResult?.success === true,
    errors: startupResult?.errors || [],
    warnings: startupResult?.warnings || [],
  };
}

// For environments without React
declare global {
  var React: any;
}

if (typeof React === 'undefined') {
  // @ts-ignore
  global.React = { useState: () => [null, () => {}], useEffect: () => {} };
}