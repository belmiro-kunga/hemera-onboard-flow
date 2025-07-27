// Course Assignment System Types

export type AssignmentPriority = 'low' | 'medium' | 'high';
export type AssignmentStatus = 'assigned' | 'in_progress' | 'completed' | 'overdue';
export type NotificationType = 'assignment_created' | 'due_soon' | 'overdue' | 'completed' | 'reminder';
export type ContentType = 'course' | 'simulado';

// Core Assignment Interface
export interface CourseAssignment {
  id: string;
  userId: string;
  contentType: ContentType;
  contentId: string;
  assignedBy: string;
  assignedAt: string;
  dueDate?: string;
  priority: AssignmentPriority;
  status: AssignmentStatus;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  
  // Related data (populated via joins)
  user?: {
    id: string;
    name: string;
    email: string;
    department?: string;
    jobTitle?: string;
    photoUrl?: string;
  };
  
  content?: {
    id: string;
    title: string;
    description: string;
    duration?: number;
    difficulty?: string;
    isActive: boolean;
    type: ContentType;
    // For simulados
    totalQuestions?: number;
    durationMinutes?: number;
  };
  
  assignedByUser?: {
    id: string;
    name: string;
    email: string;
  };
}

// Assignment Template Interface
export interface AssignmentTemplate {
  id: string;
  name: string;
  department?: string;
  jobTitle?: string;
  description?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  
  // Related data
  courses?: TemplateCourse[];
  createdByUser?: {
    id: string;
    name: string;
    email: string;
  };
  
  // Statistics
  userCount?: number;
  courseCount?: number;
}

// Template Course Interface
export interface TemplateCourse {
  id: string;
  templateId: string;
  contentType: ContentType;
  contentId: string;
  isMandatory: boolean;
  defaultDueDays: number;
  priority: AssignmentPriority;
  createdAt: string;
  
  // Related data
  content?: {
    id: string;
    title: string;
    description: string;
    duration?: number;
    difficulty?: string;
    type: ContentType;
    totalQuestions?: number;
    durationMinutes?: number;
  };
}

// Assignment Notification Interface
export interface AssignmentNotification {
  id: string;
  assignmentId: string;
  notificationType: NotificationType;
  sentAt: string;
  emailSent: boolean;
  inAppRead: boolean;
  createdAt: string;
  
  // Related data
  assignment?: CourseAssignment;
}

// Form Data Types
export interface CreateAssignmentData {
  userId: string;
  contentType: ContentType;
  contentId: string;
  dueDate?: string;
  priority: AssignmentPriority;
  notes?: string;
}

export interface UpdateAssignmentData {
  dueDate?: string;
  priority?: AssignmentPriority;
  status?: AssignmentStatus;
  notes?: string;
}

export interface BulkAssignmentData {
  userIds: string[];
  contentType: ContentType;
  contentId: string;
  dueDate?: string;
  priority: AssignmentPriority;
  notes?: string;
}

export interface CreateTemplateData {
  name: string;
  department?: string;
  jobTitle?: string;
  description?: string;
  contents: {
    contentType: ContentType;
    contentId: string;
    isMandatory: boolean;
    defaultDueDays: number;
    priority: AssignmentPriority;
  }[];
}

export interface UpdateTemplateData {
  name?: string;
  department?: string;
  jobTitle?: string;
  description?: string;
  isActive?: boolean;
}

// API Response Types
export interface AssignmentListResponse {
  assignments: CourseAssignment[];
  total: number;
  page: number;
  limit: number;
}

export interface TemplateListResponse {
  templates: AssignmentTemplate[];
  total: number;
  page: number;
  limit: number;
}

// Filter and Search Types
export interface AssignmentFilters {
  userId?: string;
  courseId?: string;
  assignedBy?: string;
  status?: AssignmentStatus[];
  priority?: AssignmentPriority[];
  department?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'assignedAt' | 'dueDate' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface TemplateFilters {
  department?: string;
  jobTitle?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'department' | 'jobTitle';
  sortOrder?: 'asc' | 'desc';
}

// Statistics and Reports Types
export interface AssignmentStats {
  totalAssignments: number;
  completedAssignments: number;
  overdueAssignments: number;
  inProgressAssignments: number;
  completionRate: number;
  averageCompletionTime: number; // in days
}

export interface DepartmentStats {
  department: string;
  totalAssignments: number;
  completedAssignments: number;
  completionRate: number;
  averageCompletionTime: number;
}

export interface UserAssignmentSummary {
  userId: string;
  userName: string;
  userEmail: string;
  department?: string;
  totalAssignments: number;
  completedAssignments: number;
  overdueAssignments: number;
  completionRate: number;
  lastActivity?: string;
}

export interface CourseAssignmentSummary {
  courseId: string;
  courseTitle: string;
  totalAssignments: number;
  completedAssignments: number;
  averageCompletionTime: number;
  completionRate: number;
}

// Bulk Operations Types
export interface BulkOperationResult {
  success: boolean;
  successCount: number;
  errorCount: number;
  errors: {
    userId?: string;
    courseId?: string;
    error: string;
  }[];
  createdAssignments?: string[]; // Assignment IDs
}

export interface CSVImportData {
  userEmail: string;
  courseTitle: string;
  dueDate?: string;
  priority?: AssignmentPriority;
  notes?: string;
}

export interface CSVImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: {
    row: number;
    data: CSVImportData;
    error: string;
  }[];
  preview?: CSVImportData[];
}

// Template Application Types
export interface TemplateApplicationResult {
  success: boolean;
  templateId: string;
  userId: string;
  assignmentsCreated: number;
  errors?: string[];
}

// Notification Preferences Types
export interface NotificationPreferences {
  userId: string;
  emailNotifications: boolean;
  inAppNotifications: boolean;
  reminderDaysBefore: number;
  overdueReminders: boolean;
  completionNotifications: boolean;
}

// Dashboard Types
export interface AssignmentDashboardData {
  stats: AssignmentStats;
  departmentStats: DepartmentStats[];
  recentAssignments: CourseAssignment[];
  overdueAssignments: CourseAssignment[];
  upcomingDueDates: CourseAssignment[];
  topCourses: CourseAssignmentSummary[];
  activeUsers: UserAssignmentSummary[];
}

// Export Types
export interface ExportOptions {
  format: 'csv' | 'pdf';
  filters?: AssignmentFilters;
  includeUserDetails: boolean;
  includeCourseDetails: boolean;
  includeProgress: boolean;
  dateRange?: {
    from: string;
    to: string;
  };
}

// Utility Types
export type AssignmentFormMode = 'create' | 'edit' | 'view';
export type TemplateFormMode = 'create' | 'edit' | 'view';

// Error Types
export interface AssignmentError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: AssignmentError[];
}

// Hook Return Types
export interface UseAssignmentsReturn {
  assignments: CourseAssignment[];
  loading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  refetch: () => void;
  loadMore: () => void;
}

export interface UseAssignmentTemplatesReturn {
  templates: AssignmentTemplate[];
  loading: boolean;
  error: string | null;
  total: number;
  refetch: () => void;
}

export interface UseAssignmentStatsReturn {
  stats: AssignmentStats | null;
  departmentStats: DepartmentStats[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}