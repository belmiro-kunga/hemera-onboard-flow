// Tests for useAssignments hook

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAssignments, useCreateAssignment } from '../useAssignments';
import { database } from '@/lib/database';
import { useAuth } from '@/contexts/AuthContext';

// Mock dependencies
vi.mock('@/lib/database');
vi.mock('@/contexts/AuthContext');
vi.mock('@/hooks/use-toast');
vi.mock('@/hooks/useCommonHook');

const mockDatabase = vi.mocked(database);
const mockUseAuth = vi.mocked(useAuth);

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useAssignments Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock database.from to return a query builder
    const mockQueryBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      select_query: vi.fn(),
    };
    
    mockDatabase.from.mockReturnValue(mockQueryBuilder as any);
  });

  describe('useAssignments', () => {
    it('should fetch assignments successfully', async () => {
      const mockAssignments = [
        {
          id: '1',
          user_id: 'user1',
          content_type: 'course',
          content_id: 'course1',
          assigned_by: 'admin1',
          assigned_at: '2024-01-01T00:00:00Z',
          due_date: '2024-01-08T00:00:00Z',
          priority: 'medium',
          status: 'assigned',
          completed_at: null,
          notes: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ];

      // Mock the query builder chain
      const mockQueryBuilder = mockDatabase.from('course_assignments');
      mockQueryBuilder.select_query.mockResolvedValue({
        data: mockAssignments,
        error: null
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAssignments(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.assignments).toHaveLength(1);
      expect(result.current.assignments[0].id).toBe('1');
      expect(result.current.error).toBeNull();
    });

    it('should handle filters correctly', async () => {
      const filters = {
        userId: 'user1',
        status: ['assigned'],
        priority: ['high'],
        sortBy: 'due_date',
        sortOrder: 'asc' as const
      };

      const mockQueryBuilder = mockDatabase.from('course_assignments');
      mockQueryBuilder.select_query.mockResolvedValue({
        data: [],
        error: null
      });

      const wrapper = createWrapper();
      renderHook(() => useAssignments(filters), { wrapper });

      // Verify that filters were applied
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', 'user1');
      expect(mockQueryBuilder.in).toHaveBeenCalledWith('status', ['assigned']);
      expect(mockQueryBuilder.in).toHaveBeenCalledWith('priority', ['high']);
      expect(mockQueryBuilder.order).toHaveBeenCalledWith('due_date', { ascending: true });
    });

    it('should handle errors gracefully', async () => {
      const mockError = new Error('Database connection failed');
      
      const mockQueryBuilder = mockDatabase.from('course_assignments');
      mockQueryBuilder.select_query.mockRejectedValue(mockError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAssignments(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.assignments).toEqual([]);
      expect(result.current.error).toBe('Database connection failed');
    });
  });

  describe('useCreateAssignment', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: 'admin1', email: 'admin@test.com' },
        session: null,
        profile: null,
        loading: false,
        isAdmin: true,
        signOut: vi.fn(),
        signIn: vi.fn(),
        signUp: vi.fn(),
        refreshSession: vi.fn()
      } as any);
    });

    it('should create assignment successfully', async () => {
      const mockAssignmentData = {
        userId: 'user1',
        contentType: 'course' as const,
        contentId: 'course1',
        dueDate: '2024-01-08T00:00:00Z',
        priority: 'medium' as const,
        notes: 'Test assignment'
      };

      const mockCreatedAssignment = {
        id: 'assignment1',
        user_id: 'user1',
        content_type: 'course',
        content_id: 'course1',
        assigned_by: 'admin1',
        due_date: '2024-01-08T00:00:00Z',
        priority: 'medium',
        status: 'assigned',
        notes: 'Test assignment'
      };

      // Mock database operations
      const mockInsertBuilder = {
        insert: vi.fn().mockResolvedValue({
          data: [mockCreatedAssignment],
          error: null
        })
      };
      
      const mockNotificationBuilder = {
        insert: vi.fn().mockResolvedValue({
          data: [{ id: 'notification1' }],
          error: null
        })
      };

      mockDatabase.from
        .mockReturnValueOnce(mockInsertBuilder as any)
        .mockReturnValueOnce(mockNotificationBuilder as any);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateAssignment(), { wrapper });

      // Execute the mutation
      await result.current.mutateAsync(mockAssignmentData);

      // Verify database calls
      expect(mockDatabase.from).toHaveBeenCalledWith('course_assignments');
      expect(mockInsertBuilder.insert).toHaveBeenCalledWith({
        user_id: 'user1',
        content_type: 'course',
        content_id: 'course1',
        assigned_by: 'admin1',
        due_date: '2024-01-08T00:00:00Z',
        priority: 'medium',
        notes: 'Test assignment'
      });

      expect(mockDatabase.from).toHaveBeenCalledWith('assignment_notifications');
      expect(mockNotificationBuilder.insert).toHaveBeenCalledWith({
        assignment_id: 'assignment1',
        notification_type: 'assignment_created'
      });
    });

    it('should handle validation errors', async () => {
      const invalidData = {
        userId: '', // Invalid - empty string
        contentType: 'course' as const,
        contentId: 'course1',
        dueDate: 'invalid-date', // Invalid date format
        priority: 'invalid' as any, // Invalid priority
        notes: null
      };

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateAssignment(), { wrapper });

      // This should throw a validation error
      await expect(result.current.mutateAsync(invalidData)).rejects.toThrow();
    });

    it('should handle unauthenticated user', async () => {
      mockUseAuth.mockReturnValue({
        user: null,
        session: null,
        profile: null,
        loading: false,
        isAdmin: false,
        signOut: vi.fn(),
        signIn: vi.fn(),
        signUp: vi.fn(),
        refreshSession: vi.fn()
      } as any);

      const mockAssignmentData = {
        userId: 'user1',
        contentType: 'course' as const,
        contentId: 'course1',
        dueDate: '2024-01-08T00:00:00Z',
        priority: 'medium' as const,
        notes: null
      };

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateAssignment(), { wrapper });

      await expect(result.current.mutateAsync(mockAssignmentData))
        .rejects.toThrow('Usuário não autenticado');
    });

    it('should handle database errors', async () => {
      const mockAssignmentData = {
        userId: 'user1',
        contentType: 'course' as const,
        contentId: 'course1',
        dueDate: '2024-01-08T00:00:00Z',
        priority: 'medium' as const,
        notes: null
      };

      const mockError = new Error('Database insert failed');
      const mockInsertBuilder = {
        insert: vi.fn().mockResolvedValue({
          data: null,
          error: mockError
        })
      };

      mockDatabase.from.mockReturnValue(mockInsertBuilder as any);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateAssignment(), { wrapper });

      await expect(result.current.mutateAsync(mockAssignmentData))
        .rejects.toThrow('Database insert failed');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty assignment list', async () => {
      const mockQueryBuilder = mockDatabase.from('course_assignments');
      mockQueryBuilder.select_query.mockResolvedValue({
        data: [],
        error: null
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useAssignments(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.assignments).toEqual([]);
      expect(result.current.total).toBe(0);
      expect(result.current.hasMore).toBe(false);
    });

    it('should handle pagination correctly', async () => {
      const filters = {
        page: 2,
        limit: 10
      };

      const mockQueryBuilder = mockDatabase.from('course_assignments');
      mockQueryBuilder.select_query.mockResolvedValue({
        data: [],
        error: null
      });

      const wrapper = createWrapper();
      renderHook(() => useAssignments(filters), { wrapper });

      // Verify pagination was applied (would be in the range call)
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(10);
    });
  });
});