// Toast Service - User Feedback Messages
import { logger } from '../lib/logging/logger';
import { errorHandler } from '../lib/errors/handler';
import { AppError } from '../lib/types/base';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: number;
}

export interface ToastServiceConfig {
  defaultDuration?: number;
  maxToasts?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  enableSounds?: boolean;
  enableAnimations?: boolean;
}

export type ToastSubscriber = (toasts: ToastMessage[]) => void;

export class ToastService {
  private static instance: ToastService;
  private toasts: ToastMessage[] = [];
  private subscribers: Set<ToastSubscriber> = new Set();
  private config: ToastServiceConfig;
  private nextId = 1;

  private constructor(config?: ToastServiceConfig) {
    this.config = {
      defaultDuration: 5000,
      maxToasts: 5,
      position: 'top-right',
      enableSounds: false,
      enableAnimations: true,
      ...config
    };

    logger.info('ToastService: Initialized', { config: this.config });
  }

  static getInstance(config?: ToastServiceConfig): ToastService {
    if (!ToastService.instance) {
      ToastService.instance = new ToastService(config);
    }
    return ToastService.instance;
  }

  // Subscription methods
  subscribe(callback: ToastSubscriber): () => void {
    this.subscribers.add(callback);
    
    // Immediately call with current toasts
    callback([...this.toasts]);
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers(): void {
    const toastsCopy = [...this.toasts];
    this.subscribers.forEach(callback => {
      try {
        callback(toastsCopy);
      } catch (error) {
        logger.error('ToastService: Subscriber callback error', error);
      }
    });
  }

  // Toast creation methods
  success(message: string, options?: Partial<ToastMessage>): string {
    return this.addToast({
      type: 'success',
      message,
      title: options?.title || 'Sucesso',
      ...options
    });
  }

  error(message: string, options?: Partial<ToastMessage>): string {
    return this.addToast({
      type: 'error',
      message,
      title: options?.title || 'Erro',
      persistent: true, // Errors should be persistent by default
      ...options
    });
  }

  warning(message: string, options?: Partial<ToastMessage>): string {
    return this.addToast({
      type: 'warning',
      message,
      title: options?.title || 'Atenção',
      ...options
    });
  }

  info(message: string, options?: Partial<ToastMessage>): string {
    return this.addToast({
      type: 'info',
      message,
      title: options?.title || 'Informação',
      ...options
    });
  }

  // Specialized methods for common scenarios
  successOperation(operation: string, entity?: string): string {
    const message = entity 
      ? `${entity} ${operation} com sucesso`
      : `${operation} realizada com sucesso`;
    
    return this.success(message);
  }

  errorOperation(operation: string, entity?: string, error?: AppError): string {
    let message = entity 
      ? `Erro ao ${operation} ${entity}`
      : `Erro ao realizar ${operation}`;

    if (error) {
      message = errorHandler.formatForUser(error);
    }
    
    return this.error(message, {
      action: {
        label: 'Tentar Novamente',
        onClick: () => {
          logger.info('ToastService: User clicked retry on error toast');
          // The actual retry logic would be handled by the calling component
        }
      }
    });
  }

  validationError(errors: string[]): string {
    const message = errors.length === 1 
      ? errors[0]
      : `${errors.length} erros de validação encontrados`;
    
    return this.error(message, {
      title: 'Dados Inválidos'
    });
  }

  networkError(): string {
    return this.error('Problema de conexão. Verifique sua internet e tente novamente.', {
      title: 'Erro de Conexão',
      action: {
        label: 'Tentar Novamente',
        onClick: () => {
          logger.info('ToastService: User clicked retry on network error');
        }
      }
    });
  }

  loading(message: string): string {
    return this.info(message, {
      title: 'Carregando...',
      persistent: true
    });
  }

  // Toast management methods
  private addToast(toast: Partial<ToastMessage>): string {
    const id = this.generateId();
    const newToast: ToastMessage = {
      id,
      type: 'info',
      message: '',
      duration: this.config.defaultDuration,
      persistent: false,
      createdAt: Date.now(),
      ...toast
    };

    // Add to beginning of array (newest first)
    this.toasts.unshift(newToast);

    // Enforce max toasts limit
    if (this.toasts.length > this.config.maxToasts!) {
      const removedToasts = this.toasts.splice(this.config.maxToasts!);
      removedToasts.forEach(toast => {
        if (toast.persistent) {
          // Keep persistent toasts, remove oldest non-persistent instead
          const nonPersistentIndex = this.toasts.findIndex(t => !t.persistent);
          if (nonPersistentIndex !== -1) {
            this.toasts.splice(nonPersistentIndex, 1);
            this.toasts.push(toast); // Re-add the persistent toast
          }
        }
      });
    }

    // Auto-remove non-persistent toasts
    if (!newToast.persistent && newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.removeToast(id);
      }, newToast.duration);
    }

    logger.debug('ToastService: Toast added', { 
      id, 
      type: newToast.type, 
      message: newToast.message 
    });

