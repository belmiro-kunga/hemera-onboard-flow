// Domain entity types
import { BaseEntity, ID, EntityStatus } from './base';

// User types
export interface User extends BaseEntity {
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  status: EntityStatus;
  lastLoginAt?: string;
  emailVerifiedAt?: string;
  preferences: UserPreferences;
}

export type UserRole = 'admin' | 'instructor' | 'student';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
  privacy: {
    profileVisible: boolean;
    showEmail: boolean;
  };
}

export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserDto {
  name?: string;
  avatar?: string;
  role?: UserRole;
  status?: EntityStatus;
  preferences?: Partial<UserPreferences>;
}

// Video Course types
export interface VideoCourse extends BaseEntity {
  title: string;
  description: string;
  thumbnail?: string;
  status: CourseStatus;
  instructorId: ID;
  instructor?: User;
  category: string;
  tags: string[];
  duration: number; // in minutes
  level: CourseLevel;
  price: number;
  currency: string;
  enrollmentCount: number;
  rating: number;
  ratingCount: number;
  lessons: VideoLesson[];
  metadata: CourseMetadata;
}

export type CourseStatus = 'draft' | 'published' | 'archived';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export interface CourseMetadata {
  language: string;
  subtitles: string[];
  requirements: string[];
  objectives: string[];
  targetAudience: string[];
}

export interface CreateVideoCourseDto {
  title: string;
  description: string;
  thumbnail?: string;
  instructorId: ID;
  category: string;
  tags: string[];
  level: CourseLevel;
  price: number;
  currency: string;
  metadata: CourseMetadata;
}

export interface UpdateVideoCourseDto {
  title?: string;
  description?: string;
  thumbnail?: string;
  status?: CourseStatus;
  category?: string;
  tags?: string[];
  level?: CourseLevel;
  price?: number;
  metadata?: Partial<CourseMetadata>;
}

// Video Lesson types
export interface VideoLesson extends BaseEntity {
  title: string;
  description: string;
  videoUrl: string;
  duration: number; // in seconds
  order: number;
  courseId: ID;
  course?: VideoCourse;
  status: EntityStatus;
  isPreview: boolean;
  resources: LessonResource[];
  transcript?: string;
  metadata: LessonMetadata;
}

export interface LessonResource {
  id: ID;
  title: string;
  type: 'pdf' | 'link' | 'file';
  url: string;
  size?: number;
}

export interface LessonMetadata {
  videoQuality: string[];
  hasSubtitles: boolean;
  subtitleLanguages: string[];
  chapters: LessonChapter[];
}

export interface LessonChapter {
  title: string;
  startTime: number; // in seconds
  endTime: number;
}

export interface CreateVideoLessonDto {
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  order: number;
  courseId: ID;
  isPreview: boolean;
  resources?: Omit<LessonResource, 'id'>[];
  transcript?: string;
  metadata: LessonMetadata;
}

export interface UpdateVideoLessonDto {
  title?: string;
  description?: string;
  videoUrl?: string;
  duration?: number;
  order?: number;
  status?: EntityStatus;
  isPreview?: boolean;
  resources?: LessonResource[];
  transcript?: string;
  metadata?: Partial<LessonMetadata>;
}

// Course Enrollment types
export interface CourseEnrollment extends BaseEntity {
  userId: ID;
  user?: User;
  courseId: ID;
  course?: VideoCourse;
  status: EnrollmentStatus;
  progress: number; // percentage 0-100
  completedLessons: ID[];
  lastAccessedAt?: string;
  completedAt?: string;
  certificateUrl?: string;
  enrollmentSource: EnrollmentSource;
}

export type EnrollmentStatus = 'pending' | 'active' | 'completed' | 'cancelled' | 'expired';
export type EnrollmentSource = 'direct' | 'assignment' | 'bulk' | 'promotion';

export interface CreateCourseEnrollmentDto {
  userId: ID;
  courseId: ID;
  enrollmentSource: EnrollmentSource;
}

export interface UpdateCourseEnrollmentDto {
  status?: EnrollmentStatus;
  progress?: number;
  completedLessons?: ID[];
  lastAccessedAt?: string;
  completedAt?: string;
}

// Simulado types
export interface Simulado extends BaseEntity {
  title: string;
  description: string;
  type: SimuladoType;
  category: string;
  difficulty: DifficultyLevel;
  timeLimit: number; // in minutes
  passingScore: number; // percentage
  maxAttempts: number;
  status: EntityStatus;
  isPublic: boolean;
  createdBy: ID;
  creator?: User;
  questions: SimuladoQuestion[];
  tags: string[];
  metadata: SimuladoMetadata;
}

export type SimuladoType = 'practice' | 'exam' | 'quiz' | 'assessment';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface SimuladoMetadata {
  instructions: string;
  showResults: boolean;
  showCorrectAnswers: boolean;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  allowReview: boolean;
  certificateTemplate?: string;
}

