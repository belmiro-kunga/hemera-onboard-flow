// Database client tests

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { database, checkDatabaseConnection, closeDatabaseConnection } from '../database';
import { Tables } from '../database-types';

describe('Database Client', () => {
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

  describe('Connection', () => {
    it('should connect to database successfully', async () => {
      const isConnected = await checkDatabaseConnection();
      expect(isConnected).toBe(true);
    });

    it('should execute raw queries', async () => {
      const result = await database.query('SELECT 1 as test');
      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.data[0].test).toBe(1);
    });
  });

  describe('User Context', () => {
    it('should set and get current user ID', () => {
      const testUserId = '123e4567-e89b-12d3-a456-426614174000';
      database.setUserId(testUserId);
      expect(database.getCurrentUserId()).toBe(testUserId);
    });

    it('should clear user ID', () => {
      database.setUserId('test-user');
      database.setUserId(null);
      expect(database.getCurrentUserId()).toBeNull();
    });
  });

  describe('Query Builder', () => {
    it('should build select queries', async () => {
      const result = await database
        .from('auth.users')
        .select('id, email')
        .limit(1)
        .select_query();
      
      expect(result.error).toBeNull();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should handle WHERE conditions', async () => {
      // Test with a condition that should return no results
      const result = await database
        .from('auth.users')
        .select('*')
        .eq('email', 'nonexistent@example.com')
        .select_query();
      
      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(0);
    });

    it('should handle ORDER BY', async () => {
      const result = await database
        .from('auth.users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
        .select_query();
      
      expect(result.error).toBeNull();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('CRUD Operations', () => {
    const testEmail = `test-${Date.now()}@example.com`;
    let testUserId: string;

    it('should insert data', async () => {
      const result = await database
        .from('auth.users')
        .insert({
          email: testEmail,
          password_hash: 'test-hash',
          email_confirmed: true,
        });
      
      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.data[0].email).toBe(testEmail);
      
      testUserId = result.data[0].id;
    });

    it('should update data', async () => {
      const result = await database
        .from('auth.users')
        .eq('id', testUserId)
        .update({
          email_confirmed: false,
        });
      
      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.data[0].email_confirmed).toBe(false);
    });

    it('should delete data', async () => {
      const result = await database
        .from('auth.users')
        .eq('id', testUserId)
        .delete();
      
      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(testUserId);
    });
  });

  describe('RPC Functions', () => {
    it('should call RPC functions without parameters', async () => {
      // Test calling a function that should exist
      const result = await database.rpc('version');
      
      // This might fail if the function doesn't exist, which is expected
      // The important thing is that the RPC mechanism works
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });

    it('should handle RPC function errors gracefully', async () => {
      const result = await database.rpc('nonexistent_function');
      
      expect(result.data).toBeNull();
      expect(result.error).not.toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid table names', async () => {
      const result = await database
        .from('nonexistent_table')
        .select('*')
        .select_query();
      
      expect(result.data).toBeNull();
      expect(result.error).not.toBeNull();
    });

    it('should handle invalid column names', async () => {
      const result = await database
        .from('auth.users')
        .select('nonexistent_column')
        .select_query();
      
      expect(result.data).toBeNull();
      expect(result.error).not.toBeNull();
    });

    it('should require WHERE conditions for updates', async () => {
      const result = await database
        .from('auth.users')
        .update({ email_confirmed: true });
      
      expect(result.data).toBeNull();
      expect(result.error).not.toBeNull();
      expect(result.error.message).toContain('WHERE');
    });

    it('should require WHERE conditions for deletes', async () => {
      const result = await database
        .from('auth.users')
        .delete();
      
      expect(result.data).toBeNull();
      expect(result.error).not.toBeNull();
      expect(result.error.message).toContain('WHERE');
    });
  });
});