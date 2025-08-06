import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  VideoCourse, 
  CreateVideoCourseDto, 
  UpdateVideoCourseDto,
  VideoLesson 
} from "@/lib/types/entities";
import { 
  Result, 
  PaginatedResponse, 
  QueryParams,
  ID 
} from "@/lib/types/base";
import { VideoCoursesService } from "@/services/video-courses.service";
import { CourseAssignmentService } from "@/services/course-assignment.service";
import { VideoCoursesRepository } from "@/lib/repositories/video-courses.repository";
import { apiClient } from "@/lib/http/factory";
import { getCache } from "@/lib/cache";
import { toast } from "@/services/toast.service";
import { logger } from "@/lib/logging/logger";

// Hook configuration
interface UseVideoCoursesConfig {
  autoFetch?: boolean;
  pageSize?: number;
  enableCache?: boolean;
  enableOptimisticUpdates?: boolean;
}

// Hook state interface
interface UseVideoCoursesState {
  courses: VideoCourse[];
  loading: boolean;
  error: Error | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Hook actions interface
interface UseVideoCoursesActions {
  fetchCourses: (params?: QueryParams) => Promise<void>;
  createCourse: (data: CreateVideoCourseDto) => Promise<Result<VideoCourse>>;
  updateCourse: (id: ID, data: UpdateVideoCourseDto) => Promise<Result<VideoCourse>>;
  deleteCourse: (id: ID) => Promise<Result<void>>;
  toggleCourseStatus: (id: ID) => Promise<Result<VideoCourse>>;
  searchCourses: (query: string, params?: QueryParams) => Promise<void>;
  getCourseById: (id: ID) => Promise<Result<VideoCourse>>;
  getPopularCourses: (limit?: number) => Promise<Result<VideoCourse[]>>;
  bulkUpdateStatus: (courseIds: ID[], status: 'draft' | 'published' | 'archived') => Promise<Result<VideoCourse[]>>;
  enrollUsers: (courseId: ID, userIds: ID[]) => Promise<Result<void>>;
  refreshCourses: () => Promise<void>;
  resetState: () => void;
}

// Hook return type
export interface UseVideoCoursesReturn extends UseVideoCoursesState, UseVideoCoursesActions {}

// Initialize services
const cache = getCache('videoCourses');
const repository = new VideoCoursesRepository(apiClient, cache);
const videoCoursesService = new VideoCoursesService(repository);
const courseAssignmentService = new CourseAssignmentService(
  {} as any, // Repository would be injected
  videoCoursesService,
  {} as any  // UserService would be injected
);

export function useVideoCourses(config: UseVideoCoursesConfig = {}): UseVideoCoursesReturn {
  const {
    autoFetch = true,
    pageSize = 10,
    enableCache = true,
    enableOptimisticUpdates = true
  } = config;

  // State management
  const [state, setState] = useState<UseVideoCoursesState>({
    courses: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: pageSize,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false
    }
  });

  // Memoized service logger
  const serviceLogger = useMemo(() => 
    logger.setComponent('useVideoCourses'), 
    []
  );

