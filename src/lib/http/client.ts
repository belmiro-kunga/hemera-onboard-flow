// HTTP Client implementation with retry logic and interceptors
import { 
  IHttpClient, 
  HttpResponse, 
  RequestConfig, 
  HttpClientConfig 
} from '../types/base';
import { errorHandler } from '../errors/handler';
import { logger } from '../logging/logger';
import { generateRequestId } from '../utils/request-id';

export interface RequestInterceptor {
  onRequest?: (config: RequestConfig & { url: string; method: string }) => Promise<RequestConfig & { url: string; method: string }>;
  onRequestError?: (error: any) => Promise<any>;
}

export interface ResponseInterceptor {
  onResponse?: (response: HttpResponse) => Promise<HttpResponse>;
  onResponseError?: (error: any) => Promise<any>;
}

export class HttpClient implements IHttpClient {
  private config: HttpClientConfig;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(config: HttpClientConfig) {
    this.config = {
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    };

    // Add default request interceptor for logging and request ID
    this.addRequestInterceptor({
      onRequest: async (config) => {
        const requestId = generateRequestId();
        
        // Add request ID to headers
        config.headers = {
          ...config.headers,
          'X-Request-ID': requestId
        };

        logger.info('HTTP Request', {
          method: config.method,
          url: config.url,
          requestId,
          headers: this.sanitizeHeaders(config.headers)
        });

        return config;
      },
      onRequestError: async (error) => {
        logger.error('HTTP Request Error', error);
        throw error;
      }
    });

    // Add default response interceptor for logging
    this.addResponseInterceptor({
      onResponse: async (response) => {
        const requestId = response.headers['x-request-id'] || 'unknown';
        
        logger.info('HTTP Response', {
          status: response.status,
          statusText: response.statusText,
          requestId,
          responseTime: this.getResponseTime(response)
        });

        return response;
      },
      onResponseError: async (error) => {
        const requestId = error.response?.headers?.['x-request-id'] || 'unknown';
        
        logger.error('HTTP Response Error', error, {
          status: error.response?.status,
          statusText: error.response?.statusText,
          requestId
        });

        throw error;
      }
    });
  }

  async get<T>(url: string, config?: RequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>('GET', url, undefined, config);
  }

  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>('POST', url, data, config);
  }

  async put<T>(url: string, data?: any, config?: RequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>('PUT', url, data, config);
  }

  async patch<T>(url: string, data?: any, config?: RequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>('PATCH', url, data, config);
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>('DELETE', url, undefined, config);
  }

  private async request<T>(
    method: string,
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<HttpResponse<T>> {
    const fullUrl = this.buildUrl(url);
    const requestConfig = this.buildRequestConfig(method, fullUrl, data, config);

    return this.executeWithRetry(async () => {
      // Apply request interceptors
      let processedConfig = requestConfig;
      for (const interceptor of this.requestInterceptors) {
        if (interceptor.onRequest) {
          try {
            processedConfig = await interceptor.onRequest(processedConfig);
          } catch (error) {
            if (interceptor.onRequestError) {
              await interceptor.onRequestError(error);
            }
            throw error;
          }
        }
      }

      // Make the actual HTTP request
      const startTime = Date.now();
      let response: HttpResponse<T>;

      try {
        response = await this.makeRequest<T>(processedConfig);
        response.headers['x-response-time'] = (Date.now() - startTime).toString();
      } catch (error) {
        // Apply response error interceptors
        for (const interceptor of this.responseInterceptors) {
          if (interceptor.onResponseError) {
            try {
              await interceptor.onResponseError(error);
            } catch (interceptorError) {
              // Log interceptor errors but don't throw
              logger.warn('Response interceptor error', interceptorError);
            }
          }
        }
        throw error;
      }

      // Apply response interceptors
      let processedResponse = response;
      for (const interceptor of this.responseInterceptors) {
        if (interceptor.onResponse) {
          try {
            processedResponse = await interceptor.onResponse(processedResponse);
          } catch (error) {
            if (interceptor.onResponseError) {
              await interceptor.onResponseError(error);
            }
            throw error;
          }
        }
      }

      return processedResponse;
    });
  }

  private async makeRequest<T>(config: RequestConfig & { url: string; method: string; data?: any }): Promise<HttpResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout || this.config.timeout);

    try {
      const fetchConfig: RequestInit = {
        method: config.method,
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers,
          ...config.headers
        },
        signal: controller.signal
      };

      if (config.data && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
        fetchConfig.body = JSON.stringify(config.data);
      }

      // Add query parameters for GET requests
      let requestUrl = config.url;
      if (config.params && Object.keys(config.params).length > 0) {
        const searchParams = new URLSearchParams();
        Object.entries(config.params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
        requestUrl += `?${searchParams.toString()}`;
      }

      const response = await fetch(requestUrl, fetchConfig);
      
      let data: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text() as unknown as T;
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: this.parseHeaders(response.headers)
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: any;
    const maxAttempts = this.config.retryAttempts || 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Don't retry on client errors (4xx) except 408, 429
        if (this.isClientError(error) && !this.isRetryableClientError(error)) {
          throw error;
        }

        // Don't retry on the last attempt
        if (attempt === maxAttempts) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = this.calculateRetryDelay(attempt);
        
        logger.warn(`HTTP request failed, retrying in ${delay}ms`, error, {
          attempt,
          maxAttempts,
          url: error.config?.url
        });

        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  private isClientError(error: any): boolean {
    const status = error.response?.status || error.status;
    return status >= 400 && status < 500;
  }

  private isRetryableClientError(error: any): boolean {
    const status = error.response?.status || error.status;
    // Retry on timeout (408) and rate limit (429)
    return status === 408 || status === 429;
  }

  private calculateRetryDelay(attempt: number): number {
    const baseDelay = this.config.retryDelay || 1000;
    // Exponential backoff with jitter
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 0.1 * exponentialDelay;
    return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private buildUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    const baseURL = this.config.baseURL.endsWith('/') 
      ? this.config.baseURL.slice(0, -1) 
      : this.config.baseURL;
    
    const path = url.startsWith('/') ? url : `/${url}`;
    
    return `${baseURL}${path}`;
  }

  private buildRequestConfig(
    method: string,
    url: string,
    data?: any,
    config?: RequestConfig
  ): RequestConfig & { url: string; method: string; data?: any } {
    return {
      method,
      url,
      data,
      headers: config?.headers || {},
      params: config?.params || {},
      timeout: config?.timeout || this.config.timeout
    };
  }

  private parseHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key.toLowerCase()] = value;
    });
    return result;
  }

  private sanitizeHeaders(headers?: Record<string, string>): Record<string, string> {
    if (!headers) return {};
    
    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    
    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  private getResponseTime(response: HttpResponse): string {
    return response.headers['x-response-time'] || '0';
  }

  // Public methods for managing interceptors
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  removeRequestInterceptor(interceptor: RequestInterceptor): void {
    const index = this.requestInterceptors.indexOf(interceptor);
    if (index > -1) {
      this.requestInterceptors.splice(index, 1);
    }
  }

  removeResponseInterceptor(interceptor: ResponseInterceptor): void {
    const index = this.responseInterceptors.indexOf(interceptor);
    if (index > -1) {
      this.responseInterceptors.splice(index, 1);
    }
  }

  // Method to update configuration
  updateConfig(newConfig: Partial<HttpClientConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Method to get current configuration
  getConfig(): HttpClientConfig {
    return { ...this.config };
  }
}