// Performance tests for database operations

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { database, checkDatabaseConnection, closeDatabaseConnection } from '../database';
import { AuthService } from '../auth/auth-service';

describe('Performance Tests', () => {
  beforeAll(async () => {
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      throw new Error('Database connection failed. Make sure PostgreSQL is running.');
    }
  });

  afterAll(async () => {
    await closeDatabaseConnection();
  });

  describe('Database Query Performance', () => {
    it('should execute simple queries within acceptable time', async () => {
      const startTime = performance.now();

      const { data, error } = await database.query('SELECT 1 as test');

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(duration).toBeLessThan(100); // Should complete within 100ms
    });

    it('should handle complex joins efficiently', async () => {
      const startTime = performance.now();

      const { data, error } = await database.query(`
        SELECT 
          p.name,
          p.email,
          COUNT(ca.id) as assignment_count,
          COUNT(ce.id) as enrollment_count
        FROM profiles p
        LEFT JOIN course_assignments ca ON p.user_id = ca.user_id
        LEFT JOIN course_enrollments ce ON p.user_id = ce.user_id
        WHERE p.is_active = true
        GROUP BY p.user_id, p.name, p.email
        LIMIT 50
      `);

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle pagination efficiently', async () => {
      const pageSize = 20;
      const pages = 5;
      const durations: number[] = [];

      for (let page = 0; page < pages; page++) {
        const startTime = performance.now();

        const { data, error } = await database
          .from('profiles')
          .select('user_id, name, email, created_at')
          .order('created_at', { ascending: false })
          .limit(pageSize)
          .select_query();

        const endTime = performance.now();
        const duration = endTime - startTime;

        expect(error).toBeNull();
        expect(Array.isArray(data)).toBe(true);
        durations.push(duration);
      }

      // All page queries should be reasonably fast
      durations.forEach(duration => {
        expect(duration).toBeLessThan(500); // 500ms per page
      });

      // Performance should be consistent across pages
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      const maxDeviation = Math.max(...durations.map(d => Math.abs(d - avgDuration)));

      expect(maxDeviation).toBeLessThan(avgDuration * 2); // No page should be more than 2x average
    });
  });

  describe('Connection Pool Performance', () => {
    it('should handle concurrent connections efficiently', async () => {
      const concurrentQueries = 20;
      const startTime = performance.now();

      const promises = Array.from({ length: concurrentQueries }, (_, i) =>
        database.query(`SELECT ${i} as query_id, pg_backend_pid() as connection_id`)
      );

      const results = await Promise.all(promises);
      const endTime = performance.now();
      const duration = endTime - startTime;

      // All queries should succeed
      results.forEach((result, index) => {
        expect(result.error).toBeNull();
        expect(result.data).toHaveLength(1);
        expect(result.data[0].query_id).toBe(index);
      });

      // Should complete within reasonable time
      expect(duration).toBeLessThan(2000); // 2 seconds for 20 concurrent queries

      // Check that connection pooling is working (different backend PIDs)
      const connectionIds = results.map(r => r.data[0].connection_id);
      const uniqueConnections = new Set(connectionIds);

      // Should use multiple connections from the pool
      expect(uniqueConnections.size).toBeGreaterThan(1);
      expect(uniqueConnections.size).toBeLessThanOrEqual(concurrentQueries);
    });

    it('should recover from connection failures gracefully', async () => {
      // Test connection resilience by making many rapid queries
      const rapidQueries = 50;
      const promises = [];

      for (let i = 0; i < rapidQueries; i++) {
        promises.push(
          database.query('SELECT NOW() as current_time')
        );

        // Small delay to simulate rapid but not simultaneous requests
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1));
        }
      }

      const results = await Promise.all(promises);

      // All queries should eventually succeed
      const successCount = results.filter(r => r.error === null).length;
      const errorCount = results.filter(r => r.error !== null).length;

      expect(successCount).toBeGreaterThan(rapidQueries * 0.9); // At least 90% success rate

      if (errorCount > 0) {
        console.warn(`${errorCount} queries failed out of ${rapidQueries}`);
      }
    });
  });

  describe('Authentication Performance', () => {
    const testUsers = Array.from({ length: 5 }, (_, i) => ({
      email: `perf-test-${Date.now()}-${i}@example.com`,
      password: 'TestPassword123!',
      full_name: `Performance Test User ${i}`
    }));

    afterAll(async () => {
      // Cleanup test users
      for (const user of testUsers) {
        try {
          const { data } = await database
            .from('profiles')
            .select('user_id')
            .eq('email', user.email)
            .select_query();

          if (data && data.length > 0) {
            const userId = data[0].user_id;
            await database.from('profiles').eq('user_id', userId).delete();
            await database.from('auth.users').eq('id', userId).delete();
          }
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    });

    it('should handle user registration efficiently', async () => {
      const registrationTimes: number[] = [];

      for (const userData of testUsers) {
        const startTime = performance.now();

        const result = await AuthService.register(userData);

        const endTime = performance.now();
        const duration = endTime - startTime;

        expect(result.success).toBe(true);
        registrationTimes.push(duration);
      }

      // Each registration should complete within reasonable time
      registrationTimes.forEach(duration => {
        expect(duration).toBeLessThan(2000); // 2 seconds per registration
      });

      // Average registration time should be reasonable
      const avgTime = registrationTimes.reduce((a, b) => a + b, 0) / registrationTimes.length;
      expect(avgTime).toBeLessThan(1000); // Average under 1 second
    });

    it('should handle concurrent logins efficiently', async () => {
      // First, ensure all test users are registered
      for (const userData of testUsers) {
        await AuthService.register(userData);
      }

      const startTime = performance.now();

      // Attempt concurrent logins
      const loginPromises = testUsers.map(userData =>
        AuthService.login({
          email: userData.email,
          password: userData.password
        })
      );

      const results = await Promise.all(loginPromises);
      const endTime = performance.now();
      const duration = endTime - startTime;

      // All logins should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.user).toBeDefined();
        expect(result.tokens).toBeDefined();
      });

      // Concurrent logins should complete within reasonable time
      expect(duration).toBeLessThan(3000); // 3 seconds for 5 concurrent logins
    });

    it('should handle token operations efficiently', async () => {
      // Register a test user
      const userData = testUsers[0];
      const registerResult = await AuthService.register(userData);
      expect(registerResult.success).toBe(true);

      if (!registerResult.tokens) {
        throw new Error('No tokens received from registration');
      }

      // Test token refresh performance
      const refreshTimes: number[] = [];
      let currentTokens = registerResult.tokens;

      for (let i = 0; i < 5; i++) {
        const startTime = performance.now();

        const refreshResult = await AuthService.refreshToken(currentTokens.refreshToken);

        const endTime = performance.now();
        const duration = endTime - startTime;

        expect(refreshResult.success).toBe(true);
        expect(refreshResult.tokens).toBeDefined();

        refreshTimes.push(duration);
        currentTokens = refreshResult.tokens!;
      }

      // Each token refresh should be fast
      refreshTimes.forEach(duration => {
        expect(duration).toBeLessThan(500); // 500ms per refresh
      });

      // Average refresh time should be very fast
      const avgRefreshTime = refreshTimes.reduce((a, b) => a + b, 0) / refreshTimes.length;
      expect(avgRefreshTime).toBeLessThan(200); // Average under 200ms
    });
  });

  describe('Memory Usage Tests', () => {
    it('should not leak memory during repeated operations', async () => {
      const initialMemory = process.memoryUsage();

      // Perform many database operations
      for (let i = 0; i < 100; i++) {
        const { data } = await database
          .from('profiles')
          .select('user_id, name')
          .limit(10)
          .select_query();

        // Process the data to simulate real usage
        if (data) {
          data.forEach(profile => {
            const processed = {
              id: profile.user_id,
              displayName: profile.name?.toUpperCase()
            };
            // Use the processed data
            expect(processed.id).toBeDefined();
          });
        }
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Database Load Tests', () => {
    it('should handle high query volume', async () => {
      const queryCount = 200;
      const batchSize = 20;
      const batches = Math.ceil(queryCount / batchSize);

      const allDurations: number[] = [];

      for (let batch = 0; batch < batches; batch++) {
        const batchStartTime = performance.now();

        const batchPromises = Array.from({ length: batchSize }, () =>
          database.query('SELECT COUNT(*) as total FROM profiles')
        );

        const batchResults = await Promise.all(batchPromises);

        const batchEndTime = performance.now();
        const batchDuration = batchEndTime - batchStartTime;

        allDurations.push(batchDuration);

        // All queries in batch should succeed
        batchResults.forEach(result => {
          expect(result.error).toBeNull();
          expect(result.data).toHaveLength(1);
        });

        // Small delay between batches to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // Calculate statistics
      const totalDuration = allDurations.reduce((a, b) => a + b, 0);
      const avgBatchDuration = totalDuration / batches;
      const maxBatchDuration = Math.max(...allDurations);

      console.log(`Load test completed: ${queryCount} queries in ${batches} batches`);
      console.log(`Average batch duration: ${avgBatchDuration.toFixed(2)}ms`);
      console.log(`Max batch duration: ${maxBatchDuration.toFixed(2)}ms`);
      console.log(`Total duration: ${totalDuration.toFixed(2)}ms`);

      // Performance expectations
      expect(avgBatchDuration).toBeLessThan(1000); // Average batch under 1 second
      expect(maxBatchDuration).toBeLessThan(2000); // No batch over 2 seconds
      expect(totalDuration).toBeLessThan(30000); // Total under 30 seconds
    });
  });
});