  // Helper function to update state
  const updateState = useCallback((updates: Partial<UseVideoCoursesState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Helper function to handle service results
  const handleServiceResult = useCallback(<T>(
    result: Result<T>,
    successMessage?: string,
    errorMessage?: string
  ): T | null => {
    if (result.success) {
      if (successMessage) {
        toast.success(successMessage);
      }
      return result.data;
    } else {
      const error = new Error(result.error.message || 'Unknown error');
      updateState({ error });
      
      if (errorMessage) {
        toast.errorOperation(errorMessage, undefined, result.error as any);
      }
      
      serviceLogger.error('Service operation failed', error, {
        errorCode: (result.error as any).code,
        errorMessage: (result.error as any).message
      });
      
      return null;
    }
  }, [updateState, serviceLogger]);

  // Fetch courses with pagination
  const fetchCourses = useCallback(async (params?: QueryParams) => {
    updateState({ loading: true, error: null });
    
    try {
      serviceLogger.info('Fetching video courses', { params });
      
      const queryParams: QueryParams = {
        page: state.pagination.page,
        limit: state.pagination.limit,
        ...params
      };

      const result = await videoCoursesService.getAll(queryParams);
      const data = handleServiceResult<PaginatedResponse<VideoCourse>>(result);
      
      if (data) {
        updateState({
          courses: data.data,
          pagination: {
            page: data.meta.page,
            limit: data.meta.limit,
            total: data.meta.total,
            totalPages: data.meta.totalPages,
            hasNextPage: data.meta.hasNextPage,
            hasPreviousPage: data.meta.hasPreviousPage
          },
          loading: false
        });
        
        serviceLogger.info('Video courses fetched successfully', { 
          count: data.data.length,
          total: data.meta.total 
        });
      } else {
        updateState({ loading: false });
      }
    } catch (error) {
      const appError = new Error('Failed to fetch courses');
      updateState({ error: appError, loading: false });
      toast.error('Erro ao carregar cursos de vídeo');
      serviceLogger.error('Failed to fetch courses', error);
    }
  }, [state.pagination.page, state.pagination.limit, handleServiceResult, updateState, serviceLogger]);

  // Create course with optimistic updates
  const createCourse = useCallback(async (data: CreateVideoCourseDto): Promise<Result<VideoCourse>> => {
    serviceLogger.info('Creating video course', { title: data.title });
    
    const loadingToastId = toast.loading('Criando curso...');
    
    try {
      const result = await videoCoursesService.create(data);
      
      toast.remove(loadingToastId);
      
      if (result.success) {
        // Optimistic update
        if (enableOptimisticUpdates) {
          updateState({
            courses: [result.data, ...state.courses]
          });
        }
        
        toast.successOperation('criar', 'curso');
        
        // Refresh courses to get accurate data
        await fetchCourses();
        
        serviceLogger.info('Video course created successfully', { 
          id: result.data.id,
          title: result.data.title 
        });
      } else {
        handleServiceResult(result, undefined, 'criar curso');
      }
      
      return result;
    } catch (error) {
      toast.remove(loadingToastId);
      toast.error('Erro ao criar curso');
      serviceLogger.error('Failed to create course', error);
      throw error;
    }
  }, [state.courses, enableOptimisticUpdates, updateState, fetchCourses, handleServiceResult, serviceLogger]);

  // Update course
  const updateCourse = useCallback(async (id: ID, data: UpdateVideoCourseDto): Promise<Result<VideoCourse>> => {
    serviceLogger.info('Updating video course', { id, changes: Object.keys(data) });
    
    const loadingToastId = toast.loading('Atualizando curso...');
    
    try {
      const result = await videoCoursesService.update(id, data);
      
      toast.remove(loadingToastId);
      
      if (result.success) {
        // Optimistic update
        if (enableOptimisticUpdates) {
          updateState({
            courses: state.courses.map(course => 
              course.id === id ? result.data : course
            )
          });
        }
        
        toast.successOperation('atualizar', 'curso');
        
        // Refresh courses to get accurate data
        await fetchCourses();
        
        serviceLogger.info('Video course updated successfully', { 
          id: result.data.id,
          title: result.data.title 
        });
      } else {
        handleServiceResult(result, undefined, 'atualizar curso');
      }
      
      return result;
    } catch (error) {
      toast.remove(loadingToastId);
      toast.error('Erro ao atualizar curso');
      serviceLogger.error('Failed to update course', error);
      throw error;
    }
  }, [state.courses, enableOptimisticUpdates, updateState, fetchCourses, handleServiceResult, serviceLogger]);

  // Delete course
  const deleteCourse = useCallback(async (id: ID): Promise<Result<void>> => {
    serviceLogger.info('Deleting video course', { id });
    
    const loadingToastId = toast.loading('Excluindo curso...');
    
    try {
      const result = await videoCoursesService.delete(id);
      
      toast.remove(loadingToastId);
      
      if (result.success) {
        // Optimistic update
        if (enableOptimisticUpdates) {
          updateState({
            courses: state.courses.filter(course => course.id !== id)
          });
        }
        
        toast.successOperation('excluir', 'curso');
        
        // Refresh courses to get accurate data
        await fetchCourses();
        
        serviceLogger.info('Video course deleted successfully', { id });
      } else {
        handleServiceResult(result, undefined, 'excluir curso');
      }
      
      return result;
    } catch (error) {
      toast.remove(loadingToastId);
      toast.error('Erro ao excluir curso');
      serviceLogger.error('Failed to delete course', error);
      throw error;
    }
  }, [state.courses, enableOptimisticUpdates, updateState, fetchCourses, handleServiceResult, serviceLogger]);

  // Toggle course status
  const toggleCourseStatus = useCallback(async (id: ID): Promise<Result<VideoCourse>> => {
    serviceLogger.info('Toggling course status', { id });
    
    const loadingToastId = toast.loading('Alterando status...');
    
    try {
      const result = await videoCoursesService.toggleStatus(id);
      
      toast.remove(loadingToastId);
      
      if (result.success) {
        // Optimistic update
        if (enableOptimisticUpdates) {
          updateState({
            courses: state.courses.map(course => 
              course.id === id ? result.data : course
            )
          });
        }
        
        const statusText = result.data.status === 'published' ? 'publicado' : 'despublicado';
        toast.success(`Curso ${statusText} com sucesso`);
        
        // Refresh courses to get accurate data
        await fetchCourses();
        
        serviceLogger.info('Course status toggled successfully', { 
          id,
          newStatus: result.data.status 
        });
      } else {
        handleServiceResult(result, undefined, 'alterar status do curso');
      }
      
      return result;
    } catch (error) {
      toast.remove(loadingToastId);
      toast.error('Erro ao alterar status do curso');
      serviceLogger.error('Failed to toggle course status', error);
      throw error;
    }
  }, [state.courses, enableOptimisticUpdates, updateState, fetchCourses, handleServiceResult, serviceLogger]);

  // Search courses
  const searchCourses = useCallback(async (query: string, params?: QueryParams) => {
    updateState({ loading: true, error: null });
    
    try {
      serviceLogger.info('Searching video courses', { query });
      
      const result = await videoCoursesService.search(query, params);
      const data = handleServiceResult<PaginatedResponse<VideoCourse>>(result);
      
      if (data) {
        updateState({
          courses: data.data,
          pagination: {
            page: data.meta.page,
            limit: data.meta.limit,
            total: data.meta.total,
            totalPages: data.meta.totalPages,
            hasNextPage: data.meta.hasNextPage,
            hasPreviousPage: data.meta.hasPreviousPage
          },
          loading: false
        });
        
        serviceLogger.info('Course search completed', { 
          query,
          count: data.data.length 
        });
      } else {
        updateState({ loading: false });
      }
    } catch (error) {
      const appError = new Error('Failed to search courses');
      updateState({ error: appError, loading: false });
      toast.error('Erro ao buscar cursos');
      serviceLogger.error('Failed to search courses', error);
    }
  }, [handleServiceResult, updateState, serviceLogger]);

  // Get course by ID
  const getCourseById = useCallback(async (id: ID): Promise<Result<VideoCourse>> => {
    serviceLogger.info('Getting course by ID', { id });
    
    try {
      const result = await videoCoursesService.getById(id);
      
      if (!result.success) {
        handleServiceResult(result, undefined, 'carregar curso');
      }
      
      return result;
    } catch (error) {
      toast.error('Erro ao carregar curso');
      serviceLogger.error('Failed to get course by ID', error);
      throw error;
    }
  }, [handleServiceResult, serviceLogger]);

  // Get popular courses
  const getPopularCourses = useCallback(async (limit: number = 10): Promise<Result<VideoCourse[]>> => {
    serviceLogger.info('Getting popular courses', { limit });
    
    try {
      const result = await videoCoursesService.getPopular(limit);
      
      if (!result.success) {
        handleServiceResult(result, undefined, 'carregar cursos populares');
      }
      
      return result;
    } catch (error) {
      toast.error('Erro ao carregar cursos populares');
      serviceLogger.error('Failed to get popular courses', error);
      throw error;
    }
  }, [handleServiceResult, serviceLogger]);

  // Bulk update status
  const bulkUpdateStatus = useCallback(async (
    courseIds: ID[], 
    status: 'draft' | 'published' | 'archived'
  ): Promise<Result<VideoCourse[]>> => {
    serviceLogger.info('Bulk updating course status', { count: courseIds.length, status });
    
    const loadingToastId = toast.loading(`Atualizando ${courseIds.length} cursos...`);
    
    try {
      const result = await videoCoursesService.bulkUpdateStatus(courseIds, status);
      
      toast.remove(loadingToastId);
      
      if (result.success) {
        toast.success(`${result.data.length} cursos atualizados com sucesso`);
        
        // Refresh courses to get accurate data
        await fetchCourses();
        
        serviceLogger.info('Bulk status update completed', { 
          count: result.data.length,
          status 
        });
      } else {
        handleServiceResult(result, undefined, 'atualizar cursos em lote');
      }
      
      return result;
    } catch (error) {
      toast.remove(loadingToastId);
      toast.error('Erro ao atualizar cursos em lote');
      serviceLogger.error('Failed to bulk update status', error);
      throw error;
    }
  }, [fetchCourses, handleServiceResult, serviceLogger]);

  // Enroll users in course
  const enrollUsers = useCallback(async (courseId: ID, userIds: ID[]): Promise<Result<void>> => {
    serviceLogger.info('Enrolling users in course', { courseId, userCount: userIds.length });
    
    const loadingToastId = toast.loading(`Matriculando ${userIds.length} usuários...`);
    
    try {
      const result = await courseAssignmentService.bulkEnrollUsers({
        courseId,
        userIds,
        source: 'assignment'
      });
      
      toast.remove(loadingToastId);
      
      if (result.success) {
        toast.success(`${result.data.length} usuários matriculados com sucesso`);
        
        serviceLogger.info('Users enrolled successfully', { 
          courseId,
          enrolledCount: result.data.length 
        });
        
        return { success: true, data: undefined };
      } else {
        toast.error('Erro ao matricular usuários');
        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.remove(loadingToastId);
      toast.error('Erro ao matricular usuários');
      serviceLogger.error('Failed to enroll users', error);
      return { success: false, error: { code: 'UNKNOWN_ERROR', message: 'Failed to enroll users' } as any };
    }
  }, [serviceLogger]);

  // Refresh courses (force reload)
  const refreshCourses = useCallback(async () => {
    serviceLogger.info('Refreshing video courses');
    await fetchCourses();
  }, [fetchCourses, serviceLogger]);

  // Reset state
  const resetState = useCallback(() => {
    setState({
      courses: [],
      loading: false,
      error: null,
      pagination: {
        page: 1,
        limit: pageSize,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
      }
    });
    serviceLogger.info('State reset');
  }, [pageSize, serviceLogger]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchCourses();
    }
  }, [autoFetch, fetchCourses]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      serviceLogger.info('useVideoCourses hook cleanup');
    };
  }, [serviceLogger]);

  return {
    // State
    courses: state.courses,
    loading: state.loading,
    error: state.error,
    pagination: state.pagination,
    
    // Actions
    fetchCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    toggleCourseStatus,
    searchCourses,
    getCourseById,
    getPopularCourses,
    bulkUpdateStatus,
    enrollUsers,
    refreshCourses,
    resetState
  };
}