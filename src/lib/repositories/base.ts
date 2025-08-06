// Base repository implementation
import { 
  IRepository, 
  ID, 
  Result, 
  success, 
  failure, 
  PaginatedResponse, 
  QueryParams 
} from '../types/base';
import { IHttpClient, HttpResponse } from '../types/base';
import { errorHandler } from '../errors/handler';
import { logger } from '../logging/logger';
import { ICache } from '../types/base';

export abstract class BaseRepository<T, CreateT = Partial<T>, UpdateT = Partial<T>> 
  implements IRepository<T, CreateT, UpdateT> {
  
  protected abstract endpoint: string;
  protected abstract entityName: string;
  
  constructor(
    protected httpClient: IHttpClient,
    protected cache?: ICache
  ) {}

  async getAll(params?: QueryParams): Promise<Result<PaginatedResponse<T>>> {
    try {
      logger.info(`Fetching all ${this.entityName}`, { params });
      
      // Check cache first if available
      const cacheKey = this.getCacheKey('all', params);
      if (this.cache && cacheKey) {
        const cached = await this.cache.get<PaginatedResponse<T>>(cacheKey);
        if (cached) {
          logger.debug(`Cache hit for ${this.entityName}`, { cacheKey });
          return success(cached);
        }
      }

      const response = await this.httpClient.get<PaginatedResponse<T>>(
        this.endpoint,
        { params: this.buildQueryParams(params) }
      );

      const result = this.handleResponse(response);
      
      // Cache the result if successful
      if (result.success && this.cache && cacheKey) {
        await this.cache.set(cacheKey, result.data, this.getCacheTTL());
        logger.debug(`Cached ${this.entityName} data`, { cacheKey });
      }

      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: `${this.entityName}Repository`,
        action: 'getAll'
      });
      logger.error(`Failed to fetch ${this.entityName}`, error, { params });
      return failure(appError);
    }
  }

  async getById(id: ID): Promise<Result<T>> {
    try {
      logger.info(`Fetching ${this.entityName} by ID`, { id });
      
      // Check cache first
      const cacheKey = this.getCacheKey('byId', { id });
      if (this.cache && cacheKey) {
        const cached = await this.cache.get<T>(cacheKey);
        if (cached) {
          logger.debug(`Cache hit for ${this.entityName}`, { id, cacheKey });
          return success(cached);
        }
      }

      const response = await this.httpClient.get<T>(`${this.endpoint}/${id}`);
      const result = this.handleResponse(response);
      
      // Cache the result if successful
      if (result.success && this.cache && cacheKey) {
        await this.cache.set(cacheKey, result.data, this.getCacheTTL());
        logger.debug(`Cached ${this.entityName}`, { id, cacheKey });
      }

      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: `${this.entityName}Repository`,
        action: 'getById'
      });
      logger.error(`Failed to fetch ${this.entityName}`, error, { id });
      return failure(appError);
    }
  }

  async create(data: CreateT): Promise<Result<T>> {
    try {
      logger.info(`Creating ${this.entityName}`, { data });
      
      const response = await this.httpClient.post<T>(this.endpoint, data);
      const result = this.handleResponse(response);
      
      // Invalidate related cache entries
      if (result.success && this.cache) {
        await this.invalidateCache();
        logger.debug(`Invalidated cache after creating ${this.entityName}`);
      }

      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: `${this.entityName}Repository`,
        action: 'create'
      });
      logger.error(`Failed to create ${this.entityName}`, error, { data });
      return failure(appError);
    }
  }

  async update(id: ID, data: UpdateT): Promise<Result<T>> {
    try {
      logger.info(`Updating ${this.entityName}`, { id, data });
      
      const response = await this.httpClient.put<T>(`${this.endpoint}/${id}`, data);
      const result = this.handleResponse(response);
      
      // Invalidate related cache entries
      if (result.success && this.cache) {
        await this.invalidateCache(id);
        logger.debug(`Invalidated cache after updating ${this.entityName}`, { id });
      }

      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: `${this.entityName}Repository`,
        action: 'update'
      });
      logger.error(`Failed to update ${this.entityName}`, error, { id, data });
      return failure(appError);
    }
  }

  async delete(id: ID): Promise<Result<void>> {
    try {
      logger.info(`Deleting ${this.entityName}`, { id });
      
      const response = await this.httpClient.delete(`${this.endpoint}/${id}`);
      
      if (response.status >= 200 && response.status < 300) {
        // Invalidate related cache entries
        if (this.cache) {
          await this.invalidateCache(id);
          logger.debug(`Invalidated cache after deleting ${this.entityName}`, { id });
        }
        
        return success(undefined);
      } else {
        const appError = errorHandler.createFromHttpStatus(response.status, response.statusText);
        return failure(appError);
      }
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: `${this.entityName}Repository`,
        action: 'delete'
      });
      logger.error(`Failed to delete ${this.entityName}`, error, { id });
      return failure(appError);
    }
  }

  async exists(id: ID): Promise<Result<boolean>> {
    try {
      logger.debug(`Checking if ${this.entityName} exists`, { id });
      
      const response = await this.httpClient.get(`${this.endpoint}/${id}/exists`);
      
      if (response.status === 200) {
        return success(true);
      } else if (response.status === 404) {
        return success(false);
      } else {
        const appError = errorHandler.createFromHttpStatus(response.status, response.statusText);
        return failure(appError);
      }
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: `${this.entityName}Repository`,
        action: 'exists'
      });
      logger.error(`Failed to check ${this.entityName} existence`, error, { id });
      return failure(appError);
    }
  }

  async count(filters?: Record<string, any>): Promise<Result<number>> {
    try {
      logger.debug(`Counting ${this.entityName}`, { filters });
      
      const response = await this.httpClient.get<{ count: number }>(
        `${this.endpoint}/count`,
        { params: filters }
      );
      
      const result = this.handleResponse(response);
      if (result.success) {
        return success(result.data.count);
      }
      
      return failure(result.error);
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: `${this.entityName}Repository`,
        action: 'count'
      });
      logger.error(`Failed to count ${this.entityName}`, error, { filters });
      return failure(appError);
    }
  }

  // Protected helper methods
  protected handleResponse<R>(response: HttpResponse<R>): Result<R> {
    if (response.status >= 200 && response.status < 300) {
      return success(response.data);
    } else {
      const appError = errorHandler.createFromHttpStatus(response.status, response.statusText);
      return failure(appError);
    }
  }

  protected buildQueryParams(params?: QueryParams): Record<string, any> {
    if (!params) return {};

    const queryParams: Record<string, any> = {};

    if (params.page !== undefined) queryParams.page = params.page;
    if (params.limit !== undefined) queryParams.limit = params.limit;
    if (params.search) queryParams.search = params.search;
    if (params.sort) {
      queryParams.sortBy = params.sort.field;
      queryParams.sortOrder = params.sort.direction;
    }
    if (params.filters) {
      Object.assign(queryParams, params.filters);
    }
    if (params.include) {
      queryParams.include = params.include.join(',');
    }

    return queryParams;
  }

  protected getCacheKey(operation: string, params?: any): string | null {
    if (!this.cache) return null;
    
    const baseKey = `${this.entityName}:${operation}`;
    
    if (!params) return baseKey;
    
    // Create a stable key from parameters
    const paramString = JSON.stringify(params, Object.keys(params).sort());
    const paramHash = this.simpleHash(paramString);
    
    return `${baseKey}:${paramHash}`;
  }

  protected getCacheTTL(): number {
    // Default cache TTL of 5 minutes
    return 5 * 60 * 1000;
  }

  protected async invalidateCache(id?: ID): Promise<void> {
    if (!this.cache) return;

    try {
      // Invalidate all cache entries for this entity
      // This is a simple approach - in production, you might want more granular invalidation
      const patterns = [
        `${this.entityName}:all:*`,
        `${this.entityName}:count:*`
      ];

      if (id) {
        patterns.push(`${this.entityName}:byId:*${id}*`);
      }

      // Note: This assumes cache implementation supports pattern-based deletion
      // If not, you might need to track cache keys separately
      for (const pattern of patterns) {
        await this.cache.delete(pattern);
      }
    } catch (error) {
      logger.warn('Failed to invalidate cache', error, { entityName: this.entityName, id });
    }
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Additional utility methods that can be overridden by specific repositories
  protected async beforeCreate(data: CreateT): Promise<CreateT> {
    return data;
  }

  protected async afterCreate(entity: T): Promise<T> {
    return entity;
  }

  protected async beforeUpdate(id: ID, data: UpdateT): Promise<UpdateT> {
    return data;
  }

  protected async afterUpdate(entity: T): Promise<T> {
    return entity;
  }

  protected async beforeDelete(id: ID): Promise<void> {
    // Override in specific repositories if needed
  }

  protected async afterDelete(id: ID): Promise<void> {
    // Override in specific repositories if needed
  }
}