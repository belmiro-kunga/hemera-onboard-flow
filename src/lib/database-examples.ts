// Database usage examples
// This file demonstrates how to use the database client abstraction layer

import { database } from './database';
import { Tables, RPCFunctions } from './database-types';
import type { User, Profile, CourseAssignment } from './database-types';

// Example 1: User Authentication
export async function authenticateUser(email: string, passwordHash: string) {
  // Set user context (this would typically be done after authentication)
  // database.setUserId(userId);
  
  const result = await database
    .from(Tables.USERS)
    .select('id, email, password_hash, email_confirmed')
    .eq('email', email)
    .limit(1)
    .select_query();

  if (result.error) {
    console.error('Authentication error:', result.error);
    return null;
  }

  const user = result.data[0] as User;
  if (!user) {
    return null;
  }

  // In a real implementation, you would verify the password hash here
  // const isValidPassword = await bcrypt.compare(password, user.password_hash);
  
  return user;
}

// Example 2: Get User Profile
export async function getUserProfile(userId: string) {
  database.setUserId(userId);
  
  const result = await database
    .from(Tables.PROFILES)
    .select('*')
    .eq('user_id', userId)
    .limit(1)
    .select_query();

  if (result.error) {
    console.error('Profile fetch error:', result.error);
    return null;
  }

  return result.data[0] as Profile;
}

// Example 3: Create User Profile
export async function createUserProfile(userId: string, profileData: Partial<Profile>) {
  database.setUserId(userId);
  
  const result = await database
    .from(Tables.PROFILES)
    .insert({
      user_id: userId,
      ...profileData,
    });

  if (result.error) {
    console.error('Profile creation error:', result.error);
    return null;
  }

  return result.data[0] as Profile;
}

// Example 4: Get User's Course Assignments
export async function getUserAssignments(userId: string) {
  database.setUserId(userId);
  
  const result = await database
    .from(Tables.COURSE_ASSIGNMENTS)
    .select('*')
    .eq('user_id', userId)
    .order('assigned_at', { ascending: false })
    .select_query();

  if (result.error) {
    console.error('Assignments fetch error:', result.error);
    return [];
  }

  return result.data as CourseAssignment[];
}

// Example 5: Update Assignment Status
export async function updateAssignmentStatus(
  assignmentId: string, 
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue',
  userId: string
) {
  database.setUserId(userId);
  
  const updateData: Partial<CourseAssignment> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString();
  }

  const result = await database
    .from(Tables.COURSE_ASSIGNMENTS)
    .eq('id', assignmentId)
    .eq('user_id', userId) // Ensure user can only update their own assignments
    .update(updateData);

  if (result.error) {
    console.error('Assignment update error:', result.error);
    return null;
  }

  return result.data[0] as CourseAssignment;
}

// Example 6: Check if User is Admin
export async function checkUserIsAdmin(userId: string): Promise<boolean> {
  database.setUserId(userId);
  
  const result = await database.rpc(RPCFunctions.IS_ADMIN_USER, {
    user_uuid: userId,
  });

  if (result.error) {
    console.error('Admin check error:', result.error);
    return false;
  }

  return Boolean(result.data);
}

// Example 7: Apply Template to User (Admin only)
export async function applyTemplateToUser(
  templateId: string, 
  targetUserId: string, 
  adminUserId: string
): Promise<number> {
  database.setUserId(adminUserId);
  
  const result = await database.rpc(RPCFunctions.APPLY_TEMPLATE_TO_USER, {
    p_template_id: templateId,
    p_user_id: targetUserId,
    p_assigned_by: adminUserId,
  });

  if (result.error) {
    console.error('Template application error:', result.error);
    return 0;
  }

  return Number(result.data) || 0;
}

// Example 8: Get Overdue Assignments
export async function getOverdueAssignments(userId: string) {
  database.setUserId(userId);
  
  const result = await database
    .from(Tables.COURSE_ASSIGNMENTS)
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'overdue')
    .order('due_date', { ascending: true })
    .select_query();

  if (result.error) {
    console.error('Overdue assignments fetch error:', result.error);
    return [];
  }

  return result.data as CourseAssignment[];
}

// Example 9: Search Users by Department (Admin only)
export async function searchUsersByDepartment(department: string, adminUserId: string) {
  database.setUserId(adminUserId);
  
  const result = await database
    .from(Tables.PROFILES)
    .select('user_id, full_name, job_position, department, created_at')
    .ilike('department', `%${department}%`)
    .order('full_name', { ascending: true })
    .select_query();

  if (result.error) {
    console.error('User search error:', result.error);
    return [];
  }

  return result.data as Profile[];
}

// Example 10: Get Course Enrollment Progress
export async function getCourseProgress(userId: string, courseId: string) {
  database.setUserId(userId);
  
  const result = await database
    .from(Tables.COURSE_ENROLLMENTS)
    .select('progress_percentage, completed_at, last_accessed_at')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .limit(1)
    .select_query();

  if (result.error) {
    console.error('Course progress fetch error:', result.error);
    return null;
  }

  return result.data[0] || null;
}

// Example 11: Bulk Insert Assignments
export async function createBulkAssignments(
  assignments: Partial<CourseAssignment>[],
  adminUserId: string
) {
  database.setUserId(adminUserId);
  
  const result = await database
    .from(Tables.COURSE_ASSIGNMENTS)
    .insert(assignments);

  if (result.error) {
    console.error('Bulk assignment creation error:', result.error);
    return [];
  }

  return result.data as CourseAssignment[];
}

// Example 12: Complex Query with Multiple Conditions
export async function getFilteredAssignments(
  userId: string,
  filters: {
    status?: string;
    priority?: string;
    contentType?: string;
    dueBefore?: string;
  }
) {
  database.setUserId(userId);
  
  let query = database
    .from(Tables.COURSE_ASSIGNMENTS)
    .select('*')
    .eq('user_id', userId);

  // Apply filters conditionally
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.priority) {
    query = query.eq('priority', filters.priority);
  }

  if (filters.contentType) {
    query = query.eq('content_type', filters.contentType);
  }

  if (filters.dueBefore) {
    query = query.lt('due_date', filters.dueBefore);
  }

  const result = await query
    .order('due_date', { ascending: true })
    .select_query();

  if (result.error) {
    console.error('Filtered assignments fetch error:', result.error);
    return [];
  }

  return result.data as CourseAssignment[];
}

// Example 13: Transaction-like Operations
export async function enrollUserInCourse(
  userId: string,
  courseId: string,
  assignedBy: string
) {
  database.setUserId(userId);
  
  try {
    // Create enrollment
    const enrollmentResult = await database
      .from(Tables.COURSE_ENROLLMENTS)
      .insert({
        user_id: userId,
        course_id: courseId,
        progress_percentage: 0,
      });

    if (enrollmentResult.error) {
      throw new Error(`Enrollment failed: ${enrollmentResult.error.message}`);
    }

    // Create assignment
    const assignmentResult = await database
      .from(Tables.COURSE_ASSIGNMENTS)
      .insert({
        user_id: userId,
        content_type: 'course',
        content_id: courseId,
        assigned_by: assignedBy,
        status: 'assigned',
        priority: 'medium',
      });

    if (assignmentResult.error) {
      throw new Error(`Assignment creation failed: ${assignmentResult.error.message}`);
    }

    return {
      enrollment: enrollmentResult.data[0],
      assignment: assignmentResult.data[0],
    };
  } catch (error) {
    console.error('Course enrollment error:', error);
    return null;
  }
}