    this.notifySubscribers();
    return id;
  }

  removeToast(id: string): void {
    const index = this.toasts.findIndex(toast => toast.id === id);
    if (index !== -1) {
      const removedToast = this.toasts.splice(index, 1)[0];
      logger.debug('ToastService: Toast removed', { 
        id, 
        type: removedToast.type 
      });
      this.notifySubscribers();
    }
  }

  removeAllToasts(): void {
    const count = this.toasts.length;
    this.toasts = [];
    logger.debug('ToastService: All toasts removed', { count });
    this.notifySubscribers();
  }

  removeToastsByType(type: ToastType): void {
    const initialCount = this.toasts.length;
    this.toasts = this.toasts.filter(toast => toast.type !== type);
    const removedCount = initialCount - this.toasts.length;
    
    if (removedCount > 0) {
      logger.debug('ToastService: Toasts removed by type', { type, removedCount });
      this.notifySubscribers();
    }
  }

  // Utility methods
  getToasts(): ToastMessage[] {
    return [...this.toasts];
  }

  getToastById(id: string): ToastMessage | undefined {
    return this.toasts.find(toast => toast.id === id);
  }

  hasToasts(): boolean {
    return this.toasts.length > 0;
  }

  hasErrorToasts(): boolean {
    return this.toasts.some(toast => toast.type === 'error');
  }

  getToastCount(): number {
    return this.toasts.length;
  }

  getToastCountByType(type: ToastType): number {
    return this.toasts.filter(toast => toast.type === type).length;
  }

  // Configuration methods
  updateConfig(newConfig: Partial<ToastServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('ToastService: Configuration updated', { config: this.config });
  }

  getConfig(): ToastServiceConfig {
    return { ...this.config };
  }

  // Batch operations
  showMultiple(messages: Array<{ type: ToastType; message: string; title?: string }>): string[] {
    const ids: string[] = [];
    
    messages.forEach(({ type, message, title }) => {
      let id: string;
      
      switch (type) {
        case 'success':
          id = this.success(message, { title });
          break;
        case 'error':
          id = this.error(message, { title });
          break;
        case 'warning':
          id = this.warning(message, { title });
          break;
        case 'info':
          id = this.info(message, { title });
          break;
        default:
          id = this.info(message, { title });
      }
      
      ids.push(id);
    });

    return ids;
  }

  // Promise-based helpers
  async withToast<T>(
    promise: Promise<T>,
    messages: {
      loading?: string;
      success?: string;
      error?: string;
    }
  ): Promise<T> {
    let loadingId: string | undefined;

    try {
      // Show loading toast
      if (messages.loading) {
        loadingId = this.loading(messages.loading);
      }

      // Wait for promise
      const result = await promise;

      // Remove loading toast
      if (loadingId) {
        this.removeToast(loadingId);
      }

      // Show success toast
      if (messages.success) {
        this.success(messages.success);
      }

      return result;
    } catch (error) {
      // Remove loading toast
      if (loadingId) {
        this.removeToast(loadingId);
      }

      // Show error toast
      if (messages.error) {
        this.error(messages.error);
      } else {
        // Default error message
        const appError = errorHandler.handle(error);
        this.error(errorHandler.formatForUser(appError));
      }

      throw error;
    }
  }

  // Private helper methods
  private generateId(): string {
    return `toast_${this.nextId++}_${Date.now()}`;
  }

  // Cleanup method
  cleanup(): void {
    this.toasts = [];
    this.subscribers.clear();
    logger.info('ToastService: Cleaned up');
  }
}

// Export singleton instance
export const toastService = ToastService.getInstance();

// Export convenience functions
export const toast = {
  success: (message: string, options?: Partial<ToastMessage>) => 
    toastService.success(message, options),
  
  error: (message: string, options?: Partial<ToastMessage>) => 
    toastService.error(message, options),
  
  warning: (message: string, options?: Partial<ToastMessage>) => 
    toastService.warning(message, options),
  
  info: (message: string, options?: Partial<ToastMessage>) => 
    toastService.info(message, options),

  // Specialized methods
  successOperation: (operation: string, entity?: string) => 
    toastService.successOperation(operation, entity),
  
  errorOperation: (operation: string, entity?: string, error?: AppError) => 
    toastService.errorOperation(operation, entity, error),
  
  validationError: (errors: string[]) => 
    toastService.validationError(errors),
  
  networkError: () => 
    toastService.networkError(),
  
  loading: (message: string) => 
    toastService.loading(message),

  // Management methods
  remove: (id: string) => 
    toastService.removeToast(id),
  
  removeAll: () => 
    toastService.removeAllToasts(),
  
  removeByType: (type: ToastType) => 
    toastService.removeToastsByType(type),

  // Utility methods
  subscribe: (callback: ToastSubscriber) => 
    toastService.subscribe(callback),
  
  withToast: <T>(promise: Promise<T>, messages: { loading?: string; success?: string; error?: string }) => 
    toastService.withToast(promise, messages)
};