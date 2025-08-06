// Video Courses Service - Business Logic Layer
import { 
  VideoCourse, 
  CreateVideoCourseDto, 
  UpdateVideoCourseDto,
  CourseStatus,
  CourseLevel 
} from '../lib/types/entities';
import { 
  Result, 
  success, 
  failure, 
  IService, 
  PaginatedResponse, 
  QueryParams,
  ID 
} from '../lib/types/base';
import { VideoCoursesRepository } from '../lib/repositories/video-courses.repository';
import { createVideoCourseValidator, updateVideoCourseValidator } from '../lib/validation';
import { errorHandler } from '../lib/errors/handler';
import { logger } from '../lib/logging/logger';
import { videoCourseTransformer } from '../lib/transformers';
import { BUSINESS_CONSTANTS } from '../lib/config/constants';

export interface VideoCoursesServiceConfig {
  maxCoursesPerInstructor?: number;
  allowDuplicateTitles?: boolean;
  requireApprovalForPublish?: boolean;
  maxTagsPerCourse?: number;
}

export class VideoCoursesService implements IService<VideoCourse, CreateVideoCourseDto, UpdateVideoCourseDto> {
  private config: VideoCoursesServiceConfig;

  constructor(
    private repository: VideoCoursesRepository,
    config?: VideoCoursesServiceConfig
  ) {
    this.config = {
      maxCoursesPerInstructor: 50,
      allowDuplicateTitles: false,
      requireApprovalForPublish: true,
      maxTagsPerCourse: 10,
      ...config
    };
  }

