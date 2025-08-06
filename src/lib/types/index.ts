// Types module exports

export * from './base';
export * from './entities';

// Re-export commonly used types for convenience
export type {
  ID,
  BaseEntity,
  Result,
  Success,
  Failure,
  ApiResponse,
  PaginatedResponse,
  QueryParams,
  ValidationResult,
  ValidationError
} from './base';

export type {
  User,
  VideoCourse,
  VideoLesson,
  CourseEnrollment,
  Simulado,
  SimuladoQuestion,
  SimuladoAttempt,
  CreateVideoCourseDto,
  UpdateVideoCourseDto,
  CreateVideoLessonDto,
  UpdateVideoLessonDto,
  CreateSimuladoDto,
  UpdateSimuladoDto
} from './entities';

// Helper functions
export { success, failure } from './base';