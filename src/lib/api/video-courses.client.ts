// Video Courses API Client with proper error handling
import { 
  VideoCourse, 
  CreateVideoCourseDto, 
  UpdateVideoCourseDto 
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

export class VideoCoursesApiClient {
  private httpClient: IHttpClient;
  private endpoint = '/api/video-courses';

  constructor(httpClient?: IHttpClient) {
    this.httpClient = httpClient || apiClient;
  }

  async getAll(params?: QueryParams): Promise<Result<PaginatedResponse<VideoCourse>>> {
    try {
      logger.info('Fetching all video courses', { params });

      const response = await this.httpClient.get<ApiResponse<PaginatedResponse<VideoCourse>>>(
        this.endpoint,
        { params: this.buildQueryParams(params) }
      );

      return this.handleApiResponse(response.data);
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'VideoCoursesApiClient',
        action: 'getAll'
      });
      logger.error('Failed to fetch video courses', error, { params });
      return failure(appError);
    }
  }

  async getById(id: ID): Promise<Result<VideoCourse>> {
    try {
      logger.info('Fetching video course by ID', { id });

      const response = await this.httpClient.get<ApiResponse<VideoCourse>>(
        `${this.endpoint}/${id}`
      );

      return this.handleApiResponse(response.data);
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'VideoCoursesApiClient',
        action: 'getById'
      });
      logger.error('Failed to fetch video course', error, { id });
      return failure(appError);
    }
  }

  async create(data: CreateVideoCourseDto): Promise<Result<VideoCourse>> {
    try {
      logger.info('Creating video course', { title: data.title });

      const response = await this.httpClient.post<ApiResponse<VideoCourse>>(
        this.endpoint,
        data
      );

      const result = this.handleApiResponse(response.data);
      
      if (result.success) {
        logger.info('Video course created successfully', { 
          id: result.data.id, 
          title: result.data.title 
        });
      }

      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'VideoCoursesApiClient',
        action: 'create'
      });
      logger.error('Failed to create video course', error, { title: data.title });
      return failure(appError);
    }
  }

  async update(id: ID, data: UpdateVideoCourseDto): Promise<Result<VideoCourse>> {
    try {
      logger.info('Updating video course', { id, changes: Object.keys(data) });

      const response = await this.httpClient.put<ApiResponse<VideoCourse>>(
        `${this.endpoint}/${id}`,
        data
      );

      const result = this.handleApiResponse(response.data);
      
      if (result.success) {
        logger.info('Video course updated successfully', { 
          id: result.data.id, 
          title: result.data.title 
        });
      }

      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'VideoCoursesApiClient',
        action: 'update'
      });
      logger.error('Failed to update video course', error, { id });
      return failure(appError);
    }
  }

  async delete(id: ID): Promise<Result<void>> {
    try {
      logger.info('Deleting video course', { id });

      await this.httpClient.delete(`${this.endpoint}/${id}`);

      logger.info('Video course deleted successfully', { id });
      return success(undefined);
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'VideoCoursesApiClient',
        action: 'delete'
      });
      logger.error('Failed to delete video course', error, { id });
      return failure(appError);
    }
  }

  async toggleStatus(id: ID): Promise<Result<VideoCourse>> {
    try {
      logger.info('Toggling video course status', { id });

      const response = await this.httpClient.patch<ApiResponse<VideoCourse>>(
        `${this.endpoint}/${id}/toggle-status`
      );

      const result = this.handleApiResponse(response.data);
      
      if (result.success) {
        logger.info('Video course status toggled', { 
          id: result.data.id, 
          status: result.data.status 
        });
      }

      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'VideoCoursesApiClient',
        action: 'toggleStatus'
      });
      logger.error('Failed to toggle video course status', error, { id });
      return failure(appError);
    }
  }

  async getByInstructor(instructorId: ID, params?: QueryParams): Promise<Result<PaginatedResponse<VideoCourse>>> {
    try {
      logger.info('Fetching courses by instructor', { instructorId, params });

      const queryParams = {
        ...this.buildQueryParams(params),
        instructorId
      };

      const response = await this.httpClient.get<ApiResponse<PaginatedResponse<VideoCourse>>>(
        this.endpoint,
        { params: queryParams }
      );

      return this.handleApiResponse(response.data);
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'VideoCoursesApiClient',
        action: 'getByInstructor'
      });
      logger.error('Failed to fetch courses by instructor', error, { instructorId });
      return failure(appError);
    }
  }

  async search(query: string, params?: QueryParams): Promise<Result<PaginatedResponse<VideoCourse>>> {
    try {
      logger.info('Searching video courses', { query, params });

      const searchParams = {
        ...this.buildQueryParams(params),
        search: query
      };

      const response = await this.httpClient.get<ApiResponse<PaginatedResponse<VideoCourse>>>(
        `${this.endpoint}/search`,
        { params: searchParams }
      );

      return this.handleApiResponse(response.data);
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'VideoCoursesApiClient',
        action: 'search'
      });
      logger.error('Failed to search video courses', error, { query });
      return failure(appError);
    }
  }

  async getPopular(limit: number = 10): Promise<Result<VideoCourse[]>> {
    try {
      logger.info('Fetching popular video courses', { limit });

      const response = await this.httpClient.get<ApiResponse<VideoCourse[]>>(
        `${this.endpoint}/popular`,
        { params: { limit } }
      );

      return this.handleApiResponse(response.data);
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'VideoCoursesApiClient',
        action: 'getPopular'
      });
      logger.error('Failed to fetch popular video courses', error, { limit });
      return failure(appError);
    }
  }

  async bulkUpdate(updates: Array<{ id: ID; data: UpdateVideoCourseDto }>): Promise<Result<VideoCourse[]>> {
    try {
      logger.info('Bulk updating video courses', { count: updates.length });

      const response = await this.httpClient.patch<ApiResponse<VideoCourse[]>>(
        `${this.endpoint}/bulk`,
        { updates }
      );

      const result = this.handleApiResponse(response.data);
      
      if (result.success) {
        logger.info('Video courses bulk updated successfully', { count: result.data.length });
      }

      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'VideoCoursesApiClient',
        action: 'bulkUpdate'
      });
      logger.error('Failed to bulk update video courses', error, { count: updates.length });
      return failure(appError);
    }
  }

  // Helper methods
  private handleApiResponse<T>(response: ApiResponse<T>): Result<T> {
    if (response.success) {
      return success(response.data);
    } else {
      const appError = errorHandler.handle(response.error, {
        component: 'VideoCoursesApiClient',
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
export const videoCoursesApiClient = new VideoCoursesApiClient();