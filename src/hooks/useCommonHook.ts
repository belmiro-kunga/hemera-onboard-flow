import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Common hook that provides shared functionality across the application
 * - Toast notifications for success and error messages
 * - Query invalidation for React Query
 * - Standardized error handling
 */
export function useCommonHook() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  /**
   * Show success message with toast
   */
  const showSuccess = (message: string, title = 'Sucesso') => {
    toast({
      title,
      description: message,
      variant: 'default',
    });
  };

  /**
   * Show error message with toast
   * Handles different error formats and provides fallback messages
   */
  const showError = (error: any, defaultMessage = 'Ocorreu um erro') => {
    console.error('Error:', error);
    
    let message = defaultMessage;
    
    // Handle different error formats
    if (typeof error === 'string') {
      message = error;
    } else if (error?.message) {
      message = error.message;
    } else if (error?.error) {
      message = error.error;
    } else if (error?.data?.message) {
      message = error.data.message;
    }

    toast({
      title: 'Erro',
      description: message,
      variant: 'destructive',
    });
  };

  /**
   * Invalidate React Query cache for specific queries
   * Supports both single query key and array of query keys
   */
  const invalidateQueries = (queryKeys: string | string[]) => {
    if (Array.isArray(queryKeys)) {
      queryKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });
    } else {
      queryClient.invalidateQueries({ queryKey: [queryKeys] });
    }
  };

  /**
   * Refetch specific queries
   */
  const refetchQueries = (queryKeys: string | string[]) => {
    if (Array.isArray(queryKeys)) {
      queryKeys.forEach(key => {
        queryClient.refetchQueries({ queryKey: [key] });
      });
    } else {
      queryClient.refetchQueries({ queryKey: [queryKeys] });
    }
  };

  /**
   * Clear all query cache
   */
  const clearCache = () => {
    queryClient.clear();
  };

  /**
   * Handle async operations with loading state and error handling
   */
  const handleAsync = async <T>(
    operation: () => Promise<T>,
    successMessage?: string,
    errorMessage?: string
  ): Promise<{ success: boolean; data?: T; error?: any }> => {
    try {
      const result = await operation();
      
      if (successMessage) {
        showSuccess(successMessage);
      }
      
      return { success: true, data: result };
    } catch (error) {
      showError(error, errorMessage);
      return { success: false, error };
    }
  };

  return {
    showSuccess,
    showError,
    invalidateQueries,
    refetchQueries,
    clearCache,
    handleAsync,
    toast, // Direct access to toast for custom usage
    queryClient, // Direct access to query client for advanced usage
  };
}
