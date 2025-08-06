import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Simulado, 
  CreateSimuladoDto, 
  UpdateSimuladoDto,
  SimuladoType,
  DifficultyLevel,
  SimuladoQuestion 
} from "@/lib/types/entities";
import { 
  Result, 
  PaginatedResponse, 
  QueryParams,
  ID 
} from "@/lib/types/base";
import { SimuladosService } from "@/services/simulados.service";
import { SimuladosRepository } from "@/lib/repositories/simulados.repository";
import { apiClient } from "@/lib/http/factory";
import { getCache } from "@/lib/cache";
import { toast } from "@/services/toast.service";
import { logger } from "@/lib/logging/logger";

// Hook configuration
interface UseSimuladosConfig {
  autoFetch?: boolean;
  pageSize?: number;
  enableCache?: boolean;
  enableOptimisticUpdates?: boolean;
  filterByType?: SimuladoType;
  filterByDifficulty?: DifficultyLevel;
  filterByCreator?: ID;
}

// Hook state interface
interface UseSimuladosState {
  simulados: Simulado[];
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
  filters: {
    type?: SimuladoType;
    difficulty?: DifficultyLevel;
    creator?: ID;
    search?: string;
  };
}

// Hook actions interface
interface UseSimuladosActions {
  fetchSimulados: (params?: QueryParams) => Promise<void>;
  createSimulado: (data: CreateSimuladoDto) => Promise<Result<Simulado>>;
  updateSimulado: (id: ID, data: UpdateSimuladoDto) => Promise<Result<Simulado>>;
  deleteSimulado: (id: ID) => Promise<Result<void>>;
  togglePublicStatus: (id: ID) => Promise<Result<Simulado>>;
  cloneSimulado: (id: ID, newTitle?: string) => Promise<Result<Simulado>>;
  searchSimulados: (query: string, params?: QueryParams) => Promise<void>;
  getSimuladoById: (id: ID) => Promise<Result<Simulado>>;
  getSimuladoWithQuestions: (id: ID) => Promise<Result<Simulado>>;
  getSimuladosByType: (type: SimuladoType, params?: QueryParams) => Promise<void>;
  getSimuladosByDifficulty: (difficulty: DifficultyLevel, params?: QueryParams) => Promise<void>;
  getSimuladosByCreator: (creatorId: ID, params?: QueryParams) => Promise<void>;
  getPublicSimulados: (params?: QueryParams) => Promise<void>;
  getSimuladoStatistics: (id: ID) => Promise<Result<any>>;
  setFilters: (filters: Partial<UseSimuladosState['filters']>) => void;
  clearFilters: () => void;
  refreshSimulados: () => Promise<void>;
  resetState: () => void;
}

// Hook return type
export interface UseSimuladosReturn extends UseSimuladosState, UseSimuladosActions {}

// Initialize services
const cache = getCache('simulados');
const repository = new SimuladosRepository(apiClient, cache);
const simuladosService = new SimuladosService(repository);

