// Application constants

// API Constants
export const API_CONSTANTS = {
  ENDPOINTS: {
    VIDEO_COURSES: '/api/video-courses',
    VIDEO_LESSONS: '/api/video-lessons',
    SIMULADOS: '/api/simulados',
    USERS: '/api/users',
    AUTH: '/api/auth',
    UPLOADS: '/api/uploads',
    ANALYTICS: '/api/analytics'
  },
  METHODS: {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    PATCH: 'PATCH',
    DELETE: 'DELETE'
  },
  HEADERS: {
    CONTENT_TYPE: 'Content-Type',
    AUTHORIZATION: 'Authorization',
    REQUEST_ID: 'X-Request-ID',
    USER_AGENT: 'User-Agent'
  },
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
  }
} as const;

// UI Constants
export const UI_CONSTANTS = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    MIN_PAGE_SIZE: 5
  },
  DEBOUNCE: {
    SEARCH: 300,
    INPUT: 150,
    RESIZE: 100
  },
  TIMEOUTS: {
    TOAST: 5000,
    MODAL: 300,
    ANIMATION: 200,
    LOADING: 30000
  },
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536
  },
  Z_INDEX: {
    DROPDOWN: 1000,
    MODAL: 1050,
    TOAST: 1100,
    TOOLTIP: 1200
  }
} as const;

// File Upload Constants
export const FILE_CONSTANTS = {
  MAX_SIZES: {
    IMAGE: 5 * 1024 * 1024, // 5MB
    VIDEO: 100 * 1024 * 1024, // 100MB
    DOCUMENT: 10 * 1024 * 1024 // 10MB
  },
  SUPPORTED_FORMATS: {
    IMAGES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    VIDEOS: ['video/mp4', 'video/webm', 'video/ogg'],
    DOCUMENTS: ['application/pdf', 'text/plain', 'application/msword']
  },
  UPLOAD_PATHS: {
    COURSE_THUMBNAILS: '/uploads/courses/thumbnails',
    LESSON_VIDEOS: '/uploads/lessons/videos',
    USER_AVATARS: '/uploads/users/avatars',
    DOCUMENTS: '/uploads/documents'
  }
} as const;

// Validation Constants
export const VALIDATION_CONSTANTS = {
  LENGTHS: {
    TITLE_MIN: 3,
    TITLE_MAX: 100,
    DESCRIPTION_MIN: 10,
    DESCRIPTION_MAX: 1000,
    NAME_MIN: 2,
    NAME_MAX: 50,
    EMAIL_MAX: 254,
    PASSWORD_MIN: 8,
    PASSWORD_MAX: 128
  },
  PATTERNS: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^\+?[\d\s\-\(\)]+$/,
    URL: /^https?:\/\/.+/,
    SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  },
  MESSAGES: {
    REQUIRED: 'Este campo é obrigatório',
    EMAIL_INVALID: 'Email inválido',
    PASSWORD_WEAK: 'Senha deve ter pelo menos 8 caracteres',
    URL_INVALID: 'URL inválida',
    FILE_TOO_LARGE: 'Arquivo muito grande',
    FILE_TYPE_INVALID: 'Tipo de arquivo não suportado'
  }
} as const;

// Business Logic Constants
export const BUSINESS_CONSTANTS = {
  COURSE_STATUS: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived'
  },
  USER_ROLES: {
    ADMIN: 'admin',
    INSTRUCTOR: 'instructor',
    STUDENT: 'student'
  },
  SIMULADO_TYPES: {
    PRACTICE: 'practice',
    EXAM: 'exam',
    QUIZ: 'quiz'
  },
  QUESTION_TYPES: {
    MULTIPLE_CHOICE: 'multiple_choice',
    TRUE_FALSE: 'true_false',
    ESSAY: 'essay'
  },
  ENROLLMENT_STATUS: {
    PENDING: 'pending',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  }
} as const;

// Cache Constants
export const CACHE_CONSTANTS = {
  KEYS: {
    VIDEO_COURSES: 'video_courses',
    SIMULADOS: 'simulados',
    USERS: 'users',
    USER_PROFILE: 'user_profile'
  },
  TTL: {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 30 * 60 * 1000, // 30 minutes
    LONG: 2 * 60 * 60 * 1000, // 2 hours
    VERY_LONG: 24 * 60 * 60 * 1000 // 24 hours
  },
  STRATEGIES: {
    CACHE_FIRST: 'cache-first',
    NETWORK_FIRST: 'network-first',
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
  }
} as const;

// Error Constants
export const ERROR_CONSTANTS = {
  CODES: {
    NETWORK_ERROR: 'NETWORK_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    SERVER_ERROR: 'SERVER_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
  },
  MESSAGES: {
    NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
    VALIDATION_ERROR: 'Dados inválidos. Verifique as informações.',
    AUTHENTICATION_ERROR: 'Sessão expirada. Faça login novamente.',
    AUTHORIZATION_ERROR: 'Você não tem permissão para esta ação.',
    NOT_FOUND: 'Recurso não encontrado.',
    SERVER_ERROR: 'Erro interno do servidor.',
    UNKNOWN_ERROR: 'Erro inesperado. Tente novamente.'
  }
} as const;

// Route Constants
export const ROUTE_CONSTANTS = {
  PATHS: {
    HOME: '/',
    LOGIN: '/login',
    DASHBOARD: '/dashboard',
    VIDEO_COURSES: '/admin/video-courses',
    SIMULADOS: '/admin/simulados',
    USERS: '/admin/users',
    PROFILE: '/profile',
    SETTINGS: '/settings'
  },
  PARAMS: {
    ID: ':id',
    SLUG: ':slug',
    TAB: ':tab'
  }
} as const;

// Local Storage Keys
export const STORAGE_CONSTANTS = {
  KEYS: {
    AUTH_TOKEN: 'auth_token',
    USER_PREFERENCES: 'user_preferences',
    THEME: 'theme',
    LANGUAGE: 'language',
    CACHE_PREFIX: 'app_cache_'
  },
  EXPIRY: {
    TOKEN: 7 * 24 * 60 * 60 * 1000, // 7 days
    PREFERENCES: 30 * 24 * 60 * 60 * 1000, // 30 days
    CACHE: 24 * 60 * 60 * 1000 // 24 hours
  }
} as const;

// Performance Constants
export const PERFORMANCE_CONSTANTS = {
  THRESHOLDS: {
    SLOW_QUERY: 1000, // 1 second
    SLOW_RENDER: 16, // 16ms (60fps)
    MEMORY_WARNING: 50 * 1024 * 1024, // 50MB
    BUNDLE_SIZE_WARNING: 1024 * 1024 // 1MB
  },
  METRICS: {
    FCP: 'first-contentful-paint',
    LCP: 'largest-contentful-paint',
    FID: 'first-input-delay',
    CLS: 'cumulative-layout-shift'
  }
} as const;

// Export all constants as a single object for easier importing
export const CONSTANTS = {
  API: API_CONSTANTS,
  UI: UI_CONSTANTS,
  FILE: FILE_CONSTANTS,
  VALIDATION: VALIDATION_CONSTANTS,
  BUSINESS: BUSINESS_CONSTANTS,
  CACHE: CACHE_CONSTANTS,
  ERROR: ERROR_CONSTANTS,
  ROUTE: ROUTE_CONSTANTS,
  STORAGE: STORAGE_CONSTANTS,
  PERFORMANCE: PERFORMANCE_CONSTANTS
} as const;