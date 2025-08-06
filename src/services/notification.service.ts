// Notification Service - User Notification Management
import { 
  Notification, 
  CreateNotificationDto,
  NotificationType,
  NotificationPriority,
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
import { errorHandler } from '../lib/errors/handler';
import { logger } from '../lib/logging/logger';

export interface NotificationServiceConfig {
  maxNotificationsPerUser?: number;
  defaultExpirationHours?: number;
  enableEmailNotifications?: boolean;
  enablePushNotifications?: boolean;
  enableInAppNotifications?: boolean;
  batchSize?: number;
  retryAttempts?: number;
}

export interface NotificationTemplate {
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  expirationHours?: number;
}

export interface BulkNotificationRequest {
  userIds: ID[];
  template: NotificationTemplate;
  data?: Record<string, any>;
  channels?: NotificationChannel[];
}

export type NotificationChannel = 'email' | 'push' | 'inApp';

export interface NotificationStats {
  totalNotifications: number;
  unreadNotifications: number;
  notificationsByType: Record<NotificationType, number>;
  notificationsByPriority: Record<NotificationPriority, number>;
  deliveryStats: {
    sent: number;
    delivered: number;
    failed: number;
    pending: number;
  };
}

export class NotificationService implements IService<Notification, CreateNotificationDto, never> {
  private config: NotificationServiceConfig;
  private templates: Map<NotificationType, NotificationTemplate> = new Map();

  constructor(
    private repository: IRepository<Notification, CreateNotificationDto, never>,
    config?: NotificationServiceConfig
  ) {
    this.config = {
      maxNotificationsPerUser: 1000,
      defaultExpirationHours: 168, // 7 days
      enableEmailNotifications: true,
      enablePushNotifications: false,
      enableInAppNotifications: true,
      batchSize: 100,
      retryAttempts: 3,
      ...config
    };

    this.initializeTemplates();
  }

  async getAll(params?: QueryParams): Promise<Result<PaginatedResponse<Notification>>> {
    try {
      logger.info('NotificationService: Getting all notifications', { params });
      
      const result = await this.repository.getAll(params);
      
      if (result.success) {
        logger.info('NotificationService: Successfully retrieved notifications', { 
          count: result.data.data.length,
          total: result.data.meta.total 
        });
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'NotificationService',
        action: 'getAll'
      });
      logger.error('NotificationService: Failed to get all notifications', error);
      return failure(appError);
    }
  }

  async getById(id: ID): Promise<Result<Notification>> {
    try {
      logger.info('NotificationService: Getting notification by ID', { id });
      
      const result = await this.repository.getById(id);
      
      if (result.success) {
        logger.info('NotificationService: Successfully retrieved notification', { 
          id: result.data.id,
          type: result.data.type,
          userId: result.data.userId 
        });
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'NotificationService',
        action: 'getById'
      });
      logger.error('NotificationService: Failed to get notification by ID', error, { id });
      return failure(appError);
    }
  }

  async create(data: CreateNotificationDto): Promise<Result<Notification>> {
    try {
      logger.info('NotificationService: Creating notification', { 
        userId: data.userId, 
        type: data.type,
        priority: data.priority 
      });
      
      // Apply business rules
      const businessRulesResult = await this.validateBusinessRulesForCreate(data);
      if (!businessRulesResult.success) {
        return businessRulesResult;
      }

      // Enrich notification data
      const enrichedData = await this.enrichCreateData(data);
      
      // Create notification
      const result = await this.repository.create(enrichedData);
      
      if (result.success) {
        logger.info('NotificationService: Notification created successfully', { 
          id: result.data.id,
          userId: result.data.userId,
          type: result.data.type,
          priority: result.data.priority 
        });

        // Trigger post-creation actions (send notification)
        await this.handlePostCreation(result.data);
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'NotificationService',
        action: 'create'
      });
      logger.error('NotificationService: Failed to create notification', error, { 
        userId: data.userId, 
        type: data.type 
      });
      return failure(appError);
    }
  }

  async update(): Promise<Result<never>> {
    // Notifications are typically not updated, only marked as read
    const appError = errorHandler.handle(
      new Error('Notifications cannot be updated. Use markAsRead() instead.'),
      { component: 'NotificationService', action: 'update' }
    );
    return failure(appError);
  }

  async delete(id: ID): Promise<Result<void>> {
    try {
      logger.info('NotificationService: Deleting notification', { id });
      
      const result = await this.repository.delete(id);
      
      if (result.success) {
        logger.info('NotificationService: Notification deleted successfully', { id });
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'NotificationService',
        action: 'delete'
      });
      logger.error('NotificationService: Failed to delete notification', error, { id });
      return failure(appError);
    }
  }

  // Business-specific methods
  async getUserNotifications(userId: ID, params?: QueryParams): Promise<Result<PaginatedResponse<Notification>>> {
    try {
      logger.info('NotificationService: Getting user notifications', { userId });
      
      const filters = { userId, ...(params?.filters || {}) };
      const result = await this.repository.getAll({ 
        ...params, 
        filters,
        sort: { field: 'createdAt', direction: 'desc' }
      });
      
      if (result.success) {
        logger.info('NotificationService: Successfully retrieved user notifications', { 
          userId,
          count: result.data.data.length 
        });
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'NotificationService',
        action: 'getUserNotifications'
      });
      logger.error('NotificationService: Failed to get user notifications', error, { userId });
      return failure(appError);
    }
  }

  async getUnreadNotifications(userId: ID, params?: QueryParams): Promise<Result<PaginatedResponse<Notification>>> {
    try {
      logger.info('NotificationService: Getting unread notifications', { userId });
      
      const filters = { userId, read: false, ...(params?.filters || {}) };
      const result = await this.repository.getAll({ 
        ...params, 
        filters,
        sort: { field: 'createdAt', direction: 'desc' }
      });
      
      if (result.success) {
        logger.info('NotificationService: Successfully retrieved unread notifications', { 
          userId,
          count: result.data.data.length 
        });
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'NotificationService',
        action: 'getUnreadNotifications'
      });
      logger.error('NotificationService: Failed to get unread notifications', error, { userId });
      return failure(appError);
    }
  }

  async markAsRead(notificationId: ID): Promise<Result<Notification>> {
    try {
      logger.info('NotificationService: Marking notification as read', { notificationId });
      
      // Get current notification
      const existingResult = await this.repository.getById(notificationId);
      if (!existingResult.success) {
        return failure(existingResult.error);
      }

      if (existingResult.data.read) {
        // Already read, return as is
        return success(existingResult.data);
      }

      // Update notification
      const updateData = {
        read: true,
        readAt: new Date().toISOString()
      };

      const result = await this.repository.update(notificationId, updateData);
      
      if (result.success) {
        logger.info('NotificationService: Notification marked as read', { notificationId });
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'NotificationService',
        action: 'markAsRead'
      });
      logger.error('NotificationService: Failed to mark notification as read', error, { notificationId });
      return failure(appError);
    }
  }

  async markAllAsRead(userId: ID): Promise<Result<number>> {
    try {
      logger.info('NotificationService: Marking all notifications as read', { userId });
      
      // Get all unread notifications for user
      const unreadResult = await this.getUnreadNotifications(userId, { limit: 1000 });
      if (!unreadResult.success) {
        return failure(unreadResult.error);
      }

      const unreadNotifications = unreadResult.data.data;
      let markedCount = 0;

      // Mark each as read
      for (const notification of unreadNotifications) {
        const markResult = await this.markAsRead(notification.id);
        if (markResult.success) {
          markedCount++;
        }
      }

      logger.info('NotificationService: Marked notifications as read', { 
        userId,
        markedCount,
        totalUnread: unreadNotifications.length 
      });
      
      return success(markedCount);
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'NotificationService',
        action: 'markAllAsRead'
      });
      logger.error('NotificationService: Failed to mark all notifications as read', error, { userId });
      return failure(appError);
    }
  }

  async sendNotification(
    userId: ID, 
    type: NotificationType, 
    data?: Record<string, any>,
    channels: NotificationChannel[] = ['inApp']
  ): Promise<Result<Notification>> {
    try {
      logger.info('NotificationService: Sending notification', { userId, type, channels });
      
      // Get template for notification type
      const template = this.templates.get(type);
      if (!template) {
        const appError = errorHandler.handle(
          new Error(`No template found for notification type: ${type}`),
          { component: 'NotificationService', action: 'sendNotification' }
        );
        return failure(appError);
      }

      // Create notification data
      const notificationData: CreateNotificationDto = {
        userId,
        type,
        title: this.interpolateTemplate(template.title, data),
        message: this.interpolateTemplate(template.message, data),
        priority: template.priority,
        data,
        expiresAt: template.expirationHours 
          ? new Date(Date.now() + template.expirationHours * 60 * 60 * 1000).toISOString()
          : undefined
      };

      // Create notification record
      const result = await this.create(notificationData);
      
      if (result.success) {
        // Send through specified channels
        await this.deliverNotification(result.data, channels);
      }
      
      return result;
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'NotificationService',
        action: 'sendNotification'
      });
      logger.error('NotificationService: Failed to send notification', error, { userId, type });
      return failure(appError);
    }
  }

  async sendBulkNotifications(request: BulkNotificationRequest): Promise<Result<Notification[]>> {
    try {
      logger.info('NotificationService: Sending bulk notifications', { 
        userCount: request.userIds.length,
        type: request.template.type 
      });

      if (request.userIds.length === 0) {
        return success([]);
      }

      if (request.userIds.length > 1000) {
        const appError = errorHandler.handle(
          new Error('Cannot send notifications to more than 1000 users at once'),
          { component: 'NotificationService', action: 'sendBulkNotifications' }
        );
        return failure(appError);
      }

      const notifications: Notification[] = [];
      const channels = request.channels || ['inApp'];

      // Process in batches
      const batchSize = this.config.batchSize!;
      for (let i = 0; i < request.userIds.length; i += batchSize) {
        const batch = request.userIds.slice(i, i + batchSize);
        
        for (const userId of batch) {
          try {
            const notificationResult = await this.sendNotification(
              userId, 
              request.template.type, 
              request.data,
              channels
            );
            
            if (notificationResult.success) {
              notifications.push(notificationResult.data);
            }
          } catch (error) {
            logger.warn('NotificationService: Failed to send notification to user', error, { userId });
          }
        }

        // Small delay between batches to avoid overwhelming the system
        if (i + batchSize < request.userIds.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      logger.info('NotificationService: Bulk notifications completed', { 
        requested: request.userIds.length,
        sent: notifications.length 
      });
      
      return success(notifications);
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'NotificationService',
        action: 'sendBulkNotifications'
      });
      logger.error('NotificationService: Failed to send bulk notifications', error);
      return failure(appError);
    }
  }

  async getNotificationStats(userId?: ID): Promise<Result<NotificationStats>> {
    try {
      logger.info('NotificationService: Getting notification statistics', { userId });
      
      const filters = userId ? { userId } : {};
      
      // Get all notifications for stats calculation
      const notificationsResult = await this.repository.getAll({ 
        filters,
        limit: 10000 // Get all for stats
      });
      
      if (!notificationsResult.success) {
        return failure(notificationsResult.error);
      }

      const notifications = notificationsResult.data.data;
      
      // Calculate statistics
      const stats: NotificationStats = {
        totalNotifications: notifications.length,
        unreadNotifications: notifications.filter(n => !n.read).length,
        notificationsByType: this.calculateNotificationsByType(notifications),
        notificationsByPriority: this.calculateNotificationsByPriority(notifications),
        deliveryStats: {
          sent: notifications.length,
          delivered: notifications.filter(n => !n.read || n.readAt).length,
          failed: 0, // Would need delivery tracking for this
          pending: notifications.filter(n => !n.read && !n.readAt).length
        }
      };

      logger.info('NotificationService: Successfully calculated notification statistics', { 
        userId,
        stats 
      });
      
      return success(stats);
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'NotificationService',
        action: 'getNotificationStats'
      });
      logger.error('NotificationService: Failed to get notification statistics', error, { userId });
      return failure(appError);
    }
  }

  async cleanupExpiredNotifications(): Promise<Result<number>> {
    try {
      logger.info('NotificationService: Cleaning up expired notifications');
      
      const now = new Date().toISOString();
      const expiredResult = await this.repository.getAll({
        filters: { expiresAt: { $lt: now } },
        limit: 1000
      });
      
      if (!expiredResult.success) {
        return failure(expiredResult.error);
      }

      const expiredNotifications = expiredResult.data.data;
      let deletedCount = 0;

      for (const notification of expiredNotifications) {
        const deleteResult = await this.repository.delete(notification.id);
        if (deleteResult.success) {
          deletedCount++;
        }
      }

      logger.info('NotificationService: Expired notifications cleaned up', { 
        found: expiredNotifications.length,
        deleted: deletedCount 
      });
      
      return success(deletedCount);
    } catch (error) {
      const appError = errorHandler.handle(error, {
        component: 'NotificationService',
        action: 'cleanupExpiredNotifications'
      });
      logger.error('NotificationService: Failed to cleanup expired notifications', error);
      return failure(appError);
    }
  }

  // Private methods
  private initializeTemplates(): void {
    // Course-related notifications
    this.templates.set('course_enrollment', {
      type: 'course_enrollment',
      title: 'Matrícula Confirmada',
      message: 'Você foi matriculado no curso "{{courseName}}"',
      priority: 'medium',
      expirationHours: 168
    });

    this.templates.set('course_completion', {
      type: 'course_completion',
      title: 'Curso Concluído!',
      message: 'Parabéns! Você concluiu o curso "{{courseName}}"',
      priority: 'high',
      expirationHours: 720
    });

    this.templates.set('lesson_available', {
      type: 'lesson_available',
      title: 'Nova Aula Disponível',
      message: 'A aula "{{lessonName}}" está disponível no curso "{{courseName}}"',
      priority: 'medium',
      expirationHours: 168
    });

    // Simulado-related notifications
    this.templates.set('simulado_assigned', {
      type: 'simulado_assigned',
      title: 'Simulado Atribuído',
      message: 'Você tem um novo simulado: "{{simuladoName}}"',
      priority: 'high',
      expirationHours: 168
    });

    this.templates.set('simulado_completed', {
      type: 'simulado_completed',
      title: 'Simulado Concluído',
      message: 'Você concluiu o simulado "{{simuladoName}}" com {{score}}% de acerto',
      priority: 'medium',
      expirationHours: 720
    });

    // Certificate notifications
    this.templates.set('certificate_ready', {
      type: 'certificate_ready',
      title: 'Certificado Disponível',
      message: 'Seu certificado do curso "{{courseName}}" está pronto para download',
      priority: 'high',
      expirationHours: 720
    });

    // System notifications
    this.templates.set('system_announcement', {
      type: 'system_announcement',
      title: 'Anúncio do Sistema',
      message: '{{message}}',
      priority: 'medium',
      expirationHours: 168
    });
  }

  private interpolateTemplate(template: string, data?: Record<string, any>): string {
    if (!data) return template;
    
    let result = template;
    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), String(value));
    }
    
    return result;
  }

  private async validateBusinessRulesForCreate(data: CreateNotificationDto): Promise<Result<void>> {
    // Check user notification limit
    const userNotificationsResult = await this.getUserNotifications(data.userId);
    if (userNotificationsResult.success) {
      const notificationCount = userNotificationsResult.data.meta.total;
      if (notificationCount >= this.config.maxNotificationsPerUser!) {
        const appError = errorHandler.handle(
          new Error(`User has reached maximum notification limit (${this.config.maxNotificationsPerUser})`),
          { component: 'NotificationService', action: 'validateBusinessRulesForCreate' }
        );
        return failure(appError);
      }
    }

    return success(undefined);
  }

  private async enrichCreateData(data: CreateNotificationDto): Promise<CreateNotificationDto> {
    return {
      ...data,
      expiresAt: data.expiresAt || new Date(
        Date.now() + this.config.defaultExpirationHours! * 60 * 60 * 1000
      ).toISOString()
    };
  }

  private async deliverNotification(notification: Notification, channels: NotificationChannel[]): Promise<void> {
    logger.info('NotificationService: Delivering notification', { 
      notificationId: notification.id,
      channels 
    });

    // In-app notifications are stored in database (already done)
    if (channels.includes('inApp')) {
      logger.debug('NotificationService: In-app notification stored', { 
        notificationId: notification.id 
      });
    }

    // Email notifications
    if (channels.includes('email') && this.config.enableEmailNotifications) {
      await this.sendEmailNotification(notification);
    }

    // Push notifications
    if (channels.includes('push') && this.config.enablePushNotifications) {
      await this.sendPushNotification(notification);
    }
  }

  private async sendEmailNotification(notification: Notification): Promise<void> {
    try {
      logger.info('NotificationService: Sending email notification', { 
        notificationId: notification.id,
        userId: notification.userId 
      });
      
      // Email sending logic would go here
      // For now, just log that it would be sent
      logger.debug('NotificationService: Email notification would be sent', {
        to: notification.userId,
        subject: notification.title,
        body: notification.message
      });
    } catch (error) {
      logger.error('NotificationService: Failed to send email notification', error, { 
        notificationId: notification.id 
      });
    }
  }

  private async sendPushNotification(notification: Notification): Promise<void> {
    try {
      logger.info('NotificationService: Sending push notification', { 
        notificationId: notification.id,
        userId: notification.userId 
      });
      
      // Push notification logic would go here
      // For now, just log that it would be sent
      logger.debug('NotificationService: Push notification would be sent', {
        to: notification.userId,
        title: notification.title,
        body: notification.message
      });
    } catch (error) {
      logger.error('NotificationService: Failed to send push notification', error, { 
        notificationId: notification.id 
      });
    }
  }

  private calculateNotificationsByType(notifications: Notification[]): Record<NotificationType, number> {
    const byType: Record<NotificationType, number> = {
      course_enrollment: 0,
      course_completion: 0,
      lesson_available: 0,
      simulado_assigned: 0,
      simulado_completed: 0,
      certificate_ready: 0,
      system_announcement: 0
    };

    notifications.forEach(notification => {
      byType[notification.type]++;
    });

    return byType;
  }

  private calculateNotificationsByPriority(notifications: Notification[]): Record<NotificationPriority, number> {
    const byPriority: Record<NotificationPriority, number> = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0
    };

    notifications.forEach(notification => {
      byPriority[notification.priority]++;
    });

    return byPriority;
  }

  // Post-action handlers
  private async handlePostCreation(notification: Notification): Promise<void> {
    logger.info('NotificationService: Handling post-creation actions', { 
      notificationId: notification.id 
    });
    // Additional post-creation logic can be added here
  }
}