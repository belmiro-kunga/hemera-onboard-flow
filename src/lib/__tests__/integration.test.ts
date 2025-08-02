// Integration tests for database and authentication system

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { database, checkDatabaseConnection, closeDatabaseConnection } from '../database';
import { auth } from '../auth';
import { AuthService } from '../auth/auth-service';

describe('Integration Tests', () => {
  beforeAll(async () => {
    // Ensure database connection is working
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Database connection failed. Make sure PostgreSQL is running.');
    }
  });

  afterAll(async () => {
    // Clean up database connection
    await closeDatabaseConnection();
  });

  beforeEach(() => {
    // Reset user context before each test
    database.setUserId(null);
  });

  describe('User Registration and Authentication Flow', () => {
    const testUser = {
      email: `integration-test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      full_name: 'Integration Test User',
      department: 'IT',
      job_position: 'Developer'
    };

    it('should complete full user registration and login flow', async () => {
      // Step 1: Register user
      const registerResult = await AuthService.register(testUser);
      
      expect(registerResult.success).toBe(true);
      expect(registerResult.user).toBeDefined();
      expect(registerResult.tokens).toBeDefined();
      expect(registerResult.user?.email).toBe(testUser.email);

      const userId = registerResult.user?.id;
      expect(userId).toBeDefined();

      // Step 2: Verify user exists in database
      const { data: userCheck } = await database
        .from('auth.users')
        .select('*')
        .eq('id', userId!)
        .select_query();

      expect(userCheck).toHaveLength(1);
      expect(userCheck[0].email).toBe(testUser.email);

      // Step 3: Verify profile was created
      const { data: profileCheck } = await database
        .from('profiles')
        .select('*')
        .eq('user_id', userId!)
        .select_query();

      expect(profileCheck).toHaveLength(1);
      expect(profileCheck[0].name).toBe(testUser.full_name);
      expect(profileCheck[0].department).toBe(testUser.department);

      // Step 4: Login with credentials
      const loginResult = await AuthService.login({
        email: testUser.email,
        password: testUser.password
      });

      expect(loginResult.success).toBe(true);
      expect(loginResult.user?.id).toBe(userId);
      expect(loginResult.tokens).toBeDefined();

      // Step 5: Test token refresh
      if (loginResult.tokens) {
        const refreshResult = await AuthService.refreshToken(loginResult.tokens.refreshToken);
        expect(refreshResult.success).toBe(true);
        expect(refreshResult.tokens).toBeDefined();
        expect(refreshResult.tokens?.accessToken).not.toBe(loginResult.tokens.accessToken);
      }

      // Step 6: Test session management
      const sessionState = await auth.getCurrentSession();
      expect(sessionState.isAuthenticated).toBe(true);
      expect(sessionState.user?.id).toBe(userId);

      // Cleanup: Remove test user
      await database
        .from('profiles')
        .eq('user_id', userId!)
        .delete();
      
      await database
        .from('auth.users')
        .eq('id', userId!)
        .delete();

    }, 15000); // Increase timeout for database operations
  });

  describe('Course Management Flow', () => {
    let testUserId: string;
    let testCourseId: string;

    beforeEach(async () => {
      // Create test user
      const testUser = {
        email: `course-test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        full_name: 'Course Test User'
      };

      const registerResult = await AuthService.register(testUser);
      testUserId = registerResult.user?.id!;
      database.setUserId(testUserId);
    });

    afterEach(async () => {
      // Cleanup test data
      if (testCourseId) {
        await database.from('video_lessons').eq('course_id', testCourseId).delete();
        await database.from('course_enrollments').eq('course_id', testCourseId).delete();
        await database.from('video_courses').eq('id', testCourseId).delete();
      }
      
      if (testUserId) {
        await database.from('profiles').eq('user_id', testUserId).delete();
        await database.from('auth.users').eq('id', testUserId).delete();
      }
    });

    it('should handle complete course enrollment and progress flow', async () => {
      // Step 1: Create a test course
      const courseData = {
        title: 'Integration Test Course',
        description: 'A course for testing integration',
        category: 'Testing',
        difficulty: 'beginner',
        duration_minutes: 60,
        is_active: true
      };

      const { data: courseResult } = await database
        .from('video_courses')
        .insert(courseData);

      const course = Array.isArray(courseResult) ? courseResult[0] : courseResult;
      testCourseId = course.id;

      // Step 2: Add lessons to the course
      const lessonData = [
        {
          course_id: testCourseId,
          title: 'Lesson 1',
          description: 'First lesson',
          video_url: 'https://example.com/video1.mp4',
          duration_seconds: 300,
          order_number: 1
        },
        {
          course_id: testCourseId,
          title: 'Lesson 2',
          description: 'Second lesson',
          video_url: 'https://example.com/video2.mp4',
          duration_seconds: 400,
          order_number: 2
        }
      ];

      const { data: lessonsResult } = await database
        .from('video_lessons')
        .insert(lessonData);

      expect(lessonsResult).toHaveLength(2);

      // Step 3: Enroll user in course
      const enrollmentData = {
        user_id: testUserId,
        course_id: testCourseId,
        enrolled_at: new Date().toISOString()
      };

      const { data: enrollmentResult } = await database
        .from('course_enrollments')
        .insert(enrollmentData);

      const enrollment = Array.isArray(enrollmentResult) ? enrollmentResult[0] : enrollmentResult;
      expect(enrollment.user_id).toBe(testUserId);

      // Step 4: Create lesson progress entries
      const lessons = Array.isArray(lessonsResult) ? lessonsResult : [lessonsResult];
      const progressData = lessons.map(lesson => ({
        user_id: testUserId,
        lesson_id: lesson.id,
        enrollment_id: enrollment.id,
        watched_seconds: 0,
        is_completed: false
      }));

      const { data: progressResult } = await database
        .from('lesson_progress')
        .insert(progressData);

      expect(progressResult).toHaveLength(2);

      // Step 5: Update progress for first lesson
      const { data: updatedProgress } = await database
        .from('lesson_progress')
        .update({
          watched_seconds: 300,
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('lesson_id', lessons[0].id)
        .eq('user_id', testUserId);

      expect(updatedProgress).toHaveLength(1);

      // Step 6: Verify enrollment progress
      const { data: enrollmentProgress } = await database
        .from('course_enrollments')
        .select('*')
        .eq('id', enrollment.id)
        .select_query();

      expect(enrollmentProgress).toHaveLength(1);

      // Cleanup will be handled by afterEach
    }, 15000);
  });

  describe('Assignment Management Flow', () => {
    let testUserId: string;
    let testCourseId: string;
    let testAssignmentId: string;

    beforeEach(async () => {
      // Create test user
      const testUser = {
        email: `assignment-test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        full_name: 'Assignment Test User'
      };

      const registerResult = await AuthService.register(testUser);
      testUserId = registerResult.user?.id!;
      database.setUserId(testUserId);

      // Create test course
      const { data: courseResult } = await database
        .from('video_courses')
        .insert({
          title: 'Assignment Test Course',
          description: 'Course for assignment testing',
          category: 'Testing',
          is_active: true
        });

      const course = Array.isArray(courseResult) ? courseResult[0] : courseResult;
      testCourseId = course.id;
    });

    afterEach(async () => {
      // Cleanup test data
      if (testAssignmentId) {
        await database.from('assignment_notifications').eq('assignment_id', testAssignmentId).delete();
        await database.from('course_assignments').eq('id', testAssignmentId).delete();
      }
      
      if (testCourseId) {
        await database.from('video_courses').eq('id', testCourseId).delete();
      }
      
      if (testUserId) {
        await database.from('profiles').eq('user_id', testUserId).delete();
        await database.from('auth.users').eq('id', testUserId).delete();
      }
    });

    it('should handle complete assignment lifecycle', async () => {
      // Step 1: Create assignment
      const assignmentData = {
        user_id: testUserId,
        content_type: 'course',
        content_id: testCourseId,
        assigned_by: testUserId, // Self-assigned for test
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        priority: 'high',
        status: 'assigned',
        notes: 'Integration test assignment'
      };

      const { data: assignmentResult } = await database
        .from('course_assignments')
        .insert(assignmentData);

      const assignment = Array.isArray(assignmentResult) ? assignmentResult[0] : assignmentResult;
      testAssignmentId = assignment.id;

      expect(assignment.user_id).toBe(testUserId);
      expect(assignment.status).toBe('assigned');

      // Step 2: Create notification
      const notificationData = {
        assignment_id: testAssignmentId,
        notification_type: 'assignment_created',
        email_sent: false,
        in_app_read: false
      };

      const { data: notificationResult } = await database
        .from('assignment_notifications')
        .insert(notificationData);

      expect(notificationResult).toHaveLength(1);

      // Step 3: Update assignment status to in_progress
      const { data: updatedAssignment } = await database
        .from('course_assignments')
        .update({ status: 'in_progress' })
        .eq('id', testAssignmentId);

      expect(updatedAssignment).toHaveLength(1);
      expect(updatedAssignment[0].status).toBe('in_progress');

      // Step 4: Complete assignment
      const { data: completedAssignment } = await database
        .from('course_assignments')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', testAssignmentId);

      expect(completedAssignment).toHaveLength(1);
      expect(completedAssignment[0].status).toBe('completed');
      expect(completedAssignment[0].completed_at).toBeDefined();

      // Step 5: Mark notification as read
      const { data: updatedNotification } = await database
        .from('assignment_notifications')
        .update({ in_app_read: true })
        .eq('assignment_id', testAssignmentId);

      expect(updatedNotification).toHaveLength(1);

      // Cleanup will be handled by afterEach
    }, 15000);
  });

  describe('Database Transaction Handling', () => {
    it('should handle transaction rollback on error', async () => {
      // This test verifies that database operations are properly isolated
      const testEmail = `transaction-test-${Date.now()}@example.com`;

      try {
        // Attempt to create user with invalid data that should fail
        await database.query(`
          BEGIN;
          INSERT INTO auth.users (email, password_hash) VALUES ('${testEmail}', 'test-hash');
          INSERT INTO profiles (user_id, name) VALUES ('invalid-uuid', 'Test User');
          COMMIT;
        `);
        
        // This should not be reached
        expect(true).toBe(false);
      } catch (error) {
        // Transaction should have been rolled back
        const { data: userCheck } = await database
          .from('auth.users')
          .select('*')
          .eq('email', testEmail)
          .select_query();

        expect(userCheck).toHaveLength(0);
      }
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle multiple concurrent database operations', async () => {
      const startTime = Date.now();
      const operations = [];

      // Create 10 concurrent read operations
      for (let i = 0; i < 10; i++) {
        operations.push(
          database
            .from('video_courses')
            .select('id, title')
            .limit(5)
            .select_query()
        );
      }

      const results = await Promise.all(operations);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // All operations should succeed
      results.forEach(result => {
        expect(result.error).toBeNull();
        expect(Array.isArray(result.data)).toBe(true);
      });

      // Should complete within reasonable time (adjust based on your requirements)
      expect(duration).toBeLessThan(5000); // 5 seconds
    });

    it('should handle large result sets efficiently', async () => {
      const startTime = Date.now();

      // Query that might return many results
      const { data, error } = await database
        .from('profiles')
        .select('user_id, name, email')
        .limit(1000)
        .select_query();

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      expect(duration).toBeLessThan(3000); // 3 seconds
    });
  });
});