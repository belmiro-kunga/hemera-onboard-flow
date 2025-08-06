// Simulados API Client with proper error handling
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
  ApiResponse, 
  PaginatedResponse, 
  QueryParams,
  ID 
} from '../types/base';
import { IHttpClient } from '../types/base';
import { errorHandler } from '../errors/handler';
import { logger } from '../logging/logger';
import { apiClient } from '../http/factory';

export class SimuladosApiClient {
  private httpClient: IHttpClient;
  private endpoint = '/api/simulados';

  constructor(httpClient?: IHttpClient) {
    this.httpClient = httpClient || apiClient;
  }

  async getAll(params?: QueryParams): Promise<Result<PaginatedResponse<Simulado>>> {
    try {
      logger.info('Fetching all simulados', { params });

      const response = await this.httpClient.get<ApiResponse<PaginatedResponse<Simulado>>>(
        this.endpoint,
        { params: this.buildQueryParams(params) }
      );

      return this.handleApiResponse(response.data);
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosApiClient',
        action: 'getAll'
      });
      logger.error('Failed to fetch simulados', error, { params });
      return failure(appError);
    }
  }

  async getById(id: ID): Promise<Result<Simulado>> {
    try {
      logger.info('Fetching simulado by ID', { id });

      const response = await this.httpClient.get<ApiResponse<Simulado>>(
        `${this.endpoint}/${id}`
      );

      return this.handleApiResponse(response.data);
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosApiClient',
        action: 'getById'
      });
      logger.error('Failed to fetch simulado', error, { id });
      return failure(appError);
    }
  }

  async create(data: CreateSimuladoDto): Promise<Result<Simulado>> {
    try {
      logger.info('Creating simulado', { title: data.title, type: data.type });

      const response = await this.httpClient.post<ApiResponse<Simulado>>(
        this.endpoint,
        data
      );

      const result = this.handleApiResponse(response.data);
      
      if (result.success) {
        logger.info('Simulado created successfully', { 
          id: result.data.id, 
          title: result.data.title,
          type: result.data.type 
        });
      }

      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosApiClient',
        action: 'create'
      });
      logger.error('Failed to create simulado', error, { title: data.title });
      return failure(appError);
    }
  }

  async update(id: ID, data: UpdateSimuladoDto): Promise<Result<Simulado>> {
    try {
      logger.info('Updating simulado', { id, changes: Object.keys(data) });

      const response = await this.httpClient.put<ApiResponse<Simulado>>(
        `${this.endpoint}/${id}`,
        data
      );

      const result = this.handleApiResponse(response.data);
      
      if (result.success) {
        logger.info('Simulado updated successfully', { 
          id: result.data.id, 
          title: result.data.title 
        });
      }

      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosApiClient',
        action: 'update'
      });
      logger.error('Failed to update simulado', error, { id });
      return failure(appError);
    }
  }

  async delete(id: ID): Promise<Result<void>> {
    try {
      logger.info('Deleting simulado', { id });

      await this.httpClient.delete(`${this.endpoint}/${id}`);

      logger.info('Simulado deleted successfully', { id });
      return success(undefined);
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosApiClient',
        action: 'delete'
      });
      logger.error('Failed to delete simulado', error, { id });
      return failure(appError);
    }
  }

  async getByType(type: SimuladoType, params?: QueryParams): Promise<Result<PaginatedResponse<Simulado>>> {
    try {
      logger.info('Fetching simulados by type', { type, params });

      const queryParams = {
        ...this.buildQueryParams(params),
        type
      };

      const response = await this.httpClient.get<ApiResponse<PaginatedResponse<Simulado>>>(
        this.endpoint,
        { params: queryParams }
      );

      return this.handleApiResponse(response.data);
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosApiClient',
        action: 'getByType'
      });
      logger.error('Failed to fetch simulados by type', error, { type });
      return failure(appError);
    }
  }

  async getByDifficulty(difficulty: DifficultyLevel, params?: QueryParams): Promise<Result<PaginatedResponse<Simulado>>> {
    try {
      logger.info('Fetching simulados by difficulty', { difficulty, params });

      const queryParams = {
        ...this.buildQueryParams(params),
        difficulty
      };

      const response = await this.httpClient.get<ApiResponse<PaginatedResponse<Simulado>>>(
        this.endpoint,
        { params: queryParams }
      );

      return this.handleApiResponse(response.data);
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosApiClient',
        action: 'getByDifficulty'
      });
      logger.error('Failed to fetch simulados by difficulty', error, { difficulty });
      return failure(appError);
    }
  }

  async getByCreator(createdBy: ID, params?: QueryParams): Promise<Result<PaginatedResponse<Simulado>>> {
    try {
      logger.info('Fetching simulados by creator', { createdBy, params });

      const queryParams = {
        ...this.buildQueryParams(params),
        createdBy
      };

      const response = await this.httpClient.get<ApiResponse<PaginatedResponse<Simulado>>>(
        this.endpoint,
        { params: queryParams }
      );

      return this.handleApiResponse(response.data);
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosApiClient',
        action: 'getByCreator'
      });
      logger.error('Failed to fetch simulados by creator', error, { createdBy });
      return failure(appError);
    }
  }

  async getPublic(params?: QueryParams): Promise<Result<PaginatedResponse<Simulado>>> {
    try {
      logger.info('Fetching public simulados', { params });

      const queryParams = {
        ...this.buildQueryParams(params),
        isPublic: true
      };

      const response = await this.httpClient.get<ApiResponse<PaginatedResponse<Simulado>>>(
        this.endpoint,
        { params: queryParams }
      );

      return this.handleApiResponse(response.data);
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosApiClient',
        action: 'getPublic'
      });
      logger.error('Failed to fetch public simulados', error);
      return failure(appError);
    }
  }

  async getWithQuestions(id: ID): Promise<Result<Simulado>> {
    try {
      logger.info('Fetching simulado with questions', { id });

      const response = await this.httpClient.get<ApiResponse<Simulado>>(
        `${this.endpoint}/${id}`,
        { params: { include: 'questions' } }
      );

      return this.handleApiResponse(response.data);
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosApiClient',
        action: 'getWithQuestions'
      });
      logger.error('Failed to fetch simulado with questions', error, { id });
      return failure(appError);
    }
  }

  async clone(id: ID, newTitle?: string): Promise<Result<Simulado>> {
    try {
      logger.info('Cloning simulado', { id, newTitle });

      const response = await this.httpClient.post<ApiResponse<Simulado>>(
        `${this.endpoint}/${id}/clone`,
        { title: newTitle }
      );

      const result = this.handleApiResponse(response.data);
      
      if (result.success) {
        logger.info('Simulado cloned successfully', { 
          originalId: id,
          newId: result.data.id, 
          newTitle: result.data.title 
        });
      }

      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosApiClient',
        action: 'clone'
      });
      logger.error('Failed to clone simulado', error, { id });
      return failure(appError);
    }
  }

  async togglePublic(id: ID): Promise<Result<Simulado>> {
    try {
      logger.info('Toggling simulado public status', { id });

      const response = await this.httpClient.patch<ApiResponse<Simulado>>(
        `${this.endpoint}/${id}/toggle-public`
      );

      const result = this.handleApiResponse(response.data);
      
      if (result.success) {
        logger.info('Simulado public status toggled', { 
          id: result.data.id, 
          isPublic: result.data.isPublic 
        });
      }

      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosApiClient',
        action: 'togglePublic'
      });
      logger.error('Failed to toggle simulado public status', error, { id });
      return failure(appError);
    }
  }

  async getStatistics(id: ID): Promise<Result<any>> {
    try {
      logger.info('Fetching simulado statistics', { id });

      const response = await this.httpClient.get<ApiResponse<any>>(
        `${this.endpoint}/${id}/statistics`
      );

      return this.handleApiResponse(response.data);
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosApiClient',
        action: 'getStatistics'
      });
      logger.error('Failed to fetch simulado statistics', error, { id });
      return failure(appError);
    }
  }

  async search(query: string, params?: QueryParams): Promise<Result<PaginatedResponse<Simulado>>> {
    try {
      logger.info('Searching simulados', { query, params });

      const searchParams = {
        ...this.buildQueryParams(params),
        search: query
      };

      const response = await this.httpClient.get<ApiResponse<PaginatedResponse<Simulado>>>(
        `${this.endpoint}/search`,
        { params: searchParams }
      );

      return this.handleApiResponse(response.data);
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'SimuladosApiClient',
        action: 'search'
      });
      logger.error('Failed to search simulados', error, { query });
      return failure(appError);
    }
  }

  // Helper methods
  private handleApiResponse<T>(response: ApiResponse<T>): Result<T> {
    if (response.success) {
      return success(response.data);
    } else {
      const appError = errorHandler.handle(response.error, {
        component: 'SimuladosApiClient',
        action: 'handleApiResponse'
      });
      return failure(appError);
    }
  }

  private buildQueryParams(params?: QueryParams): Record<string, any> {
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
}

// Export singleton instance
export const simuladosApiClient = new SimuladosApiClient();