import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { database } from "@/lib/database";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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

// Hook para buscar notificações de assignments
export const useAssignmentNotifications = (limit = 20) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["assignment-notifications", limit],
    queryFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await database
        .from("assignment_notifications")
        .select(`
          *,
          course_assignments!inner(user_id)
        `)
        .eq("course_assignments.user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit)
        .select_query();

      if (error) throw error;
      return data as any[];
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

      const { data, error } = await database
        .from("assignment_notifications")
        .select("*")
        .eq("in_app_read", false)
        .select_query();

      if (error) throw error;
      return data?.length || 0;
    },
    enabled: !!user,
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });
};

// Hook para marcar notificação como lida
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({ queryKey: ["assignment-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notification-count"] });
    },
  });
};

// Hook para marcar todas as notificações como lidas
export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const { error } = await database
        .from("assignment_notifications")
        .update({ in_app_read: true })
        .eq("in_app_read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignment-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notification-count"] });
      toast({
        title: "Notificações marcadas como lidas",
        description: "Todas as notificações foram marcadas como lidas.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível marcar as notificações como lidas.",
        variant: "destructive",
      });
    },
  });
};

// Hook para criar notificação de assignment
export const useCreateAssignmentNotification = () => {
  const queryClient = useQueryClient();

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

      const notification = Array.isArray(data) ? data[0] : data;

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignment-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notification-count"] });
    },
  });
};

// Hook para deletar notificação
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await database
        .from("assignment_notifications")
        .eq("id", notificationId)
        .delete();

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignment-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notification-count"] });
      toast({
        title: "Notificação removida",
        description: "A notificação foi removida com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Não foi possível remover a notificação.",
        variant: "destructive",
      });
    },
  });
};

// Hook para notificações em tempo real
export const useRealtimeNotifications = () => {
  const queryClient = useQueryClient();
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