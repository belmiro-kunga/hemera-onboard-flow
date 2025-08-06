// Video Courses Repository
import { BaseRepository } from './base';
import { 
  VideoCourse, 
  CreateVideoCourseDto, 
  UpdateVideoCourseDto,
  CourseStatus 
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

export class VideoCoursesRepository extends BaseRepository<VideoCourse, CreateVideoCourseDto, UpdateVideoCourseDto> {
  protected endpoint = '/api/video-courses';
  protected entityName = 'VideoCourse';

  constructor(httpClient: IHttpClient, cache?: ICache) {
    super(httpClient, cache);
  }

  // Override cache TTL for courses (longer cache time)
  protected getCacheTTL(): number {
    return 15 * 60 * 1000; // 15 minutes
  }

  // Get courses by instructor
  async getByInstructor(instructorId: ID, params?: QueryParams): Promise<Result<PaginatedResponse<VideoCourse>>> {
    try {
      logger.info('Fetching courses by instructor', { instructorId, params });
      
      const cacheKey = this.getCacheKey('byInstructor', { instructorId, ...params });
      if (this.cache && cacheKey) {
        const cached = await this.cache.get<PaginatedResponse<VideoCourse>>(cacheKey);
        if (cached) {
          logger.debug('Cache hit for courses by instructor', { instructorId, cacheKey });
          return success(cached);
        }
      }

      const queryParams = {
        ...this.buildQueryParams(params),
        instructorId
      };

      const response = await this.httpClient.get<PaginatedResponse<VideoCourse>>(
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
        component: 'VideoCoursesRepository',
        action: 'getByInstructor'
      });
      logger.error('Failed to fetch courses by instructor', error, { instructorId });
      return failure(appError);
    }
  }

  // Get courses by status
  async getByStatus(status: CourseStatus, params?: QueryParams): Promise<Result<PaginatedResponse<VideoCourse>>> {
    try {
      logger.info('Fetching courses by status', { status, params });
      
      const cacheKey = this.getCacheKey('byStatus', { status, ...params });
      if (this.cache && cacheKey) {
        const cached = await this.cache.get<PaginatedResponse<VideoCourse>>(cacheKey);
        if (cached) {
          logger.debug('Cache hit for courses by status', { status, cacheKey });
          return success(cached);
        }
      }

      const queryParams = {
        ...this.buildQueryParams(params),
        status
      };

      const response = await this.httpClient.get<PaginatedResponse<VideoCourse>>(
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
        component: 'VideoCoursesRepository',
        action: 'getByStatus'
      });
      logger.error('Failed to fetch courses by status', error, { status });
      return failure(appError);
    }
  }

  // Toggle course status
  async toggleStatus(id: ID): Promise<Result<VideoCourse>> {
    try {
      logger.info('Toggling course status', { id });
      
      const response = await this.httpClient.patch<VideoCourse>(
        `${this.endpoint}/${id}/toggle-status`
      );

      const result = this.handleResponse(response);
      
      if (result.success && this.cache) {
        await this.invalidateCache(id);
        logger.debug('Invalidated cache after toggling course status', { id });
      }

      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'VideoCoursesRepository',
        action: 'toggleStatus'
      });
      logger.error('Failed to toggle course status', error, { id });
      return failure(appError);
    }
  }

  // Get course with lessons
  async getWithLessons(id: ID): Promise<Result<VideoCourse>> {
    try {
      logger.info('Fetching course with lessons', { id });
      
      const cacheKey = this.getCacheKey('withLessons', { id });
      if (this.cache && cacheKey) {
        const cached = await this.cache.get<VideoCourse>(cacheKey);
        if (cached) {
          logger.debug('Cache hit for course with lessons', { id, cacheKey });
          return success(cached);
        }
      }

      const response = await this.httpClient.get<VideoCourse>(
        `${this.endpoint}/${id}`,
        { params: { include: 'lessons' } }
      );

      const result = this.handleResponse(response);
      
      if (result.success && this.cache && cacheKey) {
        await this.cache.set(cacheKey, result.data, this.getCacheTTL());
      }

      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'VideoCoursesRepository',
        action: 'getWithLessons'
      });
      logger.error('Failed to fetch course with lessons', error, { id });
      return failure(appError);
    }
  }

  // Search courses
  async search(query: string, params?: QueryParams): Promise<Result<PaginatedResponse<VideoCourse>>> {
    try {
      logger.info('Searching courses', { query, params });
      
      const searchParams = {
        ...this.buildQueryParams(params),
        search: query
      };

      const response = await this.httpClient.get<PaginatedResponse<VideoCourse>>(
        `${this.endpoint}/search`,
        { params: searchParams }
      );

      return this.handleResponse(response);
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'VideoCoursesRepository',
        action: 'search'
      });
      logger.error('Failed to search courses', error, { query });
      return failure(appError);
    }
  }

  // Get popular courses
  async getPopular(limit: number = 10): Promise<Result<VideoCourse[]>> {
    try {
      logger.info('Fetching popular courses', { limit });
      
      const cacheKey = this.getCacheKey('popular', { limit });
      if (this.cache && cacheKey) {
        const cached = await this.cache.get<VideoCourse[]>(cacheKey);
        if (cached) {
          logger.debug('Cache hit for popular courses', { limit, cacheKey });
          return success(cached);
        }
      }

      const response = await this.httpClient.get<VideoCourse[]>(
        `${this.endpoint}/popular`,
        { params: { limit } }
      );

      const result = this.handleResponse(response);
      
      if (result.success && this.cache && cacheKey) {
        // Cache popular courses for longer (30 minutes)
        await this.cache.set(cacheKey, result.data, 30 * 60 * 1000);
      }

      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'VideoCoursesRepository',
        action: 'getPopular'
      });
      logger.error('Failed to fetch popular courses', error, { limit });
      return failure(appError);
    }
  }

  // Bulk update courses
  async bulkUpdate(updates: Array<{ id: ID; data: UpdateVideoCourseDto }>): Promise<Result<VideoCourse[]>> {
    try {
      logger.info('Bulk updating courses', { count: updates.length });
      
      const response = await this.httpClient.patch<VideoCourse[]>(
        `${this.endpoint}/bulk`,
        { updates }
      );

      const result = this.handleResponse(response);
      
      if (result.success && this.cache) {
        // Invalidate cache for all updated courses
        for (const update of updates) {
          await this.invalidateCache(update.id);
        }
        logger.debug('Invalidated cache after bulk update', { count: updates.length });
      }

      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'VideoCoursesRepository',
        action: 'bulkUpdate'
      });
      logger.error('Failed to bulk update courses', error, { count: updates.length });
      return failure(appError);
    }
  }

  // Override hooks for business logic
  protected async beforeCreate(data: CreateVideoCourseDto): Promise<CreateVideoCourseDto> {
    // Ensure default values
    return {
      ...data,
      currency: data.currency || 'BRL',
      tags: data.tags || []
    };
  }

  protected async afterCreate(entity: VideoCourse): Promise<VideoCourse> {
    logger.info('Course created successfully', { 
      id: entity.id, 
      title: entity.title,
      instructorId: entity.instructorId 
    });
    return entity;
  }

  protected async beforeUpdate(id: ID, data: UpdateVideoCourseDto): Promise<UpdateVideoCourseDto> {
    // Log the update for audit purposes
    logger.info('Updating course', { id, changes: Object.keys(data) });
    return data;
  }

  protected async afterUpdate(entity: VideoCourse): Promise<VideoCourse> {
    logger.info('Course updated successfully', { 
      id: entity.id, 
      title: entity.title,
      status: entity.status 
    });
    return entity;
  }

  protected async beforeDelete(id: ID): Promise<void> {
    logger.warn('Deleting course', { id });
  }

  protected async afterDelete(id: ID): Promise<void> {
    logger.info('Course deleted successfully', { id });
  }
}