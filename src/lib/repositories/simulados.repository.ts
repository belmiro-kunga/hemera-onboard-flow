// Simulados Repository
import { BaseRepository } from './base';
import { 
  Simulado, 
  CreateSimuladoDto, 
  UpdateSimuladoDto,
  SimuladoType,
  DifficultyLevel 
} from '../types/entities';
import { 
  Result, 
  success, 
  failure, 
  ID, 
  QueryParams,
  PaginatedResponse 
} from '../types/base';
import { IHttpClient, ICache } from '../types/base';
import { logger } from '../logging/logger';
import { errorHandler } from '../errors/handler';

export class SimuladosRepository extends BaseRepository<Simulado, CreateSimuladoDto, UpdateSimuladoDto> {
  protected endpoint = '/api/simulados';
  protected entityName = 'Simulado';

  constructor(httpClient: IHttpClient, cache?: ICache) {
    super(httpClient, cache);
  }

  // Override cache TTL for simulados
  protected getCacheTTL(): number {
    return 10 * 60 * 1000; // 10 minutes
  }

  // Get simulados by type
  async getByType(type: SimuladoType, params?: QueryParams): Promise<Result<PaginatedResponse<Simulado>>> {
    try {
      logger.info('Fetching simulados by type', { type, params });
      
      const cacheKey = this.getCacheKey('byType', { type, ...params });
      if (this.cache && cacheKey) {
        const cached = await this.cache.get<PaginatedResponse<Simulado>>(cacheKey);
        if (cached) {
          logger.debug('Cache hit for simulados by type', { type, cacheKey });
          return success(cached);
        }
      }

      const queryParams = {
        ...this.buildQueryParams(params),
        type
      };

      const response = await this.httpClient.get<PaginatedResponse<Simulado>>(
        this.endpoint,
        { params: queryParams }
      );

      const result = this.handleResponse(response);
      
      if (result.success && this.cache && cacheKey) {
        await this.cache.set(cacheKey, result.data, this.getCacheTTL());
      }

      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosRepository',
        action: 'getByType'
      });
      logger.error('Failed to fetch simulados by type', error, { type });
      return failure(appError);
    }
  }

  // Get simulados by difficulty
  async getByDifficulty(difficulty: DifficultyLevel, params?: QueryParams): Promise<Result<PaginatedResponse<Simulado>>> {
    try {
      logger.info('Fetching simulados by difficulty', { difficulty, params });
      
      const cacheKey = this.getCacheKey('byDifficulty', { difficulty, ...params });
      if (this.cache && cacheKey) {
        const cached = await this.cache.get<PaginatedResponse<Simulado>>(cacheKey);
        if (cached) {
          logger.debug('Cache hit for simulados by difficulty', { difficulty, cacheKey });
          return success(cached);
        }
      }

      const queryParams = {
        ...this.buildQueryParams(params),
        difficulty
      };

      const response = await this.httpClient.get<PaginatedResponse<Simulado>>(
        this.endpoint,
        { params: queryParams }
      );

      const result = this.handleResponse(response);
      
      if (result.success && this.cache && cacheKey) {
        await this.cache.set(cacheKey, result.data, this.getCacheTTL());
      }

      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosRepository',
        action: 'getByDifficulty'
      });
      logger.error('Failed to fetch simulados by difficulty', error, { difficulty });
      return failure(appError);
    }
  }

  // Get simulados by creator
  async getByCreator(createdBy: ID, params?: QueryParams): Promise<Result<PaginatedResponse<Simulado>>> {
    try {
      logger.info('Fetching simulados by creator', { createdBy, params });
      
      const cacheKey = this.getCacheKey('byCreator', { createdBy, ...params });
      if (this.cache && cacheKey) {
        const cached = await this.cache.get<PaginatedResponse<Simulado>>(cacheKey);
        if (cached) {
          logger.debug('Cache hit for simulados by creator', { createdBy, cacheKey });
          return success(cached);
        }
      }

      const queryParams = {
        ...this.buildQueryParams(params),
        createdBy
      };

      const response = await this.httpClient.get<PaginatedResponse<Simulado>>(
        this.endpoint,
        { params: queryParams }
      );

      const result = this.handleResponse(response);
      
      if (result.success && this.cache && cacheKey) {
        await this.cache.set(cacheKey, result.data, this.getCacheTTL());
      }

      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosRepository',
        action: 'getByCreator'
      });
      logger.error('Failed to fetch simulados by creator', error, { createdBy });
      return failure(appError);
    }
  }

  // Get public simulados
  async getPublic(params?: QueryParams): Promise<Result<PaginatedResponse<Simulado>>> {
    try {
      logger.info('Fetching public simulados', { params });
      
      const cacheKey = this.getCacheKey('public', params);
      if (this.cache && cacheKey) {
        const cached = await this.cache.get<PaginatedResponse<Simulado>>(cacheKey);
        if (cached) {
          logger.debug('Cache hit for public simulados', { cacheKey });
          return success(cached);
        }
      }

      const queryParams = {
        ...this.buildQueryParams(params),
        isPublic: true
      };

      const response = await this.httpClient.get<PaginatedResponse<Simulado>>(
        this.endpoint,
        { params: queryParams }
      );

      const result = this.handleResponse(response);
      
      if (result.success && this.cache && cacheKey) {
        await this.cache.set(cacheKey, result.data, this.getCacheTTL());
      }

      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosRepository',
        action: 'getPublic'
      });
      logger.error('Failed to fetch public simulados', error);
      return failure(appError);
    }
  }

  // Get simulado with questions
  async getWithQuestions(id: ID): Promise<Result<Simulado>> {
    try {
      logger.info('Fetching simulado with questions', { id });
      
      const cacheKey = this.getCacheKey('withQuestions', { id });
      if (this.cache && cacheKey) {
        const cached = await this.cache.get<Simulado>(cacheKey);
        if (cached) {
          logger.debug('Cache hit for simulado with questions', { id, cacheKey });
          return success(cached);
        }
      }

      const response = await this.httpClient.get<Simulado>(
        `${this.endpoint}/${id}`,
        { params: { include: 'questions' } }
      );

      const result = this.handleResponse(response);
      
      if (result.success && this.cache && cacheKey) {
        await this.cache.set(cacheKey, result.data, this.getCacheTTL());
      }

      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosRepository',
        action: 'getWithQuestions'
      });
      logger.error('Failed to fetch simulado with questions', error, { id });
      return failure(appError);
    }
  }

  // Clone simulado
  async clone(id: ID, newTitle?: string): Promise<Result<Simulado>> {
    try {
      logger.info('Cloning simulado', { id, newTitle });
      
      const response = await this.httpClient.post<Simulado>(
        `${this.endpoint}/${id}/clone`,
        { title: newTitle }
      );

      const result = this.handleResponse(response);
      
      if (result.success && this.cache) {
        await this.invalidateCache();
        logger.debug('Invalidated cache after cloning simulado', { id });
      }

      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosRepository',
        action: 'clone'
      });
      logger.error('Failed to clone simulado', error, { id });
      return failure(appError);
    }
  }

  // Toggle public status
  async togglePublic(id: ID): Promise<Result<Simulado>> {
    try {
      logger.info('Toggling simulado public status', { id });
      
      const response = await this.httpClient.patch<Simulado>(
        `${this.endpoint}/${id}/toggle-public`
      );

      const result = this.handleResponse(response);
      
      if (result.success && this.cache) {
        await this.invalidateCache(id);
        logger.debug('Invalidated cache after toggling public status', { id });
      }

      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosRepository',
        action: 'togglePublic'
      });
      logger.error('Failed to toggle simulado public status', error, { id });
      return failure(appError);
    }
  }

  // Get simulado statistics
  async getStatistics(id: ID): Promise<Result<any>> {
    try {
      logger.info('Fetching simulado statistics', { id });
      
      const cacheKey = this.getCacheKey('statistics', { id });
      if (this.cache && cacheKey) {
        const cached = await this.cache.get<any>(cacheKey);
        if (cached) {
          logger.debug('Cache hit for simulado statistics', { id, cacheKey });
          return success(cached);
        }
      }

      const response = await this.httpClient.get<any>(
        `${this.endpoint}/${id}/statistics`
      );

      const result = this.handleResponse(response);
      
      if (result.success && this.cache && cacheKey) {
        // Cache statistics for shorter time (5 minutes)
        await this.cache.set(cacheKey, result.data, 5 * 60 * 1000);
      }

      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosRepository',
        action: 'getStatistics'
      });
      logger.error('Failed to fetch simulado statistics', error, { id });
      return failure(appError);
    }
  }

  // Search simulados
  async search(query: string, params?: QueryParams): Promise<Result<PaginatedResponse<Simulado>>> {
    try {
      logger.info('Searching simulados', { query, params });
      
      const searchParams = {
        ...this.buildQueryParams(params),
        search: query
      };

      const response = await this.httpClient.get<PaginatedResponse<Simulado>>(
        `${this.endpoint}/search`,
        { params: searchParams }
      );

      return this.handleResponse(response);
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosRepository',
        action: 'search'
      });
      logger.error('Failed to search simulados', error, { query });
      return failure(appError);
    }
  }

  // Override hooks for business logic
  protected async beforeCreate(data: CreateSimuladoDto): Promise<CreateSimuladoDto> {
    // Ensure default values
    return {
      ...data,
      tags: data.tags || [],
      maxAttempts: data.maxAttempts || 3
    };
  }

  protected async afterCreate(entity: Simulado): Promise<Simulado> {
    logger.info('Simulado created successfully', { 
      id: entity.id, 
      title: entity.title,
      type: entity.type,
      createdBy: entity.createdBy 
    });
    return entity;
  }

  protected async beforeUpdate(id: ID, data: UpdateSimuladoDto): Promise<UpdateSimuladoDto> {
    logger.info('Updating simulado', { id, changes: Object.keys(data) });
    return data;
  }

  protected async afterUpdate(entity: Simulado): Promise<Simulado> {
    logger.info('Simulado updated successfully', { 
      id: entity.id, 
      title: entity.title,
      status: entity.status 
    });
    return entity;
  }

  protected async beforeDelete(id: ID): Promise<void> {
    logger.warn('Deleting simulado', { id });
  }

  protected async afterDelete(id: ID): Promise<void> {
    logger.info('Simulado deleted successfully', { id });
  }
}