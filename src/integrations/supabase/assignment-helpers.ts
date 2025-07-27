import { supabase } from './client';
import { Database } from './types';
import { AssignmentFilters, TemplateFilters } from '../../types/assignment.types';

// Type aliases for better readability
type CourseAssignmentRow = Database['public']['Tables']['course_assignments']['Row'];
type AssignmentTemplateRow = Database['public']['Tables']['assignment_templates']['Row'];
type TemplateCourseRow = Database['public']['Tables']['template_courses']['Row'];
type AssignmentNotificationRow = Database['public']['Tables']['assignment_notifications']['Row'];

// Assignment query helpers
export const assignmentQueries = {
  // Get assignments with filters and pagination
  async getAssignments(filters: AssignmentFilters = {}) {
    let query = supabase
      .from('course_assignments')
      .select(`
        *,
        user:profiles!course_assignments_user_id_fkey(
          user_id,
          name,
          email,
          department,
          job_position,
          photo_url
        ),
        assigned_by_user:profiles!course_assignments_assigned_by_fkey(
          user_id,
          name,
          email
        )
      `);

    // Apply filters
    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }
    
    if (filters.assignedBy) {
      query = query.eq('assigned_by', filters.assignedBy);
    }
    
    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }
    
    if (filters.priority && filters.priority.length > 0) {
      query = query.in('priority', filters.priority);
    }
    
    if (filters.dueDateFrom) {
      query = query.gte('due_date', filters.dueDateFrom);
    }
    
    if (filters.dueDateTo) {
      query = query.lte('due_date', filters.dueDateTo);
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'assigned_at';
    const sortOrder = filters.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    query = query.range(from, to);

    return query;
  },

  // Get single assignment by ID
  async getAssignmentById(id: string) {
    return supabase
      .from('course_assignments')
      .select(`
        *,
        user:profiles!course_assignments_user_id_fkey(
          user_id,
          name,
          email,
          department,
          job_position,
          photo_url
        ),
        assigned_by_user:profiles!course_assignments_assigned_by_fkey(
          user_id,
          name,
          email
        )
      `)
      .eq('id', id)
      .single();
  },

  // Get assignments for a specific user
  async getUserAssignments(userId: string, status?: string[]) {
    let query = supabase
      .from('course_assignments')
      .select(`
        *,
        assigned_by_user:profiles!course_assignments_assigned_by_fkey(
          user_id,
          name,
          email
        )
      `)
      .eq('user_id', userId);

    if (status && status.length > 0) {
      query = query.in('status', status);
    }

    return query.order('assigned_at', { ascending: false });
  },

  // Create new assignment
  async createAssignment(data: Database['public']['Tables']['course_assignments']['Insert']) {
    return supabase
      .from('course_assignments')
      .insert(data)
      .select()
      .single();
  },

  // Update assignment
  async updateAssignment(id: string, data: Database['public']['Tables']['course_assignments']['Update']) {
    return supabase
      .from('course_assignments')
      .update(data)
      .eq('id', id)
      .select()
      .single();
  },

  // Delete assignment
  async deleteAssignment(id: string) {
    return supabase
      .from('course_assignments')
      .delete()
      .eq('id', id);
  },

  // Get assignment statistics
  async getAssignmentStats(filters: Partial<AssignmentFilters> = {}) {
    let query = supabase
      .from('course_assignments')
      .select('status, completed_at, assigned_at, due_date');

    // Apply filters
    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }
    
    if (filters.assignedBy) {
      query = query.eq('assigned_by', filters.assignedBy);
    }

    return query;
  }
};

// Template query helpers
export const templateQueries = {
  // Get templates with filters and pagination
  async getTemplates(filters: TemplateFilters = {}) {
    let query = supabase
      .from('assignment_templates')
      .select(`
        *,
        created_by_user:profiles!assignment_templates_created_by_fkey(
          user_id,
          name,
          email
        ),
        template_courses(
          *
        )
      `);

    // Apply filters
    if (filters.department) {
      query = query.eq('department', filters.department);
    }
    
    if (filters.jobTitle) {
      query = query.eq('job_title', filters.jobTitle);
    }
    
    if (filters.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }
    
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    query = query.range(from, to);

    return query;
  },

  // Get single template by ID
  async getTemplateById(id: string) {
    return supabase
      .from('assignment_templates')
      .select(`
        *,
        created_by_user:profiles!assignment_templates_created_by_fkey(
          user_id,
          name,
          email
        ),
        template_courses(
          *
        )
      `)
      .eq('id', id)
      .single();
  },

  // Create new template
  async createTemplate(data: Database['public']['Tables']['assignment_templates']['Insert']) {
    return supabase
      .from('assignment_templates')
      .insert(data)
      .select()
      .single();
  },

  // Update template
  async updateTemplate(id: string, data: Database['public']['Tables']['assignment_templates']['Update']) {
    return supabase
      .from('assignment_templates')
      .update(data)
      .eq('id', id)
      .select()
      .single();
  },

  // Delete template
  async deleteTemplate(id: string) {
    return supabase
      .from('assignment_templates')
      .delete()
      .eq('id', id);
  },

  // Get templates for user based on department/job title
  async getTemplatesForUser(department?: string, jobTitle?: string) {
    let query = supabase
      .from('assignment_templates')
      .select(`
        *,
        template_courses(
          *
        )
      `)
      .eq('is_active', true);

    if (department || jobTitle) {
      const conditions = [];
      if (department) conditions.push(`department.eq.${department}`);
      if (jobTitle) conditions.push(`job_title.eq.${jobTitle}`);
      
      query = query.or(conditions.join(','));
    }

    return query.order('created_at', { ascending: false });
  }
};

