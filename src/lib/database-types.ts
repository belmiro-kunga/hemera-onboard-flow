// Database types and interfaces

export interface DatabaseResponse<T = any> {
  data: T | null;
  error: any;
}

export interface QueryOptions {
  ascending?: boolean;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  email_confirmed: boolean;
  last_sign_in_at?: string;
}

export interface Profile {
  user_id: string;
  full_name?: string;
  job_position?: string;
  department?: string;
  created_at: string;
  updated_at: string;
}

export interface VideoCourse {
  id: string;
  title: string;
  description?: string;
  video_url?: string;
  duration?: number;
  created_at: string;
  updated_at: string;
}

export interface CourseEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  progress_percentage: number;
  completed_at?: string;
  last_accessed_at?: string;
}

export interface CourseAssignment {
  id: string;
  user_id: string;
  content_type: 'course' | 'simulado';
  content_id: string;
  assigned_by: string;
  assigned_at: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue';
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AssignmentTemplate {
  id: string;
  name: string;
  department?: string;
  job_title?: string;
  description?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TemplateCourse {
  id: string;
  template_id: string;
  content_type: 'course' | 'simulado';
  content_id: string;
  is_mandatory: boolean;
  default_due_days: number;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface AssignmentNotification {
  id: string;
  assignment_id: string;
  notification_type: 'assignment_created' | 'due_soon' | 'overdue' | 'completed' | 'reminder';
  sent_at: string;
  email_sent: boolean;
  in_app_read: boolean;
  created_at: string;
}

export interface Simulado {
  id: string;
  title: string;
  description?: string;
  questions_count?: number;
  time_limit?: number;
  created_at: string;
  updated_at: string;
}

// Database table names
export const Tables = {
  USERS: 'auth.users',
  PROFILES: 'profiles',
  VIDEO_COURSES: 'video_courses',
  COURSE_ENROLLMENTS: 'course_enrollments',
  COURSE_ASSIGNMENTS: 'course_assignments',
  ASSIGNMENT_TEMPLATES: 'assignment_templates',
  TEMPLATE_COURSES: 'template_courses',
  ASSIGNMENT_NOTIFICATIONS: 'assignment_notifications',
  SIMULADOS: 'simulados',
} as const;

// RPC function names
export const RPCFunctions = {
  IS_ADMIN_USER: 'is_admin_user',
  APPLY_TEMPLATE_TO_USER: 'apply_template_to_user',
  MARK_OVERDUE_ASSIGNMENTS: 'mark_overdue_assignments',
} as const;