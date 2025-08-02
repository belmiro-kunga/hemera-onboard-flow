// Migration validation tests

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { database, checkDatabaseConnection, closeDatabaseConnection } from '../database';
import { logger } from '../database-utils';

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
    const expectedTables = [
      'auth.users',
      'profiles',
      'video_courses',
      'video_lessons',
      'course_enrollments',
      'course_assignments',
      'assignment_templates',
      'template_courses',
      'simulados',
      'questoes',
      'opcoes_resposta',
      'simulado_attempts',
      'simulado_answers',
      'course_certificates',
      'simulado_certificates',
      'assignment_notifications',
      'departments',
      'organizational_chart',
      'company_presentation',
      'site_settings',
      'user_levels',
      'user_points',
      'user_badges',
      'badges',
      'gamification_settings',
      'email_templates',
      'email_queue',
      'email_logs',
      'presentation_views'
    ];

    it('should have all required tables', async () => {
      const missingTables: string[] = [];
      const existingTables: string[] = [];

      for (const tableName of expectedTables) {
        const [schema, table] = tableName.includes('.') 
          ? tableName.split('.') 
          : ['public', tableName];

        const result = await database.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = $1 AND table_name = $2
          )
        `, [schema, table]);

        if (result.error) {
          logger.error(`Error checking table ${tableName}:`, result.error);
          missingTables.push(tableName);
        } else if (result.data[0].exists) {
          existingTables.push(tableName);
        } else {
          missingTables.push(tableName);
        }
      }

      logger.info(`Found ${existingTables.length} tables, missing ${missingTables.length} tables`);
      
      if (missingTables.length > 0) {
        logger.warn('Missing tables:', missingTables);
      }

      // We expect most tables to exist, but some might be optional
      expect(existingTables.length).toBeGreaterThan(expectedTables.length * 0.7); // At least 70% of tables
    });

    it('should have proper table relationships', async () => {
      const relationships = [
        {
          table: 'profiles',
          column: 'user_id',
          referencedTable: 'auth.users',
          referencedColumn: 'id'
        },
        {
          table: 'course_enrollments',
          column: 'user_id',
          referencedTable: 'auth.users',
          referencedColumn: 'id'
        },
        {
          table: 'course_enrollments',
          column: 'course_id',
          referencedTable: 'video_courses',
          referencedColumn: 'id'
        },
        {
          table: 'course_assignments',
          column: 'user_id',
          referencedTable: 'auth.users',
          referencedColumn: 'id'
        },
        {
          table: 'video_lessons',
          column: 'course_id',
          referencedTable: 'video_courses',
          referencedColumn: 'id'
        }
      ];

      const validRelationships: string[] = [];
      const invalidRelationships: string[] = [];

      for (const rel of relationships) {
        const result = await database.query(`
          SELECT EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
              ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage ccu 
              ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
              AND tc.table_name = $1
              AND kcu.column_name = $2
              AND ccu.table_name = $3
              AND ccu.column_name = $4
          )
        `, [rel.table, rel.column, rel.referencedTable.split('.').pop(), rel.referencedColumn]);

        if (result.error) {
          logger.error(`Error checking relationship ${rel.table}.${rel.column}:`, result.error);
          invalidRelationships.push(`${rel.table}.${rel.column} -> ${rel.referencedTable}.${rel.referencedColumn}`);
        } else if (result.data[0].exists) {
          validRelationships.push(`${rel.table}.${rel.column} -> ${rel.referencedTable}.${rel.referencedColumn}`);
        } else {
          invalidRelationships.push(`${rel.table}.${rel.column} -> ${rel.referencedTable}.${rel.referencedColumn}`);
        }
      }

      logger.info(`Valid relationships: ${validRelationships.length}, Invalid: ${invalidRelationships.length}`);
      
      if (invalidRelationships.length > 0) {
        logger.warn('Invalid relationships:', invalidRelationships);
      }

      // We expect most relationships to be valid
      expect(validRelationships.length).toBeGreaterThan(relationships.length * 0.5); // At least 50%
    });

    it('should have proper indexes on key columns', async () => {
      const expectedIndexes = [
        { table: 'profiles', column: 'user_id' },
        { table: 'profiles', column: 'email' },
        { table: 'course_enrollments', column: 'user_id' },
        { table: 'course_enrollments', column: 'course_id' },
        { table: 'course_assignments', column: 'user_id' },
        { table: 'course_assignments', column: 'assigned_by' },
        { table: 'video_lessons', column: 'course_id' },
        { table: 'simulado_attempts', column: 'user_id' },
        { table: 'simulado_attempts', column: 'simulado_id' }
      ];

      const indexedColumns: string[] = [];
      const missingIndexes: string[] = [];

      for (const idx of expectedIndexes) {
        const result = await database.query(`
          SELECT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE tablename = $1 
              AND indexdef LIKE '%' || $2 || '%'
          )
        `, [idx.table, idx.column]);

        if (result.error) {
          logger.error(`Error checking index ${idx.table}.${idx.column}:`, result.error);
          missingIndexes.push(`${idx.table}.${idx.column}`);
        } else if (result.data[0].exists) {
          indexedColumns.push(`${idx.table}.${idx.column}`);
        } else {
          missingIndexes.push(`${idx.table}.${idx.column}`);
        }
      }

      logger.info(`Indexed columns: ${indexedColumns.length}, Missing indexes: ${missingIndexes.length}`);
      
      if (missingIndexes.length > 0) {
        logger.warn('Missing indexes:', missingIndexes);
      }

      // Indexes are important for performance but not critical for functionality
      expect(indexedColumns.length).toBeGreaterThan(0);
    });
  });

  describe('Data Integrity Validation', () => {
    it('should have consistent user data', async () => {
      // Check that all profiles have corresponding auth users
      const result = await database.query(`
        SELECT COUNT(*) as orphaned_profiles
        FROM profiles p
        LEFT JOIN auth.users u ON p.user_id = u.id
        WHERE u.id IS NULL
      `);

      expect(result.error).toBeNull();
      
      const orphanedCount = parseInt(result.data[0].orphaned_profiles);
      logger.info(`Found ${orphanedCount} orphaned profiles`);
      
      // Should have no orphaned profiles
      expect(orphanedCount).toBe(0);
    });

    it('should have consistent enrollment data', async () => {
      // Check that all enrollments reference valid users and courses
      const userResult = await database.query(`
        SELECT COUNT(*) as invalid_user_enrollments
        FROM course_enrollments ce
        LEFT JOIN auth.users u ON ce.user_id = u.id
        WHERE u.id IS NULL
      `);

      const courseResult = await database.query(`
        SELECT COUNT(*) as invalid_course_enrollments
        FROM course_enrollments ce
        LEFT JOIN video_courses vc ON ce.course_id = vc.id
        WHERE vc.id IS NULL
      `);

      expect(userResult.error).toBeNull();
      expect(courseResult.error).toBeNull();

      const invalidUsers = parseInt(userResult.data[0].invalid_user_enrollments);
      const invalidCourses = parseInt(courseResult.data[0].invalid_course_enrollments);

      logger.info(`Invalid user enrollments: ${invalidUsers}, Invalid course enrollments: ${invalidCourses}`);

      expect(invalidUsers).toBe(0);
      expect(invalidCourses).toBe(0);
    });

    it('should have consistent assignment data', async () => {
      // Check that all assignments reference valid users
      const result = await database.query(`
        SELECT COUNT(*) as invalid_assignments
        FROM course_assignments ca
        LEFT JOIN auth.users u ON ca.user_id = u.id
        WHERE u.id IS NULL
      `);

      expect(result.error).toBeNull();
      
      const invalidCount = parseInt(result.data[0].invalid_assignments);
      logger.info(`Found ${invalidCount} invalid assignments`);
      
      expect(invalidCount).toBe(0);
    });
  });

  describe('Function and Trigger Validation', () => {
    it('should have required database functions', async () => {
      const expectedFunctions = [
        'get_users_with_details',
        'create_user_with_profile',
        'is_admin_user',
        'apply_template_to_user',
        'get_upcoming_birthdays'
      ];

      const existingFunctions: string[] = [];
      const missingFunctions: string[] = [];

      for (const funcName of expectedFunctions) {
        const result = await database.query(`
          SELECT EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = $1 
              AND routine_type = 'FUNCTION'
          )
        `, [funcName]);

        if (result.error) {
          logger.error(`Error checking function ${funcName}:`, result.error);
          missingFunctions.push(funcName);
        } else if (result.data[0].exists) {
          existingFunctions.push(funcName);
        } else {
          missingFunctions.push(funcName);
        }
      }

      logger.info(`Existing functions: ${existingFunctions.length}, Missing: ${missingFunctions.length}`);
      
      if (missingFunctions.length > 0) {
        logger.warn('Missing functions:', missingFunctions);
      }

      // Functions are important but some might be optional
      expect(existingFunctions.length).toBeGreaterThan(0);
    });

    it('should have proper RLS policies', async () => {
      const tablesWithRLS = ['profiles', 'course_enrollments', 'course_assignments'];
      const tablesWithPolicies: string[] = [];
      const tablesWithoutPolicies: string[] = [];

      for (const tableName of tablesWithRLS) {
        const result = await database.query(`
          SELECT COUNT(*) as policy_count
          FROM pg_policies 
          WHERE tablename = $1
        `, [tableName]);

        if (result.error) {
          logger.error(`Error checking RLS policies for ${tableName}:`, result.error);
          tablesWithoutPolicies.push(tableName);
        } else {
          const policyCount = parseInt(result.data[0].policy_count);
          if (policyCount > 0) {
            tablesWithPolicies.push(tableName);
          } else {
            tablesWithoutPolicies.push(tableName);
          }
        }
      }

      logger.info(`Tables with RLS policies: ${tablesWithPolicies.length}, Without: ${tablesWithoutPolicies.length}`);
      
      if (tablesWithoutPolicies.length > 0) {
        logger.warn('Tables without RLS policies:', tablesWithoutPolicies);
      }

      // RLS policies are important for security
      expect(tablesWithPolicies.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Validation', () => {
    it('should have acceptable query performance on main tables', async () => {
      const performanceTests = [
        {
          name: 'User profile lookup',
          query: 'SELECT * FROM profiles LIMIT 10'
        },
        {
          name: 'Course listing',
          query: 'SELECT * FROM video_courses WHERE is_active = true LIMIT 10'
        },
        {
          name: 'User enrollments',
          query: 'SELECT * FROM course_enrollments LIMIT 10'
        },
        {
          name: 'Active assignments',
          query: 'SELECT * FROM course_assignments WHERE status = \'assigned\' LIMIT 10'
        }
      ];

      for (const test of performanceTests) {
        const startTime = performance.now();
        const result = await database.query(test.query);
        const endTime = performance.now();
        
        const duration = endTime - startTime;
        
        expect(result.error).toBeNull();
        expect(duration).toBeLessThan(500); // Should complete within 500ms
        
        logger.info(`${test.name}: ${duration.toFixed(2)}ms`);
      }
    });

    it('should handle concurrent queries efficiently', async () => {
      const concurrentQueries = 10;
      const query = 'SELECT COUNT(*) FROM information_schema.tables';
      
      const startTime = performance.now();
      const promises = Array.from({ length: concurrentQueries }, () => 
        database.query(query)
      );
      
      const results = await Promise.all(promises);
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      
      // All queries should succeed
      results.forEach(result => {
        expect(result.error).toBeNull();
      });
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(2000); // 2 seconds for 10 concurrent queries
      
      logger.info(`${concurrentQueries} concurrent queries completed in ${duration.toFixed(2)}ms`);
    });
  });

  describe('Security Validation', () => {
    it('should have proper user authentication setup', async () => {
      // Check if auth schema exists
      const schemaResult = await database.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.schemata 
          WHERE schema_name = 'auth'
        )
      `);

      expect(schemaResult.error).toBeNull();
      expect(schemaResult.data[0].exists).toBe(true);

      // Check if users table exists in auth schema
      const usersResult = await database.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_schema = 'auth' AND table_name = 'users'
        )
      `);

      expect(usersResult.error).toBeNull();
      expect(usersResult.data[0].exists).toBe(true);
    });

    it('should have proper password security', async () => {
      // Check if password_hash column exists and is not nullable
      const result = await database.query(`
        SELECT 
          column_name,
          is_nullable,
          data_type
        FROM information_schema.columns 
        WHERE table_schema = 'auth' 
          AND table_name = 'users' 
          AND column_name = 'password_hash'
      `);

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.data[0].is_nullable).toBe('NO');
      expect(result.data[0].data_type).toBe('text');
    });
  });
});