export function useSimulados(config: UseSimuladosConfig = {}): UseSimuladosReturn {
  const {
    autoFetch = true,
    pageSize = 10,
    enableCache = true,
    enableOptimisticUpdates = true,
    filterByType,
    filterByDifficulty,
    filterByCreator
  } = config;

  // State management
  const [state, setState] = useState<UseSimuladosState>({
    simulados: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: pageSize,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false
    },
    filters: {
      type: filterByType,
      difficulty: filterByDifficulty,
      creator: filterByCreator
    }
  });

  // Memoized service logger
  const serviceLogger = useMemo(() => 
    logger.setComponent('useSimulados'), 
    []
  );

  // Helper function to update state
  const updateState = useCallback((updates: Partial<UseSimuladosState>) => {
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
      const error = new Error(result.error.message);
      updateState({ error });
      
      if (errorMessage) {
        toast.errorOperation(errorMessage, undefined, result.error);
      }
      
      serviceLogger.error('Service operation failed', error, {
        errorCode: result.error.code,
        errorMessage: result.error.message
      });
      
      return null;
    }
  }, [updateState, serviceLogger]);

  // Fetch simulados with pagination and filters
  const fetchSimulados = useCallback(async (params?: QueryParams) => {
    updateState({ loading: true, error: null });
    
    try {
      serviceLogger.info('Fetching simulados', { params, filters: state.filters });
      
      const queryParams: QueryParams = {
        page: state.pagination.page,
        limit: state.pagination.limit,
        filters: {
          ...state.filters,
          ...(params?.filters || {})
        },
        ...params
      };

      const result = await simuladosService.getAll(queryParams);
      const data = handleServiceResult<PaginatedResponse<Simulado>>(result);
      
      if (data) {
        updateState({
          simulados: data.data,
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
        
        serviceLogger.info('Simulados fetched successfully', { 
          count: data.data.length,
          total: data.meta.total 
        });
      } else {
        updateState({ loading: false });
      }
    } catch (error) {
      const appError = new Error('Failed to fetch simulados');
      updateState({ error: appError, loading: false });
      toast.error('Erro ao carregar simulados');
      serviceLogger.error('Failed to fetch simulados', error);
    }
  }, [state.pagination.page, state.pagination.limit, state.filters, handleServiceResult, updateState, serviceLogger]);

  // Create simulado with optimistic updates
  const createSimulado = useCallback(async (data: CreateSimuladoDto): Promise<Result<Simulado>> => {
    serviceLogger.info('Creating simulado', { title: data.title, type: data.type });
    
    const loadingToastId = toast.loading('Criando simulado...');
    
    try {
      const result = await simuladosService.create(data);
      
      toast.remove(loadingToastId);
      
      if (result.success) {
        // Optimistic update
        if (enableOptimisticUpdates) {
          updateState({
            simulados: [result.data, ...state.simulados]
          });
        }
        
        toast.successOperation('criar', 'simulado');
        
        // Refresh simulados to get accurate data
        await fetchSimulados();
        
        serviceLogger.info('Simulado created successfully', { 
          id: result.data.id,
          title: result.data.title,
          type: result.data.type 
        });
      } else {
        handleServiceResult(result, undefined, 'criar simulado');
      }
      
      return result;
    } catch (error) {
      toast.remove(loadingToastId);
      toast.error('Erro ao criar simulado');
      serviceLogger.error('Failed to create simulado', error);
      throw error;
    }
  }, [state.simulados, enableOptimisticUpdates, updateState, fetchSimulados, handleServiceResult, serviceLogger]);

  // Update simulado
  const updateSimulado = useCallback(async (id: ID, data: UpdateSimuladoDto): Promise<Result<Simulado>> => {
    serviceLogger.info('Updating simulado', { id, changes: Object.keys(data) });
    
    const loadingToastId = toast.loading('Atualizando simulado...');
    
    try {
      const result = await simuladosService.update(id, data);
      
      toast.remove(loadingToastId);
      
      if (result.success) {
        // Optimistic update
        if (enableOptimisticUpdates) {
          updateState({
            simulados: state.simulados.map(simulado => 
              simulado.id === id ? result.data : simulado
            )
          });
        }
        
        toast.successOperation('atualizar', 'simulado');
        
        // Refresh simulados to get accurate data
        await fetchSimulados();
        
        serviceLogger.info('Simulado updated successfully', { 
          id: result.data.id,
          title: result.data.title 
        });
      } else {
        handleServiceResult(result, undefined, 'atualizar simulado');
      }
      
      return result;
    } catch (error) {
      toast.remove(loadingToastId);
      toast.error('Erro ao atualizar simulado');
      serviceLogger.error('Failed to update simulado', error);
      throw error;
    }
  }, [state.simulados, enableOptimisticUpdates, updateState, fetchSimulados, handleServiceResult, serviceLogger]);

  // Delete simulado
  const deleteSimulado = useCallback(async (id: ID): Promise<Result<void>> => {
    serviceLogger.info('Deleting simulado', { id });
    
    const loadingToastId = toast.loading('Excluindo simulado...');
    
    try {
      const result = await simuladosService.delete(id);
      
      toast.remove(loadingToastId);
      
      if (result.success) {
        // Optimistic update
        if (enableOptimisticUpdates) {
          updateState({
            simulados: state.simulados.filter(simulado => simulado.id !== id)
          });
        }
        
        toast.successOperation('excluir', 'simulado');
        
        // Refresh simulados to get accurate data
        await fetchSimulados();
        
        serviceLogger.info('Simulado deleted successfully', { id });
      } else {
        handleServiceResult(result, undefined, 'excluir simulado');
      }
      
      return result;
    } catch (error) {
      toast.remove(loadingToastId);
      toast.error('Erro ao excluir simulado');
      serviceLogger.error('Failed to delete simulado', error);
      throw error;
    }
  }, [state.simulados, enableOptimisticUpdates, updateState, fetchSimulados, handleServiceResult, serviceLogger]);

  // Toggle public status
  const togglePublicStatus = useCallback(async (id: ID): Promise<Result<Simulado>> => {
    serviceLogger.info('Toggling simulado public status', { id });
    
    const loadingToastId = toast.loading('Alterando status público...');
    
    try {
      const result = await simuladosService.togglePublic(id);
      
      toast.remove(loadingToastId);
      
      if (result.success) {
        // Optimistic update
        if (enableOptimisticUpdates) {
          updateState({
            simulados: state.simulados.map(simulado => 
              simulado.id === id ? result.data : simulado
            )
          });
        }
        
        const statusText = result.data.isPublic ? 'público' : 'privado';
        toast.success(`Simulado agora é ${statusText}`);
        
        // Refresh simulados to get accurate data
        await fetchSimulados();
        
        serviceLogger.info('Simulado public status toggled successfully', { 
          id,
          isPublic: result.data.isPublic 
        });
      } else {
        handleServiceResult(result, undefined, 'alterar status público');
      }
      
      return result;
    } catch (error) {
      toast.remove(loadingToastId);
      toast.error('Erro ao alterar status público');
      serviceLogger.error('Failed to toggle public status', error);
      throw error;
    }
  }, [state.simulados, enableOptimisticUpdates, updateState, fetchSimulados, handleServiceResult, serviceLogger]);

  // Clone simulado
  const cloneSimulado = useCallback(async (id: ID, newTitle?: string): Promise<Result<Simulado>> => {
    serviceLogger.info('Cloning simulado', { id, newTitle });
    
    const loadingToastId = toast.loading('Clonando simulado...');
    
    try {
      const result = await simuladosService.clone(id, newTitle);
      
      toast.remove(loadingToastId);
      
      if (result.success) {
        toast.success('Simulado clonado com sucesso');
        
        // Refresh simulados to include the new clone
        await fetchSimulados();
        
        serviceLogger.info('Simulado cloned successfully', { 
          originalId: id,
          newId: result.data.id,
          newTitle: result.data.title 
        });
      } else {
        handleServiceResult(result, undefined, 'clonar simulado');
      }
      
      return result;
    } catch (error) {
      toast.remove(loadingToastId);
      toast.error('Erro ao clonar simulado');
      serviceLogger.error('Failed to clone simulado', error);
      throw error;
    }
  }, [fetchSimulados, handleServiceResult, serviceLogger]);

  // Search simulados
  const searchSimulados = useCallback(async (query: string, params?: QueryParams) => {
    updateState({ loading: true, error: null, filters: { ...state.filters, search: query } });
    
    try {
      serviceLogger.info('Searching simulados', { query });
      
      const result = await simuladosService.search(query, params);
      const data = handleServiceResult<PaginatedResponse<Simulado>>(result);
      
      if (data) {
        updateState({
          simulados: data.data,
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
        
        serviceLogger.info('Simulado search completed', { 
          query,
          count: data.data.length 
        });
      } else {
        updateState({ loading: false });
      }
    } catch (error) {
      const appError = new Error('Failed to search simulados');
      updateState({ error: appError, loading: false });
      toast.error('Erro ao buscar simulados');
      serviceLogger.error('Failed to search simulados', error);
    }
  }, [state.filters, handleServiceResult, updateState, serviceLogger]);

  // Get simulado by ID
  const getSimuladoById = useCallback(async (id: ID): Promise<Result<Simulado>> => {
    serviceLogger.info('Getting simulado by ID', { id });
    
    try {
      const result = await simuladosService.getById(id);
      
      if (!result.success) {
        handleServiceResult(result, undefined, 'carregar simulado');
      }
      
      return result;
    } catch (error) {
      toast.error('Erro ao carregar simulado');
      serviceLogger.error('Failed to get simulado by ID', error);
      throw error;
    }
  }, [handleServiceResult, serviceLogger]);

  // Get simulado with questions
  const getSimuladoWithQuestions = useCallback(async (id: ID): Promise<Result<Simulado>> => {
    serviceLogger.info('Getting simulado with questions', { id });
    
    try {
      const result = await simuladosService.getWithQuestions(id);
      
      if (!result.success) {
        handleServiceResult(result, undefined, 'carregar simulado com questões');
      }
      
      return result;
    } catch (error) {
      toast.error('Erro ao carregar simulado com questões');
      serviceLogger.error('Failed to get simulado with questions', error);
      throw error;
    }
  }, [handleServiceResult, serviceLogger]);

  // Get simulados by type
  const getSimuladosByType = useCallback(async (type: SimuladoType, params?: QueryParams) => {
    updateState({ loading: true, error: null, filters: { ...state.filters, type } });
    
    try {
      serviceLogger.info('Getting simulados by type', { type });
      
      const result = await simuladosService.getByType(type, params);
      const data = handleServiceResult<PaginatedResponse<Simulado>>(result);
      
      if (data) {
        updateState({
          simulados: data.data,
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
        
        serviceLogger.info('Simulados by type fetched successfully', { 
          type,
          count: data.data.length 
        });
      } else {
        updateState({ loading: false });
      }
    } catch (error) {
      const appError = new Error('Failed to fetch simulados by type');
      updateState({ error: appError, loading: false });
      toast.error('Erro ao carregar simulados por tipo');
      serviceLogger.error('Failed to fetch simulados by type', error);
    }
  }, [state.filters, handleServiceResult, updateState, serviceLogger]);

  // Get simulados by difficulty
  const getSimuladosByDifficulty = useCallback(async (difficulty: DifficultyLevel, params?: QueryParams) => {
    updateState({ loading: true, error: null, filters: { ...state.filters, difficulty } });
    
    try {
      serviceLogger.info('Getting simulados by difficulty', { difficulty });
      
      const result = await simuladosService.getByDifficulty(difficulty, params);
      const data = handleServiceResult<PaginatedResponse<Simulado>>(result);
      
      if (data) {
        updateState({
          simulados: data.data,
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
        
        serviceLogger.info('Simulados by difficulty fetched successfully', { 
          difficulty,
          count: data.data.length 
        });
      } else {
        updateState({ loading: false });
      }
    } catch (error) {
      const appError = new Error('Failed to fetch simulados by difficulty');
      updateState({ error: appError, loading: false });
      toast.error('Erro ao carregar simulados por dificuldade');
      serviceLogger.error('Failed to fetch simulados by difficulty', error);
    }
  }, [state.filters, handleServiceResult, updateState, serviceLogger]);

  // Get simulados by creator
  const getSimuladosByCreator = useCallback(async (creatorId: ID, params?: QueryParams) => {
    updateState({ loading: true, error: null, filters: { ...state.filters, creator: creatorId } });
    
    try {
      serviceLogger.info('Getting simulados by creator', { creatorId });
      
      const result = await simuladosService.getByCreator(creatorId, params);
      const data = handleServiceResult<PaginatedResponse<Simulado>>(result);
      
      if (data) {
        updateState({
          simulados: data.data,
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
        
        serviceLogger.info('Simulados by creator fetched successfully', { 
          creatorId,
          count: data.data.length 
        });
      } else {
        updateState({ loading: false });
      }
    } catch (error) {
      const appError = new Error('Failed to fetch simulados by creator');
      updateState({ error: appError, loading: false });
      toast.error('Erro ao carregar simulados do criador');
      serviceLogger.error('Failed to fetch simulados by creator', error);
    }
  }, [state.filters, handleServiceResult, updateState, serviceLogger]);

  // Get public simulados
  const getPublicSimulados = useCallback(async (params?: QueryParams) => {
    updateState({ loading: true, error: null });
    
    try {
      serviceLogger.info('Getting public simulados');
      
      const result = await simuladosService.getPublic(params);
      const data = handleServiceResult<PaginatedResponse<Simulado>>(result);
      
      if (data) {
        updateState({
          simulados: data.data,
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
        
        serviceLogger.info('Public simulados fetched successfully', { 
          count: data.data.length 
        });
      } else {
        updateState({ loading: false });
      }
    } catch (error) {
      const appError = new Error('Failed to fetch public simulados');
      updateState({ error: appError, loading: false });
      toast.error('Erro ao carregar simulados públicos');
      serviceLogger.error('Failed to fetch public simulados', error);
    }
  }, [handleServiceResult, updateState, serviceLogger]);

  // Get simulado statistics
  const getSimuladoStatistics = useCallback(async (id: ID): Promise<Result<any>> => {
    serviceLogger.info('Getting simulado statistics', { id });
    
    try {
      const result = await simuladosService.getStatistics(id);
      
      if (!result.success) {
        handleServiceResult(result, undefined, 'carregar estatísticas');
      }
      
      return result;
    } catch (error) {
      toast.error('Erro ao carregar estatísticas');
      serviceLogger.error('Failed to get simulado statistics', error);
      throw error;
    }
  }, [handleServiceResult, serviceLogger]);

  // Set filters
  const setFilters = useCallback((filters: Partial<UseSimuladosState['filters']>) => {
    updateState({ 
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 1 } // Reset to first page
    });
    serviceLogger.info('Filters updated', { filters });
  }, [state.filters, state.pagination, updateState, serviceLogger]);

  // Clear filters
  const clearFilters = useCallback(() => {
    updateState({ 
      filters: {},
      pagination: { ...state.pagination, page: 1 }
    });
    serviceLogger.info('Filters cleared');
  }, [state.pagination, updateState, serviceLogger]);

  // Refresh simulados (force reload)
  const refreshSimulados = useCallback(async () => {
    serviceLogger.info('Refreshing simulados');
    await fetchSimulados();
  }, [fetchSimulados, serviceLogger]);

  // Reset state
  const resetState = useCallback(() => {
    setState({
      simulados: [],
      loading: false,
      error: null,
      pagination: {
        page: 1,
        limit: pageSize,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
      },
      filters: {
        type: filterByType,
        difficulty: filterByDifficulty,
        creator: filterByCreator
      }
    });
    serviceLogger.info('State reset');
  }, [pageSize, filterByType, filterByDifficulty, filterByCreator, serviceLogger]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchSimulados();
    }
  }, [autoFetch, fetchSimulados]);

  // Re-fetch when filters change
  useEffect(() => {
    if (autoFetch && (state.filters.type || state.filters.difficulty || state.filters.creator)) {
      fetchSimulados();
    }
  }, [autoFetch, state.filters.type, state.filters.difficulty, state.filters.creator, fetchSimulados]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      serviceLogger.info('useSimulados hook cleanup');
    };
  }, [serviceLogger]);

  return {
    // State
    simulados: state.simulados,
    loading: state.loading,
    error: state.error,
    pagination: state.pagination,
    filters: state.filters,
    
    // Actions
    fetchSimulados,
    createSimulado,
    updateSimulado,
    deleteSimulado,
    togglePublicStatus,
    cloneSimulado,
    searchSimulados,
    getSimuladoById,
    getSimuladoWithQuestions,
    getSimuladosByType,
    getSimuladosByDifficulty,
    getSimuladosByCreator,
    getPublicSimulados,
    getSimuladoStatistics,
    setFilters,
    clearFilters,
    refreshSimulados,
    resetState
  };
}