// Hook base comum para eliminar duplicação nos hooks personalizados

import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { handleError, handleSuccess } from '@/lib/common-patterns';

export const useCommonHook = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invalidateQueries = (queryKeys: string[]) => {
    queryKeys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: [key] });
    });
  };

  const showError = (error: any, message?: string) => {
    handleError(error, toast, message);
  };

  const showSuccess = (message: string) => {
    handleSuccess(toast, message);
  };

  return {
    queryClient,
    toast,
    invalidateQueries,
    showError,
    showSuccess,
  };
};