  async getAll(params?: QueryParams): Promise<Result<PaginatedResponse<VideoCourse>>> {
    try {
      logger.info('VideoCoursesService: Getting all courses', { params });
      
      const result = await this.repository.getAll(params);
      
      if (result.success) {
        logger.info('VideoCoursesService: Successfully retrieved courses', { 
          count: result.data.data.length,
          total: result.data.meta.total 
        });
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'VideoCoursesService',
        action: 'getAll'
      });
      logger.error('VideoCoursesService: Failed to get all courses', error);
      return failure(appError);
    }
  }

  async getById(id: ID): Promise<Result<VideoCourse>> {
    try {
      logger.info('VideoCoursesService: Getting course by ID', { id });
      
      const result = await this.repository.getById(id);
      
      if (result.success) {
        logger.info('VideoCoursesService: Successfully retrieved course', { 
          id: result.data.id,
          title: result.data.title 
        });
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'VideoCoursesService',
        action: 'getById'
      });
      logger.error('VideoCoursesService: Failed to get course by ID', error, { id });
      return failure(appError);
    }
  }

  async create(data: CreateVideoCourseDto): Promise<Result<VideoCourse>> {
    try {
      logger.info('VideoCoursesService: Creating course', { title: data.title });
      
      // Validate input data
      const validationResult = createVideoCourseValidator.validate(data);
      if (!validationResult.isValid) {
        logger.warn('VideoCoursesService: Validation failed', { errors: validationResult.errors });
        const appError = errorHandler.handle(
          { validationErrors: validationResult.errors },
          { component: 'VideoCoursesService', action: 'create' }
        );
        return failure(appError);
      }

      // Apply business rules
      const businessRulesResult = await this.validateBusinessRulesForCreate(data);
      if (!businessRulesResult.success) {
        return businessRulesResult;
      }

      // Transform and enrich data
      const enrichedData = await this.enrichCreateData(data);
      
      // Create course
      const result = await this.repository.create(enrichedData);
      
      if (result.success) {
        logger.info('VideoCoursesService: Course created successfully', { 
          id: result.data.id,
          title: result.data.title,
          instructorId: result.data.instructorId 
        });

        // Trigger post-creation actions
        await this.handlePostCreation(result.data);
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'VideoCoursesService',
        action: 'create'
      });
      logger.error('VideoCoursesService: Failed to create course', error, { title: data.title });
      return failure(appError);
    }
  }

  async update(id: ID, data: UpdateVideoCourseDto): Promise<Result<VideoCourse>> {
    try {
      logger.info('VideoCoursesService: Updating course', { id, changes: Object.keys(data) });
      
      // Validate input data
      const validationResult = updateVideoCourseValidator.validate(data);
      if (!validationResult.isValid) {
        logger.warn('VideoCoursesService: Validation failed', { errors: validationResult.errors });
        const appError = errorHandler.handle(
          { validationErrors: validationResult.errors },
          { component: 'VideoCoursesService', action: 'update' }
        );
        return failure(appError);
      }

      // Get existing course for business rule validation
      const existingResult = await this.repository.getById(id);
      if (!existingResult.success) {
        return failure(existingResult.error);
      }

      // Apply business rules
      const businessRulesResult = await this.validateBusinessRulesForUpdate(existingResult.data, data);
      if (!businessRulesResult.success) {
        return businessRulesResult;
      }

      // Transform and enrich data
      const enrichedData = await this.enrichUpdateData(existingResult.data, data);
      
      // Update course
      const result = await this.repository.update(id, enrichedData);
      
      if (result.success) {
        logger.info('VideoCoursesService: Course updated successfully', { 
          id: result.data.id,
          title: result.data.title 
        });

        // Trigger post-update actions
        await this.handlePostUpdate(existingResult.data, result.data);
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'VideoCoursesService',
        action: 'update'
      });
      logger.error('VideoCoursesService: Failed to update course', error, { id });
      return failure(appError);
    }
  }

  async delete(id: ID): Promise<Result<void>> {
    try {
      logger.info('VideoCoursesService: Deleting course', { id });
      
      // Get existing course for business rule validation
      const existingResult = await this.repository.getById(id);
      if (!existingResult.success) {
        return failure(existingResult.error);
      }

      // Apply business rules for deletion
      const businessRulesResult = await this.validateBusinessRulesForDelete(existingResult.data);
      if (!businessRulesResult.success) {
        return businessRulesResult;
      }

      // Delete course
      const result = await this.repository.delete(id);
      
      if (result.success) {
        logger.info('VideoCoursesService: Course deleted successfully', { id });

        // Trigger post-deletion actions
        await this.handlePostDeletion(existingResult.data);
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'VideoCoursesService',
        action: 'delete'
      });
      logger.error('VideoCoursesService: Failed to delete course', error, { id });
      return failure(appError);
    }
  }

  // Business-specific methods
  async toggleStatus(id: ID): Promise<Result<VideoCourse>> {
    try {
      logger.info('VideoCoursesService: Toggling course status', { id });
      
      // Get current course
      const existingResult = await this.repository.getById(id);
      if (!existingResult.success) {
        return failure(existingResult.error);
      }

      const currentCourse = existingResult.data;
      const newStatus = this.getNextStatus(currentCourse.status);

      // Validate status transition
      const canTransition = await this.canTransitionStatus(currentCourse, newStatus);
      if (!canTransition.success) {
        return failure(canTransition.error);
      }

      // Update status
      const result = await this.repository.update(id, { status: newStatus });
      
      if (result.success) {
        logger.info('VideoCoursesService: Course status toggled', { 
          id,
          oldStatus: currentCourse.status,
          newStatus: result.data.status 
        });

        // Trigger status change actions
        await this.handleStatusChange(currentCourse, result.data);
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'VideoCoursesService',
        action: 'toggleStatus'
      });
      logger.error('VideoCoursesService: Failed to toggle course status', error, { id });
      return failure(appError);
    }
  }

  async getByInstructor(instructorId: ID, params?: QueryParams): Promise<Result<PaginatedResponse<VideoCourse>>> {
    try {
      logger.info('VideoCoursesService: Getting courses by instructor', { instructorId });
      
      const result = await this.repository.getByInstructor(instructorId, params);
      
      if (result.success) {
        logger.info('VideoCoursesService: Successfully retrieved instructor courses', { 
          instructorId,
          count: result.data.data.length 
        });
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'VideoCoursesService',
        action: 'getByInstructor'
      });
      logger.error('VideoCoursesService: Failed to get courses by instructor', error, { instructorId });
      return failure(appError);
    }
  }

  async search(query: string, params?: QueryParams): Promise<Result<PaginatedResponse<VideoCourse>>> {
    try {
      logger.info('VideoCoursesService: Searching courses', { query });
      
      // Validate search query
      if (!query || query.trim().length < 2) {
        const appError = errorHandler.handle(
          new Error('Search query must be at least 2 characters'),
          { component: 'VideoCoursesService', action: 'search' }
        );
        return failure(appError);
      }

      const result = await this.repository.search(query.trim(), params);
      
      if (result.success) {
        logger.info('VideoCoursesService: Search completed', { 
          query,
          count: result.data.data.length 
        });
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'VideoCoursesService',
        action: 'search'
      });
      logger.error('VideoCoursesService: Failed to search courses', error, { query });
      return failure(appError);
    }
  }

  async getPopular(limit: number = 10): Promise<Result<VideoCourse[]>> {
    try {
      logger.info('VideoCoursesService: Getting popular courses', { limit });
      
      if (limit < 1 || limit > 50) {
        const appError = errorHandler.handle(
          new Error('Limit must be between 1 and 50'),
          { component: 'VideoCoursesService', action: 'getPopular' }
        );
        return failure(appError);
      }

      const result = await this.repository.getPopular(limit);
      
      if (result.success) {
        logger.info('VideoCoursesService: Successfully retrieved popular courses', { 
          count: result.data.length 
        });
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'VideoCoursesService',
        action: 'getPopular'
      });
      logger.error('VideoCoursesService: Failed to get popular courses', error, { limit });
      return failure(appError);
    }
  }

  async bulkUpdateStatus(courseIds: ID[], status: CourseStatus): Promise<Result<VideoCourse[]>> {
    try {
      logger.info('VideoCoursesService: Bulk updating course status', { 
        count: courseIds.length, 
        status 
      });
      
      if (courseIds.length === 0) {
        return success([]);
      }

      if (courseIds.length > 100) {
        const appError = errorHandler.handle(
          new Error('Cannot update more than 100 courses at once'),
          { component: 'VideoCoursesService', action: 'bulkUpdateStatus' }
        );
        return failure(appError);
      }

      // Validate status
      if (!Object.values(BUSINESS_CONSTANTS.COURSE_STATUS).includes(status)) {
        const appError = errorHandler.handle(
          new Error(`Invalid status: ${status}`),
          { component: 'VideoCoursesService', action: 'bulkUpdateStatus' }
        );
        return failure(appError);
      }

      const updates = courseIds.map(id => ({
        id,
        data: { status }
      }));

      const result = await this.repository.bulkUpdate(updates);
      
      if (result.success) {
        logger.info('VideoCoursesService: Bulk status update completed', { 
          count: result.data.length,
          status 
        });
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'VideoCoursesService',
        action: 'bulkUpdateStatus'
      });
      logger.error('VideoCoursesService: Failed to bulk update status', error, { 
        count: courseIds.length, 
        status 
      });
      return failure(appError);
    }
  }

  // Private business rule validation methods
  private async validateBusinessRulesForCreate(data: CreateVideoCourseDto): Promise<Result<void>> {
    // Check instructor course limit
    const instructorCoursesResult = await this.repository.getByInstructor(data.instructorId);
    if (instructorCoursesResult.success) {
      const courseCount = instructorCoursesResult.data.meta.total;
      if (courseCount >= this.config.maxCoursesPerInstructor!) {
        const appError = errorHandler.handle(
          new Error(`Instructor has reached maximum course limit (${this.config.maxCoursesPerInstructor})`),
          { component: 'VideoCoursesService', action: 'validateBusinessRulesForCreate' }
        );
        return failure(appError);
      }
    }

    // Check duplicate titles if not allowed
    if (!this.config.allowDuplicateTitles) {
      const searchResult = await this.repository.search(data.title);
      if (searchResult.success && searchResult.data.data.length > 0) {
        const appError = errorHandler.handle(
          new Error('A course with this title already exists'),
          { component: 'VideoCoursesService', action: 'validateBusinessRulesForCreate' }
        );
        return failure(appError);
      }
    }

    // Check tags limit
    if (data.tags && data.tags.length > this.config.maxTagsPerCourse!) {
      const appError = errorHandler.handle(
        new Error(`Too many tags. Maximum allowed: ${this.config.maxTagsPerCourse}`),
        { component: 'VideoCoursesService', action: 'validateBusinessRulesForCreate' }
      );
      return failure(appError);
    }

    return success(undefined);
  }

  private async validateBusinessRulesForUpdate(
    existing: VideoCourse, 
    data: UpdateVideoCourseDto
  ): Promise<Result<void>> {
    // Check if trying to publish without approval
    if (data.status === 'published' && this.config.requireApprovalForPublish) {
      if (existing.status === 'draft') {
        const appError = errorHandler.handle(
          new Error('Course requires approval before publishing'),
          { component: 'VideoCoursesService', action: 'validateBusinessRulesForUpdate' }
        );
        return failure(appError);
      }
    }

    // Check tags limit
    if (data.tags && data.tags.length > this.config.maxTagsPerCourse!) {
      const appError = errorHandler.handle(
        new Error(`Too many tags. Maximum allowed: ${this.config.maxTagsPerCourse}`),
        { component: 'VideoCoursesService', action: 'validateBusinessRulesForUpdate' }
      );
      return failure(appError);
    }

    return success(undefined);
  }

  private async validateBusinessRulesForDelete(course: VideoCourse): Promise<Result<void>> {
    // Don't allow deletion of published courses with enrollments
    if (course.status === 'published' && course.enrollmentCount > 0) {
      const appError = errorHandler.handle(
        new Error('Cannot delete published course with active enrollments'),
        { component: 'VideoCoursesService', action: 'validateBusinessRulesForDelete' }
      );
      return failure(appError);
    }

    return success(undefined);
  }

  private async canTransitionStatus(course: VideoCourse, newStatus: CourseStatus): Promise<Result<void>> {
    const validTransitions: Record<CourseStatus, CourseStatus[]> = {
      draft: ['published'],
      published: ['archived'],
      archived: ['draft']
    };

    if (!validTransitions[course.status].includes(newStatus)) {
      const appError = errorHandler.handle(
        new Error(`Invalid status transition from ${course.status} to ${newStatus}`),
        { component: 'VideoCoursesService', action: 'canTransitionStatus' }
      );
      return failure(appError);
    }

    return success(undefined);
  }

  // Private helper methods
  private getNextStatus(currentStatus: CourseStatus): CourseStatus {
    const statusCycle: Record<CourseStatus, CourseStatus> = {
      draft: 'published',
      published: 'archived',
      archived: 'draft'
    };

    return statusCycle[currentStatus];
  }

  private async enrichCreateData(data: CreateVideoCourseDto): Promise<CreateVideoCourseDto> {
    return {
      ...data,
      currency: data.currency || 'BRL',
      tags: data.tags || []
    };
  }

  private async enrichUpdateData(
    existing: VideoCourse, 
    data: UpdateVideoCourseDto
  ): Promise<UpdateVideoCourseDto> {
    return {
      ...data
    };
  }

  // Post-action handlers
  private async handlePostCreation(course: VideoCourse): Promise<void> {
    logger.info('VideoCoursesService: Handling post-creation actions', { courseId: course.id });
    // Add any post-creation logic here (notifications, analytics, etc.)
  }

  private async handlePostUpdate(oldCourse: VideoCourse, newCourse: VideoCourse): Promise<void> {
    logger.info('VideoCoursesService: Handling post-update actions', { courseId: newCourse.id });
    // Add any post-update logic here
  }

  private async handlePostDeletion(course: VideoCourse): Promise<void> {
    logger.info('VideoCoursesService: Handling post-deletion actions', { courseId: course.id });
    // Add any post-deletion logic here
  }

  private async handleStatusChange(oldCourse: VideoCourse, newCourse: VideoCourse): Promise<void> {
    logger.info('VideoCoursesService: Handling status change actions', { 
      courseId: newCourse.id,
      oldStatus: oldCourse.status,
      newStatus: newCourse.status 
    });
    // Add any status change logic here (notifications, etc.)
  }
}