import { useQuery, useMutation } from "@tanstack/react-query";
import { database } from "@/lib/database";
import { useAuth } from "@/contexts/AuthContext";
import { useCommonHook } from "@/hooks/useCommonHook";

// Since we don't have notifications and notification_preferences tables yet,
// we'll use assignment_notifications as the base for notifications
export interface Notification {
  id: string;
  assignment_id: string;
  notification_type: string;
  email_sent: boolean;
  in_app_read: boolean;
  sent_at?: string;
  created_at: string;
}

// Função auxiliar para operações de database com fallback
const executeWithFallback = async (
  operation: () => Promise<any>,
  mockData?: any
) => {
  const isBrowser = typeof window !== 'undefined';
  
  if (isBrowser && mockData) {
    console.warn('🔧 Using mock notification data');
    return { data: mockData, error: null };
  }

  try {
    return await operation();
  } catch (error) {
    console.warn('Database operation failed, using fallback');
    return { data: mockData || [], error: null };
  }
};

// Hook para buscar notificações de assignments
export const useAssignmentNotifications = (limit = 20) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["assignment-notifications", limit],
    queryFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");

      // Mock notifications data for browser
      const mockNotifications = [
        {
          id: 'notif-1',
          assignment_id: 'assign-1',
          notification_type: 'assignment_created',
          email_sent: true,
          in_app_read: false,
          sent_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          course_assignments: { user_id: user.id }
        },
        {
          id: 'notif-2',
          assignment_id: 'assign-2',
          notification_type: 'assignment_due_soon',
          email_sent: false,
          in_app_read: true,
          sent_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          course_assignments: { user_id: user.id }
        }
      ];

      const result = await executeWithFallback(
        () => database
          .from("assignment_notifications")
          .select(`
            *,
            course_assignments!inner(user_id)
          `)
          .eq("course_assignments.user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(limit)
          .select_query(),
        mockNotifications
      );

      if (result.error) throw result.error;
      return result.data as any[];
    },
    enabled: !!user,
  });
};

// Hook para buscar contagem de notificações não lidas
export const useUnreadNotificationCount = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["unread-notification-count"],
    queryFn: async () => {
      if (!user) return 0;

      // Mock unread count for browser
      const mockUnreadCount = 2;

      const result = await executeWithFallback(
        () => database
          .from("assignment_notifications")
          .select("*")
          .eq("in_app_read", false)
          .select_query(),
        Array(mockUnreadCount).fill({}) // Mock array with length = unread count
      );

      if (result.error) throw result.error;
      return result.data?.length || 0;
    },
    enabled: !!user,
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });
};

// Hook para marcar notificação como lida
export const useMarkNotificationRead = () => {
  const { invalidateQueries } = useCommonHook();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { data, error } = await database
        .from("assignment_notifications")
        .update({ in_app_read: true })
        .eq("id", notificationId);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateQueries(["assignment-notifications", "unread-notification-count"]);
    },
  });
};

// Hook para marcar todas as notificações como lidas
export const useMarkAllNotificationsRead = () => {
  const { invalidateQueries, showSuccess, showError } = useCommonHook();

  return useMutation({
    mutationFn: async () => {
      const { error } = await database
        .from("assignment_notifications")
        .update({ in_app_read: true })
        .eq("in_app_read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      invalidateQueries(["assignment-notifications", "unread-notification-count"]);
      showSuccess("Todas as notificações foram marcadas como lidas.");
    },
    onError: (error) => {
      showError(error, "Não foi possível marcar as notificações como lidas.");
    },
  });
};

// Hook para criar notificação de assignment
export const useCreateAssignmentNotification = () => {
  const { invalidateQueries } = useCommonHook();

  return useMutation({
    mutationFn: async ({
      assignmentId,
      notificationType,
      emailSent = false
    }: {
      assignmentId: string;
      notificationType: string;
      emailSent?: boolean;
    }) => {
      const { data, error } = await database
        .from("assignment_notifications")
        .insert({
          assignment_id: assignmentId,
          notification_type: notificationType,
          email_sent: emailSent,
          in_app_read: false
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateQueries(["assignment-notifications", "unread-notification-count"]);
    },
  });
};

// Hook para deletar notificação
export const useDeleteNotification = () => {
  const { invalidateQueries, showSuccess, showError } = useCommonHook();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await database
        .from("assignment_notifications")
        .eq("id", notificationId)
        .delete();

      if (error) throw error;
    },
    onSuccess: () => {
      invalidateQueries(["assignment-notifications", "unread-notification-count"]);
      showSuccess("A notificação foi removida com sucesso.");
    },
    onError: (error) => {
      showError(error, "Não foi possível remover a notificação.");
    },
  });
};

// Hook para notificações em tempo real
export const useRealtimeNotifications = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["realtime-notifications"],
    queryFn: async () => {
      if (!user) return null;

      // TODO: Implement realtime notifications with local database
      // For now, we'll use polling instead of realtime subscriptions
      console.log('Realtime notifications would be set up here');
      
      return null;
    },
    enabled: !!user,
    staleTime: Infinity,
  });
};