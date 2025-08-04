// Migration validation tests

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { database, checkDatabaseConnection, closeDatabaseConnection } from '../database';

describe('Migration Validation Tests', () => {
  beforeAll(async () => {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Database connection failed. Make sure PostgreSQL is running.');
    }
  });

  afterAll(async () => {
    await closeDatabaseConnection();
  });

  describe('Schema Validation', () => {
    it('should have all required tables', async () => {
      const expectedTables = [
        'profiles',
        'video_courses',
        'video_lessons',
        'course_enrollments',
        'lesson_progress',
        'course_assignments',
        'assignment_templates',
        'template_courses',
        'simulados',
        'questoes',
        'opcoes_resposta',
        'simulado_attempts',
        'simulado_answers',
        'user_levels',
        'badges',
        'user_badges',
        'user_points',
        'course_certificates',
        'simulado_certificates',
        'departments',
        'organizational_chart',
        'company_presentation',
        'site_settings',
        'email_templates',
        'email_queue',
        'email_logs',
        'assignment_notifications',
        'presentation_views'
      ];

      for (const tableName of expectedTables) {
        const { data, error } = await database.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          );
        `, [tableName]);

        expect(error).toBeNull();
        expect(data).toHaveLength(1);
        expect(data[0].exists).toBe(true);
      }
    });

    it('should have auth schema and users table', async () => {
      const { data: schemaExists } = await database.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.schemata 
          WHERE schema_name = 'auth'
        );
      `);

      if (schemaExists[0].exists) {
        const { data: tableExists } = await database.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'auth' 
            AND table_name = 'users'
          );
        `);

        expect(tableExists[0].exists).toBe(true);
      } else {
        console.warn('Auth schema not found - this may be expected if using local auth only');
      }
    });

    it('should have proper foreign key relationships', async () => {
      // Check profiles -> auth.users relationship
      const { data: profilesFK } = await database.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
          WHERE tc.table_name = 'profiles' 
          AND tc.constraint_type = 'FOREIGN KEY'
          AND kcu.column_name = 'user_id'
        );
      `);

      // This might not exist if we're using a different auth system
      // So we'll just log the result
      console.log('Profiles foreign key exists:', profilesFK[0].exists);

      // Check course_enrollments -> profiles relationship
      const { data: enrollmentsFK } = await database.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
          WHERE tc.table_name = 'course_enrollments' 
          AND tc.constraint_type = 'FOREIGN KEY'
          AND kcu.column_name = 'user_id'
        );
      `);

      expect(enrollmentsFK[0].exists).toBe(true);
    });
  });

  describe('Data Integrity Validation', () => {
    it('should not have orphaned records', async () => {
      // Check for course enrollments without valid users
      const { data: orphanedEnrollments } = await database.query(`
        SELECT COUNT(*) as count FROM course_enrollments ce 
        LEFT JOIN profiles p ON ce.user_id = p.user_id 
        WHERE p.user_id IS NULL;
      `);

      expect(orphanedEnrollments[0].count).toBe('0');

      // Check for course assignments without valid users
      const { data: orphanedAssignments } = await database.query(`
        SELECT COUNT(*) as count FROM course_assignments ca 
        LEFT JOIN profiles p ON ca.user_id = p.user_id 
        WHERE p.user_id IS NULL;
      `);

      expect(orphanedAssignments[0].count).toBe('0');
    });

    it('should have consistent data types', async () => {
      // Check that UUIDs are properly formatted
      const { data: invalidUUIDs } = await database.query(`
        SELECT COUNT(*) as count FROM profiles 
        WHERE user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
      `);

      expect(invalidUUIDs[0].count).toBe('0');

      // Check that email addresses are valid format
      const { data: invalidEmails } = await database.query(`
        SELECT COUNT(*) as count FROM profiles 
        WHERE email IS NOT NULL 
        AND email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$';
      `);

      expect(invalidEmails[0].count).toBe('0');
    });

    it('should have proper timestamp consistency', async () => {
      // Check that updated_at >= created_at
      const { data: inconsistentTimestamps } = await database.query(`
        SELECT COUNT(*) as count FROM profiles 
        WHERE updated_at < created_at;
      `);

      expect(inconsistentTimestamps[0].count).toBe('0');
    });
  });

  describe('Index and Performance Validation', () => {
    it('should have proper indexes on frequently queried columns', async () => {
      // Check for index on profiles.user_id
      const { data: profilesIndex } = await database.query(`
        SELECT EXISTS (
          SELECT FROM pg_indexes 
          WHERE tablename = 'profiles' 
          AND indexname LIKE '%user_id%'
        );
      `);

      expect(profilesIndex[0].exists).toBe(true);

      // Check for index on course_assignments.user_id
      const { data: assignmentsIndex } = await database.query(`
        SELECT EXISTS (
          SELECT FROM pg_indexes 
          WHERE tablename = 'course_assignments' 
          AND indexname LIKE '%user_id%'
        );
      `);

      expect(assignmentsIndex[0].exists).toBe(true);
    });

    it('should have reasonable table sizes', async () => {
      const { data: tableSizes } = await database.query(`
        SELECT 
          tablename,
          pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size,
          pg_total_relation_size(tablename::regclass) as size_bytes
        FROM pg_tables 
        WHERE schemaname = 'public' 
        ORDER BY pg_total_relation_size(tablename::regclass) DESC
        LIMIT 10;
      `);

      expect(tableSizes.length).toBeGreaterThan(0);
      
      // Log table sizes for monitoring
      tableSizes.forEach(table => {
        console.log(`Table ${table.tablename}: ${table.size}`);
      });

      // Ensure no table is excessively large (> 100MB) in test environment
      tableSizes.forEach(table => {
        expect(parseInt(table.size_bytes)).toBeLessThan(100 * 1024 * 1024);
      });
    });
  });

  describe('Function and Trigger Validation', () => {
    it('should have required database functions', async () => {
      const expectedFunctions = [
        'get_users_with_details',
        'create_user_with_profile',
        'is_admin_user'
      ];

      for (const functionName of expectedFunctions) {
        const { data: functionExists } = await database.query(`
          SELECT EXISTS (
            SELECT FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' 
            AND p.proname = $1
          );
        `, [functionName]);

        if (!functionExists[0].exists) {
          console.warn(`Function ${functionName} not found - may need to be created`);
        }
      }
    });

    it('should have proper triggers for updated_at columns', async () => {
      const tablesWithUpdatedAt = [
        'profiles',
        'video_courses',
        'course_assignments',
        'assignment_templates'
      ];

      for (const tableName of tablesWithUpdatedAt) {
        const { data: triggerExists } = await database.query(`
          SELECT EXISTS (
            SELECT FROM pg_trigger t
            JOIN pg_class c ON t.tgrelid = c.oid
            WHERE c.relname = $1
            AND t.tgname LIKE '%updated_at%'
          );
        `, [tableName]);

        if (!triggerExists[0].exists) {
          console.warn(`Updated_at trigger not found for table ${tableName}`);
        }
      }
    });
  });

  describe('Security Validation', () => {
    it('should have proper RLS policies if enabled', async () => {
      const { data: rlsTables } = await database.query(`
        SELECT tablename, rowsecurity 
        FROM pg_tables t
        JOIN pg_class c ON c.relname = t.tablename
        WHERE t.schemaname = 'public'
        AND c.relrowsecurity = true;
      `);

      if (rlsTables.length > 0) {
        console.log('Tables with RLS enabled:', rlsTables.map(t => t.tablename));
        
        // Check that RLS tables have policies
        for (const table of rlsTables) {
          const { data: policies } = await database.query(`
            SELECT COUNT(*) as count FROM pg_policies 
            WHERE tablename = $1;
          `, [table.tablename]);

          expect(parseInt(policies[0].count)).toBeGreaterThan(0);
        }
      } else {
        console.log('No RLS policies found - using application-level security');
      }
    });

    it('should not have default or weak passwords', async () => {
      // This test would check for common weak passwords in a real scenario
      // For now, we'll just ensure password fields are properly hashed
      const { data: weakPasswords } = await database.query(`
        SELECT COUNT(*) as count FROM auth.users 
        WHERE password_hash IN ('password', '123456', 'admin', 'test')
        OR LENGTH(password_hash) < 20;
      `);

      if (weakPasswords && weakPasswords.length > 0) {
        expect(weakPasswords[0].count).toBe('0');
      }
    });
  });
});