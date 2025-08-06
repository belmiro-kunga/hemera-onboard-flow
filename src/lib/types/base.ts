// Base types and interfaces

// Generic ID type
export type ID = string | number;

// Generic timestamp fields
export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

// Base entity interface
export interface BaseEntity extends Timestamps {
  id: ID;
}

// Result pattern for error handling
export type Result<T, E = Error> = Success<T> | Failure<E>;

export interface Success<T> {
  success: true;
  data: T;
}

export interface Failure<E> {
  success: false;
  error: E;
}

// Helper functions for Result pattern
export const success = <T>(data: T): Success<T> => ({
  success: true,
  data
});

export const failure = <E>(error: E): Failure<E> => ({
  success: false,
  error
});

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// API Response types
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    pagination?: PaginationMeta;
    timestamp: string;
    requestId: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId?: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Query parameters for filtering and searching
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  filters?: Record<string, any>;
  sort?: SortOptions;
  include?: string[];
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Generic CRUD operations interface
export interface CrudOperations<T, CreateT = Partial<T>, UpdateT = Partial<T>> {
  getAll(params?: QueryParams): Promise<Result<PaginatedResponse<T>>>;
  getById(id: ID): Promise<Result<T>>;
  create(data: CreateT): Promise<Result<T>>;
  update(id: ID, data: UpdateT): Promise<Result<T>>;
  delete(id: ID): Promise<Result<void>>;
}

// Service interface
export interface IService<T, CreateT = Partial<T>, UpdateT = Partial<T>> 
  extends CrudOperations<T, CreateT, UpdateT> {
  // Additional service-specific methods can be added by extending services
}

// Repository interface
export interface IRepository<T, CreateT = Partial<T>, UpdateT = Partial<T>> 
  extends CrudOperations<T, CreateT, UpdateT> {
  // Repository-specific methods
  exists(id: ID): Promise<Result<boolean>>;
  count(filters?: Record<string, any>): Promise<Result<number>>;
}

// Cache interface
export interface ICache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
}

// Logger interface
export interface ILogger {
  debug(message: string, data?: Record<string, any>): void;
  info(message: string, data?: Record<string, any>): void;
  warn(message: string, data?: Record<string, any>): void;
  error(message: string, error?: Error, data?: Record<string, any>): void;
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

// Application Error class
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Validator interface
export interface IValidator<T> {
  validate(data: T): ValidationResult;
  validateField(field: keyof T, value: any): ValidationError | null;
}

// Event system types
export interface DomainEvent {
  type: string;
  payload: Record<string, any>;
  timestamp: string;
  aggregateId: ID;
}

export interface IEventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}

// HTTP client types
export interface HttpClientConfig {
  baseURL: string;
  timeout: number;
  headers?: Record<string, string>;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface IHttpClient {
  get<T>(url: string, config?: RequestConfig): Promise<HttpResponse<T>>;
  post<T>(url: string, data?: any, config?: RequestConfig): Promise<HttpResponse<T>>;
  put<T>(url: string, data?: any, config?: RequestConfig): Promise<HttpResponse<T>>;
  patch<T>(url: string, data?: any, config?: RequestConfig): Promise<HttpResponse<T>>;
  delete<T>(url: string, config?: RequestConfig): Promise<HttpResponse<T>>;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
}

// File upload types
export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

// Form types
export interface FormField<T = any> {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

export interface FormState<T extends Record<string, any>> {
  fields: { [K in keyof T]: FormField<T[K]> };
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
}

// Component props types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}

export interface LoadingProps {
  loading?: boolean;
  loadingText?: string;
}

export interface ErrorProps {
  error?: Error | string | null;
  onRetry?: () => void;
}

// Hook return types
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface AsyncActions {
  execute: () => Promise<void>;
  reset: () => void;
}

export interface UseAsyncReturn<T> extends AsyncState<T>, AsyncActions {}

// Theme types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    surface: string;
    text: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Status types
export type Status = 'idle' | 'loading' | 'success' | 'error';

// Generic entity status
export type EntityStatus = 'active' | 'inactive' | 'draft' | 'archived';

// Permission types
export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface Role {
  id: ID;
  name: string;
  permissions: Permission[];
}

// Audit types
export interface AuditLog extends BaseEntity {
  entityType: string;
  entityId: ID;
  action: string;
  changes: Record<string, any>;
  userId: ID;
  userEmail: string;
  ipAddress?: string;
  userAgent?: string;
}