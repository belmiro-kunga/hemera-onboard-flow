// HTTP Client factory
import { HttpClient } from './client';
import { IHttpClient, HttpClientConfig } from '../types/base';
import { getConfig } from '../config';
import { logger } from '../logging/logger';

export class HttpClientFactory {
  private static instances: Map<string, IHttpClient> = new Map();

  static create(name: string = 'default', config?: Partial<HttpClientConfig>): IHttpClient {
    // Return existing instance if available
    if (this.instances.has(name)) {
      return this.instances.get(name)!;
    }

    // Get default configuration
    const appConfig = getConfig();
    const defaultConfig: HttpClientConfig = {
      baseURL: appConfig.api.baseUrl,
      timeout: appConfig.api.timeout,
      retryAttempts: appConfig.api.retryAttempts,
      retryDelay: appConfig.api.retryDelay,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    // Merge with provided config
    const finalConfig = { ...defaultConfig, ...config };

    // Create new instance
    const client = new HttpClient(finalConfig);

    // Add common interceptors
    this.addCommonInterceptors(client, name);

    // Store instance
    this.instances.set(name, client);

    logger.info('HTTP Client created', { name, baseURL: finalConfig.baseURL });

    return client;
  }

  static get(name: string = 'default'): IHttpClient | null {
    return this.instances.get(name) || null;
  }

  static remove(name: string): boolean {
    return this.instances.delete(name);
  }

  static clear(): void {
    this.instances.clear();
  }

  private static addCommonInterceptors(client: HttpClient, name: string): void {
    // Add authentication interceptor
    client.addRequestInterceptor({
      onRequest: async (config) => {
        // Add authentication token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers = {
            ...config.headers,
            'Authorization': `Bearer ${token}`
          };
        }

        // Add client info
        config.headers = {
          ...config.headers,
          'X-Client-Name': name,
          'X-Client-Version': getConfig().version
        };

        return config;
      }
    });

    // Add error handling interceptor
    client.addResponseInterceptor({
      onResponseError: async (error) => {
        // Handle authentication errors
        if (error.response?.status === 401) {
          logger.warn('Authentication error, clearing token');
          this.clearAuthToken();
          // Optionally redirect to login
          // window.location.href = '/login';
        }

        // Handle rate limiting
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers['retry-after'];
          if (retryAfter) {
            logger.warn(`Rate limited, retry after ${retryAfter} seconds`);
          }
        }

        throw error;
      }
    });
  }

  private static getAuthToken(): string | null {
    // Get token from localStorage, sessionStorage, or other storage
    try {
      return localStorage.getItem('auth_token');
    } catch (error) {
      logger.warn('Failed to get auth token', error);
      return null;
    }
  }

  private static clearAuthToken(): void {
    try {
      localStorage.removeItem('auth_token');
    } catch (error) {
      logger.warn('Failed to clear auth token', error);
    }
  }
}

// Create default client instance
export const defaultHttpClient = HttpClientFactory.create('default');

// Create API-specific clients
export const apiClient = HttpClientFactory.create('api', {
  baseURL: getConfig().api.baseUrl
});

// Export convenience function
export function createHttpClient(name: string, config?: Partial<HttpClientConfig>): IHttpClient {
  return HttpClientFactory.create(name, config);
}