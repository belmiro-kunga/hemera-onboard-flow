// Course Assignment Service - Enrollment and Assignment Logic
import { 
  CourseEnrollment, 
  CreateCourseEnrollmentDto, 
  UpdateCourseEnrollmentDto,
  EnrollmentStatus,
  EnrollmentSource,
  VideoCourse,
  User 
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
import { IRepository } from '../lib/types/base';
import { VideoCoursesService } from './video-courses.service';
import { UserService } from './user.service';
import { errorHandler } from '../lib/errors/handler';
import { logger } from '../lib/logging/logger';

export interface CourseAssignmentServiceConfig {
  maxEnrollmentsPerUser?: number;
  maxEnrollmentsPerCourse?: number;
  allowSelfEnrollment?: boolean;
  requireApprovalForEnrollment?: boolean;
  autoActivateEnrollments?: boolean;
  enrollmentExpirationDays?: number;
  allowMultipleAttempts?: boolean;
  maxCompletionTimeHours?: number;
}

export interface BulkEnrollmentRequest {
  courseId: ID;
  userIds: ID[];
  source: EnrollmentSource;
  autoActivate?: boolean;
}

export interface EnrollmentStats {
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  cancelledEnrollments: number;
  averageProgress: number;
  completionRate: number;
  enrollmentsBySource: Record<EnrollmentSource, number>;
  enrollmentsByStatus: Record<EnrollmentStatus, number>;
}

export class CourseAssignmentService implements IService<CourseEnrollment, CreateCourseEnrollmentDto, UpdateCourseEnrollmentDto> {
  private config: CourseAssignmentServiceConfig;

  constructor(
    private repository: IRepository<CourseEnrollment, CreateCourseEnrollmentDto, UpdateCourseEnrollmentDto>,
    private videoCoursesService: VideoCoursesService,
    private userService: UserService,
    config?: CourseAssignmentServiceConfig
  ) {
    this.config = {
      maxEnrollmentsPerUser: 50,
      maxEnrollmentsPerCourse: 1000,
      allowSelfEnrollment: true,
      requireApprovalForEnrollment: false,
      autoActivateEnrollments: true,
      enrollmentExpirationDays: 365,
      allowMultipleAttempts: false,
      maxCompletionTimeHours: 720, // 30 days
      ...config
    };
  }

  async getAll(params?: QueryParams): Promise<Result<PaginatedResponse<CourseEnrollment>>> {
    try {
      logger.info('CourseAssignmentService: Getting all enrollments', { params });
      
      const result = await this.repository.getAll(params);
      
      if (result.success) {
        logger.info('CourseAssignmentService: Successfully retrieved enrollments', { 
          count: result.data.data.length,
          total: result.data.meta.total 
        });
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'CourseAssignmentService',
        action: 'getAll'
      });
      logger.error('CourseAssignmentService: Failed to get all enrollments', error);
      return failure(appError);
    }
  }

  async getById(id: ID): Promise<Result<CourseEnrollment>> {
    try {
      logger.info('CourseAssignmentService: Getting enrollment by ID', { id });
      
      const result = await this.repository.getById(id);
      
      if (result.success) {
        logger.info('CourseAssignmentService: Successfully retrieved enrollment', { 
          id: result.data.id,
          userId: result.data.userId,
          courseId: result.data.courseId 
        });
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'CourseAssignmentService',
        action: 'getById'
      });
      logger.error('CourseAssignmentService: Failed to get enrollment by ID', error, { id });
      return failure(appError);
    }
  }

  async create(data: CreateCourseEnrollmentDto): Promise<Result<CourseEnrollment>> {
    try {
      logger.info('CourseAssignmentService: Creating enrollment', { 
        userId: data.userId, 
        courseId: data.courseId,
        source: data.enrollmentSource 
      });
      
      // Apply business rules
      const businessRulesResult = await this.validateBusinessRulesForCreate(data);
      if (!businessRulesResult.success) {
        return businessRulesResult;
      }

      // Enrich enrollment data
      const enrichedData = await this.enrichCreateData(data);
      
      // Create enrollment
      const result = await this.repository.create(enrichedData);
      
      if (result.success) {
        logger.info('CourseAssignmentService: Enrollment created successfully', { 
          id: result.data.id,
          userId: result.data.userId,
          courseId: result.data.courseId,
          status: result.data.status 
        });

        // Trigger post-creation actions
        await this.handlePostCreation(result.data);
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'CourseAssignmentService',
        action: 'create'
      });
      logger.error('CourseAssignmentService: Failed to create enrollment', error, { 
        userId: data.userId, 
        courseId: data.courseId 
      });
      return failure(appError);
    }
  }

  async update(id: ID, data: UpdateCourseEnrollmentDto): Promise<Result<CourseEnrollment>> {
    try {
      logger.info('CourseAssignmentService: Updating enrollment', { id, changes: Object.keys(data) });
      
      // Get existing enrollment
      const existingResult = await this.repository.getById(id);
      if (!existingResult.success) {
        return failure(existingResult.error);
      }

      // Apply business rules
      const businessRulesResult = await this.validateBusinessRulesForUpdate(existingResult.data, data);
      if (!businessRulesResult.success) {
        return businessRulesResult;
      }

      // Enrich update data
      const enrichedData = await this.enrichUpdateData(existingResult.data, data);
      
      // Update enrollment
      const result = await this.repository.update(id, enrichedData);
      
      if (result.success) {
        logger.info('CourseAssignmentService: Enrollment updated successfully', { 
          id: result.data.id,
          status: result.data.status,
          progress: result.data.progress 
        });

        // Trigger post-update actions
        await this.handlePostUpdate(existingResult.data, result.data);
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'CourseAssignmentService',
        action: 'update'
      });
      logger.error('CourseAssignmentService: Failed to update enrollment', error, { id });
      return failure(appError);
    }
  }

  async delete(id: ID): Promise<Result<void>> {
    try {
      logger.info('CourseAssignmentService: Deleting enrollment', { id });
      
      // Get existing enrollment
      const existingResult = await this.repository.getById(id);
      if (!existingResult.success) {
        return failure(existingResult.error);
      }

      // Apply business rules for deletion
      const businessRulesResult = await this.validateBusinessRulesForDelete(existingResult.data);
      if (!businessRulesResult.success) {
        return businessRulesResult;
      }

      // Delete enrollment
      const result = await this.repository.delete(id);
      
      if (result.success) {
        logger.info('CourseAssignmentService: Enrollment deleted successfully', { id });

        // Trigger post-deletion actions
        await this.handlePostDeletion(existingResult.data);
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'CourseAssignmentService',
        action: 'delete'
      });
      logger.error('CourseAssignmentService: Failed to delete enrollment', error, { id });
      return failure(appError);
    }
  }

  // Business-specific methods
  async enrollUser(userId: ID, courseId: ID, source: EnrollmentSource = 'direct'): Promise<Result<CourseEnrollment>> {
    try {
      logger.info('CourseAssignmentService: Enrolling user in course', { userId, courseId, source });
      
      // Check if user is already enrolled
      const existingEnrollmentResult = await this.getUserEnrollmentInCourse(userId, courseId);
      if (existingEnrollmentResult.success && existingEnrollmentResult.data) {
        const appError = errorHandler.handle(
          new Error('User is already enrolled in this course'),
          { component: 'CourseAssignmentService', action: 'enrollUser' }
        );
        return failure(appError);
      }

      // Create enrollment
      const enrollmentData: CreateCourseEnrollmentDto = {
        userId,
        courseId,
        enrollmentSource: source
      };

      return await this.create(enrollmentData);
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'CourseAssignmentService',
        action: 'enrollUser'
      });
      logger.error('CourseAssignmentService: Failed to enroll user', error, { userId, courseId });
      return failure(appError);
    }
  }

  async bulkEnrollUsers(request: BulkEnrollmentRequest): Promise<Result<CourseEnrollment[]>> {
    try {
      logger.info('CourseAssignmentService: Bulk enrolling users', { 
        courseId: request.courseId,
        userCount: request.userIds.length,
        source: request.source 
      });

      if (request.userIds.length === 0) {
        return success([]);
      }

      if (request.userIds.length > 100) {
        const appError = errorHandler.handle(
          new Error('Cannot enroll more than 100 users at once'),
          { component: 'CourseAssignmentService', action: 'bulkEnrollUsers' }
        );
        return failure(appError);
      }

      // Validate course exists
      const courseResult = await this.videoCoursesService.getById(request.courseId);
      if (!courseResult.success) {
        return failure(courseResult.error);
      }

      const enrollments: CourseEnrollment[] = [];
      const errors: { userId: ID; error: string }[] = [];

      // Process each user enrollment
      for (const userId of request.userIds) {
        try {
          const enrollmentResult = await this.enrollUser(userId, request.courseId, request.source);
          if (enrollmentResult.success) {
            enrollments.push(enrollmentResult.data);
          } else {
            errors.push({ userId, error: enrollmentResult.error.message });
          }
        } catch (error) {
          errors.push({ userId, error: 'Failed to process enrollment' });
        }
      }

      logger.info('CourseAssignmentService: Bulk enrollment completed', { 
        courseId: request.courseId,
        successful: enrollments.length,
        failed: errors.length 
      });

      if (errors.length > 0) {
        logger.warn('CourseAssignmentService: Some enrollments failed', { errors });
      }

      return success(enrollments);
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'CourseAssignmentService',
        action: 'bulkEnrollUsers'
      });
      logger.error('CourseAssignmentService: Failed to bulk enroll users', error, { 
        courseId: request.courseId 
      });
      return failure(appError);
    }
  }

  async getUserEnrollments(userId: ID, params?: QueryParams): Promise<Result<PaginatedResponse<CourseEnrollment>>> {
    try {
      logger.info('CourseAssignmentService: Getting user enrollments', { userId });
      
      const filters = { userId, ...(params?.filters || {}) };
      const result = await this.repository.getAll({ ...params, filters });
      
      if (result.success) {
        logger.info('CourseAssignmentService: Successfully retrieved user enrollments', { 
          userId,
          count: result.data.data.length 
        });
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'CourseAssignmentService',
        action: 'getUserEnrollments'
      });
      logger.error('CourseAssignmentService: Failed to get user enrollments', error, { userId });
      return failure(appError);
    }
  }

  async getCourseEnrollments(courseId: ID, params?: QueryParams): Promise<Result<PaginatedResponse<CourseEnrollment>>> {
    try {
      logger.info('CourseAssignmentService: Getting course enrollments', { courseId });
      
      const filters = { courseId, ...(params?.filters || {}) };
      const result = await this.repository.getAll({ ...params, filters });
      
      if (result.success) {
        logger.info('CourseAssignmentService: Successfully retrieved course enrollments', { 
          courseId,
          count: result.data.data.length 
        });
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'CourseAssignmentService',
        action: 'getCourseEnrollments'
      });
      logger.error('CourseAssignmentService: Failed to get course enrollments', error, { courseId });
      return failure(appError);
    }
  }

  async getUserEnrollmentInCourse(userId: ID, courseId: ID): Promise<Result<CourseEnrollment | null>> {
    try {
      logger.info('CourseAssignmentService: Getting user enrollment in course', { userId, courseId });
      
      const result = await this.repository.getAll({ 
        filters: { userId, courseId },
        limit: 1 
      });
      
      if (result.success) {
        const enrollment = result.data.data[0] || null;
        logger.info('CourseAssignmentService: User enrollment lookup completed', { 
          userId,
          courseId,
          found: !!enrollment 
        });
        return success(enrollment);
      }
      
      return failure(result.error);
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'CourseAssignmentService',
        action: 'getUserEnrollmentInCourse'
      });
      logger.error('CourseAssignmentService: Failed to get user enrollment in course', error, { 
        userId, 
        courseId 
      });
      return failure(appError);
    }
  }

  async updateProgress(enrollmentId: ID, progress: number, completedLessons?: ID[]): Promise<Result<CourseEnrollment>> {
    try {
      logger.info('CourseAssignmentService: Updating enrollment progress', { 
        enrollmentId, 
        progress 
      });

      if (progress < 0 || progress > 100) {
        const appError = errorHandler.handle(
          new Error('Progress must be between 0 and 100'),
          { component: 'CourseAssignmentService', action: 'updateProgress' }
        );
        return failure(appError);
      }

      const updateData: UpdateCourseEnrollmentDto = {
        progress,
        lastAccessedAt: new Date().toISOString()
      };

      if (completedLessons) {
        updateData.completedLessons = completedLessons;
      }

      // Mark as completed if progress is 100%
      if (progress >= 100) {
        updateData.status = 'completed';
        updateData.completedAt = new Date().toISOString();
      }

      const result = await this.update(enrollmentId, updateData);
      
      if (result.success) {
        logger.info('CourseAssignmentService: Progress updated successfully', { 
          enrollmentId,
          progress: result.data.progress,
          status: result.data.status 
        });
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'CourseAssignmentService',
        action: 'updateProgress'
      });
      logger.error('CourseAssignmentService: Failed to update progress', error, { 
        enrollmentId, 
        progress 
      });
      return failure(appError);
    }
  }

  async cancelEnrollment(enrollmentId: ID, reason?: string): Promise<Result<CourseEnrollment>> {
    try {
      logger.info('CourseAssignmentService: Cancelling enrollment', { enrollmentId, reason });
      
      const result = await this.update(enrollmentId, { status: 'cancelled' });
      
      if (result.success) {
        logger.info('CourseAssignmentService: Enrollment cancelled successfully', { 
          enrollmentId,
          reason 
        });

        // Trigger cancellation actions
        await this.handleEnrollmentCancellation(result.data, reason);
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'CourseAssignmentService',
        action: 'cancelEnrollment'
      });
      logger.error('CourseAssignmentService: Failed to cancel enrollment', error, { enrollmentId });
      return failure(appError);
    }
  }

  async getEnrollmentStats(courseId?: ID): Promise<Result<EnrollmentStats>> {
    try {
      logger.info('CourseAssignmentService: Getting enrollment statistics', { courseId });
      
      const filters = courseId ? { courseId } : {};
      
      // Get all enrollments for stats calculation
      const enrollmentsResult = await this.repository.getAll({ 
        filters,
        limit: 10000 // Get all for stats
      });
      
      if (!enrollmentsResult.success) {
        return failure(enrollmentsResult.error);
      }

      const enrollments = enrollmentsResult.data.data;
      
      // Calculate statistics
      const stats: EnrollmentStats = {
        totalEnrollments: enrollments.length,
        activeEnrollments: enrollments.filter(e => e.status === 'active').length,
        completedEnrollments: enrollments.filter(e => e.status === 'completed').length,
        cancelledEnrollments: enrollments.filter(e => e.status === 'cancelled').length,
        averageProgress: enrollments.length > 0 
          ? enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length 
          : 0,
        completionRate: enrollments.length > 0 
          ? (enrollments.filter(e => e.status === 'completed').length / enrollments.length) * 100 
          : 0,
        enrollmentsBySource: this.calculateEnrollmentsBySource(enrollments),
        enrollmentsByStatus: this.calculateEnrollmentsByStatus(enrollments)
      };

      logger.info('CourseAssignmentService: Successfully calculated enrollment statistics', { 
        courseId,
        stats 
      });
      
      return success(stats);
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'CourseAssignmentService',
        action: 'getEnrollmentStats'
      });
      logger.error('CourseAssignmentService: Failed to get enrollment statistics', error, { courseId });
      return failure(appError);
    }
  }

  // Private business rule validation methods
  private async validateBusinessRulesForCreate(data: CreateCourseEnrollmentDto): Promise<Result<void>> {
    // Validate user exists
    const userResult = await this.userService.getById(data.userId);
    if (!userResult.success) {
      return failure(userResult.error);
    }

    // Validate course exists and is published
    const courseResult = await this.videoCoursesService.getById(data.courseId);
    if (!courseResult.success) {
      return failure(courseResult.error);
    }

    if (courseResult.data.status !== 'published') {
      const appError = errorHandler.handle(
        new Error('Cannot enroll in unpublished course'),
        { component: 'CourseAssignmentService', action: 'validateBusinessRulesForCreate' }
      );
      return failure(appError);
    }

    // Check user enrollment limit
    const userEnrollmentsResult = await this.getUserEnrollments(data.userId);
    if (userEnrollmentsResult.success) {
      const activeEnrollments = userEnrollmentsResult.data.data.filter(
        e => e.status === 'active' || e.status === 'pending'
      ).length;
      
      if (activeEnrollments >= this.config.maxEnrollmentsPerUser!) {
        const appError = errorHandler.handle(
          new Error(`User has reached maximum enrollment limit (${this.config.maxEnrollmentsPerUser})`),
          { component: 'CourseAssignmentService', action: 'validateBusinessRulesForCreate' }
        );
        return failure(appError);
      }
    }

    // Check course enrollment limit
    const courseEnrollmentsResult = await this.getCourseEnrollments(data.courseId);
    if (courseEnrollmentsResult.success) {
      const activeEnrollments = courseEnrollmentsResult.data.data.filter(
        e => e.status === 'active' || e.status === 'pending'
      ).length;
      
      if (activeEnrollments >= this.config.maxEnrollmentsPerCourse!) {
        const appError = errorHandler.handle(
          new Error(`Course has reached maximum enrollment limit (${this.config.maxEnrollmentsPerCourse})`),
          { component: 'CourseAssignmentService', action: 'validateBusinessRulesForCreate' }
        );
        return failure(appError);
      }
    }

    return success(undefined);
  }

  private async validateBusinessRulesForUpdate(
    existing: CourseEnrollment, 
    data: UpdateCourseEnrollmentDto
  ): Promise<Result<void>> {
    // Validate status transitions
    if (data.status && data.status !== existing.status) {
      const canTransitionResult = this.canTransitionStatus(existing.status, data.status);
      if (!canTransitionResult.success) {
        return failure(canTransitionResult.error);
      }
    }

    return success(undefined);
  }

  private async validateBusinessRulesForDelete(enrollment: CourseEnrollment): Promise<Result<void>> {
    // Don't allow deletion of completed enrollments
    if (enrollment.status === 'completed') {
      const appError = errorHandler.handle(
        new Error('Cannot delete completed enrollment'),
        { component: 'CourseAssignmentService', action: 'validateBusinessRulesForDelete' }
      );
      return failure(appError);
    }

    return success(undefined);
  }

  private canTransitionStatus(currentStatus: EnrollmentStatus, newStatus: EnrollmentStatus): Result<void> {
    const validTransitions: Record<EnrollmentStatus, EnrollmentStatus[]> = {
      pending: ['active', 'cancelled'],
      active: ['completed', 'cancelled'],
      completed: [], // Completed enrollments cannot be changed
      cancelled: ['active'], // Can reactivate cancelled enrollments
      expired: ['active'] // Can reactivate expired enrollments
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      const appError = errorHandler.handle(
        new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`),
        { component: 'CourseAssignmentService', action: 'canTransitionStatus' }
      );
      return failure(appError);
    }

    return success(undefined);
  }

  // Private helper methods
  private async enrichCreateData(data: CreateCourseEnrollmentDto): Promise<CreateCourseEnrollmentDto> {
    return {
      ...data
      // Additional enrichment can be added here
    };
  }

  private async enrichUpdateData(
    existing: CourseEnrollment, 
    data: UpdateCourseEnrollmentDto
  ): Promise<UpdateCourseEnrollmentDto> {
    return {
      ...data
    };
  }

  private calculateEnrollmentsBySource(enrollments: CourseEnrollment[]): Record<EnrollmentSource, number> {
    const bySource: Record<EnrollmentSource, number> = {
      direct: 0,
      assignment: 0,
      bulk: 0,
      promotion: 0
    };

    enrollments.forEach(enrollment => {
      bySource[enrollment.enrollmentSource]++;
    });

    return bySource;
  }

  private calculateEnrollmentsByStatus(enrollments: CourseEnrollment[]): Record<EnrollmentStatus, number> {
    const byStatus: Record<EnrollmentStatus, number> = {
      pending: 0,
      active: 0,
      completed: 0,
      cancelled: 0,
      expired: 0
    };

    enrollments.forEach(enrollment => {
      byStatus[enrollment.status]++;
    });

    return byStatus;
  }

  // Post-action handlers
  private async handlePostCreation(enrollment: CourseEnrollment): Promise<void> {
    logger.info('CourseAssignmentService: Handling post-creation actions', { 
      enrollmentId: enrollment.id 
    });
    // Send enrollment confirmation, update course stats, etc.
  }

  private async handlePostUpdate(oldEnrollment: CourseEnrollment, newEnrollment: CourseEnrollment): Promise<void> {
    logger.info('CourseAssignmentService: Handling post-update actions', { 
      enrollmentId: newEnrollment.id 
    });
    
    // Handle completion
    if (oldEnrollment.status !== 'completed' && newEnrollment.status === 'completed') {
      await this.handleEnrollmentCompletion(newEnrollment);
    }
  }

  private async handlePostDeletion(enrollment: CourseEnrollment): Promise<void> {
    logger.info('CourseAssignmentService: Handling post-deletion actions', { 
      enrollmentId: enrollment.id 
    });
    // Update course stats, send notifications, etc.
  }

  private async handleEnrollmentCompletion(enrollment: CourseEnrollment): Promise<void> {
    logger.info('CourseAssignmentService: Handling enrollment completion', { 
      enrollmentId: enrollment.id,
      userId: enrollment.userId,
      courseId: enrollment.courseId 
    });
    // Generate certificate, send completion notification, update stats, etc.
  }

  private async handleEnrollmentCancellation(enrollment: CourseEnrollment, reason?: string): Promise<void> {
    logger.info('CourseAssignmentService: Handling enrollment cancellation', { 
      enrollmentId: enrollment.id,
      reason 
    });
    // Send cancellation notification, update stats, etc.
  }
}