// Template course query helpers
export const templateCourseQueries = {
  // Get courses for a template
  async getTemplateCourses(templateId: string) {
    return supabase
      .from('template_courses')
      .select('*')
      .eq('template_id', templateId)
      .order('created_at', { ascending: true });
  },

  // Add course to template
  async addCourseToTemplate(data: Database['public']['Tables']['template_courses']['Insert']) {
    return supabase
      .from('template_courses')
      .insert(data)
      .select()
      .single();
  },

  // Remove course from template
  async removeCourseFromTemplate(id: string) {
    return supabase
      .from('template_courses')
      .delete()
      .eq('id', id);
  },

  // Update template course
  async updateTemplateCourse(id: string, data: Database['public']['Tables']['template_courses']['Update']) {
    return supabase
      .from('template_courses')
      .update(data)
      .eq('id', id)
      .select()
      .single();
  }
};

// Notification query helpers
export const notificationQueries = {
  // Get notifications for assignment
  async getAssignmentNotifications(assignmentId: string) {
    return supabase
      .from('assignment_notifications')
      .select(`
        *,
        assignment:course_assignments(
          *,
          user:profiles!course_assignments_user_id_fkey(
            user_id,
            name,
            email
          )
        )
      `)
      .eq('assignment_id', assignmentId)
      .order('created_at', { ascending: false });
  },

  // Create notification
  async createNotification(data: Database['public']['Tables']['assignment_notifications']['Insert']) {
    return supabase
      .from('assignment_notifications')
      .insert(data)
      .select()
      .single();
  },

  // Mark notification as read
  async markNotificationAsRead(id: string) {
    return supabase
      .from('assignment_notifications')
      .update({ in_app_read: true })
      .eq('id', id);
  },

  // Get unread notifications count
  async getUnreadNotificationsCount(userId: string) {
    return supabase
      .from('assignment_notifications')
      .select('id', { count: 'exact' })
      .eq('assignment.user_id', userId)
      .eq('in_app_read', false);
  }
};

// Utility functions for content queries (courses and simulados)
export const contentQueries = {
  // Get available courses
  async getCourses(isActive = true) {
    let query = supabase
      .from('video_courses')
      .select('id, title, description, duration_hours, difficulty, is_active');

    if (isActive) {
      query = query.eq('is_active', true);
    }

    return query.order('title', { ascending: true });
  },

  // Get available simulados
  async getSimulados(isActive = true) {
    let query = supabase
      .from('simulados')
      .select('id, title, description, duration_minutes, difficulty, total_questions, is_active');

    if (isActive) {
      query = query.eq('is_active', true);
    }

    return query.order('title', { ascending: true });
  },

  // Get content by type and ID
  async getContentById(contentType: 'course' | 'simulado', contentId: string) {
    if (contentType === 'course') {
      return supabase
        .from('video_courses')
        .select('id, title, description, duration_hours, difficulty, is_active')
        .eq('id', contentId)
        .single();
    } else {
      return supabase
        .from('simulados')
        .select('id, title, description, duration_minutes, difficulty, total_questions, is_active')
        .eq('id', contentId)
        .single();
    }
  }
};

// User query helpers for assignments
export const userQueries = {
  // Get users for assignment selection
  async getUsers(search?: string, department?: string) {
    let query = supabase
      .from('profiles')
      .select('user_id, name, email, department, job_position, photo_url, is_active')
      .eq('is_active', true);

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (department) {
      query = query.eq('department', department);
    }

    return query.order('name', { ascending: true });
  },

  // Get departments
  async getDepartments() {
    return supabase
      .from('profiles')
      .select('department')
      .not('department', 'is', null)
      .eq('is_active', true);
  },

  // Get job titles
  async getJobTitles() {
    return supabase
      .from('profiles')
      .select('job_position')
      .not('job_position', 'is', null)
      .eq('is_active', true);
  }
};