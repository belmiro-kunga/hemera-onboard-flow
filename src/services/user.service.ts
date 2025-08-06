// User Service - User Management Business Logic
import { 
  User, 
  CreateUserDto, 
  UpdateUserDto,
  UserRole,
  UserPreferences 
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
import { createUserValidator, updateUserValidator } from '../lib/validation';
import { errorHandler } from '../lib/errors/handler';
import { logger } from '../lib/logging/logger';
import { BUSINESS_CONSTANTS } from '../lib/config/constants';

export interface UserServiceConfig {
  maxUsersPerRole?: Record<UserRole, number>;
  requireEmailVerification?: boolean;
  passwordExpirationDays?: number;
  maxLoginAttempts?: number;
  lockoutDurationMinutes?: number;
  allowRoleChange?: boolean;
  defaultPreferences?: UserPreferences;
}

export class UserService implements IService<User, CreateUserDto, UpdateUserDto> {
  private config: UserServiceConfig;

  constructor(
    private repository: IRepository<User, CreateUserDto, UpdateUserDto>,
    config?: UserServiceConfig
  ) {
    this.config = {
      maxUsersPerRole: {
        admin: 10,
        instructor: 100,
        student: 10000
      },
      requireEmailVerification: true,
      passwordExpirationDays: 90,
      maxLoginAttempts: 5,
      lockoutDurationMinutes: 30,
      allowRoleChange: true,
      defaultPreferences: {
        theme: 'light',
        language: 'pt-BR',
        notifications: {
          email: true,
          push: false,
          inApp: true
        },
        privacy: {
          profileVisible: true,
          showEmail: false
        }
      },
      ...config
    };
  }

  async getAll(params?: QueryParams): Promise<Result<PaginatedResponse<User>>> {
    try {
      logger.info('UserService: Getting all users', { params });
      
      const result = await this.repository.getAll(params);
      
      if (result.success) {
        // Remove sensitive data from response
        const sanitizedUsers = result.data.data.map(user => this.sanitizeUser(user));
        result.data.data = sanitizedUsers;
        
        logger.info('UserService: Successfully retrieved users', { 
          count: result.data.data.length,
          total: result.data.meta.total 
        });
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'UserService',
        action: 'getAll'
      });
      logger.error('UserService: Failed to get all users', error);
      return failure(appError);
    }
  }

  async getById(id: ID): Promise<Result<User>> {
    try {
      logger.info('UserService: Getting user by ID', { id });
      
      const result = await this.repository.getById(id);
      
      if (result.success) {
        const sanitizedUser = this.sanitizeUser(result.data);
        logger.info('UserService: Successfully retrieved user', { 
          id: sanitizedUser.id,
          email: sanitizedUser.email 
        });
        return success(sanitizedUser);
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'UserService',
        action: 'getById'
      });
      logger.error('UserService: Failed to get user by ID', error, { id });
      return failure(appError);
    }
  }

  async create(data: CreateUserDto): Promise<Result<User>> {
    try {
      logger.info('UserService: Creating user', { email: data.email, role: data.role });
      
      // Validate input data
      const validationResult = createUserValidator.validate(data);
      if (!validationResult.isValid) {
        logger.warn('UserService: Validation failed', { errors: validationResult.errors });
        const appError = errorHandler.handle(
          { validationErrors: validationResult.errors },
          { component: 'UserService', action: 'create' }
        );
        return failure(appError);
      }

      // Apply business rules
      const businessRulesResult = await this.validateBusinessRulesForCreate(data);
      if (!businessRulesResult.success) {
        return businessRulesResult;
      }

      // Hash password and enrich data
      const enrichedData = await this.enrichCreateData(data);
      
      // Create user
      const result = await this.repository.create(enrichedData);
      
      if (result.success) {
        const sanitizedUser = this.sanitizeUser(result.data);
        logger.info('UserService: User created successfully', { 
          id: sanitizedUser.id,
          email: sanitizedUser.email,
          role: sanitizedUser.role 
        });

        // Trigger post-creation actions
        await this.handlePostCreation(sanitizedUser);
        
        return success(sanitizedUser);
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'UserService',
        action: 'create'
      });
      logger.error('UserService: Failed to create user', error, { email: data.email });
      return failure(appError);
    }
  }

  async update(id: ID, data: UpdateUserDto): Promise<Result<User>> {
    try {
      logger.info('UserService: Updating user', { id, changes: Object.keys(data) });
      
      // Validate input data
      const validationResult = updateUserValidator.validate(data);
      if (!validationResult.isValid) {
        logger.warn('UserService: Validation failed', { errors: validationResult.errors });
        const appError = errorHandler.handle(
          { validationErrors: validationResult.errors },
          { component: 'UserService', action: 'update' }
        );
        return failure(appError);
      }

      // Get existing user for business rule validation
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
      
      // Update user
      const result = await this.repository.update(id, enrichedData);
      
      if (result.success) {
        const sanitizedUser = this.sanitizeUser(result.data);
        logger.info('UserService: User updated successfully', { 
          id: sanitizedUser.id,
          email: sanitizedUser.email 
        });

        // Trigger post-update actions
        await this.handlePostUpdate(existingResult.data, sanitizedUser);
        
        return success(sanitizedUser);
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'UserService',
        action: 'update'
      });
      logger.error('UserService: Failed to update user', error, { id });
      return failure(appError);
    }
  }

  async delete(id: ID): Promise<Result<void>> {
    try {
      logger.info('UserService: Deleting user', { id });
      
      // Get existing user for business rule validation
      const existingResult = await this.repository.getById(id);
      if (!existingResult.success) {
        return failure(existingResult.error);
      }

      // Apply business rules for deletion
      const businessRulesResult = await this.validateBusinessRulesForDelete(existingResult.data);
      if (!businessRulesResult.success) {
        return businessRulesResult;
      }

      // Delete user
      const result = await this.repository.delete(id);
      
      if (result.success) {
        logger.info('UserService: User deleted successfully', { id });

        // Trigger post-deletion actions
        await this.handlePostDeletion(existingResult.data);
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'UserService',
        action: 'delete'
      });
      logger.error('UserService: Failed to delete user', error, { id });
      return failure(appError);
    }
  }

  // Business-specific methods
  async getByRole(role: UserRole, params?: QueryParams): Promise<Result<PaginatedResponse<User>>> {
    try {
      logger.info('UserService: Getting users by role', { role });
      
      const filters = { role, ...(params?.filters || {}) };
      const result = await this.repository.getAll({ ...params, filters });
      
      if (result.success) {
        // Sanitize users
        const sanitizedUsers = result.data.data.map(user => this.sanitizeUser(user));
        result.data.data = sanitizedUsers;
        
        logger.info('UserService: Successfully retrieved users by role', { 
          role,
          count: result.data.data.length 
        });
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'UserService',
        action: 'getByRole'
      });
      logger.error('UserService: Failed to get users by role', error, { role });
      return failure(appError);
    }
  }

  async getByEmail(email: string): Promise<Result<User | null>> {
    try {
      logger.info('UserService: Getting user by email', { email });
      
      const result = await this.repository.getAll({ 
        filters: { email },
        limit: 1 
      });
      
      if (result.success) {
        const user = result.data.data[0] || null;
        const sanitizedUser = user ? this.sanitizeUser(user) : null;
        
        logger.info('UserService: User lookup by email completed', { 
          email,
          found: !!user 
        });
        
        return success(sanitizedUser);
      }
      
      return failure(result.error);
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'UserService',
        action: 'getByEmail'
      });
      logger.error('UserService: Failed to get user by email', error, { email });
      return failure(appError);
    }
  }

  async updatePreferences(id: ID, preferences: Partial<UserPreferences>): Promise<Result<User>> {
    try {
      logger.info('UserService: Updating user preferences', { id });
      
      // Get current user
      const existingResult = await this.repository.getById(id);
      if (!existingResult.success) {
        return failure(existingResult.error);
      }

      // Merge preferences
      const updatedPreferences = {
        ...existingResult.data.preferences,
        ...preferences
      };

      // Update user
      const result = await this.repository.update(id, { preferences: updatedPreferences });
      
      if (result.success) {
        const sanitizedUser = this.sanitizeUser(result.data);
        logger.info('UserService: User preferences updated successfully', { id });
        return success(sanitizedUser);
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'UserService',
        action: 'updatePreferences'
      });
      logger.error('UserService: Failed to update user preferences', error, { id });
      return failure(appError);
    }
  }

  async changeRole(id: ID, newRole: UserRole, changedBy: ID): Promise<Result<User>> {
    try {
      logger.info('UserService: Changing user role', { id, newRole, changedBy });
      
      if (!this.config.allowRoleChange) {
        const appError = errorHandler.handle(
          new Error('Role changes are not allowed'),
          { component: 'UserService', action: 'changeRole' }
        );
        return failure(appError);
      }

      // Get current user
      const existingResult = await this.repository.getById(id);
      if (!existingResult.success) {
        return failure(existingResult.error);
      }

      const currentUser = existingResult.data;

      // Validate role change
      const canChangeResult = await this.canChangeRole(currentUser, newRole);
      if (!canChangeResult.success) {
        return failure(canChangeResult.error);
      }

      // Update role
      const result = await this.repository.update(id, { role: newRole });
      
      if (result.success) {
        const sanitizedUser = this.sanitizeUser(result.data);
        logger.info('UserService: User role changed successfully', { 
          id,
          oldRole: currentUser.role,
          newRole: sanitizedUser.role,
          changedBy 
        });

        // Trigger role change actions
        await this.handleRoleChange(currentUser, sanitizedUser, changedBy);
        
        return success(sanitizedUser);
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'UserService',
        action: 'changeRole'
      });
      logger.error('UserService: Failed to change user role', error, { id, newRole });
      return failure(appError);
    }
  }

  async activateUser(id: ID): Promise<Result<User>> {
    try {
      logger.info('UserService: Activating user', { id });
      
      const result = await this.repository.update(id, { 
        status: 'active',
        emailVerifiedAt: new Date().toISOString()
      });
      
      if (result.success) {
        const sanitizedUser = this.sanitizeUser(result.data);
        logger.info('UserService: User activated successfully', { id });

        // Trigger activation actions
        await this.handleUserActivation(sanitizedUser);
        
        return success(sanitizedUser);
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'UserService',
        action: 'activateUser'
      });
      logger.error('UserService: Failed to activate user', error, { id });
      return failure(appError);
    }
  }

  async deactivateUser(id: ID, reason?: string): Promise<Result<User>> {
    try {
      logger.info('UserService: Deactivating user', { id, reason });
      
      const result = await this.repository.update(id, { status: 'inactive' });
      
      if (result.success) {
        const sanitizedUser = this.sanitizeUser(result.data);
        logger.info('UserService: User deactivated successfully', { id, reason });

        // Trigger deactivation actions
        await this.handleUserDeactivation(sanitizedUser, reason);
        
        return success(sanitizedUser);
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'UserService',
        action: 'deactivateUser'
      });
      logger.error('UserService: Failed to deactivate user', error, { id });
      return failure(appError);
    }
  }

  async getUserStats(): Promise<Result<any>> {
    try {
      logger.info('UserService: Getting user statistics');
      
      // Get counts by role
      const roleStats: Record<UserRole, number> = {
        admin: 0,
        instructor: 0,
        student: 0
      };

      for (const role of Object.keys(roleStats) as UserRole[]) {
        const countResult = await this.repository.count({ role });
        if (countResult.success) {
          roleStats[role] = countResult.data;
        }
      }

      // Get total count
      const totalResult = await this.repository.count();
      const total = totalResult.success ? totalResult.data : 0;

      // Get active count
      const activeResult = await this.repository.count({ status: 'active' });
      const active = activeResult.success ? activeResult.data : 0;

      const stats = {
        total,
        active,
        inactive: total - active,
        byRole: roleStats,
        timestamp: new Date().toISOString()
      };

      logger.info('UserService: Successfully retrieved user statistics', { stats });
      return success(stats);
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'UserService',
        action: 'getUserStats'
      });
      logger.error('UserService: Failed to get user statistics', error);
      return failure(appError);
    }
  }

  // Private business rule validation methods
  private async validateBusinessRulesForCreate(data: CreateUserDto): Promise<Result<void>> {
    // Check if email already exists
    const existingUserResult = await this.getByEmail(data.email);
    if (existingUserResult.success && existingUserResult.data) {
      const appError = errorHandler.handle(
        new Error('User with this email already exists'),
        { component: 'UserService', action: 'validateBusinessRulesForCreate' }
      );
      return failure(appError);
    }

    // Check role limits
    const roleLimit = this.config.maxUsersPerRole![data.role];
    if (roleLimit) {
      const roleCountResult = await this.repository.count({ role: data.role });
      if (roleCountResult.success && roleCountResult.data >= roleLimit) {
        const appError = errorHandler.handle(
          new Error(`Maximum number of ${data.role} users reached (${roleLimit})`),
          { component: 'UserService', action: 'validateBusinessRulesForCreate' }
        );
        return failure(appError);
      }
    }

    return success(undefined);
  }

  private async validateBusinessRulesForUpdate(
    existing: User, 
    data: UpdateUserDto
  ): Promise<Result<void>> {
    // Check role change permissions
    if (data.role && data.role !== existing.role && !this.config.allowRoleChange) {
      const appError = errorHandler.handle(
        new Error('Role changes are not allowed'),
        { component: 'UserService', action: 'validateBusinessRulesForUpdate' }
      );
      return failure(appError);
    }

    return success(undefined);
  }

  private async validateBusinessRulesForDelete(user: User): Promise<Result<void>> {
    // Don't allow deletion of the last admin
    if (user.role === 'admin') {
      const adminCountResult = await this.repository.count({ role: 'admin' });
      if (adminCountResult.success && adminCountResult.data <= 1) {
        const appError = errorHandler.handle(
          new Error('Cannot delete the last admin user'),
          { component: 'UserService', action: 'validateBusinessRulesForDelete' }
        );
        return failure(appError);
      }
    }

    return success(undefined);
  }

  private async canChangeRole(user: User, newRole: UserRole): Promise<Result<void>> {
    // Check if new role has available slots
    const roleLimit = this.config.maxUsersPerRole![newRole];
    if (roleLimit) {
      const roleCountResult = await this.repository.count({ role: newRole });
      if (roleCountResult.success && roleCountResult.data >= roleLimit) {
        const appError = errorHandler.handle(
          new Error(`Maximum number of ${newRole} users reached (${roleLimit})`),
          { component: 'UserService', action: 'canChangeRole' }
        );
        return failure(appError);
      }
    }

    // Don't allow changing the last admin to another role
    if (user.role === 'admin' && newRole !== 'admin') {
      const adminCountResult = await this.repository.count({ role: 'admin' });
      if (adminCountResult.success && adminCountResult.data <= 1) {
        const appError = errorHandler.handle(
          new Error('Cannot change role of the last admin user'),
          { component: 'UserService', action: 'canChangeRole' }
        );
        return failure(appError);
      }
    }

    return success(undefined);
  }

  // Private helper methods
  private sanitizeUser(user: User): User {
    // Remove sensitive information from user object
    const sanitized = { ...user };
    // Note: In a real implementation, you might want to remove password hash, etc.
    return sanitized;
  }

  private async enrichCreateData(data: CreateUserDto): Promise<CreateUserDto> {
    return {
      ...data,
      // In a real implementation, hash the password here
      // password: await this.hashPassword(data.password)
    };
  }

  private async enrichUpdateData(
    existing: User, 
    data: UpdateUserDto
  ): Promise<UpdateUserDto> {
    const enriched = { ...data };

    // Merge preferences if provided
    if (data.preferences) {
      enriched.preferences = {
        ...existing.preferences,
        ...data.preferences
      };
    }

    return enriched;
  }

  // Post-action handlers
  private async handlePostCreation(user: User): Promise<void> {
    logger.info('UserService: Handling post-creation actions', { userId: user.id });
    
    // Send welcome email, create default data, etc.
    if (this.config.requireEmailVerification) {
      // Send email verification
      logger.info('UserService: Email verification required', { userId: user.id });
    }
  }

  private async handlePostUpdate(oldUser: User, newUser: User): Promise<void> {
    logger.info('UserService: Handling post-update actions', { userId: newUser.id });
    // Add any post-update logic here
  }

  private async handlePostDeletion(user: User): Promise<void> {
    logger.info('UserService: Handling post-deletion actions', { userId: user.id });
    // Clean up user data, send notifications, etc.
  }

  private async handleRoleChange(oldUser: User, newUser: User, changedBy: ID): Promise<void> {
    logger.info('UserService: Handling role change actions', { 
      userId: newUser.id,
      oldRole: oldUser.role,
      newRole: newUser.role,
      changedBy 
    });
    // Send notifications, update permissions, etc.
  }

  private async handleUserActivation(user: User): Promise<void> {
    logger.info('UserService: Handling user activation actions', { userId: user.id });
    // Send welcome email, enable features, etc.
  }

  private async handleUserDeactivation(user: User, reason?: string): Promise<void> {
    logger.info('UserService: Handling user deactivation actions', { 
      userId: user.id, 
      reason 
    });
    // Disable access, send notifications, etc.
  }
}