export interface CreateSimuladoDto {
  title: string;
  description: string;
  type: SimuladoType;
  category: string;
  difficulty: DifficultyLevel;
  timeLimit: number;
  passingScore: number;
  maxAttempts: number;
  isPublic: boolean;
  createdBy: ID;
  tags: string[];
  metadata: SimuladoMetadata;
}

export interface UpdateSimuladoDto {
  title?: string;
  description?: string;
  type?: SimuladoType;
  category?: string;
  difficulty?: DifficultyLevel;
  timeLimit?: number;
  passingScore?: number;
  maxAttempts?: number;
  status?: EntityStatus;
  isPublic?: boolean;
  tags?: string[];
  metadata?: Partial<SimuladoMetadata>;
}

// Simulado Question types
export interface SimuladoQuestion extends BaseEntity {
  simuladoId: ID;
  simulado?: Simulado;
  question: string;
  type: QuestionType;
  order: number;
  points: number;
  explanation?: string;
  options: QuestionOption[];
  correctAnswers: ID[]; // IDs of correct options
  metadata: QuestionMetadata;
}

export type QuestionType = 'multiple_choice' | 'single_choice' | 'true_false' | 'essay' | 'fill_blank';

export interface QuestionOption extends BaseEntity {
  questionId: ID;
  text: string;
  order: number;
  isCorrect: boolean;
}

export interface QuestionMetadata {
  difficulty: DifficultyLevel;
  category: string;
  tags: string[];
  estimatedTime: number; // in seconds
  references: string[];
}

export interface CreateSimuladoQuestionDto {
  simuladoId: ID;
  question: string;
  type: QuestionType;
  order: number;
  points: number;
  explanation?: string;
  options: Omit<QuestionOption, 'id' | 'questionId' | 'createdAt' | 'updatedAt'>[];
  metadata: QuestionMetadata;
}

export interface UpdateSimuladoQuestionDto {
  question?: string;
  type?: QuestionType;
  order?: number;
  points?: number;
  explanation?: string;
  options?: QuestionOption[];
  metadata?: Partial<QuestionMetadata>;
}

// Simulado Attempt types
export interface SimuladoAttempt extends BaseEntity {
  simuladoId: ID;
  simulado?: Simulado;
  userId: ID;
  user?: User;
  status: AttemptStatus;
  startedAt: string;
  completedAt?: string;
  timeSpent: number; // in seconds
  score: number; // percentage
  passed: boolean;
  answers: SimuladoAnswer[];
  metadata: AttemptMetadata;
}

export type AttemptStatus = 'in_progress' | 'completed' | 'abandoned' | 'expired';

export interface SimuladoAnswer {
  questionId: ID;
  selectedOptions: ID[];
  textAnswer?: string;
  isCorrect: boolean;
  points: number;
  timeSpent: number; // in seconds
}

export interface AttemptMetadata {
  ipAddress?: string;
  userAgent?: string;
  browserInfo?: Record<string, any>;
  cheatingFlags: string[];
  reviewRequested: boolean;
}

export interface CreateSimuladoAttemptDto {
  simuladoId: ID;
  userId: ID;
}

export interface UpdateSimuladoAttemptDto {
  status?: AttemptStatus;
  completedAt?: string;
  timeSpent?: number;
  answers?: SimuladoAnswer[];
  metadata?: Partial<AttemptMetadata>;
}

// Analytics types
export interface CourseAnalytics {
  courseId: ID;
  totalEnrollments: number;
  activeEnrollments: number;
  completionRate: number;
  averageProgress: number;
  averageRating: number;
  totalRevenue: number;
  enrollmentTrend: TrendData[];
  completionTrend: TrendData[];
  lessonAnalytics: LessonAnalytics[];
}

export interface LessonAnalytics {
  lessonId: ID;
  viewCount: number;
  completionRate: number;
  averageWatchTime: number;
  dropOffPoints: number[];
}

export interface SimuladoAnalytics {
  simuladoId: ID;
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  averageTimeSpent: number;
  questionAnalytics: QuestionAnalytics[];
  difficultyDistribution: Record<DifficultyLevel, number>;
}

export interface QuestionAnalytics {
  questionId: ID;
  correctAnswerRate: number;
  averageTimeSpent: number;
  commonWrongAnswers: ID[];
}

export interface TrendData {
  date: string;
  value: number;
}

// Notification types
export interface Notification extends BaseEntity {
  userId: ID;
  user?: User;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  readAt?: string;
  priority: NotificationPriority;
  expiresAt?: string;
}

export type NotificationType = 
  | 'course_enrollment' 
  | 'course_completion' 
  | 'lesson_available' 
  | 'simulado_assigned' 
  | 'simulado_completed' 
  | 'certificate_ready' 
  | 'system_announcement';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface CreateNotificationDto {
  userId: ID;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority: NotificationPriority;
  expiresAt?: string;
}